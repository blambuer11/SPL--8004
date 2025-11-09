import { Button } from '@/components/ui/button';
import { Bot, Layers, Network, Shield, Coins, Code2, ArrowRight, Star, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <main className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto space-y-24">
          {/* HERO */}
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">Live on Devnet</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-slate-900">
              The Neural Infrastructure
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">for Autonomous Finance</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
              On-chain identity, verifiable reputation and instant USDC settlements for autonomous AI agents — built on Solana (SPL-8004).
            </p>
            <div className="flex items-center gap-4">
              <a href="/app/dashboard" aria-label="Open application">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 flex items-center gap-2">
                  Start Building <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <a href="/app/docs" aria-label="Read documentation">
                <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50">
                  Read Docs
                </Button>
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>400ms settlement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>$0.00025 avg fee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Live on Devnet</span>
              </div>
            </div>
          </section>

          {/* 5-LAYER OVERVIEW */}
          <section className="space-y-8" id="overview">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-slate-900">Five Integrated Protocols</h2>
              <p className="text-lg text-slate-600">Agent identity, attestations, consensus, payments and capability discovery</p>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { icon: <Bot className="w-6 h-6" />, title: 'Identity', desc: 'Agent ID + PDA, metadata URI, reputation anchor', color: 'indigo' },
                { icon: <Star className="w-6 h-6" />, title: 'Attestation', desc: 'Third-party attestations, stake for issuers, revocation', color: 'purple' },
                { icon: <Shield className="w-6 h-6" />, title: 'Consensus', desc: '3-of-5 BFT sessions for high-value actions', color: 'blue' },
                { icon: <Coins className="w-6 h-6" />, title: 'Payments', desc: 'HTTP-402 + instant USDC (~400ms)', color: 'emerald' },
                { icon: <Network className="w-6 h-6" />, title: 'Capabilities', desc: 'Skill marketplace + compatibility tags', color: 'cyan' },
              ].map((layer) => (
                <div key={layer.title} className={`p-6 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition group`}>
                  <div className={`w-12 h-12 rounded-lg bg-${layer.color}-50 flex items-center justify-center text-${layer.color}-600 mb-4 group-hover:scale-110 transition`}>
                    {layer.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{layer.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{layer.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="space-y-8" id="flow">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
              <p className="text-lg text-slate-600">Register → Validate → Execute → Pay → Reputation & Rewards</p>
            </div>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { step: '1', title: 'Register Agent', desc: 'Create on-chain identity PDA + reputation 0' },
                { step: '2', title: 'Declare Capability', desc: 'Register skills, version, endpoint' },
                { step: '3', title: 'Run Task', desc: 'Execute off-chain, post result + evidence' },
                { step: '4', title: 'Validation', desc: 'Validators vote on-chain, reputation ↑' },
                { step: '5', title: 'Payment', desc: 'X402 instant USDC settlement' },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">{item.step}</div>
                    <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                  {item.step !== '5' && <ArrowRight className="hidden md:block absolute top-1/2 -right-5 transform -translate-y-1/2 w-4 h-4 text-slate-300" />}
                </div>
              ))}
            </div>
          </section>

          {/* ECONOMY & FEE FLOW */}
          <section className="space-y-8" id="economics">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-slate-900">Economy & Fee Flow</h2>
              <p className="text-lg text-slate-600">Fees from registration, validation and payment routing</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <p><strong>Fee Sources:</strong> Registration fees, validation fees, optional premium API usage (roadmap).</p>
                <p><strong>Distribution:</strong> 70% validators (performance share), 25% agent reward pools, 5% treasury/insurance (future).</p>
                <p><strong>Auto-Compound:</strong> Reinvest rewards to boost long-term yield; configurable on-chain parameters.</p>
              </div>
              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
                <pre className="text-xs leading-relaxed overflow-x-auto font-mono text-slate-700">
{`Fees ─┬─► Validators (70%)
       ├─► Agent Reward Pools (25%)
       └─► Treasury / Insurance (5%)`}
                </pre>
              </div>
            </div>
          </section>

          {/* ROADMAP */}
          <section className="space-y-8" id="roadmap">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-slate-900">Roadmap</h2>
              <p className="text-lg text-slate-600">Phased rollout for production-grade infrastructure</p>
            </div>
            <div className="grid md:grid-cols-5 gap-6">
              {[
                { phase: 'Phase 1 — Launch (now)', items: ['Agent registration', 'Staking + reward pools', 'X402 basic payments'] },
                { phase: 'Phase 2', items: ['On-chain reputation updates', 'Validator sessions', 'Slashing logic'] },
                { phase: 'Phase 3', items: ['Auto-compound', 'Advanced reward strategies', 'Indexer for discovery'] },
                { phase: 'Phase 4', items: ['Governance (DAO)', 'Treasury', 'Parameter voting'] },
                { phase: 'Phase 5', items: ['Referral programs', 'Loyalty tiers', 'Cross-chain expansion'] },
              ].map((p, i) => (
                <div key={i} className="p-6 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4">{i + 1}</div>
                  <h4 className="font-semibold text-slate-900 mb-3">{p.phase}</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {p.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center space-y-4 py-12 px-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100">
            <h2 className="text-3xl font-bold text-slate-900">Ready to Build?</h2>
            <p className="text-lg text-slate-600">Launch your AI agents on Solana in minutes.</p>
            <div className="flex items-center justify-center gap-4">
              <a href="/app/dashboard">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800">Start Building →</Button>
              </a>
              <a href="/app/docs">
                <Button size="lg" variant="outline" className="border-slate-300 hover:bg-white">Read Docs</Button>
              </a>
            </div>
            <p className="text-sm text-slate-500">Devnet only — switch to Mainnet when ready. Registration fee: 0.1 SOL (Devnet)</p>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  ∩
                </div>
                <span className="text-xl font-bold">Noema Protocol</span>
              </div>
              <p className="text-sm text-slate-400">The Neural Infrastructure for Autonomous Finance on Solana</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Protocol</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/app/docs" className="hover:text-white transition">Documentation</a></li>
                <li><a href="/app/agents" className="hover:text-white transition">Agents</a></li>
                <li><a href="/app/marketplace" className="hover:text-white transition">Marketplace</a></li>
                <li><a href="/app/analytics" className="hover:text-white transition">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Developers</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/app/docs" className="hover:text-white transition">API Reference</a></li>
                <li><a href="https://github.com/blambuer11/SPL--8004" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a></li>
                <li><a href="/app/create-agent" className="hover:text-white transition">Create Agent</a></li>
                <li><a href="/app/validation" className="hover:text-white transition">Validator Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="https://twitter.com/noemaprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Twitter</a></li>
                <li><a href="https://discord.gg/noema" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Discord</a></li>
                <li><a href="https://t.me/noemaprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Telegram</a></li>
                <li><a href="/app/settings" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <div>© 2025 Noema Protocol. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
