import { mkdir, readFile, writeFile, readdir, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'artifacts/oasis-workshop');
const reference = '753ba4ffe15394f96f2dbbb6811d0fe20fee1522';
const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const idFor = file => 'file-' + slug(file);
let revision = 'unversioned', dirty = true;
try {
  revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  dirty = !!execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim();
} catch {}

async function collect(directory) {
  const found = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    if (['node_modules', '.local', '.git', 'dist', 'artifacts'].includes(entry.name)) continue;
    const relative = path.posix.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not a classroom source: ${relative}`);
    if (entry.isDirectory()) found.push(...await collect(relative));
    else if (entry.isFile()) found.push(relative);
  }
  return found.sort();
}
const files = [...await collect('docs/learning'), ...await collect('workshop'), 'LICENSE', 'NOTICE'].sort();
const documents = files.filter(file => file.endsWith('.md') && file.startsWith('docs/learning/'));
const sourceFiles = files.filter(file => file.startsWith('workshop/') && /\.(?:[cm]?js|ts|html|css|json)$/.test(file) && !file.endsWith('package-lock.json'));
const titles = new Map();
for (const file of documents) titles.set(file, (await readFile(path.join(root, file), 'utf8')).match(/^#\s+(.+)$/m)?.[1] || path.basename(file));

function destination(href, file) {
  if (/^(?:https?:|mailto:)/i.test(href)) return href;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) throw new Error(`Unsupported teaching link: ${href}`);
  const [relative, fragment] = href.split('#', 2);
  const target = relative ? path.posix.normalize(path.posix.join(path.posix.dirname(file), decodeURIComponent(relative))) : file;
  if (target.startsWith('../')) throw new Error(`Teaching link escapes the package: ${href}`);
  if (documents.includes(target)) return `#${idFor(target)}${fragment ? '--' + slug(fragment) : ''}`;
  if (sourceFiles.includes(target)) return `#${idFor(target)}`;
  if (files.includes(target)) return './' + target.split('/').map(encodeURIComponent).join('/');
  if (files.some(candidate => candidate.startsWith(target.replace(/\/$/, '') + '/'))) return './' + target.replace(/\/$/, '').split('/').map(encodeURIComponent).join('/') + '/';
  return `https://github.com/killacalione/The-Oasis/blob/${dirty ? reference : revision}/${target.split('/').map(encodeURIComponent).join('/')}${fragment ? '#' + fragment : ''}`;
}
function inline(text, file) {
  const tokens = [];
  const protect = html => `\u0000${tokens.push(html) - 1}\u0000`;
  let value = text.replace(/`([^`]+)`/g, (_, code) => protect(`<code>${escape(code)}</code>`));
  value = value.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => protect(`<a href="${escape(destination(href, file))}">${escape(label)}</a>`));
  value = escape(value).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  return value.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
}
const listItem = line => line.match(/^(\s*)([-*+] |\d+\. )(.*)$/);
const tableCells = line => line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(cell => cell.trim().replaceAll('\\|', '|'));
function markdown(text, file, headingCounts = new Map()) {
  const lines = text.replaceAll('\r\n', '\n').split('\n');
  const out = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const fence = line.match(/^\s*```(.*)$/);
    if (fence) {
      const code = []; i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) code.push(lines[i++]);
      i++; out.push(`<pre aria-label="${escape(fence[1] || 'Code example')}"><code>${escape(code.join('\n'))}</code></pre>`); continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const base = slug(heading[2]); const count = headingCounts.get(base) || 0; headingCounts.set(base, count + 1);
      const level = Math.min(6, heading[1].length + 1);
      out.push(`<h${level} id="${idFor(file)}--${base}${count ? '-' + count : ''}">${inline(heading[2], file)}</h${level}>`); i++; continue;
    }
    if (/^\s*(?:---+|\*\*\*+)\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (line.includes('|') && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] || '')) {
      const headers = tableCells(line); i += 2; const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(tableCells(lines[i++]));
      out.push(`<div class="table-wrap"><table><thead><tr>${headers.map(cell => `<th>${inline(cell, file)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${inline(cell, file)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`); continue;
    }
    const first = listItem(line);
    if (first) {
      const indent = first[1].length, ordered = /^\d/.test(first[2]), tag = ordered ? 'ol' : 'ul', items = [];
      while (i < lines.length) {
        const item = listItem(lines[i]);
        if (!item || item[1].length !== indent || /^\d/.test(item[2]) !== ordered) break;
        const content = [item[3]], contentIndent = item[1].length + item[2].length; i++;
        while (i < lines.length) {
          const next = listItem(lines[i]);
          if (next && next[1].length <= indent) break;
          if (lines[i].trim() && lines[i].match(/^\s*/)[0].length <= indent) break;
          if (!lines[i].trim() && lines[i + 1]?.trim() && (lines[i + 1].match(/^\s*/)[0].length <= indent)) { i++; break; }
          content.push(lines[i].slice(Math.min(contentIndent, lines[i].match(/^\s*/)[0].length))); i++;
        }
        items.push(`<li>${markdown(content.join('\n'), file, headingCounts)}</li>`);
      }
      out.push(`<${tag}>${items.join('')}</${tag}>`); continue;
    }
    if (/^>\s?/.test(line)) {
      const quote = []; while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${markdown(quote.join('\n'), file, headingCounts)}</blockquote>`); continue;
    }
    const paragraph = [line]; i++;
    while (i < lines.length && lines[i].trim() && !/^(?:#{1,6}\s|\s*```|>\s?|\s*---+\s*$)/.test(lines[i]) && !listItem(lines[i]) && !(lines[i].includes('|') && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] || ''))) paragraph.push(lines[i++]);
    out.push(`<p>${inline(paragraph.join(' '), file)}</p>`);
  }
  return out.join('\n');
}

await mkdir(output, { recursive: true });
const payload = [];
for (const file of files) {
  const target = path.join(output, file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(root, file), target);
  const bytes = await readFile(target); payload.push({ file, bytes });
}
const readme = 'The Oasis classroom package\n\nOpen index.html for the printable handbook. Start with docs/learning/README.md.\nThe complete source overlays live in workshop/steps.\nMaterialize a lesson into a new empty folder with Node 24.22.1:\n  node workshop/materialize.mjs --lesson 1 --into ../my-oasis-lesson-1\nNo installer or server starts automatically. Read student setup before running npm commands.\nThis is a local educational application, separate from the full LAN pilot.\n';
payload.push({ file: 'START-HERE.txt', bytes: Buffer.from(readme) });
await writeFile(path.join(output, 'START-HERE.txt'), readme);
const diagram = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 300" role="img" aria-labelledby="title desc"><title id="title">The Oasis responsibilities</title><desc id="desc">Two browsers draw their own worlds and exchange input and state with one Node HTTP and Colyseus server. The server confirms records in SQLite. The public project website is a separate static site.</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#52786c"/></marker></defs><g fill="#e4f0eb" stroke="#52786c" stroke-width="1.5"><rect x="20" y="25" width="200" height="85" rx="9"/><rect x="20" y="175" width="200" height="85" rx="9"/><rect x="340" y="85" width="250" height="120" rx="9"/><rect x="710" y="95" width="190" height="100" rx="9"/><path d="M220 67L340 120M220 217L340 170M590 145L710 145" fill="none" marker-start="url(#arrow)" marker-end="url(#arrow)"/></g><g fill="#172b35" font-family="system-ui,sans-serif" font-size="17" text-anchor="middle"><text x="120" y="57">Browser A</text><text x="120" y="84" font-size="14">Input, UI, 3D rendering</text><text x="120" y="207">Browser B</text><text x="120" y="234" font-size="14">Input, UI, 3D rendering</text><text x="465" y="122">Node + Colyseus</text><text x="465" y="150" font-size="14">Validate and simulate</text><text x="465" y="176" font-size="14">One fixed shared room</text><text x="805" y="133">SQLite</text><text x="805" y="160" font-size="14">Confirmed saves</text><text x="280" y="42" font-size="13">HTTP / WebSocket</text><text x="650" y="122" font-size="13">Transactions</text><text x="465" y="282" font-size="14">Public information website: separate static files on GitHub Pages</text></g></svg>`;
await writeFile(path.join(output, 'architecture.svg'), diagram); payload.push({ file: 'architecture.svg', bytes: Buffer.from(diagram) });
const chapterOrder = file => file.endsWith('README.md') ? 0 : file.endsWith('STUDENT.md') ? 1 : file.includes('/lessons/') ? 2 : file.endsWith('ARCHITECTURE.md') ? 3 : file.endsWith('INSTRUCTOR.md') ? 4 : file.endsWith('FOLLOW-ON.md') ? 5 : 6;
documents.sort((a, b) => chapterOrder(a) - chapterOrder(b) || a.localeCompare(b));
const chapters = [];
for (const file of documents) chapters.push(`<article id="${idFor(file)}" data-chapter="${escape(file)}">${markdown(await readFile(path.join(root, file), 'utf8'), file)}</article>`);
const sources = [];
for (const file of sourceFiles) sources.push(`<details id="${idFor(file)}"><summary>${escape(file)}</summary><pre><code>${escape(await readFile(path.join(root, file), 'utf8'))}</code></pre></details>`);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Oasis — rebuild workshop</title><style>
:root{font-family:system-ui,sans-serif;color:#172b35;background:#f5f7f7;line-height:1.6}*{box-sizing:border-box}body{margin:0}a{color:#096453}a:focus-visible,summary:focus-visible{outline:3px solid #9870ce;outline-offset:3px}header,main{max-width:1040px;margin:auto;padding:24px}header{border-bottom:2px solid #bdd5cf}header p{max-width:78ch}.meta{font-size:.85rem;color:#52636b}nav{columns:2;column-gap:32px}nav a{display:block;break-inside:avoid;margin:5px 0}article{padding:30px 0;border-bottom:1px solid #c5d3d0;scroll-margin-top:18px}article>h2:first-child{margin-top:0}h1,h2,h3,h4{line-height:1.25;max-width:48ch}h1{font-size:2.3rem}h2{font-size:1.9rem}h3{font-size:1.4rem}p,li{max-width:90ch}li>p{margin:5px 0}code{font-family:ui-monospace,Consolas,monospace;font-size:.88em;overflow-wrap:anywhere}pre{padding:16px;background:#e7efed;border:1px solid #c7d8d2;border-radius:6px;overflow:auto;tab-size:2}pre code{overflow-wrap:normal;white-space:pre}.table-wrap{max-width:100%;overflow:auto}table{border-collapse:collapse;width:100%;font-size:.92rem}th,td{text-align:left;vertical-align:top;border:1px solid #bacdc7;padding:9px}th{background:#e1ece8}blockquote{margin:20px 0;padding:8px 20px;border-left:5px solid #32846e;background:#e8f1ed}details{margin:12px 0;border:1px solid #c7d8d2;padding:10px;scroll-margin-top:18px}summary{font-family:ui-monospace,Consolas,monospace;cursor:pointer;overflow-wrap:anywhere}.source-note{font-size:.9rem}footer{padding:30px 0}.print-button{font:inherit;padding:8px 16px;border:1px solid #32846e;border-radius:6px;background:white;color:#096453;cursor:pointer}@media(max-width:650px){header,main{padding:18px}nav{columns:1}h1{font-size:1.9rem}h2{font-size:1.5rem}pre{padding:10px}}@media print{@page{margin:16mm}body{background:white;font-size:10pt}header,main{max-width:none;padding:0}.print-button{display:none}article{break-before:page;border:0}h2,h3,h4{break-after:avoid}pre{white-space:pre-wrap;overflow:visible;break-inside:auto}pre code{white-space:pre-wrap;overflow-wrap:anywhere}a{color:inherit}.table-wrap{overflow:visible}tr{break-inside:avoid}details{break-inside:auto}nav{columns:2}.appendix{break-before:page}}
</style></head><body><header><p class="meta">BEGINNER WEEKEND · LOCAL EDUCATIONAL BUILD</p><h1>Rebuilding The Oasis</h1><p>Student lessons, instructor guidance, architecture reference, complete checkpoint files and verification tasks. Keep the current world playable while preparing the next.</p><p class="meta">Pilot reference: ${reference.slice(0, 7)} · Package source: ${escape(revision)}${dirty ? ' (working tree)' : ''}. The classroom build does not complete LV1 or S1/S2 acceptance.</p><button class="print-button" type="button">Print handbook</button><nav aria-label="Handbook chapters">${documents.map(file => `<a href="#${idFor(file)}">${escape(titles.get(file))}</a>`).join('')}<a href="#source-appendix">Complete checkpoint files</a></nav></header><main>${chapters.join('\n')}<section class="appendix" id="source-appendix"><h2>Complete checkpoint files</h2><p class="source-note">Each step is a full-file overlay. Apply steps in order; a later file replaces its earlier version. Lockfiles and licenses are supplied as separate package files.</p>${sources.join('\n')}</section><footer>Original classroom code and adaptations use the included Apache-2.0 license and notices. Generated output contains no invitations, profiles, databases or local runtime tools.</footer></main><script>document.querySelector('.print-button').addEventListener('click',()=>window.print());document.addEventListener('beforeprint',()=>document.querySelectorAll('details').forEach(element=>{element.dataset.wasOpen=String(element.open);element.open=true}));document.addEventListener('afterprint',()=>document.querySelectorAll('details').forEach(element=>{element.open=element.dataset.wasOpen==='true'}));document.querySelectorAll('a[href^="#file-"]').forEach(link=>link.addEventListener('click',()=>{const target=document.getElementById(link.hash.slice(1));if(target?.tagName==='DETAILS')target.open=true}));</script></body></html>`;
await writeFile(path.join(output, 'index.html'), html);
payload.push({ file: 'index.html', bytes: Buffer.from(html) });
const manifest = { schemaVersion: 1, referenceRevision: reference, sourceRevision: revision, workingTree: dirty, documents: documents.length, sourceFiles: sourceFiles.length, files: payload.map(({ file, bytes }) => ({ path: file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') })) };
const manifestBytes = Buffer.from(JSON.stringify(manifest, null, 2) + '\n'); await writeFile(path.join(output, 'manifest.json'), manifestBytes); payload.push({ file: 'manifest.json', bytes: manifestBytes });

// ZIP store method: standard portable archive, explicit payload only, no runtime directories.
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1; return c >>> 0; });
const crc32 = bytes => { let c = 0xffffffff; for (const byte of bytes) c = crcTable[(c ^ byte) & 255] ^ c >>> 8; return (c ^ 0xffffffff) >>> 0; };
const local = [], central = []; let offset = 0;
for (const { file, bytes } of payload) {
  const name = Buffer.from('oasis-workshop/' + file), crc = crc32(bytes), header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6); header.writeUInt16LE(33, 12); header.writeUInt32LE(crc, 14); header.writeUInt32LE(bytes.length, 18); header.writeUInt32LE(bytes.length, 22); header.writeUInt16LE(name.length, 26);
  local.push(header, name, bytes);
  const directory = Buffer.alloc(46); directory.writeUInt32LE(0x02014b50); directory.writeUInt16LE(20, 4); directory.writeUInt16LE(20, 6); directory.writeUInt16LE(0x800, 8); directory.writeUInt16LE(33, 14); directory.writeUInt32LE(crc, 16); directory.writeUInt32LE(bytes.length, 20); directory.writeUInt32LE(bytes.length, 24); directory.writeUInt16LE(name.length, 28); directory.writeUInt32LE(offset, 42); central.push(directory, name); offset += header.length + name.length + bytes.length;
}
const directoryBytes = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(payload.length, 8); end.writeUInt16LE(payload.length, 10); end.writeUInt32LE(directoryBytes.length, 12); end.writeUInt32LE(offset, 16);
await writeFile(path.join(output, 'oasis-workshop.zip'), Buffer.concat([...local, directoryBytes, end]));
console.log(JSON.stringify({ output: path.relative(root, output), documents: documents.length, sourceFiles: sourceFiles.length, packageFiles: payload.length, sourceRevision: revision, workingTree: dirty }));
