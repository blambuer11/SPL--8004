import jwt from 'jsonwebtoken';
import crypto from 'crypto';

function sha256Hex(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
async function redisSetMeta(key, obj) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: { 'authorization': `Bearer ${UPSTASH_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ commands: [["HSET", key, ...Object.entries(obj).flatMap(([k,v]) => [k, String(v)])]] }),
  }).catch(()=>{});
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const secret = process.env.KEY_SECRET;
  if (!secret) return res.status(501).json({ error: 'KEY_SECRET not configured' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const plan = body.plan || 'rest-api';
    const org = body.org || 'default';
    const ttlHours = Number(process.env.KEY_TTL_HOURS || 24 * 365);

    const payload = {
      plan,
      org,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + ttlHours * 3600,
    };
  const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
  // Store minimal metadata for key (optional; requires Upstash)
  const hash = sha256Hex(token);
  await redisSetMeta(`keymeta:${hash}`, { plan, org, createdAt: Math.floor(Date.now()/1000) });
  return res.status(200).json({ apiKey: token, plan, expiresAt: payload.exp });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Invalid request' });
  }
}
