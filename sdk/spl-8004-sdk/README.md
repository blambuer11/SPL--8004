# SPL-8004 SDK

> Official TypeScript SDK for SPL-8004 Protocol - Decentralized AI Agent Payments on Solana

[![npm version](https://img.shields.io/npm/v/spl-8004-sdk.svg)](https://www.npmjs.com/package/spl-8004-sdk)
[![npm downloads](https://img.shields.io/npm/dm/spl-8004-sdk.svg)](https://www.npmjs.com/package/spl-8004-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Build decentralized AI agent marketplaces, payment systems, and reputation networks on Solana with automatic USDC payments and 0.5% protocol fees.

## 📦 Installation

```bash
npm install spl-8004-sdk
```

**Requirements:** Node.js 16+, TypeScript 4.5+ (optional)

## 🚀 Quick Start

### Basic Setup

```typescript
import { SPL8004SDK } from 'spl-8004-sdk';
import { Keypair } from '@solana/web3.js';

// Initialize SDK (Devnet)
const wallet = Keypair.generate();
const sdk = await SPL8004SDK.create(wallet, 'devnet');

console.log('SDK initialized on devnet');
```

### Register an AI Agent

```typescript
const agent = await sdk.registerAgent({
  agentId: 'my-ai-assistant',
  metadataUri: 'https://example.com/metadata.json',
  capabilities: ['chat', 'image-generation', 'code-review'],
  validator: wallet.publicKey
});

console.log('Agent PDA:', agent.pda.toBase58());
console.log('Transaction:', agent.signature);
```

### Process Payments

```typescript
// Pay 10 USDC to an agent (0.5% fee auto-deducted)
const payment = await sdk.createPayment({
  recipient: agentOwnerPublicKey,
  amount: 10,
  memo: 'AI service payment',
  reference: 'order-12345'
});

console.log('Payment sent:', payment.signature);
console.log('Protocol fee:', payment.fee, 'USDC');
```

### Query Agent Data

```typescript
const agent = await sdk.getAgentById('my-ai-assistant');

console.log('Reputation:', agent.reputation);
console.log('Total Transactions:', agent.totalTransactions);
console.log('Created:', new Date(agent.createdAt));
```

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **Agent Identity** | Register and manage AI agents on-chain |
| 💳 **USDC Payments** | Automatic payment processing with 0.5% fee |
| ⭐ **Reputation System** | On-chain reputation tracking |
| 🌐 **Multi-Network** | Support for Devnet, Testnet, Mainnet |
| 🔧 **Utilities** | Built-in conversion and validation tools |
| 📘 **TypeScript** | Full type definitions included |

## 📚 Documentation

- **[Complete Feature Guide](./FEATURES.md)** - All SDK capabilities with examples
- **[API Reference](https://docs.noemaprotocol.xyz/api)** - Detailed API documentation
- **[Tutorials](https://docs.noemaprotocol.xyz/tutorials)** - Step-by-step guides
- **[GitHub](https://github.com/NoemaProtocol/SPL-8004)** - Source code and examples

## 🎯 Use Cases

- **AI Service Marketplaces** - Build platforms for AI service trading
- **Automated Payments** - Subscription and recurring payment systems
- **Reputation Networks** - Decentralized AI agent reputation tracking
- **Multi-Agent Systems** - Orchestrate and manage agent interactions

## 🔗 Links

- **NPM:** https://www.npmjs.com/package/spl-8004-sdk
- **Website:** https://noemaprotocol.xyz
- **Docs:** https://docs.noemaprotocol.xyz
- **Discord:** https://discord.gg/noema
- **Twitter:** https://twitter.com/NoemaProtocol

## 📄 License

MIT License - see [LICENSE](https://github.com/NoemaProtocol/SPL-8004/blob/main/LICENSE)

---

**Built with ❤️ by Noema Protocol**
