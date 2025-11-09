import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction, SendTransactionError } from "@solana/web3.js";
import bs58 from "bs58";
import { Buffer } from "buffer";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PROGRAM_CONSTANTS } from "./program-constants";

// Program ID (configurable via env; defaults to known Devnet ID)
const PROGRAM_ID_FROM_ENV = import.meta.env?.VITE_PROGRAM_ID as string | undefined;
export const SPL8004_PROGRAM_ID = new PublicKey(
  (PROGRAM_ID_FROM_ENV && PROGRAM_ID_FROM_ENV.trim().length > 0)
    ? PROGRAM_ID_FROM_ENV.trim()
    : "ErnVq9bZK58iJAFHLt1zoaHz8zycMeJ85pLMhuzfQzPV"
);

// PDA Seeds
const CONFIG_SEED = "config";
const IDENTITY_SEED = "identity";
const REPUTATION_SEED = "reputation";
const VALIDATION_SEED = "validation";
const REWARD_POOL_SEED = "reward_pool";
const VALIDATOR_SEED = "validator";

export class SPL8004Client {
  private connection: Connection;
  private wallet: AnchorWallet;
  private provider: AnchorProvider;
  private programId: PublicKey;

    // Public getters for connection and programId
    public getConnection(): Connection {
      return this.connection;
    }

    public getProgramId(): PublicKey {
      return this.programId;
    }

