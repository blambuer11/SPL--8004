import { Connection, PublicKey, SystemProgram, Keypair, Transaction, TransactionInstruction } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function discriminator(name) {
  const hash = crypto.createHash('sha256').update(`global:${name}`).digest();
  return hash.subarray(0, 8);
}

function u64le(n) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(BigInt(n));
  return buf;
}

async function main() {
  // Environment variables
  const senderSecretPath = process.env.SENDER_WALLET || path.resolve(process.env.HOME, '.config/solana/id.json');
  const recipientStr = process.env.RECIPIENT;
  const amountStr = process.env.AMOUNT;
  const memo = process.env.MEMO || 'Instant payment via X402';
  const usdcMint = process.env.USDC_MINT || 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'; // Devnet USDC
  
  if (!recipientStr || !amountStr) {
    throw new Error('RECIPIENT and AMOUNT env vars are required');
  }

  const amount = parseFloat(amountStr) * 1e6; // USDC has 6 decimals
  if (amount <= 0 || isNaN(amount)) throw new Error('Invalid AMOUNT');

  const connection = new Connection(process.env.RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
  const senderSecret = JSON.parse(fs.readFileSync(senderSecretPath, 'utf-8'));
  const sender = Keypair.fromSecretKey(Uint8Array.from(senderSecret));
  const recipient = new PublicKey(recipientStr);
  const usdcMintPubkey = new PublicKey(usdcMint);

  const programId = new PublicKey(process.env.X402_PROGRAM_ID || '6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia');
  const [configPda] = PublicKey.findProgramAddressSync([Buffer.from('config')], programId);

  // Get or create token accounts
  const senderTokenAccount = await Token.getAssociatedTokenAddress(
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    usdcMintPubkey,
    sender.publicKey
  );
  const recipientTokenAccount = await Token.getAssociatedTokenAddress(
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    usdcMintPubkey,
    recipient
  );
  
  // Get treasury from config (read on-chain)
  const configInfo = await connection.getAccountInfo(configPda);
  if (!configInfo) throw new Error('Config PDA not initialized');
  const treasuryPubkey = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32)); // Skip discriminator + authority
  
  const treasuryTokenAccount = await Token.getAssociatedTokenAddress(
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    usdcMintPubkey,
    treasuryPubkey
  );

  // Create payment PDA seed
  const timestamp = Math.floor(Date.now() / 1000);
  const [paymentPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('payment'),
      sender.publicKey.toBytes(),
      recipient.toBytes(),
      Buffer.from(new Uint8Array(new BigInt64Array([BigInt(timestamp)]).buffer)),
    ],
    programId
  );

  // Build instruction data
  const data = Buffer.concat([
    discriminator('instant_payment'),
    u64le(amount),
    Buffer.from([memo.length]),
    Buffer.from(memo, 'utf-8'),
  ]);

  const keys = [
    { pubkey: paymentPda, isSigner: false, isWritable: true },
    { pubkey: configPda, isSigner: false, isWritable: true },
    { pubkey: sender.publicKey, isSigner: true, isWritable: true },
    { pubkey: recipient, isSigner: false, isWritable: false },
    { pubkey: senderTokenAccount, isSigner: false, isWritable: true },
    { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
    { pubkey: treasuryTokenAccount, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  console.log('X402 Instant Payment:');
  console.log('  Sender        :', sender.publicKey.toBase58());
  console.log('  Recipient     :', recipient.toBase58());
  console.log('  Amount (USDC) :', (amount / 1e6).toFixed(2));
  console.log('  Memo          :', memo);
  console.log('  Payment PDA   :', paymentPda.toBase58());
  console.log('  Config PDA    :', configPda.toBase58());

  const ix = new TransactionInstruction({ keys, programId, data });
  const tx = new Transaction().add(ix);
  tx.feePayer = sender.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const sig = await connection.sendTransaction(tx, [sender], { skipPreflight: false });
  await connection.confirmTransaction(sig, 'confirmed');

  console.log('\n✅ Payment successful!');
  console.log('  Signature:', sig);
  console.log('  Explorer:', `https://explorer.solana.com/tx/${sig}?cluster=devnet`);
}

main().catch((e) => { console.error('Error:', e.message); process.exit(1); });
