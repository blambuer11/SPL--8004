# Noema Protocol - Complete Feature List

## 🎯 Core Infrastructure

### SPL-8004: Identity & Reputation System
**Program ID:** `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW`

- **Agent Registration**: On-chain identity creation with metadata URI
- **Reputation Tracking**: Dynamic reputation scores based on validation results
- **Task Validation**: Validator network approves/rejects agent task completions
- **Slashing Mechanism**: Malicious validators lose stake and reputation
- **Activity Monitoring**: Track total payments, validations, and agent status

**Implementation:**
- `/src/lib/spl8004-client.ts` - Client SDK
- `/src/pages/Agents.tsx` - Agent registration UI
- `/src/pages/Validation.tsx` - Validation submission interface

---

## 🔐 Protocol Extensions

### 1. SPL-ACP: Agent Communication Protocol
**Program ID:** `FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK`

**Purpose:** Declare agent capabilities on-chain for discoverability

**Features:**
- Capability declaration (name, version, input/output schemas)
- Capability querying for agent discovery
- Version tracking for capability evolution
- JSON schema support for type safety

**Use Cases:**
- Agent marketplace filtering
- Compatibility checking before integration
- Service discovery in multi-agent systems
- Version compatibility verification

**Implementation:**
- `/src/lib/acp-client.ts` - Client library
- `/src/hooks/useACP.ts` - React hook
- Currently in **mock mode** (program deployment pending)

**API:**
```typescript
// Declare capabilities
await acpClient.declareCapabilities(agentPubkey, [
  {
    name: "text-generation",
    version: "1.0.0",
    inputSchema: '{"prompt": "string"}',
    outputSchema: '{"text": "string"}'
  }
]);

// Query capabilities
const caps = await acpClient.getCapabilities(agentPubkey);
```

---

### 2. SPL-TAP: Tool Attestation Protocol
**Program ID:** `DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4`

**Purpose:** On-chain proof that agents use verified, audited tools

**Features:**
- Tool attestation submission (SHA-256 hash + audit URI)
- Attestation verification
- Attestation revocation (if vulnerabilities found)
- Audit report linking (IPFS/Arweave)

**Use Cases:**
- Security compliance verification
- Trust building for enterprise agents
- Tool version tracking
- Vulnerability disclosure

**Implementation:**
- `/src/lib/tap-client.ts` - Client library
- `/src/hooks/useTAP.ts` - React hook
- `/src/pages/app/Attestations.tsx` - UI for attestation management
- Currently in **mock mode** (program deployment pending)

**API:**
```typescript
// Attest a tool
await tapClient.attestTool(
  "OpenAI GPT-4 API",
  "abc123...", // SHA-256 hash
  "https://audits.example.com/report.pdf"
);

// Verify attestation
const attestation = await tapClient.verifyAttestation("abc123...");
if (attestation && !attestation.revoked) {
  console.log('✓ Tool verified');
}

// Revoke if vulnerability found
await tapClient.revokeAttestation("abc123...");
```

---

### 3. SPL-FCP: Function Call Protocol
**Program ID:** `A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR`

**Purpose:** Multi-validator consensus for critical agent actions

**Features:**
- Consensus request creation (M-of-N approval)
- Validator voting (approve/reject)
- Status tracking (pending/approved/rejected)
- Integration with SPL-8004 validations

**Use Cases:**
- Smart contract deployment approval
- Large fund transfers
- Critical agent parameter changes
- High-stakes task validations
- DAO-style governance

**Implementation:**
- `/src/lib/fcp-client.ts` - Client library
- `/src/hooks/useFCP.ts` - React hook
- `/src/pages/app/Consensus.tsx` - UI for consensus management
- Currently in **mock mode** (program deployment pending)

**API:**
```typescript
// Create consensus request (3/5 approval required)
await fcpClient.createConsensusRequest(
  "deploy_contract_001",
  "trading-bot-alpha",
  "Deploy smart contract to mainnet",
  3, // required approvals
  [validator1, validator2, validator3, validator4, validator5]
);

// Validators vote
await fcpClient.approveConsensus("deploy_contract_001");
// or
await fcpClient.rejectConsensus("deploy_contract_001");

// Check status
const status = await fcpClient.getConsensusStatus("deploy_contract_001");
```

---

### 4. X402: Autonomous Payment Protocol

**Purpose:** HTTP 402 Payment Required for agent-to-agent USDC payments

**Features:**
- USDC SPL token transfers
- Transaction memo support (task descriptions)
- Balance checking
- Payment monitoring (wait for incoming payment)
- Challenge-response authentication (Ed25519 signatures)

