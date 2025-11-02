import { verifyApiKey, getUsageSummary, applyRateLimitHeaders, checkRateLimit } from '../_lib/apiAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const auth = await verifyApiKey(req);
  if (!auth.ok) return res.status(auth.code || 401).json({ error: auth.error });

  // Apply a lightweight rate limit to the summary endpoint as well
  const rl = await checkRateLimit(auth.apiKeyHash);
  applyRateLimitHeaders(res, rl);
  if (!rl.ok) return res.status(429).json({ error: 'Rate limit exceeded' });

  try {
    const usage = await getUsageSummary(auth.apiKeyHash);
    const price = Number(process.env.USAGE_PRICE_PER_CALL || 0.001);
    const todayCost = usage.today == null ? null : Number((usage.today * price).toFixed(6));
    const totalCost = usage.total == null ? null : Number((usage.total * price).toFixed(6));
    return res.status(200).json({ ...usage, unitPrice: price, todayCost, totalCost });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Usage error' });
  }
}
