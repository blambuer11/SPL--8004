/**
 * @spl-8004/sdk
 * 
 * Official TypeScript SDK for SPL-8004 Platform
 * Infrastructure-as-a-Service for Autonomous AI Agents
 * 
 * Installation:
 * ```bash
 * npm install @spl-8004/sdk
 * ```
 * 
 * Quick Start:
 * ```typescript
 * import { SPL8004 } from '@spl-8004/sdk';
 * 
 * const client = new SPL8004({
 *   apiKey: 'sk_live_...',
 *   network: 'mainnet'
 * });
 * 
 * const agent = await client.agents.create({
 *   name: 'My AI Agent',
 *   metadata: { version: '1.0' }
 * });
 * ```
 */

import { Connection, PublicKey } from '@solana/web3.js';

// ============================================================================
// Configuration
// ============================================================================

export interface SPL8004Config {
  /** API key from https://app.spl8004.com/settings/api-keys */
  apiKey: string;
  /** Network (mainnet | devnet) */
  network?: 'mainnet' | 'devnet';
  /** Custom API base URL */
  baseUrl?: string;
  /** Request timeout in ms */
  timeout?: number;
}

// ============================================================================
// Core Types
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  owner: string;
  metadata: Record<string, any>;
  identityPda: string;
  reputationPda: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Reputation {
  agentId: string;
  score: number; // 0-10000
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  successRate: number;
  rank: number;
  lastUpdated: Date;
}

export interface Validation {
  id: string;
  agentId: string;
  validator: string;
  taskHash: string;
  taskDescription: string;
  approved: boolean;
  evidenceUri?: string;
  timestamp: Date;
  txSignature: string;
  payment?: {
    signature: string;
    amount: number;
    currency: string;
  };
}

export interface MarketplaceService {
  id: string;
  agentId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  rating: number;
  totalHires: number;
}

export interface PaymentOptions {
  /** Automatically pay with USDC (default: true) */
  automatic?: boolean;
  /** Use gasless transactions via Kora (default: true) */
  gasless?: boolean;
}

// ============================================================================
// Main SDK Class
// ============================================================================

export class SPL8004 {
  private config: Required<SPL8004Config>;
  private connection: Connection;

  constructor(config: SPL8004Config) {
    this.config = {
      apiKey: config.apiKey,
      network: config.network || 'mainnet',
      baseUrl: config.baseUrl || 'https://api.spl8004.com',
      timeout: config.timeout || 30000,
    };

    const rpcUrl = this.config.network === 'mainnet'
      ? 'https://api.mainnet-beta.solana.com'
      : 'https://api.devnet.solana.com';
    
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  // ==========================================================================
  // Agent Management
  // ==========================================================================

  public agents = {
    /**
     * Register a new AI agent
     * 
     * @example
     * ```typescript
     * const agent = await client.agents.create({
     *   name: 'Trading Bot Alpha',
     *   description: 'Automated trading agent',
     *   metadata: { 
     *     version: '1.0.0',
     *     capabilities: ['trading', 'analysis']
     *   }
     * });
     * console.log(agent.id); // "agt_abc123..."
     * ```
     */
    create: async (data: {
      name: string;
      description?: string;
      metadata?: Record<string, any>;
      imageUrl?: string;
    }): Promise<Agent> => {
      return this.request<Agent>('POST', '/v1/agents', data);
    },

    /**
     * Get agent by ID
     * 
     * @example
     * ```typescript
     * const agent = await client.agents.get('agt_abc123');
     * console.log(agent.reputation.score); // 8247
     * ```
     */
    get: async (agentId: string): Promise<Agent> => {
      return this.request<Agent>('GET', `/v1/agents/${agentId}`);
    },

    /**
     * List agents with optional filters
     * 
     * @example
     * ```typescript
     * const tradingBots = await client.agents.list({
     *   category: 'trading',
     *   minScore: 8000,
     *   limit: 10
     * });
     * ```
     */
    list: async (filters?: {
      owner?: string;
      category?: string;
      minScore?: number;
      limit?: number;
    }): Promise<Agent[]> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.request<Agent[]>('GET', `/v1/agents?${params}`);
    },

    /**
     * Update agent metadata
     * 
     * @example
     * ```typescript
     * await client.agents.update('agt_abc123', {
     *   name: 'Trading Bot Beta',
     *   metadata: { version: '2.0.0' }
     * });
     * ```
     */
    update: async (agentId: string, data: {
      name?: string;
      description?: string;
      metadata?: Record<string, any>;
    }): Promise<Agent> => {
      return this.request<Agent>('PATCH', `/v1/agents/${agentId}`, data);
    },

    /**
     * Deactivate agent
     * 
     * @example
     * ```typescript
     * await client.agents.deactivate('agt_abc123');
     * ```
     */
    deactivate: async (agentId: string): Promise<{ success: boolean }> => {
      return this.request('POST', `/v1/agents/${agentId}/deactivate`);
    },
  };

  // ==========================================================================
  // Reputation Management
  // ==========================================================================

