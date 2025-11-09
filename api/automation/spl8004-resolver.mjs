// SPL-8004 On-Chain Identity Resolver
// Queries agent PDAs to resolve agentId -> owner wallet

import { Connection, PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW');
const IDENTITY_SEED = 'identity';

/**
 * Find Identity PDA for an agentId
 */
export function findIdentityPda(agentId, programId = PROGRAM_ID) {
  const enc = new TextEncoder();
  return PublicKey.findProgramAddressSync(
    [enc.encode(IDENTITY_SEED), enc.encode(agentId)],
    programId
  );
}

/**
 * Normalize agentId: trim and convert to lowercase
 */
export function normalizeAgentId(agentId) {
  return agentId.trim().toLowerCase();
}

/**
 * Parse Identity account data
 * Layout (from spl8004-client.ts):
 * [discriminator(8)][owner(32)][agent_id_len(4)][agent_id][metadata_uri_len(4)][metadata_uri][created(8)][updated(8)][is_active(1)][bump(1)]
 */
export function parseIdentityAccount(data) {
  if (data.length < 8 + 32 + 4) {
    throw new Error('Invalid identity account data: too short');
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  
  // Extract owner (bytes 8-40)
  const ownerBytes = new Uint8Array(data.slice(8, 40));
  const owner = new PublicKey(ownerBytes);
  
  // Extract agentId
  let offset = 40;
  const agentIdLen = view.getUint32(offset, true);
  offset += 4;
  if (offset + agentIdLen > data.length) {
    throw new Error('Invalid identity account: agentId overflow');
  }
  const agentId = new TextDecoder().decode(data.slice(offset, offset + agentIdLen));
  offset += agentIdLen;
  
  // Extract metadataUri
  if (offset + 4 > data.length) {
    throw new Error('Invalid identity account: metadataUri length overflow');
  }
  const metadataUriLen = view.getUint32(offset, true);
  offset += 4;
  if (offset + metadataUriLen > data.length) {
    throw new Error('Invalid identity account: metadataUri overflow');
  }
  const metadataUri = new TextDecoder().decode(data.slice(offset, offset + metadataUriLen));
  offset += metadataUriLen;
  
  // Extract timestamps and flags
  if (offset + 8 + 8 + 1 + 1 > data.length) {
    throw new Error('Invalid identity account: missing trailing fields');
  }
  const created = view.getBigInt64(offset, true);
  offset += 8;
  const updated = view.getBigInt64(offset, true);
  offset += 8;
  const isActive = data[offset] === 1;
  offset += 1;
  const bump = data[offset];
  
  return {
    owner,
    agentId,
    metadataUri,
    created: Number(created),
    updated: Number(updated),
    isActive,
    bump
  };
}

/**
 * Resolve agentId to owner wallet via on-chain PDA lookup
 * @param {string} agentId - The agent identifier
 * @param {Connection} connection - Solana connection
 * @returns {Promise<PublicKey>} Owner wallet public key
 * @throws {Error} If identity not found or inactive
 */
export async function resolveAgentId(agentId, connection) {
  const clean = normalizeAgentId(agentId);
  const [identityPda] = findIdentityPda(clean);
  
  const accountInfo = await connection.getAccountInfo(identityPda);
  if (!accountInfo) {
    throw new Error(`Agent identity not found on-chain: ${agentId}`);
  }
  
  const identity = parseIdentityAccount(accountInfo.data);
  
  if (!identity.isActive) {
    throw new Error(`Agent identity is inactive: ${agentId}`);
  }
  
  return identity.owner;
}

/**
 * Batch resolve multiple agentIds (for efficiency)
 */
export async function resolveAgentIdsBatch(agentIds, connection) {
  const pdas = agentIds.map(id => findIdentityPda(normalizeAgentId(id))[0]);
  const accounts = await connection.getMultipleAccountsInfo(pdas);
  
  return agentIds.map((agentId, i) => {
    const accountInfo = accounts[i];
    if (!accountInfo) return { agentId, owner: null, error: 'Not found' };
    
    try {
      const identity = parseIdentityAccount(accountInfo.data);
      if (!identity.isActive) return { agentId, owner: null, error: 'Inactive' };
      return { agentId, owner: identity.owner, identity };
    } catch (err) {
      return { agentId, owner: null, error: err.message };
    }
  });
}
