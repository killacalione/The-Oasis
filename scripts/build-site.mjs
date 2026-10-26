import { mkdir, readFile, writeFile, copyFile, rm, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'data/project-status.json'), 'utf8'));
const content = JSON.parse(await readFile(path.join(root, 'site/site-content.json'), 'utf8'));
const e = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let revision = process.env.GITHUB_SHA || 'local-uncommitted';
let ref = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || 'main';
if (!process.env.GITHUB_SHA) {
  try {
    ref = execFileSync('git', ['branch', '--show-current'], {cwd:root,stdio:['ignore','pipe','ignore']}).toString().trim() || 'main';
    const dirty = execFileSync('git', ['status', '--porcelain'], {cwd:root,stdio:['ignore','pipe','ignore']}).toString().trim();
    if (!dirty) revision = execFileSync('git', ['rev-parse', 'HEAD'], {cwd:root,stdio:['ignore','pipe','ignore']}).toString().trim();
  } catch {}
}
const repo = data.repository;
const source = rel => `${repo}/blob/${ref}/${rel.split('/').map(encodeURIComponent).join('/')}`;
const badge = state => `<span class="badge ${e(state)}">${e(state)}</span>`;
const routes = [
  {key:'home', label:'Home', slug:'', title:'A world of ideas, built together'},
  {key:'project', label:'Project', slug:'project', title:'What The Oasis is building'},
  {key:'progress', label:'Progress', slug:'progress', title:'The foundation, in the open'},
  {key:'roadmap', label:'Roadmap', slug:'roadmap', title:'A big idea, one proof at a time'},
  {key:'community', label:'Community', slug:'community', title:'There is room for you here'}
];
const destinations = [
  ['project','The project','The idea and its boundaries','01'],
  ['progress','Progress','What is real today','02'],
  ['roadmap','Roadmap','The steps still ahead','03'],
  ['community','Community','Ways to take part','04']
];
const art = await readFile(path.join(root,'site/portal-world.svg'),'utf8');
const linkTo = (key, current) => {
  const target=routes.find(route=>route.key===key);
  return current==='home' ? (target.slug ? `./${target.slug}/` : './') : (target.slug ? `../${target.slug}/` : '../');
};
const pagePrefix = current => current==='home' ? './' : '../';
function header(current) {
  const prefix=pagePrefix(current);
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header wrap">
    <a class="brand" href="${linkTo('home',current)}" aria-label="The Oasis home"><span class="brand-mark" aria-hidden="true">O</span><span>The<span class="brand-accent"> Oasis</span><small>COMMUNITY HUB / FOUNDATION</small></span></a>
    <nav class="site-nav" aria-label="Main navigation">${routes.map(route=>`<a href="${linkTo(route.key,current)}"${route.key===current?' aria-current="page"':''}>${e(route.label)}</a>`).join('')}</nav>
    <div class="site-controls">
      <label for="theme-select">Theme</label>
      <select id="theme-select" name="theme" aria-label="Choose a site theme">
        <option value="sunset">Sunset Portal</option><option value="arcade">Arcade Night</option><option value="meadow">Handheld Meadow</option>
      </select>
      <button class="motion-toggle" type="button" aria-pressed="false" aria-label="Pause animation"><span class="motion-icon" aria-hidden="true">Ⅱ</span><span class="motion-label">Pause motion</span></button>
    </div>
  </header>`;
}
function footer(current) {
  const prefix=pagePrefix(current);
  const revisionLabel=revision==='local-uncommitted'?'<span>working tree</span>':`<a href="${e(repo)}/commit/${e(revision)}">${e(revision.slice(0,12))}</a>`;
  return `<footer class="site-footer wrap"><p><span class="pixel-dot" aria-hidden="true"></span> ${e(data.stage)} <span class="footer-separator">·</span> No public application service is available.</p><a href="${e(source('VERIFY.md'))}">Evidence and limits</a><span class="footer-revision">Source ${revisionLabel} · <a href="${prefix}release.json">Build record</a></span></footer>`;
}
function documentPage(current, title, description, inner) {
  const prefix=pagePrefix(current);
  return `<!doctype html>
<html lang="en" data-theme="sunset"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${e(description)}"><meta name="color-scheme" content="light dark">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'">
<title>${e(title)} · The Oasis</title><link rel="stylesheet" href="${prefix}styles.css"><link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml"><script src="${prefix}app.js" defer></script></head>
<body data-page="${e(current)}">${header(current)}${inner}${footer(current)}</body></html>`;
}
function homePage() {
  const tiles=destinations.map(([key,label,description,number])=>`<a class="portal-card portal-${key}" href="${linkTo(key,'home')}"><span class="portal-number">${number} / GATE</span><strong>${e(label)}</strong><span>${e(description)}</span><span class="portal-arrow" aria-hidden="true">↗</span></a>`).join('');
  return documentPage('home', 'The Oasis — A place to start together', 'The Oasis is planned as a persistent community hub to start in, discover worlds, personalize a player-owned avatar and Home, or create worlds. See what exists today and how to contribute.', `<main id="main" class="home-main wrap">
    <section class="home-intro" aria-labelledby="home-title">
      <p class="eyebrow"><span class="status-light" aria-hidden="true"></span> ${e(data.stage)} <span class="tiny-divider">/</span> MADE IN THE OPEN</p>
      <h1 id="home-title">A place to begin.<br><span>Room to explore.</span></h1>
      <p class="home-lead">${e(content.home.intro)}</p>
      <p class="home-note"><span class="note-star" aria-hidden="true">✦</span>${e(content.home.now)}</p>
      <a class="home-cta" href="${e(repo)}/discussions">Meet us on GitHub <span aria-hidden="true">↗</span></a>
    </section>
    <section class="portal-map" aria-labelledby="map-title">
      <div class="map-heading"><div><p class="eyebrow">YOUR STARTING POINT</p><h2 id="map-title">Pick a portal</h2></div><span class="map-stamp">OASIS / 001</span></div>
      <div class="map-canvas">${art}<div class="portal-grid">${tiles}</div><p class="map-caption">An information-site map — not a playable Hub <span aria-hidden="true">✦</span></p></div>
    </section>
  </main>`);
}
function projectPage() {
  const cards=content.project.pillars.map((item,index)=>`<article class="info-card"><span class="card-index">0${index+1}</span><h2>${e(item.title)}</h2><p>${e(item.detail)}</p></article>`).join('');
  const inner=`<main id="main" class="content-main wrap"><div class="page-kicker">01 / THE PROJECT</div><section class="page-hero"><p class="eyebrow">${e(data.stage)} · BIG VISION, HONEST START</p><h1>${e(routes[1].title)}</h1><p class="page-lead">${e(data.summary)}</p></section>
    <section class="content-section"><div class="section-intro"><p class="eyebrow">THE EXPERIENCE WE ASPIRE TO</p><h2>Start in the Hub.<br>Go anywhere.</h2></div><div class="info-grid">${cards}</div></section>
    <section class="callout"><span class="callout-spark" aria-hidden="true">✦</span><div><p class="eyebrow">WHERE WE ARE TODAY</p><h2>Groundwork before gateways.</h2><p>${e(data.limits)}</p><a class="inline-link" href="${linkTo('progress','project')}">See the verified foundation work →</a></div></section>
    <section class="content-section two-column"><div><p class="eyebrow">THE NEXT PROOF</p><h2>Start small enough to get right.</h2></div><div><p>${e(content.project.next)}</p><a class="inline-link" href="${e(source('docs/planning/OASIS-EXPERIENCE.md'))}">Read the Oasis experience blueprint →</a><br><a class="inline-link" href="${e(source('docs/planning/S1-IMPLEMENTATION-BRIEF.md'))}">Read the proposed S1 acceptance brief →</a><br><a class="inline-link" href="${e(source('docs/planning/LAN-PILOT.md'))}">Read the private LAN pilot runbook →</a></div></section>
  </main>`;
  return documentPage('project', 'The project', 'The Oasis is an open community project for a persistent hub connecting people to player-owned identity, personal Homes, community-made worlds and creator tools. The product is planned, not live.', inner);
}
function progressPage() {
  const cards=data.currentWork.map((item,index)=>`<article class="progress-card"><div class="progress-card-top"><span class="card-index">0${index+1}</span>${badge(item.state)}</div><h2>${e(item.title)}</h2><p>${e(item.detail)}</p><a class="inline-link" href="${e(source(item.evidence))}">Open evidence →</a></article>`).join('');
  const inner=`<main id="main" class="content-main wrap"><div class="page-kicker">02 / PROJECT PROGRESS</div><section class="page-hero"><p class="eyebrow">REVIEWED ${e(data.updated)} · EVIDENCE FIRST</p><h1>${e(routes[2].title)}</h1><p class="page-lead">${e(content.progress.intro)}</p></section>
    <section class="content-section"><div class="progress-summary"><span class="stage-chip">CURRENT STAGE</span><strong>${e(data.stage)}</strong><p>Verified foundation tasks are separate from a locally passing check, a merged change and a deployed site.</p></div><div class="progress-grid">${cards}</div></section>
    <section class="callout"><span class="callout-spark" aria-hidden="true">↗</span><div><p class="eyebrow">HOW TO READ THIS PAGE</p><h2>Evidence, not activity theater.</h2><p>Implemented means the source exists; verified means a stated check has evidence; planned means not built; blocked means a prerequisite remains. No progress bars, dates or engagement numbers are invented.</p><a class="inline-link" href="${e(source('docs/planning/WORK-STATE.md'))}">Open the work ledger →</a></div></section>
  </main>`;
  return documentPage('progress', 'Progress', 'Review verified The Oasis foundation work, its evidence and current product limits.', inner);
}
function roadmapPage() {
  const milestones=data.milestones.map((item,index)=>`<li class="roadmap-row"><span class="roadmap-id">${e(item.id)}</span><div><h2>${e(item.title)}</h2><p>${e(item.detail)}</p></div><span class="roadmap-track" aria-hidden="true">${index===0?'●':'○'}</span>${badge(item.state)}</li>`).join('');
  const inner=`<main id="main" class="content-main wrap"><div class="page-kicker">03 / MILESTONES</div><section class="page-hero"><p class="eyebrow">OUTCOMES TO PROVE · NOT PROMISED DATES</p><h1>${e(routes[3].title)}</h1><p class="page-lead">${e(content.roadmap.intro)}</p></section>
    <section class="content-section"><ol class="roadmap-list">${milestones}</ol><p class="roadmap-note"><span aria-hidden="true">✦</span> Each stage needs its own evidence and review. A plan is not a release promise.</p></section>
    <section class="callout"><span class="callout-spark" aria-hidden="true">01</span><div><p class="eyebrow">NEXT PROPOSED APPLICATION MILESTONE</p><h2>Explore, personalize, travel.</h2><p>S1 proposes a local proof with first arrival in a Hub/dashboard, player-owned appearance, optional Home, two original worlds, exact confirmed-location resume, recoverable saves, and an independently stoppable interpreted runtime with bounded host commands and hostile-case tests. A separate private LV1 visitor pilot is implemented; S1 creator/runtime containment remains unimplemented.</p><a class="inline-link" href="${e(source('docs/planning/S1-IMPLEMENTATION-BRIEF.md'))}">Read the S1 brief →</a></div></section>
  </main>`;
  return documentPage('roadmap', 'Roadmap', 'The Oasis F0–F1, LV1 and S1–S5 roadmap, including verified, planned and blocked milestones.', inner);
}
function communityPage() {
  const areas=data.contributionAreas.map((item,index)=>`<article class="community-card"><span class="card-index">0${index+1}</span><h2>${e(item.title)}</h2><p>${e(item.detail)}</p></article>`).join('');
  const inner=`<main id="main" class="content-main wrap"><div class="page-kicker">04 / COMMUNITY</div><section class="page-hero"><p class="eyebrow">A FRIENDLY PLACE TO START</p><h1>${e(routes[4].title)}</h1><p class="page-lead">${e(content.community.intro)}</p></section>
    <section class="content-section"><div class="section-intro"><p class="eyebrow">SMALL CONTRIBUTIONS COUNT</p><h2>Bring a question, a source,<br>or a thoughtful review.</h2></div><div class="info-grid">${areas}</div></section>
    <section class="community-links" aria-labelledby="community-links-title"><div><p class="eyebrow">FOLLOW THE PROJECT</p><h2 id="community-links-title">Open doors, clear expectations.</h2><p>Start with public project guidance; use private security reporting for vulnerabilities.</p></div><div class="link-list">
      <a href="${e(repo)}/discussions"><span>Discussions</span><span>Questions and ideas ↗</span></a>
      <a href="${e(repo)}/issues/new/choose"><span>Issues</span><span>Report a problem or propose work ↗</span></a>
      <a href="${e(source('CONTRIBUTING.md'))}"><span>Contributing</span><span>How to prepare a useful change ↗</span></a>
      <a href="${e(source('GOVERNANCE.md'))}"><span>Governance</span><span>How decisions are made ↗</span></a>
      <a href="${e(source('CODE_OF_CONDUCT.md'))}"><span>Code of conduct</span><span>Community expectations ↗</span></a>
      <a href="${e(repo)}/security/advisories/new"><span>Security reporting</span><span>Private vulnerability disclosure ↗</span></a>
    </div></section>
    <p class="community-boundary">This is a project community, not an in-product social space. There are no public accounts, hosted worlds, chat or voice service yet.</p>
  </main>`;
  return documentPage('community', 'Community', 'Find The Oasis contribution guidance, community discussions, governance, conduct and private security reporting.', inner);
}
const pages = [homePage(), projectPage(), progressPage(), roadmapPage(), communityPage()];
const output=path.resolve(root,'dist');
if(path.dirname(output)!==path.resolve(root)||path.basename(output)!=='dist')throw new Error('Unsafe site output path');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
const locations=['index.html','project/index.html','progress/index.html','roadmap/index.html','community/index.html'];
for(let index=0;index<locations.length;index++){
  const target=path.join(output,locations[index]);
  await mkdir(path.dirname(target),{recursive:true});
  await writeFile(target,pages[index]);
}
await copyFile(path.join(root,'site/styles.css'),path.join(output,'styles.css'));
await copyFile(path.join(root,'site/app.js'),path.join(output,'app.js'));
await copyFile(path.join(root,'site/favicon.svg'),path.join(output,'favicon.svg'));
await writeFile(path.join(output,'.nojekyll'),'');
await writeFile(path.join(output,'release.json'),JSON.stringify({project:data.project,revision,statusUpdated:data.updated,schemaVersion:1},null,2)+'\n');
const expected=['.nojekyll','app.js','community/index.html','favicon.svg','index.html','progress/index.html','project/index.html','release.json','roadmap/index.html','styles.css'].sort();
const walk=async(dir='')=>{
  const found=[];
  for(const item of await readdir(path.join(output,dir),{withFileTypes:true})){
    const rel=path.posix.join(dir,item.name);
    if(item.isDirectory())found.push(...await walk(rel));else found.push(rel);
  }
  return found;
};
const outputFiles=(await walk()).sort();
if(JSON.stringify(outputFiles)!==JSON.stringify(expected))throw new Error(`Unexpected publication files: ${JSON.stringify(outputFiles)}`);
console.log(`Built curated The Oasis site: dist/ (${locations.length} pages, source ${revision})`);
