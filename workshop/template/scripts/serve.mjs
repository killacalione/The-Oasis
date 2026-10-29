import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fromRoot } from './environment.mjs';
const port = Number(process.env.OASIS_PORT ?? 2571);
if (!Number.isSafeInteger(port) || port < 0 || port > 65535) throw new Error('Invalid OASIS_PORT.');
const routes = { '/': ['index.html','text/html'], '/app.js': ['app.js','text/javascript'], '/style.css': ['style.css','text/css'] };
const server = createServer(async (req,res) => {
  if (req.headers.host !== `127.0.0.1:${server.address().port}` || (req.method !== 'GET' && req.method !== 'HEAD')) { res.writeHead(403);res.end();return; }
  const file = routes[req.url];
  if (!file) { res.writeHead(404);res.end('Not found');return; }
  try { const bytes=await readFile(fromRoot('dist/client',file[0]));res.writeHead(200,{'Content-Type':file[1]+'; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:bytes); }
  catch {res.writeHead(500);res.end('Build the lesson first.');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Workshop: http://127.0.0.1:${server.address().port}`));
const close=()=>server.close(()=>process.exit(0));process.on('SIGINT',close);process.on('SIGTERM',close);process.on('message',m=>{if(m?.type==='shutdown')close();});
