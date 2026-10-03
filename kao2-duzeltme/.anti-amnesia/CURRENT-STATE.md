# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-25
lastSeq: 71
status: active
-->

Son güncelleme: 2026-10-03 · LEDGER seq 71 · K2F-00…24 tamam (25/44) + K2F-24 ek turu (seq 70 FIX, seq 71 GATE), sıradaki K2F-25. R-01…R-10 PASS (10/10).

## Şu an neredeyiz
K2F-24 bitti (yalnız kaynak/test; **yayında DEĞİL**, pin yükseltilmedi): namaz metinlerindeki `lp_*` kelimeleri araçla öğretilen `l_*` lemmalarına muhafazakâr belirlenimci eşlemeyle bağlandı — 30 benzersiz kelimeden 18 eşlendi, 12'si eşlenmedi (11 aday yok, 1 birden çok aday: `lp_c7d096cadc`). `applyWords` durumu eşlenen lemmadan türetir (`mappedLemmaId`), tanış kartı çapası eşlenen kelimeyi bulur, Ünite 2'nin u02.02 ve u02.03 dersleri `examples` yerine `prayer:tahiyyat` çapasına bağlandı (u02.01 `tekbir` kaldı). Eşleşmeyenler `docs/kuran-ogreniyorum/kao2/inceleme/NAMAZ-ESLEME-L2.md`'de. K2F-23 sabiti 97 → 95 ders. tekrar-uret 10/10, tüm kapılar yeşil.
**K2F-24 ek turu (yalnız kaynak/test, yayında DEĞİL):** (1) eşleşmeyen namaz kelimeleri tek tek sınıflandırıldı; yalnız düzenli -în/-ûn çoğulu güvenli bulundu (es-sâlihîn → sâlih; yalnız çoğul olmayan fâil/mef'ûl/sıfat lemmaları, ≥3 harf çekirdek) → **32 benzersiz `lp_*` kelimeden 19 eşli, 13 eşlenmez** (önceki belgelerdeki "30/18/12" yanlıştı: araç 32/18/14 üretiyordu); (2) üretici araç artık `INCELEME-KAO2-17/18` onay kutularını korur (L1/L2 ayrı; boş `--out-dir` depodan taşır) — `git checkout` geçici çaresi bitti; (3) gerçek L2 uzman onayı **verilmedi**, kullanıcı için `kao2-duzeltme/evidence/K2F-24/L2-PAKET.md` hazırlandı (GATE seq 71, waiting).
**YAYINDA (2026-10-03, K2F-23 sonrası):** K2F-19…23 + ek turlar canlı — `main` `b25ee012`, pin `20261003a`; K2F-24 canlıda yok. Cihaz doğrulaması kullanıcıda.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-25 (Tanış kartı katmanları):** tanış kartına doğrulanmış örnek âyet ve katlanabilir "Neden böyle?" ekle (`quranLearnViews.js` intro aşaması, `quranLearn.js` intro modeli, `app/kao.css`, `test_kao2_lesson_flow.js`).

## Canlı gerçekler (araçla ölçüldü, 2026-10-02)
- Dal: `kao2-duzeltme` = canlı `main` (`b25ee012`) + belge commit'leri + K2F-24 (yayınlanmamış: `quranLearnFlow.js`, `quranCurriculumV2.js`). Sonraki push yalnız kullanıcı isteğiyle / K2F-43 kapısında.
- Yayın pini (canlı): `20261003a` · `App.kao*` 44 · App yüzeyi 765 · atama 603 · `onclick` 393.
- Kapılar (K2F-24 sonu): KAO 52 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **10/10 PASS**.
- Bütçe (perf): içerik 185,235 KiB (tavan 256) · runtime 112,810 KiB (tavan 128) · css 13,605 KiB (tavan 14) · müfredat modülü gzip 21,9 KB (tavan 48 KiB).
- Namaz eşlemesi: 19/32 `lp_*` eşlendi (13 eşlenmez); Ünite 2 odak lemmalarından namaza bağlananlar suboHa_n, sala_m, Tay_iba_t, baraka_t, raHomap, rasuwl (es-sâlihîn → Sa_liH Ünite 2 odağı değil).
- Metin durumu: üniteler 12/12 · dersler 109/109 · S0 12/12 · kavramlar 25/25 sourced; sûre tanıtımı (`surahs`) 20 draft (KR-5'te kaldırılacak).

## Açık riskler
- **Namaz eşlemesi muhafazakârdır:** eşit iskelet + yaygın ek + düzenli çoğul; fiil 1. tekil (e-, elatifle aynı kalıp), kırık/müennes çoğul, birleşik ifadeler (lillâh, allâhumme) ve iki adaylı ʿabduhu bilerek eşlenmez → `NAMAZ-ESLEME-L2.md` (13 kelime) ve L2-PAKET.md.
- **Gerçek L2 uzman onayı yok:** dinî bağlamlı metinlerin onayı kullanıcı devriyle yapay zekâ incelemesidir; L2 kutularına dokunulmadı. Gerçek uzman kontrolü tavsiye edilir.
- g14-k2 çeldiricileri ("gelecek zaman/olumsuzluk/emir anlamı") genel yanlış seçeneklerdir, doğrulanmış veri değildir.
- Üretici araç inceleme kutularını artık korur; yalnız kimliği/kutu sayısı değişen işaret taşınamaz ve stderr'e UYARI yazılır (sessiz düşmez). Araç işaretsiz eski `sourced`'u `draft`'a düşürmez.
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
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kalan kapı: K2F-43 YAYIN-2.
- **L2 (GATE seq 71, waiting):** gerçek alan uzmanı onayı yoktur ve Claude veremez. `kao2-duzeltme/evidence/K2F-24/L2-PAKET.md` tek oturumda işaretlenecek madde listesidir (A: 32 namaz kelimesi · B: 8 ünite + 20 ders + 7 kavram dinî metin). Uygunsa ilgili sayfada L2 kutusu `[x]` yapılıp **"L2 işaretlendi"** yazılır; kapı K2F-25'i engellemez.
