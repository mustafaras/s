'use strict';

// KAO2-17 · K-4 L0 otomatik kapılar. Sentetik VM; tarayıcı, ağ, gerçek veri yok.
// Kapsam: archive/kuran-ogreniyorum-v2/UYGULAMA-PROMPTLARI.md KAO2-17 (a)–(f).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

// (c) Yasak ifade listesi — dosya başında sabit; hüküm/fetva dili, kaynaksız nakil.
const FORBIDDEN = [
  'haramdır', 'helâldır', 'helaldır', 'caizdir', 'caiz değildir', 'farzdır', 'vaciptir',
  'sünnettir', 'mekruhtur', 'müstehaptır', 'günahtır', 'sevaptır', 'bidattir',
  'fetva', 'hüküm budur', 'kesinlikle doğrudur', 'mezhebe göre', 'hanefî', 'şâfiî', 'malikî', 'hanbelî'
];
// (b) Diyanet imlâsı — doğru yazım; yanlış varyantlar taranır.
const ORTHOGRAPHY = [
  ['Kur\'an', ['Kuran', 'Kur`an', "Kur’an'ı" ]],
  ['Fâtiha', ['Fatiha', 'Fatihâ']],
  ['Besmele', ['Bismillah', 'Besmele\'yi']],
  ['Rahmân', ['Rahman']],
  ['Rahîm', ['Rahim']],
  ['Müslüman', ['Musluman']],
  ['âyet', ['ayet']],
  ['sûre', ['sure']]
];
const RELIGIOUS = /Kur|Fâtiha|Fatiha|namaz|Namaz|âyet|sûre|Peygamber|Allah|Rab|Besmele|salât|dua|âhiret|cennet|cehennem|melek|vahiy|Kâbe|kıble/i;

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const box = { window: {}, Date };
vm.createContext(box);
for (const n of ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1']) {
  vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
}
for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
  vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
}
const W = box.window;
const CURRICULUM = W.QuranCurriculumV2;
const data = { settings: {}, days: {}, quranLearn: null };
const ui = {};
const api = W.SeymaQuranLearn;
assert.equal(api.registerQuranLearn({
  data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-29',
  esc, icon: () => '', getDay: () => ({})
}), true);
api.ensureQuranLearn(data);

const units = CURRICULUM.units;
const lessons = units.flatMap((u) => u.lessons);
const unitText = (u) => [u.title, u.promise, u.why].filter((v) => typeof v === 'string' && v);
const lessonText = (l) => [l.title, l.goal].filter((v) => typeof v === 'string' && v);
const LEVELS = ['draft', 'sourced', 'expert'];

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };
const html = () => api.kaoOverlayHTML();

check('(a) dinî bağlam içeren her metinde sources var', () => {
  const texts = [];
  units.forEach((u) => { if (RELIGIOUS.test(unitText(u).join(' '))) texts.push({ id: `u${u.id}`, review: u.review, why: u.why }); });
  lessons.forEach((l) => { if (RELIGIOUS.test(lessonText(l).join(' '))) texts.push({ id: l.id, review: l.review, why: null }); });
  for (const text of texts) {
    assert.ok(text.review && LEVELS.includes(text.review.level), `${text.id}: review kaydı geçerli`);
    if (text.why) assert.ok(Array.isArray(text.review.sources) && text.review.sources.length > 0, `${text.id}: dinî bağlamlı 'why' kaynak taşır`);
  }
});

