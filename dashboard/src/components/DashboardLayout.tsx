import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, CheckCircle2, Coins, TrendingUp, Award } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path.includes('?')) {
      return location.pathname === path.split('?')[0] && location.search.includes(path.split('?')[1]);
    }
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/app', label: '🆔 Noema ID', icon: Shield },
    { path: '/agents', label: 'Manage Agents', icon: Shield },
    { path: '/app?tab=staking', label: '💎 Validator Staking', icon: Award },
    { path: '/validation', label: 'Submit Validation', icon: CheckCircle2 },
    { path: '/payments', label: '💳 Noema Pay', icon: Coins },
    { path: '/profile', label: 'Rewards & Profile', icon: TrendingUp },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-slate-50">
        <div className="p-6">
          <h2 className="font-semibold text-lg mb-4 text-slate-900">Dashboard</h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
