# Devir — MON2-06'dan MON2-07'ye

**Tarih:** 2026-09-15 · **Son commit:** bkz. `git log -1` (MON2-06 Dalga 3 kapanışı) · **Dal:** `premium-fx-gorsel-yuzey` (LOCAL-ONLY)
**Durum:** MON2-06 tamam (6/8, Dalga 3 Alan kapandı). Aktif kart **MON2-07** (Alan dalı, yan etkili gövdeler). Çalışma ağacı temiz.

## 0. İlk 2 dakika

1. Oku (bu sırayla): `monolit-bolumlenme-plan-2/README.md` §2 (bütçe tablosu) ve §5
   **MON2-07 kartı**; `MON2-STATE.json`; `.anti-amnesia/CURRENT-STATE.md`;
   `.anti-amnesia/LEDGER.md` son satır (seq 7).
2. Ölç ve LEDGER'a "önce" olarak yapıştır: `node tools/shell-inventory.mjs`
   (beklenen: app.js **7.797** · Legacy 0 · reminder gövde 408 · `*HTML` builder 6 fn / 97 satır).
3. Aktif bütçe **8.000 / 0 / 450 / 150** — satır hedefi 7.797 → ≤8.000 (kalan 3 saf
   gövde + aeon/location/header/weather/photo/habit). Kart kapanışında bütçe
   ölçülen+%2'ye daraltılır.

## 1. Kırmızı çizgiler (değişmedi)

- Push/merge/tag/deploy/tarayıcı/gerçek token/gerçek veri/`mustafaras/seyma-data` **yok**.
- Dokunma: `app/core/reminderSurface.js`, `reminders.js` + reminder×4, `render.js`,
  `sync.js`, `sw.js`, `panel*`, `app/content/*`, `docs/reminders/*`,
  `premium-fx-plan/MODULARIZATION.md`.
- **MON2-06'nın yüzey bölümleri frozen değil ama sözleşmesi bağlayıcı:** `zikir.js`/
  `quran.js`/`profile.js` yüzey bölümleri DOM/timer/sync'e **yalnız dep-bag takma
  adıyla** erişir (`doc`/`defer`/`sync`). Bu dosyalara yeni gövde eklersen aynı
  kurala uy — çıplak `document`/`setTimeout(`/`window.SeySync` YAZMA, yoksa
  `test_zikir_boundary` / `test_quran_boundary` / `test_profile_boundary` kırılır.
- `App.x=function` sayısı **554 sabit**; inline onclick kombine kaynakta **391 sabit**
  (`fx2` birleşik kaynağı zikir/quran İÇERMEZ — bu dosyalar kendi görünüm onclick
  metinlerini taşır; ekleme).
- `data=` 9 rebind, B1 getter, timer/listener **kaydı**, `window.App=App`, K3/K8 mutable
  pinleri ve `register*` bag'leri app.js'te kalır.
- Modal Tab/Shift+Tab/Escape sözleşmesi ve focus listesi davranışı değişmez.
- `skySceneNow`/`mountSkyCanvas` (canvas) ve `amb-wx-*` yorum tuzağı: fx2 ambience
  fixture'ı düz metin taraması yapar — CSS yorumlarında `amb-wx-`/`amb-time-` YAZMA.
- **Ağ/GPS/notification çağrısı MON2-07'nin kuralı:** `fetch(`, `navigator.geolocation`,
  `Notification`, `EventSource`/`ReadableStream` içeren satır **app.js'te kalır**;
  gövde "request builder" + "response applier" olarak ikiye bölünür ve **iki saf
  parça** taşınır (`fetchWeather` → `weatherRequest(data)` + `applyWeather(data,json)`).
  `showNativeAeonNotification` içindeki `reminderNotificationChannel(...)` snippet'i
  app.js'te kalır (K8). `sha256` WebCrypto sarmalayıcısı olduğu için kalır.

## 2. Dalga 3 kapanış anlık görüntüsü (doğrulanmış, MON2-06)

- `app.js` **7.797** satır (6.766 kod) · `*Legacy` 0 · reminder gövde 408 · builder 6 fn / 97
- `app/core/zikir.js` 1.724 (57 gövde) · `app/core/quran.js` 876 (52 gövde) ·
  `app/core/profile.js` 1.447 (17 profile + 20 psych gövde) · `app/core/appSurface.js` 459 (dokunulmadı)
- Taşıma deseni: MON-50 appSurface — ikinci **sloppy-mode** IIFE + `with(SCOPE)` +
  `Object.defineProperty` canlı getter'lar; `register*Surface` fail-closed; bag üyeleri
  app.js'te `getter fn` biçiminde
