# 🕌 İLHAM & İBADET — Profesyonel Genişletme Planı (v2)

> **Kapsam:** İlham & İbadet sekmesini (Saygı öncüsü + İman Köşesi) tek, premium,
> bilimsel-zenginleştirilmiş bir "manevi sığınak" hub'ına dönüştürmek — içinde
> tam işlevsel bir **Zikirmatik**, **Hicri/Miladi akıllı takvim**, **Kıble & pusula**,
> **ay/gün mübarek günleri**, **takip istatistik raporu** ve **panel aynası** ile.
>
> **Bağlamlar:** Mevcut Faz 34 (Saygı+İman Köşesi) ve Faz 33 (Zihin-Beden
> Arşivi) tamamladı; bu plan Faz 35'ten başlar. Tüm teknik ilkeler
> (`GELISTIRME-PLANI.md` §"Uyulacak teknik ilkeler") geçerlidir.

---

## Uygulama denetimi — 2026-07-29

Kod-plan karşılaştırmasında önceki teslimin ana özellikleri çalışır durumda olsa
da planın bütünüyle uygulanmadığı görüldü: `ui.faithTab` beşli hub akışı yoktu,
ısı haritası CSS'i kullanılmıyordu ve panelde yıllık ayna bulunmuyordu. Bu
denetimde zorunlu boşluklar tamamlandı: gerçek `Öz | Öncü | İman | Zikir |
Rapor` sekmeleri, uygulama + panelde 365 günlük ibadet ısı haritası, görünür
10×10 öncü koleksiyonu ve modal altında kalıcı `Okudum` eylemi. Zikirmatik ayrıca
Diyanet'in yaygın sırasıyla 99 Esmâ ve TDV'nin asıl-ebced harf değerlerinden
hesaplanan geri sayım hedefleriyle genişletildi (`esmaulHusnaV1.js`). Faz 41
aylık cetvel isteğe bağlı olduğundan kapsam dışında kalmaya devam eder. Paket
branch üzerinde doğrulandı; canlıya alınmadı.

### Zikirmatik v2 uygulama revizyonu — 2026-07-29

Zikirmatik bu genel planın eski günlük hedef yaklaşımını aşan, yalnız bu özelliğe
odaklı `ZIKIRMATIK-GELISTIRME-PLANI.md` uyarınca yenilendi. Esmâ hedefi artık
yalnız ebced sayısında biten günlük set değildir: ebced bir tur, `ebced²` kalıcı
tam hatimdir. Tam ekran bağımsız sayaç, ayrı Esmâ yolculukları, Hatimlerim,
idempotent v2 migration, erişilebilirlik ayarları, panel ayrıntıları ve monotonik
cihazlar arası merge tamamlandı. Kabul örneği el-Fettâh `489² = 239.121`;
headless sınır/reload/preset/undo testleri geçmektedir. Cache `20260730n`.

### Zikirmatik Tefekkür Günlüğü — 2026-07-30

Sayaç altındaki günlük bölüm her Esmâ/zikir için ayrı duygu, his, düşünce ve
dua/niyet kaydı tutar. Kayıtlar `data.zikr.reflections[]` V4 şemasında
`date+presetId` kimliğiyle kalıcıdır; Geçmiş sekmesinde tarih ve isim bazlı
arşivlenir, ÆON panelinde bugünkü KPI, seçili gün tam metni ve son kayıtlar
olarak aynalanır. Çoklu cihaz birleşimi `updatedAt` ile en yeni düzenlemeyi
korur ve farklı zikir notlarını union olarak taşır. Headless sayaç 78/78,
sync 64/64, panel 44/44 doğrulandı; cache `20260730y`.
Feature commit `0963c19`, GitHub Pages workflow `30533428561` ile `main`
üzerinden canlıya alındı.

---

## 0. Vizyon & Tasarım Dili

