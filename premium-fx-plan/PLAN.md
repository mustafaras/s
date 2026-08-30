# Şeyma Premium FX Planı — Ana Plan

**Sürüm:** 2.0
**Tarih:** 2026-08-30
**Hedef:** Şeyma uygulamasına pro-premium görsel ve işitsel efekt stratejisi hazırlamak; bu plan aynı zamanda ~18.800 satırlık `app.js` monolitinin modülerleştirme yolunu da çizmek.

> **Kural:** Bu plan aşamasında **uygulama koduna dokunulmuyor** (planlama + spec + test iskelesi). İlk uygulama aşaması, bu planın `MODULARIZATION.md` bölümünde belirtilen modül sınırına göre başlayacak.

---

## 1. Vizyon

Şeyma şu an sakin, glass-morphism, iOS 27 Liquid Glass uyumlu, duygusal ama sessiz bir wellness uygulaması. Premium FX planı, uygulamaya şunları kazandırmalı:

- **Hissedilir premiumlik:** Her dokunuş, geçiş ve tamamlanma anında incelikli bir geri bildirim.
- **Duygusal derinlik:** Ses, ışık ve hareket aracılığıyla “Sevgili Günışığı” tonuna uygun sıcaklık.
- **Kontrollü lüks:** Kullanıcı istemediği takdirde hiçbir efekt zorlayıcı olmamalı.
- **Güvenli büyüme:** Mevcut veri modelini, sync akışını ve erişilebilirlik sözleşmelerini bozmamalı.
- **Sürdürülebilir mimari:** Efektler, `app.js` monolitinden çıkarılmış modüllere uygulanmalı; böylece tek dosya 20.000 satıra ulaşmadan büyüme devam edebilir.

---

## 2. Temel İlkeler

1. **Plan önce, kod sonra:** Bu klasörde yalnızca belge, spec ve test iskelesi üretilir.
2. **Modülerleştirme = FX’nin ön koşulu:** Yeni ses/hareket katmanları, mevcut 18.805 satırlık `app.js` içine gömülmek yerine `app/core/audioFx.js`, `app/core/hapticsFx.js` gibi modüllerde yaşayacak.
3. **Erişilebilirlik öncelikli:** `prefers-reduced-motion: reduce` ve kullanıcı ayarlarına tam uyum.
4. **Veri güvenliği:** Hiçbir efekt `data`, `migrate()`, `sync.js`, `save()` veya GitHub Contents API akışını değiştirmemeli.
5. **Yerel / offline:** Ses ve görsel efektler tamamen tarayıcı içinde üretilmeli; harici kaynaklara bağımlılık minimumda tutulmalı.
6. **Türkçe ve sıcak ton:** Tüm kullanıcıya dönük metinler uygulamanın mevcut sesiyle uyumlu olmalı.
7. **Test edilebilir:** Her efekt headless `run-seyma` testleri ve `prefers-reduced-motion` fixture’larıyla doğrulanabilmeli.

---

## 3. app.js Gerçekleri (Kod Taramasına Dayalı)

| Ölçüm | Değer | Kaynak |
|-------|-------|--------|
| Toplam satır | 18.805 | `app.js` |
| Üst düzey fonksiyon | 1.893 | `premium-fx-plan/app-function-map.json` |
| Merkezi render motoru | `render()` ~satır 9688 | `app.js` |
| Tek ses üreteci | `zikrTickSound()` ~satır 8502 | `app.js` |
| Haptic sarmalayıcı | `haptic()` ~satır 6375 | `app.js` |
| Başarı/toast kapısı | `SeyOnSynced()` ~satır 17999 | `app.js` |
| Mevcut animasyon CSS | `seyPop`, `seyFloatIn`, `seyShine`, `seyAurora`, `seyRoomGlow`, `seyWordSheen`, `seySynapseDrift` | `app/styles.css` |
| Reduced-motion desteği | Zaten mevcut `@media (prefers-reduced-motion: reduce)` | `app/styles.css` |

**Doğal modül sınırları (tarama sonucu):** constants/prayer/saygi/zikir/quran/motivation/journal/message/health/today/report/map/settings/library/sync/media/helpers/state.

---

## 4. Efekt Kategorileri

### 4.1 Sonic Identity — Uygulamanın Ses Dili

Şu an tek ses kaynağı: `zikrTickSound()` (zikirmatik tiki). Plan, bunu genişleterek bir “dokunuş = ses” dili kurmayı önerir.

| Etki | Tetikleyici | Teknik | Öncelik |
|------|-------------|--------|---------|
| **UI Tap Sound** | Anlamlı buton basışları | Web Audio API, kısa sine/triangle envelope | Yüksek |
| **Habit Complete Chime** | Alışkanlık tamamlandığında | 3-nota artan arpej, oscillator | Yüksek |
| **Save Success Bell** | `SeyOnSynced` başarısı | Kristal bell, kısa decay | Yüksek |
| **Error / Warning Tone** | Uyarı/kırmızı durumlar | Düşük frekanslı kısa buzz/click | Orta |
| **Ambient Time-of-Day Sound** | 05:00–11:00 karşılama | Hafif kuş/şehir ambienti, kullanıcı ayarına bağlı | Orta |
| **Voice Guidance** | Nefes, gün mesajı, gece selamı | Web Speech API (Türkçe ses) | Orta |

### 4.2 Mikro-animasyon & Haptic Alfabesi

Mevcut haptic: `navigator.vibrate`. Bunu anlam düzeyine çıkar.

