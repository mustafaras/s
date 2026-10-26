# K3PD — Bağımsız denetim sonrası sıralı düzeltme promptları

Tarih: 2026-10-21 · Plan sürümü: 1 · Durum: ACTIVE · K3PD-00…13 iş kayıtları canlı state’tedir.

Bu belge, K3P 37 kart denetimindeki F-01…F-14 bulgularını ve kanıt açıklarını kapsayan **34 dar kapsamlı prompt** içerir. Eski K3P programını yeniden açmaz. Eşi [DENETLEYICI.md](DENETLEYICI.md), kabul/karar/kanıt ve bağımsız denetim sözleşmesidir. Bu iki dosyanın oluşturulması kod düzeltmesi, yeni şema, yeni hedef veya yayın yetkisi değildir.

## 1. Kullanım ve tek hedef

1. Önce DENETLEYICI §1–§4’ü oku. Uygulama isteği yoksa hiçbir kartı yürütme.
2. Kullanıcı bir kartı açıkça seçer: örneğin “K3PD-00’ı uygula”. O oturumun tek hedefi o karttır. “Sonraki” önce canlı ardıl state ile çözülür; eski K3P senkronunun nextPrompt=null olması beklenir.
3. Her prompt başlangıç/bitiş işaretleri arasında bütündür; başındaki ortak sözleşme ve DENETLEYICI zorunlu bağlamdır. Yeni oturuma yalnız başlığı değil, kart metnini ve iki dosyanın yollarını ver.
4. Bir kartın PASS’i sonraki kartı, şema değişikliğini veya yayını otomatik yetkilendirmez. Karar kartları gerçek yanıt gelmeden bitmez. 02→03, 04→05/06 ve 24→25 bağımlılıkları kesin kapıdır.
5. Uygulayıcı minimal çözüm+negatif test+kanıt hazırlar. Bağımsız denetleyici kabul vermeden done/commit kapanışı yapılmaz. Bir kart tek mantıksal commit; sonraki kart aynı oturumda otomatik başlamaz.
6. Bu planın kapsamı tartışmalı yeni ürün tasarımı veya geniş refactor değildir. Yeni app/core/content modülü, migrate(), App handler yüzeyi, bütçe tavanı veya Arapça/okunuş içeriği değişikliği ayrıca somut kapsam kararı ister.

## 2. Denetim tabanı ve değişmezler

Denetlenen tarihsel taban main / d030610f7613fc2c4aaafc36297a34b0ffb9c3ec; yerel origin/main aynıydı. Eski state completed, nextPrompt=null, releaseApproval=APPROVED-2026-10-18, pin=20261018a, pinDeferral boş. Güncel oturum bunları yeniden okur; bu değerler sabitlenmiş yeni yetki değildir.

Başlangıçta kirli KAPANIS.md, README.md ve izlenmeyen kanit/sonraki/GORSEL-KANIT.md vardı. Korunacak içerik hashleri DENETLEYICI §2’de. Bunları temizleme, sahiplenme, yeni programa dahil edip commit etme.

- App.kao* tam 45; yeni handler yok. Mevcut action çoğaltıcıları kullanılır.
- migrate(), sync.js ve kişisel veri yazısı kapsam dışı. İşlevsel data kullanımını bütünsel yasak sayma; cards/due/reps/şema değişikliği yalnız kartın açık sözleşmesi kadar olabilir.
- Kalıcı yeni alan yalnız alan bazlı açık karar;02 dışında şema kararı verilmiş sayılmaz. Eski s21 sayacı düzeltilmiş tarihsel veri değildir.
- Runtime tavan 136 KiB, CSS16 KiB, içerik 256 KiB; eski 4 modül 176 KiB/müfredat 48 KiB, font 150 KiB alt tavanları korunur. GzipL6 veL9 ayrı yazılır. Tavanı kod/testi geçsin diye artırma.
- Varsayılan test ortamı ağsız sentetik Node/VM’dir. Gerçektoken/hesap/storage ve seyma-data okunmaz/yazılmaz. Yalnız 29 açıkça verildiğinde kontrollü yeni görselQA; yalnız 33 aday-onayından sonra yayın/ağGET.
- Tarihsel onaylar yalnız kendi yayınlarına aittir. Bu ardıl program LOCAL_ONLY başlar; releaseApproval=NOT_APPROVED.
- Eski program kayıtları geçmişi korur; yeni durum/kanıtlar bu klasöre aittir. Yeni branch k3pd-denetim-duzeltmeleri; main’de üretim yazımı yok.01 kurulmadan pinli üretim dosyası değiştirilemez.

## 3. Her karta uygulanan çalışma sözleşmesi

### Açılış

Jev gate’i kullanıcı isteğinin tam metniyle çalıştır; yok/hatalıysa talimat uyarınca sessiz atla. RootAGENTS/CLAUDE, bu ortak sözleşme, DENETLEYICI, canlı yeni state/durum ve yeni kayıtların son 3 kaydı okunur. Kart 00 öncesi yeni kontrol dosyalarının **henüz mevcut olmaması normaldir**. 00 sonrası araclar/durum.mjs --check/--sonraki gerçek sırayı doğrular.

GitHEAD/branch/status ve allowlist’i kaydet. Her kirli yolu kart işi/önceden var olan/belirsiz olarak sınıflandır. Öncedenvarolan iş korunur; kartla çakışan sahiplik belirsizse o dosyaya yazma. Yalnız kartın Oku alanını, ilgili işlevleri rg+dararalıkla ve test kaynaklarını incele. Satır numarası değişebilir; işlevadı asıl locator’dır.

### Uygulama

Önce denetimdeki kusuru gerçek handler/render yoluyla kırmızı yapan sınama. Sonra en küçük düzeltme. Yalnız fonksiyonadı/yorum/kaynakregex varlığını davranış kanıtı sayma. Test, doğrulamak istediği çıktıyı aynı üretimyardımcısından yeniden hesaplayıp kendini onaylamasın. Kaynaktest haklıysa eşiği gevşetme; gerçekten yanlışsa gerekçeli sözleşme kararıyla düzelt.

Her kartın allowlist’ine yalnız yeni state/durum/kayıt ve kendi kanıt klasörü otomatik eklenir. Yeni fixture gerekirse o kartın açık yeni-test kapsamı ve tests/kao/README envanteri gerekir. Kardeş fixture’ları dosya bağımlılığına göre seç; sharedFlow/Views/quranLearn değişikliği için G1 ve ilgili G2 yavaş testleri zorunludur. Pinli dosya değiştiğinde yalnız gerçek exactpath yeni state pinDeferral listesine eklenir; pin değeri 32’ye kadar değişmez.

### Kapanış

Komut/env/exit/süre, ölçülen kohort/payda, kırmızı→yeşil kanıtı ve eksik kontrol kaydedilir. PASS, EVIDENCE_PENDING, ACCEPTED_DEVIATION, BLOCKED ve NOT_MEASURED ayrılır. 11 ve 21’in kaynak işi 29’dan önce geçici source_ready olabilir; bu, birleşik glif/görsel veya geometri kabulünü tamamlamaz. done yalnız gerekli kanıtları ve bağımsız kabulü tamamlanmış kart içindir; yalnız 11/21 için bağlı geç kabul varsa bu ilişki state’te görünür kalır ve sonraki bağımlı kart yalnız o alt kabulün gerektirdiği aşamada açılır.

Uygulayıcı önce ready_for_audit olur; denetleyici salt okunur inceler. Kabul sonrası state/kayıtlar aynı mantıksalcommit içinde kapanır; denetim sonrasında kapanış metadata’sı hariç kod değişirse kabul yenilenir. Hash kendine referans vermesin: tabanHEAD ve diff hash kaydedilir; commit sonradan gitlog’dan çözülür. Commit/push için önceden kirli yolları stage etme; exactpath kullan. Varsayılan push/merge/tag/deploy yok.

### Durma ve devir

Gerekli karar/araç/girdi/allowlist yoksa, bütçe veya şema genişlemesi gerekiyorsa, yanlış test/başarısızgate varsa adıyla dur. İmkânsız hedefi ölçüm oynayarak geçirme. Karşılanmayan alt kabulü açık tut; kontrolsüz gelecek kartı yürütme. Yarım kalırsa yeni GUNCEL-DURUM/KAYIT’a ne yapıldı, exactpaths, son komut/exit, kalan iş ve güvenlik sınırını yaz. Başlatılan sunucuyu kapat.

## 4. Test kısaltmaları

Bütün komutlar repo kökünden çalışır. `K(x)` = `node tests/kao/test_k3p_x.js`; `V(x)` = `node tests/kao/test_kao2_x.js`; `T(x)` = `node tests/kao/test_kao_x.js`. `migration×2` = T(migration)+V(migration). G0–G6 grupları DENETLEYICI §4’te **tam komutlarla** tanımlıdır. Yeni araçlar 00/28/32’de yazılmadan çalıştırılamaz; belgede komut bulunması onların bugün mevcut olduğu iddiası değildir.

### Dosya kısa adları ve gelecekteki kanıt yolları

Kartlarda aşağıdaki kısa adlar, tam olarak bu repo yollarını belirtir; dosya adı benzerliğine göre başka dosya seçilmez:

| Kısa ad | Repo köküne göre tam yol |
| --- | --- |
| quranLearn.js / runtime | app/core/quranLearn.js |
| quranLearnFlow.js / Flow | app/core/quranLearnFlow.js |
| quranLearnViews.js / Views | app/core/quranLearnViews.js |
| kao.css | app/kao.css |
| cift-sik.cjs / akis-olc.cjs / dokunus-olc.cjs / deney-rapor.cjs / okunus-denetim.cjs | kao3-premium/araclar/ altında aynı dosya adı |
| test_k3p_x.js / test_kao2_x.js / test_kao_x.js | tests/kao/ altında aynı dosya adı |
| test_asset_pin_freshness.js / test_iip_22.js / test_local_visual_qa_guard.js | tests/app/ altında aynı dosya adı |
| yeni state / durum / kayıt / karar belgeleri | Bu klasörde DURUM.json / GUNCEL-DURUM.md / KAYIT.md; karar nesnesi DURUM.decisions ve append-only KAYIT içindedir |
| yeni kart kanıtı | Bu klasörde kanit/K3PD-NN/; yalnız seçili kartın exact ID’si |

Diğer alias bulunursa yazmadan önce gerçek yolu açılış allowlist’ine kesin olarak yaz. “Gerektiği kadar”, “ilgili fixture” gibi ifadeler yeni serbest dosya alanı açmaz: yalnız aynı kartta adı geçen mevcut fixture’lar ve tabloda çözülen yollar kapsam içindedir. Yeni bir testin adı karta açıkça yazılmamışsa mevcut fixture’ı genişlet; yeni yol gerçekten gerekliyse somut kapsam güncellemesi olmadan yaratma.

## 5. Sıra ve tekil hedefler

| Sıra | Prompt | Tek hedef |
| --- | --- | --- |
| 00 | K3PD-00 | Ardıl programı ve kanıt tabanını kur |
| 01 | K3PD-01 | Pin ertelemesini yalnız ardıl program dalına bağla |
| 02 | K3PD-02 | H4 ölçümünü ve mevcut kalıcı alanın sınırını karara bağla |
| 03 | K3PD-03 | H4 sayacını cevap öncesi koşula göre düzelt |
| 04 | K3PD-04 | Zaman bütçesinin imkânsız durumunu karara bağla |
| 05 | K3PD-05 | Süre tahminini ve kişisel medyanı dürüst hesapla |
| 06 | K3PD-06 | Planı gerçek tahmin bütçesine sığdır ve resume’u koru |
| 07 | K3PD-07 | Sıkılma kolunda sekiz sonuç sınırını ve gerçek okunuş gizlemeyi uygula |
| 08 | K3PD-08 | Yeniden tanışma paneline doğrulanmış örnek ekle |
| 09 | K3PD-09 | Kolaylaştırılmış görev ve notlamayı gerçek görev üzerinden doğrula |
| 10 | K3PD-10 | Harf kurma görevine anlaşılır ve doğrulanmış hedef ipucu ekle |
| 11 | K3PD-11 | Seçilen harfleri birleşik yaz ve erişilebilir adları doğrula |
| 12 | K3PD-12 | Cloze seçeneklerini aynı tür ve farklı kökte tut |
| 13 | K3PD-13 | Yavaş doğru şeridinde gerçek duraklatma yap |
| 14 | K3PD-14 | Yaldızlama sesini ayar ve sessiz saatle sınırla |
| 15 | K3PD-15 | Ders zirvesinde ses–kelime senkronunu ve iptali düzelt |
| 16 | K3PD-16 | Okuyucunun gerçek kelime vurgusunu ve tekli indeksini düzelt |
| 17 | K3PD-17 | Sürükleme iptalini cevaptan ayır |
| 18 | K3PD-18 | Tezhip modelini gerçekten saf yap |
| 19 | K3PD-19 | Tanış ve kavramda öğretim çekirdeğini görünür bırak |
| 20 | K3PD-20 | Hedef ekranının 25 sözcük sınırını bütün derslerde koru |
| 21 | K3PD-21 | Birincil eylem bölgesini geometrik olarak sabitle |
| 22 | K3PD-22 | Açılıştan ilk göreve girişi iki dokunuşa indir |
| 23 | K3PD-23 | Otomatik açık dersin gerçek dokunuşunu 40 veya altına indir |
| 24 | K3PD-24 | Tanıma oranının pay/paydasını ve hedefini karara bağla |
| 25 | K3PD-25 | Onaylı tanıma hedefini uygula ve bütün oranları kapıya bağla |
| 26 | K3PD-26 | Deney raporunda dönemleri, vekilleri ve geçersiz geçmişi ayır |
| 27 | K3PD-27 | Donmuş içerik ve fontun teknik kanıt açığını kapat |
| 28 | K3PD-28 | Ölçü ve regresyon kapısını başarısızlıkta kapalı kur |
| 29 | K3PD-29 | Gerçek iki tema, geometri ve zor glif görsel QA yap |
| 30 | K3PD-30 | Belgeleri ve 37 kartın kabul matrisini güncel kanıtla eşitle |
| 31 | K3PD-31 | Yayınsız bağımsız final denetimini tamamla |
| 32 | K3PD-32 | Koordineli pinli yayın adayını hazırla ve son onayı iste |
| 33 | K3PD-33 | Yalnız açık onaylı adayı yayınla ve teslim kanıtını ayır |

