#!/bin/bash
# X404 NFT Bridge - Docker Build & Deploy Script

set -e

echo "🐳 Building X404 NFT Bridge with Docker..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build Docker image
echo -e "${BLUE}📦 Building Docker image...${NC}"
docker build -t x404-agent-nft:latest -f Dockerfile .

echo ""
echo -e "${GREEN}✅ Docker image built successfully!${NC}"
echo ""

# Run container to extract artifacts
echo -e "${BLUE}📤 Extracting build artifacts...${NC}"
docker create --name x404-temp x404-agent-nft:latest
docker cp x404-temp:/app/deploy ./build-output/
docker cp x404-temp:/app/idl ./build-output/
docker rm x404-temp

echo ""
echo -e "${GREEN}✅ Build artifacts extracted to ./build-output/${NC}"
echo ""

# Show build results
echo -e "${YELLOW}📊 Build Results:${NC}"
ls -lh build-output/deploy/
echo ""

# Display deployment instructions
echo -e "${BLUE}🚀 Deployment Instructions:${NC}"
echo ""
echo "1. Deploy to Devnet:"
echo "   solana program deploy build-output/deploy/x404_agent_nft.so \\"
echo "     --program-id HPwBe2UiSUEfJj6KZ2aSQcbcP8smb8H1F2t3nx5gU8tU \\"
echo "     --url devnet"
echo ""
echo "2. Verify deployment:"
echo "   solana program show HPwBe2UiSUEfJj6KZ2aSQcbcP8smb8H1F2t3nx5gU8tU --url devnet"
echo ""
echo "3. Use IDL in frontend:"
echo "   cp build-output/idl/x404_agent_nft.json ../src/idl/"
echo ""

echo -e "${GREEN}🎉 X404 NFT Bridge build complete!${NC}"
