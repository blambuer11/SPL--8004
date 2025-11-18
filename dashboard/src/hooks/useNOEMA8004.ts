import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createSPL8004Client, SPL8004Client } from '@/lib/noema8004-client';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Keypair } from '@solana/web3.js';

export function useNOEMA8004() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const client = useMemo(() => {
    // When wallet is connected, use real wallet
    if (wallet.publicKey && wallet.signTransaction && wallet.signAllTransactions) {
      const anchorWallet: AnchorWallet = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      };
      return createSPL8004Client(connection, anchorWallet);
    }

    // Fallback: create a read-only client for public data fetching
    const kp = Keypair.generate();
    const readonlyWallet: AnchorWallet = {
      publicKey: kp.publicKey,
      async signTransaction() {
        throw new Error('Wallet not connected');
      },
      async signAllTransactions() {
        throw new Error('Wallet not connected');
      },
    } as unknown as AnchorWallet;

    return createSPL8004Client(connection, readonlyWallet);
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  return {
    client,
    connected: wallet.connected,
    publicKey: wallet.publicKey,
  };
}

export type { SPL8004Client };
