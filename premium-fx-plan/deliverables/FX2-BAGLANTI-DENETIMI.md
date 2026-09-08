# FX-2 Bağlantı Denetimi — "kodda var, uygulamada yok" tespiti

| | |
|---|---|
| **Tarih** | 2026-09-08 |
| **İstek** | *"özellik olarak kodlarda olan ancak uygulamada görülmeyen tüm noktaları tespit"* |
| **Yöntem** | Çalışan uygulamada **gerçek etkileşim** (sentetik `pointerdown`/`pointerup`), 7 sekmede DOM sayımı, FX API'lerine casus (spy) takarak canlı tetiklenme ölçümü |
| **Ortam** | Cache'siz sunucu (`no-store`), izole tarayıcı bağlamı, sentetik veri — gerçek veri/parola/token yok |
| **Not** | Bu, FX-1'in düştüğü tuzağın (TESHIS.md: "fixture modülü test etti, bağlantıyı etmedi") tekrar denetimidir |

---

## 1. ÇALIŞIYOR — gerçek dokunuşla doğrulandı

Gerçek bir butona sentetik `pointerdown` gönderilip FX API'lerine casus takıldı:

| Test | Sonuç |
|---|---|
| `data-fx="nav"` butonu | ses `nav` · haptik `tap` · ripple 1 · `.sey-press` ✅ |
| **`data-fx`'siz** buton ("Bağlan") | ses `tap` (fallback) · haptik `tap` · ripple 1 · `.sey-press` ✅ |
| Alt navigasyon butonu | ses `nav` · haptik `tap` · ripple 1 · `.sey-press` ✅ |
| Ripple temizliği | dokunuş sonrası artık düğüm **0** ✅ |

Çalışma zamanı kapıları: `SeyTouch._installed=true`, `SeyAudio._unlocked=true`,
`isAudible()=true`, `isPremiumFxEnabled()=true`, `isSoundAllowed()=true`,
`shouldAnimate()=true`, `isQuietTime()=false`.

Ayrıca doğrulandı: sekme geçişi (`sey-leaving` → `sey-entering`), giriş
animasyonu (`.sey-enter` bugün 16/16), canlı zemin sınıfları
(`amb-time-* amb-wx-* amb-season-*`), aurora parallax (`translate: 0px -24px`),
grain (`opacity .035`), sayaçlar (`data-countup` 6), `SeyFx.sheetClose` (24
çağrı yeri).

---

## 2. KODDA VAR — UYGULAMADA GÖRÜNMÜYOR

### 🔴 B1. Üç sekme tamamen malzeme sisteminin dışında

| Sekme | `.surface` | `.sey-enter` | Sonuç |
|---|--:|--:|---|
| bugun | 16 | 16 | ✅ |
| saglik | 13 | 13 | ✅ |
| rapor | 17 | 17 | ✅ |
| ayarlar | 11 | 11 | ✅ |
| **aeon** | **0** | **0** | ❌ |
| **saygi** | **0** | **0** | ❌ |
| **takvim** | **0** | **0** | ❌ |

`aeon`, `saygi` ve `takvim` sekmelerinde **hiç `.surface` yok**. Bu üç sekme:
- giriş animasyonu almıyor (`SeyFx.enter` bu seçiciye bağlı),
- **elevation token'larını almıyor** (FX2-24 `--elev-2`'yi `.surface`'a bağladı),
- hover derinliği almıyor.

Yani FX-2'nin "malzeme ve derinlik" dalgası (Dalga 6) bu üç sekmeye hiç
değmiyor.

### 🔴 B2. `sey-stagger` yedi sekmenin hiçbirinde yok

Ölçüm: 7 sekmede de **0**. Kaynak incelemesi nedenini gösteriyor — sınıf
yalnız **overlay içi** listelere basılıyor (`app.js` 6185, 6537, 15035, 15049,
15174, 15183, 15304, 15313, 15373, 15453): reminder kartları/inbox,
okuma/izleme/dinleme günlükleri, öğrenme, ruh pratiği.

Yani FX2-17'nin kademeli liste girişi teknik olarak uygulanmış ama kullanıcı
onu **ancak bir overlay açarsa** görebiliyor; ana gezinme yüzeyinde hiç yok.

### 🔴 B3. `sey-ring-seg` hiçbir sekmede yok

Ölçüm: 7 sekmede de **0**. `ringSeg()` fonksiyonu (`app.js:12833`) yalnız
**adet döngüsü faz halkasında** kullanılıyor (13571–13574, 4 çağrı). Hero
ilerleme halkaları bu fonksiyonu kullanmıyor.

FX2-18 "sayaç ve halka canlandırma" diyordu; sayaç kısmı çalışıyor
(`data-countup` 6), **halka kısmı pratikte tek bir nadir yüzeyde kalıyor**.

### 🟡 B4. `sey-shimmer` — CSS ve API var, tetikleyici neredeyse yok

`app/styles.css` 1804–1815'te tam tanımlı, `SeyFx.shimmer` çalışır durumda.
Ama app.js'te yalnız **3 tetikleyici** var, hepsi nadir kutlama anları:
- `app.js:7453` — su/adım hedefi ilk kez aşılınca
- `app.js:7503` — `maybeStreak()`, yalnız 3/7/14 günlük seri kilometre taşları
- `app.js:11261` — bir çan olayı

Sınıf 1400 ms sonra kaldırılıyor. Yani DOM'da 0 görülmesi **beklenen**;
sorun bozukluk değil, **erişilebilirlik**: normal kullanımda neredeyse hiç
tetiklenmiyor.

