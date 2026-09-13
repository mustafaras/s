# MON-54 — Boot, App expose ve late-boot sahiplik manifesti

**Kart:** MON-54 · **Durum:** tamamlandı · **Tarih:** 2026-09-13
**Kapsam:** yalnız `SeymaAppSurface` boot/start/auth/initial-render callback
gövdeleri ve app.js kayıt kabuğu. Yerel-only; release onayı yoktur.

## Karar ve sınır

`app/core/appSurface.js` load-safe boot registry’si callback gövdelerini
taşır. `app.js` canlı dependency bag’ini, `window.App=App` expose noktasını,
post-expose App atamalarını, `data` rebindlerini ve final `initialRender()`
çağrı noktasını sahip olarak korur. Registry yüklenirken DOM, timer,
listener, storage, fetch, sync veya network çağrısı yapılmaz; eksik ve ikinci
boot kaydı fail-closed reddedilir.

Değişmeyen sınırlar: App obje expose biçimi, B1 getterler, dokuz app.js data
assignment source-line’ı, sync callbackleri, `render()` sözleşmesi, browser
listener türleri, timer süreleri, network/retry davranışı ve üretim data repo.

## Post-expose App envanteri

Canlı `window.App=App` sonrasındaki **51** function assignment adı aynen
korundu. Sıra ve imza değişmedi; yalnız auth üçlüsü appSurface callback
registry’sine signature-preserving shim olarak bağlandı.

| Grup | App atamaları |
|---|---|
| ÆON/media (22) | `aeonToggleVoice`, `aeonOpenImage`, `aeonOpenFile`, `copyAeonText`, `shareAeonText`, `requestAeonPermissionFromBanner`, `dismissAeonNotifyBanner`, `aeonMicTap`, `aeonRecCancel`, `aeonRecStop`, `aeonPickPhoto`, `aeonPhotoChosen`, `aeonPickFile`, `aeonFileChosen`, `aeonPickAudioFile`, `aeonAudioFileChosen`, `onLunaDraft`, `onAeonDraft`, `askLuna`, `askAeon`, `onAeonKeydown`, `aeonScrollToBottom` |
| Mesaj/notification (13) | `showAeonHistory`, `toggleAeonSearch`, `clearAeonSearch`, `filterAeonSearch`, `toggleMsg`, `toggleAeonBubble`, `aeonOpenAttachSheet`, `aeonCloseAttachSheet`, `aeonSheetPick`, `openMesaj`, `dismissPopup`, `closeAeonPop`, `deleteNotif` |
| Magnesium (13) | `takeMagnesium`, `skipMagnesium`, `snoozeMg`, `editMagnesium`, `deleteMgEntry`, `setMgForm`, `setMgMg`, `setMgTime`, `saveMgNote`, `saveMgFeedback`, `setMgMode`, `setMgKidney`, `setMgTolerated` |
| Auth late-boot (3) | `submitAuth`, `toggleRememberAuth`, `dismissAuthError` |

`App.start` expose öncesi tanımlı aynı adlı shim olarak kaldı; `window.App`
expose sırası korunarak post-expose auth atamalarından önceki ve sonraki
konumlar değişmedi.

## Boot parity tablosu

| Akış | Korunan sıra |
|---|---|
| Seeded `App.start` | `ui.forceStart=false` → `ui.tab='bugun'` → `render()` → `reminderSchedulerDispatch('boot')` |
| Onboarding `App.start` | app-owned `ensureStartData()`/`data=migrate(...)` → motivation root → `commit('Hadi başlayalım')` → reminder boot → tek-sefer voice stamp/voice → `save(false)` |
| Auth late-boot | boş auth için error + `render`; başarılı auth için app-owned data rebind → auth state → `save()` → `render()` → `toast()` |
| Final initial render | `render()` → `SeyTouch.install(root)` → reminder boot → `save(false)` → 2200 ms greeting → 900 ms answer popup → splash launch/reduced-motion guard → önceki gün lookup/note → 900 ms hideSplash |
| Final tail | `initialRender()` tamamlandıktan sonra service-worker `message` listenerı aynı yerde kalır |

Onboarding ve seeded yolları `tests/app/test_app_surface_boot_boundary.js`
sentetik VM’inde ayrı ayrı karşılaştırıldı. `window.App` expose sonrası
handlerların kaybolmadığı ve `data` assignment callbacklerinin registry dışı
app.js’te kaldığı aynı fixture’da doğrulandı.

## Kaynak, cache-bust ve FILES etkisi

| Ölçüm | MON-53 current | MON-54 current | Sonuç |
|---|---:|---:|---|
| `app.js` logical lines / bytes | 13,190 / 1,120,785 | 13,149 / 1,118,428 | callback gövdeleri + shim delta |
| `app/core/appSurface.js` logical lines / bytes | 359 / 23,916 | 460 / 29,078 | boot registry eklendi |
| `window.App=App` satırı | 11,566 | 11,577 | expose noktası mevcut ve tek |
| App function / all assignment / unique | 556 / 721 / 718 | 556 / 721 / 718 | eşit |
| Post-expose function assignment | 51 | 51 | eşit |
| Birleşik fixture `onclick=` | 391 | 391 | eşit |
| canonical data assignment | 9 source lines / 11 tokens | 9 / 11 | eşit |
| Mantıksal timer registration | 10 interval / 42 timeout | 10 / 42 | sıra ve süre eşit |
| Listener / removal | 24 / 3 | 24 / 3 | tür ve sıra eşit |

`index.html` yalnız değişen iki kaynak için `20260913a → 20260913b` oldu:
`app/core/appSurface.js?v=20260913b` ve `app.js?v=20260913b`. Yeni core dosyası
eklenmedi; production `index.html`, `driver.mjs`, `zikr-harness.mjs` ve
`test_state_rebind_boundary.js` FILES/load-order üyeleri değişmedi.

## Kanıt

- `node tests/app/test_app_surface_boot_boundary.js`: **21/21**.
- Driver onboarding + seeded + interaction: **PASS**; zikr harness: **95/95**.
- `tests/app/test_state_rebind_boundary.js`: **37/37**; B1/B2/B3:
  **0 / 67 / 20**; modularization: **101/101**.
- ÆON message expansion: **24/24**; Faz10 sync: **69/69**.
- `tests/app/test_*.js`: tüm **52** fixture exit 0; current panel **23**,
  Panel-v2 **27**, Quran **9** ve reminder smoke exit 0.
- `node --check app.js`, `sync.js`, `app/core/appSurface.js` ve
  `git diff --check`: PASS.

Tüm kanıt sentetik/headless ve yereldir. Browser profili, gerçek localStorage,
token, network, `mustafaras/seyma-data`, push, deploy, tag, merge veya cihaz
kabulü yapılmadı. Sıradaki MON-55 yeni açık kullanıcı yönü olmadan başlamaz.
