import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = Number(process.env.KORA_PORT || 8090);
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC, 'confirmed');

// Mock Kora signer keypair (production'da gerçek keypair kullan)
const MOCK_SIGNER = 'MockKoraSignerAddress1111111111111111111111';

/**
 * GET /health
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'kora-mock-rpc', mode: 'development' });
});

/**
 * POST /sign
 * Kora RPC sign endpoint mock
 * Gerçek Kora'da: Transaction'ı Kora signer ile imzalar
 */
app.post('/sign', async (req: Request, res: Response) => {
  try {
    const { transaction, network } = req.body;

    if (!transaction) {
      return res.status(400).json({ error: 'Missing transaction' });
    }

    console.log('🔐 Kora Mock: Signing transaction for', network);

    // Mock response - gerçek Kora'da signed transaction döner
    res.json({
      success: true,
      signedTransaction: transaction, // Gerçekte imzalanmış olurdu
      signer: MOCK_SIGNER,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    console.error('Kora sign error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /signTransaction
 * Alias for /sign to be compatible with KoraClient
 */
app.post('/signTransaction', async (req: Request, res: Response) => {
  try {
    const { transaction, network } = req.body;

    if (!transaction) {
      return res.status(400).json({ error: 'Missing transaction' });
    }

    console.log('🔐 Kora Mock: signTransaction (alias) for', network);

    res.json({
      success: true,
      signedTransaction: transaction,
      signer: MOCK_SIGNER,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    console.error('Kora signTransaction error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /broadcast
 * Kora RPC broadcast endpoint mock
 * Gerçek Kora'da: Solana'ya transaction broadcast eder
 */
app.post('/broadcast', async (req: Request, res: Response) => {
  try {
    const { transaction, network } = req.body;

    if (!transaction) {
      return res.status(400).json({ error: 'Missing transaction' });
    }

    console.log('📡 Kora Mock: Broadcasting transaction to', network);

    // Mock signature - gerçek Kora'da gerçek tx signature döner
    const mockSig = `KORA_BROADCAST_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    res.json({
      success: true,
      signature: mockSig,
      network: network || 'solana-devnet',
      explorerUrl: `https://explorer.solana.com/tx/${mockSig}?cluster=devnet`,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    console.error('Kora broadcast error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /signAndSendTransaction
 * Alias for /broadcast to be compatible with KoraClient
 * NOW ACTUALLY SENDS TO BLOCKCHAIN!
 */
app.post('/signAndSendTransaction', async (req: Request, res: Response) => {
  try {
    const { transaction, network } = req.body;

    if (!transaction) {
      return res.status(400).json({ error: 'Missing transaction' });
    }

    console.log('📡 Kora Mock: signAndSendTransaction to', network);
    console.log('🚀 Attempting REAL blockchain broadcast...');

    // Deserialize transaction from base64
    const txBuffer = Buffer.from(transaction, 'base64');
    let tx: Transaction | VersionedTransaction;
    
    try {
      // Try as VersionedTransaction first
      tx = VersionedTransaction.deserialize(txBuffer);
      console.log('📦 Deserialized as VersionedTransaction');
    } catch {
      // Fallback to legacy Transaction
      tx = Transaction.from(txBuffer);
      console.log('📦 Deserialized as legacy Transaction');
    }

    // Send to blockchain
    const signature = await connection.sendRawTransaction(txBuffer, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    console.log('✅ Transaction sent! Signature:', signature);
    console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log('✅ Transaction confirmed!');

    res.json({
      success: true,
      signature,
      network: network || 'solana-devnet',
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      timestamp: Date.now(),
      confirmed: true,
    });
  } catch (error: unknown) {
    console.error('❌ Kora signAndSendTransaction error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /verify-payment
 * Ödeme doğrulama endpoint'i
 */
app.post('/verify-payment', async (req: Request, res: Response) => {
  try {
    const { signature, expectedAmount, expectedRecipient, tokenMint } = req.body;

    console.log('✅ Kora Mock: Verifying payment', { signature, expectedAmount, expectedRecipient });

    // Mock verification - gerçek Kora on-chain kontrol yapar
    const isValid = true; // Gerçekte blockchain'den confirm eder

    res.json({
      isValid,
      signature,
      amount: expectedAmount,
      recipient: expectedRecipient,
      tokenMint,
      confirmedAt: Date.now(),
    });
  } catch (error: unknown) {
    console.error('Kora verify error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /getPayerSigner
 * Returns mock payer signer address to satisfy KoraClient.getPayerSigner
 */
app.get('/getPayerSigner', async (_req: Request, res: Response) => {
  try {
    res.json({ address: MOCK_SIGNER });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   🌐 Kora Mock RPC Server                ║
║   📡 http://localhost:${PORT}             ║
║   🔧 Mode: Development/Testing           ║
║   ⚠️  Mock Mode - Not for production     ║
╚══════════════════════════════════════════╝
  `);
});
