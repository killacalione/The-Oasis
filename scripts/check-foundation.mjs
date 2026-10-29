import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { themes, renderScene, themePaletteCss } from '../site/theme-registry.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const errors=[];
const assert=(ok,message)=>{if(!ok)errors.push(message);};
let files;
try {files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:root,stdio:['ignore','pipe','ignore']}).toString().trim().split(/\r?\n/).filter(Boolean);}
catch {
  async function walk(dir=''){
    const result=[];
    for(const ent of await readdir(path.join(root,dir),{withFileTypes:true})){
      const rel=path.posix.join(dir,ent.name);
      if(ent.isDirectory() && ['dist','node_modules','artifacts'].includes(ent.name))continue;
      if(/^\.(?:local|git|agents)(?:\/|$)|^(?:dist|node_modules|artifacts|prototype|project-foundation-new-project)(?:\/|$)|^RPO-HUB-MASTER-DESIGN\.md$/.test(rel))continue;
      if(ent.isDirectory())result.push(...await walk(rel));else result.push(rel);
    }return result;
  } files=await walk();
}
files=files.filter(rel=>existsSync(path.join(root,rel)));
assert(new Set(files).size===files.length,'Duplicate public paths');
for(const rel of files){
  assert(!/^\.(?:local|agents)\/|^(?:prototype|project-foundation-new-project)\//.test(rel),`Private/history input tracked: ${rel}`);
  assert(!/(^|\/)\.env(?:\.|$)|\.(?:zip|pem|pfx|key)$/i.test(rel),`Sensitive/archive file tracked: ${rel}`);
  const text=await readFile(path.join(root,rel),'utf8');
  assert(!/(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9]{32,}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----)/.test(text),`Recognizable secret pattern: ${rel}`);
  assert(!/[A-Z]:[\\/]Users[\\/][A-Za-z0-9_.-]+/i.test(text),`Personal local path: ${rel}`);
  if(/\.(?:mjs|js)$/.test(rel)){
    try{execFileSync(process.execPath,['--check',path.join(root,rel)],{stdio:'pipe'});}catch{errors.push(`JavaScript syntax: ${rel}`);}
  }
  if(rel.endsWith('.md')){
    for(const match of text.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)){
      const dest=match[1].replace(/^<|>$/g,'').split('#')[0];
      if(!dest || /^[a-z][a-z0-9+.-]*:|^\/\//i.test(dest))continue;
      let resolved;
      try{resolved=path.resolve(path.dirname(path.join(root,rel)),decodeURIComponent(dest));}catch{errors.push(`Invalid link: ${rel} -> ${dest}`);continue;}
      const relative=path.relative(root,resolved).replaceAll('\\','/');
      assert(!relative.startsWith('..'),`Link outside public root: ${rel} -> ${dest}`);
      assert(files.includes(relative) || files.some(x=>x.startsWith(relative+'/')),`Unpublished/missing local link: ${rel} -> ${dest}`);
    }
  }
}
const data=JSON.parse(await readFile(path.join(root,'data/project-status.json'),'utf8'));
const content=JSON.parse(await readFile(path.join(root,'site/site-content.json'),'utf8'));
const states=new Set(['implemented','verified','planned','blocked']);
assert(data.schemaVersion===1,'Status schemaVersion must be 1');
assert(/^\d{4}-\d{2}-\d{2}$/.test(data.updated),'Status date invalid');
assert(data.project==='The Oasis','Product identity mismatch');
assert(data.repository==='https://github.com/killacalione/The-Oasis','Repository identity mismatch');
for(const item of [...data.currentWork,...data.milestones])assert(states.has(item.state),`Unknown evidence state: ${item.state}`);
assert(JSON.stringify(data.milestones.map(x=>x.id))===JSON.stringify(['F0','F1','LV1','S1','S2','S3','S4','S5']),'Status must cover F0, F1, LV1 and S1–S5 in roadmap order');
assert(data.milestones.find(x=>x.id==='F0')?.state==='verified','F0 foundation status mismatch');
assert(['implemented','verified'].includes(data.milestones.find(x=>x.id==='F1')?.state),'F1 must not be left planned after this product foundation begins');
assert(data.milestones.find(x=>x.id==='S1')?.state==='planned','Foundation must not claim S1 implemented');
assert(data.milestones.find(x=>x.id==='S2')?.state==='planned','The LAN pilot must not claim S2 complete');
assert(['implemented','verified'].includes(data.milestones.find(x=>x.id==='LV1')?.state),'LV1 must distinguish implemented source from completed acceptance');
for(const item of data.currentWork)assert(files.includes(item.evidence),`Missing evidence: ${item.evidence}`);
assert(content.home?.intro && content.home?.now,'Home copy missing');
assert(/central Hub/i.test(content.home.intro) && /worlds/i.test(content.home.intro) && /Visitors won't need to code/i.test(content.home.intro),'Home copy must describe the Oasis hub journey and non-coder visitors');
assert(content.project?.pillars?.length===3,'Project page requires three concise project pillars');
assert(content.project.pillars.some(x=>/arrive/i.test(x.title)) && content.project.pillars.some(x=>/explore/i.test(x.title)),'Project page must explain Hub arrival and world exploration');
assert(content.progress?.intro && content.roadmap?.intro && content.community?.intro,'A detail-page introduction is missing');
const roadmap=await readFile(path.join(root,'docs/planning/ROADMAP.md'),'utf8');
const experience=await readFile(path.join(root,'docs/planning/OASIS-EXPERIENCE.md'),'utf8');
for(const id of ['F0','F1','LV1','S1','S2','S3','S4','S5'])assert(roadmap.includes(`**${id} —`),`Roadmap is missing phase ${id}`);
assert(/Structured status.*only source for verified public completion/i.test(roadmap),'Roadmap must identify structured status as the completion source');
const taskIds=[...roadmap.matchAll(/^\| ((?:F0|F1|LV1|S[1-5])-T\d{2}) \|/gm)].map(match=>match[1]);
assert(new Set(taskIds).size===taskIds.length,'Roadmap task IDs must be unique and stable');
for(const id of ['F0-T01','F0-T02','F0-T03','F1-T01','F1-T02','F1-T03','F1-T04','S1-T01','S1-T02','S1-T03','S1-T04','S1-T05','S1-T06','S1-T07','S2-T01','S2-T02','S2-T03','S2-T04','S3-T01','S3-T02','S4-T01','S4-T02','S5-T01','S5-T02'])assert(taskIds.includes(id),`Roadmap task ID missing or changed: ${id}`);
for(const phase of ['F0','F1','LV1','S1','S2','S3','S4','S5'])assert(taskIds.some(id=>id.startsWith(`${phase}-T`)),`Roadmap has no task for phase ${phase}`);
for(const id of ['LV1-T01','LV1-T02','LV1-T03'])assert(taskIds.includes(id),`LAN pilot task missing: ${id}`);
const pilotBrief=await readFile(path.join(root,'docs/planning/LAN-PILOT.md'),'utf8');
assert(/two physical computers/i.test(pilotBrief) && /24-hour/i.test(pilotBrief),'LAN pilot must retain physical and soak acceptance gates');
for(const token of ['first spawn is always in the Hub','Always Hub','Always Home','exact X, Y and Z position','last save revision confirmed','cannot silently replace'])assert(experience.toLowerCase().includes(token.toLowerCase()),`Experience blueprint is missing requirement: ${token}`);
const requirementText=await readFile(path.join(root,'docs/planning/REQUIREMENTS.md'),'utf8');
const requirementIds=[...requirementText.matchAll(/^\| (R-\d{3}) \|/gm)].map(match=>match[1]);
assert(new Set(requirementIds).size===requirementIds.length,'Requirement IDs must not be duplicated');
for(let number=1;number<=23;number++)assert(requirementIds.includes(`R-${String(number).padStart(3,'0')}`),`Original requirement ID was removed: R-${String(number).padStart(3,'0')}`);
for(const id of ['R-024','R-025','R-026'])assert(requirementIds.includes(id),`New Oasis requirement is missing: ${id}`);
const roles=files.filter(x=>x.startsWith('.codex/agents/')&&x.endsWith('.toml'));
assert(roles.length===7,'Expected seven scoped native role adapters');
for(const rel of roles){
  const toml=await readFile(path.join(root,rel),'utf8');
  const name=path.basename(rel,'.toml');
  const body=toml.match(/developer_instructions = """\n([\s\S]*?)\n"""/m)?.[1];
  const card=await readFile(path.join(root,'roles',name+'.md'),'utf8');
  assert(body && card.includes('```text\n'+body+'\n```'),`Role mirror mismatch: ${name}`);
  assert(!/^(?:model|model_reasoning_effort|max_threads)\s*=/m.test(toml),`Unrequested model/concurrency override: ${name}`);
}
const workflow=await readFile(path.join(root,'.github/workflows/foundation.yml'),'utf8');
assert(!/pull_request_target|workflow_run/.test(workflow),'Privileged untrusted workflow event');
for(const match of workflow.matchAll(/uses:\s*([^\s#]+)/g))assert(/@[a-f0-9]{40}$/.test(match[1]),`Action not SHA pinned: ${match[1]}`);
assert(/path: dist/.test(workflow),'Pages must upload only dist');

const style=await readFile(path.join(root,'site/styles.css'),'utf8');
const app=await readFile(path.join(root,'site/app.js'),'utf8');
const themeInitSource = await readFile(path.join(root,'scripts/build-site.mjs'),'utf8');
const themeIds=themes.map(theme=>theme.id);
assert(themes.length===9,'Theme registry must contain nine distinct settings');
assert(new Set(themeIds).size===themeIds.length,'Theme registry IDs must be unique');
for(const id of ['sunset','arcade','meadow'])assert(themeIds.includes(id),`Legacy theme ID must remain available: ${id}`);
for(const theme of themes){
  assert(theme.name && theme.description && theme.art && theme.ambient?.length,`Theme metadata/art is incomplete: ${theme.id}`);
  assert(Object.keys(theme.palette).includes('--page') && Object.keys(theme.palette).includes('--sky-a'),`Theme palette is incomplete: ${theme.id}`);
  const homeScene=renderScene(theme,'home',`check-home-${theme.id}`);
  const detailScene=renderScene(theme,'detail',`check-detail-${theme.id}`);
  const previewScene=renderScene(theme,'thumbnail',`check-preview-${theme.id}`);
  assert((homeScene.match(/class="ambient/g)||[]).length<=24,`Home animation budget exceeded: ${theme.id}`);
  assert((detailScene.match(/class="ambient/g)||[]).length<=8,`Detail animation budget exceeded: ${theme.id}`);
  assert(!previewScene.includes('class="ambient'),`Theme previews must be static: ${theme.id}`);
  assert(!/(?:href|xlink:href)=["']https?:\/\//i.test(theme.art),`Theme art must not load external resources: ${theme.id}`);
}
assert(style.includes('prefers-reduced-motion'),'Reduced-motion CSS behavior missing');
assert(style.includes('image-rendering: pixelated') && style.includes('shape-rendering: crispEdges'),'Crisp pixel-art rendering guidance missing');
assert(style.includes('.scene-layer { display: none') && style.includes('theme-selection-note') && style.includes('max-width: 350px'),'Inactive scene hiding, immediate picker guidance or narrow-phone reflow missing');
assert(style.includes('.no-dialog .theme-dialog { display: none; }'),'Unsupported browsers must hide the inactive dialog and use the native-select fallback');
assert(style.includes('motion-paused') && app.includes('userPaused') && app.includes('visibilitychange'),'Pause, user choice and hidden-tab handling missing');
assert(app.includes('sessionStorage') && app.includes('prefers-reduced-motion'),'Theme/motion session or device preference missing');
assert(app.includes("addEventListener('close'") && app.includes('themeButton.focus()'),'Dialog close must restore trigger focus');
assert(themeInitSource.includes("rpo-hub-theme") && themeInitSource.includes('theme-init.js'),'Pre-paint theme restoration asset missing');

// Build first, then validate the actual curated tree and its generated routes/links.
try{execFileSync(process.execPath,['scripts/build-site.mjs'],{cwd:root,stdio:'pipe'});}catch(error){
  errors.push(`Generated site build failed: ${error.stderr?.toString().trim()||error.message}`);
}
const dist=path.join(root,'dist');
const expected=['.nojekyll','app.js','community/index.html','favicon.svg','index.html','progress/index.html','project/index.html','release.json','roadmap/index.html','styles.css','theme-init.js'].sort();
async function outputFiles(dir=dist,rel=''){
  const found=[];
  for(const item of await readdir(dir,{withFileTypes:true})){
    const name=path.posix.join(rel,item.name);
    if(item.isDirectory())found.push(...await outputFiles(path.join(dir,item.name),name));else found.push(name);
  }
  return found;
}
const built=(await outputFiles()).sort();
assert(JSON.stringify(built)===JSON.stringify(expected),`Generated Pages allowlist mismatch: ${JSON.stringify(built)}`);
const builtStyles=await readFile(path.join(dist,'styles.css'),'utf8');
for(const theme of themes)assert(builtStyles.includes(`:root[data-theme="${theme.id}"]`),`Generated palette is missing from published CSS: ${theme.id}`);
const pagePaths=['index.html','project/index.html','progress/index.html','roadmap/index.html','community/index.html'];
const pageNames=['home','project','progress','roadmap','community'];
for(let i=0;i<pagePaths.length;i++){
  const rel=pagePaths[i];
  const html=await readFile(path.join(dist,rel),'utf8');
  assert(new RegExp(`<body data-page="${pageNames[i]}">`).test(html),`Generated route missing or wrong page id: ${rel}`);
  assert(html.includes('id="theme-dialog"') && html.includes('Choose atmosphere') && html.includes('Selection applies immediately'),`Interactive atmosphere picker missing: ${rel}`);
  for(const theme of themes)assert(html.includes(`data-theme-card="${theme.id}"`) && html.includes(`value="${theme.id}"`) && html.includes(`data-scene="${theme.id}"`),`Theme card/scene missing: ${rel}/${theme.id}`);
  assert(html.includes('class="motion-toggle"') && html.includes('aria-pressed="false"'),`Motion control missing: ${rel}`);
  assert(html.includes('Content-Security-Policy') && html.includes("connect-src 'none'"),`Static-site CSP missing: ${rel}`);
  assert(html.includes('The Oasis') && !html.includes('RPO HUB'),`Generated route has stale product branding: ${rel}`);
  assert((html.match(/<script\b/g)||[]).length===2 && /<script src="(?:\.\/|\.\.\/)?theme-init\.js"><\/script>/.test(html) && /<script src="(?:\.\/|\.\.\/)?app\.js" defer><\/script>/.test(html),`Unexpected scripts or pre-paint theme bootstrap missing: ${rel}`);
  assert(html.indexOf('theme-init.js') < html.indexOf('styles.css'),`Theme must restore before CSS paints: ${rel}`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert(new Set(ids).size===ids.length,`Duplicate SVG/document IDs: ${rel}`);
  for(const match of html.matchAll(/url\(#([^)]*)\)/g))assert(ids.filter(id=>id===match[1]).length===1,`Broken or ambiguous SVG fragment in ${rel}: ${match[1]}`);
  const sceneBlocks=[...html.matchAll(/<svg class="([^"]+)" data-scene="([^"]+)"[\s\S]*?<\/svg>/g)];
  for(const match of sceneBlocks){
    const className=match[1], sceneId=match[2], block=match[0];
    const ambientCount=(block.match(/class="ambient\b/g)||[]).length;
    if(className.includes('world-art')){
      const max=rel==='index.html'?24:8;
      assert(ambientCount<=max,`Scene animation budget exceeded: ${rel}/${sceneId}/${ambientCount}`);
    }else assert(ambientCount===0,`Theme card previews must be static: ${rel}/${sceneId}`);
  }
  assert(sceneBlocks.length>=18,`Expected all themes as both scenery and previews: ${rel}`);
  const sharedBytes=await Promise.all(['styles.css','app.js','theme-init.js','favicon.svg'].map(file=>readFile(path.join(dist,file))));
  const routeBytes=Buffer.byteLength(html)+sharedBytes.reduce((sum,file)=>sum+file.byteLength,0);
  assert(routeBytes<=300*1024,`Uncompressed route resource budget exceeded: ${rel} ${routeBytes} bytes`);
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const dest=match[1].split(/[?#]/,1)[0];
    if(!dest || /^[a-z][a-z0-9+.-]*:|^\/\//i.test(dest))continue;
    assert(!dest.startsWith('/'),`Root-absolute path breaks the GitHub project base path: ${rel} -> ${dest}`);
    let normalized=path.posix.normalize(path.posix.join(path.posix.dirname(rel),decodeURIComponent(dest)));
    if(normalized==='.')normalized='index.html';
    if(dest.endsWith('/'))normalized=path.posix.join(normalized,'index.html');
    assert(expected.includes(normalized),`Generated local link has no published target: ${rel} -> ${dest}`);
  }
  if(i===0){
    const portalCount=(html.match(/class="portal-card portal-/g)||[]).length;
    assert(portalCount===4,`Home portal map has ${portalCount} destinations, expected four`);
    assert(html.includes('An information-site map — not a playable Hub'),'Home must distinguish the project map from an existing app Hub');
    assert(html.includes('central Hub') && html.includes('worlds'),'Home route must describe the broad planned Oasis experience');
  }
}
const roadmapHtml=await readFile(path.join(dist,'roadmap/index.html'),'utf8');
for(const item of data.milestones){
  assert(roadmapHtml.includes(item.id) && roadmapHtml.includes(item.title),`Generated roadmap is missing structured milestone: ${item.id}`);
  assert(roadmapHtml.includes(`<span class="badge ${item.state}">${item.state}</span>`),`Generated roadmap status does not match structured state: ${item.id}/${item.state}`);
}
const release=JSON.parse(await readFile(path.join(dist,'release.json'),'utf8'));
assert(release.project==='The Oasis' && release.schemaVersion===1 && release.revision,'Release metadata missing project/revision');
let expectedRevision=process.env.GITHUB_SHA||'local-uncommitted';
if(!process.env.GITHUB_SHA){
  try{
    const dirty=execFileSync('git',['status','--porcelain'],{cwd:root,stdio:['ignore','pipe','ignore']}).toString().trim();
    if(!dirty)expectedRevision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,stdio:['ignore','pipe','ignore']}).toString().trim();
  }catch{}
}
assert(release.revision===expectedRevision,`Release revision does not match the local/CI source state: expected ${expectedRevision}, got ${release.revision}`);
if(errors.length){console.error(errors.map(x=>'- '+x).join('\n'));process.exit(1);}
console.log(`Foundation checks passed: ${files.length} public files, ${roles.length} role mirrors, status/content, scripts, five generated routes, nine registry-driven themes, scene IDs/animation budgets, picker/motion controls, 300 KiB route budgets, local links and curated Pages output.`);
