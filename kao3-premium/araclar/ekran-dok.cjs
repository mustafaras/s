'use strict';
// K3P · ekran envanteri (salt-okur, ağsız node:vm). Her KAO görünümünün ve ders aşamasının HTML'ini
// <çıktı-dizini>'ne yazar, yoğunluk ölçülerini tablo olarak basar. Tarayıcı açmaz, sunucu kurmaz.
// Kullanım: node kao3-premium/araclar/ekran-dok.cjs "$TMPDIR/kao3-ekran"
const fs = require('node:fs');
const path = require('node:path');
const H = require(path.join(__dirname, '..', '..', 'tests', 'kao', 'helpers', 'kao-harness.js'));
const out = process.argv[2];
if (!out) { console.error('çıktı dizini ver: node ekran-dok.cjs <dizin>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

const rows = [];
const count = (html, re) => (html.match(re) || []).length;
function record(name, html) {
  fs.writeFileSync(path.join(out, name + '.html'), html);
  const words = H.text(html).split(' ').length;
  rows.push([name, words, count(html, /<button/g), count(html, /class="kao-primary"/g), count(html, /lang="ar"/g)]);
}

const t = H.bootKao({ seeded: true });
const firstWord = Object.keys(t.win.QuranCurriculumV2.lemmaToLesson).find((id) => (t.win.QuranLexiconV1.byId(id) || {}).verified === true);
const VIEWS = [['home', null, 'set'], ['units', null, 'set'], ['unit', t.win.QuranCurriculumV2.units[0].id, 'nav'], ['word', firstWord, 'nav'],
  ['reader', 112, 'nav'], ['settings', null, 'set'], ['phonics', null, 'set'], ['ayah', null, 'set'], ['prayer', null, 'set'],
  ['stats', null, 'set'], ['gate', null, 'set'], ['grammar', null, 'set'], ['roots', null, 'set'], ['sources', null, 'set']];
for (const [view, param, mode] of VIEWS) {
  try { record('v-' + view, H.openView(t, view, param, { mode }).html); } catch (e) { rows.push(['v-' + view, 'HATA ' + e.message]); }
}
const fresh = H.bootKao();
fresh.api.kaoOpen('home');
record('ilk-acilis', fresh.api.kaoOverlayHTML(fresh.NOW));

// Ders oynatıcı: her aşama + her görev türünün geri bildirimi bir kez.
const L = H.bootKao({ seeded: true });
L.ui.kaoStack = []; L.api.kaoOpen('home');
L.api.kaoLesson('start', L.win.QuranCurriculumV2.units[0].lessons[0].id);
const seen = new Set();
let n = 0;
for (let guard = 0; guard < 200 && L.ui.kaoLesson; guard += 1) {
  const st = L.ui.kaoLesson, item = st.plan[st.at], key = st.phase + '-' + (item && item.kind);
  if (!seen.has(key)) { seen.add(key); record(`ders-${String(++n).padStart(2, '0')}-${key}`, L.api.kaoOverlayHTML(L.NOW)); }
  if (st.phase === 'practice' || st.phase === 'review') {
    const q = L.ui.kaoQueue[L.ui.kaoTaskIndex], task = q && L.ui.kaoTasks[q.id];
    if (!task) break;
    if (task.kind === 'order') task.choices.slice().sort((a, b) => a.ordinal - b.ordinal).forEach((c) => L.api.kaoAnswer(task.id, c.choiceId));
    else L.api.kaoAnswer(task.id, (task.choices.find((c) => c.correct) || task.choices[0]).choiceId);
    const fb = 'geribildirim-' + (task.kind || task.type);
    if (!seen.has(fb)) { seen.add(fb); record(`ders-${String(++n).padStart(2, '0')}-${fb}`, L.api.kaoOverlayHTML(L.NOW)); }
    L.api.kaoContinue();
    continue;
  }
  if (!item || item.kind === 'summary') { record(`ders-${String(++n).padStart(2, '0')}-ozet`, L.api.kaoOverlayHTML(L.NOW)); break; }
  L.api.kaoLesson('next');
}
console.log(['ekran', 'sözcük', 'düğme', 'birincil', 'arapça'].join('\t'));
console.log(rows.map((r) => r.join('\t')).join('\n'));
console.log(`\n${rows.length} ekran → ${out}`);
