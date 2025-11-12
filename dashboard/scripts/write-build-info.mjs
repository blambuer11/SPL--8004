#!/usr/bin/env node
/**
 * Generates public/build-info.json containing timestamp and last git commit.
 */
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

function get(cmd) {
  try { return execSync(cmd).toString().trim(); } catch { return 'unknown'; }
}

const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 9) || get('git rev-parse --short HEAD');
const branch = process.env.VERCEL_GIT_COMMIT_REF || get('git rev-parse --abbrev-ref HEAD');
const iso = new Date().toISOString();

const data = { commit, branch, builtAt: iso };
const dir = join(process.cwd(), 'public');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'build-info.json'), JSON.stringify(data, null, 2));
console.log('Generated build-info.json:', data);

// Also patch index.html placeholders so viewing source shows commit/time even if JSON not fetched.
try {
  const indexPath = join(process.cwd(), 'index.html');
  let html = execSync(`cat ${indexPath}`).toString();
  html = html
    .replace('__BUILD_COMMIT__', commit)
    .replace('__BUILD_TIME__', iso);
  writeFileSync(indexPath, html);
  console.log('Patched index.html with build metadata.');
} catch (e) {
  console.warn('Could not patch index.html:', e?.message || e);
}
