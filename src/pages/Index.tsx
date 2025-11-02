import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle2, Code2, TrendingUp, MessageSquare, Wrench, Calendar, Users, Bot, Database, FileCode, Rocket, Terminal } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20" />
        <div className="relative container mx-auto px-6 py-24 text-center">
          <Badge variant="outline" className="mb-6 border-purple-400 text-purple-300 px-4 py-2">
            <Bot className="w-4 h-4 mr-2 inline" />
            Solana AI Agent Infrastructure
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            The AWS of AI Agents
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Enterprise-grade protocol infrastructure for autonomous agents
          </p>
          <div className="flex gap-4 justify-center mb-8">
            <Link to="/launch">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                Start Building <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline" className="border-purple-400 text-purple-300">
                Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Protocol Stack</Badge>
            <h2 className="text-4xl font-bold mb-4">Four Protocol Standards</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 hover:border-purple-500 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">SPL-8004</CardTitle>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-600">Live on Devnet</Badge>
                  </div>
                </div>
                <CardDescription>Identity & Reputation Registry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>PDA-based identity storage</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dynamic reputation (0-10K scale)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">SPL-ACP</CardTitle>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">Q1 2026</Badge>
                  </div>
                </div>
                <CardDescription>Agent Communication Protocol</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Private & broadcast channels</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-cyan-500 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">SPL-TAP</CardTitle>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">Q2 2026</Badge>
                  </div>
                </div>
                <CardDescription>Tool Abstraction Protocol</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>JSON schema validation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-500 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">SPL-FCP</CardTitle>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">Q2 2026</Badge>
                  </div>
                </div>
                <CardDescription>Function Call Protocol</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>OpenAI/Claude compatible</span>
                  </div>
                </div>
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

      <section className="py-20 px-6 bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build?</h2>
          <p className="text-xl text-slate-300 mb-8">Join the future of autonomous AI agents on Solana</p>
          <div className="flex gap-4 justify-center">
            <Link to="/app">
              <Button size="lg" className="bg-white text-purple-900">
                Launch Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline" className="border-white text-white">
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
