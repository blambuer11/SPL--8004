import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { useStaking } from '@/hooks/useStaking';
import { PROGRAM_CONSTANTS, formatSOL } from '@/lib/program-constants';
import { getExplorerTxUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Coins, Shield, TrendingUp, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';
import Analytics from '@/lib/analytics';
import { MockModeBanner } from '@/components/MockModeBanner';
import { FacilitatorHealth } from '@/components/FacilitatorHealth';

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

  // Validation state
  const [validationAgentId, setValidationAgentId] = useState('');
  const [validationResult, setValidationResult] = useState('approved');
  const [validationNote, setValidationNote] = useState('');
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);

  // UI state
  const [isConfirmRegisterOpen, setIsConfirmRegisterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications (in-app)
  type AppNotification = { id: string; level: 'success'|'info'|'warning'|'error'; title: string; message?: string; time: string };
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const addNotification = (n: Omit<AppNotification,'id'|'time'>) => {
    setNotifications(prev => [{ id: Math.random().toString(36).slice(2), time: new Date().toLocaleTimeString(), ...n }, ...prev].slice(0, 20));
  };
  const dismissNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const clearNotifications = () => setNotifications([]);

  // Auto-compound settings
  type CompoundSettings = {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    thresholdSol: string; // as string input
    applyAgent: boolean;
    applyValidator: boolean;
    applyLP: boolean;
  };
  const [compound, setCompound] = useState<CompoundSettings>({
    enabled: false,
    frequency: 'weekly',
    thresholdSol: '0.1',
    applyAgent: true,
    applyValidator: true,
    applyLP: false,
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem('autoCompoundSettings');
      if (raw) setCompound({ ...compound, ...JSON.parse(raw) });
      // eslint-disable-next-line no-empty
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const saveCompound = () => {
    localStorage.setItem('autoCompoundSettings', JSON.stringify(compound));
    toast.success('Auto-compound settings saved');
    Analytics.track('auto_compound_saved', { ...compound });
  };

  // Slashing alert (simulation)
  const showSlashingAlert = () => {
    toast.error(
      <div className="space-y-2">
        <div className="font-semibold">⚠️ Validator Slashing Alert</div>
        <div className="text-sm text-slate-700">
          Reason: Wrong validation detected<br />
          Penalty: 2.5 SOL (5% of your stake)<br />
          New Stake: 47.5 SOL<br />
          Reputation: -500 points
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline">Appeal</Button>
          <Button size="sm" variant="secondary">View Details</Button>
        </div>
      </div>,
      { duration: 6000 }
    );
    addNotification({ level: 'error', title: 'Slashing alert', message: 'Penalty: 2.5 SOL — Reputation: -500' });
    Analytics.track('slashing_alert');
  };

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
      addNotification({ level: 'success', title: 'Agent registered', message: `Agent ${agentId} is now on-chain` });
      Analytics.track('agent_registered', { agentId, metadataUriLength: metadataUri.length });
      setAgentId('');
      setMetadataUri('');
      await loadAgentData();
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to register agent');
      addNotification({ level: 'error', title: 'Registration failed', message: (error as Error)?.message });
      console.error(error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleStake = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!stakingClient) {
      toast.error('Staking client not initialized');
      return;
    }
    const amount = parseFloat(stakeAmount);
    if (!amount || amount < PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE / 1_000_000_000) {
      toast.error(`Minimum stake is ${formatSOL(PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE)} SOL`);
      return;
    }
    setIsStaking(true);
    try {
      toast.info('Opening Phantom wallet for signature approval...');
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
      Analytics.track('stake_success', { amountSol: amount });
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to stake');
      addNotification({ level: 'error', title: 'Stake failed', message: (error as Error)?.message });
      console.error(error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!stakingClient) {
      toast.error('Staking client not initialized');
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
      toast.info('Opening Phantom wallet for signature approval...');
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
      Analytics.track('unstake_success', { amountSol: amount });
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to unstake');
      addNotification({ level: 'error', title: 'Unstake failed', message: (error as Error)?.message });
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
      addNotification({ level: 'success', title: 'Rewards claimed', message: `Agent ${agentIdToClaim}` });
  Analytics.track('rewards_claimed', { agentId: agentIdToClaim, lamports: claimable[agentIdToClaim] || 0 });
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

  const handleSubmitValidation = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!validationAgentId.trim()) {
      toast.error('Please enter an Agent ID');
      return;
    }
    
    setIsSubmittingValidation(true);
    try {
      toast.info('Submitting validation on-chain...');
      
      // TODO: Replace with real on-chain validation instruction
      // For now, simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTxSig = `${Math.random().toString(36).substring(2, 15)}...`;
      
      toast.success(
        <div>
          <p className="font-semibold">✅ Validation Submitted!</p>
          <p className="text-xs mt-1">Agent: {validationAgentId}</p>
          <p className="text-xs">Result: {validationResult}</p>
          <a href={getExplorerTxUrl(mockTxSig)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 block">
            View transaction →
          </a>
        </div>,
        { duration: 6000 }
      );
      
      addNotification({
        level: validationResult === 'approved' ? 'success' : 'warning',
        title: 'Validation submitted',
        message: `${validationAgentId}: ${validationResult}`
      });
      
      Analytics.track('validation_submitted', {
        agentId: validationAgentId,
        result: validationResult,
        hasNote: !!validationNote
      });
      
      // Clear form
      setValidationAgentId('');
      setValidationResult('approved');
      setValidationNote('');
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to submit validation');
      console.error(error);
    } finally {
      setIsSubmittingValidation(false);
    }
  };

  // Keyboard shortcuts (Cmd/Ctrl+K search, +N register, +P payment placeholder)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (meta && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        document.getElementById('agent-id')?.focus();
        window.location.hash = 'register';
      }
      if (meta && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toast.info('Payment console coming soon');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <MockModeBanner />
      {/* HERO */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-900 border border-slate-200">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">Live on Solana Devnet</span>
            </div>
            <div className="inline-flex ml-2 align-middle">
              <FacilitatorHealth />
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-slate-900">
              AI Agent Infrastructure
              <br />
              <span className="text-slate-600">Built on Solana</span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Register AI agents, stake as validator, earn rewards — all on-chain with SPL-8004
            </p>

            <div className="flex flex-col items-center gap-4 pt-4">
              {!connected ? (
                <WalletMultiButton className="!bg-slate-900 hover:!bg-slate-800 !rounded-lg !text-base !font-medium !px-8 !py-3" />
              ) : (
                <div className="flex gap-4 header-nav">
                  <a href="#register">
                    <Button size="lg" className="bg-slate-900 hover:bg-slate-800" aria-label="Go to Register Agent">
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Register Agent
                    </Button>
                  </a>
                  <a href="#staking">
                    <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50" aria-label="Go to Staking">
                      <Shield className="mr-2 h-5 w-5" />
                      Become Validator
                    </Button>
                  </a>
                </div>
              )}
              
              {/* Always visible autonomous payment button */}
              <a href="#autonomous-payment" className="animate-pulse">
                <Button size="lg" variant="default" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                  <Bot className="mr-2 h-5 w-5" />
                  🚀 Otonom Ödeme Protokolü
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-2xl mx-auto pt-8" role="status" aria-live="polite" aria-atomic="true">
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

      {/* SEARCH DIALOG */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Search</DialogTitle>
            <DialogDescription>Search agents by ID or metadata</DialogDescription>
          </DialogHeader>
          <Input placeholder="Search agents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Search agents" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSearchOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AUTONOMOUS PAYMENT PROTOCOL */}
      <section id="autonomous-payment" className="py-20 px-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-y border-slate-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-semibold">Otonom Ödeme Protokolü</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Ajanlar Arası Anında Ödeme
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              SPL-8004 kimlik sistemi ile robotlar birbirlerini tanıyıp ödeme yapabiliyor. 
              Kargo dronu eve gelir, ev robotu kapıyı açar, ödeme anında doğrulanır.
            </p>
          </div>

          {/* Visual Diagram */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Drone Side */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl">
                    🚁
                  </div>
                  <div>
                    <div className="font-bold text-blue-900">DRONE</div>
                    <div className="text-sm text-blue-700">Payer Agent</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-semibold text-slate-900 mb-1">1. Kimlik Paylaşımı</div>
                    <div className="text-slate-600">agentId: "drone-001" gönderir</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-semibold text-slate-900 mb-1">3. Challenge İmzalama</div>
                    <div className="text-slate-600">Ed25519 ile nonce+timestamp imzalar</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-semibold text-slate-900 mb-1">4. USDC Ödemesi</div>
                    <div className="text-slate-600">Memo: HANDSHAKE|agentId|ts|nonce|SIG</div>
                  </div>
                </div>
              </div>

              {/* Home Robot Side */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white text-2xl">
                    🏠
                  </div>
                  <div>
                    <div className="font-bold text-purple-900">HOME ROBOT</div>
                    <div className="text-sm text-purple-700">Receiver Agent</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-semibold text-slate-900 mb-1">2. On-Chain Doğrulama</div>
                    <div className="text-slate-600">SPL-8004 PDA'dan owner cüzdanı çözümlenir</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-semibold text-slate-900 mb-1">3. Challenge Gönderimi</div>
                    <div className="text-slate-600">Nonce+timestamp üretir, drone'a gönderir</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-semibold text-slate-900 mb-1">5. Ödeme İzleme</div>
                    <div className="text-slate-600">Blockchain'i tarar, memo+amount doğrular</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flow Arrow */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <div className="w-16 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <ArrowRight className="w-6 h-6 text-purple-600" />
                <div className="w-16 h-0.5 bg-gradient-to-r from-purple-600 to-green-600"></div>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>

            {/* Success State */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div className="font-bold text-green-900 text-lg">İşlem Tamamlandı</div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-white border border-green-200">
                  <div className="text-slate-600 mb-1">Kimlik Doğrulandı</div>
                  <div className="font-semibold text-slate-900">✅ On-chain PDA verified</div>
                </div>
                <div className="p-3 rounded-lg bg-white border border-green-200">
                  <div className="text-slate-600 mb-1">Ödeme Alındı</div>
                  <div className="font-semibold text-slate-900">✅ 0.05 USDC transferred</div>
                </div>
                <div className="p-3 rounded-lg bg-white border border-green-200">
                  <div className="text-slate-600 mb-1">Eylem Tetiklendi</div>
                  <div className="font-semibold text-slate-900">🚪 Door unlocked</div>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Güvenlik Katmanları
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>Ed25519 signature verification (tweetnacl)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>Timestamp freshness check</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>On-chain identity verification (SPL-8004)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>Amount + memo validation</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Teknik Özellikler
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>Real-time blockchain transaction parsing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>SPL Token USDC transfers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>Memo program integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>Challenge-response protocol</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Code Example */}
            <div className="mt-8 p-6 rounded-lg bg-slate-900 text-slate-100 overflow-x-auto">
              <div className="text-xs font-mono space-y-1">
                <div className="text-green-400"># Drone Mode - Ödeme Gönder</div>
                <div className="text-slate-300">MODE=drone AGENT_ID=home-001 npm run delivery-handshake:drone</div>
                <div className="mt-3 text-purple-400"># Home Mode - Ödeme Bekle</div>
                <div className="text-slate-300">MODE=home AGENT_ID=drone-001 npm run delivery-handshake:home</div>
                <div className="mt-3 text-blue-400"># Sonuç:</div>
                <div className="text-slate-300">✅ Payment found! Signature: 2Zx9k...</div>
                <div className="text-slate-300">🚪 Door unlocked</div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <a href="/api/automation/README.md" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-slate-300">
                  📚 Dokümantasyon
                </Button>
              </a>
              <a href="https://github.com/blambuer11/SPL--8004/tree/main/api/automation" target="_blank" rel="noopener noreferrer">
                <Button className="bg-slate-900 hover:bg-slate-800">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  GitHub'da Görüntüle
                </Button>
              </a>
            </div>

            {/* HOW TO USE GUIDE */}
            <div className="mt-12 p-8 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white text-2xl flex-shrink-0">
                  📖
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Bu Hizmeti Nasıl Kullanırım?</h3>
                  <p className="text-slate-700">Otonom ödeme sistemini kendi uygulamanızda kullanmak için adım adım rehber</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Adım 1-2 */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                      <h4 className="font-bold text-slate-900">Agent Kaydet (SPL-8004)</h4>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">Önce robotlarınız için on-chain kimlik oluşturun:</p>
                    <div className="bg-slate-900 p-3 rounded text-xs font-mono text-slate-100">
                      # Drone için<br/>
                      agentId: "drone-001"<br/>
                      metadataUri: "https://..."<br/>
                      <br/>
                      # Home robot için<br/>
                      agentId: "home-001"<br/>
                      metadataUri: "https://..."
                    </div>
                    <p className="text-xs text-slate-600 mt-2">💡 Fee: 0.005 SOL per agent</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                      <h4 className="font-bold text-slate-900">Wallet'ları Hazırla</h4>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">Her agent için Solana keypair oluşturun:</p>
                    <div className="bg-slate-900 p-3 rounded text-xs font-mono text-slate-100">
                      solana-keygen new --outfile drone-wallet.json<br/>
                      solana-keygen new --outfile home-wallet.json<br/>
                      <br/>
                      # Devnet SOL ve USDC ekleyin<br/>
                      solana airdrop 1 --url devnet
                    </div>
                  </div>
                </div>

                {/* Adım 3-4 */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                      <h4 className="font-bold text-slate-900">Environment Ayarları</h4>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">Script'ler için .env dosyası oluşturun:</p>
                    <div className="bg-slate-900 p-3 rounded text-xs font-mono text-slate-100">
                      SOLANA_RPC_URL=https://api.devnet.solana.com<br/>
                      USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU<br/>
                      DELIVERY_FEE_USDC=0.05<br/>
                      TIMEOUT_MS=60000
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">4</div>
                      <h4 className="font-bold text-slate-900">Script'leri Çalıştır</h4>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">İki terminal açın ve eşzamanlı çalıştırın:</p>
                    <div className="bg-slate-900 p-3 rounded text-xs font-mono text-slate-100">
                      # Terminal 1: Home robot bekliyor<br/>
                      MODE=home AGENT_ID=drone-001 \<br/>
                      PAYER_KEYPAIR_PATH=./home-wallet.json \<br/>
                      npm run delivery-handshake:home<br/>
                      <br/>
                      # Terminal 2: Drone ödeme gönderiyor<br/>
                      MODE=drone AGENT_ID=home-001 \<br/>
                      PAYER_KEYPAIR_PATH=./drone-wallet.json \<br/>
                      npm run delivery-handshake:drone
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Result */}
              <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <h4 className="font-bold text-green-900">Başarılı Sonuç:</h4>
                </div>
                <div className="text-sm text-slate-700 space-y-1 ml-9">
                  <p>✅ Agent kimlikleri blockchain'den doğrulandı</p>
                  <p>✅ Challenge imzaları verify edildi</p>
                  <p>✅ USDC ödemesi tamamlandı ve memo kaydedildi</p>
                  <p>✅ Home robot kapıyı açtı (veya başka eylem tetiklendi)</p>
                </div>
              </div>

              {/* Production Notes */}
              <div className="mt-6 p-4 rounded-lg bg-slate-800 text-slate-100">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  Production için Ekstra Adımlar:
                </h4>
                <ul className="text-sm space-y-1 ml-7">
                  <li>• RPC endpoint'i değiştirin (Helius, QuickNode, vb.)</li>
                  <li>• WebSocket kullanın (polling yerine real-time)</li>
                  <li>• Redis ekleyin (nonce replay protection için)</li>
                  <li>• Rate limiting uygulayın</li>
                  <li>• Error handling ve retry logic ekleyin</li>
                  <li>• Monitoring ve alerting kurun</li>
                </ul>
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

                  <Dialog open={isConfirmRegisterOpen} onOpenChange={setIsConfirmRegisterOpen}>
                    <DialogTrigger asChild>
                      <Button aria-label="Confirm register agent" disabled={isRegistering || !agentId || !metadataUri} className="w-full bg-slate-900 hover:bg-slate-800">
                        {isRegistering ? 'Registering...' : 'Register Agent'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Registration</DialogTitle>
                        <DialogDescription>
                          You are about to register a new agent.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Agent ID:</span> {agentId}</div>
                        <div><span className="font-medium">Metadata:</span> {metadataUri}</div>
                        <div><span className="font-medium">Fee:</span> {formatSOL(PROGRAM_CONSTANTS.REGISTRATION_FEE)} SOL</div>
                        <div className="text-slate-600">This will create Identity + Reputation + Reward Pool PDAs.</div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmRegisterOpen(false)}>Cancel</Button>
                        <Button onClick={() => { setIsConfirmRegisterOpen(false); void handleRegister(); }}>
                          Confirm & Sign
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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

      {/* VALIDATION SECTION */}
      <section id="validation" className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold text-slate-900">Submit Validation</h2>
            <p className="text-lg text-slate-600">Approve or reject agent task results</p>
          </div>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Validation Console</CardTitle>
              <CardDescription>Simple validation demo (on-chain wiring can be added)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="val-agent">Agent ID</Label>
                  <Input 
                    id="val-agent" 
                    placeholder="my-agent-001" 
                    value={validationAgentId}
                    onChange={(e) => setValidationAgentId(e.target.value)}
                    disabled={isSubmittingValidation}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="val-result">Result</Label>
                  <select 
                    id="val-result" 
                    className="w-full rounded-md border border-slate-300 bg-white h-10 px-3"
                    value={validationResult}
                    onChange={(e) => setValidationResult(e.target.value)}
                    disabled={isSubmittingValidation}
                  >
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="val-note">Note</Label>
                  <Textarea 
                    id="val-note" 
                    placeholder="Optional note..." 
                    rows={3}
                    value={validationNote}
                    onChange={(e) => setValidationNote(e.target.value)}
                    disabled={isSubmittingValidation}
                  />
                </div>
              </div>
              <div className="action-buttons">
                <Button 
                  onClick={handleSubmitValidation}
                  disabled={isSubmittingValidation || !validationAgentId.trim()}
                  aria-label="Submit validation"
                >
                  {isSubmittingValidation ? 'Submitting...' : 'Submit Validation'}
                </Button>
              </div>
            </CardContent>
          </Card>
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
                    <div className="pt-3">
                      <Button variant="outline" size="sm" onClick={showSlashingAlert}>Simulate Slashing Alert</Button>
                    </div>
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

      {/* REWARDS SECTION */}
      <section id="rewards" className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold text-slate-900">Claim Rewards</h2>
            <p className="text-lg text-slate-600">Base staking, validator fees and more</p>
          </div>
          <div className="space-y-6">
            {/* Agent rewards breakdown (mock UI using claimable map) */}
            {myAgents.map((a) => (
              <Card key={`rewards-${a.agentId}`} className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>🤖 Agent Staking Rewards — {a.agentId}</span>
                    <Button
                      size="sm"
                      onClick={() => void handleClaimRewards(a.agentId)}
                      disabled={(claimable[a.agentId] || 0) <= 0}
                    >
                      Claim
                    </Button>
                  </CardTitle>
                  <CardDescription>Accrued Rewards: {formatSOL((claimable[a.agentId] || 0))} SOL</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-700">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 rounded border border-slate-200 bg-white">
                      <div className="font-medium mb-1">Reward Breakdown</div>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>Base staking rewards: {formatSOL(((claimable[a.agentId] || 0) * 0.85))} SOL</li>
                        <li>Performance bonus: {formatSOL(((claimable[a.agentId] || 0) * 0.15))} SOL</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded border border-slate-200 bg-white">
                      <div className="font-medium mb-1">Claim Options</div>
                      <ul className="space-y-2">
                        <li><label className="flex items-center gap-2"><input type="radio" name={`claim-${a.agentId}`} defaultChecked /> <span>Claim to wallet</span></label></li>
                        <li><label className="flex items-center gap-2"><input type="radio" name={`claim-${a.agentId}`} /> <span>Auto-compound</span></label></li>
                        <li><label className="flex items-center gap-2"><input type="radio" name={`claim-${a.agentId}`} /> <span>Donate to treasury</span></label></li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {myAgents.length === 0 && (
              <Card className="border-slate-200">
                <CardContent className="py-8 text-center text-slate-600">No agents yet — register your first agent to start earning.</CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* AUTO-COMPOUND SETTINGS */}
      <section id="auto-compound" className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-slate-900">Auto-Compound Settings</h2>
            <p className="text-lg text-slate-600">Automatically restake your rewards</p>
          </div>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Choose when and how rewards are auto-compounded</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={compound.enabled} onChange={(e) => setCompound({ ...compound, enabled: e.target.checked })} />
                <span>Enable auto-compound</span>
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ac-frequency">Frequency</Label>
                  <select id="ac-frequency" className="w-full rounded-md border border-slate-300 bg-white h-10 px-3" value={compound.frequency} onChange={(e) => setCompound({ ...compound, frequency: e.target.value as CompoundSettings['frequency'] })}>
                    <option value="daily">Daily (gas intensive)</option>
                    <option value="weekly">Weekly (recommended)</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ac-threshold">Minimum threshold (SOL)</Label>
                  <Input id="ac-threshold" value={compound.thresholdSol} onChange={(e) => setCompound({ ...compound, thresholdSol: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Apply to</Label>
                  <div className="space-y-2 text-sm p-3 rounded border border-slate-200">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={compound.applyAgent} onChange={(e) => setCompound({ ...compound, applyAgent: e.target.checked })} /> Agent staking rewards</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={compound.applyValidator} onChange={(e) => setCompound({ ...compound, applyValidator: e.target.checked })} /> Validator fees</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={compound.applyLP} onChange={(e) => setCompound({ ...compound, applyLP: e.target.checked })} /> LP earnings</label>
                  </div>
                </div>
              </div>
              <div>
                <Button onClick={saveCompound}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* LEADERBOARD (MOCK) */}
      <section id="leaderboard" className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-slate-900">Staking Leaderboard</h2>
            <p className="text-lg text-slate-600">Top stakers and validators</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Top Stakers — Agent Category</CardTitle>
                <CardDescription>Mock data for demo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  {[
                    { rank: 1, name: 'alpha-whale.sol', staked: '250 SOL', mult: '3.0x', rep: '29,961' },
                    { rank: 2, name: 'crypto-king.sol', staked: '180 SOL', mult: '3.0x', rep: '28,956' },
                    { rank: 3, name: 'defi-master.sol', staked: '120 SOL', mult: '2.0x', rep: '18,400' },
                  ].map((r) => (
                    <div key={`stk-${r.rank}`} className="p-3 rounded border border-slate-200 flex items-center justify-between">
                      <div>#{r.rank} {r.name}</div>
                      <div className="text-slate-600">{r.staked} • {r.mult} • Rep {r.rep}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Top Validators — This Month</CardTitle>
                <CardDescription>Mock data for demo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  {[
                    { rank: 1, name: 'validator-alpha', validations: 2847, fees: '28.5 SOL', rep: 9999 },
                    { rank: 2, name: 'validator-beta', validations: 2103, fees: '21.0 SOL', rep: 9854 },
                    { rank: 3, name: 'validator-gamma', validations: 1956, fees: '19.6 SOL', rep: 9702 },
                  ].map((r) => (
                    <div key={`val-${r.rank}`} className="p-3 rounded border border-slate-200 flex items-center justify-between">
                      <div>#{r.rank} {r.name}</div>
                      <div className="text-slate-600">{r.validations} validations • {r.fees} • Rep {r.rep}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS PANEL */}
      <section className="py-12 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Notifications ({notifications.length})</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearNotifications}>Mark All Read</Button>
            </div>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-slate-500 text-sm">No notifications yet</div>
            ) : notifications.map(n => (
              <div key={n.id} className="p-4 rounded-lg border border-slate-200 flex items-start justify-between">
                <div>
                  <div className="font-medium">{n.title}</div>
                  {n.message && <div className="text-sm text-slate-600 mt-1">{n.message}</div>}
                  <div className="text-xs text-slate-400 mt-1">{n.time}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => dismissNotification(n.id)}>Dismiss</Button>
              </div>
            ))}
          </div>
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
