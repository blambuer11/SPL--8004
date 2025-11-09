/**
 * SPL-8004 SDK - Agent Identity & Payment Infrastructure
 * 
 * Easy-to-use SDK for building autonomous AI agents with:
 * - On-chain identity
 * - Gasless payments
 * - Reputation tracking
 * - Autonomous wallet management
 */

import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import bs58 from 'bs58';

export interface AgentConfig {
  agentId: string;
  privateKey: string; // base58 encoded
  network?: 'devnet' | 'mainnet-beta';
  rpcUrl?: string;
  validatorApiUrl?: string;
}

export interface PaymentOptions {
  targetEndpoint: string;
  priceUsd: number;
  metadata?: Record<string, any>;
}

export interface AgentIdentity {
  agentId: string;
  publicKey: string;
  identityPda: string;
  totalPayments: number;
  totalSpent: number;
  reputation: number;
  createdAt: number;
}

export interface PaymentResult {
  success: boolean;
  signature: string;
  explorerUrl: string;
  amount: number;
  agentId: string;
}

/**
 * SPL-8004 Agent Client
 * Main SDK class for agent operations
 */
export class AgentClient {
  private agentId: string;
  private keypair: Keypair;
  private connection: Connection;
  private validatorApiUrl: string;
  private network: string;

  constructor(config: AgentConfig) {
    this.agentId = config.agentId;
    this.network = config.network || 'devnet';
    
    // Decode private key
    const secretKey = bs58.decode(config.privateKey);
    this.keypair = Keypair.fromSecretKey(secretKey);

    // Setup connection
    const rpcUrl = config.rpcUrl || (
      this.network === 'mainnet-beta'
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.devnet.solana.com'
    );
    this.connection = new Connection(rpcUrl, 'confirmed');

    // Validator API URL
    this.validatorApiUrl = config.validatorApiUrl || 'http://localhost:4021';
  }

  /**
   * Get agent's public key
   */
  getPublicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  /**
   * Get agent's SOL balance
   */
  async getBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.keypair.publicKey);
    return balance / 1e9; // Convert lamports to SOL
  }

  /**
   * Get agent's USDC balance
   */
  async getUsdcBalance(usdcMint: PublicKey): Promise<number> {
    try {
      const ata = await getAssociatedTokenAddress(
        usdcMint,
        this.keypair.publicKey
      );
      
      const balance = await this.connection.getTokenAccountBalance(ata);
      return parseFloat(balance.value.uiAmount?.toString() || '0');
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get agent identity information
   */
  async getIdentity(): Promise<AgentIdentity> {
    const response = await fetch(`${this.validatorApiUrl}/agent/identity/${this.agentId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch identity: ${response.statusText}`);
    }

    const data = await response.json();
    return data.identity;
  }

  /**
   * Make autonomous payment to access protected endpoint
   */
  async makePayment(options: PaymentOptions): Promise<PaymentResult> {
    const response = await fetch(`${this.validatorApiUrl}/agent/auto-pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: this.agentId,
        targetEndpoint: options.targetEndpoint,
        priceUsd: options.priceUsd,
        metadata: options.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Payment failed');
    }

    return await response.json();
  }

  /**
   * Access protected endpoint with automatic payment
   */
  async accessProtectedEndpoint<T = any>(
    endpoint: string,
    options?: {
      method?: 'GET' | 'POST';
      body?: any;
      headers?: Record<string, string>;
      autoRetry?: boolean;
    }
  ): Promise<T> {
    const method = options?.method || 'GET';
    const headers = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    // Try accessing endpoint
    const response = await fetch(endpoint, {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    // If 402 Payment Required, auto-pay and retry
    if (response.status === 402) {
      const paymentInfo = await response.json();
      
      console.log(`💰 Payment required: ${paymentInfo.requirement.priceUsd} USDC`);
      
      // Make payment
      const payment = await this.makePayment({
        targetEndpoint: endpoint,
        priceUsd: paymentInfo.requirement.priceUsd,
      });

      console.log(`✅ Payment successful: ${payment.signature}`);

      // Retry with payment proof
      const retryResponse = await fetch(endpoint, {
        method,
        headers: {
          ...headers,
          'x-payment-response': payment.signature,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      if (!retryResponse.ok) {
        throw new Error(`Request failed: ${retryResponse.statusText}`);
      }

      return await retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create agent identity on-chain
   */
  async createIdentity(metadata?: string): Promise<AgentIdentity> {
    const response = await fetch(`${this.validatorApiUrl}/agent/identity/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: this.agentId,
        identifier: metadata || `agent_${this.agentId}_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Identity creation failed');
    }

    const data = await response.json();
    return data.identity;
  }
}

/**
 * Create agent client with simple configuration
 */
export function createAgent(config: AgentConfig): AgentClient {
  return new AgentClient(config);
}

/**
 * Generate new agent keypair
 */
export function generateAgentKeypair(): { publicKey: string; privateKey: string } {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toString(),
    privateKey: bs58.encode(keypair.secretKey),
  };
}

// Export types
export * from './types.js';

// Default export
export default {
  AgentClient,
  createAgent,
  generateAgentKeypair,
};
