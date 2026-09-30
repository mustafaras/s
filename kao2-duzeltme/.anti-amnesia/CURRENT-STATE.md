# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-06
lastSeq: 17
status: active
-->

Son güncelleme: 2026-09-30 · LEDGER seq 17 · K2F-00…05 tamam (6/44), sıradaki K2F-06. R-09, R-10 PASS (2/10).

## Şu an neredeyiz
K2F-05 bitti (Dalga 1, acil): `quranLearnFlow.js`'e saf `masteryPlan(snapshot, unitId, now, content)` ve
`unitMastery(q, unitId)` eklendi; `tests/kao/test_kao2_mastery.js` bölüm A 17 kontrol PASS. Canlı `main` = `86a56267`
(ikinci erken yayın, LEDGER seq 14; pin `20260930m`, yayınlanan varlık değişmedi). Canlıda Ünite 1 ustalığı hâlâ
kilitli: plan kurulu ama `kaoLessonStart` henüz onu kullanmıyor (K2F-06).

## Sıradaki promptun tek cümlesi
**K2F-06:** `app/core/quranLearn.js`'te `kaoLessonStart` ünite kimliğini `masteryPlan` ile ustalık oturumu olarak
açsın (`ui.kaoLesson.kind==='mastery'`, "son içerik dersine düş" geri dönüşü kalksın), bitişte
`path.units[id]={masteryAt,masteryScore,attempts,lastAttemptAt,repair,skippedAt}` yazsın (eşik 0,8; ders kaydı yazılmaz),
`ensureQuranLearn` bu alanları yalnız-ekleme ile normalize etsin; `test_kao2_mastery.js` bölüm B (harness ile gerçek
handler) + `test_kao2_migration.js`; R-01 ve R-02 fail→pass.

## Canlı gerçekler (araçla ölçüldü, 2026-09-30)
- Dal: `kao2-duzeltme` = `main` (canlı `86a56267`) + K2F-05. Sonraki push yalnız K2F-18/43 onay kapılarında.
- Yayın pini (canlı): `20260930m` (öncesi `20260930l`) · canlı `main` = `86a56267` · `App.kao*` 42 · App yüzeyi 763 · atama 601 · `onclick` 393 (değişmedi).
- Kapılar: KAO 48/48 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **2/10 PASS** (R-09, R-10); kalan R-01…R-08 FAIL (beklenen).
- Bütçe (perf): içerik 177,657 KiB · runtime 93,633 KiB (tavan 128) · css 12,815 KiB · p95 4,34 ms.

## Açık riskler
- LEDGER seq 16–17: `releaseApproval=approved_through_K2F-04`; K2F-02 ek düzeltmeleri bildirildi; `main` geçmişi kullanıcı onayıyla yeniden yazıldı (iCloud kopyaları gitti; ağaç aynı, yedek etiket `backup-pre-rewrite-20260930`). Eski hash'ler tarihsel: `430539ec`→`86a56267`.
- Canlı kullanıcı Ünite 1 ustalığında kilitli (K4-01) ve gramer görevleri yanlış öğretiyor (K4-02) → Dalga 1 önceliklidir.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla; klasörü iCloud dışına taşımak kullanıcı kararı.
- Yeni handler'lar (K2F-12, K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe.
- `s0` görünümü artık ulaşılabilir: R-06 (s0 derslerinden 6'sı `kaoS0HTML`'de çöküyor) K2F-13'e kadar açık; `App.kaoS0` tanımsız (R-05, K2F-12).
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir (harness `openView` bunu yapar).

## Bekleyen kullanıcı işleri
- (Henüz yok.) Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
