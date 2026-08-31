# Şeyma Premium FX — Uygulama Prompt Kataloğu

**Sürüm:** 1.0
**Tarih:** 2026-08-31
**Amaç:** `premium-fx-plan/` içindeki planı uygulayan her ajanın, soğuk başlangıçtan en yüksek kalitede sonuç üretebilmesi için tasarlanmış, detaylı, tutarlı ve anti-amnesi uyumlu prompt seti.
**Kural:** Uygulama aşamasındaki tüm commitler sadece yerel kalır. Bkz. [`LOCAL-ONLY-IMPLEMENTATION.md`](../LOCAL-ONLY-IMPLEMENTATION.md).

---

## 0. Her Ajan İçin İlk 60 Saniye

Prompt çalıştırmadan önce şunları yap:

```bash
cd /Users/m_ras/Desktop/seyma/premium-fx-plan
cat .anti-amnesia/FX-PROMPT-STATE.json
sed -n '1,80p' .anti-amnesia/CURRENT-STATE.md
sed -n '1,60p' .anti-amnesia/LEDGER.md
git log --oneline -5
```

- `blockedPrompt` doluysa → **dur**. Engel kullanıcı tarafından çözülmeden ilerleme yok.
- `activePrompt` doluysa → o prompt yarım kalmıştır. `git status` ile ağacı incele; ya tamamla ya `git checkout -- .` ile geri al. **Bir sonrakine atlama.**
- Aksi hâlde çalıştırılacak prompt = `lastCompletedPrompt` + 1, veya kullanıcı tarafından seçilmiş FX-P-NN kodu.

---

## 1. Ortak Sözleşme (Tüm Promptlara Miras)

Aşağıdaki adımlar **her promptta geçerlidir**. Her prompt dosyasında ayrıca yazılır; çakışma olursa bu katalog hakimdir.

### S1 · Ön Koşul

- Çalışma dizini `/Users/m_ras/Desktop/seyma` olmalı.
- Branch `premium-fx-local` olmalı. Değilse `git checkout premium-fx-local` (yoksa `git checkout -b premium-fx-local`).
- `FX-PROMPT-STATE.json`‘daki `lastCompletedPrompt`, bu promptun bir öncekine eşit olmalı (sıralı promptlar için).

### S2 · Değişmezler (İhlali Commit’i İptal Ettirir)

| | Kural | Kanıt |
| --- | --- | --- |
| I1 | `data` nesnesinin şekli değişmez — yeni alan sadece `settings.*` altına eklenir | `node tests/app/test_faz10_sync.js` + `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs` |
| I2 | `App.<name>` yüzeyi değişmez — handler adı/imzası korunur | `grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u` öncesi/sonrası aynı |
| I3 | `migrate()` dokunulmaz | `verify-state-migration-boundary.mjs` PASS |
| I4 | `save()` ve `sync.js` dokunulmaz | `tests/app/test_faz10_sync.js` PASS |
| I5 | `index.html`’de yeni `<script>` tagleri sadece `app.js`’i **kaldırmadan** eklenir (Faz -1.1 … -1.3); `app.js` kaldırma sadece Faz -1.4’te | `grep -c 'src="app.js' index.html` öncesi/sonrası 1 olmalı (Faz -1.4 öncesi) |
| I6 | Tek prompt = tek yerel commit; her prompt tek başına geri alınabilir | `git log -1` mesajı prompt kodunu içermeli |

### S3 · Context Load Sırası (Her Prompt Öncesi)

1. `.anti-amnesia/CURRENT-STATE.md`
2. `.anti-amnesia/LEDGER.md`
3. `NEXT-STEPS.md`
4. `LOCAL-ONLY-IMPLEMENTATION.md`
5. Bu katalog: `.prompts/PROMPT-CATALOG.md`
6. İlgili faz spec’i: `deliverables/SPEC-FAZ-*.md`
7. İlgili geçiş PR: `API-TRANSITION-GUIDE.md` §3
8. `SAFEGUARDS.md`
9. `CODE-MAP.md` (sadece ilgili bölümler)

### S4 · Veri Güvenliği (Şeyma CLAUDE.md)

