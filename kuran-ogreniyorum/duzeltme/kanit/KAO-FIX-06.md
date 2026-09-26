# KAO-FIX-06 · Kanıt (Y-2 iki yönlü kelime kartı)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test + simülasyon (cihaz yok)

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_queue.js` (yeni 120 günlük kelime taraması, eski kod) | 1 | (a) iki yönlü lemma **0/524** |
| `kaoCandidates`: yalnız `ar>tr`; `tr>ar` öncelik 1, `ar>tr` tanıtımı < bugün (yerel `todayStr`); bütçe ortak | — | `node --check` 0 |
| Teşhis: `introducedAt` ana cevap yolunda (`kaoAnswer`) **hiç yazılmıyordu** (yalnız namaz/anladım yolları) → ilk cevapta yazılır; eski kartta `r` yedeği (erken açmaz) | — | 2. gün `RRFF` |
| `recentNeighbor`: aynı lemmanın diğer yönü "komşu" sayılmaz (aynı kök anahtarı 3 gün bloke ediyordu) | — | — |
| R-A2 tek-yön takas bloğu kaldırıldı (gereksiz) | — | — |
| `node tests/kao/test_kao_queue.js` | 0 | (a) ≥%95 iki yön · (b) tr>ar ertesi günden önce yok · (c) yeni ≤ dailyNew · 2. günden itibaren her oturum iki yön |
| `test_kao_requirements.js` ilk oturum beklentisi `['ar>tr']` (tasarım gereği) | 0 | PASS (R-A2 çeldirici, DİA 524/524 dâhil) |

## 365 günlük simülasyon (`kao-sim.js … 365 0.9`, eski HEAD ↔ yeni)
| Ölçü | Eski | Yeni |
|---|---|---|
| lemmasSeen / **lemmasBothDirections** | 524 / 0 | 524 / **524** |
| knownByPlanDefinition | 0 | **505** |
| newMax (≤10) | 10 | 9 |
| görev · oturum medyanı | 4.523 · 7 | 8.142 · 21 |
| kart · `quranLearn` boyutu (365. gün) | 530 · 241 KB | 1.054 · 394 KB |
| hata | 0 | 0 |

## PIN-P + kontroller
| Komut | Sonuç |
|---|---|
| `20260926d`→`20260926e` (9 dosya, SW iki sürüm; eski pin 0) | tamam |
| `App.kao*=` sayısı · `app.js` | 35 = 35 · değişmedi |
| app 77/77 · kao 16/16 · panel 23/23 · panel-v2 27/27 · quran 9/9 | exit 0 |
| driver · zikr 95/95 · rebind · shell · kao-plan-check · diff --check · repro · fixture-map | exit 0 / aynı |

**Mevcut kullanıcı:** migration yok. Tek yönlü eski kartlar korunur; eksik yön ertesi günden aday olur (tanıtım tarihi yoksa son tekrar `r`).
**Kalan risk:** Kart sayısı ikiye katlandığı için veri 365 günde 394 KB (FIX-09 `daily` budaması kapsamında). Oturumlar uzar (medyan 21 görev). Cihaz kabulü yok.
