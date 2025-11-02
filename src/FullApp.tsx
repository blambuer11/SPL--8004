import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./components/WalletProvider";
import { NetworkProvider } from "./components/NetworkProvider";
import { Suspense } from "react";

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div style={{ 
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', fontSize: '24px', color: '#8B5CF6'
  }}>
    Loading providers...
  </div>
);

export default function FullApp() {
  console.log('🧩 FullApp mounting...');
  return (
    <QueryClientProvider client={queryClient}>
      <NetworkProvider>
        <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<LoadingScreen /> }>
              <div style={{ padding: 16, background: '#0ea5e9', color: 'white', textAlign: 'center' }}>
                🧪 FullApp Debug: Providers mounted
              </div>
              <div style={{ padding: 32, fontSize: 20, textAlign: 'center' }}>
                <p>✅ If you see this, QueryClient + NetworkProvider + WalletProvider are rendering.</p>
              </div>
            </Suspense>
          </TooltipProvider>
        </WalletProvider>
      </NetworkProvider>
    </QueryClientProvider>
  );
}
