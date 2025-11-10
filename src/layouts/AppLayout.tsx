import { ReactNode, useMemo, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useStaking } from '@/hooks/useStaking';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, Users, PlusCircle, ShieldCheck, CreditCard, Fingerprint, Share2, BarChart2, Store, BookOpen, Settings, TrendingUp, Image } from 'lucide-react';

interface AppLayoutProps { children: ReactNode; }

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: <LayoutDashboard className='w-4 h-4' /> },
  { to: '/app/agents', label: 'Agents', icon: <Users className='w-4 h-4' /> },
  { to: '/app/create-agent', label: 'Create Agent', icon: <PlusCircle className='w-4 h-4' /> },
  { to: '/app/staking', label: 'Staking', icon: <TrendingUp className='w-4 h-4' /> },
  { to: '/app/validation', label: 'Validation', icon: <ShieldCheck className='w-4 h-4' /> },
  { to: '/app/payments', label: 'Payments', icon: <CreditCard className='w-4 h-4' /> },
  { to: '/app/x404', label: 'X404 NFT Bridge', icon: <Image className='w-4 h-4' /> },
  { to: '/app/attestations', label: 'Attestations', icon: <Fingerprint className='w-4 h-4' /> },
  { to: '/app/consensus', label: 'Consensus', icon: <Share2 className='w-4 h-4' /> },
  { to: '/app/analytics', label: 'Analytics', icon: <BarChart2 className='w-4 h-4' /> },
  { to: '/app/marketplace', label: 'Marketplace', icon: <Store className='w-4 h-4' /> },
  { to: '/app/docs', label: 'Docs', icon: <BookOpen className='w-4 h-4' /> },
  { to: '/app/settings', label: 'Settings', icon: <Settings className='w-4 h-4' /> },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { connected, publicKey, disconnect } = useWallet();
  const { client: stakingClient } = useStaking();
  const [validatorStake, setValidatorStake] = useState(0);

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
        <Link to="/app/dashboard" className="flex items-center gap-2 px-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
            ∩
          </div>
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
      </main>
    </div>
  );
}
