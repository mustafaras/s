# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-10
lastSeq: 34
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq34

## Şu an neredeyiz
KAO2-00…09 tamamlandı (10/28). KAO2-09 Bugün ekranı (S-02) yerel commit olarak kapandı. Kullanıcı 2026-09-29'da "canlıya al" dedi; KAO2-07…09 yayını bu kapanıştan sonra ayrı makbuz commit'iyle kaydedilir.

## Sıradaki kartın tek cümlesi
KAO2-10: Hub kartı v2 — İlham & İbadet'teki KAO kartını `kaoNextStep` ile tek eylemli, sade bir karta dönüştür.

## Canlı gerçekler
- Ana ekran: HeroCard (nextStep; tek `.kao-primary`) + Yolun (seviye/ünite ilerlemesi; kapsam yalnız bilinen ≥1, sıfır kullanıcıda "İlk hedef") + Keşfet (Kısa sûreler, Namazda ne diyorum, Telaffuz stüdyosu, Günün âyeti) + Sen (İlerleme, Ayarlar).
- Eylem eşlemesi: daily/next-unit/warmup/night/onboarding/mastery → kaoStart; s0 → kaoGate("start"); rest → kaoOpenAyah. Mushaf haritası İlerleme'de; âyet sayacı Günün âyeti ekranında.
- Ayarlar anahtarları `role="switch"` + `aria-checked`; design contract (f) strict.
- Müfredat 12 ünite · 109 ders; Flow `nextStep` motoru; `onboarding`/`path` normalizasyonu (KAO2-07…08).
- Boyut: runtime gzip 60,031 KiB (≤80), CSS 7,834 KiB (≤14), içerik 168,483 KiB (≤256), p95 ≈4,2 ms. Pin `20260928b`.
- P3: syntax, KAO 25/25, app 77/77, panel 23/23, panel-v2 27/27, Quran 9/9, reminders, driver, zikr 95/95, kontrast 406/0, sync PASS.
- `KAO2-STATE.json`: KAO2-09 done, nextCard KAO2-10, ledger seq34, G2 closed, backlog 2 kayıt.

## Açık riskler
- Mastery ve onboarding eylemleri geçici olarak oturuma bağlı (KAO2-11/13). Eski ana ekran CSS'i öksüz (KAO2-26 backlog).
- Pin korunduğu için çevrimdışı paket kuran cihazlar paket yenilenene dek eski tutarlı sürümü görebilir.
- G1, G3, G4 açık; kaynak/test kanıtı cihaz kabulü değildir.

## Bekleyen kullanıcı işleri
- Yayın sonrası gerçek cihazda ana ekran kabulü.
