# 01 — Analiz: Sıfır kullanıcının yolculuğu

Yöntem: `app/core/quranLearn.js` render yolları, yeni (boş) `data.quranLearn`
ile satır satır izlendi (`emptyQuranLearn()` L1684). Her adımda kullanıcının
gördüğü, anlaması beklenen ve gerçekte anlayabildiği şey karşılaştırıldı.
Önem derecesi: **K** kritik (kullanıcıyı durdurur) · **Y** yüksek (yanlış yöne
iter) · **O** orta (sürtünme).

## 1. Adım adım yolculuk (bugünkü hâl)

### Adım 0 — Hub kartı (İlham & İbadet)
`kaoHubCardHTML()` L1638

Görülen: "KUR'AN ARAPÇASI" + "Kur'an Arapçası Öğreniyorum" (aynı şey iki kez),
"İlk oturum hazır" rozeti, "20 kısa sûreyi görünür okunuşla oku; kelimeleri
tanı, kökleri keşfet." (üç ayrı vaat), 4 noktalı dekoratif yol (Kelime · Kök ·
Gramer · Âyet; ilk nokta hep dolu, gerçek ilerlemeyle bağı yok), "Günde
yaklaşık 6 dakika", "Öğrenmeye başla".

| # | Bulgu | Önem |
|---|---|---|
| Y-01 | Yol göstergesi **sahte**: `.kao-hub-path>span:first-child i` CSS ile her zaman dolu; kullanıcının gerçek aşamasını göstermiyor. | Y |
| Y-02 | "Günde yaklaşık 6 dakika" sabit metin; iç ekranda `(due+fresh)*0.55` dk hesaplanıyor (L422). İki farklı süre vaadi. | O |
| Y-03 | Kart 236 px yüksekliğinde, 5 dekoratif katman; asıl bilgi (bugün ne var?) görsel gürültü içinde kayboluyor. | O |

### Adım 1 — Modal açılır: Ana ekran
`kaoHomeHTML()` L1621

Görülen sırayla:
1. Başlık "Kur'an Arapçası · Günlük öğrenme / Kelimelerini tanı, âyetleri anla".
2. Hero: **%0** "Kur'an kelimelerinin %0 kadarını tanıyorsun" + boş ilerleme çubuğu + "Anlaşılan âyet sayısı: 0".
3. "BUGÜNKÜ DERS · 0 tekrar · 10 yeni · ~6 dk" + "Bugünkü oturuma başla".
4. "BUGÜN ANLAYABİLDİĞİN ÂYET · Kelimelerin arttıkça açılacak".
5. "SIRADAKİ ÜNİTE · Ünite 1 · Kur'an'a giriş" + "İlk kilometre taşı: Fâtiha" + **8 alt alta metin bağlantısı** (Tüm üniteler, 20 kısa sûre, Seviye 0 giriş kontrolü, Namazda ne diyorum, Mushaf ısı haritası, Telaffuz stüdyosu, İstatistik, Ayarlar ve dışa aktarma).

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| K-01 | **Karşılama/yönlendirme yok.** Sıfır kullanıcıya "bu modül ne, nasıl çalışır, nereden başlamalı" diyen tek bir ekran yok. İlk görülen şey başarısızlık gibi okunan **%0**. | L1627 | K |
| K-02 | **Arapça okuyabiliyor mu sorusu hiç sorulmuyor.** Seviye 0 kapısı (`gate`) yalnız 8 bağlantıdan biri; `q.gate.passed` hiçbir yönlendirmede kullanılmıyor (yalnız yazılıyor, L505). Harf bilmeyen biri doğrudan kelime sınavına giriyor. | L505, L1633 | K |
| K-03 | **Sekiz eşit ağırlıklı bağlantı**, hiyerarşi yok; kullanıcı hangisinin önce olduğunu bilemez. "Mushaf ısı haritası" ile "Seviye 0" aynı görsel önemde. | L1633 | K |
| Y-04 | "Sıradaki ünite: **Ünite 1 · Kur'an'a giriş**" **her zaman** bu metni gösterir: `q.units` hiçbir yerde yazılmıyor, `kaoUnitLabel()` hep fallback'e düşüyor. Kullanıcı ilerlese de değişmez. | L634-638 | Y |
| Y-05 | "Bugün anlayabildiğin âyet" kartı sıfır kullanıcıya boş vaat gösterir; iş görmeyen alan ilk ekranın üçte birini kaplar. | L1631 | O |
| O-01 | Ekran başlığı her görünümde aynı ("Kelimelerini tanı, âyetleri anla"); kullanıcı hangi ekranda olduğunu başlıktan anlayamaz. | L1653 | O |

