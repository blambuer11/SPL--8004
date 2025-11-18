import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import type { 
  SDKConfig, 
  AgentAccount, 
  RegisterAgentParams, 
  UpdateAgentParams,
  PaymentParams,
  PaymentResult,
  NetworkType 
} from './types';
import { findAgentPda, usdcToBaseUnits } from './utils';
import { PROGRAM_IDS, RPC_ENDPOINTS } from './constants';

export class SPL8004SDK {
  connection: Connection;
  wallet: Keypair;
  programId: PublicKey;
  network: NetworkType;

  constructor(config: SDKConfig) {
    this.connection = config.connection;
    this.wallet = config.wallet;
    this.programId = config.programId;
    this.network = config.network || 'devnet';
  }

  /**
   * Create SDK instance with default config
   */
  static create(wallet: Keypair, network: NetworkType = 'devnet'): SPL8004SDK {
    const connection = new Connection(RPC_ENDPOINTS[network], 'confirmed');
    const programId = PROGRAM_IDS[network];
    
    return new SPL8004SDK({
      connection,
      wallet,
      programId,
      network
    });
  }

  /**
   * Register a new agent
   */
  async registerAgent(params: RegisterAgentParams): Promise<{ pda: PublicKey; signature: string }> {
    const [agentPda] = await findAgentPda(params.agentId, this.programId);
    
    // In real implementation, this would build and send the transaction
    // For now, return mock data
    return {
      pda: agentPda,
      signature: 'mock-signature-' + Date.now()
    };
  }

  /**
   * Get agent account by PDA
   */
  async getAgent(agentPda: PublicKey): Promise<AgentAccount | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(agentPda);
      if (!accountInfo) return null;

      // Parse account data (simplified)
      return {
        pda: agentPda,
        agentId: 'parsed-agent-id',
        owner: this.wallet.publicKey,
        metadataUri: 'https://example.com/metadata.json',
        reputation: 1000,
        totalTransactions: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    } catch (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
  }

  /**
   * Get agent by ID
   */
  async getAgentById(agentId: string): Promise<AgentAccount | null> {
    const [agentPda] = await findAgentPda(agentId, this.programId);
    return this.getAgent(agentPda);
  }

  /**
   * Update agent metadata
   */
  async updateAgent(params: UpdateAgentParams): Promise<{ signature: string }> {
    // Build and send update transaction
    return {
      signature: 'mock-update-signature-' + Date.now()
    };
  }

  /**
   * Create payment
   */
  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    const recipientPubkey = typeof params.recipient === 'string' 
      ? new PublicKey(params.recipient)
      : params.recipient;

    const baseUnits = usdcToBaseUnits(params.amount);
    
    // Build and send payment transaction
    return {
      signature: 'mock-payment-signature-' + Date.now(),
      fee: params.amount * 0.005,
      timestamp: Date.now()
    };
  }

  /**
   * Get wallet balance (SOL)
   */
  async getBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    return balance / 1_000_000_000; // Convert to SOL
  }
}
