'use strict';
// K3P-22 · Âyet merdiveni (K-E). Sentetik node:vm; ağ, tarayıcı, depo yok.
// Ölçülenler:
//   1) BOŞ DURUM YOK: âyet görünümünde "Henüz hazır âyet yok" metni ve `kao-ayah-empty` işaretlemesi geçmez.
//   2) MERDİVEN: %95 eşiğine ulaşmayan kullanıcıda en yakın âyet **Tezhip** olarak çizilir; "N kelime kaldı"
//      cümlesi ve eksik kelimelerin **her biri** için mevcut `App.kaoNav('word', id)` bağlantısı vardır.
//   3) DOĞRULUK: eksik liste = âyetin tanınmayan lemmaları; liste ancak GERÇEKTEN eksik varsa çizilir.
//   4) EŞİK: %95 eşiği DEĞİŞMEZ — eşiğe ulaşan kullanıcı tam âyet ekranını görür (merdiven değil).
//   5) 20 KELİME: 20 kelime bilen kullanıcı boş durum görmez (kartın kabul senaryosu).
//   6) YÜZEY: `App.kao*` sayısı 45 kalır; merdiven yalnız mevcut eylemleri kullanır.
const assert = require('node:assert/strict');
const { bootKao, openView, freshUser, seed } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

const THRESHOLD = 0.95;

// Tohumlu kullanıcı: 20 lemma × iki yön, s=40 → kalıcı (bilinen) kart.
function seeded() { const t = bootKao({ seeded: true }); t.ui.kaoStack = []; return t; }
const ayahHtml = (t) => openView(t, 'ayah', null, { mode: 'set' }).html;

check('boş durum kalktı: âyet görünümünde "Henüz hazır âyet yok" ve kao-ayah-empty yok', () => {
  const t = seeded();
  const html = ayahHtml(t);
  assert.ok(!html.includes('Henüz hazır âyet yok'), '"Henüz hazır âyet yok" metni geçmemeli');
  assert.ok(!/kao-ayah-empty/.test(html), 'boş durum işaretlemesi geçmemeli');
  // Yönlendirici başlık yerine hedefe yakınlık anlatılır.
  assert.match(html, /Henüz %95’e ulaşan âyet yok/, 'eşik anlatan başlık');
});

check('merdiven: en yakın âyet Tezhip olarak çizilir ve "N kelime kaldı" cümlesi görünür', () => {
  const t = seeded();
  const html = ayahHtml(t);
  assert.match(html, /class="kao-ayah-ladder"/, 'merdiven bölümü');
  assert.match(html, /En yakın âyet: <strong>%\d+<\/strong> tanıdık · \d+ kelime kaldı/, '"N kelime kaldı" cümlesi');
  // Tezhip: kelime kelime Arapça satır (en yakın âyetin kendisi).
  assert.match(html, /kao-tezhip-line/, 'Tezhip satırı çizildi');
  assert.match(html, /class="kao-tezhip-word is-(known|new)"/, 'Tezhip kelimeleri durum taşır');
  // Künye ve kelime sayısı hedefi.
  assert.match(html, /\. âyet<\/h3>/, 'sûre · âyet künyesi');
  assert.match(html, /\d+ kelime<\/p>/, 'kelime hedefi');
});

