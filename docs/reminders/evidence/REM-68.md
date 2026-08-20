# REM-68 — Cross-surface status ve failure semantics

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-68
- **Tarih:** 2026-08-20
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `57472f7bdacf2cb2d108437e0290854b3c2bd262`
- **Kod/test commit:** `17c1d2d0e6f45c1bf57c5f50da93decbd5e19231`
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none`

## Kapsam ve uygulama

- `app.js` içine fail-closed `reminderCrossSurfaceStatus` ve açıklamalı
  `reminderCrossSurfaceTransition` adapter'ları eklendi. Capability, local
  scheduled, delivered, sync accepted, projection built, panel visible ve
  device accepted yedi ayrı layer olarak kendi `owner`, `code`, `reason` ve
  evidence alanlarını taşır.
- `sync.js` ve `panel.js` aynı receipt proof gate'ini uygular: `accepted`
  yalnız `snapshotRevision + sourceLatestSha + acceptedAt` birlikte geçerliyse
  kanıtlanır. Eksik proof `receipt_missing` evidence'ıdır ve green değildir;
  eski extraction harness'larında canonical `missing` geriye dönük korunur.
- Offline, native permission denied, stale prayer, sync conflict, projection
  missing, panel 304 ve device-unverified branches ayrı kodlanır. Panel 304
  yalnız mevcut görünür revision'ı korur; yeni visibility/projection success
  üretmez.
- Transition sonucu `advance`, `lateral` veya `regression` yönünü, `nonMonotonic`
  bayrağını ve layer-scoped sabit reason'ları taşır; sessiz green/pending/stale
  dönüşü yoktur.
- App kullanıcı copy'si ile operator panel copy'si paylaşılmaz; card ve cross
  status çıktısı raw body, category, schedule, token ve private detail taşımaz.
- Panel-v2 current panel acceptance yerine geçirilmemiştir; current reminder,
  root observer ve Panel-v2 command setleri ayrı çalıştırılmış ve ayrı raporlanmıştır.

## Kanıt sınırı

- REM-68 fixture'ı yalnız sabit synthetic objects ve read-only VM helper'ları
  kullanır. Gerçek browser, endpoint, token, localStorage, kullanıcı verisi,
  filesystem write veya network yoktur; sync VM fetch mock çağrı sayısı `0`dır.
- Saat girdileri sabit ISO değerleridir; test `Date.now()` ile karar üretmez.
- Başarı kanıtı fixture adedi değildir. Aşağıda test adı, assertion/exit code ve
  failure signature birlikte kaydedilmiştir.
- `releaseApproval=not_approved`; S5 user-device acceptance agent tarafından
  üretilmemiştir ve `deviceAccepted=unverified` olarak kalır.

## Doğrulama

| Katman | Komut | Sonuç | Failure signature |
|---|---|---|---|
| REM-68 cross-surface | `node tests/reminders/test_reminder_cross_surface_status.js` | **PASS, 8 named cases / 84 assertions** | none |
| App system regression | `node tests/reminders/test_reminder_system_status.js` | **PASS, 5 named cases / 65 assertions** | none |
| Current panel status | `node tests/reminders/test_reminder_panel_status.js` | **PASS, 14 named cases / 223 assertions** | none |
| Root panel P0 | `node tests/test_panel_p0_sync.js` | **PASS, 31 checks; exit 0** | none |
| All reminder fixtures | `for f in tests/reminders/test_reminder_*.js; do node "$f"; done` | **exit 0** | no `FAIL` signature; named fixtures PASS |
| Current root observer | `for f in tests/test_panel_*.js; do node "$f"; done` | **exit 0** | no failure signature |
| Panel-v2 separate regression | `for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done` | **exit 0** | no failure signature; not merged into current-panel acceptance |
| Headless app safety | `node .claude/skills/run-seyma/driver.mjs` | **exit 0** | none; browser/network not used |
| Headless faith surface | `node .claude/skills/run-seyma/zikr-harness.mjs` | **exit 0, 95/95** | none |
| Migration/helper boundaries | `verify-state-helper-boundary.mjs`; `verify-state-migration-boundary.mjs`; `verify-state-adapter-contract.mjs` | **PASS, 0 failures; 32/32; 20/20** | none |
| Syntax | `node --check app.js`; `node --check sync.js`; `node --check panel.js` | **exit 0** | none |
| Context | `node docs/reminders/verify-reminder-context.mjs` | **PASS, 73 prompts / 66 links** | none |
| Diff | `git diff --check` | **PASS** | none |

## Sonuç

- **Durum:** done
- **G14-B / INT-02:** Cross-surface status gap kapandı. Her layer kendi
  evidence seviyesinde; incomplete receipt, offline, stale, conflict, missing,
  304 ve device-unverified durumları birbirine green olarak propagate etmiyor.
- **Sonraki prompt:** REM-69
- **Live/device evidence:** S5 user-device acceptance agent tarafından üretilmedi
  ve pending kalır; standing delivery receipt aşağıdadır.
- **Release:** `not_approved`; local PASS veya fixture sayısı release approval
  anlamına gelmez.

## Standing after_each_prompt delivery receipt

- Closure delivery SHA `709fa3cd2f12eb6b170604f51fa51ee4b09cea3d` için local
  `HEAD`, `origin/main` ve `git ls-remote origin refs/heads/main` üçlü equality
  **PASS**.
- GitHub Actions workflow `32360638427` **success**; validate job
  `96399268280` ve deploy job `96399330959` **success**. Pages deployment
  `6000676282` (`github-pages`, SHA `709fa3cd2f12eb6b170604f51fa51ee4b09cea3d`)
  **success**.
- `https://mustafaras.github.io/s/index.html` ve `/panel.html` HTTP `200`.
  Canlı `app.js` cross-surface adapter/proof marker'larını, canlı `panel.js`
  receipt-proof/`receipt_missing` marker'larını ve canlı `docs/reminders/evidence/REM-68.md`
  evidence marker'larını taşıyor.
- `mustafaras/seyma-data`, diğer remotes, tag/history rewrite ve user-device
  acceptance untouched/pending.
