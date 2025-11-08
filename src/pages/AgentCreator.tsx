/**
 * Agent Creator - Step-by-step wizard to register new AI agent
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, Upload, Sparkles } from 'lucide-react';

const STEPS = ['Basic Info', 'Capabilities', 'Metadata', 'Review & Register'];

const DOMAINS = [
  'Trading & Finance',
  'Data Processing',
  'Content Generation',
  'Gaming',
  'Social Media',
  'Security & Auditing',
  'IoT & Hardware',
  'Other'
];

const CAPABILITY_TYPES = [
  'token-trading',
  'market-analysis',
  'data-processing',
  'text-generation',
  'image-generation',
  'sentiment-analysis',
  'smart-contract-audit',
  'game-strategy',
  'social-monitoring'
];

export default function AgentCreator() {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const { client } = useSPL8004();  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    agentId: '',
    description: '',
    domain: '',
    capabilities: [] as Array<{ type: string; version: string }>,
    metadataSource: 'ipfs' as 'ipfs' | 'arweave' | 'manual',
    metadataUri: '',
    metadataFile: null as File | null
  });

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  // Validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Info
        if (!formData.agentId.trim()) {
          toast.error('Agent ID is required');
          return false;
        }
        if (!/^[a-z0-9-]+$/.test(formData.agentId)) {
          toast.error('Agent ID must be lowercase alphanumeric with hyphens');
          return false;
        }
        if (!formData.description.trim()) {
          toast.error('Description is required');
          return false;
        }
        if (!formData.domain) {
          toast.error('Please select a domain');
          return false;
        }
        return true;

      case 1: // Capabilities
        if (formData.capabilities.length === 0) {
          toast.error('Add at least one capability');
          return false;
        }
        return true;

      case 2: // Metadata
        if (formData.metadataSource === 'manual' && !formData.metadataUri.trim()) {
          toast.error('Metadata URI is required');
          return false;
        }
        if (formData.metadataSource !== 'manual' && !formData.metadataFile) {
          toast.error('Please upload a metadata file');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {

      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const addCapability = () => {
    setFormData(prev => ({
      ...prev,
      capabilities: [...prev.capabilities, { type: '', version: '1.0.0' }]
    }));
  };

  const removeCapability = (index: number) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter((_, i) => i !== index)
    }));
  };

  const updateCapability = (index: number, field: 'type' | 'version', value: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.map((cap, i) => 
        i === index ? { ...cap, [field]: value } : cap
      )
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, metadataFile: file }));
      toast.success(`File selected: ${file.name}`);
    }
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    // Mock IPFS upload - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `ipfs://Qm${Math.random().toString(36).substring(7)}`;
  };

  const handleRegister = async () => {
    if (!connected || !client) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      // Check if agent ID already exists
      const existing = await client.getIdentity(formData.agentId);
      if (existing) {
        toast.error('Agent ID already exists! Please choose a different ID.');
        setLoading(false);
        return;
      }

      // Upload metadata if file provided
      let metadataUri = formData.metadataUri;
      if (formData.metadataFile) {
        toast.info('Uploading metadata to IPFS...');
        metadataUri = await uploadToIPFS(formData.metadataFile);
      }

      // Register agent
      toast.info('Registering agent on-chain...');
      const signature = await client.registerAgent(formData.agentId, metadataUri);
      
      toast.success(
        <div>
          <p className="font-semibold">Agent registered successfully! 🎉</p>
          <p className="text-xs text-muted-foreground">TX: {signature.slice(0, 8)}...</p>
        </div>
      );

      // Redirect to dashboard after 2s
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      toast.error(
        <div>
          <p className="font-semibold">Registration failed</p>
          <p className="text-xs">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet Required</CardTitle>
            <CardDescription>
              Please connect your Solana wallet to create an agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          Create AI Agent
        </h1>
        <p className="text-muted-foreground">
          Register your agent on SPL-8004 and start building reputation
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className={`text-sm font-medium ${
                index <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {index + 1}. {step}
            </div>
          ))}
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && 'Basic information about your agent'}
            {currentStep === 1 && 'Define what your agent can do'}
            {currentStep === 2 && 'Upload or link metadata'}
            {currentStep === 3 && 'Review and confirm registration'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="agentId">Agent ID *</Label>
                <Input
                  id="agentId"
                  placeholder="my-trading-bot"
                  value={formData.agentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, agentId: e.target.value.toLowerCase() }))}
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier (lowercase, alphanumeric, hyphens only)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Autonomous trading agent specialized in DeFi arbitrage..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domain *</Label>
                <Select value={formData.domain} onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map(domain => (
                      <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Step 2: Capabilities */}
          {currentStep === 1 && (
            <>
              <div className="space-y-4">
                {formData.capabilities.map((capability, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Capability Type</Label>
                      <Select 
                        value={capability.type} 
                        onValueChange={(value) => updateCapability(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CAPABILITY_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-32 space-y-2">
                      <Label>Version</Label>
                      <Input
                        placeholder="1.0.0"
                        value={capability.version}
                        onChange={(e) => updateCapability(index, 'version', e.target.value)}
                      />
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeCapability(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <Button onClick={addCapability} variant="outline" className="w-full">
                + Add Capability
              </Button>
            </>
          )}

          {/* Step 3: Metadata */}
          {currentStep === 2 && (
            <>
              <div className="space-y-4">
                <Label>Metadata Source</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={formData.metadataSource === 'ipfs' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, metadataSource: 'ipfs' }))}
                  >
                    IPFS
                  </Button>
                  <Button
                    variant={formData.metadataSource === 'arweave' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, metadataSource: 'arweave' }))}
                  >
                    Arweave
                  </Button>
                  <Button
                    variant={formData.metadataSource === 'manual' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, metadataSource: 'manual' }))}
                  >
                    Manual URI
                  </Button>
                </div>
              </div>

              {formData.metadataSource === 'manual' ? (
                <div className="space-y-2">
                  <Label htmlFor="metadataUri">Metadata URI</Label>
                  <Input
                    id="metadataUri"
                    placeholder="https://ipfs.io/ipfs/Qm..."
                    value={formData.metadataUri}
                    onChange={(e) => setFormData(prev => ({ ...prev, metadataUri: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="metadataFile">Upload Metadata JSON</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <input
                      id="metadataFile"
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="metadataFile">
                      <Button variant="outline" size="sm" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                    {formData.metadataFile && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {formData.metadataFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <span className="font-medium">Agent ID:</span>{' '}
                  <code className="bg-background px-2 py-1 rounded">{formData.agentId}</code>
                </div>
                <div>
                  <span className="font-medium">Description:</span>{' '}
                  <p className="text-sm text-muted-foreground mt-1">{formData.description}</p>
                </div>
                <div>
                  <span className="font-medium">Domain:</span>{' '}
                  <Badge variant="secondary">{formData.domain}</Badge>
                </div>
                <div>
                  <span className="font-medium">Capabilities:</span>{' '}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.capabilities.map((cap, i) => (
                      <Badge key={i} variant="outline">
                        {cap.type} v{cap.version}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Metadata:</span>{' '}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.metadataFile ? formData.metadataFile.name : formData.metadataUri}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-900 mb-2">Registration Fee</p>
                <p className="text-2xl font-bold text-yellow-900">0.1 SOL</p>
                <p className="text-xs text-yellow-700 mt-1">One-time registration fee</p>
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" className="mt-1" required />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                  I understand this agent will be publicly visible on the SPL-X network
                </Label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={nextStep} disabled={loading}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleRegister} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Register Agent
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