### Adım 2 — "Bugünkü oturuma başla"
`kaoStart()` L892 → `kaoBuildQueue()` L283 → `kaoTaskHTML()` L832

Sıfır kullanıcı için kuyruk: 10 yeni kelime (sıklık sırası: *min, Allah, mâ,
fî, lâ, inne, kâle, ellezî, alâ, kâne*) + en çok 4 gramer görevi + en çok 2
parça görevi, serpiştirilmiş.

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| K-04 | **Öğretmeden sınav.** Yeni kelime ilk kez 4 şıklı "Anlamı seç" sorusu olarak gelir; kullanıcı kelimeyi hiç görmeden tahmin eder. Önce "tanış" (sunum) adımı yok. | L832-864 | K |
| K-05 | **Gramer kavramı anlatılmadan gramer sorusu.** "Ek çöz / Kök bul / Kalıp eşle / Çekim tablosu" görevleri, 25 kavramın `plainTr` açıklaması ve tabloları hiç gösterilmeden sorulur (`plainTr` çalışma zamanında 0 kez okunuyor). | grep `plainTr` = 0 | K |
| K-06 | **Geri bildirim görülmeden ekran geçer.** Cevap anında `kaoTaskIndex+=1` + `paintTask()`; "Doğru cevap: X" metni *bir sonraki sorunun* altında küçük bir satırda belirir. Hangi şıkkın doğru olduğu yerinde gösterilmez, "Devam" adımı yok. | L968-969 | K |
| Y-06 | İlk kelimeler en zor olanlar: edatlar ve bağlaçlar (*min, mâ, fî, lâ, inne*) tek başına anlamı soyut kelimelerdir. Motivasyonun en yüksek olduğu ilk oturum en soyut malzemeyle harcanıyor. Oysa Müfredat 03 Ünite 1'i **Fâtiha** çapasıyla tasarlamıştı. | 03-MUFREDAT §3 | Y |
| Y-07 | Görev türü etiketi ("Arapçayı seç", "Bağ kur · Türkçedeki türevi", "Yeni âyet · haftalık test") sıfır kullanıcıya açıklanmıyor; ilk kez görülen görev türü için tek cümlelik "nasıl yapılır" yok. | L840 | Y |
| O-02 | Ses varsayılan kapalı (`audio:false`), sıfır kullanıcı hiç duymadan telaffuz öğrenmeye çalışır; ses açma yeri Ayarlar'da gömülü. | L1690 | O |
| O-03 | "Geri al · 3 sn" düğmesi, geçmiş bir cevaba ait olduğu açık olmayan bağlamda (yeni soru ekranında) belirir. | L861 | O |

### Adım 3 — Oturum sonu
`kaoTaskHTML(null)` L834

"Bugün **0** kelime daha kalıcı oldu": `isDurable` eşiği 21 gün stabilite
olduğundan ilk günlerde bu sayı **her zaman 0**. Kullanıcının ilk ödülü "0".

| # | Bulgu | Önem |
|---|---|---|
| K-07 | İlk oturum sonucu olarak "0 kelime kalıcı oldu" moral bozar; ne öğrenildiği (10 yeni kelime, adları, bir sonraki tekrar ne zaman) gösterilmez. | K |
| Y-08 | Oturum sonu "yarın ne olacak" demiyor (kaç tekrar, hangi ünite, ne kadar sürecek). Alışkanlık döngüsünün "sonraki ipucu" halkası eksik. | Y |

