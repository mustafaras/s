# K3P · Kararlar ve gerekçeleri (2026-10-10)

Kullanıcı, kendisine bırakılan kararların kanıta dayanarak verilmesini istedi ("en bilimsel şekilde
karar ver"). Her karar aynı sırayla anlatılır: soru, seçenekler, kanıt, karar, geri dönüş koşulu.

Kaynaklar alanın yerleşik çalışmalarıdır; bu proje için ayrıca deney yapılmadı. Uygulamanın kendi
verisiyle yapılacak ölçümler §6'daki önceden kayıtlı hipotezlerde tanımlıdır.

---

## K-A · Latin okunuş geleneği

**Soru:** `tr` katmanı Diyanet tarzı bitişik mi yazılsın ("Bismillâhirrahmânirrahîm"), yoksa kelime
kelime akademik transkripsiyon mu olsun ("bi-smi'llāhi'r-raḥmāni")?

**Kanıt:**

- **Ses ile metin uyuşmalı.** Mayer'in çoklu ortam ilkelerine göre (tutarlılık ve zamansal
  yakınlık) duyulan ses ile görülen yazı uyuşmazsa bilişsel yük artar. Ses kayıtları bağlamdaki
  telaffuzu veriyor (*bismi-llāhi-r-raḥmān*). Bugünkü `al-rahmâni` yazımı bu sesle çelişiyor.
- **Kelime kelime eşleme bozulmamalı.** Uygulama okunuşu her Arapça kelimenin altına ayrı yazıyor.
  Tam bitişik Diyanet yazımı kelimelere bölünemediği için bu eşlemeyi bozar.
- **Destek zamanla çekilmeli.** Wood, Bruner ve Ross'a (1976) göre öğrenci ustalaştıkça iskele
  geri çekilmelidir. Okunuş, harfe geçiş için bir koltuk değneğidir: başta doğru ve tam olmalı,
  öğrenci ilerledikçe solmalıdır.

**Karar:** Okunuş bağlamdaki telaffuzu yansıtır, kelime sınırında bölünür ve Türk alfabesiyle
yazılır.

| Durum | Kural | Örnek |
| --- | --- | --- |
| Lemma tek başına | Vasl elifi, `ٱل` değilse `i` ile okunur | ٱسْم → **ism**, ٱبْن → **ibn**, ٱسْتَغْفَرَ → **istağfera** |
| Harf-i tarif + güneş harfi | İdgâm yazılır | ٱلرَّحْمَـٰن → **er-rahmân** |
| Cümle içinde | Önceki kelimeye bağlanır, vasl elifi düşer | بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ → **bismi · llâhi · r-rahmâni · r-rahîm** |
| Âyet sonu (vakf) | Son hareke düşer | **r-rahîm** |

Ek kurallar:

- `dia` katmanı DİA transkripsiyon düzeninde kalır.
- **Okunuş soldurma:** Kartın kararlılığı s ≥ 21 olunca okunuş varsayılan olarak gizlenir; dokununca
  görünür. Bu, mevcut hareke soldurmasının (s ≥ 30) bir basamak öncesidir.

**Geri dönüş koşulu:** Bir kıraat hocasının incelemesi (L2) başka bir gelenek isterse yalnız aracın
tablosu değişir; veri şeması aynı kalır.

---

## K-B · Kur'an yazı tipi ve bütçe

**Seçenekler:**

| Yazı tipi | Lisans | Osmanî imlâ işaretleri | Öğrenciye okunurluk | Sonuç |
| --- | --- | --- | --- | --- |
| KFGQPC Uthmanic Hafs | Kurumsal; değiştirme ve alt küme çıkarma izni belirsiz | Tam | Yüksek | **Elendi** (alt küme çıkarmak değiştirme sayılabilir) |
| Amiri Quran | SIL OFL | Tam | Orta (kaligrafik, işaretler sıkışık) | Yedek |
| Scheherazade New | SIL OFL | Tam | **Yüksek** (geniş iç boşluk, büyük harekeler) | **Seçildi** |

**Kanıt:** Abu-Rabia (2001), harekeli metnin hem yetkin hem zayıf okuyucunun doğruluğunu artırdığını
gösterir. Bu kitlede harekenin net okunması zarafetten önce gelir. Harekeleri büyük ve ayrık çizen
Scheherazade New bu ölçüte en iyi uyan aday.

