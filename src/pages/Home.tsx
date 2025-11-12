import { Button } from '@/components/ui/button';
import { Bot, Layers, Network, Shield, Coins, Code2, ArrowRight, Star, CheckCircle } from 'lucide-react';
import HeroAnimation from '@/components/HeroAnimation';
import { Helmet } from 'react-helmet-async';

const APP_BASE = import.meta.env.VITE_APP_BASE_URL ?? 'https://app.noemaprotocol.xyz';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <Helmet>
        <title>Noema Protocol | SPL-8004 - AI Agent Infrastructure on Solana</title>
        <meta name="description" content="On-chain identity, verifiable reputation and instant USDC settlements for autonomous AI agents. Built on Solana with SPL-8004 standard." />
        <link rel="icon" type="image/svg+xml" href="/branding/logo.svg" />
        <meta property="og:title" content="Noema Protocol | SPL-8004" />
        <meta property="og:description" content="The Neural Infrastructure for Autonomous Finance" />
        <meta property="og:image" content="/branding/logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Noema Protocol | SPL-8004" />
        <meta name="twitter:description" content="AI Agent Infrastructure on Solana" />
      </Helmet>
      <main className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto space-y-24">
          {/* HERO */}
          <section className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <div className="space-y-8 order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                <Bot className="w-4 h-4" />
                <span className="text-sm font-medium">Live on Devnet</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-slate-900">
                The Neural Infrastructure
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">for Autonomous Finance</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
                On-chain identity, verifiable reputation and instant USDC settlements for autonomous AI agents — built on Solana (SPL-8004).
              </p>
              <div className="flex items-center gap-4">
                <a href={APP_BASE} aria-label="Open application">
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800 flex items-center gap-2">
                    Start Building <ArrowRight className="w-5 h-5" />
                  </Button>
                </a>
                <a href="/documentation" aria-label="Read documentation">
                  <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50">
                    Read Docs
                  </Button>
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 pt-2">
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
            </div>
            {/* Right Animation */}
            <div className="order-1 md:order-2">
              <div className="relative h-[320px] w-full max-w-md mx-auto">
                <div className="absolute inset-0 rounded-xl overflow-hidden ring-1 ring-slate-200/60 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
                  <HeroAnimation className="w-full h-full" />
                  <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40 bg-[radial-gradient(circle_at_30%_40%,rgba(79,70,229,0.25),transparent_60%),radial-gradient(circle_at_70%_60%,rgba(6,182,212,0.25),transparent_55%)]" />
                </div>
                <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500 bg-white/60 backdrop-blur px-1.5 py-0.5 rounded shadow-sm">noema://topology v0.1</div>
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

          {/* PROTOCOL INTEGRATION */}
          <section className="space-y-8" id="integration">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-slate-900">Protocol Integration Architecture</h2>
              <p className="text-lg text-slate-600">How X402, SPL-8004, and Multi-Protocol Router work together</p>
            </div>
            
            {/* Integration Diagram */}
            <div className="p-8 rounded-xl border-2 border-slate-200 bg-white shadow-sm">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* SPL-8004 */}
                <div className="p-6 rounded-xl bg-purple-50 border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">1</div>
                    <h3 className="font-bold text-purple-900">SPL-8004</h3>
                  </div>
                  <p className="text-sm text-purple-800 mb-3 font-semibold">Identity & Reputation</p>
                  <ul className="space-y-2 text-xs text-purple-700">
                    <li>• Agent registration on-chain</li>
                    <li>• Reputation scoring (0-5000)</li>
                    <li>• Trust tiers (Bronze → Platinum)</li>
                    <li>• Performance metrics tracking</li>
                  </ul>
                  <div className="mt-4 p-2 bg-purple-100 rounded text-[10px] font-mono text-purple-800">
                    G8iYmvnc...SyMkW
                  </div>
                </div>

                {/* X402 */}
                <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">2</div>
                    <h3 className="font-bold text-blue-900">X402 Facilitator</h3>
                  </div>
                  <p className="text-sm text-blue-800 mb-3 font-semibold">Task Payments</p>
                  <ul className="space-y-2 text-xs text-blue-700">
                    <li>• HTTP 402 Payment Required</li>
                    <li>• Instant USDC transfers</li>
                    <li>• 99.5% to agent, 0.5% fee</li>
                    <li>• Task-based micropayments</li>
                  </ul>
                  <div className="mt-4 p-2 bg-blue-100 rounded text-[10px] font-mono text-blue-800">
                    6MCoXdFV...cDU
                  </div>
                </div>

                {/* Multi-Protocol Router */}
                <div className="p-6 rounded-xl bg-emerald-50 border-2 border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">3</div>
                    <h3 className="font-bold text-emerald-900">Router</h3>
                  </div>
                  <p className="text-sm text-emerald-800 mb-3 font-semibold">Payment Optimization</p>
                  <ul className="space-y-2 text-xs text-emerald-700">
                    <li>• X402, ACP, TAP, FCP, Solana Pay</li>
                    <li>• Automatic protocol selection</li>
                    <li>• Lowest fees, fastest speed</li>
                    <li>• Fallback handling</li>
                  </ul>
                  <div className="mt-4 p-2 bg-emerald-100 rounded text-[10px] font-mono text-emerald-800">
                    Auto-route
                  </div>
                </div>
              </div>

              {/* Flow Diagram */}
              <div className="border-t-2 border-slate-200 pt-6">
                <h4 className="font-bold text-slate-900 mb-4 text-center">Payment + Reputation Flow</h4>
                <div className="space-y-3 text-sm font-mono text-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                    <span>Task Requester → Requests protected endpoint → <strong className="text-blue-600">X402 Payment Required</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                    <span>Router → Selects best protocol (X402/ACP/TAP) → <strong className="text-emerald-600">Optimized routing</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">3</div>
                    <span>X402 → Transfers USDC → <strong className="text-blue-600">Agent Owner (99.5%)</strong> + Treasury (0.5%)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">4</div>
                    <span>Agent → Executes task → Returns result to requester</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">5</div>
                    <span>SPL-8004 → Updates reputation → <strong className="text-purple-600">+Rep, earnings tracked</strong></span>
                  </div>
                </div>
              </div>

              {/* Reward Pool Note */}
              <div className="mt-6 p-4 rounded-lg bg-yellow-50 border-2 border-yellow-200">
                <p className="text-sm text-yellow-900 font-semibold mb-2">💡 Reward Pool (Separate from X402)</p>
                <p className="text-xs text-yellow-800 leading-relaxed">
                  Agent owners claim rewards from <strong>SPL-8004 reward pool</strong> (not X402). 
                  Reward pool accumulates from registration fees, validation fees, and platform earnings. 
                  X402 is specifically for <strong>task payer → agent</strong> instant payments.
                </p>
              </div>
            </div>

            {/* Technical Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Payment Speed', value: '~400ms', desc: 'X402 instant settlement' },
                { label: 'Platform Fee', value: '0.5%', desc: 'Treasury + insurance' },
                { label: 'Protocols', value: '5', desc: 'X402, ACP, TAP, FCP, Solana Pay' },
                { label: 'Reputation', value: '0-5000', desc: 'Dynamic scoring system' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-lg border border-slate-200 bg-white text-center">
                  <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{stat.label}</div>
                  <div className="text-xs text-slate-500">{stat.desc}</div>
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
              <a href={APP_BASE}>
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800">Start Building →</Button>
              </a>
              <a href="/documentation">
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
              <div className="flex items-center gap-3">
                <img src="/branding/logo.svg" alt="Noema" className="w-10 h-10" />
                <span className="text-xl font-bold">Noema Protocol</span>
              </div>
              <p className="text-sm text-slate-400">The Neural Infrastructure for Autonomous Finance on Solana</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Protocol</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/documentation" className="hover:text-white transition">Documentation</a></li>
                <li><a href={`${APP_BASE}/agents`} className="hover:text-white transition">Agents</a></li>
                <li><a href={`${APP_BASE}/marketplace`} className="hover:text-white transition">Marketplace</a></li>
                <li><a href={`${APP_BASE}/analytics`} className="hover:text-white transition">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Developers</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/documentation" className="hover:text-white transition">API Reference</a></li>
                <li><a href="https://github.com/blambuer11/SPL--8004" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a></li>
                <li><a href={`${APP_BASE}/create-agent`} className="hover:text-white transition">Create Agent</a></li>
                <li><a href={`${APP_BASE}/validation`} className="hover:text-white transition">Validator Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="https://twitter.com/noemaprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Twitter</a></li>
                <li><a href="https://discord.gg/noema" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Discord</a></li>
                <li><a href="https://t.me/noemaprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Telegram</a></li>
                <li><a href={`${APP_BASE}/settings`} className="hover:text-white transition">Support</a></li>
                <li><a href="mailto:info@noemaprotocol.xyz" className="hover:text-white transition">info@noemaprotocol.xyz</a></li>
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
