# Agent Autonomous Payment System

## Overview
Agentlar artık **otonom olarak** USDC mikro-ödemeleri yapabilir. Phantom wallet onayı gerekmez; agent keypair ile otomatik ödeme.

## Architecture

```
Agent Backend
  ↓ (402 Payment Required)
POST /agent/auto-pay
  ↓
Agent Keypair → Transaction Build → ATA Check
  ↓
Kora RPC (Gasless)
  ↓
Solana Devnet (USDC Transfer)
  ↓
Signature → Continue with Protected Endpoint
```

## Setup

### 1. Generate Agent Keypairs

```bash
# Generate new keypair
solana-keygen new --no-bip39-passphrase --outfile agent-alpha.json

# Get base58 private key
solana-keygen pubkey agent-alpha.json  # Public key
cat agent-alpha.json | jq -r '[.[]]' | python3 -c "import sys, json, base58; print(base58.b58encode(bytes(json.load(sys.stdin))).decode())"
```

### 2. Add to .env

```properties
AGENT_ALPHA_KEY=<base58_private_key>
AGENT_BETA_KEY=<base58_private_key>
AGENT_GAMMA_KEY=<base58_private_key>
```

### 3. Fund Agent Wallets

```bash
# Get public key from .env or logs
# Fund with Devnet SOL (for fees)
solana airdrop 1 <AGENT_PUBLIC_KEY> --url devnet

# Fund with Devnet USDC (for payments)
# Use Devnet USDC faucet or transfer from another wallet
```

## API Endpoints

### POST /agent/auto-pay
Agent autonomous payment

**Request:**
```json
{
  "agentId": "alpha",
  "targetEndpoint": "/api/leaderboard",
  "priceUsd": 0.0001
}
```

**Response (Success):**
```json
{
  "success": true,
  "agentId": "alpha",
  "signature": "5xZ...",
  "explorerUrl": "https://explorer.solana.com/tx/...",
  "amount": 0.0001,
  "targetEndpoint": "/api/leaderboard"
}
```

**Response (Error - No Keypair):**
```json
{
  "error": "Agent keypair not found: alpha",
  "availableAgents": ["beta", "gamma"]
}
```

### GET /agent/list
List loaded agent keypairs

**Response:**
```json
{
  "agents": [
    { "agentId": "alpha", "publicKey": "ABC..." },
    { "agentId": "beta", "publicKey": "DEF..." }
  ],
  "count": 2
}
```

## Testing

```bash
# List agents
curl http://localhost:4021/agent/list

# Test auto-pay
curl -X POST http://localhost:4021/agent/auto-pay \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "alpha",
    "targetEndpoint": "/api/leaderboard",
    "priceUsd": 0.0001
  }'

# Run test script
./test-agent-autopay.sh
```

## Agent Integration Example

```typescript
// Agent autonomous workflow
async function agentLoop() {
  while (true) {
    // Try to access protected endpoint
    const response = await fetch('http://localhost:4021/api/leaderboard');
    
    if (response.status === 402) {
      // Payment required - auto-pay
      const requirement = await response.json();
      
      const paymentResult = await fetch('http://localhost:4021/agent/auto-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'alpha',
          targetEndpoint: '/api/leaderboard',
          priceUsd: requirement.requirement.priceUsd
        })
      });
      
      const { signature } = await paymentResult.json();
      console.log('✅ Payment done:', signature);
      
      // Retry with payment header
      const dataResponse = await fetch('http://localhost:4021/api/leaderboard', {
        headers: { 'x-payment-response': signature }
      });
      
      const data = await dataResponse.json();
      console.log('📊 Data:', data);
    }
    
    await sleep(60000); // Loop every minute
  }
}
```

## Kora Integration

### Mock Mode (Development)
- Kora Mock RPC on `localhost:8090`
- Simulates gasless transactions
- Returns mock signatures

### Production Mode
```properties
# .env
KORA_RPC_URL=https://api.kora.network
KORA_API_KEY=<your_production_api_key>
```

Kora endpoints:
- POST `/v1/transactions/sign` - Sign without broadcast
- POST `/v1/transactions/send` - Sign and broadcast (gasless)
- GET `/v1/payer/address` - Get fee payer address

## Cost Comparison

| Model | SOL Fee | USDC Cost | Latency | Use Case |
|-------|---------|-----------|---------|----------|
| **Phantom (Manual)** | ~0.000005 | 0.0001-0.001 | 5-30s | Human users |
| **Agent Keypair + Kora** | 0 (gasless) | 0.0001-0.001 | <1s | **Autonomous agents** |
| **Backend Pool** | ~0.000005 | 0.0001-0.001 | <1s | Centralized (tracking hard) |

## Security

- ✅ Each agent has isolated keypair
- ✅ Private keys stored in `.env` (gitignored)
- ✅ Kora API key required for production
- ✅ Auditability: All payments on-chain
- ⚠️ Production: Use HSM/Vault for keypair storage
- ⚠️ Production: Rate limiting on `/agent/auto-pay`

## Troubleshooting

### "Agent keypair not found"
- Check `.env` has `AGENT_<NAME>_KEY`
- Verify base58 encoding is correct
- Restart validator-api after adding keys

### "Insufficient funds"
- Agent wallet needs Devnet SOL (for ATA creation)
- Agent wallet needs Devnet USDC (for payments)
- Check balances: `solana balance <pubkey> --url devnet`

### "Kora broadcast failed"
- Check Kora Mock RPC is running (port 8090)
- For production: Verify KORA_API_KEY
- Check transaction size < 1232 bytes

## Next Steps

1. **Mainnet Migration**
   - Use real Kora production API
   - Update USDC mint to mainnet
   - Deploy with HSM for keypair storage

2. **Agent Loop**
   - Implement retry logic
   - Add payment receipt caching
   - Monitor wallet balances

3. **Monitoring**
   - Agent payment dashboard
   - Alert on low USDC balance
   - Track success/failure rates
