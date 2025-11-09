// Delivery Handshake Protocol (Drone ↔ Home Robot)
// Scenario: Drone (payer) arrives, Home Robot (receiver) verifies agent identity and payment.
// Steps:
// 1. Drone sends its agentId + ephemeral public key.
// 2. Home Robot resolves agentId (SPL-8004) to wallet owner, issues a signed challenge.
// 3. Drone signs challenge (proves control of agent wallet or linked key) and initiates USDC payment with memo including: HANDSHAKE|agentId|timestamp|nonce
// 4. Home Robot watches for a matching transfer (amount + memo + sender) and validates signature + freshness.
// 5. On success, door unlock logic (placeholder) executes.
// NOTE: This is an off-chain orchestrator sample. Production: move receipts on-chain.

import { readFileSync } from 'node:fs';
import { Connection, PublicKey, Keypair, clusterApiUrl, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import nacl from 'tweetnacl';
import { resolveAgentId as resolveAgentIdOnChain } from './spl8004-resolver.mjs';

function env(key, def) { return process.env[key] ?? def; }
function loadKeypair(path) { const raw = JSON.parse(readFileSync(path, 'utf8')); return Keypair.fromSecretKey(Uint8Array.from(raw)); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

// ✅ ON-CHAIN: Resolve agentId -> owner wallet via SPL-8004 Identity PDA
async function resolveAgentId(agentId, connection) {
  try {
    return await resolveAgentIdOnChain(agentId, connection);
  } catch (error) {
    console.error(`Failed to resolve agentId on-chain: ${error.message}`);
    // Fallback to env variable for testing/demo
    const fallback = env('AGENT_OWNER_PUBKEY');
    if (!fallback) throw error;
    console.warn(`⚠️ Using fallback AGENT_OWNER_PUBKEY: ${fallback}`);
    return new PublicKey(fallback);
  }
}

function generateChallenge() {
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  const timestamp = Date.now();
  return { nonce: Buffer.from(nonce).toString('hex'), timestamp };
}

function signChallenge(challenge, keypair) {
  const data = Buffer.from(`${challenge.timestamp}|${challenge.nonce}`);
  const sig = nacl.sign.detached(data, keypair.secretKey);
  return Buffer.from(sig).toString('hex');
}

function verifyChallenge(challenge, signatureHex, pubkey) {
  const data = Buffer.from(`${challenge.timestamp}|${challenge.nonce}`);
  const sig = Buffer.from(signatureHex, 'hex');
  return nacl.sign.detached.verify(data, sig, pubkey.toBytes());
}

async function sendPayment({ connection, payer, recipient, usdcMint, amountUsd, memo }) {
  const decimals = 6;
  const lamports = Math.floor(amountUsd * 10 ** decimals);
  const payerAta = await getAssociatedTokenAddress(usdcMint, payer.publicKey);
  const recipientAta = await getAssociatedTokenAddress(usdcMint, recipient);
  const ix = createTransferInstruction(payerAta, recipientAta, payer.publicKey, lamports, [], TOKEN_PROGRAM_ID);
  // Optional memo program
  const memoIx = new Transaction().add(ix);
  const tx = memoIx;
  tx.add({
    keys: [],
    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
    data: Buffer.from(memo, 'utf8')
  });
  const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
  return sig;
}

async function watchForPayment({ connection, recipient, expectedAmountUsd, usdcMint, memoPrefix, timeoutMs }) {
  const start = Date.now();
  const decimals = 6;
  const targetAmount = Math.floor(expectedAmountUsd * 10 ** decimals);
  const recipientAta = await getAssociatedTokenAddress(usdcMint, recipient);
  
  console.log(`👀 Watching for payment to ${recipientAta.toBase58()}`);
  console.log(`   Expected amount: ${targetAmount} (${expectedAmountUsd} USDC)`);
  console.log(`   Memo prefix: ${memoPrefix}`);
  
  let lastSignature = null;
  
  while (Date.now() - start < timeoutMs) {
    try {
      // Fetch recent signatures for recipient token account
      const signatures = await connection.getSignaturesForAddress(recipientAta, {
        limit: 10,
        before: lastSignature,
      });
      
      if (signatures.length === 0) {
        await sleep(3000);
        continue;
      }
      
      // Process signatures newest-first
      for (const sigInfo of signatures) {
        if (sigInfo.err) continue; // skip failed transactions
        
        const tx = await connection.getParsedTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0,
        });
        
        if (!tx || !tx.meta || tx.meta.err) continue;
        
        // Check for SPL token transfer to our ATA
        const postTokenBalances = tx.meta.postTokenBalances || [];
        const preTokenBalances = tx.meta.preTokenBalances || [];
        
        // Find balance change for recipient ATA
        const postBalance = postTokenBalances.find(b => b.mint === usdcMint.toBase58() && b.owner === recipient.toBase58());
        const preBalance = preTokenBalances.find(b => b.mint === usdcMint.toBase58() && b.owner === recipient.toBase58());
        
        if (!postBalance || !preBalance) continue;
        
        const amountReceived = Number(postBalance.uiTokenAmount.amount) - Number(preBalance.uiTokenAmount.amount);
        
        if (amountReceived === targetAmount) {
          // Check memo in transaction
          const memoInstruction = tx.transaction.message.instructions.find(
            ix => ix.programId.toBase58() === 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
          );
          
          if (memoInstruction && 'parsed' in memoInstruction) {
            // Parsed memo
            const memoText = memoInstruction.parsed;
            if (memoText && memoText.startsWith(memoPrefix)) {
              console.log(`✅ Payment found! Signature: ${sigInfo.signature}`);
              console.log(`   Amount: ${amountReceived} (${expectedAmountUsd} USDC)`);
              console.log(`   Memo: ${memoText.substring(0, 100)}...`);
              return {
                found: true,
                signature: sigInfo.signature,
                amount: expectedAmountUsd,
                memo: memoText,
                blockTime: sigInfo.blockTime,
              };
            }
          } else if (memoInstruction && 'data' in memoInstruction) {
            // Raw memo data (base58 encoded)
            const memoText = Buffer.from(memoInstruction.data, 'base64').toString('utf8');
            if (memoText.startsWith(memoPrefix)) {
              console.log(`✅ Payment found! Signature: ${sigInfo.signature}`);
              return {
                found: true,
                signature: sigInfo.signature,
                amount: expectedAmountUsd,
                memo: memoText,
                blockTime: sigInfo.blockTime,
              };
            }
          }
        }
      }
      
      // Update lastSignature for pagination
      if (signatures.length > 0) {
        lastSignature = signatures[signatures.length - 1].signature;
      }
      
      await sleep(3000);
    } catch (err) {
      console.error(`Error watching for payment: ${err.message}`);
      await sleep(5000);
    }
  }
  
  console.log('⏱️ Payment watch timeout');
  return { found: false };
}

