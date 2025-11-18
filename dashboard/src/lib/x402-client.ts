import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

/**
 * X402 Payment Client for NOEMA-8004
 * 
 * Wraps API calls with automatic USDC micropayments using HTTP 402 protocol
 */

export interface X402Config {
  facilitatorUrl: string;
  treasuryAddress: PublicKey;
  usdcMint: PublicKey;
  network: string;
}

export interface PaymentRequirement {
  version: string;
  priceUsd: number;
  network: string;
  receiver: string;
  tokenMint: string;
  facilitator: string;
}

export interface X402PaymentPayload {
  version: string;
  network: string;
  transaction: string; // Base64
  metadata: {
    endpoint: string;
    amount: string;
    recipient: string;
  };
}

export class X402PaymentError extends Error {
  constructor(
    message: string,
    public readonly requirement?: PaymentRequirement,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'X402PaymentError';
  }
}

/**
 * X402 Payment Wrapper
 * 
 * Automatically handles 402 Payment Required responses:
 * 1. Detects 402 response
 * 2. Creates USDC payment transaction
 * 3. Signs with user's wallet
 * 4. Sends to facilitator for gasless submission
 * 5. Retries original request with payment proof
 */
export class X402Client {
  private config: X402Config;
  private connection: Connection;

  constructor(connection: Connection, config: X402Config) {
    this.connection = connection;
    this.config = config;
  }

  /**
   * Fetch with automatic X402 payment handling
   */
  async fetchWithPayment<T>(
    url: string,
    options: RequestInit = {},
    payerPublicKey: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<T> {
    // First attempt - check if payment required
    const response = await fetch(url, options);

    if (response.status !== 402) {
      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }
      return response.json();
    }

    // 402 Payment Required - handle payment flow
    console.log('💰 Payment required, initiating X402 flow...');

    const paymentData = await response.json();
    const requirement: PaymentRequirement = paymentData.requirement;

    if (!requirement) {
      throw new X402PaymentError('Missing payment requirement in 402 response', undefined, 402);
    }

    console.log(`💵 Price: $${requirement.priceUsd} USDC`);

    // Create payment transaction
    const paymentTx = await this.createPaymentTransaction(
      payerPublicKey,
      new PublicKey(requirement.receiver),
      requirement.priceUsd,
      url
    );

    // Sign with user's wallet (client-side signature)
    const signedTx = await signTransaction(paymentTx);

    // Serialize transaction
    const serialized = signedTx.serialize({ requireAllSignatures: false });
    const base64Tx = Buffer.from(serialized).toString('base64');

    // Prepare payment payload
    const payload: X402PaymentPayload = {
      version: requirement.version,
      network: requirement.network,
      transaction: base64Tx,
      metadata: {
        endpoint: url,
        amount: requirement.priceUsd.toString(),
        recipient: requirement.receiver,
      },
    };

    // Verify payment with facilitator
    console.log('🔍 Verifying payment...');
    const verifyRes = await fetch(`${this.config.facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.isValid) {
      throw new X402PaymentError('Payment verification failed', requirement);
    }

    // Settle payment (facilitator broadcasts via Kora)
    console.log('📡 Settling payment...');
    const settleRes = await fetch(`${this.config.facilitatorUrl}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const settleData = await settleRes.json();
    if (!settleData.success) {
      throw new X402PaymentError('Payment settlement failed', requirement);
    }

    console.log(`✅ Payment settled: ${settleData.signature}`);

    // Retry original request with payment proof
    const retryHeaders = new Headers(options.headers);
    retryHeaders.set('x-payment-response', JSON.stringify(settleData));
    retryHeaders.set('x-payment-signature', settleData.signature);

    const retryResponse = await fetch(url, {
      ...options,
      headers: retryHeaders,
    });

    if (!retryResponse.ok) {
      throw new Error(`Request failed after payment: ${retryResponse.statusText}`);
    }

    return retryResponse.json();
  }

  /**
   * Create USDC payment transaction
   */
  private async createPaymentTransaction(
    payer: PublicKey,
    recipient: PublicKey,
    amountUsd: number,
    endpoint: string
  ): Promise<Transaction> {
    const { usdcMint } = this.config;

    // Convert USD to USDC (6 decimals)
    const amountLamports = Math.floor(amountUsd * 1_000_000);

    // Get token accounts
    const payerTokenAccount = await getAssociatedTokenAddress(usdcMint, payer);
    const recipientTokenAccount = await getAssociatedTokenAddress(usdcMint, recipient);

    // Create transfer instruction
    const transferIx = createTransferInstruction(
      payerTokenAccount,
      recipientTokenAccount,
      payer,
      amountLamports,
      [],
      TOKEN_PROGRAM_ID
    );

    // Add memo with endpoint info
    const memoIx = new TransactionInstruction({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(`NOEMA-8004 Payment: ${endpoint}`, 'utf-8'),
    });

    // Build transaction
    const tx = new Transaction();
    tx.add(transferIx);
    tx.add(memoIx);

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer;

    return tx;
  }

  /**
   * Check if facilitator is available
   */
  async checkFacilitator(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.facilitatorUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get supported payment info from facilitator
   */
  async getSupportedInfo() {
    const response = await fetch(`${this.config.facilitatorUrl}/supported`);
    if (!response.ok) {
      throw new Error('Failed to fetch facilitator info');
    }
    return response.json();
  }
}

/**
 * Create X402 client with default NOEMA-8004 config
 */
export function createX402Client(
  connection: Connection,
  config?: Partial<X402Config>
): X402Client {
  const defaultConfig: X402Config = {
    facilitatorUrl: import.meta.env.VITE_X402_FACILITATOR_URL || 'https://noemaprotocol.xyz/api/x402',
    treasuryAddress: new PublicKey(
      import.meta.env.VITE_SPL8004_TREASURY ||
        '9x3TDBKE7qFHXmvUUhPMkkSBhLmzazRxQaKwzSrQwcXX'
    ),
    usdcMint: new PublicKey(
      import.meta.env.VITE_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
    ),
    network: import.meta.env.VITE_SOLANA_NETWORK || 'solana-devnet',
    ...config,
  };

  return new X402Client(connection, defaultConfig);
}
