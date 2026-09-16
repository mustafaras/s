# MON2 · Dalga 1 Kapanışı (Reminder) — MON2-DALGA1-KAPANIS.md

**Tarih:** 2026-09-14 · **Kart:** MON2-04 (kapanış; kod taşınmadı, runtime delta yok)
**Dal:** `premium-fx-gorsel-yuzey` · LOCAL-ONLY (push/merge/tag/deploy ayrı kapı)
**Kanıt zinciri:** LEDGER seq 1–5 · `MON2-STATE.json` measurements.MON2-01..04 · bu belge

## 1. Önce / sonra envanteri

Ölçümler `node tools/shell-inventory.mjs` (dalga 1 öncesi = MON planı kapanış
baseline'ı 13.139; sonra = MON2-03 sonrası ölçüm, MON2-04 kod değiştirmez).

| Ölçüm | Baseline (MON kapanışı) | Dalga 1 sonrası | Δ |
|---|---:|---:|---:|
| `app.js` toplam satır | 13.139 | 9.771 | −3.368 |
| kod satırı | 11.839 | 8.532 | −3.307 |
| sütun-0 fonksiyon | 1.867 | 1.676 | −191 |
| shim (≤2 kod satırı) | 1.091 fn / 1.148 satır | 1.268 fn / 1.280 satır | +177 fn / +132 satır |
| küçük gövde (3–10) | 530 fn / 2.950 satır | 250 fn / 1.458 satır | −280 fn / −1.492 satır |
| büyük gövde (≥11) | 246 fn / 5.107 satır | 158 fn / 3.425 satır | −88 fn / −1.682 satır |
| `App.*` handler gövdesi | 554 fn / 2.430 satır | 554 fn / 2.145 satır | envanter sabit; gövde −285 satır |
| `*Legacy` çift gövde | 22 fn / 208 satır | 0 / 0 | −22 fn / −208 satır |
| `*HTML()` builder (>2 satır) | 60 fn / 1.129 satır | 43 fn / 928 satır | −17 fn / −201 satır |
| Reminder ayak izi (fn/kod) | 529 fn / 3.247 satır | 355 fn / 408 satır | −174 fn / −2.839 satır |
| Reminder sabit blok/satır | 120 / 288 | 121 / 289 | sabitler modüle taşındı, raw adlar korundu |

Bütçe kapısı: `--gate` PASS — 9.771 / 0 / 408 / 928 ≤ MON2-04 bütçesi
10.300 / 0 / 450 / 950. Sıradaki aktif bütçe (MON2-05): 9.400 / 0 / 450 / 150.

## 2. Taşınan kod

| Kart | Hedef modül | Taşınan | Modül boyutu |
|---|---|---|---:|
| MON2-02 | `app/core/reminders.js` | REMINDER_* sabit blokları + saf/B1 gövdeler + görünüm üreticileri (registry +171 üye; deps bag 33→51 getter) | 360 → 4.189 satır |
| MON2-03 | `app/core/reminderSurface.js` | 35 yan etkili fn + 51 `App.*reminder*` handler gövdesi (MON-50 appSurface deseni, `with(SCOPE)` idiomu, 123-dep bag) | 1.004 satır (yeni) |

App.js'te kalan: 35 fn 1-liner shim (bunlardan `appendReminderEvent` +
`persistReminderEvent` REM-67 event-adapter dilim sözleşmesi gereği **tam
gövde** @1286), 51 handler 1-liner shim, `migrateReminderState` + boot
sabitleri (I1–I6 migrate/rebind sahipliği), `ui.reminderPreviewLegacyId`
(MON2-02 sapma notu 5 — korunur).

**Yeni dosya sayısı:** 1 (`reminderSurface.js`) — K5 hedefi tuttu.
**Yükleme listeleri (MON-25 dört liste):** `index.html` (L97,
reminders.js→reminderSurface.js sırası), `driver.mjs` FILES, `zikr-harness.mjs`
FILES, `test_state_rebind_boundary.js` boot listesi — dördü de MON2-01'de
aynı commit'te tamamlandı.

## 3. Silinen `*Legacy` listesi (MON2-02, 22 fn / 208 satır)

