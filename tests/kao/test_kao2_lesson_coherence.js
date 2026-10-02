'use strict';

// K2F-19 · Ders tutarlılık kapısı (K5-03 1/3). Üç bağımsız ölçüm, hepsi eşik %60 ve "yalnız küçülür" çıtalı:
//  1) ETİKET: başlık/hedef bir dil kategorisi anıyorsa lemmaların ≥%60'ı o kategoriyi taşır; conceptId'nin
//     denetlenebilir kategorisi de. Fiil kipi/zamanı ve seslenme, sözlükte etiket olmadığı için Quranic Arabic
//     Corpus 0.4 morfolojisinden SAYILMIŞ tablodan gelir (tests/kao/fixtures/qac-lemma-morph.json; araç:
//     tools/kao2-lemma-morph-build.mjs; PERF/IMPF/IMPV ve VOC tanımları: corpus.quran.com/documentation).
//  2) ÖRNEK: kip/zaman dersinde öğrencinin GÖRDÜĞÜ örnek âyetlerin ≥%60'ında hedef kip gerçekten geçer.
//  3) ANLAM: tematik (kategorisiz, kavramsız, özet olmayan) derslerde başlık sözcüklerinin ≥%60'ı lemma
//     anlamlarında bulunur (Türkçe kök-önek örtüşmesi).
// Bugün tutmayanlar ilgili listede TAM yazılıdır (K2F-20 boşaltır). Sentetik node:vm; ağ/depo yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const THRESHOLD = 0.6;
const box = { window: {} };
vm.createContext(box);
for (const name of ['quranLexiconV1', 'quranGrammarV1', 'quranCurriculumV2']) {
  vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${name}.js`), 'utf8'), box, { filename: name });
}
const lexicon = box.window.QuranLexiconV1;
const curriculum = box.window.QuranCurriculumV2;
const grammar = box.window.QuranGrammarV1;
const morphFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/kao/fixtures/qac-lemma-morph.json'), 'utf8'));
const morph = (lemma) => morphFixture.lemmas[lemma.id] || { perf: 0, impf: 0, impv: 0, voc: 0, total: 0, examples: [] };
const attests = (key) => (lemma) => morph(lemma)[key] > 0;

const meaning = (lemma) => (lemma.meanings || []).join(' ').toLocaleLowerCase('tr');
const posIn = (...tags) => (lemma) => tags.includes(lemma.pos);
const patternIs = (re) => (lemma) => re.test(String(lemma.pattern || ''));
// Yardımcı fiil (kâne ve kardeşleri: kâne, leyse, asbaha, sâre, bâte, zalle, mâ dâme…, klasik Arapça dilbilgisi) KAPALI bir
// kümedir; anlam sözcüğü ('oldu') eşleştirmesi 'sahip oldu', 'razı oldu' gibi sıradan fiilleri de yakalayacağından kullanılmaz.
// Sözlükte bugün yalnız ikisi vardır: kâna ve asbaha.
const HELPER_VERB_IDS = new Set(['l_kaAna_febd3a', 'l_aSobaHa_69bc2c']);
const isHelperVerb = (lemma) => HELPER_VERB_IDS.has(lemma.id);

// Kategori sözlüğü: anahtar sözcük (başlık/hedef) → lemma yüklemi. Gerekçe her satırda.
const CATEGORIES = [
  // Sözlükte pos=P edatları taşır.
  { id: 'edat', re: /edat|yön belirten|'-de, -den, -e'/, test: posIn('P') },
  // Sözlükte zamir yalnız PRON etiketiyle ayrılır.
  { id: 'zamir', re: /zamir/, test: posIn('PRON') },
  { id: 'işaret', re: /işaret kelimeleri/, test: posIn('DEM') },
  { id: 'soru', re: /soru kelimeleri/, test: posIn('INTG') },
  { id: 'olumsuzluk', re: /olumsuzluk/, test: posIn('NEG') },
  { id: 'şart', re: /şart|eğer/, test: posIn('COND') },
  // 'Zaman bildiren yardımcı fiilleri' (u12.02) bir fiil dersidir; zarf-zaman yalnız 'zaman kalıpları' için aranır.
  { id: 'zaman', re: /zaman kalıpları/, test: posIn('T') },
  // 'allazî/mâ' REL: "-an, -en" ilgi bağları.
  { id: 'ilgi bağı', re: /'-an, -en' bağları/, test: posIn('REL') },
  { id: 'şüphesiz', re: /şüphesiz|pekiştirme/, test: posIn('CERT', 'ACC') },
  // RET 'bal' (hayır, aksine) idrâb harfidir, sınırlama değil: yalnız EXP (illâ).
  { id: 'ancak', re: /ancak|sınırlama/, test: posIn('EXP') },
  // Sözlükte bağlaç CONJ, istidrâk/karşıtlık AMD ve EXL ile işaretlenir (ile=LOC ayrı edat gibi etiketli).
  { id: 'bağlaç', re: /bağlaç/, test: posIn('CONJ', 'AMD', 'EXL') },
  // Seslenme: QAC'ta VOC edatı önekli kelime (yā-…) ya da anlamı "ey" olan lemma.
  { id: 'seslenme', re: /seslenme(?!k)/, test: (l) => attests('voc')(l) || /(^|\s)ey(\s|$)/.test(meaning(l)), aspect: 'voc' },
  // Kip/zaman: sözlük lemması 3. tekil geçmiş biçimidir; gerçek kullanım QAC'tan sayılır (fiil köküne ait PERF/IMPF/IMPV).
  { id: 'emir', re: /emir kipi|emir ve dua/, test: attests('impv'), aspect: 'impv' },
  { id: 'geçmiş zaman', re: /geçmiş zaman/, test: attests('perf'), aspect: 'perf' },
  { id: 'şimdiki zaman', re: /şimdiki|geniş zaman/, test: attests('impf'), aspect: 'impf' },
  { id: 'yapan/yapılan', re: /yapan ve yapılan/, test: patternIs(/ism-i (fâil|mef)/) },
  { id: 'fiilin adı', re: /fiilin adı/, test: patternIs(/masdar/) },
  { id: 'karşılaştırma', re: /karşılaştırma kalıbı/, test: patternIs(/tafdîl/) },
  // Fiil dersleri: sözlükteki fiil lemması. 'fiilin adı' (masdar) ayrı kategoridir; 'fiilini/fiillerini' eşleşir.
  // Kip/zaman ayrımı yukarıdaki QAC tabanlı kategorilerdedir.
  { id: 'fiil', re: /fiil(?!in adı)/, test: posIn('V') },
  // Yardımcı fiil (kâne, leyse, asbaha): yalnız pos=V yetmez; anlamı oldu/idi/değil/sabahladı olan fiil aranır.
  { id: 'yardımcı fiil', re: /yardımcı fiil/, test: isHelperVerb },
  { id: 'esenlik', re: /esenlik/, test: (l) => /esen|selam|selâm|barış/.test(meaning(l)) },
  { id: 'hidayet', re: /hidayet|doğru yolu bulmak/, test: (l) => /hidayet|doğru yol|yol göster|doğruya/.test(meaning(l)) }
];

// Denetlenebilir kavram kategorileri (öteki kavramlar anlam/sözdizimi; lemma yüklemiyle ölçülemez).
const CONCEPT_CATEGORY = {
  g3: ['edat', posIn('P')], g4: ['zamir', posIn('PRON')], g6: ['olumsuzluk', posIn('NEG')], g7: ['ilgi bağı', posIn('REL')],
  g9: ['işaret', posIn('DEM')], g13: ['geçmiş zaman', attests('perf'), 'perf'], g14: ['yardımcı fiil', isHelperVerb], g15: ['şimdiki zaman', attests('impf'), 'impf'],
  g16: ['şimdiki zaman', attests('impf'), 'impf'], g17: ['emir', attests('impv'), 'impv'], g19: ['yapan/yapılan', patternIs(/ism-i (fâil|mef)/)],
  g20: ['fiilin adı', patternIs(/masdar/)], g22: ['şart', posIn('COND')], g23: ['yardımcı fiil', isHelperVerb]
};

function share(lemmaIds, test) {
  const lemmas = lemmaIds.map((id) => lexicon.byId(id));
  assert.ok(lemmas.every(Boolean), 'çözülemeyen lemma kimliği');
  return lemmas.filter(test).length / lemmas.length;
}

// ÖRNEK ölçümü: dersin lemmalarının öğrenciye gösterilen örnek âyetlerinden hedef kipin geçtiği oran.
function exampleShare(lessonLemmaIds, key) {
  const rows = lessonLemmaIds.flatMap((id) => morphFixture.lemmas[id].examples);
  return rows.length ? rows.filter((row) => row[key] > 0).length / rows.length : 0;
}
function aspectKeys(lesson) {
  const text = `${lesson.title} ${lesson.goal}`.toLocaleLowerCase('tr');
  const keys = CATEGORIES.filter((c) => c.aspect && c.re.test(text)).map((c) => c.aspect);
  const concept = CONCEPT_CATEGORY[lesson.conceptId];
  if (concept && concept[2]) keys.push(concept[2]);
  return Array.from(new Set(keys));
}

// ANLAM ölçümü: tematik derslerde başlık sözcüklerinin lemma anlamlarında geçme oranı.
const STOP_WORDS = new Set(['ve', 'ile', 'veya', 'ama', 'ise', 'için', 'bir', 'bu', 'şu', 'gibi', 'kadar', 'daha', 'en', 'de', 'da', 'ki', 'mi']);
// Başlığı sözcük değil metin/özet adı taşıyan ders kimlikleri (ANLAM ölçümünün kapsamı dışı; her biri gerekçeli).
const TITLED_BY_PASSAGE = {
  'u01.05': 'Fâtiha bütünü', 'u02.03': 'namaz cümleleri bütünü', 'u03.06': 'üç sûre bütünü', 'u06.30': 'ünite pekiştirmesi'
};
// Türkçe kök-önek: mastar (-mak/-mek) ve çoğul (-lar/-ler) atılır, 3–4 harf önek karşılaştırılır.
function titleStem(word) {
  const base = word.toLocaleLowerCase('tr').replace(/[^a-zçğıöşüâîû]/g, '').replace(/(mak|mek)$/, '').replace(/(lar|ler)$/, '');
  return base.slice(0, Math.max(3, Math.min(4, base.length - 1)));
}
// KÖK ölçümü: "bir kökten / aynı kökten / kök ailesi" diyen derste lemmaların ≥%60'ı aynı kökü paylaşır (Arapça kök temelli).
const ROOT_RE = /bir kökten|aynı kökten|kök ailesi/;
function rootShare(lemmaIds) {
  const counts = new Map();
  for (const id of lemmaIds) { const root = lexicon.byId(id).root; if (root) counts.set(root, (counts.get(root) || 0) + 1); }
  return counts.size ? Math.max(...counts.values()) / lemmaIds.length : 0;
}
// Tematik = başlığı somut sözcükler taşıyan ders. Dilbilgisi kategorisi yalnız BAŞLIKTA anılıyorsa (ya da kavram/kök/özet
// dersiyse) ANLAM kapsamı dışıdır; hedef cümledeki 'fiilini tanıyacaksın' gibi sözcükler dersi muaf yapmaz, böylece
// 'İnanmak ve yapmak' gibi fiil dersleri de başlıklarıyla ölçülür.
function isThematic(lesson) {
  const title = lesson.title.toLocaleLowerCase('tr');
  const text = `${title} ${lesson.goal.toLocaleLowerCase('tr')}`;
  return !lesson.conceptId && !TITLED_BY_PASSAGE[lesson.id] && !ROOT_RE.test(text) && !CATEGORIES.some((c) => c.re.test(title));
}
function titleCoverage(lesson) {
  const words = lesson.title.toLocaleLowerCase('tr').split(/[\s,:'’‘.\-–…!?]+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  if (!words.length) return null;
  const glosses = lesson.lemmaIds.map((id) => {
    const lemma = lexicon.byId(id);
    return `${(lemma.meanings || []).join(' ')} ${(lemma.cognate && lemma.cognate.tr) || ''}`.toLocaleLowerCase('tr');
  });
  return words.filter((w) => glosses.some((g) => g.includes(titleStem(w)))).length / words.length;
}

// Birleşik başlıklar ("'Şüphesiz' ve 'ancak'", "Şart ve zaman kalıpları") iki ayrı küme sayar: tek tek %60 koşmak
// matematiksel olarak imkânsızdır; bu yüzden ders, kümelerin BİRLEŞİMİnin ≥%60'ını taşımalı ve her kümeden en az bir
// lemma içermelidir.
const JOINT_GROUPS = [['şüphesiz', 'ancak'], ['şart', 'zaman']];

// Tek ölçüm kaynağı: her giriş {kind, key, ratio, reason}; ratio < THRESHOLD ise ders o ölçümde tutarsızdır.
const pct = (ratio) => Math.round(ratio * 100);
function measures(lesson) {
  const text = `${lesson.title} ${lesson.goal}`.toLocaleLowerCase('tr');
  const out = [];
  const matched = CATEGORIES.filter((c) => c.re.test(text));
  const joint = JOINT_GROUPS.filter((group) => group.every((id) => matched.some((c) => c.id === id)));
  const inJoint = new Set(joint.flat());
  for (const category of matched) {
    if (inJoint.has(category.id)) continue;
    const ratio = share(lesson.lemmaIds, category.test);
    out.push({ kind: 'etiket', key: category.id, ratio, reason: `başlık/hedef "${category.id}" anıyor, lemmaların %${pct(ratio)}'i uyuyor` });
  }
  for (const group of joint) {
    const parts = group.map((id) => matched.find((c) => c.id === id));
    const union = share(lesson.lemmaIds, (lemma) => parts.some((c) => c.test(lemma)));
    const eachPresent = parts.every((c) => lesson.lemmaIds.some((id) => c.test(lexicon.byId(id))));
    const ratio = eachPresent ? union : 0;
    out.push({ kind: 'etiket', key: group.join('+'), ratio, reason: `başlık/hedef "${group.join(' ve ')}" anıyor, birleşim %${pct(union)}${eachPresent ? '' : ' (bir küme hiç yok)'}` });
  }
  if (ROOT_RE.test(text)) {
    const ratio = rootShare(lesson.lemmaIds);
    out.push({ kind: 'etiket', key: 'kök', ratio, reason: `başlık/hedef "kök" anıyor, lemmaların en çok %${pct(ratio)}'i aynı kökte` });
  }
  const concept = CONCEPT_CATEGORY[lesson.conceptId];
  if (concept) {
    const ratio = share(lesson.lemmaIds, concept[1]);
    out.push({ kind: 'etiket', key: `kavram:${lesson.conceptId}`, ratio, reason: `kavram ${lesson.conceptId} "${concept[0]}" bekliyor, lemmaların %${pct(ratio)}'i uyuyor` });
  }
  for (const key of aspectKeys(lesson)) {
    const ratio = exampleShare(lesson.lemmaIds, key);
    out.push({ kind: 'örnek', key, ratio, reason: `örnek âyetlerin %${pct(ratio)}'inde "${key}" geçiyor` });
  }
  if (isThematic(lesson)) {
    const ratio = titleCoverage(lesson);
    if (ratio !== null) out.push({ kind: 'anlam', key: 'başlık', ratio, reason: `başlık sözcüklerinin %${pct(ratio)}'i lemma anlamlarında var` });
  }
  return out;
}
const failing = (lesson, kinds) => measures(lesson).filter((m) => kinds.includes(m.kind) && m.ratio < THRESHOLD).map((m) => m.reason);
const incoherence = (lesson) => failing(lesson, ['etiket']);
const exampleIncoherence = (lesson) => failing(lesson, ['örnek']);
const semanticIncoherence = (lesson) => failing(lesson, ['anlam']);
// Sayısal ölçü (yeniden dağıtım araçları için): eşiğin altında kalan her ölçümün eksiği toplamı; 0 = tamamen tutarlı.
const shortfall = (lesson) => measures(lesson).reduce((sum, m) => sum + Math.max(0, THRESHOLD - m.ratio), 0);

