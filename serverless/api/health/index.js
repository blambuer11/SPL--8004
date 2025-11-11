export const config = { runtime: 'edge' };

export default function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' } });
  }
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 9) || 'local';
  const branch = process.env.VERCEL_GIT_COMMIT_REF || 'unknown';
  const payload = { status: 'ok', time: new Date().toISOString(), commit, branch };
  return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
}
