#!/usr/bin/env node
// verify-esmaulhusna-content.mjs — ZP-01 kabul kapısı: esmaulHusnaV1.js (id/order/
// name/arabic/ebced) ve esmaulHusnaV2.js (meaningTr/importanceTr/reflectionTr/
// sourceRefs/editorialStatus) içerik sözleşmesini headless doğrular.
//
// DATA SAFETY: yalnız `window` global'ini gören saf bir vm sandbox'ı; DOM, fetch,
// localStorage veya ağ yok. Gerçek tarayıcı açılmaz, seyma-data'ya yazılmaz.
//
// Usage:
//   node .claude/skills/run-seyma/verify-esmaulhusna-content.mjs
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

const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);

const v1Src = fs.readFileSync(path.join(REPO, 'esmaulHusnaV1.js'), 'utf8');
const v2Src = fs.readFileSync(path.join(REPO, 'esmaulHusnaV2.js'), 'utf8');
vm.runInContext(v1Src, sandbox, { filename: 'esmaulHusnaV1.js' });
vm.runInContext(v2Src, sandbox, { filename: 'esmaulHusnaV2.js' });

const V1 = sandbox.EsmaulHusnaV1;
const V2 = sandbox.EsmaulHusnaV2;

console.log('== ZP-01 Esmâ içerik doğrulaması ==');

ok('EsmaulHusnaV1 yüklendi', !!V1 && Array.isArray(V1.names));
ok('EsmaulHusnaV1 tam 99 kayıt', V1 && V1.names.length === 99);
ok('EsmaulHusnaV2 yüklendi', !!V2 && Array.isArray(V2.names));
ok('EsmaulHusnaV2 tam 99 kayıt', V2 && V2.names.length === 99);

if (V2 && Array.isArray(V2.names)) {
  const orders = V2.names.map(n => n.order);
  const uniqueOrders = new Set(orders);
  ok('order 1-99 aralığında benzersiz', uniqueOrders.size === 99 &&
    Math.min(...orders) === 1 && Math.max(...orders) === 99);

  const ids = new Set(V2.names.map(n => n.id));
  ok('id benzersiz (99 farklı id)', ids.size === 99);

  const FORBIDDEN = [
    'garanti', 'kesin sağlar', 'kesin olarak sağlar', 'şu kadar oku', 'kere okuyan',
    'kabul olur', 'dinen zorunlu', 'farzdır', 'vaciptir', 'hadis', 'rivayet edilir ki',
    'bilimsel olarak kanıtlan',
  ];
  let emptyFieldHit = null;
  let forbiddenHit = null;
  let sourceRefHit = null;
  let statusHit = null;

  for (const rec of V2.names) {
    const fields = ['meaningTr', 'importanceTr', 'reflectionTr'];
    for (const f of fields) {
      if (!rec[f] || typeof rec[f] !== 'string' || !rec[f].trim()) {
        emptyFieldHit = `${rec.id}.${f}`;
        break;
      }
    }
    if (emptyFieldHit) break;

    if (!Array.isArray(rec.sourceRefs) || rec.sourceRefs.length < 1) {
      sourceRefHit = `${rec.id} sourceRefs boş`;
      break;
    }
    for (const refId of rec.sourceRefs) {
      if (!V2.sources[refId]) { sourceRefHit = `${rec.id} -> bilinmeyen kaynak '${refId}'`; break; }
    }
    if (sourceRefHit) break;

    if (rec.editorialStatus !== 'draft' && rec.editorialStatus !== 'reviewed') {
      statusHit = `${rec.id} geçersiz editorialStatus '${rec.editorialStatus}'`;
      break;
    }

    const haystack = (rec.meaningTr + ' ' + rec.importanceTr + ' ' + rec.reflectionTr).toLowerCase();
    for (const bad of FORBIDDEN) {
      if (haystack.includes(bad)) { forbiddenHit = `${rec.id}: '${bad}'`; break; }
    }
    if (forbiddenHit) break;
  }

  ok('Hiçbir kayıtta boş meaningTr/importanceTr/reflectionTr yok', !emptyFieldHit || (console.log('  ->', emptyFieldHit), false));
  ok('Her kayıtta geçerli sourceRefs (>=1, bilinen kaynağa işaret ediyor)', !sourceRefHit || (console.log('  ->', sourceRefHit), false));
  ok('editorialStatus yalnız draft/reviewed değerlerinden biri', !statusHit || (console.log('  ->', statusHit), false));
  ok('Vaat/garanti/reçeteli-sayı/uydurma-fazilet/hadis referansı içeren ifade yok', !forbiddenHit || (console.log('  ->', forbiddenHit), false));

  const reviewedCount = V2.names.filter(n => n.editorialStatus === 'reviewed').length;
  ok("Henüz hiçbir kayıt 'reviewed' işaretlenmedi (taslak aşaması, kullanıcı onayı bekliyor)", reviewedCount === 0);

  ok('Kaynak kaydı (diyanet-99-isim) mevcut ve URL taşıyor', !!(V2.sources['diyanet-99-isim'] && V2.sources['diyanet-99-isim'].url));
  ok('Ebced yöntem kaynağı (tdv-ebced-yontemi) ayrı metadata olarak mevcut', !!(V2.sources['tdv-ebced-yontemi'] && V2.sources['tdv-ebced-yontemi'].url));
  ok("İçerik sourceRefs'i ebced kaynağını anlam kaynağıyla karıştırmıyor",
    V2.names.every(n => !n.sourceRefs.includes('tdv-ebced-yontemi')));

  ok('99 sınır kaydı doğru (Allah / order 1)', V2.names.find(n => n.order === 1).transliterationTr === 'Allah');
  ok('el-Fettâh (order 19) ebced 489 ile tutarlı (harness sınır testiyle uyumlu)',
    V2.names.find(n => n.order === 19).ebced === 489);

  ok("99 ismin Allah'ın isimlerini sınırladığı iddiası yok (disclaimerLimitTr mevcut)",
    typeof V2.disclaimerLimitTr === 'string' && V2.disclaimerLimitTr.length > 0);
}

console.log(failed === 0 ? `\n✅ Tüm kontroller PASS` : `\n❌ ${failed} kontrol FAIL`);
process.exitCode = failed === 0 ? 0 : 1;
