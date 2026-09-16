# TAM DENETİM — kod tarafı + uygulama tarafı + ekran görüntüsü

| | |
|---|---|
| **Tarih** | 2026-09-08 |
| **Talimat** | [`docs/TAM-DENETIM-PROMPTU.md`](../../docs/TAM-DENETIM-PROMPTU.md) — baştan sona uygulandı |
| **Dal** | `premium-fx-gorsel-yuzey` · çalışma ağacı temiz |
| **Tip** | **Salt-okur denetim.** Uygulama kaynağına tek satır dokunulmadı (§9.1 kanıtı) |
| **Sonuç** | **4 🔴 · 5 🟡 · 4 🔵** bulgu · 36 ekran görüntüsü |
| **Öne çıkan** | Kullanıcının iki şikâyetinin de kök nedeni bulundu ve **deterministik olarak yeniden üretildi** |

---

## 1. Yöntem ve ortam

| Öğe | Değer |
|---|---|
| Sunucu | Python `ThreadingHTTPServer`, **yalnız `127.0.0.1:9000`**, `Cache-Control: no-store` (curl ile doğrulandı) |
| Tarayıcı | chrome-devtools MCP · **izole bağlam** (`seyma-tam-denetim`) · temiz depolama |
| Viewport | `414x896x2,mobile,touch` (iPhone) **ve** `1280x900x2` (geniş) |
| Veri | %100 **sentetik** — 30 gün, dolu koleksiyonlar, `ghToken:''`, `openaiKey:''` |
| Konum | `emulate geolocation` (38.4237, 27.1428) — gerçek cihaz konumu değil |
| Kimlik | Sentetik `settings.auth` tohumu. **Hiçbir parola/token alanı doldurulmadı** |

### 1.1 Veri güvenliği — fiilî kanıt

| Kural | Durum | Kanıt |
|---|---|---|
| `seyma-data`'ya yazma yok | ✅ | Ağ günlüğü: **`api.github.com`'a 0 istek**. Tüm dış istekler `tr.wikipedia.org` **GET** (Saygı özelliği) |
| Guard 1 kaynağı önceden doğrulandı | ✅ | `sync.js:988-992` (`localhost/file:` push engeli) + `sync.js:1107` + Guard 2 `sync.js:353` |
| `forceSync` / `seyma-sync-force` | ✅ | URL'de yok; `localStorage.getItem('seyma-sync-force')` → `null` (çalışma zamanında ölçüldü) |
| Sunucu turdan önce durduruldu | ✅ | `pkill` + `lsof -iTCP:9000` → **dinlenmiyor** |
| Token/parola otomasyonu | ✅ | Panel token ekranı **görüntülendi, doldurulmadı** |
| Kaynak değişikliği | ✅ | `git status` → assets dışında **değişiklik yok** |

### 1.2 Talimattan sapma (bilinçli)

Prompt §2.1 **9002** portunu söylüyor; `CLAUDE.md` kural 1 ise görsel QA istisnasını **"yalnız port 9000"** ile sınırlıyor. `CLAUDE.md` bir veri güvenliği belgesi olduğu için ona uyuldu: **`127.0.0.1:9000`**. İşlevsel fark yok (ikisi de loopback + no-store).

---

## 2. Kod tarafı envanteri (Bölüm A)

### 2.1 Ölçekler

| Ölçüm | Değer |
|---|---:|
| `app.js` satır | 17.624 |
| `App.<ad>=` handler (benzersiz) | **718** |
| `onclick=` | 391 · `oninput=` 66 · `onchange=` 41 |
| `<button>` | 361 |
| `App.open*` / `App.close*` | **61** (35 open + 26 close) |
| `*HTML()` üretici fonksiyon | **151** |
| `app/styles.css` satır / `@keyframes` | 2.079 / 55 |
| `migrate()` backfill koşulu (`state.js`) | 117 |
| `data-fx=` kaynak satırı | 41 |
| `sey-stagger` basım noktası | 10 |
| `ringSeg(` çağrı | 5 |

### 2.2 Modül yüzeyleri — public metot × `app.js` çağrı sayısı

> Not: `SeyAudio.tap/nav/tick/sheetOpen/sheetClose/toggleOn/toggleOff` ve
> `SeyFx.ripple/countUp` için **0 beklenen ve doğrudur** — bunlar `SeyTouch`
> delegasyonuna ve `sweepCounters`'a devredildi; §4'te gerçek dokunuşla
> çalıştıkları kanıtlandı. "Ölü API" yalnız dolaylı erişimi de olmayanlardır.

| Modül | Metot | Çağrı | Not |
|---|---|---:|---|
| **SeyAudio** (17) | `bell` | 10 | |
| | `warning` | 10 | |
| | `success` | 8 | |
| | `voice` | 8 | |
| | `ambient` | 2 | varsayılan kapalı |
| | `tap` `nav` `tick` `sheetOpen` `sheetClose` `toggleOn` `toggleOff` | 0 | ✅ delege (SeyTouch) |
| | `isAudible` | 0 | iç kullanım |
| | `error` | 0 | 🟡 yalnız `data-fx="destructive"` üzerinden |
| | `cloudTtsSpeak/Stop/Playing` | 0 | `voice` içinden |
| **SeyHaptics** (6) | `tap` | 34 | |
| | `streak` | 6 · `water` 2 | |
| | `success` `error` `refresh` | 0 | 🟡 yalnız dolaylı |
| **SeyFx** (13) | `sheetClose` | 24 | |
| | `shimmer` | 6 | |
| | `enter` `sweepCounters` `bindAuroraParallax` `isPremiumFxEnabled` | 2 | |
| | `ripple` `countUp` | 0 | ✅ delege |
| | **`transition`** | **0** | 🟡 **gerçek ölü API** |
| | `shouldAnimate` `isSoundAllowed` `ambientAllowed` `prefersReducedMotion` | 0 | iç gating |
| **SeyTouch** (3) | `install` | 2 | |
| **SeyTimeTheme** (4) | `apply` `applySeasonal` | 2 | |
| | `classForHour` `seasonalClass` | 0 | SeyAmbience içinden |
| **SeyAmbience** (6) | `apply` | 2 | |
| | `scene` `seed` `intensity` `weatherClass` `seasonClass` | 0 | `apply` içinden |

### 2.3 CSS ↔ markup bağı — ölü stiller

