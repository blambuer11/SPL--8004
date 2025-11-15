import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { createNoemaLinkClient } from '../src/lib/noema/link-client';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const rpc = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpc, 'confirmed');

  // Load authority wallet (same as used for staking) - fallback to default keypair path
  const fs = await import('fs');
  const path = process.env.WALLET_PATH || `${process.env.HOME}/.config/solana/id.json`;
  if (!fs.existsSync(path)) throw new Error(`Wallet keypair not found at ${path}`);
  const secret = Uint8Array.from(JSON.parse(fs.readFileSync(path, 'utf-8')));
  const authority = Keypair.fromSecretKey(secret);

  // Minimal wallet adapter
  const wallet = {
    publicKey: authority.publicKey,
    async signTransaction(tx: Transaction) {
      tx.sign(authority);
      return tx;
    }
  };

  const client = createNoemaLinkClient(connection, wallet);
  const existing = await client.getLinkAccount(authority.publicKey);
  if (existing) {
    console.log('Already linked:', existing);
    return;
  }
  console.log('Linking validators for authority', authority.publicKey.toBase58());
  const sig = await client.link();
  console.log('Link transaction signature:', sig);
  const after = await client.getLinkAccount(authority.publicKey);
  console.log('Link account created:', after);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
