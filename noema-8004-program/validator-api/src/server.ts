import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AgentWallet } from './agentWallet.js';
import { agentIdentityManager } from './agentIdentity.js';

const PORT = Number(process.env.PORT || 4021);
const NETWORK = process.env.NETWORK || 'solana-devnet';
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'http://localhost:3000';
const PRICE_SUBMIT = Number(process.env.PRICE_SUBMIT || 0.001);
const PRICE_LEADERBOARD = Number(process.env.PRICE_LEADERBOARD || 0.0001);
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || 'RECEIVER_PUBKEY_REQUIRED';
const USDC_MINT = process.env.USDC_MINT || 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const KORA_RPC_URL = process.env.KORA_RPC_URL || 'http://localhost:8090';
const KORA_API_KEY = process.env.KORA_API_KEY || 'demo_api_key';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
const agentWallet = new AgentWallet();

// x402 payment requirement helper
function paymentRequirement(priceUsd: number) {
  return {
    version: 'x402-demo-1',
    priceUsd,
    network: NETWORK,
    receiver: TREASURY_ADDRESS,
    tokenMint: USDC_MINT,
    facilitator: FACILITATOR_URL,
  };
}

// x402 middleware for specific endpoints
function requirePayment(priceUsd: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const paidHeader = req.header('x-payment-response');
    if (paidHeader) return next();
    res.status(402).json({ status: 402, requirement: paymentRequirement(priceUsd) });
  };
}

// Routes
app.get('/health', (_: Request, res: Response) => res.json({ status: 'ok', service: 'validator-api' }));

// Paid endpoints
app.post('/api/validations/submit', requirePayment(PRICE_SUBMIT), async (req: Request, res: Response) => {
  // TODO: Optionally validate payment receipt with facilitator
  // TODO: Optionally submit on-chain via validator key
  res.json({ ok: true, accepted: true, ref: `val_${Date.now()}` });
});

app.get('/api/leaderboard', requirePayment(PRICE_LEADERBOARD), async (_req: Request, res: Response) => {
  res.json({
    data: [
      { agentId: 'alpha', score: 9847 },
      { agentId: 'beta', score: 9234 },
      { agentId: 'gamma', score: 8956 },
    ],
  });
});

// Free endpoint
app.get('/api/reputation/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ agentId: id, score: 1234, approvals: 56, rejections: 7 });
});

/**
 * POST /agent/auto-pay
 * Agent autonomous payment endpoint
 * Agent sends payment, gets signature, continues with protected endpoint
 */
