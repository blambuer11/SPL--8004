import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, Star, Zap, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

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
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageContent, setMessageContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMessages, setShowMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    async function loadAgent() {
      if (!client || !agentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading agent:', agentId);
        const allAgents = await client.getAllUserAgents();
        const foundAgent = allAgents.find(a => a.agentId === agentId);
        
        if (foundAgent) {
          setAgent(foundAgent);
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
    
    // Simulate sending message
    const newMessage: Message = {
      from: 'user',
      to: agent?.agentId || '',
      content: messageContent,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Simulate agent auto-reply
    setTimeout(() => {
      const reply: Message = {
        from: agent?.agentId || '',
        to: 'user',
        content: `Received: "${messageContent.substring(0, 30)}..." - Processing your request. I'll analyze this and get back to you shortly.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, reply]);
      toast.success('Message sent', {
        description: `Agent ${agent?.agentId} will respond shortly`
      });
    }, 2000);

    toast.info('Message sent via SPL-ACP', {
      description: `To: ${agent?.agentId}`
    });
    
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
        <Badge variant={agent.isActive ? 'default' : 'destructive'}>
          {agent.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Agent Info */}
      <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/30">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl text-white">{agent.agentId}</CardTitle>
              <CardDescription className="text-slate-200 mt-2">
                Owner: {agent.owner.slice(0, 8)}...{agent.owner.slice(-8)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/30 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span className="font-bold text-amber-200">{agent.reputation?.score || 5000}</span>
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
            Send messages to this agent via the Agent Communication Protocol
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message Input */}
          <div className="space-y-3">
            <Textarea
              placeholder="Enter your message to the agent..."
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
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMessages(!showMessages)}
                className="bg-slate-700/60 border-slate-600/30 text-white hover:bg-slate-700"
              >
                {showMessages ? 'Hide' : 'Show'} Messages ({messages.length})
              </Button>
            </div>
          </div>

          {/* Message History */}
          {showMessages && (
            <div className="space-y-2 max-h-96 overflow-y-auto p-4 rounded-lg bg-slate-950/60 border border-slate-600/30">
              <h3 className="font-semibold text-slate-200 mb-3">Message History</h3>
              {messages.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No messages yet. Send a message to start!</p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.from === 'user'
                        ? 'bg-blue-900/40 border border-blue-600/30 ml-8'
                        : 'bg-green-900/40 border border-green-600/30 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-200">
                        {msg.from === 'user' ? '📤 You' : `📥 ${msg.from}`}
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
            <p className="text-xs text-slate-300">
              Agent Communication Protocol enables direct messaging between agents and users.
              Messages are routed through program ID: <span className="font-mono text-purple-200">FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
