import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function Developer() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-2 text-center">👨‍💻 Developer Portal</h1>
      <p className="text-center text-gray-600 mb-8">Build on Noema Protocol with SDK, No-Code Tools, and Flexible Pricing</p>
      
      <Tabs defaultValue="sdk" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="sdk">SDK Integration</TabsTrigger>
          <TabsTrigger value="nocode">No-Code Builder</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
        </TabsList>

        {/* SDK Tab */}
        <TabsContent value="sdk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start: SDK Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal ml-6 space-y-4">
                <li>
                  <b>Install SDK:</b>
                  <pre className="bg-gray-100 rounded p-2 mt-1 overflow-x-auto">npm install @solana/web3.js @coral-xyz/anchor</pre>
                </li>
                <li>
                  <b>Use Protocol Functions:</b>
                  <pre className="bg-gray-100 rounded p-2 mt-1 overflow-x-auto">
{`import { useNOEMA8004 } from '../hooks/useNOEMA8004';

const { registerAgent } = useNOEMA8004();
await registerAgent({
  name: "GPT-Agent-001",
  metadataUri: "ipfs://QmExample..."
});`}
                  </pre>
                </li>
                <li>
                  <b>Query Agent:</b>
                  <pre className="bg-gray-100 rounded p-2 mt-1 overflow-x-auto">
{`const agent = await program.account.agent.fetch(agentPubkey);
console.log(agent);`}
                  </pre>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>REST API (Coming Q1 2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Currently, integration is available via frontend/SDK. REST API endpoints and Postman documentation will be added in Q1 2025.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-6 space-y-2">
                <li><a className="text-blue-600 underline hover:text-blue-800" href="https://agent-aura-sovereign.vercel.app/docs" target="_blank" rel="noopener noreferrer">Protocol Documentation</a></li>
                <li><a className="text-blue-600 underline hover:text-blue-800" href="https://github.com/blambuer11/NOEMA-8004" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
                <li><a className="text-blue-600 underline hover:text-blue-800" href="https://explorer.solana.com/address/G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW?cluster=devnet" target="_blank" rel="noopener noreferrer">NOEMA-8004 Explorer</a></li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* No-Code Tab */}
        <TabsContent value="nocode" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🚀 No-Code Agent Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Build and deploy AI agents without writing code. Perfect for non-technical teams.</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✨ Visual Builder</h3>
                  <p className="text-sm text-gray-600">Drag-and-drop interface to configure agent behavior</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🔗 Pre-built Integrations</h3>
                  <p className="text-sm text-gray-600">Connect to popular APIs with one click</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">📊 Analytics Dashboard</h3>
                  <p className="text-sm text-gray-600">Monitor agent performance in real-time</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">⚡ Instant Deploy</h3>
                  <p className="text-sm text-gray-600">Deploy to Solana devnet/mainnet with one click</p>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <a href="/no-code">Launch No-Code Builder →</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Free Tier</CardTitle>
                <p className="text-3xl font-bold mt-2">$0<span className="text-sm font-normal text-gray-600">/month</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✅ 1,000 API calls/month</li>
                  <li>✅ NOEMA-8004 only</li>
                  <li>✅ Community support</li>
                  <li>✅ Devnet access</li>
                </ul>
                <Button className="w-full" variant="outline">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <p className="text-3xl font-bold mt-2">$299<span className="text-sm font-normal text-gray-600">/month</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✅ 100K API calls/month</li>
                  <li>✅ All 4 protocols</li>
                  <li>✅ Priority support</li>
                  <li>✅ Mainnet access</li>
                  <li>✅ Analytics dashboard</li>
                </ul>
                <Button className="w-full">Upgrade to Pro</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <p className="text-3xl font-bold mt-2">Custom</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✅ Unlimited API calls</li>
                  <li>✅ Custom integrations</li>
                  <li>✅ Dedicated support</li>
                  <li>✅ SLA guarantee</li>
                  <li>✅ White-label options</li>
                </ul>
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pay-as-you-go REST API</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">No monthly commitment. Pay only for what you use.</p>
              <ul className="space-y-2">
                <li>💰 $0.001 per API call</li>
                <li>🌐 Any programming language</li>
                <li>📊 Real-time billing</li>
                <li>🔄 No setup fees</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
