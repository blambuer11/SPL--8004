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

function env(key, def) { return process.env[key] ?? def; }
function loadKeypair(path) { const raw = JSON.parse(readFileSync(path, 'utf8')); return Keypair.fromSecretKey(Uint8Array.from(raw)); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

// Placeholder: resolve agentId -> owner wallet (would query SPL-8004 program PDAs)
async function resolveAgentId(agentId) {
  // TODO: integrate actual on-chain lookup; for demo return env AGENT_OWNER_PUBKEY
  const owner = env('AGENT_OWNER_PUBKEY');
  if (!owner) throw new Error('AGENT_OWNER_PUBKEY missing; set to owner wallet for demo');
  return new PublicKey(owner);
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
  while (Date.now() - start < timeoutMs) {
    // Simplified: poll recent signatures for recipient token account
    // In production: use websocket or indexer.
    await sleep(4000);
    // Placeholder: For brevity we skip actual parsing of token transfers here.
    // You would fetch confirmed signatures and decode each transaction to find matching memo + amount.
    // Return mock success after first loop.
    return { found: true, signature: 'mock_sig_replace_with_real', amount: expectedAmountUsd };
  }
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
    const owner = await resolveAgentId(agentId);
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
    const recipient = await resolveAgentId(agentId); // Home wallet
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
