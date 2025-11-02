import bs58 from 'bs58';
import { verifyApiKey, checkRateLimit, trackUsage, applyRateLimitHeaders } from '../_lib/apiAuth.js';
import { PublicKey } from '@solana/web3.js';

function getEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

// verification & rate limit via shared helper

function enc(str) { return Buffer.from(str, 'utf8'); }

function identityPda(agentId, programId) {
  return PublicKey.findProgramAddressSync([enc('identity'), enc(agentId)], new PublicKey(programId));
}

function reputationPda(agentId, programId) {
  return PublicKey.findProgramAddressSync([enc('reputation'), enc(agentId)], new PublicKey(programId));
}

async function rpcCall(upstream, method, params) {
  const body = { jsonrpc: '2.0', id: 1, method, params };
  const r = await fetch(upstream, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (j.error) throw new Error(j.error?.message || 'RPC error');
  return j.result;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const auth = await verifyApiKey(req);
  if (!auth.ok) return res.status(auth.code || 401).json({ error: auth.error });
  const rl = await checkRateLimit(auth.apiKeyHash);
  applyRateLimitHeaders(res, rl);
  if (!rl.ok) return res.status(429).json({ error: 'Rate limit exceeded' });

  const agentId = req.query.agentId;
  if (!agentId || typeof agentId !== 'string') return res.status(400).json({ error: 'Invalid agentId' });

  const upstream = getEnv('UPSTREAM_SOLANA_RPC', 'https://api.devnet.solana.com');
  const programId = getEnv('PROGRAM_ID', 'G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW');

  try {
    const [idPda] = identityPda(agentId, programId);
    const [repPda] = reputationPda(agentId, programId);

    const idAcc = await rpcCall(upstream, 'getAccountInfo', [idPda.toBase58(), { encoding: 'base64' }]);
    const repAcc = await rpcCall(upstream, 'getAccountInfo', [repPda.toBase58(), { encoding: 'base64' }]);

    if (!idAcc?.value?.data?.[0]) return res.status(404).json({ error: 'Agent not found' });

    const idBuf = Buffer.from(idAcc.value.data[0], 'base64');
    let offset = 8; // disc
    const owner = bs58.encode(idBuf.subarray(offset, offset + 32)); offset += 32;
    const agentIdLen = idBuf.readUInt32LE(offset); offset += 4;
    const agentIdStr = idBuf.subarray(offset, offset + agentIdLen).toString('utf8'); offset += agentIdLen;
    const metaLen = idBuf.readUInt32LE(offset); offset += 4;
    const metadataUri = idBuf.subarray(offset, offset + metaLen).toString('utf8'); offset += metaLen;
    const createdAt = Number(idBuf.readBigInt64LE(offset)); offset += 8;
    const updatedAt = Number(idBuf.readBigInt64LE(offset)); offset += 8;
    const isActive = idBuf[offset] === 1;

    let reputation = null;
    if (repAcc?.value?.data?.[0]) {
      const repBuf = Buffer.from(repAcc.value.data[0], 'base64');
      // Offsets consistent with the frontend client parser
      const score = Number(repBuf.readBigInt64LE(40));
      const totalTasks = Number(repBuf.readBigInt64LE(48));
      const successfulTasks = Number(repBuf.readBigInt64LE(56));
      const failedTasks = Number(repBuf.readBigInt64LE(64));
      reputation = { score, totalTasks, successfulTasks, failedTasks };
    }

    const out = {
      address: idPda.toBase58(),
      agentId: agentIdStr,
      owner,
      metadataUri,
      createdAt,
      updatedAt,
      isActive,
      reputation,
    };
    await trackUsage(auth);
    return res.status(200).json(out);
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
