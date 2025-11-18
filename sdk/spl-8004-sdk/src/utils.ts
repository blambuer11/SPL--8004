import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Find PDA for agent identity account
 */
export async function findAgentPda(
  agentId: string,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('agent'), Buffer.from(agentId)],
    programId
  );
}

/**
 * Find PDA for stake account
 */
export async function findStakePda(
  owner: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('stake'), owner.toBuffer()],
    programId
  );
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1_000_000_000);
}

/**
 * Convert USDC (with 6 decimals) to base units
 */
export function usdcToBaseUnits(usdc: number): number {
  return Math.floor(usdc * 1_000_000);
}

/**
 * Convert base units to USDC
 */
export function baseUnitsToUsdc(baseUnits: number): number {
  return baseUnits / 1_000_000;
}

/**
 * Validate Solana public key
 */
export function isValidPublicKey(key: string): boolean {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate protocol fee
 */
export function calculateFee(amount: number, feeRate: number = 0.005): number {
  return amount * feeRate;
}

/**
 * Encode string to base58
 */
export function encodeBase58(data: string | Buffer): string {
  const buffer = typeof data === 'string' ? Buffer.from(data) : data;
  return bs58.encode(buffer);
}

/**
 * Decode base58 string
 */
export function decodeBase58(encoded: string): Buffer {
  return Buffer.from(bs58.decode(encoded));
}
