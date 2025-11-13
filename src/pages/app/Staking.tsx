import { useCallback, useEffect, useMemo, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Rocket, TrendingUp, ShieldCheck, DollarSign, ArrowUpCircle, ArrowDownCircle, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useStaking } from '@/hooks/useStaking';
import type { StakingConfig, ValidatorAccount } from '@/lib/staking-client';
import { PROGRAM_CONSTANTS, formatSOL } from '@/lib/program-constants';
import { getExplorerTxUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Staking() {
  const { client: stakingClient, connected, publicKey } = useStaking();
  const [config, setConfig] = useState<StakingConfig | null>(null);
  const [validator, setValidator] = useState<ValidatorAccount | null>(null);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [staking, setStaking] = useState(false);
  const [unStaking, setUnStaking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const minStakeLamports = useMemo(() => {
    const configured = config?.validatorMinStake;
    if (!configured || Number.isNaN(configured)) {
      return PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE;
    }

    // Guard against misconfigured on-chain values that surface unrealistic minimums.
    const MAX_REASONABLE_MIN_STAKE = 10 * LAMPORTS_PER_SOL; // cap at 10 SOL to keep UI actionable
    if (configured < PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE || configured > MAX_REASONABLE_MIN_STAKE) {
      return PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE;
    }

    return configured;
  }, [config?.validatorMinStake]);

  const minStakeSol = minStakeLamports / LAMPORTS_PER_SOL;

  const refreshData = useCallback(async () => {
    if (!stakingClient) return;
    setRefreshing(true);
    try {
      const [cfg, validatorAccount] = await Promise.all([
        stakingClient.getConfigAccount(),
        publicKey ? stakingClient.getValidatorAccount(publicKey) : Promise.resolve(null),
      ]);
      setConfig(cfg);
      setValidator(validatorAccount);
      if (publicKey && validatorAccount) {
        const rewards = await stakingClient.calculatePendingRewards(publicKey);
        setPendingRewards(rewards);
      } else {
        setPendingRewards(0);
      }
    } catch (error) {
      console.error('Staking refresh error:', error);
      toast.error('Failed to load staking data', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setRefreshing(false);
    }
  }, [publicKey, stakingClient]);

  useEffect(() => {
    if (!stakingClient || !connected) {
      setValidator(null);
      setPendingRewards(0);
      return;
    }
    void refreshData();
  }, [stakingClient, connected, refreshData]);

  const validatorStakeSol = useMemo(() => {
    return validator ? validator.stakedAmount / LAMPORTS_PER_SOL : 0;
  }, [validator]);

  const handleStake = async () => {
    if (!stakingClient || !publicKey) {
      toast.error('Connect your wallet to stake');
      return;
    }
    const parsed = parseFloat(stakeAmount);
    if (!parsed || parsed <= 0) {
      toast.error('Enter a valid stake amount');
      return;
    }
    if (parsed < minStakeSol) {
      toast.error(`Minimum stake is ${minStakeSol.toFixed(2)} SOL`);
      return;
    }
    setStaking(true);
    try {
      const lamports = Math.floor(parsed * LAMPORTS_PER_SOL);
      const sig = await stakingClient.stake(lamports);
      toast.success('Stake submitted', {
        description: (
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">
            View transaction
          </a>
        ),
      });
      setStakeAmount('');
      await refreshData();
    } catch (error) {
      console.error('Stake error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to stake');
    } finally {
      setStaking(false);
    }
  };

  const handleUnstake = async (instant = false) => {
    if (!stakingClient || !publicKey) {
      toast.error('Connect your wallet to unstake');
      return;
    }
    const parsed = parseFloat(unstakeAmount);
    if (!parsed || parsed <= 0) {
      toast.error('Enter a valid unstake amount');
      return;
    }
    if (parsed > validatorStakeSol) {
      toast.error('Amount exceeds staked balance');
      return;
    }
    setUnStaking(true);
    try {
      const lamports = Math.floor(parsed * LAMPORTS_PER_SOL);
      const sig = instant
        ? await stakingClient.instantUnstake(lamports)
        : await stakingClient.unstake(lamports);
      toast.success(`${instant ? 'Instant ' : ''}Unstake submitted`, {
        description: (
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">
            View transaction
          </a>
        ),
      });
      setUnstakeAmount('');
      await refreshData();
    } catch (error) {
      console.error('Unstake error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to unstake');
    } finally {
      setUnStaking(false);
    }
  };

  const handleClaim = async () => {
    if (!stakingClient || !publicKey) {
      toast.error('Connect your wallet to claim rewards');
      return;
    }
    if (pendingRewards <= 0) {
      toast.info('No rewards available yet');
      return;
    }
    setClaiming(true);
    try {
      const sig = await stakingClient.claimRewards();
      toast.success('Rewards claimed', {
        description: (
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">
            View transaction
          </a>
        ),
      });
      await refreshData();
    } catch (error) {
      console.error('Claim error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to claim rewards');
    } finally {
      setClaiming(false);
    }
  };

  if (!connected) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Rocket className="w-5 h-5 text-purple-400" /> Validator Staking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertDescription className="text-amber-300 text-sm">
                Connect your wallet to stake SOL and earn validator rewards.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Rocket className="w-6 h-6 text-purple-400" /> Validator Staking
          </h1>
          <p className="text-slate-400 mt-1">
            Stake SOL to activate your validator and participate in SPL-8004 task verification.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshData()}
          disabled={refreshing}
          className="border-white/20 text-slate-200 hover:text-white"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-300" /> Staked SOL
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Active validator balance</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-white">
            {validatorStakeSol.toFixed(4)}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-300" /> Pending Rewards
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Accrued validator earnings</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-emerald-300">
            {pendingRewards.toFixed(4)}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-300" /> Validator Health
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Last stake update</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-white">
              {validator?.isActive ? 'Active' : 'Pending activation'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Last stake: {validator?.lastStakeTs ? new Date(validator.lastStakeTs * 1000).toLocaleString() : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Stake SOL</CardTitle>
          <CardDescription>Minimum stake {minStakeSol.toFixed(2)} SOL • fees sourced from configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              type="number"
              min={minStakeSol}
              step="0.01"
              value={stakeAmount}
              onChange={(event) => setStakeAmount(event.target.value)}
              placeholder={`${minStakeSol.toFixed(2)} SOL minimum`}
              className="bg-white/10 border-white/20 text-white"
            />
            <Button
              onClick={handleStake}
              disabled={staking || !stakeAmount}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              {staking ? 'Staking…' : 'Stake'}
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Configured validator minimum: {formatSOL(minStakeLamports)} SOL • base APY {(config?.baseApyBps ?? 0) / 100}%
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Unstake</CardTitle>
          <CardDescription>Standard unstake respects cooldown • instant unstake charges treasury fee</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={unstakeAmount}
              onChange={(event) => setUnstakeAmount(event.target.value)}
              placeholder="Amount (SOL)"
              className="bg-white/10 border-white/20 text-white"
            />
            <Button
              variant="outline"
              onClick={() => handleUnstake(false)}
              disabled={unStaking || !unstakeAmount}
              className="border-white/20 text-slate-200 hover:text-white"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              {unStaking ? 'Processing…' : 'Unstake'}
            </Button>
            <Button
              onClick={() => handleUnstake(true)}
              disabled={unStaking || !unstakeAmount}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              {unStaking ? 'Processing…' : 'Instant Unstake'}
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Instant unstake fee: {(config?.instantUnstakeFeeBps ?? 0) / 100}% • validator stake remaining {validatorStakeSol.toFixed(4)} SOL
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Claim Rewards</CardTitle>
          <CardDescription>Transfers accrued rewards to your validator wallet</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold text-emerald-300">{pendingRewards.toFixed(4)} SOL</div>
            <div className="text-xs text-slate-500 mt-1">
              Last claim: {validator?.lastRewardClaim ? new Date(validator.lastRewardClaim * 1000).toLocaleString() : 'Never'}
            </div>
          </div>
          <Button
            onClick={handleClaim}
            disabled={claiming || pendingRewards <= 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {claiming ? 'Claiming…' : 'Claim Rewards'}
          </Button>
        </CardContent>
      </Card>

      {config && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base">Network Parameters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3 text-sm text-slate-300">
            <div>
              <div className="text-slate-500 text-xs uppercase">Authority</div>
              <div className="font-mono text-xs break-all mt-1">{config.authority.toBase58()}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs uppercase">Treasury</div>
              <div className="font-mono text-xs break-all mt-1">{config.treasury.toBase58()}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs uppercase">Validation Fee</div>
              <div className="mt-1">{formatSOL(config.validationFee)} SOL</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
