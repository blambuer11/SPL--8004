// Autonomous USDC payment loop between agents (demo)
// Usage:
//   PAYER_KEYPAIR_PATH=./my-solana-keypair.json \
//   RECIPIENT_PUBKEY=<recipient_wallet> \
//   AMOUNT_USDC=0.01 INTERVAL_SEC=60 \
//   USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU \
//   SOLANA_RPC_URL=https://api.devnet.solana.com \
//   node api/automation/auto-pay.mjs

import { readFileSync } from 'node:fs';
import { Connection, Keypair, PublicKey, clusterApiUrl, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';

function env(key, def) {
  return process.env[key] ?? def;
}

function loadKeypair(path) {
  const raw = readFileSync(path, 'utf8');
  const arr = JSON.parse(raw);
  return Keypair.fromSecretKey(Uint8Array.from(arr));
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function transferUsdc({ connection, payer, recipient, usdcMint, amountUsd }) {
  const decimals = 6;
  const amount = Math.floor(Number(amountUsd) * 10 ** decimals);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount');

  const payerAta = await getOrCreateAssociatedTokenAccount(connection, payer, usdcMint, payer.publicKey);
  const recipientAtaAddress = await getAssociatedTokenAddress(usdcMint, recipient);

  // Build transfer (create recipient ATA if missing by sending a 0-lamport idempotent create? For simplicity, assume it exists)
  const ix = createTransferInstruction(
    payerAta.address,
    recipientAtaAddress,
    payer.publicKey,
    amount,
    [],
    TOKEN_PROGRAM_ID
  );

  const tx = new Transaction().add(ix);
  const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
  return sig;
}

async function main() {
  const payerPath = env('PAYER_KEYPAIR_PATH', './my-solana-keypair.json');
  const recipientPubkeyStr = env('RECIPIENT_PUBKEY');
  const amountUsd = Number(env('AMOUNT_USDC', '0.01'));
  const intervalSec = Number(env('INTERVAL_SEC', '60'));
  const rpcUrl = env('SOLANA_RPC_URL', clusterApiUrl('devnet'));
  const usdcMintStr = env('USDC_MINT', '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

  if (!recipientPubkeyStr) {
    console.error('RECIPIENT_PUBKEY is required');
    process.exit(1);
  }

  const connection = new Connection(rpcUrl, 'confirmed');
  const payer = loadKeypair(payerPath);
  const recipient = new PublicKey(recipientPubkeyStr);
  const usdcMint = new PublicKey(usdcMintStr);

  console.log('=== Auto Pay Loop (USDC) ===');
  console.log('RPC:', rpcUrl);
  console.log('Payer:', payer.publicKey.toBase58());
  console.log('Recipient:', recipient.toBase58());
  console.log('USDC Mint:', usdcMint.toBase58());
  console.log('Amount (USDC):', amountUsd);
  console.log('Interval (sec):', intervalSec);

  // Warm-up: ensure payer ATA exists
  await getOrCreateAssociatedTokenAccount(connection, payer, usdcMint, payer.publicKey);

  // Loop forever
  // Safety: you can set MAX_TX env to limit number of transfers
  const maxTx = Number(env('MAX_TX', '0')); // 0 = unlimited
  let count = 0;
  while (true) {
    try {
      if (maxTx && count >= maxTx) {
        console.log('Max transfers reached. Exiting.');
        break;
      }
      console.log(`\n[${new Date().toISOString()}] Sending ${amountUsd} USDC...`);
      const sig = await transferUsdc({ connection, payer, recipient, usdcMint, amountUsd });
      console.log('✅ Signature:', sig);
      console.log('Explorer:', `https://explorer.solana.com/tx/${sig}?cluster=devnet`);
      count += 1;
    } catch (e) {
      console.error('❌ Transfer error:', e?.message || e);
    }
    await sleep(intervalSec * 1000);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