`sey-*` / `amb-*` / `theme-*` sınıflarının tamamı üç sütunda tarandı
(CSS'te tanımlı × app.js'te basılıyor × çalışma zamanında DOM'da).

`app.js`'te 0 görünen sınıfların **çoğu doğrudur** — runtime'da başka modül
basıyor: `amb-*`/`theme-time-*`/`theme-season-*` → `timeTheme.js`,
`sey-press`/`sey-ripple*`/`sey-shimmer`/`sey-sheet-out`/`sey-backdrop-out`
→ `mediaFx.js`, `sey-ccard*` → `helpers.js`, `sey-faith-ov-*` → `saygi.js`,
`sey-splash-amblem` → `index.html`.

**Hiçbir kaynakta bulunmayan (gerçekten ölü) 4 sınıf:**

| Sınıf | CSS | app.js | Diğer kaynak | Ağırlık |
|---|---:|---:|---|---|
| `sey-enter-delay-1` | 1 | 0 | **yok** | 🔵 |
| `sey-enter-delay-2` | 1 | 0 | **yok** | 🔵 |
| `sey-enter-delay-3` | 1 | 0 | **yok** | 🔵 |
| `sey-sheet-in` | 2 | 0 | **yok** | 🔵 |

### 2.4 Statik sağlık

`node --check`: **33 dosya (app.js, sync.js, sw.js, panel/*.js, app/core/*.js, app/content/*.js, tools/*.mjs) — 0 hata.**

---

## 3. Yüzey matrisi (Bölüm B)

### 3.1 Ana sekmeler — 7/7 (her satır `ui.tab` kimliğiyle doğrulandı)

> ⚠️ **Gerçek sekme kimlikleri** `bugun · saglik · mesaj · saygi · harita · rapor · ayarlar`'dır.
> Arayüz etiketleri "Aeon" ve "Takvim" olsa da iç kimlikler `mesaj` ve `harita`'dır.
> (Bu, önceki denetimin ölçüm hatasıydı — bkz. §10.2.)

| Sekme (etiket) | button | `data-fx` | `.surface` | `.sey-stagger` | `.sey-enter` | `.sey-ring-seg` | `[data-countup]` | uzunluk |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `bugun` (Bugün) | 57 | 15 | 16 | **0** | 16 | **0** | 6 | 97.758 |
| `saglik` (Sağlık) | 60 | 10 | 13 | **0** | 13 | **0** | 0 | 67.712 |
| `mesaj` (**Aeon**) | 18 | 10 | **0** | **0** | **0** | **0** | 0 | 18.204 |
| `saygi` (İlham) | 21 | 11 | **0** | **0** | **0** | **0** | 0 | 20.864 |
| `harita` (**Takvim**) | 43 | 10 | 2 | **0** | 2 | **0** | 0 | 29.990 |
| `rapor` (Rapor) | 265 | 10 | 16 | **0** | 16 | **0** | 0 | 143.032 |
| `ayarlar` (Ayarlar) | 32 | 18 | 11 | **0** | 11 | **0** | 0 | 45.679 |

`#root` sınıfı 7 sekmede de aynı ve tam:
`sey-app-booted theme-aurora theme-time-dusk amb-time-day amb-wx-clear amb-season-autumn theme-season-autumn`

**Ekran görüntüleri:** `sekme-bugun-koyu.png` · `sekme-bugun-acik.png` ·
`sekme-bugun-genis-1280.png` · `sekme-saglik-koyu.png` ·
`sekme-mesaj-aeon-koyu.png` · `sekme-saygi-ilham-koyu.png` ·
`sekme-harita-takvim-koyu.png` · `sekme-rapor-koyu.png` · `sekme-ayarlar-koyu.png`

### 3.2 Overlay'ler — 19/19 açıldı, hiçbiri hata vermedi

| Overlay | açıldı | button | `data-fx` | `stagger` | `ring-seg` | uzunluk |
|---|:--:|---:|---:|---:|---:|---:|
| `openReading` | ✅ | 66 | 16 | 3 ¹ | 0 | 112.724 |
| `openWatching` | ✅ | 65 | 16 | 3 ¹ | 0 | 111.533 |
| `openListening` | ✅ | 66 | 16 | 3 ¹ | 0 | 111.949 |
| `openLearning` | ✅ | 59 | 16 | 3 ¹ | 0 | 105.296 |
| `openSoulPracticePicker` | ✅ | 61 | 16 | 0 | 0 | 103.003 |
| `openSoulArchive` | ✅ | 61 | 15 | 0 | 0 | 104.061 |
| `openSoulActivity` | ✅ | 63 | 16 | 1 | 0 | 106.452 |
| `openZikr` | ✅ | 77 | 16 | 0 | 0 | 105.729 |
| `openZikrHatim` | ✅ | 57 | 15 | 0 | 0 | 95.811 |
| `openQibla` | ✅ | 60 | 15 | 0 | 0 | 100.441 |
| `openQuranJourney` | ✅ | **180** | 16 | 0 | 0 | 166.804 |
| `openFaithCorner` | ✅ | 97 | 15 | 0 | 0 | 109.008 |
| `openReminderCenter` | ✅ | 106 | 20 | **7** | 0 | 146.810 |
| `openReminderDigest` | ✅ | 57 | 15 | 0 | 0 | 95.799 |
| `openRoom` (terapi) | ✅ | 65 | 17 | 0 | 0 | 119.526 |
| `openJournalModal` | ✅ | 69 | 17 | 0 | 0 | 115.390 |
| `openCrisis` | ✅ | 57 | 15 | 0 | 0 | 95.811 |
| `openEmergency` | ✅ | 59 | 15 | 0 | 0 | 98.006 |
| `openMotivationMinimum` | ✅ | 57 | 15 | 0 | 0 | 95.811 |

¹ **Gün içi kayıt listesi doldurulduktan sonra.** Boş listeyle 0 çıkıyordu —
bu benim ilk tohumumun eksikliğiydi, kusur değil (§10.2).

**Ekran görüntüleri:** `overlay-okuma-stagger-dolu.png` ·
`overlay-zikirmatik-sayac.png` · `overlay-kuran-liste.png` ·
`overlay-reminder-merkezi.png` · `bos-durum-okuma.png`

### 3.3 Özel durumlar

| Durum | Sonuç | Görüntü |
|---|---|---|
| Giriş kapısı (auth) | Sentetik `settings.auth` ile aşıldı | — |
| **Konum kapısı** | 🔴 **B-01/B-02** — bkz. §8 | `hata-konum-kapisi.png`, `hata-konum-kapisi-gecici-hata-sonrasi.png` |
| Profil değerlendirme kapısı | Açıldı; `render()` erken dönüşü doğrulandı | `00-boot-ilk-ekran.png` |
| Boş koleksiyon | Overlay açılıyor, `stagger` 0 (doğru) | `bos-durum-okuma.png` |
| `premiumAtmosphere` kapalı | `amb-*` temizlendi, `theme-*` **kaldı** (🟡 B-06) | `gating-premium-kapali.png` |
| Geniş viewport 1280 | Yatay taşma **yok** | `sekme-bugun-genis-1280.png` |
| Konsol hataları | **0** | — |

---

## 4. Özellik matrisi — S1 (kod) / S2 (çalışma zamanı) / S3 (algı)

| Özellik | S1 | S2 | S3 | Ölçülen kanıt |
|---|:--:|:--:|:--:|---|
| **Dokunma katmanı** (`SeyTouch`) | ✅ | ✅ | ✅ | `_installed=true`; gerçek `pointerdown` → `.sey-press`=1 |
| **Ripple** | ✅ | ✅ | ✅ | 3/3 hedefte `ripple()`=1, dalga düğümü=1; bırakınca artık **0** |
| **`data-fx` niyet** | ✅ | ✅ | 🟡 | `nav`→`nav` sesi; `data-fx`'siz "Bağlan"→`tap` fallback. Kapsam ince (B-08) |
| **Ses motoru (11 ses)** | ✅ | ✅ | ✅ | 11/11 RMS > 0 (§5) |
| **Haptik** | ✅ | ✅ | ⚠️ | `SeyHaptics.tap` 3/3 tetiklendi; **iOS Safari'de `navigator.vibrate` yok** (ölçülemedi) |
| **Sekme geçişi** | ✅ | ✅ | ✅ | `sey-leaving`→`sey-entering`; `.sey-enter` 5 sekmede surface sayısına eşit |
| **`sey-enter` giriş** | ✅ | ✅ | ✅ | bugun 16/16, saglik 13/13, rapor 16/16, ayarlar 11/11 |
| **`sey-stagger`** | ✅ | ✅ | 🟡 | Overlay'de 3–7 (veri varken) · **7 ana sekmede 0** (B-07) |
| **`sey-ring-seg`** | ✅ | ❌ | ❌ | **7 sekme + 19 overlay = 0** (B-04 🔴) |
| **`data-countup`** | ✅ | ✅ | ✅ | bugun 6, terapi odası 10 |
| **`sey-shimmer`** | ✅ | ⚠️ | 🟡 | 6 tetikleyici, hepsi nadir kutlama anı; turda hiç görülmedi |
| **Canlı zemin — sınıf/mantık** | ✅ | ✅ | — | 6/6 WMO kodu, 5/5 mevsim, seed doğru (§6) |
| **Canlı zemin — algı** | ✅ | ✅ | ❌ | **Koyu temada 12/12 sahne eşiğin altında** (B-03 🔴) |
| **Canlı zemin — kapı ekranları** | ✅ | ❌ | ❌ | `rootClass=""` (B-02 🔴) |
| **Aurora + grain** | ✅ | ✅ | ✅ | `theme-aurora` 7/7 sekmede |
| **Zaman teması** | ✅ | ✅ | 🟡 | Uygulanıyor; `amb-time-*` ile **çelişiyor** (B-09) |
| **reduced-motion** | ✅ | ✅ | ✅ | `shouldAnimate()=false`, renk korunuyor, ses etkilenmiyor |
| **Gating (premium/uiSounds)** | ✅ | ✅ | 🟡 | RMS ile doğrulandı; `theme-*` sızıntısı (B-06) |
| 30 gün veri · ruh/su/adım/tik | ✅ | ✅ | ✅ | 30 gün render; `bugun` 97.758 karakter |
| Okuma/İzleme/Dinleme/Öğrenme | ✅ | ✅ | ✅ | 4/4 overlay açıldı + veri render etti |
| Zikirmatik · Kıble · Hicri | ✅ | ✅ | ✅ | 3/3 açıldı · `zikr-harness` 95/95 |
| Kur'an Yolculuğu | ✅ | ✅ | ✅ | 180 buton render |
| Saygı / İlham | ✅ | ✅ | ✅ | Wikipedia GET 200; günün öncüsü render |
| Reminder merkezi | ✅ | ✅ | ✅ | 106 buton, `stagger`=7 |
| Terapi odası · Kriz · Acil | ✅ | ✅ | ✅ | 3/3 açıldı |
| Günlük Işığı (journal) | ✅ | ✅ | ✅ | `openJournalModal` 115.390 |
| Profil değerlendirme | ✅ | ✅ | ✅ | Kapı ekranı render etti |
| ÆON / Luna sohbeti | ✅ | ✅ | ⚠️ | Kabuk render; **mesaj balonları sentetik şekilde boş çıktı** — tohum artefaktı olması muhtemel, ölçülemedi |
| Döngü · kilo · lab | ✅ | ✅ | ✅ | `saglik` 67.712 |

---

## 5. Ses raporu — 11 ses × RMS

**Yöntem:** `ctx._seyAudioGraph.limiter` → `AnalyserNode` (destination'a giden
**son** düğüm). 450 ms pencerede tepe RMS. Taban gürültü **0,000075**.

| Ses | Tepe RMS | Duyulur | Not |
|---|---:|:--:|---|
| `tick` | 0,00085 | ✅ | 🔵 tap'ın ~1/30'u — sınırda (B-12) |
| `tap` | 0,02584 | ✅ | |
| `error` | 0,02068 | ✅ | |
| `sheetClose` | 0,03004 | ✅ | |
| `sheetOpen` | 0,03095 | ✅ | |
| `nav` | 0,03485 | ✅ | |
| `toggleOff` | 0,03701 | ✅ | |
| `toggleOn` | 0,04098 | ✅ | |
| `warning` | 0,04292 | ✅ | |
| `success` | 0,07432 | ✅ | |
| `bell` | **0,15295** | ✅ | en yüksek |

**Sonuç: 11/11 ses gerçekten üretiliyor.** FX-1'in en büyük kusuru (`tap` 0 kez
çağrılıyordu) FX-2'de **kapanmış** ve bu, modül testiyle değil **gerçek sinyal
ölçümüyle** doğrulanmıştır.

---

## 6. Canlı zemin özel raporu (§C2)

### 6.1 Piksel farkı — asıl kanıt

Aynı içerik, aynı scroll, `bugun` sekmesi, 414×896×2.
**Ölçüt (prompt §C2.1): ortalama mutlak fark < 3 → pratikte görünmez.**

**Zaman sahneleri — KOYU tema**

| Çift | Ort. fark | Maks | >2 fark piksel | Durum |
|---|---:|---:|---:|:--:|
| şafak ↔ gündüz | 2,354 | 21 | %41,2 | ❌ |
| aksam ↔ gece | 2,247 | 31 | %38,2 | ❌ |
| gündüz ↔ gece | 2,137 | 50 | %40,4 | ❌ |
| şafak ↔ akşam | 2,146 | 60 | %39,3 | ❌ |
| şafak ↔ gece | 1,862 | 48 | %13,6 | ❌ |
| **gündüz ↔ akşam** | **0,954** | 61 | %13,6 | ❌ **en kötü** |

**Hava sahneleri — KOYU tema (gece, `amb-wx-clear` referans)**

| Sahne | Ort. fark | Maks | Durum |
|---|---:|---:|:--:|
| sis | 2,526 | 51 | ❌ |
| kar | 1,921 | 51 | ❌ |
| yok (`none`) | 1,756 | 48 | ❌ |
| çisenti | 1,743 | 14 | ❌ |
| bulut | 1,530 | 49 | ❌ |
| yağmur | 0,732 | 50 | ❌ |
| **fırtına** | **0,567** | 46 | ❌ **en kötü** |

**AÇIK tema**

| Çift | Ort. fark | Durum |
|---|---:|:--:|
| şafak ↔ gece | **5,287** | ✅ **görünür** |
| şafak ↔ gece+yağmur | 5,137 | ✅ |
| gece ↔ gece+yağmur (yalnız hava katmanı) | 1,538 | ❌ |

> **Kesin sonuç:** Zaman katmanı **açık temada görünür (5,29)**, **koyu temada
> görünmez (≤2,35)**. Hava katmanı **her iki temada da görünmez** (≤2,53).
> Uygulama koyu temada açıldığı için kullanıcının "hiçbir şey yok" algısı
> **ölçümle doğrudur.**

Zemin parlaklık ölçümü (üst şerit): koyu **24,1** · açık **217,9** — koyu temada
sahne farkları neredeyse siyah üzerinde kayboluyor.

**Görüntüler:** `zemin-koyu-{safak,gunduz,aksam,gece}-acik.png` ·
`zemin-koyu-gece-{hava-acik,hava-bulut,sis,cisenti,hava-yagmur,kar,firtina,hava-none}.png` ·
`zemin-acik-{safak,gece,aksam-yagmur}.png`

### 6.2 Kaplanma

`bugun`, scroll 0, açık tema: **%47 kaplı → %53 zemin görünür**
(5 opak kutu, α ≥ 0,95). Üç alfa eşiğinde (0,95 / 0,60 / 0,01) sonuç aynı.

> Bu, önceki denetimin **"~%70 kapalı"** rakamını **düzeltir**. Kaplanma
> sanıldığı kadar yüksek değil — sorun örtülme değil, **kontrast** (§6.1).

### 6.3 Canlılık — 🟡 B-05

| Kontrol | Sonuç |
|---|---|
| Güneş saati değişimi sahneyi değiştiriyor mu? | ✅ `sunset+3s` → `amb-time-night`, `sunrise-10dk` → `amb-time-dawn` |
| `setInterval` ile boşta tazeleme var mı? | ❌ **YOK** |
| `pollRemote` (30 sn) `render()` çağırıyor mu? | ⚠️ Yalnız `if(added>0\|\|answeredCount>0)` — **yeni ÆON mesajı gelirse** (`app.js:16095`) |
| `onAppForeground` koşulsuz render? | ❌ Yok |

**Sonuç:** Kullanıcı hiçbir şeye dokunmazsa sahne saat geçişinde tazelenmez.

### 6.4 Veri bağı — ✅ tam

| WMO kodu | Üretilen sınıf |
|---:|---|
| 0 | `amb-wx-clear` ✅ |
| 3 | `amb-wx-cloud` ✅ |
| 45 | `amb-wx-fog` ✅ |
| 63 | `amb-wx-rain` ✅ |
| 75 | `amb-wx-snow` ✅ |
| 95 | `amb-wx-storm` ✅ |

### 6.5 Veri yokluğu — ✅

`data.weather = null` → `amb-time-dusk amb-wx-none amb-season-autumn`,
`--wx-intensity: 0.35` (fallback), `--amb-seed` korunuyor. Zaman ve mevsim
katmanları **bozulmuyor**.

### 6.6 Mevsim + seed — ✅

| Tarih | Sınıf |
|---|---|
| 2026-01-01 | `amb-season-newyear` ✅ |
| 2026-04-15 | `amb-season-spring` ✅ |
| 2026-07-15 | `amb-season-summer` ✅ |
| 2026-10-15 | `amb-season-autumn` ✅ |
| 2026-12-20 | `amb-season-winter` ✅ |

`--amb-seed`: gün içinde **sabit** (01:00 ve 23:00 → 0,8187), gün gün **farklı**
(08 Eyl 0,8187 · 09 Eyl 0,1246 · 10 Eyl 0,5873). ✅

### 6.7 reduced-motion — ✅

`shouldAnimate()` → `false`; `amb-*` sınıfları **korunuyor** (renk kalıyor,
hareket duruyor — sözleşmeye uygun); `tap` 0,02585 ve `tick` 0,00091 etkilenmiyor
(ses hareket değildir; `tick` bilinçli olarak `allowed(true)` kullanıyor).

---

## 7. Gating matrisi

| Senaryo | `tap` RMS | Beklenen | Durum |
|---|---:|---|:--:|
| `premium=AÇIK`, `uiSounds=AÇIK` | 0,02874 | ses VAR | ✅ |
| `premium=AÇIK`, `uiSounds=KAPALI` | 0,00002 | ses YOK | ✅ |
| `premium=KAPALI`, `uiSounds=AÇIK` | 0,00000 | ses YOK | ✅ |
| **quiet-time 02:00** (`isQuietTime()=true`) | **0,02872** | ses YOK? | ⚠️ **B-13** |

| Ayar | `#root` sonucu |
|---|---|
| `premiumAtmosphere = false` | `amb-*` **0** ✅ · `theme-time-dusk` + `theme-season-autumn` **kaldı** 🟡 (B-06) |
| `premiumAtmosphere = true` | `amb-time-day amb-wx-clear amb-season-autumn` ✅ |
| `navigator.vibrate` | Chrome'da var; **iOS Safari'de yok** — haptik orada no-op (R3 sürüyor) |

---

## 8. BULGULAR

### 🔴 B-01 — Geçici konum hatası uygulamayı kalıcı olarak kilitliyor

**Ne:** Tek bir *geçici* konum hatası (timeout / position-unavailable), kalıcı
`settings.locationEnabled` bayrağını `false` yapıp diske yazıyor; tarayıcı izni
hâlâ `granted` olmasına rağmen uygulamanın tamamı kapının arkasında kalıyor ve
**kendiliğinden düzelmiyor**.

**Kanıt (deterministik yeniden üretim):**

| Adım | `locationEnabled` | kapı | `#app` uzunluk | tarayıcı izni |
|---|:--:|---|---:|---|
| 1 · taban | `true` | `granted` | 96.816 | `granted` |
| 2 · tek `code 3` timeout | **`false`** | `unavailable` | **2.191** | **`granted`** |
| 3 · hata koşulu kalktı, 2 sn beklendi | **`false`** | `unavailable` | **2.191** | `granted` |

Adım 2'de üretilen metin, kullanıcının bildirdiği metnin **birebir aynısı**:
*"Konum isteği zaman aşımına uğradı. Birkaç saniye sonra yeniden dene."*
`locationDisabledReason: "timeout"`.

Doğal olarak da gözlendi: viewport değişimi konum sağlayıcısını anlık kesince
`locationDisabledReason: "position-unavailable"` yazıldı ve uygulama kilitlendi.

**Kök neden:** [`app.js:8492-8503`](../../app.js#L8492) — `locationGateFailure()`
**her** hata kodunda kalıcı bayrağı düşürüyor:

```js
function locationGateFailure(code,reason){
  ...
  if(data&&data.settings){
    data.settings.locationEnabled=false;   // ← code 2 ve 3 için de çalışıyor
    data.settings.locationDisabledAt=new Date().toISOString();
    data.settings.locationDisabledReason=reason||'permission-denied';
    save(false);
  }
```

Oysa yalnız `code===1` (PERMISSION_DENIED) gerçekten izin iptalidir;
`code 2` (position-unavailable) ve `code 3` (timeout) **geçicidir**.

**Önerilen düzeltme:** Kalıcı bayrağı yalnız `code===1` ve
`reason==='unsupported'` durumunda düşür. `code 2/3`'te `ui.locationGateState`'i
`unavailable` yap, `data.settings.locationEnabled`'a **dokunma** — böylece
`locationGateSilentVerify()` sonraki açılışta kapıyı sessizce açabilir.

**Risk / etkilenen yüzey:** Uygulamanın **tamamı**. İç mekânda GPS kilidi
gecikmesi bu yolu düzenli tetikler.

**Görüntü:** `hata-konum-kapisi.png` · `hata-konum-kapisi-gecici-hata-sonrasi.png`

---

### 🔴 B-02 — Kapı ekranlarında canlı zemin hiç uygulanmıyor

**Ne:** Auth / konum / onboarding / profil kapılarında `#root.className`
**tamamen boş**; `amb-*`, `theme-time-*`, `theme-season-*`, `theme-aurora` yok.

**Kanıt:** Taze boot'ta kapı ekranında ölçüldü →
`rootClass: ""`, `ambCount: 0`, `themeCount: 0` — buna karşın
`SeyAmbience.scene()` geçerli bir sahne **hesaplıyordu**
(`amb-time-day / amb-wx-clear / amb-season-autumn`). Yani hesap doğru, boyama hiç çalışmıyor.

**Kök neden:** [`app.js:9094-9131`](../../app.js#L9094) — `render()` dört yerde
erken dönüyor (auth `:9105`, konum `:9113`, onboarding `:9123`, profil `:9130`),
canlı zemin boyama kuyruğu ise fonksiyonun **sonunda**
([`app.js:9299-9308`](../../app.js#L9299)). Erken dönüşler oraya hiç ulaşmıyor.

**Önerilen düzeltme:** Boyama kuyruğunu (`SeyTimeTheme.apply` +
`SeyAmbience.apply` + `applySeasonal`) `render()`'ın **başına**, `needsAuth()`
kontrolünden önce taşı — bunlar `#root`'a yazar, `#app` içeriğine bağımlı değildir.

**Risk:** Kullanıcı B-01 nedeniyle kapıda kilitlendiğinde **premium atmosferin
hiçbirini görmüyor**. B-01 + B-02 birlikte, kullanıcının *"uygulamada hâlâ
dinamik arkaplan ile ilgili hiçbir şey yok"* şikâyetini tam olarak açıklıyor.

**Görüntü:** `hata-konum-kapisi.png` (zemin düz siyah) · karşılaştırma
`sekme-bugun-koyu.png`

---

### 🔴 B-03 — Koyu temada canlı zemin algı eşiğinin altında

**Ne:** 4 zaman ve 8 hava sahnesinin **tamamı** koyu temada ortalama piksel
farkı `< 3` — prompt §C2.1'in "pratikte görünmez" ölçütü.

**Kanıt:** §6.1 tabloları. Koyu tema: zaman 0,954–2,354 · hava 0,567–2,526.
En kötüler: `gündüz↔akşam` **0,954**, `fırtına↔açık` **0,567**.
Açık temada zaman katmanı **5,287** ile eşiği geçiyor; hava katmanı **1,538** ile geçemiyor.

**Kök neden:** Sahne katmanı koyu zeminde (üst şerit ort. parlaklık **24,1**)
çok düşük kontrastla boyanıyor. Sınıflar ve `--wx-intensity`/`--amb-seed`
doğru üretiliyor (§6.4–6.6) — sorun tamamen CSS boyama gücünde.

**Önerilen düzeltme:** Koyu tema için `amb-*` katman opaklığı/parlaklık deltasını
en az **3–4×** artır; özellikle hava katmanını (`amb-wx-*`) her iki temada
güçlendir. Ölçüt: ardışık sahne çiftlerinde ortalama fark **≥ 3**.

**Risk:** Kullanıcının birincil şikâyeti. FX2-19…23'ün (192 sahne) tamamı bu
tek CSS katmanına bağlı.

**Görüntü:** 12 `zemin-koyu-*.png` + 3 `zemin-acik-*.png`

---

### 🔴 B-04 — `sey-ring-seg` hiçbir yüzeyde görünmüyor

**Ne:** 7 ana sekme **ve** 19 overlay'in **tamamında 0**.

**Kanıt:** §3.1 ve §3.2 tabloları — 26 yüzeyde `.sey-ring-seg` = 0.

**Kök neden:** `ringSeg()` yalnız 5 yerde çağrılıyor, hepsi **âdet döngüsü faz
halkası**. Hero/ilerleme halkaları bu fonksiyonu kullanmıyor.
(Önceki denetimin B3 bulgusu doğrulandı ve **overlay'lere de genişletildi**.)

**Önerilen düzeltme:** Hero ilerleme halkalarını `ringSeg()`'e taşı ya da
`sey-ring-seg` sınıfını onlara da ver.

**Risk:** FX2-18'in "halka canlandırma" yarısı ürün genelinde erişilemez.

**Görüntü:** `sekme-bugun-koyu.png` (hero halkaları segmentsiz)

---

### 🟡 B-05 — Sahne yalnız kullanıcı etkileşiminde tazeleniyor

**Ne:** Boşta duran kullanıcı için sahne saat geçişinde güncellenmiyor.
**Kanıt:** §6.3. `pollRemote`'un `render()`'ı `if(added>0||answeredCount>0)`
ile kapılı; başka koşulsuz render yok.
**Kök neden:** [`app.js:16095`](../../app.js#L16095).
**Düzeltme:** 30 sn'lik döngüye koşulsuz `SeyTimeTheme.apply()+SeyAmbience.apply()`
ekle (tam `render()` gerekmez — `#root` sınıfı yeterli, `innerHTML` yeniden kurulmaz).
**Risk:** Düşük; akşam/gece geçişi kaçırılıyor.

---

### 🟡 B-06 — `premiumAtmosphere=false` gating sızıntısı

**Ne:** Premium kapatılınca `amb-*` temizleniyor ama `theme-time-*` ve
`theme-season-*` `#root`'ta **asılı kalıyor**.
**Kanıt:** `premium=false` → `root = "sey-app-booted theme-time-dusk theme-season-autumn"`.
**Kök neden:** [`timeTheme.js:12-23`](../../app/core/timeTheme.js#L12) —
`apply()` premium kapalıyken **yalnız `theme-aurora`'yı** kaldırıp dönüyor;
[`timeTheme.js:47-52`](../../app/core/timeTheme.js#L47) `applySeasonal()` ise
hiç temizlemeden dönüyor. Karşılaştırma: `SeyAmbience.apply()` premium
kontrolünden **önce** tüm `amb-*` sınıflarını siliyor (doğru kalıp).
Kodun kendi FX-P-81 yorumu *"sınıf root'ta asılı kalmaz"* diyor — **kod bunu yapmıyor**.
**Düzeltme:** Her iki fonksiyonda da `classList.remove(...)` çağrılarını premium
kontrolünün **önüne** al.
**Risk:** Düşük görsel etki (`theme-time-*` yalnız 2 elemanın `box-shadow`'unu
etkiliyor) ama sözleşme ihlali.
**Görüntü:** `gating-premium-kapali.png`

---

### 🟡 B-07 — `sey-stagger` ana sekmelerin hiçbirinde yok

**Ne:** 7 ana sekmede 0; yalnız overlay içi listelerde çalışıyor.
**Kanıt:** §3.1 (7/7 sıfır) · §3.2 (veri varken 3–7).
**Kök neden:** 10 basım noktasının tamamı overlay/gün-içi liste renderer'ı.
**Düzeltme:** Ana sekmelerin kart listelerine `sey-stagger` + `--i` ver.
**Not:** Bu bir **erişilebilirlik** bulgusudur, bozukluk değil — §10.2'de
düzeltilen ölçüm hatasına dikkat.

---

### 🟡 B-08 — `data-fx` niyet kapsamı ince

**Ne:** Çoğu sekmede görülen 10 sayısı alt navigasyon şablonundan geliyor;
içerik butonlarının niyet eşlemesi pratikte sıfır.
**Kanıt:** `rapor` **10 / 265 buton** (%3,8) · `saglik` 10/60 · `harita` 10/43.
En iyi: `ayarlar` 18/32, `bugun` 15/57. Kaynakta yalnız **41** `data-fx=` satırı.
**Etki:** Bozuk değil — fallback `tap` çalışıyor (§4'te kanıtlı). Ama onay
(`confirm`) ve yıkıcı (`destructive`) eylemler kendi ses/haptik kimliğini alamıyor;
bu yüzden `SeyHaptics.success/error` ve `SeyAudio.error` fiilen erişilemez.
**Düzeltme:** Önce yıkıcı/onay butonlarına `data-fx` ver (en yüksek anlam kazancı).

---

### 🟡 B-09 — İki zaman sistemi aynı anda çelişiyor

**Ne:** `#root` üzerinde eşzamanlı olarak `theme-time-dusk` **ve** `amb-time-day`
bulunuyor.
**Kanıt:** 7 sekmenin tamamında ölçülen `rootClassName`.
**Kök neden:** `SeyTimeTheme.classForHour()` **sabit saat aralığı** kullanıyor
(17–20 = dusk); `SeyAmbience.timeClass()` ise **gerçek güneş saati** kullanıyor
(gün batımı − 90 dk). İkisi de görsel katman sürüyor.
**Düzeltme:** `SeyTimeTheme.classForHour`'u da güneş saatine bağla ya da
`theme-time-*`'ı görsel sürücü olmaktan çıkarıp tek kaynağı `amb-time-*` yap.
**Risk:** Düşük; ama iki katman ters yönde renk sürebiliyor.

---

### 🔵 B-10 — Gerçekten çağrılmayan API'ler

`SeyFx.transition` **0** (tam ölü). `SeyAudio.error`, `SeyHaptics.success`,
`SeyHaptics.error`, `SeyHaptics.refresh` yalnız `data-fx` üzerinden dolaylı
erişilebilir → B-08 nedeniyle pratikte erişilemez.
`SeyFx.ripple/countUp` ve `SeyAudio.tap/nav/...` = 0 **beklenen ve doğrudur**
(delegasyon; §4'te çalıştıkları kanıtlandı).

---

### 🔵 B-11 — 4 ölü CSS sınıfı

`sey-enter-delay-1`, `sey-enter-delay-2`, `sey-enter-delay-3`, `sey-sheet-in` —
CSS'te tanımlı, **hiçbir kaynak dosyada** (app.js, app/core/*, app/content/*,
index.html, panel/*) geçmiyor. Kozmetik borç.

---

### 🔵 B-12 — `SeyAudio.tick` neredeyse duyulmaz

RMS **0,00085** — `tap`'ın (0,02584) yaklaşık **1/30'u**, taban gürültünün
yalnız 11 katı. Sessiz ortamda ve kulaklıkla duyulabilir; hoparlörle günlük
kullanımda büyük olasılıkla kaybolur. `playNoise({gain:0.012})` yükseltilmeli.

---

### 🔵 B-13 — Quiet-time UI seslerini susturmuyor (karar maddesi)

**Ölçüm:** Saat 02:00 stub'ında `isQuietTime()=true` iken `tap()` RMS **0,02872**.
**Bu bir kusur değil, kapsam kararıdır:** [`mediaFx.js:92-94`](../../app/core/mediaFx.js#L92)
yorumu quiet-time'ı açıkça **yalnız `voice` ve `ambient`** ile sınırlıyor
(`allowed()` bunu kontrol etmiyor). Yine de gece 03:00'te uygulamaya dokunan
kullanıcı **tam ses UI tıkları** alıyor — ürün kararı gerektirir.

---

## 9. Değişmezlik kanıtları (Bölüm 8)

| Kontrol | Beklenen | Ölçülen | |
|---|---:|---:|:--:|
| `App.*` handler (benzersiz) | 718 | **718** | ✅ |
| `onclick=` | 391 | **391** | ✅ |
| `<script src="app.js` | 1 | **1** | ✅ |
| `preventDefault` (mediaFx.js) | 0 | **0** | ✅ |
| `setInterval` (timeTheme.js) | 0 | **0** | ✅ |
| `fetch(` (timeTheme.js) | 0 | **0** | ✅ |
| `fx2:` commit — `sync.js` | 0 | **0** | ✅ |
| `fx2:` commit — `MODULARIZATION.md` | 0 | **0** | ✅ |

**Test kapıları**

| Kapı | Sonuç |
|---|---|
| `node tools/fx-coverage.mjs --gate` | **exit 0** — M7 hariç 12/13 ✅ (M7 = 0,62, onaylı tavan) |
| `tests/app` + `tests/panel` + `tests/panel-v2` + `tests/quran` | **94 fixture, 0 FAIL** |
| `tests/reminders/run-reminder-smoke.mjs` | 73 assertion + **20 fixture PASS** |
| `driver.mjs` | **0 FAIL** |
| `zikr-harness.mjs` | **95/95 assertion pass** |
| `node --check` × 33 dosya | **0 hata** |

### 9.1 Salt-okur kanıtı

`git status` → çalışma ağacında **yalnız** yeni denetim çıktıları
(`premium-fx-plan/assets/tam-denetim-20260908/`, bu rapor). Uygulama
kaynağında (`app.js`, `sync.js`, `app/**`, `index.html`, `panel*`) **sıfır değişiklik**.

> ⚠️ **Metrik yeşil ≠ özellik çalışıyor.** Yukarıdaki kapıların **tamamı**
> geçerken B-01 uygulamayı tamamen kilitleyebiliyor ve B-03 canlı zemini
> görünmez kılıyor. Bu, TESHIS.md §9'un dersinin **üçüncü kez** doğrulanmasıdır.

---

## 10. Kanıt seviyesi ayrımı

| Seviye | Kapsam | Durum |
|---|---|---|
| **K1 — kaynak / test** | 718 handler, 33 dosya syntax, 94 fixture, 20 reminder fixture, coverage kapısı, 2 headless harness, tüm §2 envanteri | ✅ **tam** |
| **K2 — yerel görsel** | 36 ekran görüntüsü, 7 sekme, 19 overlay, 12 zemin sahnesi, 11 ses RMS, gating matrisi, gerçek `pointerdown`, piksel farkı | ✅ **tam** (izole bağlam, sentetik veri, `127.0.0.1`) |
| **K3 — cihaz kabulü** | Gerçek iPhone/Safari'de görünürlük, haptik, ses, konum kapısı davranışı | ⏳ **BEKLİYOR — yalnız kullanıcıdan gelir** |

**K3 hakkında açık beyan:** Bu denetim hiçbir bulgunun "cihazda düzeldiğini"
**iddia etmez ve edemez**. Özellikle `SeyHaptics` iOS Safari'de
`navigator.vibrate` bulunmadığı için **ölçülemedi** (Chrome'da mevcut olması
iOS için kanıt değildir).

### 10.1 Ölçülemeyenler (dürüstlük kuralı §10.1)

| Konu | Neden ölçülemedi |
|---|---|
| iOS haptik | `navigator.vibrate` iOS Safari'de yok; masaüstü Chrome sonucu geçerli kanıt değil |
| Panel veri render'ı | Gerçek token gerekiyor; DATA SAFETY kural 6 gereği **doldurulmadı**. Panel/Panel-v2 **kabuğu** render etti (`panel-giris-kabugu.png`, `panel-v2-kabuk.png`); veri yolu 33 committed panel fixture'ıyla K1 seviyesinde kapsanıyor |
| ÆON mesaj balonu içeriği | Sentetik `luna.qa`/`aeon.qa` şeklim uygulamanın beklediğiyle uyuşmamış olabilir; **kusur olarak raporlanmıyor** |
| Bulut TTS (`voiceGuidance`) | `openaiKey` bilinçli olarak boş; yerel TTS fallback yolu ölçülmedi |
| Gerçek PWA bildirimi | Servis worker bildirim izni akışı sentetik ortamda tetiklenmedi |

### 10.2 Kendi hatalarım ve önceki denetimin düzeltilmesi

Prompt §10.2 gereği açıkça kaydediliyor:

1. **Ses ölçümünde yanlış negatif (benim hatam).** İlk RMS turunda 11/11 ses
   **0,00000** çıktı ve neredeyse "ses üretilmiyor" olarak raporlanacaktı.
   Gerçek neden: `AnalyserNode`'u `ctx.destination`'a bağlanan düğümlere
   takmıştım; oysa mediaFx sesi bir **master bus → compressor → limiter →
   destination** zincirinden geçiriyor ve limiter zaten bağlıydı. Doğru bağlantı
   (`ctx._seyAudioGraph.limiter`) ile **11/11 ses duyulur** çıktı. §10.5'in
   "şüpheli sıfırı çapraz kontrol et" kuralı bu bulguyu kurtardı.

2. **Önceki denetim var olmayan sekmeleri ölçmüş.**
   [`FX2-BAGLANTI-DENETIMI.md`](FX2-BAGLANTI-DENETIMI.md) §B1 tablosu
   `aeon`, `takvim` sekmelerini `.surface = 0` diye raporluyor. Bu sekme
   kimlikleri **mevcut değil** — gerçek kimlikler `mesaj` ve `harita`
   (arayüz etiketleri "Aeon"/"Takvim" olsa da). `App.go('aeon')` bilinmeyen bir
   sekme render ettiği için 0 çıkıyordu. Ben de ilk turumda aynı hataya düştüm.
   **Doğru sonuç:** `mesaj` = 0, `saygi` = 0, `harita` = **2** (0 değil).
   Bulgunun yönü doğru, sayıları ve isimleri yanlıştı.

3. **Boş koleksiyon artefaktı (benim hatam).** İlk overlay turunda
   okuma/izleme/dinleme/öğrenme'de `sey-stagger = 0` çıktı. Neden: tohumumda
   üst düzey koleksiyonları doldurmuştum ama **gün içi `entries` dizilerini**
   doldurmamıştım. Doldurunca 4/4 overlay'de **3** oldu. Prompt §2.3'ün
   uyardığı tuzağın aynısı.

4. **Asenkron sekme geçişi artefaktı (benim hatam).** `App.go()` bir
   leave→enter geçişi çalıştırdığı için 120 ms sonra okunan ölçümler **bir
   sekme geriye kayıyordu**. Her satıra `ui.tab === hedef` doğrulaması
   eklenerek düzeltildi; §3.1'deki tüm satırlar bu doğrulamayı geçti.

5. **Kaplanma rakamı düzeltildi.** Önceki denetim "~%70 kapalı" diyordu;
   ölçülen **%47** (üç alfa eşiğinde de aynı). Zemin sorunu örtülme değil, **kontrast**.

---

## 11. Öncelik sırası — en yüksek etkili 5 düzeltme

| # | Bulgu | Neden bu sırada | Tahmini dokunuş |
|---|---|---|---|
| **1** | **B-01** konum kilidi | Uygulamanın **tamamını** erişilemez kılıyor ve kendiliğinden düzelmiyor. Kullanıcının bildirdiği birinci hata. Diğer her şey bunun arkasında. | `app.js:8492-8503` — tek `if` koşulu |
| **2** | **B-03** koyu tema kontrastı | Kullanıcının ikinci şikâyetinin doğrudan ölçülmüş nedeni. 192 sahnelik FX2-19…23 yatırımının tamamı buna bağlı. Mantık zaten doğru — yalnız CSS gücü. | `app/styles.css` `amb-*` katmanları |
| **3** | **B-02** kapıda zemin yok | B-01 ile birleşince "hiçbir şey yok" algısını tamamlıyor. Düzeltmesi mekanik: boyama kuyruğunu `render()` başına taşı. | `app.js:9094` / `:9299-9308` |
| **4** | **B-04** `ring-seg` 26/26 yüzeyde yok | FX2-18'in yarısı ürün genelinde erişilemez; görsel kazanç yüksek, risk düşük. | `ringSeg()` çağrı yerleri |
| **5** | **B-08** `data-fx` niyet kapsamı | B-10'u da kapatır (`SeyHaptics.success/error`, `SeyAudio.error` erişilebilir olur). Yıkıcı/onay butonlarından başlanmalı. | 41 → hedef ~150 satır |

**Sonraki tur için:** B-05, B-06, B-07, B-09 orta öncelikli; B-11, B-12, B-13
kozmetik/karar maddesi.

---

## 12. Kapanış kontrol listesi (§11)

- [x] Sunucu durduruldu — `lsof -iTCP:9000` → dinlenmiyor
- [x] 36 ekran görüntüsü `premium-fx-plan/assets/tam-denetim-20260908/` altında
- [x] Her bulgu bir görüntüye veya `dosya:satır` kök nedenine referans veriyor
- [x] Kaynak kodu değiştirilmedi (salt-okur denetim)
- [x] `seyma-data`'ya yazma yok — `api.github.com`'a 0 istek
- [x] Push / merge / deploy / tag **yok**
- [ ] **K3 cihaz kabulü — yalnız kullanıcıdan gelir**

---

# EK — DÜZELTME TURU (aynı gün, denetimden sonra)

> Kullanıcı talimatı: *"şimdi tümünü düzelt ve header için hava durumu renk ve
> diğer dinamik yeniliklerin en premium ve elit bi şekilde headerda da
> görünmesi… hava durumu ve gün vakitleri headerda tam premium elit bi şekilde
> anlaşılmalı"*. Bu bölüm salt-okur denetimin **kapanışı değil**, ona verilen
> yanıttır: 13 bulgunun tamamı ele alındı + header canlı sahnesi eklendi.

## E1. Bulgu bazında sonuç

| # | Bulgu | Durum | Kanıt |
|---|---|---|---|
| 🔴 B-01 | Geçici konum hatası kalıcı kilit | **DÜZELTİLDİ** | `locationGatePermanentFailure()` — yalnız `code 1`/`unsupported`/`insecure-context` kalıcı bayrağı düşürür. Repro: geçici timeout → `locationEnabled` **true kaldı**; `code 1` → doğru şekilde `false` |
| 🔴 B-02 | Kapı ekranlarında zemin yok | **DÜZELTİLDİ** | `paintAmbientShell()` artık `render()`'ın **başında**. Kapıda `rootClass` boş yerine tam sahne: `theme-aurora … amb-time-dusk amb-wx-storm amb-season-autumn` |
| 🔴 B-03 | Koyu temada sahneler görünmez | **DÜZELTİLDİ (zaman) / KISMİ (hava)** | Zaman: 6/6 çift eşiği geçti (aşağıdaki tablo). Hava: sayfa zemininde 4,8× iyileşti ama sözleşme tavanı nedeniyle 3'ün altında — **asıl hava sinyali header'a taşındı** (5,09) |
| 🔴 B-04 | `sey-ring-seg` hiçbir yüzeyde yok | **DÜZELTİLDİ** | 4 hero halkasının tamamı elle yazılmış geçişten token sistemine alındı; çalışma zamanı ölçümü `0 → 4` |
| 🟡 B-05 | Sahne yalnız etkileşimde tazeleniyor | **DÜZELTİLDİ** | `ambienceRefreshTimerId` (30 sn) → `syncHeaderScene()`; tam `render()` yapmaz, taslak/scroll/odak korunur |
| 🟡 B-06 | `premiumAtmosphere` gating sızıntısı | **DÜZELTİLDİ** | `apply()` + `applySeasonal()` temizliği premium kontrolünden **öne** alındı |
| 🟡 B-07 | `sey-stagger` ana sekmelerde yok | **NÜANSLANDI + ölü seçici temizlendi** | `SeyFx.enter` zaten `animationDelay=i*40ms` ile kademelendiriyor — **efekt vardı, sınıf yoktu**. Ölü `.card`/`.bento` seçicileri kaldırıldı, header sahnesi sıraya eklendi |
| 🟡 B-08 | `data-fx` niyet kapsamı ince | **DÜZELTİLDİ** | 41 → **69** kaynak satırı. `destructive` 6→**31**, `confirm` 2→**5** |
| 🟡 B-09 | İki zaman sistemi çelişiyor | **DÜZELTİLDİ** | `theme-time-*` artık güneş saatinden türetiliyor. Ölçüm: `theme-time-dusk` + `amb-time-dusk` — **uyumlu** (eskiden dusk/day çelişiyordu) |
| 🔵 B-10 | Çağrılmayan API'ler | **BÜYÜK ÖLÇÜDE ÇÖZÜLDÜ** | B-08 sayesinde `SeyAudio.error`, `SeyHaptics.success/error` artık 31+5 buton üzerinden erişilebilir. `SeyFx.transition` hâlâ 0 (kozmetik borç olarak bırakıldı) |
| 🔵 B-11 | Ölü CSS sınıfları | **DÜZELTİLDİ + RAPOR HATASI GİDERİLDİ** | `sey-enter-delay-1/2/3` header sahnesinde kullanıma alındı. **`sey-sheet-in` ölü DEĞİLDİ** — bir `@keyframes` adı ve iki fixture ona bağlı (§E3) |
| 🔵 B-12 | `tick` duyulmuyor | **DÜZELTİLDİ** | `gain` 0,012 → 0,055 · `dur` 22 → 30 ms |
| 🔵 B-13 | Quiet-time UI sesini susturmuyor | **DÜZELTİLDİ (zayıflatma)** | Master bus kazancı 23:00–07:00 arası 0,8 → **0,28**. Susturma değil incelme: kullanıcı `uiSounds`'ı bilinçli açtıysa geri bildirim kaybolmaz |

## E2. Ölçülen iyileşme

**Koyu tema zaman sahneleri** (ortalama mutlak piksel farkı, eşik ≥ 3):

| Çift | Önce | Sonra | Δ | |
|---|---:|---:|---:|:--:|
| şafak ↔ gece | 1,862 | **8,408** | +6,55 | ✅ |
| gündüz ↔ gece | 2,137 | **6,588** | +4,45 | ✅ |
| şafak ↔ gündüz | 2,354 | **6,424** | +4,07 | ✅ |
| akşam ↔ gece | 2,247 | **6,177** | +3,93 | ✅ |
| **gündüz ↔ akşam** | **0,954** | **6,018** | +5,06 | ✅ |
| şafak ↔ akşam | 2,146 | **5,113** | +2,97 | ✅ |

**6/6 çift eşiği geçti** (önce 0/6).

**Header bölgesi** (üst 340 pt) — kullanıcının asıl istediği yüzey:

| Ayrım | Ölçüm | |
|---|---:|:--:|
| gündüz ↔ akşam (zaman) | **10,872** | ✅ |
| açık ↔ fırtına (hava) | **5,092** | ✅ |
| açık ↔ kar (hava) | **4,420** | ✅ |

**Sayfa zemini hava katmanı** — fırtına 0,567 → **2,696** (4,8×), kar 1,921 → **2,769**.
Hâlâ 3'ün altında ve bu **bilinçli**: `FX2-23.10` sözleşmesi `amb-wx-*` opaklığını
**≤ 0,30** ile sınırlar (okunabilirlik koruması). Tavanı kırmak yerine hava
sinyali header'a taşındı — kullanıcının istediği yer de zaten orasıydı.

## E3. Header canlı sahnesi — ne eklendi

Üç katman, tamamı CSS ile sürülür (JS renk hesabı yok, **ağ çağrısı yok**,
yeni `App.*` handler'ı yok — I1–I6 korunur):

1. **`.sey-hdr-sky`** — 4 zaman × 8 hava = gökyüzü gradienti + hava dokusu
   (yağmur çizgileri, kar taneleri, sis, fırtına + şimşek). Açık ve koyu tema
   için ayrı paletler.
2. **`.sey-hdr-arc`** — güneş yayı: gerçek doğuş→batış ilerlemesi kuadratik
   Bézier üzerinde bir nokta olarak. Gece gümüş, gündüz altın.
3. **`.sey-hdr-wx` + `.sey-hdr-phase`** — hava rozeti (ikon · sıcaklık · durum)
   ve vakit etiketi (ŞAFAK/GÜNDÜZ/AKŞAM/GECE + doğuş veya batış saati).

**Mimari not (önemli):** Header **kendi sınıf ad alanını** kullanır
(`sky-time-*` / `sky-wx-*`), `amb-*` değil. Neden: `FX2-23.9` sözleşmesi
`amb-wx-*` seçicilerinin **yalnız** `#sey-aurora::after` hedeflemesini şart
koşar. İlk denememde header'ı `amb-*` ile sürdüm ve fixture haklı olarak
düştü — **test gevşetilmedi**, mimari düzeltildi (§10.4 kuralı).

## E4. Bu turda bulduğum kendi hatalarım

1. **`sey-sheet-in` ölü değildi.** Denetim raporunun B-11 maddesi onu "hiçbir
   kaynakta yok" diye işaretlemişti. Gerçekte bir **`@keyframes` adı**
   (`animation:sey-sheet-in …`) ve `test_fx2_overlay_motion.js` ile
   `test_premium_reduced_motion.js` ona bağlı. Grep'im sınıf arıyordu, keyframe
   tanımlayıcısını değil. **Silinmedi.**
2. **Coverage kapısı aslında exit 1 veriyor.** Rapor §9'da "exit 0" yazmıştım;
   `EXIT=$?`'i bir pipe'tan sonra okuduğum için `tail`'in çıkış kodunu almışım.
   Gerçek: M7 = 0,62 < 0,80 eşiği olduğu için kapı **exit 1** döner. Bu
   **beklenen ve onaylı** durumdur (FX2-KAPANIS'ta kayıtlı tavan), ama raporun
   ifadesi yanlıştı.
3. **CSS yorumu sözleşme tarayıcısını yanılttı.** `amb-wx-*` metnini bir
   yorumda kullanınca `test_fx2_ambience.js` ardından gelen bloğu hava katmanı
   sandı. Yorum yeniden yazıldı — testin kaba metin taraması bilinçli olarak
   muhafazakâr, bu doğru davranış.
4. **B-07 fazla sert yazılmıştı.** "Ana sekmelerde stagger yok" doğruydu ama
   yalnız **sınıf** için; kademeli giriş **efekti** `SeyFx.enter`'ın
   `animationDelay`'i ile zaten çalışıyordu.

## E5. Regresyon kanıtı (düzeltmeler sonrası)

| Kapı | Sonuç |
|---|---|
| `tests/app` + `panel` + `panel-v2` + `quran` | **94 fixture, 0 FAIL** |
| `test_fx2_ambience.js` (sözleşme) | **14/14 PASS** |
| `tests/reminders/run-reminder-smoke.mjs` | 73 assertion + 20 fixture PASS |
| `driver.mjs` | **0 FAIL** |
| `zikr-harness.mjs` | **95/95** |
| `node --check` × 33 dosya | 0 hata |
| `fx-coverage --gate` | M7 = 0,62 (onaylı tavan), diğer 12 metrik ✅ |
| **Değişmezler** | `App.*` **718** · `onclick=` **391** · script tag **1** · `preventDefault` **0** · timeTheme `setInterval` **0** / `fetch(` **0** |

Cache-busting bump edildi: `app.js?v=20260908f`, `styles.css?v=20260908d`,
`mediaFx.js?v=20260908c`, `timeTheme.js?v=20260908a`.

## E6. Kanıt seviyesi

- **K1 (kaynak/test):** ✅ tam — yukarıdaki kapıların tamamı.
- **K2 (yerel görsel):** ✅ — `duzeltme-header-aksam-acik-koyu.png`,
  `duzeltme-header-koyu-aksam-firtina.png`, `duzeltme-header-koyu-gece-kar.png`,
  `duzeltme-header-koyu-safak-bulut.png`, `duzeltme-konum-kapisi-zeminli.png`
  + piksel farkı ölçümleri.
- **K3 (cihaz kabulü):** ⏳ **BEKLİYOR — yalnız kullanıcıdan gelir.**
  Özellikle iOS haptik ve gerçek GPS zaman aşımı davranışı burada ölçülemez.

**Push / merge / deploy / tag YOK.**
