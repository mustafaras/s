# Şeyma Premium FX Planı — Ses & Efekt Kütüphanesi

**Sürüm:** 2.0
**Tarih:** 2026-08-30
**Amaç:** Uygulanacak tüm ses ve görsel efektlerin teknik detaylarını, parametrelerini ve kullanım koşullarını tanımlamak.
**Temel:** Mevcut `zikrTickSound()` (~app.js:8502) ve `haptic(ms)` (~app.js:6375) üzerine kurulur; yeni modüller (`app/core/mediaFx.js`, `app/core/timeTheme.js`) bu kataloğu implemente eder.

---

## 1. Web Audio API Ses Kataloğu

Tüm sesler yerel üretilir; harici dosya gerekmez. Örnek hızı 44.1 kHz varsayılır. Tek ortak `AudioContext` kullanılır (`SeyAudio.ctx`).

### 1.1 UI Tap (`SeyAudio.tap()`)

| Parametre | Değer |
|-----------|-------|
| Waveform | Sine |
| Frequency | 880 Hz (A5) |
| Attack | 0.002 sn |
| Decay | 0.04 sn |
| Gain peak | 0.05 |
| Ramping | Exponential decay |

```js
function tap(){
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = 880;
  g.gain.setValueAtTime(0.05, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
  o.connect(g); g.connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + 0.04);
}
```

**Kullanım:** `App.toggleHabit`, `App.waterAdd`, `App.setMood`, kart açma/kapama butonları.

---

### 1.2 Success Chime (`SeyAudio.success()`)

| Parametre | Değer |
|-----------|-------|
| Notalar | 523 Hz → 659 Hz → 784 Hz (C6 → E6 → G6) |
| Süre | Her nota 0.08 sn, toplam 0.24 sn |
| Envelope | Soft attack, exponential decay |
| Gain | 0.06 |

**Kullanım:** Alışkanlık tamamlama, günlük kayıt, hedef tamamlanma, `App.saveJournal`.

---

### 1.3 Save Success Bell (`SeyAudio.bell()`)

| Parametre | Değer |
|-----------|-------|
| Waveform | Sine + hafif harmonik |
| Frequency | 1047 Hz (C6) |
| Decay | 0.5 sn |
| Vibrato | Hafif 6 Hz modülasyon (opsiyonel) |
| Gain | 0.05 |

**Kullanım:** `SeyOnSynced()` başarı durumunda; görsel header check morph ile eşzamanlı.

---

### 1.4 Warning Buzz (`SeyAudio.warning()`)

| Parametre | Değer |
|-----------|-------|
| Waveform | Triangle |
| Frequency | 150 Hz |
| Süre | 0.12 sn |
| Gain | 0.04 |

**Kullanım:** Uyarı bannerları, hata durumları, input validasyon hatası.

---

### 1.5 Ambient Sounds (`SeyAudio.ambient(type)`)

| Tip | Teknik | Koşul |
|-----|--------|-------|
| Morning birds | Birden fazla oscillator, rastgele zamanlama | 05:00–11:00, `settings.ambientSounds` açık |
| City breeze | Pink noise + lowpass filter | Gündüz, ayar açık |
| Night crickets | Yüksek frekanslı darbeler | 22:00–05:00, ayar açık |
| Rain | White noise modülasyonu | Hava API’si yağmur verirse (gelecek) |

**Not:** Ambient sesler için döngü (loop) ve fade in/out gerekir. iOS’ta arka planda oynama sınırlı; sadece aktif sekmede.

---

### 1.6 Voice Guidance (`SeyAudio.voice(text)`)

```js
function speak(text){
  if(!('speechSynthesis' in window)) return;
  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'tr-TR';
  u.rate = 0.92;
  u.pitch = 1.05;
  u.volume = 0.7;
  window.speechSynthesis.speak(u);
}
```

**Güvenlik notu:** Speech API kullanıcı etkileşimi (buton tıklaması) ile tetiklenmeli; sayfa yüklenince otomatik ses engellenebilir.

**Rehberlik anları:**
- Günlük Işığı açılış sorusu
- Mood/stres yorumu
- Gece selamı
- Motivasyon kartı onay mesajı
- 4-7-8 nefes metronomu

---

## 2. Haptik Kataloğu (`SeyHaptics.*`)

`navigator.vibrate` kullanılarak. Mevcut `haptic(ms)` (~app.js:6375) yerine geçer.

| Method | Pattern (ms) | Kullanım |
|--------|--------------|----------|
| `SeyHaptics.tap()` | `[15]` | Hafif buton basışı |
| `SeyHaptics.success()` | `[20, 30, 50]` | Tik/hedef tamamlanma |
| `SeyHaptics.error()` | `[40, 20, 40]` | Uyarı/hata |
| `SeyHaptics.refresh()` | `[10, 20, 10, 20, 10]` | Pull/refresh |
| `SeyHaptics.streak()` | `[30, 50, 80]` | Streak koruma/coşku |
| `SeyHaptics.water()` | `[10, 15, 10]` | Su ekleme |

