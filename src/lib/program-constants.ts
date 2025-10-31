// SPL-8004 Program Constants
export const PROGRAM_CONSTANTS = {
  // Fees (in lamports)
  REGISTRATION_FEE: 5_000_000, // 0.005 SOL
  VALIDATION_FEE: 1_000_000, // 0.001 SOL
  
  // Reputation
  INITIAL_REPUTATION_SCORE: 5000,
  MAX_REPUTATION_SCORE: 10000,
  MIN_REPUTATION_SCORE: 0,
  
  // Commission
  DEFAULT_COMMISSION_RATE: 300, // 3%
  MAX_COMMISSION_RATE: 1000, // 10%
  
  // Timing
  REWARD_CLAIM_INTERVAL: 86400, // 24 hours in seconds
  
  // Limits
  MAX_AGENT_ID_LEN: 64,
  MAX_METADATA_URI_LEN: 200,
  MAX_EVIDENCE_URI_LEN: 200,
} as const;

// Score calculation helpers
export function calculateSuccessRate(successful: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((successful / total) * 100);
}

export function getScoreChangeRange(successRate: number, approved: boolean): { min: number; max: number } {
  if (approved) {
    if (successRate >= 90) return { min: 100, max: 100 };
    if (successRate >= 80) return { min: 75, max: 75 };
    if (successRate >= 70) return { min: 50, max: 50 };
    return { min: 25, max: 25 };
  } else {
    if (successRate <= 50) return { min: -150, max: -150 };
    if (successRate <= 70) return { min: -100, max: -100 };
    return { min: -50, max: -50 };
  }
}

export function calculateRewardMultiplier(score: number): number {
  if (score >= 9000) return 5;
  if (score >= 8000) return 4;
  if (score >= 7000) return 3;
  if (score >= 6000) return 2;
  return 1;
}

export function formatSOL(lamports: number): string {
  return (lamports / 1e9).toFixed(4);
}
