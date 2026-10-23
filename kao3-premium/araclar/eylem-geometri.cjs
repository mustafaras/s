'use strict';
// K3PD-21 · Birincil eylem bölgesi — GEOMETRİ ÖLÇÜM SÖZLEŞMESİ (K3PD-29 için).
//
// Bu araç KENDİSİ piksel ölçmez: gerçek tarayıcı geometrisi K3PD-29'un kontrollü görsel QA
// koşumunda alınır. Buradaki sözleşme, 29'un çekim aracının ÜRETMEK ZORUNDA olduğu alanları
// ve kabul eşiklerini tanımlar; ayrıca her aşamanın birincil eyleminin HANGİ DOM öğesi olduğunu
// tek kaynaktan verir. Böylece "position:sticky var" kaynak kanıtı geometri kanıtı sayılmaz.
//
// Kullanım (repo kökünden):
//   node kao3-premium/araclar/eylem-geometri.cjs            # sözleşmeyi bas (JSON)
//   node kao3-premium/araclar/eylem-geometri.cjs --check    # sözleşme bütünlüğünü doğrula
//   node kao3-premium/araclar/eylem-geometri.cjs --olcum <olcum.json>  # 29 çıktısını denetle
//
// 29 çekim aracının üretmesi gereken ölçüm kaydı (her aşama × her viewport için):
//   { stage, viewport:{width,height,safeAreaBottom}, primary:{selector,x,y,width,height,visible},
//     overlap:{covered:boolean,by:[]}, focusReachable:boolean }
const fs = require('node:fs');
const path = require('node:path');

// ── Aşama → birincil eylem (TEK kaynak) ────────────────────────────────────────────────────────
// `selector` gerçek DOM'da birincil eylemi bulur. `null` = o aşamada birincil eylem yok
// (boş aşama ölçümden ATLANMAZ; "yok" olarak kaydedilir).
const STAGES = [
  { stage: 'goal', selector: '.kao-lesson[data-lesson-stage="goal"] > .kao-lesson-next', note: 'Devam' },
  { stage: 'intro', selector: '.kao-lesson[data-lesson-stage="intro"] > .kao-lesson-next', note: 'Devam' },
  { stage: 'concept', selector: '.kao-lesson[data-lesson-stage="concept"] > .kao-lesson-next', note: 'Devam' },
  // Practice aşaması görev yüzeyinde SINIF ile işaretlidir (`is-practice`); ders kartları
  // `data-lesson-stage` taşır. İkisi de aynı ölçüm sözleşmesine girer.
  { stage: 'practice', selector: '.kao-task.is-practice .kao-choices', note: 'şıklar (MC/build/cloze ortak yüzey)' },
  // Geri bildirim iki biçimde çizilir: (a) tam panel (`kao-feedback-sheet` + `kao-feedback-continue`),
  // (b) hızlı/otomatik geçiş şeridi (`kao-feedback-strip-continue`). İkisi de aynı aşamanın
  // birincil eylemidir; ölçüm İKİSİNİ de kapsar (biri yoksa diğeri ölçülür).
  { stage: 'feedback', selector: '.kao-feedback-sheet .kao-feedback-continue, .kao-feedback-strip-continue', note: 'geri bildirim devamı (panel veya şerit)' },
  { stage: 'apply', selector: '.kao-lesson[data-lesson-stage="apply"] > .kao-lesson-next', note: 'Devam' },
  { stage: 'summary', selector: '.kao-lesson[data-lesson-stage="summary"] > .kao-lesson-next', note: 'Bitir' },
  { stage: 'partEnd', selector: '.kao-lesson[data-lesson-stage="partEnd"] > .kao-lesson-next', note: 'süre sınırı' },
  { stage: 'read', selector: '.kao-lesson[data-lesson-stage="read"] > .kao-lesson-next', note: 'okuma' }
];

// ── Viewport matrisi (kart §Uygula) ────────────────────────────────────────────────────────────
const VIEWPORTS = [
  { width: 320, height: 844, safeAreaBottom: 0 },
  { width: 390, height: 844, safeAreaBottom: 0 },
  { width: 460, height: 844, safeAreaBottom: 0 },
  { width: 390, height: 844, safeAreaBottom: 34 } // sentetik alt inset (iPhone home indicator)
];

// ── Kabul eşikleri ────────────────────────────────────────────────────────────────────────────
const ACCEPTANCE = {
  // K3PD-29'da ölçülecek: aynı aşamanın birincil eylemi, ardışık render'larda aynı y'de kalmalı.
  maxConsecutiveYDeltaPx: 8,
  // Eylem bölgesi görünür olmalı ve altındaki içeriği örtmemeli.
  mustBeVisible: true,
  mustNotCoverContent: true,
  // Klavye ile odağa ulaşılabilir olmalı.
  mustBeFocusReachable: true,
  // Dokunma hedefi (mevcut sözleşme).
  minTouchTargetPx: 44
};

