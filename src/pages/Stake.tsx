import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Zap, CheckCircle2, AlertTriangle, ExternalLink, Info } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';
import { TREASURY_WALLET, FEES, logRevenue } from '@/lib/treasury';

// Program IDs
const SPL_TAP_PROGRAM_ID = new PublicKey('DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4');
const SPL_FCP_PROGRAM_ID = new PublicKey('A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR');

// Stake configurations
const stakeConfigs = [
  {
    id: 'spl-tap',
    name: 'SPL-TAP',
    fullName: 'Tool Attestation Protocol',
    description: 'Become a trusted tool issuer. Attest to the authenticity and reliability of AI agent tools.',
    stakeAmount: 1,
    programId: SPL_TAP_PROGRAM_ID,
    benefits: [
      'Issue tool attestations',
      'Verify tool authenticity',
      'Earn attestation fees',
      'Slash malicious actors',
      'Build trust reputation'
    ],
    requirements: [
      'Maintain 1 SOL stake',
      'Respond to disputes within 48h',
      'Keep attestations up-to-date',
      'Follow protocol guidelines'
    ],
    icon: Shield,
    color: 'blue'
  },
  {
    id: 'spl-fcp',
    name: 'SPL-FCP',
    fullName: 'Function Call Protocol',
    description: 'Become a validator in the multi-validator consensus network for critical agent operations.',
    stakeAmount: 2,
    programId: SPL_FCP_PROGRAM_ID,
    benefits: [
      'Participate in consensus voting',
      'Validate function executions',
      'Earn consensus rewards',
      'Secure the network',
      'Governance rights'
    ],
    requirements: [
      'Maintain 2 SOL stake',
      'Run validator node 24/7',
      'Vote on proposals',
      'Meet uptime requirements (99%+)'
    ],
    icon: Zap,
    color: 'purple'
  }
];

