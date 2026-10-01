# K2F-12 — Seviye 0 1/4 — App.kaoS0 ve s0 görünümü
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: a42fe59f · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K5-02 (i, ii) · R değişimi: R-05 fail→pass

## İlerleme günlüğü
- [x] P1: sync PASS (12/44, nextPrompt K2F-12, seq 39); K2F-12 in_progress
- [x] Ölçüm: giriş noktası Keşfet → "Seviye 0 · şekil aileleri" satırı `kaoS0('start','s0.01')` çağırıyor; `App.kaoS0` tanımsızdı (düğme ölüydü); motor yüzeyinde `kaoS0` zaten vardı; `kaoS0('start')` yalnız durumu kuruyordu, görünümü açmıyordu
- [x] Kırmızı: `test_kao2_s0.js` (g) → `AssertionError: görünüm s0 · 'home' !== 's0'`
- [x] `kaoS0('start')` → `kaoApplyView(ui,'s0',id, push|replace)` + render; `app.js` tek shim; `KAO_VIEW_TITLES.s0` = "Harfler"
- [x] Pinler ölçülerek: App.kao* 42→43 · yüzey 763→764 · atama 601→602 (6 test dosyası + FIX-STATE)
- [x] Kapılar, P4

## Yapılan
- `app/core/quranLearn.js`: `kaoS0('start', id)` başarılıysa S0 görünümünü gerçekten açar (ana ekran → s0, `ui.kaoView==='s0'` iken `replace`; ders değişince yığında ikilenmez); bilinmeyen ders reddedilir. NavBar başlığı "Seviye 0" → "Harfler" (plan metni; hiçbir test eski başlığı sabitlemiyordu).
- `app.js` (yalnız izinli dokunuş, KAO shim satırı): `App.kaoS0` tek satırlık shim.
- Testler: `test_kao2_s0.js` (g) 2 yeni kontrol (gerçek yönlendirme: yığın home→s0, NavBar "Harfler", ders başlığı, `next`, ders değişimi, bilinmeyen ders, `kaoBack`; shim varlığı); `test_kao2_handler_surface.js` `KNOWN_MISSING` boşaldı; pin testleri.

## TDD
- Kırmızı: `node tests/kao/test_kao2_s0.js` → `AssertionError: görünüm s0 · 'home' !== 's0'`
- Yeşil: `KAO2 s0: PASS (12 kontrol)`; handler_surface PASS (liste boş)

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (49) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 183.287 KiB · runtime 104.750 KiB · css 13.061 KiB · p95 4.170 ms · steady 2.861 ms)
```
tekrar-uret: 6/10 PASS (önceki 5/10)

## Ölçümler
- `tekrar-uret`: **6/10 PASS** (önceki 5/10) — R-05 fail→pass; R-06 (6 çöken S0 dersi: s0.01, .03, .07, .08, .09, .11) K2F-13'te.
- Pinler (ölçüldü): App.kao* 43 · App yüzeyi 764 · atama 602 · `onclick` 393 (değişmedi) · yayın pini 20261001e (yayında değişmez).
- Pin güncellenen testler: test_fx2_tab_transition · test_fx2_touch_coverage · test_fx2_overlay_motion · test_v3_welcome · test_app_surface_daily_boundary (atama+yüzey) · test_kao2_onboarding · test_kao2_settings · test_kao2_word (App.kao* = 42→43; son ikisi P8 arama kalıbında yoktu, tam kapı koşusunda yakalandı).

## Bilerek değişen testler
- `test_kao2_handler_surface.js`: `KNOWN_MISSING = ['kaoS0']` → `[]` · gerekçe: K2F-12 `App.kaoS0`'ı tanımladı · K5-02.
- 8 pin testi: 42/763/601 → 43/764/602 · gerekçe: yeni handler (P8) · K5-02.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (canlıda düğme hâlâ ölü; sonraki yayında pin yükselmeli) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- S0 görünümü artık açıldığı için R-06 çökmeleri (6 ders) kullanıcıya görünür olur → K2F-13 önceliği yüksek; yayından önce K2F-13 tamamlanmalı (aksi hâlde Keşfet'ten S0'a girmek 6 derste çöker).
- `kaoS0Start` doğrudan çağrıldığında (testler) görünüm değişmez; yalnız `kaoS0('start')` yönlendirir.
