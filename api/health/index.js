// Vercel Serverless Function: /api/health
export const config = { runtime: 'edge' };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

export default function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }
  
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 9) || 'local';
  const branch = process.env.VERCEL_GIT_COMMIT_REF || 'unknown';
  
  const payload = { 
    status: 'ok', 
    time: new Date().toISOString(), 
    commit, 
    branch,
    endpoints: {
      health: '/api/health',
      buildInfo: '/api/build-info',
      solana: '/api/solana',
      x402Payment: '/api/x402/payment'
    }
  };
  
  return new Response(JSON.stringify(payload), { 
    status: 200, 
    headers: { 
      'content-type': 'application/json',
      ...corsHeaders 
    } 
  });
}
