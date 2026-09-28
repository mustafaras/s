# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-09
lastSeq: 32
status: active
-->

Son güncelleme: 2026-09-28 · LEDGER seq32

## Şu an neredeyiz
KAO2-00…08 tamamlandı (9/28). G2 kapandı (seq31; Ünite 6 dengelemesi FIX seq30). KAO2-08 "sıradaki adım" motoru yerel commit olarak kapandı. KAO2-07…08 yayımlanmadı (push/deploy yok).

## Sıradaki kartın tek cümlesi
KAO2-09: Bugün ekranı (S-02) — `kaoNextStep` çıktısını ana ekranın tek birincil kartı yapan görünüm; eski `kaoHomeHTML` gövdesi views'a devredilir.

## Canlı gerçekler
- Müfredat: 12 ünite · 109 ders · 524/524 lemma; Ü6 147/30, Ü10 98/20 (G2 dengelemesi); araç `node tools/kao2-curriculum-build.mjs`, değişiklik yalnız spec üzerinden.
- `SeymaQuranLearnFlow`: gezinme yığını + saf `curriculum/lessonOf/lessonProgress/unitProgress/nextStep/estimateMinutes`; yasaklı API yok.
- `nextStep` sırası: onboarding → night-review → warmup (7+ gün) → s0-lesson → mastery → next-unit → daily (tekrar ≤20, borç >60 → yeni 0) → rest.
- `ensureQuranLearn`: `onboarding` (kartlı kullanıcı `legacy`) ve `path` normalizasyonu; `kaoContinue` oturum sonunda `daily[today].sessionDone`; motor `kaoNextStep(now)` (App handler değil).
- Boyut: runtime gzip 58,813 KiB (≤80); içerik 168,483 KiB (≤256); VM p95 ≈4,2 ms. Pin `20260928b`.
- P3: syntax, KAO 24/24, app 77/77, panel 23/23, panel-v2 27/27, Quran 9/9, reminders, driver, zikr 95/95, kontrast 382/0, sync PASS.
- `KAO2-STATE.json`: KAO2-08 done, nextCard KAO2-09, ledger seq32, G2 closed, releaseApproval `approved_through_KAO2-06`.
- Son yayın hâlâ KAO2-05…06 (`b36db6b2`); cihaz kabulü doğrulanmadı. README eski KAO2-03 satırı değiştirilmedi.

## Açık riskler
- `nextStep` action tanımlayıcıları `kaoOnboarding`, `kaoOpenS0`, `kaoMastery` henüz handler değil (KAO2-09/11/12).
- `daily.ms` yazılmıyor; süre tahmini 0,55 dk/görev yedeğinde (KAO2-12 backlog).
- Ü6 hâlâ 147 kelime; Ü5 10, Ü12 11 (G2'de kabul edildi). Tüm metinler draft (K-4 L1/L2 yok).
- G1, G3, G4 açık; kaynak/test kanıtı cihaz kabulü değildir.

## Bekleyen kullanıcı işleri
- KAO2-07…08 yayını (push/deploy) ayrı onay ister.
