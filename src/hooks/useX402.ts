import { useCallback, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { createX402Client, X402Client, X402PaymentError } from '@/lib/x402-client';
// Avoid Node 'crypto' in browser; use precomputed discriminator instead

const X402_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_X402_PROGRAM_ID || '6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia'
);
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // Devnet

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
  const [instantPaymentLoading, setInstantPaymentLoading] = useState(false);
  // sha256('global:instant_payment').slice(0,8)
  const INSTANT_PAYMENT_DISCRIMINATOR = Buffer.from([
    159, 239, 183, 134, 33, 68, 121, 86,
  ]);

  /**
   * Instant payment for agent rewards
   */
  const instantPayment = useCallback(
    async (recipient: PublicKey, amount: number, memo: string = '') => {
      if (!wallet.publicKey || !wallet.sendTransaction) {
        throw new Error('Wallet not connected');
      }

      setInstantPaymentLoading(true);

      try {
        // Derive config PDA
        const [configPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('config')],
          X402_PROGRAM_ID
        );

        // Derive payment PDA with timestamp
        const timestamp = Date.now();
        const tsBuf = Buffer.alloc(8);
        tsBuf.writeBigUInt64LE(BigInt(timestamp));
        const [paymentPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('payment'),
            wallet.publicKey.toBuffer(),
            recipient.toBuffer(),
            tsBuf,
          ],
          X402_PROGRAM_ID
        );

        // Get token accounts
        const senderTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          wallet.publicKey
        );
        const recipientTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          recipient
        );

        // Read treasury from config
        const configInfo = await connection.getAccountInfo(configPda);
        if (!configInfo) throw new Error('Config not initialized');
        
        const treasuryPubkey = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32));
        const treasuryTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          treasuryPubkey
        );

        // Build instruction data
  const discriminator = INSTANT_PAYMENT_DISCRIMINATOR;
        const amountBuffer = Buffer.alloc(8);
        amountBuffer.writeBigUInt64LE(BigInt(Math.floor(amount * 1e6)));
        
        const memoBuffer = Buffer.from(memo, 'utf-8');
        const memoLengthBuffer = Buffer.alloc(4);
        memoLengthBuffer.writeUInt32LE(memoBuffer.length);

        const data = Buffer.concat([
          discriminator,
          amountBuffer,
          memoLengthBuffer,
          memoBuffer,
        ]);

        // Build instruction
        const ix = new TransactionInstruction({
          programId: X402_PROGRAM_ID,
          keys: [
            { pubkey: paymentPda, isSigner: false, isWritable: true },
            { pubkey: configPda, isSigner: false, isWritable: true },
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: recipient, isSigner: false, isWritable: false },
            { pubkey: senderTokenAccount, isSigner: false, isWritable: true },
            { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
            { pubkey: treasuryTokenAccount, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          data,
        });

        // Send transaction
        const tx = new Transaction().add(ix);
        const signature = await wallet.sendTransaction(tx, connection);
        
        // Confirm
        await connection.confirmTransaction(signature, 'confirmed');

        setLastPaymentSignature(signature);
        setInstantPaymentLoading(false);
        
        return {
          signature,
          netAmount: Math.floor(amount * 1e6 * 0.995),
          fee: Math.floor(amount * 1e6 * 0.005),
          paymentPda: paymentPda.toBase58(),
        };
      } catch (err) {
        setInstantPaymentLoading(false);
        throw err;
      }
    },
    [wallet.publicKey, wallet.sendTransaction, connection]
  );

  // Create X402 client
  const x402Client = createX402Client(connection, {
    ...(options?.facilitatorUrl && { facilitatorUrl: options.facilitatorUrl }),
    ...(options?.treasuryAddress && { treasuryAddress: new PublicKey(options.treasuryAddress) }),
    ...(options?.usdcMint && { usdcMint: new PublicKey(options.usdcMint) }),
    ...(options?.network && { network: options.network }),
  });

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
  instantPayment,
    isPaymentProcessing,
  instantPaymentLoading,
    lastPaymentSignature,
    isReady: !!wallet.publicKey && !!wallet.signTransaction,
  };
}

export type { X402Client, X402PaymentError };