İlham & İbadet sekmesi artık iki ayrı preview kartının yan yana durduğu bir liste
değil; **üstte "manevi özet çubuğu"** (sıradaki vakit + geri sayım, hicri tarih,
mübarek gün rozeti, günlük hatırlatma), **altta dört net alan**: Saygı Öncüsü +
İman Köşesi + **Zikirmatik** + **İbadet Rapor**. Kompakt başlıktaki "İlham &
İbadet" adını korur, hub içi sekme çubuğu `Öz | Öncü | İman | Zikir | Rapor`
olarak ayırt edilir (`ui.faithTab`). **İbadet Rapor bu beşinci sekme** — ayrı
bir ekran değil, hub'ın kendi içinde.

**Accent ailesi:** Mevcut `--faith` (altın-zeytin) korunur; **zikirmatik** için
yeni `--zikr` (derin turkuaz-mürdüm geçiş `--zikr2`), **hicri takvim** için
`--hijri` (ince ay-gümüşü `--hijri2`), **mübarek gün** için `--kandil` (yumuşak
nar çiçeği `--kandil2`) `.light` ve `#root[data-theme="dark"]` bloklarına eklenir.
Hiçbir sabit hex kullanılmaz.

**Tone:** Sıcak, nezaketli, flamingo'lu; ama bu hub içinde daha sade/huzurlu —
manevi alanın ağırlığını taşıyan, gösterişli değil **derin** bir premium his.
"Raşit'le birlikte bir nefes alanı."

### 0.1 Premium Kozmetik Katmanı (Faz 42) — "İlham & İbadet'i bir mücevher gibi göster"

Bu planın tamamı uygulanmadan önce, tek bir **kozmetik premium pass** ile hub
zaten mevcut olan `İlham & İbadet` başlığının altında **görsel olarak daha zengin,
daha derin, daha premium** görünür hâle getirilir. Bu katraman hiçbir veri modelini
veya işlevi değiştirmez; yalnızca görsel yüzeyi, mikro-animasyonları ve hissiyatı
iyileştirir. Manevi alanın ağırlığına hizmet eden, zarif ve sakin bir premium.

**Katmanın ana kaideleri:**
- Hiçbir sabit hex; tümü mevcut accent değişkenlerinin **katmanlı** kullanımı
  (örn. `linear-gradient(135deg, color-mix(in srgb, var(--faith) 18%, transparent), color-mix(in srgb, var(--faith2) 8%, transparent))`).
- iOS'ta `backdrop-filter:blur(20px) saturate(200%)` (light) / `blur(24px) brightness(0.9)` (dark) ile **cam / liquid-glass** kart yüzeyleri; `.sey-app-booted` scope'unu genişletilmez (sadece yüzey — bu pass flaş yaratmaz, statik).
- Yeni accent `--glass` serisi (sınır çizgisi `:root` ve dark blokta; `--glass-bd`, `--glass-glow`).
- Tüm animasyonlar **statik / ilk-paint** (glow, shimmer sadece kart ilk açıldığında bir kez oynar; `.sey-app-booted` sonrası da kart içi mikro-animasyon değil, sadece hover/press durumlarında).

**Detaylı katman listesi → bkz. §7 (Faz 42).**

---

## 1. 🎯 Zikirmatik — Tam İşlevsel, Bilinçli, Bilimsel

**En yüksek öncelikli yeni özellik.** Manevi odağın ve farkındalığın ritmik,
dokunaklı, sezgisel aracısı.

### 1.1 Veri modeli (`data` objesine eklenir, `migrate()` backfill)
- `data.zikr` — kalıcı arşiv:
  - `presets`: kullanıcının kendi tanımladığı + hazır setler. Her preset:
    `{ id, name, phrase, target, color, favorite, createdAt }`
    (`Subhanallah` 33, `Elhamdülillah` 33, `Allahü Ekber` 34, `İstigfar` 100,
    ve kullanıcıya özel serbest metin).
  - `sessions[date]`: günlük kayıt; her `type` için `{ count, completedSets,
    lastAt }`. Birden fazla set tamamlanabilir (örn. 33→66→99).
  - `streak`: arka arkaya gün "en az preset hedefinin tamamlandığı" günler.
  - `settings`: `soundOn`, `hapticPattern`, `autoAdvance`, `defaultPresetId`.
