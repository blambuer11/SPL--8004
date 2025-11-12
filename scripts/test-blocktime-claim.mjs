#!/usr/bin/env node
/**
 * Full claim test with blockchain timestamp
 */

import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const X402_PROGRAM_ID = new PublicKey('6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const WALLET_ADDRESS = new PublicKey('2eMCYLPtxuN7gYNTxWfecbuHEKFsoXLfKLPcMERYaNfJ');

const connection = new Connection(DEVNET_RPC, 'confirmed');

async function main() {
  console.log('🔑 Wallet:', WALLET_ADDRESS.toBase58());

  // Get blockchain timestamp
  console.log('\n⏰ Getting blockchain timestamp...');
  const slot = await connection.getSlot();
  console.log('📊 Current slot:', slot);
  
  const blockTime = await connection.getBlockTime(slot);
  if (!blockTime) {
    console.log('❌ Block time is null, trying previous slot...');
    const prevBlockTime = await connection.getBlockTime(slot - 1);
    if (!prevBlockTime) throw new Error('Cannot get block time');
    console.log('⏰ Block timestamp:', prevBlockTime);
  } else {
    console.log('⏰ Block timestamp:', blockTime);
  }

  const timestamp = blockTime || await connection.getBlockTime(slot - 1);
  if (!timestamp) throw new Error('Failed to get timestamp');

  // Derive PDAs
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    X402_PROGRAM_ID
  );
  console.log('\n📝 Config PDA:', configPda.toBase58());

  // Payment PDA with blockchain timestamp
  const tsBuf = Buffer.alloc(8);
  tsBuf.writeBigInt64LE(BigInt(timestamp));
  
  const [paymentPda, bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('payment'),
      WALLET_ADDRESS.toBuffer(),
      WALLET_ADDRESS.toBuffer(),
      tsBuf,
    ],
    X402_PROGRAM_ID
  );
  console.log('💳 Payment PDA:', paymentPda.toBase58());
  console.log('🎲 Bump:', bump);
  console.log('📅 Timestamp used:', timestamp);

  // Get config for treasury
  const configInfo = await connection.getAccountInfo(configPda);
  if (!configInfo) throw new Error('Config not initialized');
  
  const treasuryPubkey = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32));
  console.log('🏦 Treasury:', treasuryPubkey.toBase58());

  // Token accounts
  const senderTokenAccount = await getAssociatedTokenAddress(USDC_MINT, WALLET_ADDRESS);
  const recipientTokenAccount = senderTokenAccount;
  const treasuryTokenAccount = await getAssociatedTokenAddress(USDC_MINT, treasuryPubkey);

  console.log('\n💰 Accounts:');
  console.log('  Sender token:', senderTokenAccount.toBase58());
  console.log('  Recipient token:', recipientTokenAccount.toBase58());
  console.log('  Treasury token:', treasuryTokenAccount.toBase58());

  // Build instruction
  const amount = 0.01;
  const DISCRIMINATOR = Buffer.from([159, 239, 183, 134, 33, 68, 121, 86]);
  
  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(BigInt(Math.floor(amount * 1e6)));
  
  const memo = 'Test';
  const memoBuf = Buffer.from(memo, 'utf-8');
  const memoLenBuf = Buffer.alloc(4);
  memoLenBuf.writeUInt32LE(memoBuf.length);

  const data = Buffer.concat([DISCRIMINATOR, amountBuf, memoLenBuf, memoBuf]);

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

  console.log('\n📤 Simulating...');
  const tx = new Transaction().add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = WALLET_ADDRESS;

  const sim = await connection.simulateTransaction(tx);
  
  if (sim.value.err) {
    console.log('❌ FAILED!');
    console.log('Error:', JSON.stringify(sim.value.err, null, 2));
    console.log('\n📋 Logs:');
    sim.value.logs?.forEach(l => console.log(' ', l));
  } else {
    console.log('✅ SUCCESS!');
    console.log('📊 Units:', sim.value.unitsConsumed);
    console.log('\n📋 Logs:');
    sim.value.logs?.forEach(l => console.log(' ', l));
  }
}

main().catch(err => {
  console.error('💥 Error:', err.message);
  console.error(err.stack);
});
