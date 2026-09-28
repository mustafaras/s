# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-04
lastSeq: 16
status: blocked
-->

Son güncelleme: 2026-09-28 · LEDGER seq16

## Şu an neredeyiz
KAO2-00…03 tamamlandı (4/28); KAO2-04, K-2 uygulaması öncesi P6 kapsam/araç koşulunda BLOCKED. Yeni gezinme testi TDD sırasıyla yazılıp ilk kırmızısı kaydedildi; üretim koduna dokunulmadı.

## Sıradaki kartın tek cümlesi
KAO2-04 aynı kart olarak bekliyor: kullanıcı dört KAO test fixture'ının modül yükleme listeleri için kapsam genişlemesini onaylamalı ve `.claude/skills/run-seyma/*.mjs` değişiklikleri için şart koşulan Edit aracı sağlanmalı.

## Canlı gerçekler
- Dal `kao2-yeniden-tasarim`; son commit `d4369b09`; KAO2-04 öncesi çalışma ağacı temizdi.
- KAO2-03 strict tasarım sözleşmesiyle kapandı: 06 §1 tokenları, sade tipografi ve süs katmanı temizliği uygulandı.
- KAO2-03 ölçümleri: font-weight 2; uppercase 0; harf aralığı 0; dekoratif pseudo 0; serif 0; 13/13 seçici kaldırıldı; 24 görünümde primary ≤1; `app/kao.css` gzip 6,411 B; kontrast 328 çift/0 ihlal.
- KAO2-03 P3: 164/164 test PASS; reminder 21 fixture/73 assertion, driver, zikr 95/95, contrast ve sync PASS.
- KAO2-04 engelleri ve ilk kırmızı çıktı `evidence/KAO2-04/KANIT.md` ile `navigation-red.log` içinde.
- KAO2-04 kaynak/test uygulaması başlamadı; P3 kapıları çalıştırılmadı. Yayın yok; cihaz doğrulaması yok.
- Yayın pini `20260928b`; `releaseApproval` yalnız KAO2-02'ye kadar onaylı.

## Açık riskler
- K-2, iki `.claude/skills/run-seyma/*.mjs` dosyasındaki yükleme listelerinin yalnız Edit aracıyla değiştirilmesini şart koşuyor; bu oturumda o araç mevcut değil.
- Zorunlu fail-closed görünüm bağımlılığı mevcut doğrudan yükleme yapan `tests/kao/test_kao_render.js`, `test_kao_user_tasks.js`, `test_kao_requirements.js` ve `test_kao2_design_contract.js` dosyalarının yeni modülleri yüklemesini gerektirir. Bu dört dosya kartın Dokun listesinde değil.
- Eski `kao-plan-check` tam taraması önceki yayımlanmış commitlerde 19 kapsam uyarısı veriyor; `--self-test` 19/19 PASS. Bu kart kapsamı dışı.
- G1–G4, müfredat/metin onayı, K-3 ses/lisans ve L2 uzman işleri kendi kapılarında; cihaz kabulü kullanıcıda.

## Bekleyen kullanıcı işleri
KAO2-04'ün P6 engelini kaldırmak için dört KAO test fixture'ındaki yalnız yükleme listesi değişikliğine onay ve `.claude/skills/run-seyma/*.mjs` için tarif edilen Edit aracına erişim gerekiyor. Kapsam onayı verilene ve araç koşulu sağlanana kadar bu kart dışındaki hiçbir kart yürütülmeyecek.
