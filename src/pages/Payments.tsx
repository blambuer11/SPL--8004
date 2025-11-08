import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useX402 } from '@/hooks/useX402';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function Payments() {
  const { connected } = useWallet();
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
    <DashboardLayout>
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-foreground">
          💳 Noema Pay™ 
          <span className="ml-3 text-sm font-normal px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
            🚧 Beta - Coming Soon
          </span>
        </h1>
        <p className="text-muted-foreground">Micropayment & Gasless Protocol — Send & receive USDC instantly via X402</p>
      </div>

      <Card className="border-border/50 bg-blue-50">
        <CardContent className="py-4 text-sm text-blue-900">
          <strong>ℹ️ Note:</strong> X402 payment infrastructure is currently in beta testing. The core Noema Protocol (SPL-8004, SPL-ACP, SPL-TAP, SPL-FCP) is fully functional and deployed on Solana Devnet. Payment features will be available soon with Kora RPC integration.
        </CardContent>
      </Card>

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
              
              {health === 'down' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900">
                  ⚠️ Facilitator service is offline. Payment functionality requires a running facilitator at <code className="bg-yellow-100 px-1 py-0.5 rounded">{import.meta.env.VITE_X402_FACILITATOR_URL || 'http://localhost:3000'}</code>
                </div>
              )}

              <Button
                disabled={!recipient || Number(amount) <= 0 || health === 'down'}
                onClick={async () => {
                  try {
                    toast.info('Initiating Noema Pay™ (X402) payment…');
                    
                    // Direct call to facilitator /payment endpoint
                    const facilitatorUrl = import.meta.env.VITE_X402_FACILITATOR_URL || 'http://localhost:3001';
                    const res = await fetch(`${facilitatorUrl}/payment`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        recipient, 
                        amount: Number(amount), 
                        memo: memo || 'Noema Pay payment'
                      }),
                    });
                    
                    if (!res.ok) {
                      throw new Error(`Payment failed: ${res.statusText}`);
                    }
                    
                    const data = await res.json();
                    
                    if (data.success) {
                      toast.success('Payment completed successfully!', { 
                        description: (
                          <div className="space-y-1">
                            <div>Sent {amount} USDC to {recipient.slice(0, 12)}...</div>
                            <a href={data.explorerUrl} target="_blank" rel="noreferrer" className="text-xs underline">
                              View on Explorer
                            </a>
                          </div>
                        )
                      });
                    } else {
                      throw new Error(data.error || 'Payment failed');
                    }
                  } catch (e) {
                    const errorMsg = (e as Error).message || 'Payment failed';
                    if (errorMsg.includes('Not Found') || errorMsg.includes('404')) {
                      toast.error('Facilitator endpoint not found', {
                        description: 'Please ensure the X402 facilitator service is running or update the protected URL below.'
                      });
                    } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
                      toast.error('Cannot connect to facilitator', {
                        description: 'Check if the facilitator service is running at the configured URL.'
                      });
                    } else {
                      toast.error(errorMsg);
                    }
                  }
                }}
                className="w-full bg-gradient-primary hover:shadow-glow"
              >
                {health === 'down' ? 'Facilitator Offline' : 'Send Payment (Mock)'}
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Server-side (No Wallet)</CardTitle>
              <CardDescription>Use Facilitator from your server without Phantom</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Send requests to a 402-protected endpoint; on 402, call Facilitator /verify and /settle, then retry with payment proof.</p>
              <pre className="text-xs bg-muted/40 p-3 rounded border border-border/50 overflow-auto">
{`# 1) Request data (gets 402)
curl -i ${probeUrl}

# 2) Verify and settle via Facilitator (server-side)
curl -X POST $FACILITATOR/verify -d '{"transaction":"..."}'
curl -X POST $FACILITATOR/settle -d '{"transaction":"..."}'

# 3) Retry with payment headers
curl -H 'x-payment-response: {...}' -H 'x-payment-signature: <sig>' ${probeUrl}`}
              </pre>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Facilitator Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${health === 'up' ? 'bg-green-500' : health === 'down' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                <div className={`text-sm font-medium ${health === 'up' ? 'text-green-600' : health === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {health === 'up' ? '✓ Online' : health === 'down' ? '✗ Offline' : 'Unknown'}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Facilitator URL</Label>
                <div className="text-xs bg-muted/40 p-2 rounded border border-border/50 font-mono">
                  {import.meta.env.VITE_X402_FACILITATOR_URL || 'http://localhost:3000'}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Protected Endpoint (402)</Label>
                <Input value={probeUrl} onChange={(e) => setProbeUrl(e.target.value)} className="font-mono text-xs" />
                <p className="text-xs text-muted-foreground">Test endpoint that requires payment</p>
              </div>

              {health === 'down' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                  <strong>To start the facilitator:</strong>
                  <pre className="mt-2 bg-blue-100 p-2 rounded overflow-x-auto">cd x402-facilitator && npm run dev</pre>
                </div>
              )}

              {info && (
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">Supported Payment Methods</summary>
                  <pre className="mt-2 bg-muted/40 p-2 rounded border border-border/50 overflow-auto max-h-48">{JSON.stringify(info, null, 2)}</pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
