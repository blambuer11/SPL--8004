import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useX402 } from '@/hooks/useX402';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function X402Test() {
  const wallet = useWallet();
  const { instantPayment, instantPaymentLoading, checkFacilitator, getFacilitatorInfo } = useX402();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [facilitatorStatus, setFacilitatorStatus] = useState<{ healthy: boolean; message?: string } | null>(null);

  const handleTest = async () => {
    if (!recipient || !amount) {
      toast.error('Please enter recipient and amount');
      return;
    }

    try {
      const recipientPubkey = new PublicKey(recipient);
      const amountNum = parseFloat(amount);

      console.log('🚀 Testing X402 instant payment...');
      console.log('Recipient:', recipient);
      console.log('Amount:', amountNum);
      
      const result = await instantPayment(recipientPubkey, amountNum, 'Test payment');
      
      console.log('✅ Payment successful:', result);
      toast.success(`Payment sent! ${result.signature.substring(0, 8)}...`, {
        description: `Net: ${(result.netAmount / 1e6).toFixed(3)} USDC • Fee: ${(result.fee / 1e6).toFixed(3)} USDC`
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('❌ Payment failed:', err);
      toast.error('Payment failed', {
        description: err.message || 'Unknown error'
      });
    }
  };

  const handleCheckFacilitator = async () => {
    try {
      const status = await checkFacilitator();
      setFacilitatorStatus({ healthy: status, message: status ? 'Healthy' : 'Offline' });
      toast.success('Facilitator checked');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error('Facilitator check failed', {
        description: err.message
      });
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      <h1 className="text-3xl font-bold text-white">X402 Payment Test</h1>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Wallet Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>Connected: {wallet.connected ? '✅' : '❌'}</div>
          <div>Public Key: {wallet.publicKey?.toBase58() || 'Not connected'}</div>
          <div>useX402 Ready: {instantPayment ? '✅' : '❌'}</div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Test Instant Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Recipient Address</label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter Solana address"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">Amount (USDC)</label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <Button 
            onClick={handleTest}
            disabled={!wallet.connected || instantPaymentLoading || !instantPayment}
            className="w-full"
          >
            {instantPaymentLoading ? 'Processing...' : 'Send Test Payment'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Facilitator Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCheckFacilitator} disabled={instantPaymentLoading}>
            Check Facilitator
          </Button>
          {facilitatorStatus && (
            <pre className="p-4 bg-black/30 rounded text-xs overflow-auto">
              {JSON.stringify(facilitatorStatus, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
