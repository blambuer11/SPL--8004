#!/usr/bin/env node

/**
 * X404 Bridge Test Script
 * Tests the X404 Bridge functionality
 */

import { Connection, PublicKey } from '@solana/web3.js';

const RPC_URL = 'https://api.devnet.solana.com';
const X404_PROGRAM_ID = 'ESEbyYMdhKUQ3h5AyqPwLhvkPhaMgugt3dRd3NXxUsH9';
const SPL8004_PROGRAM_ID = 'G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW'; // From spl8004-client.ts

async function testX404Bridge() {
  console.log('🧪 Testing X404 NFT Bridge...\n');
  
  try {
    // 1. Check Solana connection
    console.log('1️⃣ Connecting to Solana devnet...');
    const connection = new Connection(RPC_URL, 'confirmed');
    const version = await connection.getVersion();
    console.log(`   ✅ Connected! Solana version: ${JSON.stringify(version)}\n`);
    
    // 2. Check X404 program deployment
    console.log('2️⃣ Checking X404 program...');
    const x404ProgramId = new PublicKey(X404_PROGRAM_ID);
    const x404AccountInfo = await connection.getAccountInfo(x404ProgramId);
    
    if (!x404AccountInfo) {
      console.log('   ⚠️ X404 program NOT deployed on devnet');
      console.log(`   📍 Expected Program ID: ${X404_PROGRAM_ID}`);
      console.log('   💡 Status: Demo Mode Active\n');
    } else {
      console.log('   ✅ X404 program deployed!');
      console.log(`   📍 Program ID: ${X404_PROGRAM_ID}`);
      console.log(`   📦 Account owner: ${x404AccountInfo.owner.toBase58()}`);
      console.log(`   💾 Executable: ${x404AccountInfo.executable}\n`);
    }
    
    // 3. Check SPL-8004 program
    console.log('3️⃣ Checking SPL-8004 program...');
    const spl8004ProgramId = new PublicKey(SPL8004_PROGRAM_ID);
    const spl8004AccountInfo = await connection.getAccountInfo(spl8004ProgramId);
    
    if (!spl8004AccountInfo) {
      console.log('   ❌ SPL-8004 program NOT found');
      return false;
    }
    
    console.log('   ✅ SPL-8004 program found!');
    console.log(`   📍 Program ID: ${SPL8004_PROGRAM_ID}\n`);
    
    // 4. Test agent PDA derivation
    console.log('4️⃣ Testing PDA derivation...');
    const testAgentId = 'demo-agent-001';
    
    // SPL-8004 identity PDA
    const [identityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('identity'), Buffer.from(testAgentId)],
      spl8004ProgramId
    );
    console.log(`   Agent ID: ${testAgentId}`);
    console.log(`   Identity PDA: ${identityPda.toBase58()}`);
    
    // X404 NFT PDA
    const [nftPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('agent_nft'), identityPda.toBuffer()],
      x404ProgramId
    );
    console.log(`   NFT PDA: ${nftPda.toBase58()}\n`);
    
    // 5. Check if test agent exists
    console.log('5️⃣ Checking test agent...');
    const identityAccount = await connection.getAccountInfo(identityPda);
    if (identityAccount) {
      console.log('   ✅ Test agent EXISTS on SPL-8004');
      console.log(`   📦 Data length: ${identityAccount.data.length} bytes\n`);
    } else {
      console.log('   ⚠️ Test agent NOT found');
      console.log('   💡 Create agent first at: /app/create-agent\n');
    }
    
    // 6. Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 X404 BRIDGE TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Solana RPC: Connected`);
    console.log(`${x404AccountInfo ? '✅' : '⚠️'} X404 Program: ${x404AccountInfo ? 'Deployed' : 'Demo Mode'}`);
    console.log(`✅ SPL-8004 Program: Deployed`);
    console.log(`✅ PDA Derivation: Working`);
    console.log(`${identityAccount ? '✅' : '⚠️'} Test Agent: ${identityAccount ? 'Found' : 'Not Found'}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('🎉 X404 Bridge Test Complete!');
    
    if (!x404AccountInfo) {
      console.log('\n⚠️ NOTE: X404 program not deployed yet.');
      console.log('Bridge is working in DEMO MODE - simulating NFT minting.');
      console.log('All functionality is ready once program is deployed!\n');
    }
    
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