- Uygulamayı **tarayıcıda açma**. Görsel doğrulama `driver.mjs --dump <sekme>` çıktısı ile yapılır.
- `mustafaras/seyma-data` deposuna **yazma yok**.
- Localhost static server sadece kullanıcı ajan-tarafından ekran görüntüsü istediğinde, kontrollü şekilde ve port 9000 ile açılır; sonunda mutlaka durdurulur.

### S5 · Doğrulama Kapısı (Her Prompt Sonunda)

```bash
node --check app.js && node --check sync.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

Ek olarak prompta özel test varsa onu da çalıştır.

### S6 · Değişmezlik Kanıtı

Prompt öncesi ve sonrasında şu komutların çıktısı aynı olmalı:

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c
grep -c 'src="app.js' index.html
```

Fark varsa I2/I5 ihlali vardır → `git checkout -- .` ve kullanıcıya bildir.

### S7 · Üç Dosyayı Güncelle (Atlanmaz)

**a) `.anti-amnesia/LEDGER.md`** — tabloya satır ekle:
```markdown
| FX-P-NN | <kısa ad> | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | <bir cümle sonuç> |
```
Başarısızsa `❌ BLOKE` + engel nedeni.

**b) `.anti-amnesia/CURRENT-STATE.md`** — "Durum" ve "Devam Eden" bölümlerini güncelle: hangi faz/prompt, sıradaki ne, açık kapı var mı.

**c) `.anti-amnesia/FX-PROMPT-STATE.json`**:
- Promptu **başlatırken**: `activePrompt: "FX-P-NN"`
- Promptu **bitirirken**: `activePrompt: null`, `lastCompletedPrompt: "FX-P-NN"`, `currentPhase: "Faz X"`, `updatedAt: "YYYY-MM-DD"`

