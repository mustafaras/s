# REM-02 — Synthetic test harness contract evidence

**Tarih:** 2026-08-13<br>
**Durum:** tamamlandı<br>
**Kapsam:** yalnız ağsız sentetik fixture contract’ı; production/runtime/data değişikliği yok.

## Oluşturulan sınır

REM-02 için şu dosyalar oluşturuldu veya yönlendirildi:

- `tests/reminders/helpers/reminder-test-helper.js`
- `tests/reminders/test_reminder_contract.js`
- `tests/reminders/test_reminder_timezones.js`
- `tests/reminders/README.md`
- `tests/README.md` reminder fixture yönlendirmesi

Helper contract’ı deterministic clock, `Europe/Istanbul` timezone, memory-only
localStorage, kayıt tutan ama native olmayan Notification mock’u ve her çağrıyı
`REMINDER_TEST_NETWORK_DISABLED` ile reddeden fetch mock’u sağlar. Fetch mock
URL, header, token veya body saklamaz; rapor yalnız `callCount` ve
`realNetworkOpened: false` döndürür.

Assertion helper hata mesajları sabit `REMINDER_ASSERTION_FAILED` kodudur.
Sentetik secret/raw-payload sentinel’ları hata veya test raporuna taşınmadı.

## Saf sınırlar

| Sınır | Girdi | Çıktı | Yan etki | Fixture kanıtı |
|---|---|---|---|---|
| Catalog | `ReminderDefinition[]` | `ReminderDefinition[]` | yok | caller isolation, unknown-field preservation |
| Policy | `ReminderPreference + SuppressionContext` | policy decision | yok | storage/Notification bağımlılığı yok |
| Engine | occurrence seed + deterministic clock | `ReminderOccurrence[]` | yok | sabit instant, input isolation, second-call parity |

`invokePure()` girdiyi clone ederek saf fonksiyon sınırında mutasyonu reddeder.
`getMissingFields()` / `assertRequiredFields()` eksik zorunlu alanları
belirginleştirir. JSON localStorage okuma/yazması hem girişte hem çıkışta deep
clone yapar; bilinmeyen alanlar korunur.

## Test receipt’i

| Komut | Sonuç |
|---|---|
| `node tests/reminders/test_reminder_contract.js` | PASS — 15 case, 74 assertion |
| `node tests/reminders/test_reminder_timezones.js` | PASS — contract skeleton, 3 assertion |
| `node --check tests/reminders/helpers/reminder-test-helper.js` | PASS |
| `node --check tests/reminders/test_reminder_contract.js` | PASS |
| `git diff --check` | PASS |

Contract testi deterministic clock, timezone boundary, memory storage,
Notification record, network rejection, safe error text, missing fields,
unknown fields, deep clone, catalog/policy/engine pure boundaries, synthetic
environment ve second-call parity assertion’larını çalıştırdı.

## Değişmeyen yüzeyler ve güvenlik kanıtı

- `app.js`, `sync.js`, `sw.js`, `index.html`, `styles.css`, `panel.js`,
  `panel.html` ve `data/` altında diff yoktur.
- Helper gerçek `window`, `document`, `navigator` veya browser storage’ı
  kullanmaz; test environment bu alanları özellikle expose etmez.
- Fetch mock gerçek ağ açmaz; browser, server, remote, Pages ve gerçek data repo
  kullanılmadı.
- Secret, gerçek token, gerçek kullanıcı payload’ı, deploy veya external system
  write yapılmadı.
- `releaseApproval.status` `not_approved` olarak bırakıldı.

## Kapanış

REM-02 için blocker yoktur. Yalnız REM-02 kapsamındaki test/helper ve kanıt
dosyaları local commit’e alınır; push, merge, tag, Pages veya deploy yapılmaz.
Sonraki güvenli adım `REM-03` catalog ve private-copy sözleşmesidir.
