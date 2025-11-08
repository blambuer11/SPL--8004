import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Coins, Zap, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NoCodeTool() {
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  
  const [paymentAmount, setPaymentAmount] = useState('0.01');
  const [paymentRecipient, setPaymentRecipient] = useState('');
  const [paymentCode, setPaymentCode] = useState('');

  const generateAgentCode = () => {
    if (!agentName) {
      toast.error('Please enter an agent name');
      return;
    }

    const code = `import { createAgent } from '@spl-8004/sdk';

// Initialize your AI agent: ${agentName}
const ${agentName.toLowerCase().replace(/[^a-z0-9]/g, '')}Agent = await createAgent({
  privateKey: process.env.AGENT_PRIVATE_KEY,
  network: 'devnet',
  metadata: {
    name: '${agentName}',
    description: '${agentDescription || 'My autonomous AI agent'}',
  }
});

// Your agent is ready!
console.log('Agent ID:', ${agentName.toLowerCase().replace(/[^a-z0-9]/g, '')}Agent.id);
console.log('Agent Address:', ${agentName.toLowerCase().replace(/[^a-z0-9]/g, '')}Agent.address);

// Make automatic payments
const response = await ${agentName.toLowerCase().replace(/[^a-z0-9]/g, '')}Agent.fetch(
  'https://api.example.com/premium',
  { autoPay: true, maxPayment: 0.01 }
);

console.log('Data received:', response);`;

    setGeneratedCode(code);
    toast.success('Agent code generated!');
  };

  const generatePaymentCode = () => {
    if (!paymentRecipient || !paymentAmount) {
      toast.error('Please enter recipient and amount');
      return;
    }

    const code = `import { createAgent } from '@spl-8004/sdk';

// Initialize agent
const agent = await createAgent({
  privateKey: process.env.AGENT_PRIVATE_KEY,
  network: 'devnet'
});

// Send payment with X402
const payment = await agent.sendPayment({
  recipient: '${paymentRecipient}',
  amount: ${paymentAmount}, // USDC
  memo: 'Payment via SPL-8004'
});

console.log('Payment sent!');
console.log('Transaction:', payment.signature);
console.log('Explorer:', \`https://explorer.solana.com/tx/\${payment.signature}?cluster=devnet\`);`;

    setPaymentCode(code);
    toast.success('Payment code generated!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-700">No-Code Builder</Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Build Agents Without Coding
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Generate ready-to-use code for AI agents and X402 payments in seconds.
            No blockchain experience required.
          </p>
        </div>

        <Tabs defaultValue="agent" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="agent" className="text-lg">
              <Bot className="w-5 h-5 mr-2" />
              Create Agent
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-lg">
              <Coins className="w-5 h-5 mr-2" />
              X402 Payment
            </TabsTrigger>
          </TabsList>

          {/* Agent Builder */}
          <TabsContent value="agent" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-6 h-6" />
                    Agent Configuration
                  </CardTitle>
                  <CardDescription>Describe your AI agent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">Agent Name *</Label>
                    <Input
                      id="agent-name"
                      placeholder="e.g., TradingBot, DataCollector"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-desc">Description (optional)</Label>
                    <Input
                      id="agent-desc"
                      placeholder="What does this agent do?"
                      value={agentDescription}
                      onChange={(e) => setAgentDescription(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={generateAgentCode}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Agent Code
                  </Button>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      What you'll get:
                    </h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Agent initialization code</li>
                      <li>• Automatic payment setup</li>
                      <li>• Ready for Devnet testing</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated Code</CardTitle>
                  <CardDescription>Copy and use in your project</CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedCode ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                          {generatedCode}
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(generatedCode)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-green-900">Next Steps:</p>
                            <ol className="text-green-700 mt-1 space-y-1 list-decimal list-inside">
                              <li>Install SDK: <code className="bg-green-100 px-1 rounded">npm install @spl-8004/sdk</code></li>
                              <li>Set your private key in <code className="bg-green-100 px-1 rounded">.env</code></li>
                              <li>Run the code and test on Devnet</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Bot className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>Configure your agent and generate code</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Builder */}
          <TabsContent value="payment" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-6 h-6" />
                    Payment Configuration
                  </CardTitle>
                  <CardDescription>Set up X402 payment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Address *</Label>
                    <Input
                      id="recipient"
                      placeholder="Solana wallet address"
                      value={paymentRecipient}
                      onChange={(e) => setPaymentRecipient(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USDC) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={generatePaymentCode}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Payment Code
                  </Button>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm">
                    <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Features:
                    </h4>
                    <ul className="space-y-1 text-emerald-700">
                      <li>• X402 protocol integration</li>
                      <li>• Gasless transactions (Kora)</li>
                      <li>• Automatic signature handling</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated Code</CardTitle>
                  <CardDescription>Ready for production use</CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentCode ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                          {paymentCode}
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(paymentCode)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-blue-900">Payment Info:</p>
                            <ul className="text-blue-700 mt-1 space-y-1">
                              <li>• Amount: {paymentAmount} USDC</li>
                              <li>• Gas: 0 SOL (gasless via Kora)</li>
                              <li>• Network: Solana Devnet</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Coins className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>Configure payment and generate code</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-3">Need Help?</h3>
              <p className="text-slate-600 mb-4">
                Check out our documentation or join the community for support
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button variant="outline" asChild>
                  <a href="/docs">View Documentation</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://discord.gg/spl8004" target="_blank" rel="noopener noreferrer">Join Discord</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://github.com/spl-8004" target="_blank" rel="noopener noreferrer">GitHub Repo</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
