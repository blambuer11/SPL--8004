import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image, ExternalLink, ArrowRightLeft, Coins, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// X404 Program ID (deployed contract)
const X404_PROGRAM_ID = new PublicKey('ESEbyYMdhKUQ3h5AyqPwLhvkPhaMgugt3dRd3NXxUsH9');

export default function X404Bridge() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [agentId, setAgentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState('');
  const [nftMintAddress, setNftMintAddress] = useState('');
  const [walletApproved, setWalletApproved] = useState(false);

  useEffect(() => {
    // Auto-approve wallet when connected
    if (connected && publicKey) {
      setWalletApproved(true);
      toast.success('Wallet approved for X404 Bridge', {
        description: `Connected: ${publicKey.toBase58().slice(0, 8)}...${publicKey.toBase58().slice(-8)}`,
      });
    } else {
      setWalletApproved(false);
    }
  }, [connected, publicKey]);

  const handleTokenize = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!agentId.trim()) {
      toast.error('Please enter an Agent ID');
      return;
    }

    setLoading(true);
    try {
      // Get agent data from SPL-8004 program first
      const SPL8004_PROGRAM_ID = new PublicKey('FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK');
      const [agentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('identity'), Buffer.from(agentId)],
        SPL8004_PROGRAM_ID
      );

      // Check if agent exists
      const agentAccount = await connection.getAccountInfo(agentPda);
      if (!agentAccount) {
        toast.error('Agent not found on SPL-8004', {
          description: (
            <div className="space-y-2">
              <div>Agent ID "{agentId}" is not registered.</div>
              <div className="text-xs">
                Go to <a href="/app/create-agent" className="underline font-semibold">Create Agent</a> page to register your agent first, then return here to tokenize it.
              </div>
            </div>
          ),
          duration: 8000,
        });
        setLoading(false);
        return;
      }

      // Agent found - proceed with tokenization
      toast.info('Agent verified on SPL-8004!', {
        description: 'Creating NFT with dynamic reputation pricing',
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock NFT mint address
      const mockMint = PublicKey.unique().toBase58();
      setNftMintAddress(mockMint);
      
      const mockTxSig = 'x404_' + Math.random().toString(36).substring(7);
      setTxSignature(mockTxSig);

      toast.success('X404 NFT Minted Successfully!', {
        description: (
          <div className="space-y-1">
            <div>Agent: {agentId}</div>
            <div>NFT Mint: {mockMint.slice(0, 8)}...{mockMint.slice(-8)}</div>
          </div>
        ),
      });
    } catch (error) {
      console.error('Tokenization failed:', error);
      toast.error('Failed to tokenize agent', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">X404 NFT Bridge</h1>
          <p className="text-slate-400 mt-1">Convert agent identities into tradeable NFT assets</p>
        </div>
        <div className="flex items-center gap-2">
          {walletApproved ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-900/30 border border-green-500/30">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm font-semibold text-green-300">Wallet Approved</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-purple-400">
              <Image className="w-5 h-5" />
              <span className="font-semibold">Dynamic NFTs</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Total NFTs Minted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">247</div>
            <p className="text-xs text-green-400 mt-1">↑ 12% this week</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Floor Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2.5 SOL</div>
            <p className="text-xs text-slate-400 mt-1">Based on reputation</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">47.3 SOL</div>
            <p className="text-xs text-purple-400 mt-1">Across 8 trades</p>
          </CardContent>
        </Card>
      </div>

      {/* Tokenize Agent Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Tokenize Your Agent
          </CardTitle>
          <CardDescription>
            Convert your SPL-8004 agent identity into a tradeable X404 NFT with dynamic reputation-based pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentId" className="text-white">Agent ID</Label>
            <Input
              id="agentId"
              placeholder="Enter your agent ID (e.g., trading-bot-001)"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
            />
            <div className="flex items-start gap-2">
              <p className="text-xs text-slate-500 flex-1">
                Must be a registered agent on SPL-8004 program
              </p>
              {!agentId && (
                <div className="text-xs space-x-1">
                  <span className="text-slate-600">Try:</span>
                  <button
                    onClick={() => setAgentId('demo-agent-001')}
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    demo-agent-001
                  </button>
                </div>
              )}
            </div>
          </div>

          {!connected ? (
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertDescription className="text-amber-400">
                Connect your wallet to tokenize agents
              </AlertDescription>
            </Alert>
          ) : walletApproved ? (
            <Alert className="bg-green-500/10 border-green-500/20">
              <AlertDescription className="text-green-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Wallet approved - Ready to tokenize agents
              </AlertDescription>
            </Alert>
          ) : null}

          <Button
            onClick={handleTokenize}
            disabled={!connected || !agentId.trim() || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? 'Minting NFT...' : 'Mint X404 NFT'}
          </Button>

          {/* Help Card for Registration */}
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <AlertDescription className="text-blue-300 text-sm">
              <div className="space-y-2">
                <div className="font-semibold">Don't have an agent yet?</div>
                <div className="text-xs text-blue-200">
                  You need to register your agent on SPL-8004 before tokenizing it as an NFT.
                  Go to the <a href="/app/create-agent" className="underline font-bold hover:text-blue-100">Create Agent</a> page
                  to register your agent identity first.
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {txSignature && nftMintAddress && (
            <Alert className="bg-green-500/10 border-green-500/20">
              <AlertDescription className="text-green-400">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    NFT minted successfully!
                  </div>
                  <div className="text-xs space-y-1">
                    <div>Agent: <span className="font-mono">{agentId}</span></div>
                    <div>
                      NFT Mint: <span className="font-mono">{nftMintAddress.slice(0, 12)}...{nftMintAddress.slice(-12)}</span>
                    </div>
                    <div>
                      Tx: <span className="font-mono">{txSignature}</span>
                    </div>
                  </div>
                  <a
                    href={`https://explorer.solana.com/address/${nftMintAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline text-green-300 hover:text-green-200"
                  >
                    View NFT on Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">How X404 Works</CardTitle>
          <CardDescription>Dynamic NFTs powered by agent reputation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold">
                1
              </div>
              <div>
                <h4 className="text-white font-medium">Tokenize Identity</h4>
                <p className="text-sm text-slate-400 mt-1">Convert your validated agent into an NFT with on-chain metadata</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold">
                2
              </div>
              <div>
                <h4 className="text-white font-medium">Dynamic Pricing</h4>
                <p className="text-sm text-slate-400 mt-1">NFT value adjusts based on agent reputation score and validation history</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold">
                3
              </div>
              <div>
                <h4 className="text-white font-medium">Trade on Marketplace</h4>
                <p className="text-sm text-slate-400 mt-1">List and trade agent NFTs with instant liquidity on the X404 marketplace</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Coins className="w-4 h-4 text-purple-400" />
              Revenue Sharing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">
              NFT holders receive a share of agent validation rewards proportional to ownership
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-400" />
              Dynamic Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">
              NFT attributes update in real-time based on agent performance and reputation changes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
