# KAO-FIX-23 · Uygulama niyeti önerisi (02 §5.8, KF-6)

Dal `kao-duzeltme`, taban `c148329`. `app.js` değişmedi; yeni `App.*` handler / onclick yok (App 756, onclick 393, App.kao* 35).

## Önce kırmızı
- `node tests/kao/test_kao_requirements.js` (HEAD kodu + yeni test) → exit 1: `api.kaoIntentSuggestion is not a function`.

## Değişiklikler (`quranLearn.js`)
- `kaoIntentSuggestion(d, now, bugün)`: `days[bugün].prayer` (sabah/öğle/ikindi/akşam/yatsı) **yalnız okunur**; sıradaki vakit → "öğle namazından sonra 5 dakika (13:05)", yatsıdan sonra "yarın sabah namazından sonra 5 dakika", veri yoksa boş.
- `kaoHubCardHTML`: bugün çalışılmadıysa ve gece penceresi kapalıysa "Niyet önerisi: …" satırı (mevcut `kao-hub-ayah` sınıfı).
- Sapma/gerekçe: kayıtlı `getDay` bağımlılığı eksik günü **oluşturduğu** için kullanılmadı; bağımsızlık testi (`data.prayer` yasağı) korunur; `app.js` bağımlılık torbasına dokunulmadı. REM dondurulmuş: bildirim yok (test kaynakta `Notification`/`SeyReminder` olmadığını doğrular).

## Kontroller
- Test: 4 zaman dilimi + veri yok + `days` değişmedi (JSON eş) + hub satırı / bugün çalışıldıysa yok
- kao 17/17 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · driver 0 · zikr 0 (95/95) · rebind 0 · shell-inventory PASS · plan-check PASS (6 warn) · kontrast 336/0 · diff-check ok · independence PASS
- `quranLearn.js` 1.880 satır (≤1.900) · PIN-P `20260927c` → `20260927d` (9 dosya, eski 0)
- `kao-sim.js . 365`: FIX-22 ile birebir aynı (kuyruk değişmedi): maxRun 2 · kod=plan 506 · hata 0
- 02 §5.8 durum satırı → Uygulandı (KAO-FIX-23)

## Kalan risk
- Cihazda doğrulanmadı. Namaz vakti o gün hiç çekilmediyse öneri görünmez.
