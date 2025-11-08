/**
 * SPL-FCP: Finality Consensus Protocol Client
 * Layer 3: Multi-validator Byzantine Fault Tolerant consensus
 */

import { Connection, PublicKey, SystemProgram, TransactionInstruction, Transaction } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { SPL_FCP_PROGRAM_ID } from "./spl-x-constants";

// PDA Seeds
// PDA Seeds (must match Rust program exactly!)
const CONSENSUS_SEED = "consensus";  // ✅ Fixed: was "consensus_session"
const VALIDATOR_SEED = "validator";  // ✅ Fixed: was "validator_registry"
const VOTE_SEED = "vote";

export interface ConsensusSession {
  sessionId: string;
  proposer: PublicKey;
  proposalHash: Uint8Array; // SHA-256 of proposal data
  threshold: number; // Required votes (e.g., 3 out of 5)
  totalValidators: number;
  votesFor: number;
  votesAgainst: number;
  status: "pending" | "approved" | "rejected" | "expired";
  createdAt: number;
  expiresAt: number;
}

export interface ValidatorInfo {
  authority: PublicKey;
  reputation: number;
  totalVotes: number;
  correctVotes: number;
  active: boolean;
  stake: number; // Locked SOL
}

export interface Vote {
  validator: PublicKey;
  sessionId: string;
  decision: boolean; // true = approve, false = reject
  timestamp: number;
  signature: Uint8Array;
}

