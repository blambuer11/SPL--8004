import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const secret = process.env.KEY_SECRET;
  if (!secret) return res.status(501).json({ error: 'KEY_SECRET not configured' });

  try {
    const token = req.headers['authorization']?.replace('Bearer ', '') || req.query.token || (typeof req.body === 'string' ? JSON.parse(req.body||'{}').token : req.body?.token);
    if (!token) return res.status(400).json({ error: 'Missing token' });
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    return res.status(200).json({ valid: true, decoded });
  } catch (err) {
    return res.status(401).json({ valid: false, error: err?.message || 'Invalid token' });
  }
}
