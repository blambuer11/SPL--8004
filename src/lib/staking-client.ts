import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction, SendTransactionError } from "@solana/web3.js";
import bs58 from "bs58";
import { Buffer } from "buffer";
import { AnchorWallet } from "@solana/wallet-adapter-react";

interface ImportMetaEnv {
  readonly VITE_STAKING_PROGRAM_ID?: string;
  readonly VITE_STAKING_DEMO_MODE?: string;
  readonly VITE_STAKING_SERVICE_URL?: string;
}

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

const STAKING_PROGRAM_ID_FROM_ENV = (import.meta as unknown as { env: ImportMetaEnv }).env.VITE_STAKING_PROGRAM_ID;
export const STAKING_PROGRAM_ID = new PublicKey(
  (STAKING_PROGRAM_ID_FROM_ENV && STAKING_PROGRAM_ID_FROM_ENV.trim().length > 0)
    ? STAKING_PROGRAM_ID_FROM_ENV.trim()
  : "G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW" // Devnet program
);
const DEMO_MODE = (((import.meta as unknown as { env: ImportMetaEnv }).env.VITE_STAKING_DEMO_MODE) || "").toLowerCase() === "true";
const PREVIEW_URL = ((import.meta as unknown as { env: ImportMetaEnv }).env.VITE_STAKING_SERVICE_URL || "").trim();

