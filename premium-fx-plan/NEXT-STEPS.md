# Şeyma Premium FX Planı — Devam Eden İşler

**Tarih:** 2026-08-31
**Durum:** Plan/spec/test senkronizasyonu tamamlandı; uygulama koduna henüz dokunulmadı.
**Kural:** Plan aşamasında uygulama koduna dokunulmuyor. Uygulama aşamasında tüm commitler sadece yerel kalır ([LOCAL-ONLY-IMPLEMENTATION.md](LOCAL-ONLY-IMPLEMENTATION.md)).

## Tamamlananlar

- [x] `app.js` tüm user-facing bölümleri okundu.
- [x] `CODE-MAP.md` v2.1 güncellendi.
- [x] `MODULARIZATION.md` v2.2 tamamlandı.
- [x] `deliverables/SPEC-FAZ-0..6.md` v2.2 güncellendi.
- [x] `MIGRATE-SPEC.md` ve `REDUCED-MOTION-SPEC.md` v2.1 güncellendi.
- [x] `SAFEGUARDS.md` v2.2 ve `REVIEW-CHECKLIST.md` v2.1 güncellendi.
- [x] `API-TRANSITION-GUIDE.md` v2.3.1 ve `DEEP-IMPLEMENTATION-GUIDE.md` v2.3.1 senkronize edildi.
- [x] `LOCAL-ONLY-IMPLEMENTATION.md` v1.0 oluşturuldu.
- [x] `.prompts/PROMPT-CATALOG.md` v1.0 + FX-P-01…FX-P-14 uygulama promptları oluşturuldu.
- [x] `.anti-amnesia/FX-PROMPT-STATE.json` makine-readable prompt durumu eklendi.
- [x] Mevcut headless testler ve tüm premium fixture'lar geçmeye devam ediyor.
- [x] Anti-amnesia ledger/CURRENT-STATE v2.3 güncellendi.

## Sırada Yapılacaklar

1. [x] Plan belgeleri arasındaki tutarsızlıklar giderildi; API yüzeyi, settings alanları, faz/PR sırası, reduced-motion/ses/haptik kuralları ve time-theme saat aralıkları senkronize edildi.
2. [x] Yerel-only uygulama kuralı eklendi ([LOCAL-ONLY-IMPLEMENTATION.md](LOCAL-ONLY-IMPLEMENTATION.md)).
3. [x] Uygulama prompt kataloğu (`.prompts/PROMPT-CATALOG.md` + FX-P-01…FX-P-14) ve makine-readable prompt durumu (`.anti-amnesia/FX-PROMPT-STATE.json`) oluşturuldu.
4. [ ] Kullanıcı onayı alındıktan sonra FX-P-01 ile Faz -1.1 implementasyonuna başla.
5. [ ] Her prompt için `.prompts/FX-P-NN.md` dosyasını takip et; commitler sadece yerel kalır.
6. [ ] CURRENT-STATE.md ve LEDGER.md uygulama ilerledikçe güncellenecek.

## Kısıtlamalar

- Uygulama koduna dokunma (onay alınana kadar).
- Uygulama aşamasında tüm commitler **sadece yerel**; push/PR/deploy yok.
- `data`, `migrate()`, `sync.js`, `save()`, `localStorage` key'leri değişmez.
- Erişilebilirlik ve reduced-motion kurallarına uy.
- Headless `run-seyma` harness'leri kullan.
