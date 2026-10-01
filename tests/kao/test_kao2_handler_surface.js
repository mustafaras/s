'use strict';

// K2F-03 · Handler yüzeyi: KAO işaretlemesinde çağrılan her `App.kao*` adı app.js'te tanımlı,
// tek satırlık shim ve `window.SeymaQuranLearn` yüzeyinde var olmalı (K5-02 tespitinin kalıcı testi).
// Salt okur metin taraması + boş VM; ağ, tarayıcı, gerçek veri yok.
const assert = require('node:assert/strict');
const { bootKao, read } = require('./helpers/kao-harness');

// K2F-12 boşaltır: işaretlemede çağrılıp app.js'te henüz tanımlanmamış adlar. Liste yalnız küçülebilir;
// her ad gerçekten eksik olmalıdır (aşağıdaki kontrol), yoksa test listeyi bayat sayar.
const KNOWN_MISSING = []; // K2F-12 boşalttı: App.kaoS0 tanımlandı

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

const runtimeSources = ['app/core/quranLearn.js', 'app/core/quranLearnViews.js', 'app/core/quranLearnFlow.js'].map(read);
const runtimeSrc = runtimeSources.join('\n');
const appSrc = read('app.js');

// (a) Referans kümesi: App.x · name:'x' · action:'x' · kaoSegHTML çağrılarının dize olarak verdiği işleyici adları.
function referencedHandlers(src) {
  const names = new Set();
  for (const m of src.matchAll(/App\.(kao[A-Za-z0-9]+)|name:'(kao[A-Za-z0-9]+)'|action:'(kao[A-Za-z0-9]+)'/g)) names.add(m[1] || m[2] || m[3]);
  for (const line of src.split('\n')) {
    if (!/kaoSegHTML\(/.test(line) || /function kaoSegHTML/.test(line)) continue;
    for (const m of line.matchAll(/'(kao[A-Z][A-Za-z0-9]*)'/g)) names.add(m[1]);
  }
  return names;
}

const referenced = referencedHandlers(runtimeSrc);
const shimRe = /App\.(kao[A-Za-z0-9]+) *= *function\(([^)]*)\) *\{ *return window\.SeymaQuranLearn\.(kao[A-Za-z0-9]+)\.apply\(null, *arguments\); *\};/g;
const shims = [...appSrc.matchAll(shimRe)].map((m) => ({ name: m[1], target: m[3] }));
const assigned = new Set([...appSrc.matchAll(/App\.(kao[A-Za-z0-9]+) *= *function/g)].map((m) => m[1]));

check('referans kümesi bilinen çekirdek işleyicileri içerir (tarayıcı bozulmadı)', () => {
  for (const must of ['kaoLesson', 'kaoNav', 'kaoSetView', 'kaoOnboard', 'kaoOpenSurah', 'kaoSetDailyNew', 'kaoSetAudioStyle', 'kaoSetTranslit', 'kaoS0']) {
    assert.ok(referenced.has(must), `${must} referans kümesinde olmalı`);
  }
  assert.ok(referenced.size >= 30, `referans sayısı beklenenden az: ${referenced.size}`);
});

check('işaretlemede çağrılan her App.kao* app.js\'te tanımlı (KNOWN_MISSING hariç)', () => {
  const missing = [...referenced].filter((n) => !assigned.has(n) && !KNOWN_MISSING.includes(n));
  assert.deepEqual(missing, [], `app.js'te tanımsız: ${missing.join(', ')}`);
});

check('KNOWN_MISSING bayat değil: listedeki her ad gerçekten çağrılıyor ve tanımsız', () => {
  for (const name of KNOWN_MISSING) {
    assert.ok(referenced.has(name), `${name} artık çağrılmıyor; listeden çıkar`);
    assert.ok(!assigned.has(name), `${name} artık tanımlı; listeden çıkar (K2F-12 boşaltır)`);
  }
});

check(`her app.js tanımı tek satırlık shim ve aynı adlı motor işlevine bağlı (${shims.length} shim)`, () => {
  assert.equal(shims.length, assigned.size, 'her App.kao* atamasının shim biçiminde olması gerekir');
  for (const s of shims) assert.equal(s.target, s.name, `${s.name} başka bir işleve bağlı: ${s.target}`);
});

check('her shim hedefi window.SeymaQuranLearn yüzeyinde işlev olarak var', () => {
  const t = bootKao();
  const gone = shims.filter((s) => typeof t.api[s.target] !== 'function').map((s) => s.name);
  assert.deepEqual(gone, [], `motor yüzeyinde eksik: ${gone.join(', ')}`);
});

check('tanımlı ama işaretlemede çağrılmayan işleyiciler bilgi olarak sayılır (sessiz ölü kod izi)', () => {
  const unused = [...assigned].filter((n) => !referenced.has(n));
  console.log(`      · çağrılmayan tanım: ${unused.join(', ') || 'yok'}`);
  assert.ok(unused.length <= 5, `çağrılmayan tanım sayısı arttı: ${unused.length}`);
});

console.log(`test_kao2_handler_surface: ${passed} kontrol PASS · referans ${referenced.size} · tanım ${assigned.size} · eksik ${KNOWN_MISSING.length}`);
