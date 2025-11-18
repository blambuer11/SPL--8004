import { Connection, PublicKey, SystemProgram, Keypair, Transaction } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function discriminator(name) {
  const hash = crypto.createHash('sha256').update(`global:${name}`).digest();
  return hash.subarray(0, 8);
}

function u16le(n) {
  const buf = Buffer.alloc(2);
  buf.writeUInt16LE(n);
  return buf;
}

async function main() {
  const authorityStr = process.env.AUTHORITY;
  const treasuryStr = process.env.TREASURY;
  const feeBpsStr = process.env.FEE_BPS || '50';
  if (!authorityStr || !treasuryStr) throw new Error('AUTHORITY and TREASURY env vars are required');
  const feeBps = parseInt(feeBpsStr, 10);
  if (!(feeBps >= 0 && feeBps <= 1000)) throw new Error('FEE_BPS must be 0..1000');

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const walletPath = process.env.SOLANA_WALLET || path.resolve(process.env.HOME, '.config/solana/id.json');
  const secret = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
  const payer = Keypair.fromSecretKey(Uint8Array.from(secret));

  const programId = new PublicKey('6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia');
  const [configPda] = PublicKey.findProgramAddressSync([Buffer.from('config')], programId);

  const data = Buffer.concat([
    discriminator('initialize_config'),
    new PublicKey(authorityStr).toBytes(),
    new PublicKey(treasuryStr).toBytes(),
    u16le(feeBps),
  ]);

  const keys = [
    { pubkey: configPda, isSigner: false, isWritable: true },
    { pubkey: payer.publicKey, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  console.log('Program   :', programId.toBase58());
  console.log('Config PDA:', configPda.toBase58());
  console.log('Authority :', authorityStr);
  console.log('Treasury  :', treasuryStr);
  console.log('Fee (bps) :', feeBps);

  const ix = { keys, programId, data };
  const tx = new Transaction().add(ix);
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const sig = await connection.sendTransaction(tx, [payer]);
  console.log('Initialize tx:', sig);
  console.log(`Explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
}

main().catch((e) => { console.error(e); process.exit(1); });
