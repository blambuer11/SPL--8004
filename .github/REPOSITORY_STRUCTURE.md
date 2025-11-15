# 📦 Noema Protocol - Repository Structure

## 🎯 Overview

Noema Protocol organizasyonu, her protokolü **bağımsız bir repository** olarak yönetiyor. Bu yapı:

✅ Daha iyi organizasyon  
✅ Bağımsız versiyonlama  
✅ Kolay contributor yönetimi  
✅ Protokol-specific issue tracking  
✅ Temiz dependency management  

---

## 📚 Main Repositories

### 1. [SPL-8004](https://github.com/NoemaProtocol/SPL-8004) - Core Identity Protocol
**On-chain AI agent identity and reputation system**

- **Program ID:** `Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu`
- **Language:** Rust (Anchor Framework)
- **Network:** Solana Devnet/Mainnet
- **Features:**
  - Agent registration & identity
  - Reputation tracking
  - Validation system
  - SOL/NOEMA token staking

**Key Files:**
```
SPL-8004/
├── programs/spl_8004/          # Rust program
├── sdk/                        # TypeScript SDK
├── tests/                      # Integration tests
└── README.md
```

**Quick Start:**
```bash
git clone https://github.com/NoemaProtocol/SPL-8004
cd SPL-8004
anchor build
anchor test
```

---

### 2. [X402-Protocol](https://github.com/NoemaProtocol/X402-Protocol) - Autonomous Payments
**HTTP 402 Payment Required + Instant USDC transfers**

- **Program ID:** `6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia`
- **Language:** Rust (Anchor) + TypeScript
- **Network:** Solana Devnet/Mainnet
- **Features:**
  - Instant USDC payments
  - 402 Payment Required protocol
  - Gasless transactions (Kora)
  - 99.5% to recipient, 0.5% fee
  - Escrow support

**Key Files:**
```
X402-Protocol/
├── programs/x402-facilitator/  # Payment program
├── sdk/                        # Client SDK
├── examples/                   # Usage examples
│   ├── bounty-system/
│   ├── micropayments/
│   └── escrow/
└── README.md
```

**Quick Start:**
```bash
git clone https://github.com/NoemaProtocol/X402-Protocol
cd X402-Protocol
npm install
npm run build
npm test
```

---

### 3. [X404-Bridge](https://github.com/NoemaProtocol/X404-Bridge) - Hybrid NFT Protocol
**ERC-404 style NFT-Token hybrid on Solana**

- **Program ID:** `x404RkwqLN91Mzx3qJhSwypd6WQzEHh7PWh7u5yxtMD`
- **Language:** Rust (Anchor)
- **Network:** Solana Devnet/Mainnet
- **Features:**
  - Hybrid NFT/Token (1000 tokens = 1 NFT)
  - Automatic minting/burning
  - Royalty system
  - Platform fees (2.5%)
  - Cross-chain bridge ready

**Key Files:**
```
X404-Bridge/
├── programs/x404-bridge/       # Bridge program
├── sdk/                        # TypeScript SDK
├── ui/                         # Web interface
└── README.md
```

**Quick Start:**
```bash
git clone https://github.com/NoemaProtocol/X404-Bridge
cd X404-Bridge
anchor build
anchor deploy
```

---

### 4. [Noema-SDK](https://github.com/NoemaProtocol/Noema-SDK) - Unified Development Kit
**All protocols in one convenient package**

- **Package:** `@noema/sdk` + `@spl-8004/sdk`
- **Language:** TypeScript
- **Platform:** Node.js, Browser, React Native
- **Features:**
  - Unified API for all protocols
  - Type-safe TypeScript
  - Auto-pay support
  - Usage analytics
  - Rate limiting

**Key Files:**
```
Noema-SDK/
├── packages/
│   ├── spl-8004-sdk/          # Core identity SDK
│   ├── noema-sdk/             # Managed SDK (API key)
│   └── x402-sdk/              # Payment SDK
├── examples/
└── docs/
```

**Installation:**
```bash
# Open source (no API key)
npm install @spl-8004/sdk

# Managed (with API key)
npm install @noema/sdk
```

---

### 5. [Noema-Staking](https://github.com/NoemaProtocol/Noema-Staking) - Token Economics
**NOEMA token staking and validator rewards**

- **Program ID:** `NoemaStk1111111111111111111111111111111111111`
- **Token Mint:** `NoemaToken11111111111111111111111111111111`
- **Language:** Rust (Anchor)
- **Features:**
  - SOL staking (12.5% APY)
  - NOEMA staking (20% APY)
  - Validator rewards
  - Instant unstake (5% fee)
  - Reputation-based rewards

**Key Files:**
```
Noema-Staking/
├── programs/noema-staking/     # Staking program
├── sdk/                        # Client SDK
└── ui/                         # Dashboard UI
```

---

### 6. [Noema-Dashboard](https://github.com/NoemaProtocol/Noema-Dashboard) - Web Interface
**Official web dashboard and documentation**

