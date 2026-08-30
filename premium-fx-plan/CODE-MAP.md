# Şeyma Premium FX Planı — Kod Haritası (Code-Map)

**Sürüm:** 2.0
**Tarih:** 2026-08-30
**Kaynak:** `app.js` 18.805 satır, `app-function-map.json`

Bu belge, FX planının uygulanacağı gerçek fonksiyon/satır noktalarını eşleştirir. Kullanıcı isteği üzerine “hiper detay” hedeflenmiştir. **Kod değiştirilmeden** referans amaçlıdır.

---

## 1. Global Yapı ve Boot

| Sembol | Satır (yaklaşık) | Açıklama | FX ilişkisi |
|--------|------------------|----------|-------------|
| `SEYMA_VERSION` | 1–50 | Sabit, cache-bust | Yeni FX modüllerinin `?v=` güncellemesi ile ilişkili |
| `KEY` / `TKEY` | 50–100 | LocalStorage / sync anahtarları | `save()` ile FX ayarları da persist olur |
| `icon()` | ~80 | SVG ikon üreteci | İkon animasyonları buradan türetilebilir |
| `HABITS` | ~120 | Ana alışkanlık listesi | Tik sesleri her biri için aynı |
| `SOUL_ACTIVITY_CATALOG` | ~130 | Ruhsal aktivite kataloğu | - |
| `PRAYER_NAMES` / `PRAYER_CITIES` | ~160–190 | Namaz vakitleri sabitleri | - |
| `data` / `ui` / `dark` | boot bölümü | Global durumlar | `settings.*` FX anahtarları burada |
| `migrate(d)` | boot bölümü | Geriye dönük uyumluluk | Tüm FX ayarları varsayılan değer eklenmeli |
| `save()` | boot civarı | LocalStorage + sync schedule | FX değişiklikleri `save()` sonrası sync etmezse panelde görünmez |
| `render()` | ~9688 | Tüm uygulama render motoru | FX modülleri `render`’den önce yüklenmeli |

---

## 2. Yardımcı Fonksiyonlar (Helpers)

| Sembol | Satır | Açıklama | FX giriş noktası |
|--------|-------|----------|------------------|
| `segTabs(...)` | ~4000–4300 | Segment tab UI | Aktif tab geçiş animasyonu |
| `progBar(...)` | ~4500 | İlerleme çubuğu | Shimmer / gradient motion |
| `starRow(...)` | ~4700 | Yıldız satırı | Tap feedback |
| `miniBars(...)` | ~4900 | Mini bar grafik | Pop animasyonu |
| `statTile(...)` | ~5100 | İstatistik karo | Count-up sayılar |
| `collapsibleCardHTML(...)` | ~5300 | Açılır kart | Açılış/kapanış float/fade |
| `toast(...)` | ~6000 | Toast | Ses + haptik |
| `confetti()` | ~6100 | Konfeti | Zaten görsel; haptik eşlik edebilir |
| `haptic(ms)` | ~6375 | `navigator.vibrate` | **Tek mevcut haptic noktası** |

**FX stratejisi:** `toast`, `confetti`, `haptic` zaten efekt köprüleri; bunlar `SeyHaptics` / `SeyAudio` çağrılarıyla zenginleştirilecek.

---

## 3. Sensory / Audio

| Sembol | Satır | Açıklama |
|--------|-------|----------|
| `zikrTickSound()` | ~8502 | Zikirmatik tiki; uygulamadaki **tek Web Audio API** kullanıcısı |

**FX stratejisi:** `zikrTickSound` `app/core/zikir.js` içinde kalacak; yeni `SeyAudio` modülü tarafından beslenecek. Ortak `AudioContext` kullanımı sağlanacak.

---

## 4. Action Handlers — Efekt Tetikleyicileri

| Sembol | Satır | Tetikleyici | Önerilen FX |
|--------|-------|-------------|-------------|
| `App.toggleHabit(...)` | ~8200 | Alışkanlık tik | `SeyAudio.tap()` + `SeyHaptics.tap()` + check morph |
| `App.waterAdd(...)` | ~8300 | Su ekle | `SeyAudio.tap()` + `SeyHaptics.water()` + ripple |
| `App.setMood(...)` | ~8400 | Ruh hali seç | `SeyAudio.tap()` + soft pop |
| `App.zikirTap()` | ~8500 | Zikirmatik | Mevcut `zikrTickSound()` zaten var; haptik ekle |
| `App.saveJournal(...)` | ~8700 | Günlük kaydet | `SeyAudio.success()` + `SeyHaptics.success()` |
| `App.saveNote(...)` | ~8800 | Not kaydet | `SeyAudio.success()` |
| `App.sendAeonMessage(...)` | ~17.000–17.500 | ÆON mesaj gönder | `SeyAudio.tap()` + balon pop |
| `App.sendLunaVoice(...)` | ~17.500 | Luna ses | `SeyAudio.tap()` |

**Not:** Handler adları değişmeyecek; yalnızca gövdelerine FX çağrıları eklenecek.

---

## 5. Render Motoru ve Tab Builder’ları

