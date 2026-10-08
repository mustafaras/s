# YAYIN-8 — D3F-11, D3F-12, D3F-13 canlıya (pin 20261008d) · perf sapmasıyla

- **Onay (kullanıcı, birebir, 2026-10-08):** YAYIN-8 sorusuna "devam et"; perf kırmızısı ve iki seçenek (bekle-yeniden koş / sapmayla yayınla) sunulduktan sonra
  "hepsini yap". Bu, "önce yeniden koş, yine yalnız ortam kaynaklı perf kırmızısıysa sapmayla yayınla" olarak uygulandı ve kullanıcıya böyle söylendi.
- **Kapsam:** `8f0a3d10..HEAD`: `7b9a908b` (D3F-11), `f07db9ab` (D3F-12), `070418a7` (D3F-13) ve bu kayıt commit'i.
- **Pin:** `20261008c` → **`20261008d`** (D3F-11). Yayına çıkan çalışma zamanı farkı: `app/core/quranLearn.js` (kişi sorusu) ve pin dosyaları
  (`index.html`, `sw.js`, `panel-v2.html`). D3F-12 ve D3F-13 yalnız belge, araç ve test (Pages'e çıkmaz).

## Yayın öncesi kapı — SAPMA: perf mutlak tavanı (p95 ≤ 40 ms) yük altında kırmızı
İki tam koşu (`KAO2_ACCEPT_SLOW_HOST=1`), ham çıktı bu dizinde:

| koşu | HEAD | sonuç | perf p95 | yük ortalaması |
|---|---|---|---|---|
| 1 (`kapilar-1-7b9a908b.txt`) | `7b9a908b` | 19/20 yeşil; yalnız perf kırmızı | 40,744 ms | aynı makinede D3F-12/13 betikleri koşuyordu |
| 2 (`kapilar-2-070418a7.txt`) | `070418a7` | 19/20 yeşil; perf kırmızı + `tests/kao` içinde `test_kao2_kabul` (A-10 = aynı bütçe testi) | 72,603 ms (kabul içinde 51,223) | başta 22,8, sonda **53,3** |

Diğer bütün kapılar iki koşuda da yeşil: tests/kao (perf ve A-10 dışı) · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr ·
kontrast · l2-paket · plan-check · fix-sync --repro · d2f --strict · d3f pin senkronu · tekrar-uret 10/10.

**Regresyon yok kanıtı (A/B, aynı yük altında dönüşümlü, beşer koşu, 19:23):**

| | p95 medyan (aralık) | steady medyan |
|---|---|---|
| taban `8f0a3d10` (YAYIN-7, canlıda; daha önce yük yokken p95 5,125 ms ile geçti) | 27,4 ms (17,0–39,7) | 10,9 ms |
| HEAD `070418a7` | 22,4 ms (15,5–39,3) | 10,9 ms |

Taban da aynı yük altında 40 ms'ye yaklaşıyor; HEAD tabandan yavaş değil. Yük kaynağı (`ps`): VS Code renderer (%27–93), WindowServer, Claude ve Copilot
CLI süreçleri, `ReportMemoryException` (bellek baskısı). Denetim-3'ün test süreçlerinden yetim kalan yok.
D3F-STATE `openDecisions.perf-goreli-bant` göreli bant içindi; bu ise mutlak tavan. Bu yayın, mutlak tavan kırmızıyken yapılan **ilk** yayındır.
Sonraki yayında perf yük yokken yeniden ölçülmeli.

- **Yöntem:** `main` → `origin/main` fast-forward (force yok). `mustafaras/seyma-data`'ya dokunulmaz. Geri alma: `git revert` + yeni pin.
- **Kanıt düzeyleri:** kaynak/test kısmi (perf sapması) · yayın → CANLI.md · canlı → CANLI.md · cihaz — (yeni `SW_VERSION`; cihazda kullanıcıda).
