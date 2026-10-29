# K3PD-29 · 2026-10-28 · Ders eylem alanı ve kontrast düzeltmesi

**Durum: bağımsız final kabulü BEKLİYOR.** Bu dosya uygulayıcının dar kapsamlı yerel kanıtıdır; 518 eski sahnenin güncel üretimle yeniden çekildiği iddiası değildir. Önceki kanıtlar olduğu gibi korunur.

- `quranLearnViews.js`: ders içeriği kendi kaydırılan alanına alındı; eylemler aynı `main` içinde bu alandan ayrı grid satırında tutulur. Tek eylem tam satır, iki eylem ayrı sütun kullanır.
- `kao.css`: kaydırma alanı ve eylem satırı; ders özeti kelime kutularında metin rengi kendi zeminine uygun `--quran-ink`. İçerik doğal yüksekliğiyle kaydırılır.
- `quranLearn.js`: `kaoPatchOverlay`, aynı ekran yeniden çiziminde iç kaydırmayı korur; aşama değişiminde sıfırlar. `test_k3p_mount.js` iki davranışı gerçek mount yolu üzerinden sentetik DOM ile doğrular.
- `shoot-modal.mjs`: CTA ↔ içerik çakışması, öğenin kırpıcı ataları dikkate alınarak hesaplanır. Sonraki v2 araç sürümü görünür örtüşmeyi üretim bulgusu olarak kaydeder; `focusReachable` Tab kanıtı değildir.

## Doğrudan yerel tarayıcı ölçümü

Yedi özet örneği: 320/390/460 × açık/koyu ve 390 açık +34 px sentetik safe-area. Her `TARGET.json` ekran görüntüsü SHA'sı ile çekilen CSS, views ve motor SHA'larını taşır. Her örnekte üç gerçek iç scroll konumu, iki düğmenin merkez hit-test'i ve iç scroll kutusunun eylem kutusundan ayrılması ölçüldü. Tekrar render öncesi/sonrası scroll eşit; CTA iki ölçüm farkı 0 px. Açık kelime metni kontrastı en az **13.11:1**, koyu **14.32:1**. `budget-short`: 320×500, sentetik 32 px metin, açık details; gerçek scroll 0/125/249, iki düğme hit-test ve içerik kutusu ayrımı geçti; aynı state yeniden kurulduktan sonra CTA delta 0. Bu yöntem gerçek cihaz/ekran okuyucu veya klavye Tab testi değildir.

`apply-gild`: 320×500, gerçek sentetik ders akışında apply aşaması, ses kapalı ve animasyon açık. `App.kaoLesson('gild')` çağrısı sonrası altı yaldız adımında iç scroll **1874→1874** korundu. `negative-proof`: CTA'yı sentetik olarak görünür içerik üzerine taşıyan negatif kontrol, **iki örtüşme** yakaladı; kırpılmış ekran dışı içerik 0 ölçüldü. Olumsuz durumların araç tarafından otomatik üretim-bulgusu sayılması ayrıca tamamlanmalıdır.

Kanıtlar yalnız sentetik veridir. Guard 1 10/10 PASS; tek origin `127.0.0.1:9000`, dış ağ CDP ile kesilir, geçici profil kullanılır, gerçek profil/token/force-sync yok. Sunucu açılmadı. Yeniden üretim betikleri `proof.mjs`, `proof-budget.mjs`, `negative-proof.mjs`, `apply-proof.mjs` yalnız **yeni boş** çıktı klasörüne çalıştırılır; var olan klasördeki görüntüleri siler. Args: `<repo> <boş-çıktı> <benzersiz-profil> <genişlik> <light|dark> <inset>`; `KAO_QA_CHROME` Chrome for Testing yoludur.

Testler: mount, progress, lesson flow, focus lock, budget, resume, manifest fixture, Guard 1, kontrol aracı; en son normal performans runtime **137.702/137.75 KiB**, CSS **15.896/16 KiB**, p95 **5.355 ms**, steady **3.039 ms**. Önceki başarısız performans koşumları ve ara görsel hatalar silinmedi. Çok küçük bütçe payı ve ayrı dosya kapsamı gözetilmelidir.

Açık: kapsamlı klavye Tab yolu, v2 görsellerin kaynak hashine makineyle bağlanması, bağımsız güncel tam kabul, 11/21 geç görsel kabulü, 30–33, pin ve yayın. Cihaz, ekran okuyucu, L2 ve gerçek öğrenme etkisi ayrı dış kapıdır. Sonraki [v2 genel koşum kaydı](../v2-20261028/README.md) bu notun tarihsel genel araç sınırlamasını günceller.


## Ders matrisi ve klavye kontrolü

Güncel üretimle tek `u01.03` dersinin beş aşamasında yedi koşumda 8'er sahne: 56 screenshot, 56 ölçüm/log ve hash. `lesson-matrix/*/LESSONS.json` sıfır ölçüm hatası, sıfır görünür içerik/CTA bulgusu ve sahne başına CTA delta ≤8 kaydeder. Bu matris practice, feedback, onboarding, mastery veya read aşamalarını yeniden çekmez; bütün eski görsellerin güncel kaynakla aynı olduğunu kanıtlamaz. Kaynak SHA'ları ve screenshot hashleri dosyalarda taşınır.