Özel önkoşullar:02 kararı→03;04 kararı→05→06;14→15;15→16;19→20→21→22→23;24 kararı→25;27+28+29+30→31;31→32;32+ayrıaday-yayınonayı→33. Diğer kartlar tablodaki sırayla yürür.11 ve 21’in görsel alt kabulü 29’da tamamlanır. Bağımsız kaynak denetimi sonrası 11 source_ready→12 ve 21 source_ready→22 geçişleri yalnız bu iki kart için kontrollü istisnadır. Her ikisinin final done durumu 29 kanıtına bağlıdır.

## 6. Uygulayıcı promptları

<!-- PROMPT K3PD-00 -->
## K3PD-00 — Ardıl programı ve kanıt tabanını kur

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** Tüm bulgular; eski programın tamamlanmış olması yeni yetki değildir.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** Bu iki belge; ../K3P-STATE.json; ../.anti-amnesia/CURRENT-STATE.md; eski ledger son 3 kayıt; root AGENTS.md ve CLAUDE.md; tests/README.md.

**Yazma allowlist’i:** Bu klasördeki mevcut PROMPTLAR.md ve DENETLEYICI.md dosyalarının ilk kez izlenmesi; normatif kapsam bu kartta değiştirilmez. Bu klasörde yeni DURUM.json, GUNCEL-DURUM.md, KAYIT.md, araclar/durum.mjs; yeni tests/kao/test_k3pd_control.js ve tests/kao/README.md. Eski K3P state/ledger ve üretim dosyaları yasak.

**Uygula:**

Canlı Git durumunu, HEAD ve yerel origin/main farkını kaydet. Önceden kirli üç belgeyi içerik hashleriyle dış kapsam olarak kaydet; temizleme/stash/commit etme. Başka üretim kirliği varsa sahipliği belirlenmeden ilerleme. Denetim tabanı d030610f tarihsel bir locator; HEAD değişmişse ilgili bulguları yeniden üret, eski sayıları yeni ölçüm diye taşıma.
Üretime dokunmadan yeni k3pd-denetim-duzeltmeleri dalını kur veya mevcutsa kimliğini doğrula; dirty belgelerin içeriğini değiştirme. DENETLEYICI §3 şemasına göre 34 kartlık ardıl state, güncel durum ve append-only kayıt dosyalarını oluştur. Eski K3P 37/37 ve releaseApproval kaydını dondur.
Durum aracına --check, --sonraki, --liste, --prompt ID ekle; eksik/tekrarlı ID, sıra/nextPrompt sapması ve eksik karar kaydında kapalı kal. --sonraki kullanıcı yetkisi üretmez. Yeni aracın gerçek CLI sözleşmesini bu belgede belirtilen arayüzle eşleştir; eski senkronu K3PD kimlikleriyle çağırma.

**Ölçülebilir kabul:** 34 tekil ID ve prompt işareti aynı sırada; bütün kartlar başlangıçta todo; yalnız 00 aktif olabilir. Eski 37 kart ve üç kirli belgenin hashleri aynı. Kontrol testi bozuk state/ID/sıra/izinli dal örneklerinde kırmızı; doğru durumda yeşil.

**Doğrulama:** Yeni kontrol fixture’ı; node araclar/durum.mjs --check (bu klasörden değil repo kökünden tam yolla); eski node kao3-premium/araclar/senkron.mjs --sonraki; git diff --check.

**Hard stop:** Bu kartın açık uygulanma talebi yoksa yalnız planı oku. Var olan farklı bir dalı silme veya yeniden adlandırma; main üzerinde üretim değişikliği yapma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-00: Ardıl programı ve kanıt tabanını kur`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-01. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-00 -->

<!-- PROMPT K3PD-01 -->
## K3PD-01 — Pin ertelemesini yalnız ardıl program dalına bağla

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** Program altyapısı; main üzerinde tazelik testi tam katı kalmalı.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** 00 makbuzu; tests/app/test_asset_pin_freshness.js; eski K3P pin sözleşmesi; index.html ve sw.js sürüm bağlantıları.

**Yazma allowlist’i:** Yalnız `tests/app/test_asset_pin_freshness.js`; `tests/kao/test_k3pd_control.js`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/PROMPTLAR.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-01/EVIDENCE.md`. Pin değerleri ve eski kao3-premium/K3P-STATE.json yasak.

**Uygula:**

Yeni state’in pinDeferral alanını okuyacak dar bir adaptör kur. İstisna ancak gerçek branch tam k3pd-denetim-duzeltmeleri ise, program aktifse, dosya açık listede ise ve kapanış kartı K3PD-32 ise geçerli olsun. main veya başka dalda hiçbir K3PD ertelemesi kabul edilmesin. Eksik/bozuk state, wildcard, klasör/genel kapsam, geçmişte kapanmış program ve sahte branch değerleri istisna açmasın.
Eski K3P davranışını geriye uyumlu koru. Varlık listesine ekleme, ilgili sonraki üretim kartının görevidir; şimdiden tüm app/ dizinini erteleme. Gerçek Git dalını test için checkout ederek değiştirme; saf ayrıştırıcı/karar fonksiyonlarını sentetik girdilerle sına.

**Ölçülebilir kabul:** Dal×program durumu×exact-path negatif matrisi geçer; main daima katıdır. Pinler bayt-eş; state listesi başlangıçta boş. ERTELENDİ sayısı ile tam taze sayısı ayrı basılır; erteleme yayın PASS’i sayılmaz.

**Doğrulama:** node tests/app/test_asset_pin_freshness.js; node tests/kao/test_k3pd_control.js; eski pin sözleşmesi fixture’ları; G0.

**Hard stop:** Yalnız testi yeşile çevirmek için branch kontrolünü gevşetme. Eski bitmiş program state’ine yeni borç yazma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-01: Pin ertelemesini yalnız ardıl program dalına bağla`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-02. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-01 -->

<!-- PROMPT K3PD-02 -->
## K3PD-02 — H4 ölçümünü ve mevcut kalıcı alanın sınırını karara bağla

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-01, F-13; özgün K3P-19/P4/H4.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** quranLearn.js: kaoAnswer, isDurable, kaoArabicPairHTML; deney-rapor.cjs: project/h4; eski ledger seq 53; K3P şema durma kuralı.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/PROMPTLAR.md` yalnızca bu K3PD-02 allowlist satırını parser uyumlu exact path listesine çevirmek için. Başka prompt metni değişemez. Yeni dosya, üretim, test beklentisi ve kişisel veri değişikliği yasak.

**Uygula:**

Karar için somut sözleşme hazırla: uygunluk görev gösterilirken dondurulmuş kart durumu ve gerçek okunuş sunumundan türetilir; cevap sonrası s kullanılmaz. Okunuş açıldıysa “gizli destek” kohortuna dahil edilmez. Folded/shown/disabled ve build/cloze türlerini ayrı tanımla; Latin ipucunun ARIA üzerinden bulunmasını da açıkla. Yeniden çizim, undo ve aynı cevap tekrarının etkisini tanımla.
Mevcut daily.calib.s21={n, ok} alanının K3P-19’da eklenmiş olduğunu, eski yanlış sayaçların sonradan güvenilir biçimde onarılamayacağını yaz. Önerilen dar yol: mevcut alan kümesini koru, açılma bilgisini yalnız ui içinde izle, eski günleri raporda LEGACY_INVALID say ve yeni geçerli kohortu düzeltme yayını sonrasındaki ilk tam UTC günden başlat. Aynı gün eski/yeni sayaçları karıştırma, geçmişi sıfırlama. Yeni ölçüm sürümü/alanı istenirse tam şema ve migrasyon farkını ayrıca göster.
Kullanıcıya kararın seçeneklerini, veri etkisini ve önerilen seçeneği sun; gerçek yanıtı kaydet. Planın yazılması bu karara onay değildir.

**Ölçülebilir kabul:** H4’e hangi görevin ve hangi cevabın gireceği örnekli, eski veri sınırı ve cutoff kesin. Var olmayan kullanıcı onayı uydurulmaz. Karar yoksa kart awaiting_owner_decision kalır; 03 başlamaz.

**Doğrulama:** Belge sözleşme kontrolü; state karar referansı/gerçek yanıt izi; üretim ve eski kayıt diff’i 0.

**Hard stop:** Yeni kalıcı alan veya geçmiş sayaç temizliği için açık, o alana özgü karar yoksa uygulama yapma. L2/cihaz kabulünü bu karara bağlama.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-02: H4 ölçümünü ve mevcut kalıcı alanın sınırını karara bağla`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-03. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-02 -->

<!-- PROMPT K3PD-03 -->
## K3PD-03 — H4 sayacını cevap öncesi koşula göre düzelt

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-01, F-13; K3P-19.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** 02 onaylı kararı; kaoAnswer/feedback/undo; native details yaşam döngüsü; deney raporu H4.

**Yazma allowlist’i:** Yalnız şu exact paths: `app/core/quranLearn.js`; `tests/kao/test_k3p_pronunciation_fold.js`; `tests/kao/test_k3p_deney_rapor.js`; `tests/kao/README.md`; `kao3-premium/araclar/deney-rapor.cjs`; `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu allowlist satırını durum.mjs parserıyla uyumlu exact paths olarak düzeltmek için); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-03/EVIDENCE.md`.

**Uygula:**

Önce s=20/21/40 × doğru/yanlış için kırmızı test yaz. Görev başındaki uygunluğu bir kez al; planlanan yardımcı veya sonraki UI’nin haliyle yeniden hesaplama. Varsayılan kapalı details açılışını yalnız ui sunum kaydıyla izle; mevcut App.kao* yüzeyine handler ekleme. Aynı görev iki kez sayılmasın, undo hem n hem ok’u eski haline getirsin.
Önceki s=21 ve s=40 yanlış cevaplarının scheduled.s<21 olsa bile uygun kohortta n’yi artırdığını göster. Karar dışındaki alan yaratma; eski sayaçları düzenleme. Folded kontrolünü sadece s sayısına indirgeme: orphan, readerUnknown ve destek açılması gibi gerçek isDurable/sunum şartlarını koru.

**Ölçülebilir kabul:** Bütün sınır matrisi ve undo/idempotence geçer; okunmuş destek kohortu onaylı kurala uyar; eski not/FSRS sonuçları sunum ayarından bağımsız. Şema farkı 02 ile birebir sınırlı; App.kao*=45.

**Doğrulama:** K(pronunciation_fold), K(deney_rapor), T(requirements), T(fsrs), migration×2; G0+G1.

**Hard stop:** Legacy veriyi yeni sonuç gibi kullanma; sözleşme için ilave veri alanı gerekirse 02 kararını somut farkla yeniden aç.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-03: H4 sayacını cevap öncesi koşula göre düzelt`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-04. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-03 -->

<!-- PROMPT K3PD-04 -->
## K3PD-04 — Zaman bütçesinin imkânsız durumunu karara bağla

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-02; K3P-A4/K-O.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** Flow: measuredPerTaskMs/taskBudget/lessonPlan/estimateMinutes; kaoLatency; resume; K3P-A3/A4 kabulü.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/PROMPTLAR.md` yalnızca bu K3PD-04 allowlist satırını exact-path uyumlu yapmak için.

**Uygula:**

13 çekirdek görev ×30/60 sn ile 5 dk’nın birlikte sağlanamadığını somut göster. “Dersin tüm özü aynı oturumda kalsın” ile “her oturum seçilen süreye sığsın” çatışmasını örtme. Önerilen seçenek: dersi mevcut resume ile bütçeye sığan parçalara ayır; içerik, hedef ve kavram ders boyunca korunur; tamamlanmamış parçaya bitiş/ustalık ödülü verilmez. Alternatif tam ders sürdürme seçeneğinde süre hedefinin karşılanmadığını açıkça göster; ikisini aynı PASS altında toplama.
Medyanın yalnız oturum içi son 50 geçerli yanıt örneğinden alınmasını; 6 sn tabanı, ölçümsüz varsayılanı ve eski günlük ortalamanın yalnız açık etiketli yedek olmasını tanımla. “≤5 dk” tahmin bütçesidir; insanın gerçek bitirme süresine garanti vermez. Isınma önceliği ile en düşük R seçiminin sırasını ve minimum tek görev bile sığmıyorsa dürüst davranışı kararlaştır.
UI taslağı, resume verisine etkisi ve hedef/kavramın hangi parçada görüleceğini kullanıcıya somut sun. Yeni kalıcı alan gerektirmeyen yolu öner; başka şema değişikliği ayrı karar ister.

**Ölçülebilir kabul:** Kişisel süre kaynağı, tüm görevlerin maliyeti, ısınma/R önceliği, durma ve resume kuralları ölçülebilir. Karar verilmezse 05/06 başlamaz.

**Doğrulama:** Örnek bütçe tabloları 5/10/15 dk ×6/30/60 sn; belge denetimi; üretim diff’i 0.

**Hard stop:** Sayıyı tavana kırpmak veya görevleri ölçümden çıkarmak çözüm değildir. Kullanıcı yanıtı olmadan sözleşmeyi değiştirme.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-04: Zaman bütçesinin imkânsız durumunu karara bağla`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-05. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-04 -->

