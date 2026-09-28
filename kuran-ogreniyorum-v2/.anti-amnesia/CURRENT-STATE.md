# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-04
lastSeq: 15
status: active
-->

Son güncelleme: 2026-09-28 · LEDGER seq15

## Şu an neredeyiz
KAO2-00…03 done (4/28); W0 tamam, W1 sürüyor. KAO2-03 strict tasarım sözleşmesiyle kapandı: 06 §1 tokenları, sadeleştirilmiş tipografi ve süs katmanı temizliği uygulandı. Dal `kao2-yeniden-tasarim`; bu kartın değişiklikleri yerel, commit kapanışında kalacak.

## Sıradaki kartın tek cümlesi
KAO2-04: K-2 üç dosyalı quranLearn ayrımı, gezinme yığını ve NavBar iskeletini uygula; yalnız STATE'teki sıradaki kartı çalıştır.

## Canlı gerçekler
- KAO2-03 strict CSS: 2 ağırlık; uppercase 0; harf aralığı 0; dekoratif pseudo 0; serif 0; 06 §4'teki 13/13 seçici yok.
- Boş/tohumlu 24 görünümde primary eylem ≤1. Switch semantiği KAO2-09'a kadar görünür TODO.
- Kontrast 328 çiftte 0 eşik ihlali; `app/kao.css` gzip 6,411 B (6.26 KiB); perf p95 5.073 ms, içerik 158.372 KiB, runtime 48.923 KiB.
- P3 turu 164/164 PASS: KAO19, app77, panel23, panel-v2 27, quran9; reminder 21 fixture/73 assertion, driver PASS, zikr95/95, contrast ve sync PASS.
- KAO2-03 kaynak/test kanıtı `evidence/KAO2-03/KANIT.md`; strict red/green çıktıları aynı klasörde.
- Önceki konum kapısı düzeltmesi ayrı olarak canlı: commit `c7d5190`, Pages run `36415570405` success, 12 canlı varlık byte/hash eş. Kanıt `docs/evidence/LOCATION-GATE-20260928.json`; kullanıcı cihazı doğrulanmadı.
- Yayın pini `20260928b`; KAO2-03 yayına alınmadı. STATE `releaseApproval` yalnız KAO2-02'ye kadar onaylı.

## Açık riskler
- Eski `kao-plan-check` tam taraması 19 kapsam sorunu bildiriyor; kaynakları yayımlanmış `chore(kao)` teslim kayıtları `c7d5190` ve `a488e5c`. `--self-test` 19/19 PASS. Bu araç §1 P3 listesinde değil; düzeltme önceki commit/araç kapsamını gerektirir ve bu kartta yapılmadı.
- 390 px hub kartı yüksekliği ve gerçek cihaz/görsel kabulü ölçülmedi; bu kartın statik CSS/kontrast kabulünü ikame etmez.
- G1–G4, müfredat/metin onayı, K-3 ses/lisans ve L2 uzman işleri kendi kapılarında; cihaz kabulü kullanıcıda.

## Bekleyen kullanıcı işleri
KAO2-04 için yeni karar gerekmiyor. KAO2-03'ü canlıya alma izni yok; önceki `approved_through_KAO2-02` kapsamı korunuyor. Switch semantiği KAO2-09'da ele alınacak.
