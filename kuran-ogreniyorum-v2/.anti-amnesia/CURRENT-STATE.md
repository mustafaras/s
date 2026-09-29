# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-12
lastSeq: 46
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq46

## Şu an neredeyiz
KAO2-00…11 tamamlandı; son yayın KAO2-11 (`e827d24b`, Pages run 36545143962, canlı 16/16 hash eşliği). KAO2-12 için `lessonPlan`, ders oynatıcısı, FSRS ortak yanıt yolu ve A-1 üç dokunuş akışı çalışılıyor. Lesson-flow testi 8/8, onboarding testi 15/15 PASS. P3 KAO kapısında iki eski eylem beklentisi kırmızı oldu; §1 P6 gereği kart bloke edildi ve değiştirilen test dışı dosyalara onay bekleniyor.

## Sıradaki kartın tek cümlesi
KAO2-12: `daily`/`s0-lesson`/`mastery` eylemlerini ders oynatıcısına geçir; P6 kapsamında gereken belirli test/pin satırlarını kullanıcı onayından sonra güncelle, tüm P3 kapılarını yeşile getir ve kartı tek committe kapat.

## Canlı gerçekler
- Release approval yalnız KAO2-11'e kadar (`approved_through_KAO2-11`); KAO2-12 push/deploy/tag yok.
- KAO2-12 uygulama dosyaları: `app/core/quranLearnFlow.js`, `quranLearn.js`, `quranLearnViews.js`, `app/kao.css`, `app.js` yalnız `App.kaoLesson` shim'i; yeni `tests/kao/test_kao2_lesson_flow.js` ve A-1 genişletilmiş `tests/kao/test_kao2_onboarding.js`.
- Test makbuzları: syntax 4/4 PASS; lesson-flow 8/8 PASS; onboarding 15/15 PASS. `test_kao2_today.js` daily eylem için eski `App.kaoStart()` bekliyor. `test_kao_user_tasks.js` ana eylem için eski `kaoStart` bekliyor. İki fikstür de değiştirilmedi.
- Henüz çalıştırılmadı: tam KAO/app/panel/panel-v2/Quran/reminder P3 aileleri, driver, zikr, kontrast; FX2 pinleri ve sync-check P6 commit öncesi çalıştırılacak.
- App yüzeyi son yayın ölçüsü 760 handler / 393 onclick'ti; KAO2-12'nin `App.kaoLesson` ve görünüm markup ölçümleri KAO2-11 onayının dışındadır.
- Kanıt düzeyi kaynak/test; yayın ve cihaz kabulü yok. Cihaz kabulü kullanıcıda.

## P6 kapsam engeli
Yalnız KAO2-12 `Dokun` listesindeki dosyalara izin var. Yeni rota davranışı şu dış fikstürleri eski beklenti nedeniyle kırıyor: `tests/kao/test_kao2_today.js`, `tests/kao/test_kao_user_tasks.js`. `App.kaoLesson` sayacı/onclick pimi için `tests/app/test_app_surface_daily_boundary.js` ve `tests/app/test_v3_welcome.js` gerekir. KAO2-11 seq42 onayı bu karta taşınmaz. Kullanıcı bu dört dosyada yalnız ilgili assertion/pin güncellemelerini onaylarsa sürdür.

## Bekleyen kullanıcı işi
KAO2-12'nin P6 çözümü için yukarıdaki dört test dosyasına sınırlı kapsam genişletmesini onayla ya da uygulama değişikliklerinin geri alınmasını iste. Onay yokken bu dört dosyaya dokunma; nextCard KAO2-12 olarak kalır.
