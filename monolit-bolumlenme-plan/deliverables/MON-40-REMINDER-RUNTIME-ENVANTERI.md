# MON-40 · Reminders runtime bağlantıları

Tarih: 2026-09-11
Dal: `premium-fx-gorsel-yuzey` — LOCAL-ONLY
Öncül: MON-39 tamamlandı; bu kart kullanıcı tarafından açıkça uygulamaya alındı.

## Karar ve sahiplik

`app/core/reminders.js` içinde load-safe `window.SeymaReminders` registry'si
oluşturuldu. Registry 16 salt-okur/saf üyeyi expose eder:

`registerReminders`, `reminderDefinitions`, `reminderCopy`,
`reminderPolicyTimeMinutes`, `reminderQuietHoursState`,
`reminderPolicySelectedCategories`, `reminderPolicyRecentCategoryAge`,
`reminderPolicyRecentCategoryCooldown`, `reminderPolicyPriority`,
`reminderPolicyMode`, `reminderPolicyInputParts`, `reminderPolicyEvaluate`,
`reminderPolicySelectNativeCandidates`, `reminderEngineLocalParts`,
`reminderEngineGenerateOccurrence`, `reminderSchedulerCreate`.

App kabuğu registry'ye yalnız çağrı-anı resolver bag'i bağlar:
frozen `ReminderCatalogV1`, `ReminderEngineV1`, `ReminderSchedulerV1`,
policy enum/default map'leri ve saf validation helper'ları. Frozen dört reminder
modülü kopyalanmadı ve değiştirilmedi; registry bunları yalnız lazy read/adaptör
olarak tüketir. Catalog listesi/copy erişimi content'i mutate etmez.

App.js'te bilinçli olarak kalan sahiplik:

- reminder data root, migrate/normalize/default/schema ve data/ui rebind;
- lifecycle candidate üretimi, DOM/render ve App.* imza/onclick yüzeyi;
- permission/request, native delivery, delivery/action journal ve local-only
  storage;
- sync sanitize/merge, event projection, notification payload ve release yolu;
- inline occurrence fallback ve app clock boundary; frozen engine yoksa
  fail-safe fallback korunur.

Yeni modül yüklemede DOM, `localStorage`, network, timer, `Notification`,
`navigator` veya sync çağrısı açmaz. Modül satır/byte/hash: **226 / 17,358 /
d2e0eee81f919bd7f269ae797ddfe57fb0b41da9fc37dec065cecd3669ac65b3**.

## Load-order, cache-bust ve fixture zinciri

Üretim sırası `reminderCatalog.js → reminderEngine.js →
reminderScheduler.js → reminderDelivery.js → reminders.js → inline service
worker → app.js` olarak korunur. `index.html` yeni dosyayı
`app/core/reminders.js?v=20260911a` ile yükler. Aynı üyelik/sıra şu üç
production-order FILES zincirine eklendi:

- `.claude/skills/run-seyma/driver.mjs`;
- `.claude/skills/run-seyma/zikr-harness.mjs`;
- `tests/app/test_state_rebind_boundary.js`.

`tests/reminders/test_reminder_app_acceptance.js`, `SeymaReminders`'ı frozen
registry ailesinin canlı üyesi olarak yükler; module↔inline fallback parity'si
policy, catalog, occurrence, scheduler ve Reminder Center HTML düzeyinde
kanıtlanır. Migration fixture'ı runtime modülü yüklemez; B2'nin yalnız migrate/
storage-safe sınırı bilinçli olarak ayrı kalır.

## Değişmezlik ve parity manifesti

MON-39 HEAD ile karşılaştırmada App/FX yüzeyi delta'sı sıfırdır:

| Ölçüm | HEAD | Current | Delta |
|---|---:|---:|---:|
| `App.<name> = function` | 556 | 556 | 0 |
| tüm `App.<name> =` | 721 | 721 | 0 |
| unique App assignment name | 718 | 718 | 0 |
| direct `onclick=...App.` (`app.js`) | 153 | 153 | 0 |
| canonical `data=` inventory | 9 satır / 11 token | 9 / 11 | 0 |
| `SeyAudio` / `SeyHaptics` / `SeyFx` / `SeyTimeTheme` | 78 / 63 / 58 / 6 | 78 / 63 / 58 / 6 | 0 |

Frozen dört modül bu kartta değişmedi. Current SHA-256 değerleri:

```text
app/core/reminderCatalog.js   c2824a71e0b1b8c66b3264f4d5df35ae83f10be03912256d6b41b436480e33a7
app/core/reminderEngine.js    3394b1f232e22c0b57146318dec88073865740581170a5b11194692a0261476f
app/core/reminderScheduler.js 9ea37cec47f32ae0046481b6916362b5567fa652939d80e0d0a774854f3
app/core/reminderDelivery.js  cbadb17f1c10c3cad27a0998e46eb874a60709b8a8328cfc9b5b2de7602d5d53
```

`app/content/profileAssessmentV1.js`, `sync.js`, panel sources, reminder
schema, notification permission/delivery ve release state değişmedi.
`docs/reminders/APP-REMINDER-STATE.json` canlı durumu korunmuştur:
`releaseApproval.status = not_approved`, `activePrompt = null`.

## Kanıt paketi

Exit 0 / PASS kanıtları:

- 28 JavaScript source syntax checks: `app/core/*`, `app.js`, `sync.js`;
- `driver.mjs`, `driver.mjs --dump ayarlar` ve `zikr-harness.mjs` **95/95**;
  ayarlar dump **46,190 UTF-8 byte**, SHA-256
  `c9b61ca64b4905eac1df833af5e125f7e9898a7a123ab6df21c479af84704eb4`;
- reminder acceptance **554 assertions**, privacy/notification/sync/panel
  redaction aileleri ve `run-reminder-smoke.mjs`: **20/20 curated fixtures**;
- app + current panel envanteri: **67/67** fixture exit 0;
- Panel-v2: **27/27**; Quran: **9/9**; Premium: **9/9**;
- settings boundary locator repair sonrası **13/13**, profile boundary PASS,
  modularization **99/99**, B1 **0 failure**, B2 **67/67**, B3 **20/20**,
  Faz10 sync **69/69**, panel P3 **35/35**, P4 **28/28**;
- `node docs/reminders/verify-reminder-freeze.mjs`: frozen REM-00..72,
  `release=not_approved`.

MON-37 settings boundary fixture'ındaki `HEAD^` baseline locatorı, sonraki
MON commitleri araya girdiğinde yanlış shim'li app.js'i seçiyordu. Production'a
dokunmadan fixture, `app/core/settings.js`'i ilk ekleyen commit'in gerçek
parent'ını çözerek tarihsel baseline'a bağlandı; sonuç **13/13** oldu.

## Sınırlar

Bu kanıt Node/VM headless ve sentetik state kanıtıdır. Browser/device acceptance,
native permission, live account, remote read/write, push, merge, tag, deploy ve
`mustafaras/seyma-data` yazımı yapılmadı. Halt yok; privacy/consent farkı,
eager side effect, frozen registry mutasyonu, orphan veya çift sahiplik
bulunmadı. Sonraki güvenli kart MON-41'dir; bu commit MON-40 dışına ilerlemez.
