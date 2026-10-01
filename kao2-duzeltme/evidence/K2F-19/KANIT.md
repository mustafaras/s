# K2F-19 — Ders tutarlılık kapısı (test)
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: 27d8d6df · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K5-03 (1/3) · R değişimi: yok

## İlerleme günlüğü
- [x] P1: sync PASS, nextPrompt K2F-19
- [x] test yazıldı, KNOWN_MISMATCH boşken kırmızı görüldü
- [x] KNOWN_MISMATCH tam liste, yeşil
- [x] README satırı, kapilar YEŞİL

## Yapılan
- `tests/kao/test_kao2_lesson_coherence.js`: 20 kategorili sözlük (başlık/hedef anahtar sözcüğü → lemma yüklemi, gerekçeli), eşik %60, 14 denetlenebilir kavram kategorisi (g3 g4 g6 g7 g9 g13–17 g19 g20 g22 g23). Başlık/hedef bir kategori anıyorsa ve kavramın kategorisi varsa her ikisi de eşiği geçmeli.
- Üretim kodu değişmedi (ek tur 2'de de: araç + fixture + testler).
- Ek tur (bağımsız 3 denetçi + çürütme, 6 bulgu doğrulandı, 7 aday reddedildi): `fiil` regex'i çekimli biçimleri (fiillerini/fiilini) kaçırıyordu → düzeltildi (+ geçmiş/şimdiki/geniş zaman → V); `ancak` yüklemi RET (idrâb harfi 'bal') saymıyor, yalnız EXP; yeni `bağlaç` (CONJ/AMD/EXL) ve `yardımcı fiil` (anlamı oldu/idi/değil/sabahladı olan V) kategorileri; g14 ve g23 kavramları yardımcı-fiil yüklemine bağlandı (g23 yanlışlıkla zarf-T'ydi); `zaman` kategorisi yalnız 'zaman kalıpları'; liste çıtası eklendi.

