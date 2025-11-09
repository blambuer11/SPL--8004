import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              ∩
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900">Noema Protocol™</span>
              <span className="text-xs text-slate-600 font-medium -mt-1">The Noema Stack</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Home
              </Link>
              <a
                href="/#register"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Register Agent
              </a>
              <a
                href="/#staking"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Staking
              </a>
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
            <WalletMultiButton className="!bg-slate-900 hover:!bg-slate-800 !rounded-lg !text-sm !font-medium !px-6 !py-2.5" />
          </div>
        </div>
      </div>
    </nav>
  );
};
