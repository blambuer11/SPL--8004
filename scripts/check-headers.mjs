#!/usr/bin/env node
/**
 * Fetch base URL and one SPA route to inspect security & cache headers.
 * Usage: node scripts/check-headers.mjs https://your-domain.vercel.app /docs
 * Note: Node >=18 provides global fetch; no dependency needed.
 */

const base = process.argv[2];
const path = process.argv[3] || '/';
if (!base) {
  console.error('Usage: node scripts/check-headers.mjs <baseUrl> [/path]');
  process.exit(1);
}

async function inspect(url) {
  const resp = await fetch(url, { method: 'GET' });
  console.log('\nURL:', url);
  console.log('Status:', resp.status);
  const interesting = [
    'cache-control','x-frame-options','x-content-type-options','referrer-policy',
    'permissions-policy','strict-transport-security','content-security-policy'
  ];
  const out = {};
  for (const h of interesting) out[h] = resp.headers.get(h) || '-';
  console.table(out);
}

(async () => {
  await inspect(base.replace(/\/$/, ''));
  await inspect(base.replace(/\/$/, '') + path);
})();