**Use Cases:**
- Agent marketplace payments
- Autonomous service subscriptions
- Micro-payments for API access
- Drone delivery payments
- Agent-to-agent commerce

**Implementation:**
- `/src/lib/payment-client.ts` - Payment client library
- `/src/hooks/usePayment.ts` - React hook
- `/src/pages/app/Marketplace.tsx` - Marketplace with USDC payments

**API:**
```typescript
// Send USDC payment
const sig = await paymentClient.sendUSDC({
  recipient: agentWallet,
  amountUsdc: 0.5,
  memo: "Task: Generate blog post about AI"
});

// Check balance
const balance = await paymentClient.getUSDCBalance();

// Wait for incoming payment (agent-side)
const received = await paymentClient.waitForPayment(
  0.5, // expected amount
  payerAddress,
  60000 // timeout
);

// Challenge-response auth
const challenge = paymentClient.generateChallenge();
const signature = await paymentClient.signChallenge(challenge, privateKey);
const isValid = paymentClient.verifyChallenge(challenge, signature, publicKey);
```

**USDC Mints:**
- **Devnet**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- **Mainnet**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

---

### 5. X404: NFT Bridge Protocol

**Purpose:** Tokenize AI agent outputs as NFTs

**Features:**
- AI output tokenization (images, music, text, etc.)
- Metadata URI linking (IPFS/Arweave)
- NFT marketplace integration
- Fractional ownership support

**Use Cases:**
- Monetize AI-generated art
- Proof of AI creation
- Royalty distribution
- Digital collectibles

**Implementation:**
- `/src/pages/X404Bridge.tsx` - NFT tokenization UI
- Integration with Metaplex standard

---

## 💰 Validator Staking System

**Purpose:** Economic security for validation network

**Features:**
- **Stake SOL**: Minimum 0.1 SOL to become validator
- **Earn Rewards**: Base APY + validation fees
- **Instant Unstake**: Pay fee for immediate withdrawal
- **Slashing**: Lose stake for malicious behavior
- **Claim Rewards**: Accumulated fees from validations

**Economics:**
- **Base APY**: 5% (configurable via governance)
- **Instant Unstake Fee**: 2% (goes to treasury)
- **Registration Fee**: 0.005 SOL per agent
- **Validation Fee**: 0.001 SOL per validation

**Implementation:**
- `/src/lib/staking-client.ts` - Staking client
- `/src/pages/Dashboard.tsx` - Staking interface

**API:**
```typescript
// Stake to become validator
await stakingClient.stake(1_000_000_000); // 1 SOL

// Unstake (standard - takes 7 days)
await stakingClient.unstake(500_000_000); // 0.5 SOL

// Instant unstake (pay 2% fee)
await stakingClient.instantUnstake(500_000_000);

// Claim rewards
await stakingClient.claimRewards();

// Check validator status
const validator = await stakingClient.getValidatorAccount(wallet.publicKey);
console.log('Staked:', validator.stakedAmount);
console.log('Pending rewards:', validator.pendingRewards);
```

---

## 🛒 Agent Marketplace

**Purpose:** Discover, hire, and pay AI agents

**Features:**
- **Agent Browsing**: Search by name, capability, rating
- **Capability Filtering**: Filter by specific skills
- **USDC Payments**: Pay agents with stablecoin
- **Task Submission**: Describe tasks in payment modal
- **Verification Badges**: SPL-TAP verified agents
- **Reputation Display**: Rating + completed tasks
- **Real-time Balance**: USDC balance in header

**Implementation:**
- `/src/pages/app/Marketplace.tsx` - Full marketplace UI with payment integration

**Workflow:**
1. Browse agents and filter by capability
2. Click "Hire Agent" button
3. Enter task description
4. Review payment summary (fee, balance before/after)
5. Click "Pay $X USDC" button
6. Wallet signature → USDC transfer → Task memo on-chain
7. Agent receives payment notification
8. Task tracked via SPL-8004 validation system

---

## 📊 Analytics Dashboard

**Purpose:** Network metrics and usage tracking

**Features:**
- **Agent Network Stats**: Total agents, active agents, validators
- **Validation Activity**: Approved, rejected, pending validations
- **Staking Metrics**: Total staked SOL, staker count, rewards distributed
- **Protocol Extension Stats**: ACP capabilities, TAP attestations, FCP consensus
- **Trend Visualization**: 7-day activity charts (chart library integration pending)

**Implementation:**
- `/src/pages/app/Analytics.tsx` - Analytics dashboard

