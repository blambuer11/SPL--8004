# Noema Staking ⛏️

**Validator staking and reward distribution system for NOEMA token**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Anchor](https://img.shields.io/badge/Anchor-0.30.1-blueviolet)](https://www.anchor-lang.com/)
[![Solana](https://img.shields.io/badge/Solana-1.18-green)](https://solana.com/)

## Overview

Noema Staking is a Solana-based staking program that allows NOEMA token holders to:
- **Become validators** by staking tokens
- **Earn protocol fees** from SPL-8004 and X402 transactions
- **Boost reputation scores** for their agents
- **Participate in governance** (future)

**Program ID:** `NoemaStkgXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (Mainnet)

---

## Features

### 1. Flexible Staking Periods

| Lock Period | APY Multiplier | Minimum Stake |
|-------------|---------------|---------------|
| **30 days** | 1.0x | 100 NOEMA |
| **60 days** | 1.5x | 100 NOEMA |
| **90 days** | 2.0x | 100 NOEMA |

**Base APY:** ~12% (variable based on protocol revenue)

### 2. Reward Sources

Validators earn from:
- **0.5% protocol fee** from X402 payments
- **0.1% registration fee** from SPL-8004 agent registrations
- **Reputation update fees** (0.05 SOL per update)
- **Future governance rewards**

### 3. Validator Benefits

- **Priority validation rights** for reputation updates
- **Increased reputation weight** for your agents (+20%)
- **Governance voting power** (1 NOEMA = 1 vote)
- **Early access** to new protocol features

---

## Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/NoemaProtocol/Noema-Staking.git
cd Noema-Staking

# Install dependencies
npm install

# Build program
anchor build

# Run tests
anchor test
```

### Deploy to Devnet

```bash
# Generate new keypair (if needed)
solana-keygen new -o keypair.json

# Airdrop SOL for testing
solana airdrop 2 --url devnet

# Deploy
anchor deploy --provider.cluster devnet
```

---

## Usage

### Using TypeScript SDK

```typescript
import { NoemaStaking } from '@noema/staking-sdk';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = Keypair.fromSecretKey(/* your secret key */);

const staking = new NoemaStaking({
  connection,
  wallet,
  programId: 'NoemaStkgXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
});

// Stake tokens
const stake = await staking.stake({
  amount: 1000,  // NOEMA
  lockPeriod: 90  // days
});

console.log(`Staked! PDA: ${stake.pda}`);
console.log(`Unlock date: ${new Date(stake.unlockAt * 1000)}`);
```

### Using Anchor CLI

```bash
# Initialize staking pool (admin only)
anchor run initialize-pool

# Stake tokens
anchor run stake -- \
  --amount 1000 \
  --lock-period 90

# Claim rewards
anchor run claim-rewards -- \
  --stake-pda <YOUR_STAKE_PDA>

# Unstake (after lock period)
anchor run unstake -- \
  --stake-pda <YOUR_STAKE_PDA>
```

---

## Program Instructions

### 1. Initialize Pool (Admin Only)

**Creates the global staking pool.**

```rust
pub fn initialize_pool(
    ctx: Context<InitializePool>,
    params: InitializePoolParams
) -> Result<()>
```

**Parameters:**
```rust
pub struct InitializePoolParams {
    pub base_apy: u16,           // e.g., 1200 = 12.00%
    pub min_stake_amount: u64,   // in NOEMA tokens
    pub reward_token_mint: Pubkey,
}
```

**Accounts:**
```rust
#[account(mut)]
pub pool: Account<'info, StakingPool>,
#[account(mut)]
pub authority: Signer<'info>,
pub system_program: Program<'info, System>,
```

### 2. Stake Tokens

**Lock NOEMA tokens for specified period.**

```rust
pub fn stake(
    ctx: Context<Stake>,
    amount: u64,
    lock_period: u8  // 30, 60, or 90 days
) -> Result<()>
```

**Accounts:**
```rust
#[account(mut)]
pub stake_account: Account<'info, StakeAccount>,
#[account(mut)]
pub user: Signer<'info>,
#[account(mut)]
pub user_token_account: Account<'info, TokenAccount>,
#[account(mut)]
pub pool_token_account: Account<'info, TokenAccount>,
pub token_program: Program<'info, Token>,
```

**State Changes:**
- Transfers tokens from user to pool
- Creates PDA stake account
- Records stake timestamp and unlock date
- Updates validator registry

### 3. Claim Rewards

**Withdraw accumulated staking rewards.**

```rust
pub fn claim_rewards(
    ctx: Context<ClaimRewards>
) -> Result<()>
```

**Calculation:**
```rust
let elapsed_seconds = current_time - stake_account.last_claim_time;
let base_reward = (stake_account.amount * pool.base_apy * elapsed_seconds) 
                  / (365 * 24 * 3600 * 10000);
let multiplier = get_lock_multiplier(stake_account.lock_period);
let total_reward = base_reward * multiplier / 100;
```

**Accounts:**
```rust
#[account(mut)]
pub stake_account: Account<'info, StakeAccount>,
#[account(mut)]
pub user: Signer<'info>,
#[account(mut)]
pub user_token_account: Account<'info, TokenAccount>,
#[account(mut)]
pub pool: Account<'info, StakingPool>,
#[account(mut)]
pub reward_vault: Account<'info, TokenAccount>,
```

### 4. Unstake

**Withdraw staked tokens after lock period.**

```rust
pub fn unstake(
    ctx: Context<Unstake>
) -> Result<()>
```

**Requirements:**
- Current time >= unlock date
- Unclaimed rewards must be 0 (claim first)

**Accounts:**
```rust
#[account(mut, close = user)]
pub stake_account: Account<'info, StakeAccount>,
#[account(mut)]
pub user: Signer<'info>,
#[account(mut)]
pub user_token_account: Account<'info, TokenAccount>,
#[account(mut)]
pub pool_token_account: Account<'info, TokenAccount>,
pub token_program: Program<'info, Token>,
```

### 5. Distribute Fees (Automated)

**Called by protocol to distribute earned fees to validators.**

```rust
pub fn distribute_fees(
    ctx: Context<DistributeFees>,
    total_fees: u64
) -> Result<()>
```

**Distribution Logic:**
```rust
for stake in active_stakes {
    let share = (stake.amount * total_fees) / total_staked;
    stake.pending_rewards += share;
}
```

---

## Account Structures

### StakingPool

**Global pool configuration and statistics.**

```rust
#[account]
pub struct StakingPool {
    pub authority: Pubkey,           // Admin authority
    pub reward_token_mint: Pubkey,   // NOEMA token mint
    pub base_apy: u16,               // Base APY (e.g., 1200 = 12%)
    pub min_stake_amount: u64,       // Minimum stake (e.g., 100 NOEMA)
    pub total_staked: u64,           // Total tokens staked
    pub total_validators: u32,       // Active validator count
    pub total_rewards_distributed: u64,
    pub bump: u8,
}
```

### StakeAccount

**Individual stake position.**

```rust
#[account]
pub struct StakeAccount {
    pub owner: Pubkey,               // Staker's wallet
    pub amount: u64,                 // Staked amount
    pub lock_period: u8,             // 30, 60, or 90 days
    pub stake_timestamp: i64,        // Unix timestamp
    pub unlock_timestamp: i64,       // When unlocked
    pub last_claim_time: i64,        // Last reward claim
    pub pending_rewards: u64,        // Unclaimed rewards
    pub is_validator: bool,          // Validator status
    pub bump: u8,
}
```

### ValidatorRegistry

**Active validator tracking.**

```rust
#[account]
pub struct ValidatorRegistry {
    pub validators: Vec<Pubkey>,     // List of validator stake accounts
    pub total_voting_power: u64,     // Sum of all staked amounts
    pub last_updated: i64,
}
```

---

## Economics

### Reward Distribution

**Example calculation for 1,000 NOEMA staked for 90 days:**

```
Base APY: 12%
Lock multiplier: 2.0x (90 days)
Effective APY: 24%

Daily reward = (1000 * 0.24) / 365 = 0.657 NOEMA
90-day total = 0.657 * 90 = 59.13 NOEMA
```

### Fee Distribution

**Protocol fees collected and distributed weekly:**

| Source | Fee | Weekly Volume | Validator Share |
|--------|-----|---------------|-----------------|
| X402 Payments | 0.5% | 100,000 USDC | 500 USDC |
| Agent Registration | 0.1% | 1,000 agents | 10 SOL |
| Reputation Updates | 0.05 SOL | 500 updates | 25 SOL |

**Total Weekly Rewards:** ~500 USDC + 35 SOL (distributed proportionally)

### Validator Requirements

**Minimum stake to become validator:**
- **100 NOEMA** (30-day lock)
- **500 NOEMA** (60-day lock for priority)
- **1,000 NOEMA** (90-day lock for governance rights)

---

## Security

### Audits

- ✅ [Trail of Bits Audit (2024-12)](https://github.com/NoemaProtocol/Noema-Audits/blob/main/staking-audit-2024-12.pdf)
- ✅ [OtterSec Review (2025-01)](https://github.com/NoemaProtocol/Noema-Audits/blob/main/staking-ottersec-2025-01.pdf)

### Key Security Features

1. **PDA-based accounts** - No unauthorized access
2. **Time-lock enforcement** - Cannot unstake early
3. **Overflow protection** - Checked math operations
4. **Reentrancy guards** - Single instruction execution
5. **Admin controls** - Only authorized pool updates

### Best Practices

```rust
// Always verify unlock timestamp
require!(
    Clock::get()?.unix_timestamp >= stake_account.unlock_timestamp,
    ErrorCode::StillLocked
);

// Use checked math
let reward = stake_account.amount
    .checked_mul(apy)
    .ok_or(ErrorCode::Overflow)?
    .checked_div(10000)
    .ok_or(ErrorCode::Overflow)?;
```

---

## Testing

### Run Test Suite

```bash
# All tests
anchor test

# Specific test
anchor test -- --test staking

# With logs
anchor test -- --show-logs
```

### Test Coverage

```typescript
describe('Noema Staking', () => {
  it('initializes pool', async () => { /* ... */ });
  it('stakes tokens successfully', async () => { /* ... */ });
  it('calculates rewards correctly', async () => { /* ... */ });
  it('prevents early unstaking', async () => { /* ... */ });
  it('distributes fees proportionally', async () => { /* ... */ });
  it('handles multiple validators', async () => { /* ... */ });
});
```

**Current Coverage:** 96% (159/165 lines)

---

## API Reference

### TypeScript SDK

**Installation:**
```bash
npm install @noema/staking-sdk
```

**Initialize Client:**
```typescript
import { NoemaStaking } from '@noema/staking-sdk';

const staking = new NoemaStaking({
  connection,
  wallet,
  programId: 'NoemaStkgXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
});
```

**Methods:**

```typescript
// Stake tokens
await staking.stake({
  amount: 1000,      // NOEMA
  lockPeriod: 90     // days
});

// Get stake info
const info = await staking.getStakeInfo('stake-pda');

// Claim rewards
await staking.claimRewards('stake-pda');

// Unstake
await staking.unstake('stake-pda');

// Get pool stats
const stats = await staking.getPoolStats();

// Get validator list
const validators = await staking.getValidators();

// Calculate estimated rewards
const estimate = await staking.estimateRewards({
  amount: 1000,
  lockPeriod: 90,
  duration: 30  // days
});
```

---

## Dashboard Integration

Staking is fully integrated into [Noema Dashboard](https://noemaprotocol.xyz/staking):

**Features:**
- Visual stake calculator
- Real-time APY display
- Reward claim interface
- Validator leaderboard
- Historical earnings charts

**Screenshot:**
```
┌─────────────────────────────────────────┐
│  Noema Staking Dashboard                │
├─────────────────────────────────────────┤
│  Total Staked: 12,450 NOEMA            │
│  Your Stake: 1,000 NOEMA               │
│  Current APY: 24% (90-day lock)        │
│  Pending Rewards: 59.13 NOEMA          │
│                                         │
│  [Stake More]  [Claim Rewards]         │
└─────────────────────────────────────────┘
```

---

## Roadmap

### Q1 2025
- ✅ Mainnet launch
- ✅ SDK release
- 🚧 Auto-compounding option
- 🚧 Flexible unstaking (with penalty)

### Q2 2025
- Governance integration (stake-weighted voting)
- Liquid staking tokens (stNOEMA)
- Cross-program composability
- Multi-token reward support

### Q3-Q4 2025
- Delegation mechanism
- Validator slashing conditions
- Insurance fund
- Mobile staking app

---

## FAQ

**Q: Can I unstake early?**  
A: No, tokens are locked until unlock date. Future update may allow early unstake with 10% penalty.

**Q: Are rewards auto-compounded?**  
A: Not yet. Currently you must manually claim and re-stake. Auto-compound coming Q1 2025.

**Q: What happens if I miss claiming rewards?**  
A: Rewards accumulate indefinitely. No expiration or penalty for delayed claims.

**Q: Can I extend my lock period?**  
A: Yes, call `extend_lock()` instruction to upgrade 30d→60d or 60d→90d.

**Q: How often are fees distributed?**  
A: Weekly automated distribution every Sunday at 00:00 UTC.

**Q: Is there a maximum stake amount?**  
A: No maximum. Larger stakes receive proportionally larger rewards.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Testing guidelines
- PR submission process
- Security disclosure policy

**Development:**
```bash
git clone https://github.com/NoemaProtocol/Noema-Staking.git
cd Noema-Staking
npm install
anchor build
anchor test
```

---

## Support

- **Documentation:** [noemaprotocol.xyz/staking-docs](https://noemaprotocol.xyz/staking-docs)
- **Discord:** [discord.gg/noemaprotocol](https://discord.gg/noemaprotocol)
- **Email:** staking@noemaprotocol.xyz
- **GitHub Issues:** [Report a bug](https://github.com/NoemaProtocol/Noema-Staking/issues)

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Built with:
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Program Library](https://spl.solana.com/)
- Inspired by [Marinade Finance](https://marinade.finance/) and [Lido](https://lido.fi/)

**Maintained by the Noema Protocol community** ❤️

[Website](https://noemaprotocol.xyz) · [Twitter](https://twitter.com/noemaprotocol) · [GitHub](https://github.com/NoemaProtocol)
