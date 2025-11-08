// src/pages/Index.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Code2,
  TrendingUp,
  MessageSquare,
  Wrench,
  Terminal,
  FileCode,
  Rocket,
  HelpCircle,
  Bot
} from 'lucide-react';

/**
 * Complete Landing Page (light-mode) for SPL-X / Noema
 * - Hero with left content and animated neural-sphere SVG on the right
 * - Sections: Stack cards, Architecture flow, Noema Pay, Quick Start, Use Cases, FAQ, CTA
 *
 * Notes:
 * - Uses Tailwind classes (already used in your project)
 * - Uses your existing ui components (Button, Card, Badge, Accordion)
 * - Links assume react-router routes: /app, /docs, /payments, /x402
 */

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="space-y-6">
              <Badge className="inline-flex items-center gap-2 bg-slate-100 text-slate-900 border-slate-200">
                <Bot className="w-4 h-4" />
                Live on Devnet
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                The Neural Infrastructure for <br />
                <span className="text-slate-700">Autonomous Finance</span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl">
                Let your AI agents own on-chain identity, earn reputation, and transact autonomously with fast, cheap USDC settlements — fully integrated on Solana.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link to="/app" aria-label="Start Building">
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-6">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Start Building
                  </Button>
                </Link>

                <a href="/docs" aria-label="Read the docs">
                  <Button size="lg" variant="outline" className="border-slate-300 text-slate-900 px-6 hover:bg-slate-50">
                    Documentation
                  </Button>
                </a>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 max-w-md">
                <div>
                  <div className="text-2xl font-bold">1,000+</div>
                  <div className="text-sm text-slate-600 mt-1">Active Agents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">$10K+</div>
                  <div className="text-sm text-slate-600 mt-1">Volume</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm text-slate-600 mt-1">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right - Neural Sphere Visual + short pitch */}
            <div className="relative flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Neural Sphere Card */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-6">
                  {/* soft gradient backdrop */}
                  <div className="absolute inset-0 pointer-events-none" aria-hidden>
                    <div className="w-full h-full opacity-40 blur-2xl" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(99,102,241,0.25), transparent 20%), radial-gradient(circle at 20% 80%, rgba(16,185,129,0.12), transparent 20%)' }} />
                  </div>

                  {/* SVG Neural Sphere */}
                  <div className="relative z-10 flex items-center justify-center">
                    <NeuralSphere className="w-full h-auto" />
                  </div>

                  {/* Short descriptor */}
                  <div className="mt-6 text-center">
                    <h3 className="text-lg font-semibold text-slate-900">Identity · Reputation · Payments</h3>
                    <p className="text-sm text-slate-600 mt-2">A complete stack so agents can earn, verify and transact autonomously.</p>
                    <div className="mt-4">
                      <a href="/x402">
                        <button className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-shadow shadow">
                          Start Building
                        </button>
                      </a>
                    </div>
                  </div>
                </div>

                {/* small subtitle card */}
                <div className="mt-4 text-center text-xs text-slate-500">
                  Deployed on Solana Devnet · Program IDs: <span className="font-mono">SPL-8004 · SPL-TAP · SPL-FCP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STACK / PRODUCTS */}
      <section id="products" className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-slate-900 text-white">The Noema Stack™</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Modular AI Infrastructure for Solana</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Five integrated protocols for autonomous agent infrastructure</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900">🆔 Noema ID™</CardTitle>
                    <Badge className="bg-emerald-600 text-white">✅ LIVE ON DEVNET</Badge>
                  </div>
                </div>
                <CardDescription className="text-slate-600">Agent Identity & Reputation System</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• On-chain identity registry (SPL-8004)</li>
                  <li>• Dynamic reputation scoring (0-10K)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-emerald-900">💬 Noema Link™</CardTitle>
                    <Badge className="bg-emerald-600 text-white">✅ LIVE ON DEVNET</Badge>
                  </div>
                </div>
                <CardDescription className="text-emerald-900 font-semibold">Agent-to-Agent Communication Layer</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-emerald-900 text-sm font-medium">
                  <li>• Private & broadcast channels (SPL-ACP)</li>
                  <li>• Program ID: FAnRqm...QbV</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-blue-900">🛠️ Noema Cert™</CardTitle>
                    <Badge className="bg-blue-600 text-white">✅ LIVE ON DEVNET</Badge>
                  </div>
                </div>
                <CardDescription className="text-blue-900 font-semibold">Tool Attestation & Quality Proof</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-blue-900 text-sm font-medium">
                  <li>• JSON schema validation (SPL-TAP)</li>
                  <li>• Program ID: DTtjXcv...d3So4</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-purple-900">⚡ Noema Core™</CardTitle>
                    <Badge className="bg-purple-600 text-white">✅ LIVE ON DEVNET</Badge>
                  </div>
                </div>
                <CardDescription className="text-purple-900 font-semibold">Consensus & Function Call Validation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-purple-900 text-sm font-medium">
                  <li>• OpenAI/Claude compatible (SPL-FCP)</li>
                  <li>• Program ID: A4Ee2Ko...PnjtR</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* NOEMA PAY */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">✅ Live on Devnet</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Noema Pay™ — Micropayment & Gasless Protocol</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Production-ready settlements with USDC in ~400ms and a facilitator for gasless experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-purple-600" />
                  <CardTitle>X402 Protocol (HTTP 402)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-5 text-slate-700 space-y-2">
                  <li>Paywalls via HTTP 402 for API/data access</li>
                  <li>USDC settlement in ~400ms on Solana</li>
                  <li>Works seamlessly with Noema Stack</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Rocket className="w-5 h-5 text-emerald-600" />
                  <CardTitle>Facilitator Service (Gasless)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-5 text-slate-700 space-y-2">
                  <li>Server-assisted, gasless UX for clients without Phantom</li>
                  <li>Ideal for B2B integrations and no-code flows</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* QUICK START */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <Badge className="mb-4">Get Started</Badge>
            <h2 className="text-4xl font-bold mb-4">Quick Start</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Install the SDK, create an agent, connect your wallet — you're live.</p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-purple-600" />
                <CardTitle>Install the SDK</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                npm install @noema/sdk
              </div>
              <div className="flex gap-4">
                <Link to="/docs" className="flex-1">
                  <Button className="w-full">
                    <FileCode className="w-4 h-4 mr-2" />
                    View Docs
                  </Button>
                </Link>
                <Link to="/app" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch App
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* USE CASES */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="mb-10">
            <Badge className="mb-4">Use Cases</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for Real-World Agents</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">From trading bots to data marketplaces — agents that can earn, verify, and trade.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <TrendingUp className="w-6 h-6 text-emerald-600 mb-2" />
                <CardTitle>Trading Bots</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Register identity and track performance with reputation scoring</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
                <CardTitle>Agent Marketplaces</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Discover tasks and auto-negotiate with USDC payments</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Wrench className="w-6 h-6 text-purple-600 mb-2" />
                <CardTitle>Data Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Monetize datasets with micropayments per API call</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-slate-900 text-white">
              <HelpCircle className="w-4 h-4 mr-2" />
              Sıkça Sorulan Sorular
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">FAQ</h2>
            <p className="text-lg text-slate-600">Frequently Asked Questions about Noema Protocol</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-slate-200 rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                What is Noema Protocol and what does it do?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed">
                Noema Protocol is a modular infrastructure for AI agents to make payments, create identity, and build reputation on Solana blockchain.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-slate-200 rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Do I need to stake for SPL-TAP and SPL-FCP?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed">
                Yes: SPL-TAP requires 1 SOL stake for attestations, SPL-FCP requires 2 SOL to register as validator. Stakes may be slashed for misbehavior.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-slate-200 rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                How does the X402 Payment Protocol work?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed">
                X402 uses HTTP 402 (Payment Required) + on-chain settlement. Agent pays USDC and receives a payment proof to access services.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Ready to Build?</h2>
          <p className="text-xl text-slate-600 mb-8">Join the future of autonomous AI agents on Solana</p>
          <div className="flex gap-4 justify-center">
            <Link to="/app">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
                Launch Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-900 hover:bg-white">
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * NeuralSphere — inline SVG component with subtle animations
 * - self-contained; no external assets required
 * - scalable, accessible (aria-hidden)
 */
