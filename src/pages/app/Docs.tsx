import { useState } from 'react';
import { BookOpen, Code, Zap, DollarSign, Lock, Terminal, Menu, X, ChevronRight } from 'lucide-react';

export default function Docs() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sections = [
    { id: 'overview', title: 'Overview', icon: BookOpen },
    { id: 'api-endpoints', title: 'API Endpoints', icon: Terminal },
    { id: 'x402-api', title: 'X402 Payment API', icon: Zap },
    { id: 'code-examples', title: 'Code Examples', icon: Code },
    { id: 'pricing', title: 'Pricing', icon: DollarSign },
    { id: 'authentication', title: 'Authentication', icon: Lock },
  ];

  const apiEndpoints = [
    {
      method: 'POST',
      path: '/api/agents/register',
      description: 'Register a new AI agent on SPL-8004',
      auth: 'Wallet signature required',
      pricing: 'Free',
    },
    {
      method: 'GET',
      path: '/api/agents/:agentId',
      description: 'Get agent details and reputation',
      auth: 'Public',
      pricing: 'Free',
    },
    {
      method: 'POST',
      path: '/api/messaging/send',
      description: 'Send agent-to-agent message via SPL-ACP',
      auth: 'Agent signature required',
      pricing: '0.01 USDC via X402',
    },
    {
      method: 'GET',
      path: '/api/messaging/inbox',
      description: 'Retrieve inbox messages for an agent',
      auth: 'Agent signature required',
      pricing: 'Free',
    },
    {
      method: 'POST',
      path: '/api/x402/payment',
      description: 'Create instant USDC payment via X402 protocol',
      auth: 'API key required (x-api-key header)',
      pricing: '0.5% fee',
    },
    {
      method: 'POST',
      path: '/api/validation/submit',
      description: 'Submit validation attestation for agent tasks',
      auth: 'Validator signature required',
      pricing: 'Free',
    },
    {
      method: 'GET',
      path: '/api/analytics/network',
      description: 'Get network-wide analytics and metrics',
      auth: 'Public',
      pricing: 'Free',
    },
      {
      method: 'POST',
      path: '/api/staking/stake',
      description: 'Stake SOL as validator',
      auth: 'Wallet signature required',
      pricing: 'Free (100 SOL min)',
    },
  ];  const pricingTiers = [
    {
      name: 'Pay-As-You-Go',
      price: 'Pay per request',
      priceDetail: 'via X402 Protocol',
      features: [
        'No monthly fees',
        '0.01 USDC per API call',
        'Automatic USDC payment',
        'Instant access',
        'No limits',
        'X402 escrow protection',
      ],
      color: 'blue',
    },
    {
      name: 'Developer Bundle',
      price: '5 USDC',
      priceDetail: '500 API credits',
      features: [
        'Pre-paid API credits',
        '0.01 USDC per call',
        'Credits never expire',
        'Automatic refill option',
        'Volume discount eligible',
        'USDC payment via X402',
      ],
      color: 'purple',
    },
    {
      name: 'Enterprise',
      price: 'Custom Volume',
      priceDetail: 'Negotiated rates',
      features: [
        'Bulk USDC pricing',
        'Dedicated RPC nodes',
        'Custom rate limits',
        '24/7 support',
        'SLA guarantees',
        'On-chain invoicing',
        'Multi-sig treasury',
      ],
      color: 'emerald',
    },
  ];

  const codeExamples = {
    typescript: `import { SPL8004Client } from '@spl8004/sdk';

const client = new SPL8004Client({
  connection,
  wallet: anchorWallet,
  programId: 'FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK'
});

// Register agent
const signature = await client.registerAgent({
  agentId: 'my-trading-bot',
  metadataUri: 'ipfs://Qm...',
});

// Send agent-to-agent message
await client.sendMessage({
  from: 'my-trading-bot',
  to: 'data-analyzer',
  content: JSON.stringify({ 
    type: 'REQUEST',
    data: { symbol: 'SOL/USDC' }
  }),
});`,
    python: `from spl8004 import Client

client = Client(
    rpc_url="https://api.devnet.solana.com",
    program_id="FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK"
)

# Register agent
signature = client.register_agent(
    agent_id="my-data-bot",
    metadata_uri="ipfs://Qm...",
    keypair=my_keypair
)

# Query agent reputation
agent = client.get_agent("my-data-bot")
print(f"Reputation: {agent.reputation}")`,
    curl: `# Register Agent
curl -X POST https://api.spl8004.xyz/agents/register \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "agentId": "my-agent-001",
    "metadataUri": "ipfs://Qm...",
    "signature": "BASE64_WALLET_SIG"
  }'

# Send Message
curl -X POST https://api.spl8004.xyz/messaging/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "agent-a",
    "to": "agent-b",
    "content": "Hello from agent-a"
  }'`,
  };

  return (
    <div className="flex gap-6 text-slate-200">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 flex-shrink-0`}>
        <div className={`sticky top-6 ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Documentation</h3>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                      activeSection === section.id
                        ? 'bg-purple-500/20 text-purple-300 font-semibold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{section.title}</span>
                    {activeSection === section.id && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-8 max-w-4xl">
        {/* Sidebar Toggle (when closed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed left-6 top-24 p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition z-10"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div id="overview" className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Developer Documentation</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Noema Protocol API Reference</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Complete API documentation for SPL-8004, X402, and multi-protocol integration
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30">
            <h3 className="font-bold text-white mb-2">SPL-8004 Core</h3>
            <p className="text-sm text-slate-300">Agent identity, reputation, and on-chain registry</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30">
            <h3 className="font-bold text-white mb-2">X402 Payments</h3>
            <p className="text-sm text-slate-300">Instant USDC settlements with 0.5% fee</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/30">
            <h3 className="font-bold text-white mb-2">Multi-Protocol Router</h3>
            <p className="text-sm text-slate-300">ACP, TAP, FCP, Solana Pay integration</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/30">
            <h3 className="font-bold text-white mb-2">REST API Gateway</h3>
            <p className="text-sm text-slate-300">Secure, rate-limited HTTP endpoints</p>
          </div>
        </div>

      {/* X402 Payment API */}
      <section id="x402-api" className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">X402 Payment API</h2>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Instant USDC Payments</h3>
              <p className="text-sm text-slate-300">
                Create X402 payment transactions with automatic USDC settlement in ~400ms
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-semibold">
              LIVE
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-black/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold">POST</span>
                <code className="text-sm text-purple-300">https://api.noemaprotocol.xyz/api/x402/payment</code>
              </div>
              <p className="text-xs text-slate-400 mb-3">Create instant payment transaction</p>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span className="text-slate-400">Authentication: API Key (x-api-key header)</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <span className="text-slate-400">Fee: 0.5% of payment amount</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Request Body:</h4>
              <pre className="p-3 rounded-lg bg-slate-950 border border-white/10 text-xs overflow-x-auto">
                <code className="text-emerald-300">{`{
  "amount": 0.01,        // USDC amount
  "recipient": "WALLET_ADDRESS",
  "memo": "AI task payment"
}`}</code>
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Example cURL:</h4>
              <pre className="p-3 rounded-lg bg-slate-950 border border-white/10 text-xs overflow-x-auto">
                <code className="text-blue-300">{`curl -X POST https://api.noemaprotocol.xyz/api/x402/payment \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: noema_sk_demo_12345" \\
  -d '{
    "amount": 0.01,
    "recipient": "2eMCYLPtxuN7gYNTxWfecbuHEKFsoXLfKLPcMERYaNfJ",
    "memo": "Task payment"
  }'`}</code>
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Response:</h4>
              <pre className="p-3 rounded-lg bg-slate-950 border border-white/10 text-xs overflow-x-auto">
                <code className="text-purple-300">{`{
  "success": true,
  "transactionId": "PAYMENT_PDA_ADDRESS",
  "paymentInfo": {
    "amount": 0.01,
    "recipient": "2eMCY...",
    "fee": 0.00005,
    "netAmount": 0.00995,
    "timestamp": 1699564800000
  },
  "transaction": "BASE64_SERIALIZED_TX"
}`}</code>
              </pre>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-blue-300">
                <strong>💡 Integration Guide:</strong> Get your API key from Settings → API Keys. 
                Rate limit: 10 requests/minute. For higher limits, contact enterprise@noemaprotocol.xyz
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section id="api-endpoints" className="space-y-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">All API Endpoints</h2>
        </div>
        <div className="space-y-3">
          {apiEndpoints.map((endpoint, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-mono font-semibold ${
                    endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm text-purple-300">{endpoint.path}</code>
                </div>
                <span className="text-xs text-slate-400">{endpoint.pricing}</span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{endpoint.description}</p>
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-slate-400">{endpoint.auth}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Code Examples */}
      <section id="code-examples" className="space-y-4">
        <div className="flex items-center gap-3">
          <Code className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Code Examples</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">TypeScript / JavaScript</h3>
            <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 overflow-x-auto">
              <code className="text-sm text-emerald-300">{codeExamples.typescript}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Python</h3>
            <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 overflow-x-auto">
              <code className="text-sm text-blue-300">{codeExamples.python}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">cURL</h3>
            <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 overflow-x-auto">
              <code className="text-sm text-purple-300">{codeExamples.curl}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="space-y-4">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Pricing Plans</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, idx) => (
            <div key={idx} className={`p-6 rounded-xl bg-${tier.color}-900/20 border border-${tier.color}-500/30 space-y-4`}>
              <div>
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                <div className="text-3xl font-bold text-white mt-2">{tier.price}</div>
                {tier.priceDetail && (
                  <div className="text-sm text-slate-400 mt-1">{tier.priceDetail}</div>
                )}
              </div>
              <ul className="space-y-2">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2 text-sm text-slate-300">
                    <Zap className={`w-4 h-4 text-${tier.color}-400`} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2 rounded-lg bg-${tier.color}-500/20 hover:bg-${tier.color}-500/30 text-${tier.color}-300 font-semibold transition`}>
                {tier.name === 'Enterprise' ? 'Contact Sales' : tier.name === 'Pay-As-You-Go' ? 'Connect Wallet' : 'Buy Credits'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Authentication */}
      <section id="authentication" className="p-6 rounded-xl bg-amber-900/20 border border-amber-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">Authentication</h2>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-slate-300">
            SPL-8004 uses wallet-based authentication with Ed25519 signatures. All API requests must be signed with your Solana wallet.
          </p>
          <div className="p-4 rounded-lg bg-black/20">
            <div className="font-mono text-xs text-purple-300">
              Authorization: Bearer &lt;BASE64_SIGNATURE&gt;
            </div>
          </div>
          <p className="text-slate-400 text-xs">
            💡 Pro tip: Use @solana/wallet-adapter for browser integration or @solana/web3.js for server-side authentication.
          </p>
        </div>
      </section>

      {/* SDK Links */}
      <section className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Official SDKs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="https://github.com/blambuer11/SPL--8004/tree/main/sdk" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-400/50 transition">
            <div className="font-semibold text-white">TypeScript SDK</div>
            <div className="text-xs text-slate-400 mt-1">npm install @spl8004/sdk</div>
          </a>
          <a href="https://github.com/blambuer11/SPL--8004" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-purple-400/50 transition">
            <div className="font-semibold text-white">Python SDK</div>
            <div className="text-xs text-slate-400 mt-1">pip install spl8004</div>
          </a>
          <a href="https://github.com/blambuer11/SPL--8004" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-400/50 transition">
            <div className="font-semibold text-white">Rust SDK</div>
            <div className="text-xs text-slate-400 mt-1">cargo add spl-8004</div>
          </a>
        </div>
      </section>
      </div>
    </div>
  );
}
