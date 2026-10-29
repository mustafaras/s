'use strict';
// K3P-05 · deney-rapor.cjs: yalnız toplu sayı basar (Arapça, kart/ders kimliği, sır yok), sentetik örnekte
// elle hesaplanan değerleri verir, izin dışı alanları okumaz ve hatalı girdide 2 ile çıkar. Ağsız; gerçek veri yok.
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = require('../repo-root');

const tool = path.join(root, 'tools', 'kao3', 'deney-rapor.cjs');
const R = require(tool);
const fs = require('node:fs');
const vm = require('node:vm');
const run = (...args) => spawnSync(process.execPath, [tool, ...args], { cwd: root, encoding: 'utf8' });
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const IDS = /\b[ws]:[\w:]+|\bs0\.\d|\bu\d{2}\.\d{2}\b|sample\d|ghp_/;

// 1) --ornek: tablo basılır, sızıntı yok.
const out = run('--ornek');
assert.equal(out.status, 0, out.stderr);
const text = out.stdout;
assert.equal(R.buildReport(R.sampleBackup(), { today: '2026-02-28' }).rows.find(r => r.id === 'H7').status, 'tutmuyor', '20/26 genel oranı kesim sonrası 7/13 sonucunu yeşil yapamaz');
for (const id of ['H2', 'H3', 'H4', 'H5', 'H7', 'H8', 'H9']) assert.match(text, new RegExp(`^\\| ${id} \\|`, 'm'), `${id} satırı yok`);
assert.doesNotMatch(text, ARABIC, 'çıktıda Arapça var');
assert.doesNotMatch(text, IDS, 'çıktıda kart/ders kimliği ya da sır var');
assert.match(text, /\| H3 \|[^\n]*A: n=\d[^\n]*B: n=\d/);
// K3P-19 H4: s ≥ 21 (okunuşu katlanmış) kartların doğruluğu. Elle hesap: 26 gün × 5 = 130 cevap;
// kesimden önce 13 gün × 4 = 52, sonra 13 gün × 5 = 65 → 117/130 = %90,0 (hedef ≥ %85).
assert.match(text, /\| H4 \|[^\n]*\| R\+1 2026-02-01: %90,0 \(117\/130 cevap, 26 gün\) · legacy dışlandı \(n=0\) \| ≥ %85,0 \| tutuyor \|/);
assert.match(text, /H4 R\+1 başlangıcı 2026-02-01/);
const laterSampleCohort = run('--ornek', '--h4-baslangic', '2026-02-15');
assert.equal(laterSampleCohort.status, 0, laterSampleCohort.stderr);
assert.match(laterSampleCohort.stdout, /H4 R\+1 başlangıcı 2026-02-15/);
assert.match(laterSampleCohort.stdout, /R\+1 2026-02-15: %100,0 \(65\/65 cevap, 13 gün\) · legacy dışlandı \(n=65\)/);
assert.match(text, /30\. gün deney sonucu değildir/);
const cohortBackup = { quranLearn: { cards: {}, daily: {
  '2026-10-19': { calib: { s21: { n: 10, ok: 9 } } },
  '2026-10-21': { calib: { s21: { n: 2, ok: 1 } } },
  '2026-10-22': { calib: { s21: { n: 4, ok: 4 } } }
}, path: { lessons: {} } } };
const h4Boundary = R.buildReport(cohortBackup, { today: '2026-10-21', h4Start: '2026-10-21' });
assert.deepEqual(h4Boundary.rows.find((row) => row.id === 'H4'), {
  id: 'H4',
  measure: 'Okunuşu katlanmış (s ≥ 21) kartlarda doğruluk · R+1 cohort (öncesi LEGACY_INVALID)',
  value: 'R+1 2026-10-21: %50,0 (1/2 cevap, 1 gün) · legacy dışlandı (n=10)',
  target: '≥ %85,0',
  status: 'tutmuyor'
}, 'H4 raporu s21 legacy satırlarını dışlar, yanlış cevabı paydada tutar ve bugünden sonrasını dışlar');

// H4 legacy sınırı: eski s21 kayıtları yeni R+1 kohort sonucuna karışmaz.
assert.equal(h4Boundary.rows.find((row) => row.id === 'H4').value, 'R+1 2026-10-21: %50,0 (1/2 cevap, 1 gün) · legacy dışlandı (n=10)');
const noCohort = R.buildReport(cohortBackup, { today: '2026-10-21' }).rows.find((row) => row.id === 'H4');
assert.equal(noCohort.value, 'ölçüm yok (R+1 başlangıcı verilmedi); legacy H4 dahil edilmedi');
assert.equal(noCohort.status, 'başlangıç gerekli');
const futureCohort = R.buildReport(cohortBackup, { today: '2026-10-21', h4Start: '2026-10-23' }).rows.find((row) => row.id === 'H4');
assert.equal(futureCohort.value, 'R+1 2026-10-23: yeni kohortta veri yok · legacy dışlandı (n=12)');
assert.equal(futureCohort.status, 'veri yok');
assert.throws(() => R.buildReport(cohortBackup, { today: '2026-10-21', h4Start: '2026-02-30' }), /geçerli bir tarih/);
assert.equal(run('--ornek', '--h4-baslangic', '2026-02-30').status, 2);

