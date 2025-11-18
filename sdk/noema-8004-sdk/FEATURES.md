# SPL-8004 SDK Features

Complete guide to what developers can build with the SPL-8004 SDK.

## 📦 Installation

```bash
npm install spl-8004-sdk
```

[![npm version](https://img.shields.io/npm/v/spl-8004-sdk.svg)](https://www.npmjs.com/package/spl-8004-sdk)
[![npm downloads](https://img.shields.io/npm/dm/spl-8004-sdk.svg)](https://www.npmjs.com/package/spl-8004-sdk)

## 🚀 Core Capabilities

### 1. AI Agent Identity Management

Create and manage decentralized AI agent identities on Solana.

```typescript
import { SPL8004SDK } from 'spl-8004-sdk';
import { Keypair } from '@solana/web3.js';

const wallet = Keypair.generate();
const sdk = await SPL8004SDK.create(wallet, 'devnet');

// Register a new AI agent
const agent = await sdk.registerAgent({
  agentId: 'my-ai-assistant',
  metadataUri: 'https://myapp.com/agent-metadata.json',
  capabilities: ['chat', 'image-generation', 'code-review'],
  validator: validatorPublicKey
});

console.log('Agent PDA:', agent.pda.toBase58());
console.log('Transaction:', agent.signature);
```

**Use Cases:**
- AI service marketplaces
- Autonomous agent networks
- Decentralized AI reputation systems
- Multi-agent orchestration platforms

**Documentation:** [Agent Registration Guide](https://docs.noemaprotocol.xyz/agents/registration)

---

### 2. Automated Payment Processing

Execute USDC payments with automatic 0.5% protocol fee deduction.

```typescript
// Create payment to agent owner
const payment = await sdk.createPayment({
  recipient: agentOwnerPublicKey,
  amount: 10, // 10 USDC
  memo: 'AI image generation service',
  reference: 'task-12345'
});

console.log('Payment Signature:', payment.signature);
console.log('Protocol Fee:', payment.fee); // 0.05 USDC (0.5%)
console.log('Timestamp:', new Date(payment.timestamp));
```

**Features:**
- ✅ Automatic fee calculation and deduction
- ✅ USDC-based payments (6 decimal precision)
- ✅ Transaction memos and references
- ✅ Instant settlement on Solana

**Documentation:** [Payment API Reference](https://docs.noemaprotocol.xyz/payments)

---

### 3. Multi-Network Support

Seamlessly switch between Devnet, Testnet, and Mainnet.

```typescript
import { SPL8004SDK, PROGRAM_IDS, RPC_ENDPOINTS } from 'spl-8004-sdk';

// Development on Devnet
const devSDK = SPL8004SDK.create(wallet, 'devnet');

// Production on Mainnet
const mainSDK = SPL8004SDK.create(wallet, 'mainnet-beta');

// Access network-specific constants
console.log('Devnet Program:', PROGRAM_IDS.devnet.toBase58());
console.log('Mainnet RPC:', RPC_ENDPOINTS['mainnet-beta']);
```

**Available Networks:**
| Network | Program ID | RPC Endpoint |
|---------|-----------|--------------|
| Devnet | `Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu` | `https://api.devnet.solana.com` |
| Testnet | `Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu` | `https://api.testnet.solana.com` |
| Mainnet | `Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu` | `https://api.mainnet-beta.solana.com` |

---

### 4. Account Management Tools

Efficient PDA (Program Derived Address) calculation and account queries.

```typescript
import { findAgentPda, findStakePda, PROGRAM_IDS } from 'spl-8004-sdk';

// Calculate agent PDA (gas-free)
const [agentPda, bump] = await findAgentPda('agent-id', PROGRAM_IDS.devnet);
console.log('Agent Account:', agentPda.toBase58());
console.log('Bump Seed:', bump);

// Calculate stake PDA
const [stakePda] = await findStakePda(ownerPublicKey, PROGRAM_IDS.devnet);

// Fetch agent account data
const agentData = await sdk.getAgentById('my-agent-id');
console.log('Reputation Score:', agentData.reputation);
console.log('Total Transactions:', agentData.totalTransactions);
console.log('Created:', new Date(agentData.createdAt));

// Check wallet balance
const balance = await sdk.getBalance();
console.log('Balance:', balance, 'SOL');
```

**Documentation:** [Account Structure](https://docs.noemaprotocol.xyz/accounts)

---

### 5. Currency Conversion Utilities

Built-in utilities for SOL, USDC, and token conversions.

```typescript
import { 
  lamportsToSol, 
  solToLamports,
  usdcToBaseUnits,
  baseUnitsToUsdc,
  calculateFee
} from 'spl-8004-sdk';

// SOL conversions
const sol = lamportsToSol(1_000_000_000); // 1 SOL
const lamports = solToLamports(0.5); // 500_000_000 lamports

// USDC conversions (6 decimals)
const baseUnits = usdcToBaseUnits(100); // 100_000_000
const usdc = baseUnitsToUsdc(50_000_000); // 50 USDC

// Protocol fee calculation
const fee = calculateFee(100); // 0.5 USDC (default 0.5% rate)
const customFee = calculateFee(100, 0.01); // 1 USDC (1% rate)
```

**Supported Conversions:**
- SOL ↔ Lamports (9 decimals)
- USDC ↔ Base Units (6 decimals)
- Fee calculations with custom rates

---

### 6. Validation & Security Utilities

Comprehensive validation and encoding utilities.

```typescript
import { 
  isValidPublicKey, 
  encodeBase58, 
  decodeBase58,
  sleep 
} from 'spl-8004-sdk';

// Public key validation
const userInput = 'Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu';
if (isValidPublicKey(userInput)) {
  const pubkey = new PublicKey(userInput);
  console.log('Valid public key ✅');
}

// Base58 encoding/decoding
const encoded = encodeBase58('hello world');
const decoded = decodeBase58(encoded);
console.log('Decoded:', decoded.toString());

// Retry logic helper
await sleep(1000); // Wait 1 second
```

**Security Features:**
- Input validation before blockchain operations
- Safe base58 encoding/decoding
- Rate limiting helpers

---

### 7. Agent Metadata Updates

Update agent capabilities and metadata URIs.

```typescript
// Update agent information
const result = await sdk.updateAgent({
  agentId: 'my-agent',
  metadataUri: 'https://updated-metadata.json',
  capabilities: ['chat', 'vision', 'audio', 'code-generation']
});

console.log('Update Transaction:', result.signature);
```

**Updatable Fields:**
- Metadata URI
- Capabilities list
- Validator address

**Documentation:** [Metadata Schema](https://docs.noemaprotocol.xyz/metadata)

---

### 8. Protocol Constants & Configuration

Pre-configured constants for all networks and protocol parameters.

```typescript
import { 
  PROGRAM_IDS,
  USDC_MINTS,
  RPC_ENDPOINTS,
  PROTOCOL_FEE,
  MIN_STAKE_AMOUNT,
  STAKE_LOCK_PERIODS
} from 'spl-8004-sdk';

// Network-specific USDC mints
console.log('Devnet USDC:', USDC_MINTS.devnet.toBase58());
console.log('Mainnet USDC:', USDC_MINTS['mainnet-beta'].toBase58());

// Protocol parameters
console.log('Fee Rate:', PROTOCOL_FEE); // 0.005 (0.5%)
console.log('Min Stake:', MIN_STAKE_AMOUNT); // 100 NOEMA
console.log('Lock Periods:', STAKE_LOCK_PERIODS); // [30, 60, 90] days
```

**Available Constants:**
| Constant | Value | Description |
|----------|-------|-------------|
| `PROTOCOL_FEE` | `0.005` | 0.5% fee on all payments |
| `MIN_STAKE_AMOUNT` | `100` | Minimum NOEMA tokens to stake |
| `STAKE_LOCK_PERIODS` | `[30, 60, 90]` | Available staking periods (days) |

---

### 9. Full TypeScript Support

Complete type definitions for all SDK operations.

```typescript
import type { 
  AgentAccount,
  RegisterAgentParams,
  UpdateAgentParams,
  PaymentParams,
  PaymentResult,
  StakeParams,
  NetworkType,
  SDKConfig
} from 'spl-8004-sdk';

// Type-safe agent registration
const params: RegisterAgentParams = {
  agentId: 'agent-1',
  metadataUri: 'https://metadata.json',
  capabilities: ['chat', 'vision'],
  validator: validatorPublicKey
};

// Type-safe payment handling
const handlePayment = async (payment: PaymentParams): Promise<PaymentResult> => {
  return await sdk.createPayment(payment);
};
```

**Type Definitions:**
- `AgentAccount` - Agent account structure
- `RegisterAgentParams` - Agent registration parameters
- `PaymentParams` - Payment transaction parameters
- `PaymentResult` - Payment result with fee and timestamp
- `NetworkType` - `'devnet' | 'testnet' | 'mainnet-beta'`

**Documentation:** [TypeScript API Reference](https://docs.noemaprotocol.xyz/typescript)

---

## 🎯 Real-World Use Cases

### AI Service Marketplace

```typescript
import { SPL8004SDK } from 'spl-8004-sdk';

class AIMarketplace {
  sdk: SPL8004SDK;

  async purchaseService(
    aiProviderId: string,
    serviceType: string,
    amount: number
  ) {
    // Get AI provider details
    const provider = await this.sdk.getAgentById(aiProviderId);
    
    // Execute payment
    const payment = await this.sdk.createPayment({
      recipient: provider.owner,
      amount,
      memo: `Service: ${serviceType}`,
      reference: `order-${Date.now()}`
    });

    return {
      orderId: payment.signature,
      provider: aiProviderId,
      amount,
      fee: payment.fee,
      timestamp: payment.timestamp
    };
  }
}
```

**Live Example:** [AI Marketplace Demo](https://demo.noemaprotocol.xyz/marketplace)

---

### Agent Reputation System

```typescript
async function validateAgentReputation(agentId: string): Promise<boolean> {
  const agent = await sdk.getAgentById(agentId);
  
  if (!agent) {
    console.log('Agent not found');
    return false;
  }

  // Check reputation threshold
  const MIN_REPUTATION = 500;
  const MIN_TRANSACTIONS = 10;

  if (agent.reputation >= MIN_REPUTATION && 
      agent.totalTransactions >= MIN_TRANSACTIONS) {
    console.log(`✅ Trusted agent: ${agent.reputation} reputation`);
    return true;
  }

  console.log('⚠️ Low reputation agent');
  return false;
}
```

**Documentation:** [Reputation Mechanics](https://docs.noemaprotocol.xyz/reputation)

---

### Automated Payment Service

```typescript
class SubscriptionService {
  sdk: SPL8004SDK;
  subscribers: Map<string, { agentId: string; amount: number }>;

  async processMonthlyPayments() {
    for (const [userId, sub] of this.subscribers) {
      try {
        const agent = await this.sdk.getAgentById(sub.agentId);
        
        const payment = await this.sdk.createPayment({
          recipient: agent.owner,
          amount: sub.amount,
          memo: `Monthly subscription - ${new Date().toISOString()}`,
          reference: `sub-${userId}`
        });

        console.log(`✅ Paid ${sub.amount} USDC to ${sub.agentId}`);
      } catch (error) {
        console.error(`❌ Payment failed for ${userId}:`, error);
      }
    }
  }

  // Run every 30 days
  startScheduler() {
    setInterval(() => this.processMonthlyPayments(), 30 * 24 * 60 * 60 * 1000);
  }
}
```

---

### Multi-Network Dashboard

```typescript
import { SPL8004SDK, NetworkType } from 'spl-8004-sdk';

async function getMultiNetworkBalances(wallet: Keypair) {
  const networks: NetworkType[] = ['devnet', 'testnet', 'mainnet-beta'];
  const balances: Record<NetworkType, number> = {} as any;

  for (const network of networks) {
    const sdk = SPL8004SDK.create(wallet, network);
    balances[network] = await sdk.getBalance();
  }

  console.log('Balances:');
  console.log('  Devnet:', balances.devnet, 'SOL');
  console.log('  Testnet:', balances.testnet, 'SOL');
  console.log('  Mainnet:', balances['mainnet-beta'], 'SOL');

  return balances;
}
```

---

### Agent Analytics Dashboard

```typescript
async function getAgentAnalytics(agentId: string) {
  const agent = await sdk.getAgentById(agentId);
  
  if (!agent) throw new Error('Agent not found');

  return {
    identity: {
      id: agent.agentId,
      pda: agent.pda.toBase58(),
      owner: agent.owner.toBase58()
    },
    performance: {
      reputation: agent.reputation,
      totalTransactions: agent.totalTransactions,
      accountAge: Date.now() - agent.createdAt
    },
    metadata: {
      uri: agent.metadataUri,
      lastUpdate: new Date(agent.updatedAt)
    }
  };
}
```

---

## 📚 Additional Resources

### Quick Links

- **NPM Package:** https://www.npmjs.com/package/spl-8004-sdk
- **GitHub Repository:** https://github.com/NoemaProtocol/SPL-8004
- **Documentation:** https://docs.noemaprotocol.xyz
- **API Reference:** https://docs.noemaprotocol.xyz/api
- **Discord Community:** https://discord.gg/noema
- **Twitter:** https://twitter.com/NoemaProtocol

### Tutorials

- [Getting Started Guide](https://docs.noemaprotocol.xyz/tutorials/getting-started)
- [Building an AI Marketplace](https://docs.noemaprotocol.xyz/tutorials/marketplace)
- [Integrating Payment Systems](https://docs.noemaprotocol.xyz/tutorials/payments)
- [Multi-Agent Orchestration](https://docs.noemaprotocol.xyz/tutorials/orchestration)

### Code Examples

- [Basic Integration](https://github.com/NoemaProtocol/examples/tree/main/basic-integration)
- [AI Service Marketplace](https://github.com/NoemaProtocol/examples/tree/main/marketplace)
- [Subscription Service](https://github.com/NoemaProtocol/examples/tree/main/subscriptions)
- [Reputation System](https://github.com/NoemaProtocol/examples/tree/main/reputation)

### Developer Tools

- [Solana Explorer](https://explorer.solana.com/)
- [Devnet Faucet](https://faucet.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)

---

## 🛠️ Development Setup

### Prerequisites

```bash
# Node.js 16+ required
node --version

# Install dependencies
npm install spl-8004-sdk @solana/web3.js
```

### Environment Variables

```env
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
WALLET_PRIVATE_KEY=your_base58_private_key
```

### Example Project Structure

```
my-ai-app/
├── src/
│   ├── agents/
│   │   ├── register.ts
│   │   └── manage.ts
│   ├── payments/
│   │   ├── process.ts
│   │   └── history.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](https://github.com/NoemaProtocol/SPL-8004/blob/main/CONTRIBUTING.md).

### Development

```bash
# Clone repository
git clone https://github.com/NoemaProtocol/SPL-8004.git
cd SPL-8004/sdk/spl-8004-sdk

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

---

## 📄 License

MIT License - see [LICENSE](https://github.com/NoemaProtocol/SPL-8004/blob/main/LICENSE)

---

## 🆘 Support

- **Issues:** https://github.com/NoemaProtocol/SPL-8004/issues
- **Discussions:** https://github.com/NoemaProtocol/SPL-8004/discussions
- **Email:** support@noemaprotocol.xyz
- **Discord:** https://discord.gg/noema

---

**Built with ❤️ by the Noema Protocol team**
