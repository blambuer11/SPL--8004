# Documentation Structure - SPL-8004

## Site Map

```
docs.spl8004.io/
├── Getting Started
│   ├── Introduction
│   ├── Quick Start (5 minutes)
│   ├── Installation
│   ├── Your First Agent
│   └── Core Concepts
│
├── SDK Reference
│   ├── AgentClient
│   ├── Methods
│   ├── Types
│   ├── Error Handling
│   └── Best Practices
│
├── Guides
│   ├── Validation Bots
│   ├── Trading Bots
│   ├── Data Aggregators
│   ├── Oracle Providers
│   └── Multi-Agent Systems
│
├── Infrastructure
│   ├── Self-Hosting
│   ├── Production Deployment
│   ├── Monitoring
│   ├── Security
│   └── Performance Optimization
│
├── Advanced
│   ├── On-Chain Identity
│   ├── Reputation System
│   ├── Custom Integrations
│   ├── Webhooks
│   └── GraphQL API
│
└── Resources
    ├── Examples
    ├── API Reference
    ├── Troubleshooting
    ├── FAQ
    └── Changelog
```

## Page Templates

### 1. Introduction

```markdown
# Introduction to SPL-8004

## What is SPL-8004?

SPL-8004 is an infrastructure layer for building autonomous AI agents on Solana. It provides:

- **On-Chain Identity**: Every agent has a verifiable identity
- **Autonomous Payments**: Agents pay for services without human intervention
- **Gasless Transactions**: Zero SOL fees via Kora integration
- **Reputation System**: Build trust through on-chain activity

## Why SPL-8004?

Traditional agent systems require:
- ❌ Manual wallet approvals
- ❌ Complex gas management
- ❌ Custom payment integration
- ❌ No reputation tracking

With SPL-8004:
- ✅ Fully autonomous
- ✅ Zero gas fees
- ✅ Built-in payments
- ✅ On-chain reputation

## Architecture

```
┌─────────────┐
│  Your Agent │
└──────┬──────┘
       │ @spl-8004/sdk
       ↓
┌──────────────────┐
│  Validator API   │
└──────┬───────────┘
       │ Kora RPC
       ↓
┌──────────────────┐
│  Solana Devnet   │
└──────────────────┘
```

## Quick Example

```typescript
import { createAgent } from '@spl-8004/sdk';

const agent = createAgent({
  agentId: 'my-bot',
  privateKey: process.env.AGENT_KEY,
});

// Access paid endpoint (auto-pays if needed)
const data = await agent.accessProtectedEndpoint('/api/premium');
```

## Next Steps

- [Quick Start →](./quick-start)
- [Core Concepts →](./core-concepts)
- [Examples →](../resources/examples)
```

### 2. Quick Start

```markdown
# Quick Start (5 Minutes)

Get your first agent running in 5 minutes.

## Step 1: Install SDK

```bash
npm install @spl-8004/sdk
```

## Step 2: Generate Keypair

```bash
npx spl8004-cli generate-keypair
```

Output:
```
✓ Keypair generated
  Public Key: QNdNJYFax8JPDxr5gPZeXhA3StiRKBHqSBmAQNA8nbp
  Private Key: 3h5F7k9... (base58)
  
  Save this to .env:
  AGENT_PRIVATE_KEY=3h5F7k9...
```

## Step 3: Fund Your Agent

```bash
# Get SOL from faucet
solana airdrop 1 QNdNJYFax8JPDxr5gPZeXhA3StiRKBHqSBmAQNA8nbp \
  --url devnet

# Get USDC (contact us)
npx spl8004-cli request-usdc QNdNJYFax8JPDxr5gPZeXhA3StiRKBHqSBmAQNA8nbp
```

## Step 4: Create Agent

```typescript
// agent.ts
import { createAgent } from '@spl-8004/sdk';

const agent = createAgent({
  agentId: 'my-first-agent',
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  network: 'devnet',
});

