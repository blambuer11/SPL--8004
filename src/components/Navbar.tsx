import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  const inApp = location.pathname.startsWith('/app');
  const APP_BASE = import.meta.env.VITE_APP_BASE_URL ?? 'https://app.noemaprotocol.xyz';

  if (inApp) return null; // App layout kendi header/sidebar'ını kullanacak

  const navigationLinks = [
    { to: '/api', label: 'API' },
    { to: '/documentation', label: 'Docs' },
    { to: '/app', label: 'Dashboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left area */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/branding/logo.svg" alt="Noema Protocol" className="w-10 h-10 rounded-xl" />
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-lg text-slate-900">Noema Protocol™</span>
              <span className="text-xs text-slate-600 font-medium -mt-1">The Noema Stack</span>
            </div>
          </Link>

          {/* Center nav - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right area */}
          <div className="flex items-center gap-3">
            {/* Desktop - Start Building Button */}
            <Link to="/app" aria-label="Open app dashboard" className="hidden md:block">
              <Button className="bg-slate-900 hover:bg-slate-800">Start Building</Button>
            </Link>

            {/* Mobile - Hamburger Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg text-base font-medium transition-all ${
                        isActive(link.to)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-slate-200 pt-4 mt-2">
                    <Link to="/app" aria-label="Open app dashboard" className="block">
                      <Button className="w-full bg-slate-900 hover:bg-slate-800">
                        Start Building
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
