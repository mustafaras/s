# YAYIN-7 — canlı doğrulama (2026-10-08, 18:02)

- Push: `93785f8f..bcd92988` main → origin/main, fast-forward (force yok).
- Pages run: **37797035612 · completed success** (head `bcd92988`), GitHub API ile izlendi.
- Canlı bayt eşitliği (`curl` + `shasum -a 256`, `git show HEAD:` ile; çalışma ağacındaki commit'lenmemiş D3F-11 karışmasın diye): ilk geçiş **62 EŞİT / 1 FARKLI**.
  FARKLI olan `app/content/motivationNarratives.js?v=20260730p` (bu yayında değişmedi, son değişiklik 08-22). Ayrı ölçüm 3/3: `http 200 · 10249 B`, hash yerelle aynı (`cc4259153905…`).
  İlk geçişteki fark `curl -sf`'nin tek seferlik başarısız indirmesiydi (boş gövde → farklı hash). **Sonuç: 63/63 bayt-eşit.**
- Yeni pinli dosyalar canlıda bayt-eşit: `quranCurriculumV2.js?v=20261008c`, `state.js`, `skyFx.js`, `manifest.json`, `panel/v2/panel-v2.js` (hepsi `?v=20261008c`), `sw.js`.
- Gizlilik: **8/8** yol 404.
- Bu kaydın kendi push'u da bir Pages run tetikler (site dosyası değişmez); oturum raporunda verilir.
- Kanıt düzeyleri: kaynak/test ✓ (tam kapı) · yayın ✓ · canlı bayt eşitliği ✓ · cihaz — (yeni `SW_VERSION` 20261008c; cihazda kullanıcıda).

## Ham sonuç (ilk geçiş)
```
EŞİT    app.js?v=20261008c
EŞİT    app/content/esmaulHusnaV1.js?v=20260730p
EŞİT    app/content/esmaulHusnaV2.js?v=20260730p
EŞİT    app/content/hijriCalendar.js?v=20260730p
FARKLI  app/content/motivationNarratives.js?v=20260730p
EŞİT    app/content/motivationProgramV2.js?v=20260730p
EŞİT    app/content/profileAssessmentV1.js?v=20260730p
EŞİT    app/content/quranConceptTextsV1.js?v=20261008c
EŞİT    app/content/quranCurriculumV2.js?v=20261008c
EŞİT    app/content/quranGrammarV1.js?v=20261008c
EŞİT    app/content/quranLexiconV1.js?v=20261008c
EŞİT    app/content/quranMahrecSchemasV1.js?v=20261008c
EŞİT    app/content/quranPhonicsV1.js?v=20260924b
EŞİT    app/content/quranRevelationOrderV1.js?v=20260730p
EŞİT    app/content/quranRevelationOrderV1.js?v=20260811a
EŞİT    app/content/quranShortSurahsV1.js?v=20261008c
EŞİT    app/content/quranStrikingVersesV1.js?v=20260922b
EŞİT    app/content/quranTransportV1.js?v=20260730p
EŞİT    app/content/saygiPeople.js?v=20260730p
EŞİT    app/content/zikirCoreContentV1.js?v=20260730p
EŞİT    app/core/appSurface.js?v=20261008c
EŞİT    app/core/constants.js?v=20260824a
EŞİT    app/core/crisis.js?v=20260909a
EŞİT    app/core/dateUtils.js?v=20260903b
EŞİT    app/core/health.js?v=20260918a
EŞİT    app/core/helpers.js?v=20260903b
EŞİT    app/core/journal.js?v=20260909a
EŞİT    app/core/library.js?v=20260910a
EŞİT    app/core/map.js?v=20260915a
EŞİT    app/core/mediaFx.js?v=20260909a
EŞİT    app/core/messaging.js?v=20261008c
EŞİT    app/core/motivation.js?v=20260909a
EŞİT    app/core/prayer.js?v=20260921f
EŞİT    app/core/profile.js?v=20260915a
EŞİT    app/core/quran.js?v=20260915a
EŞİT    app/core/quranLearn.js?v=20261008c
EŞİT    app/core/quranLearnFlow.js?v=20261008c
EŞİT    app/core/quranLearnViews.js?v=20261008c
EŞİT    app/core/reminderCatalog.js?v=20260914a
EŞİT    app/core/reminderDelivery.js?v=20260818a
EŞİT    app/core/reminderEngine.js?v=20260818a
EŞİT    app/core/reminderScheduler.js?v=20260818a
EŞİT    app/core/reminderSurface.js?v=20260914d
EŞİT    app/core/reminders.js?v=20260914a
EŞİT    app/core/render.js?v=20261008c
EŞİT    app/core/report.js?v=20260910a
EŞİT    app/core/saygi.js?v=20260929c
EŞİT    app/core/settings.js?v=20260926a
EŞİT    app/core/skyFx.js?v=20261008c
EŞİT    app/core/state.js?v=20261008c
EŞİT    app/core/syncGlue.js?v=20260904a
EŞİT    app/core/timeTheme.js?v=20260908a
EŞİT    app/core/zikir.js?v=20261008c
EŞİT    app/kao.css?v=20261008c
EŞİT    app/styles.css?v=20261008c
EŞİT    index.html
EŞİT    manifest.json?v=20261008c
EŞİT    panel-v2.html
EŞİT    panel/panelCoverageManifest.js?v=20261008c
EŞİT    panel/v2/panel-v2.css?v=20261008c
EŞİT    panel/v2/panel-v2.js?v=20261008c
EŞİT    sw.js
EŞİT    sync.js?v=20261008c
404 kao2-duzeltme/denetim-3/evidence/YAYIN-7/YAYIN.md
404 kao2-duzeltme/denetim-3/D3F-STATE.json
404 docs/kuran-ogreniyorum/kao2/content/texts.tr.json
404 tests/app/test_asset_pin_freshness.js
404 tools/kao2-curriculum-build.mjs
404 kao2-duzeltme/denetim-2/LEDGER.md
404 kao2-duzeltme/FIX-STATE.json
404 docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md
```
