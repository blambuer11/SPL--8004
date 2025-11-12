import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { useX402 } from '@/hooks/useX402';
import { useMessages } from '@/contexts/MessageContext';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MessageSquare, Star, Zap, TrendingUp, CheckCircle, XCircle, Clock, Users, DollarSign, Sparkles } from 'lucide-react';

interface Agent {
  agentId: string;
  owner: string;
  metadataUri: string;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
  reputation?: {
    score: number;
    totalTasks: number;
    successfulTasks: number;
    failedTasks: number;
  };
}

interface Message {
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

export default function AgentDetails() {
  const { agentId } = useParams<{ agentId: string }>();
  const { connected } = useWallet();
  const { client } = useSPL8004();
  const { instantPayment, instantPaymentLoading } = useX402();
  const { addMessage, getConversation } = useMessages();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageContent, setMessageContent] = useState('');
  const [showMessages, setShowMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [targetAgent, setTargetAgent] = useState<string>('user');
  const [messageMode, setMessageMode] = useState<'user' | 'agent'>('user');
  const [showRentDialog, setShowRentDialog] = useState(false);
  const [rentPrice, setRentPrice] = useState('');
  const [rentDuration, setRentDuration] = useState('hour');

  const handleRentOut = () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }
    setShowRentDialog(true);
  };

  const confirmRentOut = () => {
    const price = parseFloat(rentPrice);
    if (!price || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    // Save to localStorage for marketplace
    const marketplaceAgents = JSON.parse(localStorage.getItem('marketplaceAgents') || '[]');
    const newListing = {
      agentId: agent?.agentId,
      owner: agent?.owner,
      price: price,
      duration: rentDuration,
      reputation: agent?.reputation?.score || 5000,
      successRate: agent?.reputation ? ((agent.reputation.successfulTasks / agent.reputation.totalTasks) * 100).toFixed(1) : '0.0',
      listedAt: Date.now()
    };
    
    marketplaceAgents.push(newListing);
    localStorage.setItem('marketplaceAgents', JSON.stringify(marketplaceAgents));
    
    toast.success('Agent listed in marketplace!', {
      description: `${agent?.agentId} is now available for ${price} USDC/${rentDuration}`,
      action: {
        label: 'View Marketplace',
        onClick: () => window.location.href = '/app/marketplace'
      }
    });
    
    setShowRentDialog(false);
    setRentPrice('');
  };

  useEffect(() => {
    async function loadAgent() {
      if (!client || !agentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading agent:', agentId);
        const userAgents = await client.getAllUserAgents();
        const foundAgent = userAgents.find(a => a.agentId === agentId);
        
        if (foundAgent) {
          setAgent(foundAgent);
          // Load all other agents for agent-to-agent messaging
          setAllAgents(userAgents.filter(a => a.agentId !== agentId && a.isActive));
        } else {
          toast.error('Agent not found');
        }
      } catch (error) {
        console.error('Failed to load agent:', error);
        toast.error('Failed to load agent');
      } finally {
        setLoading(false);
      }
    }

    loadAgent();
  }, [client, agentId]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSendingMessage(true);
    
    if (messageMode === 'user') {
      // User to Agent messaging
      addMessage({
        from: 'user',
        to: agent?.agentId || '',
        content: messageContent,
      });
      
      // Simulate agent auto-reply
      setTimeout(() => {
        addMessage({
          from: agent?.agentId || '',
          to: 'user',
          content: `Received: "${messageContent.substring(0, 30)}..." - Processing your request. I'll analyze this and get back to you shortly.`,
        });
        toast.success('Message sent', {
          description: `Agent ${agent?.agentId} will respond shortly`
        });
      }, 2000);

      toast.info('Message sent via SPL-ACP', {
        description: `To: ${agent?.agentId}`
      });
    } else {
      // Agent to Agent messaging
      if (!targetAgent || targetAgent === agent?.agentId) {
        toast.error('Please select a different agent');
        setSendingMessage(false);
        return;
      }

      addMessage({
        from: agent?.agentId || '',
        to: targetAgent,
        content: messageContent,
      });

      // Simulate target agent auto-reply
      setTimeout(() => {
        addMessage({
          from: targetAgent,
          to: agent?.agentId || '',
          content: `[${targetAgent}] Acknowledged message: "${messageContent.substring(0, 25)}..." - Coordinating response...`,
        });
        toast.success('Agent-to-Agent message sent', {
          description: `${agent?.agentId} → ${targetAgent}`
        });
      }, 2500);

      toast.info('Cross-Agent Communication via SPL-ACP', {
        description: `${agent?.agentId} → ${targetAgent}`
      });
    }
    
    setMessageContent('');
    setSendingMessage(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 text-slate-200">
        <Link to="/app/agents" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </Link>
        <div className="p-8 rounded-lg bg-white/5 border border-white/10 text-center">
          <p className="text-slate-400">Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="space-y-6 text-slate-200">
        <Link to="/app/agents" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </Link>
        <div className="p-8 rounded-lg bg-white/5 border border-white/10 text-center">
          <p className="text-slate-400">Agent not found</p>
        </div>
      </div>
    );
  }

  const successRate = agent.reputation 
    ? ((agent.reputation.successfulTasks / agent.reputation.totalTasks) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/app/agents" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant={agent.isActive ? 'default' : 'destructive'}>
            {agent.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Button 
            onClick={handleRentOut}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Rent Out
          </Button>
        </div>
      </div>

      {/* Rent Dialog */}
      {showRentDialog && (
        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              List Agent in Marketplace
            </CardTitle>
            <CardDescription className="text-slate-200">
              Set rental price and duration for {agent.agentId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Price (USDC)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rentPrice}
                  onChange={(e) => setRentPrice(e.target.value)}
                  placeholder="10.00"
                  className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/30 rounded-lg text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Duration</label>
                <Select value={rentDuration} onValueChange={setRentDuration}>
                  <SelectTrigger className="bg-slate-800/60 border-slate-600/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="hour">Per Hour</SelectItem>
                    <SelectItem value="day">Per Day</SelectItem>
                    <SelectItem value="week">Per Week</SelectItem>
                    <SelectItem value="month">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={confirmRentOut}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Confirm Listing
              </Button>
              <Button 
                onClick={() => setShowRentDialog(false)}
                variant="outline"
                className="flex-1 border-slate-600/30 text-slate-300 hover:bg-slate-800/60"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Info */}
      <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/30">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl text-white">{agent.agentId}</CardTitle>
              <CardDescription className="text-slate-200 mt-2">
                Owner: {agent.owner.slice(0, 8)}...{agent.owner.slice(-8)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-amber-500/30 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span className="font-bold text-amber-200">{agent.reputation?.score || 5000}</span>
              </div>
              <Button
                disabled={instantPaymentLoading}
                onClick={async () => {
                  try {
                    const reward = ((agent.reputation?.score ?? 5000) * 0.001);
                    const res = await instantPayment(
                      new PublicKey(agent.agentId), 
                      reward, 
                      `Reward claim for ${agent.agentId}`
                    );
                    toast.success('Reward claimed!', { 
                      description: `${(res.netAmount / 1e6).toFixed(3)} USDC sent • ${res.signature.substring(0, 8)}…` 
                    });
                    // Reload agent data
                    if (client) {
                      const userAgents = await client.getAllUserAgents();
                      const updated = userAgents.find(a => a.agentId === agentId);
                      if (updated) setAgent(updated);
                    }
                  } catch (e: any) {
                    toast.error('Claim failed: ' + (e.message || 'Unknown error'));
                  }
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                {instantPaymentLoading ? 'Claiming...' : 'Claim Reward'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-300">Total Tasks</span>
              </div>
              <p className="text-2xl font-bold text-white">{agent.reputation?.totalTasks || 0}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-300">Successful</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{agent.reputation?.successfulTasks || 0}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-slate-300">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{agent.reputation?.failedTasks || 0}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-300">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{successRate}%</p>
            </div>
          </div>

          {agent.metadataUri && (
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-600/20">
              <p className="text-xs text-slate-300 mb-1">Metadata URI</p>
              <p className="text-sm text-slate-200 font-mono break-all">{agent.metadataUri}</p>
            </div>
          )}

          {agent.createdAt && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Created: {new Date(agent.createdAt * 1000).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication Section */}
      <Card className="bg-slate-900/40 border-slate-600/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5" />
            Agent Communication (SPL-ACP)
          </CardTitle>
          <CardDescription className="text-slate-300">
            Send messages to this agent or enable agent-to-agent communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message Mode Selector */}
          <div className="flex gap-2 p-1 rounded-lg bg-slate-800/60 border border-slate-600/30">
            <Button
              variant={messageMode === 'user' ? 'default' : 'ghost'}
              onClick={() => setMessageMode('user')}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              User → Agent
            </Button>
            <Button
              variant={messageMode === 'agent' ? 'default' : 'ghost'}
              onClick={() => setMessageMode('agent')}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Agent → Agent
            </Button>
          </div>

          {/* Agent Selection (for agent-to-agent mode) */}
          {messageMode === 'agent' && (
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">Target Agent</label>
              <Select value={targetAgent} onValueChange={setTargetAgent}>
                <SelectTrigger className="bg-slate-800/60 border-slate-600/30 text-white">
                  <SelectValue placeholder="Select an agent to communicate with" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {allAgents.length === 0 ? (
                    <SelectItem value="none" disabled>No other active agents available</SelectItem>
                  ) : (
                    allAgents.map((a) => (
                      <SelectItem key={a.agentId} value={a.agentId} className="text-white">
                        {a.agentId} (Reputation: {a.reputation?.score ?? 5000})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">
                💡 Example: Drone agent communicating with Home Robot agent for coordinated tasks
              </p>
            </div>
          )}

          {/* Message Input */}
          <div className="space-y-3">
            <Textarea
              placeholder={
                messageMode === 'user'
                  ? 'Enter your message to the agent...'
                  : 'Enter message for agent-to-agent communication...'
              }
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="bg-slate-800/60 border-slate-600/30 text-white placeholder:text-slate-400 min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendingMessage || !connected}
                className="flex-1"
              >
                {sendingMessage ? 'Sending...' : messageMode === 'user' ? 'Send to Agent' : 'Send via ACP'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMessages(!showMessages)}
                className="bg-slate-700/60 border-slate-600/30 text-white hover:bg-slate-700"
              >
                {showMessages ? 'Hide' : 'Show'} Messages ({getConversation(agent?.agentId || '', messageMode === 'user' ? 'user' : targetAgent).length})
              </Button>
            </div>
          </div>

          {/* Message History */}
          {showMessages && (
            <div className="space-y-2 max-h-96 overflow-y-auto p-4 rounded-lg bg-slate-950/60 border border-slate-600/30">
              <h3 className="font-semibold text-slate-200 mb-3">
                Message History {messageMode === 'agent' && `(${agent?.agentId} ↔ ${targetAgent})`}
              </h3>
              {getConversation(agent?.agentId || '', messageMode === 'user' ? 'user' : targetAgent).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No messages yet. Send a message to start!</p>
              ) : (
                getConversation(agent?.agentId || '', messageMode === 'user' ? 'user' : targetAgent).map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.from === 'user' || msg.from === agent?.agentId
                        ? 'bg-blue-900/40 border border-blue-600/30 ml-8'
                        : 'bg-green-900/40 border border-green-600/30 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-200">
                        {msg.from === 'user' ? '📤 You' : msg.from === agent?.agentId ? `📤 ${msg.from}` : `📥 ${msg.from}`}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-100">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SPL-ACP Info */}
          <div className="p-4 rounded-lg bg-purple-900/30 border border-purple-600/30">
            <h4 className="text-sm font-semibold text-purple-200 mb-2">About SPL-ACP</h4>
            <p className="text-xs text-slate-300 mb-2">
              Agent Communication Protocol enables direct messaging between agents and users.
              Messages are routed through program ID: <span className="font-mono text-purple-200">FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK</span>
            </p>
            {messageMode === 'agent' && (
              <div className="mt-3 p-3 rounded bg-blue-900/30 border border-blue-600/20">
                <p className="text-xs text-blue-200 font-semibold mb-1">🤖 Agent-to-Agent Communication</p>
                <p className="text-xs text-slate-300">
                  Example: A drone surveillance agent can send location data to a home security robot agent,
                  enabling coordinated autonomous operations across your agent network.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
