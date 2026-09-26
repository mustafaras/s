# KAO-D3 · Dalga 3 denetimi

**Tarih:** 2026-09-26 · **HEAD:** `576ecb7` · **Kapsam:** KAO-10, KAO-11, KAO-12, KAO-13, KAO-14, KAO-15, KAO-16, KAO-17, KAO-26, KAO-27, KAO-28, KAO-28b, KAO-16b · **Sonuç:** `pass` · **Kod değişikliği:** yok

## Denetim maddeleri

| # | Madde | Durum | Kanıt |
|---|---|---|---|
| 1 | Kart kontrolleri bugünkü kodda yeniden çalıştırıldı | ✓ | 13 kart, 170/170 exit 0; hiçbir dosya yazılmadı |
| 2 | Modal sözleşmesi: Tab/Shift+Tab/Escape/odak dönüşü; backdrop odaklanamaz | ✓ | 12 görünümün (home, units, word, reader, gate, settings, phonics, ayah, map, prayer, stats, session) hepsi aynı role=dialog aria-modal kabında ve App.onModalKeydown yolunda; backdrop'ta tabindex/role=button yok. test_kao_render.js gerçek onModalKeydown ile Tab, Shift+Tab, Escape ve odak dönüşünü (kao-hub-entry) sınar |
| 3 | Her App.kao* handler'ı app.js'te 1-satır shim, gövde quranLearn.js'te; yorumda pin tuzağı yok; fx2 pinleri güncel | ✓ | 35/35 shim, gövdesi eksik 0; yorumlarda 'App.kao…=' / 'onclick=' 0; fx2 aileleri PASS (755 handler / 393 onclick) |
| 4 | Gereksinim fixture'ları | ✓ | R-A4 requirements · R-B3 render (üç katman) · R-B4 requirements ('puan' yalnız 'puan yok/puan değil' olumsuzlamasında) · R-B7 render + ikon haritası · R-B8 requirements · R-C2 user_tasks + phonics_contract · R-C3 requirements · R-C4 privacy + requirements · R-A6 render (vakıf) · R-C6 requirements · R-B1 render (114 hücre) · R-B2 render (rekât sırası) |
| 5 | Mikrofon: MediaRecorder bloğu save(/SeymaSave/localStorage içermez; ayar kapalıyken API çağrısı yok | ✓ | test_kao_privacy.js kaynak taraması + çalışma zamanı (0 getUserMedia, data/save değişmez) |
| 6 | kao.css: :root yok, yalnız mevcut tokenlar, reduced-motion dalları | ✓ | :root 0; tüketilen değişkenler yalnız --quran*/--f-*/--dur-*/--kao-ar-*; 2 prefers-reduced-motion bloğu (overlay/animasyon + soldurma/segment) |
| 7 | Görev geçişi <50 ms | ✓ | KAO-11 kanıtı + KAO-20 ölçümü: tam oturumda en yavaş <1 ms |
| 8 | tests/kao fixture'ları mevcut ve PASS | ✓ | 14 fixture (plan 13 öngörmüştü; KAO-19/20 iki yeni ekledi, KAO-20 öncesi 12+1) hepsi PASS |

**Bulgu yok.**

## Kart commit bağları (kanıt çapası)

| Kart | Commit(ler) |
|---|---|
| KAO-10 | `b07688a` KAO-10: öğrenme ana ekranını ve overlay kabuğunu kur |
| KAO-11 | `94bed14` KAO-11: kelime oturum çekirdeğini uygula |
| KAO-12 | `8d1f9f4` KAO-12: add grammar session tasks |
| KAO-13 | `7012cae` KAO-13: parça görevleri ve kalıcılık özeti |
| KAO-14 | `4e4ec36` KAO-14: ünite ve üç katmanlı kelime görünümü |
| KAO-15 | `7520848` KAO-15: Latin okunuş sözleşmesini yapısallaştır<br>`41b77a9` KAO-15: kelime ve ayet okunuslarini gorunur yap<br>`57a0ecf` KAO-15: Seviye 0 okuma ve ses kapısı |
| KAO-16 | `35cb697` KAO-16: GAP-09 cache pin, hub keşfi ve kardeş parite onarımı<br>`022e703` KAO-16: kısa sûre okuyucusunu tamamla |
| KAO-17 | `b56bec3` KAO-17: E7 ayarlar, ses stili, hareke soldurma ve CSV |
| KAO-26 | `6734443` KAO-26: telaffuz stüdyosu, mahreç dersleri ve sessiz mod |
| KAO-27 | `e9f01ec` KAO-27: bellek-içi gölgeleme (D-10 onaylı) |
| KAO-28 | `59a53d9` KAO-28: bugün anlayabildiğin âyet ve ortak kapsam hesabı |
| KAO-28b | `4bf61c6` KAO-28b: Mushaf ısı haritası ve gecikmeli test yansıması |
| KAO-16b | `cf5e0d7` KAO-16b: ۟ düzeltmesinin doğrulanmış sözlükteki son lemması<br>`e578ae0` KAO-16b: namazda ne diyorum ve okunuş hattı düzeltmeleri |

> Denetim, kartların kapanış anındaki değil **bugünkü** koddaki kontrollerini yeniden çalıştırır; sonraki kartların değişiklikleri de dahildir.

## Kart kontrolleri (yeniden çalıştırıldı)

| Kart | Kontrol | Exit | Son satır | Not |
|---|---|---|---|---|
| KAO-10 | `node tests/kao/test_kao_render.js (dialog/aria/Tab/Shift+Tab/Escape/odak dönüşü)` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-10 | `for f in tests/app/test_fx2_*.js; do node $f; done (pin güncel)` | 0 | Passed: 14 / 14 |  |
| KAO-10 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-10 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-10 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-10 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-11 | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-11 | `node tests/kao/test_kao_requirements.js` | 0 | KAO requirements: PASS (R-A1/A2/A4/A5/A9, R-B1/B5/B8, R-C2/C3/C4/C5/C6; E7 ayarları kalıcı, DİA 524/524; iki yön, bit-bit undo, hedefli 0.82 |  |
| KAO-11 | `node tests/kao/test_kao_privacy.js` | 0 | KAO privacy · gölgeleme: PASS (varsayılan kapalı, 0 mikrofon çağrısı, model 2×, ≤10 sn, data/save yok, revoke) |  |
| KAO-11 | `node tests/app/test_fx2_tab_transition.js (App yüzeyi 727, onclick 392)` | 0 | Passed: 7 / 7 |  |
| KAO-11 | `node tests/app/test_fx2_overlay_motion.js (App yüzeyi 727, onclick 392)` | 0 | Passed: 7 / 7 |  |
| KAO-11 | `node tests/app/test_fx2_touch_coverage.js (App yüzeyi 727, onclick 392)` | 0 | Passed: 14 / 14 |  |
| KAO-11 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-11 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-11 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-11 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-12 | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-12 | `node tests/kao/test_kao_queue.js` | 0 | KAO queue: PASS (20 deterministic tasks + 4 grammar types, budgets/interleave/semantic spacing) |  |
| KAO-12 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-12 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-12 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-12 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-13 | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-13 | `node tests/kao/test_kao_requirements.js` | 0 | KAO requirements: PASS (R-A1/A2/A4/A5/A9, R-B1/B5/B8, R-C2/C3/C4/C5/C6; E7 ayarları kalıcı, DİA 524/524; iki yön, bit-bit undo, hedefli 0.82 |  |
| KAO-13 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-13 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-13 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-13 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-14 | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-14 | `node tests/kao/test_kao_requirements.js` | 0 | KAO requirements: PASS (R-A1/A2/A4/A5/A9, R-B1/B5/B8, R-C2/C3/C4/C5/C6; E7 ayarları kalıcı, DİA 524/524; iki yön, bit-bit undo, hedefli 0.82 |  |
| KAO-14 | `node tests/app/test_fx2_tab_transition.js` | 0 | Passed: 7 / 7 |  |
| KAO-14 | `node tests/app/test_fx2_overlay_motion.js` | 0 | Passed: 7 / 7 |  |
| KAO-14 | `node tests/app/test_fx2_touch_coverage.js` | 0 | Passed: 14 / 14 |  |
| KAO-14 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-14 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-14 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-14 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-15 | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-15 | `node tests/kao/test_kao_pronunciation_contract.js` | 0 | KAO pronunciation contract: PASS (content + task objects + visible paired rendering) |  |
| KAO-15 | `node tests/kao/test_kao_lexicon_contract.js` | 0 | KAO lexicon contract: PASS (524 lemma, 320208 bayt) |  |
| KAO-15 | `node tools/kao-lexicon-build.mjs --freeze` | 0 | lemmas=524 bytes=320208 |  |
| KAO-15 | `node tests/app/test_fx2_tab_transition.js` | 0 | Passed: 7 / 7 |  |
| KAO-15 | `node tests/app/test_fx2_overlay_motion.js` | 0 | Passed: 7 / 7 |  |
| KAO-15 | `node tests/app/test_fx2_touch_coverage.js` | 0 | Passed: 14 / 14 |  |
| KAO-15 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-15 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-15 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-15 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-16 | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-16 | `node tests/kao/test_kao_requirements.js` | 0 | KAO requirements: PASS (R-A1/A2/A4/A5/A9, R-B1/B5/B8, R-C2/C3/C4/C5/C6; E7 ayarları kalıcı, DİA 524/524; iki yön, bit-bit undo, hedefli 0.82 |  |
| KAO-16 | `node tests/app/test_iip_22.js` | 0 | PASS: IIP-22 13/13 |  |
| KAO-16 | `node tests/app/test_app_surface_boot_boundary.js` | 0 | MON-54 boot boundary: 22/22 passed |  |
| KAO-16 | `node tests/app/test_app_surface_daily_boundary.js` | 0 | MON-50 daily App surface boundary: 19/19 passed |  |
| KAO-16 | `node tests/app/test_app_surface_domain_boundary.js` | 0 | MON-51 domain App surface boundary: 58/58 passed |  |
| KAO-16 | `node tests/app/test_app_surface_lifecycle_boundary.js` | 0 | MON-53 lifecycle boundary: 16/16 passed |  |
| KAO-16 | `node tests/app/test_app_surface_overlay_boundary.js` | 0 | MON-52 overlay App surface boundary: 49/49 passed |  |
| KAO-16 | `node tests/app/test_render_core_boundary.js` | 0 | MON-49 modal/render core boundary: 16/16 passed |  |
| KAO-16 | `node tests/app/test_v3_welcome.js` | 0 | SONUÇ: PASS |  |
| KAO-16 | `node tests/reminders/test_reminder_app_acceptance.js` | 0 | REMINDER CONTRACT PASS: 595 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_app_notification_boundary.js` | 0 | REMINDER CONTRACT PASS: 233 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_app_privacy.js` | 0 | REMINDER CONTRACT PASS: 194 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_boot.js` | 0 | REMINDER CONTRACT PASS: 46 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_concurrency.js` | 0 | REMINDER CONTRACT PASS: 38 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_cross_surface_schema.js` | 0 | REMINDER CONTRACT PASS: 65 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_integrated_privacy.js` | 0 | REMINDER CONTRACT PASS: 78 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_integrated_ux.js` | 0 | REMINDER CONTRACT PASS: 73 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_migration.js` | 0 | REMINDER CONTRACT PASS: 50 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_app_notification_boundary.js` | 0 | REMINDER CONTRACT PASS: 233 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_app_privacy.js` | 0 | REMINDER CONTRACT PASS: 194 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_boot.js` | 0 | REMINDER CONTRACT PASS: 46 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_concurrency.js` | 0 | REMINDER CONTRACT PASS: 38 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_cross_surface_schema.js` | 0 | REMINDER CONTRACT PASS: 65 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_integrated_privacy.js` | 0 | REMINDER CONTRACT PASS: 78 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_integrated_ux.js` | 0 | REMINDER CONTRACT PASS: 73 assertions |  |
| KAO-16 | `node tests/reminders/test_reminder_migration.js` | 0 | REMINDER CONTRACT PASS: 50 assertions |  |
| KAO-16 | `node tests/app/test_deploy_surface_contract.js` | 0 | ✓ 70 geçti, 0 başarısız |  |
| KAO-16 | `node tests/app/test_quran_boundary.js` | 0 | Passed: 20 / 20 |  |
| KAO-16 | `node tests/app/test_saygi_boundary.js` | 0 | MON-23 Saygı sınırı: 22 PASS, 0 FAIL |  |
| KAO-16 | `node tests/app/test_fx2_tab_transition.js` | 0 | Passed: 7 / 7 |  |
| KAO-16 | `node tests/app/test_fx2_overlay_motion.js` | 0 | Passed: 7 / 7 |  |
| KAO-16 | `node tests/app/test_fx2_touch_coverage.js` | 0 | Passed: 14 / 14 |  |
| KAO-16 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-16 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-16 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-16 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-17 | `node tests/kao/test_kao_requirements.js` | 0 | KAO requirements: PASS (R-A1/A2/A4/A5/A9, R-B1/B5/B8, R-C2/C3/C4/C5/C6; E7 ayarları kalıcı, DİA 524/524; iki yön, bit-bit undo, hedefli 0.82 |  |
| KAO-17 | `node tests/kao/test_kao_privacy.js` | 0 | KAO privacy · gölgeleme: PASS (varsayılan kapalı, 0 mikrofon çağrısı, model 2×, ≤10 sn, data/save yok, revoke) |  |
| KAO-17 | `for f in tests/app/test_premium_*.js; do node $f; done` | 0 | Passed: 68 / 68 |  |
| KAO-17 | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-17 | `node tests/kao/test_kao_migration.js` | 0 | KAO migration: PASS (empty/old/broken/idempotent/orphan/114 surah) |  |
| KAO-17 | `node tests/app/test_fx2_tab_transition.js` | 0 | Passed: 7 / 7 |  |
| KAO-17 | `node tests/app/test_fx2_overlay_motion.js` | 0 | Passed: 7 / 7 |  |
| KAO-17 | `node tests/app/test_fx2_touch_coverage.js` | 0 | Passed: 14 / 14 |  |
| KAO-17 | `node tests/app/test_iip_22.js` | 0 | PASS: IIP-22 13/13 |  |
| KAO-17 | `node tests/app/test_v3_welcome.js` | 0 | SONUÇ: PASS |  |
| KAO-17 | `node tests/app/test_app_surface_daily_boundary.js` | 0 | MON-50 daily App surface boundary: 19/19 passed |  |
| KAO-17 | `node tests/app/test_aeon_message_expand.js` | 0 | 24 geçti, 0 kaldı. |  |
| KAO-17 | `node tests/app/test_iip_20.js` | 0 | IIP-20: 10 PASS |  |
| KAO-17 | `node tests/app/test_iip_perf_measure.js` | 0 |   BOUNDARY: local VM, NOT device. Device p95 stays unmeasured until the user runs the protocol. |  |
| KAO-17 | `node tests/app/test_zikr_manual_entry.js` | 0 | == Özet: 21 geçti, 0 kaldı == |  |
| KAO-17 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-17 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-17 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-17 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-26 | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-26 | `node tests/kao/test_kao_phonics_contract.js` | 0 | KAO content contract: PASS (E8 stüdyo: 13 SVG gömülü, 6 görev türü, FSRS + dikkat, sessiz mod; grammar=51353, surahs=83276, phonics=9552) |  |
| KAO-26 | `node tests/kao/test_kao_migration.js` | 0 | KAO migration: PASS (empty/old/broken/idempotent/orphan/114 surah) |  |
| KAO-26 | `node tests/app/test_fx2_tab_transition.js` | 0 | Passed: 7 / 7 |  |
| KAO-26 | `node tests/app/test_fx2_overlay_motion.js` | 0 | Passed: 7 / 7 |  |
| KAO-26 | `node tests/app/test_fx2_touch_coverage.js` | 0 | Passed: 14 / 14 |  |
| KAO-26 | `node tests/app/test_iip_22.js` | 0 | PASS: IIP-22 13/13 |  |
| KAO-26 | `node tests/app/test_v3_welcome.js` | 0 | SONUÇ: PASS |  |
| KAO-26 | `node tests/app/test_app_surface_daily_boundary.js` | 0 | MON-50 daily App surface boundary: 19/19 passed |  |
| KAO-26 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-26 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-26 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-26 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-27 | `node tests/kao/test_kao_privacy.js` | 0 | KAO privacy · gölgeleme: PASS (varsayılan kapalı, 0 mikrofon çağrısı, model 2×, ≤10 sn, data/save yok, revoke) |  |
| KAO-27 | `node tests/kao/test_kao_migration.js` | 0 | KAO migration: PASS (empty/old/broken/idempotent/orphan/114 surah) |  |
| KAO-27 | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-27 | `node tests/app/test_fx2_tab_transition.js` | 0 | Passed: 7 / 7 |  |
| KAO-27 | `node tests/app/test_fx2_overlay_motion.js` | 0 | Passed: 7 / 7 |  |
| KAO-27 | `node tests/app/test_fx2_touch_coverage.js` | 0 | Passed: 14 / 14 |  |
| KAO-27 | `node tests/app/test_iip_22.js` | 0 | PASS: IIP-22 13/13 |  |
| KAO-27 | `node tests/app/test_v3_welcome.js` | 0 | SONUÇ: PASS |  |
| KAO-27 | `node tests/app/test_app_surface_daily_boundary.js` | 0 | MON-50 daily App surface boundary: 19/19 passed |  |
| KAO-27 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-27 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-27 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-27 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-28 | `node tests/kao/test_kao_queue.js` | 0 | KAO queue: PASS (20 deterministic tasks + 4 grammar types, budgets/interleave/semantic spacing) |  |
| KAO-28 | `node tests/kao/test_kao_lexicon_coverage.js` | 0 | KAO lexicon coverage: PASS (59948/77430 = 77.42%) |  |
| KAO-28 | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-28 | `node tests/app/test_fx2_tab_transition.js` | 0 | Passed: 7 / 7 |  |
| KAO-28 | `node tests/app/test_fx2_overlay_motion.js` | 0 | Passed: 7 / 7 |  |
| KAO-28 | `node tests/app/test_fx2_touch_coverage.js` | 0 | Passed: 14 / 14 |  |
| KAO-28 | `node tests/app/test_iip_22.js` | 0 | PASS: IIP-22 13/13 |  |
| KAO-28 | `node tests/app/test_v3_welcome.js` | 0 | SONUÇ: PASS |  |
| KAO-28 | `node tests/app/test_app_surface_daily_boundary.js` | 0 | MON-50 daily App surface boundary: 19/19 passed |  |
| KAO-28 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-28 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-28 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-28 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-28b | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-28b | `node tests/kao/test_kao_requirements.js` | 0 | KAO requirements: PASS (R-A1/A2/A4/A5/A9, R-B1/B5/B8, R-C2/C3/C4/C5/C6; E7 ayarları kalıcı, DİA 524/524; iki yön, bit-bit undo, hedefli 0.82 |  |
| KAO-28b | `node tests/app/test_fx2_tab_transition.js` | 0 | Passed: 7 / 7 |  |
| KAO-28b | `node tests/app/test_fx2_overlay_motion.js` | 0 | Passed: 7 / 7 |  |
| KAO-28b | `node tests/app/test_fx2_touch_coverage.js` | 0 | Passed: 14 / 14 |  |
| KAO-28b | `node tests/app/test_iip_22.js` | 0 | PASS: IIP-22 13/13 |  |
| KAO-28b | `node tests/app/test_v3_welcome.js` | 0 | SONUÇ: PASS |  |
| KAO-28b | `node tests/app/test_app_surface_daily_boundary.js` | 0 | MON-50 daily App surface boundary: 19/19 passed |  |
| KAO-28b | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-28b | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-28b | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-28b | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-16b | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-16b | `node tests/kao/test_kao_phonics_contract.js` | 0 | KAO content contract: PASS (E8 stüdyo: 13 SVG gömülü, 6 görev türü, FSRS + dikkat, sessiz mod; grammar=51353, surahs=83276, phonics=9552) |  |
| KAO-16b | `node tests/kao/test_kao_queue.js` | 0 | KAO queue: PASS (20 deterministic tasks + 4 grammar types, budgets/interleave/semantic spacing) |  |
| KAO-16b | `node tests/kao/test_kao_requirements.js` | 0 | KAO requirements: PASS (R-A1/A2/A4/A5/A9, R-B1/B5/B8, R-C2/C3/C4/C5/C6; E7 ayarları kalıcı, DİA 524/524; iki yön, bit-bit undo, hedefli 0.82 |  |
| KAO-16b | `node tools/kao-lexicon-build.mjs --self-test` | 0 | KAO lexicon self-test: PASS (50 satır, çok-segment STEM POS, lemma paydası, besmele/vakıf/split hizası, Tanzil gövde kapısı, taslak kovaları |  |
| KAO-16b | `node tests/app/test_fx2_tab_transition.js` | 0 | Passed: 7 / 7 |  |
| KAO-16b | `node tests/app/test_fx2_overlay_motion.js` | 0 | Passed: 7 / 7 |  |
| KAO-16b | `node tests/app/test_fx2_touch_coverage.js` | 0 | Passed: 14 / 14 |  |
| KAO-16b | `node tests/app/test_iip_22.js` | 0 | PASS: IIP-22 13/13 |  |
| KAO-16b | `node tests/app/test_v3_welcome.js` | 0 | SONUÇ: PASS |  |
| KAO-16b | `node tests/app/test_app_surface_daily_boundary.js` | 0 | MON-50 daily App surface boundary: 19/19 passed |  |
| KAO-16b | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-16b | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-16b | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-16b | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |

Ortak: plan-check → exit 0 (kao-plan-check: PASS (1 warn)); diff --check → exit 0.


