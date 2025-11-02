import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  Shield, Network, Zap, ArrowRight, CheckCircle2, Code2, 
  TrendingUp, MessageSquare, Wrench, GitBranch, Calendar,
  Users, Sparkles, Bot, Database, Lock, Globe, Cpu, Server,
  Activity, BarChart3, FileCode
} from 'lucide-react';

type MermaidGlobal = { mermaid?: { initialize: (cfg: unknown) => void; run: (opts?: unknown) => void } };

export default function Index() {
  useEffect(() => {
    // Load Mermaid for inline diagrams
    const existing = document.querySelector('script#mermaid-cdn');
    if (!existing) {
      const s = document.createElement('script');
      s.id = 'mermaid-cdn';
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
      s.onload = () => {
        try {
          const m = (window as unknown as MermaidGlobal).mermaid;
          if (m) {
            m.initialize({ startOnLoad: false, theme: 'dark' });
            m.run({ querySelector: '.mermaid' });
          }
        } catch {/* ignore */}
      };
      document.body.appendChild(s);
    } else {
      try {
        const m = (window as unknown as MermaidGlobal).mermaid;
        if (m) m.run({ querySelector: '.mermaid' });
      } catch {/* ignore */}
    }
  }, []);
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Animated Network */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 text-white">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}></div>
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative container mx-auto px-6 py-24 text-center">
          <Badge variant="outline" className="mb-6 border-purple-400 text-purple-300 px-4 py-1 animate-fade-in">
            <Bot className="w-4 h-4 mr-2 inline" />
            Solana's First AI Agent Infrastructure
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-fade-in">
            The AWS of AI Agents
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
            Enterprise-grade protocol infrastructure for autonomous agents. Identity, Communication, Tools & Functions.
          </p>
          
          <div className="flex gap-4 justify-center mb-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Link to="/launch">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition-transform">
                Start Building <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-950">
                Documentation
              </Button>
            </Link>
          </div>

          {/* Start Building Docs Block */}
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 text-left animate-fade-in" style={{animationDelay: '0.5s'}}>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-xl">Architecture (Mermaid)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mermaid text-white/90">
                  {`graph TD;
  A[Wallet] --> B[Register Agent];
  B --> C[Identity PDA];
  B --> D[Reputation PDA];
  C --> E[Submit Validation];
  D --> E;
  E --> F[Score Update];
`}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-xl">Try in CodeSandbox</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
                  <iframe
                    src="https://codesandbox.io/embed/new?codemirror=1"
                    style={{width:'100%', height:'100%', border:0, borderRadius: 8, overflow:'hidden'}}
                    title="CodeSandbox"
                    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Animated Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-400">65K</div>
              <div className="text-sm text-slate-400">TPS Throughput</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Zap className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-400">$0.00005</div>
              <div className="text-sm text-slate-400">Per Transaction</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 animate-fade-in" style={{animationDelay: '0.7s'}}>
              <Shield className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-cyan-400">100%</div>
              <div className="text-sm text-slate-400">On-Chain Proof</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 animate-fade-in" style={{animationDelay: '0.8s'}}>
              <Network className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-400">4</div>
              <div className="text-sm text-slate-400">Protocol Stack</div>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes grid-move {
            0% { transform: translateY(0); }
            100% { transform: translateY(50px); }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </section>

      {/* X402 Facilitator Quick Start */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-6 w-6 text-emerald-600" />
                    <CardTitle>X402 Payments</CardTitle>
                  </div>
                  <Badge className="bg-emerald-500 text-white">Micropayments</Badge>
                </div>
                <CardDescription>USDC-based agent payments with facilitator</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• Sub-cent payments ($0.0001+)</li>
                  <li>• 400ms settlement on Solana</li>
                  <li>• 0.1% platform fee (optional)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle>Facilitator (Local)</CardTitle>
                <CardDescription>Start local gateway on port 3000</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs">
                  <code>{`cd spl-8004-program/x402-facilitator
npm install && npm start
# Health: http://localhost:3000/health`}</code>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle>Integrate in App</CardTitle>
                <CardDescription>Use built-in hook</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs">
                  <code>{`import { useX402 } from '@/hooks/useX402';

const { fetchWithPayment, checkFacilitator } = useX402();
// await fetchWithPayment('/api/agents/alpha');`}</code>
                </div>
                <div className="mt-3 text-sm">
                  <Link to="/docs#x402-protocol" className="text-purple-700 font-medium inline-flex items-center">
                    Read Docs <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* How It Works - Animated Flow */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white opacity-50"></div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 mb-4">
              <Activity className="w-4 h-4 mr-2" />
              Simple 3-Step Process
            </Badge>
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From registration to reputation, everything on-chain
            </p>
          </div>
          
          {/* Flow Diagram */}
          <div className="max-w-6xl mx-auto relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 -translate-y-1/2" style={{zIndex: 0}}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 animate-pulse"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative" style={{zIndex: 1}}>
              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl hover:-translate-y-2 duration-300 bg-white">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-center">
                    <Badge className="bg-purple-100 text-purple-700 mb-2">Step 1</Badge>
                    <CardTitle className="text-xl">Register Agent</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 mb-4">Create on-chain identity with SPL-8004 protocol</p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs text-left">
                    <code>await client.registerAgent()</code>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-xl hover:-translate-y-2 duration-300 bg-white">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-center">
                    <Badge className="bg-blue-100 text-blue-700 mb-2">Step 2</Badge>
                    <CardTitle className="text-xl">Execute Tasks</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 mb-4">Perform work and interact with other agents</p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs text-left">
                    <code>await agent.execute(task)</code>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-cyan-200 hover:border-cyan-400 transition-all hover:shadow-xl hover:-translate-y-2 duration-300 bg-white">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-center">
                    <Badge className="bg-cyan-100 text-cyan-700 mb-2">Step 3</Badge>
                    <CardTitle className="text-xl">Earn Reputation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 mb-4">Build verifiable on-chain reputation score</p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs text-left">
                    <code>score = await getScore()</code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Stack - Architecture Diagram */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 mb-4">
              <Globe className="w-4 h-4 mr-2" />
              Four Protocol Standard
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Complete Protocol Stack</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything AI agents need in one infrastructure
            </p>
          </div>
          
          {/* Architecture Layers */}
          <div className="max-w-7xl mx-auto mb-12">
            <div className="relative">
              {/* Layer Diagram */}
              <div className="space-y-4">
                {/* Application Layer */}
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Bot className="h-6 w-6 text-purple-600" />
                    <h3 className="font-bold text-lg">Application Layer</h3>
                  </div>
                  <p className="text-sm text-slate-600">Trading Bots, Support Agents, Data Providers, Content Creators</p>
                </div>
                
                {/* Protocol Layer */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border-2 border-purple-200 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="h-6 w-6 text-purple-600" />
                      <Badge className="bg-green-500 text-white text-xs">Live</Badge>
                    </div>
                    <h4 className="font-bold mb-1">SPL-8004</h4>
                    <p className="text-xs text-slate-600">Identity & Reputation</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border-2 border-blue-200 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                      <Badge className="bg-blue-500 text-white text-xs">Q1 '26</Badge>
                    </div>
                    <h4 className="font-bold mb-1">SPL-ACP</h4>
                    <p className="text-xs text-slate-600">Communication</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-white p-4 rounded-lg border-2 border-cyan-200 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Wrench className="h-6 w-6 text-cyan-600" />
                      <Badge className="bg-cyan-500 text-white text-xs">Q2 '26</Badge>
                    </div>
                    <h4 className="font-bold mb-1">SPL-TAP</h4>
                    <p className="text-xs text-slate-600">Tool Abstraction</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border-2 border-purple-200 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <GitBranch className="h-6 w-6 text-purple-600" />
                      <Badge className="bg-purple-500 text-white text-xs">Q2 '26</Badge>
                    </div>
                    <h4 className="font-bold mb-1">SPL-FCP</h4>
                    <p className="text-xs text-slate-600">Function Calls</p>
                  </div>
                </div>
                
                {/* Infrastructure Layer */}
                <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-6 rounded-xl border-2 border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Server className="h-6 w-6 text-slate-600" />
                    <h3 className="font-bold text-lg">Solana Infrastructure</h3>
                  </div>
                  <p className="text-sm text-slate-600">65K TPS, $0.00005/tx, Sub-second Finality</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Protocol Details Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-purple-200 hover:shadow-2xl transition-all group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 group-hover:scale-110 transition-transform">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-green-500 text-white">✓ Live on Devnet</Badge>
                </div>
                <CardTitle className="text-2xl mt-4">SPL-8004</CardTitle>
                <CardDescription className="text-base">Identity & Reputation System</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>On-chain agent registry with PDA accounts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Dynamic reputation scoring (0-10K)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Validation history & reward mechanisms</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-200 hover:shadow-2xl transition-all group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-blue-500 text-white">Q1 2026</Badge>
                </div>
                <CardTitle className="text-2xl mt-4">SPL-ACP</CardTitle>
                <CardDescription className="text-base">Agent Communication Protocol</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Peer-to-peer messaging between agents</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Encrypted communication channels</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Multi-agent coordination primitives</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-cyan-200 hover:shadow-2xl transition-all group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 group-hover:scale-110 transition-transform">
                    <Wrench className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-cyan-500 text-white">Q2 2026</Badge>
                </div>
                <CardTitle className="text-2xl mt-4">SPL-TAP</CardTitle>
                <CardDescription className="text-base">Tool Abstraction Protocol</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5" />
                    <span>Composable tool registry & marketplace</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5" />
                    <span>Permission management & access control</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5" />
                    <span>Usage metering & micropayments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-200 hover:shadow-2xl transition-all group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 group-hover:scale-110 transition-transform">
                    <GitBranch className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-purple-500 text-white">Q2 2026</Badge>
                </div>
                <CardTitle className="text-2xl mt-4">SPL-FCP</CardTitle>
                <CardDescription className="text-base">Function Call Protocol</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span>Workflow orchestration engine</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span>Multi-step execution with state management</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span>Error handling & rollback mechanisms</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits - Comparison Chart */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-purple-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-10"></div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 mb-4">
              <BarChart3 className="w-4 h-4 mr-2" />
              Performance Metrics
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Why Build on Noema?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Unmatched performance on Solana blockchain
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-2xl group bg-white">
              <CardHeader>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl mb-2">1000x Faster</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-purple-600 mb-2">65K</div>
                <p className="text-slate-600 mb-4">Transactions per second</p>
                <div className="bg-purple-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Ethereum</span>
                    <span className="font-mono">15 TPS</span>
                  </div>
                  <div className="flex justify-between font-bold text-purple-700">
                    <span>Solana</span>
                    <span className="font-mono">65,000 TPS</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-2xl group bg-white">
              <CardHeader>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl mb-2">1000x Cheaper</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-blue-600 mb-2">$0.00005</div>
                <p className="text-slate-600 mb-4">Per transaction cost</p>
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Ethereum</span>
                    <span className="font-mono">$0.50-$5</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-700">
                    <span>Solana</span>
                    <span className="font-mono">$0.00005</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-cyan-200 hover:border-cyan-400 transition-all hover:shadow-2xl group bg-white">
              <CardHeader>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl mb-2">100% Verifiable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-cyan-600 mb-2">On-Chain</div>
                <p className="text-slate-600 mb-4">Cryptographic proof</p>
                <div className="bg-cyan-50 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-cyan-600" />
                    <span className="font-semibold">Immutable Records</span>
                  </div>
                  <p className="text-slate-600 text-xs">Every action signed & stored permanently</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases - Interactive Cards */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-700 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Real-World Applications
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Enterprise Use Cases</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Proven ROI across multiple industries
            </p>
          </div>
          
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-2xl transition-all group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-700 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-green-100 text-green-700">DeFi</Badge>
                </div>
                <CardTitle className="text-xl mb-2">Trading Bots</CardTitle>
                <CardDescription>High-frequency DeFi execution with verifiable performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-700 mb-1">$500K-2M</div>
                  <div className="text-sm text-green-600">Annual Revenue per Agent</div>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Automated trading strategies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>On-chain performance history</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 group-hover:scale-110 transition-transform">
                    <Network className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Platform</Badge>
                </div>
                <CardTitle className="text-xl mb-2">Task Marketplaces</CardTitle>
                <CardDescription>Decentralized work coordination and agent hiring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-700 mb-1">5-15%</div>
                  <div className="text-sm text-blue-600">Platform Fee on Volume</div>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>Escrow & payment automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>Reputation-based matching</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl transition-all group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 group-hover:scale-110 transition-transform">
                    <Database className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">Data</Badge>
                </div>
                <CardTitle className="text-xl mb-2">Data Providers</CardTitle>
                <CardDescription>Real-time data feeds with usage-based billing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-700 mb-1">$100-500</div>
                  <div className="text-sm text-purple-600">Monthly per Agent</div>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    <span>API monetization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    <span>Micropayment streaming</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-2xl transition-all group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-cyan-400 to-cyan-600"></div>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-cyan-100 text-cyan-700">Support</Badge>
                </div>
                <CardTitle className="text-xl mb-2">Customer Support</CardTitle>
                <CardDescription>24/7 AI-powered support with quality tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-cyan-700 mb-1">70%</div>
                  <div className="text-sm text-cyan-600">Cost Reduction</div>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                    <span>Performance scoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                    <span>Multi-language support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-2xl transition-all group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">Analytics</Badge>
                </div>
                <CardTitle className="text-xl mb-2">Business Intelligence</CardTitle>
                <CardDescription>Automated insights with data provenance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-700 mb-1">$200-1K</div>
                  <div className="text-sm text-yellow-600">Per Client Monthly</div>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                    <span>Real-time dashboards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                    <span>Predictive analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-pink-200 hover:border-pink-400 hover:shadow-2xl transition-all group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-pink-400 to-pink-600"></div>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-pink-700 group-hover:scale-110 transition-transform">
                    <FileCode className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-pink-100 text-pink-700">Content</Badge>
                </div>
                <CardTitle className="text-xl mb-2">Content Creators</CardTitle>
                <CardDescription>Automated publishing with attribution tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-pink-700 mb-1">$50-300</div>
                  <div className="text-sm text-pink-600">Monthly per Agent</div>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-600" />
                    <span>Multi-platform distribution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-600" />
                    <span>Copyright protection</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Roadmap - Timeline Visualization */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <Badge className="bg-purple-500 text-white mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              Development Timeline
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Product Roadmap</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              From foundation to full protocol stack
            </p>
          </div>
          
          {/* Timeline */}
          <div className="max-w-5xl mx-auto relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500 transform -translate-x-1/2"></div>
            
            <div className="space-y-12">
              {/* Phase 0 */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
                  <div className="md:text-right mb-4 md:mb-0">
                    <Card className="bg-gradient-to-br from-green-900 to-green-950 border-2 border-green-500 hover:scale-105 transition-transform">
                      <CardHeader>
                        <div className="flex items-center justify-between md:flex-row-reverse">
                          <Badge className="bg-green-500 text-white">✓ Complete</Badge>
                          <CardTitle className="text-white">Phase 0: Foundation</CardTitle>
                        </div>
                        <CardDescription className="text-green-200">Nov-Dec 2025</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-green-100 space-y-1">
                          <li>• SPL-8004 program deployed (Devnet)</li>
                          <li>• Web platform & agent registration</li>
                          <li>• TypeScript SDK & documentation</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-green-500 border-4 border-slate-900 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Phase 1 */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
                  <div className="md:col-start-2">
                    <Card className="bg-gradient-to-br from-blue-900 to-blue-950 border-2 border-blue-500 hover:scale-105 transition-transform">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-blue-500 text-white animate-pulse">🔨 In Progress</Badge>
                          <CardTitle className="text-white">Phase 1: Monetization</CardTitle>
                        </div>
                        <CardDescription className="text-blue-200">Jan-Feb 2026</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-blue-100 space-y-1">
                          <li>• Solana Pay integration (USDC)</li>
                          <li>• API key system with rate limiting</li>
                          <li>• Pay-as-you-go pricing model</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="hidden md:flex items-center justify-center md:col-start-1 md:row-start-1">
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-4 border-slate-900 flex items-center justify-center animate-pulse">
                      <Cpu className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Phase 2 */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
                  <div className="md:text-right">
                    <Card className="bg-gradient-to-br from-purple-900 to-purple-950 border-2 border-purple-500 hover:scale-105 transition-transform">
                      <CardHeader>
                        <div className="flex items-center justify-between md:flex-row-reverse">
                          <Badge className="border border-purple-400 text-purple-300" variant="outline">📅 Q1 2026</Badge>
                          <CardTitle className="text-white">Phase 2: Communication</CardTitle>
                        </div>
                        <CardDescription className="text-purple-200">Q1 2026</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-purple-100 space-y-1">
                          <li>• SPL-ACP protocol development</li>
                          <li>• P2P messaging between agents</li>
                          <li>• Multi-agent coordination</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-purple-500 border-4 border-slate-900 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Phase 3-4 */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
                  <div className="md:col-start-2">
                    <Card className="bg-gradient-to-br from-cyan-900 to-cyan-950 border-2 border-cyan-500 hover:scale-105 transition-transform">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge className="border border-cyan-400 text-cyan-300" variant="outline">📅 Q2 2026</Badge>
                          <CardTitle className="text-white">Phase 3-4: Full Stack</CardTitle>
                        </div>
                        <CardDescription className="text-cyan-200">Q2 2026</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-cyan-100 space-y-1">
                          <li>• SPL-TAP & SPL-FCP protocols</li>
                          <li>• Tool marketplace & orchestration</li>
                          <li>• Mainnet deployment & partnerships</li>
                          <li>• Cross-chain bridge research</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="hidden md:flex items-center justify-center md:col-start-1 md:row-start-1">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 border-4 border-slate-900 flex items-center justify-center">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build?
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Join the enterprise AI agent infrastructure on Solana
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/agents">
              <Button size="lg" className="bg-white text-purple-900">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
