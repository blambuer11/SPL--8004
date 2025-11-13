import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Settings as SettingsIcon, User, Bell, Shield, Key, Zap, Database, RefreshCw, Eye, EyeOff, Clock } from 'lucide-react';
import { toast } from 'sonner';

const generateApiKey = () => {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      if (typeof globalThis.crypto.randomUUID === 'function') {
        return `sk_${globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 28)}`;
      }
      const buffer = new Uint8Array(16);
      globalThis.crypto.getRandomValues(buffer);
      const base = Array.from(buffer, b => b.toString(16).padStart(2, '0')).join('');
      return `sk_${base.slice(0, 32)}`;
    }
  } catch (error) {
    // fall back to Math.random below
  }
  return `sk_${Math.random().toString(36).slice(2, 32)}`;
};

export default function Settings() {
  const { publicKey } = useWallet();
  const [rpcEndpoint, setRpcEndpoint] = useState('https://api.devnet.solana.com');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    agentMessages: true,
    validations: true,
    payments: true,
  });
  const [apiKey, setApiKey] = useState(() => generateApiKey());
  const [showApiKey, setShowApiKey] = useState(false);
  const lastUpdated = useMemo(() => new Date().toLocaleTimeString(), []);

  const handleSaveRpc = () => {
    toast.success('RPC endpoint updated');
  };

  const handleRegenerateApiKey = () => {
  const nextKey = generateApiKey();
    setApiKey(nextKey);
    navigator.clipboard.writeText(nextKey).then(() => {
      toast.success('New API key generated', {
        description: 'Key copied to clipboard for immediate use.',
      });
    }).catch(() => {
      toast.success('New API key generated');
    });
  };

  return (
    <div className="space-y-8 text-slate-200 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-purple-400" />
            Settings
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-600/20 text-emerald-300 border border-emerald-500/20">
              UPDATED v2.0
            </span>
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <span>Manage your account, preferences, and API access</span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" /> Last updated: {lastUpdated}
            </span>
          </p>
        </div>
        <button
          onClick={handleRegenerateApiKey}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-sm border border-purple-500/30"
        >
          <RefreshCw className="w-4 h-4" />
          Generate API Key
        </button>
      </div>

      {/* Profile Section */}
      <section className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Profile</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-2 text-slate-300">Wallet Address</label>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/10 font-mono text-sm text-slate-200">
              {publicKey ? publicKey.toBase58() : 'Not connected'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2 text-slate-300">Display Name (optional)</label>
            <input 
              type="text" 
              placeholder="Enter your name" 
              className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2 text-slate-300">Email (optional)</label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      </section>

      {/* RPC Endpoint */}
      <section className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">RPC Configuration</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-2 text-slate-300">Solana RPC Endpoint</label>
            <input 
              type="text" 
              value={rpcEndpoint}
              onChange={(e) => setRpcEndpoint(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-white font-mono text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">
              💡 Use custom RPC for better performance (Helius, QuickNode, etc.)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button 
              onClick={() => setRpcEndpoint('https://api.devnet.solana.com')}
              className="px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-white/10 text-sm"
            >
              Devnet
            </button>
            <button 
              onClick={() => setRpcEndpoint('https://api.mainnet-beta.solana.com')}
              className="px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-white/10 text-sm"
            >
              Mainnet
            </button>
            <button 
              onClick={() => setRpcEndpoint('http://localhost:8899')}
              className="px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-white/10 text-sm"
            >
              Localhost
            </button>
          </div>
          <button 
            onClick={handleSaveRpc}
            className="px-6 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold"
          >
            Save RPC Settings
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
            { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
            { key: 'agentMessages', label: 'Agent Messages', description: 'Notify when agents send messages' },
            { key: 'validations', label: 'Validation Updates', description: 'Task validation results' },
            { key: 'payments', label: 'Payment Alerts', description: 'Incoming/outgoing payments' },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-white/5">
              <div>
                <div className="font-medium text-white">{label}</div>
                <div className="text-xs text-slate-400">{description}</div>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }))}
                className={`w-12 h-6 rounded-full transition ${
                  notifications[key as keyof typeof notifications] ? 'bg-emerald-500' : 'bg-slate-600'
                } relative`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  notifications[key as keyof typeof notifications] ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* API Keys */}
      <section className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">API Keys</h2>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-300">Primary API Key</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                >
                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showApiKey ? 'Hide' : 'Reveal'}
                </button>
                <button
                  onClick={handleRegenerateApiKey}
                  className="flex items-center gap-1 text-xs text-purple-200 bg-purple-500/20 hover:bg-purple-500/25 rounded px-2 py-1"
                >
                  <RefreshCw className="w-3 h-3" /> New Key
                </button>
              </div>
            </div>
            <div className="font-mono text-sm text-slate-300 bg-black/20 p-3 rounded border border-white/5">
              {showApiKey ? apiKey : '••••••••••••••••••••'}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
                toast.success('API key copied to clipboard');
              }}
              className="px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-white/10 text-sm"
            >
              Copy to Clipboard
            </button>
            <button 
              onClick={handleRegenerateApiKey}
              className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold text-sm"
            >
              Generate & Copy
            </button>
          </div>
          <p className="text-xs text-slate-400">
            ⚠️ Keep your API keys secure. Never share them publicly or commit to version control.
          </p>
        </div>
      </section>

      {/* Security */}
      <section className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-bold text-white">Security</h2>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
            <div className="font-medium text-red-300 mb-1">Two-Factor Authentication (2FA)</div>
            <div className="text-sm text-slate-400 mb-3">Add an extra layer of security to your account</div>
            <button className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-sm">
              Enable 2FA
            </button>
          </div>
          <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
            <div className="font-medium text-amber-300 mb-1">Active Sessions</div>
            <div className="text-sm text-slate-400 mb-2">1 active session</div>
            <div className="text-xs text-slate-500">
              Current: Chrome on macOS • {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      {/* Advanced */}
      <section className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Advanced</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-white/5">
            <div>
              <div className="font-medium text-white">Developer Mode</div>
              <div className="text-xs text-slate-400">Enable debug logging and additional features</div>
            </div>
            <button className="w-12 h-6 rounded-full bg-slate-600 relative">
              <div className="w-4 h-4 rounded-full bg-white absolute top-1 left-1" />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-white/5">
            <div>
              <div className="font-medium text-white">Auto-Compound Rewards</div>
              <div className="text-xs text-slate-400">Automatically restake validator rewards</div>
            </div>
            <button className="w-12 h-6 rounded-full bg-emerald-500 relative">
              <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex gap-3">
        <button className="px-8 py-3 rounded-lg bg-white hover:bg-slate-100 text-black font-semibold">
          Save All Changes
        </button>
        <button className="px-8 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-white">
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