console.log('Agent created:', agent.getPublicKey().toString());
```

## Step 5: Make Your First Payment

```typescript
// Automatic payment to protected endpoint
const result = await agent.accessProtectedEndpoint(
  'https://api.example.com/premium-data'
);

console.log('Data received:', result);
```

## Step 6: Check Identity

```typescript
const identity = await agent.getIdentity();

console.log('Agent ID:', identity.agentId);
console.log('Reputation:', identity.reputation);
console.log('Total Payments:', identity.totalPayments);
```

## Complete Example

```typescript
import { createAgent } from '@spl-8004/sdk';

async function main() {
  // Create agent
  const agent = createAgent({
    agentId: 'my-first-agent',
    privateKey: process.env.AGENT_PRIVATE_KEY!,
  });

  // Check balance
  const balance = await agent.getUsdcBalance();
  console.log(`USDC Balance: ${balance}`);

  // Access protected endpoint (auto-pays)
  const data = await agent.accessProtectedEndpoint(
    'https://api.example.com/premium',
    { method: 'GET' }
  );

  // Check updated identity
  const identity = await agent.getIdentity();
  console.log(`Reputation: ${identity.reputation}`);
  console.log(`Payments: ${identity.totalPayments}`);
}

main();
```

## Next Steps

- [Core Concepts →](./core-concepts)
- [Build a Validation Bot →](../guides/validation-bots)
- [API Reference →](../sdk-reference/agent-client)

## Troubleshooting

**Error: "Insufficient balance"**
```
Fund your agent with USDC:
npx spl8004-cli request-usdc YOUR_PUBLIC_KEY
```

**Error: "Invalid private key"**
```
Make sure your .env has:
AGENT_PRIVATE_KEY=your_base58_key
```

**Need help?**
- [Discord](https://discord.gg/spl8004)
- [GitHub Issues](https://github.com/spl8004/sdk/issues)
- [Email Support](mailto:support@spl8004.io)
```

### 3. API Reference Template

```markdown
# AgentClient

Main class for interacting with SPL-8004.

## Constructor

```typescript
constructor(config: AgentConfig)
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `config.agentId` | `string` | Yes | Unique identifier for your agent |
| `config.privateKey` | `string` | Yes | Base58 encoded private key |
| `config.network` | `'devnet' \| 'mainnet'` | No | Default: 'devnet' |
| `config.validatorApiUrl` | `string` | No | Custom validator API URL |

### Example

```typescript
const agent = new AgentClient({
  agentId: 'my-agent',
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  network: 'mainnet',
});
```

## Methods

### getPublicKey()

Get agent's public key.

```typescript
getPublicKey(): PublicKey
```

**Returns:** Solana PublicKey object

**Example:**
```typescript
const pubkey = agent.getPublicKey();
console.log(pubkey.toString());
// Output: "QNdNJYFax8JPDxr5gPZeXhA3StiRKBHqSBmAQNA8nbp"
```

### getBalance()

Get agent's SOL balance.

```typescript
async getBalance(): Promise<number>
```

**Returns:** Balance in SOL

**Example:**
```typescript
const balance = await agent.getBalance();
console.log(`Balance: ${balance} SOL`);
```

### getUsdcBalance()

Get agent's USDC balance.

```typescript
async getUsdcBalance(mint?: PublicKey): Promise<number>
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `mint` | `PublicKey` | No | USDC mint address (auto-detected) |

**Returns:** Balance in USDC

**Example:**
```typescript
const usdc = await agent.getUsdcBalance();
console.log(`USDC: ${usdc}`);
```

### getIdentity()

Get agent's on-chain identity and reputation.

```typescript
async getIdentity(): Promise<AgentIdentity>
```

**Returns:** AgentIdentity object

**Example:**
```typescript
const identity = await agent.getIdentity();
console.log({
  agentId: identity.agentId,
  reputation: identity.reputation,
  totalPayments: identity.totalPayments,
  totalSpent: identity.totalSpent,
});
```

### makePayment()

Make a payment to a protected endpoint.

```typescript
async makePayment(options: PaymentOptions): Promise<PaymentResult>
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options.endpoint` | `string` | Yes | Protected endpoint URL |
| `options.amount` | `number` | Yes | Amount in USDC |
| `options.recipient` | `string` | Yes | Recipient's public key |

**Returns:** PaymentResult with signature

**Example:**
```typescript
const result = await agent.makePayment({
  endpoint: 'https://api.example.com/premium',
  amount: 0.0001,
  recipient: 'RecipientPublicKey...',
});

