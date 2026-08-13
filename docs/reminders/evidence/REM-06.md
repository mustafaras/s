# REM-06 — Profiles, category toggles ve permission explanation evidence

**Tarih:** 2026-08-13<br>
**Durum:** tamamlandı<br>
**Commit:** `ec55913` — `REM-06: profiles ve permission açıklamaları`

## Uygulanan sözleşme

- Sakin, Dengeli, Destekleyici, Ritüel odaklı ve Özel profilleri mevcut
  preference alanlarını silmeden additive merge eder.
- Başlangıçta en fazla üç kategori seçilebilir; kategori açık/kapalı durumu ve
  kanal tercihi uygulama içinde değiştirilebilir.
- `unsupported`, `default`, `granted`, `denied`, `temporary-error` ve
  `pwa-limited` permission durumları ayrı, kullanıcıya dönük açıklamalara
  sahiptir.
- Permission request çağrısı bu yüzeye eklenmemiştir. Reddedilen native izin
  uygulama içi kanalı kapatmaz ve request loop başlatmaz.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| Profile merge / data preservation | `node tests/reminders/test_reminder_profiles.js` — PASS, 3 case / 35 assertion |
| Permission explanation / no-loop | `node tests/reminders/test_reminder_permission.js` — PASS, 3 case / 40 assertion |
| App safety | `node .claude/skills/run-seyma/driver.mjs` — PASS; app syntax PASS; reminder regression PASS; `git diff --check` PASS |

## Sınırlar

- Browser açılmadı; gerçek localStorage, token, kullanıcı verisi, network,
  external write, push, merge, Pages ve deploy yapılmadı.
- Release approval `not_approved` olarak kaldı.

## Kapanış

Blocker yok. Sonraki güvenli adım: **REM-07 — Quiet hours, daily budget ve
capacity mode**.