- `data.days[date].zikr` — günlük hızlı özet (`{ totalCount, completedSets,
  usedPresets[] }`); sync ve panel otomatik alır.

### 1.2 Arayüz (Yeni tam ekran overlay + kompakt widget)
- **Bugün preview kartı** ("Zikir" çipi, günkü toplam sayı, tamamlanan set
  sayısı, küçük altın ilerleme noktaları) → dokunca overlay.
- **Zikirmatik overlay** (`zikrOverlayHTML()`): Reading/Watching hub şablonuna
  eş — `App.openZikr/closeZikr`, `ui.zikrView` (`counter | presets | stats`),
  segTab'lar.
  - **Sayaç görünümü:** Merkezde büyük, nefes alan, tıklanabilir **sayma alanı**.
    - Ortada dev rakam (mevcut count), etrafında preset hedefine doğru doldukça
      büyüyen progresif halka (SVG circle stroke-dasharray, `--zikr` accent).
    - Hedefe ulaşınca hafif **glow + parçacık konfeti** (CSS keyframe,
      `.sey-app-booted` güvenli, animasyonsuz fallback).
    - Alt alta preset adı ve `NİYETİM`: preset'e göre gösterilen kısa odak
      metni/dua ("Beni affet", "Sen her şeye kadirsin").
    - Uzun basışta **-1** (geri alma), çift tıkta **reset** (onaylı).
    - **Ses:** Yumuşak, düşük gürültülü "tık" (oscillator, gain envelope,
      Web Audio; her zaman `settings.soundOn` kontrollü, varsayılan açık).
    - **Haptic:** iOS'ta yoksa ve kapalıysa dikkate alınmaz; varsa `10ms`
      darbe deseni (`navigator.vibrate([10])`), hedef bitiminde `[10,40,10]`.
    - **Otomatik ilerleme** (`settings.autoAdvance`): Hedef bittiğinde 0.8 s
      sonra sonraki preset'e nazikçe geçer, kısa bildirim toast'ı gösterir.
    - **Oturum kaydı:** Her dokunma `data.days[date].zikr.totalCount++` ve
      preset'in count'unu günceller; değişiklik `save()` → `SeySync.schedule`.
  - **Preset yönetimi:** Hazır 4-5 set + kullanıcı tanımlı. Düzenleme,
    favorileme, silme. Klasik "yumuşak kart + sol accent bar".
  - **İstatistik sekmesi:** Haftalık/aylık toplam, seri, en çok kullanılan
    preset, gün bazlı küçük bar grafiği (`rapor` desenine uygun).

### 1.3 Bilimsel/sembolik zenginlik (nazik gömme)
- Her preset kartının altında 1 satır "mikro-bilgi": kalp atışıyla senkron,
  nefes ritmi ve dikkat odaklanması (farkındalık) ipucu. Örn. *"33 × 3 = 99;
  rahatlatıcı ritmik odak, dikkati dağılmadan toplar."*
- Büyük sayaç üzerinde gölgesiz, **okunaklı** tipografi (Inter/system, 70px+).

---

## 2. 🕌 İman Köşesi — Vakitler, Geri Sayım, Kıble & Cemaat Vurgusu

Faz 34'teki temel vakit takibini **derinleştir**: vakitler artık
**zaman-bilinçli** ve **yakınlaşma hissiyatı** verir.

### 2.1 Sıradaki vakit + geri sayım (real-time awareness)
- Overlay header'ında: `Sonraki vakit {name} · HH:mm kaldı` (dinamik dakikalık
  geri sayım; her dakika `render`'da yenilenen hesap — interval yok, `render()`
  bazlı, `.sey-app-booted` ile flaşsız).
