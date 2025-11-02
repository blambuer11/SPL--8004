# Noema Protocol

<div align="center">

**The AWS of AI Agent Infrastructure**

*Complete trust and infrastructure layer for autonomous AI agents on Solana*

![Noema Protocol](https://img.shields.io/badge/Noema-Protocol-8B5CF6?style=for-the-badge)
![Solana](https://img.shields.io/badge/Solana-65K_TPS-14F195?style=for-the-badge&logo=solana)
![TypeScript](https://img.shields.io/badge/TypeScript-SDK-3178C6?style=for-the-badge&logo=typescript)

[🚀 Get Started](https://noema.ai) • [📚 Docs](#-documentation) • [🎯 Protocols](#-four-protocol-stack) • [🗺️ Roadmap](#-roadmap)

</div>

---

## 🌟 What is Noema Protocol?

Noema is the **complete infrastructure stack** for AI agents on Solana. We combine **four protocol standards** to provide everything autonomous agents need:

| Protocol | Purpose | Status |
|----------|---------|--------|
| **SPL-8004** | Identity & Reputation | ✅ Live (Devnet) |
| **SPL-ACP** | Agent Communication | 📅 Q1 2026 |
| **SPL-TAP** | Tool Abstraction | 📅 Q2 2026 |
| **SPL-FCP** | Function Calls | 📅 Q2 2026 |

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
**Status: 📅 Q1 2026**

Standardized inter-agent messaging with RESTful JSON schema.

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

### 3. SPL-TAP: Tool Abstraction Protocol
**Status: 📅 Q2 2026**

Plug-and-play tool registry for agents to discover and invoke external APIs.

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
**Status: 📅 Q2 2026**

LLM-native function calling for agents (OpenAI tools format compatible).

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

### Phase 0: Foundation ✅
**Nov 2025 (Current)**
- SPL-8004 live on Devnet
- SDK, REST API, No-Code dashboard
- X402 + Kora integrations

### Phase 1: Research & Design 🔨
**Dec 2025**
- Adapt ACP/TAP/FCP specs to Solana
- Design PDA schemas
- Whitepaper + UML diagrams

### Phase 2: Development 📅
**Q1 2026 (Jan-Mar)**
- SPL-ACP implementation
- SPL-TAP implementation
- SPL-FCP implementation
- Beta SDK release

### Phase 3: Integration & Audit 🔒
**Q2 2026 (Apr-May)**
- Security audit (PeckShield)
- Community beta program
- Full integration into Noema dashboard

### Phase 4: Mainnet Launch 🚀
**Q2 2026 (Jun-Jul)**
- Mainnet deployment (all protocols)
- Performance tuning
- Marketing campaign

[Full roadmap →](https://noema.ai/roadmap)

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS** + **shadcn/ui**
- **Solana Wallet Adapter** (Phantom, Solflare)

### Blockchain
- **Solana Devnet** (mainnet ready)
- **Anchor Framework** (Rust programs)
- **SPL-8004 Program:** `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW`

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

# Start dev server
npm run dev

# Build for production
npm run build
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

Gelişmiş kullanım ve entegrasyon rehberi için uygulama içi Docs → “X402 Payments” bölümüne bakın (`/docs#x402-protocol`).

### Environment Variables

```env
# Frontend
VITE_SOLANA_NETWORK=devnet
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
VITE_PROGRAM_ID=G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW

# Serverless API (for production)
UPSTREAM_SOLANA_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
KEY_SECRET=your_hmac_secret
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=***
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
