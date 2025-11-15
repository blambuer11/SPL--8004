# @noema/sdk

> **Managed SDK** - Hosted API with tiered pricing for rapid development

## Overview

The **@noema/sdk** provides a managed, hosted API solution for integrating SPL-8004 protocol features into your applications. Get started quickly with **API key authentication** and **tiered pricing** plans.

Perfect for:
- ✅ Application developers
- ✅ Rapid prototyping
- ✅ Production apps
- ✅ Managed infrastructure
- ✅ Usage-based billing

## Installation

```bash
npm install @noema/sdk
```

or

```bash
yarn add @noema/sdk
```

or

```bash
pnpm add @noema/sdk
```

## Quick Start

```typescript
import { createAgent, generateAgentKeypair } from '@noema/sdk';

// Get your API key from https://noemaprotocol.xyz/dashboard
const API_KEY = 'your-api-key-here';

// Generate new agent keypair
const { publicKey, privateKey } = generateAgentKeypair();

// Create agent client with API key
const agent = createAgent({
  agentId: 'my-agent-001',
  privateKey: privateKey,
  apiKey: API_KEY,  // Required for managed features
  network: 'devnet',
});

// Get usage statistics
const usage = await agent.getUsageStats();
console.log('Requests today:', usage.requestsToday);
console.log('Rate limit remaining:', usage.rateLimitRemaining);

// Create identity (counts against your quota)
const identity = await agent.createIdentity();
console.log('Identity created:', identity);
```

## Get Your API Key

1. Visit https://noemaprotocol.xyz/dashboard
2. Connect your wallet
3. Generate a new API key
4. Copy and store securely

## Features

### 🔐 API Key Authentication
Secure access with per-key rate limits and usage tracking.

### 📊 Usage Analytics
Real-time monitoring of requests, costs, and limits.

### 💎 Tiered Pricing
Choose the plan that fits your needs:
- **Free**: 1,000 requests/day
- **Pro**: 100,000 requests/day
- **Enterprise**: Unlimited + dedicated support

### 🚀 Managed Infrastructure
No RPC management - we handle all blockchain interactions.

### 📈 Auto-Scaling
Handles traffic spikes automatically.

## Pricing Tiers

| Tier | Daily Requests | Monthly Requests | Price |
|------|----------------|------------------|-------|
| Free | 1,000 | 30,000 | $0 |
| Pro | 100,000 | 3,000,000 | $99/mo |
| Enterprise | Unlimited | Unlimited | Contact |

## Usage Tracking

```typescript
// Get current usage stats
const stats = await agent.getUsageStats();

console.log('Today:', stats.requestsToday);
console.log('This month:', stats.requestsThisMonth);
console.log('Total:', stats.totalRequests);
console.log('Tier:', stats.tier);
console.log('Rate limit remaining:', stats.rateLimitRemaining);
console.log('Resets at:', new Date(stats.rateLimitReset));
```

## Core Methods

All methods from `@spl-8004/sdk` are available, plus managed features:

### Usage & Limits

```typescript
// Get usage statistics
const usage = await agent.getUsageStats();

// Check if within limits
if (usage.rateLimitRemaining > 0) {
  // Make request
}
```

### Identity Management

```typescript
// Create agent identity (counts as 1 request)
const identity = await agent.createIdentity();

// Get identity (counts as 1 request)
const info = await agent.getIdentity();
```

### Payments

```typescript
// Make payment (counts as 1 request)
const payment = await agent.makePayment({
  targetEndpoint: 'https://api.example.com/data',
  priceUsd: 0.001
});

// Access protected endpoint with auto-payment
const data = await agent.accessProtectedEndpoint(
  'https://api.example.com/protected',
  { method: 'GET' }
);
```

## Error Handling

```typescript
try {
  const identity = await agent.createIdentity();
} catch (error) {
  if (error.message.includes('Rate limit exceeded')) {
    // Wait for rate limit reset
    const stats = await agent.getUsageStats();
    console.log('Reset at:', new Date(stats.rateLimitReset));
  } else if (error.message.includes('API key')) {
    // Invalid or missing API key
    console.error('Check your API key');
  }
}
```

## Environment Variables

```bash
# .env
NOEMA_API_KEY=your-api-key-here
NOEMA_AGENT_ID=my-agent-001
NOEMA_PRIVATE_KEY=base58-encoded-key
```

```typescript
const agent = createAgent({
  agentId: process.env.NOEMA_AGENT_ID!,
  privateKey: process.env.NOEMA_PRIVATE_KEY!,
  apiKey: process.env.NOEMA_API_KEY!,
});
```

## Migration from @spl-8004/sdk

Already using `@spl-8004/sdk`? Migration is simple:

```typescript
// Before (@spl-8004/sdk)
const agent = createAgent({
  agentId: 'my-agent',
  privateKey: key,
  network: 'devnet',
  rpcUrl: 'https://api.devnet.solana.com'
});

// After (@noema/sdk)
const agent = createAgent({
  agentId: 'my-agent',
  privateKey: key,
  apiKey: 'your-api-key', // Just add this!
  network: 'devnet',
});
```

## Differences from @spl-8004/sdk

| Feature | @noema/sdk | @spl-8004/sdk |
|---------|------------|---------------|
| API Key | Required | Optional |
| Deployment | Managed | Self-hosted |
| RPC Management | Handled for you | Your responsibility |
| Cost | Tiered pricing | Direct gas fees |
| Rate Limits | Yes | No |
| Analytics | Built-in | DIY |
| Support | Priority (Pro+) | Community |

## Support

- **Dashboard**: https://noemaprotocol.xyz/dashboard
- **Documentation**: https://noemaprotocol.xyz/docs
- **GitHub**: https://github.com/NoemaProtocol/SPL--8004
- **Discord**: https://discord.gg/noema
- **Email**: support@noemaprotocol.xyz

## License

MIT - See LICENSE file for details
