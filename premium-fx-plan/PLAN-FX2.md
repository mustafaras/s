# FX-2 — "Hissedilir Premium" Programı

**Sürüm:** 2.0 · **Tarih:** 2026-09-06 · **Dal:** `premium-fx-gorsel-yuzey`
**Kart sayısı:** 28 (FX2-01 … FX2-28), 8 dalga, kesintisiz sıralı
**Ön koşul:** [`TESHIS.md`](TESHIS.md) okunmuş olmalı.
**Kural:** LOCAL-ONLY — push/merge/deploy yok
([`LOCAL-ONLY-IMPLEMENTATION.md`](LOCAL-ONLY-IMPLEMENTATION.md)).

---

## 1. Bu Seri Neyi Farklı Yapıyor

| | FX-1 (91 prompt) | FX-2 (28 kart) |
|---|---|---|
| Birim | API yüzeyi | **Kapsanan etkileşim sayısı** |
| Bağlama | Handler başına elle (715'in ~25'i) | **Tek delege katman** (361 buton) |
| Bitti tanımı | Fixture yeşil | Fixture yeşil **+ kapsam raporu yükseldi** |
| Ses | Ham osilatör ("bip") | Filtreli/harmonikli/reverb'lü enstrüman |
| Haptik | `navigator.vibrate` (iOS'ta ölü) | Çok kanallı (ses + görsel + titreşim) |
| Renk | 5 dağınık aile, pembe yabancı | **Şampanya altını + füme, 2 aile** |
| Arka plan | Sabit; hava modu bloklanmış | **192 kombinasyonlu canlı zemin** |
| Hareket | Serpiştirilmiş | Token sistemi + tek geçiş motoru |
| Varsayılan | 4 özellik kapalı | Kapalı gelen premium özellik yok |
| Kart formatı | Belgeye atıflı | **Kendi kendine yeten, kopyala-uygula** |

---

## 2. Değişmezler (I1–I8) — her kart için bağlayıcı

- **I1** `data` şeması yalnız `settings.*` altına **ek** alan alır.
- **I2** `App.<ad>` yüzeyi yalnız **eklenir**; mevcut hiçbir handler'ın imzası
  veya gövde davranışı değişmez.
- **I3** `migrate()` eklemeleri **idempotent + additive** (`typeof`/`==null`
  guard'lı), `createDefaultData` ile simetrik.
- **I4** `save()`, `sync.js`, `sanitize()`, GitHub Contents API akışı ve
  `localStorage` anahtarı (`seyma-reset-v1`) **davranış olarak** değişmez.
- **I5** Tek `app.js`; IIFE + `window.*` deseni korunur (build yok).
- **I6** `prefers-reduced-motion: reduce` her hareket/ses yolunda saygı görür.
- **I7** Hiçbir FX `render()`'ın çıktısını, `paint()` sözleşmesini veya
  scroll/odak restorasyonunu bozmaz.
- **I8** Ana iş parçacığında 4 ms'ten uzun senkron iş yok; animasyon yalnız
  `transform` / `opacity` / `filter`.

---

## 3. Yürütme Sözleşmesi (S1–S8)

- **S1** Kartlar **sırayla**: FX2-01 → FX2-28. Atlama yok.
- **S2** Her kart tek konuya dokunur; "Dokunma" listesindeki dosya açılmaz.
- **S3** Her kart sonunda: `node --check` → `driver.mjs` → ilgili fixture →
  `tools/fx-coverage.mjs`.
- **S4** Her kart kendi cache-bump'ını yapar (`index.html` `?v=`).
- **S5** Değişmezlik kanıtı: `App.*` = 717, `onclick` = 391, tek `app.js`.
- **S6** `.anti-amnesia/{LEDGER.md, CURRENT-STATE.md, FX2-STATE.json}` **aynı
  commit içinde** güncellenir.
- **S7** Yerel commit: `fx2: FX2-NN <kısa Türkçe özet>`. Push yok.
- **S8** Kart hedef metriğini yükseltemiyorsa **BLOKLU** işaretlenir ve seri
  durur; "yaptım ama ölçülemiyor" kabul edilmez.

---

## 4. Dalgalar (28 kart)

### Dalga 0 — Ölçüm ve Token (FX2-01…02)
Ölçemeden düzeltmeye başlamayacağız.

| Kart | İş | Hedef |
|---|---|---|
| **01** | `tools/fx-coverage.mjs` — kapsam denetçisi + taban çizgisi | araç kurulur |
| **02** | Hareket + renk token iskeleti (`--dur-*`, `--ease-*`, `--elev-*`, `--accent-soft`) | M7 → 0,45 |

### Dalga 1 — Renk Kimliği (FX2-03…05) 🎨
**Öne alındı:** tek dokunuşta en görünür değişim, salt CSS, en düşük risk.

| Kart | İş | Hedef |
|---|---|---|
| **03** | Pembe → **Şampanya Altını**; `--page` gradienti fildişi/kum/inci | **M10 → 0** |
| **04** | Altın aile birleştirme (`--learn`, aurora halkası, `--accent-soft` yayılımı) | **M11 → ≤2** |
| **05** | Kontrast + tema fixture'ı (8 kombinasyon ≥ 4,5:1) | M13 8/8 |

### Dalga 2 — Dokunma Katmanı (FX2-06…10) ⭐
Serinin en yüksek etkili dalgası: 361 buton tek seferde kapsanır.

| Kart | İş | Hedef |
|---|---|---|
| **06** | `SeyTouch` — `#root` üzerinde delege pointer katmanı | **M2 → ≥%95** |
| **07** | `.sey-press` basma durumu + `.surface:active` hatası düzeltmesi | M2 görsel |
| **08** | Ripple'ı delege katmana bağla, konteyner runtime'da takılır | **M4 → ≥%90** |
| **09** | Niyet haritası `data-fx` (nav/open/close/toggle/confirm/destructive) | ≥40 etiket |
| **10** | Dokunma kapsamı fixture'ı — eşiği kilitle | eşik CI'da |

### Dalga 3 — Ses Kimliği (FX2-11…14) 🔊

| Kart | İş | Hedef |
|---|---|---|
| **11** | Ses motoru v2: bus → kompresör → reverb → limiter, ADSR, detune | klipleme 0 |
| **12** | Ses paleti v2 — 11 ses; `bell` 6 inharmonik parsiyel; `tap` 45 ms | **M3 → ≥200** |
| **13** | iOS ses kilidi (`{once:true}`) + `visibilitychange` | **M9 → ≥2** |
| **14** | Ses motoru fixture'ı (sahte `AudioContext`, graf doğrulama) | fixture yeşil |

### Dalga 4 — Hareket Sistemi (FX2-15…18)

| Kart | İş | Hedef |
|---|---|---|
| **15** | Sekme geçiş motoru (çıkış → swap → giriş, timeout ağlı) | 7/7 sekme |
| **16** | Overlay giriş/çıkış hareketi (`SeyFx.sheetClose`) | **M6 → ≥10** |
| **17** | Stagger sistemi (`--i`, CSS ile, JS düğüm gezmez) | ≥8 yüzey |
| **18** | Sayaç + halka canlandırma (`data-countup`, `sweepCounters`) | **M5 → ≥8** |

### Dalga 5 — Canlı Zemin (FX2-19…23) 🌦️
**Kullanıcının kaybolduğunu söylediği iş.** Hava verisi zaten `data.weather`
içinde — yeni ağ çağrısı yok.

| Kart | İş | Hedef |
|---|---|---|
| **19** | `SeyAmbience` çekirdeği — saf `scene()` + `apply()`, 3 katmanlı sınıf | motor kurulur |
| **20** | Güneş saati: gerçek `sunrise`/`sunset` ile 4 zaman sahnesi + fallback | 4 sahne |
| **21** | **Hava modu**: WMO kodu → 8 sahne (yağmur/kar/sis/fırtına…), şiddet `precip`/`wind`'den | 8 sahne |
| **22** | Mevsim + özel gün sahneleri + `--amb-seed` günlük varyasyon | 6 sahne, **M12 ≥18** |
| **23** | Zemin fixture'ı + performans + kontrast kapısı | 192 kombinasyon güvenli |

### Dalga 6 — Malzeme ve Derinlik (FX2-24…25)

| Kart | İş | Hedef |
|---|---|---|
| **24** | Elevation skalası uygulaması (katmanlı gölge + iç ışık) | **M7 → ≥0,80** |
| **25** | Aurora v2 — scroll parallax + grain, altın halkalı | GPU katmanı ≤2 |

### Dalga 7 — Varsayılanlar ve Kapanış (FX2-26…28)

| Kart | İş | Hedef |
|---|---|---|
| **26** | Varsayılan denetimi (`launchRitual`, `voiceLocalFallback` açılır) | **M8 → 0** |
| **27** | Tam regresyon + kapsam raporu (öncesi/sonrası) | 0 FAIL |
| **28** | Kapanış + doküman senkronu + `CLAUDE.md`/`AGENTS.md` | tutarlılık |

---

## 5. Kabul Eşikleri (seri bunlarla kapanır)

| Metrik | Taban | Hedef | Dalga |
|---|---:|---:|---|
| M2 basma geri bildirimi alan buton | 0 / 361 | **≥ 343** | 2 |
| M3 ses çıkaran etkileşim | 13 | **≥ 200** | 2–3 |
| M4 ripple çalışan buton | 0 | **≥ 325** | 2 |
| M5 canlandırılan sayaç | 1 | **≥ 8** | 4 |
| M6 çıkış animasyonlu overlay | 0 / 13 | **≥ 10** | 4 |
| M7 hareket token uyumu | 0,21 | **≥ 0,80** | 0–6 |
| M8 kapalı gelen premium ayar | 4 | **0** | 7 |
| M9 iOS geri bildirim kanalı | 0 | **≥ 2** | 2–3 |
| **M10 pembe token** | 11 | **0** | 1 |
| **M11 palet ailesi** | 5 | **≤ 2** | 1 |
| **M12 canlı zemin sahnesi** | 0 | **≥ 18** | 5 |
| **M13 kontrast (8 kombinasyon)** | 8/8 | **8/8** | 1, 5 |

---

## 6. Yapılmayacaklar (kapsam çitleri)

- `render()` yeniden yazılmayacak, sanal DOM getirilmeyecek.
- `addEventListener` tabanlı bileşen çatısı kurulmayacak; inline
  `onclick="App.x()"` deseni korunacak (delege katman **ek** bir yoldur).
- 361 buton elle sınıflandırılmayacak (FX-1'in hatası).
- Harici kütüphane, CDN, ses dosyası, font, görsel **eklenmeyecek**.
- Canlı zemin için **yeni ağ çağrısı yapılmayacak** — `data.weather` yeter.
- Yağmur/kar **DOM parçacığı** ile yapılmayacak (gradient + tek transform).
- `--kandil`, `--warn`, `--read`/`--watch`/`--listen` renklerine dokunulmayacak.
- `panel.html` / `panel-v2.html` bu seride kapsam dışı.
- `MODULARIZATION.md` değiştirilmeyecek (`test_modularization_boundary.js`
  içeriğine bağlı).
- FX-1'in ertelenmiş FX-P-66/67 ve bloklu FX-P-88 kartları canlandırılmayacak
  (FX-P-88'in konusu FX2-21'de **doğru şekilde** ele alınıyor).

---

## 7. Sıradaki İş

[`.prompts/FX2-KATALOG.md`](.prompts/FX2-KATALOG.md) → **FX2-01** ile başla.
Durum: [`.anti-amnesia/FX2-STATE.json`](.anti-amnesia/FX2-STATE.json)
