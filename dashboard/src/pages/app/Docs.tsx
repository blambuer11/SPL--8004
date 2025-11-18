import { BookOpen, Code, Zap, DollarSign, Lock, Terminal } from 'lucide-react';

export default function Docs() {
  const apiEndpoints = [
    {
      method: 'POST',
      path: '/api/agents/register',
      description: 'Register a new AI agent on NOEMA-8004',
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
      path: '/api/payments/send',
      description: 'Send USDC payment via X402 protocol',
      auth: 'Wallet signature required',
      pricing: '0.1% fee via X402',
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
    <div className="space-y-8 text-slate-200 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-purple-300">Developer Documentation</span>
        </div>
        <h1 className="text-4xl font-bold text-white">NOEMA-8004 API Reference</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Complete API documentation, code examples, and pricing information for building on NOEMA-8004
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <a href="#api-endpoints" className="p-4 rounded-xl bg-blue-900/30 border border-blue-500/30 hover:border-blue-400/50 transition text-center">
          <Terminal className="w-8 h-8 mx-auto mb-2 text-blue-400" />
          <div className="font-semibold text-white">API Endpoints</div>
        </a>
        <a href="#code-examples" className="p-4 rounded-xl bg-purple-900/30 border border-purple-500/30 hover:border-purple-400/50 transition text-center">
          <Code className="w-8 h-8 mx-auto mb-2 text-purple-400" />
          <div className="font-semibold text-white">Code Examples</div>
        </a>
        <a href="#pricing" className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/30 hover:border-emerald-400/50 transition text-center">
          <DollarSign className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
          <div className="font-semibold text-white">Pricing</div>
        </a>
        <a href="#authentication" className="p-4 rounded-xl bg-amber-900/30 border border-amber-500/30 hover:border-amber-400/50 transition text-center">
          <Lock className="w-8 h-8 mx-auto mb-2 text-amber-400" />
          <div className="font-semibold text-white">Authentication</div>
        </a>
      </div>

      {/* API Endpoints */}
      <section id="api-endpoints" className="space-y-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">API Endpoints</h2>
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
            NOEMA-8004 uses wallet-based authentication with Ed25519 signatures. All API requests must be signed with your Solana wallet.
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
          <a href="https://github.com/blambuer11/NOEMA-8004/tree/main/sdk" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-400/50 transition">
            <div className="font-semibold text-white">TypeScript SDK</div>
            <div className="text-xs text-slate-400 mt-1">npm install @spl8004/sdk</div>
          </a>
          <a href="https://github.com/blambuer11/NOEMA-8004" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-purple-400/50 transition">
            <div className="font-semibold text-white">Python SDK</div>
            <div className="text-xs text-slate-400 mt-1">pip install spl8004</div>
          </a>
          <a href="https://github.com/blambuer11/NOEMA-8004" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-400/50 transition">
            <div className="font-semibold text-white">Rust SDK</div>
            <div className="text-xs text-slate-400 mt-1">cargo add noema-8004</div>
          </a>
        </div>
      </section>
    </div>
  );
}
