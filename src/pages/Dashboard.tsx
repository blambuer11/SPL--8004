import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { PROGRAM_CONSTANTS, formatSOL } from '@/lib/program-constants';
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
  const { client } = useSPL8004();
  const [agentId, setAgentId] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  type MyAgent = {
    agentId: string;
    metadataUri: string;
    reputation: {
      score: number;
      totalTasks: number;
      successfulTasks: number;
    };
  };
  const [myAgents, setMyAgents] = useState<MyAgent[]>([]);
  const [totalRewards, setTotalRewards] = useState(0);

  useEffect(() => {
    if (client && connected) {
      loadDashboardData();
    }
  }, [client, connected]);

  const loadDashboardData = async () => {
    if (!client) return;
    
    try {
      // Load mock data for development
      const agents = client.getMockAgentData();
      setMyAgents(agents);
      
      // Calculate total rewards
      const total = agents.reduce((sum, agent) => sum + (agent.reputation.score * 10), 0);
      setTotalRewards(total);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleRegister = async () => {
    if (!connected || !client) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!agentId || !metadataUri) {
      toast.error('Please fill in all fields');
      return;
    }

    if (agentId.length > PROGRAM_CONSTANTS.MAX_AGENT_ID_LEN) {
      toast.error(`Agent ID must be max ${PROGRAM_CONSTANTS.MAX_AGENT_ID_LEN} characters`);
      return;
    }

    if (metadataUri.length > PROGRAM_CONSTANTS.MAX_METADATA_URI_LEN) {
      toast.error(`Metadata URI must be max ${PROGRAM_CONSTANTS.MAX_METADATA_URI_LEN} characters`);
      return;
    }

    setIsRegistering(true);
    try {
  toast.message('Opening wallet for signature…');
  toast.info('Registering agent on Solana...');
  const sig = await client.registerAgent(agentId, metadataUri);
  toast.success(`Agent "${agentId}" registered. \nTx: ${sig.slice(0,8)}...`);
      setAgentId('');
      setMetadataUri('');
      
      // Reload dashboard
      await loadDashboardData();
    } catch (error: unknown) {
      const message = (error as Error)?.message || 'Failed to register agent';
      toast.error(message);
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
          value={myAgents.length.toString()}
          icon={Shield}
          description="Total registered agents"
        />
        <StatsCard
          title="Total Rewards"
          value={`${formatSOL(totalRewards)} SOL`}
          icon={Coins}
          description="Claimable rewards"
        />
        <StatsCard
          title="Avg. Reputation"
          value={
            myAgents.length > 0
              ? Math.round(myAgents.reduce((sum, a) => sum + a.reputation.score, 0) / myAgents.length).toString()
              : "5000"
          }
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
                <p className="text-2xl font-bold text-primary">
                  {formatSOL(PROGRAM_CONSTANTS.REGISTRATION_FEE)} SOL
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Initial reputation score: {PROGRAM_CONSTANTS.INITIAL_REPUTATION_SCORE}/{PROGRAM_CONSTANTS.MAX_REPUTATION_SCORE}
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
              {myAgents.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No agents registered yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Register your first agent to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myAgents.map((agent) => (
                    <div
                      key={agent.agentId}
                      className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{agent.agentId}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {agent.metadataUri}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Reputation:</span>
                              <span className="ml-2 font-semibold text-primary">
                                {agent.reputation.score}/10000
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Success Rate:</span>
                              <span className="ml-2 font-semibold">
                                {Math.round((agent.reputation.successfulTasks / agent.reputation.totalTasks) * 100)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Tasks:</span>
                              <span className="ml-2 font-semibold">{agent.reputation.totalTasks}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span>
                              <span className="ml-2 font-semibold text-success">Active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                Claim your earned rewards from agent validations (24h cooldown)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myAgents.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No agents registered</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Register an agent to start earning rewards
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myAgents.map((agent) => (
                    <div
                      key={agent.agentId}
                      className="p-4 rounded-lg border border-border/50 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-semibold mb-1">{agent.agentId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Simulated rewards: 0.0001 SOL
                        </p>
                      </div>
                      <Button
                        onClick={async () => {
                          if (!client) return;
                          try {
                            toast.info('Claiming rewards...');
                            const sig = await client.claimRewards(agent.agentId);
                            toast.success(`Rewards claimed! Tx: ${sig.slice(0, 8)}...`);
                            await loadDashboardData();
                          } catch (error: unknown) {
                            const message = (error as Error)?.message || 'Failed to claim rewards';
                            toast.error(message);
                            console.error(error);
                          }
                        }}
                        variant="outline"
                        className="border-primary/50 hover:bg-primary/10"
                      >
                        <Coins className="h-4 w-4 mr-2" />
                        Claim Rewards
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
