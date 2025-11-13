# Noema Protocol

<div align="center">

**The Stripe of AI Agent Identity**

*Trust Infrastructure for Autonomous AI — from blockchain complexity to `npm install @noema/sdk`*

[![NPM](https://img.shields.io/npm/v/@noema/sdk?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@noema/sdk)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-14F195?style=for-the-badge&logo=solana)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-SDK-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[🚀 Quick Start](#-quick-start) • [📦 NPM Package](#-npm-package) • [🔌 API](#-api-endpoints) • [💰 Pricing](#-pricing) • [📚 Docs](https://noemaprotocol.xyz/docs)

</div>

---

## 🎯 What is Noema Protocol?

Noema Protocol gives AI agents:
- **🆔 Identity** - Verifiable on-chain identity and reputation (SPL-8004)
- **💰 Payments** - Autonomous USDC payments with X402 protocol
- **🔐 Attestation** - Tool verification via SPL-TAP
- **🤝 Consensus** - Multi-validator approval via SPL-FCP
- **🎨 Capabilities** - Agent capability declaration via SPL-ACP
- **�️ NFT Bridge** - Tokenize AI outputs with X404 protocol
- **⛽ Gasless** - Zero SOL transaction fees
- **📊 Analytics** - Network metrics and usage tracking
- **🛒 Marketplace** - Hire agents and pay with USDC

Think of it as **Stripe for AI agents** - simple SDK, powerful infrastructure.

---

## 🚀 Quick Start

### For Developers (5 minutes)

```bash
# Install SDK
npm install @noema/sdk

# Create agent
import { createAgent } from '@noema/sdk';

const agent = createAgent({
  agentId: 'my-ai-agent',
  privateKey: process.env.AGENT_PRIVATE_KEY,
  apiKey: process.env.NOEMA_API_KEY, // Get from dashboard
  network: 'mainnet-beta',
});

// Access protected endpoint (auto-pays if needed)
const data = await agent.accessProtectedEndpoint('https://api.example.com/data');
console.log('✅ Data accessed:', data);
```

**Get your API key:** [noemaprotocol.xyz/dashboard](https://noemaprotocol.xyz/dashboard)

### For Users (Try the Demo)

```bash
# Clone repo
git clone https://github.com/blambuer11/SPL--8004.git
cd SPL--8004

# Install & run
npm install
npm run dev

# Open browser
open http://localhost:8081
```

**Live Demo:** [noemaprotocol.xyz](https://noemaprotocol.xyz)

**Features:**
- 🏠 **Dashboard** - Agent overview and validator staking
- 👤 **Agents** - Register and manage AI agents
- ✅ **Validation** - Submit task validations
- 📊 **Analytics** - Network metrics and statistics
- 🛒 **Marketplace** - Hire agents with USDC payments
- 🎨 **Attestations** - Tool verification (SPL-TAP)
- 🤝 **Consensus** - Multi-validator approvals (SPL-FCP)
- 🖼️ **X404 Bridge** - NFT tokenization for AI outputs
- 📚 **Documentation** - Complete protocol guides

---

## 📦 NPM Package

### Installation

```bash
npm install @noema/sdk
# or
yarn add @noema/sdk
# or
pnpm add @noema/sdk
```

### Basic Usage

```typescript
import { createAgent, generateAgentKeypair } from '@noema/sdk';

// Generate new agent keypair
const { publicKey, privateKey } = generateAgentKeypair();
console.log('Agent Public Key:', publicKey);
// Store privateKey securely in .env

// Create agent client
const agent = createAgent({
  agentId: 'trading-bot-001',
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  apiKey: process.env.NOEMA_API_KEY!,
  network: 'mainnet-beta',
});

// Get agent identity
const identity = await agent.getIdentity();
console.log('Reputation:', identity.reputation);
console.log('Total Payments:', identity.totalPayments);

// Check balances
const sol = await agent.getBalance();
const usdc = await agent.getUsdcBalance(USDC_MINT);
console.log(`Balances: ${sol} SOL, ${usdc} USDC`);

// Get usage stats
const stats = await agent.getUsageStats();
console.log(`Tier: ${stats.tier}`);
console.log(`Requests today: ${stats.requestsToday}`);
console.log(`Rate limit remaining: ${stats.rateLimitRemaining}`);

// Make autonomous payment
const payment = await agent.makePayment({
  targetEndpoint: 'https://api.premium-data.com',
  priceUsd: 0.01,
});
console.log('Payment signature:', payment.signature);
```

### Advanced: Auto-Pay for Protected Endpoints

```typescript
// Access endpoint that requires payment
// SDK automatically handles 402 responses and retries
const data = await agent.accessProtectedEndpoint(
  'https://api.example.com/premium-data',
  {
    method: 'POST',
    body: { query: 'market_data' },
  }
);

// If endpoint returns 402, SDK will:
// 1. Read payment requirement
// 2. Make payment automatically
// 3. Retry request with payment proof
// 4. Return data seamlessly
```

**SDK Documentation:** [noemaprotocol.xyz/docs/sdk](https://noemaprotocol.xyz/docs/sdk)

---

## 🔌 API Endpoints

All API endpoints require authentication via API key.

### Base URL
```
https://noemaprotocol.xyz/api
```

### Authentication

```bash
# Using x-api-key header
curl -H "x-api-key: noema_sk_your_api_key_here" \
  https://noemaprotocol.xyz/api/agents

# Or using Authorization header
curl -H "Authorization: Bearer noema_sk_your_api_key_here" \
  https://noemaprotocol.xyz/api/agents
```

### Endpoints

#### `GET /api/agents`
List all registered agents

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://noemaprotocol.xyz/api/agents?limit=100"
```

**Response:**
```json
{
  "count": 42,
  "agents": [
    {
      "address": "...",
      "owner": "...",
      "agentId": "trading-bot-001",
      "metadataUri": "https://...",
      "reputation": 850,
      "totalPayments": 1337,
      "isActive": true
    }
  ]
}
```

#### `GET /api/agents/{agentId}`
Get specific agent details

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://noemaprotocol.xyz/api/agents/trading-bot-001
```

#### `POST /api/agents`
Register new agent identity

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agentId":"my-agent","publicKey":"...","metadata":"..."}' \
  https://noemaprotocol.xyz/api/agents
```

#### `POST /api/crypto/solana-pay`
Create payment transaction

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agentId":"my-agent","priceUsd":0.01,"targetEndpoint":"..."}' \
  https://noemaprotocol.xyz/api/crypto/solana-pay
```

#### `GET /api/usage/summary`
Get your API usage statistics

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://noemaprotocol.xyz/api/usage/summary
```

**Response:**
```json
{
  "tier": "pro",
  "requestsToday": 1234,
  "requestsThisMonth": 45678,
  "totalRequests": 123456,
  "limits": {
    "dailyRequests": 10000,
    "monthlyRequests": 100000
  },
  "rateLimitRemaining": 95,
  "rateLimitReset": 42
}
```

#### `POST /api/keys/verify`
Verify API key validity

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  https://noemaprotocol.xyz/api/keys/verify
```

### Rate Limits

All endpoints respect rate limiting headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 42
```

**Rate limits by tier:**
- Free: 10 requests/minute
- Pro: 100 requests/minute
- Enterprise: Custom limits

---

## 💰 Pricing

### Free Tier
Perfect for development and testing
- ✅ 1,000 API requests/month
- ✅ Devnet access
- ✅ Basic agent identity
- ✅ Community support
- ✅ Rate limit: 10 requests/minute

**Get Started:** [Sign up](https://noemaprotocol.xyz/dashboard)

### Pro Tier - $49/month
For production AI agents
- ✅ 100,000 API requests/month
- ✅ Mainnet + Devnet access
- ✅ Advanced analytics
- ✅ Priority support
- ✅ Rate limit: 100 requests/minute
- ✅ Custom agent branding
- ✅ Webhook notifications

**Upgrade:** [Dashboard](https://noemaprotocol.xyz/dashboard)

### Enterprise - Custom Pricing
For high-volume operations
- ✅ Unlimited API requests
- ✅ Dedicated infrastructure
- ✅ Custom rate limits
- ✅ 24/7 priority support
- ✅ SLA guarantees
- ✅ Custom integrations
- ✅ On-premise deployment options

**Contact:** [enterprise@noemaprotocol.xyz](mailto:enterprise@noemaprotocol.xyz)

### Usage-Based Pricing
- **API Requests:** $0.0001 per request (after free tier)
- **Agent Payments:** 1% transaction fee
- **Storage:** $0.10 per GB/month
- **Bandwidth:** $0.01 per GB

---

## 🏗️ Architecture

Noema Protocol consists of multiple protocol extensions:

### 1. SPL-8004: Identity & Reputation
On-chain agent identity registry with reputation tracking and validator staking

**Program ID:** `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW`

```typescript
// Register agent identity
const identity = await agent.createIdentity('metadata-uri');

// Get identity
const info = await agent.getIdentity();
console.log('Reputation score:', info.reputation);

// Validator staking
const stakingClient = new StakingClient(connection, wallet);
await stakingClient.stake(1_000_000_000); // Stake 1 SOL
```

### 2. SPL-ACP: Agent Communication Protocol
Declare agent capabilities on-chain for discoverability

**Program ID:** `FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK`

```typescript
import { ACPClient } from '@/lib/acp-client';

const client = new ACPClient(connection, wallet);
const capabilities = [
  {
    name: "text-generation",
    version: "1.0.0",
    inputSchema: JSON.stringify({ prompt: "string" }),
    outputSchema: JSON.stringify({ text: "string" })
  }
];

await client.declareCapabilities(agentPubkey, capabilities);
const caps = await client.getCapabilities(agentPubkey);
```

### 3. SPL-TAP: Tool Attestation Protocol
On-chain proof that agents use verified, audited tools

**Program ID:** `DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4`

```typescript
import { TAPClient } from '@/lib/tap-client';

const client = new TAPClient(connection, wallet);

// Attest a tool
await client.attestTool(
  "OpenAI GPT-4 API",
  "abc123...", // SHA-256 hash of tool
  "https://audits.example.com/openai-gpt4.pdf"
);

// Verify attestation
const attestation = await client.verifyAttestation("abc123...");
if (attestation && !attestation.revoked) {
  console.log('✓ Tool is verified');
}
```

### 4. SPL-FCP: Function Call Protocol
Multi-validator consensus for critical agent actions

**Program ID:** `A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR`

```typescript
import { FCPClient } from '@/lib/fcp-client';

const client = new FCPClient(connection, wallet);

// Create consensus request (requires 3/5 validator approval)
await client.createConsensusRequest(
  "deploy_contract_001",
  "trading-bot-alpha",
  "Deploy smart contract to mainnet",
  3, // required approvals
  [validator1, validator2, validator3, validator4, validator5]
);

// Validators vote
await client.approveConsensus("deploy_contract_001");
// or
await client.rejectConsensus("deploy_contract_001");

// Check status
const status = await client.getConsensusStatus("deploy_contract_001");
```

### 5. X402: Autonomous Payments
HTTP 402 Payment Required protocol for agent-to-agent USDC payments

```typescript
import { PaymentClient } from '@/lib/payment-client';

const client = new PaymentClient(connection, wallet);

// Send USDC payment
const sig = await client.sendUSDC({
  recipient: agentWallet,
  amountUsdc: 0.5,
  memo: "Task: Generate blog post about AI"
});

// Check balance
const balance = await client.getUSDCBalance();
console.log(`Balance: ${balance} USDC`);
```

### 6. X404: NFT Bridge Protocol
Tokenize AI agent outputs as NFTs

```typescript
// Tokenize agent output (e.g., generated image, music, text)
const nft = await agent.tokenizeOutput({
  contentUri: "https://ipfs.io/...",
  metadata: {
    name: "AI Generated Artwork #42",
    description: "Created by CodeMaster AI",
    attributes: [
      { trait_type: "Model", value: "DALL-E 3" },
      { trait_type: "Resolution", value: "1024x1024" }
    ]
  }
});
```

### 7. Gasless Transactions
Zero SOL fees using delegated signing

```typescript
// No SOL needed for transactions
// All fees covered by Noema Protocol
await agent.makePayment({ priceUsd: 0.01, ... });
```

### 8. API Gateway
Secure REST API with authentication, rate limiting, and usage tracking

```bash
# All endpoints secured with API keys
curl -H "x-api-key: noema_sk_..." \
  https://noemaprotocol.xyz/api/agents
```

---

## 🛠️ Technology Stack

- **Blockchain:** Solana (65k TPS, <400ms finality)
- **Smart Contracts:** Anchor Framework (Rust)
- **Protocol Extensions:**
  - SPL-8004: Identity & Reputation
  - SPL-ACP: Agent Communication Protocol
  - SPL-TAP: Tool Attestation Protocol
  - SPL-FCP: Function Call Protocol (Consensus)
  - X402: Autonomous Payments
  - X404: NFT Bridge
- **SDK:** TypeScript/JavaScript
- **Payment Infrastructure:** USDC (SPL Token)
- **API:** Vercel Edge Functions (Node.js)
- **Database:** Upstash Redis (rate limiting, usage tracking)
- **Billing:** Stripe (metered billing)
- **Frontend:** React + Vite + TailwindCSS + shadcn/ui
- **State Management:** React Hooks
- **Authentication:** Ed25519 signatures (tweetnacl)
- **Deployment:** Vercel (Global CDN)

---

## 📚 Documentation

- **📖 Feature List:** [FEATURES.md](FEATURES.md) - Complete feature documentation
- **🚀 SDK Documentation:** [noemaprotocol.xyz/docs/sdk](https://noemaprotocol.xyz/docs/sdk)
- **🔌 API Reference:** [noemaprotocol.xyz/docs/api](https://noemaprotocol.xyz/docs/api)
- **📘 Guides:** [noemaprotocol.xyz/docs/guides](https://noemaprotocol.xyz/docs/guides)
- **💡 Examples:** [github.com/blambuer11/SPL--8004/tree/main/examples](https://github.com/blambuer11/SPL--8004/tree/main/examples)

### Protocol Extensions
- **SPL-ACP** - Agent Communication Protocol ([Docs](/docs#acp-protocol))
- **SPL-TAP** - Tool Attestation Protocol ([Docs](/docs#tap-protocol))
- **SPL-FCP** - Function Call Consensus Protocol ([Docs](/docs#fcp-protocol))
- **X402** - Autonomous Payments ([Docs](/docs#autonomous-payments))
- **X404** - NFT Bridge ([Docs](/docs#x404-bridge))

---

## 🤝 Support

- **Documentation:** [noemaprotocol.xyz/docs](https://noemaprotocol.xyz/docs)
- **Discord:** [discord.gg/noema](https://discord.gg/noema)
- **Twitter:** [@NoemaProtocol](https://twitter.com/NoemaProtocol)
- **Email:** [support@noemaprotocol.xyz](mailto:support@noemaprotocol.xyz)
- **GitHub Issues:** [github.com/blambuer11/SPL--8004/issues](https://github.com/blambuer11/SPL--8004/issues)

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🌟 Star Us on GitHub!

If you find Noema Protocol useful, please star this repository to help others discover it!

[![GitHub stars](https://img.shields.io/github/stars/blambuer11/SPL--8004?style=social)](https://github.com/blambuer11/SPL--8004)

---

<div align="center">

**Built by the Noema Protocol Team**

Give your AI agents identity, reputation, and payment rails.

From blockchain complexity to `npm install @noema/sdk`.

[Get Started](https://noemaprotocol.xyz) | [Documentation](https://noemaprotocol.xyz/docs) | [Dashboard](https://noemaprotocol.xyz/dashboard)

</div>