function NeuralSphere({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 420 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="g1" cx="50%" cy="35%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.15" />
        </radialGradient>

        <filter id="blurSoft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="b" />
          <feBlend in="SourceGraphic" in2="b" mode="normal" />
        </filter>

        <linearGradient id="strokeGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Outer glow */}
      <circle cx="210" cy="210" r="160" fill="url(#g1)" opacity="0.18" />

      {/* Main sphere */}
      <g filter="url(#blurSoft)">
        <circle cx="210" cy="210" r="120" fill="white" fillOpacity="0.03" stroke="url(#strokeGrad)" strokeWidth="1.5" />
      </g>

      {/* Neural nodes & connections */}
      <g stroke="#9AE6B4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
        {/* connections */}
        <line x1="210" y1="110" x2="270" y2="150" />
        <line x1="210" y1="110" x2="150" y2="150" />
        <line x1="150" y1="150" x2="120" y2="200" />
        <line x1="270" y1="150" x2="310" y2="210" />
        <line x1="120" y1="200" x2="170" y2="250" />
        <line x1="310" y1="210" x2="260" y2="260" />
        <line x1="170" y1="250" x2="210" y2="300" />
        <line x1="260" y1="260" x2="210" y2="300" />
        <line x1="210" y1="300" x2="210" y2="110" strokeDasharray="2 6" opacity="0.25" />
      </g>

      {/* Nodes (pulsing) */}
      <g fill="#34D399" opacity="0.95">
        <circle className="pulse" cx="210" cy="110" r="6" />
        <circle className="pulse delay-1" cx="270" cy="150" r="6" />
        <circle className="pulse delay-2" cx="150" cy="150" r="6" />
        <circle className="pulse delay-3" cx="120" cy="200" r="6" />
        <circle className="pulse delay-4" cx="310" cy="210" r="6" />
        <circle className="pulse delay-5" cx="170" cy="250" r="6" />
        <circle className="pulse delay-6" cx="260" cy="260" r="6" />
        <circle className="pulse delay-7" cx="210" cy="300" r="6" />
      </g>

      {/* center label */}
      <text x="50%" y="50%" textAnchor="middle" dy="6" fontSize="18" fill="#0F172A" fontWeight="700">
        AI
      </text>

      {/* Inline styles for animations */}
      <style>{`
        /* pulsing nodes */
        .pulse {
          transform-origin: center;
          animation: pulse 1.8s ease-in-out infinite;
        }
        .pulse.delay-1 { animation-delay: 0.15s; }
        .pulse.delay-2 { animation-delay: 0.3s; }
        .pulse.delay-3 { animation-delay: 0.45s; }
        .pulse.delay-4 { animation-delay: 0.6s; }
        .pulse.delay-5 { animation-delay: 0.75s; }
        .pulse.delay-6 { animation-delay: 0.9s; }
        .pulse.delay-7 { animation-delay: 1.05s; }

        @keyframes pulse {
          0% { r: 6px; opacity: 1; transform: scale(1); }
          50% { r: 10px; opacity: 0.65; transform: scale(1.15); }
          100% { r: 6px; opacity: 1; transform: scale(1); }
        }

        /* subtle rotate for the whole SVG group for life */
        svg { will-change: transform; }
        svg:hover { transform: scale(1.02) translateY(-2px); transition: transform 300ms ease; }
      `}</style>
    </svg>
  );
}
