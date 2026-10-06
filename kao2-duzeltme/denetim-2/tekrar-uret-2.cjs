'use strict';

// KAO2-FIX denetim-2 (2026-10-06) · bağımsız kapanış denetiminin YENİ bulgularını yeniden üretir.
// Her kontrol DOĞRU davranışı bekler: bugün FAIL, düzeltmeden sonra PASS olmalıdır.
// Salt okur: node:vm içinde sentetik veri + depo dosyalarının okunması + salt-okur `git log`/`git show`.
// Ağ, tarayıcı, zamanlayıcı ve dosya yazımı yok. Çalıştır: node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs (çıkış kodu = FAIL sayısı)
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const repoRoot = path.resolve(__dirname, '../..');
const H = require(path.join(repoRoot, 'tests/kao/helpers/kao-harness.js'));
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const git = (args) => cp.execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' });

const results = [];
function check(id, finding, run) {
  let ok = false, detail = '';
  try { [ok, detail] = run(); } catch (error) { ok = false; detail = 'istisna: ' + error.message; }
  results.push({ id, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id} (${finding}) · ${detail}`);
}

// D2-01 · "Kelime dizme" görevinde aynı etiketli iki çip: görünürde doğru sıra yanlış sayılmamalı.
check('N-01', 'D2-01', () => {
  const bad = [];
  for (const swap of [true]) {
    const t = H.bootKao(); H.freshUser(t);
    t.api.kaoLesson('start', 'u08.02');
    let verdict = null;
    H.playLesson(t, { visit: (task) => {
      if (verdict !== null || task.kind !== 'order') return;
      const ord = task.choices.slice().sort((a, b) => a.ordinal - b.ordinal);
      const labels = ord.map((c) => c.label);
      const dupAt = labels.findIndex((l, i) => labels.indexOf(l) !== i);
      if (dupAt < 0) return;
      const first = labels.indexOf(labels[dupAt]);
      if (swap) { const tmp = ord[first]; ord[first] = ord[dupAt]; ord[dupAt] = tmp; }
      for (const c of ord) t.api.kaoAnswer(task.id, c.choiceId);
      verdict = { card: task.cardId, feedback: t.ui.kaoFeedback };
    } });
    if (verdict && verdict.feedback !== 'Doğru') bad.push(`${verdict.card}: aynı görünen sıra → "${String(verdict.feedback).slice(0, 60)}"`);
  }
  return [bad.length === 0, bad.join(' | ') || 'aynı etiketli çip yer değiştirince de Doğru'];
});

// D2-02 · R-01 kontrolü (tekrar-uret.cjs ve test_kao2_denetim.js) başarısız ustalıkta da PASS veriyor.
check('N-02', 'D2-02', () => {
  const src = read('tests/kao/test_kao2_denetim.js');
  const t = H.bootKao();
  const q = H.freshUser(t);
  for (const l of t.win.QuranCurriculumV2.units[0].lessons) q.path.lessons[l.id] = { startedAt: H.DEFAULT_NOW, doneAt: H.DEFAULT_NOW, score: 0.9, introducedLemmas: l.lemmaIds };
  const step = t.api.kaoNextStep(H.DEFAULT_NOW);
  t.api.kaoLesson('start', step.param);
  const st = t.ui.kaoLesson; st.at = st.plan.length - 1; st.phase = 'lesson';
  t.api.kaoLesson('finish');
  const rec = (t.data.quranLearn.path.units || {})['1'] || {};
  const recorded = Object.keys(t.data.quranLearn.path.units || {}).length > 0;
  const r01Passes = /return \[recorded \|\| after\.title !== step\.title/.test(src) && recorded;
  return [!(r01Passes && !rec.masteryAt), `R-01 koşulu (kayıt var mı) masteryAt=${rec.masteryAt} skor=${rec.masteryScore} iken ${r01Passes ? 'PASS veriyor' : 'FAIL veriyor'}`];
});

// D2-03 · R-10 kalıbı yalnız satır başındaki yazımı yakalar; girintili koşulsuz yazım geçer.
check('N-03', 'D2-03', () => {
  const src = read('tests/kao/test_kao2_kabul.js');
  const mutated = src.replace("  const report = md.join('\\n') + '\\n';", "  const report = md.join('\\n') + '\\n';\n  fs.writeFileSync(path.join(repoRoot, 'kao2-duzeltme/evidence/K2F-36/A-KABUL.md'), report);");
  const r10 = /\nfs\.writeFileSync\(path\.join\(repoRoot, '[^']*A-KABUL\.md'\)/;
  const caught = r10.test(mutated);
  return [mutated !== src && caught, `girintili koşulsuz yazım R-10 kalıbınca ${caught ? 'yakalanıyor' : 'YAKALANMIYOR'}`];
});

// D2-04 · CLAUDE.md/AGENTS.md KAO2 satırı L1'i "kullanıcıda" diyor; veride tüm metinler sourced (by: owner).
check('N-04', 'D2-04', () => {
  const texts = JSON.parse(read('docs/kuran-ogreniyorum/kao2/content/texts.tr.json'));
  const levels = {};
  (function walk(o) { if (o && typeof o === 'object') { if (o.review && o.review.level) levels[o.review.level] = (levels[o.review.level] || 0) + 1; for (const k of Object.keys(o)) if (k !== 'review') walk(o[k]); } })(texts);
  const line = read('CLAUDE.md').split('\n').find((l) => l.includes('KAO2 — Kur')) || '';
  const saysPending = /L1 \(proje sahibi\)[^.]*onayı kullanıcıda/.test(line);
  return [!(saysPending && !levels.draft), `CLAUDE.md "L1 … onayı kullanıcıda"=${saysPending} · veri: ${JSON.stringify(levels)}`];
});

// D2-05 · tests/kao/README.md envanteri gerçek tests/kao/*.js listesine eşit olmalı.
check('N-05', 'D2-05', () => {
  const files = fs.readdirSync(path.join(repoRoot, 'tests/kao')).filter((f) => /^test_.*\.js$/.test(f));
  const readme = read('tests/kao/README.md');
  const missing = files.filter((f) => !readme.includes(f));
  return [missing.length === 0, `${files.length} dosya · envanterde olmayan: ${missing.join(', ') || 'yok'}`];
});

// D2-06 · K2F-43 kullanıcı kapısı: LEDGER GATE kaydı ve P11 KANIT.md olmalı.
check('N-06', 'D2-06', () => {
  const ledger = read('kao2-duzeltme/.anti-amnesia/LEDGER.md');
  const gate = /## seq \d+ · [0-9-]+ · GATE · K2F-43/.test(ledger);
  const kanit = fs.existsSync(path.join(repoRoot, 'kao2-duzeltme/evidence/K2F-43/KANIT.md'));
  return [gate && kanit, `K2F-43 GATE kaydı=${gate} · KANIT.md=${kanit}`];
});

// D2-07 · CURRENT-STATE kapanışta baştan yazılmadı: bayat satırlar.
check('N-07', 'D2-07', () => {
  const cs = read('kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md');
  const stale = [];
  if (/Canlı gerçekler \(araçla ölçüldü, 2026-10-03\)/.test(cs)) stale.push('"Canlı gerçekler" tarihi 2026-10-03');
  if (/Kalan kapı: K2F-43 YAYIN-2/.test(cs)) stale.push('"Kalan kapı: K2F-43"');
  if (/OTURUM-BASLATICI-K2F-38/.test(cs)) stale.push('K2F-38 oturum başlatıcısı bekleyen iş');
  if (/Dal: `kao2-duzeltme` = canlı `main` \(`dc3f3f06`\)/.test(cs)) stale.push('dal satırı dc3f3f06');
  if (/CSS payı dar \(≈0,39 KiB\)/.test(cs)) stale.push('CSS payı 0,39 KiB (güncel ≈0,97)');
  return [stale.length === 0, stale.join(' · ') || 'bayat satır yok'];
});

// D2-08 · panel-v2.html styles.css pini, dosyanın program içindeki son değişikliğinden eski.
check('N-08', 'D2-08', () => {
  const pin = (read('panel-v2.html').match(/app\/styles\.css\?v=([0-9a-z]+)/) || [])[1];
  const pinCommit = git(['log', '-1', '--format=%H', `-Sapp/styles.css?v=${pin}`, '--', 'panel-v2.html']).trim();
  const fileCommit = git(['log', '-1', '--format=%H', '--', 'app/styles.css']).trim();
  let fresh = true;
  try { cp.execFileSync('git', ['merge-base', '--is-ancestor', fileCommit, pinCommit], { cwd: repoRoot }); } catch (_) { fresh = false; }
  return [fresh, `panel-v2.html styles.css?v=${pin} · styles.css son değişiklik ${fileCommit.slice(0, 8)} pin commit'inden sonra=${!fresh}`];
});

// D2-09 · aynı ders içinde aynı içerikli gramer görevi iki kez (u01.02 g1-k1 ≡ g1-k2).
check('N-09', 'D2-09', () => {
  const t = H.bootKao(); H.freshUser(t);
  t.api.kaoLesson('start', 'u01.02');
  const seen = new Map(), dup = [];
  H.playLesson(t, { visit: (task) => {
    if (task.type !== 'grammar') return;
    const sig = [task.grammarType, task.prompt, task.stimulus, (task.choices || []).map((c) => c.label).sort().join('/')].join('|');
    if (seen.has(sig)) dup.push(`${seen.get(sig)} ≡ ${task.cardId}`); else seen.set(sig, task.cardId);
  } });
  return [dup.length === 0, dup.join(', ') || 'tekrar yok'];
});

const failed = results.filter((r) => !r.ok).length;
console.log(`\nKAO2-FIX denetim-2 tekrar üretimi: ${results.length - failed}/${results.length} PASS · ${failed} FAIL`);
process.exitCode = failed;
