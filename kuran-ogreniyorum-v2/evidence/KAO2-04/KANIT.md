# KAO2-04 — Üç dosya iskeleti, gezinme yığını ve NavBar
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: 30662403

## Yapılan
- Saf `SeymaQuranLearnFlow` yığın API'si ve kayıt bağımlılık torbası alan `SeymaQuranLearnViews` NavBar/LargeTitle katmanı eklendi; motor mevcut görev ve içerik mantığını korudu.
- `ui.kaoStack` tembel kurulur, `kaoView` tepeden türetilir; `kaoNav` ekrana yönlendirir, `kaoBack` önceki ekrana döner. `kaoOpen` kök yığınla açar, `kaoClose` temizler, `kaoSetView` `[home, view]` uyumunu korur.
- 11 görünüm başlığı, kökte Kapat ve iç ekranlarda önceki ekran adı; eski başlık alanları ve Geri denetimleri NavBar/LargeTitle'a taşındı. Escape/modal sözleşmesi korunuyor.
- Flow→Views→quranLearn sırası `index.html`, `sw.js`, driver, zikr harness, state-rebind ve varlık fikstüründe eşlendi. `app.js`'te sadece KAO shim satırına iki shim eklendi.
- Seq18 BLOCKED engeli kullanıcı onayıyla seq19'da çözüldü. İki onaylı uygulama testinin yüzey pinleri güncellendi.

## TDD
- Kırmızı: `node tests/kao/test_kao2_navigation.js` → `AssertionError: yığın gezinmesi için kaoNav olmalı`; ilk çıktı `navigation-red.log` içinde.
- Yeşil: `node tests/kao/test_kao2_navigation.js` → PASS; ardışık yığın geri dönüşü, ana ekrandan okuyucuya gidip dönme, 11 başlık, LargeTitle, eski başlık/geri denetimlerinin kalkması, Kapat ve Escape doğrulandı.
- Kapsam kapısı kırmızısı: app testleri ölçülen yüzey 596/758 iken eski 594/756 pinlerinde kaldı. Kullanıcı seq19'da yalnız iki sayısal pin dosyasını güncellemeyi onayladı; test mantığı değişmedi ve ikisi de yeşil oldu.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `node --check` quranLearn / Flow / Views | PASS |
| CurriculumV2 sözdizimi | Atlandı; dosya henüz yok |
| `tests/kao/test_*.js` | PASS; tam aile izole tekrarlandı |
| `tests/app/test_*.js` | PASS; iki sabit yüzey pini 596/758 ile eşlendi |
| `tests/panel/test_*.js` | PASS |
| `tests/panel-v2/test_panel_v2_*.js` | PASS |
| `tests/quran/test_*.js` | PASS; yerel koruma uyarıları testlerin beklenen çıktısı |
| `tests/reminders/run-reminder-smoke.mjs` | PASS; 21 seçili fikstür |
| run-seyma `driver.mjs` | PASS |
| run-seyma `zikr-harness.mjs` | PASS; 95/95 |
| `kao-verify-contrast.mjs` | PASS; 340 çift, eşik altı 0 |
| `kao2-sync-check.mjs` | PASS; 5/28 kart done, nextCard KAO2-05, ledger seq20 |

## Ölçümler
- İçerik gzip **158.372 KiB / ≤256 KiB**; çalışma zamanı **52.172 KiB / ≤80 KiB**; CSS gzip **6.444 KiB / ≤14 KiB**.
- İzole p95 **3.839 ms / ≤40 ms**.
- KAO handler toplamı **35→37**; birleşik App yüzeyi **756→758**; App function assignment **594→596**; etkileşim sayısı **393** olarak kaldı.
- NavBar başlığı ve LargeTitle kapsamı **11/11**; nav yığını ve geri hedefleri PASS.

## Bilerek değişen testler
- Dört onaylı KAO fikstüründe yalnız yeni modül yükleme sırası eklendi.
- FX2 yüzey pinleri iki yeni shim nedeniyle 756→758 olarak güncellendi; etkileşim sayısı değişmedi.
- `tests/app/test_app_surface_daily_boundary.js`: App assignment 594→596 ve benzersiz yüzey 756→758; gerekçe KAO2-04'ün iki shim'i ve seq19 kullanıcı onayı.
- `tests/app/test_v3_welcome.js`: yüzey 756→758; gerekçe aynı iki shim ve seq19 kullanıcı onayı.

## Kanıt düzeyleri
- Kaynak/test: PASS · yayın: doğrulandı (`release-live.json`) · cihaz: doğrulanmadı (kullanıcıda).

## Sürprizler / backlog
- P3'ü paralel çalıştırırken perf p95 bir kez 6.621 ms ölçülüp taban +%25 eşiğini aştı; yük kalkınca tekil perf 3.839 ms ve tam KAO ailesi PASS verdi.
- KAO2-05 sıradaki kart; bu commit yalnız KAO2-04'ü kapatır.
