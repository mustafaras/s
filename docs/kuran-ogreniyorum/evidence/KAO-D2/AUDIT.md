# KAO-D2 · Dalga 2 denetimi

**Tarih:** 2026-09-26 · **HEAD:** `d91cc07` · **Kapsam:** KAO-05, KAO-06, KAO-07, KAO-08, KAO-09 · **Sonuç:** `pass` · **Kod değişikliği:** yok

## Denetim maddeleri

| # | Madde | Durum | Kanıt |
|---|---|---|---|
| 1 | Kart kontrolleri bugünkü kodda yeniden çalıştırıldı | ✓ | 23/23 exit 0; hiçbir dosya yazılmadı |
| 2 | Dört yükleme listesi: 4 içerik + 1 registry her listede tam 1 kez | ✓ | index.html, driver.mjs, zikr-harness.mjs, test_state_rebind_boundary.js — quranLexiconV1/quranGrammarV1/quranShortSurahsV1/quranPhonicsV1/quranLearn her birinde 1 |
| 3 | node --check; driver + zikr + rebind + shell --gate | ✓ | kart kontrollerinde exit 0 (tablo) |
| 4 | app.js shim artışı ≤30 satır | ✓ | KAO-05…09 commit'lerinde app.js 7.799 satırda sabit: artış 0 (shim'ler mevcut tek satırlık kayıt/handler satırlarına eklenir) |
| 5 | ensureQuranLearn eski kayıt → tam şema; iki kez bayt-eşit; lexiconVersion farkı → orphan, silinmez | ✓ | test_kao_migration.js PASS (empty/old/broken/idempotent/orphan/114 surah) |
| 6 | Registry yükte DOM/ağ/depo dokunmuyor; fetch yok | ✓ | test_kao_boundary.js + test_kao_independence.js PASS (load-time DOM/timer etkisi 0; fetch/localStorage yok) |
| 7 | FSRS vektörleri kaynaklı; grade eşlemesi belgeli | ✓ | test_kao_fsrs.js kaynağı sabitler: open-spaced-repetition/ts-fsrs v4.5.2, commit cdd9158, MIT; 24 yayımlanmış vektör ±1e-6; kaoGrade eşlemesi testte |
| 8 | Kuyruk: 1.000 oturumda R-A2/R-A5 ihlali 0; targetBed yoksa gece penceresi kapalı | ✓ | test_kao_requirements.js PASS (1.000 oturum, çeldirici ve komşu ihlali 0; targetBed yok → false). Ek: KAO-16b'de bulunan R-A2 yön dengesi hatası 365 günlük fixture ile kapandı |
| 9 | fx2 pinleri dalga 2'de değişmedi | ✓ | KAO-05…09 commit'leri tests/app/test_fx2_*.js dosyalarına dokunmaz (0 commit) |

**Bulgu yok.**

## Kart commit bağları (kanıt çapası)

| Kart | Commit(ler) |
|---|---|
| KAO-05 | `9227683` KAO-05: doğrulanmış sözlüğü dondur |
| KAO-06 | `c1ebb5e` KAO-06: freeze grammar surahs phonics and prayer texts |
| KAO-07 | `4d71eb1` KAO-07: öğrenme şemasını ve migration kancasını kur |
| KAO-08 | `35e31cf` KAO-08: FSRS zamanlayıcısını saf JS'e taşı |
| KAO-09 | `140bccd` KAO-09: öğrenme kuyruğunu ve görev üretimini kur |

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


