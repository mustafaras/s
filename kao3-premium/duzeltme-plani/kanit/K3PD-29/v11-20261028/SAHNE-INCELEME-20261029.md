# 2026-10-29 · Sahne incelemesi: dar geometrik sonuç

> **Tarihsel düzeltme:** Aşağıdaki 112/98/7 sınıflaması, G4 metninde bulunmayan “ekran dışındaki tüm ikincil kontroller tek tek ziyaret edilmeli” eşiğini fazla katı uyguladığı için denetçi tarafından geri çekildi. Ham ölçüler ve sınırlamalar korunur; güncel kapsam değerlendirmesi [ayrı düzeltmede](SAHNE-INCELEME-DUZELTME-20261029.md).

Salt-okur inceleme 217/217 eylemli kayıtta görüntü hash, 3.815/3.815 render edilmiş etkin eylem indeksi ve yedi manifestin kaynak hashlerini karşılaştırdı. Yedi glif kaydı eylemsiz N/A. Önceki bulguları bilen incelemeci, tarihçeden izole bağımsız hakem değildir; 217 görüntünün tamamını görsel gözle incelemedi, ham alanları karşılaştırıp seçilmiş görüntüleri kaynakla yorumladı.

Sütunlar açık320, koyu320, açık390, koyu390, açık460, koyu460, açık390+34. P yalnız seçilmiş ana eylemlerin tam kutusu, beş nokta hit ve boş ham metin kesişimi için dar ölçüm PASS; sahnenin tamamı, kullanıcı etkileşimi, ekran okuyucu veya cihaz kabulü değildir. K PARTIAL; U UNVERIFIABLE. Sayı **112 P / 98 K / 7 U**, 0 kanıtlanmış ürün FAIL. Bu matris genel G4 PASS değildir.

| Sahne | 7 koşum |
|---|---|
| v01-home | K K K K K K K |
| v02-units | K K K K K K K |
| v03-unit | P P P P P P P |
| v04-word | P P P P P P P |
| v05-reader | K K K K K K K |
| v06-settings | K K K K K K K |
| v07-phonics | P P P P P P P |
| v08-ayah | P P P P P P P |
| v09-prayer | K K K K K K K |
| v10-stats | U U U U U U U |
| v11-gate | K K K K K K K |
| v12-grammar | K K K K K K K |
| v13-concept | K K K K K K K |
| v14-roots | K K K K K K K |
| v15-sources | P P P P P P P |
| s0-asama-1 | P P P P P P P |
| s0-asama-2 | P P P P P P P |
| s0-asama-3 | P P P P P P P |
| s0-asama-3-cevap | P P P P P P P |
| s0-asama-4 | K K K K K K K |
| s0-asama-4-cevap | K K K K K K K |
| z1-ayarlar-alt | K K K K K K K |
| z2-ustalik-baslangic | P P P P P P P |
| z3-tekrar-sonrasi-ana | K K K K K K K |
| o1-ilk-acilis-1 | P P P P P P P |
| o2-baslangic-sonrasi-ana | K K K K K K K |
| o3-kao-ilk-acilis-1 | P P P P P P P |
| o4-kao-ilk-acilis-2 | P P P P P P P |
| o5-yerlestirme-okuma | P P P P P P P |
| o6-yerlestirme-dinleme | P P P P P P P |
| o7-kao-ilk-acilis-3 | P P P P P P P |

P için seçilen etkin eylem indeksleri: v03 [1], v04 [1,2], v07 [1,2], v08 [6,7], v15 [1,2,3], S0-1 [1], S0-2 [1,2], S0-3 [1,2,3,4], S0-3-cevap [5], z2 [2], o1 [0,1], o3 [2], o4 [3,4,5], o5 [3,4,5], o6 [3,4,5], o7 [3..13]. Bunlar yedi koşumda fullyVisible, covered=false, beş hit=true, contentOverlaps=[] ölçümleridir. Fonetikte ayrıca 12 kısmi alt kontrol ayrı scroll ile ölçüldü.

K/U nedenleri: home/z3 büyük şeffaf hero katmanı metinle bilerek kesişir, genel kabul için kapsam incelenmeli; units/reader/settings/prayer/gate/grammar/roots ve alt ayarlar başlangıç görüntüsünde ekran dışında ek eylemler taşır. Kısmi kontrollerin bir kısmı ayrı scroll tekrarıyla tam ve merkezden görünür; tüm liste, tüm noktalar ve Tab/dokunma ölçülmüş değildir. Reader çiplerinin ham kesişimleri yorum gerektirir. İlerleme görünümünde ilk karede geri düğmesi ve aşağıda 20 harita hücresi vardır; tek birincil eylem N/A olsa da görünmeyen harita erişimi UNVERIFIABLE. Kavramın alttaki iki eylemi ayrı koşumda merkez hit ile ölçüldü, yeni screenshot/beş nokta/Tab yok. Başlangıç sonrası ana ekran çok eylemli bir hub; dairesel `sey-header-action` için bir köşe noktasının kaçması tek başına örtülme kanıtı değildir (`app/styles.css:82`).

`s0-asama-4` ve cevap görüntüleri gerçekte aşama 3 soru 2'dir; gerçek 4/4 ayrı v2 setindedir ve yalnız tek karede viewport görünürlüğü + merkez hit içerir. Scroll tanıkları eski screenshot'ın hashine sahne referansı olarak bağlanır, aynı oturum görüntüsü değildir. Hedef eşleştirmesi indeks + tag + class kullanır; aynı sınıflı liste yeniden sıralanırsa aynı semantik öğeyi tek başına garanti etmez. 2026-10-28 v2'de üç başarısız hit ve bir askı korunur, neden bilinmez.
