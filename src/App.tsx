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
import Home from './pages/Home';
import Documentation from './pages/Documentation';
// App section pages (lazy import yerine direkt)
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/app/Dashboard';
import Agents from './pages/app/Agents';
import AgentDetails from './pages/app/AgentDetails';
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
                  {/* Home root */}
                  <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
                  {/* Documentation standalone */}
                  <Route path="/documentation" element={<ErrorBoundary><Documentation /></ErrorBoundary>} />
                  
                  {/* App section - internal routes for local dev */}
                  <Route path="/app" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/app/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/app/agents" element={<AppLayout><Agents /></AppLayout>} />
                  <Route path="/app/agents/:agentId" element={<AppLayout><AgentDetails /></AppLayout>} />
                  
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
);
};

export default App;
