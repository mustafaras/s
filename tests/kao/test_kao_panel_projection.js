'use strict';

// KAO-19 · Panel aynası (R-C1, R-C8): uygulama sayısal özeti yazar, manifest yalnız izinli
// özet anahtarlarını geçirir, panel kartı bu özeti gösterir; kelime düzeyi hiçbir şey çıkmaz.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');

// --- Uygulama: gerçek quranLearn.js özeti -------------------------------------------------------
const appBox = { window: {} };
vm.createContext(appBox);
for (const relative of ['app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranPhonicsV1.js', 'app/core/quranLearn.js']) {
  vm.runInContext(read(relative), appBox, { filename: relative });
}
const app = appBox.window.SeymaQuranLearn;
const lemmas = appBox.window.QuranLexiconV1.lemmas;
const data = { lastOpenedDate: '2026-09-26', quranLearn: null, settings: {} };
let saves = 0;
assert.equal(app.registerQuranLearn({ data() { return data; }, ui() { return {}; }, save() { saves += 1; }, render() {}, todayStr() { return '2026-09-26'; }, esc: String, icon() { return ''; }, getDay() { return {}; } }), true);
const q = app.ensureQuranLearn(data);
assert.equal(q.summary, null, 'yeni kök özet taşımaz');
// KAO-FIX-07 (02 §3): bilinen = iki yönde review ∧ s≥21; tek yön ve okuyucu-bilinmeyen sayılmaz.
q.cards[`w:${lemmas[0].id}:ar>tr`] = { reps: 3, state: 'review', s: 25, flagged: { at: '2026-09-25T10:00:00.000Z', kind: 'meaning' } };
q.cards[`w:${lemmas[0].id}:tr>ar`] = { state: 'review', s: 21, reps: 6 };
q.cards[`w:${lemmas[1].id}:tr>ar`] = { reps: 5, state: 'review', s: 30 };
q.cards[`w:${lemmas[1].id}:ar>tr`] = { state: 'review', s: 21, reps: 6 };
q.cards[`w:${lemmas[2].id}:ar>tr`] = { reps: 2, state: 'review', s: 40, readerUnknown: true, flagged: { at: 'x', kind: 'audio' } };
q.cards[`w:${lemmas[2].id}:tr>ar`] = { state: 'review', s: 21, reps: 6 };
q.cards[`w:${lemmas[3].id}:ar>tr`] = { reps: 6, state: 'review', s: 60 };
q.cards[`g:g0_5:g0_5-k1`] = { reps: 1, flagged: 'serbest metin' };
q.daily = { '2026-09-24': { answered: 5 }, '2026-09-25': { answered: 3 }, '2026-09-26': { answered: 1 }, '2026-09-22': { answered: 4 }, bad: { answered: 9 } };
q.phonics.misheard = { tta: 3, sad: 1, tha: 2, ayn: 1 };
q.ayahs.understood = ['112:1', '112:2'];
q.errors.sound = 7;

const summary = app.kaoPanelSummary(data);
assert.deepEqual(Object.keys(summary).sort(), ['coveragePercent', 'flaggedCount', 'knownWords', 'lastStudiedDate', 'streakDays', 'topSoundClass', 'understoodAyahs', 'updatedAt', 'v'], 'yalnız izinli anahtarlar');
assert.equal(summary.coveragePercent, Math.floor(app.kaoCoverage(data).ratio * 100), 'E1 ile aynı kapsam hesabı');
assert.equal(summary.coveragePercent, Math.floor((lemmas[0].freq + lemmas[1].freq) / 77430 * 100));
assert.equal(summary.knownWords, 2, 'okuyucu-bilinmeyen sayılmaz');
assert.equal(summary.understoodAyahs, 2);
assert.equal(summary.flaggedCount, 2, 'R-C1: yalnız {at,kind} nesnesi bayrak sayılır');
assert.equal(summary.lastStudiedDate, '2026-09-26'); assert.equal(summary.streakDays, 3, '22 → 24 arasında boşluk: seri 3');
assert.equal(summary.topSoundClass, 'Kalınlık', 'ط+ص (4) peltek (2) ve ayn (1) üstünde; ad Seviye 0 dersinden');
assert.equal(app.kaoSoundClass('tha'), 'Peltek sesler'); assert.equal(app.kaoSoundClass('yok'), null);

assert.equal(app.kaoSetDailyNew(15), true);
assert.equal(saves, 1); assert.equal(data.quranLearn.summary.v, 1, 'her kayıt özeti tazeler');
const source = read('app/core/quranLearn.js');
assert.equal((source.match(/quranLearnDeps\.save\(\)/g) || []).length, 1, 'tüm kayıtlar kaoSave üzerinden geçer');

// --- Manifest: satır, izinli anahtarlar, kelime düzeyi sızıntı yok ----------------------------------
const panelBox = { window: {}, Date, JSON, Math, Object, Array, String, Number };
vm.createContext(panelBox);
vm.runInContext(read('panel/panelCoverageManifest.js'), panelBox, { filename: 'panel/panelCoverageManifest.js' });
const P = panelBox.window.PanelCoverageV1;
const row = P.MANIFEST.paths.find((item) => item.path === 'quranLearn');
assert.deepEqual(JSON.parse(JSON.stringify(row)), { path: 'quranLearn', owner: 'quranLearn', source: 'state', privacy: 'summary', mode: 'summary', fallback: 'latest' });
assert.deepEqual(Array.from(P.QURAN_LEARN_SUMMARY_KEYS), ['v', 'coveragePercent', 'knownWords', 'understoodAyahs', 'lastStudiedDate', 'streakDays', 'topSoundClass', 'flaggedCount', 'updatedAt']);

