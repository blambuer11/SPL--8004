import { Link } from 'react-router-dom';
import { Github, BookOpen, Code2 } from 'lucide-react';

// Modern Noema Logo Component
function NoemaLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { container: "h-5 w-5", text: "text-[10px]" },
    md: { container: "h-6 w-6", text: "text-xs" },
    lg: { container: "h-8 w-8", text: "text-sm" }
  };
  const s = sizes[size];
  
  return (
    <div className={`${s.container} relative rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg`}>
      <span className={`${s.text} font-bold text-white tracking-tight`}>N</span>
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50" />
    </div>
  );
}

// X (Twitter) Icon Component
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <NoemaLogo size="md" />
              <span className="font-semibold text-foreground">Noema</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Trustless AI agent identity and reputation on Solana.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link to="/agents" className="hover:text-foreground">Agents</Link></li>
              <li><Link to="/validation" className="hover:text-foreground">Validation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Developers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <Link to="/docs" className="hover:text-foreground">Docs</Link>
              </li>
              <li className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                <Link to="/docs#sdk" className="hover:text-foreground">SDK</Link>
              </li>
              <li className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                <a href="https://github.com/blambuer11/SPL--8004" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <XIcon className="h-4 w-4" />
                <a href="https://x404.ai" target="_blank" rel="noreferrer" className="hover:text-foreground">X404 Integration</a>
              </li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Noema. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Program ID (devnet): {import.meta.env.VITE_PROGRAM_ID || 'G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW'}</p>
        </div>
      </div>
    </footer>
  );
}
