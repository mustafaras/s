'use strict';
// KAO2-02: canlı kaynak ve sentetik VM; ağ, tarayıcı, depo veya gerçek saat yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = require('../repo-root');
const MODE = 'strict';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const removed = ['.kao-hub-spine','.kao-hub-frame','.kao-hub-ornament','.kao-hub-card::before','.kao-hub-card::after','.kao-dialog::before','.kao-dialog-frame','.kao-header','.kao-header-copy','.kao-close','.kao-header::after','.kao-header-mark','.kao-hero-rosette','.kao-summary-mark','.kao-done-mark','.kao-levels'];
function cssMetrics(source) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const selectors = rules.flatMap(m => m[1].split(',').map(s => s.trim()));
  return {
    weights: [...new Set([...css.matchAll(/\bfont-weight\s*:\s*([^;}]+)/g)].map(m => m[1].trim()))].sort(),
    uppercase: [...css.matchAll(/\btext-transform\s*:\s*uppercase\b/gi)].length,
    tracking: [...css.matchAll(/\bletter-spacing\s*:\s*(?!normal\b)[^;}]+/gi)].length,
    deco: rules.reduce((n,m) => n + (/\bcontent\s*:\s*(?:''|"")\s*(?:;|$)/.test(m[2]) ? m[1].split(',').filter(s => /::(?:before|after)\b/.test(s)).length : 0), 0),
    serif: [...css.matchAll(/Iowan Old Style/g)].length,
    removed: removed.filter(s => selectors.some(sel => sel.includes(s) && !/[\w-]/.test(sel.charAt(sel.indexOf(s) + s.length))))
  };
}
// Ölçüm yardımcılarının yorum/sınıf sınırı ve çoklu seçici davranışı.
assert.deepEqual(cssMetrics('/* font-weight:999 */ .x::before,.x::after{content:"";font-weight:400}.x{font-weight:400}').weights, ['400']);
assert.equal(cssMetrics('.x::before,.x::after{content:""} .y::before{content:"a"}').deco, 2);
assert.equal(cssMetrics('.kao-hub-spine-extra{color:red}').removed.length, 0);
const kaoCss = read('app/kao.css');
const tokenNames = ['--kao-bg','--kao-surface','--kao-label','--kao-label-2','--kao-sep','--kao-tint','--kao-accent','--kao-ok','--kao-ok-bg','--kao-fix','--kao-fix-bg','--kao-r-card','--kao-r-ctl','--kao-r-pill','--kao-gutter','--kao-gap-1','--kao-gap-2','--kao-gap-3','--kao-gap-4','--kao-row'];
assert.ok(tokenNames.every(name => kaoCss.includes(name+':')), '06 §1 tokens are declared');
assert.match(kaoCss, /#root\[data-theme="dark"\] \.kao-dialog,#root\[data-theme="dark"\] \.kao-hub-card\{/);
const metrics = cssMetrics(kaoCss);
const instant = '2026-09-28T09:00:00.000Z';
class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : [instant])); } static now() { return Date.parse(instant); } }
const files = ['quranLexiconV1','quranGrammarV1','quranShortSurahsV1','quranPhonicsV1','quranCurriculumV2','quranRevelationOrderV1','quranStrikingVersesV1'].map(n => 'app/content/'+n+'.js').concat(['app/core/quranLearnFlow.js','app/core/quranLearnViews.js','app/core/quranLearn.js']);
const primary = {}, switches = {};
// K2F-37: görünüm listesi kaynaktan türetilir (Flow VIEWS ∪ KAO_VIEW_TITLES); yeni görünüm kendiliğinden kapsanır.
const flowViews = [...read('app/core/quranLearnFlow.js').match(/var VIEWS=\{([^}]*)\}/)[1].matchAll(/([a-z0-9]+):true/g)].map(m => m[1]);
const routeViews = [...read('app/core/quranLearn.js').match(/var KAO_VIEW_TITLES=\{([^}]*)\}/)[1].matchAll(/(?:^|,)\s*([a-z0-9]+):/g)].map(m => m[1]);
const views = [...new Set(flowViews.concat(routeViews))];
assert.ok(views.length >= 17 && ['home','units','unit','word','reader','settings','stats','gate','session','grammar','concept','roots','s0','sources','map'].every(v => views.includes(v)), 'görünüm listesi kaynaktan okunamadı: ' + views.join(','));
const tags = html => html.match(/<[^>]+>/g) || [];
const hasClass = (tag,name) => (tag.match(/\bclass="([^"]*)"/) || [,''])[1].split(/\s+/).includes(name);
for (const seeded of [false,true]) {
  const label = seeded ? 'seeded' : 'empty', box = { window: {}, Date: FixedDate };
  vm.createContext(box);
  for (const file of files) vm.runInContext(read(file),box,{filename:file});
  const api = box.window.SeymaQuranLearn;
  let allowSave = false; // yalnız S0 dersini başlatırken kayıt serbest (render salt okunur kalır)
  const data = { settings:{targetBed:'23:00'}, quranJourney:{requests:{}} }, ui = {kaoOpen:true};
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  assert.equal(api.registerQuranLearn({data:()=>data,ui:()=>ui,save(){ if (!allowSave) throw Error('unexpected save'); },render(){},todayStr:()=> '2026-09-28',esc,icon:()=>'',getDay:()=>({})}),true);
  const q = api.ensureQuranLearn(data), lemma = box.window.QuranLexiconV1.lemmas[0];
  if (seeded) {
    q.startedAt = instant;
    for (const word of box.window.QuranLexiconV1.lemmas.slice(0,12)) for (const dir of ['ar>tr','tr>ar']) q.cards[`w:${word.id}:${dir}`] = {reps:3,state:'review',s:25,d:5,due:instant};
    q.daily['2026-09-28'] = {answered:24};
  }
  ui.kaoWordId = lemma.id; ui.kaoUnitId = '1'; ui.kaoSurahId = 112; ui.kaoConceptId = box.window.QuranGrammarV1.concepts[0].id;
  ui.kaoQueue = [{id:'design-task',cardId:`w:${lemma.id}:ar>tr`,isNew:!seeded}];
  ui.kaoTaskIndex = 0;
  for (const view of views) {
    ui.kaoView = view;
    if (view === 's0') { allowSave = true; assert.equal(api.kaoS0('start', 's0.01'), true, 'S0 dersi başlamadı'); allowSave = false; } // S0 ekranı başlamış bir derse bağlıdır
    const html = api.kaoOverlayHTML(instant);
    assert.match(html,/role="dialog"/); assert.ok(html.length > 1000, label+'/'+view+' rendered');
    primary[label+'/'+view] = tags(html).filter(t=>hasClass(t,'kao-primary')).length;
  }
  for (const on of [false,true]) {
    q.settings.harakat = q.settings.kaoVisible = q.settings.shadowing = q.settings.autoAdvance = on;
    q.readability.fadeHarakat = q.readability.coloredHarakat = on;
    ui.kaoView = 'settings';
    const html = api.kaoOverlayHTML(instant);
    // K2F-29: aç/kapat ayarları gerçek anahtar bileşenidir (role="switch" + aria-checked + track/thumb); etiket değer içermez.
    const toggles = [...html.matchAll(/<button\b[^>]*\brole="switch"[^>]*>[\s\S]*?<\/button>/g)].map(m=>m[0]);
    assert.equal(toggles.length,6,'altı aç/kapat ayarı ölçülmeli');
    assert.ok(toggles.every(t=>new RegExp('aria-checked="'+on+'"').test(t)), 'ayar durumları gerçekten değişmeli');
    assert.doesNotMatch(html, /:\s*(?:açık|kapalı)\s*<\/button>/, 'etiketlerde değer metni yok');
    switches[label+'/'+(on?'on':'off')] = {count:toggles.length,missing:toggles.filter(t=>!/class="kao-switch-track"/.test(t)||!new RegExp('aria-checked="'+on+'"').test(t)).length};
  }
}
console.log(`KAO2 design: ${MODE} weights=${metrics.weights.length} uppercase=${metrics.uppercase} deco=${metrics.deco} serif=${metrics.serif} primaryPerView=${JSON.stringify(primary)} switches=${JSON.stringify(switches)}`);
if (MODE === 'baseline') {
  assert.deepEqual(metrics, {weights:['600','700','750','760','780','800','850','900','950'],uppercase:4,tracking:9,deco:5,serif:3,removed});
  const expectedViews = {home:1,units:0,word:1,reader:1,settings:0,gate:0,phonics:1,ayah:1,map:0,prayer:0,stats:0,session:0};
  assert.deepEqual(primary, Object.fromEntries(['empty','seeded'].flatMap(state=>Object.entries(expectedViews).map(([view,n])=>[state+'/'+view,n]))));
  // K2F-29: baseline tarihseldir; anahtarlar artık gerçek bileşendir (strict dalı sınar).
} else {
  assert.equal(MODE,'strict');
  const violations = [];
  if(metrics.weights.length>4||metrics.weights.some(w=>!['400','500','600','700'].includes(w))) violations.push('weights');
  for(const key of ['uppercase','tracking','deco','serif']) if(metrics[key]!==0) violations.push(key);
  if(metrics.removed.length) violations.push('removed selectors');
  if(Object.values(primary).some(n=>n>1)) violations.push('primary per view');
  // (f) KAO2-09'dan itibaren zorunlu: altı aç/kapat ayarı role="switch" + doğru aria-checked taşır.
  if(Object.values(switches).some(s=>s.count!==6||s.missing!==0)) violations.push('switch semantics');
  assert.deepEqual(violations, [], 'strict tasarım ihlalleri');
}
// NavBar sözleşmesi (görsel QA): yan sütunlar eşit, başlık doğal genişlikte ortada → "‹ Kur'an Arapçası" 390px'te tek satırda kalır;
// metin tek satıra ZORLANMAZ (white-space:nowrap yok), taşan uzun başlık/etiket sarar.
{
  const bar = /\.kao-navbar\{[^}]*\}/.exec(kaoCss)[0];
  assert.match(bar, /grid-template-columns:minmax\(0,1fr\) minmax\(0,auto\) minmax\(0,1fr\)/, 'NavBar: eşit yan sütunlar + doğal başlık');
  const action = /\.kao-navbar-action\{[^}]*\}/.exec(kaoCss)[0];
  assert.doesNotMatch(action, /white-space:nowrap/, 'NavBar geri etiketi tek satıra zorlanmaz');
  assert.match(action, /overflow-wrap:anywhere/, 'çok uzun etiket sarar');
  assert.match(kaoCss, /\.kao-feedback-body\+\.kao-feedback-body\{margin-top:8px\}/, 'geri bildirim satırları arası boşluk');
}
// Görsel QA bulguları (ekran görüntüsü, 2026-10-04): çubuk opak, katlanan satır açılır görünür, uzun segment sarar.
{
  const bar = /\.kao-navbar\{[^}]*\}/.exec(kaoCss)[0];
  assert.match(bar, /background:linear-gradient\(var\(--kao-bg\),var\(--kao-bg\)\),var\(--quran-surface\)/,
    'NavBar arka planı opak olmalı: saydam --kao-bg opak yüzeyin üstüne katmanlanır (içerik çubuğun altından görünmez)');
  assert.match(bar, /top:calc\(var\(--quran-pt,22px\)\*-1\)/, 'çubuk, kaydırıcının üst dolgusu kadar yukarı yapışır: üstündeki şeritten içerik görünmez');
  assert.match(kaoCss, /\.kao-body\{[^}]*--quran-pt:22px/, 'dolgu özel değişkeni (22px)');
  assert.match(kaoCss, /\.kao-body\{padding:24px 22px 30px;--quran-pt:24px\}/, 'geniş dolgu özel değişkeni (24px)');
  assert.match(kaoCss, /\.kao-flag summary::after\{[^}]*content:/, 'katlanan satırda açılır işaretçisi (›) olmalı');
  assert.match(kaoCss, /\.kao-stats \.kao-flag summary\{[^}]*color:var\(--quran-ink\)/, 'İlerleme katlanan satırı soluk değil: özet tam mürekkep rengi');
  assert.match(kaoCss, /\.kao-flag\[open\] summary::after\{[^}]*rotate/, 'açıkken işaretçi döner');
  const seg = /\.kao-seg\{[^}]*\}/.exec(kaoCss)[0];
  assert.match(seg, /flex-wrap:wrap/, '6 niyet düğmesi tek satıra sığmaz: segment sarar');
  assert.match(/\.kao-seg button\{[^}]*\}/.exec(kaoCss)[0], /flex:1 1 80px/, 'düğme tabanı 80px: 3 düğme tek satırda eşit, 6 düğme 3+3');
}
// Görsel QA (2. tur): ikonu olmayan satırda boş alan kalmaz; kullanılan her ikon adı gerçekten tanımlıdır; işaret metne yapışmaz.
{
  const constantsSrc = read('app/core/constants.js');
  const quranSrc = read('app/core/quranLearn.js');
  const used = [...new Set([...quranSrc.matchAll(/\bicon:'([a-z0-9-]+)'/g)].map(m => m[1]))];
  const missing = used.filter(name => !new RegExp("['\"]" + name + "['\"]\\s*:").test(constantsSrc) && !constantsSrc.includes("'" + name + "'"));
  assert.deepEqual(missing, [], 'KAO satırlarında tanımsız ikon adı (boş ikon alanı bırakır): ' + missing.join(', '));
  assert.match(kaoCss, /\.kao-group-icon:empty\{display:none\}/, 'boş ikon alanı gizlenir');
  assert.match(kaoCss, /\.kao-group-row:has\(\.kao-group-icon:empty\)\{grid-template-columns:minmax\(0,1fr\) auto 12px;padding-inline:16px\}/, 'ikonsuz satır sütunları ve 16px yan boşluk');
  assert.match(kaoCss, /\.kao-group-row:has\(\.kao-group-icon:empty\) \.kao-group-separator\{left:16px\}/, 'ikonsuz satırda ayırıcı içeriğe (16px) hizalanır');
  assert.match(kaoCss, /\.kao-group-row:has\(\.kao-group-icon:empty\) \.kao-group-label\{font-size:var\(--f-body\);font-weight:400\}/, 'ikonsuz bağlantı satırı anahtar satırıyla aynı yazı ölçüsü');
  const mark = /\.kao-progress-curve li \.kao-curve-mark\{[^}]*\}/.exec(kaoCss)[0];
  assert.match(mark, /width:(1[8-9]|2\d)px/, 'işaret (●/○) metne yapışmaması için en az 18px');
}
// Tanımsız özel özellik, o bildirimi sessizce geçersiz kılar (boşluk/yazı boyutu kaybolur): kao.css'in fallback'siz kullandığı her jeton tanımlı olmalı.
{
  const defs = new Set([...(kaoCss + read('app/styles.css') + read('app/core/quranLearn.js') + read('app/core/quranLearnViews.js')).matchAll(/(--[a-zA-Z0-9-]+)\s*[:=]/g)].map(m => m[1]));
  const runtime = new Set(['--kao-ar-lh', '--kao-ar-ws']); // okunabilirlik değişkenleri: çalışma zamanında inline yazılır
  const undefinedTokens = [...new Set([...kaoCss.matchAll(/var\((--[a-zA-Z0-9-]+)\s*\)/g)].map(m => m[1]))].filter(n => !defs.has(n) && !runtime.has(n));
  assert.deepEqual(undefinedTokens, [], 'kao.css tanımsız jeton kullanıyor (bildirim sessizce düşer): ' + undefinedTokens.join(', '));
}
// Kök arama kutusu yan düğmeyle paylaşılan dar alanda kesilmeyecek kısa yer tutucu taşır.
assert.match(read('app/core/quranLearn.js'), /type="search" value="'\+esc\(query\)\+'" placeholder="Kök ara"/, 'kök arama yer tutucusu kısa ("Kök ara"), kesilmez');
assert.match(kaoCss, /\.kao-word-learning\{[^}]*margin-top:var\(--f-3\)/, 'öğrenme durumu bölümü üstteki karta yapışmaz');
// Görsel QA (K2F-37 sonrası): "Ünite ilerlemesi" kutusu (halka + metin) eski 5 px'lik ilerleme çubuğu kuralından
// yükseklik/kırpma MİRAS ALMAZ — aynı sınıf adıyla kalan ölü kural halkayı kırpıyordu (ekran görüntüsünde ")" yayı).
{
  const declared = [...kaoCss.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}@]+)\{([^{}]*)\}/g)]
    .filter(m => m[1].split(',').some(sel => sel.trim() === '.kao-unit-progress')).map(m => m[2]).join(';');
  assert.doesNotMatch(declared, /(?:^|;)\s*(?:max-)?height\s*:/, '.kao-unit-progress sabit yükseklik taşımaz (halka 44 px, kutu içeriğe göre büyür)');
  assert.doesNotMatch(declared, /overflow\s*:\s*hidden/, '.kao-unit-progress halkayı kırpmaz');
  assert.doesNotMatch(kaoCss, /\.kao-unit-progress\s+i\s*\{/, 'eski ilerleme çubuğu dolgusu (.kao-unit-progress i) ölü kural, kalmamalı');
}
// Metin taşma taraması (K2F-37 ek, %200 yakınlaştırma ≈200 px): ızgara parçaları kabuğa göre daralır, uzun sözcük kırılır, geniş tablo kaydırılır.
// Gerçek tarayıcı taraması: tools/gorsel-qa/shoot-modal.mjs (KAO_QA_SCAN=1) — 390/320/200 px'te yalnız kaydırmalı alanlar kalır.
{
  assert.match(kaoCss, /\.kao-stats,\.kao-prayer,\.kao-map\{grid-template-columns:minmax\(0,1fr\)\}/, 'ızgara kapları tek sütun minmax(0,1fr): içeriğin min-content genişliği kabuğu aşmaz');
  assert.match(kaoCss, /\.kao-stats-table\{display:block;max-width:100%;overflow-x:auto\}/, 'geniş İlerleme tablosu kaydırılır');
  assert.match(kaoCss, /\.kao-body h2,\.kao-body h3[^{]*\{overflow-wrap:anywhere\}/, 'başlıklarda uzun sözcük kırılır');
  assert.match(kaoCss, /\.kao-week-days\{grid-template-columns:repeat\(7,minmax\(0,1fr\)\)\}/, 'hafta şeridi 7 eşit daralabilir sütun');
  assert.match(kaoCss, /@media\(max-width:260px\)\{[^}]*\.kao-navbar\{grid-template-columns:minmax\(0,1fr\) auto\}[^}]*\.kao-navbar-title\{grid-column:1\/-1;grid-row:2\}/, 'çok dar ekranda NavBar başlığı ikinci satıra iner');
  assert.match(kaoCss, /\.kao-lesson-grid button[^{]*\{overflow-wrap:anywhere\}/, 'harf kontrolü mini ders düğmeleri sarar');
}
console.log('KAO2 design contract: PASS');
