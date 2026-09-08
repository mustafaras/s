# FX-2 Serisi Kapanış Belgesi — "Hissedilir Premium"

| | |
|---|---|
| **Seri** | FX-2 — Şeyma Premium FX |
| **Kart** | FX2-28 (belge, seri son kartı) |
| **Tarih** | 2026-09-08 |
| **Kapsam** | 28 kart, 8 dalga (0–7) |
| **Dal** | `premium-fx-gorsel-yuzey` — **LOCAL ONLY** |
| **Sonuç** | 12/13 metrik eşikte (M7 kullanıcı onaylı hedefte) · 0 FAIL · push/merge/deploy YAPILMADI |

---

## 1. Seri Özeti

FX-1 (91 prompt, ~70 fixture, "DEPLOY-A-HAZIR" kararı) kod olarak kapandı ama
kullanıcı geri bildirimi netti: *"tüm fx promptları uygulamama karşın uygulama
hâlâ premium bir his vermiyor."* 2026-09-06 kod denetimi
([`../TESHIS.md`](../TESHIS.md)) nedenini buldu: `SeyAudio.tap` 0 çağrı,
`SeyFx.ripple` tetiklenemez biçimde bağlı, `.sey-ripple/.sey-shimmer/.sey-enter`
markup'ta hiç kullanılmıyor, haptikler iOS'ta tamamen no-op, 4 premium ayar
varsayılan kapalı — buna rağmen 9/9 fixture yeşildi. **Ders:** fixture'lar
modülü test etti, bağlantıyı test etmedi.

FX-2 bu yüzden birim olarak API'yi değil **ölçülebilir kapsamı** aldı
([`../KAPSAM-OLCUMU.md`](../KAPSAM-OLCUMU.md)): her kart, M1–M13 metriklerinden
en az birini canlı ölçümle yükseltmek zorundaydı (S8 sözleşmesi).

**28 kart, 8 dalga, tamamlandı 2026-09-06 → 2026-09-08 (3 gün).**
`git log --oneline | grep -c '^[0-9a-f]* fx2:'` = **36 commit** — 28 kart +
2 seri-açılış commit'i (teşhis + v2.0 taban) + 6 "tam ve kusursuz" denetim/
gap-fix düzeltmesi (FX2-02, FX2-06, FX2-24, FX2-25'te bir; FX2-26'da iki).
Kartın Adım 7'sindeki `# 28 commit` yorumu 1:1 kart:commit varsayıyordu;
gerçek sayı denetim disiplini yüzünden daha yüksek — dürüstçe kaydedilir,
gizlenmez (bkz. §7 aşağıda).

---

## 2. Öncesi/Sonrası Kapsam Tablosu (M1–M13) — asıl kanıt

Taban: `FX2-STATE.json → coverageBaseline` (2026-09-06, commit `67f95a6`).
Şimdi: `tools/fx-coverage.mjs --gate` (2026-09-08, bu kart sırasında yeniden
ölçüldü).

| Metrik | Taban | Şimdi | Δ | Eşik | Durum |
|---|--:|--:|--:|--:|---|
| M1 `interactiveTotal` | 390 | 390 | 0 | — (bilgi) | — |
| M2 `pressCovered` | 0 | 390 | +390 | ≥ 343 | ✅ |
| M3 `soundWired` | 18 | 408 | +390 | ≥ 200 | ✅ |
| M4 `rippleHosts` | 0 | 390 | +390 | ≥ 325 | ✅ |
| M5 `counterAnimated` | 1 | 10 | +9 | ≥ 8 | ✅ |
| M6 `overlayExitAnimated` | 0 | 12 | +12 | ≥ 10 | ✅ |
| M7 `motionTokenCompliance` | 0.13 | **0.62** | +0.49 | ≥ 0.80* | ⚠️ FX2-24 onayı |
| M8 `defaultOffPremium` | 2 | 0 | −2 | = 0 | ✅ |
| M9 `feedbackChannelsIOS` | 0 | 2 | +2 | ≥ 2 | ✅ |
| M10 `pinkTokens` | 9 | 0 | −9 | = 0 | ✅ |
| M11 `paletteFamilies` | 3 | 2 | −1 | ≤ 2 | ✅ |
| M12 `ambienceScenes` | 0 | 18 | +18 | ≥ 18 | ✅ |
| M13 `contrastPairs` | 0 | 8 | +8 | = 8 | ✅ |

