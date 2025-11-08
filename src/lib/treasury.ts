import { PublicKey } from '@solana/web3.js';

/**
 * NOEMA PROTOCOL TREASURY
 * Tüm platform gelirleri bu cüzdana gider:
 * - API subscription payments (Pricing page)
 * - Stake fees (SPL-TAP & SPL-FCP)
 * - Protocol usage fees
 * - X402 payment facilitator fees
 * - Sponsor contributions
 */
export const TREASURY_WALLET = new PublicKey('3oxg7wVtdp9T3sx773SMmws8zrGyAJecqTruaXfiw3mN');

/**
 * FEE STRUCTURE
 */
export const FEES = {
  // API Pricing (monthly subscription fees)
  API_PRICING: {
    FREE: 0,           // Free tier - no payment
    PRO: 0.1,          // 0.1 SOL/month
    ENTERPRISE: 1.0    // 1 SOL/month
  },
  
  // Stake amounts (locked in program PDAs, but initial deposit to treasury)
  STAKE_AMOUNTS: {
    SPL_TAP: 1,        // 1 SOL stake for Tool Attestation Protocol
    SPL_FCP: 2         // 2 SOL stake for Function Call Protocol
  },
  
  // Protocol usage fees (per transaction)
  PROTOCOL_FEES: {
    ACP_MESSAGE: 0.01,     // Agent Communication Protocol - 0.01 SOL per message
    TAP_ATTESTATION: 0.02, // Tool Attestation - 0.02 SOL per attestation
    FCP_CONSENSUS: 0.05,   // Function Call Consensus - 0.05 SOL per consensus
    X402_FACILITATOR: 0.001 // X402 Payment facilitator fee - 0.001 SOL per transaction
  },
  
  // Sponsor contribution (optional donations)
  SPONSOR_CONTRIBUTION: {
    SUGGESTED: 0.5,    // Suggested 0.5 SOL sponsor contribution
    MINIMUM: 0.1       // Minimum 0.1 SOL
  }
};

/**
 * GELIR AKIŞLARI (Revenue Streams)
 * 
 * 1. API SUBSCRIPTION PAYMENTS (Pricing page)
 *    - Free tier: $0
 *    - Pro tier: 0.1 SOL/month → TREASURY
 *    - Enterprise tier: 1 SOL/month → TREASURY
 * 
 * 2. STAKE DEPOSITS (Stake page)
 *    - SPL-TAP: 1 SOL → Program PDA (contract'ta tutuluyor)
 *    - SPL-FCP: 2 SOL → Program PDA (contract'ta tutuluyor)
 *    NOT: Stake'ler contract'ta locked, ama slashing durumunda TREASURY'ye gider
 * 
 * 3. PROTOCOL USAGE FEES
 *    - Her ACP mesajı: 0.01 SOL → TREASURY
 *    - Her TAP attestation: 0.02 SOL → TREASURY
 *    - Her FCP consensus: 0.05 SOL → TREASURY
 * 
 * 4. X402 FACILITATOR FEES
 *    - Her payment transaction: 0.001 SOL → TREASURY
 *    - Gasless payment facilitator commission
 * 
 * 5. SPONSOR CONTRIBUTIONS (İsteğe bağlı bağış)
 *    - Phantom, Visa, Solana, Coinbase, OpenAI, Anthropic sponsorları
 *    - Önerilen: 0.5 SOL → TREASURY
 *    - Minimum: 0.1 SOL → TREASURY
 * 
 * ÖZET:
 * - Tüm ödemeler TREASURY_WALLET'a gider
 * - Stake SOL'ları contract PDA'larında locked (slashing için güvence)
 * - Unstake sonrası SOL'lar kullanıcıya geri döner (7 gün unbonding)
 * - Platform gelirleri: subscriptions + fees + sponsor contributions
 */

/**
 * Revenue tracking helper
 */
export interface RevenueSource {
  type: 'subscription' | 'stake' | 'protocol_fee' | 'x402_fee' | 'sponsor' | 'slashing';
  amount: number; // in SOL
  from: PublicKey;
  timestamp: number;
  description: string;
}

export function logRevenue(source: RevenueSource) {
  console.log(`
🏦 TREASURY REVENUE
Type: ${source.type}
Amount: ${source.amount} SOL
From: ${source.from.toString()}
To: ${TREASURY_WALLET.toString()}
Time: ${new Date(source.timestamp).toLocaleString()}
Description: ${source.description}
  `);
}

/**
 * Sponsor contribution tracking
 * Sponsor'lar platformu desteklemek için SOL gönderebilir
 */
export const SPONSORS = {
  PHANTOM: 'Phantom Wallet - USDC payment integration sponsor',
  VISA: 'Visa TAP - Enterprise attestation sponsor',
  SOLANA: 'Solana Foundation - Multi-protocol integration sponsor',
  COINBASE: 'Coinbase CDP - Embedded wallets sponsor',
  OPENAI: 'OpenAI - AgentPay LLM credits sponsor',
  ANTHROPIC: 'Anthropic - X402 + MCP integration sponsor'
};

export function getSponsorMessage(sponsor: keyof typeof SPONSORS): string {
  return `Thank you for sponsoring Noema Protocol! Your contribution supports: ${SPONSORS[sponsor]}`;
}
