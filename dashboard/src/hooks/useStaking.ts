import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createStakingClient, StakingClient } from '@/lib/staking-client';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Keypair } from '@solana/web3.js';

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

    // Fallback read-only
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

    return createStakingClient(connection, readonlyWallet);
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  return {
    client,
    connected: wallet.connected,
    publicKey: wallet.publicKey,
  };
}

export type { StakingClient };
