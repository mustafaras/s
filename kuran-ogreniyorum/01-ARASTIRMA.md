# 01 — Araştırma bulguları

Web araştırması 20 Eylül 2026'da yapıldı. Sayılar kaynağın kendi beyanıdır;
farklı kaynaklar farklı sayma yöntemleri kullanır (kelime-form / lemma / kök).
Plan, her sayıyı **kendi derleme aracıyla yeniden hesaplamayı** şart koşar
([06](06-ICERIK-URETIM-HATTI.md)); buradaki rakamlar ölçek fikri verir.

## 1. Kur'an'ın kelime yapısı — neden "az kelime, çok kapsam"?

| Ölçü | Değer | Kaynak |
|---|---|---|
| Toplam kelime (token) | 77.430 | Quranic Arabic Corpus (Leeds) |
| Lemma (çekim dışı sözlük birimi) | 3.680 | corpus.quran.com/lemmas.jsp |
| Benzersiz kelime formu | ~14.870 | Quran Progress |
| 125 en sık lemma | metnin ~%50'si | Understand Quran Academy (Abdulazeez Abdurraheem) |
| ~250 en sık | ~%75 | Quran Progress |
| ~500 en sık | %82,6 (64.282 token) | ilimtalibi.com 500 kelime kitapçığı |

Çıkarım: **Zipf dağılımı** çok dik. İlk 25 lemma tek başına ~24.000 token
(%31) taşır ve neredeyse tamamı *edat, bağlaç, zamir, ilgi zamiri*'dir
(مِن 3.226 · ٱللَّه 2.699 · فِى 1.701 · إِنّ 1.682 · عَلَىٰ 1.445 · ٱلَّذِى 1.442 ·
لَا 1.364 · مَا 1.266 · رَبّ 975 · إِلَىٰ 742 ...). Bu yüzden müfredat **gramer
parçacıklarını "kelime" olarak ilk günden** öğretmelidir; klasik "önce alfabe,
sonra isim cümlesi, sonra fiil çekimi" sırası kapsamı geç açar.

## 2. Türkçe konuşanın avantajı — 500 kelimenin 225'i zaten Türkçede

ilimtalibi.com kitapçığının ölçümü (kendi beyanı):

- %80 kapsam için ~500 kelime gerekir; bunların **~225'i Türkçede zaten
  kullanılır** (ilim, melek, tefekkür, inkâr, rahmet, hak, kalp, nefis ...).
  Net öğrenilecek: **275 kelime**.
- %70 kapsam için ~425 kelime; ~190'ı Türkçede var → net **235**.
- TDK Güncel Türkçe Sözlük'te **6.463 Arapça kökenli** madde vardır
  (104.481 içinde, %6,2) — yabancı kaynaklı en büyük grup.

Öğrenme bilimi karşılığı: **kognat kolaylaştırma etkisi** (cognate
facilitation) — biçimce benzer L1 sözcüğü olan L2 sözcükleri daha hızlı ve
daha kalıcı öğrenilir; etki en çok **başlangıç düzeyinde** ve düşük sıklıklı
sözcüklerde görülür (Sanahuja & Erdocia 2024; tandfonline 2017 kognat/yalancı
kognat çalışması). Tasarım sonucu:

1. Her kelime kartında `trCognate` alanı: Türkçe karşılık ve **anlam kayması
   uyarısı** (yalancı kognat: ör. *كتاب* "kitap" ✓, ama *عذاب* Türkçede
   "azap" ✓; *حكم* Türkçede "hüküm" ✓; *صلاة* "salât/namaz" — Türkçe "namaz"
   Farsça, Arapçası farklı → *kısmi kognat*).
2. Kognatlar ayrı bir **"Zaten biliyorsun" hızlı turu** ile 1–2 oturumda
   tanınır (yalnız tanıma testi, tam SRS döngüsüne girmez; sadece harf/
   hareke eşlemesi ve anlam-kayması kontrolü yapılır).
3. 275 kognat-olmayan kelime tam aralıklı tekrar döngüsüne girer.

## 3. Öğrenme bilimi — hangi kanıt hangi mekaniği zorunlu kılar

