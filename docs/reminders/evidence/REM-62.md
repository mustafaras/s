# REM-62 — Panel daily detail, event timeline ve reminder lifecycle

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-62
- **Tarih:** 2026-08-19
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `4af0cfed8ea9d05d8437387088dcc8e3fc457e35` (main, REM-61 closure'ından sonra)
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none` (standing `after_each_prompt` teslimatı ayrı kayıttır)

## Kapsam

- **Allowlist:** `panel.js` event projection / labels, `panelCoverageManifest.js`
  event coverage, `tests/reminders/test_reminder_panel_timeline.js` (yeni G13-H gate),
  existing event-log fixtures (regression)
- **Panel dosyası:** `panel.js` (reminder lifecycle event mapping),
  `panel.html` (yalnız `panel.js?v=` cache-bust bump)
- **Closure records:** `docs/reminders/evidence/REM-62.md`,
  `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`,
  `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`
- **App runtime dosyası değişikliği:** `no`
- **Panel-v2:** ayrı regression olarak koşuldu, değiştirilmedi
- **`mustafaras/seyma-data`:** yazılmadı

## Karar / Kapsam notu

REM-62, reminder lifecycle event'lerinin (scheduled / delivered / opened /
snoozed / muted / suppressed / error) current panel event timeline'ında **güvenli
summary** olarak gözlemlenmesini sağlar. Bu bir reminder aggregate veya dashboard
kartı değildir — REM-ADR-021/024 no-op kararını korur. Timeline, app'in
`reminder-v1:<action>:<digest>` correlation prefix sözleşmesini (app.js
`reminderEventCorrelation`) SADECE gözlemler ve yalnız metadata summary üretir.
Panel, reminder local-only kök path literal'ini kaynakta İÇERMEZ
(`isReminderEventP` reminder event'ini yalnız `reminder-v1:` correlation önekiyle
tanır); böylece REM-26/56/57 panel no-op kaynak sınırı ihlal edilmez.

## Görev 1 — Reminder lifecycle event'lerini safe summary'ye eşleme

Panel.js'de yeni saf helpers:
- `isReminderEventP(e)` — event'i yalnız `reminder-v1:` correlation önekiyle
  tanır; path/root literal'i yok (no-op kaynak sınırı korunur).
- `reminderEventActionP(e)` — correlation segmentinden action'ı çıkarır
  (scheduled/delivered/opened/snoozed/muted/suppressed/error/enable/disable);
  bilinmeyen reminder event'i `lifecycle`e fail-closed düşer.
- `reminderEventLabelP(e)` — Türkçe güvenli lifecycle label üretir.
- `REMINDER_EVENT_LABELS` — sabit action → label sözlüğü.
- `eventChangeDescriptorP` — reminder event'i için `Reminder <label>` başlığı
  üretir (ör. "Reminder Gösterildi").
- `eventClassificationP` / `eventFeatureForP` — reminder event'ini ayrı
  `reminder` sınıfına / `bell` feature ikonuna yönlendirir.
- `eventCategoryDefsP` / `setEventFilterP` — timeline'a `reminder` filtresini
  ekler.

## Görev 2 — Event ID / sequence / source / revision / occurredAt / feature metadata ayrı

Event metadata (`eventId`, `sequence`, `source`, `sourceDeviceId`,
`snapshotRevision`, `occurredAt`, `correlationId`) satır metadata attribute'ları
ve `data-reminder-action` ile taşınır; private body (reminder title, schedule,
occurrence, therapy, medication, prayer completion, user note) asla render
edilmez. `safeEventSummaryP` sabit `Bildirim yaşam döngüsü güncellendi` (veya
`Güvenli kayıt özeti`) ile fail-closed kalır; occurrence kimliği digest'i üzerinden
kişisel içerik üretilmez.

## Görev 3 — Duplicate / out-of-order / gap / future / stale / missing görünür-ama-sakin

- `eventDateStateP` her satır için `future` / `stale` / `normal` durumunu
  görünür-ama-sakin `data-date-state` notu olarak render eder.
- Kart üstü sıra alarmı (`audit.ok` false ise) duplicate/gap/out-of-order
  sinyallerini toplu ve sakin gösterir (`role="alert"`, sürekli panel action
  tetiklemez).
- Missing durumu mevcut boş durum sözleşmesiyle ("Henüz güvenli event kaydı
  yok") fail-closed gösterilir.
- Yeni G13-H fixture'ı bu durumları deterministik doğrular.

## Görev 4 — Panel filter, event limit, selected date ve drawer focus korunur

- Timeline `reminder` filteri eklenir; mevcut `all`/`attention`/`sync`/
  `therapy-profile`/`quran-video`/`communication`/`user`/`derived`/`external`
  davranışı korunur.
- `setEventLimitP` (5/20/50/100) ve `showMoreEventsP` beşer kayıt davranışı
  değişmez.
- Satır `data-category`, `data-source`, `data-feature`, `data-reminder-action`
  attribute'larıyla deterministic; existing event-log fixtures regression PASS.

## Görev 5 — Timeline reminder event'i app action veya remote write başlatmaz

- Yeni helpers ve `eventLogCardHTMLP` kaynak kodunda PUT/POST/PATCH/DELETE,
  `localStorage.setItem/removeItem`, `SeySync.schedule`, `putInbox`,
  `putTransportFileP` sentinelleri YOKTUR (G13-H negative).
- Timeline render çıktısında `onclick="App.`, `onclick="SeySync`,
  `data-event-action="write` gibi app/write handler'ı üretilmez.
- Panel gözlemcidir; reminder tercihi/oluşumu/teslim yazma authority'si değildir.

## Kabul

- Timeline append-only, redacted, sequence-audited ve UI filter'larıyla
  deterministic'tir.
- Reminder lifecycle event'leri safe summary'ye eşlenir; private body asla
  çıkmaz; panel reminder local-only kök path literalini içermez.
- Duplicate/out-of-order/gap/future/stale/missing states görünür-ama-sakin
  render edilir.
- Hiçbir app action veya remote write tetiklenmez.
- PANEL-03 timeline gap kapanır; REM-63 ready.

## Standing after_each_prompt teslimat makbuzu

- **Remote equality:** `4af0cfe..80a9094` fast-forward; local HEAD, `origin/main`
  ve `git ls-remote refs/heads/main` hepsi `80a9094`. Bu push REM-62 kapanışını
  (`b9f3189` kod, `80a9094` closure records) birlikte taşıdı.
- **Deployment:** workflow `32257707545` success (head `80a9094`); Pages deploy
  tüm adımlarda ✓.
- **Live HTTP receipt:** `https://mustafaras.github.io/s/index.html` ve
  `/panel.html` HTTP 200; `panel.js?v=20260819a` ve `panel.css?v=20260809c` HTTP
  200. `panel.html` cache-bust `panel.js?v=20260819a` olarak bumplandı (panel.js
  bu promptta değişti; panel.css değişmedi).
- **Cihaz kabulü (S5):** kullanıcı cihazı doğrulaması yapılmadı; `pending`.

## Notlar / discrepancy

- Panel.js, reminder event detection'da `data/reminders` path literalini İÇERMEZ
  (yalnız `reminder-v1:` correlation prefix). Bu, REM-56/57 no-op kaynak sınır
  ifadesini korur ve REM-62'nin eşleme sözleşmesi çelişmez.
- `panel.css` reminder timeline için yeni bir renk gerekmedi; `event-date-note`
  mevcut `small` muted stilleriyle sakin görünür.
- App runtime (`app.js`, `sync.js`, `sw.js`) bu promptta değişmedi; reminder
  event üretimi REM-47/53 sözleşmesiyle aynı kalır.
- Panel-v2 değişmedi; ayrı regression yüzeyi olarak koşuldu.
