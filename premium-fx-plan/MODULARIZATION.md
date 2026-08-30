# Şeyma Premium FX Planı — app.js Modülerleştirme Stratejisi

**Sürüm:** 1.0
**Tarih:** 2026-08-30
**Hedef:** ~18.805 satırlık `app.js` monolitini, FX katmanının güvenli şekilde büyüyebileceği bir modül ailesine dönüştürmek. **Kod değiştirilmeden** planlanmıştır.

---

## 1. Neden Şimdi?

- `app.js` 18.805 satır, 1.893 fonksiyon.
- Yeni ses/hareket/animasyon kodunu doğrudan içine eklemek, dosyayı 20.000+ satıra iter ve test/yönetim maliyetini katlar.
- Mevcut mimari zaten **IIFE + global modül desenini** kullanıyor (`window.MotivationProgramV2`, `window.SeymaConstants`, `window.SeySync`). Bu deseni `app.js` içi için de kullanmak doğal.
- Modülerleştirme, FX planının **uygulanabilirlik ön koşuludur**.

---

## 2. Aşama -1 (FX’ten Önce): `app.js` Bölme

Tüm hareketler davranışı koruyarak, yalnızca fiziksel konumu değiştirir.

### 2.1 Hedef Modül Listesi

| # | Dosya | İçeriği | Mevcut satır aralığı (tahmini) |
|---|-------|---------|--------------------------------|
| 1 | `app/core/constants.js` | `SEYMA_CONSTANTS`, `KEY`, `TKEY`, feature gate, `icon()`, `HABITS`, `SOUL_ACTIVITY_CATALOG`, temel yardımcılar (`ucfirst`, `fmtDuration`) | `app.js` başı ~1–400 |
| 2 | `app/core/dateUtils.js` | `todayStr`, `addDays`, `diffDays`, `pad2`, `fmt`, `shortDate`, `dateLabelTR`, hafta/ay hesapları | ~dağınık, toplanacak |
| 3 | `app/core/state.js` | `data`, `ui`, `dark`, `migrate()`, `createDefaultData()`, `getDay`, `save()` çağrısı olmadan state helpers | boot + global state |
| 4 | `app/core/prayer.js` | `PRAYER_NAMES`, `PRAYER_CITIES`, vakit çekme, cache, `fetchPrayerTimes`, `ensurePrayerDay` | ~700–900 arası bloklar |
| 5 | `app/core/zikir.js` | `ZIKR_SEED`, `zikirmatik` motor, zikir sayaç, `zikrTickSound` | ~800–1000 arası |
| 6 | `app/core/saygi.js` | Saygı figür seçimi, Wikipedia fetch, biyografi, okundu işaretleme | ~14.000–16.000 arası |
| 7 | `app/core/quran.js` | Kur’an Yolculuğu taşıma, istek/delivery/response, `quranHasRemoteRequest` | ~15.000–17.000 arası |
| 8 | `app/core/motivation.js` | İçsel Pusula / Terapi Odası: `roomOverlayHTML`, `roomBodyHTML`, görev/tamamlama | ~11.000–12.000 arası |
| 9 | `app/core/crisis.js` | Kriz odaları, `CRISES`, `openCrisis`, craving yönetimi | krizle ilgili bölümler |
| 10 | `app/core/journal.js` | Günlük Işığı, not, terapi notu, duygu kaydı | ilgili bölümler |
| 11 | `app/core/health.js` | Su, uyku, beslenme, kafein, magnezyum, adım, vücut ölçümleri | ~10.000–14.000 arası |
| 12 | `app/core/library.js` | Kitaplık, izleme, dinleme, öğrenme, kurs/pratik | ~6.000–8.500 arası |
| 13 | `app/core/report.js` | Rapor/istatistik/heatmap grafikleri, `raporHTML`, `aylarHTML` | rapor bölümü |
| 14 | `app/core/map.js` | Harita / konum / hava durumu / `haritaHTML` | harita bölümü |
| 15 | `app/core/messaging.js` | ÆON/Luna sohbet, ses/fotoğraf/belge gönderme, balonlar | ~17.000–18.500 arası |
| 16 | `app/core/reminders.js` | Reminder engine wrapper, UI merkezi (engine/scheduler/delivery zaten ayrı) | reminder UI bölümleri |
| 17 | `app/core/profile.js` | Profil değerlendirmesi puanlama ve UI akışı | ilgili bölümler |
| 18 | `app/core/render.js` | `render()`, `bugunHTML`, `saglikHTML`, `saygiHTML`, `mesajHTML`, `haritaHTML`, `raporHTML`, `ayarlarHTML`, `onboardingHTML`, `appHeaderHTML`, `navHTML` | ~9.600 – sona yakın |
| 19 | `app/core/appSurface.js` | `App.*` handler'ları, timer kayıtları, event listener, boot sonu `render()` | dosya sonu |
| 20 | `app/core/syncGlue.js` | `window.SeyOnSyncState`, `window.SeyOnSynced`, `save()` (sync.js ile köprü) | orta/son bölüm |
| 21 | `app/core/helpers.js` | `segTabs`, `progBar`, `starRow`, `miniBars`, `statTile`, `collapsibleCardHTML`, `toast`, `confetti` | ~6.000 civarı |
| 22 | `app/core/settings.js` | Ayarlar render + `migrate()` eklentileri | ayarlar bölümü |
| 23 | `app/core/mediaFx.js` | **Yeni**: haptic, audio, animasyon utilities (FX planının merkezi) | yeni |
| 24 | `app/core/timeTheme.js` | **Yeni**: saat/season bazlı tema class yönetimi | yeni |

