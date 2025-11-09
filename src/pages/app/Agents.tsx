import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { toast } from 'sonner';

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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

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
        <Link 
          to="/app/create-agent" 
          className="px-4 py-2 bg-slate-100 text-black rounded hover:bg-slate-200 transition text-sm font-medium"
        >
          + Create Agent
        </Link>
      </div>
      
      {agents.length === 0 ? (
        <div className="p-8 rounded-lg bg-white/5 border border-white/10 text-center space-y-4">
          <p className="text-slate-400">No agents found</p>
          <p className="text-sm text-slate-500">Create your first agent to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {agents.map(agent => (
            <Link 
              key={agent.agentId} 
              to={`/app/agents/${agent.agentId}`} 
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium">{agent.agentId}</div>
                <div className={`text-xs px-2 py-0.5 rounded ${agent.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {agent.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Score: {agent.reputation?.score ?? 5000}</div>
                <div>Tasks: {agent.reputation?.totalTasks ?? 0}</div>
                <div className="truncate">URI: {agent.metadataUri || 'None'}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