| Kanıt | Ne diyor | KAO'da karşılığı |
|---|---|---|
| **Aralıklı tekrar** (spacing) | Aynı toplam sürede, aralıklı çalışma gecikmeli testte büyük etki; tekrar sıklığı-öğrenme ilişkisi orta düzeyde (r≈.34, 26 çalışma meta-analizi) | FSRS zamanlayıcısı; kart başına sonraki tekrar günü |
| **Geri çağırma pratiği** (testing effect) | Yeniden okumaya göre üretici hatırlama kalıcılığı artırır; içeride tekrar eden çağırma "otomatikleşmiş açık bilgi"yi geliştirir | Her alıştırma bir hatırlama olayıdır; "göster" değil "üret/seç" |
| **Serpiştirme** (interleaving) | Aynı türden bloklar yerine karışık türler ayırt etmeyi güçlendirir | Oturumda kelime × gramer × âyet parçası karışık gelir |
| **Kök-kalıp öğretimi** | Arapçada kök/kalıp mantığını öğretmek bilinmeyen kelimenin anlamını çıkarma ve türetme becerisini artırır; erken morfolojik farkındalık ana dile yakın işlemleme kurar | Her kelime kökü (ك-ت-ب) ve kalıbıyla; "kök ağacı" görünümü |
| **Form–anlam bağı için çoklu karşılaşma** | Tek karşılaşma az öğretir; bağlam içi tekrarlı karşılaşma gerekir | Her kelime ≥3 farklı âyet parçasında, Kur'an bağlamında |
| **Kognat kolaylaştırma** | §2 | "Zaten biliyorsun" turu |
| **TFE (Toplam Fiziksel Etkileşim)** | Understand Quran metodu: zamir/fiil çekimini işaret ederek, sesli söyleyerek 3+3 tekrar | Zamir ve çekim kartlarında dokunma/işaret/ses eşliği (opsiyonel ses: `SeyAudio`) |
| **Bilinen metinden başlama** | Namazda günde ~50 cümle / 150–200 kelime tekrarlanır; anlamı öğrenmek "sıfır maliyetli tekrar" sağlar | 1. ünite Fâtiha + tesbihat + namaz sûreleri; mevcut **zikir** (Sübhanallah, Elhamdülillah, Allahu Ekber) ve **Esmâ** verisiyle köprü |
| **İstenen zorluk / hata odaklı geri bildirim** | Hata sonrası hemen doğru cevap + gerekçe, kalıcılığı artırır | Yanlışta "neden" satırı (kök/kalıp/edat ipucu) |
| **Bilişsel yük** | Yeni öğrenende aynı anda hareke + anlam + gramer terimi yükü | Terminoloji geciktirilir (UQ: "birinci kişi/zamir terimini önemseme"); önce anlam, sonra ad |

Kaynak örnekleri: Dunlosky vd. 2013 (etkili öğrenme teknikleri incelemesi),
Roediger & Karpicke (test etkisi), Cepeda vd. (aralık), Nation (kelime
öğreniminde karşılaşma sayısı), Habib vd. 2025 (Arapça morfolojik farkındalık),
QFI "Learning Arabic Through Its Living Roots". Bağlantılar [09](09-KAYNAKLAR.md).

## 4. Aralıklı tekrar algoritması seçimi

| Aday | Artı | Eksi | Karar |
|---|---|---|---|
| **SM-2** | 30 satır, deterministik, bağımlılık yok | Kalibre değil; "kolay/zor" tek bileşen | Yedek/fallback |
| **FSRS (v4/5)** | 727 M tekrar ile kalibre varsayılan parametreler; SM-2'den daha az tekrarla aynı hatırlama; DSR (zorluk-kararlılık-geri çağrılabilirlik) modeli; Anki'ye entegre | ~19 parametre, uygulaması ~150 satır; kütüphane (ts-fsrs) TypeScript — repo'da bundler yok | **FSRS'i sıfır bağımlılıkla saf JS'e port et** (`app/core/quranLearn.js` içinde `kaoSchedule()`), varsayılan parametrelerle; parametre optimizasyonu yok (tek kullanıcı, küçük veri) |

Hedef hatırlama oranı (desired retention) **0,90**. Kullanıcı ayarı yok
(basitlik); yalnız "günlük yeni kelime" (5/10/15) ayarı.

## 5. Gramer sırası — neyi, ne zaman

Sıklık ve alanda yaygın müfredatların kesişimi (UQ Turkish course, Kalimah,
Riwaq, Quranica; §1 lemma tablosu):

