# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-11
lastSeq: 41
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq41

## Şu an neredeyiz
KAO2-00…10 tamamlandı (11/28). KAO2-10 hub kartı v2 yayında (seq40): `811ebc88`, Pages run 36534605512 success, canlı 16/16 hash eşliği. 2026-09-29'da KAO2-00…09 denetimi yapıldı: iki küçük kusur Dokun listesi içinde düzeltildi (seq35 Flow next-unit/borç, seq36 kao.css token + KANIT CSS ölçüm düzeltmesi). KAO2-07…09 ve denetim FIX'leri kullanıcı onayıyla yayında (seq37): `3b1b3d16`, Pages run 36531279286 success, canlı 15/15 hash eşliği.

## Sıradaki kartın tek cümlesi
KAO2-11: İlk açılış (S-01) ve yerleştirme — kartsız ve `onboarding.doneAt` boş kullanıcıya 3 adımlık ilk açılış, `legacy` kullanıcıya bir kez "Yeni düzen" notu; `App.kaoOnboard` (+1 handler, fx2 pinleri).

## Canlı gerçekler
- İlham & İbadet ortak kart dili (seq41, styles.css `.saygi-page`): KAO hub bu yüzeyde altın şerit + ortak gölge + 44px rozet taşır (06 §5'ten bilinçli sapma).
- Hub kartı (İlham & İbadet): 05 §8 dört durum (Başla / Devam + ünite + sıradaki ders + dk / ✓ Bugünlük tamam · yarın N tekrar / Uyumadan önce N kart); halka gerçek ünite ilerlemesi; niyet önerisi yalnız "bekliyor"da; render veri yazmaz; motor/müfredat yoksa sade kart.
- Ana ekran: HeroCard (nextStep; tek `.kao-primary`) + Yolun (seviye/ünite ilerlemesi; kapsam yalnız bilinen ≥1, sıfır kullanıcıda "İlk hedef") + Keşfet (Kısa sûreler, Namazda ne diyorum, Telaffuz stüdyosu, Günün âyeti) + Sen (İlerleme, Ayarlar).
- Eylem eşlemesi: daily/next-unit/warmup/night/onboarding/mastery → kaoStart; s0 → kaoGate("start"); rest → kaoOpenAyah. Mushaf haritası İlerleme'de; âyet sayacı Günün âyeti ekranında; Seviye 0 Ayarlar'dan.
- Motor: tekrar borcu >60 → yeni 0 ve ünite tanıtımı yok (05 §10); 7+ gün ara → ısınma; sessionDone yalnız gündüz oturumu sonunda, render yazmaz.
- Müfredat 12 ünite · 109 ders (Ü6 147/30, Ü10 98/20); araç iki koşuda bayt-eşit ve depoyla aynı.
- Boyut: runtime gzip 60,788 KiB (≤80), CSS 8,008 KiB (≤14), içerik 168,483 KiB (≤256), p95 ≈4,4 ms. Pin `20260928b` (quranPhonicsV1 `20260924b`).
- P3: syntax 4/4, KAO 26/26, app 77/77, panel 23/23, panel-v2 27/27, Quran 9/9, reminders, driver, zikr 95/95, kontrast 414/0, sync PASS.
- `KAO2-STATE.json`: KAO2-10 done, nextCard KAO2-11, ledger seq41, G2 closed, backlog 3 kayıt, releaseApproval approved_through_KAO2-10.

## Açık riskler
- Mastery ve onboarding eylemleri geçici olarak oturuma bağlı (KAO2-11/13); masteryAt yazılmadığı için ana ekran Ünite 1 tamamlanınca "Ustalık" adımında kalır. Eski ana ekran ve eski hub CSS'i öksüz (KAO2-26 backlog: B-KAO2-09-1, B-KAO2-10-1). daily.ms yazılmıyor (KAO2-12 backlog).
- Pin korunduğu için çevrimdışı paket kuran cihazlar paket yenilenene dek eski sürümü görür; KAO2-10 sw.js'e dokunmadığından bu cihazlar yeni hub kartını sw.js değişene kadar görmez; `kaoNextStepFor` motor/müfredat yoksa hata fırlatır (yalnız KAO modalı etkilenir).
- Perf p95 kapısı soğuk başlangıçta ara sıra eşiği aşar (tekrar koşuda PASS; bilinen gürültü).
- G1, G3, G4 açık; kaynak/test kanıtı cihaz kabulü değildir.

## Bekleyen kullanıcı işleri
- KAO2-11'e başlamak için açık "devam".
- Yayın sonrası gerçek cihazda ana ekran kabulü.
