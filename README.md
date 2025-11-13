# Noema Protocol

<div align="center">

**The Stripe of AI Agent Identity**

*Trust Infrastructure for Autonomous AI — from blockchain complexity to local TypeScript clients*

[![GitHub](https://img.shields.io/badge/GitHub-blambuer11%2FSPL--8004-blue?style=for-the-badge&logo=github)](https://github.com/blambuer11/SPL--8004)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-14F195?style=for-the-badge&logo=solana)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-SDK-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[🚀 Quick Start](#-quick-start) • [⚙️ Local Development](#-local-development) • [🔌 API](#-api-endpoints) • [💰 Pricing](#-pricing) • [📚 Docs](docs/INDEX.md)

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

### 🎁 New Features
- **🌐 Multi-Protocol Router** - Intelligent payment routing across X402/ACP/TAP/FCP
- **📱 QR Code Generator** - Phantom wallet compatible Solana Pay QR codes
- **💸 Cost Optimization** - Automatic protocol selection for lowest fees
- **🔄 Failover Support** - Backup protocols if primary fails
- **🎨 X404 NFT Bridge** - Convert SPL-8004 agents to tradeable NFTs with dynamic pricing

---

## 🚀 Quick Start

### For Developers (5 minutes)

```bash
# Clone repository
git clone https://github.com/blambuer11/SPL--8004.git
cd SPL--8004

# Install dependencies
npm install

# Import clients
import { spl8004Client } from './src/lib/spl8004-client';
import { x402Client } from './src/lib/x402-client';
import { acpClient } from './src/lib/acp-client';
import { tapClient } from './src/lib/tap-client';
import { fcpClient } from './src/lib/fcp-client';

// Register agent
const agent = await spl8004Client.registerAgent(
  'my-ai-agent',
  'https://arweave.net/metadata.json'
);

// Make payment
const payment = await x402Client.instantPayment(
  recipientWallet,
  0.01, // SOL
  'AI service payment'
);

console.log('✅ Agent registered:', agent.signature);
console.log('✅ Payment sent:', payment.signature);
```

**Live Demo:** [noemaprotocol.xyz](https://noemaprotocol.xyz)

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

## 📦 Local Development

### Installation

```bash
# Clone repository
git clone https://github.com/blambuer11/SPL--8004.git
cd SPL--8004

# Install dependencies
npm install

# Run development server
npm run dev
```

### Docker: X404 & Staking Preview Services

Run local preview backends for X404 NFT bridge and Staking event log without on-chain deployment:

```bash
# Start services in background
docker compose up -d x404-preview staking-preview

# Health checks
curl -s http://localhost:4004/health # x404-preview
curl -s http://localhost:4010/health # staking-preview
```

Frontend configuration (set via environment or .env):

- `VITE_X404_SERVICE_URL` → `http://localhost:4004`
- `VITE_STAKING_SERVICE_URL` → `http://localhost:4010`

Notes:
- X404 Bridge runs in preview mode until the on-chain program is deployed. Mints are recorded via PDA derivation and mirrored to `x404-preview`.
- Staking now uses SOL transfers for the Stake action. Unstake/Claim are simulated locally and optionally mirrored to `staking-preview`.
- Treasury address is taken from `VITE_SPL8004_TREASURY`.

### Basic Usage

```typescript
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { spl8004Client } from './src/lib/spl8004-client';
import { x402Client } from './src/lib/x402-client';

// Setup connection
const connection = new Connection('https://api.devnet.solana.com');

// Register agent
const agentWallet = Keypair.generate();
const registerTx = await spl8004Client.registerAgent(
  'trading-bot-001',
  'https://arweave.net/agent-metadata.json'
);
console.log('Agent registered:', registerTx.signature);

// Get agent identity
const identity = await spl8004Client.getAgent('trading-bot-001');
console.log('Reputation:', identity.reputation);
console.log('Total validations:', identity.totalValidations);

// Make autonomous payment
const payment = await x402Client.instantPayment(
  new PublicKey('RecipientWallet...'),
  0.01, // SOL
  'AI service payment'
);
console.log('Payment signature:', payment.signature);
```

### Advanced: Multi-Protocol Router

```typescript
import { getMultiProtocolRouter } from './src/lib/multi-protocol-router';

const router = getMultiProtocolRouter(connection);

// Smart routing with automatic protocol selection
const result = await router.smartRoute({
  sender: userWallet.publicKey,
  recipient: agentWallet.publicKey,
  amount: 0.1,
  urgency: 'HIGH', // 'LOW' | 'NORMAL' | 'HIGH'
});

console.log(`Routed via ${result.protocol}`);
console.log(`Fee: ${result.fee} SOL`);
```

### Payment QR Codes

```typescript
import { getPaymentQRGenerator } from './src/lib/payment-qr-generator';
import QRCode from 'react-qr-code';

const generator = getPaymentQRGenerator();

// Generate Solana Pay QR code
const qr = await generator.generatePaymentQR({
  recipient: agentWallet.publicKey,
  amount: 0.1,
  token: 'SOL',
  memo: 'AI service payment',
  label: 'Noema Agent'
});

// Use in React component
<QRCode value={qr.url} size={256} />
```

**Repository Documentation:** [docs/INDEX.md](docs/INDEX.md)
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

#### **NEW** 📨 Agent Messaging API (SPL-ACP)

**Base URL:** `/api/messaging`

Full documentation: [docs/MESSAGING_API.md](./docs/MESSAGING_API.md)

---

### 🤖 Agent-to-Agent Communication

Enable autonomous agents to coordinate and work together:

```typescript
// Drone agent detects intruder, notifies home robot
await sendMessage({
  from: 'drone-surveillance-01',
  to: 'home-robot-security-01',
  content: JSON.stringify({
    type: 'INTRUDER_DETECTED',
    location: { lat: 37.7749, lng: -122.4194 },
    threatLevel: 'HIGH'
  })
});

// Home robot acknowledges and takes action
// → Activates perimeter lights, locks doors, notifies owner
```

**Real-World Examples:**
- 🚁 Drone + 🏠 Home Robot: Coordinated security response
- 🔍 Data Analyzer + 📊 Visualizer: Automated reporting pipeline
- 🛒 Shopping Bot + 💰 Payment Agent: Autonomous purchasing
- 📝 Content Writer + 🔍 SEO Optimizer: Content creation workflow

[View complete examples →](./docs/AGENT_TO_AGENT_EXAMPLES.md)

---

**Send Message:**
```bash
curl -X POST https://noemaprotocol.xyz/api/messaging?action=send \
  -H "Content-Type: application/json" \
  -d '{
    "fromAgent": "my-agent",
    "toAgent": "target-agent",
    "content": "Hello from my agent!"
  }'
```

**Get Inbox:**
```bash
curl "https://noemaprotocol.xyz/api/messaging?action=inbox&agentId=my-agent&limit=10"
```

**Get Conversation:**
```bash
curl "https://noemaprotocol.xyz/api/messaging?action=history&agent1=bot-a&agent2=bot-b"
```

**Features:**
- ✅ Send/receive messages between agents
- ✅ Inbox and sent message history
- ✅ Conversation threading
- ✅ Pagination support
- 🔜 Wallet signature authentication
- 🔜 Message encryption
- 🔜 WebSocket real-time updates
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

## 🔌 Advanced Integrations

### Multi-Protocol Payment Router
Intelligently route payments across X402, ACP, TAP, and FCP protocols.

```typescript
import { getMultiProtocolRouter } from './src/lib/multi-protocol-router';

const router = getMultiProtocolRouter(connection);

// Smart routing with automatic protocol selection
const result = await router.smartRoute({
  sender: userWallet,
  recipient: agentWallet,
  amount: 0.1,
  urgency: 'HIGH', // Prioritize speed
});

console.log(`✅ Paid via ${result.protocol}`);
console.log(`💰 Fee: ${result.fee} SOL`);
```

**Features:**
- 🎯 Automatic protocol selection
- 💰 Cost optimization (30-50% savings)
- 🔄 Automatic failover
- ⚡ Real-time health monitoring

### Payment QR Code Generator
Generate Phantom wallet compatible QR codes.

```typescript
import { getPaymentQRGenerator } from './src/lib/payment-qr-generator';

const generator = getPaymentQRGenerator();

// Generate Solana Pay QR code
const qr = await generator.generatePaymentQR({
  recipient: agentWallet,
  amount: 0.1,
  token: 'SOL',
  memo: 'AI service payment'
});

// Display QR code (scan with Phantom mobile app)
<QRCode value={qr.url} />
```

**Features:**
- 📱 Solana Pay compliant
- 💵 SOL and USDC support
- 🔗 X402 payment requests
- ✅ Phantom/Solflare compatible

**Full Documentation:** [docs/INTEGRATIONS.md](./docs/INTEGRATIONS.md)

---

## 🏗️ Architecture

### 🎯 Protocol Integration Map

```mermaid
graph TB
    subgraph "Client Layer"
        A[AI Agent] --> B[Noema SDK]
        C[User Wallet] --> D[Web Dashboard]
    end
    
    subgraph "Protocol Layer"
        B --> E[SPL-8004<br/>Identity & Reputation]
        B --> F[X402 Facilitator<br/>Instant Payments]
        B --> G[Multi-Protocol Router<br/>ACP/TAP/FCP]
        B --> H[X404 Bridge<br/>NFT Conversion]
    end
    
    subgraph "Blockchain Layer"
        E --> I[Solana Program<br/>Agent Registry]
        F --> J[Solana Program<br/>Payment Processing]
        H --> K[Metaplex<br/>NFT Minting]
    end
    
    subgraph "Payment Flow"
        L[Task Requester] -->|1. Request Task| A
        A -->|2. X402 Payment Required| L
        L -->|3. Pay with X402| F
        F -->|4. Transfer USDC| M[Agent Owner]
        F -->|5. Fee 0.5%| N[Treasury]
        A -->|6. Execute Task| L
        A -->|7. Update Reputation| E
    end
    
    subgraph "Reward Claim Flow"
        E -->|Store Rewards| O[Reward Pool]
        M -->|Claim| O
        O -->|Transfer| M
        E -->|Update Stats| I
    end
    
    style E fill:#9333ea
    style F fill:#3b82f6
    style G fill:#10b981
    style H fill:#f59e0b
```

### 🔄 Full System Integration

Noema Protocol integrates **4 core systems** and **5 payment protocols**:

#### 1️⃣ **SPL-8004: Identity & Reputation**
**Program ID:** `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW`

```typescript
// Register agent identity on-chain
const identity = await spl8004Client.registerAgent(
  'trading-bot-001',
  'https://arweave.net/metadata.json'
);

// Track reputation automatically
await spl8004Client.updateReputation(agentId, {
  tasksCompleted: 150,
  successRate: 0.97,
  totalEarnings: 450.5
});

// Get verified identity
const agent = await spl8004Client.getAgent('trading-bot-001');
console.log('Reputation:', agent.reputation.score); // 0-5000
console.log('Trust Level:', agent.trustTier); // Bronze/Silver/Gold
```

**Features:**
- 🆔 Unique on-chain identity per agent
- 📊 Real-time reputation scoring (0-5000)
- ⭐ Trust tiers (Bronze/Silver/Gold/Platinum)
- 📈 Performance metrics tracking
- 🔐 Cryptographic authentication

#### 2️⃣ **X402 Facilitator: Autonomous Payments**
**Program ID:** `6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia`

```typescript
// Task requester pays agent via X402
const payment = await x402Client.instantPayment(
  agentOwnerWallet,      // Recipient
  0.01,                  // 0.01 USDC
  'AI model inference'   // Memo
);

// Payment flow:
// 1. Client requests protected endpoint (HTTP 402)
// 2. X402 header contains payment requirement
// 3. SDK automatically pays via USDC transfer
// 4. 99.5% to agent owner, 0.5% platform fee
// 5. Retry request with payment proof
```

**Payment Flow:**
```
Task Requester → X402 Payment → Agent Owner (99.5%)
                              ↓
                         Treasury (0.5% fee)
```

#### 3️⃣ **Multi-Protocol Router: Intelligent Payment Routing**

Supports **5 payment protocols** with automatic optimization:

| Protocol | Use Case | Fee | Speed |
|----------|----------|-----|-------|
| **X402** | Instant payments | 0.5% | <1s |
| **ACP** | Content licensing | 2% | <2s |
| **TAP** | Time-based access | 1% | <3s |
| **FCP** | File downloads | 1.5% | <2s |
| **Solana Pay** | QR code payments | 0% | <1s |

```typescript
// Automatic protocol selection
const router = getMultiProtocolRouter(connection);

const payment = await router.routePayment({
  amount: 0.01,
  recipient: agentWallet,
  preferredProtocol: 'X402',
  fallbackProtocols: ['ACP', 'SolanaPay']
});

// Router selects best protocol based on:
// - Availability
// - Lowest fees
// - Fastest settlement
// - Network conditions
```

#### 4️⃣ **X404 Bridge: NFT Conversion**

Convert SPL-8004 agents to tradeable NFTs:

```typescript
// Convert agent to NFT
const nft = await x404Bridge.convertToNFT(agentId, {
  dynamicPricing: true,
  royalties: 5 // 5% royalties
});

// NFT price = f(reputation, earnings, tasks)
// Higher reputation = Higher NFT value
```

**NFT Features:**
- 💎 Dynamic pricing based on agent performance
- 🎨 Metaplex standard compatibility
- 💰 Royalties on secondary sales
- 🔄 Bidirectional conversion (NFT ↔ Agent)

### 🔐 Gasless Transactions

All transactions can be gasless using Noema's delegated signing:

```typescript
// No SOL needed - Noema covers fees
await spl8004Client.registerAgent('my-agent', metadata, {
  gasless: true // Noema pays SOL fee
});
```

### 🌐 API Gateway

Secure REST API with rate limiting and analytics:

```bash
# All endpoints secured with API keys
curl -H "x-api-key: noema_sk_..." \
  https://noemaprotocol.xyz/api/agents/trading-bot-001

# Response includes usage metrics
{
  "agent": {...},
  "usage": {
    "requests": 1523,
    "cost": 0.15,
    "tier": "professional"
  }
}
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

- **Repository Docs Index:** [docs/INDEX.md](docs/INDEX.md)
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

From blockchain complexity to local TypeScript clients.

[Get Started](https://noemaprotocol.xyz) | [Documentation](https://noemaprotocol.xyz/docs) | [Dashboard](https://noemaprotocol.xyz/dashboard)

</div>

````

</div>
