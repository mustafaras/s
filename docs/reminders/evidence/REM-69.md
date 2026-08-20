# REM-69 — Schema version, migration ve legacy panel compatibility

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-69
- **Tarih:** 2026-08-20
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `4c5970c26fc553d93172ad1ab2f6cc8289b202b0`
- **Kod/test commit:** closure commitinde kaydedildi
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none`

## Uygulanan uyumluluk kararı

- App `data.reminders` için missing / version 0 legacy root additive olarak v1’e
  taşınır; current v1 idempotent kalır; malformed legacy alanlar güvenli
  varsayılanlara iner ve bilinmeyen alanlar korunur.
- Future numeric reminder schema root tamamen opaque korunur. Bu build root’u
  normalize etmez, `reminderCurrentRoot()` runtime’ı fail-closed bırakır ve
  `App.reminderSchemaStatus()` actionable `preserve_and_require_update`
  sonucu üretir.
- App sync payload ve `sync.js` sanitize, bilinen local-only köklerin yanında
  future reminder-like top-level kökleri de redacted/dropped yapar. Ordinary
  unknown application fields additive olarak korunur.
- Current panel manifest parser, old/missing schema için `legacy` fallback;
  future schema için `schema_unsupported`; future manifest için
  `manifest_unsupported`; eksik optional projection parçaları için
  `partial_rebuilt` compatibility raporu üretir. Schema/manifest mismatch
  hiçbir dalda `projection` + green success olmaz.
- Unknown reminder paths panel coverage’da `unmapped` ve maskeli token olarak
  raporlanır; raw kullanıcı başlığı, body, therapy/medication ayrıntısı veya
  secret path dışarı çıkmaz. Unknown safe app field yalnızca izinli summary
  sınıfında korunur.
- Legacy fallback, projection fallback ve app migration ayrı test/evidence
  yüzeyleridir; panel projection seçimi app state’i mutate etmez.

## Release / rollback note

Older Pages asset, rollback commit veya stale service worker current schema/
manifest ile karşılaşırsa bunu başarı gibi göstermemelidir. Panel actionable
`Projection sürümü uyumsuz` / `Projection manifesti uyumsuz` durumunu gösterir,
legacy latest.json redaction fallback’e iner ve reminder working claim’i green
olmaz. Güvenli operasyon sırası: güncel asset’i yeniden yayınla veya rollback
SHA’sını bilinçli seç, Pages/asset cache-bust’i doğrula, service worker’ın eski
asset’i tuttuğu durumda kontrollü refresh/reinstall uygula; kullanıcı cihazı
ve gerçek data repo’su bu synthetic kanıtın parçası değildir.

## Doğrulama

| Katman | Komut | Sonuç | Kanıt |
|---|---|---|---|
| Cross-surface schema | `node tests/reminders/test_reminder_cross_surface_schema.js` | **PASS** | 12 named cases / 65 assertions; no network/write |
| Migration parity | `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs` | **PASS** | B2 32/32; unknown fields and deep parity |
| Current panel projection | `node tests/test_panel_p1_projection.js` | **PASS** | 43/43 |
| Panel QA/release | `node tests/test_panel_p6_qa_release.js` | **PASS** | 16/16; rollback/cache-bust documentation gate |
| Existing migration | `node tests/reminders/test_reminder_migration.js` | **PASS** | 50 assertions |
| Existing panel source/privacy | `node tests/reminders/test_reminder_panel_source.js`; `node tests/reminders/test_reminder_panel_privacy.js` | **PASS** | 319 + 121 assertions |
| Sync privacy | `node tests/reminders/test_reminder_sync_privacy.js` | **PASS** | 347 assertions |
| Full synthetic reminder set | `for f in tests/reminders/test_reminder_*.js; do node "$f"; done` | **PASS** | 71 fixtures, exit 0 |
| Current root panel set | `for f in tests/test_panel_*.js; do node "$f"; done` | **PASS** | 21 fixtures, exit 0 |
| Panel-v2 separate regression | `for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done` | **PASS** | 27 fixtures, exit 0 |
| Headless app/faith | `node .claude/skills/run-seyma/driver.mjs`; `node .claude/skills/run-seyma/zikr-harness.mjs` | **PASS** | no browser/server/network |
| Syntax | `node --check app.js`; `node --check sync.js`; `node --check panel.js`; `node --check panelCoverageManifest.js` | **PASS** | exit 0 |
| Context/diff | `node docs/reminders/verify-reminder-context.mjs`; `git diff --check` | **PASS** | 73 prompts / 66 links; clean whitespace |

## Evidence seviyeleri ve sınırlar

- **S0/S1 source:** app migration, sync sanitize, manifest parser ve panel
  status code paths; protected `data/`, data repo, workflow ve archive yolları
  değiştirilmedi.
- **S2 synthetic:** tüm fixture’lar in-memory/headless; gerçek browser,
  localStorage, token, network, notification body ve external write yok.
- **S3 commit:** closure commitinde doldurulacak.
- **S4 CI/Pages:** closure sonrası standing `after_each_prompt` scope’unda
  ayrıca kaydedilebilir; bu receipt tek başına deploy kanıtı değildir.
- **S5 user-device:** pending; ajan tarafından üretilmedi.

## Sonuç

- **Durum:** done
- **Gap:** `INT-01` schema/migration/projection compatibility kapandı.
- **Sonraki prompt:** REM-70
- **Release:** `not_approved`; standing delivery scope’u dışında tag, force-push,
  other remote, data repo write ve user-device acceptance yok.

