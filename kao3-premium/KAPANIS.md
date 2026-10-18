# K3P · Program kapanışı (K3P-26 ölçüm + K3P-27 yayın)

**Tarih:** 2026-10-18
**Son kart:** K3P-27 · **Dalga:** 5
**Program durumu:** 37/37 kart tamamlandı · `status=completed` · `nextPrompt=null`
**Yayın onayı:** `releaseApproval=APPROVED-2026-10-18`

## K3P-27 · canlı yayın makbuzu

- **Yetki:** Kullanıcı “sıradaki adım dan devam et ve tümünü canlıya al” diyerek K3P-27 yayınını açıkça istedi.
- **Pin:** `20261017a → 20261018a`. `git diff main --name-only` ile seçilen üretim varlıkları `app/core/quranLearn.js` ve `app/core/quranLearnViews.js`; ortak pin `index.html`, `panel-v2.html`, `sw.js` ve 12 testte toplam **15 dosya / 82 pin geçişi** olarak yükseltildi. `pinDeferral.files=[]`.
- **Kaynak kapısı:** `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` **exit 0 — TÜM KAPILAR YEŞİL**. KAO 82, app 78, panel 23, panel-v2 27, quran 9; reminders, driver, zikr, kontrast, çift şık, okunuş, plan ve pin senkronu PASS. Perf: içerik 184,591 KiB · runtime 133,061 KiB · CSS 15,877 KiB · p95 4,924 ms · steady 3,154 ms. `tekrar-uret` 9/10; tarihsel R-08 araç-modeli kalemi açık, 10/10 iddiası yok.
- **GitHub Pages:** release commit `6c10693c8e8fbed997f89bbfd41a0f5117953f4d`; run [39126116607](https://github.com/mustafaras/s/actions/runs/39126116607) — validate **SUCCESS**, deploy **SUCCESS**.
- **Canlı kanıt:** `https://mustafaras.github.io/s/` üzerinde `Cache-Control: no-cache`, `Pragma: no-cache`, `cache: no-store` ve tek kullanımlık query ile 3 host dosyası + **61 sürümlü URL** çekildi. **64/64 HTTP 200; 64/64 yerel/canlı SHA-256 eşliği.** Pin `sw.js` içinde `SW_VERSION='20261018a'`.
- **Kanıt düzeyi:** kaynak/headless + kontrollü sentetik görsel QA + canlı statik dosya eşliği. Fiziksel cihaz, gerçek ekran okuyucu, L2 uzman incelemesi ve 230 kayıt incelemesi kullanıcıda bekliyor.

## Kapsam ve sonuç

K3P-26, mevcut K3P yüzeyinin görsel QA'sını ve ölçümünü tamamladı. Üretim JS/CSS, `data`, `migrate()` ve `App.kao*` yüzeyi değiştirilmedi. Görsel kontroller sentetik durumla, dış istekleri kesen CDP pipe ve her çekimde yeni boş profil kullanılarak yapıldı.

## Hedef karşılama · KAO ölçüleri

| Ölçü | Başlangıç | Hedef | Sonra | Sonuç |
| --- | --- | --- | --- | --- |
| Çift şıklı görev | Yerleşik 631/1.127; yeni 1/1.087 | 0 | Yerleşik 0/1.127; yeni 0/1.087 | **PASS** |
| Vasl hatalı lemma | 18 | 0 | 0 | **PASS** |
| Güneş harfi idgâmı eksik örnek | 274 | 0 | 0 | **PASS** |
| Ders dokunuşu (otomatik geçiş kapalı/açık) | 69/39 | Açık varsayılanda ≤40 | 72/42 | **Açık durum 2 dokunuş fazla** |
| Tanıma görevi payı | %93; yalnız kelime görevlerinde %91 | ≤%60 | Yeni %92,92; yerleşik %91,57 | **Genel hedef karşılanmadı** |
| Bugün ekranı seçenekleri | 13 düğme | ≤5 | 5 seçenek; 6 toplam düğme (kapat dâhil) | **PASS** |
| `App.kao*` | 45 | 45 | 45 | **PASS** |
| Runtime gzip L6 | 118,105 KiB / eski 128 KiB tavanı | K3P-STATE hedefi ≤128 KiB | 133,061 KiB; K3P-18'de onaylanan tavan 136 KiB | **128 hedefinin üstünde; 136 tavanının altında** |
| Yazı tipi dosyası | — | ≤150 KiB | 24.473 KiB (25.060 bayt, tek WOFF2) | **PASS** |
| İçerik gzip | 183,939 KiB | ≤256 KiB | 184,591 KiB | **PASS** |
| CSS gzip L9 | 13,035 KiB | Güncel tavan ≤16 KiB | 15,877 KiB | **PASS; yalnız 123 B pay** |

Tanıma oranı için iki farklı ölçü birleştirilmedi: KAO hedef tablosundaki yeni/yerleşik toplam kelime görevleri %60 sınırını karşılamıyor. Karışık tekrar örneğinde 1.324 görev içindeki R1 tanıma payı %48,94'tür; bu ayrı örnek K3P-18 kabul ölçüsünü karşılıyor.

## Hedef karşılama · akış

| Ölçü | Hedef | Sonra | Sonuç |
| --- | --- | --- | --- |
| En uzun edilgin ekran dizisi | ≤1 | 1 | **PASS** |
| Hedef ekranındaki sözcük sayısı | AKIS §3 ① gereği ≤25 | 62; eski `akis-olc` eşiğinde hedef ekranların 80/109'u >45 | **Karşılanmadı** |
| Tanış ekranı | ≤45 | En çok 33; >45 olan 0/499 | **PASS** |
| Kavram ekranı | ≤45 | En çok 24; >45 olan 0/25 | **PASS** |
| İlk yeni içeriğe dokunuş | ≤7 | 7 | **PASS** |
| Doğru cevaptan sonra devam dokunuşu | Otomatik geçiş açıkken 0 | Açık 0; kapalı 30 | **PASS (varsayılan açık)** |
| İki yanlış sonrası uyarlanır zorluk | Şık sayısı azalmalı | İki yanlışta 2 şık; doğru yanıttan sonra 4'e döndü | **PASS** |
| Yarım kalan derse dönüş | Aynı görev ve devam ipucu | Aynı görev geri yüklendi; Bugün devam durumu gösterdi | **PASS** |
| Açılıştan ilk göreve dokunuş | ≤2 | 3 | **Karşılanmadı; A-3 kullanıcı kararına açık** |
| Ders başına overlay yeniden kurulumu | 0 | 0; fixture 17 render, 8 ders aşaması, 16 geçiş gördü | **PASS** |
| Ders sırasında KAO üstüne binen toast | 0 | 0 | **PASS** |
| Oturum başarı bandı | Cihazdaki oturumların ≥%70'i %80–90 bandında | Gerçek oturum/cihaz verisi yok | **Ölçülmedi** |
| Oturum süresi | Seçilen sürenin aşılmaması | `test_k3p_budget` PASS | **PASS** |

`akis-olc` 2b'nin eski `≤45 sözcük` sayımı, hedef ekranı için bağlayıcı kural değildir. Gerçek kural AKIS §3 ①'de `≤25` sözcüktür; 62 sözcüklük hedef ekranı bu kurala göre de başarısızdır. Araç 25 sözcük eşiğini aşan ekranların toplamını vermediğinden bu sayı uydurulmamıştır.

## Görsel QA

- Ön koşul `node tests/app/test_local_visual_qa_guard.js`: **10/10 PASS**. Kaynak `sync.js` Guard 1 yerel kökenlerden push'u engelliyor.
- `shoot-modal.mjs`, 320/390/460 px ve açık/koyu temada çalıştırıldı: **6 ayrı boş profil, her birinde 79 görünüm, toplam 474 sentetik ekran**. URL `v3done=1` kullandı; `forceSync` ayarlanmadı.
- Altı günlükte `origin=http://127.0.0.1:9000`, `token:false`, `force:null` ve `blocked-external:42` kaydı var. Her profilin dış istekleri engellendi; uygulama ağına çıkılmadı.
- Her görünümde `overflowX=false`. `KAO_QA_SCAN` toplam **15 bilgi bulgusu** verdi; tamamı `KAYDIRMALI-ALAN(bilgi)` sınıfındadır: 6 sûre seçicisi, 2 gramer tablosu ve 7 ders tablosu. Diyalog dışına taşma, metin kırpılması veya yatay sayfa taşması bulgusu yok.
- Kontak sayfaları: [açık 320](kanit/sonraki/kontak-acik-320.jpg), [koyu 320](kanit/sonraki/kontak-koyu-320.jpg), [açık 390](kanit/sonraki/kontak-acik-390.jpg), [koyu 390](kanit/sonraki/kontak-koyu-390.jpg), [açık 460](kanit/sonraki/kontak-acik-460.jpg), [koyu 460](kanit/sonraki/kontak-koyu-460.jpg).
- [K3P-00 ile karşılaştırma sayfası](kanit/sonraki/K3P-00-K3P-26-KARSILASTIRMA.html) 390 px açık/koyu görünümleri yan yana koyar. K3P-00'da 390 px'te 58, K3P-26'da 79 görünüm vardır; eski 320/460 px karşılığı olmadığı için bu genişliklerde yalnız yeni QA kontakları gösterilir.
- Ham PNG'ler kontaklar oluşturulup incelendikten sonra kaldırıldı; altı `log.txt` ve altı `issues.txt` kaydı korunuyor.

Bu, yerel kaynak-görsel kanıttır. Kullanıcı cihazında görsel kabul yapılmadı.

## Kanıt düzeyleri

| Düzey | Kanıt | Durum |
| --- | --- | --- |
| Kaynak/test | K3P-26 hızlı/tam kapı, ölçü araçları ve sentetik `deney-rapor.cjs --ornek` | Hızlı kapı **exit 0 — HIZLI KAPI YEŞİL**; tam kapı **exit 0 — TÜM KAPILAR YEŞİL**. 82 KAO, 78 app, 23 panel, 27 panel-v2, 9 quran fixture PASS; reminders, driver, zikr, kontrast, çift şık, okunuş, plan ve pin kapıları PASS. |
| Görsel QA | 474 sentetik ekran, 6 kontak, 15 bilgi amaçlı kaydırma bulgusu; gerçek taşma yok | **Tamamlandı** |
| Cihaz | Fiziksel cihaz/ekran okuyucu testi | **Bekliyor; yalnız kullanıcı kabul edebilir** |

Perf ölçümleri: kart ölçümünde içerik 184,591 KiB · runtime 133,061 KiB · CSS 15,877 KiB · p95 6,372 ms · steady 3,228 ms; tam kapı koşusunda p95 20,099 ms · steady 6,770 ms. `KAO2_ACCEPT_SLOW_HOST=1` göreli p95 bandını atlar; tam kapıda mutlak tavanlar PASS oldu. Tam kapıdaki göreli bant kıyası 6,770 ms > 6,360 ms olarak kaydedildi; yavaş makine bayrağıyla bu kıyas kapıdan çıkarılmıştı.

## H2–H9 · 14. ve 30. gün ölçüm takvimi

Son canlı taban, 2026-10-18 tarihli `20261018a` pinidir. Buna göre 14. gün **2026-11-01**, 30. gün **2026-11-17**'dir. İlgili günlerde kullanıcının verdiği yedekle aşağıdaki salt-okur raporu çalıştır; canlı depoya erişme. `--kesim` her iki raporda da canlı taban tarihidir:

```bash
node kao3-premium/araclar/deney-rapor.cjs <kullanıcının-verdiği-yedek.json> --kesim 2026-10-18 --bugun 2026-11-01
node kao3-premium/araclar/deney-rapor.cjs <kullanıcının-verdiği-yedek.json> --kesim 2026-10-18 --bugun 2026-11-17
```

| Hipotez | 14./30. gün bakılacak ölçü | Beklenen yön/eşik |
| --- | --- | --- |
| H2 | Kesimden önceki ve sonraki 14 günlük pencerede tekrar doğruluğu; pencere başına en az 20 cevap | Doğruluk düşüşü ≤5 puan |
| H3 | A merdiven ve B tanıma kollarında ortalama `s` ve unutma (`lapses/reps`) | A kolunda `s` daha yüksek, unutma daha düşük; 30. günde yorumlanır |
| H4 | `s ≥21` kartlardaki cevap doğruluğu | ≥%85 |
| H5 | İlk çalışma gününden ilk tamamlanan derse kadar süre | Azalır |
| H6 | `cift-sik`, `okunus-denetim` ve `tests/kao` kontrol seti | 0 çift şık, 0 okunuş hatası, testler yeşil; `deney-rapor` içinde H6 satırı yoktur |
| H7 | En az 5 cevaplı günlerde %80–90 başarı bandındaki günlerin payı | Günlerin ≥%70'i |
| H8 | Başlanmış dersler içinde `resume` dolu ve `doneAt` boş olanların oranı | Azalır |
| H9 | Tekrara geçmiş kartlarda hiç unutulmayanların oranı; yaklaşık alt sınır | Artar |

`node kao3-premium/araclar/deney-rapor.cjs --ornek` sentetik girdiyle çalıştırıldı. Gerçek kullanıcı yedeği kullanılmadı; gerçek rapor kimlik, kelime ve ders metinlerini basmaz.

## Açık sınırlar ve sonraki adım

- Üç ölçü hedefinin altında/üstünde kalıyor: ders başına otomatik açık dokunuş 42/40, hedef ekranı 62/25 sözcük, açılıştan ilk göreve 3/2 dokunuş. Bunlar K3P-26 içinde davranış değişikliği yapılmadan kaydedildi; K3P-27 bunları değiştirmeden yayınladı. Herhangi bir yeni düzeltme için ayrı kapsam gerekir.
- Toplam kelime görevlerinde tanıma oranı hedefi `%60`'ı aşar; karışık tekrar örneğinin `%48,94` sonucu ayrı bir ölçüdür.
- `tekrar-uret.cjs` tarihsel R-08 ölçümü 9/10 kalır; 10/10 iddiası yoktur. `akis-olc` 2b'nin 45 sözcük eşiği hedef ekranı için bağlayıcı değildir.
- Gerçek cihaz kabulü, gerçek ekran okuyucu turu, L2 okunuş uzmanı onayı ve 230 kayıt incelemesi kullanıcıda bekliyor. K3P-26 görseli cihaz kabulü sayılmaz.
- K3P programı yerel/başsız, kontrollü sentetik görsel ve canlı statik dosya kanıtlarıyla kapandı. Cihaz, gerçek ekran okuyucu, L2 uzmanı ve 230 kayıt kabulü kullanıcıda kalır; bunlar bu yayının kanıt düzeyi değildir.

**Program tamamlandı:** 37/37 kart; yeni K3P işi ayrı kapsam ister.
