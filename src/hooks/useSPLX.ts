/**
 * Unified React Hook for all SPL-X Protocol Layers
 * Provides access to all 5 infrastructure layers
 */

import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SPL8004Client } from '../lib/spl8004-client';
import { SPLTAPClient } from '../lib/spl-tap-client';
import { SPLFCPClient } from '../lib/spl-fcp-client';
import { SPLACPClient } from '../lib/spl-acp-client';
import { useNetwork } from '../components/NetworkProvider';
import { getSplProgramIds } from '../lib/spl-x-constants';
import type { AnchorWallet } from '@solana/wallet-adapter-react';

export function useSPLX() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { network } = useNetwork();
  const programIds = getSplProgramIds(network === 'devnet' ? 'devnet' : 'localhost');

  // Layer 1: Identity & Reputation (SPL-8004)
  const identityClient = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }
    return new SPL8004Client(connection, wallet as AnchorWallet, programIds.SPL_8004_PROGRAM_ID);
  }, [connection, wallet, programIds]);

  // Layer 2: Attestation (SPL-TAP)
  const attestationClient = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }
    return new SPLTAPClient(connection, wallet as AnchorWallet, programIds.SPL_TAP_PROGRAM_ID);
  }, [connection, wallet, programIds]);

  // Layer 3: Consensus (SPL-FCP)
  const consensusClient = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }
    return new SPLFCPClient(connection, wallet as AnchorWallet, programIds.SPL_FCP_PROGRAM_ID);
  }, [connection, wallet, programIds]);

  // Layer 5: Capability Discovery (SPL-ACP)
  const capabilityClient = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }
    return new SPLACPClient(connection, wallet as AnchorWallet, programIds.SPL_ACP_PROGRAM_ID);
  }, [connection, wallet, programIds]);

  return {
    // Layer 1: Identity & Reputation
    identity: identityClient,
    
    // Layer 2: Attestation & Trust
    attestation: attestationClient,
    
    // Layer 3: Consensus & Governance
    consensus: consensusClient,
    
    // Layer 5: Capability Discovery
    capabilities: capabilityClient,
    
    // Wallet state
    connected: !!wallet.connected && !!wallet.publicKey,
    publicKey: wallet.publicKey,
  };
}
