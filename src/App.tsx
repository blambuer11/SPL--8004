import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import { Navbar } from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { NetworkProvider } from "./components/NetworkProvider";
import { WalletProvider } from "./components/WalletProvider";
import { MessageProvider } from "./contexts/MessageContext";

// Import pages
import Home from './pages/Home';
import Documentation from './pages/Documentation';
import API from './pages/API';
import Index from './pages/Index';

// App section pages
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/app/Dashboard';
import Agents from './pages/app/Agents';
import AgentDetails from './pages/app/AgentDetails';
import X402Test from './pages/app/X402Test';
import CreateAgent from './pages/app/CreateAgent';
import Staking from './pages/app/Staking';
import Payments from './pages/app/Payments';
import X404Bridge from './pages/X404Bridge';
import Attestations from './pages/app/Attestations';
import Consensus from './pages/app/Consensus';
import Marketplace from './pages/app/Marketplace';
import Docs from './pages/app/Docs';
import Settings from './pages/app/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-slate-300 text-lg">Loading Noema...</p>
    </div>
  </div>
);

const App = () => {
  // Debug overlay removed; no side-effect on mount

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <NetworkProvider>
          <WalletProvider>
            <MessageProvider>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <ErrorBoundary>
                    <Navbar />
                  </ErrorBoundary>
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                {/* Lighter landing as home to avoid heavy deps blocking render */}
                <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
                {/* Keep original rich Index at alternative path */}
                <Route path="/index" element={<ErrorBoundary><Index /></ErrorBoundary>} />
                
                {/* Alternative home page */}
                <Route path="/home" element={<ErrorBoundary><Home /></ErrorBoundary>} />
                
                {/* Documentation standalone */}
                <Route path="/documentation" element={<ErrorBoundary><Documentation /></ErrorBoundary>} />
                
                {/* API page */}
                <Route path="/api" element={<ErrorBoundary><API /></ErrorBoundary>} />
                
                {/* App section */}
                <Route path="/app" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/app/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                {/* Direct dashboard shortcut */}
                <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/app/agents" element={<AppLayout><Agents /></AppLayout>} />
                <Route path="/app/agents/:agentId" element={<AppLayout><AgentDetails /></AppLayout>} />
                <Route path="/app/create-agent" element={<AppLayout><CreateAgent /></AppLayout>} />
                <Route path="/app/staking" element={<AppLayout><Staking /></AppLayout>} />
                <Route path="/app/validation" element={<Navigate to="/app/staking" replace />} />
                <Route path="/app/payments" element={<AppLayout><Payments /></AppLayout>} />
                <Route path="/app/x404" element={<AppLayout><X404Bridge /></AppLayout>} />
                <Route path="/app/attestations" element={<AppLayout><Attestations /></AppLayout>} />
                <Route path="/app/consensus" element={<AppLayout><Consensus /></AppLayout>} />
                <Route path="/app/marketplace" element={<AppLayout><Marketplace /></AppLayout>} />
                <Route path="/app/docs" element={<AppLayout><Docs /></AppLayout>} />
                <Route path="/app/settings" element={<AppLayout><Settings /></AppLayout>} />
                <Route path="/app/x402-test" element={<AppLayout><X402Test /></AppLayout>} />
                
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </MessageProvider>
        </WalletProvider>
      </NetworkProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
