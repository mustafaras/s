// K3PD kapısı: gerçek SKIP bildirimi yakalanır, test adındaki "skip" kelimesi atlama sayılmaz.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const gate = await import(pathToFileURL(path.join(__dirname, '../../kao3-premium/duzeltme-plani/araclar/kapi.mjs')).href);
  const hit = (out, err = '') => gate.detectSkipMarker(out, err);
  assert.equal(hit('SKIP local input missing'), true, 'satır başı SKIP');
  assert.equal(hit('PASS a\n  SKIP: girdi yok'), true, 'girintili SKIP:');
  assert.equal(hit('[SKIP] freeze girdisi yok'), true, 'köşeli SKIP');
  assert.equal(hit('', 'SKIP'), true, 'stderr tek başına SKIP');
  assert.equal(hit('PASS  girdi varsa tablo araçla bayt-eşit yeniden üretilir (yoksa SKIP)'), false, 'test adı sonunda (yoksa SKIP)');
  assert.equal(hit('PASS  REQ-021 positive: heading blocks become numbered skip targets'), false, 'skip targets');
  assert.equal(hit('PASS  çekim hatası SKIP olarak yutulmuyor (fail-closed)'), false, 'ortada SKIP');
  assert.equal(hit('  ✓ input skip UI’da görünür'), false, 'skip UI');
  assert.equal(hit('PASS tümü'), false, 'temiz çıktı');
  console.log('PASS test_k3pd_skip_marker: 4 gerçek SKIP biçimi yakalanır, 5 sahte pozitif geçer');
})().catch((error) => { console.error(error); process.exit(1); });
