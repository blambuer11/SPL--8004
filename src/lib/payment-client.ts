import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import nacl from "tweetnacl";

// USDC Mainnet Mint
export const USDC_MINT = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

export interface PaymentRequest {
  recipient: PublicKey;
  amountUsdc: number; // USDC amount (e.g., 0.5 for $0.50)
  memo?: string;
}

export interface PaymentChallenge {
  challenge: string;
  timestamp: number;
  expiresAt: number;
}

export class PaymentClient {
  private connection: Connection;
  private wallet: AnchorWallet;

  constructor(connection: Connection, wallet: AnchorWallet) {
    this.connection = connection;
    this.wallet = wallet;
  }

  /**
   * Generate payment challenge (for agent-to-agent authentication)
   */
  generateChallenge(): PaymentChallenge {
    const challenge = Array.from(nacl.randomBytes(32))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const timestamp = Date.now();
    return {
      challenge,
      timestamp,
      expiresAt: timestamp + 60000, // 1 minute expiry
    };
  }

  /**
   * Sign challenge (drone agent proves identity)
   */
  async signChallenge(challenge: string, privateKeyBytes: Uint8Array): Promise<string> {
    const messageBytes = new TextEncoder().encode(challenge);
    const signature = nacl.sign.detached(messageBytes, privateKeyBytes);
    return Buffer.from(signature).toString('base64');
  }

  /**
   * Verify challenge signature (home agent verifies drone)
   */
  verifyChallenge(challenge: string, signature: string, publicKey: PublicKey): boolean {
    try {
      const messageBytes = new TextEncoder().encode(challenge);
      const signatureBytes = Buffer.from(signature, 'base64');
      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Send USDC payment
   */
  async sendUSDC(request: PaymentRequest): Promise<string> {
    const { recipient, amountUsdc, memo } = request;

    // Convert USDC amount to lamports (USDC has 6 decimals)
    const usdcLamports = Math.floor(amountUsdc * 1_000_000);

    // Get sender's USDC token account
    const senderTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      this.wallet.publicKey
    );

    // Get recipient's USDC token account
    const recipientTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      recipient
    );

    // Create transfer instruction
    const transferIx = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      this.wallet.publicKey,
      usdcLamports,
      [],
      TOKEN_PROGRAM_ID
    );

    // Build transaction
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    const tx = new Transaction({
      feePayer: this.wallet.publicKey,
      blockhash,
      lastValidBlockHeight,
    });

    tx.add(transferIx);

    // Add memo if provided
    if (memo) {
      const memoIx = new TransactionInstruction({
        keys: [],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(memo, 'utf-8'),
      });
      tx.add(memoIx);
    }

    // Sign and send
    const signed = await this.wallet.signTransaction(tx);
    const sig = await this.connection.sendRawTransaction(signed.serialize(), {
      maxRetries: 3,
      preflightCommitment: "confirmed",
    });

    await this.connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    return sig;
  }

  /**
   * Get USDC balance
   */
  async getUSDCBalance(owner?: PublicKey): Promise<number> {
    const ownerPubkey = owner || this.wallet.publicKey;
    try {
      const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, ownerPubkey);
      const balance = await this.connection.getTokenAccountBalance(tokenAccount);
      return parseFloat(balance.value.uiAmount?.toString() || '0');
    } catch (error) {
      console.error('Failed to fetch USDC balance:', error);
      return 0;
    }
  }

  /**
   * Watch for incoming USDC payment
   */
  async waitForPayment(
    expectedAmount: number,
    fromAddress: PublicKey,
    timeoutMs = 60000
  ): Promise<boolean> {
    const recipientTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      this.wallet.publicKey
    );

    const startTime = Date.now();
    const expectedLamports = Math.floor(expectedAmount * 1_000_000);

    while (Date.now() - startTime < timeoutMs) {
      try {
        // Get recent signatures
        const signatures = await this.connection.getSignaturesForAddress(
          recipientTokenAccount,
          { limit: 10 }
        );

        // Check each transaction
        for (const sigInfo of signatures) {
          const tx = await this.connection.getParsedTransaction(sigInfo.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (!tx) continue;

          // Look for token transfer instruction
          const tokenTransfer = tx.transaction.message.instructions.find(
            (ix: { parsed?: { type?: string; info?: { destination?: string; authority?: string; amount?: string } } }) => {
              if (!('parsed' in ix)) return false;
              return (
                ix.parsed?.type === 'transfer' &&
                ix.parsed?.info?.destination === recipientTokenAccount.toBase58() &&
                ix.parsed?.info?.authority === fromAddress.toBase58()
              );
            }
          );

          if (tokenTransfer && 'parsed' in tokenTransfer) {
            const amount = parseInt(tokenTransfer.parsed.info.amount);
            if (amount >= expectedLamports) {
              return true;
            }
          }
        }
      } catch (error) {
        console.error('Payment check error:', error);
      }

      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return false;
  }
}
