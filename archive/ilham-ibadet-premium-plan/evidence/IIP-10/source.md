# IIP-10 kaynak kanıtı

Tüm komutlar repo kökünden çalıştırıldı; tam çıktı `evidence/IIP-10/commands.log`
dosyasındadır. Ağsız/headless; gerçek kişisel veri, token, `localStorage`, ağ ve
tarayıcı kullanılmadı.

| Komut | Sonuç |
|---|---|
| `node ilham-ibadet-premium-plan/tools/plan-check.mjs` | PASS — 24 kart, 48 gereksinim, DAG, kapsam, kanıt, ledger ve üretilmiş görünümler |
| `node --check app/core/saygi.js` | PASS |
| `node --check app.js` | PASS |
| `node --check tests/app/test_iip_10.js` | PASS |
| `node tests/app/test_iip_10.js` | **61/61 PASS** |
| `node tests/app/test_saygi_boundary.js` | 20/20 PASS |
| `node tests/app/test_iip_04.js` | PASS — 26 kontrol |
| `node tests/app/test_iip_09.js` | 22/22 PASS |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | 95/95 PASS |
| `node .claude/skills/run-seyma/driver.mjs` | PASS |
| `node tools/shell-inventory.mjs --gate` | PASS — kabuk bütçesi 7.800 altında |
| `node tests/app/test_modal_focus_containment.js` | PASS |
| `node tests/app/test_state_rebind_boundary.js` | 37/37 PASS |
| `node tests/app/test_modularization_boundary.js` | 102/102 PASS |
| `node tests/app/test_app_surface_daily_boundary.js` | PASS (pin 557 / 719) |
| `node tests/app/test_v3_welcome.js` | PASS (pin 555 / 719) |
| `git -c core.fsmonitor=false diff --check` | PASS — boşluk hatası yok |

## Pin değişimi (DEC-07)

Donmuş fixture'lar `App` yüzeyini sabitler; kart tek dispatcher handler eklediği
için yüzey **+1** büyüdü. `HEAD` ile çalışma ağacı ölçümleri:

| Metrik | HEAD | Şimdi |
|---|---|---|
| `App.*` benzersiz yüzey | 718 | **719** |
| `App` atama (function) sayısı | 556 | **557** |
| `app.js` başında `App.*` handler | 554 | **555** |
| `onclick=` | 391 | **391** (değişmedi) |

Bu nedenle **beş** fixture'ın pinleri güncellendi ve yeniden çalıştırıldı:

| Komut | Sonuç |
|---|---|
| `node tests/app/test_fx2_overlay_motion.js` | PASS (FX2-16.2: `App.*`=719, `onclick`=391) |
| `node tests/app/test_fx2_tab_transition.js` | PASS (FX2-15.7: `App.*`=719, `onclick`=391) |
| `node tests/app/test_fx2_touch_coverage.js` | PASS (FX2-10.9: `App.*`=719, `onclick`=391) |
| `node tests/app/test_app_surface_daily_boundary.js` | PASS (atama=557, yüzey=719) |
| `node tests/app/test_v3_welcome.js` | PASS (handler=555, yüzey=719) |

## Bayat pin onarımı (kartın neden olmadığı)

Dört `app_surface_*_boundary` fixture'ı `index.html`'de artık canlı olmayan
cache-bust değerlerini bekliyordu (`app.js?v=20260916a`,
`appSurface.js?v=20260915c`; canlı: `20260921a` / `20260920a`). Bu uyuşmazlık
HEAD'de de vardı (doğrulandı). Beklenen değerler canlı değere getirildi ve altı
fixture da PASS oldu:

`test_app_surface_boot_boundary.js`, `test_app_surface_domain_boundary.js`,
`test_app_surface_lifecycle_boundary.js`, `test_app_surface_overlay_boundary.js`
(+ `test_v3_welcome.js`'in appSurface pini). `index.html` **değiştirilmedi**.

## Düzeltme kaydı

İlk raporda bu uyuşmazlıkların **altısı da** "önceden var olan" sayılmıştı. Bu
**yanlıştı**: `test_app_surface_daily_boundary.js` ve `test_v3_welcome.js`'in
556/554/718 pinleri HEAD'de geçiyordu ve yalnız yeni handler yüzünden kırıldı.
Hata HEAD'de ayrı bir iş ağacı kurulup pinler karşılaştırılarak bulundu ve
düzeltildi.

## Regresyon (tam)

| Aile | Sonuç |
|---|---|
| `tests/app/` (60 fixture) | Tümü PASS |
| `tests/panel/` (23 fixture) | Tümü PASS |
| `tests/panel-v2/` (27 fixture) | Tümü PASS |
| `tests/quran/` (9 fixture) | Tümü PASS |
| `tests/reminders/run-reminder-smoke.mjs` | PASS (73 sözleşme + 21 fixture) |
| `.claude/skills/run-seyma/verify-state-*.mjs` (4) | Tümü PASS |
| `driver.mjs`, `zikr-harness.mjs` | Tümü PASS |
| `tools/shell-inventory.mjs --gate` | PASS |
| `tools/fx-coverage.mjs --gate` | exit 1 — M7 için **onaylı** 0.62 tavanı (bilinen) |