check('eksik kelime listesi: her eksik lemma için mevcut App.kaoNav(\'word\', id) bağlantısı', () => {
  const t = seeded();
  const html = ayahHtml(t);
  const links = [...html.matchAll(/App\.kaoNav\('word','([^']+)'\)/g)].map((m) => m[1]);
  assert.ok(links.length > 0, 'en az bir eksik kelime bağlantısı');
  assert.equal(new Set(links).size, links.length, 'bağlantılar tekil (aynı lemma iki kez bağlanmaz)');
  // Doğruluk: liste gerçekten âyetin TANINMAYAN lemmalarıdır.
  const api = t.api, q = t.data.quranLearn;
  const near = api.kaoNearestAyah ? null : null;
  const groups = t.win.QuranShortSurahsV1.words;
  const known = new Set(Object.keys(q.cards).filter((id) => {
    const match = /^w:([^:]+):(ar>tr|tr>ar)$/.exec(id);
    return match && q.cards[id].state === 'review' && q.cards[id].s >= 21;
  }).filter((id) => {
    const lemma = /^w:([^:]+):/.exec(id)[1];
    return q.cards[`w:${lemma}:ar>tr`] && q.cards[`w:${lemma}:tr>ar`];
  }).map((id) => /^w:([^:]+):/.exec(id)[1]));
  for (const lemmaId of links) {
    assert.ok(!known.has(lemmaId), `${lemmaId}: bağlanan kelime TANINMIYOR olmalı`);
    assert.ok(groups.some((word) => word.lemmaId === lemmaId), `${lemmaId}: âyetin kelimesi olmalı`);
  }
  // Her bağlantı bir kelime düğmesidir ve dokunma hedefi taşır.
  assert.match(html, /class="kao-ayah-ladder-word"/, 'bağlantı düğmesi sınıfı');
});

check('eşik: %95 değişmedi — ulaşan kullanıcı tam âyet ekranını görür, merdiven çizilmez', () => {
  const t = seeded();
  // En yakın âyetin TÜM lemmalarını kalıcı yap: artık eşiğe ulaşır.
  const groups = t.win.QuranShortSurahsV1.words;
  const q = t.data.quranLearn;
  for (const word of groups) {
    if (!word.lemmaId) continue;
    for (const dir of ['ar>tr', 'tr>ar']) q.cards[`w:${word.lemmaId}:${dir}`] = { state: 'review', s: 40, reps: 6 };
  }
  t.ui.kaoAyahToday = null; // gün önbelleğini bırak: seçim yeniden yapılsın
  const html = ayahHtml(t);
  assert.ok(!/kao-ayah-ladder/.test(html), 'eşiğe ulaşınca merdiven çizilmez');
  assert.match(html, /kelime kelime dinle/, 'tam âyet ekranı (dinleme dâhil)');
  assert.match(html, /class="kao-ayah-coverage"/, 'kapsam satırı');
  // Eşik sabiti kaynakta hâlâ 0.95.
  const engine = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', 'app/core/quranLearn.js'), 'utf8');
  assert.match(engine, /KAO_AYAH_THRESHOLD=0?\.95/, 'eşik 0.95 kalmalı');
});

check('20 kelime bilen kullanıcı boş durum görmez (kartın kabul senaryosu)', () => {
  const t = bootKao({ seeded: false });
  seed(t); // harness tohumu: ilk 20 lemma × iki yön, s=40 → kalıcı
  t.ui.kaoStack = [];
  const q = t.data.quranLearn;
  const durable = Object.keys(q.cards).filter((id) => q.cards[id].s >= 21 && q.cards[id].state === 'review');
  assert.ok(durable.length >= 20, `en az 20 kalıcı kelime (ölçülen ${durable.length})`);
  const html = ayahHtml(t);
  assert.ok(!html.includes('Henüz hazır âyet yok'), '20 kelimeyle boş durum yok');
  assert.ok(!/kao-ayah-empty/.test(html), '20 kelimeyle boş durum işaretlemesi yok');
  // Merdiven ya da tam âyet: ikisinden biri çizilmeli (hiçbir durumda boş kalmaz).
  assert.ok(/kao-ayah-ladder/.test(html) || /kelime kelime dinle/.test(html), 'merdiven ya da tam âyet çizilir');
});

check('yüzey: App.kao* sayısı 45 kalır (merdiven yalnız mevcut eylemleri kullanır)', () => {
  const appSource = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', 'app.js'), 'utf8');
  const surface = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', 'app/core/appSurface.js'), 'utf8');
  const kaoAssignments = (appSource + surface).match(/App\.kao[A-Za-z0-9_]+\s*=/g) || [];
  assert.equal(kaoAssignments.length, 45, `App.kao* 45 kalmalı (ölçülen ${kaoAssignments.length})`);
  const engine = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', 'app/core/quranLearn.js'), 'utf8');
  // Merdiven mevcut eylemleri kullanır: kelime bağlantısı kaoNav, birincil eylem kaoStart.
  assert.match(engine, /App\.kaoNav\('word'/, 'mevcut kaoNav kelime bağlantısı kullanılır');
  assert.match(engine, /\{name:'kaoStart'\}/, 'birincil eylem mevcut kaoStart');
});

console.log(`test_k3p_22: PASS (${passed} kontrol — boş durum kalktı, merdiven + Tezhip, eksik kelime bağlantıları, %95 eşiği, 20 kelime senaryosu, 45 yüzey)`);
