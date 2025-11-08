/**
 * Attestation Hub - Issue, manage, and search attestations
 */

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useSPLX } from '@/hooks/useSPLX';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Search,
  Award,
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface Attestation {
  agent: string;
  attestor: string;
  type: string;
  score: number;
  metadata: string;
  issuedAt: number;
  validUntil: number;
  isRevoked: boolean;
  status: 'valid' | 'expired' | 'revoked';
}

const ATTESTATION_TYPES = [
  'Security Audit',
  'Performance Test',
  'Code Review',
  'Compliance Check',
  'Integration Test',
  'Penetration Test',
  'Load Test',
  'Other'
];

export default function AttestationHub() {
  const { connected, publicKey } = useWallet();
  const { attestation } = useSPLX();

  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [isAttestor, setIsAttestor] = useState(false);

  // Issue Attestation Form
  const [issueForm, setIssueForm] = useState({
    agentId: '',
    type: '',
    score: 80,
    metadata: '',
    validity: 365
  });

  // Register Attestor Form
  const [registerForm, setRegisterForm] = useState({
    name: '',
    stakeAmount: 1
  });

  // Search Form
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Attestation[]>([]);

  // Mock attestations
  const myAttestations: Attestation[] = [
    {
      agent: 'trading-bot-alpha',
      attestor: publicKey?.toBase58().slice(0, 8) + '...' || 'You',
      type: 'Security Audit',
      score: 95,
      metadata: 'ipfs://QmX...',
      issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      validUntil: Date.now() + 1000 * 60 * 60 * 24 * 355,
      isRevoked: false,
      status: 'valid'
    },
    {
      agent: 'analytics-service',
      attestor: publicKey?.toBase58().slice(0, 8) + '...' || 'You',
      type: 'Performance Test',
      score: 88,
      metadata: 'ipfs://QmY...',
      issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
      validUntil: Date.now() + 1000 * 60 * 60 * 24 * 345,
      isRevoked: false,
      status: 'valid'
    }
  ];

  const handleRegisterAttestor = async () => {
    if (!connected || !attestation) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!registerForm.name.trim()) {
      toast.error('Please enter an attestor name');
      return;
    }

    setLoading(true);
    try {
      const signature = await attestation.registerAttestor(registerForm.name);
      
      toast.success(
        <div>
          <p className="font-semibold">Registered as Attestor!</p>
          <p className="text-sm">Signature: {signature.slice(0, 8)}...</p>
        </div>
      );

      setIsAttestor(true);
      setRegisterForm({ name: '', stakeAmount: 1 });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error((error as Error).message || 'Failed to register as attestor');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueAttestation = async () => {
    if (!connected || !attestation) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!issueForm.agentId || !issueForm.type) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const agentPubkey = new PublicKey(issueForm.agentId);
      
      const signature = await attestation.issueAttestation(
        agentPubkey,
        issueForm.type,
        issueForm.score,
        issueForm.metadata,
        issueForm.validity
      );

      toast.success(
        <div>
          <p className="font-semibold">Attestation Issued!</p>
          <p className="text-sm">Signature: {signature.slice(0, 8)}...</p>
        </div>
      );

      setIssueForm({
        agentId: '',
        type: '',
        score: 80,
        metadata: '',
        validity: 365
      });
    } catch (error) {
      console.error('Issue error:', error);
      toast.error((error as Error).message || 'Failed to issue attestation');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAttestation = async (agentId: string) => {
    if (!connected || !attestation) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const agentPubkey = new PublicKey(agentId);
      const signature = await attestation.revokeAttestation(agentPubkey);

      toast.success(
        <div>
          <p className="font-semibold">Attestation Revoked</p>
          <p className="text-sm">Signature: {signature.slice(0, 8)}...</p>
        </div>
      );
    } catch (error) {
      console.error('Revoke error:', error);
      toast.error((error as Error).message || 'Failed to revoke attestation');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      // Mock search results
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSearchResults([
        {
          agent: searchQuery,
          attestor: 'CertiK',
          type: 'Security Audit',
          score: 95,
          metadata: 'ipfs://QmABC...',
          issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
          validUntil: Date.now() + 1000 * 60 * 60 * 24 * 335,
          isRevoked: false,
          status: 'valid'
        },
        {
          agent: searchQuery,
          attestor: 'Quantstamp',
          type: 'Performance Test',
          score: 92,
          metadata: 'ipfs://QmDEF...',
          issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
          validUntil: Date.now() + 1000 * 60 * 60 * 24 * 320,
          isRevoked: false,
          status: 'valid'
        }
      ]);

      toast.success(`Found ${2} attestations`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const renderAttestation = (att: Attestation) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Shield className={`h-8 w-8 ${
            att.status === 'valid' ? 'text-blue-500' :
            att.status === 'expired' ? 'text-gray-400' :
            'text-red-500'
          }`} />
          <div>
            <h4 className="font-semibold">{att.type}</h4>
            <p className="text-sm text-muted-foreground">
              Agent: {att.agent}
            </p>
            <p className="text-sm text-muted-foreground">
              Attestor: {att.attestor}
            </p>
          </div>
        </div>
        <Badge variant={
          att.status === 'valid' ? 'default' :
          att.status === 'expired' ? 'secondary' :
          'destructive'
        }>
          {att.status}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Score:</span>
          <span className="font-medium">{att.score}/100</span>
        </div>
        <Progress value={att.score} className="h-2" />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Issued: {new Date(att.issuedAt).toLocaleDateString()}
        </span>
        <span>
          Expires: {new Date(att.validUntil).toLocaleDateString()}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(att.metadata, '_blank')}
        >
          <ExternalLink className="mr-1 h-3 w-3" />
          View Report
        </Button>
        {att.attestor.includes(publicKey?.toBase58().slice(0, 8) || '') && att.status === 'valid' && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleRevokeAttestation(att.agent)}
            disabled={loading}
          >
            <XCircle className="mr-1 h-3 w-3" />
            Revoke
          </Button>
        )}
      </div>
    </div>
  );

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to access the attestation hub
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Attestation Hub</h1>
        <p className="text-muted-foreground">
          Issue, manage, and search third-party security attestations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">
            <Search className="mr-2 h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="my-attestations">
            <Award className="mr-2 h-4 w-4" />
            My Attestations
          </TabsTrigger>
          <TabsTrigger value="issue">
            <Shield className="mr-2 h-4 w-4" />
            Issue Attestation
          </TabsTrigger>
          <TabsTrigger value="register">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Become Attestor
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Attestations</CardTitle>
              <CardDescription>
                Find attestations for any agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter agent ID or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="font-semibold">Search Results</h3>
                  {searchResults.map((att, i) => (
                    <div key={i}>{renderAttestation(att)}</div>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && searchQuery && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No attestations found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Attestations Tab */}
        <TabsContent value="my-attestations">
          <Card>
            <CardHeader>
              <CardTitle>Attestations You've Issued</CardTitle>
              <CardDescription>
                Manage attestations from your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAttestor ? (
                <div className="space-y-4">
                  {myAttestations.length > 0 ? (
                    myAttestations.map((att, i) => (
                      <div key={i}>{renderAttestation(att)}</div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>You haven't issued any attestations yet</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>You're not registered as an attestor</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab('register')}
                  >
                    Register Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issue Attestation Tab */}
        <TabsContent value="issue">
          <Card>
            <CardHeader>
              <CardTitle>Issue New Attestation</CardTitle>
              <CardDescription>
                Create a security or performance attestation for an agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAttestor ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="agentId">Agent Address *</Label>
                    <Input
                      id="agentId"
                      placeholder="Enter agent public key..."
                      value={issueForm.agentId}
                      onChange={(e) => setIssueForm({...issueForm, agentId: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Attestation Type *</Label>
                    <Select
                      value={issueForm.type}
                      onValueChange={(value) => setIssueForm({...issueForm, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ATTESTATION_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="score">Score (0-100) *</Label>
                    <Input
                      id="score"
                      type="number"
                      min={0}
                      max={100}
                      value={issueForm.score}
                      onChange={(e) => setIssueForm({...issueForm, score: parseInt(e.target.value)})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="metadata">Metadata URI</Label>
                    <Input
                      id="metadata"
                      placeholder="ipfs://... or https://..."
                      value={issueForm.metadata}
                      onChange={(e) => setIssueForm({...issueForm, metadata: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="validity">Validity (days) *</Label>
                    <Input
                      id="validity"
                      type="number"
                      min={1}
                      value={issueForm.validity}
                      onChange={(e) => setIssueForm({...issueForm, validity: parseInt(e.target.value)})}
                    />
                  </div>

                  <Button 
                    onClick={handleIssueAttestation}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Issuing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Issue Attestation
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>You must be registered as an attestor to issue attestations</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab('register')}
                  >
                    Register as Attestor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Register Attestor Tab */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Register as Attestor</CardTitle>
              <CardDescription>
                Stake SOL to become a trusted attestation issuer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isAttestor ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Attestor Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., CertiK, Quantstamp..."
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                    />
                  </div>

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
                    <h4 className="font-semibold text-sm">Requirements:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Minimum 1 SOL stake</li>
                      <li>Unique attestor name</li>
                      <li>Connected wallet</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleRegisterAttestor}
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
                        Register as Attestor
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-semibold mb-2">You're an Attestor!</h3>
                  <p className="text-muted-foreground mb-4">
                    You can now issue attestations to agents
                  </p>
                  <Button onClick={() => setActiveTab('issue')}>
                    Issue Your First Attestation
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
