# K3PD güncel durum

- Program: aktif; K3PD-00…K3PD-10 bağımsız PASS ile kapandı.
- Bu kartın başlangıcı: branch `k3pd-denetim-duzeltmeleri`; HEAD `dec3ace0db0991a592685fa989cad1ec423b9c3d`; başlangıç `HEAD...origin/main` 4/0.
- K3PD-10 kapanış durumu: `done/PASS`; DURUM.nextPrompt `K3PD-11` (yalnız aday, uygulama yetkisi değil).
- K3PD releaseApproval: `NOT_APPROVED`; yayın yapılmadı.
- Eski K3P ayrı: 37/37 tamamlandı; eski `nextPrompt=null`; tarihsel onay ardıl K3PD’ye taşınmaz.
- Başlangıçta kirli olan KAPANIS.md, README.md ve kanit/sonraki/GORSEL-KANIT.md korunuyor; K3PD-10 kapsamı/stage dışında.
- `App.kao*` ataması 45; schema/migrate, pinler, içerik, FSRS parametreleri ve A/B hash’lerinde değişiklik yok.
- İlk denetimin boş-anlam R2 bulgusu giderildi: task builder kullanılabilir görev üretmiyorsa gerçek oturum kuyruğundan çıkarılıyor; güncel G0/G1 exit 0. Perf’te yalnız göreli band için slow-host istisnası kaydedildi, mutlak tavanlar geçti.

Sıradaki aday: K3PD-11 (bu PASS yeni karta yetki değildir).

## K3PD-09 — bağımsız PASS ile kapandı

- Başlangıç HEAD `10914697204b8411beae040ff108d2c80caa0a7d`; dal `k3pd-denetim-duzeltmeleri`; başlangıç `HEAD...origin/main` 3/0. Başlangıçtaki üç korunan kirli dosya kapsam ve stage dışında kaldı.
- Kullanıcı izniyle yalnız PROMPTLAR.md’deki K3PD-09 allowlist satırı exact yollara çevrildi; K3PD-08 satırı değişmedi. Kartın exact kapsamı sekiz yol ile sınırlı.
- Eski HEAD kaynaklı VM replay’i DDA’da beş beklenen kusuru kırmızı yaptı. Güncel gerçek handler/UI çıktısı: iki yanlış sonrası normal MC 3 seçenek/3 düğme; kolay görev 2/2; sunulmuş yardım sonrası pencere veya streak değişse de doğru grade 2; yardımsız normal hızlı doğru grade 4. Undo, helper tekilleştirme ve restart temizliği geçti. Ladder build 5 çip/5 düğme kaldı.
- Bağımsız salt-okur denetçi kaynak, davranış, exact diff, state/log, hash, handler/schema/migration/pin sınırlarını inceledi ve `PASS` verdi. DDA 14, FSRS 24 vektör, queue 20 görev + 1000 interleave, resume 7 kontrol ve G0/G1 denetimi geçti.
- Perf kayıtları birlikte korunuyor: uygulayıcı varsayılanı göreli +25% bandını 8.572 ms ile 6.36 ms sınırında aştı; yavaş-host istisnası yalnız göreli bant içindi (runtime 135.996 KiB, CSS 15.877 KiB, content 184.591 KiB, p95 22.493 ms, steady 3.493 ms; mutlak 40 ms tavanı geçti). Denetçi izole varsayılanı geçti (p95 9.488 ms, steady 5.419 ms); flag’li tekrar p95 11.308 ms, steady 6.688 ms. `KAO2_WRITE_BASELINE` unset; baseline SHA-256 `302cfcc85422c346a62fb2e9b62df8a9f64c8ec362099adc5d40a35bce29d384` değişmedi.
- `App.kao*` 45; schema/migrate, FSRS parametreleri, A/B hash, içerik, pin ve kapsam dışı runtime dosyaları değişmedi. Korunan üç dosyanın başlangıç hash’i aynı. K3PD release approval `NOT_APPROVED`; eski K3P 37/37 kaydı ayrı.
- DURUM/KAYIT/EVIDENCE `done/PASS` ile eşlendi. Sıradaki `K3PD-10` yalnız adaydır; bu kart ona yetki vermez. Push/merge/tag/deploy veya görsel çekimi yapılmadı.

