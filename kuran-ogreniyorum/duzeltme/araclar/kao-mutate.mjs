// KAO denetimi: mutasyon yoklaması. Kopya dizinde (argv[2]) tek tek bozulma uygular,
// ilgili testleri koşar, orijinali geri yazar. Gerçek repoya dokunmaz.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.argv[2];
const QL = 'app/core/quranLearn.js';
const M = [
  { id: 'M01 R-A2 çeldirici s≥21', file: QL, from: 'nonNegativeNumber(card.s,0)>=21&&!!target.pos', to: 'nonNegativeNumber(card.s,0)>=0&&!!target.pos', tests: ['tests/kao/test_kao_requirements.js', 'tests/kao/test_kao_queue.js'] },
  { id: 'M02 05§6 ardışık aynı tür ≤2', file: QL, from: 'n>=2&&out[n-1].type===item.type&&out[n-2].type===item.type', to: 'false', tests: ['tests/kao/test_kao_queue.js', 'tests/kao/test_kao_requirements.js'] },
  { id: 'M03 05§6 gramer sınırı', file: QL, from: 'typeCounts.grammar>=4', to: 'typeCounts.grammar>=40', tests: ['tests/kao/test_kao_queue.js'] },
  { id: 'M04 R-C3 undo errors geri sarma', file: QL, from: 'if(undo.errors) q.errors=cloneValue(undo.errors);', to: '', tests: ['tests/kao/test_kao_requirements.js'] },
  { id: 'M05 R-A4 otomatik ses n<2', file: QL, from: 'nonNegativeNumber(card.reps,0)<2&&kaoAudioEnabled()', to: 'nonNegativeNumber(card.reps,0)<3&&kaoAudioEnabled()', tests: ['tests/kao/test_kao_requirements.js', 'tests/kao/test_kao_render.js'] },
  { id: 'M06 05§2 orphan işaretleme', file: QL, from: 'if(previousVersion!==LEXICON_VERSION) markOrphans(q.cards);', to: '', tests: ['tests/kao/test_kao_migration.js'] },
  { id: 'M07 R-A1 gece penceresi 90 dk', file: QL, from: 'if(until>90) return false;', to: 'if(until>120) return false;', tests: ['tests/kao/test_kao_requirements.js'] },
  { id: 'M08 02§1 L2 yön: ters yön adayı yok (FIX-06)', file: QL, from: 'grammarCandidates(),reverse,', to: 'grammarCandidates(),[],', tests: ['tests/kao/test_kao_queue.js', 'tests/kao/test_kao_requirements.js'] },
  { id: 'M09 günlük yeni sınırı', file: QL, from: 'if(selectedNew.length>=dailyNew) return true;', to: 'if(selectedNew.length>=dailyNew+5) return true;', tests: ['tests/kao/test_kao_queue.js', 'tests/kao/test_kao_requirements.js'] },
  { id: 'M10 02§3 eski sapma: bilinen = reps>0 (FIX-07 ters çevrildi)', file: QL, from: 'function isDurable(card){ return isSettled(card,21); }', to: "function isDurable(card){ card=card||{}; return (nonNegativeNumber(card.reps,0)>0||card.state==='review')&&card.orphan!==true; }", tests: ['tests/kao/test_kao_requirements.js', 'tests/kao/test_kao_render.js', 'tests/kao/test_kao_panel_projection.js'] },
  { id: 'M11 10§7 DİA ḥ→h', file: QL, from: "H:'ḥ'", to: "H:'h'", tests: ['tests/kao/test_kao_requirements.js', 'tests/kao/test_kao_pronunciation_contract.js'] },
  { id: 'M12 R-C5 preload none', file: QL, from: "audio.preload='none';", to: "audio.preload='auto';", all: true, tests: ['tests/kao/test_kao_privacy.js', 'tests/kao/test_kao_user_tasks.js'] },
  { id: 'M13 R-C8 panel özet anahtarı ekle', file: 'panel/panelCoverageManifest.js', from: "var QURAN_LEARN_SUMMARY_KEYS=['v',", to: "var QURAN_LEARN_SUMMARY_KEYS=['v','cards',", tests: ['tests/kao/test_kao_panel_projection.js'] },
  { id: 'M14 R-C8 özet yerine ham kök', file: 'panel/panelCoverageManifest.js', from: 'var SUMMARY_ONLY_ROOTS={quranLearn:quranLearnSummary};', to: 'var SUMMARY_ONLY_ROOTS={};', tests: ['tests/kao/test_kao_panel_projection.js', 'tests/panel/test_panel_p1_projection.js'] },
  { id: 'M15 11§2 hub kartı bileşimi', file: 'app/core/saygi.js', from: "function kaoHub(){ var f=dep('kaoHubCardHTML'); return f?f.apply(null,arguments):''; }", to: "function kaoHub(){ return ''; }", tests: ['tests/kao/test_kao_independence.js', 'tests/kao/test_kao_render.js'] },
  { id: 'M16 02§2.10 oturum içi tekrar yok (FIX-11)', file: QL, from: 'if(!correct&&!task.retry) ui.kaoQueue.push(', to: 'if(false) ui.kaoQueue.push(', tests: ['tests/kao/test_kao_requirements.js'] },
  { id: 'M17 02§2.10 tekrar sınırsız (FIX-11)', file: QL, from: 'if(!correct&&!task.retry) ui.kaoQueue.push(', to: 'if(!correct) ui.kaoQueue.push(', tests: ['tests/kao/test_kao_requirements.js'] },
];

const results = [];
for (const m of M) {
  const p = path.join(root, m.file);
  const orig = fs.readFileSync(p, 'utf8');
  if (!orig.includes(m.from)) { results.push(`${m.id}: HEDEF BULUNAMADI`); continue; }
  fs.writeFileSync(p, m.all ? orig.split(m.from).join(m.to) : orig.replace(m.from, m.to));
  const outcome = m.tests.map((t) => {
    const r = spawnSync(process.execPath, [t], { cwd: root, encoding: 'utf8', timeout: 300000 });
    return `${path.basename(t)}=${r.status === 0 ? 'GEÇTİ' : 'DÜŞTÜ'}`;
  });
  fs.writeFileSync(p, orig);
  const caught = outcome.some((o) => o.endsWith('DÜŞTÜ'));
  results.push(`${caught ? 'YAKALANDI' : 'KAÇTI    '} ${m.id} :: ${outcome.join(' ')}`);
}
console.log(results.join('\n'));
