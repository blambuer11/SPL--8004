# X402 Facilitator Integration Guide

## Overview
X402 Facilitator is an autonomous payment protocol for agent-to-agent micro-transactions on Solana, deployed on **Devnet**.

- **Program ID**: `6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia`
- **Config PDA**: `ZBnjVdgJ4L191ngz6aQzTMVbs32QXDdzte1S7RoxWsY`
- **Platform Fee**: 0.5% (50 basis points)
- **Treasury**: `3oxg7wVtdp9T3sx773SMmws8zrGyAJecqTruaXfiw3mN`
- **Authority**: `Fma6gBu46bG4SE2rt2QQxUAC9Sc1aFmtELVtwvuJfCQf`

---

## ✅ Deployment Status

### On-Chain Config (Initialized)
- Authority set ✓
- Treasury configured ✓
- Platform fee: **50 bps** (0.5%) ✓
- Total payments: 0
- Total volume: 0
- Total fees collected: 0

**Transaction**: [4mqkPaefdfjdPxMHWAsn9FoxptP5vJXVWPCbvkVQNaSff7nSavAiQJfoY8RnGL7zgL6HZgnLegAjFvGevQdDiPJi](https://explorer.solana.com/tx/4mqkPaefdfjdPxMHWAsn9FoxptP5vJXVWPCbvkVQNaSff7nSavAiQJfoY8RnGL7zgL6HZgnLegAjFvGevQdDiPJi?cluster=devnet)

---

## 🚀 Quick Start

### Environment Setup
```bash
# Frontend .env
VITE_X402_PROGRAM_ID=6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia
VITE_X402_TREASURY=3oxg7wVtdp9T3sx773SMmws8zrGyAJecqTruaXfiw3mN
VITE_X402_FEE_BPS=50
```

### 1. Read Config
```bash
PROGRAM_ID=6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia \
node scripts/get-config.mjs
```

**Output**:
```
Config PDA          : ZBnjVdgJ4L191ngz6aQzTMVbs32QXDdzte1S7RoxWsY
Authority           : Fma6gBu46bG4SE2rt2QQxUAC9Sc1aFmtELVtwvuJfCQf
Treasury            : 3oxg7wVtdp9T3sx773SMmws8zrGyAJecqTruaXfiw3mN
Platform fee (bps)  : 50
...
```

### 2. Instant Payment (Agent Reward)
```bash
RECIPIENT=<agent_wallet> \
AMOUNT=10.5 \
MEMO="Task completion reward" \
node scripts/instant-payment.mjs
```

**What happens**:
1. Deducts 0.5% platform fee from AMOUNT
2. Transfers **net amount** (99.5%) to recipient's USDC account
3. Transfers **fee** (0.5%) to treasury
4. Records payment on-chain with memo
5. Updates global stats (total volume, fees collected, payment count)

---

## 📦 Payment Flows

### Instant Payment (One-Shot)
**Use case**: Direct agent-to-agent payment, task completion reward.

```typescript
import { instantPayment } from '@/hooks/useX402';

const result = await instantPayment({
  recipient: agentWallet,
  amount: 10_500_000, // 10.5 USDC (6 decimals)
  memo: 'Completion bonus for task #42',
});

console.log('Payment tx:', result.signature);
console.log('Net sent:', result.netAmount / 1e6, 'USDC');
console.log('Fee:', result.fee / 1e6, 'USDC');
```

### Pending Payment (2-Step)
**Use case**: Pre-authorize payment, settle after validation.

**Step 1: Create Pending**
```bash
RECIPIENT=<agent> AMOUNT=25 EXPIRES_IN=3600 \
MEMO="Pending until validation approved" \
node scripts/create-pending-payment.mjs
```

**Step 2: Settle**
```bash
PAYMENT_PDA=<from_step1> \
node scripts/settle-payment.mjs
```

**Or Cancel**:
```bash
PAYMENT_PDA=<from_step1> \
node scripts/cancel-payment.mjs
```

### Channel Payments (Recurring)
**Use case**: Subscription model, recurring agent services.

**Create Channel**:
```bash
RECIPIENT=<agent> MAX_AMOUNT=1000 EXPIRES_IN=2592000 \
node scripts/create-channel.mjs
```

**Pay via Channel**:
```bash
CHANNEL_PDA=<channel_address> AMOUNT=10 MEMO="Monthly fee" \
node scripts/channel-payment.mjs
```

**Close Channel**:
```bash
CHANNEL_PDA=<channel_address> \
node scripts/close-channel.mjs
```

---

## 🏗️ Integration with SPL-8004

### Agent Reward Claim Flow
1. User approves agent validation result
2. Reputation score updated on-chain
3. Reward pool balance calculated
4. **X402 instant_payment** transfers USDC to agent wallet
5. Dashboard reflects updated balance and payment history

### Frontend Hook (Example)
```typescript
// src/hooks/useX402.ts
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

export function useX402() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const claimAgentReward = async (agentPda: string, amount: number) => {
    const programId = new PublicKey(import.meta.env.VITE_X402_PROGRAM_ID);
    const recipient = new PublicKey(agentPda);
    
    // Build instant_payment instruction
    const ix = buildInstantPaymentIx({
      programId,
      sender: publicKey!,
      recipient,
      amount: amount * 1e6, // USDC
      memo: `Reward claim for agent ${agentPda.substring(0, 8)}`,
    });

    const tx = new Transaction().add(ix);
    const sig = await sendTransaction(tx, connection);
    await connection.confirmTransaction(sig);
    return sig;
  };

  return { claimAgentReward };
}
```

### Dashboard Agent Card Update
```tsx
// Enhanced agent card action
<button
  onClick={async () => {
    const sig = await claimAgentReward(agent.id, agent.earnings);
    toast.success(`Claimed ${agent.earnings} USDC! Tx: ${sig.substring(0, 8)}`);
  }}
  className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg"
>
  Claim ${agent.earnings}
</button>
```

---

## 🔧 Scripts Reference

| Script | Purpose | Required Env Vars |
|--------|---------|-------------------|
| `get-config.mjs` | Read on-chain config | `PROGRAM_ID` (optional) |
| `instant-payment.mjs` | Send immediate USDC payment | `RECIPIENT`, `AMOUNT`, `MEMO` (optional) |
| `create-pending-payment.mjs` | Create 2-step payment | `RECIPIENT`, `AMOUNT`, `EXPIRES_IN`, `MEMO` |
| `settle-payment.mjs` | Finalize pending payment | `PAYMENT_PDA` |
| `cancel-payment.mjs` | Cancel pending payment | `PAYMENT_PDA` |
| `create-channel.mjs` | Open recurring payment channel | `RECIPIENT`, `MAX_AMOUNT`, `EXPIRES_IN` |
| `channel-payment.mjs` | Pay via channel | `CHANNEL_PDA`, `AMOUNT`, `MEMO` |
| `close-channel.mjs` | Close channel | `CHANNEL_PDA` |

---

## 📊 On-Chain Data Structures

### GlobalConfig
```rust
pub struct GlobalConfig {
    pub authority: Pubkey,          // 32 bytes
    pub treasury: Pubkey,           // 32 bytes
    pub platform_fee_bps: u16,      // 2 bytes (basis points)
    pub total_payments: u64,        // 8 bytes
    pub total_volume: u64,          // 8 bytes (in USDC lamports)
    pub total_fees_collected: u64,  // 8 bytes
    pub bump: u8,                   // 1 byte
}
```

### PaymentRecord
```rust
pub struct PaymentRecord {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub memo: String,               // Max 200 chars
    pub status: PaymentStatus,      // Pending | Settled | Cancelled
    pub timestamp: i64,
    pub expires_at: i64,
    pub bump: u8,
}
```

### PaymentChannel
```rust
pub struct PaymentChannel {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub max_amount: u64,
    pub total_paid: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub expires_at: i64,
    pub bump: u8,
}
```

---

## 🎯 Next Steps

1. **Generate IDL**: Run `anchor build` to produce TypeScript types for frontend
2. **Frontend Integration**: Add `useX402` hook with Anchor client
3. **Webhook Support**: Listen for payment events via WebSocket subscriptions
4. **Analytics Dashboard**: Track payment volume, fees, agent earnings over time
5. **Mainnet Deployment**: Migrate to mainnet with updated treasury/authority

---

## 🔗 Links
- **Program Repo**: `/Users/bl10buer/Desktop/sp8004/spl-8004-program/x402-facilitator-program`
- **Source Code**: `programs/x402-facilitator/src/lib.rs`
- **Deploy Transaction**: [View on Explorer](https://explorer.solana.com/tx/2ZCD3KDSXhRTwy6jmuZHiQSAd25q855rzZsVNqfNfwcde1XnPEvhQSBMvSVPUYWGD1FDh4teHuM9NRrX2j9fjUQU?cluster=devnet)
- **Config Init Tx**: [View on Explorer](https://explorer.solana.com/tx/4mqkPaefdfjdPxMHWAsn9FoxptP5vJXVWPCbvkVQNaSff7nSavAiQJfoY8RnGL7zgL6HZgnLegAjFvGevQdDiPJi?cluster=devnet)

---

## ⚠️ Security Notes
- All scripts use raw instruction building (no Anchor client dependency for init)
- Config PDA is initialized once; subsequent calls will fail
- Fee max: 1000 bps (10%); current: 50 bps (0.5%)
- Only authority can update config (future: add `update_config` handler)
- Token accounts must exist before payment (ATA or manual creation)

---

**For support**: Open an issue or contact the Noema Protocol team.