<!-- PROMPT K3PD-05 -->
## K3PD-05 — Süre tahminini ve kişisel medyanı dürüst hesapla

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-02; K3P-03/15/A4.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** 04 kararı; Flow estimateMinutes; kaoLatencyMedian/Push; feedback kolları; test_kao2_next_step.js ve test_k3p_budget.js.

**Yazma allowlist’i:** `app/core/quranLearnFlow.js`; `app/core/quranLearn.js` (yalnız süre girdisi/latency bağlama noktaları); `tests/kao/test_kao2_next_step.js`; `tests/kao/test_k3p_budget.js`; `tests/kao/test_k3p_feedback_arms.js`; `tests/kao/test_kao_requirements.js`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-05/EVIDENCE.md`; `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-05 allowlist satırını exact-path uyumlu yapmak için).

**Uygula:**

Önce 13×30 sn=7 dk ve 13×60 sn=13 dk tahminini cap=5 verilse de maskelemeyen test yaz. Flow saf kalsın; UI’den gelen isteğe bağlı ölçüm girdisini doğrulanmış parametreyle al, DOM/timer/storage okuma. Tüm yanıt örneklerinin eklenme noktasını tekilleştir; cevap tekrarında çift örnek alma. Mevcut API’leri geriye uyumlu tut.
0, NaN, negatif süre, boş pencere, >50 örnek ve doğru/yanlış karışımında medyanı bağımsız hesapla. Eksik geçmişte mevcut güvenli varsayılanı ve K3P-03’ün ≥6 sn tabanını koru. Tahmin fonksiyonu bütçe politikası uygulamasın; gerçek planı ölçsün. 06 tamamlanana kadar planın sınırı aşması dürüstçe kırmızı kalabilir.

**Ölçülebilir kabul:** 24 görev hiçbir geçerli varsayılanda <3 dk görünmez; medyan örneğin uç değerlerine dayanır; 7 ve 13 dk 5 diye yazılmaz. Kaynak yalnız ui, kalıcı alan yok; feedback sınıflaması değişirse normatif son 50 yanıt kuralı kanıtlanır.

**Doğrulama:** V(next_step), K(budget), K(feedback_arms), T(requirements); G0+G1.

**Hard stop:** 06 henüz yapılmadı diye tahmin testini gevşetme; ara durumda kalan bütçe başarısızlığını açık kayıtla taşı.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-05: Süre tahminini ve kişisel medyanı dürüst hesapla`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-06. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-05 -->

<!-- PROMPT K3PD-06 -->
## K3PD-06 — Planı gerçek tahmin bütçesine sığdır ve resume’u koru

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-02; K3P-A4.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** 04/05 makbuzları; lessonPlan/mixBlocks/nextStep; lesson resume/start/finish; mastery/repair ayrı yolları.

**Yazma allowlist’i:** Yalnız şu exact paths: `app/core/quranLearnFlow.js`; `app/core/quranLearn.js` (yalnız plan/resume ve mevcut onboarding dakika ayarını bağlama); `tests/kao/test_k3p_budget.js`; `tests/kao/test_k3p_rhythm.js`; `tests/kao/test_k3p_resume.js`; `tests/kao/test_kao2_lesson_flow.js`; `tests/kao/test_kao2_next_step.js`; `tests/kao/test_kao2_view_resolution.js`; `tests/kao/test_kao2_mastery.js`; `tests/kao/test_kao2_grammar_tasks.js`; `tests/kao/test_kao_requirements.js`; `tests/kao/test_k3p_mount.js`; `tests/kao/test_k3p_focus_lock.js`; `tests/kao/test_kao2_denetim.js`; `tests/kao/test_kao2_kabul.js`; `tests/kao/test_k3p_lesson_ayah.js`; `tests/kao/test_k3p_dda.js`; `tests/kao/test_k3p_feedback_copy.js`; `tests/kao/test_k3p_progress.js`; `tests/kao/test_kao2_components.js`; `tests/kao/test_kao2_curriculum.js`; `tests/app/test_app_surface_boot_boundary.js`; `tests/app/test_app_surface_domain_boundary.js`; `tests/app/test_app_surface_lifecycle_boundary.js`; `tests/app/test_app_surface_overlay_boundary.js`; `tests/app/test_header_celestial_timeline.js`; `tests/app/test_header_night_contrast.js`; `tests/app/test_iip_09.js`; `tests/app/test_v3_welcome.js`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-06/EVIDENCE.md`; `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-06 allowlist satırı).

**Uygula:**

Bütçe testi estimateMinutes(..., cap) sonucunu değil gerçek seçilmiş görevlerin bağımsız maliyet toplamını sınasın. Isınma ve çekirdek dahil bütün sunulan işlerin maliyetini hesaba kat; 04 kararına göre parçala veya kararın dürüst istisnasını açık göster. En düşük R’ye göre seçim önceliğini ve ısınma istisnasını ayrı kanıtla; “yarısı sıralı” toleransı kullanma.
Plana alınmayan kartların due/reps/s ve ilerlemesine yazılmadığını plan ÖNCESİ snapshot ile karşılaştır; ertesi gün vadeli kaldıklarını doğrula. Parça sonunda resume aynı çözülmemiş işe döner; yanlış tekrarları, yeniden tanışma ve çok harfli görevler sessiz atlanmaz. Tamamlanmamış ders doneAt/ustalık/kazanım üretmesin; eski kayıtlar idempotent kalsın.

**Ölçülebilir kabul:** 5/10/15 dk × yeni/yerleşik/borçlu kullanıcı ×6/30/60 sn matrisi 04 sözleşmesini sağlar. Bugün metni, plan maliyeti ve gerçek görev sayısı tutarlı. Resume, mastery ve repair gerilemesi yok.

**Doğrulama:** K(budget), K(rhythm), K(resume), V(lesson_flow), V(lesson_coherence), V(next_step), V(mastery), T(queue); G0+G1+G2 yavaş.

**Hard stop:** Zaman hedefine ulaşmak için FSRS vadesini değiştirme, cevabı otomatik verme veya öğretim görevini kanıtsız silme.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-06: Planı gerçek tahmin bütçesine sığdır ve resume’u koru`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-07. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-06 -->

<!-- PROMPT K3PD-07 -->
## K3PD-07 — Sıkılma kolunda sekiz sonuç sınırını ve gerçek okunuş gizlemeyi uygula

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-03; K3P-A5.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kaoFlowRate/BoredomHideHarakat, ArabicPairHTML ve currentTask; test_k3p_dda.js; K3P-19 katlama sözleşmesi.

**Yazma allowlist’i:** `app/core/quranLearn.js`; `tests/kao/test_k3p_dda.js`; `tests/kao/test_k3p_pronunciation_fold.js` yalnız yeni davranışsal sunum sınaması için; `tests/kao/test_kao_pronunciation_contract.js` yalnız gerçek yeni sunum sözleşmesi gerekçesiyle; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/PROMPTLAR.md` yalnız bu kartın allowlist satırını exact yollara eşlemek için; `kao3-premium/duzeltme-plani/kanit/K3PD-07/EVIDENCE.md`.

**Uygula:**

0–7 sonuçta p=1 olsa da sıkılma kolu açılmasın; sekizinci sonuçla p>.92 olduğunda açılsın. p=.92 ve pencere boş sınırlarını ayrı sına. Sadece harekeyi soldurmakla yetinme: bu kol için Latin okunuş ilk görünümde gizli/katlı olmalı; settings.translit=false ise DOM’da hiç olmamalı. Hedef Arapça/okunuş eşliğinin kaynak bütünlüğünü bozma.
DOM/HTML davranışını gerçekten sınayan test yaz; kaynakta fonksiyon adı aramayı kabul kanıtı sayma. Gizli metnin görünür şık cevabını veya ARIA’dan destek sızıntısını değerlendirme sözleşmesine göre ele al; 03 H4 sunum takibiyle aynı yardımcıyı kullan. Sıkılma durumu kalıcı değil ui içindedir.

**Ölçülebilir kabul:** 0,1,7,8 sonuç ve .92 sınırı; görünür, katlı, ayar-kapalı Latin; eski s20/s21 davranışı geçer. Şık sayısı uygun MC görevinde 4’e döner, build/cloze uygunluğu bozulmaz.

**Doğrulama:** K(dda), K(pronunciation_fold), T(pronunciation_contract), T(requirements); G0+G1.

**Hard stop:** Genel okunuş sözleşmesini davranış kanıtı olmadan gevşetme; görünür HTML ile erişilebilir adı ayrı raporla.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-07: Sıkılma kolunda sekiz sonuç sınırını ve gerçek okunuş gizlemeyi uygula`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-08. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-07 -->

<!-- PROMPT K3PD-08 -->
## K3PD-08 — Yeniden tanışma paneline doğrulanmış örnek ekle

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-03; K3P-A5.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kaoReintro, kaoIntroExample, feedback reintro sunumu; verified örnek üretim biçimi; test_k3p_dda.js.

**Yazma allowlist’i:** Yalnız şu exact paths: `app/core/quranLearn.js`; `tests/kao/test_k3p_dda.js`; `tests/kao/test_k3p_feedback_copy.js`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-08/EVIDENCE.md`; `kao3-premium/duzeltme-plani/PROMPTLAR.md` yalnız bu K3PD-08 allowlist satırı.

**Uygula:**

Üç ardışık yanlışta panelde anlam + gerçek doğrulanmış örnek + izinli ses desteği bulunmasını sağlayan kırmızı test yaz. “ri.ar && ri.meaning” ifadesini örnek kanıtı sayma. Örnek Arapça/okunuş/Türkçe/künye alanlarının yetkili içerikten geldiğini doğrula; elle içerik yazma.
Örneği olmayan veya doğrulanmamış lemmada uydurma metin üretme; anlam/sesle dürüst yedek göster ve eksik örnek sayısını raporla. Yeni modal/handler ekleme. İki yanlışta erken panel çıkmasın; doğru cevap streak’i sıfırlasın; undo paneli ve sayacı doğru geri getirsin. 14’te düzeltilecek ses izni yardımcılarını dolaşan yeni oynatma yolu kurma.

**Ölçülebilir kabul:** 2/3 yanlış sınırı, doğrulanmış/eksik/bozuk örnek, ses kapalı/sessiz saat, undo matrisi geçer. Örnek gerçekten görünür ve erişilebilir; veri şeması aynı.

**Doğrulama:** K(dda), K(feedback_copy), T(pronunciation_contract), V(a 11 y); G0+G1.

**Hard stop:** Yeni Arapça/okunuş yazmak ya da içerik onay seviyesini yükseltmek kapsam dışı.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-08: Yeniden tanışma paneline doğrulanmış örnek ekle`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-09. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-08 -->

<!-- PROMPT K3PD-09 -->
## K3PD-09 — Kolaylaştırılmış görev ve notlamayı gerçek görev üzerinden doğrula

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-03 test boşluğu; K3P-A5.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kaoChoiceCap/InjectEasy/currentTask/kaoGrade/kaoAnswer; window ve wrongStreak; test_k3p_dda.js.

**Yazma allowlist’i:** `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-09 satırı); `app/core/quranLearn.js` (yalnız uyarlama/grade/queue); `tests/kao/test_k3p_dda.js`; `tests/kao/test_k3p_ladder.js`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-09/EVIDENCE.md`.

**Uygula:**

İki yanlış sonrası normal çoktan seçmeli görevin 3 seçenekli olması ile araya giren kolay kartın 2 seçenekli olmasını ayır; <=3 tek iddiasıyla geçme. Yardımlı olarak gerçekten sunulan bir sorunun doğru notu 2 olmalı; daha sonraki window/streak değişimi bu etiketi kaybettirmesin. Normal görevde FSRS grade mapping aynı kalsın.
Ekleme ui kuyruğunda tekilleşsin; aynı kolay kart tekrar tekrar şişmesin; çıkış/yeniden başlatma eski yardımcı kuyruğunu taşımamalı. Harf üretimi gibi “şık sayısı” aynı anlama gelmeyen görev türüne dört-seçenek varsayımını uygulama. Önce davranışı ölç; zaten doğru alt yolları gereksiz yeniden yazma.

