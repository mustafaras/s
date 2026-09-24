# KAO arayüz düzeltmesi · 2026-09-24

Sağ üstte her zaman görünen Offline düğmesi ve yönetim paneli `index.html` yüzeyinden kaldırıldı. Mevcut servis çalışanı kaydı, ağ/senkron korumaları ve kontrollü genel cache motoru değiştirilmedi.

Kur’an Arapçası Öğreniyorum girişi Ayarlar’dan kaldırıldı. Yeni kart İlham & İbadet ana yüzeyinin Bugün girişlerinde, Kur’an Yolculuğu kartından hemen sonra yer alır. Kart yalnız mevcut `data.quranLearn` durumunu okur; tanınan kelime ve bugünkü cevap sayısını gösterir, veri oluşturmaz veya kaydetmez. Tek mevcut `App.kaoOpen()` köprüsünü kullanır ve kapanışta odağı karta döndürür.

Bu kayıt, kullanıcının ilerlemeden önce istediği erken arayüz düzeltmesidir. KAO-21’in KAO-20 bağımlılığı kaldırılmadı ve kart tamamlandı sayılmadı. Sıradaki plan kartı KAO-13 olarak kaldı. Push, merge, tag, deploy, tarayıcı veya kullanıcı cihazı kabulü yapılmadı.
