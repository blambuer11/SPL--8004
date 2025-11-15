# @spl-8004/sdk

> **Primary Open Source SDK** - Direct on-chain integration for SPL-8004 protocol

## Overview

The **@spl-8004/sdk** is the primary open-source SDK for building with the SPL-8004 protocol on Solana. It provides direct on-chain access to agent identity, reputation, and autonomous payment features **without requiring API keys**.

Perfect for:
- ✅ Validators and node operators
- ✅ On-chain integrations
- ✅ Open-source projects
- ✅ Self-hosted infrastructure
- ✅ Full protocol control

## Installation

```bash
npm install @spl-8004/sdk
```

or

```bash
yarn add @spl-8004/sdk
```

or

```bash
pnpm add @spl-8004/sdk
```

## Quick Start

```typescript
import { createAgent, generateAgentKeypair } from '@spl-8004/sdk';

// Generate new agent keypair
const { publicKey, privateKey } = generateAgentKeypair();
console.log('Agent Public Key:', publicKey);

// Create agent client (no API key needed!)
const agent = createAgent({
  agentId: 'my-agent-001',
  privateKey: privateKey,
  network: 'devnet', // or 'mainnet-beta'
  rpcUrl: 'https://api.devnet.solana.com', // optional
});

// Get agent balance
const balance = await agent.getBalance();
console.log('SOL Balance:', balance);

// Create on-chain identity
const identity = await agent.createIdentity('My AI Agent');
console.log('Identity created:', identity);

// Get reputation score
const reputation = await agent.getIdentity();
console.log('Reputation:', reputation.reputation);
```

## Features

### 🔑 No API Key Required
Direct blockchain access - configure your RPC endpoint and go.

### ⛓️ On-Chain First
All operations interact directly with Solana programs for maximum decentralization.

### 💰 Autonomous Payments
Access protected endpoints with automatic USDC payments.

### 📊 Reputation System
Track agent performance and build trust on-chain.

### 🚀 Type-Safe
Full TypeScript support with complete type definitions.

## Configuration

```typescript
interface AgentConfig {
  agentId: string;           // Unique agent identifier
  privateKey: string;        // Base58-encoded secret key
  apiKey: string;            // Noema API key (for managed features)
  network?: 'devnet' | 'mainnet-beta';
  rpcUrl?: string;           // Custom RPC endpoint
  apiUrl?: string;           // Noema API URL (optional)
}
```

## Core Methods

### Identity Management

```typescript
// Create agent identity on-chain
const identity = await agent.createIdentity(metadata?: string);

// Get current identity
const identity = await agent.getIdentity();
```

### Balance Operations

```typescript
// Get SOL balance
const solBalance = await agent.getBalance();

// Get USDC balance
const usdcBalance = await agent.getUsdcBalance(usdcMint);
```

### Autonomous Payments

```typescript
// Make payment to access protected endpoint
const payment = await agent.makePayment({
  targetEndpoint: 'https://api.example.com/data',
  priceUsd: 0.001,
  metadata: { requestId: '123' }
});

// Auto-pay and access endpoint in one call
const data = await agent.accessProtectedEndpoint(
  'https://api.example.com/protected-data',
  {
    method: 'POST',
    body: { query: 'weather' }
  }
);
```

## Network Configuration

### Devnet (Testing)

```typescript
const agent = createAgent({
  agentId: 'test-agent',
  privateKey: 'your-base58-key',
  apiKey: 'your-api-key',
  network: 'devnet',
  rpcUrl: 'https://api.devnet.solana.com'
});
```

### Mainnet (Production)

```typescript
const agent = createAgent({
  agentId: 'prod-agent',
  privateKey: 'your-base58-key',
  apiKey: 'your-api-key',
  network: 'mainnet-beta',
  rpcUrl: 'https://api.mainnet-beta.solana.com'
});
```

## Examples

Check the `/examples` directory for complete working examples:
- Basic agent setup
- Payment flows
- Identity management
- Reputation tracking

## Differences from @noema/sdk

| Feature | @spl-8004/sdk | @noema/sdk |
|---------|---------------|------------|
| API Key | Optional | Required |
| Deployment | Self-hosted | Managed/Hosted |
| RPC Control | Full | Managed |
| Cost | Direct gas fees | Tiered pricing |
| Use Case | Validators, integrators | Application developers |

## Support

- **Documentation**: https://noemaprotocol.xyz/docs
- **GitHub**: https://github.com/NoemaProtocol/SPL--8004
- **Discord**: https://discord.gg/noema

## License

MIT - See LICENSE file for details
