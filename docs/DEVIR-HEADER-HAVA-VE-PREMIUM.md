# DEVİR PROMPTU — Header Hava Sahnesi Yeniden Tasarımı + Kalan Premium Dokunuşlar

> **Nasıl kullanılır:** Yeni bir oturum aç ve şunu yaz:
> *"`docs/DEVIR-HEADER-HAVA-VE-PREMIUM.md` dosyasını oku ve baştan sona uygula."*
>
> Bu belge **uygulama** talimatıdır (denetim değil). Kod değiştirirsin.
> GÖREV A için **tam yeniden yazım serbesttir** — mevcut header hava katmanı
> bilinçli olarak feda edilebilir. GÖREV B ölçülü, cerrahi dokunuşlardır.

---

## 0. ÖNCE OKU (atlamadan)

| Dosya | Neden |
|---|---|
| `CLAUDE.md` → **DATA SAFETY** | Veri kaybı geçmişi var (2026-07-10). Kuralları ihlal etme. |
| `archive/premium-fx-plan/deliverables/TAM-DENETIM-20260908.md` | **Devraldığın durumun tamamı.** §8 bulgular, §E ek bölümü düzeltme turu. |
| `archive/premium-fx-plan/RENK-VE-ZEMIN.md` | Şampanya altını paleti + 192 sahne sözleşmesi |
| `archive/premium-fx-plan/PLAN-FX2.md` | Değişmezler I1–I8, sözleşme S1–S8 |
| `tests/app/test_fx2_ambience.js` | **Katman ayrımı sözleşmesi.** GÖREV A'nın en sert kısıtı burada. |
| `docs/apple-design/IOS27-TASARIM-PLANI.md` | I1–I6 fonksiyonellik sözleşmesi |

---

## 1. VERİ GÜVENLİĞİ — PAZARLIK YOK

1. `mustafaras/seyma-data` reposuna **yazma**. Okuma serbest.
2. Gerçek token / parola / 2FA **isteme, doldurma, otomatikleştirme**.
   Giriş ekranını sentetik `settings.auth` tohumuyla aş.
3. `?forceSync=1` kullanma, `localStorage['seyma-sync-force']` **set etme**.
4. Yerel sunucu **yalnız `127.0.0.1:9000`** (CLAUDE.md kural 1 bu portla sınırlı;
   TAM-DENETIM promptundaki 9002 geçersizdir). **Turn bitmeden durdur.**
5. Push / merge / deploy / tag **YOK**. Commit serbest.
6. Tüm test verisi **sentetik**, daima **izole tarayıcı bağlamı**.

---

## 2. DEVRALDIĞIN DURUM

**Dal:** `premium-fx-gorsel-yuzey` · **Son commit:** `1b61c04`

Son iki commit'te olan biten:

- `138fe02` — tam denetim (13 bulgu: 4 🔴 · 5 🟡 · 4 🔵), 36 ekran görüntüsü
- `1b61c04` — 13 bulgunun tamamı düzeltildi + header'a canlı hava/vakit sahnesi

### 2.1 Header'da ŞU AN ne var

| Katman | Nerede | Ne yapıyor |
|---|---|---|
| `.sey-hdr-sky` | `app/styles.css:2023+` | 4 vakit gradienti + hava dokusu |
| `.sey-hdr-arc` | `app/styles.css:2127` | Güneş yayı, doğuş→batış ilerlemesi |
| `.sey-hdr-wx` | `app/styles.css:2108` | Hava rozeti (ikon · sıcaklık · durum) |
| `.sey-hdr-phase` | `app/styles.css:2146` | ŞAFAK/GÜNDÜZ/AKŞAM/GECE + saat |

**JS tarafı (`app.js`):**

| Fonksiyon | Satır | Sorumluluk |
|---|---:|---|
| `HDR_PHASE_TR` | 14948 | Vakit adı sözlüğü |
| `headerSkyClass(sc)` | 14954 | `amb-*` → `sky-*` ad alanı çevirisi |
| `headerSkyClassNow()` | 14959 | Canlı sahneden sınıf üretir (premium gating dahil) |
| `headerSolarProgress(spot)` | 14965 | 0–1 güneş ilerlemesi |
| `headerSceneHTML()` | 14973 | Şerit markup'ı (rozet + yay + vakit) |
| `syncHeaderScene()` | 15025 | 30 sn'lik tazeleme (tam render YOK) |
| `appHeaderHTML()` | 15036 | Header kabuğu, sky span'ini basar |
| `paintAmbientShell()` | 9122 | `#root` sahne sınıfları — `render()` başında |
| `wxMeta(code,isDay)` | 10227 | WMO kodu → `{emoji, label, cat}` |

