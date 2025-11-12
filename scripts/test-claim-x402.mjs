#!/usr/bin/env node
/**
 * Test X402 Claim Flow
 * Tests instant payment (claim) functionality
 */

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const X402_PROGRAM_ID = new PublicKey('6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

async function main() {
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  
  // Load wallet
  let wallet;
  try {
    const keypairData = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8'));
    wallet = Keypair.fromSecretKey(new Uint8Array(keypairData));
  } catch (err) {
    console.error('❌ Wallet bulunamadı. Solana CLI ile wallet oluşturun:');
    console.error('   solana-keygen new');
    process.exit(1);
  }

  const walletAddress = wallet.publicKey;
  console.log('🔑 Wallet:', walletAddress.toBase58());

  // Check SOL balance
  const solBalance = await connection.getBalance(walletAddress);
  console.log('💰 SOL Balance:', (solBalance / 1e9).toFixed(4), 'SOL');

  if (solBalance < 0.01e9) {
    console.error('❌ Yetersiz SOL! Devnet SOL alın:');
    console.error('   solana airdrop 2 --url devnet');
    process.exit(1);
  }

  // Check USDC balance
  const usdcTokenAccount = await getAssociatedTokenAddress(USDC_MINT, walletAddress);
  console.log('💵 USDC Token Account:', usdcTokenAccount.toBase58());

  try {
    const tokenInfo = await connection.getTokenAccountBalance(usdcTokenAccount);
    const usdcBalance = tokenInfo.value.uiAmount || 0;
    console.log('💵 USDC Balance:', usdcBalance, 'USDC');

    if (usdcBalance < 0.1) {
      console.warn('⚠️  USDC yetersiz! Claim için en az 0.1 USDC gerekli');
      console.warn('');
      console.warn('🔧 Çözüm:');
      console.warn('   1. Devnet USDC faucet kullanın');
      console.warn('   2. Veya test için başka bir wallet\'dan transfer edin');
      console.warn('');
      console.warn('📝 USDC mint address: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
    }
  } catch (err) {
    console.error('❌ USDC token hesabı bulunamadı!');
    console.error('');
    console.error('🔧 Token hesabı oluşturun:');
    console.error('   spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU --url devnet');
    process.exit(1);
  }

  // Check X402 Config
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    X402_PROGRAM_ID
  );
  console.log('⚙️  X402 Config PDA:', configPda.toBase58());

  try {
    const configInfo = await connection.getAccountInfo(configPda);
    if (configInfo) {
      console.log('✅ X402 Config initialized');
      const treasuryPubkey = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32));
      console.log('🏦 Treasury:', treasuryPubkey.toBase58());
    } else {
      console.error('❌ X402 Config not initialized!');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ X402 Config kontrol hatası:', err.message);
    process.exit(1);
  }

  console.log('');
  console.log('✅ Claim için hazır!');
  console.log('');
  console.log('📋 Claim yapmak için UI\'da:');
  console.log('   1. Wallet\'ı bağlayın (Phantom/Solflare)');
  console.log('   2. Dashboard veya Agents sayfasına gidin');
  console.log('   3. Bir agent\'ın "Claim" butonuna tıklayın');
  console.log('   4. Wallet onayını verin');
  console.log('');
  console.log('💡 Claim miktarı: (Reputation Score * 0.001) USDC');
  console.log('   Örnek: 5000 reputation = 5.0 USDC claim');
  console.log('   Fee: %0.5 (treasury\'ye gider)');
}

main().catch(err => {
  console.error('Hata:', err);
  process.exit(1);
});
