#!/usr/bin/env node
/**
 * claim-agent-reward.mjs
 * Bir agent cüzdanına X402 instant_payment ile USDC ödülü gönderir.
 *
 * ENV:
 *   RECIPIENT=Agent veya sahip cüzdanı (Pubkey)
 *   AMOUNT=Ödül (USDC, ondalıklı)
 *   MEMO=İsteğe bağlı açıklama
 */
import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';
import crypto from 'crypto';

const PROGRAM_ID = new PublicKey(process.env.X402_PROGRAM_ID || '6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia');
const USDC_MINT = new PublicKey(process.env.USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

function getDiscriminator(name) {
  return crypto.createHash('sha256').update(`global:${name}`).digest().subarray(0,8);
}

function u64le(n) {
  const buf = Buffer.alloc(8); buf.writeBigUInt64LE(BigInt(n)); return buf;
}

async function main() {
  const RECIPIENT = process.env.RECIPIENT;
  const AMOUNT = process.env.AMOUNT;
  const MEMO = process.env.MEMO || '';
  if(!RECIPIENT || !AMOUNT) {
    console.error('RECIPIENT ve AMOUNT gerekli');
    process.exit(1);
  }

  const connection = new Connection(process.env.RPC_URL || 'https://api.devnet.solana.com','confirmed');
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(process.env.KEYPAIR || process.env.HOME + '/.config/solana/id.json','utf-8')))
  );
  const recipientPk = new PublicKey(RECIPIENT);

  // Config PDA
  const [configPda] = PublicKey.findProgramAddressSync([Buffer.from('config')], PROGRAM_ID);
  const configInfo = await connection.getAccountInfo(configPda);
  if(!configInfo) throw new Error('Config bulunamadı');
  const treasuryPk = new PublicKey(configInfo.data.subarray(8+32,8+32+32));

  // Payment PDA (timestamp seed)
  const ts = Date.now();
  const tsBuf = Buffer.alloc(8); tsBuf.writeBigUInt64LE(BigInt(ts));
  const [paymentPda] = PublicKey.findProgramAddressSync([
    Buffer.from('payment'), payer.publicKey.toBuffer(), recipientPk.toBuffer(), tsBuf
  ], PROGRAM_ID);

  // Token accounts
  const senderToken = await getAssociatedTokenAddress(USDC_MINT, payer.publicKey);
  const recipientToken = await getAssociatedTokenAddress(USDC_MINT, recipientPk);
  const treasuryToken = await getAssociatedTokenAddress(USDC_MINT, treasuryPk);

  const amountLamports = Math.floor(parseFloat(AMOUNT) * 1e6);

  const discriminator = getDiscriminator('instant_payment');
  const amountBuf = u64le(amountLamports);
  const memoBuf = Buffer.from(MEMO,'utf-8');
  const memoLen = Buffer.alloc(4); memoLen.writeUInt32LE(memoBuf.length);
  const data = Buffer.concat([discriminator, amountBuf, memoLen, memoBuf]);

  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: paymentPda, isSigner: false, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: recipientPk, isSigner: false, isWritable: false },
      { pubkey: senderToken, isSigner: false, isWritable: true },
      { pubkey: recipientToken, isSigner: false, isWritable: true },
      { pubkey: treasuryToken, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data
  });

  const tx = new Transaction().add(ix);
  const sig = await connection.sendTransaction(tx, [payer]);
  await connection.confirmTransaction(sig,'confirmed');

  const fee = Math.floor(amountLamports * 0.005);
  const net = amountLamports - fee;

  console.log('Signature:', sig);
  console.log('Explorer:', `https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  console.log('Amount (raw):', amountLamports);
  console.log('Fee (0.5%):', fee);
  console.log('Net Sent:', net);
}

main().catch(e=>{console.error(e);process.exit(1);});
