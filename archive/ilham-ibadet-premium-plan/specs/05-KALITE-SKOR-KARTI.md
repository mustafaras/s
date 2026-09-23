# Kalite değerlendirmesi ve kullanıcı görevleri

“Premium” değerlendirmesi öznel puanı ve zorunlu geçiş koşullarını ayırır. P0 veri kaybı, yanlış kayıt, kırık temel eylem, izinsiz içerik veya erişilemeyen ana akış varsa ağırlıklı ortalama ne olursa olsun kabul yok.

## Tasarım değerlendirme ölçeği

0: yok; 1: taslak; 2: çalışıyor ama tutarsız; 3: tüm durumlarda tutarlı; 4: kullanıcı görevinde kanıtlı, ayrıntıları özenli. **Hedef her boyutta ≥3, toplam ≥85/100**; ölçülmüş skor henüz yok. İki bağımsız değerlendirme mümkün değilse tek inceleyici sınırı rapora yazılır.

| Boyut | Ağırlık | Kanıt |
|---|---:|---|
| Hiyerarşi ve yön bulma | 20 | S01/S02 görev başarısı ve ekran incelemesi |
| Okuma ve metin işçiliği | 20 | S03/S08, uzun metin, RTL, %200 |
| Etkileşim sürekliliği | 20 | Not/sayaç/video/scroll kesinti senaryoları |
| İçerik değeri ve kaynak güveni | 15 | Pilot incelemesi, atıf/hak zinciri |
| Görsel tutarlılık ve karakter | 15 | 12 ekran bileşen/token karşılaştırması |
| Boş/hata/geri dönüş kalitesi | 10 | Kaynak yok, izin red, veri yok, yeniden açılış |

Formül: `sum(weight * score / 4)`. Eksik boyut 0, payda küçültülmez. Erişilebilirlik zorunlu kabul koşulu olarak ayrıca geçer; görsel ağırlık içinde eritilmez.

## Kullanıcı görev protokolü

Pilot tek kullanıcıysa sonuç yalnız o kullanıcı için doğrulamadır. İsteğe bağlı 3–5 gönüllüyle sentetik veri üzerinden kullanılabilirlik gözlemi yapılabilir; hassas ibadet kaydı toplanmaz. Düşünerek anlatma sırasında süre ölçümü ile sessiz görev süresi ayrılır. Aşağıdaki eşikler tasarım hipotezidir; baseline IIP-01'de, prototip IIP-02'de, sonuç 08/18/23'te kaydedilir.

| Görev | Başlangıç | Başarı | Hedef / hata |
|---|---|---|---|
| U01 Vakit kaydını bul | Bölüm girişinde | Doğru günün kayıt ekranı | ≤2 dokunuş; yanlış gün 0 |
| U02 Öncü bul | İlham araması boş | İstenen alan/kişinin makalesi | ≤30 sn; ipucu almadan |
| U03 Okumaya dön | 10. paragrafta kapat | Aynı oturumda aynı bölüm | İçerik kaybı 0; fazladan arama yok |
| U04 Zikre devam | Aktif hatim var | Aynı hatim/sayı | ≤2 dokunuş; yanlış preset 0 |
| U05 Kaynağı anla | Dua/âyet ekranı | Asıl metin ve yorumu ayır | Katılımcı kendi sözüyle açıklayabilir |
| U06 Ağ hatasından çık | Öncü kaynak timeout | Tekrar dene veya mevcut içerik | Kilitlenme 0; yanlış başarı mesajı 0 |
| U07 Raporu yorumla | Eksik günlü hafta | Kayıtlı/bilinmeyen ayrımı | “İbadet puanı” olarak yorumlanmaz |
| U08 Büyük yazı | %200 metin | Okuma ve kaydetme | Yatay sayfa kayması/örtülme 0 |

## Performans protokolü

Cihaz modeli, OS/browser, viewport, tema, veri seti, sıcak/soğuk cache ve commit+diff hash kayıtlı. Yerel UI gecikmesi event başlangıcı→sonraki tamamlanmış paint; ağ süresi ayrı. 5 ısınma+30 ölçüm; p50/p95 ve en kötü örnek. Hedef hub p95 ≤200 ms, sayaç yanıt ≤100 ms. Uzun görev ve düğüm yeniden kurulum sayısı da raporlanır. Ölçülmemiş değerler pending'dir.

## Erişilebilirlik ve görsel kanıt matrisi

Her S ekranı için light/dark × 320/390/768 px ana görünüm; metin %200 dar ekran; reduced-motion; loading/empty/error/ready uygun olanlar. 430 ve 1280 px ortak yerleşim sınırı ayrıca kontrol. Tüm kombinasyonların kör kartezyen ekran görüntüsü yerine risk temelli matris: okuyucu/S05/S08 için klavye/RTL/safe-area eklenir; risk atlanan hücre gerekçeli kaydedilir.

Kontrast eşikleri ve hedef boyutları [ana tasarım sözleşmesinde](../03-TASARIM-SISTEMI.md). Font gerçekten yüklenmediğinde fallback test edilir. Screenshot pixel farkı tek başına erişilebilirlik kanıtı değildir. VoiceOver/klavye gerçek etkileşim kayıtları gerekir.

## Görsel red işaretleri

Başlıkları sığdırmak için küçültmek; altın metni altın zemine koymak; farklı stillerde üç ana CTA; okunabilirlik pahasına blur; loading altında sahte bilgi; hata hâlinde boş beyaz ekran; imleci kaybeden not; ibadet için rekabetçi skor. Bunlar yalnız puan düşürmez, ilgili kabul kriterini başarısız yapar.
