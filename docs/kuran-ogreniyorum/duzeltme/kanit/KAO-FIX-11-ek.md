# KAO-FIX-11 eki · Kanıt (işlev kelimelerinde çeldirici, kullanıcı onayı)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test + simülasyon (cihaz yok)

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `test_kao_requirements.js` yeni blok: 524 lemma × 2 yön, boş veri, her görev 3 tekil çeldirici (eski kod) | 1 | **98** görev eksik (köksüz işlev kelimeleri 0 çeldirici; `T`/`LOC`/`INTG` 2) |
| `kaoBuildTask` sözlük yedeği katmanlı: (1) aynı tür ∧ farklı kök, (2) hedef köksüzse öteki köksüzler, (3) herhangi; aynı kök yalnız kök varken dışlanır; etiketler tekil ve **anlam parçası çakışmaz** (`,` `;` `(` `/`) | — | `node --check` 0 |
| Aynı test + köksüz kelimede doğru cevapla çakışma yok | 0 | PASS |

Örnek (boş veri): `مِن` → ✓-den, -dan · -e, -a · içinde · üzerine (önce "-den (uzaklaşma)" çakışıyordu); `إِذَا` → ✓-dığı zaman, -ınca · gün · hiçbir zaman · hani, o vakit.

## Kontroller
| Komut | Sonuç |
|---|---|
| PIN-P `20260926h`→`20260926i` (9 dosya, SW iki sürüm, eski pin 0) | tamam |
| app 77/77 · kao 17/17 · panel 23/23 · panel-v2 27/27 · quran 9/9 · `App.kao*` 35 | exit 0 |
| driver · zikr · rebind · shell · kao-plan-check · diff --check · repro | exit 0 |
| Mutasyon (korumalı `rsync` hedefi) | 17/17 |
| Sim 365 g: bilinen kod=plan 507 · newMax 8 · hata 0 · taşlar half/fatiha/twoThirds/namaz (2026-09-12…10-22) | tamam |

Kökü olan kelimelerde 1. katman eski davranışla aynı. **Kalan risk:** 3. katman ilgisiz kelime getirebilir (ör. "Lut (peygamber)"); cihaz kabulü yok.
