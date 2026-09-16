# MON2 sonrası bulgular (2026-09-15)

MON2 serisi kapandıktan sonra yapılan **yerel görsel QA** sırasında bulunan
gerçek kusurlar. Bunlar MON2 kartlarından değil, daha eski MON kartlarından
(MON-35 / MON-45) kaynaklanır; MON2 bu bulguları **yakaladı**.

---

## BULGU-01 · Harita sekmesi ilk açılışta çöküyordu (DÜZELTİLDİ)

**Şiddet:** HIGH — sekme hiç açılmıyordu.
**Köken:** MON-35 (map registry) + MON-45 (render taşıması) arasındaki sahiplik kayması.
**Bulunma:** Yerel QA, `App.go('harita')` + `ui.calMonth` tanımsız.

### Belirti

```
TypeError: Cannot read properties of undefined (reading 'split')
    at renderHarita (app/core/map.js:240)
    at haritaHTML  (app/core/map.js:318)
    at mapTabHTML  (app.js:861)
    at call        (app/core/render.js:49)
    at mapTabHTML  (app/core/render.js:85)
    at haritaHTML  (app/core/render.js:1767)
    at paint       (app/core/render.js:360)
```

### Kök neden

`ui.calMonth` yalnız üç yerde kuruluyordu: `App.calMove`, `App.calToday`,
`App.heatOpen` — hepsi **kullanıcı etkileşimi**. Uygulamaya doğrudan Takvim
sekmesiyle girildiğinde hiçbiri çalışmaz ve `calMonth` tanımsız kalır.

`app.js:710`'da korumalı bir sarmalayıcı vardı:

```js
function haritaHTML(){
  var today=todayStr();
  if(!ui.calMonth) ui.calMonth=today.slice(0,7);   // ← koruma
  return SEYMA_RENDER.haritaHTML.apply(null,arguments);
}
```

**Ama render zinciri bu sarmalayıcıyı hiç çağırmıyor.** Gerçek yol:

```
render.js:360  → haritaHTML()   [render.js:1767 — render.js'in KENDİ tanımı]
               → mapTabHTML()   [render.js:85]
               → call('mapTabHTML')
               → app.js:861 mapTabHTML
               → SEYMA_MAP.haritaHTML()   ← app.js:710 ATLANIYOR
               → renderHarita()
               → ui.calMonth.split('-')   💥
```

Yani `app.js:710`'daki koruma **ölü kod**; MON-45'te render zinciri render.js'e
taşınırken koruma eski katmanda kaldı.

### Düzeltme

Koruma **asıl sahibi olan** `app/core/map.js` `renderHarita` içine taşındı:

```js
if(!ui.calMonth||typeof ui.calMonth!=='string'||ui.calMonth.indexOf('-')<0) ui.calMonth=today.slice(0,7);
```

`app.js:710`'daki blok **silinmedi** (MON2 kapsamı dışı; `*HTML` builder sayımı
pinli) — yorumla işaretlendi ve bu belgeye bağlandı.

### Doğrulama

| Senaryo | Önce | Sonra |
|---|---|---|
| `SeymaMap.haritaHTML()` + `calMonth` tanımsız | ❌ çöküyor | ✅ 20.204 bayt |
| `App.go('harita')` + `calMonth` tanımsız (canlı) | ❌ hata + sekme açılmıyor | ✅ **0 hata**, "Eylül 2026" takvimi, 30 gün, ay özeti |

Cache-bust: `map.js` → `20260915a`, `app.js` → `20260915c` + 4 app_surface pin'i
+ `test_map_boundary` / `test_journal_boundary` literal pin'leri.

---

## BULGU-02 · `defer(...)` her çağrıda "Illegal invocation" (DÜZELTİLDİ)

**Şiddet:** HIGH — 7 çağrı noktası; 6'sı sessizce yutuluyordu, 1'i çöküyordu.
**Köken:** MON2-06 (zikir/quran/profile yüzey bölümleri) — dep-bag takma adı dönüşümü.
**Bulunma:** Sesli rehberlik canlı testi sırasında zikir tamamlama animasyonunda.

### Belirti

```
TypeError: Illegal invocation
    at App_zikirTap (app/core/zikir.js:1249)
```

