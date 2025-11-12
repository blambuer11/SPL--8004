import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./components/WalletProvider";
import { NetworkProvider } from "./components/NetworkProvider";
import { MessageProvider } from "./contexts/MessageContext";
import { Navbar } from "./components/Navbar";
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/app/Dashboard';
import Agents from './pages/app/Agents';
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
          <MessageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Suspense fallback={<LoadingScreen /> }>
                <Routes>
                  {/* Dashboard routes (no /app prefix; deployed on app.noemaprotocol.xyz) */}
                  <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/agents" element={<AppLayout><Agents /></AppLayout>} />
                  <Route path="/agents/:agentId" element={<AppLayout><AgentDetails /></AppLayout>} />
                  <Route path="/create-agent" element={<AppLayout><CreateAgent /></AppLayout>} />
                  <Route path="/staking" element={<AppLayout><Staking /></AppLayout>} />
                  <Route path="/validation" element={<AppLayout><Validation /></AppLayout>} />
                  <Route path="/payments" element={<AppLayout><Payments /></AppLayout>} />
                  <Route path="/x404" element={<AppLayout><X404Bridge /></AppLayout>} />
                  <Route path="/attestations" element={<AppLayout><Attestations /></AppLayout>} />
                  <Route path="/consensus" element={<AppLayout><Consensus /></AppLayout>} />
                  <Route path="/analytics" element={<AppLayout><AnalyticsPage /></AppLayout>} />
                  <Route path="/marketplace" element={<AppLayout><Marketplace /></AppLayout>} />
                  <Route path="/docs" element={<AppLayout><DocsPage /></AppLayout>} />
                  <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </MessageProvider>
      </WalletProvider>
    </NetworkProvider>
  </QueryClientProvider>
);
};

export default App;
