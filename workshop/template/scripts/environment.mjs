import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../', import.meta.url));
export function requireRuntime() { if (process.versions.node !== '24.22.1') throw new Error('This course pins Node 24.22.1. Check node --version and select that runtime.'); }
export const fromRoot = (...parts) => path.join(root, ...parts);
requireRuntime();
