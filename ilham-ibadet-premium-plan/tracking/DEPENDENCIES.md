# Bağımlılıklar ve yazma sınırları

DAG teknik önkoşulları gösterir; yetki değildir. Varsayılan artan kart sırası. Aynı dosyayı yazan kartlar DAG bağımsız olsa da paralel uygulanmaz.

```mermaid
flowchart TD
  IIP_01["IIP-01: Başlangıç ve davranış envanteri"]
  IIP_02["IIP-02: Görsel yön ve token eşlemesi"]
  IIP_03["IIP-03: Anlam denetimi ve erken güven düzeltmesi"]
  IIP_04["IIP-04: Hub görsel hiyerarşisi"]
  IIP_05["IIP-05: Öncü okuyucusu görsel kalite"]
  IIP_06["IIP-06: İbadet ve kıble görsel birlik"]
  IIP_07["IIP-07: Zikir ve Kur’an geçiş tutarlılığı"]
  IIP_08["IIP-08: İlk paket kabulü"]
  IIP_09["IIP-09: Hedef bilgi mimarisi"]
  IIP_10["IIP-10: Öncü arama ve filtre"]
  IIP_11["IIP-11: Okuyucu etkileşimleri"]
  IIP_12["IIP-12: Günlük odak ve devam et"]
  IIP_13["IIP-13: Vakit kaynağı ve tazelik"]
  IIP_14["IIP-14: Kayıpsız tarihsel kayıt sunumu"]
  IIP_15["IIP-15: Ritim raporu doğruluğu"]
  IIP_16["IIP-16: Editoryal pilot üretimi"]
  IIP_17["IIP-17: Kaynaklı seçki ve dua yüzeyi"]
  IIP_18["IIP-18: İkinci paket kabulü"]
  IIP_19["IIP-19: Kalıcı genişletme sözleşmesi"]
  IIP_20["IIP-20: Yer imleri ve okuyucu tercihi"]
  IIP_21["IIP-21: Kısa içerik yolculukları"]
  IIP_22["IIP-22: Kontrollü offline paket"]
  IIP_23["IIP-23: Tam zincir ve cihaz hazırlığı"]
  IIP_24["IIP-24: Teslim ve yayın adayı"]
  IIP_01 --> IIP_02
  IIP_01 --> IIP_03
  IIP_02 --> IIP_04
  IIP_03 --> IIP_04
  IIP_04 --> IIP_05
  IIP_04 --> IIP_06
  IIP_04 --> IIP_07
  IIP_05 --> IIP_08
  IIP_06 --> IIP_08
  IIP_07 --> IIP_08
  IIP_08 --> IIP_09
  IIP_09 --> IIP_10
  IIP_10 --> IIP_11
  IIP_09 --> IIP_12
  IIP_11 --> IIP_12
  IIP_03 --> IIP_13
  IIP_09 --> IIP_13
  IIP_03 --> IIP_14
  IIP_13 --> IIP_14
  IIP_14 --> IIP_15
  IIP_08 --> IIP_16
  IIP_12 --> IIP_17
  IIP_16 --> IIP_17
  IIP_11 --> IIP_18
  IIP_12 --> IIP_18
  IIP_13 --> IIP_18
  IIP_14 --> IIP_18
  IIP_15 --> IIP_18
  IIP_17 --> IIP_18
  IIP_18 --> IIP_19
  IIP_19 --> IIP_20
  IIP_17 --> IIP_21
  IIP_19 --> IIP_21
  IIP_20 --> IIP_21
  IIP_19 --> IIP_22
  IIP_20 --> IIP_23
  IIP_21 --> IIP_23
  IIP_22 --> IIP_23
  IIP_23 --> IIP_24
```

## Koordinasyon

- 02 tasarım ve 03 alan incelemesi teorik olarak ayrılabilir; 03 runtime yazarsa kendi allowlist/lock ile.
- 05/06/07 ortak styles.css nedeniyle seri yazılır.
- 16 içerik hazırlığı, B mühendisliğinden ayrı artifactlerde yürüyebilir; yayın incelemesi bekler.
- 20/21 data/state ortaklığı ve 22 SW entegrasyonu integratörce sıraya alınır.
- State/ledger tek yazarı integratördür. Paralel çalışma yalnız oturum yetkisiyle.
