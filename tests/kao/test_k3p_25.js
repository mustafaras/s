'use strict';
// K3P-25 · Mevcut kullanıcıya hızlı geçiş seçimi (K-C · "Varsayılanlar"; Dalga 4 sonu).
// Sentetik node:vm; ağ, tarayıcı, depo, zamanlayıcı yok. Saat yalnız parametre.
// Ölçülenler:
//   1) BİR KEZ: eski (legacy) kullanıcıya teklif yalnız bir kez gösterilir; damga `onboarding.k3pNoticeAt`.
//   2) SESSİZ DEĞİŞİM YOK: teklifin gösterimi ve "Böyle kalsın" ayara DOKUNMAZ (autoAdvance false kalır).
//   3) AÇIK RIZA: "Hızlı geçişi aç" MEVCUT `App.kaoToggleAutoAdvance` çağrısıdır; yeni handler yok (45).
//   4) KOŞUL: ayar zaten açıksa teklif hiç çizilmez ve damga yazılmaz; yeni kullanıcıda onboarding ezer.
//   5) ŞEMA (K-C kararı, yol a): `onboarding.k3pNoticeAt` geriye uyumlu — yoksa `null`, geçerliyse korunur,
//      normalize İDEMPOTENT; panel özeti bundan etkilenmez.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { bootKao, freshUser } = require('./helpers/kao-harness');

const repoRoot = require('../repo-root');
const engine = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

const OFFER_TITLE = 'Doğru cevaplarda hızlı geç';

// Legacy (uygulamayı daha önce kullanmış) kullanıcı: kartı var, doneAt 'legacy', autoAdvance kapalı.
// Not: KAO_WHATS_NEW notu KORUNUR; testte `whatsNewAt` dolu verilerek o not devre dışı bırakılır.
function legacy(t) {
  freshUser(t);
  t.data.quranLearn.onboarding = { doneAt: 'legacy', start: 'level1', minutes: 5, intent: null, placement: null, whatsNewAt: '2026-09-01T00:00:00.000Z' };
  t.data.quranLearn.settings.autoAdvance = false;
  t.ui.kaoOpen = true; t.ui.kaoView = 'home';
  t.api.kaoOpen('home');
  return t;
}
const reopen = (t) => { t.api.kaoClose(); t.api.kaoOpen('home'); };
const homeHtml = (t) => t.api.kaoHomeHTML();

// ---- (1) Teklif bir kez; gösterim ayara dokunmaz -----------------------------
check('hızlı geçiş teklifi eski kullanıcıya BİR KEZ gösterilir; gösterim ayarı değiştirmez', () => {
  const t = legacy(bootKao());
  assert.equal(t.ui.kaoAdvanceOffer, true, 'ilk açılışta teklif açılmalı');
  assert.equal(typeof t.data.quranLearn.onboarding.k3pNoticeAt, 'string', 'damga yazılmalı');
  assert.ok(!Number.isNaN(Date.parse(t.data.quranLearn.onboarding.k3pNoticeAt)), 'damga geçerli ISO olmalı');
  assert.equal(t.data.quranLearn.settings.autoAdvance, false, 'AYAR SESSİZCE DEĞİŞMEMELİ');
  const html = homeHtml(t);
  assert.ok(html.includes(OFFER_TITLE), 'teklif başlığı Bugün ekranında');
  assert.ok(html.includes('Hızlı geçişi aç'), '"Aç" eylemi');
  assert.ok(html.includes('Böyle kalsın'), '"Böyle kalsın" eylemi');
  // İkinci açılış: damga sayesinde bir daha gösterilmez.
  reopen(t);
  assert.notEqual(t.ui.kaoAdvanceOffer, true, 'ikinci açılışta teklif gösterilmemeli');
  assert.ok(!homeHtml(t).includes(OFFER_TITLE), 'ikinci açılışta teklif metni yok');
});

