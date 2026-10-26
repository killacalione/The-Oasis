import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server, matchMaker, createAuthContext } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Store, BoundedLog } from './store.js';
import { roomType } from './room.js';
import { WORLDS, COLORS, spawn, validLocation } from '../shared/worlds.js';
declare const __OASIS_REVISION__: string;

export const privateBind = (host: string) => host === '127.0.0.1' || (isIP(host) === 4 && (/^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(?:1[6-9]|2\d|3[01])\./.test(host)));
export async function startPilot() {
  if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Use Node 24 for the LAN pilot.');
  const host = process.env.OASIS_BIND || '127.0.0.1';
  const port = Number(process.env.OASIS_PORT || 2567);
  if (!privateBind(host)) throw new Error('OASIS_BIND must be loopback or one explicit private IPv4 address. Wildcard/public binds are not supported.');
  if (!Number.isSafeInteger(port) || port < 0 || port > 65535) throw new Error('Invalid OASIS_PORT.');
  const directory = path.resolve(process.env.OASIS_DATA_DIR || '.local/lan-pilot');
  const assets = fileURLToPath(new URL('../client/', import.meta.url));
  const store = new Store(directory);
  const log = new BoundedLog(directory);
  const inviteFile = path.join(directory, 'invite.txt');
  if (!existsSync(inviteFile)) writeFileSync(inviteFile, randomBytes(16).toString('hex'), { mode: 0o600 });
  const invite = process.env.OASIS_INVITE || readFileSync(inviteFile, 'utf8').trim();
  if (!/^[A-Za-z0-9_-]{12,128}$/.test(invite)) throw new Error('Invitation code must contain 12–128 letters, digits, underscores or hyphens.');
  const inviteValid = (candidate: unknown) => typeof candidate === 'string' && Buffer.byteLength(candidate) === Buffer.byteLength(invite) && timingSafeEqual(Buffer.from(candidate), Buffer.from(invite));
  const metrics = { rejected: 0, saveFailures: 0 };
  const origins = new Set<string>();
  let ready = false;
  let roomId = '';
  let base = '';
  const started = Date.now();
  const http = createServer({ maxHeaderSize: 8192 });
  http.requestTimeout = 10000; http.headersTimeout = 10000;
  const game = new Server({
    greet: false, gracefullyShutdown: false,
    logger: { debug() {}, info() {}, warn() { log.write('framework_warning'); }, error() { log.write('framework_error'); } },
    transport: new WebSocketTransport({ server: http, maxPayload: 2048, beforeUpgrade: (request, context) => {
      if (!origins.has(context.headers.get('origin') || '') || !validHost(request.headers.get('host'))) return new Response(null, { status: 403 });
    } })
  });
  const validHost = (header: string | null | undefined) => !!header && origins.has(`http://${header}`);
  game.define('oasis', roomType(store, log, metrics));
  // Boot matchmaking without listening. Replace its public HTTP surface with the
  // single bounded join route below before opening a network socket.
  await game.serverless();
  base = `http://${host}:${port}`;
  roomId = (await matchMaker.createRoom('oasis', {})).roomId;
  http.removeAllListeners('request');
  const rates = new Map<string, { at: number; count: number }>();
  const json = (res: ServerResponse, status: number, data: unknown) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
  const tokenOf = (req: IncomingMessage) => req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
  async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
    if (!req.headers['content-type']?.startsWith('application/json')) throw new Error('Send JSON.');
    let size = 0; const chunks: Buffer[] = [];
    for await (const chunk of req) { size += chunk.length; if (size > 4096) throw new Error('Request too large.'); chunks.push(chunk); }
    const value = JSON.parse(Buffer.concat(chunks).toString());
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid request.');
    return value;
  }
  http.on('request', (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' ${[...origins].map(origin => origin.replace(/^http:/, 'ws:')).join(' ')}; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`);
    if (!validHost(req.headers.host) || (req.headers.origin && !origins.has(req.headers.origin))) return json(res, 403, { error: 'Origin or host is not permitted.' });
    if (req.method === 'POST' && !origins.has(req.headers.origin || '')) return json(res, 403, { error: 'A same-origin request is required.' });
    let route: string;
    try { route = new URL(req.url || '/', base).pathname; } catch { return json(res, 400, { error: 'Invalid request target.' }); }
    if (Number(req.headers['content-length'] || 0) > 4096) return json(res, 413, { error: 'Request too large.' });
    if (req.method === 'POST') {
      const key = req.socket.remoteAddress || 'unknown'; const now = Date.now();
      const rate = rates.get(key) ?? { at: now, count: 0 };
      if (now - rate.at > 60000) { rate.at = now; rate.count = 0; }
      rates.set(key, rate);
      if (++rate.count > 100) return json(res, 429, { error: 'Please wait before retrying.' });
    }
    if (route.startsWith('/matchmake/')) {
      if (req.method !== 'POST' || route !== `/matchmake/joinById/${roomId}`) return json(res, 403, { error: 'Only the fixed pilot session is available.' });
      void (async () => {
        const data = await body(req);
        if (Object.keys(data).join(',') !== 'token' || !store.authenticate(data.token)) return json(res, 401, { error: 'Test profile not recognized.' });
        const seat = await matchMaker.joinById(roomId, data, createAuthContext({ headers: new Headers({ origin: req.headers.origin || '', host: req.headers.host || '' }), remoteAddress: req.socket.remoteAddress }));
        json(res, 200, seat);
      })().catch((error: unknown) => json(res, 400, { code: (error as { code?: number }).code || 400, error: 'The pilot is full or this session is unavailable. Wait and retry.' }));
      return;
    }
    void (async () => {
      if (req.method === 'GET' && (route === '/healthz' || route === '/readyz')) {
        const healthy = ready && store.healthy();
        const storageBytes = ['', '-wal', '-shm'].reduce((sum, suffix) => { try { return sum + statSync(store.file + suffix).size; } catch { return sum; } }, 0);
        return json(res, healthy ? 200 : 503, { status: healthy ? 'ready' : 'unavailable', milestone: 'LV1', revision: __OASIS_REVISION__, node: process.versions.node, uptimeSeconds: Math.floor((Date.now() - started) / 1000), clients: (await matchMaker.query({ name: 'oasis' })).reduce((sum, room) => sum + room.clients, 0), capacity: 5, memory: process.memoryUsage(), cpu: process.cpuUsage(), storageBytes, metrics: { ...metrics, logFailures: log.failures } });
      }
      if (req.method === 'GET' && route === '/api/config') return json(res, 200, { roomId, capacity: 5, worlds: Object.values(WORLDS).map(({ id, name, subtitle }) => ({ id, name, subtitle })), colors: COLORS, revision: __OASIS_REVISION__ });
      if (req.method === 'GET' && route === '/api/host-invite') {
        if (host !== '127.0.0.1' || req.socket.remoteAddress !== '127.0.0.1') return json(res, 403, { error: 'Ask your host for an invitation code.' });
        return json(res, 200, { invite });
      }
      if (req.method === 'POST' && route === '/api/profiles') {
        const data = await body(req);
        if (Object.keys(data).sort().join(',') !== 'color,invite,name' || !inviteValid(data.invite)) return json(res, 403, { error: 'A valid host invitation is required.' });
        return json(res, 201, store.create(String(data.name), String(data.color)));
      }
      if (req.method === 'GET' && route === '/api/profile') {
        const profile = store.authenticate(tokenOf(req));
        if (!profile) return json(res, 401, { error: 'Test profile not recognized.' });
        return json(res, 200, { profile, canResume: validLocation(profile.location) });
      }
      if (req.method === 'POST' && route === '/api/recover-hub') {
        const profile = store.authenticate(tokenOf(req));
        if (!profile) return json(res, 401, { error: 'Test profile not recognized.' });
        const data = await body(req);
        if (Object.keys(data).join(',') !== 'confirm' || data.confirm !== true) return json(res, 400, { error: 'Explicit recovery confirmation is required.' });
        // Only unavailable saves use this offline path; live players travel through the room.
        if (validLocation(profile.location)) return json(res, 409, { error: 'Resume is available. Return to Hub from the connected dashboard.' });
        return json(res, 200, { profile: store.save(profile, spawn('hub')), canResume: true });
      }
      const allowed: Record<string, [string, string]> = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'], '/app.css': ['app.css', 'text/css; charset=utf-8'], '/app.js.LEGAL.txt': ['app.js.LEGAL.txt', 'text/plain; charset=utf-8'] };
      const asset = allowed[route];
      if ((req.method !== 'GET' && req.method !== 'HEAD') || !asset) return json(res, 404, { error: 'Not found.' });
      const bytes = await readFile(path.join(assets, asset[0]));
      res.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-store', 'Content-Length': bytes.length }); res.end(req.method === 'HEAD' ? undefined : bytes);
    })().catch(() => { if (!res.headersSent) json(res, 400, { error: 'The request could not be completed. Check the input and retry.' }); else res.end(); });
  });
  await new Promise<void>((resolve, reject) => { http.once('error', reject); http.listen(port, host, () => { http.off('error', reject); resolve(); }); });
  const actualPort = (http.address() as { port: number }).port;
  base = `http://${host}:${actualPort}`;
  origins.add(base);
  if (host === '127.0.0.1') origins.add(`http://localhost:${actualPort}`);
  ready = true;
  log.write('started', { revision: __OASIS_REVISION__, node: process.versions.node, bind: host, port: actualPort });
  const monitor = setInterval(() => {
    log.write('sample', { uptimeSeconds: Math.floor((Date.now() - started) / 1000), memory: process.memoryUsage(), cpu: process.cpuUsage(), metrics });
    for (const [key, rate] of rates) if (Date.now() - rate.at > 60000) rates.delete(key);
  }, 60000);
  let backupPromise: Promise<void> | null = null;
  const backUp = (): Promise<void> => {
    if (backupPromise) return backupPromise;
    backupPromise = (async () => { try { await store.backup(); log.write('backup_completed'); } catch { log.write('backup_failed'); } finally { backupPromise = null; } })();
    return backupPromise;
  };
  const backupTimer = setInterval(() => { void backUp(); }, 24 * 60 * 60 * 1000);
  let closePromise: Promise<void> | null = null;
  const close = (): Promise<void> => {
    if (closePromise) return closePromise;
    closePromise = (async () => {
      ready = false; clearInterval(monitor); clearInterval(backupTimer);
      await game.gracefullyShutdown(false);
      await backUp(); store.close(); log.write('stopped');
    })();
    return closePromise;
  };
  process.once('SIGINT', () => { void close().then(() => process.exit(0)); });
  process.once('SIGTERM', () => { void close().then(() => process.exit(0)); });
  process.on('message', message => { if (message && typeof message === 'object' && (message as { type?: string }).type === 'shutdown') void close().then(() => process.exit(0)); });
  console.log(`The Oasis LV1: ${base}\nPrivate test profiles only. Host invitation: ${path.relative(process.cwd(), inviteFile)}\nRuntime: Node ${process.versions.node}; revision ${__OASIS_REVISION__}`);
  return { http, game, store, close, base, roomId };
}
await startPilot();