Sıradaki aday: K3PD-10 (bu PASS uygulama izni değildir; bu oturum burada durur).

K3PD-01 kapandı; onun PASS’i K3PD-02’ye çalışma izni değildi. Kullanıcının bu oturumdaki “sen karar ver devam et” yanıtı K3PD-02 için karar seçimini asistana devretti; asistan A’yı seçti, kullanıcıya doğrudan A atfedilmedi. K3PD-02 bağımsız salt-okur `PASS` ile yalnız karar/sözleşme kapsamı için kapandı. H4 runtime sayaç düzeltmesi, yeni ölçüm/cohort, cihaz/L2 kabulü ve yayın yapılmadı. Sonraki karta yetki verilmedi. Yeni yayın onayı `NOT_APPROVED`; K3PD-32 adayı ve ona özgü açık onay ile K3PD-33 olmadan push/merge/deploy yapılmaz.

## K3PD-02 — H4 karar ve ölçüm sözleşmesi

- Kullanıcı yanıtı (aynen, 2026-10-18): “sen karar ver devam et”. Bu, seçimi asistana devreden gerçek yanıttır; A seçeneği kullanıcının doğrudan seçimi olarak yazılmıyor.
- Asistanın bu yetkiyle seçtiği karar: **A — `daily.calib.s21={n, ok}` alanını koru; yeni kalıcı alan ve migration yok.** Eski sayaçlar düzeltilemeyeceği için yalnız kesim sonrası geçerli cohort ölçülür. Gerekçe: ikinci bir kalıcı sayaç ailesi ve migration yükü eklemeden mevcut alanı yeniden kullanmak; geçmişteki yanlış sayıları tarihsel gerçek gibi sunmamak.
- Alternatif B’nin tam şema etkisi: isteğe bağlı `quranLearn.daily[YYYY-MM-DD].calib.s21v2={n: nonnegative integer, ok: nonnegative integer, ok<=n}`. Alan ilk uygun yanıtta oluşturulur; geriye dönük doldurulmaz, eski `s21` değiştirilmez, v2 yokluğu sıfır geçerli gözlem sayılır ve rapor yalnız v2’yi okur. B seçilmedi; migration veya alan yaratma yetkisi yok.
- Uygunluk, cevap öncesi dondurulmuş kart durumu ile alınır: `s>=21`, orphan yok, `readerUnknown` yok. Cevap sonrası scheduled.s kullanılmaz. Yalnız Latin okunuşun o görevde gerçekten mevcut fakat kapalı kaldığı sunum uygundur.
- **folded:** okunuş desteği var, native disclosure kapalı ve cevap anına dek Latin görünür metinde ya da erişilebilir ad/ARIA bilgisinde açığa çıkmıyor. Uygun ve kabul edilmiş ilk cevapta `n` bir artar; doğru cevapta `ok` da bir artar, yanlış cevapta `ok` değişmez. Örnek: cevap öncesi `s=21`, kapalı okunuşlu cloze ve yanlış cevap → `n+1, ok+0`; aynı görevde doğru cevap → `n+1, ok+1`.
- **shown:** kullanıcı/klavye/ekran okuyucu native `<details>`’ı açtı veya Latin okunuş ARIA/erişilebilir adla cevap öncesi sunuldu. Bu görev gizli destek kohortunun payına/paydasına girmez. Açılma yalnız `ui` içinde tutulur; kalıcı alana yazılmaz.
- **disabled:** `settings.translit=false` nedeniyle Latin metni hiç sunulmuyor; bu folded koşulu değildir ve H4 pay/paydasından çıkarılır.
- **build:** K3P-19 seq53’teki gibi seçim çiplerinin Latin okunuşları durable kartlarda başlangıçta katlıdır. Ancak build her ara seçimi `pending` tutar; seçilen harf `kao-order-target` içine `kaoArabicPairHTML` folded argümanı olmadan çizilir ve Latin okunuş final yanıttan önce görünür. Bu yüzden build H4’e girmez; “seçim çipleri katlı” bilgisi build hedefindeki bu açığa çıkmayı iptal etmez.
- **cloze:** uyarıcı `pronunciationFolded=true` ile katlı çizilir; şıklar görev kartının durable/folded durumunu izler. Yalnız tüm ilgili yüzeyler cevap anına dek folded kalır ve seçenek/ARIA okunuşu sızdırmazsa girer; açılma veya sızıntı olursa shown sayılıp dışarıda kalır.
- Uygunluk ve “bu görevde açıldı mı” bilgisi görev başında dondurulur. Yeniden çizim ikisini sıfırlamaz veya cevap sonrası s ile yeniden hesaplamaz. Aynı aktif task ID için tekrarlanan cevap olayı idempotenttir. Undo, önceki günlük `n/ok` anlık görüntüsünü geri yükler; açılmış olma bilgisi aynı görev için korunur; yeniden cevaplama en fazla bir yeni gözlem yazar.
- H4 = `100 * ok / n`; `n` yalnız uygun folded görevlerin ilk kabul edilmiş cevaplarıdır ve doğru+yanlış cevapları içerir; `ok` bunların doğru altkümesidir. Hedef `>=85%`. Build, shown, disabled, orphan, readerUnknown ve cevap öncesi `s<21` görevleri paya/paydaya girmez.
- **Kesim:** `R`, bu sayaç düzeltmesinin gerçekten üretime çıktığı UTC takvim günüdür. R günü tamamen geçiş/legacy sayılır; aynı günde eski ve yeni sayaç karıştırılmaz. İlk yeni cohort günü kesin olarak `R+1 00:00Z`’de başlar. R henüz gerçekleşmedi ve K3PD yayın onayı `NOT_APPROVED`; bu yüzden burada takvim tarihi uydurulmaz. R öncesi günler raporda `LEGACY_INVALID` görünür; geçmiş silinmez, temizlenmez, backfill edilmez.
- Bu kart yalnız sözleşme/karar kaydıdır. H4 davranışını düzeltmez ve gerçek ölçüm PASS’i üretmez. Uygulama, regresyon ve rapor değişiklikleri K3PD-03 veya sonraki açık karta aittir; L2/cihaz kabulü ayrı kalır.

