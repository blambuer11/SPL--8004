import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const inApp = location.pathname.startsWith('/app');

  if (inApp) return null; // App layout kendi header/sidebar'ını kullanacak

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left area */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              ∩
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-bold text-lg text-slate-900">Noema Protocol™</span>
              <span className="text-xs text-slate-600 font-medium -mt-1">The Noema Stack</span>
            </div>
          </Link>

          {/* Center nav (only on home for now) */}
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
          </div>

          {/* Right area */}
          <div className="flex items-center gap-3">
            <a href="/app/dashboard" aria-label="Open local app dashboard">
              <Button className="bg-slate-900 hover:bg-slate-800">Start Building</Button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
