import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, Code2, Database, Rocket, Shield, Zap, Network, 
  CheckCircle2, AlertCircle, Box, FileCode, GitBranch, 
  Terminal, Package, Settings, ArrowRight, ExternalLink,
  ChevronRight, ChevronDown, Briefcase
} from 'lucide-react';

type Section = {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  subsections?: { id: string; title: string }[];
};

const sections: Section[] = [
  {
    id: 'overview',
    title: 'Overview',
    icon: BookOpen,
    subsections: [
      { id: 'intro', title: 'Introduction' },
      { id: 'architecture', title: 'Architecture' },
      { id: 'key-features', title: 'Key Features' },
    ]
  },
  {
    id: 'smart-contracts',
    title: 'Smart Contracts',
    icon: FileCode,
    subsections: [
      { id: 'deployed-contracts', title: 'Deployed Contracts' },
      { id: 'program-accounts', title: 'Program Accounts' },
      { id: 'instructions', title: 'Instructions' },
    ]
  },
  {
    id: 'autonomous-payments',
    title: 'Autonomous Payments',
    icon: Zap,
    subsections: [
      { id: 'protocol-overview', title: 'Protocol Overview' },
      { id: 'implementation', title: 'Implementation' },
      { id: 'security', title: 'Security Features' },
    ]
  },
  {
    id: 'sdk',
    title: 'SDK & Integration',
    icon: Code2,
    subsections: [
      { id: 'installation', title: 'Installation' },
      { id: 'quickstart', title: 'Quick Start' },
      { id: 'advanced-usage', title: 'Advanced Usage' },
    ]
  },
  {
    id: 'rest-api',
    title: 'REST API',
    icon: Network,
    subsections: [
      { id: 'api-authentication', title: 'Authentication' },
      { id: 'api-endpoints', title: 'Endpoints' },
      { id: 'rate-limits', title: 'Rate Limits' },
    ]
  },
  {
    id: 'x404-bridge',
    title: 'X404 NFT Bridge',
    icon: Package,
    subsections: [
      { id: 'x404-overview', title: 'Overview' },
      { id: 'x404-tokenize', title: 'Tokenize Agent' },
      { id: 'x404-marketplace', title: 'Marketplace' },
    ]
  },
  {
    id: 'protocol-extensions',
    title: 'Protocol Extensions',
    icon: GitBranch,
    subsections: [
      { id: 'acp-protocol', title: 'SPL-ACP: Agent Communication' },
      { id: 'tap-protocol', title: 'SPL-TAP: Tool Attestation' },
      { id: 'fcp-protocol', title: 'SPL-FCP: Function Call Consensus' },
    ]
  },
  {
    id: 'marketplace',
    title: 'Agent Marketplace',
    icon: Briefcase,
    subsections: [
      { id: 'marketplace-overview', title: 'Overview' },
      { id: 'hiring-agents', title: 'Hiring Agents' },
      { id: 'usdc-payments', title: 'USDC Payments' },
    ]
  },
  {
    id: 'validator-staking',
    title: 'Validator Staking',
    icon: Shield,
    subsections: [
      { id: 'staking-overview', title: 'Overview' },
      { id: 'how-to-stake', title: 'How to Stake' },
      { id: 'rewards', title: 'Rewards & Fees' },
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: AlertCircle,
    subsections: [
      { id: 'common-issues', title: 'Common Issues' },
      { id: 'error-codes', title: 'Error Codes' },
      { id: 'faq', title: 'FAQ' },
    ]
  },
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('intro');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section-id]');
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const element = section as HTMLElement;
        const top = element.offsetTop;
        const height = element.offsetHeight;
        const id = element.getAttribute('data-section-id');

        if (scrollPosition >= top && scrollPosition < top + height && id) {
          setActiveSection(id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold">
              ∩
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Noema Protocol</h1>
              <p className="text-xs text-slate-600">Documentation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              v1.0.0
            </Badge>
            <a 
              href="https://github.com/blambuer11/NOEMA-8004" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900"
            >
              <GitBranch className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-24">
            <ScrollArea className="h-[calc(100vh-120px)]">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon || Box;
                  const isExpanded = expandedSections.has(section.id);
                  const hasSubsections = section.subsections && section.subsections.length > 0;

                  return (
                    <div key={section.id}>
                      <button
                        onClick={() => {
                          if (hasSubsections) {
                            toggleSection(section.id);
                          } else {
                            scrollToSection(section.id);
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{section.title}</span>
                        {hasSubsections && (
                          isExpanded ? 
                            <ChevronDown className="w-4 h-4" /> : 
                            <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      {hasSubsections && isExpanded && (
                        <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-2">
                          {section.subsections.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => scrollToSection(sub.id)}
                              className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                                activeSection === sub.id
                                  ? 'text-slate-900 font-medium bg-slate-100'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              {sub.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </ScrollArea>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl">
          <div className="space-y-12">
            
            {/* Introduction */}
            <section data-section-id="intro" className="scroll-mt-24">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Introduction</h2>
                  <p className="text-lg text-slate-600">
                    Noema Protocol is the trust infrastructure for autonomous AI agents on Solana.
                  </p>
                </div>

                <Card className="p-6 border-slate-200">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-3">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">Identity</h3>
                      <p className="text-sm text-slate-600">On-chain agent identity & reputation</p>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 text-purple-600 mb-3">
                        <Zap className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">Payments</h3>
                      <p className="text-sm text-slate-600">Autonomous USDC transactions</p>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600 mb-3">
                        <Network className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">Validation</h3>
                      <p className="text-sm text-slate-600">Decentralized consensus</p>
                    </div>
                  </div>
                </Card>

                <div className="prose prose-slate max-w-none">
                  <h3>What Problem Does It Solve?</h3>
                  <p>
                    As AI agents become autonomous, they need:
                  </p>
                  <ul>
                    <li><strong>Verifiable Identity:</strong> Prove who they are without central authority</li>
                    <li><strong>Payment Capability:</strong> Send and receive value independently</li>
                    <li><strong>Reputation System:</strong> Build trust through verified actions</li>
                    <li><strong>Instant Verification:</strong> Authenticate each other in real-time</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <img
                      src="/docs/diyagram.png"
                      alt="NOEMA-8004 System Diagram"
                      className="w-full h-auto max-h-[520px] object-contain rounded-lg"
                    />
                    <div className="text-xs text-slate-500 mt-2 text-center">Figure: NOEMA-8004 Suite — Identity, Payments, Validation</div>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Architecture */}
            <section data-section-id="architecture" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Architecture</h2>
              
              <Card className="p-6 border-slate-200 mb-6">
                <div className="bg-slate-50 rounded-lg p-8 font-mono text-xs">
                  <pre className="text-slate-700">
{`┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│                   https://app.noemaprotocol.xyz             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Solana Wallet Adapter
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Solana Blockchain                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  NOEMA-8004      │  │  Validator     │  │  SPL Token   │  │
│  │  Program       │  │  Staking       │  │  (USDC)      │  │
│  │                │  │                │  │              │  │
│  │  Program ID:   │  │  Min: 0.1 SOL  │  │  Payments    │  │
│  │  G8iYmv...     │  │  Cooldown: 7d  │  │  Transfers   │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
┌──────────────────────────┴──────────────────────────────────┐
│              Autonomous Payment Scripts                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  api/automation/                                       │ │
│  │    ├─ auto-pay.mjs (periodic payments)                │ │
│  │    ├─ delivery-handshake.mjs (agent verification)     │ │
│  │    └─ noema8004-resolver.mjs (identity lookup)          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-600" />
                    On-Chain Components
                  </h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>NOEMA-8004 Identity Program</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Validator Staking System</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>PDA Account Structure</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    Off-Chain Services
                  </h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>X402 Facilitator (port 3001)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Autonomous Payment Scripts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Identity Resolver</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </section>

            <Separator />

            {/* Deployed Contracts */}
            <section data-section-id="deployed-contracts" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Deployed Smart Contracts</h2>

              <Card className="p-6 border-slate-200 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">NOEMA-8004 Identity Program</h3>
                    <p className="text-sm text-slate-600">Main identity and reputation smart contract</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Live on Devnet</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50">
                    <FileCode className="w-4 h-4 text-slate-600" />
                    <div className="flex-1 font-mono text-xs text-slate-700">
                      <span className="text-slate-500">Program ID:</span> G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW
                    </div>
                    <a 
                      href="https://explorer.solana.com/address/G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW?cluster=devnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-slate-600 mb-1">Network</div>
                      <div className="font-semibold text-slate-900">Solana Devnet</div>
                    </div>
                    <div>
                      <div className="text-slate-600 mb-1">Language</div>
                      <div className="font-semibold text-slate-900">Rust (Anchor)</div>
                    </div>
                    <div>
                      <div className="text-slate-600 mb-1">Version</div>
                      <div className="font-semibold text-slate-900">v1.0.0</div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="prose prose-slate max-w-none">
                <h3>Contract Features</h3>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>Function</th>
                      <th>Description</th>
                      <th>Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>initialize</code></td>
                      <td>Initialize global config</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <td><code>stake_validator</code></td>
                      <td>Stake SOL to become validator</td>
                      <td>Min 0.1 SOL</td>
                    </tr>
                    <tr>
                      <td><code>unstake_validator</code></td>
                      <td>Unstake SOL (7-day cooldown)</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <Separator />

            {/* Program Accounts */}
            <section data-section-id="program-accounts" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Program Accounts</h2>

              <div className="space-y-4">
                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Config Account</h3>
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-100 overflow-x-auto">
                    <pre>{`pub struct Config {
    pub authority: Pubkey,           // 32 bytes
    pub registration_fee: u64,       // 8 bytes (0.005 SOL)
    pub validation_fee: u64,         // 8 bytes (0.001 SOL)
    pub validator_min_stake: u64,    // 8 bytes (0.1 SOL)
}

// PDA Seeds: ["config"]`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Validator Account</h3>
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-100 overflow-x-auto">
                    <pre>{`pub struct Validator {
    pub authority: Pubkey,             // 32 bytes
    pub staked_amount: u64,            // 8 bytes
    pub is_active: bool,               // 1 byte
    pub last_stake_timestamp: i64,     // 8 bytes
    pub total_validations: u64,        // 8 bytes
}

// PDA Seeds: ["validator", user.key()]`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Identity Account (NOEMA-8004)</h3>
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-100 overflow-x-auto">
                    <pre>{`pub struct IdentityRegistry {
    pub owner: Pubkey,                 // 32 bytes
    pub agent_id: String,              // variable
    pub metadata_uri: String,          // variable
    pub created: i64,                  // 8 bytes
    pub updated: i64,                  // 8 bytes
    pub is_active: bool,               // 1 byte
    pub bump: u8,                      // 1 byte
}

// PDA Seeds: ["identity", agent_id]`}</pre>
                  </div>
                </Card>
              </div>
            </section>

            <Separator />

            {/* Autonomous Payments */}
            <section data-section-id="protocol-overview" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Autonomous Payment Protocol</h2>

              <Card className="p-6 border-l-4 border-l-purple-500 bg-purple-50 mb-6">
                <div className="flex items-start gap-3">
                  <Rocket className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">Real-World Use Case: Drone Delivery</h3>
                    <p className="text-sm text-purple-800">
                      A delivery drone arrives at a home. The home robot verifies the drone's identity via NOEMA-8004,
                      generates a challenge, verifies the signature, and watches for USDC payment. Once confirmed,
                      the door automatically unlocks.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="prose prose-slate max-w-none mb-6">
                <h3>Protocol Flow</h3>
              </div>

              <Card className="p-6 border-slate-200">
                <div className="bg-slate-50 rounded-lg p-6 font-mono text-xs">
                  <pre className="text-slate-700">
{`Step 1: Identity Exchange
┌─────────┐                           ┌──────────┐
│  Drone  │──── agentId: "drone-001"─→│   Home   │
│ (Payer) │                           │ (Receiver)│
└─────────┘                           └──────────┘

Step 2: On-Chain Verification
                    ┌──────────────────┐
                    │  NOEMA-8004 PDA    │
                    │  Identity Lookup │
                    │  ✅ Verified     │
                    └──────────────────┘

Step 3: Challenge-Response
┌─────────┐                           ┌──────────┐
│  Drone  │←── Challenge (nonce+ts)───│   Home   │
│         │                           │          │
│         │─── Sign with Ed25519 ────→│          │
└─────────┘    Verify Signature       └──────────┘

Step 4: Payment Transfer
┌─────────┐                           ┌──────────┐
│  Drone  │─── USDC Transfer ────────→│   Home   │
│         │    Memo: HANDSHAKE|...    │          │
│         │                           │ ✅ Verify│
└─────────┘                           └──────────┘

Step 5: Action Trigger
                    ┌──────────────────┐
                    │   🚪 Door Opens  │
                    │   Package        │
                    │   Delivered      │
                    └──────────────────┘`}
                  </pre>
                </div>
              </Card>
            </section>

            <Separator />

            {/* Implementation */}
            <section data-section-id="implementation" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Implementation Guide</h2>

              <div className="space-y-4">
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h3 className="font-semibold text-slate-900">Register Agents</h3>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`// Register drone agent
agentId: "drone-001"
metadataUri: "https://metadata.noema.xyz/drone-001.json"

// Register home agent
agentId: "home-001"
metadataUri: "https://metadata.noema.xyz/home-001.json"

// Fee: 0.005 SOL per agent`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h3 className="font-semibold text-slate-900">Setup Environment</h3>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`# .env configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
DELIVERY_FEE_USDC=0.05
TIMEOUT_MS=60000`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h3 className="font-semibold text-slate-900">Run Scripts</h3>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`# Terminal 1: Home robot waiting
MODE=home AGENT_ID=drone-001 \\
npm run delivery-handshake:home

# Terminal 2: Drone sending payment
MODE=drone AGENT_ID=home-001 \\
npm run delivery-handshake:drone`}</pre>
                  </div>
                </Card>
              </div>
            </section>

            <Separator />

            {/* Security */}
            <section data-section-id="security" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Security Features</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-slate-900">Implemented</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Ed25519 signature verification (tweetnacl)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Timestamp freshness validation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>On-chain identity verification (PDA)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Amount + memo validation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Challenge-response protocol</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-slate-900">Recommended for Production</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Nonce replay protection (Redis)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>On-chain receipt PDA for audit trail</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Rate limiting per agent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>WebSocket for real-time monitoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Multi-signature support</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </section>

            <Separator />

            {/* SDK Installation */}
            <section data-section-id="installation" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">SDK Installation</h2>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                You can use two different SDKs in the Noema ecosystem. <code className="bg-slate-100 px-1 rounded">@noema-8004/sdk</code> is the <span className="font-medium">primary open-source</span> package focused on direct blockchain & validator integration. <code className="bg-slate-100 px-1 rounded">@noema/sdk</code> provides <span className="font-medium">hosted API</span> features and managed payment flows. Both share the same agent concept; the choice depends on your use case.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">Primary SDK (@noema-8004/sdk)</h3>
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">On‑Chain</span>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`npm install @noema-8004/sdk
# veya
yarn add @noema-8004/sdk
# veya
pnpm add @noema-8004/sdk`}</pre>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">API key <strong>gerekmez</strong>; doğrulayıcı URL ve ağ ayarları ile çalışır.</p>
                </Card>

                <Card className="p-4 border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">Hosted SDK (@noema/sdk)</h3>
                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">Managed</span>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`npm install @noema/sdk
# veya
yarn add @noema/sdk
# veya
pnpm add @noema/sdk`}</pre>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">API key <strong>zorunlu</strong>; otomatik ödeme & kullanım istatistikleri cloud üzerinden sağlanır.</p>
                </Card>
              </div>

              <Card className="p-4 border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Ortak Bağımlılıklar</h3>
                <div className="prose prose-slate prose-sm max-w-none">
                  <table>
                    <thead>
                      <tr>
                        <th>Paket</th>
                        <th>Versiyon</th>
                        <th>Açıklama</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>@solana/web3.js</code></td>
                        <td>^1.98.4</td>
                        <td>Solana RPC & hesap işlemleri</td>
                      </tr>
                      <tr>
                        <td><code>@solana/spl-token</code></td>
                        <td>^0.4.14</td>
                        <td>USDC / SPL token transferleri</td>
                      </tr>
                      <tr>
                        <td><code>tweetnacl</code></td>
                        <td>^1.0.3</td>
                        <td>Ed25519 imza doğrulama</td>
                      </tr>
                      <tr>
                        <td><code>bs58</code></td>
                        <td>^6.x</td>
                        <td>Base58 key encode/decode</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>

            <Separator />

            {/* Quick Start */}
            <section data-section-id="quickstart" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Quick Start</h2>
              <div className="space-y-6">
                {/* Step 1 */}
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                    <h3 className="font-semibold text-slate-900">Generate Agent Keypair</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <div className="text-[10px] mb-2 font-semibold text-blue-300">@noema-8004/sdk</div>
                      <pre>{`import { generateAgentKeypair } from '@noema-8004/sdk';

const { publicKey, privateKey } = generateAgentKeypair();
console.log('Public Key:', publicKey);
// .env -> AGENT_PRIVATE_KEY=<privateKey>`}</pre>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <div className="text-[10px] mb-2 font-semibold text-purple-300">@noema/sdk</div>
                      <pre>{`import { generateAgentKeypair } from '@noema/sdk';

const { publicKey, privateKey } = generateAgentKeypair();
console.log('Public Key:', publicKey);
// .env -> AGENT_PRIVATE_KEY=<privateKey>
// .env -> NOEMA_API_KEY=<apiKey>`}</pre>
                    </div>
                  </div>
                </Card>

                {/* Step 2 */}
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                    <h3 className="font-semibold text-slate-900">Create Agent Client</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <div className="text-[10px] mb-2 font-semibold text-blue-300">@noema-8004/sdk</div>
                      <pre>{`import { createAgent } from '@noema-8004/sdk';

const agent = createAgent({
  agentId: 'trading-bot-001',
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  network: 'devnet',
  validatorApiUrl: 'https://validator.spl8004.io'
});

const identity = await agent.getIdentity();
console.log('Reputation:', identity.reputation);`}</pre>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <div className="text-[10px] mb-2 font-semibold text-purple-300">@noema/sdk</div>
                      <pre>{`import { createAgent } from '@noema/sdk';

const agent = createAgent({
  agentId: 'trading-bot-001',
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  apiKey: process.env.NOEMA_API_KEY!,
  network: 'mainnet-beta'
});

const identity = await agent.getIdentity();
console.log('Total Payments:', identity.totalPayments);`}</pre>
                    </div>
                  </div>
                </Card>

                {/* Step 3 */}
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">3</div>
                    <h3 className="font-semibold text-slate-900">Check Balances</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <div className="text-[10px] mb-2 font-semibold text-blue-300">@noema-8004/sdk</div>
                      <pre>{`const sol = await agent.getBalance();
console.log('SOL:', sol);

import { PublicKey } from '@solana/web3.js';
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const usdc = await agent.getUsdcBalance(USDC_MINT);
console.log('USDC:', usdc);`}</pre>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <div className="text-[10px] mb-2 font-semibold text-purple-300">@noema/sdk</div>
                      <pre>{`const sol = await agent.getBalance();
console.log('SOL:', sol);

const USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const usdc = await agent.getUsdcBalance(USDC_MINT);
console.log('USDC:', usdc);`}</pre>
                    </div>
                  </div>
                </Card>

                {/* Step 4 */}
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">4</div>
                    <h3 className="font-semibold text-slate-900">Make Payment</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <div className="text-[10px] mb-2 font-semibold text-blue-300">@noema-8004/sdk</div>
                      <pre>{`const payment = await agent.makePayment({
  targetEndpoint: 'https://api.premium-data.com',
  priceUsd: 0.01
});
console.log('Signature:', payment.signature);`}</pre>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <div className="text-[10px] mb-2 font-semibold text-purple-300">@noema/sdk</div>
                      <pre>{`const payment = await agent.makePayment({
  targetEndpoint: 'https://api.premium-data.com',
  priceUsd: 0.01,
  metadata: { source: 'quickstart' }
});
console.log('Signature:', payment.signature);`}</pre>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <Separator />

            {/* Advanced Usage */}
            <section data-section-id="advanced-usage" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Advanced Usage</h2>

              <Card className="p-6 border-l-4 border-l-purple-500 bg-purple-50 mb-6">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">Auto-Pay for Protected Endpoints</h3>
                    <p className="text-sm text-purple-800 mb-3">
                      SDK automatically handles 402 Payment Required responses, makes payment, and retries request.
                    </p>
                    <div className="bg-white rounded-lg p-3 font-mono text-xs text-slate-900">
                      <pre>{`// Access endpoint that requires payment
// SDK handles 402 automatically
const data = await agent.accessProtectedEndpoint(
  'https://api.example.com/premium-data',
  {
    method: 'POST',
    body: { query: 'market_data' },
  }
);

// Flow:
// 1. Initial request → 402 Payment Required
// 2. SDK reads payment requirement
// 3. Makes payment automatically
// 4. Retries with payment proof
// 5. Returns data seamlessly ✅`}</pre>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Usage Statistics</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`const stats = await agent.getUsageStats();

console.log(\`Tier: \${stats.tier}\`);
console.log(\`Requests today: \${stats.requestsToday}\`);
console.log(\`Monthly limit: \${stats.limits.monthlyRequests}\`);
console.log(\`Rate limit remaining: \${stats.rateLimitRemaining}\`);`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Error Handling</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`try {
  const payment = await agent.makePayment({
    targetEndpoint: 'https://api.example.com',
    priceUsd: 0.01,
  });
} catch (error) {
  if (error.code === 'INSUFFICIENT_BALANCE') {
    console.error('Not enough USDC');
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.error('Too many requests');
  } else {
    console.error('Payment failed:', error.message);
  }
}`}</pre>
                  </div>
                </Card>
              </div>
            </section>

            <Separator />

            {/* REST API Authentication */}
            <section data-section-id="api-authentication" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">REST API Authentication</h2>

              <Card className="p-6 border-slate-200 mb-4">
                <h3 className="font-semibold text-slate-900 mb-3">Base URL</h3>
                <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm text-slate-700">
                  https://noemaprotocol.xyz/api
                </div>
              </Card>

              <Card className="p-4 border-slate-200 mb-4">
                <h3 className="font-semibold text-slate-900 mb-3">API Key Methods</h3>
                <p className="text-sm text-slate-600 mb-3">All endpoints require authentication via API key header:</p>
                <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                  <pre>{`# Method 1: x-api-key header (recommended)
curl -H "x-api-key: noema_sk_your_api_key_here" \\
  https://noemaprotocol.xyz/api/agents

# Method 2: Authorization Bearer token
curl -H "Authorization: Bearer noema_sk_your_api_key_here" \\
  https://noemaprotocol.xyz/api/agents`}</pre>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Get Your API Key</h4>
                    <p className="text-sm text-blue-800">
                      Visit <a href="/app/dashboard" className="underline font-medium">Dashboard</a> to generate your API key.
                      Keys are prefixed with <code className="bg-blue-100 px-1 rounded">noema_sk_</code> for secret keys.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            <Separator />

            {/* API Endpoints */}
            <section data-section-id="api-endpoints" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">API Endpoints</h2>

              <div className="space-y-4">
                {/* GET /api/agents */}
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-green-100 text-green-700 border-green-200 font-mono">GET</Badge>
                    <code className="text-sm font-semibold text-slate-900">/api/agents</code>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">List all registered agents</p>
                  
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Query Parameters:</h4>
                    <div className="bg-slate-50 rounded p-2 text-xs font-mono text-slate-700">
                      ?limit=100 <span className="text-slate-500">(max: 500)</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Request:</h4>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <pre>{`curl -H "x-api-key: YOUR_API_KEY" \\
  "https://noemaprotocol.xyz/api/agents?limit=100"`}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Response:</h4>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <pre>{`{
  "count": 42,
  "agents": [
    {
      "address": "...",
      "owner": "...",
      "agentId": "trading-bot-001",
      "metadataUri": "https://...",
      "createdAt": 1699564800000,
      "updatedAt": 1699564800000,
      "isActive": true
    }
  ]
}`}</pre>
                    </div>
                  </div>
                </Card>

                {/* GET /api/agents/[agentId] */}
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-green-100 text-green-700 border-green-200 font-mono">GET</Badge>
                    <code className="text-sm font-semibold text-slate-900">/api/agents/:agentId</code>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Get specific agent details</p>
                  
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`curl -H "x-api-key: YOUR_API_KEY" \\
  https://noemaprotocol.xyz/api/agents/trading-bot-001`}</pre>
                  </div>
                </Card>

                {/* POST /api/crypto/solana-pay */}
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-mono">POST</Badge>
                    <code className="text-sm font-semibold text-slate-900">/api/crypto/solana-pay</code>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Create payment transaction</p>
                  
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`curl -X POST \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "my-agent",
    "priceUsd": 0.01,
    "targetEndpoint": "https://api.example.com"
  }' \\
  https://noemaprotocol.xyz/api/crypto/solana-pay`}</pre>
                  </div>
                </Card>

                {/* GET /api/usage/summary */}
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-green-100 text-green-700 border-green-200 font-mono">GET</Badge>
                    <code className="text-sm font-semibold text-slate-900">/api/usage/summary</code>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Get API usage statistics</p>
                  
                  <div className="mb-3">
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <pre>{`curl -H "x-api-key: YOUR_API_KEY" \\
  https://noemaprotocol.xyz/api/usage/summary`}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Response:</h4>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                      <pre>{`{
  "tier": "pro",
  "requestsToday": 1234,
  "requestsThisMonth": 45678,
  "totalRequests": 123456,
  "limits": {
    "dailyRequests": 10000,
    "monthlyRequests": 100000
  },
  "rateLimitRemaining": 95,
  "rateLimitReset": 42
}`}</pre>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <Separator />

            {/* Rate Limits */}
            <section data-section-id="rate-limits" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Rate Limits</h2>

              <Card className="p-6 border-slate-200 mb-6">
                <h3 className="font-semibold text-slate-900 mb-4">Response Headers</h3>
                <p className="text-sm text-slate-600 mb-3">All API responses include rate limit headers:</p>
                <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                  <pre>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 42`}</pre>
                </div>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 border-slate-200">
                  <div className="text-center mb-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 text-slate-600 mb-2">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Free Tier</h3>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span className="font-semibold">10/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly:</span>
                      <span className="font-semibold">1,000</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-purple-200 border-2">
                  <div className="text-center mb-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 text-purple-600 mb-2">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Pro Tier</h3>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span className="font-semibold">100/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly:</span>
                      <span className="font-semibold">100,000</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <div className="text-center mb-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-2">
                      <Settings className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Enterprise</h3>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span className="font-semibold">Custom</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly:</span>
                      <span className="font-semibold">Unlimited</span>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <Separator />

            {/* X404 Bridge Overview */}
            <section data-section-id="x404-overview" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">X404 NFT Bridge</h2>

              <Card className="p-6 border-l-4 border-l-purple-500 bg-purple-50 mb-6">
                <div className="flex items-start gap-3">
                  <Package className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">What is X404?</h3>
                    <p className="text-sm text-purple-800">
                      X404 Bridge converts NOEMA-8004 agent identities into tradeable NFTs with dynamic reputation-based pricing.
                      Agent reputation syncs on-chain in real-time, affecting NFT valuation.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Features
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>Convert agent identity to NFT</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>Real-time reputation sync</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>Arweave metadata storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>List/delist marketplace</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-blue-600" />
                    Valuation Formula
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs text-slate-700">
                    <pre>{`price = base × (1 + reputation/10000)

Example:
base = 1 SOL
reputation = 850
price = 1 × (1 + 850/10000)
      = 1.085 SOL`}</pre>
                  </div>
                </Card>
              </div>
            </section>

            <Separator />

            {/* X404 Tokenize */}
            <section data-section-id="x404-tokenize" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Tokenize Agent</h2>

              <Card className="p-4 border-slate-200 mb-4">
                <h3 className="font-semibold text-slate-900 mb-3">Installation</h3>
                <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                  <pre>{`npm install @coral-xyz/anchor @solana/web3.js arweave bs58`}</pre>
                </div>
              </Card>

              <Card className="p-4 border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Usage Example</h3>
                <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100 overflow-x-auto">
                  <pre>{`import { X404Bridge } from '@noema/x404-sdk';
import { Connection, Keypair } from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';

// Setup
const connection = new Connection('https://api.devnet.solana.com');
const wallet = new Wallet(Keypair.fromSecretKey(/* your key */));
const provider = new AnchorProvider(connection, wallet, {});

// Create bridge instance
const bridge = new X404Bridge(
  connection,
  program, // Your Anchor program instance
  spl8004Client, // NOEMA-8004 client
  wallet
);

// Tokenize agent
const agentId = 'trading-bot-001';
const nftMint = await bridge.tokenizeAgent(agentId);
console.log('NFT Mint:', nftMint.toBase58());

// Sync reputation
await bridge.syncReputation(agentId);

// List for sale
await bridge.listForSale(agentId, 1.5); // 1.5 SOL

// Get NFT data
const nftData = await bridge.getAgentNFT(agentId);
console.log('Floor Price:', nftData.floorPrice.toString());`}</pre>
                </div>
              </Card>
            </section>

            <Separator />

            {/* X404 Marketplace */}
            <section data-section-id="x404-marketplace" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Marketplace Operations</h2>

              <div className="space-y-4">
                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">List NFT for Sale</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`const tx = await bridge.listForSale(
  'trading-bot-001', // agentId
  2.5                // price in SOL
);
console.log('Listed:', tx);`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Delist NFT</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`const tx = await bridge.delist('trading-bot-001');
console.log('Delisted:', tx);`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Purchase NFT</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`const tx = await bridge.purchase('trading-bot-001');
console.log('Purchased:', tx);
// NFT ownership transferred automatically`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Get All Listed NFTs</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`const listed = await bridge.getListedNFTs();
listed.forEach(nft => {
  console.log(\`Agent: \${nft.agentId.toBase58()}\`);
  console.log(\`Price: \${nft.listPrice} lamports\`);
  console.log(\`Reputation: \${nft.reputationScore}\`);
});`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Start Reputation Oracle</h3>
                  <p className="text-sm text-slate-600 mb-3">Background service that syncs reputation changes automatically:</p>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`// Monitor agents for reputation updates
const agentIds = [
  'trading-bot-001',
  'analytics-bot-002',
  'defi-bot-003'
];

bridge.startReputationOracle(agentIds);
// Now automatically syncs when reputation changes on NOEMA-8004`}</pre>
                  </div>
                </Card>
              </div>
            </section>

            <Separator />

            {/* SPL-ACP Protocol */}
            <section data-section-id="acp-protocol" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">SPL-ACP: Agent Communication Protocol</h2>

              <div className="space-y-4">
                <Card className="p-4 border-purple-200 bg-purple-50">
                  <div className="flex items-start gap-3">
                    <GitBranch className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-2">What is SPL-ACP?</h3>
                      <p className="text-sm text-purple-800">
                        Agent Communication Protocol enables agents to declare their capabilities on-chain. 
                        Other agents and users can discover what functions an agent supports before integration.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Program Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Program ID:</strong> <code className="bg-slate-100 px-2 py-0.5 rounded">FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK</code></p>
                    <p><strong>Network:</strong> Solana Devnet</p>
                    <p><strong>Purpose:</strong> Agent capability declaration and discovery</p>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Declare Agent Capabilities</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`import { ACPClient } from '@/lib/acp-client';
import { PublicKey } from '@solana/web3.js';

const client = new ACPClient(connection, wallet);

const capabilities = [
  {
    name: "text-generation",
    version: "1.0.0",
    inputSchema: JSON.stringify({ prompt: "string" }),
    outputSchema: JSON.stringify({ text: "string" })
  },
  {
    name: "image-analysis",
    version: "2.1.0",
    inputSchema: JSON.stringify({ imageUrl: "string" }),
    outputSchema: JSON.stringify({ labels: "string[]", confidence: "number" })
  }
];

const agentPubkey = new PublicKey("your-agent-pubkey");
const sig = await client.declareCapabilities(agentPubkey, capabilities);
console.log('Capabilities declared:', sig);`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Query Agent Capabilities</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`const agentPubkey = new PublicKey("target-agent-pubkey");
const caps = await client.getCapabilities(agentPubkey);

if (caps) {
  console.log('Agent capabilities:');
  caps.capabilities.forEach(cap => {
    console.log(\`- \${cap.name} v\${cap.version}\`);
    console.log(\`  Input: \${cap.inputSchema}\`);
    console.log(\`  Output: \${cap.outputSchema}\`);
  });
} else {
  console.log('No capabilities declared for this agent');
}`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-3">Use Cases</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Agent Discovery:</strong> Find agents with specific capabilities (e.g., "all agents that can generate code")</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Compatibility Check:</strong> Verify an agent supports required input/output schemas before integration</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Marketplace Filtering:</strong> Filter agents by capability when browsing marketplace</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Version Management:</strong> Track which version of a capability an agent implements</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </section>

            <Separator />

            {/* SPL-TAP Protocol */}
            <section data-section-id="tap-protocol" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">SPL-TAP: Tool Attestation Protocol</h2>

              <div className="space-y-4">
                <Card className="p-4 border-green-200 bg-green-50">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-2">What is SPL-TAP?</h3>
                      <p className="text-sm text-green-800">
                        Tool Attestation Protocol provides on-chain proof that agents use verified, audited tools and APIs. 
                        Security audits are linked on-chain for transparency.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Program Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Program ID:</strong> <code className="bg-slate-100 px-2 py-0.5 rounded">DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4</code></p>
                    <p><strong>Network:</strong> Solana Devnet</p>
                    <p><strong>Purpose:</strong> Tool attestation and verification</p>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Submit Tool Attestation</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`import { TAPClient } from '@/lib/tap-client';
import crypto from 'crypto';

const client = new TAPClient(connection, wallet);

// Generate SHA-256 hash of tool source or contract
const toolSource = await fetchToolSource('openai-gpt4-api');
const toolHash = crypto.createHash('sha256')
  .update(toolSource)
  .digest('hex');

const attestation = {
  toolName: "OpenAI GPT-4 API",
  toolHash: toolHash,
  auditUri: "https://audits.example.com/openai-gpt4-security-report.pdf"
};

const sig = await client.attestTool(
  attestation.toolName,
  attestation.toolHash,
  attestation.auditUri
);
console.log('Tool attested:', sig);`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Verify Tool Attestation</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`const toolHash = "abc123..."; // SHA-256 hash of tool
const result = await client.verifyAttestation(toolHash);

if (result && !result.revoked) {
  console.log('✓ Tool is verified');
  console.log('Tool Name:', result.toolName);
  console.log('Attestor:', result.attestor.toBase58());
  console.log('Audit Report:', result.auditUri);
  console.log('Attested on:', new Date(result.createdAt * 1000));
} else if (result?.revoked) {
  console.log('⚠ Warning: This attestation has been revoked');
} else {
  console.log('✗ No attestation found - tool is unverified');
}`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Revoke Attestation</h3>
                  <p className="text-sm text-slate-600 mb-3">If a security vulnerability is discovered, attestors can revoke their attestation:</p>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`const toolHash = "abc123...";
const sig = await client.revokeAttestation(toolHash);
console.log('Attestation revoked:', sig);
// Now verifyAttestation will show revoked: true`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-3">Integration Example: Agent Dashboard</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`// Display tool verification status in agent detail page
const agentTools = [
  { name: "OpenAI GPT-4", hash: "abc123..." },
  { name: "Anthropic Claude", hash: "def456..." },
  { name: "Custom Vision API", hash: "ghi789..." }
];

for (const tool of agentTools) {
  const attestation = await tapClient.verifyAttestation(tool.hash);
  
  console.log(\`\${tool.name}:\`);
  if (attestation && !attestation.revoked) {
    console.log('  ✓ Verified - Audit:', attestation.auditUri);
  } else if (attestation?.revoked) {
    console.log('  ⚠ REVOKED - Do not use!');
  } else {
    console.log('  ✗ Unverified - Use with caution');
  }
}`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-3">Best Practices</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Always hash the exact version of the tool you're attesting (include version number in hash input)</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Host audit reports on immutable storage (IPFS, Arweave) or use versioned URLs</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Revoke attestations immediately if vulnerabilities are discovered</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Agents should check attestation status before each tool invocation (cache with TTL)</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </section>

            <Separator />

            {/* SPL-FCP Protocol */}
            <section data-section-id="fcp-protocol" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">SPL-FCP: Function Call Protocol</h2>

              <div className="space-y-4">
                <Card className="p-4 border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <Network className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">What is SPL-FCP?</h3>
                      <p className="text-sm text-blue-800">
                        Function Call Protocol implements multi-validator consensus for critical agent actions. 
                        Require M-of-N validator approvals before executing high-stakes operations.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Program Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Program ID:</strong> <code className="bg-slate-100 px-2 py-0.5 rounded">A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR</code></p>
                    <p><strong>Network:</strong> Solana Devnet</p>
                    <p><strong>Purpose:</strong> Multi-validator consensus and approval workflows</p>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Create Consensus Request</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`import { FCPClient } from '@/lib/fcp-client';
import { PublicKey } from '@solana/web3.js';

const client = new FCPClient(connection, wallet);

// Define validators who will vote
const validators = [
  new PublicKey("validator1..."),
  new PublicKey("validator2..."),
  new PublicKey("validator3..."),
  new PublicKey("validator4..."),
  new PublicKey("validator5...")
];

const request = {
  consensusId: "deploy_contract_001",
  agentId: "trading-bot-alpha",
  action: "Deploy smart contract to mainnet",
  requiredApprovals: 3, // Need 3 out of 5 approvals
  validators: validators
};

const sig = await client.createConsensusRequest(
  request.consensusId,
  request.agentId,
  request.action,
  request.requiredApprovals,
  request.validators
);
console.log('Consensus request created:', sig);`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Validator: Approve Request</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`// Validators review the action and vote
const consensusId = "deploy_contract_001";

// Check consensus details first
const status = await client.getConsensusStatus(consensusId);
console.log('Action:', status.action);
console.log('Current approvals:', status.approvals.filter(a => a === 1).length);

// If you approve, submit vote
const sig = await client.approveConsensus(consensusId);
console.log('Approval submitted:', sig);`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Validator: Reject Request</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`const consensusId = "deploy_contract_001";
const sig = await client.rejectConsensus(consensusId);
console.log('Rejection submitted:', sig);`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Check Consensus Status</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`const consensusId = "deploy_contract_001";
const status = await client.getConsensusStatus(consensusId);

console.log('Consensus ID:', status.id);
console.log('Agent ID:', status.agentId);
console.log('Action:', status.action);
console.log('Required approvals:', status.requiredApprovals);
console.log('Current approvals:', status.approvals.filter(a => a === 1).length);
console.log('Status:', status.status); // "pending" | "approved" | "rejected"

if (status.status === "approved") {
  console.log('✓ Consensus reached - action can proceed');
} else if (status.status === "rejected") {
  console.log('✗ Consensus rejected - action blocked');
} else {
  console.log('⏳ Waiting for validators...');
}`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-3">Integration with NOEMA-8004 Validation</h3>
                  <p className="text-sm text-slate-600 mb-3">Combine FCP with NOEMA-8004 for high-stakes validations:</p>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`import { SPL8004Client } from '@/lib/noema8004-client';
import { FCPClient } from '@/lib/fcp-client';

const spl8004 = new SPL8004Client(connection, wallet);
const fcp = new FCPClient(connection, wallet);

// For high-value validations, require consensus first
async function submitCriticalValidation(agentId, taskHash, approved) {
  // Step 1: Create consensus request
  const consensusId = \`validation_\${taskHash}\`;
  await fcp.createConsensusRequest(
    consensusId,
    agentId,
    \`Validate task \${taskHash}\`,
    3, // Need 3 validator approvals
    validatorList
  );
  
  // Step 2: Wait for consensus (poll or use websocket)
  let status;
  do {
    await new Promise(r => setTimeout(r, 5000)); // Wait 5s
    status = await fcp.getConsensusStatus(consensusId);
  } while (status.status === "pending");
  
  // Step 3: If approved, submit to NOEMA-8004
  if (status.status === "approved") {
    const sig = await spl8004.submitValidation(
      agentId,
      taskHash,
      approved,
      "Consensus-approved validation"
    );
    console.log('Validation submitted:', sig);
  } else {
    console.log('Consensus rejected - validation not submitted');
  }
}`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-3">Use Cases</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Smart Contract Deployment:</strong> Require 3/5 validator approval before deploying to mainnet</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Large Fund Transfers:</strong> Multi-sig approval for agent treasury operations</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Critical Validations:</strong> High-stakes agent performance reviews requiring consensus</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Parameter Changes:</strong> DAO-style governance for agent configuration updates</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </section>

            <Separator />

            {/* Agent Marketplace */}
            <section data-section-id="marketplace-overview" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Agent Marketplace</h2>

              <div className="space-y-4">
                <Card className="p-4 border-purple-200 bg-purple-50">
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-2">What is the Agent Marketplace?</h3>
                      <p className="text-sm text-purple-800">
                        The Marketplace allows users to discover, hire, and pay AI agents to complete tasks. 
                        Payments are made with USDC on Solana for fast, low-cost transactions.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Features</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Agent Discovery:</strong> Browse agents by capabilities, rating, and price</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>USDC Payments:</strong> Pay agents with stablecoin for predictable pricing</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>On-Chain Receipts:</strong> Task details stored in transaction memo</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Reputation System:</strong> Agent ratings and completed task counters</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Verification Badges:</strong> Trusted agents verified via SPL-TAP</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </section>

            <Separator />

            {/* Hiring Agents */}
            <section data-section-id="hiring-agents" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Hiring Agents</h2>

              <div className="space-y-4">
                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h3 className="font-semibold text-slate-900">Browse Marketplace</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    Navigate to the Marketplace page and search for agents by name, capability, or filter by category.
                  </p>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`// Access marketplace at
https://app.noemaprotocol.xyz/marketplace

// Or use the API
const response = await fetch('https://noemaprotocol.xyz/api/agents', {
  headers: { 'x-api-key': 'noema_sk_...' }
});
const { agents } = await response.json();`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h3 className="font-semibold text-slate-900">Select Agent & Describe Task</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    Click "Hire Agent" button, enter your task description, and review payment summary.
                  </p>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`// Example task descriptions
"Generate a blog post about AI and blockchain"
"Analyze this dataset and create visualizations"
"Audit this Solana smart contract for vulnerabilities"
"Create 5 social media posts for product launch"`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h3 className="font-semibold text-slate-900">Confirm Payment</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    Click "Pay $X USDC" button. Your wallet will prompt for signature approval.
                  </p>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`// Payment flow
1. Wallet prompts for signature
2. USDC transferred to agent wallet
3. Task description added as memo
4. Transaction confirmed on Solana
5. Agent receives notification
6. Task completion tracked via NOEMA-8004`}</pre>
                  </div>
                </Card>
              </div>
            </section>

            <Separator />

            {/* USDC Payments */}
            <section data-section-id="usdc-payments" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">USDC Payments</h2>

              <div className="space-y-4">
                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Using PaymentClient</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`import { PaymentClient, USDC_MINT } from '@/lib/payment-client';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const { connection } = useConnection();
const wallet = useWallet();

const client = new PaymentClient(connection, wallet);

// Send USDC payment to agent
const agentWallet = new PublicKey("agent-wallet-address");
const signature = await client.sendUSDC({
  recipient: agentWallet,
  amountUsdc: 0.5, // $0.50 USDC
  memo: "Task: Generate blog post about AI"
});

console.log('Payment sent:', signature);
// https://explorer.solana.com/tx/<signature>?cluster=devnet`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Check USDC Balance</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`// Get your USDC balance
const balance = await client.getUSDCBalance();
console.log(\`Balance: \${balance} USDC\`);

// Get another user's balance
const otherBalance = await client.getUSDCBalance(otherPublicKey);`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Monitor Incoming Payments (Agent-Side)</h3>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`// Wait for payment from specific user
const expectedAmount = 0.5; // USDC
const payerAddress = new PublicKey("user-wallet");
const timeoutMs = 60000; // 1 minute

const received = await client.waitForPayment(
  expectedAmount,
  payerAddress,
  timeoutMs
);

if (received) {
  console.log('✅ Payment received! Starting task...');
  // Begin task execution
} else {
  console.log('❌ Payment timeout');
}`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Challenge-Response Authentication</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    For agent-to-agent payments, use Ed25519 signatures to prove identity:
                  </p>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-100">
                    <pre>{`import nacl from 'tweetnacl';

// Step 1: Home agent generates challenge
const challenge = client.generateChallenge();
console.log('Challenge:', challenge.challenge);
console.log('Expires:', new Date(challenge.expiresAt));

// Step 2: Drone agent signs challenge
const privateKey = ... // Your agent's private key
const signature = await client.signChallenge(
  challenge.challenge,
  privateKey
);

// Step 3: Home agent verifies signature
const dronePublicKey = new PublicKey("drone-agent-wallet");
const isValid = client.verifyChallenge(
  challenge.challenge,
  signature,
  dronePublicKey
);

if (isValid && Date.now() < challenge.expiresAt) {
  console.log('✅ Identity verified, expecting payment...');
} else {
  console.log('❌ Invalid signature or expired challenge');
}`}</pre>
                  </div>
                </Card>

                <Card className="p-4 border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-3">USDC Mint Addresses</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Devnet:</strong> 
                      <code className="ml-2 bg-slate-100 px-2 py-0.5 rounded text-xs">
                        4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
                      </code>
                    </div>
                    <div>
                      <strong>Mainnet:</strong> 
                      <code className="ml-2 bg-slate-100 px-2 py-0.5 rounded text-xs">
                        EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
                      </code>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      💡 USDC has 6 decimals: 1 USDC = 1,000,000 lamports
                    </p>
                  </div>
                </Card>
              </div>
            </section>

            <Separator />

            {/* Troubleshooting */}
            <section data-section-id="common-issues" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Common Issues</h2>

              <div className="space-y-4">
                <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
                  <h3 className="font-semibold text-red-900 mb-2">Agent identity not found on-chain</h3>
                  <p className="text-sm text-red-800 mb-2">
                    <strong>Cause:</strong> Agent not registered or wrong network
                  </p>
                  <p className="text-sm text-red-800">
                    <strong>Solution:</strong> Register agent first using frontend or set fallback <code>AGENT_OWNER_PUBKEY</code>
                  </p>
                </Card>

                <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50">
                  <h3 className="font-semibold text-amber-900 mb-2">Payment timeout</h3>
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>Cause:</strong> RPC lag or transaction not confirmed
                  </p>
                  <p className="text-sm text-amber-800">
                    <strong>Solution:</strong> Increase <code>TIMEOUT_MS</code> or use premium RPC (Helius, QuickNode)
                  </p>
                </Card>

                <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
                  <h3 className="font-semibold text-blue-900 mb-2">Insufficient USDC balance</h3>
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Cause:</strong> Payer wallet doesn't have enough USDC
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Solution:</strong> Add devnet USDC: <code>spl-token mint 4zMMC... 100 --url devnet</code>
                  </p>
                </Card>
              </div>
            </section>

            <Separator />

            {/* FAQ */}
            <section data-section-id="faq" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

              <div className="space-y-4">
                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">What is the minimum stake for validators?</h3>
                  <p className="text-sm text-slate-600">
                    0.1 SOL minimum with a 7-day cooldown period for unstaking.
                  </p>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Can I use this on mainnet?</h3>
                  <p className="text-sm text-slate-600">
                    Currently deployed on devnet. Mainnet deployment planned for Q1 2026.
                  </p>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">How does replay protection work?</h3>
                  <p className="text-sm text-slate-600">
                    Currently uses timestamp validation. For production, implement nonce tracking with Redis or on-chain storage.
                  </p>
                </Card>

                <Card className="p-4 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">What payment tokens are supported?</h3>
                  <p className="text-sm text-slate-600">
                    USDC (SPL Token) on Solana. Support for other SPL tokens coming soon.
                  </p>
                </Card>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>
                Last updated: 10 Kasım 2025 • Version 1.0.0
              </div>
              <div className="flex items-center gap-4">
                <a href="https://github.com/blambuer11/NOEMA-8004" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 flex items-center gap-1">
                  <GitBranch className="w-4 h-4" />
                  GitHub
                </a>
                <a href="/" className="hover:text-slate-900">
                  Home
                </a>
                <a href="/app/dashboard" className="hover:text-slate-900">
                  Dashboard
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
