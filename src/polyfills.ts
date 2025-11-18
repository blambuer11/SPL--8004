// Global polyfills for browser runtime
// Ensures libs like @solana/web3.js and @solana/spl-token can access Buffer/process
import { Buffer } from 'buffer';
import process from 'process';

if (!(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}

if (!(globalThis as any).process) {
  (globalThis as any).process = process;
}

// Some libs expect global to exist (Node style)
if (!(globalThis as any).global) {
  (globalThis as any).global = globalThis;
}
