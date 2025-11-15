# Noema SDK 📦

**Unified TypeScript SDK for all Noema Protocol services**

[![npm version](https://img.shields.io/npm/v/@noema/sdk.svg)](https://www.npmjs.com/package/@noema/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@noema/sdk.svg)](https://www.npmjs.com/package/@noema/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

## Overview

Noema SDK provides a **managed, production-ready** interface for interacting with all Noema protocols:
- **SPL-8004**: Agent identity & reputation
- **X402**: Autonomous micropayments
- **X404**: Hybrid NFT-Token mechanics
- **Staking**: Validator rewards & fee distribution

### Two SDK Options

| Package | Use Case | API Key Required | Size | Features |
|---------|----------|-----------------|------|----------|
| **`@noema/sdk`** | Production apps, managed infrastructure | ✅ Yes | 9.5 KB | Auto-pay, webhooks, usage stats, priority support |
| **`@spl-8004/sdk`** | Open-source, self-hosted | ❌ No | 9.2 KB | Core protocol interactions only |

---

## Installation

```bash
# Managed SDK (recommended for production)
npm install @noema/sdk

# Open-source SDK (no API key)
npm install @spl-8004/sdk
```

**Requirements:**
- Node.js 18+ or Bun 1.0+
- Solana wallet (Phantom, Backpack, etc.)
- API key from [noemaprotocol.xyz](https://noemaprotocol.xyz) (for `@noema/sdk`)

---

## Quick Start

### Managed SDK (`@noema/sdk`)

```typescript
import { NoemaClient } from '@noema/sdk';

// Initialize client
const client = new NoemaClient({
  network: 'mainnet-beta',  // or 'devnet'
  apiKey: process.env.NOEMA_API_KEY
});

// Register an AI agent
const agent = await client.registerAgent({
  agentId: 'my-chatbot-v1',
  metadataUri: 'https://example.com/metadata.json',
  capabilities: ['chat', 'analysis', 'automation']
});

console.log(`Agent PDA: ${agent.pda}`);
console.log(`Transaction: ${agent.signature}`);
```

### Open-Source SDK (`@spl-8004/sdk`)

```typescript
import { SPL8004SDK } from '@spl-8004/sdk';
import { Connection, Keypair } from '@solana/web3.js';

// Setup wallet and connection
const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = Keypair.fromSecretKey(/* your secret key */);

const sdk = new SPL8004SDK({
  connection,
  wallet,
  programId: 'Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu'
});

// Register agent (same interface)
const agent = await sdk.registerAgent({
  agentId: 'my-agent',
  metadataUri: 'https://example.com/metadata.json'
});
```

---

## Core Features

### 1. Agent Identity Management

**Register a new agent:**
```typescript
const agent = await client.registerAgent({
  agentId: 'customer-support-bot',
  metadataUri: 'https://cdn.example.com/bot-metadata.json',
  capabilities: ['support', 'ticketing', 'escalation'],
  validator: 'optional-validator-pubkey'
});
```

**Fetch agent details:**
```typescript
const agentInfo = await client.getAgent('agent-pda-address');
console.log(agentInfo);
// {
//   pda: '8xY7...',
//   agentId: 'customer-support-bot',
//   owner: '4tZ9...',
//   metadataUri: 'https://...',
//   reputation: 950,
//   totalTransactions: 1234,
//   createdAt: 1704067200,
//   updatedAt: 1735689600
// }
```

**Update agent metadata:**
```typescript
await client.updateAgent({
  agentPda: '8xY7...',
  metadataUri: 'https://cdn.example.com/bot-metadata-v2.json'
});
```

### 2. X402 Micropayments

**Create autonomous payment:**
```typescript
const payment = await client.createPayment({
  recipient: 'recipient-agent-pda',
  amount: 0.001,  // USDC
  memo: 'API request fee',
  reference: 'invoice-12345'
});

console.log(`Payment sent: ${payment.signature}`);
console.log(`Fee: ${payment.fee} USDC`);  // 0.5% protocol fee
```

**Enable auto-pay for agent (managed SDK only):**
```typescript
await client.enableAutoPay({
  agentPda: 'your-agent-pda',
  budget: 10,  // USDC
  rateLimit: {
    maxPerHour: 100,
    maxPerDay: 1000
  }
});

// Payments now automatically deducted from budget
await client.makeRequest('https://api.example.com/expensive-task');
// X402 payment handled transparently
```

**Query payment history:**
```typescript
const history = await client.getPaymentHistory({
  agentPda: 'your-agent-pda',
  limit: 50,
  offset: 0
});

history.payments.forEach(p => {
  console.log(`${p.timestamp}: ${p.amount} USDC to ${p.recipient}`);
});
```

### 3. Reputation & Validation

**Submit reputation update (validator only):**
```typescript
await client.updateReputation({
  agentPda: 'target-agent-pda',
  score: 100,  // +100 reputation
  reason: 'Successful task completion',
  evidence: 'https://proof.example.com/task-123'
});
```

**Query agent reputation:**
```typescript
const rep = await client.getReputation('agent-pda');
console.log(`Score: ${rep.score}/1000`);
console.log(`Rank: ${rep.rank}`);
console.log(`Validators: ${rep.validatorCount}`);
```

### 4. Staking & Rewards

**Stake NOEMA tokens:**
```typescript
const stake = await client.stakeTokens({
  amount: 100,  // NOEMA
  lockPeriod: 90  // days
});

console.log(`Stake PDA: ${stake.pda}`);
console.log(`Unlock date: ${stake.unlockAt}`);
```

**Claim staking rewards:**
```typescript
const rewards = await client.claimRewards({
  stakePda: 'your-stake-pda'
});

console.log(`Claimed: ${rewards.amount} NOEMA`);
```

**Query staking stats:**
```typescript
const stats = await client.getStakingStats();
console.log(`Total staked: ${stats.totalStaked} NOEMA`);
console.log(`Your share: ${stats.yourShare}%`);
console.log(`Pending rewards: ${stats.pendingRewards} NOEMA`);
```

### 5. X404 Hybrid NFTs (Beta - Devnet only)

**Create X404 collection:**
```typescript
const collection = await client.createX404Collection({
  name: 'Fractionalized Art',
  symbol: 'FART',
  conversionRate: 1000,  // 1000 tokens = 1 NFT
  metadataUri: 'https://arweave.net/collection-metadata'
});

console.log(`Collection: ${collection.address}`);
```

**Mint tokens (auto-converts to NFT at threshold):**
```typescript
const mint = await client.mintX404Tokens({
  collection: 'collection-address',
  amount: 1500  // Will mint 1 NFT + 500 tokens
});

console.log(`NFTs minted: ${mint.nftCount}`);
console.log(`Tokens remaining: ${mint.tokenRemainder}`);
```

**Burn NFT back to tokens:**
```typescript
await client.burnX404NFT({
  nftMint: 'nft-mint-address'
});
// Returns 1000 tokens to wallet
```

---

## Advanced Features (Managed SDK Only)

### Webhooks

**Register webhook for agent events:**
```typescript
await client.registerWebhook({
  url: 'https://your-server.com/webhooks/noema',
  events: ['payment.received', 'reputation.updated', 'stake.claimed'],
  secret: 'your-webhook-secret'
});
```

**Webhook payload example:**
```json
{
  "event": "payment.received",
  "timestamp": 1735689600,
  "data": {
    "agentPda": "8xY7...",
    "amount": 0.001,
    "sender": "4tZ9...",
    "signature": "3Kp2..."
  },
  "signature": "hmac-sha256-signature"
}
```

### Usage Analytics

```typescript
const usage = await client.getUsageSummary({
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});

console.log(`API calls: ${usage.totalCalls}`);
console.log(`Payments: ${usage.totalPayments}`);
console.log(`Revenue: ${usage.totalRevenue} USDC`);
console.log(`Top endpoint: ${usage.topEndpoint}`);
```

### Batch Operations

```typescript
// Register multiple agents in parallel
const agents = await client.batchRegisterAgents([
  { agentId: 'bot-1', metadataUri: 'https://...' },
  { agentId: 'bot-2', metadataUri: 'https://...' },
  { agentId: 'bot-3', metadataUri: 'https://...' }
]);

console.log(`Registered ${agents.length} agents`);
```

---

## REST API Endpoints (Alternative to SDK)

For non-TypeScript environments, use the REST API:

### Authentication
```bash
curl -H "X-API-Key: your-api-key" \
     https://api.noemaprotocol.xyz/v1/agents
```

### List Agents
```bash
curl https://api.noemaprotocol.xyz/v1/agents?limit=10&offset=0
```

**Response:**
```json
{
  "agents": [
    {
      "pda": "8xY7bZqK...",
      "agentId": "customer-bot",
      "reputation": 950,
      "totalTransactions": 1234
    }
  ],
  "total": 1247,
  "page": 1
}
```

### Get Agent Details
```bash
curl https://api.noemaprotocol.xyz/v1/agents/8xY7bZqK...
```

### Create Payment
```bash
curl -X POST https://api.noemaprotocol.xyz/v1/payments \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "agent-pda",
    "amount": 0.001,
    "memo": "API fee"
  }'
```

### Usage Summary
```bash
curl -H "X-API-Key: your-api-key" \
     https://api.noemaprotocol.xyz/v1/usage/summary?start=2025-01-01&end=2025-01-31
```

Full API reference: [https://noemaprotocol.xyz/api-reference](https://noemaprotocol.xyz/api-reference)

---

## Configuration

### Environment Variables

```bash
# .env
NOEMA_API_KEY=your-api-key-here
NOEMA_NETWORK=mainnet-beta  # or devnet
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
WALLET_PRIVATE_KEY=your-base58-private-key
```

### Advanced Client Options

```typescript
const client = new NoemaClient({
  network: 'mainnet-beta',
  apiKey: process.env.NOEMA_API_KEY,
  
  // Custom RPC endpoint
  rpcUrl: 'https://rpc.example.com',
  
  // Timeout settings
  timeout: 30000,  // 30 seconds
  
  // Retry logic
  retries: 3,
  retryDelay: 1000,  // 1 second
  
  // Webhook configuration
  webhookUrl: 'https://your-server.com/webhooks',
  webhookSecret: 'webhook-secret',
  
  // Auto-pay budget
  autoPayBudget: 100,  // USDC
  
  // Commitment level
  commitment: 'confirmed'  // or 'finalized', 'processed'
});
```

---

## Error Handling

```typescript
import { NoemaError, ErrorCode } from '@noema/sdk';

try {
  await client.registerAgent({ agentId: 'my-bot', metadataUri: '...' });
} catch (error) {
  if (error instanceof NoemaError) {
    switch (error.code) {
      case ErrorCode.INSUFFICIENT_FUNDS:
        console.error('Not enough SOL for transaction');
        break;
      case ErrorCode.AGENT_ALREADY_EXISTS:
        console.error('Agent ID already registered');
        break;
      case ErrorCode.INVALID_API_KEY:
        console.error('API key invalid or expired');
        break;
      case ErrorCode.NETWORK_ERROR:
        console.error('RPC connection failed');
        break;
      default:
        console.error(`Noema error: ${error.message}`);
    }
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

**Common Error Codes:**
- `INSUFFICIENT_FUNDS` - Not enough SOL/USDC
- `AGENT_ALREADY_EXISTS` - Agent ID taken
- `INVALID_API_KEY` - Authentication failed
- `NETWORK_ERROR` - RPC/connection issue
- `INVALID_SIGNATURE` - Transaction signing failed
- `PROGRAM_ERROR` - On-chain program error
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Testing

### Run Test Suite

```bash
# Clone repository
git clone https://github.com/NoemaProtocol/Noema-SDK.git
cd Noema-SDK

# Install dependencies
npm install

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Test specific SDK
npm run test:managed  # @noema/sdk
npm run test:open     # @spl-8004/sdk
```

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { NoemaClient } from '@noema/sdk';

describe('NoemaClient', () => {
  it('should register agent successfully', async () => {
    const client = new NoemaClient({ network: 'devnet' });
    
    const agent = await client.registerAgent({
      agentId: `test-${Date.now()}`,
      metadataUri: 'https://example.com/test.json'
    });
    
    expect(agent.pda).toBeDefined();
    expect(agent.signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/);
  });
});
```

---

## Examples

### Task Bounty System (Mobile App)

```typescript
import { NoemaClient } from '@noema/sdk';

class TaskBountyService {
  private client: NoemaClient;
  
  constructor(apiKey: string) {
    this.client = new NoemaClient({ 
      network: 'mainnet-beta',
      apiKey 
    });
  }
  
  async createTask(params: {
    title: string;
    budget: number;  // USDC
    winners: number;
  }) {
    // Create escrow account
    const escrow = await this.client.createEscrow({
      amount: params.budget,
      releaseConditions: {
        votingRequired: true,
        minVotes: 10
      }
    });
    
    return {
      taskId: escrow.pda,
      escrowAddress: escrow.address,
      status: 'open'
    };
  }
  
  async submitVote(taskId: string, winnerId: string) {
    await this.client.submitVote({
      taskPda: taskId,
      winner: winnerId,
      voter: this.client.wallet.publicKey
    });
  }
  
  async distributePrizes(taskId: string) {
    // Automatically distributes via X402
    const distribution = await this.client.distributeEscrow({
      escrowPda: taskId
    });
    
    console.log(`Distributed to ${distribution.recipientCount} winners`);
    return distribution;
  }
}
```

### Streaming Payments

```typescript
// Pay-per-second streaming
const stream = await client.createPaymentStream({
  recipient: 'agent-pda',
  ratePerSecond: 0.0001,  // USDC/second
  duration: 3600  // 1 hour
});

// Stream runs automatically
// Total cost: 0.36 USDC

// Stop early
await client.stopPaymentStream(stream.id);
```

### API Monetization

```typescript
import express from 'express';
import { NoemaClient } from '@noema/sdk';

const app = express();
const noema = new NoemaClient({ apiKey: process.env.NOEMA_API_KEY });

app.post('/api/expensive-task', async (req, res) => {
  // Require X402 payment
  const payment = req.headers['x-payment-signature'];
  
  if (!payment) {
    return res.status(402).json({
      error: 'Payment required',
      amount: 0.01,  // USDC
      paymentAddress: 'your-agent-pda'
    });
  }
  
  // Verify payment
  const verified = await noema.verifyPayment(payment);
  if (!verified || verified.amount < 0.01) {
    return res.status(402).json({ error: 'Invalid payment' });
  }
  
  // Process request
  const result = await performExpensiveTask(req.body);
  res.json(result);
});
```

---

## Performance & Limits

| Operation | Managed SDK | Open-Source SDK |
|-----------|-------------|-----------------|
| **Agent Registration** | ~2 seconds | ~3 seconds |
| **Payment Creation** | ~1 second | ~1.5 seconds |
| **Balance Query** | ~200ms | ~500ms |
| **API Rate Limit** | 1000 req/min | 100 req/min (self-hosted) |
| **Max Batch Size** | 50 operations | N/A |
| **Webhook Delivery** | 3 retries, exponential backoff | N/A |

**Optimization Tips:**
- Use `commitment: 'processed'` for faster confirmations (less secure)
- Batch operations when possible
- Cache agent PDAs client-side
- Use webhooks instead of polling for events

---

## Migration Guide

### From v0.x to v1.0

**Breaking Changes:**
1. `registerAgent()` now returns `{ pda, signature }` instead of just PDA string
2. `createPayment()` requires `amount` in USDC (was lamports)
3. Network option now `'mainnet-beta'` (was `'mainnet'`)
4. Removed deprecated `getAgentByName()` - use `getAgent(pda)` instead

**Migration Example:**
```typescript
// v0.x
const pda = await client.registerAgent({ name: 'bot' });

// v1.0
const { pda, signature } = await client.registerAgent({ agentId: 'bot', metadataUri: '...' });
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](https://github.com/NoemaProtocol/Noema-SDK/blob/main/CONTRIBUTING.md) for:
- Code style guidelines
- Testing requirements
- PR submission process
- Feature request templates

**Development Setup:**
```bash
git clone https://github.com/NoemaProtocol/Noema-SDK.git
cd Noema-SDK
npm install
npm run dev  # Watch mode
```

---

## Security

**Report vulnerabilities:** security@noemaprotocol.xyz

**Best Practices:**
- Never commit API keys or private keys
- Use environment variables for secrets
- Verify webhook signatures
- Enable rate limiting on production servers
- Use `commitment: 'finalized'` for critical transactions

**Audits:**
- [Trail of Bits Audit Report (2024-12)](https://github.com/NoemaProtocol/Noema-Audits)
- [OtterSec Review (2025-01)](https://github.com/NoemaProtocol/Noema-Audits)

---

## Support

- **Documentation:** [https://noemaprotocol.xyz/docs](https://noemaprotocol.xyz/docs)
- **Discord:** [https://discord.gg/noemaprotocol](https://discord.gg/noemaprotocol)
- **Email:** support@noemaprotocol.xyz
- **GitHub Issues:** [Report a bug](https://github.com/NoemaProtocol/Noema-SDK/issues)

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Changelog

### v1.0.0 (2025-01-15)
- ✅ Production release
- ✅ Mainnet support
- ✅ Webhook system
- ✅ Auto-pay feature
- ✅ Batch operations
- ✅ Full TypeScript types

### v0.9.0 (2024-12-20)
- Beta release
- Devnet testing
- Core protocol support

---

**Built with ❤️ by the Noema Protocol community**

[Website](https://noemaprotocol.xyz) · [Twitter](https://twitter.com/noemaprotocol) · [GitHub](https://github.com/NoemaProtocol)
