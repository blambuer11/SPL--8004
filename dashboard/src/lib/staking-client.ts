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
  : "G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW"
);

const CONFIG_SEED = "config";
const VALIDATOR_SEED = "validator";

export interface StakingConfig {
  address: PublicKey;
  authority: PublicKey;
  treasury: PublicKey;
  registrationFee: number;
  validationFee: number;
  validatorMinStake: number;
  baseApyBps: number;
  instantUnstakeFeeBps: number;
}

export interface ValidatorAccount {
  address: PublicKey;
  authority: PublicKey;
  stakedAmount: number;
  isActive: boolean;
  lastStakeTs: number;
  lastRewardClaim: number;
  totalValidations: number;
  pendingRewards: number;
}

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
    return PublicKey.findProgramAddressSync([Buffer.from(CONFIG_SEED)], this.programId);
  }
  findValidatorPda(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(VALIDATOR_SEED), owner.toBuffer()], this.programId);
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
    const len = info.data.byteLength;
    const dv = new DataView(info.data.buffer, info.data.byteOffset, info.data.byteLength);

    // Legacy layout (before treasury/base_apy/instant_fee):
    // [disc(8)][authority(32)][registration_fee(8)][validation_fee(8)][validator_min_stake(8)] => 8+32+8+8+8 = 64 bytes
    // New layout:
    // [disc(8)][authority(32)][treasury(32)][registration_fee(8)][validation_fee(8)][validator_min_stake(8)][base_apy(2)][instant_fee(2)] => 100 bytes

    const authority = new PublicKey(info.data.slice(8, 40));
    let treasury: PublicKey;
    let registrationFee: number;
    let validationFee: number;
    let validatorMinStake: number;
    let baseApyBps: number;
    let instantUnstakeFeeBps: number;

    if (len >= 100) {
      // New layout
      treasury = new PublicKey(info.data.slice(40, 72));
      registrationFee = Number(dv.getBigUint64(72, true));
      validationFee = Number(dv.getBigUint64(80, true));
      validatorMinStake = Number(dv.getBigUint64(88, true));
      baseApyBps = dv.getUint16(96, true);
      instantUnstakeFeeBps = dv.getUint16(98, true);
    } else {
      // Legacy fallback
      // Offsets shift as treasury and u16 fields don't exist
      registrationFee = Number(dv.getBigUint64(40, true));
      validationFee = Number(dv.getBigUint64(48, true));
      validatorMinStake = Number(dv.getBigUint64(56, true));
      treasury = authority; // default: authority acts as treasury
      baseApyBps = 500; // 5%
      instantUnstakeFeeBps = 200; // 2%
    }

    return {
      address: cfg,
      authority,
      treasury,
      registrationFee,
      validationFee,
      validatorMinStake,
      baseApyBps,
      instantUnstakeFeeBps,
    };
  }

  async getValidatorAccount(owner: PublicKey) {
    const [validatorPda] = this.findValidatorPda(owner);
    const info = await this.connection.getAccountInfo(validatorPda);
    if (!info) return null;
    const len = info.data.byteLength;
    const dv = new DataView(info.data.buffer, info.data.byteOffset, info.data.byteLength);

    // Legacy validator layout:
    // [disc(8)][authority(32)][staked_amount(8)][is_active(1)][last_stake_timestamp(8)][total_validations(8)] => 8+32+8+1+8+8 = 65 bytes
    // New validator layout:
    // [disc(8)][authority(32)][staked_amount(8)][is_active(1)][last_stake_ts(8)][last_reward_claim(8)][total_validations(8)][pending_rewards(8)] => 81 bytes

    const authority = new PublicKey(info.data.slice(8, 40));
    const stakedAmount = Number(dv.getBigUint64(40, true));
    const isActive = info.data[48] === 1;
    const lastStakeTs = Number(dv.getBigInt64(49, true));
    let lastRewardClaim: number;
    let totalValidations: number;
    let pendingRewards: number;

    if (len >= 81) {
      lastRewardClaim = Number(dv.getBigInt64(57, true));
      totalValidations = Number(dv.getBigUint64(65, true));
      pendingRewards = Number(dv.getBigUint64(73, true));
    } else {
      // Legacy fallback
      lastRewardClaim = lastStakeTs; // treat as last claim
      totalValidations = Number(dv.getBigUint64(57, true));
      pendingRewards = 0;
    }

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

  /** Initialize config if needed (NOEMA-8004 requires commission_rate and treasury) */
  async initializeConfigIfNeeded(): Promise<void> {
    const existing = await this.getConfigAccount();
    if (existing) return;
    
    const [cfg] = this.findConfigPda();
    const disc = await this.discriminator("initialize_config");
    
    // Parameters: commission_rate: u16, treasury: Pubkey
    const commissionRate = 500; // 5% default
    const treasury = this.wallet.publicKey;
    
    // Borsh: disc(8) + u16(2) + Pubkey(32)
    const data = new Uint8Array(8 + 2 + 32);
    data.set(disc, 0);
    new DataView(data.buffer).setUint16(8, commissionRate, true); // little-endian u16
    data.set(treasury.toBytes(), 10); // Pubkey as 32 bytes
    
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
    const disc = await this.discriminator("stake_validator");
    
    // Parameters: amount: u64
    // Borsh: disc(8) + u64(8)
    const data = new Uint8Array(8 + 8);
    data.set(disc, 0);
    new DataView(data.buffer).setBigUint64(8, BigInt(lamports), true); // little-endian u64
    
    // Accounts order from Rust: config, validator, user, system_program
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
    const [validatorPda] = this.findValidatorPda(this.wallet.publicKey);
    const disc = await this.discriminator("unstake_validator");
    
    // Parameters: amount: u64
    // Borsh: disc(8) + u64(8)
    const data = new Uint8Array(8 + 8);
    data.set(disc, 0);
    new DataView(data.buffer).setBigUint64(8, BigInt(lamports), true); // little-endian u64
    
    // Accounts order from Rust: user, validator, system_program
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: validatorPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });
    return this.send([ix]);
  }

  async claimRewards(): Promise<string> {
    const [cfg] = this.findConfigPda();
    const [validatorPda] = this.findValidatorPda(this.wallet.publicKey);
    
    // NOEMA-8004'te claim_rewards fonksiyonu validator için değil agent için
    // Eğer validator rewards yoksa bu method'u kaldırabiliriz
    // Şimdilik placeholder olarak bırakıyorum
    throw new Error("claimRewards not implemented for validators in NOEMA-8004");
  }

  async instantUnstake(lamports: number): Promise<string> {
    if (lamports <= 0) throw new Error("Amount must be > 0");
    
    // NOEMA-8004'te instant_unstake fonksiyonu yok
    // Normal unstake kullanılıyor
    throw new Error("instantUnstake not implemented in NOEMA-8004. Use unstake() instead.");
  }

  async calculatePendingRewards(owner: PublicKey): Promise<number> {
    const validator = await this.getValidatorAccount(owner);
    if (!validator || !validator.isActive) return 0;
    
    const config = await this.getConfigAccount();
    if (!config) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeElapsed = currentTime - validator.lastRewardClaim;
    if (timeElapsed <= 0) return validator.pendingRewards / 1e9;

    const secondsPerYear = 31_536_000;
    const annualReward = (validator.stakedAmount * config.baseApyBps) / 10_000;
    const newReward = (annualReward * timeElapsed) / secondsPerYear;
    
    return (validator.pendingRewards + newReward) / 1e9;
  }
}

export const createStakingClient = (connection: Connection, wallet: AnchorWallet, programId?: PublicKey) =>
  new StakingClient(connection, wallet, programId);
