# KAO-FIX-26 · Kova B/C algı doğruluğu + "Yakın" öz-değerlendirme oranı (10 §9, KF-6)

Dal `kao-duzeltme`, taban `f534a7b`. Yeni `App.*` handler / onclick yok (App 756, onclick 393, App.kao* 35).

## Önce kırmızı
- `node tests/kao/test_kao_render.js` (HEAD kodu + yeni test) → exit 1: "kova B algı doğruluğu kaydı".
- Ara kırmızı (düzeltildi): sayaç ilk hâliyle gölgeleme bloğundaydı → `test_kao_privacy.js` "kayıt bloğu data/depo/senkron/ağa dokunmaz" FAIL; sayaç blok dışına `kaoShadowVerdict`'e taşındı (sözleşme korunur).

## Değişiklikler (`quranLearn.js`)
- `phonicsGrade`: hedef harfin kovası B/C ise `phonics.buckets[B|C]={n,ok}`.
- `kaoRecordDiscard` → yalnız `recorded` aşamasında (kendi kaydını modelle karşılaştırdıysa; izin reddinde "Kapat" sayılmaz) `kaoShadowVerdict`: `phonics.self={near,n}` ("Yakın" yakın; "Tekrar"/sil değil). Kayıt (Blob) asla kalıcı değil.
- Telaffuz stüdyosu ana ekranı: "Algı doğruluğu · Kova B: %X (n) · Kova C: %Y (n) · hedef ≥%85" + "Yakın: a / b (puan değil)".
- `ensureQuranLearn`: `buckets`/`self` yalnız varsa normalleşir (ok ≤ n, near ≤ n); taze şekil değişmez.
- Kapsam dışı (belgeli): "4 hafta sonra yeni okuyucu sesiyle" genelleme testi — ikinci okuyucu ses varlığı repoda yok.

## Kontroller
- kao 17/17 (privacy dahil) · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · driver 0 · zikr 0 (95/95) · rebind 0 · shell-inventory PASS · plan-check PASS (6 warn) · kontrast 336/0 · diff-check ok
- `quranLearn.js` **1.899** satır (KF-2 tavanı 1.900) · PIN-P `20260927f` → `20260927g` (9 dosya, eski 0)
- 10 §9 durum satırı → Büyük ölçüde uygulandı (KAO-FIX-26)

## Kalan risk
- Cihazda doğrulanmadı. Satır bütçesi doldu: sonraki kod değişikliği bölme (sonraki program) ya da tavan kararı ister.
