import { useState } from 'react';
import { Copy, Check, Code, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function API() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(label);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const API_BASE = 'https://api.noemaprotocol.xyz';

  const endpoints = [
    {
      title: 'Health Check',
      method: 'GET',
      path: '/api/health',
      description: 'Check API status and available endpoints',
      example: `curl ${API_BASE}/api/health`,
      response: {
        status: 'ok',
        endpoints: ['/api/health', '/api/solana', '/api/x402/payment']
      }
    },
    {
      title: 'Solana RPC Proxy',
      method: 'POST',
      path: '/api/solana',
      description: 'Proxy requests to Solana RPC with rate limiting',
      example: `curl -X POST ${API_BASE}/api/solana \\
  -H "Content-Type: application/json" \\
  -d '{"method":"getBalance","params":["YOUR_WALLET_ADDRESS"]}'`,
      response: {
        result: { value: 1000000000 }
      }
    },
    {
      title: 'X402 Instant Payment',
      method: 'POST',
      path: '/api/x402/payment',
      description: 'Process autonomous agent payments via X402 protocol',
      example: `curl -X POST ${API_BASE}/api/x402/payment \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "your-agent-id",
    "amount": 0.1,
    "recipientAddress": "WALLET_ADDRESS",
    "metadata": "Payment for task completion"
  }'`,
      response: {
        success: true,
        signature: '5kF7...',
        explorer: 'https://explorer.solana.com/tx/5kF7...'
      }
    },
    {
      title: 'X402 Claim Rewards',
      method: 'POST',
      path: '/api/x402/claim',
      description: 'Claim accumulated X402 rewards for an agent',
      example: `curl -X POST ${API_BASE}/api/x402/claim \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "your-agent-id",
    "ownerWallet": "OWNER_WALLET_ADDRESS"
  }'`,
      response: {
        success: true,
        amount: 1.5,
        signature: '3hK9...'
      }
    },
    {
      title: 'Agent Registration',
      method: 'POST',
      path: '/api/agents/register',
      description: 'Register a new AI agent on SPL-8004',
      example: `curl -X POST ${API_BASE}/api/agents/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "my-agent-001",
    "metadataUri": "https://metadata.uri/agent.json",
    "ownerWallet": "OWNER_WALLET_ADDRESS"
  }'`,
      response: {
        success: true,
        agentAddress: 'Agent123...',
        signature: '2gH8...'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      {/* Hero Section */}
      <div className="relative border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200">
              <Globe className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Noema Protocol API</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-slate-900">
              Developer API
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Build on Solana
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              RESTful API for AI agent infrastructure, payments, and blockchain interactions
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-slate-900 hover:bg-slate-800"
                onClick={() => window.location.href = '#endpoints'}
              >
                <Code className="mr-2 h-5 w-5" />
                View Endpoints
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open('https://github.com/blambuer11/SPL--8004', '_blank')}
              >
                <Shield className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-slate-200 hover:border-purple-300 transition-all hover:shadow-lg">
            <CardHeader>
              <Zap className="w-10 h-10 text-purple-600 mb-2" />
              <CardTitle>High Performance</CardTitle>
              <CardDescription>
                Fast, reliable API with built-in rate limiting and caching
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg">
            <CardHeader>
              <Shield className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Secure by Default</CardTitle>
              <CardDescription>
                CORS protection, request validation, and secure RPC proxying
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 hover:border-green-300 transition-all hover:shadow-lg">
            <CardHeader>
              <Code className="w-10 h-10 text-green-600 mb-2" />
              <CardTitle>Developer Friendly</CardTitle>
              <CardDescription>
                Simple REST endpoints with clear documentation and examples
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Base URL */}
        <Card className="mb-8 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300">
          <CardHeader>
            <CardTitle className="text-lg">Base URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-slate-200">
              <code className="text-lg font-mono text-slate-900">{API_BASE}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(API_BASE, 'base-url')}
              >
                {copiedEndpoint === 'base-url' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div id="endpoints" className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">API Endpoints</h2>

          {endpoints.map((endpoint, index) => (
            <Card key={index} className="border-slate-200 hover:border-purple-300 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold ${
                        endpoint.method === 'GET' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono text-slate-700">{endpoint.path}</code>
                    </div>
                    <CardTitle className="text-xl">{endpoint.title}</CardTitle>
                    <CardDescription className="text-base">
                      {endpoint.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="curl" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="response">Response</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="curl" className="space-y-2">
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm">{endpoint.example}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 text-slate-300 hover:text-white"
                        onClick={() => copyToClipboard(endpoint.example, `curl-${index}`)}
                      >
                        {copiedEndpoint === `curl-${index}` ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="response" className="space-y-2">
                    <pre className="bg-slate-100 text-slate-900 p-4 rounded-lg overflow-x-auto border border-slate-200">
                      <code className="text-sm">{JSON.stringify(endpoint.response, null, 2)}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rate Limiting Info */}
        <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              Rate Limiting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>
              • <strong>Default:</strong> 100 requests per minute per IP
            </p>
            <p>
              • <strong>Authenticated:</strong> Contact us for higher limits
            </p>
            <p>
              • Rate limit headers included in all responses
            </p>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">
              For support, feature requests, or bug reports:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline"
                onClick={() => window.open('https://github.com/blambuer11/SPL--8004/issues', '_blank')}
              >
                GitHub Issues
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('/documentation', '_self')}
              >
                Full Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
