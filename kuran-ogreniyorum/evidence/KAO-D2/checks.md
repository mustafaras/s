# KAO-D2 · Dalga 2 denetimi

**Tarih:** 2026-09-26 · **HEAD:** `d91cc07` · **Kapsam:** KAO-05, KAO-06, KAO-07, KAO-08, KAO-09 · **Kod değişikliği:** yok

> Denetim, kartların kapanış anındaki değil **bugünkü** koddaki kontrollerini yeniden çalıştırır; sonraki kartların değişiklikleri de dahildir.

## Kart kontrolleri (yeniden çalıştırıldı)

| Kart | Kontrol | Exit | Son satır | Not |
|---|---|---|---|---|
| KAO-05 | `node tests/kao/test_kao_lexicon_contract.js` | 0 | KAO lexicon contract: PASS (524 lemma, 320208 bayt) |  |
| KAO-05 | `node tests/kao/test_kao_lexicon_coverage.js` | 0 | KAO lexicon coverage: PASS (59948/77430 = 77.42%) |  |
| KAO-05 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-05 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-05 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-05 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-06 | `node tests/kao/test_kao_phonics_contract.js` | 0 | KAO content contract: PASS (E8 stüdyo: 13 SVG gömülü, 6 görev türü, FSRS + dikkat, sessiz mod; grammar=51353, surahs=83276, phonics=9552) |  |
| KAO-06 | `node tests/kao/test_kao_lexicon_contract.js` | 0 | KAO lexicon contract: PASS (524 lemma, 320208 bayt) |  |
| KAO-06 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-06 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-06 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-06 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-07 | `node tests/kao/test_kao_migration.js` | 0 | KAO migration: PASS (empty/old/broken/idempotent/orphan/114 surah) |  |
| KAO-07 | `node tests/kao/test_kao_boundary.js` | 0 | KAO boundary: PASS (load purity, fail-closed deps, four lists, shims) |  |
| KAO-07 | `node tests/kao/test_kao_independence.js` | 0 | KAO independence: PASS (saygiHTML bayt-eşit + tek bileşim, IIP/state/network coupling ve load-time DOM/timer etkisi yok) |  |
| KAO-07 | `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs` | 0 | B2 result: PASS (67 passed, 0 failed) |  |
| KAO-07 | `node .claude/skills/run-seyma/driver.mjs` | 0 | Done. |  |
| KAO-07 | `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | ✅ 95/95 assertion pass |  |
| KAO-07 | `node tests/app/test_state_rebind_boundary.js` | 0 | MON-15 result: PASS (37 passed, 0 failed) |  |
| KAO-07 | `node tools/shell-inventory.mjs --gate` | 0 | shell-inventory --gate PASS {"maxTotalLines":7800,"maxLegacyFunctions":0,"maxReminderFunctionCodeLines":450,"maxHtmlBuilderCodeLines":150,"r |  |
| KAO-08 | `node tests/kao/test_kao_fsrs.js` | 0 | KAO FSRS: PASS (24 published vectors, ±0.000001, monotonic, grade mapping, predictedR) |  |
| KAO-09 | `node tests/kao/test_kao_queue.js` | 0 | KAO queue: PASS (20 deterministic tasks + 4 grammar types, budgets/interleave/semantic spacing) |  |
| KAO-09 | `node tests/kao/test_kao_requirements.js` | 0 | KAO requirements: PASS (R-A1/A2/A4/A5/A9, R-B1/B5/B8, R-C2/C3/C4/C5/C6; E7 ayarları kalıcı, DİA 524/524; iki yön, bit-bit undo, hedefli 0.77 |  |

Ortak: plan-check → exit 0 (kao-plan-check: PASS (1 warn)); diff --check → exit 0.