**Karar:**

- **Yazı tipi:** Scheherazade New Regular. Yalnız Arapça ve Kur'an işaretleri alt kümesi, `woff2`.
- **Yalnız gerektiğinde indirme:** `@font-face` içinde
  `unicode-range: U+0600-06FF, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF`. Dosya yalnız Arapça glif
  çizildiğinde iner.
- **Çevrimdışı:** `font-display: swap` ve `sw.js` önbelleği.
- **Ağırlık:** Yalnız 400; sahte kalın yasak.
- **Bütçe:** ≤ 150 KiB. Bu tavan K-1 çalışma zamanı bütçesinden ayrıdır. Aşılırsa alt küme yalnız
  Hafs metninde geçen kod noktalarına daraltılır; bu kod noktaları `kaynak/` içinden araçla sayılır.
- **Kabul:** 30 zor glif dizisi önce/sonra ekran görüntüsüyle karşılaştırılır. Son karar cihazda
  kullanıcının gözüdür.

**Geri dönüş koşulu:** Cihazda harekeler çakışırsa aynı yöntem Amiri Quran ile denenir.

---

## K-C · Geri bildirim politikası ve otomatik geçiş

**Ölçüm (`araclar/dokunus-olc.cjs`, headless):** Tüm soruları doğru cevaplanan bir ders bugün
**69 dokunuş** sürüyor: 34 cevap, 30 "Devam", 5 ileri. Otomatik geçiş açıkken bu **39 dokunuşa**
iniyor (%43 azalma). Aradaki 30 dokunuşun hepsi bilgi taşımayan "Devam" basışı.

**Kanıt:**

- **Geri bildirim en çok nerede işe yarar:** Pashler ve ark. (2005) ile Butler, Karpicke ve
  Roediger (2008): Faydanın çoğu yanlış cevaplarda ve düşük güvenle verilen doğrularda ortaya çıkar.
  Emin olunarak verilen doğruya geri bildirim neredeyse hiçbir şey katmaz.
- **Hiperdüzeltme:** Butterfield ve Metcalfe (2001): Emin olunarak yapılan hata, düzeltildiğinde
  daha iyi öğrenilir. Bu yüzden yanlış cevaptaki açıklama dolu olmalı ve kullanıcıyı beklemeli.
- **Kayma ile hatayı ayırmak:** Reason (1990): Bilinen bir şeyde yanlış parmakla dokunmak (kayma),
  bilmemekten (hata) ayrı tutulmalı. Bugünkü "Aslında biliyordum" düğmesi bu ayrım için var, ama
  doğru cevaptan sonra da görünüyor.

**Karar: üç kollu geri bildirim.**

| Durum | Davranış | Süre |
| --- | --- | --- |
| **Hızlı doğru** (yanıt süresi kişinin son 50 görevlik medyanının altında) | Altın ✓ ve kısa ton, ardından otomatik geçiş | 600 ms |
| **Yavaş doğru** (medyanın üstünde ya da ses tekrar dinlendi) | Tek satırlık pekiştirme şeridi, ardından otomatik geçiş | 1.600 ms; dokunulursa durur |
| **Yanlış** | Tam açıklama kartı; "Devam" beklenir; kart oturum sonunda yeniden sorulur | Kullanıcıya bağlı |

Uygulama ayrıntıları:

- Geri alma düğmesi yalnız yanlış cevapta görünür ve adı **"Yanlışlıkla dokundum"** olur.
- Yanıt süresi zaten `kaoTaskMs` ile ölçülüyor; medyan `ui` içinde tutulur. **Yeni veri alanı
  gerekmez.**
- **Varsayılanlar:** Yeni kullanıcıda otomatik geçiş açık. Mevcut kullanıcıya `KAO_WHATS_NEW`
  mekanizmasıyla bir kez iki seçenek sunulur: "Hızlı geçişi aç" ya da "Böyle kalsın". Ayar sessizce
  değiştirilmez; bu, öz-belirleme kuramındaki özerklik ilkesine uyar (Ryan ve Deci, 2000).

**Geri dönüş koşulu:** H2 tutmazsa, yani yanlış oranı 5 puandan fazla artarsa, "hızlı doğru" eşiği
medyandan alt çeyreğe çekilir.

---

## K-D · Yeni `App.kao*` handler ve pin kayması

