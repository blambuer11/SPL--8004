import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./components/WalletProvider";
import { NetworkProvider } from "./components/NetworkProvider";
import { Navbar } from "./components/Navbar";
import Index from './pages/Index';
import LaunchApp from './pages/LaunchApp';
import Agents from './pages/Agents';
import Validation from './pages/Validation';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import Docs from './pages/Docs';
import NotFound from './pages/NotFound';
import { Footer } from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { Suspense } from "react";
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
                  <Route path="/launch" element={<ErrorBoundary><LaunchApp /></ErrorBoundary>} />
                  <Route path="/app" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                  <Route path="/agents" element={<ErrorBoundary><Agents /></ErrorBoundary>} />
                  <Route path="/validation" element={<ErrorBoundary><Validation /></ErrorBoundary>} />
                  <Route path="/payments" element={<ErrorBoundary><Payments /></ErrorBoundary>} />
                  <Route path="/profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
                  <Route path="/pricing" element={<ErrorBoundary><Pricing /></ErrorBoundary>} />
                  <Route path="/docs" element={<ErrorBoundary><Docs /></ErrorBoundary>} />
                  <Route path="/full" element={<FullApp />} />
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
