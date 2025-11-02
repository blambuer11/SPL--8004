import crypto from 'crypto';
import bs58 from 'bs58';
import { verifyApiKey, checkRateLimit, trackUsage, applyRateLimitHeaders } from '../_lib/apiAuth.js';

function getEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest();
}

function accountDiscriminator(name) {
  const h = sha256(`account:${name}`);
  return h.subarray(0, 8);
}

// key verification and rate limit handled via apiAuth helpers

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = await verifyApiKey(req);
  if (!auth.ok) return res.status(auth.code || 401).json({ error: auth.error });
  const rl = await checkRateLimit(auth.apiKeyHash);
  applyRateLimitHeaders(res, rl);
  if (!rl.ok) return res.status(429).json({ error: 'Rate limit exceeded' });

  const upstream = getEnv('UPSTREAM_SOLANA_RPC', 'https://api.devnet.solana.com');
  const programId = getEnv('PROGRAM_ID', 'G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW');
  const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 500);

  try {
    const disc = accountDiscriminator('IdentityRegistry');
    const body = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getProgramAccounts',
      params: [
        programId,
        {
          encoding: 'base64',
          filters: [
            { memcmp: { offset: 0, bytes: bs58.encode(disc) } },
          ],
        },
      ],
    };

    const rpc = await fetch(upstream, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const json = await rpc.json();
    const result = Array.isArray(json.result) ? json.result : [];

    const agents = [];
    for (const acc of result.slice(0, limit)) {
      try {
        const dataB64 = acc.account?.data?.[0];
        if (!dataB64) continue;
        const buf = Buffer.from(dataB64, 'base64');
        if (buf.length < 8 + 32 + 4) continue;
        let offset = 0;
        offset += 8; // disc
        const owner = bs58.encode(buf.subarray(offset, offset + 32));
        offset += 32;
        const agentIdLen = buf.readUInt32LE(offset); offset += 4;
        if (offset + agentIdLen > buf.length) continue;
        const agentId = buf.subarray(offset, offset + agentIdLen).toString('utf8'); offset += agentIdLen;
        if (offset + 4 > buf.length) continue;
        const metaLen = buf.readUInt32LE(offset); offset += 4;
        if (offset + metaLen > buf.length) continue;
        const metadataUri = buf.subarray(offset, offset + metaLen).toString('utf8'); offset += metaLen;
        if (offset + 8 + 8 + 1 > buf.length) continue;
        const createdAt = Number(buf.readBigInt64LE(offset)); offset += 8;
        const updatedAt = Number(buf.readBigInt64LE(offset)); offset += 8;
        const isActive = buf[offset] === 1;

        agents.push({
          address: acc.pubkey,
          owner,
          agentId,
          metadataUri,
          createdAt,
          updatedAt,
          isActive,
        });
      } catch {}
    }

    const out = { count: agents.length, agents };
    // Track usage only for successful responses
    await trackUsage(auth);
    return res.status(200).json(out);
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'RPC error' });
  }
}
