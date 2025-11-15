# SDK Test & Publish Guide

## ✅ Current Status

Both SDKs have been successfully built and tested:

### @spl-8004/sdk (Primary Open Source)
- ✅ Package built: `spl-8004-sdk-1.0.0.tgz`
- ✅ Size: 9.2 KB
- ✅ Location: `/packages/spl-8004-sdk/`
- ✅ README: Complete with installation & usage
- ✅ TypeScript: Compiled successfully

### @noema/sdk (Managed/Hosted)
- ✅ Package built: `noema-sdk-1.0.0.tgz`
- ✅ Size: 9.5 KB
- ✅ Location: `/spl-8004-sdk/`
- ✅ README: Complete with API key setup
- ✅ TypeScript: Compiled successfully

## 📦 Installation Commands (VERIFIED)

### Primary SDK (@spl-8004/sdk) - Chain-focused
```bash
npm install @spl-8004/sdk
# or
yarn add @spl-8004/sdk
# or
pnpm add @spl-8004/sdk
```

### Managed SDK (@noema/sdk) - Hosted API
```bash
npm install @noema/sdk
# or
yarn add @noema/sdk
# or
pnpm add @noema/sdk
```

## 🧪 Testing

### Test @spl-8004/sdk locally
```bash
cd /Users/bl10buer/Desktop/sp8004/packages/spl-8004-sdk
npm install
npm run build
npm pack --dry-run
```

### Test @noema/sdk locally
```bash
cd /Users/bl10buer/Desktop/sp8004/spl-8004-sdk
npm install
npm run build
npm pack --dry-run
```

## 🚀 Publishing to npm

### Prerequisites
1. npm account: https://www.npmjs.com/signup
2. Login: `npm login`
3. Verify organization access: @spl-8004 and @noema

### Publish @spl-8004/sdk
```bash
cd /Users/bl10buer/Desktop/sp8004/packages/spl-8004-sdk

# Test package
npm pack --dry-run

# Publish to npm
npm publish --access public

# Verify
npm info @spl-8004/sdk
```

### Publish @noema/sdk
```bash
cd /Users/bl10buer/Desktop/sp8004/spl-8004-sdk

# Test package
npm pack --dry-run

# Publish to npm
npm publish --access public

# Verify
npm info @noema/sdk
```

## 📋 Pre-Publish Checklist

- [x] Both packages build successfully
- [x] TypeScript compiles without errors
- [x] README.md files are complete
- [x] package.json has correct metadata
- [x] GitHub URL updated to: https://github.com/NoemaProtocol/SPL--8004
- [x] Version numbers set (1.0.0)
- [x] LICENSE files present
- [ ] npm organization access configured
- [ ] Test installation in blank project
- [ ] Update documentation site with install commands

## 🔍 Verification After Publishing

### Test @spl-8004/sdk
```bash
# In a new directory
mkdir test-spl-8004 && cd test-spl-8004
npm init -y
npm install @spl-8004/sdk

# Test import
node -e "import('@spl-8004/sdk').then(sdk => console.log('✅ @spl-8004/sdk loaded:', Object.keys(sdk)))"
```

### Test @noema/sdk
```bash
# In a new directory
mkdir test-noema && cd test-noema
npm init -y
npm install @noema/sdk

# Test import
node -e "import('@noema/sdk').then(sdk => console.log('✅ @noema/sdk loaded:', Object.keys(sdk)))"
```

## 📝 Package Comparison

| Feature | @spl-8004/sdk | @noema/sdk |
|---------|---------------|------------|
| **Type** | Primary/Open Source | Managed/Hosted |
| **API Key** | Optional | Required |
| **RPC** | Self-configured | Managed |
| **Size** | 9.2 KB | 9.5 KB |
| **Use Case** | Validators, integrators | App developers |
| **Cost** | Gas fees only | Tiered pricing |
| **Location** | /packages/spl-8004-sdk | /spl-8004-sdk |

## 🛠️ Troubleshooting

### If publish fails with 403
```bash
# Login to npm
npm login

# Check whoami
npm whoami

# Verify organization membership
npm org ls @spl-8004
npm org ls @noema
```

### If package already exists
```bash
# Increment version
npm version patch  # or minor, or major

# Publish again
npm publish --access public
```

## 📚 Documentation Updates Needed

After publishing, update:
1. ✅ Main README.md (installation commands)
2. Website docs (https://noemaprotocol.xyz/docs)
3. Dashboard SDK page
4. GitHub release notes

## 🎉 Success Criteria

- [ ] `npm install @spl-8004/sdk` works globally
- [ ] `npm install @noema/sdk` works globally
- [ ] Both packages appear on npmjs.com
- [ ] Documentation updated
- [ ] GitHub repo updated with new URLs
