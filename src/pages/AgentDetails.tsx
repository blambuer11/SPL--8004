/**
 * Agent Details Page - Complete profile for a single agent
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { useSPLX } from '@/hooks/useSPLX';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ExternalLink, 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  XCircle,
  Send,
  FileCheck,
  Sparkles,
  Copy
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AgentIdentity {
  agentId: string;
  owner: PublicKey;
  metadataUri?: string;
  registeredAt?: number;
}

interface AgentReputation {
  score: number;
  totalTasks: number;
  successfulTasks: number;
  lastUpdated?: number;
}

interface Validation {
  timestamp: number;
  result: 'approved' | 'rejected';
  taskId: string;
  validator: string;
  reputationChange: number;
}

interface Attestation {
  issuer: string;
  type: string;
  score: number;
  issuedAt: number;
  expiresAt: number;
  status: 'valid' | 'expired' | 'revoked';
}

export default function AgentDetails() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const { client } = useSPL8004();
  const { attestation } = useSPLX();

  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState<AgentIdentity | null>(null);
  const [reputation, setReputation] = useState<AgentReputation | null>(null);
  const [validations, setValidations] = useState<Validation[]>([]);
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  // Mock reputation history for chart
  const reputationHistory = [
    { date: '2025-11-01', score: 5000 },
    { date: '2025-11-02', score: 5500 },
    { date: '2025-11-03', score: 5300 },
    { date: '2025-11-04', score: 6000 },
    { date: '2025-11-05', score: 6500 },
    { date: '2025-11-06', score: 7200 },
    { date: '2025-11-07', score: reputation?.score || 7500 },
  ];

  useEffect(() => {
    if (agentId && client) {
      loadAgentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, client]);

  const loadAgentData = async () => {
    if (!agentId || !client) return;
    
    setLoading(true);
    try {
      // Load identity
      const identityData = await client.getIdentity(agentId);
      if (!identityData) {
        toast.error('Agent not found');
        navigate('/agents');
        return;
      }
      
      // Create compatible identity object
      const identity: AgentIdentity = {
        agentId: identityData.agentId,
        owner: identityData.owner,
        metadataUri: '', // TODO: fetch from metadata
        registeredAt: Date.now()
      };
      setIdentity(identity);

      // Load reputation
      const reputationData = await client.getReputation(agentId);
      
      // Create compatible reputation object
      const reputation: AgentReputation = {
        score: reputationData.score,
        totalTasks: reputationData.totalTasks,
        successfulTasks: reputationData.successfulTasks,
        lastUpdated: Date.now()
      };
      setReputation(reputation);

      // Check ownership
      if (publicKey && identityData.owner.equals(publicKey)) {
        setIsOwner(true);
      }

      // Mock validations data
      setValidations([
        {
          timestamp: Date.now() - 1000 * 60 * 60 * 2,
          result: 'approved',
          taskId: '0x3Pww...',
          validator: '0x1234...',
          reputationChange: 100
        },
        {
          timestamp: Date.now() - 1000 * 60 * 60 * 24,
          result: 'approved',
          taskId: '0x5Kxx...',
          validator: '0x5678...',
          reputationChange: 100
        },
        {
          timestamp: Date.now() - 1000 * 60 * 60 * 48,
          result: 'rejected',
          taskId: '0x7Mnn...',
          validator: '0x9ABC...',
          reputationChange: -50
        }
      ]);

      // Mock attestations
      setAttestations([
        {
          issuer: 'CertiK',
          type: 'Security Audit',
          score: 95,
          issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
          expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 335,
          status: 'valid'
        },
        {
          issuer: 'UptimeRobot',
          type: 'Performance Metrics',
          score: 98,
          issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
          expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 75,
          status: 'valid'
        }
      ]);

    } catch (error) {
      console.error('Error loading agent data:', error);
      toast.error('Failed to load agent data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSendPayment = () => {
    navigate(`/payments?recipient=${identity?.owner.toBase58()}`);
  };

  const handleRequestValidation = () => {
    navigate(`/validation?agentId=${agentId}`);
  };

  const successRate = reputation 
    ? Math.round((reputation.successfulTasks / reputation.totalTasks) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading agent data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!identity || !reputation) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Agent Not Found</CardTitle>
            <CardDescription>
              The agent you're looking for doesn't exist or hasn't been registered yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/agents')}>
              Back to Agents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/agents')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Agents
      </Button>

      {/* Agent Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-3xl">{agentId}</CardTitle>
                  {isOwner && (
                    <Badge variant="secondary">You Own This</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>Owner:</span>
                    <code className="bg-muted px-2 py-0.5 rounded">
                      {identity.owner.toBase58().slice(0, 8)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(identity.owner.toBase58())}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      Registered {new Date(identity.registeredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {!isOwner && (
                <>
                  <Button variant="outline" onClick={handleSendPayment}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Payment
                  </Button>
                  <Button onClick={handleRequestValidation}>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Request Validation
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(identity.metadataUri, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reputation Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {reputation.score.toLocaleString()}
            </div>
            <Progress value={(reputation.score / 10000) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((reputation.score / 10000) * 100)}% of maximum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reputation.totalTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time validations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Success Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {successRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {reputation.successfulTasks} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Attestations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {attestations.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active certifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="validations">Validations</TabsTrigger>
          <TabsTrigger value="attestations">Attestations</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reputation History</CardTitle>
              <CardDescription>Score progression over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reputationHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Task Success Rate</span>
                    <span className="text-sm text-muted-foreground">{successRate}%</span>
                  </div>
                  <Progress value={successRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Reputation Level</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((reputation.score / 10000) * 100)}%
                    </span>
                  </div>
                  <Progress value={(reputation.score / 10000) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Attestation Coverage</span>
                    <span className="text-sm text-muted-foreground">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {validations.slice(0, 3).map((val, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                      {val.result === 'approved' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Task {val.taskId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(val.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={val.result === 'approved' ? 'default' : 'destructive'}>
                        {val.reputationChange > 0 ? '+' : ''}{val.reputationChange}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Validations Tab */}
        <TabsContent value="validations">
          <Card>
            <CardHeader>
              <CardTitle>Validation History</CardTitle>
              <CardDescription>
                All task validations for this agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {validations.map((val, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {val.result === 'approved' ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">Task {val.taskId}</p>
                        <p className="text-sm text-muted-foreground">
                          Validator: {val.validator}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(val.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={val.result === 'approved' ? 'default' : 'destructive'}>
                        {val.result}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {val.reputationChange > 0 ? '+' : ''}{val.reputationChange} reputation
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attestations Tab */}
        <TabsContent value="attestations">
          <Card>
            <CardHeader>
              <CardTitle>Security & Performance Attestations</CardTitle>
              <CardDescription>
                Third-party certifications and audits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {attestations.map((att, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8 text-blue-500" />
                        <div>
                          <h4 className="font-semibold">{att.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            Issued by {att.issuer}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          att.status === 'valid' ? 'default' : 
                          att.status === 'expired' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {att.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score:</span>
                        <span className="font-medium">{att.score}/100</span>
                      </div>
                      <Progress value={att.score} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Issued: {new Date(att.issuedAt).toLocaleDateString()}</span>
                        <span>Expires: {new Date(att.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities">
          <Card>
            <CardHeader>
              <CardTitle>Agent Capabilities</CardTitle>
              <CardDescription>
                Skills and services this agent provides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Capability registry coming soon</p>
                <p className="text-sm mt-2">Agent capabilities will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
