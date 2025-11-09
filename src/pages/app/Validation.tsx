export default function Validation() {
  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold">Validation Console</h1>
        <p className="text-sm text-slate-400 mt-1">Submit validation for agent task results</p>
      </div>
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 max-w-2xl space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium block">Agent ID</label>
          <input className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm" placeholder="trading-bot-v1" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block">Task Hash</label>
          <input className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm font-mono" placeholder="0xabc123..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block">Result</label>
          <select className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm">
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block">Evidence URI (optional)</label>
          <input className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm" placeholder="ipfs://..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block">Note</label>
          <textarea rows={3} className="w-full bg-[#141922] border border-white/10 rounded px-3 py-2 text-sm" placeholder="Optional validator note..." />
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-100 hover:bg-slate-200 text-black rounded px-6 py-2.5 text-sm font-medium transition">Submit Validation</button>
          <button className="border border-white/10 hover:bg-white/5 text-slate-300 rounded px-6 py-2.5 text-sm font-medium transition">Clear</button>
        </div>
      </div>
    </div>
  );
}