- Kalan süreyi gösteren **şerit** (0 → 100%) ve sıradaki vakit adı gold vurgu.
- `App.tickPrayer()` her `render`'da çağrılır — saniye başı DOM güncellemesi
  yapmaz, sadece `render()` geldiğinde dakikalık yeniler (performans).

### 2.2 Kıble pusulası (yön + mesafe hissi)
- Vakit/Hicri şeridi ile hub sekmeleri arasında tek dokunuşluk, sabit gridli
  **Kıble · Gerçek Kuzey** kartı bulunur; İman Köşesi modalına gömülü değildir.
- Kullanıcının koordinatından Kâbe'ye yerel büyük-daire başlangıç azimutu ve
  Haversine mesafesi hesaplanır (Kâbe `21,4225° K · 39,8262° D`, ortalama Dünya
  yarıçapı `6371,0088 km`). Sonuç 0,1° ve 16 yön dilimiyle açıklanır.
- GPS yüksek hassasiyet ister ve metre cinsinden raporlanan doğruluğu saklar.
  Konum yoksa bunun gerçek konum olmadığı açıkça belirtilen Ankara fallback'i
  kullanılır.
- Canlı pusula yalnız mutlak yön veya iOS `webkitCompassHeading` verisini kabul
  eder; manyetik kaynak/sapma ve donanım etkileri kullanıcıya açıklanır. Sensör
  akışı tüm sayfayı render etmez, yalnız ibre ve ölçüm alanlarını boyar.
- Tam ekran pusula; hizalama farkını sağ/sol dönüş olarak verir, ekran yönünü
  hesaba katar, kalibrasyon ve mıknatıs/metal sınırlamalarını görünür tutar.

### 2.3 Cemaat & camii ruhu vurgusu
- Vakit satırlarında `cemaat` tiki artık daha belirgin: küçük insan ikonu,
  camide kılınırsa **altın kenarlık**.
- `prayerRowHTML` içinde "Sonraki" kartı `pulse` (hafif, 1.8 s, `--faith-glow`)
  ile nefes alır; tab değişimlerinde sabit kalır (Faz 32 flaş düzeltmesi deseni).

### 2.4 Aylık cetvel (isteğe bağlı genişletme)
- Vakit satırlarının altına küçük buton: `Bu ayın tamamı →` (ikinci katman
  overlay). 30 günlük tablo — ileride; bu plan kapsamında Faz 37'de.

---

## 3. 📅 Hicri & Miladi Akıllı Takvim + Mübarek Günler

**Kullanıcının gününe manevi bağlam katan** ince katman.

### 3.1 Veri + hesap
- `window.HijriCalendarV1` (`hijriCalendar.js`, frozen) — sabit tablo/lookup +
  küçük yardımcılar (Umm al-Qura yaklaşık, `hijriOffset` kullanıcı ayarına
  saygılı). Yeni modül, `index.html`'e eklenir (cache-bump gerekir).
- **Faz detaylarına girmez** — yalnızca *tarih* ve *ay* adı.
- `hijriTodayStr()` → `Ramadan 9, 1447` gibi kısa metin.

### 3.2 UI katmanı
- **Overlay header'ına** hicri tarih rozeti: küçük hilal ikonu + metin
  (`🌙 9 Ramazan 1447`).
- Hub üst özet çubuğunda: miladi altında gri küçük hicri satır.
- **Mübarek gün rozeti** `data.aeon.dailyFacts`'ten bağımsız: Aladhan API
  `/v1/hijriCalendar?date=...` (ya da offline tablo) çekilip **kandil/özel gün**
  varsa altın-kırmızı yumuşak rozet ("Regaip Kandili 🌸"). Cache'li (48 s).
- Kullanıcı `hijriOffset` ayarını `Settings` içinde ±2 gün kaydırabilir
  (yerel hilal farkı).

