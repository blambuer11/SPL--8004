import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeExample } from '@/components/CodeExample';
import { BookOpen, Rocket, Code2, Puzzle, Shield, Zap, Bot, Database, FileCode, Sparkles, ChevronRight, TrendingUp, CheckCircle2, Coins, Network } from 'lucide-react';

const sections = [
  { id: 'introduction', title: 'Introduction', icon: BookOpen },
  { id: 'what-is-spl8004', title: 'What is SPL-8004?', icon: Sparkles },
  { id: 'problem', title: 'Problem We Solve', icon: Shield },
  { id: 'features', title: 'Core Features', icon: Zap },
  { id: 'getting-started', title: 'Getting Started', icon: Rocket },
  { id: 'integration', title: 'Integration Guide', icon: Puzzle },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState('introduction');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-950/5 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <Card className="border-primary/20 bg-card/50 backdrop-blur p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-foreground mb-1">Documentation</h2>
                  <p className="text-xs text-muted-foreground">SPL-8004 Protocol</p>
                </div>
                <Separator className="mb-4" />
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <nav className="space-y-1">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                            activeSection === section.id
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1 text-left">{section.title}</span>
                          {activeSection === section.id && (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
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
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
