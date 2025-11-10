# 🎨 X404 NFT Bridge

SPL-8004 Agent Identity'lerini tradeable NFT'lere dönüştüren Solana bridge protokolü.

## Program ID

**Devnet**: `ESEbyYMdhKUQ3h5AyqPwLhvkPhaMgugt3dRd3NXxUsH9`  
**Mainnet**: Coming soon

## Features

✅ **Agent Tokenization**: SPL-8004 agent'ları NFT'ye dönüştür  
✅ **Dynamic Pricing**: Reputation-based floor price calculation  
✅ **Real-time Sync**: SPL-8004'den otomatik reputation senkronizasyonu  
✅ **Marketplace**: List/delist/purchase işlemleri  
✅ **Platform Fees**: Configurable fee structure (default 2.5%)  
✅ **Arweave Storage**: Decentralized metadata hosting

## Valuation Formula

```
price = base_price × (1 + reputation/10000)
```

**Example**:
- Base price: 1 SOL
- Reputation: 8500
- Floor price: 1 × (1 + 8500/10000) = 1.85 SOL

## Installation

```bash
npm install @noema/x404-sdk @coral-xyz/anchor @solana/web3.js
```

## Quick Start

```typescript
import { X404Bridge } from '@noema/x404-sdk';
import { Connection, Keypair } from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';

// Setup
const connection = new Connection('https://api.devnet.solana.com');
const wallet = new Wallet(Keypair.fromSecretKey(/* your key */));
const provider = new AnchorProvider(connection, wallet, {});

// Create bridge instance
const bridge = new X404Bridge(
  connection,
  program, // Your Anchor program instance
  spl8004Client, // SPL-8004 client
  wallet
);

// Tokenize agent
const nftMint = await bridge.tokenizeAgent('trading-bot-001');
console.log('NFT Mint:', nftMint.toBase58());

// Sync reputation
await bridge.syncReputation('trading-bot-001');

// List for sale
await bridge.listForSale('trading-bot-001', 1.5); // 1.5 SOL

// Purchase
await bridge.purchase('trading-bot-001', sellerPublicKey);
```

## SDK Methods

### `tokenizeAgent(agentId, name?, symbol?, uri?)`
Convert SPL-8004 agent to NFT

### `syncReputation(agentId)`
Sync reputation from SPL-8004 (updates floor price)

### `listForSale(agentId, priceSOL)`
List NFT on marketplace

### `delist(agentId)`
Remove NFT from marketplace

### `purchase(agentId, sellerPublicKey)`
Buy listed NFT (automatic ownership transfer)

### `getAgentNFT(agentId)`
Get NFT data including floor price

### `getListedNFTs()`
Get all marketplace listings

### `startReputationOracle(agentIds, intervalMs?)`
Start background reputation sync service

## Reputation Oracle

Automatically sync reputation changes:

```typescript
const agentIds = [
  'trading-bot-001',
  'analytics-bot-002',
  'defi-bot-003'
];

// Syncs every 60 seconds
const stopOracle = bridge.startReputationOracle(agentIds);

// Stop when done
stopOracle();
```

## Program Structure

```
x404-bridge/
├── programs/x404-bridge/src/
│   ├── lib.rs                  # Main program entry
│   ├── constants.rs            # Program constants
│   ├── errors.rs               # Custom errors
│   ├── instructions/
│   │   ├── initialize.rs       # Initialize config
│   │   ├── tokenize_agent.rs   # Create NFT from agent
│   │   ├── sync_reputation.rs  # Sync from SPL-8004
│   │   ├── list_for_sale.rs    # List NFT
│   │   ├── delist.rs           # Delist NFT
│   │   ├── purchase.rs         # Buy NFT
│   │   └── update_metadata.rs  # Update Arweave URI
│   └── state/
│       ├── config.rs           # Bridge config
│       ├── agent_nft.rs        # NFT account data
│       └── listing.rs          # Marketplace listing
└── sdk/
    └── x404-sdk.ts             # TypeScript SDK
```

## Account Structure

### X404Config
- Authority
- Treasury wallet
- Platform fee (BPS)
- Base price
- Total minted
- Total volume

### AgentNFT
- Agent ID (SPL-8004 reference)
- NFT Mint address
- Owner
- Reputation score
- Metadata URI
- Transfer history

### Listing
- Agent ID
- Seller
- List price
- Floor price
- Expiration (optional)

## Build & Deploy

```bash
# Build
cd x404-bridge
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Initialize config
anchor run initialize
```

## Testing

```bash
anchor test
```

## Integration with SPL-8004

X404 reads reputation directly from SPL-8004 program accounts:

1. Agent NFT created with reference to SPL-8004 identity
2. `sync_reputation` instruction reads reputation account
3. Floor price auto-calculated based on reputation
4. Oracle service monitors changes and updates

## Platform Fees

- **Default**: 2.5% (250 BPS)
- **Maximum**: 10% (1000 BPS)
- Collected on each sale
- Sent to treasury wallet

## Security Features

- ✅ Ownership verification on all operations
- ✅ Floor price validation (prevents under-pricing)
- ✅ Emergency pause mechanism
- ✅ PDA-based account derivation
- ✅ No arbitrary token transfers

## Roadmap

- [ ] Mainnet deployment
- [ ] Royalty system for original minters
- [ ] Collection support
- [ ] Batch operations
- [ ] Advanced marketplace filters
- [ ] Auction mechanism

## License

MIT

## Contact

- **Twitter**: [@noema_ai](https://twitter.com/noema_ai)
- **Discord**: [Join our server](https://discord.gg/noema)
- **Email**: dev@noema.ai

---

**Built for Solana Hackathon 2025** 🚀
