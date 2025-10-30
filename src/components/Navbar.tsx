import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Bot } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-lg group-hover:opacity-30 transition-opacity rounded-full"></div>
              <div className="relative w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-button">
                <Bot className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg glow-text">SPL-8004</span>
              <span className="text-xs text-muted-foreground -mt-1">AI Agent Protocol</span>
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
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/agents"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/agents')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Agents
            </Link>
            <Link
              to="/validation"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/validation')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Validation
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <WalletMultiButton className="!bg-gradient-primary !text-white hover:!opacity-90 !shadow-button !rounded-lg !px-6 !py-2 !font-semibold !text-sm" />
          </div>
        </div>
      </div>
    </nav>
  );
};
