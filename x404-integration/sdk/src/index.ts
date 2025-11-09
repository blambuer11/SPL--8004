import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  Program,
  AnchorProvider,
  Wallet,
  BN,
  web3,
} from '@coral-xyz/anchor';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import Arweave from 'arweave';
import bs58 from 'bs58';

/**
 * SPL-8004 Client Interface (simplified)
 */
export interface SPL8004Client {
  getAgent(agentId: string): Promise<AgentData>;
  onReputationUpdate(agentId: string, callback: (newScore: number) => void): void;
  transferOwnership(agentId: string, newOwner: PublicKey, proof: Buffer): Promise<string>;
}

export interface AgentData {
  agentId: string;
  owner: PublicKey;
  reputationScore: number;
  validationCount: number;
  successRate: number;
  description: string;
  avatarUrl: string;
  createdAt: number;
}

export interface AgentMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: number | string;
  }>;
  properties: {
    agent_id: string;
    created_at: number;
    protocol: string;
  };
}

export interface AgentNFTData {
  agentId: PublicKey;
  owner: PublicKey;
  mint: PublicKey;
  reputationScore: number;
  metadataUri: string;
  createdAt: number;
  lastSync: number;
  floorPrice: BN;
  totalVolume: BN;
  isListed: boolean;
  listPrice: BN;
}

/**
 * X404 Bridge SDK
 * Connects SPL-8004 agents with X404 NFT marketplace
 */
export class X404Bridge {
  private x404ProgramId: PublicKey;
  private arweave: Arweave;
  private statePDA: PublicKey;
  private stateBump: number;

