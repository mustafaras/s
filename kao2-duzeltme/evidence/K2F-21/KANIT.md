# K2F-21 — Ders metinleri ve inceleme sayfası
Tarih: 2026-10-02 · Dal: kao2-duzeltme · Önceki commit: 6b42c9f6 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K5-03 (3/3) · K5-04 (1/2) · M-01 (veri tarafı) · R değişimi: yok

## İlerleme günlüğü
- [x] P1: sync PASS, nextPrompt K2F-21, G2 onaylı (LEDGER seq 58)
- [x] yeniden yazılacak küme: K2F-20'de taşınan 26 ders ∪ kapıya takılan 13 ders = 35 ders
- [x] 35 metin (title/goal) dersin gerçek lemma anlamlarından yazıldı: `review {level:draft, by:null, l0:pass, at:2026-10-02}`
- [x] araç: lint `by:null` yalnız `draft`; inceleme sayfası "Sana düşen" talimatı + "Yeniden yazılan metinler" + "Yeniden onay gerekli" bölümleri; iki üretim bayt-eşit
- [x] bağımsız denetim (3 bakış + çürütme): 27 ajan, 8 bulgu doğrulandı / 16 aday reddedildi → hepsi işlendi
- [x] kapilar.sh YEŞİL

## Yapılan
- `texts.tr.json`: 35 ders metni yeniden yazıldı (sıcak, sen dili, emir yok, kısa); kategori adı yalnızca dersin lemmaları taşıyorsa geçer.
- `tools/kao2-curriculum-build.mjs`: lint kuralı, KR-4 inceleme sayfası bölümleri, g2Decisions düzeltmesi.
- `INCELEME-KAO2-17.md`: 133 metin, 35 `draft` (görünmez), 98 `sourced` (açık kutu onayı yok → "Yeniden onay gerekli"); kullanıcıya talimat sayfanın başında: "kutuyu [x] yap, sonra 'L1 işaretlendi' yaz".
- **Bağımsız denetimin bulduğu yüksek önemli kusur düzeltildi:** draft ders başlığı/hedefi ünite ekranında, ders oynatıcıda ve hub kartında ham olarak GÖRÜNÜYORDU (35/35 ders). `quranLearn.js` (`kaoSafeLessonTitle`, 3 nokta) ve `quranLearnFlow.js` (`safeLessonTitle`) artık güvenli başlığı ("Ünite N · Ders M") kullanır. [Dokun listesi dışı: K2F-21 adım 3 "draft metin görünmez" kabulü için zorunluydu — LEDGER seq 61.]
- Kapı: `CONCEPT_EXEMPT` (6 gerekçeli kavram muafiyeti, dürüstlük testiyle), `şart` regex'i kelime sınırlı ('değerli' içindeki 'eğer' sayılmazdı), ANLAM Türkçe düzeltme işaretlerini katlar, yardımcı fiil kümesi kâna+leyse+asbaha (önceki "leyse yok" iddiası YANLIŞTI, düzeltildi).

## Ek tur — K2F-16…21 bağımsız tarama (LEDGER seq 63)
- 4 denetçi (kod · test · kayıt · veri güvenliği), 20 ajan: 10 bulgu doğrulandı, 6 aday reddedildi; hepsi işlendi (carryOver sıradaki dersle sınırlandı, araç yol kırılganlığı, fixture lisansı ve pinleri, SKIP≠PASS, tautoloji, KR-4 testi, kayıt hizası).

## TDD
- Kırmızı: `node tests/kao/test_kao2_text_review.js` (sızıntı testi) → AssertionError: u08.01 ünite ekranında ham başlık sızdı / hub mutasyonu: "u02.01: hub kartında ham başlık sızdı"
- Yeşil: aynı komut → PASS (10 kontrol); hub düzeltmesi geri alınınca test kırılır (mutasyonla doğrulandı)

## Kapılar (P3)
kapilar.sh: SONUÇ: TÜM KAPILAR YEŞİL (tests/kao 51 · app 77 · panel 23 · panel-v2 27 · quran 9 · fix-sync PASS) · perf: content 184,939 KiB · runtime 111,351 KiB · css 13,560 KiB
tekrar-uret: 9/10 PASS (önceki 9/10)

## Ölçümler
| Ölçüm | K2F-19 sonu | K2F-20 sonu | K2F-21 sonu |
|---|---|---|---|
| ETİKET | 18 | 11 | 0 |
| ÖRNEK | 11 | 2 | 1 (u07.01 %58) |
| ANLAM | 1 | 1 | 0 |
- Görünürlük: 35 ders metni `draft` → ders adı "Ünite N · Ders M" (K2F-22'de kullanıcı onayıyla sourced olur).
- Kalan tek kapı kaydı: u07.01 (örneklerin %58'i geçmiş; kavram g13 kip aradığı için metinle düzelmez).

## Bilerek değişen testler
- test_kao2_text_review.js: (e) `by:null` yalnız draft'ta geçerli; yeni sızıntı testi
- test_kao2_lesson_coherence.js: listeler 11/2/1 → 0/1/0; CONCEPT_EXEMPT; yardımcı fiil kümesi 3; regex ve katlama düzeltmeleri · gerekçe: K2F-21 metinleri

## Kanıt düzeyleri
- Kaynak/test ✓ · Yayın yok (değişen yayın varlıkları: quranCurriculumV2.js, quranLearn.js, quranLearnFlow.js) · Cihaz yok

## Sürprizler / sonraki promptlara not
- K2F-20 sunumunda "leyse sözlükte yok" yanlıştı (leyse u08.03'te); karar (metin yeniden yazımı) değişmedi çünkü üç yardımcı fiil iki derse yetmez ve kâna donuk Ünite 3'te.
- u07.01: örnek seçimi kipe göre yapılırsa kapanır (ayrı karar).
- K2F-22 (kullanıcı kapısı): `INCELEME-KAO2-17.md` kutuları.
