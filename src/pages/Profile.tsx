import { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Profile() {
  const { connected, publicKey } = useWallet();
  const { client } = useSPL8004();
  const [agents, setAgents] = useState<{ agentId: string; reputation: { score: number } }[]>([]);
  const totalScore = useMemo(() => agents.reduce((s, a) => s + a.reputation.score, 0), [agents]);
  const progress = Math.min(100, Math.round((totalScore % 10000) / 100));

  useEffect(() => {
    (async () => {
      if (!client || !connected) return;
      try {
        const list = await client.getAllUserAgents();
        setAgents(list);
      } catch {
        setAgents([]);
      }
    })();
  }, [client, connected]);

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Connect your wallet</h1>
        <p className="text-muted-foreground">Profile and rewards require a connected wallet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-foreground">Rewards & Profile</h1>
        <p className="text-muted-foreground">Track reputation and claim rewards</p>
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
          <CardTitle>Claim Rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {agents.length === 0 ? (
            <div className="text-sm text-muted-foreground">No agents registered yet.</div>
          ) : (
            agents.map((a) => (
              <div key={a.agentId} className="flex items-center justify-between border border-border/50 rounded-lg px-4 py-3">
                <div>
                  <div className="font-medium">{a.agentId}</div>
                  <div className="text-xs text-muted-foreground">Score: {a.reputation.score}</div>
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
                      toast.error((e as Error).message || 'Claim failed');
                    }
                  }}
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
  );
}
