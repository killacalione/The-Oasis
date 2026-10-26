import { DatabaseSync, backup } from 'node:sqlite';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { validateBackup, finishBackup } from './store.js';
const args = process.argv.slice(2);
const get = (key: string) => { const i = args.indexOf(key); return i >= 0 ? args[i + 1] : undefined; };
const command = args[0];
if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Use Node 24.');
if (command === 'backup') {
  const directory = path.resolve(get('--data-dir') || process.env.OASIS_DATA_DIR || '.local/lan-pilot');
  const source = path.join(directory, 'oasis.sqlite');
  if (!existsSync(source)) throw new Error('No existing pilot database to back up.');
  const output = path.resolve(get('--output') || path.join(directory, 'backups', `manual-${Date.now()}.sqlite`));
  if (existsSync(output)) throw new Error('Backup destination already exists; choose a new file.');
  mkdirSync(path.dirname(output), { recursive: true });
  const db = new DatabaseSync(source, { readOnly: true });
  try { await backup(db, output); } finally { db.close(); }
  console.log(JSON.stringify({ backup: output, profiles: finishBackup(output), integrity: 'ok' }));
} else if (command === 'restore') {
  const source = get('--from'), destination = get('--into');
  if (!source || !destination) throw new Error('Use restore --from BACKUP --into EMPTY_DIRECTORY. The original database is never overwritten.');
  const input = path.resolve(source), directory = path.resolve(destination);
  const count = validateBackup(input);
  if (existsSync(directory) && readdirSync(directory).length) throw new Error('Restore requires an empty, separate directory.');
  mkdirSync(directory, { recursive: true });
  const db = new DatabaseSync(input, { readOnly: true });
  try { await backup(db, path.join(directory, 'oasis.sqlite')); } finally { db.close(); }
  validateBackup(path.join(directory, 'oasis.sqlite'));
  console.log(JSON.stringify({ restored: directory, profiles: count, integrity: 'ok' }));
} else throw new Error('Choose backup or restore.');
