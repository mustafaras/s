# Devir — MON2-04'ten MON2-05'e

**Tarih:** 2026-09-14 · **Son commit:** bkz. `git log -1` (MON2-04 Dalga 1 kapanışı) · **Dal:** `premium-fx-gorsel-yuzey` (LOCAL-ONLY)
**Durum:** MON2-04 tamam (4/8, Dalga 1 kapandı). Aktif kart **MON2-05** (Görünüm dalı). Çalışma ağacı temiz.
**Kapanış belgesi:** [`deliverables/MON2-DALGA1-KAPANIS.md`](deliverables/MON2-DALGA1-KAPANIS.md)

## 0. İlk 2 dakika

1. Oku (bu sırayla): `monolit-bolumlenme-plan-2/README.md` §2 (bütçe tablosu) ve §5
   **MON2-05 kartı**; `MON2-STATE.json`; `.anti-amnesia/CURRENT-STATE.md`;
   `.anti-amnesia/LEDGER.md` son satır (seq 5); kapanış belgesi §6.
2. Ölç ve LEDGER'a "önce" olarak yapıştır: `node tools/shell-inventory.mjs`
   (beklenen: app.js 9.771 · Legacy 0 · reminder gövde 408 · `*HTML` builder 43 fn / 928 satır).
3. Aktif bütçe artık **9.400 / 0 / 450 / 150** — builder hedefi 928 → **≤150** kod satırı
   (`--gate` `maxHtmlBuilderCodeLines` 150'ye indi; satır bütçesi 10.300 → 9.400).

## 1. Kırmızı çizgiler (değişmedi)

- Push/merge/tag/deploy/tarayıcı/gerçek token/gerçek veri/`mustafaras/seyma-data` **yok**.
- Dokunma: `app/core/reminderSurface.js` (Dalga 1 ürünü, frozen), `reminders.js` + reminder×4,
  `sync.js`, `sw.js`, `panel*`, `app/content/*`, `docs/reminders/*`,
  `premium-fx-plan/MODULARIZATION.md`.
- `App.x=function` sayısı **554 sabit**; inline onclick kombine kaynakta **391 sabit**
  (fx2 overlay/tab/touch fixture'ları). `grep -cE '^App\.[A-Za-z0-9_]+\s*=\s*function' app.js`.
- `data=` 9 rebind, B1 getter, timer/listener **kaydı**, `window.App=App`, K3/K8 mutable
  pinleri ve `register*` bag'leri app.js'te kalır.
- Modal Tab/Shift+Tab/Escape sözleşmesi ve focus listesi davranışı değişmez.
- `skySceneNow`/`mountSkyCanvas` (canvas) ve `amb-wx-*` yorum tuzağı: fx2 ambience fixture'ı
  düz metin taraması yapar — CSS yorumlarında `amb-wx-`/`amb-time-` YAZMA.

## 2. Dalga 1 kapanış anlık görüntüsü (doğrulanmış, MON2-04)

- `app.js` 9.771 satır (8.532 kod) · `*Legacy` 0 · reminder gövde 408 · builder 928
- Modüller: `reminders.js` 4.189 satır (registry +171), `reminderSurface.js` 1.004 satır
  (35 fn + 51 handler, MON-50 deseni, with(SCOPE) idiomu, 123-dep bag)
- 22 `reminder*Legacy` emekli; `appendReminderEvent`+`persistReminderEvent` REM-67 dilim
  sözleşmesiyle app.js'te tam gövde (fn 35; `appendReminderEvent` bag getter'ı 123. üye)
- Cache-bust: `reminders.js?v=20260914a`, `reminderSurface.js?v=20260914d`, `app.js?v=20260914d`
- Kapı: smoke 20/20 · `--gate` PASS · driver+zikr 95/95 · verify-state B1/B2/B3 ·
  tests/app (modülerleştirme + premium 8/8 + fx2 6/6) · panel 23/23 · panel-v2 27/27 ·
  quran 9/9 · sync 69/69 · App.x=554 · onclick=391

## 3. MON2-05 iş sırası (README §5)

1. **Tam liste çek:** `grep -nE '^function [A-Za-z0-9_]+HTML\(' app.js` — 60 fn / 1.129
   baseline idi; şimdi 150 `*HTML`-suffixed fn, >2 satır olan 43 fn / 928 satır. Kart
   kapsamı `psychHTML`(64) `vacationCardHTML`(59) `heroTargetsHTML`(54)
   `appHeaderMeta`(61) `healthSetupCardHTML`(49) `hubTilesHTML`(47) `dailyPhotoCardHTML`(45)
   `habitsCardHTML`(39) `headerSceneHTML`(35) `quranDetailBodyHTML`(34)… — kalan tüm
   >2 satır builder'lar dahil (kart kabulü: `*HTML` builder ≤150 kod satırı).
2. **Kural:** builder yalnız `data/ui` okur ve string döndürür. `document` okuyan builder
   (`appHeaderMeta` gibi) önce okuma kısmı app.js'te bir `call('headerDomState')` dep'ine
   alınır. `render.js` dep bag'i mevcut `registerRender` listesine genişler — **yeni dosya
   yok (K5)**. Taşınan gövdeler `SeymaRender` üyesi olur; app.js'te 1-liner shim.
3. **Kapı:** §7 ortak + `tests/app/test_render_*_boundary.js` +
   `test_today_card_preferences.js` + `test_daily_photo_history.js` +
   `test_motivation_room_accessibility.js` + `tests/quran/*.js` + `run-reminder-smoke`.
   Driver `--dump bugun/rapor/ayarlar/hub` önce/sonra **bayt-eşit**; `test_fx2_ambience.js` PASS.
4. **Kabul:** `--gate` PASS (≤9.400 / 0 / 450 / **150**); LEDGER seq 6; CURRENT-STATE +
   STATE (measurements.MON2-05, shellBudget zaten MON2-05'te) senkron; `DEVIR-MON2-06.md`;
   tek yerel commit. MON2-06'ya geçme.

## 4. Bilinen tuzaklar (Dalga 1'den devralınan dersler)

- `with(SCOPE)` idiomu: modül-yüklemede statik bağlanır; `var SCOPE=Object.create(null)` +
  `installScopeProperties` (property-getter'lar AYNI objeye). `render.js` builder'ları için
  gerek yok — SeymaRender zaten bag-tabanlı.
- `rewrite-app` benzeri otomasyon kullanılırsa: idempotent DEĞİL; her zaman `app-orig.js`
  kopyasından çalış. Bag üye taraması `^  ([A-Za-z_][\w$]*):function` regex'i **gm** flag ile.
- fx2 kaynak araması iki aşamalıdır: appSource gövde assertion'ı tutmazsa modülde
  `function App_x(){` pattern'i ara (fx2_overlay FX2-16.1 modeli).
- perl pin değişiminde düz desen kullan (`20260914[bc]`), `\.js\?v=` backslash-literal'i değil.
- Smoke kümesi 20 fixture; `ui_boundary` çıktısız PASS verir — grep sayımı 20 "REMINDER
  CONTRACT PASS" satırı + sessiz PASS şeklinde yorumlanmalı.