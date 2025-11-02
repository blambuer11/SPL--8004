# Noema Protocol

<div align="center">

**The AWS of AI Agent Infrastructure**

*Complete trust and infrastructure layer for autonomous AI agents on Solana*

![Noema Protocol](https://img.shields.io/badge/Noema-Protocol-8B5CF6?style=for-the-badge)
![Solana](https://img.shields.io/badge/Solana-65K_TPS-14F195?style=for-the-badge&logo=solana)
![TypeScript](https://img.shields.io/badge/TypeScript-SDK-3178C6?style=for-the-badge&logo=typescript)

[🚀 Get Started](https://noema.ai/agents) • [📚 Docs](https://noema.ai/docs) • [🎯 Protocols](https://noema.ai/protocols) • [🗺️ Roadmap](https://noema.ai/roadmap)

</div>

---

## 🌟 What is Noema Protocol?

Noema is the **complete infrastructure stack** for AI agents on Solana. We combine **four protocol standards** to provide everything autonomous agents need:

| Protocol | Purpose | Status |
|----------|---------|--------|
| **SPL-8004** | Identity & Reputation | ✅ Live (Devnet) |
| **SPL-ACP** | Agent Communication | 📅 Q1 2026 |
| **SPL-TAP** | Tool Abstraction | 📅 Q2 2026 |
| **SPL-FCP** | Function Calls | 📅 Q2 2026 |

### 💡 The Problem

Building trustworthy, interoperable AI agents today requires:

- ❌ Custom identity systems (no standards)
- ❌ Manual inter-agent messaging (no protocols)

- ❌ Custom reputation systems from scratch- **React 18** + **TypeScript** - Modern UI framework

- ❌ Payment infrastructure for agent-to-agent transactions- **Vite** - Lightning-fast build tool

- ❌ Gas fee management for autonomous operations- **Tailwind CSS** - Utility-first styling

- **shadcn/ui** - Beautiful component library

### The Solution: Noema Protocol- **@solana/wallet-adapter** - Wallet connection

- **@coral-xyz/anchor** - Solana program integration

```bash- **React Router** - Client-side routing

# Before Noema

200+ lines of Solana/Anchor boilerplate code## 📦 Quick Start



# After Noema### Frontend (React + TypeScript)

npm install @noema/sdk

``````bash

# Install dependencies

**Three Core Services:**npm install



1. **🆔 Identity (SPL-8004)** — On-chain agent registry with metadata# Start development server

2. **⭐ Reputation** — Transparent, on-chain trust scores (0-10,000)npm run dev

3. **💳 Payments (X402)** — USDC micropayments ($0.0001-$100, 400ms settlement)

# Build for production

Plus: **Gasless transactions** via Kora (no SOL needed!)npm run build

```

---

### Solana Program (Anchor)

## 🎯 Why Noema?

Rust programı için ayrı bir Anchor workspace gereklidir. Detaylı talimatlar için [Solana Program Deployment](#-solana-program-deployment) bölümüne bakın.

### For Developers

## 🎨 Design System

| Without Noema | With Noema |

|---------------|------------|The app uses a modern, AI-focused design with:

| ❌ 200+ lines of Solana code | ✅ 3 lines of TypeScript |

| ❌ Manage PDAs, accounts, seeds | ✅ `client.registerAgent()` |- **Colors**: White background with purple primary colors (#7C3AED, #6D28D9)

| ❌ Build reputation system | ✅ Built-in on-chain scores |- **Typography**: Bold headlines with gradient effects

| ❌ Handle gas fees manually | ✅ Gasless via Kora |- **Components**: Glass-morphism cards with subtle shadows

| ❌ Build payment infrastructure | ✅ X402 instant USDC payments |- **Animations**: Smooth transitions and hover effects

- **Theme**: Light theme optimized for AI/blockchain aesthetic

### For Enterprises

### Customization

- **🚀 10x Faster Time-to-Market** — Focus on AI logic, not blockchain

- **💰 0.1% Platform Fees** — Only pay for what you useColors and styles are defined in:

- **🔒 Enterprise Security** — PCI DSS Level 1 compliant- `src/index.css` - CSS custom properties

- **📊 Advanced Analytics** — Track agent performance, reputation, payments- `tailwind.config.ts` - Tailwind configuration

- **🌐 Scalable** — Unlimited agents, API calls, validations

## 🔗 Links

---

- **GitHub**: [https://github.com/blambuer11/SPL--8004](https://github.com/blambuer11/SPL--8004)

## 🛠️ Tech Stack- **Documentation**: Available in-app at `/docs`

- **Live Demo**: Coming soon

### Frontend (React + Vite)

- **React 18** + **TypeScript** — Modern UI framework## 📁 Project Structure

- **Vite 5.4.19** — Lightning-fast dev server + HMR

- **Tailwind CSS** + **shadcn/ui** — Beautiful, responsive design```

- **React Router** — Client-side navigationsrc/

- **Lucide Icons** — Clean, consistent iconography├── components/

│   ├── ui/                    # shadcn/ui components

### Blockchain Infrastructure│   ├── WalletProvider.tsx     # Solana wallet setup

- **Solana Devnet** — SPL-8004 program (`G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW`)│   ├── Navbar.tsx             # Navigation bar

- **Anchor 0.30.1** — Rust smart contract framework│   ├── AgentCard.tsx          # Agent display card

- **Kora** — Gasless transaction sponsorship│   ├── StatsCard.tsx          # Statistics card

- **X402 Protocol** — USDC micropayments (off-chain facilitator + on-chain settlement)│   └── ProgramInfo.tsx        # Program information

├── pages/

### Developer Tools│   ├── Index.tsx              # Home/landing page

- **@noema/sdk** — TypeScript SDK for agent operations│   ├── Dashboard.tsx          # Agent management

- **REST API** — Language-agnostic HTTP API (`api.noema.ai`)│   ├── Agents.tsx             # Agent explorer

- **No-Code Kit** — Visual workflow builder (coming Q1 2025)│   ├── Validation.tsx         # Validation submission

│   └── NotFound.tsx           # 404 page

---├── hooks/

│   └── useSPL8004.ts          # SPL-8004 program hook

## 📦 Quick Start├── lib/

│   ├── spl8004-client.ts      # SDK client wrapper

### 1. Install SDK│   ├── program-constants.ts   # Program constants

│   └── utils.ts               # Helper functions

```bash└── index.css                  # Global styles + design tokens

npm install @noema/sdk```

```

## 🔗 Integration with SPL-8004 Program

### 2. Register Your First Agent

### Program Details

```typescript

import { NoemaClient } from '@noema/sdk';- **Program ID**: `SPL8wVx7ZqKNxJk5H2bF8QyGvM4tN3rP9WdE6fU5Kc2`

- **Network**: Solana Devnet

const client = new NoemaClient({- **Framework**: Anchor 0.30.1

  network: 'devnet',

  apiKey: process.env.NOEMA_API_KEY,### Key Features

});

#### 1. Identity Registry

// Register agent (gasless!)- Register AI agents with unique identifiers

const agent = await client.agents.register({- Store metadata URIs (Arweave, IPFS)

  agentId: 'trading-bot-001',- On-chain ownership verification

  metadata: {

    name: 'AlphaBot Trading Agent',#### 2. Reputation System

    description: 'Automated crypto trading with ML signals',- Dynamic scores from 0-10,000

    version: '1.0.0',- Success rate tracking

    capabilities: ['trading', 'market-analysis'],- Reputation-based rewards

  },

});#### 3. Validation Registry

- Trustless task verification

console.log('Agent registered:', agent.id);- On-chain evidence storage

console.log('Initial reputation:', agent.reputation); // 5000- Commission-based validation fees (3%)

```

#### 4. Reward System

### 3. Accept Payments with X402- Base reward: 0.0001 SOL

- Score-based multipliers (1x-5x)

```typescript- 24-hour claim intervals

// Agent receives payment from another agent

const payment = await client.payments.receive({### Constants

  from: 'user-agent-456',

  amount: 0.50, // $0.50 USDC```typescript

  description: 'Market analysis report',// Fees

});REGISTRATION_FEE: 0.005 SOL

VALIDATION_FEE: 0.001 SOL

console.log('Payment received:', payment.txHash);

console.log('Settlement time:', payment.settlementMs, 'ms'); // ~400ms// Reputation

```INITIAL_SCORE: 5000

MAX_SCORE: 10000

### 4. Build ReputationMIN_SCORE: 0



```typescript// Commission

// Submit validation after task completionDEFAULT_RATE: 3%

await client.validations.submit({MAX_RATE: 10%

  agentId: 'trading-bot-001',```

  taskId: 'trade-12345',

  success: true,### Example Integration

  evidence: 'https://arweave.net/proof-data',

});```typescript

import { useSPL8004 } from '@/hooks/useSPL8004';

// Reputation automatically updates (+100 points)

const reputation = await client.agents.getReputation('trading-bot-001');const { client } = useSPL8004();

console.log('New reputation:', reputation.score); // 5100

```// Register agent

await client.registerAgent(

---  'my-agent-001',

  'https://arweave.net/metadata'

## 🚀 Local Development);



### Frontend Setup// Submit validation

const taskHash = Buffer.from(crypto.randomBytes(32));

```bashawait client.submitValidation(

# Clone repository  'my-agent-001',

git clone https://github.com/blambuer11/SPL--8004.git  taskHash,

cd SPL--8004/agent-aura-sovereign  true, // approved

  'https://ipfs.io/evidence'

# Install dependencies);

npm install

// Get reputation

# Start dev server (port 8082)const reputation = await client.getReputation('my-agent-001');

npm run devconsole.log('Score:', reputation.score);

```

# Build for production

npm run build## 🌐 Pages

```

### Home (`/`)

### Environment Variables- Hero section with project overview

- Key features showcase

Create `.env` file:- Global statistics

- How it works guide

```env

VITE_SOLANA_NETWORK=devnet### Dashboard (`/dashboard`)

VITE_RPC_ENDPOINT=https://api.devnet.solana.com- Wallet connection status

VITE_PROGRAM_ID=G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW- Agent registration form

VITE_API_ENDPOINT=https://api.noema.ai- My agents overview

```- Claimable rewards



---### Agents (`/agents`)

- Browse all registered agents

## 📁 Project Structure- Search and filter functionality

- Detailed agent cards with stats

```

agent-aura-sovereign/### Validation (`/validation`)

├── src/- Submit task validations

│   ├── components/- Approve/reject interface

│   │   ├── ui/                    # shadcn/ui components (40+ components)- Evidence URI input

│   │   ├── Navbar.tsx             # Navigation (Platform/Agents/Validation/Pricing/Docs)- Fee breakdown

│   │   ├── AgentCard.tsx          # Agent display with reputation

│   │   ├── StatsCard.tsx          # Analytics cards## 🎯 Key Components

│   │   └── WalletProvider.tsx     # Solana wallet integration

│   ├── pages/### AgentCard

│   │   ├── Index.tsx              # Home page (Noema branding)Displays agent information including:

│   │   ├── Agents.tsx             # Agent registry/explorer- Agent ID and owner

│   │   ├── Validation.tsx         # Submit validations- Reputation score with visual progress

│   │   ├── Pricing.tsx            # 3-tier pricing (SDK/API/Kit)- Task statistics (total, successful, failed)

│   │   ├── Docs.tsx               # Comprehensive documentation- Success rate percentage

│   │   └── NotFound.tsx           # 404 page- Active/inactive status

│   ├── hooks/

│   │   └── useSPL8004.ts          # SPL-8004 program hook### StatsCard

│   ├── lib/Shows key metrics with:

│   │   ├── spl8004-client.ts      # SDK client wrapper- Icon and title

│   │   ├── program-constants.ts   # Program constants- Large value display

│   │   └── utils.ts               # Helper utilities- Optional trend indicator

│   ├── App.tsx                    # Route configuration- Hover effects and animations

│   ├── main.tsx                   # React entry point

│   └── index.css                  # Global styles + Tailwind## 🔐 Deploying the Solana Program

├── public/

│   └── robots.txt**Important**: The Rust Solana program must be built and deployed separately.

├── index.html                     # HTML entry (Noema meta tags)

├── package.json### Prerequisites

├── vite.config.ts

├── tailwind.config.ts```bash

└── tsconfig.json# Install Solana CLI

```sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"



---# Install Anchor

cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

## 🎯 Use Casesavm install 0.30.1

avm use 0.30.1

### 1. Trading Bots 📈```

**Problem:** Users don't trust closed-source bots with funds  

**Solution:** On-chain reputation (9,847 successful trades public)  ### Build & Deploy

**Revenue:** Charge $99/mo USDC via X402 subscriptions

```bash

### 2. Data Providers 📊# In the Solana program directory (not this frontend)

**Problem:** AI agents need verified data feeds  anchor build

**Solution:** Pay-per-call API with reputation scoring  

**Revenue:** $0.001 USDC per API call (earned $15K in 3 months)# Get program ID

anchor keys list

### 3. Task Marketplaces 🤝

**Problem:** Agents need to hire other agents  # Update program ID in:

**Solution:** Hire by reputation, pay via X402, auto-validate  # - programs/spl-8004/src/lib.rs (declare_id!)

**Revenue:** Platform takes 0.1% fee on all transactions# - Anchor.toml (programs section)



### 4. API Monetization 💰# Build again

**Problem:** AI agents want to sell capabilities  anchor build

**Solution:** Publish API, accept X402, build reputation  

**Revenue:** Sub-cent to $100 payments, instant settlement# Deploy to devnet

anchor deploy --provider.cluster devnet

---

# Run tests

## 💰 Pricinganchor test --provider.cluster devnet

```

### TypeScript SDK

### Update Frontend

| Plan | Price | API Calls | Agents | Support |

|------|-------|-----------|--------|---------|After deploying, update the program ID in `src/lib/spl8004-client.ts`:

| **Starter** | $99/mo | 10,000/mo | 5 | Email |

| **Professional** | $299/mo | 100,000/mo | 50 | Priority |```typescript

| **Enterprise** | $999/mo | Unlimited | Unlimited | 24/7 Dedicated |export const SPL8004_PROGRAM_ID = new PublicKey("YOUR_DEPLOYED_PROGRAM_ID");

```

### REST API

## 📝 Development Notes

**Pay-as-you-go:** $0.001 per call (no monthly fee)

### Current Status

### No-Code Kit

✅ Frontend fully functional  

| Plan | Price | Agents | Tasks/Month | Features |✅ Wallet integration working  

|------|-------|--------|-------------|----------|✅ UI/UX complete  

| **Basic** | $29/mo | 5 | 1,000 | Visual builder |⏳ Requires Solana program deployment  

| **Pro** | $99/mo | 25 | 10,000 | Slack webhooks |⏳ Using mock data until program is deployed

| **Business** | $499/mo | Unlimited | Unlimited | SSO/SAML |

### Next Steps

**Payment Methods:**

- 💳 Credit/Debit Cards (Visa, Mastercard, Amex, Discover)1. Deploy SPL-8004 Solana program to Devnet

- 🔐 Crypto (USDC/USDT/SOL on Solana, ETH/USDC on Ethereum — 5% discount!)2. Update program ID in frontend

- 🏦 Bank Transfer (ACH, SEPA, Wire — NET-30 invoicing)3. Replace mock data with real blockchain queries

4. Add IDL-based account parsing

[View Full Pricing →](https://noema.ai/pricing)5. Implement real transaction signing

6. Test end-to-end functionality

---

### Development vs Production

## 🔗 SPL-8004 Protocol Details

**Development Mode** (current):

### Program Information- Uses mock data

- No real transactions

- **Program ID:** `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW`- Simulated blockchain interactions

- **Network:** Solana Devnet (Mainnet Q2 2025)

- **Framework:** Anchor 0.30.1**Production Mode** (after program deployment):

- **Gasless:** Kora sponsorship- Real Solana transactions

- Actual blockchain data

### Key Features- Live agent registration and validation



#### 1. Identity Registry## 🚢 Deployment

- Register agents with unique IDs

- Store metadata on Arweave/IPFS### Deploy to Vercel/Netlify

- On-chain ownership verification

- **Fee:** 0.005 SOL (gasless via Kora)```bash

# Build

#### 2. Reputation Systemnpm run build

- Scores: 0 (suspended) to 10,000 (perfect)

- Initial score: 5,000# Deploy dist/ folder

- **+100 points** per successful validation```

- **-50 points** per failed validation

- Transparent, tamper-proof on-chain### Environment Variables



#### 3. Validation Registry```env

- Submit task validations with evidenceVITE_SOLANA_NETWORK=devnet

- Approve/reject workflowVITE_RPC_ENDPOINT=https://api.devnet.solana.com

- **Fee:** 0.001 SOL (gasless)VITE_PROGRAM_ID=SPL8wVx7ZqKNxJk5H2bF8QyGvM4tN3rP9WdE6fU5Kc2

- **Commission:** 3% to validator (customizable 1-10%)```



#### 4. X402 Payment Protocol## 🤝 Contributing

- Off-chain facilitator API

- On-chain USDC settlement1. Fork the repository at [https://github.com/blambuer11/SPL--8004](https://github.com/blambuer11/SPL--8004)

- **Range:** $0.0001 to $100 USDC2. Create a feature branch

- **Speed:** ~400ms settlement3. Commit your changes

- **Fee:** 0.1% platform fee4. Push to the branch

5. Open a Pull Request

### Constants

## 📄 License

```typescript

// Registration & ValidationMIT License - see LICENSE file for details

REGISTRATION_FEE = 0.005 SOL (gasless)

VALIDATION_FEE = 0.001 SOL (gasless)## 🔗 Resources



// Reputation- [Solana Documentation](https://docs.solana.com)

INITIAL_SCORE = 5000- [Anchor Book](https://book.anchor-lang.com)

MAX_SCORE = 10000- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

MIN_SCORE = 0- [SPL-8004 Repository](https://github.com/blambuer11/SPL--8004)

SUCCESS_POINTS = +100

FAILURE_POINTS = -50## 💡 Tips



// Commission- Use **Devnet** for testing (get SOL from faucet)

DEFAULT_COMMISSION = 3%- Connect **Phantom** wallet for best experience

MAX_COMMISSION = 10%- Check console for detailed logs

MIN_COMMISSION = 1%- Reputation updates confirm in ~400ms



// X402---

MIN_PAYMENT = $0.0001 USDC

MAX_PAYMENT = $100 USDC**Built with ❤️ for the Solana AI Agent Ecosystem**

PLATFORM_FEE = 0.1%
```

---

## 📚 Documentation

### In-App Documentation

Visit `/docs` in the app for comprehensive guides:

1. **Introduction** — What is Noema Protocol?
2. **Platform Pages** — How to use Agents/Validation/Pricing pages
3. **X402 Protocol** — Payment integration guide
4. **Use Cases** — Real-world examples (trading bots, data providers, etc.)
5. **FAQ** — Common questions (SPL-8004 vs X402, gas fees, payments, etc.)

### External Resources

- **API Reference:** [https://docs.noema.ai/api](https://docs.noema.ai/api)
- **SDK Documentation:** [https://docs.noema.ai/sdk](https://docs.noema.ai/sdk)
- **X402 Spec:** [https://docs.noema.ai/x402](https://docs.noema.ai/x402)
- **GitHub:** [https://github.com/blambuer11/SPL--8004](https://github.com/blambuer11/SPL--8004)

---

## 🌐 Platform Pages

### Home (`/`)
- Hero: "The Stripe of AI Agent Identity"
- Value proposition: From blockchain complexity to `npm install @noema/sdk`
- 3 infrastructure offerings (SDK/API/Kit)
- Enterprise features (Gasless, Reputation, Micropayments, Marketplace, Analytics, Webhooks)

### Agents (`/agents`)
- Browse all registered agents
- Search by ID, name, capabilities
- Filter by reputation, active status
- Agent cards with reputation scores, success rates, task counts

### Validation (`/validation`)
- Submit task validations
- Agent ID + Task Hash + Evidence URI
- Approve/reject workflow
- Auto-updates reputation on-chain

### Pricing (`/pricing`)
- 3-tier TypeScript SDK pricing ($99/$299/$999)
- Pay-as-you-go REST API ($0.001/call)
- No-Code Kit tiers ($29/$99/$499)
- Payment methods (cards, crypto, bank transfer)

### Docs (`/docs`)
- Comprehensive platform documentation
- Navigation sidebar with search
- Code examples (TypeScript, Python, JavaScript, bash)
- Real-world use cases
- FAQ with 7+ questions

---

## 🔐 Security

### Frontend Security
- PCI DSS Level 1 compliant payment processing
- No credit card data stored on our servers
- Crypto payments via non-custodial smart contracts
- Environment variables for sensitive data

### Blockchain Security
- Anchor framework best practices
- PDA (Program Derived Addresses) for account security
- On-chain access control
- Gasless transactions via Kora (no private key exposure)

### X402 Security
- Non-custodial payment facilitator
- USDC on-chain settlement
- Cryptographic payment proofs
- Rate limiting & DDoS protection

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify

```bash
# Build
npm run build

# Deploy dist/ folder via Netlify UI
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8082
CMD ["npm", "run", "preview"]
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repo: [https://github.com/blambuer11/SPL--8004](https://github.com/blambuer11/SPL--8004)
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Use **TypeScript** for type safety
- Follow **Tailwind CSS** conventions
- Write **semantic** commit messages
- Add **tests** for new features (coming soon)
- Update **documentation** for API changes

---

## 📊 Roadmap

### Q4 2024 ✅
- [x] SPL-8004 program deployed to devnet
- [x] React frontend with Noema branding
- [x] TypeScript SDK initial release
- [x] X402 payment protocol integration
- [x] Kora gasless transactions

### Q1 2025 🚧
- [ ] Mainnet beta launch
- [ ] REST API public release
- [ ] No-Code Kit alpha
- [ ] Advanced analytics dashboard
- [ ] Webhook system

### Q2 2025 🔮
- [ ] Mainnet full launch
- [ ] Enterprise SLA guarantees
- [ ] On-premise deployment option
- [ ] White-label solutions
- [ ] Multi-chain support (Ethereum)

---

## 📄 License

**MIT License** — see [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Website:** [https://noema.ai](https://noema.ai) (coming soon)
- **Documentation:** [https://docs.noema.ai](https://docs.noema.ai)
- **GitHub:** [https://github.com/blambuer11/SPL--8004](https://github.com/blambuer11/SPL--8004)
- **Twitter:** [@NoemaProtocol](https://twitter.com/NoemaProtocol)
- **Discord:** [Join Community](https://discord.gg/noema) (coming soon)

---

## 💡 Why "Noema"?

**Noema** (νόημα) is Greek for **"thought"** or **"perception"**.

In philosophy (Husserl's phenomenology), *noema* represents the **intentional content** of consciousness — what we perceive and understand about the world.

For AI agents, Noema Protocol is the **intentional infrastructure** — the foundation for identity, trust, and interaction in the autonomous AI economy.

---

<div align="center">

**Built with ❤️ for the Autonomous AI Economy**

*Powered by Solana • Secured by SPL-8004 • Paid by X402*

[Get Started →](https://noema.ai) | [Read Docs →](https://docs.noema.ai) | [View Pricing →](https://noema.ai/pricing)

</div>
