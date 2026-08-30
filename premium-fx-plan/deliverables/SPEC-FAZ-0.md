# Faz 0: Altyapı ve Güvenlik Duvarı — Detay Spec

**Sürüm:** 2.1  
**Güncellendi:** 2026-08-30  
**Amaç:** Kod değişikliği başlamadan önce test ve güvenlik iskelesini kurmak.

---

## 0.1 SAFEGUARDS.md Son Haline Getirme

**Dosya:** `/Users/m_ras/Desktop/seyma/premium-fx-plan/SAFEGUARDS.md`

**Yapılacaklar:**
- Mevcut SAFEGUARDS.md’yi gözden geçir.
- Gözden kaçan kısıt varsa ekle.
- Planın uygulanacağı gerçek `seyma` reposunun `CLAUDE.md` ve `AGENTS.md` ile uyumlu olduğundan emin ol.
- `prefers-reduced-motion`, veri güvenliği, test zorunlulukları ve dışlananlar bölümlerini netleştir.

**Çıktı:** Onaylanmış `SAFEGUARDS.md`.

---

## 0.2 `migrate()` Güncelleme Spec’i

**Kaynak:** `/Users/m_ras/Desktop/seyma/app.js` içindeki `migrate(d)` fonksiyonu (satır 4415).

**Eklenecek varsayılan alanlar:**

```js
settings.premiumAtmosphere = true;
settings.uiSounds = true;
settings.voiceGuidance = false;
settings.ambientSounds = false;
settings.richHaptics = true;
settings.launchRitual = true;
```

**Kurallar:**
- Sadece `settings` altına ekle.
- Mevcut değer varsa üzerine yazma.
- Boolean türünde olmalı.
- `migrate()` idempotent kalmalı.

**Çıktı:** `deliverables/MIGRATE-SPEC.md`

---

## 0.3 Yeni Test Fixture Şablonları

**Konum:** `/Users/m_ras/Desktop/seyma/tests/app/`

**Oluşturulacak dosyalar:**

| Dosya | Amaç |
|-------|------|
| `test_premium_audio_fx.js` | Ses efektlerinin varlığı, settings kontrolü, reduced motion fallback. |
| `test_premium_haptics_fx.js` | Haptik pattern varlığı, `navigator.vibrate` stub, iOS fallback. |
| `test_premium_reduced_motion.js` | Tüm yeni animasyon class’larının reduce modunda pasif olması. |
| `test_premium_launch_splash.js` | Splash elementinin varlığı ve kapanışı. |
| `test_premium_time_theme.js` | Saat bazlı tema class’ının doğru uygulanması. |

**Şablon yapısı:** Mevcut `tests/app/test_faz10_sync.js` deseni takip edilecek:
- `node:vm` kullanımı
- Sahte `window`, `localStorage`, `fetch`
- `assert` fonksiyonu
- Minimal HTML / DOM stub

**Çıktı:** `/Users/m_ras/Desktop/seyma-premium-fx-plan/deliverables/TEST-SKELETONS/`

---

## 0.4 `prefers-reduced-motion` Genişletme Spec’i

**Kaynak:** `/Users/m_ras/Desktop/seyma/app/styles.css`

**Yapılacaklar:**
- Mevcut `@media (prefers-reduced-motion: reduce)` bloklarını listele.
- Yeni animasyon class’ları için pasif hale getirilecek kuralları tanımla.
- Örnek:

```css
@media (prefers-reduced-motion: reduce) {
  .sey-fx-shimmer,
  .sey-fx-ripple,
  .sey-fx-float,
  .sey-splash,
  .sey-time-theme,
  .sey-fx-count,
  .sey-fx-bounce {
    animation: none !important;
    transition: none !important;
  }
}
```

**Çıktı:** `deliverables/REDUCED-MOTION-SPEC.md`

---

## 0.5 Kod Değişikliği Yok

Faz 0’da uygulama kodu değiştirilmeyecek. Sadece spec ve test skeleton’ları üretilecek.

---

## 0.6 Çıktı Listesi

- [ ] Onaylanmış `SAFEGUARDS.md`
- [ ] `deliverables/MIGRATE-SPEC.md`
- [ ] `deliverables/TEST-SKELETONS/*.js`
- [ ] `deliverables/REDUCED-MOTION-SPEC.md`