**Kritik mimari not:** Header **kendi sınıf ad alanını** kullanır
(`sky-time-*` / `sky-wx-*`), `amb-*` **değil**. Sebebi §5.2'de — bu kısıtı
kırmadan çalış.

### 2.2 Ölçülmüş mevcut durum (yeniden üretilebilir)

| Ölçüm | Değer |
|---|---:|
| Header zaman ayrımı (gündüz↔akşam, ort. piksel farkı) | 10,872 |
| Header hava ayrımı (açık↔fırtına) | 5,092 |
| Header hava ayrımı (açık↔kar) | 4,420 |
| Sayfa zemini zaman çiftleri (6/6 eşik ≥3) | 5,11 – 8,41 |
| Sayfa zemini hava (açık↔fırtına) | 2,696 ⚠️ tavan kısıtı |

---

## 3. GÖREV A — HEADER HAVA SAHNESİ: TAM YENİDEN TASARIM 🔴

### 3.1 Sorun (kullanıcının kendi ifadesi)

> *"header daki hava durumu efectleri çok çirkin, Apple orijinal hava durumu
> gösterim ve tasarım dili ile hiç uyumlu değil. Daha kaliteli, son teknoloji
> efektler ve animasyonlar ile olmalı; gerekirse tam kod değişikliği ile bir
> kısımların tüm hava koşullarına göre düzenlenmesi gerekir."*

### 3.2 Mevcut uygulamanın dürüst kusur listesi

Bunları savunma — **yeniden yaz**. Kusurlar, onu yazan ajan tarafından kabul
edilmiştir:

| Sahne | Şu anki teknik | Neden çirkin |
|---|---|---|
| Yağmur | `repeating-linear-gradient` 96° çizgiler | Diyagonal **şerit/moiré** gibi okunuyor; damla değil. Tek hız, tek açı, tek opaklık. Derinlik yok. |
| Kar | 3 adet `radial-gradient` nokta, döşenmiş | **Puantiye** gibi. Taneler aynı boyutta, aynı hızda, dönmüyor, savrulmuyor. |
| Sis | Düz yarı saydam `linear-gradient` | Tek katman, hacim yok, kıpırdamıyor. |
| Fırtına | Yağmurun aynısı + `filter:brightness()` flaş | Şimşek **tüm katmanı** parlatıyor — ışık kaynağı yok, dallanma yok, gecikmeli gök gürültüsü ritmi yok. |
| Bulut | 2 adet `radial-gradient` blob | Bulut **şekli** yok, kenar yok, katman yok. |
| Açık hava | Tek diyagonal ışık huzmesi | Güneş **cismi** yok, atmosferik saçılma yok. |
| Gece | Sadece koyu gradient | **Yıldız yok, ay yok.** |
| Gökyüzü | 3 duraklı düz `linear-gradient` | Ufuk çizgisi yok, katman derinliği yok, güneş konumuna bağlı değil. |
| Güneş yayı | 1,4 px çizgi + nokta | İnce ve cansız; Apple'ın ölçülü zarafetinden uzak. |
| İkonlar | Lucide **çizgi** ikonları (`wxMeta`) | Apple SF Symbols'ın dolu/gradyanlı, çok katmanlı diline uzak. |

### 3.3 Hedef tasarım dili — Apple Weather

Referans alınacak ilkeler (birebir kopya değil, **dil uyumu**):

1. **Katmanlı derinlik / parallax.** En az 4 düzlem:
   `gökyüzü → uzak bulut → yakın bulut → yağış → ön sis/parlama`.
   Scroll ve cihaz eğimiyle (varsa) hafif parallax.
2. **Gerçek parçacık sistemi.** Yağmur/kar için değişken hız, boyut, opaklık,
   açı; rüzgâr yönü `data.weather.spots[0].wind`'den gelmeli. Kar tanesi
   savrulmalı (sinüs sapması), yağmur damlası çarpınca kısa **sıçrama** vermeli.
3. **Gök cismi.** Gündüz güneş diski + atmosferik parlama; gece ay (evre
   bilgisi varsa evreli) + **yıldız alanı** (hafif parıldama, `--amb-seed`
   ile deterministik dağılım).