function contract() {
  return {
    version: 1,
    card: 'K3PD-21',
    measuredBy: 'K3PD-29 (kontrollü görsel QA)',
    stages: STAGES,
    viewports: VIEWPORTS,
    acceptance: ACCEPTANCE,
    // 29'un kaydı bu alanları taşımak ZORUNDA; eksik alan = ölçüm geçersiz.
    requiredFields: ['stage', 'viewport.width', 'viewport.height', 'viewport.safeAreaBottom',
      'primary.selector', 'primary.x', 'primary.y', 'primary.width', 'primary.height',
      'primary.visible', 'overlap.covered', 'focusReachable'],
    // Bu kartın hükmü: geometri alt kabulü 29'a kadar EVIDENCE_PENDING.
    verdict: 'EVIDENCE_PENDING',
    note: 'Bu sözleşme ≤8 px PASS üretmez; yalnız 29 gerçek ölçümü üretir.'
  };
}

function check() {
  const errors = [];
  const seen = new Set();
  for (const s of STAGES) {
    if (seen.has(s.stage)) errors.push(`yinelenen aşama: ${s.stage}`);
    seen.add(s.stage);
    if (typeof s.selector !== 'string' || !s.selector.trim()) errors.push(`${s.stage}: selector boş`);
    if (!/^\.kao-/.test(s.selector)) errors.push(`${s.stage}: selector KAO sınıfıyla başlamalı`);
  }
  // Kartın saydığı aşamaların hepsi kapsanmalı.
  for (const required of ['goal', 'intro', 'concept', 'practice', 'feedback', 'apply', 'summary']) {
    if (!seen.has(required)) errors.push(`zorunlu aşama eksik: ${required}`);
  }
  if (VIEWPORTS.length < 4) errors.push('viewport matrisi eksik (320/390/460 + safe-area)');
  if (!VIEWPORTS.some((v) => v.safeAreaBottom > 0)) errors.push('sentetik alt inset viewport yok');
  if (ACCEPTANCE.maxConsecutiveYDeltaPx !== 8) errors.push('y-farkı eşiği 8 px olmalı');
  return errors;
}

// 29 çıktısını denetle: alanlar tam mı, eşikler tutuyor mu?
function audit(record) {
  const errors = [];
  const rows = Array.isArray(record) ? record : record && Array.isArray(record.measurements) ? record.measurements : null;
  if (!rows) return ['ölçüm kaydı dizi değil'];
  const byStage = new Map();
  for (const row of rows) {
    for (const field of ['stage', 'viewport', 'primary', 'overlap', 'focusReachable']) {
      if (row[field] === undefined) errors.push(`${row.stage || '?'}: ${field} eksik`);
    }
    if (!row.viewport || typeof row.viewport.width !== 'number' || typeof row.viewport.height !== 'number'
      || typeof row.viewport.safeAreaBottom !== 'number') errors.push(`${row.stage}: viewport alanları eksik`);
    const p = row.primary || {};
    for (const key of ['selector', 'x', 'y', 'width', 'height', 'visible']) {
      if (p[key] === undefined) errors.push(`${row.stage}: primary.${key} eksik`);
    }
    if (p.visible !== true) errors.push(`${row.stage}: birincil eylem görünür değil`);
    if (row.overlap && row.overlap.covered === true) errors.push(`${row.stage}: eylem bölgesi içeriği örtüyor`);
    if (row.focusReachable !== true) errors.push(`${row.stage}: eylem klavye odağına ulaşmıyor`);
    if (typeof p.height === 'number' && p.height < ACCEPTANCE.minTouchTargetPx) {
      errors.push(`${row.stage}: dokunma hedefi ${p.height}px < ${ACCEPTANCE.minTouchTargetPx}px`);
    }
    const key = `${row.stage}@${row.viewport && row.viewport.width}x${row.viewport && row.viewport.height}+${row.viewport && row.viewport.safeAreaBottom}`;
    if (!byStage.has(key)) byStage.set(key, []);
    byStage.get(key).push(p.y);
  }
  // Ardışık y-farkı: aynı aşama+viewport için ölçümler sıralı gelir.
  for (const [key, ys] of byStage) {
    for (let i = 1; i < ys.length; i += 1) {
      const delta = Math.abs(ys[i] - ys[i - 1]);
      if (delta > ACCEPTANCE.maxConsecutiveYDeltaPx) {
        errors.push(`${key}: ardışık y-farkı ${delta}px > ${ACCEPTANCE.maxConsecutiveYDeltaPx}px`);
      }
    }
  }
  return errors;
}

const args = process.argv.slice(2);
if (args.includes('--check')) {
  const errors = check();
  if (errors.length) { errors.forEach((e) => console.error('HATA ' + e)); process.exit(1); }
  console.log(`PASS eylem-geometri sözleşmesi: ${STAGES.length} aşama · ${VIEWPORTS.length} viewport · y-farkı ≤${ACCEPTANCE.maxConsecutiveYDeltaPx}px · hüküm ${contract().verdict}`);
  process.exit(0);
}
const olcumIndex = args.indexOf('--olcum');
if (olcumIndex >= 0) {
  const file = args[olcumIndex + 1];
  if (!file) { console.error('--olcum <dosya> gerekli'); process.exit(2); }
  const errors = audit(JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')));
  if (errors.length) { errors.forEach((e) => console.error('HATA ' + e)); process.exit(1); }
  console.log('PASS 29 ölçüm kaydı sözleşmeye uyuyor');
  process.exit(0);
}
console.log(JSON.stringify(contract(), null, 2));
