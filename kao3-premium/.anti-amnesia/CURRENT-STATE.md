# K3P · CURRENT-STATE

Sıradaki prompt: K3P-25

## Son durum

- **Tarih:** 2026-10-17.
- **Son tamamlanan:** **K3P-24 — İlerleme ekranı: üç sade ölçü + yaldızlı sûreler + katlanan ayrıntılar.** 34/37 kart bitti.
- **Yetki:** kullanıcı K3P-24'ü "tam ve kusursuz" uygulamamı istedi. Yalnız yerel commit; yayın ayrı kayıtla ve açık onayla yürür.
- **Kanıt:** kaynak/headless ve sentetik veri. Tarayıcı, gerçek hesap, kişisel veri deposu, görsel QA veya cihaz kabulü yok.

## K3P-24 ne yaptı

- **Üç sade ölçü (K-H, TASARIM §3.5 · ANALIZ E-5):** ekranın tepesinde tek liste (`kao-stats-metrics`) —
  1. **Kur'an kapsamı %** (`%N` + "N / 524 lemma"),
  2. **Yaldızlı sûreler ×/20** — bir sûre **BÜTÜN lemmaları biliniyorsa** yaldızlı sayılır (yarısı değil; `kaoGildedSurahCount`),
  3. **Bu hafta gün/5** (`kaoWeeklyDone`; haftalık şeritle aynı kaynak).
  Eski "Tanıdık kelime" cümlesi ve kapsam eğrisi anlatısı ölçüye dönüştü; eğri listesi ve "sıradaki hedef" ipucu korundu.
- **Tezhip küçük resimleri:** 20 kısa sûre, **K3P-11 bileşeninin küçük boyu** olarak çizilir (`tezhipPage({compact:true})`).
  Sayfa hafif kalsın diye her küçük resim sûrenin yalnız **İLK âyetini** ve en çok **8 kelimesini** gösterir (kırpılır);
  süs SVG'si işaretlemede kalır (öksüz seçici yok) ama koda taşınan `.kao-tezhip.is-compact .kao-tezhip-orn` ile gizlenir.
  Bütün kelimeleri bilinen sûre `is-gilded` ile işaretlenir.
- **Ayrıntılar katlanır:** kalibrasyon **tablosu** + algı özeti + gece karşılaştırması + aktarım satırı tek
  `<details>Ayrıntılar</summary>` altına indi. **Veri yokken bölüm HİÇ çizilmez** (tablo da yok). Doğruluk satırları
  (Son 2/6 hafta) katlanmadan görünür kalır — bir ölçü gibi okunur. İç içe `<details>` yok.
- **Ceza dili yok:** ekranda seri/kayıp/baştan dili hiç yok; hem metin taraması hem boş+dolu render testle sabitlendi.
- **Motor:** `kaoProgressModel`'e **saf türetim** eklendi — `gilded` (`{count,total}`), `thumbs` (sûrebaşı ilk âyet),
  `weekly` (`kaoWeeklyDone`). Yan etki yok, `data` şeması ve `migrate()` değişmedi (I1–I6); **yeni `App.kao*` YOK (45 sabit)**;
  yeni etkileşim eklenmedi, `onclick=` sayısı değişmedi.
- **CSS payı kural SİLEREK açıldı** (bütçe kuralı §2): öksüz `.kao-coverage` (3 seçici + dar ekran girdisi),
  kullanılmayan `.kao-progress-count` (2 kural), ölü `.kao-today h2`. Yeni bölüm/h3 grupları **mevcut seçici listelerine**
  eklendi; kalan yeni kurallar yalnız `kao-metric*`, `kao-tezhip-grid`, `kao-thumb*`, `is-compact`.
- **Test:** `test_kao2_progress` **20 → 21 kontrol** (üç ölçü; yaldızlı sayaç yalnız tam kapsamda; boş veride tablo ve
  Ayrıntılar yok; veri varken tek katlanan blok; 20 küçük resim; ceza dili taraması). Envanter **81 sabit** (yeni dosya yok).

## Ölçü panosu

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L9 (bağlayıcı) | **132,059 KiB** | 136 KiB; kalan ~3,9 KB |
| **CSS gzip L9** | **15,877 KiB** | 16 KiB; kalan **126 B** — **kritik** |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| Kontrast çifti | 756/756 PASS | 0 hata |
| KAO fixture envanteri | 81 | 81 PASS |

## Kapılar ve açık sınırlar

- `kapi-hizli --kart K3P-24` → **yeşil** (kapanış raporunda ölçüldü). `test_kao2_reader` + `test_kao2_migration` PASS;
  `kao-verify-contrast` **756/756**.
- Ölçüm: CSS **15,877 KiB** (bütçe 16 KiB, pay **126 B**), runtime **132,059 KiB** (tavan 136).
- `tests/app/test_asset_pin_freshness.js`: `app/core/quranLearn.js`, `app/core/quranLearnViews.js` ve `app/kao.css`
  `pinDeferral.files`'ta → **ERTELENDİ** diyerek PASS (K-P). `app/core/quranLearnViews.js` bu kartta `pinDeferral.files`'a **eklendi** (K-P, T-1): dosya pinned bir asset'tir ve `?v=` yalnız K3P-27'de yükselir; kapı bunu eksik yakaladı, beyan edildi.
- **CSS bütçesi kritik:** kalan pay ~126 B. Yeni bir kart CSS kuralı ekleyecekse önce ya aynı işi gören eski kuralı silmeli
  ya da §5 gereği durmalı.
- **Açık:** görsel QA (`KAO_QA_CHROME`), ekran okuyucu turu, dokunmatik cihaz kabulü ve Tezhip denetimi **K3P-26**'da kullanıcıda.

## Ara yayın (K3P-23 + K3P-24)

- Kullanıcı 2026-10-17'de "sıradaki adımı tam ve kusursuz bi şekilde uygula ve tümünü canlıya al" dedi; bu iki kart için
  ara yayın pin istisnası açıkça verildi (**final `releaseApproval` değişmedi**, tag yok).
- Pin **20261016c → 20261017a** (`index.html`, `sw.js`, `panel-v2.html`; `SW_OFFLINE_VERSION` `iip22-20261017a`);
  pini sabitleyen 12 test dosyası aynı değerle güncellendi. `pinDeferral.files` boşaltıldı.
- Tam kapı `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → **exit 0, TÜM KAPILAR YEŞİL** (KAO 81, app 78,
  panel 23, panel-v2 27, quran 9, reminders, driver, zikr, kontrast; p95 13,444 ms / steady 4,246 ms).
- Ölçüm: runtime **132,059 KiB**, CSS **15,877 KiB** (pay 126 B), içerik 184,591 KiB.

## Devir notu

K3P-24 uygulandı ve ara yayın hazırlığı yapıldı. Sıradaki kart **K3P-25** (Dalga 4 sonu).
Kişisel veri/gerçek hesap tarayıcısı açma; `mustafaras/seyma-data` kapsam dışıdır.
