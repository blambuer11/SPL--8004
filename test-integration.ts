import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';

// Load keypair
const keypairData = JSON.parse(fs.readFileSync('/Users/bl10buer/Desktop/sp8004/my-solana-keypair.json', 'utf-8'));
const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));

// Connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const PROGRAM_ID = new PublicKey('G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW');

async function testIntegration() {
  console.log('🔍 Testing SPL-8004 Integration...\n');
  console.log('Program ID:', PROGRAM_ID.toBase58());
  console.log('Wallet:', keypair.publicKey.toBase58());
  
  // Check balance
  const balance = await connection.getBalance(keypair.publicKey);
  console.log('Balance:', balance / 1e9, 'SOL\n');
  
  if (balance < 0.1 * 1e9) {
    console.log('⚠️  Low balance. Request airdrop:');
    console.log(`solana airdrop 1 ${keypair.publicKey.toBase58()} --url devnet\n`);
  }
  
  // Find config PDA
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  );
  console.log('Config PDA:', configPda.toBase58());
  
  // Check if config exists
  const configInfo = await connection.getAccountInfo(configPda);
  if (configInfo) {
    console.log('✅ Config account exists');
    console.log('   Owner:', configInfo.owner.toBase58());
    console.log('   Data length:', configInfo.data.length, 'bytes\n');
  } else {
    console.log('❌ Config account does not exist');
    console.log('   Need to call initialize_config first\n');
  }
  
  // Test agent PDAs
  const testAgentId = `test-agent-${Date.now()}`;
  console.log('Test Agent ID:', testAgentId);
  
  const [identityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('identity'), Buffer.from(testAgentId)],
    PROGRAM_ID
  );
  console.log('Identity PDA:', identityPda.toBase58());
  
  const [reputationPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('reputation'), Buffer.from(testAgentId)],
    PROGRAM_ID
  );
  console.log('Reputation PDA:', reputationPda.toBase58());
  
  const [rewardPoolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('reward_pool'), Buffer.from(testAgentId)],
    PROGRAM_ID
  );
  console.log('Reward Pool PDA:', rewardPoolPda.toBase58());
  
  // Check if agent already exists
  const identityInfo = await connection.getAccountInfo(identityPda);
  if (identityInfo) {
    console.log('\n⚠️  Agent already exists (from previous test)');
  } else {
    console.log('\n✅ Agent PDAs ready for registration');
  }
  
  console.log('\n✅ Integration test complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Ensure config is initialized (initialize_config)');
  console.log('2. Test register_agent from frontend Dashboard');
  console.log('3. Test submit_validation from frontend Validation page');
}

testIntegration().catch(console.error);
