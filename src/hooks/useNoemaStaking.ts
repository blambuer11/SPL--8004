import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createNoemaStakingClient } from '@/lib/noema/noema-staking-client';

export function useNoemaStaking() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const client = useMemo(() => {
    if (!publicKey || !signTransaction) return null;

    const wallet = {
      publicKey,
      signTransaction,
    };

    return createNoemaStakingClient(connection, wallet);
  }, [connection, publicKey, signTransaction]);

  return {
    client,
    connected: !!publicKey,
    publicKey,
  };
}
