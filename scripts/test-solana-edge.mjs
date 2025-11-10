#!/usr/bin/env node
/**
 * Minimal edge function test for /api/solana
 * Sends a lightweight getHealth JSON-RPC request to the configured endpoint.
 * Usage: node scripts/test-solana-edge.mjs https://your-domain.vercel.app
 * Note: Node >=18 provides global fetch; no dependency needed.
 */

const base = process.argv[2] || process.env.TEST_BASE_URL;
if (!base) {
  console.error('Provide base URL: node scripts/test-solana-edge.mjs https://<domain>');
  process.exit(1);
}

const url = base.replace(/\/$/, '') + '/api/solana';

async function main() {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getHealth'
  };
  const start = Date.now();
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const ms = Date.now() - start;
  const text = await resp.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }

  console.log('Status:', resp.status, resp.statusText);
  console.log('Latency(ms):', ms);
  console.log('URL:', url);
  console.log('Body:', parsed);
  console.log('Headers:', {
    'cache-control': resp.headers.get('cache-control'),
    'cf-cache-status': resp.headers.get('cf-cache-status'),
    'content-type': resp.headers.get('content-type')
  });

  if (resp.status !== 200) {
    console.error('Edge function responded with non-200.');
    process.exit(2);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
