import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import bs58 from 'bs58';
import { Buffer } from 'buffer';

interface ImportMetaEnv {
  readonly VITE_NOEMA_LINK_PROGRAM_ID?: string;
  readonly VITE_NOEMA_STAKING_PROGRAM_ID?: string;
  readonly VITE_PROGRAM_ID?: string; // SPL-8004 main program ID
}

// Narrow import.meta.env safely without using 'any'
const ENV: ImportMetaEnv = ((): ImportMetaEnv => {
  if (typeof import.meta !== 'undefined') {
    const meta = import.meta as unknown as { env?: ImportMetaEnv };
    if (meta.env) return meta.env;
  }
  return {} as ImportMetaEnv;
})();

export const NOEMA_LINK_PROGRAM_ID = new PublicKey(
  (ENV.VITE_NOEMA_LINK_PROGRAM_ID && ENV.VITE_NOEMA_LINK_PROGRAM_ID.trim().length > 0) ? ENV.VITE_NOEMA_LINK_PROGRAM_ID.trim() : '4X1mFJFMmsn1yFZ8aXjyyHaXVrRLAWT4n4awtD1eYgG8'
);

export const NOEMA_STAKING_PROGRAM_ID = new PublicKey(
  (ENV.VITE_NOEMA_STAKING_PROGRAM_ID && ENV.VITE_NOEMA_STAKING_PROGRAM_ID.trim().length > 0) ? ENV.VITE_NOEMA_STAKING_PROGRAM_ID.trim() : 'iMjAbTmAddZTzEtDcSgbDPJRRdc4eT6mGC9SnK3Gzy8'
);

export const SPL_8004_PROGRAM_ID = new PublicKey(
  (ENV.VITE_PROGRAM_ID && ENV.VITE_PROGRAM_ID.trim().length > 0) ? ENV.VITE_PROGRAM_ID.trim() : 'FX7cpN56T49BT4HaMXsJcLgXRpQ54MHbsYmS3qDNzpGm'
);

export type WalletLike = { publicKey: PublicKey; signTransaction(tx: Transaction): Promise<Transaction>; };

const LINK_SEED = 'noema_link';
const NOEMA_VALIDATOR_SEED = 'noema_validator';
const SPL_VALIDATOR_SEED = 'validator';

export class NoemaLinkClient {
  constructor(private connection: Connection, private wallet: WalletLike, private programId: PublicKey = NOEMA_LINK_PROGRAM_ID) {}

  findLinkPda(authority: PublicKey = this.wallet.publicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(LINK_SEED), authority.toBuffer()], this.programId);
  }
  findNoemaValidatorPda(authority: PublicKey = this.wallet.publicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(NOEMA_VALIDATOR_SEED), authority.toBuffer()], NOEMA_STAKING_PROGRAM_ID);
  }
  findSplValidatorPda(authority: PublicKey = this.wallet.publicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(SPL_VALIDATOR_SEED), authority.toBuffer()], SPL_8004_PROGRAM_ID);
  }

  async getLinkAccount(authority: PublicKey = this.wallet.publicKey): Promise<null | { authority: PublicKey; noemaValidator: PublicKey; createdTs: bigint; address: PublicKey; }>{
    const [link] = this.findLinkPda(authority);
    const info = await this.connection.getAccountInfo(link);
    if (!info) return null;
    const data = info.data;
    if (data.length < 8 + 32 + 32 + 8) return null;
    const authorityPk = new PublicKey(data.slice(8, 40));
    const noemaValidator = new PublicKey(data.slice(40, 72));
    const createdTs = new DataView(data.slice(72, 80).buffer).getBigInt64(0, true);
    return { authority: authorityPk, noemaValidator, createdTs, address: link };
  }

  private async sha256(data: Uint8Array | string): Promise<Uint8Array> {
    const enc = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const hash = await (globalThis.crypto as Crypto).subtle.digest('SHA-256', enc as BufferSource);
    return new Uint8Array(hash);
  }
  private async discriminator(name: string): Promise<Uint8Array> {
    const h = await this.sha256(`global:${name}`);
    return h.slice(0, 8);
  }

  async link(): Promise<string> {
    const [linkPda] = this.findLinkPda();
    const [noemaValidator] = this.findNoemaValidatorPda();
    const disc = await this.discriminator('link');
    const data = new Uint8Array(8); // no args
    data.set(disc, 0);

    const keys = [
      { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: noemaValidator, isSigner: false, isWritable: false },
      { pubkey: linkPda, isSigner: false, isWritable: true },
      { pubkey: (await import('@solana/web3.js')).SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    const ix = new TransactionInstruction({ programId: this.programId, keys, data: Buffer.from(data) });
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    const tx = new Transaction({ feePayer: this.wallet.publicKey, blockhash, lastValidBlockHeight }).add(ix);
    const signed = await this.wallet.signTransaction(tx);
    const raw = signed.serialize();
    const firstSig = signed.signatures?.[0]?.signature;
    const sigStr = firstSig ? bs58.encode(firstSig) : undefined;
    const sig = await this.connection.sendRawTransaction(raw, { maxRetries: 3, preflightCommitment: 'confirmed' });
    await this.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
    return sigStr || sig;
  }
}

export const createNoemaLinkClient = (connection: Connection, wallet: WalletLike, programId?: PublicKey) => new NoemaLinkClient(connection, wallet, programId);