# KAO-FIX-21 · "Bağ kur" görevi (02 §5.6, KF-6 şimdi uygula)

Dal `kao-duzeltme`, taban `036b67b`. Yeni `App.*` handler / onclick yok (App 756, onclick 393, App.kao* 35).

## Önce kırmızı
- `node tests/kao/test_kao_requirements.js` (HEAD kodu + yeni test, `$TMPDIR/red21`) → exit 1: "prior=3: 5. yeni kelimeden sonra bağ kur".

## Tasarım ve sapma
- Prompt taslağı "her 5 yeni kelimede bir". Oturum başına sayım ilk günlerde hiç tetiklenmez (yeni kelime 3–9; gramer/parça/ters yön bütçeyi paylaşır), bu yüzden **toplam** sayaç: `introducedAt`'lı ar>tr kart sayısı + oturumdaki sıra; 5'in katından sonra görev eklenir. Yeni veri alanı yok.
- Hedef: son 5 yeni kelimeden Türkçe türevi (`cognate.tr`) olan ilki. Çeldiriciler başka kökten, anlam parçası çakışmayan 3 türev (seeded). Arapça yalnız sözlük modülünden (V3).
- `kaoStart` ekler (saf `kaoBuildQueue` sözleşmeleri değişmez); gece oturumunda yok. `kaoAnswer`: FSRS kartı yazmaz, `daily[gün].link={n,ok}`, undo yok, yanlışta doğru türev geri bildirimi.
- Panel özeti (R-C8 izin listesi) değişmedi: bağ kur sayacı panele yansımaz (gizlilik sözleşmesi, M14).

## Kontroller
- kao 17/17 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · driver 0 · zikr 0 (95/95) · rebind 0 · shell-inventory PASS · plan-check PASS (6 warn) · kontrast 336/0 · diff-check ok
- `quranLearn.js` 1.865 satır (≤1.900, KF-2) · PIN-P `20260927a` → `20260927b` (9 dosya, eski 0)
- `kao-sim.js . 365`: görev 8.358 → 8.502 (bağ kur), maxRun 2 · ihlal 0 · grammarMax 4 · iki yön 524 · kod=plan 510 · hata 0 · 471,7 KB; taş tarihleri RNG tüketimi nedeniyle kaydı, `eighty` kazanılıyor
- 02 §5.6 durum satırı → Uygulandı (KAO-FIX-21)

## Kalan risk
- Cihazda doğrulanmadı. Bağ kur sonuçları istatistik ekranında gösterilmez (yalnız `daily.link`).
