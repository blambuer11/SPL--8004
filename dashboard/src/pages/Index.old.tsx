import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, CheckCircle2, Coins, Network, Zap, Users, ArrowRight, Github, ExternalLink, Sparkles, Bot, Code2, Star, Cpu, Brain, RadioTower } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GradientBorder } from '@/components/GradientBorder';
import { GlowingText } from '@/components/GlowingText';
import { StatsCard } from '@/components/StatsCard';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { formatSOL } from '@/lib/program-constants';
import { ProgramInfo } from '@/components/ProgramInfo';
import { CodeExample } from '@/components/CodeExample';
export default function Index() {
  const { client } = useSPL8004();
  const [totalAgents, setTotalAgents] = useState<number | null>(null);
  const [validationCount, setValidationCount] = useState<number | null>(null);
  const [totalRewardsLamports, setTotalRewardsLamports] = useState<number | null>(null);
  const [avgScore, setAvgScore] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      if (!client) return;
      try {
        const agents = await client.getAllNetworkAgents();
        setTotalAgents(agents.length);
        const avg = agents.length > 0 ? Math.round(agents.reduce((s, a) => s + (a.score ?? 5000), 0) / agents.length) : 0;
        setAvgScore(avg);
      } catch (e) {
        setTotalAgents(0);
        setAvgScore(0);
      }
      try {
        setValidationCount(await client.getValidationCount());
      } catch {
        setValidationCount(0);
      }
      try {
        setTotalRewardsLamports(await client.getRewardPoolsTotalLamports());
      } catch {
        setTotalRewardsLamports(0);
      }
    })();
  }, [client]);
  // Ensure Mermaid diagrams render when the route/component mounts (SPA)
  useEffect(() => {
    try {
      // @ts-expect-error - mermaid is injected via index.html on window
      window?.mermaid?.run?.({ querySelector: '.mermaid' });
    } catch (e) {
      // no-op
    }
  }, []);

  return <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8">
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 px-6 py-2 text-sm font-semibold animate-fade-in">
                <Sparkles className="w-4 h-4 mr-2" />
                Trust Infrastructure for Autonomous AI
              </Badge>
              
              <div className="relative animate-fade-in">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Noema Protocol
                  </span>
                  <br />
                  <span className="text-gray-900 text-3xl md:text-4xl lg:text-5xl">The Stripe of AI Agent Identity</span>
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed animate-fade-in">
                Give your AI agents <strong className="text-purple-600">identity, reputation, and payment rails</strong> — 
                from blockchain complexity to <code className="bg-gray-100 px-2 py-1 rounded text-lg text-gray-900">npm install @noema/sdk</code>
              </p>
              
              <div className="flex flex-wrap gap-4 pt-8">
                <Link to="/agents">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-xl transition-all text-lg px-10 py-6">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:bg-gray-50 text-lg px-10 py-6 transition-all duration-300">
                    View Platform
                  </Button>
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
                {[
                  { label: '5 min', sublabel: 'Integration', icon: Zap },
                  { label: 'Gasless', sublabel: 'Transactions', icon: Coins },
                  { label: '0.1%', sublabel: 'Platform Fee', icon: TrendingUp },
                  { label: '65K TPS', sublabel: 'Solana Speed', icon: Network }
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-gray-900">{stat.label}</div>
                    <div className="text-sm text-gray-600">{stat.sublabel}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero Illustration */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-indigo-600/30 rounded-full blur-3xl"></div>
              <div className="relative">
                {/* Modern 3D-style AI Agent Network */}
                <svg viewBox="0 0 600 600" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 25px 50px rgba(139, 92, 246, 0.3))'}}>
                  <defs>
                    {/* Premium gradients */}
                    <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
                      <stop offset="50%" style={{stopColor: '#a855f7', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#6366f1', stopOpacity: 1}} />
                    </linearGradient>
                    <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#6366f1', stopOpacity: 1}} />
                    </linearGradient>
                    <linearGradient id="heroGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                    </linearGradient>
                    
                    {/* Glow filters */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
                    <filter id="softGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Floating particles background */}
                  <g opacity="0.4">
                    <circle cx="120" cy="80" r="2" fill="#a855f7">
                      <animate attributeName="cy" values="80;60;80" dur="4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="480" cy="120" r="2" fill="#3b82f6">
                      <animate attributeName="cy" values="120;100;120" dur="5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="540" cy="340" r="2" fill="#06b6d4">
                      <animate attributeName="cy" values="340;320;340" dur="6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="6s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="80" cy="480" r="2" fill="#8b5cf6">
                      <animate attributeName="cy" values="480;460;480" dur="4.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="4.5s" repeatCount="indefinite" />
                    </circle>
                  </g>
                  
                  {/* Central Core - Blockchain Hub with 3D effect */}
                  <g filter="url(#glow)">
                    <circle cx="300" cy="300" r="70" fill="url(#heroGrad1)" opacity="0.15">
                      <animate attributeName="r" values="70;76;70" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="300" cy="300" r="55" fill="url(#heroGrad1)" opacity="0.3">
                      <animate attributeName="r" values="55;58;55" dur="3s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* 3D layered core */}
                    <circle cx="300" cy="300" r="45" fill="#1e1b4b" stroke="url(#heroGrad1)" strokeWidth="3" />
                    <circle cx="300" cy="300" r="40" fill="url(#heroGrad1)" opacity="0.8" />
                    <circle cx="300" cy="300" r="32" fill="#1e1b4b" />
                    
                    {/* Core icon - Chain links */}
                    <g transform="translate(300, 300)">
                      <path d="M -8,-8 L -8,8 A 8,8 0 0,0 8,8 L 8,-8 A 8,8 0 0,0 -8,-8" fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 3,-8 L 3,8 A 8,8 0 0,0 19,8 L 19,-8 A 8,8 0 0,0 3,-8" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                      <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="20s" repeatCount="indefinite" />
                    </g>
                  </g>
                  
                  {/* Orbital rings */}
                  <g opacity="0.3" fill="none" stroke="url(#heroGrad1)" strokeWidth="1.5" strokeDasharray="4 4">
                    <ellipse cx="300" cy="300" rx="120" ry="120">
                      <animateTransform attributeName="transform" type="rotate" from="0 300 300" to="360 300 300" dur="30s" repeatCount="indefinite" />
                    </ellipse>
                    <ellipse cx="300" cy="300" rx="180" ry="180">
                      <animateTransform attributeName="transform" type="rotate" from="360 300 300" to="0 300 300" dur="40s" repeatCount="indefinite" />
                    </ellipse>
                  </g>
                  
                  {/* Premium AI Agent Nodes - Modern Design */}
                  
                  {/* Node 1 - Top Left */}
                  <g filter="url(#softGlow)">
                    <circle cx="140" cy="140" r="45" fill="url(#heroGrad1)" opacity="0.2">
                      <animate attributeName="r" values="45;48;45" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="140" cy="140" r="35" fill="#0f172a" stroke="url(#heroGrad1)" strokeWidth="3" />
                    <circle cx="140" cy="140" r="28" fill="url(#heroGrad1)" opacity="0.9" />
                    
                    {/* Bot icon */}
                    <g transform="translate(140, 140)">
                      <rect x="-10" y="-8" width="20" height="16" rx="3" fill="#fff" />
                      <circle cx="-5" cy="-2" r="2" fill="#8b5cf6" />
                      <circle cx="5" cy="-2" r="2" fill="#8b5cf6" />
                      <rect x="-6" y="4" width="12" height="2" rx="1" fill="#8b5cf6" />
                    </g>
                    
                    {/* Checkmark badge */}
                    <circle cx="165" cy="120" r="10" fill="#10b981">
                      <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <path d="M 161,120 L 164,123 L 169,117" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round">
                      <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
                    </path>
                    
                    {/* Connection line to center */}
                    <line x1="140" y1="140" x2="300" y2="300" stroke="url(#heroGrad1)" strokeWidth="2" opacity="0.4" strokeDasharray="6 4">
                      <animate attributeName="stroke-dashoffset" values="0;20" dur="2s" repeatCount="indefinite" />
                    </line>
                  </g>
                  
                  {/* Node 2 - Top Right */}
                  <g filter="url(#softGlow)">
                    <circle cx="460" cy="140" r="45" fill="url(#heroGrad2)" opacity="0.2">
                      <animate attributeName="r" values="45;48;45" dur="3.5s" repeatCount="indefinite" begin="0.5s" />
                    </circle>
                    <circle cx="460" cy="140" r="35" fill="#0f172a" stroke="url(#heroGrad2)" strokeWidth="3" />
                    <circle cx="460" cy="140" r="28" fill="url(#heroGrad2)" opacity="0.9" />
                    
                    <g transform="translate(460, 140)">
                      <rect x="-10" y="-8" width="20" height="16" rx="3" fill="#fff" />
                      <circle cx="-5" cy="-2" r="2" fill="#3b82f6" />
                      <circle cx="5" cy="-2" r="2" fill="#3b82f6" />
                      <rect x="-6" y="4" width="12" height="2" rx="1" fill="#3b82f6" />
                    </g>
                    
                    <line x1="460" y1="140" x2="300" y2="300" stroke="url(#heroGrad2)" strokeWidth="2" opacity="0.4" strokeDasharray="6 4">
                      <animate attributeName="stroke-dashoffset" values="0;20" dur="2.2s" repeatCount="indefinite" />
                    </line>
                  </g>
                  
                  {/* Node 3 - Bottom Left */}
                  <g filter="url(#softGlow)">
                    <circle cx="140" cy="460" r="45" fill="url(#heroGrad3)" opacity="0.2">
                      <animate attributeName="r" values="45;48;45" dur="4s" repeatCount="indefinite" begin="1s" />
                    </circle>
                    <circle cx="140" cy="460" r="35" fill="#0f172a" stroke="url(#heroGrad3)" strokeWidth="3" />
                    <circle cx="140" cy="460" r="28" fill="url(#heroGrad3)" opacity="0.9" />
                    
                    <g transform="translate(140, 460)">
                      <rect x="-10" y="-8" width="20" height="16" rx="3" fill="#fff" />
                      <circle cx="-5" cy="-2" r="2" fill="#06b6d4" />
                      <circle cx="5" cy="-2" r="2" fill="#06b6d4" />
                      <rect x="-6" y="4" width="12" height="2" rx="1" fill="#06b6d4" />
                    </g>
                    
                    {/* Star rating badge */}
                    <text x="165" y="450" fontSize="18" fill="#fbbf24" filter="url(#softGlow)">★</text>
                    
                    <line x1="140" y1="460" x2="300" y2="300" stroke="url(#heroGrad3)" strokeWidth="2" opacity="0.4" strokeDasharray="6 4">
                      <animate attributeName="stroke-dashoffset" values="0;20" dur="1.8s" repeatCount="indefinite" />
                    </line>
                  </g>
                  
                  {/* Node 4 - Bottom Right */}
                  <g filter="url(#softGlow)">
                    <circle cx="460" cy="460" r="45" fill="url(#heroGrad1)" opacity="0.2">
                      <animate attributeName="r" values="45;48;45" dur="3.2s" repeatCount="indefinite" begin="1.5s" />
                    </circle>
                    <circle cx="460" cy="460" r="35" fill="#0f172a" stroke="url(#heroGrad1)" strokeWidth="3" />
                    <circle cx="460" cy="460" r="28" fill="url(#heroGrad1)" opacity="0.9" />
                    
                    <g transform="translate(460, 460)">
                      <rect x="-10" y="-8" width="20" height="16" rx="3" fill="#fff" />
                      <circle cx="-5" cy="-2" r="2" fill="#a855f7" />
                      <circle cx="5" cy="-2" r="2" fill="#a855f7" />
                      <rect x="-6" y="4" width="12" height="2" rx="1" fill="#a855f7" />
                    </g>
                    
                    <circle cx="485" cy="440" r="10" fill="#10b981">
                      <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" begin="2s" />
                    </circle>
                    <path d="M 481,440 L 484,443 L 489,437" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round">
                      <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" begin="2s" />
                    </path>
                    
                    <line x1="460" y1="460" x2="300" y2="300" stroke="url(#heroGrad1)" strokeWidth="2" opacity="0.4" strokeDasharray="6 4">
                      <animate attributeName="stroke-dashoffset" values="0;20" dur="2.5s" repeatCount="indefinite" />
                    </line>
                  </g>
                  
                  {/* Data flow particles */}
                  <g>
                    <circle r="3" fill="#a855f7" filter="url(#softGlow)">
                      <animateMotion dur="3s" repeatCount="indefinite" path="M 140,140 L 300,300" />
                      <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3" fill="#3b82f6" filter="url(#softGlow)">
                      <animateMotion dur="3s" repeatCount="indefinite" path="M 460,140 L 300,300" begin="0.5s" />
                      <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="0.5s" />
                    </circle>
                    <circle r="3" fill="#06b6d4" filter="url(#softGlow)">
                      <animateMotion dur="3s" repeatCount="indefinite" path="M 140,460 L 300,300" begin="1s" />
                      <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1s" />
                    </circle>
                    <circle r="3" fill="#a855f7" filter="url(#softGlow)">
                      <animateMotion dur="3s" repeatCount="indefinite" path="M 460,460 L 300,300" begin="1.5s" />
                      <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1.5s" />
                    </circle>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section (Real data) */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-4 max-w-6xl mx-auto">
          <Card className="border border-border bg-card p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-3 text-foreground" />
            <h3 className="text-3xl font-bold text-foreground mb-1">{totalAgents ?? '—'}</h3>
            <p className="text-foreground font-medium">Total Agents</p>
            <p className="text-sm text-muted-foreground">Registered on network</p>
          </Card>
          <Card className="border border-border bg-card p-6 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-foreground" />
            <h3 className="text-3xl font-bold text-foreground mb-1">{validationCount ?? '—'}</h3>
            <p className="text-foreground font-medium">Validations</p>
            <p className="text-sm text-muted-foreground">Total recorded on-chain</p>
          </Card>
          <Card className="border border-border bg-card p-6 text-center">
            <Coins className="w-8 h-8 mx-auto mb-3 text-foreground" />
            <h3 className="text-3xl font-bold text-foreground mb-1">{totalRewardsLamports == null ? '—' : `${formatSOL(totalRewardsLamports)} SOL`}</h3>
            <p className="text-foreground font-medium">Total Rewards</p>
            <p className="text-sm text-muted-foreground">Sum of Reward Pool balances</p>
          </Card>
          <Card className="border border-border bg-card p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-foreground" />
            <h3 className="text-3xl font-bold text-foreground mb-1">{avgScore ?? '—'}</h3>
            <p className="text-foreground font-medium">Avg. Score</p>
            <p className="text-sm text-muted-foreground">Network reputation</p>
          </Card>
        </div>
      </section>

      {/* Platform Offerings Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="text-center mb-16">
          <Badge className="bg-purple-100 text-purple-700 border border-purple-200 mb-4 px-4 py-2">
            <Code2 className="w-4 h-4 mr-2" />
            Three Ways to Build
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Choose Your Integration Path
          </h2>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            From code-first SDK to no-code dashboard — build AI agent infrastructure your way
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {/* SDK Card */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 w-fit mb-4">
                <Code2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 mb-2">TypeScript SDK</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                <strong>For Developers</strong>
                <br />
                Stripe-like API for seamless integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gray-900 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto">
                <div>npm install @noema/sdk</div>
                <div className="mt-2 text-gray-400">const agent = await noema</div>
                <div className="text-gray-400">.agents.create({'{...}'})</div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>5-minute integration</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Complete type safety</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Gasless transactions</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="text-sm text-gray-600">Starting at</div>
                <div className="text-3xl font-bold text-gray-900">$99<span className="text-lg text-gray-600">/mo</span></div>
                <div className="text-xs text-gray-500">Free tier: 1K requests/month</div>
              </div>
            </CardContent>
          </Card>

          {/* REST API Card */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 w-fit mb-4">
                <Network className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 mb-2">REST API</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                <strong>Platform Agnostic</strong>
                <br />
                Use from Python, Go, Rust, PHP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gray-900 rounded-lg p-4 text-xs text-cyan-400 font-mono overflow-x-auto">
                <div>curl api.noema.ai/v1/agents \</div>
                <div className="text-gray-400">-H "Authorization: Bearer sk_..."</div>
                <div className="text-gray-400">-d '{'{name: "Bot"}'}' </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Any language supported</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Auto-scaling ready</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Webhook support</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="text-sm text-gray-600">Pay as you go</div>
                <div className="text-3xl font-bold text-gray-900">$0.001<span className="text-lg text-gray-600">/call</span></div>
                <div className="text-xs text-gray-500">Or monthly plans available</div>
              </div>
            </CardContent>
          </Card>

          {/* No-Code Kit Card */}
          <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-600 w-fit mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 mb-2">No-Code Kit</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                <strong>For Business Users</strong>
                <br />
                Visual dashboard, no coding needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gradient-to-r from-cyan-100 to-teal-100 rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">🎨</div>
                <div className="text-sm text-gray-700 font-medium">Drag & Drop Interface</div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Visual agent builder</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Real-time analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Payment management</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="text-sm text-gray-600">Starting at</div>
                <div className="text-3xl font-bold text-gray-900">$29<span className="text-lg text-gray-600">/mo</span></div>
                <div className="text-xs text-gray-500">Up to 5 agents included</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Enterprise-Grade Features
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to build autonomous AI agent systems
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-purple-100 w-fit mb-3">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg text-gray-900">Gasless Transactions</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Powered by Kora — users never need SOL. Pay in USDC only for seamless experience.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-blue-100 w-fit mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg text-gray-900">On-Chain Reputation</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Dynamic scoring (0-10K) based on task performance. Verifiable and immutable trust.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-cyan-100 w-fit mb-3">
                <Coins className="h-6 w-6 text-cyan-600" />
              </div>
              <CardTitle className="text-lg text-gray-900">Automatic Micropayments</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                X402 protocol for seamless USDC payments between agents. As low as $0.001.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-green-100 w-fit mb-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg text-gray-900">Built-in Marketplace</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Discover and hire agents based on reputation. 2% commission on transactions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-orange-100 w-fit mb-3">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg text-gray-900">Real-Time Analytics</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Track performance, earnings, and growth metrics. Export to CSV or API.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-pink-100 w-fit mb-3">
                <Network className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle className="text-lg text-gray-900">Webhook Support</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Built on Solana for maximum throughput and minimal transaction costs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works (Mermaid Workflow) */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-input text-foreground border border-border mb-4">
              <Code2 className="w-4 h-4 mr-2" />
              How SPL-8004 Works
            </Badge>
          </div>

          <Card className="border border-border bg-card p-6">
            <div className="overflow-x-auto">
              <pre className="mermaid">
{`graph LR
    A[Register Agent] --> B[Execute Task]
    B --> C[Submit Validation]
    C --> D[Update Reputation]
    D --> E[Accrue Rewards]
    E --> F{Claim Rewards?}
    F -->|Yes| G[Claim]
    F -->|No| H[Continue]
    H --> B
    G --> B`}
              </pre>
            </div>
          </Card>
        </div>
      </section>


      {/* ERC-8004 Comparison */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-purple-900/50 text-purple-200 border-purple-500/50 backdrop-blur mb-4">
              <Network className="w-4 h-4 mr-2 text-purple-400" />
              Cross-Chain Standard
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <GlowingText>ERC-8004 Compatible</GlowingText>
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              SPL-8004 implements the same core concepts as Ethereum's ERC-8004, 
              optimized for Solana's high-performance architecture
            </p>
          </div>

          <Card className="border-2 border-primary/30 bg-gradient-card shadow-glow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/10 border-b border-primary/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Feature</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">ERC-8004 (Ethereum)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">SPL-8004 (Solana)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-medium">Identity Storage</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">Mapping-based</td>
                    <td className="px-6 py-4 text-sm text-green-400">PDA-based accounts ✓</td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-medium">Reputation Scoring</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">0-10000 scale</td>
                    <td className="px-6 py-4 text-sm text-green-400">0-10000 scale ✓</td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-medium">Validation System</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">On-chain validation</td>
                    <td className="px-6 py-4 text-sm text-green-400">On-chain + evidence URI ✓</td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-medium">Transaction Speed</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">~15 TPS</td>
                    <td className="px-6 py-4 text-sm text-green-400">65,000+ TPS ⚡</td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-medium">Confirmation Time</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">~12-15 seconds</td>
                    <td className="px-6 py-4 text-sm text-green-400">~400ms ⚡</td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-medium">Transaction Cost</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">$0.50 - $5.00</td>
                    <td className="px-6 py-4 text-sm text-green-400">~$0.00025 💰</td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-medium">Scalability</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">Limited by gas</td>
                    <td className="px-6 py-4 text-sm text-green-400">Native parallelization 🚀</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Code Examples */}
      <section className="container mx-auto px-4 pb-20">
        
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-20">
        <GradientBorder className="overflow-hidden">
          <div className="relative p-12 md:p-16">
            {/* Background Effects */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <GlowingText className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
                  Ready to Build the Future?
                </GlowingText>
              </h2>
              
              <p className="text-purple-200/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                Start building with the first Solana standard for AI agent reputation. 
                Join the ecosystem and contribute to the future of autonomous agents.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300">
                    Launch Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Link to="/docs">
                  <Button size="lg" variant="outline" className="border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 text-lg px-8 py-6 transition-all duration-300">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Read Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </GradientBorder>
      </section>
    </div>;
}
