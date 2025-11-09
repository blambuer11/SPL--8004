import fetch from 'node-fetch';

export interface KoraConfig {
  url: string;
  apiKey: string;
}

export class KoraClient {
  constructor(private cfg: KoraConfig) {}

  async getPayerSigner(): Promise<{ address: string }> {
    const r = await fetch(`${this.cfg.url}/getPayerSigner`, {
      headers: { 'x-api-key': this.cfg.apiKey },
    });
    if (!r.ok) throw new Error(`Kora getPayerSigner failed: ${r.status}`);
    return r.json();
  }

  async signTransaction(serializedTx: string): Promise<{ isValid: boolean }>{
    const r = await fetch(`${this.cfg.url}/signTransaction`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': this.cfg.apiKey },
      body: JSON.stringify({ transaction: serializedTx }),
    });
    if (!r.ok) throw new Error(`Kora signTransaction failed: ${r.status}`);
    return r.json();
  }

  async signAndSendTransaction(serializedTx: string): Promise<{ signature: string }>{
    const r = await fetch(`${this.cfg.url}/signAndSendTransaction`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': this.cfg.apiKey },
      body: JSON.stringify({ transaction: serializedTx }),
    });
    if (!r.ok) throw new Error(`Kora signAndSendTransaction failed: ${r.status}`);
    return r.json();
  }
}
