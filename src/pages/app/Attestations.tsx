import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTAP } from '@/hooks/useTAP';
import type { ToolAttestation } from '@/lib/tap-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ShieldCheck, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

export default function Attestations() {
  const { connected } = useWallet();
  const { client } = useTAP();
  
  const [toolName, setToolName] = useState('');
  const [toolHash, setToolHash] = useState('');
  const [auditUri, setAuditUri] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<ToolAttestation | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleAttestTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !connected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!toolName || !toolHash || !auditUri) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Submitting attestation...', { toolName, toolHash, auditUri });
      const sig = await client.attestTool(toolName, toolHash, auditUri);
      console.log('✅ Success! Signature:', sig);
      
      toast.success('Tool attestation submitted!', {
        description: (
          <a
            href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline flex items-center gap-1"
          >
            View transaction <ExternalLink className="w-3 h-3" />
          </a>
        ),
        duration: 8000,
      });
      setToolName('');
      setToolHash('');
      setAuditUri('');
    } catch (error) {
      console.error('❌ Attestation error:', error);
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if TAP program not deployed
      if (errorMessage.includes('TAP_NOT_DEPLOYED')) {
        toast.warning('TAP Program Not Available', {
          description: 'Tool Attestation Protocol is not deployed on this network. Using demo mode.',
          duration: 8000,
        });
        
        // Simulate success in demo mode
        setTimeout(() => {
          const demoSig = Array.from({ length: 88 }, () => 
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
          ).join('');
          
          toast.success('Demo: Attestation simulated!', {
            description: `Tool "${toolName}" attestation created (demo mode)`,
            duration: 6000,
          });
          
          setToolName('');
          setToolHash('');
          setAuditUri('');
        }, 1500);
      } else if (errorMessage.includes('Insufficient funds')) {
        toast.error('Insufficient Balance', {
          description: 'You need SOL to pay for transaction fees and account initialization.',
          duration: 6000,
        });
      } else if (errorMessage.includes('not initialized') || errorMessage.includes('0x1771')) {
        toast.warning('Account Not Initialized', {
          description: 'TAP issuer account needs to be created. Retrying with registration...',
          duration: 6000,
        });
      } else if (errorMessage.includes('expired')) {
        toast.error('Transaction Expired', {
          description: 'Please try again - the network was too slow.',
          duration: 6000,
        });
      } else {
        toast.error('Failed to submit attestation', {
          description: errorMessage,
          duration: 6000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAttestation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!verifyHash) {
      toast.error('Tool hash is required');
      return;
    }

    setVerifying(true);
    try {
      const result = await client.verifyAttestation(verifyHash);
      setVerifyResult(result);
      if (!result) {
        toast.info('No attestation found for this tool hash');
      } else if (result.revoked) {
        toast.warning('This attestation has been revoked');
      } else {
        toast.success('Attestation verified!');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify attestation');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Tool Attestations (SPL-TAP)</h1>
        <p className="text-slate-400 mt-1">Publish on-chain proof that agents use verified, audited tools</p>
      </div>

      {!connected && (
        <Alert className="bg-amber-500/10 border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-400">
            Connect your wallet to submit or verify attestations
          </AlertDescription>
        </Alert>
      )}

      {/* Attest New Tool */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            Attest a Tool
          </CardTitle>
          <CardDescription>
            Submit an on-chain attestation that your agent uses a verified, audited tool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAttestTool} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="toolName" className="text-white">Tool Name</Label>
              <Input
                id="toolName"
                placeholder="e.g., OpenAI GPT-4 API"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toolHash" className="text-white">Tool Hash (SHA-256)</Label>
              <Input
                id="toolHash"
                placeholder="SHA-256 hash of tool source code or contract"
                value={toolHash}
                onChange={(e) => setToolHash(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">Unique identifier for this tool version</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditUri" className="text-white">Audit Report URI</Label>
              <Input
                id="auditUri"
                placeholder="https://audits.example.com/report.pdf"
                value={auditUri}
                onChange={(e) => setAuditUri(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">Link to public security audit or verification report</p>
            </div>

            <Button
              type="submit"
              disabled={!connected || loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {loading ? 'Submitting...' : 'Submit Attestation'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Verify Tool */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Verify Tool Attestation</CardTitle>
          <CardDescription>
            Check if a tool has been attested and view its verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyAttestation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verifyHash" className="text-white">Tool Hash to Verify</Label>
              <Input
                id="verifyHash"
                placeholder="Enter tool hash"
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
            </div>

            <Button
              type="submit"
              disabled={verifying}
              variant="outline"
              className="w-full"
            >
              {verifying ? 'Verifying...' : 'Verify Attestation'}
            </Button>
          </form>

          {verifyResult && (
            <div className="mt-4 p-4 rounded-lg bg-white/10 border border-white/20">
              <div className="flex items-start gap-3">
                {verifyResult.revoked ? (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-white">{verifyResult.toolName}</h4>
                  <div className="mt-2 space-y-1 text-sm text-slate-300">
                    <p><span className="text-slate-500">Hash:</span> {verifyResult.toolHash}</p>
                    <p><span className="text-slate-500">Attestor:</span> {verifyResult.attestor.toBase58()}</p>
                    <p>
                      <span className="text-slate-500">Audit Report:</span>{' '}
                      <a
                        href={verifyResult.auditUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                    <p><span className="text-slate-500">Created:</span> {new Date(verifyResult.createdAt * 1000).toLocaleString()}</p>
                    <p>
                      <span className="text-slate-500">Status:</span>{' '}
                      <span className={verifyResult.revoked ? 'text-red-400' : 'text-green-400'}>
                        {verifyResult.revoked ? 'Revoked' : 'Active'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">How Tool Attestations Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-400">
          <div className="flex gap-3">
            <span className="text-purple-400 font-semibold">1.</span>
            <p>Generate SHA-256 hash of your tool's source code, API contract, or official release</p>
          </div>
          <div className="flex gap-3">
            <span className="text-purple-400 font-semibold">2.</span>
            <p>Obtain security audit report and host it publicly (GitHub, IPFS, or dedicated audit site)</p>
          </div>
          <div className="flex gap-3">
            <span className="text-purple-400 font-semibold">3.</span>
            <p>Submit attestation on-chain linking tool hash → audit report → your identity</p>
          </div>
          <div className="flex gap-3">
            <span className="text-purple-400 font-semibold">4.</span>
            <p>Other agents can verify your tool is audited before trusting integration</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
