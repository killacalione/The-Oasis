import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { root } from './environment.mjs';
const require=createRequire(import.meta.url);
execFileSync(process.execPath,[require.resolve('typescript/bin/tsc'),'-p','tsconfig.json','--noEmit'],{cwd:root,stdio:'inherit'});
console.log('Type check passed.');