export default function Stake() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState<string | null>(null);
  const [stakes, setStakes] = useState<{ [key: string]: boolean }>({});

  // Check if user has already staked
  const checkStakeStatus = async (protocol: string) => {
    if (!publicKey) return false;

    try {
      // TODO: Query on-chain stake account
      // For now, return mock data
      return false;
    } catch (error) {
      console.error('Error checking stake:', error);
      return false;
    }
  };

  // Handle staking
  const handleStake = async (config: typeof stakeConfigs[0]) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(config.id);
    try {
      // Derive stake PDA (contract'ta locked tutulacak)
      const [stakePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('stake'),
          publicKey.toBuffer()
        ],
        config.programId
      );

      // Create stake transaction - SOL contract PDA'ya gider (locked)
      // Slashing durumunda buradan treasury'ye transfer edilir
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: stakePda,
          lamports: config.stakeAmount * LAMPORTS_PER_SOL
        })
      );

      // Log revenue tracking (stake contract'ta ama treasury için log)
      logRevenue({
        type: 'stake',
        amount: config.stakeAmount,
        from: publicKey,
        timestamp: Date.now(),
        description: `${config.name} stake deposit (locked in contract PDA)`
      });

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      toast.info('Confirming stake transaction...');
      await connection.confirmTransaction(signature, 'confirmed');

      // Update stake status
      setStakes(prev => ({ ...prev, [config.id]: true }));

      toast.success(`Successfully staked ${config.stakeAmount} SOL to ${config.name}!`);
      toast.success('You are now a validator/issuer!');

      console.log('Stake TX:', signature);
      console.log('Stake PDA:', stakePda.toString());

    } catch (error: any) {
      console.error('Stake error:', error);
      toast.error(error.message || 'Staking failed');
    } finally {
      setLoading(null);
    }
  };

  // Handle unstaking
  const handleUnstake = async (config: typeof stakeConfigs[0]) => {
    if (!publicKey) return;

    setLoading(config.id);
    try {
      const [stakePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('stake'), publicKey.toBuffer()],
        config.programId
      );

      // TODO: Call unstake instruction on program
      toast.info('Unstaking requires 7-day unbonding period');
      
      // Mock unstake
      setTimeout(() => {
        setStakes(prev => ({ ...prev, [config.id]: false }));
        toast.success(`Unstake initiated. Funds available in 7 days.`);
        setLoading(null);
      }, 2000);

    } catch (error: any) {
      console.error('Unstake error:', error);
      toast.error(error.message || 'Unstaking failed');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Shield className="w-4 h-4 mr-2" />
            Protocol Staking
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Become a Validator or Issuer
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Stake SOL to participate in protocol governance and earn rewards.
          </p>
        </div>

        {/* Alert for wallet connection */}
        {!publicKey && (
          <Alert className="mb-8 max-w-3xl mx-auto border-blue-200 bg-blue-50">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              Connect your wallet to view staking options and manage your stakes.
            </AlertDescription>
          </Alert>
        )}

        {/* Stake Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {stakeConfigs.map((config) => {
            const Icon = config.icon;
            const isStaked = stakes[config.id];

            return (
              <Card
                key={config.id}
                className={`border-2 ${
                  isStaked 
                    ? 'border-green-200 bg-gradient-to-br from-green-50 to-white' 
                    : `border-${config.color}-200`
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-lg bg-gradient-to-br from-${config.color}-600 to-${config.color}-800 flex items-center justify-center`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{config.name}</CardTitle>
                        <CardDescription className="text-sm font-medium">
                          {config.fullName}
                        </CardDescription>
                      </div>
                    </div>
                    {isStaked && (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>

                  <p className="text-slate-700 text-sm leading-relaxed">
                    {config.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Stake Amount */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Required Stake</span>
                      <span className="text-2xl font-bold text-slate-900">
                        {config.stakeAmount} SOL
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      ≈ ${(config.stakeAmount * 50).toFixed(2)} USD (approx)
                    </div>
                  </div>

                  <Separator />

                  {/* Benefits */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-slate-900">Benefits</h4>
                    <div className="space-y-2">
                      {config.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className={`w-4 h-4 text-${config.color}-600 mt-0.5 flex-shrink-0`} />
                          <span className="text-sm text-slate-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Requirements */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-slate-900">Requirements</h4>
                    <div className="space-y-2">
                      {config.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <AlertTriangle className={`w-4 h-4 text-${config.color}-600 mt-0.5 flex-shrink-0`} />
                          <span className="text-sm text-slate-700">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Action Button */}
                  <div className="space-y-3">
                    {!isStaked ? (
                      <Button
                        onClick={() => handleStake(config)}
                        disabled={loading === config.id || !publicKey}
                        className="w-full"
                        size="lg"
                      >
                        {loading === config.id 
                          ? 'Processing...' 
                          : `Stake ${config.stakeAmount} SOL`
                        }
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <p className="text-sm font-semibold text-green-900">
                            ✅ You are staking {config.stakeAmount} SOL
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            Earning rewards and participating in {config.name}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleUnstake(config)}
                          disabled={loading === config.id}
                          variant="outline"
                          className="w-full"
                        >
                          {loading === config.id ? 'Processing...' : 'Unstake (7 day unbonding)'}
                        </Button>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      className="w-full"
                      asChild
                    >
                      <a 
                        href={`https://explorer.solana.com/address/${config.programId.toString()}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Program on Explorer
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle>How Staking Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    1
                  </div>
                  <h4 className="font-semibold">Stake SOL</h4>
                  <p className="text-sm text-slate-600">
                    Lock your SOL in the protocol stake PDA. This demonstrates commitment and enables slashing for bad behavior.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    2
                  </div>
                  <h4 className="font-semibold">Participate</h4>
                  <p className="text-sm text-slate-600">
                    Issue attestations (TAP) or vote on consensus (FCP). Your stake weight determines your influence.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                    3
                  </div>
                  <h4 className="font-semibold">Earn Rewards</h4>
                  <p className="text-sm text-slate-600">
                    Receive protocol fees and reputation bonuses. Malicious behavior results in slashing.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Important Notes</h4>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-900">Slashing Risk</p>
                      <p className="text-yellow-800 mt-1">
                        Malicious behavior, downtime, or false attestations can result in partial or full stake slashing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-900">Unbonding Period</p>
                      <p className="text-blue-800 mt-1">
                        When unstaking, there is a 7-day unbonding period before you can withdraw your SOL.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 p-3 rounded">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900">Devnet Testing</p>
                      <p className="text-green-800 mt-1">
                        All stakes are currently on Solana Devnet. Use devnet SOL (free from faucet) for testing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Need Help?</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700">
                    📧 Email: <a href="mailto:info@noemaprotocol.xyz" className="text-blue-600 hover:underline">info@noemaprotocol.xyz</a>
                  </p>
                  <p className="text-slate-700">
                    🐦 Twitter: <a href="https://twitter.com/NoemaProtocol" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@NoemaProtocol</a>
                  </p>
                  <p className="text-slate-700">
                    📚 Docs: <a href="/docs" className="text-blue-600 hover:underline">Protocol Documentation</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
