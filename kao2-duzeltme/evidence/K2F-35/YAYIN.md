# K2F-35 — Yayın kanıtı (kullanıcı isteği, 2026-10-05)
- Onay: kullanıcı "tüm açıkları kapat tam ve kusursuz uygulandığından emin ol ve canlıya al" (2026-10-05).
- Kapsam: K2F-34 (okuma çeldiricileri) + K2F-35 (Türkçe yüzde, "kalıcı kelime", namaz taşı etiketi) + dinleme şık konumu dengesi (LEDGER seq 98). Pin `20261004c` → **`20261005a`** (index.html ×15, sw.js ×16, 8 pin taşıyan test).
- Commit: `5a1aea85` · `main` ff-only `dc9743f4..5a1aea85` · force yok · Pages run **37330041514** success (GitHub Actions API ile doğrulandı).
- Kapılar (pin öncesi): tests/app 77 PASS · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · kao-plan-check · sync PASS; tekrar-uret 10/10; tests/kao 51/53 (yalnız test_kao2_perf_budget + ona bağlı test_kao2_kabul A-10 kırmızı: konteyner baseline makineden ~2× yavaş, p95 ≈8,7–9,7 ms vs göreli bant 5,09 ms; mutlak 40 ms tavanı geçiyor; test zayıflatılmadı, baseline'da da aynı).
- **Canlı bayt eşitliği DOĞRULANAMADI:** bu oturumun ağ çıkış vekili `mustafaras.github.io`yu engelliyor (curl 403, WebFetch EGRESS_BLOCKED). Önceki yayınlardaki 9/9 bayt kontrolü ve gizlilik 404 kontrolü bu oturumda yapılamadı; kullanıcı ya da ağı açık bir oturum yapmalı.
- Kanıt düzeyi: kaynak/test ✓ · yayın: Pages run success ✓, bayt eşitliği — · cihaz — (kullanıcıda)
