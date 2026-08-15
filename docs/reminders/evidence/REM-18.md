# REM-18 — Reading, journal ve tek akşam kapanışı evidence

**Tarih:** 2026-08-15<br>
**Durum:** tamamlandı<br>
**Implementation commit:** `feb0882e562d0d7c0e843f0007453bed90033046`

## Uygulanan sözleşme

- Aynı local tarih ve akşam penceresinde zikir, Saygı, kitaplık ve Günlük
  Işığı adayları iki veya daha fazlaysa deterministic tek
  `reminder.coalesced.evening.v1` occurrence’a indirilir. Aynı yüzeyin
  duplicate adayları da tek alternatif olarak tutulur; tek aday REM-17’nin
  mevcut occurrence davranışını korur.
- Primary hedef; explicit `eveningPrimary` / kullanıcı seçimi, explicit window,
  native opt-in, priority ve son düzenleme zamanına dayalı deterministik
  seçimle belirlenir. Primary seçiminin schedule saati değişse bile occurrence
  kimliği akşam tarihi, en erken güvenli saat ve timezone ile kararlı kalır.
- Native title/body sabit ve geneldir: akşamı tek küçük davetle kapatma copy’si.
  Kişi adı, makale başlığı/gövdesi, kitap ayrıntısı, journal text, mood, note ve
  diğer hassas bağlam occurrence, native copy ve delivery sınırına taşınmaz.
- Alternatifler yalnız canonical deep-link, sabit güvenli etiket, kategori ve
  priority olarak in-app inbox grubunda görünür. Zikir, Saygı, Kitaplık ve
  Günlük Işığı hedefleri aynı occurrence içinden açılabilir; Saygı’nın modal,
  Okudum/read gate ve article readiness koşulları upstream adapter’da kalır.
- Journal veya library kaydının boş olması invitation’ı failure/missing-data
  olarak işaretlemez; occurrence `dataRequirement: none` ile devam eder.
  Native geçişi mevcut quiet-hours, capacity, daily budget, low-priority cap,
  permission ve delivery dedupe policy’sinden geçer. Quiet/budget durumunda
  tek grup in-app’e düşer.
- Catch-up, coalesced occurrence’ı generic in-app summary içinde tutar ve
  `nativeReplay: false` sınırını korur. Sabah saatinde evening occurrence due
  değildir; varsayılan morning + evening native çifti oluşturulmaz.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| REM-18 evening contract | `node tests/reminders/test_reminder_evening.js` — PASS, 5 case / 44 assertion; coalescing, primary selection, one-native lifecycle, in-app alternatives, empty-data neutrality, quiet/budget, morning/catch-up |
| Required syntax | `node --check app.js` — PASS |
| Required catch-up | `node tests/reminders/test_reminder_catchup.js` — PASS, 46 assertion |
| App headless | `node .claude/skills/run-seyma/driver.mjs` — PASS; onboarding, seeded render, tab/theme/save-state interaction |
| Privacy boundary | `node tests/reminders/test_reminder_privacy.js` — PASS, 30 assertion |
| Existing ritual hub | `node .claude/skills/run-seyma/zikr-harness.mjs` — PASS, 90/90 |
| Reminder regression | All 23 `tests/reminders/test_*.js` fixtures — PASS |
| Root / Panel / boundaries | All `tests/test_*.js`, all Panel-v2 fixtures, B1/B2/B3 — PASS |
| Syntax / context / diff | `node --check sync.js`, catalog syntax, `node docs/reminders/verify-reminder-context.mjs`, `git diff --check` — PASS |

## Sınırlar

Browser açılmadı, server başlatılmadı, gerçek localStorage/token/kullanıcı
verisi veya network kullanılmadı; `mustafaras/seyma-data` write, external write,
push, merge, Pages veya deploy yapılmadı. Kullanıcı cihazı ve gerçek background
notification kabulü yapılmadı. Release approval `not_approved` olarak kaldı.

## Kapanış

REM-18 implementation ve headless verification ile kapandı. G4 core ritual
evening gate teknik olarak kapandı; REM-19 sıradaki güvenli prompt olarak hazır.
Canonical state `lastCompletedPrompt=REM-18`, `activePrompt=REM-19` ve
`nextSafeAction=REM-19 local implementation/verification; no release action`
olarak güncellendi.
