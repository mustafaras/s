# MON-37 · Settings domain registry envanteri

Tarih: 2026-09-11
Dal: premium-fx-gorsel-yuzey — LOCAL-ONLY
Öncül: MON-36 tamamlandı; bu kart kullanıcı tarafından açıkça uygulamaya
alındı.

## Karar

ayarlarHTML ve settingsBtn read/render gövdeleri app/core/settings.js içindeki
window.SeymaSettings registry'sine taşındı. Registry 11 named read dependency
kullanır: state, view, theme, icon, esc, reminderCopy, daysTracked, countRec,
featuresLive, todayStr, syncConfigured.

state ve view canlı getter'lardır; registry dependency bag'inde doğrudan data
alanı yoktur. settings.js yükleme anında DOM, storage, network, sync ve state
mutation açmaz. Registry yalnız render/read helperları expose eder:
ayarlarHTML ve settingsBtn.

App kabuğunda aynen kalan sahiplik:

- settings schema, alanları ve varsayılanları;
- migrate, createDefaultData ve data/ui/dark rebind;
- App.setTheme, App.toggleHaptic, App.toggleSetting;
- voice/premium/ambient handlers;
- prayer/hijri mutation handlers (App.adjustHijriOffset dahil);
- save/render/DOM ve sync sanitize.

Parent HEAD ile 6 yasaklı gövde karşılaştırması byte-birebir geçti:
migrate, createDefaultData, App.setTheme, App.toggleHaptic,
App.toggleSetting, App.adjustHijriOffset.

## Load/cache zinciri

Üretim sırası profile.js → settings.js → mediaFx.js olarak güncellendi.
app/core/settings.js?v=20260911a index'e eklendi ve şu FILES zincirleri aynı
sıraya getirildi:

- driver.mjs;
- zikr-harness.mjs;
- test_state_rebind_boundary.js;
- verify-state-migration-boundary.mjs;
- app/reminder/FX boot fixture kaynak listeleri.

sync.js, panel/, app/content/profileAssessmentV1.js ve data schema
değişmedi.

## Parity ve kanıt

- test_settings_boundary.js: 13/13 — parent HTML ile üç sentetik
  theme/settings vector'ında byte parity ve state read-only.
- driver.mjs --dump ayarlar: BEFORE/AFTER 46,190 byte, SHA-256
  c9b61ca64b4905eac1df833af5e125f7e9898a7a123ab6df21c479af84704eb4,
  cmp=0.
- test_premium_settings.js: 39/39.
- test_premium_time_theme.js: 53/53.
- test_faz10_sync.js: 69/69.
- test_panel_p4_provenance.js: 28/28.
- migration: 67/67; zikr harness: 95/95; B3: 20/20.
- app fixture ailesi: 44/44; panel legacy, Panel-v2, Quran ve reminder
  smoke aileleri exit 0.
- settings/app/module syntax ve git diff --check: PASS.

Privacy/consent farkı yoktur; profile content, profile session/consent/progress
semantics, sync merge ve panel provenance değişmemiştir. Browser/device
acceptance, remote read/write, push/merge/tag/deploy ve
mustafaras/seyma-data yazımı yapılmamıştır.
