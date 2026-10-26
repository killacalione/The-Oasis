import { DatabaseSync, backup } from 'node:sqlite';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, existsSync, openSync, closeSync, writeFileSync, readFileSync, unlinkSync, readdirSync, statSync, renameSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { COLORS, spawn, validLocation, type Location } from '../shared/worlds.js';
import type { Profile } from '../shared/contracts.js';
export type { Profile } from '../shared/contracts.js';

type Row = { id: string; name: string; color: string; location: string; revision: number; updated_at: string };
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export function profileFromRow(row: Row): Profile {
  let location: unknown = null;
  try { location = JSON.parse(row.location); } catch { /* Preserve the raw database record until explicit recovery. */ }
  return { id: row.id, name: row.name, color: row.color, location: location as Location, revision: row.revision, updatedAt: row.updated_at };
}
export class Store {
  readonly db: DatabaseSync;
  readonly file: string;
  private lock: string;
  constructor(readonly directory: string) {
    mkdirSync(directory, { recursive: true });
    this.file = path.join(directory, 'oasis.sqlite');
    this.lock = path.join(directory, 'server.lock');
    if (existsSync(this.lock)) {
      const pid = Number(readFileSync(this.lock, 'utf8'));
      let running = true;
      try { process.kill(pid, 0); } catch (error) { running = (error as NodeJS.ErrnoException).code !== 'ESRCH'; }
      if (running || !Number.isSafeInteger(pid) || pid <= 0) throw new Error('The data directory is already in use or has an invalid lock. Follow the recovery runbook.');
      unlinkSync(this.lock);
    }
    const fd = openSync(this.lock, 'wx');
    writeFileSync(fd, String(process.pid)); closeSync(fd);
    try {
      this.db = new DatabaseSync(this.file, { timeout: 5000 });
      this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;');
      const version = Number((this.db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version);
      if (version > 1) throw new Error('Database version is newer than this pilot.');
      this.db.exec(`CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
        color TEXT NOT NULL, location TEXT NOT NULL, revision INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      ); PRAGMA user_version=1;`);
    } catch (error) { unlinkSync(this.lock); throw error; }
  }
  create(name: string, color: string): { token: string; profile: Profile } {
    if (!/^[A-Za-z0-9 _-]{2,20}$/.test(name) || !(COLORS as readonly string[]).includes(color)) throw new Error('Choose a 2–20 character nickname and an available color.');
    const count = Number((this.db.prepare('SELECT count(*) AS count FROM profiles').get() as { count: number }).count);
    if (count >= 50) throw new Error('This pilot has reached its 50-profile limit.');
    const token = randomBytes(32).toString('hex');
    const profile: Profile = { id: randomUUID(), name, color, location: { ...spawn('hub'), x: (count % 5 - 2) * 1.8 }, revision: 1, updatedAt: new Date().toISOString() };
    this.db.prepare('INSERT INTO profiles VALUES (?, ?, ?, ?, ?, ?, ?)').run(profile.id, hashToken(token), name, color, JSON.stringify(profile.location), profile.revision, profile.updatedAt);
    return { token, profile };
  }
  authenticate(token: unknown): Profile | null {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null;
    const row = this.db.prepare('SELECT id,name,color,location,revision,updated_at FROM profiles WHERE token_hash=?').get(hashToken(token)) as Row | undefined;
    return row ? profileFromRow(row) : null;
  }
  save(profile: Profile, location: Location, color = profile.color): Profile {
    if (!validLocation(location) || !(COLORS as readonly string[]).includes(color)) throw new Error('Invalid saved state.');
    const updatedAt = new Date().toISOString();
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = this.db.prepare('UPDATE profiles SET location=?, color=?, revision=revision+1, updated_at=? WHERE id=? AND revision=?').run(JSON.stringify(location), color, updatedAt, profile.id, profile.revision);
      if (result.changes !== 1) throw new Error('Save revision conflict. Reconnect before changing this profile.');
      this.db.exec('COMMIT');
      return { ...profile, color, location: { ...location }, revision: profile.revision + 1, updatedAt };
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  healthy(): boolean { return Number((this.db.prepare('SELECT 1 AS ok').get() as { ok: number }).ok) === 1; }
  async backup(): Promise<string> {
    const dir = path.join(this.directory, 'backups'); mkdirSync(dir, { recursive: true });
    const destination = path.join(dir, `oasis-${new Date().toISOString().replaceAll(/[:.]/g, '-')}-${randomBytes(3).toString('hex')}.sqlite`);
    await backup(this.db, destination);
    finishBackup(destination);
    const files = readdirSync(dir).filter(name => /^oasis-[\dTZ-]+-[a-f0-9]{6}\.sqlite$/.test(name)).sort();
    for (const old of files.slice(0, -14)) unlinkSync(path.join(dir, old));
    return destination;
  }
  close() { this.db.close(); if (existsSync(this.lock) && readFileSync(this.lock, 'utf8') === String(process.pid)) unlinkSync(this.lock); }
}
export function finishBackup(file: string): number {
  // The completed snapshot has no live writers. Make it a standalone file,
  // rather than retaining WAL/SHM sidecars next to each retained backup.
  const db = new DatabaseSync(file);
  try { db.exec('PRAGMA journal_mode=DELETE;'); } finally { db.close(); }
  return validateBackup(file);
}
export function validateBackup(file: string): number {
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    if ((db.prepare('PRAGMA quick_check').get() as { quick_check: string }).quick_check !== 'ok') throw new Error('Backup integrity check failed.');
    if ((db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version !== 1) throw new Error('Unsupported backup schema.');
    const rows = db.prepare('SELECT id,name,color,location,revision,updated_at FROM profiles').all() as Row[];
    for (const row of rows) { const profile = profileFromRow(row); if (!validLocation(profile.location) || !Number.isSafeInteger(profile.revision) || profile.revision < 1) throw new Error('Backup contains an invalid profile.'); }
    return rows.length;
  } finally { db.close(); }
}
export class BoundedLog {
  failures = 0;
  constructor(private directory: string) { mkdirSync(directory, { recursive: true }); }
  write(event: string, details: Record<string, unknown> = {}) {
    try {
    const file = path.join(this.directory, 'pilot.log');
    if (existsSync(file) && statSync(file).size > 1024 * 1024) {
      const oldest = `${file}.3`; if (existsSync(oldest)) unlinkSync(oldest);
      for (let i = 2; i >= 1; i--) if (existsSync(`${file}.${i}`)) renameSync(`${file}.${i}`, `${file}.${i + 1}`);
      renameSync(file, `${file}.1`);
    }
    appendFileSync(file, JSON.stringify({ at: new Date().toISOString(), event, ...details }) + '\n');
    } catch { this.failures++; /* Logging must not turn a committed save into a failed action. */ }
  }
}
