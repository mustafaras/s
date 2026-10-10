'use strict';
// K3P · B-03 ölçümü (salt-okur): Latin okunuşta vasl elifi ve güneş harfi idgâmı.
// Kullanım: node kao3-premium/araclar/okunus-denetim.cjs   → bulgu varsa exit 1.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..', '..');
const box = { window: {} };
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(root, 'app/content/quranLexiconV1.js'), 'utf8'), box);
const lemmas = box.window.QuranLexiconV1.lemmas;

// Vasl elifiyle başlayan, harf-i tarif OLMAYAN lemmalar: ibn/ism/iftarâ... 'a' ile değil 'i' ile okunur.
const wasl = lemmas.filter((l) => /^ٱ/.test(l.ar) && !/^ٱل/.test(l.ar) && /^a/.test(String(l.translit || '')));
// Güneş harfiyle başlayan isimde harf-i tarif: al-rahmân → ar-rahmân / er-Rahmân.
const SUN = /\bal-(t|s̱|d|ẕ|r|z|s|ş|ṣ|ḍ|ṭ|ẓ|l|n)/;
const examples = [];
for (const l of lemmas) for (const e of (l.examples || [])) {
  const reading = String(e.translit || e.pronunciation || '');
  if (SUN.test(reading)) examples.push(reading);
}
console.log(`sözlük: ${lemmas.length} lemma`);
console.log(`vasl elifi 'a' ile okunan (harf-i tarif dışı): ${wasl.length} → ${wasl.slice(0, 8).map((l) => l.ar + '=' + l.translit).join('  ')}`);
console.log(`güneş harfi idgâmı yazılmamış örnek okunuşu: ${examples.length} → ${examples.slice(0, 2).join(' | ')}`);
process.exit(wasl.length + examples.length > 0 ? 1 : 0);
