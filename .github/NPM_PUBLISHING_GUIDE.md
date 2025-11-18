# NPM Package Publishing Guide

## 🚀 Quick Publishing

### 1. Login to NPM

```bash
npm login
# Enter your credentials
```

### 2. Publish @spl-8004/sdk

```bash
cd /Users/bl10buer/Desktop/sp8004/sdk/spl-8004-sdk
npm publish
```

### 3. Publish @noema/sdk (if separate)

```bash
cd /Users/bl10buer/Desktop/sp8004/sdk/noema-sdk
npm publish
```

---

## 📋 Pre-Publishing Checklist

Before publishing, ensure:

- [x] Package builds successfully (`npm run build`)
- [x] Package.json has correct metadata
- [x] README.md is complete
- [x] LICENSE file exists
- [x] Version number is correct (1.0.0)
- [ ] NPM account has access to @spl-8004 scope
- [ ] All tests pass (`npm test`)

---

## 🔐 NPM Account Setup

### Create NPM Account
```bash
npm adduser
```

### Request Scope Access
If you don't own `@spl-8004` scope:
```bash
# Contact NPM support or create organization
npm org create spl-8004
```

### Alternative: Publish without scope
If scope unavailable, publish as:
- `spl-8004-sdk` instead of `@spl-8004/sdk`
- `noema-sdk` instead of `@noema/sdk`

Update package.json:
```json
{
  "name": "spl-8004-sdk",
  // ... rest
}
```

---

## 📦 Current Workaround: Local Installation

Until NPM publication, use local installation:

### Option 1: Tarball Installation

```bash
# Generate tarball
cd /Users/bl10buer/Desktop/sp8004/sdk/spl-8004-sdk
npm pack

# Install in project
npm install /path/to/spl-8004-sdk-1.0.0.tgz
```

### Option 2: Link Package (Development)

```bash
# In SDK directory
cd /Users/bl10buer/Desktop/sp8004/sdk/spl-8004-sdk
npm link

# In your project
cd /your/project
npm link @spl-8004/sdk
```

### Option 3: Git Installation

```bash
# After pushing to GitHub
npm install git+https://github.com/NoemaProtocol/SPL-8004.git#main:sdk/spl-8004-sdk
```

---

## 🔄 Version Management

### Bump Version
```bash
# Patch: 1.0.0 -> 1.0.1
npm version patch

# Minor: 1.0.0 -> 1.1.0
npm version minor

# Major: 1.0.0 -> 2.0.0
npm version major
```

### Publish New Version
```bash
npm run build
npm publish
```

---

## 📝 Publishing Steps (Detailed)

### Step 1: Verify Build

```bash
cd /Users/bl10buer/Desktop/sp8004/sdk/spl-8004-sdk

# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build

# Check dist folder
ls -la dist/
# Should see: index.js, index.mjs, index.d.ts
```

### Step 2: Test Package Locally

```bash
# Create test directory
mkdir -p /tmp/test-sdk
cd /tmp/test-sdk
npm init -y

# Install local package
npm install /Users/bl10buer/Desktop/sp8004/sdk/spl-8004-sdk

# Test import
node -e "const sdk = require('@spl-8004/sdk'); console.log(sdk);"
```

### Step 3: Dry Run Publish

```bash
cd /Users/bl10buer/Desktop/sp8004/sdk/spl-8004-sdk

# See what would be published
npm publish --dry-run

# Check output for:
# - Correct files included
# - No sensitive data
# - Proper package size
```

### Step 4: Publish to NPM

```bash
# Login (one time)
npm login

# Publish
npm publish

# For scoped packages on first publish
npm publish --access public
```

### Step 5: Verify Publication

```bash
# Check on NPM
npm view @spl-8004/sdk

# Install from NPM
mkdir -p /tmp/verify-install
cd /tmp/verify-install
npm init -y
npm install @spl-8004/sdk

# Test
node -e "const { SPL8004SDK } = require('@spl-8004/sdk'); console.log('✅ Installed from NPM successfully!');"
```

---

## 🌐 Alternative: GitHub Packages

If NPM is unavailable, publish to GitHub Packages:

### 1. Update package.json

```json
{
  "name": "@NoemaProtocol/spl-8004-sdk",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### 2. Authenticate

```bash
# Create GitHub token with packages:write permission
npm login --scope=@NoemaProtocol --registry=https://npm.pkg.github.com
```

### 3. Publish

```bash
npm publish
```

### 4. Install from GitHub Packages

```bash
# Create .npmrc in project
echo "@NoemaProtocol:registry=https://npm.pkg.github.com" >> .npmrc

# Install
npm install @NoemaProtocol/spl-8004-sdk
```

---

## 🛠 Troubleshooting

### Error: 404 Not Found

**Problem:** Package not found on NPM registry

**Solutions:**
1. Use local tarball: `npm install /path/to/tarball.tgz`
2. Publish to NPM first
3. Use GitHub Packages instead

### Error: 403 Forbidden

**Problem:** No permission to publish

**Solutions:**
1. Login: `npm login`
2. Request scope access
3. Change package name to non-scoped

### Error: ENOENT package.json

**Problem:** Not in correct directory

**Solution:**
```bash
cd /Users/bl10buer/Desktop/sp8004/sdk/spl-8004-sdk
npm publish
```

### Build Errors

**Problem:** TypeScript compilation fails

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Current Status

### @spl-8004/sdk

- ✅ Package built successfully
- ✅ Tarball created (4.8 KB)
- ✅ Local installation works
- ✅ Exports verified
- ⏳ **NPM publication pending**

### Installation Methods Available Now

1. **Tarball (Recommended for now):**
   ```bash
   npm install /Users/bl10buer/Desktop/sp8004/sdk/spl-8004-sdk/spl-8004-sdk-1.0.0.tgz
   ```

2. **NPM Link (Development):**
   ```bash
   cd /Users/bl10buer/Desktop/sp8004/sdk/spl-8004-sdk
   npm link
   
   cd /your/project
   npm link @spl-8004/sdk
   ```

3. **Git URL (After GitHub push):**
   ```bash
   npm install git+https://github.com/NoemaProtocol/SPL-8004.git
   ```

---

## 🎯 Next Actions

1. **Immediate:** Use tarball installation (already working ✅)
2. **Short-term:** Publish to NPM registry
3. **Long-term:** Setup automated NPM publishing via GitHub Actions

### GitHub Actions Auto-Publish (Future)

Create `.github/workflows/publish-npm.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 📞 Support

- **NPM Issues:** https://www.npmjs.com/support
- **GitHub Packages:** https://docs.github.com/en/packages
- **Documentation:** https://docs.npmjs.com/

---

**Status:** ✅ SDK ready for publication  
**Next Step:** Run `npm publish` or continue with tarball installation