### S8 · Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-NN <kısa Türkçe açıklama>"
```

Commit mesajı Türkçe, kısa, prompt kodunu taşır. **Push yapılmaz.**

### S9 · Cache Busting

`app/styles.css`, `app.js`, `sync.js`, veya yeni modüller değiştiyse [`index.html`](../../index.html) içindeki `?v=YYYYMMDDx` bump edilir. Her faz kapanış promptunda zorunlu.

### S10 · Prompt Kalite Standardı

Her prompt şunları içermeli:
- **Net amaç** (bir cümle)
- **Girdi dosyaları** (mutlak yollar)
- **Beklenen çıktü dosyaları**
- **Adım adım talimatlar** (her adım tek bir işlem)
- **Varsayımlar ve yasaklar** (örn. "`save()` dokunulmaz")
- **Test ve kanıt komutları**
- **Rollback talimatı** (başarısız olursa)
- **Prompt sonrası handoff notu** (bir sonraki ajan için)

---

## 2. Prompt Dalga Haritası

| Dalga | Promptlar | Konu | Onay Gereksinimi |
| --- | --- | --- | --- |
| -1 | FX-P-01 … FX-P-04 | `app.js` modülerleştirme altyapısı | — (şu anki onay kapsar) |
| 0 | FX-P-05 … FX-P-06 | Premium FX master switch & iskelet | — |
| 1 | FX-P-11 … FX-P-16 | Audio: UI sesleri, başarı/uyarı, zil | — |
| 2 | FX-P-21 … FX-P-26 | Haptics: tap/success/error/refresh/streak/water | — |
| 3 | FX-P-31 … FX-P-38 | Visual micro-FX: ripple, shimmer, count-up, transitions | — |
| 4 | FX-P-41 … FX-P-48 | Time theme: dawn/day/dusk/night + seasonal | — |
| 5 | FX-P-51 … FX-P-58 | Voice guidance: ayarlar, onboarding, sekmeler | — |
| 6 | FX-P-61 … FX-P-68 | Settings/master switch UI, A/B toggle, launch ritual | — |
| 7 | FX-P-71 … FX-P-74 | Kapatma, cache busting, son panel testleri, yerel branch değerlendirmesi | — |

---

## 3. Prompt Indexi

### Dalga -1: Modülerleştirme Altyapısı

| Kod | Ad | Ajan | Çıktı Dosyaları | Kısa Amaç |
| --- | --- | --- | --- | --- |
| FX-P-01 | Yerel branch oluştur ve temel modül iskeletini hazırla | herhangi | `app/core/dateUtils.js`, `app/core/helpers.js`, `app/core/mediaFx.js`, `app/core/timeTheme.js`, `index.html` (script tagleri) | `app.js` kaldırılmadan, yeni modüller `window.*` altında expose edilir; hiçbir handler bunları kullanmaz. |
| FX-P-02 | `state.js` ve `syncGlue.js` iskeletini hazırla | mimar/state uzmanı | `app/core/state.js`, `app/core/syncGlue.js` | `data`, `ui`, `migrate`, `save`, `SeyOnSynced` doğru modüllere ayrılır; `save()` `syncGlue.js`’de kalır. |
| FX-P-03 | `test_date_utils_boundary.js` ve `test_helpers_boundary.js` ekle | test uzmanı | `tests/app/test_date_utils_boundary.js`, `tests/app/test_helpers_boundary.js` | Yeni modüllerin `app.js` yüklüyken doğru `window.*` yüzeyini sunduğunu doğrula. |
| FX-P-04 | `test_modularization_boundary.js` güncelle ve S5/S6 kanıtlarını çalıştır | genel | `tests/app/test_modularization_boundary.js` | I2/I5 değişmezlik kanıtları PASS; `app.js` hâlâ yüklü. |

### Dalga 0: Premium FX Master Switch

| Kod | Ad | Ajan | Çıktı Dosyaları | Kısa Amaç |
| --- | --- | --- | --- | --- |
| FX-P-05 | `settings.premiumAtmosphere` alanını `migrate()`’a ekle | state/data uzmanı | `app.js` (sadece `migrate()` bölümü) | Eski datalara `settings.premiumAtmosphere = true` ve `uiSounds=true` backfill yap; I3 korunur. |
| FX-P-06 | `mediaFx.js` iskeletini oluştur: `SeyAudio`, `SeyHaptics`, `SeyFx` boş fonksiyonları | FX uzmanı | `app/core/mediaFx.js` | Tüm API yüzeyi tanımlanır; implementasyon sonraki fazlarda doldurulur. |

### Dalga 1: Audio

| Kod | Ad | Ajan | Çıktı Dosyaları | Kısa Amaç |
| --- | --- | --- | --- | --- |
| FX-P-11 | `SeyAudio.ctx` ve Web Audio AudioContext boot mantığını ekle | audio uzmanı | `app/core/mediaFx.js` | `tap()`, `success()`, `warning()`, `bell()` temel osilatör/zarflar. |
| FX-P-12 | Mevcut zikir tıklama sesini `SeyAudio.tap()`’e yönlendir | integration | `app.js`, `app/core/mediaFx.js` | `zikrTickSound` çağrısı korunarak `SeyAudio.tap()` kullanır; `settings.uiSounds` gating. |
| FX-P-13 | Başarı/kutlama seslerini entegre et: kart tamamlama, streak | integration | `app.js`, `app/core/mediaFx.js` | `SeyAudio.success()` çağrı noktaları. |
| FX-P-14 | Uyarı seslerini entegre et: sınır, hata, iptal | integration | `app.js`, `app/core/mediaFx.js` | `SeyAudio.warning()` çağrı noktaları. |
| FX-P-15 | `bell()` entegrasyonu: zikir tamamlama, hatırlatma kapanış | integration | `app.js`, `app/core/mediaFx.js` | `SeyAudio.bell()` çağrı noktaları. |
| FX-P-16 | Audio test fixture’larını güncelle ve kapsam raporu üret | test uzmanı | `tests/app/test_premium_audio_fx.js`, `tests/app/test_faz_minus11_boundary.js` | Tüm audio yüzeyleri test edilir. |

### Dalga 2: Haptics

| Kod | Ad | Ajan | Çıktı Dosyaları | Kısa Amaç |
| --- | --- | --- | --- | --- |
| FX-P-21 | `SeyHaptics` implementasyonu: `tap`, `success`, `error`, `refresh`, `streak`, `water` | haptics uzmanı | `app/core/mediaFx.js` | `navigator.vibrate` gating; `settings.richHaptics`; `prefers-reduced-motion`. |
| FX-P-22 | Buton/kart tıklamalarına `SeyHaptics.tap()` ekle | integration | `app.js`, `app/core/mediaFx.js` | Inline `onclick` handler’lar içinden çağrı. |
| FX-P-23 | Streak/water haptics entegrasyonu | integration | `app.js`, `app/core/mediaFx.js` | Uzun seri ve hidrasyon hatırlatma noktaları. |
| FX-P-24 | Haptics test fixture’larını güncelle | test uzmanı | `tests/app/test_premium_haptics_fx.js` | Titreşim desenleri ve gating testleri. |

### Dalga 3: Visual Micro-FX

| Kod | Ad | Ajan | Çıktı Dosyaları | Kısa Amaç |
| --- | --- | --- | --- | --- |
| FX-P-31 | `SeyFx` utility iskeleti: `isPremiumFxEnabled`, `prefersReducedMotion`, `shouldAnimate` | FX uzmanı | `app/core/mediaFx.js` | Master gating tek noktaya toplanır. |
| FX-P-32 | Ripple efekti: dokunma koordinatlarına göre CSS ripple | CSS/FX uzmanı | `app/styles.css`, `app/core/mediaFx.js` | Tema renklerini kullanır; reduced-motion’da kapatılır. |
| FX-P-33 | Shimmer efekti: yükleme ve kutlama durumları | CSS/FX uzmanı | `app/styles.css`, `app/core/mediaFx.js` | `shimmer()` helper ve keyframe. |
| FX-P-34 | Count-up animasyonu: sayaçlar yumuşak artış | FX uzmanı | `app/core/mediaFx.js` | `countUp(options)` implementasyonu. |
| FX-P-35 | Micro-FX entegrasyonu: kart toggle, streak, su | integration | `app.js`, `app/core/mediaFx.js`, `app/styles.css` | Gating ve temaya uygun çağrı noktaları. |
| FX-P-36 | Visual FX test fixture’ları | test uzmanı | `tests/app/test_premium_fx_utils.js` | `isPremiumFxEnabled` kombinasyonları. |

### Dalga 4: Time Theme

| Kod | Ad | Ajan | Çıktı Dosyaları | Kısa Amaç |
| --- | --- | --- | --- | --- |
| FX-P-41 | `SeyTimeTheme.classForHour()` implementasyonu | time theme uzmanı | `app/core/timeTheme.js` | Saat aralıkları: 05-08 dawn, 09-16 day, 17-20 dusk, 21-04 night. |
| FX-P-42 | `SeyTimeTheme.apply()` ve `#root` class güncellemesi | integration | `app/core/timeTheme.js`, `app.js` | Her render sonrası veya 1 saatlik poll. |
| FX-P-43 | Seasonal class: Ramazan, ilkbahar, sonbahar, yılbaşı | time theme uzmanı | `app/core/timeTheme.js` | Hicri offset ve miladi tarihe göre. |
| FX-P-44 | Time theme test fixture’ları | test uzmanı | `tests/app/test_premium_time_theme.js` | Saat ve mevsim sınırları. |