// 2) Sentetik örneğin elle hesaplanan değerleri (son 14 gün varsayılan kesim: 2026-02-15).
assert.match(text, /kesim 2026-02-15 \(varsayılan: son 14 gün\)/);
assert.match(text, /önce %80,0 \(n=65\) · sonra %90,8 \(n=65\) · fark \+10,8 puan/);   // 52/65 → 59/65
assert.match(text, /\| H5 \|[^\n]*\| 2 gün \|/);                                     // yerleştirme kümesi sayılmaz
assert.match(text, /seçili dönem 2026-02-15→2026-02-28: 7\/13 gün bantta \(%53,8\) · önce: 13\/13 gün bantta \(%100,0\) · tüm dönem \(bugüne kadar\): 20\/26 gün bantta \(%76,9\)/);
assert.match(text, /2\/5 ders yarıda \(%40,0\)/);
assert.match(text, /7\/10 kart hiç unutulmadı \(%70,0\)/);

// 3) İzdüşüm yalnız izinli alanları taşır; kimlik ve izin dışı alanlar düşer.
const p = R.project(R.sampleBackup());
assert.deepEqual(Object.keys(p).sort(), ['cards', 'daily', 'lessons']);
p.cards.forEach((c) => assert.deepEqual(Object.keys(c).sort(), ['arm', 'lapses', 'reps', 's', 'state']));
p.lessons.forEach((l) => assert.deepEqual(Object.keys(l).sort(), ['doneAt', 'hasResume']));
p.daily.forEach((d) => assert.deepEqual(Object.keys(d).sort(), ['answered', 'correct', 'date', 'reviewN', 'reviewOk', 's21N', 's21Ok']));
assert.doesNotMatch(JSON.stringify(p), ARABIC);
assert.doesNotMatch(JSON.stringify(p), /sample\d|ghp_|placement|lessonItemId/);
const arm = (id) => p.cards[Number(id)].arm;
assert.ok(p.cards.slice(10).every((card) => card.arm === null));
const grouped = { quranLearn: { daily: { '2026-10-15': {} }, cards: {} } };
const ids = { A: [], B: [] };
for (let index = 0; index < 10; index += 1) ids[arm(index)].push(`w:sample${index}`);
assert.ok(ids.A.length >= 2 && ids.B.length >= 2);
for (const side of ['A', 'B']) {
  grouped.quranLearn.cards[ids[side][0]] = { s: side === 'A' ? 10 : 2, reps: 4, lapses: 1 };
  grouped.quranLearn.cards[ids[side][1]] = { s: side === 'A' ? 20 : 4, reps: 6, lapses: side === 'A' ? 0 : 2 };
}
const groupedBefore = JSON.stringify(grouped);
const h3 = R.buildReport(grouped).rows.find((row) => row.id === 'H3');
assert.match(h3.value, /A: n=2, ortalama s 15,00 gün, unutma %10,0 \(1\/10\)/);
assert.match(h3.value, /B: n=2, ortalama s 3,00 gün, unutma %30,0 \(3\/10\)/);
assert.equal(JSON.stringify(grouped), groupedBefore);
assert.match(R.buildReport({ quranLearn: { daily: { '2026-10-15': {} } } }).rows.find((row) => row.id === 'H3').value, /A: n=0, ortalama s — gün, unutma — \(0\/0\)/);

// 4) data/gunluk sarmalı ({app,date,savedAt,data}) da okunur; --bugun sonrası günler sayılmaz.
const wrapped = R.buildReport({ app: 'seyma', date: '2026-02-28', data: R.sampleBackup() }, { today: '2026-02-14' });
assert.equal(wrapped.today, '2026-02-14');
assert.match(wrapped.rows.find((r) => r.id === 'H7').value, /seçili dönem 2026-02-01→2026-02-14: 13\/13 gün/);

// 5) Hatalı girdi: kullanım, bozuk tarih, bilinmeyen seçenek, olmayan dosya, quranLearn'süz ya da günsüz yedek.
assert.equal(run().status, 2);
assert.equal(run('--ornek', '--kesim', '2026-02-30').status, 2);
assert.equal(run('--ornek', '--bilinmeyen').status, 2);
const missing = run(path.join(os.tmpdir(), 'k3p-yok-' + process.pid + '.json'));
assert.equal(missing.status, 2);
assert.match(missing.stderr, /dosya yok/);
assert.throws(() => R.buildReport({ settings: {} }), /quranLearn/);
assert.throws(() => R.buildReport({ quranLearn: { cards: {} } }), /çalışma günü yok/);