4. **Solar-doğru gökyüzü.** Renk 4 kovadan değil, güneş yüksekliğinden
   sürülmeli (`sunrise`/`sunset` zaten var; `headerSolarProgress` hazır).
   Şafak/akşamda ufka yakın sıcak bant, zenit soğuk.
5. **Şimşek.** Tüm ekranı parlatan `brightness()` yerine: kısa **yönlü ışık
   patlaması** + isteğe bağlı dallanma; gecikmeli ikinci parlama (gök
   gürültüsü ritmi). Seyrek (≥30 sn) ve **asla** rahatsız edici değil.
6. **Malzeme.** İçerik (marka, başlık, rozet) canlı gökyüzünün üstünde
   **vibrancy/blur** malzemede durmalı — okunabilirlik sahneden bağımsız
   olmalı.
7. **60 fps, GPU-dostu.** Yalnız `transform`/`opacity` anime et. Layout
   tetikleyen özellik (width/height/top/left) anime **etme**.

### 3.4 Teknik yaklaşım — önerilen

**Öneri: header'a özel `<canvas>` parçacık motoru, yeni modülde.**

Gerekçe: CSS gradient'leriyle inandırıcı yağış/kar/yıldız üretilemez (mevcut
kusurların kökü bu). Canvas 2D bağımlılıksız, vanilla, ~200–300 satır ve
`requestAnimationFrame` ile 60 fps verir.

**Yeni modül:** `app/core/skyFx.js` → `window.SeySkyFx`

```
SeySkyFx.mount(hostEl, scene)   // canvas oluştur + rAF döngüsü başlat
SeySkyFx.update(scene)          // sahne değişince parçacık profilini değiştir
SeySkyFx.pause() / resume()     // visibilitychange + reduced-motion
SeySkyFx.unmount()              // render sonrası temizlik (innerHTML yıkımı!)
```

> ⚠️ **`render()` her seferinde `#app.innerHTML`'i yıkar.** Canvas host'u
> header içinde olduğu için her render'da yok olur. İki seçenekten birini seç
> ve **gerekçesini rapora yaz**:
> - **(a)** Canvas'ı `#app` DIŞINA, `#sey-aurora` gibi kalıcı bir katmana al
>   ve header'ın arkasına konumlandır (önerilen — yıkım yok, tek mount).
> - **(b)** Her render sonrası `mount()` çağır (basit ama her sekme
>   değişiminde parçacıklar sıfırlanır — kalite kaybı).

**Alternatifler:** WebGL/shader (en yüksek kalite, en yüksek risk — bağımlılık
yok ama kod hacmi büyük); saf CSS iyileştirme (yetersiz, mevcut kusurun kökü).
Seçtiğini gerekçelendir.

### 3.5 Her hava koşulu için sahne spesifikasyonu

`wxMeta` 7 kategori üretiyor: `clear · cloud · fog · rain · snow · storm` +
`amb-wx-none`. **Sekizinin de** 4 vakitle (şafak/gündüz/akşam/gece) ve 2 temayla
(açık/koyu) çarpımı çalışmalı.

| Sahne | Gökyüzü | Parçacık / katman | Gök cismi | Özel |
|---|---|---|---|---|
| `clear` | Temiz gradient, güçlü ufuk parlaması | yok (isteğe bağlı toz zerresi) | Güneş diski + halo / gece yıldız alanı + ay | Gündüz lens parlaması çok hafif |
| `cloud` | Doygunluk düşük | 2 katman hacimli bulut, farklı hız (parallax) | Bulut arkasından süzülen ışık | Bulut kenarı yumuşak, şekil organik |
| `fog` | Düşük kontrast | 3 katman yatay sis bandı, farklı hız/opaklık | Zar zor görünen disk | Derinlik hissi zorunlu |
| `drizzle` | Hafif soğuk | İnce, seyrek, yavaş damla | Soluk | Damla boyu küçük |
| `rain` | Soğuk mavi | Yoğun damla, rüzgâr açısı, **sıçrama** | Gizli | Yoğunluk `--wx-intensity`'den |
| `snow` | Soğuk açık | Değişken boyut, sinüs savrulma, yavaş | Soluk ay | Taneler dönebilir |
| `storm` | En koyu, mor-arduvaz | Yoğun damla + rüzgâr | Gizli | **Şimşek**: yönlü patlama + gecikmeli ikincil |
| `none` | Nötr vakit gradienti | yok | Normal | Veri yokken sahne **bozulmamalı** |

