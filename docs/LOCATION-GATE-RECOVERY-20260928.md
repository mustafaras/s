# Konum kapısı bağımlılık onarımı — 2026-09-28

Kullanıcı izin vermesine rağmen requesting ekranında kaldığını bildirdi. Kaynak incelemesi ve gerçek appSurface registry VM testi hata yolunda `ReferenceError: ui is not defined` üretti. Taşınmış locationGateFailure gövdesinin ui/data/locationGateGranted bağları eksikti; navigator da açık bağımlılığa eklendi. app.js kayıt bag'i ve registry gerekli bağımlılık listesi eşleştirildi. Kalıcı veri şeması, migrate ve izin politikası değiştirilmedi.

Önce yeni davranış testleri: 34 PASS / 3 FAIL. Düzeltme sonrası ek timeout ve başarısız retry senaryolarıyla 39 PASS / 0 FAIL. Gerçek registry sentetik nesnelerle çalıştırılır; tarayıcı, ağ, gerçek depo ve konum kullanılmaz. Başarı, eski callback, timeout, başarısız düşük doğruluk denemesi ve izin reddi kapsanır. Eski testler zayıflatılmadı.

Genel kapılar: 164/164 PASS (KAO19/app77/panel23/panel-v2 27/quran9, syntax5, reminder/driver/zikr/kontrast4). Migration fixture 67/67 PASS; shell-inventory --gate PASS; appSurface syntax ve diff-check PASS.

Kaynak/test doğrulandı. Yayın yapılmadı; önceki yayın onayı KAO2-00…02 ile sınırlıydı. Ayrı yayın öncesinde app.js/appSurface cache pinleri ve eş test pinleri yükseltilmeli. Kullanıcının cihazındaki kesin neden veya düzelme henüz doğrulanmadı. KAO2 ilerletilmedi, kişisel veri deposuna yazılmadı.
