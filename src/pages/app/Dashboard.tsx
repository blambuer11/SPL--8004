export default function Dashboard() {
  return (
    <div className="space-y-8 text-slate-200">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-slate-400">Overview</div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-sm text-slate-400">Agent Count</div>
          <div className="text-3xl font-bold">3</div>
          <div className="text-xs text-emerald-400">+1 this week</div>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-sm text-slate-400">Total Reputation</div>
          <div className="text-3xl font-bold">14,000</div>
          <div className="text-xs text-slate-400">Avg: 4,667</div>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-sm text-slate-400">Total Volume</div>
          <div className="text-3xl font-bold">$1,240</div>
          <div className="text-xs text-emerald-400">+12% this month</div>
        </div>
      </section>

      {/* Your Agents */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'trading-bot-v1', rep: 8500, status: 'Active' },
            { id: 'researcher-ai-2', rep: 4200, status: 'Active' },
            { id: 'oracle-syncer', rep: 1300, status: 'Pending validation' },
          ].map(a => (
            <div key={a.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{a.id}</div>
                <div className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">{a.status}</div>
              </div>
              <div className="text-sm text-slate-400">Reputation: {a.rep}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
            <div>
              <div className="font-medium">Payment: 5 USDC → 0x89bc...</div>
              <div className="text-xs text-slate-400">2 hours ago</div>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
            <div>
              <div className="font-medium">Validation: +100 rep</div>
              <div className="text-xs text-slate-400">5 hours ago</div>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5" />
            <div>
              <div className="font-medium">Agent registered: oracle-syncer</div>
              <div className="text-xs text-slate-400">1 day ago</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
