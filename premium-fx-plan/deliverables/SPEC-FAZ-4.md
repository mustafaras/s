# Faz 4: Canlı Arka Plan + Saat Bazlı Tema — Detay Spec

**Sürüm:** 2.1  
**Güncellendi:** 2026-08-30  
**Hedef:** Atmosferik derinlik kazandırmak.

---

## 4.1 Saat Bazlı `--page` Gradienti

### 4.1.1 Zaman Dilimleri

| Saat Aralığı | CSS Class | Arka Plan Açıklaması |
|--------------|-----------|----------------------|
| 05:00–08:59 | `theme-time-dawn` | Açık sarı → yumuşak pembe |
| 09:00–16:59 | `theme-time-day` | Beyaz → buz mavi-beyaz |
| 17:00–20:59 | `theme-time-dusk` | Yumuşak mor → turuncu |
| 21:00–04:59 | `theme-time-night` | İndigo → koyu gri-lacivert |

### 4.1.2 CSS Kuralları

```css
#root.theme-time-dawn { --page: linear-gradient(180deg, #FFF9F0 0%, #FFF0E8 100%); }
#root.theme-time-day { --page: linear-gradient(180deg, #FFFFFF 0%, #F5F9FF 100%); }
#root.theme-time-dusk { --page: linear-gradient(180deg, #F8F0FF 0%, #FFF3E8 100%); }
#root.theme-time-night { --page: linear-gradient(180deg, #1A1D26 0%, #12141A 100%); }
```

**Koyu tema notu:** Koyu tema aktifse bu class’lar uygulanmayabilir veya daha soft tonlarda override edilebilir.

### 4.1.3 JS Uygulaması

**Yeni modül:** `app/core/timeTheme.js` (MODULARIZATION.md §3.2). `window.SeyTimeTheme.apply()` olarak expose edilir; tüm çağrılar oradan yönlendirilir.

**Çağrı noktaları (app.js gerçek satırları):**
- Uygulama boot sonunda: `app.js` dosya sonu, ~satır 18750–18800 (mevcut ilk `render()` + foreground poll timer `setInterval` — `app.js:18752`).
- Her tab değişiminde: `render()` — `app.js:9688` başlangıcı.
- 30 saniyede bir kontrol: foreground poll loop `setInterval` — `app.js:18752` içinde `window.SeyTimeTheme.apply()` çağrısı eklenebilir.

```js
// app/core/timeTheme.js içindeki reference implementasyon
function timeClass(){
  if(!settings.premiumAtmosphere) return '';
  var h = new Date().getHours();
  return (h >= 5 && h < 9) ? 'theme-time-dawn' :
         (h < 17) ? 'theme-time-day' :
         (h < 21) ? 'theme-time-dusk' : 'theme-time-night';
}
```

---

## 4.2 Aurora Arka Plan

**Mevcut:** `seyAurora` keyframe `app/styles.css` içinde.

**Yeni kullanım:** Arka plan katmanı olarak `#root::before` veya `#app::before` üzerine çok düşük opacity uygula.

```css
#root.theme-time-dawn::before,
#root.theme-time-day::before,
#root.theme-time-dusk::before,
#root.theme-time-night::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(circle at 25% 35%, color-mix(in srgb, var(--room) 18%, transparent), transparent 45%),
    radial-gradient(circle at 75% 65%, color-mix(in srgb, var(--journal) 14%, transparent), transparent 50%);
  animation: seyAurora 16s ease-in-out infinite;
  opacity: 0.55;
}

@media (prefers-reduced-motion: reduce) {
  #root::before { animation: none !important; }
}
```

**Not:** Metin okunabilirliğini zorlamamak için opacity düşük tutulmalı.

---

## 4.3 Seasonal Theme

### 4.3.1 Özel Dönemler

| Dönem | Tetikleyici | Renk Kayması |
|-------|-------------|--------------|
| Ramazan | Hicri ay Ramazan (HijriCalendarV1) | `--accent` ve `--saygi-gold` hafif yeşil-altın |
| İlkbahar | 20 Mart–20 Haziran | `--ok` daha canlı yeşil |
| Sonbahar | 22 Eylül–20 Aralık | `--room` daha sıcak ton |
| Yılbaşı | 31 Aralık–1 Ocak | Gümüş/gold shimmer |

### 4.3.2 JS Uygulaması

```js
function seasonalThemeClass(){
  var d = new Date();
  var mm = d.getMonth() + 1;
  var dd = d.getDate();
  if(window.HijriCalendarV1 && window.HijriCalendarV1.isRamadan && window.HijriCalendarV1.isRamadan(d)) return 'theme-ramadan';
  if((mm === 3 && dd >= 20) || mm === 4 || mm === 5 || (mm === 6 && dd <= 20)) return 'theme-spring';
  if((mm === 9 && dd >= 22) || mm === 10 || mm === 11 || (mm === 12 && dd <= 20)) return 'theme-autumn';
  if((mm === 12 && dd === 31) || (mm === 1 && dd === 1)) return 'theme-newyear';
  return '';
}
```

**Hijri Ramazan entegrasyonu:** `window.HijriCalendarV1` zaten yüklü (`app/content/hijriCalendar.js`). `seasonalThemeClass()` helper'ı `app/core/timeTheme.js` içinde kalır ve `App.adjustHijriOffset(delta)` — `app.js:8996` ile ayarlanan `settings.prayer.hijriOffset` dikkate alınır.

### 4.3.3 CSS Kuralları

Sadece accent tonlarında hafif değişim; ana arka planı değiştirmemeli.

```css
#root.theme-ramadan {
  --accent: #7A9E6B;
  --saygi-gold: #C4A95F;
}
#root.theme-spring {
  --ok: #4A9A6B;
}
#root.theme-autumn {
  --room: #C98A6B;
}
#root.theme-newyear {
  --accent: #A89BB8;
  --saygi-gold: #D4C88A;
}
```

---

## 4.4 Reduce Motion Uyumu

- `prefers-reduced-motion: reduce` aktifse aurora durur.
- Saat bazlı gradient hala uygulanabilir (renk değişimi hareket sayılmaz).

---

## 4.5 Test Planı

### `tests/app/test_premium_time_theme.js`

**Seneryolar:**
1. Saat 7:00’de `#root` class’ı `theme-time-dawn`.
2. Saat 14:00’de `#root` class’ı `theme-time-day`.
3. Saat 19:00’de `#root` class’ı `theme-time-dusk`.
4. Saat 23:00’de `#root` class’ı `theme-time-night`.
5. `settings.premiumAtmosphere === false` ise hiçbir time theme class eklenmemeli.
6. `prefers-reduced-motion: reduce` aktifse aurora animasyonu yok.

---

## 4.6 Çıktı Listesi

- [ ] Saat bazlı tema class’ları ve CSS spec’i
- [ ] `updateTimeTheme()` fonksiyon spec’i
- [ ] Aurora arka plan katmanı spec’i
- [ ] Seasonal theme class’ları ve renk override’ları
- [ ] Hijri Ramazan entegrasyonu kontrolü
- [x] `tests/app/test_premium_time_theme.js` oluşturuldu (24/24 PASS)
