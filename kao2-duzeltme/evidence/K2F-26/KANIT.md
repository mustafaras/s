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

## Ek tur (cihaz bildirimi: Arapça sekmesinde "Ders alanı şu an görünmüyor", 2026-10-03 · LEDGER seq 78)
- Belirti: kullanıcı canlı sitede Arapça sekmesinde başlama düğmesi yerine yedek mesajı gördü (iki ekran görüntüsü, masaüstü Chrome).
- Kök neden (kodla ve gerçek önyükleme harness'iyle ölçüldü): `saygi.js` düğmeyi `kaoHubCardHTML()`'den alır; kart yalnız `settings.kaoVisible===false` iken boş döner. Hub modeli taze/tohumlu/9 ders tamamlanmış durumlarda hata atmadı; gerçek önyüklemede düğme çıktı (`kao-hub-entry`). Yani kullanıcı verisinde "İlham & İbadet'te kartı göster" kapalıydı. K2F-25/26 değişiklikleri hub koduna dokunmadı (neden değil).
- Tasarım kusuru: IIP Arapça taşıması (KAO kartı Bugün'den kalktı) sonrası Arapça sekmesi KAO'ya TEK giriş; gizliyken mesaj yanıltıcı ("yeniden aç") ve çıkış yolu yok (geri getirme yalnız uygulama Ayarları → Gizlenen kartlar'daydı).
- Düzeltme (`app/core/quranLearn.js` `kaoHubCardHTML`): gizliyken ve `ui.faithTab==='arapca'` ise aynı düğme geri getirme kartı olur ("Ders kartı gizli · Göster", mevcut `App.kaoToggleVisible()`); başka sekmelerde kart gizli kalır (eski sözleşme: `kaoHubCardHTML()===''`). Yeni handler yok; tek `onclick` şablonu (fx2 tıklama pini 393 değişmez — ilk denemede ikinci `onclick` literali pini 394'e kaydırıp 4 app testini kırdı, şablon birleştirilerek giderildi).
- TDD: KIRMIZI `node tests/kao/test_kao2_hub.js` → `AssertionError: geri getirme kartı yok`; YEŞİL 10 kontrol (+1: gizliyken yalnız Arapça sekmesinde kart, tek handler, geri getirince `kao-hub-entry`). Gerçek önyükleme (zikr-harness kopyası): varsayılan entry ✓ → gizle: restore ✓, "unavailable" yok → geri getir: entry ✓.
- Dürüst sınır: kullanıcının tarayıcı verisini okuyamadım (tarayıcı/oturum kuralı); `kaoVisible=false` kodla ulaşılabilen tek boş-dönüş yolu olduğu için çıkarım güçlü ama kullanıcı doğrulaması bekliyor. Düzeltme yayınlanmadan canlıda etkisiz.

### Ek tur 2 — hub düzeltmesinin bağımsız kod incelemesi (LEDGER seq 79)
- `code-reviewer` (56d511ef): CRITICAL/HIGH 0 · MEDIUM 2 (a11y) · LOW 1 → hepsi kapatıldı. Gizli değilken çıktının bayt bayt eşdeğer olduğu doğrulandı; `ui()` null riski yok; fx2 tıklama pini korunuyor (tek `onclick` literali).
- (M) Geri getirme düğmesi `aria-haspopup="dialog"` taşıyordu (dialog açmıyor, ayarı değiştiriyor → ekran okuyucu yanlış duyurur): yalnız ders girişinde yazılır. KIRMIZI `test_kao2_hub.js` → `geri getirme düğmesi dialog açmaz; aria-haspopup yanlış duyurur`.
- (M) Geri getirince düğme başka id'li düğmeyle yer değişiyor, odak kayboluyordu: `kaoToggleVisible` Arapça sekmesinde geri getirme sonrası `restoreFocus('kao-hub-entry')` çağırır (mevcut yüzey bağımlılığı, yeni handler yok). KIRMIZI `test_kao2_lesson_flow.js` → `odak ders girişine dönmedi`; YEŞİL lesson_flow 23 kontrol (+1).
- (L) Gizli dalda `typeof views.hubCard==='function'` koruması geri eklendi (yedek metin).
- Gerçek önyükleme provası: varsayılan entry ✓ → gizle: restore ✓ (aria-haspopup yok) → geri getir: entry ✓; "Ders alanı şu an görünmüyor" hiçbir durumda yok.
- Dürüst sınırlar: odak davranışı gerçek tarayıcıda gözlenmedi (kural: tarayıcı yok; sahte yüzeyle sınandı); saygi.js uçtan uca metin testi yalnız headless prova olarak yapıldı, kalıcı fixture değil.

### Ek tur 3 — açıkların kapatılması ve yayın (LEDGER seq 80)
- Kalıcı uçtan uca fixture: `tests/kao/test_kao2_arabic_tab.js` (saygi.js + gerçek KAO hub kartı; 4 kontrol: görünürken tek giriş · gizliyken geri getirme kartı ve yedek mesaj yok · gizliyken diğer sekmelerde kart yok · dokununca giriş döner). Mutasyon kanıtı: `faithTab` şartı kaldırılınca `geri getirme kartı yok` ile kırmızı. `tests/kao/README.md` envanterine satır eklendi.
- Kapatılamayan açıklar (dürüstçe): gerçek tarayıcıda odak davranışı (tarayıcı kuralı) ve kullanıcının cihaz verisi teşhisi (veri okunamaz) — cihaz doğrulaması kullanıcıda.
- Yayın: `YAYIN.md` (pin `20261003d`, `main` `dc3f3f06`, run 37128484796).
