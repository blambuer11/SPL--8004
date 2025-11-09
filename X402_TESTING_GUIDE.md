# X402 TESTING GUIDE

## 🚀 STARTUP STEPS

### 1. Start Backend Services

#### Terminal 1: Facilitator
```bash
cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/x402-facilitator
npm run dev
```
**Expected output:**
```
🚀 SPL-8004 X402 Facilitator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on http://localhost:3001
🌐 Network: solana-devnet
🧪 Mock Mode: ENABLED
```

#### Terminal 2: Validator API
```bash
cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/validator-api
npm run dev
```
**Expected output:**
```
[validator-api] listening on http://localhost:4021
```

### 2. Start Frontend

#### Terminal 3: Frontend
```bash
cd /Users/bl10buer/Desktop/sp8004/SPL--8004
npm run dev
```
**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 🧪 TEST STEPS

### Step 1: Open in Browser
1. Navigate to `http://localhost:5173` in your browser
2. Click on **Dashboard** page (`/app`)

### Step 2: Connect Wallet
1. Click **Connect Wallet** button
2. Select **Phantom Wallet**
3. Approve connection
4. Ensure you're on **Devnet** network

### Step 3: Request Devnet SOL
1. If balance is 0 SOL:
   - Visit [https://faucet.solana.com](https://faucet.solana.com)
   - Paste your wallet address
   - Request 2 SOL
   - Wait ~30 seconds

### Step 4: Register Agent
1. Click **Register New Agent** button
2. Fill in the form:
   - **Agent ID**: `test-agent-001` (or any unique ID)
   - **Metadata URI**: `https://example.com/metadata.json` (or any valid URL)
3. Click **Register**
4. Approve transaction in Phantom
5. Wait for confirmation (~2-5 seconds)
6. See success message: "✅ Agent registered successfully!"

### Step 5: Test X402 Payment
1. Click on the registered agent card
2. In agent details, click **Test X402 Payment**
3. Modal opens with payment details:
   - **Price**: 0.01 USDC (mock)
   - **Endpoint**: Protected resource
4. Click **Make Payment**
5. Transaction processed in mock mode
6. See success: "✅ Payment successful!"
7. Protected data displayed

---

## ✅ EXPECTED RESULTS

### Agent Registration
```json
{
  "success": true,
  "agentId": "test-agent-001",
  "address": "...",
  "signature": "...",
  "explorerUrl": "https://explorer.solana.com/tx/..."
}
```

### X402 Payment
```json
{
  "success": true,
  "signature": "mock_sig_...",
  "amount": 0.01,
  "currency": "USDC",
  "timestamp": 1699...,
  "protectedData": {
    "message": "Premium content accessed",
    "data": [...]
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Facilitator not running"
**Solution:**
```bash
cd spl-8004-program/x402-facilitator
npm install
npm run dev
```
Check port 3001 is free: `lsof -i :3001`

### Issue: "Validator API not responding"
**Solution:**
```bash
cd spl-8004-program/validator-api
npm install
npm run dev
```
Check port 4021 is free: `lsof -i :4021`

### Issue: "Transaction failed"
**Possible causes:**
1. Insufficient SOL balance
2. Wrong network (must be Devnet)
3. RPC rate limiting

**Solution:**
- Request more SOL from faucet
- Verify Phantom is on Devnet
- Wait 30 seconds and retry

### Issue: "Agent ID already exists"
**Solution:**
Use a different agent ID, e.g., `test-agent-002`

---

## 📊 MOCK MODE

In development, X402 payments run in **mock mode**:

- ✅ No real USDC required
- ✅ Instant confirmations
- ✅ Simulated blockchain transactions
- ✅ Full flow demonstration

**To enable real payments:**
1. Set `MOCK_MODE=false` in facilitator `.env`
2. Configure USDC mint address
3. Ensure agents have USDC balance
4. Deploy to Devnet/Mainnet

---

## 🔗 USEFUL LINKS

- **Facilitator API**: http://localhost:3001
- **Validator API**: http://localhost:4021
- **Frontend**: http://localhost:5173
- **Solana Explorer**: https://explorer.solana.com/?cluster=devnet
- **Faucet**: https://faucet.solana.com

---

## 📝 NOTES

- Mock mode is enabled by default for development
- All transactions are on Solana Devnet
- USDC payments are simulated in mock mode
- Real payments require USDC tokens on Devnet
- For production, deploy to Mainnet and disable mock mode

---

**Happy Testing! 🚀**
