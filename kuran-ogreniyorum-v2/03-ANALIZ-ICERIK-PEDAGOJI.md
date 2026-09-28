# 03 — Analiz: İçerik envanteri ve pedagoji

Ölçüm: içerik modülleri Node'da yüklenip sayıldı (2026-09-28). Korpus toplamı
77.430 token (Tanzil/QAC ölçeği) varsayılarak kapsam hesaplandı.

## 1. Envanter — ne var?

| Varlık | Adet | Kaynak | Kullanıcıya görünüyor mu? |
|---|---|---|---|
| Lemma (doğrulanmış) | **524** (254 isim, 180 fiil, 90 edat/zamir/diğer) | `QuranLexiconV1` | Kısmen: yalnız sınav şıkkı ve tek kelime kartı |
| Kök | 301 | `QuranLexiconV1.roots` | Yalnız kelime kartının 2. katmanında |
| Kognat (Türkçe karşılık) | 385 lemma | `lemma.cognate` | Sınavda küçük çip olarak |
| Bağlam örneği | ~3/lemma (1.560+) | `lemma.examples` | Yalnız kelime kartının 3. katmanında |
| Gramer kavramı | **25** (g0_5…g24), her biri `plainTr` + `termTr` + tablo | `QuranGrammarV1.concepts` | **Hayır; açıklamalar hiç gösterilmiyor**, yalnız sınav |
| Ünite 11 kök ailesi | 73 kök, Türkçe türevleriyle | `QuranGrammarV1.unit11` | Yalnız kelime kartı 2. katman |
| Kısa sûre | 20 (Nâs→Tîn), 618 kelime, vakıf işaretleri | `QuranShortSurahsV1` | Evet, okuyucu |
| Sûre künyesi | 114 (nüzul sırası, yer, âyet sayısı, `themeTr`) | `QuranRevelationOrderV1` | **Hayır** (KAO içinde tema/bağlam gösterilmiyor) |
| Namaz metni | 8 (İftitah→Selâm, 94 kelime) | `prayerTexts` | Evet, E11 |
| Harf | 28 (kova A/B/C, mahreç, ipucu), 12 minimal çift, 7 kural | `QuranPhonicsV1` | Kısmen: stüdyo + kapı mini dersleri |
| Ses | kelime klipleri (yavaş/doğal), minimal çift klipleri | `assets/kao/audio` | Evet, ama varsayılan kapalı |

### Kapsam eğrisi (sıklığa göre ilk N lemma → Kur'an token kapsamı)

| İlk N | 50 | 100 | 200 | 300 | 524 |
|---|---|---|---|---|---|
| Kapsam | %45,2 | %54,8 | %64,5 | %70,3 | **%77,4** |

