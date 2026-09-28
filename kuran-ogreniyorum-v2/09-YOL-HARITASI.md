# 09 — Yol haritası: 6 dalga, 28 kart

Kartlar **sıralı** yürür; her kart tek committir, kapı komutları (08 §7) yeşil
olmadan sonraki karta geçilmez. Dal: `kao2-yeniden-tasarim` (yerel). Push,
deploy, tag ve `mustafaras/seyma-data` yazımı ayrı kullanıcı onayı ister.
Uygulama komut istemleri: [`UYGULAMA-PROMPTLARI.md`](UYGULAMA-PROMPTLARI.md).
Kararlar: [`10-KARARLAR.md`](10-KARARLAR.md).

Sıra **bağımlılığa göredir**: müfredat modülü (07) → sıradaki adım motoru (08) →
onu kullanan ekranlar (09, 10, 11) → ders oynatıcı (12).

## 1. Dalgalar

### W0 — Hazırlık (3 kart)

| Kart | Başlık | Kabul |
|---|---|---|
| KAO2-00 | Dal + kararların koda yansıması (K-1 bütçe/süre kapısı) + kaynakça teyidi | Bütçe testleri yeni tavanlarla yeşil; 04 künyeleri teyitli ya da işaretli |
| KAO2-01 | Taban ölçüm ve referans dökümler | Tüm aileler yeşil kaydı; süre tabanı; mevcut ekran HTML dökümleri |
| KAO2-02 | Tasarım sözleşmesi testi (bilerek kırmızı) | `test_kao2_design_contract.js` 06 §7 ölçümlerini raporlar; KAO2-03'e kadar izinli kırmızı |

### W1 — Kabuk ve temel etkileşim (4 kart)

| Kart | Başlık | Bulgu kapanışı | Kabul |
|---|---|---|---|
| KAO2-03 | Tokenlar ve süs temizliği | T-01, T-04, T-08, T-09, T-13 | Design contract CSS ölçümleri yeşil; kontrast aracı yeşil |
| KAO2-04 | Üç dosya iskeleti (K-2) + gezinme yığını + NavBar/LargeTitle | Y-10, O-01, T-06, T-07 | Dört liste aynı committe; `test_kao2_navigation.js` yeşil |
| KAO2-05 | Bileşenler: GroupedList, Switch, ProgressRing, Choice durumları, FeedbackSheet | T-12, T-15 | Bileşen render testleri; `role="switch"` |
| KAO2-06 | Geri bildirim paneli + "Devam" + geri alma taşıma | K-06, O-03, T-14…T-17 | `test_kao2_feedback.js`: cevap sonrası indeks ilerlemez |

### W2 — Müfredat omurgası ve rehberlik (5 kart)

| Kart | Başlık | Bulgu kapanışı | Kabul |
|---|---|---|---|
| KAO2-07 | Müfredat derleme aracı + `quranCurriculumV2.js` | K-08 | `test_kao2_curriculum.js`: 524/524 tam 1 derste; tekrar üretilebilir; bütçe ≤48 KiB |
| KAO2-08 | "Sıradaki adım" motoru (`quranLearnFlow.js`) | K-03, Y-04, Y-08 | `test_kao2_next_step.js`: 7 durum × beklenen adım |
| KAO2-09 | Bugün ekranı (S-02) | K-03, Y-05, T-10, T-11 | Tek `.kao-primary`; sıfır kullanıcıda %0 yok, hedef var |
| KAO2-10 | Hub kartı v2 | Y-01, Y-02, Y-03, T-01…T-05 | 4 durumda doğru metin; gerçek ilerleme halkası |
| KAO2-11 | İlk açılış (S-01) + yerleştirme + mevcut kullanıcı işareti | K-01, K-02, O-02, Y-13 (kısmen) | `test_kao2_onboarding.js`; mevcut kullanıcıda gösterilmez |

### W3 — Öğretim döngüsü (5 kart)

| Kart | Başlık | Bulgu kapanışı | Kabul |
|---|---|---|---|
| KAO2-12 | Ders oynatıcı (S-05): Hedef → Tanış → Kavram → Pekiştir → Uygula → Özet | K-04, K-05, Y-06, Y-07 | `test_kao2_lesson_flow.js`; A-1 (≤3 dokunuş) burada bağlanır |
| KAO2-13 | Yol (S-03) + Ünite (S-04) | K-08, K-09, Y-09, T-18 | Üniteye dokunmak ünite ekranını açar |
| KAO2-14 | Ders ve tekrar özeti (S-07) | K-07, Y-08 | Öğrenilenler + yarın + sıradaki adım; ilk hafta "0 kalıcı" yok |
| KAO2-15 | Gramer notları kütüphanesi (S-10) | K-05 | 25/25 kavram erişilebilir |
| KAO2-16 | Taş düzeltmesi + mevcut kullanıcı geçişi | 03 §2 | `test_kao2_milestones.js` + `test_kao2_migration.js` |

### W4 — İçerik zenginleştirme (6 kart)

| Kart | Başlık | Kabul |
|---|---|---|
| KAO2-17 | Ünite ve ders Türkçe metinleri (K-4 protokolüyle) + `test_kao2_text_review.js` | L0 yeşil; `draft` metin görünmez; inceleme sayfası üretildi |
| KAO2-18 | Kavram `workedTr` + `errorTr` + açıklama şablonları | Her yanlış cevapta boş olmayan açıklama |
| KAO2-19 | Sûre bağlamı (`contextTr`, 20) + okuyucu v2 | T-20, T-21, Y-12; `sources` zorunlu |
| KAO2-20 | Kök aileleri (S-11) | 73 aile erişilebilir |
| KAO2-21 | Seviye 0 yeniden kuruluş (şekil aileleri, konum tablosu; K-3 kademe B ses) | 12 ders; ses kelime içinde |
| KAO2-22 | Hece sesi hattı (K-3 kademe A) | Manifest şeması + araç + test; kayıt yoksa "bekliyor" durumu, S0 kademe B ile tam |

