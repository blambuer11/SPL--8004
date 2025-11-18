import 'dotenv/config';

/**
 * Kora RPC Client
 * Handles gasless transaction signing via Kora RPC endpoint
 * 
 * Production Kora API Documentation:
 * - POST /v1/transactions/sign - Sign transaction without broadcasting
 * - POST /v1/transactions/send - Sign and broadcast transaction
 * - GET /v1/payer/address - Get fee payer address
 */

interface KoraSignTransactionResponse {
  signedTransaction: string; // Base64 serialized signed transaction
}

interface KoraSendTransactionResponse {
  signature: string;
  explorerUrl?: string;
}

interface KoraPayerSignerResponse {
  address: string;
}

export class KoraClient {
  private rpcUrl: string;
  private apiKey: string;
  private mockMode: boolean;

  constructor(rpcUrl: string, apiKey: string, mockMode = false) {
    this.rpcUrl = rpcUrl;
    this.apiKey = apiKey;
    this.mockMode = mockMode;
  }

  /**
   * Sign transaction without broadcasting (for verification)
   * Production endpoint: POST /v1/transactions/sign
   */
  async signTransaction(transaction: string): Promise<string> {
    if (this.mockMode) {
      console.log('🧪 [MOCK] signTransaction called');
      return transaction; // Return unsigned in mock mode
    }

    // Try production endpoint first, fallback to mock endpoint
    const endpoint = this.rpcUrl.includes('kora.') 
      ? `${this.rpcUrl}/v1/transactions/sign`
      : `${this.rpcUrl}/signTransaction`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-API-Key': this.apiKey, // Backward compatibility
      },
      body: JSON.stringify({ transaction }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Kora signTransaction failed: ${response.statusText} - ${error}`);
    }

    const data = (await response.json()) as unknown as KoraSignTransactionResponse;
    return data.signedTransaction;
  }

  /**
   * Sign and send transaction (for settlement)
   * Production endpoint: POST /v1/transactions/send
   */
  async signAndSendTransaction(transaction: string): Promise<string> {
    if (this.mockMode) {
      console.log('🧪 [MOCK] signAndSendTransaction called');
      const mockSignature = `MOCK_SIG_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return mockSignature;
    }

    // Try production endpoint first, fallback to mock endpoint
    const endpoint = this.rpcUrl.includes('kora.') 
      ? `${this.rpcUrl}/v1/transactions/send`
      : `${this.rpcUrl}/signAndSendTransaction`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-API-Key': this.apiKey, // Backward compatibility
      },
      body: JSON.stringify({ transaction }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Kora signAndSendTransaction failed: ${response.statusText} - ${error}`);
    }

    const data = (await response.json()) as unknown as KoraSendTransactionResponse;
    return data.signature;
  }

  /**
   * Get Kora's payer signer address
   * Production endpoint: GET /v1/payer/address
   */
  async getPayerSigner(): Promise<string> {
    if (this.mockMode) {
      console.log('🧪 [MOCK] getPayerSigner called');
      return process.env.KORA_SIGNER_ADDRESS || 'MockPayerAddress11111111111111111111111111';
    }

    // Try production endpoint first, fallback to mock endpoint
    const endpoint = this.rpcUrl.includes('kora.') 
      ? `${this.rpcUrl}/v1/payer/address`
      : `${this.rpcUrl}/getPayerSigner`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-API-Key': this.apiKey, // Backward compatibility
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Kora getPayerSigner failed: ${response.statusText} - ${error}`);
    }

    const data = (await response.json()) as unknown as KoraPayerSignerResponse;
    return data.address;
  }
}
