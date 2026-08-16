# REM-24 — Service Worker click, retry ve no-spam boundary evidence

**Tarih:** 2026-08-16<br>
**Durum:** tamamlandı<br>
**Implementation commit:** `25f8122c67f0a2782952daae6cec426396ea5236`

## Uygulanan sözleşme

- `sw.js` reminder click payload’ını yalnızca `reminder` tipi, occurrence ID,
  reminder ID, eşleşen target ID, sınırlı deep-link, action, snooze option ve
  güvenli timezone alanlarından oluşturuyor. `faith`, `zikr`, `room`, `saygi`,
  `reading`, `gunluk`, `health` ve `settings` dışındaki hedefler ignore ediliyor.
- Geçersiz occurrence, target mismatch, bilinmeyen action, bozuk timezone,
  bilinmeyen snooze option veya hatırlama gövdesi gibi alanlar route’a
  taşınmıyor. Başlık, body, medication, terapi ve kullanıcı notu
  `postMessage` payload’ına alınmıyor.
- Mevcut ÆON click akışı korunuyor: mevcut Şeyma client’ı bulunursa yalnızca
  `aeon-open-mesaj` postMessage + focus uygulanıyor; client yoksa tek
  `openWindow` denemesi yapılıyor. Reminder click aynı client akışında
  `reminder-native-click` olarak app adapter’ına gönderiliyor.
- App tarafındaki dar adapter payload’ı ikinci kez doğruluyor ve mevcut
  occurrence-bound native open/snooze/todayOff sözleşmesine yönlendiriyor.
- Reminder-shaped `push` payload’ı background notification’a dönüştürülmüyor;
  mevcut ÆON push kanalı korunuyor. Service worker’da timer, fetch, token,
  schedule, replay queue veya retry loop yok. Click başına tek route denemesi
  var; local snooze/mute action idempotence’i app action contract’ında kalıyor.
- Kapalı uygulama için click sonrası client açma/mesaj gönderme yolu test
  edildi; bu, kapalı uygulamada zamanlanmış notification garantisi veya
  background delivery kanıtı değildir.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| SW syntax | `node --check sw.js` — PASS |
| App syntax | `node --check app.js` — PASS |
| SW contract | `node tests/reminders/test_reminder_sw.js` — PASS, 57 assertion; ÆON compatibility, target allowlist, open/focus/postMessage, closed-click route, invalid/secret payload ignore, reminder push block ve no-schedule boundary |
| App click adapter | `node tests/reminders/test_reminder_deeplinks.js` — PASS, 85 assertion; allowlisted target, occurrence requirement, snooze/mute ve SW adapter redaction |
| Headless app | `node .claude/skills/run-seyma/driver.mjs` — PASS |
| Root fixtures | Faz10/Faz11 ve Panel P0/P1/P2/P3/P4 fixtures — PASS |
| Panel-v2 | 27 fixture — PASS |
| State boundaries | B1/B2/B3 — PASS |
| Context | `node docs/reminders/verify-reminder-context.mjs` — PASS; approval=`not_approved` |
| Diff safety | `git diff --check` — PASS; source/test değişiklikleri allowlist içinde |
| Reminder matrix note | Wall-clock koşusunda 27 fixture’dan 25’i PASS; prayer (`48`) ve Saygı (`71`) legacy date-pinned fixture’ları 2026-08-16 ile sabit 2026-08-15 tarihi arasındaki fark nedeniyle FAIL oldu. İkisi de kendi intended synthetic clock’larıyla PASS edildi; bu REM-24 yüzeyi değildir ve fixture’lar değiştirilmedi. |

## Evidence seviyeleri ve release sınırı

Source evidence: S1. Synthetic/headless test evidence: S2. Local commit: S3
(`25f8122c67f0a2782952daae6cec426396ea5236`). Remote equality, CI/Pages,
live browser, gerçek service worker kurulumu, user device ve production
notification evidence: yok.

Browser açılmadı, server başlatılmadı, gerçek network/localStorage, token veya
kullanıcı verisi kullanılmadı. `mustafaras/seyma-data` write, external write,
push, merge, tag, Pages, deploy ve device acceptance yapılmadı. Release approval
`not_approved` olarak korunur.

## Kapanış

REM-24 G6 service-worker click / safe routing / no-spam sınırıyla kapandı.
REM-25 sıradaki güvenli prompttur. Closed-app timed notification guarantee,
background scheduling veya replay iddiası yapılmamıştır.
