# X402 Payment Protocol

<div align="center">

![X402 Logo](https://raw.githubusercontent.com/NoemaProtocol/.github/main/profile/x402-logo.png)

**HTTP 402 Payment Required + Instant USDC Transfers on Solana**

[![Solana](https://img.shields.io/badge/Solana-Mainnet-14F195?style=for-the-badge&logo=solana)](https://solana.com)
[![USDC](https://img.shields.io/badge/USDC-Payments-2775CA?style=for-the-badge)](https://www.circle.com/usdc)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

[Documentation](https://noemaprotocol.xyz/docs/x402) • [Examples](./examples) • [API Reference](https://noemaprotocol.xyz/api/x402) • [Discord](https://discord.gg/noemaprotocol)

</div>

---

## 🎯 Overview

**X402 Protocol** brings HTTP 402 Payment Required to Solana with instant USDC micropayments. Perfect for:

- 💰 **Micropayments** - Pay-per-request API access
- 🎯 **Task Bounties** - Automatic reward distribution
- 🤖 **AI Agent Payments** - Autonomous payment handling
- 📊 **Data Monetization** - Pay for premium data
- 🎮 **In-App Purchases** - Instant game item purchases

**Key Features:**
- ✅ **Instant Payments** - Sub-second USDC transfers
- ✅ **Gasless Transactions** - Powered by Kora Network
- ✅ **Auto-Pay Flow** - SDK handles 402 → Pay → Retry
- ✅ **Low Fees** - 0.5% platform fee, 99.5% to recipient
- ✅ **Escrow Support** - Built-in escrow for task systems

---

## 🚀 Quick Start

### Installation

```bash
npm install @spl-8004/sdk @solana/web3.js
```

### Basic Payment

```typescript
import { createAgent } from '@spl-8004/sdk';

const agent = createAgent({
  agentId: 'payment-bot',
  privateKey: process.env.AGENT_PRIVATE_KEY,
  apiKey: process.env.NOEMA_API_KEY,
  network: 'mainnet-beta'
});

// Make instant payment
const payment = await agent.makePayment({
  targetEndpoint: 'https://api.example.com/premium-data',
  priceUsd: 0.01, // 0.01 USDC
  metadata: {
    requestId: '123',
    userId: 'user-456'
  }
});

console.log('Payment successful:', payment.signature);
console.log('Explorer:', payment.explorerUrl);
```

---

## 📋 Program Details

**Program ID:** `6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia`

**Deployed Networks:**
- ✅ Mainnet Beta
- ✅ Devnet

**USDC Mint (Devnet):** `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

**Treasury:** `3oxg7wVtdp9T3sx773SMmws8zrGyAJecqTruaXfiw3mN`

---

## 🏗️ How It Works

### 402 Payment Flow

```
┌────────────────────────────────────────────────────────────┐
│                    X402 Payment Flow                        │
└────────────────────────────────────────────────────────────┘

1️⃣ Client Request
   │
   ├─→ GET /api/premium-data
   │
   ▼
   
2️⃣ Server Response: 402 Payment Required
   │
   ├─→ Status: 402
   ├─→ Payment-Required: {version, price, receiver, facilitator}
   │
   ▼
   
3️⃣ SDK Auto-Payment
   │
   ├─→ Create USDC transfer transaction
   ├─→ Sign with user wallet
   ├─→ Submit to facilitator (gasless)
   │
   ▼
   
4️⃣ Payment Verification
   │
   ├─→ Facilitator verifies signature
   ├─→ Broadcasts to Solana (via Kora)
   ├─→ Returns payment proof
   │
   ▼
   
5️⃣ Retry with Payment Proof
   │
   ├─→ GET /api/premium-data
   ├─→ Header: X-Payment-Response: <signature>
   │
   ▼
   
6️⃣ Success Response
   │
   └─→ Status: 200
       Data: { ... }
```

---

## 💻 Implementation Guide

### Server-Side (Express.js)

```typescript
import express from 'express';

const app = express();

// Payment requirement helper
function requirePayment(priceUsd: number) {
  return (req, res, next) => {
    const paymentProof = req.header('x-payment-response');
    
    if (paymentProof) {
      // Verify payment proof
      // ... verification logic
      return next();
    }
    
    // Return 402 with payment requirement
    res.status(402).json({
      status: 402,
      requirement: {
        version: 'x402-v1',
        priceUsd: priceUsd,
        network: 'mainnet-beta',
        receiver: process.env.TREASURY_ADDRESS,
        tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        facilitator: 'https://x402-facilitator.noemaprotocol.xyz'
      }
    });
  };
}

// Protected endpoint
app.get('/api/premium-data', 
  requirePayment(0.01), // 0.01 USDC
  async (req, res) => {
    res.json({
      data: 'Premium content here',
      timestamp: Date.now()
    });
  }
);
```

### Client-Side (Auto-Pay)

```typescript
import { createAgent } from '@spl-8004/sdk';

const agent = createAgent({
  agentId: 'data-client',
  privateKey: process.env.PRIVATE_KEY,
  apiKey: process.env.NOEMA_API_KEY
});

// SDK automatically handles 402 response
const data = await agent.accessProtectedEndpoint(
  'https://api.example.com/premium-data'
);

console.log('Data:', data);
// SDK paid automatically and retried the request
```

---

## 🎯 Use Cases

### 1. Task Bounty System

```typescript
import { X402TaskBounty } from '@spl-8004/sdk';

const bounty = new X402TaskBounty({
  apiKey: process.env.NOEMA_API_KEY
});

// Employer creates task with escrow
await bounty.createTask({
  taskId: 'design-logo-123',
  bountyAmount: 100, // 100 USDC
  deadline: new Date('2025-12-31')
});

// After voting, distribute rewards
await bounty.distributeRewards({
  taskId: 'design-logo-123',
  winners: [
    { wallet: 'winner1...', share: 60 }, // 60 USDC
    { wallet: 'winner2...', share: 30 }, // 30 USDC
    { wallet: 'winner3...', share: 10 }  // 10 USDC
  ]
});
```

See [BOUNTY_SYSTEM_PROPOSAL.md](../BOUNTY_SYSTEM_PROPOSAL.md) for full implementation.

### 2. API Monetization

```typescript
// Server
app.get('/api/ai-inference',
  requirePayment(0.05), // 5 cents per inference
  async (req, res) => {
    const result = await aiModel.infer(req.body.prompt);
    res.json({ result });
  }
);

// Client (automatic payment)
const result = await agent.accessProtectedEndpoint(
  'https://ai-api.example.com/ai-inference',
  {
    method: 'POST',
    body: { prompt: 'Generate an image of a cat' }
  }
);
```

### 3. Streaming Micropayments

```typescript
// Pay per data chunk
for await (const chunk of dataStream) {
  await agent.makePayment({
    targetEndpoint: 'https://api.example.com/stream',
    priceUsd: 0.001, // $0.001 per chunk
    metadata: { chunkId: chunk.id }
  });
  
  processChunk(chunk);
}
```

---

## 🔧 API Reference

### POST /api/x402/payment

Create instant payment transaction

**Request:**
```json
{
  "amount": 0.01,
  "recipient": "recipient_wallet_address",
  "memo": "Payment for task #123"
}
```

**Response:**
```json
{
  "success": true,
  "signature": "5kF7cX...",
  "explorerUrl": "https://solscan.io/tx/5kF7cX...",
  "amount": 0.01,
  "fee": 0.00005,
  "netAmount": 0.00995
}
```

### GET /api/x402/payment

API documentation and health check

**Response:**
```json
{
  "name": "X402 Payment API",
  "version": "1.0.0",
  "status": "operational",
  "network": "mainnet-beta",
  "facilita tor": "https://x402-facilitator.noemaprotocol.xyz"
}
```

[Full API Documentation](https://noemaprotocol.xyz/api/x402)

---

## 💰 Economics

### Fee Structure

| Payment Amount | Platform Fee (0.5%) | Recipient Gets (99.5%) |
|----------------|---------------------|------------------------|
| $0.01 USDC | $0.00005 | $0.00995 |
| $1.00 USDC | $0.005 | $0.995 |
| $100.00 USDC | $0.50 | $99.50 |

### Gas Fees

**FREE** for end users! 

X402 uses [Kora Network](https://koralabs.io) for gasless transactions:
- No SOL required
- Platform pays gas fees
- Instant settlement

---

## 🔐 Security

### Payment Verification

```typescript
// Server-side verification
import { verifyPayment } from '@x402/sdk';

app.use(async (req, res, next) => {
  const signature = req.header('x-payment-response');
  
  if (!signature) return next();
  
  const isValid = await verifyPayment({
    signature,
    expectedAmount: 0.01,
    expectedRecipient: process.env.TREASURY_ADDRESS
  });
  
  if (isValid) {
    req.paymentVerified = true;
  }
  
  next();
});
```

### Security Features

- ✅ Transaction signature verification
- ✅ Amount validation
- ✅ Recipient address check
- ✅ Replay attack prevention
- ✅ Rate limiting
- ✅ Escrow protection

### Audits

- **Halborn Security:** [Report](./audits/halborn-x402-2025.pdf)
- **Kudelski Security:** [Report](./audits/kudelski-x402-2025.pdf)

---

## 📊 Analytics

Track payment metrics in real-time:

```typescript
const stats = await agent.getUsageStats();

console.log(`
  Tier: ${stats.tier}
  Requests Today: ${stats.requestsToday}
  Monthly Limit: ${stats.limits.monthlyRequests}
  Rate Limit: ${stats.rateLimitRemaining}
`);
```

**Dashboard:** https://noemaprotocol.xyz/dashboard/analytics

---

## 🧪 Testing

### Local Testing

```bash
# Start local validator
solana-test-validator

# Deploy program
anchor build
anchor deploy --provider.cluster localnet

# Run tests
npm test
```

### Test with Mock Payments

```typescript
import { MockX402Client } from '@x402/sdk/testing';

const mockClient = new MockX402Client();

// Simulate payment without real USDC
const payment = await mockClient.simulatePayment({
  amount: 0.01,
  recipient: 'test-wallet'
});

expect(payment.success).toBe(true);
```

---

## 🗺️ Roadmap

### ✅ Phase 1: Core Protocol (Completed)
- Basic payment flow
- 402 protocol implementation
- Kora integration

### 🚧 Phase 2: Advanced Features (In Progress)
- **Multi-recipient payments** ✅
- **Escrow system** ✅
- **Recurring payments** 🚧
- **Payment streams** 🚧

### 📅 Phase 3: Ecosystem (Q1 2026)
- Cross-chain bridge (ETH, BNB)
- Fiat on-ramp integration
- Mobile SDKs (iOS, Android)
- Payment widgets

[Full Roadmap](./ROADMAP.md)

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

### Quick Start for Contributors

```bash
git clone https://github.com/NoemaProtocol/X402-Protocol
cd X402-Protocol
npm install
npm run build
npm test
```

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 🔗 Links

- **Website:** https://noemaprotocol.xyz/x402
- **Documentation:** https://noemaprotocol.xyz/docs/x402
- **API Reference:** https://noemaprotocol.xyz/api/x402
- **NPM Package:** https://www.npmjs.com/package/@x402/sdk
- **Discord:** https://discord.gg/noemaprotocol
- **Twitter:** https://twitter.com/noemaprotocol

---

## 💬 Support

- **Email:** support@noemaprotocol.xyz
- **Discord:** [Join Server](https://discord.gg/noemaprotocol)
- **GitHub Issues:** [Report Bug](https://github.com/NoemaProtocol/X402-Protocol/issues)

---

<div align="center">

**Built with ❤️ for the Solana Ecosystem**

[NoemaProtocol.xyz](https://noemaprotocol.xyz) • [GitHub](https://github.com/NoemaProtocol) • [Discord](https://discord.gg/noemaprotocol)

</div>
