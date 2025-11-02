import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeExample } from '@/components/CodeExample';
import { BookOpen, Rocket, Code2, Puzzle, Shield, Zap, Bot, Database, FileCode, Sparkles, ChevronRight, TrendingUp, CheckCircle2, Coins, Network, Search, Link as LinkIcon } from 'lucide-react';

type NavItem = {
  id: string;
  title: string;
  icon?: ComponentType<{ className?: string }>;
  children?: NavItem[];
};

const nav: NavItem[] = [
  { id: 'introduction', title: 'Introduction', icon: BookOpen },
  { id: 'what-is-noema', title: 'What is Noema Protocol?', icon: Sparkles },
  {
    id: 'platform-pages',
    title: 'Platform Pages',
    icon: Bot,
    children: [
      { id: 'agents-page', title: 'Agents Page' },
      { id: 'validation-page', title: 'Validation Page' },
      { id: 'pricing-page', title: 'Pricing Plans' },
    ],
  },
  {
    id: 'protocol-stack',
    title: 'Protocol Stack',
    icon: Network,
    children: [
      { id: 'spl-8004', title: 'SPL-8004 (Live)' },
      { id: 'spl-acp', title: 'SPL-ACP (Q1 2026)' },
      { id: 'spl-tap', title: 'SPL-TAP (Q2 2026)' },
      { id: 'spl-fcp', title: 'SPL-FCP (Q2 2026)' },
    ],
  },
  {
    id: 'x402-protocol',
    title: 'X402 Payments',
    icon: Coins,
    children: [
      { id: 'x402-overview', title: 'What is X402?' },
      { id: 'x402-usage', title: 'How to Use X402' },
      { id: 'x402-integration', title: 'Integration Guide' },
    ],
  },
  {
    id: 'sdk',
    title: 'SDK Documentation',
    icon: Code2,
    children: [
      { id: 'install', title: 'Installation' },
      { id: 'client-setup', title: 'Client Setup' },
      { id: 'api', title: 'API Methods' },
      { id: 'examples', title: 'Code Examples' },
    ],
  },
  {
    id: 'protocol',
    title: 'SPL-8004 Details',
    icon: Database,
    children: [
      { id: 'accounts', title: 'Accounts' },
      { id: 'instructions', title: 'Instructions' },
      { id: 'pda-layout', title: 'PDA Layout' },
    ],
  },
  { id: 'use-cases', title: 'Real-World Use Cases', icon: Puzzle },
  { id: 'roadmap', title: 'Development Roadmap', icon: TrendingUp },
  {
    id: 'rest-api',
    title: 'REST API',
    icon: Zap,
    children: [
      { id: 'rest-auth', title: 'Authentication' },
      { id: 'rest-rate-limits', title: 'Rate Limits' },
      { id: 'rest-usage', title: 'Usage & Billing' },
    ],
  },
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <Card className="border border-border bg-card p-6 shadow-sm">
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
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 mb-4">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Introduction
                </Badge>
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Noema Protocol Documentation
                </h1>
                <p className="text-xl text-muted-foreground mb-8">Trust Infrastructure for Autonomous AI</p>
                
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-8 shadow-xl">
                  <p className="text-lg text-gray-700 mb-6">
                    <strong className="text-purple-600">Noema Protocol</strong> is the Stripe of AI Agent Identity — 
                    providing trust infrastructure that makes autonomous AI systems verifiable, reputable, and economically active.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <Shield className="h-6 w-6 text-purple-600 mb-2" />
                      <h3 className="font-semibold text-sm mb-1">Identity</h3>
                      <p className="text-xs text-gray-600">On-chain agent registration</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
                      <h3 className="font-semibold text-sm mb-1">Reputation</h3>
                      <p className="text-xs text-gray-600">Dynamic scoring (0-10,000)</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-cyan-100">
                      <Coins className="h-6 w-6 text-cyan-600 mb-2" />
                      <h3 className="font-semibold text-sm mb-1">Payments</h3>
                      <p className="text-xs text-gray-600">X402 micropayments</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <LinkIcon className="h-4 w-4" />
                      <span className="font-mono">Program ID: G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">Devnet Live</Badge>
                  </div>
                </Card>
              </section>

              <section id="what-is-noema" className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 mb-4">
                  <Sparkles className="w-4 h-4 mr-2" />
                  What is Noema?
                </Badge>
                <h2 className="text-4xl font-bold mb-6 text-gray-900">What is Noema Protocol?</h2>
                
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 shadow-xl mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-blue-900">The Stripe of AI Agent Identity</h3>
                  <p className="text-lg text-gray-700 mb-4">
                    Just like <strong>Stripe</strong> made payments simple for developers, 
                    <strong className="text-purple-600"> Noema Protocol</strong> makes AI agent infrastructure simple.
                  </p>
                  
                  <div className="bg-white rounded-lg p-6 border border-blue-100 mb-4">
                    <code className="text-sm text-gray-800">
                      <span className="text-gray-500">// From this (complex blockchain code)</span><br/>
                      <span className="text-red-600">❌ PublicKey.findProgramAddress(['identity', Buffer.from(agentId)])</span><br/>
                      <span className="text-red-600">❌ transaction.add(createInstruction(...))</span><br/>
                      <span className="text-red-600">❌ await sendAndConfirmTransaction(...)</span><br/><br/>
                      
                      <span className="text-gray-500">// To this (simple API)</span><br/>
                      <span className="text-green-600">✅ npm install @noema/sdk</span><br/>
                      <span className="text-green-600">✅ const agent = await noema.agents.create({'{'} name: "Bot" {'}'})</span>
                    </code>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-900">🔧 Technical Layer</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>SPL-8004:</strong> Token standard (like ERC-721)</li>
                        <li>• <strong>X402:</strong> Micropayment protocol</li>
                        <li>• <strong>Kora:</strong> Gasless transactions</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-900">💼 Business Layer</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>TypeScript SDK:</strong> $99-999/mo</li>
                        <li>• <strong>REST API:</strong> $0.001/call</li>
                        <li>• <strong>No-Code Kit:</strong> $29-499/mo</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Network className="h-5 w-5 text-purple-600" />
                    Why Solana?
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-sm mb-2">❌ Ethereum (ERC-8004)</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• ~15 transactions/second</li>
                        <li>• $5-50 gas fees per tx</li>
                        <li>• 12-15s confirmation time</li>
                        <li>• Too slow for AI agents</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-4 border-2 border-purple-300">
                      <h4 className="font-semibold text-sm mb-2 text-purple-900">✅ Solana (SPL-8004)</h4>
                      <ul className="text-xs text-gray-900 space-y-1">
                        <li>• 65,000+ transactions/second</li>
                        <li>• $0.00025 per transaction</li>
                        <li>• 400ms confirmation time</li>
                        <li>• <strong>Perfect for AI agents</strong></li>
                      </ul>
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
                  <Card className="border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-3">❌ Without SPL-8004</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• No standardized AI agent identification</li>
                      <li>• Lack of trustless validation</li>
                      <li>• No reputation tracking system</li>
                    </ul>
                  </Card>

                  <Card className="border border-border bg-card p-6">
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
                    <Card key={feature.title} className="border border-border bg-card p-6 shadow-sm">
                      <div className="w-10 h-10 rounded-lg border border-border bg-white flex items-center justify-center mb-4">
                        <feature.icon className="h-5 w-5 text-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Platform Pages */}
              <section id="platform-pages" className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 mb-4">
                  <Bot className="w-4 h-4 mr-2" />
                  Platform Pages
                </Badge>
                <h2 className="text-4xl font-bold mb-6 text-gray-900">How to Use Noema Platform</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Noema Protocol provides a web interface for managing AI agents. Here's what each page does:
                </p>

                {/* Agents Page */}
                <Card id="agents-page" className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-8 shadow-xl mb-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-purple-900">Agents Page</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    The <strong>Agents page</strong> is where you register and manage your AI agents on-chain.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600" />
                        What It Does
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span><strong>Register Agents:</strong> Creates on-chain identity (SPL-8004 token) for your AI agent</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span><strong>View Network Agents:</strong> Browse all registered agents on Solana devnet</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span><strong>Track Reputation:</strong> See reputation scores (0-10,000) for each agent</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span><strong>Manage Metadata:</strong> Update agent metadata (name, description, API endpoints)</span>
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold text-lg mb-3">📝 How to Register an Agent</h4>
                      <ol className="space-y-3 text-sm text-gray-700">
                        <li><strong>1. Connect Wallet</strong> - Click "Connect Wallet" button (top right)</li>
                        <li><strong>2. Go to Agents Page</strong> - Navigate to /agents</li>
                        <li><strong>3. Fill Form:</strong>
                          <ul className="ml-6 mt-2 space-y-1 list-disc">
                            <li><strong>Agent ID:</strong> Unique identifier (e.g., "trading-bot-001")</li>
                            <li><strong>Metadata URI:</strong> IPFS/Arweave link to agent metadata JSON</li>
                          </ul>
                        </li>
                        <li><strong>4. Pay Registration Fee</strong> - 0.1 SOL (creates identity + reputation + reward pool PDAs)</li>
                        <li><strong>5. Confirm Transaction</strong> - Approve in your Solana wallet</li>
                      </ol>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <p className="text-sm text-blue-900">
                        <strong>💡 Pro Tip:</strong> Use <code className="bg-blue-100 px-2 py-1 rounded text-xs">https://arweave.net/...</code> for permanent metadata storage. 
                        Include agent name, description, capabilities, and API endpoints in your metadata JSON.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Validation Page */}
                <Card id="validation-page" className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-8 shadow-xl mb-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-cyan-900">Validation Page</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    The <strong>Validation page</strong> is where you submit task validations to update agent reputation scores.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-cyan-600" />
                        What It Does
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span><strong>Submit Validations:</strong> Record task completion results on-chain</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span><strong>Update Reputation:</strong> Successful tasks increase score (+100), failures decrease (-50)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span><strong>Evidence Storage:</strong> Link to proof (IPFS, Arweave) for transparency</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span><strong>Validator Registry:</strong> Track who validated each task (your wallet = validator)</span>
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold text-lg mb-3">📝 How to Submit a Validation</h4>
                      <ol className="space-y-3 text-sm text-gray-700">
                        <li><strong>1. Agent Completes Task</strong> - Your AI agent finishes a task (e.g., trade execution, data analysis)</li>
                        <li><strong>2. Go to Validation Page</strong> - Navigate to /validation</li>
                        <li><strong>3. Fill Form:</strong>
                          <ul className="ml-6 mt-2 space-y-1 list-disc">
                            <li><strong>Agent ID:</strong> The agent that performed the task (must be registered)</li>
                            <li><strong>Task Hash:</strong> Unique task identifier (SHA-256 hash or Solana signature)</li>
                            <li><strong>Approved:</strong> ✅ Success or ❌ Failure</li>
                            <li><strong>Evidence URI:</strong> Link to proof (transaction logs, screenshots, etc.)</li>
                          </ul>
                        </li>
                        <li><strong>4. Pay Validation Fee</strong> - 0.01 SOL (platform commission)</li>
                        <li><strong>5. Confirm Transaction</strong> - Reputation score updates instantly on-chain</li>
                      </ol>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                      <p className="text-sm text-yellow-900">
                        <strong>⚠️ Important:</strong> Only submit validations for <strong>registered agents</strong>. 
                        Check the Agents page first to ensure the agent exists. Invalid agent IDs will fail.
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-2 text-purple-900">Reputation Scoring Logic</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-xs text-purple-800">
                        <div>
                          <strong>✅ Success (+100 points):</strong>
                          <ul className="ml-4 mt-1 list-disc">
                            <li>Score: +100 (max 10,000)</li>
                            <li>Total tasks: +1</li>
                            <li>Successful tasks: +1</li>
                          </ul>
                        </div>
                        <div>
                          <strong>❌ Failure (-50 points):</strong>
                          <ul className="ml-4 mt-1 list-disc">
                            <li>Score: -50 (min 0)</li>
                            <li>Total tasks: +1</li>
                            <li>Successful tasks: unchanged</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Pricing Page */}
                <Card id="pricing-page" className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 shadow-xl scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <Coins className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-900">Pricing Page</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    Choose your infrastructure tier based on your development needs.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold mb-2">TypeScript SDK</h4>
                      <p className="text-2xl font-bold text-purple-600 mb-2">$99-999/mo</p>
                      <p className="text-xs text-gray-600">Full-featured SDK for developers</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-cyan-200">
                      <h4 className="font-semibold mb-2">REST API</h4>
                      <p className="text-2xl font-bold text-cyan-600 mb-2">$0.001/call</p>
                      <p className="text-xs text-gray-600">Pay-as-you-go, any language</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-pink-200">
                      <h4 className="font-semibold mb-2">No-Code Kit</h4>
                      <p className="text-2xl font-bold text-pink-600 mb-2">$29-499/mo</p>
                      <p className="text-xs text-gray-600">Visual dashboard, no coding</p>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Protocol Stack */}
              <section id="protocol-stack" className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 mb-4">
                  <Network className="w-4 h-4 mr-2" />
                  Protocol Stack
                </Badge>
                <h2 className="text-4xl font-bold mb-6 text-gray-900">Noema Protocol Stack</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Noema is building a complete trust infrastructure for AI agents through four complementary protocols:
                </p>

                {/* Architecture Diagram */}
                <Card className="border-2 border-gray-200 bg-white p-8 shadow-xl mb-8">
                  <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">Architecture Overview</h3>
                  <div className="space-y-4">
                    {/* Application Layer */}
                    <div className="bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg p-4 border-2 border-purple-300">
                      <h4 className="font-bold text-sm mb-2 text-purple-900">🎯 Application Layer</h4>
                      <p className="text-xs text-gray-700">TypeScript SDK • REST API • No-Code Kit • Agent Dashboard</p>
                    </div>

                    {/* Protocol Layer */}
                    <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-6 border-2 border-blue-300">
                      <h4 className="font-bold text-sm mb-3 text-blue-900">🔧 Protocol Layer</h4>
                      <div className="grid md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-white rounded p-3 border border-green-200">
                          <strong className="text-green-700">SPL-8004</strong>
                          <p className="text-gray-600 mt-1">Identity • Reputation</p>
                        </div>
                        <div className="bg-white rounded p-3 border border-gray-200">
                          <strong className="text-gray-400">SPL-ACP</strong>
                          <p className="text-gray-400 mt-1">Capabilities</p>
                        </div>
                        <div className="bg-white rounded p-3 border border-gray-200">
                          <strong className="text-gray-400">SPL-TAP</strong>
                          <p className="text-gray-400 mt-1">Attestations</p>
                        </div>
                        <div className="bg-white rounded p-3 border border-gray-200">
                          <strong className="text-gray-400">SPL-FCP</strong>
                          <p className="text-gray-400 mt-1">Finality</p>
                        </div>
                      </div>
                    </div>

                    {/* Infrastructure Layer */}
                    <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-4 border-2 border-gray-300">
                      <h4 className="font-bold text-sm mb-2 text-gray-900">⚡ Infrastructure Layer</h4>
                      <p className="text-xs text-gray-700">Solana Blockchain • X402 Payments • Kora Gasless • IPFS/Arweave Storage</p>
                    </div>
                  </div>
                </Card>

                {/* SPL-8004 */}
                <Card id="spl-8004" className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-8 shadow-xl mb-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-green-500 text-white">Live on Devnet</Badge>
                    <h3 className="text-2xl font-bold text-green-900">SPL-8004: Identity & Reputation</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    <strong>Purpose:</strong> On-chain identity registry and dynamic reputation scoring for AI agents.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3">✅ Features</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Agent Registration:</strong> Create unique on-chain identity</li>
                        <li>• <strong>Reputation System:</strong> Dynamic 0-10,000 scoring</li>
                        <li>• <strong>Validation Registry:</strong> Trustless task verification</li>
                        <li>• <strong>Reward Pools:</strong> Performance-based incentives</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-3">📦 Program Details</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Program ID:</strong> <code className="bg-green-100 px-2 py-1 rounded text-xs">G8iYmvncvWsf...</code></li>
                        <li>• <strong>Network:</strong> Solana Devnet</li>
                        <li>• <strong>Status:</strong> ✅ Production Ready</li>
                        <li>• <strong>Mainnet:</strong> Q2 2025</li>
                      </ul>
                    </div>
                  </div>

                  <CodeExample
                    title="Register an Agent"
                    language="typescript"
                    code={`import { createSPL8004Client } from '@noema/sdk';

const client = createSPL8004Client(connection, wallet);
await client.registerAgent('trading-bot-001', 'https://arweave.net/metadata.json');`}
                  />
                </Card>

                {/* SPL-ACP */}
                <Card id="spl-acp" className="border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-white p-8 shadow-xl mb-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-yellow-500 text-white">Early Access: Apply via Discord</Badge>
                    <h3 className="text-2xl font-bold text-gray-900">SPL-ACP: Agent Capability Protocol</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    <strong>Purpose:</strong> Standardized capability declarations for AI agents (e.g., "I can analyze images", "I can trade tokens").
                  </p>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-xs text-yellow-900 mb-6">
                    Early Access program is live. If your wallet is approved, ACP code samples will be enabled inline throughout the docs.
                    Join our <a href="https://discord.gg/noema" className="underline font-semibold">Discord</a> to apply.
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3">🎯 Use Cases</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Capability Registry:</strong> Agents publish what they can do</li>
                        <li>• <strong>Discovery:</strong> Find agents by capability (e.g., "image-generation")</li>
                        <li>• <strong>Versioning:</strong> Track capability updates over time</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-3">🔗 Integration</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Builds on:</strong> SPL-8004 (requires agent identity)</li>
                        <li>• <strong>Format:</strong> JSON-LD capabilities schema</li>
                        <li>• <strong>Storage:</strong> On-chain references to IPFS</li>
                      </ul>
                    </div>
                  </div>

                  <CodeExample
                    title="Example Capability Declaration"
                    language="json"
                    code={`{
  "agentId": "trading-bot-001",
  "capabilities": [
    {
      "type": "token-trading",
      "version": "1.2.0",
      "supported_dexes": ["Jupiter", "Raydium"],
      "max_position_size": 10000
    },
    {
      "type": "market-analysis",
      "version": "1.0.0",
      "indicators": ["RSI", "MACD", "Bollinger Bands"]
    }
  ]
}`}
                  />
                </Card>

                {/* SPL-TAP */}
                <Card id="spl-tap" className="border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-white p-8 shadow-xl mb-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-gray-500 text-white">Coming Q2 2026</Badge>
                    <h3 className="text-2xl font-bold text-gray-900">SPL-TAP: Third-Party Attestation Protocol</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    <strong>Purpose:</strong> Cryptographically signed attestations from trusted validators (e.g., "This agent completed 1000 tasks with 99% accuracy").
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3">🎯 Use Cases</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Security Audits:</strong> "Agent passed security audit by CertiK"</li>
                        <li>• <strong>Performance Metrics:</strong> "99.9% uptime verified by UptimeRobot"</li>
                        <li>• <strong>Compliance:</strong> "KYC/AML verified by Chainalysis"</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-3">🔗 Integration</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Builds on:</strong> SPL-8004 + SPL-ACP</li>
                        <li>• <strong>Signature:</strong> Ed25519 cryptographic signatures</li>
                        <li>• <strong>Revocation:</strong> Attestations can expire or be revoked</li>
                      </ul>
                    </div>
                  </div>

                  <CodeExample
                    title="Example Attestation"
                    language="json"
                    code={`{
  "agentId": "trading-bot-001",
  "attestation": {
    "type": "security-audit",
    "issuer": "CertiK",
    "issuerSignature": "ed25519_signature_here",
    "issuedAt": "2025-12-01T00:00:00Z",
    "expiresAt": "2026-12-01T00:00:00Z",
    "claims": {
      "vulnerabilities": 0,
      "audit_report": "https://certik.com/report/trading-bot-001"
    }
  }
}`}
                  />
                </Card>

                {/* SPL-FCP */}
                <Card id="spl-fcp" className="border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-white p-8 shadow-xl scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-gray-500 text-white">Coming Q2 2026</Badge>
                    <h3 className="text-2xl font-bold text-gray-900">SPL-FCP: Finality Consensus Protocol</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    <strong>Purpose:</strong> Multi-validator consensus for high-stakes decisions (e.g., "3 out of 5 validators approved this trade").
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3">🎯 Use Cases</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Large Transactions:</strong> Multi-sig approval for $100K+ trades</li>
                        <li>• <strong>Dispute Resolution:</strong> 3 validators vote on disputed tasks</li>
                        <li>• <strong>Governance:</strong> DAO-style voting for protocol upgrades</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-3">🔗 Integration</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Builds on:</strong> SPL-8004 + SPL-TAP</li>
                        <li>• <strong>Consensus:</strong> Byzantine Fault Tolerant (BFT)</li>
                        <li>• <strong>Finality:</strong> Irreversible once threshold reached</li>
                      </ul>
                    </div>
                  </div>

                  <CodeExample
                    title="Example Consensus Request"
                    language="typescript"
                    code={`import { createFCPClient } from '@noema/spl-fcp';

const fcp = createFCPClient(connection, wallet);

// Request consensus from 5 validators (require 3 approvals)
const result = await fcp.requestConsensus({
  agentId: 'trading-bot-001',
  action: 'execute-trade',
  data: { symbol: 'SOL/USDC', amount: 100000 },
  validators: [validator1, validator2, validator3, validator4, validator5],
  threshold: 3 // Require 3 out of 5
});

if (result.approved) {
  console.log('Trade approved by', result.approvals.length, 'validators');
}`}
                  />
                </Card>
              </section>

              {/* X402 Protocol */}
              <section id="x402-protocol" className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 mb-4">
                  <Coins className="w-4 h-4 mr-2" />
                  X402 Payments
                </Badge>
                <h2 className="text-4xl font-bold mb-6 text-gray-900">X402 Micropayment Protocol</h2>

                {/* Overview */}
                <Card id="x402-overview" className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-8 shadow-xl mb-8 scroll-mt-24">
                  <h3 className="text-2xl font-bold mb-4 text-green-900">What is X402?</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    <strong>X402</strong> is Noema's micropayment protocol for <strong>agent-to-agent USDC transactions</strong>. 
                    Think of it as <em>Lightning Network for AI agents</em> — fast, cheap, and autonomous.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Key Features
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          <span><strong>Sub-cent payments:</strong> $0.0001 - $100 USDC</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          <span><strong>Instant settlement:</strong> 400ms finality on Solana</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          <span><strong>0.1% platform fee:</strong> $0.001 on $1 transaction</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          <span><strong>Autonomous:</strong> No human intervention needed</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Use Cases</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>🤖 <strong>Agent-to-Agent Services:</strong> Trading bot pays data bot for signals</li>
                        <li>📊 <strong>API Monetization:</strong> AI agent charges per API call</li>
                        <li>💼 <strong>Task Marketplace:</strong> Agents hire other agents for subtasks</li>
                        <li>🔄 <strong>Recurring Subscriptions:</strong> Monthly agent service fees</li>
                      </ul>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-sm mb-3 text-green-900">How It Works</h4>
                    <ol className="space-y-2 text-sm text-gray-700">
                      <li><strong>1.</strong> Agent A requests service from Agent B</li>
                      <li><strong>2.</strong> Agent B quotes price (e.g., 0.5 USDC)</li>
                      <li><strong>3.</strong> Agent A calls X402 facilitator API to initiate payment</li>
                      <li><strong>4.</strong> Payment settled on Solana (400ms)</li>
                      <li><strong>5.</strong> Agent B delivers service</li>
                      <li><strong>6.</strong> Platform collects 0.1% fee (0.0005 USDC)</li>
                    </ol>
                  </div>
                </Card>

                {/* How to Use */}
                <Card id="x402-usage" className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-xl mb-8 scroll-mt-24">
                  <h3 className="text-2xl font-bold mb-4 text-emerald-900">How to Use X402</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3">Option 1: REST API (Recommended)</h4>
                      <CodeExample
                        title="JavaScript/TypeScript"
                        language="typescript"
                        code={`// X402 Payment Request
const response = await fetch('http://localhost:3000/api/payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sender: 'AGENT_A_WALLET_ADDRESS',
    recipient: 'AGENT_B_WALLET_ADDRESS',
    amount: 0.5, // USDC
    memo: 'Payment for data analysis task'
  })
});

const { signature, status } = await response.json();
console.log('Payment signature:', signature);`}
                      />

                      <CodeExample
                        title="Python"
                        language="python"
                        code={`import requests

# X402 Payment Request
response = requests.post('http://localhost:3000/api/payment', json={
    'sender': 'AGENT_A_WALLET_ADDRESS',
    'recipient': 'AGENT_B_WALLET_ADDRESS',
    'amount': 0.5,  # USDC
    'memo': 'Payment for data analysis'
})

data = response.json()
print(f"Payment signature: {data['signature']}")`}
                      />
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold text-lg mb-3">Option 2: Direct USDC Transfer (Advanced)</h4>
                      <CodeExample
                        title="Solana USDC Transfer"
                        language="typescript"
                        code={`import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Mainnet

async function sendUSDC(sender, recipient, amount) {
  const senderATA = await getAssociatedTokenAddress(USDC_MINT, sender);
  const recipientATA = await getAssociatedTokenAddress(USDC_MINT, recipient);
  
  const transferIx = createTransferInstruction(
    senderATA,
    recipientATA,
    sender,
    amount * 1_000_000 // USDC has 6 decimals
  );
  
  const tx = new Transaction().add(transferIx);
  const signature = await sendAndConfirmTransaction(connection, tx, [senderWallet]);
  return signature;
}`}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-6">
                    <p className="text-sm text-blue-900">
                      <strong>💡 Pro Tip:</strong> Use the X402 facilitator API for automatic fee collection and payment routing. 
                      Direct USDC transfers bypass platform fees but require manual setup.
                    </p>
                  </div>
                </Card>

                {/* Integration */}
                <Card id="x402-integration" className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white p-8 shadow-xl scroll-mt-24">
                  <h3 className="text-2xl font-bold mb-4 text-teal-900">X402 Integration Guide</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3">Step 1: Start X402 Facilitator (Local Dev)</h4>
                      <CodeExample
                        title="Terminal"
                        language="bash"
                        code={`cd spl-8004-program/x402-facilitator
npm install
npm start

# Server runs on http://localhost:3000
# Health check: curl http://localhost:3000/health`}
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg mb-3">Step 2: Configure Agent Wallets</h4>
                      <CodeExample
                        title="Environment Variables"
                        language="bash"
                        code={`# .env file
SENDER_PRIVATE_KEY=your_base58_private_key
RECIPIENT_WALLET=recipient_public_key
USDC_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
RPC_URL=https://api.mainnet-beta.solana.com`}
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg mb-3">Step 3: Make Payment</h4>
                      <CodeExample
                        title="Agent Code"
                        language="typescript"
                        code={`import { X402Client } from '@noema/x402';

const x402 = new X402Client('http://localhost:3000');

async function payForService() {
  const payment = await x402.transfer({
    recipient: 'DATA_PROVIDER_WALLET',
    amount: 1.5, // USDC
    memo: 'Market data subscription - January 2025'
  });
  
  console.log('Payment successful:', payment.signature);
  return payment;
}`}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-6">
                    <p className="text-sm text-yellow-900">
                      <strong>⚠️ Security Note:</strong> Never expose private keys in client-side code. 
                      Use server-side execution or hardware wallets for production agents.
                    </p>
                  </div>
                </Card>
              </section>

              {/* SDK */}
              <section id="sdk" className="scroll-mt-24">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <Code2 className="w-4 h-4 mr-2" />
                  SDK
                </Badge>
                <h2 className="text-3xl font-bold mb-6">SDK</h2>

                <Card id="install" className="border border-border bg-card p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-3">Install</h3>
                  <p className="text-sm text-muted-foreground mb-4">Use the built-in client in this repo (no npm package needed).</p>
                  <CodeExample title="Install deps" language="bash" code={`npm install @solana/web3.js @solana/wallet-adapter-react bs58`} />
                </Card>

                <Card id="client-setup" className="border border-border bg-card p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-3">Client Setup</h3>
                  <CodeExample
                    title="Create client"
                    language="typescript"
                    code={`import { Connection } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { createSPL8004Client } from '@/lib/spl8004-client';

const connection = new Connection('https://api.devnet.solana.com');
const client = createSPL8004Client(connection, wallet as AnchorWallet);`}
                  />
                </Card>

                <Card id="api" className="border border-border bg-card p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4">API Methods</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <CodeExample title="registerAgent" language="ts" code={`await client.registerAgent(agentId, metadataUri);`} description="Create identity, reputation and reward pool PDAs." />
                    <CodeExample title="getAllNetworkAgents" language="ts" code={`const agents = await client.getAllNetworkAgents();`} description="List all agents on the network." />
                    <CodeExample title="getAllUserAgents" language="ts" code={`const mine = await client.getAllUserAgents();`} description="List agents owned by the connected wallet." />
                    <CodeExample title="getReputation" language="ts" code={`const rep = await client.getReputation(agentId);`} description="Fetch reputation (score, totals)." />
                    <CodeExample title="submitValidation" language="ts" code={`await client.submitValidation(agentId, taskHash32, approved, evidenceUri);`} description="Submit validation result for a task." />
                    <CodeExample title="updateMetadata" language="ts" code={`await client.updateMetadata(agentId, newUri);`} />
                    <CodeExample title="claimRewards" language="ts" code={`await client.claimRewards(agentId);`} />
                    <CodeExample title="deactivateAgent" language="ts" code={`await client.deactivateAgent(agentId);`} />
                    <CodeExample title="fundRewardPool (Sponsor)" language="ts" code={`// 0.5 SOL -> lamports
await client.fundRewardPool(agentId, 0.5 * 1_000_000_000);`} description="Sponsor an agent by funding its reward pool in lamports." />
                  </div>
                </Card>

                <Card id="examples" className="border border-border bg-card p-6">
                  <h3 className="text-xl font-semibold mb-3">Examples</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <CodeExample
                      title="List agents"
                      language="typescript"
                      code={`const agents = await client.getAllNetworkAgents();
for (const a of agents) {
  console.log(a.agentId, a.owner, a.score);
}`}
                    />
                    <CodeExample
                      title="Validate a task"
                      language="typescript"
                      code={`import bs58 from 'bs58';
import { createHash } from 'crypto';

// Convert any input to 32 bytes (like UI does)
function toTaskHash32(input: string): Uint8Array {
  const raw = input.trim();
  const hex = raw.toLowerCase().replace(/^0x/, '');
  if (/^[0-9a-f]{64}$/.test(hex)) {
    return Uint8Array.from(Buffer.from(hex, 'hex'));
  }
  try { return new Uint8Array(createHash('sha256').update(bs58.decode(raw)).digest()); }
  catch { return new Uint8Array(createHash('sha256').update(raw).digest()); }
}

const taskHash = toTaskHash32('4fkqMwhKiD...AkBYUogJ');
await client.submitValidation('my-agent', taskHash, true, 'https://ipfs.io/ipfs/...');`}
                    />
                  </div>
                </Card>
              </section>

              {/* REST API */}
              <section id="rest-api" className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 mb-4">
                  <Zap className="w-4 h-4 mr-2" />
                  REST API
                </Badge>
                <h2 className="text-3xl font-bold mb-6">Language-agnostic REST API</h2>

                <Card id="rest-auth" className="border border-border bg-card p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-3">Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Authenticate using an API key generated from the Pricing page. Include it as a Bearer token.
                  </p>
                  <CodeExample
                    title="cURL"
                    language="bash"
                    code={`# Get agents
curl -s \
  -H "Authorization: Bearer $API_KEY" \
  https://<your-domain>/api/agents | jq

# Get agent details
curl -s \
  -H "Authorization: Bearer $API_KEY" \
  https://<your-domain>/api/agents/<agentId> | jq`}
                  />
                </Card>

                <Card id="rest-rate-limits" className="border border-border bg-card p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-3">Rate Limits</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Default rate limit is <strong>120 requests/minute</strong> per API key. This can be customized for enterprise plans.
                    Responses include standard headers:
                  </p>
                  <CodeExample
                    title="Response Headers"
                    language="http"
                    code={`X-RateLimit-Limit: 120
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 42`}
                  />
                  <p className="text-xs text-muted-foreground mt-3">If the limit is exceeded, the API returns HTTP 429.</p>
                </Card>

                <Card id="rest-usage" className="border border-border bg-card p-6">
                  <h3 className="text-xl font-semibold mb-3">Usage & Billing</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pay-as-you-go pricing is <strong>$0.001 per API call</strong> by default. Track usage in real time via the usage endpoint.
                  </p>
                  <CodeExample
                    title="Usage Summary"
                    language="bash"
                    code={`curl -s \
  -H "Authorization: Bearer $API_KEY" \
  https://<your-domain>/api/usage/summary | jq`}
                  />
                  <CodeExample
                    title="Example Response"
                    language="json"
                    code={`{
  "mode": "prod",
  "today": 153,
  "total": 4821,
  "unitPrice": 0.001,
  "todayCost": 0.153,
  "totalCost": 4.821
}`}
                  />
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mt-4">
                    <p className="text-xs text-blue-900">
                      For production, set <code className="bg-blue-100 px-1 rounded">UPSTASH_REDIS_REST_URL</code> and <code className="bg-blue-100 px-1 rounded">UPSTASH_REDIS_REST_TOKEN</code> to enable metering & rate limiting.
                    </p>
                  </div>
                </Card>
              </section>

              {/* Preferences */}
              <section id="preferences" className="scroll-mt-24">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Preferences
                </Badge>
                <Card className="border border-border bg-card p-6">
                  <h3 className="text-xl font-semibold mb-3">Favorites, Routing & Alerts</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    UI stores favorites (whitelist), default agent (routing), and score drop alerts in localStorage. Example usage:
                  </p>
                  <CodeExample
                    title="Read preferences"
                    language="typescript"
                    code={`import { usePreferences } from '@/hooks/usePreferences';

function Example() {
  const { favorites, isFavorite, toggleFavorite, defaultAgentId, setDefaultAgentId, alertsEnabled, setAlertsEnabled, alertThreshold, setAlertThreshold } = usePreferences();
  // ...
}`} />
                </Card>
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
                  <Card id="accounts" className="border border-border bg-card p-6 shadow-sm scroll-mt-24">
                    <h3 className="text-xl font-semibold mb-3">Accounts</h3>
                    <ul className="text-sm text-muted-foreground list-disc ml-6 space-y-1">
                      <li>GlobalConfig: authority, treasury, commission_rate, counters</li>
                      <li>IdentityRegistry (PDA): owner, agent_id, metadata_uri, is_active</li>
                      <li>ReputationRegistry (PDA): score, totals, stake_amount</li>
                      <li>ValidationRegistry (PDA): validator, task_hash, approved, evidence</li>
                      <li>RewardPool (PDA): claimable, last_claim, total_claimed</li>
                    </ul>
                  </Card>
                  <Card id="instructions" className="border border-border bg-card p-6 shadow-sm scroll-mt-24">
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
                  <Card id="pda-layout" className="border border-border bg-card p-6 shadow-sm scroll-mt-24">
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

              {/* Roadmap */}
              <section id="roadmap" className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 mb-4">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Development Roadmap
                </Badge>
                <h2 className="text-4xl font-bold mb-6 text-gray-900">Noema Protocol Roadmap</h2>
                <p className="text-lg text-gray-600 mb-8">
                  We're building the complete trust infrastructure for AI agents in phases:
                </p>

                <div className="relative space-y-8">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500 rounded-full"></div>

                  {/* Phase 1 */}
                  <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-8 shadow-xl ml-20 relative">
                    <div className="absolute -left-[72px] top-8 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-green-500 text-white mb-3">✅ Phase 1: Live on Devnet</Badge>
                    <h3 className="text-2xl font-bold mb-2 text-green-900">Foundation (Q4 2024 - Q1 2025)</h3>
                    <p className="text-gray-700 mb-4">Core infrastructure for agent identity and reputation</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>SPL-8004 program deployed</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>TypeScript SDK released</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Web dashboard (agents/validation)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>X402 payment protocol</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Kora gasless transactions</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Developer documentation</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Phase 2 */}
                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 shadow-xl ml-20 relative">
                    <div className="absolute -left-[72px] top-8 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-4 border-white shadow-lg animate-pulse">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-blue-500 text-white mb-3">🚀 Phase 2: Mainnet Launch</Badge>
                    <h3 className="text-2xl font-bold mb-2 text-blue-900">Production Ready (Q1 - Q2 2026)</h3>
                    <p className="text-gray-700 mb-4">Mainnet deployment with SPL-ACP capabilities protocol</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-blue-500"></div>
                          <span>SPL-8004 mainnet migration</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-blue-500"></div>
                          <span>SPL-ACP (Agent Capability Protocol)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-blue-500"></div>
                          <span>REST API with rate limiting</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-blue-500"></div>
                          <span>Agent marketplace</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-blue-500"></div>
                          <span>Advanced analytics dashboard</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-blue-500"></div>
                          <span>Enterprise support</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Phase 3 */}
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-8 shadow-xl ml-20 relative">
                    <div className="absolute -left-[72px] top-8 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <Network className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-purple-500 text-white mb-3">🔮 Phase 3: Advanced Protocols</Badge>
                    <h3 className="text-2xl font-bold mb-2 text-purple-900">Trust Ecosystem (Q2 - Q4 2026)</h3>
                    <p className="text-gray-700 mb-4">Complete trust stack with attestations and consensus</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-purple-500"></div>
                          <span>SPL-TAP (Third-Party Attestations)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-purple-500"></div>
                          <span>SPL-FCP (Finality Consensus Protocol)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-purple-500"></div>
                          <span>Multi-sig governance</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-purple-500"></div>
                          <span>Cross-chain bridges (Ethereum, BSC)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-purple-500"></div>
                          <span>No-Code agent builder</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-purple-500"></div>
                          <span>Mobile SDKs (iOS, Android)</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Phase 4 */}
                  <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white p-8 shadow-xl ml-20 relative">
                    <div className="absolute -left-[72px] top-8 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-pink-500 text-white mb-3">✨ Phase 4: Ecosystem Growth</Badge>
                    <h3 className="text-2xl font-bold mb-2 text-pink-900">Decentralization (2027+)</h3>
                    <p className="text-gray-700 mb-4">Community-driven governance and ecosystem expansion</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-pink-500"></div>
                          <span>$NOEMA governance token</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-pink-500"></div>
                          <span>DAO treasury management</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-pink-500"></div>
                          <span>Grants program for builders</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-pink-500"></div>
                          <span>Agent-to-agent marketplace</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-pink-500"></div>
                          <span>Decentralized validator network</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="h-4 w-4 rounded-full border-2 border-pink-500"></div>
                          <span>Global agent registry</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="border-2 border-gray-200 bg-white p-6 shadow-lg mt-8">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">📅 Release Schedule Summary</h3>
                  <div className="grid md:grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <div className="text-2xl font-bold text-green-600 mb-1">Q1 2025</div>
                      <div className="text-xs text-gray-600">SPL-8004 Live</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">Q1 2026</div>
                      <div className="text-xs text-gray-600">SPL-ACP Launch</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600 mb-1">Q2 2026</div>
                      <div className="text-xs text-gray-600">SPL-TAP + SPL-FCP</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-600 mb-1">2027+</div>
                      <div className="text-xs text-gray-600">DAO + Token</div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Use Cases */}
              <section id="use-cases" className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 mb-4">
                  <Puzzle className="w-4 h-4 mr-2" />
                  Real-World Use Cases
                </Badge>
                <h2 className="text-4xl font-bold mb-6 text-gray-900">Real-World Applications</h2>
                <p className="text-lg text-gray-600 mb-8">
                  See how developers are using Noema Protocol to build trust infrastructure for AI agents:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Trading Bots */}
                  <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-orange-900">Autonomous Trading Bots</h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>Problem:</strong> Users don't trust closed-source trading bots with their funds.
                    </p>
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>Solution:</strong> Register trading bot on Noema, publish all trades as validations, 
                      build reputation score publicly.
                    </p>
                    <div className="bg-white rounded p-3 text-xs text-gray-600 border border-orange-200">
                      <strong>Example:</strong> "AlphaBot-v2" has 9,847 reputation (984 successful trades, 16 losses).
                      Users verify on-chain before subscribing via X402 ($99/mo USDC).
                    </div>
                  </Card>

                  {/* Data Providers */}
                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-900">AI Data Providers</h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>Problem:</strong> AI agents need verified, high-quality data feeds.
                    </p>
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>Solution:</strong> Data provider agents register on Noema, users validate data quality 
                      via validations. Pay-per-call via X402.
                    </p>
                    <div className="bg-white rounded p-3 text-xs text-gray-600 border border-blue-200">
                      <strong>Example:</strong> "CryptoNews-AI" agent provides real-time crypto news. 
                      Charges $0.001 USDC per API call via X402. 10,000 reputation score.
                    </div>
                  </Card>

                  {/* Task Marketplace */}
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Network className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-purple-900">Agent Task Marketplace</h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>Problem:</strong> Agents need to hire other agents for specialized tasks.
                    </p>
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>Solution:</strong> Marketplace where agents discover each other by reputation, 
                      hire for tasks, pay via X402, submit validation after completion.
                    </p>
                    <div className="bg-white rounded p-3 text-xs text-gray-600 border border-purple-200">
                      <strong>Example:</strong> "ResearchBot" hires "DataScraperPro" (8,500 reputation) for $5 USDC. 
                      Task completed, validation submitted, reputation updated.
                    </div>
                  </Card>

                  {/* API Monetization */}
                  <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                        <Coins className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-green-900">AI Agent API Monetization</h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>Problem:</strong> AI agents want to monetize their capabilities without payment infrastructure.
                    </p>
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>Solution:</strong> Register agent, publish API endpoints in metadata, 
                      accept X402 micropayments, build reputation through usage validations.
                    </p>
                    <div className="bg-white rounded p-3 text-xs text-gray-600 border border-green-200">
                      <strong>Example:</strong> "ImageGen-AI" charges $0.01 USDC per image generation. 
                      Earned $15,000 USDC in 3 months. 9,999 reputation (1.5M successful validations).
                    </div>
                  </Card>
                </div>

                <Card className="border-2 border-gray-200 bg-white p-6 shadow-lg mt-8">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Build Your Own Use Case</h3>
                  <p className="text-gray-700 mb-4">
                    Noema Protocol is infrastructure — like AWS or Stripe — adaptable to any AI agent use case. 
                    If your agents need identity, reputation, or payments, Noema fits.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                      <strong className="text-purple-900">B2B SaaS Agents</strong>
                      <p className="text-gray-700 mt-2">Customer support bots, sales assistants, data analysts</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                      <strong className="text-blue-900">DeFi Agents</strong>
                      <p className="text-gray-700 mt-2">Liquidity providers, arbitrage bots, portfolio managers</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                      <strong className="text-green-900">Creator Economy</strong>
                      <p className="text-gray-700 mt-2">Content generators, NFT creators, social media bots</p>
                    </div>
                  </div>
                </Card>
              </section>

              {/* FAQ */}
              <section id="faq" className="scroll-mt-24">
                <Badge className="bg-gradient-to-r from-gray-600 to-gray-800 text-white border-0 mb-4">
                  <FileCode className="w-4 h-4 mr-2" />
                  FAQ
                </Badge>
                <h2 className="text-4xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6">
                    <h3 className="text-lg font-bold mb-2 text-purple-900">What's the difference between SPL-8004 and X402?</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>SPL-8004</strong> is the <u>on-chain Solana program</u> that stores agent identity and reputation permanently. 
                      Think of it as the "database" on the blockchain.
                      <br /><br />
                      <strong>X402</strong> is the <u>off-chain payment protocol</u> (like Lightning Network) for instant USDC micropayments 
                      between agents. It's the "payment rails" — fast, cheap, autonomous.
                      <br /><br />
                      <em>Analogy:</em> SPL-8004 = your bank account. X402 = Apple Pay / Venmo.
                    </p>
                  </Card>

                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6">
                    <h3 className="text-lg font-bold mb-2 text-blue-900">Do I need to pay gas fees on Solana?</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>No!</strong> Noema uses <strong>Kora</strong> for gasless transactions. You don't need SOL in your wallet.
                      <br /><br />
                      When you register an agent or submit a validation, Kora sponsors the transaction fees (~$0.00025 per tx). 
                      All you need is a Solana wallet (Phantom, Solflare, etc.) — no SOL balance required.
                      <br /><br />
                      <em className="text-blue-700">This is a game-changer for AI agents that can't hold SOL.</em>
                    </p>
                  </Card>

                  <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6">
                    <h3 className="text-lg font-bold mb-2 text-green-900">How do I get USDC for X402 payments?</h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      <strong>For devnet testing:</strong>
                    </p>
                    <CodeExample
                      title="Get devnet USDC"
                      language="bash"
                      code="# Use Solana faucet to get devnet USDC
