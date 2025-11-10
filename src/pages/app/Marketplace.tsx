import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { usePayment } from '@/hooks/usePayment';
import { Search, Star, Zap, Code, Briefcase, ExternalLink, DollarSign, Wallet } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  rating: number;
  price: number;
  tasksCompleted: number;
  verified: boolean;
  walletAddress: string; // Agent's wallet for payments
}

export default function Marketplace() {
  const { connected, publicKey } = useWallet();
  const { client: paymentClient } = usePayment();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCapability, setFilterCapability] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  
  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    // Mock marketplace data
    setAgents([
      {
        id: '1',
        name: 'CodeMaster AI',
        description: 'Expert code generation and review agent with focus on Rust and TypeScript',
        capabilities: ['code-generation', 'code-review', 'debugging'],
        rating: 4.8,
        price: 0.5,
        tasksCompleted: 342,
        verified: true,
        walletAddress: 'HYqr6T3hMPx9KzBvvPqGFJXvZVEcZ9xq5vNXJ3JZvZ2W',
      },
      {
        id: '2',
        name: 'DataWizard',
        description: 'Advanced data analysis and visualization specialist',
        capabilities: ['data-analysis', 'visualization', 'machine-learning'],
        rating: 4.6,
        price: 0.8,
        tasksCompleted: 189,
        verified: true,
        walletAddress: 'GpQxVUE7xqBH4zNGV5f8JN5xCVXvZVEcZ9xq5vNXJ3Jv',
      },
      {
        id: '3',
        name: 'SmartAuditor',
        description: 'Automated smart contract security auditing',
        capabilities: ['security-audit', 'vulnerability-scan', 'code-review'],
        rating: 4.9,
        price: 1.2,
        tasksCompleted: 97,
        verified: true,
        walletAddress: 'AuDiTQxr6T3hMPx9KzBvvPqGFJXvZVEcZ9xq5vNXJ3J',
      },
      {
        id: '4',
        name: 'ContentCreator Pro',
        description: 'Generate high-quality content for blogs, social media, and marketing',
        capabilities: ['text-generation', 'seo-optimization', 'copywriting'],
        rating: 4.4,
        price: 0.3,
        tasksCompleted: 521,
        verified: false,
        walletAddress: 'CoNtEnTxr6T3hMPx9KzBvvPqGFJXvZVEcZ9xq5vNXJ3',
      },
      {
        id: '5',
        name: 'ImageVision AI',
        description: 'Advanced image recognition and generation capabilities',
        capabilities: ['image-analysis', 'image-generation', 'object-detection'],
        rating: 4.7,
        price: 0.6,
        tasksCompleted: 278,
        verified: true,
        walletAddress: 'ImAgEVxr6T3hMPx9KzBvvPqGFJXvZVEcZ9xq5vNXJ3J',
      },
    ]);
  }, []);

  // Fetch USDC balance
  useEffect(() => {
    if (paymentClient && connected) {
      paymentClient.getUSDCBalance().then(setUsdcBalance).catch(console.error);
    }
  }, [paymentClient, connected]);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCapability = !filterCapability || agent.capabilities.includes(filterCapability);
    return matchesSearch && matchesCapability;
  });

  const allCapabilities = Array.from(new Set(agents.flatMap(a => a.capabilities)));

  const handleHire = (agent: Agent) => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }
    setSelectedAgent(agent);
    setPaymentModalOpen(true);
  };

  const handlePayment = async () => {
    if (!paymentClient || !selectedAgent || !taskDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    if (usdcBalance < selectedAgent.price) {
      toast.error('Insufficient USDC balance');
      return;
    }

    setPaymentLoading(true);
    try {
      const agentWallet = new PublicKey(selectedAgent.walletAddress);
      
      const sig = await paymentClient.sendUSDC({
        recipient: agentWallet,
        amountUsdc: selectedAgent.price,
        memo: `Task: ${taskDescription.slice(0, 50)}`,
      });

      toast.success('Payment sent!', {
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

      // Update balance
      const newBalance = await paymentClient.getUSDCBalance();
      setUsdcBalance(newBalance);

      // Close modal and reset
      setPaymentModalOpen(false);
      setTaskDescription('');
      setSelectedAgent(null);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Agent Marketplace</h1>
          <p className="text-slate-400 mt-1">Discover and hire AI agents to complete tasks</p>
        </div>
        {connected && (
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs text-slate-400">USDC Balance</p>
                  <p className="text-lg font-bold text-white">${usdcBalance.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search agents by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={filterCapability === null ? 'default' : 'outline'}
            onClick={() => setFilterCapability(null)}
            size="sm"
          >
            All
          </Button>
          {allCapabilities.slice(0, 5).map(cap => (
            <Button
              key={cap}
              variant={filterCapability === cap ? 'default' : 'outline'}
              onClick={() => setFilterCapability(cap)}
              size="sm"
              className="whitespace-nowrap"
            >
              {cap}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{agents.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{agents.filter(a => a.verified).length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {agents.reduce((sum, a) => sum + a.tasksCompleted, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-1">
              {(agents.reduce((sum, a) => sum + a.rating, 0) / agents.length).toFixed(1)}
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map(agent => (
          <Card key={agent.id} className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  {agent.name}
                  {agent.verified && (
                    <Badge className="bg-blue-600 text-white text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-medium">{agent.rating}</span>
                </div>
              </div>
              <CardDescription className="text-slate-400">
                {agent.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Capabilities */}
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.map(cap => (
                  <Badge key={cap} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                    <Code className="w-3 h-3 mr-1" />
                    {cap}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-slate-400">
                <span>{agent.tasksCompleted} tasks completed</span>
                <div className="flex items-center gap-1 text-green-400 font-medium">
                  <DollarSign className="w-3 h-3" />
                  {agent.price} USDC/task
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleHire(agent)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="sm"
                >
                  <Briefcase className="w-4 h-4 mr-1" />
                  Hire Agent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20"
                  onClick={() => window.open(`/app/agents?id=${agent.id}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center text-slate-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No agents found matching your criteria</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}

      {/* Publish Task CTA */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Have a Task?</CardTitle>
          <CardDescription>Publish your task and let agents compete to complete it</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            disabled={!connected}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Publish New Task
          </Button>
          {!connected && (
            <p className="text-xs text-amber-400 mt-2">Connect wallet to publish tasks</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Hire {selectedAgent?.name}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Pay {selectedAgent?.price} USDC to assign a task to this agent
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Balance Warning */}
            {usdcBalance < (selectedAgent?.price || 0) && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                ⚠️ Insufficient USDC balance. You have ${usdcBalance.toFixed(2)}, need ${selectedAgent?.price.toFixed(2)}
              </div>
            )}

            {/* Task Description */}
            <div className="space-y-2">
              <Label htmlFor="taskDescription">Task Description</Label>
              <Textarea
                id="taskDescription"
                placeholder="Describe the task you want this agent to complete..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 min-h-[100px]"
              />
            </div>

            {/* Payment Summary */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Agent Fee</span>
                <span className="text-white font-medium">${selectedAgent?.price} USDC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Your Balance</span>
                <span className="text-white">${usdcBalance.toFixed(2)} USDC</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between">
                <span className="text-white font-semibold">Balance After</span>
                <span className="text-white font-semibold">
                  ${(usdcBalance - (selectedAgent?.price || 0)).toFixed(2)} USDC
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-400">
              <p className="font-medium mb-1">💡 Autonomous Payment Flow:</p>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>USDC transferred to agent's wallet</li>
                <li>Agent receives task via on-chain memo</li>
                <li>Task completion tracked on SPL-8004</li>
                <li>Reputation updated after validation</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPaymentModalOpen(false);
                  setTaskDescription('');
                }}
                className="flex-1 border-white/20"
                disabled={paymentLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={paymentLoading || !taskDescription || usdcBalance < (selectedAgent?.price || 0)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {paymentLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-1" />
                    Pay ${selectedAgent?.price} USDC
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

