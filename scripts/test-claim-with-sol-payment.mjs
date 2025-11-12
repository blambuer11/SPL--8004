#!/usr/bin/env node
/**
 * Test claim with SOL payment (if USDC not available)
 * This simulates a claim by checking all components
 */

import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const X402_PROGRAM_ID = new PublicKey('6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Read keypair
const keypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync('./my-solana-keypair.json', 'utf-8')))
);

console.log('🔑 Wallet:', keypair.publicKey.toBase58());

const connection = new Connection(DEVNET_RPC, 'confirmed');

async function main() {
  // Check SOL balance
  const solBalance = await connection.getBalance(keypair.publicKey);
  console.log('💰 SOL Balance:', (solBalance / 1e9).toFixed(4), 'SOL');

  // Get token account
  const tokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    keypair.publicKey
  );
  console.log('💵 USDC Token Account:', tokenAccount.toBase58());

  // Check USDC balance
  try {
    const tokenBalance = await connection.getTokenAccountBalance(tokenAccount);
    console.log('💵 USDC Balance:', tokenBalance.value.uiAmount, 'USDC');

    if (tokenBalance.value.uiAmount === 0 || tokenBalance.value.uiAmount === null) {
      console.log('\n❌ USDC yetersiz!');
      console.log('\n📝 Çözümler:');
      console.log('1. Circle Faucet: https://faucet.circle.com/');
      console.log('2. Wallet adresiniz:', keypair.publicKey.toBase58());
      console.log('3. Network: Devnet');
      console.log('4. Mint after receive: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
      return;
    }
  } catch (err) {
    console.log('❌ Token account yok:', err.message);
    return;
  }

  // Test X402 instruction build (dry-run)
  console.log('\n🧪 Testing X402 instruction...');

  // Derive PDAs
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    X402_PROGRAM_ID
  );
  console.log('📝 Config PDA:', configPda.toBase58());

  const timestamp = Date.now();
  const tsBuf = Buffer.alloc(8);
  tsBuf.writeBigUInt64LE(BigInt(timestamp));
  
  const [paymentPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('payment'),
      keypair.publicKey.toBuffer(),
      keypair.publicKey.toBuffer(), // self-payment for test
      tsBuf,
    ],
    X402_PROGRAM_ID
  );
  console.log('💳 Payment PDA:', paymentPda.toBase58());

  // Read config to get treasury
  const configInfo = await connection.getAccountInfo(configPda);
  if (!configInfo) {
    console.log('❌ Config not initialized');
    return;
  }

  const treasuryPubkey = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32));
  console.log('🏦 Treasury:', treasuryPubkey.toBase58());

  const recipientTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    keypair.publicKey
  );

  const treasuryTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    treasuryPubkey
  );

  console.log('💰 Recipient token account:', recipientTokenAccount.toBase58());
  console.log('🏦 Treasury token account:', treasuryTokenAccount.toBase58());

  // Build instruction (0.001 USDC = 1000 micro USDC)
  const amount = 0.001; // Very small test amount
  const INSTANT_PAYMENT_DISCRIMINATOR = Buffer.from([159, 239, 183, 134, 33, 68, 121, 86]);
  
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(Math.floor(amount * 1e6)));
  
  const memo = 'Test claim';
  const memoBuffer = Buffer.from(memo, 'utf-8');
  const memoLengthBuffer = Buffer.alloc(4);
  memoLengthBuffer.writeUInt32LE(memoBuffer.length);

  const data = Buffer.concat([
    INSTANT_PAYMENT_DISCRIMINATOR,
    amountBuffer,
    memoLengthBuffer,
    memoBuffer,
  ]);

  console.log('\n📦 Instruction data:');
  console.log('  Amount:', amount, 'USDC');
  console.log('  Memo:', memo);
  console.log('  Data length:', data.length, 'bytes');

  const ix = new TransactionInstruction({
    programId: X402_PROGRAM_ID,
    keys: [
      { pubkey: paymentPda, isSigner: false, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: keypair.publicKey, isSigner: false, isWritable: false }, // recipient (self)
      { pubkey: tokenAccount, isSigner: false, isWritable: true },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: treasuryTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  console.log('\n📤 Simulating transaction...');

  const tx = new Transaction().add(ix);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = keypair.publicKey;

  try {
    const simulation = await connection.simulateTransaction(tx);
    
    if (simulation.value.err) {
      console.log('❌ Simulation failed:', JSON.stringify(simulation.value.err, null, 2));
      console.log('\n📋 Logs:');
      simulation.value.logs?.forEach(log => console.log('  ', log));
    } else {
      console.log('✅ Simulation successful!');
      console.log('📊 Units consumed:', simulation.value.unitsConsumed);
      console.log('\n📋 Logs:');
      simulation.value.logs?.forEach(log => console.log('  ', log));
    }
  } catch (err) {
    console.error('❌ Simulation error:', err.message);
  }
}

main().catch(console.error);