## Ek tur 2 — bilimsel kip/anlam ölçümü (kullanıcı isteği: "emir etiketi yok" ve "kapı anlamı ölçmüyor" sınırları)
- **Kaynak:** Quranic Arabic Corpus 0.4 (Dukes & Habash 2010; GPL) — yerel girdi `docs/kuran-ogreniyorum/content/inputs/` (gitignore). Etiket tanımları resmî belgeden doğrulandı: PERF/IMPF/IMPV fiil kökü aspect özellikleri (corpus.quran.com/documentation/morphologicalfeatures.jsp), `l:IMPV+` emir lâmı önek özelliği AYRIDIR (sayılmaz), VOC seslenme edatı (…/tagset.jsp).
- **Araç:** `tools/kao2-lemma-morph-build.mjs --write|--check` → `tests/kao/fixtures/qac-lemma-morph.json` (123 KB, 524 lemma × {perf, impf, impv, voc, total, ilk 3 örnek âyette aynı sayımlar}; sha256 girdi kaydı; bayt-eşit üretim doğrulandı; lemma anahtarı sözlük yapım kuralıyla aynı: ilk LEM, yoksa parça biçimleri). Uygulama, içerik modülleri, bütçe ve yayın pini DEĞİŞMEDİ.
- **ETİKET:** emir/geçmiş/şimdiki/seslenme artık veriden: ders lemmalarının ≥%60'ı hedef kipi Kur'an'da kullanıyor mu. Sonuç: u09.01 (emir) etiket düzeyinde GEÇER (4/5 lemma emirle kullanılır) ve ETİKET listesinden çıktı; u09.02 (seslenme %0) ve u09.11 (emir %33) kalır.
- **ÖRNEK (yeni ölçüm):** öğrencinin gördüğü örnek âyetlerin ≥%60'ında hedef kip geçmeli. 11 ders tutmuyor: u07.01 %58 · u07.03 %13 · u07.04 %53 · u07.06 %53 · u07.09 %42 · u08.01 %47 · u08.02 %40 · u08.09 %44 · u09.01 %40 · u09.02 %0 · u09.11 %0 — yani "Emir kipi" dersinin örneklerinin yalnız %40'ı gerçekten emir.
- **ANLAM (yeni ölçüm):** 82 tematik dersin başlık sözcükleri lemma anlamlarında (Türkçe mastar/çoğul atılmış 3–4 harf kök-önek) aranır; özet dersler (hedefte pekiştireceksin/baştan sona/birlikte) kapsam dışı. 1 ders tutmuyor: u06.20 (topluluk≈grup eşanlamlısı; yöntem sınırı, listede notlu).
- **Bağımsız doğrulama turu (2 denetçi + çürütme, 4 bulgu doğrulandı / 5 aday reddedildi):** fixture sayımları ham QAC'a karşı bağımsız betikle yeniden hesaplandı: kip (PERF/IMPF/IMPV/VOC) ve örnek sayımlarında fark çıkmadı; yalnız `total` tanımı belgelenmeliydi (ilk-LEM kuralı; sözlük freq'i ile 524/524 birebir eşit — artık testle kilitli, araç açıklaması düzeltildi, fixture yeniden üretildi). Gerçek kapı bulguları düzeltildi: (1) "bir kökten/kök ailesi" dersleri kök tutarlılığı ölçülmüyordu → KÖK ölçümü eklendi (u10.20 %25, u11.01 %50 yakalandı; ETİKET 16→18); (2) "özet ders" muafiyeti regex'i gerçek dersleri de muaf bırakıyordu → gerekçeli kimlik tablosuna (u01.05, u02.03, u03.06, u06.30) indirildi; (3) çıta artık liste uzunluğuyla birebir eşit, "denetimdeki 10 ders" kontrolü FIXED_SINCE_AUDIT kaydıyla onarımı cezalandırmaz hâle getirildi.
- **Sınır (dürüst):** ANLAM ölçümü kök-önek örtüşmesidir; ÖRNEK sayımı âyet düzeyindedir (kelime konumu yok; 1563 örneğin 39'unda aynı lemma karışık kipli); eşanlamlı ve mecaz ölçmez. ÖRNEK ölçümü örnek seçiminin kipe uyumunu ölçer, çeviri doğruluğunu değil. Her iki liste yalnız küçülür.

## TDD
- Kırmızı: `node tests/kao/test_kao2_lesson_coherence.js` (KNOWN_MISMATCH=[]) → AssertionError: bulunan: ["u02.01","u02.02","u03.02","u04.01","u04.02","u09.01","u09.02","u09.11","u10.01","u10.03","u11.04","u11.05","u12.02","u12.03"]
- Yeşil: aynı komut → PASS (5 kontrol · bilinen tutarsız 17/109; ilk tur 4 kontrol · 14/109)

## Kapılar (P3)
SONUÇ: TÜM KAPILAR YEŞİL (kapanışta)
tekrar-uret: 9/10 PASS (önceki 9/10)

## Ölçümler
- Tutarsız ders: 17/109 (ilk tur 14; ek turda +u04.03, u04.04, u07.02). K5-03'ün 10 dersinin 10'u yakalandı (u02.01 u02.02 u04.01 u04.02 u09.01 u09.02 u10.01 u11.04 u11.05 u12.02).
- Ek 4 ders (kapı yeni buldu): u03.02 (Olumsuzluk ↔ NEG lemması yok), u09.11 (Emir ve dua kalıpları), u10.03 (Daha iyi bilen ↔ tafdîl %20), u12.03 (Şart ve zaman kalıpları ↔ COND yok). Ek turda: u04.03 (bağlaç %40), u04.04 (bağlaç %20), u07.02 (yardımcı fiil dersi, kâna u03.02'de; %0).

## Bilerek değişen testler
- yok

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok

## Sürprizler / sonraki promptlara not
- Sözlükte emir/geçmiş/şimdiki ve seslenme etiketi yok: "emir" kategorisi her zaman tutmaz sayılır (u09.01, u09.11), seslenme anlamı "ey" ile başlayan lemmalardan denetlenir. Fiil derslerinde yalnız pos=V aranır (zaman ayrımı ölçülemez). "Olumsuz şimdiki zaman" (u08.02) fiillerin olumsuzlanmasıdır; lemma etiketiyle ölçülemediği için kapsam dışı bırakıldı.
- K2F-20 yeniden dağıtımda bu listeyi boşaltmalı; emir kipi derslerini boşaltmak için emir etiketli lemma gerekir (içerik/veri kararı).