**Ölçülebilir kabul:** Gerçek handler zincirinde normal3/yardım 2 ayrımı, grade 2 ve normalgrade, stale cache, undo, tekrar başlatma geçer; cards/fsrs/şema değişmez.

**Doğrulama:** K(dda), K(ladder), T(fsrs), T(queue), K(resume); G0+G1.

**Hard stop:** FSRS parametreleri veya merdiven/A–B hash’ini değiştirerek sunum kusurunu giderme.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-09: Kolaylaştırılmış görev ve notlamayı gerçek görev üzerinden doğrula`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-10. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-09 -->

<!-- PROMPT K3PD-10 -->
## K3PD-10 — Harf kurma görevine anlaşılır ve doğrulanmış hedef ipucu ekle

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-04; K3P-17.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kaoBuildLetters, kaoTaskHTML ve sözlük verified alanları; test_k3p_build.js; diğer ar>tr/tr>ar görevleri.

**Yazma allowlist’i:** `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-10 satırı); `app/core/quranLearn.js`; `tests/kao/test_k3p_build.js`; `tests/kao/test_k3p_ladder.js`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-10/EVIDENCE.md`.

**Uygula:**

Öğrenci answer nesnesini görmeden hangi kelimeyi kuracağını anlayabilsin. Önerilen ipucu doğrulanmış Türkçe anlamdır; hedef yazımı ve harekesiz cevap ilk görünümde sızmasın. Ses ipucu varsa mevcut ses ayarlarıyla yönetilsin, zorunlu dinleme olmasın. Görev yönü, cardId/isNew/retry/arm gibi gerekli bağlam alanları kaybolmasın.
Test, answer’dan doğru çip seçmekle yetinmesin: gerçek HTML’de hedef ipucunun varlığını, çeldiricilerden/cevaptan bağımsızlığını, boş anlamda güvenli yedek yolu ve B kolu değişmezliğini ölçsün. Prompt kopyasını sıcak/kısa tut; yeni handler yok.

**Ölçülebilir kabul:** Uygun 2–6 harfli görev, görünür/erişilebilir anlam ipucu; hedef yazımı cevap öncesi yok; eksik verified anlamda uydurma ipucu yok. Eski notlama ve kimlikler korunur.

**Doğrulama:** K(build), K(ladder), K(distractors), K(dda), T(pronunciation_contract); G0+G1.

**Hard stop:** Eksik sözlük anlamını elle üretme; o lemma için mevcut güvenli basamağa düş ve kapsam sayısını açık yaz.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-10: Harf kurma görevine anlaşılır ve doğrulanmış hedef ipucu ekle`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-11. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-10 -->

<!-- PROMPT K3PD-11 -->
## K3PD-11 — Seçilen harfleri birleşik yaz ve erişilebilir adları doğrula

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-04; K3P-17.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kaoOrderDraft/OrderLabels, selected-row HTML/CSS; QuranPhonicsV1 gerçek harf alanları; test_k3p_build.js.

**Yazma allowlist’i:** `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız K3PD-11 allowlist satırı); `app/core/quranLearn.js`; `app/kao.css`; `tests/kao/test_k3p_build.js`; `tests/kao/test_k3p_drag.js` (yalnız gerekirse); `tests/kao/test_kao2_perf_budget.js` (yalnız runtime gzip tavanını 136’dan 137 KiB’ye çıkar; 2026-10-20 kullanıcı onayı); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-11/EVIDENCE.md`.

**Uygula:**

Build ile kelime dizme görünümünü ayır. Seçilen harfleri tek RTL metin akışında birleştir; her harfi ayrı span/kutuya koyarak Arapça birleşimini bozma. Çipler ayrı kalabilir; oluşturulan sözcük önizlemesi tek birleşik dizgedir. Aynı harf iki kez gereken kelimeleri, birleşmeyen harfleri, ters sıra ve geri alma davranışını sına; sabit Latin fixture cevabına dayanma.
Çipin erişilebilir adını gerçek doğrulanmış harf-adı kaynağından al. Glif + mekanik transliterasyonu “harf adı” diye kabul etme; içerikte ad yoksa eksik kaynak kararı olarak bildir, yeni Arapça/okunuş uydurma. Klavyeyle seçim, odak, seçili durum ve sürükleme target semantiği korunsun.

**Ölçülebilir kabul:** Birleşik metin düğümü davranış testi ve 29’daki gerçek font/görsel kontrolüyle kanıtlanır; bu kanıt gelene kadar kart yalnız source_ready olabilir. Tekrar harfli kelime doğru cevaplanır; order türü gerilemez; her çipin doğrulanmış adı vardır veya eksik kapsam açık kalır.

**Doğrulama:** K(build), K(drag), V(a 11 y), T(pronunciation_contract); G0+G1; görsel kabul 29’a açık bağımlılık.

**Hard stop:** Harf-adı için onaylı kaynak eksikse bu alt kabulü PASS sayma; font/glif veya içerik modülünü elle düzeltme.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-11: Seçilen harfleri birleşik yaz ve erişilebilir adları doğrula`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-12. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-11 -->

<!-- PROMPT K3PD-12 -->
## K3PD-12 — Cloze seçeneklerini aynı tür ve farklı kökte tut

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-05; K3P-18.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kaoDistractorPool/UniqueDistractors/fill/kaoClozeExample; TASARIM §4 çelişkili yedek cümleleri; test_k3p_cloze.js.

**Yazma allowlist’i:** Yalnız şu exact paths: `app/core/quranLearn.js`; `tests/kao/test_k3p_cloze.js`; `tests/kao/test_k3p_ladder.js`; `tests/kao/test_k3p_build.js`; `tests/kao/test_k3p_distractors.js`; `tests/kao/test_kao2_mastery.js`; `tests/kao/test_kao2_kabul.js`; `tests/kao/test_k3p_dda.js`; `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-12 allowlist satırını exact paths olarak düzeltmek için); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-12/EVIDENCE.md`.

**Uygula:**

Sadece ilk örnek değil bütün uygun lemma×iki yön×birden çok tohumda cloze’u sına. Dört tekil şık, tek doğru, aynı POS, iki tarafta kök varsa farklı kök ve önceki çeldirici kısıtları birlikte sağlansın. Eksik kök karşılaştırmasını null===null hatasına dönüştürme; tür denetimini her durumda uygula.
Genel “herhangi bir lemma” yedeğini cloze’a taşırma. Dört uygun şık yoksa izinli yedek zincirini açık seç; mevcut TASARIM’da hem tek basamak hem “dört şık yoksa R2” cümlesi bulunduğunu saklama. Gerçek kullanıcı kararındaki yolu dar yorumla; çelişki çözülmüyorsa karar kaydı almadan yeni kural uydurma.
Ayet ve okunuşta aynı konum boşalsın; hedef birden çok kez geçiyorsa cevap sızıntısını denetle ve uygun değilse güvenli yedekle. Hedef sesi kapalı kalır; kurucu deterministik ve veri yazmaz.

**Ölçülebilir kabul:** Güncel taramada farklı-POS çeldirici 0; her cloze4/tekdoğru; uygunsuz/eksik türde cloze kurulmaz; çift şık 0. Kapsamın ve yedek oranının önce/sonra sayısı verilir.

**Doğrulama:** K(cloze), K(ladder), K(build), K(distractors), T(queue); cift-sik; G0+G1+G2 yavaş.

**Hard stop:** Seçenekleri doldurmak için POS/kök koşulunu gevşetme. Eski R4 kararını değiştirmek gerekiyorsa somut seçenekle kullanıcıya dön.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-12: Cloze seçeneklerini aynı tür ve farklı kökte tut`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-13. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-12 -->

<!-- PROMPT K3PD-13 -->
## K3PD-13 — Yavaş doğru şeridinde gerçek duraklatma yap

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-08; K3P-15.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kaoOpenFeedback/AutoAdvance/Continue, task HTML; test_k3p_feedback_arms.js; 05 latency sözleşmesi.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-13 allowlist satırını exact paths olarak düzeltmek için); `app/core/quranLearn.js`; `app/kao.css` (yalnız gerekirse); `tests/kao/test_k3p_feedback_arms.js`; `tests/kao/test_k3p_feedback_copy.js`; `tests/kao/test_k3p_lesson_moment.js`; `tests/kao/test_kao2_perf_budget.js` (yalnız runtime gzip tavanını 137’den 137.25 KiB’ye çıkar; 2026-10-21 kullanıcı onayı); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-13/EVIDENCE.md`.

**Uygula:**

Yavaş doğruda şerit görünür ve 1600 ms timer kurulur. Şeride ilk dokunuş veya klavye aktivasyonu timer’ı iptal eder, aynı görevde kalır ve Devam’ı gösterir. İkinci bilinçli Devam ilerletir. autoAdvance=false durumunda ise tek Devam davranışı korunur; hızlı doğru 600 ms ve yanlış-manuel kolları değişmez.
Yeni App.kao* ekleme; mevcut kaoContinue çoğaltıcısı/argümanı veya KAO yüzeyindeki mevcut bağlama yolunu kullan. Erişilebilir gerçek düğme/rol ve odak davranışı ölç; timer iptali sonrası gecikmiş callback başka görevi atlamasın. Çift dokunuş ve modal kapatma yarışını sına.

**Ölçülebilir kabul:** İlk dokunuşta indeks aynı/timer iptal; ikinci dokunuşta tam bir ilerleme; stale callback 0 ek ilerleme. Üç kol, eski autoAdvance=false ve varsayılanlar korunur.

**Doğrulama:** K(feedback_arms), K(feedback_copy), K(rhythm), K(resume), V(settings), migration×2; G0+G1.

**Hard stop:** İlk dokunuşu “iptal edip aynı anda ilerletme” olarak yeniden tanımlama; normatif gereklilik budur.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-13: Yavaş doğru şeridinde gerçek duraklatma yap`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-14. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-13 -->

<!-- PROMPT K3PD-14 -->
## K3PD-14 — Yaldızlama sesini ayar ve sessiz saatle sınırla

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-06; K3P-13.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kaoAudioEnabled, kaoGild, kaoPlaySequence; isQuietTime bağımlılığının mevcut türü; lesson_ayah ve phonics/reader sessiz saat testleri.

**Yazma allowlist’i:** `app/core/quranLearn.js`; `tests/kao/test_k3p_lesson_ayah.js`; yalnız koruma testi gerekirse `tests/kao/test_kao_phonics_contract.js` ve `tests/kao/test_kao2_reader.js`; pinli yayını bu kartta tamamlamak için `../../index.html`, `../../sw.js` ve `tests/app/test_iip_22.js`; bu kartın exact kapsamını ve bir defalık yetki istisnasını belgelemek için `kao3-premium/duzeltme-plani/PROMPTLAR.md` ve `kao3-premium/duzeltme-plani/DENETLEYICI.md`; K3PD-14 kayıt/kanıt yolları `kao3-premium/duzeltme-plani/DURUM.json`, `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`, `kao3-premium/duzeltme-plani/KAYIT.md` ve `kao3-premium/duzeltme-plani/kanit/K3PD-14/EVIDENCE.md`.

**Uygula:**

Ayar açık/kapalı × sessiz saat açık/kapalı × reduced-motion açık/kapalı matrisinde createAudio ve play çağrılarını sayan kırmızı test yaz. Ses kapalı veya sessiz saatte hiçbir ses nesnesi/çalma başlamasın; yaldız uygun sessiz zamanlayıcı yolunda çalışsın. Reduced-motion sadece görsel hareketi etkilesin: ses izni varsa ses devam edebilsin.
Mevcut ortak ses izni yorumunu kullan; isQuietTime işlev/boolean farkında mevcut dependency sözleşmesini doğrula, yeni any-benzeri geniş tip veya gerçek saat bağımlılığı ekleme. Hata/no-audio durumunda okumayı engelleme. Önceki ses yolu ve K3P-21 iki düğme korunur.

**Ölçülebilir kabul:** Kapalı ayar/sessiz saatte createAudio=0, play=0; hareket azaltmada animasyon 0 ve izinli ses davranışı doğru. Uyarlanır yardım ve yeniden tanışma yeni bir kaçak ses yolu açmaz.

**Doğrulama:** K(lesson_ayah), K(audio_buttons), K(dda), T(phonics_contract), V(reader); G0+G1.

**Hard stop:** Ses iznini premiumAtmosphere veya görsel animasyon izniyle aynı koşul yapma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-14: Yaldızlama sesini ayar ve sessiz saatle sınırla`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**2026-10-21 kullanıcı istisnası:** Kullanıcının bu oturumdaki “canlıya al o zaman” ve “bunları çözmelisin gerekirse prompt dosyalarımı düzel benim boyle bi istegim yok” talimatları yalnız bu K3PD-14 adayı için ortak §1.5/§3.3 ve DENETLEYICI G6’daki varsayılan bağımsız denetim ile K3PD-32/33 sırasını açıkça kaldırır. Bağımsız denetim yapılmış gibi PASS yazma; kartı ancak tüm teknik kapılar geçerse `ACCEPTED_DEVIATION` ile kapat ve kullanıcı istisnasını KAYIT’a aynen bağla. Yayın makbuzunda gerçek aday SHA’sı, exact yollar, Pages run ve canlı hash eşliği bulunur. Bu istisna K3PD-15’i başlatmaz ve sonraki kart/yayınlara aktarılmaz.

**Sonraki aday:** K3PD-15. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-14 -->

<!-- PROMPT K3PD-15 -->
## K3PD-15 — Ders zirvesinde ses–kelime senkronunu ve iptali düzelt

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-06; K3P-13.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** 14 makbuzu; kaoGild/GildStep/PlaySequence; lesson çıkış/render/clearTimer; ders sonu an süre tokenları.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-15 allowlist satırını exact paths olarak düzeltmek için); `app/core/quranLearn.js`; `tests/kao/test_k3p_lesson_ayah.js`; `tests/kao/test_k3p_lesson_moment.js`; `tests/kao/test_k3p_mount.js`; `tests/kao/test_k3p_resume.js`; `app/kao.css` (yalnız gerekirse); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-15/EVIDENCE.md`.

