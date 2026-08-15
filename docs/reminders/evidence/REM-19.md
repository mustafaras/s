# REM-19 — Su, uyku, kafein ve hareket bütçesi evidence

**Tarih:** 2026-08-15<br>
**Durum:** tamamlandı<br>
**Implementation commit:** `867283f92021897459cc071f39c387a93634804c`

## Uygulanan sözleşme

- Care catalogu `water`, `sleep`, `caffeine` ve `movement` anahtarlarını
  güvenli, sabit native copy ve mevcut uygulama yüzeyi eşlemesiyle tanımlar.
  Kullanıcı native için en fazla iki care kategorisi seçebilir; seçimler
  normalize edilip kalıcı reminder policy içinde korunur.
- Su yalnız uyanıklık penceresinde deterministic üç slot üretir. Uyku için
  tek preparation-window, kafein için tek sleep-close occurrence vardır.
  Hareket/esneme yalnız explicit opt-in ile aday olur; varsayılan olarak
  mevcut in-app yüzeyinde kalır.
- Seçilmeyen care kategorileri mevcut `Su`, uyku hazırlığı, kafein ve ruh
  aktivitesi yüzeylerini duplicate etmez. Her care occurrence kendi mevcut
  surface deep-link’ine bağlanır; `health` hedefi `saglik` sekmesine açılır.
- Care occurrence’ları common native daily budget, quiet-hours, permission,
  cooldown ve delivery dedupe policy’sinden geçer. Aynı akşamda care adayları
  birden fazla olsa bile native capacity tek günlük bütçe ile sınırlanır.
- Native başlık/gövde kısa ve genel tutulur; not, mood, journal text, kişi,
  makale veya hassas bağlam taşımaz. Care adapter canonical day kayıtlarını
  okumaz/değiştirmez; mevcut kayıtların korunması ayrı fixture ile doğrulanır.
  Copy tıbbi gereklilik iddiası içermez.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| REM-19 care contract | `node tests/reminders/test_reminder_care.js` — PASS, 5 case / 32 assertion; seçim limiti, water/sleep/caffeine/movement cadence, surface uniqueness ve kayıt koruma |
| REM-19 shared budget | `node tests/reminders/test_reminder_budget.js` — PASS, 5 case / 18 assertion; care collision, daily native cap ve max-two selection |
| Required syntax | `node --check app.js` — PASS |
| App headless | `node .claude/skills/run-seyma/driver.mjs` — PASS; onboarding, seeded render, tab/theme/save-state interaction |
| Existing ritual hub | `node .claude/skills/run-seyma/zikr-harness.mjs` — PASS, 90/90 |
| Reminder regression | All 24 `tests/reminders/test_reminder_*.js` fixtures — PASS; privacy, Saygı/read gate, catch-up, delivery, lifecycle ve migration sınırları |
| Root / Panel / syntax / diff | Faz10 sync, Faz11 panel, `node --check sync.js`, context validator ve `git diff --check` — PASS |

## Sınırlar

Browser açılmadı, server başlatılmadı, gerçek localStorage/token/kullanıcı
verisi veya network kullanılmadı; `mustafaras/seyma-data` write, external write,
push, merge, Pages veya deploy yapılmadı. Kullanıcı cihazı ve gerçek background
notification kabulü yapılmadı. Release approval `not_approved` olarak kaldı.

## Kapanış

REM-19 implementation ve headless verification ile kapandı. Care collision,
loading/selection budget, duplicate surface ve privacy sınırları PASS edildi.
REM-20 sıradaki güvenli prompt olarak hazır; canonical state
`lastCompletedPrompt=REM-19`, `activePrompt=REM-20` ve
`nextSafeAction=REM-20 local implementation/verification; no release action`
olarak güncellendi.
