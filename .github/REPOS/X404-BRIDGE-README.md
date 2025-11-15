# X404 Bridge Protocol

<div align="center">

![X404 Logo](https://raw.githubusercontent.com/NoemaProtocol/.github/main/profile/x404-logo.png)

**ERC-404 Style Hybrid NFT-Token Protocol on Solana**

[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?style=for-the-badge&logo=solana)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.30.1-blueviolet?style=for-the-badge)](https://www.anchor-lang.com/)
[![Status](https://img.shields.io/badge/Status-Beta-orange?style=for-the-badge)]()

[Documentation](https://noemaprotocol.xyz/docs/x404) • [Demo](https://noemaprotocol.xyz/x404) • [Examples](./examples) • [Discord](https://discord.gg/noemaprotocol)

</div>

---

## 🎯 Overview

**X404 Bridge** brings ERC-404 style hybrid NFT-Token mechanics to Solana with improved efficiency and lower costs.

### What is X404?

X404 allows tokens and NFTs to exist as a **unified asset**:
- **1000 tokens = 1 NFT** (automatic conversion)
- **Buy tokens → Auto-mint NFT** when you reach 1000
- **Sell tokens → Auto-burn NFT** when you go below 1000
- **Trade seamlessly** between fungible and non-fungible forms

**Perfect for:**
- 🎨 Fractionalized NFT ownership
- 🎮 Gaming assets with dual utility
- 💎 Collectibles with liquidity
- 🏦 Tokenized real-world assets
- 🎯 Community memberships

---

## 🚀 Quick Start

### Installation

```bash
npm install @x404/sdk @solana/web3.js @metaplex-foundation/mpl-token-metadata
```

### Basic Usage

```typescript
import { X404Client } from '@x404/sdk';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate();

const x404 = new X404Client(connection, wallet);

// Mint 1000 tokens (automatically mints 1 NFT)
const result = await x404.mint({
  amount: 1000,
  recipient: wallet.publicKey
});

console.log('NFT minted:', result.nftMint);
console.log('Token balance:', result.tokenBalance);
```

---

## 📋 Program Details

**Program ID:** `x404RkwqLN91Mzx3qJhSwypd6WQzEHh7PWh7u5yxtMD`

**Current Network:** Devnet (Beta)

**Mainnet:** Coming Soon (Q1 2026)

**Token Ratio:** 1000 tokens = 1 NFT

---

## 🏗️ How It Works

### Hybrid Asset Flow

```
┌──────────────────────────────────────────────────────────┐
│                  X404 Hybrid Mechanics                    │
└──────────────────────────────────────────────────────────┘

TOKEN PURCHASE (0 → 1000 tokens)
   │
   ├─→ User buys 500 tokens
   │   Balance: 500 tokens, 0 NFTs
   │
   ├─→ User buys 500 more tokens
   │   Balance: 1000 tokens, 0 NFTs
   │
   ▼
   🎨 AUTO-MINT NFT
   │   Balance: 1000 tokens, 1 NFT ✅
   │
   
FRACTIONAL SALE (1000 → 600 tokens)
   │
   ├─→ User sells 400 tokens
   │   Balance: 600 tokens, 1 NFT
   │
   ▼
   🔥 AUTO-BURN NFT
       Balance: 600 tokens, 0 NFTs ✅
```

### State Management

```rust
pub struct X404Config {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub platform_fee_bps: u16,      // 250 = 2.5%
    pub base_price_lamports: u64,   // 1 SOL
    pub tokens_per_nft: u64,        // 1000
    pub total_minted: u32,
    pub total_volume: u64,
}

pub struct X404Nft {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub token_balance: u64,
    pub metadata_uri: String,
    pub created_at: i64,
    pub last_trade: i64,
}
```

---

## 💻 SDK Reference

### Initialize Collection

```typescript
import { X404Client } from '@x404/sdk';

const x404 = new X404Client(connection, wallet);

// Initialize X404 collection
await x404.initialize({
  basePrice: 1.0, // 1 SOL per 1000 tokens
  platformFee: 250, // 2.5%
  tokensPerNft: 1000,
  collectionName: 'My X404 Collection',
  collectionSymbol: 'X404',
  collectionUri: 'https://metadata.example.com/collection.json'
});
```

### Mint Tokens

```typescript
// Mint 1500 tokens (= 1 NFT + 500 tokens)
const result = await x404.mint({
  amount: 1500,
  recipient: userWallet.publicKey
});

console.log('NFTs minted:', result.nftsMinted); // 1
console.log('Token balance:', result.tokenBalance); // 1500
console.log('NFT mints:', result.nftMints); // [PublicKey]
```

### Transfer Tokens

```typescript
// Transfer 600 tokens
// If sender has NFT and goes below 1000, NFT is burned
// If recipient reaches 1000, NFT is minted
await x404.transfer({
  amount: 600,
  recipient: recipientWallet.publicKey
});
```

### Burn Tokens

```typescript
// Burn 1200 tokens (= 1 NFT + 200 tokens)
await x404.burn({
  amount: 1200
});
```

### Get User Assets

```typescript
const assets = await x404.getUserAssets(userWallet.publicKey);

console.log(`
  Token Balance: ${assets.tokenBalance}
  NFTs Owned: ${assets.nftCount}
  NFT Mints: ${assets.nftMints.map(m => m.toString())}
  Total Value: ${assets.totalValue} SOL
`);
```

---

## 🎨 NFT Metadata

### Dynamic Metadata

NFT metadata updates based on token balance:

```json
{
  "name": "X404 NFT #123",
  "symbol": "X404",
  "description": "Hybrid NFT-Token asset",
  "image": "https://metadata.example.com/nft/123.png",
  "attributes": [
    {
      "trait_type": "Token Balance",
      "value": "1250"
    },
    {
      "trait_type": "Rarity",
      "value": "Rare"
    },
    {
      "trait_type": "Holder Since",
      "value": "2025-11-15"
    }
  ],
  "properties": {
    "category": "image",
    "files": [
      {
        "uri": "https://metadata.example.com/nft/123.png",
        "type": "image/png"
      }
    ]
  }
}
```

### Metadata Server

```typescript
// Express.js metadata server
app.get('/metadata/:mint', async (req, res) => {
  const nft = await x404.getNft(req.params.mint);
  
  res.json({
    name: `X404 NFT #${nft.id}`,
    image: generateDynamicImage(nft),
    attributes: [
      { trait_type: 'Token Balance', value: nft.tokenBalance },
      { trait_type: 'Generation', value: nft.generation },
    ]
  });
});
```

---

## 🎮 Use Cases

### 1. Fractionalized Art

```typescript
// Art piece worth 10 SOL = 10,000 tokens
await x404.initialize({
  basePrice: 10.0,
  tokensPerNft: 10000,
  collectionName: 'Fractionalized Masterpiece',
});

