#!/bin/bash

# ==============================================================================
# Noema Protocol - Complete Deployment Script
# ==============================================================================
# Deploys all 4 programs: SPL-ACP, SPL-TAP, SPL-FCP, X402 Facilitator
# Usage: ./deploy-all.sh [devnet|mainnet] [wallet-path]
# Example: ./deploy-all.sh devnet ~/.config/solana/id.json
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NETWORK=${1:-devnet}
WALLET=${2:-~/.config/solana/id.json}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Noema Protocol - Smart Contract Deployment Suite      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Validate network
if [[ "$NETWORK" != "devnet" && "$NETWORK" != "mainnet" ]]; then
    echo -e "${RED}❌ Invalid network: $NETWORK${NC}"
    echo "Usage: ./deploy-all.sh [devnet|mainnet] [wallet-path]"
    exit 1
fi

# Check if wallet exists
if [[ ! -f "$WALLET" ]]; then
    echo -e "${RED}❌ Wallet not found: $WALLET${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "   Network: $NETWORK"
echo "   Wallet: $WALLET"
echo "   Root Dir: $ROOT_DIR"
echo ""

# Set Solana config
solana config set --url "$NETWORK"
solana config set --keypair "$WALLET"

# Check balance
BALANCE=$(solana balance | awk '{print $1}')
echo -e "${YELLOW}💰 Wallet Balance: ${BALANCE} SOL${NC}"

if (( $(echo "$BALANCE < 5" | bc -l) )); then
    echo -e "${RED}⚠️  Warning: Low balance. You need at least 5 SOL for deployment.${NC}"
    if [[ "$NETWORK" == "devnet" ]]; then
        echo "   Run: solana airdrop 5"
    fi
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Phase 1: Building Programs${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""

PROGRAMS=("spl-acp" "spl-tap" "spl-fcp")

for PROGRAM in "${PROGRAMS[@]}"; do
    echo -e "${BLUE}🔨 Building $PROGRAM...${NC}"
    cd "$ROOT_DIR/$PROGRAM"
    
    if [[ ! -f "Cargo.toml" ]]; then
        echo -e "${RED}❌ Cargo.toml not found for $PROGRAM${NC}"
        exit 1
    fi
    
    anchor build
    
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ Build failed for $PROGRAM${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ $PROGRAM built successfully${NC}"
    echo ""
done

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Phase 2: Deploying Programs${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""

# Create output file for program IDs
ENV_FILE="$ROOT_DIR/.env.deployed"
> "$ENV_FILE"
echo "# Noema Protocol - Deployed Program IDs" >> "$ENV_FILE"
echo "# Generated: $(date)" >> "$ENV_FILE"
echo "# Network: $NETWORK" >> "$ENV_FILE"
echo "" >> "$ENV_FILE"

for PROGRAM in "${PROGRAMS[@]}"; do
    echo -e "${BLUE}🚀 Deploying $PROGRAM to $NETWORK...${NC}"
    cd "$ROOT_DIR/$PROGRAM"
    
    # Deploy
    DEPLOY_OUTPUT=$(anchor deploy --provider.cluster "$NETWORK" 2>&1)
    
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ Deployment failed for $PROGRAM${NC}"
        echo "$DEPLOY_OUTPUT"
        exit 1
    fi
    
    # Extract program ID
    PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | grep -o "Program Id: [A-Za-z0-9]*" | awk '{print $3}')
    
    if [[ -z "$PROGRAM_ID" ]]; then
        echo -e "${YELLOW}⚠️  Could not extract program ID for $PROGRAM${NC}"
        PROGRAM_ID="<not_found>"
    fi
    
    echo -e "${GREEN}✅ $PROGRAM deployed: $PROGRAM_ID${NC}"
    
    # Save to .env file
    PROGRAM_UPPER=$(echo "$PROGRAM" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
    echo "VITE_${PROGRAM_UPPER}_PROGRAM_ID=$PROGRAM_ID" >> "$ENV_FILE"
    echo "NEXT_PUBLIC_${PROGRAM_UPPER}_PROGRAM_ID=$PROGRAM_ID" >> "$ENV_FILE"
    echo "" >> "$ENV_FILE"
done

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Phase 3: Verification${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}📊 Verifying deployments...${NC}"
echo ""

for PROGRAM in "${PROGRAMS[@]}"; do
    cd "$ROOT_DIR/$PROGRAM"
    
    # Get program ID from target/deploy
    PROGRAM_SO=$(echo "$PROGRAM" | tr '-' '_')
    KEYPAIR_FILE="target/deploy/${PROGRAM_SO}-keypair.json"
    
    if [[ -f "$KEYPAIR_FILE" ]]; then
        PROGRAM_ID=$(solana-keygen pubkey "$KEYPAIR_FILE")
        ACCOUNT_INFO=$(solana account "$PROGRAM_ID" 2>&1)
        
        if echo "$ACCOUNT_INFO" | grep -q "Executable: true"; then
            echo -e "${GREEN}✅ $PROGRAM verified (Executable)${NC}"
        else
            echo -e "${YELLOW}⚠️  $PROGRAM may not be executable${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Keypair not found for $PROGRAM${NC}"
    fi
done

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📝 Program IDs saved to: ${ENV_FILE}${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "   1. Run initialization script:"
echo "      cd scripts && npm install && ts-node initialize-all.ts"
echo ""
echo "   2. Update your .env file with program IDs from:"
echo "      cat $ENV_FILE"
echo ""
echo "   3. Test the programs:"
echo "      npm run test"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Noema Protocol is ready for testing on $NETWORK! 🚀      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