- **URL:** https://noemaprotocol.xyz
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Features:**
  - Agent registration
  - Staking interface
  - Payment tracking
  - API key management
  - Analytics dashboard

**Key Files:**
```
Noema-Dashboard/
├── src/
│   ├── pages/              # Dashboard pages
│   ├── components/         # UI components
│   └── hooks/              # React hooks
├── public/
└── README.md
```

**Local Development:**
```bash
git clone https://github.com/NoemaProtocol/Noema-Dashboard
cd Noema-Dashboard
npm install
npm run dev
```

---

## 🔧 Supporting Repositories

### 7. [Noema-Docs](https://github.com/NoemaProtocol/Noema-Docs)
Comprehensive documentation and guides

### 8. [Noema-Examples](https://github.com/NoemaProtocol/Noema-Examples)
Code examples and tutorials

### 9. [Noema-Audits](https://github.com/NoemaProtocol/Noema-Audits)
Security audits and reports

### 10. [Noema-Governance](https://github.com/NoemaProtocol/Noema-Governance)
DAO proposals and voting

---

## 📊 Repository Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    Noema Protocol Ecosystem                  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────▼──────┐ ┌───▼────┐ ┌─────▼─────┐
         │  SPL-8004   │ │  X402  │ │   X404    │
         │  Identity   │ │Payment │ │  Bridge   │
         └──────┬──────┘ └───┬────┘ └─────┬─────┘
                │            │            │
                └────────────┼────────────┘
                             │
                    ┌────────▼────────┐
                    │   Noema-SDK     │
                    │  (Unified API)  │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
         ┌──────▼──────┐ ┌──▼────┐ ┌────▼──────┐
         │   Staking   │ │Dashboard│ │   Docs   │
         └─────────────┘ └─────────┘ └──────────┘
```

---

## 🚀 Quick Clone All

```bash
# Clone all main repositories
git clone https://github.com/NoemaProtocol/SPL-8004
git clone https://github.com/NoemaProtocol/X402-Protocol
git clone https://github.com/NoemaProtocol/X404-Bridge
git clone https://github.com/NoemaProtocol/Noema-SDK
git clone https://github.com/NoemaProtocol/Noema-Staking
git clone https://github.com/NoemaProtocol/Noema-Dashboard

# Or use this script
curl -sSL https://raw.githubusercontent.com/NoemaProtocol/.github/main/scripts/clone-all.sh | bash
```

---

## 📦 Monorepo Alternative

If you prefer working with all protocols in one place, we also maintain a **monorepo** version:

```bash
git clone https://github.com/NoemaProtocol/Noema-Monorepo
```

The monorepo contains all protocols but uses the same codebase as individual repos (via git subtree).

---

## 🔄 Migration Guide

### From Monorepo to Individual Repos

If you were using the old monorepo structure, here's how to migrate:

**Old structure:**
```
sp8004/
├── spl-8004-program/
├── x402-facilitator/
├── x404-bridge/
└── src/
```

**New structure:**
```
NoemaProtocol/
├── SPL-8004/
├── X402-Protocol/
├── X404-Bridge/
└── Noema-SDK/
```

**Migration steps:**

1. **Update Git remotes:**
```bash
# If you have the old repo
cd sp8004
git remote set-url origin https://github.com/NoemaProtocol/SPL-8004

# Or clone fresh
git clone https://github.com/NoemaProtocol/SPL-8004
```

2. **Update dependencies:**
```bash
# Old
npm install ./spl-8004-sdk

# New
npm install @spl-8004/sdk
```

3. **Update imports:**
```typescript
// Old
import { createAgent } from '../spl-8004-sdk';

// New
import { createAgent } from '@spl-8004/sdk';
```

---

## 🏷️ Version Management

Each repository follows **semantic versioning**:

- **SPL-8004:** v1.0.0
- **X402-Protocol:** v1.0.0
- **X404-Bridge:** v0.9.0 (beta)
- **Noema-SDK:** v1.0.0
- **Noema-Staking:** v1.0.0

Releases are coordinated but independent.

---

## 🤝 Contributing

Each repository has its own contribution guidelines:

- [SPL-8004 Contributing](https://github.com/NoemaProtocol/SPL-8004/blob/main/CONTRIBUTING.md)
- [X402 Contributing](https://github.com/NoemaProtocol/X402-Protocol/blob/main/CONTRIBUTING.md)
- [X404 Contributing](https://github.com/NoemaProtocol/X404-Bridge/blob/main/CONTRIBUTING.md)

General guidelines: [Noema Contributing Guide](https://github.com/NoemaProtocol/.github/blob/main/CONTRIBUTING.md)

---

## 📞 Support

- **Discord:** https://discord.gg/noemaprotocol
- **Twitter:** https://twitter.com/noemaprotocol
- **Email:** dev@noemaprotocol.xyz
- **Docs:** https://noemaprotocol.xyz/docs

---

## 📄 License

All repositories are licensed under **MIT License** unless otherwise specified.

---

**Last Updated:** November 15, 2025  
**Organization:** https://github.com/NoemaProtocol
