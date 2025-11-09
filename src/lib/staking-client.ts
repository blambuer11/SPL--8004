import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction, SendTransactionError } from "@solana/web3.js";
import bs58 from "bs58";
import { Buffer } from "buffer";
import { AnchorWallet } from "@solana/wallet-adapter-react";

interface ImportMetaEnv {
  readonly VITE_STAKING_PROGRAM_ID?: string;
}

const STAKING_PROGRAM_ID_FROM_ENV = (import.meta as unknown as { env: ImportMetaEnv }).env.VITE_STAKING_PROGRAM_ID;
export const STAKING_PROGRAM_ID = new PublicKey(
  (STAKING_PROGRAM_ID_FROM_ENV && STAKING_PROGRAM_ID_FROM_ENV.trim().length > 0)
    ? STAKING_PROGRAM_ID_FROM_ENV.trim()
    : "Fg6PaFpoGXkYsidMpWxqSWYg8GbZ7qkWpwfXFZVbA3Jk"
);

const CONFIG_SEED = "config";
const VALIDATOR_SEED = "validator";

export class StakingClient {
  private connection: Connection;
  private wallet: AnchorWallet;
  private programId: PublicKey;

  constructor(connection: Connection, wallet: AnchorWallet, programId?: PublicKey) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = programId || STAKING_PROGRAM_ID;
  }

  public getProgramId(): PublicKey { return this.programId; }
  public getConnection(): Connection { return this.connection; }

  findConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([new TextEncoder().encode(CONFIG_SEED)], this.programId);
  }
  findValidatorPda(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([new TextEncoder().encode(VALIDATOR_SEED), owner.toBytes()], this.programId);
  }

  private async sha256(data: Uint8Array | string): Promise<Uint8Array> {
    const enc = typeof data === "string" ? new TextEncoder().encode(data) : data;
    const hash = await (globalThis.crypto as Crypto).subtle.digest("SHA-256", enc as unknown as BufferSource);
    return new Uint8Array(hash);
  }
  private async discriminator(name: string): Promise<Uint8Array> {
    const h = await this.sha256(`global:${name}`);
    return h.slice(0, 8);
  }

  private async send(ixs: TransactionInstruction[]): Promise<string> {
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    const tx = new Transaction({ feePayer: this.wallet.publicKey, blockhash, lastValidBlockHeight });
    tx.add(...ixs);
    const signed = await this.wallet.signTransaction(tx);
    const raw = signed.serialize();
    const firstSig = signed.signatures?.[0]?.signature;
    const sigStr = firstSig ? bs58.encode(firstSig) : undefined;
    try {
      const sig = await this.connection.sendRawTransaction(raw, { maxRetries: 3, preflightCommitment: "confirmed" });
      await this.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
      return sig;
    } catch (inner: unknown) {
      if (inner instanceof SendTransactionError) {
        const msg = (inner.message || "").toLowerCase();
        if (sigStr && (msg.includes("already been processed") || msg.includes("already processed"))) {
          await this.connection.confirmTransaction({ signature: sigStr, blockhash, lastValidBlockHeight }, "confirmed");
          return sigStr;
        }
        try {
          const logs = await inner.getLogs(this.connection);
          throw new Error(`Transaction failed: ${inner.message}\nLogs:\n${(logs || []).join("\n")}`);
        } catch {
          throw inner;
        }
      }
      throw inner;
    }
  }

  async getConfigAccount() {
    const [cfg] = this.findConfigPda();
    const info = await this.connection.getAccountInfo(cfg);
    if (!info) return null;
    // [disc(8)][authority(32)][min_stake(8)][cooldown(8)][bump(1)]
    const authority = new PublicKey(info.data.slice(8, 40));
    const dv = new DataView(info.data.buffer, info.data.byteOffset, info.data.byteLength);
    const minStake = Number(dv.getBigUint64(40, true));
    const cooldown = Number(dv.getBigInt64(48, true));
    const bump = info.data[56];
    return { address: cfg, authority, minStake, cooldown, bump };
  }

  async getValidatorAccount(owner: PublicKey) {
    const [validatorPda] = this.findValidatorPda(owner);
    const info = await this.connection.getAccountInfo(validatorPda);
    if (!info) return null;
    // [disc(8)][owner(32)][staked_amount(8)][last_stake_ts(8)][bump(1)]
    const ownerPk = new PublicKey(info.data.slice(8, 40));
    const dv = new DataView(info.data.buffer, info.data.byteOffset, info.data.byteLength);
    const stakedAmount = Number(dv.getBigUint64(40, true));
    const lastStakeTs = Number(dv.getBigInt64(48, true));
    const bump = info.data[56];
    return { address: validatorPda, owner: ownerPk, stakedAmount, lastStakeTs, bump };
  }

  /** Initialize config with defaults (None, None) to use on-chain defaults */
  async initializeConfigIfNeeded(): Promise<void> {
    const existing = await this.getConfigAccount();
    if (existing) return;
    const [cfg] = this.findConfigPda();
    const disc = await this.discriminator("initialize");
    // Borsh Option::None for both params: tag 0, tag 0
    const data = new Uint8Array([...disc, 0x00, 0x00]);
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: cfg, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });
    await this.send([ix]);
  }

  async stake(lamports: number): Promise<string> {
    if (lamports <= 0) throw new Error("Amount must be > 0");
    await this.initializeConfigIfNeeded();
    const [cfg] = this.findConfigPda();
    const [validatorPda] = this.findValidatorPda(this.wallet.publicKey);
    const disc = await this.discriminator("stake");
    const buf = new ArrayBuffer(8);
    new DataView(buf).setBigUint64(0, BigInt(lamports), true);
    const data = new Uint8Array([...disc, ...new Uint8Array(buf)]);
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: cfg, isSigner: false, isWritable: true },
        { pubkey: validatorPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });
    return this.send([ix]);
  }

  async unstake(lamports: number): Promise<string> {
    if (lamports <= 0) throw new Error("Amount must be > 0");
    const [cfg] = this.findConfigPda();
    const [validatorPda] = this.findValidatorPda(this.wallet.publicKey);
    const disc = await this.discriminator("unstake");
    const buf = new ArrayBuffer(8);
    new DataView(buf).setBigUint64(0, BigInt(lamports), true);
    const data = new Uint8Array([...disc, ...new Uint8Array(buf)]);
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: cfg, isSigner: false, isWritable: true },
        { pubkey: validatorPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });
    return this.send([ix]);
  }
}

export const createStakingClient = (connection: Connection, wallet: AnchorWallet, programId?: PublicKey) =>
  new StakingClient(connection, wallet, programId);