**Uygula:**

Ses varsa kelime vurgusu gerçek klibin başlangıç/bitiş olaylarıyla ilerlesin; hiç ended gelmeden tüm 9 kelimeyi timer’la yaldızlayan sınama kırmızı olsun. Ses yoksa/kapalıysa ritmik yedek; reduced-motion’da statik görsel ve izinli ses. Ses dizisinin tamamını 1,2 sn’ye zorlamayı bırak:1,2 sn dekoratif an bütçesiyle doğal kayıt süresini ayrı sözleşme olarak açıkla; doğal sesi hızlandırma/kesme.
Çıkış, başka ders, yeniden yaldızla, audio error ve eski Promise/ended callback’inde tek aktif oturum tokenı ve kaynak temizliği kullan. Eski ses/timer yeni ekranı değiştirmesin, iki ses üst üste binmesin. Klipsi olmayan fallback kelimelerini yanlış indeksle eşleme; sesle eşleştirilemeyen satırda dürüst sessiz yedek uygula.

**Ölçülebilir kabul:** Kontrollü sahte audio olaylarıyla ilk kelime/sonraki/son/error/exit/restart senkron; ses devam ederken highlight önden bitmez; timer ve listener sızıntısı 0. Statik reduced-motion ve mount kimliği korunur.

**Doğrulama:** K(lesson_ayah), K(lesson_moment), K(mount), K(resume), T(requirements); G0+G1.

**Hard stop:** Ses sürelerini sabit 1200 ms varsayma. Mevcut arşivdeki kayıt dosyalarını değiştirme veya yeni kayıt üretme.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-15: Ders zirvesinde ses–kelime senkronunu ve iptali düzelt`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-16. Bu bilgi sonraki karta uygulama izni değildir.

**2026-10-22 yürütme notu (K3PD-15):** Kart kullanıcı talebiyle uygulandı ve `ready_for_audit`/`NOT_MEASURED` durumunda. Bu kart için allowlist satırı K3PD-12/13 emsaliyle exact paths biçimine getirildi (kapsam genişletilmedi). Bağımsız denetim yapılmadı; PASS yazılmadı. Kanıt `kanit/K3PD-15/EVIDENCE.md`.
<!-- /PROMPT K3PD-15 -->

<!-- PROMPT K3PD-16 -->
## K3PD-16 — Okuyucunun gerçek kelime vurgusunu ve tekli indeksini düzelt

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-07; K3P-23.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kaoReaderPlayWords/Reader/ReaderHTML; kaoReaderPlaying ve focus restore; test_k3p_23.js ve test_kao2_reader.js.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-16 allowlist satırını exact paths olarak düzeltmek için); `app/core/quranLearn.js`; `tests/kao/test_k3p_23.js`; `tests/kao/test_kao2_reader.js`; `app/kao.css` (yalnız gerekirse); `tests/kao/test_kao2_perf_budget.js` (yalnız runtime gzip tavanını 137.25’ten 137.5 KiB’ye çıkar; 2026-10-22 kullanıcı onayı); `tests/kao/test_kao2_mastery.js` (yalnız aynı L9 tavanını 137.5 KiB’ye eşitle); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-16/EVIDENCE.md`.

**Uygula:**

Sonraki klipte model indeksi değil gerçekten çizilen aria-current/altın halka değişsin. Sahte deps.render ile her audio olayından sonra gerçek HTML’i yakala; testin kendisi manuel render çağırarak kusuru örtmesin. Tek kelime 3 seçilmişse playing=3 olsun, alt dizinin 0’ı değil. Son klip bittiğinde ve hata/çıkışta vurgu temizlensin.
Kelime kaydırması, açık anlam balonu, klavye odağı ve overlay kimliğini koru. 15’teki iptal/tek-oturum ilkesini tekrar kopyalamadan ortak sınır içinde kullan; yeni App handler yok. “Kartlarıma ekle”nin verified/idempotent davranışını değiştirme.

**Ölçülebilir kabul:** 0→1 gerçek DOM/HTML vurgu değişimi, tekli 3→3, son/error/exit temizliği; eski callback sonraki okuyucuya dokunmaz; aynı anda tek ses. Kart ekleme ve quiet-time testleri geçer.

**Doğrulama:** K(23), V(reader), K(mount), V(a 11 y), migration×2; G0+G1.

**Hard stop:** Yalnız CSS seçicisi veya ui alanının değişmesi senkron kanıtı değildir.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-16: Okuyucunun gerçek kelime vurgusunu ve tekli indeksini düzelt`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-17. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-16 -->

<!-- PROMPT K3PD-17 -->
## K3PD-17 — Sürükleme iptalini cevaptan ayır

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-10; K3P-20.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kaoDrag release/end ve pointercancel; mevcut onclick seçimi; test_k3p_drag.js; order/build notlaması.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-17 allowlist satırını exact paths olarak düzeltmek için); `app/core/quranLearn.js`; `tests/kao/test_k3p_drag.js`; `tests/kao/test_k3p_build.js` (yalnız gerekirse); `tests/kao/test_kao2_perf_budget.js` (yalnız runtime gzip tavanını 137.5’ten 137.625 KiB’ye çıkar; 2026-10-22 kullanıcı onayı); `tests/kao/test_kao2_mastery.js` (yalnız aynı L9 tavanını eşitle); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-17/EVIDENCE.md`.

**Uygula:**

Hedef içinde/dışında pointercancel, lost capture, çıkış ve hiç hareket yok durumlarında cevap 0 olsun. Yalnız geçerli pointerup hareket+alan şartıyla tam bir cevap üretsin. İptal ve bırakma listener’larını ayır; bütün cleanup yolları transform/sınıf/listener/capture durumunu temizlesin.
Başarılı drop sonrasında gelen native click’in ikinci cevap üretmesini sınayan olay dizisi ekle; bunu önlemek için normal tek dokunma ve klavyeyi iptal etme. Eksik/NaN koordinat ve geç callback güvenli başarısız olsun. Not/FSRS değişimi sadece tamamlanmış geçerli cevaba bağlı kalsın.

**Ölçülebilir kabul:** cancel 0, dışarı 0, hareketsiz 0, geçerli drop 1; drop+click 1; klavye/tap1. Reduced-motion aynı mantık; görev değişiminde eski pointer cevabı yok.

**Doğrulama:** K(drag), K(build), K(cloze), V(a 11 y), T(fsrs); G0+G1.

**Hard stop:** Bütün click olaylarını engelleyerek veya iptali “yanlış cevap” sayarak düzeltme yapma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-17: Sürükleme iptalini cevaptan ayır`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-18. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-17 -->

<!-- PROMPT K3PD-18 -->
## K3PD-18 — Tezhip modelini gerçekten saf yap

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-13; K3P-11.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kaoTezhipModel/KnownLemmaSet/Coverage/quranLearnRoot; ensureQuranLearn; test_k3p_tezhip.js.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-18 allowlist satırını exact paths olarak düzeltmek için); `app/core/quranLearn.js` (yalnız `kaoTezhipModel` okuma sınırı); `tests/kao/test_k3p_tezhip.js`; `tests/kao/test_kao2_progress.js` (yalnız gerekirse); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-18/EVIDENCE.md`.

**Uygula:**

Modelin içinde normalizasyon/persistence çağırma. undefined/null/boş quranLearn/eksik cards/normalize girdi ve deep-frozen girdi üzerinde model çağrısı yazma yapmadan güvenli sonuç versin. Mevcut normalize boot/migrate yolunun sahipliğini taşıma veya yeniden yazma.
Bilinen/öğreniliyor/yeni ayrımı, iki yönlü kalıcılık, orphan/readerUnknown dışlaması ve kapsamla aynı kelime kümesi korunsun. Model çıktısı girdinin değiştirilebilir nesnelerine referans sızdırmasın; çıktıyı değiştirmek girdiyi değiştirmesin. Kart veya ilerleme kazanımı model okumayla üretilmesin.

**Ölçülebilir kabul:** Öncesi/sonrası derin eşlik ve deep-freeze testi geçer; geçersiz sûre null; mevcut normalize veri çıktısı aynı; save çağrısı 0.

**Doğrulama:** K(tezhip), V(progress), K(today), migration×2; G0+G1.

**Hard stop:** migrate() veya genel ensure davranışını değiştirerek yerel model kusurunu çözme.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-18: Tezhip modelini gerçekten saf yap`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-19. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-18 -->

<!-- PROMPT K3PD-19 -->
## K3PD-19 — Tanış ve kavramda öğretim çekirdeğini görünür bırak

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-09; K3P-A3/A8.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** Views lessonScreen intro/concept/moreBlock; runtime örnek modeli; AKIS örnekten kurala; test_kao2_lesson_flow/a11y.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-19 allowlist satırını exact paths olarak düzeltmek için); `app/core/quranLearnViews.js`; `app/core/quranLearn.js` (yalnız model alanı bağlama); `app/kao.css` (yalnız gerekirse); `tests/kao/test_kao2_lesson_flow.js`; `tests/kao/test_kao2_a11y.js`; `tests/kao/test_k3p_rhythm.js`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-19/EVIDENCE.md`.

**Uygula:**

Tanış ilk görünümünde kelime, ses erişimi, anlam ve doğrulanmış tek örnek bulunsun; akraba/türev/uzun neden/terim ayrıntıları tek details altında kalsın. Kavramda örnek→kısa kural görülsün; yalnız başlık + Daha fazla kalmasın. İçerik cümlelerini yeniden yazma; mevcut onaylı kısa alanı kullan, yoksa örneği/kurala ait görünür alan kararını açık bırak.
İlk görünüm sayacını details gövdesini dışlayıp summary’yi içerecek şekilde gerçek HTML’e uygula; örnek, çeviri, künye ve yardımcı metni seçerek sayımdan kaçırma. 109 dersin intro/concept ekranlarını tara. Zorunlu öğretim içeriği 45’i aşıyorsa kelimeleri rastgele kesme; minimal katmanlama kararı hazırla ve hedef karşılanmadı de.

**Ölçülebilir kabul:** Her uygun tanışta bir görünür doğrulanmış örnek; kavramda görünür örnek/kural; ilk görünüm≤45; summary≥44 px, klavye ve odak korunur. Gerekli kaynak eksikleri sayı/ID ile yerel içerik dışlaması olarak raporlanır.

**Doğrulama:** V(lesson_flow), V(a 11 y), K(rhythm), T(pronunciation_contract); akis-olc; G0+G1+G2.

**Hard stop:** Testte sadece details içinde örnek arayarak ilk görünüm gerekliliğini karşılanmış sayma; Arapça/okunuş metnini elle kısaltma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-19: Tanış ve kavramda öğretim çekirdeğini görünür bırak`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-20. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-19 -->

<!-- PROMPT K3PD-20 -->
## K3PD-20 — Hedef ekranının 25 sözcük sınırını bütün derslerde koru

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-09; K3P-13 ve A8 regresyonu.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** Flow goal/apply ortak satırı; kaoAyahRow/RowHtml; Views goal; lesson_ayah WORD_EXEMPT/LEMMA_EXEMPT; akis-olc.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-20 allowlist satırını exact paths olarak düzeltmek için); `app/core/quranLearnFlow.js`; `app/core/quranLearn.js` (yalnız hedef satırı); `app/core/quranLearnViews.js`; `tests/kao/test_k3p_lesson_ayah.js`; `tests/kao/test_kao2_lesson_flow.js`; `tests/kao/test_kao2_a11y.js`; `kao3-premium/araclar/akis-olc.cjs` (yalnız gerekirse); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-20/EVIDENCE.md`.

**Uygula:**

İki ölçüyü ayrı tut: gerçek ilk görünüm toplam metni≤25 (başlık/yardım/summary dahil) ve âyet satırı kapsama/uzunluğu. Goal ve apply aynı doğrulanmış satırı paylaşmaya devam etsin. 109 ders için aynı öğrenci tohumu/dailyNew ile satır, hedef lemmalar, ilk görünüm sayısı ve istisna gerekçesini bas; 80/109 aşımı kapat.
Gerekli bağlamı/ar kelimeleri bozarak ya da aria-only gizleyerek sayıyı düşürme. Uzun planı 04’ün onaylı parçasıyla tutarlı hedef penceresine bağla. Mevcut 10 lemma istisnası yalnız küçülebilir; yeni sözcük istisnasını sessiz ekleme. Bütün hedefleri 25’e sığdırmak kaynak nedeniyle imkânsızsa ders+minimum uzunluk kanıtıyla ayrı kullanıcı kararı al; eski hedefin FAIL durumunu koru.