**12/13 metrik eşikte.** Tek istisna **M7**: `tools/fx-coverage.mjs --gate`
literal `≥0,80` eşiğini uygular ve bu yüzden **exit 1** döner. FX2-24'te
kullanıcı (AskUserQuestion ile) "Elevation + 13 dönüşüm" kapsamını seçip
kartın gerçek hedefini **0,62**'ye güncelledi — matematiksel tavan: 195
geçiş/animasyon kural sitesinin 120'si hareket token'ı taşıyor, kalan 75'i
(bloklu keyframe'ler, `none`, `linear`, animasyon-dışı site) token'a
geçirilemez ve S-sözleşmesi yapay bildirim eklemeyi yasaklıyor. **Araç
düzeltilmedi** — kart salt-okur olduğu için `tools/fx-coverage.mjs`'e
dokunulmadı; gerçek hedef burada ve `FX2-STATE.json`'da kayıtlıdır.

---

## 3. Renk Kararı

Pembe (`#C77D93`/`#FFB1CF`, 5 palet ailesi) → **Şampanya Altını + Füme
Mürekkep** (`#B08D57` açık / `#8A6A3B` ink / `#E3C08A` koyu), `--gold-1..5`
merdiveni. Gerekçe: ÆON (`#C99A3A`), nav (`#A4824C`), zikir (`#D8B968`) ve
Saygı zaten altın kullanıyordu — pembe paletteki tek yabancıydı. Palet **5
aileden 2'ye** indi (M11). Kontrast 8/8 çift AA eşiğini geçiyor (M13); en
sıkı çift 4,4472–4,625 arası ölçüldü (`test_fx2_palette_contrast.js`).
Korunanlar: `--kandil` (dinî), `--warn`, `--read`/`--watch`/`--listen`,
`--sun`/`--sun2`. Detay: [`../RENK-VE-ZEMIN.md`](../RENK-VE-ZEMIN.md).

---

## 4. Canlı Zemin

4 gerçek güneş saati dilimi (dawn/day/dusk/night — sabit saat aralığı değil,
gerçek `sunrise`/`sunset`'ten) × 8 WMO hava sahnesi (clear/cloud/fog/
drizzle/rain/snow/storm/none) × 6 mevsim (spring/summer/autumn/winter +
ramazan + newyear) = **192 kombinasyon**. Kaynak veri `data.weather.spots[0]`
— **zaten canlı ve kayıtlı**, **yeni ağ çağrısı sıfır**. Katmanlar
`#sey-aurora::after`'da yaşar (hava) + `#root` sınıfları (zaman/mevsim);
**yeni DOM düğümü yok**, opaklık tavanı ≤0,09, `setInterval` yok (30 sn'lik
mevcut poll döngüsü sahneyi kendiliğinden tazeler), reduced-motion'da renk
kalır hareket durur, sekme arka plana geçince `amb-paused` ile duraklar.
`--amb-seed` günün tarihinden deterministik, gradient açısını (`--amb-angle`,
170°±8°) kaydırır — gün içinde sabit, gün gün değişir (sıkılma önleyici).
FX-1'de bloklu kalan FX-P-88'in ("hava modu, gelecekte hava API'si varsa")
gerekçesi geçersizdi — veri zaten vardı. Detay: aynı belge.

---

## 5. Nihai API Envanteri

`app/core/mediaFx.js` ve `app/core/timeTheme.js`'in kaynaktan (2026-09-08)
doğrulanmış dışa açık yüzeyi:

| Nesne | Dosya | Metotlar | Not |
|---|---|---|---|
| `window.SeyAudio` | mediaFx.js | `tick`, `tap`, `toggleOn`, `toggleOff`, `nav`, `sheetOpen`, `sheetClose`, `success`, `bell`, `warning`, `error`, `isAudible`, `isVoiceEnabled`, `isQuietTime`, `guides`, `greeting`, `voice`, `speakLocal` (dahili) | 11+ ses; master bus→compressor→limiter→destination + kod-içi reverb; ≤6 kök polifoni; iOS jest kilidi |
| `window.SeyHaptics` | mediaFx.js | `tap`, `success`, `error`, `refresh`, `streak`, `water` | iOS Safari'de `navigator.vibrate` yok — bonus kanal |
| `window.SeyFx` | mediaFx.js | `isPremiumFxEnabled`, `prefersReducedMotion`, `shouldAnimate`, `ambientAllowed`, `isSoundAllowed`, `sweepCounters`, `countUp`, `ripple`, `shimmer`, `enter`, `transition`, `sheetClose`, `bindAuroraParallax` | FX2-16 `sheetClose`, FX2-18 `sweepCounters`, FX2-25 `bindAuroraParallax` yeni |
| `window.SeyTouch` | mediaFx.js | `install` (idempotent), `SELECTOR` | FX2-06 yeni — tek delege `#root` pointer katmanı; `data-fx` niyet haritası (nav/open/close/toggle/confirm/destructive) |
| `window.SeyTimeTheme` | timeTheme.js | `classForHour`, `apply`, `seasonalClass`, `applySeasonal` | **korundu** — `theme-aurora` hâlâ buna bağlı (FX2-25) |
| `window.SeyAmbience` | timeTheme.js | `weatherClass`, `intensity`, `seed`, `seasonClass`, `timeClass`, `scene`, `apply` | FX2-19…22 yeni — saf sahne hesaplayıcı, `SeyTimeTheme`'e dokunmadı (I2) |

Eski dış adlar (`tap`/`success`/`warning`/`bell`/`ripple(event,color)`) FX-2
boyunca **korundu** — I1 (geriye uyumluluk) hiç ihlal edilmedi.

---

## 6. Yeni/Değişen `settings` Alanları ve Varsayılanları

`app/core/state.js` `migrate()` + `createDefaultData()` (simetrik, `typeof`/
`==null` guard — kayıtlı kullanıcı seçimi asla ezilmez):

| Alan | Varsayılan | Kategori | Not |
|---|---|---|---|
| `premiumAtmosphere` | `true` | kimlik | FX2-01'de zaten açıktı |
| `uiSounds` | `true` | kimlik | FX2-01'de zaten açıktı |
| `richHaptics` | `true` | kimlik | FX2-01'de zaten açıktı |
| `launchRitual` | **`true`** (FX2-26) | kimlik | splash runtime'ı (FX-P-55) yazıldığı için artık açık |
| `voiceLocalFallback` | **`true`** (FX2-26) | kimlik | bulut anahtarı yoksa sessizlik yerine yerel TTS |
| `voiceCloudTts` | `true` | tercih | anahtar varsa bulut ses kalır |
| `voiceGuidance` | `false` | tercih | opt-in — kendiliğinden ses çıkarır |
| `ambientSounds` | `false` | tercih | opt-in — kendiliğinden ses çıkarır |

M8 yalnız 5 **kimlik** ayarını sayar (kullanıcı deneyimini tanımlayan
temel FX kimliği); 2 **tercih** ayarı bilinçli opt-in kalır — kendiliğinden
ses/konuşma üreten özellikler kullanıcı onayı olmadan açılmaz. **M8 = 0** —
hiçbir kimlik ayarı kapalı gelmiyor.

---

## 7. Dalga Bazında Uygulananlar (28 kart)

| Dalga | Kartlar | Ana hedef | Sonuç |
|---|---|---|---|
| 0 — Ölçüm ve Token | 01–02 | Araç + token iskeleti | `fx-coverage.mjs` (13 metrik), M7 0,13→0,56 |
| 1 — Renk Kimliği | 03–05 | Pembe → Şampanya Altını | M10 9→0, M11 3→2, M13 8/8 |
| 2 — Dokunma Katmanı | 06–10 | Delege pointer + ripple + niyet | M2 0→390, M4 0→390, M9 0→1 |
| 3 — Ses Kimliği | 11–14 | `SeyAudio` v2 (bus/reverb/limiter, 11 ses) | M3 18→408, M9 1→2 |
| 4 — Hareket Sistemi | 15–18 | Sekme geçişi + overlay çıkışı + sayaç | M5 1→10, M6 0→12 |
| 5 — Canlı Zemin | 19–23 | `SeyAmbience` (192 sahne) | M12 0→18, M13 kilitlendi |
| 6 — Malzeme ve Derinlik | 24–25 | Elevation + 13 token + aurora v2 | M7 0,55→0,62 (kullanıcı onaylı tavan) |
| 7 — Varsayılanlar ve Kapanış | 26–28 | Ayar denetimi + regresyon + bu belge | M8 2→0 |

Ayrıntılı kart-kart kayıt: [`../.anti-amnesia/LEDGER.md`](../.anti-amnesia/LEDGER.md)
(append-only) ve [`../.anti-amnesia/CURRENT-STATE.md`](../.anti-amnesia/CURRENT-STATE.md).

---

## 8. Fixture Envanteri ve Son Sonuçlar (bu kart sırasında yeniden koşuldu)

| Aile | Sonuç |
|---|--:|
| Syntax (11 dosya, `node --check`) | 11/11 OK |
| `driver.mjs` | 0 FAIL |
| `zikr-harness.mjs` | 95/95 |
| B1/B2/B3 boundary harness'ları | PASS |
| `tests/app/*.js` (tüm dosyalar, tek tek) | **0 FAIL** |
| `tests/panel/` + `tests/panel-v2/` + `tests/quran/` (FX2-27'de ölçülen, bu ailede değişiklik yok) | 59/59 |
| `test_modularization_boundary.js` | **64/64** |
| `tests/reminders/run-reminder-smoke.mjs` | 20 curated / 73 assertion |
| `tools/fx-coverage.mjs --gate` | 12/13 (yalnız M7, kullanıcı onaylı) |

FX-2'ye özgü fixture'lar: `test_fx2_palette_contrast.js` (12),
`test_fx2_touch_coverage.js` (14), `test_fx2_audio_engine.js` (12),
`test_fx2_tab_transition.js` (7), `test_fx2_overlay_motion.js` (7),
`test_fx2_ambience.js` (14) — toplam 66 FX2-özel assertion grubu, artı
genişletilmiş `test_premium_fx_utils.js` (48), `test_premium_fx_gate_defaults.js`
(30) ve diğer `test_premium_*.js` dosyaları.

---

## 9. Değişmezlik Kanıtları (I1–I8)

| Denetim | Hedef | Ölçülen | Durum |
|---|--:|--:|---|
| `App.*` yüzeyi | 718 | 718 | ✅ |
| `onclick=` bağlantısı | 391 | 391 | ✅ |
| `index.html` app.js `<script>` | 1 | 1 | ✅ |
| `mediaFx.js` `preventDefault` | 0 | 0 | ✅ |
| `timeTheme.js` `setInterval` | 0 | 0 | ✅ |
| `timeTheme.js` `fetch(` | 0 | 0 | ✅ |
| `mediaFx.js` `fetch(` | 1 (yalnız bulut TTS) | 1 | ✅ |
| FX-2'nin `sync.js`'e dokunan commit sayısı | 0 | 0 (`git log --grep="fx2:" -- sync.js`) | ✅ |
| `MODULARIZATION.md` dokunuldu mu | hayır | dokunulmadı (`git log` FX-2 penceresinde 0 commit) | ✅ |
| Boundary fixture | yeşil | `test_modularization_boundary.js` 64/64 | ✅ |

> **`sync.js` diff notu (FX2-27'den taşındı, hâlâ geçerli):** literal
> `git diff --stat main -- sync.js` boş değildir ama nedeni FX-2 değil —
> branch main'e merge edilmemiş **ZP-10** (`cf88f83`, 2026-09-02) taşıyor.
> FX-2'nin `sync.js`'e dokunan commit sayısı sıfırdır.

---

## 10. Ölü Bağlantı Taraması (Adım 6)

```
grep -rhoE 'premium-fx-plan/[A-Za-z0-9_./-]+' --include='*.md' --include='*.json' . \
  | sed 's/[.,)]*$//' | sort -u | while read p; do [ -e "$p" ] || echo "ÖLÜ: $p"; done
```

**2 ölü bağlantı bulundu**, ikisi de **istisna kapsamında** — canlı/güncel
belgelerde **0** ölü bağlantı:

- `premium-fx-plan/.prompts/FX-P-70.md` ve
  `premium-fx-plan/.prompts/PROMPT-CATALOG.md` — yalnız
  `.anti-amnesia/LEDGER.md`'nin FX-1 dönemi satırlarında (Seq 19, 22, 23,
  66–68) geçiyor; kartın kendi kuralı bu dosyayı **append-only istisna**
  sayıyor.
- Aynı iki ad ayrıca `deliverables/FX-SERI-KAPANIS-BELGESI.md`'de geçiyor —
  bu, FX-1'in **dondurulmuş kapanış kaydı** (kendi metni: *"Bu belge o
  noktaya kadar geçerli tek resmi kapanış kaydıdır"*); FX2-00'da (LEDGER
  Seq F2-00) FX-1 döneminin 88 bayat dosyası (PROMPT-CATALOG.md ve 67
  FX-P-* kartı dahil) bilinçli olarak silindi. Tarihsel bir kapanış
  belgesini o anda var olan dosyalara göre geriye dönük "düzeltmek" tarihi
  tahrif eder — bu yüzden **dokunulmadı**, aynı LEDGER.md istisnasının
  ruhu uygulandı.

---

## 11. Kanıt Seviyesi Ayrımı

| Seviye | Kaynak | Durum |
|---|---|---|
| **K1 — kaynak/test** | Bu belge + FX2-KAPSAM-RAPORU.md: syntax, harness, fixture, kapsam metrikleri, değişmezlik, ölü bağlantı taraması | ✅ |
| **K2 — yerel görsel** | Seride kontrollü görsel QA kaydı yok; kanonik yol headless `run-seyma` | — (yok) |
| **K3 — cihaz kabulü** | Gerçek cihazda (iOS/Android) premium hissin onayı | ⏳ **kullanıcıdan bekleniyor** |

K1 doğrular: yapı, davranış, kapsam, doküman tutarlılığı. K3 onaylamaz:
"cihazda kusursuz his" iddiası K1'e dayanarak verilemez — fiziksel jest/
haptik/ses/görsel algı yalnız cihazda doğrulanabilir.

---

## 12. Bilinen Sınırlar (dürüstçe, FX2-27 §6'dan taşındı)

- **iOS haptik:** `navigator.vibrate` iOS/Safari'de yok — haptik bonus kanal
  (M9 yalnız görsel + ses kanalını sayar).
- **iOS sessiz anahtarı:** açıkken WebAudio çıkışını susturabilir; ses
  katmanı kullanıcı jestiyle başlatılan bağlama bağlı (FX2-13 unlock).
- **Bulut TTS:** `openaiKey` gerektirir; `voiceLocalFallback` varsayılan
  AÇIK olduğundan anahtarsızda yerel (robotik) sese düşer — sessizlik
  değil.
- **`render()` mimarisi:** hâlâ tam `innerHTML` yeniden üretimi — sürekli
  (per-frame) hareket kapsam dışı; FX-2 senkron geçişler + CSS
  animasyonları kullanır, `setInterval` tabanlı animasyon yok.
- **Canlı zemin verisi:** `data.weather` boşken sahne yalnız güneş saati +
  mevsim ile çalışır (hava katmanı düşer, asla kırılmaz).
- **M7 eşiği:** araç literal `≥0,80` gösterir; FX2-24 kullanıcı onaylı
  gerçek hedef **0,62** (matematiksel tavan). `--gate` bu yüzden exit 1
  döner; 12/13 metrikte PASS.
- **LOCAL-ONLY:** `FX2-STATE.json` → `pushedToRemote:false`,
  `deployApproved:false`. Bu belge onları **değiştirmez**.
- **Veri güvenliği:** hiçbir fixture/komut `mustafaras/seyma-data`'ya
  yazmaz; tümü ağsız headless (fetch/timer stub'lı).
- **Cihaz kabulü (K3):** yalnız kullanıcıdan gelir; bu belge onu iddia
  etmez.

---

## 13. Sıradaki Adımlar (bu belgenin kapsamı dışında, kullanıcı kararı gerektirir)

1. **Push/merge/deploy onayı** — branch `premium-fx-gorsel-yuzey` hâlâ
   local-only; main'e merge + GitHub Pages deploy ayrı, açık onay ister.
2. **Cihaz kabulü (K3)** — iPhone/Android'de gerçek ses/basma/haptik/canlı
   zemin hissinin kullanıcı tarafından doğrulanması.
3. **FX→modularization devri** — `premium-fx-plan/MODULARIZATION.md` ve
   [`docs/monolit-bolumlenme-haritasi.md`](../../docs/monolit-bolumlenme-haritasi.md)
   zaten hazır; FX-2 serisinin kapanması bu devrin ön koşuluydu
   (kök `CLAUDE.md`/`AGENTS.md`'de belirtildiği gibi).

---

## 14. Bu Kart (FX2-28) Kapanışı

- ✅ `FX2-KAPANIS.md` kapsam tablosunu içeriyor (§2)
- ✅ `CLAUDE.md` + `AGENTS.md` güncellendi ve birbirinin aynısı (aynı commit)
- ✅ Ölü bağlantı yok (canlı belgelerde); 2 istisna (§10) dürüstçe kaydedildi
- ✅ `MODULARIZATION.md` dokunulmadı; boundary fixture 64/64 yeşil
- ✅ `monolit-bolumlenme-plan/` referansları hâlâ çözülüyor (dead-link
  taraması `premium-fx-plan/` önekiyle sınırlı; monolit haritası ayrı
  taranmadı ama bu kart onu değiştirmedi)
- ⚠️ `--gate` 12/13 PASS; M7 literal eşiği kullanıcı onaylı 0,62 tavanı
  nedeniyle exit 1 (aynı, önceden bilinen durum)
- ✅ **Push/merge/deploy YAPILMADI**

**Seri burada biter.** Merge/deploy ayrı ve açık kullanıcı onayı gerektirir.
Cihaz kabulü (K3) yalnız kullanıcıdan gelir.
