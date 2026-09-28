# KAO-D5 · Dalga 5 denetimi

**Tarih:** 2026-09-26 · **HEAD:** `6c24867` · **Kapsam:** KAO-21 · **Sonuç:** `findings` · **Kod değişikliği:** yok

## Denetim maddeleri

| # | Madde | Durum | Kanıt |
|---|---|---|---|
| 1 | Kart kontrolleri bugünkü kodda yeniden çalıştırıldı | ✓ | KAO-21: 13/13 exit 0; hiçbir dosya yazılmadı |
| 2 | saygi.js diff'i ≤3 satır | ✓ | KAO izi toplam +2 −1 satır (kaoHub sarmalayıcısı + bileşim satırı); taban 0436405'ten bu yana saygi.js'e 'kaoHub' ekleyen tek commit a9fa40c |
| 3 | saygi.js değişikliği yalnız KAO-21 commit'inde | ✗ | Değişiklik KAO-21'de değil, 2026-09-24 tarihli a9fa40c 'fix(ui): move Quran learning into faith hub' commit'inde (geçici Ayarlar girişini hub kartına taşıyan UI düzeltmesi, main'de). KAO-21 saygi.js'e 0 satır dokundu ve bunu kanıtında yazdı |
| 4 | IIP kapısı gateApproval kayıtlı | ✓ | KAO-21 gateApproval: 'koşul: IIP main'de', 2026-09-26; IIP-STATE status=done, activeCard=null |
| 5 | kaoHubCardHTML yokken saygiHTML bayt-eşit | ✓ | test_kao_independence.js: 3.497 bayt birebir; varken tek kez, quranHub() ardından |
| 6 | Geçici Ayarlar girişi kaldırıldı; settings.kaoVisible çalışıyor | ✓ | settings.js'te kao-settings-entry/App.kaoOpen() yok (render fixture); E7 görünürlük anahtarı + Ayarlar → Gizlenen kartlar geri getirme (render fixture) |
| 7 | driver/zikr/rebind/shell PASS; fx2 pinleri güncel | ✓ | kart kontrollerinde exit 0; fx2 aileleri 755 handler / 393 onclick ile PASS |

**Bulgular (1):** saygi.js değişikliği yalnız KAO-21 commit'inde. Sapma izlenebilirlikle ilgili, içerik sınırıyla değil: saygi.js'teki KAO izi 3 satırda kalıyor ve IIP aktif değilken eklendi; yalnız KAO-21 yerine önceki bir UI düzeltme commit'iyle geldi. Kart geri çekilmedi.

## Kart commit bağları (kanıt çapası)

| Kart | Commit(ler) |
|---|---|
| KAO-21 | `208e703` KAO-21: hub kartı görünürlüğü ve bağımsız bileşim doğrulaması |

> Denetim, kartların kapanış anındaki değil **bugünkü** koddaki kontrollerini yeniden çalıştırır; sonraki kartların değişiklikleri de dahildir.

## Kart kontrolleri (yeniden çalıştırıldı)

| Kart | Kontrol | Exit | Son satır | Not |
|---|---|---|---|---|
| KAO-21 | `node tests/kao/test_kao_independence.js` | 0 | KAO independence: PASS (saygiHTML bayt-eşit + tek bileşim, IIP/state/network coupling ve load-time DOM/timer etkisi yok) |  |
| KAO-21 | `node tests/kao/test_kao_render.js` | 0 | KAO render: PASS (KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, f |  |
| KAO-21 | `node tests/kao/test_kao_migration.js` | 0 | KAO migration: PASS (empty/old/broken/idempotent/orphan/114 surah) |  |
| KAO-21 | `node tests/kao/test_kao_requirements.js` | 0 | KAO requirements: PASS (R-A1/A2/A4/A5/A9, R-B1/B5/B8, R-C2/C3/C4/C5/C6; E7 ayarları kalıcı, DİA 524/524; iki yön, bit-bit undo, hedefli 0.84 |  |
| KAO-21 | `node tests/app/test_fx2_tab_transition.js` | 0 | Passed: 7 / 7 |  |
| KAO-21 | `node tests/app/test_fx2_overlay_motion.js` | 0 | Passed: 7 / 7 |  |
| KAO-21 | `node tests/app/test_fx2_touch_coverage.js` | 0 | Passed: 14 / 14 |  |
| KAO-21 | `node tests/app/test_v3_welcome.js` | 0 | SONUÇ: PASS |  |
| KAO-21 | `node tests/app/test_app_surface_daily_boundary.js` | 0 | MON-50 daily App surface boundary: 19/19 passed |  |
| KAO-21 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-21 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-21 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-21 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |

Ortak: plan-check → exit 0 (kao-plan-check: PASS (1 warn)); diff --check → exit 0.


