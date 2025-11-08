/**
 * SPL-TAP: Tool Attestation Protocol Client
 * Layer 2: Third-party attestations for agent security and performance
 */

import { Connection, PublicKey, SystemProgram, TransactionInstruction, Transaction } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { SPL_TAP_PROGRAM_ID } from "./spl-x-constants";
import bs58 from "bs58";

// PDA Seeds (must match Rust program exactly!)
const ATTESTATION_SEED = "attestation";
const ISSUER_SEED = "issuer";  // ✅ Fixed: was "attestor_registry"

export interface Attestation {
  agent: PublicKey;
  attestor: PublicKey;
  attestationType: string; // "security_audit" | "performance" | "compliance"
  score: number; // 0-100
  metadata: string; // URI to detailed report
  signature: Uint8Array; // Ed25519 signature
  timestamp: number;
  expiresAt: number;
  revoked: boolean;
}

export interface AttestorInfo {
  authority: PublicKey;
  name: string;
  reputation: number;
  totalAttestations: number;
  active: boolean;
}

export class SPLTAPClient {
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
  findAttestationPda(agentId: string, attestationType: string, issuer: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(ATTESTATION_SEED),
        Buffer.from(agentId),
        Buffer.from(attestationType),
        issuer.toBuffer()
      ],
      this.programId
    );
  }

  findIssuerPda(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(ISSUER_SEED),
        owner.toBuffer()
      ],
      this.programId
    );
  }

  // Get discriminator for instruction
  private async discriminator(name: string): Promise<Uint8Array> {
    const preimage = `global:${name}`;
    const encoded = new TextEncoder().encode(preimage);
    const hash = await crypto.subtle.digest("SHA-256", encoded as unknown as ArrayBuffer);
    return new Uint8Array(hash).slice(0, 8);
  }

  // Helper to find config PDA
  private findConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      this.programId
    );
  }

  // Register as attestor (requires 1 SOL stake)
  async registerAttestor(name: string, metadataUri: string = 'ipfs://placeholder'): Promise<string> {
    const [issuerPda] = this.findIssuerPda(this.wallet.publicKey);
    const [configPda] = this.findConfigPda();
    
    // Build instruction data using Anchor's IDL format
    // registerIssuer(issuerName: string, metadataUri: string)
    const issuerNameBytes = Buffer.from(name);
    const metadataUriBytes = Buffer.from(metadataUri);
    
    // Anchor format: discriminator + string length (4 bytes) + string data
    const data = Buffer.alloc(8 + 4 + issuerNameBytes.length + 4 + metadataUriBytes.length);
    let offset = 0;
    
    // Discriminator (8 bytes)
    const disc = await this.discriminator("registerIssuer");
    console.log('🔍 DEBUG - registerIssuer:');
    console.log('  Discriminator:', Buffer.from(disc).toString('hex'));
    console.log('  Name:', name, '(length:', issuerNameBytes.length, ')');
    console.log('  MetadataUri:', metadataUri, '(length:', metadataUriBytes.length, ')');
    
    data.set(disc, offset);
    offset += 8;
    
    // issuerName (4 byte length + data)
    data.writeUInt32LE(issuerNameBytes.length, offset);
    offset += 4;
    data.set(issuerNameBytes, offset);
    offset += issuerNameBytes.length;
    
    // metadataUri (4 byte length + data)
    data.writeUInt32LE(metadataUriBytes.length, offset);
    offset += 4;
    data.set(metadataUriBytes, offset);
    
    console.log('  Total data length:', data.length);
    console.log('  Data hex:', data.toString('hex'));
    console.log('  Issuer PDA:', issuerPda.toBase58());
    console.log('  Config PDA:', configPda.toBase58());

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: issuerPda, isSigner: false, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    return await this.sendTransaction([ix]);
  }

  // Issue attestation for an agent
  async issueAttestation(
    agentId: string,
    attestationType: string,
    score: number,
    metadataUri: string,
    validityDays: number = 90
  ): Promise<string> {
    const [attestationPda] = this.findAttestationPda(agentId, attestationType, this.wallet.publicKey);
    const [attestorPda] = this.findIssuerPda(this.wallet.publicKey);

    // Create signature payload
    const message = `${agentId}_${attestationType}_${score}_${Date.now()}`;
    const messageBytes = new TextEncoder().encode(message);
    
    // In production, use proper Ed25519 signing
    const signature = new Uint8Array(64).fill(0); // Placeholder

    // Use camelCase for Anchor instruction names
    const disc = await this.discriminator("issueAttestation");
    const typeBytes = new TextEncoder().encode(attestationType);
    const uriBytes = new TextEncoder().encode(metadataUri);
    
    const data = new Uint8Array([
      ...disc,
      typeBytes.length, ...typeBytes,
      score,
      uriBytes.length, ...uriBytes,
      ...signature,
      ...new Uint8Array(new BigInt64Array([BigInt(validityDays)]).buffer)
    ]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: attestationPda, isSigner: false, isWritable: true },
        { pubkey: attestorPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return await this.sendTransaction([ix]);
  }

  // Revoke attestation
  async revokeAttestation(agentId: string, attestationType: string): Promise<string> {
    const [attestationPda] = this.findAttestationPda(agentId, attestationType, this.wallet.publicKey);

    // Use camelCase for Anchor instruction names
    const disc = await this.discriminator("revokeAttestation");
    
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: attestationPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
      ],
      data: Buffer.from(disc),
    });

    return await this.sendTransaction([ix]);
  }

  // Fetch attestation
  async getAttestation(agentId: string, attestationType: string, attestor: PublicKey): Promise<Attestation | null> {
    const [attestationPda] = this.findAttestationPda(agentId, attestationType, attestor);
    
    try {
      const accountInfo = await this.connection.getAccountInfo(attestationPda);
      if (!accountInfo) return null;

      // Parse account data (simplified - actual parsing depends on on-chain layout)
      const data = accountInfo.data;
      
      return {
        agent: attestor, // Placeholder
        attestor: attestor,
        attestationType: attestationType,
        score: data[8] || 0,
        metadata: "",
        signature: new Uint8Array(64),
        timestamp: Date.now(),
        expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000,
        revoked: false,
      };
    } catch (e) {
      console.error("Error fetching attestation:", e);
      return null;
    }
  }

  // Get all attestations for an agent
  async getAgentAttestations(agentPubkey: PublicKey): Promise<Attestation[]> {
    // In production, use getProgramAccounts with filters
    // For now, return mock data
    return [];
  }

  // Get attestor info
  async getAttestorInfo(attestor: PublicKey): Promise<AttestorInfo | null> {
    const [attestorPda] = this.findIssuerPda(attestor);
    
    try {
      const accountInfo = await this.connection.getAccountInfo(attestorPda);
      if (!accountInfo) return null;

      return {
        authority: attestor,
        name: "CertiK", // Parse from data
        reputation: 95,
        totalAttestations: 0,
        active: true,
      };
    } catch (e) {
      console.error("Error fetching attestor info:", e);
      return null;
    }
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
