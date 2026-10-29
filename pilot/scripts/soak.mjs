import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { root, startHost, freshDirectory, createProfile, join, command, request, sleep, leaveRoom } from './test-helpers.mjs';
if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Use Node 24.');
const get = key => { const i = process.argv.indexOf(key); return i >= 0 ? process.argv[i + 1] : undefined; };
const hours = Number(get('--hours') || 24);
if (!Number.isFinite(hours) || hours <= 0 || hours > 24) throw new Error('Choose 0 < --hours <= 24.');
const directory = await freshDirectory('soak-');
const evidence = path.join(directory, 'evidence'); await mkdir(evidence);
const host = await startHost(path.join(directory, 'data'));
const startedAt = new Date().toISOString();
const deadline = Date.now() + hours * 3600000;
const rooms = [], profiles = [], errors = [];
let commands = 0, samples = 0, running = true;
const summary = { status: 'running', kind: 'five synthetic SDK clients on loopback; not physical LAN or browser-rendering evidence', startedAt, targetHours: hours, dueAt: new Date(deadline).toISOString(), runnerPid: process.pid, serverPid: host.child.pid, base: host.base, directory: path.relative(root, directory), revision: (await request(host, '/healthz')).data.revision };
await writeFile(path.join(evidence, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(`Soak started: ${path.relative(root, evidence)}; target ${hours} hours.`);
try {
  for (let i = 0; i < 5; i++) { const p = await createProfile(host, `Soak ${i + 1}`); profiles.push(p); const room = await join(host, p.token); room.onLeave(code => { if (running) errors.push({ at: new Date().toISOString(), event: 'unexpected_disconnect', code }); }); rooms.push(room); }
  let seq = 0, nextTravel = 0, cycle = 0;
  while (Date.now() < deadline) {
    for (let i = 0; i < rooms.length; i++) { const angle = seq / 40 + i; rooms[i].send('move', { seq: ++seq, dx: Math.sin(angle), dz: Math.cos(angle), facing: Math.atan2(Math.sin(angle), Math.cos(angle)) }); }
    if (Date.now() >= nextTravel) {
      for (let i = 0; i < rooms.length; i++) {
        try { const target = ['hub', 'island', 'observatory'][(cycle + i) % 3]; await command(rooms[i], 'travel', { target }); await command(rooms[i], 'save'); commands += 2; }
        catch (error) { errors.push({ at: new Date().toISOString(), event: 'command_failed', message: error.message }); }
      }
      cycle++; nextTravel = Date.now() + 60000;
      const health = (await request(host, '/healthz')).data; samples++;
      await appendFile(path.join(evidence, 'samples.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...health, commands, errors: errors.length }) + '\n');
      await writeFile(path.join(evidence, 'summary.json'), JSON.stringify({ ...summary, commands, samples, errors, lastSample: new Date().toISOString() }, null, 2));
      if (health.clients !== 5 || health.metrics.saveFailures || errors.length) throw new Error('Soak acceptance failed; inspect samples and errors.');
    }
    await sleep(100);
  }
  running = false;
  for (let i = 0; i < rooms.length; i++) { await command(rooms[i], 'save'); const saved = await request(host, '/api/profile', { token: profiles[i].token }); if (!saved.data.profile.revision) throw new Error('Missing confirmed save.'); }
  await writeFile(path.join(evidence, 'summary.json'), JSON.stringify({ ...summary, status: errors.length ? 'failed' : 'passed', completedAt: new Date().toISOString(), elapsedHours: (Date.now() - Date.parse(startedAt)) / 3600000, commands, samples, errors }, null, 2));
} catch (error) {
  await writeFile(path.join(evidence, 'summary.json'), JSON.stringify({ ...summary, status: 'failed', completedAt: new Date().toISOString(), commands, samples, errors, failure: error.message }, null, 2));
  process.exitCode = 1;
} finally { running = false; try { for (const room of rooms) await leaveRoom(room); } finally { await host.stop(); } }
