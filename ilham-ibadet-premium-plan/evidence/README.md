# Kanıt deposu

Şu an üretim kartları için kanıt yoktur. Plan denetimi `tracking/PLAN-REVIEW.md` dosyasındadır; uygulama kanıtı değildir.

Kart başladığında `IIP-NN/` oluştur; log, inceleme, handoff ve receipt burada. Token/özel veri/screenshot kişisel içerik içeremez. Gerçek cihaz raporu kullanıcı onayı gelmeden doldurulmaz. Receipt içindeki artifact yolunu plan köküne göre yaz: `evidence/IIP-04/source.log` gibi.

Her receipt tek gate'i belgelendirir. Bir log birden çok gereksinimi doğrulayabilir; tam REQ listesi yazılır. HEAD'e ek diff hash ve untracked kaynaklar için hash manifesti kullanılır. Dosya varlığı içeriğin doğru olduğunu garanti etmez; reviewer doğrular.