### 3.3 Panel yansıması
- Gün detayında `Hicri: 9 Ramazan 1447` satırı; özel gün varsa rozet.

---

## 4. 🌟 Saygı Öncüsü — Derinleştirilmiş İçerik & "Seri" Bilinçlendirme

İlhamın kalbi olan günün öncüsü bölümü daha **kişisel** hâle getirilir.

### 4.1 Öncü koleksiyonu + seri
- `data.saygi.collection`: okunan her kişi `{ id, name, readAt, favorite }` olarak
  işaretlenir; "100 öncüden X'i okundu" sayacı zaten var → altına küçük ızgara
  harita (10×10, okunanlar dolu altın, okunmayanlar soluk).
- **Seri:** arka arkaya gün okunan = altın "X gün üst üste İlham" rozeti.
  (Aynı `prayerStreak` deseni; `data.saygi.streak` hesaplanır.)

### 4.2 Kategori denge ipucu (soft rehberlik)
- 100 kişi 5-6 temaya ayrılır (bilim, sanat, liderlik, maneviyat, kaşif...).
- Okuma dağılımı gösterilir: "Ağırlıklı bilim (12) — biraz **maneviyat** da
  keşfet 🌿" nazik nudge'ı (rapor'a benzer). Kullanıcıya seçim baskısı yok.

---

## 5. 📊 İbadet Rapor — Haftalık/Aylık Özet & Panel Aynası

*(onaylandı)* "Bugün" ötesinde **anlam ve ilerleme** katmanı. **Bu rapor ayrı bir
ekran değil; İlham & İbadet hub'ının kendi içinde beşinci sekme** (`ui.faithTab='rapor'`):
`Öz | Öncü | İman | Zikir | Rapor`. Kullanıcı `İlham & İbadet` sekmesinin
üstündeki segTab ile geçiyor; hub'ın premium kaplaması bu sekmenin de yüzeyi.

### 5.1 Rapor sekmesi içeriği (hub içi sekme, `ui.faithTab='rapor'`)
- Hero kart: "Bu haftanın manevi ritmi" — güncel seri, haftada kılınan vakit
  toplamı, cemaat oranı, zikir toplamı, hatim/ayet okuma. Kartın arka yüzü
  premium glass (`--glass-bd` kenarlık, `--faith-glow` ışıma, statik shimmer).
- KPI kartları: Haftada kılınan vakitler (bar), cemaat oranı, zikir toplamı,
  hatim/ayet okuma (varsa), seri — her biri kendi accent'inde cam kart.
- **Isı haritası:** GitHub-tarzı 7 sütun × N hafta; her hücre o gün `performedCount`
  oranına göre `--faith` tonu, üst gündeki vakit ayrıntısı için dokunup gün-
  detay paneline geçiş. `rapor` ekranındaki `moodHeatmapCard` desenine birebir
  uygun; ısı haritasına **gradient üst kenarlık** + haftası etiketleri.
- Küçük içgörü kartı (accent sağ kenarlık): "Bu hafta en güçlü alan **cemaat** 🧡,
  en eksik **zikir**; dilersen 3 setlik bir niyet başlat." — glass, dönen hafif accent.

### 5.2 Panel mirror (zorunlu ilke #4)
- Panel `panel.html` için bağımsız helper'lar (`PRAYER_NAMES_P` zaten var;
  `zikrSummaryP`, `zikrDayDetailP`, `hijriShortP`, `faithWeekKPIsP`).
- Yeni bento kartlar: **"İbadet Haftası"** (vakit/cemaat/kaza/nafile +
  seri), **"Zikir Özeti"** (toplam, haftalık grafik, aktif preset), **"Hicri
  Takvim"** (tarih + özel gün rozeti).
- Gün detay satırlarına: zikir sayısı, hicri tarih, mübarek rozet.

---

## 6. 🔧 Teknik Uygulama Detayları (Teknik İlkelerle Uyum)

