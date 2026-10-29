import './build.mjs';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { WORLDS } from '../shared/worlds.ts';
import { root, startHost, freshDirectory, createProfile, request, sleep, until } from './test-helpers.mjs';
const directory = await freshDirectory('browser-test-');
const artifacts = path.join(root, 'artifacts/lan-pilot'); await mkdir(artifacts, { recursive: true });
let host = await startHost(directory);
const browser = await chromium.launch({ headless: true, ...(process.env.OASIS_BROWSER_EXECUTABLE ? { executablePath: process.env.OASIS_BROWSER_EXECUTABLE } : {}), args: ['--enable-unsafe-swiftshader'] });
const checks = [];
const errors = [];
const contexts = [];
const note = (check, details = {}) => { checks.push({ check, ...details }); console.log(`PASS ${check}`); };
async function pageFor(options = {}) { const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...options }); contexts.push(context); return context.newPage(); }
async function enter(page, name) { await page.goto(host.base); await page.locator('#invite').waitFor(); await until(async () => !!(await page.locator('#invite').inputValue())); await page.locator('#nickname').fill(name); await page.locator('#enter-button').click(); await page.locator('#arrival').waitFor({ state: 'hidden' }); await page.locator('#connection-state').getByText('Connected to your host', { exact: true }).waitFor(); }
async function savedProfile(page) { const key = await page.evaluate(() => localStorage.getItem('oasis-lv1-profile-key')); return (await request(host, '/api/profile', { token: key })).data.profile; }
async function travel(page, target) { await page.locator(`[data-world="${target}"]`).click(); await until(async () => (await page.evaluate(() => window.__oasisMetrics())).world === target); await page.locator('#save-button').waitFor({ state: 'visible' }); await until(() => page.locator('#save-button').isEnabled()); }
const metrics = page => page.evaluate(() => window.__oasisMetrics());
async function portalFailures() { return (await readFile(path.join(directory, 'pilot.log'), 'utf8')).trim().split(/\r?\n/).map(JSON.parse).filter(row => row.event === 'command_save_failed').length; }
async function closeVisitor(page) { await page.locator('#leave').click(); await until(async () => !(await metrics(page)).connected); await page.close(); await until(async () => (await request(host, '/healthz')).data.clients === 1, 12000); }
async function holdKey(page, key, ms = 280) { await page.keyboard.down(key); await sleep(ms); await page.keyboard.up(key); await sleep(120); }
async function holdButton(page, selector, ms = 280) { await page.locator(selector).scrollIntoViewIfNeeded(); const box = await page.locator(selector).boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await sleep(ms); await page.mouse.up(); await sleep(120); }
async function seededPage(worldId, x, z, name = 'Portal Explorer') {
  const { token, profile } = await createProfile(host, name);
  const db = new DatabaseSync(path.join(directory, 'oasis.sqlite'));
  try { db.prepare('UPDATE profiles SET location=? WHERE id=?').run(JSON.stringify({ ...profile.location, worldId, x, z }), profile.id); } finally { db.close(); }
  const page = await pageFor();
  await page.addInitScript(token => localStorage.setItem('oasis-lv1-profile-key', token), token);
  await page.goto(host.base); await page.locator('#resume-button').click(); await page.locator('#arrival').waitFor({ state: 'hidden' });
  await until(async () => !!(await metrics(page)).position);
  return page;
}
try {
  const a = await pageFor(), b = await pageFor();
  a.on('pageerror', error => errors.push(error.message)); a.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await a.goto(host.base); await a.locator('#invite').waitFor();
  await a.screenshot({ path: path.join(artifacts, 'arrival.png') });
  await enter(a, 'Aster'); await enter(b, 'Rowan');
  await until(async () => (await a.locator('#visitor-count').textContent()) === '2 / 5');
  note('two isolated browser profiles see shared presence');
  await a.screenshot({ path: path.join(artifacts, 'hub.png') });
  for (let heading = 0; heading < 3; heading++) {
    for (const [control, sign] of [['d', 1], ['a', -1], ['[data-direction="right"]', 1], ['[data-direction="left"]', -1]]) {
      const before = await metrics(a);
      if (control.length === 1) await holdKey(a, control); else await holdButton(a, control);
      const after = await metrics(a);
      const alongRight = (after.position.x - before.position.x) * before.cameraRight[0] + (after.position.z - before.position.z) * before.cameraRight[2];
      assert.ok(alongRight * sign > 0.4, `${control} must follow camera screen direction at yaw ${before.yaw}`);
      assert.equal(after.position.y, 0);
    }
    await holdKey(a, 'ArrowRight', 980);
  }
  note('keyboard and held buttons strafe toward camera screen-left/right at three headings');
  const yawBeforeLeft = (await metrics(a)).yaw; await holdKey(a, 'ArrowLeft');
  const yawDelta = (await metrics(a)).yaw - yawBeforeLeft; assert.ok(Math.atan2(Math.sin(yawDelta), Math.cos(yawDelta)) < -0.2);
  const initialPitch = (await metrics(a)).pitch; await holdKey(a, 'ArrowUp'); assert.ok((await metrics(a)).pitch < initialPitch - 0.15);
  const beforeDown = (await metrics(a)).pitch;
  await holdButton(a, '[data-look="down"]'); assert.ok((await metrics(a)).pitch > beforeDown + 0.15);
  note('arrow turning and keyboard/button vertical orbit have normal directions');
  // Return the heading to its saved spawn convention for the existing W test.
  await a.reload(); await a.locator('#resume-button').click(); await a.locator('#arrival').waitFor({ state: 'hidden' });
  // Camera heading is durable; turn back to zero using real keyboard input.
  for (let n = 0; n < 100; n++) { const yaw = (await metrics(a)).yaw; if (Math.abs(yaw) < 0.05) break; await holdKey(a, yaw > 0 ? 'ArrowLeft' : 'ArrowRight', Math.min(120, Math.abs(yaw) / 1.6 * 1000)); }
  await travel(a, 'island');
  const before = await savedProfile(a); await a.keyboard.down('w'); await sleep(500); await a.keyboard.up('w');
  await a.locator('#save-button').click(); await until(async () => (await savedProfile(a)).location.z < before.location.z - 0.5);
  await a.locator('#wardrobe button[aria-label="Lavender"]').click(); await until(async () => (await savedProfile(a)).color === '#b5a2ff');
  note('movement works after button focus and appearance is durably saved');
  await a.screenshot({ path: path.join(artifacts, 'island.png') });
  await travel(a, 'observatory'); await a.screenshot({ path: path.join(artifacts, 'observatory.png') });
  for (let i = 0; i < 18; i++) await travel(a, ['hub', 'island', 'observatory'][i % 3]);
  const lifecycle = await a.evaluate(() => window.__oasisMetrics()); assert.equal(lifecycle.engineScenes, 1); assert.ok(lifecycle.meshes < 180); assert.ok(lifecycle.materials < 70);
  note('repeated travel retains one scene and bounded renderer resources', lifecycle);
  await a.locator('#mouse-look').click(); await sleep(100);
  const captured = await a.evaluate(() => document.pointerLockElement?.id === 'world-canvas');
  if (captured) {
    await a.locator('#dashboard').waitFor({ state: 'hidden' });
    await until(async () => (await metrics(a)).canvasSize[0] === 1280);
    const locked = await metrics(a); assert.equal(await a.locator('#dashboard').evaluate(e => e.inert), true);
    assert.ok(Math.abs(locked.renderSize[0] - locked.canvasSize[0]) < 2);
    await a.evaluate(() => document.dispatchEvent(new MouseEvent('mousemove', { movementX: 100, movementY: -100 })));
    await sleep(100); const looked = await metrics(a);
    assert.ok(looked.yaw > locked.yaw + 0.15); assert.ok(looked.pitch < locked.pitch - 0.15);
    await a.evaluate(() => document.dispatchEvent(new MouseEvent('mousemove', { movementY: 100000 })));
    await sleep(80); assert.ok((await metrics(a)).pitch <= 80 * Math.PI / 180 + 1e-8);
    await a.evaluate(() => document.dispatchEvent(new MouseEvent('mousemove', { movementY: -100000 })));
    await sleep(80); assert.ok((await metrics(a)).cameraPosition[1] > 0.3);
    await a.screenshot({ path: path.join(artifacts, 'mouse-mode.png') });
    await a.keyboard.down('w'); await a.keyboard.press('Escape'); await a.keyboard.up('w');
    await until(() => a.evaluate(() => document.pointerLockElement === null));
    await a.locator('#dashboard').waitFor({ state: 'visible' });
    await until(async () => (await metrics(a)).canvasSize[0] < 1100);
    assert.equal(await a.locator('#mouse-look').evaluate(e => e === document.activeElement), true);
    await sleep(350); const stopped = (await metrics(a)).position; await sleep(300); const still = (await metrics(a)).position;
    assert.ok(Math.hypot(still.x - stopped.x, still.z - stopped.z) < 0.05);
    note('real capture hides the dashboard, resizes rendering, supports mouse X/Y/clamps, and Escape restores focus and stops movement');
  }
  else note('mouse capture fallback remains usable', { pointerLock: 'not available in this browser session' });
  await a.locator('#world-canvas').focus(); await a.keyboard.down('ArrowLeft'); await sleep(300); await a.keyboard.up('ArrowLeft');
  await until(async () => { const state = await metrics(a); const delta = state.position.facing - state.yaw; return Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta))) < 1e-6; });
  await a.locator('#save-button').click(); await until(() => a.locator('#save-button').isEnabled());
  const confirmed = await savedProfile(a);
  await a.reload(); await a.locator('#resume-button').click(); await a.locator('#arrival').waitFor({ state: 'hidden' });
  const resumed = await savedProfile(a); assert.deepEqual(resumed.location, confirmed.location); assert.equal(resumed.color, '#b5a2ff');
  note('reload resumes confirmed world, exact position, facing and appearance');
  await b.close(); await until(async () => (await request(host, '/healthz')).data.clients === 1); assert.equal((await a.evaluate(() => window.__oasisMetrics())).connected, true);
  note('closing one browser leaves the server and other visitor connected');
  const restartPort = Number(new URL(host.base).port); await a.locator('#mouse-look').click();
  await host.stop(true); await a.locator('#reconnect').waitFor({ state: 'visible' });
  await until(() => a.evaluate(() => document.pointerLockElement === null));
  await a.locator('#dashboard').waitFor({ state: 'visible' });
  host = await startHost(directory, { port: restartPort }); await a.locator('#reconnect').click(); await until(() => a.evaluate(() => window.__oasisMetrics().connected));
  assert.deepEqual((await savedProfile(a)).location, resumed.location); note('browser recovers acknowledged state after a forced server restart');
  await sleep(1500);
  const fpsSamples = [];
  for (let i = 0; i < 5; i++) { await sleep(1000); fpsSamples.push((await a.evaluate(() => window.__oasisMetrics())).fps); }
  const rendering = await a.evaluate(() => { const canvas = document.querySelector('canvas'); const gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); const info = gl?.getExtension('WEBGL_debug_renderer_info'); return { ...window.__oasisMetrics(), renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'not reported', viewport: [innerWidth, innerHeight], horizontalOverflow: document.documentElement.scrollWidth > innerWidth }; });
  assert.equal(rendering.horizontalOverflow, false);
  const medianFPS = [...fpsSamples].sort((x, y) => x - y)[2];
  const enforceFPS = !process.env.CI || process.env.OASIS_ENFORCE_FPS === '1';
  if (enforceFPS) assert.ok(medianFPS >= 30, `Median rendered FPS ${medianFPS} did not meet 30.`);
  note(enforceFPS ? '1280×720 rendering meets the 30 FPS target in the tested browser' : 'CI renderer performance recorded; target hardware gate is separate', { ...rendering, fpsSamples, medianFPS, performanceGateEnforced: enforceFPS });
  for (const world of Object.values(WORLDS)) for (const portal of world.portals) for (const sign of [-1, 1]) {
    const gate = await seededPage(world.id, portal.x, portal.z + sign * 2);
    await gate.locator('#portal-hint').getByText(WORLDS[portal.target].name, { exact: false }).waitFor();
    const key = sign > 0 ? 'w' : 's'; await gate.keyboard.down(key);
    await until(async () => (await metrics(gate)).world === portal.target); await gate.keyboard.up(key);
    await sleep(350); assert.equal((await savedProfile(gate)).location.worldId, portal.target);
    const position = (await metrics(gate)).position;
    assert.ok(Math.hypot(position.x, position.z - 8) < 0.1, 'held movement must clear at travel');
    await closeVisitor(gate);
  }
  note('every built-in portal travels once in both directions with confirmed saves and cleared movement');
  const inside = await seededPage('hub', -9, -9, 'Inside Portal');
  await sleep(200); assert.equal((await metrics(inside)).world, 'hub');
  await holdKey(inside, 's', 500); await inside.keyboard.down('w');
  await until(async () => (await metrics(inside)).world === 'island'); await inside.keyboard.up('w');
  await closeVisitor(inside);
  const beside = await seededPage('hub', -7.3, -7);
  await holdKey(beside, 'w', 850); assert.equal((await metrics(beside)).world, 'hub');
  await travel(beside, 'observatory'); await closeVisitor(beside);
  note('resume inside waits for exit/re-entry; passing a pillar does not travel; menu travel remains available');
  const failed = await seededPage('hub', -9, -7, 'Failed Portal');
  const original = await savedProfile(failed); const db = new DatabaseSync(path.join(directory, 'oasis.sqlite'));
  try {
    db.exec(`CREATE TRIGGER fail_portal BEFORE UPDATE ON profiles WHEN OLD.id='${original.id}' BEGIN SELECT RAISE(ABORT, 'test write failure'); END;`);
    const beforeFailures = await portalFailures();
    await failed.keyboard.down('w'); await until(async () => await portalFailures() === beforeFailures + 1); await failed.keyboard.up('w');
    assert.deepEqual((await savedProfile(failed)).location, original.location);
    await sleep(250); assert.equal(await portalFailures(), beforeFailures + 1);
    db.exec('DROP TRIGGER fail_portal');
    await sleep(250); assert.equal((await metrics(failed)).world, 'hub');
    await holdKey(failed, 's', 500); await failed.keyboard.down('w');
    await until(async () => (await metrics(failed)).world === 'island'); await failed.keyboard.up('w');
  } finally { db.exec('DROP TRIGGER IF EXISTS fail_portal'); db.close(); await closeVisitor(failed); }
  await until(async () => (await request(host, '/healthz')).data.clients === 1);
  note('failed portal save retains the confirmed record and suppresses retry until exit/re-entry');
  const denied = await pageFor();
  await denied.addInitScript(() => { HTMLCanvasElement.prototype.requestPointerLock = () => Promise.reject(new Error('Test capture denial')); });
  await enter(denied, 'Capture Denied'); await denied.locator('#mouse-look').click(); await denied.locator('#notice').getByText('Mouse capture was unavailable.', { exact: false }).waitFor();
  assert.equal(await denied.locator('#dashboard').isVisible(), true); assert.equal(await denied.locator('body').evaluate(e => e.classList.contains('mouse-mode')), false);
  assert.equal(await denied.locator('#play-notice').evaluate(e => e.getAttribute('role') === 'status' && getComputedStyle(e).display !== 'none'), true);
  await holdButton(denied, '[data-look="up"]'); await denied.close();
  note('capture denial retains the visible accessible dashboard and view controls');
  const blocked = await pageFor({ reducedMotion: 'reduce' });
  await blocked.addInitScript(() => { Storage.prototype.setItem = function () { throw new Error('Test blocked storage'); }; });
  await enter(blocked, 'Storage Test'); await blocked.locator('#session-warning').waitFor({ state: 'visible' });
  assert.match(await blocked.locator('#session-warning').textContent(), /cannot be resumed/); note('blocked profile storage produces a persistent warning'); await blocked.close();
  const interrupted = await pageFor();
  let failOnce = true;
  await interrupted.route('**/api/profile', route => { if (failOnce) { failOnce = false; return route.abort(); } return route.continue(); });
  await interrupted.goto(host.base); await until(async () => !!(await interrupted.locator('#invite').inputValue())); await interrupted.locator('#nickname').fill('Retry Test'); await interrupted.locator('#enter-button').click();
  await until(() => !failOnce); await until(async () => (await request(host, '/healthz')).data.clients === 1);
  await interrupted.reload(); await interrupted.locator('#resume-button').click(); await interrupted.locator('#arrival').waitFor({ state: 'hidden' });
  note('failed post-join fetch releases the session and permits retry'); await interrupted.close();
  const raced = await pageFor();
  await raced.addInitScript(() => { const NativeSocket = window.WebSocket; window.WebSocket = class extends NativeSocket { constructor(...args) { super(...args); window.__testSocket = this; } }; });
  let releaseProfile, held = false, delayOnce = true;
  await raced.route('**/api/profile', async route => {
    if (!delayOnce) return route.continue();
    delayOnce = false; const response = await route.fetch(); held = true;
    await new Promise(resolve => { releaseProfile = resolve; }); await route.fulfill({ response });
  });
  await raced.goto(host.base); await until(async () => !!(await raced.locator('#invite').inputValue())); await raced.locator('#nickname').fill('Arrival Race'); await raced.locator('#enter-button').click();
  await until(() => held); await raced.evaluate(() => window.__testSocket.close());
  await until(async () => (await request(host, '/healthz')).data.clients === 1); releaseProfile();
  await until(() => raced.locator('#resume-button').isEnabled()); assert.equal((await raced.evaluate(() => window.__oasisMetrics())).connected, false);
  await raced.reload(); await raced.locator('#resume-button').click(); await raced.locator('#arrival').waitFor({ state: 'hidden' });
  note('disconnect during delayed arrival cannot enable a stale session'); await raced.close();
  assert.deepEqual(errors, [], `Unexpected browser errors: ${errors.join('; ')}`);
  note('no unexpected page or console errors in the primary browser');
  await writeFile(path.join(artifacts, 'browser-report.json'), JSON.stringify({ status: 'passed', at: new Date().toISOString(), revision: rendering.revision, browser: browser.version(), checks, errors, gaps: ['two physical computers on LAN', 'physical device and assistive technology coverage', '24-hour soak completion'] }, null, 2));
} catch (error) {
  await writeFile(path.join(artifacts, 'browser-report.json'), JSON.stringify({ status: 'failed', at: new Date().toISOString(), browser: browser.version(), checks, errors, failure: error.message }, null, 2));
  throw error;
} finally { for (const context of contexts) await context.close(); await browser.close(); await host.stop(); }
