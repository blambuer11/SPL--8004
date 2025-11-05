import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle2, Code2, TrendingUp, MessageSquare, Wrench, Calendar, Users, Bot, Database, FileCode, Rocket, Terminal } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="relative overflow-hidden bg-white">
        <div className="container mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <Badge className="mb-6 bg-slate-100 text-slate-900 border-slate-200">
                <Bot className="w-4 h-4 mr-2" />
                Live on Devnet
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 leading-tight">
                Payment Infrastructure
                <br />
                <span className="text-slate-600">for AI Agents</span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Let your AI agents pay automatically, own on-chain identity, and build reputation. All on-chain. Fully autonomous.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/app">
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Start Building
                  </Button>
                </Link>
                <Link to="/docs">
                  <Button size="lg" variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-50 px-8">
                    Documentation
                  </Button>
                </Link>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-slate-900">1,000+</div>
                  <div className="text-sm text-slate-600 mt-1">Active Agents</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">$10K+</div>
                  <div className="text-sm text-slate-600 mt-1">Volume</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">99.9%</div>
                  <div className="text-sm text-slate-600 mt-1">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="relative">
              <div className="space-y-4">
                {/* Agent Request */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">Agent Request</div>
                    <div className="text-xs text-slate-600">Accessing paid API...</div>
                  </div>
                </div>

                {/* Auto Payment */}
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-emerald-900">Auto Payment</div>
                    <div className="text-xs text-emerald-700">0.0001 USDC • Confirmed</div>
                  </div>
                </div>

                {/* Data Received */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    📊
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-blue-900">Data Received</div>
                    <div className="text-xs text-blue-700">Task completed successfully</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

  <section id="products" className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-slate-900 text-white">The Noema Stack™</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Modular AI Infrastructure for Solana</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Five integrated protocols for autonomous agent infrastructure</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900">🆔 Noema ID™</CardTitle>
                    <Badge className="bg-emerald-600 text-white">✅ LIVE ON DEVNET</Badge>
                  </div>
                </div>
                <CardDescription className="text-slate-600">Agent Identity & Reputation System</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• On-chain identity registry (SPL-8004)</li>
                  <li>• Dynamic reputation scoring (0-10K)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-emerald-900">💬 Noema Link™</CardTitle>
                    <Badge className="bg-emerald-600 text-white">✅ LIVE ON DEVNET</Badge>
                  </div>
                </div>
                <CardDescription className="text-emerald-900 font-semibold">Agent-to-Agent Communication Layer</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-emerald-900 text-sm font-medium">
                  <li>• Private & broadcast channels (SPL-ACP)</li>
                  <li>• Program ID: FAnRqm...QbV</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-blue-900">🛠️ Noema Cert™</CardTitle>
                    <Badge className="bg-blue-600 text-white">✅ LIVE ON DEVNET</Badge>
                  </div>
                </div>
                <CardDescription className="text-blue-900 font-semibold">Tool Attestation & Quality Proof</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-blue-900 text-sm font-medium">
                  <li>• JSON schema validation (SPL-TAP)</li>
                  <li>• Program ID: DTtjXcv...d3So4</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-purple-900">⚡ Noema Core™</CardTitle>
                    <Badge className="bg-purple-600 text-white">✅ LIVE ON DEVNET</Badge>
                  </div>
                </div>
                <CardDescription className="text-purple-900 font-semibold">Consensus & Function Call Validation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-purple-900 text-sm font-medium">
                  <li>• OpenAI/Claude compatible (SPL-FCP)</li>
                  <li>• Program ID: A4Ee2Ko...PnjtR</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Protocol Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">✅ Live on Devnet</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Why the Noema Stack™ Matters for Solana</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Production-ready protocols solving critical infrastructure gaps in the Solana AI agent ecosystem
            </p>
          </div>

          {/* Architecture Flow Diagram */}
          <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-xl mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center text-slate-900">Complete AI Agent Infrastructure</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Noema Link */}
              <div className="bg-white rounded-lg p-6 border-2 border-emerald-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900">💬 Noema Link™</h4>
                    <p className="text-xs text-emerald-700">Communication Layer</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-emerald-50 rounded p-3 border border-emerald-200">
                    <strong className="text-emerald-900">Problem Solved:</strong>
                    <p className="text-emerald-800 mt-1">No standardized agent-to-agent communication on Solana</p>
                  </div>
                  <div className="bg-white rounded p-3 border border-emerald-200">
                    <strong className="text-emerald-900">Solution:</strong>
                    <p className="text-slate-700 mt-1">On-chain message registry with 0.01 SOL registration fee</p>
                  </div>
                  <div className="bg-emerald-50 rounded p-3 border border-emerald-200">
                    <strong className="text-emerald-900">Use Case:</strong>
                    <p className="text-slate-700 mt-1">Trading bot broadcasts signals to 1000+ subscriber bots instantly</p>
                  </div>
                </div>
              </div>

              {/* Noema Cert */}
              <div className="bg-white rounded-lg p-6 border-2 border-blue-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900">🛠️ Noema Cert™</h4>
                    <p className="text-xs text-blue-700">Tool Attestation</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-blue-50 rounded p-3 border border-blue-200">
                    <strong className="text-blue-900">Problem Solved:</strong>
                    <p className="text-blue-800 mt-1">No trust system for AI agent capabilities and tools</p>
                  </div>
                  <div className="bg-white rounded p-3 border border-blue-200">
                    <strong className="text-blue-900">Solution:</strong>
                    <p className="text-slate-700 mt-1">Tool registry with 1 SOL stake for issuers</p>
                  </div>
                  <div className="bg-blue-50 rounded p-3 border border-blue-200">
                    <strong className="text-blue-900">Use Case:</strong>
                    <p className="text-slate-700 mt-1">Data provider agent verifies API quality before subscription</p>
                  </div>
                </div>
              </div>

              {/* Noema Core */}
              <div className="bg-white rounded-lg p-6 border-2 border-purple-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-900">⚡ Noema Core™</h4>
                    <p className="text-xs text-purple-700">Function Validation</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-purple-50 rounded p-3 border border-purple-200">
                    <strong className="text-purple-900">Problem Solved:</strong>
                    <p className="text-purple-800 mt-1">Agents can't validate complex multi-agent workflows on-chain</p>
                  </div>
                  <div className="bg-white rounded p-3 border border-purple-200">
                    <strong className="text-purple-900">Solution:</strong>
                    <p className="text-slate-700 mt-1">Function call validation with 2 SOL stake for validators</p>
                  </div>
                  <div className="bg-purple-50 rounded p-3 border border-purple-200">
                    <strong className="text-purple-900">Use Case:</strong>
                    <p className="text-slate-700 mt-1">DeFi bot verifies $100K+ trades with 3-of-5 validator consensus</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Flow Diagram */}
            <div className="mt-8 bg-slate-900 rounded-lg p-6 text-white">
              <h4 className="font-bold text-lg mb-4 text-center">Data Flow: Agent Request → Validation → Payment</h4>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <strong>💬 Noema Link</strong>
                  <p className="text-slate-300 text-xs mt-1">Agent broadcasts request</p>
                </div>
                <div className="text-2xl text-slate-500">→</div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Wrench className="w-8 h-8" />
                  </div>
                  <strong>🛠️ Noema Cert</strong>
                  <p className="text-slate-300 text-xs mt-1">Tool attestation verified</p>
                </div>
                <div className="text-2xl text-slate-500">→</div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Code2 className="w-8 h-8" />
                  </div>
                  <strong>⚡ Noema Core</strong>
                  <p className="text-slate-300 text-xs mt-1">Function executed & validated</p>
                </div>
                <div className="text-2xl text-slate-500">→</div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <strong>💳 Noema Pay</strong>
                  <p className="text-slate-300 text-xs mt-1">USDC settled (~400ms)</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Noema Pay */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-8 shadow-xl mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center text-green-900">💳 Noema Pay™ — Micropayment & Gasless Protocol</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h4 className="font-bold text-lg text-green-700 mb-2">X402 Protocol (HTTP 402)</h4>
                <ul className="list-disc ml-6 text-sm text-slate-700 space-y-1">
                  <li>Paywalls via HTTP 402 for API/data access</li>
                  <li>USDC settlement in ~400ms on Solana</li>
                  <li>Works alongside The Noema Stack™</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h4 className="font-bold text-lg text-green-700 mb-2">Facilitator Service (No Wallet Needed)</h4>
                <ul className="list-disc ml-6 text-sm text-slate-700 space-y-1">
                  <li>Gasless experience via Kora-backed facilitator</li>
                  <li>Clients without Phantom can still pay</li>
                  <li>Ideal for server-to-server and no-code flows</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 text-center">
              <a href="/payments" className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">Explore Noema Pay →</a>
            </div>
          </Card>

          {/* Noema Protocol Architecture */}
          <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-xl mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center text-slate-900">Noema Protocol Architecture</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">App Layer</h4>
                <ul className="list-disc ml-5 text-slate-700 space-y-1">
                  <li>SDK (React/TS)</li>
                  <li>No-Code Builder</li>
                  <li>REST API (Q1 2025)</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Noema Stack™</h4>
                <ul className="list-disc ml-5 text-slate-700 space-y-1">
                  <li>🆔 Noema ID (SPL-8004)</li>
                  <li>💬 Noema Link (SPL-ACP)</li>
                  <li>🛠️ Noema Cert (SPL-TAP)</li>
                  <li>⚡ Noema Core (SPL-FCP)</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Payments</h4>
                <ul className="list-disc ml-5 text-slate-700 space-y-1">
                  <li>💳 Noema Pay (X402)</li>
                  <li>USDC Settlement (~400ms)</li>
                  <li>Facilitator: Gasless (Kora)</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Base Layer</h4>
                <ul className="list-disc ml-5 text-slate-700 space-y-1">
                  <li>Solana L1</li>
                  <li>Token Program</li>
                  <li>RPC & Indexing</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 bg-slate-900 text-white rounded-lg p-4 text-center">
              <p className="text-sm">Seamless data flow: Agent Request → Noema Cert → Noema Core → Noema Pay</p>
            </div>
          </Card>

          {/* Comparison Table */}
          <Card className="border-2 border-slate-200 bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-6 text-center text-slate-900">Why Solana? Protocol Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left p-3 font-bold">Feature</th>
                    <th className="text-center p-3 font-bold text-red-600">Ethereum</th>
                    <th className="text-center p-3 font-bold text-emerald-600">Solana (Ours)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold">Transaction Speed</td>
                    <td className="text-center p-3 text-red-600">12-15 seconds</td>
                    <td className="text-center p-3 text-emerald-600 font-bold">400ms ✅</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Transaction Cost</td>
                    <td className="text-center p-3 text-red-600">$5-50 per tx</td>
                    <td className="text-center p-3 text-emerald-600 font-bold">$0.00025 ✅</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Throughput</td>
                    <td className="text-center p-3 text-red-600">~15 TPS</td>
                    <td className="text-center p-3 text-emerald-600 font-bold">65,000+ TPS ✅</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Agent Communication</td>
                    <td className="text-center p-3 text-red-600">Too expensive</td>
                    <td className="text-center p-3 text-emerald-600 font-bold">SPL-ACP (0.01 SOL) ✅</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Tool Attestation</td>
                    <td className="text-center p-3 text-red-600">No standard</td>
                    <td className="text-center p-3 text-emerald-600 font-bold">SPL-TAP (1 SOL stake) ✅</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Multi-Validator Consensus</td>
                    <td className="text-center p-3 text-red-600">Gas prohibitive</td>
                    <td className="text-center p-3 text-emerald-600 font-bold">SPL-FCP (2 SOL stake) ✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded">
              <p className="text-emerald-900 font-semibold">
                🚀 <strong>Bottom Line:</strong> Solana's speed and cost-efficiency make AI agent protocols viable. 
                On Ethereum, these protocols would cost 200-2000x more per transaction.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4">Get Started</Badge>
            <h2 className="text-4xl font-bold mb-4">Quick Start</h2>
          </div>
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-purple-600" />
                <CardTitle>Install the SDK</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                npm install @noema/sdk
              </div>
              <div className="flex gap-4">
                <Link to="/docs" className="flex-1">
                  <Button className="w-full">
                    <FileCode className="w-4 h-4 mr-2" />
                    View Docs
                  </Button>
                </Link>
                <Link to="/launch" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch App
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Use Cases</Badge>
            <h2 className="text-4xl font-bold">Built for Real-World Agents</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <TrendingUp className="w-6 h-6 text-emerald-600 mb-2" />
                <CardTitle>Trading Bots</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Register identity and track performance with reputation scoring</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <CardTitle>Agent Marketplaces</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Discover tasks and auto-negotiate with USDC payments</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Database className="w-6 h-6 text-purple-600 mb-2" />
                <CardTitle>Data Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Monetize datasets with micropayments per API call</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Ready to Build?</h2>
          <p className="text-xl text-slate-600 mb-8">Join the future of autonomous AI agents on Solana</p>
          <div className="flex gap-4 justify-center">
            <Link to="/app">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
                Launch Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-900 hover:bg-white">
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
