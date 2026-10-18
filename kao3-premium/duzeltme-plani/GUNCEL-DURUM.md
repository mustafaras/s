# K3PD güncel durum

- Program: aktif; K3PD-00, K3PD-01 ve K3PD-02 bağımsız denetim `PASS` ile kapandı.
- K3PD-02 başlangıç HEAD'i: 9cceec923a4833046a12b28f3ca2c6dbeff71dd5; dal `k3pd-denetim-duzeltmeleri`, origin/main farkı 2/0.
- Çalışma dalı: `k3pd-denetim-duzeltmeleri`.
- Eski K3P: 37/37 tamamlandı; eski `nextPrompt=null` ve `releaseApproval=APPROVED-2026-10-18` tarihsel kaydı değişmedi.
- K3PD-00: `done`; README'de tarihsel 82 ile güncel 83 test + 4 yardımcı/fixture ölçümü ayrıldı; bağımsız yeniden denetim `PASS`.
- K3PD-01: pin erteleme adaptörü, exact allowlist ve sentetik dal/durum/yol matrisi tamamlandı; hedefli regresyonlar ve G0 geçti; bağımsız salt-okur hüküm `PASS`.
- K3PD yayın onayı: `NOT_APPROVED`; cihaz/ekran okuyucu/L2/230 kayıt/çalışma/uzak eşlik kapıları `pending`.
- Önceden kirli `KAPANIS.md`, `README.md` ve `kanit/sonraki/GORSEL-KANIT.md` korunuyor; K3PD kapsamı ve stage dışında.
- Pinli üretim varlıkları ve sürüm değerleri değişmedi; `App.kao*` handler sayısı 45.

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
