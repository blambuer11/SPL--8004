# X404 NFT Bridge

Convert SPL-8004 agent identities into tradeable NFTs with dynamic reputation-based pricing.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker installed
- Solana CLI installed (for deployment)
- Keypair with SOL for deployment fees

### Build with Docker

```bash
# Make build script executable
chmod +x build-docker.sh

# Build X404 program using Docker
./build-docker.sh
```

This will:
1. Build the Anchor program in a Docker container
2. Extract the compiled `.so` file and IDL
3. Save artifacts to `build-output/`

### Deploy to Devnet

```bash
# Deploy the program
solana program deploy build-output/deploy/x404_agent_nft.so \
  --program-id HPwBe2UiSUEfJj6KZ2aSQcbcP8smb8H1F2t3nx5gU8tU \
  --url devnet

# Verify deployment
solana program show HPwBe2UiSUEfJj6KZ2aSQcbcP8smb8H1F2t3nx5gU8tU --url devnet
```

## 📦 Features

### Tokenize Agent
Convert any SPL-8004 agent into an NFT:
```typescript
await bridge.tokenizeAgent(agentId, initialPrice, metadataUri);
```

### Sync Reputation
Update NFT price based on agent reputation:
```typescript
await bridge.syncReputation(nftPubkey, newReputationScore);
```

### List for Sale
Put your agent NFT on the marketplace:
```typescript
await bridge.listForSale(nftPubkey, price);
```

### Purchase NFT
Buy a listed agent NFT:
```typescript
await bridge.purchase(nftPubkey, sellerPubkey);
```

## 🏗️ Architecture

```
┌─────────────────┐       ┌──────────────┐       ┌─────────────┐
│  SPL-8004       │       │   X404       │       │  Metaplex   │
│  Agent Registry │──────▶│   Bridge     │──────▶│  Metadata   │
└─────────────────┘       └──────────────┘       └─────────────┘
        │                         │                       │
        │                         │                       │
        ▼                         ▼                       ▼
   Reputation              Dynamic Pricing          NFT Metadata
```

## 🔧 Manual Build (without Docker)

If you prefer building locally:

```bash
# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli

# Build program
anchor build

# Deploy
anchor deploy --provider.cluster devnet
```

## 📝 Program ID

**Devnet**: `HPwBe2UiSUEfJj6KZ2aSQcbcP8smb8H1F2t3nx5gU8tU`

## 🧪 Testing

```bash
# Run tests
anchor test

# Test specific function
anchor test -- --grep "tokenize_agent"
```

## 📚 Documentation

See [X404_INTEGRATION_PLAN.md](../X404_INTEGRATION_PLAN.md) for detailed integration guide.

## 🤝 Integration with SPL-8004

X404 reads reputation data from SPL-8004 agents:

```rust
// In SPL-8004
pub struct Agent {
    pub reputation: Reputation,
    // ...
}

// In X404
pub fn sync_reputation(new_score: u32) {
    nft.reputation_score = new_score;
    nft.price = calculate_price_from_reputation(new_score);
}
```

## 💡 Dynamic Pricing Formula

```
Base Price = 0.1 SOL
Final Price = Base Price × (Reputation Score / 5000)

Examples:
- 5000 score = 0.1 SOL (1x)
- 10000 score = 0.2 SOL (2x)
- 20000 score = 0.4 SOL (4x)
```

## 🛠️ Build Output

After building, you'll find:
- `build-output/deploy/x404_agent_nft.so` - Compiled program
- `build-output/idl/x404_agent_nft.json` - IDL for SDK

## 📄 License

MIT
