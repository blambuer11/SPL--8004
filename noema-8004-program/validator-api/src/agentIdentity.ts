/**
 * SPL-8004 Agent Identity Manager
 * 
 * Her autonomous agent için on-chain identity oluşturur ve yönetir
 */

import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, Wallet, BN } from '@coral-xyz/anchor';
import { IDL, Spl8004 } from './noema8004-idl.js';

const PROGRAM_ID = new PublicKey('G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW');
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const CONFIG_SEED = 'config';
const IDENTITY_SEED = 'identity';
const REPUTATION_SEED = 'reputation';

interface AgentIdentity {
  agentId: string;
  publicKey: string;
  identityPda: string;
  identityBump: number;
  createdAt: number;
  totalPayments: number;
  totalSpent: number;
  reputation: number;
}

interface AgentIdentityData {
  owner: PublicKey;
  identifier: string;
  totalValidations: number;
  successfulValidations: number;
  totalSpent: number; // in lamports or token amount
  createdAt: number;
  bump: number;
}

export class AgentIdentityManager {
  private connection: Connection;
  private identities: Map<string, AgentIdentity> = new Map();
  private program: Program<Spl8004> | null = null;

  constructor() {
    this.connection = new Connection(SOLANA_RPC, 'confirmed');
  }

  /**
   * Initialize Anchor program
   */
  private getProgram(wallet: Wallet): Program<Spl8004> {
    if (!this.program) {
      const provider = new AnchorProvider(
        this.connection,
        wallet,
        { commitment: 'confirmed' }
      );
      this.program = new Program<Spl8004>(IDL, provider);
    }
    return this.program;
  }

