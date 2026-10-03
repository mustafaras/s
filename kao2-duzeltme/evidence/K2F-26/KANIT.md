# K2F-26 — Sûre bağlamı kaldırma
Tarih: 2026-10-03 · Dal: kao2-duzeltme · Önceki commit: d471fc53 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: M-02 (veri) · M-03 · R değişimi: yok (10/10 korunur)

## İlerleme günlüğü
- [x] P1: sync PASS (26/44, seq 76, pin 20261003c), dal kao2-duzeltme
- [x] Kırmızı test (reader: bağlam okuyucusu/surahs/yanlış atıf/ölü stil yok · 20/20 tanıtım kartı)
- [x] texts.tr.json + araç + modül + quranLearn.js + kao.css
- [x] A-5 gerçek ölçüm (render ile 20/20)
- [x] Kod incelemesi, kapılar, tekrar-uret, P4 kapanış

## Yapılan
- `texts.tr.json`: `surahs` (20 giriş: `contextTr`, `derivedFrom`, yanlış `review.sources`) ve yalnız onlara bağlı iki yanlış atıf anahtarı (`sources["diyanet-meal"]`, `sources["tdv-sure"]`) kaldırıldı. Metin yalnız `QuranRevelationOrderV1` alanlarından (isim, nüzul yeri, âyet sayısı, tema) türetilmişti ama Diyanet/TDV/Kahire mushafı kaynaklı gibi sunuluyordu (yanlış atıf).
- `tools/kao2-curriculum-build.mjs`: `surahs` bloğu ve çıktıdaki `surahs` alanı kaldırıldı → `quranCurriculumV2.js` yeniden üretildi (araç çıktısı; elle düzenleme yok).
- `app/core/quranLearn.js`: `kaoReaderContext` ve export'u kaldırıldı; okuyucu tanıtım kartı yalnız `QuranRevelationOrderV1`'den (nüzul yeri · âyet sayısı · kelime sayısı · tema) çizilir. Not: eski kod `curriculum.texts.surahs` okuyordu; modülde `texts` alanı hiç olmadığından bağlam zaten hiçbir zaman görünmüyordu (ölü kod).
- `app/core/quranLearn.js` (ikinci tüketici): "Hakkında ve kaynaklar" sürüm satırı `QuranCurriculumV2.surahs` uzunluğunu sayıyordu ("20 sûre bağlamı"); veri kalkınca "0 sûre bağlamı" yazacaktı — code-reviewer MEDIUM bulgusu, `grep contextTr/kaoReaderContext` taramasının kaçırdığı yer. Satır "KAO2 · metin katmanı" oldu + test (reader 14 kontrol).
- `app/kao.css`: ölü `.kao-reader-context*` kuralları kaldırıldı.
- Testler: `test_kao2_reader.js` (a) kontrolü gerekçeli değişti + yeni 20/20 tanıtım kontrolü; `test_kao2_kabul.js` A-5 hedefi "20/20 sûre tanıtımı: tema + yer + âyet sayısı" ve render ile ölçülür.

## TDD
- Kırmızı: `node tests/kao/test_kao2_reader.js` → `AssertionError: bağlam okuyucusu motordan kalkmalı`
- Yeşil: `node tests/kao/test_kao2_reader.js` → PASS (14 kontrol); `node tests/kao/test_kao2_kabul.js` → 10/10 PASS (A-5: 524/524 lemma · 25/25 kavram · 20/20 sûre tanıtımı, render ile)

## Kapılar (P3)
kapilar.sh: tests/kao 52 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · sync PASS — SONUÇ: TÜM KAPILAR YEŞİL
tekrar-uret: 10/10 PASS (önceki 10/10)

## Ölçümler
- Bütçe KÜÇÜLDÜ: içerik 185,235 → 183,544 KiB · runtime 113,511 → 113,209 KiB · css 13,639 → 13,613 KiB (tavanlar 256 / 128 / 14).
- Pinler değişmedi: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261003c (pin yükseltme YOK).
- A-5 artık gerçek render ölçümü: 20 sûrenin 20'sinde nüzul yeri + "N âyet" + tema görünür, `kao-reader-context` yok.

## Bilerek değişen testler
- tests/kao/test_kao2_reader.js: "(a) contextTr yalnız sourced/expert iken görünür" (kaoReaderContext varlığını bekliyordu) → "(a) K2F-26: sûre bağlamı kaldırıldı" + "(a) K2F-26: 20/20 tanıtım kartı" · bağlam özelliği bilerek kaldırıldı, koruyucu zayıflamadı (tanıtım kartı verisi artık 20/20 render ile sınanıyor) · M-02/M-03.
- tests/kao/test_kao2_kabul.js A-5: "sûre bağlamı hazır (contextTr varlığı)" → "sûre tanıtımı render ile 20/20" · hedef gerçek davranışı ölçer · M-02.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (değişen yayın varlıkları: quranCurriculumV2.js · quranLearn.js · kao.css; pin yükseltilmedi) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Kod incelemesi (`code-reviewer`): CRITICAL/HIGH 0, MEDIUM 1 (yukarıdaki gizli tüketici, kapatıldı), LOW 1 (A-5 eşiği: gerekçeli değişiklik, zayıflatma değil). Ders: silinen veri için yalnız alan adlarını değil, o nesnenin `.surahs` gibi genel okumalarını da tara (`QuranCurriculumV2&&…surahs`).
- Bağlam özelliği zaten ölü koddu (`curriculum.texts` yok); kullanıcıya görünür bir davranış değişikliği yoktur — kart önceki gibi tema/yer/âyet sayısını gösterir.
- Düzenleme yeni K2F-26 sonrası CSS payı 0,39 KiB'a çıktı (14 − 13,613).
