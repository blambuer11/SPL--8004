import { useState, useEffect, useCallback } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { createStakingClient } from '@/lib/staking-client';
import { toast } from 'sonner';

export default function Staking() {
  const { publicKey, connected } = useWallet();
  const anchorWallet = useAnchorWallet();
  const [stakeAmt, setStakeAmt] = useState('0.1');
  const [unstakeAmt, setUnstakeAmt] = useState('');
  const [loadingStake, setLoadingStake] = useState(false);
  const [loadingUnstake, setLoadingUnstake] = useState(false);
  const [status, setStatus] = useState<{staked:number; validations:number}>({ staked: 0, validations: 0 });

  const refreshStatus = useCallback(async () => {
    try {
      if (!publicKey || !anchorWallet) return;
      const connection = new Connection(import.meta.env.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com', 'confirmed');
      const client = createStakingClient(connection, anchorWallet);
      const v = await client.getValidatorAccount(publicKey);
      setStatus({ staked: (v?.stakedAmount ?? 0) / 1_000_000_000, validations: v?.totalValidations ?? 0 });
    } catch (e) {
      console.warn('refreshStatus failed', e);
    }
  }, [publicKey, anchorWallet]);

  useEffect(() => { void refreshStatus(); }, [refreshStatus]);

  const handleStake = async () => {
    if (!connected || !publicKey || !anchorWallet) { toast.error('Connect wallet first'); return; }
    const lamports = Math.floor(parseFloat(stakeAmt || '0') * 1_000_000_000);
    if (!lamports || lamports < 100_000_000) { toast.error('Minimum 0.1 SOL'); return; }
    try {
      setLoadingStake(true);
      const connection = new Connection(import.meta.env.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com', 'confirmed');
      const client = createStakingClient(connection, anchorWallet);
      const sig = await client.stake(lamports);
      toast.success('Staked', { description: sig, action:{ label:'Explorer', onClick:()=>window.open(`https://explorer.solana.com/tx/${sig}?cluster=devnet`,'_blank') } });
      setStakeAmt('0.1');
      await refreshStatus();
    } catch(e: unknown) {
      toast.error('Stake failed', { description: (e as Error)?.message || String(e) });
    } finally { setLoadingStake(false); }
  };

  const handleUnstake = async () => {
    if (!connected || !publicKey || !anchorWallet) { toast.error('Connect wallet first'); return; }
    const lamports = Math.floor(parseFloat(unstakeAmt || '0') * 1_000_000_000);
    if (!lamports) { toast.error('Enter amount'); return; }
    try {
      setLoadingUnstake(true);
      const connection = new Connection(import.meta.env.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com', 'confirmed');
      const client = createStakingClient(connection, anchorWallet);
      const sig = await client.unstake(lamports);
      toast.success('Unstake requested', { description: sig });
      setUnstakeAmt('');
      await refreshStatus();
    } catch(e: unknown) {
      toast.error('Unstake failed', { description: (e as Error)?.message || String(e) });
    } finally { setLoadingUnstake(false); }
  };

  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold">Validator Staking</h1>
        <p className="text-sm text-slate-400 mt-1">Stake SOL to validate and earn rewards</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="font-semibold text-lg">Stake SOL</h3>
          <p className="text-sm text-slate-400">Minimum stake: 0.1 SOL | Cooldown: 7 days</p>
          <div className="space-y-2">
            <label className="text-sm font-medium block">Stake Amount (SOL)</label>
            <input value={stakeAmt} onChange={e=>setStakeAmt(e.target.value)} type="number" step="0.1" min="0.1" className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm" placeholder="0.1" />
          </div>
          <button disabled={loadingStake} onClick={handleStake} className="w-full bg-slate-100 disabled:opacity-50 hover:bg-slate-200 text-black rounded px-4 py-2.5 text-sm font-medium transition">{loadingStake ? 'Staking...' : 'Stake to Become Validator'}</button>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="font-semibold text-lg">Your Validator Status</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded bg-white/5">
              <div className="text-xs text-slate-400">Staked</div>
              <div className="text-lg font-bold">{status.staked.toFixed(2)} SOL</div>
            </div>
            <div className="p-3 rounded bg-white/5">
              <div className="text-xs text-slate-400">Validations</div>
              <div className="text-lg font-bold">{status.validations}</div>
            </div>
            <div className="p-3 rounded bg-white/5">
              <div className="text-xs text-slate-400">Fees Earned</div>
              <div className="text-lg font-bold">0.00</div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium block">Unstake Amount (SOL)</label>
            <input value={unstakeAmt} onChange={e=>setUnstakeAmt(e.target.value)} type="number" step="0.1" className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm" placeholder={`Max: ${status.staked.toFixed(2)} SOL`} />
          </div>
          <button disabled={loadingUnstake} onClick={handleUnstake} className="w-full border border-white/10 hover:bg-white/5 text-slate-300 rounded px-4 py-2.5 text-sm font-medium transition">{loadingUnstake ? 'Unstaking...' : 'Unstake SOL'}</button>
        </div>
      </div>
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h3 className="font-semibold text-lg mb-3">💎 Validator Benefits</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span>Earn validation fees from reputation updates</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span>Vote on protocol governance</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span>Build reputation in the Noema ecosystem</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
