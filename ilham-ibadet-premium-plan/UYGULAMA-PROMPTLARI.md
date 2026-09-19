# Tek dosya — sıralı oturum promptları

**Amaç:** Her yeni oturumda bir adım çalıştırmak; önceki sohbeti taşımadan kaldığı yerden güvenle ilerlemek. Bu dosya görev promptlarının tek kaynağıdır. Canlı durum, kapsam ve kabul kriterleri JSON kayıtlardan okunur; burada kopyalanmaz.

## Kullanım

1. Aşağıdaki sıradan çalıştıracağın adımın **Yeni oturuma yapıştır** bloğunu kopyala.
2. Aynı adım yarım kaldıysa aynı bloğu tekrar kullan. Bitmiş adımı yeniden uygulama.
3. Ajan yalnız ortak kuralları + seçili adımı + dar canlı özeti okur. Dosyanın tamamını her oturuma yapıştırmana gerek yok.
4. İlk oturum IIP-01; sonraki oturum IIP-02…IIP-24. Bir adım birden fazla oturum sürebilir. Engeli olan adım atlanmaz.

**Hızlı çağrı örneği:**

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/UYGULAMA-PROMPTLARI.md ortak kurallarına göre yalnız IIP-01 adımını uygula. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-01 çıktısını oku; tüm planı yükleme. Yarım kaldıysa devam et, done ise yeniden uygulama. Bu oturumda sonraki adıma geçme; commit/push/deploy yapma.
```

Ajanın bu dosyayı bulamaması durumunda yeni klasör veya yeni plan üretmesi değil yolu doğrulaması gerekir. Bu dosyanın hazırlanması uygulama adımlarının başlaması anlamına gelmez.

<!-- COMMON:START -->
### Ortak oturum sözleşmesi

1. CWD `/Users/m_ras/Desktop/seyma`. Kullanıcının seçtiği **tek adımı** uygula; dosyayı okumak yetki değildir. Verilmiş yetkiyi tekrar sorma. Sıra IIP-01→24; daha önce bitmeyen kart varsa onu atlama, durumu raporla. Seçili kart zaten done ise yeniden uygulama; kanıtı kontrol edip dur. Yarım kartta aynı kartı devam ettir.
2. `git -c core.fsmonitor=false status --short --branch`, `git -c core.fsmonitor=false log -1 --format='%H%n%s'` ve `node ilham-ibadet-premium-plan/tools/plan-check.mjs` çalıştır. Tarihsel HEAD yerine canlı HEAD kullan; mevcut dirty dosyaları koru. Başarısız plan kontrolünü gizleme; yalnız yetkili kapsam içinde onar.
3. `session-brief.mjs IIP-NN` çıktısını **bir kez** oku. Tüm klasörü, state JSON'unu, ledger'ı, 24 kartı veya bütün spec dosyalarını topluca yükleme. Çıktı seçili kartın canlı durumunu, izinli dosyalarını, REQ/TC, gate, karar ve kaynak rotasını içerir. Kök AGENTS/teknik ilkeler geçerli; gerekli belgelerin sadece ilgili başlığını oku.
4. Önce aynı kartın `evidence/IIP-NN/HANDOFF.md` dosyasını varsa oku. Bağımlı kartların yalnız kısa devir/karar sonucunu gerektiğinde aç; eski logları tekrar yükleme. Hedef üretim fonksiyonlarını `rg` ile bul, dar aralıkları oku. Doğruluk için gerektiğinde bağlamı genişlet; token tasarrufu test/kaynak okumayı atlama gerekçesi değildir.
5. Kullanıcının bu kart yetkisini state'e kaynak mesajıyla kaydet; yalnız bu kart için owner, plannedWriteFiles=locks ve gerekiyorsa data-writer kaynağını al. Başkasının kilidini sahiplenme. Tek ajan varsayılandır; çok ajan gerekmiyorsa başlatma. State/ledger tek yazarı oturum integratörüdür.
6. Yalnız izinli üretim/test dosyalarında çalış. `app.js` izinliyse yalnız açıkça tanımlanmış köprü. Veri/sync/migration/render/handler değişmezlerini kart kapsamına göre koru. Yeni scope/karar gerekiyorsa mevcut yetkiyle uzlaştır; gerçek dış karar eksikse blocked nedeni yaz, tahminle kabul verme.
7. Gerçek token/localStorage/kişisel veri kullanma; `seyma-data` yazma. Tarayıcı/server yalnız ayrıca yetkili kontrollü QA ile. Commit/push/merge/tag/deploy bu promptlarla yetkili değildir. Yeni içerik için kaynak/hak/insan incelemesi; yeni veri için şema/merge/panel sözleşmesi gerekir.
8. Brief'teki komutları ve REQ/TC olumlu/olumsuz senaryolarını doğrula. Uzun logları dosyaya yaz, bağlama sonuç+exit code+hata bölümünü al. İlgili testler geçtikten sonra gerekçesiz tüm repo testini tekrarlama; paket kapanış kartının tam regresyonunu atlama.
9. Kapanışta yalnız gerekli `templates/EVIDENCE.json`, `EVIDENCE-GATES.md` ve `HANDOFF.md` şablonlarını aç. Gerçek receipt/artifact/hash üret. `implemented` ürün/kod var; `done` gerekli gate/karar/inceleme geçti demektir. Görsel veya içerik kabulü yoksa done verme; cihaz ve yayın ayrı kalır.
10. State ve append-only ledger'ı güncelle; devire kalan iş/son komut/HEAD+diff hash/kilit/sonraki yetkili eylemi yaz. `node ilham-ibadet-premium-plan/tools/plan-check.mjs --render` ardından salt-okur kontrol ve `git diff --check` çalıştır. Kısa sonuç: kart, durum, değişen dosyalar, testler, kalan engel. Sonraki adımı kendiliğinden başlatma.
<!-- COMMON:END -->

## Sıralı çalışma listesi

1. **IIP-01** — Başlangıç ve davranış envanteri
2. **IIP-02** — Görsel yön ve token eşlemesi
3. **IIP-03** — Anlam denetimi ve erken güven düzeltmesi
4. **IIP-04** — Hub görsel hiyerarşisi
5. **IIP-05** — Öncü okuyucusu görsel kalite
6. **IIP-06** — İbadet ve kıble görsel birlik
7. **IIP-07** — Zikir ve Kur’an geçiş tutarlılığı
8. **IIP-08** — İlk paket kabulü
9. **IIP-09** — Hedef bilgi mimarisi
10. **IIP-10** — Öncü arama ve filtre
11. **IIP-11** — Okuyucu etkileşimleri
12. **IIP-12** — Günlük odak ve devam et
13. **IIP-13** — Vakit kaynağı ve tazelik
14. **IIP-14** — Kayıpsız tarihsel kayıt sunumu
15. **IIP-15** — Ritim raporu doğruluğu
16. **IIP-16** — Editoryal pilot üretimi
17. **IIP-17** — Kaynaklı seçki ve dua yüzeyi
18. **IIP-18** — İkinci paket kabulü
19. **IIP-19** — Kalıcı genişletme sözleşmesi
20. **IIP-20** — Yer imleri ve okuyucu tercihi
21. **IIP-21** — Kısa içerik yolculukları
22. **IIP-22** — Kontrollü offline paket
23. **IIP-23** — Tam zincir ve cihaz hazırlığı
24. **IIP-24** — Teslim ve yayın adayı

## IIP-01 — Başlangıç ve davranış envanteri

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-01 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-01 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-01:START -->
### Bu oturumun görevi

1. Kaynak HEAD, dirty dosyalar ve mevcut pinleri kaydet; kullanıcının önceden yaptığı değişiklikleri sahiplenme.
2. Her işlev için entrypoint→handler→data→panel→fixture tablosu; mevcut ve önerilen özellikleri ayır.
3. U01–U08 başlangıç ölçümünün yapılabilecek kısmını ve eksik cihaz kanıtını kaydet.

**Kapanış:** Yalnız IIP-01; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-01:END -->

## IIP-02 — Görsel yön ve token eşlemesi

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-02 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-02 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-02:START -->
### Bu oturumun görevi

1. 12 ekranın kompozisyonlarını aynı sentetik içerikle tasarla; A mevcut yerleşim ve B hedef yerleşim farkını işaretle.
2. Tipografi/renk/boşluk/ikon/hareket token haritası; 8 temel bileşenin varyantlarını çıkar.
3. 3,0 altındaki kalite boyutlarını yeniden işle; yüksek ayrıntılı tasarım ile gerçek render kanıtını ayır.

**Kapanış:** Yalnız IIP-02; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-02:END -->

## IIP-03 — Anlam denetimi ve erken güven düzeltmesi

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-03 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-03 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-03:START -->
### Bu oturumun görevi

1. fajr/sunrise tarihsel anlamını ve rapor paydasını kaynak/testten belgeye çıkar; gerçek kişisel veri okuma.
2. Belirsiz oranı başarı/ibadet uyumu diye adlandıran mevcut kopyayı güvenli betimleyici ifadeyle düzelt; hesap, alan ve çağrı grafiğini değiştirme.
3. Current-panel aynı kavramı gösteriyorsa yalnız kopya tutarlılığını düzelt; çözülmeyen hesap IIP-14/15 için açık sorun olarak kalsın.

**Kapanış:** Yalnız IIP-03; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-03:END -->

## IIP-04 — Hub görsel hiyerarşisi

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-04 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-04 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-04:START -->
### Bu oturumun görevi

1. Mevcut beş sekmeyi ve çağrı sırasını koru; ortak araçları kompaktlaştır, seçili alanı vurgula, kart ölçü ve boşluklarını birleştir.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-04; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-04:END -->

## IIP-05 — Öncü okuyucusu görsel kalite

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-05 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-05 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-05:START -->
### Bu oturumun görevi

1. Tipografi, makale genişliği, görsel fallback, kaynak footer ve sabit Okudum alanını iyileştir; mevcut scroll-gate davranışını koru.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-05; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-05:END -->

## IIP-06 — İbadet ve kıble görsel birlik

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-06 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-06 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-06:START -->
### Bu oturumun görevi

1. Vakit satırlarını, yöntem/hassasiyet metalarını ve kıble araçlarını aynı düzenle sun; mevcut hesap/sensör davranışına dokunma.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-06; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-06:END -->

## IIP-07 — Zikir ve Kur’an geçiş tutarlılığı

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-07 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-07 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-07:START -->
### Bu oturumun görevi

1. Başlık, buton, boş/hata ve kaynak yüzeylerini ortaklaştır; mevcut gelişmiş sayaç/video/not arayüzlerini koru.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-07; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-07:END -->

## IIP-08 — İlk paket kabulü

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-08 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-08 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-08:START -->
### Bu oturumun görevi

1. Dar fixture, VM, syntax, bütçe ve ilgili çapraz regresyonu tamamla; yetkili görsel QA ve cihaz kabulünü ayrı kaydet.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-08; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-08:END -->

## IIP-09 — Hedef bilgi mimarisi

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-09 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-09 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-09:START -->
### Bu oturumun görevi

1. Bugün/İlham/İbadet/Zikir/Ritim görünen adları; kıbleyi araçlara, tam Kur’an kartını ilgili girişlere taşı. Mevcut handler kimliklerini korumayı öncele.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-09; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-09:END -->

## IIP-10 — Öncü arama ve filtre

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-10 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-10 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-10:START -->
### Bu oturumun görevi

1. İsim/alan/okundu filtreleri; Türkçe arama; numara gridini ikincil özet yap.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-10; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-10:END -->

## IIP-11 — Okuyucu etkileşimleri

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-11 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-11 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-11:START -->
### Bu oturumun görevi

1. Oturumluk yazı büyütme, bölüm atlama, okuma konumunu aynı oturumda koruma; scroll-gate erişilebilir alternatifini açıkça kararlaştır.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-11; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-11:END -->

## IIP-12 — Günlük odak ve devam et

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-12 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-12 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-12:START -->
### Bu oturumun görevi

1. Mevcut kayıt ve kataloglardan tek günlük öneri; aktif zikir/Kur’an için devam satırı.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-12; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-12:END -->

## IIP-13 — Vakit kaynağı ve tazelik

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-13 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-13 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-13:START -->
### Bu oturumun görevi

1. Kaynak/metot/şehir/güncelleme etiketlerini ayır; eski tarihli cache ve hata durumunu görünür kıl.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-13; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-13:END -->

## IIP-14 — Kayıpsız tarihsel kayıt sunumu

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-14 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-14 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-14:START -->
### Bu oturumun görevi

1. Eski altı zaman anahtarını mutation olmadan okuyan sunum politikasını uygula; belirsiz sunrise kaydını tarihsel kayıt olarak ayrıca göster.
2. Güvenilir olarak ayrıştırılamayan ibadet toplamı/yüzdeyi göstermeyip kaynak kayıt sayısı ve belirsizlik açıklaması kullan.
3. Hiçbir migration yok; yeni standart kayıt şeması bu programın zorunlu B çıktısı değildir. İhtiyaç ADR/backlog olur; 19 bağımlılığı eklenmez.

**Kapanış:** Yalnız IIP-14; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-14:END -->

## IIP-15 — Ritim raporu doğruluğu

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-15 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-15 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-15:START -->
### Bu oturumun görevi

1. Vakit/zikir/okumayı ayır; uyum etiketini ve payda politikasını düzelt; bilinmeyen günleri açık göster; gün listesi ekle.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-15; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-15:END -->

## IIP-16 — Editoryal pilot üretimi

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-16 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-16 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-16:START -->
### Bu oturumun görevi

1. Pilot kaynak envanteri ve her metin için iddia/hak/inceleme kayıtlarını hazırla.
2. Alan inceleyicisi atanana kadar metinler draft; mevcut kaynaklı katalog UI fixture için kullanılabilir.
3. 6 tema için başlangıç/derinleşme/düşünme sırasını kur; gerçek dinî alıntıyı yetkin inceleme olmadan tamamlandı sayma.

**Kapanış:** Yalnız IIP-16; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-16:END -->

## IIP-17 — Kaynaklı seçki ve dua yüzeyi

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-17 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-17 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-17:START -->
### Bu oturumun görevi

1. Kaynak çekmecesi, Arapça/anlam ayrımı, erişilebilir okuyucu; yeni modül gerekiyorsa önce sahiplik/yükleme sözleşmesi.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-17; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-17:END -->

## IIP-18 — İkinci paket kabulü

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-18 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-18 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-18:START -->
### Bu oturumun görevi

1. Akış, hesap, içerik ve panel regresyonunu birlikte doğrula; davranış farklarını kullanıcıya incelet.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-18; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-18:END -->

## IIP-19 — Kalıcı genişletme sözleşmesi

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-19 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-19 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-19:START -->
### Bu oturumun görevi

1. Yeni yer imi/okuyucu/program alanlarının veri ve panel kapsamını kesinleştir; namaz migration ekleme.
2. Birleştirme/tombstone/cihaz saati çatışması/eski istemci kaybı/rollback senaryolarını karar belgesine yaz.
3. I1/I3/I5 farkını kullanıcının yetkilendirdiği kapsamla eşleştir; şema kararını onaylamadan 20 başlamaz.

**Kapanış:** Yalnız IIP-19; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-19:END -->

## IIP-20 — Yer imleri ve okuyucu tercihi

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-20 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-20 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-20:START -->
### Bu oturumun görevi

1. Sözleşmesi onaylanan yer imlerini ve tercihleri uygula; oturumluk konumu kalıcıya yalnız açık kapsamla geçir.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-20; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-20:END -->

## IIP-21 — Kısa içerik yolculukları

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-21 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-21 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-21:START -->
### Bu oturumun görevi

1. Bir adet 7 günlük pilot; gün kaçırınca ceza yok; durdur/devam et; ilerleme ve içeriğin sürümü bağlı.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-21; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-21:END -->

## IIP-22 — Kontrollü offline paket

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-22 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-22 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-22:START -->
### Bu oturumun görevi

1. Önce capability spike: cache manifesti, install/update yaşam döngüsü, kota ve tokenlı URL dışlama tasarımını sentetik testte kanıtla.
2. Kanıt sonrası yalnız genel kabuk/içerik paketini uygula; runtime fetch için geniş cache yakalaması yapma.
3. Kesik indirme, kaldırılamayan cache, eski sürüme dönme, aktif sayaç/not ve yeni servis worker yarışmasını test et.

**Kapanış:** Yalnız IIP-22; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-22:END -->

## IIP-23 — Tam zincir ve cihaz hazırlığı

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-23 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-23 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-23:START -->
### Bu oturumun görevi

1. Şema/sync/redaction/app/current-panel/Panel-v2; izinli yerel görsel QA; kullanıcı cihaz senaryolarını hazırla.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-23; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-23:END -->

## IIP-24 — Teslim ve yayın adayı

**Yeni oturuma yapıştır:**

```text
/Users/m_ras/Desktop/seyma reposunda UYGULAMA-PROMPTLARI.md ortak kurallarıyla yalnız IIP-24 adımını uygula. Dosya ilham-ibadet-premium-plan/ altında. Önce node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-24 çıktısını oku; tüm klasörü yükleme. Önceki adımlar tamam değilse atlama; bu adım yarımsa devam et, done ise yeniden uygulama. Sonraki adıma geçme. Commit/push/deploy yok.
```

<!-- IIP-24:START -->
### Bu oturumun görevi

1. Özellik→test→kanıt matrisi, değişen dosyalar, geri alma ve bilinen sınırları yaz; yalnız yetkili yayın kapsamını hazırla.
2. İlgili REQ/TC senaryolarının olumlu ve olumsuz durumlarını üret; boş/yükleniyor/hata/dönüş hâllerini kapsamda doğrula.
3. Kabul kanıtını ve değişen davranışı kart kimliğiyle kaydet; sonraki karta yetki yoksa geçme.

**Kapanış:** Yalnız IIP-24; canlı brief'teki REQ/TC ve gate'ler tamamlanmadan done verme. Bir sonraki oturum için kısa devir bırak.
<!-- IIP-24:END -->
