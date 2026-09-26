# KAO · Kur'an Arapçası Öğreniyorum — Kapanış Belgesi

**Tarih:** 2026-09-26 · **Program:** KAO (plan-v4) · **Durum:** `completed` · **Taban:** `0436405` (2026-09-20, KAO öncesi)
**Kanıt düzeyleri ayrıdır** (CLAUDE.md kural 7): kaynak/headless fixture ≠ yayın ≠ cihaz kabulü.

## 1. Sonuç

- 30 kartın tamamı kapandı; 26 gereksinimin **24**'i done, **2**'si gerekçeli partial (R-C5 içerik boyutu kararı, R-C9 cihaz kabulü); `pending` yok.
- Dalga denetimleri D1–D5 çalıştırıldı (§4): 3 `pass`, 2 `findings` (kart geri çekmeyen, belgeli sapmalar). D6 bu belgeden sonra çalışır.
- Kapanış anındaki tam regresyon: tests/app + kao + quran + panel + panel-v2 **149/149**, hatırlatıcı smoke, driver, zikr 95/95, rebind 37/37, shell kapısı, KAO kontrast 328/328, plan-check (+ öz-test 16/16) — hepsi PASS. `fx-coverage --gate` exit 1, KAO öncesinden aynı değerlerle (§7).
- Yayın: KAO-17…KAO-28 kullanıcı onayıyla `main`'e alınıp GitHub Pages'e dağıtıldı (son yayın `59a53d9`). Sonraki commit'ler `kuran-ogreniyorum` dalında, **yayın bekliyor** (§8).

## 2. Ölçüler (önce → sonra)

