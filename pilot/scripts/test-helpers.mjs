import { spawn } from 'node:child_process';
import { mkdir, mkdtemp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Client } from '@colyseus/sdk';
export const root = fileURLToPath(new URL('../../', import.meta.url));
export const testInvite = 'automated-test-invite-only';
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function freshDirectory(prefix) { await mkdir(path.join(root, '.local'), { recursive: true }); return mkdtemp(path.join(root, '.local', prefix)); }
export async function until(check, timeout = 6000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { const value = await check(); if (value) return value; await sleep(30); }
  throw new Error('Timed out waiting for the expected state.');
}
export async function startHost(directory, options = {}) {
  const child = spawn(process.execPath, [path.join(root, 'pilot/dist/server/index.js')], { cwd: root, env: { ...process.env, OASIS_DATA_DIR: directory, OASIS_PORT: String(options.port ?? 0), OASIS_BIND: '127.0.0.1', OASIS_INVITE: testInvite }, stdio: ['ignore', 'pipe', 'pipe', 'ipc'], windowsHide: true });
  let output = '', errors = '';
  child.stdout.on('data', bytes => { output = (output + bytes.toString()).slice(-12000); });
  child.stderr.on('data', bytes => { errors = (errors + bytes.toString()).slice(-12000); });
  const base = await until(() => { if (child.exitCode !== null) throw new Error(`Test host exited: ${errors}\n${output}`); return output.match(/The Oasis LV1: (http:\/\/127\.0\.0\.1:\d+)/)?.[1]; }, 15000);
  await until(async () => { try { return (await fetch(base + '/readyz')).ok; } catch { return false; } });
  return {
    base, child, directory,
    async stop(force = false) {
      if (child.exitCode !== null || child.signalCode !== null) return;
      const exited = new Promise(resolve => child.once('exit', resolve));
      if (force) child.kill('SIGKILL'); else { child.send({ type: 'shutdown' }); child.send({ type: 'shutdown' }); }
      const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
      await exited; clearTimeout(timer);
    },
    get errors() { return errors; }
  };
}
export async function request(host, route, options = {}) {
  const { method = 'GET', token, body, headers = {} } = options;
  const response = await fetch(host.base + route, { method, headers: { Origin: host.base, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json() };
}
export async function createProfile(host, name = 'Test Explorer', color = '#65dcc0') {
  const result = await request(host, '/api/profiles', { method: 'POST', body: { name, color, invite: testInvite } });
  if (result.status !== 201) throw new Error('Could not create a test profile.');
  return result.data;
}
export async function join(host, token) {
  const config = await request(host, '/api/config');
  const client = new Client(host.base, { headers: { Origin: host.base } });
  const room = await client.joinById(config.data.roomId, { token });
  room.reconnection.enabled = false; room.reconnection.maxEnqueuedMessages = 0;
  room.onMessage('saved', () => {}); room.onMessage('problem', () => {}); room.onMessage('result', () => {});
  await until(() => room.state?.players?.get(room.sessionId));
  return room;
}
export async function leaveRoom(room) {
  if (!room?.connection?.isOpen) return;
  let timer;
  try { await Promise.race([room.leave().catch(() => {}), new Promise(resolve => { timer = setTimeout(resolve, 1500); })]); }
  finally { clearTimeout(timer); }
}
let requestCounter = 0;
export function command(room, type, fields = {}, id = `test_${++requestCounter}`) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error('Command timed out.')); }, 6000);
    const offResult = room.onMessage('result', result => { if (result.requestId === id) { cleanup(); resolve(result); } });
    const offProblem = room.onMessage('problem', problem => { if (problem.requestId === id) { cleanup(); reject(Object.assign(new Error(problem.message), { code: problem.code })); } });
    function cleanup() { clearTimeout(timer); offResult(); offProblem(); }
    room.send('command', { requestId: id, type, ...fields });
  });
}
