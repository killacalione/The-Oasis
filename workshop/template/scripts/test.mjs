import './build.mjs';
import { build } from 'esbuild';
import { readdir,mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { root,fromRoot } from './environment.mjs';
const tests=(await readdir(fromRoot('tests'))).filter(f=>/\.test\.(?:mjs|ts)$/.test(f)).sort();
if(!tests.length)throw new Error('No lesson tests found.');
await mkdir(fromRoot('.local/tests'),{recursive:true});
const outputs=[];
for(const file of tests){const output=fromRoot('.local/tests',file.replace(/\.(ts|mjs)$/,'.mjs'));await build({entryPoints:[fromRoot('tests',file)],outfile:output,bundle:true,packages:'external',platform:'node',format:'esm',target:'node24',define:{__TEST_ROOT__:JSON.stringify(root)}});outputs.push(output);}
execFileSync(process.execPath,['--test','--test-concurrency=1',...outputs],{cwd:root,stdio:'inherit'});
