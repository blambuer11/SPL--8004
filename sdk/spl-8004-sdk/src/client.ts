import { SPL8004SDK } from './sdk';
import type { NetworkType } from './types';

/**
 * Managed client with API key authentication
 */
export class NoemaClient extends SPL8004SDK {
  apiKey?: string;

  constructor(config: any) {
    super(config);
    this.apiKey = config.apiKey;
  }

  /**
   * Create managed client with API key
   */
  static createManaged(apiKey: string, network: NetworkType = 'mainnet-beta'): NoemaClient {
    const sdk = SPL8004SDK.create(undefined as any, network);
    return new NoemaClient({
      ...sdk,
      apiKey
    });
  }
}
