# REM-21 — Hicri / özel gün tercihleri evidence

**Tarih:** 2026-08-15<br>
**Durum:** tamamlandı<br>
**Implementation commit:** `7c2eb28e669d370f028801467ff5ba026996b2e4`

## Uygulanan sözleşme

- Hicri / kandil özel günleri Reminder Center içinde `tümü`, `seçili günler`
  veya `hiçbiri` modlarıyla yönetilir. Varsayılan mod `none`, kanal
  `in_app` ve native teslim kapalıdır; seçilmeyen gün için lifecycle candidate
  veya native üretimi yapılmaz.
- Seçili günler yalnızca allowlist'teki özel gün kimliklerini kabul eder.
  Kullanıcı isterse kanalı native'e alabilir; bu durumda mevcut quiet-hours,
  günlük native bütçe, cooldown ve grouping kuralları aynen uygulanır.
- Occurrence üretimi mevcut `HijriCalendarV1` holy-day / Hicri dönüşümünü
  adapter üzerinden kullanır. `prayer.hijriOffset` değerleri `-2`, `0`, `+2`
  için aynı özel günün offset-aware yerel occurrence'ları test edilmiştir.
  `hijriCalendar.js`, mevcut kandil lookup ve badge mantığı yeniden yazılmadı.
- Kopya Türkçe, sakin ve isteğe bağlıdır; zorunluluk, puanlama, ticari veya
  satın alma yönlendirmesi içermez. Native başlık/body genel tutulur.

## Acceptance ve test receipt'leri

| Kapı | Kanıt |
|---|---|
| Required syntax | `node --check app.js` ve `node --check hijriCalendar.js` — PASS |
| Special-day contract | `node tests/reminders/test_reminder_special_days.js` — PASS, 35 assertion; default opt-in, all/selected/none, native opt-in, quiet/budget, disable ve copy sınırları |
| Offset / timezone | `node tests/reminders/test_reminder_timezones.js` — PASS, 28 assertion; `-2`, `0`, `+2` offset occurrence'ları ve timezone sözleşmesi |
| Reminder regression | `tests/reminders/test_reminder_*.js` — 26 fixture, tamamı PASS |
| App / hub / migration | `driver.mjs` PASS; `zikr-harness.mjs` PASS 90/90; B1, B2 32/32, B3 20/20 PASS |
| Root / panel regression | Root `tests/test_*.js` — 32 fixture; Panel-v2 — 27 fixture; tamamı PASS |
| Context / whitespace | `verify-reminder-context.mjs` PASS; `git diff --check` PASS |

## Safety and release boundary

Browser açılmadı, server başlatılmadı, gerçek localStorage/token/kullanıcı
verisi veya network kullanılmadı. `mustafaras/seyma-data` write, external
write, push, merge, Pages, deploy ve device acceptance yapılmadı. Release
approval `not_approved` olarak korunur.

## Kapanış

G5 care / health kapısı, Hicri özel gün tercihleri ve offset-aware occurrence
kanıtlarıyla kapandı. `REM-22` sıradaki güvenli prompt olarak hazırdır.