K3PD-02 karar kaydı ve bağımsız denetim tamamlanınca sıradaki aday K3PD-03’tür; bu bilgi tek başına çalışma izni değildir.

Sıradaki aday: K3PD-03 (bu PASS tek başına uygulama izni değildir).

## K3PD-03 — KART KAPANDI

- Başlangıç HEAD `6b393f35849b6ce524174a94a37ad49558d2d644`; dal `k3pd-denetim-duzeltmeleri`; `HEAD...origin/main` farkı 3/0.
- Runtime ve deney raporu düzeltmeleri, negatif sınamalar ve G0/G1 regresyonları geçti. H4 runtime testi 13 kontrol; deney raporu testi 7 hipotez, R+1 cohort sınırı, sızıntı 0, elle hesap 7/7 ve 7 hata yolu. Ölçüler `kanit/K3PD-03/EVIDENCE.md` içinde.
- Rapor aracına ayrı `--h4-baslangic YYYY-AA-GG` eklendi. H4 yalnız bu R+1 başlangıcından `--bugun` tarihine kadar hesaplanır; başlangıç yoksa H4 yüzdesi ve legacy toplamı çıkmaz, cohort'ta veri yoksa `0%` verilmez. `--kesim` H2/H7 içindir ve H4'ten bağımsızdır. `--ornek` sentetik cohort başlangıcını rapor başlığında belirtir.
- Önceki bağımsız `PARTIAL` bulgusunu yakalayan sentetik eski 9/10 + yeni 1/2 vakası, eski kodda hatalı `%83,3 (10/12)` verdi ve test exit 1 oldu; düzeltmede yalnız R+1 `%50,0 (1/2)` verildi, legacy `n=10` ayrıca gösterildi. Bugünden sonraki 4/4 satırı dışlandı.
- Kullanıcının aynı kartta rapor kaynağını ekleme onayıyla K3PD-03 allowlist'i `kao3-premium/araclar/deney-rapor.cjs` dahil 10 exact path içeriyor. Seq31 bağımsız denetimi gecikmiş eski `<details>` toggle olayının aynı ID’li yeni görevi yanlış `opened` işaretleyebildiğini buldu; sentetik negatif exit 1. Olay artık etkin task nesnesi, root ve bağlı disclosure düğümüyle eşleştiriliyor; yeni regresyon exit 0. Kart done/PASS; bağımsız seq33 denetimi tamamlandı.
- Gerçek `R` yayın tarihi/kullanıcı kohortu yok; canlı yedekte `--h4-baslangic` verilmedikçe H4 ölçümü kapalıdır. Sentetik Node/VM kanıtı gerçek browser/cihaz, ekran okuyucu veya L2 kabulü değildir.
- Korunan kirli `KAPANIS.md`, `README.md` ve `kanit/sonraki/GORSEL-KANIT.md` başlangıç hashleriyle aynı ve karta dahil değil. Eski K3P state/ledger/pinler değişmedi; `App.kao*` sayısı 45.
- Bağımsız denetim PASS ve K3PD-03 kapalıdır. Sıradaki aday K3PD-04; bu aday otomatik uygulama izni değildir. Burada dur. Push, merge veya deploy yapılmaz.

