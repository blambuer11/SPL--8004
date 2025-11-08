/**
 * SPL-X Protocols Program IDs (Devnet)
 * Deployed: 5 Kasım 2025
 */


import { PublicKey } from '@solana/web3.js';

// DEVNET PROGRAM IDS
export const SPL_8004_PROGRAM_ID_DEVNET = new PublicKey('G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW');
export const SPL_ACP_PROGRAM_ID_DEVNET = new PublicKey('FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK');
export const SPL_TAP_PROGRAM_ID_DEVNET = new PublicKey('DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4');
export const SPL_FCP_PROGRAM_ID_DEVNET = new PublicKey('A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR');

// LOCALHOST PROGRAM IDS
export const SPL_8004_PROGRAM_ID_LOCAL = new PublicKey('Bb95aVcDasGfZ5HWE2aickWD86aCiUncZVKEJoBRZraG');
export const SPL_ACP_PROGRAM_ID_LOCAL = new PublicKey('52Ln3ibGw3saQ6QiERyW55dmo4SqmGX5CFSWBHqMjuMZ');
export const SPL_TAP_PROGRAM_ID_LOCAL = new PublicKey('4PXmkfGMdsKvjTmAwnTmyhxzNXCyHDXXLFcFZQjxobuT');
export const SPL_FCP_PROGRAM_ID_LOCAL = new PublicKey('66rnQD9SGyEruS7pUemPBaakKZFGFWmQwrDU46dq5ACi');

// Otomatik seçim fonksiyonu
export function getSplProgramIds(network: 'devnet' | 'localhost') {
  if (network === 'localhost') {
    return {
      SPL_8004_PROGRAM_ID: SPL_8004_PROGRAM_ID_LOCAL,
      SPL_ACP_PROGRAM_ID: SPL_ACP_PROGRAM_ID_LOCAL,
      SPL_TAP_PROGRAM_ID: SPL_TAP_PROGRAM_ID_LOCAL,
      SPL_FCP_PROGRAM_ID: SPL_FCP_PROGRAM_ID_LOCAL,
    };
  }
  return {
    SPL_8004_PROGRAM_ID: SPL_8004_PROGRAM_ID_DEVNET,
    SPL_ACP_PROGRAM_ID: SPL_ACP_PROGRAM_ID_DEVNET,
    SPL_TAP_PROGRAM_ID: SPL_TAP_PROGRAM_ID_DEVNET,
    SPL_FCP_PROGRAM_ID: SPL_FCP_PROGRAM_ID_DEVNET,
  };
}

// Program metadata

export function getProgramMetadata(network: 'devnet' | 'localhost') {
  const ids = getSplProgramIds(network);
  return {
    'spl-acp': {
      id: ids.SPL_ACP_PROGRAM_ID,
      name: 'Agent Communication Protocol',
      description: 'Capability declaration and registry',
      version: '0.1.0',
    },
    'spl-tap': {
      id: ids.SPL_TAP_PROGRAM_ID,
      name: 'Tool Attestation Protocol',
      description: 'Attestation issuance and verification',
      version: '0.1.0',
    },
    'spl-fcp': {
      id: ids.SPL_FCP_PROGRAM_ID,
      name: 'Function Call Protocol',
      description: 'Multi-validator consensus validation',
      version: '0.1.0',
    },
  } as const;
}

export function getExplorerUrls(network: 'devnet' | 'localhost') {
  const ids = getSplProgramIds(network);
  const cluster = network === 'localhost' ? 'custom&customUrl=http://localhost:8899' : 'devnet';
  return {
    'spl-acp': `https://explorer.solana.com/address/${ids.SPL_ACP_PROGRAM_ID.toBase58()}?cluster=${cluster}`,
    'spl-tap': `https://explorer.solana.com/address/${ids.SPL_TAP_PROGRAM_ID.toBase58()}?cluster=${cluster}`,
    'spl-fcp': `https://explorer.solana.com/address/${ids.SPL_FCP_PROGRAM_ID.toBase58()}?cluster=${cluster}`,
  } as const;
}
