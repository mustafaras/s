# REM-34 — Opt-in kişiselleştirme ve adaptasyon guardrail’leri evidence

Tarih: 2026-08-16  
Durum: tamamlandı; local source/test evidence hazır, S5 kullanıcı cihazı kabulü bekliyor.

## Kapsam

- `data.reminders.personalization` additive ve local-only bir state’tir; varsayılan
  `optIn=false`, `historyMode=none`, `autoApply=false` olur.
- Yalnız açık kategori, saat, snooze ve feedback seçimleri allowlist edilmiş
  source/value alanlarıyla kaydedilir. Kaynaklar sırasıyla
  `explicit-category-choice`, `explicit-time-choice`, `explicit-snooze` ve
  `explicit-feedback` olarak görünür.
- Mood, terapi, ibadet, sağlık, günlük metni, sessizlik çıkarımı, occurrence ID,
  native body, raw text ve benzeri hassas alanlar personalization state’ine veya
  öneri girdisine alınmaz.
- Adaptasyon pure ve deterministiktir. Sadece açık onaydan sonra daha düşük
  yoğunluklu `light` modu veya `native -> in_app` kanalı uygulanabilir; otomatik
  değişiklik yoktur. Her öneri source, neden ve geri alma yolu gösterir.
- Opt-out, no-history ve reset sinyal/öneri/geçmiş kayıtlarını temizler. Undo,
  kullanıcı ayarı arada değişmişse üzerine yazmadan fail-closed döner.
- Native cap, low-capacity, quiet hours ve günlük bütçe mevcut REM-07 policy
  katmanında kalır; personalization bunları artıramaz.

## Değişen kapsam

- `app.js`
- `styles.css`
- `tests/reminders/test_reminder_personalization.js`
- `docs/reminders/APP-REMINDER-DECISIONS.md` (`REM-ADR-020`)

Canonical kapanış dosyaları bu evidence ile birlikte ledger ve STATE pointer’larını
taşır. `sync.js`, `sw.js`, `hijriCalendar.js`, `data/`, panel ve dış sistemler
değiştirilmedi.

## Verification

| Komut | Sonuç |
|---|---|
| `node tests/reminders/test_reminder_personalization.js` | PASS — 68 assertion |
| `node tests/reminders/test_reminder_privacy.js` | PASS — 35 assertion |
| `node tests/reminders/test_reminder_policy.js` | PASS — 71 assertion |
| `node tests/reminders/test_reminder_lifecycle.js` | PASS — 36 assertion |
| `for f in tests/reminders/test_*.js; do node "$f" || exit 1; done` | PASS — tüm 40 reminder fixture’i |
| `node .claude/skills/run-seyma/driver.mjs` | PASS — onboarding, seeded render, tab/theme/save interaction |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | PASS — 90/90 assertion |
| `for f in tests/test_*.js; do node "$f" || exit 1; done` | PASS — root fixture loop |
| `node --check app.js` | PASS |
| `node --check sync.js` | PASS |
| `git diff --check` | PASS |
| `node docs/reminders/verify-reminder-context.mjs` | PASS — approval `not_approved` |
| `node docs/reminders/verify-reminder-closure.mjs REM-34` | PASS — closure gate |

Testler synthetic Node/vm harness ile çalıştırıldı. Gerçek browser, local server,
gerçek localStorage, gerçek `Notification`, network, sync push, deploy ve user
data write kullanılmadı.

## Evidence seviyeleri ve sınırlar

- S0: UX planı §2.2, §4.2, §11.1–§11.4, §13.3, §18; REM-01, REM-06,
  REM-30; reminder context, decisions, STATE/ledger ve allowlist okundu.
- S1: personalization 68, privacy 35, policy 71, lifecycle 36 assertion;
  full reminder suite, syntax, context ve diff PASS.
- S2: headless app render, Zikir hub ve root fixture evidence PASS.
- S3: local implementation commit `f749e5f429af20653d943a90bc700714995d1fe2`.
- S4: deploy/remote equality çalıştırılmadı; push, merge, tag ve Pages yok.
- S5: kullanıcı cihazı kabulü pending; gerçek cihazda native/background davranışı
  doğrulanmadı.
- Release approval: `not_approved`.

Sonraki güvenli prompt: REM-35 — Haftalık sakin özet ve yansıma.
