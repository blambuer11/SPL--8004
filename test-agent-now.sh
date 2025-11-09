#!/bin/bash
# Test agent auto-pay in separate process

echo "🧪 Testing Agent Auto-Pay..."
echo ""

# Wait for services
sleep 2

# Test 1: Agent list
echo "1️⃣ Agent List:"
curl -sS http://localhost:4021/agent/list 2>/dev/null | jq -r '.agents[] | "   \(.agentId): \(.publicKey)"'
echo ""

# Test 2: Auto-pay (leaderboard - 0.0001 USDC)
echo "2️⃣ Auto-pay test (leaderboard - 0.0001 USDC):"
RESPONSE=$(curl -sS -X POST http://localhost:4021/agent/auto-pay \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "alpha",
    "targetEndpoint": "/api/leaderboard",
    "priceUsd": 0.0001
  }' 2>/dev/null)

echo "$RESPONSE" | jq .

if echo "$RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
  echo ""
  echo "✅ Payment successful!"
  SIG=$(echo "$RESPONSE" | jq -r '.signature')
  echo "   Signature: $SIG"
  echo "   Explorer: https://explorer.solana.com/tx/$SIG?cluster=devnet"
else
  echo ""
  echo "❌ Payment failed!"
  echo "$RESPONSE" | jq -r '.error // "Unknown error"'
fi

echo ""
echo "Done!"
