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
for (const id of ['H2', 'H3', 'H5', 'H7', 'H8', 'H9']) assert.match(text, new RegExp(`^\\| ${id} \\|`, 'm'), `${id} satırı yok`);
assert.doesNotMatch(text, ARABIC, 'çıktıda Arapça var');
assert.doesNotMatch(text, IDS, 'çıktıda kart/ders kimliği ya da sır var');
assert.match(text, /\| H3 \|[^\n]*K3P-16 sonrası etkin/);

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
p.cards.forEach((c) => assert.deepEqual(Object.keys(c).sort(), ['lapses', 'reps', 's', 'state']));
p.lessons.forEach((l) => assert.deepEqual(Object.keys(l).sort(), ['doneAt', 'hasResume']));
p.daily.forEach((d) => assert.deepEqual(Object.keys(d).sort(), ['answered', 'correct', 'date', 'reviewN', 'reviewOk']));
assert.doesNotMatch(JSON.stringify(p), ARABIC);
assert.doesNotMatch(JSON.stringify(p), /sample\d|ghp_|placement|lessonItemId/);

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

console.log('test_k3p_deney_rapor: PASS (6 hipotez satırı, sızıntı 0, elle hesap 6/6, hata yolları 6)');
