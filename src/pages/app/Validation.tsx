export default function Validation() {
  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold text-white">Validation Console</h1>
        <p className="text-sm text-slate-300 mt-1">Submit validation for agent task results</p>
      </div>
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 max-w-2xl space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium block text-slate-200">Agent ID</label>
          <input className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm text-white placeholder:text-slate-500" placeholder="trading-bot-v1" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block text-slate-200">Task Hash</label>
          <input className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm font-mono text-white placeholder:text-slate-500" placeholder="0xabc123..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block text-slate-200">Result</label>
          <select className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm text-white">
            <option className="bg-slate-800">Approved</option>
            <option className="bg-slate-800">Rejected</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block text-slate-200">Evidence URI (optional)</label>
          <input className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm text-white placeholder:text-slate-500" placeholder="ipfs://..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block text-slate-200">Note</label>
          <textarea rows={3} className="w-full bg-[#141922] border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-slate-500" placeholder="Optional validator note..." />
        </div>
        <div className="flex gap-3">
          <button className="bg-white hover:bg-slate-100 text-black rounded px-6 py-2.5 text-sm font-semibold transition">Submit Validation</button>
          <button className="border border-white/20 hover:bg-white/10 text-white rounded px-6 py-2.5 text-sm font-medium transition">Clear</button>
        </div>
      </div>
    </div>
  );
}