console.log('Payment signature:', result.signature);
```

### accessProtectedEndpoint()

Access a protected endpoint with automatic payment.

```typescript
async accessProtectedEndpoint<T>(
  endpoint: string,
  options?: ProtectedEndpointOptions
): Promise<T>
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `endpoint` | `string` | Yes | Protected endpoint URL |
| `options.method` | `'GET' \| 'POST' \| 'PUT' \| 'DELETE'` | No | HTTP method (default: 'GET') |
| `options.headers` | `Record<string, string>` | No | Custom headers |
| `options.body` | `any` | No | Request body |

**Returns:** Response data (typed with generic T)

**How it works:**
1. Makes request to endpoint
2. If returns 402 (Payment Required), extracts payment info
3. Makes payment automatically
4. Retries request with payment signature
5. Returns data

**Example:**
```typescript
// GET request
const data = await agent.accessProtectedEndpoint<DataType>(
  'https://api.example.com/premium'
);

// POST request
const result = await agent.accessProtectedEndpoint<ResultType>(
  'https://api.example.com/submit',
  {
    method: 'POST',
    body: { validation: 'data' },
  }
);
```

### createIdentity()

Create on-chain identity for agent (if not exists).

```typescript
async createIdentity(metadata?: {
  name?: string;
  description?: string;
}): Promise<AgentIdentity>
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `metadata.name` | `string` | No | Agent name |
| `metadata.description` | `string` | No | Agent description |

**Returns:** AgentIdentity object

**Example:**
```typescript
const identity = await agent.createIdentity({
  name: 'Validation Bot Alpha',
  description: 'Autonomous validation agent',
});
```

## Factory Functions

### createAgent()

Convenience function to create AgentClient.

```typescript
function createAgent(config: AgentConfig): AgentClient
```

**Example:**
```typescript
import { createAgent } from '@spl-8004/sdk';

const agent = createAgent({
  agentId: 'my-agent',
  privateKey: process.env.AGENT_PRIVATE_KEY!,
});
```

### generateAgentKeypair()

Generate new keypair for agent.

```typescript
function generateAgentKeypair(): {
  publicKey: string;
  privateKey: string;
}
```

**Returns:** Object with base58 encoded keys

**Example:**
```typescript
import { generateAgentKeypair } from '@spl-8004/sdk';

const { publicKey, privateKey } = generateAgentKeypair();
console.log('Public:', publicKey);
console.log('Private:', privateKey); // Save to .env!
```

## Types

See [Types Reference](./types) for full type definitions.
```

### 4. Guide Template

```markdown
# Building a Validation Bot

Learn to build an autonomous validation bot that submits validations and earns rewards.

## Overview

A validation bot:
1. Generates validations
2. Submits to validator API (paid endpoint)
3. Earns rewards for successful validations
4. Builds reputation over time

## Prerequisites

- Node.js 18+
- SPL-8004 SDK installed
- Agent funded with USDC and SOL

## Project Setup

```bash
mkdir validation-bot
cd validation-bot
npm init -y
npm install @spl-8004/sdk dotenv
```

## Implementation

### Step 1: Generate Keypair

```typescript
// setup.ts
import { generateAgentKeypair } from '@spl-8004/sdk';

const { publicKey, privateKey } = generateAgentKeypair();

console.log('Add to .env:');
console.log(`AGENT_ID=validator-bot-alpha`);
console.log(`AGENT_PRIVATE_KEY=${privateKey}`);
console.log(`\nPublic Key: ${publicKey}`);
console.log('Fund this address with SOL and USDC');
```

### Step 2: Create Bot

```typescript
// bot.ts
import { createAgent } from '@spl-8004/sdk';
import 'dotenv/config';

