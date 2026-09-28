# Konum kapısı bağımlılık onarımı — 2026-09-28

Kullanıcı izin vermesine rağmen requesting ekranında kaldığını bildirdi. Kaynak incelemesi ve gerçek appSurface registry VM testi hata yolunda `ReferenceError: ui is not defined` üretti. Taşınmış locationGateFailure gövdesinin ui/data/locationGateGranted bağları eksikti; navigator da açık bağımlılığa eklendi. app.js kayıt bag'i ve registry gerekli bağımlılık listesi eşleştirildi. Kalıcı veri şeması, migrate ve izin politikası değiştirilmedi.

Önce yeni davranış testleri: 34 PASS / 3 FAIL. Düzeltme sonrası ek timeout ve başarısız retry senaryolarıyla 39 PASS / 0 FAIL. Gerçek registry sentetik nesnelerle çalıştırılır; tarayıcı, ağ, gerçek depo ve konum kullanılmaz. Başarı, eski callback, timeout, başarısız düşük doğruluk denemesi ve izin reddi kapsanır. Eski testler zayıflatılmadı.

Genel kapılar: 164/164 PASS (KAO19/app77/panel23/panel-v2 27/quran9, syntax5, reminder/driver/zikr/kontrast4). Migration fixture 67/67 PASS; shell-inventory --gate PASS; appSurface syntax ve diff-check PASS. KAO çevrimdışı pin sözleşmesi 13/13 PASS.

Kaynak/test doğrulandı. Kullanıcı 2026-09-28’de bu düzeltmenin canlıya alınmasını ve ardından sıradaki KAO2 kartına geçilmesini istedi. Dağıtım için index.html + sw.js kabuk/KAO pini ve yedi koruyucu fixture 20260928a → 20260928b eşlendi; KAO2 durum/prompt dosyaları yeni sabit taban pinini yansıtıyor. GitHub Pages ve canlı byte eşliği yayın kanıtı tamamlanınca eklenecek. Kullanıcının cihazında kesin neden veya düzelme ayrıca doğrulanmadı. KAO2-03 henüz başlatılmadı; kişisel veri deposuna yazılmadı.
