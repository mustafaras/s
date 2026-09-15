#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   v3-tanitim · STATİK ANLIK GÖRÜNTÜ üretici (salt-okur)
   ───────────────────────────────────────────────────────────────────────────
   Kullanıcı isteği (2026-09-15): "o veriyi çek ve SADECE bu sayfada STATİK
   olarak göster". Sayfa artık çalışma anında ağa çıkmaz, anahtar aramaz;
   sayılar bu aracın ürettiği `v3-tanitim/v3-snapshot.js` dosyasından gelir.

   NASIL: `mustafaras/seyma-data` → data/latest.json'ı `gh api` ile YALNIZ GET
   eder (Contents API 1 MB üstünde gövdeyi boş döndürür → git/blobs), sonra
   sayfanın KENDİ modüllerini (v3-data/v3-stats) node:vm içinde bu veriyle
   çalıştırır ve summarize() çıktısını BUDAYARAK yazar. Böylece gömülü sayılar
   canlı yolla birebir aynıdır (aynı kod, aynı formüller).

   GİZLİLİK — `mustafaras/s` PUBLIC bir repodur. Dosyaya YALNIZ sayısal özet
   girer: not/günlük/niyet/öğün/ilaç/konum YOK, ruh hâli ETİKETİ yok (yalnız
   1–5 puan), ham gün kayıtları (`rec`) yok, `values` dizileri yok, token yok.
   Aşağıdaki FORBIDDEN listesi yazmadan önce metin düzeyinde taranır.

   ÇALIŞTIR: node tools/v3-snapshot-build.mjs   (yazma yok: --check ile karşılaştır)
   ═══════════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const OUT = path.join(ROOT, 'v3-tanitim', 'v3-snapshot.js');
const REPO = 'mustafaras/seyma-data';
const CHECK = process.argv.includes('--check');

function ghGet(endpoint, accept) {
  return execFileSync('gh', ['api', endpoint, '-H', 'Accept: ' + accept],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/* 1) Salt-okur çekme — yalnız GET */
function fetchLatest() {
  const meta = JSON.parse(ghGet(`repos/${REPO}/contents/data/latest.json`, 'application/vnd.github+json'));
  if (meta.content && meta.encoding === 'base64') {
    return JSON.parse(Buffer.from(meta.content.replace(/\s+/g, ''), 'base64').toString('utf8'));
  }
  if (!meta.sha) throw new Error('latest.json: sha yok');
  return JSON.parse(ghGet(`repos/${REPO}/git/blobs/${meta.sha}`, 'application/vnd.github.raw'));
}

/* 2) Sayfanın kendi modülleriyle özet */
function summarizeWithPage(data, today) {
  const read = (f) => fs.readFileSync(path.join(ROOT, 'v3-tanitim', f), 'utf8');
  const sb = { console, JSON, Math, Number, String, Boolean, Array, Object, isNaN, window: {},
    document: { readyState: 'complete', getElementById: () => null, querySelectorAll: () => [], addEventListener() {} },
    localStorage: { getItem: () => null } };
  /* "Bugün" = anlık görüntü tarihi — üretim tarihine sabitlenir. */
  const RealDate = Date;
  sb.Date = class extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(today + 'T12:00:00'); }
    static now() { return new RealDate(today + 'T12:00:00').getTime(); }
  };
  sb.window = sb; sb.window.localStorage = sb.localStorage; sb.window.matchMedia = () => ({ matches: false });
  ['v3-data.js', 'v3-stats.js'].forEach((f) => vm.runInNewContext(read(f), sb, { filename: f }));
  sb.window.SeymaV3Data.setData(data);
  return sb.window.SeymaV3Data.summarize();
}