// ---- (2) "Böyle kalsın" ayarı değiştirmez -----------------------------------
check('"Böyle kalsın" yalnız kapatır; ayar olduğu gibi kalır', () => {
  const t = legacy(bootKao());
  assert.equal(t.api.kaoOnboard('auto-advance-offer-close'), true, 'kapatma true dönmeli');
  assert.equal(t.ui.kaoAdvanceOffer, false, 'teklif kapanmalı');
  assert.equal(t.data.quranLearn.settings.autoAdvance, false, 'ayar değişmemeli');
  assert.ok(!homeHtml(t).includes(OFFER_TITLE), 'teklif artık çizilmez');
  assert.equal(t.api.kaoOnboard('auto-advance-offer-close'), false, 'kapalıyken kapatma no-op');
});

// ---- (3) "Aç" mevcut App.kaoToggleAutoAdvance'ı çağırır (açık rıza) ---------
check('"Aç" MEVCUT App.kaoToggleAutoAdvance\'ı çağırır; ayar yalnız açık rızayla değişir', () => {
  const t = legacy(bootKao());
  const html = homeHtml(t);
  assert.ok(html.includes('App.kaoToggleAutoAdvance()'), '"Aç" düğmesi mevcut handler\'ı çağırır');
  assert.ok(html.includes('auto-advance-offer-close'), 'kapatma eylemi de mevcut');
  assert.equal(t.api.kaoToggleAutoAdvance(), true, 'mevcut handler çalışır');
  assert.equal(t.data.quranLearn.settings.autoAdvance, true, 'ayar açık rızayla AÇILDI');
  // Denetimde bulunan gerçek kusur: "Aç"a basınca teklif ekranda KALIRSA ikinci basış ayarı geri kapatırdı.
  assert.equal(t.ui.kaoAdvanceOffer, false, '"Aç"tan sonra teklif bayrağı temizlenmeli');
  assert.ok(!homeHtml(t).includes(OFFER_TITLE), '"Aç"tan sonra teklif ekranda KALMAMALI');
  assert.equal(t.api.kaoToggleAutoAdvance(), true, 'geri kapama da mümkün (kullanıcı denetimi)');
  assert.equal(t.data.quranLearn.settings.autoAdvance, false, 'geri kapandı');
});

// Yapısal güvence: bayrak bir şekilde true kalsa bile ayar açıkken teklif çizilmez.
check('ayar açıkken bayrak kalmış olsa da teklif çizilmez (yapısal güvence)', () => {
  const t = legacy(bootKao());
  t.ui.kaoAdvanceOffer = true;
  t.data.quranLearn.settings.autoAdvance = true;
  assert.ok(!homeHtml(t).includes(OFFER_TITLE), 'ayar açıkken teklif çizilmemeli');
});

// ---- (4) Koşul: yalnız kapalıyken ve yalnız eski kullanıcıda -----------------
check('ayar zaten açıkken teklif çizilmez ve damga yazılmaz', () => {
  const t = bootKao();
  freshUser(t);
  t.data.quranLearn.onboarding = { doneAt: 'legacy', start: 'level1', minutes: 5, intent: null, placement: null, whatsNewAt: '2026-09-01T00:00:00.000Z' };
  t.data.quranLearn.settings.autoAdvance = true;
  t.ui.kaoOpen = true; t.ui.kaoView = 'home';
  t.api.kaoOpen('home');
  assert.notEqual(t.ui.kaoAdvanceOffer, true, 'teklif gösterilmemeli');
  assert.equal(t.data.quranLearn.onboarding.k3pNoticeAt, null, 'damga yazılmamalı');
  assert.ok(!homeHtml(t).includes(OFFER_TITLE), 'teklif metni yok');
});

check('yeni kullanıcıda ilk açılış onboarding gösterir; hızlı geçiş teklifi çizilmez', () => {
  const t = bootKao();
  freshUser(t);
  delete t.data.quranLearn.onboarding;
  t.data.quranLearn.cards = {};
  t.ui.kaoOpen = true; t.ui.kaoView = 'home';
  t.api.kaoOpen('home');
  assert.ok(t.ui.kaoOnboard, 'onboarding açılmalı');
  assert.notEqual(t.ui.kaoAdvanceOffer, true, 'teklif gösterilmemeli');
  assert.ok(!homeHtml(t).includes(OFFER_TITLE), 'teklif metni yok');
});

