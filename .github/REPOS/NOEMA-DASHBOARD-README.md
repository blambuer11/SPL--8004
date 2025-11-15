# Noema Dashboard 🖥️

**Full-featured web interface for Noema Protocol management**

[![Live Demo](https://img.shields.io/badge/Live-noemaprotocol.xyz-purple?style=for-the-badge)](https://noemaprotocol.xyz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)

## Overview

Noema Dashboard is a **production-ready web application** for managing AI agents, staking NOEMA tokens, monitoring payments, and interacting with all Noema protocols through an intuitive UI.

**Key Features:**
- 🤖 **Agent Management** - Register, update, and monitor AI agents
- 💰 **Staking Interface** - Stake NOEMA tokens and track rewards
- 💳 **Payment Dashboard** - Create X402 payments and view history
- 📊 **Analytics** - Real-time statistics and usage insights
- 🎨 **X404 Gallery** - Manage hybrid NFT collections
- 🔗 **Wallet Integration** - Phantom, Backpack, Solflare support

---

## Live Demo

**Production:** [https://noemaprotocol.xyz](https://noemaprotocol.xyz)  
**Devnet:** [https://devnet.noemaprotocol.xyz](https://devnet.noemaprotocol.xyz)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18.2, TypeScript 5.3 |
| **Build Tool** | Vite 5.0 |
| **Styling** | TailwindCSS 3.4, shadcn/ui |
| **State Management** | Zustand, React Query |
| **Blockchain** | Solana web3.js, Anchor |
| **Wallet** | @solana/wallet-adapter |
| **SDK** | @noema/sdk, @spl-8004/sdk |
| **Deployment** | Vercel (serverless functions) |

---

## Quick Start

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Git
- Solana wallet (Phantom, Backpack, etc.)

### Installation

```bash
# Clone repository
git clone https://github.com/NoemaProtocol/Noema-Dashboard.git
cd Noema-Dashboard

# Install dependencies
npm install
# or
bun install

# Copy environment template
cp .env.example .env

# Configure environment (see below)
nano .env

# Start development server
npm run dev
# or
bun run dev
```

**Dashboard will be available at:** http://localhost:8081

---

## Environment Configuration

Create `.env` file:

```bash
# Network Configuration
VITE_SOLANA_NETWORK=mainnet-beta  # or devnet
VITE_RPC_URL=https://api.mainnet-beta.solana.com

# Noema API (optional - for managed features)
VITE_NOEMA_API_KEY=your-api-key-from-noemaprotocol.xyz

# Program IDs (mainnet)
VITE_SPL8004_PROGRAM_ID=Noema8ooDBphFaj61pQ1HV1RCFAu4hLjPMpmq7LfGMu
VITE_X402_PROGRAM_ID=6MCoXd3CJFSvL5qPUuKLYXAKTHb9VhzSWC3kNaVDpNPm
VITE_X404_PROGRAM_ID=x404RkwB18d6NbqGvwqvJyqzBHq1R8xN9dTGH17EJqf

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_X404=false  # Set true for devnet
VITE_ENABLE_WEBHOOKS=true
VITE_ENABLE_AUTO_PAY=true
```

---

## Features

### 1. Agent Management

**Register New Agent:**
1. Connect wallet (top-right button)
2. Navigate to **Agents** → **Register**
3. Fill form:
   - Agent ID (unique identifier)
   - Display name
   - Description
   - Capabilities (tags)
   - Metadata URL
4. Click **Register Agent**
5. Approve transaction in wallet

**View Agent Details:**
- Navigate to **Agents** → **My Agents**
- Click on agent card
- View:
  - PDA address
  - Reputation score
  - Transaction history
  - Metadata
  - Earnings (X402 payments)

**Update Agent:**
- Click **Edit** on agent card
- Update metadata URI or capabilities
- Approve update transaction

### 2. Staking Dashboard

**Stake NOEMA Tokens:**
1. Navigate to **Staking** tab
2. Click **Stake Tokens**
3. Enter:
   - Amount (NOEMA)
   - Lock period (30/60/90 days)
4. Review APY estimate
5. Approve transaction

**View Staking Stats:**
- Total staked amount
- Current APY
- Pending rewards
- Unlock date
- Validator status

**Claim Rewards:**
1. Navigate to **Staking** → **My Stakes**
2. Click **Claim Rewards**
3. Approve transaction
4. Rewards sent to wallet

### 3. Payment Dashboard

**Create X402 Payment:**
1. Navigate to **Payments** → **Send**
2. Enter:
   - Recipient (agent PDA or wallet)
   - Amount (USDC)
   - Memo (optional)
3. Review fee (0.5%)
4. Approve transaction

**Payment History:**
- View all sent/received payments
- Filter by:
  - Date range
  - Amount range
  - Agent
  - Status
- Export to CSV

**Auto-Pay Configuration:**
1. Navigate to **Payments** → **Auto-Pay**
2. Set budget (USDC)
3. Configure rate limits:
   - Max per hour
   - Max per day
4. Enable auto-pay
5. API requests auto-deduct from budget

### 4. Analytics

**Agent Analytics:**
- Total agents registered
- Reputation distribution
- Top validators
- Transaction volume

**Payment Analytics:**
- Total payments processed
- Revenue breakdown
- Average transaction size
- Payment trends (chart)

**Staking Analytics:**
- Total NOEMA staked
- Validator count
- Reward distribution
- APY history

### 5. X404 Gallery (Devnet)

**Create Collection:**
1. Navigate to **X404** → **Create**
2. Enter:
   - Collection name
   - Symbol
   - Conversion rate (tokens per NFT)
   - Metadata URI
3. Upload artwork
4. Approve transaction

**Mint Tokens:**
- Select collection
- Enter amount
- Auto-converts to NFT at threshold
- View token balance + NFT count

**Burn NFT:**
- Select NFT from gallery
- Click **Burn to Tokens**
- Receive tokens back to wallet

---

## Architecture

### Directory Structure

```
Noema-Dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── agents/          # Agent management UI
│   │   ├── staking/         # Staking interface
│   │   ├── payments/        # Payment dashboard
│   │   ├── analytics/       # Charts & stats
│   │   ├── x404/            # X404 gallery
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # Custom React hooks
│   │   ├── useNoemaClient.ts
│   │   ├── useAgents.ts
│   │   ├── useStaking.ts
│   │   └── usePayments.ts
│   ├── stores/              # Zustand state stores
│   │   ├── walletStore.ts
│   │   ├── agentStore.ts
│   │   └── paymentStore.ts
│   ├── lib/                 # Utilities
│   │   ├── solana.ts        # Wallet adapter setup
│   │   ├── noema.ts         # SDK initialization
│   │   └── utils.ts         # Helper functions
│   ├── pages/               # Route components
│   │   ├── Dashboard.tsx
│   │   ├── Agents.tsx
│   │   ├── Staking.tsx
│   │   ├── Payments.tsx
│   │   └── X404.tsx
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
├── api/                     # Vercel serverless functions
│   ├── agents.ts
│   ├── payments.ts
│   └── webhooks.ts
├── public/                  # Static assets
│   ├── branding/
│   └── docs/
├── .env.example             # Environment template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

### State Management

**Zustand Stores:**

```typescript
// src/stores/walletStore.ts
export const useWalletStore = create<WalletState>((set) => ({
  connected: false,
  publicKey: null,
  balance: 0,
  connect: async () => { /* ... */ },
  disconnect: () => { /* ... */ }
}));

// src/stores/agentStore.ts
export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  selectedAgent: null,
  fetchAgents: async () => { /* ... */ },
  registerAgent: async (params) => { /* ... */ }
}));
```

**React Query for API calls:**

```typescript
// src/hooks/useAgents.ts
export const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const client = useNoemaClient();
      return client.getAgents({ limit: 100 });
    },
    refetchInterval: 30000  // Refresh every 30s
  });
};
```

### Wallet Integration

```typescript
// src/lib/solana.ts
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

