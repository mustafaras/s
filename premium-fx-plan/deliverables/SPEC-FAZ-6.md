# Faz 6: Premium Atmosfer Anahtarı ve Ayarlar Yüzeyi — Detay Spec

**Hedef:** Tüm efektleri tek, kullanıcı kontrollü anahtar altında toplamak.

---

## 6.1 Ayarlar Bölümü Tasarımı

**Konum:** `app.js` içindeki ayarlar render fonksiyonu (mevcut ayarlar ekranı).

**Yeni bölüm başlığı:** `Görünüm & Ses` veya `Premium Atmosfer`.

**Toggles (sırasıyla):**

| Toggle | `settings` Alanı | Varsayılan | Açıklama |
|--------|------------------|------------|----------|
| Premium Atmosfer | `premiumAtmosphere` | `true` | Tüm efektlerin master anahtarı |
| UI Sesleri | `uiSounds` | `true` | Buton tik, success, warning sesleri |
| Sesli Rehberlik | `voiceGuidance` | `false` | Gün sorusu, nefes, gece selamı |
| Ambient Sesler | `ambientSounds` | `false` | Sabah/akşam ambient sesleri |
| Zengin Haptik | `richHaptics` | `true` | Android için zengin titreşim pattern’leri |
| Açılış Ritüeli | `launchRitual` | `true` | Splash ekranı ve karşılama |

---

## 6.2 Toggle Bileşeni

**Önerilen HTML yapısı:**

```html
<div class="sey-setting-row">
  <div class="sey-setting-info">
    <div class="sey-setting-label">Premium Atmosfer</div>
    <div class="sey-setting-desc">Dokunuş sesleri, animasyonlar ve canlı arka plan</div>
  </div>
  <button class="sey-toggle" role="switch" aria-checked="true" onclick="App.toggleSetting('premiumAtmosphere')">
    <span class="sey-toggle-knob"></span>
  </button>
</div>
```

**CSS:**

```css
.sey-toggle {
  width: 50px;
  height: 30px;
  border-radius: 999px;
  border: none;
  background: var(--icon);
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
}
.sey-toggle[aria-checked="true"] {
  background: var(--ok);
}
.sey-toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: transform 0.2s var(--ease-premium, ease);
}
.sey-toggle[aria-checked="true"] .sey-toggle-knob {
  transform: translateX(20px);
}

@media (prefers-reduced-motion: reduce) {
  .sey-toggle, .sey-toggle-knob { transition: none !important; }
}
```

---

## 6.3 Master Anahtar Davranışı

### 6.3.1 `premiumAtmosphere === false`

Aşağıdaki tüm alt efektler anında pasif olur:
- UI sesleri (`uiSounds` mantıksal olarak false sayılır).
- Animasyonlar (`prefers-reduced-motion` gibi davranır).
- Haptik (`richHaptics` mantıksal olarak false sayılır).
- Splash (`launchRitual` mantıksal olarak false sayılır).
- Canlı arka plan (`theme-time-*` class’ları kaldırılır).
- Aurora arka plan durur.

### 6.3.2 `premiumAtmosphere === true`

Alt ayarlar kullanıcının son tercihlerine döner:
- Eğer kullanıcı daha önce `uiSounds` kapatmışsa, açınca o kapalı kalır.
- Eğer hiç dokunulmamışsa default değerler uygulanır.

### 6.3.3 Reduce Motion Override

```js
function prefersReducedMotion(){
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isPremiumFxEnabled(){
  var s = data.settings || {};
  if(prefersReducedMotion()) return false;
  if(s.premiumAtmosphere === false) return false;
  return true;
}
```

**Kural:** `prefers-reduced-motion: reduce` aktifse `premiumAtmosphere` otomatik olarak devre dışı sayılır. Kullanıcıya bilgi mesajı gösterilebilir.

---

## 6.4 `migrate()` Güncellemesi

**Dosya:** `/Users/m_ras/Desktop/seyma/app.js` içindeki `migrate(d)`.

**Eklenecek satırlar:**

```js
if(!d.settings) d.settings = {};
if(d.settings.premiumAtmosphere == null) d.settings.premiumAtmosphere = true;
if(d.settings.uiSounds == null) d.settings.uiSounds = true;
if(d.settings.voiceGuidance == null) d.settings.voiceGuidance = false;
if(d.settings.ambientSounds == null) d.settings.ambientSounds = false;
if(d.settings.richHaptics == null) d.settings.richHaptics = true;
if(d.settings.launchRitual == null) d.settings.launchRitual = true;
```

**Kural:** Mevcut değerler korunur; sadece tanımlı değilse default atanır.

---

## 6.5 Ayarlar Ekranı Entegrasyonu

**Konum:** Ayarlar render fonksiyonu içinde, muhtemelen “Senkron” veya “Gizlilik” bölümünden sonra.

**Önerilen ek metin:**

> “Premium Atmosfer açıkken Şeyma daha canlı dokunuş sesleri, yumuşak animasyonlar ve saat bazlı arka plan kullanır. Eğer hareketli efektleri azaltmak istersen, telefonunun Erişilebilirlik ayarlarında ‘Hareketi azalt’ seçeneğini açabilirsin.”

---

## 6.6 Test Planı

### `tests/app/test_premium_settings_toggle.js`

**Seneryolar:**
1. Ayarlar ekranında `Premium Atmosfer` toggle’ı var.
2. Toggle tıklayınca `settings.premiumAtmosphere` değeri değişir.
3. Master kapalıyken `isPremiumFxEnabled()` false döner.
4. `prefers-reduced-motion: reduce` aktifse `isPremiumFxEnabled()` false döner.
5. `premiumAtmosphere` true olduğunda alt ayarlar korunur.

### `tests/app/test_premium_migrate.js`

**Seneryolar:**
1. Eski veride (settings tanımsız) tüm yeni alanlar default değerle eklenir.
2. Mevcut `settings` varsa eski değerler korunur.
3. `migrate()` idempotent; iki kez çağrılınca aynı sonuç.

---

## 6.7 Çıktı Listesi

- [ ] Ayarlar bölümü HTML/CSS spec’i
- [ ] Toggle bileşeni CSS spec’i
- [ ] Master anahtar mantığı spec’i
- [ ] `prefers-reduced-motion` override spec’i
- [ ] `migrate()` güncelleme spec’i
- [ ] Test skeleton’ları
