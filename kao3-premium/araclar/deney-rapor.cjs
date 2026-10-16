'use strict';
// K3P-05/16/19 · deney raporu (KARARLAR §6, AKIS §7): bir JSON yedeğinden H2, H3, H4, H5, H7, H8, H9 için YALNIZ toplu sayılar.
// Kullanım (repo kökünden):
//   node kao3-premium/araclar/deney-rapor.cjs --ornek                         sentetik yedekle doğrulama
//   node kao3-premium/araclar/deney-rapor.cjs <yedek.json> [--kesim GG] [--bugun GG]   (GG = YYYY-AA-GG)
// Girdi: kullanıcının kendi verdiği yedek (files/yedek/ biçimi, data/gunluk/<tarih>.json sarmalı ya da salt-okur latest.json).
// Okunan alanlar (başka hiçbir şey): quranLearn.cards[*].{s,lapses,reps,state} · quranLearn.daily ·
//   quranLearn.path.lessons[*].{resume,doneAt}. Kart kimliğinden yalnız kelime kapsamı ve A/B kolu türetilir;
//   kimlik atılır. Önce bu alanlar ayrı bir izdüşüme kopyalanır; hesap yalnız ona bakar.
// Yazmaz: dosya yok, ağ yok. Kelime, metin, kart ya da ders kimliği basmaz; yalnız sayı, yüzde ve tarih.
// --kesim: "önce/sonra" sınırı (ör. otomatik geçişin cihaza ulaştığı gün). Verilmezse son 14 gün (bugün dahil) "sonra" sayılır.
// --bugun: başvuru günü. Verilmezse yedekteki son çalışma günü alınır (saat bağımlılığı yok).
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ladderContext = vm.createContext({ window: {} });
for (const file of ['quranLearnFlow.js', 'quranLearn.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../../app/core', file), 'utf8'), ladderContext, { filename: file });
}
const ladderArm = ladderContext.window.SeymaQuranLearnFlow.ladderArm;

const DAY_MS = 86400000;
const WINDOW_DAYS = 14;               // H2: kesimden önce ve sonra 14 gün
const MIN_REVIEWS_PER_WINDOW = 20;    // H2: pencere başına en az tekrar cevabı
const MIN_ANSWERS_PER_SESSION = 5;    // H7: bundan az cevaplı gün oturum sayılmaz
const FLOW_BAND = [0.80, 0.90];       // H7: akış bandı (K-K)
const FLOW_TARGET = 0.70;             // H7: oturumların ≥ %70'i bantta
const H2_MAX_DROP = 5;                // H2: doğruluk düşüşü ≤ 5 puan
const H4_TARGET = 0.85;               // H4: s ≥ 21 kartlarda doğruluk ≥ %85
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : 0);
const dayNum = (date) => Date.parse(date + 'T00:00:00Z') / DAY_MS;
const shiftDate = (date, days) => new Date((dayNum(date) + days) * DAY_MS).toISOString().slice(0, 10);
const pct = (ratio) => '%' + (ratio * 100).toFixed(1).replace('.', ',');
const pts = (diff) => (diff >= 0 ? '+' : '−') + Math.abs(diff * 100).toFixed(1).replace('.', ',') + ' puan';
const isoDay = (v) => (typeof v === 'string' && DATE_RE.test(v.slice(0, 10)) ? v.slice(0, 10) : null);

