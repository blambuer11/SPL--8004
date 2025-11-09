/**
 * Noema Protocol SDK - The Stripe of AI Agent Identity
 *
 * Trust Infrastructure for Autonomous AI:
 * - On-chain agent identity and reputation
 * - Autonomous payments with X402 protocol
 * - Gasless transactions
 * - Usage-based pricing with API keys
 *
 * Get your API key: https://noemaprotocol.xyz/dashboard
 */
import { PublicKey } from '@solana/web3.js';
export interface AgentConfig {
    agentId: string;
    privateKey: string;
    apiKey: string;
    network?: 'devnet' | 'mainnet-beta';
    rpcUrl?: string;
    apiUrl?: string;
}
export interface PaymentOptions {
    targetEndpoint: string;
    priceUsd: number;
    metadata?: Record<string, any>;
}
export interface AgentIdentity {
    agentId: string;
    publicKey: string;
    identityPda: string;
    totalPayments: number;
    totalSpent: number;
    reputation: number;
    createdAt: number;
}
export interface PaymentResult {
    success: boolean;
    signature: string;
    explorerUrl: string;
    amount: number;
    agentId: string;
}
export interface UsageStats {
    requestsToday: number;
    requestsThisMonth: number;
    totalRequests: number;
    tier: 'free' | 'pro' | 'enterprise';
    limits: {
        dailyRequests: number;
        monthlyRequests: number;
    };
    rateLimitRemaining: number;
    rateLimitReset: number;
}
/**
 * Noema Protocol Agent Client
 * Main SDK class for agent operations with API key authentication
 */
export declare class AgentClient {
    private agentId;
    private apiKey;
    private keypair;
    private connection;
    private apiUrl;
    private network;
    constructor(config: AgentConfig);
    /**
     * Get authenticated headers for API requests
     */
    private getHeaders;
    /**
     * Get agent's public key
     */
    getPublicKey(): PublicKey;
    /**
     * Get agent's SOL balance
     */
    getBalance(): Promise<number>;
    /**
     * Get agent's USDC balance
     */
    getUsdcBalance(usdcMint: PublicKey): Promise<number>;
    /**
     * Get agent identity information
     */
    getIdentity(): Promise<AgentIdentity>;
    /**
     * Get current usage statistics and rate limits
     */
    getUsageStats(): Promise<UsageStats>;
    /**
     * Make autonomous payment to access protected endpoint
     */
    makePayment(options: PaymentOptions): Promise<PaymentResult>;
    /**
     * Access protected endpoint with automatic payment
     */
    accessProtectedEndpoint<T = unknown>(endpoint: string, options?: {
        method?: 'GET' | 'POST';
        body?: unknown;
        headers?: Record<string, string>;
        autoRetry?: boolean;
    }): Promise<T>;
    /**
     * Create agent identity on-chain
     */
    createIdentity(metadata?: string): Promise<AgentIdentity>;
}
/**
 * Create agent client with simple configuration
 */
export declare function createAgent(config: AgentConfig): AgentClient;
/**
 * Generate new agent keypair
 */
export declare function generateAgentKeypair(): {
    publicKey: string;
    privateKey: string;
};
export * from './types.js';
declare const _default: {
    AgentClient: typeof AgentClient;
    createAgent: typeof createAgent;
    generateAgentKeypair: typeof generateAgentKeypair;
};
export default _default;
//# sourceMappingURL=index.d.ts.map