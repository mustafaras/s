# FX-1 Arşiv Özeti — Ne Yapıldı, Ne Tutmadı

**Seri:** FX-P-01 … FX-P-91 (91 kart, 2 dalga grubu) · **Kapandı:** 2026-09-05
**Ayrıntılı kapanış:** [`../deliverables/FX-SERI-KAPANIS-BELGESI.md`](../deliverables/FX-SERI-KAPANIS-BELGESI.md)
**Durum makinesi:** [`../.anti-amnesia/FX-PROMPT-STATE.json`](../.anti-amnesia/FX-PROMPT-STATE.json)

Bu dosya, silinen FX-1 planlama belgelerinin (PLAN.md, ROADMAP.md,
NEXT-STEPS.md, SESSION-STARTER.md, CODE-MAP.md, FX-LIBRARY.md,
API-TRANSITION-GUIDE.md, DEEP-IMPLEMENTATION-GUIDE.md, SPEC-FAZ-0…6,
VISUAL-FX-AUDIT, EKSIKLER-ONCELIKLI, PREMIUM-OZELLIK-ENVANTERI,
MIGRATE-SPEC, REDUCED-MOTION-SPEC, REVIEW-CHECKLIST, FX-VERIFY-RAPORU 1–2,
PLAN-GORSEL-YUZEY-TAMAMLAMA, 67 adet FX-P-*.md prompt kartı) yerine geçen
tek sayfalık tarihsel kayıttır.

---

## Kalıcı Olarak Kazanılanlar ✅

Bunlar FX-2'nin **üzerine inşa ettiği** temeldir, atılmaz:

| Kazanım | Nerede |
|---|---|
| 7 çekirdek modül + B1 canlı getter deseni | `app/core/{constants,dateUtils,helpers,state,syncGlue,mediaFx,timeTheme}.js` |
| `SeyAudio` / `SeyHaptics` / `SeyFx` / `SeyTimeTheme` API iskeleti | `app/core/mediaFx.js`, `timeTheme.js` |
| `migrate()` premium settings backfill (idempotent + additive) | `app/core/state.js` |
| Ayarlar → "Premium Atmosfer" master switch + `App.toggleSetting` | `app.js` |
| Bulut TTS yolu (OpenAI sinirsel sesler) + `sanitize()` koruması | `mediaFx.js`, `sync.js` |
| Splash iskeleti (`#sey-splash`, `#sey-splash-note`) | `index.html`, `app.js` |
| Aurora katmanı (`#sey-aurora`, `theme-aurora`) | `index.html`, `styles.css` |
| Nav bounce, badge pop, `.surface` hover derinliği | `app/styles.css` |
| Zaman/mevsim sınıf altyapısı (`theme-time-*`, `theme-season-*`) | `timeTheme.js`, `styles.css` |
| 9 premium fixture + `#app{contain:layout style}` | `tests/app/`, `styles.css` |
| Emoji → Lucide ikon temizliği (premium yüzeylerde) | `app.js` |

## Tutmayan Yaklaşımlar ❌

FX-2'de **tekrarlanmayacak** olanlar:

| Hata | Sonucu | FX-2'deki panzehir |
|---|---|---|
| API yazıp bağlamamak | `SeyAudio.tap` 0 çağrı | Kapsam metriği + S8 kuralı |
| Handler başına elle bağlama | 717'nin ~25'i kapsandı | Tek delege katman (FX2-06) |
| `event` gerektiren API'yi `event` geçmeyen `onclick`'e bağlamak | Ripple hiç oynamadı | Delege katman gerçek `PointerEvent` tutar |
| CSS sınıfı yazıp markup'a basmamak | `.sey-ripple` 0 kullanım | Sınıflar runtime'da takılır |
| Haptik'i tek kanal saymak | iOS'ta tamamı sessiz | Çok kanallı (ses + görsel + titreşim) |
| Premium özelliği kapalı göndermek | 4 özellik atıl | FX2-26 varsayılan denetimi |
| Modül testini entegrasyon kanıtı saymak | 9/9 yeşil, his sıfır | Fixture **+** `--gate` zorunlu |
| Belge sayısını çoğaltmak (30+ .md) | Bayat, çelişkili kaynak | 8 belge, tek doğru kaynak |

## Bilinen Açık Kalanlar

- **FX-P-66/67** — ertelendi (A/B toggle kopya deneyi, launch-ritual
  genişletmesi). FX-2 kapsamına **alınmadı**.
- **FX-P-88** — hava modu; FX-1'de bloklu kaldı. FX-2 kapsamı dışında.
- **Panel-v2 premium FX rozetleri** — ayrı yüzey, hiç dokunulmadı.

## Sayısal Kapanış (FX-1 iddiası vs. gerçek)

| FX-1'in iddiası | 2026-09-06 ölçümü |
|---|---|
| "70 prompt uygulandı, sıfır FAIL" | Doğru — ama fixture'lar bağlantıyı ölçmüyordu |
| "DEPLOY-A-HAZIR" | Kod çalışıyor; **kullanıcı deneyimi hedefe ulaşmadı** |
| "6 dalga premium FX" | Kullanıcının gördüğü: aurora, nav bounce, 5 kutlama sesi |
| `app.js` 18.805 satır | Gerçek: **17.470** (belge bayattı) |
