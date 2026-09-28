# KAO2-04 — BLOCKED: mevcut App yüzeyi pinleri kapsam dışında
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: bef53724

## Yapılan
- Saf akış IIFE'si ve bağımlılık torbasıyla kayıt olan görünüm/NavBar/başlık katmanı eklendi; `kaoView` yığın tepesinden türetiliyor, `kaoOpen`/`kaoClose`/`kaoSetView` ve gezinme handler'ları uyumlu hale getirildi.
- Üretim script sırası, service worker varlık listesi, iki run-seyma FILES listesi ve state-rebind test listesi aynı sırayla güncellendi; app.js'te yalnız izinli KAO shim satırı değişti.
- Onaylı dört KAO render fikstürü yeni modülleri yüklüyor. App kapsam pini +2 güncellendi; tıklama sayısı 393 kaldı.
- Modal test harness'ında yeni akış modülü yoksa route state geçişi eski birim sözleşmesiyle çalışır; gerçek overlay çizimi ise akış/görünüm modülü olmadan fail-closed kalır.

## TDD
- Kırmızı: `node tests/kao/test_kao2_navigation.js` → `AssertionError: yığın gezinmesi için kaoNav olmalı` (ilk uygulama öncesi çıktı `navigation-red.log`).
- Yeşil: `node tests/kao/test_kao2_navigation.js` → PASS; çoklu geri dönüş, ana ekrandan okuyucu geri dönüşü, 11 görünüm başlığı, LargeTitle ve eski başlıkların kalkması, kök Kapat ve Escape sözleşmesi doğrulandı.
- Yeşil regresyon: tam `tests/kao/test_*.js` döngüsü izole yeniden çalıştırmada PASS.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `node --check` quranLearn / Flow / Views | PASS |
| CurriculumV2 sözdizimi | Uygulanamaz; dosya henüz yok |
| `tests/kao/test_*.js` | PASS; izole tam tekrar |
| `tests/app/test_*.js` | BLOCKED: `test_app_surface_daily_boundary.js` 594 atama / 756 benzersiz yüzey sabitini ölçüyor; beklenen yeni değerler 596 / 758 |
| `tests/app/test_v3_welcome.js` hedefli kontrol | FAIL: aynı iki shim nedeniyle yüzey 758, test pini 756 |
| `tests/panel/test_*.js`, `tests/panel-v2/test_panel_v2_*.js`, `tests/quran/test_*.js` | PASS |
| `tests/reminders/run-reminder-smoke.mjs` | PASS; 21 seçili fikstür |
| run-seyma `driver.mjs` | PASS |
| run-seyma `zikr-harness.mjs` | PASS; 95/95 |
| `kao-verify-contrast.mjs` | PASS; 340 çift, eşik altı 0 |
| `kao2-sync-check.mjs` | PASS; bu BLOCKED kapanışı sonrası tekrar çalıştırılacak |

## Ölçümler
- İçerik gzip 158.372 KiB / ≤256 KiB; `quranLearn*` çalışma zamanı 52.172 KiB / ≤80 KiB; CSS gzip 6.444 KiB / ≤14 KiB.
- İzole p95 3.839 ms / ≤40 ms. Paralel P3 çalıştırmasında 6.621 ms ile taban +%25 eşiği aşıldı; kaynak yoğunluğu bitince tek başına tekrar PASS verdi.
- App yüzeyi 756 → 758; KAO handler toplamı 35 → 37; tıklama niteliği sayısı 393, değişmedi.
- NavBar başlık kapsamı 11/11; geri hedefleri ve modal kapanış semantiği testi PASS.

## Bilerek değişen testler
- Dört KAO render fikstüründe yalnız script yükleme sırası eklendi; kullanıcı davranışı beklentisi değişmedi.
- FX2 yüzey testlerinde App pinleri 756 → 758 yapıldı; iki yeni shim nedeniyle, etkileşim sayısı 393 olarak korundu.
- `tests/app/test_app_surface_daily_boundary.js` ve `tests/app/test_v3_welcome.js` pinleri güncellenmedi; bu iki dosya KAO2-04 Dokun listesinde değil ve kullanıcı onayı bekliyor.

## Kanıt düzeyleri
- Kaynak/test: kısmi PASS; KAO, panel, panel-v2, Kur'an, reminder, sürücü, zikr ve kontrast kapıları yeşil; genel uygulama kapısı iki kapsam dışı sabitte durdu.
- Yayın: yok; push/deploy yapılmadı.
- Cihaz: doğrulanmadı; kullanıcı cihazı kabulü bekliyor.

## Blok / sonraki işlem
- KAO2-04, genel P3 uygulama testlerini yeşil yapmak için iki kapsam dışı test dosyasındaki sabit yüzey sayılarını 596/758'e eşleştirmek üzere BLOCKED.
- `KAO2-STATE.json.backlog` ve LEDGER seq18 kapsam kararını kaydeder. Kullanıcı onayından sonra yalnız bu iki test pinini güncelle, ilgili app testlerini ve tüm P3'ü tekrar çalıştır, sonra KAO2-04'ü kapat.
- Açık içerik/müfredat/lisans kararları bu kartın kapsamı değil; KAO2-05'e geçilmedi.
