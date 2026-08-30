# Şeyma Premium FX Planı — app.js Modülerleştirme Stratejisi

**Sürüm:** 2.1
**Tarih:** 2026-08-30
**Hedef:** ~18.805 satırlık `app.js` monolitini, FX katmanının güvenli şekilde büyüyebileceği bir modül ailesine dönüştürmek. **Kod değiştirilmeden** planlanmıştır.

> **Güncelleme:** v2.1'de `app.js`’in tüm user-facing bölümleri okundu ve gerçek satır aralıkları belirlendi. Mevcut `app/core/constants.js` ile `app/core/*reminder*` ve `app/content/*` modülleri korunacak.

---

## 1. Neden Şimdi?

- `app.js` 18.805 satır, 1.893 fonksiyon (güncel okuma doğrulandı, dosya ~18810'da biter).
- Yeni ses/hareket/animasyon kodunu doğrudan içine eklemek, dosyayı 20.000+ satıra iter ve test/yönetim maliyetini katlar.
- Mevcut mimari zaten **IIFE + global modül desenini** kullanıyor (`window.MotivationProgramV2`, `window.SeymaConstants`, `window.SeySync`). Bu deseni `app.js` içi için de kullanmak doğal.
- Modülerleştirme, FX planının **uygulanabilirlik ön koşuludur**.

---

## 2. Aşama -1 (FX’ten Önce): `app.js` Bölme

Tüm hareketler davranışı koruyarak, yalnızca fiziksel konumu değiştirir.

### 2.1 Hedef Modül Listesi

| # | Dosya | İçeriği | Mevcut `app.js` satır aralığı | Bağımlı olduğu modüller |
|---|-------|---------|-------------------------------|------------------------|
| 1 | `app/core/constants.js` | `SEYMA_CONSTANTS`, `KEY`, `TKEY`, feature gate, `icon()`, `HABITS`, `SOUL_ACTIVITY_CATALOG`, temel yardımcılar | ~1–400 | — (zaten var) |
| 2 | `app/core/dateUtils.js` | `fmt`, `todayStr`, `addDays`, `diffDays`, `pad`, `shortDate`, `dayIndexFor`, `activeDate`, `curDay`, `dateLabelTR`, hafta/ay hesapları | ~4720–4750, ~6188 | constants |
| 3 | `app/core/state.js` | `data`, `ui`, `dark`, `migrate()`, `createDefaultData()`, `getDay`, `emptyDay`, `save()` çağrısı olmadan state helpers | ~4415 (migrate), ~4922 (getDay/emptyDay), ~6229 (save) | constants, dateUtils |
| 4 | `app/core/helpers.js` | `segTabs`, `progBar`, `starRow`, `miniBars`, `statTile`, `collapsibleCardHTML`, `toast`, `confetti`, `haptic` | ~4000–5300, ~6000–6400 | constants, state |
| 5 | `app/core/mediaFx.js` | **Yeni**: `SeyAudio`, `SeyHaptics`, animasyon utilities (FX planının merkezi) | yeni | constants, state |
| 6 | `app/core/timeTheme.js` | **Yeni**: saat/season bazlı tema class yönetimi | yeni | constants, state |
| 7 | `app/core/prayer.js` | `PRAYER_NAMES`, `PRAYER_CITIES`, `emptyPrayerEntry`, `fetchAladhanTimes`, vakit cache/ensure helpers | ~90–200 civarı, ~800–1000 | constants, state, dateUtils |
| 8 | `app/core/zikir.js` | `ZIKR_SEED`, zikirmatik motor, `zikrTickSound`, `zikrCounterViewHTML`, presets/hatims/history/settings views | ~8500–9500, ~14374–15700 | constants, state, helpers |
| 9 | `app/core/saygi.js` | Saygı figür seçimi, `saygiHTML`, kıble, hicri, kandil, `wireSaygiReadGate`, okundu işaretleme | ~15869–16140 | constants, state, helpers, prayer, library (reading) |
| 10 | `app/core/quran.js` | Kur’an Yolculuğu taşıma, `quranRandomVerseStart`, request/delivery/response state machine, `App.openQuranJourney` | ~14902–15790 | constants, state, helpers |
| 11 | `app/core/motivation.js` | İçsel Pusula / Terapi Odası: `roomOverlayHTML`, `roomBodyHTML`, `App.completeMotivationTask`, görev/tamamlama | ~11062–11853 | constants, state, helpers |
| 12 | `app/core/crisis.js` | Kriz odaları, `CRISES`, `App.openCrisis`, `crisisModalHTML`, craving yönetimi | ~9099, ~12560 | constants, state, helpers |
| 13 | `app/core/journal.js` | Günlük Işığı, `journalLightCardHTML`, `journalModalHTML`, `App.saveJournal`, terapi notu | ~12418–12560 | constants, state, helpers |
| 14 | `app/core/health.js` | Su (`waterCard`), uyku, beslenme, kafein (`caffeineBlock`), magnezyum, adım, vücut ölçümleri, `saglikHTML` + health card builders | ~10292–10478, ~13357–13886, ~13886–14400 | constants, state, helpers, dateUtils |
| 15 | `app/core/library.js` | Kitaplık, izleme, dinleme, öğrenme, soul pratikleri: reading/watching/listening/learning/soul overlay hub'ları | ~8328–8445, ~8919–8964, ~16204–16781 | constants, state, helpers |
| 16 | `app/core/report.js` | Rapor/istatistik/heatmap grafikleri, `raporHTML`, report helpers (`lastNDays`, `moodDist`, `moodHeatmapCard`, vb.) | ~11800–12180, ~13153–13221 | constants, state, helpers, dateUtils |
| 17 | `app/core/map.js` | Harita, konum, hava durumu: `haritaHTML`, `locationCardHTML`, `weatherHeaderHTML` | ~10532, ~10809, ~12705 | constants, state, helpers |
| 18 | `app/core/profile.js` | Profil değerlendirmesi, `psychHTML`, `profileGateHTML`, puanlama ve UI akışı | ~10064 civarı | constants, state, helpers, content/profileAssessmentV1 |
| 19 | `app/core/settings.js` | Ayarlar render (`ayarlarHTML`) + `migrate()` eklentileri | ~13221–13886 | constants, state, helpers |
| 20 | `app/core/reminders.js` | Reminder UI merkezi (engine/scheduler/delivery zaten `app/core/reminder*.js` içinde) | dağılmış, toplanacak | constants, state, helpers |
| 21 | `app/core/syncGlue.js` | `window.SeyOnSyncState`, `window.SeyOnSynced`, `save()` (sync.js ile köprü) | ~6208 (SeyOnSynced), ~6229 (save) | state |
| 22 | `app/core/messaging.js` | ÆON/Luna sohbet, ses/fotoğraf/belge, balonlar, `mesajHTML` | ~18567 son civarı | constants, state, helpers |
| 23 | `app/core/render.js` | `render()` ve tab builder'lar: `onboardingHTML`, `bugunHTML`, `saglikHTML`, `saygiHTML`, `raporHTML`, `ayarlarHTML`, `haritaHTML`, `mesajHTML`, `appHeaderHTML`, `navHTML`, overlay shell'ler, `modalsHTML` | ~9688–18810 | hepsi (en son) |
| 24 | `app/core/appSurface.js` | `App.*` handler'ları, timer kayıtları, event listener, boot sonu `render()` | ~8000–18810 arası dağınık | hepsi (en son) |

### 2.2 Geçiş Sırası (Küçük Adımlar)

Her adımda **bir modül** taşınır ve hemen ardından tüm güvenlik ağı çalıştırılır. Büyük PR’lar yok.

1. **Önce helpers + constants** — en az bağımlılıklı, güvenli kazanım. `constants.js` zaten var; `dateUtils.js` ve `helpers.js` ilk ayrılacak.
2. **state.js** — `migrate()`, `getDay`, `save()` helper’ları. Her şey buna bağımlı; hata riski yüksek, testle ilerlenecek.
3. **Yeni FX modülleri (mediaFx.js + timeTheme.js)** — henüz bağlanmadan önce varlıklarını ve API’lerini test et.
4. **Domain modülleri** — prayer, zikir, quran, motivation, crisis, journal, health, library, report, map, messaging, reminders, profile, settings.
5. **syncGlue.js** — `save()` ve `SeyOnSynced` köprüsü son domain modüllerden sonra taşınır.
6. **render.js** — tüm HTML builder’ları (tab + overlay + modals). En büyük parça; tek seferde veya 2–3 alt parçada taşınabilir.
7. **appSurface.js** — `App.*` handler’ları, event listener, boot sonu `render()`. En son, çünkü diğer tüm modülleri bir araya getirir.

### 2.3 Global Bağımlılık Yönetimi

- `var data`, `var ui`, `var dark` gibi global değişkenler, geçiş aşamasında önce mevcut isimlerle kalır; sadece fonksiyon tanımlamaları farklı dosyalara taşınır.
- Faz -1’in sonunda `window.SeymaState = { data, ui, dark }` merkezileştirmesi yapılabilir. Bu, modüllerin `window.SeymaState.data` okumasını sağlar.
- Yazma işlemleri yine `save()` üzerinden; `save()` `syncGlue.js` içinde kalır.
- `App.*` handler yüzeyi **değişmeyecek**; inline `onclick="App.xxx(...)"` referansları bozulmayacak.

### 2.4 index.html Yükleme Sırası

> `app/core/constants.js` zaten `index.html`’de mevcut. Mevcut `app/core/reminder*.js` ve `app/content/*.js` yükleme sıraları **değişmez**. Yeni modüller `constants.js` ile `app.js` arasına, domain sırasına göre eklenir.

```html
<!-- Mevcut (değişmez) -->
<script src="app/core/constants.js?v=..."></script>
<!-- Yeni modüller (Faz -1) -->
<script src="app/core/dateUtils.js?v=..."></script>
<script src="app/core/state.js?v=..."></script>
<script src="app/core/helpers.js?v=..."></script>
<script src="app/core/mediaFx.js?v=..."></script>
<script src="app/core/timeTheme.js?v=..."></script>
<script src="app/core/prayer.js?v=..."></script>
<script src="app/core/zikir.js?v=..."></script>
<script src="app/core/quran.js?v=..."></script>
<script src="app/core/saygi.js?v=..."></script>
<script src="app/core/motivation.js?v=..."></script>
<script src="app/core/crisis.js?v=..."></script>
<script src="app/core/journal.js?v=..."></script>
<script src="app/core/health.js?v=..."></script>
<script src="app/core/library.js?v=..."></script>
<script src="app/core/report.js?v=..."></script>
<script src="app/core/map.js?v=..."></script>
<script src="app/core/profile.js?v=..."></script>
<script src="app/core/reminders.js?v=..."></script>
<script src="app/core/settings.js?v=..."></script>
<script src="app/core/syncGlue.js?v=..."></script>
<script src="app/core/messaging.js?v=..."></script>
<script src="app/core/render.js?v=..."></script>
<script src="app/core/appSurface.js?v=..."></script>
<!-- Mevcut app.js kaldırılacak -->
<script src="app.js?v=..."></script>
```

### 2.5 Test Güvenlik Ağı

Her modül ayrımından önce ve sonra şu fixture’lar çalıştırılacak:

```bash
node --check app.js  # ve yeni dosya için node --check
node tests/app/test_faz10_sync.js
node tests/app/test_modularization_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/panel/test_faz11_panel.js
node tests/app/test_premium_audio_fx.js
node tests/app/test_premium_haptics_fx.js
node tests/app/test_premium_reduced_motion.js
node tests/app/test_premium_launch_splash.js
node tests/app/test_premium_time_theme.js
```

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
| `render.js` + `appSurface.js` bölünürken inline `onclick` handler'larındaki `App.*` referansları bozulabilir | Yüksek | `appSurface.js` önce oluşturulur ve tüm `App.*` tanımlamaları orada kalır; `render.js` sadece HTML string builder’ları taşır. `App.*` yüzeyi asla değişmez. |
| `run-seyma` VM harness'i multi-file yükleme sırasını takip edemez | Orta | Harness’te `app/core/*.js` dosyalarını sırayla `eval` eden yükleme döngüsü eklenecek; önce constants, sonra state/helpers, sonra domain modülleri, en son render/appSurface. |

---

## 5. Başlangıç Önerisi

FX’ten önce **davranış-koruyucu** bir refactor:

1. `dateUtils.js` + `helpers.js` çıkar (en az bağımlılıklı).
2. `state.js` çıkar (`migrate`, `getDay`, `save` helpers).
3. `mediaFx.js` + `timeTheme.js` oluştur (henüz bağlanmadan test et).
4. `zikir.js` ve `motivation.js` gibi zaten sınırlanmış alt sistemleri ayır.
5. `render.js` + `appSurface.js` en son.

Sadece bu aşama tamamlandıktan sonra Faz 0–6 FX planına geçilir.

---

## 6. Faz -1 Çıktı Listesi

### 6.1 Modül Kartları

| # | Modül | Taşınan `app.js` satır aralığı | Bağımlı olduğu modüller | Öncelik |
|---|-------|-------------------------------|------------------------|---------|
| 1 | `app/core/constants.js` | zaten var | — | Yüksek |
| 2 | `app/core/dateUtils.js` | ~4720–4750, ~6188 | constants | Yüksek |
| 3 | `app/core/state.js` | ~4415 (migrate), ~4922 (getDay), ~6229 (save) | constants, dateUtils | Yüksek |
| 4 | `app/core/helpers.js` | ~4000–5300, ~6000–6400 | constants, state | Yüksek |
| 5 | `app/core/mediaFx.js` | yeni | constants, state | Yüksek |
| 6 | `app/core/timeTheme.js` | yeni | constants, state | Orta |
| 7 | `app/core/prayer.js` | ~90–200, ~800–1000 | constants, state, dateUtils | Orta |
| 8 | `app/core/zikir.js` | ~8500–9500, ~14374–15700 | constants, state, helpers | Yüksek |
| 9 | `app/core/quran.js` | ~14902–15790 | constants, state, helpers | Orta |
| 10 | `app/core/motivation.js` | ~11062–11853 | constants, state, helpers | Orta |
| 11 | `app/core/crisis.js` | ~9099, ~12560 | constants, state, helpers | Orta |
| 12 | `app/core/journal.js` | ~12418–12560 | constants, state, helpers | Orta |
| 13 | `app/core/health.js` | ~10292–10478, ~13357–14400 | constants, state, helpers, dateUtils | Yüksek |
| 14 | `app/core/library.js` | ~8328–8445, ~8919–8964, ~16204–16781 | constants, state, helpers | Orta |
| 15 | `app/core/report.js` | ~11800–12180, ~13153–13221 | constants, state, helpers, dateUtils | Orta |
| 16 | `app/core/map.js` | ~10532, ~10809, ~12705 | constants, state, helpers | Düşük |
| 17 | `app/core/profile.js` | ~10064 civarı | constants, state, helpers, content/profileAssessmentV1 | Orta |
| 18 | `app/core/settings.js` | ~13221–13886 | constants, state, helpers | Yüksek |
| 19 | `app/core/reminders.js` | dağılmış, toplanacak | constants, state, helpers | Orta |
| 20 | `app/core/syncGlue.js` | ~6208, ~6229 | state | Yüksek |
| 21 | `app/core/messaging.js` | ~18567 son civarı | constants, state, helpers | Orta |
| 22 | `app/core/render.js` | ~9688–18810 | hepsi | Yüksek |
| 23 | `app/core/appSurface.js` | ~8000–18810 arası dağınık | hepsi | Yüksek |
| 24 | `app/core/timeTheme.js` | yeni | constants, state | Orta |

### 6.2 Geçiş Kriterleri

Her modül ayrımı sonrası şu komutlar PASS olmalı:

- `node --check app.js` ve yeni modül dosyası için `node --check app/core/<modül>.js`
- `node tests/app/test_faz10_sync.js`
- `node tests/app/test_modularization_boundary.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/panel/test_faz11_panel.js`
- Tüm 5 premium FX fixture'ı:
  - `node tests/app/test_premium_audio_fx.js`
  - `node tests/app/test_premium_haptics_fx.js`
  - `node tests/app/test_premium_reduced_motion.js`
  - `node tests/app/test_premium_launch_splash.js`
  - `node tests/app/test_premium_time_theme.js`

### 6.3 Önerilen İlk PR ("Faz -1.1")

Sadece:
- `app/core/dateUtils.js` oluştur
- `app/core/helpers.js` oluştur
- `app/core/mediaFx.js` oluştur (henüz bağlanmadan)
- `app/core/timeTheme.js` oluştur (henüz bağlanmadan)
- `index.html` yüklemelerini güncelle
- `tests/app/test_modularization_boundary.js` ekle
- Tüm testleri çalıştır

Bu PR'de `app.js` hâlâ tek parça kalır; yalnızca modüller var olur ve test edilir. FX bağlantıları sonraki PR'larda yapılır.