| Ölçü | Taban `0436405` | Kapanış |
|---|---|---|
| `app.js` satır | 7.609 | 7.799 (shell bütçesi 7.800 içinde) |
| KAO çekirdeği `app/core/quranLearn.js` | — | 1790 satır |
| `app/kao.css` | — | 92 satır |
| İçerik modülleri (ham bayt) | — | sözlük 320208 · gramer 51353 · kısa sûre 83276 · fonetik 9552 |
| İçerik modülleri (gzip) | — | toplam ≈159,9 KB (bütçe 130 KB — **aşıldı**, §6.1) |
| App handler yüzeyi | 718 | 755 (35'i `App.kao*`) |
| `tests/kao/` fixture | 0 | 14 |
| Kelime sözlüğü | — | 524 doğrulanmış lemma, token kapsamı %77,42 (59.948 / 77.430) |
| Görev geçişi | — | p50 ≈0,1 ms, en yavaş <1 ms (bütçe 50 ms) |

## 3. Kart kapanış tablosu

| Kart | Başlık | Durum | Gereksinim |
|---|---|---|---|
| KAO-01 | Sözlük derleme aracı (ağsız) | done | — |
| KAO-25 | Plan denetleyici (kao-plan-check) sertleştirme | done | — |
| KAO-02 | Aday liste, kognat/komşu önerisi, inceleme tablosu | done | R-A5 R-A8 |
| KAO-03 | Yapay zekâ doğrulaması ve içe alma (D-12) | done | R-A8 |
| KAO-04 | Gramer içeriği (24 mikro-kavram + G0.5) | done | R-A7 R-A8 |
| KAO-23 | Fonetik içeriği + mahreç SVG | done | R-B6 R-A9 |
| KAO-24 | Ses varlık hattı (alt küme + AAC) | done | R-C2 |
| KAO-05 | quranLexiconV1.js dondurma + 4 yükleme listesi | done | — |
| KAO-06 | quranGrammarV1 + quranShortSurahsV1 + quranPhonicsV1 (+prayerTexts) | done | R-A6 R-B2 |
| KAO-07 | Registry iskeleti + ensureQuranLearn + migrate kancası | done | R-C7 |
| KAO-08 | FSRS saf JS portu | done | R-A3 |
| KAO-09 | Kuyruk, görev üretici, çeldirici, gece tekrarı | done | R-A1 R-A2 R-A5 |
| KAO-10 | Overlay kabuğu + E1 Home + geçici Ayarlar girişi | done | — |
| KAO-11 | E2 oturum çekirdeği: anlam seç / Arapça seç, ses düğmesi, geri al | done | R-A4 R-B7 R-B8 R-C2 R-C3 R-C5 |
| KAO-12 | E2 gramer görevleri | done | — |
| KAO-13 | E2 parça görevleri + E3 Done + kalibrasyon kaydı | done | R-A3 R-A7 R-B4 |
| KAO-14 | E4 Üniteler + E5 Kelime (üç dokunuş, kök ağacı, bayrak) | done | R-A8 R-B3 R-B7 R-C1 |
| KAO-15 | Seviye 0 kapısı (harf–ses–hareke) + renkli hareke | done | R-A9 |
| KAO-16 | E6 Okuyucu (20 kısa sûre) + vakıf noktaları + gecikmeli test kaydı | done | R-A6 R-C6 |
| KAO-17 | E7 Ayarlar + ses stili + soldurma + CSV | done | R-A4 R-A9 R-B5 R-B8 R-C4 |
| KAO-26 | E8 Telaffuz stüdyosu | done | R-B6 R-C2 |
| KAO-27 | Gölgeleme (bellek-içi kayıt) | done | — |
| KAO-28 | E9 Anlayabildiğin âyet | done | — |
| KAO-28b | E10 Mushaf ısı haritası + gecikmeli sûre testi | done | R-B1 R-C6 |
| KAO-16b | E11 Namazda ne diyorum | done | R-B2 |
| KAO-18 | Kontrast ve erişilebilirlik ölçümü | done | R-A9 |
| KAO-19 | Panel aynası (manifest + özet projeksiyon) | done | R-C1 R-C8 |
| KAO-20 | Tam regresyon + kullanıcı görevleri + kalibrasyon raporu | done | R-A1 R-A3 R-C5 R-C9 |
| KAO-21 | Hub kartı bileşimi + köprüler (IIP koordineli) | done | — |
| KAO-22 | Kapanış belgesi | done (bu belge) | R-C9 |

## 4. Dalga denetimleri

| Denetim | Sonuç | Bulgu |
|---|---|---|
| KAO-D1 | findings | Kova raporu ve kapsam ≥0,78; Komşu/kalıp etiketleri doğrulanmış (proposed:false) |
| KAO-D2 | pass | — |
| KAO-D3 | pass | — |
| KAO-D4 | pass | — |
| KAO-D5 | findings | saygi |

Denetimler kod değiştirmez; kapsamdaki her kartın kontrol listesini **bugünkü** kodda yeniden çalıştırdı (toplam 239 kontrol, hepsi exit 0). Hazırlıkta bulunan üç hata ayrı commit'lerle düzeltildi: plan-check öz-testi 15/16 (`8145a2e`), ۟ düzeltmesinin doğrulanmış sözlükte kalan tek lemması يَرْجُوا۟ `yarcûâ` → `yarcû` (`cf5e0d7`), kalibrasyon tablosunun 10 bandın yalnız 5'ini göstermesi (`be4a2a8`).

## 5. Gereksinim durumu (26)

| R | Gereksinim | Durum | Kanıt |
|---|---|---|---|
| R-A1 | Gece tekrarı | done | KAO-09/10/20 — gece oturumu ≤8 tekrar, nightRev, ertesi tekrar karşılaştırması (headless; gerçek etki kullanım verisiyle) |
| R-A2 | Çeldirici güvenliği | done | KAO-09 + KAO-16b yön dengesi (365 gün fixture) |
| R-A3 | Tutunma eğrisi ve kalibrasyon | done | KAO-08/13/20 — 10 bantlı kalibrasyon kaydı, E1 İstatistik, simülasyon ECE 0,013 |
| R-A4 | İlk sunumda otomatik ses | done | KAO-11/17 |
| R-A5 | Anlamsal komşu ayrımı | done | KAO-02/09 (öneri kapları proposed:true — §6.5) |
| R-A6 | Vakıf işaretleri = anlam noktalaması | done | KAO-06/16 |
| R-A7 | "Fiil önce gelir" mikro-kavramı (G0.5) | done | KAO-04/13 — G0.5 + errors.order |
| R-A8 | Kalıp düzeyinde kognat köprüsü | done | KAO-02/04/14 |
| R-A9 | Okuma erişilebilirliği | done | KAO-15/17/18 — 3 ton × 2 tema kontrast |
| R-B1 | Mushaf ısı haritası (E10 `map`) | done | KAO-28b |
| R-B2 | "Namazda ne diyorum" (E11 `prayer`) | done | KAO-16b — 94/94 okunuşlu namaz metni |
| R-B3 | Üç dokunuş kuralı (E5) | done | KAO-14 |
| R-B4 | Oturum sonu tek sayı (E3) | done | KAO-13 |
| R-B5 | Hareke soldurma animasyonu | done | KAO-17 |
| R-B6 | Mahreç şemaları tek çizgi dili | done | KAO-23/26 |
| R-B7 | Kognat rozeti | done | KAO-11/14 (simge KAO-26'da düzeldi) |
| R-B8 | Sesli iki hız tek düğme | done | KAO-11/17 |
| R-C1 | İçerik hata bildirimi | done | KAO-14/19 |
| R-C2 | Sessiz mod garantisi | done | KAO-11/24/26 |
| R-C3 | Geri al (3 s) | done | KAO-11 |
| R-C4 | Yerel dışa aktarma | done | KAO-17 |
| R-C5 | Performans bütçesi | partial | geçiş <1 ms ve preload none PASS; içerik gzip 159,9 KB > 130 KB — karar bekliyor (§6.1) |
| R-C6 | Gecikmeli sûre testi | done | KAO-16/28b |
| R-C7 | Ölçeklenebilir şema | done | KAO-07 |
| R-C8 | Ölçülü gözlemci şeffaflığı | done | KAO-19 — kelime düzeyi sızıntı kapatıldı |
| R-C9 | Üç kullanıcı görevi | partial | headless üç görev PASS; cihaz kabulü (K3) kullanıcıda (§6.2) |

## 6. Bilinen sınırlar ve açık kararlar

### 6.1 İçerik boyutu (R-C5) — **kullanıcı kararı bekliyor**
4 içerik modülü gzip ≈159,9 KB; bütçe 130 KB. Aşımın kaynağı sözlükteki örnek cümleler; "her kelimeye üç örnek" kuralı kullanıcı kararıdır. Seçenekler: (1) bütçeyi ~160 KB'a güncellemek, (2) kelime başına 2 örnek, (3) örnekleri kelime kartında yüklenen ayrı modüle bölmek (05 §4 istisnası gerekir). Fixture 160 KB büyüme tavanıyla sessiz büyümeyi engeller.

### 6.2 Cihaz kabulü (K3) — **kullanıcıda**
Ses çalma, mikrofon izni/gölgeleme (iOS Safari MediaRecorder), CSV indirme, soldurma animasyonu, %200 metin, VoiceOver ve gerçek ekranda okunabilirlik yalnız cihazda doğrulanabilir. Bu belge hiçbir cihaz davranışını "kesin çalışıyor" diye iddia etmez.

### 6.3 Atlanan köprüler (KAO-21)
Kur'an Yolculuğu satırına "kelimelerini öğren" ve Esmâ kök notu başka programların dosyalarına (`quran.js`, Esmâ) dokunmayı gerektirdiği için prompt gereği atlandı; ayrı onayla yapılabilir.

### 6.4 İçerik sınırları
- DİA okunuşu yalnız kelime kartlarında (araç algoritması, 524/524); âyet/parça okunuşları Okunuş katmanında.
- 50 Diyanet dua kelimesinin okunuşu D-12 yapay zekâ doğrulamalı (insan teyidi yok, kullanıcı kararı); 36'sı mekanik çıktıyla birebir, 14 fark açıklandı.
- Ses paketinde tek harf/hece klibi ve ikinci okuyucu yok; "çok stil" aynı kelimenin yavaş/doğal iki modeliyle.

### 6.5 Denetim bulguları (D1, D5 — kart geri çekilmedi)
- **Kapsam hedefi:** doğrulanmış 524 lemma token kapsamı 0,7742; D1 kriteri ≥0,78 (müfredatta "~%80, yaklaşık" olarak tanımlı).
- **Öneri kapları:** `semNeighbors` ve `cognate` kapları 524/524 `proposed:true`. Gösterilen içerik ayrı doğrulanmış alanlardan gelir; kuyruk önerileri yalnız aralıklandırma için kullanır. Doğrulanmış duruma geçirmek içerik kararıdır.
- **İzlenebilirlik:** `saygi.js`'teki 3 satırlık KAO izi KAO-21 yerine `a9fa40c` (fix(ui)) ile gelmiş; ≤3 satır sınırı karşılanıyor.

## 7. KAO dışı tespitler
- `tools/fx-coverage.mjs --gate`: M2/M3/M4/M5/M7 eşik altı; KAO-17 öncesi `35cb697`'de birebir aynı. Muhtemel neden: araç yalnız `app.js`'i tarıyor, MON/MON2 bağlantıları `app/core/*`'a taşıdı (M1: 390 → 16 `onclick`). CLAUDE.md'deki "M7 0,62 tavan" notu eskidir (M7 = 0,60). Ayrı bir FX ölçüm işidir.

## 8. Yayın ve onay
- `releaseApproval` STATE'te kullanıcı kararıyla `APPROVED` kayıtlıdır; KAO-17…28 yayınları bu onayla ve her seferinde açık talimatla yapıldı. Plan metni kapanışta `NOT_APPROVED` öngörüyordu; kullanıcının açık onayını geri almamak için kayıt korunmuştur. **Bu kapanış kendiliğinden push/merge/tag/deploy yapmaz**; `59a53d9` sonrası commit'lerin yayını ayrı kullanıcı talimatına bağlıdır.
- `mustafaras/seyma-data` deposuna hiçbir aşamada yazılmadı.

## 9. Program boyunca bulunup düzeltilen önceki hatalar
- Okunuş hattı: Türkçe okunuşa ikinci kez uygulanan digraf dönüşümü (`va-al-fasu` → `va-al-fathu`, 7 okunuş) ve Uthmani ۟ işaretli harfin okunması (21 kısa sûre kelimesi + 341 sözlük örneği + 1 lemma).
- Koyu temada neredeyse görünmeyen altın etiketler (1,1:1) ve toplam 34 düşük kontrast (KAO-18).
- Gözlemci anlık görüntüsünde kelime düzeyi veri sızıntısı (KAO-19).
- Bazı günlerde oturumun tüm yeni kelimeleri tek yönde (R-A2; KAO-16b).
- Var olmayan ikon adları yüzünden görünmeyen simgeler (KAO-26); KAO-07'den kalan 10 harness yükleme listesi borcu (KAO-17).
- R-A1 gece oturumu ve R-A3 bantlı kalibrasyonun uygulama tarafı eksikti (KAO-20'de tamamlandı).

## 10. Fixture envanteri (`tests/kao/`)

- `test_kao_boundary.js`
- `test_kao_fsrs.js`
- `test_kao_independence.js`
- `test_kao_lexicon_contract.js`
- `test_kao_lexicon_coverage.js`
- `test_kao_migration.js`
- `test_kao_panel_projection.js`
- `test_kao_phonics_contract.js`
- `test_kao_privacy.js`
- `test_kao_pronunciation_contract.js`
- `test_kao_queue.js`
- `test_kao_render.js`
- `test_kao_requirements.js`
- `test_kao_user_tasks.js`

Tamamı `for f in tests/kao/*.js; do node $f; done` ile PASS. Aile tablosu: [KAO-REGRESYON.md](KAO-REGRESYON.md).

## 11. Program sınırı
KAO kapanmıştır. Yeni iş (içerik boyutu kararı, öneri kaplarının doğrulanması, köprüler, ek okuyucu sesi, Seviye 6) ayrı kapsam onayı ister.
