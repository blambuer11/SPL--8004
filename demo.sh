#!/bin/bash

# SPL-8004 X402 Demo Script
# Quick test of X402 payment flow

set -e

echo "🚀 SPL-8004 + X402 Payment Integration Demo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "${BLUE}[1/5] Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker"
    exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# Setup environment
echo "${BLUE}[2/5] Setting up environment...${NC}"

if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "${YELLOW}⚠️  Please edit .env with your configuration${NC}"
fi

if [ ! -f "spl-8004-program/x402-facilitator/.env" ]; then
    echo "Creating facilitator .env..."
    cd spl-8004-program/x402-facilitator
    cp .env.example .env
    echo "MOCK_MODE=true" >> .env
    cd ../..
fi

echo "✅ Environment configured"
echo ""

# Install dependencies
echo "${BLUE}[3/5] Installing dependencies...${NC}"

echo "Installing facilitator dependencies..."
cd spl-8004-program/x402-facilitator
npm install --silent
cd ../..

echo "Installing frontend dependencies..."
cd agent-aura-sovereign
npm install --silent
cd ..

echo "✅ Dependencies installed"
echo ""

# Start services
echo "${BLUE}[4/5] Starting services...${NC}"

echo "Starting X402 Facilitator (Mock Mode)..."
cd spl-8004-program/x402-facilitator
MOCK_MODE=true npm run dev &
FACILITATOR_PID=$!
cd ../..

# Wait for facilitator to start
echo "Waiting for facilitator..."
sleep 3

# Check health
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo "${GREEN}✅ Facilitator running on http://localhost:3000${NC}"
else
    echo "❌ Facilitator failed to start"
    kill $FACILITATOR_PID 2>/dev/null || true
    exit 1
fi

echo ""

echo "Starting Frontend..."
cd agent-aura-sovereign
npm run dev -- --port 8082 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "Waiting for frontend..."
sleep 5

echo ""
echo "${GREEN}✅ All services running!${NC}"
echo ""

# Display info
echo "${BLUE}[5/5] Service Information${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Frontend:    http://localhost:8082"
echo "💰 Facilitator: http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 ${YELLOW}Next Steps:${NC}"
echo "1. Open http://localhost:8082 in your browser"
echo "2. Connect Phantom/Solflare wallet"
echo "3. Ensure you have devnet USDC: https://faucet.circle.com/"
echo "4. Navigate to 'Validation' page"
echo "5. Submit a validation (will trigger X402 payment flow)"
echo ""
echo "🧪 ${YELLOW}Mock Mode:${NC} Facilitator is running in mock mode"
echo "   - Payments are simulated (no blockchain transactions)"
echo "   - Perfect for testing the X402 flow"
echo ""
echo "🔍 ${YELLOW}View Logs:${NC}"
echo "   Facilitator: tail -f spl-8004-program/x402-facilitator/facilitator.log"
echo ""
echo "🛑 ${YELLOW}Stop Services:${NC} Press Ctrl+C"
echo ""

# Wait for user interrupt
trap "echo ''; echo 'Stopping services...'; kill $FACILITATOR_PID $FRONTEND_PID 2>/dev/null || true; exit 0" INT

wait
