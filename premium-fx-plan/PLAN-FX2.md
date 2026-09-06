# FX-2 — "Hissedilir Premium" Programı

**Sürüm:** 1.0 · **Tarih:** 2026-09-06 · **Dal:** `premium-fx-gorsel-yuzey`
**Ön koşul:** [`TESHIS.md`](TESHIS.md) okunmuş olmalı.
**Kural:** LOCAL-ONLY — push/merge/deploy yok
([`LOCAL-ONLY-IMPLEMENTATION.md`](LOCAL-ONLY-IMPLEMENTATION.md)).

---

## 1. FX-1'den Farkı (tek tabloda)

| | FX-1 (91 prompt) | FX-2 (20 prompt) |
|---|---|---|
| Birim | API yüzeyi | **Kapsanan etkileşim sayısı** |
| Bağlama | Handler başına elle | **Tek delege katman** |
| Bitti tanımı | Fixture yeşil | Fixture yeşil **+ kapsam raporu yükseldi** |
| Ses | Ham osilatör | Filtreli/harmonikli/reverb'lü enstrüman |
| Haptik | `navigator.vibrate` | Çok kanallı (ses+görsel+titreşim) |
| Hareket | Serpiştirilmiş | Token sistemi + tek geçiş motoru |
| Varsayılan | 4 özellik kapalı | Kapalı gelen özellik yok sayılır |

---

## 2. Değişmezler (I1–I8) — her prompt için bağlayıcı

- **I1** `data` şeması yalnız `settings.*` altına **ek** alan alır.
- **I2** `App.<ad>` yüzeyi yalnız **eklenir**; mevcut hiçbir handler'ın imzası
  veya gövde davranışı değişmez.