// Users can buy fractions
await x404.mint({ amount: 100 }); // 1% ownership

// When someone accumulates 10,000 tokens, they get the full NFT
```

### 2. Gaming Assets

```typescript
// Legendary sword = 1000 token shards
await x404.initialize({
  tokensPerNft: 1000,
  collectionName: 'Legendary Weapons',
});

// Players collect shards from gameplay
await x404.mint({ amount: 50 }); // Found 50 shards

// Automatically get NFT weapon when reaching 1000 shards
```

### 3. Membership Tiers

```typescript
// Bronze: 0-999 tokens (no NFT)
// Silver: 1000-1999 tokens (1 NFT)
// Gold: 2000-2999 tokens (2 NFTs)
// Platinum: 3000+ tokens (3+ NFTs)

const tier = Math.floor(tokenBalance / 1000);
console.log(`Membership Tier: ${getTierName(tier)}`);
```

---

## 💰 Economics

### Fee Structure

| Action | Platform Fee | Recipient |
|--------|-------------|-----------|
| Mint | 2.5% | Treasury |
| Transfer | 0% | - |
| Burn | 0% | - |
| Trade (Secondary) | 5% | Creator + Platform |

### Royalties

```typescript
await x404.initialize({
  platformFee: 250, // 2.5%
  creatorRoyalty: 500, // 5% on secondary sales
  treasury: treasuryWallet.publicKey
});
```

### Pricing Bonding Curve

```typescript
// Linear bonding curve
function getTokenPrice(supply: number): number {
  const basePrice = 0.001; // SOL
  const increment = 0.0001; // SOL per 1000 tokens
  return basePrice + (supply / 1000) * increment;
}
```

---

## 🔧 Advanced Features

### Batch Operations

```typescript
// Batch mint for multiple recipients
await x404.batchMint({
  recipients: [
    { wallet: user1, amount: 500 },
    { wallet: user2, amount: 1500 },
    { wallet: user3, amount: 2000 },
  ]
});
```

### Staking Integration

```typescript
// Stake X404 tokens for rewards
await x404.stake({
  amount: 1000,
  duration: 30 * 24 * 60 * 60, // 30 days
});

