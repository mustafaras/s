# KAO-D1 · Dalga 1 denetimi

**Tarih:** 2026-09-26 · **HEAD:** `8145a2e` · **Kapsam:** KAO-01, KAO-02, KAO-03, KAO-04, KAO-23, KAO-24, KAO-25 · **Sonuç:** `findings` · **Kod değişikliği:** yok

## Denetim maddeleri

| # | Madde | Durum | Kanıt |
|---|---|---|---|
| 1 | Kart kontrolleri bugünkü kodda yeniden çalıştırıldı | ✓ | 12/12 exit 0 (aşağıdaki tablo); --import-md/--draft yeniden üretimleri yalnız importedAt tarihini değiştirdi, geri yazıldı |
| 2 | Dalga 1 sırasında üretim dosyası değişmedi (git diff main -- app …) | ✓ | Dalga 1 commit'leri (aşağıdaki çapa) app/, app.js, index.html, sync.js, panel/ yollarına dokunmaz; bugünkü main karşılaştırması sonraki dalgaları içerdiği için tarihsel commit'ler üzerinden doğrulandı |
| 3 | Arapça dizgi elle yazılmadı; kaynak alanı dolu; verifiedBy boş = 0 | ✓ | lexicon.verified.json 524/524 verifiedBy dolu, examplesRef/kaynak alanları dolu; phonics verified (D-12, 28 harf / 12 çift / 7 kural); grammar consistencyTotal alanı mevcut |
| 4 | Kova raporu ve kapsam ≥0,78 | ✗ | Kovalar D 63 · A 22 · B 346 · C 93; token kapsamı 0,7742 (59.948 / 77.430) — ≥0,78 hedefinin altında. test_kao_lexicon_coverage bunu 'müfredat ~%80 hedefi yaklaşık; doğrulanmış 524 lemma %77,42' diye belgeler |
| 5 | Komşu/kalıp etiketleri doğrulanmış (proposed:false) | ✗ | semNeighbors ve cognate öneri kapları 524/524 proposed:true. Ekranda gösterilen alanlar ayrıca doğrulanmış (tr1/tr2, cognateTr/cognateShift); kuyruk komşu önerilerini yalnız yeni kartları aralıklandırmak için kullanır (yanlış içerik göstermez, en kötü durumda gereğinden fazla aralık) |
| 6 | Ses D-08/D-09 kaydı | ✓ | KAO-24 gateApproval: user, 2026-09-23 (D-08 kaynak, D-09 16 MB alt küme); manifest 1678 klip = 1678 dosya, 10,44 MB, köken kaydı tam |
| 7 | Ledger seq kesintisiz | ✓ | 1 → 93 arası boşluk yok |
| 8 | Her kartın EVIDENCE.json + HANDOFF.md var; diffHash gerçek | ✓ | 30/30 kartta iki dosya var. diffHash alanı erken kartlarda farklı adla (head/startHead/diffHashBeforeEvidence) ya da hiç tutulmamış; bağlayıcı çapa olarak her kartın 'KAO-xx:' commit'leri aşağıda listelendi |
| 9 | Bulunan araç hatası | ✓ | kao-plan-check öz-testi 15/16 idi (kapılı kart senaryosu gerçek STATE'teki KAO-24 onayını taşıyordu) → 8145a2e ile düzeltildi, 16/16 |

**Bulgular (2):** Kova raporu ve kapsam ≥0,78; Komşu/kalıp etiketleri doğrulanmış (proposed:false). İkisi de içerik kararıdır ve kart geri çekilmedi: kapsam hedefi yaklaşık olarak tanımlanmış ve belgelenmiş; öneri kapları gösterilen içeriği etkilemiyor. Kapanış belgesinde açık karar olarak listelenir.

## Kart commit bağları (kanıt çapası)

| Kart | Commit(ler) |
|---|---|
| KAO-01 | `f1e89d7` KAO-01: Tanzil bütünlük kapısını onar (gövde hash + yapısal kontrol)<br>`3113d3c` KAO-01: tam korpus hizalamasını düzelt<br>`544d245` KAO-01: ağsız sözlük derleyicisini ekle |
| KAO-02 | `5c4d4f0` KAO-02: D-13 — 3'ten az örnekli lemmaya aynı kökten Kur'an örneği<br>`1069a5b` KAO-02: araç düzeltmesi — transliterasyon, taşıma, D-12 onayı, alan dene<br>`fc0a2ea` KAO-02: 06 §2 kopya bekçisi — kural artık makineyle zorlanıyor<br>`0bee8e1` KAO-02: referans kapsamı tüm Kur'an (%100 aday) + şeddeli glide düzeltme<br>`a7c40a2` KAO-02: quran.com Türkçe kelime-kelime REFERANS katmanı (06 §2)<br>`1cf82a0` KAO-02: workbook'a mekanik transliterasyon + kök eklendi<br>`18a7508` KAO-02: kök neden düzeltmesi (POS kapısı) + seviyeli cümle bağlamlı çalı<br>`3632034` KAO-02: D-11 kararı (sıra eşiği 600) + kalan 10 karar — ölçümle kapatıld<br>`b922729` KAO-02: sertleştirme — bağımsız denetimde bulunan 7 kusuru kapat<br>`f6964fc` KAO-02: aday liste, kognat/komşu önerisi ve inceleme tablosu |
| KAO-03 | `71e759c` KAO-03: D-13 — 11 kök akrabası örneği çevrildi; 5 kalıcı istisna<br>`392a6b7` KAO-03: içerik düzeltmesi — kalıp sözlüğü, kognat denetimi, tefsir temiz<br>`f5d75cc` KAO-03: 524 lemma dolduruldu ve içe alındı (verified=524, kopya 0)<br>`92bb336` KAO-03: kademeli inceleme yolu — 63 kelime KAO-05'i açar<br>`991e981` KAO-03: kullanıcı görevi için devir paketi (arada durum: waiting_user) |
| KAO-04 | `9ca2b3a` KAO-04: gramer içeriği — 25 kavram, 86 şablon, Ünite 11 (73 kök) |
| KAO-23 | `833b5ef` KAO-23: fonetik içerik ve mahreç şemaları |
| KAO-24 | `62551fc` KAO-24: doğrulanmış ses alt kümesini üret |
| KAO-25 | `8145a2e` KAO-25: öz-test kapı senaryosu onayı siler (16/16)<br>`aee9ec2` KAO-25: plan denetleyiciyi sertleştir |

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


