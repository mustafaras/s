# Devir — MON2-03'ten MON2-04'e

**Tarih:** 2026-09-14 · **Son commit:** bkz. `git log -1` (MON2-03 kapanışı) · **Dal:** `premium-fx-gorsel-yuzey` (LOCAL-ONLY)
**Durum:** MON2-03 tamam (3/8). Aktif kart **MON2-04** (Dalga 1 kapanışı). Çalışma ağacı temiz.

## 0. İlk 2 dakika

1. Oku (bu sırayla): `monolit-bolumlenme-plan-2/README.md` §3 (K1–K9) ve §5 **MON2-04 kartı**;
   `MON2-STATE.json`; `.anti-amnesia/CURRENT-STATE.md`; `.anti-amnesia/LEDGER.md` son satır (seq 4).
2. Ölç ve LEDGER'a "önce" olarak yapıştır: `node tools/shell-inventory.mjs`
   (beklenen: app.js 9.771 · Legacy 0 · reminder gövde 408 · HTML 928).
3. MON2-04 dalga kapanışı kartıdır: **kod taşınmaz** — doğrulama + dokümantasyon senkronu.

## 1. Kırmızı çizgiler

- Push/merge/tag/deploy/tarayıcı/gerçek token/gerçek veri/`mustafaras/seyma-data` **yok**.
- Dokunma: `app/core/reminderCatalog|Engine|Scheduler|Delivery.js`, `sync.js`, `sw.js`,
  `panel*`, `app/content/*`, `docs/reminders/*`, `premium-fx-plan/MODULARIZATION.md`.
- `App.x=function` sayısı **554 sabit** (`grep -cE '^App\.[A-Za-z0-9_]+\s*=\s*function' app.js`);
  inline onclick kombine kaynakta **391 sabit** (fx2 overlay/tab/touch fixture'ları).
- `data=` rebind, timer/listener **kaydı**, `scheduleMoveSync`, 9 mutable `reminder*`
  değişkeni (K3), `appendReminderEvent`+`persistReminderEvent` tam gövdeleri (REM-67
  event-adapter dilim sözleşmesi — `test_reminder_end_to_end_lineage`) ve
  `register*` bag'leri app.js'te kalır.
- Modal Tab/Shift+Tab/Escape sözleşmesi ve focus listesi davranışı değişmez.

## 2. MON2-03 kapanış anlık görüntüsü (doğrulanmış)

- `app.js` 9.771 satır (8.532 kod) · `reminderSurface.js` 1004 satır (35 fn + 51 handler + with(SCOPE) idiomu)
- Deps bag 123 üye (+`appendReminderEvent` getter) + 5 setter; `REMINDER_SURFACE_DEPENDENCIES` 123 ad
- with(SCOPE): sabit `Object.create(null)` + `installScopeProperties` (property-getter'lar AYNI objeye; register öncesi gövde fail-closed ReferenceError)
- Test sözleşme devirleri (K8): acceptance `referenced` shell registry'ler; notification_boundary channel-boundary surfaceSource'ta da; fx2_overlay FX2-16.1 modül `function App_x(){}` + guard'lı `window.SeyFx.sheetClose`
- Kapı: smoke **20/20** · `--gate` PASS (9.771/0/408/928) · driver+zikr 95/95 · verify-state B1/B2/B3 · tests/app **53/53** (fx2 6/6) · panel 23/23 · panel-v2 27/27 · quran 9/9 · sync 69/69
- Cache-bust: `reminderSurface.js?v=20260914d`, `app.js?v=20260914d` + 4 app_surface pin'i

## 3. MON2-04 iş sırası

1. §7 ortak kapı + `run-reminder-smoke` + `test_app_surface_*` + `test_modal_focus_containment`
   + `test_aeon_message_expand` + `node .claude/skills/run-seyma/driver.mjs` + `zikr-harness.mjs`
   + verify-state ×3 + `node tools/shell-inventory.mjs --gate` (10.300/0/450/950).
2. Dalga 1 özeti: LEDGER seq 5, CURRENT-STATE, STATE (`currentWave` kapanışı: Dalga 1
   `completed` — yalnız Dalga 1 prompt'ları tamamlandıysa).
3. `DEVIR-MON2-05.md` yaz (Dalga 2 · MON2-05 Görünüm dalına geçiş). Tek yerel commit. MON2-05'e geçme.