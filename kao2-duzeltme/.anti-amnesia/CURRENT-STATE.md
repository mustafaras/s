# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-12
lastSeq: 34
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 34 · K2F-00…11 tamam (12/44), sıradaki K2F-12. R-01, R-02, R-03, R-09, R-10 PASS (5/10).

## Şu an neredeyiz
K2F-11 bitti (K4-02 3/3 + K4-04): gramer görevleri artık doğrulanmış âyet örneğinden ve kavram tablosundan KURULUYOR (`quranLearn.js`
tarifler: Kelime dizme, Parça çevir, Çekim tablosu, Ek çöz (g1 "el" + g5 yapışık ek), Anlam seç, Arapça seç, Kök bul, Kalıp eşle (g21)).
71/86 şablon destekli (örnekli 43'ün 43'ü); 15 şablon tablo yetmediği için kurulmuyor ve gerekçeyle
`docs/kuran-ogreniyorum/kao2/inceleme/GRAMER-SABLON-L2.md`'de (test üretir). Kullanıcı kararıyla görev "yönlendirir ve öğretir": Kelime dizme'de
ilk kelime ipucu + anlam, cevap sonrası "Âyet ref: çeviri · Kural: plainTr". Dizme arayüzü fragman `order` etkileşimini paylaşır (genelleştirildi;
fragman metni/notu yalnız fragmanlarda). Flow'da aynı gramer türü ardışık gelmez (araya kelime alıştırması). 109 ders yürüyüşünde gösterilen
gramer görevi 37 → 64, 0 kusur, en az alıştırma 9. Bölüm B (B1–B6) + C (C1–C9) = 23 kontrol. Kapılar yeşil; yayın YOK (canlıda K2F-10
davranışı sürer; `quranLearn.js` + `quranLearnFlow.js` değişti → sonraki yayında pin yükselmeli).
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-12 (Seviye 0 1/4):** `app.js` KAO shim satırına tek `App.kaoS0` shim'i ekle (P8 biçimi), motor dış yüzeyinde `kaoS0`'ı doğrula, `kaoS0('start', id)` →
`kaoApplyView(ui,'s0',id,'push')` + render; önce `tests/kao/test_kao2_s0.js`'e kırmızı (`kaoS0('start','s0.02')` → yığın tepesi `s0`, NavBar "Harfler") ve
`test_kao2_handler_surface.js` `KNOWN_MISSING` boşken PASS; pinler App.kao* 42→43 · yüzey 763→764 · atama 601→602 (P8 listesindeki 7 dosya + FIX-STATE `pins`, ölçerek); R-05 fail→pass.

## Canlı gerçekler (araçla ölçüldü, 2026-10-01)
- Dal: `kao2-duzeltme` = `main` (canlı `46a8b894`) + K2F-10 kanıt commit'i `fb4f4dab` (belge-only) + K2F-11. Sonraki push yalnız kullanıcı isteğiyle / K2F-18/43 kapılarında.
- Yayın pini (canlı): `20261001c` · `App.kao*` 42 · App yüzeyi 763 · atama 601 · `onclick` 393 (değişmedi; `kaoGrammarSupport`/`kaoGrammarTaskValid` handler değil).
- Kapılar: KAO 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **5/10 PASS** (R-01, R-02, R-03, R-09, R-10); kalan R-04…R-08 FAIL (beklenen).
- Bütçe (perf): içerik 183,287 KiB (tavan 256) · runtime ≈102,5 KiB (tavan 128) · css 12,938 KiB (tavan 14) · p95 ≈4,3 ms.

## Açık riskler
- `tekrar-uret.cjs` yürüyüşçüsü çok adımlı "Kelime dizme" görevinde takılıp aynı görevi tekrar sayıyor (R-03 "4035 görev"); R-03 PASS ama koruma gücü azaldı. Gerçek koruma `test_kao2_grammar_tasks.js` C8. Oracle'ın yürüyüşçüsü (Dokun dışı) uygun bir promptta order-aware yapılabilir.
- 15 şablon (Ek çöz ×8, Anlam seç ×5, Kalıp eşle ×2) kurulamıyor → derste kelime alıştırması, tekrar kuyruğunda yok; çözüm alan uzmanı/L2 (GRAMER-SABLON-L2.md).
- Canlıda R-05 `App.kaoS0` tanımsız, R-06 Seviye 0 çökmeleri, R-04/R-07/R-08 sürer; K2F-11 yalnız kaynak/test düzeyinde (canlıda K2F-10 sürümü).
- `s0` görünümü ulaşılabilir: R-06 (s0 derslerinden 6'sı `kaoS0HTML`'de çöküyor) K2F-13'e kadar açık; `App.kaoS0` tanımsız (R-05, K2F-12).
- Yeni handler'lar (K2F-12, K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe.
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı; aralık 30'a genişletildi (seq 18) ve 45 simüle günde 0 hata ölçüldü (seq 22).
- `tests/kao/README.md` `test_kao2_grammar_tasks.js` satırı yalnız bölüm A'yı anıyor (Dokun dışı); sonraki uygun promptta A+B+C olarak güncellenebilir.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan. zsh'de kelime bölünmez: `sed -i '' … "${DIZI[@]}"` kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir.

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