Sıradaki aday: K3PD-04 (bu PASS tek başına uygulama izni değildir).

## K3PD-04 — bağımsız PASS ile kapandı

- Kullanıcı kararı: A — Bütçeye göre böl. Exact allowlist dört yolla sınırlı; PROMPTLAR öz-düzeltmesi yalnız bu satıra ait.
- Bağımsız denetim: PASS. Seq35 append-only korundu; seq36 hatalı yer tutucu makbuzları ve gerçek komut tekrarlarını açıkça kaydetti.
- Bütçe: 5/10/15 dakika ve 6/30/60 saniye görev sürelerinde kapasite 50/100/150, 10/20/30, 5/10/15; 13 çekirdek görev 78/390/780 saniye.
- Kapanış sonrası doğrulamalar exit 0: durum kapısı (34 kart, nextPrompt K3PD-05), K3PD regresyonu (33 negatif + 34 K3PD + 6 legacy pin), eski K3P senkronu (37/37, null), production diff, whitespace ve 3 korunan hash.
- Durum: K3PD-04 done/PASS; sıradaki aday K3PD-05. Bu aday için kullanıcı promptu olmadan çalışma başlamaz.
- Sınırlar: üretim değişikliği 0. Cihaz, ekran okuyucu, L2 ve yayın kabulü bu kartta ölçülmedi.

Sıradaki aday: K3PD-05 (uygulama izni değildir).

## K3PD-05 — bağımsız PASS ile kapandı

- Başlangıç HEAD `cdf30ba83c9e08f044fb3761fab17c1ecf84f4e3`; dal `k3pd-denetim-duzeltmeleri`; başlangıç `HEAD...origin/main` 5/0.
- Süre tahmini cap ile kırpılmıyor: 13×30 sn=7 dk, 13×60 sn=13 dk; 24×6 sn=3 dk. Kaynak sırası oturum medyanı → açık etiketli 7 günlük yedek → açık etiketli 30 sn varsayılanı.
- Son 50 geçerli doğru+yanlış yanıtın medyanı yalnız UI oturumunda tutuluyor; tek ekleme noktası var. Yeni regular/lesson/mastery/repair oturumları geçmişi sıfırlar; etkin oturum resume’u korur. Yeni kalıcı alan, migration, şema veya `App.kao*` handler yok; adet 45.
- V/K/K/T, ilgili G2, G0+G1, sentetik regresyonlar ve bağımsız salt-okur denetim PASS. Korunan üç kirli dosya hashleri aynı kaldı ve karta/stage’e girmedi; eski K3P 37/37 / `nextPrompt=null` ayrı.
- Perf: geçerli sessiz-host p95 PASS 15.393 ms (≤40), steady 8.754 ms; baseline yazılmadı. Daha sonraki yoğun-host denemeleri 67.703 ve 41.043 ms ile başarısız oldu ve EVIDENCE/KAYIT’ta açıkça duruyor; eşik gevşetilmedi. 120 sn K2F-31 ölçüm tavanı korunmuş, üstündeki yanıtlar için medyanın doygunlaşma sınırı açık.
- Kullanıcının ayrı yönetici onayıyla canlı yayın engelleri düzeltildi: KAO/SW pinleri `20261019a`, sürüm fixture’ı eşlendi; Pages paketi `kao3-premium` plan/state dizinini dışlıyor ve staging guard bunu doğruluyor. Pages run `39253191803` / deploy commit `6ca8946a21dcba73b93603d71a651871a4def34a` success; canlı no-cache SHA-256 eşliği index, sw.js ve iki KAO modülünde geçti, K3PD DURUM.json public URL’si 404. Bu tek kart yayın izni, program geneli `releaseApproval=NOT_APPROVED` değerini veya K3PD-06 yetkisini değiştirmez.
- Kart `done/PASS`; state ve KAYIT son kayıtla eşleşiyor. Sıradaki aday K3PD-06’dır; bu aday çalışma izni değildir.