### Adım 4 — Üniteler
`kaoUnitsHTML()` L564

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| K-08 | **Üniteler anlamsız.** 12 ünite = sözlüğün sıklık sırasındaki eşit dilimleri; adları "Ünite 1…12", temaları yok. Müfredat 03'ün tematik 12 ünitesi (Fâtiha, Tesbihat, İhlâs–Felak–Nâs, Bağlayıcılar…) koda hiç taşınmamış. | L552-563 | K |
| K-09 | Üniteye dokunmak **yalnız dilimin ilk kelimesini** açar (`App.kaoOpenWord(unit.lemmaId)`); ünitenin kelime listesi, dersi, hedefi yok. Kullanıcı "üniteye girdim" sanır, tek kelime kartına düşer. | L571 | K |
| Y-09 | "Seviye 0 · Sesler / Seviye 5 · Kökler / Seviye 6 · Âyetler" kutuları düğme gibi görünür ama tıklanamaz `span`'dır; üstelik müfredatla çelişir (Kökler Seviye 4, Seviye 5 kısa sûrelerdir). | L568 | Y |

### Adım 5 — Kelime, okuyucu, diğer ekranlar

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| Y-10 | Geri gezinme tutarsız: okuyucu ana ekrandan açılsa da "Üniteler"e döner; kelime kartı her zaman "Üniteler"e döner. Kullanıcı geldiği yere dönemez. | L1610, L618 | Y |
| Y-11 | Kelime kartının 3 katmanı ("Katman 1 / 3") zorunlu sıralı; 3. katmanda doğrulanmamış örnek için "gösterilemez" hata kutusu çıkar ve iç kalite kuralı kullanıcıya sızar. | L614-627 | O |
| Y-12 | Okuyucuda "Anladım" öz-beyanı tek dokunuşla; öncesinde hiçbir anlama kontrolü yok, gecikmeli test 7 gün sonra. Kullanıcı "anladım" dediği şeyin ne anlama geldiğini bilmez. | L1617 | O |
| Y-13 | Seviye 0 kapısı "20 kısa seçim" diye başlar ama şıklar **Latin okunuşlardır**: harf bilmeyen biri tahminle ilerler; ardından 12 minimal çift ses sorusu gelir. Sonuç ya "Kapıyı geçtin" ya da 12 mini ders listesidir; mini dersler yalnız harf + tek cümle ipucudur (harf konum şekilleri, hece, ses yok). | L493-532 | Y |
| O-04 | Ayarlar'daki açık/kapalı düğmeleri metin ("Gölgeleme: kapalı"), iOS anahtarı (switch) değil; tek ekranda 8 bölüm. | L1081 | O |

## 2. Kök nedenler

1. **Bilgi mimarisi özellik listesi olarak kurulmuş, yolculuk olarak değil.**
   11 ekran eşit ağırlıkta; hiçbirinin "sıradaki adım" sorumluluğu yok.
2. **Müfredat koda taşınmamış.** Plan belgesinde tematik üniteler, seviyeler,
   çapa metinler var; kodda sıklık dilimleri var. Kullanıcıya görünen yapı boş.
3. **"Öğret → pekiştir → uygula" döngüsünün ilk halkası eksik.** Motor yalnız
   geri çağırma (retrieval) yapıyor; sunum ve açıklama katmanı yok.
4. **Durum makinesi yok.** "Yeni başlayan / Seviye 0'da / Ünite 2'de / tekrar
   borcu var / bugün bitti" gibi kullanıcı durumları modellenmemiş; ana ekran
   herkese aynı şeyi gösteriyor.
5. **Geri bildirim döngüsü sıkıştırılmış.** Cevap verilir verilmez sonraki soru
   geliyor; öğrenmenin gerçekleştiği an (hata sonrası açıklama) atlanıyor.

## 3. Özet tablo

| Önem | Adet | Bulgular |
|---|---|---|
| K | 9 | K-01…K-09 |
| Y | 8 | Y-01, Y-04, Y-06, Y-07, Y-08, Y-09, Y-10, Y-13 |
| O | 9 | Y-02, Y-03, Y-05, Y-11, Y-12, O-01…O-04 |

(Kimlik öneki bulgunun bulunduğu sırayı, "Önem" sütunu gerçek şiddeti verir.)

Kritik bulguların tamamı **05-HEDEF-DENEYIM** ve **09-YOL-HARITASI**'nda bir
karta bağlanmıştır (izlenebilirlik tablosu 09 §4).
