# IIP-12 · source gate

## Kanıt komutları

Tam liste ve çıktılar: `commands.log` (**16 komut, hepsi exit 0**).

| Komut | Amaç | Exit |
|---|---|---|
| `node ilham-ibadet-premium-plan/tools/plan-check.mjs` | plan şema/DAG/ledger/kanıt zinciri | 0 |
| `node --check app/core/saygi.js` | üretim sözdizimi | 0 |
| `node --check app/core/render.js` | izinli ikinci dosya sözdizimi | 0 |
| `node --check app.js` | kabuk sözdizimi (değişmedi) | 0 |
| `node --check tests/app/test_iip_12.js` | fixture sözdizimi | 0 |
| `node tests/app/test_iip_12.js` | **REQ-023/024 · 92/92** | 0 |
| `node tests/app/test_saygi_boundary.js` | Saygı sınırı · 20/20 | 0 |
| `node tests/app/test_zikir_boundary.js` | zikir sınırı | 0 |
| `node tests/app/test_quran_boundary.js` | Kur’an sınırı | 0 |
| `node tests/app/test_iip_09.js` | IIP-09 mimari · 22/22 | 0 |
| `node tests/app/test_iip_10.js` | IIP-10 arama · 61/61 | 0 |
| `node tests/app/test_iip_11.js` | IIP-11 okuyucu · 55/55 | 0 |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | İlham & İbadet hub harness | 0 |
| `node .claude/skills/run-seyma/driver.mjs` | app.js render harness | 0 |
| `node tools/shell-inventory.mjs --gate` | kabuk satır bütçesi | 0 |
| `git -c core.fsmonitor=false diff --check` | boşluk/whitespace | 0 |

## Geniş regresyon

Kart, paylaşılan bir modülü (`app/core/saygi.js`) değiştirdiği için aile
tamamı koşuldu:

| Aile | Sonuç |
|---|---|
| `tests/app` | **62/62** |
| `tests/panel` | **23/23** |
| `tests/panel-v2` | **27/27** |
| `tests/quran` | **9/9** |
| `tests/reminders/run-reminder-smoke.mjs` | PASS |
| `driver.mjs` + `zikr-harness.mjs` | PASS |

## Kilitlenen çıktılar (regresyon sabitleri)

| Sabit | Değer | Kaynak |
|---|---|---|
| Saygı preview dump sha256 | `c69bee63eadfd109b8daa51b438e580ea6e88e7339356b21bfd534e0a853cf86` | `test_saygi_boundary.js` **değişmedi** |
| IIP-12 Bugün hub sha256 | `d40a7f8a76116d89d9a9686ed0e6fd6cf3cd1d5c87fae2fcafc7c8b4403f67e7` (926 bayt) | `test_iip_12.js` |
| `App.*` yüzey sayısı | **720** (yeni üye yok) | pinler değişmedi |

## Pinler: ne değişti, ne değişmedi

- **Sayı pinleri değişmedi.** IIP-11'in tersine bu kart **yeni `App.*` üyesi
  açmadı ve yeni CSS sınıfı yazmadı**; yüzey/atama/`onclick`/v3 sayıları sabit
  kaldı. `test_app_surface_*` ve `test_v3_welcome.js` fixture'larına
  dokunulmadı (hepsi PASS).
- **Sürüm pini değişti (entegratör işi).** `app/core/saygi.js` içeriği
  değiştiği için `index.html` içindeki tek `app/core/saygi.js` pini
  **`?v=20260921b` → `?v=20260921c`** yükseltildi (bu dosya kartın izin
  listesinde değildir; yayın entegratörü olarak yapıldı). `app/styles.css` ve
  `app.js` pinleri değişmedi, çünkü o iki dosya bu kartta değişmedi.
  Bump yapılmasaydı siteyi bu değişiklikten önce açmış bir tarayıcı yeni
  odak/Devam katmanını **görmezdi**.
- `test_saygi_boundary.js` sürümün **değerini** değil **sırasını** doğrular
  (`quran.js` < `saygi.js` < `app.js`), bu yüzden bump kırmadı — 20/20 PASS.
  Değeri pinleyen fixture yürütüldü: `20260921b` taşıyan 5 fixture başka
  asset'leri pinler ve hepsi PASS.

## Sınır

Bu kanıt **ağsız, sentetik, headless**'tır. Gerçek tarayıcı, cihaz, ekran okuyucu
ve yayın doğrulaması içermez.
