# MON-D11 — Tam regression ve performans sınırı

**Kart:** MON-57
**Tarih:** 2026-09-13
**Durum:** ✅ TAMAMLANDI — tüm zorunlu no-network suite'leri exit 0
**Ön koşul:** MON-56, commit `fc96cfd`
**Kapsam:** Yalnız kanıt/state; üretim kodu değiştirilmedi

## Karar ve sınır

MON-57, MON-56 sonrası güvenli fixture zincirini suite bazında yeniden
çalıştırdı. Zorunlu komutların tamamı gerçek dosyalara bağlı olarak exit `0`
verdi. Browser, local server, gerçek veri, network, deploy, cihaz kabulü ve
benchmark çalıştırılmadı; bunlar ayrı kapılardır. Performans için sayı
uydurulmadı.

## Baseline ve envanter

Başlangıçta çalışma ağacı temizdi:

```text
HEAD: fc96cfd refactor(mon): make helper ownership single-source
```

Kart başı/sonu kod ölçümü aynıdır; bu kartta kod taşıması yoktur:

| Ölçüm | MON-57 öncesi | MON-57 sonrası | Delta |
|---|---:|---:|---:|
| `app.js` satırı | 13.144 | 13.144 | 0 |
| `app/core/*.js` modül dosyası | 29 | 29 | 0 |
| App function / tüm App ataması / unique App | 556 / 721 / 718 | 556 / 721 / 718 | 0 |
| Inline `onclick` occurrence | 391 | 391 | 0 |
| Canonical `data` assignment satırı/tokenı | 9 / 11 | 9 / 11 | 0 |

Kümülatif tarihsel referans olarak MON-S2 baseline'ı `19.247 app.js` satırıydı;
MON-57 bu refactor trendine yeni bir kaynak delta eklemedi.

İstenen envanter komutu çalıştırıldı:

```text
rg --files tests/app tests/panel tests/panel-v2 tests/quran tests/reminders | sort
```

Canlı envanter: app **52** fixture, legacy panel **23** fixture, Panel-v2
**27** fixture, Quran **9** fixture; reminder bakım alanında **20** seçilmiş
fixture ve smoke/freeze runner. Panel-v2/reminder helper dosyaları suite
sayımına dahil edilmedi.

## Suite sonuçları

| Suite / gerçek komut grubu | Sonuç |
|---|---|
| `node --check app/core/*.js app.js sync.js` | **31/31 PASS** |
| `.claude/skills/run-seyma/driver.mjs` — onboarding, seeded, interaction, reminder | **PASS / exit 0** |
| `.claude/skills/run-seyma/zikr-harness.mjs` | **95/95 PASS / exit 0** |
| `tests/app/test_*.js` | **52/52 PASS** |
| `tests/app/test_premium_*.js` | **9/9 PASS** |
| `tests/panel/test_*.js` | **23/23 PASS** |
| `tests/panel-v2/test_panel_v2_*.js` | **27/27 PASS** |
| `tests/quran/test_*.js` | **9/9 PASS** |
| `tests/reminders/run-reminder-smoke.mjs` | **PASS / exit 0** |
| `docs/reminders/verify-reminder-freeze.mjs` | **PASS / exit 0** |
| `git diff --check` | **PASS / exit 0** |

MON-50–54 AppSurface boundary sonuçları da tam regression içinde yeniden
kanıtlandı: `19/19`, `58/58`, `49/49`, `16/16`, `21/21`. ÆON mesaj genişletme
`24/24`, Faz10 sync `69/69`, modularization `101/101`, state-rebind `37/37`
ve FX2 ailesi `14/12/7/12/7/14` PASS verdi.

## Headless output gözlemi

Production-order driver dump'ları ağsız VM'de üretildi. Bu değerler gözlem
makbuzudur; tarih/stokastik içerik nedeniyle benchmark veya cihaz performans
iddiası değildir.

| Dump | UTF-8 byte | SHA-256 |
|---|---:|---|
| `bugun` | 114.172 | `b7fc43c2dfed41a674cf36878e21d382714d7f7a89c9b0cbd500ab348dbc3b61` |
| `rapor` | 139.545 | `e1c2b83d0a331e645295b881ceb252bd87667ea1cd52a123934b5a7b10b1e24b` |
| `profile` | 7.435 | `3ab539f5e61c5746375228d20f4bcf579abb127e5c0484e87a0ff1ff9e0b004` |
| `ayarlar` | 46.190 | `cfab520708d21ffd11f35cccac9ca67ba5df290e4c5e298ed5b32053c82538c9` |
| `reminder` | 97.421 | `3f74c1fe6119292dd7b3a018d988151d8859de45a4547c83957adc8a788c1346` |
| `mesaj` | 17.138 | `15df13b7138af356d7c5a4d9c80e0b5719eeb0e7d8b7d002bf1998c1b09394da` |
| `saygi` | 20.466 | `4b409586dd83af1573f602c1867c9385e272d22a7073ca3098659a28f2733bfd` |
| `room` | 137.865 | `5473e556330fcabf2868d7a5d2bd19e931c692547cc55f794405cdfd119b0420` |
| `reading` | 122.971 | `0ab96b21eca830fc5106dcac3e22838aafa78aa935cea051a61a36aa90b5cf78` |

`driver.mjs --dump harita` generic yolu `ui.calMonth` değerini kendisi
kurmadığı için ayrı output probe olarak dışarıda bırakıldı; bu bir zorunlu
MON-57 suite'i değildir. Gerçek map sınırı `tests/app/test_map_boundary.js`
ile sabit `calMonth` fixture'ı altında PASS etti.

## Cache-bust / FILES / sahiplik

Yeni core dosyası, production script tag'i, cache-bust veya harness FILES
değişmedi. `appSurface.js?v=20260913c` → `app.js?v=20260913c` sırası ve
`sync.js` son konumu korunmuştur. Registry, App, data, render, timer/listener,
sync ve network sahiplikleri değişmemiştir.

## Kabul ve ayrı kanıtlar

1. Tek sahiplik: MON-56 ile kapanmış ve bu kartta yeniden bozulmamıştır.
2. Doğru yükleme sırası: syntax/load-order ve driver/zikr VM zincirleri PASS.
3. Hedef suite: tüm zorunlu app/panel/Panel-v2/Quran/reminder/premium aileleri PASS.
4. I1–I6/M1–M4: üretim kodu değişmedi; App/data/FX/sync sınırlarında delta yok.

Bu rapor yerel headless kaynak kanıtıdır; browser/device/deploy/release
clearance değildir.
