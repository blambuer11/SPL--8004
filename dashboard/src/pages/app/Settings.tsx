import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Settings as SettingsIcon, User, Bell, Shield, Key, Zap, Database } from 'lucide-react';
import { toast } from 'sonner';

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
  const [apiKey, setApiKey] = useState('sk_test_...' + Math.random().toString(36).slice(2, 12));
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveRpc = () => {
    toast.success('RPC endpoint updated');
  };

  const handleRegenerateApiKey = () => {
    setApiKey('sk_live_...' + Math.random().toString(36).slice(2, 20));
    toast.success('New API key generated');
  };

  return (
    <div className="space-y-8 text-slate-200 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-purple-400" />
          Settings
        </h1>
        <p className="text-slate-400 mt-1">Manage your account, preferences, and API access</p>
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
              <span className="text-sm font-medium text-purple-300">Development API Key</span>
              <button 
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="font-mono text-sm text-slate-300 bg-black/20 p-3 rounded border border-white/5">
              {showApiKey ? apiKey : '••••••••••••••••••••'}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRegenerateApiKey}
              className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold text-sm"
            >
              Regenerate Key
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
                toast.success('API key copied to clipboard');
              }}
              className="px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-white/10 text-sm"
            >
              Copy to Clipboard
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
