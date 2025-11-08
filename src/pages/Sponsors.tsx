import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TREASURY_WALLET, FEES, logRevenue } from '@/lib/treasury';
import { Heart, CheckCircle2, Coins, Bot, Sparkles, TrendingUp } from 'lucide-react';

interface Agent {
  pubkey: string;
  name: string;
  description: string;
  reputationScore: number;
  owner: string;
}

export default function Sponsors() {
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState<string>('0.5');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Mock agents - gerçek uygulamada blockchain'den çekilecek
  useEffect(() => {
    const mockAgents: Agent[] = [
      {
        pubkey: 'Agent1PubKey...',
        name: 'GPT Trading Bot',
        description: 'Autonomous trading agent using GPT-4 for market analysis',
        reputationScore: 850,
        owner: 'trader1.sol'
      },
      {
        pubkey: 'Agent2PubKey...',
        name: 'Data Validator',
        description: 'Validates and attests data accuracy for DeFi protocols',
        reputationScore: 920,
        owner: 'validator.sol'
      },
      {
        pubkey: 'Agent3PubKey...',
        name: 'Content Curator',
        description: 'AI agent for content moderation and curation',
        reputationScore: 780,
        owner: 'curator.sol'
      },
    ];
    setAgents(mockAgents);
  }, []);

  const handleSponsorAgent = async () => {
    if (!publicKey) {
      toast.error('Lütfen cüzdanınızı bağlayın');
      return;
    }

    if (!selectedAgent) {
      toast.error('Lütfen sponsor olmak istediğiniz ajanı seçin');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < FEES.SPONSOR_CONTRIBUTION.MINIMUM) {
      toast.error(`Minimum ${FEES.SPONSOR_CONTRIBUTION.MINIMUM} SOL gerekli`);
      return;
    }

    setLoading(true);
    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

      // Transfer to agent owner (gerçek uygulamada agent PDA'sına gidebilir)
      const agentOwnerPubkey = new PublicKey(selectedAgent.owner);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: agentOwnerPubkey,
          lamports: numAmount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Log revenue
      logRevenue({
        type: 'sponsor',
        amount: numAmount,
        from: publicKey,
        timestamp: Date.now(),
        description: `Sponsored agent: ${selectedAgent.name}`,
      });

      toast.success(`🎉 Sponsorluk Başarılı!`, {
        description: `${selectedAgent.name} ajanına ${numAmount} SOL sponsor oldunuz! Tx: ${signature.slice(0, 8)}...`,
        duration: 5000,
      });

      setAmount(FEES.SPONSOR_CONTRIBUTION.SUGGESTED.toString());
      setSelectedAgent(null);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      console.error('Sponsor failed:', error);
      toast.error('Sponsorluk başarısız oldu', {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <Heart className="w-4 h-4 mr-2" />
            Ajan Sponsorluğu
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
            AI Ajanlarını Destekle
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Beğendiğiniz AI ajanlarına SOL göndererek onları destekleyin. Sponsorluğunuz, 
            ajanların geliştirilmesine ve ekosistem içindeki reputasyonlarına katkıda bulunur.
          </p>
        </div>

        {/* Available Agents */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Sponsora Açık Ajanlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card 
                key={agent.pubkey}
                className={`hover:shadow-xl transition-all cursor-pointer ${
                  selectedAgent?.pubkey === agent.pubkey ? 'border-2 border-purple-500 shadow-lg' : ''
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {agent.reputationScore}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{agent.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Owner: {agent.owner}</span>
                    {selectedAgent?.pubkey === agent.pubkey && (
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sponsorship Form */}
        {selectedAgent && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-purple-200 bg-white shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl text-purple-900 flex items-center justify-center gap-2">
                  <Coins className="w-8 h-8" />
                  Sponsor Ol: {selectedAgent.name}
                </CardTitle>
                <CardDescription className="text-base">
                  Bu ajana SOL göndererek destek olun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-base font-semibold text-gray-800">
                    Sponsorluk Miktarı (SOL)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="amount"
                      type="number"
                      step="0.1"
                      min={FEES.SPONSOR_CONTRIBUTION.MINIMUM}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.5"
                      className="text-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setAmount(FEES.SPONSOR_CONTRIBUTION.SUGGESTED.toString())}
                      className="shrink-0"
                    >
                      Önerilen
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Minimum: {FEES.SPONSOR_CONTRIBUTION.MINIMUM} SOL | Önerilen: {FEES.SPONSOR_CONTRIBUTION.SUGGESTED} SOL
                  </p>
                </div>

                {/* Benefits */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Sponsorluk Faydaları
                  </h4>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>✅ Ajanın gelişimine doğrudan katkı</li>
                    <li>✅ Ekosistem içinde sponsor görünürlüğü</li>
                    <li>✅ Ajan performansından kar payı (gelecek özellik)</li>
                    <li>✅ Reputasyon puanı artışına destek</li>
                    <li>✅ On-chain kayıtlı şeffaf sponsorluk</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSponsorAgent}
                  disabled={!publicKey || loading}
                  className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? (
                    'İşleniyor...'
                  ) : !publicKey ? (
                    'Cüzdan Bağlayın'
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      {amount} SOL Sponsor Ol
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setSelectedAgent(null)}
                  className="w-full"
                >
                  Farklı Ajan Seç
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            Tüm sponsorluk ödemeleri on-chain olarak kaydedilir ve doğrulanabilir.
            <br />
            Sponsorluk sistemi şeffaf ve merkeziyetsizdir.
          </p>
        </div>
      </div>
    </div>
  );
}
