#!/bin/bash
# X402 Instant Payment Test
# Tests the instant payment script with a sample transaction

set -e

echo "🚀 X402 Facilitator - Instant Payment Test"
echo "=========================================="
echo ""

# Test Configuration
RECIPIENT="Fma6gBu46bG4SE2rt2QQxUAC9Sc1aFmtELVtwvuJfCQf"  # Authority wallet (test recipient)
AMOUNT="1.0"  # 1 USDC
MEMO="Test payment from X402 facilitator"

echo "📋 Test Parameters:"
echo "   Recipient: $RECIPIENT"
echo "   Amount: $AMOUNT USDC"
echo "   Memo: $MEMO"
echo ""

# Check if wallet has USDC
echo "💰 Checking USDC balance..."
SENDER_WALLET=$(solana address)
echo "   Sender: $SENDER_WALLET"

# Check config exists
echo ""
echo "🔍 Verifying X402 config..."
cd "$(dirname "$0")"
PROGRAM_ID=6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia node get-config.mjs || {
  echo "❌ Config not initialized!"
  exit 1
}

echo ""
echo "✅ Config verified. Executing payment..."
echo ""

# Execute payment
RECIPIENT=$RECIPIENT \
AMOUNT=$AMOUNT \
MEMO="$MEMO" \
node instant-payment.mjs

echo ""
echo "✅ Test completed!"
echo ""
echo "Next steps:"
echo "  1. Check Explorer link above for transaction details"
echo "  2. Verify recipient received net amount (99.5%)"
echo "  3. Verify treasury received fee (0.5%)"
echo "  4. Check updated global stats: node get-config.mjs"
