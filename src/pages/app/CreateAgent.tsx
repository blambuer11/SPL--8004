import { useState } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { createSPL8004Client } from '@/lib/spl8004-client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function CreateAgent() {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const anchorWallet = useAnchorWallet();
  const [agentId, setAgentId] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [capability, setCapability] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!connected || !publicKey || !anchorWallet) {
      toast.error('Connect wallet first');
      return;
    }
    if (!agentId.trim() || !metadataUri.trim()) {
      toast.error('Agent ID and metadata URI required');
      return;
    }
    try {
      setLoading(true);
      const connection = new Connection(import.meta.env.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com', 'confirmed');
      // wallet.adapter has signTransaction; cast to AnchorWallet-like object
  const client = createSPL8004Client(connection, anchorWallet);
      const sig = await client.registerAgent(agentId.trim(), metadataUri.trim());
      toast.success('Agent registered', {
        description: sig,
        action: {
          label: 'Explorer',
          onClick: () => window.open(`https://explorer.solana.com/tx/${sig}?cluster=devnet`, '_blank')
        }
      });
      // Optional: capability handling (future extension)
      if (capability.trim()) {
        console.info('Capability placeholder:', capability);
      }
      setAgentId('');
      setMetadataUri('');
      setCapability('');
      // Redirect to agents list after success
      navigate('/app/agents');
    } catch (e: unknown) {
      const msg = (e as Error)?.message || String(e);
      toast.error('Register failed', { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold">Create Agent</h1>
        <p className="text-sm text-slate-400 mt-1">Register a new AI agent on SPL-8004. Fee: 0.1 SOL (Devnet)</p>
      </div>
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label className="text-sm font-medium block">Agent ID</label>
          <input value={agentId} onChange={e=>setAgentId(e.target.value)} className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm placeholder-slate-500" placeholder="my-agent-01" />
          <p className="text-xs text-slate-500">Max 64 characters, unique identifier</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block">Metadata URI</label>
          <input value={metadataUri} onChange={e=>setMetadataUri(e.target.value)} className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm placeholder-slate-500" placeholder="https://arweave.net/..." />
          <p className="text-xs text-slate-500">IPFS or Arweave link to agent metadata JSON</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block">Initial Capability (optional)</label>
          <input value={capability} onChange={e=>setCapability(e.target.value)} className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm placeholder-slate-500" placeholder="skill-name" />
        </div>
        <div className="flex gap-3">
          <button disabled={loading} onClick={handleRegister} className="bg-slate-100 disabled:opacity-50 hover:bg-slate-200 text-black rounded px-6 py-2.5 text-sm font-medium transition">{loading ? 'Registering...' : 'Register Agent'}</button>
          <button onClick={()=>{setAgentId('');setMetadataUri('');setCapability('');}} className="border border-white/10 hover:bg-white/5 text-slate-300 rounded px-6 py-2.5 text-sm font-medium transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}
