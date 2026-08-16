# REM-32 — Reminder Center gelişmiş kontrol yüzeyi evidence

Tarih: 2026-08-16  
Durum: tamamlandı; local source/test evidence hazır, S5 kullanıcı cihazı kabulü bekliyor.

## Kapsam

Reminder Center tek akışta profil, kategori, kanal, günlük akış bütçesi, native günlük üst sınır, düşük öncelik sınırı, sessiz saatler, kapasite modu ve “bugün tümünü sustur” kontrollerini sunuyor. Genel sıfırlama yalnız genel policy/profile alanlarını sıfırlıyor; kategori override’ları korunuyor ve son değişiklik geri alınabiliyor.

Katalog kartı önizlemesi private body yerine güvenli genel kopya gösteriyor. Center’daki sentetik test reminder yalnız uygulama içi HTML/state üretir; `Notification`, dış ağ, sync veya history kaydı oluşturmaz. Düşük seviyedeki `App.previewReminderNotification` REM-22 native delivery adapterı olarak korunmuştur; REM-32 kullanıcı akışı bunu çağırmaz.

Son reminder history yalnız kısa ömürlü yerel metadata (durum, kanal, zaman ve genel etiket) gösterir. Raw body/private not/sağlık ayrıntısı render edilmez; geçmiş temizlenebilir ve son temizleme geri alınabilir. History temizleme/geri alma canonical sync kaydı üretmez.

Disabled, unsupported permission, empty catalog, empty history, reset ve undo durumları role/status, adlandırılmış kontroller, disabled state ve keyboard/focus uyumlu açıklamalarla gösterilir.

## Değişen kapsam

Allowlist içindeki kaynak/test dosyaları:

- `app.js`
- `styles.css`
- `index.html` cache-bust satırları
- `tests/reminders/test_reminder_center_advanced.js`

Canonical kapanış dosyaları bu evidence ile birlikte ledger ve STATE pointer’larını taşır. `data/`, `sync.js`, `sw.js`, panel ve dış sistemler değiştirilmedi.

## Verification

| Komut | Sonuç |
|---|---|
| `node tests/reminders/test_reminder_center_advanced.js` | PASS — 48 assertion |
| `node tests/reminders/test_reminder_actions.js` | PASS — 39 assertion |
| `for f in tests/reminders/test_reminder_*.js; do node "$f" || exit 1; done` | PASS — tüm mevcut reminder fixture’leri |
| `node .claude/skills/run-seyma/driver.mjs` | PASS — onboarding, seeded render, tab/theme/save interaction |
| `node --check app.js` | PASS |
| `node --check tests/reminders/test_reminder_center_advanced.js` | PASS |
| `node docs/reminders/verify-reminder-context.mjs` | PASS — 73 prompt, 67 local link, approval `not_approved` |
| `git diff --check` | PASS |

Testler synthetic Node/vm harness ile çalıştırıldı. Gerçek browser, local server, gerçek localStorage, gerçek `Notification`, network, sync push, deploy ve user data write kullanılmadı.

## Evidence seviyeleri ve sınırlar

- S0: roadmap, reminder context, UX planının ilgili bölümleri, REM-05/06/13/22 ve güncel state/ledger okundu.
- S1: syntax, fixture ve diff kontrolleri PASS.
- S2: headless synthetic center/action/regression/driver evidence PASS.
- S3: local implementation commit `68afed07c660cb006e0c7c86dbc35da41067925c`.
- S4: deploy/remote equality çalıştırılmadı.
- S5: kullanıcı cihazı kabulü pending.
- Release approval: `not_approved`; push, merge, tag, Pages/deploy ve external write yapılmadı.

Sonraki güvenli prompt: REM-33 — Sistem durumu, stale veri ve dürüst uyarı.
