# MON-D6 — Health güvenlik ve migration denetimi

Tarih: 2026-09-10
Dal: `premium-fx-gorsel-yuzey`
Öncül: MON-30 (`9a9fbda`)
Durum: **BLOKE — MON-31**
Kapsam: yalnız sentetik Node/VM kanıtı; üretim kodu, panel source'u ve gerçek veri değişmedi.

## Karar

MON-31 kapanmadı. Canonical migration fixture'ı normal/legacy/future kökler
için PASS verse de, kartın zorunlu genişletilmiş malformed health path denetimi
gerçek `SeymaState.getDay()` gövdesinde üç uyku alt yolunda TypeError üretiyor.
Halt protokolü gereği `migrate()` veya `getDay()` düzeltilmedi, panel source'una
dokunulmadı ve sonraki MON kartına geçilmedi.

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
| Uyku / `sleep` | PASS | **FAIL** | PASS | `sleep: 'bad'` için `r.sleep.med` erişimi TypeError. |
| Uyku geçişi / `sleep.windDown` | PASS | **FAIL** | PASS | `windDown: 'bad'` için `r.sleep.windDown.steps` yazımı TypeError. |
| Uyku geçiş adımları / `sleep.windDown.steps` | PASS | **FAIL** | PASS | `steps: 'bad'` için `in` operatörü TypeError. |
| Hareket / `movement` | PASS | PASS | PASS | Bozuk kök ve sayısal alt alanlar güvenli fallback alır. |
| Apple Health / `health` | PASS | PASS | PASS | Bozuk kök `emptyHealth()` şekline iner; normal değer korunur. |
| Magnezyum / `magnesium` | PASS | PASS | PASS | Kök ve alan tipleri default/allowlist ile normalize edilir. |
| Belirti / rahatsızlık | PASS | PASS | PASS | `symptoms`/`discomfort` kökleri ve temel nested alanlar no-break. |
| Beden / `body` | PASS | PASS | PASS | Boy/kilo listesi absent/malformed/normal root path'lerinde güvenli. |
| Tahlil / `labResults` | PASS | PASS | PASS | Kök dizi ve `{id, files}` kayıt allowlist'i korunur. |
| Döngü / `cycle` | PASS | PASS | PASS | `periods`, `avgCycle`, `avgPeriod` fallback'leri korunur. |

## Bulgunun kaynak kanıtı

`app/core/state.js:427-432` yalnızca falsy `r.sleep` kökünü yeniden kuruyor;
truthy fakat primitive `sleep`/`windDown`/`steps` değerlerini nesneye çevirmeden
nested alan yazıyor. Gerçek gözlenen hatalar:

```text
sleep: 'bad'                    → TypeError: Cannot create property 'med' on string 'bad'
sleep: {windDown: 'bad'}        → TypeError: Cannot create property 'steps' on string 'bad'
sleep: {windDown: {steps:'bad'}}→ TypeError: Cannot use 'in' operator to search for 'light' in bad
```

Bu sonuç migration davranışının değiştirilmesini veya yeni şema alanı
eklenmesini gerektiren bir güvenlik kararıdır; MON-31 çalışma sayfasındaki
`İzinli değişim: kod yok` sınırı içinde otomatik onarım yapılmadı.

## Sahiplik ve sync/panel sınırı

| Yüzey | Canlı sahip | Sonuç |
|---|---|---|
| Health hesap/görünüm registry | `app/core/health.js` / `SeymaHealth` | MON-29/30 sahipliği korunuyor; bu kartta değişmedi. |
| Migration/getDay | `app/core/state.js`, app.js shim | Health path bulgusu burada; state mutation davranışına dokunulmadı. |
| Sync | `sync.js` / `SeySync` | Faz10 sync **69/69**, fetch/write yok; sync source değişmedi. |
| Panel read-only projection | `panel/panelCoverageManifest.js` + `panel/panel.js` | P3 root-modules **35/35**; missing/malformed root alanlarında kart kırılmadı; panel source değişmedi. |

Panel kanıtı health kartı üretimini yeniden yazmaz; field yokluğunda root
projection'ın `missing`/`malformed` durumlarına düşmesini ve render'ın devam
etmesini doğrular. Bu nedenle panel PASS, `getDay()` malformed sleep bulgusunu
örtmez.

## Gate makbuzları

| Komut | Sonuç |
|---|---:|
| `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs` | **PASS — 60/60** |
| `node tests/app/test_faz10_sync.js` | **PASS — 69/69** |
| `node tests/panel/test_panel_p3_root_modules.js` | **PASS — 35/35** |
| `node .claude/skills/run-seyma/driver.mjs` | **PASS** |
| MON-31 genişletilmiş health absent/malformed/normal probe | **BLOCKED — malformed sleep path** |

Canonical B2 fixture'ının malformed örneği `reading` gibi alanları kapsıyor;
MON-31 health matrix'inin primitive `sleep` nested path'leri ayrı olarak
kanıtlandı. Bu ayrım nedeniyle canonical 60/60 sonucu MON-31 kabulünü tek
başına sağlamaz.

## Değişmezlik / sınırlar

- `migrate()` davranışı değiştirilmedi.
- `app/core/health.js`, `app.js`, `sync.js`, `panel/*`, CSS, settings schema,
  cache-bust ve dört FILES listesi değiştirilmedi.
- `SeymaHealth` state sahibi yapılmadı; `data`, `ui`, `dark`, `getDay` ve
  mutation/rebind sahipliği app.js/state sözleşmesinde kaldı.
- Gerçek kullanıcı verisi, token, browser, network, remote, push, merge, tag
  ve deploy kullanılmadı.
- Full regression ve kapanış commit'i fail-closed olarak çalıştırılmadı;
  önce malformed sleep blocker'ı çözülmelidir.

**Sonuç:** MON-31 `blockedPrompt` olarak kaydedilmelidir. Kullanıcı yönü
olmadan `getDay()` için onarım, migration davranışı değişikliği veya MON-32'ye
geçiş yapılmaz.