Sıradaki aday: K3PD-06 (bu PASS tek başına uygulama izni değildir).

## K3PD-06 — bağımsız PASS ile kapandı

- Başlangıç HEAD `27620d4fae1ef6c09f04ff54e33d0ed238be73eb`; branch `k3pd-denetim-duzeltmeleri`; `HEAD...origin/main` `0/0`.
- K3PD-04’te onaylanan A zaman bütçesi uygulanıyor: gerçek görev maliyetine göre ardışık parçalar, aynı çözülmemiş göreve resume ve görünür süre aşımı seçeneği. `quranLearn.js` mevcut `onboarding.minutes` alanına ve handler’ına bağlandı; yeni kalıcı alan, schema/migration veya App.kao* handler yok.
- K3PD-04’te onaylanan A kararı uygulanıyor. Gerçek maliyete göre parçalar hesaplanıyor; tam due kuyruğu warmup ve artan R sırasından geçiriliyor, mevcut en çok 20 review plan sınırı korunuyor. Parça sonu aynı çözülmemiş göreve döner; bütçe üstü devam görünür ve açık seçim ister.
- Önceki bağımsız denetimin seq48 `PARTIAL` bulgusu, 20+ due kartın tamamını Flow’a verip en düşük-R adayları plan sınırına kadar sıralayarak giderildi. Sentetik gerçek başlatıcı testi 60 due kartı (ilk 20 yüksek R, sonraki 40 daha düşük R) kuruyor; `test_k3p_budget.js` 11/11, `test_k3p_rhythm.js` 5/5 PASS.
- Tam G0+G1+G2 yeniden koşusu exit 0. İzole `KAO2_WRITE_BASELINE` kapalı perf: runtime `135.569 KiB`, CSS `15.877 KiB`, content `184.591 KiB`, p95 `6.317 ms`; A-9 `KAO2_EVIDENCE_OUT` kapalıyken `219/219` dosya exit 0, iç A-10 p95 `5.315 ms`.
- `App.kao*` sayısı 45. Pin freshness `61 fresh / 2 deferred / 0 blocking stale`; iki erteleme yalnız K3PD dalındaki izinli quranLearn çalışma ağacı değişikliklerine ait. `index.html`, `sw.js`, schema/migration ve üretim pinlerinde diff yok; üç korunan kirli dosyanın hash’i başlangıçla aynı ve kapsam/stage dışında.
- Çeldirici testinde 2,203 sentetik görev ve sıfır yinelenen seçenek PASS. Tarihsel sıra karşılaştırma tabanı mevcut değil; bu alt kanıt `UNVERIFIABLE`, PASS olarak sunulmuyor.
- Taze bağımsız salt-okur denetim `PASS` verdi. Denetçi 60-aday gerçek başlatıcı negatifini ve 11/11 sınamayı, resume/ödül, dakika ayarı ve açık overrun yollarını; G0+G1+G2 ve bağımsız A-9 `219/219` koşusunu yeniden doğruladı.
- Bağımsız A-10 ölçümü: runtime `135.569 KiB`, CSS `15.877 KiB`, content `184.591 KiB`, p95 `6.116 ms`. Kendi izole G1 perf koşumuz p95 `6.317 ms`; baseline yazılmadı. İki ölçüm de ≤40 ms.
- Tarihsel distractor sıralama baseline’ı bulunmadığı için o karşılaştırma `UNVERIFIABLE`; test edilen 2,203 görevde yinelenen seçenek yok. Bu K3PD-06 kabulünü engellemiyor.
- Kart `done/PASS`; kayıtlar aynı committe senkronlandı. Sıradaki aday K3PD-07’dir; bu PASS veya aday satırı uygulama izni değildir.
- Program yayın onayı `NOT_APPROVED`; K3PD-06 için push, merge, tag veya deploy yapılmıyor. Korunan üç kirli dosya stage/commit dışında kalıyor.

