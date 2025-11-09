import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { useStaking } from '@/hooks/useStaking';
import { PROGRAM_CONSTANTS, formatSOL } from '@/lib/program-constants';
import { getExplorerTxUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Coins, Shield, TrendingUp, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Index() {
  const { connected, publicKey } = useWallet();
  const { client } = useSPL8004();
  const { client: stakingClient } = useStaking();

  // Agent state
  const [agentId, setAgentId] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  type MyAgent = {
    agentId: string;
    metadataUri: string;
    reputation: { score: number; totalTasks: number; successfulTasks: number };
  };
  const [myAgents, setMyAgents] = useState<MyAgent[]>([]);
  const [claimable, setClaimable] = useState<Record<string, number>>({});

  // Staking state
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [validatorStake, setValidatorStake] = useState(0);

  useEffect(() => {
    if (client && connected) {
      void loadAgentData();
    }
    if (stakingClient && connected && publicKey) {
      void loadValidatorData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, stakingClient, connected, publicKey]);

  const loadAgentData = async () => {
    if (!client) return;
    try {
      const agents = await client.getAllUserAgents();
      setMyAgents(agents);
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
      console.error('Error loading agents:', error);
      setMyAgents([]);
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
      console.error('Error loading validator:', error);
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
      const sig = await client.registerAgent(agentId, metadataUri);
      toast.success(`Agent "${agentId}" registered!`, {
        description: (
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noreferrer" className="underline text-blue-600">
            View on Explorer
          </a>
        ),
      });
      setAgentId('');
      setMetadataUri('');
      await loadAgentData();
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to register agent');
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
      const sig = await stakingClient.stake(lamports);
      toast.success(
        <div>
          <p className="font-semibold">✅ Staked {amount} SOL!</p>
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
            View transaction →
          </a>
        </div>,
        { duration: 6000 }
      );
      setStakeAmount('');
      await loadValidatorData();
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to stake');
      console.error(error);
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
      const sig = await stakingClient.unstake(lamports);
      toast.success(
        <div>
          <p className="font-semibold">✅ Unstaked {amount} SOL!</p>
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
            View transaction →
          </a>
        </div>,
        { duration: 6000 }
      );
      setUnstakeAmount('');
      await loadValidatorData();
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to unstake');
      console.error(error);
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaimRewards = async (agentIdToClaim: string) => {
    if (!client) return;
    try {
      toast.info('Claiming rewards...');
      const sig = await client.claimRewards(agentIdToClaim);
      toast.success('Rewards claimed!', {
        description: (
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noreferrer" className="underline text-blue-600">
            View on Explorer
          </a>
        ),
      });
      await loadAgentData();
    } catch (error: unknown) {
      const message = (error as Error)?.message || 'Failed to claim rewards';
      if (message.includes('No rewards available') || message.includes('0x177a') || message.includes('6010')) {
        toast.info('No rewards available to claim yet.');
      } else {
        toast.error(message);
      }
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-900 border border-slate-200">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">Live on Solana Devnet</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-slate-900">
              AI Agent Infrastructure
              <br />
              <span className="text-slate-600">Built on Solana</span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Register AI agents, stake as validator, earn rewards — all on-chain with SPL-8004
            </p>

            {!connected ? (
              <div className="flex justify-center pt-4">
                <WalletMultiButton className="!bg-slate-900 hover:!bg-slate-800 !rounded-lg !text-base !font-medium !px-8 !py-3" />
              </div>
            ) : (
              <div className="flex justify-center gap-4 pt-4">
                <a href="#register">
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Register Agent
                  </Button>
                </a>
                <a href="#staking">
                  <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50">
                    <Shield className="mr-2 h-5 w-5" />
                    Become Validator
                  </Button>
                </a>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
              <div>
                <div className="text-3xl font-bold text-slate-900">{myAgents.length}</div>
                <div className="text-sm text-slate-600 mt-1">Your Agents</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{formatSOL(validatorStake)}</div>
                <div className="text-sm text-slate-600 mt-1">SOL Staked</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">
                  {myAgents.reduce((sum, a) => sum + (claimable[a.agentId] || 0), 0) > 0
                    ? formatSOL(myAgents.reduce((sum, a) => sum + (claimable[a.agentId] || 0), 0))
                    : '0.00'}
                </div>
                <div className="text-sm text-slate-600 mt-1">SOL Claimable</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REGISTER AGENT */}
      <section id="register" className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold text-slate-900">Register AI Agent</h2>
            <p className="text-lg text-slate-600">Create on-chain identity for your AI agents with SPL-8004</p>
          </div>

          {!connected ? (
            <Card className="border-slate-200">
              <CardContent className="py-12 text-center">
                <Shield className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 mb-4">Connect your wallet to register agents</p>
                <WalletMultiButton className="!bg-slate-900 hover:!bg-slate-800" />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Register New Agent
                  </CardTitle>
                  <CardDescription>Fee: {formatSOL(PROGRAM_CONSTANTS.REGISTRATION_FEE)} SOL</CardDescription>
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metadata-uri">Metadata URI</Label>
                    <Input
                      id="metadata-uri"
                      placeholder="https://arweave.net/..."
                      value={metadataUri}
                      onChange={(e) => setMetadataUri(e.target.value)}
                      maxLength={200}
                    />
                  </div>

                  <Button onClick={handleRegister} disabled={isRegistering || !agentId || !metadataUri} className="w-full bg-slate-900 hover:bg-slate-800">
                    {isRegistering ? 'Registering...' : 'Register Agent'}
                  </Button>
                </CardContent>
              </Card>

              {myAgents.length > 0 && (
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle>My Agents ({myAgents.length})</CardTitle>
                    <CardDescription>Registered AI agents on SPL-8004</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {myAgents.map((agent) => (
                      <div key={agent.agentId} className="p-4 rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{agent.agentId}</h3>
                            <p className="text-sm text-slate-600 mt-1">{agent.metadataUri}</p>
                            <div className="flex gap-4 mt-3 text-sm">
                              <div>
                                <span className="text-slate-600">Reputation:</span>
                                <span className="ml-2 font-semibold text-slate-900">{agent.reputation.score}/10000</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Tasks:</span>
                                <span className="ml-2 font-semibold text-slate-900">{agent.reputation.totalTasks}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleClaimRewards(agent.agentId)}
                            variant="outline"
                            size="sm"
                            disabled={(claimable[agent.agentId] || 0) <= 0}
                            className="ml-4"
                          >
                            <Coins className="h-4 w-4 mr-1" />
                            Claim {formatSOL(claimable[agent.agentId] || 0)}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </section>

      {/* VALIDATOR STAKING */}
      <section id="staking" className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold text-slate-900">Validator Staking</h2>
            <p className="text-lg text-slate-600">Stake SOL to validate and earn rewards</p>
          </div>

          {!connected ? (
            <Card className="border-slate-200">
              <CardContent className="py-12 text-center">
                <Shield className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 mb-4">Connect your wallet to stake</p>
                <WalletMultiButton className="!bg-slate-900 hover:!bg-slate-800" />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Become a Validator
                  </CardTitle>
                  <CardDescription>
                    Minimum stake: {formatSOL(PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE)} SOL | Cooldown: 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">💎 Validator Benefits</h4>
                    <ul className="space-y-1 text-sm text-purple-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                        <span>Earn validation fees from reputation updates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                        <span>Vote on protocol governance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                        <span>Build reputation in the Noema ecosystem</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stake-amount">Stake Amount (SOL)</Label>
                    <Input
                      id="stake-amount"
                      type="number"
                      step="0.1"
                      min={PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE / 1_000_000_000}
                      placeholder={`Min: ${formatSOL(PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE)} SOL`}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      disabled={isStaking}
                    />
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={handleStake}
                    disabled={isStaking || !stakeAmount}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {isStaking ? 'Staking...' : 'Stake to Become Validator'}
                  </Button>

                  {validatorStake > 0 && (
                    <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3">Your Validator Status</h4>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-white rounded p-3">
                          <div className="text-xs text-slate-600">Staked</div>
                          <div className="text-lg font-bold text-blue-600">{formatSOL(validatorStake)}</div>
                        </div>
                        <div className="bg-white rounded p-3">
                          <div className="text-xs text-slate-600">Validations</div>
                          <div className="text-lg font-bold text-blue-600">0</div>
                        </div>
                        <div className="bg-white rounded p-3">
                          <div className="text-xs text-slate-600">Fees Earned</div>
                          <div className="text-lg font-bold text-blue-600">0.00</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unstake-amount">Unstake Amount (SOL)</Label>
                        <Input
                          id="unstake-amount"
                          type="number"
                          step="0.1"
                          max={validatorStake / 1_000_000_000}
                          placeholder={`Max: ${formatSOL(validatorStake)} SOL`}
                          value={unstakeAmount}
                          onChange={(e) => setUnstakeAmount(e.target.value)}
                          disabled={isUnstaking}
                          className="bg-white"
                        />
                      </div>
                      <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700" onClick={handleUnstake} disabled={isUnstaking || !unstakeAmount}>
                        {isUnstaking ? 'Unstaking...' : 'Unstake SOL'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              ∩
            </div>
            <span className="text-2xl font-bold">Noema Protocol</span>
          </div>
          <p className="text-slate-400">AI Agent Infrastructure on Solana</p>
          <div className="flex justify-center gap-6 text-sm text-slate-400">
            <a href="/docs" className="hover:text-white transition-colors">
              Documentation
            </a>
            <a href="https://github.com/blambuer11/SPL--8004" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="https://twitter.com/noemaprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Twitter
            </a>
          </div>
          <div className="text-xs text-slate-500 pt-4">© 2025 Noema Protocol. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
