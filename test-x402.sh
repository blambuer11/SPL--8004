#!/bin/bash
# X402 Test Script for SPL-8004
# Bu scripti çalıştırmak için: chmod +x test-x402.sh && ./test-x402.sh

set -e

echo "🔍 X402 Payment Flow Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Facilitator health check
echo "1️⃣  Facilitator sağlık kontrolü (3001):"
curl -sS http://localhost:3001/health | jq
echo ""

# 2. Validator API health check
echo "2️⃣  Validator API sağlık kontrolü (4021):"
curl -sS http://localhost:4021/health | jq
echo ""

# 3. Test 402 requirement (without payment)
echo "3️⃣  Ödemesiz istek (402 bekliyoruz):"
curl -i http://localhost:4021/api/leaderboard 2>/dev/null | head -n 20
echo ""

# 4. Bypass test with header
echo "4️⃣  Header ile by-pass testi (leaderboard):"
curl -sS -H 'x-payment-response: ok' http://localhost:4021/api/leaderboard | jq
echo ""

# 5. Create submit payload
cat > /tmp/submit.json <<'EOF'
{
  "agentId": "demo-agent",
  "taskHash": "dGVzdC10YXNrLTEyMw==",
  "approved": true,
  "evidenceUri": "https://example.com/evidence"
}
EOF

echo "5️⃣  Validation submit testi (header ile by-pass):"
curl -sS -X POST http://localhost:4021/api/validations/submit \
  -H 'Content-Type: application/json' \
  -H 'x-payment-response: ok' \
  --data-binary @/tmp/submit.json | jq
echo ""

# 6. Facilitator verify endpoint (mock mode)
echo "6️⃣  Facilitator verify endpoint (Mock Mode):"
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
echo ""

# 7. Facilitator settle endpoint (mock mode)
echo "7️⃣  Facilitator settle endpoint (Mock Mode):"
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
echo ""

echo "✅ X402 test tamamlandı!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
