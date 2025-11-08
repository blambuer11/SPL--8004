import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./components/WalletProvider";
import { NetworkProvider } from "./components/NetworkProvider";
import { Navbar } from "./components/Navbar";
import Index from './pages/Index';
import SPLXStack from './pages/NeomaStack';
import Agents from './pages/Agents';
import Validation from './pages/Validation';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
// import Docs from './pages/Docs';
import Developer from './pages/Developer';
import NoCodeTool from './pages/NoCodeTool';
import NoCodeBuilder from './pages/NoCodeBuilder';
import AgentAnalytics from './pages/AgentAnalytics';
import Stake from './pages/Stake';
import SPLXDashboard from './pages/SPLXDashboard';
import AgentCreator from './pages/AgentCreator';
import AgentDetails from './pages/AgentDetails';
import AttestationHub from './pages/AttestationHub';
import ConsensusManager from './pages/ConsensusManager';
import Marketplace from './pages/Marketplace';
import Settings from './pages/Settings';
import X402Payment from './pages/X402Payment';
import NotFound from './pages/NotFound';
import { Footer } from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import React, { Suspense } from "react";
import FullApp from "./FullApp";

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
                  <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
                  <Route path="/x402" element={<ErrorBoundary><X402Payment /></ErrorBoundary>} />
                </Routes>
                <ErrorBoundary>
                  <Footer />
                </ErrorBoundary>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </WalletProvider>
      </NetworkProvider>
    </QueryClientProvider>
  );
};

export default App;
