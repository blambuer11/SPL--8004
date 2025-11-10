# Vercel API Routes Troubleshooting

## Current Status
- ✅ Security headers working (X-Frame-Options, HSTS, etc.)
- ✅ Static site deploying correctly
- ❌ `/api/build-info` and `/api/solana` returning 404

## Root Cause
Vercel is detecting the project as a **Vite-only** framework, which treats the entire output as static. The `/api` directory is not being recognized as serverless functions.

## Solution Steps

### 1. Check Vercel Dashboard Settings
Go to: **Project Settings → Build & Development Settings**

Verify:
- **Root Directory**: Empty (should be `/` or blank)
- **Framework Preset**: Change from "Vite" to "**Other**"
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2. Verify API Directory Structure
The `/api` directory should be at the project root (same level as `/src` and `package.json`):

```
sp8004/
├── api/
│   ├── build-info.js    ← Node.js serverless function
│   ├── solana.js         ← Edge runtime function
│   └── ...
├── src/
├── dist/                 ← Vite build output
├── package.json
└── vercel.json
```

### 3. Current vercel.json
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

### 4. API Function Format
Both functions use ES module syntax (compatible with `"type": "module"` in package.json):

**`api/build-info.js`** (Node.js serverless):
```javascript
export default function handler(req, res) {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 9) || 'local';
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ commit, ... });
}
```

**`api/solana.js`** (Edge runtime):
```javascript
export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Edge function logic
  return new Response(...);
}
```

### 5. Alternative: Force Framework Detection
If changing Framework Preset doesn't work, try adding to `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [ ... ]
}
```

But **do NOT add** `"framework": "vite"` – let Vercel auto-detect.

### 6. Test Commands
After redeploying, verify:

```bash
# Test build-info endpoint (should return JSON)
curl https://www.noemaprotocol.xyz/api/build-info

# Test Solana proxy (should return RPC response)
curl -X POST https://www.noemaprotocol.xyz/api/solana \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Check headers
npm run check:headers https://www.noemaprotocol.xyz
```

### 7. Debugging Tips
- Check Vercel build logs for "Detected API routes" message
- Look for errors in Vercel's Function logs (separate from build logs)
- Try deploying with Vercel CLI locally: `vercel --prod`
- If nothing works, consider splitting `/api` into a separate Vercel project

## Build Output v3 Approach (Already Implemented)
The `scripts/prepare-vercel-functions.mjs` script was added to manually create `.vercel/output/functions/` directory with proper v3 format. This runs in `postbuild`. However, Vercel's remote build may not persist this directory if Framework detection overrides it.

## Next Steps
1. **Dashboard check** (highest priority): Change Framework Preset to "Other"
2. **Redeploy** after changing settings
3. **Monitor build logs** for API detection
4. If still failing, consider **monorepo structure** or **separate API project**

---

**Last updated**: 2025-11-10  
**Commits**: 472f1bd99, abd16a18d, 83c6d87d5
