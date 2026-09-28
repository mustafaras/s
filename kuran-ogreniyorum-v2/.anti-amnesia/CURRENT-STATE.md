# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-06
lastSeq: 24
status: active
-->

Son güncelleme: 2026-09-28 · LEDGER seq24

## Şu an neredeyiz
KAO2-00…05 tamamlandı (6/28). KAO2-06 geri bildirim/Devam akışı uygulandı ve kartın KAO testleri geçti; kart P3 uygulama ailesindeki kapsam dışı iki App yüzey pini nedeniyle `blocked` durumunda. Sonraki kart açılmadı.

## Sıradaki kartın tek cümlesi
Yalnız KAO2-06'yı sürdür: iki kapsam dışı sayısal App yüzey pinine sınırlı onay alınırsa düzelt, tüm P3 kapılarını yeniden çalıştır ve bu kartı sonuçlandır.

## Canlı gerçekler
- Dal `kao2-yeniden-tasarim`; KAO2-06 önceki commit'i `fd751fcbbdd48917b23ddecec90f82dd7b03d887`.
- KAO 22/22, panel 23/23, panel-v2 27/27, Quran 9/9, reminders 21/21, driver, zikr 95/95 ve kontrast 382 çift/0 ihlal PASS.
- App ailesi 77 fixture'da 75 PASS / 2 FAIL: ölçülen App atamaları 597 (eski pin 596), benzersiz yüzey 759 (eski pin 758). Hatalar `test_app_surface_daily_boundary.js` ve `test_v3_welcome.js`; KAO2-06 Dokun kapsamı dışındadır.
- `kao2-sync-check` PASS; program aktif, nextCard KAO2-06, ledger seq24. KAO2-06 BLOCKED; KAO2-07 başlamadı.
- Son onaylı yayın yalnız KAO2-03…04'tür; bu kart için push/deploy/tag/main birleştirmesi yok. Gerçek cihaz kabulü doğrulanmadı.
- README eski satırında KAO2-03'ü sıradaki gösteriyor; canlı STATE/CURRENT-STATE/prompt KAO2-06'dır. README'ye dokunulmadı.

## Açık riskler
- P3'ü yeşile getirmek için yalnız iki kapsam dışı uygulama testi sayısal pininin güncellenmesi gerekiyor; onay olmadan bu testler değiştirilmedi.
- G1–G4, müfredat/metin, ses/lisans, uzman ve cihaz kararları kendi kapılarına kadar açık kalır.

## Bekleyen kullanıcı işleri
- İstenirse `tests/app/test_app_surface_daily_boundary.js` ve `tests/app/test_v3_welcome.js` dosyalarında yalnız sayısal pinlerin 596→597 ve 758→759 güncellenmesine kapsam onayı ver; sonra aynı KAO2-06'yı FIX kaydıyla açıp bütün P3'ü yeniden çalıştır.
- KAO2-06 kapanana kadar sonraki karta geçme; yayın için ayrıca onay gerekir.
