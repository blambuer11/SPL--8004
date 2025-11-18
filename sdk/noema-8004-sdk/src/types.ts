import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';

export interface AgentAccount {
  pda: PublicKey;
  agentId: string;
  owner: PublicKey;
  metadataUri: string;
  reputation: number;
  totalTransactions: number;
  createdAt: number;
  updatedAt: number;
}

export interface RegisterAgentParams {
  agentId: string;
  metadataUri: string;
  capabilities?: string[];
  validator?: PublicKey;
}

export interface UpdateAgentParams {
  agentPda: PublicKey;
  metadataUri: string;
}

export interface PaymentParams {
  recipient: PublicKey | string;
  amount: number;
  memo?: string;
  reference?: string;
}

export interface StakeParams {
  amount: number;
  lockPeriod: 30 | 60 | 90;
}

export type NetworkType = 'devnet' | 'testnet' | 'mainnet-beta';

export interface SDKConfig {
  connection: Connection;
  wallet: Keypair;
  programId: PublicKey;
  network?: NetworkType;
}

export interface PaymentResult {
  signature: string;
  fee: number;
  timestamp: number;
}

export interface StakeResult {
  pda: PublicKey;
  amount: number;
  unlockAt: number;
  signature: string;
}
