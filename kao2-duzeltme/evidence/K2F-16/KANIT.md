# K2F-16 — Niyet — okuma, değiştirme, öneri
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: 825d56e2 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K3-06, K3-05, P-10, D-18 · R değişimi: R-07 fail→pass

## İlerleme günlüğü
- [x] P1: sync PASS, dal kao2-duzeltme, nextPrompt K2F-16
- [x] kırmızı testler (settings + hub) görüldü
- [x] kaoSetIntent + Ayarlar satırı/segmenti + hub önerisi
- [x] P8 pinleri 43→44 · 764→765 · 602→603 (ölçüldü)
- [x] kapilar.sh YEŞİL, tekrar-uret 9/10

## Yapılan
- Kök neden: Ayarlar `settings.intent` okuyordu; onboarding niyeti `onboarding.intent`'e yazar → Ayarlar hep "Henüz seçilmedi".
- Ayarlar niyet satırı `q.onboarding.intent`'ten okur ("Kendim seçerim" dâhil) + 6 seçenekli "Niyet" segmenti.
- `kaoSetIntent(v)`: yalnız 5 vakit + custom kabul; geçersiz → false, mevcut niyet korunur. app.js tek shim, motor yüzeyi.
- `kaoIntentSuggestion(d, now, today, intent)`: niyet vakti varsa o vaktin saati (geçtiyse "yarın …"); yoksa eski davranış. Hub çağrısı niyeti geçirir.

## TDD
- Kırmızı: `node tests/kao/test_kao2_settings.js` → expected /Niyet: Her yatsı namazından sonra 5 dakika/ ; `test_kao2_hub.js` → expected 'Niyet önerisi: yatsı namazından sonra 5 dakika (20:30)'
- Yeşil: iki dosya PASS; `tekrar-uret.cjs` R-07 PASS

## Kapılar (P3)
SONUÇ: TÜM KAPILAR YEŞİL · perf: content 184.231 KiB · runtime 110.800 KiB (tavan 128) · css 13.560 KiB (tavan 14)
tekrar-uret: 9/10 PASS (önceki 8/10)

## Ölçümler
- App.kao* 44 · yüzey 765 · atama 603 · onclick 393 (değişmedi)

## Bilerek değişen testler
- test_kao2_settings/word/onboarding: handler pini 43→44 · test_app_surface_daily_boundary: 602→603, 764→765 · test_fx2_{tab_transition,touch_coverage,overlay_motion}, test_v3_welcome: 764→765 · gerekçe: yeni handler (P8)

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (pin değişmedi, 20261001f) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Niyet iki ayrı alana bölünmüştü (settings.intent vs onboarding.intent); tek kaynak artık onboarding.intent.
