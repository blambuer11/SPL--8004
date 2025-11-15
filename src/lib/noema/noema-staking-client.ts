import { Connection, PublicKey, Transaction, TransactionInstruction, SendTransactionError, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import bs58 from "bs58";
import { Buffer } from "buffer";

interface ImportMetaEnv {
  readonly VITE_NOEMA_STAKING_PROGRAM_ID?: string;
  readonly VITE_NOEMA_MINT?: string;
}

const NOEMA_ENV = typeof import.meta !== 'undefined' && import.meta.env 
  ? (import.meta as unknown as { env: ImportMetaEnv }).env 
  : {};

export const NOEMA_STAKING_PROGRAM_ID = new PublicKey(
  (NOEMA_ENV.VITE_NOEMA_STAKING_PROGRAM_ID && NOEMA_ENV.VITE_NOEMA_STAKING_PROGRAM_ID.trim().length > 0)
    ? NOEMA_ENV.VITE_NOEMA_STAKING_PROGRAM_ID.trim()
    : process.env.VITE_NOEMA_STAKING_PROGRAM_ID || "11111111111111111111111111111111" // placeholder; must be set in .env for real use
);

export const NOEMA_MINT = new PublicKey(
  (NOEMA_ENV.VITE_NOEMA_MINT && NOEMA_ENV.VITE_NOEMA_MINT.trim().length > 0)
    ? NOEMA_ENV.VITE_NOEMA_MINT.trim()
    : process.env.VITE_NOEMA_MINT || "11111111111111111111111111111111" // placeholder
);

const CONFIG_SEED = "noema_config";
const VALIDATOR_SEED = "noema_validator";
const VAULT_SEED = "noema_vault";

export interface NoemaConfigAccount {
  address: PublicKey;
  authority: PublicKey;
  treasury: PublicKey;
  stakeMint: PublicKey;
  validatorMinStake: bigint;
  baseApyBps: number;
  instantUnstakeFeeBps: number;
}

export interface NoemaValidatorAccount {
  address: PublicKey;
  authority: PublicKey;
  stakedAmount: bigint;
  isActive: boolean;
  lastStakeTs: bigint;
  lastRewardClaim: bigint;
  totalValidations: bigint;
  pendingRewards: bigint;
}

export type WalletLike = {
  publicKey: PublicKey;
  signTransaction(tx: Transaction): Promise<Transaction>;
};

export class NoemaStakingClient {
  private stakeMint: PublicKey;
  
  constructor(
    private connection: Connection, 
    private wallet: WalletLike, 
    private programId: PublicKey = NOEMA_STAKING_PROGRAM_ID,
    stakeMint?: PublicKey
  ) {
    this.stakeMint = stakeMint ?? NOEMA_MINT;
  }

  getProgramId() { return this.programId; }
  getConnection() { return this.connection; }
  getStakeMint() { return this.stakeMint; }

  findConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(CONFIG_SEED)], this.programId);
  }

  findValidatorPda(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(VALIDATOR_SEED), owner.toBuffer()], this.programId);
  }

  // Vault is an Associated Token Account, not a PDA
  getVaultAta(validator: PublicKey): PublicKey {
    return getAssociatedTokenAddressSync(this.stakeMint, validator, true); // allowOwnerOffCurve = true for PDAs
  }

  // Legacy method kept for compatibility
  findVaultPda(validator: PublicKey): [PublicKey, number] {
    return [this.getVaultAta(validator), 0];
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
          throw new Error(`NOEMA staking tx failed: ${inner.message}\nLogs:\n${(logs || []).join("\n")}`);
        } catch {
          throw inner;
        }
      }
      throw inner;
    }
  }

  private getUserAta(owner: PublicKey, mint: PublicKey): PublicKey {
    return getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  }

  async getConfigAccount(): Promise<NoemaConfigAccount | null> {
    const [cfg] = this.findConfigPda();
    const info = await this.connection.getAccountInfo(cfg);
    if (!info) return null;

    const data = info.data;
    if (data.length < 8 + 32 + 32 + 32 + 8 + 2 + 2) return null;
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);

    const authority = new PublicKey(data.slice(8, 40));
    const treasury = new PublicKey(data.slice(40, 72));
    const stakeMint = new PublicKey(data.slice(72, 104));
    const validatorMinStake = dv.getBigUint64(104, true);
    const baseApyBps = dv.getUint16(112, true);
    const instantUnstakeFeeBps = dv.getUint16(114, true);

    return {
      address: cfg,
      authority,
      treasury,
      stakeMint,
      validatorMinStake,
      baseApyBps,
      instantUnstakeFeeBps,
    };
  }

  async getValidatorAccount(owner: PublicKey): Promise<NoemaValidatorAccount | null> {
    const [validatorPda] = this.findValidatorPda(owner);
    const info = await this.connection.getAccountInfo(validatorPda);
    if (!info) return null;

    const data = info.data;
    if (data.length < 8 + 32 + 8 + 1 + 8 + 8 + 8 + 8) return null;
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);

    const authority = new PublicKey(data.slice(8, 40));
    const stakedAmount = dv.getBigUint64(40, true);
    const isActive = data[48] === 1;
    const lastStakeTs = dv.getBigInt64(49, true);
    const lastRewardClaim = dv.getBigInt64(57, true);
    const totalValidations = dv.getBigUint64(65, true);
    const pendingRewards = dv.getBigUint64(73, true);

    return {
      address: validatorPda,
      authority,
      stakedAmount,
      isActive,
      lastStakeTs,
      lastRewardClaim,
      totalValidations,
      pendingRewards,
    };
  }

  /** initialize(config, authority, stake_mint, treasury, base_apy_bps, instant_unstake_fee_bps, validator_min_stake) */
  async initializeConfig(params: {
    baseApyBps: number;
    instantUnstakeFeeBps: number;
    validatorMinStake: bigint;
    treasury: PublicKey;
  }): Promise<string> {
    const existing = await this.getConfigAccount();
    if (existing) return "config-already-initialized";

    const [cfg] = this.findConfigPda();
    const disc = await this.discriminator("initialize");

    const data = new Uint8Array(8 + 2 + 2 + 8);
    data.set(disc, 0);
    const dv = new DataView(data.buffer);
    dv.setUint16(8, params.baseApyBps, true);
    dv.setUint16(10, params.instantUnstakeFeeBps, true);
    dv.setBigUint64(12, params.validatorMinStake, true);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: cfg, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: this.stakeMint, isSigner: false, isWritable: false },
        { pubkey: params.treasury, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return this.send([ix]);
  }

  /** stake_validator: transfers NOEMA from user's ATA to vault; creates validator/vault if needed (program handles) */
  async stake(amountRaw: bigint): Promise<string> {
    if (amountRaw <= 0n) throw new Error("Amount must be > 0");
    const [cfg] = this.findConfigPda();
    const [validator] = this.findValidatorPda(this.wallet.publicKey);
    const [vault] = this.findVaultPda(validator);
    const userAta = this.getUserAta(this.wallet.publicKey, this.stakeMint);

    const disc = await this.discriminator("stake_validator");
    const data = new Uint8Array(8 + 8);
    data.set(disc, 0);
    new DataView(data.buffer).setBigUint64(8, amountRaw, true);

    const keys = [
      { pubkey: validator, isSigner: false, isWritable: true },
      { pubkey: cfg, isSigner: false, isWritable: true },
      { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: userAta, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: this.stakeMint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    const ix = new TransactionInstruction({ programId: this.programId, keys, data: Buffer.from(data) });
    return this.send([ix]);
  }

  /** claim_validator_rewards: moves pending NOEMA from vault to user */
  async claimRewards(): Promise<string> {
    const [cfg] = this.findConfigPda();
    const [validator] = this.findValidatorPda(this.wallet.publicKey);
    const [vault] = this.findVaultPda(validator);
    const userAta = this.getUserAta(this.wallet.publicKey, this.stakeMint);

    const disc = await this.discriminator("claim_validator_rewards");
    const data = new Uint8Array(8);
    data.set(disc, 0);

    const keys = [
      { pubkey: validator, isSigner: false, isWritable: true },
      { pubkey: cfg, isSigner: false, isWritable: false },
      { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: userAta, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    const ix = new TransactionInstruction({ programId: this.programId, keys, data: Buffer.from(data) });
    return this.send([ix]);
  }

  /** unstake_validator_instant: fee taken to treasury, remainder to user */
  async instantUnstake(amountRaw: bigint, treasuryAta: PublicKey): Promise<string> {
    if (amountRaw <= 0n) throw new Error("Amount must be > 0");
    const [cfg] = this.findConfigPda();
    const [validator] = this.findValidatorPda(this.wallet.publicKey);
    const [vault] = this.findVaultPda(validator);
    const userAta = this.getUserAta(this.wallet.publicKey, this.stakeMint);

    const disc = await this.discriminator("unstake_validator_instant");
    const data = new Uint8Array(8 + 8);
    data.set(disc, 0);
    new DataView(data.buffer).setBigUint64(8, amountRaw, true);

    const keys = [
      { pubkey: validator, isSigner: false, isWritable: true },
      { pubkey: cfg, isSigner: false, isWritable: false },
      { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: userAta, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: treasuryAta, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    const ix = new TransactionInstruction({ programId: this.programId, keys, data: Buffer.from(data) });
    return this.send([ix]);
  }

  /** unstake_validator: cooldown-respecting unstake to user */
  async unstake(amountRaw: bigint): Promise<string> {
    if (amountRaw <= 0n) throw new Error("Amount must be > 0");
    const [cfg] = this.findConfigPda();
    const [validator] = this.findValidatorPda(this.wallet.publicKey);
    const [vault] = this.findVaultPda(validator);
    const userAta = this.getUserAta(this.wallet.publicKey, this.stakeMint);

    const disc = await this.discriminator("unstake_validator");
    const data = new Uint8Array(8 + 8);
    data.set(disc, 0);
    new DataView(data.buffer).setBigUint64(8, amountRaw, true);

    const keys = [
      { pubkey: validator, isSigner: false, isWritable: true },
      { pubkey: cfg, isSigner: false, isWritable: false },
      { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: userAta, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    const ix = new TransactionInstruction({ programId: this.programId, keys, data: Buffer.from(data) });
    return this.send([ix]);
  }
}

export const createNoemaStakingClient = (connection: Connection, wallet: WalletLike, programId?: PublicKey, stakeMint?: PublicKey) => {
  return new NoemaStakingClient(connection, wallet, programId ?? NOEMA_STAKING_PROGRAM_ID, stakeMint);
};
