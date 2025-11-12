#!/usr/bin/env node
/**
 * Send test USDC from first wallet to second wallet
 */

import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import fs from 'fs';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

async function main() {
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  
  const toWallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8')))
  );

  console.log('📤 Gönderen: E7iiAKWj43REw4Vy1Lw1Neu86m5HiBX8ER5dKZTmvvvu');
  console.log('📥 Alıcı:', toWallet.publicKey.toBase58());
  console.log('💵 Miktar: 10 USDC');
  console.log('');
  console.log('⚠️  Not: İlk wallet\'ta (E7ii...) USDC olmalı!');
  console.log('');
  console.log('🔧 Test için alternatif: Devnet faucet kullanın veya');
  console.log('   başka bir kaynaktan USDC transfer edin');
}

main();
