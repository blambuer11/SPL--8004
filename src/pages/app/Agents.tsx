import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { useX402 } from '@/hooks/useX402';
import { useMessages } from '@/contexts/MessageContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Radio } from 'lucide-react';

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

export default function Agents() {
  const { connected } = useWallet();
  const { client } = useSPL8004();
  const { instantPayment, instantPaymentLoading } = useX402();
  const { addMessage, getMessagesForAgent } = useMessages();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimToast, setClaimToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [showCommunication, setShowCommunication] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  // DEBUG: Log hook availability
  console.log('🔍 useX402 hook:', { instantPayment: !!instantPayment, instantPaymentLoading });

  useEffect(() => {
    async function loadAgents() {
      if (!client) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Loading user agents...');
        const userAgents = await client.getAllUserAgents();
        console.log('Loaded agents:', userAgents);
        setAgents(userAgents);
      } catch (error) {
        console.error('Failed to load agents:', error);
        toast.error('Failed to load agents');
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, [client, connected]);

  if (!connected) {
    return (
      <div className="space-y-6 text-slate-200">
        <h1 className="text-2xl font-semibold">My Agents</h1>
        <div className="p-8 rounded-lg bg-white/5 border border-white/10 text-center">
          <p className="text-slate-400">Please connect your wallet to view your agents</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 text-slate-200">
        <h1 className="text-2xl font-semibold">My Agents</h1>
        <div className="p-8 rounded-lg bg-white/5 border border-white/10 text-center">
          <p className="text-slate-400">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Agents</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCommunication(!showCommunication)}
            className="flex items-center gap-2"
          >
            <Radio className="h-4 w-4" />
            {showCommunication ? 'Hide' : 'Show'} Network
          </Button>
          <Link 
            to="/app/create-agent" 
            className="px-4 py-2 bg-slate-100 text-black rounded hover:bg-slate-200 transition text-sm font-medium"
          >
            + Create Agent
          </Link>
        </div>
      </div>

      {/* Agent Communication (SPL-ACP) Card */}
      {showCommunication && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-200">
              <MessageSquare className="h-5 w-5" />
              Agent Communication (SPL-ACP)
            </CardTitle>
            <CardDescription className="text-slate-400">
              Program ID: FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h3 className="font-semibold text-blue-300 mb-2">Network Agents</h3>
              <div className="text-sm text-slate-300 space-y-1">
                <p>• Total registered agents: {agents.length}</p>
                <p>• Active agents: {agents.filter(a => a.isActive).length}</p>
                <p>• Average reputation: {Math.round(agents.reduce((sum, a) => sum + (a.reputation?.score ?? 5000), 0) / (agents.length || 1))}</p>
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Send Message to Agent</Label>
              <div className="mt-2 space-y-3">
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-slate-200"
                  onChange={(e) => {
                    const agent = agents.find(a => a.agentId === e.target.value);
                    setSelectedAgent(agent || null);
                  }}
                >
                  <option value="">Select an agent...</option>
                  {agents.filter(a => a.isActive).map(agent => (
                    <option key={agent.agentId} value={agent.agentId}>
                      {agent.agentId} (Score: {agent.reputation?.score ?? 5000})
                    </option>
                  ))}
                </select>

                <Textarea
                  placeholder="Enter your message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500"
                  rows={3}
                />

                <Button
                  onClick={() => {
                    if (!selectedAgent) {
                      toast.error('Please select an agent');
                      return;
                    }
                    if (!messageContent.trim()) {
                      toast.error('Please enter a message');
                      return;
                    }

                    // Send message via global context
                    addMessage({
                      from: 'user',
                      to: selectedAgent.agentId,
                      content: messageContent,
                    });
                    
                    // Simulate agent auto-reply
                    setTimeout(() => {
                      addMessage({
                        from: selectedAgent.agentId,
                        to: 'user',
                        content: `Received your message: "${messageContent.substring(0, 30)}..." - Processing request...`,
                      });
                      toast.info('New message received', {
                        description: `From: ${selectedAgent.agentId}`
                      });
                    }, 2000);
                    
                    toast.success('Message sent via SPL-ACP', {
                      description: `To: ${selectedAgent.agentId}\nMessage: ${messageContent.substring(0, 50)}...`
                    });
                    
                    setMessageContent('');
                    setSelectedAgent(null);
                  }}
                  disabled={!selectedAgent || !messageContent.trim()}
                  className="w-full"
                >
                  Send Message
                </Button>
              </div>
            </div>

            {/* Inbox Section */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-300">Inbox ({getMessagesForAgent('user').length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInbox(!showInbox)}
                  className="text-xs"
                >
                  {showInbox ? 'Hide' : 'Show'} Messages
                </Button>
              </div>
              
              {showInbox && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getMessagesForAgent('user').length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No messages yet</p>
                  ) : (
                    getMessagesForAgent('user').map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.from === 'user' 
                            ? 'bg-blue-500/10 border border-blue-500/20' 
                            : 'bg-green-500/10 border border-green-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-300">
                            {msg.from === 'user' ? '📤 Sent to' : '📥 From'} {msg.from === 'user' ? msg.to : msg.from}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10">
              <details className="text-sm text-slate-400">
                <summary className="cursor-pointer font-medium text-slate-300">View Code Example</summary>
                <pre className="mt-2 p-3 bg-black/30 rounded overflow-x-auto text-xs text-slate-300">
{
`// Agent-to-Agent Communication via SPL-ACP
import { ACPClient } from './lib/acp-client';

const acp = new ACPClient(connection, wallet);

// Declare agent capability
await acp.declareCapabilities(agentPubkey, [{
  name: 'chat-agent',
  version: '1.0.0',
  inputSchema: JSON.stringify({ message: 'string' }),
  outputSchema: JSON.stringify({ response: 'string' })
}]);

// Send message (simulated)
const message = {
  from: 'my-agent-id',
  to: 'target-agent-id',
  content: 'Hello from agent!',
  timestamp: Date.now()
};

console.log('Message sent:', message);`
}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
      
      {agents.length === 0 ? (
        <div className="p-8 rounded-lg bg-white/5 border border-white/10 text-center space-y-4">
          <p className="text-slate-400">No agents found</p>
          <p className="text-sm text-slate-500">Create your first agent to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div 
              key={agent.agentId} 
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-400/40 transition flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <Link to={`/app/agents/${agent.agentId}`} className="font-medium hover:underline">
                  {agent.agentId}
                </Link>
                <div className={`text-xs px-2 py-0.5 rounded ${agent.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {agent.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>Score: <span className="text-slate-200 font-semibold">{agent.reputation?.score ?? 5000}</span></div>
                <div>Tasks: <span className="text-slate-200 font-semibold">{agent.reputation?.totalTasks ?? 0}</span></div>
                <div className="col-span-2 truncate">URI: {agent.metadataUri || 'None'}</div>
              </div>
              <div className="flex gap-2 mt-auto pt-2 border-t border-white/10">
                <Link
                  to={`/app/agents/${agent.agentId}`}
                  className="flex-1 text-center text-xs px-3 py-2 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-medium transition"
                >Details</Link>
                <button
                  disabled={instantPaymentLoading && claimingId===agent.agentId}
                  onClick={async () => {
                    try {
                      setClaimingId(agent.agentId);
                      console.log('🎯 Claiming for agent:', agent.agentId);
                      console.log('Agent owner:', agent.owner);
                      
                      const reward = ((agent.reputation?.score ?? 5000) * 0.001);
                      console.log('Reward amount:', reward, 'USDC');
                      
                      // Send reward to agent OWNER (wallet address), not agentId
                      const recipientPubkey = new PublicKey(agent.owner);
                      console.log('✅ Sending to owner:', recipientPubkey.toBase58());
                      
                      const res = await instantPayment(recipientPubkey, reward, `Reward for ${agent.agentId}`);
                      setClaimToast({msg:`Claim sent: ${(res.netAmount/1e6).toFixed(3)} USDC • ${res.signature.substring(0,8)}…`, type:'success'});
                      
                      // Refresh agent data after claim
                      if (client) {
                        const updated = await client.getAllUserAgents();
                        setAgents(updated);
                      }
                    } catch(e:any) {
                      console.error('❌ Claim error:', e);
                      setClaimToast({msg:`Claim failed: ${e.message || 'error'}`, type:'error'});
                    } finally {
                      setClaimingId(null);
                    }
                  }}
                  className={`flex-1 text-center text-xs px-3 py-2 rounded font-medium transition ${instantPaymentLoading && claimingId===agent.agentId ? 'bg-slate-600/30 text-slate-400 cursor-not-allowed' : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300'}`}
                >
                  {instantPaymentLoading && claimingId===agent.agentId ? 'Claiming…' : 'Claim'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {claimToast && (
        <div className={`fixed bottom-6 left-6 px-4 py-2 rounded-lg text-xs font-medium shadow border ${claimToast.type==='success' ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-200' : 'bg-red-600/20 border-red-500/30 text-red-200'}`}> 
          <span>{claimToast.msg}</span>
          <button onClick={()=>setClaimToast(null)} className="ml-3 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}
    </div>
  );
}