`keyboard/TARGET.json`: 320 açık summary sahnesinde gerçek CDP `Input.dispatchKeyEvent` Tab olayları, çıkış düğmesinden sırayla birincil ve ikincil düğmeye ulaştı. Bu tek headless klavye senaryosudur; cihaz veya ekran okuyucu kabulü değildir. `cdp-key.mjs` CDP helperının kanıt klasörüne alınmış test kopyasıdır; gerçek profil ve token kullanılmaz.

`apply-gild` ilk kanıtı eski kırpmasız probe kullandığı için CTA örtüşme kabulü değildir. `apply-gild-v2` aynı gerçek akışın güncel kırpma probuyla tekrarını saklar; altı yaldız adımında scroll 1874 korunmuş, görüntü/CTA bulgusu ayrıca v2 kaydında ölçülmüştür. İlk kayıt silinmedi.

## Alıştırma ve harf kurma kontrolü

390 açık tema ve 34 px safe-area koşumunda alıştırma CTA'sının açıklama metniyle 17 px örtüştüğü gözlendi; ham başarısız koşum `practice-inset-once-fail/LESSONS.json` içindedir. Seçenek alanının yüksekliği sınırlandırılıp kendi içinde kaydırılır hâle getirildi. Sonrasında iki tema × 320/390/460 ve açık 390 +34 inset için `practice-*/LESSONS.json` dosyalarında her koşumda 34 gerçek alıştırma/geri bildirim sahnesi, 0 ölçüm hatası ve 0 görünür CTA/içerik bulgusu kaydedildi. Bu sınırlı matris `overlapCovered` için başarısız olur; daha sonra genel çekim aracının v2 sürümüne de aynı bulgu sınıflaması eklendi.

`build-*` örnekleri gerçek build görevinde seçilen iki harfin tek RTL düğümünde gösterildiğini ve K3P fontunun yüklendiğini yedi kombinasyonda kaydeder. `build-tab-320-500/TAB_TRACE.json`, 320×500 açık temada gerçek Tab olaylarıyla iki etkin seçeneğe ulaşılırken seçim alanının kaydığını gösterir. Bu tek sentetik görevdir; bütün görevleri veya fiziksel cihazları temsil etmez.

Bu bölümdeki 245 görüntünün hashleri ve CSS hashleri kontrol edildi; CSS SHA-256 `2aedad0ef327b1d47f2b3b600bf64ef60f054706fd239f10998fc608cea997d7`. Bu çekimlerden sonra motor değiştiğinden motor hashleri güncel değildir. Yukarıdaki ders matrisi ve önceki özet çekimleri de daha eski CSS hashine bağlıdır; son CSS değişikliği alıştırma seçenekleri kuralındadır, ancak bu durum önceki görüntüleri güncel hashli kanıta dönüştürmez.

Bağımsız incelemenin odak uyarısı gerçek bir build görevinde, şık sırası sentetik olarak zor duruma getirilerek tekrarlandı: `build-focus-before/FOCUS.json` seçilen harf sonrası odaklanan şıkkı y=743–852, kırpıcı kutuyu y=267–442 ölçer; **görünmez odak FAIL**. Motorun odak verirken kaydırmayı engellemesi kaldırılınca `build-focus-after/FOCUS.json` odak y=332–441 ve kutu y=267–442, iç scroll 411 ölçer. Bu tek 320×500 senaryodur. Ham betiğin `BUILD PASS` satırı yalnız RTL/font/harf koşullarına aittir; eski koşumda odak kabulü değildir. Son motor SHA-256 `19927d2f4567543be01dcc741a88c055a554600dd9453b937f8ad1a6371f9ae9`.

İkinci bağımsız inceleme `build-focus-after` kaydında odak halkasının alt kenarının kırpıldığını buldu. Altı piksel padding ve scroll-padding sonrası `build-focus-ring/` örneğinde düğme altı 435.30, kırpıcı altı 441.59 px; görsel halka tamdır. Önceki focus kanıtındaki `selected` listesi iki aday içerir, fiilen yalnız ilk aday seçilmişti; yeni `build-focus-ring/BUILD.json` tek seçimi doğru yazar.

Güncel uygulama hashleriyle `practice-current-*` yedi koşumda 238 alıştırma/feedback görüntüsü, `build-current-*` yedi build görüntüsü üretildi ve 245/245 görüntü ile üç kaynak hash eşleşmesi kontrol edildi. CSS `a09b6880a6a55f6811326b62f8f65a71a084435e12376d22bd37a246516d846b`; views `9d2dceed0ab0172275ab2e781957e8bfe5539bc0d197f8af0f3a5bde7b9e3f49`; motor `19927d2f4567543be01dcc741a88c055a554600dd9453b937f8ad1a6371f9ae9`. Practice probe ilk şık ve dış scroll'u ölçer; bütün şıkların her iç scroll konumunda erişimini kanıtlamaz. Onboarding/cloze ve tüm cihazlar bu matriste yoktur.

