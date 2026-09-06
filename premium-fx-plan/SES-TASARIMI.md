# SES TASARIMI v2 — Bip'ten Enstrümana

**Yerini aldığı belge:** `FX-LIBRARY.md` (silindi — parametreleri gerçek
`mediaFx.js` ile uyuşmuyordu).
**Uygulayan kartlar:** FX2-P-21 … FX2-P-24.

---

## 1. Şu An Neden Ucuz Duyuluyor

| Sorun | Şu anki kod | Etkisi |
|---|---|---|
| Filtre yok | `osc → gain → destination` | Sert, dijital tepe |
| Transient yok | Saf ton | "Bip", tıklama hissi yok |
| Harmonik yok | `bell()` = saf sine | Çan değil, **test tonu** |
| Reverb yok | Kuru sinyal | Uzaysız, oyuncak |
| Varyasyon yok | Her seferinde aynı freq | Arka arkaya = makineli tüfek |
| Limiter yok | Çakışan sesler toplanır | Klipleme/çıtırtı |
| `tap()` 180 ms | `playTone(523,0.18,…)` | UI tıkı için 3–6× uzun |
| `warning()` sawtooth 200 Hz | Sert testere | Rahatsız edici |

---

## 2. Yeni Sinyal Zinciri (FX2-P-21)

```
kaynak(lar) ──► lowpass ──► ADSR gain ──► [dry]──────────────┐
                                     └──► convolver(reverb) ─┤
                                                             ├─► busGain
                                                             │     │
                                                    compressor ◄───┘
                                                             │
                                                    softLimiter
                                                             │
                                                     destination
```

- **busGain** `0.8` — tüm FX tek noktadan kısılır.
- **compressor** `threshold -18 dB, ratio 4, attack 3 ms, release 120 ms`.
- **softLimiter** `WaveShaper`, `tanh` eğrisi — klipleme yerine yumuşama.
- **reverb** kod içinde üretilen impuls (0,9 s, üstel sönüm, stereo gürültü);
  **harici dosya yok**, `assets/` büyümez.
- **Polifoni** en fazla 6 eşzamanlı ses; taşarsa en eskisi fade-out.
- **Varyasyon** her çalışta `detune ±12 cent`, `gain ±%8`, `start +0–4 ms`.

---

## 3. Ses Paleti (FX2-P-22)

Hepsi aynı enstrüman ailesinden: yumuşak sine/triangle gövde + kısa filtrelenmiş
gürültü transienti + kısa reverb kuyruğu. Türkçe sıcak tona uygun; hiçbiri
"sistem uyarısı" gibi duyulmamalı.

| Ad | Süre | Yapı | Nerede |
|---|---:|---|---|
| `tick` | 22 ms | Sadece gürültü transienti + 4 kHz bandpass | Zikirmatik, hızlı sayaç |
| `tap` | **45 ms** | 660 Hz sine + 8 ms transient, decay 40 ms | **Her buton** (delege katman) |
| `toggleOn` | 90 ms | 587→784 Hz iki nota | Açılan anahtar |
| `toggleOff` | 90 ms | 784→587 Hz (ters) | Kapanan anahtar |
| `nav` | 110 ms | 494 Hz + yumuşak yükselen filtre | Sekme değişimi |
| `sheetOpen` | 180 ms | Alçalan filtre süpürmesi + hafif hava | Overlay açılışı |
| `sheetClose` | 140 ms | Yükselen filtre, kısa kuyruk | Overlay kapanışı |
| `success` | 420 ms | **Üç nota** majör (523/659/784), 60 ms aralık | Alışkanlık, kayıt |
| `bell` | 900 ms | **6 inharmonik parsiyel** (1 / 2,76 / 5,40 / 8,93 / 13,3 / 18,4) | Zikir/hatim tamamlama |
| `warning` | 260 ms | 392 Hz triangle + hafif düşen ton (sawtooth **yok**) | Limit, uyarı |
| `error` | 300 ms | 330→294 Hz iki nota, düşük gain | Hata |

> **`bell` neden farklı:** Gerçek çan sesi harmonik değil **inharmonik**tir.
> 6 osilatörün temel frekansın irrasyonel katlarında çalması, saf sine'in asla
> veremeyeceği metalik gövdeyi verir. Bu tek değişiklik "premium" algısının
> en büyük tek kaynağıdır.

---

## 4. iOS Ses Kilidi (FX2-P-23)

iOS Safari `AudioContext`'i kullanıcı jesti olmadan başlatmaz ve **sessiz
anahtarı (ringer switch) `AudioContext` çıkışını susturabilir.**

1. `#root` üzerinde **tek seferlik** `pointerdown` dinleyicisi:
   `ctx.resume()` + 1 örneklik sessiz buffer çal → bağlam kalıcı açılır.
2. `visibilitychange` → gizliyken `suspend()`, dönünce `resume()` (batarya).
3. `ctx.state !== 'running'` ise ses **sessizce** atlanır, hata basılmaz.
4. Sessiz anahtar açıkken ses duyulmayabilir → **bu yüzden görsel basma
   durumu (FX2-P-12) tek başına yeterli olmalı**, ses bonus.

---

## 5. Gating Matrisi (değişmedi, netleştirildi)

| Ses grubu | `premiumAtmosphere` | `uiSounds` | reduced-motion | quiet-time 23–07 |
|---|---|---|---|---|
| `tick`, `tap` | gerekli | gerekli | **çalar** (bilinçli etkileşim) | çalar |
| `toggle*`, `nav`, `sheet*` | gerekli | gerekli | sessiz | çalar |
| `success`, `bell`, `warning`, `error` | gerekli | gerekli | sessiz | çalar |
| `voice.*` | gerekli | — | sessiz | **sessiz** |
| `ambient.*` | gerekli | — | sessiz | **sessiz** |

---

## 6. Haptik: Çok Kanallı Strateji

`navigator.vibrate` **iOS Safari'de yok** (TEŞHİS §4). Bu yüzden haptik tek
kanal değil, üç kanallı bir "dokunma onayı" olarak yeniden tanımlanıyor:

| Kanal | Android | iOS | Not |
|---|---|---|---|
| Görsel basma durumu | ✅ | ✅ | **Birincil** — her zaman çalışır |
| Ses (`tap`) | ✅ | ✅ (sessiz anahtar hariç) | İkincil |
| `navigator.vibrate` | ✅ | ❌ | Bonus |
| iOS `<input switch>` jesti | ❌ | 🧪 iOS 17.4+ | **Deneysel** — yalnız cihaz kabulüyle (K3) açılır |

`SeyHaptics.*` API'si korunur (I2); içi çok kanallı hale gelir.

---

## 7. Ölçüm

- `M3 soundWired` ≥ 200 (taban 13)
- `M9 feedbackChannelsIOS` ≥ 2
- `test_fx2_audio_engine.js`: graf şekli, limiter varlığı, polifoni sınırı,
  detune aralığı, gating matrisi, quiet-time — **ağsız**, stub `AudioContext`.
