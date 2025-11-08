/**
 * Consensus Manager - Create and manage Byzantine Fault Tolerant consensus sessions
 */

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useSPLX } from '@/hooks/useSPLX';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Vote,
  Shield,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';

interface ConsensusSession {
  id: string;
  proposalHash: string;
  proposalDescription: string;
  creator: string;
  threshold: number;
  totalValidators: number;
  approvals: number;
  rejections: number;
  status: 'active' | 'approved' | 'rejected' | 'expired';
  createdAt: number;
  expiresAt: number;
  validators: string[];
  hasVoted: boolean;
  yourVote?: 'approve' | 'reject';
}

export default function ConsensusManager() {
  const { connected, publicKey } = useWallet();
  const { consensus } = useSPLX();

  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(false);
  const [isValidator, setIsValidator] = useState(false);

  // Register Validator Form
  const [registerForm, setRegisterForm] = useState({
    stakeAmount: 1
  });

  // Create Session Form
  const [createForm, setCreateForm] = useState({
    sessionId: '',
    proposal: '',
    threshold: 3,
    validators: [''] as string[],
    validity: 7
  });

  // Mock sessions
  const mockSessions: ConsensusSession[] = [
    {
      id: 'session-001',
      proposalHash: '0x7a4f3b2e...',
      proposalDescription: 'Approve deployment of updated validation rules v2.0',
      creator: '0xABCD1234...',
      threshold: 3,
      totalValidators: 5,
      approvals: 2,
      rejections: 0,
      status: 'active',
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 5,
      validators: ['0xVal1...', '0xVal2...', '0xVal3...', '0xVal4...', '0xVal5...'],
      hasVoted: false
    },
    {
      id: 'session-002',
      proposalHash: '0x9c8d5a1b...',
      proposalDescription: 'Update reputation scoring algorithm parameters',
      creator: '0xDEF56789...',
      threshold: 2,
      totalValidators: 3,
      approvals: 2,
      rejections: 0,
      status: 'approved',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 5,
      validators: ['0xVal1...', '0xVal2...', '0xVal3...'],
      hasVoted: true,
      yourVote: 'approve'
    },
    {
      id: 'session-003',
      proposalHash: '0x3e6f2c9a...',
      proposalDescription: 'Emergency pause for security audit findings',
      creator: '0xGHI98765...',
      threshold: 4,
      totalValidators: 5,
      approvals: 1,
      rejections: 3,
      status: 'rejected',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
      validators: ['0xVal1...', '0xVal2...', '0xVal3...', '0xVal4...', '0xVal5...'],
      hasVoted: true,
      yourVote: 'reject'
    }
  ];

  const [sessions, setSessions] = useState<ConsensusSession[]>(mockSessions);

  const handleRegisterValidator = async () => {
    if (!connected || !consensus) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const signature = await consensus.registerValidator(registerForm.stakeAmount);
      
      toast.success(
        <div>
          <p className="font-semibold">Registered as Validator!</p>
          <p className="text-sm">Signature: {signature.slice(0, 8)}...</p>
        </div>
      );

      setIsValidator(true);
      setRegisterForm({ stakeAmount: 1 });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error((error as Error).message || 'Failed to register as validator');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!connected || !consensus) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!createForm.sessionId || !createForm.proposal) {
      toast.error('Please fill all required fields');
      return;
    }

    if (createForm.validators.filter(v => v.trim()).length < 2) {
      toast.error('Please add at least 2 validators');
      return;
    }

    setLoading(true);
    try {
      const validatorPubkeys = createForm.validators
        .filter(v => v.trim())
        .map(v => new PublicKey(v));

      const signature = await consensus.createConsensusSession(
        createForm.sessionId,
        createForm.proposal,
        createForm.threshold,
        validatorPubkeys,
        createForm.validity
      );

      toast.success(
        <div>
          <p className="font-semibold">Consensus Session Created!</p>
          <p className="text-sm">Signature: {signature.slice(0, 8)}...</p>
        </div>
      );

      // Add to sessions list
      const newSession: ConsensusSession = {
        id: createForm.sessionId,
        proposalHash: '0x' + Math.random().toString(16).slice(2, 10) + '...',
        proposalDescription: createForm.proposal,
        creator: publicKey!.toBase58().slice(0, 12) + '...',
        threshold: createForm.threshold,
        totalValidators: validatorPubkeys.length,
        approvals: 0,
        rejections: 0,
        status: 'active',
        createdAt: Date.now(),
        expiresAt: Date.now() + createForm.validity * 24 * 60 * 60 * 1000,
        validators: validatorPubkeys.map(v => v.toBase58().slice(0, 8) + '...'),
        hasVoted: false
      };

      setSessions([newSession, ...sessions]);

      setCreateForm({
        sessionId: '',
        proposal: '',
        threshold: 3,
        validators: [''],
        validity: 7
      });
    } catch (error) {
      console.error('Create session error:', error);
      toast.error((error as Error).message || 'Failed to create consensus session');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (sessionId: string, approve: boolean) => {
    if (!connected || !consensus) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const signature = await consensus.submitVote(sessionId, approve);

      toast.success(
        <div>
          <p className="font-semibold">Vote Submitted!</p>
          <p className="text-sm">Signature: {signature.slice(0, 8)}...</p>
        </div>
      );

      // Update session
      setSessions(sessions.map(s => {
        if (s.id === sessionId) {
          const updated = { ...s };
          if (approve) {
            updated.approvals++;
          } else {
            updated.rejections++;
          }
          updated.hasVoted = true;
          updated.yourVote = approve ? 'approve' : 'reject';
          
          // Check if threshold reached
          if (updated.approvals >= updated.threshold) {
            updated.status = 'approved';
          } else if (updated.totalValidators - updated.rejections < updated.threshold) {
            updated.status = 'rejected';
          }
          
          return updated;
        }
        return s;
      }));

    } catch (error) {
      console.error('Vote error:', error);
      toast.error((error as Error).message || 'Failed to submit vote');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeSession = async (sessionId: string) => {
    if (!connected || !consensus) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const signature = await consensus.finalizeConsensus(sessionId);

      toast.success(
        <div>
          <p className="font-semibold">Consensus Finalized!</p>
          <p className="text-sm">Signature: {signature.slice(0, 8)}...</p>
        </div>
      );
    } catch (error) {
      console.error('Finalize error:', error);
      toast.error((error as Error).message || 'Failed to finalize consensus');
    } finally {
      setLoading(false);
    }
  };

  const addValidator = () => {
    setCreateForm({
      ...createForm,
      validators: [...createForm.validators, '']
    });
  };

  const removeValidator = (index: number) => {
    setCreateForm({
      ...createForm,
      validators: createForm.validators.filter((_, i) => i !== index)
    });
  };

  const updateValidator = (index: number, value: string) => {
    const updated = [...createForm.validators];
    updated[index] = value;
    setCreateForm({ ...createForm, validators: updated });
  };

  const renderSession = (session: ConsensusSession) => {
    const progress = (session.approvals / session.threshold) * 100;
    const timeLeft = session.expiresAt - Date.now();
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

    return (
      <Card key={session.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{session.proposalDescription}</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span>Session: {session.id}</span>
                <span>Hash: {session.proposalHash}</span>
                <span>Creator: {session.creator}</span>
              </CardDescription>
            </div>
            <Badge variant={
              session.status === 'active' ? 'default' :
              session.status === 'approved' ? 'default' :
              session.status === 'rejected' ? 'destructive' :
              'secondary'
            }>
              {session.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voting Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Consensus Progress</span>
              <span className="text-muted-foreground">
                {session.approvals}/{session.threshold} required
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {session.approvals} approvals
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                {session.rejections} rejections
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {session.totalValidators} validators
              </span>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center justify-between text-sm bg-muted p-3 rounded-lg">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {session.status === 'active' ? (
                daysLeft > 0 ? `${daysLeft} days remaining` : 'Expires soon'
              ) : (
                `Ended ${new Date(session.expiresAt).toLocaleDateString()}`
              )}
            </span>
            <span className="text-muted-foreground">
              Created {new Date(session.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Validators */}
          <div>
            <p className="text-sm font-medium mb-2">Validators:</p>
            <div className="flex flex-wrap gap-2">
              {session.validators.map((val, i) => (
                <Badge key={i} variant="outline">{val}</Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {session.status === 'active' && !session.hasVoted && isValidator && (
              <>
                <Button
                  onClick={() => handleVote(session.id, true)}
                  disabled={loading}
                  className="flex-1"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVote(session.id, false)}
                  disabled={loading}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}

            {session.hasVoted && (
              <Badge variant={session.yourVote === 'approve' ? 'default' : 'destructive'}>
                You voted: {session.yourVote}
              </Badge>
            )}

            {session.status === 'approved' && (
              <Button
                variant="outline"
                onClick={() => handleFinalizeSession(session.id)}
                disabled={loading}
              >
                <Shield className="mr-2 h-4 w-4" />
                Finalize on Chain
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to access the consensus manager
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status !== 'active');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Consensus Manager</h1>
        <p className="text-muted-foreground">
          Byzantine Fault Tolerant consensus for critical decisions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            <Vote className="mr-2 h-4 w-4" />
            Active Sessions ({activeSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Completed ({completedSessions.length})
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="mr-2 h-4 w-4" />
            Create Session
          </TabsTrigger>
          <TabsTrigger value="register">
            <Users className="mr-2 h-4 w-4" />
            Become Validator
          </TabsTrigger>
        </TabsList>

        {/* Active Sessions Tab */}
        <TabsContent value="active">
          <div className="space-y-4">
            {activeSessions.length > 0 ? (
              activeSessions.map(session => renderSession(session))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Vote className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No active consensus sessions</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Completed Sessions Tab */}
        <TabsContent value="completed">
          <div className="space-y-4">
            {completedSessions.length > 0 ? (
              completedSessions.map(session => renderSession(session))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No completed sessions yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Create Session Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Consensus Session</CardTitle>
              <CardDescription>
                Request multi-validator approval for critical decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sessionId">Session ID *</Label>
                  <Input
                    id="sessionId"
                    placeholder="e.g., upgrade-v2.0"
                    value={createForm.sessionId}
                    onChange={(e) => setCreateForm({...createForm, sessionId: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="proposal">Proposal Description *</Label>
                  <Textarea
                    id="proposal"
                    placeholder="Describe what requires consensus approval..."
                    value={createForm.proposal}
                    onChange={(e) => setCreateForm({...createForm, proposal: e.target.value})}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="threshold">Approval Threshold *</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min={1}
                    value={createForm.threshold}
                    onChange={(e) => setCreateForm({...createForm, threshold: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of approvals required to pass
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Validators *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addValidator}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {createForm.validators.map((validator, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Validator public key..."
                          value={validator}
                          onChange={(e) => updateValidator(index, e.target.value)}
                        />
                        {createForm.validators.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeValidator(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="validity">Validity Period (days) *</Label>
                  <Input
                    id="validity"
                    type="number"
                    min={1}
                    value={createForm.validity}
                    onChange={(e) => setCreateForm({...createForm, validity: parseInt(e.target.value)})}
                  />
                </div>

                <Button 
                  onClick={handleCreateSession}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Vote className="mr-2 h-4 w-4" />
                      Create Consensus Session
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Register Validator Tab */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Register as Validator</CardTitle>
              <CardDescription>
                Stake SOL to participate in consensus voting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isValidator ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stake">Stake Amount (SOL) *</Label>
                    <Input
                      id="stake"
                      type="number"
                      min={1}
                      step={0.1}
                      value={registerForm.stakeAmount}
                      onChange={(e) => setRegisterForm({...registerForm, stakeAmount: parseFloat(e.target.value)})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum: 1 SOL
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm">Validator Responsibilities:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Review and vote on consensus proposals</li>
                      <li>Maintain minimum stake requirement</li>
                      <li>Participate in timely manner</li>
                      <li>Act in good faith for network security</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleRegisterValidator}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Register as Validator
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-semibold mb-2">You're a Validator!</h3>
                  <p className="text-muted-foreground mb-4">
                    You can now vote on consensus sessions
                  </p>
                  <Button onClick={() => setActiveTab('active')}>
                    View Active Sessions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
