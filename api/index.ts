import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Connection, PublicKey } from '@solana/web3.js';
import { createSPL8004Client } from '../src/lib/spl8004-client';

const app = express();
const PORT = process.env.API_PORT || 3002;
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// API Key Authentication Middleware
interface AuthRequest extends Request {
  apiKey?: string;
  usage?: number;
}

const authenticateAPIKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid API key' });
  }

  const apiKey = authHeader.substring(7);
  
  // TODO: Validate API key against database/Redis
  // For now, accept any non-empty key (DEVELOPMENT ONLY)
  if (!apiKey || apiKey.length < 10) {
    return res.status(401).json({ error: 'Invalid API key format' });
  }

  req.apiKey = apiKey;
  next();
};

// Usage tracking middleware
const trackUsage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // TODO: Increment usage counter in Redis/Database
  // For now, just log
  console.log(`API call from key: ${req.apiKey?.substring(0, 8)}...`);
  next();
};

// Connection singleton
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Health check (no auth required)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'noema-protocol-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// GET /api/agents - List all network agents
app.get('/api/agents', authenticateAPIKey, trackUsage, async (req: AuthRequest, res: Response) => {
  try {
    // Create a mock wallet for read-only operations
    const mockWallet = {
      publicKey: PublicKey.default,
      signTransaction: async () => { throw new Error('Read-only operation'); },
      signAllTransactions: async () => { throw new Error('Read-only operation'); }
    };

    const client = createSPL8004Client(connection, mockWallet as any);
    const agents = await client.getAllNetworkAgents();

    res.json({
      success: true,
      count: agents.length,
      data: agents.map(a => ({
        agentId: a.agentId,
        owner: a.owner.toString(),
        reputationScore: a.score,
        totalValidations: a.totalValidations,
        approvedValidations: a.approvedValidations,
        active: a.active,
        metadataUri: a.metadataUri
      }))
    });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents',
      message: error.message
    });
  }
});

// GET /api/agents/:agentId - Get specific agent details
app.get('/api/agents/:agentId', authenticateAPIKey, trackUsage, async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    
    const mockWallet = {
      publicKey: PublicKey.default,
      signTransaction: async () => { throw new Error('Read-only operation'); },
      signAllTransactions: async () => { throw new Error('Read-only operation'); }
    };

    const client = createSPL8004Client(connection, mockWallet as any);
    const reputation = await client.getReputation(agentId);

    if (!reputation) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.json({
      success: true,
      data: {
        agentId,
        reputationScore: reputation.score,
        totalValidations: reputation.totalValidations,
        approvedValidations: reputation.approvedValidations,
        rejectedValidations: reputation.rejectedValidations,
        pendingRewards: reputation.pendingRewards,
        claimedRewards: reputation.claimedRewards
      }
    });
  } catch (error: any) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent details',
      message: error.message
    });
  }
});

// GET /api/usage/summary - Get usage statistics for API key
app.get('/api/usage/summary', authenticateAPIKey, async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Fetch real usage from Redis/Database
    // Mock data for now
    const mockUsage = {
      mode: 'dev',
      today: 153,
      total: 4821,
      unitPrice: 0.001,
      todayCost: 0.153,
      totalCost: 4.821
    };

    res.json(mockUsage);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage data',
      message: error.message
    });
  }
});

// POST /api/crypto/solana-pay - Generate Solana Pay URL (no auth required for public payments)
app.post('/api/crypto/solana-pay', async (req: Request, res: Response) => {
  try {
    const { amount, label, message } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: amount'
      });
    }

    // Treasury wallet
    const recipient = process.env.RECEIVING_SOLANA_ADDRESS || '3oxg7wVtdp9T3sx773SMmws8zrGyAJecqTruaXfiw3mN';
    
    // USDC mint address (devnet)
    const usdcMint = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';

    // Create Solana Pay URL
    const url = new URL(`solana:${recipient}`);
    url.searchParams.set('amount', String(amount));
    url.searchParams.set('spl-token', usdcMint);
    
    if (label) {
      url.searchParams.set('label', label);
    }
    
    if (message) {
      url.searchParams.set('message', message);
    }

    res.status(200).json({
      success: true,
      url: url.toString(),
      recipient,
      amount
    });
  } catch (error: unknown) {
    console.error('Error generating Solana Pay URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Solana Pay URL',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/crypto/verify-payment - Verify Solana payment (no auth required)
app.post('/api/crypto/verify-payment', async (req: Request, res: Response) => {
  try {
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: signature'
      });
    }

    // Verify transaction on-chain
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!tx) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Check if transaction was successful
    if (tx.meta?.err) {
      return res.status(400).json({
        success: false,
        error: 'Transaction failed',
        details: tx.meta.err
      });
    }

    res.json({
      success: true,
      verified: true,
      signature,
      slot: tx.slot,
      blockTime: tx.blockTime
    });
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/payment - Create X402 payment (requires wallet signature in production)
app.post('/api/payment', authenticateAPIKey, trackUsage, async (req: AuthRequest, res: Response) => {
  try {
    const { recipient, amount, memo } = req.body;

    if (!recipient || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: recipient, amount'
      });
    }

    // TODO: Integrate with X402 facilitator
    // For now, forward to X402 facilitator on port 3001
    const response = await fetch('http://localhost:3001/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, amount, memo })
    });

    const data = await response.json();

    res.json({
      success: data.success,
      signature: data.signature,
      timestamp: data.timestamp
    });
  } catch (error: unknown) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Noema Protocol REST API running on http://localhost:${PORT}`);
  console.log(`📊 Rate limit: 120 requests/minute`);
  console.log(`🔗 RPC Endpoint: ${RPC_ENDPOINT}`);
});

export default app;
