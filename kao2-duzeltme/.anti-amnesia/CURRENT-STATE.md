# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-02
lastSeq: 6
status: active
-->

Son güncelleme: 2026-09-30 · LEDGER seq 6 · K2F-00, K2F-01 tamam (2/44), sıradaki K2F-02.

## Şu an neredeyiz
K2F-01 bitti: `kao-plan-check` artık `K2F-00…43` önekini tanır (tek hane / `K2FX` / aralık dışı reddedilir) ve
`FIX-STATE.json.planCheckBase` (= K2F-00 commit'i `d19b4576`) öncesindeki commitleri taramaz; `--since <hash>` ile
geçersiz kılınır. Çözülemeyen taban sessizce atlanmaz, FAIL verir. Hiçbir R değişmedi (0/10).

## Sıradaki promptun tek cümlesi
**K2F-02:** `tests/kao/helpers/kao-harness.js` ortak düzeneğini (`bootKao`/`freshUser`/`openView` — gerçek
`kaoNav`/`kaoSetView`) yaz ve `app/core/quranLearn.js`'te yığın boşken `ui.kaoView`'un sessizce ana ekrana düşmesini
düzelt; `tests/kao/test_kao2_view_resolution.js` ile R-09 fail→pass.

## Canlı gerçekler (araçla ölçüldü, 2026-09-30)
- Dal: `kao2-duzeltme` (tabanı `main` = `07802fa6`); push yok.
- Yayın pini: `20260930l` · `App.kao*` 42 · App yüzeyi 763 · atama 601 · `onclick` 393 (değişmedi).
- `kao-plan-check`: **PASS** (1 WARN: MediaRecorder+save, kayıt amaçlı) · self-test 30/30 (19 → 30) · taban `d19b457`.
- `tekrar-uret.cjs`: **0/10 PASS** (beklenen; ilk dönüş K2F-02'de R-09).
- Bütçe (perf): içerik 177,657 KiB · runtime 92,431 KiB · css 12,815 KiB (uygulama koduna dokunulmadı).

## Açık riskler
- Canlı kullanıcı Ünite 1 ustalığında kilitli (K4-01) ve gramer görevleri yanlış öğretiyor (K4-02) → Dalga 1 önceliklidir.
- `archive/…/evidence/KAO2-27/A-KABUL.md` her KAO test koşusunda yeniden yazılır (M-11); `kapilar.sh` içeriği geri koyar; K2F-04 kalıcı çözer.
- Yeni handler'lar (K2F-12, K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan.

## Bekleyen kullanıcı işleri
- (Henüz yok.) Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
