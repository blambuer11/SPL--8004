#!/usr/bin/env node

/**
 * X404 NFT Bridge Test Script
 * Tests if the X404 program is deployed and accessible
 */

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

const X404_PROGRAM_ID = 'HPwBe2UiSUEfJj6KZ2aSQcbcP8smb8H1F2t3nx5gU8tU';
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

async function testX404Bridge() {
  console.log('🧪 Testing X404 NFT Bridge...\n');
  
  try {
    // 1. Check connection
    console.log('1️⃣ Connecting to Solana devnet...');
    const connection = new Connection(RPC_URL, 'confirmed');
    const version = await connection.getVersion();
    console.log(`   ✅ Connected! Solana version: ${JSON.stringify(version)}\n`);
    
    // 2. Check program deployment
    console.log('2️⃣ Checking X404 program deployment...');
    const programId = new PublicKey(X404_PROGRAM_ID);
    const accountInfo = await connection.getAccountInfo(programId);
    
    if (!accountInfo) {
      console.log('   ❌ Program not found on devnet');
      console.log('   💡 Deploy with: cd x404-integration && anchor deploy\n');
      return false;
    }
    
    console.log(`   ✅ Program deployed!`);
    console.log(`   📍 Program ID: ${X404_PROGRAM_ID}`);
    console.log(`   💾 Data Length: ${accountInfo.data.length} bytes`);
    console.log(`   👤 Owner: ${accountInfo.owner.toBase58()}\n`);
    
    // 3. Check state PDA
    console.log('3️⃣ Checking program state PDA...');
    const [statePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('state')],
      programId
    );
    
    const stateAccount = await connection.getAccountInfo(statePDA);
    if (!stateAccount) {
      console.log('   ⚠️  State PDA not initialized');
      console.log('   💡 Initialize with: anchor run initialize\n');
      return false;
    }
    
    console.log(`   ✅ State PDA found: ${statePDA.toBase58()}`);
    console.log(`   💾 State size: ${stateAccount.data.length} bytes\n`);
    
    // 4. Parse state (basic)
    try {
      // Skip discriminator (8 bytes), read basic fields
      const data = stateAccount.data;
      let offset = 8; // Skip anchor discriminator
      
      // Read authority (32 bytes)
      const authority = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;
      
      // Read total_agents (u64 = 8 bytes)
      const totalAgents = Number(data.readBigUInt64LE(offset));
      offset += 8;
      
      // Read total_volume (u64 = 8 bytes)
      const totalVolume = Number(data.readBigUInt64LE(offset));
      
      console.log('4️⃣ State data:');
      console.log(`   👤 Authority: ${authority.toBase58()}`);
      console.log(`   🤖 Total Agents: ${totalAgents}`);
      console.log(`   💰 Total Volume: ${totalVolume} lamports\n`);
    } catch (parseError) {
      console.log('   ⚠️  Could not parse state data (might be different format)');
      console.log(`   Error: ${parseError.message}\n`);
    }
    
    // 5. Check for existing agent NFTs
    console.log('5️⃣ Searching for minted Agent NFTs...');
    const accounts = await connection.getProgramAccounts(programId, {
      filters: [
        {
          dataSize: 8 + 32 + 32 + 32 + 4 + 200 + 8 + 8 + 8 + 8 + 1 + 8 + 1, // Approximate AgentNFT size
        },
      ],
    });
    
    console.log(`   📦 Found ${accounts.length} Agent NFT accounts\n`);
    
    if (accounts.length > 0) {
      console.log('6️⃣ Sample Agent NFTs:');
      accounts.slice(0, 3).forEach((acc, idx) => {
        console.log(`   NFT ${idx + 1}: ${acc.pubkey.toBase58()}`);
      });
      console.log('');
    }
    
    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 X404 Bridge Status Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Program Deployed: YES`);
    console.log(`✅ State Initialized: YES`);
    console.log(`📦 Agent NFTs Minted: ${accounts.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎉 X404 NFT Bridge is OPERATIONAL!\n');
    
    // Usage instructions
    console.log('📖 Next Steps:');
    console.log('   1. Import SDK: import { X404Bridge } from "./x404-integration/sdk/src/index"');
    console.log('   2. Create instance with your wallet and SPL-8004 client');
    console.log('   3. Call bridge.tokenizeAgent(agentId) to mint NFT');
    console.log('   4. Use bridge.listForSale() to list on marketplace\n');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    return false;
  }
}

// Run test
testX404Bridge()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
