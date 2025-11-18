# SPL-8004 X402 Facilitator

**Payment gateway for SPL-8004 Agent validation micropayments using X402 protocol**

## 🎯 Purpose

The X402 Facilitator enables gasless USDC micropayments for SPL-8004 agent validation submissions. It acts as a payment proxy between:

- **Agent Clients** (submit validations)
- **Validator API** (requires payment)
- **Kora RPC** (gasless transaction signing)
- **Solana Blockchain** (USDC transfers via SPL Token Program)

## 🏗️ Architecture

```
Agent Client
    ↓ Creates USDC transfer transaction
X402 Facilitator
    ↓ Verifies payment amount/recipient
Kora RPC
    ↓ Signs transaction (gasless)
Solana Blockchain
    ↓ Executes standard SPL token transfer
```

**Key Point:** No custom smart contract needed! Uses standard SPL Token Program.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd spl-8004-program/x402-facilitator
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Required
KORA_RPC_URL=http://localhost:8080
KORA_API_KEY=your_kora_api_key
SOLANA_RPC_URL=https://api.devnet.solana.com

# Optional (for mock mode testing)
MOCK_MODE=true
```

### 3. Run in Mock Mode (No Kora Required)

```bash
MOCK_MODE=true npm run dev
```

### 4. Run with Real Kora

```bash
# Start Kora RPC first (see Kora setup docs)
kora --config kora.toml

# Then start facilitator
npm run dev
```

## 📡 API Endpoints

### GET /supported

Returns facilitator capabilities

**Response:**
```json
{
  "version": "0.0.1",
  "network": "solana-devnet",
  "paymentScheme": "exact",
  "feePayer": "KoraSignerAddress...",
  "tokens": [
    {
      "mint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
      "symbol": "USDC",
      "decimals": 6
    }
  ]
}
```

### POST /verify

Verify payment without broadcasting

**Request:**
```json
{
  "version": "0.0.1",
  "network": "solana-devnet",
  "transaction": "BASE64_ENCODED_TRANSACTION",
  "metadata": {
    "endpoint": "/api/validations/submit",
    "amount": "0.001",
    "recipient": "TREASURY_ADDRESS"
  }
}
```

**Response:**
```json
{
  "isValid": true,
  "network": "solana-devnet",
  "amount": "0.001",
  "recipient": "TREASURY_ADDRESS"
}
```

### POST /settle

Sign and broadcast payment

**Request:** Same as `/verify`

**Response:**
```json
{
  "success": true,
  "signature": "5ULZp...WmprUf",
  "network": "solana-devnet",
  "explorerUrl": "https://explorer.solana.com/tx/5ULZp...WmprUf?cluster=devnet"
}
```

### GET /health

Health check

**Response:**
```json
{
  "status": "ok",
  "service": "spl-8004-x402-facilitator",
  "mockMode": false,
  "network": "solana-devnet"
}
```

## 🧪 Testing

### Mock Mode Test
```bash
# Terminal 1: Start facilitator
MOCK_MODE=true npm run dev

# Terminal 2: Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/supported
```

### Real Kora Test
```bash
# Terminal 1: Start Kora
cd kora
kora --config kora.toml

# Terminal 2: Start facilitator
npm run dev

# Terminal 3: Test payment flow
npm run test:payment
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Facilitator server port |
| `KORA_RPC_URL` | Yes | `http://localhost:8080` | Kora RPC endpoint |
| `KORA_API_KEY` | Yes | - | Kora API key |
| `SOLANA_RPC_URL` | Yes | `https://api.devnet.solana.com` | Solana RPC endpoint |
| `NETWORK` | No | `solana-devnet` | Network identifier |
| `USDC_MINT` | No | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` | USDC token mint |
| `MOCK_MODE` | No | `false` | Enable mock mode (no Kora) |

### Kora Configuration

See [Kora Setup Guide](../docs/KORA_SETUP.md) for detailed Kora configuration.

## 🐛 Troubleshooting

### Error: "Kora connection failed"

```bash
# Check Kora is running
curl http://localhost:8080/health

# Check API key matches kora.toml
grep api_key kora/kora.toml
```

### Error: "Transaction validation failed"

- Verify USDC mint address matches network (devnet/mainnet)
- Check transaction is properly serialized as base64
- Ensure recipient address is valid

### Mock Mode Not Working

```bash
# Explicitly enable mock mode
export MOCK_MODE=true
npm run dev
```

## 📚 Integration

See [Agent Client Integration](../docs/AGENT_CLIENT.md) for how to use this facilitator in your agent code.

## 🔗 Related

- [SPL-8004 Program](../spl-8004/)
- [Validator API](../validator-api/)
- [Kora Documentation](https://github.com/solana-foundation/kora)

## 📄 License

MIT