Sıradaki aday: K3PD-07 (bu PASS tek başına uygulama izni değildir).

Kanıt: [K3PD-06/EVIDENCE.md](kanit/K3PD-06/EVIDENCE.md).

## K3PD-07 — bağımsız PASS ile kapandı

- Başlangıç HEAD 9a0a4f7592657d8e4043d62e59507948854c26eb; dal k3pd-denetim-duzeltmeleri; başlangıç HEAD...origin/main 1/0.
- Sıkılma eşiği ve gerçek okunuş sunumu; DDA 7, pronunciation_fold 15, pronunciation contract 524/524, requirements hedefli 3.752 ms (<50 ms), build 7/7 ve cloze 7/7 ile son kaynak üzerinde doğrulandı. G0/G1 exit 0.
- İzole perf exit 0: içerik 184.591 KiB, runtime 135.809 KiB, CSS 15.877 KiB, p95 6.430 ms, steady 4.244 ms; baseline yazılmadı.
- Bağımsız salt-okur denetim PASS verdi. Eşik, ayar-kapalı DOM/ARIA, sibling disclosure, cloze ARIA, H4 UI izleyicisi, tam kapsam, 45 App.kao* ataması ve yasaklı pin/schema/migration sınırları geçti.
- Pin freshness 61 taze / 2 K3PD dalında ertelenmiş / 0 engelleyici. Korunan üç kirli dosyanın hash’i başlangıçla aynı ve stage dışında.
- Kart done/PASS; KAYIT seq60 ve state senkron. Tek mantıksal yerel commit oluşturulacak. Program releaseApproval NOT_APPROVED; push/merge/tag/deploy yapılmadı.

Sıradaki aday: K3PD-08 (bu PASS tek başına uygulama izni değildir).

Kanıt: [K3PD-07/EVIDENCE.md](kanit/K3PD-07/EVIDENCE.md).

## K3PD-08 — bağımsız PASS ile kapandı

- Başlangıç HEAD `f2d1041de315954356f85c80b3e5379e1b536b2a`; dal `k3pd-denetim-duzeltmeleri`; `HEAD...origin/main` `2/0`.
- Kullanıcının açık izniyle yalnız PROMPTLAR.md içindeki K3PD-08 allowlist satırı exact yollara çevrildi; diğer kart satırları değişmedi.
- Üç ardışık yanlışta yeniden tanış paneli, doğrulanmış `kaoIntroExample` kaynağından Arapça/okunuş/Türkçe/künye örneği çiziyor. Eksik, doğrulanmamış veya bozuk örnek için içerik uydurulmuyor; anlam yedeği korunuyor. Dinleme düğmesi yalnız mevcut `kaoAudioEnabled` izniyle görünür ve mevcut `App.kaoPlay` yolunu kullanır.
- Geri alma snapshot’ı yalnız geçici UI’de sonuç penceresi ve yanlış sayacını saklıyor; undo bunları yanıt öncesine döndürüyor. Kalıcı alan, schema/migration veya yeni App handler eklenmedi.
- Kırmızı kanıt: eski kaynakla `test_k3p_dda.js` üçüncü yanlışta beklenen doğrulanmış örnek yerine `undefined` verdi ve exit 1 oldu. Son kaynakta DDA 9 kontrol, feedback-copy, pronunciation contract 524/524 ve a11y 14 kontrol exit 0.
- G0 ve G1 koşuları tamamlandı; G1’de perf göreli taban bandı makine ölçümünde iki kez aşıldı (steady 8.289/13.029 ms; limit 6.360 ms). Planın izin verdiği `KAO2_ACCEPT_SLOW_HOST=1` koşusu exit 0: p95 19.032 ms, steady 10.306 ms; mutlak 40 ms sınırı ve boyut tavanları geçti, baseline yazılmadı. Bu göreli ölçüm istisnası görünür kalır.
- İlgili G2 lesson-flow 24/24 ve lesson-ayah 5/5 exit 0. `App.kao*` sayısı 45; 61 asset pini taze, iki önceden ertelenmiş K3PD pini aynı kaldı; şema/migration/pin/shell dosyalarında diff yok.
- Korunan üç kirli dosyanın başlangıç SHA-256 değerleri eşleşti; dosyalar karta/stage’e alınmadı.
- Bağımsız salt-okur denetim `PASS` verdi; 2/3 yanlış eşiği, doğrulanmış içerik, bozuk alan fallback’i, ses izni, undo, hedef testler, G0/G1 ve kapsam sınırları doğrulandı.
- Kart `done/PASS`; DURUM/KAYIT `nextPrompt=K3PD-09` ile eşleşiyor. K3PD-09 yalnız adaydır, uygulama izni değildir. Yayın onayı `NOT_APPROVED`; push/merge/tag/deploy yapılmadı.

