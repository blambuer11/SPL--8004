# x402 + Kora (Solana) Demo (Isolated)

This module is fully isolated from your existing app. It demonstrates an end‑to‑end x402 micropayment flow backed by Kora RPC (gasless facilitator) using USDC on Solana devnet.

Components:
- Facilitator (port 3000): Bridges x402 payment payloads to Kora RPC (/supported, /verify, /settle)
- Protected API (port 4021): Returns 402 Payment Required until a valid x402 payment is settled
- Client (CLI): Shows the 402 → pay → 200 flow with logs

Run modes:
- Real mode: Set KORA_URL and required keys to use a live Kora RPC
- Mock mode: Set MOCK_MODE=true to simulate Kora so you can demo without a chain

## Quick start (Mock Mode)

```bash
cd x402-kora-demo
cp .env.example .env
# Set MOCK_MODE=true in .env
pnpm i -w
pnpm -w run dev:all
```

Then in another terminal:
```bash
pnpm -w run demo
```

## Quick start (Real Kora)
- Start a Kora RPC at http://localhost:8080 (per Kora docs)
- Fund signer with devnet SOL, fund payer with devnet USDC
- Set .env with KORA_URL, KORA_API_KEY, devnet USDC mint, payer/signer keys
- `pnpm -w run dev:all` then `pnpm -w run demo`

See `docs/flow.md` for details.
