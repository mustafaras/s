# YAYIN-8 — canlı doğrulama (2026-10-08)

- Push: `8f0a3d10..e28049b2` main → origin/main, fast-forward (force yok).
- Pages run: **37814250275 · completed success** (head `e28049b2`), GitHub API ile izlendi.
- Canlı bayt eşitliği (`curl` + `shasum -a 256`, `git show HEAD:` ile; FARKLI çıkana 3 yeniden deneme hakkı, kullanılmadı): **63 EŞİT / 0 FARKLI**.
  `app/core/quranLearn.js?v=20261008d` (D3F-11 kişi sorusu) ve `sw.js` (`SW_VERSION` 20261008d) canlıda bayt-eşit.
- Gizlilik: **8/8** yol 404.
- Bu kaydın kendi push'u da bir Pages run tetikler (site dosyası değişmez); oturum raporunda verilir.
- Kanıt düzeyleri: kaynak/test kısmi (YAYIN.md perf sapması) · yayın ✓ · canlı bayt eşitliği ✓ · cihaz — (g17-k2 yeni şıkları cihazda kullanıcıda).

## Ham sonuç
```
EŞİT    app.js?v=20261008d
EŞİT    app/content/esmaulHusnaV1.js?v=20260730p
EŞİT    app/content/esmaulHusnaV2.js?v=20260730p
EŞİT    app/content/hijriCalendar.js?v=20260730p
EŞİT    app/content/motivationNarratives.js?v=20260730p
EŞİT    app/content/motivationProgramV2.js?v=20260730p
EŞİT    app/content/profileAssessmentV1.js?v=20260730p
EŞİT    app/content/quranConceptTextsV1.js?v=20261008d
EŞİT    app/content/quranCurriculumV2.js?v=20261008d
EŞİT    app/content/quranGrammarV1.js?v=20261008d
EŞİT    app/content/quranLexiconV1.js?v=20261008d
EŞİT    app/content/quranMahrecSchemasV1.js?v=20261008d
EŞİT    app/content/quranPhonicsV1.js?v=20260924b
EŞİT    app/content/quranRevelationOrderV1.js?v=20260730p
EŞİT    app/content/quranRevelationOrderV1.js?v=20260811a
EŞİT    app/content/quranShortSurahsV1.js?v=20261008d
EŞİT    app/content/quranStrikingVersesV1.js?v=20260922b
EŞİT    app/content/quranTransportV1.js?v=20260730p
EŞİT    app/content/saygiPeople.js?v=20260730p
EŞİT    app/content/zikirCoreContentV1.js?v=20260730p
EŞİT    app/core/appSurface.js?v=20261008d
EŞİT    app/core/constants.js?v=20260824a
EŞİT    app/core/crisis.js?v=20260909a
EŞİT    app/core/dateUtils.js?v=20260903b
EŞİT    app/core/health.js?v=20260918a
EŞİT    app/core/helpers.js?v=20260903b
EŞİT    app/core/journal.js?v=20260909a
EŞİT    app/core/library.js?v=20260910a
EŞİT    app/core/map.js?v=20260915a
EŞİT    app/core/mediaFx.js?v=20260909a
EŞİT    app/core/messaging.js?v=20261008d
EŞİT    app/core/motivation.js?v=20260909a
EŞİT    app/core/prayer.js?v=20260921f
EŞİT    app/core/profile.js?v=20260915a
EŞİT    app/core/quran.js?v=20260915a
EŞİT    app/core/quranLearn.js?v=20261008d
EŞİT    app/core/quranLearnFlow.js?v=20261008d
EŞİT    app/core/quranLearnViews.js?v=20261008d
EŞİT    app/core/reminderCatalog.js?v=20260914a
EŞİT    app/core/reminderDelivery.js?v=20260818a
EŞİT    app/core/reminderEngine.js?v=20260818a
EŞİT    app/core/reminderScheduler.js?v=20260818a
EŞİT    app/core/reminderSurface.js?v=20260914d
EŞİT    app/core/reminders.js?v=20260914a
EŞİT    app/core/render.js?v=20261008d
EŞİT    app/core/report.js?v=20260910a
EŞİT    app/core/saygi.js?v=20260929c
EŞİT    app/core/settings.js?v=20260926a
EŞİT    app/core/skyFx.js?v=20261008d
EŞİT    app/core/state.js?v=20261008d
EŞİT    app/core/syncGlue.js?v=20260904a
EŞİT    app/core/timeTheme.js?v=20260908a
EŞİT    app/core/zikir.js?v=20261008d
EŞİT    app/kao.css?v=20261008d
EŞİT    app/styles.css?v=20261008d
EŞİT    index.html
EŞİT    manifest.json?v=20261008d
EŞİT    panel-v2.html
EŞİT    panel/panelCoverageManifest.js?v=20261008d
EŞİT    panel/v2/panel-v2.css?v=20261008d
EŞİT    panel/v2/panel-v2.js?v=20261008d
EŞİT    sw.js
EŞİT    sync.js?v=20261008d
404 kao2-duzeltme/denetim-3/evidence/YAYIN-8/YAYIN.md
404 kao2-duzeltme/denetim-3/D3F-STATE.json
404 docs/kuran-ogreniyorum/kao2/content/texts.tr.json
404 tests/kao/test_kao2_grammar_tasks.js
404 tools/kao2-curriculum-build.mjs
404 kao2-duzeltme/denetim-2/LEDGER.md
404 kao2-duzeltme/denetim-2/DUZELTME-SONUCU.md
404 docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md
```
