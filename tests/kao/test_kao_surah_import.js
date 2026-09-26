'use strict';

// KAO-FIX-02 (K-1, Y-3): kısa sûre çeviri çalışma kitabının içe alma kapısı.
// Sentetik satırlarla saf `validateSurahRow`, çalışma kitabı yazım/okuma
// gidiş-dönüşü ve kategori sayımı sınanır. Ağ, girdi dosyası ve repo yazımı yok.

const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const repoRoot = require('../repo-root');

const TOOL = path.join(repoRoot, 'tools/kao-content-freeze.mjs');
const TODAY = '2026-09-26';

function codes(errors) {
  return errors.map((error) => error.code).sort();
}

async function main() {
  const tool = await import(pathToFileURL(TOOL).href);
  const { validateSurahRow, renderSurahWorkbook, parseSurahWorkbook, classifySurahRows } = tool;
  assert.equal(typeof validateSurahRow, 'function', 'validateSurahRow dışa aktarılmalı');
  assert.equal(typeof renderSurahWorkbook, 'function', 'renderSurahWorkbook dışa aktarılmalı');
  assert.equal(typeof parseSurahWorkbook, 'function', 'parseSurahWorkbook dışa aktarılmalı');
  assert.equal(typeof classifySurahRows, 'function', 'classifySurahRows dışa aktarılmalı');

  const valid = { id: 's-95-1-2', tr: 'incir', verifiedBy: 'claude-opus-5.5', verifiedAt: TODAY };
  const reference = 've incire';

  // (a) tr boş → hata
  assert.deepEqual(codes(validateSurahRow({ ...valid, tr: '' }, reference)), ['missing']);
  assert.deepEqual(codes(validateSurahRow({ ...valid, tr: '   ' }, reference)), ['missing']);

  // (b) normalize edilmiş hâliyle referansla aynı → copy
  assert.deepEqual(codes(validateSurahRow({ ...valid, tr: 'Ve İncire.' }, reference)), ['copy']);
  assert.deepEqual(codes(validateSurahRow({ ...valid, tr: 've  (incire)' }, reference)), ['copy']);
  assert.deepEqual(codes(validateSurahRow({ ...valid, tr: '(o) gün' }, 'o gün')), ['copy'],
    'parantez işaretleri atılınca aynıysa kopya');
  assert.deepEqual(codes(validateSurahRow({ ...valid, tr: 'gün' }, '(o) gün')), ['copy'],
    'parantez içi atılınca aynıysa kopya');
  assert.deepEqual(codes(validateSurahRow({ ...valid, tr: 'incir' }, null)), [],
    'referansı olmayan (Diyanet) satırda kopya denetimi yapılmaz');

  // (c) İngilizce işaret kelimesi (tam kelime) → language
  for (const tr of ['the fig', 'Their Lord', 'those who', 'which is', 'and incir', 'your Rabb']) {
    assert.deepEqual(codes(validateSurahRow({ ...valid, tr }, reference)), ['language'], tr);
  }
  for (const tr of ['theorem değil', 'andolsun', 'ofke', 'kendileri']) {
    assert.ok(!codes(validateSurahRow({ ...valid, tr }, reference)).includes('language'),
      `${tr}: kelime içi eşleşme dil hatası sayılmamalı`);
  }

  // (d) verifiedBy boş ya da verifiedAt YYYY-AA-GG değil → hata
  assert.deepEqual(codes(validateSurahRow({ ...valid, verifiedBy: '' }, reference)), ['verifiedBy']);
  for (const verifiedAt of ['', '26.09.2026', '2026-9-26', '2026-02-30', '2026-09-26T10:00']) {
    assert.deepEqual(codes(validateSurahRow({ ...valid, verifiedAt }, reference)), ['verifiedAt'], verifiedAt);
  }
  assert.deepEqual(codes(validateSurahRow({ ...valid, tr: 'a | b' }, reference)), ['format'],
    'tablo ayırıcısı taşıyan tr reddedilmeli');

  // (e) geçerli satır → hata yok
  assert.deepEqual(validateSurahRow(valid, reference), []);

  // Çalışma kitabı gidiş-dönüşü: bölümler, sütunlar, ipucu kısaltması
  const source = [
    { part: 'A', id: 's-95-1-1', ar: 'وَالتِّينِ', pronunciation: 'vat-tîni', lemmaId: 'l_x', ref: '95:1:1', referenceTr: 'andolsun incire ve zeytine uzun', hint: 'andolsun incire ve zeytine uzun' },
    { part: 'D', id: 'f-1-1-1', ar: 'بِسْمِ', pronunciation: 'bismi', lemmaId: 'l_y', ref: '1:1:1', referenceTr: 'adıyla', hint: 'adıyla' },
    { part: 'D', id: 'lp_abc', ar: 'أَكْبَرُ', pronunciation: 'akbaru', lemmaId: 'lp_abc', ref: 'prayer:tekbir', referenceTr: null, hint: 'en büyüktür' }
  ];
  const values = new Map([['f-1-1-1', { tr: 'adıyla başlarım', verifiedBy: 'claude-opus-5.5', verifiedAt: TODAY }]]);
  const markdown = renderSurahWorkbook(source, values);
  for (const heading of ['## Parti A (95–98)', '## Parti B (99–105)', '## Parti C (106–114)', '## Parti D (Fâtiha + tamamlayıcı sözlük)']) {
    assert.ok(markdown.includes(heading), `${heading} başlığı olmalı`);
  }
  assert.ok(markdown.includes('| id | ar | pronunciation | lemmaId | ref | referans-ipucu | tr | verifiedBy | verifiedAt |'));
  assert.ok(markdown.includes('andolsun incire ve zeyti…'), 'ipucu ilk 24 karakter + … olmalı');
  assert.ok(!markdown.includes('zeytine uzun'), 'referansın tamamı yazılmamalı');
  const parsed = parseSurahWorkbook(markdown);
  assert.equal(parsed.length, 3);
  assert.deepEqual(parsed.map((row) => row.id), ['s-95-1-1', 'f-1-1-1', 'lp_abc']);
  assert.deepEqual(parsed[0], { id: 's-95-1-1', tr: '', verifiedBy: '', verifiedAt: '' });
  assert.deepEqual(parsed[1], { id: 'f-1-1-1', tr: 'adıyla başlarım', verifiedBy: 'claude-opus-5.5', verifiedAt: TODAY });
  const duplicate = markdown.split('\n').find((line) => line.startsWith('| s-95-1-1 '));
  assert.throws(() => parseSurahWorkbook(`${markdown}${duplicate}\n`), /yinelenen/, 'yinelenen satır reddedilmeli');

  // Kategori sayımı: boş satır missing (hata değil); copy/language/invalid ayrı sayılır
  const classified = classifySurahRows(source, [
    { id: 's-95-1-1', tr: '', verifiedBy: '', verifiedAt: '' },
    { id: 'f-1-1-1', tr: 'adıyla', verifiedBy: 'claude-opus-5.5', verifiedAt: TODAY },
    { id: 'lp_abc', tr: 'the greatest', verifiedBy: 'claude-opus-5.5', verifiedAt: TODAY }
  ]);
  assert.deepEqual(classified.counts, { total: 3, filled: 0, copy: 1, language: 1, missing: 1, invalid: 0 });
  assert.deepEqual(classified.rows, {}, 'yalnız geçerli satırlar doğrulanmış sayılır');
  const good = classifySurahRows(source, [
    { id: 'f-1-1-1', tr: 'adıyla başlarım', verifiedBy: 'claude-opus-5.5', verifiedAt: TODAY },
    { id: 'lp_abc', tr: 'en büyük', verifiedBy: '', verifiedAt: TODAY }
  ]);
  assert.deepEqual(good.counts, { total: 3, filled: 1, copy: 0, language: 0, missing: 1, invalid: 1 });
  assert.deepEqual(good.rows, { 'f-1-1-1': { tr: 'adıyla başlarım', verifiedBy: 'claude-opus-5.5', verifiedAt: TODAY } });
  assert.throws(() => classifySurahRows(source, [{ id: 's-999-1-1', tr: 'x', verifiedBy: 'a', verifiedAt: TODAY }]),
    /bilinmeyen/, 'kaynakta olmayan kimlik reddedilmeli');

  console.log('KAO surah import: PASS');
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
