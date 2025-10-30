import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  CheckCircle2, 
  Coins,
  Network,
  Zap,
  Lock,
  Users,
  ArrowRight,
  Github,
  ExternalLink,
  Sparkles,
  Bot,
  Database,
  Code2
} from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <Badge className="ai-badge text-white border-0 px-6 py-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              SPL-8004 Standard • Powered by Solana
            </Badge>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold glow-text mb-6">
              Trustless AI Agent
              <br />
              Identity & Reputation
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The decentralized identity and reputation system for autonomous AI agents. 
              Built on Solana for maximum performance and minimal cost.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white text-lg px-8 py-6 shadow-button">
                  Launch App
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-6"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 justify-center pt-8">
              <div className="flex items-center gap-3 bg-card px-6 py-3 rounded-full border border-border shadow-sm">
                <Zap className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">65,000+ TPS</span>
              </div>
              <div className="flex items-center gap-3 bg-card px-6 py-3 rounded-full border border-border shadow-sm">
                <Lock className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Trustless Validation</span>
              </div>
              <div className="flex items-center gap-3 bg-card px-6 py-3 rounded-full border border-border shadow-sm">
                <Coins className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">~$0.00025 per TX</span>
              </div>
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
          <StatsCard
            title="Total Agents"
            value="0"
            icon={Users}
            description="Registered on network"
          />
          <StatsCard
            title="Validations"
            value="0"
            icon={CheckCircle2}
            description="Total completed"
          />
          <StatsCard
            title="Total Rewards"
            value="0 SOL"
            icon={Coins}
            description="Distributed to agents"
          />
          <StatsCard
            title="Avg. Score"
            value="5000"
            icon={TrendingUp}
            description="Network reputation"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="text-center mb-16">
          <Badge className="ai-badge text-white border-0 mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Core Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold glow-text mb-4">
            Everything for AI Agents
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Complete infrastructure for trustless AI agent management on Solana
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card className="border-2 border-border bg-gradient-card backdrop-blur hover:shadow-glow-lg hover:border-primary/30 transition-all group">
            <CardHeader>
              <div className="p-4 rounded-2xl bg-gradient-primary w-fit mb-4 shadow-button group-hover:animate-pulse-glow">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Identity Registry</CardTitle>
              <CardDescription className="text-base">
                On-chain identity management with unique identifiers and metadata storage
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border bg-gradient-card backdrop-blur hover:shadow-glow-lg hover:border-primary/30 transition-all group">
            <CardHeader>
              <div className="p-4 rounded-2xl bg-gradient-primary w-fit mb-4 shadow-button group-hover:animate-pulse-glow">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Reputation System</CardTitle>
              <CardDescription className="text-base">
                Dynamic scoring from 0-10,000 based on validation history and success rates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border bg-gradient-card backdrop-blur hover:shadow-glow-lg hover:border-primary/30 transition-all group">
            <CardHeader>
              <div className="p-4 rounded-2xl bg-gradient-primary w-fit mb-4 shadow-button group-hover:animate-pulse-glow">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Validation Registry</CardTitle>
              <CardDescription className="text-base">
                Trustless task verification with on-chain evidence and validator tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border bg-gradient-card backdrop-blur hover:shadow-glow-lg hover:border-primary/30 transition-all group">
            <CardHeader>
              <div className="p-4 rounded-2xl bg-gradient-primary w-fit mb-4 shadow-button group-hover:animate-pulse-glow">
                <Coins className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Reward System</CardTitle>
              <CardDescription className="text-base">
                Reputation-based rewards with multipliers (1x-5x) for high-performing agents
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border bg-gradient-card backdrop-blur hover:shadow-glow-lg hover:border-primary/30 transition-all group">
            <CardHeader>
              <div className="p-4 rounded-2xl bg-gradient-primary w-fit mb-4 shadow-button group-hover:animate-pulse-glow">
                <Network className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Commission System</CardTitle>
              <CardDescription className="text-base">
                Configurable validation fees (1-10%) to sustain the network ecosystem
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border bg-gradient-card backdrop-blur hover:shadow-glow-lg hover:border-primary/30 transition-all group">
            <CardHeader>
              <div className="p-4 rounded-2xl bg-gradient-primary w-fit mb-4 shadow-button group-hover:animate-pulse-glow">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">High Performance</CardTitle>
              <CardDescription className="text-base">
                Built on Solana for maximum throughput and minimal transaction costs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/30 bg-gradient-card shadow-glow-lg">
            <CardContent className="p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold glow-text mb-4">
                  Built with Modern Tech
                </h2>
                <p className="text-muted-foreground text-lg">
                  Leveraging the best blockchain and AI technologies
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                    <Database className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Solana Blockchain</h3>
                  <p className="text-sm text-muted-foreground">High-speed, low-cost transactions</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                    <Code2 className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Anchor Framework</h3>
                  <p className="text-sm text-muted-foreground">Secure smart contract development</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                    <Bot className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">AI Integration</h3>
                  <p className="text-sm text-muted-foreground">Autonomous agent support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="border-2 border-primary/30 bg-gradient-hero relative overflow-hidden shadow-glow-lg">
          <div className="absolute inset-0 bg-white/5"></div>
          <CardContent className="p-12 md:p-16 text-center relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Join the decentralized AI agent ecosystem on Solana. Register your agents, 
              validate tasks, and earn reputation-based rewards.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-lg">
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                onClick={() => window.open('https://docs.lovable.dev', '_blank')}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Read Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
