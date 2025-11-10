import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image, ExternalLink, ArrowRightLeft, Coins } from 'lucide-react';

export default function X404Bridge() {
  const { connected, publicKey } = useWallet();
  const [agentId, setAgentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState('');

  const handleTokenize = async () => {
    if (!connected || !publicKey) return;
    setLoading(true);
    try {
      // X404 tokenization logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      setTxSignature('SimulatedTxSignature123...');
    } catch (error) {
      console.error('Tokenization failed:', error);
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
        <div className="flex items-center gap-2 text-purple-400">
          <Image className="w-5 h-5" />
          <span className="font-semibold">Dynamic NFTs</span>
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
              placeholder="Enter your agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
            />
          </div>

          {!connected ? (
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertDescription className="text-amber-400">
                Connect your wallet to tokenize agents
              </AlertDescription>
            </Alert>
          ) : (
            <Button
              onClick={handleTokenize}
              disabled={!agentId || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? 'Processing...' : 'Mint X404 NFT'}
            </Button>
          )}

          {txSignature && (
            <Alert className="bg-green-500/10 border-green-500/20">
              <AlertDescription className="text-green-400 flex items-center gap-2">
                NFT minted successfully!
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline"
                >
                  View transaction <ExternalLink className="w-3 h-3" />
                </a>
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
