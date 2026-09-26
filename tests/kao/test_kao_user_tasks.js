'use strict';

// KAO-20 · R-C9 üç kullanıcı görevi (headless), R-C5 performans/boyut ölçümü, R-A3 kalibrasyon simülasyonu.
//   node tests/kao/test_kao_user_tasks.js            → sözleşme kontrolleri
//   node tests/kao/test_kao_user_tasks.js --report   → KAO-REGRESYON.md için ölçüm JSON'u
// Ağ, depo ve tarayıcı yok; saat ve rastgelelik tohumludur (tekrarlanabilir).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const repoRoot = require('../repo-root');

const CONTENT = ['app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranPhonicsV1.js'];
const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');

function boot(options) {
  const opts = options || {};
  let SandboxDate = Date;
  if (opts.clock) { const RealDate = Date; SandboxDate = class extends RealDate { constructor(...args) { super(...(args.length ? args : [opts.clock.now])); } static now() { return opts.clock.now; } }; }
  const box = { window: {}, Date: SandboxDate, Math, Number, String, Object, Array, JSON };
  vm.createContext(box);
  for (const relative of CONTENT.concat(['app/content/quranRevelationOrderV1.js', 'app/core/quranLearn.js'])) vm.runInContext(read(relative), box, { filename: relative });
  const api = box.window.SeymaQuranLearn;
  const state = { data: { settings: {}, quranLearn: null }, ui: { kaoOpen: false, kaoView: 'home' }, renders: 0, audios: 0 };
  const taskNode = { innerHTML: '', attrs: {}, setAttribute(name, value) { this.attrs[name] = value; }, removeAttribute(name) { delete this.attrs[name]; }, querySelectorAll() { return []; } };
  assert.equal(api.registerQuranLearn({ data() { return state.data; }, ui() { return state.ui; }, save() {}, render() { state.renders += 1; }, todayStr() { if (!opts.clock) return '2026-09-26'; const now = new Date(opts.clock.now); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; }, esc: String, icon() { return ''; }, getDay() { return {}; } }), true);
  assert.equal(api.registerQuranLearnSurface({ lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return 'kao-hub-entry'; }, restoreFocus() {}, sheetClose(_c, _b, body) { body(); }, mount() {},
    taskElement() { return taskNode; }, createAudio(src) { state.audios += 1; return { src, addEventListener() {}, play() { return { catch() {} }; } }; },
    isQuietTime() { return !!opts.quiet; }, setTimer() { return 1; }, clearTimer() {}, toast() {} }), true);
  api.ensureQuranLearn(state.data);
  return { api, state, box };
}
/** Bir HTML parçasındaki onclick hedeflerini (App.<ad>(...)) sırayla döner. */
const clicks = (html) => [...String(html).matchAll(/onclick="App\.(kao[A-Za-z]+)\(([^"]*)\)"/g)].map((match) => ({ name: match[1], args: match[2] }));
function answerAll(api, state, correctly) {
  const times = [];
  while ((state.ui.kaoTaskIndex || 0) < (state.ui.kaoQueue || []).length) {
    const item = state.ui.kaoQueue[state.ui.kaoTaskIndex];
    const task = api.kaoBuildTask(item, state.data, { seed: item.id });
    const started = process.hrtime.bigint();
    if (task.kind === 'order') task.choices.slice().sort((a, b) => a.ordinal - b.ordinal).forEach((choice) => api.kaoAnswer(task.id, choice.choiceId));
    else api.kaoAnswer(task.id, (correctly ? task.choices.find((choice) => choice.correct) : task.choices.find((choice) => !choice.correct) || task.choices[0]).choiceId);
    times.push(Number(process.hrtime.bigint() - started) / 1e6);
  }
  return times;
}

const report = {};

