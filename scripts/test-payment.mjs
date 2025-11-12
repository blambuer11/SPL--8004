import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountIdempotentInstruction, createTransferInstruction, TOKEN_PROGRAM_ID, ACCOUNT_SIZE, createInitializeAccountInstruction } from '@solana/spl-token';
import bs58 from 'bs58';
import fs from 'fs';

// NOTE: This test uses a locally generated ephemeral payer unless SECRET_KEY env provided.
// To actually spend USDC, fund the payer with USDC & SOL beforehand.

function loadKeypair() {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    try {
      const raw = fs.readFileSync(new URL('../my-solana-keypair.json', import.meta.url));
      const arr = JSON.parse(raw.toString());
      console.log('Using my-solana-keypair.json');
      return Keypair.fromSecretKey(Uint8Array.from(arr));
    } catch {
      console.log('⚠️ No SECRET_KEY provided and no my-solana-keypair.json found. Generating ephemeral keypair (will likely fail without USDC/SOL).');
      return Keypair.generate();
    }
  }
  const bytes = secret.includes(',') ? secret.split(',').map(n => parseInt(n, 10)) : bs58.decode(secret);
  return Keypair.fromSecretKey(Uint8Array.from(bytes));
}

async function main() {
  const payer = loadKeypair();
  const recipientFallback = payer.publicKey.toBase58();
  const recipientRaw = process.env.RECIPIENT || process.env.TEST_RECIPIENT || recipientFallback; // wallet address (not agent id for this raw script)
  let recipientPk;
  try { recipientPk = new PublicKey(recipientRaw); } catch { console.error('Invalid recipient public key'); process.exit(1); }

  const amount = parseFloat(process.env.AMOUNT || '0.1');
  if (isNaN(amount) || amount <= 0) { console.error('Invalid AMOUNT'); process.exit(1); }

  const usdcMintStr = process.env.USDC_MINT || process.env.VITE_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
  const usdcMint = new PublicKey(usdcMintStr);
  const rpc = process.env.RPC || process.env.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com';
  const connection = new Connection(rpc, 'confirmed');

  console.log('RPC        :', rpc);
  console.log('Payer      :', payer.publicKey.toBase58());
  console.log('Recipient  :', recipientPk.toBase58());
  console.log('USDC Mint  :', usdcMint.toBase58());
  console.log('Amount     :', amount, 'USDC');

  const NO_ATA = (process.env.NO_ATA || '').toLowerCase() === '1' || (process.env.NO_ATA || '').toLowerCase() === 'true';

  let ixs = [];
  let signers = [payer];
  const amountU64 = Math.floor(amount * 1_000_000); // USDC has 6 decimals

  if (NO_ATA) {
    console.log('Mode       : NO_ATA (manual token accounts)');

    // Source token account: must be owned by payer
    let srcTokenAccountPk;
    const envSrc = process.env.SRC_TOKEN_ACCOUNT;
    if (envSrc) {
      try { srcTokenAccountPk = new PublicKey(envSrc); } catch { console.error('Invalid SRC_TOKEN_ACCOUNT'); process.exit(1); }
    } else {
      const srcList = await connection.getTokenAccountsByOwner(payer.publicKey, { mint: usdcMint });
      if (srcList.value.length > 0) {
        srcTokenAccountPk = srcList.value[0].pubkey;
      }
    }
    if (!srcTokenAccountPk) {
      console.error('No source USDC token account found for payer. Fund payer with USDC and create a token account (non-ATA) or provide SRC_TOKEN_ACCOUNT.');
      process.exit(1);
    }

    // Destination token account: prefer provided -> existing -> create new manual account for recipient
    let dstTokenAccountPk;
    let dstTokenAccountKp = null;
    const envDst = process.env.DST_TOKEN_ACCOUNT;
    if (envDst) {
      try { dstTokenAccountPk = new PublicKey(envDst); } catch { console.error('Invalid DST_TOKEN_ACCOUNT'); process.exit(1); }
    } else {
      const dstList = await connection.getTokenAccountsByOwner(recipientPk, { mint: usdcMint });
      if (dstList.value.length > 0) {
        dstTokenAccountPk = dstList.value[0].pubkey;
      } else {
        // Create manual token account for recipient
        dstTokenAccountKp = Keypair.generate();
        dstTokenAccountPk = dstTokenAccountKp.publicKey;
        const lamports = await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE);
        ixs.push(SystemProgram.createAccount({
          fromPubkey: payer.publicKey,
          newAccountPubkey: dstTokenAccountPk,
          space: ACCOUNT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }));
        ixs.push(createInitializeAccountInstruction(dstTokenAccountPk, usdcMint, recipientPk));
        signers.push(dstTokenAccountKp);
        console.log('Created manual destination token account for recipient:', dstTokenAccountPk.toBase58());
      }
    }

    // Check payer USDC balance before attempting transfer
    try {
      const bal = await connection.getTokenAccountBalance(srcTokenAccountPk);
      console.log('Payer USDC balance (src account):', bal.value.uiAmountString);
    } catch (e) {
      console.log('Payer USDC balance: (cannot read src account)');
    }

    ixs.push(createTransferInstruction(srcTokenAccountPk, dstTokenAccountPk, payer.publicKey, amountU64));

  } else {
    console.log('Mode       : ATA (associated token accounts)');
    // Derive ATAs
    const payerAta = await getAssociatedTokenAddress(usdcMint, payer.publicKey);
    const recipientAta = await getAssociatedTokenAddress(usdcMint, recipientPk, true);

    const payerAtaInfo = await connection.getAccountInfo(payerAta);
    if (!payerAtaInfo) {
      console.log('Adding create payer ATA instruction');
      ixs.push(createAssociatedTokenAccountIdempotentInstruction(payer.publicKey, payerAta, payer.publicKey, usdcMint));
    }
    const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
    if (!recipientAtaInfo) {
      console.log('Adding create recipient ATA instruction');
      ixs.push(createAssociatedTokenAccountIdempotentInstruction(payer.publicKey, recipientAta, recipientPk, usdcMint));
    }

    // Check payer USDC balance before attempting transfer
    try {
      const bal = await connection.getTokenAccountBalance(payerAta);
      console.log('Payer USDC balance:', bal.value.uiAmountString);
    } catch (e) {
      console.log('Payer USDC balance: (no account yet)');
    }

    ixs.push(createTransferInstruction(payerAta, recipientAta, payer.publicKey, amountU64));
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({ feePayer: payer.publicKey, blockhash, lastValidBlockHeight });
  tx.add(...ixs);

  tx.sign(...signers);

  // Simulate first for logs
  const sim = await connection.simulateTransaction(tx);
  if (sim.value.err) {
    console.error('Simulation failed:', sim.value.err);
    console.error('Logs:', sim.value.logs?.join('\n'));
    process.exit(1);
  }
  console.log('Simulation OK');

  const sig = await connection.sendRawTransaction(tx.serialize(), { maxRetries: 3 });
  console.log('Tx Signature:', sig);
  const conf = await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
  if (conf.value.err) {
    console.error('Confirmation error:', conf.value.err);
    process.exit(1);
  }
  console.log('✅ Transfer confirmed');
  console.log('Explorer:', `https://explorer.solana.com/tx/${sig}?cluster=devnet`);
}

main().catch(e => { console.error('Error:', e); process.exit(1); });
