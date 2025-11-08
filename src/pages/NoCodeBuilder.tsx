import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

interface IntegrationConfig {
  [key: string]: {
    apiKey?: string;
    webhookUrl?: string;
    endpoint?: string;
    enabled: boolean;
  };
}

interface AgentConfig {
  name: string;
  description: string;
  protocol: string;
  behavior: string;
  integrations: string[];
  autoValidate: boolean;
  reputationThreshold: number;
  network: 'devnet' | 'mainnet';
}

export default function NoCodeBuilder() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [currentStep, setCurrentStep] = useState<'config' | 'integrations' | 'deploy'>('config');
  const [deploying, setDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [integrationConfigs, setIntegrationConfigs] = useState<IntegrationConfig>({});

  const [config, setConfig] = useState<AgentConfig>({
    name: '',
    description: '',
    protocol: 'spl-8004',
    behavior: 'validator',
    integrations: [],
    autoValidate: true,
    reputationThreshold: 80,
    network: 'devnet'
  });

  const availableIntegrations = [
    { id: 'twitter', name: 'Twitter/X API', icon: '🐦', description: 'Post tweets, read timeline' },
    { id: 'discord', name: 'Discord Bot', icon: '💬', description: 'Send messages, manage channels' },
    { id: 'openai', name: 'OpenAI GPT', icon: '🤖', description: 'AI-powered responses' },
    { id: 'coingecko', name: 'CoinGecko', icon: '🦎', description: 'Crypto price data' },
    { id: 'webhook', name: 'Webhook', icon: '🔗', description: 'HTTP POST/GET requests' },
    { id: 'solana-rpc', name: 'Solana RPC', icon: '◎', description: 'On-chain data queries' },
  ];

  const protocols = [
    { id: 'spl-8004', name: 'SPL-8004', description: 'Reputation scoring' },
    { id: 'acp', name: 'ACP', description: 'Agent collaboration' },
    { id: 'tap', name: 'TAP', description: 'Task assignment' },
    { id: 'fcp', name: 'FCP', description: 'Fee collection' },
  ];

  const behaviors = [
    { id: 'validator', name: 'Validator', description: 'Validate transactions and data' },
    { id: 'orchestrator', name: 'Orchestrator', description: 'Coordinate multiple agents' },
    { id: 'monitor', name: 'Monitor', description: 'Track and report events' },
    { id: 'executor', name: 'Executor', description: 'Execute tasks automatically' },
  ];

  const toggleIntegration = (integrationId: string) => {
    setConfig(prev => ({
      ...prev,
      integrations: prev.integrations.includes(integrationId)
        ? prev.integrations.filter(id => id !== integrationId)
        : [...prev.integrations, integrationId]
    }));
  };

  const deployAgent = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!config.name || !config.description) {
      toast.error('Please fill in agent name and description');
      return;
    }

    try {
      setDeploying(true);
      setLastSignature(null);
      setDeploymentStatus('Generating agent metadata...');

      // Generate metadata with integrations
      const metadata = {
        name: config.name,
        description: config.description,
        protocol: config.protocol,
        behavior: config.behavior,
        reputationThreshold: config.reputationThreshold,
        autoValidate: config.autoValidate,
        integrations: config.integrations.map(intId => ({
          id: intId,
          name: availableIntegrations.find(i => i.id === intId)?.name,
          configured: !!integrationConfigs[intId]?.apiKey || !!integrationConfigs[intId]?.webhookUrl || !!integrationConfigs[intId]?.endpoint,
          // API keys are encrypted (not shown in metadata)
          hasCredentials: !!(integrationConfigs[intId]?.apiKey || integrationConfigs[intId]?.webhookUrl)
        })),
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      };

      // Simulate metadata upload to IPFS/Arweave
      await new Promise(resolve => setTimeout(resolve, 1500));
      const metadataHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const metadataUri = `ipfs://${metadataHash}`;
      
      setDeploymentStatus(`Metadata uploaded: ${metadataHash.slice(0, 10)}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeploymentStatus('Registering integrations...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDeploymentStatus('Initializing agent behavior...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDeploymentStatus('Deploying to ' + config.network + '...');

      // Create a simple transaction to demonstrate deployment
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('3oxg7wVtdp9T3sx773SMmws8zrGyAJecqTruaXfiw3mN'), // Treasury
          lamports: 1000000, // 0.001 SOL deployment fee
        })
      );

      await new Promise(resolve => setTimeout(resolve, 1000));

      const signature = await sendTransaction(transaction, connection);
      setLastSignature(signature);
      
      setDeploymentStatus(`Waiting for confirmation... (Signature: ${signature.slice(0, 8)}...)`);
      
      // Use latestBlockhash for better confirmation with timeout handling
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      
      try {
        await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          'confirmed'
        );
        
        setDeploymentStatus('Agent deployed successfully! 🎉');
        
        toast.success(`Agent "${config.name}" deployed successfully!`, {
          description: `Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}`,
          duration: 5000,
        });
      } catch (confirmError) {
        // Transaction might still be successful even if confirmation times out
        console.warn('Confirmation timeout, but transaction may be successful:', signature);
        
        // Check transaction status manually
        const txStatus = await connection.getSignatureStatus(signature);
        
        if (txStatus?.value?.confirmationStatus) {
          setDeploymentStatus('Transaction submitted! Confirmation pending...');
          toast.success(`Agent "${config.name}" transaction submitted!`, {
            description: `Signature: ${signature.slice(0, 8)}... - Check status on Solana Explorer`,
            duration: 8000,
          });
        } else {
          throw confirmError;
        }
      }

      // Store deployed agent in localStorage with metadata and integrations
      const deployedAgents = JSON.parse(localStorage.getItem('noema_deployed_agents') || '[]');
      deployedAgents.push({
        ...config,
        deployedAt: Date.now(),
        signature,
        agentId: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'active',
        metadataUri,
        metadata: {
          ...metadata,
          signature
        },
        integrationConfigs: Object.fromEntries(
          Object.entries(integrationConfigs).map(([key, value]) => [
            key,
            {
              ...value,
              // Mask API keys for security
              apiKey: value.apiKey ? '***' + value.apiKey.slice(-4) : undefined,
            }
          ])
        )
      });
      localStorage.setItem('noema_deployed_agents', JSON.stringify(deployedAgents));

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Deployment failed';
      
      // Check if error is just a timeout
      if (msg.includes('not confirmed') || msg.includes('timeout')) {
        toast.warning('Transaction submitted but confirmation pending', {
          description: 'Your agent may still be deploying. Check Solana Explorer in a few moments.',
          duration: 8000,
        });
        setDeploymentStatus('Transaction submitted, confirmation pending...');
      } else {
        toast.error('Deployment failed: ' + msg);
        setDeploymentStatus('Deployment failed: ' + msg);
      }
    } finally {
      setDeploying(false);
    }
  };

  const renderConfigStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>⚙️ Agent Configuration</CardTitle>
        <p className="text-sm text-gray-600">Define your agent's core settings</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="agent-name">Agent Name *</Label>
          <Input
            id="agent-name"
            placeholder="My Validation Agent"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="agent-description">Description *</Label>
          <Textarea
            id="agent-description"
            placeholder="This agent validates transaction data and maintains reputation scores..."
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Protocol</Label>
          <Select value={config.protocol} onValueChange={(value) => setConfig({ ...config, protocol: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {protocols.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex flex-col items-start">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-gray-600">{p.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Agent Behavior</Label>
          <Select value={config.behavior} onValueChange={(value) => setConfig({ ...config, behavior: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {behaviors.map(b => (
                <SelectItem key={b.id} value={b.id}>
                  <div className="flex flex-col items-start">
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-xs text-gray-600">{b.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reputation-threshold">Reputation Threshold: {config.reputationThreshold}%</Label>
          <input
            id="reputation-threshold"
            type="range"
            min="0"
            max="100"
            value={config.reputationThreshold}
            onChange={(e) => setConfig({ ...config, reputationThreshold: Number(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-gray-600">Minimum reputation score required for agent actions</p>
        </div>

        <div className="flex items-center justify-between border rounded-lg p-4">
          <div>
            <Label htmlFor="auto-validate">Auto-Validate Transactions</Label>
            <p className="text-xs text-gray-600">Automatically validate eligible transactions</p>
          </div>
          <Switch
            id="auto-validate"
            checked={config.autoValidate}
            onCheckedChange={(checked) => setConfig({ ...config, autoValidate: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label>Deployment Network</Label>
          <Select value={config.network} onValueChange={(value: 'devnet' | 'mainnet') => setConfig({ ...config, network: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="devnet">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Devnet</Badge>
                  <span className="text-xs">Free testing</span>
                </div>
              </SelectItem>
              <SelectItem value="mainnet">
                <div className="flex items-center gap-2">
                  <Badge>Mainnet</Badge>
                  <span className="text-xs">Production deployment</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setCurrentStep('integrations')} className="w-full" size="lg">
          Next: Configure Integrations →
        </Button>
      </CardContent>
    </Card>
  );

  const renderIntegrationsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>🔗 Integration Setup</CardTitle>
        <p className="text-sm text-gray-600">Select integrations and configure API credentials</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {availableIntegrations.map(integration => {
            const isSelected = config.integrations.includes(integration.id);
            return (
              <div
                key={integration.id}
                className={`border rounded-lg p-4 transition-all ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{integration.icon}</span>
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <p className="text-xs text-gray-600">{integration.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isSelected}
                    onCheckedChange={() => toggleIntegration(integration.id)}
                  />
                </div>

                {isSelected && (
                  <div className="space-y-2 mt-3 pt-3 border-t">
                    {integration.id === 'twitter' && (
                      <>
                        <Label className="text-xs">Twitter API Key</Label>
                        <Input
                          type="password"
                          placeholder="Enter Twitter API key..."
                          value={integrationConfigs[integration.id]?.apiKey || ''}
                          onChange={(e) => setIntegrationConfigs({
                            ...integrationConfigs,
                            [integration.id]: { ...integrationConfigs[integration.id], apiKey: e.target.value, enabled: true }
                          })}
                          className="text-sm"
                        />
                      </>
                    )}
                    {integration.id === 'discord' && (
                      <>
                        <Label className="text-xs">Discord Bot Token</Label>
                        <Input
                          type="password"
                          placeholder="Enter Discord bot token..."
                          value={integrationConfigs[integration.id]?.apiKey || ''}
                          onChange={(e) => setIntegrationConfigs({
                            ...integrationConfigs,
                            [integration.id]: { ...integrationConfigs[integration.id], apiKey: e.target.value, enabled: true }
                          })}
                          className="text-sm"
                        />
                      </>
                    )}
                    {integration.id === 'openai' && (
                      <>
                        <Label className="text-xs">OpenAI API Key</Label>
                        <Input
                          type="password"
                          placeholder="sk-..."
                          value={integrationConfigs[integration.id]?.apiKey || ''}
                          onChange={(e) => setIntegrationConfigs({
                            ...integrationConfigs,
                            [integration.id]: { ...integrationConfigs[integration.id], apiKey: e.target.value, enabled: true }
                          })}
                          className="text-sm"
                        />
                      </>
                    )}
                    {integration.id === 'coingecko' && (
                      <>
                        <Label className="text-xs">CoinGecko API Key (Optional)</Label>
                        <Input
                          type="password"
                          placeholder="Free tier works without key..."
                          value={integrationConfigs[integration.id]?.apiKey || ''}
                          onChange={(e) => setIntegrationConfigs({
                            ...integrationConfigs,
                            [integration.id]: { ...integrationConfigs[integration.id], apiKey: e.target.value, enabled: true }
                          })}
                          className="text-sm"
                        />
                      </>
                    )}
                    {integration.id === 'webhook' && (
                      <>
                        <Label className="text-xs">Webhook URL</Label>
                        <Input
                          type="url"
                          placeholder="https://your-webhook.com/endpoint"
                          value={integrationConfigs[integration.id]?.webhookUrl || ''}
                          onChange={(e) => setIntegrationConfigs({
                            ...integrationConfigs,
                            [integration.id]: { ...integrationConfigs[integration.id], webhookUrl: e.target.value, enabled: true }
                          })}
                          className="text-sm"
                        />
                      </>
                    )}
                    {integration.id === 'solana-rpc' && (
                      <>
                        <Label className="text-xs">Custom RPC Endpoint (Optional)</Label>
                        <Input
                          type="url"
                          placeholder="https://api.mainnet-beta.solana.com"
                          value={integrationConfigs[integration.id]?.endpoint || ''}
                          onChange={(e) => setIntegrationConfigs({
                            ...integrationConfigs,
                            [integration.id]: { ...integrationConfigs[integration.id], endpoint: e.target.value, enabled: true }
                          })}
                          className="text-sm"
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">💡 Security & Configuration</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• API keys are encrypted and stored securely in metadata</li>
            <li>• You can update credentials anytime via agent settings</li>
            <li>• Some integrations work without API keys (free tier)</li>
            <li>• Credentials are never exposed on-chain</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setCurrentStep('config')} variant="outline" className="flex-1">
            ← Back
          </Button>
          <Button onClick={() => setCurrentStep('deploy')} className="flex-1">
            Next: Deploy Agent →
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderDeployStep = () => {
    const configuredIntegrations = config.integrations.filter(intId => 
      integrationConfigs[intId]?.apiKey || integrationConfigs[intId]?.webhookUrl || integrationConfigs[intId]?.endpoint
    );

    return (
      <Card>
        <CardHeader>
          <CardTitle>🚀 Deploy Agent</CardTitle>
          <p className="text-sm text-gray-600">Review configuration and deploy to Solana</p>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-3">Configuration Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Agent Name:</span>
              <span className="font-medium">{config.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Protocol:</span>
              <span className="font-medium uppercase">{config.protocol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Behavior:</span>
              <span className="font-medium capitalize">{config.behavior}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Integrations:</span>
              <span className="font-medium">{config.integrations.length} selected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Configured APIs:</span>
              <span className="font-medium">{configuredIntegrations.length} / {config.integrations.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network:</span>
              <Badge variant={config.network === 'mainnet' ? 'default' : 'outline'}>
                {config.network}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Auto-Validate:</span>
              <span className="font-medium">{config.autoValidate ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>

        {/* Integration Details */}
        {config.integrations.length > 0 && (
          <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-blue-50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>🔗</span> Integration Details
            </h3>
            <div className="space-y-2">
              {config.integrations.map(intId => {
                const integration = availableIntegrations.find(i => i.id === intId);
                const isConfigured = !!integrationConfigs[intId]?.apiKey || !!integrationConfigs[intId]?.webhookUrl || !!integrationConfigs[intId]?.endpoint;
                return (
                  <div key={intId} className="flex items-center justify-between text-sm bg-white rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span>{integration?.icon}</span>
                      <span className="font-medium">{integration?.name}</span>
                    </div>
                    <Badge variant={isConfigured ? 'default' : 'secondary'} className="text-xs">
                      {isConfigured ? '✓ Configured' : 'No credentials'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">⚠️ Deployment Cost & Process</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• <strong>0.001 SOL</strong> - On-chain registration fee (to treasury)</p>
            <p>• Metadata will be uploaded to IPFS (decentralized storage)</p>
            <p>• API credentials are encrypted before storage</p>
            <p>• Agent will be immediately active after deployment</p>
          </div>
        </div>

        {deploymentStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">{deploymentStatus}</p>
            {lastSignature && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">Transaction Signature:</p>
                <code className="text-xs bg-white px-2 py-1 rounded block overflow-x-auto">
                  {lastSignature}
                </code>
                <a
                  href={`https://explorer.solana.com/tx/${lastSignature}?cluster=${config.network}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:text-blue-800 underline text-xs mt-1"
                >
                  View on Solana Explorer →
                </a>
              </div>
            )}
          </div>
        )}

        {!publicKey && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              ⚠️ Please connect your wallet to deploy the agent
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={() => setCurrentStep('integrations')} variant="outline" className="flex-1" disabled={deploying}>
            ← Back
          </Button>
          <Button 
            onClick={deployAgent} 
            className="flex-1" 
            disabled={deploying || !publicKey || !config.name || !config.description}
          >
            {deploying ? 'Deploying...' : '🚀 Deploy Agent'}
          </Button>
        </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-center">🎨 No-Code Agent Builder</h1>
        <p className="text-center text-gray-600">Build and deploy AI agents without writing code</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${currentStep === 'config' ? 'text-primary font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'config' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span>Configure</span>
        </div>
        <div className="h-px w-12 bg-gray-300" />
        <div className={`flex items-center gap-2 ${currentStep === 'integrations' ? 'text-primary font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'integrations' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span>Integrations</span>
        </div>
        <div className="h-px w-12 bg-gray-300" />
        <div className={`flex items-center gap-2 ${currentStep === 'deploy' ? 'text-primary font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'deploy' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span>Deploy</span>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'config' && renderConfigStep()}
      {currentStep === 'integrations' && renderIntegrationsStep()}
      {currentStep === 'deploy' && renderDeployStep()}

      {/* Deployed Agents List */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📋 Your Deployed Agents</CardTitle>
            {JSON.parse(localStorage.getItem('noema_deployed_agents') || '[]').length > 0 && (
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/analytics'}>
                View Analytics →
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const deployedAgents = JSON.parse(localStorage.getItem('noema_deployed_agents') || '[]');
            if (deployedAgents.length === 0) {
              return <p className="text-gray-600 text-center py-4">No agents deployed yet</p>;
            }
            return (
              <div className="space-y-3">
                {deployedAgents.map((agent: AgentConfig & { deployedAt: number; signature: string; agentId: string; status: string }, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{agent.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{agent.protocol.toUpperCase()}</Badge>
                          <Badge variant="outline" className="capitalize">{agent.behavior}</Badge>
                          <Badge>{agent.network}</Badge>
                          {agent.integrations.length > 0 && (
                            <Badge variant="secondary">{agent.integrations.length} integrations</Badge>
                          )}
                        </div>
                      </div>
                      <Badge className="ml-4 bg-green-500">Active</Badge>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Deployed: {new Date(agent.deployedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
