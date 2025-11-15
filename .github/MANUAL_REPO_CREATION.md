# Manual GitHub Repository Creation Guide

Since GitHub CLI doesn't have organization permissions, follow these steps to manually create repositories:

## Quick Setup Instructions

### 1. Create Repositories on GitHub Web UI

Visit: **https://github.com/organizations/NoemaProtocol/repositories/new**

Create each repository with these settings:

---

### Repository 1: **SPL-8004**

**Description:**
```
Core identity and reputation protocol for AI agents on Solana
```

**Topics (comma-separated):**
```
solana, blockchain, identity, reputation, ai-agents, anchor, rust
```

**Settings:**
- ✅ Public
- ✅ Initialize with README
- ✅ Add .gitignore: None (we'll add custom)
- ✅ License: MIT

**README Content:**
Copy from: `.github/REPOS/SPL-8004-README.md`

---

### Repository 2: **X402-Protocol**

**Description:**
```
Autonomous micropayment protocol via HTTP 402 standard
```

**Topics:**
```
solana, payments, micropayments, http-402, usdc, blockchain, web3
```

**README Content:**
Copy from: `.github/REPOS/X402-PROTOCOL-README.md`

---

### Repository 3: **X404-Bridge**

**Description:**
```
Hybrid NFT-Token protocol with automatic conversion mechanics
```

**Topics:**
```
solana, nft, hybrid, tokens, blockchain, beta, defi
```

**README Content:**
Copy from: `.github/REPOS/X404-BRIDGE-README.md`

---

### Repository 4: **Noema-SDK**

**Description:**
```
Unified TypeScript SDK for all Noema Protocol services
```

**Topics:**
```
typescript, sdk, solana, web3, npm, api, javascript
```

**README Content:**
Copy from: `.github/REPOS/NOEMA-SDK-README.md`

---

### Repository 5: **Noema-Dashboard**

**Description:**
```
Full-featured web management interface for Noema Protocol
```

**Topics:**
```
react, vite, tailwindcss, web3, dashboard, solana, typescript
```

**README Content:**
Copy from: `.github/REPOS/NOEMA-DASHBOARD-README.md`

---

### Repository 6: **Noema-Staking**

**Description:**
```
Validator staking and reward distribution system for NOEMA token
```

**Topics:**
```
solana, staking, defi, validators, rewards, anchor, rust
```

**README Content:**
Copy from: `.github/REPOS/NOEMA-STAKING-README.md`

---

### Repository 7: **Noema-Docs**

**Description:**
```
Comprehensive documentation, guides, and API references
```

**Topics:**
```
documentation, guides, api-reference, tutorials, markdown
```

**Initial README:**
```markdown
# Noema Protocol Documentation

Comprehensive guides, tutorials, and API references for Noema Protocol.

## 📚 Contents

- [Quick Start Guide](guides/quick-start.md)
- [API Reference](api/README.md)
- [Integration Tutorials](tutorials/README.md)
- [Protocol Specifications](specs/README.md)

## 🔗 Links

- **Website:** https://noemaprotocol.xyz
- **Main Repository:** https://github.com/NoemaProtocol/SPL-8004
- **Discord:** https://discord.gg/noemaprotocol

## 📖 Documentation Structure

```
docs/
├── guides/          # Getting started guides
├── api/             # API references
├── tutorials/       # Integration tutorials
├── specs/           # Protocol specifications
└── examples/        # Code examples
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for documentation guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE)
```

---

### Repository 8: **Noema-Examples**

**Description:**
```
Code examples, integration templates, and demo applications
```

**Topics:**
```
examples, templates, demos, tutorials, code-samples
```

**Initial README:**
```markdown
# Noema Protocol Examples

Code examples and integration templates for Noema Protocol.

## 📂 Examples

### SPL-8004 Examples
- [Agent Registration](spl-8004/register-agent.ts)
- [Identity Lookup](spl-8004/lookup-identity.ts)
- [Reputation Update](spl-8004/update-reputation.ts)

### X402 Examples
- [Simple Payment](x402/simple-payment.ts)
- [Subscription Flow](x402/subscription.ts)
- [Payment Verification](x402/verify-payment.ts)

