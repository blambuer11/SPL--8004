// Vercel Serverless Function: /api/build-info
export default function handler(req, res) {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 9) || 'local';
  const branch = process.env.VERCEL_GIT_COMMIT_REF || 'unknown';
  const builtAt = new Date().toISOString();
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).json({ commit, branch, builtAt });
}