### 3.6 Rozet ve yay yükseltmesi

- **İkonlar:** `wxMeta`'nın Lucide çizgi ikonları yerine header için
  **dolu/çok katmanlı** bir set üret (inline SVG, gradyan + gölge).
  `wxMeta`'nın **imzasını değiştirme** — `app.js` içinde 10+ yerde kullanılıyor;
  header'a ayrı bir `headerWxGlyph(code,isDay)` ekle.
- **Güneş yayı:** kalınlık, gradyan dolgu, uçlarda doğuş/batış işareti,
  noktada yumuşak halo. Gece ay yolu olarak yeniden renklen.
- **Sıcaklık tipografisi:** tabular-nums zaten var; hiyerarşiyi güçlendir.

---

## 4. GÖREV B — KALAN PREMIUM KOZMETİK DOKUNUŞLAR 🟡🔵

Öncelik sırasıyla. Her biri bağımsız commit'lenebilir.

| # | İş | Nerede | Not |
|---|---|---|---|
| **B1** | `mesaj` ve `saygi` sekmelerinde `.surface` = **0** — bu iki sekme malzeme/elevation sisteminin tamamen dışında | `app.js` `mesajHTML()`, `saygiHTML()` | Denetimde ölçüldü. Kartları `.surface` kalıbına taşı; giriş animasyonu ve `--elev-*` otomatik gelir. **Görsel dili etkiler — dikkatli ol.** |
| **B2** | `SeyFx.transition` **0 çağrı** (gerçek ölü API) | `app/core/mediaFx.js` | Ya kullan ya kaldır. Kaldırırsan `test_premium_fx_utils.js`'i kontrol et. |
| **B3** | M7 motion token uyumu **0,62** (hedef 0,80) | `app/styles.css` geneli | ~%38 `transition:`/`animation:` hâlâ elle yazılmış süre/eğri. Token'lara (`--dur-*`, `--ease-*`) taşı. Kullanıcı 0,62'yi onaylı tavan kabul etmişti — **yükseltmek bonus**. |
| **B4** | `sey-shimmer` yalnız 6 nadir kutlama tetikleyicisi | `app.js:7459, 7509, 11292` | Erişilebilirlik sorunu, bozukluk değil. Anlamlı anlara yay (hedef tamamlama, seri, kayıt). |
| **B5** | Sayfa zemini hava katmanı 2,70 (eşik 3) | `app/styles.css` `amb-wx-*` | **Sözleşme tavanı 0,30 (FX2-23.10).** Yükseltmek için önce kullanıcı onayı al, sonra hem CSS'i hem testteki `WX_OPACITY_CEILING`'i birlikte güncelle ve M13 kontrastını yeniden doğrula. **Tek başına testi gevşetme.** |
| **B6** | `.sey-stagger` sınıfı ana sekmelerde yok | `app.js` | Kademeli giriş **efekti** `SeyFx.enter`'ın `animationDelay`'i ile zaten var. Sınıfa birleştirmek tutarlılık kazancı, görsel kazanç değil. Düşük öncelik. |
| **B7** | Kapı ekranlarında header hiç yok | `app.js:9142-9171` (dört erken dönüş: auth 9146 · konum 9154 · onboarding 9157 · profil 9171) | Zemin artık uygulanıyor (B-02 düzeltildi) ama kapılarda header render edilmiyor. Minimal bir gökyüzü şeridi kapı ekranlarına da eklenebilir. |
| **B8** | ÆON mesaj balonları sentetik veriyle boş render etti | `app.js` `aeonChatHTML` | Denetimde **ölçülemedi** — tohum şekli uyuşmamış olabilir. Gerçek `luna.qa`/`aeon.qa` şekliyle doğrula; kusursa düzelt. |
| **B9** | iOS'ta haptik no-op (`navigator.vibrate` yok) | — | **Düzeltilemez.** Telafi: o cihazlarda görsel+ses geri bildirimini bir tık güçlendir. |

---

## 5. DEĞİŞMEZLER VE SÖZLEŞMELER — KIRMA

### 5.1 Sayısal değişmezler (her commit öncesi doğrula)

