# KAO-FIX-07 · Kanıt (Y-1 "bilinen kelime" = plan tanımı, 02 §3)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test + simülasyon (cihaz yok)

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `test_kao_requirements.js` yeni tanım bloğu (eski kod) | 1 | "tek yönü review ∧ s=30 → bilinmiyor" düştü |
| `isDurable(card)` = review ∧ s≥21 ∧ ¬orphan ∧ ¬readerUnknown; `kaoKnownLemmaSet` = iki yönde `isDurable`; E3 sayacı `!isDurable(prev)&&isDurable(next)`; hub "N kelime kalıcı" | — | `node --check` 0; `card.readerUnknown!==true` tek yerde |
| `test_kao_requirements.js` | 0 | 4 vaka + okuyucu-bilinmeyen + `kaoCoverage`=Σfreq/77.430 PASS |

## Sapmayı sabitleyen test iddiaları (eski → yeni, gerekçe 02 §3)
| Dosya | Eski | Yeni |
|---|---|---|
| requirements CSV + `sandboxLemma` | `{reps:1/2}` tek yön = bilinen, CSV 2 satır | iki yön review∧s≥21 = bilinen, CSV 1 satır (tek yön hariç) |
| panel_projection | ar>tr `review` (s yok) + tr>ar `learning` = 2 bilinen | lemma0/1 iki yön kalıcı = 2; lemma2 okuyucu-bilinmeyen, lemma3 tek yön sayılmaz |
| render hub | `1 kelime tanıdık` (ar>tr review) | iki yön s=21 → `1 kelime kalıcı` (etiket; handler aynı) |
| render E11 namaz | ar>tr `{reps:2, review}` açık | iki yön s=21 açık |
| lexicon_coverage *(izin listesi dışı)* | `{reps:1}` tek yön = bilinen | iki yön kalıcı; yetim/okuyucu-bilinmeyen yön lemmayı düşürür |
| queue E9 `knowAll` *(izin listesi dışı)* | `{reps:1}` ar>tr | iki yön kalıcı; tek yön silinince bilinmez |
| privacy CSV *(izin listesi dışı)* | `{reps:1}` | iki yön kalıcı |

İzin listesi dışı üç test aynı sapmayı sabitliyordu (M10 listesi eksikti); kullanıcı "her şeyi düzelt" dedi.

## Kabul
| Ölçü | Sonuç |
|---|---|
| Sim 365 g `knownByCode` / `knownByPlanDefinition` | **505 / 505** (eski 524 / 0) · kapsam %77,42 → **%74,76** |
| UI yoklaması 60 g panel `knownWords` | 72 (148 kalıcı kart = 72×2 + 4 tek yön) · kapsam %7 |
| `kao-mutate.mjs` (kopya) M10 "bilinen = reps>0" | **YAKALANDI**; M08 FIX-06 koduna hedeflendi → YAKALANDI; M04/M09 KAÇTI (FIX-11) |
| PIN-P `20260926e`→`20260926f` | 9 dosya, SW iki sürüm, eski pin 0 |
| app 77/77 · kao 16/16 · panel 23/23 · panel-v2 27/27 · quran 9/9 · `App.kao*` 35 | exit 0 |
| driver · zikr 95/95 · rebind · shell · kao-plan-check · diff --check · repro · fixture-map | exit 0 / aynı |

**Kullanıcıya not:** Mevcut verisi olan kullanıcıda kapsam yüzdesi ve "kalıcı" sayısı **düşer** (tek yönlü ya da s<21 kartlar artık sayılmaz). Veri kaybı yok; doğru ölçüm. E9 âyet kapısı ve CSV de aynı sıkı tanımı kullanır.
