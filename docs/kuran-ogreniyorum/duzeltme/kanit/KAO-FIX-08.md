# KAO-FIX-08 · Kanıt (R-A2 çeldirici geçmişi, O-1)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test + simülasyon (cihaz yok)

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `test_kao_requirements.js` yeni enjeksiyonsuz blok, **HEAD `quranLearn.js`** ile (tam kopya, `$TMPDIR`) | 1 | `lastDistractors cevapta yazılmalı` — alan hiç yazılmıyordu |
| `kaoAnswer`: kelime görevinde yanlış seçeneklerin lemma kimlikleri `scheduled.lastDistractors` (≤3) | — | `node --check` 0 |
| `previousDistractorLemmas` ortak: `kaoPickDistractors` ve sözlük yedeği önceki çeldiricileri **lemma düzeyinde** dışlar (öteki yön kartı da aynı çeldirici); yedek aynı lemmayı iki kez seçmez | — | — |
| `test_kao_requirements.js` | 0 | iki gün `kaoStart → kaoAnswer`: 1. gün `kaAna/aAmana/jaA_a`, 2. gün `jaEala/Ealima/kafara` — kesişim 0; 1.000 oturum R-A2 ve bit-bit undo PASS |

Test notu: VM dizisi `assert.deepEqual` katı modda ana alandaki `[]`'e eşit sayılmıyordu (prototip) → `Array.from` ile ana alana taşındı; ilk "kesişim" hatası buydu, kural değil.

## Tasarım sapması (gerekçeli)
Prompt `c.cardId` saklamayı söyler; **lemma kimliği** saklandı. Dışlama zaten lemma düzeyinde; 365 günde veri artışı kart kimliğiyle +92 KB, lemma kimliğiyle **+70 KB**. Okuma iki biçimi de kabul eder (`lemmaIdForCard(id)||id`).

## Simülasyon + PIN-P + kontroller
| Ölçü / komut | Sonuç |
|---|---|
| Sim 365 g `knownByCode`/`knownByPlanDefinition` · newMax · hata | 504/504 · 8 · 0 |
| `quranLearn` boyutu 365. gün (FIX-07 → FIX-08) | 394 → 464 KB (FIX-09 bütçesi için risk, tuzak 15) |
| PIN-P `20260926f`→`20260926g` (9 dosya, SW iki sürüm, eski pin 0) | tamam |
| app 77/77 · kao 16/16 · panel 23/23 · panel-v2 27/27 · quran 9/9 · `App.kao*` 35 | exit 0 |
| driver · zikr 95/95 · rebind · shell · kao-plan-check · diff --check · repro | exit 0 |

**Kalan risk:** Cihaz kabulü yok. Veri boyutu FIX-09'da ele alınmalı (kart sayısı FIX-06 ile 2×).
