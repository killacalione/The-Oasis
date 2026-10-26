import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn as spawnProcess } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import path from 'node:path';
import { spawn as spawnLocation, stepMovement, validLocation } from '../shared/worlds.js';
import { Store, BoundedLog, validateBackup } from '../server/store.js';
declare const __TEST_ROOT__: string;
const helpers = await import(new URL('file:' + __TEST_ROOT__.replaceAll('\\', '/') + '/pilot/scripts/test-helpers.mjs').href);
const { startHost, freshDirectory, createProfile, join, request, command, until, sleep } = helpers;

test('duplicate shutdown requests both await a complete verified backup', async () => {
  const directory = await freshDirectory('shutdown-test-');
  const host = await startHost(directory);
  await createProfile(host, 'Shutdown Test'); await host.stop();
  const snapshots = readdirSync(path.join(directory, 'backups')).filter(name => name.endsWith('.sqlite'));
  assert.equal(snapshots.length, 1); assert.equal(validateBackup(path.join(directory, 'backups', snapshots[0])), 1); assert.equal(host.child.exitCode, 0);
  assert.deepEqual(readdirSync(path.join(directory, 'backups')), snapshots);
});

test('authoritative movement stays on the platform at any frame rate', () => {
  let location = spawnLocation('hub');
  for (let i = 0; i < 1000; i++) location = stepMovement(location, { dx: 1, dz: 1, facing: 1 }, 1000);
  assert.ok(validLocation(location)); assert.ok(Math.hypot(location.x, location.z) <= 23.000001);
  assert.ok(!validLocation(null)); assert.ok(!validLocation({})); assert.ok(!validLocation({ ...location, x: Infinity })); assert.ok(!validLocation({ ...location, worldVersion: 'unavailable' }));
});
test('SQLite acknowledgements, conflicts, malformed saves and nonthrowing logs', async () => {
  const directory = await freshDirectory('store-test-');
  const store = new Store(directory);
  try {
    const { token, profile } = store.create('Store Explorer', '#65dcc0');
    const saved = store.save(profile, { ...profile.location, x: 2.75, facing: 1.25 });
    assert.equal(saved.revision, 2); assert.equal(store.authenticate(token)!.location.x, 2.75);
    assert.throws(() => store.save(profile, spawnLocation('island')), /conflict/);
    assert.equal(store.authenticate(token)!.location.x, 2.75);
    const file = await store.backup(); assert.ok(file.endsWith('.sqlite'));
    store.db.prepare('UPDATE profiles SET location=? WHERE id=?').run('{broken', saved.id);
    assert.equal(store.authenticate(token)!.location, null);
    const recovered = store.save(store.authenticate(token)!, spawnLocation('hub')); assert.ok(validLocation(recovered.location));
    const logger = new BoundedLog(path.join(directory, 'log-test')); mkdirSync(path.join(directory, 'log-test/pilot.log'));
    assert.doesNotThrow(() => logger.write('full-disk-fixture')); assert.equal(logger.failures, 1);
    assert.throws(() => new Store(directory), /already in use/);
  } finally { store.close(); }
});
test('real HTTP, WebSocket clients, restart and backup recovery', async t => {
  const directory = await freshDirectory('network-test-');
  let host = await startHost(directory);
  let rooms: any[] = [];
  try {
    await t.test('health is Node24; host/origin and public matchmaking are denied', async () => {
      const health = await request(host, '/healthz'); assert.equal(health.status, 200); assert.match(health.data.node, /^24\./); assert.equal(health.data.capacity, 5);
      assert.equal((await request(host, '/api/profiles', { method: 'POST', body: { name: 'No Invite', color: '#65dcc0', invite: 'not-the-host-invite' } })).status, 403);
      assert.equal((await request(host, '/api/profiles', { method: 'POST', body: {}, headers: { Origin: 'http://evil.invalid' } })).status, 403);
      assert.equal((await request(host, '/matchmake/create/oasis', { method: 'POST', body: {} })).status, 403);
      assert.equal((await request(host, '/matchmake/joinOrCreate/oasis', { method: 'POST', body: {} })).status, 403);
      assert.equal((await request(host, '/api/profile', { token: '0'.repeat(64) })).status, 401);
      const upgrade = await new Promise<number>(resolve => { const req = httpRequest(host.base, { path: '/not-a-room', headers: { Origin: 'http://evil.invalid', Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==', 'Sec-WebSocket-Version': '13' } }, res => { resolve(res.statusCode!); res.resume(); }); req.end(); });
      assert.equal(upgrade, 403);
      const invalid = await new Promise<number>(resolve => { const req = httpRequest(host.base, { path: 'http://[', headers: { Host: new URL(host.base).host } }, res => { resolve(res.statusCode!); res.resume(); }); req.end(); });
      assert.equal(invalid, 400); assert.equal((await request(host, '/healthz')).status, 200);
    });
    const profiles = await Promise.all(Array.from({ length: 6 }, (_, i) => createProfile(host, `Explorer ${i + 1}`)));
    await t.test('five simultaneous clients share one session; a sixth cannot spawn another', async () => {
      rooms = await Promise.all(profiles.slice(0, 5).map((p: any) => join(host, p.token)));
      await until(() => rooms.every(room => room.state.players.size === 5));
      await assert.rejects(() => join(host, profiles[5].token));
      assert.equal((await request(host, '/healthz')).data.clients, 5);
    });
    await t.test('movement is server-timed and rejects invalid coordinates and replay', async () => {
      const room = rooms[0]; const before = room.state.players.get(room.sessionId).x;
      room.send('move', { seq: 1, dx: 1, dz: 0, facing: 0 }); await sleep(180);
      const x = room.state.players.get(room.sessionId).x; assert.ok(x > before); assert.ok(x - before < 1.5);
      room.send('move', { seq: 2, dx: 1, dz: 0, facing: 0, x: 5000, playerId: profiles[1].profile.id });
      room.send('move', { seq: 1, dx: -1, dz: 0, facing: 0 });
      room.send('move', { seq: 3, dx: NaN, dz: 0, facing: 0 }); await sleep(300);
      assert.ok(room.state.players.get(room.sessionId).x < 2); assert.ok((await request(host, '/healthz')).data.metrics.rejected >= 3);
    });
    await t.test('travel, appearance, duplicate request and cross-profile denial', async () => {
      const room = rooms[0];
      await command(room, 'appearance', { color: '#b5a2ff' });
      const first = await command(room, 'travel', { target: 'island' }, 'same_travel');
      const duplicate = await command(room, 'travel', { target: 'island' }, 'same_travel'); assert.deepEqual(duplicate, first);
      const saved = await request(host, '/api/profile', { token: profiles[0].token });
      assert.equal(saved.data.profile.location.worldId, 'island'); assert.equal(saved.data.profile.color, '#b5a2ff');
      await assert.rejects(() => command(room, 'travel', { target: 'missing' }), /unavailable/);
      await assert.rejects(() => command(room, 'appearance', { color: '#ec91af', playerId: profiles[1].profile.id }), /fields/);
      assert.equal((await request(host, '/api/profile', { token: profiles[0].token })).data.profile.revision, saved.data.profile.revision);
      assert.equal((await request(host, '/api/profile', { token: profiles[1].token })).data.profile.color, '#65dcc0');
      await command(room, 'travel', { target: 'observatory' }); await command(room, 'travel', { target: 'hub' });
    });
    await t.test('leaving one client preserves the other clients and the server', async () => {
      await rooms.pop().leave(); await until(async () => (await request(host, '/healthz')).data.clients === 4);
      await until(() => rooms[0].state.players.size === 4);
      assert.equal(rooms[0].state.players.size, 4);
      await assert.rejects(() => join(host, profiles[0].token));
      await until(async () => (await request(host, '/healthz')).data.clients === 4);
    });
    await t.test('a manual database failure is correlated and preserves the last confirmed save', async () => {
      const db = new DatabaseSync(path.join(directory, 'oasis.sqlite'));
      db.exec("CREATE TRIGGER fail_save BEFORE UPDATE ON profiles BEGIN SELECT RAISE(ABORT, 'test write failure'); END;");
      const before = (await request(host, '/api/profile', { token: profiles[0].token })).data.profile;
      await assert.rejects(() => command(rooms[0], 'save'), /Saving failed/);
      assert.equal((await request(host, '/api/profile', { token: profiles[0].token })).data.profile.revision, before.revision);
      db.exec('DROP TRIGGER fail_save'); db.close();
    });
    const snapshot = (await request(host, '/api/profile', { token: profiles[0].token })).data.profile;
    const backupFile = path.join(directory, 'verified-backup.sqlite');
    await t.test('live backup validates and restore refuses existing data', async () => {
      const admin = path.join(__TEST_ROOT__, 'pilot/dist/server/admin.js');
      execFileSync(process.execPath, [admin, 'backup', '--data-dir', directory, '--output', backupFile], { stdio: 'pipe' });
      assert.throws(() => execFileSync(process.execPath, [admin, 'restore', '--from', backupFile, '--into', directory], { stdio: 'pipe' }));
    });
    await host.stop(true); rooms = [];
    await t.test('forced restart recovers the acknowledged exact record', async () => {
      host = await startHost(directory);
      const loaded = (await request(host, '/api/profile', { token: profiles[0].token })).data.profile;
      assert.deepEqual(loaded, snapshot);
      rooms.push(await join(host, profiles[0].token));
      assert.equal(rooms[0].state.players.get(rooms[0].sessionId).color, snapshot.color);
      await rooms.pop().leave(); await host.stop();
    });
    await t.test('restored backup starts as a separate working instance', async () => {
      const restored = await freshDirectory('restore-test-');
      execFileSync(process.execPath, [path.join(__TEST_ROOT__, 'pilot/dist/server/admin.js'), 'restore', '--from', backupFile, '--into', restored], { stdio: 'pipe' });
      host = await startHost(restored);
      assert.deepEqual((await request(host, '/api/profile', { token: profiles[0].token })).data.profile, snapshot);
      rooms.push(await join(host, profiles[0].token)); await rooms.pop().leave(); await host.stop();
    });
    await t.test('corrupt saved JSON is preserved until explicit Hub recovery', async () => {
      const db = new DatabaseSync(path.join(directory, 'oasis.sqlite'));
      db.prepare('UPDATE profiles SET location=? WHERE id=?').run('null', profiles[0].profile.id); db.close();
      host = await startHost(directory);
      const before = await request(host, '/api/profile', { token: profiles[0].token }); assert.equal(before.data.canResume, false);
      await assert.rejects(() => join(host, profiles[0].token));
      assert.equal((await request(host, '/api/profile', { token: profiles[0].token })).data.profile.location, null);
      const recovered = await request(host, '/api/recover-hub', { method: 'POST', token: profiles[0].token, body: { confirm: true } });
      assert.equal(recovered.status, 200); assert.equal(recovered.data.profile.location.worldId, 'hub');
      rooms.push(await join(host, profiles[0].token));
    });
  } finally { for (const room of rooms) await room.leave().catch(() => {}); await host.stop(); }
});

test('the restart supervisor recovers a crashed child and stops cleanly', async () => {
  const directory = await freshDirectory('supervisor-test-');
  const probe = await startHost(await freshDirectory('port-probe-'));
  const port = new URL(probe.base).port; await probe.stop();
  const child = spawnProcess(process.execPath, [path.join(__TEST_ROOT__, 'pilot/scripts/supervise.mjs')], { cwd: __TEST_ROOT__, env: { ...process.env, OASIS_DATA_DIR: directory, OASIS_PORT: port, OASIS_BIND: '127.0.0.1', OASIS_INVITE: helpers.testInvite }, stdio: ['ignore', 'pipe', 'pipe', 'ipc'], windowsHide: true });
  child.stdout.resume(); child.stderr.resume();
  const host = { base: `http://127.0.0.1:${port}` };
  let room: any;
  try {
    await until(async () => { try { return (await request(host, '/readyz')).status === 200; } catch { return false; } });
    const p = await createProfile(host, 'Supervisor Test'); room = await join(host, p.token); await command(room, 'travel', { target: 'island' });
    const first = JSON.parse(readFileSync(path.join(directory, 'supervisor.json'), 'utf8'));
    assert.equal(first.supervisorPid, child.pid); assert.ok(Number.isSafeInteger(first.childPid));
    process.kill(first.childPid, 'SIGKILL');
    await until(() => JSON.parse(readFileSync(path.join(directory, 'supervisor.json'), 'utf8')).childPid !== first.childPid, 8000);
    await until(async () => { try { return (await request(host, '/readyz')).status === 200; } catch { return false; } });
    assert.equal((await request(host, '/api/profile', { token: p.token })).data.profile.location.worldId, 'island');
    room = await join(host, p.token); await room.leave(); room = null;
  } finally {
    if (room) await room.leave().catch(() => {});
    const stopped = new Promise(resolve => child.once('exit', resolve)); child.send({ type: 'shutdown' });
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000); await stopped; clearTimeout(timer);
  }
  assert.equal(child.exitCode, 0);
});
