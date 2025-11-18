/**
 * Initialize SPL-8004 Config
 * This script initializes the on-chain config for SPL-8004 program
 */

import 'dotenv/config';
import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { IDL, Spl8004 } from '../src/noema8004-idl.js';
import fs from 'fs';
import path from 'path';

const PROGRAM_ID = new PublicKey('G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW');
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || '9x3TDBKE7qFHXmvUUhPMkkSBhLmzazRxQaKwzSrQwcXX';
const COMMISSION_RATE = 250; // 2.5% (basis points)

async function initializeConfig() {
  console.log('🚀 Initializing SPL-8004 Config...\n');

  // Connect to Solana
  const connection = new Connection(SOLANA_RPC, 'confirmed');
  console.log(`📡 Connected to: ${SOLANA_RPC}`);

  // Load authority keypair from environment or CLI config
  let authority: Keypair;
  
  if (process.env.AGENT_ALPHA_KEY) {
    // Use agent alpha as authority (has SOL balance)
    const bs58 = await import('bs58');
    const secretKey = bs58.default.decode(process.env.AGENT_ALPHA_KEY);
    authority = Keypair.fromSecretKey(secretKey);
    console.log('🤖 Using Agent Alpha as authority');
  } else {
    // Fallback to default Solana CLI config
    const keypairPath = path.join(process.env.HOME || '', '.config/solana/id.json');
    
    if (!fs.existsSync(keypairPath)) {
      console.error('❌ Keypair not found at:', keypairPath);
      console.log('💡 Run: solana-keygen new');
      console.log('💡 Or set AGENT_ALPHA_KEY in .env');
      process.exit(1);
    }

    const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    authority = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  }
  
  console.log(`🔑 Authority: ${authority.publicKey.toString()}`);

  // Check balance
  const balance = await connection.getBalance(authority.publicKey);
  console.log(`💰 Balance: ${balance / 1e9} SOL`);

  if (balance < 0.01e9) {
    console.error('❌ Insufficient balance! Need at least 0.01 SOL');
    console.log('💡 Run: solana airdrop 1 --url devnet');
    process.exit(1);
  }

  // Calculate config PDA
  const [configPda, configBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  );

  console.log(`\n📍 Config PDA: ${configPda.toString()}`);
  console.log(`📍 Bump: ${configBump}`);
  console.log(`📍 Treasury: ${TREASURY_ADDRESS}`);
  console.log(`📍 Commission Rate: ${COMMISSION_RATE / 100}%`);

  // Check if config already exists
  const existingConfig = await connection.getAccountInfo(configPda);
  
  if (existingConfig) {
    console.log('\n✅ Config already initialized!');
    console.log(`📊 Account data size: ${existingConfig.data.length} bytes`);
    return;
  }

  // Create Anchor provider and program
  const wallet: Wallet = {
    publicKey: authority.publicKey,
    signTransaction: async (tx) => {
      tx.sign(authority);
      return tx;
    },
    signAllTransactions: async (txs) => {
      txs.forEach(tx => tx.sign(authority));
      return txs;
    },
  };

  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  const program = new Program<Spl8004>(IDL, provider);

  console.log('\n🔨 Calling initialize_config instruction...');

  try {
    const treasury = new PublicKey(TREASURY_ADDRESS);

    const tx = await program.methods
      .initializeConfig(COMMISSION_RATE, treasury)
      .accounts({
        config: configPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    console.log('\n✅ Config initialized successfully!');
    console.log(`📝 Transaction: ${tx}`);
    console.log(`🔗 Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    // Wait for confirmation
    console.log('\n⏳ Waiting for confirmation...');
    await connection.confirmTransaction(tx, 'confirmed');

    // Fetch and display config
    const configAccount = await program.account.globalConfig.fetch(configPda);
    console.log('\n📊 Config Details:');
    console.log(`   Authority: ${configAccount.authority.toString()}`);
    console.log(`   Treasury: ${configAccount.treasury.toString()}`);
    console.log(`   Commission Rate: ${configAccount.commissionRate / 100}%`);
    console.log(`   Total Agents: ${configAccount.totalAgents.toString()}`);
    console.log(`   Total Validations: ${configAccount.totalValidations.toString()}`);

  } catch (error: any) {
    console.error('\n❌ Initialization failed:', error.message);
    if (error.logs) {
      console.error('\n📋 Program Logs:');
      error.logs.forEach((log: string) => console.error(`   ${log}`));
    }
    process.exit(1);
  }
}

// Run
initializeConfig()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });
