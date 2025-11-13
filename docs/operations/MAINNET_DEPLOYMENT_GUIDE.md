# MAINNET DEPLOYMENT GUIDE

## ⚠️ IMPORTANT

Before deploying to Mainnet, ensure all components are thoroughly tested on Devnet.

---

## 🚀 MAINNET DEPLOYMENT STEPS

### Step 1: Prepare Programs

```bash
# Build all programs
anchor build

# Update program IDs in Anchor.toml and lib.rs files
# Use actual Mainnet program IDs
```

### Step 2: Deploy Programs

```bash
# Set cluster to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Check balance (need ~10 SOL for deployment)
solana balance

# Deploy
anchor deploy --provider.cluster mainnet

# Verify deployment
solana program show <PROGRAM_ID>
```

### Step 3: Initialize Programs

```bash
# Initialize SPL-8004 Identity Registry
ts-node scripts/initialize-mainnet.ts

# Verify initialization
ts-node scripts/verify-deployment.ts
```

### Step 4: Update Environment Variables

```env
# Frontend .env
VITE_NETWORK=mainnet-beta
VITE_RPC_URL=https://api.mainnet-beta.solana.com
VITE_PROGRAM_ID=<ACTUAL_MAINNET_PROGRAM_ID>

# API .env
NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PROGRAM_ID=<ACTUAL_MAINNET_PROGRAM_ID>
USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Step 5: Deploy Frontend & API

```bash
# Deploy to Vercel
vercel --prod

# Verify deployment
curl https://noemaprotocol.xyz/api/agents
```

---

## ⚠️ MAINNET DEPLOYMENT REQUIREMENTS

### Financial Requirements
- **Program Deployment**: ~5-10 SOL per program
- **Account Rent**: ~0.1 SOL per account
- **Transaction Fees**: ~0.000005 SOL per transaction
- **Total Estimated**: 20-50 SOL for full deployment

### Technical Requirements
- Mainnet RPC endpoint (Helius, QuickNode, or custom)
- SSL certificates for APIs
- Production database (Upstash Redis)
- Monitoring and alerting (Sentry, Datadog)
- Backup and recovery plan

### Security Requirements
- ✅ Smart contract audit completed
- ✅ Penetration testing done
- ✅ Bug bounty program active
- ✅ Multi-signature wallets for treasury
- ✅ Rate limiting and DDoS protection
- ✅ API key management system

---

## 🔒 SECURITY CHECKLIST

- [ ] All private keys stored in hardware wallets
- [ ] Multi-sig for program upgrade authority
- [ ] Rate limiting enabled on all APIs
- [ ] HTTPS enforced everywhere
- [ ] API keys rotated regularly
- [ ] Monitoring and alerts configured
- [ ] Backup strategy tested
- [ ] Incident response plan documented

---

## 📊 MONITORING

### Metrics to Track
- Transaction success rate
- API response times
- Error rates
- User growth
- Revenue metrics

### Tools
- **Blockchain**: Solana Explorer, SolanaFM
- **APIs**: Vercel Analytics, Upstash monitoring
- **Errors**: Sentry
- **Uptime**: UptimeRobot

---

## 🔄 FAST DEPLOYMENT (RISKY)

**Only use if you fully understand the risks!**

```bash
# 1. Build and deploy
anchor build && anchor deploy --provider.cluster mainnet

# 2. Initialize
ts-node scripts/quick-init-mainnet.ts

# 3. Deploy frontend
vercel --prod --force

# 4. Verify
curl https://noemaprotocol.xyz/api/agents
```

**Risks:**
- No thorough testing
- Potential bugs in production
- Financial loss possible
- User trust impact

---

## 📝 POST-DEPLOYMENT

### Immediate Actions
1. Verify all program IDs match
2. Test agent registration end-to-end
3. Monitor error rates
4. Announce launch

### Within 24 Hours
1. Set up monitoring dashboards
2. Configure alerts
3. Document any issues
4. Gather user feedback

### Within 1 Week
1. Analyze usage patterns
2. Optimize performance
3. Plan feature updates
4. Security audit review

---

## 🆘 ROLLBACK PLAN

If critical issues are found:

```bash
# 1. Switch frontend to maintenance mode
vercel env add MAINTENANCE_MODE true

# 2. Point to previous deployment
vercel rollback

# 3. Fix issues on Devnet
solana config set --url devnet

# 4. Test fixes thoroughly
npm run test:e2e

# 5. Redeploy to Mainnet
anchor deploy --provider.cluster mainnet
```

---

## 📞 SUPPORT

If you encounter issues during Mainnet deployment:

- **Discord**: [discord.gg/noema](https://discord.gg/noema)
- **Email**: [support@noemaprotocol.xyz](mailto:support@noemaprotocol.xyz)
- **GitHub**: [github.com/blambuer11/SPL--8004/issues](https://github.com/blambuer11/SPL--8004/issues)

---

**Deploy safely! 🚀**