```bash
grep -oE 'App\.[A-Za-z0-9_]+\s*=[^=]' app.js | grep -oE 'App\.[A-Za-z0-9_]+' | sort -u | wc -l   # 718
grep -o 'onclick=' app.js | wc -l                       # 391
grep -c '<script src="app.js' index.html                # 1
grep -c 'preventDefault' app/core/mediaFx.js            # 0
grep -c 'setInterval'    app/core/timeTheme.js          # 0
grep -c 'fetch('         app/core/timeTheme.js          # 0
grep -c 'createElement'  app/core/timeTheme.js          # 0
```

> `App.*` = 718 ve `onclick=` = 391 **artmamalı**: I1–I6 gereği tasarım
> değişikliği handler yüzeyini değiştiremez. Header şeridi bilgilendiricidir,
> tıklanabilir yapma. Canvas motoru `App.*` eklemez.

### 5.2 `test_fx2_ambience.js` katman ayrımı sözleşmesi (EN SERT KISIT)

| Katman | Seçici kuralı | İzinli özellikler |
|---|---|---|
| `amb-time-*` | `#sey-aurora::after` hedefleyemez | `--page`, `--amb-angle`, `transition` |
| `amb-wx-*` | **YALNIZ** `#sey-aurora::after` hedefleyebilir | `opacity` (**≤ 0,30**), `background`, `background-size`, `animation` |
| `amb-season-*` | `#sey-aurora::after` hedefleyemez | `--season-accent`, `box-shadow` |

Üç küme **kesişmemeli**. Header bu yüzden `sky-time-*`/`sky-wx-*` ad alanını
kullanır — **aynı disiplini sürdür**, yeni katmanların da kendi ad alanı olsun.

> ⚠️ Test kaba metin taraması yapar: bir **CSS yorumunda** `amb-wx-` yazarsan
> ardından gelen bloğu hava katmanı sanır ve düşer. Yorumlarda bu ekleri kullanma.

### 5.3 Diğer sözleşmeler

- **`createElement` yasağı yalnız `timeTheme.js` içindir** — canvas motoru
  başka modülde yaşayabilir (bu yüzden `app/core/skyFx.js` öneriliyor).
- **Reduced-motion:** RENK kalır, HAREKET durur. Canvas rAF döngüsü
  `prefers-reduced-motion` altında statik kare çizmeli veya durmalı.
- **Batarya:** `visibilitychange` ile duraklat (`#root.amb-paused` deseni).
- **Gating:** `premiumAtmosphere` kapalıyken canvas **hiç mount edilmemeli**.
- **Ağ yok:** hava verisi zaten `data.weather`'da. Yeni istek **açma**.
- **I1–I6:** `data` şeması, `migrate()` ve `App.<ad>` yüzeyi değişmez.
- **Cache-busting:** değiştirdiğin **her** asset'in `?v=` değerini `index.html`'de
  bump et. Yeni modül eklersen `index.html`'e `app.js`'den **önce** ekle.

---

## 6. DOĞRULAMA PROTOKOLÜ

### 6.1 Her değişiklikten sonra

```bash
node --check app.js && node --check app/core/skyFx.js   # ve dokunduğun her dosya
for t in tests/app/*.js tests/panel/*.js tests/panel-v2/test_panel_v2_*.js tests/quran/*.js; do
  node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done      # 0 FAIL
node tests/reminders/run-reminder-smoke.mjs
node .claude/skills/run-seyma/driver.mjs 2>&1 | grep -c '^FAIL'   # 0
node .claude/skills/run-seyma/zikr-harness.mjs 2>&1 | tail -1     # 95/95
node tools/fx-coverage.mjs                                # M7'yi izle
```

> **`fx-coverage --gate` gerçekte `exit 1` döner** (M7 = 0,62 < 0,80 eşiği).
> Bu **beklenen ve onaylı** durumdur. `$?`'i bir pipe'tan **sonra** okuma —
> `tail`'in kodunu alırsın (önceki denetimde bu hata yapıldı).

### 6.2 Görsel kabul — zorunlu

Kontrollü yerel QA (CLAUDE.md istisnası): `127.0.0.1:9000`, cache'siz sunucu,
izole tarayıcı bağlamı, sentetik veri, viewport `414x896x2,mobile,touch`.

**Çekilecek matris — 7 hava × 4 vakit × 2 tema:**
`archive/premium-fx-plan/assets/header-v2-<YYYYMMDD>/` altına
`hdr-<hava>-<vakit>-<tema>.png` adlandırmasıyla.