  constructor(
    private connection: Connection,
    private program: Program,
    private spl8004Client: SPL8004Client,
    private wallet: Wallet,
    arweaveConfig?: any
  ) {
    this.x404ProgramId = program.programId;
    
    // Initialize Arweave
    this.arweave = Arweave.init(arweaveConfig || {
      host: 'arweave.net',
      port: 443,
      protocol: 'https',
    });

    // Derive state PDA
    const [pda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('state')],
      this.x404ProgramId
    );
    this.statePDA = pda;
    this.stateBump = bump;
  }

  /**
   * Initialize X404 program (admin only)
   */
  async initialize(): Promise<string> {
    const tx = await this.program.methods
      .initialize()
      .accounts({
        state: this.statePDA,
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('X404 Program initialized:', tx);
    return tx;
  }

  /**
   * Upload metadata to Arweave
   */
  async uploadMetadata(metadata: AgentMetadata): Promise<string> {
    try {
      const data = JSON.stringify(metadata);
      const transaction = await this.arweave.createTransaction({ data });
      
      transaction.addTag('Content-Type', 'application/json');
      transaction.addTag('App-Name', 'Noema-X404');
      transaction.addTag('Agent-ID', metadata.properties.agent_id);
      
      // Note: In production, you need to sign with Arweave wallet
      // For now, we'll return a mock URI
      const mockUri = `https://arweave.net/${bs58.encode(Buffer.from(data)).slice(0, 43)}`;
      console.log('Metadata uploaded (mock):', mockUri);
      return mockUri;
    } catch (error) {
      console.error('Arweave upload failed:', error);
      // Fallback to data URI
      const dataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;
      return dataUri;
    }
  }

  /**
   * Tokenize an existing SPL-8004 agent into X404 NFT
   */
  async tokenizeAgent(agentId: string): Promise<PublicKey> {
    console.log(`Tokenizing agent: ${agentId}`);

    // 1. Get agent data from SPL-8004
    const agent = await this.spl8004Client.getAgent(agentId);
    console.log(`Agent reputation: ${agent.reputationScore}`);

    // 2. Prepare metadata
    const metadata: AgentMetadata = {
      name: `Noema Agent #${agentId.slice(0, 8)}`,
      description: agent.description || 'AI Agent on Solana',
      image: agent.avatarUrl || 'https://via.placeholder.com/400',
      attributes: [
        { trait_type: 'Reputation Score', value: agent.reputationScore },
        { trait_type: 'Total Validations', value: agent.validationCount },
        { trait_type: 'Success Rate', value: `${agent.successRate}%` },
        { trait_type: 'Network', value: 'Solana Devnet' },
      ],
      properties: {
        agent_id: agentId,
        created_at: agent.createdAt,
        protocol: 'SPL-8004',
      },
    };

    // 3. Upload to Arweave
    const metadataUri = await this.uploadMetadata(metadata);
    console.log(`Metadata URI: ${metadataUri}`);

    // 4. Derive PDAs
    const agentIdPubkey = new PublicKey(agentId);
    const [agentNftPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('agent_nft'), agentIdPubkey.toBuffer()],
      this.x404ProgramId
    );
    const [mintPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint'), agentIdPubkey.toBuffer()],
      this.x404ProgramId
    );
    const tokenAccount = await getAssociatedTokenAddress(
      mintPDA,
      this.wallet.publicKey
    );

    // 5. Mint NFT on X404
    try {
      const tx = await this.program.methods
        .mintAgentNft(agentIdPubkey, metadataUri, agent.reputationScore)
        .accounts({
          agentNft: agentNftPDA,
          mint: mintPDA,
          tokenAccount,
          state: this.statePDA,
          owner: this.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log(`NFT minted: ${mintPDA.toBase58()}`);
      console.log(`Transaction: ${tx}`);

      // 6. Store mapping locally (or in a database)
      await this.storePDAMapping(agentId, mintPDA);

      return mintPDA;
    } catch (error) {
      console.error('Minting failed:', error);
      throw error;
    }
  }

  /**
   * Sync reputation from SPL-8004 to X404
   */
  async syncReputation(agentId: string): Promise<string> {
    console.log(`Syncing reputation for agent: ${agentId}`);

    const agent = await this.spl8004Client.getAgent(agentId);
    const agentIdPubkey = new PublicKey(agentId);
    const [agentNftPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('agent_nft'), agentIdPubkey.toBuffer()],
      this.x404ProgramId
    );

    const tx = await this.program.methods
      .updateReputation(agent.reputationScore)
      .accounts({
        agentNft: agentNftPDA,
        state: this.statePDA,
        oracle: this.wallet.publicKey,
      })
      .rpc();

    console.log(`Reputation synced: ${agent.reputationScore}`);
    console.log(`Transaction: ${tx}`);
    return tx;
  }

  /**
   * List NFT for sale
   */
  async listForSale(agentId: string, priceInSol: number): Promise<string> {
    const agentIdPubkey = new PublicKey(agentId);
    const [agentNftPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('agent_nft'), agentIdPubkey.toBuffer()],
      this.x404ProgramId
    );

    const priceInLamports = priceInSol * LAMPORTS_PER_SOL;

    const tx = await this.program.methods
      .listForSale(new BN(priceInLamports))
      .accounts({
        agentNft: agentNftPDA,
        owner: this.wallet.publicKey,
      })
      .rpc();

    console.log(`NFT listed for ${priceInSol} SOL`);
    return tx;
  }

  /**
   * Delist NFT from sale
   */
  async delist(agentId: string): Promise<string> {
    const agentIdPubkey = new PublicKey(agentId);
    const [agentNftPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('agent_nft'), agentIdPubkey.toBuffer()],
      this.x404ProgramId
    );

    const tx = await this.program.methods
      .delist()
      .accounts({
        agentNft: agentNftPDA,
        owner: this.wallet.publicKey,
      })
      .rpc();

    console.log('NFT delisted');
    return tx;
  }

  /**
   * Purchase a listed NFT
   */
  async purchase(agentId: string): Promise<string> {
    const agentIdPubkey = new PublicKey(agentId);
    const [agentNftPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('agent_nft'), agentIdPubkey.toBuffer()],
      this.x404ProgramId
    );

    // Fetch agent NFT data
    const agentNftData = await this.program.account.agentNft.fetch(agentNftPDA);
    const seller = agentNftData.owner;
    const mint = agentNftData.mint;

    const sellerTokenAccount = await getAssociatedTokenAddress(mint, seller);
    const buyerTokenAccount = await getAssociatedTokenAddress(
      mint,
      this.wallet.publicKey
    );

    const tx = await this.program.methods
      .purchase()
      .accounts({
        agentNft: agentNftPDA,
        state: this.statePDA,
        buyer: this.wallet.publicKey,
        seller,
        sellerTokenAccount,
        buyerTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(`NFT purchased: ${tx}`);
    return tx;
  }

  /**
   * Get agent NFT data
   */
  async getAgentNFT(agentId: string): Promise<AgentNFTData> {
    const agentIdPubkey = new PublicKey(agentId);
    const [agentNftPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('agent_nft'), agentIdPubkey.toBuffer()],
      this.x404ProgramId
    );

    const data = await this.program.account.agentNft.fetch(agentNftPDA);
    return data as AgentNFTData;
  }

  /**
   * Get all listed NFTs
   */
  async getListedNFTs(): Promise<AgentNFTData[]> {
    const accounts = await this.program.account.agentNft.all([
      {
        memcmp: {
          offset: 8 + 32 + 32 + 32 + 4 + 200 + 8 + 8 + 8 + 8, // Skip to is_listed field
          bytes: bs58.encode(Buffer.from([1])), // is_listed = true
        },
      },
    ]);

    return accounts.map((acc) => acc.account as AgentNFTData);
  }

  /**
   * Get agent valuation based on reputation
   */
  getAgentValuation(reputationScore: number, basePriceSol: number = 1): number {
    // Formula: base * (1 + reputation/10000)
    return basePriceSol * (1 + reputationScore / 10000);
  }

  /**
   * Start reputation oracle (background sync)
   */
  startReputationOracle(agentIds: string[]): void {
    console.log('Starting reputation oracle...');

    agentIds.forEach((agentId) => {
      this.spl8004Client.onReputationUpdate(agentId, async (newScore) => {
        console.log(`[Oracle] Reputation update detected: ${agentId} → ${newScore}`);
        try {
          await this.syncReputation(agentId);
        } catch (error) {
          console.error(`[Oracle] Sync failed for ${agentId}:`, error);
        }
      });
    });
  }

  /**
   * Store PDA mapping (implement with your storage solution)
   */
  private async storePDAMapping(agentId: string, nftMint: PublicKey): Promise<void> {
    // TODO: Implement with database or local storage
    console.log(`Stored mapping: ${agentId} → ${nftMint.toBase58()}`);
  }

  /**
   * Get NFT mint for agent ID
   */
  async getNFTMintForAgent(agentId: string): Promise<PublicKey> {
    const agentIdPubkey = new PublicKey(agentId);
    const [mintPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint'), agentIdPubkey.toBuffer()],
      this.x404ProgramId
    );
    return mintPDA;
  }

  /**
   * Update oracle authority (admin only)
   */
  async updateOracle(newOracle: PublicKey): Promise<string> {
    const tx = await this.program.methods
      .updateOracle(newOracle)
      .accounts({
        state: this.statePDA,
        authority: this.wallet.publicKey,
      })
      .rpc();

    console.log(`Oracle updated to: ${newOracle.toBase58()}`);
    return tx;
  }
}

export * from './types';
