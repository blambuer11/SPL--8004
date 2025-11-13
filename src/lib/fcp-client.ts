import { Connection, PublicKey, SendTransactionError, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";

// SPL-FCP Program ID
export const FCP_PROGRAM_ID = new PublicKey("A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR");

type FcpImportMeta = {
  env: {
    VITE_FCP_MIN_STAKE_LAMPORTS?: string;
    VITE_FCP_VALIDATOR_NAME?: string;
    VITE_FCP_VALIDATOR_CONTACT?: string;
  };
};

const FCP_ENV = (import.meta as unknown as FcpImportMeta).env;

const FCP_MIN_STAKE_LAMPORTS = (() => {
  const raw = (FCP_ENV.VITE_FCP_MIN_STAKE_LAMPORTS || "").trim();
  if (!raw) return 2_000_000_000n; // default 2 SOL
  try {
    const parsed = BigInt(raw);
    if (parsed < 0n) {
      console.warn("[FCPClient] VITE_FCP_MIN_STAKE_LAMPORTS cannot be negative. Using absolute value.");
      return -parsed;
    }
    return parsed;
  } catch {
    console.warn(`[FCPClient] Invalid VITE_FCP_MIN_STAKE_LAMPORTS='${raw}', defaulting to 2 SOL`);
    return 2_000_000_000n;
  }
})();

const FCP_VALIDATOR_NAME = (FCP_ENV.VITE_FCP_VALIDATOR_NAME || "Noema Protocol Validator").trim() || "Noema Protocol Validator";
const FCP_VALIDATOR_CONTACT = (FCP_ENV.VITE_FCP_VALIDATOR_CONTACT || "https://noemaprotocol.xyz").trim() || "https://noemaprotocol.xyz";

const CONSENSUS_SEED = "consensus";
const VALIDATOR_SEED = "validator";
const CONFIG_SEED = "config";
const VOTE_SEED = "vote";

export interface ConsensusRequest {
  id: string;
  agentId: string;
  action: string;
  requiredApprovals: number;
  validators: PublicKey[];
  approvals: number;
  rejections: number;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  finalizedAt: number;
  requester: PublicKey;
  address: PublicKey;
  dataHash: Uint8Array;
}

export interface FcpConfig {
  address: PublicKey;
  authority: PublicKey;
  minStakeLamports: number;
  totalValidators: number;
  totalConsensusRequests: number;
  bump: number;
}

export class FCPClient {
  private connection: Connection;
  private wallet: AnchorWallet;
  private programId: PublicKey;

  constructor(connection: Connection, wallet: AnchorWallet, programId?: PublicKey) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = programId || FCP_PROGRAM_ID;
  }

  findConsensusPda(agentId: string, actionType: string, requester: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(CONSENSUS_SEED), Buffer.from(agentId), Buffer.from(actionType), requester.toBytes()],
      this.programId
    );
  }

  findValidatorPda(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(VALIDATOR_SEED), owner.toBytes()],
      this.programId
    );
  }

  findConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(CONFIG_SEED)],
      this.programId
    );
  }

  findVotePda(requestId: string, validator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(VOTE_SEED), Buffer.from(requestId), validator.toBytes()],
      this.programId
    );
  }

  private async sha256(data: string): Promise<Uint8Array> {
    const enc = new TextEncoder().encode(data);
    const hash = await (globalThis.crypto as Crypto).subtle.digest("SHA-256", enc as unknown as BufferSource);
    return new Uint8Array(hash);
  }

  private async discriminator(name: string): Promise<Uint8Array> {
    const h = await this.sha256(`global:${name}`);
    return h.slice(0, 8);
  }

  private async ensureConfigInitialized(): Promise<string | null> {
    const current = await this.getConfigAccount();
    if (current) return null;

    console.log("[FCPClient] Config missing - initializing on-chain");
    const [configPda] = this.findConfigPda();
    const disc = await this.discriminator("initialize_config");

    const data = new Uint8Array(8 + 32 + 8);
    data.set(disc, 0);
    data.set(this.wallet.publicKey.toBytes(), 8);
    new DataView(data.buffer).setBigUint64(40, FCP_MIN_STAKE_LAMPORTS, true);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    try {
      const sig = await this.send([ix]);
      console.log("[FCPClient] Config initialized", sig);
      return sig;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("already in use") || msg.includes("AccountAlreadyInitialized")) {
        console.log("[FCPClient] Config already initialized by another signer.");
        return null;
      }
      throw err;
    }
  }

  async getConfigAccount(): Promise<FcpConfig | null> {
    const [configPda] = this.findConfigPda();
    const accountInfo = await this.connection.getAccountInfo(configPda);
    if (!accountInfo) return null;
    if (accountInfo.data.length < 65) {
      throw new Error(`[FCPClient] Unexpected config account size: ${accountInfo.data.length}`);
    }

    const dv = new DataView(accountInfo.data.buffer, accountInfo.data.byteOffset, accountInfo.data.byteLength);
    const authority = new PublicKey(accountInfo.data.slice(8, 40));
  const minStakeLamports = Number(dv.getBigUint64(40, true));
  const totalValidators = Number(dv.getBigUint64(48, true));
  const totalConsensusRequests = Number(dv.getBigUint64(56, true));
    const bump = accountInfo.data[64];

    return {
      address: configPda,
      authority,
      minStakeLamports,
      totalValidators,
      totalConsensusRequests,
      bump,
    };
  }

  private async ensureValidatorRegistered(): Promise<string | null> {
    const [validatorPda] = this.findValidatorPda(this.wallet.publicKey);
    const existing = await this.connection.getAccountInfo(validatorPda);
    if (existing) return null;

    await this.ensureConfigInitialized();
    const config = await this.getConfigAccount();
    if (!config) throw new Error("FCP config not initialized. Unable to register validator.");

    const disc = await this.discriminator("register_validator");
    const nameBytes = new TextEncoder().encode(FCP_VALIDATOR_NAME);
    const metadataBytes = new TextEncoder().encode(FCP_VALIDATOR_CONTACT);

    const data = new Uint8Array(8 + 4 + nameBytes.length + 4 + metadataBytes.length);
    let offset = 0;
    data.set(disc, offset); offset += 8;
    new DataView(data.buffer).setUint32(offset, nameBytes.length, true); offset += 4;
    data.set(nameBytes, offset); offset += nameBytes.length;
    new DataView(data.buffer).setUint32(offset, metadataBytes.length, true); offset += 4;
    data.set(metadataBytes, offset);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: validatorPda, isSigner: false, isWritable: true },
        { pubkey: config.address, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    try {
      const sig = await this.send([ix]);
      console.log("[FCPClient] Validator registered", sig);
      return sig;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already in use") || msg.includes("AccountAlreadyInitialized")) {
        console.log("[FCPClient] Validator already exists. Continuing.");
        return null;
      }
      throw err;
    }
  }

  private parseConsensusAccount(address: PublicKey, data: Uint8Array): ConsensusRequest {
    let offset = 8; // skip discriminator
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);

    const agentIdLen = dv.getUint32(offset, true); offset += 4;
    const agentId = new TextDecoder().decode(data.slice(offset, offset + agentIdLen)); offset += agentIdLen;

    const requester = new PublicKey(data.slice(offset, offset + 32)); offset += 32;

    const actionTypeLen = dv.getUint32(offset, true); offset += 4;
    const action = new TextDecoder().decode(data.slice(offset, offset + actionTypeLen)); offset += actionTypeLen;

    const dataHash = data.slice(offset, offset + 32); offset += 32;

    const threshold = data[offset]; offset += 1;

    const validatorsCount = dv.getUint32(offset, true); offset += 4;
    const validators: PublicKey[] = [];
    for (let i = 0; i < validatorsCount; i++) {
      validators.push(new PublicKey(data.slice(offset, offset + 32)));
      offset += 32;
    }

    const approvals = data[offset]; offset += 1;
    const rejections = data[offset]; offset += 1;

    const statusByte = data[offset]; offset += 1;
    const status: "pending" | "approved" | "rejected" = statusByte === 0 ? "pending" : statusByte === 1 ? "approved" : "rejected";

    const createdAt = Number(dv.getBigInt64(offset, true)); offset += 8;
    const finalizedAt = Number(dv.getBigInt64(offset, true)); offset += 8;

    // bump (1 byte) exists but unused

    return {
      id: address.toBase58(),
      agentId,
      action,
      requiredApprovals: threshold,
      validators,
      approvals,
      rejections,
      status,
      createdAt,
      finalizedAt,
      requester,
      address,
      dataHash,
    };
  }

  async listConsensusRequests(options: { status?: "pending" | "approved" | "rejected"; wallet?: PublicKey } = {}): Promise<ConsensusRequest[]> {
    const accounts = await this.connection.getProgramAccounts(this.programId, {
      filters: [{ dataSize: 521 }],
    });

    const items: ConsensusRequest[] = [];
    for (const { pubkey, account } of accounts) {
      try {
        items.push(this.parseConsensusAccount(pubkey, account.data));
      } catch (err) {
        console.warn("[FCPClient] Failed to parse consensus account", pubkey.toBase58(), err);
      }
    }

    const filtered = items.filter((item) => {
      if (options.status && item.status !== options.status) return false;
      if (!options.wallet) return true;
      return item.requester.equals(options.wallet) || item.validators.some((v) => v.equals(options.wallet));
    });

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }

  async createConsensusRequest(
    consensusId: string,
    agentId: string,
    action: string,
    requiredApprovals: number,
    validators: PublicKey[]
  ): Promise<string> {
  await this.ensureConfigInitialized();
  const actionType = action;
  const requester = this.wallet.publicKey;
    
  const [consensusPda] = this.findConsensusPda(agentId, actionType, requester);
  const [configPda] = this.findConfigPda();
  const disc = await this.discriminator("request_consensus");

  // Parameters: agent_id: String, action_type: String, data_hash: [u8; 32], threshold: u8, validator_keys: Vec<Pubkey>
  const agentIdBytes = new TextEncoder().encode(agentId);
  const actionTypeBytes = new TextEncoder().encode(actionType);
  const hashSource = consensusId || `${agentId}:${actionType}`;
  const dataHash = await this.sha256(hashSource);
    const threshold = requiredApprovals;

    // Borsh: disc(8) + agent_id(4+len) + action_type(4+len) + data_hash(32) + threshold(1) + validator_keys_len(4) + validators(32*count)
    const dataLen = 8 + 4 + agentIdBytes.length + 4 + actionTypeBytes.length + 32 + 1 + 4 + (validators.length * 32);
    const data = new Uint8Array(dataLen);
    let offset = 0;

    data.set(disc, offset);
    offset += 8;

    // agent_id
    new DataView(data.buffer).setUint32(offset, agentIdBytes.length, true);
    offset += 4;
    data.set(agentIdBytes, offset);
    offset += agentIdBytes.length;

    // action_type
    new DataView(data.buffer).setUint32(offset, actionTypeBytes.length, true);
    offset += 4;
    data.set(actionTypeBytes, offset);
    offset += actionTypeBytes.length;

    // data_hash [u8; 32]
    data.set(dataHash, offset);
    offset += 32;

    // threshold u8
    data[offset] = threshold;
    offset += 1;

    // validator_keys Vec<Pubkey> - length prefix + data
    new DataView(data.buffer).setUint32(offset, validators.length, true);
    offset += 4;
    validators.forEach(validator => {
      data.set(validator.toBytes(), offset);
      offset += 32;
    });

    // Accounts: consensus, config, requester, system_program
    const keys = [
      { pubkey: consensusPda, isSigner: false, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys,
      data: Buffer.from(data),
    });

    return this.send([ix]);
  }

  async approveConsensus(consensusId: string): Promise<string> {
    // Note: consensusId should actually be in format "agentId:actionType" to derive PDA
    // For simplicity, we'll use a placeholder
    const requestId = consensusId;
    const validatorPubkey = this.wallet.publicKey;
    
    // We need the actual consensus PDA - this requires knowing agentId and actionType
    // For now, we'll throw an error requiring proper parameters
    throw new Error("approveConsensus requires agentId and actionType to derive consensus PDA. Use approveConsensusWithDetails instead.");
  }

  async approveConsensusWithDetails(agentId: string, actionType: string, requestId: string, consensusPda: PublicKey): Promise<string> {
    const validatorPubkey = this.wallet.publicKey;
    await this.ensureValidatorRegistered();
    const [validatorPda] = this.findValidatorPda(validatorPubkey);
    const [votePda] = this.findVotePda(requestId, validatorPubkey);
    const disc = await this.discriminator("cast_vote");

    // Parameters: request_id: String, approve: bool, evidence_uri: String
    const requestIdBytes = new TextEncoder().encode(requestId);
    const approve = true;
    const evidenceUriBytes = new TextEncoder().encode("approval_evidence");

    // Borsh: disc(8) + request_id(4+len) + approve(1) + evidence_uri(4+len)
    const dataLen = 8 + 4 + requestIdBytes.length + 1 + 4 + evidenceUriBytes.length;
    const data = new Uint8Array(dataLen);
    let offset = 0;

    data.set(disc, offset);
    offset += 8;

    // request_id
    new DataView(data.buffer).setUint32(offset, requestIdBytes.length, true);
    offset += 4;
    data.set(requestIdBytes, offset);
    offset += requestIdBytes.length;

    // approve (bool as u8)
    data[offset] = approve ? 1 : 0;
    offset += 1;

    // evidence_uri
    new DataView(data.buffer).setUint32(offset, evidenceUriBytes.length, true);
    offset += 4;
    data.set(evidenceUriBytes, offset);

    // Accounts: vote, consensus, validator, owner, system_program
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: votePda, isSigner: false, isWritable: true },
        { pubkey: consensusPda, isSigner: false, isWritable: true },
        { pubkey: validatorPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return this.send([ix]);
  }

  async rejectConsensus(consensusId: string): Promise<string> {
    throw new Error("rejectConsensus requires agentId and actionType to derive consensus PDA. Use rejectConsensusWithDetails instead.");
  }

  async rejectConsensusWithDetails(agentId: string, actionType: string, requestId: string, consensusPda: PublicKey): Promise<string> {
    const validatorPubkey = this.wallet.publicKey;
    await this.ensureValidatorRegistered();
    const [validatorPda] = this.findValidatorPda(validatorPubkey);
    const [votePda] = this.findVotePda(requestId, validatorPubkey);
    const disc = await this.discriminator("cast_vote");

    // Parameters: request_id: String, approve: bool, evidence_uri: String
    const requestIdBytes = new TextEncoder().encode(requestId);
    const approve = false;
    const evidenceUriBytes = new TextEncoder().encode("rejection_evidence");

    // Borsh: disc(8) + request_id(4+len) + approve(1) + evidence_uri(4+len)
    const dataLen = 8 + 4 + requestIdBytes.length + 1 + 4 + evidenceUriBytes.length;
    const data = new Uint8Array(dataLen);
    let offset = 0;

    data.set(disc, offset);
    offset += 8;

    // request_id
    new DataView(data.buffer).setUint32(offset, requestIdBytes.length, true);
    offset += 4;
    data.set(requestIdBytes, offset);
    offset += requestIdBytes.length;

    // approve (bool as u8)
    data[offset] = approve ? 1 : 0;
    offset += 1;

    // evidence_uri
    new DataView(data.buffer).setUint32(offset, evidenceUriBytes.length, true);
    offset += 4;
    data.set(evidenceUriBytes, offset);

    // Accounts: vote, consensus, validator, owner, system_program
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: votePda, isSigner: false, isWritable: true },
        { pubkey: consensusPda, isSigner: false, isWritable: true },
        { pubkey: validatorPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return this.send([ix]);
  }

  async getConsensusStatus(consensusId: string): Promise<ConsensusRequest | null> {
    throw new Error("getConsensusStatus requires agentId, actionType, and requesterPubkey to derive consensus PDA");
  }

  async getConsensusStatusWithDetails(agentId: string, actionType: string, requester: PublicKey): Promise<ConsensusRequest | null> {
    try {
      const [consensusPda] = this.findConsensusPda(agentId, actionType, requester);
      const accountInfo = await this.connection.getAccountInfo(consensusPda);
      
      if (!accountInfo || accountInfo.data.length === 0) return null;

      return this.parseConsensusAccount(consensusPda, accountInfo.data);
    } catch (error) {
      console.error("Error fetching consensus status:", error);
      return null;
    }
  }

  private async send(ixs: TransactionInstruction[]): Promise<string> {
    try {
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      const tx = new Transaction({ feePayer: this.wallet.publicKey, blockhash, lastValidBlockHeight });
      tx.add(...ixs);
      const signed = await this.wallet.signTransaction(tx);
      const signature = await this.connection.sendRawTransaction(signed.serialize(), { maxRetries: 3 });
      const confirmation = await this.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
      return signature;
    } catch (error) {
      if (error instanceof SendTransactionError) {
        try {
          const logs = await error.getLogs(this.connection);
          const details = (logs || []).join('\n');
          throw new Error(`${error.message}\nLogs:\n${details}`);
        } catch (_) {
          throw error;
        }
      }
      throw error as Error;
    }
  }
}
