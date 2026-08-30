# Şeyma Premium FX Planı — Uygulama Yol Haritası

**Toplam Faz:** 7 (Faz -1: modülerleştirme + Faz 0..6)
**Yaklaşık Toplam Çalışma Süresi:** 6–8 hafta (tek geliştirici, yarı zamanlı)
**Her faz:** Plan → Spec → Implement → Test → Review → Belge güncelle

---

## Faz -1: app.js Modülerleştirme (FX’ten Önce — Zorunlu)

**Hedef:** ~18.805 satırlık monoliti, FX katmanının güvenli büyüyebileceği modüllere ayırmak. **Davranış korunur, sadece fiziksel yer değişir.**

### -1.1 Hazırlık
- [ ] `app-function-map.json` nihai gözden geçirme.
- [ ] Yeni `tests/app/test_modularization_boundary.js` skeleton.
- [ ] `index.html` script sırası spec’ini belirle.

### -1.2 Merkezileştirme
- [ ] `window.SeymaState = { data, ui, dark }` oluştur.
- [ ] `save()` ve `migrate()` State modülünde kalır; dışa `window.SeymaSave`/`window.SeymaMigrate` expose edilebilir.

### -1.3 Modül Ayırma Sırası
| Sıra | Modül | Gerekçe |
|------|-------|---------|
| 1 | `app/core/constants.js` | Zaten var; sadece genişletilecek. |
| 2 | `app/core/dateUtils.js` | Çok sayıda yerde kullanılan tarih helpers. |
| 3 | `app/core/state.js` | `data`, `ui`, `dark`, `migrate()` merkezi. |
| 4 | `app/core/helpers.js` | `toast`, `confetti`, `segTabs`, `progBar`, `statTile` vb. |
| 5 | `app/core/mediaFx.js` (yeni) | Ses/haptik/animasyon utilities. |
| 6 | `app/core/timeTheme.js` (yeni) | Saat/season bazlı tema class. |
| 7 | `app/core/prayer.js` | Namaz vakitleri. |
| 8 | `app/core/zikir.js` | Zikirmatik + `zikrTickSound`. |
| 9 | `app/core/saygi.js` | Saygı figürleri + Wikipedia. |
| 10 | `app/core/quran.js` | Kur’an Yolculuğu taşıma. |
| 11 | `app/core/motivation.js` | Motivasyon / terapi odası. |
| 12 | `app/core/crisis.js` | Kriz odaları. |
| 13 | `app/core/journal.js` | Günlük Işığı. |
| 14 | `app/core/health.js` | Su/uyku/beslenme/adım. |
| 15 | `app/core/library.js` | Kitaplık / izleme / dinleme. |
| 16 | `app/core/report.js` | Raporlar. |
| 17 | `app/core/map.js` | Harita / hava durumu. |
| 18 | `app/core/messaging.js` | ÆON / Luna sohbet. |
| 19 | `app/core/reminders.js` | Reminder UI merkezi. |
| 20 | `app/core/profile.js` | Profil değerlendirmesi. |
| 21 | `app/core/settings.js` | Ayarlar render. |
| 22 | `app/core/syncGlue.js` | `SeyOnSynced`, `save()` köprüsü. |
| 23 | `app/core/render.js` | `render()`, tab builder’ları. |
| 24 | `app/core/appSurface.js` | `App.*` handler’ları, event listener, boot sonu `render()`. |

### -1.4 Test ve Geçiş Kriterleri
- `node --check` her yeni dosya için.
- `node .claude/skills/run-seyma/driver.mjs` her modül sonrası.
- `node tests/app/test_faz10_sync.js` sync davranışı değişmemeli.
- `App.*` yüzeyi aynı kalmalı.
- `index.html` cache-bump yapılmalı.

---

## Faz 0: Altyapı ve Güvenlik Duvarı

**Hedef:** Kod değişikliği başlamadan önce test ve güvenlik iskelesini kurmak.

