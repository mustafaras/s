# 2026-10-28 · K3PD-29 CTA düzeltmesi — uygulayıcı kanıtı

Bu kayıt uygulayıcı ölçümlerini ve bağımsız denetim bulgularını içerir; cihaz kabulü değildir. Bölüm 1 ve büyük metin FAIL, ilk 60px CSS denemesinin tarihsel kanıtıdır. Güncel grid denemesi aşağıdadır. Önceki 519 görsele dokunulmadı; onlar CSS düzeltmesinden önceki koşumların kanıtıdır. Yeni kanıt yalnız etkilenen yüzeyleri ölçer.

Kullanıcı bu turda CTA CSS/test kapsamını ve yayın hazırlığını onayladı. `app/kao.css` iki kardeş düğme varken birincili güvenli alan dahil 60 px yukarı taşır; `tests/kao/test_k3p_progress.js` kaynak sözleşmesini kontrol eder. Yeni CSS SHA-256: `14fb1a321f481b60a5e53dd68538a0dc252f7b3fdbb67d091de54d97ed7ac485`.

Yedi özet koşumu (320/390/460 × iki tema ve 390 açık +34 px safe-area): screenshot ve TARGET.json hashleri eşleşti; her birinde CTA ölçümü görünür, hedef ≥44px, odaklanabilir, kontrol örtüşmesi 0, tekrar ölçümü farkı 0 px. Her koşumda başlangıç/orta/son scroll konumunda CTA başka kontrolle çakışmadı veya örtülmedi. Ayrı 320 açık `budget` koşumu sentetik `partEnd` plan öğesini gerçek renderer ile gösterir; iki düğme çakışmadı. Bu tek budget koşumu altı kombinasyonun tamamının kanıtı değildir.

Özet başlangıç/orta kaydırma konumunda bazı içerikler yapışkan eylemin altında ölçüldü; bu örneklerde en alta kaydırıldığında CTA altında içerik kaydı 0 oldu. Tüm içerik, her yazı boyutu ve gerçek cihaz için erişilebilirlik kabulü bu dar örneklerle kanıtlanmadı. Budget ölçümünde kapalı `details` içeriği dedektör tarafından örtüşme olarak kaydedildi; bu alanın ekran görüntüsünde kapalı olduğu görülüyor. Sonuç NOT_MEASURED sınırını bütünüyle kaldırmaz.

Guard 1 fixture 10/10 çekimden önce PASS; `cdp.mjs` loopback dışını engeller, geçici profiller kullanıldı, sunucu açılmadı, port 9000 dinleyicisi ve profile artığı yok. Gerçek veri, forceSync veya kullanıcı profili kullanılmadı.

Tekrar üretim: `target-run.mjs` veya `budget-run.mjs` yalnız **yeni, boş çıktı dizinine** çalıştırılır; script mevcut çıktı dizinindeki png/webp dosyalarını siler. Argümanları `<repo-kökü> <yeni-boş-çıktı> <benzersiz-profil> <genişlik> <light|dark> <inset>`. `KAO_QA_CHROME` yerel Chrome for Testing yürütülebilir dosyasına ayarlanır. Kayıtlı `TARGET.json` ve `log.txt` orijinal çekim sonuçlarıdır; script daha sonra kanıt dizinine referansları göreli olacak şekilde kopyalandı.

Testler: guard 10/10, `test_k3p_progress.js` 9, lesson moment, focus lock, KAO2 accessibility 14, 756 kontrast çifti, güvenli driver ve zikr 95/95 PASS. CSS gzip 15.936/16 KiB. Performansın ilk ölçümü PASS (p95 4.524 ms; steady 3.074 ms); sonraki dört koşumda ham hatalar gözlendi: yoğun koşum p95 65.436 >40 ms, iki normal tekrar steady 7.760 ve 9.476 >5.087625 ms ve slow-host koşumunda p95 51.305 >40 ms. Hatalar silinmedi; makinede başka aktif Chrome/IDE süreçleri vardı; neden kesinleştirilmedi. Yayın kapısı için temiz ve geçerli yeni ölçüm gerekir.

`kapi.mjs --final --yavas` exit 1 BLOCKED; 11, 21, 29, 30 henüz done/değil, nextPrompt 31 değil. 29 bağımsız güncel diff denetimi tamamlanmadı; 30–33 uygulanmadı; commit, push, deploy yapılmadı. Cihaz, ekran okuyucu, L2 ve bilimsel etki ayrı dış kapılardır.

