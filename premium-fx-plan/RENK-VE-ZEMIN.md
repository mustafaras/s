# RENK ve CANLI ZEMİN

**Sürüm:** 1.0 · **Tarih:** 2026-09-06
**Uygulayan kartlar:** FX2-03…05 (renk), FX2-19…23 (canlı zemin)
**Kullanıcı kararı:** Ana renk ailesi **Şampanya Altını + Füme Mürekkep**
(2026-09-06 oturumunda seçildi).

---

## BÖLÜM A — RENK KİMLİĞİ

### A.1 Sorun

Palet **beş ayrı aileden** oluşuyor ve pembe bunların içinde tek yabancı:

| Aile | Token | Nerede |
|---|---|---|
| 🌸 Pembe | `--accent:#C77D93`, `--accent-ink:#B55471`, dark `#FFB1CF`, `--learn` | ana aksan |
| 🥇 Altın | `--aeon:#C99A3A`, `--zikr-counter-gold:#D8B968`, nav `#A4824C`, Saygı altını | ÆON, zikir, nav, Saygı |
| 🟣 Mor | `--read:#6E55BF`, `--user-bubble:#7E62B8`, `--pause:#8A7BB0` | okuma, sohbet |
| 🟤 Toprak | `--choc:#6B4A3A`, `--watch:#B5732E`, `--drop:#B0714E` | izleme |
| 🩶 Nötr | `--hijri:#6E7191`, header `#3A4048` | takvim, başlık |

Pembe uygulamanın **hiçbir** ikincil yüzeyiyle akraba değil. Altın ise dört
ayrı yerde zaten hâkim. "Premium" hissin en ucuz düşmanı **paletin dağınık
olmasıdır** — tek tek renkler güzel olsa bile.

### A.2 Envanter (2026-09-06 ölçümü)

| Hex | Sayı | Yer |
|---|---:|---|
| `#C77D93` | 4 | `--accent` (açık), `--learn` |
| `#B55471` | 1 | `--accent-ink` |
| `#FFB1CF` | 2 | `--accent` (koyu) |
| `#FCEDEE` | 1 | `--page` orta durak (pembe) |
| `#F1EBFF` | 1 | `--page` son durak (lila) |
| `#D96D8B` | 1 | `#sey-aurora` üçüncü halka |
| `#9C4A5A` / `#D68A94` | 2 | `--kandil` (nar çiçeği — **kapsam dışı**, dinî vurgu) |
| `rgba(199,125,147,…)` | 1 | `--learn-bg` |

**Kritik kolaylık:** Geri kalan her şey `var(--accent)` (25 kullanım) ve
`var(--accent-ink)` (40 kullanım) üzerinden gidiyor. Yani palet değişimi
**~11 token tanımına** dokunmakla biter; 65 kullanım noktası kendiliğinden
gelir. Düşük risk, yüksek etki.

### A.3 Yeni Palet — Şampanya Altını + Füme Mürekkep

**Açık tema (`#root`):**

```css
--accent:      #B08D57;   /* şampanya altını — dolgu/kenarlık (WCAG 3:1) */
--accent-ink:  #8A6A3B;   /* metin varyantı — 4.5:1 */
--accent-soft: #D9C29A;   /* açık vurgu, halo, seçili durum */
--accent-bg:   rgba(176,141,87,0.13);
--page: linear-gradient(170deg,
          #FDFBF7 0%,     /* fildişi */
          #F7F1E8 46%,    /* sıcak kum */
          #F2EFF4 100%);  /* soğuk inci — nötr kapanış */
--learn:    #B08D57;  --learn-bg: rgba(176,141,87,0.14);
```

**Koyu tema (`#root[data-theme="dark"]`):**

```css
--accent:      #E3C08A;   /* yumuşak şampanya — siyah üstünde AAA */
--accent-ink:  var(--accent);
--accent-soft: #F0DBB8;
--accent-bg:   rgba(227,192,138,0.11);
--learn:       #E3C08A;  --learn-bg: rgba(227,192,138,0.11);
```

**Aurora halkası:** `#D96D8B` → `#C9A227` (antik altın).

### A.4 Neden Bu Aile

1. **Birleştirir, çatıştırmaz.** ÆON `#C99A3A`, nav `#A4824C`, zikir
   `#D8B968`, Saygı altını — dördü de aynı aileden. Palet 5 aileden 2'ye
   iner (altın + mor/toprak destek).
2. **Sıcaklığı korur.** "Sevgili Günışığı" tonu, `--sun:#F5A623` marka
   sarısı ve flamingo maskotu ile uyumlu kalır.
3. **Metalik = değerli.** Şampanya altını, pembenin veremediği "malzeme"
   hissini verir; FX2-24'teki elevation katmanlarıyla birlikte gerçek yüzey
   algısı doğar.
