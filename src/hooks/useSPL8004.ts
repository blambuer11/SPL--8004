import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createSPL8004Client, SPL8004Client } from '@/lib/spl8004-client';
import { AnchorWallet } from '@solana/wallet-adapter-react';

export function useSPL8004() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }

    const anchorWallet: AnchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };

    return createSPL8004Client(connection, anchorWallet);
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  return {
    client,
    connected: wallet.connected,
    publicKey: wallet.publicKey,
  };
}

export type { SPL8004Client };