app.post('/agent/auto-pay', async (req: Request, res: Response) => {
  try {
    const { agentId, targetEndpoint, priceUsd } = req.body;

    if (!agentId || !targetEndpoint || !priceUsd) {
      return res.status(400).json({ error: 'Missing required fields: agentId, targetEndpoint, priceUsd' });
    }

    // Check if agent keypair exists
    if (!agentWallet.hasKeypair(agentId)) {
      return res.status(404).json({ 
        error: `Agent keypair not found: ${agentId}`,
        availableAgents: agentWallet.listAgents()
      });
    }

    const agentKeypair = agentWallet.getKeypair(agentId)!;
    const usdcMint = new PublicKey(USDC_MINT);
    const receiver = new PublicKey(TREASURY_ADDRESS);

    // Calculate USDC amount (6 decimals)
    const amount = Math.floor(priceUsd * Math.pow(10, 6));

    // Get ATAs
    const senderTokenAccount = await getAssociatedTokenAddress(usdcMint, agentKeypair.publicKey);
    const receiverTokenAccount = await getAssociatedTokenAddress(usdcMint, receiver);

    const transaction = new Transaction();

    // Ensure ATAs exist
    const [senderAtaInfo, receiverAtaInfo] = await Promise.all([
      connection.getAccountInfo(senderTokenAccount),
      connection.getAccountInfo(receiverTokenAccount),
    ]);

    if (!senderAtaInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          agentKeypair.publicKey,
          senderTokenAccount,
          agentKeypair.publicKey,
          usdcMint
        )
      );
    }

    if (!receiverAtaInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          agentKeypair.publicKey,
          receiverTokenAccount,
          receiver,
          usdcMint
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        receiverTokenAccount,
        agentKeypair.publicKey,
        amount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = agentKeypair.publicKey;

    // Sign with agent keypair
    transaction.sign(agentKeypair);

    // Serialize and send to Kora for gasless broadcast
    const serializedTx = transaction.serialize().toString('base64');
    
    const koraResponse = await fetch(`${KORA_RPC_URL}/signAndSendTransaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': KORA_API_KEY,
      },
      body: JSON.stringify({ transaction: serializedTx }),
    });

    if (!koraResponse.ok) {
      const error = await koraResponse.text();
      return res.status(500).json({ error: 'Kora broadcast failed', details: error });
    }

    const koraData: any = await koraResponse.json();
    const signature = koraData.signature;

    console.log(`✅ Agent ${agentId} auto-paid ${priceUsd} USDC: ${signature}`);

    // Record payment in agent identity
    await agentIdentityManager.recordPayment(agentId, priceUsd, signature);

    res.json({
      success: true,
      agentId,
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      amount: priceUsd,
      targetEndpoint,
    });

  } catch (error: any) {
    console.error('❌ Agent auto-pay error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /agent/list
 * List all loaded agent keypairs
 */
app.get('/agent/list', (_req: Request, res: Response) => {
  const agents = agentWallet.listAgents().map(agentId => ({
    agentId,
    publicKey: agentWallet.getPublicKey(agentId),
  }));
  res.json({ agents, count: agents.length });
});

/**
 * POST /agent/identity/create
 * Create SPL-8004 identity for agent
 */
app.post('/agent/identity/create', async (req: Request, res: Response) => {
  try {
    const { agentId, identifier } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: 'Missing agentId' });
    }

    if (!agentWallet.hasKeypair(agentId)) {
      return res.status(404).json({ 
        error: `Agent not found: ${agentId}`,
        availableAgents: agentWallet.listAgents()
      });
    }

    const agentKeypair = agentWallet.getKeypair(agentId)!;
    const agentIdentifier = identifier || `agent_${agentId}_${Date.now()}`;

    const identity = await agentIdentityManager.createAgentIdentity(
      agentId,
      agentKeypair,
      agentIdentifier
    );

    res.json({
      success: true,
      identity,
    });

  } catch (error: any) {
    console.error('❌ Create identity error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /agent/identity/:agentId
 * Get agent identity information
 */
app.get('/agent/identity/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const identity = agentIdentityManager.getIdentity(agentId);

    if (!identity) {
      return res.status(404).json({ 
        error: `No identity found for agent: ${agentId}`,
        hint: 'Create identity first with POST /agent/identity/create'
      });
    }

    res.json({ identity });

  } catch (error: any) {
    console.error('❌ Get identity error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /agent/identities
 * List all agent identities
 */
app.get('/agent/identities', (_req: Request, res: Response) => {
  const identities = agentIdentityManager.listIdentities();
  res.json({ identities, count: identities.length });
});

app.listen(PORT, async () => {
  console.log(`[validator-api] listening on http://localhost:${PORT}`);
  console.log(`[validator-api] loaded ${agentWallet.listAgents().length} agent keypairs`);
  
  // Initialize agent identities
  console.log(`\n🆔 Initializing agent identities...`);
  for (const agentId of agentWallet.listAgents()) {
    const agentKeypair = agentWallet.getKeypair(agentId)!;
    const identifier = `agent_${agentId}_autonomous`;
    
    try {
      const identity = await agentIdentityManager.createAgentIdentity(
        agentId,
        agentKeypair,
        identifier
      );
      console.log(`✅ Identity ready: ${agentId} (PDA: ${identity.identityPda.slice(0, 8)}...)`);
    } catch (error: any) {
      console.error(`❌ Failed to create identity for ${agentId}:`, error.message);
    }
  }
  console.log(`\n🚀 Validator API ready with ${agentWallet.listAgents().length} autonomous agents\n`);
});