| Görev | Çıktı | Kriter |
|-------|-------|--------|
| 0.1 | `SAFEGUARDS.md` nihai hali | Erişilebilirlik, veri güvenliği, test kuralları net |
| 0.2 | `migrate()` güncelleme spec’i | Yeni `settings.*` alanlarının varsayılan değerleri tanımlı |
| 0.3 | Test fixture şablonları | `tests/app/test_premium_audio_fx.js`, `test_premium_haptics_fx.js`, `test_modularization_boundary.js` skeleton |
| 0.4 | `prefers-reduced-motion` genişletme spec’i | CSS’ta yeni animasyonların reduce moduna nasıl gireceği |

---

## Faz 1: UI Ses Dili + Haptik Alfabesi

**Hedef:** En hızlı hissedilir premiumlik.

### 1.1 `app/core/mediaFx.js` Modülü
- Ortak `AudioContext` yöneticisi.
- `SeyAudio.tap()`, `SeyAudio.success()`, `SeyAudio.warning()`, `SeyAudio.bell()` fonksiyonları.
- `SeyHaptics.tap()`, `SeyHaptics.success()`, `SeyHaptics.error()`, `SeyHaptics.refresh()`, `SeyHaptics.streak()`, `SeyHaptics.water()`.
- `settings.uiSounds`, `settings.richHaptics` kontrolü.
- `prefers-reduced-motion` ve sessiz mod uyumu.

### 1.2 İlk Bağlantılar
- `App.toggleHabit()`: success sound + haptic.
- `App.waterAdd()`: tap sound + haptic.
- `saveToday()` / `SeyOnSynced()`: bell + success haptic.
- Uyarı bannerları: warning sound + error haptic.

### 1.3 Test
- Yeni ses fixture’ları.
- Haptik fixture’ları (stub navigator.vibrate).
- Reduced motion testi.

---

## Faz 2: Mikro-animasyon ve Shimmer Genişlemesi

**Hedef:** Görsel geri bildirim zenginliği.

### 2.1 Count-up Animasyonları
- `heroPremiumStatsHTML` sayıları değişince count-up.
- Streak, su sayısı, gün indexi gibi metriklerde kullanılacak.

### 2.2 Shimmer Genişlemesi
- Su ilerleme barı (zaten var).
- Günlük Işığı hedef barı (zaten var).
- Habits SVG progress ring’ine shimmer eklenecek.
- Motivation ilerleme barı shimmer güçlendirilecek.

### 2.3 Ripple Efekti
- Dokunulan buton/kart üzerinde CSS pseudo-element ripple.
- Aktif halde `transform: scale(0.97)`.

### 2.4 Kart Hover / Active
- `.surface` kartlara hover state ekle.
- Bottom nav aktif ikon bounce.

### 2.5 Test
- `.claude/skills/run-seyma/driver.mjs` ile render class kontrolleri.
- `prefers-reduced-motion` fixture’ı.

---

## Faz 3: Premium Açılış Ritüeli

**Hedef:** İlk izlenimi yükseltmek.

### 3.1 Splash HTML
- `index.html` içine `#sey-splash` eklenir.
- Logo, flamingo, aurora, karşılama metni.

### 3.2 Splash CSS
- Liquid Glass stil.
- `seyFadeOut` keyframe.
- Reduce motion desteği.

### 3.3 Splash JS
- `app.js` boot sırasında `localStorage` okunana kadar splash göster.
- Veri hazır olunca splash’i kaldır, uygulamayı göster.
- `settings.launchRitual` kontrolü.

### 3.4 Test
- Headless render splash class’ı var/yok durumları.
- Reduced motion testi.

---

## Faz 4: Canlı Arka Plan + Saat Bazlı Tema

**Hedef:** Atmosferik derinlik.

### 4.1 Saat Bazlı `--page` Gradienti
- `SeyTimeTheme.apply()` ile sabah/öğlen/akşam/gece class’ı.
- `#root` üzerine CSS class uygula.
- `settings.premiumAtmosphere` kontrolü.

### 4.2 Aurora Arka Plan
- Mevcut `seyAurora` keyframe’ini body/background katmanına uygula.
- Opacity çok düşük tut; metin okunabilirliğini koru.

### 4.3 Seasonal Theme
- Özel günlerde (Ramazan, yılbaşı, ilkbahar ekinoksu) `--accent` ton kayması.
- Kullanıcı isteğe bağlı kapatabilir.