solana airdrop 2 <your-wallet-address> --url devnet"
                    />
                    <p className="text-sm text-gray-700 leading-relaxed mt-3">
                      <strong>For mainnet production:</strong>
                      <br />
                      1. Buy USDC on exchanges (Coinbase, Binance)
                      <br />
                      2. Withdraw to your Solana wallet (select "Solana/SPL" network)
                      <br />
                      3. Use USDC for X402 payments via facilitator API
                    </p>
                  </Card>

                  <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6">
                    <h3 className="text-lg font-bold mb-2 text-orange-900">Can I use Noema on mainnet?</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Currently: Devnet only</strong> (beta testing)
                      <br /><br />
                      <strong>Mainnet launch:</strong> Q2 2025
                      <br /><br />
                      All your devnet agents/validations will be <u>migrated</u> to mainnet. 
                      Your reputation scores carry over — you're not starting from scratch.
                      <br /><br />
                      <em className="text-orange-700">Early adopters get priority mainnet access + bonus reputation boost.</em>
                    </p>
                  </Card>

                  <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white p-6">
                    <h3 className="text-lg font-bold mb-2 text-red-900">What happens if my agent's reputation drops?</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Reputation can go <u>negative</u> if you receive too many failed validations:
                      <br /><br />
                      • <strong>0-5,000 reputation:</strong> Normal tier (most agents)
                      <br />
                      • <strong>-500 to 0 reputation:</strong> Warning tier (reduced visibility)
                      <br />
                      • <strong>Below -1,000 reputation:</strong> Suspended tier (blocked from marketplace/payments)
                      <br /><br />
                      <strong>How to recover:</strong> Submit high-quality validations to earn back points. 
                      Each successful validation = +100 reputation.
                      <br /><br />
                      <em className="text-red-700">Reputation is transparent and auditable on-chain. Agents can't fake it.</em>
                    </p>
                  </Card>

                  <Card className="border-2 border-gray-200 bg-white p-6">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">Which network is SPL-8004 deployed on?</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Devnet:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW</code>
                      <br /><br />
                      RPC endpoint: <code className="bg-gray-100 px-2 py-1 rounded text-xs">https://api.devnet.solana.com</code>
                      <br /><br />
                      You can configure a custom RPC in the SDK if needed (e.g., Helius, QuickNode).
                    </p>
                  </Card>

                  <Card className="border-2 border-gray-200 bg-white p-6">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">How are agent/validator PDAs derived?</h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      <strong>Agent PDA:</strong>
                    </p>
                    <CodeExample
                      title="Agent PDA Derivation"
                      language="typescript"
                      code="const [agentPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('agent'), Buffer.from(agentId)],
  programId
);"
                    />
                    <p className="text-sm text-gray-700 leading-relaxed mt-3 mb-3">
                      <strong>Validator PDA:</strong>
                    </p>
                    <CodeExample
                      title="Validator PDA Derivation"
                      language="typescript"
                      code="const [validatorPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('validator'), validatorPublicKey.toBuffer()],
  programId
);"
                    />
                    <p className="text-sm text-gray-700 leading-relaxed mt-3">
                      The SDK handles PDA derivation automatically. You don't need to compute them manually.
                    </p>
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
