#!/usr/bin/env node
// Plan-only integrity checker. No network, no application execution, no implicit mutation.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.dirname(root);
const readJSON = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const exists = name => fs.existsSync(path.join(root, name));
const safe = name => typeof name === 'string' && name.length > 0 && !path.isAbsolute(name) && !name.split(/[\\/]/).includes('..');
const sha = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const statuses = new Set(['planned', 'in_progress', 'implemented', 'in_review', 'blocked', 'done']);
const active = new Set(['in_progress', 'implemented', 'in_review']);
const gated = new Set([...active, 'done']);
const state = readJSON('IIP-STATE.json');
const requirements = readJSON('tracking/REQUIREMENTS.json');
const decisions = readJSON('tracking/DECISIONS.json');
const ledger = fs.readFileSync(path.join(root, 'tracking/LEDGER.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);

function validate(s, reqs, events, checkFiles = true) {
  const errors = [], fail = message => errors.push(message);
  if (s.schemaVersion !== 2) fail('schemaVersion must be 2');
  const cards = s.cards || [], ids = new Set(cards.map(c => c.id)), map = new Map(cards.map(c => [c.id,c]));
  if (ids.size !== cards.length) fail('duplicate card ID');
  if (s.totalCards !== cards.length || s.completedCards !== cards.filter(c=>c.status==='done').length) fail('card totals drift');
  if (!ids.has(s.recommendedFirstCard)) fail('unknown recommended card');
  const approved = new Set(s.implementationApproval?.cardIds || []);
  if (!['approved','not_approved'].includes(s.implementationApproval?.status)) fail('invalid implementation approval');
  for (const id of approved) if (!ids.has(id)) fail('approval references unknown card');
  if (s.implementationApproval?.status === 'approved' && !s.implementationApproval.source) fail('approval source missing');
  if (s.implementationApproval?.status !== 'approved' && approved.size) fail('unapproved state contains authorized cards');
  for (const key of ['releaseApproval','dataWriteApproval']) {
    if (!['approved','not_approved'].includes(s[key]?.status)) fail(`${key} invalid`);
    if (s[key]?.status === 'approved' && !s[key].source) fail(`${key} source missing`);
  }
  const reqIds = new Set(reqs.map(r=>r.id)), tcIds = new Set(reqs.map(r=>r.testId));
  if (reqIds.size !== reqs.length || tcIds.size !== reqs.length) fail('duplicate REQ or TC');
  for (const r of reqs) {
    if (!ids.has(r.ownerCard) || !map.get(r.ownerCard)?.requirements.includes(r.id)) fail(`orphan ${r.id}`);
    if (!r.acceptance || !r.negativeCase || !r.testId) fail(`incomplete requirement ${r.id}`);
  }
  const locks = new Map(), resources = new Map();
  const decisionMap = new Map(decisions.map(d=>[d.id,d]));
  if (decisionMap.size !== decisions.length) fail('duplicate decision');
  for (const d of decisions) {
    if (!ids.has(d.ownerCard) || !['proposed','approved','rejected'].includes(d.status)) fail('invalid decision '+d.id);
    if (d.status==='approved' && (!d.source || !d.reviewer || !safe(d.evidence) || (checkFiles && !exists(d.evidence)))) fail('decision proof missing '+d.id);
  }
  for (const c of cards) {
    if (!statuses.has(c.status)) fail(`invalid status ${c.id}`);
    if (!safe(c.path) || (checkFiles && !exists(c.path))) fail(`missing card file ${c.id}`);
    if (!c.role || !Array.isArray(c.requiredGates) || !c.requiredGates.length) fail(`missing role/gates ${c.id}`);
    if (!Array.isArray(c.requirements) || !c.requirements.length) fail(`missing requirements ${c.id}`);
    for (const id of c.requirements || []) if (!reqIds.has(id) || reqs.find(r=>r.id===id)?.ownerCard!==c.id) fail(`bad requirement ${c.id}/${id}`);
    for (const id of c.dependsOn || []) if (!ids.has(id) || id===c.id) fail(`bad dependency ${c.id}/${id}`);
    for (const f of [...c.allowedProductionFiles,...c.allowedTestFiles]) if (!safe(f)) fail(`unsafe allowlist ${c.id}`);
    for (const f of c.allowedProductionFiles) if (checkFiles && !fs.existsSync(path.join(repo,f))) fail(`missing production path ${f}`);
    for (const id of c.decisionIds || []) {
      if (!decisionMap.has(id)) fail('unknown decision '+c.id+'/'+id);
      if (c.status==='done' && decisionMap.get(id)?.status!=='approved') fail('unapproved decision '+c.id+'/'+id);
    }
    if (c.status === 'blocked' && !c.blockedReason) fail(`blocked reason missing ${c.id}`);
    if (active.has(c.status) && (!c.owner || !c.startedAt)) fail(`active owner/start missing ${c.id}`);
    if (gated.has(c.status)) {
      if (!approved.has(c.id) || s.implementationApproval.status !== 'approved') fail(`unauthorized status ${c.id}`);
      if (!(c.dependsOn || []).every(id=>map.get(id)?.status==='done')) fail(`unfinished dependency ${c.id}`);
    }
    if (c.locks.length && !c.owner) fail(`lock without owner ${c.id}`);
    if (['planned','done'].includes(c.status) && c.locks.length) fail(`inactive lock ${c.id}`);
    const sorted = a => [...new Set(a || [])].sort().join('\n');
    if(sorted(c.plannedWriteFiles)!==sorted(c.locks)) fail('write/lock mismatch '+c.id);
    for(const resource of c.resourceLocks || []) {
      if(resource!=='data-writer' || !c.owner || !['in_progress','implemented','in_review','blocked'].includes(c.status)) fail('invalid resource lock '+c.id);
      if(resources.has(resource)) fail('resource lock conflict '+resource);
      resources.set(resource,c.id);
    }
    if(active.has(c.status) && c.dataAffecting && !(c.resourceLocks || []).includes('data-writer')) fail('data writer resource missing '+c.id);
    const allowed = new Set([...c.allowedProductionFiles,...c.allowedTestFiles]);
    for (const lock of c.locks) {
      if (!allowed.has(lock)) fail(`out-of-scope lock ${c.id}/${lock}`);
      if (locks.has(lock)) fail(`lock conflict ${locks.get(lock)} and ${c.id}: ${lock}`);
      locks.set(lock,c.id);
    }
    if (active.has(c.status) && c.allowedProductionFiles.length && !c.locks.length) fail(`writer has no locks ${c.id}`);
    if (c.status === 'done') {
      if (!/^[a-f0-9]{40}$/.test(c.verifiedHead || '') || !/^[a-f0-9]{64}$/.test(c.diffHash || '') || !c.completedAt || !safe(c.handoff) || (checkFiles && !exists(c.handoff))) fail(`done receipt metadata missing ${c.id}`);
      const passed = new Set(), covered = new Set();
      for (const ep of c.evidence || []) {
        if (!safe(ep) || !ep.startsWith(`evidence/${c.id}/`) || (checkFiles && !exists(ep))) { fail(`missing evidence ${c.id}`); continue; }
        if (!checkFiles) continue;
        try {
          const e = readJSON(ep);
          if (e.cardId !== c.id || e.schemaVersion !== 1 || e.status !== 'pass' || !e.reviewer || !e.createdAt || e.verifiedHead!==c.verifiedHead || e.diffHash!==c.diffHash) throw Error('receipt identity/revision/result');
          if (!safe(e.artifact) || !e.artifact.startsWith(`evidence/${c.id}/`) || !exists(e.artifact)) throw Error('artifact');
          if (e.artifactSha256 !== sha(fs.readFileSync(path.join(root,e.artifact)))) throw Error('artifact hash');
          if (!Array.isArray(e.requirements) || e.requirements.some(id=>!c.requirements.includes(id))) throw Error('requirement scope');
          if (e.gate==='source' && (!e.commands?.length || e.commands.some(x=>!x.command || x.exitCode!==0))) throw Error('source command proof');
          if (!c.requiredGates.includes(e.gate)) throw Error('unknown gate');
          const d=e.details || {};
          const nonempty = a => Array.isArray(a) && a.length>0;
          const proof = f => safe(f) && exists(f);
          if(e.gate==='scope' && (!Array.isArray(d.changedFiles) || !d.scopeReviewedBy || d.changedFiles.some(f=>!allowed.has(f) && !f.startsWith('ilham-ibadet-premium-plan/')))) throw Error('scope details');
          if(e.gate==='requirements' && (!nonempty(d.results) || c.requirements.some(id=>!d.results.some(x=>x.requirementId===id && x.testId===reqs.find(r=>r.id===id)?.testId && x.result==='pass')))) throw Error('REQ result details');
          if(e.gate==='review' && (!Array.isArray(d.findings) || d.openCritical!==0 || d.openHigh!==0 || !d.reviewedBy)) throw Error('review details');
          if(e.gate==='visual' && (!nonempty(d.themes) || !nonempty(d.viewports) || !d.syntheticDataset || !d.observations || !['prototype','render'].includes(d.artifactKind) || (c.id!=='IIP-02' && d.artifactKind!=='render'))) throw Error('visual details');
          if(e.gate==='content' && (!nonempty(d.contentIds) || !proof(d.rightsEvidence) || !d.domainReviewer || d.decision!=='approved')) throw Error('content details');
          if(e.gate==='data' && (decisionMap.get(d.schemaDecisionId)?.status!=='approved' || !['migrationEvidence','conflictEvidence','rollbackEvidence'].every(k=>proof(d[k])))) throw Error('data details');
          if(e.gate==='offline' && !['manifestEvidence','privateCacheExclusionEvidence','interruptionEvidence'].every(k=>proof(d[k]))) throw Error('offline details');
          passed.add(e.gate); e.requirements.forEach(id=>covered.add(id));
        } catch (error) { fail(`bad evidence ${ep}: ${error.message}`); }
      }
      if (!c.requiredGates.every(g=>passed.has(g))) fail(`done lacks gates ${c.id}`);
      if (!c.requirements.every(r=>covered.has(r))) fail(`done lacks REQ evidence ${c.id}`);
      if (!events.some(e=>e.cardId===c.id && e.event==='card_done' && e.verifiedHead===c.verifiedHead)) fail(`done lacks ledger ${c.id}`);
    }
  }
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id)) { fail(`dependency cycle at ${id}`); return; }
    if (visited.has(id)) return;
    visiting.add(id); for (const d of map.get(id)?.dependsOn || []) if (ids.has(d)) visit(d);
    visiting.delete(id); visited.add(id);
  }
  ids.forEach(visit);
  events.forEach((e,i)=>{ if(e.seq!==i+1 || !e.event || !e.at || (e.cardId && !ids.has(e.cardId))) fail('invalid ledger sequence/event'); });
  const executable = cards.filter(c=>c.status==='planned' && approved.has(c.id) && c.dependsOn.every(d=>map.get(d)?.status==='done'));
  if (s.nextExecutableCard !== (executable[0]?.id || null)) fail('nextExecutableCard drift');
  return errors;
}
function contract(c, reqs) {
  return '<!-- CONTRACT:START -->\n## Yürütme sözleşmesi — üretilmiş\n\n'+
    '**Bağımlılıklar:** '+(c.dependsOn.join(', ')||'yok')+'.\n\n'+
    '**Rol:** '+c.role+' · **Kararlar:** '+(c.decisionIds.join(', ')||'yok')+'.\n\n'+
    '**Üretim allowlist:** '+(c.allowedProductionFiles.map(f=>'`'+f+'`').join(', ')||'yok')+'.\n\n'+
    '**Test allowlist:** '+(c.allowedTestFiles.map(f=>'`'+f+'`').join(', ')||'yok')+'.\n\n'+
    '**Gerekli gate:** '+c.requiredGates.join(', ')+'. **Veri etkili yazıcı:** '+c.dataAffecting+'.\n\n'+
    'Plan artifactleri: `evidence/'+c.id+'/`. State/ledger tek yazarı integratör. Allowlist dışı üretim değişimi ve canlı veri yazımı yok. Yeni dosya ihtiyacı kapsam kaydıyla çözülür; var olan yetki tekrar sorulmaz.\n\n'+
    reqs.filter(r=>r.ownerCard===c.id).map(r=>'### '+r.id+' / '+r.testId+' — '+r.title+'\n\n'+r.acceptance+'\n\nOlumsuz kontrol: '+r.negativeCase).join('\n\n')+'\n<!-- CONTRACT:END -->';
}
function generated(s, reqs) {
  const board = '# Güncel durum — üretilmiş görünüm\n\nKaynak: `IIP-STATE.json`. Elle düzenleme; `node ilham-ibadet-premium-plan/tools/plan-check.mjs --render`.\n\n'+
    `Plan v${s.planVersion} · ${s.planStatus} · Uygulama ${s.completedCards}/${s.totalCards}.\n\n`+
    `Yetki: **${s.implementationApproval.status}** · Çalıştırılabilir sıradaki: **${s.nextExecutableCard||'yok'}** · Önerilen ilk: ${s.recommendedFirstCard}.\n\n`+
    `Cihaz: ${s.deviceAcceptance} · Yayın: ${s.releaseApproval.status} · Canlı veri yazımı: ${s.dataWriteApproval.status}.\n\n`+
    '| Kart | Paket | Durum | Sahip | Önkoşul | Engel |\n|---|---|---|---|---|---|\n'+
    s.cards.map(c=>`| [${c.id} — ${c.title}](../${c.path}) | ${c.package} | ${c.status} | ${c.owner||'—'} | ${c.dependsOn.join(', ')||'—'} | ${(c.blockedReason||'—').replaceAll('|','/')} |`).join('\n')+'\n';
  const trace = '# Gereksinim → kart → test → kanıt\n\nÜretilmiş görünüm; kriterler `REQUIREMENTS.json`, sonuçlar state receipt dizilerinden gelir. TC kimlikleri test senaryosudur; hepsi henüz otomatik test dosyası değildir.\n\n'+
    '| REQ / TC | Kart | Kabul | Olumsuz kontrol | Kanıt receipt sayısı |\n|---|---|---|---|---|\n'+
    reqs.map(r=>`| ${r.id} / ${r.testId} | [${r.ownerCard}](../cards/${r.ownerCard}.md) | ${r.acceptance} | ${r.negativeCase} | ${s.cards.find(c=>c.id===r.ownerCard).evidence.length} |`).join('\n')+'\n';
  const graph = '# Bağımlılıklar ve yazma sınırları\n\nDAG teknik önkoşulları gösterir; yetki değildir. Varsayılan artan kart sırası. Aynı dosyayı yazan kartlar DAG bağımsız olsa da paralel uygulanmaz.\n\n```mermaid\nflowchart TD\n'+
    s.cards.map(c=>`  ${c.id.replace('-','_')}["${c.id}: ${c.title}"]`).join('\n')+'\n'+
    s.cards.flatMap(c=>c.dependsOn.map(d=>`  ${d.replace('-','_')} --> ${c.id.replace('-','_')}`)).join('\n')+'\n```\n\n## Koordinasyon\n\n- 02 tasarım ve 03 alan incelemesi teorik olarak ayrılabilir; 03 runtime yazarsa kendi allowlist/lock ile.\n- 05/06/07 ortak styles.css nedeniyle seri yazılır.\n- 16 içerik hazırlığı, B mühendisliğinden ayrı artifactlerde yürüyebilir; yayın incelemesi bekler.\n- 20/21 data/state ortaklığı ve 22 SW entegrasyonu integratörce sıraya alınır.\n- State/ledger tek yazarı integratördür. Paralel çalışma yalnız oturum yetkisiyle.\n';
  const decisionView = '# Kararlar — üretilmiş görünüm\n\nKaynak: `DECISIONS.json`. Proposed kabul edilmiş demek değildir; approved için kaynak/reviewer/kanıt gerekir.\n\n| ID | Karar | Sahip kart | Durum | Kanıt |\n|---|---|---|---|---|\n'+decisions.map(d=>`| ${d.id} | ${d.title} | ${d.ownerCard} | ${d.status} | ${d.evidence ? `[Kanıt](../${d.evidence})` : 'yok'} |`).join('\n')+'\n';
  return {'tracking/DECISIONS.md':decisionView,'tracking/CURRENT-STATE.md':board,'tracking/TRACEABILITY.md':trace,'tracking/DEPENDENCIES.md':graph};
}
const args = new Set(process.argv.slice(2));
for (const arg of args) if (!['--render','--self-test'].includes(arg)) throw Error('Unknown option '+arg);
if (args.has('--self-test')) {
  if(validate(state,requirements,ledger,false).length) throw Error('Self-test requires structurally valid baseline');
  const cases = [
    ['cycle',s=>s.cards[0].dependsOn=['IIP-24'],'dependency cycle'],
    ['orphan dependency',s=>s.cards[0].dependsOn=['IIP-99'],'bad dependency'],
    ['fake done',s=>{s.cards[0].status='done';s.completedCards=1;},'done lacks gates'],
    ['totals',s=>s.totalCards++,'card totals drift'],
    ['approval',s=>s.implementationApproval={status:'approved',cardIds:['IIP-01'],source:null},'approval source missing'],
    ['next card',s=>s.nextExecutableCard='IIP-01','nextExecutableCard drift'],
    ['blocked without reason',s=>s.cards[0].status='blocked','blocked reason missing'],
    ['lock collision',s=>{for(const c of [s.cards[3],s.cards[4]]){c.owner='agent';c.status='blocked';c.blockedReason='test';c.locks=['app/styles.css'];c.plannedWriteFiles=[...c.locks];}},'lock conflict'],
    ['scope',s=>s.cards[0].allowedProductionFiles=['../sync.js'],'unsafe allowlist'],
    ['req mismatch',s=>s.cards[0].requirements=['REQ-048'],'bad requirement'],
    ['unknown decision',s=>s.cards[0].decisionIds=['DEC-99'],'unknown decision'],
    ['decision gate',s=>{s.cards[1].status='done';s.completedCards=1;},'unapproved decision'],
    ['write lock drift',s=>s.cards[0].plannedWriteFiles=['app.js'],'write/lock mismatch'],
    ['data writer conflict',s=>{for(const c of [s.cards[19],s.cards[20]]){c.owner='a';c.status='blocked';c.blockedReason='test';c.resourceLocks=['data-writer'];}},'resource lock conflict']
  ];
  for (const [name,mutate,expected] of cases) {
    const copy=structuredClone(state); mutate(copy);
    if (!validate(copy,requirements,ledger,false).some(e=>e.includes(expected))) throw Error('Negative test failed: '+name);
  }
  process.stdout.write(`PASS: ${cases.length} invalid-state rejection tests (in-memory; no mutation).\n`);
}
const errors=validate(state,requirements,ledger);
if (!errors.length) {
  for (const c of state.cards) {
    const file=path.join(root,c.path), body=fs.readFileSync(file,'utf8');
    const re=/<!-- CONTRACT:START -->[\s\S]*?<!-- CONTRACT:END -->/;
    const expected=contract(c,requirements), actual=body.match(re)?.[0];
    if(!actual) errors.push('card contract marker missing '+c.id);
    else if(args.has('--render')) fs.writeFileSync(file,body.replace(re,expected));
    else if(actual!==expected) errors.push('card contract drift '+c.id);
  }
  for (const [name,body] of Object.entries(generated(state,requirements))) {
    if (args.has('--render')) fs.writeFileSync(path.join(root,name),body);
    else if (!exists(name) || fs.readFileSync(path.join(root,name),'utf8')!==body) errors.push('generated view drift: '+name);
  }
}
function scan(dir) {
  for (const ent of fs.readdirSync(dir,{withFileTypes:true})) {
    const file=path.join(dir,ent.name);
    if(ent.isDirectory()) scan(file);
    else if(ent.name.endsWith('.md')) {
      const text=fs.readFileSync(file,'utf8');
      for(const [,href] of text.matchAll(/\]\(([^)]+)\)/g)) {
        if (/^(https?:|#)/.test(href)) continue;
        const target=path.resolve(path.dirname(file),href.split('#')[0]);
        if(!fs.existsSync(target)) errors.push('broken link: '+path.relative(root,file)+' -> '+href);
      }
    }
  }
}
scan(root);
// Validate the single prompt entry and targeted context routes without loading them into agent output.
const promptCheck=spawnSync(process.execPath,[path.join(root,'tools/session-brief.mjs'),'--check'],{encoding:'utf8'});
if(promptCheck.status!==0) errors.push('prompt/session routes: '+(promptCheck.stderr||promptCheck.error?.message||'failed').trim());
if(errors.length) { process.stderr.write(errors.map(e=>'FAIL: '+e).join('\n')+'\n'); process.exitCode=1; }
else process.stdout.write(`PASS: ${state.cards.length} cards, ${requirements.length} requirements, DAG, scope, approval, evidence, ledger, generated views and local links.\n`);
