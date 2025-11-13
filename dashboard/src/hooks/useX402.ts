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

const X402_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_X402_PROGRAM_ID || '6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia'
);
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

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
  const INSTANT_PAYMENT_DISCRIMINATOR = Buffer.from([
    159, 239, 183, 134, 33, 68, 121, 86,
  ]);

  const instantPayment = useCallback(
    async (recipient: PublicKey, amount: number, memo: string = '') => {
      if (!wallet.publicKey || !wallet.sendTransaction) {
        throw new Error('Wallet not connected');
      }

      setInstantPaymentLoading(true);

      try {
        const [configPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('config')],
          X402_PROGRAM_ID
        );

        let paymentPda: PublicKey | null = null;
        let successTimestamp = 0;
        const baseTimestamp = Math.floor(Date.now() / 1000);

        for (let offset = -3; offset <= 3; offset++) {
          const testTimestamp = baseTimestamp + offset;
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

          const existing = await connection.getAccountInfo(testPda);
          if (!existing) {
            paymentPda = testPda;
            successTimestamp = testTimestamp;
            break;
          }
        }

        if (!paymentPda) {
          throw new Error('Could not find available payment PDA (all timestamps used)');
        }

        const senderTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          wallet.publicKey
        );

        const recipientTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          recipient
        );

        const configInfo = await connection.getAccountInfo(configPda);
        if (!configInfo) throw new Error('Config not initialized');

        const treasuryPubkey = new PublicKey(configInfo.data.subarray(8 + 32, 8 + 32 + 32));
        const treasuryTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          treasuryPubkey
        );

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
          INSTANT_PAYMENT_DISCRIMINATOR,
          amountBuffer,
          memoLengthBuffer,
          memoBuffer,
        ]);

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

        const tx = new Transaction().add(ix);
        const signature = await wallet.sendTransaction(tx, connection);
        await connection.confirmTransaction(signature, 'confirmed');

        setLastPaymentSignature(signature);
        setInstantPaymentLoading(false);

        return {
          signature,
          netAmount: Math.floor(amount * 1e6 * 0.995),
          fee: Math.floor(amount * 1e6 * 0.005),
          paymentPda: paymentPda.toBase58(),
          timestamp: successTimestamp,
        };
      } catch (err: unknown) {
        const error = err as { message?: string; logs?: string[]; name?: string; code?: string; data?: unknown };
        console.error('instant_payment failed:', {
          message: error.message,
          logs: error.logs,
          name: error.name,
          code: error.code,
          data: error.data,
        });

        let userMsg = 'Payment failed';
        if (error.message?.includes('insufficient')) {
          userMsg = 'Insufficient funds';
        } else if (error.message?.includes('signature')) {
          userMsg = 'Transaction rejected';
        } else if (error.logs && error.logs.length > 0) {
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

  const x402Client = createX402Client(connection, {
    ...(options?.facilitatorUrl && { facilitatorUrl: options.facilitatorUrl }),
    ...(options?.treasuryAddress && { treasuryAddress: new PublicKey(options.treasuryAddress) }),
    ...(options?.usdcMint && { usdcMint: new PublicKey(options.usdcMint) }),
    ...(options?.network && { network: options.network }),
  });

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

  const checkFacilitator = useCallback(async () => {
    return x402Client.checkFacilitator();
  }, [x402Client]);

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
