import { Client, type Room } from '@colyseus/sdk';
import { COLORS, WORLDS, isWorldId, type WorldId } from '../shared/worlds.js';
import type { Profile, PilotCommand, MovementInput, SavedMessage } from '../shared/contracts.js';
import { WorldView, type VisiblePlayer } from './world-view.js';
import './app.css';
declare const __OASIS_REVISION__: string;
type Configuration = { roomId: string; capacity: number; revision: string };
type NetworkState = { players?: { forEach(callback: (value: Omit<VisiblePlayer, 'session'>, key: string) => void): void } };
const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = element<HTMLCanvasElement>('world-canvas');
const arrival = element<HTMLDialogElement>('arrival');
const form = element<HTMLFormElement>('arrival-form');
const notice = element('notice');
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-world], [data-direction], #save-button, #return-hub, #leave, #mouse-look')];
const storageKey = 'oasis-lv1-profile-key';
const colorNames = ['Seaglass', 'Amber', 'Lavender', 'Rose', 'Sky'];
let token = '';
try { token = localStorage.getItem(storageKey) || ''; } catch {}
let selectedColor: string = COLORS[0];
let room: Room<any, NetworkState> | null = null;
let profile: Profile | null = null;
let config: Configuration;
let connected = false;
let connecting = false;
let intentionalLeave = false;
let world: WorldId = 'hub';
let seq = 0;
let actionNumber = 0;
let busy = false;
let roster = '';
let view: WorldView | null = null;
const keys = new Set<string>();
const directions = new Set<string>();
const pending = new Map<string, { resolve(): void; reject(error: Error): void; timer: ReturnType<typeof setTimeout> }>();
const announce = (text: string, error = false) => { notice.textContent = text; notice.classList.toggle('error', error); };
const status = (text: string) => { element('connection-state').textContent = text; element('connection-dot').classList.toggle('online', connected); };

