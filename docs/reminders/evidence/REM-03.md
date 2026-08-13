# REM-03 — Reminder catalog ve private-copy evidence

**Tarih:** 2026-08-13<br>
**Durum:** tamamlandı<br>
**Kapsam:** versioned catalog; DOM, network, Date ve persistence yan etkisi yok.

## Catalog receipt’i

`app/core/reminderCatalog.js`, classic script olarak `app.js` öncesine
`?v=20260813a` cache-bust ile eklendi. Global yüzey yalnız
`ReminderCatalogV1`’dir. Catalog sürümü `1.0.0` ve bütün tanımlar deep-frozen
olarak sunulur.

| ID | Kategori | Öncelik | Tetikleyici | Deep-link | Kanal |
|---|---|---|---|---|---|
| `reminder.catalog.v1.prayer` | ritual | P2 | prayer-offset | faith | in_app |
| `reminder.catalog.v1.zikr` | ritual | P2 | scheduled-window | zikr | in_app |
| `reminder.catalog.v1.therapy` | support | P2 | scheduled-window | room | in_app |
| `reminder.catalog.v1.saygi` | ritual | P3 | scheduled-window | saygi | in_app |
| `reminder.catalog.v1.reading` | ritual | P3 | scheduled-window | reading | in_app |
| `reminder.catalog.v1.journal` | reflection | P2 | scheduled-window | gunluk | in_app |
| `reminder.catalog.v1.system` | system | P0 | system-event | settings | in_app |

Her kayıt `id`, `category`, `priority`, `triggerType`, `deepLink`,
`privateTitle`, `privateBody`, `detailKeys`, `defaultWindow`, `defaultChannel`,
`snoozeOptions`, `suppressionRules` ve `definitionVersion` alanlarını taşır.

## Privacy ve kimlik sınırı

- ID’ler `reminder.catalog.v1.` reserved namespace’indedir; mevcut
  `data.notifications` observer/message ID’lerinden ayrıdır.
- Native kanal hiçbir catalog kaydında varsayılan değildir; tamamı `in_app`.
- Private copy Türkçe, seçenek sunan ve genel tutuldu. Namaz, zikir, terapi,
  CBT, duygu, kriz, kişi adı, kitap, günlük, ilaç veya performans/eksiklik dili
  private metne taşınmaz.
- Kişisel ve hassas ayrıntılar yalnız `detailKeys` ile app-only projection’a
  ayrılmıştır; catalog kendi başına persistence veya panel yazımı yapmaz.

## Saflık kanıtı

Catalog source statik olarak `document`, `localStorage`, `fetch`, `Date`,
`Notification` ve `navigator` bağımlılıkları açısından negatif tarandı. Test,
modülü Node VM’de boş sandbox ile iki kez yükleyip aynı çıktıyı doğruladı.
`Object.freeze` ve deep-freeze assertion’ları nested array/window/rule
mutasyonlarını reddetti. `list()` dış array kopyası verir; `get()` bilinmeyen
ID için `null` döndürür.

## Test receipt’i

| Komut | Sonuç |
|---|---|
| `node --check app/core/reminderCatalog.js` | PASS |
| `node tests/reminders/test_reminder_catalog.js` | PASS — 7 case, 423 assertion |
| `node --check app.js` | PASS |
| `git diff --check` | PASS |

## Güvenlik ve değişiklik sınırı

- `app.js`, `sync.js`, `sw.js`, `data/` ve gerçek kullanıcı verisi değişmedi.
- Browser açılmadı, server başlatılmadı, network/remote/Pages/external system
  kullanılmadı.
- Token, secret ve ham kullanıcı payload’ı kullanılmadı.
- Release approval `not_approved` kaldı; push, merge, tag ve deploy yapılmadı.

REM-03 blocker’sız kapandı. Sonraki güvenli adım `REM-04` preference state ve
additive migration’dır.
