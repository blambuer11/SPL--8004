#!/usr/bin/env node
/**
 * Prepare Vercel Build Output v3 functions directory for API routes.
 * Copies /api files into .vercel/output/functions with proper structure.
 */
import { mkdirSync, cpSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const apiDir = join(projectRoot, 'api');
const outputFunctionsDir = join(projectRoot, '.vercel', 'output', 'functions');

// Ensure output/functions directory exists
if (!existsSync(outputFunctionsDir)) {
  mkdirSync(outputFunctionsDir, { recursive: true });
}

// API endpoints to deploy
const endpoints = [
  { name: 'build-info', runtime: 'nodejs20.x', maxDuration: 10 },
  { name: 'solana', runtime: 'edge', maxDuration: 30 }
];

endpoints.forEach(({ name, runtime, maxDuration }) => {
  const funcDir = join(outputFunctionsDir, 'api', `${name}.func`);
  mkdirSync(funcDir, { recursive: true });

  // Copy source file
  const sourceFile = join(apiDir, `${name}.js`);
  const targetFile = join(funcDir, 'index.js');
  if (existsSync(sourceFile)) {
    cpSync(sourceFile, targetFile);
  } else {
    console.warn(`⚠️  Source file not found: ${sourceFile}`);
    return;
  }

  // Write .vc-config.json
  const config = {
    runtime,
    handler: 'index.js',
    launcherType: 'Nodejs',
    shouldAddHelpers: true,
    maxDuration
  };
  if (runtime === 'edge') {
    config.launcherType = undefined;
    config.shouldAddHelpers = undefined;
  }
  writeFileSync(join(funcDir, '.vc-config.json'), JSON.stringify(config, null, 2));
  console.log(`✓ Prepared function: /api/${name} (${runtime})`);
});

console.log(`✅ Vercel functions directory ready at ${outputFunctionsDir}`);
