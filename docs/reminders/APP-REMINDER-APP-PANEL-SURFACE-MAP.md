# APP-REMINDER-UX — App / Panel Surface Map

Bu belge, reminder planının gerçek repository yüzeylerine bağlandığı canonical
haritadır. Promptlar burada olmayan bir runtime veya panel katmanı varsayamaz.
Kod satırları zaman içinde kayabilir; fonksiyon / dosya adı authority’dir,
satır numarası yalnız bounded read ipucudur.

## 1. Uygulama runtime sahiplik haritası

| Yüzey | Mevcut owner | Reminder etkisi | Doğrulama sahibi |
|---|---|---|---|
| Boot / script order | `index.html`, `app/core/constants.js`, `app.js`, `sync.js` | Catalog / engine adapter doğru sırada yüklenmeli; cache-bust unutulmamalı | REM-44, REM-54 |
| Canonical state | `app.js:createDefaultData`, `migrate`, `data`, `ui` | Preference, occurrence ve local delivery ayrımı; eski save’ler korunmalı | REM-45 |
| Persistence | `app.js:save`, `commit`, `saveLocal`, `scheduleMoveSync` | Reminder action tek save / event semantiği üretmeli; raw body dışarı taşmamalı | REM-47, REM-53 |
| Render / navigation | `app.js:render`, `App.go`, overlay open/close handlers | Reminder Center, inbox, deep-link, focus ve draft korunmalı | REM-48, REM-52 |
| Existing social notifications | `data.notifications`, `showInboxPopup`, `showNativeAeonNotification`, `startAeonPermissionLoop` | ÆON sosyal akışı reminder budget / ID / permission ile karışmamalı | REM-50 |
| Foreground lifecycle | `pollRemote`, `onAppForeground`, `visibilitychange`, `focus`, `pageshow`, `online`, timers | Reminder scheduler yalnız yetkili lifecycle noktalarında, duplicate’siz çalışmalı | REM-46, REM-49 |
| Ritual surfaces | `App.openFaithCorner`, zikir handlers, Saygı / reading handlers | Deep-link hedefi gerçek mevcut surface olmalı; completion reminder kararına dönüşmemeli | REM-51 |
| Care / reflection surfaces | habit, sleep, water, caffeine, journal, therapy / crisis handlers | Kullanıcı tercihi olmadan sağlık / ruh hâli çıkarımı yapılmamalı | REM-51, REM-53 |
| Native / SW boundary | `canNotify`, permission loop, `showNativeAeonNotification`, `sw.js` | Generic private title, click target ve background capability sınırı korunmalı | REM-50, REM-54 |

## 2. ÆON panel sahiplik haritası

| Yüzey | Mevcut owner | Reminder etkisi | Doğrulama sahibi |
|---|---|---|---|
| Source selection | `panel.js:load`, `fetchLatest`, `loadObserverProjectionP`, `PanelCoverageV1.chooseProjection` | Projection / legacy fallback status’u dürüst olmalı | REM-55 |
| Coverage contract | `panelCoverageManifest.js:MANIFEST`, `coverageForData`, `redactedPaths` | Reminder alanları full / summary / redacted / unmapped olarak sınıflanmalı | REM-56 |
| Redaction | `panelCoverageManifest.js:redact`, `redactForObserver` | Therapy, medication, journal, mood, raw note, token ve GPS panel’e sızmamalı | REM-57, REM-64 |
| Transport | `panel.js:loadTransportFileP`, `loadSyncReceiptP`, event / Quran transport` | Reminder paneli gerçek data write açmamalı; conditional read davranışı korunmalı | REM-58, REM-63 |
| Partial fetch / stale | `PROJECTION.sections`, `sectionFetchState`, `projectionStatusP` | Yan kanal hatası önceki sağlıklı snapshot’ı yanlışlıkla silmemeli | REM-59 |
| Status / provenance | `syncRibbonHTMLP`, `coverageRibbonHTMLP`, `p3StatusP`, staleness helpers | Kaynak, tazelik, privacy ve receipt ayrı görünmeli | REM-60 |
| Dashboard cards | `coreModules`, `rootModulesCardHTMLP`, `p4ProvenanceCardHTMLP`, `d4ModuleAtlasHTMLP` | Reminder özeti yalnız redacted aggregate veya bilinçli no-op olabilir | REM-61 |
| Timeline / day detail | event log helpers, `eventLogCardHTMLP`, selected date / month surfaces | Reminder lifecycle event’i safe summary ile izlenebilir olmalı | REM-62 |
| Observer actions | `putInbox`, `putTransportFileP`, ÆON media / Quran actions | Reminder preference / delivery action panelden yazılamaz | REM-63 |
| Panel interaction safety | `panelDraftActiveP`, `panelSig`, `applyPollRenderP`, ETag / 304 | Poll draft, focus, drawer, filters ve expanded cards’ı bozmamalı | REM-58, REM-65 |
| Panel QA | root `tests/test_panel_*.js`, `tests/test_faz11_panel.js`, `tests/panel-v2/` | Current panel ve Panel-v2 ayrı regression yüzeyleridir | REM-66 |

## 3. Data lineage

```text
user action
  -> app data / local-only delivery journal
  -> app save / event log
  -> sync sanitize + receipt (mock in tests)
  -> observer projection / coverage manifest
  -> panel source selection + status
  -> redacted card / timeline / no-op
