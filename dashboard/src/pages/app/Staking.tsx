import { Rocket, Sparkles, Lock } from 'lucide-react';

export default function Staking() {
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-200">
      <div className="text-center space-y-8 max-w-2xl mx-auto p-8">
        {/* Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
          <div className="relative bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-8 rounded-full border border-purple-500/30">
            <Rocket className="w-24 h-24 text-purple-400" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Validator Staking
            </h1>
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-2xl font-semibold text-slate-300">Coming Soon...</p>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-lg text-slate-400 leading-relaxed">
            Validator staking sistemi aktif olarak geliştirilmektedir. Yakında SOL stake edip, ağı doğrulayabilir ve ödüller kazanabileceksiniz.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">Under Development</span>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-3xl mb-3">💎</div>
            <div className="font-semibold text-white mb-1">Stake & Earn</div>
            <div className="text-xs text-slate-400">Min 0.1 SOL stake</div>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-3xl mb-3">⚡</div>
            <div className="font-semibold text-white mb-1">Validate Tasks</div>
            <div className="text-xs text-slate-400">Earn fee rewards</div>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-3xl mb-3">🏆</div>
            <div className="font-semibold text-white mb-1">Build Reputation</div>
            <div className="text-xs text-slate-400">Governance power</div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-8">
          <a 
            href="/app/dashboard" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-semibold transition"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
