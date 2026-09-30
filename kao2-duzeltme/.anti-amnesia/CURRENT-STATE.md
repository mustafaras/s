# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-05
lastSeq: 13
status: active
-->

Son güncelleme: 2026-09-30 · LEDGER seq 13 · K2F-00…04 tamam (5/44), sıradaki K2F-05. R-09, R-10 PASS (2/10).

## Şu an neredeyiz
K2F-04 bitti: `test_kao2_kabul.js` raporu yalnız `KAO2_EVIDENCE_OUT=<yol>` ile yazar, aksi hâlde stdout'a basar;
`kapilar.sh` A-KABUL yedek bloğu kaldırıldı; test koşusu ağacı kirletmiyor. W0 (hazırlık) tamam. Plan dışı erken yayın
K2F-03 sonrası yapıldı (main `f0e8b1c1`, pin `20260930m`; LEDGER seq 10–11). iCloud çakışma kopyaları temizlendi (seq 12).

## Sıradaki promptun tek cümlesi
**K2F-05 (Dalga 1, acil):** `app/core/quranLearnFlow.js`'e saf `masteryPlan(snapshot, unitId, now, content)` ve
`unitMastery(q, unitId)` ekle (sıra goal → [read] → 10 × practice → summary; practice `mastery:true`, `choiceCount:4`,
yalnız tanışılmış lemmalar, en zayıftan; belirlenimci; tanışılmış lemma 0 ise `null`); önce `tests/kao/test_kao2_mastery.js`
bölüm A kırmızı; Flow saflığı korunur, runtime bütçesi tavan 128 KiB.

## Canlı gerçekler (araçla ölçüldü, 2026-09-30)
- Dal: `kao2-duzeltme`; canlı `main` = `f0e8b1c1`. Sonraki push yalnız K2F-18/43 onay kapılarında.
- Yayın pini (canlı): `20260930m` (öncesi `20260930l`) · `main` = `f0e8b1c1` (kao2-duzeltme dalı yalnız kanıt belgeleriyle ileride) · `App.kao*` 42 · App yüzeyi 763 · atama 601 · `onclick` 393 (değişmedi).
- Kapılar: KAO 47/47 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **2/10 PASS** (R-09, R-10); kalan R-01…R-08 FAIL (beklenen).
- Bütçe (perf): içerik 177,657 KiB · runtime 92,439 KiB (+0,008) · css 12,815 KiB · p95 4,34 ms.

## Açık riskler
- Canlı kullanıcı Ünite 1 ustalığında kilitli (K4-01) ve gramer görevleri yanlış öğretiyor (K4-02) → Dalga 1 önceliklidir.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla; klasörü iCloud dışına taşımak kullanıcı kararı.
- Yeni handler'lar (K2F-12, K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe.
- `s0` görünümü artık ulaşılabilir: R-06 (s0 derslerinden 6'sı `kaoS0HTML`'de çöküyor) K2F-13'e kadar açık; `App.kaoS0` tanımsız (R-05, K2F-12).
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir (harness `openView` bunu yapar).

## Bekleyen kullanıcı işleri
- (Henüz yok.) Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