**iOS:** iOS Safari `navigator.vibrate` desteği yok (sadece WebView/standalone PWA). Android odaklı; iOS’ta görsel fallback zorunlu.

**Kontrol:** `settings.richHaptics === true` ve `settings.premiumAtmosphere === true` ise çalışır.

---

## 3. Görsel Efekt Kataloğu

### 3.1 Count-up Animasyonu

| Parametre | Değer |
|-----------|-------|
| Süre | 0.4 sn |
| Easing | `cubic-bezier(.16,1,.3,1)` |
| Format | Tam sayı; decimal gerekiyorsa 1 basamak |

**Kullanım alanları:** Su sayısı, gün indexi, streak, tamamlanmış tik sayısı, adım sayısı.

---

### 3.2 Ripple Efekti

| Parametre | Değer |
|-----------|-------|
| Pozisyon | Tıklama koordinatına göre |
| Renk | Kartın accent rengi, %30 opacity |
| Yayılma süresi | 0.5 sn |
| Son opacity | 0 |

**CSS yaklaşımı:** JS ile dinamik `::before` veya inline span oluştur; CSS keyframe ile büyüt. Animasyon bitince element kaldırılır.

---

### 3.3 Shimmer

Mevcut `seyShine` keyframe (`app/styles.css`) kullanılarak:

```css
background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%);
animation: seyShine 2.6s ease-in-out infinite;
```

**Yeni uygulama alanları:**
- Habits SVG progress ring üzerinde.
- Premium Atmosfer açıkken tüm progress bar’larda.
- Header accent çizgilerinde.

---

### 3.4 Card Hover / Active

| Durum | Efekt |
|-------|-------|
| Hover | `translateY(-2px)`, shadow artış |
| Active / touch | `scale(0.97)`, shadow küçülme |
| Disabled | opacity 0.5, cursor default |

---

### 3.5 Splash Animasyonu

| Bileşen | Efekt | Süre |
|---------|-------|------|
| Arka plan | Aurora slow drift | 12 sn döngü |
| Logo | Sheen + hafif scale | 1 sn |
| Flamingo | `seyFlamBob` genişletilmiş | 4 sn |
| Karşılama metni | `seyFloatIn` | 0.5 sn, gecikmeli |
| Çıkış | `seyFadeOut` | 0.3 sn |

**Koşul:** `settings.launchRitual === true` ve `settings.premiumAtmosphere === true`.

---

### 3.6 Saat Bazlı Arka Plan (`SeyTimeTheme`)

| Saat Aralığı | `--page` Tema | Gradient Yönü |
|--------------|---------------|---------------|
| 05:00–08:59 | Dawn | Açık sarı → pembe |
| 09:00–16:59 | Day | Beyaz → mavi-beyaz |
| 17:00–20:59 | Dusk | Mor → turuncu |
| 21:00–04:59 | Night | İndigo → koyu gri |

**Uygulama:** JS, saat hesaplayarak `#root` class’ını günceller (`theme-time-dawn`, `theme-time-day`, `theme-time-dusk`, `theme-time-night`). CSS her class için `--page` override tanımlar.

---

### 3.7 Seasonal Theme

| Dönem | Renk Kayması | Aktivasyon |
|-------|--------------|------------|
| Ramazan | `--accent` ve `--saygi-gold` hafif yeşil-altın kayması | Hicri takvime göre |
| İlkbahar | Daha canlı `--ok` tonu | 20 Mart–20 Haziran |
| Sonbahar | Daha sıcak `--room` tonu | 22 Eylül–20 Aralık |
| Yılbaşı | Hafif gümüş/gold shimmer | 31 Aralık–1 Ocak |

---

## 4. Reduce Motion ve Erişilebilirlik

Tüm yeni efektler için şu kurallar geçerli:

```css
@media (prefers-reduced-motion: reduce) {
  .sey-fx-shimmer,
  .sey-fx-ripple,
  .sey-fx-float,
  .sey-splash,
  .sey-time-theme {
    animation: none !important;
    transition: none !important;
  }
}
```

Ayrıca `settings.premiumAtmosphere === false` olduğunda da aynı pasif durum JS ile uygulanmalı.

---

## 5. Performans Kısıtları

- Her ses için ayrı AudioContext yok; tek context paylaşılır.
- Ripple efektleri DOM’da birikmemeli; animasyon bitince element kaldırılmalı.
- Arka plan gradientleri sadece class değişimi ile uygulanmalı; sürekli JS hesaplaması yapılmamalı.
- `will-change` sadece kısa süreli animasyonlarda kullanılmalı.
- Mevcut keyframes (`seyPop`, `seyFloatIn`, `seyShine`, `seyAurora`, `seyRoomGlow`, `seyWordSheen`, `seySynapseDrift`) yeniden kullanılmalı.