async function main() {
  const mode = env('MODE', 'drone'); // drone or home
  const agentId = env('AGENT_ID', 'agent-drone-001');
  const usdcMintStr = env('USDC_MINT', '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
  const rpcUrl = env('SOLANA_RPC_URL', clusterApiUrl('devnet'));
  const amountUsd = Number(env('DELIVERY_FEE_USDC', '0.05'));
  const payerKeyPath = env('PAYER_KEYPAIR_PATH', './my-solana-keypair.json');
  const timeoutMs = Number(env('TIMEOUT_MS', '60000'));

  const connection = new Connection(rpcUrl, 'confirmed');
  const usdcMint = new PublicKey(usdcMintStr);

  console.log('Handshake start:', { mode, agentId, amountUsd });

  if (mode === 'home') {
    // Home Robot side: issue challenge
    const owner = await resolveAgentId(agentId, connection);
    console.log(`🏠 Resolved agentId '${agentId}' -> owner: ${owner.toBase58()}`);
    const challenge = generateChallenge();
    console.log('Challenge issued:', challenge);
    console.log('Send challenge to drone (out-of-band). Await signature...');
    // For demo: simulate receiving signature
    const payerKeypair = loadKeypair(payerKeyPath); // Drone key (for simulation)
    const signatureHex = signChallenge(challenge, payerKeypair);
    const valid = verifyChallenge(challenge, signatureHex, payerKeypair.publicKey);
    console.log('Challenge signature valid:', valid);
    if (!valid) throw new Error('Invalid challenge signature');
    // Wait payment
    const memoPrefix = `HANDSHAKE|${agentId}|${challenge.timestamp}|${challenge.nonce}`;
    console.log('Watching for payment memo prefix:', memoPrefix);
    const res = await watchForPayment({ connection, recipient: owner, expectedAmountUsd: amountUsd, usdcMint, memoPrefix, timeoutMs });
    console.log('Payment watch result:', res);
    if (res.found) {
      console.log('✅ Delivery fee received. Unlock door.');
    } else {
      console.error('❌ Payment timeout');
    }
  } else if (mode === 'drone') {
    // Drone side: receive challenge (simulate generation here), sign and pay
    const payer = loadKeypair(payerKeyPath);
    const recipient = await resolveAgentId(agentId, connection); // Home wallet
    console.log(`🚁 Resolved agentId '${agentId}' -> recipient: ${recipient.toBase58()}`);
    const challenge = generateChallenge(); // In reality received from home
    const signatureHex = signChallenge(challenge, payer);
    console.log('Signed challenge (hex):', signatureHex.slice(0, 32) + '...');
    const memo = `HANDSHAKE|${agentId}|${challenge.timestamp}|${challenge.nonce}|SIG:${signatureHex.substring(0,32)}`;
    const sig = await sendPayment({ connection, payer, recipient, usdcMint, amountUsd, memo });
    console.log('Payment signature:', sig);
    console.log('Explorer:', `https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  } else {
    console.error('Unknown MODE, use drone or home');
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
