import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction, SendTransactionError } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PROGRAM_CONSTANTS } from "./program-constants";

// Program ID (Devnet)
export const SPL8004_PROGRAM_ID = new PublicKey("G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW");

// PDA Seeds
const CONFIG_SEED = "config";
const IDENTITY_SEED = "identity";
const REPUTATION_SEED = "reputation";
const VALIDATION_SEED = "validation";
const REWARD_POOL_SEED = "reward_pool";

export class SPL8004Client {
  private connection: Connection;
  private wallet: AnchorWallet;
  private provider: AnchorProvider;
  private programId: PublicKey;

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

  findRewardPoolPda(agentId: string): [PublicKey, number] {
    const enc = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [enc.encode(REWARD_POOL_SEED), enc.encode(agentId)],
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
    const hash = await (globalThis.crypto as Crypto).subtle.digest("SHA-256", enc);
    return new Uint8Array(hash);
  }

  private async discriminator(name: string): Promise<Uint8Array> {
    // Anchor global instruction discriminator = sha256("global:<name>") first 8 bytes
    const h = await this.sha256(`global:${name}`);
    return h.slice(0, 8);
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

  private async send(ixs: TransactionInstruction[]): Promise<string> {
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    const tx = new Transaction({ feePayer: this.wallet.publicKey, blockhash, lastValidBlockHeight });
    tx.add(...ixs);
    try {
      const signed = await this.wallet.signTransaction(tx);
      const sig = await this.connection.sendRawTransaction(signed.serialize());
      await this.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
      return sig;
    } catch (e: unknown) {
      if (e instanceof SendTransactionError) {
        try {
          const logs = await e.getLogs(this.connection);
          // Surface rich logs for easier debugging in UI/console
          console.error("Transaction failed:", e.message, logs);
          throw new Error(`Transaction failed: ${e.message}\nLogs:\n${(logs || []).join("\n")}`);
        } catch (logErr) {
          console.error("Transaction failed (no logs):", e);
          throw e;
        }
      }
      throw e;
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
      data,
    });

    await this.send([ix]);
    return { address: configPda };
  }
  async getIdentity(agentId: string) {
    try {
      const [identityPda] = this.findIdentityPda(agentId);
      const accountInfo = await this.connection.getAccountInfo(identityPda);
      
      if (!accountInfo) return null;
      
      // Parse account data (simplified - real implementation would use IDL)
      return {
        address: identityPda,
        owner: new PublicKey(accountInfo.data.slice(8, 40)),
        agentId: agentId,
        isActive: accountInfo.data[accountInfo.data.length - 2] === 1,
      };
    } catch (error) {
      console.error("Error fetching identity:", error);
      return null;
    }
  }

  async getReputation(agentId: string) {
    try {
      const [identityPda] = this.findIdentityPda(agentId);
      const [reputationPda] = this.findReputationPda(agentId);
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

  // Helper to create mock data for development
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
    const [identityPda] = this.findIdentityPda(agentId);
    const [reputationPda] = this.findReputationPda(agentId);
    const [rewardPoolPda] = this.findRewardPoolPda(agentId);
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
      ...this.encodeString(agentId),
      ...this.encodeString(metadataUri),
    ]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: identityPda, isSigner: false, isWritable: true },
        { pubkey: reputationPda, isSigner: false, isWritable: true },
        { pubkey: rewardPoolPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    return this.send([ix]);
  }

  async submitValidation(agentId: string, taskHash: Uint8Array, approved: boolean, evidenceUri: string): Promise<string> {
    const cfg = await this.getConfigAccount();
    if (!cfg) throw new Error("Config not initialized. Please initialize config first.");

    const [identityPda] = this.findIdentityPda(agentId);
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
      data,
    });

    return this.send([ix]);
  }
}

export const createSPL8004Client = (
  connection: Connection,
  wallet: AnchorWallet,
  programId?: PublicKey
) => {
  return new SPL8004Client(connection, wallet, programId);
};
