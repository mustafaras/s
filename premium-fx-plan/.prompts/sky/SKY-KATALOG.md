# SKY + PREM KART KATALOĞU

**Amaç:** Header hava efektlerini Apple Weather diline yaklaştıran canvas
motoru (SKY-01..12) + kalan mekanik premium dokunuşlar (PREM-01..03).

**Nasıl çalıştırılır:** Kartları **sırayla** uygula. Her kart = 1 commit.
Önce `SKY-00-ONBILGI.md` oku (bir kez yeterli, ama her oturum başında tekrar).

**Tam bağlam gerekirse:** `docs/DEVIR-HEADER-HAVA-VE-PREMIUM.md` ve
`premium-fx-plan/deliverables/TAM-DENETIM-20260908.md`. Kartlar bunlar
olmadan da uygulanabilir — kendi kendine yeter.

---

## Mimari kararlar (ALINDI — tartışma yok)

| Karar | Neden |
|---|---|
| Gökyüzü gradienti **CSS'te kalır** | Zaten çalışıyor, 10,87 ayrım ölçüldü. Canvas yalnız parçacık + gök cismi çizer. |
| Canvas host'u = mevcut `.sey-hdr-sky` span'i | Zaten var, zaten `position:absolute;inset:0`. Yeni DOM lifecycle yok. |
| Canvas **atılabilir**, parçacık durumu **modülde kalıcı** | `render()` header'ı yıkıyor; parçacıklar `_state`'te yaşadığı için süreklilik korunur. |
| Yeni modül `app/core/skyFx.js` | `timeTheme.js`'teki `createElement` yasağı oraya uygulanmaz. |
| Test = çizim çağrılarını kaydeden sahte context | "Yağmur çizildi mi?" sorusu beğeni değil, sayılabilir sinyal olur. |

---

## Kartlar

### Faz 0 — İskele (önce güvenlik ağı)

| Kart | İş | Dosya | Tahmini diff |
|---|---|---|---:|
| **SKY-01** | Test fixture'ı yaz (sahte canvas context) | `tests/app/test_sky_fx.js` | ~120 satır (kod verildi) |
| **SKY-02** | Modül iskeleti + `index.html` kaydı + gating | `app/core/skyFx.js` | ~70 satır |
| **SKY-03** | rAF döngüsü + pause/resume + reduced-motion | `app/core/skyFx.js` | ~50 satır |

### Faz 1 — Gök cisimleri

| Kart | İş | Dosya | Tahmini diff |
|---|---|---|---:|
| **SKY-04** | Güneş / ay diski + halo | `app/core/skyFx.js` | ~45 satır |
| **SKY-05** | Yıldız alanı (gece, deterministik) | `app/core/skyFx.js` | ~40 satır |

### Faz 2 — Hava parçacıkları

| Kart | İş | Dosya | Tahmini diff |
|---|---|---|---:|
| **SKY-06** | Bulut katmanı (2 parallax düzlem) | `app/core/skyFx.js` | ~50 satır |
| **SKY-07** | Yağmur + çisenti (rüzgâr açısı, sıçrama) | `app/core/skyFx.js` | ~60 satır |
| **SKY-08** | Kar (sinüs savrulma, değişken boyut) | `app/core/skyFx.js` | ~45 satır |
| **SKY-09** | Sis bantları + fırtına şimşeği | `app/core/skyFx.js` | ~55 satır |

### Faz 3 — Bağlama ve kapanış

| Kart | İş | Dosya | Tahmini diff |
|---|---|---|---:|
| **SKY-10** | `app.js` entegrasyonu (mount + sahne aktarımı) | `app.js` | ~25 satır |
| **SKY-11** | Eski CSS hava dokularını header'dan kaldır | `app/styles.css` | ~40 satır sil |
| **SKY-12** | Ölçüm matrisi + rapor | rapor | — |

### PREM — kalan mekanik dokunuşlar (SKY'dan bağımsız, sırası önemsiz)

| Kart | İş | Dosya |
|---|---|---|
| **PREM-01** | `SeyFx.transition` ölü API'sini kaldır | `app/core/mediaFx.js` |
| **PREM-02** | Motion token migrasyonu (M7 0,62 → yükselt) | `app/styles.css` |
| **PREM-03** | `sey-stagger` sınıf/efekt birleştirme | `app.js` |

---

## BU KARTLARDA **YAPILMAYACAK** İŞLER

Aşağıdakiler **kullanıcı onayı gerektirir**. Bir kart seni buraya götürürse
**DUR ve sor**:

| İş | Neden yasak |
|---|---|
| `mesaj` / `saygi` sekmelerini `.surface` kalıbına taşımak | İki sekmenin görsel dilini değiştirir — tasarım kararı |
| `amb-wx-*` opaklık tavanını 0,30'un üstüne çıkarmak | `FX2-23.10` sözleşmesi; CSS + test + kontrast birlikte güncellenmeli |
| Herhangi bir testi gevşetmek | Bulguyu gizler |
| `git push` / deploy / tag | Veri güvenliği kapısı |