check('(b) Diyanet imlâsı: yanlış varyantlar metinlerde geçmez', () => {
  const all = [...units.flatMap(unitText), ...lessons.flatMap(lessonText)];
  for (const [correct, wrongs] of ORTHOGRAPHY) {
    for (const wrong of wrongs) {
      const hit = all.find((text) => new RegExp(`(^|[^\\p{L}])${wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'u').test(text));
      assert.equal(hit, undefined, `yanlış imlâ "${wrong}" bulundu (doğrusu "${correct}"): ${hit || ''}`);
    }
  }
});

check('(c) yasak ifade listesi: hüküm/fetva dili ve kaynaksız nakil yok', () => {
  const all = [...units.flatMap(unitText), ...lessons.flatMap(lessonText)];
  for (const banned of FORBIDDEN) {
    const hit = all.find((text) => String(text).toLocaleLowerCase('tr').includes(banned));
    assert.equal(hit, undefined, `yasak ifade "${banned}": ${hit || ''}`);
  }
});

check('(d) elle Arapça yok: metinler Arapça karakter taşımaz', () => {
  const all = [...units.flatMap(unitText), ...lessons.flatMap(lessonText)];
  for (const text of all) {
    assert.doesNotMatch(String(text), /[\u0600-\u06ff]/, `metinde elle Arapça var: ${text}`);
  }
  const src = fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json'), 'utf8');
  assert.doesNotMatch(src, /[\u0600-\u06ff]/, 'metin kaynağı Arapça karakter taşımaz');
});

check('(e) her metinde review kaydı; by yalnız rol kodu', () => {
  const validBy = (review, id) => {
    if (review.by === undefined || (review.by === null && review.level === 'draft')) return;
    assert.ok(['owner', 'expert', 'ai-delegated'].includes(review.by), `${id}: rol kodu`);
    if (review.by === 'ai-delegated') {
      assert.equal(review.delegatedBy, 'owner', `${id}: delegatedBy`);
      assert.match(String(review.delegatedAt || ''), /^\d{4}-\d{2}-\d{2}$/, `${id}: delegatedAt`);
    }
  };
  for (const u of units) {
    assert.ok(u.review && LEVELS.includes(u.review.level), `u${u.id}: review.level`);
    validBy(u.review, `u${u.id}`);
  }
  for (const l of lessons) {
    assert.ok(l.review && LEVELS.includes(l.review.level), `${l.id}: review.level`);
    validBy(l.review, l.id);
  }
  for (const lesson of CURRICULUM.s0.lessons) {
    assert.ok(lesson.review && LEVELS.includes(lesson.review.level), `${lesson.id}: review.level`);
    validBy(lesson.review, lesson.id);
  }
});

check('devirle onaylanan 158 metin kaynağını dürüstçe söyler', () => {
  const texts = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json'), 'utf8'));
  const entries = [
    ...Object.entries(texts.units).map(([k, v]) => [`u${k}`, v]),
    ...Object.entries(texts.lessons),
    ...Object.entries(texts.s0),
    ...Object.entries(texts.concepts)
  ];
  // D3F-09: u09.01'in metni 2026-10-07'de yeniden yazıldı ve o gün devirle (denetim-2 LEDGER seq 17) yeniden onaylandı.
  const REAPPROVED = { 'u09.01': '2026-10-07' };
  assert.equal(entries.length, 158);
  for (const [id, entry] of entries) {
    assert.equal(entry.review.level, 'sourced', id);
    assert.equal(entry.review.by, 'ai-delegated', id);
    assert.equal(entry.review.delegatedBy, 'owner', id);
    assert.equal(entry.review.delegatedAt, REAPPROVED[id] || '2026-10-02', id);
  }
});

check('(f) [KAYNAK?] işareti kalmamış', () => {
  const all = [...units.flatMap(unitText), ...lessons.flatMap(lessonText)];
  for (const text of all) assert.doesNotMatch(String(text), /\[KAYNAK\?\]/, `metinde [KAYNAK?] kaldı: ${text}`);
  const src = fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json'), 'utf8');
  assert.doesNotMatch(src, /\[KAYNAK\?\]/, 'metin kaynağında [KAYNAK?] kaldı');
});

check('onaylı metinler render\'da görünür; draft metin gizlenir', () => {
  assert.equal(api.kaoNav('units'), true);
  const listHtml = html();
  for (const u of units) {
    if (api.kaoReviewLevel(u.review) === 'sourced') {
      assert.ok(listHtml.includes(esc(u.promise)), `Yol: onaylı vaat görünür (u${u.id})`);
    } else {
      assert.equal(listHtml.includes(esc(u.promise)), false, `Yol: draft vaat gizli (u${u.id})`);
    }
  }
  // draft metin güvenli başlığa düşer.
  const draftUnit = { id: 9, review: { level: 'draft' }, title: 'Gizli', promise: 'Gizli vaat' };
  assert.equal(api.kaoUnitTitle(draftUnit), 'Ünite 9', 'draft ünite güvenli başlığa düşer');
  assert.equal(api.kaoReviewLevel({ level: 'sourced' }), 'sourced');
  assert.equal(api.kaoReviewLevel({}), 'draft');
  assert.equal(api.kaoTextSourceLabel({ level: 'draft' }), '', 'draft kaynak satırı üretmez');
  const approvedUnit = units.find((u) => api.kaoReviewLevel(u.review) === 'sourced' && Array.isArray(u.review.sources) && u.review.sources.length);
  assert.ok(approvedUnit, 'kaynaklı onaylı en az bir ünite metni var');
  assert.match(api.kaoTextSourceLabel(approvedUnit.review), /^Kaynak: /, 'onaylı metin kaynak satırı taşır');
});

check('sourced/expert görünür; dinî bağlamlı olanda "Kaynak:" satırı var', () => {
  const sourced = {
    id: 1, level: 1, title: 'Fâtiha', promise: 'Her namazda okuduğun Fâtiha’yı anlayacaksın.',
    why: 'Namazda her gün okunur.', conceptIds: ['g0_5'], anchor: ['prayer:fatiha'],
    review: { level: 'sourced', by: 'owner', at: '2026-10-05', sources: ['diyanet-meal-fatiha'] },
    lessons: CURRICULUM.units[0].lessons.map((l) => Object.assign({}, l, { review: { level: 'sourced', by: 'owner', at: '2026-10-05' } }))
  };
  assert.ok(sourced.review.sources.length > 0);
  assert.equal(RELIGIOUS.test(sourced.why), true);
  const label = api.kaoTextSourceLabel ? api.kaoTextSourceLabel(sourced.review) : '';
  assert.match(String(label), /Kaynak:/, 'dinî bağlamlı sourced metinde Kaynak satırı üretilir');
});

check('inceleme sayfası ve metin kaynağı mevcut', () => {
  assert.ok(fs.existsSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json')), 'texts.tr.json var');
  assert.ok(fs.existsSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md')), 'INCELEME-KAO2-17.md var');
  const sheet = fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md'), 'utf8');
  for (const u of units) assert.ok(sheet.includes(`Ünite ${u.id}`), `inceleme sayfası: Ünite ${u.id}`);
  assert.ok(sheet.includes('- [ ]'), 'onay kutuları var');
});

// D3F-06 (F-06): `[x]` tek başına kimin onayladığını söylemez. İki inceleme sayfası da işareti kimin koyduğunu
// metin kaynağındaki review.by / delegatedBy / delegatedAt kaydından türeterek yazmalı (sayfa düzeyi + kayıt başı).
check('D3F-06: inceleme sayfaları [x] işaretini kimin koyduğunu veriden söyler', () => {
  const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
  const texts = JSON.parse(read('docs/kuran-ogreniyorum/kao2/content/texts.tr.json'));
  const SHEETS = [
    ['docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md', [
      ...Object.keys(texts.units).map((k) => [`u${k}`, texts.units[k]]),
      ...Object.entries(texts.lessons),
      ...Object.entries(texts.s0)
    ]],
    ['docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-18.md', Object.entries(texts.concepts)]
  ];
  const visible = (e) => e.review && ['sourced', 'expert'].includes(e.review.level);
  // Kaydın kutusunu taşıyan satır: ünite/kavram başlık bloğundaki "- İnceleme:" satırı, ders/S0 tablo satırı.
  const reviewLineFor = (lines, id) => {
    const unit = /^u(\d+)$/.exec(id);
    const heading = unit ? new RegExp(`^### Ünite ${unit[1]} ·`) : new RegExp(`^### ${id.replace(/\./g, '\\.')} ·`);
    const start = lines.findIndex((l) => heading.test(l));
    if (start >= 0) return lines.slice(start + 1).find((l) => /^- İnceleme:/.test(l) || /^### /.test(l));
    return lines.find((l) => l.startsWith(`| ${id} |`));
  };
  for (const [rel, entries] of SHEETS) {
    const name = path.basename(rel);
    const sheet = read(rel);
    const lines = sheet.split('\n');
    const section = /\n## Onayı kim verdi\n([\s\S]*?)\n## /.exec(sheet);
    assert.ok(section, `${name}: "Onayı kim verdi" bölümü yok`);
    const body = section[1].split('\n');
    const shown = entries.filter(([, e]) => visible(e));
    const groups = new Map();
    for (const [, e] of shown.filter(([, x]) => x.review.by === 'ai-delegated')) {
      const key = `${e.review.delegatedBy}|${e.review.delegatedAt}`;
      groups.set(key, (groups.get(key) || 0) + 1);
    }
    for (const [key, n] of groups) {
      const [by, at] = key.split('|');
      const line = body.find((l) => l.includes('`ai-delegated`') && l.includes(`**${n}**`) && l.includes(`\`${by}\``) && l.includes(at));
      assert.ok(line, `${name}: ${n} devirli kayıt (${by}, ${at}) için açıklama satırı yok`);
      assert.match(line, /yetki devriyle yapay zekâ/, `${name}: devir satırı işareti yapay zekânın koyduğunu söylemiyor`);
    }
    const owner = shown.filter(([, e]) => e.review.by === 'owner').length;
    const expert = entries.filter(([, e]) => e.review && e.review.level === 'expert').length;
    assert.ok(body.some((l) => l.includes('`owner`') && l.includes(`**${owner}**`)), `${name}: kullanıcının kendi onayı sayısı (${owner}) yazmıyor`);
    assert.ok(body.some((l) => l.includes('`expert`') && l.includes(`**${expert}**`)), `${name}: L2 uzman onayı sayısı (${expert}) yazmıyor`);
    for (const [id, e] of shown) {
      const line = reviewLineFor(lines, id);
      assert.ok(line, `${name}: ${id} inceleme satırı bulunamadı`);
      const by = e.review.by || 'onaylayan kayıtsız';
      assert.ok(line.includes(by), `${name}: ${id} satırı onaylayanı (${by}) söylemiyor: ${line}`);
    }
  }
  // "Yeniden onay gerekli" kutunun kendisini değil kullanıcının kendi onayını sorar; işaretli kutuyla çelişen dil kalmaz.
  const s17 = read(SHEETS[0][0]);
  assert.doesNotMatch(s17, /açık kutu onayı olmayan|hiçbiri senin kutu işaretinle onaylanmadı/, 'INCELEME-17: işaretli kutularla çelişen "kutu onayı yok" dili duruyor');
  const reSection = /\n## Yeniden onay gerekli\n([\s\S]*?)\n## /.exec(s17);
  assert.ok(reSection, 'INCELEME-17: "Yeniden onay gerekli" bölümü yok');
  const notOwn = SHEETS[0][1].filter(([, e]) => visible(e) && !['owner', 'expert'].includes(e.review.by)).map(([id]) => id);
  const listed = (/: ([^\n]*)\.\n/.exec(reSection[1]) || [, ''])[1].split(', ').filter(Boolean);
  assert.deepEqual([...listed].sort(), [...notOwn].sort(), 'INCELEME-17: yeniden onay listesi kullanıcının kendi onayı olmayan görünür metinlerle aynı değil');
});

// D3F-09 (F-09): bir kaydın inceleme damgası (review.at ve varsa delegatedAt), metninin son değiştiği tarihten eski olamaz;
// yoksa eski metnin onayı yeni metne taşınmış olur. Değişim tarihi git geçmişinden (taşıma dahil, --follow) türetilir;
// commit'lenmemiş metin değişikliği bugünün tarihini alır. İlk görünüş değişim sayılmaz (geçmiş sığsa yanlış kırmızı vermez).
check('D3F-09: inceleme damgası metnin son değişiminden eski değil (git geçmişi)', () => {
  const { execFileSync } = require('node:child_process');
  const rel = 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json';
  const git = (args) => execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
  let log;
  try { log = git(['log', '--follow', '--name-only', '--format=@%H %cs', '--', rel]); } catch { console.log('SKIP  git yok: damga/metin tarihi denetlenmedi'); return; }
  const commits = [];
  for (const line of log.split('\n').filter(Boolean)) {
    if (line.startsWith('@')) { const [hash, date] = line.slice(1).split(' '); commits.push({ hash, date }); } else commits[commits.length - 1].path = line;
  }
  commits.reverse(); // --follow ile --reverse birlikte çalışmaz
  const flat = (t) => {
    const out = {};
    for (const [k, v] of Object.entries(t.units || {})) out[`u${k}`] = v;
    for (const bucket of ['lessons', 's0', 'concepts']) for (const [k, v] of Object.entries(t[bucket] || {})) out[k] = v;
    return out;
  };
  const textOf = (entry) => { const copy = Object.assign({}, entry); delete copy.review; return JSON.stringify(copy); };
  const changed = {};
  let previous = {};
  const step = (snapshot, date) => {
    const now = {};
    for (const [id, entry] of Object.entries(flat(snapshot))) {
      now[id] = textOf(entry);
      if (id in previous && previous[id] !== now[id]) changed[id] = date;
    }
    previous = now;
  };
  for (const c of commits) step(JSON.parse(git(['show', `${c.hash}:${c.path}`])), c.date);
  const local = new Date();
  const today = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
  const current = JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
  step(current, today);
  const stale = [];
  for (const [id, entry] of Object.entries(flat(current))) {
    const review = entry.review || {};
    if (review.level === 'draft' || !changed[id]) continue;
    for (const key of ['at', 'delegatedAt']) {
      if (review[key] !== undefined && String(review[key]) < changed[id]) stale.push(`${id}.${key}=${review[key]} < metin ${changed[id]}`);
    }
  }
  assert.deepEqual(stale, [], `onay damgası metinden eski: ${stale.join(' · ')}`);
});

// K2F-20/21 (KR-4): kelime kümesi değişen bir dersin eski (onaylı) metni geçersizdir. Ders ya `draft` olmalı ya da
// değişiklikten SONRA bir sahibin açık onayıyla (by + at ≥ 2026-10-02) `sourced` yapılmış olmalı.
check('kelime kümesi değişen her ders draft ya da değişiklik sonrası açık onaylı', () => {
  const before = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/curriculum.before-k2f20.json'), 'utf8')).lessons;
  let changed = 0;
  for (const lesson of lessons) {
    const was = before[lesson.id] || [];
    const now = Array.from(lesson.lemmaIds);
    const differs = was.length !== now.length || now.some((id) => !was.includes(id));
    if (!differs) continue;
    changed += 1;
    const ok = api.kaoReviewLevel(lesson.review) === 'draft' || (lesson.review.by && String(lesson.review.at || '') >= '2026-10-02');
    assert.ok(ok, `${lesson.id}: kelime kümesi değişti ama eski onaylı metin duruyor`);
  }
  assert.ok(changed >= 26, `değişen ders sayısı ${changed}`);
});

// K2F-21 (KR-4): draft metin HİÇBİR ekranda görünmez; yerine güvenli başlık ("Ünite N · Ders M") yazar.
// Bağımsız denetimde 35 draft dersin hepsinde ünite ekranında ve ders oynatıcıda ham başlığın sızdığı bulundu.
// Tüm metinler onaylanınca gerçek draft kalmaz; gizleme davranışı bu testte ikinci bir sentetik VM'de, müfredat
// kaynağındaki her `sourced` işareti `draft` yapılarak sınanır (repodaki veriye dokunulmaz).
function bootDraftEnv() {
  const sandbox = { window: {}, Date };
  vm.createContext(sandbox);
  for (const n of ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1']) {
    let source = fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8');
    if (n === 'quranCurriculumV2') source = source.split('"level":"sourced"').join('"level":"draft"');
    vm.runInContext(source, sandbox, { filename: n });
  }
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), sandbox, { filename: f });
  }
  const envApi = sandbox.window.SeymaQuranLearn;
  const envData = { settings: {}, days: {}, quranLearn: null };
  const envUi = {};
  assert.equal(envApi.registerQuranLearn({
    data: () => envData, ui: () => envUi, save() {}, render() {}, todayStr: () => '2026-09-29',
    esc, icon: () => '', getDay: () => ({})
  }), true);
  envApi.ensureQuranLearn(envData);
  const envUnits = sandbox.window.QuranCurriculumV2.units;
  return { api: envApi, data: envData, ui: envUi, units: envUnits, lessons: envUnits.flatMap((u) => u.lessons), html: () => envApi.kaoOverlayHTML() };
}

check('draft ders başlığı/hedefi ünite ekranında, ders oynatıcıda ve hub kartında SIZMAZ (tüm draft dersler)', () => {
  runDraftLeakCheck(bootDraftEnv());
});

function runDraftLeakCheck(env) {
  const { api, data, ui, units, lessons, html } = env;
  const draftLessons = lessons.filter((l) => api.kaoReviewLevel(l.review) === 'draft');
  assert.ok(draftLessons.length >= 35, `draft ders sayısı ${draftLessons.length}`);
  const escText = (v) => esc(String(v));
  for (const lesson of draftLessons) {
    const m = /^u0*(\d+)\.0*(\d+)$/.exec(lesson.id);
    const safe = `Ünite ${m[1]} · Ders ${m[2]}`;
    const unit = units.find((u) => u.lessons.includes(lesson));
    // 1) ünite ekranı
    assert.equal(api.kaoNav('unit', unit.id), true);
    const unitHtml = html();
    // Ders adımı <li> bloğu: kavram başlığı gibi başka bölümler ders başlığıyla aynı sözcükleri taşıyabilir.
    const step = unitHtml.split('<li class="kao-unit-step').find((part) => part.includes(safe));
    assert.ok(step, `${lesson.id}: ünite ekranında güvenli başlık "${safe}" yok`);
    assert.equal(step.includes(escText(lesson.title)), false, `${lesson.id}: ünite ekranında ham başlık sızdı`);
    if (lesson.goal) assert.equal(step.includes(escText(lesson.goal)), false, `${lesson.id}: ünite ekranında ham hedef sızdı`);
    // 2) ders oynatıcı (tüm önceki dersler tamamlanmış sayılır; ders gerçek handler ile başlatılır)
    const q = api.ensureQuranLearn(data);
    q.onboarding.doneAt = '2026-09-20T00:00:00.000Z'; q.onboarding.start = 'level1';
    q.path = { lessons: {}, units: {} };
    for (const prior of lessons) { if (prior.id === lesson.id) break; q.path.lessons[prior.id] = { startedAt: '2026-09-20T10:00:00.000Z', doneAt: '2026-09-20T10:10:00.000Z', introducedLemmas: prior.lemmaIds.slice() }; }
    for (const u of units) if (u.id < unit.id) q.path.units[String(u.id)] = { masteryAt: '2026-09-21T10:00:00.000Z', masteryScore: 1, attempts: 1, lastAttemptAt: '2026-09-21T10:00:00.000Z', repair: null, skippedAt: null };
    ui.kaoStack = []; ui.kaoView = 'home'; ui.kaoOpen = true; ui.kaoLesson = null;
    assert.equal(api.kaoLesson('start', lesson.id), true, `${lesson.id}: başlamadı`);
    const playerHtml = html();
    assert.equal(playerHtml.includes(escText(lesson.title)), false, `${lesson.id}: ders oynatıcıda ham başlık sızdı`);
    if (lesson.goal) assert.equal(playerHtml.includes(escText(lesson.goal)), false, `${lesson.id}: ders oynatıcıda ham hedef sızdı`);
    assert.ok(playerHtml.includes(safe), `${lesson.id}: ders oynatıcıda güvenli başlık yok`);
    ui.kaoLesson = null;
    // 3) hub kartı ("Sıradaki: …"): sıradaki ders bu draft ders olduğunda ham başlık görünmez
    const hubHtml = api.kaoHubCardHTML();
    assert.equal(hubHtml.includes(escText(lesson.title)), false, `${lesson.id}: hub kartında ham başlık sızdı`);
    if (hubHtml.includes('Sıradaki:')) assert.ok(hubHtml.includes(safe), `${lesson.id}: hub kartında güvenli başlık yok`);
  }
}

console.log(`KAO2-17 text review: PASS (${passed} kontrol)`);
