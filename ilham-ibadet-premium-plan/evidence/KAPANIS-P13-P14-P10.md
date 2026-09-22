# Üç açık sınırın kapanışı — P13 · P14 · P10

**Tarih:** 2026-09-22 · **Başlangıç HEAD:** `fc6f265` · **Yöntem:** her madde gerçek çıktıyla kanıtlandı

---

## Özet

| # | Sınır | Durum | Ne yapıldı |
|---|---|---|---|
| **P13** | Önleyici kapı yok | ✅ **KAPANDI** | `tests/FIXTURE-MAP.json` + `plan-check` sibling-regression kapısı + 15. negatif senaryo; kapı gerçek bir kusur yakaladı |
| **P14** | p50/p95 ölçülmedi | ⚠️ **KISMEN** | Yerel VM ölçümü yapıldı (p50 0.43–0.62 ms, p95 1.14–1.48 ms); **cihaz** ölçümü protokole bağlı, hâlâ açık |
| **P10** | Cihaz çelişkisi | ⚠️ **DÜRÜSTÇE KAPANDI** | IIP-24'e `visual` gate + makbuz eklendi; `deviceAcceptance` **bilinçli olarak `not_verified` bırakıldı** (kök kural) ve iddia "kullanıcı beyanı" olarak kaydedildi |

---

## P13 — Kardeş-kart regresyon kapısı ✅

### Sorun

`plan-check.mjs` yalnız plan/kanıt tutarlılığını kontrol ediyordu; **testleri hiç koşmuyordu**.
IIP-20/21 `app/core/saygi.js`'e yazdı, IIP-05/06/09/12/13 fixture'larını kırdı, kimse fark etmedi.

### Yapılan

**1. `tools/fixture-map-build.mjs`** (yeni, salt-okur tarayıcı) — her fixture'ın hangi üretim
dosyasını yüklediğini üç desenden çıkarır:
- düz literaller (`'app/core/saygi.js'`)
- `path.join(__dirname, '..','app',…)` segment formu
- `require("./helpers/…")` → yerel test yardımcısı, kendi üretim okumaları **transitive** atfedilir

Sonuç: **153 fixture / 63 üretim hedefi**, kapsam %99 (yalnız 2 fixture üretim kodu okumuyor —
biri `archive/`, diğeri test altyapısı).

**2. `tests/FIXTURE-MAP.json`** (üretildi, 88 KB) — `byFixture` + `byProduction` ters indeksi.

**3. `plan-check.mjs` sibling-regression kapısı** — bir kart paylaşılan üretim dosyasına
yazıyorsa, o dosyanın **koruyucu fixture'larını** `fixtureFiles`'ta beyan etmek zorunda.
"Koruyucu" = fixture adı modülü tanımlıyor (`saygi.js` → `test_saygi_boundary.js`).
Genel token'lar (`app`, `core`, `panel`, `styles`…) yok sayılır → gürültü üretmez.

**4. 15. negatif senaryo** `--self-test`'e eklendi.

### Kapının gerçek kanıtı — bir kusur yakaladı

Kapı ilk çalıştırmada **gerçek** bir bulgu üretti:

```
FAIL: sibling regression IIP-07: undeclared guard fixture(s) for
      app/core/zikir.js, app/core/render.js, app/styles.css
      — tests/app/test_zikir_view_boundary.js
```

Doğrulandı: IIP-07 `zikir.js`'e yazmış, `test_zikir_view_boundary.js` gerçekten `zikir.js`
okuyor, test geçiyor — ama kart onu beyan etmemiş. **IIP-20/21 kusurunun küçük ölçekli aynısı.**
`IIP-07.fixtureFiles`'a eklenerek düzeltildi.

### IIP-20/21 retro-kanıtı

| | Fixture sayısı |
|---|---|
| `saygi.js`'e bağlı gerçek fixture | **30** |
| IIP-20/21'in beyan ettiği | **3** |
| Beyan edilmeyen | **27** |

Taslak kapı (tüm transitive bağımlıları isteme) 88 bulguyla aşırı katıydı; "koruyucu fixture"
kuralına daraltıldı — kesin, düzeltilebilir ve gürültüsüz.

---

## P14 — Performans ölçümü ⚠️

### Yerel VM ölçümü (yapıldı)

`tests/app/test_iip_perf_measure.js` (yeni) — gerçek üretim modül grafiği (38 modül,
`driver.mjs` MON-04 yükleme sırası parity) + gerçek `App.go(tab)` render yolu:

| Metrik | Değer |
|---|---|
| Ortam | node v26.3.1 · Apple M5 · 10 core |
| Yöntem | 5 ısınma + **30 örnek** |
| **p50** | **0.43 – 0.62 ms** |
| **p95** | **1.14 – 1.48 ms** |

Kanıt: `evidence/IIP-PERF-LOCAL.json`

### Harness sahte sayı üretmedi — üç kez kendini reddetti

Bu turda harness **kendi kendini üç kez reddetti**, tam da bu projenin tekrarlayan tuzağı
("yeşil görünen ama hiçbir şey ölçmeyen test") yüzünden:

