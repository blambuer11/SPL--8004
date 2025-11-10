import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";

// SPL-FCP Program ID
export const FCP_PROGRAM_ID = new PublicKey("A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR");

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
  approvals: number[];
  status: "pending" | "approved" | "rejected";
  createdAt: number;
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

  async createConsensusRequest(
    consensusId: string,
    agentId: string,
    action: string,
    requiredApprovals: number,
    validators: PublicKey[]
  ): Promise<string> {
    const actionType = action;
    const requester = this.wallet.publicKey;
    
    const [consensusPda] = this.findConsensusPda(agentId, actionType, requester);
    const [configPda] = this.findConfigPda();
    const disc = await this.discriminator("request_consensus");

    // Parameters: agent_id: String, action_type: String, data_hash: [u8; 32], threshold: u8, validator_keys: Vec<Pubkey>
    const agentIdBytes = new TextEncoder().encode(agentId);
    const actionTypeBytes = new TextEncoder().encode(actionType);
    const dataHash = new Uint8Array(32).fill(0); // Dummy hash for now
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

      const data = accountInfo.data;
      let offset = 8; // Skip discriminator

      // Read agent_id
      const agentIdLen = new DataView(data.buffer, data.byteOffset).getUint32(offset, true);
      offset += 4;
      const id = new TextDecoder().decode(data.slice(offset, offset + agentIdLen));
      offset += agentIdLen;

      // Read requester (32 bytes pubkey)
      const requesterValue = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;

      // Read action_type
      const actionTypeLen = new DataView(data.buffer, data.byteOffset).getUint32(offset, true);
      offset += 4;
      const action = new TextDecoder().decode(data.slice(offset, offset + actionTypeLen));
      offset += actionTypeLen;

      // Read data_hash [u8; 32]
      offset += 32;

      // Read threshold u8
      const requiredApprovals = data[offset];
      offset += 1;

      // Read validator_keys Vec<Pubkey> - length prefix + data
      const validatorsCount = new DataView(data.buffer, data.byteOffset).getUint32(offset, true);
      offset += 4;

      const validators: PublicKey[] = [];
      for (let i = 0; i < validatorsCount; i++) {
        validators.push(new PublicKey(data.slice(offset, offset + 32)));
        offset += 32;
      }

      // Read approvals u8
      const approvals = [data[offset]];
      offset += 1;

      // Read rejections u8
      offset += 1;

      // Read status enum (1 byte: 0=Pending, 1=Approved, 2=Rejected)
      const statusByte = data[offset];
      offset += 1;
      const status = statusByte === 0 ? "pending" : statusByte === 1 ? "approved" : "rejected";

      // Read requested_at i64
      const createdAt = Number(new DataView(data.buffer, data.byteOffset).getBigInt64(offset, true));

      return { id, agentId: id, action, requiredApprovals, validators, approvals, status, createdAt };
    } catch (error) {
      console.error("Error fetching consensus status:", error);
      return null;
    }
  }

  private async send(ixs: TransactionInstruction[]): Promise<string> {
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    const tx = new Transaction({ feePayer: this.wallet.publicKey, blockhash, lastValidBlockHeight });
    tx.add(...ixs);
    const signed = await this.wallet.signTransaction(tx);
    const sig = await this.connection.sendRawTransaction(signed.serialize(), { maxRetries: 3 });
    await this.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
    return sig;
  }
}