1. **Tek `data` objesi:** Tüm yeni veriler `data.zikr`, `data.hijri` (cache) ve `data.days[date].zikr/prayer` altına girer. **Hiçbir ayrı store yok.**
2. **Tema:** 3 yeni accent seti (`--zikr`, `--hijri`, `--kandil`) hem light hem dark `:root` bloğuna; `sg-` (Saygı/İman) prefix'li CSS sınıfları korunur.
3. **Overlay deseni:** Zikirmatik ve (isteğe bağlı) aylık cetvel overlay'leri `soulOverlayShell()` / okuma-watching template'i birebir kopyalar; `App.openX/closeX`, `ui.xView`, segTabs, `sey-ov-back` ID'leri aynı.
4. **Panel mirror:** Her kalıcı veri paneli panelde de gösterilir; panel kendi idempotent backfill'ini her `render()`'da çalıştırır.
5. **Render güvenliği:** `render()` içine `curOverlay` zincirine `zikr`, (isteğe bağlı `prayCalendar`) eklenir; `soulOverlayShell()` benzeri **animasyonsuz** shell tercih edilir (Faz 32 flaş düzeltmesi tecrübesiyle).
6. **Cache-bump:** Yeni modül (`hijriCalendar.js`) ve değişen `app.js`, `styles.css` için `index.html` `?v=` artırılır.
7. **Gizlilik:** `zikr` verileri secret değil; `sync.js` sanitize listesi değişmez. GPS koordinatı zaten `settings.prayer.location` içinde (mevcut) — sanitize korunur.
8. **Tone:** Her düğme, toast, boş durum metni Türkçe + sıcak: *"Sevgili Günışığı, bugünün zikrini tamamladın 🧡"*.
9. **Migration:** `migrate()` içine `zikr`, `hijri` backfill ve eski veride `zikrCount` olmaması kontrolü eklenir. Boot sonunda mevcut `if(data){ save(); }` çağrısı backfill'i kalıcılaştırır.

---

## 7. 📋 Faz Faz İş Planı & Doğrulama

Kozmetik premium pass (Faz 42) tüm işlevsel fazlardan önce yapılır — böylece
kullanıcı yeni özellikleri gelmeden önce zaten premium hisli bir İlham & İbadet
görür. İşlevsel fazlar bu kaplamanın üstüne gelir.

| Faz | Başlık & odak | Öncelik | Durum | Ana etkileşimler (`app.js`) | Panel & notlar |
|-----|---------------|---------|-------|------------------------------|----------------|
| 42 | ✨ **Kozmetik Premium** — glass/glow/shimmer kaplama + 5. sekme Rapor polisajı + tüm hub mikro-premium'u | 1 | ✅ | Veri/işlev değişmez; glass kart stilleri, accent gradient'lar, zikir/iman/öncü/rapor yüzeyleri | Cache `20260730m` |
| 35 | 🎯 **Zikirmatik v2** — kalıcı yolculuk + Ebced² Tam Hatim | 1 | 🟡 | Çekirdek ve veri korunuyor; kullanıcı talebiyle kart/sekme/modal/panel canlıdan geçici gizlendi | iPhone 16 Pro Max opak tasarım revizyonu ayrı branch; cache `20260730o` |
| 36 | 🕌 **Sıradaki vakit + geri sayım** + cemaat/pulse vurgu + `currentPrayerIndex` geliştirme | 1 | ✅ | Header'da countdown, `App.tickPrayer`, pulse CSS (`.sg-faith-preview-row.next`), cemaat altın ikon | — |
| 37 | 🌙 **Hicri & Miladi takvim** + mübarek gün rozeti (`hijriCalendar.js`, offset) | 2 | ✅ | `window.HijriCalendarV1`, `hijriTodayStr`, ±2 gün kullanıcı kontrolü, rozet UI | Panel `Hicri Takvim` bento aynası |
| 38 | 🧭 **Bilimsel kıble kartı** (büyük-daire azimutu + mesafe + GPS), canlı cihaz yönü | 2 | ✅ | Üst hub kartı; gerçek-kuzey hedefi; 16 yön dilimi; yüksek hassasiyetli GPS; mutlak/manyetik sensör ayrımı; hedefli DOM boyama; açık kalibrasyon sınırları | — |
| 39 | 🌟 **Saygı koleksiyonu + seri** + kategori denge nudge'ı | 2 | ✅ | Tıklanabilir numaralı/✓ 10×10 grid; seçilen öncünün modalı + önceki/sonraki; yüklenirken dahi görünür sabit `Okudum` | Panelde "Öncü koleksiyonu" satırı |
| 40 | 📊 **İbadet rapor** sekmesi (KPI + yıllık ısı haritası) + panel mirror | 2 | ✅ | Gerçek 5'li `ui.faithTab`; haftalık KPI/bar + seçilebilir 365 günlük ısı | Panelde yıllık ısı bento kartı |
| 41 | 📅 (İsteğe bağlı) **Aylık vakit cetveli** overlay'i | 3 | ❌ | İkinci katman overlay; 30 gün tablo, gün seçici | — |

