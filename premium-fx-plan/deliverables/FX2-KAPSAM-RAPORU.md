# FX2 — Tam Regresyon ve Kapsam Raporu

| | |
|---|---|
| **Seri** | FX-2 — Şeyma Premium FX · "Hissedilir Premium" |
| **Kart** | FX2-27 (salt-okur QA) |
| **Tarih** | 2026-09-08 |
| **Dalga** | 7 — Kapanış |
| **Hedef** | 0 FAIL + kapsam kanıtı |
| **Sonuç** | 12/13 metrik eşikte ✅ · M7 kullanıcı onaylı hedefte (0.62) · 0 FAIL |

---

## 1. Öncesi / Sonrası Kapsam Tablosu (M1–M13)

Raporun kalbidir. Taban `FX2-STATE.json → coverageBaseline` (2026-09-06,
commit `67f95a6`); şimdi `tools/fx-coverage.mjs` (2026-09-08, `--json`).

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

**\* M7 notu (dürüstçe):** `tools/fx-coverage.mjs` literal `≥ 0.80` eşiğini
gösterir ve `--gate` exit 1 döner — yalnız bu metrik nedeniyle. FX2-24'te
kullanıcı "Elevation + 13 dönüşüm"ü seçip hedefi **0.62** olarak güncelledi
(LEDGER FX2-24 satırı: "maks 0.62 — kullanıcı hedefi 0.62'ye güncellendi").
M7 matematiksel olarak 0.80'e ulaşamaz: 195 geçiş/animate kural sitesinin
120'si hareket token'ı taşıyor; kalan 75'i (bloklanmış keyframe'ler, `none`,
`linear`, animasyon-dışı site) token'a geçirilemez ve S-sözleşmesi yapay
bildirim eklemeyi yasaklar. **12/13 metrik eşikte; tek istisna kullanıcı
onaylı ve kayıtlıdır.**

---

## 2. Dalga Bazında Uygulananlar (28 kart · 8 dalga)

| Dalga | Kartlar | Uygulama özeti |
|---|---|---|
| 0 — Ölçüm ve Token | FX2-01…02 | `fx-coverage.mjs` (13 metrik), `--gate`, `--save`; hareket/elevation token iskeleti; M7 ilk bağlama (0.13→0.56) |
| 1 — Renk Kimliği | FX2-03…05 | **Pembe → Şampanya Altını** palet kararı; `--gold-1..5` merdiveni; kontrast fixture (M10 9→0, M11 3→2, M13 8/8) |
| 2 — Dokunma Katmanı | FX2-06…10 | `SeyTouch` delege pointer katmanı (M2 0→390); ripple delege hedefi; `.sey-press`; `data-fx` niyet haritası; kapsam fixture (M4 390, M9 1) |
| 3 — Ses Kimliği | FX2-11…14 | `SeyAudio` v2: master bus/compressor/limiter/reverb, 11 ses paleti, iOS jest kilidi + görünürlük, motor fixture (M3 408, M9 2) |
| 4 — Hareket Sistemi | FX2-15…18 | Sekme geçiş motoru (I7 korumalı); 12 overlay close hattı; stagger `--i`; sayaç/halka canlandırma (M5 10, M6 12) |
| 5 — Canlı Zemin | FX2-19…23 | `SeyAmbience` (timeTheme.js); gerçek sunrise/sunset 4 dilim; WMO 8 hava sahnesi; 6 mevsim + günlük varyasyon; 15 günlük kapanış fixture (M12 18) |
| 6 — Malzeme ve Derinlik | FX2-24…25 | Elevation token'ları (`--elev-2/3/4`) + 13 dönüşüm; Aurora v2 (parallax `translate` + feTurbulence grain) |
| 7 — Varsayılanlar ve Kapanış | FX2-26…27 | Varsayılan denetimi (M8 2→0; `launchRitual`/`voiceLocalFallback` → true, tercih alanları opt-in); **bu kart** |
| 8 — (kalan) | FX2-28 | Seri kapanış belgesi |

34 `fx2:*` commit, branch `premium-fx-gorsel-yuzey`, hepsi yerel.

---

## 3. Fixture Envanteri ve Sonuçlar

### 3.1 Headless harness'lar (run-seyma)

| Harness | Sonuç |
|---|--:|
| `driver.mjs` (app.js boot + etkileşim) | 0 FAIL |
| `zikr-harness.mjs` (İlham & İbadet) | 95/95 |
| `verify-state-migration-boundary.mjs` (B2) | 60/60 |
| `verify-state-helper-boundary.mjs` (B1) | 0 hata |
| `verify-state-adapter-contract.mjs` (B3) | 20/20 |

### 3.2 Fixture aileleri

| Aile | PASS / FAIL |
|---|--:|
| `tests/app/` (premium FX, zikir, state, quran-boundary, modal) | 35 / 0 |
| `tests/panel/` (PANEL-01…06, boot resilience) | 23 / 0 |
| `tests/panel-v2/` (27 Panel-v2 Premium fixture) | 27 / 0 |
| `tests/quran/` (catalog, transport, merge, striking verses) | 9 / 0 |
| `tests/reminders/run-reminder-smoke.mjs` | 20 curated · 73 assertion |

**TOPLAM: 94 fixture PASS / 0 FAIL** (reminder smoke dahil değil).

