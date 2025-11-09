# 📦 NPM Publish Guide - @noema/sdk

## ✅ Pre-Publish Checklist

All preparations are complete:
- ✅ Package renamed to `@noema/sdk`
- ✅ API key authentication added
- ✅ Usage tracking integrated
- ✅ Rate limiting configured
- ✅ Pricing tiers documented
- ✅ Build successful
- ✅ Package contents verified

## 🚀 Publishing Steps

### 1. Login to NPM

```bash
cd /Users/bl10buer/Desktop/sp8004/spl-8004-sdk
npm login
```

Enter your NPM credentials:
- Username
- Password
- Email
- One-time password (if 2FA enabled)

### 2. Verify Package

```bash
npm pack --dry-run
```

Expected output:
- Package name: `@noema/sdk`
- Version: `1.0.0`
- Size: ~7.9 kB
- Files: 8 (README, dist/, package.json)

### 3. Publish to NPM

```bash
npm publish --access public
```

The `--access public` flag is required for scoped packages (@noema/sdk).

### 4. Verify Publication

After publishing, verify at:
- NPM: https://www.npmjs.com/package/@noema/sdk
- Test install: `npm install @noema/sdk`

## 📝 Post-Publish Tasks

### Update Documentation

1. Update main README to reference `@noema/sdk`
2. Add installation badges
3. Update examples

### Announce

1. Tweet from @NoemaProtocol
2. Post in Discord
3. Update website docs

### Monitor

1. Check download stats: https://npm-stat.com/charts.html?package=@noema/sdk
2. Watch for issues: https://github.com/blambuer11/SPL--8004/issues
3. Monitor support emails

## 🔄 Future Updates

For version updates:

```bash
# Patch (bug fixes): 1.0.0 -> 1.0.1
npm version patch

# Minor (new features): 1.0.0 -> 1.1.0
npm version minor

# Major (breaking changes): 1.0.0 -> 2.0.0
npm version major

# Then publish
npm publish
```

## 🎯 Pricing Integration

### Environment Variables

Set these in Vercel:

```env
# Required
KEY_SECRET=your_jwt_secret_here
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Optional (for metered billing)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_METERED_PRICE_ID=price_...

# Rate limits
RATE_LIMIT_RPM=120  # Free tier: 10/min, Pro: 100/min
```

### Tier Management

Tiers are managed via JWT claims:

```javascript
// Free tier
{ tier: 'free', rpm: 10, monthlyLimit: 1000 }

// Pro tier
{ tier: 'pro', rpm: 100, monthlyLimit: 100000 }

// Enterprise
{ tier: 'enterprise', rpm: 1000, monthlyLimit: -1 } // unlimited
```

## 📊 Analytics Setup

Track SDK usage:

1. **Download Stats**: npm-stat.com
2. **API Usage**: Upstash Redis + Vercel Analytics
3. **Revenue**: Stripe Dashboard
4. **Errors**: Sentry (optional)

## 🔐 Security

- ✅ API keys use JWT with HS256
- ✅ Keys are hashed before storage
- ✅ Rate limiting per key
- ✅ Usage tracking for billing
- ✅ CORS headers configured

## 📞 Support Channels

Set up:
- support@noemaprotocol.xyz email
- Discord server
- GitHub Discussions
- Documentation site

---

Ready to publish! Just run:

```bash
npm login
npm publish --access public
```
