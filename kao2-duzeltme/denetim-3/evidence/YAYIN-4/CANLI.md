# YAYIN-4 — canlı doğrulama (2026-10-08, 16:04)

- Push: `128ab06d..700cae25` main → origin/main, fast-forward (force yok).
- Pages run: **37781196494 · Deploy static content to Pages · completed success** (head `700cae25`), GitHub API ile izlendi.
- Canlı bayt eşitliği (`curl` + `shasum -a 256`, yerel HEAD ile): **63 EŞİT / 0 FARKLI**. Liste: index.html + panel-v2.html içindeki her `?v=` bağlantısı + index.html, sw.js, panel-v2.html.
  (Denetim-3 raporu 65 URL saymıştı; bu liste yalnız iki sayfanın `?v=` bağlantılarından türetildi.)
- Gizlilik: 8/8 yol 404 (denetim-3 raporu/STATE/YAYIN, kapilar.sh, test, araç, texts.tr.json).
- Kanıt düzeyleri: kaynak/test ✓ · yayın ✓ (run success) · canlı bayt eşitliği ✓ · cihaz — (kullanıcıda; PWA önbelleği yeni SW_VERSION ile yenilenir).

## Ham sonuç
```
EŞİT    app.js?v=20261008a
EŞİT    app/content/esmaulHusnaV1.js?v=20260730p
EŞİT    app/content/esmaulHusnaV2.js?v=20260730p
EŞİT    app/content/hijriCalendar.js?v=20260730p
EŞİT    app/content/motivationNarratives.js?v=20260730p
EŞİT    app/content/motivationProgramV2.js?v=20260730p
EŞİT    app/content/profileAssessmentV1.js?v=20260730p
EŞİT    app/content/quranConceptTextsV1.js?v=20261008a
EŞİT    app/content/quranCurriculumV2.js?v=20261008a
EŞİT    app/content/quranGrammarV1.js?v=20261008a
EŞİT    app/content/quranLexiconV1.js?v=20261008a
EŞİT    app/content/quranMahrecSchemasV1.js?v=20261008a
EŞİT    app/content/quranPhonicsV1.js?v=20260924b
EŞİT    app/content/quranRevelationOrderV1.js?v=20260730p
EŞİT    app/content/quranRevelationOrderV1.js?v=20260811a
EŞİT    app/content/quranShortSurahsV1.js?v=20261008a
EŞİT    app/content/quranStrikingVersesV1.js?v=20260922b
EŞİT    app/content/quranTransportV1.js?v=20260730p
EŞİT    app/content/saygiPeople.js?v=20260730p
EŞİT    app/content/zikirCoreContentV1.js?v=20260730p
EŞİT    app/core/appSurface.js?v=20261008a
EŞİT    app/core/constants.js?v=20260824a
EŞİT    app/core/crisis.js?v=20260909a
EŞİT    app/core/dateUtils.js?v=20260903b
EŞİT    app/core/health.js?v=20260918a
EŞİT    app/core/helpers.js?v=20260903b
EŞİT    app/core/journal.js?v=20260909a
EŞİT    app/core/library.js?v=20260910a
EŞİT    app/core/map.js?v=20260915a
EŞİT    app/core/mediaFx.js?v=20260909a
EŞİT    app/core/messaging.js?v=20261008a
EŞİT    app/core/motivation.js?v=20260909a
EŞİT    app/core/prayer.js?v=20260921f
EŞİT    app/core/profile.js?v=20260915a
EŞİT    app/core/quran.js?v=20260915a
EŞİT    app/core/quranLearn.js?v=20261008a
EŞİT    app/core/quranLearnFlow.js?v=20261008a
EŞİT    app/core/quranLearnViews.js?v=20261008a
EŞİT    app/core/reminderCatalog.js?v=20260914a
EŞİT    app/core/reminderDelivery.js?v=20260818a
EŞİT    app/core/reminderEngine.js?v=20260818a
EŞİT    app/core/reminderScheduler.js?v=20260818a
EŞİT    app/core/reminderSurface.js?v=20260914d
EŞİT    app/core/reminders.js?v=20260914a
EŞİT    app/core/render.js?v=20261008a
EŞİT    app/core/report.js?v=20260910a
EŞİT    app/core/saygi.js?v=20260929c
EŞİT    app/core/settings.js?v=20260926a
EŞİT    app/core/skyFx.js?v=20260909a
EŞİT    app/core/state.js?v=20260910b
EŞİT    app/core/syncGlue.js?v=20260904a
EŞİT    app/core/timeTheme.js?v=20260908a
EŞİT    app/core/zikir.js?v=20260915a
EŞİT    app/kao.css?v=20261008a
EŞİT    app/styles.css?v=20261008a
EŞİT    manifest.json?v=20260730f
EŞİT    panel/panelCoverageManifest.js?v=20260926a
EŞİT    panel/v2/panel-v2.css?v=20261008a
EŞİT    panel/v2/panel-v2.js?v=20260812c
EŞİT    sync.js?v=20261008a
EŞİT    index.html
EŞİT    sw.js
EŞİT    panel-v2.html

404 kao2-duzeltme/denetim-3/DENETIM-3-RAPORU.md
404 kao2-duzeltme/denetim-3/D3F-STATE.json
404 kao2-duzeltme/denetim-3/evidence/YAYIN-4/YAYIN.md
404 kao2-duzeltme/denetim-3/evidence/D3F-03/kapilar-mutasyon.sh
404 kao2-duzeltme/tools/kapilar.sh
404 tests/kao/test_kao2_grammar_tasks.js
404 tools/kao-content-freeze.mjs
404 docs/kuran-ogreniyorum/kao2/content/texts.tr.json
```
