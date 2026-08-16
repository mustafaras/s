# REM-33 — Sistem durumu, stale veri ve kullanıcıya dürüst uyarı evidence

Tarih: 2026-08-16  
Durum: tamamlandı; local source/test evidence hazır, S5 kullanıcı cihazı kabulü bekliyor.

## Kapsam

Reminder system status artık capability’leri birbirine karıştırmadan raporlar:

- `fresh`, `stale`, `unavailable`, `offline` ve `recovery` genel durumları deterministik olarak ayrıdır.
- Native izin `granted`, `default`, `denied`, `unsupported`, `temporary-error` ve `pwa-limited` alt durumlarıyla ayrı tutulur.
- Sync `disabled`, `idle`, `pending`, `synced`, `offline` ve genel `error` durumlarına indirgenir; yalnız whitelist edilmiş receipt kodları okunur.
- Statik PWA’da arka plan zamanlaması garanti edilmediği kullanıcıya açıkça söylenir.

Prayer status yalnız yerel gün, kaynak zamanı, method, konum ve 48 saatlik freshness sınırı birlikte geçerliyse `fresh` olur. Eski, doğrulanamayan veya tamamlanmamış kaynakla yeni prayer occurrence üretilmez; lifecycle filtresi yalnız gerçek `prayerKey` taşıyan üretilmiş prayer occurrence’larını bu kapıya bağlar. Böylece app-only sentetik occurrence’lar yanlışlıkla prayer verisi sayılmaz.

Offline lifecycle native gösterimi durdurur, mevcut yerel reminder deneyimini uygulama içinde korur ve recovery için bir pending işareti bırakır. Her offline→online geçişinde en fazla tek catch-up değerlendirmesi yapılır; mevcut 24 saatlik grouped, in-app-only ve `nativeReplay=false` sözleşmesi korunur. Journal occurrence idempotence’i duplicate veya sınırsız geçmiş yağmurunu engeller.

Sync hatası kullanıcıya genel Türkçe açıklamayla gösterilir; raw error, token, konum, vakit saati ve kullanıcı metni status sözleşmesine taşınmaz. `sync.js` ve `sw.js` değişmedi; mevcut sanitize, receipt ve foreground-only Service Worker sınırları korunmuştur. `hijriCalendar.js` de değiştirilmedi.

## Değişen kapsam

Allowlist içindeki kaynak/test dosyaları:

- `app.js`
- `styles.css`
- `tests/reminders/test_reminder_system_status.js`

Canonical kapanış dosyaları bu evidence ile birlikte ledger ve STATE pointer’larını taşır. `sync.js`, `sw.js`, `hijriCalendar.js`, `data/`, panel ve dış sistemler değiştirilmedi.

## Verification

| Komut | Sonuç |
|---|---|
| `node tests/reminders/test_reminder_system_status.js` | PASS — 65 assertion |
| `node tests/reminders/test_reminder_prayer.js` | PASS — 48 assertion |
| `node tests/reminders/test_reminder_lifecycle.js` | PASS — 36 assertion |
| `node tests/reminders/test_reminder_native.js` | PASS — 66 assertion |
| `for f in tests/reminders/test_*.js; do node "$f" || exit 1; done` | PASS — tüm reminder fixture’leri |
| `node .claude/skills/run-seyma/driver.mjs` | PASS — onboarding, seeded render, tab/theme/save interaction |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | PASS — 90/90 assertion |
| `for f in tests/test_*.js; do node "$f" || exit 1; done` | PASS — root fixture loop |
| `node --check app.js` | PASS |
| `node --check sync.js` | PASS |
| `node docs/reminders/verify-reminder-context.mjs` | PASS — 73 prompt, 67 local link, approval `not_approved` |
| `git diff --check` | PASS |

Testler synthetic Node/vm harness ile çalıştırıldı. Gerçek browser, local server, gerçek localStorage, gerçek `Notification`, network, sync push, deploy ve user data write kullanılmadı.

## Evidence seviyeleri ve sınırlar

- S0: roadmap §3.2, §4.5, §7.10, §8.8, §9.5, §10.4; reminder context, UX planı, STATE/ledger ve bounded `sync.js` / `sw.js` / `hijriCalendar.js` okundu.
- S1: syntax, deterministic status, stale-prayer, permission, offline/recovery, privacy, a11y ve regression fixture’ları PASS.
- S2: headless synthetic app render, Zikir hub ve root fixture evidence PASS.
- S3: local implementation commit `cbb8c8d82eeb2fcb9eb09c7def294f5df503d17a`.
- S4: deploy/remote equality çalıştırılmadı.
- S5: kullanıcı cihazı kabulü pending.
- Release approval: `not_approved`; push, merge, tag, Pages/deploy ve external write yapılmadı.

Sonraki güvenli prompt: REM-34 — Opt-in kişiselleştirme ve adaptasyon guardrail’leri.
