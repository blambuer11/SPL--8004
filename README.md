<<<<<<< HEAD
# Noema Protocol

<div align="center">

**The AWS of AI Agent Infrastructure**

*Complete trust and infrastructure layer for autonomous AI agents on Solana*

![Noema Protocol](https://img.shields.io/badge/Noema-Protocol-8B5CF6?style=for-the-badge)
![Solana](https://img.shields.io/badge/Solana-65K_TPS-14F195?style=for-the-badge&logo=solana)
![TypeScript](https://img.shields.io/badge/TypeScript-SDK-3178C6?style=for-the-badge&logo=typescript)

[🚀 Quick Start](#-quick-start-5-minutes) • [🎥 Demo Video](#-demo-video) • [📚 Docs](#-documentation) • [🎯 Protocols](#-four-protocol-stack)

</div>

---

## 🎥 Demo Video

**Watch our 3-minute demo** showing the complete Noema Protocol stack in action:

> � **Coming Soon** - Demo video will be available before hackathon submission

**What you'll see:**
- Agent registration with SPL-8004
- Reputation scoring and validation
- Reward claiming with 5x multipliers
- Agent-to-agent communication (SPL-ACP)
- Tool attestation (SPL-TAP)
- Function call validation (SPL-FCP)

---

## 🚀 Quick Start (5 Minutes)

Get the full Noema Protocol stack running locally:

```bash
# 1. Clone the repository
git clone https://github.com/blambuer11/SPL--8004.git
cd SPL--8004/agent-aura-sovereign

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Update VITE_PROGRAM_ID=G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW

# 4. Start development server
npm run dev

# 5. Open in browser
open http://localhost:8081
```

**That's it!** 🎉 Connect your Phantom wallet (Devnet) and start:
- Registering AI agents
- Submitting validations
- Claiming rewards
- Exploring network agents

**Need Devnet SOL?** Visit [https://faucet.solana.com](https://faucet.solana.com)

</div>

---

## 🌟 What is Noema Protocol?

Noema is the **complete infrastructure stack** for AI agents on Solana. We combine **four protocol standards** to provide everything autonomous agents need:

| Protocol | Purpose | Status | Program ID |
|----------|---------|--------|------------|
| **SPL-8004** | Identity & Reputation | ✅ Live (Devnet) | `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW` |
| **SPL-ACP** | Agent Communication | ✅ Live (Devnet) | `FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK` |
| **SPL-TAP** | Tool Attestation | ✅ Live (Devnet) | `DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4` |
| **SPL-FCP** | Function Calls | ✅ Live (Devnet) | `A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR` |

### 🚀 Live Deployment

- **Frontend**: [agent-aura-sovereign.vercel.app](https://agent-aura-sovereign.vercel.app)
- **Network**: Solana Devnet
- **RPC**: `https://api.devnet.solana.com`
- **Status**: All 4 protocols deployed and initialized

### 💡 The Vision

Think of Noema as **"AWS for AI Agents"**:

- **SPL-8004** = IAM (identity management)
- **SPL-ACP** = API Gateway (agent-to-agent communication)
- **SPL-TAP** = Lambda (tool invocation)
- **SPL-FCP** = Step Functions (LLM function calls)

All **on-chain, verifiable, and composable** — powered by Solana's 65,000 TPS.

---

## 🎯 Four Protocol Stack

### 1. SPL-8004: Identity & Reputation
**Status: ✅ Live on Devnet**

On-chain identity registry with dynamic reputation scoring. Think "ERC-8004 for Solana."

```typescript
// Register an AI agent
await client.agents.create({
  agentId: "trading-bot-alpha",
  metadata: { strategy: "momentum", version: "1.0" }
});

// Submit validation to update reputation
await client.submitValidation({
  agentId: "trading-bot-alpha",
  isApproved: true,
  evidence: "https://proof.com/task-123"
});
```

**Key Features:**
- PDA-based identity storage
- Dynamic reputation (0-10K scale)
- Reward pools with 5x multipliers
- Gasless via Kora (USDC-only payments)

---

### 2. SPL-ACP: Agent Communication Protocol
**Status: ✅ Live on Devnet**
**Program ID**: `FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK`
**Config PDA**: `BcTM5qX7PPNToi7r48gJ12EhDc5o9SxaUnor7GZwQzuY`

On-chain message registry enabling agent-to-agent communication. 0.01 SOL registration fee.

```typescript
// Initiate communication channel
await client.initiateACPChannel("bot-A", "bot-B", {
  type: "task_request",
  task: "analyze_market_data",
  payment: 5 // USDC
});

// Send signed message
await client.sendMessage("bot-A", {
  type: "data_delivery",
  data: "ipfs://Qm...",
  signature: "..."
});
```

**Key Features:**
- Private & broadcast channels
- Signed messages (anti-spoofing)
- X402 micropayments ($0.001/msg)
- 400ms message finality

---

### 3. SPL-TAP: Tool Attestation Protocol
**Status: ✅ Live on Devnet**
**Program ID**: `DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4`
**Config PDA**: `8SfDQJn3xRyiNsBMHNQcZJCk7aDdbaRrARiaB3etnRxy`

On-chain tool registry with quality attestations. 1 SOL stake for issuers.

```typescript
// Register a tool
await client.registerTool("data-bot", {
  name: "get_crypto_price",
  params: [{ name: "symbol", type: "string" }],
  auth: "signature_required",
  price: 0.005 // USDC per call
});

// Invoke tool (by another agent)
const price = await client.invokeTool("get_crypto_price", {
  symbol: "SOL"
});
// Auto X402 payment to data-bot
```

**Key Features:**
- JSON schema validation
- Reputation-gated access
- MCP-inspired routing
- $0.0005/call fees

---

### 4. SPL-FCP: Function Call Protocol
**Status: ✅ Live on Devnet**
**Program ID**: `A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR`
**Config PDA**: `13yAidKG2PEYTvFNyKh2fQpoVTFw8NoYa2jrLc1JLtTz`

Multi-validator consensus for AI agent workflows. 2 SOL stake for validators.

```typescript
// Define a function
await client.defineFunction("trading-bot", {
  name: "execute_trade",
  inputs: [
    { name: "asset", type: "string" },
    { name: "amount", type: "number" }
  ],
  outputs: { type: "TradeResult" }
});

// LLM calls function
const result = await client.callFunction("execute_trade", {
  asset: "SOL",
  amount: 100
});
```

**Key Features:**
- OpenAI/Claude compatible
- Nested call support
- Schema enforcement
- Auto reputation updates

---

## 🚀 Quick Start

### Install SDK

```bash
npm install @noema/sdk
```

### Basic Usage

```typescript
import { NoemaClient } from '@noema/sdk';

const client = new NoemaClient({
  network: 'devnet',
  apiKey: 'your_api_key' // Get from noema.ai/pricing
});

// Register agent
const agent = await client.agents.create({
  agentId: 'my-first-bot',
  metadata: { purpose: 'trading' }
});

// Submit task validation
await client.submitValidation({
  agentId: 'my-first-bot',
  isApproved: true
});

// Check reputation
const rep = await client.getReputation('my-first-bot');
console.log(`Score: ${rep.score}/10000`);
```

---

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **SDK Starter** | $99/mo | 10K requests, SPL-8004 only |
| **SDK Pro** | $299/mo | 100K requests, all protocols |
| **REST API** | $0.001/call | Pay-as-you-go, any language |
| **No-Code Kit** | $29/mo | Dashboard + analytics |

**Free Tier:** 1,000 requests/month on SPL-8004.

---

## 🎯 Use Cases

### Autonomous Trading Bots
- Register identity, track performance
- Execute trades via FCP functions
- Reputation-based trust

### Multi-Agent Marketplaces
- Agents discover tasks via ACP
- Auto-negotiate with messaging
- USDC payments on completion

### AI Data Providers
- Monetize datasets via TAP tools
- Reputation gates premium access
- Micropayments per API call

### Customer Support Agents
- Inter-agent escalations (ACP)
- CRM function calls (FCP)
- Quality tracked via validations

[See all use cases →](https://noema.ai/use-cases)

---

## 🗺️ Roadmap

### Phase 0: Foundation ✅ COMPLETED
**Nov 2025**
- ✅ SPL-8004 deployed on Devnet (`G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW`)
- ✅ SDK, REST API, No-Code dashboard
- ✅ X402 + Kora integrations

### Phase 1: Protocol Deployment ✅ COMPLETED
**Nov 2025**
- ✅ SPL-ACP deployed & initialized (`FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK`)
- ✅ SPL-TAP deployed & initialized (`DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4`)
- ✅ SPL-FCP deployed & initialized (`A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR`)
- ✅ Frontend deployed on Vercel
- ✅ All configs initialized on-chain

### Phase 2: Beta Testing & Community �
**Dec 2025 - Jan 2026 (Current)**
- 🔨 Community beta program launch
- 🔨 Early adopter onboarding
- 🔨 Bug fixes and optimizations
- 🔨 Developer documentation expansion

### Phase 3: Integration & Audit �
**Q1 2026 (Feb-Mar)**
- Security audit (PeckShield/OtterSec)
- Full SDK integration
- Advanced analytics dashboard
- Performance tuning

### Phase 4: Mainnet Launch 🚀
**Q2 2026 (Apr-Jun)**
- Mainnet deployment (all 4 protocols)
- Data migration from devnet
- Marketing campaign
- Partnership announcements

[Full roadmap →](https://noema.ai/roadmap)

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS** + **shadcn/ui**
- **Solana Wallet Adapter** (Phantom, Solflare)

### Blockchain
- **Solana Devnet** (all protocols live)
- **Anchor Framework** (Rust programs)
- **Deployed Programs:**
  - SPL-8004: `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW`
  - SPL-ACP: `FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK`
  - SPL-TAP: `DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4`
  - SPL-FCP: `A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR`

### Integrations
- **Kora** — Gasless transactions
- **X402** — Micropayments (USDC)
- **Helius RPC** — Premium Solana RPC

---

## 📚 Documentation

### In-App Docs
Visit `/docs` in the app for:
- Platform overview
- SPL-8004 technical details
- X402 micropayments guide
- REST API reference

### External Resources
- [Solana Docs](https://docs.solana.com)
- [Anchor Book](https://book.anchor-lang.com)
- [ERC-8004 Spec](https://eips.ethereum.org/EIPS/eip-8004)

---

## 🏗️ Development

### Prerequisites
- Node.js 18+
- Solana CLI (for program deployment)
- Anchor 0.30.1+ (for Rust programs)

### Run Locally

```bash
# Clone repo
git clone https://github.com/blambuer11/SPL--8004.git
cd SPL--8004/agent-aura-sovereign

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with deployed program IDs (see below)

# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### X402 Facilitator — Quick Start

X402 is Noema's payment protocol for USDC micropayments between agents. Test with local facilitator in 2 minutes:

1) Start the facilitator

```bash
cd spl-8004-program/x402-facilitator
npm install
npm start
# http://localhost:3000/health
```

2) Set environment variables (frontend)

```env
VITE_X402_FACILITATOR_URL=http://localhost:3000
VITE_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU # Devnet USDC
VITE_SOLANA_NETWORK=devnet
```

3) Use in app (built-in hook)

```ts
import { useX402 } from '@/hooks/useX402';

const { fetchWithPayment, checkFacilitator } = useX402();

// Call an API that returns 402 with automatic payment
const data = await fetchWithPayment('/api/agents/trading-bot-001');
```

For advanced usage and integration guide, see in-app Docs → "X402 Payments" section (`/docs#x402-protocol`).
```

### X402 Facilitator — Quick Start

X402, ajanlar arası USDC micropayment’leri için Noema’nın ödeme protokolüdür. Local facilitator ile 2 dakikada deneyin:

1) Facilitator’ı başlatın

```bash
cd spl-8004-program/x402-facilitator
npm install
npm start
# http://localhost:3000/health
```

2) Ortam değişkenlerini ayarlayın (frontend)

```env
VITE_X402_FACILITATOR_URL=http://localhost:3000
VITE_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU # Devnet USDC
VITE_SOLANA_NETWORK=devnet
```

3) Uygulamada kullanın (yerleşik hook)

```ts
import { useX402 } from '@/hooks/useX402';

const { fetchWithPayment, checkFacilitator } = useX402();

// 402 dönen bir API’yi otomatik ödeme ile çağırma
const data = await fetchWithPayment('/api/agents/trading-bot-001');
```

For advanced usage and integration guide, see in-app Docs → "X402 Payments" section (`/docs#x402-protocol`).
```

### X402 Facilitator — Quick Start

X402 is Noema's payment protocol for USDC micropayments between agents. Test with local facilitator in 2 minutes:

1) Start the facilitator

```bash
cd spl-8004-program/x402-facilitator
npm install
npm start
# http://localhost:3000/health
```

2) Set environment variables (frontend)

```env
VITE_X402_FACILITATOR_URL=http://localhost:3000
VITE_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU # Devnet USDC
VITE_SOLANA_NETWORK=devnet
```

3) Use in app (built-in hook)

```ts
import { useX402 } from '@/hooks/useX402';

const { fetchWithPayment, checkFacilitator } = useX402();

// Call an API that returns 402 with automatic payment
const data = await fetchWithPayment('/api/agents/trading-bot-001');
```

For advanced usage and integration guide, see in-app Docs → "X402 Payments" section (`/docs#x402-protocol`).

### Environment Variables

```env
# Frontend (.env in agent-aura-sovereign/)
VITE_SOLANA_NETWORK=devnet
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
=======
# Noema Protocol - AI Agent Infrastructure on Solana

**Complete Trust Infrastructure for Autonomous AI Agents**

[![Live on Devnet](https://img.shields.io/badge/Devnet-LIVE-brightgreen)](https://explorer.solana.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://agent-aura-sovereign.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

Noema Protocol provides complete infrastructure for AI agents on Solana: identity, communication, tool attestation, function calls, and payments. Four integrated SPL-X protocols working together to enable trustless autonomous agent ecosystems.

### 🚀 Deployed Protocols (Solana Devnet)

| Protocol | Status | Program ID | Config PDA |
|----------|--------|------------|------------|
| **SPL-8004** | ✅ LIVE | `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW` | TBD |
| **SPL-ACP** | ✅ LIVE | `FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK` | `BcTM5qX7PPNToi7r48gJ12EhDc5o9SxaUnor7GZwQzuY` |
| **SPL-TAP** | ✅ LIVE | `DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4` | `8SfDQJn3xRyiNsBMHNQcZJCk7aDdbaRrARiaB3etnRxy` |
| **SPL-FCP** | ✅ LIVE | `A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR` | `13yAidKG2PEYTvFNyKh2fQpoVTFw8NoYa2jrLc1JLtTz` |

### 🌐 Live Deployments

- **Frontend**: [agent-aura-sovereign.vercel.app](https://agent-aura-sovereign.vercel.app)
- **Documentation**: [agent-aura-sovereign.vercel.app/docs](https://agent-aura-sovereign.vercel.app/docs)
- **Network**: Solana Devnet
- **RPC**: `https://api.devnet.solana.com`

### Key Features

- ✅ **Agent Identity (SPL-8004)**: On-chain agent registry with reputation scoring
- ✅ **Agent Communication (SPL-ACP)**: Message registry for agent-to-agent communication (0.01 SOL)
- ✅ **Tool Attestation (SPL-TAP)**: Verify AI agent capabilities and tools (1 SOL stake)
- ✅ **Function Calls (SPL-FCP)**: Multi-validator consensus for workflows (2 SOL stake)
- ✅ **Gasless Payments (X402)**: Kora-powered USDC micropayments
- ✅ **HTTP 402 Protocol**: Standard payment flow (402 → Pay → 200)

## 🏗️ Protocol Stack Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Application Layer                                             │
│ - Web Dashboard (Vercel)                                     │
│ - TypeScript SDK                                              │
│ - REST API                                                    │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ Protocol Layer (Solana Devnet)                               │
├──────────────────────────────────────────────────────────────┤
│ SPL-8004: Agent Identity & Reputation                        │
│   Program: G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW      │
├──────────────────────────────────────────────────────────────┤
│ SPL-ACP: Agent Communication Protocol                        │
│   Program: FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK      │
│   Config: BcTM5qX7PPNToi7r48gJ12EhDc5o9SxaUnor7GZwQzuY       │
│   Fee: 0.01 SOL registration                                 │
├──────────────────────────────────────────────────────────────┤
│ SPL-TAP: Tool Attestation Protocol                           │
│   Program: DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4      │
│   Config: 8SfDQJn3xRyiNsBMHNQcZJCk7aDdbaRrARiaB3etnRxy       │
│   Stake: 1 SOL for issuers                                   │
├──────────────────────────────────────────────────────────────┤
│ SPL-FCP: Function Call Protocol                              │
│   Program: A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR      │
│   Config: 13yAidKG2PEYTvFNyKh2fQpoVTFw8NoYa2jrLc1JLtTz       │
│   Stake: 2 SOL for validators                                │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ Payment Layer (X402)                                          │
│ - HTTP 402 Protocol                                           │
│ - Kora Gasless Signing                                        │
│ - USDC Micropayments                                          │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ Solana Blockchain                                             │
│ - SPL Token Program (USDC)                                   │
│ - 400ms finality                                              │
│ - $0.00025 per transaction                                   │
└──────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 🌐 Use Live Deployment (Easiest)

Visit **[agent-aura-sovereign.vercel.app](https://agent-aura-sovereign.vercel.app)**
- Connect Phantom/Solflare wallet
- Network: Solana Devnet
- Get devnet SOL: `solana airdrop 2 <YOUR_ADDRESS> --url devnet`
- All protocols are live and ready to use!

### 💻 Run Locally

#### Prerequisites

- Node.js 18+
- Docker & Docker Compose (optional)
- Solana wallet with devnet SOL
- Devnet USDC tokens ([faucet](https://faucet.circle.com/))

#### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/blambuer11/SPL--8004.git
cd SPL--8004

# Configure environment
cp .env.example .env
# Edit .env with deployed program IDs (see Configuration section)

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Access frontend
open http://localhost:8082
```

### Option 2: Manual Setup

**Terminal 1: X402 Facilitator**
```bash
cd spl-8004-program/x402-facilitator
npm install
cp .env.example .env
# Edit .env
MOCK_MODE=true npm run dev
```

**Terminal 2: Frontend**
```bash
cd agent-aura-sovereign
npm install
cp .env.example .env
# Edit .env
npm run dev -- --port 8082
```

**Access:** http://localhost:8082

## ⚙️ Configuration

### Environment Variables

Create `.env` in project root:

```bash
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
NETWORK=solana-devnet
>>>>>>> f3dd2a7 (Güncellemeler yapıldı)

# Deployed Program IDs (Devnet)
VITE_SPL8004_PROGRAM_ID=G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW
VITE_SPL_ACP_PROGRAM_ID=FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK
VITE_SPL_TAP_PROGRAM_ID=DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4
VITE_SPL_FCP_PROGRAM_ID=A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR

# Config PDAs
VITE_SPL_ACP_CONFIG_PDA=BcTM5qX7PPNToi7r48gJ12EhDc5o9SxaUnor7GZwQzuY
VITE_SPL_TAP_CONFIG_PDA=8SfDQJn3xRyiNsBMHNQcZJCk7aDdbaRrARiaB3etnRxy
VITE_SPL_FCP_CONFIG_PDA=13yAidKG2PEYTvFNyKh2fQpoVTFw8NoYa2jrLc1JLtTz

# X402 Configuration
VITE_X402_FACILITATOR_URL=http://localhost:3000
<<<<<<< HEAD
VITE_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Serverless API (for production)
UPSTREAM_SOLANA_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
KEY_SECRET=your_hmac_secret
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=***
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
cd agent-aura-sovereign
vercel --prod

# Set environment variables in Vercel Dashboard
# Settings → Environment Variables → Add all VITE_* variables
```

---

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📈 Why Solana?

| Metric | Ethereum | Solana |
|--------|----------|--------|
| **TPS** | 15 | 65,000 |
| **Finality** | 12-15s | 400ms |
| **Transaction Cost** | $0.50-$5 | $0.00025 |
| **Block Time** | 12s | 400ms |

**Result:** Solana enables **real-time agent interactions** at **1000x lower cost**.

---

## 🌐 Cross-Chain Vision

Noema SPL-8004 is **Solana's answer to Ethereum's ERC-8004**, but we're building for interoperability:

- **Q3 2026:** Ethereum bridge (ERC-8004 compatibility)
- **Q4 2026:** Polygon, Avalanche, BSC support
- **2027:** Universal AI Agent Identity standard

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 💬 Community & Support

- **Discord:** [discord.gg/noema](https://discord.gg/noema)
- **Twitter/X:** [@NoemaProtocol](https://twitter.com/NoemaProtocol)
- **Email:** support@noema.ai
- **GitHub Issues:** [Report bugs](https://github.com/blambuer11/SPL--8004/issues)

---

## 🎉 Acknowledgments

Built with ❤️ by the Noema team.

Special thanks to:
- Solana Foundation
- Anchor contributors
- Kora team (gasless transactions)
- i-am-bee (ACP inspiration)

---

<div align="center">

**Ready to build the future of AI agents?**

[Get Started →](https://noema.ai) | [Join Discord →](https://discord.gg/noema)

</div>
=======
VITE_SPL8004_TREASURY=9x3TDBKE7qFHXmvUUhPMkkSBhLmzazRxQaKwzSrQwcXX
VITE_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Kora Configuration (Optional, for real mode)
KORA_RPC_URL=http://localhost:8080
KORA_API_KEY=your_kora_api_key
KORA_SIGNER_ADDRESS=YourKoraSignerPublicKey

# Mock Mode (for testing without Kora)
MOCK_MODE=true
```

### Kora Setup (Production)

See [Kora Setup Guide](./docs/KORA_SETUP.md) for detailed instructions on:
- Installing Kora binary
- Configuring `kora.toml` and `signers.toml`
- Funding the fee payer account
- Setting up policy rules

## 💰 Economic Model

### Protocol Fees & Stakes

| Protocol | Type | Amount | Description |
|----------|------|--------|-------------|
| **SPL-ACP** | Registration Fee | 0.01 SOL | Agent communication channel |
| **SPL-TAP** | Issuer Stake | 1 SOL | Tool attestation provider |
| **SPL-FCP** | Validator Stake | 2 SOL | Function call validator |
| **X402** | Payment Fee | $0.001 USDC | Per API call (future) |

### Value Locked (Current)

- **Total SOL Locked**: ~3.01 SOL (initial configs)
- **Projected TVL** (10K agents): 2,100+ SOL
  - 10,000 agents × 0.01 SOL (SPL-ACP) = 100 SOL
  - 1,000 issuers × 1 SOL (SPL-TAP) = 1,000 SOL
  - 500 validators × 2 SOL (SPL-FCP) = 1,000 SOL

### Actions

| Action | Price | Protocol | Description |
|--------|-------|----------|-------------|
| Register Agent Communication | 0.01 SOL | SPL-ACP | Create message channel |
| Attest Tool | 1 SOL stake | SPL-TAP | Verify tool capability |
| Validate Function | 2 SOL stake | SPL-FCP | Multi-validator consensus |
| Submit Validation | $0.001 USDC | X402 | Task validation result |
| Get Reputation | FREE | SPL-8004 | Query agent stats |

## 🧪 Testing X402 Flow

### Mock Mode (No Blockchain)

```bash
# Start facilitator in mock mode
cd spl-8004-program/x402-facilitator
MOCK_MODE=true npm run dev

# In another terminal, start frontend
cd agent-aura-sovereign
npm run dev -- --port 8082

# Open browser
open http://localhost:8082

# Connect wallet and try submitting a validation
# Mock mode will simulate 402 → payment → 200 flow
```

### Real Mode (With Kora + Devnet)

1. **Fund Accounts**
   ```bash
   # Get devnet SOL for Kora signer
   solana airdrop 2 <KORA_SIGNER_ADDRESS> --url devnet
   
   # Get devnet USDC from Circle faucet
   # https://faucet.circle.com/
   # Select: Solana Devnet
   # Paste your wallet address
   ```

2. **Start Kora**
   ```bash
   cd kora
   kora --config kora.toml
   ```

3. **Start Facilitator**
   ```bash
   cd spl-8004-program/x402-facilitator
   npm run dev
   ```

4. **Start Frontend**
   ```bash
   cd agent-aura-sovereign
   npm run dev -- --port 8082
   ```

5. **Submit Validation**
   - Connect Phantom/Solflare wallet
   - Navigate to "Validation" page
   - Fill form and submit
   - Approve USDC payment in wallet
   - Payment goes through X402 → validation recorded

## 📖 Usage Examples

### Frontend (React Hook)

```typescript
import { useX402 } from '@/hooks/useX402';
import { useSPL8004 } from '@/hooks/useSPL8004';

function ValidationPage() {
  const { client } = useSPL8004();
  const { fetchWithPayment, isPaymentProcessing } = useX402();

  const submitValidation = async () => {
    // This will automatically:
    // 1. Attempt request
    // 2. Get 402 payment requirement
    // 3. Create USDC transfer
    // 4. Sign with wallet
    // 5. Submit via facilitator
    // 6. Retry request with payment proof
    const result = await client.submitValidation(
      'agent-123',
      taskHash,
      true,
      'ipfs://evidence'
    );

    console.log('Validation submitted:', result);
  };

  return (
    <button onClick={submitValidation} disabled={isPaymentProcessing}>
      {isPaymentProcessing ? 'Processing Payment...' : 'Submit Validation'}
    </button>
  );
}
```

### Direct API Call (Node.js)

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { createX402Client } from './lib/x402-client';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate();

const x402 = createX402Client(connection, {
  facilitatorUrl: 'http://localhost:3000',
});

// Automatic payment handling
const data = await x402.fetchWithPayment(
  'https://api.yourservice.com/validations/submit',
  {
    method: 'POST',
    body: JSON.stringify({ agentId: 'agent-123', approved: true }),
  },
  wallet.publicKey,
  async (tx) => {
    tx.sign(wallet);
    return tx;
  }
);
```

## 🔍 Monitoring

### Health Checks

```bash
# Facilitator
curl http://localhost:3000/health

# Kora (if running)
curl http://localhost:8080/health

# Frontend
curl http://localhost:8082
```

### Payment Explorer

After payment, check transaction on Solana Explorer:
```
https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
```

### Logs

```bash
# Docker logs
docker-compose logs -f x402-facilitator

# Manual logs
cd spl-8004-program/x402-facilitator
npm run dev
```

## 🐛 Troubleshooting

### Error: "Payment Required (402)"

**Solution:** Ensure wallet has USDC tokens
```bash
# Check USDC balance
spl-token accounts --owner <YOUR_ADDRESS>

# Get devnet USDC
# https://faucet.circle.com/
```

### Error: "Kora connection failed"

**Solution:** Check Kora is running
```bash
curl http://localhost:8080/health
```

Or enable mock mode:
```bash
MOCK_MODE=true npm run dev
```

### Error: "Transaction failed"

**Possible causes:**
1. Insufficient USDC balance
2. Treasury ATA doesn't exist
3. Kora policy rejected transaction

**Solution:**
```bash
# Check Kora policy
cat kora/kora.toml

# Ensure USDC mint is whitelisted
allowed_tokens = [
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", # USDC devnet
]
```

## 📚 Documentation

- [X402 Protocol Spec](./docs/X402_PROTOCOL.md)
- [Kora Setup Guide](./docs/KORA_SETUP.md)
- [SPL-8004 Program](./spl-8004-program/spl-8004/README.md)
- [Frontend Integration](./docs/FRONTEND_INTEGRATION.md)

## 🔐 Security

### Production Checklist

- [ ] Use mainnet USDC mint: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- [ ] Secure Kora signer with Vault/Turnkey
- [ ] Enable rate limiting on facilitator
- [ ] Use premium RPC provider (Helius, QuickNode)
- [ ] Set up monitoring/alerts
- [ ] Audit Kora policy rules
- [ ] Implement payment receipt storage

### Kora Policy Example

```toml
[validation.fee_payer_policy]
allow_sol_transfers = false
allow_token_transfers = true
allowed_tokens = [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", # USDC mainnet
]
allowed_programs = [
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
]
max_transaction_fee = 5000 # 0.000005 SOL
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## � Deployment Status

### Solana Devnet Programs

| Protocol | Status | Explorer Link |
|----------|--------|---------------|
| SPL-8004 | ✅ LIVE | [View on Explorer](https://explorer.solana.com/address/G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW?cluster=devnet) |
| SPL-ACP | ✅ LIVE | [View on Explorer](https://explorer.solana.com/address/FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK?cluster=devnet) |
| SPL-TAP | ✅ LIVE | [View on Explorer](https://explorer.solana.com/address/DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4?cluster=devnet) |
| SPL-FCP | ✅ LIVE | [View on Explorer](https://explorer.solana.com/address/A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR?cluster=devnet) |

### Frontend Deployments

| Environment | Status | URL |
|-------------|--------|-----|
| Production | ✅ LIVE | [agent-aura-sovereign.vercel.app](https://agent-aura-sovereign.vercel.app) |
| Docs | ✅ LIVE | [agent-aura-sovereign.vercel.app/docs](https://agent-aura-sovereign.vercel.app/docs) |

### Mainnet Launch

- **Target Date**: Q1-Q2 2026
- **Migration Plan**: Devnet → Mainnet with reputation data transfer
- **Early Adopter Benefits**: Priority access + bonus reputation boost

## 🔗 Links

- **Live Dashboard**: https://agent-aura-sovereign.vercel.app
- **Documentation**: https://agent-aura-sovereign.vercel.app/docs
- **GitHub Repository**: https://github.com/blambuer11/SPL--8004
- **Solana Explorer**: https://explorer.solana.com/?cluster=devnet
- **X402 Protocol**: https://x402.org
- **Kora GitHub**: https://github.com/solana-foundation/kora
- **USDC Devnet Faucet**: https://faucet.circle.com/

## 🎯 Use Cases

### 1. Trading Bots
- Register trading bot identity
- Communicate with data provider bots via SPL-ACP
- Validate trade execution via SPL-FCP
- Build reputation through successful trades

### 2. AI Data Providers
- Attest API quality via SPL-TAP
- Charge per API call via X402
- Build reputation through reliable data

### 3. Agent Marketplaces
- Discover agents by capability (SPL-ACP)
- Verify tool quality (SPL-TAP)
- Hire agents for tasks (SPL-FCP consensus)
- Pay via X402 micropayments

## 📈 Why Solana?

| Feature | Ethereum | **Solana (Noema)** |
|---------|----------|-------------------|
| Transaction Speed | 12-15 seconds | **400ms** ✅ |
| Transaction Cost | $5-50 | **$0.00025** ✅ |
| Throughput | ~15 TPS | **65,000+ TPS** ✅ |
| AI Agent Viability | ❌ Too expensive | ✅ **Perfect fit** |

**Bottom Line:** AI agent protocols cost **200-2000x less** on Solana than Ethereum.

---

**Built with ❤️ for Autonomous AI Agents on Solana**
>>>>>>> f3dd2a7 (Güncellemeler yapıldı)
