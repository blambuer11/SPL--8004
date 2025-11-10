/**
 * Payment QR Code Generator
 * 
 * Generates Phantom wallet compatible QR codes for mobile payments.
 * Supports both Solana Pay and custom payment requests.
 * 
 * Features:
 * - Solana Pay standard compliance
 * - USDC and SOL support
 * - Amount encoding
 * - Metadata/memo support
 */

import { PublicKey } from '@solana/web3.js';
import { encodeURL, createQR } from '@solana/pay';

export interface PaymentQRConfig {
  recipient: PublicKey;
  amount: number;
  token?: 'SOL' | 'USDC';
  memo?: string;
  label?: string;
  message?: string;
}

export interface QRCodeData {
  url: string;
  qrCodeDataURL: string;
  config: PaymentQRConfig;
}

export class PaymentQRGenerator {
  private USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Mainnet USDC
  private USDC_DEVNET = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // Devnet USDC

  /**
   * Generate Solana Pay compatible QR code
   */
  async generatePaymentQR(config: PaymentQRConfig): Promise<QRCodeData> {
    const {
      recipient,
      amount,
      token = 'SOL',
      memo,
      label,
      message
    } = config;

    // Create Solana Pay URL
    let url: string;

    if (token === 'SOL') {
      // SOL payment
      url = this.createSolanaPayURL({
        recipient: recipient.toString(),
        amount,
        memo,
        label,
        message
      });
    } else {
      // SPL Token payment (USDC)
      url = this.createTokenPaymentURL({
        recipient: recipient.toString(),
        amount,
        splToken: this.USDC_DEVNET.toString(), // Use devnet for now
        memo,
        label,
        message
      });
    }

    // Generate QR code as data URL
    const qrCodeDataURL = await this.urlToQRDataURL(url);

    return {
      url,
      qrCodeDataURL,
      config
    };
  }

  /**
   * Generate X402 payment request QR code
   */
  async generateX402QR(
    recipient: PublicKey,
    endpointUrl: string,
    priceUsd: number
  ): Promise<QRCodeData> {
    // X402 payment request format
    const x402Data = {
      protocol: 'x402',
      endpoint: endpointUrl,
      recipient: recipient.toString(),
      price: priceUsd.toString(),
      network: 'devnet'
    };

    const url = `noema://pay?${new URLSearchParams(x402Data).toString()}`;
    const qrCodeDataURL = await this.urlToQRDataURL(url);

    return {
      url,
      qrCodeDataURL,
      config: {
        recipient,
        amount: priceUsd,
        memo: `X402 payment for ${endpointUrl}`
      }
    };
  }

  /**
   * Generate multi-token payment QR (supports SOL and USDC)
   */
  async generateMultiTokenQR(
    recipient: PublicKey,
    solAmount?: number,
    usdcAmount?: number,
    memo?: string
  ): Promise<QRCodeData[]> {
    const qrCodes: QRCodeData[] = [];

    if (solAmount && solAmount > 0) {
      const solQR = await this.generatePaymentQR({
        recipient,
        amount: solAmount,
        token: 'SOL',
        memo,
        label: 'SOL Payment'
      });
      qrCodes.push(solQR);
    }

    if (usdcAmount && usdcAmount > 0) {
      const usdcQR = await this.generatePaymentQR({
        recipient,
        amount: usdcAmount,
        token: 'USDC',
        memo,
        label: 'USDC Payment'
      });
      qrCodes.push(usdcQR);
    }

    return qrCodes;
  }

  /**
   * Create Solana Pay URL for SOL payments
   */
  private createSolanaPayURL(params: {
    recipient: string;
    amount: number;
    memo?: string;
    label?: string;
    message?: string;
  }): string {
    const { recipient, amount, memo, label, message } = params;
    
    const searchParams = new URLSearchParams();
    searchParams.append('recipient', recipient);
    searchParams.append('amount', amount.toString());
    
    if (memo) searchParams.append('memo', memo);
    if (label) searchParams.append('label', label);
    if (message) searchParams.append('message', message);

    return `solana:${recipient}?${searchParams.toString()}`;
  }

  /**
   * Create Solana Pay URL for SPL token payments
   */
  private createTokenPaymentURL(params: {
    recipient: string;
    amount: number;
    splToken: string;
    memo?: string;
    label?: string;
    message?: string;
  }): string {
    const { recipient, amount, splToken, memo, label, message } = params;
    
    const searchParams = new URLSearchParams();
    searchParams.append('recipient', recipient);
    searchParams.append('amount', amount.toString());
    searchParams.append('spl-token', splToken);
    
    if (memo) searchParams.append('memo', memo);
    if (label) searchParams.append('label', label);
    if (message) searchParams.append('message', message);

    return `solana:${recipient}?${searchParams.toString()}`;
  }

  /**
   * Convert URL to QR code data URL
   */
  private async urlToQRDataURL(url: string): Promise<string> {
    // Using QRCode library to generate data URL
    // In browser environment, this would use canvas
    // For now, return the URL itself (will be rendered by react-qr-code component)
    return url;
  }

  /**
   * Validate Solana Pay URL
   */
  validateSolanaPayURL(url: string): boolean {
    try {
      // Must start with solana: or https://
      if (!url.startsWith('solana:') && !url.startsWith('https://')) {
        return false;
      }

      // Extract recipient
      const recipientMatch = url.match(/solana:([a-zA-Z0-9]+)/);
      if (!recipientMatch) return false;

      // Try to parse as PublicKey
      new PublicKey(recipientMatch[1]);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse Solana Pay URL to extract payment data
   */
  parseSolanaPayURL(url: string): {
    recipient: string;
    amount?: number;
    token?: string;
    memo?: string;
    label?: string;
  } | null {
    try {
      const urlObj = new URL(url.replace('solana:', 'https://'));
      const recipient = urlObj.hostname || urlObj.pathname.split('?')[0];
      
      const params = new URLSearchParams(urlObj.search);

      return {
        recipient,
        amount: params.get('amount') ? parseFloat(params.get('amount')!) : undefined,
        token: params.get('spl-token') || 'SOL',
        memo: params.get('memo') || undefined,
        label: params.get('label') || undefined
      };
    } catch (error) {
      console.error('Failed to parse Solana Pay URL:', error);
      return null;
    }
  }
}

// Export singleton instance
let qrGeneratorInstance: PaymentQRGenerator | null = null;

export function getPaymentQRGenerator(): PaymentQRGenerator {
  if (!qrGeneratorInstance) {
    qrGeneratorInstance = new PaymentQRGenerator();
  }
  return qrGeneratorInstance;
}

export const paymentQRGenerator = {
  getInstance: getPaymentQRGenerator
};
