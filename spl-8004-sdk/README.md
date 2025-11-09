# SPL-8004 SDK

> **Build Autonomous AI Agents with On-Chain Identity & Gasless Payments**

SPL-8004 is a Solana-based infrastructure that enables AI agents to:
- 🆔 Have verifiable on-chain identities
- 💰 Make autonomous payments without manual approval
- ⛽ Use gasless transactions (zero SOL fees)
- 📊 Build reputation through on-chain activity
- 🔐 Manage secure wallets

## 🚀 Quick Start

### Installation

```bash
npm install @spl-8004/sdk
# or
yarn add @spl-8004/sdk
# or
pnpm add @spl-8004/sdk
```

### Basic Usage

```typescript
import { createAgent } from '@spl-8004/sdk';

// Create agent
const agent = createAgent({
  agentId: 'my-agent',
  privateKey: 'YOUR_BASE58_PRIVATE_KEY',
  network: 'devnet', // or 'mainnet-beta'
  validatorApiUrl: 'https://api.spl8004.io', // Your hosted API
});

// Access protected endpoint (auto-pays if needed)
const data = await agent.accessProtectedEndpoint('https://api.example.com/data');

console.log('✅ Data accessed:', data);
```

## 📖 Core Features

### 1. Agent Identity

Every agent has an on-chain identity with reputation tracking:

```typescript
// Get agent identity
const identity = await agent.getIdentity();

console.log(`Agent: ${identity.agentId}`);
console.log(`Reputation: ${identity.reputation}`);
console.log(`Total Payments: ${identity.totalPayments}`);
console.log(`Total Spent: ${identity.totalSpent} USDC`);
```

### 2. Autonomous Payments

Agents can make payments without human intervention:

```typescript
// Manual payment
const payment = await agent.makePayment({
  targetEndpoint: '/api/premium-data',
  priceUsd: 0.001,
  metadata: { requestId: '123' },
});

console.log(`Payment successful: ${payment.signature}`);
console.log(`Explorer: ${payment.explorerUrl}`);
```

### 3. Auto-Pay Protected Endpoints

Access X402-protected APIs automatically:

```typescript
// Agent automatically pays if endpoint requires payment (402 status)
const result = await agent.accessProtectedEndpoint('/api/leaderboard');

// POST request with auto-pay
const submitResult = await agent.accessProtectedEndpoint('/api/validations/submit', {
  method: 'POST',
  body: { data: 'validation data' },
});
```

### 4. Balance Management

```typescript
// Check SOL balance
const sol = await agent.getBalance();
console.log(`SOL Balance: ${sol}`);

// Check USDC balance
import { PublicKey } from '@solana/web3.js';
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
const usdc = await agent.getUsdcBalance(USDC_MINT);
console.log(`USDC Balance: ${usdc}`);
```

## 🤖 Complete Agent Example

```typescript
import { createAgent } from '@spl-8004/sdk';

async function runAgent() {
  // Initialize agent
  const agent = createAgent({
    agentId: 'validation-bot',
    privateKey: process.env.AGENT_PRIVATE_KEY!,
    network: 'devnet',
    validatorApiUrl: 'https://validator.spl8004.io',
  });

  console.log(`🤖 Agent started: ${agent.getPublicKey().toString()}`);

  // Agent loop
  while (true) {
    try {
      // 1. Generate validation data
      const validationData = await generateValidation();

      // 2. Submit to protected endpoint (auto-pays if needed)
      const result = await agent.accessProtectedEndpoint(
        'https://api.example.com/validations/submit',
        {
          method: 'POST',
          body: validationData,
        }
      );

      console.log(`✅ Validation submitted: ${result.ref}`);

      // 3. Check identity/reputation
      const identity = await agent.getIdentity();
      console.log(`📊 Reputation: ${identity.reputation}`);

    } catch (error) {
      console.error('❌ Error:', error);
    }

    // Wait before next iteration
    await new Promise(resolve => setTimeout(resolve, 60000));
  }
}

async function generateValidation() {
  // Your validation logic
  return {
    task_hash: '0x...',
    approved: true,
    evidence: 'https://...',
  };
}

runAgent();
```

## 🔑 Keypair Generation

Generate new agent keypair:

```typescript
import { generateAgentKeypair } from '@spl-8004/sdk';

const { publicKey, privateKey } = generateAgentKeypair();

console.log('Public Key:', publicKey);
console.log('Private Key:', privateKey);

// Store privateKey securely in .env
// AGENT_PRIVATE_KEY=<privateKey>
```

## 🌐 Hosting Your Own Infrastructure

### Deploy Validator API

```bash
# Clone repository
git clone https://github.com/your-org/spl-8004-validator
cd spl-8004-validator

# Configure
cp .env.example .env
# Edit .env with your settings

# Deploy
docker-compose up -d
# or
npm run deploy
```

### Required Environment Variables

