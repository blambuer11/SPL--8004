import 'dotenv/config';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Agent Wallet Manager
 * Manages agent keypairs for autonomous payments
 */

export class AgentWallet {
  private agentKeypairs: Map<string, Keypair> = new Map();

  constructor() {
    this.loadAgentKeypairs();
  }

  /**
   * Load agent keypairs from environment
   * Format: AGENT_<NAME>_KEY=base58_private_key
   */
  private loadAgentKeypairs() {
    const agentKeys = Object.keys(process.env).filter(key => 
      key.startsWith('AGENT_') && key.endsWith('_KEY')
    );

    for (const envKey of agentKeys) {
      const agentId = envKey
        .replace('AGENT_', '')
        .replace('_KEY', '')
        .toLowerCase();

      const privateKeyBase58 = process.env[envKey];
      if (!privateKeyBase58) continue;

      try {
        const privateKeyBytes = bs58.decode(privateKeyBase58);
        const keypair = Keypair.fromSecretKey(privateKeyBytes);
        this.agentKeypairs.set(agentId, keypair);
        console.log(`✅ Loaded agent keypair: ${agentId} (${keypair.publicKey.toBase58()})`);
      } catch (error) {
        console.error(`❌ Failed to load agent keypair for ${agentId}:`, error);
      }
    }

    if (this.agentKeypairs.size === 0) {
      console.warn('⚠️  No agent keypairs loaded. Set AGENT_<NAME>_KEY in .env');
    }
  }

  /**
   * Get keypair for specific agent
   */
  getKeypair(agentId: string): Keypair | undefined {
    return this.agentKeypairs.get(agentId.toLowerCase());
  }

  /**
   * Check if agent keypair exists
   */
  hasKeypair(agentId: string): boolean {
    return this.agentKeypairs.has(agentId.toLowerCase());
  }

  /**
   * List all loaded agent IDs
   */
  listAgents(): string[] {
    return Array.from(this.agentKeypairs.keys());
  }

  /**
   * Get agent public key
   */
  getPublicKey(agentId: string): string | undefined {
    const keypair = this.getKeypair(agentId);
    return keypair?.publicKey.toBase58();
  }
}
