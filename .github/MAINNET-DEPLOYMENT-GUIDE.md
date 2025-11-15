# Mainnet Deployment Guide for SPL-8004

## Current Status

✅ **Devnet:** Program deployed and working  
❌ **Mainnet:** Program NOT deployed yet  
✅ **SDK:** Ready for all networks (devnet, testnet, mainnet-beta)

**Program ID:** `Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu`

---

## Prerequisites for Mainnet

### 1. Security Audit
- [ ] Smart contract audit completed
- [ ] Audit report published
- [ ] Critical vulnerabilities fixed
- [ ] Recommended: Multiple auditors

**Cost:** $10,000 - $50,000  
**Time:** 2-4 weeks

**Recommended Auditors:**
- [Ackee Blockchain](https://ackee.xyz/)
- [Neodyme](https://neodyme.io/)
- [OtterSec](https://osec.io/)
- [Kudelski Security](https://kudelskisecurity.com/)

---

### 2. Program Deployment to Mainnet

#### Step 1: Build Program for Production

```bash
cd /Users/bl10buer/Desktop/sp8004/spl_8004

# Clean build
anchor clean

# Build with mainnet configuration
anchor build --verifiable

# Get program size
ls -lh target/deploy/spl_8004.so
```

#### Step 2: Calculate Deployment Cost

```bash
# Check program size (in bytes)
solana program show --programs --url mainnet-beta | grep -i size

# Example: 200KB program ≈ 1.4 SOL deployment cost
# Current SOL price: ~$150 = ~$210 deployment cost
```

#### Step 3: Fund Deployer Wallet

```bash
# Check balance
solana balance --url mainnet-beta

# You need:
# - Program deployment cost (1-3 SOL)
# - Program upgrade authority deposit (2-5 SOL)
# - Buffer account rent (0.5-1 SOL)
# Total: ~5-10 SOL recommended
```

#### Step 4: Deploy to Mainnet

```bash
# Deploy program
anchor deploy --provider.cluster mainnet-beta

# Verify deployment
solana program show Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu --url mainnet-beta
```

#### Step 5: Set Program Authority

```bash
# Transfer upgrade authority to multisig (RECOMMENDED)
solana program set-upgrade-authority \
  Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu \
  --new-upgrade-authority <MULTISIG_ADDRESS> \
  --url mainnet-beta

# Or make program immutable (PERMANENT - use with caution)
solana program set-upgrade-authority \
  Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu \
  --final \
  --url mainnet-beta
```

---

### 3. Treasury & Fee Collection Setup

#### Create Mainnet Treasury

```bash
# Generate treasury keypair
solana-keygen new --outfile mainnet-treasury.json

# Get address
solana address -k mainnet-treasury.json

# Fund with minimum rent-exempt amount
solana transfer <TREASURY_ADDRESS> 0.01 --url mainnet-beta
```

#### Update Program Configuration

Edit `spl_8004/programs/spl_8004/src/lib.rs`:

```rust
pub const TREASURY_ADDRESS: &str = "YOUR_MAINNET_TREASURY_ADDRESS";
pub const PROTOCOL_FEE_BPS: u16 = 50; // 0.5%
```

---

### 4. USDC Integration

SDK already configured with mainnet USDC:

```typescript
// Mainnet USDC (Circle's official USDC)
USDC_MINTS['mainnet-beta']: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
```

**Verify USDC mint:**
```bash
spl-token display EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --url mainnet-beta
```

---

### 5. Testing on Mainnet-Beta

#### Smoke Test with Small Amounts

```typescript
import { SPL8004SDK } from 'spl-8004-sdk';
import { Keypair } from '@solana/web3.js';

// Use MAINNET with caution
const wallet = Keypair.fromSecretKey(/* your funded wallet */);
const sdk = SPL8004SDK.create(wallet, 'mainnet-beta');

// Test with minimal amounts (0.01 USDC)
const payment = await sdk.createPayment({
  recipient: testRecipient,
  amount: 0.01, // $0.01 USDC
  memo: 'Mainnet smoke test'
});

console.log('✅ Mainnet test successful:', payment.signature);
```

---

## Cost Breakdown

### One-Time Costs

| Item | Amount | Notes |
|------|--------|-------|
| **Security Audit** | $10k - $50k | Required before mainnet |
| **Program Deployment** | 2-5 SOL | ~$300-750 |
| **Program Authority Rent** | 2-5 SOL | ~$300-750 |
| **Treasury Setup** | 0.01 SOL | Minimal |
| **Testing Budget** | 1 SOL | ~$150 |
| **Total** | **$10,950 - $51,650** | |

### Recurring Costs

| Item | Frequency | Amount |
|------|-----------|--------|
| RPC Node | Monthly | $0-500 (free tier available) |
| Monitoring | Monthly | $0-100 |
| Gas/Fees | Per transaction | ~$0.00025/tx |

---

## Deployment Timeline

```
Week 1-2:   Security audit preparation
Week 3-6:   Audit process
Week 7:     Fix vulnerabilities
Week 8:     Final audit approval
Week 9:     Mainnet deployment
Week 10:    Monitoring & testing
```

**Total:** ~10 weeks from start to production

---

## Recommended Pre-Mainnet Steps

### 1. Extensive Devnet Testing

```bash
# Run integration tests
cd /Users/bl10buer/Desktop/sp8004/spl_8004
anchor test

# Load testing (simulate 1000 transactions)
node scripts/load-test-devnet.js
```

### 2. Testnet Deployment (Optional but Recommended)

```bash
# Deploy to testnet first
anchor deploy --provider.cluster testnet

# Test SDK on testnet
const sdk = SPL8004SDK.create(wallet, 'testnet');
```

### 3. Bug Bounty Program

Launch before mainnet:
- Platform: [Immunefi](https://immunefi.com/)
- Budget: $10,000 - $100,000
- Duration: Ongoing

### 4. Documentation

- [x] SDK documentation (DONE ✅)
- [ ] Smart contract documentation
- [ ] API reference
- [ ] Integration guides
- [ ] Security best practices

### 5. Monitoring Setup

```typescript
// Sentry for error tracking
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'mainnet'
});
```

---

## Post-Deployment Monitoring

### Essential Metrics

1. **Transaction Success Rate**
   - Target: >99.5%
   - Alert if <95%

2. **Average Transaction Cost**
   - Monitor gas fees
   - Alert on unusual spikes

3. **Treasury Balance**
   - Monitor fee collection
   - Alert if depleted

4. **Agent Registrations**
   - Track growth
   - Detect spam/attacks

### Monitoring Tools

- **Solana Explorer:** https://explorer.solana.com/
- **Solscan:** https://solscan.io/
- **Helius:** https://www.helius.dev/ (RPC + monitoring)
- **GenesysGo:** https://www.genesysgo.com/

---

## Emergency Procedures

### Program Upgrade

If deployed with upgrade authority:

```bash
# Build new version
anchor build

# Deploy upgrade
anchor upgrade target/deploy/spl_8004.so \
  --program-id Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu \
  --provider.cluster mainnet-beta
```

### Circuit Breaker

Implement pause functionality in smart contract:

```rust
#[account]
pub struct GlobalState {
    pub is_paused: bool,
    pub admin: Pubkey,
}

// In instructions
require!(!global_state.is_paused, ErrorCode::ProtocolPaused);
```

### Incident Response

1. **Detect** - Monitoring alerts
2. **Pause** - Activate circuit breaker if available
3. **Assess** - Determine severity and impact
4. **Communicate** - Update users via Twitter/Discord
5. **Fix** - Deploy patch if upgrade authority exists
6. **Resume** - Gradually restore service

---

## SDK Usage After Mainnet Deployment

Users can switch networks with single parameter:

```typescript
// Development
const devSDK = SPL8004SDK.create(wallet, 'devnet');

// Production
const mainSDK = SPL8004SDK.create(wallet, 'mainnet-beta');
```

**No code changes needed!** SDK handles:
- ✅ Program ID selection
- ✅ USDC mint address
- ✅ RPC endpoint
- ✅ Network-specific constants

---

## Checklist Before Going Live

### Smart Contract
- [ ] Security audit completed and passed
- [ ] All tests passing (unit + integration)
- [ ] Program deployed to mainnet
- [ ] Upgrade authority set (multisig recommended)
- [ ] Treasury configured
- [ ] Circuit breaker implemented

### SDK
- [x] Published to NPM ✅
- [x] Documentation complete ✅
- [x] Multi-network support ✅
- [ ] Example projects published

### Infrastructure
- [ ] RPC provider selected (Helius, QuickNode, GenesysGo)
- [ ] Monitoring setup (Sentry, DataDog)
- [ ] Backup RPC endpoints configured
- [ ] Alert thresholds configured

### Legal & Compliance
- [ ] Terms of service drafted
- [ ] Privacy policy published
- [ ] USDC licensing reviewed
- [ ] Jurisdiction compliance checked

### Community
- [ ] Discord server setup
- [ ] Twitter account active
- [ ] Documentation website live
- [ ] Support channels established

### Launch
- [ ] Soft launch with limited users
- [ ] Monitor for 48 hours
- [ ] Bug bounty active
- [ ] Public announcement prepared

---

## Current Recommendation

**DO NOT deploy to mainnet yet if:**
- ❌ No security audit
- ❌ Limited testing
- ❌ No monitoring infrastructure
- ❌ No emergency procedures

**Instead:**
1. Continue devnet development ✅
2. Extensive testing (1-2 months)
3. Security audit (1 month)
4. Testnet deployment (2 weeks)
5. Then mainnet

**Estimated timeline:** 3-4 months to production-ready mainnet

---

## Resources

- **Anchor Deployment:** https://www.anchor-lang.com/docs/deployment
- **Solana Program Deploy:** https://docs.solana.com/cli/deploy-a-program
- **Security Best Practices:** https://github.com/coral-xyz/sealevel-attacks
- **Audit Checklist:** https://github.com/0xsomnus/solana-auditing-list

---

**Status:** SDK ready for all networks ✅  
**Mainnet:** Requires deployment + audit ⏳
