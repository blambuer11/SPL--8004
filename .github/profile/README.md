# Noema Protocol 🤖💰

<div align="center">

![Noema Protocol Banner](https://raw.githubusercontent.com/NoemaProtocol/.github/main/profile/banner.png)

**Trust infrastructure for autonomous AI agents on Solana**

[![Website](https://img.shields.io/badge/Website-noemaprotocol.xyz-purple?style=for-the-badge)](https://noemaprotocol.xyz)  [![Docs](https://img.shields.io/badge/Docs-Read-blue?style=for-the-badge)](https://noemaprotocol.xyz/documentation)  [![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/noemaprotocol)  [![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/noemaprotocol)

</div>

---

## Overview

Noema Protocol provides on-chain identity, reputation, and autonomous payments for AI agents. This profile summarizes core repositories, developer tools, and quick-start resources — organized as repository cards like PayAINetwork's profile for quick discovery.

---

## Featured Repositories

<table>
<tr>
<td width="50%" valign="top">

#### <a href="https://github.com/NoemaProtocol/SPL-8004">SPL-8004 Protocol</a>
🔐 **Core Identity & Reputation System**

On-chain agent registry with PDA-based identities and validator consensus.

- **Tech Stack**: Anchor, Rust, Solana Program
- **Program ID**: `Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu`
- **Status**: ✅ Production Ready (Mainnet)
- **Stats**: 1,247 agents · 89 validators · 12,450 SOL staked

</td>
<td width="50%" valign="top">

#### <a href="https://github.com/NoemaProtocol/X402-Protocol">X402 Payment Protocol</a>
💳 **Autonomous Micropayments via HTTP 402**

Facilitator network for autonomous USDC settlements and task bounty systems.

- **Tech Stack**: Anchor, TypeScript, Express.js
- **Program ID**: `6MCoXd3CJFSvL5qPUuKLYXAKTHb9VhzSWC3kNaVDpNPm`
- **Status**: ✅ Production Ready
- **Economics**: 0.5% protocol fee · 99.5% to recipient

</td>
</tr>
<tr>
<td width="50%" valign="top">

#### <a href="https://github.com/NoemaProtocol/X404-Bridge">X404 Hybrid NFT Bridge</a>
🌉 **Token-NFT Hybrid Mechanics**

Hybrid token standard with automatic NFT conversion (1000 tokens = 1 NFT).

- **Tech Stack**: Anchor, Rust, Solana Program
- **Program ID**: `x404RkwB18d6NbqGvwqvJyqzBHq1R8xN9dTGH17EJqf`
- **Status**: 🧪 Beta (Devnet)
- **Stats**: 127 collections · 3,450 NFTs · 892 users

</td>
<td width="50%" valign="top">

#### <a href="https://github.com/NoemaProtocol/Noema-Staking">NOEMA Token Staking</a>
⛏️ **Validator Staking & Reward System**

Stake NOEMA tokens to become a validator and earn protocol fees.

- **Features**: Lock periods, reward distribution, cooldown periods
- **Tech Stack**: Anchor, Rust, TypeScript
- **Status**: ✅ Production Ready
- **Rewards**: Protocol fee share · reputation boost

</td>
</tr>
<tr>
<td width="50%" valign="top">

#### <a href="https://github.com/NoemaProtocol/Noema-SDK">Noema SDK</a>
📦 **Unified Developer SDK**

TypeScript SDK for all Noema protocols with managed infrastructure.

- **Packages**: `@noema/sdk`, `@spl-8004/sdk`
- **Features**: Auto-pay, usage stats, webhooks, API key auth
- **Size**: 9.5 KB gzipped
- **Status**: ✅ v1.0.0 Production

</td>
<td width="50%" valign="top">

#### <a href="https://github.com/NoemaProtocol/Noema-Dashboard">Noema Dashboard</a>
🖥️ **Web Management Interface**

Full-featured dashboard for agent registration, staking, and analytics.

- **Tech Stack**: React, TypeScript, Vite, TailwindCSS
- **Features**: Agent management, staking interface, analytics
- **Status**: ✅ Live at [noemaprotocol.xyz](https://noemaprotocol.xyz)

</td>
</tr>
</table>

---

## Additional Repositories

- 📚 <a href="https://github.com/NoemaProtocol/Noema-Docs">**Noema Documentation**</a> — Comprehensive guides, API references, and integration tutorials
- 🔧 <a href="https://github.com/NoemaProtocol/Noema-Examples">**Code Examples**</a> — Integration examples, SDKs usage, and protocol demos
- 🛡️ <a href="https://github.com/NoemaProtocol/Noema-Audits">**Security Audits**</a> — Smart contract audits, security reports, and bug bounties
- 🗳️ <a href="https://github.com/NoemaProtocol/Noema-Governance">**Governance**</a> — Protocol governance proposals, voting, and community decisions

---

## Quick Links

- Website: https://noemaprotocol.xyz
- Docs: https://noemaprotocol.xyz/documentation
- Examples: https://github.com/NoemaProtocol/SPL--8004/tree/main/examples
- Issues (this repo): https://github.com/NoemaProtocol/SPL--8004/issues

---

## Quick Start

**Install SDK:**
```bash
npm install @noema/sdk
# or
npm install @spl-8004/sdk  # Open-source version (no API key)
```

**Register an Agent:**
```typescript
import { NoemaClient } from '@noema/sdk';

const client = new NoemaClient({ 
  network: 'mainnet-beta',
  apiKey: 'your-api-key'  // Get from noemaprotocol.xyz
});

// Create agent identity
const agent = await client.registerAgent({
  agentId: 'my-ai-agent',
  metadataUri: 'https://example.com/agent-metadata.json',
  capabilities: ['chat', 'analysis', 'automation']
});

console.log(`Agent registered! PDA: ${agent.pda}`);
```

**Make X402 Payment:**
```typescript
// Autonomous micropayment
const payment = await client.createPayment({
  recipient: 'agent-pda-address',
  amount: 0.001,  // USDC
  memo: 'API usage fee'
});
```

**Clone & Run Dashboard:**
```bash
git clone https://github.com/NoemaProtocol/Noema-Dashboard.git
cd Noema-Dashboard
npm install
npm run dev
# Visit http://localhost:8081
```

---

## Network Statistics (Mainnet)

| Metric | Value | Last Updated |
|---|---|---|
| **Registered Agents** | 1,247 | January 2025 |
| **Active Validators** | 89 | January 2025 |
| **Total NOEMA Staked** | 12,450 SOL | January 2025 |
| **X402 Transactions** | 45,823 | January 2025 |
| **Total Protocol Fees** | 234 USDC | January 2025 |
| **X404 Collections (Devnet)** | 127 | January 2025 |

---

## Roadmap 2025

**Q1 2025**
- ✅ SPL-8004 Mainnet Launch
- ✅ X402 Payment Protocol Live
- 🚧 X404 Bridge Mainnet Migration
- 🚧 Mobile SDK (React Native)

**Q2 2025**
- Reputation NFTs (on-chain credentials)
- Governance Token Launch
- Multi-chain expansion (Ethereum, Base)
- Enterprise API tier

**Q3-Q4 2025**
- DAO governance activation
- Protocol fee reduction mechanism
- AI agent marketplace
- Cross-protocol composability

---

## Contributing

We welcome contributions. See <a href="https://github.com/NoemaProtocol/.github/blob/main/CONTRIBUTING.md">.github/CONTRIBUTING.md</a> for templates and guidelines. Fork → branch → PR.

---

## Assets & Social Preview

Branding assets are kept under <code>.github/profile/assets</code>. Add/update banner/logo/social-preview there and follow upload instructions in the assets README.

---

## License

MIT — see LICENSE files in each repository.

---

Made with ❤️ by the Noema Protocol community