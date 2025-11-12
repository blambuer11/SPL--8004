#!/usr/bin/env node
/**
 * Real X402 claim with wallet signing
 */

import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const X402_PROGRAM_ID = new PublicKey('6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Load keypair that has USDC
const keypairData = JSON.parse(fs.readFileSync('./my-solana-keypair.json', 'utf-8'));
const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));

console.log('🔑 Wallet:', payer.publicKey.toBase58());

const connection = new Connection(DEVNET_RPC, 'confirmed');

async function main() {
  // Get config
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    X402_PROGRAM_ID
  );
  console.log('📝 Config PDA:', configPda.toBase58());

  const configInfo = await connection.getAccountInfo(configPda);
  if (!configInfo) throw new Error('Config not found');

  const treasuryPubkey = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32));
  console.log('🏦 Treasury:', treasuryPubkey.toBase58());

  // Use current timestamp (will be close to blockchain time)
  const timestamp = Math.floor(Date.now() / 1000);
  console.log('⏰ Timestamp:', timestamp);

  // Try multiple timestamp offsets to find one that works
  for (let offset = -5; offset <= 5; offset++) {
    const testTimestamp = timestamp + offset;
    const tsBuf = Buffer.alloc(8);
    tsBuf.writeBigInt64LE(BigInt(testTimestamp));

    const [paymentPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('payment'),
        payer.publicKey.toBuffer(),
        payer.publicKey.toBuffer(),
        tsBuf,
      ],
      X402_PROGRAM_ID
    );

    // Check if this PDA would work
    const existingAccount = await connection.getAccountInfo(paymentPda);
    if (existingAccount) {
      console.log(`⏭️  Timestamp ${testTimestamp} (offset ${offset}s): PDA already exists, skipping...`);
      continue;
    }

    console.log(`\n🧪 Testing timestamp ${testTimestamp} (offset ${offset}s)`);
    console.log('💳 Payment PDA:', paymentPda.toBase58());

    // Get token accounts
    const senderToken = await getAssociatedTokenAddress(USDC_MINT, payer.publicKey);
    const recipientToken = senderToken; // self-payment
    const treasuryToken = await getAssociatedTokenAddress(USDC_MINT, treasuryPubkey);

    // Build instruction
    const amount = 0.01;
    const DISCRIMINATOR = Buffer.from([159, 239, 183, 134, 33, 68, 121, 86]);
    
    const amountBuf = Buffer.alloc(8);
    amountBuf.writeBigUInt64LE(BigInt(Math.floor(amount * 1e6)));
    
    const memo = 'Real claim test';
    const memoBuf = Buffer.from(memo, 'utf-8');
    const memoLenBuf = Buffer.alloc(4);
    memoLenBuf.writeUInt32LE(memoBuf.length);

    const data = Buffer.concat([DISCRIMINATOR, amountBuf, memoLenBuf, memoBuf]);

    const ix = new TransactionInstruction({
      programId: X402_PROGRAM_ID,
      keys: [
        { pubkey: paymentPda, isSigner: false, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: payer.publicKey, isSigner: false, isWritable: false },
        { pubkey: senderToken, isSigner: false, isWritable: true },
        { pubkey: recipientToken, isSigner: false, isWritable: true },
        { pubkey: treasuryToken, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    // Simulate first
    const tx = new Transaction().add(ix);
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer.publicKey;

    const sim = await connection.simulateTransaction(tx);
    
    if (sim.value.err) {
      console.log('❌ Simulation failed');
      if (offset === 5) {
        console.log('\n💥 All timestamp offsets failed!');
        console.log('Error:', JSON.stringify(sim.value.err, null, 2));
        console.log('\n📋 Last logs:');
        sim.value.logs?.forEach(l => console.log(' ', l));
      }
      continue;
    }

    // SUCCESS! Send real transaction
    console.log('✅ Simulation passed!');
    console.log('📤 Sending real transaction...');

    tx.sign(payer);
    const signature = await connection.sendRawTransaction(tx.serialize());
    console.log('📝 Signature:', signature);

    console.log('⏳ Confirming...');
    await connection.confirmTransaction(signature, 'confirmed');

    console.log('\n🎉 SUCCESS! Transaction confirmed!');
    console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    return;
  }

  console.log('\n❌ All attempts failed. Timestamp issue persists.');
}

main().catch(err => {
  console.error('💥 Error:', err.message);
  process.exit(1);
});
