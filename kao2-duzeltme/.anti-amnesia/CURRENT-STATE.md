# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-09
lastSeq: 23
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 23 · K2F-00…08 tamam (9/44), sıradaki K2F-09. R-01, R-02, R-09, R-10 PASS (4/10).

## Şu an neredeyiz
K2F-08 bitti ve K4-01 (Ünite 1 ustalık kilidi) kaynak/test düzeyinde kapandı: Ünite ekranında dersten AYRI "Ustalık"
satırı (○ kilitli · ● sırada/onarım · ✓ %puan · Atlandı), dersler bitince tek birincil "Ustalığa başla"/"Onarım turuna
başla", Bugün kahramanında ikincil "Şimdilik atla", ustalık özetinde "10 sorudan N doğru" + tek taş satırı, `u<n>` taşı
yalnız geçince, Yol `aria-current` ünite-tamam kuralıyla; sıfır kullanıcı → Ünite 2 ve v1 kullanıcı → Ünite 4 dokunarak
uçtan uca test yeşil. K2F-05…08 CANLIDA (erken yayın, `main` = `8d757abd`, Pages run 36840879605, pin `20261001a`, canlı 6/6 bayt-eşit; LEDGER seq 22–23). Ünite 1 ustalık kilidi canlıda kaynak düzeyinde açıldı.
**Kullanıcı yönergesi (2026-10-01): sırayla, her seferinde tek prompt; K2F-08 sonrası durulur.**

## Sıradaki promptun tek cümlesi
**K2F-09 (Gramer 1/3, K4-02 kök neden):** `tools/kao-content-freeze.mjs` `freezeGrammar`'a doğrulanmış `examples`
(ve varsa `explanation`) ekle — Arapça/okunuş yalnız `resolved` alanları ve mevcut okunuş projeksiyonundan; önce
`tests/kao/test_kao2_grammar_tasks.js` bölüm A (43 `exampleId`'li şablonun 43'ü modülde çözülür; her örnekte
`ref,tr,ar,words[{w,ar,pronunciation}]`); `--freeze-grammar` iki kez bayt-eşit; modül tavanı 60 KiB ve K-1 içerik
bütçeleri yeşil kalmalı (aşılırsa P6).

## Canlı gerçekler (araçla ölçüldü, 2026-09-30)
- Dal: `kao2-duzeltme` = `main` (canlı `8d757abd`) + K2F-05…K2F-08. Sonraki push yalnız K2F-18/43 onay kapılarında.
- Yayın pini (canlı): `20261001a` (öncesi `20260930m`) · canlı `main` = `8d757abd` · `App.kao*` 42 · App yüzeyi 763 · atama 601 · `onclick` 393 (değişmedi).
- Kapılar: KAO 48/48 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **4/10 PASS** (R-01, R-02, R-09, R-10); kalan R-03…R-08 FAIL (beklenen).
- Bütçe (perf): içerik 177,657 KiB · runtime 97,532 KiB (tavan 128) · css 12,938 KiB (tavan 14) · p95 4,34 ms.

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
