# KAO2-04 — BLOCKED: yükleme listesi düzenleme kısıtı ve test kapsamı
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: d4369b09

## Yapılan
- KAO2-04'ün yeni gezinme testi önce yazılıp çalıştırıldı; ilk anlamlı hata `kaoNav` API'sinin henüz bulunmamasıydı. Çıktı `navigation-red.log` içinde.
- P6 kapsam kapısı nedeniyle üretim koduna ve mevcut test fixture'larına dokunulmadı.
- Senkron denetimi: `node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs` → PASS (4/28 done, nextCard KAO2-04, ledger seq16).
- `git diff --check` → PASS. BLOCKED kaydı dışındaki P3 kapıları, P6 gereği çalıştırılmadı.

## Bloklayan koşullar
- K-2, `.claude/skills/run-seyma/driver.mjs` ve `zikr-harness.mjs` yükleme listelerini yalnız **Edit** aracıyla değiştirmeyi şart koşuyor. Bu oturumda adlandırılmış Edit aracı yok; mevcut düzenleme aracı `apply_patch`. Belirtilen yöntemin dışına çıkılmadı.
- `quranLearn.js`'in yeni görünüm kaydını fail-closed yapması istenirken mevcut `tests/kao/test_kao_render.js`, `test_kao_user_tasks.js`, `test_kao_requirements.js` ve `test_kao2_design_contract.js` doğrudan `quranLearn.js` yükleyip kayıt/çizim yapıyor. Bu yükleyicilerin yeni modülleri açılış listelerine eklenmesi gerekir; bu dört dosya KAO2-04'ün Dokun listesinde yok. Bunları değiştirmek veya fail-closed sözleşmesini gevşetmek P6 kapsamını aşar.

## Gerekli karar / devam yolu
- Kullanıcı, bu dört test dosyasının yalnız KAO2 modül yükleme listeleri için KAO2-04 kapsamına eklenmesini onaylayabilir.
- `.claude/skills/run-seyma/*.mjs` değişiklikleri, oturumda Edit aracı sağlandığında yapılabilir. İki FILES listesine `app/core/quranLearnFlow.js` ve `app/core/quranLearnViews.js` satırları `app/core/quran.js` satırından önce eklenmeli; böylece KAO testinin bitişik quran/quranLearn/saygi sırası korunur.
- Bu iki koşul çözülmeden KAO2-04 uygulamasına başlanmadı; sonraki kart çalıştırılmadı.

## Kapılar ve kanıt düzeyleri
- TDD kırmızı: `node tests/kao/test_kao2_navigation.js` → beklenen ilk eksik API: `kaoNav`.
- P3 kapıları: P6'da durulduğu için çalıştırılmadı.
- Senkron: PASS.
- Kaynak/test: yalnız plan öncesi kontrol ve beklenen TDD kırmızısı · Yayın: yok · Cihaz: yok.