// 6) K3PD-26: seçili dönem karar verir; genel oran ve gelecek gün ayrı tutulur.
const row = (backup, id, opts = {}) => R.buildReport(backup, { today: '2026-02-28', ...opts }).rows.find(r => r.id === id);
const empty = { quranLearn: { daily: {} } };
assert.equal(row(empty, 'H7').status, 'veri yok');
assert.equal(row(empty, 'H4', { h4Start: '2026-02-01' }).status, 'veri yok');
assert.doesNotMatch(row(empty, 'H4', { h4Start: '2026-02-01' }).value, /%0/);
const sparse = { quranLearn: { daily: {
  '2026-02-01': { answered: 5, correct: 4 },
  '2026-02-15': { answered: 4, correct: 4 },
  '2026-03-01': { answered: 100, correct: 85, calib: { s21: { n: 100, ok: 100 } } },
  '2026-02-30': { answered: 100, correct: 85 }
} } };
assert.equal(row(sparse, 'H7').status, 'veri yok', 'önce ve gelecek gün seçili dönem paydasını dolduramaz');
sparse.quranLearn.daily['2026-02-15'] = { answered: 5, correct: 4 };
assert.equal(row(sparse, 'H7').status, 'tutuyor', '5 cevap sınırı dahildir; H7 için ek örnek eşiği icat edilmez');
assert.match(row(sparse, 'H7').value, /1\/1 gün bantta/);
assert.match(row(sparse, 'H7').value, /tüm dönem \(bugüne kadar\): 2\/2/);
assert.equal(row(sparse, 'H7', { cut: '2026-03-01' }).status, 'veri yok');
for (const key of ['today', 'cut', 'h4Start']) for (const value of ['', '2026-02-30', 'SYNTH_SECRET']) {
  assert.throws(() => R.buildReport(empty, { today: '2026-02-28', [key]: value }), /geçerli bir tarih/);
}
const futureOnly = { quranLearn: { daily: { '9999-01-01': { answered: 10, correct: 8 } } } };
assert.equal(R.buildReport(futureOnly).rows.find(r => r.id === 'H7').status, 'veri yok', 'varsayılan bugün gelecekteki son kayda taşınmaz');
const localBoundary = spawnSync(process.execPath, ['-e', `const R=require(${JSON.stringify(tool)}); process.stdout.write(R.localIsoDate(new Date('2026-02-15T20:59:00.000Z'))+'|'+R.localIsoDate(new Date('2026-02-15T21:00:00.000Z')));`], { cwd: root, encoding: 'utf8', env: { ...process.env, TZ: 'Europe/Istanbul' } });
assert.equal(localBoundary.status, 0, localBoundary.stderr);
assert.equal(localBoundary.stdout, '2026-02-15|2026-02-16', 'H7 varsayılan tarihi Europe/Istanbul yerel gece yarısını izler');
assert.match(row(R.sampleBackup(), 'H7', { cut: '2026-02-01' }).value, /20\/26/);
assert.equal(row(R.sampleBackup(), 'H7', { cut: '2026-02-01' }).status, 'tutuyor');

// H2 pencerelerinin her birinde en az 20 tekrar; 19 yeterli değildir, 5 puan dahildir.
const windows = (beforeN, afterN, afterOk) => ({ quranLearn: { daily: {
  '2026-02-14': { calib: { bands: [{ n: beforeN, ok: beforeN }] } },
  '2026-02-15': { calib: { bands: [{ n: afterN, ok: afterOk }] } }
} } });
assert.match(row(windows(19, 20, 20), 'H2').status, /veri az/);
assert.match(row(windows(20, 19, 19), 'H2').status, /veri az/);
assert.equal(row(windows(20, 20, 19), 'H2').status, 'tutuyor');
assert.equal(row(windows(20, 20, 18), 'H2').status, 'tutmuyor');