4. **Erişilebilir.** `#8A6A3B` beyaz üstünde 4,54:1; `#E3C08A` siyah
   üstünde 11,2:1.

### A.5 Kapsam Dışı (bilinçli olarak dokunulmaz)

- `--kandil` (`#9C4A5A`/`#D68A94`) — mübarek gün nar çiçeği, dinî anlam taşır
- `--warn` (`#E5484D`) — uyarı kırmızısı, semantik
- `--read` / `--watch` / `--listen` — hub kimlikleri, kullanıcı bunlarla
  sekmeleri ayırt ediyor
- 🦩 flamingo maskotu ve marka emojileri

---

## BÖLÜM B — CANLI ZEMİN (dinamik arka plan)

### B.1 Sorun

Kullanıcı: *"kullanıcının sıkılmasını önlemek için değişken arka planlar
ekleyelim; bu FX planda vardı ama sonradan ne olduysa ya uygulanmadı ya
kayboldu."*

Doğrudur. FX-1 `PLAN.md` §4.4'te şu satır vardı:

> | Yağmur/bulut modu | Hava durumuna göre hafif CSS efekt | **Gelecekte hava API'si varsa** |

Ve FX-P-88 ("hava modu") **bloklu** işaretlenip hiç yazılmadı. Uygulanan tek
şey `theme-time-*` oldu — o da yalnız **iki elemanın box-shadow rengini**
değiştiriyor.

### B.2 Kaybolan Gerekçe Artık Geçersiz

> **Hava API'si "gelecekte" değil — 2026'dan beri uygulamada, canlı ve kayıtlı.**

`app.js` `fetchWeather()` (satır ~9906–9945) open-meteo'dan çekip
`data.weather` altına yazıyor. `data.weather.spots[0]` şu alanları taşıyor:

| Alan | Örnek | Kullanımı |
|---|---|---|
| `code` | `61` | WMO hava kodu → sahne seçimi |
| `isDay` | `true` | gündüz/gece varyantı |
| `precip` | `0.4` | yağış şiddeti |
| `temp` / `feels` | `18` | sıcak/soğuk ton kayması |
| `sunrise` / `sunset` | ISO | **gerçek güneş saati** |
| `uv` | `6` | berraklık |
| `wind` | `12` | hareket hızı |

**Sonuç: canlı zemin için tek bir yeni ağ çağrısı bile gerekmiyor.**
Veri zaten `data`'da, zaten `migrate()`'ten geçiyor, zaten sync'leniyor.

### B.3 Mimari — `SeyAmbience`

Tek sorumluluk: **`#root` üzerine bir "sahne" sınıfı koymak.** Boyama tamamen
CSS'te; JS yalnız hangi sahnenin geçerli olduğunu hesaplar.

```
SeyAmbience.scene()   → {time, weather, season, key}   (saf, test edilebilir)
SeyAmbience.apply()   → #root'a sınıfları yazar, crossfade tetikler
```

Sahne anahtarı üç katmandan oluşur:

```
#root class="amb-time-dawn amb-wx-rain amb-season-autumn"
              └─ güneş saati   └─ hava      └─ mevsim
```

**Katman önceliği (çakışma çözümü):** zemin gradienti **zaman**'dan gelir;
**hava** üstüne bir doku/parçacık katmanı ekler; **mevsim** yalnız
`--season-accent` tonunu kaydırır. Üçü asla aynı özelliği yazmaz — bu yüzden
birbirini ezmezler.

### B.4 Katman 1 — Güneş Saati (gerçek sunrise/sunset)

Mevcut `SeyTimeTheme.classForHour` sabit saat aralıkları kullanıyor
(5–8 / 9–16 / 17–20 / diğer). Ocak'ta saat 17:00 gece, Haziran'da gündüz —
sabit aralık ikisini de yanlış yapıyor.

`data.weather.spots[0].sunrise/sunset` varken gerçek hesap mümkün:

| Sahne | Koşul | Zemin yönü |
|---|---|---|
| `amb-time-dawn` | `sunrise −45dk` … `sunrise +75dk` | şeftali → altın |
| `amb-time-day` | `sunrise +75dk` … `sunset −90dk` | fildişi → açık kum |
| `amb-time-dusk` | `sunset −90dk` … `sunset +45dk` | amber → gül-bakır |
| `amb-time-night` | kalan | derin lacivert-füme |

**Fallback zorunlu:** `sunrise/sunset` yoksa (hava hiç çekilmemişse) mevcut
sabit saat aralıklarına düşülür. `classForHour` **silinmez**, imzası
korunur (I2).

### B.5 Katman 2 — Hava Sahneleri (WMO kodu)

WMO kodları → 8 sahne. Kod eşlemesi `app.js`'te yok, `SeyAmbience` içinde
tanımlanır:

