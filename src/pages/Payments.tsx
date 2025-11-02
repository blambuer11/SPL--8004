import { useEffect, useState } from 'react';
import { useX402 } from '@/hooks/useX402';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Payments() {
  const { checkFacilitator, getFacilitatorInfo, fetchWithPayment, isPaymentProcessing } = useX402();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.1');
  const [memo, setMemo] = useState('');
  const [health, setHealth] = useState<'unknown'|'up'|'down'>('unknown');
  const [probeUrl, setProbeUrl] = useState<string>(import.meta.env.VITE_X402_PROTECTED_URL || 'http://localhost:4021/protected');
  const [info, setInfo] = useState<unknown>(null);

  useEffect(() => {
    (async () => {
      const ok = await checkFacilitator();
      setHealth(ok ? 'up' : 'down');
      try {
        const supported = await getFacilitatorInfo();
        setInfo(supported);
      } catch {
        setInfo(null);
      }
    })();
  }, [checkFacilitator, getFacilitatorInfo]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-foreground">X402 Micropayments</h1>
        <p className="text-muted-foreground">Send & receive USDC instantly — gasless via Kora</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Send Payment</CardTitle>
              <CardDescription>USDC transfer settled by facilitator</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Agent/Wallet</Label>
                <Input placeholder="Agent ID or wallet address" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (USDC)</Label>
                  <Input type="number" step="0.0001" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Memo (optional)</Label>
                  <Input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="e.g., payment for validation" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">0.1% platform fee • ~400ms settlement</p>
              <Button
                disabled={isPaymentProcessing || !recipient || Number(amount) <= 0}
                onClick={async () => {
                  // Demo flow: call a protected endpoint to trigger 402 payment flow if configured
                  try {
                    toast.info('Initiating X402 flow…');
                    const res = await fetchWithPayment<unknown>(probeUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ recipient, amount: Number(amount), memo }),
                    });
                    toast.success('Payment completed', { description: JSON.stringify(res) });
                  } catch (e) {
                    toast.error((e as Error).message || 'Payment failed');
                  }
                }}
                className="w-full bg-gradient-primary hover:shadow-glow"
              >
                {isPaymentProcessing ? 'Processing…' : 'Send Payment'}
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Facilitator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`text-sm ${health === 'up' ? 'text-green-600' : health === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                Status: {health === 'up' ? 'Online' : health === 'down' ? 'Offline' : 'Unknown'}
              </div>
              <div className="space-y-2">
                <Label>Protected URL (402)</Label>
                <Input value={probeUrl} onChange={(e) => setProbeUrl(e.target.value)} />
                <p className="text-xs text-muted-foreground">Used for the demo flow above</p>
              </div>
              {info && (
                <pre className="text-xs bg-muted/40 p-2 rounded border border-border/50 overflow-auto max-h-48">{JSON.stringify(info, null, 2)}</pre>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