- **I3** `migrate()` eklemeleri **idempotent + additive** (`typeof`/`==null`
  guard'lı), `createDefaultData` ile simetrik.
- **I4** `save()`, `sync.js`, `sanitize()`, GitHub Contents API akışı ve
  `localStorage` anahtarı (`seyma-reset-v1`) **davranış olarak** değişmez.
- **I5** Tek `app.js`; IIFE + `window.*` deseni korunur (build yok).
- **I6** `prefers-reduced-motion: reduce` her hareket/ses yolunda saygı görür.
- **I7 (YENİ)** Hiçbir FX `render()`'ın çıktısını, `paint()` sözleşmesini veya
  scroll/odak restorasyonunu bozmaz.
- **I8 (YENİ)** Hiçbir FX ana iş parçacığında 4 ms'ten uzun senkron iş yapmaz;
  animasyon yalnız `transform`/`opacity`/`filter` üzerinden.

---

## 3. Yürütme Sözleşmesi (S1–S8)

- **S1** Promptlar **sırayla** çalıştırılır; atlama yok.
- **S2** Her prompt tek bir konuya dokunur; kapsam dışı dosya değiştirilmez.
- **S3** Her prompt sonunda: `node --check` → `driver.mjs` → ilgili fixture →
  `tools/fx-coverage.mjs`.
- **S4** Her prompt kendi cache-bump'ını yapar (`index.html` `?v=`).
- **S5** Değişmezlik kanıtı: `App.*` sayısı, `onclick` sayısı, tek `app.js`.
- **S6** `.anti-amnesia/{LEDGER.md, CURRENT-STATE.md, FX2-STATE.json}` **aynı
  commit içinde** güncellenir.
- **S7** Yerel commit: `fx2: FX2-P-NN <kısa Türkçe özet>`. Push yok.
- **S8** Bir prompt kapsam sayısını yükseltemiyorsa **BLOKLU** işaretlenir ve
  seri durur; "yaptım ama ölçülemiyor" kabul edilmez.

---

## 4. Dalgalar

### Dalga 0 — Ölçüm ve Sözleşme (FX2-P-01…02)
Ölçemeden düzeltmeye başlamayacağız.

| Kart | İş | Kapsam hedefi |
|---|---|---|
| **FX2-P-01** | `tools/fx-coverage.mjs` — kapsam denetçisi + taban çizgisi JSON | araç var, taban kaydedildi |
| **FX2-P-02** | Hareket token sistemi (`--dur-*`, `--ease-*`, `--elev-*`, spring) | token %100 tanımlı, davranış değişmez |

### Dalga 1 — Dokunma Katmanı (FX2-P-11…15) ⭐ en yüksek etki
Tek delege edilmiş pointer katmanı; 361 buton tek seferde kapsanır.

| Kart | İş | Kapsam hedefi |
|---|---|---|
| **FX2-P-11** | `SeyTouch` — `#root` üzerinde delege `pointerdown/up/cancel`; `innerHTML` yeniden kurulumundan sağ çıkar | kapsanan buton ≥ %95 |
| **FX2-P-12** | `.sey-press` basma durumu CSS'i (scale + parlaklık + gölge), sınıf JS'ten takılır, markup değişmez | görsel geri bildirim ≥ %95 |
| **FX2-P-13** | Ripple'ı delege katmana bağla; `.sey-ripple` konteyneri runtime'da takılır | ripple çalışan buton ≥ %90 |
| **FX2-P-14** | Niyet haritası: `data-fx="nav\|confirm\|destructive\|toggle\|open\|close"` — anlamına göre farklı geri bildirim | ≥ 40 yüksek değerli eylem etiketli |
| **FX2-P-15** | Kapsam fixture'ı `test_fx2_touch_coverage.js` — eşik altına düşerse FAIL | eşik CI'da kilitli |

### Dalga 2 — Ses Kimliği v2 (FX2-P-21…24)
Bip'ten enstrümana.

| Kart | İş | Kapsam hedefi |
|---|---|---|
| **FX2-P-21** | Ses motoru: master bus → kompresör → algoritmik reverb → limiter; ADSR, lowpass, ±cents detune, velocity jitter, polifoni sınırı | klipleme 0, gecikme < 10 ms |
| **FX2-P-22** | Ses paleti v2: `tick/tap/toggleOn/toggleOff/nav/sheetOpen/sheetClose/success/bell/warning/error` — aynı enstrüman ailesi | 11 ses, hepsi bağlı |
| **FX2-P-23** | iOS ses kilidi: ilk `pointerdown`'da `resume()` + sessiz buffer; `visibilitychange`'de suspend | ilk dokunuşta ses ≥ %99 |
| **FX2-P-24** | `test_fx2_audio_engine.js` — graf şekli, gating matrisi, quiet-time | fixture yeşil |

### Dalga 3 — Hareket Sistemi (FX2-P-31…34)
Ekranlar arasında süreklilik.

| Kart | İş | Kapsam hedefi |
|---|---|---|
| **FX2-P-31** | Sekme geçiş motoru: `paint()` çevresine çıkış→swap→giriş (çift rAF); `render()` sözleşmesi değişmez | 7 sekmenin 7'si |
| **FX2-P-32** | Overlay/sheet hareketi: yaylı giriş, backdrop blur rampası, **DOM silinmeden önce çıkış animasyonu** | 13 overlay'in ≥ 10'u |
| **FX2-P-33** | Liste/kart stagger: markup'ta `style="--i:N"`, animasyon CSS'te — JS düğüm gezmez | ≥ 8 liste yüzeyi |
| **FX2-P-34** | Sayaç/halka canlandırma: `countUp` tüm hero istatistiklerine, ring'e `stroke-dashoffset` geçişi | 1 → ≥ 8 sayaç |

### Dalga 4 — Malzeme ve Atmosfer (FX2-P-41…43)
Derinlik gerçekten görünsün.

| Kart | İş | Kapsam hedefi |
|---|---|---|
| **FX2-P-41** | Elevation skalası: katmanlı gölge + iç ışık + `color-mix` kenar; `.surface:active` kart-küçültme hatası düzeltilir | 70 `.surface` tutarlı |
| **FX2-P-42** | Zaman teması v2: `--page`/`--bg`/`--card` gerçek gradient kayması + 800 ms crossfade | 2 eleman → tüm zemin |
| **FX2-P-43** | Aurora v2: scroll parallax + grain overlay, `premiumAtmosphere` kapalıyken tam sönük | GPU katmanı ≤ 2 |

### Dalga 5 — Varsayılanlar ve Kapanış (FX2-P-51…53)

| Kart | İş | Kapsam hedefi |
|---|---|---|
| **FX2-P-51** | Varsayılan denetimi: `launchRitual` gerçek ritüelle açılır; anahtarsız kullanıcıda ses katmanı sessiz kalmaz | kapalı-gelen premium özellik = 0 |
| **FX2-P-52** | Tam regresyon + kapsam raporu (öncesi/sonrası tablo) | 0 FAIL, kapsam hedefleri tutmuş |
| **FX2-P-53** | Kapanış belgesi + doküman senkronu + CLAUDE.md/AGENTS.md yönlendirmesi | belgeler tutarlı |

---

## 5. Kabul Eşikleri (seri bunlarla kapanır)

| Metrik | Taban (2026-09-06) | Hedef |
|---|---:|---:|
| Basma geri bildirimi alan buton | 0 / 361 | **≥ 343 (%95)** |
| Ses çıkaran etkileşim | ~13 | **≥ 200** |
| Ripple çalışan buton | 0 | **≥ 325 (%90)** |
| Canlandırılan sayaç | 1 | **≥ 8** |
| Çıkış animasyonu olan overlay | 0 / 13 | **≥ 10** |
| Kapalı gelen premium özellik | 4 | **0** |
| iOS'ta hissedilen geri bildirim kanalı | 0 | **≥ 2** (ses + görsel) |
| Premium fixture | 9/9 | **9/9 + 3 yeni** |

---

## 6. Yapılmayacaklar (kapsam çitleri)

- `render()` yeniden yazılmayacak, sanal DOM getirilmeyecek.
- `addEventListener` tabanlı bir bileşen çatısı kurulmayacak; inline
  `onclick="App.x()"` deseni korunacak (delege katman **ek** bir yoldur).
- 361 buton elle sınıflandırılmayacak (FX-1'in hatası).
- Harici kütüphane, ses dosyası, font veya CDN eklenmeyecek.
- `panel.html` / `panel-v2.html` bu seride **kapsam dışı**.
- FX-1'in ertelenmiş FX-P-66/67 kartları canlandırılmayacak.

---

## 7. Sıradaki İş

`.prompts/FX2-KATALOG.md` → **FX2-P-01** ile başla.
Durum makinesi: [`.anti-amnesia/FX2-STATE.json`](.anti-amnesia/FX2-STATE.json)
