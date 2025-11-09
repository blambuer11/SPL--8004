import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';

const PORT = Number(process.env.API_PORT || 4021);
const NETWORK = process.env.NETWORK || 'solana-devnet';
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'http://localhost:3000';
const PRICE_USD = Number(process.env.API_PRICE_USD || 0.0001);
const RECEIVER = process.env.API_RECEIVER || 'RECEIVER_PUBKEY_REQUIRED';
const USDC_MINT = process.env.USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

const app = express();

// Minimal x402-style middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' && req.path === '/protected') {
    // If client already attached payment response, allow
    const paid = req.header('x-payment-response');
    if (paid) return next();

    // Otherwise respond 402 with payment requirements
    const requirement = {
      version: 'x402-demo-1',
      priceUsd: PRICE_USD,
      network: NETWORK,
      receiver: RECEIVER,
      tokenMint: USDC_MINT,
      facilitator: FACILITATOR_URL,
    };
    res.status(402).json({ status: 402, requirement });
  } else {
    next();
  }
});

app.get('/protected', async (_req: Request, res: Response) => {
  const now = new Date().toISOString();
  res.json({
    data: { message: 'Protected endpoint accessed successfully', timestamp: now },
    status_code: 200,
  });
});

app.get('/health', (_: Request, res: Response) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
