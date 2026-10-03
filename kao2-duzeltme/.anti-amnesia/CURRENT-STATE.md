# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-25
lastSeq: 69
status: active
-->

Son güncelleme: 2026-10-03 · LEDGER seq 69 · K2F-00…24 tamam (25/44), sıradaki K2F-25. R-01…R-10 PASS (10/10).

## Şu an neredeyiz
K2F-24 bitti (yalnız kaynak/test; **yayında DEĞİL**, pin yükseltilmedi): namaz metinlerindeki `lp_*` kelimeleri araçla öğretilen `l_*` lemmalarına muhafazakâr belirlenimci eşlemeyle bağlandı — 30 benzersiz kelimeden 18 eşlendi, 12'si eşlenmedi (11 aday yok, 1 birden çok aday: `lp_c7d096cadc`). `applyWords` durumu eşlenen lemmadan türetir (`mappedLemmaId`), tanış kartı çapası eşlenen kelimeyi bulur, Ünite 2'nin u02.02 ve u02.03 dersleri `examples` yerine `prayer:tahiyyat` çapasına bağlandı (u02.01 `tekbir` kaldı). Eşleşmeyenler `docs/kuran-ogreniyorum/kao2/inceleme/NAMAZ-ESLEME-L2.md`'de. K2F-23 sabiti 97 → 95 ders. tekrar-uret 10/10, tüm kapılar yeşil.
**YAYINDA (2026-10-03, K2F-23 sonrası):** K2F-19…23 + ek turlar canlı — `main` `b25ee012`, pin `20261003a`; K2F-24 canlıda yok. Cihaz doğrulaması kullanıcıda.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-25 (Tanış kartı katmanları):** tanış kartına doğrulanmış örnek âyet ve katlanabilir "Neden böyle?" ekle (`quranLearnViews.js` intro aşaması, `quranLearn.js` intro modeli, `app/kao.css`, `test_kao2_lesson_flow.js`).

## Canlı gerçekler (araçla ölçüldü, 2026-10-02)
- Dal: `kao2-duzeltme` = canlı `main` (`b25ee012`) + belge commit'leri + K2F-24 (yayınlanmamış: `quranLearnFlow.js`, `quranCurriculumV2.js`). Sonraki push yalnız kullanıcı isteğiyle / K2F-43 kapısında.
- Yayın pini (canlı): `20261003a` · `App.kao*` 44 · App yüzeyi 765 · atama 603 · `onclick` 393.
- Kapılar (K2F-24 sonu): KAO 52 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **10/10 PASS**.
- Bütçe (perf): içerik 185,223 KiB (tavan 256) · runtime 112,810 KiB (tavan 128) · css 13,605 KiB (tavan 14) · müfredat modülü gzip 21,9 KB (tavan 48 KiB).
- Namaz eşlemesi: 18/30 `lp_*` eşlendi; Ünite 2 odak lemmalarından namaza bağlananlar suboHa_n, sala_m, Tay_iba_t, baraka_t, raHomap, rasuwl.
- Metin durumu: üniteler 12/12 · dersler 109/109 · S0 12/12 · kavramlar 25/25 sourced; sûre tanıtımı (`surahs`) 20 draft (KR-5'te kaldırılacak).

## Açık riskler
- **Namaz eşlemesi yalnız eşit iskelette çalışır:** çekim/çoğul/fiil (aşhadu, salavât, tahiyyât, ʿibâd…) bilerek eşlenmedi → `NAMAZ-ESLEME-L2.md`; gerçek uzman bakışı tavsiye edilir. Üretici araç `INCELEME-KAO2-17/18` onay kutularını sıfırlar: araç çalıştırınca bu iki dosyayı `git checkout` ile geri al.
- **Gerçek L2 uzman onayı yok:** dinî bağlamlı metinlerin onayı kullanıcı devriyle yapay zekâ incelemesidir; L2 kutularına dokunulmadı. Gerçek uzman kontrolü tavsiye edilir.
- g14-k2 çeldiricileri ("gelecek zaman/olumsuzluk/emir anlamı") genel yanlış seçeneklerdir, doğrulanmış veri değildir.
- Üretici sayfayı yeniden yazınca inceleme kutuları sıfırlanır (elle yeniden işlenmeli); araç işaretsiz eski `sourced`'u `draft`'a düşürmez.
- Seviye 0 zinciri ve Uygula cümleleri canlıda/cihazda gözle doğrulanmadı (kullanıcıda).
- Canlıda R-07 ve R-08 kapandı (yayın doğrulandı); cihaz doğrulaması kullanıcıda.
- Sonraki yeni handler K2F-30 (`kaoToggleAutoAdvance`) pinleri 45/766/604'e kaydırır — P8 listesine göre aynı committe.
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı (aralık 30; 45 simüle günde 0 hata).
- `tests/kao/README.md` envanterinde 24 test dosyası yok (K2F-41).
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)`/`plain()` kullan.
- Draft durumunu sınayan testler için `tests/kao/helpers/kao-harness.js` `legacyDraftState` (gerçek veride draft kalmadı).

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kalan kapı: K2F-43 YAYIN-2. (Gerçek L2 uzman onayı kullanıcı kararıdır.)
