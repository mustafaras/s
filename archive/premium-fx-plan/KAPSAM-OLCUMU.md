# KAPSAM ÖLÇÜMÜ — FX-2'nin "Bitti" Tanımı

**Neden var:** FX-1'de 9/9 fixture yeşilken `SeyAudio.tap` uygulamada
**0 kez** çağrılıyordu. Modül testi "kod doğru mu?" sorusunu yanıtlar;
kapsam ölçümü **"kullanıcı bunu hissediyor mu?"** sorusunu yanıtlar.
FX-2'de ikisi de zorunlu.

---

## 1. Araç

`tools/fx-coverage.mjs` — ağsız, salt-okur Node betiği. `app.js`,
`app/styles.css`, `app/core/*.js` ve `index.html`'i statik olarak tarar,
kapsam metriklerini hesaplar, `premium-fx-plan/.anti-amnesia/coverage.json`
ile karşılaştırır.

```bash
node tools/fx-coverage.mjs            # rapor bas
node tools/fx-coverage.mjs --save     # yeni taban çizgisi yaz (yalnız FX2-01)
node tools/fx-coverage.mjs --gate     # eşiğin altına düşerse exit 1
```

**Kısıt:** Hiçbir uygulama dosyasını değiştirmez, ağ kullanmaz,
`localStorage`/sync'e dokunmaz.

---

## 2. Metrikler (M1–M9)

| Kod | Metrik | Nasıl sayılır |
|---|---|---|
| **M1** | `interactiveTotal` | `<button` + `onclick=` taşıyan `<div>/<span>/<a>` |
| **M2** | `pressCovered` | Delege katmanın seçicisiyle eşleşen eleman sayısı (`button`, `[role=button]`, `[data-fx]`, `[onclick]`) |
| **M3** | `soundWired` | Ses tetikleyen ayrık etkileşim yolu (delege katman + açık çağrılar) |
| **M4** | `rippleHosts` | Ripple konteyneri olabilecek eleman (M2 ∩ ölçülebilir kutu) |
| **M5** | `counterAnimated` | `SeyFx.countUp` / `data-countup` bağlı sayaç |
| **M6** | `overlayExitAnimated` | Kapanışta çıkış animasyonu olan overlay |
| **M7** | `motionTokenCompliance` | Token kullanan `transition:`/`animation:` oranı |
| **M8** | `defaultOffPremium` | `migrate()`'te `false` gelen premium ayar sayısı |
| **M9** | `feedbackChannelsIOS` | iOS'ta gerçekten çalışan geri bildirim kanalı (görsel + ses; `vibrate` sayılmaz) |
| **M10** | `pinkTokens` | Kalan pembe hex sayısı (`C77D93`, `B55471`, `FFB1CF`, `FCEDEE`, `F1EBFF`, `D96D8B`, `rgba(199,125,147`). `--kandil` **sayılmaz** |
| **M11** | `paletteFamilies` | `--accent`/`--aeon`/`--read`/`--choc`/`--hijri` hue'ları 40° toleransla kümelenir; küme sayısı |
| **M12** | `ambienceScenes` | Benzersiz `amb-time-*` + `amb-wx-*` + `amb-season-*` sınıf sayısı |
| **M13** | `contrastPairs` | 4 zaman × 2 tema = 8 çiftin ≥ 4,5:1 geçme sayısı |

---

## 3. Taban Çizgisi (2026-09-06, FX-2 öncesi)

```json
{
  "measuredAt": "2026-09-06",
  "commit": "33995dc",
  "M1_interactiveTotal": 387,
  "M2_pressCovered": 0,
  "M3_soundWired": 13,
  "M4_rippleHosts": 0,
  "M5_counterAnimated": 1,
  "M6_overlayExitAnimated": 0,
  "M7_motionTokenCompliance": 0.21,
  "M8_defaultOffPremium": 4,
  "M9_feedbackChannelsIOS": 0,
  "M10_pinkTokens": 11,
  "M11_paletteFamilies": 5,
  "M12_ambienceScenes": 0,
  "M13_contrastPairs": 0
}
```

> `M1` = 361 `<button>` + 26 `onclick` taşıyan `<div>`.
> `M9` = 0 çünkü haptik iOS'ta no-op, tap sesi çağrılmıyor, ripple tetiklenemiyor.

---

## 4. Eşikler (kapanış kapısı)

| Metrik | Taban | Eşik | Dalga |
|---|---:|---:|---|
| M2 `pressCovered` | 0 | **≥ 0,95 × M1** | 2 |
| M3 `soundWired` | 13 | **≥ 200** | 2–3 |
| M4 `rippleHosts` | 0 | **≥ 0,90 × M1** | 2 |
| M5 `counterAnimated` | 1 | **≥ 8** | 4 |
| M6 `overlayExitAnimated` | 0 | **≥ 10** | 4 |
| M7 `motionTokenCompliance` | 0,21 | **≥ 0,80** | 0–6 |
| M8 `defaultOffPremium` | 4 | **0** | 7 |
| M9 `feedbackChannelsIOS` | 0 | **≥ 2** | 2–3 |
| **M10 `pinkTokens`** | 11 | **0** | 1 |
| **M11 `paletteFamilies`** | 5 | **≤ 2** | 1 |
| **M12 `ambienceScenes`** | 0 | **≥ 18** | 5 |
| **M13 `contrastPairs`** | 0 | **8** | 1, 5 |

`--gate` bu tablodaki eşikleri uygular; **herhangi biri düşerse exit 1**.

---

## 4.1 M8 Tanım Daraltması (FX2-26)

`M8` yalnız **kimlik** ayarlarını sayar:
`premiumAtmosphere`, `uiSounds`, `richHaptics`, `launchRitual`,
`voiceLocalFallback`.

`voiceGuidance` ve `ambientSounds` **sayılmaz** — bunlar premium kimlik değil
**kullanıcı tercihidir** (biri sesli konuşma, diğeri sürekli arka plan sesi;
ikisi de rahatsız edici olabilir ve kapalı gelmesi doğrudur).

Bu daraltma bilinçli ve belgelidir; sessizce yapılmamıştır.

---

## 5. S8 Kuralı — "ölçülemeyen iş yapılmamış sayılır"

Bir prompt, hedeflediği metriği yükselttiğini `--gate` çıktısıyla
gösteremiyorsa:

1. Prompt **BLOKLU** işaretlenir (`FX2-STATE.json → blockedPrompt`).
2. Seri durur; sonraki karta geçilmez.
3. Neden `LEDGER.md`'ye yazılır.

"Kod yazıldı ama kapsam artmadı" FX-1'in tam olarak düştüğü tuzaktır; bu kural
onun panzehiridir.

---

## 6. Cihaz Kabulü (ölçüm bunu yerine geçmez)

Statik kapsam ≠ cihaz doğrulaması. Rapor üç kanıt seviyesini ayrı tutar:

| Seviye | Ne kanıtlar | Kim üretir |
|---|---|---|
| **K1 kaynak/test** | Kod bağlı, fixture yeşil, kapsam yükseldi | ajan (headless) |
| **K2 yerel görsel** | 127.0.0.1:9000 kontrollü QA ekran görüntüsü | ajan (CLAUDE.md istisnası) |
| **K3 cihaz** | iPhone'da ses duyuldu / basma hissedildi | **yalnız kullanıcı** |

Hiçbir rapor K1'e dayanarak "cihazda düzeldi" demez.
