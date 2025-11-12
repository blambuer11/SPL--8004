#!/usr/bin/env node
/**
 * Detailed X402 Claim Test with Full Logging
 */

import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const X402_PROGRAM_ID = new PublicKey('6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Read keypair
const keypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync('./my-solana-keypair.json', 'utf-8')))
);

const connection = new Connection(DEVNET_RPC, 'confirmed');

console.log('🔑 Sender:', keypair.publicKey.toBase58());

async function main() {
  // Config PDA
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    X402_PROGRAM_ID
  );
  console.log('📝 Config PDA:', configPda.toBase58());

  // Read config to get treasury
  const configInfo = await connection.getAccountInfo(configPda);
  if (!configInfo) {
    console.error('❌ Config not initialized');
    return;
  }
  
  const treasuryPubkey = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32));
  console.log('🏦 Treasury:', treasuryPubkey.toBase58());

  // Payment PDA
  const timestamp = Date.now();
  const tsBuf = Buffer.alloc(8);
  tsBuf.writeBigUInt64LE(BigInt(timestamp));
  
  const recipient = keypair.publicKey; // Self-payment for test
  
  const [paymentPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('payment'),
      keypair.publicKey.toBuffer(),
      recipient.toBuffer(),
      tsBuf,
    ],
    X402_PROGRAM_ID
  );
  console.log('💳 Payment PDA:', paymentPda.toBase58());
  console.log('🎯 Recipient:', recipient.toBase58());

  // Token accounts
  const senderTokenAccount = await getAssociatedTokenAddress(USDC_MINT, keypair.publicKey);
  const recipientTokenAccount = await getAssociatedTokenAddress(USDC_MINT, recipient);
  const treasuryTokenAccount = await getAssociatedTokenAddress(USDC_MINT, treasuryPubkey);

  console.log('💰 Sender token account:', senderTokenAccount.toBase58());
  console.log('💰 Recipient token account:', recipientTokenAccount.toBase58());
  console.log('🏦 Treasury token account:', treasuryTokenAccount.toBase58());

  // Check balances
  try {
    const senderInfo = await connection.getAccountInfo(senderTokenAccount);
    if (!senderInfo) {
      console.error('❌ Sender token account does not exist!');
      return;
    }
    const senderBalance = Number(senderInfo.data.readBigUInt64LE(64));
    console.log('💵 Sender USDC balance:', (senderBalance / 1e6).toFixed(6), 'USDC');

    if (senderBalance === 0) {
      console.error('❌ No USDC balance to claim!');
      return;
    }
  } catch (e) {
    console.error('❌ Error reading sender balance:', e.message);
    return;
  }

  // Check recipient token account
  try {
    const recipientInfo = await connection.getAccountInfo(recipientTokenAccount);
    if (!recipientInfo) {
      console.error('❌ Recipient token account does not exist!');
      console.log('🔧 Create it with: spl-token create-account', USDC_MINT.toBase58(), '--owner', recipient.toBase58());
      return;
    }
    console.log('✅ Recipient token account exists');
  } catch (e) {
    console.error('❌ Error checking recipient:', e.message);
    return;
  }

  // Check treasury token account
  try {
    const treasuryInfo = await connection.getAccountInfo(treasuryTokenAccount);
    if (!treasuryInfo) {
      console.error('❌ Treasury token account does not exist!');
      return;
    }
    console.log('✅ Treasury token account exists');
  } catch (e) {
    console.error('❌ Error checking treasury:', e.message);
    return;
  }

  // Build instruction
  const amount = 1000; // 0.001 USDC in microUSDC
  const memo = 'Test claim';
  
  const DISCRIMINATOR = Buffer.from([159, 239, 183, 134, 33, 68, 121, 86]);
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(amount));
  
  const memoBuffer = Buffer.from(memo, 'utf-8');
  const memoLengthBuffer = Buffer.alloc(4);
  memoLengthBuffer.writeUInt32LE(memoBuffer.length);

  const data = Buffer.concat([
    DISCRIMINATOR,
    amountBuffer,
    memoLengthBuffer,
    memoBuffer,
  ]);

  console.log('\n📦 Instruction data:', data.toString('hex'));
  console.log('💰 Amount:', amount, 'microUSDC (', (amount / 1e6).toFixed(6), 'USDC)');

  const ix = new TransactionInstruction({
    programId: X402_PROGRAM_ID,
    keys: [
      { pubkey: paymentPda, isSigner: false, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: recipient, isSigner: false, isWritable: false },
      { pubkey: senderTokenAccount, isSigner: false, isWritable: true },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: treasuryTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  console.log('\n📤 Sending transaction...');
  const tx = new Transaction().add(ix);
  
  try {
    const signature = await connection.sendTransaction(tx, [keypair]);
    console.log('✅ Transaction sent:', signature);
    
    console.log('⏳ Confirming...');
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err);
      
      // Get transaction details
      const txDetails = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      
      if (txDetails && txDetails.meta && txDetails.meta.logMessages) {
        console.log('\n📋 Transaction logs:');
        txDetails.meta.logMessages.forEach(log => console.log('  ', log));
      }
    } else {
      console.log('✅ Transaction confirmed!');
      console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    }
  } catch (error) {
    console.error('❌ Transaction error:', error.message);
    if (error.logs) {
      console.log('\n📋 Error logs:');
      error.logs.forEach(log => console.log('  ', log));
    }
  }
}

main().catch(console.error);
