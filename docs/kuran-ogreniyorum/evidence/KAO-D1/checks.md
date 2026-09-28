# KAO-D1 · Dalga 1 denetimi

**Tarih:** 2026-09-26 · **HEAD:** `8145a2e` · **Kapsam:** KAO-01, KAO-02, KAO-03, KAO-04, KAO-23, KAO-24, KAO-25 · **Kod değişikliği:** yok

> Denetim, kartların kapanış anındaki değil **bugünkü** koddaki kontrollerini yeniden çalıştırır; sonraki kartların değişiklikleri de dahildir.

## Kart kontrolleri (yeniden çalıştırıldı)

| Kart | Kontrol | Exit | Son satır | Not |
|---|---|---|---|---|
| KAO-01 | `node tools/kao-lexicon-build.mjs --self-test` | 0 | KAO lexicon self-test: PASS (50 satır, çok-segment STEM POS, lemma paydası, besmele/vakıf/split hizası, Tanzil gövde kapısı, taslak kovaları |  |
| KAO-01 | `node tools/kao-lexicon-build.mjs --inputs kuran-ogreniyorum/content/inputs (girdi yoksa exit 2 ve açık mesaj)` | 0 | NOT: plan hedefi 77430, gözlenen 77429; stats.json ayrımı korur. |  |
| KAO-02 | `node tools/kao-lexicon-build.mjs --inputs kuran-ogreniyorum/content/inputs --draft → lexicon.draft.json (aday≈530, kova A/B/C/D raporu)` | 0 | WARN cognateTr dolu 385 kayıt ama B kovası 346 — bazı kognatlar çapa/parçacık kovasında (03 §9 önceliği: D > A > B > C) |  |
| KAO-02 | `node tools/kao-lexicon-build.mjs --review-md → lexicon.review.md` | 0 | KAO review: kuran-ogreniyorum/content/lexicon.review.md (524 satır) |  |
| KAO-02 | `node tools/kao-lexicon-build.mjs --import-md → lexicon.verified.json (doğrulanmış satır 0 → waiting_user)` | 0 | consistency=0 {} | dosya yazdı: kuran-ogreniyorum/content/lexicon.verified.json (yeniden üretim; commit edilmedi) |
| KAO-03 | `node tools/kao-lexicon-build.mjs --import-md → verified.json; verifiedBy boş satır = 0; consistency = 0` | 0 | consistency=0 {} | dosya yazdı: kuran-ogreniyorum/content/lexicon.verified.json (yeniden üretim; commit edilmedi) |
| KAO-04 | `node tools/kao-grammar-build.mjs --self-test` | 0 | KAO grammar self-test: PASS (korpus sorgusu, özne/nesne eki, geçmeyen biçim, aralık, şablon türleri, serpiştirme, Arapça sızıntı bekçisi, on | dosya yazdı: kuran-ogreniyorum/content/lexicon.verified.json (yeniden üretim; commit edilmedi) |
| KAO-04 | `node tools/kao-grammar-build.mjs --build → issues=0 (her kavramda ≥3 alıştırma şablonu, ≥2 tür; g0_5 mevcut)` | 0 | concepts=25 templates=86 examples=93 unit11Roots=73 unattested=26 issues=0 | dosya yazdı: kuran-ogreniyorum/content/lexicon.verified.json (yeniden üretim; commit edilmedi) |
| KAO-04 | `node tools/kao-grammar-build.mjs --import-grammar → verified=26/26, consistency=0; onay alanları dolu (06 §3, D-12)` | 0 | verified=26/26 unsigned=0 consistency=0 | dosya yazdı: kuran-ogreniyorum/content/grammar.verified.json, kuran-ogreniyorum/content/lexicon.verified.json (yeniden üretim; commit edilmedi) |
| KAO-23 | `28 harf; her B/C harfinde ≥1 minimal çift; 13 SVG ≤4 KB, fill=currentColor` | 0 | KAO content contract: PASS (E8 stüdyo: 13 SVG gömülü, 6 görev türü, FSRS + dikkat, sessiz mod; grammar=51353, surahs=83276, phonics=9552) | dosya yazdı: kuran-ogreniyorum/content/grammar.verified.json, kuran-ogreniyorum/content/lexicon.verified.json (yeniden üretim; commit edilmedi) |
| KAO-24 | `toplam ≤16 MB; .m4a; manifest klip sayısı = dosya sayısı; köken/lisans kaydı` | 0 | 1678 klip / 1678 dosya, 10.44 MB, köken kaydı tam | dosya yazdı: kuran-ogreniyorum/content/grammar.verified.json, kuran-ogreniyorum/content/lexicon.verified.json (yeniden üretim; commit edilmedi) |
| KAO-25 | `node kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test` | 0 | self-test 16/16 | dosya yazdı: kuran-ogreniyorum/content/grammar.verified.json, kuran-ogreniyorum/content/lexicon.verified.json (yeniden üretim; commit edilmedi) |

Ortak: plan-check → exit 0 (kao-plan-check: PASS (1 warn)); diff --check → exit 0.

