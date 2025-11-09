import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./components/WalletProvider";
import { NetworkProvider } from "./components/NetworkProvider";
import { Navbar } from "./components/Navbar";
import Index from './pages/Index';
import Agents from './pages/Agents';
import Validation from './pages/Validation';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import Docs from './pages/Docs';
import Developer from './pages/Developer';
import NoCodeTool from './pages/NoCodeTool';
import SPLXStack from './pages/DocsSPLX';
import X402Payment from './pages/X402Payment';
import NotFound from './pages/NotFound';
import { Footer } from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
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
                  <Route path="/app" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                  <Route path="/docs" element={<ErrorBoundary><Docs /></ErrorBoundary>} />
                  <Route path="/splx" element={<ErrorBoundary><SPLXStack /></ErrorBoundary>} />
                  <Route path="/x402" element={<ErrorBoundary><X402Payment /></ErrorBoundary>} />
                  <Route path="/no-code" element={<ErrorBoundary><NoCodeTool /></ErrorBoundary>} />
                  <Route path="/agents" element={<ErrorBoundary><Agents /></ErrorBoundary>} />
                  <Route path="/validation" element={<ErrorBoundary><Validation /></ErrorBoundary>} />
                  <Route path="/payments" element={<ErrorBoundary><Payments /></ErrorBoundary>} />
                  <Route path="/profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
                    <Route path="/developer" element={<ErrorBoundary><Developer /></ErrorBoundary>} />
                  <Route path="/stake" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                  <Route path="/staking" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                  <Route path="*" element={<NotFound />} />
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
