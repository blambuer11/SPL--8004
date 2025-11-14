# Noema Protocol GitHub Organization Setup

## 📋 Deployment Instructions

### 1. Create Organization Repository

1. Go to https://github.com/NoemaProtocol
2. Create a new repository named `.github`
3. Initialize with README

### 2. Upload Organization Files

Copy all files from `.github-org/` folder to the `.github` repository:

```bash
# Navigate to .github-org folder
cd .github-org

# Copy all files to the .github repo
# Structure should be:
# .github/
# ├── profile/
# │   └── README.md
# ├── workflows/
# │   ├── ci-cd.yml
# │   └── auto-label.yml
# ├── ISSUE_TEMPLATE/
# │   ├── bug_report.md
# │   ├── feature_request.md
# │   └── security.md
# ├── PULL_REQUEST_TEMPLATE.md
# ├── CONTRIBUTING.md
# ├── CODE_OF_CONDUCT.md
# ├── SECURITY.md
# ├── FUNDING.yml
# └── labeler.yml
```

### 3. Add Organization Assets

Create `profile/` folder in `.github` repo and add:

- `banner.png` - Organization banner (1280x640px recommended)
- `logo.png` - Organization logo (200x200px recommended)
- `social-preview.png` - Social media preview (1200x630px)

### 4. Configure Organization Settings

#### General Settings
- **Name**: Noema Protocol
- **Display Name**: Noema Protocol
- **Description**: Trust Infrastructure for Autonomous AI Agents on Solana
- **Website**: https://noemaprotocol.xyz
- **Email**: contact@noemaprotocol.xyz

#### Features
- [x] Wikis
- [x] Issues
- [x] Discussions
- [x] Projects
- [x] Packages

#### Repository Default Settings
- Default branch: `main`
- Require pull request reviews: 1
- Require status checks to pass: Yes
- Require branches to be up to date: Yes
- Include administrators: No

### 5. Add Repository Topics

For each repository, add relevant topics:

```
SPL--8004:
- solana
- blockchain
- smart-contracts
- ai-agents
- web3
- rust
- anchor

agent-dashboard:
- react
- typescript
- solana
- web3
- ai-agents
- dashboard

payai-sdk:
- sdk
- typescript
- solana
- web3
- npm-package
```

### 6. Configure Secrets

Add the following secrets to organization:

**Vercel Deployment:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Discord Notifications:**
- `DISCORD_WEBHOOK_URL`

**Security Scanning:**
- `CODECOV_TOKEN`

### 7. Set Up Teams

Create teams with appropriate permissions:

**Core Team** (Admin)
- Full repository access
- Can create repositories
- Billing access

**Contributors** (Write)
- Push to non-protected branches
- Create pull requests
- Close issues

**Community** (Read)
- Read repository contents
- Create issues
- Comment on discussions

### 8. Enable GitHub Pages

For documentation repos:
1. Go to Settings → Pages
2. Source: Deploy from branch
3. Branch: `main` / docs folder
4. Custom domain (optional)

### 9. Configure Branch Protection

For `main` branch:
- [x] Require pull request reviews (1 approver)
- [x] Require status checks (CI/CD)
- [x] Require conversation resolution
- [x] Require linear history
- [x] Include administrators

### 10. Set Up Discussions

1. Enable Discussions in organization settings
2. Create categories:
   - 💡 Ideas & Feature Requests
   - 🙏 Q&A
   - 📢 Announcements
   - 🌟 Show & Tell
   - 💬 General

### 11. Configure Webhooks (Optional)

Add webhooks for:
- Discord notifications
- Slack integration
- Custom CI/CD triggers

### 12. Add Social Links

In organization profile:
- Twitter: https://twitter.com/noemaprotocol
- Discord: https://discord.gg/noemaprotocol
- Website: https://noemaprotocol.xyz

---

## 🎨 Branding Assets

### Logo Specifications

**Primary Logo**
- Format: PNG with transparency
- Size: 512x512px
- Background: Transparent
- Colors: Purple gradient (#9333EA to #3B82F6)

**Banner**
- Format: PNG
- Size: 1280x640px
- Style: Gradient background with logo and tagline
- Text: "Noema Protocol - Trust Infrastructure for AI Agents"

**Social Preview**
- Format: PNG/JPG
- Size: 1200x630px
- Include: Logo, tagline, key features

### Color Palette

```
Primary Purple: #9333EA
Secondary Blue: #3B82F6
Success Green: #10B981
Warning Orange: #F59E0B
Error Red: #EF4444
```

---

## 📊 Repository Structure

### Main Repositories

1. **SPL--8004** - Core protocol
2. **x402-protocol** - Payment system
3. **x404-bridge** - Cross-chain bridge
4. **noema-staking** - Staking contracts
5. **agent-dashboard** - Web UI
6. **payai-sdk** - JavaScript SDK
7. **api-gateway** - Backend API
8. **docs** - Documentation site

### Repository Naming Convention

- Use lowercase with hyphens
- Descriptive names
- Prefix with technology when relevant

Examples:
- `spl-8004-contracts`
- `agent-dashboard`
- `payai-sdk-js`

---

## 🔧 Maintenance

### Regular Tasks

**Weekly:**
- Review open issues
- Merge approved PRs
- Update project boards

**Monthly:**
- Security audit
- Dependency updates
- Community report

**Quarterly:**
- Review roadmap
- Update documentation
- Release planning

---

## 📞 Support

For organization setup help:
- Email: admin@noemaprotocol.xyz
- Discord: @admin-team

---

**Setup completed by:** [Your Name]
**Date:** [Date]
**Version:** 1.0.0