| Sembol | Satır | Açıklama |
|--------|-------|----------|
| `render()` | ~9688 | Sekme yönlendirici ve tam yenileme |
| `onboardingHTML()` | ~9900 | İlk kurulum ekranı |
| `appHeaderHTML()` | ~10.000 | Üst bar (sync durumu, başlık) |
| `navHTML()` | ~10.200 | Alt navigasyon |
| `bugunHTML()` | ~12.000 | Bugün sekmesi ana builder |
| `heroPremiumStatsHTML()` | ~12.000–12.200 | Hero istatistikler (premium vurgu için ideal) |
| `beslenmeCardHTML()` | ~10.300 | Beslenme kartı |
| `waterCard()` | ~10.500 | Su kartı |
| `moodCardHTML()` | ~10.700 | Ruh hali kartı |
| `habitsCardHTML()` | ~10.900 | Alışkanlık kartı |
| `weatherHeaderHTML()` | ~11.100 | Hava durumu başlığı |
| `dailyPhotoCardHTML()` | ~11.300 | Günlük fotoğraf kartı |
| `vacationCardHTML()` | ~11.500 | Tatil / izin kartı |
| `motivationTodayCardHTML()` | ~11.700 | Günlük motivasyon kartı |
| `saglikHTML()` | ilgili | Sağlık sekmesi |
| `saygiHTML()` | ilgili | Saygı sekmesi |
| `mesajHTML()` | ilgili | Mesaj / ÆON sekmesi |
| `haritaHTML()` | ilgili | Harita sekmesi |
| `raporHTML()` | ilgili | Rapor sekmesi |
| `ayarlarHTML()` | ilgili | Ayarlar sekmesi |
| `roomOverlayHTML()` | ~11.900 | Tam ekran oda/hub overlay |

---

## 6. Overlay / Hub Bileşenleri (FX İçin Premium Alan)

| Sembol | Satır | Açıklama |
|--------|-------|----------|
| `openReading()` / `closeReading()` | ~6.000–7.000 | 📖 Okuma hub |
| `openWatching()` / `closeWatching()` | ~7.000–7.500 | 🎬 İzleme hub |
| `openListening()` / `closeListening()` | ~7.500–8.000 | 🎧 Dinleme hub |
| `openSaygi()` / `closeSaygi()` | ~14.000–16.000 | Saygı hub |
| `openZikir()` / `closeZikir()` | ~8.000–9.000 | Zikir hub |
| `openMotivationRoom()` | ~12.000 | Motivasyon / terapi odası |
| `openCrisis()` | ilgili | Kriz odası |

**FX fırsatı:** overlay açılışlarında `seyFloatIn`, kapanışta `seyFadeOut`, arka planda `seyRoomGlow` kullanılabilir. Mevcut keyframes yeterli.

---

## 7. Sync ve Başarı Geri Bildirimi

| Sembol | Satır | Açıklama |
|--------|-------|----------|
| `SeyOnSyncState(...)` | ~17.800 | Sync durum değişimi |
| `SeyOnSynced(...)` | ~17.999 | Sync başarı geri bildirimi |
| `save()` | boot | LocalStorage + `SeySync.schedule` |

**FX giriş noktası:** `SeyOnSynced` başarı durumunda `SeyAudio.bell()` + header check morph + `SeyHaptics.success()`.

---

## 8. Timer / Poll Döngüleri

| Sembol | Satır | Açıklama |
|--------|-------|----------|
| `setInterval` 30 sn ÆON yoklama | dosya sonu | Yeni mesaj varsa badge pop |
| `setInterval` 30 sn foreground poll | dosya sonu | `SeySync.retryIfPending` |

**FX giriş noktası:** Yeni mesaj algılandığında `SeyAudio.bell()` + badge `seyPop`.

---

## 9. Mevcut CSS Animasyon Kaynakları

`app/styles.css` içinde şu keyframes tanımlı:

- `seyPop`
- `seyFloatIn`
- `seyShine`
- `seyAurora`
- `seyRoomGlow`
- `seyWordSheen`
- `seySynapseDrift`

`@media (prefers-reduced-motion: reduce)` zaten mevcut.

**FX stratejisi:** Yeni efektler bu keyframes’leri yeniden kullanmalı; gereksiz yeni keyframes eklenmemeli.

---

## 10. Ayarlar ve migrate()

| Mevcut | Konum | Eklenecek |
|--------|-------|-----------|
| `ayarlarHTML()` veya ayarlar fonksiyonu | `app.js` içinde | “Görünüm & Ses” yeni bölümü; `premiumAtmosphere`, `uiSounds`, `voiceGuidance`, `ambientSounds`, `richHaptics`, `launchRitual` toggle’ları |
| `migrate()` | `app.js` boot | Tüm yeni `settings.*` alanlarına varsayılan değer |

---

## 11. Önerilen İlk 5 FX Giriş Noktası (Hızlı Kazanım)

1. **`App.toggleHabit`** → `SeyAudio.tap()` + `SeyHaptics.tap()` + check morph.
2. **`App.waterAdd`** → `SeyAudio.tap()` + `SeyHaptics.water()` + ripple.
3. **`SeyOnSynced`** → `SeyAudio.bell()` + header check morph.
4. **`App.zikirTap`** → `SeyHaptics.tap()` (ses zaten var).
5. **Overlay açılışları** → `seyFloatIn` zaten var; tek yapmamız gereken class yönetimi `timeTheme.js` veya `fxUtils.js` içinde merkezileştirmek.

---

## 12. Eşleştirme Kuralları

- Satır numaraları yaklaşıktır; gerçek uygulamada `app-function-map.json` ile doğrulanacak.
- Bir handler’ın adı değişmeyecek; yalnızca gövdesi başka dosyaya taşınabilir.
- FX çağrıları, inline `onclick` handler’larına dokunmadan, handler gövdesinin içine eklenecek.
- Yeni ses/haptik modülleri `window.SeyAudio` / `window.SeyHaptics` olarak expose edilecek.