// (a) Hub kartından bugünkü oturuma: hub → E1 → oturum (≤3 adım); Ayarlar'dan da ≤3 adım.
{
  const { api, state } = boot();
  const hub = clicks(api.kaoHubCardHTML());
  assert.deepEqual(hub.map((item) => item.name), ['kaoOpen'], 'hub kartı tek dokunuşla açar');
  api.kaoOpen(); assert.equal(state.ui.kaoView, 'home');
  const start = clicks(api.kaoHomeHTML('2026-09-26T09:00:00')).find((item) => item.name === 'kaoStart');
  assert.ok(start, 'E1 üzerinde oturum başlat düğmesi');
  assert.ok(api.kaoStart() >= 1); assert.equal(state.ui.kaoView, 'session');
  assert.match(api.kaoTaskHTML(api.kaoBuildTask(state.ui.kaoQueue[0], state.data, { seed: state.ui.kaoQueue[0].id })), /id="kao-task"/);
  const fromSettings = clicks(api.kaoSettingsHTML()).find((item) => item.name === 'kaoSetView' && item.args === "'home'");
  assert.ok(fromSettings, 'Ayarlar → E1 geri dönüşü');
  report.taskA = { hubToSession: 2, settingsToSession: 2, limit: 3 };
}

// (b) Kelime kartından kök ağacına: E5 → 1 dokunuş; ünite listesinden 2 dokunuş.
{
  const { api, state } = boot();
  state.ui.kaoOpen = true; state.ui.kaoView = 'units';
  const openWord = clicks(api.kaoUnitsHTML()).find((item) => item.name === 'kaoOpenWord');
  assert.ok(openWord, 'ünite listesi kelime kartına bağlanır');
  const lemmaId = openWord.args.replace(/'/g, '');
  assert.equal(api.kaoOpenWord(lemmaId), true); assert.equal(state.ui.kaoView, 'word');
  const toRoot = clicks(api.kaoWordHTML()).find((item) => item.name === 'kaoWordLayer' && item.args === '2');
  assert.ok(toRoot, 'kelime kartında “Kökünü ve akrabalarını gör”');
  assert.equal(api.kaoWordLayer(2), true);
  assert.match(api.kaoWordHTML(), /kao-root-tree/, 'kök ağacı görünür');
  report.taskB = { wordCardToRootTree: 1, unitListToRootTree: 2, limit: 2 };
}

// (c) Ses kapalı tam oturum: hiç ses nesnesi oluşmaz, oturum sonu ekranına ulaşılır (R-C2 ile).
for (const variant of [{ label: 'audio=false', quiet: false }, { label: 'sessiz saat + audio=true', quiet: true, audio: true }]) {
  const { api, state } = boot({ quiet: variant.quiet });
  state.data.quranLearn.settings.audio = !!variant.audio;
  api.kaoOpen(); const count = api.kaoStart();
  const times = answerAll(api, state, true);
  assert.equal(state.ui.kaoTaskIndex, count, `${variant.label}: tüm görevler cevaplandı`);
  assert.match(api.kaoTaskHTML(null), /Bugünkü oturum tamam/, `${variant.label}: oturum sonu`);
  assert.equal(state.audios, 0, `${variant.label}: ses nesnesi oluşmaz`);
  if (!variant.quiet) {
    const sorted = times.slice().sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length / 2)], max = sorted[sorted.length - 1];
    assert.ok(max < 50, `R-C5: en yavaş görev geçişi ${max.toFixed(3)} ms < 50 ms`);
    assert.ok(state.renders <= 2, 'görev geçişleri tam render çağırmaz (hedefli DOM)');
    report.taskC = { tasks: count, audioObjects: 0, fullRenders: state.renders };
    report.transition = { samples: times.length, p50Ms: Number(p50.toFixed(3)), maxMs: Number(max.toFixed(3)), budgetMs: 50 };
  }
}

// R-C5 boyut: 4 içerik modülü gzip toplamı (ölçüm; bütçe aşımı gizlenmez, rapora yazılır).
{
  const sizes = Object.fromEntries(CONTENT.map((relative) => [path.basename(relative), zlib.gzipSync(fs.readFileSync(path.join(repoRoot, relative)), { level: 9 }).length]));
  const total = Object.values(sizes).reduce((sum, value) => sum + value, 0);
  const budget = 130 * 1024;
  // Aşım kullanıcı kararı bekliyor (KAO-REGRESYON.md §Bilinen sınırlar); bu tavan yalnız sessiz büyümeyi engeller.
  const guard = 160 * 1024;
  assert.ok(total <= guard, `içerik gzip ${total} bayt, büyüme tavanı ${guard}`);
  report.contentGzip = { sizes, total, budget, overBudget: total > budget, overBy: Math.max(0, total - budget), growthGuard: guard };
  const src = read('app/core/quranLearn.js');
  assert.match(src, /audio\.preload='none'/, 'ilk açılışta ses indirilmez (preload none)');
}

