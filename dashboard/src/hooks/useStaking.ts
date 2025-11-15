import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createStakingClient, StakingClient } from '@/lib/staking-client';
import { AnchorWallet } from '@solana/wallet-adapter-react';

export function useStaking() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const client = useMemo(() => {
    if (wallet.publicKey && wallet.signTransaction && wallet.signAllTransactions) {
      const anchorWallet: AnchorWallet = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      };
      return createStakingClient(connection, anchorWallet);
    }

    // No signing wallet available — return null so callers cannot accidentally
    // perform actions or queries that depend on a real owner key.
    return null;
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  return {
    client,
    connected: wallet.connected,
    publicKey: wallet.publicKey,
  };
}

export type { StakingClient };
