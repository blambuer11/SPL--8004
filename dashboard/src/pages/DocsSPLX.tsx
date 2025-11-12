import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Layers, Lock, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SPLXStack() {
  const protocols = [
    {
      id: 'SPL-8004',
      name: 'Agent Identity',
      description: 'On-chain identity and registration for autonomous agents',
      icon: <Code2 className="w-6 h-6" />,
      color: 'bg-blue-500',
      features: ['Unique Agent IDs', 'Metadata Storage', 'Capability Registry'],
      status: 'Active',
      docs: '/docs#spl-8004'
    },
    {
      id: 'X402',
      name: 'Autonomous Payments',
      description: 'Agent-to-agent payment protocol with automated settlements',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-green-500',
      features: ['Instant Settlement', 'Multi-token Support', 'Usage Tracking'],
      status: 'Active',
      docs: '/x402'
    },
    {
      id: 'X404',
      name: 'Hybrid NFTs',
      description: 'Fractionalized NFTs with dynamic ownership and liquidity',
      icon: <Layers className="w-6 h-6" />,
      color: 'bg-purple-500',
      features: ['Fractional Ownership', 'Liquidity Pools', 'Dynamic Metadata'],
      status: 'Beta',
      docs: '/docs#x404'
    },
    {
      id: 'X403',
      name: 'Reputation & Trust',
      description: 'Decentralized reputation scoring for autonomous agents',
      icon: <Lock className="w-6 h-6" />,
      color: 'bg-orange-500',
      features: ['Trust Scores', 'Performance Metrics', 'Stake-based Security'],
      status: 'Coming Soon',
      docs: '/docs#x403'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            The Noema Stack
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
            SPL-X Protocol Suite
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            A comprehensive suite of Solana Program Library extensions for autonomous AI agents. 
            Built on SPL standards, optimized for the agent economy.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/docs"
              className="px-8 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all inline-flex items-center gap-2"
            >
              Read Documentation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/developer"
              className="px-8 py-3 border-2 border-slate-900 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-all"
            >
              Start Building
            </Link>
          </div>
        </div>

        {/* Architecture Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-slate-900">Layered Architecture</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { layer: 'Foundation', items: ['Solana Runtime', 'SPL Token', 'Anchor Framework'] },
              { layer: 'Identity Layer', items: ['SPL-8004', 'Agent Registry', 'Metadata'] },
              { layer: 'Economic Layer', items: ['X402 Payments', 'X404 NFTs', 'Usage Metering'] },
              { layer: 'Trust Layer', items: ['X403 Reputation', 'Stake Verification', 'Performance'] }
            ].map((layer, idx) => (
              <div key={idx} className="border-2 border-slate-200 rounded-lg p-6 hover:border-primary transition-all">
                <h3 className="font-bold text-lg mb-4 text-slate-900">{layer.layer}</h3>
                <ul className="space-y-2">
                  {layer.items.map((item, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Protocol Cards */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 text-center">Protocol Standards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {protocols.map((protocol) => (
              <div
                key={protocol.id}
                className="bg-white rounded-xl shadow-lg border-2 border-slate-200 hover:border-primary transition-all p-8"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${protocol.color} text-white`}>
                    {protocol.icon}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      protocol.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : protocol.status === 'Beta'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {protocol.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900">{protocol.id}</h3>
                <p className="text-slate-600 mb-4">{protocol.description}</p>
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-700 mb-2">Key Features:</p>
                  <ul className="space-y-1">
                    {protocol.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to={protocol.docs}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                >
                  View Documentation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Flow */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">How It Works Together</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { step: '1', title: 'Register Agent', desc: 'Create identity with SPL-8004' },
              { step: '2', title: 'Enable Payments', desc: 'Activate X402 for transactions' },
              { step: '3', title: 'Build Reputation', desc: 'Earn trust through X403' },
              { step: '4', title: 'Scale & Trade', desc: 'Use X404 for asset liquidity' }
            ].map((item) => (
              <div key={item.step} className="bg-white/10 backdrop-blur rounded-lg p-6">
                <div className="text-4xl font-bold text-primary mb-2">{item.step}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all"
            >
              Start Building Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Developer Resources */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-2 border-slate-200">
            <Code2 className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">SDK & Libraries</h3>
            <p className="text-sm text-slate-600 mb-4">
              TypeScript SDK with full type safety and comprehensive examples.
            </p>
            <Link to="/developer" className="text-primary font-medium text-sm inline-flex items-center gap-1">
              View SDK Docs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-2 border-slate-200">
            <Layers className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">Program Source</h3>
            <p className="text-sm text-slate-600 mb-4">
              Open-source Rust programs verified and deployed on Solana mainnet.
            </p>
            <a 
              href="https://github.com/blambuer11/SPL--8004" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary font-medium text-sm inline-flex items-center gap-1"
            >
              GitHub Repository <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-2 border-slate-200">
            <Lock className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">Security & Audits</h3>
            <p className="text-sm text-slate-600 mb-4">
              Battle-tested smart contracts with comprehensive security measures.
            </p>
            <Link to="/docs#security" className="text-primary font-medium text-sm inline-flex items-center gap-1">
              Security Docs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
