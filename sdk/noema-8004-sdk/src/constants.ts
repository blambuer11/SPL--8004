import { PublicKey } from '@solana/web3.js';

// Program IDs
export const PROGRAM_IDS = {
  devnet: new PublicKey('Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu'),
  'mainnet-beta': new PublicKey('Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu'),
  testnet: new PublicKey('Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu'),
} as const;

// USDC Mint addresses
export const USDC_MINTS = {
  devnet: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
  'mainnet-beta': new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  testnet: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
} as const;

// Default RPC endpoints
export const RPC_ENDPOINTS = {
  devnet: 'https://api.devnet.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  testnet: 'https://api.testnet.solana.com',
} as const;

// Protocol constants
export const PROTOCOL_FEE = 0.005; // 0.5%
export const MIN_STAKE_AMOUNT = 100; // NOEMA tokens
export const STAKE_LOCK_PERIODS = [30, 60, 90] as const;
