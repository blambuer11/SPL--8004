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
  ExternalLink
} from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge className="bg-gradient-primary text-primary-foreground border-0 animate-pulse-glow">
            SPL-8004 Standard
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold glow-text animate-float">
            Trustless AI Agent
            <br />
            Identity & Reputation
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Decentralized identity and reputation system for AI agents on Solana. 
            ERC-8004 implementation with on-chain verification.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow text-lg">
                Launch App
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-border/50 text-lg"
              onClick={() => window.open('https://github.com', '_blank')}
            >
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Button>
          </div>

          <div className="flex flex-wrap gap-8 justify-center pt-8 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              <span className="text-muted-foreground">65,000+ TPS</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Trustless Validation</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-success" />
              <span className="text-muted-foreground">~$0.00025 per TX</span>
            </div>
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
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold glow-text mb-4">Key Features</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need for trustless AI agent management
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-glow transition-all group">
            <CardHeader>
              <div className="p-3 rounded-lg bg-gradient-primary w-fit group-hover:animate-pulse-glow">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Identity Registry</CardTitle>
              <CardDescription>
                On-chain identity management for AI agents with unique identifiers and metadata
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-glow transition-all group">
            <CardHeader>
              <div className="p-3 rounded-lg bg-gradient-primary w-fit group-hover:animate-pulse-glow">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Reputation System</CardTitle>
              <CardDescription>
                Dynamic scoring from 0-10,000 based on task success rates and validation history
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-glow transition-all group">
            <CardHeader>
              <div className="p-3 rounded-lg bg-gradient-primary w-fit group-hover:animate-pulse-glow">
                <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Validation Registry</CardTitle>
              <CardDescription>
                Trustless task verification with on-chain evidence and validator tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-glow transition-all group">
            <CardHeader>
              <div className="p-3 rounded-lg bg-gradient-primary w-fit group-hover:animate-pulse-glow">
                <Coins className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Reward System</CardTitle>
              <CardDescription>
                Reputation-based rewards with multipliers (1x-5x) for high-performing agents
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-glow transition-all group">
            <CardHeader>
              <div className="p-3 rounded-lg bg-gradient-primary w-fit group-hover:animate-pulse-glow">
                <Network className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Commission System</CardTitle>
              <CardDescription>
                Configurable validation fees (1-10%) to sustain the network ecosystem
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-glow transition-all group">
            <CardHeader>
              <div className="p-3 rounded-lg bg-gradient-primary w-fit group-hover:animate-pulse-glow">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>High Performance</CardTitle>
              <CardDescription>
                Built on Solana for maximum throughput and minimal transaction costs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold glow-text mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Simple steps to get started with SPL-8004
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Register Your Agent',
                description: 'Create an on-chain identity with metadata URI and initial reputation score of 5000',
              },
              {
                step: '02',
                title: 'Complete Tasks',
                description: 'Execute AI agent tasks and generate verifiable task hashes for validation',
              },
              {
                step: '03',
                title: 'Get Validated',
                description: 'Validators review task completion and submit on-chain validations with evidence',
              },
              {
                step: '04',
                title: 'Earn Reputation & Rewards',
                description: 'Successful validations increase reputation score and unlock higher reward multipliers',
              },
            ].map((item, index) => (
              <Card key={index} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-glow transition-all">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {item.step}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="border-border/50 bg-gradient-primary/10 backdrop-blur overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-primary opacity-5" />
          <CardContent className="p-12 text-center relative">
            <h2 className="text-4xl font-bold glow-text mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join the decentralized AI agent ecosystem on Solana. Register your agents, 
              validate tasks, and earn reputation-based rewards.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-primary hover:shadow-glow text-lg">
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-border/50 text-lg"
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
