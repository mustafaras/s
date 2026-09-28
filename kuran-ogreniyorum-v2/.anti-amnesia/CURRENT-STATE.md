# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-04
lastSeq: 18
status: blocked
-->

Son güncelleme: 2026-09-28 · LEDGER seq18

## Şu an neredeyiz
KAO2-00…03 tamamlandı (4/28). KAO2-04'ün akış/görünüm iskeleti, gezinme yığını, NavBar ve ilgili yükleme sıraları uygulandı. KAO ve bağımsız ailelerin kapıları yeşil; genel uygulama P3 kapısı iki kapsam dışı sabit App yüzeyi beklentisinde durdu. Kart `blocked`, `nextCard` aynı KAO2-04.

## Sıradaki kartın tek cümlesi
Kullanıcı iki etkilenen uygulama testindeki sabit handler/yüzey sayılarını güncelleme kapsamını onaylarsa KAO2-04'ü sürdür, yalnız o test pinlerini düzelt, tüm P3'ü yeşil çalıştır ve kartı tek committe kapat.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim`; son kapanış commit'i P6 gereği bu kart için BLOCKED kaydıdır.
- Yeni saf gezinme modülü, saf görünüm/NavBar katmanı ve quranLearn entegrasyonu testlerde çalışıyor; UI ekranı 11 görünüm başlığını gösteriyor, yığında önceki görünüm adına dönüyor.
- Dört KAO render fikstürü ve iki run-seyma FILES listesi yeni modülleri doğru sırada yüklüyor; `index.html`, `sw.js`, IIP-22 varlık listesi ve state-rebind listesi eşlendi.
- Gzip: içerik 158.372 KiB/256 KiB, runtime 52.172 KiB/80 KiB, CSS 6.444 KiB/14 KiB; tek başına p95 3.839 ms/40 ms; kontrast 340 çift/0 ihlal.
- KAO2 release approval KAO2-02 sonrasını kapsamıyor. Push, deploy, tag, merge yapılmadı; cihaz kabulü doğrulanmadı.

## Açık riskler
- `tests/app/test_app_surface_daily_boundary.js` 594 assignment / 756 unique handler sabitini, `tests/app/test_v3_welcome.js` 756 yüzey sabitini pinliyor. KAO2-04'ün iki shim'i sayıları 596 / 758'e çıkarıyor. İki test KAO2-04 Dokun listesinde değil; kullanıcı onayı alınmadan değiştirilmeyecek.
- P3 KAO performans ölçümü paralel yük altında bir kez 6.621 ms ile taban +%25'i aştı; izole tam KAO tekrarı ve tekil perf kapısı PASS (3.839 ms).
- G1–G4, müfredat ve Türkçe metin onayları, K-3 ses/lisans, L2 uzman incelemesi ve cihaz kabulü sonraki ilgili kartların/kullanıcının işidir.

## Bekleyen kullanıcı işleri
- KAO2-04 kapsamını yalnız `tests/app/test_app_surface_daily_boundary.js` ve `tests/app/test_v3_welcome.js` içinde sabit yüzey sayısı güncellemesi için genişletme onayı.
- Onaydan sonra aynı kartı sürdür; P3 genel app ailesi dahil tüm kapıları tekrarla. KAO2-05'e geçme.
