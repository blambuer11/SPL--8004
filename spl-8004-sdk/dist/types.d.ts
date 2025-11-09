export interface AgentConfig {
    agentId: string;
    privateKey: string;
    network?: 'devnet' | 'mainnet-beta';
    rpcUrl?: string;
    validatorApiUrl?: string;
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
export interface ProtectedEndpointOptions {
    method?: 'GET' | 'POST';
    body?: any;
    headers?: Record<string, string>;
    autoRetry?: boolean;
}
//# sourceMappingURL=types.d.ts.map