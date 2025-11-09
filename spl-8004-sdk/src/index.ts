/**
 * Noema Protocol SDK - The Stripe of AI Agent Identity
 * 
 * Trust Infrastructure for Autonomous AI:
 * - On-chain agent identity and reputation
 * - Autonomous payments with X402 protocol
 * - Gasless transactions
 * - Usage-based pricing with API keys
 * 
 * Get your API key: https://noemaprotocol.xyz/dashboard
 */

import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import bs58 from 'bs58';

export interface AgentConfig {
  agentId: string;
  privateKey: string; // base58 encoded
  apiKey: string; // Noema Protocol API key (required)
  network?: 'devnet' | 'mainnet-beta';
  rpcUrl?: string;
  apiUrl?: string; // Noema API URL
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

export interface UsageStats {
  requestsToday: number;
  requestsThisMonth: number;
  totalRequests: number;
  tier: 'free' | 'pro' | 'enterprise';
  limits: {
    dailyRequests: number;
    monthlyRequests: number;
  };
  rateLimitRemaining: number;
  rateLimitReset: number;
}

/**
 * Noema Protocol Agent Client
 * Main SDK class for agent operations with API key authentication
 */
export class AgentClient {
  private agentId: string;
  private apiKey: string;
  private keypair: Keypair;
  private connection: Connection;
  private apiUrl: string;
  private network: string;

  constructor(config: AgentConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required. Get yours at https://noemaprotocol.xyz/dashboard');
    }

    this.agentId = config.agentId;
    this.apiKey = config.apiKey;
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

    // Noema API URL
    this.apiUrl = config.apiUrl || 'https://noemaprotocol.xyz/api';
  }

  /**
   * Get authenticated headers for API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'x-agent-id': this.agentId,
    };
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
    const response = await fetch(`${this.apiUrl}/agents/${this.agentId}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch identity: ${response.statusText}`);
    }

    const data = await response.json();
    return data.identity || data;
  }

  /**
   * Get current usage statistics and rate limits
   */
  async getUsageStats(): Promise<UsageStats> {
    const response = await fetch(`${this.apiUrl}/usage/summary`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch usage stats: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Make autonomous payment to access protected endpoint
   */
  async makePayment(options: PaymentOptions): Promise<PaymentResult> {
    const response = await fetch(`${this.apiUrl}/crypto/solana-pay`, {
      method: 'POST',
      headers: this.getHeaders(),
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
  async accessProtectedEndpoint<T = unknown>(
    endpoint: string,
    options?: {
      method?: 'GET' | 'POST';
      body?: unknown;
      headers?: Record<string, string>;
      autoRetry?: boolean;
    }
  ): Promise<T> {
    const method = options?.method || 'GET';
    const headers = {
      ...this.getHeaders(),
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
    const response = await fetch(`${this.apiUrl}/agents`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        agentId: this.agentId,
        publicKey: this.keypair.publicKey.toString(),
        metadata: metadata || `agent_${this.agentId}_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Identity creation failed');
    }

    const data = await response.json();
    return data.identity || data;
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
