import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Coins, Shield, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';

export default function Dashboard() {
  const { connected, publicKey } = useWallet();
  const [agentId, setAgentId] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!agentId || !metadataUri) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsRegistering(true);
    try {
      // TODO: Implement SPL-8004 SDK integration
      toast.success('Agent registered successfully! (SDK integration pending)');
      setAgentId('');
      setMetadataUri('');
    } catch (error) {
      toast.error('Failed to register agent');
      console.error(error);
    } finally {
      setIsRegistering(false);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="p-4 rounded-full bg-gradient-primary inline-block animate-pulse-glow">
            <Shield className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold glow-text">Connect Your Wallet</h1>
          <p className="text-muted-foreground text-lg">
            Please connect your Solana wallet to access the dashboard and manage your AI agents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold glow-text mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your AI agents and track their performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="My Agents"
          value="0"
          icon={Shield}
          description="Total registered agents"
        />
        <StatsCard
          title="Total Rewards"
          value="0 SOL"
          icon={Coins}
          description="Claimable rewards"
        />
        <StatsCard
          title="Avg. Reputation"
          value="5000"
          icon={TrendingUp}
          description="Average score across agents"
        />
      </div>

      <Tabs defaultValue="register" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="register">Register Agent</TabsTrigger>
          <TabsTrigger value="my-agents">My Agents</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Register New Agent
              </CardTitle>
              <CardDescription>
                Register a new AI agent on the SPL-8004 network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-id">Agent ID</Label>
                <Input
                  id="agent-id"
                  placeholder="my-agent-001"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  maxLength={64}
                  className="bg-input border-border/50"
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for your agent (max 64 characters)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metadata-uri">Metadata URI</Label>
                <Input
                  id="metadata-uri"
                  placeholder="https://arweave.net/..."
                  value={metadataUri}
                  onChange={(e) => setMetadataUri(e.target.value)}
                  maxLength={200}
                  className="bg-input border-border/50"
                />
                <p className="text-xs text-muted-foreground">
                  URI pointing to agent metadata (max 200 characters)
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <h4 className="text-sm font-medium mb-2">Registration Fee</h4>
                <p className="text-2xl font-bold text-primary">0.005 SOL</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Initial reputation score: 5000/10000
                </p>
              </div>

              <Button
                onClick={handleRegister}
                disabled={isRegistering || !agentId || !metadataUri}
                className="w-full bg-gradient-primary hover:shadow-glow"
              >
                {isRegistering ? 'Registering...' : 'Register Agent'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-agents" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>My Agents</CardTitle>
              <CardDescription>
                View and manage all your registered agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No agents registered yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Register your first agent to get started
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Claimable Rewards
              </CardTitle>
              <CardDescription>
                Claim your earned rewards from agent validations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Coins className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rewards available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete validations to earn rewards
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
