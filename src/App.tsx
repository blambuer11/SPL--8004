import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./components/WalletProvider";
import { NetworkProvider } from "./components/NetworkProvider";
import { Navbar } from "./components/Navbar";
import Home from './pages/Home';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/app/Dashboard';
import Agents from './pages/app/Agents';
import AgentDetail from './pages/app/AgentDetail';
import AgentDetails from './pages/app/AgentDetails';
import CreateAgent from './pages/app/CreateAgent';
import Staking from './pages/app/Staking';
import Validation from './pages/app/Validation';
import Payments from './pages/app/Payments';
import Attestations from './pages/app/Attestations';
import Consensus from './pages/app/Consensus';
import AnalyticsPage from './pages/app/Analytics';
import Marketplace from './pages/app/Marketplace';
import DocsPage from './pages/app/Docs';
import SettingsPage from './pages/app/Settings';
import X404Bridge from './pages/X404Bridge';
import Documentation from './pages/Documentation';
import ErrorBoundary from "./components/ErrorBoundary";
// Tek sayfa mimariye geçildi; diğer importlar kaldırıldı

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div style={{ 
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '40vh', fontSize: '20px', color: '#8B5CF6'
  }}>
    Loading Noema...
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NetworkProvider>
        <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingScreen /> }>
                <ErrorBoundary>
                  <Navbar />
                </ErrorBoundary>
                <Routes>
                  {/* Home root */}
                  <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
                  {/* Documentation standalone */}
                  <Route path="/documentation" element={<ErrorBoundary><Documentation /></ErrorBoundary>} />
                  {/* App nested routes */}
                  <Route path="/app" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/app/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/app/agents" element={<AppLayout><Agents /></AppLayout>} />
                  <Route path="/app/agents/:agentId" element={<AppLayout><AgentDetails /></AppLayout>} />
                  <Route path="/app/create-agent" element={<AppLayout><CreateAgent /></AppLayout>} />
                  <Route path="/app/staking" element={<AppLayout><Staking /></AppLayout>} />
                  <Route path="/app/validation" element={<AppLayout><Validation /></AppLayout>} />
                  <Route path="/app/payments" element={<AppLayout><Payments /></AppLayout>} />
                  <Route path="/app/x404" element={<AppLayout><X404Bridge /></AppLayout>} />
                  <Route path="/app/attestations" element={<AppLayout><Attestations /></AppLayout>} />
                  <Route path="/app/consensus" element={<AppLayout><Consensus /></AppLayout>} />
                  <Route path="/app/analytics" element={<AppLayout><AnalyticsPage /></AppLayout>} />
                  <Route path="/app/marketplace" element={<AppLayout><Marketplace /></AppLayout>} />
                  <Route path="/app/docs" element={<AppLayout><DocsPage /></AppLayout>} />
                  <Route path="/app/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
                  {/* Legacy fallback & redirect */}
                  <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </WalletProvider>
      </NetworkProvider>
    </QueryClientProvider>
  );
};

export default App;
