import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NetworkSwitcher } from './NetworkSwitcher';
import { FacilitatorHealth } from './FacilitatorHealth';
import { UserProfileAvatar } from './UserProfileAvatar';

export const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden">
              <img src="/logo.svg" alt="Noema" className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg text-foreground">Noema</span>
              <span className="text-xs text-muted-foreground -mt-1">Protocol</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/docs"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/docs')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Docs
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block"><FacilitatorHealth /></div>
            <div className="hidden sm:block"><NetworkSwitcher /></div>
            <WalletMultiButton className="!bg-foreground !text-white hover:!opacity-90 !rounded-lg !px-4 !py-2 !font-medium !text-sm !shadow-none" />
            <UserProfileAvatar />
            <Link
              to="/app"
              className="ml-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow hover:shadow-md"
            >
              App
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
