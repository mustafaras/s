# REM-05 — Reminder Center shell evidence

**Tarih:** 2026-08-13<br>
**Durum:** tamamlandı<br>
**Commit:** `6327c74` — `REM-05: reminder center shell`
**Kapsam:** Ayarlar altındaki Reminder Center erişilebilir shell’i; native
izin, scheduler, preference/delivery state, sync ve production data kapsam
dışında bırakıldı.

## Uygulanan yüzey

- `app.js:3590–3657` katalogdan okuyan, yalnız `ui` üzerinde çalışan Reminder
  Center yardımcılarını ve inline `App` handler’larını içerir.
- `app.js:5153`, `app.js:8600` ve `app.js:12104` overlay yaşam döngüsü, Ayarlar
  giriş noktası ve modal render bağlantısını taşır.
- `styles.css:1256–1272` küçük viewport, safe-area, light/dark, focus-visible
  ve reduced-motion kurallarını taşır.
- `tests/reminders/test_reminder_center.js` normal/empty katalog, preview,
  ephemeral mute, iki tema, native boundary ve a11y kaynak assertion’larını
  kapsar.

Katalog kartları yalnız `ReminderCatalogV1.list()` kayıtlarından üretilir.
Kartlarda katalogun category, priority, privateTitle, triggerType,
defaultWindow, defaultChannel, deepLink ve definitionVersion alanları
görünürdür. `privateBody` yalnız açık uygulama içi preview sonrasında görünür.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| Normal katalog | `node tests/reminders/test_reminder_center.js` — PASS, 6 case / 97 assertion; 7 katalog kaydının 7’si render edildi |
| Empty katalog | Aynı fixture — PASS; accessible `role=status` empty state ve sıfır kart |
| Uygulama içi preview | Aynı fixture — PASS; private body yalnız explicit preview sonrasında göründü |
| Native boundary | Aynı fixture — preview/mute/tema akışında `requestPermission=0`, Notification constructor `0`, fetch `0`; gerçek `Notification.requestPermission` çağrısı REM-05 yoluna eklenmedi |
| Ephemeral state | Aynı fixture — “Bugün tümünü sustur” sonrası `seyma-reset-v1` byte/deep state değişmedi; `reminderDelivery` ve `data.notifications` ayrımı korundu |
| Tema / responsive / a11y | Aynı fixture — light/dark PASS; source assertion’ları `focus-visible`, `env(safe-area-inset-bottom)`, `prefers-reduced-motion` ve `max-width:390px` PASS |
| Syntax | `node --check app.js`, `node --check tests/reminders/test_reminder_center.js`, `node --check sync.js`, `node --check sw.js` — PASS |
| Existing reminder contracts | catalog PASS — 423 assertion; contract PASS — 74 assertion; timezone PASS — 3 assertion; migration PASS — 50 assertion; privacy PASS — 19 assertion |
| Existing app safety | `node .claude/skills/run-seyma/driver.mjs` — PASS; B2 migration boundary — 32/32 PASS; `git diff --check` — PASS |
| Regression | root `tests/test_*.js` loop exit 0; `tests/panel-v2/test_panel_v2_*.js` loop exit 0 |

## Native, data ve dış sistem sınırı

- Browser açılmadı, server başlatılmadı, gerçek localStorage, token, gerçek
  kullanıcı verisi, remote endpoint veya external system kullanılmadı.
- `app.js` içindeki mevcut ÆON native izin akışı değişmedi; REM-05 shell’i
  native permission istemez ve `data`, `data.reminders`, delivery logu,
  `data.notifications` veya sync projection’a yazmaz.
- `app/core/reminderCatalog.js`, `index.html`, `sync.js`, `sw.js`, `data/` ve
  `mustafaras/seyma-data` değişmedi.

## Discrepancy audit

1. **Discrepancy yok:** `ReminderCatalogV1` normal state’teki 7 kayıt ile
   Reminder Center’ın 7 kartı birebir eşleşti; empty state aynı render yolunda
   sıfır kart verdi.
2. **Discrepancy yok:** REM-04’teki `data.reminders.preferences` ve ayrı
   delivery-log sınırı migration/privacy fixture’leriyle yeniden PASS kaldı;
   REM-05 eylemleri bu state’e yazmadı.
3. **Discrepancy yok:** Native izin sınırı test mock’unda preview, mute ve tema
   akışlarında çağrı üretmedi; browser/server/network sınırı headless olarak
   korundu.

## Blocker ve kapanış

Blocker yok. `releaseApproval.status` `not_approved` kaldı. Remote equality,
CI/Pages deployment ve kullanıcı cihazı kabulü yapılmadı; bunlar bu promptun
kapsamı değildir.

Sonraki güvenli adım: **REM-06 — Profiles, category toggles ve permission
explanation**.
