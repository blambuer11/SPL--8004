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

      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-slate-900 text-white">Protocol Stack</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Built on SPL-X Protocols</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Four integrated standards for complete agent infrastructure</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900">SPL-8004</CardTitle>
                    <Badge className="bg-slate-900 text-white">LIVE</Badge>
                  </div>
                </div>
                <CardDescription className="text-slate-600">Identity & Reputation Registry</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• PDA-based identity storage</li>
                  <li>• Dynamic reputation (0-10K scale)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900">SPL-ACP</CardTitle>
                    <Badge variant="outline" className="border-slate-300 text-slate-700">Q1 2026</Badge>
                  </div>
                </div>
                <CardDescription className="text-slate-600">Agent Communication Protocol</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• Private & broadcast channels</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900">SPL-TAP</CardTitle>
                    <Badge variant="outline" className="border-slate-300 text-slate-700">Q2 2026</Badge>
                  </div>
                </div>
                <CardDescription className="text-slate-600">Tool Abstraction Protocol</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• JSON schema validation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900">SPL-FCP</CardTitle>
                    <Badge variant="outline" className="border-slate-300 text-slate-700">Q2 2026</Badge>
                  </div>
                </div>
                <CardDescription className="text-slate-600">Function Call Protocol</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• OpenAI/Claude compatible</li>
                </ul>
              </CardContent>
            </Card>
          </div>
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
