import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

interface AgentMetrics {
  agentId: string;
  name: string;
  validations: number;
  successRate: number;
  reputationScore: number;
  totalRewards: number;
  uptime: number;
  lastActive: number;
}

interface DeployedAgent {
  agentId: string;
  name: string;
  status: string;
  protocol: string;
  integrations?: string[];
  deployedAt: number;
}

export default function AgentAnalytics() {
  const [agents, setAgents] = useState<DeployedAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);

  useEffect(() => {
    const deployedAgents = JSON.parse(localStorage.getItem('noema_deployed_agents') || '[]');
    setAgents(deployedAgents);
    if (deployedAgents.length > 0 && !selectedAgent) {
      setSelectedAgent(deployedAgents[0].agentId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      // Simulate fetching metrics
      const mockMetrics: AgentMetrics = {
        agentId: selectedAgent,
        name: agents.find(a => a.agentId === selectedAgent)?.name || 'Unknown',
        validations: Math.floor(Math.random() * 1000),
        successRate: 85 + Math.random() * 15,
        reputationScore: 80 + Math.random() * 20,
        totalRewards: Math.random() * 10,
        uptime: 95 + Math.random() * 5,
        lastActive: Date.now() - Math.random() * 3600000,
      };
      setMetrics(mockMetrics);
    }
  }, [selectedAgent, agents]);

  if (agents.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No agents deployed yet</p>
            <Button onClick={() => window.location.href = '/no-code-builder'}>
              Deploy Your First Agent
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-2 text-center">📊 Agent Analytics</h1>
      <p className="text-center text-gray-600 mb-8">Monitor your deployed agents in real-time</p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {agents.map((agent) => (
          <Card
            key={agent.agentId}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedAgent === agent.agentId ? 'border-primary border-2' : ''
            }`}
            onClick={() => setSelectedAgent(agent.agentId)}
          >
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">{agent.name}</h3>
              <Badge className="bg-green-500">{agent.status}</Badge>
              <p className="text-xs text-gray-600 mt-2">{agent.protocol.toUpperCase()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {metrics && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Validations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics.validations}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics.successRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Reputation Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics.reputationScore.toFixed(0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics.totalRewards.toFixed(3)} SOL</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="activity">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="font-semibold">{metrics.uptime.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${metrics.uptime}%` }}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">Last Active</p>
                    <p className="font-semibold">
                      {new Date(metrics.lastActive).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Recent Activity</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Validated transaction #3821</span>
                        <span className="text-gray-600">2 min ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reputation score increased</span>
                        <span className="text-gray-600">15 min ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rewards claimed: 0.05 SOL</span>
                        <span className="text-gray-600">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
                      <p className="text-2xl font-bold">245ms</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Error Rate</p>
                      <p className="text-2xl font-bold">0.3%</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                      <p className="text-2xl font-bold">12,543</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Concurrent Tasks</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="integrations" className="space-y-4 pt-4">
                  <p className="text-sm text-gray-600">Active integrations for this agent:</p>
                  <div className="space-y-2">
                    {agents.find(a => a.agentId === selectedAgent)?.integrations?.map((intId: string) => (
                      <div key={intId} className="flex items-center justify-between border rounded-lg p-3">
                        <span className="font-medium capitalize">{intId}</span>
                        <Badge className="bg-green-500">Connected</Badge>
                      </div>
                    )) || <p className="text-gray-600">No integrations configured</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