// Bugün tutmayan derslerin TAM listeleri (K5-03). Yalnız küçülür; K2F-20 boşaltır.
const KNOWN_MISMATCH = [
  // Donmuş üniteler (Ünite 1–3): başlık/kavram metni K2F-21'de ya da sözlük genişletmesiyle çözülür.
  'u02.01', 'u02.02', 'u03.02',
  // Sözlükte yeterli lemma yok: ilgi bağı (2), "ancak" (1), yardımcı fiil (yalnız kâna ve asbaha; leyse sözlükte yok).
  'u04.01', 'u04.02', 'u07.02', 'u12.02',
  // Seslenme dersi isim lemmaları ister; isimleri fiil ünitesine taşımak sınıf kuralını bozar (G2 kararı).
  'u09.02',
  // Kök/anlam: aynı kökten ≥%60 lemma ya da yalnız 3 lemmalı küçük küme (G2 kararı).
  'u10.01', 'u11.01', 'u11.05'
];
// u07.01: örneklerin %58'i geçmiş (eşik %60; tek örnek eksik). u09.02 yukarıdaki seslenme sınırı.
const KNOWN_EXAMPLE_MISMATCH = ['u07.01', 'u09.02'];
// u08.07: "Yeterli gelmek" başlığının yarısı lemma anlamlarında; metin K2F-21'de yeniden yazılır.
const KNOWN_SEMANTIC_GAP = ['u08.07'];
// Çıta: her listenin uzunluğuyla BİREBİR eşit olmalıdır; liste küçülünce çıta da aynı commit'te düşer, büyümek ise
// listeyi ve çıtayı birlikte, bilerek değiştirmeyi gerektirir (sessiz artış yok).
const CEILING = { label: 11, example: 2, semantic: 1 };
// K5-03 denetimindeki 10 ders. Düzeltilen ders FIXED_SINCE_AUDIT'e taşınır (kapı artık yakalamaz); biri hem
// düzeltilmeden hem de hiçbir ölçümde görünmeden kaybolamaz.
const AUDITED_K5_03 = ['u02.01', 'u02.02', 'u04.01', 'u04.02', 'u09.01', 'u09.02', 'u10.01', 'u11.04', 'u11.05', 'u12.02'];
// K2F-20 yeniden dağıtımı: u09.01 (emir; lemma + örnek), u11.04 (esenlik; salâm hariç iki lemma + dolgu).
const FIXED_SINCE_AUDIT = ['u09.01', 'u11.04'];

