import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { FCPClient } from '@/lib/fcp-client';

export function useFCP() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    return new FCPClient(connection, wallet as AnchorWallet);
  }, [connection, wallet]);

  return { client, connected: !!client };
}
