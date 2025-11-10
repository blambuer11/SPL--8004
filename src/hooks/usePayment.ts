import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PaymentClient } from '@/lib/payment-client';
import { AnchorWallet } from '@solana/wallet-adapter-react';

export function usePayment() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    
    const anchorWallet: AnchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions || (async (txs) => {
        const signed = [];
        for (const tx of txs) {
          signed.push(await wallet.signTransaction!(tx));
        }
        return signed;
      }),
    };

    return new PaymentClient(connection, anchorWallet);
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  return { client, connected: !!wallet.publicKey };
}
