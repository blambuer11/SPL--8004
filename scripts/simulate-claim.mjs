#!/usr/bin/env node
/**
 * Simulate claim with actual wallet address
 */

import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const X402_PROGRAM_ID = new PublicKey('6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Your browser wallet
const WALLET_ADDRESS = new PublicKey('2eMCYLPtxuN7gYNTxWfecbuHEKFsoXLfKLPcMERYaNfJ');

console.log('🔑 Wallet:', WALLET_ADDRESS.toBase58());

const connection = new Connection(DEVNET_RPC, 'confirmed');

async function main() {
  // Check USDC balance
  const tokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    WALLET_ADDRESS
  );
  console.log('💵 USDC Token Account:', tokenAccount.toBase58());

  try {
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    console.log('💵 USDC Balance:', balance.value.uiAmount, 'USDC');

    if (!balance.value.uiAmount || balance.value.uiAmount < 0.01) {
      console.log('❌ USDC yetersiz! En az 0.01 USDC gerekli.');
      return;
    }
  } catch (err) {
    console.log('❌ Token account yok:', err.message);
    return;
  }

  // Derive PDAs
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    X402_PROGRAM_ID
  );
  console.log('📝 Config PDA:', configPda.toBase58());

  // Check config
  const configInfo = await connection.getAccountInfo(configPda);
  if (!configInfo) {
    console.log('❌ Config not initialized');
    return;
  }
  console.log('✅ Config exists');

  const treasuryPubkey = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32));
  console.log('🏦 Treasury:', treasuryPubkey.toBase58());

  // Derive payment PDA
  const timestamp = Date.now();
  const tsBuf = Buffer.alloc(8);
  tsBuf.writeBigUInt64LE(BigInt(timestamp));
  
  const [paymentPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('payment'),
      WALLET_ADDRESS.toBuffer(),
      WALLET_ADDRESS.toBuffer(), // self-payment for test
      tsBuf,
    ],
    X402_PROGRAM_ID
  );
  console.log('💳 Payment PDA:', paymentPda.toBase58());

  // Get all token accounts
  const senderTokenAccount = tokenAccount;
  const recipientTokenAccount = tokenAccount; // same (self-payment)
  const treasuryTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    treasuryPubkey
  );

  console.log('💰 Sender token account:', senderTokenAccount.toBase58());
  console.log('💰 Recipient token account:', recipientTokenAccount.toBase58());
  console.log('🏦 Treasury token account:', treasuryTokenAccount.toBase58());

  // Check if treasury token account exists
  const treasuryAccountInfo = await connection.getAccountInfo(treasuryTokenAccount);
  if (!treasuryAccountInfo) {
    console.log('❌ Treasury token account does not exist!');
    console.log('📝 Create it with:');
    console.log(`   spl-token create-account ${USDC_MINT.toBase58()} --owner ${treasuryPubkey.toBase58()} --url devnet`);
    return;
  }
  console.log('✅ Treasury token account exists');

  // Build instruction
  const amount = 0.01; // 0.01 USDC
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

  console.log('\n📦 Building instruction...');
  console.log('  Amount:', amount, 'USDC (', Math.floor(amount * 1e6), 'micro USDC)');
  console.log('  Memo:', memo);

  const ix = new TransactionInstruction({
    programId: X402_PROGRAM_ID,
    keys: [
      { pubkey: paymentPda, isSigner: false, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: WALLET_ADDRESS, isSigner: true, isWritable: true },
      { pubkey: WALLET_ADDRESS, isSigner: false, isWritable: false },
      { pubkey: senderTokenAccount, isSigner: false, isWritable: true },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: treasuryTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  console.log('\n📤 Simulating transaction...');

  const tx = new Transaction().add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = WALLET_ADDRESS;

  try {
    const simulation = await connection.simulateTransaction(tx);
    
    if (simulation.value.err) {
      console.log('❌ Simulation failed!');
      console.log('Error:', JSON.stringify(simulation.value.err, null, 2));
      console.log('\n📋 Program Logs:');
      simulation.value.logs?.forEach(log => console.log('  ', log));
    } else {
      console.log('✅ Simulation successful!');
      console.log('📊 Compute units:', simulation.value.unitsConsumed);
      console.log('\n📋 Program Logs:');
      simulation.value.logs?.forEach(log => console.log('  ', log));
      console.log('\n✨ Transaction would succeed! You can claim in the UI.');
    }
  } catch (err) {
    console.error('❌ Simulation error:', err.message);
  }
}

main().catch(console.error);