### 2.2 Geçiş Sırası

1. **Önce helpers + constants** — en az bağımlılıklı, güvenli kazanım.
2. **Sonra state/dateUtils** — her şey bunlara bağımlı; hata riski yüksek, testle ilerlenecek.
3. **Ardından domain modülleri** — prayer, zikir, saygi, quran, motivation, crisis, journal, health, library.
4. **Render + appSurface** — en son, çünkü tüm modülleri bir araya getirir.
5. **FX modülleri** — modülerleştirme bittikten sonra eklenecek.

### 2.3 Global Bağımlılık Yönetimi

- `var data`, `var ui`, `var dark` gibi global değişkenler `window.SeymaState = { data, ui, dark }` altında merkezileştirilecek.
- Modüller `window.SeymaState.data` okur; yazma işlemleri yine `save()` üzerinden.
- `App.*` handler yüzeyi **değişmeyecek**; sadece fonksiyon tanımlamaları farklı dosyalara taşınacak.

### 2.4 index.html Yükleme Sırası

```html
<script src="app/core/constants.js?v=..."></script>
<script src="app/core/dateUtils.js?v=..."></script>
<script src="app/core/state.js?v=..."></script>
<script src="app/core/helpers.js?v=..."></script>
<script src="app/core/mediaFx.js?v=..."></script>
<script src="app/core/timeTheme.js?v=..."></script>
<!-- domain modülleri -->
<script src="app/core/prayer.js?v=..."></script>
<script src="app/core/zikir.js?v=..."></script>
<script src="app/core/saygi.js?v=..."></script>
<script src="app/core/quran.js?v=..."></script>
<script src="app/core/motivation.js?v=..."></script>
<script src="app/core/crisis.js?v=..."></script>
<script src="app/core/journal.js?v=..."></script>
<script src="app/core/health.js?v=..."></script>
<script src="app/core/library.js?v=..."></script>
<script src="app/core/report.js?v=..."></script>
<script src="app/core/map.js?v=..."></script>
<script src="app/core/messaging.js?v=..."></script>
<script src="app/core/reminders.js?v=..."></script>
<script src="app/core/profile.js?v=..."></script>
<script src="app/core/settings.js?v=..."></script>
<script src="app/core/syncGlue.js?v=..."></script>
<script src="app/core/render.js?v=..."></script>
<script src="app/core/appSurface.js?v=..."></script>
```

