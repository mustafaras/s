# MON-42 · Messaging chronology manifesti

Tarih: 2026-09-11
Dal: `premium-fx-gorsel-yuzey` — LOCAL-ONLY
Öncül: MON-41 tamam; kullanıcı bu kart için açık uygulama yönü verdi.

## Karar ve sahiplik

`app/core/messaging.js` içinde frozen `window.SeymaMessaging` registry'si
kuruldu. Registry tek seferlik `registerMessaging` dependency bag'i ile
bağlanır; eksik veya ikinci bag fail-closed reddedilir. Registry 21 read-only
üye taşır: Luna bubble/chat üreticileri, ÆON bubble/attachment/chat üreticileri,
markdown/clamp ve stable bubble identity yardımcıları ile `mesajHTML`.

Taşınan gövdeler şunlardır:

- `lunaBubbleOut`, `lunaBubbleIn`, `lunaChatHTML`;
- `messageTime`, `dayDivider`, `mdLite`, `bubbleDomId`, `bubbleExpanded`,
  `chatClampHTML`, `clampBubble`;
- `aeonBubbleText`, `aeonBubbleKey`, `aeonMediaSlotHTML`, `aeonItemHTML`,
  `aeonAttachSheetHTML`, `aeonChatHTML`, `mesajHTML`.

`app.js` aynı isim ve imzalarla signature-preserving shim olarak kaldı.
`chatBubbleApply`/`chatBubbleToggle`, `App.toggleMsg`,
`App.toggleAeonBubble`, send/search/scroll/open-close, upload/record/attachment
handlers, notification request/dedupe mutation ve save/render/DOM sahipliği
app.js'tedir. Registry yalnızca app-owned live resolverları kullanır. Chronology
watermark getter/setter'ları (`aeonLastSeenSort` ve rendered-date state'i)
app-owned closure sınırını görünür kılar; modül doğrudan `data` veya `ui`
üzerinde atama yapmaz.

## Semantik kanıt

- ÆON chronology, `data.aeon.qa` ile `notifList()` kaynaklarını aynı sort/tie/
  insertion sırasıyla birleştirir.
- Cevap notification'ı, `answerMsgId` üzerinden thread içinde ikinci kez
  gösterilmez; cevapsız ve sonraki notification'lar korunur.
- Bubble DOM kimliği `chatBubbleDomId` üzerinden sabittir; expanded durumu
  `ui.aeonExpanded` ile mevcut uygulama persistence yolundan okunur.
- Uzun mesaj clamp sınırı, "Tümünü göster/Daralt" etiketleri, 40-item history
  penceresi ve `App.aeonScrollToBottom()` markup'ı korunur.
- Attachment accept stringi registryye read-only resolver olarak bağlanır;
  file input, upload, microphone/recording ve gerçek media akışı app-owned
  kalır. Yeni notification, network/provider/token veya remote action eklenmedi.

`tests/app/test_aeon_message_expand.js` uzun mesaj identity, expansion
persistence, chronology ve notification dedupe için **24/24** PASS verdi;
`tests/app/test_messaging_boundary.js` cold-load, fail-closed registration,
read-only data/ui, long-message, attachment boundary ve forbidden side-effect
tarama kapısını PASS verdi.

## Dump / baseline parity

MON-42 öncesi ve sonrasında production-order:

```text
node .claude/skills/run-seyma/driver.mjs --dump mesaj
```

ile alınan `/tmp/seyma-dump.html` aynı kaldı:

- UTF-8 byte: **17,138**;
- SHA-256: `15df13b7138af356d7c5a4d9c80e0b5719eeb0e7d8b7d002bf1998c1b09394da`;
- `cmp` farkı: **0**.

Driver logundaki 17,039 değeri JavaScript string uzunluğudur; kanonik dosya
kanıtı UTF-8 byte ve SHA ile kaydedilmiştir.

## Load-order / cache-bust / FILES

Üretim ve sentetik sıra:

`reminderCatalog → reminderEngine → reminderScheduler → reminderDelivery → reminders → messaging → app.js`.

Yeni dosya aynı committe şu zincirlere eklendi:

- `index.html`: `app/core/messaging.js?v=20260911a`;
- `.claude/skills/run-seyma/driver.mjs`;
- `.claude/skills/run-seyma/zikr-harness.mjs`;
- `tests/app/test_state_rebind_boundary.js`;
- app/reminder ve FX fixture boot listeleri, yalnız gerçek production prefix
  paritesini koruyacak şekilde.

## Değişmezlik / manifest

Canonical combined source inventory:

- `App.<name>=function`: **556**;
- tüm `App.<name>=` atamaları: **721**;
- unique App yüzeyi: **718**;
- inline `onclick=`: **391**;
- Premium FX referansları `SeyAudio/SeyHaptics/SeyFx/SeyTimeTheme`:
  **78 / 63 / 58 / 6**;
- app.js data rebind: **9 source line / 11 token**.

Bu değerlerde MON-41 baseline'ına göre delta **0**'dır. Messaging modülü
282 satır / 30,108 byte'tır. `sync.js`, `profileAssessmentV1`, frozen
reminder×4, panel, schema ve production data değişmedi. Messaging kaynağında
`fetch`, `XMLHttpRequest`, `localStorage`, `navigator`, `Notification`,
`SeySync`, provider key, token, panel, reminder ve media API kullanımı yoktur;
privacy/consent ve attachment-flow farkı bulunmadı.

## Kapı paketi

Doküman/state değişikliklerinden sonra aşağıdaki kanıtların tamamı yeniden
alındı; browser/device, remote, push/merge/tag/deploy ve
`mustafaras/seyma-data` yazımı yoktur:

- syntax: `node --check app/core/messaging.js`, `node --check app.js`,
  `node --check sync.js` — PASS;
- `test_aeon_message_expand` — 24/24 PASS;
- `test_messaging_boundary` — PASS;
- `driver --dump mesaj` — PASS, dump parity yukarıdaki değerlerde;
- `test_modal_focus_containment` — PASS;
- `test_state_rebind_boundary` — 37/37 PASS;
- `test_faz10_sync` — 69/69 PASS;
- `zikr-harness` — 95/95 PASS;
- reminder smoke/acceptance/privacy, panel P3/P4, Quran, Premium ve tam
  app/panel/Panel-v2 regression — PASS.

## Kabul / açık sınır

Tek sahip messaging registry + app.js shim sınırıyla, doğru load order ve
cache-bust ile, hedef chronology/expand/scroll/attachment testleri PASS'tir;
I1–I6 ve M1–M4'te fark yoktur. Gerçek tarayıcı/device acceptance ve release
action bu kartın dışında ve ayrı gated'dir.