  constructor(connection: Connection, wallet: AnchorWallet, programId?: PublicKey) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = programId || SPL8004_PROGRAM_ID;
    
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
  }

  // PDA Finders
  findConfigPda(): [PublicKey, number] {
    const seed = new TextEncoder().encode(CONFIG_SEED);
    return PublicKey.findProgramAddressSync([seed], this.programId);
  }

  findIdentityPda(agentId: string): [PublicKey, number] {
    const enc = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [enc.encode(IDENTITY_SEED), enc.encode(agentId)],
      this.programId
    );
  }

  findReputationPda(agentId: string): [PublicKey, number] {
    const enc = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [enc.encode(REPUTATION_SEED), enc.encode(agentId)],
      this.programId
    );
  }

  // Fallback PDA: reputation derived from identity pubkey (for older on-chain versions)
  findReputationPdaByIdentity(identity: PublicKey): [PublicKey, number] {
    const enc = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [enc.encode(REPUTATION_SEED), identity.toBytes()],
      this.programId
    );
  }

  findRewardPoolPda(agentId: string): [PublicKey, number] {
    const enc = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [enc.encode(REWARD_POOL_SEED), enc.encode(agentId)],
      this.programId
    );
  }

  findValidatorPda(validator: PublicKey): [PublicKey, number] {
    const enc = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [enc.encode(VALIDATOR_SEED), validator.toBytes()],
      this.programId
    );
  }

  // Fallback PDA: reward_pool derived from identity pubkey (for older on-chain versions)
  findRewardPoolPdaByIdentity(identity: PublicKey): [PublicKey, number] {
    const enc = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [enc.encode(REWARD_POOL_SEED), identity.toBytes()],
      this.programId
    );
  }

  findValidationPda(agentId: string, taskHash: Uint8Array): [PublicKey, number] {
    const enc = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [enc.encode(VALIDATION_SEED), enc.encode(agentId), taskHash],
      this.programId
    );
  }

  // Account getters with proper error handling
  async getConfigAccount() {
    const [configPda] = this.findConfigPda();
    const info = await this.connection.getAccountInfo(configPda);
    if (!info) return null;
    // Parse treasury at offset 8 (disc) + 32 (authority) = 40..72
    const treasury = new PublicKey(info.data.slice(8 + 32, 8 + 32 + 32));
    const commissionRate = info.data.readUInt16LE(8 + 32 + 32);
    return { address: configPda, treasury, commissionRate };
  }

  private async sha256(data: Uint8Array | string): Promise<Uint8Array> {
    const enc = typeof data === "string" ? new TextEncoder().encode(data) : data;
    const hash = await (globalThis.crypto as Crypto).subtle.digest("SHA-256", enc as unknown as BufferSource);
    return new Uint8Array(hash);
  }

  private async discriminator(name: string): Promise<Uint8Array> {
    // Anchor global instruction discriminator = sha256("global:<name>") first 8 bytes
    const h = await this.sha256(`global:${name}`);
    return h.slice(0, 8);
  }

  private async accountDiscriminator(name: string): Promise<Uint8Array> {
    // Anchor account discriminator = sha256("account:<name>") first 8 bytes
    const h = await this.sha256(`account:${name}`);
    return h.slice(0, 8);
  }

  // Network-wide metrics
  async getValidationCount(): Promise<number> {
    try {
      const disc = await this.accountDiscriminator("ValidationRegistry");
      const accounts = await this.connection.getProgramAccounts(this.programId, {
        filters: [{ memcmp: { offset: 0, bytes: bs58.encode(disc) } }],
      });
      return accounts.length;
    } catch (e) {
      console.warn("getValidationCount failed", e);
      return 0;
    }
  }

  async getRewardPoolsTotalLamports(): Promise<number> {
    try {
      const disc = await this.accountDiscriminator("RewardPool");
      const accounts = await this.connection.getProgramAccounts(this.programId, {
        filters: [{ memcmp: { offset: 0, bytes: bs58.encode(disc) } }],
      });
      return accounts.reduce((sum, a) => sum + (a.account.lamports ?? 0), 0);
    } catch (e) {
      console.warn("getRewardPoolsTotalLamports failed", e);
      return 0;
    }
  }

  private encodeString(str: string): Uint8Array {
    const bytes = new TextEncoder().encode(str);
    const len = new Uint8Array(4);
    new DataView(len.buffer).setUint32(0, bytes.length, true);
    return new Uint8Array([...len, ...bytes]);
  }

  private u16le(n: number): Uint8Array {
    const buf = new Uint8Array(2);
    new DataView(buf.buffer).setUint16(0, n, true);
    return buf;
  }

  private boolU8(b: boolean): Uint8Array {
    return new Uint8Array([b ? 1 : 0]);
  }

  private normalizeAgentId(agentId: string): string {
    return (agentId ?? "").trim();
  }

  private async send(ixs: TransactionInstruction[]): Promise<string> {
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    const tx = new Transaction({ feePayer: this.wallet.publicKey, blockhash, lastValidBlockHeight });
    tx.add(...ixs);

    const signed = await this.wallet.signTransaction(tx);
    const raw = signed.serialize();
    // Precompute signature for recovery in case RPC reports "already processed"
    const firstSig = signed.signatures?.[0]?.signature;
    const sigStr = firstSig ? bs58.encode(firstSig) : undefined;

    try {
      const sig = await this.connection.sendRawTransaction(raw, {
        maxRetries: 3,
        preflightCommitment: "confirmed",
      });
      await this.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
      return sig;
    } catch (inner: unknown) {
      if (inner instanceof SendTransactionError) {
        const msg = (inner.message || "").toLowerCase();
        // If RPC says it's already processed, confirm using the precomputed signature
        if (sigStr && (msg.includes("already been processed") || msg.includes("already processed"))) {
          await this.connection.confirmTransaction({ signature: sigStr, blockhash, lastValidBlockHeight }, "confirmed");
          return sigStr;
        }
        try {
          const logs = await inner.getLogs(this.connection);
          console.error("Transaction failed:", inner.message, logs);
          throw new Error(`Transaction failed: ${inner.message}\nLogs:\n${(logs || []).join("\n")}`);
        } catch {
          throw inner;
        }
      }
      throw inner;
    }
  }

  private async ensureConfig(treasury?: PublicKey, commissionRate?: number): Promise<{ address: PublicKey }>{
    const existing = await this.getConfigAccount();
    if (existing) return { address: existing.address };
    const rate = commissionRate ?? PROGRAM_CONSTANTS.DEFAULT_COMMISSION_RATE;
    const tre = treasury ?? this.wallet.publicKey;

    const [configPda] = this.findConfigPda();
    const disc = await this.discriminator("initialize_config");
    const data = new Uint8Array([
      ...disc,
      ...this.u16le(rate),
      ...tre.toBytes(),
    ]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    await this.send([ix]);
    return { address: configPda };
  }
  async getIdentity(agentId: string) {
    try {
      const clean = this.normalizeAgentId(agentId);
      const [identityPda] = this.findIdentityPda(clean);
      const accountInfo = await this.connection.getAccountInfo(identityPda);
      
      if (!accountInfo) return null;
      
      // Parse account data (simplified - real implementation would use IDL)
      return {
        address: identityPda,
        owner: new PublicKey(accountInfo.data.slice(8, 40)),
  agentId: clean,
        isActive: accountInfo.data[accountInfo.data.length - 2] === 1,
      };
    } catch (error) {
      console.error("Error fetching identity:", error);
      return null;
    }
  }

  async getReputation(agentId: string) {
    try {
      const clean = this.normalizeAgentId(agentId);
      const [identityPda] = this.findIdentityPda(clean);
      const [reputationPda] = this.findReputationPda(clean);
      const accountInfo = await this.connection.getAccountInfo(reputationPda);
      
      if (!accountInfo) return null;

      // Parse reputation data (simplified)
      const dataView = new DataView(accountInfo.data.buffer);
      return {
        address: reputationPda,
        score: Number(dataView.getBigUint64(40, true)),
        totalTasks: Number(dataView.getBigUint64(48, true)),
        successfulTasks: Number(dataView.getBigUint64(56, true)),
        failedTasks: Number(dataView.getBigUint64(64, true)),
      };
    } catch (error) {
      console.error("Error fetching reputation:", error);
      return null;
    }
  }

  async getAllAgents() {
    try {
      // Get all accounts owned by program (no filter to avoid Buffer base64 issues without IDL)
      const accounts = await this.connection.getProgramAccounts(this.programId);

      return accounts.map((account) => ({
        address: account.pubkey,
        // Parse account data
      }));
    } catch (error) {
      console.error("Error fetching all agents:", error);
      return [];
    }
  }

  async getAllUserAgents() {
    try {
      // Fetch all identity accounts where owner = current wallet
      const accounts = await this.connection.getProgramAccounts(this.programId, {
        filters: [
          {
            memcmp: {
              offset: 8, // Skip 8-byte discriminator
              bytes: this.wallet.publicKey.toBase58(),
            },
          },
        ],
      });

      const agents = [];
      for (const { pubkey, account } of accounts) {
        try {
          // Parse IdentityRegistry structure
          const data = account.data;
          if (data.length < 8 + 32 + 4) continue; // basic checks
          const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

          // Layout: [disc(8)][owner(32)][agent_id_len(4)][agent_id][metadata_uri_len(4)][metadata_uri][created(8)][updated(8)][is_active(1)][bump(1)]
          let offset = 8 + 32; // skip disc + owner
          const agentIdLen = view.getUint32(offset, true);
          offset += 4;
          if (offset + agentIdLen > data.length) continue;
          const agentId = new TextDecoder().decode(data.slice(offset, offset + agentIdLen));
          offset += agentIdLen;

          if (offset + 4 > data.length) continue;
          const metadataUriLen = view.getUint32(offset, true);
          offset += 4;
          if (offset + metadataUriLen > data.length) continue;
          const metadataUri = new TextDecoder().decode(data.slice(offset, offset + metadataUriLen));
          offset += metadataUriLen;

          if (offset + 8 + 8 + 1 > data.length) continue;
          const createdAt = Number(view.getBigInt64(offset, true));
          offset += 8;
          const updatedAt = Number(view.getBigInt64(offset, true));
          offset += 8;
          const isActive = data[offset] === 1;

          // Fetch reputation for this agent
          const reputation = await this.getReputation(agentId);

          agents.push({
            address: pubkey.toBase58(),
            agentId,
            owner: this.wallet.publicKey.toString(),
            metadataUri,
            createdAt: Number(createdAt),
            updatedAt: Number(updatedAt),
            isActive,
            reputation: reputation
              ? {
                  score: reputation.score,
                  totalTasks: reputation.totalTasks,
                  successfulTasks: reputation.successfulTasks,
                  failedTasks: reputation.failedTasks,
                }
              : {
                  score: 5000,
                  totalTasks: 0,
                  successfulTasks: 0,
                  failedTasks: 0,
                },
          });
        } catch (parseErr) {
          console.warn("Failed to parse agent account:", pubkey.toBase58(), parseErr);
        }
      }

      return agents;
    } catch (error) {
      console.error("Error fetching user agents:", error);
      return [];
    }
  }

  async getAllNetworkAgents() {
    try {
      // Filter by IdentityRegistry account discriminator at offset 0
      const disc = await this.accountDiscriminator("IdentityRegistry");
      let accounts = await this.connection.getProgramAccounts(this.programId, {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(disc),
            },
          },
        ],
      });

      // Fallback: if none returned (RPC quirk or program changes), scan all and match discriminator manually
      if (!accounts || accounts.length === 0) {
        const all = await this.connection.getProgramAccounts(this.programId);
        accounts = all.filter((a) => a.account.data?.length >= 8 && bs58.encode(a.account.data.slice(0, 8)) === bs58.encode(disc));
      }

      const agents: Array<{
        agentId: string;
        owner: string;
        metadataUri: string;
        isActive: boolean;
        createdAt?: number;
        updatedAt?: number;
        score?: number;
        totalTasks?: number;
        successfulTasks?: number;
        failedTasks?: number;
      }> = [];

      for (const { pubkey, account } of accounts) {
        try {
          const data = account.data;
          if (!data || data.length < 8 + 32) continue;
          const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
          let offset = 8; // discriminator
          const owner = new PublicKey(data.slice(offset, offset + 32));
          offset += 32;

          if (offset + 4 > data.length) continue;
          const agentIdLen = view.getUint32(offset, true);
          offset += 4;
          if (offset + agentIdLen > data.length) continue;
          const agentId = new TextDecoder().decode(data.slice(offset, offset + agentIdLen));
          offset += agentIdLen;

          if (offset + 4 > data.length) continue;
          const metadataUriLen = view.getUint32(offset, true);
          offset += 4;
          if (offset + metadataUriLen > data.length) continue;
          const metadataUri = new TextDecoder().decode(data.slice(offset, offset + metadataUriLen));
          offset += metadataUriLen;

          // Read created_at and updated_at
          if (offset + 8 + 8 + 1 > data.length) continue;
          const createdAt = Number(view.getBigInt64(offset, true));
          offset += 8;
          const updatedAt = Number(view.getBigInt64(offset, true));
          offset += 8;
          const isActive = data[offset] === 1;

          const rep = await this.getReputation(agentId);
          agents.push({
            agentId,
            owner: owner.toBase58(),
            metadataUri,
            isActive,
            createdAt,
            updatedAt,
            score: rep?.score ?? 5000,
            totalTasks: rep?.totalTasks ?? 0,
            successfulTasks: rep?.successfulTasks ?? 0,
            failedTasks: rep?.failedTasks ?? 0,
          });
        } catch (e) {
          console.warn("Failed to parse identity account:", pubkey.toBase58(), e);
        }
      }

      return agents;
    } catch (error) {
      console.error("Error fetching network agents:", error);
      return [];
    }
  }

  // Helper to create mock data for development (deprecated in favor of getAllUserAgents)
  getMockAgentData() {
    return [
      {
        agentId: "agent-001",
        owner: this.wallet.publicKey.toString(),
        metadataUri: "https://arweave.net/agent-001",
        reputation: {
          score: 8500,
          totalTasks: 120,
          successfulTasks: 110,
          failedTasks: 10,
        },
        isActive: true,
      },
      {
        agentId: "agent-002",
        owner: this.wallet.publicKey.toString(),
        metadataUri: "https://arweave.net/agent-002",
        reputation: {
          score: 7200,
          totalTasks: 85,
          successfulTasks: 75,
          failedTasks: 10,
        },
        isActive: true,
      },
    ];
  }

  // On-chain actions
  async registerAgent(agentId: string, metadataUri: string): Promise<string> {
    await this.ensureConfig();
    const cleanId = this.normalizeAgentId(agentId);
    const cleanUri = (metadataUri ?? "").trim();
    const [identityPda] = this.findIdentityPda(cleanId);
    const [reputationPda] = this.findReputationPda(cleanId);
    const [rewardPoolPda] = this.findRewardPoolPda(cleanId);
    const [configPda] = this.findConfigPda();

    // Helpful debug log in case of PDA/account mismatch
    console.debug("RegisterAgent PDAs", {
      identityPda: identityPda.toBase58(),
      reputationPda: reputationPda.toBase58(),
      rewardPoolPda: rewardPoolPda.toBase58(),
      configPda: configPda.toBase58(),
      programId: this.programId.toBase58(),
    });

    // Preflight: if any target PDA already exists, bail out with a friendly error
    const [idAcc, repAcc, poolAcc] = await Promise.all([
      this.connection.getAccountInfo(identityPda),
      this.connection.getAccountInfo(reputationPda),
      this.connection.getAccountInfo(rewardPoolPda),
    ]);
    if (idAcc || repAcc || poolAcc) {
      const exists = [
        idAcc ? "identity" : null,
        repAcc ? "reputation" : null,
        poolAcc ? "reward_pool" : null,
      ]
        .filter(Boolean)
        .join(", ");
      throw new Error(
        `Agent ID may already be registered (existing accounts: ${exists}). Try a different agentId.`
      );
    }

    const disc = await this.discriminator("register_agent");
    const data = new Uint8Array([
      ...disc,
      ...this.encodeString(cleanId),
      ...this.encodeString(cleanUri),
    ]);

    const buildIx = (identity: PublicKey, reputation: PublicKey, rewardPool: PublicKey) => new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: identity, isSigner: false, isWritable: true },
        { pubkey: reputation, isSigner: false, isWritable: true },
        { pubkey: rewardPool, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    try {
      const ix = buildIx(identityPda, reputationPda, rewardPoolPda);
      return await this.send([ix]);
    } catch (e: unknown) {
      const msg = (e as Error)?.message || "";
      const lower = msg.toLowerCase();
      const isSeedMismatch = lower.includes("constraintseeds") || lower.includes("seeds constraint") || lower.includes("error code: 2006");
      const mentionsReputation = lower.includes("reputation");
      if (isSeedMismatch && mentionsReputation) {
        // Try fallback PDAs (older program version: derive by identity pubkey)
        const [repById] = this.findReputationPdaByIdentity(identityPda);
        const [poolById] = this.findRewardPoolPdaByIdentity(identityPda);
        console.warn("Retrying register with identity-based PDAs", {
          identityPda: identityPda.toBase58(),
          reputationPdaFallback: repById.toBase58(),
          rewardPoolPdaFallback: poolById.toBase58(),
          agentIdRaw: agentId,
          agentIdNormalized: cleanId,
          agentIdBytes: Array.from(new TextEncoder().encode(cleanId)),
        });
        const ix2 = buildIx(identityPda, repById, poolById);
        return await this.send([ix2]);
      }
      throw e;
    }
  }

  async submitValidation(agentId: string, taskHash: Uint8Array, approved: boolean, evidenceUri: string): Promise<string> {
    const cfg = await this.getConfigAccount();
    if (!cfg) throw new Error("Config not initialized. Please initialize config first.");

    const clean = this.normalizeAgentId(agentId);
    const [identityPda] = this.findIdentityPda(clean);
    const idAcc = await this.connection.getAccountInfo(identityPda);
    if (!idAcc) throw new Error("Agent not found. Register agent first.");

    if (taskHash.length !== 32) throw new Error("taskHash must be 32 bytes");
    const [validationPda] = this.findValidationPda(agentId, taskHash);

    const disc = await this.discriminator("submit_validation");
    const data = new Uint8Array([
      ...disc,
      ...taskHash,
      ...this.boolU8(approved),
      ...this.encodeString(evidenceUri || ""),
    ]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: validationPda, isSigner: false, isWritable: true },
        { pubkey: identityPda, isSigner: false, isWritable: false },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: cfg.address, isSigner: false, isWritable: true },
        { pubkey: cfg.treasury, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return this.send([ix]);
  }

  async updateMetadata(agentId: string, newMetadataUri: string): Promise<string> {
    const cleanId = this.normalizeAgentId(agentId);
    const [identityPda] = this.findIdentityPda(cleanId);
    const idAcc = await this.connection.getAccountInfo(identityPda);
    if (!idAcc) throw new Error("Agent not found.");

    const disc = await this.discriminator("update_metadata");
    const data = new Uint8Array([
      ...disc,
      ...this.encodeString((newMetadataUri ?? "").trim()),
    ]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: identityPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return this.send([ix]);
  }

  async deactivateAgent(agentId: string): Promise<string> {
    const cleanId = this.normalizeAgentId(agentId);
    const [identityPda] = this.findIdentityPda(cleanId);
    const idAcc = await this.connection.getAccountInfo(identityPda);
    if (!idAcc) throw new Error("Agent not found.");

    const disc = await this.discriminator("deactivate_agent");
    const data = new Uint8Array([...disc]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: identityPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
      ],
    	data: Buffer.from(data),
    });

    return this.send([ix]);
  }

  async claimRewards(agentId: string): Promise<string> {
    const cleanId = this.normalizeAgentId(agentId);
    const [identityPda] = this.findIdentityPda(cleanId);
    const [rewardPoolPda] = this.findRewardPoolPda(cleanId);
    
    const idAcc = await this.connection.getAccountInfo(identityPda);
    if (!idAcc) throw new Error("Agent not found.");

    const disc = await this.discriminator("claim_rewards");
    const data = new Uint8Array([...disc]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: identityPda, isSigner: false, isWritable: false },
        { pubkey: rewardPoolPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return this.send([ix]);
  }

  /**
   * Get current lamports in the agent's reward pool PDA
   */
  async getRewardPoolLamports(agentId: string): Promise<number> {
    const cleanId = this.normalizeAgentId(agentId);
    const [rewardPoolPda] = this.findRewardPoolPda(cleanId);
    try {
      const balance = await this.connection.getBalance(rewardPoolPda, "confirmed");
      return balance;
    } catch (e) {
      console.warn("getRewardPoolLamports failed", e);
      return 0;
    }
  }

  /**
   * Sponsor an agent by funding its reward pool with native SOL.
   * This performs a SystemProgram.transfer to the agent's RewardPool PDA.
   * Note: Program may account for lamports on-chain when claiming/rewarding.
   */
  async fundRewardPool(agentId: string, lamports: number): Promise<string> {
    if (lamports <= 0) throw new Error("Amount must be > 0");
    const cleanId = this.normalizeAgentId(agentId);
    const [rewardPoolPda] = this.findRewardPoolPda(cleanId);

    const ix = SystemProgram.transfer({
      fromPubkey: this.wallet.publicKey,
      toPubkey: rewardPoolPda,
      lamports,
    });

    return this.send([ix]);
  }

  async updateReputation(agentId: string, validationPda: PublicKey): Promise<string> {
    const cleanId = this.normalizeAgentId(agentId);
    const [identityPda] = this.findIdentityPda(cleanId);
    const [reputationPda] = this.findReputationPda(cleanId);
    const [rewardPoolPda] = this.findRewardPoolPda(cleanId);

    const disc = await this.discriminator("update_reputation");
    const data = new Uint8Array([...disc]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: reputationPda, isSigner: false, isWritable: true },
        { pubkey: identityPda, isSigner: false, isWritable: false },
        { pubkey: validationPda, isSigner: false, isWritable: false },
        { pubkey: rewardPoolPda, isSigner: false, isWritable: true },
      ],
      data: Buffer.from(data),
    });

    return this.send([ix]);
  }

  async stakeValidator(lamports: number): Promise<string> {
    if (lamports < PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE) {
      throw new Error(`Minimum stake is ${PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE / 1_000_000_000} SOL`);
    }

    const [validatorPda] = this.findValidatorPda(this.wallet.publicKey);
    const [configPda] = this.findConfigPda();

    const lamportsBytes = new ArrayBuffer(8);
    new DataView(lamportsBytes).setBigUint64(0, BigInt(lamports), true);
    const tryNames = ["stake_validator", "stake", "become_validator"]; // fallback isimler

    let lastErr: unknown = undefined;
    for (const name of tryNames) {
      try {
        const disc = await this.discriminator(name);
        const data = new Uint8Array([...disc, ...new Uint8Array(lamportsBytes)]);
        const ix = new TransactionInstruction({
          programId: this.programId,
          keys: [
            { pubkey: validatorPda, isSigner: false, isWritable: true },
            { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: configPda, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          data: Buffer.from(data),
        });
        return await this.send([ix]);
      } catch (e: unknown) {
        const msg = (e as Error)?.message || "";
        const isIxMissing = msg.includes("0x65") || msg.toLowerCase().includes("instructionfallbacknotfound") || msg.toLowerCase().includes("unknown instruction") || msg.toLowerCase().includes("not found");
        if (!isIxMissing) throw e; // farklı hata ise tekrar denemeyelim
        lastErr = e;
        // Diğer isimle tekrar deneyeceğiz
      }
    }
    throw lastErr ?? new Error("Staking instruction failed for all known variants.");
  }
}

export const createSPL8004Client = (
  connection: Connection,
  wallet: AnchorWallet,
  programId?: PublicKey
) => {
  return new SPL8004Client(connection, wallet, programId);
};
