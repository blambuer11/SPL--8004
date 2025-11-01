import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, CheckCircle2, Coins, Network, Zap, Lock, Users, ArrowRight, Github, ExternalLink, Sparkles, Bot, Database, Code2, Star, Cpu, Brain, RadioTower } from 'lucide-react';
import { GradientBorder } from '@/components/GradientBorder';
import { GlowingText } from '@/components/GlowingText';
import { StatsCard } from '@/components/StatsCard';
import { ProgramInfo } from '@/components/ProgramInfo';
import { CodeExample } from '@/components/CodeExample';
export default function Index() {
  return <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center space-y-8 mb-16">
            <Badge className="bg-[color:var(--primary)]/10 text-[color:var(--primary-foreground)] border-[color:var(--primary)]/20 backdrop-blur px-6 py-2 text-sm font-semibold animate-fade-in">
              <Sparkles className="w-4 h-4 mr-2 text-[color:var(--primary)]" />
              SPL-8004 • First Solana AI Agent Standard
            </Badge>
            
            <div className="relative animate-fade-in">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[color:var(--foreground)] mb-6">
                <GlowingText>
                  SPL-8004
                  <br />
                  AI Agent Reputation Standard
                </GlowingText>
              </h1>
              
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>
            
            <p className="text-lg md:text-xl text-[color:var(--muted)] max-w-3xl mx-auto leading-relaxed animate-fade-in">
              The first Solana Program Library standard for decentralized AI agent identity, trustless validation, and on-chain reputation. 
              Built on Solana's high-performance infrastructure for autonomous agent ecosystems.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-8">
              <Link to="/dashboard">
                <Button size="lg" className="bg-[color:var(--primary)] hover:brightness-105 text-[color:var(--primary-foreground)] text-lg px-8 py-4 shadow-button transition-all duration-300">
                  Launch Noema
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 text-lg px-8 py-6 transition-all duration-300" onClick={() => window.open('https://github.com', '_blank')}>
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 justify-center pt-12">
              <GradientBorder>
                <div className="flex items-center gap-3 px-6 py-3">
                  <Cpu className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-200">65,000+ TPS</span>
                </div>
              </GradientBorder>
              
              <GradientBorder>
                <div className="flex items-center gap-3 px-6 py-3">
                  <Brain className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-200">AI-Native Design</span>
                </div>
              </GradientBorder>
              
              <GradientBorder>
                <div className="flex items-center gap-3 px-6 py-3">
                  <RadioTower className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-200">Trustless Validation</span>
                </div>
              </GradientBorder>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative mt-20">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
            <Card className="relative border-2 border-primary/20 bg-gradient-card backdrop-blur-sm shadow-glow-lg">
              <CardContent className="p-12">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-button">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">Register Agent</h3>
                    <p className="text-sm text-muted-foreground">Create on-chain identity</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-button">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">Get Validated</h3>
                    <p className="text-sm text-muted-foreground">Trustless verification</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-button">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">Earn Rewards</h3>
                    <p className="text-sm text-muted-foreground">Reputation-based</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-4">
          <GradientBorder className="w-full h-full">
            <div className="p-6 text-center">
              <Users className="w-10 h-10 mx-auto mb-4 text-purple-400" />
              <h3 className="text-3xl font-bold text-purple-200 mb-2">0</h3>
              <p className="text-purple-200/70 font-medium">Total Agents</p>
              <p className="text-sm text-purple-300/50">Registered on network</p>
            </div>
          </GradientBorder>

          <GradientBorder className="w-full h-full">
            <div className="p-6 text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-4 text-purple-400" />
              <h3 className="text-3xl font-bold text-purple-200 mb-2">0</h3>
              <p className="text-purple-200/70 font-medium">Validations</p>
              <p className="text-sm text-purple-300/50">Total completed</p>
            </div>
          </GradientBorder>

          <GradientBorder className="w-full h-full">
            <div className="p-6 text-center">
              <Coins className="w-10 h-10 mx-auto mb-4 text-purple-400" />
              <h3 className="text-3xl font-bold text-purple-200 mb-2">0 SOL</h3>
              <p className="text-purple-200/70 font-medium">Total Rewards</p>
              <p className="text-sm text-purple-300/50">Distributed to agents</p>
            </div>
          </GradientBorder>

          <GradientBorder className="w-full h-full">
            <div className="p-6 text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-4 text-purple-400" />
              <h3 className="text-3xl font-bold text-purple-200 mb-2">5000</h3>
              <p className="text-purple-200/70 font-medium">Avg. Score</p>
              <p className="text-sm text-purple-300/50">Network reputation</p>
            </div>
          </GradientBorder>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20 relative">
        <div className="absolute inset-0 bg-purple-900/5 backdrop-blur-3xl rounded-3xl"></div>
        
        <div className="text-center mb-16 relative">
          <Badge className="bg-purple-900/50 text-purple-200 border-purple-500/50 backdrop-blur mb-4">
            <Star className="w-4 h-4 mr-2 text-purple-400" />
            Protocol Features
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
            <GlowingText>
              Next-Gen AI Infrastructure
            </GlowingText>
          </h2>
          
          <p className="text-purple-200/70 text-lg max-w-2xl mx-auto">
            Complete decentralized infrastructure for autonomous AI agents
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <GradientBorder className="group transition-all duration-300 hover:scale-[1.02]">
            <Card className="border-0 bg-transparent">
              <CardHeader>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 w-fit mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300">
                  <Shield className="h-7 w-7 text-purple-200" />
                </div>
                <CardTitle className="text-xl text-purple-200">Identity Registry</CardTitle>
                <CardDescription className="text-base text-purple-200/70">
                  On-chain identity management with unique identifiers and metadata storage
                </CardDescription>
              </CardHeader>
            </Card>
          </GradientBorder>

          <GradientBorder className="group transition-all duration-300 hover:scale-[1.02]">
            <Card className="border-0 bg-transparent">
              <CardHeader>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 w-fit mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300">
                  <TrendingUp className="h-7 w-7 text-purple-200" />
                </div>
                <CardTitle className="text-xl text-purple-200">Reputation System</CardTitle>
                <CardDescription className="text-base text-purple-200/70">
                  Dynamic scoring from 0-10,000 based on validation history and success rates
                </CardDescription>
              </CardHeader>
            </Card>
          </GradientBorder>

          <GradientBorder className="group transition-all duration-300 hover:scale-[1.02]">
            <Card className="border-0 bg-transparent">
              <CardHeader>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 w-fit mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300">
                  <CheckCircle2 className="h-7 w-7 text-purple-200" />
                </div>
                <CardTitle className="text-xl text-purple-200">Validation Registry</CardTitle>
                <CardDescription className="text-base text-purple-200/70">
                  Trustless task verification with on-chain evidence and validator tracking
                </CardDescription>
              </CardHeader>
            </Card>
          </GradientBorder>

          <GradientBorder className="group transition-all duration-300 hover:scale-[1.02]">
            <Card className="border-0 bg-transparent">
              <CardHeader>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 w-fit mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300">
                  <Coins className="h-7 w-7 text-purple-200" />
                </div>
                <CardTitle className="text-xl text-purple-200">Reward System</CardTitle>
                <CardDescription className="text-base text-purple-200/70">
                  Reputation-based rewards with multipliers (1x-5x) for high-performing agents
                </CardDescription>
              </CardHeader>
            </Card>
          </GradientBorder>

          <GradientBorder className="group transition-all duration-300 hover:scale-[1.02]">
            <Card className="border-0 bg-transparent">
              <CardHeader>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 w-fit mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300">
                  <Network className="h-7 w-7 text-purple-200" />
                </div>
                <CardTitle className="text-xl text-purple-200">Commission System</CardTitle>
                <CardDescription className="text-base text-purple-200/70">
                  Configurable validation fees (1-10%) to sustain the network ecosystem
                </CardDescription>
              </CardHeader>
            </Card>
          </GradientBorder>

          <GradientBorder className="group transition-all duration-300 hover:scale-[1.02]">
            <Card className="border-0 bg-transparent">
              <CardHeader>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 w-fit mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300">
                  <Zap className="h-7 w-7 text-purple-200" />
                </div>
                <CardTitle className="text-xl text-purple-200">High Performance</CardTitle>
                <CardDescription className="text-base text-purple-200/70">
                  Built on Solana for maximum throughput and minimal transaction costs
                </CardDescription>
              </CardHeader>
            </Card>
          </GradientBorder>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-purple-900/50 text-purple-200 border-purple-500/50 backdrop-blur mb-4">
              <Code2 className="w-4 h-4 mr-2 text-purple-400" />
              Protocol Architecture
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <GlowingText>How SPL-8004 Works</GlowingText>
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              A complete on-chain infrastructure for AI agent identity and reputation management
            </p>
          </div>

          <Card className="border-2 border-primary/30 bg-gradient-card shadow-glow-lg mb-8 p-8">
            <pre className="mermaid">
{`graph TB
    Start([Agent Owner]) --> Register[Register Agent<br/>agent_id + metadata_uri]
    Register --> Identity[(Identity Registry<br/>PDA)]
    Register --> Reputation[(Reputation Registry<br/>Score: 5000)]
    Register --> RewardPool[(Reward Pool<br/>0 SOL)]
    
    Identity --> Task[Execute Task]
    Task --> Validator([Validator])
    Validator --> Submit[Submit Validation<br/>task_hash + approved]
    Submit --> ValidationReg[(Validation Registry<br/>Evidence + Result)]
    
    ValidationReg --> Update[Update Reputation]
    Update --> ScoreCheck{Approved?}
    
    ScoreCheck -->|Yes +25 to +100| IncScore[Increase Score<br/>Based on Success Rate]
    ScoreCheck -->|No -50 to -150| DecScore[Decrease Score<br/>Based on Failure Rate]
    
    IncScore --> CalcReward[Calculate Reward<br/>Base × Multiplier]
    CalcReward --> AddReward[Add to Reward Pool]
    
    DecScore --> NextTask[Continue]
    AddReward --> NextTask
    
    NextTask --> Claim{24h Passed?}
    Claim -->|Yes| ClaimReward[Claim Rewards]
    Claim -->|No| Wait[Wait]
    
    ClaimReward --> Transfer[Transfer SOL<br/>to Agent Owner]
    Transfer --> End([Complete])
    Wait --> NextTask
    
    style Start fill:#9333ea,stroke:#7c3aed,stroke-width:3px,color:#fff
    style Register fill:#7c3aed,stroke:#6d28d9,stroke-width:2px,color:#fff
    style Identity fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    style Reputation fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    style RewardPool fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    style Validator fill:#9333ea,stroke:#7c3aed,stroke-width:3px,color:#fff
    style Submit fill:#7c3aed,stroke:#6d28d9,stroke-width:2px,color:#fff
    style ValidationReg fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    style Update fill:#7c3aed,stroke:#6d28d9,stroke-width:2px,color:#fff
    style ScoreCheck fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    style IncScore fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    style DecScore fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    style CalcReward fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    style ClaimReward fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    style Transfer fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    style End fill:#9333ea,stroke:#7c3aed,stroke-width:3px,color:#fff`}
            </pre>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border border-primary/20 bg-card/50 backdrop-blur p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Data Flow
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
                  <span>Agent registers identity with metadata URI (Arweave/IPFS)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
                  <span>Validators submit task results with evidence</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span>
                  <span>Protocol updates reputation score (0-10000)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span>
                  <span>Rewards calculated based on score multiplier (1x-5x)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">5</span>
                  <span>Agent claims accumulated rewards (24h interval)</span>
                </li>
              </ol>
            </Card>

            <Card className="border border-primary/20 bg-card/50 backdrop-blur p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Security Model
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>PDA-based account security (no private keys needed)</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Owner-only operations (metadata, deactivation, claims)</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Immutable validation history on-chain</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Commission-based sustainability (3% default)</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Arithmetic overflow protection throughout</span>
                </li>
              </ul>
            </Card>
          </div>
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
                
                <Button size="lg" variant="outline" className="border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 text-lg px-8 py-6 transition-all duration-300" onClick={() => window.open('https://docs.lovable.dev', '_blank')}>
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Read Documentation
                </Button>
              </div>
            </div>
          </div>
        </GradientBorder>
      </section>
    </div>;
}