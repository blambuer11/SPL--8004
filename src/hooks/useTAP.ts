import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { TAPClient } from '@/lib/tap-client';

export function useTAP() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    return new TAPClient(connection, wallet as AnchorWallet);
  }, [connection, wallet]);

  return { client, connected: !!client };
}