### 🟡 B5. `SeyFx.enter` seçicisinin 2/3'ü ölü

```js
SeyFx.enter('#app .surface, #app .card, #app .bento', 40)   // app.js:5875
```

Ölçüm: `.card` = **0**, `.bento` = **0** (7 sekmenin hepsinde). Yalnız
`.surface` eşleşiyor. FX2-24 zaten bu sınıfların var olmadığını kaydetmişti;
seçici temizlenmemiş.

### 🟡 B6. `data-fx` niyet kapsamı çok ince

| Sekme | `data-fx` / buton |
|---|--:|
| bugun | 15 / 57 |
| saglik | 10 / 60 |
| **rapor** | **10 / 265** |
| aeon | 10 / 10 |
| saygi | 11 / 21 |
| takvim | 10 / 10 |
| ayarlar | 18 / 32 |

Çoğu sekmede görülen 10 sayısı **alt navigasyon şablonundan** geliyor; yani
birçok sekmede içerik butonlarının niyet eşlemesi pratikte **sıfır**.
Bozuk değil (fallback `tap` çalışıyor, §1'de doğrulandı) ama FX2-09'un
"niyet haritası" vaadi yüzeyin küçük bir kısmında gerçekleşiyor: onay
(`confirm`) ve yıkıcı (`destructive`) eylemler kendi ses/haptik kimliklerini
alamıyor.

### 🟡 B7. Hiç çağrılmayan API'ler

| API | app.js çağrı |
|---|--:|
| `SeyFx.transition` | **0** (ölü API) |
| `SeyAudio.error` | **0** |
| `SeyHaptics.success` | **0** |
| `SeyHaptics.error` | **0** |
| `SeyHaptics.refresh` | **0** |

`SeyHaptics.success/error` yalnız `data-fx="confirm"/"destructive"` üzerinden
dolaylı erişilebilir — B6 nedeniyle bu da çok dar.
(`SeyFx.countUp`=0 ve `SeyAudio.tap/nav/...`=0 **beklenen**: ilki
`sweepCounters`'a, ikincisi `SeyTouch` delegasyonuna devredildi — §1'de
çalıştığı doğrulandı.)

### 🟡 B8. Canlı zemin kartlarla örtülü

Ölçüm: görünen alanın **~%70'i opak kartlarla kaplı**. Zemin yalnız ince
kenar boşlukları, kart araları ve başlık bölgesinde görünüyor — AD-38
kararının ("kartlar opak `--card-solid`") doğrudan sonucu.

---

## 3. Özet tablo

| # | Bulgu | Ağırlık | Sebep |
|---|---|---|---|
| B1 | aeon/saygi/takvim'de `.surface`=0 → giriş animasyonu + elevation yok | 🔴 | Bu sekmeler `.surface` kalıbını hiç kullanmıyor |
| B2 | `sey-stagger` 7 sekmede de 0 | 🔴 | Yalnız overlay içi listelere basılıyor |
| B3 | `sey-ring-seg` 7 sekmede de 0 | 🔴 | `ringSeg()` yalnız adet faz halkasında |
| B4 | `sey-shimmer` pratikte tetiklenmiyor | 🟡 | 3 nadir kutlama tetikleyicisi |
| B5 | `.card`/`.bento` seçicileri ölü | 🟡 | O sınıflar hiç üretilmiyor |
| B6 | `data-fx` kapsamı ince (rapor 10/265) | 🟡 | FX2-09 yalnız 41 kaynak satırına ekledi |
| B7 | 5 API hiç çağrılmıyor | 🟡 | Bağlanmamış |
| B8 | Zemin ~%70 kartlarla örtülü | 🟡 | AD-38 opak kart kararı |

---

## 4. Dürüst değerlendirme

FX-2'nin **dokunma katmanı gerçekten çalışıyor** — bu, FX-1'e göre nitel bir
sıçrama ve §1'deki gerçek etkileşim testiyle kanıtlı. Ses, haptik, ripple ve
basma geri bildirimi her butonda, `data-fx` olmasa bile fallback'le çalışıyor.

Ancak kapsam metriklerinin (M2/M4 = 390/390) verdiği "tam kapsam" izlenimi
yanıltıcı: metrikler **kaynak metnindeki buton sayısını** sayıyor,
**sekme başına gerçek görünürlüğü** değil. Üç sekmenin malzeme sisteminin
tamamen dışında olması (B1) ve iki görsel efektin hiçbir ana sekmede
görünmemesi (B2, B3) bu ölçüm boşluğunun sonucudur.

**M12 için yazdığım ders burada da geçerli:** metrik varlığı sayıyor,
erişilebilirliği değil.

---

## 5. Karar bekleyenler

Aşağıdakiler ürün/tasarım kararı gerektirir; bu belge onları **vermez**:

1. **B1** — aeon/saygi/takvim'i `.surface` kalıbına taşımak (kapsamlı markup
   değişikliği, üç sekmenin görsel dilini etkiler).
2. **B2** — stagger'ı ana sekme listelerine yaymak.
3. **B3** — hero/ilerleme halkalarını `ringSeg()`'e taşımak ya da onlara da
   `sey-ring-seg` vermek.
4. **B6** — `data-fx` niyet haritasını yıkıcı/onay butonlarına yaymak.
5. **B8** — kart opaklığını düşürmek (AD-38 ile çelişir).
6. **B5/B7** — ölü seçici ve API temizliği (düşük risk, kozmetik borç).
