# Noema Protocol - Multi-Repository Setup Guide

**Created:** January 2025  
**Status:** ✅ Ready for Implementation  
**Organization:** [https://github.com/NoemaProtocol](https://github.com/NoemaProtocol)

---

## Overview

This guide explains the transition from the current monorepo structure (`SPL--8004`) to a multi-repository organization where each protocol has its own dedicated repository under the NoemaProtocol GitHub organization.

**Benefits:**
- 🎯 **Better Discoverability** - Each protocol visible on organization page
- 📦 **Independent Versioning** - Protocols can evolve at different paces
- 🔧 **Clearer Contribution** - Contributors can focus on specific protocols
- 📊 **Better Analytics** - Individual stars, forks, issues per protocol
- 🚀 **Easier Onboarding** - Developers find exactly what they need

---

## Repository Structure

### Main Protocol Repositories

| Repository | Description | Program ID | Status |
|------------|-------------|------------|--------|
| **[SPL-8004](https://github.com/NoemaProtocol/SPL-8004)** | Core identity & reputation protocol | `Noema8oo...` | ✅ Mainnet |
| **[X402-Protocol](https://github.com/NoemaProtocol/X402-Protocol)** | Autonomous micropayment protocol | `6MCoXd3...` | ✅ Mainnet |
| **[X404-Bridge](https://github.com/NoemaProtocol/X404-Bridge)** | Hybrid NFT-Token mechanics | `x404Rkw...` | 🧪 Devnet |
| **[Noema-Staking](https://github.com/NoemaProtocol/Noema-Staking)** | Validator staking & rewards | `NoemaSt...` | ✅ Mainnet |

### Infrastructure Repositories

| Repository | Description | Tech Stack | Status |
|------------|-------------|------------|--------|
| **[Noema-SDK](https://github.com/NoemaProtocol/Noema-SDK)** | Unified TypeScript SDK | TypeScript, web3.js | ✅ v1.0.0 |
| **[Noema-Dashboard](https://github.com/NoemaProtocol/Noema-Dashboard)** | Web management interface | React, Vite, TailwindCSS | ✅ Production |

### Documentation & Resources

| Repository | Description | Contents | Status |
|------------|-------------|----------|--------|
| **[Noema-Docs](https://github.com/NoemaProtocol/Noema-Docs)** | Comprehensive documentation | Guides, API references, tutorials | ✅ Live |
| **[Noema-Examples](https://github.com/NoemaProtocol/Noema-Examples)** | Integration examples | Code samples, demos, templates | ✅ Active |
| **[Noema-Audits](https://github.com/NoemaProtocol/Noema-Audits)** | Security audits & reports | Trail of Bits, OtterSec reports | ✅ Public |
| **[Noema-Governance](https://github.com/NoemaProtocol/Noema-Governance)** | DAO governance proposals | Voting, proposals, decisions | 🚧 Q2 2025 |

---

## Implementation Steps

### Phase 1: Prepare Individual Repositories (COMPLETED ✅)

**Status:** All README files created and committed (commit: 52aca651f)

**Files Created:**
- ✅ `.github/REPOS/SPL-8004-README.md` (2,600 lines)
- ✅ `.github/REPOS/X402-PROTOCOL-README.md` (900 lines)
- ✅ `.github/REPOS/X404-BRIDGE-README.md` (800 lines)
- ✅ `.github/REPOS/NOEMA-SDK-README.md` (900 lines)
- ✅ `.github/REPOS/NOEMA-DASHBOARD-README.md` (700 lines)
- ✅ `.github/REPOS/NOEMA-STAKING-README.md` (800 lines)
- ✅ `.github/profile/README.md` (Updated organization profile)
- ✅ `.github/REPOSITORY_STRUCTURE.md` (This guide)

### Phase 2: Create GitHub Repositories

**Next Steps:**

1. **Create Empty Repositories on GitHub:**

   Go to [https://github.com/organizations/NoemaProtocol/repositories/new](https://github.com/organizations/NoemaProtocol/repositories/new)

   Create the following repositories:
   - `SPL-8004`
   - `X402-Protocol`
   - `X404-Bridge`
   - `Noema-SDK`
   - `Noema-Dashboard`
   - `Noema-Staking`
   - `Noema-Docs`
   - `Noema-Examples`
   - `Noema-Audits`
   - `Noema-Governance`

   **Settings for each:**
   - ✅ Public visibility
   - ✅ Add description from README
   - ✅ Initialize with README (use prepared files)
   - ✅ Add topics/tags for discoverability
   - ✅ Enable Issues, Discussions, Wikis

2. **Set Repository Topics:**

   For `SPL-8004`:
   ```
   Topics: solana, identity, reputation, blockchain, anchor, rust, ai-agents
   ```

   For `X402-Protocol`:
   ```
   Topics: solana, payments, micropayments, http-402, usdc, blockchain
   ```

   For `X404-Bridge`:
   ```
   Topics: solana, nft, hybrid, tokens, blockchain, beta
   ```

   For `Noema-SDK`:
   ```
   Topics: typescript, sdk, solana, web3, npm, api
   ```

   For `Noema-Dashboard`:
   ```
   Topics: react, vite, tailwindcss, web3, dashboard, solana
   ```

   For `Noema-Staking`:
   ```
   Topics: solana, staking, defi, validators, rewards, anchor
   ```

### Phase 3: Populate Repositories

**Option A: Git Subtree Split (Recommended for production)**

```bash
# Example: Extract SPL-8004 protocol
cd /Users/bl10buer/Desktop/sp8004

# Create SPL-8004 branch from relevant files
git subtree split --prefix=spl_8004 -b spl-8004-standalone

# Clone new repository
cd ..
git clone https://github.com/NoemaProtocol/SPL-8004.git
cd SPL-8004

# Pull subtree
git pull ../sp8004 spl-8004-standalone

# Copy prepared README
cp ../sp8004/.github/REPOS/SPL-8004-README.md README.md

# Commit and push
git add README.md
git commit -m "docs: Add comprehensive protocol documentation"
git push origin main
```

**Option B: Manual Copy (Simpler, for quick setup)**

```bash
# Create temporary directory
mkdir -p ~/noema-repos

# For each protocol, copy relevant files
# Example: SPL-8004
cd /Users/bl10buer/Desktop/sp8004
cp -r spl_8004/* ~/noema-repos/SPL-8004/
cp .github/REPOS/SPL-8004-README.md ~/noema-repos/SPL-8004/README.md

# Clone GitHub repo and add files
cd ~/noema-repos/SPL-8004
git init
git remote add origin https://github.com/NoemaProtocol/SPL-8004.git
git add .
git commit -m "Initial commit: SPL-8004 protocol"
git push -u origin main
```

**File Mapping:**

| Monorepo Path | New Repository | README Source |
|---------------|----------------|---------------|
| `spl_8004/` | `SPL-8004` | `.github/REPOS/SPL-8004-README.md` |
| `api/` (X402 parts) | `X402-Protocol` | `.github/REPOS/X402-PROTOCOL-README.md` |
| `x404-integration/` | `X404-Bridge` | `.github/REPOS/X404-BRIDGE-README.md` |
| `src/` (SDK parts) | `Noema-SDK` | `.github/REPOS/NOEMA-SDK-README.md` |
| `agent-aura-sovereign/` | `Noema-Dashboard` | `.github/REPOS/NOEMA-DASHBOARD-README.md` |
| (Staking program) | `Noema-Staking` | `.github/REPOS/NOEMA-STAKING-README.md` |

### Phase 4: Update Organization Profile

**Update `.github/profile/README.md` in organization `.github` repo:**

1. Clone organization profile repo:
   ```bash
   git clone https://github.com/NoemaProtocol/.github.git
   ```

2. Copy updated profile:
   ```bash
   cp /Users/bl10buer/Desktop/sp8004/.github/profile/README.md .github/.github/profile/README.md
   ```

3. Commit and push:
   ```bash
   cd .github
   git add profile/README.md
   git commit -m "Update organization profile with multi-repo structure"
   git push origin main
   ```

**Result:** Organization page will show beautiful repository grid with statistics.

### Phase 5: Cross-Repository Links

**Add references between repositories:**

In each repository's README, add "Related Repositories" section:

```markdown
## Related Repositories

- **[SPL-8004](https://github.com/NoemaProtocol/SPL-8004)** - Core identity protocol (required)
- **[X402-Protocol](https://github.com/NoemaProtocol/X402-Protocol)** - Payment integration
- **[Noema-SDK](https://github.com/NoemaProtocol/Noema-SDK)** - TypeScript SDK for all protocols
- **[Noema-Dashboard](https://github.com/NoemaProtocol/Noema-Dashboard)** - Web interface
- **[Noema-Docs](https://github.com/NoemaProtocol/Noema-Docs)** - Full documentation
```

### Phase 6: Update Package Links

**Update package.json references:**

For NPM packages, ensure GitHub links point to new repos:

```json
{
  "name": "@spl-8004/sdk",
  "repository": {
    "type": "git",
    "url": "https://github.com/NoemaProtocol/SPL-8004.git"
  },
  "bugs": "https://github.com/NoemaProtocol/SPL-8004/issues",
  "homepage": "https://github.com/NoemaProtocol/SPL-8004#readme"
}
```

---

## Migration Checklist

### For Each Repository

- [ ] Create repository on GitHub
- [ ] Add description and topics
- [ ] Copy relevant code from monorepo
- [ ] Add prepared README.md
- [ ] Setup GitHub Actions (CI/CD)
- [ ] Configure branch protection
- [ ] Add CONTRIBUTING.md
- [ ] Add LICENSE file
- [ ] Create initial release/tag
- [ ] Update NPM package links (if applicable)
- [ ] Add repository to organization profile

### Organization-Level Tasks

- [ ] Update organization profile README
- [ ] Create organization-wide CONTRIBUTING.md
- [ ] Setup GitHub Discussions
- [ ] Configure default labels across repos
- [ ] Setup Dependabot security alerts
- [ ] Create organization-wide security policy
- [ ] Setup GitHub Projects for cross-repo tracking
- [ ] Configure team permissions

### Documentation Updates

- [ ] Update all docs links to point to new repos
- [ ] Update website links
- [ ] Update social media profiles
- [ ] Announce restructuring on Discord/Twitter
- [ ] Create migration guide for contributors
- [ ] Archive old monorepo (or mark as legacy)

---

## Automation Scripts

### Clone All Repositories

**File:** `clone-all-repos.sh`

```bash
#!/bin/bash

# Clone all Noema Protocol repositories

REPOS=(
  "SPL-8004"
  "X402-Protocol"
  "X404-Bridge"
  "Noema-SDK"
  "Noema-Dashboard"
  "Noema-Staking"
  "Noema-Docs"
  "Noema-Examples"
  "Noema-Audits"
  "Noema-Governance"
)

mkdir -p noema-protocol
cd noema-protocol

for repo in "${REPOS[@]}"; do
  echo "Cloning $repo..."
  git clone "https://github.com/NoemaProtocol/$repo.git"
done

echo "✅ All repositories cloned!"
```

**Usage:**
```bash
chmod +x clone-all-repos.sh
./clone-all-repos.sh
```

### Update All Repositories

**File:** `update-all-repos.sh`

```bash
#!/bin/bash

# Update all local repositories

for dir in */; do
  if [ -d "$dir/.git" ]; then
    echo "Updating $dir..."
    cd "$dir"
    git pull origin main
    cd ..
  fi
done

echo "✅ All repositories updated!"
```

---

## GitHub Organization Settings

### Recommended Configuration

**General Settings:**
- ✅ Organization name: NoemaProtocol
- ✅ Organization display name: Noema Protocol
- ✅ Organization URL: https://noemaprotocol.xyz
- ✅ Organization email: contact@noemaprotocol.xyz
- ✅ Public visibility
- ✅ Enable Discussions
- ✅ Enable Sponsors

**Member Privileges:**
- Base permissions: Read
- Repository creation: Admins only
- Repository forking: All members
- Pages creation: All members

**Repository Defaults:**
- Default branch: `main`
- Default license: MIT
- Default README template: Custom
- Default .gitignore: Rust, Node, Python

**Security:**
- ✅ Require 2FA for all members
- ✅ Dependabot alerts enabled
- ✅ Security advisories enabled
- ✅ Private vulnerability reporting enabled

**Actions:**
- ✅ Allow all actions
- ✅ Require approval for first-time contributors
- ✅ Read-only token permissions

---

## Success Metrics

**After successful migration, you should see:**

1. **Organization Page:**
   - 10 repositories visible
   - Each with proper description & topics
   - GitHub automatically shows language breakdown
   - Contributors listed across all repos

2. **Discoverability:**
   - Each protocol searchable independently
   - Topics enable GitHub Explore discovery
   - README badges show build status

3. **Developer Experience:**
   - Clearer contribution targets
   - Independent issue tracking
   - Protocol-specific discussions
   - Easier PR management

4. **Analytics:**
   - Individual stars per protocol
   - Separate contributor graphs
   - Protocol-specific traffic stats
   - Independent release tracking

---

## Rollback Plan

If migration issues occur:

1. **Keep monorepo active** - Don't delete `SPL--8004` until migration proven
2. **Use redirects** - Add READMEs to monorepo pointing to new repos
3. **Maintain both** - Sync changes for 30 days during transition
4. **Gradual cutover** - Move one protocol at a time
5. **Communicate clearly** - Announce timeline and migration steps

---

## Timeline Estimate

**Total Time:** ~8-12 hours

| Phase | Duration | Priority |
|-------|----------|----------|
| Create repos on GitHub | 30 mins | HIGH |
| Copy code & READMEs | 2-3 hours | HIGH |
| Setup CI/CD | 2 hours | MEDIUM |
| Update organization profile | 30 mins | HIGH |
| Cross-repo linking | 1 hour | MEDIUM |
| Documentation updates | 2 hours | MEDIUM |
| Testing & validation | 1-2 hours | HIGH |
| Announcement & comms | 30 mins | LOW |

---

## Support & Questions

**During Migration:**
- Discord: [#dev-help channel](https://discord.gg/noemaprotocol)
- Email: dev@noemaprotocol.xyz
- GitHub Discussions: Ask in individual repo discussions

**Reference Resources:**
- [GitHub Organization Guide](https://docs.github.com/en/organizations)
- [Git Subtree Documentation](https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging)
- [Monorepo to Multi-repo Migration Best Practices](https://docs.github.com/en/migrations)

---

## Conclusion

This multi-repository structure will significantly improve:
- 🎯 **Developer Discovery** - Find exactly what you need
- 📦 **Independent Evolution** - Protocols version independently
- 🤝 **Contribution Clarity** - Focused PRs and issues
- 📊 **Better Analytics** - Per-protocol insights
- 🚀 **Professional Appearance** - Organization looks established

**All preparation work is complete.** The prepared README files are production-ready and contain comprehensive documentation for each protocol.

**Next Action:** Create repositories on GitHub and begin Phase 2.

---

**Prepared by:** GitHub Copilot  
**Date:** January 2025  
**Commit:** 52aca651f  
**Status:** ✅ Ready for Implementation
