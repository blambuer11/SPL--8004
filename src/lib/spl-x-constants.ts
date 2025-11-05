/**
 * SPL-X Protocols Program IDs (Devnet)
 * Deployed: 5 Kasım 2025
 */

import { PublicKey } from '@solana/web3.js';

// SPL-ACP: Agent Communication Protocol
// Capability declaration and registry system
export const SPL_ACP_PROGRAM_ID = new PublicKey(
  'FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK'
);

// SPL-TAP: Tool Attestation Protocol
// Attestation issuance and verification
export const SPL_TAP_PROGRAM_ID = new PublicKey(
  'DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4'
);

// SPL-FCP: Function Call Protocol
// Multi-validator consensus validation
export const SPL_FCP_PROGRAM_ID = new PublicKey(
  'A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR'
);

// Program metadata
export const PROGRAM_METADATA = {
  'spl-acp': {
    id: SPL_ACP_PROGRAM_ID,
    name: 'Agent Communication Protocol',
    description: 'Capability declaration and registry',
    version: '0.1.0',
  },
  'spl-tap': {
    id: SPL_TAP_PROGRAM_ID,
    name: 'Tool Attestation Protocol',
    description: 'Attestation issuance and verification',
    version: '0.1.0',
  },
  'spl-fcp': {
    id: SPL_FCP_PROGRAM_ID,
    name: 'Function Call Protocol',
    description: 'Multi-validator consensus validation',
    version: '0.1.0',
  },
} as const;

// Solana Explorer URLs (Devnet)
export const EXPLORER_URLS = {
  'spl-acp': `https://explorer.solana.com/address/${SPL_ACP_PROGRAM_ID.toBase58()}?cluster=devnet`,
  'spl-tap': `https://explorer.solana.com/address/${SPL_TAP_PROGRAM_ID.toBase58()}?cluster=devnet`,
  'spl-fcp': `https://explorer.solana.com/address/${SPL_FCP_PROGRAM_ID.toBase58()}?cluster=devnet`,
} as const;
