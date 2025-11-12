/**
 * X404 NFT Bridge - Usage Example
 * How to use the X404 Bridge SDK in your application
 */

// import { X404Bridge } from './x404-integration/sdk/src/index';
// import { Connection, Keypair, PublicKey } from '@solana/web3.js';
// import { AnchorProvider, Wallet, Program } from '@coral-xyz/anchor';

// NOTE: Imports commented out - this is a usage example/demo
// To use in production, uncomment imports and deploy program first

// ============================================
// EXAMPLE 1: Setup X404 Bridge
// ============================================

async function setupX404Bridge() {
  console.log('⚙️  Example: Setup X404 Bridge\n');
  
  // 1. Setup Solana connection
  // const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // 2. Load your wallet (in production, use wallet adapter)
  // const wallet = new Wallet(Keypair.generate()); // Replace with real wallet
  
  // 3. Create Anchor provider
  // const provider = new AnchorProvider(connection, wallet, {
  //   commitment: 'confirmed'
  // });
  
  // 4. Load your Anchor program
  // const idl = ...; // Load from JSON
  // const programId = new PublicKey('HPwBe2UiSUEfJj6KZ2aSQcbcP8smb8H1F2t3nx5gU8tU');
  // const program = new Program(idl, programId, provider);
  
  console.log('Setup steps:');
  console.log('  1. Create Solana connection');
  console.log('  2. Load wallet (Keypair or Wallet Adapter)');
  console.log('  3. Create Anchor provider');
  console.log('  4. Load X404 program with IDL');
  console.log('  5. Create SPL-8004 client');
  console.log('  6. Instantiate X404Bridge\n');
  
  console.log('✅ Ready to use bridge!\n');
}

// ============================================
// EXAMPLE 2: Tokenize an Agent
// ============================================

async function tokenizeAgentExample(bridge) {
  console.log('📦 Example: Tokenize Agent\n');
  
  const agentId = 'trading-bot-001';
  
  try {
    // This will:
    // 1. Fetch agent data from SPL-8004
    // 2. Upload metadata to Arweave
    // 3. Mint NFT on X404
    // 4. Store PDA mapping
    
    // const nftMint = await bridge.tokenizeAgent(agentId);
    
    console.log('Would execute:');
    console.log('  1. Get agent from SPL-8004');
    console.log('  2. Create metadata JSON');
    console.log('  3. Upload to Arweave');
    console.log('  4. Derive NFT PDA');
    console.log('  5. Call mint_agent_nft instruction');
    console.log('  6. Return NFT mint address\n');
    
    // console.log(`✅ NFT Mint: ${nftMint.toBase58()}`);
  } catch (error) {
    console.error('❌ Tokenization failed:', error);
  }
}

// ============================================
// EXAMPLE 3: Sync Reputation
// ============================================