try { view = new WorldView(canvas); }
catch { const warning = element('graphics-error'); warning.hidden = false; warning.textContent = '3D graphics are unavailable in this browser. Try a desktop browser with hardware acceleration enabled. Your saved profile is retained.'; }
function setControls() {
  for (const button of buttons) button.disabled = !connected || busy;
  for (const button of document.querySelectorAll<HTMLButtonElement>('#wardrobe button')) button.disabled = !connected || busy;
  element<HTMLButtonElement>('reconnect').hidden = connected || !token;
}
function showWorld(id: WorldId) {
  if (world !== id) { view?.load(id); world = id; }
  const destination = WORLDS[id];
  element('scene-title').textContent = destination.name; element('scene-subtitle').textContent = destination.subtitle;
  element('world-number').textContent = id === 'hub' ? '01 / THE SHARED HUB' : id === 'island' ? '02 / A DIFFERENT HORIZON' : '03 / A LITTLE PERSPECTIVE';
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-world]')) { const active = button.dataset.world === id; button.classList.toggle('active', active); if (active) button.setAttribute('aria-current', 'location'); else button.removeAttribute('aria-current'); }
}
function updateProfile(saved: Profile) {
  profile = saved; selectedColor = saved.color;
  element('nickname-label').textContent = saved.name;
  element('save-state').textContent = 'Journey saved.';
  element('save-detail').textContent = `Confirmed ${new Date(saved.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · save ${saved.revision}`;
  for (const button of document.querySelectorAll<HTMLButtonElement>('#wardrobe button')) button.setAttribute('aria-pressed', String(button.dataset.color === saved.color));
  if (isWorldId(saved.location.worldId)) showWorld(saved.location.worldId);
}
function sync() {
  if (!room) return;
  const players: VisiblePlayer[] = [];
  room.state?.players?.forEach((p, session) => players.push({ session, name: p.name, color: p.color, worldId: p.worldId, x: p.x, y: p.y, z: p.z, facing: p.facing }));
  const own = players.find(p => p.session === room!.sessionId);
  if (own && isWorldId(own.worldId)) showWorld(own.worldId);
  view?.update(players, room.sessionId);
  element('visitor-count').textContent = `${players.length} / 5`;
  const currentRoster = JSON.stringify(players.map(p => [p.session, p.name, p.color, p.worldId]));
  if (currentRoster !== roster) {
    roster = currentRoster;
    const list = element<HTMLUListElement>('visitor-list'); list.replaceChildren();
    for (const p of players) { const li = document.createElement('li'); const dot = document.createElement('span'); dot.className = 'visitor-dot'; dot.style.backgroundColor = p.color; li.append(dot, document.createTextNode(`${p.name}${p.session === room.sessionId ? ' (you)' : ''}${p.worldId === world ? '' : ' · exploring'}`)); list.append(li); }
  }
  if (own && profile && (Math.abs(own.x - profile.location.x) > 0.02 || Math.abs(own.z - profile.location.z) > 0.02 || Math.abs(own.facing - profile.location.facing) > 0.02)) element('save-state').textContent = 'Exploring · checkpoint pending';
}
async function api(route: string, method = 'GET', body?: unknown) {
  const response = await fetch(route, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The host could not complete this request.');
  return data;
}
function action(type: PilotCommand['type'], fields: Record<string, unknown> = {}): Promise<void> {
  if (!room || !connected) return Promise.reject(new Error('Reconnect before continuing.'));
  const requestId = `a${Date.now().toString(36)}_${++actionNumber}`;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error('The host did not confirm this action. Reconnect to inspect your last confirmed save.')); }, 8000);
    pending.set(requestId, { resolve, reject, timer });
    let message: PilotCommand;
    if (type === 'travel' && isWorldId(fields.target)) message = { requestId, type, target: fields.target };
    else if (type === 'appearance' && typeof fields.color === 'string') message = { requestId, type, color: fields.color };
    else if (type === 'save') message = { requestId, type };
    else { clearTimeout(timer); pending.delete(requestId); reject(new Error('Choose an available action.')); return; }
    room!.send('command', message);
  });
}
async function perform(type: PilotCommand['type'], fields: Record<string, unknown> = {}) {
  if (busy) return;
  busy = true; keys.clear(); directions.clear(); setControls();
  try { await action(type, fields); announce(type === 'travel' ? `Welcome to ${WORLDS[fields.target as WorldId].name}.` : type === 'appearance' ? 'Your color travels with you.' : 'Your position and appearance are confirmed saved.'); }
  catch (error) { announce((error as Error).message, true); }
  finally { busy = false; setControls(); }
}
async function connect() {
  if (connecting || connected) return;
  connecting = true;
  let attempt: Room<any, NetworkState> | null = null;
  intentionalLeave = false; status('Joining your journey');
  element<HTMLButtonElement>('resume-button').disabled = true;
  try {
    config = await api('/api/config');
    const client = new Client(location.origin);
    const joined = await client.joinById<NetworkState>(config.roomId, { token });
    attempt = joined;
    room = joined;
    joined.reconnection.enabled = false; joined.reconnection.maxEnqueuedMessages = 0;
    joined.onMessage('saved', (data: SavedMessage) => { if (data.confirmed) updateProfile(data.profile); });
    joined.onMessage('result', data => { const item = pending.get(data.requestId); if (item) { clearTimeout(item.timer); pending.delete(data.requestId); item.resolve(); } });
    joined.onMessage('problem', data => { const item = pending.get(data.requestId); if (item) { clearTimeout(item.timer); pending.delete(data.requestId); item.reject(new Error(data.message)); } else announce(data.message, true); if (data.code === 'save-failed') element('save-state').textContent = 'Save failed · previous record retained'; });
    joined.onStateChange(sync);
    joined.onError((_code, message) => announce(message || 'The connection reported a problem.', true));
    joined.onLeave(() => {
      if (room !== joined) return;
      connected = false; room = null; keys.clear(); directions.clear();
      if (document.pointerLockElement === canvas) void document.exitPointerLock();
      for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error('Connection lost. Reconnect to recover the last confirmed save.')); } pending.clear();
      status(intentionalLeave ? 'Until next time' : 'Disconnected'); setControls();
      announce(intentionalLeave ? 'Your last confirmed save is ready for your return.' : 'The connection was interrupted. Your last confirmed save is retained; use Reconnect.', !intentionalLeave);
    });
    const saved = await api('/api/profile');
    if (room !== joined || !joined.connection.isOpen) throw new Error('The connection changed during arrival. Retry to resume your confirmed save.');
    updateProfile(saved.profile);
    if (view) view.yaw = saved.profile.location.facing;
    connected = true; busy = false; seq = 0;
    status('Connected to your host'); setControls(); sync();
    if (arrival.open) arrival.close();
    canvas.focus(); announce(`Welcome, ${saved.profile.name}. Explore, or choose a destination from your dashboard.`);
  } catch (error) {
    if (attempt) {
      if (room === attempt) room = null;
      if (attempt.connection.isOpen) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        try { await Promise.race([attempt.leave().catch(() => {}), new Promise(resolve => { timer = setTimeout(resolve, 1500); })]); }
        finally { if (timer) clearTimeout(timer); }
      }
    }
    connected = false;
    element('arrival-error').textContent = (error as Error).message; announce((error as Error).message, true); status('Ready when you are'); setControls();
  }
  finally { connecting = false; element<HTMLButtonElement>('resume-button').disabled = false; }
}
function makeSwatches(container: HTMLElement, arrivalChoice: boolean) {
  COLORS.forEach((color, i) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'swatch'; button.style.backgroundColor = color; button.dataset.color = color; button.setAttribute('aria-label', colorNames[i]); button.setAttribute('aria-pressed', String(color === selectedColor)); button.disabled = !arrivalChoice;
    button.addEventListener('click', () => { if (arrivalChoice) { selectedColor = color; for (const b of container.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b === button)); } else void perform('appearance', { color }); }); container.append(button); });
}
makeSwatches(element('arrival-colors'), true); makeSwatches(element('wardrobe'), false);
form.addEventListener('submit', async event => {
  event.preventDefault(); const enter = element<HTMLButtonElement>('enter-button'); enter.disabled = true; element('arrival-error').textContent = '';
  try {
    const data = await api('/api/profiles', 'POST', { name: element<HTMLInputElement>('nickname').value.trim(), color: selectedColor, invite: element<HTMLInputElement>('invite').value.trim() });
    token = data.token;
    try { localStorage.setItem(storageKey, token); } catch { const warning = element('session-warning'); warning.hidden = false; warning.textContent = 'Browser storage is unavailable. Keep this tab open; this profile cannot be resumed automatically after closing it.'; }
    await connect();
  } catch (error) { element('arrival-error').textContent = (error as Error).message; }
  finally { enter.disabled = false; }
});
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-world]')) button.addEventListener('click', () => { void perform('travel', { target: button.dataset.world }); });
element('return-hub').addEventListener('click', () => { void perform('travel', { target: 'hub' }); });
element('save-button').addEventListener('click', () => { void perform('save'); });
element('reconnect').addEventListener('click', () => { void connect(); });
element('resume-button').addEventListener('click', () => { void connect(); });
element('leave').addEventListener('click', () => { intentionalLeave = true; void room?.leave(); });
element('new-profile').addEventListener('click', () => { token = ''; try { localStorage.removeItem(storageKey); } catch {} element('resume-panel').hidden = true; form.hidden = false; element<HTMLInputElement>('nickname').focus(); });
element('recover-hub').addEventListener('click', async () => { try { const result = await api('/api/recover-hub', 'POST', { confirm: true }); updateProfile(result.profile); await connect(); } catch (error) { element('arrival-error').textContent = (error as Error).message; } });
element('mouse-look').addEventListener('click', () => { if (document.pointerLockElement === canvas) void document.exitPointerLock(); else { try { const result = canvas.requestPointerLock(); if (result) void result.catch(() => announce('Mouse capture was unavailable. Use the arrow keys to turn.')); } catch { announce('Use the arrow keys to turn your view.'); } } });
document.addEventListener('pointerlockchange', () => { element('mouse-look').textContent = document.pointerLockElement === canvas ? 'Release mouse · Escape' : 'Look around with mouse'; if (document.pointerLockElement === canvas) canvas.focus(); });
document.addEventListener('mousemove', event => { if (document.pointerLockElement === canvas && view) view.yaw -= event.movementX * 0.002; });
const relevantKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowLeft', 'ArrowRight'];
window.addEventListener('keydown', event => {
  if (event.code === 'Escape' && document.pointerLockElement === canvas) { void document.exitPointerLock(); keys.clear(); directions.clear(); return; }
  if (!connected || busy || arrival.open || (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))) return;
  if (relevantKeys.includes(event.code)) { event.preventDefault(); keys.add(event.code); }
});
window.addEventListener('keyup', event => { keys.delete(event.code); });
window.addEventListener('blur', () => { keys.clear(); directions.clear(); });
document.addEventListener('visibilitychange', () => { keys.clear(); directions.clear(); });
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-direction]')) {
  button.addEventListener('pointerdown', event => { directions.add(button.dataset.direction!); button.setPointerCapture(event.pointerId); });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, () => directions.delete(button.dataset.direction!));
  button.addEventListener('keydown', event => { if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); directions.add(button.dataset.direction!); } });
  button.addEventListener('keyup', () => directions.delete(button.dataset.direction!)); button.addEventListener('blur', () => directions.delete(button.dataset.direction!));
}
if (view) view.onFrame = () => { view!.setTurning((keys.has('ArrowLeft') ? 1 : 0) - (keys.has('ArrowRight') ? 1 : 0)); };
setInterval(() => {
  if (!room || !connected) return;
  const yaw = view?.yaw || 0;
  const forward = !busy && !document.hidden ? Number(keys.has('KeyW') || directions.has('forward')) - Number(keys.has('KeyS') || directions.has('back')) : 0;
  const strafe = !busy && !document.hidden ? Number(keys.has('KeyD') || directions.has('right')) - Number(keys.has('KeyA') || directions.has('left')) : 0;
  const dx = -Math.sin(yaw) * forward + Math.cos(yaw) * strafe;
  const dz = -Math.cos(yaw) * forward - Math.sin(yaw) * strafe;
  const length = Math.max(1, Math.hypot(dx, dz));
  const input: MovementInput = { seq: ++seq, dx: dx / length, dz: dz / length, facing: Math.atan2(Math.sin(yaw), Math.cos(yaw)) };
  room.send('move', input);
}, 50);
(window as unknown as { __oasisMetrics: () => unknown }).__oasisMetrics = () => ({ ...view?.metrics(), connected, players: element('visitor-count').textContent, world, revision: __OASIS_REVISION__ });
async function boot() {
  arrival.addEventListener('cancel', event => event.preventDefault()); arrival.showModal();
  try {
    config = await api('/api/config'); element('build-label').textContent = config.revision.slice(0, 7); status('Ready to explore');
    try { const host = await fetch('/api/host-invite'); if (host.ok) element<HTMLInputElement>('invite').value = (await host.json()).invite; } catch {}
    if (token) {
      try { const saved = await api('/api/profile'); profile = saved.profile; form.hidden = true; element('resume-panel').hidden = false; element('resume-name').textContent = `Welcome back, ${profile!.name}.`;
        element<HTMLButtonElement>('resume-button').disabled = !saved.canResume; element('recover-hub').hidden = saved.canResume;
        if (!saved.canResume) element('arrival-error').textContent = 'Your saved world is unavailable. Its record is preserved until you explicitly choose Hub recovery.';
      } catch (error) { element('arrival-error').textContent = `${(error as Error).message} You may create a new test profile.`; }
    }
  } catch { status('Host unavailable'); element('arrival-error').textContent = 'The host is unavailable. Reload this page after the server starts; your existing profile key is retained.'; }
}
void boot();
