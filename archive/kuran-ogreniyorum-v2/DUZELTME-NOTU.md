# KAO2 arşivi — düzeltme notu (K2F-41)

Bu klasör donmuştur; yalnız bu not eklendi. Diğer arşiv dosyaları **değişmez** ve aşağıdaki bayat ifadeleri tarihsel olarak taşır.
Güncel doğruluk kaynağı: `kao2-duzeltme/FIX-STATE.json` ve `kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md`. Bulgu ayrıntısı: `kao2-duzeltme/denetim/KUSUR-RAPORU.md`.

| Bulgu | Arşivde yazan | Doğrusu |
|---|---|---|
| M-01 | KAPANIŞ §6: "L1 bekliyor: 133 metin · draft görünmez" | Denetim anında 133 metin `sourced` ve görünürdü; `draft` olan 25 kavram + 20 sûre bağlamı + 12 `whyReview` idi. K2F-22…24 sonrası `texts.tr.json` içinde `draft` kalmadı (158 inceleme kaydı `sourced`). Dinî bağlamlı metinlerde gerçek L2 alan uzmanı onayı yoktur (L2-PAKET.md, kullanıcıda). |
| M-04 | LEDGER'da yok | `KAO2-A` (`51570555`: bütçe 88→128, 20 contextTr, elif uzlaştırması, pin f→g) ve `KAO2-21 hazırlık` (`98c1ff1f`) kart dışı commit'lerdir. |
| M-05 | "tek commit" | KAO2-24 kapanış kayıtları (`1a550b72`), çok sayıda yayın/pin ek commit'i ve KAO2-27'de 3 commit protokolü aşmıştır. |
| M-06 | `KAO2-STATE.json`: `releaseApproval:"not_approved"`, `lastRelease` KAO2-20, `versionPolicy` 20260928b, `journeyFindings {K9,Y8,O9}`, "contextTr yazılmadı" | KAO2-21…27 canlıdır; gerçek yolculuk bulguları K9·Y13·O4 + P10; contextTr yazıldı; G1/G3/G4 kapatılmadı. Güncel onay: `FIX-STATE.json.releaseApproval`. |
| M-07 | CURRENT-STATE: "KAO2-18+ için ~0,6 KiB", "KAO2-17 dâhil yayınlanmamış işler", "INCELEME-KAO2-17 doldurulmalı" | Bayat; güncel bütçe ve açık riskler `kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md`'dedir. |
| M-08 | KAPANIŞ §2 bulgu kimlikleri | Y-05 = boş âyet vaadi (sûre bağlamı değil); Y-01…03 = hub kartı; T-01…05 = hub görseli; T-13…15 Ayarlar değildir. ~62 bulgunun kapanış eşlemesi: `KUSUR-RAPORU.md` §8 ve `PROMPTLAR.md` §3 (49/49). |
| M-09 | KAPANIŞ: "son pin 20260930k (KAO2-27'de l)", p95 7,1 ms, "sonra push/deploy kararı" | Pin sırası ve p95 (A-KABUL 4,3–4,9 ms) çelişiktir; her şey zaten canlıdaydı. Güncel pin `FIX-STATE.json.pins.release`. |
| M-12 | Yayın kanıtı | KAO2-23…27'de `release-live.json` yoktur; KAO2-26 `YAYIN.md` "aşağıdaki rapor" der ama rapor yoktur; KAO2-27 bayt eşleşmesi Views/Curriculum/içerik modüllerini kapsamaz. Sonraki yayınların kanıtı `kao2-duzeltme/evidence/*/YAYIN*.md`. |
| K3-07 | 07 §3 "ünite 5–7 ders, ders 4–6 kelime, ayrı ustalık dersi"; kart "~75 ders" | Gerçek: 109 ders, ünite başına 2–30 ders, ders başına 3–6 kelime, ustalık bayrağı içerikli son derste (G2 onaylı). 08 §7 "20–45" yerine kart "20–60". `MUFREDAT-ESLEME.md` "karar bekleyen/taslak" ifadeleri bayattır. |
| K3-08 | 08 §4 "handler sayacı tek doğruluk kaynağı, KAO2-12 sonrası yeni handler yasak, 40" | Gerçek geçmiş: 40 → 43 → 42 (KAO2). KAO2-FIX: +`kaoS0` (K2F-12), +`kaoSetIntent` (K2F-16), +`kaoToggleAutoAdvance` (K2F-30) → 45. KAO2-19/20 Dokun listesi dışında 18 dosyaya (app.js, index.html, sw.js, 11 tests/app pini) dokundu; ara kartlarda `?v=` değişti. |
| K6-06 | `tests/kao/README.md` envanteri | 28 `test_kao2_*`'den 26'sı eksikti; K2F-41'de envanter gerçek dosya listesine eşitlendi (37 dosya). |
| K7-01 | 04 D-12 "zaten biliyorsun" kognat turu | Hiçbir karta bağlanmadı, kodda yok; **bilerek ertelendi** (K2F-25, LEDGER seq 74). |
| K7-02 | 04 D-21 "T-hattı ünitelere bağlanır" | Hiçbir karta bağlanmadı, kodda yok; kapsam dışı, ayrı onay ister. |
