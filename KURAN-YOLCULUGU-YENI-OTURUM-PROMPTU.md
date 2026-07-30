# Raşit ile Kur’an Yolculuğu — Yeni Oturum Başlatma Prompt’u

Aşağıdaki metni yeni Codex/Claude oturumunun ilk mesajı olarak eksiksiz
kullan:

---

```text
Raşit ile Kur’an Yolculuğu özelliğini bu repoda aşamalı, güvenli ve kusursuz
biçimde uygulayacağız.

ÇALIŞMA ALANI
C:\Users\m_ras\Desktop\s

TEK KAYNAK PLAN
C:\Users\m_ras\Desktop\s\KURAN-YOLCULUGU-GELISTIRME-PLANI.md

ÖNCE OKUNACAK ZORUNLU BELGELER
1. AGENTS.md
2. CLAUDE.md
3. KURAN-YOLCULUGU-GELISTIRME-PLANI.md
4. GELISTIRME-PLANI.md
5. ILHAM-IBADET-GELISTIRME-PLANI.md
6. .claude/skills/run-seyma/SKILL.md

ANA ÇALIŞMA KURALI
Plan QY-00 → QY-18 sırasıyla uygulanacak. Bir aşama tamamen bitmeden diğerine
geçme. Tek oturumda bütün planı uygulamaya çalışma.

Bu oturumda yalnızca QY-00 ile başla.

QY-00 tamamlanınca:
- Yaptığın incelemeyi,
- Bulduğun mevcut mimariyi,
- Riskleri,
- Dokunduğun dosyaları,
- Çalıştırdığın kontrolleri,
- Bir sonraki aşamanın hazır olup olmadığını
kısa fakat kanıtlı biçimde raporla.

Sonra DUR ve benden açıkça “devam” dememi bekle.

Ben “devam” dediğimde yalnız sıradaki tek aşamayı uygula. Örneğin QY-00
tamamlandıysa yalnız QY-01 yapılacak. Her aşamanın sonunda tekrar rapor verip
duracaksın. “Devam” komutu hiçbir aşamayı atlama izni değildir.

CANLIYA ALMA YASAĞI
Ben açıkça ve o an:
“commit et”, “pushla”, “merge et” veya “canlıya al/deploy et”
demediğim sürece:
- commit yapma,
- push yapma,
- branch merge etme,
- pull request açma/birleştirme,
- GitHub Pages deploy tetikleme,
- production dosyası veya workflow çalıştırma,
- gerçek e-posta gönderme,
- WhatsApp mesajı gönderme/açma,
- mustafaras/seyma-data reposuna yazma.

“Devam” yalnızca bir sonraki geliştirme aşamasına geçme iznidir; commit, push,
merge veya deploy izni değildir.

VERİ GÜVENLİĞİ — TARTIŞMASIZ
- Şeyma uygulamasını gerçek tarayıcıda açma.
- localhost/file origin üzerinde uygulamayı çalıştırıp tarayıcıyla test etme.
- Yalnız güvenli headless node:vm harness’lerini kullan.
- Sync korumalarını, dev-origin guard’ını veya anti-clobber kontrolünü
  zayıflatma.
- mustafaras/seyma-data yalnız açık kullanıcı izniyle yazılabilir.
- Gelen e-posta otomasyonu data/latest.json’u asla yazamaz.
- Gerçek Gmail/GitHub/WhatsApp secret’larını kaynak koda, loglara, fixture’lara
  veya Markdown belgelerine yazma.
- Başlattığın yerel sunucuyu oturum bitmeden kapat.

MEVCUT ÇALIŞMA AĞACI
Çalışma ağacı kirli olabilir. Mevcut değişiklikler kullanıcıya veya önceki
aşamalara aittir.

- git reset --hard, checkout --, clean veya toplu silme kullanma.
- Mevcut değişiklikleri geri alma, ezme veya yeniden biçimlendirme.
- İlk iş olarak git status --short --branch ve git diff --stat ile durumu
  denetle.
- Hangi değişikliğin mevcut, hangisinin bu aşamaya ait olduğunu ayır.
- Çakışma riski varsa kod yazmadan önce raporla.
- QY-00 zaten salt-okunur denetimdir; bu aşamada uygulama kodu değiştirme.

ÜRÜNÜN ONAYLANMIŞ KARARLARI
1. 114 sûre Diyanet/TDV temelli yaygın nüzul sırasıyla gösterilecek.
2. Kıble kartının altında bağımsız “Raşit ile Kur’an Yolculuğu” kartı olacak.
3. Kullanıcı bir sûreyi açıp “Raşit’ten iste” diyebilecek.
4. İstek mevcut GitHub Actions/e-posta deseninden Raşit’e iletilecek.
5. Raşit’in e-posta cevabındaki YouTube bağlantısı panel onayı beklemeden
   yayınlanacak; fakat gönderen, requestId, replyToken, URL ve videoId katı
   biçimde doğrulanacak.
6. Ham e-posta, HTML veya iframe hiçbir zaman uygulamaya basılmayacak.
7. Video click-to-load ve youtube-nocookie ile gösterilecek.
8. Video ENDED olayıyla veya kullanıcının açık “İzledim” onayıyla izlendi
   sayılacak.
9. İzlenmeden “Raşit’e sor” butonu açılmayacak.
10. İzlenme sonrası WhatsApp hedefi +90 506 602 00 98 olacak.
11. WhatsApp hazır mesajı sûre adı ve nüzul durağını taşıyacak; kullanıcı kendi
    sorusunu yazacak.
12. Uygulama WhatsApp mesajının gerçekten gönderildiğini iddia etmeyecek.
13. Panel yayın onayı değildir; yalnız gözlem ve hata giderme yüzeyidir.

MİMARİ SINIRLAR
- Proje vanilla JS/HTML/CSS, bundler ve backend yok.
- Mevcut tek data nesnesi ve migrate() deseni korunmalı.
- Kalıcı kullanıcı kaydı panel.html içinde aynalanmalı.
- Sûre kataloğu kullanıcı state’inden ayrı, dondurulmuş içerik modülü olmalı.
- E-posta transport’u ayrı dosyalar kullanmalı:
  data/quran-request-outbox.json
  data/quran-delivery.json
  data/quran-responses.json
- Bu transport dosyaları latest.json full-replace zincirine bağlanmamalı.
- Kullanıcı secret’ları hiçbir transport payload’ına girmemeli.
- Mevcut inline App.* etkileşim deseni ve overlay mimarisi korunmalı.
- Yeni dependency veya framework ekleme.

HER AŞAMANIN ÇALIŞMA PROTOKOLÜ
1. İlgili plan aşamasını eksiksiz oku.
2. Gerekli mevcut kodu bounded aralıklarla incele.
3. Aşamanın kapsamını ve kabul kriterlerini commentary’de söyle.
4. Yalnız o aşamaya ait en küçük güvenli değişikliği yap.
5. Gerekli migration/panel/test aynasını aynı aşama kapsamında tamamla.
6. Syntax ve headless testleri çalıştır.
7. git diff --check çalıştır.
8. AGENTS.md Agent Handoff Log’un en üstüne kayıt ekle.
9. Cache bump gerekiyorsa yalnız planın belirlediği final koordinasyon
   noktasında yap; her aşamada ayrı ayrı bump yapma.
10. Sonuç raporunu ver ve DUR.

Bir test başarısızsa:
- sonraki aşamaya geçme,
- başarısızlığı gizleme,
- kapsam dışı büyük refactor yapma,
- kök nedeni bulup aynı aşamada düzelt,
- çözülemiyorsa kanıtla ve benden yön iste.

DOĞRULAMA TABANI
Değişiklik türüne göre en az:
- node --check app.js
- node --check sync.js
- node .claude/skills/run-seyma/driver.mjs
- node .claude/skills/run-seyma/zikr-harness.mjs
- ilgili yeni Kur’an harness/testleri
- node test_faz10_sync.js
- node test_faz11_panel.js
- panel inline script/script-tag kontrolü
- CSS brace kontrolü
- git diff --check

Gerçek dış servis testi yalnız benden açık izin aldıktan sonra, ayrı bir aşama
ve geri alma planıyla yapılabilir.

TASARIM KALİTESİ
- Premium, vakur, sıcak ve editoryal bir Kur’an yolculuğu hissi.
- Kıble kartıyla akraba ama ayrı kimlik.
- İç içe kart yok.
- Flu/soluk metin veya metin arkasında blur yok.
- Yatay kaydırma yok.
- 370, 390, 393, 430 ve 460px genişliklerde çakışma yok.
- Arapça lang="ar" ve dir="rtl".
- Light/dark, reduced-motion, klavye ve ekran okuyucu desteği.
- Tek ekranda tek baskın CTA.
- Dekorasyon bilgi hiyerarşisinin önüne geçmemeli.

İLETİŞİM DOĞRULUĞU
Arayüz yalnız kanıtlanan durumu söyleyecek:
- Outbox yazıldı: “İsteğin kaydedildi.”
- Delivery receipt geldi: “Raşit’e haber verildi.”
- Cevap doğrulandı: “Raşit’in anlatımı hazır.”
- wa.me açıldı: “WhatsApp açıldı.”

Şunları kanıt olmadan söyleme:
- “Raşit isteğini gördü.”
- “Video hazırlanıyor.”
- “Mesaj gönderildi.”

QY-00 İÇİN ŞİMDİ YAPILACAKLAR
Bu ilk turda yalnız:
1. Zorunlu belgeleri oku.
2. Git çalışma ağacını salt-okunur denetle.
3. Mevcut App/SeySync/panel/outbox/inbox/workflow akışını çıkar.
4. E-posta gönderme ve gelen cevap köprüsünün sorumluluk sınırını yaz.
5. latest.json’a dokunmadan kullanılacak transport mimarisini doğrula.
6. Tehdit modelini çıkar:
   - sahte gönderici,
   - yanlış/eskimiş token,
   - çift cevap,
   - iki URL,
   - bozuk/silinmiş video,
   - yanlış sûre eşleme,
   - secret sızıntısı,
   - bayat cihaz merge’i,
   - otomasyonun ana veriyi ezmesi.
7. QY-01 öncesi kesin dosya ve test matrisini öner.
8. Uygulama kodu yazmadan raporla.
9. DUR ve “devam” komutumu bekle.

Şimdi QY-00 ile başla. Diğer aşamalara geçme.
```

---

## Kullanım

1. Yeni oturum aç.
2. Yukarıdaki kod bloğunu ilk mesaj olarak gönder.
3. Ajan QY-00 raporunu tamamlayınca incele.
4. Uygunsa yalnızca `devam` yaz.
5. Her `devam`, yalnızca bir sonraki QY aşamasını açar.
6. Canlıya almak istediğinde bunu ayrıca ve açıkça söyle:

```text
Tüm testleri yeniden çalıştır. Sonucu göster. Ben ayrıca onay vermeden commit,
push, merge veya deploy yapma.
```

Test raporunu gördükten sonra istersen ayrı komut:

```text
Temiz commit, push, merge ve deploy yap; GitHub Pages sonucunu doğrula.
```