// R-A3: tohumlu 6 haftalık sentetik oturum simülasyonu → 10 R-bandında öngörü–gerçek.
{
  const { api } = boot();
  let seed = 20260926;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const day0 = Date.UTC(2026, 7, 1, 9);
  const cards = [], bands = Array.from({ length: 10 }, (_, index) => ({ band: `${(index / 10).toFixed(1)}–${((index + 1) / 10).toFixed(1)}`, n: 0, pred: 0, ok: 0 }));
  const weekly = Array.from({ length: 6 }, () => ({ n: 0, ok: 0 }));
  for (let day = 0; day < 42; day += 1) {
    const now = new Date(day0 + day * 86400000);
    if (day < 30) for (let k = 0; k < 10; k += 1) cards.push({ id: cards.length, state: null });
    for (const card of cards) {
      const due = card.state && card.state.due ? Date.parse(card.state.due) : 0;
      if (due > now.getTime()) continue;
      if (card.state && random() >= 0.6) continue; // gerçekçi kullanım: vadesi gelen tekrarın %40'ı o gün atlanır → gecikmiş tekrar, düşük R
      const predicted = card.state ? api.kaoSchedule(card.state, 3, now).predictedR : 1;
      const ok = random() < predicted; // kalibre öğrenici: gerçek olasılık = öngörü
      card.state = api.kaoSchedule(card.state, ok ? 3 : 1, now);
      if (card.state.reps > 1) {
        const band = bands[Math.min(9, Math.floor(predicted * 10))];
        band.n += 1; band.pred += predicted; band.ok += ok ? 1 : 0;
        const week = weekly[Math.floor(day / 7)]; week.n += 1; week.ok += ok ? 1 : 0;
      }
    }
  }
  // 10 R-bandının tamamı raporlanır; boş bant n=0 ve değer null (R-A3 kabul: 10 bant tablosu).
  const table = bands.map((band) => ({ band: band.band, n: band.n, meanPred: band.n ? Number((band.pred / band.n).toFixed(3)) : null, actual: band.n ? Number((band.ok / band.n).toFixed(3)) : null, gap: band.n ? Number((band.ok / band.n - band.pred / band.n).toFixed(3)) : null }));
  const total = table.reduce((sum, row) => sum + row.n, 0);
  const ece = table.filter((row) => row.n).reduce((sum, row) => sum + Math.abs(row.gap) * row.n, 0) / total;
  assert.equal(table.length, 10, '10 R-bandı');
  assert.ok(total > 800, `simülasyon yeterli tekrar üretir (${total})`);
  assert.ok(table.filter((row) => row.n >= 200).every((row) => Math.abs(row.gap) < 0.07), 'kalibre öğrenicide bant farkı küçük (hesap zinciri doğru)');
  assert.ok(table.filter((row) => row.n).length >= 5, 'gecikmeli tekrarlar birden çok R-bandını doldurur');
  report.calibration = { model: "kalibre sentetik öğrenici (gerçek olasılık = FSRS öngörüsü), 300 kart (30 gün × 10), 42 gün, vadesi gelenin yüzde 60'ı o gün tekrar edilir, tohum 20260926", reviews: total, ece: Number(ece.toFixed(4)), bands: table,
    retention: weekly.map((week, index) => ({ week: index + 1, n: week.n, actual: week.n ? Number((week.ok / week.n).toFixed(3)) : null })) };
}