### Dalga 5: Voice Guidance

| Kod | Ad | Ajan | Çıktı Dosyaları | Kısa Amaç |
| --- | --- | --- | --- | --- |
| FX-P-51 | `SeyAudio.voice()` implementasyonu: TTS wrapper | voice uzmanı | `app/core/mediaFx.js` | `window.speechSynthesis` kullanır; gating ayrı. |
| FX-P-52 | Voice guidance onboarding akışı | integration | `app.js` | İlk açılışta nazik tanıtım. |
| FX-P-53 | Sekme değişimlerinde sesli ipucu | integration | `app.js`, `app/core/mediaFx.js` | `settings.voiceGuidance` gating. |
| FX-P-54 | Voice guidance test fixture’ları | test uzmanı | `tests/app/test_premium_voice_guidance.js` | TTS çağrı ve gating. |

### Dalga 6: Settings & Master Switch UI

| Kod | Ad | Ajan | Çıktı Dosyaları | Kısa Amaç |
| --- | --- | --- | --- | --- |
| FX-P-61 | `App.toggleSetting()` güvenli wrapper’ı | settings uzmanı | `app/core/appSurface.js` veya `app.js` | Boolean olmayan alanları korumalı; `SeyHaptics.tap()` geri bildirim. |
| FX-P-62 | Ayarlar ekranına yeni switch’ler ekle | UI uzmanı | `app.js` | `premiumAtmosphere`, `uiSounds`, `voiceGuidance`, `ambientSounds`, `richHaptics`, `launchRitual`. |
| FX-P-63 | Master switch (premiumAtmosphere) diğer FX’leri cascade etme | integration | `app.js`, `app/core/mediaFx.js` | Kapalıyken tüm FX sessiz. |
| FX-P-64 | Launch ritual: açılış animasyonu ve sesi | FX/UX uzmanı | `app.js`, `app/core/mediaFx.js`, `app/styles.css` | `settings.launchRitual`; reduced-motion’a saygılı. |
| FX-P-65 | Settings test fixture’ları | test uzmanı | `tests/app/test_premium_settings.js` | Toggle doğruluk ve cascade. |

