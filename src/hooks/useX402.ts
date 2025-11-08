import { useCallback, useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { createX402Client, X402Client, X402PaymentError } from '@/lib/x402-client';

/**
 * React Hook for X402 Payment Integration
 * 
 * Provides:
 * - Automatic payment handling for 402 responses
 * - Payment status tracking
 * - Facilitator health check
 */

interface UseX402Options {
  facilitatorUrl?: string;
  treasuryAddress?: string;
  usdcMint?: string;
  network?: string;
}

export function useX402(options?: UseX402Options) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [lastPaymentSignature, setLastPaymentSignature] = useState<string | null>(null);

  // Create X402 client (memoized to prevent re-creation on every render)
  const x402Client = useMemo(() => {
    return createX402Client(connection, {
      ...(options?.facilitatorUrl && { facilitatorUrl: options.facilitatorUrl }),
      ...(options?.treasuryAddress && { treasuryAddress: new PublicKey(options.treasuryAddress) }),
      ...(options?.usdcMint && { usdcMint: new PublicKey(options.usdcMint) }),
      ...(options?.network && { network: options.network }),
    });
  }, [connection, options]);

  /**
   * Fetch with automatic payment handling
   */
  const fetchWithPayment = useCallback(
    async <T,>(url: string, options?: RequestInit): Promise<T> => {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      if (!wallet.signTransaction) {
        throw new Error('Wallet does not support transaction signing');
      }

      setIsPaymentProcessing(true);
      setLastPaymentSignature(null);

      try {
        const result = await x402Client.fetchWithPayment<T>(
          url,
          options || {},
          wallet.publicKey,
          wallet.signTransaction
        );

        setIsPaymentProcessing(false);
        return result;
      } catch (error) {
        setIsPaymentProcessing(false);

        if (error instanceof X402PaymentError) {
          console.error('X402 Payment Error:', error.message, error.requirement);
        }

        throw error;
      }
    },
    [wallet.publicKey, wallet.signTransaction, x402Client]
  );

  /**
   * Check if facilitator is available
   */
  const checkFacilitator = useCallback(async () => {
    return x402Client.checkFacilitator();
  }, [x402Client]);

  /**
   * Get facilitator supported info
   */
  const getFacilitatorInfo = useCallback(async () => {
    return x402Client.getSupportedInfo();
  }, [x402Client]);

  return {
    fetchWithPayment,
    checkFacilitator,
    getFacilitatorInfo,
    isPaymentProcessing,
    lastPaymentSignature,
    isReady: !!wallet.publicKey && !!wallet.signTransaction,
  };
}

export type { X402Client, X402PaymentError };