// H4 eski günler ve aynı gün karışımı dışarıda; bozuk/eksik sayaç başarı diye çevrilmez.
const malformed = { quranLearn: { daily: {
  '2026-02-15': { calib: { s21: { n: 5 } } },
  '2026-02-16': { calib: { s21: { n: 2, ok: 3 } } },
  '2026-02-17': { calib: { s21: { n: -1, ok: 0 } } },
  '2026-02-18': { calib: { s21: { n: 1.5, ok: 1 } } },
  '2026-02-19': { calib: { s21: { n: 0, ok: 0 } } }
} } };
assert.equal(row(malformed, 'H4', { h4Start: '2026-02-15' }).status, 'veri yok');
assert.doesNotMatch(row(malformed, 'H4', { h4Start: '2026-02-15' }).value, /%0/);
malformed.quranLearn.daily['2026-02-20'] = { calib: { s21: { n: 1, ok: 0 } } };
assert.match(row(malformed, 'H4', { h4Start: '2026-02-15' }).value, /%0,0 \(0\/1 cevap, 1 gün\)/, 'gerçek yanlış gözlem %0 olabilir');
for (const id of ['H5', 'H9']) {
  assert.match(row(R.sampleBackup(), id).measure, /Proxy:/);
  assert.match(row(R.sampleBackup(), id).status, /^NOT_MEASURED:/);
}
assert.match(row(R.sampleBackup(), 'H8').status, /^NOT_MEASURED:.*tarihli dış snapshot/);
assert.match(row(R.sampleBackup(), 'H8').measure, /Anlık snapshot/);
assert.match(row(R.sampleBackup(), 'H3').status, /nedensel etki NOT_MEASURED/);
const futureLesson = { quranLearn: { daily: { '2026-02-01': { answered: 1 } }, path: { lessons: {
  hidden: { doneAt: '2026-03-01T00:00:00.000Z' }
} } } };
assert.equal(row(futureLesson, 'H5').value, 'henüz yok');

// 7) Yasak alanlar okunmaz; CLI sahte dosya sistemi yalnız sentetik JSON döndürür.
const bait = 'SYNTH_PRIVATE_CONTENT_7';
const poisoned = R.sampleBackup();
for (const obj of [poisoned, poisoned.quranLearn, ...Object.values(poisoned.quranLearn.cards),
  ...Object.values(poisoned.quranLearn.daily), ...Object.values(poisoned.quranLearn.path.lessons)]) {
  for (const key of ['note', 'token', 'password', 'ar', 'meaning']) Object.defineProperty(obj, key, { get() { throw Error('yasak alan okundu'); } });
}
R.buildReport(poisoned, { today: '2026-02-28' });
const toolSource = fs.readFileSync(tool, 'utf8');
function virtualCli(argv, content) {
  const messages = [], reads = [];
  const mod = { exports: {} };
  const fakeFs = new Proxy({}, { get(_target, key) {
    if (key !== 'readFileSync') throw Error('dosya yazma/diğer FS çağrısı yasak');
    return (name) => {
      reads.push(name);
      if (name === 'synthetic.json') return content;
      assert.ok(['quranLearnFlow.js', 'quranLearn.js'].some(file => name === path.join(root, 'app/core', file)), 'izin dışı dosya okuması');
      return fs.readFileSync(name, 'utf8');
    };
  } });
  const req = (name) => {
    if (name === 'node:fs') return fakeFs;
    if (name === 'node:path') return path;
    if (name === 'node:vm') return vm;
    throw Error('ağ/izin dışı modül yasak');
  };
  req.main = mod;
  const context = { require: req, module: mod, __dirname: path.dirname(tool),
    process: { argv: ['node', tool, ...argv] },
    console: { log: (...v) => messages.push(v.join(' ')), error: (...v) => messages.push(v.join(' ')) },
    fetch() { throw Error('ağ yasak'); } };
  vm.runInNewContext(toolSource, context);
  return { text: messages.join('\n'), exit: context.process.exitCode, reads };
}
const leaking = R.sampleBackup();
leaking.quranLearn.cards['w:' + bait] = { s: 1, state: bait, ar: bait, note: bait, token: bait };
leaking.quranLearn.path.lessons[bait] = { doneAt: bait, resume: { note: bait } };
leaking.settings.ghToken = bait;
const cli = virtualCli(['synthetic.json', '--bugun', '2026-02-28'], JSON.stringify(leaking));
assert.equal(cli.exit, 0);
assert.doesNotMatch(cli.text, new RegExp(bait));
assert.doesNotMatch(cli.text, ARABIC);
assert.doesNotMatch(cli.text, IDS);
assert.equal(cli.reads.length, 3, 'iki kaynak modülü ve tek açık sentetik girdi; başka dosya yok');
const broken = virtualCli(['synthetic.json'], '{' + bait);
assert.equal(broken.exit, 2);
assert.doesNotMatch(broken.text, new RegExp(bait));
const unknown = run('--' + bait);
assert.equal(unknown.status, 2);
assert.doesNotMatch(unknown.stderr + unknown.stdout, new RegExp(bait));
assert.doesNotMatch(R.render(R.buildReport(leaking, { today: '2026-02-28' }), bait), new RegExp(bait));
console.log('test_k3p_deney_rapor: PASS (H7 dönem/gelecek/boş; H2 19/20 ve 5 puan; H4 legacy/eksik/bozuk; H3/H5/H8/H9 NOT_MEASURED; sızıntı/ağ/yazma 0)');