/* 3) Budama — yalnız sayfanın çizdiği sayısal alanlar */
function prune(s) {
  const a = s.analytics || {};
  const stat = (p) => p && ({ n: p.n, mean: p.mean, median: p.median, mode: p.mode, std: p.std, cv: p.cv,
    min: p.min, max: p.max, q1: p.q1, q3: p.q3, iqr: p.iqr, outliers: p.outliers, outlierCount: p.outlierCount });
  const stats = {};
  Object.keys(a.stats || {}).forEach((k) => { stats[k] = stat(a.stats[k]); });
  return {
    generatedAt: s.endDate,
    startDate: s.startDate,
    endDate: s.endDate,
    nickname: s.nickname,
    daysRecorded: s.daysRecorded,
    ticks: s.ticks,
    perfectDays: s.perfectDays,
    currentStreak: s.currentStreak,
    bestStreak: s.bestStreak,
    medFreeStreak: s.medFreeStreak,
    moodTotal: s.moodTotal,
    moodTrend: s.moodTrend,                 // {date, score 1–5|null} — etiket yok
    habitSeries: s.habitSeries,             // {key, rate, days, denom}
    waterGoalDays: s.waterGoalDays,
    readingDays: s.readingDays,
    heatCells: s.heatCells,                 // {date, ticks, max, hasMood, vacation}
    badges: s.badges,
    earnedCount: s.earnedCount,
    totalBadges: s.totalBadges,
    analytics: {
      series: { mood: a.series.mood, sleep: a.series.sleep },   // yalnız çizilen iki seri (sayı)
      ma: { mood: a.ma.mood, sleep: a.ma.sleep },
      stats,
      trends: a.trends,
      momentum: a.momentum,
      correlations: a.correlations,
      weekday: a.weekday,
      goals: a.goals,
      hists: { sleep: a.hists.sleep, water: a.hists.water },
      minNForR: a.minNForR
    }
  };
}

const FORBIDDEN = ['"note"', '"journal"', '"intention"', '"meals"', '"ghToken"', '"token"', '"rec"',
  '"values"', '"med"', '"habits"', '"cok-iyi"', '"cok-zorlandim"', '"zorlandim"', '"moodCounts"', '"moodDist"',
  '"streaks"', '"lat"', '"lng"', '"location"'];

const data = fetchLatest();
const today = (Object.keys(data.days || {}).sort().pop() || new Date().toISOString().slice(0, 10));
const full = summarizeWithPage(data, today);
if (!full || !full.available) throw new Error('özet üretilemedi');
const snap = prune(full);
const json = JSON.stringify(snap);
const bad = FORBIDDEN.filter((t) => json.indexOf(t) >= 0);
if (bad.length) throw new Error('GİZLİLİK: yasaklı alan bulundu → ' + bad.join(', '));

const body = `/* ═══════════════════════════════════════════════════════════════════════════
   Şeyma 3.0 · STATİK ANLIK GÖRÜNTÜ — ÜRETİLMİŞ DOSYA, ELLE DÜZENLEME
   ───────────────────────────────────────────────────────────────────────────
   Kaynak : mustafaras/seyma-data → data/latest.json (salt-okur GET)
   Tarih  : ${snap.endDate} (son kayıtlı gün) · ${snap.daysRecorded} kayıtlı gün · ${snap.ticks} tik
   Üretim : node tools/v3-snapshot-build.mjs
   İçerik : YALNIZ sayısal özet — not/günlük/etiket/ham kayıt/token YOK.
   Sayfa bu nesneyi görünce ağa ÇIKMAZ, anahtar ARAMAZ; her cihazda aynı sayılar.
   ═══════════════════════════════════════════════════════════════════════════ */
window.SeymaV3Snapshot = ${json};
`;

if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  const same = cur.replace(/^[\s\S]*?window\.SeymaV3Snapshot = /, '') === json + ';\n';
  console.log(same ? 'v3-snapshot: GÜNCEL (' + snap.endDate + ')' : 'v3-snapshot: FARKLI — yeniden üret');
  process.exitCode = same ? 0 : 1;
} else {
  fs.writeFileSync(OUT, body);
  console.log('yazıldı:', path.relative(ROOT, OUT), (body.length / 1024).toFixed(1) + ' KB',
    '| gün', snap.daysRecorded, '| tik', snap.ticks, '| seri', snap.bestStreak, '| son', snap.endDate);
}