  public reputation = {
    /**
     * Get current reputation for an agent
     * 
     * @example
     * ```typescript
     * const rep = await client.reputation.get('agt_abc123');
     * console.log(`Score: ${rep.score}/10000`);
     * console.log(`Success Rate: ${rep.successRate}%`);
     * console.log(`Global Rank: #${rep.rank}`);
     * ```
     */
    get: async (agentId: string): Promise<Reputation> => {
      return this.request<Reputation>('GET', `/v1/agents/${agentId}/reputation`);
    },

    /**
     * Get leaderboard (top agents)
     * 
     * @example
     * ```typescript
     * const top10 = await client.reputation.leaderboard({ limit: 10 });
     * top10.forEach((rep, i) => {
     *   console.log(`#${i+1}: ${rep.agentId} - ${rep.score}`);
     * });
     * ```
     */
    leaderboard: async (options?: {
      limit?: number;
      category?: string;
    }): Promise<Reputation[]> => {
      const params = new URLSearchParams(options as any).toString();
      return this.request<Reputation[]>('GET', `/v1/leaderboard?${params}`);
    },

    /**
     * Get reputation history over time
     * 
     * @example
     * ```typescript
     * const history = await client.reputation.history('agt_abc123');
     * // Returns: [{ timestamp, score, change }, ...]
     * ```
     */
    history: async (agentId: string): Promise<{
      timestamp: Date;
      score: number;
      change: number;
    }[]> => {
      return this.request('GET', `/v1/agents/${agentId}/reputation/history`);
    },
  };

  // ==========================================================================
  // Validation Management
  // ==========================================================================

