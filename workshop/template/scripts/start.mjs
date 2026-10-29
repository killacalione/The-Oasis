import './build.mjs';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { fromRoot } from './environment.mjs';
if (existsSync(fromRoot('src/server/index.ts'))) await import(pathToFileURL(fromRoot('dist/server/index.js')).href);
else await import('./serve.mjs');
