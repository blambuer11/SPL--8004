import { useCallback, useEffect, useMemo, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Rocket, TrendingUp, ShieldCheck, DollarSign, ArrowUpCircle, ArrowDownCircle, RefreshCcw, Award, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useStaking } from '@/hooks/useStaking';
import { useNoemaStaking } from '@/hooks/useNoemaStaking';
import type { StakingConfig, ValidatorAccount } from '@/lib/staking-client';
import type { NoemaConfigAccount, NoemaValidatorAccount } from '@/lib/noema/noema-staking-client';
import { PROGRAM_CONSTANTS, formatSOL } from '@/lib/program-constants';
import { getExplorerTxUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { NOEMA_MINT } from '@/lib/noema/noema-staking-client';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';

export default function Staking() {
  const { client: stakingClient, connected, publicKey } = useStaking();
  const { client: noemaClient, connected: noemaConnected } = useNoemaStaking();
  const { connection } = useConnection();
  const wallet = useWallet();
  const [config, setConfig] = useState<StakingConfig | null>(null);
  const [validator, setValidator] = useState<ValidatorAccount | null>(null);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [noemaConfig, setNoemaConfig] = useState<NoemaConfigAccount | null>(null);
  const [noemaValidator, setNoemaValidator] = useState<NoemaValidatorAccount | null>(null);
  const [noemaPendingRewards, setNoemaPendingRewards] = useState<bigint>(0n);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [noemaStakeAmount, setNoemaStakeAmount] = useState('');
  const [noemaUnstakeAmount, setNoemaUnstakeAmount] = useState('');
  const [staking, setStaking] = useState(false);
  const [unStaking, setUnStaking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [noemaStakingBusy, setNoemaStakingBusy] = useState(false);
  const [noemaUnstakingBusy, setNoemaUnstakingBusy] = useState(false);
  const [noemaClaimingBusy, setNoemaClaimingBusy] = useState(false);
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
    if (!stakingClient && !noemaClient) return;
    setRefreshing(true);
    try {
      const promises: Promise<any>[] = [];

      if (stakingClient) {
        promises.push(
          stakingClient.getConfigAccount().then((cfg) => setConfig(cfg)),
          publicKey
            ? stakingClient.getValidatorAccount(publicKey).then(async (validatorAccount) => {
                setValidator(validatorAccount);
                if (publicKey && validatorAccount) {
                  const rewards = await stakingClient.calculatePendingRewards(publicKey);
                  setPendingRewards(rewards);
                } else {
                  setPendingRewards(0);
                }
              })
            : Promise.resolve()
        );
      }

      if (noemaClient && publicKey) {
        promises.push(
          noemaClient.getConfigAccount().then((cfg) => setNoemaConfig(cfg)),
          noemaClient.getValidatorAccount(publicKey).then((val) => {
            setNoemaValidator(val);
            setNoemaPendingRewards(val ? val.pendingRewards : 0n);
          })
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Staking refresh error:', error);
      toast.error('Failed to load staking data', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setRefreshing(false);
    }
  }, [publicKey, stakingClient, noemaClient]);

  useEffect(() => {
    if (!stakingClient && !noemaClient) {
      setValidator(null);
      setPendingRewards(0);
      setNoemaValidator(null);
      setNoemaPendingRewards(0n);
      return;
    }
    if (connected || noemaConnected) {
      void refreshData();
    }
  }, [stakingClient, noemaClient, connected, noemaConnected, refreshData]);

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
    const loadingId = toast.loading('Cüzdan onayı bekleniyor…');
    try {
      const lamports = Math.floor(parsed * LAMPORTS_PER_SOL);
      const sig = await stakingClient.stake(lamports);
      toast.dismiss(loadingId);
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
      toast.dismiss(loadingId);
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
    const loadingId = toast.loading(instant ? 'Anında unstake için onay bekleniyor…' : 'Unstake onayı bekleniyor…');
    try {
      const lamports = Math.floor(parsed * LAMPORTS_PER_SOL);
      const sig = instant
        ? await stakingClient.instantUnstake(lamports)
        : await stakingClient.unstake(lamports);
      toast.dismiss(loadingId);
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
      toast.dismiss(loadingId);
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
    const loadingId = toast.loading('Ödül talebi için onay bekleniyor…');
    try {
      const sig = await stakingClient.claimRewards();
      toast.dismiss(loadingId);
      toast.success('Rewards claimed', {
        description: (
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">
            View transaction
          </a>
        ),
      });
      await refreshData();
    } catch (error) {
      toast.dismiss(loadingId);
      console.error('Claim error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to claim rewards');
    } finally {
      setClaiming(false);
    }
  };

  // NOEMA Actions
  const handleNoemaStake = async () => {
    if (!noemaClient || !publicKey) {
      toast.error('Cüzdanı bağlayın (NOEMA stake)');
      return;
    }
    const parsed = parseFloat(noemaStakeAmount);
    if (!parsed || parsed <= 0) {
      toast.error('Geçerli bir NOEMA miktarı girin');
      return;
    }
    setNoemaStakingBusy(true);
    try {
      const raw = BigInt(Math.floor(parsed * 1e9));
      const sig = await noemaClient.stake(raw);
      toast.success('NOEMA stake gönderildi', {
        description: (
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">
            İşlemi görüntüle
          </a>
        ),
      });
      setNoemaStakeAmount('');
      await refreshData();

      // Ensure treasury ATA exists (payer: user)
      const ataInfo = await connection.getAccountInfo(treasuryAta);
      if (!ataInfo) {
        if (!wallet.publicKey || !wallet.signTransaction) throw new Error('Wallet not ready');
        const createIx = createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          treasuryAta,      // ata address
          noemaConfig.treasury, // owner
          NOEMA_MINT
        );
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
        const tx = new Transaction({ feePayer: wallet.publicKey, blockhash, lastValidBlockHeight }).add(createIx);
        const signed = await wallet.signTransaction(tx);
        const sigCreate = await connection.sendRawTransaction(signed.serialize(), { maxRetries: 3, preflightCommitment: 'confirmed' });
        await connection.confirmTransaction({ signature: sigCreate, blockhash, lastValidBlockHeight }, 'confirmed');
      }
    } catch (error) {
      console.error('NOEMA stake error:', error);
      toast.error(error instanceof Error ? error.message : 'NOEMA stake başarısız');
    } finally {
      setNoemaStakingBusy(false);
    }
  };

  const handleNoemaUnstake = async () => {
    if (!noemaClient || !publicKey) {
      toast.error('Cüzdanı bağlayın (NOEMA unstake)');
      return;
    }
    const parsed = parseFloat(noemaUnstakeAmount);
    if (!parsed || parsed <= 0) {
      toast.error('Geçerli bir NOEMA miktarı girin');
      return;
    }
    if (noemaValidator && parsed > Number(noemaValidator.stakedAmount) / 1e9) {
      toast.error('Miktar stake bakiyesini aşıyor');
      return;
    }
    setNoemaUnstakingBusy(true);
    const loadingId = toast.loading('NOEMA unstake için onay bekleniyor…');
    try {
      const raw = BigInt(Math.floor(parsed * 1e9));
      const sig = await noemaClient.unstake(raw);
      toast.dismiss(loadingId);
      toast.success('NOEMA unstake gönderildi', {
        description: (
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">
            İşlemi görüntüle
          </a>
        ),
      });
      setNoemaUnstakeAmount('');
      await refreshData();
    } catch (error) {
      toast.dismiss(loadingId);
      console.error('NOEMA unstake error:', error);
      toast.error(error instanceof Error ? error.message : 'NOEMA unstake başarısız');
    } finally {
      setNoemaUnstakingBusy(false);
    }
  };

  const handleNoemaClaim = async () => {
    if (!noemaClient || !publicKey) {
      toast.error('Cüzdanı bağlayın (NOEMA claim)');
      return;
    }
    if (!noemaPendingRewards || noemaPendingRewards <= 0n) {
      toast.info('NOEMA ödül bulunamadı');
      return;
    }
    setNoemaClaimingBusy(true);
    const loadingId = toast.loading('NOEMA claim için onay bekleniyor…');
    try {
      const sig = await noemaClient.claimRewards();
      toast.dismiss(loadingId);
      toast.success('NOEMA ödülleri çekildi', {
        description: (
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">
            İşlemi görüntüle
          </a>
        ),
      });
      await refreshData();
    } catch (error) {
      toast.dismiss(loadingId);
      console.error('NOEMA claim error:', error);
      toast.error(error instanceof Error ? error.message : 'NOEMA claim başarısız');
    } finally {
      setNoemaClaimingBusy(false);
    }
  };

  const handleRegisterValidator = async () => {
    if (!noemaClient || !publicKey) {
      toast.error('Cüzdanı bağlayın (Validatör kayıt)');
      return;
    }
    if (!noemaConfig) {
      toast.error('NOEMA konfigürasyonu okunamadı');
      return;
    }
    try {
      setNoemaStakingBusy(true);
      const loadingId = toast.loading('Minimum NOEMA stake için onay bekleniyor…');
      const minRaw = noemaConfig.validatorMinStake;
      const sig = await noemaClient.stake(minRaw);
      toast.dismiss(loadingId);
      toast.success('Validatör kaydı için minimum stake gönderildi', {
        description: (
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">
            İşlemi görüntüle
          </a>
        ),
      });
      await refreshData();
    } catch (error) {
      console.error('Register validator (NOEMA) error:', error);
      toast.error(error instanceof Error ? error.message : 'Validatör kayıt işlemi başarısız');
    } finally {
      setNoemaStakingBusy(false);
    }
  };

  const handleNoemaInstantUnstake = async () => {
    if (!noemaClient || !publicKey) {
      toast.error('Cüzdanı bağlayın (NOEMA instant)');
      return;
    }
    if (!noemaConfig) {
      toast.error('NOEMA konfigürasyonu okunamadı');
      return;
    }
    const parsed = parseFloat(noemaUnstakeAmount);
    if (!parsed || parsed <= 0) {
      toast.error('Geçerli bir NOEMA miktarı girin');
      return;
    }
    if (noemaValidator && parsed > Number(noemaValidator.stakedAmount) / 1e9) {
      toast.error('Miktar stake bakiyesini aşıyor');
      return;
    }
    setNoemaUnstakingBusy(true);
    const loadingId = toast.loading('NOEMA anında unstake için onay bekleniyor…');
    try {
      const raw = BigInt(Math.floor(parsed * 1e9));
      const treasuryAta = getAssociatedTokenAddressSync(NOEMA_MINT, noemaConfig.treasury, false);
      const sig = await noemaClient.instantUnstake(raw, treasuryAta);
      toast.dismiss(loadingId);
      toast.success('NOEMA instant unstake gönderildi', {
        description: (
          <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">
            İşlemi görüntüle
          </a>
        ),
      });
      setNoemaUnstakeAmount('');
      await refreshData();
    } catch (error) {
      toast.dismiss(loadingId);
      console.error('NOEMA instant unstake error:', error);
      toast.error(error instanceof Error ? error.message : 'NOEMA instant unstake başarısız');
    } finally {
      setNoemaUnstakingBusy(false);
    }
  };

  if (!connected && !noemaConnected) {
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
                Cüzdanınızı bağlayın; SOL veya NOEMA stake ederek validatör ödülleri ve itibar puanı kazanın.
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
            <div className="flex gap-2">
            <Input
              type="number"
              min={minStakeSol}
              step="0.01"
              value={stakeAmount}
              onChange={(event) => setStakeAmount(event.target.value)}
              placeholder={`${minStakeSol.toFixed(2)} SOL minimum`}
              className="bg-white/10 border-white/20 text-white"
            />
            <Button type="button" variant="outline" className="border-white/20 text-slate-200" onClick={() => setStakeAmount(minStakeSol.toFixed(2))}>Min</Button>
            </div>
            <Button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); void handleStake(); }}
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
            <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={unstakeAmount}
              onChange={(event) => setUnstakeAmount(event.target.value)}
              placeholder="Amount (SOL)"
              className="bg-white/10 border-white/20 text-white"
            />
            <Button type="button" variant="outline" className="border-white/20 text-slate-200" onClick={() => setUnstakeAmount(validatorStakeSol.toFixed(4))}>Max</Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); void handleUnstake(false); }}
              disabled={unStaking || !unstakeAmount}
              className="border-white/20 text-slate-200 hover:text-white"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              {unStaking ? 'Processing…' : 'Unstake'}
            </Button>
            <Button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); void handleUnstake(true); }}
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
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); void handleClaim(); }}
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

      {/* NOEMA Staking + Reputation */}
      <div className="pt-2">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-purple-300" /> NOEMA Staking + Reputation
        </h2>
        {!noemaConnected ? (
          <Alert className="bg-amber-500/10 border-amber-500/20">
            <AlertDescription className="text-amber-300 text-sm">
              NOEMA stake ve itibar puanlarını görmek için cüzdanınızı bağlayın.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-300" /> Staked NOEMA
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-white">
                  {noemaValidator ? (Number(noemaValidator.stakedAmount) / 1e9).toFixed(4) : '0.0000'}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-300" /> Reputation Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-yellow-300">
                  {noemaValidator ? Number(noemaValidator.totalValidations) : 0}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-300" /> Pending NOEMA
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-emerald-300">
                  {(Number(noemaPendingRewards) / 1e9).toFixed(4)}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-300" /> Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold text-white">
                    {noemaValidator?.isActive ? 'Active' : 'Inactive'}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Stake NOEMA</CardTitle>
                  <CardDescription>
                    Minimum: {noemaConfig ? (Number(noemaConfig.validatorMinStake) / 1e9).toFixed(2) : '—'} NOEMA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <div className="flex gap-2">
                    <Input
                      type="number"
                      min={noemaConfig ? Number(noemaConfig.validatorMinStake) / 1e9 : 0}
                      step="0.000001"
                      value={noemaStakeAmount}
                      onChange={(e) => setNoemaStakeAmount(e.target.value)}
                      placeholder="NOEMA miktarı"
                      className="bg-white/10 border-white/20 text-white"
                    />
                    {noemaConfig && (
                      <Button type="button" variant="outline" className="border-white/20 text-slate-200" onClick={() => setNoemaStakeAmount((Number(noemaConfig.validatorMinStake)/1e9).toFixed(6))}>Min</Button>
                    )}
                    </div>
                    <Button type="button" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); void handleNoemaStake(); }} disabled={noemaStakingBusy || !noemaStakeAmount} className="bg-emerald-600 hover:bg-emerald-700">
                      {noemaStakingBusy ? 'Staking…' : 'Stake NOEMA'}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={noemaStakingBusy} onClick={handleRegisterValidator} className="border-white/20 text-slate-200 hover:text-white">
                      Validatör Kaydet (Min)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Unstake NOEMA</CardTitle>
                  <CardDescription>Standart unstake sürecini uygular</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.000001"
                      value={noemaUnstakeAmount}
                      onChange={(e) => setNoemaUnstakeAmount(e.target.value)}
                      placeholder="NOEMA miktarı"
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Button type="button" variant="outline" className="border-white/20 text-slate-200" onClick={() => setNoemaUnstakeAmount(noemaValidator ? (Number(noemaValidator.stakedAmount)/1e9).toFixed(6) : '0')}>Max</Button>
                    </div>
                    <div className="flex gap-2">
                    <Button type="button" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); void handleNoemaUnstake(); }} disabled={noemaUnstakingBusy || !noemaUnstakeAmount} className="bg-purple-600 hover:bg-purple-700">
                      {noemaUnstakingBusy ? 'Processing…' : 'Unstake NOEMA'}
                    </Button>
                    <Button type="button" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); void handleNoemaInstantUnstake(); }} disabled={noemaUnstakingBusy || !noemaUnstakeAmount} className="bg-fuchsia-600 hover:bg-fuchsia-700">
                      {noemaUnstakingBusy ? 'Processing…' : 'Instant Unstake NOEMA'}
                    </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10 mt-4">
              <CardHeader>
                <CardTitle className="text-white text-lg">Claim NOEMA Rewards</CardTitle>
                <CardDescription>NOEMA birikmiş ödülleri cüzdanınıza aktarır</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold text-emerald-300">{(Number(noemaPendingRewards) / 1e9).toFixed(4)} NOEMA</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Son claim: {noemaValidator?.lastRewardClaim ? new Date(Number(noemaValidator.lastRewardClaim) * 1000).toLocaleString() : 'Never'}
                  </div>
                </div>
                <Button type="button" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); void handleNoemaClaim(); }} disabled={noemaClaimingBusy || !noemaPendingRewards || noemaPendingRewards <= 0n} className="bg-emerald-600 hover:bg-emerald-700">
                  {noemaClaimingBusy ? 'Claiming…' : 'Claim NOEMA'}
                </Button>
              </CardContent>
            </Card>

            {noemaConfig && (
              <Card className="bg-white/5 border-white/10 mt-4">
                <CardHeader>
                  <CardTitle className="text-white text-base">NOEMA Network Parameters</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3 text-sm text-slate-300">
                  <div>
                    <div className="text-slate-500 text-xs uppercase">Authority</div>
                    <div className="font-mono text-xs break-all mt-1">{noemaConfig.authority.toBase58()}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs uppercase">Treasury</div>
                    <div className="font-mono text-xs break-all mt-1">{noemaConfig.treasury.toBase58()}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs uppercase">APY</div>
                    <div className="mt-1">{noemaConfig.baseApyBps / 100}%</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
