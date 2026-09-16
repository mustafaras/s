# MON-41 · Reminders UI merkezi

Tarih: 2026-09-11
Dal: `premium-fx-gorsel-yuzey` — LOCAL-ONLY
Öncül: MON-40 tamam; bu kart kullanıcı tarafından açıkça uygulandı.

## Karar ve sahiplik

`app/core/reminders.js` içindeki frozen `window.SeymaReminders` registry'sine
ayrı bir `registerReminderView` bag'i ve read-only view üyeleri eklendi:

- `reminderWindowLabel`, `reminderChannelLabel`;
- `reminderCategoryState`, `reminderCategoryChannelLabel`;
- `reminderCapacityModeLabel`, `reminderCenterClone`,
  `reminderCenterEnabledCount`;
- `reminderCardHTML`, `reminderCenterOverlayHTML`.

View registry yalnız çağrı-anı resolver'ları, `ReminderCatalogV1` üzerinden
gelen definitions/copy ve mevcut app API/section shims'lerini tüketir. Frozen
Catalog metni kopyalanmadı. Card içindeki `App.previewReminderSafe` ve
`App.setReminderEnabled` inline çağrıları yalnız mevcut app-owned handler
shimleridir; handler gövdeleri app.js'te kaldı.

App.js sahipliği bilinçli olarak korunur:

- `App.openReminderCenter`, `closeReminderCenter`, `onReminderKeydown` ve
  ortak modal focus sözleşmesi;
- permission snapshot/request ve native permission yüzeyi;
- preference, draft, delivery/action journal, local storage, sync/schema ve
  tüm mutation/save/render/DOM işlemleri;
- Reminder Center'ın permission, policy, medication, history, retention ve
  personalization alt-section'ları; registry bunları mevcut read-only section
  API'lerinden alır.

Registry yüklemede ve view renderında DOM, storage, timer, network, navigator,
Notification veya native permission çağrısı açmaz. `releaseApproval` ve
frozen reminder×4 değişmedi; `docs/reminders/APP-REMINDER-STATE.json` hâlâ
`closure_pending_approval`, `releaseApproval.status=not_approved`.

## Parity / modal / dump kanıtı

- `tests/reminders/test_reminder_ui_boundary.js`: view dependency bag fail
  closed, one-time registration, Catalog/API consumption, state/ui read-only,
  Catalog private-copy non-copy, no-impure-API ve dialog/focus contract PASS.
- `tests/reminders/test_reminder_app_acceptance.js`: module ↔ inline fallback
  Reminder Center parity ve mevcut **554 assertion** PASS.
- `node .claude/skills/run-seyma/driver.mjs --dump reminder`: PASS;
  Reminder Center dumpu **96,260 JS karakter / 97,421 UTF-8 byte**,
  SHA-256 `7ecc3b6903af8497d5d2fa9b822b11c6ef0b7192b69d1dbc74312e4875e9ef66`.
  Dumpta `role="dialog"`, `aria-modal="true"`, iki `tabindex="-1"`,
  `App.onReminderKeydown(event)` ve `App.closeReminderCenter()` vardır.
- `node tests/app/test_modal_focus_containment.js`: ortak Tab/Shift+Tab/Escape
  focus sözleşmesi PASS; browser/device acceptance yapılmadı.

## Load-order / cache-bust / FILES

Üretim sırası değişmedi:
`reminderCatalog → reminderEngine → reminderScheduler → reminderDelivery → reminders → app.js`.
View değişikliği için yalnız `index.html` cache-bust değeri
`app/core/reminders.js?v=20260911b` oldu. `driver.mjs`, `zikr-harness.mjs` ve
`test_state_rebind_boundary.js` içinde reminders FILES üyeliği zaten vardı ve
aynı sırada kaldı; yeni FILES üyesi eklenmedi.

## Değişmezlik ve kapsam

- Frozen reminder catalog/engine/scheduler/delivery kaynakları değişmedi;
  current SHA'lar MON-40 ile aynı.
- `profileAssessmentV1`, `sync.js`, panel kaynakları, reminder schema,
  production data ve native/release action değişmedi.
- App/onclick/FX manifesti: **556 / 721 / 718**, direct onclick **153**,
  canonical data **9 satır / 11 token**, FX
  `SeyAudio/SeyHaptics/SeyFx/SeyTimeTheme` **78 / 63 / 58 / 6**; bu kartın
  view shimleri bu yüzeylerde delta üretmedi.
- `git diff --check`: PASS; yalnız MON-41 kaynakları, test, dump yolu,
  deliverable ve anti-amnesia zinciri kapsamındadır.

## Kapı durumu

Commit öncesi ve commit sonrası aynı critical/full regression zinciri yeniden
çalıştırıldı: syntax, driver (+ reminder dump), zikr, reminder UI boundary,
reminder acceptance/smoke/privacy, modal focus, profile/settings, state/rebind,
Faz10, panel P3/P4, Quran, Premium ve tüm app/panel/panel-v2 aileleri PASS.
Browser/device, native permission, remote, push/merge/tag/deploy ve
`mustafaras/seyma-data` yazımı yapılmadı.
