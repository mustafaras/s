# G4 sahne incelemesi · eşik düzeltmesi

DENETLEYICI.md:227 her sahnede CTA geometrisi/örtüşme/görünürlüğünü ve sayfa, diyalog, bileşen taşmasını ayrı kaydeder. Ekran dışındaki her ikincil kontrolün ayrı ayrı ziyaret edilmesini şart koşmaz; normal yerel scroll tek başına FAIL değildir. Önceki 112/98/7 tablosunun bu ek eşikten doğan verdictleri geri çekilmiştir; ham veriler ve eski tablo korunur.

Yedi koşumda görünür ve seçilen ana eylem ölçüsü mevcut: v02, v03, v04, v05, v07, v08, v11, v14, v15, S0 ilk üç aşama ve drill cevabı, z2, o1, o3–o7. Listelerin ilk görünür öğeleri veya anlamlı kontrolleri ölçülen örneklerdir; tüm listenin tamamının etkileşim testi iddia edilmez. v06/z1 ayarlar, v09/v12 liste, v10 ilerleme ve o2 genel uygulama hub'ında *tek zorunlu birincil CTA* için gerekçeli N/A; bunların görünür eylem ve taşma verileri ayrı okunmalıdır. Glif tablosu eylemsiz N/A'dır. v13 kavramın iki alttaki eylemi ayrı ek 7 görüntü ve geometride ölçüldü, yalnız kapalı details durumu kapsamlıdır.

Reader çipleriyle kapalı `details.kao-reader-surah` içindeki görünmeyen paragrafın kutusu arasındaki ham kesişim, kaynak `quranLearn.js:3833` ve seçili görüntüde kapalı özetle açıklanır; ham kayıt silinmez. 320px carousel ve kavram tablosunun yerel yatay scroll bilgisi, tek başına beklenmeyen sayfa taşması değildir. o2 hub'ın 44px dairesel header düğmesinde köşe hit hatası ham olarak korunur; CSS border-radius nedeniyle doğrudan örtülme hükmü kurulmaz.

Eski s0-asama-4 ve cevap, gerçekte aşama 3 soru 2 / cevabıdır; geçmiş sahne ID'si değiştirilmez. Gerçek aşama 4 yedi ayrı ek görüntüde görsel, tek an, merkez hit ve tema/font/kaynak bağlarıyla incelendi; bunlar v11 manifest satırları değildir. Ana ve ustalık sonrası ana ekranda hero bağlantısı ile ayrı birincil CTA farklı eylemlerdir; ilk karede CTA ekran dışındadır, ek tanık gerekir.

İncelemeci yedi manifestin ham verilerini ayrı ayrı okudu ve seçili görüntüleri inceledi; tüm görüntüleri gözle tek tek incelediği, ekran okuyucu/cihaz veya genel G4'ü kabul ettiği iddia edilmez.

## Sonraki ek kanıt

Ana home ve ustalık sonrası home CTA’ları için ayrı yedişer sentetik scroll görüntüsü ve her sette log/manifest bağı oluşturuldu: kaynak, tema/font, tam görünürlük, beş nokta ve ölçülen içerik kesişimi doğrulandı. Ek profiller aynı tür durumu yeniden kurar, eski v11 çekim oturumunun veya tüm state’in birebir devamı oldukları kanıtlanmaz. Gerçek S0 ve kavram setlerinde de yedişer görüntü/log/manifest bağı bulunur. `supplemental-manifest.mjs --check` dört setin tümünde geçer; gerçek cihaz, gerçek Tab ve açık details kapsam dışıdır.