```

Bu zincirin bir halkası kanıtlanmadıysa “panelde çalışıyor”, “senkronlandı”
veya “canlıda düzeldi” denmez. Panel gözlemcidir; reminder preference,
occurrence, snooze, mute veya private detail için yazma authority’si değildir.

## 4. Hard boundaries

- `data/`, `mustafaras/seyma-data`, token, gerçek localStorage ve gerçek
  notification body test kapsamı dışındadır.
- ÆON social notification ile personal reminder aynı `data.notifications`,
  permission, budget veya dedupe alanını paylaşmaz.
- Panel-v2 (`tests/panel-v2/`) ile current observer panel (`panel.js` /
  `panel.html`) aynı uygulama değildir; ayrı fixture ve ayrı acceptance gerekir.
- Panelde reminder yansıtılmasına ihtiyaç yoksa no-op kararı geçerli ve
  tercih edilir; no-op da negative test ve karar receipt’i ister.
- Her app / panel promptu yalnız bu map’teki bir veya birkaç owner surface’i
  değiştirir; kapsam genişletme state / ledger / traceability güncellemesi
  olmadan yapılamaz.

## 5. Gap register

| Gap | Açıklama | Prompt hattı |
|---|---|---|
| APP-01 | Runtime boot, global namespace ve cache-bust reminder adapter’a bağlanmamış | REM-44, REM-54 |
| APP-02 | Reminder state / migration / local delivery gerçek app state’e bağlanmamış | REM-45, REM-53 |
| APP-03 | Render, navigation, overlay, draft ve focus sözleşmesi reminder için kanıtlanmamış | REM-48, REM-52 |
| APP-04 | Scheduler app lifecycle ve mevcut ÆON poll loop ile ayrıştırılmamış | REM-46, REM-49, REM-50 |
| APP-05 | Her reminder deep-link’i gerçek app surface handler’ına bağlanmamış | REM-51 |
| PANEL-01 | Projection manifest reminder alanları için explicit coverage kararı taşımıyor | REM-56, REM-57 |
| PANEL-02 | Panel transport / 304 / partial failure reminder status’uyla eşleştirilmemiş | REM-58, REM-59 |
| PANEL-03 | Reminder için dashboard card / timeline / no-op kararının acceptance’ı eksik | REM-61, REM-62 |
| PANEL-04 | Panel action boundary reminder write’larını explicit olarak engellemiyor | REM-63 |
| PANEL-05 | Current panel ve Panel-v2 QA scope’u reminder teslimine birlikte bağlanmamış | REM-65, REM-66 |
| INT-01 | App → sync → projection → panel lineage tek fixture’da uçtan uca kanıtlanmamış | REM-67–REM-69 |
| INT-02 | Cross-surface privacy, failure ve release evidence tek acceptance gate’inde birleşmemiş | REM-70–REM-72 |

Yeni promptlar bu gap register satırlarından en az birini kapatmadan `done`
olamaz. Bir gap’in kapsam dışı bırakılması decisions log’a yazılmalıdır.
