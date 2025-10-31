# SPL-8004 Frontend

Web interface for the SPL-8004 Trustless AI Agent Identity & Reputation Standard on Solana.

## 🚀 Features

- **Dashboard**: Register and manage AI agents
- **Agent Explorer**: Browse all registered agents on the network
- **Validation System**: Submit task validations for agents
- **Real-time Stats**: Track reputation scores, success rates, and rewards
- **Wallet Integration**: Connect with Phantom, Solflare, and other Solana wallets
- **Beautiful UI**: Modern, AI-focused design with purple theme

## 🛠️ Tech Stack

- **React 18** + **TypeScript** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **@solana/wallet-adapter** - Wallet connection
- **@coral-xyz/anchor** - Solana program integration
- **React Router** - Client-side routing

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Design System

The app uses a modern, AI-focused design with:

- **Colors**: White background with purple primary colors (#7C3AED, #6D28D9)
- **Typography**: Bold headlines with gradient effects
- **Components**: Glass-morphism cards with subtle shadows
- **Animations**: Smooth transitions and hover effects
- **Theme**: Light theme optimized for AI/blockchain aesthetic

### Customization

Colors and styles are defined in:
- `src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind configuration

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── WalletProvider.tsx     # Solana wallet setup
│   ├── Navbar.tsx             # Navigation bar
│   ├── AgentCard.tsx          # Agent display card
│   ├── StatsCard.tsx          # Statistics card
│   └── ProgramInfo.tsx        # Program information
├── pages/
│   ├── Index.tsx              # Home/landing page
│   ├── Dashboard.tsx          # Agent management
│   ├── Agents.tsx             # Agent explorer
│   ├── Validation.tsx         # Validation submission
│   └── NotFound.tsx           # 404 page
├── hooks/
│   └── useSPL8004.ts          # SPL-8004 program hook
├── lib/
│   ├── spl8004-client.ts      # SDK client wrapper
│   ├── program-constants.ts   # Program constants
│   └── utils.ts               # Helper functions
└── index.css                  # Global styles + design tokens
```

## 🔗 Integration with SPL-8004 Program

### Program Details

- **Program ID**: `SPL8wVx7ZqKNxJk5H2bF8QyGvM4tN3rP9WdE6fU5Kc2`
- **Network**: Solana Devnet
- **Framework**: Anchor 0.30.1

### Key Features

#### 1. Identity Registry
- Register AI agents with unique identifiers
- Store metadata URIs (Arweave, IPFS)
- On-chain ownership verification

#### 2. Reputation System
- Dynamic scores from 0-10,000
- Success rate tracking
- Reputation-based rewards

#### 3. Validation Registry
- Trustless task verification
- On-chain evidence storage
- Commission-based validation fees (3%)

#### 4. Reward System
- Base reward: 0.0001 SOL
- Score-based multipliers (1x-5x)
- 24-hour claim intervals

### Constants

```typescript
// Fees
REGISTRATION_FEE: 0.005 SOL
VALIDATION_FEE: 0.001 SOL

// Reputation
INITIAL_SCORE: 5000
MAX_SCORE: 10000
MIN_SCORE: 0

// Commission
DEFAULT_RATE: 3%
MAX_RATE: 10%
```

### Example Integration

```typescript
import { useSPL8004 } from '@/hooks/useSPL8004';

const { client } = useSPL8004();

// Register agent
await client.registerAgent(
  'my-agent-001',
  'https://arweave.net/metadata'
);

// Submit validation
const taskHash = Buffer.from(crypto.randomBytes(32));
await client.submitValidation(
  'my-agent-001',
  taskHash,
  true, // approved
  'https://ipfs.io/evidence'
);

// Get reputation
const reputation = await client.getReputation('my-agent-001');
console.log('Score:', reputation.score);
```

## 🌐 Pages

### Home (`/`)
- Hero section with project overview
- Key features showcase
- Global statistics
- How it works guide

### Dashboard (`/dashboard`)
- Wallet connection status
- Agent registration form
- My agents overview
- Claimable rewards

### Agents (`/agents`)
- Browse all registered agents
- Search and filter functionality
- Detailed agent cards with stats

### Validation (`/validation`)
- Submit task validations
- Approve/reject interface
- Evidence URI input
- Fee breakdown

## 🎯 Key Components

### AgentCard
Displays agent information including:
- Agent ID and owner
- Reputation score with visual progress
- Task statistics (total, successful, failed)
- Success rate percentage
- Active/inactive status

### StatsCard
Shows key metrics with:
- Icon and title
- Large value display
- Optional trend indicator
- Hover effects and animations

## 🔐 Deploying the Solana Program

**Important**: The Rust Solana program must be built and deployed separately.

### Prerequisites

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.1
avm use 0.30.1
```

### Build & Deploy

```bash
# In the Solana program directory (not this frontend)
anchor build

# Get program ID
anchor keys list

# Update program ID in:
# - programs/spl-8004/src/lib.rs (declare_id!)
# - Anchor.toml (programs section)

# Build again
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run tests
anchor test --provider.cluster devnet
```

### Update Frontend

After deploying, update the program ID in `src/lib/spl8004-client.ts`:

```typescript
export const SPL8004_PROGRAM_ID = new PublicKey("YOUR_DEPLOYED_PROGRAM_ID");
```

## 📝 Development Notes

### Current Status

✅ Frontend fully functional  
✅ Wallet integration working  
✅ UI/UX complete  
⏳ Requires Solana program deployment  
⏳ Using mock data until program is deployed

### Next Steps

1. Deploy SPL-8004 Solana program to Devnet
2. Update program ID in frontend
3. Replace mock data with real blockchain queries
4. Add IDL-based account parsing
5. Implement real transaction signing
6. Test end-to-end functionality

### Development vs Production

**Development Mode** (current):
- Uses mock data
- No real transactions
- Simulated blockchain interactions

**Production Mode** (after program deployment):
- Real Solana transactions
- Actual blockchain data
- Live agent registration and validation

## 🚢 Deployment

### Deploy to Vercel/Netlify

```bash
# Build
npm run build

# Deploy dist/ folder
```

### Environment Variables

```env
VITE_SOLANA_NETWORK=devnet
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
VITE_PROGRAM_ID=SPL8wVx7ZqKNxJk5H2bF8QyGvM4tN3rP9WdE6fU5Kc2
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Resources

- [Solana Documentation](https://docs.solana.com)
- [Anchor Book](https://book.anchor-lang.com)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [SPL-8004 Specification](https://github.com/spl-8004)

## 💡 Tips

- Use **Devnet** for testing (get SOL from faucet)
- Connect **Phantom** wallet for best experience
- Check console for detailed logs
- Reputation updates confirm in ~400ms

---

**Built with ❤️ for the Solana AI Agent Ecosystem**
