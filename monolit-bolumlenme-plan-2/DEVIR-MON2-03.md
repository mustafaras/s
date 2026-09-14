# Devir — MON2-02'den MON2-03'e

**Tarih:** 2026-09-14 · **Son commit:** bkz. `git log -1` (MON2-02 kapanışı `f58dfa7`) · **Dal:** `premium-fx-gorsel-yuzey` (LOCAL-ONLY)
**Durum:** MON2-02 tamam (2/8). Aktif kart **MON2-03**. Çalışma ağacı temiz.

## 0. İlk 2 dakika

1. Oku (bu sırayla): `monolit-bolumlenme-plan-2/README.md` §3 (K1–K9) ve §5 **MON2-03 kartı**;
   `MON2-STATE.json`; `.anti-amnesia/CURRENT-STATE.md`; `.anti-amnesia/LEDGER.md` son satır (seq 3).
2. Ölç ve LEDGER'a "önce" olarak yapıştır: `node tools/shell-inventory.mjs`
   (beklenen: app.js 10.277 · Legacy 0 · reminder gövde 947 · HTML 928).
3. Yalnız MON2-03'ü uygula. Bitince **tek yerel commit**. MON2-04'e geçme.

## 1. Kırmızı çizgiler

- Push/merge/tag/deploy/tarayıcı/gerçek token/gerçek veri/`mustafaras/seyma-data` **yok**.
- Dokunma: `app/core/reminderCatalog|Engine|Scheduler|Delivery.js`, `sync.js`, `sw.js`,
  `panel*`, `app/content/*`, `docs/reminders/*`, `premium-fx-plan/MODULARIZATION.md`.
- `App.x=function` sayısı **554 sabit**; 1 satırlık `App.reminderX=reminderX` alias'ları
  ve 1 satırlık `return fn()` biçimleri **olduğu gibi kalır**; yalnız ≥2 satırlık handler
  gövdeleri MON-50 desenine çevrilir.
- `data=` rebind, timer/listener **kaydı** (`reminderLifecycleTick` setInterval
  app.js:10247, `reconcileReminderStorageEvent` storage listener app.js:10254),
  `scheduleMoveSync` (app.js:8724), 9 mutable
  `reminder*` değişkeni (K3) ve `registerReminders/registerReminderView/
  registerReminderSurface` bag'leri app.js'te kalır.
