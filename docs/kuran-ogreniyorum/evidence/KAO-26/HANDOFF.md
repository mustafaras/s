# KAO-26 · Devir

**Tarih:** 2026-09-25 · **Doğrulama tabanı:** `b56bec35d3d688845bc17709c3d708e26847f5eb` · **Durum:** done

## Ne yapıldı

- E8 Telaffuz stüdyosu (`App.kaoOpenPhonics(letterId?)`, E1'den “Telaffuz stüdyosu”): Kova B ve Kova C harf düğmeleri, her harf için inline mahreç SVG'si + mahreç + ipucu + karıştırılan çiftin örnek kelimeleri.
- Altı görev: Hangi harf? · Hangi kelime? · Uzun mu kısa mı? · Şedde var mı? · Dinle-diz · Vakıf-vasıl. Cevaplar yalnız dondurulmuş veriden türetilir.
- Telaffuz kartları `quranLearn.phonics['p:…']` altında mevcut FSRS ile; yanlış duyulan harf sayılır ve o harfi içeren kelimeler “dikkat” listesinde (simge + metin) açılabilir.
- Sessiz mod (R-C2): klip yüklenemezse ya da “Sessiz çalış” seçilirse dinleme görevleri atlanır, bilgi verilir, görsel dersler ve vakıf görevi ile oturum biter.
- Önceden boş çizilen üç ikon adı düzeltildi; ikon haritası fixture'la korunuyor.

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-B6 | done | 13 SVG, currentColor, ≤4 KB, gömülü kopya = varlık |
| R-C2 | done | sessiz stüdyo oturumu done'a ulaşır; dinleme görevleri atlanır |

## Sınırlar

- Pakette tek harf/hece klibi ve ikinci okuyucu yok; “çok stil” aynı kelimenin yavaş/doğal iki modeliyle sağlanıyor (10 §5 HVPT'nin tam hâli için ek okuyucu sesi gerekir).
- Vakıf-vasıl görevi, aynı parçanın iki okunuşu kaydı olmadığından görsel.
- Cihaz kabulü (gerçek seste ayırt etme, SVG, VoiceOver) yapılmadı; push/deploy yapılmadı.

## Sonraki yetkili eylem

KAO-27 (gölgeleme) **D-10 kullanıcı onayı** kapısına bağlı: `gateApproval` STATE'te yoksa kart `blocked` olur.
