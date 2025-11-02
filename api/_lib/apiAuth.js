import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Simple helper for date keys
function yyyymmdd(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function sha256Hex(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function getEnv(name, fallback = undefined) {
  const v = process.env[name];
  return v === undefined || v === '' ? fallback : v;
}

// Upstash Redis REST minimal client (no extra deps)
const UPSTASH_URL = getEnv('UPSTASH_REDIS_REST_URL');
const UPSTASH_TOKEN = getEnv('UPSTASH_REDIS_REST_TOKEN');

async function redisCmd(commands) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null; // dev mode
  const res = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${UPSTASH_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ commands }),
  });
  if (!res.ok) throw new Error(`Upstash error: ${res.status}`);
  return res.json();
}

async function redisIncrExpire(key, expireSeconds) {
  const r = await redisCmd([["INCR", key], ["EXPIRE", key, String(expireSeconds)]]);
  if (!r) return { value: 0 };
  // First command response is INCR value
  return { value: r[0]?.result ?? 0 };
}

async function redisGet(keys) {
  const cmds = keys.map((k) => ["GET", k]);
  const r = await redisCmd(cmds);
  if (!r) return keys.map(() => null);
  return r.map((x) => (x?.result == null ? null : x.result));
}

async function redisIncr(keysAndAmounts) {
  const cmds = keysAndAmounts.map(([k, a]) => ["INCRBY", k, String(a)]);
  const r = await redisCmd(cmds);
  if (!r) return null;
  return r.map((x) => x?.result);
}

// Verify JWT API key and produce hashed identity for storage
export async function verifyApiKey(req) {
  const secret = getEnv('KEY_SECRET');
  if (!secret) {
    // Dev mode: allow unauthenticated
    return { ok: true, decoded: null, apiKeyHash: 'dev' };
  }
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return { ok: false, code: 401, error: 'Missing Authorization: Bearer <token>' };
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    const apiKeyHash = sha256Hex(token);
    return { ok: true, decoded, apiKeyHash };
  } catch (e) {
    return { ok: false, code: 401, error: e?.message || 'Invalid token' };
  }
}

// Per-minute fixed window rate limit using Redis
export async function checkRateLimit(apiKeyHash) {
  const rpm = Number(getEnv('RATE_LIMIT_RPM', '120')); // default 120 req/min
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    // Dev mode: no enforcement, but return remaining based on in-memory assumption
    return { ok: true, limit: rpm, remaining: rpm, reset: 60 };
  }
  const bucket = `rl:${apiKeyHash}:${Math.floor(Date.now() / 60000)}`; // current minute bucket
  const { value } = await redisIncrExpire(bucket, 65);
  const remaining = Math.max(0, rpm - value);
  if (value > rpm) {
    return { ok: false, limit: rpm, remaining: 0, reset: 60 - (Date.now() / 1000 % 60) };
  }
  return { ok: true, limit: rpm, remaining, reset: 60 - (Date.now() / 1000 % 60) };
}

// Increment usage counters (total + per-day) and optionally report to Stripe
export async function trackUsage({ apiKeyHash, decoded }, amount = 1) {
  if (!amount || amount <= 0) return;
  const dayKey = `usage:day:${apiKeyHash}:${yyyymmdd()}`;
  const totalKey = `usage:total:${apiKeyHash}`;
  try {
    await redisIncr([[dayKey, amount], [totalKey, amount]]);
  } catch {}

  // Optional: Stripe metered usage reporting (if mapping exists)
  // To enable fully, store subscription_item id mapped to apiKeyHash at issuance time
  const stripeKey = getEnv('STRIPE_SECRET_KEY');
  const meteredPrice = getEnv('STRIPE_METERED_PRICE_ID');
  if (!stripeKey || !meteredPrice) return; // not configured

  try {
    const mapKey = `bill:subitem:${apiKeyHash}`;
    const [subItem] = await redisGet([mapKey]);
    if (!subItem) return;
    // Lazy import to avoid bundling if unused
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
    await stripe.subscriptionItems.createUsageRecord(String(subItem), {
      quantity: amount,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    });
  } catch (e) {
    // Swallow errors to avoid impacting API latency
  }
}

export async function getUsageSummary(apiKeyHash) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return { mode: 'dev', total: null, today: null };
  }
  const todayKey = `usage:day:${apiKeyHash}:${yyyymmdd()}`;
  const totalKey = `usage:total:${apiKeyHash}`;
  const [today, total] = await redisGet([todayKey, totalKey]);
  return {
    mode: 'prod',
    today: Number(today || 0),
    total: Number(total || 0),
  };
}

export function applyRateLimitHeaders(res, rl) {
  if (!rl) return;
  res.setHeader('X-RateLimit-Limit', String(rl.limit));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, Math.floor(rl.remaining))));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(rl.reset)));
}
