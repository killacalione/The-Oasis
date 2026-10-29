import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { root, sleep } from './paths.mjs';
if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Use Node 24.');
const directory = path.resolve(process.env.OASIS_DATA_DIR || path.join(root, '.local/lan-pilot'));
await mkdir(directory, { recursive: true });
let child, stopping = false, failures = 0;
async function stop() { stopping = true; if (child?.connected) child.send({ type: 'shutdown' }); }
process.once('SIGINT', stop); process.once('SIGTERM', stop); process.on('message', message => { if (message?.type === 'shutdown') void stop(); });
while (!stopping) {
  const start = Date.now();
  child = spawn(process.execPath, [path.join(root, 'pilot/dist/server/index.js')], { cwd: root, env: { ...process.env, OASIS_DATA_DIR: directory }, stdio: ['ignore', 'inherit', 'inherit', 'ipc'], windowsHide: true });
  await writeFile(path.join(directory, 'supervisor.json'), JSON.stringify({ supervisorPid: process.pid, childPid: child.pid, startedAt: new Date().toISOString() }, null, 2));
  const code = await new Promise(resolve => child.once('exit', resolve));
  if (stopping || code === 0) break;
  failures = Date.now() - start > 60000 ? 1 : failures + 1;
  if (failures >= 5) throw new Error('Five rapid startup failures. Supervisor stopped; inspect the local logs before retrying.');
  console.log('The pilot stopped unexpectedly. Restarting in three seconds.'); await sleep(3000);
}
if (process.connected) process.disconnect();