1. **Edatlar / harf-i cer** (بِ لِ مِن إِلَى عَلَى فِي عَن) — ilk 10 lemmanın 5'i.
2. **Ayrık zamirler** (هُوَ هُمْ أَنْتَ أَنْتُمْ أَنَا نَحْنُ; 1.295 geçiş) ve
   **bitişik zamirler** (ـهُ ـهُمْ ـكَ ـكُمْ ـي ـنَا; ~10.000 geçiş — UQ).
3. **İsim cümlesi** (mübteda-haber) ve **belirlilik** (ال).
4. **İşaret** (هَٰذَا ذَٰلِكَ) ve **ilgi** zamirleri (ٱلَّذِى مَا مَن).
5. **İzafet** (رَبِّ ٱلْعَٰلَمِينَ).
6. **Olumsuzluk ve vurgu parçacıkları** (لَا مَا لَم لَن إِنَّ إِلَّا قَد).
7. **Mâzi fiil** (فَعَلَ tablosu — 3 kişi × 2 sayı/cins, 14 form; UQ 21-form pratiği).
8. **Muzâri fiil** (يَفْعَلُ) ve **emir** (اِفْعَلْ).
9. **Çoğul** (sâlim/mükesser) ve **müennes**.
10. **Bâblar** (فَعَّلَ أَفْعَلَ تَفَعَّلَ اِسْتَفْعَلَ ...) — yalnız tanıma düzeyi.
11. **Kâne ve kardeşleri**, **şart** (إِن إِذَا لَو).
12. **Nida** (يَا أَيُّهَا) ve sık kalıp ifadeler.

Kalaam uygulaması "92 kalıp, gramerin %95'i" iddiasını taşır — sayı kaynağın
beyanıdır; KAO'da gramer 24 mikro-kavrama kırılır ([03](03-MUFREDAT.md)).

## 6. Mevcut uygulamalar — ne yapıyorlar, neyi almıyoruz

| Uygulama | Yaklaşım | Alınan | Alınmayan |
|---|---|---|---|
| Understand Quran Academy (TR çevirisi: Dr. Şeref Demirci) | Namaz metinleri + 125 kelime + TFE; sıklık sayıları her kelimede | Namaz metni sırası, TFE, sıklık rozeti | PDF/kurs formatı |
| Kalaam | 10 dk/gün, "1 haftada %40", SRS + aktif hatırlama | Günlük mikro-oturum | Pazarlama yüzdeleri |
| Kalimah / Kalima | Hareke'li flashcard, kelime paketleri, sayfa tarama | Tam harekeli kart | Pazar yeri |
| Quran Progress | 125/250/500 kapsam eşikleri | Kapsam sayacı | — |
| corpus.quran.com | Kelime kelime morfoloji, kök/lemma | Veri kaynağı | Uzman arayüz |
| Kur'an ile Arapça Öğrenin (Play) / kuranarapcasi.com (22 ders) | Türkçe gramer dersleri | Türkçe gramer anlatım sırası | Video/ders formatı |

Fark yaratan şey: KAO **kullanıcının kendi namaz/zikir/Esmâ verisiyle**
konuşur (mevcut `data.prayer`, `data.zikr`, `EsmaulHusnaV1/V2`,
`QuranStrikingVersesV1`) ve tek kişilik, sakin, Türkçe-sıcak bir tonda
ilerler; rekabet/lig/puan yok.

## 7. Veri kaynakları ve lisanslar

