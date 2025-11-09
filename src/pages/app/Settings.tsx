export default function Settings() {
  return (
    <div className="space-y-6 text-slate-200">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">RPC Endpoint</div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">Notifications & Preferences</div>
      </div>
    </div>
  );
}
