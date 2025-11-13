# Noema Protocol API (Standalone Deployment)

This directory is prepared for deploying API endpoints as a separate Vercel project (`api.noemaprotocol.xyz`).

## Endpoints
- `GET /api/build-info` – Returns commit, branch, build timestamp.
- `POST /api/solana` – Proxies Solana JSON-RPC (getHealth, etc.).

## Structure
```
serverless/
  api/
    build-info/
      index.js
    solana/
      index.js
  package.json
  vercel.json
```

## Deploy Steps
1. Create new Vercel project: `noemaprotocol-api`
2. Root Directory: `serverless`
3. Build Command: `npm install` (no build step required)
4. Output Directory: (leave empty – functions only)
5. Framework Preset: `Other`
6. Add domain alias: `api.noemaprotocol.xyz`

## Local Test
```bash
cd serverless
npm install
vercel dev
curl localhost:3000/api/build-info
curl -X POST localhost:3000/api/solana -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

## Notes
- Edge function (`solana`) uses `runtime: 'edge'` for lower latency.
- Add rate limiting or auth later if exposed publicly.
