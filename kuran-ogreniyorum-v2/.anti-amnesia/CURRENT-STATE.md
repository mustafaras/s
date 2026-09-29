# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-13
lastSeq: 52
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq52

## Şu an neredeyiz
KAO2-00…12 tamamlandı. KAO2-12 ders oynatıcısı, A-1 üç dokunuş başlangıç yolu ve onaylı tam KAO kapısı düzeltmeleri test edildi. Seq49 onayıyla yalnız `test_kao_render.js:87` günlük eylem assertion'ı yeni `App.kaoLesson("start","u01.01")` rotasına geçirildi. Tam KAO setinde bulunan `dailyNew=0` değerinin `||10` ile kaybolması düzeltildi; 60 vadesi gelmiş görev sınırı tekrar geçti. KAO2-12 ve ayrıca onaylanan İlham & İbadet Arapça sekmesi `94f866a6` kaynağından Pages'te yayımlandı; run `36565235609`, runtime hash eşleşmesi 9/9. Cihaz kabulü doğrulanmadı.

## Sıradaki kartın tek cümlesi
KAO2-13: Yol (S-03) ve Ünite (S-04); henüz başlanmadı. Kullanıcının onayladığı İlham & İbadet Arapça sekmesi ayrı istek olarak bu kart sınırının dışında ele alınacak.

## Canlı gerçekler
- Release approval KAO2-12 ve ayrıca onaylı İlham & İbadet Arapça sekmesini kapsıyor (`approved_through_KAO2-12`); Pages run `36565235609` success, canlı runtime 9/9 SHA-256 eşleşti.
- Ders oynatıcı üretimi önceki committe var: `app/core/quranLearnFlow.js`, `quranLearn.js`, `quranLearnViews.js`, `app/kao.css`, `app.js` shim.
- Seq47 onayıyla `test_kao2_today.js`, `test_kao_user_tasks.js`, `test_app_surface_daily_boundary.js`, `test_v3_welcome.js` gerekli eylem/pin satırları ve KAO2-12 içi fx2 pinleri güncellendi; seq49 yalnız `test_kao_render.js:87` assertion'ını açtı.
- KAO suite 28/28, lesson-flow 8/8, today 7/7, user_tasks 3-touch, onboarding 15/15, design contract PASS; kontrast 496 çift/0 ihlal; izole perf p95 4.587 ms (≤5.088 ms baseline+%25).
- P3: app 77/77, panel 23/23, panel-v2 27/27, Quran 9/9, reminders smoke 21 curated, driver PASS, zikr 95/95, syntax/sync PASS.
- `KAO2-STATE.json.releaseApproval=approved_through_KAO2-12`; KAO2-12 ve Arapça sekme yayını doğrulandı (`94f866a6`, Pages `36565235609`, 9/9 canlı hash). Cihaz kabulü ayrı ve doğrulanmadı. KAO2-13 henüz başlamadı.

## Teslim edilen kapsam
- Canlı teslim: IIP Bugün’deki küçük KAO kartı altıncı "Arapça" sekmesine taşındı; tam genişlik ders özeti, salt-okunur KAO ilerlemesi, Tanış → Kavram → Pekiştir → Uygula yolu ve mevcut `App.kaoOpen()` CTA. Kalıcı veri/yeni App handler eklenmedi; 44px hedefler korundu.
- KAO2-13 başlatma onayı yok; bu kartın dışına geçilmedi.
