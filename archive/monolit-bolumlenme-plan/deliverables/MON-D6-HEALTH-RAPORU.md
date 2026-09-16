# MON-D6 — Health güvenlik ve migration denetimi

Tarih: 2026-09-10
Dal: `premium-fx-gorsel-yuzey`
Öncül: MON-30 (`9a9fbda`)
Durum: **TAMAMLANDI — LOCAL-ONLY**
Kapsam: yalnız sentetik Node/VM kanıtı; gerçek kullanıcı verisi, panel source'u,
sync ve remote yüzey değişmedi.

## Karar

MON-31 kapanmıştır. İlk denetimde bulunan üç malformed sleep TypeError yolu,
yalnız `app/core/state.js` içindeki `getDay()` normalizasyonunda kök/alt kök
object ve array guard'ları güçlendirilerek kapatıldı. `migrate()` davranışı,
panel source'u, veri şeması ve sync davranışı değiştirilmedi. Aynı üç fixture
varyantı canonical B2 migration kanıtına eklendi; registry/shim parity ve
normal alan korunumu PASS'tir.

## Health alt alanı matrisi

Fixture'lar gerçek `app/core/state.js` içindeki `window.SeymaState` registry'sini
Node VM'de yükledi. Her satır aynı gün kaydı için alanı (a) yok, (b) yanlış kök
tipte, (c) geçerli normal değerde çalıştırır; fetch, storage, browser ve gerçek
veri yoktur. `PASS`, kayıt çökmeyip beklenen fallback/koruma yoluna girdiğini
gösterir.

| Alt alan | Absent | Malformed | Normal | Not |
|---|---:|---:|---:|---|
| Beslenme / `mealItems` | PASS | PASS | PASS | Eksik veya dizi olmayan öğün listeleri boş listeye iner. |
| Su / `water` | PASS | PASS | PASS | Sayısal olmayan değer `0` olur. |
| Kafein / `caffeine` | PASS | PASS | PASS | Bozuk kök fallback alır; geçerli `drinks` ve `cups` korunur. |
| Uyku / `sleep` | PASS | PASS | PASS | Primitive kök güvenli sleep şekline alınır; normal alanlar korunur. |
| Uyku geçişi / `sleep.windDown` | PASS | PASS | PASS | Primitive alt kök `emptyWindDown()` ile güvenle tamamlanır. |
| Uyku geçiş adımları / `sleep.windDown.steps` | PASS | PASS | PASS | Primitive/array adımlar güvenli step map'ine alınır. |
| Hareket / `movement` | PASS | PASS | PASS | Bozuk kök ve sayısal alt alanlar güvenli fallback alır. |
| Apple Health / `health` | PASS | PASS | PASS | Bozuk kök `emptyHealth()` şekline iner; normal değer korunur. |
| Magnezyum / `magnesium` | PASS | PASS | PASS | Kök ve alan tipleri default/allowlist ile normalize edilir. |
| Belirti / rahatsızlık | PASS | PASS | PASS | `symptoms`/`discomfort` kökleri ve temel nested alanlar no-break. |
| Beden / `body` | PASS | PASS | PASS | Boy/kilo listesi absent/malformed/normal root path'lerinde güvenli. |
| Tahlil / `labResults` | PASS | PASS | PASS | Kök dizi ve `{id, files}` kayıt allowlist'i korunur. |
| Döngü / `cycle` | PASS | PASS | PASS | `periods`, `avgCycle`, `avgPeriod` fallback'leri korunur. |

## Uygulanan dar onarım

`app/core/state.js` içindeki `getDay()` şu üç yolu artık açıkça doğrular:

- `sleep` kökü object değilse veya array ise güvenli sleep default'u,
- `sleep.windDown` kökü object değilse veya array ise `emptyWindDown()`,
- `sleep.windDown.steps` object değilse veya array ise güvenli step map'i.

Geçerli `hours`, `quality`, `med`, mevcut step değerleri ve bilinmeyen nested
alanlar korunur; yalnız malformed shape yeniden kurulur. `WIND_DOWN_STEPS`
allowlist'i ve app.js shim sözleşmesi aynı kalır.

## Sahiplik ve sync/panel sınırı

| Yüzey | Canlı sahip | Sonuç |
|---|---|---|
| Health hesap/görünüm registry | `app/core/health.js` / `SeymaHealth` | MON-29/30 sahipliği korunuyor; bu kartta değişmedi. |
| Migration/getDay | `app/core/state.js`, app.js shim | Yalnız `getDay()` malformed shape guard'ı güçlendirildi; `migrate()` değişmedi. |
| Sync | `sync.js` / `SeySync` | Faz10 sync **69/69**, fetch/write yok; sync source değişmedi. |
| Panel read-only projection | `panel/panelCoverageManifest.js` + `panel/panel.js` | P3 root-modules **35/35**; missing/malformed root alanlarında kart kırılmadı; panel source değişmedi. |

Panel kanıtı health kartı üretimini yeniden yazmaz; field yokluğunda root
projection'ın `missing`/`malformed` durumlarına düşmesini ve render'ın devam
etmesini doğrular. `getDay()` sleep yolları ayrıca canonical B2 fixture'ında
doğrudan registry/shim ile sınanmıştır.

## Gate makbuzları

| Komut | Sonuç |
|---|---:|
| `node --check app.js sync.js app/core/state.js app/core/health.js` | **PASS** |
| `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs` | **PASS — 67/67** |
| `node tests/app/test_faz10_sync.js` | **PASS — 69/69** |
| `node tests/panel/test_panel_p3_root_modules.js` | **PASS — 35/35** |
| `node .claude/skills/run-seyma/driver.mjs` | **PASS** |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | **PASS — 95/95** |
| state helper/adaptor, rebind, modularization boundaries | **PASS** |
| tam `tests/app` ailesi | **PASS — exit 0** |
| tam `tests/panel` + legacy Faz11 ailesi | **PASS — exit 0** |
| Panel-v2, Quran ve reminder smoke aileleri | **PASS — exit 0** |
| `git diff --check` | **PASS** |

Canonical B2 fixture'ına üç malformed sleep kökü için doğrudan `getDay()`
çökmeme + registry/shim güvenli şekil/parity kanıtları ve bir normal sleep
koruma assertion'ı eklendi. Sonuç 67/67 PASS'tir.

## Değişmezlik / sınırlar

- `migrate()` davranışı değiştirilmedi; yeni şema alanı eklenmedi.
- `app/core/health.js`, `app.js`, `sync.js`, `panel/*`, CSS ve settings schema
  değiştirilmedi.
- `app/core/state.js` zaten dört FILES/load-order zincirinde bulunduğu için
  yeni FILES üyesi eklenmedi; yalnız `index.html` state cache-bust'i
  `state.js?v=20260910b` oldu.
- `SeymaHealth` state sahibi yapılmadı; `data`, `ui`, `dark`, `getDay` ve
  mutation/rebind sahipliği app.js/state sözleşmesinde kaldı.
- Gerçek kullanıcı verisi, token, browser, network, remote, push, merge, tag
  ve deploy kullanılmadı.
- Kanıt seviyesi source + sentetik headless regression'dır; browser/device ve
  deployment kabulü yapılmamıştır.

**Sonuç:** MON-31 başarıyla kapatıldı. State `in_progress`, `blockedPrompt`
yok, sıradaki plan kartı MON-32'dir; MON-32 bu kullanıcı yönünün kapsamı
değildir ve başlatılmamıştır.