const SKIP_SIMULATION = (import.meta as unknown as { env: { VITE_SKIP_STAKE_SIMULATION?: string } }).env.VITE_SKIP_STAKE_SIMULATION === 'true';

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
    const disc = h.slice(0, 8);
    console.log(`[StakingClient] discriminator('${name}'):`, Array.from(disc), 'hex:', Array.from(disc).map(b => b.toString(16).padStart(2, '0')).join(''));
    return disc;
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

  // Preview service poster (demo mode only)
  private async postPreview(event: "stake" | "unstake" | "claim", body: Record<string, unknown>) {
    if (!PREVIEW_URL) return;
    try {
      await fetch(`${PREVIEW_URL.replace(/\/$/, "")}/${event}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, wallet: this.wallet.publicKey.toBase58(), ts: Date.now() })
      });
    } catch (e) {
      console.warn("[StakingClient] preview post failed:", e);
    }
  }

  // Simulate a single-instruction transaction without triggering a wallet prompt
  private async simulate(ix: TransactionInstruction): Promise<{ ok: boolean; logs: string[] | null; err: unknown | null }> {
    try {
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('processed');
      const tx = new Transaction({ feePayer: this.wallet.publicKey, blockhash, lastValidBlockHeight });
      tx.add(ix);
  // Don't provide signers; most clusters allow simulation without signatures
  const resp = await this.connection.simulateTransaction(tx);
  const value = (resp as unknown as { value?: { err?: unknown; logs?: string[] } }).value;
      return { ok: !value?.err, logs: value?.logs ?? null, err: value?.err ?? null };
    } catch (e) {
      return { ok: false, logs: null, err: e };
    }
  }

  async getConfigAccount(): Promise<StakingConfig | null> {
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

  async getValidatorAccount(owner: PublicKey): Promise<ValidatorAccount | null> {
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

  /** Initialize config if needed - SPL-8004 initialize takes NO parameters */
  async initializeConfigIfNeeded(): Promise<void> {
    const existing = await this.getConfigAccount();
    if (existing) return;
    
    const [cfg] = this.findConfigPda();
    const disc = await this.discriminator("initialize");
    
    // NO parameters - Rust fn: pub fn initialize(ctx: Context<Initialize>) -> Result<()>
    // Borsh: just disc(8)
    const data = new Uint8Array(8);
    data.set(disc, 0);
    
    // Account order from Rust Initialize struct: config, authority, system_program
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
    
    // Devnet config eski layout olabilir; minimum stake client-side kontrol.
    const MIN_STAKE = 100_000_000; // 0.1 SOL
    if (lamports < MIN_STAKE) {
      throw new Error(`Minimum stake is ${MIN_STAKE / 1e9} SOL (you tried ${lamports / 1e9} SOL)`);
    }

    if (DEMO_MODE) {
      const sig = `demo-stake-${Date.now()}`;
      await this.postPreview("stake", { amount: lamports, signature: sig });
      return sig;
    }

    const [cfg] = this.findConfigPda();
    const [validatorPda] = this.findValidatorPda(this.wallet.publicKey);
    console.log(`[StakingClient] stake() - cfg: ${cfg.toBase58()}, validator: ${validatorPda.toBase58()}, user: ${this.wallet.publicKey.toBase58()}`);

    // 0x65 (InstructionFallbackNotFound) için: Eski program isimleri/hesap sıralarıyla dene.
    const candidateNames = [
      "stake_validator",
      "become_validator",
      "register_validator",
      "stake",
    ];
    type A = "validator" | "user" | "config" | "system";
    const orders: A[][] = [
      ["validator", "user", "config", "system"],
      ["validator", "config", "user", "system"],
      ["user", "validator", "config", "system"],
      ["config", "user", "validator", "system"],
    ];

    const buildKeys = (order: A[]): { pubkey: PublicKey; isSigner: boolean; isWritable: boolean }[] => {
      return order.map((k) => {
        if (k === "validator") return { pubkey: validatorPda, isSigner: false, isWritable: true };
        if (k === "user") return { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true };
        if (k === "config") return { pubkey: cfg, isSigner: false, isWritable: false };
        return { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }; // system
      });
    };

    let chosenIx: TransactionInstruction | null = null;
    let chosenMeta: { name: string; order: A[] } | null = null;

    for (const name of candidateNames) {
      const disc = await this.discriminator(name);
      const data = new Uint8Array(8 + 8);
      data.set(disc, 0);
      new DataView(data.buffer).setBigUint64(8, BigInt(lamports), true);
      const dataBuf = Buffer.from(data);

      for (const order of orders) {
        const ix = new TransactionInstruction({ programId: this.programId, keys: buildKeys(order), data: dataBuf });
        if (SKIP_SIMULATION) {
          chosenIx = ix; chosenMeta = { name, order }; break;
        }
        const sim = await this.simulate(ix);
        const logsStr = (sim.logs || []).join(" | ");
        console.log(`[StakingClient] try name='${name}' order='${order.join(",")}' sim.ok=${sim.ok} logs=${logsStr}`);
        if (sim.ok) { chosenIx = ix; chosenMeta = { name, order }; break; }
      }
      if (chosenIx) break;
    }

    if (!chosenIx || !chosenMeta) {
      throw new Error("Stake simulation failed for all known instruction variants (names and account orders). Program likely differs on devnet.");
    }

    console.log(`[StakingClient] Using variant name='${chosenMeta.name}' order='${chosenMeta.order.join(",")}'`);
    return await this.send([chosenIx]);
  }

  async unstake(lamports: number): Promise<string> {
    if (lamports <= 0) throw new Error("Amount must be > 0");
    if (DEMO_MODE) {
      const sig = `demo-unstake-${Date.now()}`;
      await this.postPreview("unstake", { amount: lamports, signature: sig });
      return sig;
    }
    const [validatorPda] = this.findValidatorPda(this.wallet.publicKey);
    
    // Exact account order from Rust: validator, user, system_program
    const disc = await this.discriminator("unstake_validator");
    const data = new Uint8Array(8 + 8);
    data.set(disc, 0);
    new DataView(data.buffer).setBigUint64(8, BigInt(lamports), true);
    
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: validatorPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });
    
    const sim = await this.simulate(ix);
    if (!sim.ok) {
      const logsStr = (sim.logs || []).join(' | ');
      throw new Error(`Unstake simulation failed: ${JSON.stringify(sim.err)} Logs: ${logsStr}`);
    }
    
    return await this.send([ix]);
  }

  async claimRewards(): Promise<string> {
    if (DEMO_MODE) {
      const sig = `demo-claim-${Date.now()}`;
      await this.postPreview("claim", { signature: sig });
      return sig;
    }
    const [cfg] = this.findConfigPda();
    const [validatorPda] = this.findValidatorPda(this.wallet.publicKey);
    
    // Exact account order from Rust: validator, user, config, system_program
    const disc = await this.discriminator("claim_validator_rewards");
    const data = new Uint8Array(8);
    data.set(disc, 0);
    
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: validatorPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: cfg, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });
    
    const sim = await this.simulate(ix);
    if (!sim.ok) {
      const logsStr = (sim.logs || []).join(' | ');
      throw new Error(`Claim simulation failed: ${JSON.stringify(sim.err)} Logs: ${logsStr}`);
    }
    
    return await this.send([ix]);
  }

  async instantUnstake(lamports: number): Promise<string> {
    if (lamports <= 0) throw new Error("Amount must be > 0");
    const [cfg] = this.findConfigPda();
    const [validatorPda] = this.findValidatorPda(this.wallet.publicKey);
    const config = await this.getConfigAccount();
    if (!config) throw new Error("Config account not found");
    
    // Exact account order from Rust: validator, user, config, treasury, system_program
    const disc = await this.discriminator("unstake_validator_instant");
    const data = new Uint8Array(8 + 8);
    data.set(disc, 0);
    new DataView(data.buffer).setBigUint64(8, BigInt(lamports), true);
    
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: validatorPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: cfg, isSigner: false, isWritable: false },
        { pubkey: config.treasury, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });
    
    const sim = await this.simulate(ix);
    if (!sim.ok) {
      const logsStr = (sim.logs || []).join(' | ');
      throw new Error(`Instant unstake simulation failed: ${JSON.stringify(sim.err)} Logs: ${logsStr}`);
    }
    
    return await this.send([ix]);
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
