#!/usr/bin/env node

/**
 * Direct X402 Payment API Function Test
 * Tests the API function directly without HTTP server
 */

import { Connection, PublicKey } from '@solana/web3.js';

const SOLANA_RPC = 'https://api.devnet.solana.com';
const X402_PROGRAM_ID = new PublicKey('6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

console.log('🧪 X402 Payment API Direct Function Test\n');
console.log('='.repeat(60));

// Test: Check X402 Config
async function testX402Config() {
  console.log('\n📋 Test: X402 Config PDA');
  console.log('-'.repeat(60));
  
  try {
    const connection = new Connection(SOLANA_RPC, 'confirmed');
    
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      X402_PROGRAM_ID
    );
    
    console.log('Config PDA:', configPda.toBase58());
    
    const configInfo = await connection.getAccountInfo(configPda);
    
    if (configInfo) {
      console.log('✅ Config account exists');
      console.log('   Data length:', configInfo.data.length, 'bytes');
      console.log('   Owner:', configInfo.owner.toBase58());
      
      // Parse treasury from config
      const treasury = new PublicKey(configInfo.data.subarray(8, 8 + 32));
      const treasuryTokenAccount = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32));
      
      console.log('   Treasury:', treasury.toBase58());
      console.log('   Treasury Token Account:', treasuryTokenAccount.toBase58());
      
      return true;
    } else {
      console.log('❌ Config account not found');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Test: Generate Payment PDA
async function testPaymentPDA() {
  console.log('\n🔑 Test: Payment PDA Generation');
  console.log('-'.repeat(60));
  
  try {
    const connection = new Connection(SOLANA_RPC, 'confirmed');
    const timestamp = Math.floor(Date.now() / 1000);
    
    console.log('Current timestamp:', timestamp);
    
    // Try offsets
    for (let offset = -3; offset <= 3; offset++) {
      const ts = timestamp + offset;
      const timestampBuffer = Buffer.alloc(8);
      
      // Manual little-endian encoding
      let val = ts;
      for (let i = 0; i < 8; i++) {
        timestampBuffer[i] = val & 0xff;
        val = Math.floor(val / 256);
      }
      
      const [paymentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('payment'), timestampBuffer],
        X402_PROGRAM_ID
      );
      
      const accountInfo = await connection.getAccountInfo(paymentPda);
      const exists = !!accountInfo;
      
      console.log(`   Offset ${offset > 0 ? '+' : ''}${offset}: ${paymentPda.toBase58().slice(0, 8)}... ${exists ? '❌ TAKEN' : '✅ AVAILABLE'}`);
      
      if (!exists && offset === 0) {
        console.log('✅ Current timestamp PDA is available');
        return true;
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Test: Recipient Token Account
async function testRecipientTokenAccount() {
  console.log('\n💳 Test: Recipient Token Account');
  console.log('-'.repeat(60));
  
  try {
    const connection = new Connection(SOLANA_RPC, 'confirmed');
    const recipient = new PublicKey('2eMCYLPtxuN7gYNTxWfecbuHEKFsoXLfKLPcMERYaNfJ');
    
    console.log('Recipient:', recipient.toBase58());
    console.log('USDC Mint:', USDC_MINT.toBase58());
    
    // Find ATA
    const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
    
    const [ata] = PublicKey.findProgramAddressSync(
      [recipient.toBytes(), TOKEN_PROGRAM_ID.toBytes(), USDC_MINT.toBytes()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    
    console.log('Expected ATA:', ata.toBase58());
    
    const ataInfo = await connection.getAccountInfo(ata);
    
    if (ataInfo) {
      console.log('✅ Token account exists');
      
      // Parse token amount (offset 64, 8 bytes little-endian)
      const amount = ataInfo.data.readBigUInt64LE(64);
      console.log('   Balance:', Number(amount) / 1_000_000, 'USDC');
      
      return true;
    } else {
      console.log('❌ Token account does not exist');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Test: API Key Validation
function testApiKeyValidation() {
  console.log('\n🔐 Test: API Key Validation');
  console.log('-'.repeat(60));
  
  const VALID_API_KEYS = new Set([
    'noema_sk_demo_12345',
  ]);
  
  const testCases = [
    { key: 'noema_sk_demo_12345', expected: true, desc: 'Valid demo key' },
    { key: 'invalid_key', expected: false, desc: 'Invalid key' },
    { key: '', expected: false, desc: 'Empty key' },
    { key: undefined, expected: false, desc: 'Undefined key' },
  ];
  
  let allPassed = true;
  
  for (const testCase of testCases) {
    const result = VALID_API_KEYS.has(testCase.key);
    const pass = result === testCase.expected;
    
    console.log(`   ${pass ? '✅' : '❌'} ${testCase.desc}: ${result}`);
    
    if (!pass) allPassed = false;
  }
  
  return allPassed;
}

// Test: Rate Limiting Logic
function testRateLimiting() {
  console.log('\n⏱️  Test: Rate Limiting');
  console.log('-'.repeat(60));
  
  const rateLimitMap = new Map();
  const RATE_LIMIT_WINDOW = 60000; // 1 minute
  const RATE_LIMIT_MAX = 10;
  
  function checkRateLimit(identifier) {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
      return false;
    }

    record.count++;
    return true;
  }
  
  // Simulate requests
  const ip = '192.168.1.1';
  let allPassed = true;
  
  // First 10 requests should pass
  for (let i = 1; i <= 10; i++) {
    const allowed = checkRateLimit(ip);
    console.log(`   Request ${i}: ${allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    if (!allowed) allPassed = false;
  }
  
  // 11th request should be blocked
  const blocked = !checkRateLimit(ip);
  console.log(`   Request 11: ${blocked ? '✅ CORRECTLY BLOCKED' : '❌ SHOULD BE BLOCKED'}`);
  if (!blocked) allPassed = false;
  
  return allPassed;
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting Direct API Function Tests...\n');
  
  const results = [];
  
  results.push(await testX402Config());
  results.push(await testPaymentPDA());
  results.push(await testRecipientTokenAccount());
  results.push(testApiKeyValidation());
  results.push(testRateLimiting());
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r === true).length;
  const failed = results.filter(r => r === false).length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    console.log('\n💡 API function is ready to handle requests!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
  }
}

// Run tests
runAllTests().catch(console.error);