export const wallets = [
  new PhantomWalletAdapter(),
  new BackpackWalletAdapter(),
  new SolflareWalletAdapter()
];

export const network = import.meta.env.VITE_SOLANA_NETWORK === 'mainnet-beta'
  ? WalletAdapterNetwork.Mainnet
  : WalletAdapterNetwork.Devnet;
```

---

## API Routes (Serverless Functions)

Dashboard includes serverless API routes deployed on Vercel:

### GET /api/agents
Fetch all agents with pagination.

**Request:**
```bash
curl https://noemaprotocol.xyz/api/agents?limit=10&offset=0
```

**Response:**
```json
{
  "agents": [
    {
      "pda": "8xY7...",
      "agentId": "customer-bot",
      "reputation": 950,
      "owner": "4tZ9..."
    }
  ],
  "total": 1247
}
```

### GET /api/agents/:pda
Get agent details by PDA.

### POST /api/agents/register
Register new agent (requires wallet signature).

### GET /api/payments/history
Fetch payment history for connected wallet.

### POST /api/webhooks/register
Register webhook for agent events.

**Full API docs:** https://noemaprotocol.xyz/api-reference

---

## Development

### Run Development Server

```bash
npm run dev
# Dashboard: http://localhost:8081
# API routes: http://localhost:8081/api/*
```

### Build for Production

```bash
npm run build
# Output: dist/

# Preview production build
npm run preview
```

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Linting & Formatting

```bash
# ESLint
npm run lint

# Prettier
npm run format