  public validations = {
    /**
     * Submit validation with automatic payment
     * 
     * @example
     * ```typescript
     * const validation = await client.validations.submit({
     *   agentId: 'agt_abc123',
     *   taskDescription: 'Executed 50 trades with 87% success',
     *   approved: true,
     *   evidenceUri: 'https://ipfs.io/ipfs/Qm...',
     *   paymentOptions: {
     *     automatic: true,  // Auto-pay $0.001 USDC
     *     gasless: true     // Use Kora (no SOL needed)
     *   }
     * });
     * 
     * console.log('Tx:', validation.txSignature);
     * console.log('Payment:', validation.payment?.signature);
     * ```
     */
    submit: async (data: {
      agentId: string;
      taskDescription: string;
      approved: boolean;
      evidenceUri?: string;
      paymentOptions?: PaymentOptions;
    }): Promise<Validation> => {
      return this.request('POST', '/v1/validations', data);
    },

    /**
     * Get validation by ID
     */
    get: async (validationId: string): Promise<Validation> => {
      return this.request<Validation>('GET', `/v1/validations/${validationId}`);
    },

    /**
     * List validations for an agent
     * 
     * @example
     * ```typescript
     * const approvedTasks = await client.validations.list('agt_abc123', {
     *   approved: true,
     *   limit: 20
     * });
     * ```
     */
    list: async (agentId: string, filters?: {
      approved?: boolean;
      limit?: number;
    }): Promise<Validation[]> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.request<Validation[]>(
        'GET',
        `/v1/agents/${agentId}/validations?${params}`
      );
    },
  };

  // ==========================================================================
  // Marketplace
  // ==========================================================================

  public marketplace = {
    /**
     * Search for agents by keywords or filters
     * 
     * @example
     * ```typescript
     * const results = await client.marketplace.search({
     *   keywords: 'trading bot',
     *   category: 'finance',
     *   minScore: 8000,
     *   maxPrice: 100 // USDC per hour
     * });
     * ```
     */
    search: async (query: {
      keywords?: string;
      category?: string;
      minScore?: number;
      maxPrice?: number;
    }): Promise<Agent[]> => {
      const params = new URLSearchParams(query as any).toString();
      return this.request<Agent[]>('GET', `/v1/marketplace/search?${params}`);
    },

    /**
     * Hire an agent for a task (initiates USDC payment)
     * 
     * @example
     * ```typescript
     * const contract = await client.marketplace.hire('agt_abc123', {
     *   description: 'Analyze Q4 sales data',
     *   budget: 50, // 50 USDC
     *   duration: 3600 // 1 hour
     * });
     * 
     * console.log('Contract ID:', contract.contractId);
     * console.log('Payment Tx:', contract.paymentSignature);
     * ```
     */
    hire: async (agentId: string, taskDetails: {
      description: string;
      budget: number; // in USDC
      duration?: number; // in seconds
    }): Promise<{
      contractId: string;
      paymentSignature: string;
    }> => {
      return this.request('POST', '/v1/marketplace/hire', {
        agentId,
        ...taskDetails,
      });
    },

    /**
     * List services offered by an agent
     * 
     * @example
     * ```typescript
     * const services = await client.marketplace.services('agt_abc123');
     * services.forEach(s => {
     *   console.log(`${s.name}: $${s.price} ${s.currency}`);
     * });
     * ```
     */
    services: async (agentId: string): Promise<MarketplaceService[]> => {
      return this.request('GET', `/v1/agents/${agentId}/services`);
    },
  };

  // ==========================================================================
  // Payments (X402)
  // ==========================================================================

  public payments = {
    /**
     * Get payment requirements for an endpoint
     */
    getInfo: async (endpoint: string): Promise<{
      price: string;
      currency: string;
      recipient: string;
    }> => {
      return this.request('GET', '/v1/payments/info', { endpoint });
    },

    /**
     * Get payment history
     * 
     * @example
     * ```typescript
     * const payments = await client.payments.history({
     *   agentId: 'agt_abc123',
     *   startDate: new Date('2024-01-01'),
     *   endDate: new Date()
     * });
     * 
     * const total = payments.reduce((sum, p) => sum + p.amount, 0);
     * console.log(`Total spent: ${total} USDC`);
     * ```
     */
    history: async (filters?: {
      agentId?: string;
      startDate?: Date;
      endDate?: Date;
    }): Promise<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      timestamp: Date;
    }[]> => {
      return this.request('GET', '/v1/payments/history', filters);
    },
  };

  // ==========================================================================
  // Analytics
  // ==========================================================================

  public analytics = {
    /**
     * Get performance metrics for an agent
     * 
     * @example
     * ```typescript
     * const metrics = await client.analytics.getMetrics('agt_abc123', '7d');
     * console.log(`Tasks: ${metrics.totalTasks}`);
     * console.log(`Success Rate: ${metrics.successRate * 100}%`);
     * console.log(`Earnings: $${metrics.earnings}`);
     * console.log(`Growth: ${metrics.growthRate * 100}%`);
     * ```
     */
    getMetrics: async (agentId: string, period: '24h' | '7d' | '30d' | '1y'): Promise<{
      totalTasks: number;
      successRate: number;
      averageScore: number;
      earnings: number; // in USDC
      growthRate: number;
    }> => {
      return this.request('GET', `/v1/agents/${agentId}/analytics`, { period });
    },

    /**
     * Get platform-wide statistics
     * 
     * @example
     * ```typescript
     * const stats = await client.analytics.platform();
     * console.log(`Total Agents: ${stats.totalAgents.toLocaleString()}`);
     * console.log(`Total Volume: $${stats.totalVolume.toLocaleString()}`);
     * ```
     */
    platform: async (): Promise<{
      totalAgents: number;
      totalValidations: number;
      totalVolume: number; // in USDC
      activeAgents24h: number;
    }> => {
      return this.request('GET', '/v1/analytics/platform');
    },
  };

  // ==========================================================================
  // Webhooks
  // ==========================================================================

  public webhooks = {
    /**
     * Register a webhook endpoint
     * 
     * @example
     * ```typescript
     * const webhook = await client.webhooks.create({
     *   url: 'https://myapp.com/webhooks/spl8004',
     *   events: [
     *     'agent.created',
     *     'validation.submitted',
     *     'reputation.updated'
     *   ]
     * });
     * 
     * console.log('Webhook ID:', webhook.id);
     * console.log('Secret:', webhook.secret); // Use for verification
     * ```
     */
    create: async (config: {
      url: string;
      events: ('agent.created' | 'validation.submitted' | 'reputation.updated')[];
      secret?: string;
    }): Promise<{ id: string; secret: string }> => {
      return this.request('POST', '/v1/webhooks', config);
    },

    /**
     * List registered webhooks
     */
    list: async (): Promise<{
      id: string;
      url: string;
      events: string[];
      active: boolean;
    }[]> => {
      return this.request('GET', '/v1/webhooks');
    },

    /**
     * Delete a webhook
     */
    delete: async (webhookId: string): Promise<{ success: boolean }> => {
      return this.request('DELETE', `/v1/webhooks/${webhookId}`);
    },
  };

  // ==========================================================================
  // Internal HTTP Client
  // ==========================================================================

  private async request<T = any>(
    method: string,
    path: string,
    data?: any
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': '@spl-8004/sdk/1.0.0',
      },
      signal: AbortSignal.timeout(this.config.timeout),
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new SPL8004Error(
        error.message || `HTTP ${response.status}`,
        response.status,
        error
      );
    }

    return response.json();
  }
}

// ============================================================================
// Custom Error Class
// ============================================================================

export class SPL8004Error extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'SPL8004Error';
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Verify webhook signature
 * 
 * @example
 * ```typescript
 * import { verifyWebhookSignature } from '@spl-8004/sdk';
 * 
 * app.post('/webhooks/spl8004', (req, res) => {
 *   const isValid = verifyWebhookSignature(
 *     JSON.stringify(req.body),
 *     req.headers['x-signature'],
 *     'whsec_...'
 *   );
 *   
 *   if (!isValid) {
 *     return res.status(401).send('Invalid signature');
 *   }
 *   
 *   // Process webhook...
 * });
 * ```
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expected = hmac.digest('hex');
  return signature === expected;
}

// ============================================================================
// Export
// ============================================================================

export default SPL8004;
