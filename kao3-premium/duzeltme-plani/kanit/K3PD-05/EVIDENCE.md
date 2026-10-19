# K3PD-05 — süre tahmini ve kişisel medyan

## Durum

- Kart başlangıç HEAD'i: `cdf30ba83c9e08f044fb3761fab17c1ecf84f4e3`; dal `k3pd-denetim-duzeltmeleri`; başlangıç `HEAD...origin/main`: 5/0.
- Uygulama kapsamı: `app/core/quranLearnFlow.js`, `app/core/quranLearn.js` (yalnız süre/latency bağları), üç hedef fixture ve K3PD kontrol düzlemi.
- Kullanıcının açık izniyle yalnız bu kartın `PROMPTLAR.md` allowlist satırı verilen exact yollarla normalize edildi; prompt yolu `DURUM.json.changedPaths` ve kayıt kapsamına eklendi.
- Bağımsız salt-okur denetçi K3PD-05 için `PASS` verdi; hüküm kaynak, gerçek diff, negatif sınama, G0/G1 kanıtı, korunan hashler ve kapsam denetimine dayanıyor. K3PD-06 başlatılmadı.

## Davranış kanıtı

- Yeni negatif sınamalar üretim değişikliğinden önce yazıldı. Eski tahmin fonksiyonu cap=5 ile süreyi tavana kırptı ve ölçümsüz durumda 30 sn/görev sözleşmesini karşılamadı; eski cevap akışı da aynı doğru yanıtı hem feedback açılışında hem Devam sırasında ekliyordu.
- `estimateMinutes` artık cap parametresini yalnız eski çağrılar için kabul eder; hesaplamaya bütçe kırpması uygulamaz. 13×30.000 ms → 390.000 ms → 7 dk; 13×60.000 ms → 780.000 ms → 13 dk. 24×6.000 ms → 144.000 ms → 3 dk.
- Tahmin girdisi sırası: geçerli aynı oturum medyanı; yoksa önceki yedi günlük `ms/answered` ortalaması; o da yoksa açıkça etiketli 30 sn/görev varsayılanı. Her geçerli pozitif ölçüme 6 sn tabanı uygulanır.
- `quranLearn.js` son 50 geçerli UI latency örneğinin medyanını kullanır; 0, NaN ve negatif örnekler dışlanır. Doğru ve yanlış cevaplar aynı örnek penceresine girer. Tek ekleme noktası `kaoOpenFeedback`; `kaoContinue` artık tekrar eklemez.
- Medyan vakaları: geçersiz örnekler/boş geçerli pencere; 51 öğeden son 50 (2–51, medyan 26,5); doğru+yanlış 20.000/10.000 ms (medyan 15.000); 1.000/2.000/3.000/4.000/100.000 ms uç değer dizisinde medyan 3.000 ms, 10.000 ms cevap yavaş kola girer (ortalama kullanılsaydı hızlı görünürdü).
- Yeni ve devam eden normal/lesson/mastery/repair oturumlarının handler sınamaları latency geçmişinin sıfırlandığını; devam edilen aktif lesson/mastery/repair oturumunun geçmişi koruduğunu gösteriyor. Başarısız ilk sınama yeni lesson başlangıcında eski `[12000,18000]` penceresini yakaladı; düzeltme sonrası dört yeni oturum kolu temiz başladı.
- Flow testinde DOM, timer, storage veya `Date.now` erişimi yok. Yeni kalıcı alan, migration ya da `App.kao*` handler eklenmedi.
- Beş dakikayı aşan gerçek tahmin gizlenmiyor. Bu planların bütçe uyumu K3PD-06 kapanana kadar açık ve çözülmemiş kalıyor.

## Şu ana kadarki doğrulama

- PASS: V(next_step) 25 kontrol; K(budget) 8; K(feedback_arms); T(requirements), DİA 524/524 ve hedefli 15.337 ms (<50 ms). İlgili G2: lesson flow 24, mastery 45, resume 5; feedback fixture PASS.
- G0+G1 ve gerekli sentetik kontroller geçti: `test_k3pd_control` (33 negatif + 34 K3PD + 6 legacy pin politikası), driver, zikr harness 95/95, migration×2, FSRS, queue, render, navigation, accessibility 14/459, inventory 83+4, design/pronunciation/phonics/mount/focus, plan-check ve contrast 756/756. Eski K3P senkronu 37/37 ve `nextPrompt=null`; `App.kao*` sayısı 45.
- Perf geçmişi açıkça korunuyor: sessiz-host PASS p95 32.178 ms (<40), steady 14.473 ms; boyut kapıları geçti ve baseline yazılmadı. Diğer denemeler 515.743, 64.825, 216.908 ve daha sonraki yüksek-yüklü 67.703 ms sonuçları verdi. Son başarısız ölçüm sırasında hostta eşzamanlı yoğun VS Code/Chrome ve başka bir build gözlendi; eşiği gevşetmedim. DENETLEYİCİ’nin mutlak 40 ms şartını karşılayan PASS kanıtı mevcut, ancak daha sonraki gürültülü deneme PASS sayılmıyor.
- Yayın engelleri kullanıcının sonraki açık yönetici izni kapsamında kapatıldı: `index.html` ve `sw.js` KAO varlık/SW pinleri `20261019a` olarak koordine edildi, `test_iip_22.js` sürüm sözleşmesi eşlendi; Pages paketleme listesi `kao3-premium` dizinini dışlıyor ve guard listesi de bunu reddediyor. Pin tazeliği 63/63 PASS; IIP-22 13/13; sentetik Pages staging runtime varlıklarını içerdi ve K3PD state/Markdown’ını dışarıda tuttu.
- `App.kao*` ataması 45. `app.js`, `sync.js`, state/migration gövdeleri, eski K3P state/ledger ve şema değişmedi.
- 120 saniye ölçüm tavanı mevcut K2F-31 sözleşmesidir; bundan uzun yanıtlar örnek/geri bildirim süresinde 120 saniyeye doygunlaşır. Bu kart tavanı değiştirmedi; uzun cevaplarda sınırsız gerçek süre medyanı iddiası yoktur. K3PD-04’ün 6 saniye tabanı, boş pencere fallback’i ve yeni kalıcı alan/migration yasağı korunur.
- Korunan üç kirli dosyanın SHA-256’ları başlangıçla aynı; hiçbiri stage edilmedi veya karta katılmadı. Schema/migrate, içerik ve `App.kao*` sayısı değişmedi. K3P 37/37 tarihsel kaydı ayrı kaldı.

## Sonraki kapılar

1. DURUM/GUNCEL-DURUM/KAYIT’ı bağımsız PASS ve son doğrulama sonuçlarıyla eşitle; K3PD-06’ya kalan >5 dk plan borcunu ve 120 sn ölçüm sınırını açık kaydet.
2. Kartın tek mantıksal yerel commit’ini oluştur; ardından kullanıcının yalnız bu K3PD-05 adayına verdiği canlı yayın izni kapsamında yayın hazırlığını ve dağıtım kanıtını ayrı tut. Programın nihai `releaseApproval=NOT_APPROVED` durumunu ve sonraki kart yetki sınırını koru.