Bu eğri modülün en güçlü **motivasyon anlatısıdır** ("50 kelimeyle Kur'an'ın
neredeyse yarısı") ama kullanıcıya hiçbir yerde gösterilmiyor.

## 2. Plan ↔ kod uçurumu

| Plan (03-MUFREDAT) | Kod (bugün) | Etki |
|---|---|---|
| 12 **tematik** ünite, her biri 1 tema + 25–45 kelime + 2 gramer kavramı + 1 çapa metin | 12 **eşit sıklık dilimi**, başlıksız (`kaoUnitSlices` L552) | Ünite kavramı boş; öğrenme hikâyesi yok |
| Ünite 1 = Fâtiha (Besmele + 7 âyet, G0.5/G1/G2) | Ünite 1 = en sık 44 lemma (min, Allah, mâ, fî…) | İlk deneyim soyut; "Fâtiha'yı anlıyorum" vaadi boşa düşer |
| "Fâtiha'yı anlıyorum" taşı = Ünite 1 (Fâtiha) kartları s≥7 | Aynı koşul ama Ünite 1 = sıklık dilimi (L435) | **Taş yanlış etiketli**: Fâtiha kelimelerini bilmeden kazanılabilir, bilerek kazanılmayabilir |
| Seviye 0 → 1 → … → 6 sıralı yol, "kilit yok, sıra önerilir" | Seviye kavramı yalnız 3 etkisiz etikette (L568) | Kullanıcı nerede olduğunu bilmez |
| Gramer: önce sade Türkçe anlatım (terminoloji geciktirme, 02 §2.9), sonra görev | Yalnız görev | Açıklamasız sınav → tahmin + hayal kırıklığı |
| Seviye 0: 12 mini ders (harf kovaları, hareke, konum şekilleri, med, şedde, elif-lâm, vakıf) | Harf + tek cümle ipucu; konum şekilleri, hece ve ses yok | Harf bilmeyen biri gerçekten okumayı öğrenemez |
| Hata sonrası açıklama (02 §2.10) | "Doğru cevap: X" (tek satır, sonraki ekranda) | Hata öğrenme fırsatı olmaktan çıkar |
| T-hattı (T0–T4) seviyeye paralel telaffuz | Bağımsız "stüdyo", seviyeye bağlı değil | Telaffuz yolculuğa entegre değil |

## 3. Pedagojik kusurlar (bilimsel ölçütle)

| # | Kusur | Hangi ilkeyi çiğniyor | Önem |
|---|---|---|---|
| P-01 | İlk karşılaşma = çoktan seçmeli sınav | **Açık öğretim / çözümlü örnek** (Sweller; Kirschner, Sweller & Clark 2006): acemide sunum önce gelir. Ön-test etkisi (pretesting) yalnız hemen ardından doğru bilgi verildiğinde işe yarar (Kornell, Hays & Bjork 2009); burada geri bildirim görülmüyor (01 K-06). | K |
| P-02 | Gramer açıklaması yok | **Açık dilbilgisi öğretimi** yetişkin L2'de etkili (Norris & Ortega 2000; Spada & Tomita 2010 meta-analizleri) | K |
| P-03 | Geri bildirim gecikmeli ve yetersiz | **Ayrıntılı geri bildirim** (Shute 2008; Hattie & Timperley 2007): acemide anında + açıklamalı | K |
| P-04 | Soyut edatlarla başlama | **Anlamlı bağlam ve çapa** (Mayer'in ön-eğitim ilkesi; kişisel alaka → motivasyon, SDT): Fâtiha zaten ezberde, en güçlü çapa | Y |
| P-05 | Harf öğretimi sistematik değil | **Sistematik ses-harf öğretimi** (National Reading Panel 2000; Ehri 2005); harekeli metinle başlama (Abu-Rabia 2001) | Y |
| P-06 | Ünite hedefi/sonu yok | **Ustalık öğrenmesi** (Bloom 1968) + **hedef belirleme** (Locke & Latham 2002): net, yakın hedef | Y |
| P-07 | Görsel süs yoğun | **Tutarlılık (coherence) ilkesi** (Mayer 2009): ilgisiz görsel öğrenmeyi düşürür; **işaretleme (signaling)** eksik | Y |
| P-08 | İlk ödül "0 kalıcı kelime" | **Öz-yeterlik** (Bandura 1977) ve **yetkinlik ihtiyacı** (SDT, Ryan & Deci 2000): erken, gerçek başarı duygusu | Y |
| P-09 | Okuma ve dinleme birlikte değil | **Dinlerken okuma** (reading-while-listening) kelime ve akıcılıkta avantajlı (Webb & Chang 2012, 2015) | O |
| P-10 | Alışkanlık halkası eksik | **Uygulama niyeti** (Gollwitzer 1999) var ama yalnız hub'da; **alışkanlık oluşumu** tutarlı ipucu + küçük eylem ister (Lally ve ark. 2010) | O |

## 4. Motorun güçlü yanları (korunacak)

- **FSRS-5** zamanlayıcı (ts-fsrs portu) ve kalibrasyon bantları: aralıklı tekrarın
  güncel en iyi uygulaması.
- **Sıklık öncelikli** envanter ve %95/%98 "anlayabildiğin âyet" eşiği (Hu & Nation
  2000; Laufer & Ravenhorst-Kalovski 2010).
- **Anlamsal komşu ayrımı** (R-A5): aynı oturumda yakın anlamlı kelimeler yok
  (Tinkham 1993; interferans).
- **Serpiştirme** (ardışık aynı tür ≤2), **iki yönlü kart** (önce ar>tr, sonra tr>ar),
  **kognat köprüsü + yalancı kognat uyarısı**, **gece penceresi** (uyku öncesi
  yük azaltma), **hata taksonomisi**, **aktarım testi** (görülmemiş âyet).

Sonuç: **Bilimsel çekirdek dünya standardında; eksik olan, öğretim katmanı ve
rehberlik.** Yeniden tasarımın ana işi bu katmanı eklemek ve mevcut zengin
içeriği görünür kılmak.

## 5. İçerik zenginleştirme fırsatları (mevcut veriden, yeni üretim gerektirmeden)

1. 25 gramer kavramının `plainTr` + tabloları → **mikro ders kartları**.
2. `QuranRevelationOrderV1.themeTr` + yer + âyet sayısı → **sûre tanıtım kartı** (okuyucu başlığı).
3. `unit11.roots` (73 kök × Türkçe türevler) → **kök ailesi keşif ekranı**.
4. Kapsam eğrisi → **"neden bu kelimeler" motivasyon anlatısı** (ilk açılış).
5. `lemma.examples` → her yeni kelimede "Kur'an'da nerede geçiyor" bağlamı.
6. `prayerTexts` → Seviye 1'in çapa metinleri (namaz = günde 5 kez tekrarlanan gerçek bağlam).

## 6. Yeni üretim gerektiren içerik (07'de planlandı)

- Tematik ünite eşlemesi (lemma → ünite; araçla, korpus kesişimiyle).
- Ünite anlatıları: "Bu ünitede ne öğreneceksin / neden önemli" (Türkçe, elle + doğrulama).
- Harf konum şekilleri tablosu, hece dersleri (harf + hareke) ve hece ses klipleri.
- Her gramer kavramı için 1 "hata sonrası açıklama" cümlesi ve 1 çözümlü örnek.
- Sûre başına kısa bağlam notu (nüzul, ana tema, bir cümlelik mesaj): kaynaklı.