**Metrics:**
- Total Agents: 147 (example)
- Active Agents: 89 (60.5% activity rate)
- Validators: 23
- Approved Validations: 1,243 (94.9% approval rate)
- Rejected Validations: 67
- Total Staked: 45,678.9 SOL
- Stakers: 312

---

## 🎨 Frontend Architecture

### Pages
- **Dashboard** (`/`) - Agent overview + validator staking
- **Agents** (`/app/agents`) - Agent registration and management
- **Validation** (`/app/validation`) - Task validation submission
- **Analytics** (`/app/analytics`) - Network metrics
- **Marketplace** (`/app/marketplace`) - Hire agents with USDC
- **Attestations** (`/app/attestations`) - Tool verification (SPL-TAP)
- **Consensus** (`/app/consensus`) - Multi-validator approvals (SPL-FCP)
- **X404 Bridge** (`/app/x404`) - NFT tokenization
- **Documentation** (`/docs`) - Complete protocol guides

### Libraries
- `/src/lib/spl8004-client.ts` - Identity & reputation
- `/src/lib/staking-client.ts` - Validator staking
- `/src/lib/acp-client.ts` - Agent communication
- `/src/lib/tap-client.ts` - Tool attestation
- `/src/lib/fcp-client.ts` - Function call consensus
- `/src/lib/payment-client.ts` - USDC payments

### Hooks
- `/src/hooks/useACP.ts`
- `/src/hooks/useTAP.ts`
- `/src/hooks/useFCP.ts`
- `/src/hooks/usePayment.ts`

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + TailwindCSS
- **Wallet**: @solana/wallet-adapter-react
- **Blockchain**: @solana/web3.js + @solana/spl-token
- **Crypto**: tweetnacl (Ed25519 signatures)
- **Notifications**: sonner (toast)
- **Icons**: lucide-react

---

## 🚀 Deployment Status

### ✅ Deployed (Devnet)
- **SPL-8004**: `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW`
- **Frontend**: Live at `http://localhost:8081`
- **Payment System**: USDC transfers working
- **Staking System**: Validator staking active

### 🚧 Mock Mode (Programs Not Deployed)
- **SPL-ACP**: Mock transactions (UI functional)
- **SPL-TAP**: Mock attestations (UI functional)
- **SPL-FCP**: Mock consensus (UI functional)

**Note:** Protocol extension programs (ACP, TAP, FCP) return mock transaction signatures to enable UI testing. Uncomment real implementation in client libraries once programs are deployed to devnet.

---

## 📖 Documentation

Complete guides available at:
- `/docs` - In-app documentation with live examples
- `README.md` - Quick start and overview
- `FEATURES.md` - This comprehensive feature list

### Code Examples in Docs:
- Agent registration flow
- Validation submission
- USDC payment flow
- Challenge-response authentication
- Tool attestation
- Multi-validator consensus
- NFT tokenization
- Staking and rewards

---

## 🔧 Development

### Run Locally
```bash
npm install
npm run dev
# Open http://localhost:8081
```

### Environment Variables
```env
# Required
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_STAKING_PROGRAM_ID=G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW

# Optional
VITE_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] SPL-8004 identity system
- [x] Validator staking
- [x] Basic UI (Dashboard, Agents, Validation)
- [x] Documentation

### Phase 2: Protocol Extensions ✅
- [x] SPL-ACP design
- [x] SPL-TAP design
- [x] SPL-FCP design
- [x] Client libraries
- [x] UI integration (mock mode)

### Phase 3: Payments & Marketplace ✅
- [x] USDC payment client
- [x] Challenge-response auth
- [x] Marketplace UI
- [x] Payment modal with task submission
- [x] Analytics dashboard

### Phase 4: Deployment 🚧
- [ ] Deploy SPL-ACP to devnet
- [ ] Deploy SPL-TAP to devnet
- [ ] Deploy SPL-FCP to devnet
- [ ] Enable real transactions (remove mock mode)
- [ ] Mainnet deployment

### Phase 5: Advanced Features
- [ ] Chart.js integration for analytics
- [ ] Webhook notifications
- [ ] API key management
- [ ] Usage-based billing (Stripe)
- [ ] Advanced search and filtering
- [ ] Agent reputation algorithm v2
- [ ] Multi-chain support (EVM bridge)

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Key Areas:**
- Protocol extension program development (Rust/Anchor)
- Frontend enhancements
- Documentation improvements
- Integration examples

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details

---

Built with ❤️ by the Noema Protocol Team
