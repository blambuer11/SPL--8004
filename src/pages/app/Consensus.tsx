import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useFCP } from '@/hooks/useFCP';
import type { ConsensusRequest } from '@/lib/fcp-client';
import { getExplorerTxUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Vote, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

export default function Consensus() {
  const { connected, publicKey } = useWallet();
  const { client } = useFCP();
  
  const [consensusId, setConsensusId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [action, setAction] = useState('');
  const [requiredApprovals, setRequiredApprovals] = useState('3');
  const [validatorsInput, setValidatorsInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [pendingRequests, setPendingRequests] = useState<ConsensusRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const refreshPendingRequests = useCallback(async () => {
    if (!client || !publicKey) {
      setPendingRequests([]);
      return;
    }
    setLoadingRequests(true);
    try {
      const list = await client.listConsensusRequests({ status: 'pending', wallet: publicKey });
      setPendingRequests(list);
    } catch (error) {
      console.error('Failed to load consensus requests:', error);
      toast.error('Consensus list unavailable', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoadingRequests(false);
    }
  }, [client, publicKey]);

  useEffect(() => {
    if (client && connected && publicKey) {
      void refreshPendingRequests();
    } else {
      setPendingRequests([]);
    }
  }, [client, connected, publicKey, refreshPendingRequests]);

  const handleSubmitConsensus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !connected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!consensusId || !agentId || !action || !requiredApprovals || !validatorsInput) {
      toast.error('All fields are required');
      return;
    }

    try {
      // Parse validator addresses
      const validatorAddresses = validatorsInput.split(',').map(addr => new PublicKey(addr.trim()));
      const required = parseInt(requiredApprovals);

      if (required > validatorAddresses.length) {
        toast.error('Required approvals cannot exceed number of validators');
        return;
      }

      setLoading(true);
      const sig = await client.createConsensusRequest(
        consensusId,
        agentId,
        action,
        required,
        validatorAddresses
      );

      toast.success('Consensus request created!', {
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
      });

      setConsensusId('');
      setAgentId('');
      setAction('');
      setValidatorsInput('');
      await refreshPendingRequests();
    } catch (error) {
      console.error('Consensus error:', error);
      toast.error('Failed to create consensus request', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 9000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: ConsensusRequest) => {
    if (!client) return;
    try {
      const sig = await client.approveConsensusWithDetails(
        request.agentId,
        request.action,
        request.address.toBase58(),
        request.address
      );
      toast.success('Approval submitted!', {
        description: (
          <a
            href={getExplorerTxUrl(sig)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction
          </a>
        ),
      });
      await refreshPendingRequests();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (request: ConsensusRequest) => {
    if (!client) return;
    try {
      const sig = await client.rejectConsensusWithDetails(
        request.agentId,
        request.action,
        request.address.toBase58(),
        request.address
      );
      toast.warning('Rejection submitted', {
        description: (
          <a
            href={getExplorerTxUrl(sig)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction
          </a>
        ),
      });
      await refreshPendingRequests();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Multi-Validator Consensus (SPL-FCP)</h1>
        <p className="text-slate-400 mt-1">Require multiple validators to approve critical agent actions</p>
      </div>

      {!connected && (
        <Alert className="bg-amber-500/10 border-amber-500/20">
          <Clock className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-400">
            Connect your wallet to submit or vote on consensus requests
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingRequests.length}</div>
            <p className="text-xs text-slate-400 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Your Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-slate-400 mt-1">Actions needing your approval</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Approved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-green-400 mt-1">Consensus reached</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Consensus Requests */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Pending Validations</CardTitle>
          <CardDescription>
            Agent actions awaiting multi-validator approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRequests ? (
            <div className="text-center py-8 text-slate-400">Loading pending requests…</div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Vote className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending consensus requests</p>
              <p className="text-sm mt-1">Create a new request below to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(request => {
                const isValidator = publicKey ? request.validators.some(v => v.equals(publicKey)) : false;
                const approvalPercent = request.requiredApprovals === 0
                  ? 0
                  : Math.min(1, request.approvals / request.requiredApprovals) * 100;
                return (
                  <div key={request.id} className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-white">{request.agentId}</p>
                        <p className="text-sm text-slate-400">{request.action}</p>
                        <p className="text-xs text-slate-500 mt-1">Requester: {request.requester.toBase58()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Approvals {request.approvals}/{request.requiredApprovals}</p>
                        <p className="text-xs text-slate-500">Validators {request.validators.length}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Created {new Date(request.createdAt * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${approvalPercent}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                      {request.validators.map((validatorKey) => {
                        const base58 = validatorKey.toBase58();
                        const highlight = publicKey && validatorKey.equals(publicKey);
                        return (
                          <span
                            key={base58}
                            className={`px-2 py-1 rounded-full border ${highlight ? 'border-emerald-400/60 text-emerald-300 bg-emerald-500/10' : 'border-white/10 text-slate-400 bg-white/5'}`}
                          >
                            {base58.slice(0, 4)}…{base58.slice(-4)}
                          </span>
                        );
                      })}
                    </div>

                    {isValidator && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request)}
                          className="border-red-500/50 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit New Consensus Request */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Request Consensus</CardTitle>
          <CardDescription>
            Create a new multi-validator approval request for critical actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitConsensus} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consensusId" className="text-white">Consensus ID</Label>
              <Input
                id="consensusId"
                placeholder="Unique identifier (e.g., cs_001)"
                value={consensusId}
                onChange={(e) => setConsensusId(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agentId" className="text-white">Agent ID</Label>
              <Input
                id="agentId"
                placeholder="Agent requiring validation"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action" className="text-white">Action to Validate</Label>
              <Input
                id="action"
                placeholder="e.g., Deploy smart contract, Transfer large funds"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredApprovals" className="text-white">Required Approvals</Label>
              <Input
                id="requiredApprovals"
                type="number"
                min="1"
                placeholder="3"
                value={requiredApprovals}
                onChange={(e) => setRequiredApprovals(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">Number of validators that must approve</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validators" className="text-white">Validator Addresses</Label>
              <Input
                id="validators"
                placeholder="Comma-separated public keys"
                value={validatorsInput}
                onChange={(e) => setValidatorsInput(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">Example: pubkey1, pubkey2, pubkey3</p>
            </div>

            <Button
              type="submit"
              disabled={!connected || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Creating...' : 'Create Consensus Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">How Consensus Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-400">
          <div className="flex gap-3">
            <span className="text-purple-400 font-semibold">1.</span>
            <p>Submitter creates consensus request with validator list and approval threshold (e.g., 3 of 5)</p>
          </div>
          <div className="flex gap-3">
            <span className="text-purple-400 font-semibold">2.</span>
            <p>Each validator reviews the action and submits approve/reject vote on-chain</p>
          </div>
          <div className="flex gap-3">
            <span className="text-purple-400 font-semibold">3.</span>
            <p>Once threshold is met, consensus status updates to "approved" or "rejected"</p>
          </div>
          <div className="flex gap-3">
            <span className="text-purple-400 font-semibold">4.</span>
            <p>Approved actions can proceed; rejected actions are blocked from execution</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