### 2.5 Test Güvenlik Ağı

Her modül ayrımından önce şu fixture’lar çalıştırılacak:

- `node tests/app/test_faz10_sync.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/panel/test_faz11_panel.js`
- Yeni eklenecek: `tests/app/test_modularization_boundary.js`

---

## 3. FX Modülleri İçin Arayüz Tasarımı

### 3.1 `app/core/mediaFx.js`

```js
(function(){
"use strict";
var ctx=null;
function ensureCtx(){ if(!ctx) ctx=new (window.AudioContext||window.webkitAudioContext)(); return ctx; }
function enabled(kind){ /* settings + reduced motion + platform */ }
window.SeyAudio={
  tap:function(){ if(!enabled('uiSounds')) return; /* ... */ },
  success:function(){ if(!enabled('uiSounds')) return; /* ... */ },
  warning:function(){ if(!enabled('uiSounds')) return; /* ... */ },
  bell:function(){ if(!enabled('uiSounds')) return; /* ... */ },
  voice:function(text){ if(!enabled('voiceGuidance')) return; /* speechSynthesis */ }
};
window.SeyHaptics={
  tap:function(){ if(!enabled('richHaptics')) return; navigator.vibrate([15]); },
  success:function(){ if(!enabled('richHaptics')) return; navigator.vibrate([20,30,50]); },
  error:function(){ if(!enabled('richHaptics')) return; navigator.vibrate([40,20,40]); },
  refresh:function(){ if(!enabled('richHaptics')) return; navigator.vibrate([10,20,10,20,10]); },
  streak:function(){ if(!enabled('richHaptics')) return; navigator.vibrate([30,50,80]); },
  water:function(){ if(!enabled('richHaptics')) return; navigator.vibrate([10,15,10]); }
};
})();
```

### 3.2 `app/core/timeTheme.js`

```js
(function(){
"use strict";
function timeClass(){ /* 05-09 dawn, 09-17 day, 17-21 dusk, 21-05 night */ }
function seasonalClass(){ /* Ramazan / ilkbahar / sonbahar / yılbaşı */ }
window.SeyTimeTheme={ apply:function(){ /* #root class ekle */ }, classForHour:timeClass };
})();
```

---

## 4. Riskler

| Risk | Etki | Önlem |
|------|------|-------|
| Inline `onclick` handler'ları modül taşımasından etkilenir | Yüksek | `App.*` yüzeyi `appSurface.js` veya eski yerinde kalır; modüller sadece implementasyon sağlar. |
| Global değişken sıralaması bozulur | Yüksek | `window.SeymaState` merkezileştirme; modüller document-ready sırasına göre yüklenir. |
| `node --check` geçer ama çalışma zamanı hatası | Orta | Her modül sonrası `driver.mjs` çalıştırılır. |
| `run-seyma` VM harness'i modülleri doğru yüklemez | Orta | Harness’te multi-file yükleme desteği eklenecek. |
| Çok fazla HTTP isteği (modül başına) | Düşük | Cache-bust query string aynı kalır; PWA service worker cache kullanır. |

---

## 5. Başlangıç Önerisi

FX’ten önce **davranış-koruyucu** bir refactor:

1. `constants.js` + `dateUtils.js` + `state.js` çıkar.
2. `helpers.js` + `mediaFx.js` + `timeTheme.js` oluştur.
3. `zikir.js` ve `motivation.js` gibi zaten yorumlarla sınırlanmış modülleri ayır.
4. `render.js` + `appSurface.js` en son.

Sadece bu aşama tamamlandıktan sonra Faz 0–6 FX planına geçilir.
