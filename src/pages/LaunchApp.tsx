import { useEffect, useMemo, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot,
  ChevronRight,
  Users,
  Shield,
  TrendingUp,
  Play,
  Terminal,
  BookOpen,
  Network
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useWallet, AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { createSPL8004Client } from '@/lib/noema8004-client';

type Section = { id: string; title: string; icon: LucideIcon; description: string };

const sections: Section[] = [
  { id: 'register', title: 'AI Agent Register', icon: Bot, description: 'Create on-chain identity (SPL-8004)' },
  { id: 'agents', title: 'Agents', icon: Users, description: 'Your agents and network directory' },
  { id: 'validator', title: 'Validator', icon: Shield, description: 'Submit task validations' },
];

export default function LaunchApp() {
  const [activeSection, setActiveSection] = useState<string>('register');
  const { wallet, publicKey } = useWallet();
  const anchorWallet = wallet as unknown as AnchorWallet;
  const connection = useMemo(() => new Connection('https://api.devnet.solana.com'), []);
  const [variant, setVariant] = useState<'A' | 'B'>(() => (localStorage.getItem('ab_variant') as 'A' | 'B') || (Math.random() < 0.5 ? 'A' : 'B'));
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });

  // Forms state
  const [agentId, setAgentId] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSig, setRegisterSig] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [agentsLoading, setAgentsLoading] = useState(false);
  type MinimalAgent = { address: string; agentId: string; reputation?: { score?: number; totalTasks?: number } | null };
  const [myAgents, setMyAgents] = useState<MinimalAgent[]>([]);

  const [valAgentId, setValAgentId] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [approved, setApproved] = useState(true);
  const [evidenceUri, setEvidenceUri] = useState('');
  const [valLoading, setValLoading] = useState(false);
  const [valSig, setValSig] = useState<string | null>(null);
  const [valError, setValError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('ab_variant', variant);
    const win = window as unknown as { gtag?: (event: string, name: string, params?: Record<string, unknown>) => void };
    if (typeof win.gtag === 'function') {
      win.gtag('event', 'ab_variant', { variant });
    }
  }, [variant]);

  const getClient = () => {
    if (!anchorWallet || !publicKey) throw new Error('Cüzdanınızı bağlayın.');
    return createSPL8004Client(connection, anchorWallet);
  };

  async function toTaskHash32(input: string): Promise<Uint8Array> {
    const enc = new TextEncoder();
    const data = enc.encode(input.trim());
    const digest = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
    return new Uint8Array(digest);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo and Wallet */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden">
                <img src="/logo.svg" alt="Noema" className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-foreground">Noema</span>
                <span className="text-xs text-muted-foreground -mt-1">Build</span>
              </div>
            </a>

            <WalletMultiButton className="!bg-foreground !text-white hover:!opacity-90 !rounded-lg !px-5 !py-2 !font-medium !text-sm !shadow-none" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <Card className="border border-border bg-card p-6 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-foreground mb-1">Start Building</h2>
                  <p className="text-xs text-muted-foreground">Create Trusted AI Agents</p>
                </div>
                <Separator className="mb-4" />
                <ScrollArea className="h-[calc(100vh-240px)]">
                  <nav className="space-y-1">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${
                            activeSection === section.id 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <div className="font-medium">{section.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{section.description}</div>
                          </div>
                          {activeSection === section.id && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            <div className="space-y-16">
              {/* Hero (minimal, variant-based tagline) */}
              <section className="text-center py-10">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 mb-3">
                  <Play className="w-4 h-4 mr-2" />
                  Launch App
                </Badge>
                <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${variant==='A' ? 'text-foreground' : 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent'}`}>
                  {variant==='A' ? 'Build Agents. On-Chain. Fast.' : 'Create Trusted AI Agents in Minutes'}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
                  Connect your wallet and perform on-chain operations: register agents and submit validations.
                </p>
              </section>

              {/* Register Section */}
              <section id="register" className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 mb-4">
                  <Bot className="w-4 h-4 mr-2" />
                  AI Agent Register
                </Badge>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Create On-Chain Identity (SPL-8004)</h2>

                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-xl">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Agent ID</label>
                      <input value={agentId} onChange={(e)=>setAgentId(e.target.value)} placeholder="my-bot-001" className="px-3 py-2 border rounded-md text-sm" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Metadata URI (IPFS/Arweave)</label>
                      <input value={metadataUri} onChange={(e)=>setMetadataUri(e.target.value)} placeholder="https://arweave.net/metadata.json" className="px-3 py-2 border rounded-md text-sm" />
                    </div>
                  </div>
                  <button
                    onClick={async ()=>{
                      setRegisterError(null); setRegisterSig(null); setRegisterLoading(true);
                      try {
                        const client = getClient();
                        const sig = await client.registerAgent(agentId, metadataUri);
                        setRegisterSig(sig);
                      } catch (e) {
                        const msg = (e as Error)?.message || String(e);
                        setRegisterError(msg);
                      } finally { setRegisterLoading(false); }
                    }}
                    disabled={registerLoading}
                    className={`px-5 py-2 rounded-lg text-white font-semibold ${registerLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {registerLoading ? 'Registering…' : 'Register Agent'}
                  </button>

                  {registerSig && (
                    <div className="mt-4 text-sm">
                      <span className="font-semibold text-green-700">Success:</span> <a className="underline" href={`https://explorer.solana.com/tx/${registerSig}?cluster=devnet`} target="_blank" rel="noreferrer">View on Explorer</a>
                    </div>
                  )}
                  {registerError && (
                    <div className="mt-4 text-sm text-red-700">{registerError}</div>
                  )}

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded mt-6 text-xs">
                    <strong>Production Tip:</strong> Use environment variables for secrets and RPC URLs. Never hardcode private keys in client-side code.
                  </div>
                </Card>
              </section>

              

              {/* Agents Section */}
              <section id="agents" className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 mb-4">
                  <Users className="w-4 h-4 mr-2" />
                  Agents
                </Badge>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Your Agents & Network</h2>

                <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <a href="/agents" className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 text-sm font-semibold">Open Agents Dashboard</a>
                    <button onClick={async()=>{
                      setAgentsLoading(true);
                      try{ const client = getClient(); const list = await client.getAllUserAgents(); setMyAgents(list);}catch(e){ const msg = (e as Error)?.message || String(e); alert(msg); } finally{ setAgentsLoading(false);} 
                    }} className="px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-muted">Load My Agents</button>
                  </div>

                  {agentsLoading && <div className="text-sm text-muted-foreground">Loading agents…</div>}
                  {!agentsLoading && myAgents.length>0 && (
                    <div className="grid gap-3">
                      {myAgents.map((a)=> (
                        <div key={a.address} className="p-3 rounded-lg border flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold">{a.agentId}</div>
                            <div className="text-xs text-muted-foreground">Score: {a.reputation?.score ?? 0} • Tasks: {a.reputation?.totalTasks ?? 0}</div>
                          </div>
                          <a href={`https://explorer.solana.com/address/${a.address}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-xs underline">Explorer</a>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded mt-6 text-xs">
                    <strong>Production Tip:</strong> For dashboards, read-only RPCs can use public endpoints. For writes, prefer your own RPC with rate limits.
                  </div>
                </Card>
              </section>

              {/* Validator Section */}
              <section id="validator" className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 mb-4">
                  <Shield className="w-4 h-4 mr-2" />
                  Validator
                </Badge>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Submit Validation</h2>

                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 shadow-xl">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Agent ID</label>
                      <input value={valAgentId} onChange={(e)=>setValAgentId(e.target.value)} placeholder="my-bot-001" className="px-3 py-2 border rounded-md text-sm" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Task ID or Signature</label>
                      <input value={taskInput} onChange={(e)=>setTaskInput(e.target.value)} placeholder="task-123 or 5Yh...sig" className="px-3 py-2 border rounded-md text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input id="approved" type="checkbox" checked={approved} onChange={(e)=>setApproved(e.target.checked)} />
                      <label htmlFor="approved" className="text-sm">Approved (success)</label>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Evidence URI</label>
                      <input value={evidenceUri} onChange={(e)=>setEvidenceUri(e.target.value)} placeholder="https://ipfs.io/ipfs/..." className="px-3 py-2 border rounded-md text-sm" />
                    </div>
                  </div>
                  <button
                    onClick={async ()=>{
                      setValError(null); setValSig(null); setValLoading(true);
                      try{
                        const client = getClient();
                        const hash32 = await toTaskHash32(taskInput);
                        const sig = await client.submitValidation(valAgentId, hash32, approved, evidenceUri);
                        setValSig(sig);
                      }catch(e){ const msg = (e as Error)?.message || String(e); setValError(msg); } finally{ setValLoading(false);} 
                    }}
                    disabled={valLoading}
                    className={`px-5 py-2 rounded-lg text-white font-semibold ${valLoading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}
                  >
                    {valLoading ? 'Submitting…' : 'Submit Validation'}
                  </button>

                  {valSig && (
                    <div className="mt-4 text-sm">
                      <span className="font-semibold text-green-700">Success:</span> <a className="underline" href={`https://explorer.solana.com/tx/${valSig}?cluster=devnet`} target="_blank" rel="noreferrer">View on Explorer</a>
                    </div>
                  )}
                  {valError && (
                    <div className="mt-4 text-sm text-red-700">{valError}</div>
                  )}

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded mt-6 text-xs">
                    <strong>Production Tip:</strong> Derive 32-byte task hashes on a secure server and sign payloads. Avoid exposing raw signatures in the browser.
                  </div>
                </Card>
              </section>

              {/* Info cards about reputation (concise) */}
              <section className="scroll-mt-24">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 border">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4" /><div className="font-semibold text-sm">Reputation Scoring</div></div>
                    <div className="text-xs text-muted-foreground">Success: +100 • Failure: -50. Higher score boosts visibility.</div>
                  </Card>
                  <Card className="p-4 border">
                    <div className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4" /><div className="font-semibold text-sm">Gasless</div></div>
                    <div className="text-xs text-muted-foreground">Transactions sponsored via Kora. No SOL required in wallet.</div>
                  </Card>
                </div>
              </section>

              {/* Feedback */}
              <section className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-slate-600 to-slate-800 text-white border-0 mb-4">
                  <Terminal className="w-4 h-4 mr-2" />
                  Feedback
                </Badge>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Help Us Improve</h2>
                <Card className="border border-border bg-card p-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <input value={feedback.name} onChange={(e)=>setFeedback({...feedback,name:e.target.value})} placeholder="Name" className="px-3 py-2 border rounded-md text-sm" />
                    <input value={feedback.email} onChange={(e)=>setFeedback({...feedback,email:e.target.value})} placeholder="Email" className="px-3 py-2 border rounded-md text-sm" />
                    <input value={feedback.message} onChange={(e)=>setFeedback({...feedback,message:e.target.value})} placeholder="Your feedback" className="px-3 py-2 border rounded-md text-sm" />
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button onClick={()=>{
                      const prev = JSON.parse(localStorage.getItem('noema_feedback')||'[]');
                      prev.push({...feedback, ts: Date.now()});
                      localStorage.setItem('noema_feedback', JSON.stringify(prev));
                      alert('Thanks for your feedback!');
                      const win = window as unknown as { gtag?: (event: string, name: string, params?: Record<string, unknown>) => void };
                      if (typeof win.gtag === 'function') win.gtag('event','feedback_submit');
                      setFeedback({name:'',email:'',message:''});
                    }} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold">Submit</button>
                    <a href="https://discord.gg/noema" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-muted">Join Discord</a>
                  </div>
                </Card>
              </section>

              

              {/* Footer CTA */}
              <section className="text-center py-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Ready to Build?</h2>
                <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                  Join the Noema community and start building trusted AI agents today.
                </p>
                <div className="flex gap-4 justify-center">
                  <a 
                    href="https://github.com/noema-protocol" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="h-5 w-5" />
                    View on GitHub
                  </a>
                  <a 
                    href="https://discord.gg/noema" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Network className="h-5 w-5" />
                    Join Discord
                  </a>
                  <a 
                    href="/docs" 
                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors flex items-center gap-2"
                  >
                    <Terminal className="h-5 w-5" />
                    Read Docs
                  </a>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
