import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useNOEMA8004 } from '@/hooks/useNOEMA8004';
import { useStaking } from '@/hooks/useStaking';
import { PROGRAM_CONSTANTS, formatSOL } from '@/lib/program-constants';
import { getExplorerTxUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Coins, Shield, TrendingUp, HelpCircle } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Dashboard() {
  const { connected, publicKey } = useWallet();
  const { client } = useNOEMA8004();
  const { client: stakingClient } = useStaking();
  const [searchParams] = useSearchParams();
  const location = useLocation();
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
  const [claimable, setClaimable] = useState<Record<string, number>>({});
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [validatorStake, setValidatorStake] = useState(0);
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam ? tabParam : (location.pathname === '/staking' || location.pathname === '/stake') ? 'staking' : 'register';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (location.pathname === '/staking' || location.pathname === '/stake') {
      setActiveTab('staking');
      return;
    }
    const tab = searchParams.get('tab') || 'register';
    setActiveTab(tab);
  }, [searchParams, location.pathname]);

  useEffect(() => {
    if (client && connected) {
      void loadDashboardData();
    }
    if (stakingClient && connected && publicKey) {
      void loadValidatorData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, stakingClient, connected, publicKey]);

  const loadDashboardData = async () => {
    if (!client) return;
    try {
      const agents = await client.getAllUserAgents();
      setMyAgents(agents);
      const total = agents.reduce((sum, agent) => {
        const rewardEstimate = (agent.reputation.score / 10000) * 100_000; // simulated
        return sum + rewardEstimate;
      }, 0);
      setTotalRewards(total);

      // Load real reward pool balances (lamports) per agent
      const map: Record<string, number> = {};
      for (const a of agents) {
        try {
          map[a.agentId] = await client.getRewardPoolLamports(a.agentId);
        } catch {
          map[a.agentId] = 0;
        }
      }
      setClaimable(map);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setMyAgents([]);
      setTotalRewards(0);
      setClaimable({});
    }
  };

  const loadValidatorData = async () => {
    if (!stakingClient || !publicKey) return;
    try {
      const validatorAccount = await stakingClient.getValidatorAccount(publicKey);
      if (validatorAccount) {
        setValidatorStake(validatorAccount.stakedAmount);
      } else {
        setValidatorStake(0);
      }
    } catch (error) {
      console.error('Error loading validator data:', error);
      setValidatorStake(0);
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
      toast.success(`Agent "${agentId}" registered.`, {
        description: (
          <a
            href={getExplorerTxUrl(sig)}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 text-blue-600 hover:text-blue-700"
          >
            View transaction on Explorer
          </a>
        ),
      });
      setAgentId('');
      setMetadataUri('');
      await loadDashboardData();
    } catch (error: unknown) {
      const message = (error as Error)?.message || 'Failed to register agent';
      toast.error(message);
      console.error(error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleStake = async () => {
    if (!connected || !stakingClient) {
      toast.error('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (!amount || amount < PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE / 1_000_000_000) {
      toast.error(`Minimum stake is ${formatSOL(PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE)} SOL`);
      return;
    }

    setIsStaking(true);
    try {
      toast.message('Opening wallet for signature…');
      const lamports = Math.floor(amount * 1_000_000_000);
      
      toast.info('Staking SOL to become validator...');
      const sig = await stakingClient.stake(lamports);
      
      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">✅ Successfully staked {amount} SOL!</p>
          <p className="text-xs">You are now a validator on Noema Protocol</p>
          <a 
            href={getExplorerTxUrl(sig)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline block"
          >
            View transaction →
          </a>
        </div>,
        { duration: 6000 }
      );
      
      setStakeAmount('');
      await loadValidatorData();
    } catch (error) {
      console.error('Stake error:', error);
      const message = error instanceof Error ? error.message : 'Failed to stake. Please try again.';
      toast.error(message);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!connected || !stakingClient) {
      toast.error('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(unstakeAmount);
    if (!amount || amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (amount > validatorStake / 1_000_000_000) {
      toast.error('Insufficient staked balance');
      return;
    }

    setIsUnstaking(true);
    try {
      toast.message('Opening wallet for signature…');
      const lamports = Math.floor(amount * 1_000_000_000);
      
      toast.info('Unstaking SOL...');
      const sig = await stakingClient.unstake(lamports);
      
      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">✅ Successfully unstaked {amount} SOL!</p>
          <p className="text-xs">7-day cooldown period started</p>
          <a 
            href={getExplorerTxUrl(sig)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline block"
          >
            View transaction →
          </a>
        </div>,
        { duration: 6000 }
      );
      
      setUnstakeAmount('');
      await loadValidatorData();
    } catch (error) {
      console.error('Unstake error:', error);
      const message = error instanceof Error ? error.message : 'Failed to unstake. Please try again.';
      toast.error(message);
    } finally {
      setIsUnstaking(false);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="p-4 rounded-full border border-border inline-block">
            <Shield className="h-12 w-12 text-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Connect Your Wallet</h1>
          <p className="text-muted-foreground text-lg">
            Please connect your Solana wallet to access the dashboard and manage your AI agents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">🆔 Noema ID Dashboard</h1>
            <p className="text-muted-foreground">Manage your AI agents and track their performance on-chain</p>
          </div>
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StatsCard title="My Agents" value={myAgents.length.toString()} icon={Shield} description="Total registered agents" />
          <StatsCard title="Total Rewards" value={`${formatSOL(totalRewards)} SOL`} icon={Coins} description="Claimable rewards" />
          <StatsCard
            title="Avg. Reputation"
            value={myAgents.length > 0 ? Math.round(myAgents.reduce((s, a) => s + a.reputation.score, 0) / myAgents.length).toString() : '5000'}
            icon={TrendingUp}
            description="Average score across agents"
          />
        </div>

        {/* Mobile navigation */}
        <div className="lg:hidden flex flex-wrap gap-3">
          <a href="/agents" className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800">Manage Agents</a>
          <a href="/app?tab=staking" className="px-4 py-2 rounded-lg border border-purple-300 bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100">💎 Validator Staking</a>
          <a href="/validation" className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">Submit Validation</a>
          <a href="/payments" className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">X402 Payments</a>
          <a href="/profile" className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">Rewards & Profile</a>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="register">Register Agent</TabsTrigger>
          <TabsTrigger value="my-agents">My Agents</TabsTrigger>
          <TabsTrigger value="staking">Validator Staking</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Register New Agent
              </CardTitle>
              <CardDescription>Register a new AI agent on Noema ID™ (SPL-8004)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-id">Agent ID</Label>
                <Input id="agent-id" placeholder="my-agent-001" value={agentId} onChange={(e) => setAgentId(e.target.value)} maxLength={64} className="bg-input border-border/50" />
                <p className="text-xs text-muted-foreground">Unique identifier for your agent (max 64 characters)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metadata-uri">Metadata URI</Label>
                <Input id="metadata-uri" placeholder="https://arweave.net/..." value={metadataUri} onChange={(e) => setMetadataUri(e.target.value)} maxLength={200} className="bg-input border-border/50" />
                <p className="text-xs text-muted-foreground">URI pointing to agent metadata (max 200 characters)</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <h4 className="text-sm font-medium mb-2">Registration Fee</h4>
                <p className="text-2xl font-bold text-primary">{formatSOL(PROGRAM_CONSTANTS.REGISTRATION_FEE)} SOL</p>
                <p className="text-xs text-muted-foreground mt-1">Initial reputation score: {PROGRAM_CONSTANTS.INITIAL_REPUTATION_SCORE}/{PROGRAM_CONSTANTS.MAX_REPUTATION_SCORE}</p>
              </div>

              <Button onClick={handleRegister} disabled={isRegistering || !agentId || !metadataUri} className="w-full bg-gradient-primary hover:shadow-glow">
                {isRegistering ? 'Registering...' : 'Register Agent'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-agents" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>My Agents</CardTitle>
              <CardDescription>View and manage all your registered agents</CardDescription>
            </CardHeader>
            <CardContent>
              {myAgents.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No agents registered yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Register your first agent to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myAgents.map((agent) => (
                    <div key={agent.agentId} className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{agent.agentId}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{agent.metadataUri}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Reputation:</span>
                              <span className="ml-2 font-semibold text-primary">{agent.reputation.score}/10000</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Tasks:</span>
                              <span className="ml-2 font-semibold">{agent.reputation.totalTasks}</span>
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

        <TabsContent value="staking" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Validator Staking
              </CardTitle>
              <CardDescription>Stake SOL to become a validator and earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">💎 Become a Validator</h4>
                <p className="text-sm text-purple-800 mb-4">
                  Stake {formatSOL(PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE)} SOL to validate agent reputation updates and earn validation fees.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white rounded p-3">
                    <div className="text-xs text-muted-foreground mb-1">Minimum Stake</div>
                    <div className="text-lg font-bold text-purple-600">{formatSOL(PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE)} SOL</div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="text-xs text-muted-foreground mb-1">Cooldown Period</div>
                    <div className="text-lg font-bold text-purple-600">7 days</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stake-amount">Stake Amount (SOL)</Label>
                  <Input
                    id="stake-amount"
                    type="number"
                    step="0.1"
                    min={PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE / 1_000_000_000}
                    placeholder={`Min: ${formatSOL(PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE)} SOL`}
                    className="bg-input border-border/50"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    disabled={isStaking}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum stake required: {formatSOL(PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE)} SOL
                  </p>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleStake}
                  disabled={isStaking || !stakeAmount}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {isStaking ? 'Staking...' : 'Stake to Become Validator'}
                </Button>

                <div className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-3">
                  <h4 className="text-sm font-semibold">Validator Benefits</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Earn validation fees from reputation updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Vote on protocol governance decisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Build reputation in the Noema ecosystem</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Access to validator-only features and analytics</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h4>
                  <ul className="space-y-1 text-xs text-yellow-800">
                    <li>• Staked SOL is locked for 7 days after unstaking</li>
                    <li>• Slashing may occur for malicious validation behavior</li>
                    <li>• Validators must maintain minimum stake at all times</li>
                    <li>• Rewards are distributed proportionally to stake amount</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <h4 className="text-sm font-semibold mb-3">Your Validator Status</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 rounded bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Your Stake</div>
                    <div className="text-lg font-bold">{formatSOL(validatorStake)} SOL</div>
                  </div>
                  <div className="p-3 rounded bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Validations</div>
                    <div className="text-lg font-bold">0</div>
                  </div>
                  <div className="p-3 rounded bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Fees Earned</div>
                    <div className="text-lg font-bold">0.00 SOL</div>
                  </div>
                </div>

                {validatorStake > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3">Unstake Your SOL</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="unstake-amount">Unstake Amount (SOL)</Label>
                        <Input
                          id="unstake-amount"
                          type="number"
                          step="0.1"
                          max={validatorStake / 1_000_000_000}
                          placeholder={`Max: ${formatSOL(validatorStake)} SOL`}
                          className="bg-white border-blue-300"
                          value={unstakeAmount}
                          onChange={(e) => setUnstakeAmount(e.target.value)}
                          disabled={isUnstaking}
                        />
                        <p className="text-xs text-blue-700">
                          Available to unstake: {formatSOL(validatorStake)} SOL
                        </p>
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={handleUnstake}
                        disabled={isUnstaking || !unstakeAmount}
                      >
                        {isUnstaking ? 'Unstaking...' : 'Unstake SOL'}
                      </Button>
                    </div>
                  </div>
                )}
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
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="ml-1 text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Claim Rewards Requirements</DialogTitle>
                      <DialogDescription className="space-y-3 text-sm text-left pt-2">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">How to earn rewards:</h4>
                          <ul className="list-disc ml-5 space-y-1">
                            <li>Register an agent on SPL-8004</li>
                            <li>Complete successful validations via <code className="bg-muted px-1 py-0.5 rounded">submit_validation</code></li>
                            <li>Validators call <code className="bg-muted px-1 py-0.5 rounded">update_reputation</code> to deposit rewards into your pool</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Claim conditions:</h4>
                          <ul className="list-disc ml-5 space-y-1">
                            <li>Reward pool balance must be &gt; 0 SOL</li>
                            <li>24-hour cooldown between claims</li>
                            <li>Agent must be active (not deactivated)</li>
                          </ul>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                          <p className="text-blue-900 text-xs">
                            💡 <strong>Tip:</strong> Ask other users to validate your agent's work, or use the Validation page to submit validations and earn reputation.
                          </p>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Claim your earned rewards from agent validations (24h cooldown)</CardDescription>
            </CardHeader>
            <CardContent>
              {myAgents.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No agents registered</p>
                  <p className="text-sm text-muted-foreground mt-2">Register an agent to start earning rewards</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myAgents.map((agent) => (
                    <div key={agent.agentId} className="p-4 rounded-lg border border-border/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{agent.agentId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Pool balance: {formatSOL((claimable[agent.agentId] || 0))} SOL
                        </p>
                      </div>
                      <Button
                        onClick={async () => {
                          if (!client) return;
                          try {
                            toast.info('Claiming rewards...');
                            const sig = await client.claimRewards(agent.agentId);
                            toast.success('Rewards claimed!', { description: (
                              <a href={getExplorerTxUrl(sig)} target="_blank" rel="noreferrer" className="underline underline-offset-2 text-blue-600 hover:text-blue-700">View transaction on Explorer</a>
                            ) });
                            await loadDashboardData();
                          } catch (error: unknown) {
                            const message = (error as Error)?.message || 'Failed to claim rewards';
                            if (message.includes('No rewards available') || message.includes('0x177a') || message.includes('6010')) {
                              toast.info('No rewards available to claim yet.');
                            } else {
                              toast.error(message);
                            }
                            console.error(error);
                          }
                        }}
                        variant="outline"
                        className="border-primary/50 hover:bg-primary/10"
                        disabled={(claimable[agent.agentId] || 0) <= 0}
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
    </DashboardLayout>
  );
}
 
