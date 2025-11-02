import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NetworkProvider>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/launch" element={<LaunchApp />} />
              <Route path="/app" element={<Dashboard />} />
              <Route path="/agents" element={<ErrorBoundary><Agents /></ErrorBoundary>} />
              <Route path="/validation" element={<Validation />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </TooltipProvider>
      </WalletProvider>
    </NetworkProvider>
  </QueryClientProvider>
);

export default App;