**Ölçülebilir kabul:** 109 goal ilk görünümünün tamamı≤25; intro/concept≤45 korunur; goal/apply satır eşliği ve gerekçeli lemma istisna listesi gerilemez. Kararla değişen bir hedef varsa ACCEPTED_DEVIATION olarak eski/yeni ayrı raporlanır.

**Doğrulama:** K(lesson_ayah), V(lesson_flow), K(rhythm), V(a 11 y); akis-olc; G0+G1+G2 yavaş.

**Hard stop:** 25’i yalnız Arapça satırına uygulayıp tam ekranı PASS sayma. Hedef gevşetmek otomatik yetki değildir.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-20: Hedef ekranının25 sözcük sınırını bütün derslerde koru`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-21. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-20 -->

<!-- PROMPT K3PD-21 -->
## K3PD-21 — Birincil eylem bölgesini geometrik olarak sabitle

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** A6 UNVERIFIABLE; F-11 kanıt açığı.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** kao.css lesson/task sticky; Views focus/progress/action bölümleri; test_k3p_progress.js; viewport ve safe-area sözleşmesi.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-21 allowlist satırını exact paths olarak düzeltmek için); `app/kao.css`; `app/core/quranLearnViews.js`; `app/core/quranLearn.js` (yalnız sınıf/model); `tests/kao/test_k3p_progress.js`; `tests/kao/test_kao2_a11y.js`; `tests/kao/test_k3p_motion_css.js`; `kao3-premium/araclar/eylem-geometri.cjs`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-21/EVIDENCE.md`.

**Uygula:**

Birincil eylemin hangi DOM öğesi olduğunu aşama bazında kesin tanımla: goal/intro/concept/normal MC/build/cloze/feedback/apply/summary. Boş aşamayı ölçümden atlama. 320/390/460px ve 844 px yükseklikte, safe-area 0 ve sentetik alt inset ile eylem bölgesini sabitle; aşağıdaki içeriği örtmesin. Uzun içerik yerel kaydırılsın, eylem odağa ulaşılabilir olsun.
Kaynakta position:sticky varlığını geometrik kanıt sayma. 29’daki çekim aracına bütün aşamalar için x/y/width/height, görünürlük ve farkı ölçme sözleşmesi ver. CSS tokenları ve hareket azaltma korunsun; genel app/shell tasarımı bu kartın dışındadır.

**Ölçülebilir kabul:** Kaynak/erişilebilirlik kapıları geçer; 29’da doğrulanacak ardışık y-farkı≤8 px, görünürlük ve örtüşmeme ölçüsü tanımlıdır. Gerçek ölçüm gelene kadar geometri alt kabulü EVIDENCE_PENDING; tamamlandı iddiası yok.

**Doğrulama:** K(progress), V(a 11 y), K(motion_css), V(design_contract); G0+G1; nihai geometri kanıtı 29.

**Hard stop:** 29 kanıtı olmadan ≤8 px PASS yazma. Mutlak pixel konumunu cihaz kabulü diye sunma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-21: Birincil eylem bölgesini geometrik olarak sabitle`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-22. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-21 -->

<!-- PROMPT K3PD-22 -->
## K3PD-22 — Açılıştan ilk göreve girişi iki dokunuşa indir

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-09; K3P-A3/program hedefi 3→2.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** akis-olc giriş sayımı; kaoOpen/HomeHero/Start/Lesson; hedef gösterimi; onboarding/resume/mastery route’ları.

**Yazma allowlist’i:** Yalnız şu exact paths: `app/core/quranLearn.js`; `app/core/quranLearnViews.js`; `kao3-premium/araclar/akis-olc.cjs`; `tests/kao/test_k3p_today.js`; `tests/kao/test_kao2_navigation.js`; `tests/kao/test_k3p_resume.js`; `tests/kao/test_k3p_rhythm.js`; `tests/kao/test_kao_render.js`; `tests/kao/test_kao2_mastery.js`; `tests/kao/test_kao2_perf_budget.js`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-22/EVIDENCE.md`; `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-22 allowlist satırı).

**Uygula:**

Önce gerçek açılış kontrolünden ilk cevaplanabilir göreve kadar bütün kullanıcı eylemlerini sayan testle 3’ü yeniden üret. Hedef sunumunu koruyarak mevcut eylemleri birleştiren en küçük akışı kur; ne başlangıç dokunuşunu ne goal ileri dokunuşunu sayaçtan çıkar. Hedef artık başka yüzeyde sunuluyorsa aynı ders/satır ve öğrenilecek kelimeleri gerçekten önceden gösterdiğini kanıtla.
Onboarding, kilitli kullanıcı, mastery/repair ve resume için normal ana ekran davranışını bozma. Gerekli hedef ekranını otomatik süreyle atlama, otomatik cevap veya haber verilmeden ders başlatma yapma. Geçerli iki eylemli yol ürün sözleşmesini değiştirmeyi gerektiriyorsa önce somut route taslağıyla karar al.

**Ölçülebilir kabul:** Normatif tamamlanmış-onboarding tohumunda açılış→ilk görev≤2; başlangıç ve hedef görünürlüğü kanıtlı; Bugün≤5 seçenek, resume aynı görev, birincil CTA ve back/close korunur.

**Doğrulama:** K(today), K(resume), K(rhythm), V(navigation), V(next_step); akis-olc; G0+G1.

**Hard stop:** Ölçüm başlangıç/bitişini değiştirerek veya engelli route’ları dışlayarak hedeften kaçma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-22: Açılıştan ilk göreve girişi iki dokunuşa indir`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-23. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-22 -->

<!-- PROMPT K3PD-23 -->
## K3PD-23 — Otomatik açık dersin gerçek dokunuşunu 40 veya altına indir

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-09; K3P-15 regresyonu42/40.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** dokunus-olc.cjs/correctTaps/playLesson; 13 şerit davranışı; 19/20 öğretim,22 giriş ve 06 parçalama kararları.

**Yazma allowlist’i:** Yalnız şu exact paths: `app/core/quranLearn.js`; `app/core/quranLearnFlow.js`; `app/core/quranLearnViews.js`; `kao3-premium/araclar/dokunus-olc.cjs`; `tests/kao/test_k3p_feedback_arms.js`; `tests/kao/test_k3p_rhythm.js`; `tests/kao/test_k3p_budget.js`; `tests/kao/test_k3p_lesson_moment.js`; `tests/kao/test_kao2_lesson_flow.js`; `tests/kao/test_k3p_resume.js`; `tests/kao/test_k3p_today.js`; `tests/kao/test_kao2_next_step.js`; `tests/kao/test_kao2_perf_budget.js`; `tests/kao/test_kao2_mastery.js`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-23/EVIDENCE.md`; `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-23 allowlist satırı).

**Uygula:**

Taban u01.01 için aynı tohum ve aynı tamamlanma tanımıyla 42’yi yeniden ölç. Her harf seçimi, ses/şerit duraklatması ve zorunlu ileri eylemini gerçek eylem olarak say. Otomatik açık, hepsi doğru standart yol ile duraklatmalı yol ve kapalı ayarı ayrı raporla.
Gereksiz en az iki geçişi öğretim içeriğini, yeni kelime sayısını ve cevap görevlerini azaltmadan kaldır. Ders parçalara ayrılıyorsa yalnız ilk parçayı sayarak tam ders≤40 deme; bütün parçaların toplamını da bas. Ana ölçüyü≤40’a getir; mümkün değilse kalan yapısal minimumu göster ve hedef değişikliği kararını ayrı iste. Şerit duraklatması erişilebilir şekilde korunur.

**Ölçülebilir kabul:** Aynı u01.01 tam ders standart otomatik açık toplam≤40; kapalı/duraklatmalı sonuçlar ayrı; görev/lemma kapsamı ve FSRS cevap sayısı açıklamasız azalmaz. Geniş 109 ders dağılımı ayrıca raporlanır, tek ders PASS’i evrensel yapılmaz.

**Doğrulama:** K(feedback_arms), K(rhythm), K(lesson_moment), K(budget); dokunus-olc; G0+G1+G2.

**Hard stop:** Öğretim ekranını yok etmek, harfleri tek tık saymak veya kapsamı parça bazına indirgemek yasak.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-23: Otomatik açık dersin gerçek dokunuşunu40 veya altına indir`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-24. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-23 -->

<!-- PROMPT K3PD-24 -->
## K3PD-24 — Tanıma oranının pay/paydasını ve hedefini karara bağla

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-05/F-09 ölçüm sınırı; K3P-18 ve genel≤%60 hedefi.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** cift-sik.cjs; state targets.recognitionShareMax; TASARIM merdiven/A–B; ledger K3P-18 karışık örnek kararı; ANALIZ ölçü tabanı.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-24 allowlist satırını exact paths olarak onarmak için); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-24/EVIDENCE.md`. Bu kartta motor/test eşiği/ölçüm sınıflaması değiştirilmez.

**Uygula:**

R1 tanıma, R2 çoktan seçmeli eşleme, R3 üretim, R4 cloze ve yeni tanış görevlerini ayrı tanımla. Yeni kullanıcı 92.92%, yerleşik 91.57% toplam çoktan seçmeli payını, karışık tekrar örneğinde R1=48.94% sonucuyla karıştırma. B kolunun daimaR1 kalması ve yeni kartlarıns<3 olması nedeniyle özgün toplam hedefin ne kadar mümkün olduğunu task×cohort sayılarıyla göster.
Önerilen karar: özgün genel ölçüyü görünür NOT_MET olarak koru; karşılaştırılabilir olgun tekrar kohortunda R1 hedefini ayrı önkayıtla tanımla; yeni kullanıcı pedagojisini yalnız metrik için zorlaştırma. Alternatif genel≤60’ı gerçekten sağlayacak öğrenme tasarımı değişikliğinin A/B ve notlamaya etkisini somut göster. Kullanıcıya hedef/method seçimlerini sun; önceki karışık örnek onayını genel hedef feragati sayma.

**Ölçülebilir kabul:** Her pay/payda ve öğrenci kohortu kesin; R2’nin çoktan seçmeli olduğu açık; hangi eski hedefin kalıp hangisinin değiştirilmesine onay verildiği kayıtlı. Karar yoksa 25 başlamaz.

**Doğrulama:** Deterministik sayım tablosu ve belge denetimi; motor/scheduler/ölçü kodu diff’i 0.

**Hard stop:** R2’yi görünmez yapma, paydayı yeni görevlere bölerek şişirme veya bilimsel kalıcılık iddiası kurma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-24: Tanıma oranının pay/paydasını ve hedefini karara bağla`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-25. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-24 -->

<!-- PROMPT K3PD-25 -->
## K3PD-25 — Onaylı tanıma hedefini uygula ve bütün oranları kapıya bağla

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** 24 kararı; genel hedef ile örnek hedefin ayrı doğrulanması.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** 24 gerçek karar yanıtı; cift-sik ve ladder görev kurucuları; ölçü kapıları; ilgili testler.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/araclar/cift-sik.cjs`; `tests/kao/test_k3p_distractors.js`; `tests/kao/test_k3p_ladder.js`; `tests/kao/test_k3p_build.js`; `tests/kao/test_k3p_cloze.js`; `tests/kao/test_k3p_recognition_gate.js` (yeni gate fixture’ı); `tests/kao/test_kao2_components.js`; `tests/kao/test_kao2_curriculum.js`; `tests/kao/test_kao2_feedback.js`; `tests/kao/test_kao2_today.js`; `tests/kao/test_kao2_kabul.js` (A-10 runtime tavanını K3PD-22’de onaylanan 137.75 KiB ile hizalamak için, test-only); `tests/kao/test_kao2_perf_budget.js` (kanonik 137.75 KiB tavanının yorum/hata metnini düzeltmek için, eşik değişmez); `tests/app/test_app_surface_boot_boundary.js`; `tests/app/test_app_surface_domain_boundary.js`; `tests/app/test_app_surface_lifecycle_boundary.js`; `tests/app/test_app_surface_overlay_boundary.js`; `tests/app/test_header_celestial_timeline.js`; `tests/app/test_header_night_contrast.js`; `tests/app/test_iip_09.js`; `tests/app/test_v3_welcome.js` (G2 A-9’deki mevcut stale assertion’ları güncel HEAD sözleşmesine göre düzeltmek için, test-only); `tests/kao/README.md` (fixture envanteri); `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-25 satırını parser uyumlu exact paths olarak düzeltmek için); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-25/EVIDENCE.md`. K3PD-24 A yalnız ölçüm sözleşmesini seçtiğinden üretim motoru, scheduler, ölçü, A/B ve notlama dosyaları değiştirilemez. Yeni DURUM/GUNCEL-DURUM/KAYIT ve bu kartın EVIDENCE dosyası ortak sözleşme gereği eklenebilir.

**Uygula:**

