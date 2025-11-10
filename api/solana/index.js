// Edge runtime Solana JSON-RPC proxy
export const config = { runtime: 'edge' };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const upstream = process.env.UPSTREAM_SOLANA_RPC || 'https://api.devnet.solana.com';

  try {
    const body = await req.text();
    const upstreamResp = await fetch(upstream, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body
    });
    const text = await upstreamResp.text();
    return new Response(text, {
      status: upstreamResp.status,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  }
}