**Ölçülecek:**

| Metrik | Yöntem | Eşik |
|---|---|---|
| Sahne ayrımı | Aynı içerik/scroll, header bölgesi (üst 340 pt) ortalama mutlak piksel farkı | **≥ 3**, hedef ≥ 5 |
| Kare hızı | `performance_start_trace` ile 5 sn | **≥ 55 fps**, uzun görev yok |
| Okunabilirlik | Header metni × en parlak sahne kontrastı | **≥ 4,5:1** |
| reduced-motion | `matchMedia` stub | Hareket durur, renk kalır |
| Gating | `premiumAtmosphere=false` | Canvas mount **edilmez** |
| Sızıntı | Sekmeyi gizle | rAF durur |

Öncesi/sonrası karşılaştırma için mevcut görüntüler:
`archive/premium-fx-plan/assets/tam-denetim-20260908/duzeltme-header-*.png`

---

## 7. ÇIKTI

`archive/premium-fx-plan/deliverables/HEADER-V2-<YYYYMMDD>.md`:

1. **Seçilen teknik yaklaşım ve gerekçesi** (canvas/WebGL/CSS; §3.4'teki
   render-yıkımı sorununa hangi çözüm ve neden)
2. **Sahne sözleşmesi** — 7 hava × 4 vakit için ne çizildiği
3. **Önce/sonra piksel farkı tablosu** (§6.2 matrisi)
4. **Performans ölçümü** (fps, uzun görev, bellek)
5. **Erişilebilirlik** (kontrast, reduced-motion, gating)
6. **GÖREV B ilerlemesi** — hangi madde yapıldı/atlandı, gerekçesiyle
7. **Değişmezlik kanıtları** (§5.1 çıktıları)
8. **Kanıt seviyesi ayrımı** — K1 kaynak/test · K2 yerel görsel ·
   K3 cihaz kabulü ⏳ (**yalnız kullanıcıdan**)

---

## 8. DÜRÜSTLÜK KURALLARI

1. **Ölçemediğin şeye "çalışıyor" deme.** "Ölçülemedi + neden" yaz.
2. **Bir test seni düşürürse testi gevşetme — mimariyi düzelt.** Bu tam olarak
   bu projede yaşandı: `test_fx2_ambience` header'ı `amb-*` ad alanından
   çıkmaya zorladı ve **haklıydı**. Sözleşme değişikliği gerekiyorsa
   **önce kullanıcı onayı** al, sonra CSS + test + doğrulamayı birlikte güncelle.
3. **Kendi hatanı rapora yaz.** Önceki turlarda dört kez oldu: pipe'tan sonra
   `$?` okuma, var olmayan sekme kimliği ölçme, boş koleksiyonla ölçüm,
   yanlış ses düğümüne analyser takma.
4. **Şüpheli sıfırı çapraz kontrol et.** Boş liste, zaten aktif sekme,
   yanlış ölçüm noktası — sıfırların çoğu artefakttır.
5. **Metrik yeşil ≠ özellik çalışıyor.** Bu projede 94 fixture yeşilken
   uygulama konum kapısında tamamen kilitlenebiliyordu.
6. **Kapsamı daraltma.** GÖREV A'yı yapıp B'yi atlarsan, **hangi maddeyi neden
   atladığını açıkça yaz** — sessizce bırakma.

---

## 9. BİTİRME KONTROL LİSTESİ

- [ ] Sunucu durduruldu (`lsof -nP -iTCP:9000 -sTCP:LISTEN` boş) — **turn bitmeden**
- [ ] 7×4×2 ekran görüntüsü matrisi kaydedildi
- [ ] Rapor yazıldı, her iddia bir ölçüme veya görüntüye bağlı
- [ ] Değişmezler 718 / 391 / 1 / 0 / 0 / 0 / 0 doğrulandı
- [ ] 94 fixture 0 FAIL · driver 0 · zikr 95/95 · reminder PASS
- [ ] Cache-busting `?v=` bump edildi (yeni modül dahil)
- [ ] Commit atıldı · **Push / deploy / tag YOK**
- [ ] Kullanıcıya özet: ne değişti, ne ölçüldü, ne atlandı
- [ ] **K3 cihaz kabulü yalnız kullanıcıdan gelir** — "cihazda düzeldi" **deme**