Karar yalnız ölçüm sözleşmesi ise üretim motorunu değiştirme. Motor değişikliği seçildiyse sadece onaylı görev seçim kuralını uygula; FSRS s/due/reps ve A/B hash’ini sabit tut. Mevcut 109 ders×yeni/yerleşik/karışık kohort sayımını yeniden üret.
Çıktıda R1, R2, R3, R4, ilk tanış, toplam çoktan seçmeli pay, geçerli görev sayısı ve fallback oranları ayrı olsun. Her bağlayıcı hedef ihlalinde nonzero exit; açık onaylı sapma varsa ayrı durum/karar referansı ve özgün NOT_MET basılsın. Sıfır görev veya yedek havuzun bozulması PASS olmasın. 28 kapısının tüketebileceği toplu ve sürümlü makine çıktısı sözleşmesini tanımla.

**Ölçülebilir kabul:** 24’teki geçerli hedef sağlanır veya açıkça kabul edilmiş sapma olarak doğru etiketlenir; özgün sonuç gizlenmez. Çift şık 0, clozePOS0 ve build kapsamı korunur; sayı azaltma/görev atlama yok.

**Doğrulama:** K(distractors), K(ladder), K(build), K(cloze), K(rhythm); cift-sik; G0+G1+G2 yavaş.

**Hard stop:** Karardaki seçenekten farklı pay/payda kullanma; “R1≤60” ile “toplamMC≤60” etiketlerini eşitleme.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-25: Onaylı tanıma hedefini uygula ve bütün oranları kapıya bağla`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-26. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-25 -->

<!-- PROMPT K3PD-26 -->
## K3PD-26 — Deney raporunda dönemleri, vekilleri ve geçersiz geçmişi ayır

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-12; 02/03 H4 sözleşmesi; K3P-05/26.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** deney-rapor.cjs project/h2/h3/h4/h5/h7/h8/h9; test_k3p_deney_rapor.js; özgün H2–H9 kayıtları.

**Yazma allowlist’i:** `kao3-premium/araclar/deney-rapor.cjs`; `tests/kao/test_k3p_deney_rapor.js`; `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu satırın exact-path düzeltmesi); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; bu klasörde `kao3-premium/duzeltme-plani/kanit/K3PD-26/DENEY-SOZLESMESI.md` ve kart makbuzları. Eski tarihsel kayıtlar değişmez.

**Uygula:**

H7 kararını seçili kesim→bugün dönemine göre ver; önce/tüm dönem bilgisini ayrı etiketle, gelecekteki günleri dahil etme. Örnek 20/26 genel ama7/13 sonrası durumunun tutmuyor olmasını sına. H4’te legacy-invalid günleri yeni kohorta dahil etme;02 başlangıç kuralını uygula, sayaç olmayan veriyi 0% diye sunma.
H3’ün anlık kart özeti olduğunu ve 30 gün nedensel deney sonucu olmadığını koru. H5 ilk bitirilen ders, H9 hiç unutulmayan kart payı ise proxy adını açık yaz; özgün hipotez için NOT_MEASURED üret. H8’in önce/sonra için tarihli dış snapshot gereksinimini belirt; elde olmayan geçmişi uydurma. Kesin yeni olay kaydı istenirse ayrı şema kararı olmadan üretme.
Sadece toplu sayılar bas; kelime, kimlik, not, token ve dosya içeriği sızıntısı yemleriyle testi koru. Bu kartta yalnız sentetik girdiler kullan.

**Ölçülebilir kabul:** Kesim/bugün boş, az veri, gelecek gün, eski H4, iki farklı kohort ve proxy durumları doğru; H2 pencere≥20 kuralı aynı. Gizli veri çıktısı 0, ağ/yazma 0; H5/H9 özgün sonuç gibi PASS değil.

**Doğrulama:** K(deney_rapor), K(pronunciation_fold); node deney-rapor.cjs --ornek tam repo yolu; G0+G1.

**Hard stop:** Kullanıcı yedeğini kendi başına bulma/okuma; raporun kesin ölçemediğini aynı ad altında olumlu sonuç yapma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-26: Deney raporunda dönemleri, vekilleri ve geçersiz geçmişi ayır`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-27. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-26 -->

<!-- PROMPT K3PD-27 -->
## K3PD-27 — Donmuş içerik ve fontun teknik kanıt açığını kapat

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** K3P-04/04B UNVERIFIABLE; K3P-07 teknik kabul.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** test_kao_freeze_repro.js, üretim araçlarının yan etkileri; gerekli üç girdi; pronunciation/phonics contract; font-subset aracı veOFL.

**Yazma allowlist’i:** `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu satırın exact-path güncellemesi); `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `app/kao.css` (yalnız Scheherazade `@font-face` URL’sinin SW manifest sürümüyle eşitlenmesi); `tests/app/test_iip_22.js` (exact font URL offline regression kontrolü); bu kartın yeni program kanıtları; gerekiyorsa freeze fixture’ının dürüst SKIP raporlama adaptörü. Font binary’si ve üretim içerik/okunuş girdileri değişmez.

**Uygula:**

Girdileri mevcut yerel yetkili yollarda doğrula; eksikse exact path/hash/provenance ile blocker yaz. Ağdan indirme, tahmini içerik veya elle dondurma yapma. Mevcut testin geçici kopyada yazdığı dosyaları ve cleanup’ını inceleyip yalnız bu kart kapsamında çalıştır; üretim modüllerinin önce/sonra hashleri aynı olsun. SKIP exit 0 ise strict kapıda kanıt eksikliği say.
Araç→verified girdi→runtime 524 eşliğini ve dört modülün bayt-eş yeniden üretimini ayrı raporla. Fontun mevcut SHA-256/cmap105/105, boyutu, @font-face swap/range, SW allowlist ve lisans dosyasını yerelden doğrula.30 zor glifin görsel karşılaştırması 29’un işi; teknik kapsamı gerçek şekillendirme kabulü sayma.

**Ölçülebilir kabul:** Dört modül gerçekten yeniden üretilip bayt-eş veya açık blocker; SKIP hiçbir tablodaPASS değil. Font105/105 ve mevcut binary hash eşliği; kaynaklara/personal data’ya yazma 0; tempcleanup kanıtı.

**Doğrulama:** T(pronunciation_contract), T(phonics_contract), T(freeze_repro), test_iip_22; font-subset --build OLMADAN; G0+G3.

**Hard stop:** Girdi eksikliği için indirme veya üretim içerik değişikliği gerekiyorsa ayrı somut yetki iste; eski tarihli hashleri bugünkü çalıştırma sayma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-27: Donmuş içerik ve fontun teknik kanıt açığını kapat`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-28. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-27 -->

<!-- PROMPT K3PD-28 -->
## K3PD-28 — Ölçü ve regresyon kapısını başarısızlıkta kapalı kur

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-02/F-09/F-12; yeşil kapının hedef sapmalarını gizlemesi.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** Yeni state; eski kapi-hizli/kapilar kaynakları; akis/dokunus/cift/okunus; tekrar-uret ile güncel denetim; test envanteri.

**Yazma allowlist’i:** Yalnız şu exact paths: `kao3-premium/duzeltme-plani/PROMPTLAR.md` (yalnız bu K3PD-28 allowlist satırı); `kao3-premium/duzeltme-plani/araclar/kapi.mjs`; `kao3-premium/araclar/akis-olc.cjs` ve `kao3-premium/araclar/dokunus-olc.cjs` (yalnız ölçüm arayüzü); `app/core/quranLearnViews.js` (yalnız hedef ekranındaki ayet ve açıklamayı erişilebilir ayrıntı bölümüne almak; içerik/handler/data değişmez); `tests/kao/test_k3p_lesson_ayah.js` (yalnız gerçek başlık-summary ilk görünümünü ve açılır satır eşliğini sınamak); `tests/kao/test_kao2_a11y.js` (yalnız yeni goal details özetini doğrulamak); `tests/kao/test_k3pd_control.js`; `tests/kao/README.md`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; bu kartın `kanit/K3PD-28/` kanıtları. Eski program kapıları ve üretim içeriği değişmez.

**Uygula:**

Yeni kapıya --kart ID, --yavas ve --final seçenekleri tanımla. Kart-ID/önkoşul/izinli diff/gerekli karar/fixture/env kontrollerini uygula. Her child exit kodunu sakla; pipe/tail başarısını child başarısı sanma. Testleri yeni/yerleşik/karma kohort ve gerçek görünür metinyle bağla. Sıfır test, SKIP, eksik metric, NaN, parçalı rapor veya yanlış sürüm için kırmızı olsun.
Bağlayıcı hedefler:25 sözcük goal,45 intro/concept,≤1 passive,≤7 novelty,≤2 entry,≤40 standarttamders ve 24 kararlı tanıma hedefi; özgün/kabul edilmiş sapma statülerini ayrı taşı. 21 geometri ve 29 görsel kanıtları yoksa final yeşil olmasın. K3P’nin eski tabanına ait9/10R08’i tarihsel tanılayıcı olarak aynen göster; güncel R08 ve gerçek 109 render sınaması ayrıca zorunlu.
--final bütün mevcut fixture ailelerini ve güvenli harness’leri kaynak/yan etki denetiminden sonra çalıştırsın; slow bayrağı yalnız göreli perf bandını istisna edebilir. Log yazımı yeni kanıt alanında allowlistli; runtime ağ/mock sınırı korunur.

**Ölçülebilir kabul:** Sentetik mutation: her eşik ihlali, bir child exit 1, SKIP exit 0,0 fixture, yetkisiz deferral ve eksik karar finali kırmızı yapar. Onaylı sapma ayrı karar referansıyla kabul edilir, PASS sayısı içine gizlenmez.

**Doğrulama:** Yeni control/gate negatif self-testleri; --kart K3PD-28 --yavas; G0–G2 ve G5’in ölçü/fixture bölümü; G3 için yalnız 27’nin mevcut makbuz/hash kontrolü, yeni freeze çalıştırması yok. 28’in kendi kapısı yeşil olmalı; --final, henüz 29/30 kanıtı yokken beklendiği gibi kırmızı olmalıdır. Finalin yeşil olması 31’in kabulüdür. Komutlar araç yazıldıktan sonra gerçek yollarla çalıştırılır.

**Hard stop:** Hızlı test bitti diye aynı kodu koruyan yavaş testi atlama; eski9/10 tanılayıcısını yeni10/10 diye etiketleme.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-28: Ölçü ve regresyon kapısını başarısızlıkta kapalı kur`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-29. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-28 -->

<!-- PROMPT K3PD-29 -->
## K3PD-29 — Gerçek iki tema, geometri ve zor glif görsel QA yap

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-11; K3P-00/07/26 ve A6 kanıt açıkları.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** Gorsel QA README/cdp/shoot-modal; syncGuard 1 kaynağı/testi;19–23 makbuzları; font 30 glif kabulü; yeni görsel kanıt şeması.

**Yazma allowlist’i:** tools/kapi/gorsel-qa/shoot-modal.mjs ve gerektiğinde yalnız test/ölçüm yardımcısı; yeni kanıt klasörü; control/görsel-fixture testi gerekiyorsa envanter. Üretim davranışı ve eski kontaklar yasak.

**Uygula:**

Bu kartın kullanıcı tarafından ayrıca verilmesi, yalnız AGENTS’taki kontrollü yerel ekran görüntüsü istisnası kapsamında yeni sentetik çekim talebidir. Önce Guard 1 kaynağı/testi;127.0.0.1:9000 dışında origin yok, gerçek profil/token/forceSync yok. Başlatılan sunucu varsa PID ile bu kart sonunda durdur. CDP dış ağı engellensin.
Her ana VE onboarding profilinde açık için App.setTheme(false), koyu için true uygula; root data-theme ve computed renkleri okuyup beklenene uymuyorsa çekimi başarısız say.320/390/460×açık/koyu; sahneler güncel gerçek rotalarla üretilir. Ekran sayısını 79’a sabitleme: her görüntü için tek manifest satırı, profil/tema/viewport/sahne/screenshot/log/issues/hash olmalı. Onboarding de ölçü loguna girsin.
21’in CTAkonum/≤8 px/örtüşme matrisini,11’in birleşik harflerini ve lisanslı mevcut fontla 30 zor glif dizisini screenshot + font-yükleme kanıtıyla değerlendir. Dizileri mevcut doğrulanmış içerikten seç; kaynağını ve aynı dizinin karşılaştırmalı referansını kaydet. Önce/sonra aynı dizi ve aynı ölçekte olmalı. Kullanılabilir yerel eski font/referans yoksa karşılaştırma alt kabulünü UNVERIFIABLE bırak; yeni görünümünü iki kez çekip önce/sonra sayma. Yerel scroll alanı ile sayfa taşmasını ayır. Kontaktaki küçük önizlemeyi tek başına glif kabulü sayma; rawlar veya eşdeğer okunabilir kırpmalar/hashler korunsun. Eski yanlış “açık” kontakları silme/üzerine yazma; geçersiz tema kanıtı diye işaretle.

**Ölçülebilir kabul:** 6 kombinasyonda gerçek tema doğrulaması; bütün ana/onboarding sahnelerinde screenshot=log=manifest; beklenmeyen overflow/clipping0; CTA≤8 px ve görünürlük;30 glif okunabilir karşılaştırma. Headless font kanıtı cihaz kabulünden ayrılır; server cleanup doğrulanır.

**Doğrulama:** test_local_visual_qa_guard; G4; manifest-sayım/hash/tema negatif testleri; yeni gerçek yerel QA. Araç invocation arayüzünü canlı kaynaktan doğrula.

**Hard stop:** Bu kart açıkça verilmeden browser/server açma. Tema yanlışsa isim değiştirerek kabul etme; cihaz/ekran okuyucu/L2onayı iddia etme.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-29: Gerçek iki tema, geometri ve zor glif görsel QA yap`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-30. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-29 -->

