#!/bin/bash

# Noema Protocol - GitHub Repository Creation Script
# This script helps create all individual protocol repositories on GitHub

set -e

echo "🚀 Noema Protocol - GitHub Repository Setup"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# GitHub organization
ORG="NoemaProtocol"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI not found. Installing...${NC}"
    echo "Visit: https://cli.github.com/"
    echo "Or run: brew install gh"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to GitHub CLI${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
echo ""

# Repository definitions
# Format: "repo-name|description|topics"
repos=(
    "SPL-8004|Core identity and reputation protocol for AI agents on Solana|solana,blockchain,identity,reputation,ai-agents,anchor,rust"
    "X402-Protocol|Autonomous micropayment protocol via HTTP 402 standard|solana,payments,micropayments,http-402,usdc,blockchain,web3"
    "X404-Bridge|Hybrid NFT-Token protocol with automatic conversion mechanics|solana,nft,hybrid,tokens,blockchain,beta,defi"
    "Noema-SDK|Unified TypeScript SDK for all Noema Protocol services|typescript,sdk,solana,web3,npm,api,javascript"
    "Noema-Dashboard|Full-featured web management interface for Noema Protocol|react,vite,tailwindcss,web3,dashboard,solana,typescript"
    "Noema-Staking|Validator staking and reward distribution system for NOEMA token|solana,staking,defi,validators,rewards,anchor,rust"
    "Noema-Docs|Comprehensive documentation, guides, and API references|documentation,guides,api-reference,tutorials,markdown"
    "Noema-Examples|Code examples, integration templates, and demo applications|examples,templates,demos,tutorials,code-samples"
    "Noema-Audits|Security audits, reports, and bug bounty program|security,audits,bug-bounty,smart-contracts,blockchain"
    "Noema-Governance|DAO governance proposals, voting, and community decisions|dao,governance,voting,proposals,community"
)

# Function to create repository
create_repo() {
    local repo_name=$1
    local description=$2
    local topics=$3
    
    echo -e "${BLUE}Creating repository: ${repo_name}${NC}"
    
    # Create repository
    gh repo create "${ORG}/${repo_name}" \
        --public \
        --description "${description}" \
        --confirm || {
        echo -e "${YELLOW}⚠️  Repository ${repo_name} might already exist${NC}"
        return 1
    }
    
    # Add topics
    IFS=',' read -ra TOPIC_ARRAY <<< "$topics"
    for topic in "${TOPIC_ARRAY[@]}"; do
        gh repo edit "${ORG}/${repo_name}" --add-topic "${topic}" || true
    done
    
    echo -e "${GREEN}✅ Created: ${repo_name}${NC}"
    echo ""
    
    return 0
}

# Main execution
echo "📦 Will create ${#repos[@]} repositories..."
echo ""

created=0
skipped=0

for repo_def in "${repos[@]}"; do
    IFS='|' read -r repo_name description topics <<< "$repo_def"
    
    if create_repo "$repo_name" "$description" "$topics"; then
        ((created++))
    else
        ((skipped++))
    fi
done

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Repository creation complete!${NC}"
echo ""
echo "Summary:"
echo "  - Created: $created repositories"
echo "  - Skipped: $skipped repositories"
echo ""
echo "Next steps:"
echo "  1. Visit https://github.com/${ORG}"
echo "  2. Configure repository settings"
echo "  3. Add README files from .github/REPOS/"
echo "  4. Enable GitHub Pages, Discussions, Wikis"
echo "  5. Setup branch protection rules"
echo ""
echo "📚 See .github/MULTI_REPO_SETUP_GUIDE.md for detailed instructions"
