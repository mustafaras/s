> Yöntem düzeltmesi: Bu genel çekimler sırasında onboarding denetimi, boş sentetik profilde parola alanının DOM’da var olup olmadığını sorguladı; parola değeri okunmadı veya doldurulmadı, gerçek profil kullanılmadı. Alanın kendisine otomasyonla erişmeme sınırı bakımından bu sorgu sorunludur; genel çekim aracından kaldırıldı. Ham sonuçlar korunur ve bu yöntem G4 uyumlu diye sunulmaz.

# K3PD-29 · kaynak bağlı v3 görsel QA · 2026-10-28

Yedi sentetik yerel koşum: açık/koyu 320/390/460 ve açık 390 +34 px safe-area; her koşum 74 görüntü ve log satırı, 42 CTA kararlılık kaydı, 0 araç hatası ve 0 üretim bulgusu. Eski v1/v2 kanıtları korunmuştur.

`--dogrula --v3-guncel <7 dizin>`: exit 0, 518 satır. `--kapsam --v3-guncel <7 dizin>`: exit 0, 7/7 kombinasyon. 460 px açık v3 glif tablosunun önceki referansla karşılaştırması: 30 dizi, 4×, exit 0. Manifestler, üç geçici profilde CDP'nin tarayıcıya sunduğu gerçek yerel yanıt baytlarının dosya yolu ve SHA-256 envanterini taşır; kaynak listesi log özetiyle, kaynak hashleri canlı çalışma ağacıyla doğrulanır. `index.html` içindeki script/stylesheet yolları ve K3P fontu dahil zorunlu kaynaklar kontrol edilir; bu envanter profil başına değil koşum genelinde birleşiktir.

Kaynağı ve görüntüyü üreten süreç dürüst yürütüldüğünde bu bağ hangi baytların sunulduğunu belgelemeye yarar. Manifest ve log birlikte değiştirilirse, dışarıdan imzalanmış veya değiştirilemez bir tanık olmadığı için tutarlı çok alanlı tahrifatı tek başına önleyemez; bağımsız inceleme bu sınırı yeniden üretti. Gerçek cihaz ve ekran okuyucu kabulü değildir.

CDP yerel dosya sınırında kardeş yol/symlink kaçışı kaynak incelemesinde bulundu ve gerçek-yol/ayraç duyarlı sınırla düzeltildi. `../cozum-20261028/cdp-path-test.mjs` yalnız geçici sentetik dosyalarla normal istek 200, kodlanmış kardeş yol 404, dış symlink 404 ölçtü. İlk testte tarayıcı profil temizliği `ENOTEMPTY` ile exit 1 verdi; tekrar denemeli temizlikle aynı test exit 0 oldu, önceki hata silinmedi.
# Yöntem sınırı · 2026-10-28

Bu koşumları üreten eski araç, boş sentetik profilde `data.settings.ghToken` alanını boolean kontrolü için okudu. Gerçek profil veya gerçek token kullanılmadı, değer loglanmadı; yine de bu okuma G4'ün token alanlarını okumama kuralına uymaz. Ham kayıtlar korunur ve tek başlarına G4 uyumlu kabul kanıtı sayılmaz. Her ana/onboarding sahnesinde yüklenmiş font ayrı kaydedilmemiştir.

