> Yöntem düzeltmesi: Bu genel çekimler sırasında onboarding denetimi, boş sentetik profilde parola alanının DOM’da var olup olmadığını sorguladı; parola değeri okunmadı veya doldurulmadı, gerçek profil kullanılmadı. Alanın kendisine otomasyonla erişmeme sınırı bakımından bu sorgu sorunludur; genel çekim aracından kaldırıldı. Ham sonuçlar korunur ve bu yöntem G4 uyumlu diye sunulmaz.

# K3PD-29 · v2 genel görsel QA · 2026-10-28

Yedi sentetik, yerel koşum: açık/koyu 320/390/460 ve açık 390 +34 px safe-area. Her birinde 74 görüntü, 74 satır, 42 CTA kararlılık kaydı, 0 ölçüm hatası, 0 üretim bulgusu. Onboarding her iki tema ve üç genişlikte var. `MANIFEST.json`, `log.txt`, `issues.txt` ve görüntüler her koşumda korunur; eski v1 kanıtları üzerine yazılmadı.

`node tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs --kapsam --v2-temiz <7 dizin>`: exit 0, 518 satır, 7/7 kombinasyon. `--dogrula --v2-temiz <7 dizin>`: exit 0, 518 satır, hash/sayım/log/tema eşliği. `--v2-temiz` yalnız v2 ve sıfır üretim bulgusu filtresidir; **kaynakların güncelliğini doğrulamaz**. Tarihi v1 koşumu aynı filtreyle reddedilir, normal `--dogrula` tarihsel bütünlük kontrolü yapar. Manifest ile log birlikte değiştirilirse normal v1 modundaki eşzamanlı sürüm düşürme güvenilir şekilde saptanamaz.

`--glif-karsilastir <glif-referans> <light-460-0>`: 30 dizi aynı sırada, 460 px, 4×, açık tema, görüntüler farklı, exit 0. 390/+34 ile karşılaştırma denemesi genişlik/ölçek eşleşmediğinden exit 1; 460 karşılaştırması bu hatanın doğru yöntemle giderilmesidir.

Çekim öncesi `../cozum-20261028/build-focus-ring/BUILD.json` ve `practice-current-*` kayıtlarında, çekimler sonrası kaynaklarda aynı hashler ölçüldü: `app/kao.css` SHA-256 `a09b6880a6a55f6811326b62f8f65a71a084435e12376d22bd37a246516d846b`; `app/core/quranLearnViews.js` `9d2dceed0ab0172275ab2e781957e8bfe5539bc0d197f8af0f3a5bde7b9e3f49`; `app/core/quranLearn.js` `19927d2f4567543be01dcc741a88c055a554600dd9453b937f8ad1a6371f9ae9`. V2 manifestleri kaynak hashlerini içermez; bu kayıt harici zaman sırası ve hash gözlemidir, manifestten türetilmiş kaynak tazelik garantisi değildir.

Genel çekim aracı kırpıcı ataları dikkate alıp görünür CTA/içerik örtüşmesini v2 üretim bulgusuna kaydeder. Fixture, örtüşme bayrağı/listesi silme ve sürüm alanı eksiltme denemelerini reddeder. CTA probe'unun ilk şık ve dış scroll'u ölçmesi, bütün iç scroll konumlarında tüm seçeneklerin erişimini kanıtlamaz. Gerçek cihaz ve ekran okuyucu kabulü yapılmadı.
# Yöntem sınırı · 2026-10-28

Bu koşumları üreten eski araç, boş sentetik profilde `data.settings.ghToken` alanını boolean kontrolü için okudu. Gerçek profil veya gerçek token kullanılmadı, değer loglanmadı; yine de bu okuma G4'ün token alanlarını okumama kuralına uymaz. Ham kayıtlar korunur ve tek başlarına G4 uyumlu kabul kanıtı sayılmaz.