<!-- PROMPT K3PD-30 -->
## K3PD-30 — Belgeleri ve 37 kartın kabul matrisini güncel kanıtla eşitle

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** F-11/F-13/F-14; K3P kayıt tutarsızlıkları ve tüm 37 matris.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** Bu iki belge, bütün K3PD makbuzları; orijinal PROMPTLAR/KARTLAR/STATE/CURRENT/LEDGER/ANALIZ/AKIS/KAPANIS; mevcut dirty belgeler.

**Yazma allowlist’i:** Bu klasörde kanit/K3PD-30/K3P-37-YENIDEN-DENETIM.md, kanit/K3PD-30/DUZELTME-NOTU.md ve yeni state/durum/kayıt/kanıt. Eski kao3-premium/PROMPTLAR.md, KARTLAR.md, BAGLAM-YONETIMI.md, ANALIZ.md ve AKIS.md dosyalarında yalnız açık düzeltme notu ve ardıl belge bağlantısı. Eski K3P-STATE.json, CURRENT-STATE.md, ledger, tarihsel kanıtlar ve başlangıçta kirli README/KAPANIS/GORSEL-KANIT bu kartta salt okunur; bunlar için ayrıca exact-path kapsam kararı gerekir.

**Uygula:**

Her Fbulgusunu kanıtla kapat veya açık/kabul edilmiş sapma/harici doğrulama olarak sınıflandır.37 kartın eski verdictini silme; yeni HEAD, requirement, commit/diff, test, görsel ve kalan alt kabulü gösteren yeni matris üret. Eski completed state tarihsel kapanıştır; yeni programın durumunu onun içine yazma.
36→37, L6/L9 etiketi ve geçerli 128→136/14→16 kararlarını açık düzeltme notuyla uzlaştır. GüncelruntimegzipL6/L9, CSS/content/font boyutu, CSSheadroom exact B; schema.s21 gerçeği; hedefferagatleri ve eski invalidgörselleri dürüst yaz. “Tüm hepsiPASS” yerine kanıt kapsamlarını ver.
Daha önce kirli KAPANIS/README/GORSEL-KANIT içeriğini yeniden oku ve hash/diff sahibini doğrula. Üzerine yazarak düzeltme yapma; gerekirse bu dosyalara dokunmadan ayrı ekle bağlantı önerisi sun. Eski başarılı yayın makbuzunu geçmişteki byte/kod için koru; düzeltme sürümüne taşıma.

**Ölçülebilir kabul:** F01–F14 ve 37 kart tekil/sıralı; karar/verdict/count tutarlı; legacy ve yeni ölçüler ayrılmış; linkler mevcut. Kirli belge kaybı 0; tarihe geriye dönük PASS yazılmamış.

**Doğrulama:** Belge/link/ID/sayı doğrulaması; G0+G5; 37 satır karşılaştırması ve bütün karar referansları.

**Hard stop:** Gerçek kullanıcıya ait dirty belgeyi otomatik sahiplenme; eksik kanıtı yalnız anlatımla kapatma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-30: Belgeleri ve37 kartın kabul matrisini güncel kanıtla eşitle`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-31. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-30 -->

<!-- PROMPT K3PD-31 -->
## K3PD-31 — Yayınsız bağımsız final denetimini tamamla

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** Tüm bulgular; regresyonların son HEAD’de yeniden sınanması.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** DENETLEYICI tam metni;30 matrisi; bütün karar ve kanıtlar; canlı Gitdiff ve source/testler.

**Yazma allowlist’i:** Bu klasörde kanit/K3PD-31/FINAL-DENETIM.md ve kartın diğer makbuzları; yeni state/durum/kayıt. Kod/test/eşik/pin değişikliği bu kartta yasak.

**Uygula:**

Uygulayanın PASS’ine dayanma; DENETLEYICI’deki saldırgan senaryoları son HEAD’de yeniden çalıştır. 37 orijinal kartı ve 34 ardıl kartın o ana kadar uygulanmış kısmını ayrı say. Source/test, syntheticvisual, release ve device alanlarını ayır. Testname/ledger/fileexistence tek başına kanıt değil.
Geniş gate’i ve hedef ölçülerini çalıştır; SKIP, göreli perf istisnası ve eski R08 özetini görünür tut. Pin ertelemesi varsa yerel teknik aday ile yayımlanabilir aday ayrılır;32 öncesi varlıklarıntam taze olmasını uydurma.31 yayınsız teknik kabul kartıdır; release/device bilimsel etki kapsamını tamamlandı saymaz. Yeni kusur çıkarsa ilgili karta geri yönlendir, burada hızlı düzeltme yapma.

**Ölçülebilir kabul:** Bağlayıcı bütün yerel kapılar ve kapsam içi görsel kabul yeşil; açıkP1/P2 yok veya açık kullanıcı kararıyla sınırlı kabul; orijinal hedeften sapma ayrı. TeknikfinalPASS, yayınonayıNOT_APPROVED kalır.

**Doğrulama:** Yeni kapi.mjs --final --yavas; DENETLEYICI §5 negatif matrisleri; scope/hash/gitdiff kontrolü; G0–G3 + G5 (29’daki görsel kanıtın salt okunur denetimi; yeni çekim yok).

**Hard stop:** Bağlam biterse audit incomplete de; kalanlarıPASS sayma. Bu kart push/merge/deploy izni değildir.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-31: Yayınsız bağımsız final denetimini tamamla`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-32. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-31 -->

<!-- PROMPT K3PD-32 -->
## K3PD-32 — Koordineli pinli yayın adayını hazırla ve son onayı iste

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** K3P-27’den yeni sürüme izin mirası yok.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** 31 yerel denetimi; sw/index/panel sürüm sözleşmeleri; eski pin-yukselt aracının branchguard’ı; yeni pin borcu.

**Yazma allowlist’i:** Bu klasörde yalnız yeni araclar/pin-yukselt.mjs; index.html, sw.js, panel-v2.html; tests/app/test_app_surface_boot_boundary.js, test_app_surface_domain_boundary.js, test_app_surface_lifecycle_boundary.js, test_app_surface_overlay_boundary.js, test_header_celestial_timeline.js, test_header_night_contrast.js, test_iip_09.js, test_iip_22.js, test_v3_welcome.js; tests/kao/test_kao2_curriculum.js; tests/panel-v2/test_panel_v2_hit_areas.js ve test_panel_v2_performance.js; yeni state/kanıtlar. İlk app testinden sonraki kısa test adları aynı tests/app/ klasöründedir. Üretim davranışı yasak. Canlı taramada bu liste dışı pin bağı bulunursa exact path ve gerekçeyle kapsamı güncellemeden o dosyaya yazma.

**Uygula:**

Eski pin aracını yeni dalda çalışır varsayma: mevcut araç yalnız kao3-premium’da çalışır. Yeni programa özel dry-run ve exact-host/exact-pin diff’i üret; changedassets, ortak sürüm bağlantıları,SW_VERSION/OFFLINE_VERSION/register ve gerçek sabit testlerini tek koordineli geçişte güncelle. Yeni pinin gerçek mevcut değerden farklı ve güncel olduğuna bak; bu plandaki tarihleri hardcode etme.
Önce --dene, sonra yalnız gözden geçirilmiş aday farkını uygula. Deferral boşalsın, assetfreshness’ta ERTELENDİ0; bütün kapılar pinli adayda tekrar geçsin. Commit/allowlist/dirtydışkapsam,31 bulguları, geçerli hedefler ve dışgates ile somut yayın özetini kullanıcıya göster. Ardından yalnız bu aday için merge/push/Pages yayın onayı iste. Açık yanıt gelene kadar remote işlem yapma.

**Ölçülebilir kabul:** Pinli adayın tam tazelik ve test eşliği geçer; branch/pin/sabit negative dry-run testleri; source JS/CSS/içerik hashleri 31 ileaynı. releaseApproval henüzNOT_APPROVED veya awaiting_approval; istenen adaySHA/diff belirli.

**Doğrulama:** Yeni pin aracı --dene/negatiffixture; test_asset_pin_freshness; test_iip_22; yeni kapi --final --yavas; gitdiff exactpaths.

**Hard stop:** Eski APPROVED-2026-10-18 veya kullanıcının yalnız plan talebini yeni yayın onayı sayma. Tamamlanmış adayı hazırlamadan onay sorusu sorma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-32: Koordineli pinli yayın adayını hazırla ve son onayı iste`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** K3PD-33. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-32 -->

<!-- PROMPT K3PD-33 -->
## K3PD-33 — Yalnız açık onaylı adayı yayınla ve teslim kanıtını ayır

**Rol:** Bu kartın dar kapsamlı uygulayıcısısın. Bu dosyanın §1–§4 ortak sözleşmesi ve DENETLEYICI.md bağlayıcıdır. Yalnız kullanıcı bu ID’yi açıkça verdiyse uygula.

**Bulgu / özgün kart:** Yeni yayın zinciri; uzak/live UNVERIFIABLE kapanışı.

**Önkoşul:** Sıra tablosundaki önceki kartın kabulü; özel karar/kanıt bağımlılıkları §5. 00 için önceki kart yok. Kaynak ve sayıların güncelHEAD’de geçerliliğini doğrula.

**Oku:** 32adaySHA/diff ve ona özgü açık kullanıcı yanıtı; gitremotes/branch/status; workflow ve statik GET yetkisi.

**Yazma allowlist’i:** Onaylı release dosyaları zaten 32’de; yeni makbuz/state/durum/kayıt; eski kullanıcıdirtybelgeleri dışkapsam. Üretim davranışı değişikliği yasak. Yayın adayı SHA A ile yayın sonrası makbuz commit’i R ayrı kaydedilir; R yalnız ardıl yerel dalda kalır, main/origin’e ikinci kez push edilmez.

**Uygula:**

Önce onaylanan adayın aynı kaldığını doğrula. Main’de önceden dirty iş varsa onu taşıma/commit etme; temiz izole çalışma alanıyla yalnız onaylı aday zincirini ilerlet. Main fast-forward mümkün değilse force/rebaseyapma; çatışmayı somut bildir. Onaylı origin/main’e push; doğru headSHA’ya ait validate/deploy workflow sonucunu izle. Başka remote, tag veya kişisel veri yazısı bu onaya dahil değildir.
Uygulamayı gerçek tarayıcıda açmadan yalnız public statik dosyalara no-cache/no-store GET yap; hostlar+manifestteki tüm sürümlü URL’lerdeHTTP200 ve SHA-256 eşliğini bağımsız doğrula. Yerelcommit/uzakSHA/workflow/liveparity dört ayrıkanıttır; herhangi biri eksikse yayıncomplete yazma. Makbuz/state güncellemesini yayın tamamlandıktan sonra yerel ardıl dalda ayrı metadata commit’i R olarak bırak; onaylanan ve yayımlanan A değişmez. Yerel HEAD=R, origin/main=A ise bunu eşitlik diye sunma: üretim varlıklarının A↔R hash eşliğini ve R’nin yalnız yerel kayıt olduğunu açık raporla. Makbuzları da uzak depoya taşımak ayrıca somut kapsam/onay ister. Deney cutoff’unu gerçekten düzeltmenin canlıya çıktığı tarihe göre 02/26 sözleşmesiyle kaydet; eski 1 Kasım/17 Kasım tarihlerini yeni ölçüme taşımayıp yeni14/30takvimini türet.
Cihaz, gerçek ekran okuyucu, L2/230kayıt ve gerçek öğrenme etkisi açık dışkabul olarakkalır; bunlar için agentVerified:true üretme. Başlatılan yerelserver varsa kapat; bu kartserver gerektirmez.

**Ölçülebilir kabul:** OnaylıexactSHA main/origin/parity; workflow doğruheadsuccess; HTTP/hash tümURLeş; borç 0; releaseApproval gerçek yanıt/tarih referanslı. Ağ/credential engeli varsa ilgili alanUNVERIFIABLE, genelteslimpending.

**Doğrulama:** OnaylıGit/workflowread; manifesttümURLGET/hash; sonrasılocalgate/senkron; G6. Token/kişiselgirdi chattenistenmez.

**Hard stop:** Yeni onay yoksa DUR. Forcepush/tag/diğerremote/seyma-data/gerçekhesapbrowser yasak. Bağlantı hatasını geçmişmakbuzla kapatma.

**Teslim:** Değişen exactpaths; tekrar üretim; komut/exit/ölçüler; independent verdict; açık sınırlamalar ve yeni kayıt. Önerilen commit başlığı `K3PD-33: Yalnız açık onaylı adayı yayınla ve teslim kanıtını ayır`. Kayıt güncellemesi ve bu kartın kapanışı dışında sonraki işe başlama.

**Sonraki aday:** yok — yalnız kapsamı tamamlanmış kapanış. Bu bilgi sonraki karta uygulama izni değildir.
<!-- /PROMPT K3PD-33 -->
