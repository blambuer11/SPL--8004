 { useCallback, useEffect, useMemo, useState } from 'react';
import { LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
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

export default function Staking() {
  const { client: stakingClient, connected, publicKey } = useStaking();
  const { client: noemaClient, connected: noemaConnected } = useNoemaStaking();
  const { connection } = useConnection();
  const wallet = useWallet();
  const [config, setConfig] = useState<StakingConfig | null>(null);
  const [validator, setValidator] = useState<ValidatorAccount | null>(null);
  const [noemaConfig, setNoemaConfig] = useState<NoemaConfigAccount | null>(null);
  const [noemaValidator, setNoemaValidator] = useState<NoemaValidatorAccount | null>(null);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [noemaPendingRewards, setNoemaPendingRewards] = useState(0n);
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

  const minStakeLamports: number = (() => {
    const x = config?.validatorMinStake;
    if (!x || Number.isNaN(Number(x))) return PROGRAM_CONSTANTS.VALIDATOR_MIN_STAKE;
    return x;
  })();

  const minStakeSol = minStakeLamports / LAMPORTS_PER_SOL;

  const refreshData = useCallback(async () => {
    if (!stakingClient && !noemaClient) return;
    setRefreshing(true);
    try {
      const promises = [];
      
      // SOL staking data
      if (stakingClient) {
        promises.push(
          stakingClient.getConfigAccount().then(cfg => setConfig(cfg)),
          publicKey ? stakingClient.getValidatorAccount(publicKey).then(val => {
            setValidator(val);
            if (val) return stakingClient.calculatePendingRewards(publicKey).then(r => setPendingRewards(r));
          }) : Promise.resolve()
        );
      }
      
      // NOEMA staking data
      if (noemaClient && publicKey) {
        promises.push(
          noemaClient.getConfigAccount().then(cfg => setNoemaConfig(cfg)),
          noemaClient.getValidatorAccount(publicKey).then(val => {
            setNoemaValidator(val);
            if (val) setNoemaPendingRewards(val.pendingRewards);
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
      setNoemaValidator(null);
      setPendingRewards(0);
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

  const handleNoemaStake = async () => {
    if (!noemaClient || !publicKey) { toast.error('Cüzdanı bağlayın (NOEMA stake)'); return; }
    const parsed = parseFloat(noemaStakeAmount); if (!parsed || parsed <= 0) { toast.error('Geçerli NOEMA miktarı girin'); return; }
    setNoemaStakingBusy(true); const loadingId = toast.loading('NOEMA stake onayı bekleniyor…');
    try {
      const raw = BigInt(Math.floor(parsed * 1e9)); const sig = await noemaClient.stake(raw);
      toast.dismiss(loadingId); toast.success('NOEMA stake gönderildi', { description: <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">İşlemi görüntüle</a> });
      setNoemaStakeAmount(''); await refreshData();
    } catch (e) { toast.dismiss(loadingId); toast.error(e instanceof Error ? e.message : 'NOEMA stake başarısız'); } finally { setNoemaStakingBusy(false); }
  };

  const handleNoemaUnstake = async () => {
    if (!noemaClient || !publicKey) { toast.error('Cüzdanı bağlayın (NOEMA unstake)'); return; }
    const parsed = parseFloat(noemaUnstakeAmount); if (!parsed || parsed <= 0) { toast.error('Geçerli NOEMA miktarı girin'); return; }
    if (noemaValidator && parsed > Number(noemaValidator.stakedAmount)/1e9) { toast.error('Miktar stake bakiyesini aşıyor'); return; }
    setNoemaUnstakingBusy(true); const loadingId = toast.loading('NOEMA unstake onayı bekleniyor…');
    try {
      const raw = BigInt(Math.floor(parsed * 1e9)); const sig = await noemaClient.unstake(raw);
      toast.dismiss(loadingId); toast.success('NOEMA unstake gönderildi', { description: <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">İşlemi görüntüle</a> });
      setNoemaUnstakeAmount(''); await refreshData();
    } catch (e) { toast.dismiss(loadingId); toast.error(e instanceof Error ? e.message : 'NOEMA unstake başarısız'); } finally { setNoemaUnstakingBusy(false); }
  };

  const handleNoemaInstantUnstake = async () => {
    if (!noemaClient || !publicKey) { toast.error('Cüzdanı bağlayın (NOEMA instant)'); return; }
    if (!noemaConfig) { toast.error('NOEMA config bulunamadı'); return; }
    const parsed = parseFloat(noemaUnstakeAmount); if (!parsed || parsed <= 0) { toast.error('Geçerli NOEMA miktarı girin'); return; }
    if (noemaValidator && parsed > Number(noemaValidator.stakedAmount)/1e9) { toast.error('Miktar stake bakiyesini aşıyor'); return; }
    setNoemaUnstakingBusy(true); const loadingId = toast.loading('NOEMA instant unstake onayı bekleniyor…');
    try {
      const raw = BigInt(Math.floor(parsed * 1e9));
      const treasuryAta = getAssociatedTokenAddressSync(NOEMA_MINT, noemaConfig.treasury, false);
      const ataInfo = await connection.getAccountInfo(treasuryAta);
      if (!ataInfo) {
        if (!wallet.publicKey || !wallet.signTransaction) throw new Error('Wallet hazır değil');
        const createIx = createAssociatedTokenAccountInstruction(wallet.publicKey, treasuryAta, noemaConfig.treasury, NOEMA_MINT);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
        const tx = new Transaction({ feePayer: wallet.publicKey, blockhash, lastValidBlockHeight }).add(createIx);
        const signed = await wallet.signTransaction(tx);
        const sigCreate = await connection.sendRawTransaction(signed.serialize(), { maxRetries: 3, preflightCommitment: 'confirmed' });
        await connection.confirmTransaction({ signature: sigCreate, blockhash, lastValidBlockHeight }, 'confirmed');
      }
      const sig = await noemaClient.instantUnstake(raw, treasuryAta);
      toast.dismiss(loadingId); toast.success('NOEMA instant unstake gönderildi', { description: <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">İşlemi görüntüle</a> });
      setNoemaUnstakeAmount(''); await refreshData();
    } catch (e) { toast.dismiss(loadingId); toast.error(e instanceof Error ? e.message : 'NOEMA instant unstake başarısız'); } finally { setNoemaUnstakingBusy(false); }
  };

  const handleNoemaClaim = async () => {
    if (!noemaClient || !publicKey) { toast.error('Cüzdanı bağlayın (NOEMA claim)'); return; }
    if (!noemaPendingRewards || noemaPendingRewards <= 0n) { toast.info('NOEMA ödül bulunamadı'); return; }
    setNoemaClaimingBusy(true); const loadingId = toast.loading('NOEMA claim onayı bekleniyor…');
    try {
      const sig = await noemaClient.claimRewards();
      toast.dismiss(loadingId); toast.success('NOEMA ödülleri çekildi', { description: <a href={getExplorerTxUrl(sig)} target="_blank" rel="noopener noreferrer" className="underline">İşlemi görüntüle</a> });
      await refreshData();
    } catch (e) { toast.dismiss(loadingId); toast.error(e instanceof Error ? e.message : 'NOEMA claim başarısız'); } finally { setNoemaClaimingBusy(false); }
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
                Connect your wallet to stake SOL/NOEMA and earn validator rewards.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Rocket className="w-6 h-6 text-purple-400" /> Validator Staking
          </h1>
          <p className="text-slate-400 mt-1">
            SOL ve NOEMA stake ederek validatörünüzü aktive edin, ödül ve itibar puanı kazanın.
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
      {/* SOL STAKING SECTION */}
      <div className="space-y-6">
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
            <CardDescription className="text-xs text-slate-500">On-chain staking configuration</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3 text-xs text-slate-300">
            <div>
              <span className="text-slate-500">Authority:</span>{' '}
              <span className="font-mono break-all">{config.authority.toBase58()}</span>
            </div>
            <div>
              <span className="text-slate-500">Treasury:</span>{' '}
              <span className="font-mono break-all">{config.treasury.toBase58()}</span>
            </div>
            <div>
              <span className="text-slate-500">Min Stake:</span>{' '}
              <span>{formatSOL(config.validatorMinStake)} SOL</span>
            </div>
            <div>
              <span className="text-slate-500">Base APY:</span>{' '}
              <span>{(config.baseApyBps/100).toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-slate-500">Instant Fee:</span>{' '}
              <span>{(config.instantUnstakeFeeBps/100).toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-slate-500">Validation Fee:</span>{' '}
              <span>{formatSOL(config.validationFee)} SOL</span>
            </div>
          </CardContent>
        </Card>
      )}
      {/* NOEMA STAKING SECTION */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-300" /> NOEMA Staking + Reputation
        </h2>
        {!noemaConnected ? (
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertDescription className="text-amber-300 text-sm">
                Connect your wallet to stake NOEMA tokens and build reputation.
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

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-base">About NOEMA Staking & Reputation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <p>
                    <strong className="text-purple-300">NOEMA staking</strong> allows you to stake NOEMA tokens to participate in the validator network and earn reputation scores based on your validation activity.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Reputation Scoring</div>
                        <div className="text-xs text-slate-400">Earn points for each successful validation. Higher reputation = more network trust.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Award className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Validator Rewards</div>
                        <div className="text-xs text-slate-400">Claim accumulated NOEMA rewards based on your staking and validation performance.</div>
                      </div>
                    </div>
                  </div>
                  {noemaConfig && (
                    <div className="pt-3 border-t border-white/10 grid md:grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-500">Min Stake:</span> <span className="text-white font-mono">{(Number(noemaConfig.validatorMinStake) / 1e9).toFixed(2)} NOEMA</span></div>
                      <div><span className="text-slate-500">APY:</span> <span className="text-emerald-300 font-semibold">{noemaConfig.baseApyBps / 100}%</span></div>
                    </div>
                  )}
                </CardContent>
              </Card>

            <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertDescription className="text-blue-200 text-sm">
                  <strong>Note:</strong> NOEMA staking program requires NOEMA token mint and program deployment. Ensure you have NOEMA tokens in your wallet to stake.
                </AlertDescription>
              </Alert>
          </>
        )}
      </div>
    </div>
  );
}