function runChecks() {
  let passed = 0;
  const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

  const lessons = Array.from(curriculum.units).flatMap((unit) => Array.from(unit.lessons));
  const scan = (fn) => lessons.map((lesson) => ({ id: lesson.id, reasons: fn(lesson) })).filter((x) => x.reasons.length);
  const found = scan(incoherence);
  const foundExample = scan(exampleIncoherence);
  const foundSemantic = scan(semanticIncoherence);
  if (process.env.KAO_COHERENCE_DUMP) {
    for (const [name, rows] of [['ETİKET', found], ['ÖRNEK', foundExample], ['ANLAM', foundSemantic]]) {
      console.log(`--- ${name}`); rows.forEach((x) => console.log(x.id, x.reasons.join(' | ')));
    }
  }

  check(`müfredat ${lessons.length} dersi taranır; her lemma sözlükte ve QAC tablosunda çözülür`, () => {
    assert.equal(lessons.length, 109);
    assert.ok(lessons.every((l) => l.lemmaIds.length > 0 && l.lemmaIds.every((id) => lexicon.byId(id) && morphFixture.lemmas[id])));
    assert.equal(Object.keys(morphFixture.lemmas).length, lexicon.lemmas.length, 'QAC tablosu ile sözlük aynı lemma kümesi');
  });

  check('kategori sözlüğü ve kavram kategorileri gerçek kimliklere bağlı', () => {
    const conceptIds = new Set(grammar.concepts.map((c) => c.id));
    for (const id of Object.keys(CONCEPT_CATEGORY)) assert.ok(conceptIds.has(id), `kavram ${id} gramer modülünde yok`);
    for (const category of CATEGORIES) assert.ok(lessons.some((l) => category.re.test(`${l.title} ${l.goal}`.toLocaleLowerCase('tr'))), `kategori "${category.id}" hiçbir derste anılmıyor`);
  });

  check('ETİKET: tutarsız ders listesi KNOWN_MISMATCH ile TAM eşit', () => {
    assert.deepEqual(Array.from(found, (x) => x.id).sort(), Array.from(KNOWN_MISMATCH).sort(), `bulunan: ${JSON.stringify(Array.from(found, (x) => x.id))}`);
  });

  check('ÖRNEK: kip/zaman derslerinde öğrencinin gördüğü örnekler hedef kipi taşır (KNOWN_EXAMPLE_MISMATCH tam eşit)', () => {
    assert.deepEqual(Array.from(foundExample, (x) => x.id).sort(), Array.from(KNOWN_EXAMPLE_MISMATCH).sort(), `bulunan: ${JSON.stringify(Array.from(foundExample, (x) => x.id))}`);
  });

  check('ANLAM: tematik derslerde başlık sözcükleri lemma anlamlarında geçer (KNOWN_SEMANTIC_GAP tam eşit)', () => {
    assert.deepEqual(Array.from(foundSemantic, (x) => x.id).sort(), Array.from(KNOWN_SEMANTIC_GAP).sort(), `bulunan: ${JSON.stringify(Array.from(foundSemantic, (x) => x.id))}`);
  });

  check('listeler çıtayla eşit ve yinelenen kimlik yok (yalnız küçülür)', () => {
    for (const [name, list, ceiling] of [['label', KNOWN_MISMATCH, CEILING.label], ['example', KNOWN_EXAMPLE_MISMATCH, CEILING.example], ['semantic', KNOWN_SEMANTIC_GAP, CEILING.semantic]]) {
      assert.equal(list.length, ceiling, `${name}: liste ${list.length} ≠ çıta ${ceiling} (küçülünce çıtayı da düşür)`);
      assert.equal(new Set(list).size, list.length, `${name}: yinelenen kimlik`);
    }
  });

  check('kapı boş değil: sentetik tutarsız ders yakalanır, uyumlu ders geçer; denetimdeki 10 ders hâlâ görülür', () => {
    const pick = (pos) => lexicon.lemmas.filter((l) => l.pos === pos).slice(0, 5).map((l) => l.id);
    assert.ok(incoherence({ title: 'Zamirler', goal: 'x', lemmaIds: pick('N') }).length > 0, 'zamir başlığı + isim lemmaları yakalanmalı');
    assert.equal(incoherence({ title: 'İşaret kelimeleri', goal: 'x', lemmaIds: pick('DEM') }).length, 0, 'işaret başlığı + DEM lemmaları geçmeli');
    // Kip: emir dersi, emir hiç kullanılmayan fiillerle yakalanır; emirle kullanılanlarla geçer.
    const verbs = lexicon.lemmas.filter((l) => l.pos === 'V');
    const noImpv = verbs.filter((l) => morph(l).impv === 0).slice(0, 5).map((l) => l.id);
    const withImpv = verbs.filter((l) => morph(l).impv >= 10).slice(0, 5).map((l) => l.id);
    assert.ok(incoherence({ title: 'Emir kipi', goal: 'x', lemmaIds: noImpv }).length > 0, 'emir dersi + emri olmayan fiiller yakalanmalı');
    assert.equal(incoherence({ title: 'Emir kipi', goal: 'x', lemmaIds: withImpv }).length, 0, 'emir dersi + emirle kullanılan fiiller geçmeli');
    // Örnek ve anlam ölçümleri de boş geçmez.
    assert.ok(exampleIncoherence({ title: 'Emir kipi', goal: 'x', lemmaIds: noImpv }).length > 0, 'örnek ölçümü emirsiz örnekleri yakalamalı');
    assert.ok(semanticIncoherence({ title: 'Gök ve yer', goal: 'x', lemmaIds: pick('DEM') }).length > 0, 'anlam ölçümü ilgisiz lemmaları yakalamalı');
    assert.equal(semanticIncoherence({ title: 'Gök ve yer', goal: 'x', lemmaIds: curriculum.byLesson('u06.01').lemmaIds }).length, 0, 'gök/yer lemmaları geçmeli');
    // Denetim düzeltmeleri: çekimli 'fiillerini', yardımcı fiil (kâne) ve bağlaç dersleri kategori görür; RET sınırlama sayılmaz.
    const cat = (id) => CATEGORIES.find((c) => c.id === id);
    for (const word of ['fiillerini', 'fiilini']) assert.ok(cat('fiil').re.test(word), `${word} fiil kategorisine girmeli`);
    assert.ok(!cat('fiil').re.test('fiilin adı'), '"fiilin adı" masdar kategorisinde kalır');
    assert.ok(cat('yardımcı fiil').re.test('yardımcı fiil: oldu, idi') && cat('bağlaç').re.test('bağlaçlar'));
    assert.ok(!cat('ancak').test({ pos: 'RET' }), 'RET (bal) sınırlama sayılmaz');
    assert.equal(titleStem('Duymak'), 'duy'); assert.equal(titleStem('isimlerin'), 'isim');
    const flagged = new Set([...KNOWN_MISMATCH, ...KNOWN_EXAMPLE_MISMATCH, ...KNOWN_SEMANTIC_GAP]);
    for (const id of AUDITED_K5_03) assert.ok(flagged.has(id) || FIXED_SINCE_AUDIT.includes(id), `${id}: ne bilinen listelerde ne de düzeltilenlerde (K5-03)`);
    // Kök ölçümü: 4 ayrı kökten lemma yakalanır; K2F-20 sonrası 'Kök ailesi' dersi (u10.20) aynı kökten ≥%60 taşır.
  const distinctRoots = [];
  for (const lemma of lexicon.lemmas) if (lemma.root && !distinctRoots.some((l) => l.root === lemma.root) && distinctRoots.length < 4) distinctRoots.push(lemma);
  assert.ok(rootShare(distinctRoots.map((l) => l.id)) < THRESHOLD, '4 ayrı kök kök ölçümünde yakalanmalı');
  assert.ok(rootShare(curriculum.byLesson('u10.20').lemmaIds) >= THRESHOLD, 'u10.20 yeniden dağıtımla aynı kökten oluştu');
  });

  console.log(`KAO2 ders tutarlılığı: PASS (${passed} kontrol · etiket ${KNOWN_MISMATCH.length} · örnek ${KNOWN_EXAMPLE_MISMATCH.length} · anlam ${KNOWN_SEMANTIC_GAP.length} / ${lessons.length} ders)`);
}

module.exports = { THRESHOLD, lexicon, curriculum, morph, measures, incoherence, exampleIncoherence, semanticIncoherence, shortfall, rootShare, titleCoverage, TITLED_BY_PASSAGE };
if (require.main === module) runChecks();
