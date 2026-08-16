# REM-25 — Sync sanitize ve local-only privacy evidence

**Tarih:** 2026-08-16<br>
**Durum:** tamamlandı<br>
**Kapsam:** Gerçek data repo’ya yazmadan sync remote projection, full-replace
merge ve old-device/new-device local-only sınırı.

## Uygulanan sözleşme

- `sync.js` içindeki `SeySync.sanitize` public headless doğrulama yüzeyi olarak
  doğrudan test edildi; gerçek ağa veya localStorage’a erişmez.
- `data.reminders` ile reminder/delivery kökleri remote payloaddan çıkarıldı.
  Preference, medication label/name/note, therapy detail, occurrence id,
  notification body ve delivery fixture’ları payloadda bulunmuyor.
- `ghToken`, `openaiKey`, `syncUrl`, `auth` ve ham sync receipt detail’i
  payloaddan çıkarıldı veya normalize edildi.
- `mergeData` remote girdiyi sanitize ederek tüketiyor; local-only reminder
  köklerini remote’dan import etmiyor. Full-replace projection birleşmiş safe
  gün/observer alanlarını koruyor.
- Pre-push backup artık ham `data` yerine aynı sanitized projectionı kullanıyor.

## Sentetik kanıt

| Komut | Sonuç |
|---|---|
| `node --check sync.js` | PASS |
| `node --check tests/reminders/test_reminder_sync_privacy.js` | PASS |
| `node tests/reminders/test_reminder_sync_privacy.js` | PASS — 3 case / 97 assertion |
| `node tests/test_faz10_sync.js` | PASS — 64 / 64 |
| `git diff --check` | PASS |

Fixture, rich local state’in input olarak değişmeden kaldığını; remote payloadda
safe `days`, observer `notifications`, `body` aggregate’i ve repo metadata’sının
korunduğunu; private reminder subtree, delivery kökleri, secret ve ham metinlerin
bulunmadığını kanıtlar. Full-replace conflict’inde daha yeni güvenli gün alanı,
uzak gün ve observer kaydı korunur; local reminder state’i ezilmez. Boş/legacy
cihaz da remote reminder root veya secret import etmez.

Fetch mock çağrısı `0`, sentetik delivery key okuması `0` olarak doğrulandı.
Gerçek GitHub fetch, `mustafaras/seyma-data`, gerçek localStorage, browser ve
server kullanılmadı.

## Kanıt seviyeleri ve sınırlar

- **S0/S1 source:** `sync.js` sanitize / merge / backup boundary ve REM-ADR-017.
- **S2 synthetic:** REM-25 privacy fixture ve Faz 10 sync regression PASS.
- **S3 local commit:** `54d4d345584c5636727028a756be549ddf459564`.
- **S4 remote / Pages:** N/A; push/deploy yapılmadı.
- **S5 user device:** N/A; browser açılmadı.

`releaseApproval.status` `not_approved` kaldı. REM-26 sıradaki güvenli
prompttur.