const snapshot = P.buildObserverSnapshot(JSON.parse(JSON.stringify(data)), { status: 'accepted' }, '2026-09-26T12:00:00.000Z');
const text = JSON.stringify(snapshot);
assert.deepEqual(Object.keys(snapshot.data.quranLearn), ['summary'], 'snapshot verisinde yalnız özet');
for (const leak of [lemmas[0].id, lemmas[1].id, 'w:', 'g0_5', 'misheard', 'serbest metin', 'readerUnknown', '"errors"', 'understood"']) assert.ok(!text.includes(leak), `sızıntı yok: ${leak}`);
assert.ok(snapshot.coverage.summary.includes('quranLearn'));
assert.ok(Object.values(snapshot.coverage).flat().every((entry) => !String(entry).startsWith('quranLearn.')), 'kapsam listesi köke iner, kelime yolu yazmaz');
const section = snapshot.sections.quranLearn;
assert.equal(section.status, 'ok'); assert.equal(section.studiedToday, true, 'son açılış = son çalışma günü');
assert.deepEqual(Object.keys(section).filter((key) => !['status', 'studiedToday'].includes(key)).sort(), Array.from(P.QURAN_LEARN_SUMMARY_KEYS).sort(), 'bölüm anahtarları izinli listeyle sınırlı');
assert.equal(P.quranLearnProjection(data.quranLearn, '2026-09-27').studiedToday, false);
assert.deepEqual(JSON.parse(JSON.stringify(P.quranLearnProjection(null, '2026-09-26'))), { status: 'missing' }, 'alan yoksa missing');
assert.deepEqual(JSON.parse(JSON.stringify(P.quranLearnProjection({ cards: {} }, '2026-09-26'))), { status: 'missing' }, 'özet yoksa missing');

// Kurcalanmış özet: bilinmeyen anahtar, HTML, aralık dışı sayı ve bozuk tarih düşer.
const tampered = P.quranLearnSummary({ summary: { v: 9, coveragePercent: 180, knownWords: -1, understoodAyahs: 12.9, lastStudiedDate: '26/09/2026', streakDays: 'x', topSoundClass: '<img src=x onerror=1>', flaggedCount: 2, updatedAt: 'dün', words: ['l_min'], extra: 1 } }).summary;
assert.deepEqual(JSON.parse(JSON.stringify(tampered)), { v: 1, coveragePercent: null, knownWords: null, understoodAyahs: 12, lastStudiedDate: null, streakDays: null, topSoundClass: null, flaggedCount: 2, updatedAt: null });

// --- Panel kartı: panel.js'teki gerçek fonksiyonlar, çökme yok ------------------------------------
const panelSource = read('panel/panel.js');
const start = panelSource.indexOf("// KAO-19 · Kur'an Arapçası özeti"), end = panelSource.indexOf('function quranJourneyPanelCardHTML(){');
assert.ok(start > 0 && end > start);
assert.match(panelSource, /h\+=quranJourneyPanelCardHTML\(\);\n {2}h\+=quranLearnPanelCardHTML\(\);/, 'kart Kur’an Yolculuğu kartının ardından');
const cardBox = { window: { PanelCoverageV1: P }, PROJECTION: { sections: {} }, D: null,
  cardWrap(o) { return `<card ${o.key}|${o.title}>${o.summary}${o.details || ''}</card>`; },
  icon(name) { return `<i ${name}>`; },
  esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); } };
vm.createContext(cardBox);
vm.runInContext(panelSource.slice(start, end), cardBox, { filename: 'panel/panel.js#quranLearn' });
assert.match(cardBox.quranLearnPanelCardHTML(), /Henüz özet yok/, 'veri yokken çökmez');
cardBox.D = { quranLearn: { cards: {} } };
assert.match(cardBox.quranLearnPanelCardHTML(), /Henüz özet yok/, 'özet yokken çökmez');
cardBox.PROJECTION = { sections: { quranLearn: section } };
const card = cardBox.quranLearnPanelCardHTML();
assert.match(card, new RegExp(`%${summary.coveragePercent}</div><div class="dl">kapsam`));
assert.match(card, />3<\/div><div class="dl">gün seri/); assert.match(card, /bugün çalıştı/); assert.match(card, />2<\/div><div class="dl">içerik bayrağı/);
assert.match(card, /en çok karışan ses sınıfı: <b>Kalınlık<\/b>/);
cardBox.PROJECTION = { sections: {} }; cardBox.D = { lastOpenedDate: '2026-09-26', quranLearn: { summary: { coveragePercent: 5, topSoundClass: '<script>' } } };
const fallback = cardBox.quranLearnPanelCardHTML();
assert.match(fallback, /%5<\/div>/, 'projeksiyon yoksa latest.json özetine düşer'); assert.doesNotMatch(fallback, /<script>/, 'geçersiz ses sınıfı gösterilmez');

console.log('KAO panel projection: PASS (manifest satırı, 9 izinli anahtar, snapshot/kapsamda kelime düzeyi 0, bayrak R-C1, kurcalama, kart çökme yok)');
