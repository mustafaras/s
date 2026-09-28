# KAO-FIX-15 · Kuyruk ve şema ince ayarları (D-2, D-5) — kanıt

Dal `kao-duzeltme`, taban `e6320f0` (= origin/main). Kod: `app/core/quranLearn.js` (1.857 satır, ≤1.900).

## Önce kırmızı (HEAD kodu + yeni testler, `$TMPDIR/kao-red-fix15` = `git archive HEAD`)
- `node tests/kao/test_kao_queue.js` → exit 1: "1.000 oturumda en uzun aynı-tür dizisi 4 > 2"
- `node tests/kao/test_kao_render.js` → exit 1: "learning kartı durable30 değil"; soldurma düzeltmesinden sonra kognat adımı exit 1 (`errorClass` undefined ≠ 'cognate')
- `node tests/kao/test_kao_requirements.js` → exit 1: "learning kartında soldurma yok"

## Değişiklikler
1. KF-9: `kaoBuildQueue` ardışık aynı tür ≤2 kuralındaki `item.type!=='grammar'` muafiyeti kalktı. Yalnız gramer kalınca döngü durur (oturum kısalır; `test_kao_queue` belgeler: salt gramer adayı → 2 görev). Dört gramer türü karma oturumda korunur.
2. KF-3: kod 4 kalır (varsayılan); plan 4'e FIX-16'da. 1.000 oturumda gramer ≤4, parça ≤2 testi.
3. R-B5 / 02 §5.3: kelime görevine `durable30 = isSettled(card,30)` (review ∧ s≥30, yetim/okuyucu-bilinmeyen değil — tek kalıcılık kuralı, tuzak 16); soldurma `!task.isNew` yerine `task.durable30===true`. Test: learning ve review s=29,9'da `.kao-fade` yok, s=30'da var.
4. Kognat: kelime görevinde hedefte `cognate.shift` varsa `errorClass:'cognate'`; yanlış cevap `errors.cognate` +1, kayma yoksa artmaz.
5. `errors.sound` kelime görevinde artmaz (bilinçli; telaffuz hataları `phonics.misheard`'e gider). Kod değişmedi; testte korunur.
6. Kısa kart anahtarları (05 §2 `st/n/l`) uygulanmadı: göç riski sync bütçesinden büyük; FIX-16 belgeye işler.
7. PIN-P `20260926l` → `20260926m` (9 dosya; `SW_VERSION` + `SW_OFFLINE_VERSION`; eski pin 0).

Sapma: `test_kao_requirements` soldurma fixture'ı kartı açıkça review s≥30 kurar, `newTask` kart yokken kurulur, blok sonunda kart silinir (sonraki otomatik-ses kontrolleri yeni kart ister).

## Kontroller (çalışma ağacı)
- `tests/kao/*.js` 17/17 PASS · `tests/app` 77/77 · `tests/panel` 23/23 · `tests/panel-v2` 27/27 · `tests/quran` 9/9
- driver exit 0 · zikr exit 0 (95/95) · rebind exit 0 · shell-inventory `--gate` PASS · plan-check PASS (1 warn, HEAD'de de aynı) · `diff --check` ok
- `kao-verify-contrast.mjs` 336 çift, 0 eşik altı
- Pinler: App 756 · onclick 393 · v3 556 · surface 594 (fx2/v3/surface fixture'ları PASS); `App.kao*` = 35
- `kao-sim.js <repo> 365` (aynı START): HEAD maxSameTypeRun 4 / ihlal 4 / grammarMax 4 / kod=plan 506 → yeni **maxSameTypeRun 2 / ihlal 0 / grammarMax 4** / iki yön 524/524 / kod=plan 510 / hata 0; oturum min 2 · medyan 23 · maks 47
- `kao-mutate.mjs` (çalışma ağacı kopyası `$TMPDIR/kao-mut-*`, hedef `case`+`-d` ile doğrulandı) → 17/17 YAKALANDI (M02 `test_kao_queue` düşürür)

## Kalan risk
- Salt gramer kalan günlerde oturum kısalır (kabul). Soldurma yalnız s≥30 kartta: ilk haftalarda görünmez. Cihazda doğrulanmadı.
