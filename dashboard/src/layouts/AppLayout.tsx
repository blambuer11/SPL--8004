import { ReactNode, useMemo, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useStaking } from '@/hooks/useStaking';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LayoutDashboard, Users, PlusCircle, ShieldCheck, CreditCard, Fingerprint, Share2, Store, BookOpen, Settings, TrendingUp, Image } from 'lucide-react';

interface AppLayoutProps { children: ReactNode; }

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: <LayoutDashboard className='w-4 h-4' /> },
  { to: '/app/agents', label: 'Agents', icon: <Users className='w-4 h-4' /> },
  { to: '/app/staking', label: 'Staking', icon: <TrendingUp className='w-4 h-4' /> },
  { to: '/app/payments', label: 'Payments', icon: <CreditCard className='w-4 h-4' /> },
  { to: '/app/x404', label: 'X404 NFT Bridge', icon: <Image className='w-4 h-4' /> },
  { to: '/app/attestations', label: 'Attestations', icon: <Fingerprint className='w-4 h-4' /> },
  { to: '/app/consensus', label: 'Consensus', icon: <Share2 className='w-4 h-4' /> },
  { to: '/app/marketplace', label: 'Marketplace', icon: <Store className='w-4 h-4' /> },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { connected, publicKey, disconnect } = useWallet();
  const { client: stakingClient } = useStaking();
  const [validatorStake, setValidatorStake] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (connected && publicKey && stakingClient) {
      stakingClient.getValidatorAccount(publicKey)
        .then(validator => setValidatorStake(validator?.stakedAmount || 0))
        .catch(() => setValidatorStake(0));
    } else {
      setValidatorStake(0);
    }
  }, [connected, publicKey, stakingClient]);

  const validatorStatus = useMemo(() => {
    if (!connected) return 'disconnected';
    if (validatorStake >= 1) return 'active';
    return 'pending';
  }, [connected, validatorStake]);

  const shortAddress = useMemo(() => {
    const addr = publicKey?.toBase58();
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  }, [publicKey]);

  return (
    <div className="h-screen w-full flex bg-[#0b0e14] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-4 space-y-6 flex flex-col">
  <Link to="/app/dashboard" className="flex items-center gap-3 px-2">
          <img src="/branding/logo.svg" alt="Noema" className="w-9 h-9 rounded-lg" />
          <div className="flex flex-col">
            <span className="font-semibold leading-tight">Noema</span>
            <span className="text-[10px] text-slate-400 -mt-0.5">SPL-8004 Stack</span>
          </div>
        </Link>
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom icons for Docs and Settings */}
        <div className="border-t border-white/10 pt-4 space-y-2">
          <Link 
            to="/app/docs"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            title="Documentation"
          >
            <BookOpen className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        {/* Wallet button moved to header */}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-6">
          <div className="text-sm text-slate-400">/app environment • local</div>
          <div className="flex items-center gap-3">
            {/* Validator status */}
            {connected && (
              <span className={`hidden md:inline text-xs font-medium ${
                validatorStatus === 'active' ? 'text-green-400' : 'text-amber-400'
              }`}>
                Validator: {validatorStatus === 'active' ? `✓ ${(validatorStake / 1e9).toFixed(2)} SOL` : 'pending stake'}
              </span>
            )}
            {!connected ? (
              <WalletMultiButton className="!bg-white !text-black hover:!bg-slate-200 !rounded-md !h-9 !text-sm !px-4 !py-2" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-9 px-3 rounded-md bg-white text-black text-sm font-medium flex items-center gap-2 hover:bg-slate-200 transition">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[10px] font-semibold">
                      {publicKey?.toBase58().slice(-2)}
                    </span>
                    <span>{shortAddress}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                  <DropdownMenuItem onSelect={() => navigate('/app/dashboard')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => disconnect()}>Disconnect</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#0b0e14] to-[#141922]">
          {children}
        </div>
        {/* Footer */}
        <footer className="h-14 border-t border-white/10 px-6 flex items-center justify-between bg-[#0b0e14]">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <img src="/branding/logo.svg" alt="Noema" className="w-5 h-5" />
            <span>Noema Protocol — SPL-8004 Suite</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-4">
            <a href="https://noemaprotocol.xyz/documentation" className="hover:text-slate-300">Docs</a>
            <a href="https://github.com/blambuer11/SPL--8004" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">GitHub</a>
          </div>
        </footer>
      </main>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-[#0b0e14] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* API Keys Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">🔑 API Keys</h4>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Your API Key</span>
                  <button 
                    onClick={() => {
                      const key = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                      navigator.clipboard.writeText(key);
                      alert('New API Key generated and copied: ' + key);
                    }}
                    className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                  >
                    Generate New Key
                  </button>
                </div>
                <div className="text-xs font-mono text-slate-300 bg-black/30 p-2 rounded">
                  sk_************************
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Use this key to authenticate API requests
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Preferences</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/10" />
                    <span className="text-slate-300">Desktop notifications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                    <span className="text-slate-300">Email summaries</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/10" />
                    <span className="text-slate-300">Auto-refresh data</span>
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Network</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">RPC Endpoint</label>
                    <select className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-slate-300 text-xs">
                      <option>Devnet (default)</option>
                      <option>Mainnet</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Theme</label>
                    <select className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-slate-300 text-xs">
                      <option>Dark (default)</option>
                      <option>Light</option>
                      <option>Auto</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-500">
                  Dashboard v1.2.0 • SPL-8004 Stack
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20 text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
