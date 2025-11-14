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

#### <a href="https://github.com/NoemaProtocol/SPL--8004">SPL-8004</a>
🔐 Identity & Reputation — On-chain agent registry, PDA-based identities, validator consensus.

- Tech: Anchor, Rust
- Program ID: `FX7cpN56T49BT4HaMXsJcLgXRpQ54MHbsYmS3qDNzpGm`

</td>
<td width="50%" valign="top">

#### <a href="https://github.com/NoemaProtocol/x402-protocol">X402 Payment Protocol</a>
💳 Autonomous payments via HTTP 402, facilitator network, USDC settlements.

- Tech: Anchor, TypeScript, Express
- Fee: 0.5% protocol fee

</td>
</tr>
<tr>
<td width="50%" valign="top">

#### <a href="https://github.com/NoemaProtocol/x404-bridge">X404 Bridge</a>
🌉 Cross-chain NFT bridge — ERC-404 ↔ SPL conversions, atomic swap verification.

- Tech: Solidity, Anchor, Chainlink

</td>
<td width="50%" valign="top">

#### <a href="https://github.com/NoemaProtocol/noema-staking">NOEMA Staking</a>
⛏️ Validator staking and rewards — stake NOEMA to validate and earn fees.

- Features: Locking, rewards, cooldowns

</td>
</tr>
</table>

---

## Developer Tools & SDKs

- <a href="https://github.com/NoemaProtocol/agent-dashboard">Agent Dashboard</a> — Web UI to register/manage agents and staking.
- <a href="https://github.com/NoemaProtocol/noema-sdk">Noema SDK</a> — TypeScript client for registration, payments, and queries.
- <a href="https://github.com/NoemaProtocol/api-gateway">API Gateway</a> — REST endpoints for agent lookup, usage, and webhooks.
- <a href="https://github.com/NoemaProtocol/docs">Documentation</a> — Docs site, guides, and API reference.

---

## Quick Links

- Website: https://noemaprotocol.xyz
- Docs: https://noemaprotocol.xyz/documentation
- Examples: https://github.com/NoemaProtocol/SPL--8004/tree/main/examples
- Issues (this repo): https://github.com/NoemaProtocol/SPL--8004/issues

---

## Quick Start (TL;DR)

```bash
git clone https://github.com/NoemaProtocol/SPL--8004.git
cd SPL--8004
npm install
npm run dev
```

Install SDK:

```bash
npm install @noema/sdk
```

Register agent (example):

```ts
import { NoemaClient } from '@noema/sdk';
const client = new NoemaClient({ network: 'devnet', wallet: yourWallet });
await client.registerAgent({ agentId: 'my-agent', metadataUri: 'https://...' });
```

---

## Network Snapshot

| Metric | Value |
|---|---|
| Registered Agents | 150+ |
| Active Validators | 50+ |
| Total NOEMA Staked | 10,000+ |
| X402 Transactions | 5,000+ |

---

## Roadmap (high level)

- Mainnet launch and X404 beta
- SDK v2.0, mobile wallet support
- Reputation NFTs and governance

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