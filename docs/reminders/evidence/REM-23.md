# REM-23 — Foreground native delivery ve click routing evidence

**Tarih:** 2026-08-16<br>
**Durum:** tamamlandı<br>
**Implementation commit:** `4618a67d0bfe9745ba103dea3944cf35a77b199a`

## Uygulanan sözleşme

- Reminder evaluator yalnız device-local delivery journal’ını günceller;
  native display ayrı `reminderNativeDisplay` adapter’ında, journal yazımı
  başarıyla persist edildikten sonra çalışır. ÆON sosyal notification adapter’ı
  değiştirilmedi ve reminder bütçesiyle ortak state kullanmıyor.
- Native çağrı yalnız `nativeAllowed` policy sonucu, `granted` permission,
  görünür foreground lifecycle kaynağı, desteklenen Notification API, güvenli
  canonical copy ve yeni occurrence koşullarında yapılır. Permission request
  veya background scheduler eklenmedi.
- Payload genel/private-safe title ve body, occurrence-bound tag,
  `renotify:false`, `Aç`, `10 dk ertele` ve `Bugün sustur` action’ları ile
  allowlisted `faith`, `zikr`, `room`, `saygi`, `reading`, `gunluk`, `health`
  veya `settings` hedefini taşır. Kullanıcı notu, duygu, makale/kişi, terapi,
  ilaç ayrıntısı ve ÆON gövdesi payload’a girmez.
- Native click, occurrence ID ve canonical deep-link eşleşmesini doğrular;
  `open`, `snooze`/`10m|30m|1h...` ve `todayOff`/`mute` action’larını mevcut
  local delivery/action sözleşmesine yönlendirir. Geçersiz veya eksik payload
  state değiştirmez.
- Catch-up, replay ve background scheduling bu promptta özellikle eklenmedi;
  foreground kanıtı background capability olarak sunulmaz. REM-24 service
  worker sınırına devredildi.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| Required syntax | `node --check app.js` — PASS |
| Native adapter | `node tests/reminders/test_reminder_native.js` — PASS, 66 assertion; pure/display ayrımı, permission, budget, quiet, visibility, duplicate, privacy, tag, action ve payload contract |
| Click routing | `node tests/reminders/test_reminder_deeplinks.js` — PASS, 77 assertion; occurrence-bound open, allowlist mismatch, snooze ve mute routing |
| Required headless app | `node .claude/skills/run-seyma/driver.mjs` — PASS; onboarding, seeded render, tab/theme/save-state |
| Reminder context | `node docs/reminders/verify-reminder-context.mjs` — PASS; approval=`not_approved` |
| Wider safe regression | Root fixtures, Panel-v2 fixtures, B1/B2/B3 boundaries ve `node --check sync.js` — PASS |
| Reminder matrix note | Wall-clock koşusunda 27 fixture’dan 25’i PASS; prayer (`48` assertion) ve Saygı (`71` assertion) tarih-pinned fixture’ları uygulamanın 2026-08-16 tarihini eski fixture tarihleriyle karşılaştırdığı için ayrı FAIL verdi. Her ikisi de fixture-intended synthetic clock ile PASS edildi; REM-23 allowlist’i dışında değiştirilmedi. |
| Diff safety | `git diff --check` — PASS; yalnız allowlisted runtime/test commit’i ve closure belgeleri |

## Evidence seviyeleri ve release sınırı

Source evidence: S1. Synthetic/headless test evidence: S2. Local commit:
S3 (`4618a67d0bfe9745ba103dea3944cf35a77b199a`). Remote equality, CI/Pages,
live browser, user device ve production notification evidence: yok.

Gerçek browser açılmadı, server başlatılmadı, gerçek network/localStorage,
token veya kullanıcı verisi kullanılmadı. `mustafaras/seyma-data` write,
external write, push, merge, tag, Pages, deploy ve device acceptance yapılmadı.
Release approval `not_approved` olarak korunur.

## Kapanış

REM-23 foreground native policy, private payload, duplicate/privacy blokları ve
click action hedefleriyle PASS edildi. Sonraki güvenli prompt `REM-24`’tür;
background schedule veya replay garantisi verilmemiştir.
