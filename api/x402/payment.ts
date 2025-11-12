import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createHash } from 'crypto';

// Configuration
const SOLANA_RPC = process.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const X402_PROGRAM_ID = new PublicKey('6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // Devnet USDC
const TREASURY = new PublicKey('3oxg7wVtdp9T3sx773SMmws8zrGyAJecqTruaXfiw3mN');

// Rate limiting (in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

interface PaymentRequest {
  amount: number; // in USDC (e.g., 0.01)
  recipient: string; // Agent owner wallet address
  memo?: string;
  apiKey?: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
  paymentInfo?: {
    amount: number;
    recipient: string;
    fee: number;
    netAmount: number;
    timestamp: number;
  };
}

// API Key validation (use environment variable or database)
const VALID_API_KEYS = new Set([
  process.env.X402_API_KEY_1,
  process.env.X402_API_KEY_2,
  'noema_sk_demo_12345', // Demo key for testing
]);

function validateApiKey(apiKey?: string): boolean {
  if (!apiKey) return false;
  return VALID_API_KEYS.has(apiKey);
}

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

function getLittleEndianBytes(value: number, bytes: number): Buffer {
  const buf = Buffer.alloc(bytes);
  let val = Math.floor(value);
  for (let i = 0; i < bytes; i++) {
    buf[i] = val & 0xff;
    val = Math.floor(val / 256);
  }
  return buf;
}

async function createX402Payment(
  connection: Connection,
  amount: number,
  recipientAddress: string,
  memo: string
): Promise<{ transaction: Transaction; paymentPda: PublicKey; fee: number }> {
  const recipient = new PublicKey(recipientAddress);
  const amountLamports = Math.floor(amount * 1_000_000); // USDC has 6 decimals
  const fee = Math.floor(amountLamports * 0.005); // 0.5% fee
  const netAmount = amountLamports - fee;

  // Get config PDA
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    X402_PROGRAM_ID
  );

  // Find available payment PDA (retry with timestamp offsets)
  let paymentPda: PublicKey | null = null;
  let timestamp = Math.floor(Date.now() / 1000);
  
  for (let offset = -3; offset <= 3; offset++) {
    const ts = timestamp + offset;
    const timestampBuffer = getLittleEndianBytes(ts, 8);
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('payment'), timestampBuffer],
      X402_PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(pda);
    if (!accountInfo) {
      paymentPda = pda;
      timestamp = ts;
      break;
    }
  }

  if (!paymentPda) {
    throw new Error('No available payment PDA found');
  }

  // Get treasury token account from config
  const configInfo = await connection.getAccountInfo(configPda);
  if (!configInfo) {
    throw new Error('X402 config not initialized');
  }
  
  const treasuryTokenAccount = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32));

  // Get recipient token account
  const recipientTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    recipient
  );

  // Build instruction
  const INSTANT_PAYMENT_DISCRIMINATOR = Buffer.from([159, 239, 183, 134, 33, 68, 121, 86]);
  const timestampBuffer = getLittleEndianBytes(timestamp, 8);
  const amountBuffer = getLittleEndianBytes(amountLamports, 8);
  const memoBytes = Buffer.from(memo.slice(0, 200), 'utf8');
  const memoLen = Buffer.alloc(1);
  memoLen.writeUInt8(memoBytes.length);

  const instructionData = Buffer.concat([
    INSTANT_PAYMENT_DISCRIMINATOR,
    timestampBuffer,
    amountBuffer,
    memoLen,
    memoBytes,
  ]);

  const keys = [
    { pubkey: configPda, isSigner: false, isWritable: false },
    { pubkey: paymentPda, isSigner: false, isWritable: true },
    { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
    { pubkey: treasuryTokenAccount, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  const transaction = new Transaction();
  transaction.add({
    keys,
    programId: X402_PROGRAM_ID,
    data: instructionData,
  });

  return { transaction, paymentPda, fee };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // API documentation
    return res.status(200).json({
      name: 'X402 Payment API',
      version: '1.0.0',
      description: 'Instant USDC payments via X402 protocol on Solana',
      endpoints: {
        POST: {
          path: '/api/x402/payment',
          description: 'Create X402 instant payment transaction',
          authentication: 'Required (x-api-key header)',
          rateLimit: '10 requests per minute',
          requestBody: {
            amount: 'number (USDC amount, e.g., 0.01)',
            recipient: 'string (Solana wallet address)',
            memo: 'string (optional, max 200 chars)',
          },
          response: {
            success: 'boolean',
            transactionId: 'string (if successful)',
            paymentInfo: {
              amount: 'number',
              recipient: 'string',
              fee: 'number (0.5%)',
              netAmount: 'number',
              timestamp: 'number',
            },
          },
        },
      },
      examples: {
        curl: `curl -X POST https://api.noemaprotocol.xyz/api/x402/payment \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: noema_sk_demo_12345" \\
  -d '{"amount": 0.01, "recipient": "WALLET_ADDRESS", "memo": "AI task payment"}'`,
      },
      pricing: '0.5% fee on all payments',
      networks: ['Solana Devnet'],
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // API Key authentication
    const apiKey = req.headers['x-api-key'] as string || req.body.apiKey;
    if (!validateApiKey(apiKey)) {
      return res.status(401).json({ success: false, error: 'Invalid API key' });
    }

    // Rate limiting
    const identifier = req.headers['x-forwarded-for'] as string || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(identifier)) {
      return res.status(429).json({ 
        success: false, 
        error: 'Rate limit exceeded. Maximum 10 requests per minute.' 
      });
    }

    // Validate request body
    const { amount, recipient, memo = '' }: PaymentRequest = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    if (!recipient) {
      return res.status(400).json({ success: false, error: 'Recipient address required' });
    }

    // Validate recipient address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid recipient address' });
    }

    // Create connection
    const connection = new Connection(SOLANA_RPC, 'confirmed');

    // Create payment transaction
    const { transaction, paymentPda, fee } = await createX402Payment(
      connection,
      amount,
      recipient,
      memo
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = recipientPubkey; // Recipient pays SOL fee

    // Serialize transaction for client to sign
    const serializedTx = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const response: PaymentResponse = {
      success: true,
      transactionId: paymentPda.toBase58(),
      paymentInfo: {
        amount,
        recipient,
        fee: fee / 1_000_000,
        netAmount: (amount * 1_000_000 - fee) / 1_000_000,
        timestamp: Date.now(),
      },
    };

    return res.status(200).json({
      ...response,
      transaction: serializedTx.toString('base64'),
      message: 'Transaction created. Sign and submit to Solana network.',
    });

  } catch (error) {
    console.error('X402 payment error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