**Kanıt (kod):** Modül zaten eylem çoğaltıcı desenini kullanıyor: `kaoS0(action,value)`,
`kaoReader(action,value)`, `kaoLesson(action,value)`, `kaoPhonics(action,value)`. Yeni etkileşimler
bu handler'lara yeni bir eylem adı olarak eklenebilir.

**Karar: yeni `App.kao*` handler eklenmez; sayı 45'te kalır.**

| Etkileşim | Kullanılacak mevcut handler |
| --- | --- |
| Harflerden kurma | `App.kaoAnswer` (her harf çipi bir seçim; `order` görevinin çoklu seçim mantığı) |
| Âyette boşluk doldurma | `App.kaoAnswer` |
| Sürükleyerek dizme | Bırakınca `App.kaoAnswer`; pointer olayları yalnız görseli taşır |
| Okuyucudan karta ekleme | `App.kaoReader('add', index)` |
| "Yeni düzen" notu | `App.kaoOnboard('whats-new-…')` |

Böylece fx2, v3 ve surface pinleri kaymaz. Yalnız rutin `?v=` yayın pini değişir. Bu desene
uymayan bir ihtiyaç çıkarsa o kart durur ve ayrıca onay istenir.

---

## Ek kararlar

| # | Karar | Gerekçe |
| --- | --- | --- |
| K-E | Günün âyeti için %95 eşiği **korunur**, ama boş ekran yerine bir **merdiven** gösterilir: en yakın âyet ve eksik kelimeleri. | Laufer ve Ravenhorst-Kalovski (2010): %95 kapsam asgari, %98 en iyisi; eşiği düşürmek ödülü sahteleştirir. Hedefe yaklaştıkça çaba artar (hedef eğimi, Kivetz ve ark. 2006). |
| K-F | Bugün ekranında ilk bakışta **en çok 5 seçim** olur. | Hick–Hyman yasası: Karar süresi seçenek sayısının logaritmasıyla büyür. Bugün 13 seçenek var. |
| K-G | Her ders bir **âyet hedefiyle açılır** ve o âyetin **okunmasıyla kapanır**. | Ön düzenleyici (Ausubel 1960); zirve-son kuralı (Kahneman ve ark. 1993). |
| K-H | Seri **cezasız ve esnek**: hedef haftada 5/7 gün; "seriyi kaybettin" mesajı yok. | Öz-belirleme kuramı (Ryan ve Deci 2000). Kayıp korkusu içsel motivasyonu aşındırır; ibadet bağlamında suçluluk dili özellikle yersiz. |
| K-I | Tanıma görevlerinin payı **%93'ten en çok %60'a** iner. | Üretme etkisi (Slamecka ve Graf 1978), sınama etkisi (Roediger ve Karpicke 2006), istenen güçlükler (Bjork 1994). |
| K-J | Konuşma tanıma ve telaffuz puanlama **yapılmaz**. | Tarayıcının konuşma tanıma özelliği sesi işletim sistemi sunucusuna gönderebilir; bu gizlilik ilkesini ve "yeni ağ çağrısı yok" ilkesini çiğner. Yerel gölgeleme (kayıt + karşılaştırma) kalır. |

---

## §6 · Önceden kayıtlı hipotezler

**Sınırlama:** Uygulamanın tek kullanıcısı var (N = 1), bu yüzden kişiler arası istatistik yapılamaz.

**Yöntem:** Kart düzeyinde, kişi içi rastgele atama. Her uygun kart
`seededRank('k3p-ladder', cardId)` ile deterministik olarak A ya da B koluna düşer. Atama hash'ten
türetildiği için veriye yeni alan yazılmaz.

**Ölçüm kaynağı:** CSV dışa aktarımı (`kaoExportCsv`) yalnız kelime listesi verir, kart
istatistiği taşımaz. Bu yüzden ölçüm `araclar/deney-rapor.cjs` ile yapılır:

- **Girdi:** Kullanıcının verdiği bir JSON yedeği (`files/yedek/` biçimi ya da salt-okur `data/latest.json`).
- **Okunan alanlar:** Yalnız `quranLearn.cards[*].{s, lapses, reps, state}` ve `quranLearn.daily`.
- **Çıktı:** Yalnız toplu sayılar. Kelime, metin ya da kart kimliği basılmaz; hiçbir şey yazılmaz.

