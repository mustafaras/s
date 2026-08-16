# REM-36 — Türkçe copy lexicon ve mahremiyet negatif dili evidence

Tarih: 2026-08-16  
Durum: tamamlandı; local source/test evidence hazır, S5 kullanıcı cihazı kabulü bekliyor.

## Kapsam

REM-36, reminder yüzeylerindeki sabit Türkçe metinleri `ReminderCatalogV1`
içindeki immutable copy lexicon altında topladı. Private/in-app detail,
native generic ve medication copy, empty/error/permission/stale/recovery,
snooze/mute ve action etiketleri aynı helper üzerinden okunuyor.

- `app/core/reminderCatalog.js`: frozen `copy` sözlüğü, private definition
  eşleşmeleri ve side-effect-free `getCopy()`.
- `app.js`: canonical helper kullanımı, generic native preview sınırı,
  permission/status/digest/inbox/center copy bağlantıları ve action labels.
- `styles.css`: uzun Türkçe metin için 460px yüzeyinde `min-width:0` ve
  `overflow-wrap:anywhere` layout guard’ları.
- `tests/reminders/test_reminder_copy.js`: lexicon completeness, immutable
  lookup, negative language, native leakage ve long-copy wrap assertions.
- Sync, panel, service worker, deployment ve live account surfaces değişmedi.

## Güvenlik ve copy sözleşmesi

- Native preview, occurrence veya input içindeki `nativeTitle` / `nativeBody`
  değerlerini kabul etmez; yalnız canonical generic copy üretir.
- Native delivery testleri therapy, medication, mood, prayer, journal body,
  private note, identity ve article fields içeren sentetik payload’larla
  tekrarlandı. Native metinler genel ve mahrem kalır.
- “Kaçırdın”, “başarısız”, “zorundasın”, “tedavi et”, “normal değilsin”,
  “ceza”, “borç”, “başaramadın”, “ihmal ettin” ve “yapmalısın” kalıpları
  lexicon ve Reminder Center HTML’sinde negatif testten geçirildi.
- Error, mute, stale ve recovery dili kullanıcıyı suçlamaz; yerel kayıt ve
  uygulama içi fallback sınırı açıkça belirtilir.
- Native yüzeyde terapi, ilaç, mood, ibadet completion, journal body, doz
  veya kullanıcı notu yoktur. Emoji tek başına anlam kaynağı değildir; test
  tüm lexicon leaf’lerinde metin ve native length sınırlarını denetler.

## Verification

| Katman | Komut | Sonuç |
|---|---|---|
| Copy / negative / native privacy / wrap | `node tests/reminders/test_reminder_copy.js` | PASS — 690 assertions |
| Reminder privacy | `node tests/reminders/test_reminder_privacy.js` | PASS — 35 assertions |
| Reminder accessibility | `node tests/reminders/test_reminder_accessibility.js` | PASS — 136 assertions |
| Catalog purity / immutability | `node tests/reminders/test_reminder_catalog.js` | PASS — 423 assertions |
| Native contract | `node tests/reminders/test_reminder_native.js` | PASS — 66 assertions |
| Center advanced regression | `node tests/reminders/test_reminder_center_advanced.js` | PASS — 48 assertions |
| Inbox regression | `node tests/reminders/test_reminder_inbox.js` | PASS — 40 assertions |
| Reminder regression | `for f in tests/reminders/test_reminder_*.js; do node "$f" || exit 1; done` | PASS — final full fixture loop |
| Syntax / whitespace | `node --check app.js`; `node --check app/core/reminderCatalog.js`; `git diff --check` | PASS |

Tüm doğrulamalar synthetic Node/vm, mock DOM, memory-only localStorage ve
network-disabled boundary ile yapıldı. Browser, local server, gerçek
Notification, sync push, deployment veya kullanıcı verisi write yapılmadı.

## Evidence seviyeleri ve sınırlar

- S0: AGENTS, roadmap, reminder context/state/ledger, UX planı §4 / §9 / §16
  ve REM-03 / REM-16 / REM-20 / REM-27 / REM-36 okundu.
- S1: kaynak allowlist, catalog purity, syntax, diff ve privacy boundaries.
- S2: copy 690, privacy 35, accessibility 136, catalog 423, native 66,
  center 48, inbox 40 ve final full reminder fixture loop PASS.
- S3: implementation commit `7517b91d0c9c425c66f1ed2a0638f83d90d798f2`.
- S4: remote equality / deploy çalıştırılmadı; push, merge, tag ve Pages yok.
- S5: kullanıcı cihazı kabulü pending; gerçek native/background davranışı
  doğrulanmadı.
- Release approval: `not_approved`.

Sonraki güvenli prompt: REM-37 — Premium visual, responsive ve performans QA.
