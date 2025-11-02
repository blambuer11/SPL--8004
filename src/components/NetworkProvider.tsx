import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

type Network = 'devnet' | 'mainnet-beta' | 'testnet';

type NetworkContextValue = {
  network: Network;
  endpoint: string;
  setNetwork: (n: Network) => void;
};

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

// Hook must be in separate file for Fast Refresh, but we keep it here for simplicity
// Fast Refresh warning is safe to ignore for this pattern
export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetwork] = useState<Network>(() => {
    try {
      const stored = localStorage.getItem('noema-network');
      if (stored === 'mainnet-beta' || stored === 'testnet' || stored === 'devnet') return stored;
    } catch {
      // localStorage may not be available
    }
    const envNet = (import.meta.env?.VITE_SOLANA_NETWORK as Network | undefined) || 'devnet';
    return envNet;
  });

  useEffect(() => {
    try {
      localStorage.setItem('noema-network', network);
    } catch {
      // ignore if localStorage not available
    }
  }, [network]);

  const endpoint = useMemo(() => {
    // Prefer explicit env endpoints per network if provided
    const byNet = (n: Network) => {
      if (n === 'mainnet-beta' && import.meta.env?.VITE_SOLANA_MAINNET_RPC) return String(import.meta.env.VITE_SOLANA_MAINNET_RPC);
      if (n === 'testnet' && import.meta.env?.VITE_SOLANA_TESTNET_RPC) return String(import.meta.env.VITE_SOLANA_TESTNET_RPC);
      if (n === 'devnet' && import.meta.env?.VITE_SOLANA_DEVNET_RPC) return String(import.meta.env.VITE_SOLANA_DEVNET_RPC);
      const map: Record<Network, WalletAdapterNetwork> = {
        'devnet': WalletAdapterNetwork.Devnet,
        'mainnet-beta': WalletAdapterNetwork.Mainnet,
        'testnet': WalletAdapterNetwork.Testnet,
      };
      return clusterApiUrl(map[n]);
    };
    // Global override
    const globalRpc = (import.meta.env?.VITE_SOLANA_RPC as string | undefined) || (import.meta.env?.VITE_RPC_ENDPOINT as string | undefined);
    return globalRpc || byNet(network);
  }, [network]);

  const setNet = useCallback((n: Network) => setNetwork(n), []);

  const value = useMemo(() => ({ network, endpoint, setNetwork: setNet }), [network, endpoint, setNet]);
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}
