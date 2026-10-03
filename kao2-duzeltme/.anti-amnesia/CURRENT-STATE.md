# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-24
lastSeq: 67
status: active
-->

Son güncelleme: 2026-10-02 · LEDGER seq 67 · K2F-00…23 tamam (24/44), sıradaki K2F-24. R-01…R-10 PASS (10/10).

## Şu an neredeyiz
K2F-23 bitti: 109 dersin 109'unda "Uygula" adımı içerikli (97 ders doğrulanmış örnek cümle, 12 ders çapa metni); R-08 PASS, tekrar-uret 10/10. Ek iş (seq 65, K2F-22 sonrası): 122 metin kullanıcı devriyle onaylandı (yapay zekâ incelemesi, gerçek L2 uzman onayı DEĞİL), 3 gramer şablonu eklendi (86/86), çift "Ünite" ön eki giderildi.
Yayın yok (değişen yayın varlıkları: quranLearnFlow.js · quranLearn.js · quranLearnViews.js · kao.css · quranCurriculumV2.js · quranConceptTextsV1.js); pin yükseltme yok. Canlı: `main` = `19f0bfd6`, pin `20261001g`.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-24 (Uygula 2/2 — Ünite 2 namaz çapası):** namaz metinlerindeki `lp_*` kelimelerini öğretilen `l_*` lemmalarına muhafazakâr belirlenimci eşlemeyle bağla (`tools/kao2-curriculum-build.mjs`, `prayer-lemma-map.json`, `applyWords`), Ünite 2'yi çapasına döndür; eşleşmeyenleri `NAMAZ-ESLEME-L2.md`'ye yaz.

## Canlı gerçekler (araçla ölçüldü, 2026-10-02)
- Dal: `kao2-duzeltme` = canlı `main` (`19f0bfd6`) + yerel commit'ler. Sonraki push yalnız kullanıcı isteğiyle / K2F-43 kapısında.
- Yayın pini (canlı): `20261001g` · `App.kao*` 44 · App yüzeyi 765 · atama 603 · `onclick` 393.
- Kapılar: KAO 52 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **10/10 PASS**.
- Bütçe (perf): içerik 184,986 KiB (tavan 256) · runtime 112,597 KiB (tavan 128) · css 13,605 KiB (tavan 14).
- Metin durumu: üniteler 12/12 · dersler 109/109 · S0 12/12 · kavramlar 25/25 sourced; sûre tanıtımı (`surahs`) 20 draft (KR-5'te kaldırılacak).

## Açık riskler
- **Gerçek L2 uzman onayı yok:** dinî bağlamlı metinlerin onayı kullanıcı devriyle yapay zekâ incelemesidir; L2 kutularına dokunulmadı. Gerçek uzman kontrolü tavsiye edilir.
- g14-k2 çeldiricileri ("gelecek zaman/olumsuzluk/emir anlamı") genel yanlış seçeneklerdir, doğrulanmış veri değildir.
- Üretici sayfayı yeniden yazınca inceleme kutuları sıfırlanır (elle yeniden işlenmeli); araç işaretsiz eski `sourced`'u `draft`'a düşürmez.
- Seviye 0 zinciri ve Uygula cümleleri canlıda/cihazda gözle doğrulanmadı (kullanıcıda).
- Canlıda R-07, R-08 sürer (kaynakta kapandı, yayın bekler).
- Sonraki yeni handler K2F-30 (`kaoToggleAutoAdvance`) pinleri 45/766/604'e kaydırır — P8 listesine göre aynı committe.
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı (aralık 30; 45 simüle günde 0 hata).
- `tests/kao/README.md` envanterinde 24 test dosyası yok (K2F-41).
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)`/`plain()` kullan.
- Draft durumunu sınayan testler için `tests/kao/helpers/kao-harness.js` `legacyDraftState` (gerçek veride draft kalmadı).

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kalan kapı: K2F-43 YAYIN-2. (Gerçek L2 uzman onayı kullanıcı kararıdır.)
