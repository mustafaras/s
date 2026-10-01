# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-08
lastSeq: 20
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 20 · K2F-00…07 tamam (8/44), sıradaki K2F-08. R-01, R-02, R-09, R-10 PASS (4/10).

## Şu an neredeyiz
K2F-07 bitti: ünite tamam = dersler bitti ∧ (masteryAt ∨ skippedAt) (`unitProgress.complete`); Bugün adımı repair >
mastery; saf `repairPlan` (yalnız karıştırılan kelimeler, iki yön, ≤10); `kaoLesson('start','repair:<id>')` onarım
oturumu (bitince `repair:null`); `kaoLesson('skip-mastery', unitId)` yalnız `skippedAt` yazar. 12 ünite simülasyonu
(Ünite 3 kaldı → onarım → geçti) `test_kao2_mastery.js` bölüm C'de yeşil. K4-01 3/4. K2F-06/07 henüz yayında değil.

## Sıradaki promptun tek cümlesi
**K2F-08 (ustalığın son parçası):** Ünite ekranında ders listesinden ayrı "Ustalık" satırı (○/●/✓ %puan/"Atlandı"),
Bugün kahramanında mastery adımı için tek birincil "Ustalığa başla" + ikincil "Şimdilik atla" (`skip-mastery`),
ustalık özetinde "10 sorudan N doğru" ve geçti/kaldı cümlesi + tek taş satırı, Yol'da `aria-current` Flow `currentUnit`'e,
`u<n>` taşı yalnız geçince (`kaoPanelSummary.unitMilestones`), ve sıfır kullanıcıdan Ünite 2'ye / v1 kullanıcıdan
Ünite 4'e uçtan uca dokunma testi (`test_kao2_mastery.js` bölüm D); `lesson.mastery` görünümde yok sayılır.

## Canlı gerçekler (araçla ölçüldü, 2026-09-30)
- Dal: `kao2-duzeltme` = `main` (canlı `86a56267`) + K2F-05, K2F-06, K2F-07. Sonraki push yalnız K2F-18/43 onay kapılarında.
- Yayın pini (canlı): `20260930m` (öncesi `20260930l`) · canlı `main` = `86a56267` · `App.kao*` 42 · App yüzeyi 763 · atama 601 · `onclick` 393 (değişmedi).
- Kapılar: KAO 48/48 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **4/10 PASS** (R-01, R-02, R-09, R-10); kalan R-03…R-08 FAIL (beklenen).
- Bütçe (perf): içerik 177,657 KiB · runtime 96,683 KiB (tavan 128) · css 12,815 KiB · p95 4,34 ms.

## Açık riskler
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı (aralık 30'a genişletildi, seq 18); kalıcı çözüm sabit saat.
- LEDGER seq 16–17: `releaseApproval=approved_through_K2F-04`; K2F-02 ek düzeltmeleri bildirildi; `main` geçmişi kullanıcı onayıyla yeniden yazıldı (iCloud kopyaları gitti; ağaç aynı, yedek etiket `backup-pre-rewrite-20260930`). Eski hash'ler tarihsel: `430539ec`→`86a56267`.
- Canlı kullanıcı Ünite 1 ustalığında kilitli (K4-01) ve gramer görevleri yanlış öğretiyor (K4-02) → Dalga 1 önceliklidir.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla; klasörü iCloud dışına taşımak kullanıcı kararı.
- Yeni handler'lar (K2F-12, K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe.
- `s0` görünümü artık ulaşılabilir: R-06 (s0 derslerinden 6'sı `kaoS0HTML`'de çöküyor) K2F-13'e kadar açık; `App.kaoS0` tanımsız (R-05, K2F-12).
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir (harness `openView` bunu yapar).

## Bekleyen kullanıcı işleri
- (Henüz yok.) Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
