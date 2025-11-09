# X402 Test Guide

## Services

### 1. Start Facilitator
```bash
cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/x402-facilitator
npm run dev
```
- Port: 3001
- Mock Mode: Enabled
- Endpoints: /health, /supported, /verify, /settle

### 2. Start Validator API
```bash
cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/validator-api
npm run dev
```
- Port: 4021
- Endpoints: /health, /api/leaderboard (402), /api/validations/submit (402)

## Manual Test Commands

### Health Checks
```bash
# Facilitator
curl -sS http://localhost:3001/health | jq

# Validator API
curl -sS http://localhost:4021/health | jq

# Facilitator capabilities
curl -sS http://localhost:3001/supported | jq
```

### 402 Flow Test

#### 1. Request without payment (expecting 402)
```bash
curl -i http://localhost:4021/api/leaderboard
```

Expected: HTTP 402 with JSON body containing:
- facilitator: http://localhost:3001
- receiver: Treasury address
- tokenMint: USDC devnet
- priceUsd: endpoint price

#### 2. Bypass with header (demo/test)
```bash
curl -sS -H 'x-payment-response: ok' \
  http://localhost:4021/api/leaderboard | jq
```

Expected: 200 with leaderboard JSON

#### 3. Validation submit test
```bash
curl -sS -X POST http://localhost:4021/api/validations/submit \
  -H 'Content-Type: application/json' \
  -H 'x-payment-response: ok' \
  -d '{"agentId":"demo-agent","taskHash":"dGVzdC10YXNrLTEyMw==","approved":true,"evidenceUri":"https://example.com/evidence"}' | jq
```

Expected: 200 with `{ ok: true, accepted: true, ref: "val_..." }`

#### 4. Facilitator verify (Mock Mode)
```bash
curl -sS -X POST http://localhost:3001/verify \
  -H 'Content-Type: application/json' \
  -d '{
    "version": "x402-demo-1",
    "network": "solana-devnet",
    "transaction": "AQ==",
    "metadata": {
      "endpoint": "/api/leaderboard",
      "amount": "0.0001",
      "recipient": "9x3TDBKE7qFHXmvUUhPMkkSBhLmzazRxQaKwzSrQwcXX"
    }
  }' | jq
```

Expected: `{ isValid: true, ... }`

#### 5. Facilitator settle (Mock Mode)
```bash
curl -sS -X POST http://localhost:3001/settle \
  -H 'Content-Type: application/json' \
  -d '{
    "version": "x402-demo-1",
    "network": "solana-devnet",
    "transaction": "AQ==",
    "metadata": {
      "endpoint": "/api/leaderboard",
      "amount": "0.0001",
      "recipient": "9x3TDBKE7qFHXmvUUhPMkkSBhLmzazRxQaKwzSrQwcXX"
    }
  }' | jq
```

Expected: `{ success: true, signature: "...", explorerUrl: ... }`

## Automated Test Script

```bash
cd /Users/bl10buer/Desktop/sp8004
./test-x402.sh
```

This script runs all tests sequentially and displays outputs.

## Frontend Test

To test the frontend with local services:

```bash
cd /Users/bl10buer/Desktop/sp8004/SPL--8004
npm run dev
```

These should be set in `.env`:
- `VITE_VALIDATOR_API_URL=http://localhost:4021`
- `VITE_X402_FACILITATOR_URL=http://localhost:3001`

When paid endpoints are requested in the dashboard, a 402 response is returned and payment requirement is shown in the UI.

## Troubleshooting

### Port already in use (EADDRINUSE)
```bash
# Which process is using it?
lsof -i :4021
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Services not working
```bash
# Reinstall dependencies
cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/validator-api
npm install

cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/x402-facilitator
npm install
```

### Real payment flow (MOCK_MODE off)
```bash
# In x402-facilitator/.env:
MOCK_MODE=false
KORA_RPC_URL=<real Kora RPC URL>
KORA_API_KEY=<real API key>
KORA_SIGNER_ADDRESS=<real signer address>
```

## Test Results

Expected successful outputs:
- ✅ Facilitator health: `{ status: "ok", mockMode: true }`
- ✅ Validator API health: `{ status: "ok", service: "validator-api" }`
- ✅ 402 response: returns requirement object
- ✅ Bypass test: leaderboard and validation submit successful
- ✅ Verify/settle: Mock Mode simulation outputs
