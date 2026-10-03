# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-27
lastSeq: 77
status: active
-->

Son güncelleme: 2026-10-03 · LEDGER seq 77 · K2F-00…26 tamam (27/44), sıradaki K2F-27. R-01…R-10 PASS (10/10).

## Şu an neredeyiz
K2F-26 bitti (yalnız kaynak/test; **yayında DEĞİL**, pin yükseltilmedi): kaynaksız ve atfı yanlış 20 `surahs.*.contextTr` kaldırıldı (`texts.tr.json` `surahs` + yalnız onlara bağlı `sources["diyanet-meal"]`/`["tdv-sure"]`; araç `surahs` bloğu; modülde `surahs` yok; `kaoReaderContext` ve ölü `.kao-reader-context*` CSS gitti). Okuyucu tanıtım kartı yalnız `QuranRevelationOrderV1`'den (nüzul yeri · âyet sayısı · tema) çizilir; A-5 artık 20/20 sûre tanıtımını gerçek render ile ölçer. `code-reviewer` ek olarak "Hakkında ve kaynaklar" sayfasındaki gizli tüketiciyi yakaladı (`QuranCurriculumV2.surahs` sayısı → "0 sûre bağlamı" yazacaktı); düzeltildi. Kullanıcıya görünür davranış değişmedi (bağlam zaten ölü koddu).

**Canlıda (2026-10-03, kullanıcı isteğiyle):** K2F-19…25 + ek turlar — `main` `8cde3903`, pin `20261003c`, Pages run 37117992353, canlı 10/10 bayt-eş ([YAYIN.md](../evidence/K2F-25/YAYIN.md)). K2F-26 canlıda yok. Cihaz doğrulaması kullanıcıda.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-27 (Tek başlık çubuğu):** eski modal başlığını (`kao-header`, kapat X) kaldırıp NavBar'ı tek üst çubuk yap; tüm görünümlerde tek kapatma kontrolü, dialog `aria-labelledby` LargeTitle'a işaret eder, Escape sözleşmesi korunur (`quranLearn.js` `kaoOverlayHTML`, `quranLearnViews.js` `navBar`/`renderScreen`, `app/kao.css`, `test_kao2_navigation/design_contract/a11y.js`; CLAUDE.md "Modal keyboard contract").

## Canlı gerçekler (araçla ölçüldü, 2026-10-03)
- Dal: `kao2-duzeltme` = canlı `main` (`8cde3903`) + `kao2-duzeltme/` belge commit'leri + K2F-26 (yayınlanmamış: `quranCurriculumV2.js`, `quranLearn.js`, `kao.css`). Sonraki push yalnız kullanıcı isteğiyle / K2F-43 kapısında.
- Yayın pini (canlı): `20261003c` · `App.kao*` 44 · App yüzeyi 765 · atama 603 · `onclick` 393.
- Kapılar (K2F-26 sonu): KAO 52 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/l2-paket/plan-check/sync PASS.
- `tekrar-uret.cjs`: **10/10 PASS**.
- Bütçe (perf): içerik 183,544 KiB (tavan 256) · runtime 113,209 KiB (tavan 128) · **css 13,613 KiB (tavan 14 — kalan ≈0,39 KiB)** · p95 4,6 ms.
- Testler: `test_kao2_lesson_flow.js` 22 · `test_kao2_review_apply.js` 15 · `test_kao2_reader.js` 14 · `test_kao2_kabul.js` 10/10 ölçüt.
- Namaz eşlemesi: 19/32 `lp_*` eşli. Veri kapsamı (524 lemma): 162 unit11 köküne, 113 kognat kaymasına sahip.
- Metin durumu: üniteler 12/12 · dersler 109/109 · S0 12/12 · kavramlar 25/25 sourced; sûre tanıtımı metni yok (kaldırıldı).

## Açık riskler
- **CSS payı dar (≈0,39 KiB):** K2F-27…29 CSS ekler/çıkarırsa 14 KiB tavanına dayanabilir; K2F-27 eski başlık CSS'ini kaldıracağı için pay büyüyebilir. Bütçeyi aşmak P6 durma koşuludur.
- **Silinen veri için tarama dersi:** bir alanı kaldırırken yalnız alan adlarını değil, nesnenin genel okumalarını da (`QuranCurriculumV2&&…surahs`, `Object.keys(...)`) tara; K2F-26'da böyle bir gizli tüketici yalnız kod incelemesiyle yakalandı.
- **"Neden böyle?" kapsamı sınırlı:** kök anlamı yalnız unit11 köklerinde (162/524 lemma); 12 ünitenin ilk dersi gerçek akışla ölçüldü.
- **Namaz eşlemesi muhafazakârdır:** fiil 1. tekil, kırık/müennes çoğul, birleşik ifadeler ve iki adaylı ʿabduhu eşlenmez → `NAMAZ-ESLEME-L2.md` (13 kelime), L2-PAKET.md. Artık risk: homograf fâil lemması; küme testi görünür kılar, önlemez.
- **Gerçek L2 uzman onayı yok:** dinî bağlamlı metinlerin onayı kullanıcı devriyle yapay zekâ incelemesidir (canlıda da böyle). L2 paketi: `kao2-duzeltme/evidence/K2F-24/L2-PAKET.md` (`kao2-duzeltme/tools/l2-paket-build.mjs --check` kapıda; seçim tarama tabanlıdır).
- g14-k2 çeldiricileri ("gelecek zaman/olumsuzluk/emir anlamı") genel yanlış seçeneklerdir, doğrulanmış veri değildir.
- Üretici araç inceleme kutularını korur; metni değişen satırın onayı taşınmaz (UYARI satırı kimlikleri söyler) ve yeniden işaretleme gerekir.
- Seviye 0 zinciri, Uygula cümleleri, yeni tanış kartı katmanları ve K2F-26 tanıtım kartı canlıda/cihazda gözle doğrulanmadı (kullanıcıda).
- Sonraki yeni handler K2F-30 (`kaoToggleAutoAdvance`) pinleri 45/766/604'e kaydırır — P8 listesine göre aynı committe.
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı (aralık 30; 45 simüle günde 0 hata).
- `tests/kao/README.md` envanterinde 24 test dosyası yok (K2F-41); K2F-41'de ayrıca D-12 kognat turu "ertelendi (K2F-25, seq 74)" notu eklenecek.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan. `$TMPDIR` ortak bir dizin: yalnız kendi oluşturduğun dosyaları sil.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)`/`plain()` kullan.
- Draft durumunu sınayan testler için `tests/kao/helpers/kao-harness.js` `legacyDraftState` (gerçek veride draft kalmadı).
- Sözlüğü sahtelemek için `t.win.QuranLexiconV1` değiştirilebilir (K2F-25 testi); her varyant taze `bootKao()` ister.

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kalan kapı: K2F-43 YAYIN-2.
- **L2 (GATE seq 71, waiting):** gerçek alan uzmanı onayı yoktur ve Claude veremez. `L2-PAKET.md` tek oturumda işaretlenecek madde listesidir. Uygunsa ilgili sayfada L2 kutusu `[x]` yapılıp **"L2 işaretlendi"** yazılır; kapı sonraki promptları engellemez.
- K2F-26 yayında değil: istersen "canlıya alalım" de (pin `20261003c` → yeni pin).