// R-A1 gece tekrarı + R-A3 bantlı kalibrasyon ve E1 istatistik (sabit saat; yerel saat dilimi bağımsız).
{
  const clock = { now: new Date(2026, 8, 26, 22, 30).getTime() };
  const { api, state, box } = boot({ clock });
  assert.equal(api.registerCaffeineTargetBed(() => '23:30'), true);
  state.data.settings.targetBed = '23:30';
  const q = state.data.quranLearn;
  const catalog = Array.from(box.window.QuranLexiconV1.lemmas, (lemma) => lemma.id);
  for (let i = 0; i < 12; i += 1) {
    const id = `w:${catalog[i]}:ar>tr`;
    q.cards[id] = { state: 'review', s: 6, d: 5, r: '2026-09-18T09:00:00.000Z', due: '2026-09-25T09:00:00.000Z', reps: 3, lapses: 0 };
  }
  assert.match(api.kaoHubCardHTML(), /Gece tekrarı açık/, 'hub kartı gece önerisi');
  assert.match(api.kaoHomeHTML(new Date(clock.now)), /Gece tekrarına başla · en çok 8 kart/, 'E1 gece düğmesi');
  api.kaoOpen(); const nightCount = api.kaoStart();
  assert.ok(nightCount >= 1 && nightCount <= 8, `gece oturumu ≤8 kart (${nightCount})`);
  assert.ok(state.ui.kaoQueue.every((item) => !item.isNew && item.type !== 'fragment'), 'gece oturumu yalnız tekrar');
  answerAll(api, state, true);
  const nightKey = '2026-09-26';
  assert.equal(q.daily[nightKey].nightRev, nightCount, 'daily.nightRev sayılır');
  const nightCards = state.ui.kaoQueue.map((item) => item.cardId).filter((id) => q.cards[id].nightAt === nightKey);
  assert.equal(nightCards.length, nightCount, 'gece kartları işaretlenir');
  assert.ok(Array.isArray(q.daily[nightKey].calib.bands) && q.daily[nightKey].calib.bands.length === 10, 'R-A3: tekrarlar 10 bantta');
  assert.equal(q.daily[nightKey].calib.bands.reduce((sum, band) => sum + band.n, 0), nightCount);
  // Ertesi gün, gece kartları vadesi gelmiş gibi: gece sonrası ilk tekrar ayrı sayılır, işaret düşer.
  clock.now = new Date(2026, 8, 27, 10, 0).getTime();
  for (const id of nightCards) q.cards[id].due = '2026-09-27T00:00:00.000Z';
  api.kaoStart(); assert.equal(state.ui.kaoNight, false);
  answerAll(api, state, true);
  const dayKey = '2026-09-27';
  assert.ok(q.daily[dayKey].nightFollow && q.daily[dayKey].nightFollow.n >= 1, 'gece sonrası doğruluk ayrı kaydedilir');
  assert.ok(nightCards.every((id) => q.cards[id].nightAt === undefined), 'gündüz tekrarı gece işaretini kaldırır');
  const stats = api.kaoStats(state.data, new Date(clock.now));
  assert.equal(stats.sixWeeks.nightRev, nightCount);
  assert.ok(stats.sixWeeks.n >= nightCount && stats.twoWeeks.n === stats.sixWeeks.n);
  state.ui.kaoOpen = true; state.ui.kaoView = 'stats';
  const statsHtml = api.kaoOverlayHTML(new Date(clock.now));
  assert.match(statsHtml, /aria-labelledby="kao-stats-title"/);
  assert.equal((statsHtml.match(/<th scope="row">/g) || []).length, 10, '10 R-bandı satırı');
  assert.match(statsHtml, /Son 2 hafta[\s\S]*Son 6 hafta[\s\S]*Gece tekrarı/);
  assert.match(api.kaoHomeHTML(new Date(clock.now)), /App\.kaoSetView\('stats'\)/, 'E1 istatistik girişi');
  report.night = { nightSessionCards: nightCount, nightRev: q.daily[nightKey].nightRev, nightFollowN: q.daily[dayKey].nightFollow.n };
}

if (process.argv.includes('--report')) console.log(JSON.stringify(report, null, 2));
else console.log(`KAO user tasks: PASS (R-C9 a:${report.taskA.hubToSession} adım, b:${report.taskB.wordCardToRootTree} dokunuş, c: ses 0; geçiş p50 ${report.transition.p50Ms} ms / max ${report.transition.maxMs} ms; içerik gzip ${report.contentGzip.total} B${report.contentGzip.overBudget ? ' — 130 KB bütçesi AŞILDI, karar bekliyor' : ''}; kalibrasyon ECE ${report.calibration.ece}; gece oturumu ${report.night.nightSessionCards} kart)`);