| Sahne | WMO kodları | Görsel |
|---|---|---|
| `amb-wx-clear` | 0, 1 | temiz; hafif ışık huzmesi |
| `amb-wx-cloud` | 2, 3 | yumuşak gri bulut kayması, doygunluk −8% |
| `amb-wx-fog` | 45, 48 | süt beyazı bulanıklık, kontrast −6% |
| `amb-wx-drizzle` | 51, 53, 55, 56, 57 | ince dikey çizgiler, çok düşük opaklık |
| `amb-wx-rain` | 61, 63, 65, 66, 67, 80, 81, 82 | yağmur çizgileri + ıslak koyulaşma |
| `amb-wx-snow` | 71, 73, 75, 77, 85, 86 | yavaş düşen tanecikler, mavi-beyaz ton |
| `amb-wx-storm` | 95, 96, 99 | koyu ton + **çok seyrek** şimşek parlaması (≥40 sn) |
| `amb-wx-none` | veri yok | nötr, ek katman yok |

**Şiddet:** `precip` ve `wind` `--wx-intensity` (0–1) değişkenine çevrilir;
CSS animasyon hızı ve opaklık bundan türer. Sabit değer yok.

**Gece varyantı:** `isDay:false` iken tüm sahneler `--wx-dim` ile koyulaşır;
şimşek dışında parlaklık artmaz.

### B.6 Katman 3 — Mevsim ve Özel Gün

Mevcut `seasonalClass()` korunur, genişletilir:

| Sınıf | Dönem | `--season-accent` |
|---|---|---|
| `amb-season-spring` | Mart–Mayıs | `#A3B86C` yeşil-altın |
| `amb-season-summer` | Haziran–Ağustos | `#D9B44A` sıcak altın |
| `amb-season-autumn` | Eylül–Kasım | `#C08552` bakır |
| `amb-season-winter` | Aralık–Şubat | `#8FA6B8` buz mavisi |
| `amb-season-ramazan` | Hicri 9. ay | `#6E9E8A` mint-altın |
| `amb-season-newyear` | 1 Ocak | `#C9A227` antik altın |

Mevsim **yalnız aksan tonunu** kaydırır, zemini değil — yoksa hava ve zaman
katmanlarıyla çakışır.

### B.7 Sıkılmayı Önleme — Kombinasyon Sayısı

```
4 zaman × 8 hava × 6 mevsim = 192 görsel kombinasyon
```

Kullanıcı aynı zemini iki gün üst üste **neredeyse hiç** görmez. Bu, "sıkılma"
probleminin gerçek çözümüdür — tek bir hareketli arka plandan çok daha güçlü.

Ek olarak `--amb-seed`: günün tarihinden türeyen 0–1 arası deterministik bir
sayı, gradient açısını ±8° ve halka konumlarını ±6% kaydırır. Aynı hava +
aynı saatte bile **gün gün ince fark** olur, ama gün içinde sabit kalır
(titreşim yok).

### B.8 Performans Çitleri (pazarlık edilemez)

- Zemin **tek** `#sey-aurora` katmanında yaşar; yeni kalıcı DOM düğümü yok.
  Hava dokuları `::before` / `::after` ile gelir.
- Yağmur/kar **parçacık değil**, tekrarlayan `linear-gradient` + tek
  `transform: translate3d` animasyonu. DOM'da 0 tanecik.
- Aynı anda **≤ 2** sonsuz animasyon.
- Sahne değişimi `--dur-5` (800 ms) crossfade; ani sıçrama yok.
- `premiumAtmosphere` kapalı → tüm `amb-*` sınıfları kaldırılır, katman söner.
- `prefers-reduced-motion` → sahne rengi kalır, **hareket durur**
  (yağmur akmaz, şimşek çakmaz).
- Sekme arka plandayken (`visibilitychange`) animasyonlar `paused`.
- Batarya: sürekli `setInterval` **yok**; sahne yalnız mevcut 30 sn'lik
  foreground poll'unda ve `render()` sonrasında yeniden hesaplanır.

### B.9 Kontrast Kapısı

Zemin değiştiği için **her sahnede** metin okunabilirliği kanıtlanmalı:

```
4 zaman × 2 tema = 8 zorunlu kombinasyon, --text / --page ≥ 4,5:1
```

Hava katmanı zemine **en fazla %6 opaklıkla** biner ve kontrastı
düşüremez — fixture bunu ölçer. Oran tutmuyorsa **ton azaltılır, fixture
gevşetilmez.**

### B.10 Ölçüm

| Metrik | Taban | Hedef |
|---|---:|---:|
| `M10 pinkTokens` | 11 | **0** |
| `M11 paletteFamilies` | 5 | **≤ 2** |
| `M12 ambienceScenes` | 0 | **≥ 18** (4 zaman + 8 hava + 6 mevsim) |
| `M13 contrastPass` | 8/8 (mevcut) | **8/8 korunur** |
