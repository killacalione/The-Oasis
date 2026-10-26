import { build } from 'esbuild';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('The LAN pilot requires Node 24. Use the documented portable runtime.');
const out = path.join(root, 'pilot/dist');
let revision = 'unversioned';
try { revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim(); if (execFileSync('git', ['status', '--porcelain'], { cwd: root }).toString().trim()) revision += '-dirty'; } catch {}
await mkdir(path.join(out, 'client'), { recursive: true });
await build({ entryPoints: [path.join(root, 'pilot/client/app.ts')], outfile: path.join(out, 'client/app.js'), bundle: true, format: 'esm', target: 'es2022', minify: true, sourcemap: false, legalComments: 'linked', define: { __OASIS_REVISION__: JSON.stringify(revision) } });
await build({ entryPoints: [path.join(root, 'pilot/server/index.ts'), path.join(root, 'pilot/server/admin.ts')], outdir: path.join(out, 'server'), bundle: true, packages: 'external', platform: 'node', format: 'esm', target: 'node24', sourcemap: true, define: { __OASIS_REVISION__: JSON.stringify(revision) } });
await copyFile(path.join(root, 'pilot/client/index.html'), path.join(out, 'client/index.html'));
await writeFile(path.join(out, 'release.json'), JSON.stringify({ milestone: 'LV1', revision, node: process.versions.node }, null, 2) + '\n');
console.log(`LAN pilot built: ${revision} on Node ${process.versions.node}`);