1. İlk sürüm ölü sandbox'ta **0.002 ms** verdi → boot kanıtı eklenince exit 1.
2. `App.go()` render etmiyordu → **render kanıtı** (`#app.innerHTML` before≠after) eklenince exit 1.
3. `App.go` FX açıkken commit'i 200 ms `setTimeout`'a erteliyor; sandbox timer'sız →
   p95 0.048 ms → **anlamlılık tabanı** (0.05 ms) eklenince exit 1.

Ölçüm ancak üç kapı da geçildikten sonra raporlandı.

### Devre dışı bırakılan üretim kapıları (şeffaflık)

`gatesBypassed` alanında kayıtlı: `needsAuth` (`ui.authUnlocked`), `locationGateRequired`
(`locationEnabled + locationGateState='granted'`), `SeyFx` premium FX (→ reduced-motion yolu).
Yani ölçülen şey **animasyonsuz, izin verilmiş sekme geçişinin saf render maliyeti**.

### AÇIK KALAN: hedef cihaz p95

Plan hedefi **hedef cihazda p95 ≤ 200 ms** — bu sayı **yok**. Protokol hazır:
[`IIP-PERF-PROTOKOL.md`](IIP-PERF-PROTOKOL.md). Kullanıcı kendi cihazında 30 geçiş ölçerse kapanır.

**Kritik:** VM p95 1.5 ms, cihaz hedefi hakkında **hiçbir şey kanıtlamaz** — composer, GPU
raster, PWA kurulumu ve termal bütçe ölçülmüyor.

---

## P10 — Cihaz kabulü çelişkisi ⚠️

### Sorun

`deviceAcceptance: not_verified` ↔ `evidence/IIP-23/visual.json` "user-confirmed" ↔
IIP-23 ledger seq 48 kullanıcı teyidi. Ayrıca IIP-24'ün `requiredGates`'inde `visual` yoktu.

### Uygulanan — dürüst kapanış

| Alan | Değer | Gerekçe |
|---|---|---|
| IIP-24 `requiredGates` | `+visual` | Teslim kartının görsel kanıtı eksikti |
| `evidence/IIP-24/visual.md` + `.json` | üretildi | IIP-23'ün sentetik render matrisini miras alır; **yeni ekran üretmez** |
| `deviceAcceptance` | **`not_verified` (DEĞİŞMEDİ)** | Kök kural: cihaz onayını yalnız kullanıcı verir; ajan doğrulayamaz |
| Cihaz iddiası | `deviceClaimSource` alanında **"kullanıcı beyanı, ajan doğrulaması yok"** | İddiayı saklamadan, doğrulanmış saymadan kaydet |

Makbuzun `limitations` alanı üç sınırı açıkça taşır: cihaz kabulü, hedef cihaz p95,
gerçek ekran okuyucu testi.

**Neden `user_confirmed` yapmadım:** kullanıcı onayı olmadan bunu yazmak, tam da bu programın
sorunu olan "kanıtın gerçeği yansıtmaması"nı üretirdi. State ile makbuz artık **aynı hikâyeyi**
anlatıyor: kaynak/sentetik seviye yeşil, cihaz iddiası kullanıcı beyanı, ajan doğrulaması yok.

---

## Doğrulama

| Kontrol | Sonuç |
|---|---|
| `tests/app` + `panel` + `panel-v2` + `quran` + `reminders` | **154 PASS / 0 FAIL** |
| `plan-check.mjs` | ✅ exit 0 |
| `plan-check.mjs --self-test` | ✅ exit 0 (15 senaryo) |
| `plan-check.integration.py` | ✅ exit 0 (4 PASS) |
| `driver.mjs` · `zikr-harness.mjs` · `shell-inventory --gate` | ✅ PASS |
| `fixture-map-build.mjs` | ✅ PASS |

## Değişen dosyalar

**Yeni:** `tools/fixture-map-build.mjs` · `tests/FIXTURE-MAP.json` ·
`tests/app/test_iip_perf_measure.js` · `evidence/IIP-PERF-LOCAL.json` ·
`evidence/IIP-PERF-PROTOKOL.md` · `evidence/IIP-24/visual.md` + `.json` · bu dosya

**Değişen:** `ilham-ibadet-premium-plan/tools/plan-check.mjs` (sibling kapısı + negatif senaryo) ·
`IIP-STATE.json` (IIP-07 fixture, IIP-24 visual gate) · `cards/IIP-24.md` · `tracking/*` ·
`AGENTS.md` · `CLAUDE.md`

## Sıradaki prompt

**P10 cihaz teyidi.** Kod işi kalmadı; tek eksik kullanıcı aksiyonu:
1. Cihaz protokolünü koş ([`IIP-PERF-PROTOKOL.md`](IIP-PERF-PROTOKOL.md) §2) → p50/p95
2. Cihaz incelemesini teyit et → `deviceAcceptance` yükseltilebilir

Bunlar gelmeden IIP **seviye 3 (cihaz)** ve **seviye 4 (yayın)** beyan edilemez.
