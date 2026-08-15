# REM-20 — İlaç / takviye guarded flow evidence

**Tarih:** 2026-08-15<br>
**Durum:** tamamlandı<br>
**Implementation commit:** `4660671255f363a086eeeccfa11e98a890c2bb66`

## Uygulanan sözleşme

- Hatırlatma merkezi artık yalnızca kullanıcının kurduğu günlük `time` alanı
  üzerinden ilaç veya takviye occurrence'ı üretir. Yerel kayıt; bounded `name`,
  `privateLabel`, `note`, `timezone`, `enabled` ve lifecycle alanlarıyla sınırlıdır.
  `dose`, `dosage`, `treatment`, `interaction`, `healthText` ve missed-dose
  karar alanları normalize edilmez; eski `medicationSchedules` alias'ı da
  canonical migration sonrasında kaldırılır.
- Uygulama içinde açık bir clinical safety metni gösterilir: özellik yalnızca
  kullanıcının girdiği zamanı hatırlatır; doz, tedavi veya tıbbi karar önermez.
  Edit, delete, bugün sustur, local clear ve bounded delivery/action retention
  akışları kullanıcı kontrolünde kalır.
- Occurrence yalnızca ilgili yerel gün için üretilir. Saat geçmişse occurrence
  `missed` ve `due:false` olur; replay, catch-up, yeni doz, telafi veya “kaçırdın”
  önerisi üretilmez. Snooze varsa yalnızca mevcut genel reminder action
  sözleşmesindeki açık kullanıcı eylemidir.
- In-app inbox özel adı/etiketi/notu local schedule üzerinden çözer. Native
  başlık ve body genel kalır; ilaç adı, doz, not veya health text occurrence,
  native copy ve delivery journal sınırına geçirilmez.
- `save()` içindeki mevcut reminder sync projection'ı tüm `data.reminders`
  ağacını dışarıda bırakır. Böylece sync ve panelin remote projection'ında
  medication name, private label, note veya health text bulunmaz. Sağlık API'si,
  dış servis, `sync.js` değişikliği, panel write veya gerçek veri erişimi
  eklenmedi.

## Acceptance ve test receipt'leri

| Kapı | Kanıt |
|---|---|
| REM-20 medication contract | `node tests/reminders/test_reminder_medication.js` — PASS, 8 case / 65 assertion; bounded fields, legacy migration, current-day occurrence, generic native boundary, CRUD, today mute, retention ve local clear |
| Privacy / sync / delivery / panel projection | `node tests/reminders/test_reminder_privacy.js` — PASS, 3 case / 35 assertion; private root local kalıyor, sync projection ve delivery journal clinical/private alan taşımıyor |
| Required migration boundary | `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs` — PASS, 32/32 |
| Required syntax | `node --check app.js` — PASS |
| Reminder regression | 25 `tests/reminders/test_reminder_*.js` fixture'ının tamamı PASS |
| App / core headless | `node .claude/skills/run-seyma/driver.mjs` — PASS; onboarding, seeded render, tab/theme/save-state interaction |
| Existing hub | `node .claude/skills/run-seyma/zikr-harness.mjs` — PASS, 90/90 |
| Root / panel regression | Root `tests/test_*.js` loop, Panel-v2 27 fixture loop, Faz10, Faz11, B1, B2, B3 — PASS |
| Syntax / context / whitespace | `node --check sync.js`, `node docs/reminders/verify-reminder-context.mjs` and `git diff --check` — PASS |

## Safety and release boundary

Browser açılmadı, server başlatılmadı, gerçek localStorage/token/kullanıcı
verisi veya network kullanılmadı; `mustafaras/seyma-data` write, external write,
push, merge, Pages, deploy veya device acceptance yapılmadı. Release approval
`not_approved` olarak korunur.

## Kapanış

Clinical safety gate; user-owned schedule, no-dose/no-treatment/no-missed-dose
decision, generic native copy, local-only private fields, retention ve
sync/panel redaction kanıtlarıyla PASS edildi. REM-21 sıradaki güvenli prompt
olarak hazırdır.