Tur tamamlandığında (`doneNow`) spark animasyonunun temizlenmesi çöküyordu.
Diğer 6 `defer(...)` çağrısı `try{...}catch(e){}` içinde olduğu için **sessizce
yutuluyordu** — kullanıcı hatayı görmez, ama işlev kaybolur.

### Kök neden

MON2-06'da `setTimeout` → `defer` takma adı dönüşümü yapıldı ve bag getter'ı
**çıplak referans** döndürdü:

```js
defer:function(){ return setTimeout; }        // ❌
```

Bu, `with(SCOPE)` bloğu içinde **`this` bağlamını kaybettirir**:

| Test | Sonuç |
|---|---|
| `setTimeout(fn, 1)` doğrudan | ✅ çalışır |
| `with ({ defer: setTimeout }) { defer(fn, 1) }` | ❌ **Illegal invocation** |
| `with ({ defer: setTimeout.bind(window) }) { defer(fn, 1) }` | ✅ çalışır |

`window` metotları (setTimeout, clearTimeout, requestAnimationFrame, matchMedia,
getComputedStyle…) çağrılırken `this`'in `window` olmasını şart koşar; `with`
bloğunda çıplak çağrı `this = SCOPE` yapar.

Aynı risk taşıyan başka takma ad **yok**: `doc`/`sync` obje referansı döndürüyor
(`this` gerekmez).

### Düzeltme

4 bag getter'ı `window`'a bağlandı:

```js
defer:function(){ return setTimeout.bind(window); }   // ✅
```

Etkilenen çağrı noktaları (hepsi artık çalışır):

| Dosya | Kullanım |
|---|---|
| `app/core/zikir.js:1233` | sonraki preset toast'u (900ms) |
| `app/core/zikir.js:1249` | spark animasyon temizliği (1200ms) — **çöken** |
| `app/core/quran.js:684` | onay zaman aşımı |
| `app/core/quran.js:781` | uzak kayıt zaman aşımı |
| `app/core/profile.js:1105` | profil kaydı gecikmesi |
| `app/core/profile.js:1323` | psikolojik test tamamlama konfeti (180ms) |
| `app/core/profile.js:1325` | psikolojik test ileri konfeti (180ms) |

### Doğrulama

- `App.zikrTap()` tam tur → **0 hata** (öncesinde Illegal invocation)
- 3 sesli ipucu zinciri uçtan uca çalıştı (aşağıya bak)
- Tam kapı seti: syntax · `--gate` PASS · smoke 21/21 · driver PASS · zikr 95/95 ·
  tests/app 52/52 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders 21/21

---

## Bilinen sınırlar (kusur değil)

