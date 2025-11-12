import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';
import fs from 'fs';

function loadKeypair() {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    try {
      const raw = fs.readFileSync(new URL('../my-solana-keypair.json', import.meta.url));
      const arr = JSON.parse(raw.toString());
      return Keypair.fromSecretKey(Uint8Array.from(arr));
    } catch {
      return Keypair.generate();
    }
  }
  const bytes = secret.includes(',') ? secret.split(',').map(n => parseInt(n, 10)) : bs58.decode(secret);
  return Keypair.fromSecretKey(Uint8Array.from(bytes));
}

async function main() {
  const rpc = process.env.RPC || 'https://api.devnet.solana.com';
  const usdcMintStr = process.env.USDC_MINT || process.env.VITE_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
  const recipientRaw = process.env.RECIPIENT || process.env.TEST_RECIPIENT || '';
  const connection = new Connection(rpc, 'confirmed');
  const payer = loadKeypair();
  const usdcMint = new PublicKey(usdcMintStr);

  let recipientPk = null;
  if (recipientRaw) {
    try { recipientPk = new PublicKey(recipientRaw); } catch { console.error('Invalid RECIPIENT'); }
  }

  console.log('RPC       :', rpc);
  console.log('USDC Mint :', usdcMint.toBase58());
  console.log('Payer     :', payer.publicKey.toBase58());
  if (recipientPk) console.log('Recipient :', recipientPk.toBase58());

  const payerAta = await getAssociatedTokenAddress(usdcMint, payer.publicKey);
  let payerBalance = 'N/A';
  try {
    const bal = await connection.getTokenAccountBalance(payerAta);
    payerBalance = bal.value.uiAmountString;
  } catch { payerBalance = '(no ATA)'; }
  console.log('Payer ATA :', payerAta.toBase58(), 'Balance:', payerBalance);

  // List ALL payer token accounts for this mint (not only ATA)
  const payerTAs = await connection.getTokenAccountsByOwner(payer.publicKey, { mint: usdcMint });
  if (payerTAs.value.length === 0) {
    console.log('Payer token accounts (mint): none');
  } else {
    console.log('Payer token accounts (mint):');
    for (const { pubkey } of payerTAs.value) {
      try {
        const b = await connection.getTokenAccountBalance(pubkey);
        console.log('  -', pubkey.toBase58(), 'Balance:', b.value.uiAmountString);
      } catch {
        console.log('  -', pubkey.toBase58(), 'Balance: (error)');
      }
    }
  }

  if (recipientPk) {
    const recipientAta = await getAssociatedTokenAddress(usdcMint, recipientPk, true);
    let recipientBalance = 'N/A';
    try {
      const bal = await connection.getTokenAccountBalance(recipientAta);
      recipientBalance = bal.value.uiAmountString;
    } catch { recipientBalance = '(no ATA)'; }
    console.log('Recipient ATA:', recipientAta.toBase58(), 'Balance:', recipientBalance);

    const recipientTAs = await connection.getTokenAccountsByOwner(recipientPk, { mint: usdcMint });
    if (recipientTAs.value.length === 0) {
      console.log('Recipient token accounts (mint): none');
    } else {
      console.log('Recipient token accounts (mint):');
      for (const { pubkey } of recipientTAs.value) {
        try {
          const b = await connection.getTokenAccountBalance(pubkey);
          console.log('  -', pubkey.toBase58(), 'Balance:', b.value.uiAmountString);
        } catch {
          console.log('  -', pubkey.toBase58(), 'Balance: (error)');
        }
      }
    }
  }
}

main().catch(e => { console.error('Error:', e); process.exit(1); });
