# IIP-13 · source gate

## Kanıt komutları

Tam liste ve çıktılar: `commands.log` (**13 komut, hepsi exit 0**).

| Komut | Amaç | Exit |
|---|---|---|
| `node ilham-ibadet-premium-plan/tools/plan-check.mjs` | plan şema/DAG/ledger/kanıt zinciri | 0 |
| `node --check app/core/prayer.js` | üretim sözdizimi | 0 |
| `node --check app/core/saygi.js` | üretim sözdizimi | 0 |
| `node --check tests/app/test_iip_13.js` | fixture sözdizimi | 0 |
| `node tests/app/test_iip_13.js` | **REQ-025/026 · 80/80** | 0 |
| `node tests/app/test_prayer_boundary.js` | MON-19 sınırı · 19/19 | 0 |
| `node tests/app/test_saygi_boundary.js` | Saygı sınırı · 20/20 | 0 |
| `node tests/app/test_iip_12.js` | önceki kart regresyonu · 92/92 | 0 |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | İlham & İbadet hub harness | 0 |
| `node .claude/skills/run-seyma/driver.mjs` | app.js render harness | 0 |
| `node tools/shell-inventory.mjs --gate` | kabuk satır bütçesi | 0 |
| `git -c core.fsmonitor=false diff --check` | boşluk/whitespace | 0 |

## Geniş regresyon

Kart, iki paylaşılan modülü (`prayer.js`, `saygi.js`) değiştirdiği için aile
tamamı koşuldu:

| Aile | Sonuç |
|---|---|
| `tests/app` | **63/63** |
| `tests/panel` | **23/23** |
| `tests/panel-v2` | **27/27** |
| `tests/quran` | **9/9** |
| `tests/reminders/run-reminder-smoke.mjs` | PASS |
| `driver.mjs` + `zikr-harness.mjs` | PASS |

## Pinler: ne değişti, ne değişmedi

- **Sayı pinleri değişmedi.** Yeni `App.*` üyesi açılmadı ve yeni CSS sınıfı
  yazılmadı; yüzey/atama/`onclick`/v3 sayıları sabit kaldı. `test_app_surface_*`
  ve `test_v3_welcome.js` fixture'larına dokunulmadı.
- **Sürüm pini değişti (entegratör işi — uygulandı).** `app/core/prayer.js`
  (`?v=20260904a` → **`20260921a`**) **ve** `app/core/saygi.js` (`?v=20260921c` →
  **`20260921d`**) içeriği değiştiği için `index.html` pinleri yükseltildi; bu
  dosya kartın izin listesinde değildir, IIP-11/IIP-12'de olduğu gibi
  **entegratör yayın işi** olarak yapıldı. `app/styles.css`, `app.js`, `sync.js`
  ve diğer `app/core/*` bu kartta değişmediğinden pinleri sabit kaldı.
- Sürümün **değerini** pinleyen fixture yoktur (yalnız `test_saygi_boundary.js`
  sıra kontrolü yapar: `quran.js < saygi.js < app.js`); `prayer.js` sürümünü
  hiçbir fixture pinlemiyor. Bump sonrası etkilenen 10 fixture'ın tamamı PASS.

## Determinizm sabitleri

| Sabit | Değer | Kaynak |
|---|---|---|
| Tazelik eşiği | `PRAYER_STALE_HOURS = 48` | `prayer.js` |
| TR kutusu | en 35.6–42.4, boy 25.5–45.0 | `prayer.js` `prayerInTurkey` |
| `App.*` yüzey sayısı | **720** (yeni üye yok) | pinler değişmedi |
| Bağımlılık listeleri | `SAYGI_DEPENDENCIES` 15 · `PRAYER_DEPENDENCIES` 10 | fixture bekçisi |

## Sınır

Bu kanıt **ağsız, sentetik, headless**'tır. Gerçek tarayıcı, cihaz, ekran okuyucu
ve yayın doğrulaması içermez.
