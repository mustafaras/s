# KAO2-02 — Tasarım sözleşmesi fixture'ı (taban modu)
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: c89c3b4

## Yapılan
- tests/kao/test_kao2_design_contract.js eklendi; tests/kao/README.md envanteri güncellendi. Üretim kodu, CSS, içerik, pinler ve handler yüzeyi değişmedi.
- Canlı CSS yorumlardan arındırılarak taranır: ağırlık değer kümesi, uppercase bildirimi, boş content taşıyan dekoratif before/after seçicileri, Iowan Old Style kullanımı ve 06 §4'teki 13 adlandırılmış seçici.
- Boş/tohumlu iki yeni VM; sabit saat ve modüllerden türetilen sentetik 12 lemma ×2 yön ilerlemesi. Gerçek ağ/timer/depo/tarayıcı yok; save çağrısı hata üretir. İkon stub boş; hedef DOM sınıf/semantik sözleşmesidir, görsel test değildir.
- 12 görünüm (home, units, word, reader, settings, gate, phonics, ayah, map, prayer, stats, session) ×2 durum =24 canlı overlay. Session için gerçek görev kurucusunu tetikleyen sentetik kuyruk girdisi var. Hazır HTML dökümleri okunmaz.
- Her iki veri durumunda beş ayar hem açık hem kapalı render edilir (20 kontrol). Anahtar rolü ve aria-checked durum eşliği ölçülür.
- const MODE = 'baseline': mevcut ihlalleri sabit değerlerle karşılaştırır. strict modunda ağırlıklar yalnız 400/500/600/700 ve en çok4; uppercase/deco/serif/13 seçici yok; birincil eylem ≤1; switch semantiği gerekli.
- CSS tarayıcısının yorum yok sayma, birleşik sözde seçici sayma, içerik taşıyan sözde öğeyi ayırma ve sınıf-adı sınırı kontrolleri aynı fixture'da bulunur.

## TDD
- İlk yazımdaki reduce parantez syntax hatası düzeltildi; bu kurulum hatası TDD davranış kanıtı sayılmadı.
- Anlamlı kırmızı: const MODE='strict', node tests/kao/test_kao2_design_contract.js → exit1 `strict tasarım ihlalleri`: weights, uppercase, deco, serif, removed selectors, switch semantics.
- Ölçülen mevcut değerler sabitlenip baseline moduna geçildi → exit0 PASS. Baseline ve strict aynı ölçüm fonksiyonlarını kullanır; üretim tasarımı değiştirilmedi.
- Son strict denemesi strict-red.log içinde; ardından dosya baseline'a geri alındı, baseline-green.log PASS. Kalıcı fixture baseline'dır.

## Kapılar (P3)
| Kapı | Sonuç |
|---|---|
| P3 syntax app.js/sync.js/quranLearn.js/quranLexiconV1.js/lexicon üreticisi | 5 PASS |
| KAO | 19/19 PASS |
| app | 77/77 PASS |
| panel | 23/23 PASS |
| panel-v2 | 27/27 PASS |
| quran | 9/9 PASS |
| reminder smoke | PASS, 21 curated fixture |
| driver | PASS |
| zikr harness | 95/95 PASS |
| kontrast | 336 çift, 0 ihlal |
| eski kao-plan-check | PASS, 3 mevcut WARN |
| yeni fixture syntax | PASS |
| kao2-sync-check | PASS: 3/28 done, next KAO2-03, seq11 |

Tam P3 koşusu 164/164 exit0; gate-receipts.json komut ve çıktı hash/son satırlarını taşır. Henüz olmayan Flow/Views/Curriculum koşullu syntax adımları uygulanamaz. Eski plan uyarıları iki taban öncesi commit ve değişmemiş MediaRecorder/save kaynak uyarısıdır; yeni FAIL yok.

## Ölçümler
- Ağırlık: 9 (600,700,750,760,780,800,850,900,950).
- Uppercase: 4; boş dekoratif sözde seçici: 5; serif: 3.
- 06 §4 adlandırılmış kaldırılacak seçicilerin 13/13'ü mevcut. Boş sözde öğe sayımı bildirim kurallarındaki seçici sayısıdır; gerçek DOM örnek sayısı değildir.
- Her iki veri durumunda primary: home1, units0, word1, reader1, settings0, gate0, phonics1, ayah1, map0, prayer0, stats0, session0. Hiçbir ölçülen görünümde >1 yok.
- Settings açık/kapalı: her senaryoda 5 kontrol/5 eksik switch semantiği; toplam 4 senaryo. aria-pressed kullanımı switch kabulü sayılmaz.

## Bilerek değişen testler
Mevcut testler değişmedi/zayıflatılmadı. Yeni baseline testi 0 ihlal iddiası taşımaz: tam bugünkü değerleri kilitler; beklenmedik artış ve azalışı yakalar. Strict'in FAIL vermesi bu kartın açık kabul koşuludur, üretim hatasını gizleme değildir. KAO2-03 kendi kapsamında strict'e geçişi yapacak; HTML semantiği için o kartın açık todo istisnası bu kartta uygulanmadı.

## Kanıt düzeyleri / kalan sınırlar
Kaynak/test: PASS (baseline), hedef tasarım strict: beklenen FAIL. Yayın: yok. Cihaz: yok. Tarayıcı/sunucu/push/deploy/tag/main merge yok. Bu test kontrastı veya gerçek ölçülmüş hub yüksekliğini ikame etmez; kontrast ayrı P3 kapısı, cihaz/görsel kabul ayrıdır.
Bu kart için bekleyen karar yok. Önceki Ausubel teyit notu ve ileriki G2/G3/K-3/L2 kararları korunur. KAO2-03'e başlanmadı.