### Dalga 7: Kapatma

| Kod | Ad | Ajan | Çıktı Dosyaları | Kısa Amaç |
| --- | --- | --- | --- | --- |
| FX-P-71 | Tüm headless testleri çalıştır ve FAIL listesi oluştur | QA | `premium-fx-plan/deliverables/REVIEW-CHECKLIST.md` güncellemesi | S5 kapısından geçemeyen varsa raporla. |
| FX-P-72 | `index.html` cache-busting `?v=` bump | genel | `index.html` | Tüm değiştirilen assetler. |
| FX-P-73 | Anti-amnesi final state ve handoff notu | genel | `.anti-amnesia/CURRENT-STATE.md`, `.anti-amnesia/FX-PROMPT-STATE.json`, `NEXT-STEPS.md` | Uygulama tamamlandı; kullanıcıya deploy onayı için sunulacak durum. |
| FX-P-74 | Yerel branch değerlendirmesi: push öncesi son kontrol | genel | yerel commit geçmişi | `LOCAL-ONLY-IMPLEMENTATION.md` §5 onay kontrol listesi. |

---

## 4. Prompt Şablonu

Her yeni prompt dosyası aşağıdaki YAML frontmatter + bölümlerle yazılır:

```markdown
---
code: FX-P-NN
name: <Türkçe kısa ad>
phase: Faz X | Dalga X
agent: <uzmanlık adı>
prerequisites:
  - FX-P-(NN-1) tamamlandı
  - branch: premium-fx-local
  - I1…I6 değişmezleri
input_files:
  - /Users/m_ras/Desktop/seyma/<yol>
output_files:
  - /Users/m_ras/Desktop/seyma/<yol>
forbidden:
  - save() dokunma
  - sync.js dokunma
  - app.js kaldırma (Faz -1.4 öncesi)
  - git push / PR / deploy
---

# FX-P-NN · <Ad>

## Amaç

Tek cümlede ne yapılacağı.

## Girdi

Hangi mevcut fonksiyon/satır / dosya / modül.

## Adımlar

1. ...
2. ...
3. ...

## Test / Kanıt

```bash
...
```

## Rollback

Başarısız olursa:
```bash
git checkout -- .
git clean -fd
```

## Handoff Notu

Bir sonraki ajan için: tamamlanan, engeller, sıradaki prompt.
```

---

## 5. Kalite Garantisi

- Her prompt **en az bir** test/kanıt komutu içermeli.
- Her prompt **mutlak dosya yolları** kullanmalı (`/Users/m_ras/Desktop/seyma/...`).
- Her prompt **değişmezleri listelemeli** (I1…I6 ve faz-özel yasaklar).
- Her prompt **anti-amnesi güncellemesi** içermeli (LEDGER + CURRENT-STATE + FX-PROMPT-STATE).
- Her prompt **rollback talimatı** içermeli.
- Promptlar arası çakışma olmaması için bu katalogdan türetilmeli.

---

## 6. Onay ve İlerleme

- Şu anki kullanıcı onayı: **Dalga -1’i (FX-P-01 … FX-P-04) başlatmak**.
- Sonraki dalgalara geçmeden önce her dalga için ayrı onay alınır (Dalga 0 ve sonrası).
- Herhangi bir promptta engel oluşursa `FX-PROMPT-STATE.json` içinde `blockedPrompt` alanına yazılır ve kullanıcıdan çözüm istenir.
