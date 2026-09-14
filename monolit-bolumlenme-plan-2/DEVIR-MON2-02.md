# Devir — MON2-02'den devam

**Tarih:** 2026-09-14 · **Son commit:** bkz. `git log -1` (devir commit'i dahil) · **Dal:** `premium-fx-gorsel-yuzey` (LOCAL-ONLY)
**Durum:** MON2-01 tamam (1/8). Aktif kart **MON2-02**. Çalışma ağacı temiz.

## 0. İlk 2 dakika

1. Oku (bu sırayla): `monolit-bolumlenme-plan-2/README.md` §3 (K1–K9) ve §5 **MON2-02 kartı**;
   `MON2-STATE.json`; `.anti-amnesia/CURRENT-STATE.md`; `.anti-amnesia/LEDGER.md` son satır.
2. Ölç ve LEDGER'a "önce" olarak yapıştır: `node tools/shell-inventory.mjs`
   (beklenen: app.js 13.150 · Legacy 22 · reminder gövde 3.247 · HTML 1.129).
3. Yalnız MON2-02'yi uygula. Bitince **tek yerel commit**. MON2-03'e geçme.

## 1. Kırmızı çizgiler

- Push/merge/tag/deploy/tarayıcı/gerçek token/gerçek veri/`mustafaras/seyma-data` **yok**.
- Dokunma: `app/core/reminderCatalog|Engine|Scheduler|Delivery.js`, `sync.js`, `sw.js`,
  `panel*`, `app/content/*`, `docs/reminders/*`, `premium-fx-plan/MODULARIZATION.md`.
- `App.x=function` sayısı 554 sabit; `App.reminderX=reminderX` alias satırları değişmez;
  `data=` rebind, timer/listener kaydı, `registerReminders/registerReminderView/
  registerReminderSurface` bag'leri app.js'te kalır.
- Bu kartta **taşınmaz**: `data/ui` yazan, `save()/render()` çağıran, `document/
  localStorage/Notification/navigator/setTimeout` kullanan gövdeler (MON2-03).
- Yeni dosya açma (K5). `app/core/reminders.js` büyür.

## 2. MON2-02 iş sırası

1. `node tools/shell-inventory.mjs --domain reminder` → "yalnız-iç" listesi: bunlar
   app.js'ten **shim'siz** silinir. Listede olmayanlar 1 satır shim bırakır:
   `function x(){ return SEYMA_REMINDERS.x.apply(null,arguments); }`
2. Sıra: `var REMINDER_*` sabitleri (120 blok) → `reminderPolicy*` → engine/delivery/
   scheduler adaptörleri → catchup/dailyFlow/evening → local/merge/normalize/
   `migrateReminderState` → personalization/crossSurface/privacy/digest/schema →
   prayer/zikr/therapy/saygi/special/medication/care/native **saf** üyeleri →
   etiketler → 19 `reminder*HTML` + `reminderCenterHistory*` + `reminderSystemStatus*`.
   Her gruptan sonra `node --check app.js app/core/reminders.js && node tests/reminders/run-reminder-smoke.mjs`.
3. K1: 22 `reminder*Legacy` sil (app.js ~2073–2219, ~5481–5748); `SEYMA_REMINDERS.x ? … : xLegacy`
   çift shim'leri tek forma indir; `app.js:1505` `previewSafeCopy:` modül üyesine bağlanır.
   `registerReminders` (app.js:1458) `policyDefaults/channels/quietBehaviors/capacityModes/
   priorityRank` dep'lerini kaldır (sabitler modülde); `registerReminderView` (app.js:1475)
   `sections` bag'ini kaldır — bölümler modül içinden üretilir. Registry yoksa **throw**.
4. Modülün app.js'ten ihtiyaç duyduğu dep'ler (ölçüldü — bag'e ekle): `esc, icon, todayStr,
   activeDate, minToHHMM, hhmmToMin, prayerSettings, prayerMethod, prayerLocation,
   prayerLocationHash, syncConfigured, normalizeSyncReceipt, featuresLive, saygiPersonById,
   saygiCurrentPerson, saygiArticleReadableFor, saygiPeople, caffeineTargetBed,
   caffeineCutoffTime, PRAYER_NAMES, ZIKR_V2_VISIBLE, EVENT_LOG_SCHEMA_VERSION, KEY`;
   state için `data`/`ui` **getter** (`function(){ return data; }`), asla snapshot.
5. Cache-bust: `index.html` → `reminders.js?v=20260914a`, `app.js?v=20260914c`.
   **Tuzak:** `tests/app/test_app_surface_{boot,domain,lifecycle,overlay}_boundary.js`
   `app\.js\?v=20260914b` literalini pinler → `20260914c` yap.
6. `MON2-STATE.json`: `shellBudget` = min(mevcut, ölçülen×1.02) → hedef 11.300 / 0 / 1.500 / 1.150;
   `completedPrompts=2`, `activePrompt=nextPrompt=MON2-03`, `lastCompletedEvidence`,
   `measurements["MON2-02"]`. CURRENT-STATE güncelle; LEDGER **seq 3 ekle** (silme/düzenleme yok).

## 3. Kapı (hepsi exit 0, aksi halde commit yok)

```bash
node --check app.js && node --check sync.js && for f in app/core/*.js; do node --check "$f" || exit 1; done
node tools/shell-inventory.mjs --gate
node .claude/skills/run-seyma/driver.mjs && node .claude/skills/run-seyma/zikr-harness.mjs
for f in .claude/skills/run-seyma/verify-state-*.mjs; do node "$f" || exit 1; done
for f in tests/app/test_*.js; do node "$f" >/dev/null 2>&1 || echo "FAIL $f"; done
node tests/reminders/run-reminder-smoke.mjs
```

Kabul: `--gate` PASS; `grep -c Legacy app.js` = 0; driver `--dump bugun` ve `--dump ayarlar`
önce/sonra bayt-eşit; `App.x=function` 554.

## 4. Bilinen tuzaklar

- `tests/reminders/test_reminder_ui_boundary.js:146` regex: `function reminderCenterOverlayHTML(){…SEYMA_REMINDERS.reminderCenterOverlayHTML` — shim bu formda kalsın.
- K8 kaynak-metin assert'leri app.js'te **kalmalı**: `scheduleMoveSync(){ var payload=reminderSyncPayload(data);`,
  `reminderNotificationChannel({tag:opts.tag||'aeon-message'})`, `window.ReminderEngineV1`,
  `App.reminderCrossSurfaceStatus=reminderCrossSurfaceStatus`. `sey-reminder-inbox-live`
  (`test_reminder_integrated_ux.js:317`) taşınırsa assert'i birleşik kaynağa al.
- `test_reminder_app_acceptance.js` RUNTIME_MODULES saflık taraması: `reminders.js` kaynağında
  literal `document.`, `setTimeout(`, `setInterval(`, `navigator.`, `Notification(` **olamaz**.
- `ReminderDeliveryV1` yokken çalışan adaptör davranışı (`withModule:false`) modülde aynen korunur.
- Fixture'lar `reminders.js`'i zaten yüklüyor (MON2-01 K6); yeni yükleme listesi işi yok.
- `.claude/skills/*` yazımı sandbox'ta reddedilebilir → Edit aracı; bu kartta gerek yok.
- Premium fixture'lar saati 12:00'a sabitler (seq 2); quiet-time hatası görürsen kod değil saattir.
- Sapma olursa kartı bloke etme: bütçeyi ölçülen değere çek, LEDGER'a yaz.
