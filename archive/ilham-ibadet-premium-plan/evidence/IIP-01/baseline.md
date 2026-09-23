# IIP-01 baseline kaydı

## Kaynak ve çalışma ağacı

- CWD: `/Users/m_ras/Desktop/seyma`
- Branch: `main` (`origin/main` ile hizalı)
- Başlangıç HEAD: `e794e7bcc637b2431dcfae29f645ef1b02a2b51c`
- Başlangıç Git durumu: `?? ilham-ibadet-premium-plan/`
- Başlangıçta uygulama üretim/test dosyalarında dirty değişiklik yoktu; plan klasörü kullanıcı tarafından bu oturumdan önce oluşturulmuştu ve sahiplenilmedi.
- IIP-01 üretim allowlist'i ve test allowlist'i boş olduğundan kaynak koduna değişiklik yapılmadı.

## App yüzeyi ve çağrı grafiği pinleri

| Pin | Canlı kaynak |
|---|---|
| Dış giriş | `app/core/render.js:505-557` → `App.go(id,event)` (`app.js:3057`) → `render()` |
| İlham & İbadet üretimi | `App.go('saygi')` → `saygiHTML()` (`app/core/saygi.js:241`) → `faithNavHTML()` + `saygiPreviewHubHTML()` |
| İç sekme değişimi | `App.setFaithTab(tab)` (`app.js:3979`) → `ui.faithTab` → render |
| İman | `faithCornerCardHTML()` → `App.openFaithCorner()` (`app.js:4037`) → `faithCornerOverlayHTML()` |
| Öncü | `saygiPreviewCardHTML()` / collection → `App.openSaygiPreview()` / `App.openSaygiCollectionPerson()` |
| Zikir | `zikrPreviewCardHTML()` → `App.openZikr()` (`app.js:3917`) → `zikroverlayHTML()` |
| Kıble | `qiblaHubCardHTML()` → `App.openQibla()` (`app.js:6047`) → `qiblaOverlayHTML()` |
| Kur'an | `quranJourneyHubCardHTML()` → `App.openQuranJourney()` (`app.js:5949`) → `quranJourneyOverlayHTML()` |
| Reminder | `reminderInboxCardHTML()` → `App.reminderInbox*` → `openReminderTarget()` / `openReminderCenter()` |

## Shell / load-order ölçümü

`node tools/shell-inventory.mjs --gate` exit 0:

```text
toplam satır 7610
kod satırı 6589
yorum satırı 872
App.* handler gövdesi 554 / 1638
Legacy fonksiyon 0 / 0
HTML builder 4 / 57
reminder fonksiyon / kod satırı 355 / 408
shell-inventory --gate PASS (maxTotalLines=7800, maxLegacyFunctions=0, maxReminderFunctionCodeLines=450, maxHtmlBuilderCodeLines=150)
```

`index.html:101-138` canlı script listesi; content, core registry, render/appSurface, app.js ve sync.js sırası mevcut. `app/core/quran.js` ve `app/core/saygi.js` cache-bust ile `app.js` öncesinde; bunu `tests/app/test_saygi_boundary.js` ve `tests/app/test_quran_boundary.js` kontrol ediyor.

## Kanıt seviyesi

Bu baseline kaynak/sentetik seviyededir. Gerçek tarayıcı profili, gerçek localStorage, token, kişisel veri, dış ağ veya `seyma-data` yazımı kullanılmadı. Cihaz ve yayın kanıtı üretilmedi.
