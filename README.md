# SPL-8004: Trustless AI Agent Identity & Reputation Standard

Modern web interface for the SPL-8004 Solana program - a decentralized identity and reputation system for AI agents.

## 🚀 Features

- **Wallet Integration**: Seamless connection with Phantom, Solflare, and other Solana wallets
- **Agent Management**: Register and manage AI agents with on-chain identities
- **Reputation Tracking**: Real-time visualization of agent reputation scores (0-10,000)
- **Validation System**: Submit and track task validations with evidence
- **Rewards Dashboard**: Monitor and claim reputation-based rewards
- **Beautiful UI**: Modern, responsive design with Solana-themed gradients and animations

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

The application features a custom design system inspired by Solana's ecosystem:

- **Primary Colors**: Purple gradients (#A855F7 → #9333EA)
- **Accent Colors**: Cyan/Teal accents
- **Dark Theme**: Deep navy backgrounds with subtle gradients
- **Animations**: Floating elements, glow effects, smooth transitions
- **Typography**: Modern, tech-inspired fonts

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn components
│   ├── WalletProvider.tsx     # Solana wallet setup
│   ├── Navbar.tsx             # Navigation bar
│   ├── AgentCard.tsx          # Agent display card
│   └── StatsCard.tsx          # Statistics card
├── pages/
│   ├── Index.tsx              # Landing page
│   ├── Dashboard.tsx          # Agent management
│   ├── Agents.tsx             # Agent directory
│   └── Validation.tsx         # Submit validations
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
└── index.css                  # Global styles + design tokens
```

## 🔗 Integration with SPL-8004 Program

This frontend is designed to work with the SPL-8004 Anchor program. To connect:

1. **Update Program ID**: Edit `src/lib/constants.ts` with your deployed program ID
2. **Add IDL**: Place your program's IDL in `src/idl/spl_8004.json`
3. **Configure Network**: Update RPC endpoint in `WalletProvider.tsx`

### Example Integration

```typescript
import { SPL8004Client } from './lib/spl8004-client';

// Initialize client
const client = new SPL8004Client(connection, wallet);

// Register agent
const { signature, identityPda } = await client.registerAgent(
  'my-agent-001',
  'https://arweave.net/metadata'
);

// Submit validation
await client.submitValidation(
  'my-agent-001',
  taskHash,
  true,
  'https://ipfs.io/evidence'
);
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

## 🔐 Security

- All sensitive operations require wallet signatures
- Input validation on all forms
- Safe handling of public keys
- No private key exposure

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

## 🔗 Links

- **Solana Docs**: https://docs.solana.com
- **Anchor Framework**: https://www.anchor-lang.com
- **Wallet Adapter**: https://github.com/solana-labs/wallet-adapter
- **SPL-8004 Spec**: Based on ERC-8004

## 💡 Tips

- Use **Devnet** for testing (included airdrop functionality)
- Connect **Phantom** wallet for best experience
- Check console for detailed transaction logs
- Reputation updates may take ~400ms to confirm

---

**Built with ❤️ for the Solana AI Agent Ecosystem**