- **Dep-bag takma adları (MON2-06 kök düzeltmesi):** `document`→`doc`,
  `setTimeout(`→`defer(`, `window.SeySync`→`sync`; app.js bag'lerinde
  `doc:function(){return document;}`, `defer:function(){return setTimeout;}`,
  `sync:function(){return window.SeySync||null;}`
- **5 app_surface cache-bust pin'i** (MON2-05'te 4'tü — `test_app_surface_boot_boundary.js:178`
  beşincisi, MON2-06'da yakalandı). Hepsi `20260915a`'da senkron.
- Cache-bust: `zikir.js/quran.js/profile.js/app.js?v=20260915a`
- Kapı: smoke 21/21 (73 assertion) · `--gate` PASS (7.797/0/408/97) · driver+zikr **95/95** ·
  verify-state B1/B2/B3 · tests/app **52/52** · panel 23/23 · panel-v2 27/27 · quran 9/9 ·
  reminders 21/21 · sync 69/69 · `App.x=554` · onclick=391 · dump **6/6 BAYT-EŞİT** (deterministik)
- Bilinen koşum nondeterminizmi (migration dışı, önceden var): `app/core/health.js`
  `calculateMgNudge` skor satırı `Math.round(75+Math.random()*20)` — dump kanıtı gerektirirse
  geçici tmp driver kopyasında Math.random sabitle (LEDGER seq 7 sapma 8)

## 3. MON2-07 iş sırası (README §5)

1. **Kapsam:** aeon (≈345), location (≈208), header/weather/photo/habit/hero kalanları,
   `mergeInbox`, `lunaContext`, `psychScore`, `streamAsk` sarmalayıcıları. Hazırlık/parse/apply
   gövdesi `SeymaAppSurface`'e; **ağ/GPS/notification çağrısı app.js'te kalır** (§1 kuralı).
2. **Kural:** gövde "request builder" + "response applier" olarak ikiye bölünür; iki saf parça
   taşınır. `psychScore`/`lunaContext` saf → doğrudan taşınır. `sha256` WebCrypto → kalır.
3. **Kapı:** §7 ortak + `test_aeon_message_expand.js` + `test_messaging_boundary.js` +
   `test_daily_photo_history.js` + `run-reminder-smoke` + `test_reminder_app_notification_boundary.js`.
4. **Kabul:** `--gate` PASS (≤8.000 / 0 / 450 / 150); `App.x=554`; onclick 391; LEDGER seq 8;
   CURRENT-STATE + STATE (measurements.MON2-07) senkron; `DEVIR-MON2-08.md`; tek yerel commit.
   Ardından MON2-08 (seri kapanışı) — otomatik geçme, kullanıcı onayı bekle.

## 4. Bilinen tuzaklar (MON2-06'dan devralınan dersler)

- **Çıplak global = kırık sözleşme.** Domain dosyalarına gövde taşırken DOM/timer/sync
  erişimini daima dep-bag takma adıyla yap; `node tools/shell-inventory.mjs --domain <ad>`
  ile "yalnız-iç" listesini al.
- **Cache-bust pin'i 5 tanedir, 4 değil:** `test_app_surface_{domain,overlay,lifecycle,boot}_boundary.js`
  + `test_app_surface_daily_boundary.js` (regex tabanlı). `app.js?v=` literalini pinleyen
  fixture'ları `grep -rn 'app\\\.js\\?v=' tests/` ile tara.
- **combinedSource'a dosya eklemek sayıları kaydırır:** fx2 fixture'ında `onclick=391` pini
  zikir/quran/profile dosyalarını **hariç** tutar. Yeni bir görünüm bölümü taşırsan pin'i
  yeniden ölç, körlemesine combinedSource'a ekleme.
- Bağımlılık analizinde tanımlayıcı listesine güvenme: `find` dersi (LEDGER seq 6 sapma 3).
- `rewrite-app` benzeri otomasyon idempotent DEĞİL; her zaman `app-orig.js` kopyasından
  çalış; kolon-0 blok taraması kolon-0 `}` satırlarını da blok BAŞLANGICI sayar.
- K8 ilkesi — pin gövdeyi izler: gövdeyi slice'layan fixture'ları taşınan dosyaya çevir.
- Smoke kümesi **21** fixture; `REMINDER CONTRACT PASS` + sessiz PASS şeklinde yorumlanmalı.
- driver/zikr FILES + rebind boot listesi değişirse 4 listeye ekle (MON-25 dersi); MON2-07
  yeni dosya açmaz ama `appSurface.js` büyür — yük sırası değişmez.