### 4.4 Test
- Kontrast fixture’ı (`verify-contrast.mjs` benzeri).
- Reduced motion + renk erişilebilirliği.

---

## Faz 5: Sesli Rehberlik Anları

**Hedef:** Duygusal bağ ve mindfulness desteği.

### 5.1 Web Speech API Entegrasyonu
- `SeyAudio.voice(text)` fonksiyonu.
- Türkçe ses seçimi ve hata yönetimi.
- `settings.voiceGuidance` kontrolü.

### 5.2 Rehberlik Anları
- Günlük Işığı açılınca günün sorusunu sesli oku.
- Mod/stres yüksekse kısa yatıştırıcı mesaj.
- Gece 22:00+ açılışta “İyi geceler” selamı.
- Motivasyon kartı “cesaret kanıtı” mesajı.

### 5.3 Nefes Eşlikçisi
- Zikir/İlham & İbadet kısmında 4-7-8 nefes ritmi için sesli metronom.
- Görsel daire genişleyip daralır.

### 5.4 Test
- Ses fixture’ı.
- Speech API olmayan ortamlarda graceful fallback.

---

## Faz 6: Premium Atmosfer Anahtarı ve Ayarlar Yüzeyi

**Hedef:** Tüm efektleri tek, kullanıcı kontrollü anahtar altında toplamak.

### 6.1 Ayarlar Bölümü
- “Görünüm & Ses” yeni bölümü.
- Toggle’lar:
  - Premium Atmosfer (master)
  - UI Sesleri
  - Sesli Rehberlik
  - Ambient Sesler
  - Zengin Haptik
  - Açılış Ritüeli

### 6.2 Master Anahtar Davranışı
- Premium Atmosfer kapalıysa tüm alt efektler pasif.
- Açıldığında kullanıcının son seçimlerini hatırlar.
- `prefers-reduced-motion: reduce` master anahtarı zorla kapatabilir.

### 6.3 `migrate()` Güncellemesi
- Tüm yeni alanların varsayılan değerleri:
  - `premiumAtmosphere: true`
  - `uiSounds: true`
  - `voiceGuidance: false`
  - `ambientSounds: false`
  - `richHaptics: true`
  - `launchRitual: true`

### 6.4 Test
- Ayarlar render fixture’ı.
- Migrate fixture’ı (eski veriden yeni veriye).
- Reduced motion override testi.

---

## Faz 7: Son Doğrulama ve Belgeleme (Kapanış)

| Görev | Çıktı |
|-------|-------|
| 7.1 | Tüm fixture’ların çalıştırılması |
| 7.2 | `docs/GELISTIRME-PLANI.md` güncelleme spec’i |
| 7.3 | `index.html` cache-bump spec’i |
| 7.4 | Final review checklist |
| 7.5 | Bu plan klasörünün arşivlenmesi veya uygulama reposuna taşınma kararı |

---

## Riskler ve Önerilen Önlemler

| Risk | Etki | Önlem |
|------|------|-------|
| Performans düşüşü | Orta | CSS transform/opacity odaklı; layout animasyonundan kaçın. |
| Erişilebilirlik kırılması | Yüksek | `prefers-reduced-motion` + master toggle zorunlu. |
| Veri modeli kırılması | Yüksek | Sadece `settings` altına alan ekle; `migrate()` kullan. |
| Ses çalışmaması (iOS policy) | Orta | AudioContext resume kullanıcı etkileşimiyle tetikle. |
| Sync güvenliği | Yüksek | Efektler sync payload’una hiçbir şey eklememeli. |

---

## Özet: Başlangıç Önerisi

**En yüksek etki / en düşük risk sırası:**

1. Faz 0: Güvenlik duvarı ve test iskelesi.
2. Faz 1: UI ses dili + haptik (hemen hissedilir).
3. Faz 2: Mikro-animasyon + shimmer (görsel zenginlik).
4. Faz 6: Premium Atmosfer anahtarı (kullanıcı kontrolü).
5. Faz 3: Açılış ritüeli (ilk izlenim).
6. Faz 4: Canlı arka plan (atmosfer).
7. Faz 5: Sesli rehberlik (duygusal derinlik).
