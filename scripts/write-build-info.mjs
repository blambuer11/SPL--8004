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

const commit = get('git rev-parse --short HEAD');
const branch = get('git rev-parse --abbrev-ref HEAD');
const iso = new Date().toISOString();

const data = { commit, branch, builtAt: iso };
const dir = join(process.cwd(), 'public');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'build-info.json'), JSON.stringify(data, null, 2));
console.log('Generated build-info.json:', data);
