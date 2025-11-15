# REAL PAYMENT FLOW – COMPLETE SETUP & PDA-COMPATIBLE GUIDE

This document covers the full local (Devnet) integration of X402 payment flow and the recently added PDA (off-curve) recipient support with real USDC transfers via Phantom.

## 🎯 What's Included?

1. Kora Mock RPC (signing + broadcast simulation)
2. Facilitator (MOCK_MODE=false for real verification flow)
3. Validator API (post-payment data access)
4. Frontend (Phantom + Dashboard payment UI)
5. Manual token account fallback for PDA / off-curve recipients

---
## 🧱 Components

### 1. Kora Mock RPC Server ✅
- Port: `8090`
- Endpoints: `/sign`, `/broadcast`, `/verify-payment`
- Purpose: Simulates transaction signing & publishing behavior without production Kora RPC

### 2. Facilitator (Real Mode) ✅
- `MOCK_MODE=false`
- `KORA_RPC_URL=http://localhost:8090`
- Solana transaction parsing & verification
- Gasless settlement logic (broadcast via Kora)

### 3. Phantom Wallet Integration ✅
- Hook: `useX402Payment` (or manual flow in Payments page)
- Flow: create → verify → Phantom sign → settle → confirm
- UI: "Pay with Phantom" / classic form within Dashboard

### 4. Off-Curve (PDA) Recipient Support ✅
When ATA program (ATokenGPv…) rejects PDA owners, fallback: manually creates and initializes token account, transfers to that account.

---
## 🚀 Starting Services

### Terminal 1 – Kora Mock RPC
```bash
cd spl-8004-program/kora-mock-rpc
npm install
npm run dev
```
Expected: `http://localhost:8090`

### Terminal 2 – Facilitator (Real Mode)
```bash
cd spl-8004-program/x402-facilitator
npm install
MOCK_MODE=false npm run dev
```
Expected: `http://localhost:3001`

### Terminal 3 – Validator API
```bash
cd spl-8004-program/validator-api
npm install
npm run dev
```
Expected: `http://localhost:4021`

### Terminal 4 – Frontend (Dashboard)
```bash
cd dashboard
npm install
npm run dev -- --port 8080
```
Expected: `http://localhost:8080`

> Note: If root folder scripts use different ports, sync values in `.env` file.

---
## 💳 Real Payment Flow Testing

### Step 1 – Preparation
1. Open `http://localhost:8080` in browser.
2. Navigate to Dashboard (router /app or directly from landing "Start Building").
3. Connect Phantom wallet (Devnet). 
4. Get Devnet SOL + USDC from faucets.

USDC Mint (Devnet): `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

### Step 2 – Access 402-Required Endpoint
1. Select a low-fee endpoint from sidebar like "X402 Rewards" / "Leaderboard".
2. Click "Test Request (No Payment)" → Receive 402 response.

### Step 3 – Real Payment (Phantom)
1. After 402, green payment box appears.
2. Click "Pay with Phantom & Access Data".
3. Approve transaction details in Phantom popup.
4. Flow: Sign → broadcast → confirm → endpoint access.

### Step 4 – Result
- Toast: success + transaction signature.
- Explorer link (Devnet).
- Protected data (Leaderboard etc.) displayed in UI.

---
## 🔄 Payment Flow Diagram
```
User → 402 Response → Phantom Payment → Facilitator /verify → Sign → /settle → Confirm → Data Access
```

Detailed Sequential List:
1. Receive 402
2. Frontend prepares USDC transfer tx
3. Facilitator /verify (optional pre-check)
4. Phantom opens signing window for user
5. Facilitator /settle (broadcast or publish via Kora)
6. Blockchain confirmation
7. Protected endpoint called again (payment proof / signature)
8. Successful data display

---
## 🧪 Test Scenarios
### 1. Successful Payment
Expected: Data + signature + explorer link.
### 2. Insufficient Balance
Expected: "Insufficient funds" toast (simulation or send error). 
### 3. User Rejection
Expected: "User rejected" toast.
### 4. Network Error
Expected: "Network error" / retry suggestion.
### 5. PDA Recipient (Off-Curve)
Expected: Automatic manual token account creation instead of ATA error, successful transfer.

---
## ⚙️ Important `.env` Values

### Facilitator
```bash
PORT=3001
KORA_RPC_URL=http://localhost:8090
MOCK_MODE=false
SOLANA_RPC_URL=https://api.devnet.solana.com
NETWORK=solana-devnet
USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

### Frontend (Dashboard)
```bash
VITE_X402_FACILITATOR_URL=http://localhost:3001
VITE_VALIDATOR_API_URL=http://localhost:4021
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
VITE_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

> Add `VITE_PROGRAM_ID` if needed (for SPL-8004) and switch to mainnet mint when network changes.

---
## 🔒 Security Notes
Development:
- Mock RPC signing → Production requires real Kora RPC and signature verification.
- Devnet USDC; switch to `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` for mainnet.

Additional Production Requirements:
1. Real Kora RPC endpoint + auth
2. Rate limiting / DDoS protection
3. On-chain receipt & risk controls
4. SLA / retry policies

---
## 🛠 PDA Fallback Logic (Code Summary)
In Payments component:
```ts
const recipientIsOnCurve = PublicKey.isOnCurve(recipientPk.toBytes());
if (recipientIsOnCurve) {
  // Create idempotent ATA (invokes ATokenGPv… program)
} else {
  // SystemProgram.createAccount + createInitializeAccountInstruction
  // New token account owner = PDA; transfer to this account
}
```
Error Mapping:
- `Provided owner is not allowed` → If recipient is PDA, fallback now activates; informative toast shown to user.

---
## 📊 Example Successful Log
```
🔐 Kora Mock: Signing transaction for solana-devnet
📡 Kora Mock: Broadcasting transaction to solana-devnet
✅ Payment verified
💰 Settling payment...
✅ Payment settled: KORA_BROADCAST_1730752898_abc123
```

UI Example:
```json
{
  "status": 200,
  "data": {
    "data": [
      { "agentId": "alpha", "score": 9847 },
      { "agentId": "beta", "score": 9234 },
      { "agentId": "gamma", "score": 8956 }
    ]
  }
}
```

---
## 🎯 Next Steps
1. Payment history & pagination
2. Refund / dispute mechanism
3. Subscription (recurring payments)
4. Multi-token (SOL / USDT) support
5. Fee & routing optimization (multi-protocol router)

---
## ✅ Status
- Kora Mock RPC: Running (8090)
- Facilitator: Real mode (3001)
- Validator API: Running (4021)
- Frontend: Running (8080)
- PDA recipient fallback: Active
- End-to-end payment flow: Ready ✅

**Real payment flow is fully operational! 🎉 Test and provide feedback.**