### Doğrulama zinciri (her fazda zorunlu)
1. `node --check app.js` (+ `hijriCalendar.js`) — sözdizimi.
2. **Headless `vm` harness** (`.claude/skills/run-seyma/driver.mjs` + özelleşmiş
   `prayer-harness.mjs` benzeri `zikr-harness.mjs`): zikir sayacı, preset ekle/sil,
   günlük backfill, geri sayım render, hicri tarih string, kıble hesap mock'u.
3. Temiz render regresyonu (`driver.mjs` hem light hem dark) — konsol hatası yok.
4. Migration testi: `migrate()` eski `seyma-reset-v1` (prayer/zikr/hijri olmayan)
   ile valid obje üretiyor; boot `save()` kalıcılaştırıyor.
5. Panel: `panel.html` inline script `node --check` benzeri (4/4 tag balance).
6. Cache-bump `?v=` ve GitHub Pages deploy → cihaz/PWA kontrolü.

---

## 7b. ✨ Faz 42 — Kozmetik Premium (detaylı katman listesi)

*(Onaylandı — tüm işlevsel fazlardan önce uygulanacak)* Amaç: İlham & İbadet
hub'ının **görünür premium his** kazanması, manevi ağırlığa hizmet eden zarif
bir kaplama. **Hiçbir veri/işlev değişimi yoktur**.

