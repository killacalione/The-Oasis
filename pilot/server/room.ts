import { Room, ServerError, type Client, type AuthContext } from '@colyseus/core';
import { schema, t, type SchemaType } from '@colyseus/schema';
import { COLORS, WORLDS, isWorldId, spawn, stepMovement, validLocation, type Location } from '../shared/worlds.js';
import type { Store, Profile, BoundedLog } from './store.js';
import type { MovementInput } from '../shared/contracts.js';

const PlayerState = schema({ name: t.string(), color: t.string(), worldId: t.string(), x: t.number(), y: t.number(), z: t.number(), facing: t.number() }, 'OasisPlayer');
const HubState = schema({ players: t.map(PlayerState) }, 'OasisHub');
type HubState = SchemaType<typeof HubState>;
type Input = MovementInput & { at: number };
const keysExactly = (value: unknown, keys: string[]): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === keys.length && Object.keys(value).every(key => keys.includes(key));
const requestIdValid = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id);

export function roomType(store: Store, log: BoundedLog, metrics: { rejected: number; saveFailures: number }, capacity = 5) {
  return class OasisRoom extends Room<{ state: HubState }> {
    state = new HubState();
    maxClients = capacity;
    autoDispose = false;
    private profiles = new Map<string, Profile>();
    private pendingProfiles = new Set<string>();
    private movementInputs = new Map<string, Input>();
    private lastSequences = new Map<string, number>();
    private requests = new Map<string, Map<string, { fingerprint: string; response: Record<string, unknown> }>>();
    private rates = new Map<string, { since: number; count: number }>();
    onCreate() {
      this.patchRate = 50;
      this.onMessage('move', (client, message) => this.move(client, message));
      this.onMessage('command', (client, message) => this.command(client, message));
      this.onMessage('*', (client) => { if (this.allow(client)) this.reject(client, 'unknown-message', 'Unsupported action.'); });
      this.setSimulationInterval(dt => this.tick(dt / 1000), 50);
      this.clock.setInterval(() => { for (const client of this.clients) this.checkpoint(client); }, 5000);
    }
    onAuth(_client: Client, options: Record<string, unknown>, _context: AuthContext) {
      const profile = store.authenticate(options?.token);
      if (!profile) throw new ServerError(401, 'This test profile is not recognized.');
      if (!validLocation(profile.location)) throw new ServerError(409, 'Resume is unavailable. Choose explicit Hub recovery; the saved record has been preserved.');
      if ([...this.profiles.values()].some(item => item.id === profile.id) || this.pendingProfiles.has(profile.id)) throw new ServerError(409, 'This profile is already connected. Close its other tab, then retry.');
      this.pendingProfiles.add(profile.id);
      return profile;
    }
    onJoin(client: Client, _options: unknown, auth: Profile) {
      this.pendingProfiles.delete(auth.id);
      this.profiles.set(client.sessionId, auth);
      this.requests.set(client.sessionId, new Map());
      this.state.players.set(client.sessionId, new PlayerState({ name: auth.name, color: auth.color, ...auth.location }));
      log.write('joined', { connected: this.clients.length });
    }
    private reject(client: Client, code: string, message: string, requestId?: string) {
      metrics.rejected++;
      client.send('problem', { code, message, ...(requestId ? { requestId } : {}) });
    }
    private allow(client: Client, max = 70): boolean {
      const now = Date.now();
      const rate = this.rates.get(client.sessionId) ?? { since: now, count: 0 };
      if (now - rate.since > 1000) { rate.since = now; rate.count = 0; }
      this.rates.set(client.sessionId, rate);
      if (++rate.count > max) { if (rate.count === max + 1) this.reject(client, 'rate-limit', 'Too many actions. Please wait.'); return false; }
      return true;
    }
    private move(client: Client, value: unknown) {
      if (!this.allow(client)) return;
      if (!keysExactly(value, ['seq', 'dx', 'dz', 'facing']) || !Number.isSafeInteger(value.seq) || Number(value.seq) < 0 || ![value.dx, value.dz, value.facing].every(v => typeof v === 'number' && Number.isFinite(v)) || Math.abs(Number(value.dx)) > 1 || Math.abs(Number(value.dz)) > 1 || Math.abs(Number(value.facing)) > Math.PI) return this.reject(client, 'invalid-movement', 'Movement was rejected.');
      const previous = this.lastSequences.get(client.sessionId);
      if (previous !== undefined && Number(value.seq) <= previous) return this.reject(client, 'stale-input', 'Stale movement was ignored.');
      this.lastSequences.set(client.sessionId, Number(value.seq));
      this.movementInputs.set(client.sessionId, { seq: Number(value.seq), dx: Number(value.dx), dz: Number(value.dz), facing: Number(value.facing), at: Date.now() });
    }
    private tick(dt: number) {
      for (const [session, input] of this.movementInputs) {
        if (Date.now() - input.at > 250) continue;
        const player = this.state.players.get(session);
        const profile = this.profiles.get(session);
        if (!player || !profile) continue;
        const next = stepMovement({ ...profile.location, worldId: player.worldId as Location['worldId'], x: player.x, y: player.y, z: player.z, facing: player.facing }, input, dt);
        player.assign({ x: next.x, y: next.y, z: next.z, facing: next.facing });
      }
    }
    private current(client: Client): Location {
      const profile = this.profiles.get(client.sessionId)!;
      const p = this.state.players.get(client.sessionId)!;
      return { ...profile.location, worldId: p.worldId as Location['worldId'], x: p.x, y: p.y, z: p.z, facing: p.facing };
    }
    private snapshot(client: Client, profile: Profile) { client.send('saved', { profile, confirmed: true }); }
    private checkpoint(client: Client, force = false, requestId?: string): Profile | null {
      const profile = this.profiles.get(client.sessionId);
      if (!profile) return null;
      const location = this.current(client);
      if (!force && JSON.stringify(location) === JSON.stringify(profile.location)) return profile;
      try {
        const saved = store.save(profile, location);
        this.profiles.set(client.sessionId, saved); this.snapshot(client, saved); return saved;
      } catch { metrics.saveFailures++; this.reject(client, 'save-failed', 'Saving failed. Your last confirmed record is preserved. Stop moving and retry Save or reconnect.', requestId); log.write('save_failed'); return null; }
    }
    private command(client: Client, value: unknown) {
      if (!this.allow(client)) return;
      if (!value || typeof value !== 'object' || !requestIdValid((value as Record<string, unknown>).requestId)) return this.reject(client, 'invalid-command', 'Action was rejected.');
      const m = value as Record<string, unknown>;
      const id = m.requestId as string;
      const expected = m.type === 'travel' ? ['requestId', 'type', 'target'] : m.type === 'appearance' ? ['requestId', 'type', 'color'] : ['requestId', 'type'];
      if (!keysExactly(m, expected)) return this.reject(client, 'invalid-command', 'Unsupported action fields.', id);
      const cache = this.requests.get(client.sessionId)!;
      const fingerprint = JSON.stringify(m);
      const previous = cache.get(id);
      if (previous) { if (previous.fingerprint !== fingerprint) return this.reject(client, 'reused-request', 'Request identifier was already used.', id); client.send('result', previous.response); return; }
      const profile = this.profiles.get(client.sessionId)!;
      let saved: Profile | null = null;
      try {
        if (m.type === 'travel') {
          const current = this.current(client);
          if (!isWorldId(m.target) || (m.target !== 'hub' && !WORLDS[current.worldId].portals.some(portal => portal.target === m.target))) return this.reject(client, 'unavailable-world', 'This destination is unavailable; your save has not changed.', id);
          saved = store.save(profile, spawn(m.target));
          this.movementInputs.delete(client.sessionId);
          this.state.players.get(client.sessionId)!.assign(saved.location);
        } else if (m.type === 'appearance') {
          if (!(COLORS as readonly unknown[]).includes(m.color)) return this.reject(client, 'invalid-appearance', 'Choose an available avatar color.', id);
          saved = store.save(profile, this.current(client), m.color as string);
          this.state.players.get(client.sessionId)!.color = saved.color;
        } else if (m.type === 'save') { saved = this.checkpoint(client, true, id); }
        else return this.reject(client, 'invalid-command', 'Unsupported action.', id);
        if (!saved) return;
        this.profiles.set(client.sessionId, saved);
        this.snapshot(client, saved);
        const response = { requestId: id, type: m.type, revision: saved.revision, worldId: saved.location.worldId };
        cache.set(id, { fingerprint, response });
        if (cache.size > 128) cache.delete(cache.keys().next().value!);
        client.send('result', response);
      } catch { metrics.saveFailures++; this.reject(client, 'save-failed', 'The action could not be saved. Your last confirmed record is preserved.', id); log.write('command_save_failed'); }
    }
    onLeave(client: Client) {
      this.checkpoint(client);
      this.state.players.delete(client.sessionId); this.profiles.delete(client.sessionId); this.movementInputs.delete(client.sessionId); this.lastSequences.delete(client.sessionId); this.requests.delete(client.sessionId); this.rates.delete(client.sessionId);
      log.write('left', { connected: this.clients.length });
    }
  };
}
