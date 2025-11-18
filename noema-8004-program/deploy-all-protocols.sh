#!/bin/bash

# SPL-X Protocols Deploy Script
# Deploy SPL-ACP, SPL-TAP, SPL-FCP to Solana Devnet

set -e

echo "🚀 Deploying SPL-X Protocol Standards to Devnet..."
echo "================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Solana cluster
echo -e "${BLUE}📡 Checking Solana connection...${NC}"
solana config get
echo ""

# Deploy SPL-ACP (Agent Communication Protocol)
echo -e "${GREEN}1️⃣  SPL-ACP (Agent Communication Protocol)${NC}"
echo "-------------------------------------------"
cd spl-acp
echo "Building SPL-ACP..."
if ~/.cargo/bin/anchor build 2>&1 | tee /tmp/spl-acp-build.log; then
    echo -e "${GREEN}✅ Build successful${NC}"
    
    echo "Deploying to Devnet..."
    if ~/.cargo/bin/anchor deploy --provider.cluster devnet 2>&1 | tee /tmp/spl-acp-deploy.log; then
        echo -e "${GREEN}✅ SPL-ACP deployed successfully!${NC}"
        PROGRAM_ID=$(solana address -k target/deploy/spl_acp-keypair.json)
        echo -e "${YELLOW}Program ID: ${PROGRAM_ID}${NC}"
    else
        echo -e "${YELLOW}⚠️  Deploy skipped or failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Build failed, check logs${NC}"
fi
cd ..
echo ""

# Deploy SPL-TAP (Tool Attestation Protocol)
echo -e "${GREEN}2️⃣  SPL-TAP (Tool Attestation Protocol)${NC}"
echo "----------------------------------------"
cd spl-tap
echo "Building SPL-TAP..."
if ~/.cargo/bin/anchor build 2>&1 | tee /tmp/spl-tap-build.log; then
    echo -e "${GREEN}✅ Build successful${NC}"
    
    echo "Deploying to Devnet..."
    if ~/.cargo/bin/anchor deploy --provider.cluster devnet 2>&1 | tee /tmp/spl-tap-deploy.log; then
        echo -e "${GREEN}✅ SPL-TAP deployed successfully!${NC}"
        PROGRAM_ID=$(solana address -k target/deploy/spl_tap-keypair.json)
        echo -e "${YELLOW}Program ID: ${PROGRAM_ID}${NC}"
    else
        echo -e "${YELLOW}⚠️  Deploy skipped or failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Build failed, check logs${NC}"
fi
cd ..
echo ""

# Deploy SPL-FCP (Function Call Protocol)
echo -e "${GREEN}3️⃣  SPL-FCP (Function Call Protocol)${NC}"
echo "-------------------------------------"
cd spl-fcp
echo "Building SPL-FCP..."
if ~/.cargo/bin/anchor build 2>&1 | tee /tmp/spl-fcp-build.log; then
    echo -e "${GREEN}✅ Build successful${NC}"
    
    echo "Deploying to Devnet..."
    if ~/.cargo/bin/anchor deploy --provider.cluster devnet 2>&1 | tee /tmp/spl-fcp-deploy.log; then
        echo -e "${GREEN}✅ SPL-FCP deployed successfully!${NC}"
        PROGRAM_ID=$(solana address -k target/deploy/spl_fcp-keypair.json)
        echo -e "${YELLOW}Program ID: ${PROGRAM_ID}${NC}"
    else
        echo -e "${YELLOW}⚠️  Deploy skipped or failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Build failed, check logs${NC}"
fi
cd ..
echo ""

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "📝 Summary:"
echo "  - SPL-ACP: Agent Communication & Capability Registry"
echo "  - SPL-TAP: Tool Attestation & Verification"
echo "  - SPL-FCP: Function Call Consensus & Validation"
echo ""
echo "Check logs in /tmp/spl-*-*.log for details"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Initialize each protocol config on-chain"
echo "2. Update frontend with new program IDs"
echo "3. Test protocol interactions"