// ---- (5) Şema: geriye uyumlu alan, idempotent normalize ---------------------
check('onboarding.k3pNoticeAt geriye uyumlu: yoksa null; geçerliyse korunur; normalize idempotent', () => {
  // Alan yok → null (eski kayıt bozulmaz).
  const missing = { quranLearn: { onboarding: { doneAt: 'legacy' }, cards: {}, settings: {} } };
  bootKao().api.ensureQuranLearn(missing);
  assert.equal(missing.quranLearn.onboarding.k3pNoticeAt, null, 'alan yokken null olmalı');
  // Geçerli damga → korunur ve ikinci geçiş değiştirmez.
  const valid = { quranLearn: { onboarding: { doneAt: 'legacy', k3pNoticeAt: '2026-10-17T10:00:00.000Z' }, cards: {}, settings: {} } };
  const api = bootKao().api;
  api.ensureQuranLearn(valid);
  assert.equal(valid.quranLearn.onboarding.k3pNoticeAt, '2026-10-17T10:00:00.000Z', 'geçerli damga korunur');
  const snap = JSON.stringify(valid.quranLearn.onboarding);
  api.ensureQuranLearn(valid);
  assert.equal(JSON.stringify(valid.quranLearn.onboarding), snap, 'normalize İDEMPOTENT');
  // Bozuk değer → null (varsayılana döner, göç etmez).
  const broken = { quranLearn: { onboarding: { doneAt: 'legacy', k3pNoticeAt: 'bozuk' }, cards: {} } };
  bootKao().api.ensureQuranLearn(broken);
  assert.equal(broken.quranLearn.onboarding.k3pNoticeAt, null, 'bozuk değer null olur');
  // Var olan damga tekrar yazılmaz (bir kez garantisi normalize'a bağlı değil, koşula bağlı).
  const again = { quranLearn: { onboarding: { doneAt: 'legacy', k3pNoticeAt: '2026-01-01T00:00:00.000Z' }, cards: {}, settings: { autoAdvance: false } } };
  const t = bootKao();
  t.api.ensureQuranLearn(again);
  t.data = again;
  t.ui.kaoOpen = true; t.ui.kaoView = 'home';
  t.api.kaoOpen('home');
  assert.notEqual(t.ui.kaoAdvanceOffer, true, 'damga varsa teklif gösterilmez');
  assert.equal(again.quranLearn.onboarding.k3pNoticeAt, '2026-01-01T00:00:00.000Z', 'eski damga ezilmez');
});

check('panel özeti onboarding damgasından etkilenmez', () => {
  const base = { quranLearn: { onboarding: { doneAt: 'legacy' }, cards: {}, settings: {} } };
  const api = bootKao().api;
  api.ensureQuranLearn(base);
  // `updatedAt` gerçek saatten üretilir (ms); karşılaştırmada dışlanır.
  const strip = (summary) => { const copy = Object.assign({}, summary); delete copy.updatedAt; return JSON.stringify(copy); };
  const before = strip(api.kaoPanelSummary(base));
  base.quranLearn.onboarding.k3pNoticeAt = '2026-10-17T10:00:00.000Z';
  const after = strip(api.kaoPanelSummary(base));
  assert.equal(after, before, 'panel özeti değişmemeli');
  assert.ok(!JSON.stringify(api.kaoPanelSummary(base)).includes('k3pNoticeAt'), 'panel özeti damgayı sızdırmaz');
});

// ---- (6) Yüzey: yeni App.kao* handler yok -----------------------------------
check('yüzey: App.kao* sayısı 45 kalır (yeni handler eklenmedi)', () => {
  const count = (engine.match(/App\.kao[A-Za-z0-9_]*\s*=/g) || []).length;
  assert.equal(count, 0, 'motor App.kao* ataması yapmaz (yüzey app.js\'te)');
  const app = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  const handlers = new Set((app.match(/App\.kao[A-Za-z0-9_]*\s*=/g) || []).map((s) => s.replace(/\s*=$/, '')));
  assert.equal(handlers.size, 45, `App.kao* 45 olmalı (bulunan: ${handlers.size})`);
});

console.log(`test_k3p_25: PASS (${passed} kontrol — teklif bir kez, ayar sessizce değişmiyor, açık rıza mevcut handler, geriye uyumlu şema, 45 yüzey)`);
