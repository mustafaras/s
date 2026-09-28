# KAO-FIX-09 · Kanıt (O-2 durum bütçesi → kullanıcı kararı KF-10)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** ölçüm + test (kod değişmedi)

## Ölçüm (365 g simülasyon, FIX-08 sonrası, p=0.9)
| Parça | Boyut |
|---|---|
| `cards` (1.054; FIX-06 iki yön) | 318,2 KB — `lastDistractors` 69,9 · `introducedAt` 43,2 · `due` 34,0 · `r` 31,9 · `predictedR` 24,5 … |
| `daily` (365 satır, ~392 B/satır) | 144,9 KB — son 90 gün 35,4 KB |
| diğer | ~1 KB |
| **Toplam** | ~464 KB; 90 gün budamayla bile ~354 KB → 100 KB bütçesi tasarımla tutmuyor |

## Karar (Ö6: plan kararı → kullanıcıya soruldu)
Seçenekler: budama + ölçülen tavan / budama + kart sıkıştırma / yalnız budama. Kullanıcı: **"budamayalım geliştirelim, bu sınırları kaldır"** → **KF-10: `daily` budanmaz, 100 KB sınırı kaldırıldı.**
- Senkron güvenli: `sync.js` QY-22, 1 MB üstü `latest.json`'ı Blobs API ile okur (2026-08-18'de 1,51 MB'ta keşfedildi, çözüldü).
- Kapalı programın `KAO-STATE.json` `stateBudgetKB:100` ve 05 §2 "daily son 90 gün" satırları V8 gereği değişmedi → FIX-16 kapanış ekine istisna yazılacak (tuzak 15).

## Test
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_state_budget.js` (yeni) | 0 | 400 günün hepsi korunur, kayıtlar değişmez, ikinci `ensureQuranLearn` bayt-eş; 40,1 KB bilgi amaçlı |
| Aynı test, kopyada `ensureQuranLearn`'e 90 gün budaması enjekte | 1 | `KF-10: 400 günün hiçbiri budanmamalı (90)` — koruma çalışıyor |

## Kontroller
| Komut | Sonuç |
|---|---|
| kao 17/17 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 | exit 0 |
| driver · zikr · rebind · shell · kao-plan-check · diff --check | exit 0 |
| `quranLearn.js` / pin | değişmedi (`20260926g`) |

**Değişen:** `tests/kao/test_kao_state_budget.js` (yeni), `tests/kao/README.md` (+1), `duzeltme/**`.
**Kalan risk:** Veri yılda ~460 KB büyür (sınırsız, kullanıcı kararı); her kayıtta tüm `latest.json` itilir. Cihaz kabulü yok.
