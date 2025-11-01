import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { PROGRAM_CONSTANTS, formatSOL, getScoreChangeRange } from '@/lib/program-constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Shield } from 'lucide-react';
import bs58 from 'bs58';

export default function Validation() {
  const { connected } = useWallet();
  const { client } = useSPL8004();
  const [agentId, setAgentId] = useState('');
  const [taskHash, setTaskHash] = useState('');
  const [approved, setApproved] = useState(true);
  const [evidenceUri, setEvidenceUri] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [computedHexPreview, setComputedHexPreview] = useState<string>("");

  async function sha256Bytes(bytes: Uint8Array): Promise<Uint8Array> {
    const hash = await (globalThis.crypto as Crypto).subtle.digest('SHA-256', bytes as unknown as BufferSource);
    return new Uint8Array(hash);
  }

  async function toTaskHash32(input: string): Promise<Uint8Array> {
    const raw = input.trim();
    // 1) If user provided exact 32-byte hex, use it directly
    const hex = raw.toLowerCase().replace(/^0x/, '');
    if (/^[0-9a-f]{64}$/.test(hex)) {
      const out = new Uint8Array(32);
      for (let i = 0; i < 32; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
      return out;
    }
    // 2) Try base58 (e.g., Solana transaction signature or address)
    try {
      const decoded = bs58.decode(raw);
      // Hash to 32 bytes
      return await sha256Bytes(decoded);
    } catch {
      // 3) Fallback: hash arbitrary string (UTF-8)
      const enc = new TextEncoder().encode(raw);
      return await sha256Bytes(enc);
    }
  }

  const handleSubmit = async () => {
    if (!connected || !client) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!agentId || !taskHash) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (evidenceUri && evidenceUri.length > PROGRAM_CONSTANTS.MAX_EVIDENCE_URI_LEN) {
      toast.error(`Evidence URI must be max ${PROGRAM_CONSTANTS.MAX_EVIDENCE_URI_LEN} characters`);
      return;
    }

    setIsSubmitting(true);
    try {
      toast.info('Submitting validation to Solana...');
      const taskHashBuffer = await toTaskHash32(taskHash);
      const sig = await client.submitValidation(agentId, taskHashBuffer, approved, evidenceUri);
      toast.success(`Validation ${approved ? 'approved' : 'rejected'} for agent "${agentId}". Tx: ${sig.slice(0,8)}...`);
      setAgentId('');
      setTaskHash('');
      setEvidenceUri('');
      setComputedHexPreview('');
    } catch (error: unknown) {
      const message = (error as Error)?.message || 'Failed to submit validation';
      toast.error(message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="p-4 rounded-full bg-gradient-primary inline-block animate-pulse-glow">
            <Shield className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold glow-text">Connect Your Wallet</h1>
          <p className="text-muted-foreground text-lg">
            Please connect your Solana wallet to submit validations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold glow-text mb-2">Submit Validation</h1>
        <p className="text-muted-foreground">
          Validate agent task completion and update reputation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Validation Form</CardTitle>
              <CardDescription>
                Provide details about the agent task validation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agent-id">Agent ID *</Label>
                <Input
                  id="agent-id"
                  placeholder="agent-123"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="bg-input border-border/50"
                />
                <p className="text-xs text-muted-foreground">
                  The unique identifier of the agent being validated
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-hash">Task Hash *</Label>
                <Input
                  id="task-hash"
                  placeholder="0x... (32-byte hex) or base58 (e.g., Solana tx signature)"
                  value={taskHash}
                  onChange={async (e) => {
                    const v = e.target.value;
                    setTaskHash(v);
                    try {
                      const bytes = await toTaskHash32(v);
                      // Show preview as hex for transparency
                      setComputedHexPreview(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
                    } catch {
                      setComputedHexPreview('');
                    }
                  }}
                  className="bg-input border-border/50"
                />
                <p className="text-xs text-muted-foreground">
                  Paste 32-byte hex, base58 signature, or any string — it will be hashed (SHA-256) to 32 bytes.
                </p>
                {computedHexPreview && (
                  <p className="text-[10px] text-muted-foreground font-mono break-all">
                    Computed (hex): {computedHexPreview}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence-uri">Evidence URI</Label>
                <Input
                  id="evidence-uri"
                  placeholder="https://ipfs.io/ipfs/..."
                  value={evidenceUri}
                  onChange={(e) => setEvidenceUri(e.target.value)}
                  maxLength={200}
                  className="bg-input border-border/50"
                />
                <p className="text-xs text-muted-foreground">
                  Optional URI pointing to validation evidence (max 200 chars)
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
                <div className="space-y-1">
                  <Label htmlFor="approved">Validation Result</Label>
                  <p className="text-xs text-muted-foreground">
                    {approved ? 'Task approved - will increase reputation' : 'Task rejected - will decrease reputation'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 ${!approved ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <XCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Reject</span>
                  </div>
                  <Switch
                    id="approved"
                    checked={approved}
                    onCheckedChange={setApproved}
                  />
                  <div className={`flex items-center gap-2 ${approved ? 'text-success' : 'text-muted-foreground'}`}>
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Approve</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !agentId || !taskHash}
                className="w-full bg-gradient-primary hover:shadow-glow"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Validation'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Validation Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-primary">
                  {formatSOL(PROGRAM_CONSTANTS.VALIDATION_FEE)} SOL
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Commission: {PROGRAM_CONSTANTS.DEFAULT_COMMISSION_RATE / 100}% (
                  {formatSOL((PROGRAM_CONSTANTS.VALIDATION_FEE * PROGRAM_CONSTANTS.DEFAULT_COMMISSION_RATE) / 10000)} SOL)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Score Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-success mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  +25 to +100 points based on success rate
                </p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive mb-1">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Rejected</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  -50 to -150 points based on success rate
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