```bash
# Network
NETWORK=solana-mainnet
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# SPL-8004 Program
PROGRAM_ID=G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW

# Treasury
TREASURY_ADDRESS=YOUR_TREASURY_WALLET
USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Kora Gasless (Optional)
KORA_RPC_URL=https://api.kora.network
KORA_API_KEY=your_api_key

# Agent Keys (for multi-agent support)
AGENT_ALPHA_KEY=base58_private_key
AGENT_BETA_KEY=base58_private_key
```

## 📊 Pricing Models

SPL-8004 supports flexible pricing:

### Per-Request Pricing
```typescript
// Different prices for different endpoints
const leaderboard = await agent.accessProtectedEndpoint('/api/leaderboard'); // 0.0001 USDC
const premium = await agent.accessProtectedEndpoint('/api/premium-data'); // 0.01 USDC
```

### Subscription Model
```typescript
// Monthly subscription via on-chain stake
await agent.stakeForAccess({
  amount: 10, // 10 USDC/month
  duration: 30 * 24 * 60 * 60, // 30 days in seconds
});
```

## 🔒 Security Best Practices

1. **Private Key Storage**
   ```typescript
   // ❌ Never hardcode
   const agent = createAgent({ privateKey: 'actual_key_here' });
   
   // ✅ Use environment variables
   const agent = createAgent({ privateKey: process.env.AGENT_KEY! });
   ```

2. **Rate Limiting**
   ```typescript
   // Implement rate limiting in your agent
   const rateLimiter = new RateLimiter({ requests: 100, per: '1h' });
   ```

3. **Balance Monitoring**
   ```typescript
   // Alert when balance low
   const balance = await agent.getUsdcBalance(USDC_MINT);
   if (balance < 1) {
     await sendAlert('Agent balance low!');
   }
   ```

## 🎯 Use Cases

### 1. AI Validation Bots
Autonomous validators that pay to submit validations:
```typescript
const validator = createAgent({ agentId: 'validator-001', ... });
const result = await validator.accessProtectedEndpoint('/api/validations/submit', {
  method: 'POST',
  body: validationData,
});
```

### 2. Data Aggregators
Agents that collect data from multiple paid sources:
```typescript
const aggregator = createAgent({ agentId: 'aggregator', ... });
const [data1, data2, data3] = await Promise.all([
  aggregator.accessProtectedEndpoint('https://source1.com/api/data'),
  aggregator.accessProtectedEndpoint('https://source2.com/api/data'),
  aggregator.accessProtectedEndpoint('https://source3.com/api/data'),
]);
```

### 3. Trading Bots
High-frequency traders accessing premium market data:
```typescript
const trader = createAgent({ agentId: 'hft-bot', ... });
while (true) {
  const marketData = await trader.accessProtectedEndpoint('/api/premium-feed');
  await executeTrade(marketData);
}
```

## 🏗️ Architecture

```
┌─────────────────┐
│   Your Agent    │
│  (SDK Client)   │
└────────┬────────┘
         │
         ├─ Auto-pay
         ├─ Identity
         └─ Reputation
         
         ↓
         
┌─────────────────────┐
│  Validator API      │
│  (Your Infrastructure) │
├─────────────────────┤
│  • Agent Wallet     │
│  • Payment Logic    │
│  • Access Control   │
└────────┬────────────┘
         │
         ↓
         
┌─────────────────────┐
│   Kora RPC          │
│  (Gasless Provider) │
├─────────────────────┤
│  • Sign & Send      │
│  • 0 SOL Fees       │
└────────┬────────────┘
         │
         ↓
         
┌─────────────────────┐
│  Solana Blockchain  │
├─────────────────────┤
│  • SPL-8004 Program │
│  • Identity PDAs    │
│  • USDC Transfers   │
└─────────────────────┘
```

## 📚 API Reference

### AgentClient

#### Constructor
```typescript
new AgentClient(config: AgentConfig)
```

#### Methods

- `getPublicKey(): PublicKey` - Get agent's public key
- `getBalance(): Promise<number>` - Get SOL balance
- `getUsdcBalance(mint): Promise<number>` - Get USDC balance
- `getIdentity(): Promise<AgentIdentity>` - Get agent identity
- `makePayment(options): Promise<PaymentResult>` - Make payment
- `accessProtectedEndpoint<T>(endpoint, options): Promise<T>` - Access with auto-pay
- `createIdentity(metadata): Promise<AgentIdentity>` - Create on-chain identity

## 🤝 Support

- 📖 [Documentation](https://docs.spl8004.io)
- 💬 [Discord](https://discord.gg/spl8004)
- 🐛 [GitHub Issues](https://github.com/your-org/spl-8004/issues)
- 📧 Email: support@spl8004.io

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 🌟 Examples

Check out [examples/](./examples) for more use cases:
- `examples/validator-bot/` - Validation agent
- `examples/data-aggregator/` - Multi-source data agent
- `examples/trading-bot/` - Trading agent
- `examples/monitoring/` - Balance & reputation monitoring

---

Built with ❤️ by the SPL-8004 Team