# Type check
npm run type-check
```

---

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   # Follow prompts to link project
   ```

3. **Configure Environment Variables:**
   - Go to Vercel dashboard
   - Add all variables from `.env.example`
   - Redeploy

4. **Production Deployment:**
   ```bash
   vercel --prod
   ```

**Auto-deployment:** Connect GitHub repository for automatic deploys on push.

### Custom Server (Docker)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8081
CMD ["npm", "run", "preview", "--", "--port", "8081", "--host"]
```

**Build & Run:**
```bash
docker build -t noema-dashboard .
docker run -p 8081:8081 --env-file .env noema-dashboard
```

---

## Customization

### Branding

Replace logo and colors in `public/branding/`:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',      // Purple
        secondary: '#ec4899',    // Pink
        accent: '#3b82f6',       // Blue
        background: '#0f172a',   // Dark
        foreground: '#f1f5f9'    // Light
      }
    }
  }
}
```

### Add Custom Pages

```typescript
// src/pages/CustomPage.tsx
export const CustomPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1>Custom Feature</h1>
      {/* Your UI */}
    </div>
  );
};

// src/App.tsx
import { CustomPage } from './pages/CustomPage';

<Route path="/custom" element={<CustomPage />} />
```

### Custom Themes

```typescript
// src/lib/themes.ts
export const themes = {
  light: {
    background: '#ffffff',
    foreground: '#0f172a',
    primary: '#7c3aed'
  },
  dark: {
    background: '#0f172a',
    foreground: '#f1f5f9',
    primary: '#a78bfa'
  }
};

// Toggle in settings
const { theme, setTheme } = useThemeStore();
<Button onClick={() => setTheme('dark')}>Dark Mode</Button>
```

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const X404Gallery = lazy(() => import('./pages/X404'));

<Suspense fallback={<Loading />}>
  <X404Gallery />
</Suspense>
```

### Caching Strategy

```typescript
// React Query persistent cache
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false
    }
  }
});
```

### Bundle Size

Current production build:
- **Main bundle:** 247 KB (gzipped)
- **Vendor bundle:** 189 KB (React, web3.js)
- **Total:** ~436 KB

Optimize further:
```bash
npm run analyze  # Bundle size analyzer
```

---

## Security

### Best Practices

1. **Never expose private keys** - Wallet adapter handles signing
2. **Verify all transactions** - Show clear confirmation dialogs
3. **Sanitize user inputs** - Prevent XSS attacks
4. **Use HTTPS only** - Force SSL in production
5. **Rate limiting** - Prevent API abuse
6. **Webhook signature verification** - Validate webhook payloads

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline';
               connect-src 'self' https://api.mainnet-beta.solana.com;">
```

---

## Troubleshooting

### Common Issues

**1. Wallet not connecting:**
```bash
# Check wallet adapter version
npm list @solana/wallet-adapter-react

# Update if needed
npm install @solana/wallet-adapter-react@latest
```

**2. Transaction failing:**
- Check SOL balance (need ~0.01 SOL for fees)
- Verify network (mainnet vs devnet)
- Check RPC endpoint health
- Review transaction logs in console

**3. API errors:**
```typescript
// Enable debug logging
localStorage.setItem('debug', 'noema:*');
// Check browser console for detailed logs
```

**4. Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code style guide
- Component conventions
- PR submission process
- UI/UX guidelines

**Development Workflow:**
1. Fork repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and test locally
4. Run linter: `npm run lint`
5. Commit: `git commit -m "feat: add new feature"`
6. Push: `git push origin feature/my-feature`
7. Open Pull Request

---

## Roadmap

### Q1 2025
- ✅ Production launch
- ✅ Wallet adapter integration
- 🚧 Mobile responsive design
- 🚧 Advanced analytics dashboard

### Q2 2025
- Dark mode toggle
- Multi-language support (i18n)
- Mobile app (React Native)
- Desktop app (Electron)

### Q3-Q4 2025
- Live chat support
- Agent marketplace
- DAO governance interface
- Cross-chain support

---

## Support

- **Live Chat:** [discord.gg/noemaprotocol](https://discord.gg/noemaprotocol)
- **Email:** support@noemaprotocol.xyz
- **GitHub Issues:** [Report a bug](https://github.com/NoemaProtocol/Noema-Dashboard/issues)
- **Documentation:** [noemaprotocol.xyz/docs](https://noemaprotocol.xyz/docs)

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Credits

**Built with:**
- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Solana web3.js](https://solana-labs.github.io/solana-web3.js/) - Blockchain SDK
- [Recharts](https://recharts.org/) - Analytics charts

**Maintained by the Noema Protocol community** ❤️

[Website](https://noemaprotocol.xyz) · [Twitter](https://twitter.com/noemaprotocol) · [GitHub](https://github.com/NoemaProtocol)
