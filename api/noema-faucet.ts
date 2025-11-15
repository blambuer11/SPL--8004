import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const NOEMA_MINT = new PublicKey(process.env.VITE_NOEMA_MINT || 'FvpASWE5nchrdWj8EchyM3QSiW8bRtbkiabbUfyVTo5r');
const FAUCET_AMOUNT = 100; // 100 NOEMA per request
const FAUCET_DECIMALS = 9;

// Rate limiting: 1 request per wallet per hour
const requestLog = new Map<string, number>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Validate wallet address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(walletAddress);
    } catch {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Rate limiting check
    const now = Date.now();
    const lastRequest = requestLog.get(walletAddress);
    if (lastRequest && now - lastRequest < 60 * 60 * 1000) { // 1 hour
      const remainingTime = Math.ceil((60 * 60 * 1000 - (now - lastRequest)) / 1000 / 60);
      return res.status(429).json({ 
        error: `Rate limit exceeded. Try again in ${remainingTime} minutes.` 
      });
    }

    // Get faucet keypair from environment
    const faucetKeypairJson = process.env.FAUCET_KEYPAIR;
    if (!faucetKeypairJson) {
      console.error('FAUCET_KEYPAIR not configured');
      return res.status(500).json({ error: 'Faucet not configured' });
    }

    const faucetKeypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(faucetKeypairJson))
    );

    // Connect to devnet
    const connection = new Connection(
      process.env.RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Get or create ATAs
    const faucetAta = await getAssociatedTokenAddress(
      NOEMA_MINT,
      faucetKeypair.publicKey
    );

    const recipientAta = await getAssociatedTokenAddress(
      NOEMA_MINT,
      recipientPubkey
    );

    // Check faucet balance
    const faucetBalance = await connection.getTokenAccountBalance(faucetAta);
    const requiredAmount = FAUCET_AMOUNT * Math.pow(10, FAUCET_DECIMALS);
    
    if (!faucetBalance.value.amount || parseInt(faucetBalance.value.amount) < requiredAmount) {
      return res.status(503).json({ error: 'Faucet is empty. Please contact support.' });
    }

    // Build transaction
    const transaction = new Transaction();
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = faucetKeypair.publicKey;

    // Check if recipient ATA exists
    const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
    if (!recipientAtaInfo) {
      // Create ATA for recipient
      transaction.add(
        createAssociatedTokenAccountInstruction(
          faucetKeypair.publicKey, // payer
          recipientAta, // ata
          recipientPubkey, // owner
          NOEMA_MINT // mint
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        faucetAta, // from
        recipientAta, // to
        faucetKeypair.publicKey, // authority
        requiredAmount // amount
      )
    );

    // Sign and send
    transaction.sign(faucetKeypair);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature, 'confirmed');

    // Update rate limit log
    requestLog.set(walletAddress, now);

    return res.status(200).json({
      success: true,
      signature,
      amount: FAUCET_AMOUNT,
      message: `${FAUCET_AMOUNT} NOEMA tokens sent successfully!`
    });

  } catch (error) {
    console.error('Faucet error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to process faucet request' 
    });
  }
}
