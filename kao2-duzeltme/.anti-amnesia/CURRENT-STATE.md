# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-10
lastSeq: 27
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 27 · K2F-00…09 tamam (10/44), sıradaki K2F-10. R-01, R-02, R-09, R-10 PASS (4/10).

## Şu an neredeyiz
K2F-09 bitti (K4-02 1/3, kök neden): `tools/kao-content-freeze.mjs` artık doğrulanmış 93 âyet örneğini (329 kelime; Arapça
Tanzil `resolved`'dan, okunuş QAC D-12 projeksiyonundan, ünsüz iskeleti hizası 329/329) ve kavram açıklamalarını
`quranGrammarV1.js`'e taşıyor; `QuranGrammarV1.exampleById` ile 43/43 `exampleId` çözülüyor; iki üretim bayt-eşit;
`tests/kao/test_kao2_grammar_tasks.js` bölüm A 8 kontrol. Bütçe tavanları kullanıcı kararıyla yükseltildi (LEDGER seq 24:
ham 60→128 KiB, eski 4 modül gzip 164→176 KiB; toplam 256 KiB aynı). CANLIDA (erken yayın, `main` = `1b3b47d1`, Pages run 36845760600, pin `20261001b`, canlı 7/7 bayt-eşit; LEDGER seq 26–27).
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-10 (Gramer 2/3, fail-closed):** `quranLearn.js`'te `kaoGrammarTaskValid(task)` (tekrar-uret `grammarDefects` 5 kuralı
+ tek doğru şık + tekil etiket; örnek verisi `QuranGrammarV1.byId(c).examples`'tan) yaz; ders oynatıcı geçersiz gramer
görevini aynı dersin bir kelime alıştırmasıyla ikame etsin (alıştırma sayısı ≥6 düşmesin), `kaoBuildQueue` geçersiz gramer
kartı sunmasın, kullanıcının `g:` kartları silinmesin; önce `test_kao2_grammar_tasks.js` bölüm B (109 dersin yürüyüşü) kırmızı;
R-03 fail→pass; KANIT'a gösterilen görev sayısı (önce 78, şimdi N) ve atlanan şablon listesi.

## Canlı gerçekler (araçla ölçüldü, 2026-09-30)
- Dal: `kao2-duzeltme` = `main` (canlı `8d757abd`) + K2F-05…K2F-08. Sonraki push yalnız K2F-18/43 onay kapılarında.
- Yayın pini (canlı): `20261001b` (öncesi `20261001a`) · canlı `main` = `1b3b47d1` · canlı `main` = `8d757abd` · `App.kao*` 42 · App yüzeyi 763 · atama 601 · `onclick` 393 (değişmedi).
- Kapılar: KAO 48/48 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **4/10 PASS** (R-01, R-02, R-09, R-10); kalan R-03…R-08 FAIL (beklenen).
- Bütçe (perf): içerik 183,287 KiB (tavan 256; eski 4 modül gzip 167.938 B, tavan 176 KiB) · runtime 97,532 KiB (tavan 128) · css 12,938 KiB (tavan 14) · p95 4,34 ms.

## Açık riskler
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı; aralık 30'a genişletildi (seq 18) ve 45 simüle günde 0 hata ölçüldü (seq 22) — kalıcı çözüm (sabit saat) isteğe bağlı iyileştirme.
- LEDGER seq 16–17: `releaseApproval=approved_through_K2F-04`; K2F-02 ek düzeltmeleri bildirildi; `main` geçmişi kullanıcı onayıyla yeniden yazıldı (iCloud kopyaları gitti; ağaç aynı, yedek etiket `backup-pre-rewrite-20260930`). Eski hash'ler tarihsel: `430539ec`→`86a56267`.
- Canlı kullanıcı Ünite 1 ustalığında kilitli (K4-01) ve gramer görevleri yanlış öğretiyor (K4-02) → Dalga 1 önceliklidir.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla; klasörü iCloud dışına taşımak kullanıcı kararı.
- Yeni handler'lar (K2F-12, K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe.
- `s0` görünümü artık ulaşılabilir: R-06 (s0 derslerinden 6'sı `kaoS0HTML`'de çöküyor) K2F-13'e kadar açık; `App.kaoS0` tanımsız (R-05, K2F-12).
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir (harness `openView` bunu yapar).

## Bekleyen kullanıcı işleri
- (Henüz yok.) Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
