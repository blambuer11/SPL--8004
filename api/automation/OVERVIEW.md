# Autonomous Agent Payment Automation

Scripts for autonomous inter-agent payment systems.

## 📋 Contents

### 1. `auto-pay.mjs` - Periodic Payments
Script for automatic USDC transfers between agents.

**Features:**
- Configurable interval (seconds)
- Safety limit (MAX_TX)
- SPL Token transfer
- Explorer links

**Usage:**
```bash
# Set environment variables
export PAYER_KEYPAIR_PATH="./my-solana-keypair.json"
export RECIPIENT_PUBKEY="8x7k..."
export AMOUNT_USDC="0.01"
export INTERVAL_SEC="30"
export MAX_TX="10"

# Run script
npm run auto-pay
```

### 2. `delivery-handshake.mjs` - Identity Verification + Payment
Challenge-response protocol for drone-robot delivery scenario.

**Scenario:**
1. Cargo drone arrives at home
2. Home robot opens door
3. Two robots identify each other (SPL-8004 identity system)
4. Payment verified instantly
5. Transaction completed

**Features:**
- ✅ **On-chain identity resolution** (SPL-8004 PDA lookup)
- ✅ **Real-time payment monitoring** (blockchain transaction parsing)
- Ed25519 signature verification (tweetnacl)
- Memo-based handshake data
- Challenge-response protocol

**Architecture:**
```
┌─────────────┐                    ┌─────────────┐
│   DRONE     │                    │    HOME     │
│  (Payer)    │                    │  (Receiver) │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  1. agentId + ephemeral key      │
       │─────────────────────────────────>│
       │                                  │
       │  2. challenge (nonce+timestamp)  │
       │<─────────────────────────────────│
       │                                  │
       │  3. USDC payment + signed memo   │
       │─────────────────────────────────>│
       │     HANDSHAKE|agentId|ts|nonce   │
       │                                  │
       │  4. Verify signature + amount    │
       │                 ✅               │
       │                                  │
       │  5. Door unlock                  │
       │                 🚪               │
```

**Mode 1: Drone (Payer)**
```bash
export MODE="drone"
export AGENT_ID="agent-home-001"
export PAYER_KEYPAIR_PATH="./drone-wallet.json"
export DELIVERY_FEE_USDC="0.05"

npm run delivery-handshake:drone
```

**Mode 2: Home Robot (Receiver)**
```bash
export MODE="home"
export AGENT_ID="agent-drone-001"
export PAYER_KEYPAIR_PATH="./home-wallet.json"
export DELIVERY_FEE_USDC="0.05"

npm run delivery-handshake:home
```

### 3. `spl8004-resolver.mjs` - Identity Resolver
AgentId→owner resolution from SPL-8004 program.

**Functions:**
- `findIdentityPda(agentId)` - PDA calculation
- `parseIdentityAccount(data)` - Account data deserialization
- `resolveAgentId(agentId, connection)` - On-chain lookup
- `resolveAgentIdsBatch(agentIds, connection)` - Batch query

**Example:**
```javascript
import { Connection } from '@solana/web3.js';
import { resolveAgentId } from './spl8004-resolver.mjs';

const connection = new Connection('https://api.devnet.solana.com');
const owner = await resolveAgentId('agent-drone-001', connection);
console.log('Owner:', owner.toBase58());
```

## 🔧 Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp api/automation/.env.automation.example api/automation/.env.automation
# Edit .env.automation file
```

3. Prepare wallet keypair:
```bash
solana-keygen new --outfile ./my-solana-keypair.json
# Get Devnet SOL and USDC
```

## 🧪 Testing

### On-chain Identity Lookup Test
```bash
node -e "
import('./api/automation/spl8004-resolver.mjs').then(async m => {
  const { Connection } = await import('@solana/web3.js');
  const conn = new Connection('https://api.devnet.solana.com');
  const owner = await m.resolveAgentId('test-agent', conn);
  console.log('Resolved:', owner.toBase58());
});
"
```

### Payment Watch Test
```bash
# Terminal 1: Home robot waiting
MODE=home AGENT_ID=agent-drone-001 npm run delivery-handshake:home

# Terminal 2: Drone sending payment
MODE=drone AGENT_ID=agent-home-001 npm run delivery-handshake:drone
```

## 📊 Monitoring

Scripts output detailed console logs:
- ✅ Successful operations
- ⚠️ Warnings (fallback usage)
- ❌ Errors
- 🔗 Explorer links

## 🔒 Security

**Current:**
- Ed25519 signature verification
- Timestamp freshness check
- On-chain identity verification
- Amount validation

**TODO:**
- [ ] Nonce replay protection
- [ ] On-chain receipt PDA
- [ ] Rate limiting
- [ ] Multi-sig support

## 🚀 Production Deployment

1. Change RPC endpoint (Helius/QuickNode)
2. Use WebSocket (instead of polling)
3. Add Redis (for nonce tracking)
4. Run as service with PM2
5. Add monitoring (Datadog/Grafana)

## 📚 References

- [SPL-8004 Standard](../../SPL-8004_STANDARD.md)
- [X402 Facilitator](../../spl-8004-program/x402-facilitator/)
- [Solana Token Program](https://spl.solana.com/token)
