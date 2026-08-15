# REM-17 — Saygı / Günün Öncüsü reading integration evidence

**Tarih:** 2026-08-15<br>
**Durum:** tamamlandı<br>
**Implementation commit:** `58d84906f2c85500816853d96402d9f6a259ac7d`<br>
**Runtime audit commit:** `fa359b6707f381aff3dcc535dd31f1b1551558fd`

## Uygulanan sözleşme

- Saygı tercihi yalnız `enabled: true`, `daily` ve kullanıcının açıkça seçtiği
  `timeWindow` / `readingWindow` ile aday üretir. Gün filtresi ve pencere
  kontrolü geçildiğinde her local tarih için deterministic tek occurrence
  (`reminder-saygi-v1:<localDate>`) oluşur; katalog varsayılanı tek başına
  reminder başlatmaz.
- Article `ready` sayılmadan occurrence üretilmez. Seçilen kişinin kimliği,
  local günlük anahtarı ve en az 24 karakterlik okunabilir blok birlikte
  doğrulanır; missing/loading/error/short/stale içerik fail-closed kalır.
  `App.markSaygiRead` aynı okunabilirlik kapısını korur; eksik veya başarısız
  fetch kullanıcıyı okundu sayamaz.
- Summary → article → external-links zincirinde `requestId`, günlük anahtar
  ve açık modal kişi kimliği eşleştirilir. Geç gelen eski kişi sonucu yeni
  seçimi, modal makalesini veya read gate’i değiştiremez.
- Native ve delivery copy daima genel tutulur: kişi adı, makale başlığı,
  article gövdesi ve hassas bağlam occurrence/private copy içine taşınmaz.
  `saygi` deep-link’i `openDetail` ile modalı açar; mevcut `Okudum`,
  `mediaFed`, koleksiyon ve modal gezinme akışları korunur.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| REM-17 Saygı contract | `node tests/reminders/test_reminder_saygi.js` — PASS, 8 case / 71 assertion; window, runtime lifecycle loading/ready/duplicate, read gate, private copy, modal deep-link, stale identity, async race |
| Required syntax | `node --check app.js` — PASS |
| Existing Saygı hub | `node .claude/skills/run-seyma/zikr-harness.mjs` — PASS, 90/90; Okudum, mediaFed, collection, modal identity/deep-link regressionleri |
| Privacy boundary | `node tests/reminders/test_reminder_privacy.js` — PASS, 30 assertion; native/private delivery redaction |
| REM-16 revalidation | `test_reminder_therapy.js` 82, `test_reminder_deeplinks.js` 63, `test_reminder_inbox.js` 40 assertion — PASS |
| Reminder regression | All 22 `tests/reminders/test_*.js` fixtures — PASS; runtime audit was re-run after the initial closure |
| App headless | `node .claude/skills/run-seyma/driver.mjs` — PASS; onboarding, seeded render, tab/theme/save-state interaction |
| Root / Panel / boundaries | All 32 root fixtures, all 27 Panel-v2 fixtures, B1/B2/B3 — PASS |
| Syntax / context / diff | `node --check sync.js sw.js panel.js panelCoverageManifest.js`, `node docs/reminders/verify-reminder-context.mjs`, `git diff --check` — PASS |

## Sınırlar

Browser açılmadı, server başlatılmadı, gerçek localStorage/token/kullanıcı
verisi veya network kullanılmadı; `mustafaras/seyma-data` write, external write,
push, merge, Pages veya deploy yapılmadı. Kullanıcı cihazı ve gerçek
background notification kabulü yapılmadı. Release approval `not_approved`
olarak kaldı.

## Kapanış

Blocker yok; REM-17 local implementation ve headless verification ile kapandı.
Canonical state `lastCompletedPrompt=REM-17`, `activePrompt=REM-18`,
`nextSafeAction=REM-18 local implementation/verification; no release action`
olarak güncellendi. REM-18 sıradaki güvenli prompt’tur; release-ready değildir.
