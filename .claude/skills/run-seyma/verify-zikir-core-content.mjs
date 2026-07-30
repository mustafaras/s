#!/usr/bin/env node
// verify-zikir-core-content.mjs — ZP-02 kabul kapısı: zikirCoreContentV1.js'in
// app.js'teki ZIKR_SEED (Sübhanallah/Elhamdülillah/Allahü Ekber/Lâ ilâhe
// illallah/Estağfirullah) ile aynı id kümesini kapsadığını, hiçbir alanın boş
// olmadığını ve kaynaksız hadis/fazilet iddiası taşımadığını headless doğrular.
//
// DATA SAFETY: yalnız `window` global'ini gören saf bir vm sandbox'ı; DOM,
// fetch, localStorage veya ağ yok. Gerçek tarayıcı açılmaz, seyma-data'ya
// yazılmaz. app.js'in tamamı BOOT EDİLMEZ (bu içerik-katmanı doğrulaması,
// app.js'e henüz bağlanmadı) — ZIKR_SEED id kümesi burada sabit listelenir;
// app.js'te ZIKR_SEED değişirse bu liste elle güncellenmelidir.
//
// Usage:
//   node .claude/skills/run-seyma/verify-zikir-core-content.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = process.env.SEYMA_REPO ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

let failed = 0;
function ok(name, cond) {
  console.log(`${cond ? '✓' : '✗ FAIL'}  ${name}`);
  if (!cond) failed++;
}

const EXPECTED_IDS = ['subhanallah', 'elhamdulillah', 'allahu_ekber', 'la_ilaha_illallah', 'estagfirullah'];

const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);

const src = fs.readFileSync(path.join(REPO, 'zikirCoreContentV1.js'), 'utf8');
vm.runInContext(src, sandbox, { filename: 'zikirCoreContentV1.js' });

const M = sandbox.ZikirCoreContentV1;

console.log('== ZP-02 çekirdek zikir içerik doğrulaması ==');

ok('ZikirCoreContentV1 yüklendi', !!M && typeof M.content === 'object');

// app.js'teki ZIKR_SEED id listesiyle karşılaştır (sabit liste, bkz. dosya başı not)
const appJsSrc = fs.readFileSync(path.join(REPO, 'app.js'), 'utf8');
const seedMatch = appJsSrc.match(/var ZIKR_SEED=\[([\s\S]*?)\];/);
const appJsIds = seedMatch ? Array.from(seedMatch[1].matchAll(/id:'([^']+)'/g)).map(m => m[1]) : [];
ok('app.js ZIKR_SEED id listesi bulunabildi', appJsIds.length === 5);
ok('EXPECTED_IDS sabit listesi app.js ZIKR_SEED ile birebir aynı',
  appJsIds.length === EXPECTED_IDS.length && appJsIds.every((id, i) => id === EXPECTED_IDS[i]));

if (M && M.content) {
  const moduleIds = Object.keys(M.content);
  ok('Modül tam 5 kayıt içeriyor', moduleIds.length === 5);
  ok('Modül id kümesi ZIKR_SEED ile birebir aynı',
    EXPECTED_IDS.every(id => moduleIds.includes(id)) && moduleIds.every(id => EXPECTED_IDS.includes(id)));

  const REQUIRED_FIELDS = ['originalText', 'transliterationTr', 'meaningTr', 'importanceTr', 'reflectionTr', 'kind'];
  const FORBIDDEN = [
    'garanti', 'kesin sağlar', 'kesin olarak sağlar', 'şu kadar oku', 'kere okuyan',
    'kabul olur', 'dinen zorunlu', 'farzdır', 'vaciptir', 'hadis', 'rivayet edilir ki',
    'bilimsel olarak kanıtlan', 'sevabı', 'mizanı doldur',
  ];

  let emptyFieldHit = null, forbiddenHit = null, sourceRefHit = null, kindHit = null, statusHit = null;

  for (const id of EXPECTED_IDS) {
    const rec = M.content[id];
    if (!rec) { emptyFieldHit = `${id}: kayıt yok`; break; }
    for (const f of REQUIRED_FIELDS) {
      if (!rec[f] || typeof rec[f] !== 'string' || !rec[f].trim()) { emptyFieldHit = `${id}.${f}`; break; }
    }
    if (emptyFieldHit) break;

    if (rec.kind !== 'core') { kindHit = `${id}: kind='${rec.kind}' (beklenen 'core')`; break; }

    if (!Array.isArray(rec.sourceRefs) || rec.sourceRefs.length < 1) { sourceRefHit = `${id} sourceRefs boş`; break; }
    for (const refId of rec.sourceRefs) {
      if (!M.sources[refId]) { sourceRefHit = `${id} -> bilinmeyen kaynak '${refId}'`; break; }
    }
    if (sourceRefHit) break;

    if (rec.editorialStatus !== 'draft' && rec.editorialStatus !== 'reviewed') {
      statusHit = `${id}: geçersiz editorialStatus '${rec.editorialStatus}'`;
      break;
    }

    const haystack = (rec.meaningTr + ' ' + rec.importanceTr + ' ' + rec.reflectionTr).toLowerCase();
    for (const bad of FORBIDDEN) {
      if (haystack.includes(bad)) { forbiddenHit = `${id}: '${bad}'`; break; }
    }
    if (forbiddenHit) break;
  }

  ok('Her kayıtta originalText/transliterationTr/meaningTr/importanceTr/reflectionTr/kind dolu', !emptyFieldHit || (console.log('  ->', emptyFieldHit), false));
  ok("Tüm kayıtlarda kind==='core'", !kindHit || (console.log('  ->', kindHit), false));
  ok('Her kayıtta geçerli sourceRefs (>=1, bilinen kaynağa işaret ediyor)', !sourceRefHit || (console.log('  ->', sourceRefHit), false));
  ok('editorialStatus yalnız draft/reviewed değerlerinden biri', !statusHit || (console.log('  ->', statusHit), false));
  ok('Vaat/garanti/reçeteli-sayı/uydurma-fazilet/hadis/sevap-rakamı içeren ifade yok', !forbiddenHit || (console.log('  ->', forbiddenHit), false));

  const reviewedCount = Object.values(M.content).filter(r => r.editorialStatus === 'reviewed').length;
  ok("Henüz hiçbir kayıt 'reviewed' işaretlenmedi (taslak aşaması, kullanıcı onayı bekliyor)", reviewedCount === 0);

  ok("Kullanıcı preset sözleşmesi belgeli (userPresetContract mevcut, builtInLocked=true)",
    !!(M.userPresetContract && M.userPresetContract.builtInLocked === true));
  ok("Kullanıcı presetinde meaningTr/importanceTr isteğe bağlı olarak işaretli",
    !!(M.userPresetContract && M.userPresetContract.meaningTrRequired === false && M.userPresetContract.importanceTrRequired === false));

  ok("Arapça originalText harekesiz yazım kararıyla tutarlı (tashkil işareti yok)",
    Object.values(M.content).every(r => !/[ً-ٰٟ]/.test(r.originalText)));
}

console.log(failed === 0 ? `\n✅ Tüm kontroller PASS` : `\n❌ ${failed} kontrol FAIL`);
process.exitCode = failed === 0 ? 0 : 1;
