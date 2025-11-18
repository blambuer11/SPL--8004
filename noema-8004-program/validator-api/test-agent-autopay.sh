#!/bin/bash
# Test Agent Auto-Pay Endpoint

VALIDATOR_API="http://localhost:4021"

echo "🧪 Testing Agent Auto-Pay"
echo "========================="
echo ""

# 1. List available agents
echo "1️⃣ Listing available agents..."
curl -sS "$VALIDATOR_API/agent/list" | jq .
echo ""

# 2. Test auto-pay for agent alpha (leaderboard)
echo "2️⃣ Agent ALPHA - Auto-pay for leaderboard (0.0001 USDC)..."
curl -sS -X POST "$VALIDATOR_API/agent/auto-pay" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "alpha",
    "targetEndpoint": "/api/leaderboard",
    "priceUsd": 0.0001
  }' | jq .
echo ""

# 3. Test auto-pay for agent beta (submit validation)
echo "3️⃣ Agent BETA - Auto-pay for submit validation (0.001 USDC)..."
curl -sS -X POST "$VALIDATOR_API/agent/auto-pay" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "beta",
    "targetEndpoint": "/api/validations/submit",
    "priceUsd": 0.001
  }' | jq .
echo ""

echo "✅ Test completed!"
echo ""
echo "💡 Tips:"
echo "  - Check agent wallet balances on Devnet Explorer"
echo "  - View transaction signatures on explorer"
echo "  - Ensure agents have USDC in their wallets"
