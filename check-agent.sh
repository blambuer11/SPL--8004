#!/bin/bash
# Quick agent test

echo "Waiting for validator-api..."
sleep 3

echo "=== Agent List ==="
curl -sS http://localhost:4021/agent/list | jq .
echo ""

echo "=== Agent Balance ==="
solana balance QNdNJYFax8JPDxr5gPZeXhA3StiRKBHqSBmAQNA8nbp --url devnet
echo ""

echo "✅ Agent alpha hazır!"
echo "Public Key: QNdNJYFax8JPDxr5gPZeXhA3StiRKBHqSBmAQNA8nbp"
echo ""
echo "Next: Agent alpha'ya Devnet USDC gönder (mikro-ödemeler için)"