const agent = createAgent({
  agentId: process.env.AGENT_ID!,
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  network: 'devnet',
});

console.log('Bot initialized:', agent.getPublicKey().toString());
```

### Step 3: Generate Validations

```typescript
// validation.ts
interface Validation {
  type: string;
  data: any;
  timestamp: number;
}

function generateValidation(): Validation {
  return {
    type: 'data-quality-check',
    data: {
      source: 'example-feed',
      score: Math.random(),
      checks: ['format', 'range', 'consistency'],
    },
    timestamp: Date.now(),
  };
}
```

### Step 4: Submit Validations

```typescript
// submit.ts
async function submitValidation(
  agent: AgentClient,
  validation: Validation
) {
  try {
    // Auto-pays if needed
    const result = await agent.accessProtectedEndpoint(
      'https://validator-api.spl8004.io/submit-validation',
      {
        method: 'POST',
        body: validation,
      }
    );

    console.log('✓ Validation accepted:', result.validationId);
    return result;
  } catch (error) {
    console.error('✗ Validation failed:', error);
    throw error;
  }
}
```

### Step 5: Main Loop

```typescript
// main.ts
async function main() {
  console.log('Starting validation bot...');

  while (true) {
    try {
      // Check balance
      const balance = await agent.getUsdcBalance();
      if (balance < 0.01) {
        console.warn('⚠️  Low balance:', balance);
      }

      // Get identity
      const identity = await agent.getIdentity();
      console.log('Reputation:', identity.reputation);

      // Generate and submit
      const validation = generateValidation();
      await submitValidation(agent, validation);

      // Wait before next validation
      await new Promise(r => setTimeout(r, 60000)); // 1 minute
    } catch (error) {
      console.error('Error in main loop:', error);
      await new Promise(r => setTimeout(r, 5000)); // Retry in 5s
    }
  }
}

main();
```

## Production Considerations

### Error Handling

```typescript
async function safeSubmit(validation: Validation, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await submitValidation(agent, validation);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

### Balance Monitoring

```typescript
async function checkBalance() {
  const balance = await agent.getUsdcBalance();
  if (balance < 0.01) {
    // Send alert
    await sendAlert('Low balance: ' + balance);
  }
}
```

### Metrics Tracking

```typescript
let successCount = 0;
let failureCount = 0;

function trackMetrics(success: boolean) {
  if (success) successCount++;
  else failureCount++;
  
  console.log({
    successRate: successCount / (successCount + failureCount),
    total: successCount + failureCount,
  });
}
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["node", "main.js"]
```

### Environment Variables

```bash
AGENT_ID=validator-bot-alpha
AGENT_PRIVATE_KEY=your_base58_key
API_URL=https://validator-api.spl8004.io
LOG_LEVEL=info
```

### Monitoring

Use Datadog, New Relic, or similar:

```typescript
import { monitor } from './monitoring';

monitor.track('validation.submitted', {
  reputation: identity.reputation,
  balance: balance,
});
```

## Next Steps

- [Trading Bot Guide →](./trading-bots)
- [Multi-Agent Systems →](./multi-agent-systems)
- [Production Deployment →](../infrastructure/production-deployment)
```

---

**Documentation Best Practices:**

1. **Progressive Disclosure**
   - Start simple (Quick Start)
   - Add complexity gradually
   - Link to advanced topics

2. **Code Examples**
   - Every concept has working code
   - Copy-paste friendly
   - Real-world scenarios

3. **Visual Aids**
   - ASCII diagrams for architecture
   - Tables for parameters
   - Emojis for readability

4. **Search Optimization**
   - Clear headings (H1-H6)
   - Keywords in first paragraph
   - Meta descriptions

5. **Maintenance**
   - Version all examples
   - Keep changelog updated
   - Test code snippets in CI

6. **Community**
   - "Edit this page" links
   - Feedback buttons
   - Discord/GitHub links prominent