## Build ve cloze için ek geometri

`build-visit-*` ve `cloze-visit-*` ikişer tema × 320/390/460 ve açık 390/+34 inset olmak üzere toplam 14 sentetik koşumdur. Her birinde gerçek görev, ilk şık CTA'sının yeniden çizim öncesi/sonrası geometrisi, görüntü ve kaynak hashleri kayıtlıdır. CTA delta 0, görünür örtüşme 0; `VISITS.json` kayıtlarında 63 etkin düğme `focus()` çağrısı sonrasında kendi kaydırma alanı ve gövde içinde görünür ve merkez hit-test'i başarılıdır. Bu yöntem gerçek Tab dizisi değildir; bütün olası görevleri ve cihazları temsil etmez.

İlk cloze denemesinde kapalı native details içindeki metin tarayıcının dikdörtgeni nedeniyle yanlışlıkla örtüşme sayıldı (`cloze-old-probe-fail/`). Ölçüm aracı kapalı details'in içeriğini artık ayırır; `cloze-detail-negative/DETAIL_PROBE.json` yapay olarak örtüştürülen açık metni yakalar, aynı kapalı metni saymaz. İlk 14 koşumun üçü yoğun paralel yük altında uygulama başlangıcında `ReferenceError: App is not defined` ile exit 1 verdi; aynı kombinasyonlar farklı boş profillerle tekrarlandığında exit 0 oldu. Başarısızlıklar ürün PASS olarak sayılmaz.

Bağımsız inceleme ilk `*-visit-*` betiklerindeki CTA probe'un genel araçla birebir aynı olmadığını buldu. Sonraki `build-exact-*` ve `cloze-exact-*` koşumları, `shoot-modal.mjs` içindeki probe'u birebir alır; her koşum genel probe hashini ve `VISITS.json` hashini taşır. 14 koşumun 63 ziyareti ve görüntü/kaynak/probe hashleri doğrulandı. `cloze-detail-exact/` aynı genel probe ile açık/kapalı negatif kontroldür.

Ek deney `cloze-open-repeat-fail/OPEN_REPEAT.json`: açık details sonrası `App.setTheme` aynı tema ile çağrılınca details kapandı; bu farklı durumlarda CTA y=389→350 ölçüldü. Açık durumun aynı durumda yeniden çizim kararlılığı bu deneyle kanıtlanmadı; durum kapanması incelenmektedir. İlk genel v2 518 görüntüsü kapalı-details probe düzeltmesinden önce çekildi ve cloze sahnesi içermiyordu.

Sonraki düzeltme aynı cloze görevi ve aynı ekranın tam overlay yeniden çiziminde açık okunuşu ve summary odağını korur; farklı göreve veya cloze dışına taşımaz. `cloze-500-son/OPEN_REPEAT.json` açık durum ve odak korunmasını, scroll 40→40 ve aynı durumda CTA delta 0'ı kaydeder. Normal cevap yolundaki `paintTask()` ayrı olup bu kapsamda korunma iddia edilmez.

320×500 açık cloze deneyinde 30 px cognate örtüşmesi; ardından 320×400 build'de sınırlandırılmış seçenek alanında beş düğmenin kırpılması bulundu (`cloze-500-once-fail/`, `build-400-once-fail/`). 600 px ve daha kısa ekranlarda eylem alanı doğal sayfa kaydırmasına alınarak tekrar ölçüldü: `cloze-500-son/` örtüşme 0, `build-400-son/VISITS.json` beş etkin düğmede odak/görünürlük/hit başarılı. Bu iki örnek güncel CSS `2c3700e036f8033c585034b82aff9943684ca537c8416803805f41d48cd45614` ve motor `79aad74a710e8bc96f60dd527caff20db913b83b73a1fd6e539db6e457c0359c` hashlerini taşır. Yukarıdaki önceki ekranlar bu son iki dosya değişikliği öncesine aittir. Kısa ekranda sabit CTA yerine doğal kaydırma kullanılır; 844 px sözleşmesi ayrı ölçülmüştür.
# Yöntem sınırı · 2026-10-28

Bu dizindeki önceki tarayıcı betikleri çekim sırasında boş sentetik profilde `data.settings.ghToken` alanını boolean kontrolü için okudu. Gerçek profil veya gerçek token kullanılmadı ve alan değeri loglanmadı; buna rağmen alanın okunması G4'ün token alanlarını okumama kuralına uymaz. Bu kayıtlar ham ürün gözlemi olarak korunur, tek başlarına G4 uyumlu kabul kanıtı sayılmaz. Kaydedilmiş eski betikler yeniden çalıştırılmamalıdır. Ana çekim aracındaki alan okuması kaldırıldı; bunun kontrolü yeni fixture'a eklendi. Bu açıklama sonraki koşumların sonuçlarını peşinen kabul etmez.