| Konu | Durum | Açıklama |
|---|---|---|
| `guides.suraOpen` / `guides.suraBookmark` | Tanımlı, **çağrılmıyor** | Kur'an sûre açma / yer imi akışında sesli ipucu bağlanmamış (FX-P-55 kapsamı). Ölü API. |
| `app.js:710` haritaHTML sarmalayıcısı | Ölü kod | Yukarıda; MON2 sonrası ayrı bir programda temizlenebilir. |
| Konum kapısı | Test ortamında geçilemiyor | Gerçek GPS gerekir — **tasarım gereği doğru** (yerel QA'da state ile aşılır). |
| Auth kilidi | Parola bilinmiyor | Statik hash (`AUTH_HASH`); `migrate()` auth alanlarını sıfırlar — güvenlik tasarımı. |

---

## Yerel QA yöntemi (tekrarlanabilir)

```bash
python3 -m http.server 9000 --bind 127.0.0.1   # DATA SAFETY: yalnız loopback, token yok
# Tarayıcıda: 127.0.0.1:9000 → konum kapısı + auth state ile aşılır (sentetik seed)
pkill -f "http.server 9000"                     # turn bitmeden KAPAT
```

**Guard 1 doğrulandı** (`sync.js:223, 988-992`): localhost'tan push engelli —
token olsa bile veri yazılamaz.

---

## Sesli rehberlik (FX-P-51…57) — nasıl çalışıyor

**Motor:** `app/core/mediaFx.js` → `window.SeyAudio`.

### Gating zinciri (her çağrıda sırayla)

```
voice(text, opts)
  ├─ 1. isPremiumFxEnabled()  → settings.premiumAtmosphere !== false  VE  prefers-reduced-motion kapalı
  ├─ 2. isVoiceEnabled()      → settings.voiceGuidance === true  VE  window.speechSynthesis var
  ├─ 3. isQuietTime()         → saat 23:00–07:00 dışında  (h parametresiyle test edilebilir)
  └─ 4. motor seçimi:
        ├─ CLOUD_TTS.enabled() (settings.voiceCloudTts && settings.openaiKey)
        │     → OpenAI /v1/audio/speech (gpt-4o-mini-tts, ses: settings.voiceCloudVoice)
        │     → hata + settings.voiceLocalFallback → speakLocal() (robotik ama duyulur)
        └─ aksi halde: settings.voiceLocalFallback ? speakLocal() : false (sessiz)
```

`speakLocal` yerel Web Speech API'yi kullanır; ses seçimi önceliği:
`opts.voiceNames` → `settings.voiceVoiceName` → `pickVoice()` (Enhanced/Premium/Neural
etiketli, sonra `localService` tercih edilir). Prosodi varsayılanı: `rate 0.92`,
`pitch 1.05`, `volume 0.7` — hepsi `settings.voiceRate/voicePitch` ile ayarlanır
ve `clamp()` ile sınırlanır.

### İpucu kataloğu (`SeyAudio.guides`)

| Üye | Metin | Tetikleyici |
|---|---|---|
| `zikirStart` | "Başla, kalbin yumuşasın." | oturumun **ilk** tap'i (`sessionStarted`) |
| `zikirHalf` | "Yarısı bitti, nefes al." | tur ortası (`halfNow`), oturum başına 1 |
| `zikirComplete` | "Tamamladın. Allah kabul etsin." | tur sonu (`doneNow`), **gün başına 1** |
| `suraOpen` | "<ad> açıldı. Huşuyla oku." | **çağrılmıyor** |
| `suraBookmark` | "Yer işareti koydun." | **çağrılmıyor** |
| `greeting` | saate göre selamlama (4 varyant) | uygulama açılışı (`maybeVoiceGreeting`) |

Ek çağrı noktaları: streak kilometre taşı ("Harikasın! Serin büyüyor…",
`voiceStreakDate` gün damgası), onboarding karşılaması ("Sevgili Günışığı,
hoş geldin…", `voiceOnboardedAt` bir kez).

### Tekrar önleme (idempotence)

Her ipucu `data.settings` üzerinde bir damga tutar — aynı gün/oturumda tekrar etmez:

| Damga | Kapsam |
|---|---|
| `voiceOnboardedAt` | kurulum karşılaması, ömür boyu 1 |
| `voiceStreakDate` | streak tebriği, gün başına 1 |
| `voiceZikrDate` | zikir tamamlama, gün başına 1 |
| `ui._voiceZikirHalfGiven` | yarı hedef, **oturum** başına 1 (kalıcı değil) |

### Canlı QA sonucu (2026-09-15, sentetik `speechSynthesis` stub)

```
tap 1   → "Başla, kalbin yumuşasın."          ✅
tap 17  → "Yarısı bitti, nefes al."           ✅
tap 33  → "Tamamladın. Allah kabul etsin."    ✅  (voiceZikrDate damgalandı)
tekrar  → (sessiz)                            ✅  gün başına 1 kuralı
konsol  → 0 hata
```

Gating negatif testleri de geçti: `voiceGuidance=false` → sessiz,
`premiumAtmosphere=false` → sessiz, `isQuietTime(23)` → sessiz.

### Bilinen sınır

- `guides.suraOpen` / `guides.suraBookmark` **tanımlı ama hiç çağrılmıyor** —
  Kur'an sûre açma ve yer imi akışlarına sesli ipucu bağlanmamış (FX-P-55 kapsamı).
  Ölü API; kablolama ayrı bir iş.
- Bulut TTS anahtarı (`settings.openaiKey`) yoksa her zaman robotik yerel ses
  kullanılır; anahtar girilirse OpenAI sinirsel sesine geçer.
- Gerçek sesin duyulması **kullanıcı etkileşimi** gerektirir (tarayıcı autoplay
  politikası) — bu tasarım gereği doğru.