  /**
   * Find config PDA
   */
  findConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(CONFIG_SEED)],
      PROGRAM_ID
    );
  }

  /**
   * Find reputation PDA
   */
  findReputationPda(agentPublicKey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(REPUTATION_SEED),
        agentPublicKey.toBuffer(),
      ],
      PROGRAM_ID
    );
  }

  /**
   * Agent için SPL-8004 identity PDA hesapla
   */
  findIdentityPda(agentPublicKey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('agent_identity'),
        agentPublicKey.toBuffer(),
      ],
      PROGRAM_ID
    );
  }

  /**
   * Agent identity'sini on-chain'de oluştur
   */
  async createAgentIdentity(
    agentId: string,
    agentKeypair: Keypair,
    identifier: string
  ): Promise<AgentIdentity> {
    console.log(`🆔 Creating SPL-8004 identity for agent: ${agentId}`);

    const [identityPda, bump] = this.findIdentityPda(agentKeypair.publicKey);

    console.log(`📍 Identity PDA: ${identityPda.toString()}`);
    console.log(`📍 Bump: ${bump}`);

    // Identity zaten var mı kontrol et
    const existingAccount = await this.connection.getAccountInfo(identityPda);
    
    if (existingAccount) {
      console.log(`✅ Identity already exists on-chain for ${agentId}`);
      return this.fetchAgentIdentity(agentId, agentKeypair.publicKey);
    }

    // SPL-8004 program entegrasyonu
    console.log(`🔗 Registering agent identity on SPL-8004 program...`);
    
    try {
      // Create Anchor wallet from agent keypair
      const wallet: Wallet = {
        publicKey: agentKeypair.publicKey,
        signTransaction: async (tx) => {
          tx.sign(agentKeypair);
          return tx;
        },
        signAllTransactions: async (txs) => {
          txs.forEach(tx => tx.sign(agentKeypair));
          return txs;
        },
      };

      const program = this.getProgram(wallet);
      const [configPda] = this.findConfigPda();
      const [reputationPda] = this.findReputationPda(agentKeypair.publicKey);

      console.log(`📍 Config PDA: ${configPda.toString()}`);
      console.log(`📍 Reputation PDA: ${reputationPda.toString()}`);

      // Call register_agent instruction
      const tx = await program.methods
        .registerAgent(agentId, identifier)
        .accounts({
          identityRegistry: identityPda,
          reputationRegistry: reputationPda,
          owner: agentKeypair.publicKey,
          config: configPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([agentKeypair])
        .rpc();

      console.log(`✅ Agent registered on-chain! Tx: ${tx}`);
      console.log(`🔗 Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch (error: any) {
      console.error(`⚠️  On-chain registration failed:`, error.message);
      console.log(`💡 Continuing with off-chain identity...`);
      console.log(`📋 Agent data ready for manual on-chain registration:`);
      console.log(`   - Agent ID: ${agentId}`);
      console.log(`   - Public Key: ${agentKeypair.publicKey.toString()}`);
      console.log(`   - Identity PDA: ${identityPda.toString()}`);
      console.log(`   - Identifier: ${identifier}`);
    }

    const identity: AgentIdentity = {
      agentId,
      publicKey: agentKeypair.publicKey.toString(),
      identityPda: identityPda.toString(),
      identityBump: bump,
      createdAt: Date.now(),
      totalPayments: 0,
      totalSpent: 0,
      reputation: 100, // Starting reputation
    };

    this.identities.set(agentId, identity);
    console.log(`✅ Agent identity initialized: ${agentId}`);
    console.log(`💡 Next step: Integrate with SPL-8004 register_agent instruction`);

    return identity;
  }

  /**
   * Agent identity'sini blockchain'den fetch et
   */
  async fetchAgentIdentity(agentId: string, agentPublicKey: PublicKey): Promise<AgentIdentity> {
    const [identityPda, bump] = this.findIdentityPda(agentPublicKey);

    // Check cache first
    const cached = this.identities.get(agentId);
    if (cached) {
      return cached;
    }

    // Fetch from blockchain
    const accountInfo = await this.connection.getAccountInfo(identityPda);

    if (!accountInfo) {
      // Identity doesn't exist yet
      return {
        agentId,
        publicKey: agentPublicKey.toString(),
        identityPda: identityPda.toString(),
        identityBump: bump,
        createdAt: Date.now(),
        totalPayments: 0,
        totalSpent: 0,
        reputation: 100,
      };
    }

    // Parse on-chain data
    // TODO: Deserialize actual SPL-8004 account data
    const identity: AgentIdentity = {
      agentId,
      publicKey: agentPublicKey.toString(),
      identityPda: identityPda.toString(),
      identityBump: bump,
      createdAt: Date.now(),
      totalPayments: 0,
      totalSpent: 0,
      reputation: 100,
    };

    this.identities.set(agentId, identity);
    return identity;
  }

  /**
   * Agent payment yaptığında identity'yi güncelle
   */
  async recordPayment(
    agentId: string,
    amount: number,
    signature: string
  ): Promise<void> {
    const identity = this.identities.get(agentId);
    
    if (!identity) {
      console.warn(`⚠️  No identity found for agent: ${agentId}`);
      return;
    }

    // Update local cache
    identity.totalPayments += 1;
    identity.totalSpent += amount;
    
    // Update reputation based on successful payment
    identity.reputation = Math.min(1000, identity.reputation + 1);

    this.identities.set(agentId, identity);

    console.log(`📊 Updated identity for ${agentId}:`);
    console.log(`   Total Payments: ${identity.totalPayments}`);
    console.log(`   Total Spent: ${identity.totalSpent} USDC`);
    console.log(`   Reputation: ${identity.reputation}`);

    // TODO: Update on-chain identity via SPL-8004 program
  }

  /**
   * Agent identity bilgilerini getir
   */
  getIdentity(agentId: string): AgentIdentity | undefined {
    return this.identities.get(agentId);
  }

  /**
   * Tüm agent identity'lerini listele
   */
  listIdentities(): AgentIdentity[] {
    return Array.from(this.identities.values());
  }

  /**
   * Agent reputation'ını kontrol et
   */
  checkReputation(agentId: string): number {
    const identity = this.identities.get(agentId);
    return identity ? identity.reputation : 0;
  }

  /**
   * Agent'ın ödeme yapma yetkisi var mı?
   */
  canMakePayment(agentId: string, minReputation: number = 50): boolean {
    const reputation = this.checkReputation(agentId);
    return reputation >= minReputation;
  }
}

export const agentIdentityManager = new AgentIdentityManager();
