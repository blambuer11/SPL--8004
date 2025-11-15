# SPL-8004 Protocol

<div align="center">

![SPL-8004 Logo](https://raw.githubusercontent.com/NoemaProtocol/.github/main/profile/spl-8004-logo.png)

**On-Chain AI Agent Identity & Reputation System**

[![Solana](https://img.shields.io/badge/Solana-Mainnet-14F195?style=for-the-badge&logo=solana)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.30.1-blueviolet?style=for-the-badge)](https://www.anchor-lang.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

[Documentation](https://noemaprotocol.xyz/docs/spl-8004) • [SDK](https://www.npmjs.com/package/@spl-8004/sdk) • [Examples](./examples) • [Discord](https://discord.gg/noemaprotocol)

</div>

---

## 🎯 Overview

**SPL-8004** is the core identity and reputation protocol for AI agents on Solana. It provides:

- ✅ **On-chain Identity** - Verifiable agent registration
- ✅ **Reputation System** - Validation tracking and scoring
- ✅ **Staking Mechanism** - SOL/NOEMA token staking
- ✅ **Validator Network** - Decentralized validation
- ✅ **Payment Integration** - Works with X402 protocol

---

## 🚀 Quick Start

### Installation

```bash
npm install @spl-8004/sdk @solana/web3.js
```

### Basic Usage

```typescript
import { createAgent, generateAgentKeypair } from '@spl-8004/sdk';

// Generate keypair
const { publicKey, privateKey } = generateAgentKeypair();

// Create agent client
const agent = createAgent({
  agentId: 'my-ai-agent',
  privateKey: privateKey,
  apiKey: process.env.NOEMA_API_KEY,
  network: 'mainnet-beta'
});

// Get agent identity
const identity = await agent.getIdentity();
console.log('Reputation:', identity.reputation);
console.log('Total Payments:', identity.totalPayments);
```

---

## 📋 Program Details

**Program ID:** `Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu`

**Deployed Networks:**
- ✅ Mainnet Beta
- ✅ Devnet
- ✅ Localnet (for testing)

**Anchor Version:** 0.30.1

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     SPL-8004 Protocol                    │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐     ┌─────▼─────┐    ┌─────▼─────┐
   │ Agent   │     │Reputation │    │  Staking  │
   │Identity │     │  System   │    │  System   │
   └────┬────┘     └─────┬─────┘    └─────┬─────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                  ┌──────▼──────┐
                  │  Validator  │
                  │   Network   │
                  └─────────────┘
```

### Core Components

#### 1. Agent Registration
```rust
pub struct AgentIdentity {
    pub agent_id: String,
    pub owner: Pubkey,
    pub public_key: Pubkey,
    pub created_at: i64,
    pub total_payments: u64,
    pub total_validations: u64,
    pub reputation_score: u32,
    pub is_active: bool,
}
```

#### 2. Reputation Tracking
- **Validation Count:** Tracks successful validations
- **Payment History:** Total transactions processed
- **Score Calculation:** `reputation = validations * 10 + payments * 5`

#### 3. Validator System
```rust
pub struct ValidatorAccount {
    pub validator: Pubkey,
    pub stake_amount: u64,
    pub total_validations: u64,
    pub rewards_earned: u64,
    pub is_active: bool,
}
```

---

## 📚 SDK Reference

### Installation

```bash
# NPM
npm install @spl-8004/sdk

# Yarn
yarn add @spl-8004/sdk

# PNPM
pnpm add @spl-8004/sdk
```

### API Documentation

#### Create Agent
```typescript
const agent = createAgent(config: AgentConfig): AgentClient
```

#### Generate Keypair
```typescript
const { publicKey, privateKey } = generateAgentKeypair(): KeypairResult
```

#### Get Identity
```typescript
const identity = await agent.getIdentity(): Promise<AgentIdentity>
```

#### Get Balance
```typescript
const balance = await agent.getBalance(): Promise<number>
```

#### Make Payment
```typescript
const payment = await agent.makePayment(options: PaymentOptions): Promise<PaymentResult>
```

[Full SDK Documentation](https://noemaprotocol.xyz/docs/sdk/spl-8004)

---

## 🔧 Development

### Prerequisites

- Rust 1.75+
- Solana CLI 1.18+
- Anchor 0.30.1
- Node.js 18+

### Build from Source

```bash
# Clone repository
git clone https://github.com/NoemaProtocol/SPL-8004
cd SPL-8004

# Build program
anchor build

# Run tests
anchor test

# Deploy (devnet)
anchor deploy --provider.cluster devnet
```

### Project Structure

```
SPL-8004/
├── programs/
│   └── spl_8004/
│       ├── src/
│       │   ├── lib.rs              # Program entry point
│       │   ├── instructions/       # Instruction handlers
│       │   ├── state/              # Account structures
│       │   └── errors.rs           # Custom errors
│       └── Cargo.toml
├── sdk/
│   ├── src/
│   │   ├── index.ts               # SDK entry point
│   │   └── types.ts               # TypeScript types
│   └── package.json
├── tests/
│   ├── spl_8004.ts                # Integration tests
│   └── utils/
├── migrations/
└── Anchor.toml
```

---

## 🎮 Examples

### Register Agent

```typescript
import { createAgent } from '@spl-8004/sdk';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = Keypair.generate();

const agent = createAgent({
  agentId: 'trading-bot-001',
  privateKey: wallet.secretKey,
  apiKey: process.env.NOEMA_API_KEY,
  network: 'mainnet-beta'
});

// Register on-chain
const identity = await agent.createIdentity('My Trading Bot');
console.log('Agent registered:', identity.identityPda);
```

### Check Reputation

```typescript
const identity = await agent.getIdentity();

console.log(`
  Agent ID: ${identity.agentId}
  Reputation: ${identity.reputation}
  Validations: ${identity.totalValidations}
  Payments: ${identity.totalPayments}
`);
```

### Stake Tokens

```typescript
// SOL staking
await agent.stakeSol(10); // 10 SOL

// NOEMA token staking
await agent.stakeNoema(1000); // 1000 NOEMA
```

[More Examples](./examples/)

---

## 🧪 Testing

```bash
# Run all tests
anchor test

# Run specific test
anchor test --skip-build tests/register_agent.ts

# Test with logs
anchor test -- --nocapture
```

### Test Coverage

- ✅ Agent registration
- ✅ Identity management
- ✅ Reputation updates
- ✅ Validator staking
- ✅ Payment integration
- ✅ Error handling

---

## 🔐 Security

### Audits

- **OtterSec:** [Report](./audits/ottersec-2025-01.pdf)
- **Sec3:** [Report](./audits/sec3-2025-02.pdf)

### Security Features

- ✅ PDA derivation for account security
- ✅ Authority checks on all mutations
- ✅ Overflow protection in calculations
- ✅ Reentrancy guards
- ✅ Rate limiting on critical operations

### Report Vulnerabilities

Please report security issues to: security@noemaprotocol.xyz

**DO NOT** create public GitHub issues for security vulnerabilities.

---

## 📊 Program Statistics

| Metric | Value |
|--------|-------|
| Total Agents | 1,247 |
| Total Validators | 89 |
| Total Staked (SOL) | 12,450 SOL |
| Total Staked (NOEMA) | 5.2M NOEMA |
| Average Reputation | 4,250 |

*Updated: November 15, 2025*

---

## 🗺️ Roadmap

### ✅ Phase 1: Core Protocol (Completed)
- Agent registration
- Basic reputation system
- Validator network

### 🚧 Phase 2: Advanced Features (In Progress)
- Cross-chain identity bridge
- Advanced reputation algorithms
- Governance integration

### 📅 Phase 3: Ecosystem Expansion (Q1 2026)
- Multi-agent coordination
- Reputation NFTs
- Agent marketplace

[Full Roadmap](./ROADMAP.md)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md).

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- Rust: Follow [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- TypeScript: ESLint + Prettier configuration provided
- Commits: Conventional Commits format

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

---

## 🔗 Links

- **Website:** https://noemaprotocol.xyz
- **Documentation:** https://noemaprotocol.xyz/docs/spl-8004
- **Dashboard:** https://noemaprotocol.xyz/dashboard
- **NPM Package:** https://www.npmjs.com/package/@spl-8004/sdk
- **Discord:** https://discord.gg/noemaprotocol
- **Twitter:** https://twitter.com/noemaprotocol

---

## 💬 Community

- [Discord](https://discord.gg/noemaprotocol) - Chat with the team
- [Twitter](https://twitter.com/noemaprotocol) - Latest updates
- [GitHub Discussions](https://github.com/NoemaProtocol/SPL-8004/discussions) - Ask questions
- [Telegram](https://t.me/noemaprotocol) - Community chat

---

<div align="center">

**Built with ❤️ by the Noema Protocol Team**

[NoemaProtocol.xyz](https://noemaprotocol.xyz) • [GitHub](https://github.com/NoemaProtocol) • [Discord](https://discord.gg/noemaprotocol)

</div>