| Kaynak | İçerik | Lisans | KAO kullanımı |
|---|---|---|---|
| **Quranic Arabic Corpus v0.4** (Leeds) | 77.430 kelimenin morfolojisi: kök, lemma, POS, hareke'li Buckwalter | GNU GPL; "verbatim kopya serbest, değiştirme yasak"; kaynak + link zorunlu | Sıklık listesi, kök/lemma/POS **türetme** (derleme aracı girdisi). Ham dosya repo'ya konmaz; türetilmiş sözlükte kaynak + link |
| **Tanzil** Kur'an metni (Uthmani/simple) | Harekeli metin | CC BY 3.0 (verbatim; değiştirme yok; tanzil.net linki) | Örnek âyet parçaları; atıf |
| **Tanzil / QUL Türkçe mealler** (Diyanet #148, Elmalılı #233, Muslim Şahin, Ş. Britch) | Âyet meali | QUL: "kaynağa göre değişir, her kaynağın lisansını kontrol et" | Örnek parça Türkçesi — **lisans tek tek doğrulanmadan** kullanılmaz; alternatif: kendi kısa çeviri + doğrulama (06 §3, D-12) |
| **QUL Türkçe kelime-kelime (#99)** | Kelime kelime Türkçe | Belirsiz (sayfada yok) | Doğrulama referansı; doğrudan kopya yok |
| **QUL morfoloji** (kök/stem/lemma sqlite) | QAC türevi | QAC lisansına tabi | Alternatif girdi |
| **Fontlar** | Noto Naskh Arabic, Amiri, Scheherazade New | SIL OFL | Zaten mevcut yığın; yeni font paketlenmez |
| KFGQPC Uthmanic Hafs | Mushaf fontu | KFGQPC şartları | Kullanılmaz (indirme bütçesi + lisans) |

**Lisans kararı (taslak, kullanıcı onayı gerekir):** Repo'da LICENSE dosyası
yok; GPL'li QAC verisinden *türetilmiş* bir sözlük (`app/content/quranLexiconV1.js`)
yayınlamak GPL yükümlülüğü doğurabilir. Güvenli yol: derleme aracı QAC'yi
yalnız **sıklık ve kök/lemma etiketi** çıkarmak için okur; kelime listesi
kendi editoryal derlemesi (Arapça yazım Tanzil'den, anlam kendi Türkçe
çevirisi) olarak dondurulur; QAC'ye atıf ve link verilir. Ayrıntı [06](06-ICERIK-URETIM-HATTI.md).

## 7b. Telaffuz ve ses araştırması (v2 eki)

- **Türk öğrencilerin hata haritası:** Arapça öğretmenliği öğrencileriyle
  yapılan çalışmada en çok hata boğaz ve peltek/kalın harflerde (ث ح خ ص ض ط ظ ع);
  neden ana dil aktarımı (Türkçede ح خ ه → tek "h"); öneri: erken
  normalleştirme + periyodik düzeltme (JSHSR Adıyaman çalışması; Harran
  İlahiyat; dergipark telaffuz incelemesi; lidergi "telaffuz hatasından
  kaynaklanan anlam değişimi").
- **HVPT meta-analizleri (SSLA; Applied Psycholinguistics):** algıda g=0,92/0,67,
  genelleme + koruma var; üretime aktarım küçük-orta (%10,5 eğitilen, %4,5
  eğitilmeyen), uzun süreli üretim koruması zayıf → algı görevleri ana
  omurga, üretim gölgeleme + öz-değerlendirme.
- **Hareke (Abu-Rabia serisi):** harekeli metin doğruluğu ve anlamayı her
  düzeyde artırır → hareke varsayılan açık.
- **Kapsam–anlama (Hu & Nation 2000; Schmitt vd. 2011):** %95–98 kuralı;
  eşik yok, doğrusal → iki sayaç (kelime kapsamı + anlaşılan âyet).
- **Involvement Load (Laufer & Hulstijn 2001; PMC 2022 sistematik inceleme):**
  görev yükü derecelendirmesi.
- **Ses veri setleri:** HF `zaibihassan` (Apache 2.0, 2 stil, Opus, ~400 MB/stil,
  köken belirtilmemiş), HF `Buraaq` (77.429 mp3 + translit), `cpfair/quran-align`
  (CC BY 4.0 zaman damgası), everyayah (izin sorulmalı). iOS Safari Opus/OGG
  çalmaz → AAC dönüşümü şart.

## 8. Sınırlar / bilinmeyenler

- Kitapçığın "225 kognat" sayısı editoryaldir; KAO derleme aracı kendi
  kognat etiketini doğrulayıcı onayıyla verir (06 §3, D-12).
- Tüm kapsam yüzdeleri **token** kapsamıdır, anlama oranı değildir
  (UQ: "%50 kelime bilmek %50 anlamak demek değildir"). UI bu farkı açıkça
  söyler.
- Kullanıcının Arapça harf okuma düzeyi bilinmiyor → müfredat 0. seviye
  "harf-hareke kapısı" ile başlar ve **atlanabilir**.
