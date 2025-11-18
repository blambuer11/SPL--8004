import { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNOEMA8004 } from '@/hooks/useNOEMA8004';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/DashboardLayout';
import { HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Profile() {
  const { connected, publicKey } = useWallet();
  const { client } = useNOEMA8004();
  const [agents, setAgents] = useState<{ agentId: string; reputation: { score: number } }[]>([]);
  const [claimable, setClaimable] = useState<Record<string, number>>({});
  const totalScore = useMemo(() => agents.reduce((s, a) => s + a.reputation.score, 0), [agents]);
  const progress = Math.min(100, Math.round((totalScore % 10000) / 100));

  useEffect(() => {
    (async () => {
      if (!client || !connected) return;
      try {
        const list = await client.getAllUserAgents();
        setAgents(list);
        const map: Record<string, number> = {};
        for (const a of list) {
          try { map[a.agentId] = await client.getRewardPoolLamports(a.agentId); } catch { map[a.agentId] = 0; }
        }
        setClaimable(map);
      } catch {
        setAgents([]);
        setClaimable({});
      }
    })();
  }, [client, connected]);

  return (
    <DashboardLayout>
    <div className="container mx-auto px-4 py-8 space-y-8">
      {!connected && (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="py-8 text-center">
            <h1 className="text-3xl font-bold">Connect your wallet</h1>
            <p className="text-muted-foreground">Profile and rewards require a connected wallet.</p>
          </CardContent>
        </Card>
      )}

      <div>
        <h1 className="text-4xl font-bold mb-2 text-foreground">🆔 Rewards & Profile</h1>
        <p className="text-muted-foreground">Track your Noema ID™ reputation and claim rewards</p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Reputation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div className="h-4 bg-gradient-to-r from-purple-600 to-blue-600" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">{totalScore} / 10000</div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Claim Rewards
            <Dialog>
              <DialogTrigger asChild>
                <button className="ml-1 text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Claim Rewards Requirements</DialogTitle>
                  <DialogDescription className="space-y-3 text-sm text-left pt-2">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">How to earn rewards:</h4>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>Register an agent on SPL-8004</li>
                        <li>Complete successful validations via <code className="bg-muted px-1 py-0.5 rounded">submit_validation</code></li>
                        <li>Validators call <code className="bg-muted px-1 py-0.5 rounded">update_reputation</code> to deposit rewards into your pool</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Claim conditions:</h4>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>Reward pool balance must be &gt; 0 SOL</li>
                        <li>24-hour cooldown between claims</li>
                        <li>Agent must be active (not deactivated)</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                      <p className="text-blue-900 text-xs">
                        💡 <strong>Tip:</strong> Ask other users to validate your agent's work, or use the Validation page to submit validations and earn reputation.
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {agents.length === 0 ? (
            <div className="text-sm text-muted-foreground">No agents registered yet.</div>
          ) : (
            agents.map((a) => (
              <div key={a.agentId} className="flex items-center justify-between border border-border/50 rounded-lg px-4 py-3">
                <div>
                  <div className="font-medium">{a.agentId}</div>
                  <div className="text-xs text-muted-foreground">Score: {a.reputation.score} • Pool: {(claimable[a.agentId]||0)/1_000_000_000} SOL</div>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!client) return;
                    try {
                      toast.info('Claiming…');
                      const sig = await client.claimRewards(a.agentId);
                      toast.success('Rewards claimed', { description: sig });
                    } catch (e) {
                      const m = (e as Error).message || 'Claim failed';
                      if (m.includes('No rewards available') || m.includes('0x177a') || m.includes('6010')) {
                        toast.info('No rewards available to claim yet.');
                      } else {
                        toast.error(m);
                      }
                    }
                  }}
                  disabled={(claimable[a.agentId] || 0) <= 0}
                >
                  Claim
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Profile Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Update Metadata (URI)</Label>
            <div className="flex gap-2">
              <Input placeholder="https://arweave.net/..." />
              <Button variant="secondary">Update</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Deactivate Agent</Label>
            <div className="flex gap-2">
              <Input placeholder="agent-id" />
              <Button variant="destructive">Deactivate</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
