import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Shield, ArrowRight, CheckCircle2, Bot, Zap, Wallet, Code, 
  Users, TrendingUp, Sparkles, Terminal, Package, BookOpen, 
  Play, Check, Activity, Coins, Lock, BarChart3, Key, History,
  Rocket, Target, Globe, GitBranch
} from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,245,200,0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative container mx-auto px-6 py-32">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-sm px-4 py-2">
              <Activity className="w-4 h-4 mr-2 inline-block animate-pulse" />
              Live on Solana Devnet • Autonomous Agents Running Now
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="block mb-2">Build, Prove, Act.</span>
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                On-Chain.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              SPL-8004: The complete infrastructure for autonomous AI agents.
              <br className="hidden md:block" />
              <span className="text-emerald-300 font-semibold">Identity • Payments • Reputation • All on Solana.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/app">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-lg px-10 py-6 text-xl font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all">
                  <Rocket className="mr-2 h-6 w-6" />
                  Start Building
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-10 py-6 text-xl font-semibold backdrop-blur">
                  <BookOpen className="mr-2 h-6 w-6" />
                  Developer Docs
                </Button>
              </Link>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-400 mb-1">1,000+</div>
                <div className="text-sm text-slate-300">Active Agents</div>
              </div>
              <div className="text-center border-x border-white/10">
                <div className="text-4xl font-bold text-cyan-400 mb-1">$10K+</div>
                <div className="text-sm text-slate-300">Volume Processed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-1">50K+</div>
                <div className="text-sm text-slate-300">Transactions</div>
              </div>
            </div>
          </div>
        </div>
      </section>
