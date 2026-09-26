# KAO-FIX-10 · Kanıt (O-3 kilometre taşları, 03 §10)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test + simülasyon (cihaz yok)

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `test_kao_requirements.js` taş bloğu (eski kod) | 1 | `api.kaoMilestoneCheck is not a function` |
| Saf `kaoMilestoneCheck(d, nowIso)` → yeni anahtarlar; `recordMilestones` yalnız boş alana yazar; `kaoAnswer` + `kaoMarkUnderstood` çağırır; yeni taşta `ui.kaoFeedback = "<etiket> ✦"` (konfeti/SeyFx yok) | — | `node --check` 0 |
| Ünite üyeliği: saf `kaoUnitSlices()` — `kaoUnits` ve taşlar aynı kaynak (tekrar tanım yok) | — | — |
| Kalıcılık kuralı `isSettled(card, minS)` genelleşti (`isDurable = isSettled(21)`, ünite taşı `isSettled(7)`); kaynak denetimi "kural tek yerde" korundu | — | `card.readerUnknown!==true` 1 |
| `test_kao_requirements.js` | 0 | fatiha/namaz s=6,9 → yok, s=7 → var; half/twoThirds frekanstan hesaplı eşiğin bir altı yok, eşikte var; kaoAnswer ISO yazar; undo taşı geri sarmaz; kapsam düşse taş kalır |

## Belgelenen bulgu (karar FIX-16)
`eighty` (kapsam ≥0,80) **kazanılamaz**: `kaoCoverage` token paydası (77.430) ile 524 lemmanın tamamı bilinse de %77,42. Plan %80'i LEM havuzuyla tanımlamıştı (%80,9). Koşul prompttaki gibi uygulandı; testte belgelendi.

## Simülasyon (365 g, p=0.9)
| Taş | Tarih (başlangıç 2026-01-01) |
|---|---|
| half · fatiha · namaz · twoThirds | 2026-08-09 · 09-21 · 09-23 · 09-27 |
| eighty · shortSurahs | null (tavan) · null (sim okuyucu akışını koşmaz; mevcut kod) |
`knownByCode`=`knownByPlanDefinition`=504, newMax 8, hata 0.

## PIN-P + kontroller
| Komut | Sonuç |
|---|---|
| `20260926g`→`20260926h` (9 dosya, SW iki sürüm, eski pin 0) | tamam |
| app 77/77 · kao 17/17 · panel 23/23 · panel-v2 27/27 · quran 9/9 · `App.kao*` 35 | exit 0 |
| driver · zikr · rebind · shell · kao-plan-check · diff --check · repro | exit 0 |
| `kao-mutate.mjs` (M10 `isDurable`'a yeniden hedeflendi) | 13/15 YAKALANDI; M04/M09 KAÇTI (FIX-11) |

**Kalan risk:** `eighty` kullanıcı için ulaşılmaz hedef (FIX-16 kararı). Cihaz kabulü yok.
