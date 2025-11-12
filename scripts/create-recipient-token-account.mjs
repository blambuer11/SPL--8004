#!/usr/bin/env node
/**
 * Create token account for recipient (agent owner)
 */

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import fs from 'fs';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Read payer keypair
const payerKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync('./my-solana-keypair.json', 'utf-8')))
);

console.log('💳 Payer:', payerKeypair.publicKey.toBase58());

// Get recipient address from command line
const recipientAddress = process.argv[2];
if (!recipientAddress) {
  console.error('❌ Usage: node create-recipient-token-account.mjs <RECIPIENT_ADDRESS>');
  process.exit(1);
}

const recipient = new PublicKey(recipientAddress);
console.log('🎯 Recipient:', recipient.toBase58());

const connection = new Connection(DEVNET_RPC, 'confirmed');

async function main() {
  // Get associated token address
  const tokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    recipient
  );

  console.log('📝 Token account:', tokenAccount.toBase58());

  // Check if already exists
  const accountInfo = await connection.getAccountInfo(tokenAccount);
  if (accountInfo) {
    console.log('✅ Token account already exists!');
    return;
  }

  console.log('🔨 Creating token account...');

  // Create instruction
  const ix = createAssociatedTokenAccountInstruction(
    payerKeypair.publicKey, // payer
    tokenAccount,           // ata
    recipient,              // owner
    USDC_MINT              // mint
  );

  // Send transaction
  const tx = new Transaction().add(ix);
  const signature = await sendAndConfirmTransaction(connection, tx, [payerKeypair]);

  console.log('✅ Token account created!');
  console.log('📝 Signature:', signature);
}

main().catch(console.error);