`reminderCapacityModeLabelLegacy`, `reminderCardHTMLLegacy`,
`reminderCategoryChannelLabelLegacy`, `reminderCategoryStateLegacy`,
`reminderCenterCloneLegacy`, `reminderCenterEnabledCountLegacy`,
`reminderCenterOverlayHTMLLegacy`, `reminderChannelLabelLegacy`,
`reminderCopyLegacy`, `reminderDefinitionsLegacy`,
`reminderPolicyEvaluateLegacy`, `reminderPolicyInputPartsLegacy`,
`reminderPolicyModeLegacy`, `reminderPolicyPriorityLegacy`,
`reminderPolicyRecentCategoryAgeLegacy`,
`reminderPolicyRecentCategoryCooldownLegacy`,
`reminderPolicySelectNativeCandidatesLegacy`,
`reminderPolicySelectedCategoriesLegacy`, `reminderPolicyTimeMinutesLegacy`,
`reminderPreviewSafeCopyLegacy`, `reminderQuietHoursStateLegacy`,
`reminderWindowLabelLegacy`

Not: `ui.reminderPreviewLegacyId` bir ui durum alanı adıdır, çift gövde
değildir; korunmuştur.

## 4. Fixture değişiklik listesi

| Commit | Fixture | Değişiklik |
|---|---|---|
| 796dd0f (MON2-01) | `test_state_rebind_boundary` | boot listesine `reminderSurface.js` |
| 796dd0f | `test_app_surface_{boot,domain,lifecycle,overlay}_boundary` | `app.js?v=` pin 20260914b |
| 796dd0f | `test_reminder_boot` | SeymaReminderSurface boot assertion (+4) |
| 796dd0f | `test_reminder_app_acceptance` | `APP_SHELL_REGISTRIES` modules sözleşmesi |
| 796dd0f | `test_reminder_app_privacy` / `notification_boundary` / `cross_surface_{schema,status}` / `integrated_{privacy,ux}` / `migration` / `concurrency` / `test_aeon_message_expand` / `test_zikr_manual_entry` / `test_modularization_boundary` | modül yükleme paritesi + birleşik kaynak |
| f58dfa7 (MON2-02) | `test_fx2_{overlay_motion,tab_transition,touch_coverage}` | combinedSource += reminders/reminderSurface (onclick 391 sabit) |
| f58dfa7 | `test_reminder_cross_surface_status` | extractFunction girinti+yorum duyarlı süslü tarama; birleşik kaynak sırası [reminders, reminderSurface, app] |
| f58dfa7 | `test_reminder_integrated_ux` | `sey-reminder-inbox-live` APP_REMINDER_SOURCE'a |
| f58dfa7 | `test_reminder_ui_boundary` | mutation regex sıkılaştırma (×3 yanlış pozitif) |
| f58dfa7 | `test_app_surface_*` (4) | pin 20260914c |
| 774ece9 (MON2-03) | `test_fx2_overlay_motion` | FX2-16.1 iki aşamalı kaynak araması (appSource gövdesi → modül `function App_x(){}`) |
| 774ece9 | `test_reminder_app_acceptance` | referenced kontrolü `APP_SOURCE + APP_SHELL_REGISTRIES` |
| 774ece9 | `test_reminder_app_notification_boundary` | channel-boundary surfaceSource'ta da kabul |
| 774ece9 | `test_app_surface_*` (4) | pin 20260914d |

## 5. Dalga 1 kapanış kapısı (MON2-04 koşusu, 2026-09-14)

- syntax: `app.js`, `sync.js`, `app/core/*.js` (tümü) — OK
- `node tools/shell-inventory.mjs --gate` — **PASS** (9.771/0/408/928 ≤ 10.300/0/450/950)
- reminder smoke — **20/20** (3597 assertion; `ui_boundary` çıktısız PASS)
- `test_app_surface_{boot,domain,lifecycle,overlay}_boundary` — 21/58/16/49
- `test_modal_focus_containment` — PASS · `test_aeon_message_expand` — 24/24
- driver + zikr-harness — PASS / 95/95 · verify-state B1/B2/B3 — PASS/67/20
- tests/app: modülerleştirme 102+27+59+31+37, premium 8/8, fx2 6/6
- tests/panel 23/23 · tests/panel-v2 27/27 · tests/quran 9/9 · `test_faz10_sync` 69/69
- App.x = 554 · onclick (kombine 14 dosya) = 391 · `withModule:false` PASS

## 6. Dalga 2'ye devir

Sıradaki kart **MON2-05 · `*HTML()` builder'ları → `render.js`** (bütçe
9.400 / 0 / 450 / 150; builder gövdesi 928 → ≤150 kod satırı). Devir briefi:
[`DEVIR-MON2-05.md`](../DEVIR-MON2-05.md). Kırmızı çizgiler değişmedi:
I1–I6, `data=` 9 rebind, B1 getter, `App.x=` envanteri, LOCAL-ONLY.