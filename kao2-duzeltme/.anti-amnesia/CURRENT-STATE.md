# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-03
lastSeq: 8
status: active
-->

Son güncelleme: 2026-09-30 · LEDGER seq 8 · K2F-00…02 tamam (3/44), sıradaki K2F-03. R-09 PASS (1/10).

## Şu an neredeyiz
K2F-02 bitti: `tests/kao/helpers/kao-harness.js` (bootKao/freshUser/openView/walkLesson/text) ve
`tests/kao/test_kao2_view_resolution.js` (11 kontrol) eklendi. Kök neden `quranLearnFlow.js` VIEWS beyaz listesinde
`roots`/`s0`/`sources` yokluğuydu: yığın onları düşürüp ana ekrana iniyordu, gerçek `kaoNav('s0'|'sources')` da işe
yaramıyordu. Beyaz liste genişletildi (kullanıcı onayıyla Dokun'a eklendi, LEDGER seq 7); `kaoNav` roots liste yolu ve
`kaoS0HTML` null durumu aynı committe düzeltildi.

## Sıradaki promptun tek cümlesi
**K2F-03:** `tests/kao/test_kao2_handler_surface.js` yaz — `quranLearn*.js` içindeki tüm `App.kao*` başvuruları
(`App.x`, `name:'kao…'`, `action:'kao…'`, birleştirilmiş adlar) ↔ `app.js` shim tanımları ↔ `window.SeymaQuranLearn`
yüzeyi; `KNOWN_MISSING=['kaoS0']` gerçekten eksik olmalı (R-05 K2F-12'ye kadar FAIL kalır); yeni test README'ye eklenir.
Harness'i kullan (`tests/kao/helpers/kao-harness.js`).

## Canlı gerçekler (araçla ölçüldü, 2026-09-30)
- Dal: `kao2-duzeltme` (tabanı `main` = `07802fa6`); push yok.
- Yayın pini: `20260930l` · `App.kao*` 42 · App yüzeyi 763 · atama 601 · `onclick` 393 (değişmedi).
- Kapılar: KAO 46/46 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **1/10 PASS** (R-09); kalan R-01…R-08, R-10 FAIL (beklenen).
- Bütçe (perf): içerik 177,657 KiB · runtime 92,439 KiB (+0,008) · css 12,815 KiB · p95 4,34 ms.

## Açık riskler
- Canlı kullanıcı Ünite 1 ustalığında kilitli (K4-01) ve gramer görevleri yanlış öğretiyor (K4-02) → Dalga 1 önceliklidir.
- `archive/…/evidence/KAO2-27/A-KABUL.md` her KAO test koşusunda yeniden yazılır (M-11); `kapilar.sh` içeriği geri koyar; K2F-04 kalıcı çözer.
- Yeni handler'lar (K2F-12, K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe.
- `s0` görünümü artık ulaşılabilir: R-06 (s0 derslerinden 6'sı `kaoS0HTML`'de çöküyor) K2F-13'e kadar açık; `App.kaoS0` tanımsız (R-05, K2F-12).
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir (harness `openView` bunu yapar).

## Bekleyen kullanıcı işleri
- (Henüz yok.) Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