// İzdüşüm: yalnız izin verilen alanlar. Kart ve ders anahtarları (kimlikler) atılır; değerler dizi olarak tutulur.
function project(backup) {
  const root = isObj(backup) && isObj(backup.data) && !isObj(backup.quranLearn) ? backup.data : backup;
  const q = isObj(root) ? root.quranLearn : null;
  if (!isObj(q)) throw new Error('yedekte quranLearn bölümü yok');
  const cards = Object.entries(isObj(q.cards) ? q.cards : {}).filter(([, card]) => isObj(card))
    .map(([id, c]) => ({ arm: /^w:/.test(id) ? ladderArm(id) : null, s: num(c.s), lapses: num(c.lapses), reps: num(c.reps), state: typeof c.state === 'string' ? c.state : '' }));
  const daily = Object.entries(isObj(q.daily) ? q.daily : {})
    .filter(([date, row]) => DATE_RE.test(date) && isObj(row))
    .map(([date, row]) => {
      const bands = isObj(row.calib) && Array.isArray(row.calib.bands) ? row.calib.bands.filter(isObj) : [];
      const s21 = isObj(row.calib) && isObj(row.calib.s21) ? row.calib.s21 : null;
      return {
        date,
        answered: num(row.answered),
        correct: num(row.correct),
        reviewN: bands.reduce((sum, b) => sum + num(b.n), 0),
        reviewOk: bands.reduce((sum, b) => sum + num(b.ok), 0),
        s21N: s21 ? num(s21.n) : 0,
        s21Ok: s21 ? num(s21.ok) : 0
      };
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const lessons = Object.values(isObj(q.path) && isObj(q.path.lessons) ? q.path.lessons : {}).filter(isObj)
    .map((l) => ({ hasResume: isObj(l.resume), doneAt: typeof l.doneAt === 'string' ? l.doneAt : null }));
  return { cards, daily, lessons };
}

// Yerleştirme (onboarding) atlanan dersleri aynı anda, aynı doneAt ile işaretler; gerçek bitirişlerin zamanı tektir.
function realLessons(lessons) {
  const seen = new Map();
  lessons.forEach((l) => { if (l.doneAt) seen.set(l.doneAt, (seen.get(l.doneAt) || 0) + 1); });
  return lessons.filter((l) => !l.doneAt || seen.get(l.doneAt) === 1);
}

function reviewAccuracy(rows) {
  const n = rows.reduce((sum, r) => sum + r.reviewN, 0);
  const ok = rows.reduce((sum, r) => sum + r.reviewOk, 0);
  return { n, ratio: n ? ok / n : null };
}

function h2(daily, today, cut) {
  const inRange = (from, to) => daily.filter((r) => r.date >= from && r.date <= to);
  const afterEnd = shiftDate(cut, WINDOW_DAYS - 1) < today ? shiftDate(cut, WINDOW_DAYS - 1) : today;
  const before = reviewAccuracy(inRange(shiftDate(cut, -WINDOW_DAYS), shiftDate(cut, -1)));
  const after = reviewAccuracy(inRange(cut, afterEnd));
  const enough = before.n >= MIN_REVIEWS_PER_WINDOW && after.n >= MIN_REVIEWS_PER_WINDOW;
  const value = enough
    ? `önce ${pct(before.ratio)} (n=${before.n}) · sonra ${pct(after.ratio)} (n=${after.n}) · fark ${pts(after.ratio - before.ratio)}`
    : `önce n=${before.n} · sonra n=${after.n}`;
  const status = !enough ? `veri az (pencere başına ≥ ${MIN_REVIEWS_PER_WINDOW} tekrar)`
    : (before.ratio - after.ratio) * 100 <= H2_MAX_DROP ? 'tutuyor' : 'tutmuyor';
  return { id: 'H2', measure: `Tekrar doğruluğu, kesimden ${WINDOW_DAYS} gün önce/sonra`, value, target: `düşüş ≤ ${H2_MAX_DROP} puan`, status };
}

// H4 (K3P-19): okunuş s ≥ 21 kartta katlanır; destek çekilirken doğruluk korunuyor mu?
// Ölçü yalnız s ≥ 21 cevaplarıdır (motor her cevapta sayar, bkz. quranLearn.js calib.s21).
function h4(daily) {
  const rows = daily.filter((r) => r.s21N > 0);
  const n = rows.reduce((sum, r) => sum + r.s21N, 0);
  const ok = rows.reduce((sum, r) => sum + r.s21Ok, 0);
  const value = n ? `${pct(ok / n)} (${ok}/${n} cevap, ${rows.length} gün)` : 'henüz yok';
  const status = !n ? 'veri yok' : ok / n >= H4_TARGET ? 'tutuyor' : 'tutmuyor';
  return { id: 'H4', measure: 'Okunuşu katlanmış (s ≥ 21) kartlarda doğruluk', value, target: `≥ ${pct(H4_TARGET)}`, status };
}

function h5(daily, lessons) {
  const firstStudy = (daily.find((r) => r.answered > 0) || {}).date || null;
  const firstDone = realLessons(lessons).map((l) => isoDay(l.doneAt)).filter(Boolean)
    .filter((d) => !firstStudy || d >= firstStudy).sort()[0] || null;
  const value = firstStudy && firstDone ? `${dayNum(firstDone) - dayNum(firstStudy)} gün` : 'henüz yok';
  return { id: 'H5', measure: 'İlk çalışma gününden ilk bitirilen derse (K-G: ders âyetle kapanır)', value, target: 'azalır', status: '14. ve 30. gün raporuyla karşılaştır' };
}

function h7(daily, cut) {
  const sessions = daily.filter((r) => r.answered >= MIN_ANSWERS_PER_SESSION);
  const inBand = (rows) => rows.filter((r) => r.correct / r.answered >= FLOW_BAND[0] && r.correct / r.answered <= FLOW_BAND[1]).length;
  const after = sessions.filter((r) => r.date >= cut);
  const all = sessions.length ? inBand(sessions) / sessions.length : null;
  const value = sessions.length
    ? `${inBand(sessions)}/${sessions.length} gün bantta (${pct(all)}) · kesimden sonra ${inBand(after)}/${after.length}`
    : 'oturum yok';
  const status = !sessions.length ? 'veri yok' : all >= FLOW_TARGET ? 'tutuyor' : 'tutmuyor';
  return { id: 'H7', measure: `Günlük başarı %${FLOW_BAND[0] * 100}–${FLOW_BAND[1] * 100} bandında (≥ ${MIN_ANSWERS_PER_SESSION} cevaplı gün)`, value, target: `günlerin ≥ %${FLOW_TARGET * 100}'i`, status };
}

function h8(lessons) {
  const started = realLessons(lessons).filter((l) => l.hasResume || l.doneAt);
  const left = started.filter((l) => l.hasResume && !l.doneAt).length;
  const value = started.length ? `${left}/${started.length} ders yarıda (${pct(left / started.length)})` : 'başlanmış ders yok';
  return { id: 'H8', measure: 'Yarıda kalan ders payı (resume dolu, doneAt boş)', value, target: 'azalır', status: '14. ve 30. gün raporuyla karşılaştır' };
}

function h9(cards) {
  const graduated = cards.filter((c) => c.reps >= 2 && (c.state === 'review' || c.state === 'relearning'));
  const kept = graduated.filter((c) => c.lapses === 0).length;
  const value = graduated.length ? `${kept}/${graduated.length} kart hiç unutulmadı (${pct(kept / graduated.length)})` : 'tekrara geçmiş kart yok';
  return { id: 'H9', measure: 'İlk tekrar doğruluğu, yaklaşık alt sınır (tekrara geçmiş kartlar)', value, target: 'artar', status: '14. ve 30. gün raporuyla karşılaştır' };
}

function overview(cards) {
  const byState = {};
  cards.forEach((c) => { byState[c.state || '?'] = (byState[c.state || '?'] || 0) + 1; });
  const states = ['new', 'learning', 'review', 'relearning'].map((s) => `${s} ${byState[s] || 0}`).join(' · ');
  const meanS = cards.length ? cards.reduce((sum, c) => sum + c.s, 0) / cards.length : 0;
  const lapsed = cards.filter((c) => c.lapses > 0).length;
  return `${cards.length} kart (${states}) · ortalama s ${meanS.toFixed(1).replace('.', ',')} gün · en az bir kez unutulan ${cards.length ? pct(lapsed / cards.length) : '—'}`;
}

function h3(cards) {
  const value = ['A', 'B'].map((arm) => {
    const group = cards.filter((card) => card.arm === arm);
    const mean = group.length ? (group.reduce((sum, card) => sum + card.s, 0) / group.length).toFixed(2).replace('.', ',') : '—';
    const reviewed = group.filter((card) => card.reps > 0);
    const reps = reviewed.reduce((sum, card) => sum + card.reps, 0);
    const lapses = reviewed.reduce((sum, card) => sum + card.lapses, 0);
    return `${arm}: n=${group.length}, ortalama s ${mean} gün, unutma ${reps ? pct(lapses / reps) : '—'} (${lapses}/${reps})`;
  }).join(' · ');
  return { id: 'H3', measure: 'Merdiven (A) ve tanıma (B) kolları', value, target: 'A: daha yüksek s, daha düşük unutma', status: 'Anlık kelime kartı özeti; unutma = toplam lapses/reps (reps > 0); kesim uygulanmaz. 30. gün deney sonucu değildir.' };
}

function buildReport(backup, opts) {
  const p = project(backup);
  const today = (opts && opts.today) || (p.daily.length ? p.daily[p.daily.length - 1].date : null);
  if (!today) throw new Error('yedekte çalışma günü yok (quranLearn.daily boş)');
  const cut = (opts && opts.cut) || shiftDate(today, -(WINDOW_DAYS - 1));
  const daily = p.daily.filter((r) => r.date <= today);
  const rows = [
    h2(daily, today, cut),
    h3(p.cards),
    h4(daily),
    h5(daily, p.lessons),
    h7(daily, cut),
    h8(p.lessons),
    h9(p.cards)
  ];
  return { today, cut, defaultCut: !(opts && opts.cut), rows, overview: overview(p.cards) };
}

function render(report, sourceLabel) {
  const lines = [
    'K3P deney raporu · yalnız toplu sayılar (kelime, metin ve kimlik yok)',
    `kaynak: ${sourceLabel} · bugün ${report.today} · kesim ${report.cut}${report.defaultCut ? ' (varsayılan: son 14 gün)' : ''}`,
    '',
    '| # | Ölçü | Değer | Hedef | Durum |',
    '| --- | --- | --- | --- | --- |'
  ];
  report.rows.forEach((r) => lines.push(`| ${r.id} | ${r.measure} | ${r.value} | ${r.target} | ${r.status} |`));
  lines.push('', `Genel: ${report.overview}`);
  return lines.join('\n');
}

// Sentetik yedek: 28 gün, elle hesaplanabilir. İzin dışı alanlarda bilerek sızıntı yemi var
// (Arapça dize, sır benzeri ayar, kimlik biçimli anahtarlar); rapor bunların hiçbirini göstermemeli.
function sampleBackup() {
  const decoyArabic = String.fromCharCode(0x0628, 0x0633, 0x0645);
  const daily = {};
  for (let i = 1; i <= 28; i += 1) {
    const date = `2026-02-${String(i).padStart(2, '0')}`;
    if (i === 5 || i === 20) { daily[date] = { answered: 3, correct: 1, new: 3, reviewed: 0 }; continue; }
    const after = i >= 15;
    const correct = !after ? 8 : i % 2 ? 9 : 10;          // önce hep %80; sonra %90 ve %100 dönüşümlü
    const ok = !after ? 4 : i % 2 ? 5 : 4;                 // tekrar bandı: önce 4/5; sonra 5/5 ve 4/5
    // H4: s ≥ 21 kartların (katlanmış okunuş) doğruluğu. Önce 4/5, kesimden sonra 5/5.
    const s21 = { n: 5, ok: after ? 5 : ok };
    daily[date] = { answered: 10, correct, new: 5, reviewed: 5, calib: { pred: 4, ok: correct, n: 10, bands: [{ pred: 4, ok, n: 5 }], s21 }, note: decoyArabic };
  }
  const cards = {};
  for (let i = 0; i < 10; i += 1) cards[`w:sample${i}`] = { s: 10 + i, d: 5, reps: 3, lapses: i < 7 ? 0 : 1, state: 'review', ar: decoyArabic };
  for (let i = 0; i < 4; i += 1) cards[`s:1:${i + 1}:1`] = { s: 0, reps: 1, lapses: 0, state: 'learning', ar: decoyArabic };
  const placement = '2026-02-01T09:00:00.000Z';
  const lessons = {
    's0.01': { startedAt: null, doneAt: placement, score: null, via: 'placement' },
    's0.02': { startedAt: null, doneAt: placement, score: null, via: 'placement' },
    's0.03': { startedAt: null, doneAt: placement, score: null, via: 'placement' },
    'u01.01': { startedAt: '2026-02-02T10:00:00.000Z', doneAt: '2026-02-03T10:10:00.000Z', score: 0.8, resume: null },
    'u01.02': { startedAt: '2026-02-06T10:00:00.000Z', doneAt: '2026-02-06T10:12:00.000Z', score: 0.9, resume: null },
    'u01.03': { startedAt: '2026-02-16T10:00:00.000Z', doneAt: '2026-02-16T10:11:00.000Z', score: 0.7, resume: null },
    'u02.01': { startedAt: '2026-02-20T10:00:00.000Z', doneAt: null, score: null, resume: { phase: 'lesson', itemId: 'w:sample1', lessonItemId: 'x' } },
    'u02.02': { startedAt: '2026-02-25T10:00:00.000Z', doneAt: null, score: null, resume: { phase: 'review', itemId: 'w:sample2' } },
    'u02.03': { startedAt: null, doneAt: null, score: null, resume: null }
  };
  return { settings: { ghToken: 'ghp_SAMPLEDECOY' }, quranLearn: { cards, daily, path: { lessons }, ayahs: { understood: ['1:1'] } } };
}

function parseArgs(argv) {
  const opts = { sample: argv.includes('--ornek'), file: null, cut: null, today: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--kesim' || a === '--bugun') {
      const v = argv[i + 1];
      if (!v || !DATE_RE.test(v) || isNaN(dayNum(v)) || shiftDate(v, 0) !== v) throw new Error(`${a} için YYYY-AA-GG biçiminde bir tarih ver`);
      opts[a === '--kesim' ? 'cut' : 'today'] = v; i += 1;
    } else if (a !== '--ornek') {
      if (a.startsWith('--')) throw new Error(`bilinmeyen seçenek: ${a}`);
      opts.file = a;
    }
  }
  if (!opts.sample && !opts.file) throw new Error('kullanım: deney-rapor.cjs --ornek | <yedek.json> [--kesim YYYY-AA-GG] [--bugun YYYY-AA-GG]');
  return opts;
}

function main() {
  let opts;
  try { opts = parseArgs(process.argv.slice(2)); } catch (err) { console.error(err.message); return 2; }
  let backup;
  if (opts.sample) backup = sampleBackup();
  else {
    try { backup = JSON.parse(fs.readFileSync(opts.file, 'utf8')); }
    catch (err) { console.error(`yedek okunamadı: ${err.code === 'ENOENT' ? 'dosya yok' : 'geçerli JSON değil'}`); return 2; }
  }
  try { console.log(render(buildReport(backup, opts), opts.sample ? 'sentetik örnek (--ornek)' : 'kullanıcı yedeği')); }
  catch (err) { console.error(`rapor üretilemedi: ${err.message}`); return 2; }
  return 0;
}

if (require.main === module) process.exitCode = main();
module.exports = { project, buildReport, render, sampleBackup };
