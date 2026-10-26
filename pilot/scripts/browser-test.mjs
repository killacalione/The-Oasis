import './build.mjs';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { root, startHost, freshDirectory, request, sleep, until } from './test-helpers.mjs';
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
try {
  const a = await pageFor(), b = await pageFor();
  a.on('pageerror', error => errors.push(error.message)); a.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await a.goto(host.base); await a.locator('#invite').waitFor();
  await a.screenshot({ path: path.join(artifacts, 'arrival.png') });
  await enter(a, 'Aster'); await enter(b, 'Rowan');
  await until(async () => (await a.locator('#visitor-count').textContent()) === '2 / 5');
  note('two isolated browser profiles see shared presence');
  await a.screenshot({ path: path.join(artifacts, 'hub.png') });
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
  if (captured) { await a.keyboard.press('Escape'); await until(() => a.evaluate(() => document.pointerLockElement === null)); note('mouse capture releases with Escape'); }
  else note('mouse capture fallback remains usable', { pointerLock: 'not available in this browser session' });
  await a.locator('#world-canvas').focus(); await a.keyboard.down('ArrowLeft'); await sleep(300); await a.keyboard.up('ArrowLeft');
  await a.locator('#save-button').click(); await until(() => a.locator('#save-button').isEnabled());
  const confirmed = await savedProfile(a);
  await a.reload(); await a.locator('#resume-button').click(); await a.locator('#arrival').waitFor({ state: 'hidden' });
  const resumed = await savedProfile(a); assert.deepEqual(resumed.location, confirmed.location); assert.equal(resumed.color, '#b5a2ff');
  note('reload resumes confirmed world, exact position, facing and appearance');
  await b.close(); await until(async () => (await request(host, '/healthz')).data.clients === 1); assert.equal((await a.evaluate(() => window.__oasisMetrics())).connected, true);
  note('closing one browser leaves the server and other visitor connected');
  const restartPort = Number(new URL(host.base).port); await host.stop(true); await a.locator('#reconnect').waitFor({ state: 'visible' });
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
