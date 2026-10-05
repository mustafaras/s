# K2F-35 — Yayın kanıtı (kullanıcı isteği, 2026-10-05)
- Onay: kullanıcı "tüm açıkları kapat tam ve kusursuz uygulandığından emin ol ve canlıya al" (2026-10-05).
- Kapsam: K2F-34 (okuma çeldiricileri) + K2F-35 (Türkçe yüzde, "kalıcı kelime", namaz taşı etiketi) + dinleme şık konumu dengesi (LEDGER seq 98). Pin `20261004c` → **`20261005a`** (index.html ×15, sw.js ×16, 8 pin taşıyan test).
- Commit: `5a1aea85` · `main` ff-only `dc9743f4..5a1aea85` · force yok · Pages run **37330041514** success (GitHub Actions API ile doğrulandı).
- Kapılar (pin öncesi): tests/app 77 PASS · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · kao-plan-check · sync PASS; tekrar-uret 10/10; tests/kao 51/53 (yalnız test_kao2_perf_budget + ona bağlı test_kao2_kabul A-10 kırmızı: konteyner baseline makineden ~2× yavaş, p95 ≈8,7–9,7 ms vs göreli bant 5,09 ms; mutlak 40 ms tavanı geçiyor; test zayıflatılmadı, baseline'da da aynı).
- ~~Canlı bayt eşitliği DOĞRULANAMADI~~ → **sonradan kullanıcının terminalinde doğrulandı (aşağıdaki 'Canlı doğrulama').** Eski not:  bu oturumun ağ çıkış vekili `mustafaras.github.io`yu engelliyor (curl 403, WebFetch EGRESS_BLOCKED). Önceki yayınlardaki 9/9 bayt kontrolü ve gizlilik 404 kontrolü bu oturumda yapılamadı; kullanıcı ya da ağı açık bir oturum yapmalı.
- Kanıt düzeyi: kaynak/test ✓ · yayın: Pages run success ✓, bayt eşitliği — · cihaz — (kullanıcıda)

## Ek ölçümler (2026-10-05, kullanıcı: "çok fazla kapatamadığın açık var")
- **Perf kırmızısı yalnız makine hızı:** taban commit `07802fa6`in KENDİ kodu, aynı testle bu konteynerde 3 koşuda steady p95 = 9,54 / 8,63 / 8,62 ms çıktı (göreli bant 5,09 ms'yi o da aşıyor); güncel kod 8,7–9,7 ms. Yani gerileme yok; bant referans makineye bağlı. Test dokunulmadan bırakıldı.
- **Yayın adımları (Actions API):** validate (sözdizimi, panel etiket dengesi, headless render) success; deploy işinde "Stage runtime-only site", "Guard runtime assets present", "Upload artifact", "Deploy to GitHub Pages" adımlarının hepsi success. Canlı bayt eşitliği egress engeli yüzünden hâlâ doğrudan ölçülemedi.

## Canlı doğrulama (kullanıcı terminali, 2026-10-05)
- Yöntem: kullanıcı canlı dosyaları `curl | shasum -a 256` ile özetledi; beklenen özetler `git show 5a1aea85:<dosya>` ile bu oturumda hesaplandı (ilk 16 hane).
- Sonuç: **9/9 MATCH** — index.html `74ffe6de78b371c0` · sw.js `e71c4e2a008b2ddf` · app/kao.css `321998ba7d9b7311` · quranLearn.js `ebc1971d2c26ef70` · quranLearnFlow.js `1bde07c50138d8c8` · quranLearnViews.js `5369668cc6234713` · quranCurriculumV2.js `ae7b20609031ac33` · app.js `157f88ebb81dce3f` · constants.js `b241181406d303ae` (son satırın dosya adı yapıştırmada kesilmişti, özeti beklenenle aynı).
- Canlı `sw.js`: `SW_VERSION = '20261005a'`.
- Gizlilik: `kao2-duzeltme/FIX-STATE.json` → 404 · `docs/GELISTIRME-PLANI.md` → 404.
- Not: kullanıcının ilk denemesindeki "0/9 DIFF" yanlış alarmdı (`cd ~/yol/s` örnek yoldu, yerel dosya bulunamadı); özet yöntemiyle çözüldü.
- Kanıt düzeyi: kaynak/test ✓ · yayın **doğrulandı** (run success + bayt eşitliği + gizlilik) · cihaz — (kullanıcıda).