| # | Hipotez | Ölçü | Taban | Hedef |
| --- | --- | --- | --- | --- |
| H1 | Otomatik geçiş dokunuşu azaltır | Ders başına dokunuş | 69 | ≤ 40 |
| H2 | Otomatik geçiş doğruluğu düşürmez | Tekrar doğruluğu, 14 gün önce/sonra | Ölçülecek | Fark ≤ 5 puan |
| H3 | Hatırlama merdiveni kalıcılığı artırır | 30. günde A (merdiven) ve B (tanıma) kollarında ortalama `s` ve unutma oranı | — | A > B (yön önceden yazıldı) |
| H4 | Okunuş soldurma okumayı güçlendirir | s ≥ 21 kartlarda okunuş gizliyken doğruluk | — | ≥ %85 |
| H5 | Âyet merdiveni ödülü öne çeker | İlk anlaşılan âyete kadar geçen gün | Ölçülecek | Azalır |
| H6 | Tasarım doğruluğu bozmaz | `cift-sik` / `okunus-denetim` / `tests/kao` | 631 / 292 / yeşil | 0 / 0 / yeşil |

**Ön kayıt kuralı:** Yönler ve eşikler uygulamadan önce burada yazıldı. Sonradan değişirse eski
değer silinmez; değişiklik gerekçesiyle ek olarak yazılır.

---

---

## Akış kararları (2026-10-10, ikinci istek: "kullanıcı kolayca öğrenme akışında kalabilmeli")

Ölçüm ve gerekçenin tamamı [AKIS.md](AKIS.md)'de.

| # | Karar | Kanıt |
| --- | --- | --- |
| K-K | **Uyarlanır zorluk bandı %70–92, hedef %80–90.** Yalnız oturum içinde çalışır (`ui`). Kolaylaştırılmış soruya verilen doğru cevap not 2 alır. | Akış: zorlanma ile beceri dengesi (Csikszentmihalyi 1990). "%85 kuralı" (Wilson ve ark. 2019) bir sezgisel kural olarak kullanılır. FSRS'in uzun vadeli zorluğuyla çakışmaz. |
| K-L | **Nefes ritmi:** Hedef → Isınma → Tanış-Sına → Karışık → Zirve. Art arda en çok 1 edilgin ekran. | Kodlamadan hemen sonra hatırlama (Karpicke ve Roediger 2008). Bilişsel yük (Sweller 1988). Ölçüm: bugün 6 edilgin ekran art arda, 328 sözcük. |
| K-M | **Odak koruması:** Overlay yerinde güncellenir; ders sırasında toast ertelenir (kriz hariç). | Bölünme maliyeti (Mark ve ark. 2008). Kod: bir derste 7 tam yeniden kurulum; toast z 10000, modal z 380. |
| K-N | **Görünür devam:** Yarım kalan ders "Kaldığın yerden · n/N" olarak gösterilir. | Verilmiş ilerleme etkisi (Nunes ve Drèze 2006). Veri zaten tutuluyor (`resume`), yalnız gösterilmiyor. |
| K-O | **Zaman bütçesi:** Oturum seçilen dakikaya sığar; taşan tekrarlar önce en düşük `R`'den sıralanıp ertesi güne kalır. | Uzayan oturum ertesi günün akışını bozar. FSRS küçük gecikmeleri tolere eder. |

Bunlara bağlı hipotezler H7–H9, AKIS.md §7'de önceden kayıtlıdır.

## Kaynaklar

Abu-Rabia (2001) *Reading and Writing* 14 · Ausubel (1960) *J. Educ. Psych.* 51 ·
Bjork (1994) · Butler, Karpicke ve Roediger (2008) *JEP:LMC* 34 ·
Butterfield ve Metcalfe (2001) *JEP:LMC* 27 · Kahneman ve ark. (1993) *Psych. Science* 4 ·
Kivetz, Urminsky ve Zheng (2006) *JMR* 43 · Laufer ve Ravenhorst-Kalovski (2010) *RFL* 22 ·
Mayer (2009) *Multimedia Learning* · Pashler ve ark. (2005) *JEP:LMC* 31 ·
Reason (1990) *Human Error* · Roediger ve Karpicke (2006) *Psych. Science* 17 ·
Ryan ve Deci (2000) *Am. Psychologist* 55 · Slamecka ve Graf (1978) *JEP:HLM* 4 ·
Wood, Bruner ve Ross (1976) *JCPP* 17