Seriye özgü FX-2 fixture'ları: `test_fx2_palette_contrast.js` (12),
`test_fx2_touch_coverage.js` (14), `test_fx2_audio_engine.js` (12),
`test_fx2_tab_transition.js` (7), `test_fx2_overlay_motion.js` (7),
`test_fx2_ambience.js` (14), `test_premium_fx_gate_defaults.js` (30).

### 3.3 Sözdizimi

11/11 dosya `node --check` OK: `app.js`, `sync.js`, `sw.js`,
`panel/panel.js`, `panel/panelCoverageManifest.js`, `app/core/state.js`,
`app/core/mediaFx.js`, `app/core/timeTheme.js`, `app/core/syncGlue.js`,
`app/core/helpers.js`, `tools/fx-coverage.mjs`.

---

## 4. Değişmezlik Kanıtları (I1–I8)

| Denetim | Hedef | Ölçülen | Durum |
|---|--:|--:|---|
| `App.*` yüzeyi | 718 | 718 | ✅ |
| `onclick=` bağlantısı | 391 | 391 | ✅ |
| `index.html` app.js `<script>` | 1 | 1 | ✅ |
| `mediaFx.js` `preventDefault` | 0 | 0 | ✅ |
| `timeTheme.js` `setInterval` | 0 | 0 | ✅ |
| `timeTheme.js` `fetch(` | 0 | 0 | ✅ |
| `mediaFx.js` `fetch(` | 1 (yalnız bulut TTS) | 1 | ✅ |
| `sync.js` FX-2 dokunuşu | 0 | **0** (`git log --grep="fx2:" -- sync.js`) | ✅ |

> **`sync.js` diff notu:** literal `git diff --stat main -- sync.js` **boş
> değildir** — nedeni FX-2 değil: branch, main'e merge edilmemiş **ZP-10**
> (`cf88f83`, 2026-09-02, Zikirmatik elle zikir girişi — manuel sayım union
> matematiği) taşır. Branch LOCAL-ONLY olduğundan (hiç push edilmedi) bu
> ZP-10 delta'sı main'e ulaşmamıştır. **FX-2 serisinin sync.js'e dokunan
> commit sayısı 0'dır** — seri değişmezliği (sync.js kutsalı) sağlamdır.

---

## 5. Kanıt Seviyesi Ayrımı

| Seviye | Kaynak | Durum |
|---|---|---|
| **K1 — kaynak/test** | Bu rapor: syntax, harness, 94 fixture, kapsam metrikleri, değişmezlik | ✅ |
| **K2 — yerel görsel** | Seride kontrollü görsel QA kaydı yok; kanonik yol headless `run-seyma` | — (yok) |
| **K3 — cihaz kabulü** | Gerçek cihazda (iOS/Android) premium hissin onayı | ⏳ **kullanıcıdan bekleniyor** |

K1 doğrular: yapı, davranış, kapsam. K3 onaylamaz: "cihazda kusursuz his"
iddiası K1'e dayanarak verilemez — fiziksel jest/haptik/ses yalnız cihazda.

---

## 6. Bilinen Sınırlar (dürüstçe)

- **iOS haptik:** `navigator.vibrate` iOS/Safari'de yok — haptik bonus kanal
  (M9 yalnız görsel + ses kanalını sayar, vibrate sayılmaz).
- **iOS sessiz anahtarı:** açıkken WebAudio çıkışını susturabilir; ses katmanı
  kullanıcı jestiyle başlatılan bağlama bağlı (FX2-13 unlock).
- **Bulut TTS:** `openaiKey` gerektirir; FX2-26 sonrası `voiceLocalFallback`
  varsayılan AÇIK olduğundan anahtarsızda yerel (robotik) sese düşer —
  sessizlik değil.
- **`render()` mimarisi:** hâlâ tam `innerHTML` yeniden üretimi — sürekli
  (per-frame) hareket kapsam dışı; FX-2 senkron geçişler + CSS animasyonları
  kullanır, `setInterval` tabanlı animasyon yok.
- **Canlı zemin verisi:** `data.weather` boşken sahne yalnız güneş saati +
  mevsim ile çalışır (hava katmanı düşer); veri geldiğinde WMO katmanı eklenir
  (192 kombinasyon, yeni ağ çağrısı yok).
- **M7 eşiği:** literal arac eşiği `≥ 0.80` gösterir; FX2-24 kullanıcı onaylı
  gerçek hedef 0.62 (ulaşılamaz üst sınır). `--gate` 12/13 metrikte PASS.
- **LOCAL-ONLY:** seri push/merge/deploy **yok**; `FX2-STATE.json`
  `pushedToRemote:false`, `deployApproved:false`. FX2-28 kapanış onayına kadar
  geçerli.
- **Veri güvenliği:** hiçbir fixture/komut `mustafaras/seyma-data`'ya yazmaz;
  tümü ağsız headless (fetch/timer stub'lı).

---

## 7. Bu Kart (FX2-27) Kapanışı

- ✅ Hiçbir kaynak dosya değişmedi (`git status --short` yalnız bu rapor)
- ✅ Tüm aileler 0 FAIL (94 PASS)
- ✅ `App.*` = 718, `onclick` = 391
- ✅ `sync.js` FX-2 dokunuşu = 0
- ✅ Rapor K1/K2/K3 ayrımını yapıyor
- ⚠️ `--gate` exit 1 — tek neden M7 literal eşiği; kullanıcı onaylı hedef 0.62

**Sıradaki:** FX2-28 — seri kapanış belgesi ve yayın onayı.