**Birincil değişiklikler:**
1. **Premium hub kartları** (`bugunHTML`'deki preview kartları ve her overlay kart):
   `glass` yüzey (light: `blur(20px) saturate(200%)`, dark: `blur(24px) brightness(0.9)`)
   + `1.5px` accent-borderlı gradient kenarlık (`border:1.5px solid transparent` +
   `background-clip:padding-box` + gradient `border-box` hilesi) + hafif iç parıltı
   (`inset 0 1px 0 rgba(255,255,255,.22)`).
2. **Altın dokunuşlar:** `--faith` rozetleri, seri sayaç `· {streak} gün seri`
   metni `--faith2` ile parlar; "Okundu"/"Bugün keşfet" durum pill'leri sakin
   glass rozet.
3. **Manevi özet çubuğu:** üstte ince, tek satır — sıradaki vakit, hicri tarih,
   mübarek gün rozeti — `glass` background + subtle gradient underlay (`var(--faith-bg)` 8%).
4. **5. sekme Rapor polisajı:** segTab pill'ler (`Öz · Öncü · İman · Zikir · Rapor`)
   aktif sekmede accent gradient + kalanlarında glass; Rapor açılınca hero kartta
   tek seferlik `shimmer` (`.sg-shine` keyframe, sonra durur — `.sey-app-booted`
   dostu).
5. **Zikirmatik overlay:** büyük sayaç alanı etrafında `--zikr` tonlu diffüz glow
   halo (`box-shadow: 0 0 60px color-mix(in srgb, var(--zikr) 30%, transparent)`);
   hedef dolumunda tek seferlik altın "tamam" sparkle (CSS keyframe).
6. **İman Köşesi satırları:** "Sonraki vakit" satırı `--faith-glow` ile statik
   olarak daha belirgin; cemaat tikinde küçük camilleşmiş insan ikonu accent.
7. **Saygı öncüsü kartı:** hero/thumbnail üstünde ince gradient vignette (`to top, rgba(0,0,0,.28), transparent 42%` dark / `rgba(255,255,255,.4), transparent 42%` light) — metin okunaklığı artar; kart hover'ında hafif `--faith2` kenarlık.
8. **Tipografi & aralık:** premium font stack (`Inter, SF Pro Display, -apple-system`),
   `letter-spacing:-0.01em` title'larda, kart içi boşluklar 14→16px, `border-radius`
   22→24px (preview kartlar).
9. **Mikro-durumlar:** `hover` (1.02× lift + shadow, `transform:translateY(-1px)`)
   ve `active` (0.98× press) durumları her kartta; tümü `.sey-app-booted` scope
   dışında, yalnızca ilk-paint ve etkileşim animasyonu — flaşsız render.

**CSS hedefleri:** `styles.css`'e `--glass-bd`/`--glass-glow` (light + dark) ve
`.sg-glass`, `.sg-gradient-border`, `.sg-shine` yardımcı sınıfları; `.sey-app-booted`
kapsamına `.sg-glass` dokunulmaz (statik yüzey — blur sabit).

## 8. Başarı Kriterleri (Bu Planın "Bitmiş" Sayılması)

- Zikirmatik overlay'inde preset seçimi, dokunma ile sayım, hedef bitiminde
  görsel/işitsel/haptic geri bildirim, otomatik ilerleme ve gün-seri çalışıyor.
- İman Köşesi'nde sıradaki vakit adı + dakikalık geri sayım ve cemaat/pulse
  vurgusu görülüyor; `cemaat` tikleri verimli kaydediliyor.
- Overlay ve özet çubuğunda doğru **hicri tarih** ve (varsa) **mübarek gün**
  rozeti gösteriliyor; kullanıcı offset ayarı yapabiliyor.
- Kıble yön gülü doğru açıyı gösteriyor (kullanıcı şehirdi bildiği için
  manuel doğrulanabilir).
- Saygı koleksiyon grid + seri sayacı doluyor; kategori ipucu nazik.
- İbadet rapor sekmesi haftalık vakit/cemaat/zikir barları + ısı haritası + içgörü
  satırı sunuyor; panel bento kartları aynı veriyi yansıtıyor.
- Tümü **animasyonsuz/flashsız**, her iki tema destekli, cache-bump'lı ve
  GitHub Pages canlı doğrulanmış.

---

## 9. Riskler & Notlar

- **API dayanımı:** Aladhan `timings` + `hijriCalendar` + `qibla` üçü de cache'li;
  rate-limit ve offline'da son cache kullanılır. Hata → eski veri, sessiz fallback.
- **performans:** Geri sayımı saniye başı değil, `render()` bazlı dakikada bir
  yenile; sayaç halkası SVG stroke animasyonu yalnızca durum değişiminde.
- **Ses politikası:** Sayaç sesi `settings.soundOn`'a bağlı; varsayılan açık ama
  toast göstermeden sessiz kapanabilir. Pil-hisli titreşim kısa (10 ms).
- **Görsel tutarlılık:** `.sey-app-booted` scope'una `.sey-zikr-ov-*` ve
  `.sg-hijri-*` eklenerek Faz 32'deki flaş/parlama düzeltmesi deseni korunur.
- **Veri güvenliği:** Hiçbir tarayıcı manuel açılmaz; headless harness kullanılır.
  `seyma-data`'ya yazma yalnızca kullanıcı onayı sonrası.
