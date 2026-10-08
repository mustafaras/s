#!/usr/bin/env node
// D3F-13 · F-13 belge iddiaları ↔ ölçülen gerçek (salt okur, ağsız). Her kontrol iddiayı kaynağından (STATE, kod, ölçüm) türetir.
//   node kao2-duzeltme/denetim-3/evidence/D3F-13/belge-denetimi.mjs
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const read = (rel) => readFileSync(join(REPO, rel), 'utf8');
const fails = [];
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : ` — ${detail}`}`); if (!ok) fails.push(name); };

// 1 · CLAUDE.md ve AGENTS.md KAO satırı: içerik bütçesi kararı verildi (FIX LEDGER seq 239–241); "açık karar" denmez; iki dosya aynı.
const kaoLine = (rel) => read(rel).split('\n').find((l) => l.startsWith("- **Kur'an Arapçası Öğreniyorum (KAO)**")) || '';
const [claude, agents] = [kaoLine('CLAUDE.md'), kaoLine('AGENTS.md')];
check('KAO satırı iki dosyada aynı', claude && claude === agents, 'CLAUDE.md ve AGENTS.md KAO satırı farklı');
const open = (/\*\*Açık kararlar:\*\*([^*]*)/.exec(claude) || [, ''])[1];
check('içerik bütçesi "açık karar" sayılmıyor', !/130 KB/.test(open), `açık kararlar: "${open.trim()}"`);
const gz = (files) => files.reduce((sum, f) => sum + gzipSync(readFileSync(join(REPO, f)), { level: 9 }).length, 0) / 1024;
const legacy = ['Lexicon', 'Grammar', 'ShortSurahs', 'Phonics'].map((n) => `app/content/quran${n}V1.js`);
const content = gz([...legacy, 'app/content/quranCurriculumV2.js']);
check('KAO satırı içerik tavanını (256 KiB) ve ölçümün altında kaldığını söylüyor', /256 KiB/.test(claude) && content <= 256, `içerik ${content.toFixed(3)} KiB`);

// 2 · DUZELTME-SONUCU: D2F-13 anının sayıları kapanış gerçeğinden ayrılmış olmalı (kapanış: D2F-STATE).
const d2f = JSON.parse(read('kao2-duzeltme/denetim-2/D2F-STATE.json'));
const sonuc = read('kao2-duzeltme/denetim-2/DUZELTME-SONUCU.md');
const exceptions = d2f.strictExceptions.length;
check(`DUZELTME-SONUCU kapanış istisna sayısını (${exceptions}) söylüyor`, sonuc.includes(`kapanışta ${exceptions}/${exceptions}`), `"kapanışta ${exceptions}/${exceptions}" yok`);
check(`DUZELTME-SONUCU kapanış pinini (${d2f.pins.release}) söylüyor`, sonuc.includes(`kapanış pini \`${d2f.pins.release}\``), `"kapanış pini \`${d2f.pins.release}\`" yok`);
check('DUZELTME-SONUCU §2 "13 kayıt" kapanış sayısıyla ayrılmış', !/\(13 kayıt\)/.test(sonuc), '"(13 kayıt)" kapanış sayısı olmadan duruyor');
check('DUZELTME-SONUCU §4 kapanmış maddeleri açık göstermiyor', !/komutu kullanıcı çalıştırır\.\n/.test(sonuc) && !/D2F-15 yayın adımı yalnız kullanıcı kararıyla; erken yayın zaten çıktı\.\n/.test(sonuc), '§4 madde 5/7 kapanış notu yok');

// 3 · DEVIR-LISTESI §3: eşlenmeyen namaz kelimesi kapalı başlar (kod: is-closed), dokununca açılır.
const code = read('app/core/quranLearn.js');
const closedInCode = /isOpen\?'is-known':\(shown\?'is-revealed':'is-closed'\)/.test(code) && /anlamı kapalı; dokununca açılır/.test(code);
const devir = read('kao2-duzeltme/denetim-2/DEVIR-LISTESI.md');
const s3 = (/## 3\.[\s\S]*?(?=\n## 4\.)/.exec(devir) || [''])[0];
check('kod: tanınmayan kelime kapalı başlar, dokununca açılır', closedInCode, 'kaoPrayerHTML is-closed deseni bulunamadı');
check('DEVIR-LISTESI §3 "açık görünür" demiyor, kapalı başladığını söylüyor', !/"açık" görünürler/.test(s3) && /kapalı/.test(s3), s3.split('\n').pop());

console.log(fails.length ? `belge-denetimi: FAIL (${fails.length})` : 'belge-denetimi: PASS');
process.exit(fails.length ? 1 : 0);
