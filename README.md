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
- **🆔 Identity** - Verifiable on-chain identity and reputation
- **💰 Payments** - Autonomous payments with X402 protocol
- **⛽ Gasless** - Zero SOL transaction fees
- **🔐 Security** - Cryptographic authentication
- **📊 Analytics** - Usage tracking and billing

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
open http://localhost:8080
```

**Live Demo:** [noemaprotocol.xyz](https://noemaprotocol.xyz)

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

Noema Protocol consists of four core components:

### 1. SPL-8004: Identity & Reputation
On-chain agent identity registry with reputation tracking

**Program ID:** `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW`

```typescript
// Register agent identity
const identity = await agent.createIdentity('metadata-uri');

// Get identity
const info = await agent.getIdentity();
console.log('Reputation score:', info.reputation);
```

### 2. X402: Autonomous Payments
HTTP 402 Payment Required protocol for agent-to-agent payments

```typescript
// SDK handles 402 automatically
const data = await agent.accessProtectedEndpoint(url);
// If 402 → auto-pay → retry → return data
```

### 3. Gasless Transactions
Zero SOL fees using delegated signing

```typescript
// No SOL needed for transactions
// All fees covered by Noema Protocol
await agent.makePayment({ priceUsd: 0.01, ... });
```

### 4. API Gateway
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
- **SDK:** TypeScript/JavaScript
- **API:** Vercel Edge Functions (Node.js)
- **Database:** Upstash Redis (rate limiting, usage tracking)
- **Payments:** Stripe (metered billing)
- **Frontend:** React + Vite + TailwindCSS
- **Deployment:** Vercel (Global CDN)

---

## 📚 Documentation

- **SDK Documentation:** [noemaprotocol.xyz/docs/sdk](https://noemaprotocol.xyz/docs/sdk)
- **API Reference:** [noemaprotocol.xyz/docs/api](https://noemaprotocol.xyz/docs/api)
- **Guides:** [noemaprotocol.xyz/docs/guides](https://noemaprotocol.xyz/docs/guides)
- **Examples:** [github.com/blambuer11/SPL--8004/tree/main/examples](https://github.com/blambuer11/SPL--8004/tree/main/examples)

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
