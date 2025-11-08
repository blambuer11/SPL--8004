/**
 * SPL-ACP: Agent Capability Protocol Client
 * Layer 5: Skill declaration, discovery, and compatibility matching
 */

import { Connection, PublicKey, SystemProgram, TransactionInstruction, Transaction } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { SPL_ACP_PROGRAM_ID } from "./spl-x-constants";

// PDA Seeds
const CAPABILITY_SEED = "capability";
const CAPABILITY_REGISTRY_SEED = "capability_registry";

export interface Capability {
  agent: PublicKey;
  skillId: string;
  name: string;
  version: string; // Semantic versioning (e.g., "1.2.0")
  category: string; // "computation" | "data_processing" | "ml_inference" | "api_access"
  description: string;
  inputSchema: string; // JSON Schema
  outputSchema: string; // JSON Schema
  pricing: number; // Cost per invocation (in USDC micro-units)
  endpoint: string; // API endpoint or execution method
  performance: PerformanceMetrics;
  compatibility: string[]; // Compatible protocols/standards
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PerformanceMetrics {
  avgLatencyMs: number;
  successRate: number; // 0-100
  totalCalls: number;
  lastCallAt: number;
}

export interface CapabilitySearch {
  category?: string;
  minSuccessRate?: number;
  maxLatencyMs?: number;
  maxPricing?: number;
  compatibleWith?: string;
}

export class SPLACPClient {
  private connection: Connection;
  private wallet: AnchorWallet;
  private provider: AnchorProvider;
  private programId: PublicKey;

  constructor(connection: Connection, wallet: AnchorWallet, programId: PublicKey) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = programId;
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
  }

  // PDA Finders
  findCapabilityPda(agentId: string, capabilityType: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(CAPABILITY_SEED),
        Buffer.from(agentId),
        Buffer.from(capabilityType)
      ],
      this.programId
    );
  }

  findCapabilityRegistryPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(CAPABILITY_REGISTRY_SEED)],
      this.programId
    );
  }

  // Get discriminator
  private async discriminator(name: string): Promise<Uint8Array> {
    const preimage = `global:${name}`;
    const encoded = new TextEncoder().encode(preimage);
    const hash = await crypto.subtle.digest("SHA-256", encoded as unknown as ArrayBuffer);
    return new Uint8Array(hash).slice(0, 8);
  }

  // Register capability
  // Helper to find config PDA
  private findConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      this.programId
    );
  }

  async registerCapability(
    agentId: string,
    capabilityType: string,
    version: string,
    metadataUri: string
  ): Promise<string> {
    const [capabilityPda] = this.findCapabilityPda(agentId, capabilityType);
    const [configPda] = this.findConfigPda();

    // Build instruction data using Anchor's IDL format
    // declareCapability(agentId: string, capabilityType: string, version: string, metadataUri: string)
    const agentIdBytes = Buffer.from(agentId);
    const typeBytes = Buffer.from(capabilityType);
    const versionBytes = Buffer.from(version);
    const uriBytes = Buffer.from(metadataUri);
    
    // Anchor format: discriminator + string length (4 bytes) + string data
    const data = Buffer.alloc(8 + 4 + agentIdBytes.length + 4 + typeBytes.length + 4 + versionBytes.length + 4 + uriBytes.length);
    let offset = 0;
    
    // Discriminator (8 bytes)
    const disc = await this.discriminator("declareCapability");
    data.set(disc, offset);
    offset += 8;
    
    // agentId (4 byte length + data)
    data.writeUInt32LE(agentIdBytes.length, offset);
    offset += 4;
    data.set(agentIdBytes, offset);
    offset += agentIdBytes.length;
    
    // capabilityType (4 byte length + data)
    data.writeUInt32LE(typeBytes.length, offset);
    offset += 4;
    data.set(typeBytes, offset);
    offset += typeBytes.length;
    
    // version (4 byte length + data)
    data.writeUInt32LE(versionBytes.length, offset);
    offset += 4;
    data.set(versionBytes, offset);
    offset += versionBytes.length;
    
    // metadataUri (4 byte length + data)
    data.writeUInt32LE(uriBytes.length, offset);
    offset += 4;
    data.set(uriBytes, offset);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: capabilityPda, isSigner: false, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    return await this.sendTransaction([ix]);
  }

  // Update capability performance
  async updatePerformance(
    agentId: string,
    capabilityType: string,
    latencyMs: number,
    success: boolean
  ): Promise<string> {
    const [capabilityPda] = this.findCapabilityPda(agentId, capabilityType);

    // CRITICAL: Must match IDL instruction name exactly
    const disc = await this.discriminator("updateCapability");
    const agentIdBytes = new TextEncoder().encode(agentId);
    const typeBytes = new TextEncoder().encode(capabilityType);
    const latencyBytes = new Uint8Array(new Uint32Array([latencyMs]).buffer);
    const successByte = success ? 1 : 0;
    
    const data = new Uint8Array([
      ...disc,
      agentIdBytes.length, ...agentIdBytes,
      typeBytes.length, ...typeBytes,
      ...latencyBytes,
      successByte
    ]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: capabilityPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return await this.sendTransaction([ix]);
  }

  // Deactivate capability
  async deactivateCapability(agentId: string, capabilityType: string): Promise<string> {
    const [capabilityPda] = this.findCapabilityPda(agentId, capabilityType);

    // CRITICAL: Must match IDL instruction name exactly
    const disc = await this.discriminator("revokeCapability");
    const agentIdBytes = new TextEncoder().encode(agentId);
    const typeBytes = new TextEncoder().encode(capabilityType);
    
    const data = new Uint8Array([
      ...disc,
      agentIdBytes.length, ...agentIdBytes,
      typeBytes.length, ...typeBytes
    ]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: capabilityPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return await this.sendTransaction([ix]);
  }

  // Get capability
  async getCapability(agentId: string, capabilityType: string): Promise<Capability | null> {
    const [capabilityPda] = this.findCapabilityPda(agentId, capabilityType);
    
    try {
      const accountInfo = await this.connection.getAccountInfo(capabilityPda);
      if (!accountInfo) return null;

      // Parse account data (simplified)
      return {
        agent: this.wallet.publicKey,
        skillId: capabilityType,
        name: "Example Capability",
        version: "1.0.0",
        category: "computation",
        description: "Example capability description",
        inputSchema: "{}",
        outputSchema: "{}",
        pricing: 100,
        endpoint: "https://api.example.com",
        performance: {
          avgLatencyMs: 150,
          successRate: 98.5,
          totalCalls: 1000,
          lastCallAt: Date.now(),
        },
        compatibility: ["x402", "spl-8004"],
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } catch (e) {
      console.error("Error fetching capability:", e);
      return null;
    }
  }

  // Search capabilities (mock implementation)
  async searchCapabilities(filters: CapabilitySearch): Promise<Capability[]> {
    // In production, use getProgramAccounts with filters
    // For now, return mock data
    return [];
  }

  // Get all capabilities for an agent
  async getAgentCapabilities(agent: PublicKey): Promise<Capability[]> {
    // In production, use getProgramAccounts
    return [];
  }

  // Helper: Send transaction
  private async sendTransaction(instructions: TransactionInstruction[]): Promise<string> {
    const { blockhash } = await this.connection.getLatestBlockhash();
    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.wallet.publicKey;
    instructions.forEach((ix) => transaction.add(ix));
    
    const signedTx = await this.wallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(signedTx.serialize());
    await this.connection.confirmTransaction(signature, "confirmed");
    
    return signature;
  }
}
