# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-26
lastSeq: 75
status: active
-->

Son güncelleme: 2026-10-03 · LEDGER seq 75 · K2F-00…25 tamam (26/44), sıradaki K2F-26. R-01…R-10 PASS (10/10).

## Şu an neredeyiz
K2F-25 bitti (yalnız kaynak/test; **yayında DEĞİL**, pin yükseltilmedi): tanış kartı artık (1) doğrulanmış ilk örnek âyeti (Arapça + okunuş + Türkçe + âyet künyesi; uygula adımındaki kart biçimiyle) ve (2) katlanabilir "Neden böyle?" katmanını (kök okunuşu + anlamı + Türkçe türevler `QuranGrammarV1.unit11`'den; `cognate.shift` uyarısı) gösterir. Doğrulanmamış (`verified!==true` ya da okunuşsuz) örnek hiç gösterilmez; katman içeriği yoksa hiç çizilmez; ≤1 `<details>`, ≤1 `.kao-primary`. Kognat kayması "Türkçedeki akrabası" satırından kalkıp katmana taşındı. D-12 "zaten biliyorsun" kognat turu bu programda **ertelendi** (LEDGER seq 74 DECISION; K2F-41'de 04 kararı durumuna not eklenecek).

Önceki durum: K2F-24 (namaz eşlemesi 19/32, Ünite 2 çapası) ve ek turları (araç inceleme-kutusu koruması, L2 paketi aracı, kod incelemesi bulguları) **canlıda** (2026-10-03, kullanıcı isteği; `main` `9adac908`, pin `20261003b`, Pages run 37116493085, canlı 10/10 bayt-eş — [YAYIN.md](../evidence/K2F-24/YAYIN.md)). Cihaz doğrulaması kullanıcıda.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-26 (Sûre bağlamı kaldırma):** `texts.tr.json` `surahs.*.contextTr` (20 kaynaksız/yanlış atıflı metin) ve yanlış `review.sources` kaldırılır; okuyucu tanıtım kartı yalnız `QuranRevelationOrderV1`'den çizer (tools/kao2-curriculum-build.mjs surahs işleyişi, `quranCurriculumV2.js`, `quranLearn.js` bağlam okuma, `test_kao2_reader.js`, `test_kao2_kabul.js` A-5: 20/20 sûre tanıtımı tema+yer+âyet sayısı).

## Canlı gerçekler (araçla ölçüldü, 2026-10-03)
- Dal: `kao2-duzeltme` = canlı `main` (`9adac908`) + belge commit'leri + K2F-25 (yayınlanmamış: `quranLearn.js`, `quranLearnViews.js`, `kao.css`). Sonraki push yalnız kullanıcı isteğiyle / K2F-43 kapısında.
- Yayın pini (canlı): `20261003b` · `App.kao*` 44 · App yüzeyi 765 · atama 603 · `onclick` 393.
- Kapılar (K2F-25 sonu): KAO 52 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/l2-paket/plan-check/sync PASS.
- `tekrar-uret.cjs`: **10/10 PASS**.
- Bütçe (perf): içerik 185,235 KiB (tavan 256) · runtime 113,511 KiB (tavan 128) · **css 13,639 KiB (tavan 14 — kalan ≈0,37 KiB)** · müfredat modülü gzip 21,9 KB (tavan 48 KiB) · p95 4,3 ms.
- Testler: `test_kao2_lesson_flow.js` 22 kontrol · `test_kao2_review_apply.js` 15 kontrol.
- Veri kapsamı (524 lemma): 162 lemma unit11 köküne, 113 lemma kognat kaymasına sahip; hepsinin doğrulanmış okunuşlu örneği var.
- Namaz eşlemesi: 19/32 `lp_*` eşli (13 eşlenmez).
- Metin durumu: üniteler 12/12 · dersler 109/109 · S0 12/12 · kavramlar 25/25 sourced; sûre tanıtımı (`surahs`) 20 draft (K2F-26'da kaldırılacak).

## Açık riskler
- **CSS payı dar (≈0,37 KiB):** K2F-26…29 CSS eklerse 14 KiB tavanına dayanır; mevcut sınıfları yeniden kullan (K2F-25 uygula kartını yeniden kullandı) ya da kullanılmayan kuralları temizle. Bütçeyi aşmak P6 durma koşuludur.
- **"Neden böyle?" kapsamı sınırlı:** kök anlamı yalnız unit11 köklerinde (162/524 lemma); 12 ünitenin ilk dersi gerçek akışla ölçüldü, 109 dersin tamamı için ayrı render taraması yok.
- **Namaz eşlemesi muhafazakârdır:** fiil 1. tekil (e-, elatifle aynı kalıp), kırık/müennes çoğul, birleşik ifadeler ve iki adaylı ʿabduhu bilerek eşlenmez → `NAMAZ-ESLEME-L2.md` (13 kelime) ve L2-PAKET.md. Artık risk: homograf fâil lemması (âlim/âlem türü); küme testi görünür kılar, önlemez.
- **Gerçek L2 uzman onayı yok:** dinî bağlamlı metinlerin onayı kullanıcı devriyle yapay zekâ incelemesidir (canlıda da böyle). L2 paketi: `kao2-duzeltme/evidence/K2F-24/L2-PAKET.md` (seçim tarama tabanlıdır).
- g14-k2 çeldiricileri ("gelecek zaman/olumsuzluk/emir anlamı") genel yanlış seçeneklerdir, doğrulanmış veri değildir.
- Üretici araç inceleme kutularını korur; metni değişen satırın onayı taşınmaz (UYARI satırı kimlikleri söyler) ve yeniden işaretleme gerekir.
- Seviye 0 zinciri, Uygula cümleleri ve yeni tanış kartı katmanları canlıda/cihazda gözle doğrulanmadı (kullanıcıda).
- Sonraki yeni handler K2F-30 (`kaoToggleAutoAdvance`) pinleri 45/766/604'e kaydırır — P8 listesine göre aynı committe.
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı (aralık 30; 45 simüle günde 0 hata).
- `tests/kao/README.md` envanterinde 24 test dosyası yok (K2F-41).
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan. `$TMPDIR` ortak bir dizin: yalnız kendi oluşturduğun dosyaları sil.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)`/`plain()` kullan.
- Draft durumunu sınayan testler için `tests/kao/helpers/kao-harness.js` `legacyDraftState` (gerçek veride draft kalmadı).
- Sözlüğü sahtelemek için `t.win.QuranLexiconV1` değiştirilebilir (K2F-25 testi); her varyant taze `bootKao()` ister, çünkü tanışılan kelime ikinci başlatmada kart üretmez.

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kalan kapı: K2F-43 YAYIN-2.
- **L2 (GATE seq 71, waiting):** gerçek alan uzmanı onayı yoktur ve Claude veremez. `L2-PAKET.md` tek oturumda işaretlenecek madde listesidir. Uygunsa ilgili sayfada L2 kutusu `[x]` yapılıp **"L2 işaretlendi"** yazılır; kapı sonraki promptları engellemez.
- K2F-25 yayında değil: istersen "canlıya alalım" de (pin `20261003b` → yeni pin).
