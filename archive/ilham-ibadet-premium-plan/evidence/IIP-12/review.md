# IIP-12 · review gate

İnceleyen: `copilot` · Yöntem: sentetik/headless (VM + kaynak okuma) · Cihaz/ekran okuyucu/tarayıcı/yayın **kapsam dışı**.

## Açık bulgular

- Açık **CRITICAL**: 0
- Açık **HIGH**: 0

Yani kapanış ölçütü sağlanmıştır. Aşağıdakiler kayıt içindir.

## Bulgular ve sonuçları

### IIP12-REV-01 · orta · çözüldü
**Bulgu:** İlk `SAYGI_DAILY_SOURCES` sürümünde "Âyet vitrini" kaynağının CTA'sı
`App.setFaithTab('oz')` idi. Kart **zaten** Bugün (`oz`) sekmesinde gösterildiği
için bu **no-op**'tur — kullanıcı düğmeye basar, hiçbir şey olmaz.
**Çözüm:** CTA gerçek yüzeye çevrildi: `App.openQuranJourney()` (vitrin âyeti bu
kartın içinde yaşar ve o handler ile açılır). Fixture'a "iki kaynağın CTA'sı da
gerçek yüzey açar" bekçisi eklendi.

### IIP12-REV-02 · yüksek · çözüldü
**Bulgu:** İlk `SAYGI_QURAN_ACTIVE_STATUSES` kümesi **bekleme** durumlarını
(`submitting`, `queued`, `notified`, `awaiting_reply`, `validating_reply`) da
"devam" sayıyordu. Bunlar kullanıcı için devam edilecek bir şey değildir ve
**aynı sekmedeki** `quran-journey-card` bunları zaten gösterir — yani "Devam"
satırı yanıltıcı ve gereksiz bir ikinci kopya olurdu. Ayrıca `watched` durumunda
`App.openQuranJourney()` açmak yanlış yüzeydir (durak zaten izlenmiş).
**Çözüm:** Küme yalnız gerçek bırakılan yerlere daraltıldı:
`{ready, watching, watched}`. Durum→eylem yönlendirmesi eklendi:
`watched→quranJourneyQuestion()`, `ready→quranJourneyWatch()`,
`watching→openQuranJourney()`. Fixture'a 4 beklem durumu + `question_opened`
olumsuz kontrolü ve 3 yönlendirme kontrolü eklendi. Mutasyonla doğrulandı.

### IIP12-REV-03 · orta · çözüldü
**Bulgu:** İlk taslak `sg-daily-focus*` ve `sg-continue*` gibi **yeni CSS
sınıfları** üretiyordu; ancak `app/styles.css` bu kartın izin listesinde
değildir. Bu, IIP-11 REV-03'ün (hedeflenen ama stillenmemiş sınıf) birebir tekrarı
olurdu — kod "çalışır" ama görsel olarak bozuk kalırdı.
**Çözüm:** Yeni sınıf tamamen kaldırıldı; hub katmanı **stilli mevcut** deseni
yeniden kullanır (`saygi-source-card` + `saygi-link-thumb/copy/label/sub/arrow`).
Buton font eşitlemesi (`font:inherit`) satır içi verilir. Bekçi eklendi: fixture
"CSS'siz yeni sınıf bırakılmadı" ve kullanılan her sınıfın `.stilleri` olduğunu
CSS'ten doğrular; mutasyonla test edildi.

## Kapsam kararı: "Geç / başka içerik" eylemi

`specs/03` diyor ki: *"«Başka bir içerik» eylemi eklenecekse oturum içi seçimdir,
günlük tamamlanma veya streak üretmez. Bu ek eylem IIP-12 kapsam kararına yazılır."*

**Karar: bu kartta eklenmedi.** Gerekçe:

1. REQ-023/TC-023 sözleşmesi bunu **gerektirmez** (yalnız tek öneri + determinizm
   + dürüst boş hâl ister).
2. `app.js` izinli değildir; oturumluk "geç" seçimi yeni bir `App.*` üyesi
   gerektirirdi ve bu, sabit `App.*` yüzeyini (720) büyütürdü.
3. Alternatif seçim sunmak, henüz **kabul edilmiş tek bir öneri kaynağı** varken
   sahte bir çeşitlilik izlenimi yaratırdı.

Kaydedilen sonuç: eylem, `app.js` izinli olduğunda (veya `saygi.js` oturumluk
`ui.saygiFocusSkip` alanı genişletildiğinde) aynı `SAYGI_DAILY_SOURCES` üzerinden
eklenebilir; mimari buna hazırdır.

## Kapsam kararı: tematik seçki içeriği

`specs/03` "altı tema arasında döner" der; ancak `04-ICERIK-STRATEJISI.md` kesin
olarak *"bu planla içerik yazılmış/onaylanmış değildir"* ve *"Yeni katalog dosyası
açma yetkisi vermez"* der. **İçerik uydurulmadı**; öneri yalnız kabul edilmiş
kataloglardan (100 öncü + âyet vitrini) gelir. Tema döngüsü IIP-16 içerik
kabulünde açılır.

## Korunan sözleşmeler (regresyon denetimi)

| Sözleşme | Sonuç |
|---|---|
| IIP-09 bilgi mimarisi (`iip-09-*`, rota sahipliği) | 22/22 PASS |
| IIP-11 okuyucu etkileşimleri | 55/55 PASS |
| `saygiPreviewCardHTML` çıktısı bit bit aynı (pinlenmiş sha256) | 20/20 PASS |
| IIP-10 arama/filtre | 61/61 PASS |
| Modal klavye sözleşmesi | PASS |
| `App.*` yüzeyi 720'de sabit (yeni üye yok) | PASS |
| `onclick=` sayısı değişmedi | PASS |

## Sınır beyanı

Bu inceleme **sentetik/headless**'tır. Gerçek tarayıcı render'ı, cihaz ölçümü,
ekran okuyucu (VoiceOver/TalkBack) ve yayın doğrulaması **yapılmamıştır** ve bu
receipt'in kapsamı dışındadır. Görsel kabul yalnız sentetik render artifact'ı
(`render-matrix.html`) üzerindendir.
