# Şeyma Premium FX — migrate() Güncelleme Spec'i

**Sürüm:** 2.1  
**Güncellendi:** 2026-08-30

**Dosya:** `/Users/m_ras/Desktop/seyma/app.js` içindeki `migrate(d)` fonksiyonu (satır 4415).

**Amaç:** Yeni premium efekt ayarlarının eski verilere güvenli şekilde eklenmesini sağlamak.

## Eklenecek Alanlar

Tümü `d.settings` altında olmalı:

```js
if(!d.settings) d.settings = {};
if(d.settings.premiumAtmosphere == null) d.settings.premiumAtmosphere = true;
if(d.settings.uiSounds == null) d.settings.uiSounds = true;
if(d.settings.voiceGuidance == null) d.settings.voiceGuidance = false;
if(d.settings.ambientSounds == null) d.settings.ambientSounds = false;
if(d.settings.richHaptics == null) d.settings.richHaptics = true;
if(d.settings.launchRitual == null) d.settings.launchRitual = true;
```

## Kurallar

1. Sadece `settings` altına alan ekle.
2. Mevcut değer varsa üzerine yazma.
3. Boolean türünde olmalı.
4. `migrate()` idempotent kalmalı.
5. Hiçbir efekt alanı `data` köküne veya sync payload dışına taşınmamalı.

## Yerleşim

`migrate(d)` fonksiyonunun varolan settings init bölümünün hemen ardıına eklenmeli. Fonksiyon içinde birden fazla yerde settings düzenleniyorsa, en son settings bloğuna veya hepsinin önüne tek bir blok olarak eklenmeli.