async function syncReputationExample(bridge) {
  console.log('🔄 Example: Sync Reputation\n');
  
  const agentId = 'trading-bot-001';
  
  try {
    // Fetches latest reputation from SPL-8004 and updates NFT
    // const tx = await bridge.syncReputation(agentId);
    
    console.log('Would execute:');
    console.log('  1. Get current reputation from SPL-8004');
    console.log('  2. Call update_reputation instruction');
    console.log('  3. Update NFT on-chain data\n');
    
    // console.log(`✅ Reputation synced: ${tx}`);
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// ============================================
// EXAMPLE 4: List NFT for Sale
// ============================================

async function listForSaleExample(bridge) {
  console.log('💰 Example: List NFT for Sale\n');
  
  const agentId = 'trading-bot-001';
  const priceInSOL = 1.5;
  
  try {
    // const tx = await bridge.listForSale(agentId, priceInSOL);
    
    console.log(`Would list agent NFT for ${priceInSOL} SOL`);
    console.log('  1. Find agent NFT PDA');
    console.log('  2. Call list_for_sale instruction');
    console.log('  3. Set is_listed = true');
    console.log(`  4. Set list_price = ${priceInSOL * 1e9} lamports\n`);
    
    // console.log(`✅ Listed: ${tx}`);
  } catch (error) {
    console.error('❌ Listing failed:', error);
  }
}

// ============================================
// EXAMPLE 5: Purchase NFT
// ============================================

async function purchaseNFTExample(bridge) {
  console.log('🛒 Example: Purchase NFT\n');
  
  const agentId = 'trading-bot-001';
  
  try {
    // const tx = await bridge.purchase(agentId);
    
    console.log('Would execute:');
    console.log('  1. Get agent NFT data (price, seller)');
    console.log('  2. Transfer SOL to seller');
    console.log('  3. Transfer NFT token to buyer');
    console.log('  4. Update ownership on-chain');
    console.log('  5. Set is_listed = false\n');
    
    // console.log(`✅ Purchased: ${tx}`);
  } catch (error) {
    console.error('❌ Purchase failed:', error);
  }
}

// ============================================
// EXAMPLE 6: Get Listed NFTs
// ============================================

async function getListedNFTsExample(bridge) {
  console.log('📋 Example: Get All Listed NFTs\n');
  
  try {
    // const listed = await bridge.getListedNFTs();
    
    console.log('Would fetch all NFTs where is_listed = true');
    console.log('Returns: Array of AgentNFTData objects\n');
    
    // listed.forEach(nft => {
    //   console.log(`Agent: ${nft.agentId.toBase58()}`);
    //   console.log(`Price: ${nft.listPrice} lamports`);
    //   console.log(`Reputation: ${nft.reputationScore}`);
    // });
  } catch (error) {
    console.error('❌ Fetch failed:', error);
  }
}

// ============================================
// EXAMPLE 7: Calculate Valuation
// ============================================

async function calculateValuationExample(bridge) {
  console.log('💎 Example: Calculate Agent Valuation\n');
  
  const reputation = 850;
  const basePrice = 1.0; // SOL
  
  // Formula: price = base × (1 + reputation/10000)
  // const valuation = bridge.getAgentValuation(reputation, basePrice);
  
  const valuation = basePrice * (1 + reputation / 10000);
  
  console.log(`Base price: ${basePrice} SOL`);
  console.log(`Reputation: ${reputation}`);
  console.log(`Calculated price: ${valuation} SOL`);
  console.log(`Premium: ${((valuation / basePrice - 1) * 100).toFixed(2)}%\n`);
}

// ============================================
// EXAMPLE 8: Start Reputation Oracle
// ============================================

async function startReputationOracleExample(bridge) {
  console.log('🔮 Example: Start Reputation Oracle\n');
  
  const agentIds = [
    'trading-bot-001',
    'analytics-bot-002',
    'defi-bot-003'
  ];
  
  // Monitors SPL-8004 for reputation changes and syncs to X404
  // bridge.startReputationOracle(agentIds);
  
  console.log('Would start background service to:');
  console.log('  1. Listen for reputation updates on SPL-8004');
  console.log('  2. Automatically call syncReputation()');
  console.log('  3. Keep NFT data in sync with agent reputation\n');
  console.log(`Monitoring ${agentIds.length} agents...`);
}

// ============================================
// RUN EXAMPLES
// ============================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎓 X404 NFT Bridge - Usage Examples');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

(async () => {
  await setupX404Bridge();
  
  // Mock bridge object (commented out actual usage)
  const mockBridge = null;
  
  await tokenizeAgentExample(mockBridge);
  await syncReputationExample(mockBridge);
  await listForSaleExample(mockBridge);
  await purchaseNFTExample(mockBridge);
  await getListedNFTsExample(mockBridge);
  await calculateValuationExample(mockBridge);
  await startReputationOracleExample(mockBridge);
  // ============================================
  // EXAMPLE 9: X402 Instant Payment (Demo Only)
  // ============================================
  console.log('💸 Example: X402 Instant Payment to Agent (Demo)\n');
  console.log('Would execute:');
  console.log('  1. Read GlobalConfig PDA for treasury');
  console.log('  2. Derive payment PDA with timestamp');
  console.log('  3. Build instant_payment instruction');
  console.log('  4. Send USDC: net=99.5%, fee=0.5% to treasury');
  console.log('  5. Confirm and log explorer URL');
  console.log('\nRun this for a real transfer:');
  console.log('  RECIPIENT=<agent_wallet> AMOUNT=10.5 MEMO="Task reward" node spl-8004-program/x402-facilitator-program/scripts/instant-payment.mjs\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All examples completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📝 To use in production:');
  console.log('   1. Deploy X404 program to devnet');
  console.log('   2. Uncomment bridge instantiation code');
  console.log('   3. Uncomment actual method calls');
  console.log('   4. Test with real wallet and agents\n');
})();
