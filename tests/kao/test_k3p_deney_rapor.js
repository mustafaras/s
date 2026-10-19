'use strict';
// K3P-05 · deney-rapor.cjs: yalnız toplu sayı basar (Arapça, kart/ders kimliği, sır yok), sentetik örnekte
// elle hesaplanan değerleri verir, izin dışı alanları okumaz ve hatalı girdide 2 ile çıkar. Ağsız; gerçek veri yok.
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = require('../repo-root');

const tool = path.join(root, 'kao3-premium', 'araclar', 'deney-rapor.cjs');
const R = require(tool);
const run = (...args) => spawnSync(process.execPath, [tool, ...args], { cwd: root, encoding: 'utf8' });
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const IDS = /\b[ws]:[\w:]+|\bs0\.\d|\bu\d{2}\.\d{2}\b|sample\d|ghp_/;

// 1) --ornek: tablo basılır, sızıntı yok.
const out = run('--ornek');
assert.equal(out.status, 0, out.stderr);
const text = out.stdout;
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
  measure: 'Okunuşu katlanmış (s ≥ 21) kartlarda doğruluk · R+1 cohort',
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
assert.match(text, /20\/26 gün bantta \(%76,9\) · kesimden sonra 7\/13/);
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
assert.match(wrapped.rows.find((r) => r.id === 'H7').value, /^13\/13 gün/);

// 5) Hatalı girdi: kullanım, bozuk tarih, bilinmeyen seçenek, olmayan dosya, quranLearn'süz ya da günsüz yedek.
assert.equal(run().status, 2);
assert.equal(run('--ornek', '--kesim', '2026-02-30').status, 2);
assert.equal(run('--ornek', '--bilinmeyen').status, 2);
const missing = run(path.join(os.tmpdir(), 'k3p-yok-' + process.pid + '.json'));
assert.equal(missing.status, 2);
assert.match(missing.stderr, /dosya yok/);
assert.throws(() => R.buildReport({ settings: {} }), /quranLearn/);
assert.throws(() => R.buildReport({ quranLearn: { cards: {} } }), /çalışma günü yok/);

console.log('test_k3p_deney_rapor: PASS (7 hipotez satırı, H4 R+1 kohort sınırı, sızıntı 0, elle hesap 7/7, hata yolları 7)');
