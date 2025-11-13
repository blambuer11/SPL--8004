import { useMemo, useState } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { useStaking } from '@/hooks/useStaking';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const formatSOL = (lamports: number) => `${(lamports / 1e9).toFixed(3)} SOL`;

export default function Validation() {
  const { client: stakingClient } = useStaking();
  const { connected, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('0.1');
  const [unstakeAmount, setUnstakeAmount] = useState('0.05');
  const [info, setInfo] = useState<{ staked: number; isActive: boolean } | null>(null);

  const canUse = useMemo(() => connected && !!publicKey && !!stakingClient, [connected, publicKey, stakingClient]);

  const refresh = async () => {
    if (!stakingClient || !publicKey) return;
    try {
      const validator = await stakingClient.getValidatorAccount(publicKey);
      setInfo(validator ? { staked: validator.stakedAmount, isActive: validator.isActive } : { staked: 0, isActive: false });
    } catch (e) {
      console.warn(e);
      setInfo(null);
    }
  };

  const doStake = async () => {
    if (!canUse) { toast.error('Connect your wallet'); return; }
    const v = parseFloat(stakeAmount);
    if (!v || v <= 0) { toast.error('Enter a valid amount'); return; }
    setLoading(true);
    try {
      const sig = await stakingClient!.stake(Math.round(v * LAMPORTS_PER_SOL));
      toast.success('Staked to become validator', { description: sig.slice(0, 16) + '…' });
      await refresh();
    } catch (e) {
      console.error('Stake error:', e);
      const msg = e instanceof Error ? e.message : (typeof e === 'string' ? e : JSON.stringify(e));
      toast.error('Stake failed', { description: msg.slice(0, 300) });
    } finally { setLoading(false); }
  };

  const doUnstake = async () => {
    if (!canUse) { toast.error('Connect your wallet'); return; }
    const v = parseFloat(unstakeAmount);
    if (!v || v <= 0) { toast.error('Enter a valid amount'); return; }
    setLoading(true);
    try {
      const sig = await stakingClient!.unstake(Math.round(v * LAMPORTS_PER_SOL));
      toast.success('Unstake submitted', { description: sig.slice(0, 16) + '…' });
      await refresh();
    } catch (e) {
      console.error('Unstake error:', e);
      const msg = e instanceof Error ? e.message : (typeof e === 'string' ? e : JSON.stringify(e));
      toast.error('Unstake failed', { description: msg.slice(0, 300) });
    } finally { setLoading(false); }
  };

  const doClaim = async () => {
    if (!canUse) { toast.error('Connect your wallet'); return; }
    setLoading(true);
    try {
      const sig = await stakingClient!.claimRewards();
      toast.success('Rewards claimed', { description: sig.slice(0, 16) + '…' });
      await refresh();
    } catch (e) {
      console.error('Claim error:', e);
      const msg = e instanceof Error ? e.message : (typeof e === 'string' ? e : JSON.stringify(e));
      toast.error('Claim failed', { description: msg.slice(0, 300) });
    } finally { setLoading(false); }
  };

  // Initial info fetch (lazy: user clicks refresh)

  return (
    <div className="min-h-screen text-slate-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
            <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 rounded-full border border-blue-500/30">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Validation Console</h1>
            <p className="text-slate-400">Stake SOL to become a validator and manage your validator account</p>
          </div>
          <div className="ml-auto">
            <button onClick={refresh} className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-sm">Refresh</button>
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-slate-400 text-sm">Status</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              {info?.isActive ? <><span className="text-emerald-400">●</span> Active</> : <><span className="text-amber-400">●</span> Inactive</>}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-slate-400 text-sm">Your Stake</div>
            <div className="text-2xl font-bold text-white">{info ? formatSOL(info.staked) : '—'}</div>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-slate-400 text-sm">Network</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-300" /> SPL-8004</div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="text-white font-semibold">Stake SOL</div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Amount (SOL)"
              className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-500"
            />
            <button onClick={doStake} disabled={!canUse || loading} className="px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Stake to Become Validator</button>
            <div className="text-xs text-slate-500">Minimum stake applies as per program config</div>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="text-white font-semibold">Unstake</div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              placeholder="Amount (SOL)"
              className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-500"
            />
            <button onClick={doUnstake} disabled={!canUse || loading} className="px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold border border-white/10">Unstake</button>
            <button onClick={doClaim} disabled={!canUse || loading} className="px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold">Claim Rewards</button>
            <div className="text-xs text-slate-500">Instant-unstake also supported via program (fee may apply)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