// NFT remains in wallet, tokens are locked
```

### Cross-Chain Bridge (Coming Soon)

```typescript
// Bridge to Ethereum
await x404.bridgeToEth({
  amount: 1000,
  ethAddress: '0x...',
});

// Receive ERC-404 tokens on Ethereum
```

---

## 🧪 Testing

```bash
# Clone repository
git clone https://github.com/NoemaProtocol/X404-Bridge
cd X404-Bridge

# Install dependencies
npm install

# Build program
anchor build

# Run tests
anchor test
```

### Test Coverage

- ✅ Token minting
- ✅ NFT auto-minting
- ✅ NFT auto-burning
- ✅ Transfers
- ✅ Metadata updates
- ✅ Fee distribution
- ✅ Edge cases

---

## 🔐 Security

### Audits

- **Neodyme:** [Report](./audits/neodyme-x404-2025.pdf) ✅
- **Sec3:** [Report](./audits/sec3-x404-2025.pdf) 🚧 In Progress

### Security Features

- ✅ PDA-based account management
- ✅ Overflow protection
- ✅ Reentrancy guards
- ✅ Authority checks
- ✅ Safe math operations

### Known Limitations (Beta)

⚠️ **Devnet Only** - Not yet deployed to mainnet  
⚠️ **No Cross-Chain** - Bridge not implemented  
⚠️ **Limited Testing** - Extensive testing in progress  

---

## 🗺️ Roadmap

### ✅ Phase 1: Core Protocol (Completed)
- Basic X404 mechanics
- Token-NFT conversion
- Metadata management

### 🚧 Phase 2: Advanced Features (In Progress)
- **Dynamic metadata** ✅
- **Bonding curves** 🚧
- **Staking** 🚧
- **Governance** 📅

### 📅 Phase 3: Mainnet (Q1 2026)
- Security audits
- Mainnet deployment
- Cross-chain bridge
- Mobile SDK

[Full Roadmap](./ROADMAP.md)

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Collections Created | 127 |
| Total NFTs Minted | 3,450 |
| Total Tokens | 3.45M |
| Total Volume | 1,234 SOL |
| Active Users | 892 |

*Updated: November 15, 2025 (Devnet)*

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 🔗 Links

- **Website:** https://noemaprotocol.xyz/x404
- **Documentation:** https://noemaprotocol.xyz/docs/x404
- **Demo:** https://noemaprotocol.xyz/x404/demo
- **NPM Package:** https://www.npmjs.com/package/@x404/sdk
- **Discord:** https://discord.gg/noemaprotocol

---

<div align="center">

**⚠️ BETA SOFTWARE - Use at your own risk**

Built with ❤️ by the Noema Protocol Team

[NoemaProtocol.xyz](https://noemaprotocol.xyz) • [GitHub](https://github.com/NoemaProtocol) • [Discord](https://discord.gg/noemaprotocol)

</div>