## Büyük metin ve kısa viewport — FAIL

Sentetik `budget` koşumunda 320×500, açık tema, `details` açık, ders kapsayıcısı font-size 32 px: ikincil düğme 96 px yüksekliğe çıktı ve birincil düğmeyi 44 px örttü. `budget-large-short/TARGET.json`, `log.txt` ve `budget.webp` durumu kaydeder. `budget-large-short-run.mjs` exit 1 döndü; bu olumsuz sonuç normal boyutlu 320×844 budget PASS ile değiştirilmemelidir. Bu doğrudan Chrome sentetik senaryo kanıtıdır, cihaz veya gerçek kullanıcı ayarı kanıtı değildir.

Bağımsız 2026-10-28 denetim sonucu **PARTIAL**: 60px kuralı dinamik yükseklikte güvence vermez; önceki 518 sahnenin mevcut CSS ile üretildiği hash bağlı değil; tek budget koşumu kaydırma kapsamı kanıtlamaz. Özet görüntülerinde metin başlangıç/orta konumlarda yapışkan CTA altında kalıyor; son konumda bu örneklerde 0. K3PD-29/11/21 kapanamaz. Bu kapsama dair fresh reviewer testleri: progress 9/9, manifest 214 ve guard 10/10 PASS.

## Son grid denemesi — bağımsız hüküm FAIL

İlk sabit ofset denemesinden sonra CSS iki eylemi yan yana iki grid sütununa taşıyacak şekilde değiştirildi; güncel CSS SHA-256 `925ce813b7823116ac85c783475db4ef2593843fc8c82b2b14604fa7abb96309`. `grid/` içinde 7 özet (320/390/460 × açık/koyu, 390 açık +34 inset), 320×844 budget ve 320×500 / 32px / details açık budget vardır. İlk örneklerde düğmeler arasında ölçülen çakışma 0; ancak özetlerde başlangıç/orta kaydırmada içerik örtülür. Büyük/kısa budget görüntüsünde eylemler 172 px yükseklikle metnin büyük bölümünü örter. **FAIL:** bu görünüm ve içerik erişimi kabul edilmemiştir.

Bağımsız denetçi hedef koşumlarda kritik ölçüm hatası buldu: screenshot sonrası tema yeniden sabitlenince büyük yazı ve açık details DOM durumu sıfırlanıyor. Büyük/kısa örnekte ilk ölçüm `height=172`, `scrollHeight=749`; scroll örneklerinde `height=74`, `scrollHeight=500` ve her `scrollTop=0`. Bu yüzden büyük metin durumunda kaydırma başarısı kanıtlanmadı; 7 px delta da aynı durumu karşılaştırmıyor. Normal 320×844 budget örneğinde de kaydırma mesafesi 0. Geçerli kabul için aynı font, details durumu ve gerçek kaydırma korunarak iki düğme, hit-test ve içerik erişimi ayrı sınanmalı.

Denetçi ayrıca `grid/light-320/l25-summary.webp` ve önceki açık tema görüntüsünde kelime kutularını boş/beyaz, koyu temada ise yazılı gördü. Bu grid kaynaklı olduğu kanıtlanmadı; açık tema metin/zemin computed renkleri ve DOM metni henüz ölçülmedi. Açık bulgu olarak kalır.

Yeni grid sürümünde `test_k3p_progress.js` 9/9; normal `test_kao2_perf_budget.js` exit 0, CSS 15.952/16 KiB, p95 12.302 ms, steady 3.280 ms. Önceki dört performans FAIL tarihsel ham ölçüm olarak yukarıda durur. CSS string testi davranış kanıtı değildir. Bağımsız inceleme FAIL; K3PD-29/11/21 halen kapanmadı ve genel final kapısı çalıştırılabilir duruma gelmedi.

## Açık tema özet metni — FAIL

Gerçek DOM/computed probe, dört Arapça kelimenin metninin DOM'da mevcut ve görünür olarak işaretli olduğunu, fakat her birinde metin ve kutu zemininin aynı `rgb(247, 245, 238)` olduğunu ölçtü. Dolayısıyla bu dört metin görünmüyor (1:1 renk eşitliği). `grid/color-light-320/COLOR-PROBE.txt`, `TARGET.json`, `l25-summary.webp` ve tekrar üretim betiği kanıttır. Kaynak: `.kao-moment` etiket rengini değiştirir, `.kao-lesson-apply-word` açık yüzeyi kullanır (`app/kao.css`). Sentetik veridir. Düzeltme henüz yapılmadı.
