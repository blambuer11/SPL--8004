import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeExample } from '@/components/CodeExample';
import { BookOpen, Rocket, Code2, Puzzle, Shield, Zap, Bot, Database, FileCode, Sparkles, ChevronRight, TrendingUp, CheckCircle2, Coins, Network, Search, Link as LinkIcon } from 'lucide-react';

type NavItem = {
  id: string;
  title: string;
  icon?: any;
  children?: NavItem[];
};

const nav: NavItem[] = [
  { id: 'introduction', title: 'Introduction', icon: BookOpen },
  { id: 'what-is-spl8004', title: 'What is SPL-8004?', icon: Sparkles },
  { id: 'problem', title: 'Problem We Solve', icon: Shield },
  { id: 'features', title: 'Core Features', icon: Zap },
  {
    id: 'protocol',
    title: 'Protocol Details',
    icon: Database,
    children: [
      { id: 'accounts', title: 'Accounts' },
      { id: 'instructions', title: 'Instructions' },
      { id: 'pda-layout', title: 'PDA Layout' },
    ],
  },
  { id: 'getting-started', title: 'Getting Started', icon: Rocket },
  { id: 'integration', title: 'Integration Guide', icon: Puzzle },
  { id: 'faq', title: 'FAQ', icon: FileCode },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [query, setQuery] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  const flatIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (items: NavItem[]) => items.forEach((i) => {
      ids.push(i.id);
      if (i.children) walk(i.children);
    });
    walk(nav);
    return ids;
  }, []);

  useEffect(() => {
    const opts: IntersectionObserverInit = { root: null, rootMargin: '0px 0px -70% 0px', threshold: 0.1 };
    observerRef.current = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? -1 : 1));
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, opts);
    const obs = observerRef.current;
    flatIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [flatIds]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredNav = useMemo(() => {
    if (!query.trim()) return nav;
    const q = query.toLowerCase();
    const filterItems = (items: NavItem[]): NavItem[] =>
      items
        .map((i) => ({
          ...i,
          children: i.children ? filterItems(i.children) : undefined,
        }))
        .filter((i) => i.title.toLowerCase().includes(q) || (i.children && i.children.length > 0));
    return filterItems(nav);
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-950/5 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <Card className="border-primary/20 bg-card/50 backdrop-blur p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-foreground mb-1">Documentation</h2>
                  <p className="text-xs text-muted-foreground">SPL-8004 Protocol</p>
                </div>
                <Separator className="mb-4" />
                <div className="relative mb-3">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search docs..."
                    className="w-full pl-9 pr-3 py-2 rounded-md text-sm bg-input border border-border/50 outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <ScrollArea className="h-[calc(100vh-240px)]">
                  <nav className="space-y-1">
                    {filteredNav.map((item) => (
                      <div key={item.id} className="space-y-1">
                        <button
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                            activeSection === item.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                          <span className="flex-1 text-left">{item.title}</span>
                          {activeSection === item.id && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                        </button>
                        {item.children && (
                          <div className="ml-8 space-y-1">
                            {item.children.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => scrollToSection(c.id)}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all ${
                                  activeSection === c.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                              >
                                <span className="flex-1 text-left">{c.title}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                </ScrollArea>
              </Card>
            </div>
          </aside>

          <main className="flex-1 max-w-4xl">
            <div className="space-y-16">
              <section id="introduction" className="scroll-mt-24">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Introduction
                </Badge>
                <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  SPL-8004 Documentation
                </h1>
                <Card className="border-primary/20 bg-card/50 backdrop-blur p-8">
                  <p className="text-lg text-muted-foreground mb-4">
                    Welcome to <strong className="text-foreground">SPL-8004</strong>, 
                    the first Solana Program Library standard for decentralized AI agent identity and reputation management.
                  </p>
                  <p className="text-muted-foreground">
                    This protocol enables autonomous AI agents to establish verifiable on-chain identities, 
                    earn reputation through validated tasks, and participate in a trustless ecosystem.
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
                    <LinkIcon className="h-3 w-3" />
                    <span>Program ID (devnet): G8iYmvn...SyMkW</span>
                  </div>
                </Card>
              </section>

              <section id="what-is-spl8004" className="scroll-mt-24">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <Sparkles className="w-4 h-4 mr-2" />
                  What is SPL-8004?
                </Badge>
                <h2 className="text-3xl font-bold mb-6">What is SPL-8004?</h2>
                <Card className="border-primary/20 bg-card/50 backdrop-blur p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      The Standard
                    </h3>
                    <p className="text-muted-foreground">
                      SPL-8004 is Solana's equivalent to Ethereum's ERC-8004 standard for AI agent management.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Network className="h-5 w-5 text-primary" />
                      ERC-8004 Compatibility
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-semibold text-sm mb-2">ERC-8004 (Ethereum)</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• ~15 TPS</li>
                          <li>• $5-50 gas fees</li>
                          <li>• 12-15s finality</li>
                        </ul>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                        <h4 className="font-semibold text-sm mb-2 text-primary">SPL-8004 (Solana)</h4>
                        <ul className="text-xs text-foreground space-y-1">
                          <li>• 65,000+ TPS</li>
                          <li>• $0.00025 tx cost</li>
                          <li>• 400ms finality</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              <section id="problem" className="scroll-mt-24">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <Shield className="w-4 h-4 mr-2" />
                  Problem
                </Badge>
                <h2 className="text-3xl font-bold mb-6">Problem We Solve</h2>
                <div className="grid gap-6">
                  <Card className="border-red-500/20 bg-red-500/5 p-6">
                    <h3 className="text-lg font-semibold mb-3">❌ Without SPL-8004</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• No standardized AI agent identification</li>
                      <li>• Lack of trustless validation</li>
                      <li>• No reputation tracking system</li>
                    </ul>
                  </Card>
                  
                  <Card className="border-green-500/20 bg-green-500/5 p-6">
                    <h3 className="text-lg font-semibold mb-3">✓ With SPL-8004</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Standardized on-chain identity registry</li>
                      <li>• Trustless validation with cryptographic proofs</li>
                      <li>• Dynamic reputation scoring (0-10,000)</li>
                    </ul>
                  </Card>
                </div>
              </section>

              <section id="features" className="scroll-mt-24">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <Zap className="w-4 h-4 mr-2" />
                  Features
                </Badge>
                <h2 className="text-3xl font-bold mb-6">Core Features</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { icon: Shield, title: 'Identity Registry', desc: 'On-chain identities with metadata' },
                    { icon: TrendingUp, title: 'Reputation System', desc: 'Dynamic 0-10,000 scoring' },
                    { icon: CheckCircle2, title: 'Validation Registry', desc: 'Trustless task verification' },
                    { icon: Coins, title: 'Reward System', desc: 'Performance-based rewards' },
                  ].map((feature) => (
                    <Card key={feature.title} className="border-primary/20 bg-card/50 backdrop-blur p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Protocol Details */}
              <section id="protocol" className="scroll-mt-24">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <Database className="w-4 h-4 mr-2" />
                  Protocol
                </Badge>
                <h2 className="text-3xl font-bold mb-6">Protocol Details</h2>
                <p className="text-muted-foreground mb-6">Deep dive into accounts, instructions, and PDA derivations of SPL-8004.</p>
                <div className="grid gap-8">
                  <Card id="accounts" className="border-primary/20 bg-card/50 backdrop-blur p-6 scroll-mt-24">
                    <h3 className="text-xl font-semibold mb-3">Accounts</h3>
                    <ul className="text-sm text-muted-foreground list-disc ml-6 space-y-1">
                      <li>GlobalConfig: authority, treasury, commission_rate, counters</li>
                      <li>IdentityRegistry (PDA): owner, agent_id, metadata_uri, is_active</li>
                      <li>ReputationRegistry (PDA): score, totals, stake_amount</li>
                      <li>ValidationRegistry (PDA): validator, task_hash, approved, evidence</li>
                      <li>RewardPool (PDA): claimable, last_claim, total_claimed</li>
                    </ul>
                  </Card>
                  <Card id="instructions" className="border-primary/20 bg-card/50 backdrop-blur p-6 scroll-mt-24">
                    <h3 className="text-xl font-semibold mb-3">Instructions</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="p-4 rounded-lg border border-border/50">
                        <div className="font-semibold mb-1">initialize_config(authority, treasury, rate)</div>
                        <p className="text-muted-foreground">Initializes config PDA with commission and treasury.</p>
                      </div>
                      <div className="p-4 rounded-lg border border-border/50">
                        <div className="font-semibold mb-1">register_agent(agent_id, metadata_uri)</div>
                        <p className="text-muted-foreground">Creates identity/reputation/reward_pool PDAs.</p>
                      </div>
                      <div className="p-4 rounded-lg border border-border/50">
                        <div className="font-semibold mb-1">submit_validation(task_hash, approved, evidence)</div>
                        <p className="text-muted-foreground">Records validation and collects commission.</p>
                      </div>
                      <div className="p-4 rounded-lg border border-border/50">
                        <div className="font-semibold mb-1">update_metadata(new_uri), claim_rewards(), deactivate_agent()</div>
                        <p className="text-muted-foreground">Owner-only operations for lifecycle management.</p>
                      </div>
                    </div>
                  </Card>
                  <Card id="pda-layout" className="border-primary/20 bg-card/50 backdrop-blur p-6 scroll-mt-24">
                    <h3 className="text-xl font-semibold mb-3">PDA Layout</h3>
                    <ul className="text-sm text-muted-foreground list-disc ml-6 space-y-1">
                      <li>config = ["config"]</li>
                      <li>identity = ["identity", agent_id]</li>
                      <li>reputation = ["reputation", identity_pda]</li>
                      <li>reward_pool = ["reward_pool", identity_pda]</li>
                      <li>validation = ["validation", identity_pda, task_hash]</li>
                    </ul>
                  </Card>
                </div>
              </section>

              <section id="getting-started" className="scroll-mt-24">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <Rocket className="w-4 h-4 mr-2" />
                  Getting Started
                </Badge>
                <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
                <CodeExample
                  title="Installation"
                  language="bash"
                  code="npm install @neoma/spl8004-sdk @solana/web3.js"
                />
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <CodeExample
                    title="Create Client"
                    language="typescript"
                    code={`import { Connection } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { createSPL8004Client } from '@/lib/spl8004-client';

const connection = new Connection('https://api.devnet.solana.com');
const client = createSPL8004Client(connection, wallet as AnchorWallet);`}
                  />
                  <CodeExample
                    title="Register Agent"
                    language="typescript"
                    code={`const sig = await client.registerAgent('agent-001', 'https://arweave.net/...');
console.log('tx', sig);`}
                  />
                </div>
              </section>

              <section id="integration" className="scroll-mt-24">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <Puzzle className="w-4 h-4 mr-2" />
                  Integration
                </Badge>
                <h2 className="text-3xl font-bold mb-6">Basic Integration</h2>
                <CodeExample
                  title="Register Agent"
                  language="typescript"
                  code={`import { SPL8004Client } from '@neoma/spl8004-sdk';

const client = new SPL8004Client(connection, wallet);
await client.registerAgent("agent-id", "metadata-uri");`}
                />
              </section>

              <section id="faq" className="scroll-mt-24">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <FileCode className="w-4 h-4 mr-2" />
                  FAQ
                </Badge>
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-primary/20 bg-card/50 backdrop-blur p-6">
                    <h3 className="font-semibold mb-2">Which network is supported?</h3>
                    <p className="text-sm text-muted-foreground">Devnet by default. Program ID and RPC can be configured.</p>
                  </Card>
                  <Card className="border-primary/20 bg-card/50 backdrop-blur p-6">
                    <h3 className="font-semibold mb-2">How are PDAs derived?</h3>
                    <p className="text-sm text-muted-foreground">See PDA Layout section for seeds and address derivations.</p>
                  </Card>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