### W5 — Tamamlama ve kapanış (5 kart)

| Kart | Başlık | Kabul |
|---|---|---|
| KAO2-23 | Ayarlar (S-13) + "Hakkında ve kaynaklar" | O-04, T-22, T-23 |
| KAO2-24 | İlerleme (S-12): taşlar, kapsam eğrisi, harita, istatistik | Kapsam eğrisi 03 §1 ile tutarlı |
| KAO2-25 | Kelime detayı v2 (S-08) + panel aynası | Y-11, T-19; panel projeksiyonu genişletilmiş |
| KAO2-26 | Erişilebilirlik ve kontrast denetimi | `test_kao2_a11y.js`; tüm token çiftleri kontrastta yeşil |
| KAO2-27 | Regresyon, sürüm pini, görsel QA, kapanış belgesi | Tüm aileler yeşil; `deliverables/KAO2-KAPANIS.md` |

## 2. Kabul ölçütleri (program geneli)

| # | Ölçüt | Hedef | Kanıt düzeyi |
|---|---|---|---|
| A-1 | Sıfır kullanıcı: modalı açmaktan ilk öğrenme kartına dokunuş sayısı | ≤3 | Fixture |
| A-2 | Her yeni lemmanın ilk görünümü Tanış kartı | %100 | Fixture |
| A-3 | Ekran başına dolgulu birincil düğme | ≤1 (tüm ekranlar) | Fixture |
| A-4 | Her kullanıcı durumunda tek, tanımlı sıradaki adım | 7/7 durum | Fixture |
| A-5 | Müfredat bütünlüğü | 524/524 lemma, 25/25 kavram, 20/20 sûre bağlamı | Fixture |
| A-6 | Eski veri güvenliği | Kartlar, günlükler, taşlar derin eşit | Fixture |
| A-7 | Tasarım sözleşmesi | 06 §7'nin tamamı | Fixture + kontrast aracı |
| A-8 | Cevap sonrası geri bildirim görünürlüğü | Kullanıcı "Devam" diyene kadar %100 | Fixture |
| A-9 | Mevcut test aileleri | Hepsi yeşil | Fixture |
| A-10 | Bütçe ve süre (K-1) | Tüm tavanlar içinde; p95 ≤40 ms | Fixture |
| A-11 | İlk hafta: dönüş günleri, ilk tekrar doğruluğu (yerel telemetri) | ≥4/7 gün; ≥%80 | **Cihaz / kullanıcı** |
| A-12 | "Şimdi ne yapmalıyım?" anı | Kullanıcı denemesinde 0 | **Cihaz / kullanıcı** |

## 3. Kapılar

- **G0 · Kararlar:** ✅ 2026-09-28 alındı (10-KARARLAR). KAO2-00 koda yansıtır.
- **G1 (W2 sonu, KAO2-11):** kullanıcıya ara özet (kanıt düzeyleri ayrı); isteğe bağlı yerel görsel QA.
- **G2 (KAO2-07 sonu):** müfredat eşlemesi (ünite başına kelime listesi) kullanıcı onayına sunulur; onay gelmeden KAO2-08'e geçilmez.
- **G3 (W4 metin kartları):** her metin kartı sonunda inceleme sayfası kullanıcıda; L1 onayı gelmeyen metin `draft` kalır (görünmez) ama kart kapanabilir.
- **G4 (KAO2-27 sonu):** yayın kararı yalnız kullanıcıda.

## 4. İzlenebilirlik (bulgu → kart)

| Bulgu | Kart | | Bulgu | Kart |
|---|---|---|---|---|
| K-01, K-02 | 11 | | Y-06, Y-07 | 12 |
| K-03 | 08, 09 | | Y-08 | 08, 14 |
| K-04 | 12 | | Y-09 | 13 |
| K-05 | 12, 15 | | Y-10 | 04 |
| K-06 | 06 | | Y-11 | 25 |
| K-07 | 14 | | Y-12 | 19 |
| K-08 | 07, 13 | | Y-13 | 11, 21 |
| K-09 | 13 | | O-01 | 04 |
| Y-01…Y-03 | 10 | | O-02 | 11 |
| Y-04 | 08 | | O-03 | 06 |
| Y-05 | 09 | | O-04 | 23 |
| T-01…T-05 | 03, 10 | | T-14…T-17 | 06 |
| T-06…T-09 | 03, 04 | | T-18…T-21 | 13, 19, 25 |
| T-10…T-13 | 03, 05, 09 | | T-22…T-26 | 05, 23, 26 |
| P-01…P-03 | 06, 12, 15 | | P-04…P-10 | 11, 12, 14, 19, 21 |

## 5. Bağlam yönetimi

Anti-amnezi sistemi: `.anti-amnesia/CURRENT-STATE.md` (şimdiki durum, tek
sayfa), `.anti-amnesia/LEDGER.md` (yalnız eklenen kayıt defteri),
`KAO2-STATE.json` (makine durumu). Üçünün uyumu
`node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs` ile her kartın başında ve
sonunda doğrulanır. Ayrıntı: `UYGULAMA-PROMPTLARI.md` §0.
