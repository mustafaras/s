# Şeyma Premium FX Planı — Güvenlik, Erişilebilirlik ve Veri Kısıtları

**Sürüm:** v2.1 — 2026-08-30

**Amaç:** Planın uygulanması sırasında asla kırılmaması gereken kuralları netleştirmek.

---

## 1. Veri Güvenliği

### 1.1 Temel Kural

Hiçbir efekt, `data` objesinin, `migrate()` fonksiyonunun, `sync.js` akışının veya GitHub Contents API çağrılarının davranışını değiştirmemeli.

### 1.2 Yeni Veri Alanları

Eklenebilecek tek veri: `settings` altındaki boolean/number/string tercih alanları.

```js
// İzin verilen yeni alanlar (migrate ile varsayılan değerli)
settings.premiumAtmosphere
settings.uiSounds
settings.voiceGuidance
settings.ambientSounds
settings.richHaptics
settings.launchRitual
```

### 1.3 Sync Payload Kuralı

`sync.js` içindeki `sanitize()` fonksiyonu, `data.settings.*` altındaki tüm alanları zaten varsayılan olarak senkronize eder (`settings` zaten sync payload’ının içinde). Bu nedenle yeni premium tercih alanları da mutlaka `settings` altında tanımlanmalı; başka bir kök/namespace altına eklenmemeli.

```js
// Doğru: tercihler settings altında kalır, sync.js onları zaten senkronize eder
settings.premiumAtmosphere
settings.uiSounds
settings.voiceGuidance
settings.ambientSounds
settings.richHaptics
settings.launchRitual
```

**Asla sync payload’a eklenmemesi gerekenler:**
- Audio context state
- Animasyon state
- Geçici UI durumları (`ui.*`)
- Herhangi bir medya dosyası

### 1.4 localStorage Kuralı

Efektler sadece `settings` altında kaydedilebilir. `ui` objesine yeni alan eklenebilir ama bu alanlar **asla** `localStorage`’a ve repoya gitmemeli.

---

## 2. Erişilebilirlik

### 2.1 `prefers-reduced-motion`

Tüm yeni animasyon ve geçişler, `@media (prefers-reduced-motion: reduce)` altında pasif hale getirilebilmeli.

```css
@media (prefers-reduced-motion: reduce) {
  .sey-fx-animated,
  .sey-fx-shimmer,
  .sey-fx-ripple,
  .sey-fx-float,
  .sey-fx-count,
  .sey-fx-bounce,
  .sey-fx-splash,
  .sey-fx-time-theme,
  .sey-fx-aurora,
  .sey-fx-nav-bounce {
    animation: none !important;
    transition: none !important;
  }
}
```

### 2.2 Kullanıcı Kontrolü

`settings.premiumAtmosphere` master anahtarı, tüm efektleri anında kapatmalı.

### 2.3 Ses Erişilebilirliği

- Ses efektleri varsayılan açık olabilir ama kolayca kapatılabilmeli.
- Sesli rehberlik (`voiceGuidance`) varsayılan **kapalı** olmalı; kullanıcı açıkça açmalı.
- iOS’ta AudioContext kullanıcı etkileşimi ile başlatılmalı; aksi takdirde sessiz kalır.

### 2.4 Görsel Kontrast

- Tüm yeni gradient, glow ve arka plan efektleri, mevcut kontrast fixture’larından (`docs/apple-design/verify-contrast.mjs`) geçmeli.
- Metin okunabilirliği asla riske atılmamalı.

---

## 3. Güvenlik

### 3.1 Harici Kaynaklar

- Mümkünse harici ses dosyası kullanılmasın.
- Eğer kullanılırsa, base64/data-uri veya repo içindeki küçük dosyalar tercih edilmeli.
- Harici URL’ye asla otomatik istek atılmamalı (gizlilik ve performans).

### 3.2 Auto-play Kuralı

Web Audio API ve Web Speech API, kullanıcı etkileşimi (touch/click) olmadan otomatik çalışmamalı. Splash ve karşılama sesleri, kullanıcı ilk dokunuşunu yapana kadar ertelenmeli.

### 3.3 CSP

GitHub Pages statik hosting için CSP etkisi sınırlı; ama yeni inline script/animasyonlar mevcut CSP’yi (varsa) kırmamalı.

---

## 4. Test Zorunlulukları

### 4.1 Her Faz Sonrası Çalıştırılacak Testler

```bash
node --check app.js
node --check app/core/mediaFx.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/panel/test_faz11_panel.js
node tests/app/test_premium_audio_fx.js
node tests/app/test_premium_haptics_fx.js
node tests/app/test_premium_reduced_motion.js
node tests/app/test_premium_launch_splash.js
node tests/app/test_premium_time_theme.js
node tests/app/test_modularization_boundary.js
node docs/apple-design/verify-contrast.mjs
node docs/apple-design/verify-theme-tristate.mjs
```

### 4.2 Yeni Testler

- `tests/app/test_premium_audio_fx.js`
- `tests/app/test_premium_haptics_fx.js`
- `tests/app/test_premium_reduced_motion.js`
- `tests/app/test_premium_launch_splash.js`
- `tests/app/test_premium_time_theme.js`
- `tests/app/test_modularization_boundary.js`

Mevcut kontrast ve tema fixture'ları:
- `docs/apple-design/verify-contrast.mjs`
- `docs/apple-design/verify-theme-tristate.mjs`

### 4.3 Manuel / Görsel QA

- Her değişiklik sonrası hem açık hem koyu tema kontrolü.
- `prefers-reduced-motion: reduce` simülasyonu.
- iOS Safari + Android Chrome dokunma davranışları.

---

## 5. Dışlananlar (Yapılmayacaklar)

Aşağıdaki öneriler bu plan kapsamında dışlanmıştır:

- Harici reklam, analytics veya üçüncü taraf SDK entegrasyonu.
- Uygulamaya yeni backend veya sunucu tarafı bileşen.
- Kullanıcı verisini değiştiren veya toplayan efekt.
- Otomatik video oynatma.
- Flashing/strobe efektleri (seizure riski).
- Karanlık modda aşırı parlak glow.

---

## 6. Onay Kontrol Listesi

Planı uygulamadan önce şu maddelerin tamamı onaylanmalı:

- [ ] Tüm yeni veri alanları `settings` altında tanımlı.
- [ ] `migrate()` güncelleme spec’i yazıldı.
- [ ] `prefers-reduced-motion` ve `premiumAtmosphere` pasif durumları belgelendi.
- [ ] Sesler kullanıcı etkileşimiyle tetikleniyor.
- [x] Yeni test fixture’ları oluşturuldu ve çalıştırıldı.
- [ ] Kontrast ve erişilebilirlik kontrolü planlandı.
- [ ] `docs/GELISTIRME-PLANI.md` güncelleme planı var.