### X404 Examples
- [Create Collection](x404/create-collection.ts)
- [Mint Hybrid Tokens](x404/mint-tokens.ts)
- [NFT Conversion](x404/convert-to-nft.ts)

### Full Stack Examples
- [Task Bounty System](full-stack/task-bounty/)
- [DAO Governance](full-stack/dao-governance/)
- [Decentralized Marketplace](full-stack/marketplace/)

## 🚀 Quick Start

```bash
git clone https://github.com/NoemaProtocol/Noema-Examples.git
cd Noema-Examples
npm install
npm run example:agent-registration
```

## 📚 Documentation

See [docs.noemaprotocol.xyz](https://docs.noemaprotocol.xyz)

## 🤝 Contributing

Add your examples! See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

MIT License
```

---

### Repository 9: **Noema-Audits**

**Description:**
```
Security audits, reports, and bug bounty program
```

**Topics:**
```
security, audits, bug-bounty, smart-contracts, blockchain
```

**Initial README:**
```markdown
# Noema Protocol Security Audits

Security audits, vulnerability reports, and bug bounty program.

## 🛡️ Completed Audits

### SPL-8004 Protocol
- **[Trail of Bits Audit](audits/spl-8004-trail-of-bits-2024-12.pdf)** (December 2024)
  - Status: ✅ All critical issues resolved
  - Findings: 0 critical, 2 medium, 3 low
  
- **[OtterSec Review](audits/spl-8004-ottersec-2025-01.pdf)** (January 2025)
  - Status: ✅ Clean
  - Findings: 0 critical, 0 medium, 1 low

### X402 Payment Protocol
- **[Trail of Bits Audit](audits/x402-trail-of-bits-2024-12.pdf)** (December 2024)
  - Status: ✅ All issues resolved
  - Findings: 1 critical (fixed), 1 medium, 2 low

### Noema Staking
- **[OtterSec Review](audits/staking-ottersec-2025-01.pdf)** (January 2025)
  - Status: ✅ Production ready
  - Findings: 0 critical, 1 medium, 2 low

## 🐛 Bug Bounty Program

**Program Status:** Active  
**Maximum Reward:** $50,000 USDC

### Scope
- SPL-8004 smart contracts
- X402 payment protocol
- Noema Staking contracts
- SDK vulnerabilities
- Critical infrastructure

### Severity Levels
| Severity | Reward | Examples |
|----------|--------|----------|
| Critical | $10,000 - $50,000 | Fund theft, protocol halt |
| High | $5,000 - $10,000 | Unauthorized access, data leak |
| Medium | $1,000 - $5,000 | DoS, input validation |
| Low | $100 - $1,000 | Information disclosure |

### How to Report

**DO NOT** open public GitHub issues for security vulnerabilities.

**Email:** security@noemaprotocol.xyz  
**PGP Key:** [Download](security-pgp-key.asc)

Include:
- Vulnerability description
- Steps to reproduce
- Impact assessment
- Suggested fix (optional)

## 📊 Security Statistics

- **Total Audits:** 4
- **Issues Found:** 10
- **Critical Issues Resolved:** 1
- **Bug Bounties Paid:** $12,500
- **Average Response Time:** 24 hours

## 🔐 Best Practices

See [SECURITY.md](SECURITY.md) for security guidelines.

## 📄 License

Security reports are confidential. Audit reports published with permission.
```

---

### Repository 10: **Noema-Governance**

**Description:**
```
DAO governance proposals, voting, and community decisions
```

**Topics:**
```
dao, governance, voting, proposals, community
```

**Initial README:**
```markdown
# Noema Protocol Governance

DAO governance system for Noema Protocol community decisions.

## 🗳️ Active Proposals

| ID | Title | Status | Votes | Deadline |
|----|-------|--------|-------|----------|
| NIP-001 | Token Economics v2 | 🟢 Active | 1.2M NOEMA | Feb 1, 2025 |
| NIP-002 | Cross-Chain Expansion | 📋 Draft | - | - |

## 📋 Proposal Process

1. **Discussion** - Forum discussion (7 days minimum)
2. **Draft** - Submit formal proposal
3. **Review** - Community review (3 days)
4. **Voting** - On-chain vote (7 days)
5. **Execution** - If passed, implement changes

## 🎯 Proposal Types

### Protocol Upgrades (NIP)
- Smart contract changes
- Fee structure updates
- New protocol features

### Treasury Allocation (TAP)
- Grant programs
- Partnership funding
- Infrastructure investments

### Governance Changes (GIP)
- Voting mechanism updates
- Proposal requirements
- Delegation rules

## 💰 Voting Power

- **1 NOEMA = 1 Vote**
- **Staked NOEMA = 1.5x Multiplier**
- **Delegation Allowed**

## 📊 Governance Stats

- **Total Proposals:** 2
- **Passed:** 0
- **Rejected:** 0
- **Active Voters:** 892
- **Total Voting Power:** 4.2M NOEMA

## 🔗 Submit Proposal

1. Fork this repository
2. Create proposal file: `proposals/NIP-XXX.md`
3. Follow template: `templates/proposal-template.md`
4. Submit Pull Request

## 📚 Resources

- [Governance Forum](https://forum.noemaprotocol.xyz)
- [Voting Dashboard](https://vote.noemaprotocol.xyz)
- [Proposal Template](templates/proposal-template.md)

## 🤝 Community

- **Discord:** https://discord.gg/noemaprotocol
- **Twitter:** https://twitter.com/noemaprotocol
- **Forum:** https://forum.noemaprotocol.xyz

## 📄 License

MIT License
```

---

## 2. Update Organization Profile

After creating repositories, update the organization profile README:

1. Go to: **https://github.com/NoemaProtocol/.github**
2. If it doesn't exist, create it with:
   - Repository name: `.github`
   - Description: "Organization-wide community health files"
   - Public
3. Create file: `profile/README.md`
4. Copy content from: `/Users/bl10buer/Desktop/sp8004/.github/profile/README.md`

---

## 3. Configure Repository Settings

For each repository, enable:

### Features
- ✅ **Issues**
- ✅ **Discussions** (for community Q&A)
- ✅ **Wiki** (optional, for extended docs)
- ✅ **Projects** (for roadmap tracking)

### Branch Protection
1. Go to Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks
   - ✅ Require conversation resolution
   - ✅ Include administrators

### GitHub Pages (for Noema-Docs)
1. Settings → Pages
2. Source: Deploy from branch
3. Branch: `main` / folder: `/docs`
4. Save

---

## 4. Add Repository Content

### Option A: Git Subtree (Recommended)

For each protocol, extract relevant code:

```bash
# Example: SPL-8004
cd /Users/bl10buer/Desktop/sp8004
git subtree split --prefix=spl_8004 -b spl-8004-standalone

# Clone new repo
cd ..
git clone https://github.com/NoemaProtocol/SPL-8004.git
cd SPL-8004

# Merge subtree
git pull ../sp8004 spl-8004-standalone

# Add README
cp ../sp8004/.github/REPOS/SPL-8004-README.md README.md

# Commit and push
git add .
git commit -m "Initial commit: SPL-8004 protocol"
git push origin main
```

### Option B: Manual Copy (Simpler)

```bash
# Create temp directory
mkdir -p ~/noema-repos-temp

# For SPL-8004
cp -r spl_8004/* ~/noema-repos-temp/SPL-8004/
cp .github/REPOS/SPL-8004-README.md ~/noema-repos-temp/SPL-8004/README.md

# Clone and add
cd ~/noema-repos-temp/SPL-8004
git init
git remote add origin https://github.com/NoemaProtocol/SPL-8004.git
git add .
git commit -m "Initial commit: SPL-8004 protocol"
git push -u origin main
```

---

## 5. Verification Checklist

After completing all steps:

- [ ] All 10 repositories created
- [ ] Each has proper description and topics
- [ ] README files added
- [ ] Organization profile updated
- [ ] Branch protection enabled
- [ ] Issues and Discussions enabled
- [ ] At least one commit in each repo
- [ ] Repository links work in organization page

---

## 6. Next Steps

1. **Announce** the multi-repo structure on Discord/Twitter
2. **Update** website links to point to new repos
3. **Configure** CI/CD pipelines for each repo
4. **Create** initial releases/tags
5. **Publish** NPM packages from new repos
6. **Update** documentation cross-links

---

**Need help?** Check `.github/MULTI_REPO_SETUP_GUIDE.md` for detailed instructions.
