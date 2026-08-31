# Anti-amnesi: Şeyma Premium FX Planı — Mevcut Durum

**Tarih:** 2026-08-31
**Proje:** Şeyma Premium Görsel & İşitsel Efekt Yükseltme Planı
**Kaynak uygulama:** `/Users/m_ras/Desktop/seyma` (kod değiştirilmiyor)
**Plan sürümü:** 2.3
**Uygulama kuralı:** Uygulama aşamasında tüm commitler sadece yerel kalır. Bkz. [LOCAL-ONLY-IMPLEMENTATION.md](../LOCAL-ONLY-IMPLEMENTATION.md).

## Durum

Plan/spec/test/prompt senkronizasyonu tamamlandı; plan belgeleri arasındaki tutarsızlıklar giderildi. Uygulama prompt kataloğu (`.prompts/`) ve makine-readable prompt durumu (`.anti-amnesia/FX-PROMPT-STATE.json`) oluşturuldu. Uygulama koduna henüz dokunulmadı. Kullanıcı onayı bekleniyor: FX-P-01 ile Faz -1.1 implementasyonuna başlamak.

## Tamamlananlar (v2.3)

- FX-P-01 — Faz -1.1 temel modül iskeletleri uygulandı ve yerel commitlendi (`premium-fx-local`).
- FX-P-02 — `app/core/state.js` ve `app/core/syncGlue.js` iskeletleri oluşturuldu; `window.SeymaState` (data/ui/dark/migrate/getDay/createDefaultData) ve `window.SeymaSave`/`SeyOnSyncState`/`SeyOnSynced` yumuşak bağ (lazy getter) ile expose edildi; `index.html`'e `syncGlue.js` eklendi. `app.js`/`save()`/`migrate()` dokunulmadı. S5/S6 geçti; yerel commit yapıldı, push edilmedi.
- `PLAN.md` v2.3 — yerel-only uygulama kuralı ve `SeyOnSynced()` satır numarası düzeltmesi eklendi.
- `CODE-MAP.md` v2.1 — gerçek fonksiyon/satır referanslarıyla güncellendi.
- `ROADMAP.md` v2.3 — context-load sırası, yerel-only kuralı, Faz 7 kapanış notu eklendi.
- `FX-LIBRARY.md` v2.1 — `settings.haptics`/`richHaptics` ilişkisi netleştirildi.
- `MODULARIZATION.md` v2.2 — `state.js`/`save()` sınırı netleştirildi; time-theme saat aralığı düzeltildi.
- `deliverables/SPEC-FAZ-0..6.md` v2.2 — tutarsızlıklar giderildi.
- `deliverables/MIGRATE-SPEC.md` v2.1 — `migrate(d)` 4415 referansı eklendi.
- `deliverables/REDUCED-MOTION-SPEC.md` v2.1 — reduce modunda yeni keyframe'lerin kapatılması notu.
- `SAFEGUARDS.md` v2.2 — yerel-only kuralı ve reduced-motion ses/haptik geçişi.
- `REVIEW-CHECKLIST.md` v2.1 — `App.*` yüzeyi ve inline `onclick` korunması.
- `API-TRANSITION-GUIDE.md` v2.3.1 — API yüzeyi netlikleri ve PR dizilimi.
- `DEEP-IMPLEMENTATION-GUIDE.md` v2.3.1 — `migrate()` `== null` formu.
- `NEXT-STEPS.md` v2.3 — güncel bekleme listesi.
- `LOCAL-ONLY-IMPLEMENTATION.md` v1.0 — yerel-only uygulama kuralı.
- `.prompts/PROMPT-CATALOG.md` v1.0 — 74 promptluk katalog, ortak sözleşme ve kalite standartları.
- `.prompts/FX-P-01.md` … `FX-P-14.md` — Faz -1.1, Faz 0 ve Faz 1 için detaylı uygulama promptları.
- `.anti-amnesia/FX-PROMPT-STATE.json` — prompt ilerleme durumu makinesi.
- `tests/app/` altında 7 mevcut headless test fixture'ı.
  - `test_premium_audio_fx.js` (13/13)
  - `test_premium_haptics_fx.js` (12/12)
  - `test_premium_reduced_motion.js` (22/22)
  - `test_premium_launch_splash.js` (11/11)
  - `test_premium_time_theme.js` (24/24)
  - `test_modularization_boundary.js` (16/16) ← Faz -1 sınır fixture'ı
  - `test_faz_minus11_boundary.js` (13/13) ← PR -1.1 öncesi expose sınır fixture'ı

## Devam Eden

- FX-P-03: `tests/app/test_date_utils_boundary.js` ve `test_helpers_boundary.js` test fixture'ları eklenecek (state.js/syncGlue.js yüzeylerini de kapsayacak şekilde). Faz -1.1 tamamlandığında artık Faz 0'a (state/service extraction) geçilebilir. |

## Engeller

- Yok.

## Context Load Sırası (Her Oturum)

1. `.anti-amnesia/CURRENT-STATE.md` (bu dosya)
2. `.anti-amnesia/LEDGER.md`
3. [`../NEXT-STEPS.md`](../NEXT-STEPS.md)
4. [`../LOCAL-ONLY-IMPLEMENTATION.md`](../LOCAL-ONLY-IMPLEMENTATION.md)
5. [`../.prompts/PROMPT-CATALOG.md`](../.prompts/PROMPT-CATALOG.md)
6. İlgili [`../.prompts/FX-P-NN.md`](../.prompts)
7. İlgili [`../deliverables/SPEC-FAZ-*.md`](../deliverables)
8. [`../SAFEGUARDS.md`](../SAFEGUARDS.md)