export class SPLFCPClient {
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
  findConsensusSessionPda(sessionId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(CONSENSUS_SEED),
        Buffer.from(sessionId)
      ],
      this.programId
    );
  }

  findValidatorRegistryPda(validator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(VALIDATOR_SEED),
        validator.toBuffer()
      ],
      this.programId
    );
  }

  findVotePda(sessionId: string, validator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(VOTE_SEED),
        Buffer.from(sessionId),
        validator.toBuffer()
      ],
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

  // Helper to find config PDA
  private findConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      this.programId
    );
  }

  // Register as validator (requires stake)
  async registerValidator(validatorName: string = 'Validator', metadataUri: string = 'ipfs://placeholder'): Promise<string> {
    const [validatorPda] = this.findValidatorRegistryPda(this.wallet.publicKey);
    const [configPda] = this.findConfigPda();
    
    // Build instruction data using Anchor's IDL format
    // registerValidator(validatorName: string, metadataUri: string)
    const nameBytes = Buffer.from(validatorName);
    const uriBytes = Buffer.from(metadataUri);
    
    // Anchor format: discriminator + string length (4 bytes) + string data
    const data = Buffer.alloc(8 + 4 + nameBytes.length + 4 + uriBytes.length);
    let offset = 0;
    
    // Discriminator (8 bytes)
    const disc = await this.discriminator("registerValidator");
    console.log('🔍 DEBUG - registerValidator:');
    console.log('  Discriminator:', Buffer.from(disc).toString('hex'));
    console.log('  ValidatorName:', validatorName, '(length:', nameBytes.length, ')');
    console.log('  MetadataUri:', metadataUri, '(length:', uriBytes.length, ')');
    
    data.set(disc, offset);
    offset += 8;
    
    // validatorName (4 byte length + data)
    data.writeUInt32LE(nameBytes.length, offset);
    offset += 4;
    data.set(nameBytes, offset);
    offset += nameBytes.length;
    
    // metadataUri (4 byte length + data)
    data.writeUInt32LE(uriBytes.length, offset);
    offset += 4;
    data.set(uriBytes, offset);
    
    console.log('  Total data length:', data.length);
    console.log('  Data hex:', data.toString('hex'));
    console.log('  Validator PDA:', validatorPda.toBase58());
    console.log('  Config PDA:', configPda.toBase58());

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: validatorPda, isSigner: false, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    return await this.sendTransaction([ix]);
  }

  // Create consensus session
  async createConsensusSession(
    sessionId: string,
    proposalData: string,
    threshold: number,
    validators: PublicKey[],
    validityMinutes: number = 60
  ): Promise<string> {
    const [sessionPda] = this.findConsensusSessionPda(sessionId);

    // Hash proposal
    const proposalEncoded = new TextEncoder().encode(proposalData);
    const proposalHash = await crypto.subtle.digest("SHA-256", proposalEncoded as unknown as ArrayBuffer);

    // CRITICAL: Must match IDL instruction name exactly
    const disc = await this.discriminator("requestConsensus");
    const sessionIdBytes = new TextEncoder().encode(sessionId);
    
    const data = new Uint8Array([
      ...disc,
      sessionIdBytes.length, ...sessionIdBytes,
      ...new Uint8Array(proposalHash),
      threshold,
      validators.length,
      ...new Uint8Array(new BigInt64Array([BigInt(validityMinutes)]).buffer)
    ]);

    const keys = [
      { pubkey: sessionPda, isSigner: false, isWritable: true },
      { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    // Add validator accounts
    validators.forEach(v => {
      const [validatorPda] = this.findValidatorRegistryPda(v);
      keys.push({ pubkey: validatorPda, isSigner: false, isWritable: false });
    });

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys,
      data: Buffer.from(data),
    });

    return await this.sendTransaction([ix]);
  }

  // Submit vote
  async submitVote(sessionId: string, approve: boolean): Promise<string> {
    const [sessionPda] = this.findConsensusSessionPda(sessionId);
    const [validatorPda] = this.findValidatorRegistryPda(this.wallet.publicKey);
    const [votePda] = this.findVotePda(sessionId, this.wallet.publicKey);

    // CRITICAL: Must match IDL instruction name exactly
    const disc = await this.discriminator("castVote");
    const sessionIdBytes = new TextEncoder().encode(sessionId);
    const voteValue = approve ? 1 : 0;
    
    const data = new Uint8Array([
      ...disc,
      sessionIdBytes.length, ...sessionIdBytes,
      voteValue
    ]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: sessionPda, isSigner: false, isWritable: true },
        { pubkey: votePda, isSigner: false, isWritable: true },
        { pubkey: validatorPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return await this.sendTransaction([ix]);
  }

  // Finalize consensus (after threshold reached)
  async finalizeConsensus(sessionId: string): Promise<string> {
    const [sessionPda] = this.findConsensusSessionPda(sessionId);

    // Use camelCase for Anchor instruction names
    const disc = await this.discriminator("finalizeConsensus");
    const sessionIdBytes = new TextEncoder().encode(sessionId);
    
    const data = new Uint8Array([
      ...disc,
      sessionIdBytes.length, ...sessionIdBytes
    ]);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: sessionPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return await this.sendTransaction([ix]);
  }

  // Get consensus session
  async getConsensusSession(sessionId: string): Promise<ConsensusSession | null> {
    const [sessionPda] = this.findConsensusSessionPda(sessionId);
    
    try {
      const accountInfo = await this.connection.getAccountInfo(sessionPda);
      if (!accountInfo) return null;

      const data = accountInfo.data;
      
      return {
        sessionId,
        proposer: this.wallet.publicKey,
        proposalHash: new Uint8Array(32),
        threshold: data[8] || 3,
        totalValidators: data[9] || 5,
        votesFor: data[10] || 0,
        votesAgainst: data[11] || 0,
        status: "pending",
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * 60 * 1000,
      };
    } catch (e) {
      console.error("Error fetching consensus session:", e);
      return null;
    }
  }

  // Get validator info
  async getValidatorInfo(validator: PublicKey): Promise<ValidatorInfo | null> {
    const [validatorPda] = this.findValidatorRegistryPda(validator);
    
    try {
      const accountInfo = await this.connection.getAccountInfo(validatorPda);
      if (!accountInfo) return null;

      return {
        authority: validator,
        reputation: 95,
        totalVotes: 0,
        correctVotes: 0,
        active: true,
        stake: 1000000000, // 1 SOL
      };
    } catch (e) {
      console.error("Error fetching validator info:", e);
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
