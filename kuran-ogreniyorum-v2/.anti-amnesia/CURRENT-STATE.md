# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-12
lastSeq: 48
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq48

## Şu an neredeyiz
KAO2-00…11 tamamlandı; son yayın KAO2-11 (`e827d24b`, Pages run 36545143962, canlı 16/16 hash eşliği). KAO2-12'nin ders planı, oynatıcısı, FSRS ortak yanıt yolu ve A-1 üç dokunuş akışı uygulanmış durumda. Kullanıcı seq47'de dört P6 fikstürünün sınırlı güncellemesini onayladı; bunlar ve fx2 pinleri güncellendi. P3'ün diğer aileleri, strict tasarım, kontrast ve izole performans kapıları PASS. KAO ailesi `tests/kao/test_kao_render.js:87` eski `App.kaoStart()` eylem assertion'ında durdu. P6 gereği kart yeniden bloke edildi; yalnız bu assertion için kapsam onayı bekleniyor.

## Sıradaki kartın tek cümlesi
KAO2-12: `tests/kao/test_kao_render.js:87` içindeki eski günlük eylem assertion'ını onay sonrası yeni ders rotasına geçir; tam KAO/P3 kapılarını yeşile getir ve kartı tek committe kapat.

## Canlı gerçekler
- Release approval yalnız KAO2-11'e kadar (`approved_through_KAO2-11`); KAO2-12 push/deploy/tag yok.
- Ders oynatıcı üretimi önceki committe var: `app/core/quranLearnFlow.js`, `quranLearn.js`, `quranLearnViews.js`, `app/kao.css`, `app.js` shim.
- Kullanıcının seq47 onayıyla `test_kao2_today.js`, `test_kao_user_tasks.js`, `test_app_surface_daily_boundary.js`, `test_v3_welcome.js` gerekli eylem/pin satırları güncellendi; `test_fx2_touch_coverage.js`, `test_fx2_tab_transition.js`, `test_fx2_overlay_motion.js` pinleri de güncellendi.
- `test_kao2_today` 7/7, `test_kao_user_tasks` R-C9 3 dokunuş, `test_kao2_lesson_flow` 8/8, onboarding 15/15, strict tasarım PASS; kontrast 496 çift/0 ihlal; performans tek başına p95 4.382 ms.
- P3 KAO dışında app, panel 23/23, panel-v2 27/27, Quran, reminders, driver, zikr 95/95, sync PASS. Tam KAO ailesi ilk sınır-dışı kırmızı testte P6 gereği durduruldu.
- Yeni blocker tam olarak `tests/kao/test_kao_render.js:87`: eski `App.kaoStart()` beklentisi; gerçek eylem `App.kaoLesson("start","u01.01")`.
- Kanıt düzeyi kaynak/test; yayın ve cihaz kabulü yok. KAO2-13'e geçme.

## Bekleyen kullanıcı işi
- Yalnız `tests/kao/test_kao_render.js:87` eylem assertion'ını yeni `App.kaoLesson("start","u01.01")` sözleşmesine güncelleme kapsamını onayla; başka assertion değişmeyecek.
