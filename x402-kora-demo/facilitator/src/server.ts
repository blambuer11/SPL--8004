import 'dotenv/config';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { KoraClient } from './koraClient';

const PORT = Number(process.env.FACILITATOR_PORT || 3000);
const MOCK = process.env.MOCK_MODE === 'true';
const KORA_URL = process.env.KORA_URL || 'http://localhost:8080';
const KORA_API_KEY = process.env.KORA_API_KEY || '';

const app = express();
app.use(express.json({ limit: '1mb' }));

// Simple x402 payload schema (demo)
const PaymentPayload = z.object({
  network: z.string(),
  receiver: z.string(),
  amount: z.string(), // USDC (6 decimals as string)
  tokenMint: z.string(),
  serializedTx: z.string(),
});

// Announce capabilities
app.get('/supported', async (_req: Request, res: Response) => {
  if (MOCK) {
    return res.json({
      version: 'x402-demo-1',
      scheme: 'exact',
      network: process.env.NETWORK || 'solana-devnet',
      feePayer: 'MOCK_FEE_PAYER',
    });
  }
  try {
    const kora = new KoraClient({ url: KORA_URL, apiKey: KORA_API_KEY });
    const { address } = await kora.getPayerSigner();
    res.json({
      version: 'x402-demo-1',
      scheme: 'exact',
      network: process.env.NETWORK || 'solana-devnet',
      feePayer: address,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Verify payment without broadcasting
app.post('/verify', async (req: Request, res: Response) => {
  const parse = PaymentPayload.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.message });
  const { serializedTx } = parse.data;

  if (MOCK) return res.json({ isValid: true });
  try {
    const kora = new KoraClient({ url: KORA_URL, apiKey: KORA_API_KEY });
    const out = await kora.signTransaction(serializedTx);
    res.json({ isValid: out.isValid });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Settle payment: sign and send
app.post('/settle', async (req: Request, res: Response) => {
  const parse = PaymentPayload.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.message });
  const { serializedTx } = parse.data;

  if (MOCK) return res.json({ signature: 'MOCK_SIGNATURE_' + Date.now() });
  try {
    const kora = new KoraClient({ url: KORA_URL, apiKey: KORA_API_KEY });
    const out = await kora.signAndSendTransaction(serializedTx);
    res.json({ signature: out.signature });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`[facilitator] listening on http://localhost:${PORT}`);
});