| Hareket | Görsel Efekt | Haptik |
|---------|--------------|--------|
| Tik tamamlama | Buton içi check morph + halka darbesi | `[20]` |
| Su ekleme | +1 bardak dolma animasyonu + ripple | `[10, 15, 10]` |
| Streak koruma | Alev simgesi pulse | `[30, 50, 80]` |
| Hedef tamamlanma | Hero halkası renk değişimi + shine | `[20, 30, 50]` |
| Hata/uyarı | Input kırmızı titreme | `[40, 20, 40]` |
| Eşitleme / refresh | Dönen eşitleme simgesi | `[10, 20, 10, 20, 10]` |

### 4.3 Premium Açılış Ritüeli

- **Liquid Glass Splash:** 0.8–1.2 sn açılış ekranı, logo parıltısı, flamingo hafif sallanma, aurora arka plan.
- **Gün Işığı Karşılama:** Saate göre “Günaydın Günışığı” / “İyi akşamlar” yavaş beliriş.
- **Veri durumuna göre:** Dün kaydedilmemişse nazik hatırlatma; kayıt tamamsa minimalist hoş geldin.

### 4.4 Canlı Duvar & Atmosferik Arka Plan

| Katman | Efekt | Koşul |
|--------|-------|-------|
| Saat bazlı gradient | `--page` rengi sabah/öğlen/akşam/gece değişimi | Premium Atmosfer açık |
| Aurora + particles | Mevcut `seyAurora` keyframes’inin arka plana uygulanması | Premium Atmosfer açık |
| Yağmur/bulut modu | Hava durumuna göre hafif CSS efekt | Gelecekte hava API’si varsa |
| Seasonal Theme | Ramazan, mevsimlere göre ton kayması | Tarih bazlı otomatik |

### 4.5 Premiumleştirme Detayları

- **Depth & Layer:** Kart hover/active translateY, buton active scale(0.97).
- **Işık Efektleri:** Dokunuş ripple, progress shimmer genişlemesi, gradient text + glow.
- **Typography Motion:** Fade-up başlıklar, count-up sayılar.
- **Glass & Blur:** Daha fazla `backdrop-filter`, `color-mix` kenar ışığı, inset shadow.

### 4.6 Bottom Navigation & Header Premium İnce Ayar

- Sekme geçişi: `seyFade` + `seyFloatIn`.
- Aktif ikon hafif bounce.
- Header sync durumunda check morph + kristal bell.
- ÆON unread badge pop animasyonu.

---

## 5. “Premium Atmosfer” Anahtarı

Tüm efektleri tek bir kullanıcı kontrolü altında topla:

**Ayarlar → Görünüm & Ses → “Premium Atmosfer Aç”**

Açıkken:
- Mikro-animasyonlar aktif.
- Sesli dokunuşlar aktif.
- Ambient sesler açık.
- Canlı arka plan aktif.
- Haptik zenginleştirilmiş.

Kapalıyken veya `prefers-reduced-motion: reduce` aktifse: uygulama mevcut sakin haline döner.

---

## 6. Kullanıcı Ayarlarına Eklenecek Alanlar

```js
settings.premiumAtmosphere = true;        // ana anahtar
settings.uiSounds = true;                 // tap / success / warning sesleri
settings.voiceGuidance = false;           // sesli rehberlik
settings.ambientSounds = false;           // sabah/akşam ambient ses
settings.richHaptics = true;              // zengin haptik (Android ağırlıklı)
settings.launchRitual = true;             // açılış ritüeli
```

Tüm alanlar `migrate()` içinde varsayılan değerle gelmeli. Güncel `migrate()` `app.js` boot bölümünde; yeni alanlar **en son** eklenecek (modülerleştirmeden sonra).

---

## 7. Modülerleştirme Ön Koşulu

FX uygulanmadan önce aşağıdaki modüller oluşturulmalı:

| Modül | Görevi | Bağımlılığı |
|-------|--------|-------------|
| `app/core/audioFx.js` | `SeyAudio.tap/success/warning/bell/voice` | `settings`, `prefers-reduced-motion` |
| `app/core/hapticsFx.js` | `SeyHaptics.tap/success/error/refresh/streak/water` | `settings`, `navigator.vibrate` |
| `app/core/fxUtils.js` | `countUp`, `ripple`, `shouldAnimate` | `settings`, `matchMedia` |
| `app/core/timeTheme.js` | Saat/season bazlı tema class | `settings` |

Bu modüller `app.js` IIFE'sine `window.SeyAudio`, `window.SeyHaptics` olarak expose edilecek; böylece inline `onclick` handler'ları (`App.*`) değişmeden kullanabilir.

---

## 8. İlkeler Özeti

- Efektler `ui` objesine değil, `settings` altında kalıcı olmalı.
- Hiçbir efekt `data` dışına yeni global store açmamalı.
- Tüm sesler Web Audio API veya Web Speech API ile yerel üretilmeli.
- `prefers-reduced-motion` ve kullanıcı ayarlarına saygılı.
- FX modülleri `App.<name>` handler yüzeyini bozmamalı.
- Headless testlerle doğrulanabilir.

---

## 9. İlgili Belgeler

- [CODE-MAP.md](CODE-MAP.md) — gerçek fonksiyon/satır eşleştirmesi.
- [ROADMAP.md](ROADMAP.md) — fazlı uygulama sırası (Faz -1 modülerleştirme).
- [FX-LIBRARY.md](FX-LIBRARY.md) — ses/hareket parametre kataloğu.
- [MODULARIZATION.md](MODULARIZATION.md) — `app.js` bölme stratejisi.
- [SAFEGUARDS.md](SAFEGUARDS.md) — veri güvenliği ve erişilebilirlik kuralları.
