import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { MPL_TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import BN from 'bn.js';

const X404_PROGRAM_ID = new PublicKey('ESEbyYMdhKUQ3h5AyqPwLhvkPhaMgugt3dRd3NXxUsH9');

export class X404Bridge {
  constructor(
    private connection: Connection,
    private program: Program,
    private spl8004Client: any,
    private wallet: Wallet
  ) {}

  /**
   * Get config PDA
   */
  getConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      X404_PROGRAM_ID
    );
  }

  /**
   * Get agent NFT PDA
   */
  getAgentNFTPDA(agentId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('agent_nft'), agentId.toBuffer()],
      X404_PROGRAM_ID
    );
  }

  /**
   * Get listing PDA
   */
  getListingPDA(agentId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), agentId.toBuffer()],
      X404_PROGRAM_ID
    );
  }

  /**
   * Get metadata PDA (Metaplex)
   */
  getMetadataPDA(mint: PublicKey): PublicKey {
    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      MPL_TOKEN_METADATA_PROGRAM_ID
    );
    return metadata;
  }

  /**
   * Initialize X404 bridge
   */
  async initialize(
    authority: PublicKey,
    treasury: PublicKey,
    platformFeeBps: number = 250,
    basePriceLamports: BN = new BN(1_000_000_000) // 1 SOL
  ): Promise<string> {
    const [config] = this.getConfigPDA();

    const tx = await this.program.methods
      .initialize(authority, treasury, platformFeeBps, basePriceLamports)
      .accounts({
        config,
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('X404 Bridge initialized:', tx);
    return tx;
  }

  /**
   * Tokenize SPL-8004 agent as NFT
   */
  async tokenizeAgent(
    agentId: string,
    name: string = 'Noema Agent NFT',
    symbol: string = 'NAGENT',
    uri: string = 'https://arweave.net/...'
  ): Promise<PublicKey> {
    const agentPubkey = new PublicKey(agentId);
    const [config] = this.getConfigPDA();
    const [agentNFT] = this.getAgentNFTPDA(agentPubkey);
    
    const nftMint = Keypair.generate();
    const metadataAccount = this.getMetadataPDA(nftMint.publicKey);
    
    const tokenAccount = await getAssociatedTokenAddress(
      nftMint.publicKey,
      this.wallet.publicKey
    );

    // Get SPL-8004 identity account
    const spl8004Identity = await this.spl8004Client.getAgentPDA(agentId);

    const tx = await this.program.methods
      .tokenizeAgent(agentPubkey, name, symbol, uri)
      .accounts({
        config,
        agentNft: agentNFT,
        nftMint: nftMint.publicKey,
        tokenAccount,
        metadataAccount,
        minter: this.wallet.publicKey,
        spl8004Identity,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([nftMint])
      .rpc();

    console.log('Agent tokenized as NFT:', tx);
    console.log('NFT Mint:', nftMint.publicKey.toBase58());

    return nftMint.publicKey;
  }

  /**
   * Sync reputation from SPL-8004
   */
  async syncReputation(agentId: string): Promise<string> {
    const agentPubkey = new PublicKey(agentId);
    const [config] = this.getConfigPDA();
    const [agentNFT] = this.getAgentNFTPDA(agentPubkey);
    
    // Get SPL-8004 reputation account
    const spl8004Reputation = await this.spl8004Client.getReputationPDA(agentId);

    const tx = await this.program.methods
      .syncReputation(agentPubkey)
      .accounts({
        config,
        agentNft: agentNFT,
        spl8004Reputation,
        oracle: this.wallet.publicKey,
      })
      .rpc();

    console.log('Reputation synced:', tx);
    return tx;
  }

  /**
   * List NFT for sale
   */
  async listForSale(agentId: string, priceSOL: number): Promise<string> {
    const agentPubkey = new PublicKey(agentId);
    const [config] = this.getConfigPDA();
    const [agentNFT] = this.getAgentNFTPDA(agentPubkey);
    const [listing] = this.getListingPDA(agentPubkey);

    const priceLamports = new BN(priceSOL * 1_000_000_000);

    const tx = await this.program.methods
      .listForSale(agentPubkey, priceLamports)
      .accounts({
        config,
        agentNft: agentNFT,
        listing,
        seller: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('NFT listed for sale:', tx);
    return tx;
  }

  /**
   * Delist NFT from marketplace
   */
  async delist(agentId: string): Promise<string> {
    const agentPubkey = new PublicKey(agentId);
    const [config] = this.getConfigPDA();
    const [agentNFT] = this.getAgentNFTPDA(agentPubkey);
    const [listing] = this.getListingPDA(agentPubkey);

    const tx = await this.program.methods
      .delist(agentPubkey)
      .accounts({
        config,
        agentNft: agentNFT,
        listing,
        seller: this.wallet.publicKey,
      })
      .rpc();

    console.log('NFT delisted:', tx);
    return tx;
  }

  /**
   * Purchase listed NFT
   */
  async purchase(agentId: string, sellerPublicKey: PublicKey): Promise<string> {
    const agentPubkey = new PublicKey(agentId);
    const [config] = this.getConfigPDA();
    const configData = await this.program.account.x404Config.fetch(config);
    const [agentNFT] = this.getAgentNFTPDA(agentPubkey);
    const [listing] = this.getListingPDA(agentPubkey);

    const agentNFTData = await this.program.account.agentNft.fetch(agentNFT);
    const nftMint = agentNFTData.mint;

    const sellerTokenAccount = await getAssociatedTokenAddress(
      nftMint,
      sellerPublicKey
    );

    const buyerTokenAccount = await getAssociatedTokenAddress(
      nftMint,
      this.wallet.publicKey
    );

    const tx = await this.program.methods
      .purchase(agentPubkey)
      .accounts({
        config,
        agentNft: agentNFT,
        listing,
        nftMint,
        sellerTokenAccount,
        buyerTokenAccount,
        seller: sellerPublicKey,
        buyer: this.wallet.publicKey,
        treasury: configData.treasury,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('NFT purchased:', tx);
    return tx;
  }

  /**
   * Update metadata URI
   */
  async updateMetadata(agentId: string, newUri: string): Promise<string> {
    const agentPubkey = new PublicKey(agentId);
    const [config] = this.getConfigPDA();
    const [agentNFT] = this.getAgentNFTPDA(agentPubkey);
    
    const agentNFTData = await this.program.account.agentNft.fetch(agentNFT);
    const metadataAccount = this.getMetadataPDA(agentNFTData.mint);

    const tx = await this.program.methods
      .updateMetadata(agentPubkey, newUri)
      .accounts({
        config,
        agentNft: agentNFT,
        metadataAccount,
        owner: this.wallet.publicKey,
        tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      })
      .rpc();

    console.log('Metadata updated:', tx);
    return tx;
  }

  /**
   * Get agent NFT data
   */
  async getAgentNFT(agentId: string) {
    const agentPubkey = new PublicKey(agentId);
    const [agentNFT] = this.getAgentNFTPDA(agentPubkey);
    
    const data = await this.program.account.agentNft.fetch(agentNFT);
    
    return {
      agentId: data.agentId.toBase58(),
      mint: data.mint.toBase58(),
      owner: data.owner.toBase58(),
      originalMinter: data.originalMinter.toBase58(),
      reputationScore: data.reputationScore,
      lastReputationSync: new Date(data.lastReputationSync.toNumber() * 1000),
      metadataUri: data.metadataUri,
      mintedAt: new Date(data.mintedAt.toNumber() * 1000),
      totalTransfers: data.totalTransfers,
      isListed: data.isListed,
      floorPrice: this.calculateFloorPrice(data.reputationScore),
    };
  }

  /**
   * Get all listed NFTs
   */
  async getListedNFTs() {
    const listings = await this.program.account.listing.all();
    
    return Promise.all(listings.map(async (listing) => {
      const agentNFT = await this.getAgentNFT(listing.account.agentId.toBase58());
      return {
        ...listing.account,
        agentNFT,
      };
    }));
  }

  /**
   * Calculate floor price based on reputation
   */
  private calculateFloorPrice(reputationScore: number, basePriceLamports: number = 1_000_000_000): number {
    const reputationMultiplier = (reputationScore / 10_000);
    return Math.floor(basePriceLamports * (1 + reputationMultiplier));
  }

  /**
   * Start reputation oracle (background service)
   */
  startReputationOracle(agentIds: string[], intervalMs: number = 60000) {
    console.log('Starting reputation oracle...');
    console.log('Monitoring agents:', agentIds);

    const syncInterval = setInterval(async () => {
      for (const agentId of agentIds) {
        try {
          await this.syncReputation(agentId);
          console.log(`[Oracle] Synced reputation for ${agentId}`);
        } catch (error) {
          console.error(`[Oracle] Failed to sync ${agentId}:`, error);
        }
      }
    }, intervalMs);

    return () => clearInterval(syncInterval);
  }
}
