# SAFEGUARDS — Veri Güvenliği, Erişilebilirlik, Performans

**Sürüm:** 3.0 (FX-2) · **Tarih:** 2026-09-06
**Kapsam:** FX-2 serisinin her kartı için bağlayıcı.
Kök [`CLAUDE.md`](../CLAUDE.md) "DATA SAFETY" bölümü bunun üstündedir.

---

## 1. Veri Güvenliği (ihlal = seri durur)

| Kural | Neden |
|---|---|
| Hiçbir FX `data` şemasına `settings.*` dışında alan eklemez | sync payload'ı ve panel projeksiyonu bozulmasın |
| Hiçbir FX `save()`, `sync.js`, `sanitize()` veya Contents API akışının **davranışını** değiştirmez | `sync.js` tam-değiştirme yapar; en küçük sapma veri kaybı riskidir |
| `localStorage` anahtarı `seyma-reset-v1` değişmez | eski kayıtlar okunamaz hale gelir |
| `migrate()` eklemeleri **idempotent + additive**, `typeof`/`==null` guard'lı | kullanıcının kayıtlı seçimi asla ezilmez |
| Yeni gizli alan eklenirse `sanitize()` beyaz listesi güncellenir | `openaiKey` gibi sırlar repoya sızmasın |
| `mustafaras/seyma-data` reposuna **yazılmaz** | tek canlı kişisel veri kopyası |
| Uygulamayı "çalışıyor mu" diye tarayıcıda açmak **yasak** | 2026-07-10 veri kaybı olayı |
| Doğrulama `run-seyma` headless harness'leri ile | `fetch`/timer ölü stub'lı, ağ çağrısı imkânsız |

**Ses/FX'e özel:** hiçbir ses veya animasyon `save()` tetiklemez, `data`'ya
yazmaz, `SeySync.schedule()` çağırmaz.

---

## 2. Erişilebilirlik

| Kural | Uygulama |
|---|---|
| `prefers-reduced-motion: reduce` her hareket yolunda saygı görür | `--dur-*` tek blokta 1 ms'ye düşer + `SeyFx.shouldAnimate()` |
| Basma geri bildirimi **premium ayarına bağlı değildir** | `.sey-press` `premiumAtmosphere:false` iken de takılır — bu erişilebilirlik, süs değil |
| Bilinçli etkileşim sesi (`tap`/`tick`) reduced-motion'da **çalar** | işitsel geri bildirim hareket değildir |
| Odak sözleşmesi korunur | `App.onModalKeydown`, `focusModalDialog`, Tab/Shift+Tab/Escape |
| Backdrop asla odaklanabilir olmaz | `role="button" tabindex="0"` yasak |
| `aria-pressed` / `aria-label` toggle'larda korunur | FX2-P-14 yalnız `data-fx` **ekler** |
| Kontrast ≥ 4,5:1 | 4 saat dilimi × 2 tema = 8 kombinasyon fixture ile doğrulanır (FX2-P-42) |
| Ses tek geri bildirim kanalı olamaz | iOS sessiz anahtarı sesi susturabilir → görsel kanal zorunlu |

---

## 3. Performans (I8)

- Animasyon yalnız `transform` / `opacity` / `filter`.
  `width`, `height`, `top`, `left`, `box-shadow` animasyonu **yasak**.
- `will-change` yalnız animasyon süresince; bitince kaldırılır.
- Delege dinleyiciler `{passive:true}`; `pointerdown` işi **≤ 4 ms**.
- `preventDefault()` dokunma yolunda **çağrılmaz** — kaydırma bozulmaz.
- Aynı anda **≤ 2** kalıcı sonsuz animasyon (aurora + shimmer).
- Ses polifonisi **≤ 6**; taşarsa en eski fade-out.
- `AudioContext` uygulama arka plandayken `suspend()`.
- Stagger gecikmesi `--i` en fazla **8** ile sınırlı.

---

## 4. Platform Gerçekleri (varsayım değil, ölçüm)

| Gerçek | Sonuç |
|---|---|
| iOS Safari `navigator.vibrate` **desteklemez** | haptik bonus, birincil kanal değil |
| iOS sessiz anahtarı WebAudio'yu susturabilir | görsel kanal tek başına yeterli olmalı |
| iOS `AudioContext` jest olmadan başlamaz | tek seferlik `{once:true}` kilit açma |
| `speechSynthesis.getVoices()` Chrome/iOS'ta **asenkron** | `onvoiceschanged` beklenir |
| Bulut TTS `settings.openaiKey` gerektirir | anahtarsızken yerel TTS'e düşülür (FX2-P-51) |
| GitHub Pages'te build yok | harici kütüphane/CDN/ses dosyası **eklenmez** |

---

## 5. Kanıt Seviyeleri (rapor dili)

| Seviye | Ne kanıtlar | Kim |
|---|---|---|
| **K1** kaynak/test | kod bağlı, fixture yeşil, kapsam yükseldi | ajan (headless) |
| **K2** yerel görsel | `127.0.0.1:9000` kontrollü QA görüntüsü | ajan (CLAUDE.md istisnası) |
| **K3** cihaz | iPhone'da ses duyuldu / basma hissedildi | **yalnız kullanıcı** |

Hiçbir rapor K1'e dayanarak "cihazda düzeldi" demez. K2 için CLAUDE.md'deki
istisna koşullarının tamamı sağlanmalıdır (Guard 1 doğrulanmış, `forceSync`
yok, gerçek hesap/token yok, sunucu turn bitmeden kapatılır).

---

## 6. Kırmızı Çizgiler

Bunlardan biri gerçekleşirse **seri durur**, `blockedPrompt` yazılır:

- `git push` / PR / deploy / tag (onaysız)
- `seyma-data` reposuna yazma
- `sync.js` davranış değişikliği
- `migrate()`'te var olan kullanıcı değerinin ezilmesi
- `App.*` handler imzasının değişmesi
- Odak/klavye sözleşmesinin bozulması
- Kontrast oranının 4,5:1 altına düşmesi
- Fixture'ı gevşeterek testi yeşile boyamak