- K8 pinleri app.js'te doğrulandı (seq 3 öncesi): `scheduleMoveSync(){ var payload=
  reminderSyncPayload(data);` (:8724), `reminderNotificationChannel({tag:opts.tag||
  'aeon-message'})` (:9329 — **çağrı alanı**; gövde taşınırsa shim pin'i korur),
  `window.ReminderEngineV1` (:1459 engine bag getter'ı),
  `App.reminderCrossSurfaceStatus=reminderCrossSurfaceStatus` (:3561).
- Modal Tab/Shift+Tab/Escape sözleşmesi ve focus listesi davranışı değişmez.

## 2. MON2-03 iş sırası

1. Bag: `registerReminderSurface` (app.js:2911) çağrısını README §5 listedeki zorunlu
   üyelerle genişlet, `throw` fail-closed: `data, ui, app, save, saveLocal, render, toast,
   todayStr, activeDate, editing, download, appendEvent, ensureEventLog,
   zikrUnlockBodyScroll, quranUnlockBodyScroll, document, localStorage, notification
   (function(){ return typeof Notification!=='undefined'?Notification:null; }), navigator,
   setTimeout, clearTimeout, now` + K3 get/set çiftleri (`permissionTransient/
   setPermissionTransient, permissionInFlight/set…, permissionEverGranted/set…,
   permissionGrantObserved/set…, lifecycleState/set…, schedulerInstance/set…,
   lifecycleTimerId/set…, migrationStatus/set…, bodyLock/setBodyLock`).
   `reminderSurface.js`'in `REMINDER_SURFACE_DEPENDENCIES` listesini aynı üyelerle güncelle.
2. Sıra: (d) 40 fn / 338 satır yan etkili gövdeler → (b) 35 fn / 447 satır
   lifecycle/evaluate/inbox gövdeleri → (c) 5 fn / 42 satır (02'de taşınmadıysa) →
   ~60 handler gövdesi (`App.x=function(){ return SEYMA_REMINDER_SURFACE.x.apply(
   null,arguments); }`). Her gruptan sonra
   `node --check app.js app/core/reminderSurface.js && node tests/reminders/run-reminder-smoke.mjs`.
3. Modül `SeyHaptics/SeyAudio/SeyFx`'i `window` üzerinden guard'lı okur (K5).
4. Cache-bust: `index.html` → `reminderSurface.js?v=` (mevcut `20260914a`, L97) ve
   `app.js?v=` (mevcut `20260914c`, L107) bump. **Tuzak:**
   `tests/app/test_app_surface_{boot,domain,lifecycle,overlay}_boundary.js`
   `app\.js?v=20260914c` literalini pinler → yeni değere çek (node string escape tutmaz,
   `perl -pi -e` kullan).
5. `MON2-STATE.json`: `shellBudget` = 10.300 / 0 / 450 / 950; `completedPrompts=3`,
   `activePrompt=nextPrompt=MON2-04`, `lastCompletedEvidence`, `measurements["MON2-03"]`.
   CURRENT-STATE güncelle; LEDGER **seq 4 ekle** (silme/düzenleme yok).

## 3. Kapı (hepsi exit 0, aksi halde commit yok)

```bash
node --check app.js && node --check sync.js && for f in app/core/*.js; do node --check "$f" || exit 1; done
node tools/shell-inventory.mjs --gate
node .claude/skills/run-seyma/driver.mjs && node .claude/skills/run-seyma/zikr-harness.mjs
for f in .claude/skills/run-seyma/verify-state-*.mjs; do node "$f" || exit 1; done
for f in tests/app/test_*.js; do node "$f" >/dev/null 2>&1 || echo "FAIL $f"; done
node tests/reminders/run-reminder-smoke.mjs
node tests/reminders/test_reminder_app_acceptance.js
node tests/app/test_modal_focus_containment.js && node tests/app/test_aeon_message_expand.js
```

Kabul: `--gate` PASS (≤10.300 / ≤450 reminder gövde); `App.x=function` 554;
inline onclick 391; `withModule:false` senaryosu PASS; smoke **21** curated fixture
(LEDGER eski satırlarındaki "20/20" anlatım sayısıdır, düzeltilmez — append-only).

## 4. Bilinen tuzaklar

- **Saflık taraması kapsamı (kritik):** `test_reminder_app_acceptance.js` `impureApis`
  (`fetch(, XMLHttpRequest, localStorage., document., setTimeout(, setInterval(,
  navigator., Notification(`) **tüm RUNTIME_MODULES'a** — `reminderSurface.js` dahil —
  uygulanır. Yan etkili gövdeler bu API'lere **yalnız bag üzerinden** erişir ve literal
  kalıntı bırakmaz. Dikkat: `deps.document.getElementById` bile regex'e takılır
  (`\bdocument\s*\.` — nokta öncesi word boundary); yerel değişkene al:
  `var doc=call('document'); doc.getElementById(...)`, `var N=call('notification');
  new N(...)`, `var st=call('setTimeout'); st(fn,ms)`.
- K8 kaynak-metin pinleri: gövde taşınırken **çağrı alanı** app.js'te kalır;
  `reminderNotificationChannel` gövdesi (b) listesinde — pin (:9329) shim formuyla
  yaşar, fixture güncellemesi GEREKMEZ (pin çağrı alanına, gövdeye değil).
  `test_reminder_app_notification_boundary.js:600` sadece çağrı alanını pinler.
- `test_reminder_cross_surface_status.js` `extractFunction` adla çıkarır:
  `scheduleMoveSync(){ var payload=reminderSyncPayload(data);`,
  `reminderNotificationChannel({tag:opts.tag||'aeon-message'})`,
  `window.ReminderEngineV1`, `App.reminderCrossSurfaceStatus=…` **app.js'te kalmalı**.
  `sey-reminder-inbox-live` pin'i zaten birleşik kaynakta (APP_REMINDER_SOURCE).
- `test_reminder_ui_boundary.js:146` regex: `function reminderCenterOverlayHTML(){…`
  formu — MON2-03 bu builder'ı **taşımaz** (MON2-05).
- FX2 combinedSource (`test_fx2_{overlay_motion,tab_transition,touch_coverage}.js`)
  `remindersSource + reminderSurfaceSource` içerir; handler taşındıkça onclick 391'de
  sabit kalır, fixture'ların ek kaynağa ihtiyacı yok.
- Modal odak fixture'ı: `reminderLock/UnlockBodyScroll, reminderActiveElementId,
  reminderRestoreFocus` taşınırken davranış birebir korunur; `test_modal_focus_containment`
  kapıdadır.
- `withModule:false`: `ReminderDeliveryV1` yokken çalışan adaptör davranışı modülde
  aynen korunur.
- Timer/listener **kaydı** app.js'ten çıkmaz; `Notification.requestPermission` çağrısı
  taşınır ama kim tetikler (`App.requestReminderPermission`) değişmez.
- Premium fixture'lar saati 12:00'a sabitler; quiet-time hatası görürsen kod değil saattir.
- Sapma olursa kartı bloke etme: bütçeyi ölçülen değere çek, LEDGER'a yaz.