Kanıt: [K3PD-08/EVIDENCE.md](kanit/K3PD-08/EVIDENCE.md).

Sıradaki aday: K3PD-09 (bu PASS uygulama izni değildir).


## K3PD-10 — bağımsız PASS ile kapandı

- İlk bağımsız FAIL’in bulgusu seq68’de korundu; boş doğrulanmış anlam için R2’ye düşüp boş başlık gösterme giderildi. Anlamsız build görevi kurulmaz, gerçek oturum/ders practice UI kuyruğuna alınmaz; FSRS ve günlük notlama değişmez.
- Bağımsız VM ölçümü: build/R3/A, tr>ar, isNew/retry korunuyor; “Anlamı: -den, -dan” görünür, harekeli/harekesiz cevap ilk HTML’de yok. 274 uygun verified lemma, eksik birincil anlam 0. Ladder A=522/1000, 32 build; B/R1 build dışı; kaygı 5 çip/5 düğme.
- Kart testleri ve bağımsız tekrarlar PASS. Bağımsız perf: p95 17.434 ms, steady 8.250 ms; KAO2_WRITE_BASELINE unset, baseline değişmedi. Yalnız göreli bant slow-host istisnası; mutlak tavanlar geçti. Tarihsel distractor-sıralama tabanı bulunmadığından yalnız eski sıralama karşılaştırması UNVERIFIABLE; K3PD-10 kabul ölçütü değil.
- App.kao* 45; schema/migrate/pin/content/FSRS/A-B sınır diff’i yok. Üç korunan kirli dosyanın hash’i aynı ve stage dışında. K3PD release NOT_APPROVED; eski K3P 37/37 ve tarihsel onayı ayrı.
- Bağımsız salt-okur denetim PASS; kart done/PASS. Yayın/push/merge/tag/deploy/görsel yok. K3PD-11 yalnız adaydır.

Kanıt: [K3PD-10/EVIDENCE.md](kanit/K3PD-10/EVIDENCE.md)

## 2026-10-20 — açık kullanıcı onayıyla A adayının yayını

- Yayımlanan aday: a6c5961dbf19a652b8bd7d57cedee1271249ad22; beş commit, origin/main ve Pages hedefi https://mustafaras.github.io/s/. Kullanıcı beş commit’i, üç korunan kirli dosyanın hariç tutulmasını ve K3PD-32/33 sıra istisnasını açıkça onayladı.
- gh run watch 39429528599 --exit-status: exit 0; aynı SHA için validate ve deploy PASS. Uzak main SHA’sı adayla aynı.
- index.html, sw.js, panel.html, panel-v2.html, SW offline allowlist’i ve bağlı CSS kaynaklarından çıkarılan 68 public statik URL no-cache/no-store GET ile HTTP 200 ve yerel SHA-256 eşliği verdi.
- Sınırlama: index.html/sw.js pinleri 20261019a olarak kaldı. Kurulu offline Service Worker aynı URL’lerde önceki quranLearn baytlarını sunabilir; mevcut browser/device istemci güncellemesi doğrulanmadı.
- K3PD-32/33 kartları yapılmış sayılmadı; nextPrompt=K3PD-11. Yayın onayı yalnız SHA A ve kayıtlı exact scope içindir. Korunan üç dirty dosya aynı hash’lerle dışarıda; tag yok, diğer remote ve seyma-data kullanılmadı. Yayın makbuzu R yalnız bu dalda yerel tutuluyor.
