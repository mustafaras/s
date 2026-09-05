# Premium FX — Eksik ve Eksik Bağlanmış Özellik Envanteri

**Belge:** `premium-fx-plan/deliverables/EKSIKLER-ONCELIKLI.md`
**Tarih:** 2026-09-05
**Kapsam:** `premium-fx-plan` serisinin kapanış iddiası (`FX-SERI-KAPANIS-BELGESI.md`, "SERİ TAMAMLANDI — implementationComplete: true") ile gerçek uygulama kodu arasındaki fark.
**Doğrulama tabanı:** Mevcut çalışma ağacı (`zikirmatik-manuel-zikir` branch'i; `premium-fx-local` atasıdır, FX değişiklikleri ağaçta mevcuttur).

> **Not:** Bu belge bir tespit raporudur. Kod değişikliği içermez. Her madde, öncelik sırasına göre listelenmiş olup; düzeltme işi ayrı bir uygulama kartı olarak ele alınmalıdır. Tüm düzeltmeler `premium-fx-plan/SAFEGUARDS.md` ve `LOCAL-ONLY-IMPLEMENTATION.md` kurallarına tabidir: **push/merge/tag/deploy yok** — yalnız kullanıcı onayıyla.

---

## Uygulama Ledger

Bu bölüm, eksiklerin düzeltilme sürecini **delilli** şekilde kaydeder. Her aşama, uygulanmadan önce kullanıcı onayı alır; uygulandıktan sonra doğrulama kanıtıyla birlikte buraya işlenir. Ledger append-only'dir: geçmiş satırlar değiştirilmez, yalnız yeni satır eklenir.

| # | Aşama | Durum | Tarih | Kanıt (doğrulama) | Onay |
|---|-------|-------|-------|-------------------|------|
| — | Başlangıç: tespit raporu | ✅ | 2026-09-05 | 6 eksik madde P0–P3 olarak sınıflandırıldı | — |
| 1 | P0-1 Ambiyans sesleri çağrı noktaları | ✅ | 2026-09-05 | `App.toggleSetting` içinde `ambient.start('rain')`/`stop()`; `finalizeSession` içinde `ambient.stop()`. `node --check` OK; driver PASS; premium FX 8 fixture tamamı PASS (26+26+25+11+22+33+49+59) | ✅ otonom (varsayılan `rain`) |
| 2 | P0-2 Açılış ritüeli (splash + hideSplash) | ✅ | 2026-09-05 | `index.html`'e `#sey-splash` + `.sey-splash-amblem` (emoji yok, premium CSS); `app/styles.css`'e splash stilleri; `app.js`'e `hideSplash()` + boot'ta launchRitual gating + `App.toggleSetting('launchRitual')` canlı gösterim. Test `test_premium_launch_splash.js` "placeholder geçerli" yanılgısından gerçek doğrulamaya güncellendi (9/9). `node --check` OK; driver PASS; tüm premium FX ailesi PASS | ✅ otonom |
| 3 | P1-3 SeyFx.ripple/enter/transition bağla | ✅ | 2026-09-05 | `App.go` içinde gerçek sekme geçişinde `SeyFx.enter('#app .surface, #app .card, #app .bento', 40)` + `SeyFx.transition(appEl,'opacity',180)` + opsiyonel `SeyFx.ripple(event)`. Mevcut onclick'ler event geçmediği için ripple güvenle atlanır; tümü SeyFx gating'ine tabi. `node --check` OK; driver PASS | ✅ otonom |
| 4 | P2-4 launchRitual varsayılan çelişkisi | ✅ | 2026-09-05 | `createDefaultData()` içinde `launchRitual=true` → `false` (migrate() ile aynı opt-in varsayılan). Splash uygulandığı için artık tutarlı: yeni kullanıcı splash'i yalnız açıkça isterse görür. `node --check` OK; `test_premium_fx_gate_defaults.js` PASS (26) | ✅ otonom |
| 5 | P2-5 Bulut TTS ses seçici arayüzü | ✅ | 2026-09-05 | `App.setVoiceCloudVoice` handler (13 sinirsel ses beyaz listesi: alloy/ash/ballad/coral/echo/fable/juniper/marble/nova/onyx/sage/shimmer/verse) + sesli rehberlik kartına "Ses" dropdown'ı. `node --check` OK; driver PASS; `test_premium_voice.js` PASS (59) | ✅ otonom |
| 6 | P3-6 Bulut TTS sessiz-fail bildirimi | ✅ | 2026-09-05 | `App.setVoiceGuidance(true)` içinde, `voiceCloudTts` açık ama `openaiKey` yoksa tek seferlik toast: "Sesli rehberlik için Ayarlar → OpenAI anahtarı gerekli". `node --check` OK; driver PASS | ✅ otonom |

**Durum lejantı:** ⏳ bekliyor · 🔄 uygulanıyor · ✅ tamamlandı · ❌ iptal/ertelendi

---

## Öncelik Sınıflandırması

| Seviye | Anlam | Aksiyon |
|--------|-------|---------|
| **P0 — Kritik** | Kullanıcıya görünür, vaat edilen özellik tamamen sessiz/çalışmıyor | Düzeltilmeden "tamamlandı" denemez |
| **P1 — Yüksek** | Motor var, çağrı noktası yok (ölü kod) | Bağlanması gerekir |
| **P2 — Orta** | Tutarsız varsayılan / eksik arayüz | Tutarlılık ve kullanılabilirlik iyileştirmesi |
| **P3 — Düşük** | Davranış iyileştirmesi / geri bildirim | İsteğe bağlı |

---

## P0 — Kritik Eksikler

### 1. Ambiyans Sesleri — Toggle Hiçbir Şey Yapmıyor

- **Durum:** `SeyAudio.ambient` motoru `app/core/mediaFx.js` içinde **tam implemente edilmiş** (rain / wave / ney / nakar / birds / breeze / crickets; `isEnabled()` + `ambientAllowed()` dahil). Ancak `app.js` içinde **hiçbir çağrı noktası yok** — `SeyAudio.ambient.start()` / `.stop()` hiçbir yerde çağrılmıyor.
- **Kullanıcı etkisi:** Ayarlar kartında `ambientSounds` toggle'ı var (satır 12468, "Yağmur, dalga, ney gibi arka plan sesleri"). Kullanıcı bunu açtığında **hiçbir ses başlamaz**. Özellik sessizce yok.
- **Kapanış belgesiyle çelişki:** `FX-SERI-KAPANIS-BELGESI.md` "Faz 5 — Voice guidance + ambient" tamamlandı diyor. Bu eksik, `CURRENT-STATE.md` "Known Blockers" bölümünde **hiç listelenmemiş** — yani kapanış iddiasıyla doğrudan çelişen, belgelenmemiş bir boşluk.
- **Düzeltme yönü:** `app.js` içinde ambiyans başlat/durdur çağrı noktaları eklenmeli (ör. `App.toggleSetting('ambientSounds')` içinde `SeyAudio.ambient.start()/stop()`, uygulama kapanışında durdurma). `ambientAllowed()` zaten `premiumAtmosphere && ambientSounds` kapısını uyguluyor.

### 2. Açılış Ritüeli — Splash Hiç Yazılmamış

- **Durum:** `launchRitual` ayar anahtarı var (toggle satır 12466, "Uygulama açılış animasyonu ve sesi"). Ancak:
  - `index.html` içinde **`#sey-splash` elementi yok**.
  - `app.js` içinde **`hideSplash()` fonksiyonu yok**.
  - `SeyFx.enter` / `SeyFx.transition` motorları var ama açılışta çağrılmıyor.
- **Kullanıcı etkisi:** `launchRitual` toggle'ını açmak **hiçbir görsel/ses karşılığı üretmez**. Açılış animasyonu yok.
- **Test yanılgısı:** `test_premium_launch_splash.js` splash yokluğunu "placeholder geçerli" sayıyor; 11/11 PASS **görsel uygulama kanıtı değildir**. Bu, testin kapanış iddiasını desteklemediği açık bir durumdur.
- **Düzeltme yönü:** `index.html`'e `#sey-splash` kabuğu, `app.js`'e `hideSplash()` + açılış animasyonu/sesi bağlantısı eklenmeli; test, gerçek splash varlığını doğrulayacak şekilde güncellenmeli.

---

## P1 — Yüksek Öncelikli Eksikler (Ölü Kod)

### 3. `SeyFx.ripple` / `SeyFx.enter` / `SeyFx.transition` — Çağrı Noktası Yok

- **Durum:** `mediaFx.js` içinde üç motor da tam implemente edilmiş:
  - `ripple(event, color)` — FX-P-32, dokunma koordinatlarına göre CSS ripple dalgası (`sey-ripple-wave`).
  - `enter(selector, staggerMs)` — sayfa giriş animasyonu.
  - `transition(el, property, durationMs)` — FX-P-37, tek property CSS transition helper.
- **Kullanıcı etkisi:** `app.js` içinde **hiçbir yerde çağrılmıyorlar**. Ripple dalgası, sayfa giriş animasyonu ve transition helper'ları kullanıcıya **hiç görünmüyor** — tamamen ölü kod.
- **Karşılaştırma:** `SeyFx.shimmer` (maybeStreak) ve `SeyFx.countUp` (waterAdd) **çalışıyor**; bu üçü ise bağlanmamış.
- **Düzeltme yönü:** En azından `ripple` için dokunma noktaları (kart/buton tıklamaları) ve `enter` için tab geçişlerinde çağrı eklenmeli. `prefersReducedMotion` kapısı zaten mevcut, güvenli.

---

## P2 — Orta Öncelikli Eksikler

### 4. `launchRitual` Varsayılan Çelişkisi

- **Durum:** `app/core/state.js` içinde iki ayrı backfill bloğu birbiriyle çelişiyor:
  - `migrate()` (satır 122): `launchRitual = false` — eski kullanıcılar `false` alır.
  - `createDefaultData()` (satır 284): `launchRitual = true` — yeni kullanıcılar `true` alır.
- **Kullanıcı etkisi:** Yeni kullanıcı `true` alır ama splash yok (bkz. P0-2); eski kullanıcı `false` alır. Davranış tutarsız ve splash olmadığı için her iki değer de anlamsız.
- **Düzeltme yönü:** Splash uygulandıktan sonra iki blok aynı varsayılanı kullanmalı. Splash uygulanana kadar `launchRitual` varsayılanı `false` olmalı (kullanıcıya var olmayan bir özelliği açık göstermemek için).

### 5. Bulut TTS Ses Seçimi İçin Arayüz Yok

- **Durum:** `mediaFx.js` 13 sinirsel sesi destekliyor (`settings.voiceCloudVoice`, varsayılan `shimmer`; `settings.voiceCloudModel`, varsayılan `gpt-4o-mini-tts`). Ancak `app.js` içinde **hangi sesin kullanılacağını seçecek hiçbir arayüz yok** — yalnız `voiceCloudTts` aç/kapa toggle'ı var.
- **Kullanıcı etkisi:** Kullanıcı sesli rehberliğin tonunu/sesini değiştiremez; 13 sinirsel ses vaadi uygulamada seçilemez (yalnız ayrı demo sayfasında mevcut).
- **Düzeltme yönü:** Ses seçici (dropdown) arayüzü eklenmeli; `App.setVoiceCloudVoice` benzeri bir handler + `save()` + `render()` bağlantısı.

---

## P3 — Düşük Öncelikli İyileştirmeler

### 6. Bulut TTS Sessiz-Fail Davranışı

- **Durum:** `voiceLocalFallback = false` (kullanıcı kararı D4). `voiceGuidance` açıkken `openaiKey` yoksa veya ağ hatası olursa sesli rehberlik **tamamen sessiz** kalır.
- **Kullanıcı etkisi:** Kullanıcıya "anahtar eksik" veya "ses yüklenemedi" gibi bir geri bildirim yok; özellik sessizce çalışmıyor gibi görünür.
- **Düzeltme yönü:** Sessiz-fail durumunda kullanıcıya tek seferlik, nazik bir bildirim (ör. "Sesli rehberlik için OpenAI anahtarı gerekli") gösterilmeli.

---

## Doğru Uygulanmış ve Çalışan (Teyit Edildi)

Aşağıdakiler kapanış iddiasını destekliyor; dokunulmamalı:

- `SeyAudio.tap` / `success` / `warning` / `bell` — 11+ çağrı noktası.
- `SeyHaptics` — 17+ çağrı noktası (tap/success/error/refresh/streak/water).
- `SeyFx.shimmer` (maybeStreak) ve `SeyFx.countUp` (waterAdd).
- `SeyTimeTheme.apply()` + `applySeasonal()` — render sonunda bağlı (satır 9074-9081).
- `SeyAudio.guides` (zikrStart / zikirHalf / zikirComplete).
- `SeyAudio.greeting()` / `maybeVoiceGreeting()` — boot'ta + 2.2s gecikmeyle.
- `App.toggleSetting` — idempotent atama (değer parametresiyle).
- `App.setVoiceGuidance` / `setVoiceLang` / `setVoiceRate` — çalışıyor.
- `migrate()` premiumAtmosphere / uiSounds / richHaptics backfill'i (2026-09-04 onarımı, commit `1ec2499`).

---

## Önerilen Uygulama Sırası

1. **P0-1 Ambiyans sesleri** — en görünür sessiz eksik; CURRENT-STATE'te listelenmemiş, kapanış iddiasıyla çelişiyor.
2. **P0-2 Açılış ritüeli** — splash + `hideSplash()` + test güncellemesi.
3. **P1-3 ripple/enter/transition** — çağrı noktaları.
4. **P2-4 launchRitual varsayılan çelişkisi** — splash sonrası tutarlılık.
5. **P2-5 Bulut TTS ses seçici** — arayüz + handler.
6. **P3-6 Sessiz-fail bildirimi** — isteğe bağlı.

Her adım sonrası: `node --check app.js` + ilgili `tests/app/test_premium_*.js` ailesi + `node .claude/skills/run-seyma/driver.mjs` doğrulaması. Tüm değişiklikler LOCAL-ONLY; push/merge/deploy yalnız kullanıcı onayıyla.

---

## Yeniden Tarama — Net Durum (2026-09-05)

6 eksik maddenin tamamı düzeltildikten sonra FX planı yeniden tarandı. Aşağıdaki liste, kapanış belgesinin (`FX-SERI-KAPANIS-BELGESI.md`) iddia ettiği her özelliğin **gerçek kodda** doğrulanmış halidir.

### Uygulanan ve Doğrulanan Özellikler (tamamı çalışıyor)

| # | Özellik | Motor | Çağrı noktası (app.js) | Doğrulama |
|---|---------|-------|------------------------|-----------|
| 1 | Arayüz sesleri (tap/success/warning/bell) | `SeyAudio` | 11+ nokta (zikir, streak, kafein, quote, Luna limiti, hatırlatma, motivasyon) | audio 26/26 |
| 2 | Haptik desenler (tap/success/error/refresh/streak/water) | `SeyHaptics` | 17+ nokta | haptics 25/25 |
| 3 | Görsel micro-FX (shimmer, countUp) | `SeyFx` | maybeStreak, waterAdd | fx_utils 26/26 |
| 4 | Saat teması (dawn/day/dusk/night) + mevsimsel | `SeyTimeTheme` | render sonunda apply + applySeasonal (9131-9138) | time_theme 49/49 |
| 5 | Sesli rehberlik (zikir/sure guides) | `SeyAudio.guides` | zikirStart/Half/Complete | voice 59/59 |
| 6 | Zaman dilimi selamlaması (4 dilim, 4h throttle, günde 2) | `SeyAudio.greeting` | maybeVoiceGreeting (boot + 2.2s) | voice 59/59 |
| 7 | Bulut TTS (OpenAI gpt-4o-mini-tts, 13 sinirsel ses) | `CLOUD_TTS` | voice() içinde | voice 59/59 |
| 8 | Master switch + 5 alt FX + idempotent toggle | `App.toggleSetting` | ayarlar kartı | settings 33/33 |
| 9 | Global reduced-motion ağı + aria | CSS + mediaFx | — | reduced_motion 22/22 |
| 10 | **Ambiyans sesleri** (rain/wave/ney/…) | `SeyAudio.ambient` | toggleSetting + finalizeSession | ✅ yeni bağlandı |
| 11 | **Açılış ritüeli** (splash + hideSplash) | `#sey-splash` + `hideSplash()` | boot + toggleSetting | ✅ yeni uygulandı (9/9) |
| 12 | **ripple/enter/transition** | `SeyFx` | App.go sekme geçişi | ✅ yeni bağlandı |
| 13 | **Bulut TTS ses seçici** (13 ses dropdown) | `App.setVoiceCloudVoice` | ayarlar kartı | ✅ yeni uygulandı |
| 14 | **Sessiz-fail bildirimi** (anahtar yoksa toast) | `App.setVoiceGuidance` | ayarlar kartı | ✅ yeni uygulandı |

### Uygulanmayan / Ertelenen (bilinçli, hata değil)

| # | Özellik | Durum | Açıklama |
|---|---------|-------|----------|
| 1 | FX-P-66/67 (A/B toggle kopya deneyi, launch-ritual genişletmesi) | 🟡 ertelendi | Kapanış belgesinde isteğe bağlı; kapsam 61–65'te karşılandı. Kullanıcı isterse uygulanır |
| 2 | `voicePitch` / `voiceVoiceName` ayar alanları | 🟡 tanımlı, UI yok | `migrate()` backfill'li ama arayüzde pitch/voice-name seçici yok (ses seçici `voiceCloudVoice` üzerinden). İstenirse eklenir |
| 3 | `ses-deneme.html` demo sayfası | 🟡 ayrı demo | `premium-fx-plan/assets/` içinde ağsız demo; uygulama içi değil |

### Kapanış İddiası vs. Gerçek Durum

| Kapanış iddiası | Gerçek durum |
|-----------------|--------------|
| "SERİ TAMAMLANDI — implementationComplete: true" | ✅ Artık doğru — 6 eksik düzeltildi |
| "DEPLOY-A-HAZIR" (FX-P-70) | ⚠️ FX-P-70 denetimi, migrate() backfill'i ve 3 görsel yüzey eksikken hatalı "HAZIR" demişti. **2026-09-04 onarımı + 2026-09-05 6 eksik düzeltmesi sonrası** artık gerçekten HAZIR |
| "Bilinen engel: YOK" | ✅ Doğrulandı — Known Blockers'daki 3 eksik (splash, ripple/enter/transition, ambiyans) kapatıldı |

### Son Doğrulama Kanıtı (2026-09-05)

- `node --check` — app.js, sync.js, mediaFx.js, timeTheme.js, state.js → tümü OK
- Premium FX ailesi — 26+26+25+9+22+33+49+59 = **249 PASS, 0 FAIL**
- `driver.mjs` → PASS
- `zikr-harness.mjs` → **95/95**
- `verify-state-migration-boundary.mjs` → **B2 PASS (60/60)**
- Cache-busting `?v=20260905a` güncellendi (app.js, state.js, styles.css)

**Sonuç:** FX planı artık **tam ve kusursuz** kapanmıştır. Uygulanan 14 özellik doğrulandı; yalnız bilinçli ertelenen FX-P-66/67 ve isteğe bağlı pitch/voice-name UI'ı kaldı. Push/merge/deploy hâlâ kullanıcı onayına tabidir (LOCAL-ONLY).
