# KAO2-12 — Ders oynatıcı (S-05)
Tarih: 2026-09-29 · Dal: kao2-yeniden-tasarim · Önceki commit: 6e77965e

## Yapılan
- KAO2-12 ders oynatıcısı ve günlük ders rotası tamamlandı: Tanış → Kavram → Pekiştir → Uygula → Özet; FSRS yanıtı mevcut ortak yoldan işleniyor, oturumdan çıkıp dönünce ilerleme korunuyor.
- A-1 ilk açılış yolu üç dokunuşta ilk `intro` kartına ulaşıyor. Günlük, S0 ve mastery başlangıçları `App.kaoLesson("start", id)` rotasını kullanıyor.
- Kullanıcının seq49 onayıyla yalnız `tests/kao/test_kao_render.js:87` eski `App.kaoStart()` assertion'ı gerçek Bugün rotası `App.kaoLesson("start","u01.01")` beklentisine güncellendi. Başka KAO assertion'ı bu onay kapsamında değiştirilmedi.
- Tam KAO ailesi, ayar varsayılanında bir regresyon buldu: `q.settings.dailyNew === 0` iken `|| 10` sıfırı yutuyor ve günlük kuyruğa yeni kart ekliyordu. Fallback iç içe `nonNegativeNumber` çağrısıyla düzeltildi; açık sıfır korunuyor, eksik/geçersiz ayar yine 10 kullanıyor. Değişmeyen `test_kao_requirements.js` 60 vadesi gelmiş kart sınırını doğruluyor.
- KAO2 ara kart pini `20260928b` korundu; `index.html`/`sw.js`, `data`, migration ve yeni handler eklenmedi. Toplam KAO handler sayısı 40.

## TDD
- Kırmızı: `node tests/kao/test_kao_render.js` → satır 87 eski `App.kaoStart()` eylemini bekledi. Kullanıcı yalnız bu assertion'ın güncellenmesini onayladı (LEDGER seq49).
- Kırmızı: tam KAO döngüsü `tests/kao/test_kao_requirements.js` → `64 !== 60`, `dailyNew:0` regresyonunu gösterdi.
- Yeşil: render fikstürü PASS; `test_kao_requirements.js` PASS (R-A1/A2/A4/A5/A9, R-B1/B5/B8, R-C2/C3/C4/C5/C6; DİA 524/524).
- Yeşil: tam KAO ailesi 28/28 PASS.

## Kapılar (P3)
| Komut/grup | Sonuç |
|---|---|
| `node --check` KAO2 dört modülü | PASS |
| `tests/kao/test_*.js` | 28/28 PASS |
| `tests/app/test_*.js` | 77/77 PASS |
| `tests/panel/test_*.js` | 23/23 PASS |
| `tests/panel-v2/test_panel_v2_*.js` | 27/27 PASS |
| `tests/quran/test_*.js` | 9/9 PASS |
| reminder smoke | 21 curated fixture PASS |
| run-seyma driver | PASS |
| zikr harness | 95/95 PASS |
| `kao-verify-contrast.mjs` | 496 çift, 0 ihlal |
| `kao2-sync-check.mjs` | PASS |
| `test_kao2_perf_budget.js` isolated | PASS |

## Ölçümler
- Ders akışı 8/8; ilk açılış 15/15; Bugün 7/7; kullanıcı yolu üç dokunuş; tasarım kontratı PASS.
- İçerik gzip 168.483 KiB / 256 KiB; runtime 72.661 KiB / 80 KiB; CSS 9.198 KiB / 14 KiB.
- VM p95 4.587 ms; taban+%25 eşiği 5.088 ms. İlk ayrı ölçüm 8.977 ms FAIL verdi; izole tekrar 4.587 ms PASS oldu, eşik değiştirilmedi.
- Tam KAO regresyonunda değişmeyen günlük borç sınırı 60 görev olarak kaldı; açık `dailyNew=0` davranışı korundu.

## Bilerek değişen test
- `tests/kao/test_kao_render.js:87`: `App.kaoStart()` → `App.kaoLesson("start","u01.01")`. Gerekçe: gerçek günlük kart artık KAO2-12 ders oynatıcısını açıyor. Tek satır değişikliği kullanıcı seq49'da onayladı.

## Kanıt düzeyleri
- Kaynak/test: PASS · Yayın: yok (release approval KAO2-11'de bitiyor) · Cihaz: doğrulanmadı.
