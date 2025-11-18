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
        console.log('🚀 Starting instant payment:', {
          sender: wallet.publicKey.toBase58(),
          recipient: recipient.toBase58(),
          amount,
          memo
        });

        // Derive config PDA
        const [configPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('config')],
          X402_PROGRAM_ID
        );
        console.log('📝 Config PDA:', configPda.toBase58());

        // Try multiple timestamp offsets to match blockchain time
        let paymentPda: PublicKey | null = null;
        let successTimestamp = 0;
        
        const baseTimestamp = Math.floor(Date.now() / 1000);
        console.log('⏰ Base timestamp:', baseTimestamp);
        
        // Try offsets from -3 to +3 seconds
        for (let offset = -3; offset <= 3; offset++) {
          const testTimestamp = baseTimestamp + offset;
          
          // Write timestamp as little-endian 64-bit integer (manual to avoid BigInt CSP issues)
          const tsBuf = Buffer.alloc(8);
          let ts = testTimestamp;
          for (let i = 0; i < 8; i++) {
            tsBuf[i] = ts & 0xff;
            ts = Math.floor(ts / 256);
          }
          
          const [testPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('payment'),
              wallet.publicKey.toBuffer(),
              recipient.toBuffer(),
              tsBuf,
            ],
            X402_PROGRAM_ID
          );
          
          // Check if account already exists
          const existing = await connection.getAccountInfo(testPda);
          if (!existing) {
            paymentPda = testPda;
            successTimestamp = testTimestamp;
            console.log(`✅ Using timestamp ${testTimestamp} (offset ${offset}s)`);
            break;
          }
        }
        
        if (!paymentPda) {
          throw new Error('Could not find available payment PDA (all timestamps used)');
        }
        
        console.log('💳 Payment PDA:', paymentPda.toBase58());

        // Get token accounts
        const senderTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          wallet.publicKey
        );
        console.log('💰 Sender token account:', senderTokenAccount.toBase58());

        const recipientTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          recipient
        );
        console.log('💰 Recipient token account:', recipientTokenAccount.toBase58());

        // Read treasury from config
        const configInfo = await connection.getAccountInfo(configPda);
        if (!configInfo) throw new Error('Config not initialized');
        
        const treasuryPubkey = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32));
        console.log('🏦 Treasury:', treasuryPubkey.toBase58());
        
        const treasuryTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          treasuryPubkey
        );
        console.log('🏦 Treasury token account:', treasuryTokenAccount.toBase58());

        // Build instruction data
        const discriminator = INSTANT_PAYMENT_DISCRIMINATOR;
        
        // Write amount as little-endian 64-bit (manual to avoid BigInt CSP issues)
        const amountBuffer = Buffer.alloc(8);
        const amountMicroUsdc = Math.floor(amount * 1e6);
        let amt = amountMicroUsdc;
        for (let i = 0; i < 8; i++) {
          amountBuffer[i] = amt & 0xff;
          amt = Math.floor(amt / 256);
        }
        
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
        console.log('📤 Sending transaction...');
        const signature = await wallet.sendTransaction(tx, connection);
        console.log('✅ Transaction sent:', signature);
        
        // Confirm
        console.log('⏳ Confirming...');
        await connection.confirmTransaction(signature, 'confirmed');
        console.log('✅ Transaction confirmed!');

        setLastPaymentSignature(signature);
        setInstantPaymentLoading(false);
        
        return {
          signature,
          netAmount: Math.floor(amount * 1e6 * 0.995),
          fee: Math.floor(amount * 1e6 * 0.005),
          paymentPda: paymentPda.toBase58(),
        };
      } catch (err: unknown) {
        const error = err as { message?: string; logs?: string[]; name?: string; code?: string; data?: unknown };
        console.error('❌ instant_payment failed:', {
          message: error?.message,
          logs: error?.logs,
          name: (error as any)?.name,
          code: (error as any)?.code,
          data: (error as any)?.data
        });

        let userMsg = 'Payment failed';
        if (error?.message?.toLowerCase().includes('insufficient')) {
          userMsg = 'Insufficient funds';
        } else if (error?.message?.toLowerCase().includes('signature')) {
          userMsg = 'Transaction rejected';
        } else if (error?.logs && error.logs.length > 0) {
          const lastLog = error.logs[error.logs.length - 1];
          if (lastLog.includes('Error')) {
            userMsg = lastLog.substring(0, 100);
          }
        }

        setInstantPaymentLoading(false);
        throw new Error(userMsg);
      }
    },
    [connection, wallet, INSTANT_PAYMENT_DISCRIMINATOR]
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
