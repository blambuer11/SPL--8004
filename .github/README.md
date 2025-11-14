# Noema Protocol 🤖💰

<div align="center">

![Noema Protocol Banner](https://raw.githubusercontent.com/NoemaProtocol/.github/main/profile/banner.png)

**The Trust Infrastructure for Autonomous AI Agents on Solana**

[![Website](https://img.shields.io/badge/Website-noemaprotocol.xyz-purple?style=for-the-badge)](https://noemaprotocol.xyz)  [![Docs](https://img.shields.io/badge/Docs-Read-blue?style=for-the-badge)](https://noemaprotocol.xyz/documentation)  [![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/noemaprotocol)  [![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/noemaprotocol)

</div>

---

## What is Noema Protocol?

Noema Protocol provides on-chain identity, reputation and autonomous payments for AI agents on Solana. Think of it as the infrastructure layer that makes agent identity, reputation, and pay-per-use interactions simple and verifiable.

---

## Core Categories

### Protocols & Smart Contracts

- SPL-8004 (Identity & Reputation) — On-chain agent registry and reputation system.  
- X402 (Payments) — HTTP 402 payment protocol for instant micropayments.  
- X404 (Bridge) — Cross-chain NFT bridge for agent NFTs.  
- NOEMA Staking — Validator staking and rewards.

### Developer Tools & SDKs

- Agent Dashboard — Web UI to manage agents, staking, and reputation.  
- Noema SDK — TypeScript SDK for agent registration, payments, and queries.  
- API Gateway — REST endpoints for agent lookup, usage and webhooks.  
- Documentation — Central docs site and repo for guides and API reference.

### Examples & Integrations

- Multi-Protocol Router — Automatic payment routing across X402/ACP/TAP/FCP.  
- Payment QR Generator — Solana Pay / Phantom-compatible QR flows.  
- X404 NFT Conversion — Convert agents to dynamic NFTs.

---

## Quick Start

Clone, install, and run the SDK and demo in a few minutes.

```bash
git clone https://github.com/NoemaProtocol/SPL--8004.git
cd SPL--8004
npm install
npm run dev
```

SDK install:

```bash
npm install @noema/sdk
```

Register an agent (example):

```ts
import { NoemaClient } from '@noema/sdk';
const client = new NoemaClient({ network: 'devnet', wallet: yourWallet });
await client.registerAgent({ agentId: 'my-agent', metadataUri: 'https://...' });
```

---

## Documentation & Links

- Website: https://noemaprotocol.xyz
- Docs: https://noemaprotocol.xyz/documentation
- Repository (this): https://github.com/NoemaProtocol/SPL--8004
- Issues: https://github.com/NoemaProtocol/SPL--8004/issues
- Discord: https://discord.gg/noemaprotocol
- Twitter: https://twitter.com/noemaprotocol

---

## Contributing

Contributions welcome — see CONTRIBUTING.md in the .github folder for contribution guidelines, issue templates and PR workflow. Fork the repo, create a branch, and open a pull request.

---

## License

MIT — see LICENSE in each repository for details.

---

Made with ❤️ by the Noema Protocol community
