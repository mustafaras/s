# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-05
lastSeq: 20
status: active
-->

Son güncelleme: 2026-09-28 · LEDGER seq20

## Şu an neredeyiz
KAO2-00…04 tamamlandı (5/28). KAO2-04 saf akış/görünüm iskeleti, gezinme yığını, NavBar/LargeTitle ve yükleme sırası kapatıldı. Tam P3 kapıları PASS; kapanış kanıtı `evidence/KAO2-04/KANIT.md` içinde.

## Sıradaki kartın tek cümlesi
KAO2-05: quranLearnViews içinde saf string bileşenleri (GroupedList, Switch, ProgressRing, Choice, FeedbackSheet, PrimaryButton) kur ve bileşen/design-contract testlerini geçir.

## Canlı gerçekler
- Dal `kao2-yeniden-tasarim`; KAO2-04 kapanış commit'i bir sonraki karttan önce referans alınmalı.
- P3: KAO/app/panel/panel-v2/Kur'an, reminders smoke, driver, zikr ve kontrast PASS; sync PASS.
- Ölçümler: içerik gzip 158.372 KiB/256 KiB; runtime 52.172 KiB/80 KiB; CSS gzip 6.444 KiB/14 KiB; izole p95 3.839 ms/40 ms; kontrast 340 çift/0 ihlal.
- App yüzeyi 758 ve etkileşim sayısı 393; iki değişen sabit test KAO2-04 için kullanıcı tarafından onaylandı.
- KAO2 release approval yalnız KAO2-02'ye kadar. Push/deploy/tag/merge yapılmadı; cihaz kabulü doğrulanmadı.

## Açık riskler
- P3'ü paralel koştururken perf p95 CPU yarışında yükseldi; izole test bu sonucu tekrarlamadı. Performans ölçümünü yoğun paralel yük altında değerlendirme.
- G1–G4, müfredat ve Türkçe metin onayları, K-3 ses/lisans, L2 uzman incelemesi ve cihaz kabulü ilgili sonraki kartların/kullanıcının işidir.

## Bekleyen kullanıcı işleri
- KAO2-05'i sıradaki tek kart olarak yürüt; yayın veya cihaz kabulü iddiası ekleme.
