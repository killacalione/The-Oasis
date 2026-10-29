import { build } from 'esbuild';
import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { root, fromRoot } from './environment.mjs';
const lesson = JSON.parse(await readFile(fromRoot('lesson.json'), 'utf8')).lesson;
const entry = existsSync(fromRoot('src/client/app.ts')) ? 'src/client/app.ts' : 'src/client/app.js';
await mkdir(fromRoot('dist/client'), { recursive: true });
await build({ entryPoints: [fromRoot(entry)], outfile: fromRoot('dist/client/app.js'), bundle: true, format: 'esm', target: 'es2022', define: { __LESSON__: String(lesson) } });
await copyFile(fromRoot('src/client/index.html'), fromRoot('dist/client/index.html'));
await copyFile(fromRoot('src/client/style.css'), fromRoot('dist/client/style.css'));
if (existsSync(fromRoot('src/server/index.ts'))) {
  await build({ entryPoints: [fromRoot('src/server/index.ts')], outfile: fromRoot('dist/server/index.js'), bundle: true, packages: 'external', platform: 'node', format: 'esm', target: 'node24', define: { __LESSON__: String(lesson) } });
}
await writeFile(fromRoot('dist/build.json'), JSON.stringify({ lesson, node: process.versions.node }));
console.log(`Built lesson ${lesson} in ${root}`);
