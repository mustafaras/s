# KAO · Bağımsız uygunluk denetimi (plan ↔ uygulama)

**Tarih:** 2026-09-26 · **Denetlenen:** `kuran-ogreniyorum` = `origin/main` = `7693528` (KAO-D6) · **Denetçi:** Claude (Opus 5.5), bağımsız; EVIDENCE/HANDOFF/LEDGER/AUDIT iddialarına güvenilmedi, her madde koddan ve yeniden çalıştırılan kontrollerden doğrulandı.
**Yöntem sınırı:** Üretim kodu, içerik, STATE ve eski kanıtlar **değiştirilmedi**. Tüm deneyler `$TMPDIR/…/scratchpad` altındaki `git archive HEAD` kopyalarında yapıldı. Tarayıcı açılmadı, ağa yazılmadı.
**Çalışma ağacı notu:** Denetim sırasında çalışma ağacında commit'lenmemiş, KAO dışı bir değişiklik vardı (`app.js`, `app/core/messaging.js`, `sync.js`: ÆON mail tetiği). Bu yüzden bütün hükümler **HEAD `7693528`'in temiz kopyasına** dayanır; çalışma ağacının etkisi ayrıca O-10'da raporlandı. Denetim bitmeden bu değişiklik paralel bir oturumca `58e0ceb` olarak `main`'e commit'lendi. KAO dosyalarına dokunmuyor ve KAO bulgularını değiştirmiyor.

---

## 1. Hüküm

**"Tam ve kusursuz" iddiası doğrulanmadı.** Headless test aileleri HEAD'de yeşil: kao 14/14, app 76/76, panel 23/23, panel-v2 27/27, quran 9/9, driver, zikr 95/95 ve plan-check. Buna rağmen testlerin görmediği yerlerde plandan sapmalar ve içerik hataları var. Bunların bir kısmı yayındadır. **1 KRİTİK** bulgu var: kısa sûre ve Fâtiha kelime anlamları, "yalnız referans, kopyalanmaz" diye işaretli quran.com katmanından üretim modülüne birebir kopyalanmış ve atıf verilmemiş. **4 YÜKSEK** bulgu var: "bilinen kelime" ve kapsam tanımı sapmış, ters yön kartı hiç yok, yayındaki içerikte 26 İngilizce anlam var, 26 başlık kelimesi yanlış yalıtık biçimde. Bunlara 11 ORTA ve 6 DÜŞÜK bulgu ekleniyor. Matris **145** atomik gereksinim içerir. Dağılım: **TAM 86 · TESTSİZ 4 · KISMİ 31 · EKSİK 10 · ÇELİŞKİLİ 2 · KULLANICI-KARARI 9 · ATLANDI-GEREKÇELİ 3**.

---

## 2. Kritik bulgular (önem sırasıyla)

Her bulgu iki ayrı yoldan doğrulandı (kod okuma + çalıştırma/sayım).

### KRİTİK

**K-1 · Kısa sûre ve Fâtiha kelime anlamları quran.com referansından üretime kopyalanmış (lisans/atıf, 06 §2, D-02).**
- Kanıt 1 (kod): `tools/kao-content-freeze.mjs:156,161,187` → `tr: translated.tr`. `translated` değeri `lexicon.reference.json`'dan gelir (`referenceMap()`, satır 115).
- Kanıt 2 (sayım): Üretilmiş `app/content/quranShortSurahsV1.js` ile referans karşılaştırıldı: **618/618 kelimenin `tr` alanı referansla birebir aynı.** Fâtiha (`prayerTexts.fatiha`) ve kaynağı `"QAC lemma + D-12 verified Quran.com Turkish word reference"` olan tamamlayıcı sözlük kayıtları da aynı yoldan geliyor.
- Referansın kendi meta verisi şöyle: `"scope":"reference-only"`, `"note":"Doğrulayıcı REFERANSI; kopyalanmaz, üretim paketine girmez (06 §2). Atıf zorunlu."` Modülün `ATTRIBUTION.sources` alanında Tanzil, QAC ve Diyanet var, **quran.com yok**.
- Başarısızlık senaryosu: Modül `main`'de ve Pages'te yayında (`git ls-remote` → `7693528`). Üçüncü taraf çevirisi, lisansı belirsiz ("QUL TR wbw: Belirtilmemiş", 06 §2) ve atıfsız hâlde herkese açık depoda dağıtılıyor. Plandaki "asla" kuralı (06 §2, 11 K5) ihlal ediliyor.
- Düzeltme: 618 + 29 kelime ve tamamlayıcı sözlük için kendi Türkçe karşılığı üretilsin (D-12 doğrulayıcı). Dondurma aracına "referansla birebir eşitse fail" kapısı eklensin. Geçiş süresince ATTRIBUTION'a quran.com eklenip kullanıcıdan lisans kararı alınsın.
- Sorumlu kart: KAO-06 (üretim), KAO-16b (Fâtiha/prayerTexts).

### YÜKSEK

**Y-1 · "Bilinen kelime" ve kapsam tanımı plandan sapmış; kullanıcıya ve gözlemciye şişik ilerleme gösteriliyor (02 §3).**
- Plan: "bilinen = her iki yönde de `state=review && s ≥ 21`".
- Kod: `app/core/quranLearn.js:1252-1256` `kaoKnownLemmaSet`. Bir kart `reps>0 || state==='review'` ise kelime "bilinen" sayılıyor, yani tek bir **yanlış** cevap bile yetiyor. Bu küme şu yerleri besliyor: E1 kapsamı (`:1527`), hub kartındaki "N kelime tanıdık", E9 ≥%95 âyet kapısı (`:1271`), panel `coveragePercent/knownWords` (`:1427`) ve CSV.
- Kanıt (365 günlük simülasyon, gerçek `kaoStart/kaoAnswer`, doğruluk 0,9): kod tanımıyla **524 bilinen / %77,42 kapsam**, plan tanımıyla **0**. 60 günlük yoklamada panel `coveragePercent:77, knownWords:524` gösterirken plan eşiğini geçen yalnız 344 tek-yönlü kart vardı.
- Mutasyon M10: tanım plana çevrildiğinde `test_kao_requirements`, `test_kao_render` ve `test_kao_panel_projection` **düşüyor**. Yani testler sapmış davranışı sabitliyor.
- Senaryo: Kullanıcı 53 günde 524 kelimeyi bir kez görür (günde 10 yeni) ve %77 "tanıyorsun" mesajı alır. E9, kelimeleri yalnız görülmüş âyetleri "anlayabildiğin âyet" diye sunar. Gözlemci panel aynı şişik sayıyı görür.
- Düzeltme: `kaoKnownLemmaSet` plan tanımına geçsin (Y-2 düzeltildikten sonra iki yön; o zamana kadar mevcut yönde review ∧ s≥21). Üç test plan tanımına göre yeniden yazılsın.
- Sorumlu kart: KAO-10 (E1), KAO-28 (kaoCoverage), KAO-19 (panel).

**Y-2 · Her lemma yalnız tek yönde kart alıyor; ters yön (L2) hiç oluşmuyor (02 §1, 05 §2 kart kimlikleri).**
- Kod: `quranLearn.js:766` `var direction=index%2?'tr>ar':'ar>tr';`. Çift sıradaki lemma yalnız `ar>tr`, tek sıradaki yalnız `tr>ar` kartı alıyor.
- Kanıt: 365 günlük simülasyonda `lemmasSeen=524`, **`lemmasBothDirections=0`**, kart sayısı 530 (planın beklediği ≈1.100 değil).
- `test_kao_queue.js:197-217` "her gün iki yön" kuralını **oturum düzeyinde** arıyor; kelime düzeyinde iki yönü doğrulayan test yok. D2'nin "yön dengesi 365 günlük fixture ile kapandı" iddiası yalnız bu zayıf anlamda doğru.
- Senaryo: "rabb"i Arapçadan tanıyan kullanıcı Türkçeden Arapçaya geri çağırmayı (L2) hiç çalışmaz. Karşısındaki lemma için bunun tersi geçerli.
- Düzeltme: Yeni lemma iki kart üretsin (`ar>tr` önce, `tr>ar` en erken ertesi gün). Testte kelime düzeyinde "365 gün sonunda iki yönlü lemma oranı" iddiası olsun.
- Sorumlu kart: KAO-09/KAO-11 (onarımı KAO-16b'de yapılmıştı).

**Y-3 · Yayındaki Türkçe içerikte İngilizce anlamlar (D-12 "verified" etiketiyle).**
- Kanıt (katı İngilizce kelime listesiyle sayım): `quranShortSurahsV1.words` içinde **20** kayıt var. Örnekler: `s-114-6-2="the jinn"`, `s-113-2-2="(the) evil"`, `s-114-5-4="(the) breasts"`, `s-107-5-4="their prayers"`, `s-104-4-4="the Crusher"`, `s-97-1-4="(the) Night"`. Tamamlayıcı sözlükte **6** kayıt daha var (`ls_qabor="the graves"` …). Ana sözlükte 0.
- Senaryo: Seviye 1 çapa metinleri olan Nâs ve Felak okuyucusunda (E6) ve E9'da kullanıcı Türkçe yerine İngilizce görür. Kaynağı K-1'deki kopyadır.
- Düzeltme: K-1 ile birlikte. Dondurmaya "Türkçe olmayan anlam" kapısı eklensin, `test_kao_lexicon_contract`'a dil kontrolü yazılsın.
- Sorumlu kart: KAO-06.

**Y-4 · Başlık kelimelerinde bağlamdan taşınmış şedde ve eksik yazım (Arapça doğruluk kapısı, 08 "İçerik doğruluğu").**
- Kanıt: 524 lemmanın **26**'sında ilk harf şeddeli. Bu, önceki kelimenin lâm/tenvin idgamından gelen bağlam şeddesidir ve yalıtık biçimde yanlıştır: `رَّحِيم, نَّاس, مُّبِين, دُّنْيَا, لَّيْسَ, نَّبِىّ, رَّحْمَٰن, مَّاتَ, مُّسْتَقِيم, مَّغْفِرَة, صَّمَد, …`. Bunlardan `l_m_a_a_fb0e46` başlığı `مَّشَ` (okunuş "maşa"). Fiilin sözlük biçimi `مَشَى`; son harf eksik, şedde fazla. Tamamlayıcı sözlükte de aynı hata var (`تِّين`, `زَّيْتُون`).
- Senaryo: E5'te, "Arapçayı seç" seçeneklerinde ve CSV'de kelime, Kur'an'da hiç yalıtık geçmeyen bir biçimde öğretilir. Okunuş satırı (`rahîm`) ise şeddesiz; görsel ile ses/okunuş çelişir.
- Düzeltme: Başlık biçimi QAC `lemmaBw`'den üretilsin (form değil). Derleme aracına "başlıkta ilk harf şeddesi yok" ve "okunuş ↔ Arapça hece uyumu" kapıları eklensin.
- Sorumlu kart: KAO-03/KAO-05 (sözlük), KAO-06 (tamamlayıcı).

### ORTA

**O-1 · R-A2'nin "aynı çeldirici aynı hedefte ardışık iki tekrarda gelmez" kuralı üretimde etkisiz.**
- `quranLearn.js:349-350` önceki çeldiricileri yalnız `opts.previousDistractors` ya da `card.lastDistractors` üzerinden okuyor. `lastDistractors=` ataması **0** (grep). `kaoBuildTask` bu seçeneği hiç geçirmiyor.
- `test_kao_requirements.js` seçeneği **enjekte ederek** geçiyor, bu yüzden 1.000 oturumda ihlal 0 çıkması üretim yolunu kanıtlamıyor.
- Düzeltme: Cevap anında `card.lastDistractors` yazılsın; testi `kaoStart/kaoAnswer` üzerinden kurulsun. Kart: KAO-09.

**O-2 · `data.quranLearn` sınırsız büyüyor (05 §2 "daily son 90 gün", STATE `stateBudgetKB:100`).**
- `ensureQuranLearn` (`:1629-1686`) `daily`'yi budamıyor. Simülasyon: 90. gün **139,1 KB**, 180. gün 174,4 KB, 365. gün **241,2 KB** (352 daily satırı).
- Her cevapta `save()` → `SeySync.schedule` ile tüm `latest.json` itiliyor.
- Düzeltme: `daily` 90 gün tutulsun (kalibrasyon toplamları ayrı bir `calibTotals`'a devredilsin); boyut bütçesi fixture'ı eklensin. Kart: KAO-07/KAO-13.

**O-3 · Kilometre taşlarının 5/6'sı hiç kazanılmıyor (03 §10, KAO-10 adım 3).**
- `milestones.fatiha/namaz/half/twoThirds/eighty` için atama yok; yalnız `shortSurahs` var (`:892`).
- 365 günlük simülasyon sonunda 6 alanın 6'sı da `null`. E1 ve hub her zaman `'İlk kilometre taşı: Fâtiha'` gösteriyor (`:418-423`). 03 §10'daki konfeti ve "hub'da kalıcı satır" hiç tetiklenmiyor.
- Kart: KAO-10/KAO-13/KAO-28.

**O-4 · Kısa sûre dondurma hattı HEAD'de kırık (tekrar üretilebilirlik).**
- `cf5e0d7` `lexicon.verified.json`'u değiştirdi ama `tools/kao-content-freeze.mjs:19` sabit SHA-256'yı (`cf65aa…`) güncellemedi. Güncel dosya `16a159…`.
- Temiz kopyada `--freeze-surahs` → `Error: lexicon.verified.json: sha256 uyuşmuyor`.
- Pin yalnız scratch kopyada düzeltilince çıktı repodakiyle **bayt-bayt aynı** çıktı; içerik doğru, hat kırık. Kart: KAO-16b.

**O-5 · Mutasyon kör noktaları (bölüm 5.h).**
- M09: günlük yeni sınırı `dailyNew+5` yapıldı, **hiçbir test düşmedi**.
- M04: undo sırasında `errors` geri sarımı kaldırıldı, **test düşmedi**.
- Oturum içi "yanlış kart bir kez daha gelir" (02 §2.10) için test yok.
- M10'da testler plandan sapmış davranışı sabitliyor (Y-1).

**O-6 · Ses lisansı atfı dağıtılan yüzeyde yok.**
- 1.678 klibin kaynağı `FaisaI/tadabur`, lisansı **CC BY-NC 4.0** (+ AQQD CC0).
- Atıf yalnız `kuran-ogreniyorum/content/audio-manifest.json`'da. Bu klasör `.github/workflows/pages.yml:85`'te Pages'ten hariç tutuluyor. `app/*` ve `index.html`'de "tadabur" geçmiyor.
- CC BY görünür atıf ister. Kart: KAO-24/KAO-17 (E7'de "Kaynaklar" satırı).

**O-7 · R-A5 anlam komşuları sözlükten değil, koda elle yazılmış.**
- `quranLearn.js:40-65` `KAO_SEMANTIC_CLUSTERS`: 12 küme, 79 lemma kimliği. Sözlük modülünde `semNeighbors` alanı yok.
- D1'in "524/524 proposed:true" bulgusu hâlâ açık. Kart: KAO-02/KAO-09.

**O-8 · Belgelenmemiş bütçe aşımları.**
- `quranLearn.js` **1.790 satır / 164 KB**, 05 §1 hedefi ≤800 satır.
- `app/kao.css` **39.606 B**, hedef ≤18 KB.
- Dört içerik modülünün ham toplamı **453,5 KiB**, hedef 06 §5 / `targets.contentBudgetKB` 410. Gzip aşımı ayrıca kullanıcı kararıdır.
- Hiçbir kanıt ya da kapanış belgesinde bu üçü kabul edilmemiş.
- Sözlük bütçesinde çelişki var: 05 §1 "≤260 KB" diyor, KAO-15 promptu "340 KB" (bkz. ÇELİŞKİLİ satırları).

**O-9 · Arapça metin plan yazı tipi yığınıyla çizilmiyor (04 §4 Tipografi).**
- `.kao-arabic-text{font-family:serif}` (`app/kao.css:23`). Bu sınıf görev, okuyucu ve kelime ekranlarının ortak sınıfı.
- `"Noto Naskh Arabic","Amiri","Scheherazade New"` yığını yalnız `.kao-ph-letter>span`'de var.
- Kur'an işaretlerinin (۟ ۡ ۢ ٰ) genel serif yedeklemesinde doğru çizilip çizilmediği **cihazda doğrulanmalı**. Kart: KAO-10/KAO-18.

**O-10 · Çalışma ağacındaki KAO dışı değişiklik kardeş kapıları kırıyor.**
- Commit'lenmemiş ÆON değişikliğiyle `tests/app` 70/76. Kırılanlar: `test_modularization_boundary` (app.js 7.862 > 7.800), `test_v3_welcome` (App 557 ≠ 556), `test_app_surface_daily_boundary` (593), `test_fx2_overlay_motion`, `test_fx2_tab_transition`, `test_fx2_touch_coverage`.
- HEAD'de altısı da geçiyor. Bu KAO kusuru değil. Değişiklik bu hâliyle commit'lenirse KAO'nun ortak kapıları kırmızıya döner. Sahibi: ÆON işi.
- **Denetim sırasında kapandı:** paralel bir oturum değişikliği pinleri güncelleyerek `58e0ceb` olarak commit'ledi (dal `main`). KAO dosyalarına dokunmuyor. `58e0ceb`'de `tests/app` 77/77, `tests/kao` 14/14 PASS. Bulgu yalnız kayıt amaçlı duruyor.

**O-11 · Süreç kuralları.**
- Tek-commit kuralı (S7) **9 kartta** ihlal: KAO-02×10, KAO-03×5, KAO-01×3, KAO-15×3, KAO-16/16b/18/20/25×2.
- KAO öneki taşımayan `a9fa40c` ve `ecc7ac7` KAO dosyalarını değiştirmiş. `ecc7ac7` (`quranLearn.js`, `kao.css`, pin) **hiçbir KAO kanıtında geçmiyor**; plan-check yalnız `KAO-xx:` commit'lerini taradığı için bunları görmez.
- Dalga kapısı "sıradaki prompt yalnız `pass` ile açılır" diyor. D1, D5 ve D6 planda olmayan `findings` durumuyla geçilmiş.

### DÜŞÜK

- **D-1 · Belge tutarsızlıkları (bölüm 5.i).**
  - `kuran-ogreniyorum/README.md` hâlâ "Üretim kodu 0/0 … Bekleyen: KAO-P00" diyor.
  - CURRENT-STATE "Açık kararlar: (yok)" diyor; KAPANIŞ §6 ve CLAUDE.md iki açık karar sayıyor (gzip, K3).
  - KAPANIŞ §1 "sonraki commit'ler … yayın bekliyor" diyor, ama `origin/main` 2026-09-26 15:03'te `7693528`'e push edilmiş. Bu push LEDGER'da (son satır 101) ve `releaseApprovalRecord`'da (yalnız KAO-06) kayıtlı değil.
  - 05 §5 "FSRS-4.5 vektörü (19)" diyor; port ts-fsrs v4.5.2 = FSRS-5 parametreleri.
- **D-2 · Kuyruk sayıları.**
  - Gramer üst sınırı kodda 4 (`:333`), plan ≤3 (05 §6, KAO-09).
  - Serpiştirme kuralı gramere uygulanmıyor. Simülasyonda en uzun aynı-tür dizisi 4, ihlal 3.
  - 02 §2.4 "oturum 12–16 görev" ile 05 §6 "due ≤60" çelişiyor. Gözlenen oturum uzunluğu 0–89.
- **D-3 · Vakıf işaretleri silinmiş.** 1.563 sözlük örneğinin 377'sinde vakıf/durak işaretleri silinmiş (işaretler çıkarılınca 1.563/1.563 Tanzil'de birebir). D-02 "yalnız kesilir, değiştirilmez" ile küçük sapma; R-A6 okuyucuda karşılanıyor.
- **D-4 · Sahipsiz plan maddeleri.** Hiçbir karta ya da R-id'ye bağlanmamış, uygulanmamış maddeler: 02 §5.3 (soldurma yalnız s≥30), §5.6 ("bağ kur" görevi), §5.7 (hata taksonomisi → kuyruk ağırlığı, "en çok karıştırdıkların" satırı), §5.8 (niyet önerisi), §5.10 (haftalık aktarım testi), 04 §4 FX (haptik, doğru-cevap sesi, `countUp`, konfeti, `.sey-enter`), 10 §9 (kova B/C algı doğruluğu raporu).
- **D-5 · Şema ve sayaçlar.** Kart şeması uzun anahtar kullanıyor (`state/reps/lapses/predictedR/interval`); 05 §2 sync bütçesi için `st/n/l` öngörüyordu. `errors.cognate` ve `errors.sound` hiç artmıyor. Soldurma (R-B5) learning kartlarında da çalışıyor.
- **D-6 · Küçük içerik uyumsuzlukları.**
  - `l_bad_ala_16265e` 2:181 örneğinde kelime/okunuş sayısı uyuşmuyor.
  - 6 homograf parçacığın frekansı (mâ, lâ, men, lev, len, umm) QAC POS toplamlarıyla uzlaşmıyor; diğer 518/524 bağımsız sayımla eşit.

---

## 3. İzlenebilirlik matrisi

Kısaltmalar: QL = `app/core/quranLearn.js`. Test yolları `tests/kao/` altında (aksi yazılmadıkça). "Doğrulama" sütunundaki S = simülasyon (`kao-sim.js`), U = UI yoklaması (`kao-ui-probe.js`), C = içerik kontrolü (`kao-content-check.js`), M = mutasyon (bölüm 5.h), R = aile koşusu.

### 3.1 Bağlayıcı ek gereksinimler (12)

| Kimlik | Kaynak | Gereksinim | Kart | Uygulama | Koruyucu test | Doğrulama | Durum | Not |
|---|---|---|---|---|---|---|---|---|
| R-A1 | 12 §A | targetBed'den önceki 90 dk ≤8 review gece tekrarı; nightRev | 09,10,20 | QL:396, :849-853 | requirements (targetBed 23:30, gece yarısı) | R PASS; M07 yakalandı | TAM | |
| R-A2a | 12 §A | Çeldirici havuzu review∧s≥21, aynı POS, farklı kök | 09 | QL:346-360 | requirements 1.000 oturum | M01 yakalandı | TAM | |
| R-A2b | 12 §A | Aynı çeldirici aynı hedefte ardışık iki tekrarda gelmez | 09 | QL:349-350 (yalnız okuma) | requirements (enjekte `previousDistractors`) | grep `lastDistractors=` 0 | KISMİ | O-1 |
| R-A3 | 12 §A | daily.calib + 10 R-bandı + 2/6 hafta tutunma | 08,13,20 | QL:903-906, :1437 | user_tasks --report | R PASS, ECE 0,0131 (sentetik) | TAM | |
| R-A4 | 12 §A | İlk 2 sunumda otomatik ses; sessiz saatte yok; ≤150 ms | 11,17 | QL:776-779, :936-946 | requirements | M05 yakalandı | TAM | |
| R-A5 | 12 §A | Doğrulanmış semNeighbors; komşu yeni kartlar ≥3 gün | 02,09 | QL:40-65 (elle kümeler), :289-299 | requirements 1.000 oturum | sözlükte `semNeighbors` 0 | KISMİ | O-7, D1 bulgusu açık |
| R-A6 | 12 §A | Vakıf işaretleri renkli düğme + açıklama | 06,16 | QL okuyucu, `waqfMarks` | render (vakıf) | R PASS | TAM | |
| R-A7 | 12 §A | G0.5 fiil önce gelir + `errors.order` | 04,13 | QL:717, grammar `g0_5` | requirements | R PASS | TAM | |
| R-A8 | 12 §A | ≥60 kök kalıp etiketli Türkçe türev | 02,04,14 | QL:513, grammar `unit11` | requirements:161 | R PASS | TAM | |
| R-A9 | 12 §A | Satır aralığı/kelime boşluğu/renkli hareke; 3 ton × 2 tema kontrast | 15,17,18 | QL:467-471, kao.css | requirements; kao-verify-contrast | 328/328 PASS | TAM | |
| R-B1 | 12 §B | 114 hücre ısı haritası, aria, metin listesi | 28b | QL:1352 | render (114 hücre) | U: E10 ok | TAM | |
| R-B2 | 12 §B | Namazda ne diyorum; içerik doğrulanmış | 06,16b | QL:1395, prayerTexts | render E11 | K-1: Fâtiha anlamları kopya; okunuşlar elle | KISMİ | K-1 |
| R-B3 | 12 §B | E5 üç dokunuş katmanı | 14 | QL:589 | render | R PASS | TAM | |
| R-B4 | 12 §B | Oturum sonu tek sayı; puan/XP yok | 13 | QL:794-797 | requirements | U: "puan" yalnız olumsuzlamada | TAM | |
| R-B5 | 12 §B | Review kartında soldurma `--dur-5`, reduced-motion | 17 | QL:788, kao.css | render | kod: `!task.isNew` (learning dâhil) | KISMİ | D-5 |
| R-B6 | 12 §B | 13 SVG, currentColor, ≤4 KB | 23,26 | assets/kao/svg | phonics_contract | R PASS | TAM | |
| R-B7 | 12 §B | Kognat rozeti simge+metin | 11,14 | QL:780-784 | render | R PASS | TAM | |
| R-B8 | 12 §B | Dokun yavaş / basılı doğal; Enter/Space, Shift+Enter | 11,17 | QL:809 | requirements | kod okundu (`event.shiftKey`) | TAM | |
| R-C1 | 12 §C | Hata bildir → `flagged{at,kind}`; panel flaggedCount | 14,19 | QL:604, :1428 | panel_projection | R PASS | TAM | |
| R-C2 | 12 §C | Ses olmadan tam oturum | 11,26 | QL sessiz mod | user_tasks (c), privacy | R PASS | TAM | |
| R-C3a | 12 §C | Geri al: kart+daily bit-bit | 11 | QL:924-934 | requirements (bit-bit) | R PASS | TAM | |
| R-C3b | 12 §C | Geri al errors sayaçlarını da geri sarar (uygulama iddiası) | 11 | QL:930 | — | M04 KAÇTI | TESTSİZ | O-5 |
| R-C4 | 12 §C | CSV Blob, Anki başlığı | 17 | QL:984-996 | privacy, requirements | R PASS | TAM | |
| R-C5a | 12 §C | Görev geçişi <50 ms, hedefli DOM | 11,20 | QL paintTask | requirements, user_tasks | p50 0,085 ms | TAM | VM ölçümü |
| R-C5b | 12 §C | 4 modül gzip ≤130 KB | 20 | — | user_tasks (160 KB tavan) | 159.932 B | KULLANICI-KARARI | KAPANIŞ §6.1 |
| R-C5c | 12 §C | İlk açılışta ses indirilmez (`preload=none`) | 11,20 | QL:940, :1286 | privacy, user_tasks | M12 yakalandı | TAM | |
| R-C6 | 12 §C | 7 gün sonra 5 soruluk test, ≥4/5 | 16,28b | QL:881-895 | requirements | R PASS | TAM | |
| R-C7 | 12 §C | 114 sûreye hazır şema | 07 | QL:1629 | migration (114 sûre) | U: migrate idempotent | TAM | |
| R-C8a | 12 §C | Panel yalnız izinli anahtarlar, kelime düzeyi yok | 19 | manifest:580-588 | panel_projection | M13/M14 yakalandı; U: snapshot sızıntı yok | TAM | |
| R-C8b | 12 §C | Panel kapsam % ve bilinen kelime doğru | 19 | QL:1427 | — (test sapmayı sabitliyor) | U: panel 77 %/524 | KISMİ | Y-1 |
| R-C9a | 12 §C | Üç kullanıcı görevi headless | 20 | user_tasks | user_tasks | R PASS | TAM | |
| R-C9b | 12 §C | Cihazda ≤90 sn vb. | 22 | — | — | cihaz kabulü kullanıcıda | KULLANICI-KARARI | K3 |

### 3.2 Plan belgeleri

| Kimlik | Kaynak | Gereksinim | Kart | Uygulama | Koruyucu test | Doğrulama | Durum | Not |
|---|---|---|---|---|---|---|---|---|
| DOC02-§1-L2 | 02 §1 | Ters yön ayrı kart | 09,11 | QL:766 | queue:197 (yalnız oturum) | S: iki yönlü lemma 0/524 | EKSİK | Y-2 |
| DOC02-§2.2a | 02 §2.2 | Günlük yeni 5/10/15 | 09,17 | QL:318-323 | queue:48 (zayıf) | S newMax 10; M09 KAÇTI | TESTSİZ | O-5 |
| DOC02-§2.2b | 02 §2.2 | Tekrar limiti 60 | 09 | QL:317 | queue:47 | S dueMax 42 | TAM | |
| DOC02-§2.2c | 02 §2.2 | İkili sonuç + tepki süresi → 4 grade | 08 | QL:219 | fsrs | R PASS | TAM | |
| DOC02-§2.3 | 02 §2.3 | 9 görev türü, klavye yok | 11-13,16 | QL:38, görev üreticiler | queue, render | grep: `<input` yok | TAM | |
| DOC02-§2.4 | 02 §2.4 | Oturum 12–16 görev, %50/25/15/10 | 09 | QL:300 | — | S: 0–89 görev | ÇELİŞKİLİ | 05 §6 due≤60 ile |
| DOC02-§2.10 | 02 §2.10 | Yanlış kart aynı oturumda 1 kez daha | 11 | QL:915 | — | kod okundu | TESTSİZ | |
| DOC02-§3 | 02 §3 | Kapsam = Σfreq(bilinen)/77.430; bilinen = iki yön review∧s≥21 | 10,28 | QL:1252-1262 | render/requirements sapmayı sabitliyor | S: kod 77,42 % ↔ plan 0 | KISMİ | Y-1 |
| DOC02-§4 | 02 §4, §2.11 | Puan/lig yok; yumuşak seri | 13 | QL:794 | requirements | U | TAM | |
| DOC02-§5.1 | 02 §5.1 | İki sayaç (kelime kapsamı + anlaşılan âyet) | 10,28 | QL:1523-1535 | render | U: E1 ok | TAM | Değerler Y-1'den etkilenir |
| DOC02-§5.3 | 02 §5.3 | Soldurma yalnız s≥30 review | — | yok | — | grep `>=30` 0 | EKSİK | D-4 |
| DOC02-§5.6 | 02 §5.6 | Her 5 yeni kelimede "bağ kur" görevi | — | yok | — | grep 0 | EKSİK | D-4 |
| DOC02-§5.7 | 02 §5.7 | Hata taksonomisi → kuyruk ağırlığı; "en çok karıştırdıkların" | — | yalnız panel topSoundClass | — | grep 0 | EKSİK | D-4 |
| DOC02-§5.8 | 02 §5.8 | Uygulama niyeti (namaz sonrası öneri) | — | yok | — | grep 0 | EKSİK | D-4 |
| DOC02-§5.10 | 02 §5.10 | Haftalık yeni âyet aktarım testi | — | yok | — | grep 0 | EKSİK | D-4 |
| DOC03-§2 | 03 §2 | Kapı (a) ≥18 ∧ (b) ≥10; ses yoksa (b) ertelenir | 15 | QL:485 | render:284-290 | R PASS | TAM | |
| DOC03-§9 | 03 §9 | ≈530 lemma, %80 token kapsamı | 02-05 | sözlük 524 | lexicon_coverage | C: Σfreq 59.948 = %77,42 | KISMİ | D1 bulgusu, kapanışta açık |
| DOC03-§10 | 03 §10 | 6 kilometre taşı + kutlama + hub satırı | 10,13 | QL:418, :892 | — | S: 6/6 null | EKSİK | O-3 |
| DOC04-§1 | 04 §1 | Overlay şablonu, onModalKeydown, odak dönüşü | 10 | QL:1549 | render (Tab/Escape) | R PASS | TAM | |
| DOC04-§2 | 04 §2 | 11 ekran | 10-28b | QL view gövdeleri | render | U: 15 görünüm boş+60 gün ok | TAM | |
| DOC04-§4a | 04 §4 | Yalnız token renkleri; `:root` yok | 10,18 | kao.css | contrast aracı | grep hex/rgb 0, `:root` 0 | TAM | |
| DOC04-§4b | 04 §4 | Arapça yığın Noto Naskh/Amiri/Scheherazade | 10 | kao.css:23 `serif` | — | grep | KISMİ | O-9 |
| DOC04-§4c | 04 §4 | FX: haptik, tap sesi, countUp, konfeti, .sey-enter | — | yok (yalnız sheetClose) | — | grep 0 | EKSİK | D-4 |
| DOC04-§4d | 04 §4 | ≥44 px, odak 3:1, aria-live, kapalı kelime etiketi | 18 | kao.css, QL | render (KAO-18) | R PASS | TAM | 26 px yalnız etkileşimsiz rozet |
| DOC04-§4e | 04 §4 | prefers-reduced-motion + uygulama ayarı | 17,18 | kao.css (2 blok), QL kaoMotionAllowed | render | R PASS | TAM | |
| DOC04-§4f | 04 §4 | %200 metin, 320 px reflow | 18 | — | — | cihaz gerekir | KULLANICI-KARARI | K3 |
| DOC04-§5 | 04 §5 | App.kao* yüzeyi, ölü handler yok | 10-27 | app.js:3910 (35 shim) | fx2 pinleri, boundary | grep: tanımlı 35 = kullanılan 35 | TAM | kaoNightReview/SkipGate birleştirilmiş |
| DOC05-§1a | 05 §1 | Sözlük ≤260 KB | 05,15 | 320.208 B | lexicon_contract (≤340 KB) | wc | ÇELİŞKİLİ | 05 §1 ↔ KAO-15 promptu |
| DOC05-§1b | 05 §1 | Gramer ≤60, sûre ≤90, fonetik ≤40 KB | 06 | 51.353 / 83.276 / 9.552 B | phonics_contract | wc | TAM | |
| DOC05-§1c | 05 §1, D-09 | Ses ≤16 MB | 24 | 10.950.329 B | — | manifest + du | TAM | |
| DOC05-§1d | 05 §1 | quranLearn.js ≤800 satır | 10-28 | 1.790 satır | — | wc | KISMİ | O-8 |
| DOC05-§1e | 05 §1 | kao.css ≤18 KB | 10-28 | 39.606 B | — | wc | KISMİ | O-8 |
| DOC05-§1f | 05 §1 | Dört yükleme listesi aynı commit | 05-07 | index.html, driver, zikr, rebind | boundary, rebind | R PASS | TAM | |
| DOC05-§1g | 05 §1 | Yükte saf registry; fail-closed register | 07 | QL:66-80 | boundary, independence | R PASS | TAM | |
| DOC05-§2a | 05 §2 | Şema alanları; idempotent; orphan, silme yok | 07 | QL:1583-1686 | migration | M06 yakalandı; U 5 bozuk vaka idempotent | TAM | |
| DOC05-§2b | 05 §2 | Kısa kart anahtarları (st/n/l) | 07-08 | QL:152-154 (`state/reps/lapses`) | — | kod | KISMİ | D-5 |
| DOC05-§2c | 05 §2 | daily son 90 gün | 07,13 | yok | — | S: 365. günde 352 satır | EKSİK | O-2 |
| DOC05-§2d | 05 §2, STATE | Durum ≈90–100 KB üst sınır | 07 | — | — | S: 139 KB @90 g | KISMİ | O-2 |
| DOC05-§2e | 05 §2 | MIGRATE_DEPENDENCIES + try satırı | 07 | state.js:30, :156 | rebind | R PASS | TAM | |
| DOC05-§3a | 05 §3 | Yolculuk "izlendi" rozeti (salt-okur) | 14 | QL:541 | render | R PASS | TAM | |
| DOC05-§3b | 05 §3, 04 §1 | Yolculuk "anlaşıldı" notu, Esmâ kök notu | 21 | — | — | KAO-21 HANDOFF:13 | ATLANDI-GEREKÇELİ | Prompt "atla ve raporla" diyor |
| DOC05-§4a | 05 §4 | Ağ yalnız aynı-origin assets/kao | 11,17 | QL kaoPlay | privacy | R PASS | TAM | |
| DOC05-§4b | 05 §4, D-10 | Mikrofon bellek-içi, ≤10 sn, revoke, varsayılan kapalı | 27 | QL:1202-1248 | privacy (gölgeleme) | R PASS | TAM | plan-check uyarısı elle incelendi |
| DOC05-§4c | 05 §4, 10 §8 | Kur'an Arapçası için TTS yok | tüm | QL `SeyAudio` 0 | plan-check yasak ifade | grep | TAM | |
| DOC05-§4d | 05 §4 | Panel manifest satırı | 19 | manifest:95 | panel_projection | R PASS | TAM | |
| DOC05-§5 | 05 §5 | FSRS 19 parametre, R=0,90, grade eşlemesi | 08 | QL:33-37, :173, :219 | fsrs (24 vektör ±1e-6) | R PASS | TAM | "4.5" etiketi → D-1 |
| DOC05-§6a | 05 §6 | due≤60, yeni≤dailyNew, parça≤2 | 09 | QL:300-345 | queue | S: fragmentMax 2 | TAM | dailyNew sınırı TESTSİZ (§2.2a) |
| DOC05-§6b | 05 §6 | Gramer ≤3 | 09,12 | QL:333 (4) | queue (4 tür) | S grammarMax 4 | KISMİ | D-2 |
| DOC05-§6c | 05 §6 | Ardışık aynı tür ≤2 | 09 | QL:336 (gramer muaf) | queue | M02 yakalandı; S maxRun 4 | KISMİ | D-2 |
| DOC05-§6d | 05 §6 | Deterministik tohum | 09 | QL daySeed/seededRank | queue | R PASS | TAM | |
| DOC05-§7 | 05 §7 | Görev geçişinde tam render yok | 11 | QL paintTask | requirements | R PASS | TAM | |
| DOC05-§8 | 05 §8 | Fixture ailesi + pin güncellemesi + shell ≤+30 | P00-22 | tests/kao (14) | R | shell gate PASS (7.799) | TAM | |
| DOC06-ilke | 06, K5 | Arapça yalnız korpus/araçtan | 01-06 | sözlük/sûre modülleri | — (Tanzil karşılaştırma testi yok) | C: örnek 1.563/1.563, sûre 618/618 Tanzil'de | TESTSİZ | Girdiler repoda değil |
| DOC06-§1 | 06 §1 | Girdiler repoda yok; sha256 kapısı | 01 | .gitignore | self-test | QAC sha eşit; `--stats` kapısı PASS | TAM | |
| DOC06-§2a | 06 §2, D-01 | QAC atıfı | 05 | ATTRIBUTION | — | modülde var | TAM | |
| DOC06-§2b | 06 §2, D-02 | Tanzil verbatim, yalnız kesit | 03,05 | örnekler | — | C: 377 örnekte vakıf silinmiş | KISMİ | D-3 |
| DOC06-§2c | 06 §2 | Meal/kelime-kelime referans kopyalanmaz | 03,06 | freeze:156-187 | — | C: 618/618 birebir | KISMİ | **K-1** (sözlükte kopya 0) |
| DOC06-§2d | 06 §2, D-04 | ts-fsrs MIT atfı | 08 | QL:1-20 | fsrs | kod | TAM | |
| DOC06-§3 | 06 §3, D-12 | verifiedBy/At, import tutarlılığı 0 | 03 | lexicon.verified.json | — | kopyada `--import-md`: 524/524, consistency 0 | TAM | Sonuç kalitesi → C-03/C-04 |
| DOC06-§4 | 06 §4 | Kararlı lemma kimliği; orphan | 05,07 | QL markOrphans | migration | M06 | TAM | |
| DOC06-§5 | 06 §5, targets | Ham içerik ≤410 KB | 05,06 | 464.389 B | — | wc | KISMİ | O-8 |
| DOC06-D13 | 06 §3.1, D-13 | ≥3 örnek ya da kalıcı istisna | 03 | sözlük | lexicon_contract | R PASS | TAM | |
| DOC06-DET | 06 §1 | Dondurma deterministik | 05,06 | tools | — | Sözlük/gramer/fonetik bayt-eş; sûre hattı pin hatası | KISMİ | O-4 |
| DOC08-kapı | 08 | Teknik kapılar | tüm | — | aileler | R: hepsi PASS (HEAD) | TAM | fx-coverage exit 1 KAO öncesinden |
| DOC08-ped | 08 | 4 haftalık gerçek veri ölçütleri | 20,22 | QL stats | — | gerçek veri yok | KULLANICI-KARARI | |
| DOC08-kal | 08, R-A3 | Kalibrasyon farkı ≤%5 | 20 | QL stats | user_tasks | ECE 0,0131 (sentetik) | TAM | Gerçek veriyle değil |
| DOC10-§2 | 10 §2 | 28 harf 3 kova, B/C harflerinde çift | 23 | fonetik modülü | phonics_contract | R PASS | TAM | |
| DOC10-§6 | 10 §6 | 7 telaffuz görev türü | 26,27 | QL:1057+ | phonics_contract (6 tür + gölgeleme) | R PASS | TAM | |
| DOC10-§7 | 10 §7 | İki katmanlı okunuş (okunuş + DİA) | 15,17 | QL:428 | requirements (DİA 524/524) | M11 yakalandı | TAM | |
| DOC10-§8a | 10 §8 | AAC, ≥2 okuyucu, 524×2 + 618 + çift | 24 | assets/kao/audio (1.678) | privacy | manifest: 1.048/618/12 | TAM | |
| DOC10-§8b | 10 §8, D-08 | Kaynak/lisans atfı | 24 | yalnız manifest (Pages dışı) | — | grep app/* "tadabur" 0 | KISMİ | O-6 |
| DOC10-§9 | 10 §9 | Kova B/C algı doğruluğu raporu | — | yok | — | grep | EKSİK | D-4 |
| DOC11-§1 | 11 §1 | Yalnız KAO dosyaları; IIP'ye dokunma | tüm | — | independence | a9fa40c/ecc7ac7 KAO dışı commit | KISMİ | O-11 |
| DOC11-§2a | 11 §2 | Hub kartı tek satır bileşim; kart yoksa bayt-eş | 21 | saygi.js:49 | independence | M15 yakalandı | TAM | |
| DOC11-§2b | 11 §2 | `settings.kaoVisible` | 21 | QL, settings.js | render | R PASS | TAM | |
| DOC11-§3 | 11 §3 | Test bağımsızlığı | tüm | tests/kao | independence | R PASS | TAM | |
| DOC11-§4 | 11 §4, K9 | LOCAL-ONLY dal, onaysız yayın yok | tüm | — | — | kullanıcı onaylı yayın (D6) | KULLANICI-KARARI | |

### 3.3 Değişmezler (UYGULAMA-PROMPTLARI §1 S1)

| Kimlik | Gereksinim | Doğrulama | Durum | Not |
|---|---|---|---|---|
| K1 | Bağımsızlık; saygi.js yalnız KAO-21'de ≤3 satır | saygi.js izi a9fa40c'de (D5) | KISMİ | O-11 |
| K2 | Tek `data.quranLearn` kökü | migration, U | TAM | |
| K3 | App.kao* + ui.kao*; overlay şablonu | render; handler 35/35 | TAM | addEventListener yalnız Audio nesnesinde |
| K4 | fetch yalnız assets/kao; localStorage/SeySync yok | privacy, plan-check | TAM | |
| K5 | Arapça hafızadan yazılmaz; verified:false giremez | C | KISMİ | K-1, Y-3, Y-4 |
| K6 | Dört liste | boundary, rebind | TAM | |
| K7 | Yeni renk markası yok; `:root` yok | grep | TAM | |
| K8 | DATA SAFETY | kanıtlarda ihlal izi yok | TAM | |
| K9 | Push/merge/deploy yetkisiz değil | STATE APPROVED, kullanıcı talimatı | KULLANICI-KARARI | |
| K10 | fx2 yorum tuzağı | D3 + fx2 aileleri PASS | TAM | |
| K11 | Her Arapça birimde görünür okunuş | pronunciation_contract; U | TAM | |

### 3.4 İçerik doğruluğu (bölüm 5.a)

| Kimlik | Gereksinim | Doğrulama | Durum | Not |
|---|---|---|---|---|
| C-01 | Sözlük örnekleri Tanzil'de birebir | 1.563/1.563 (vakıf hariç) | TAM | Test yok → DOC06-ilke TESTSİZ |
| C-02 | Frekans QAC ile tutarlı | 518/524 bağımsız sayımla eşit | KISMİ | 6 homograf doğrulanamadı |
| C-03 | Başlık kelimesi doğru yalıtık biçim | 26 bağlam şeddeli başlık (مَّشَ dâhil) | KISMİ | Y-4 |
| C-04 | Anlamlar Türkçe | 20 + 6 İngilizce | KISMİ | Y-3 |
| C-05 | Okunuş ↔ kelime hizası | 1 örnek uyumsuz | KISMİ | D-6 |
| C-06 | ۟ sessiz harf okunuşa geçmez | 421 vaka; örneklem `ulâ'ika` doğru; phonics_contract ۟ testi | TAM | |

### 3.5 Süreç, kararlar, yayın

| Kimlik | Gereksinim | Doğrulama | Durum | Not |
|---|---|---|---|---|
| S6 | Her kartta EVIDENCE + HANDOFF | 30/30 + P00; D1–D6 AUDIT.md | TAM | 16b sonrası şema farklı |
| S7 | Kart başına tek commit | 9 kart çok commit | KISMİ | O-11 |
| DG | Dalga kapısı yalnız `pass` ile açılır | D1/D5/D6 `findings` | KISMİ | O-11 |
| D-01 | QAC atıf | ATTRIBUTION | TAM | |
| D-02 | Tanzil verbatim + ref + link | K-1 ve D-3 dışında | KISMİ | |
| D-03 | Ayrı kao.css | var | TAM | |
| D-04 | FSRS saf JS + MIT | var | TAM | |
| D-05 | Lisans yapısı | kullanıcı kararı | KULLANICI-KARARI | |
| D-06 | Geçici giriş → hub kartı | KAO-21 | TAM | |
| D-07 | Seviye 6 program dışı | şema hazır | ATLANDI-GEREKÇELİ | |
| D-08 | Ses kaynağı/lisans | CC BY-NC seçimi kullanıcı onaylı | KULLANICI-KARARI | Atıf → O-6 |
| D-09 | Ses ≤16 MB alt küme | 10,44 MiB | TAM | |
| D-10 | Gölgeleme varsayılan kapalı | privacy | TAM | |
| D-11 | Sıra eşiği | superseded (POS kapısı kök nedeni) | ATLANDI-GEREKÇELİ | |
| D-12 | YZ doğrulaması, insan teyidi yok | kullanıcı kararı | KULLANICI-KARARI | Sonuç kalitesi Y-3/Y-4 |
| D-13 | Seyrek lemmada örnek kuralı | lexicon_contract | TAM | |
| PUB-1 | Pin bütünlüğü (index.html = sw.js = test_iip_22) | `?v=20260925n` cf5e0d7'de geldi, sonrasında KAO dosyası değişmedi | TAM | Fonetik `20260924b` |
| PUB-2 | Yayınların kaydı | 7693528 push'u LEDGER/STATE'te yok | KISMİ | D-1 |
| DOCS | STATE/CURRENT/LEDGER/KAPANIŞ/CLAUDE/AGENTS/README tutarlı | 4 tutarsızlık | KISMİ | D-1 |

**Dağılım (145 satır):** TAM 86 · TESTSİZ 4 · KISMİ 31 · EKSİK 10 · ÇELİŞKİLİ 2 · KULLANICI-KARARI 9 · ATLANDI-GEREKÇELİ 3.
Plan içi çelişkiler: DOC02-§2.4 ↔ 05 §6; DOC05-§1a ↔ KAO-15 promptu; ayrıca R-C5 "4 modül gzip ≤130 KB" ↔ 06 §5 "üç dosya ≤410 KB, gzip ~120 KB" (R-C5b satırında kullanıcı kararı olarak ele alındı).

---

## 4. Kart bazlı tablo

"Kapsam" sütunu, commit'in dosyalarının STATE `cards[].files` izin listesinde olup olmadığını gösterir. Kontrol bağımsız bir betikle yapıldı (glob → regex, bütün `KAO-xx:` commit'leri).

| Kart | Commit(ler) | Kapsam | Kanıt sapmaları / not |
|---|---|---|---|
| P00 | 70923c4 | ok | — |
| 01 | 544d245, 3113d3c, f1e89d7 | ok | 3 commit (S7). stats: token 77.429 (plan 77.430, fark belgeli) |
| 25 | aee9ec2, 8145a2e | ok | 2 commit; öz-test bugün 16/16 |
| 02 | f6964fc … 5c4d4f0 (10) | ok | 10 commit; semNeighbors `proposed:true` (O-7) |
| 03 | 991e981 … 71e759c (5) | ok | 5 commit; bugün import-md: 524/524, consistency 0 |
| 04 | 9ca2b3a | ok | EVIDENCE `head` boş |
| 23 | 833b5ef | ok | "iki ad" şartı D-12 ile kaldırıldı (gerekçeli); `head` boş |
| 24 | 62551fc | ok | 1.678 klip = manifest; atıf dağıtımda yok (O-6) |
| 05 | 9227683 | ok | Bütçe 260 → KAO-15'te 340 (05 §1 güncellenmedi) |
| 06 | c1ebb5e | ok | EVIDENCE bayt 47.442/75.678 → bugün 51.353/83.276 (sonraki kartlarda meşru değişim). **K-1, Y-3** bu kartın çıktısı |
| 07 | 4d71eb1 | ok | — |
| 08 | 35e31cf | ok | 24 vektör bugün PASS |
| 09 | 140bccd | ok | Gramer ≤3 → 4 (D-2); R-A2b etkisiz (O-1) |
| 10 | b07688a | ok | onclick pin 392 → bugün 393 (sonraki kartlar); kilometre taşı (O-3) |
| 11 | 94bed14 | ok | `head` boş; yön tekliği (Y-2) |
| 12 | 8d1f9f4 | ok | `head` boş |
| 13 | 7012cae | ok | `head` boş; daily budama yok (O-2) |
| 14 | 4e4ec36 | ok | — |
| 15 | 57a0ecf, 41b77a9, 7520848 | ok | 3 commit; sözlük 320.754 B iddiası → bugün 320.208 (cf5e0d7) |
| 16 | 022e703, 35cb697 | ok | 2 commit |
| 17 | b56bec3 | ok | — |
| 26 | 6734443 | ok | — |
| 27 | e9f01ec | ok | — |
| 28 | 59a53d9 | ok | kaoCoverage tanımı (Y-1) |
| 28b | 4bf61c6 | ok | — |
| 16b | e578ae0, cf5e0d7 | ok | 2 commit; cf5e0d7 freeze pinini bayat bıraktı (O-4); yön onarımı yalnız oturum düzeyinde (Y-2) |
| 18 | a99077e, 4692e96 | ok | 2 commit; kontrast 328/328 bugün PASS |
| 19 | 9f604a8 | ok | Panel metrikleri Y-1'den etkilenir |
| 20 | 0de4d04, be4a2a8 | ok | 2 commit; EVIDENCE `checks` yalnız özet ("yukarıdaki aileler") |
| 21 | 208e703 | ok | saygi.js izi a9fa40c'de (D5); köprüler gerekçeli atlandı |
| 22 | d6d4e77 | ok | "yayın bekliyor" ifadesi bayat (D-1) |
| D1–D6 | d91cc07, 576ecb7, 466d5ce, 6c24867, caf61fd, 7693528 | — | Yalnız AUDIT.md; D1/D5/D6 `findings` ile geçildi |
| KAO dışı | a9fa40c, ecc7ac7, 0f7ce3b, 5655bb9, acd4238, 37f1032, 84001c1 | plan-check kapsamı dışında | ecc7ac7 `quranLearn.js`, `kao.css` ve pinleri değiştirdi, hiçbir kanıtta yok |

---

## 5. Çalıştırılan komutlar ve özet çıktılar

### Kanıt düzeyleri
- **Kaynak/test kanıtı (bu denetim):** aşağıdaki bütün koşular, HEAD `7693528`'in scratch kopyası ve repo üzerinde salt-okur.
- **Dağıtım kanıtı:** `git ls-remote origin refs/heads/main` → `7693528`, reflog `update by push 2026-09-26 15:03:34`. Pages çalıştırması **doğrulanamadı**: `gh run list` sandbox'ta TLS hatası verdi (x509 OSStatus -26276).
- **Cihaz kabulü:** yok. Bu denetim hiçbir cihaz davranışını "doğrulandı" diye beyan etmez.

### 5.1 Aileler (HEAD kopyası)
```
kao: pass=14 fail=0 · app: pass=74 fail=2* · panel: 23/0 · panel-v2: 27/0 · quran: 9/0
  * test_profile_boundary, test_settings_boundary: kopyada .git yok (git log çağırıyorlar);
    çalışma ağacında ikisi de PASS → HEAD'de app 76/76
reminders: CONTRACT 73 · SMOKE 21 PASS · driver exit 0 · zikr 95/95 · verify-state-* 3× exit 0
shell-inventory --gate PASS · fx-coverage --gate exit 1 (KAO öncesinden, belgeli)
kao-plan-check PASS (1 warn: MediaRecorder+save aynı dosyada) · plan-check.test 16/16
kao-verify-contrast: 328 çift, 0 eşik altı · kao-lexicon-build --self-test PASS
test_kao_user_tasks --report: R-C9 a:2 b:1 c:0 ses; p50 0,085 ms; gzip 159.856 B; ECE 0,0131
node --check app.js sync.js app/core/*.js app/content/*.js panel/*.js → hata yok
Çalışma ağacı (commit'lenmemiş ÆON değişikliğiyle): app 70/76 (O-10)
```

### 5.2 Determinizm (scratch kopyalar `det2`, `det3`; repo yazılmadı)
```
--inputs --stats: token=77429 lemma=4832 root=1642 verse=6236 (gövde/hash kapısı PASS)
--freeze → quranLexiconV1.js      AYNI (320.208 B)
--freeze-grammar → quranGrammarV1  AYNI
--freeze-phonics → quranPhonicsV1  AYNI
--freeze-surahs → HATA: lexicon.verified.json sha256 uyuşmuyor (16a159… ≠ pin cf65aa…)
   pin yalnız kopyada düzeltildi → quranShortSurahsV1.js AYNI (83.276 B)   [O-4]
--import-md (kopya): verified=524 unknown=0 duplicates=0 consistency=0 (yalnız importedAt değişir)
QAC sha256 = a1d129… (README ile eşit)
```

### 5.3 Derin doğrulamalar

**(a) İçerik:** `kao-content-check.js`, tohum **20260926**.
- 1.563/1.563 örnek Tanzil'de birebir; 377'si vakıf işaretleri çıkarıldıktan sonra.
- 518/524 frekans QAC'la eşit.
- 618/618 kısa sûre kelimesi Tanzil'de.
- Örneklem: 40 lemma + 12 sûre kelimesi + 10 gramer şablonu = **62 kayıt**. Elle incelendi (ör. `ecel` anlam kayması, `muttakîn` VIII, `ʿasâ` câmid fiil doğru).
- Bulunanlar: `صَلَاتِهِمْ → "their prayers"`, `مَّشَ`, `رَّحِيم`, `مُّسَمًّى`, `مَّاتَ` (Y-3/Y-4).
- Tam tarama: 26 şeddeli başlık, 20+6 İngilizce anlam, 618/618 referans kopyası.
- `وَأُو۟لَـٰٓئِكَ → va-ulâ'ika` doğru; sessiz vav okunmuyor. "v" işareti ilk taramada yanlış pozitif çıktı (va- öneki).

**(b) FSRS/kuyruk:** `kao-sim.js`, 365 gün, p=0,9, gerçek `kaoStart/kaoAnswer`, sahte saat.
- 365 oturum, 4.523 görev, 0 hata.
- dueMax 42, newMax 10, grammarMax **4**, fragmentMax 2, maxSameTypeRun **4** (3 ihlal).
- Yön toplamı 2.255/2.213; iki yönlü lemma **0**.
- Durum büyüklüğü: 139,1 KB @90 g, 241,2 KB @365 g. Kilometre taşları 6/6 null.
- Takvim sınırı (30 günlük koşular, oturum 23:59:50'de başlıyor): `America/New_York` DST ileri (2027-03) ve geri (2026-10), `Europe/Istanbul` artık gün (2028-02-29), `Pacific/Kiritimati` (UTC+14, p=0,7). Hepsinde 0 hata; gece yarısını aşan oturum ertesi gün satırına yazıyor (beklenen).

**(c) Veri modeli:** migrate `null/[]/'x'/kısmi/eski sözlük` → 5/5 idempotent, orphan=true. Observer snapshot 5.078 B: `"w:`, `misheard`, `cards`, `predictedR`, `nightAt` ve lemma kimliklerinden hiçbiri yok. `sanitize()` KAO gizli alanı taşımıyor.

**(d) UI:** 15 görünüm (E1–E11, istatistik, kapı, hub, overlay) boş ve 60 günlük durumda render edildi.
- `undefined/NaN/[object Object]` 0; `type="button"` eksiği 0.
- "Arapça ama lang=ar yok" uyarısı yanlış pozitif (`aria-hidden` ۞). "puan" uyarısı yanlış pozitif ("puan değil").
- `App.kao*`: tanımlı 35 = kullanılan 35 (ölü handler 0). İkon adları 11/11 haritada.

**(e) Tasarım/erişilebilirlik:**
- kao.css: hex/rgb 0, `:root` 0. Aileler `--quran` 288, `--f` 84, `--quran2` 65, `--dur` 14, `--kao-ar-*` 6 (çalışma zamanı).
- reduced-motion 2 blok; min-height 44 px.
- Arapça yazı tipi → O-9. Kontrast 328/328.
- VoiceOver ve gerçek dokunma yalnız cihazda doğrulanabilir.

**(f) Bütçeler (ölçülen ↔ eşik):**

| Ölçü | Ölçülen | Eşik | Durum |
|---|---|---|---|
| Sözlük (ham) | 320.208 B | 260 KB (05) / 340 KB (KAO-15) | 05'i aşıyor, KAO-15 içinde |
| Gramer | 51.353 B | 60 KB | içinde |
| Kısa sûre | 83.276 B | 90 KB | içinde |
| Fonetik | 9.552 B | 40 KB | içinde |
| 4 modül ham | 464.389 B | 410 KB | aşıyor |
| 4 modül gzip (-9) | 159.932 B | 130 KB | aşıyor (kullanıcı kararı) |
| quranLearn.js | 1.790 satır / 163.883 B | ≤800 satır | aşıyor |
| kao.css | 39.606 B | 18 KB | aşıyor |
| Ses | 10.950.329 B | 16 MiB | içinde |
| Durum @90 g | 139,1 KB | ≈90–100 KB | aşıyor |
| Görev geçişi | p50 0,085 ms, max 0,567 ms | <50 ms | içinde (VM) |
| app.js | 7.799 | 7.800 | içinde |

**(g) Yayın:**
- `index.html` = `sw.js` = `test_iip_22.js` (`release='20260925n'`) pinleri eşit; fonetik `20260924b`.
- `?v=20260925n` cf5e0d7'de geldi; sonrasında 6 KAO dosyasının hiçbiri değişmedi.
- sw.js çevrimdışı listesi KAO dosyalarını içeriyor.
- `origin/main = 7693528` (ls-remote).

**(h) Mutasyon yoklaması** (`kao-mutate.mjs`, scratch `mut/`, her mutasyondan sonra geri yazıldı):

| # | Bozulma | Sonuç |
|---|---|---|
| M01 | Çeldirici s≥21 → s≥0 | YAKALANDI (requirements, queue) |
| M02 | Ardışık tür kuralı kapalı | YAKALANDI (queue) |
| M03 | Gramer sınırı 40 | YAKALANDI (queue) |
| M04 | Undo errors geri sarma kaldırıldı | **KAÇTI** |
| M05 | Otomatik ses n<3 | YAKALANDI (requirements) |
| M06 | Orphan işaretleme kaldırıldı | YAKALANDI (migration) |
| M07 | Gece penceresi 120 dk | YAKALANDI (requirements) |
| M08 | Yön hep ar>tr | YAKALANDI (queue, requirements) |
| M09 | Yeni sınırı dailyNew+5 | **KAÇTI** |
| M10 | "Bilinen" plan tanımına çevrildi | 3 test DÜŞTÜ → testler sapmayı sabitliyor |
| M11 | DİA ḥ→h | YAKALANDI (requirements) |
| M12 | preload auto | YAKALANDI (privacy, user_tasks) |
| M13 | Panel özet anahtarına `cards` eklendi | YAKALANDI (panel_projection) |
| M14 | Özet yerine ham kök | YAKALANDI (panel_projection) |
| M15 | Hub bileşimi boş | YAKALANDI (independence) |

**(i) Belge tutarlılığı:**

| Belge | Durum | Açık karar | Yayın |
|---|---|---|---|
| KAO-STATE.json | completed, 30/30 | requirements 24 done / 2 partial | APPROVED (kayıt yalnız KAO-06) |
| CURRENT-STATE.md | completed | **"(yok)"** | APPROVED |
| LEDGER.md | son satır 101 (D6) | — | 7693528 push'u **kayıtsız** |
| KAO-KAPANIS.md | completed | 2 (gzip, K3) | **"yayın bekliyor"** (bayat) |
| CLAUDE.md / AGENTS.md | KAPANDI 2026-09-26 | 2 (gzip, K3) | — |
| kuran-ogreniyorum/README.md | **"Üretim kodu 0/0"** (bayat) | — | — |

Handler sayısı (755, 35'i KAO) ve fixture sayısı (14) KAPANIŞ, D3 ve HEAD ölçümüyle tutarlı.

---

## 6. Önceki denetimlerle karşılaştırma

| Denetim | Eski hüküm | Bugün |
|---|---|---|
| D1 #4 kapsam ≥0,78 | ✗ (0,7742) | **Hâlâ geçerli** (C: %77,42) |
| D1 #5 komşu/kalıp `proposed:true` | ✗ | **Hâlâ geçerli**; ayrıca kodda elle kümeler (O-7) |
| D2 #8 "yön dengesi 365 günlük fixture ile kapandı" | ✓ | **Kısmen yanlış:** yalnız oturum düzeyinde; kelime düzeyinde iki yön 0 (Y-2) |
| D2 #4 shim artışı 0 | ✓ | Geçerli (7.799) |
| D3 #6 kao.css yalnız token | ✓ | Geçerli; ama yazı tipi yığını kullanılmıyor (O-9, yeni) |
| D3 #4 gereksinim fixture eşlemesi | ✓ | R-A2b enjeksiyonla geçiyor (O-1, yeni); M04/M09 kör nokta (yeni) |
| D4 #3 kelime düzeyi sızmıyor | ✓ | Geçerli (U); panel metrik anlamı yanlış (Y-1, yeni) |
| D5 #3 saygi.js izi KAO-21'de değil | ✗ | Geçerli; ek olarak ecc7ac7 kayıtsız (O-11, yeni) |
| D6 #4 yayın | ✗ (59a53d9'a kadar) | Artık 7693528 de yayında, kaydı yok (D-1, yeni) |
| — | — | **Yeni:** K-1, Y-3, Y-4, O-2, O-3, O-4, O-6, O-8, O-10 |

D1–D6'nın hiçbiri içerik dilini (İngilizce), başlık biçimini, referans kopyasını, kapsam tanımını ya da durum büyümesini denetlememiş.

---

## 7. Düzeltme planı (uygulanmadı; kullanıcı onayı gerekir)

Sıra, riske ve bağımlılığa göre. Her madde yeni bir kart kaydı (ör. `KAO-FIX-nn`) ve ayrı onay ister. `main`'e yayın ayrıca onaylanır.

1. **FIX-01 · Referans kopyasını kaldır (K-1, Y-3).**
   - Dosyalar: `tools/kao-content-freeze.mjs`, `kuran-ogreniyorum/content/` (yeni `surahs.verified.json`: 618 + 29 kelime + tamamlayıcı için kendi Türkçe karşılık, D-12 alanlarıyla), `app/content/quranShortSurahsV1.js`, pinler (`index.html`, `sw.js`, `tests/app/test_iip_22.js`).
   - Kapılar: "referansla birebir eşit → fail", "ASCII İngilizce kelime → fail".
   - Koruyucu test: `test_kao_lexicon_contract.js` (dil + kopya kontrolü), `test_kao_phonics_contract.js` (sûre anlam kaynağı).
2. **FIX-02 · Başlık biçimi (Y-4).**
   - Dosyalar: `tools/kao-lexicon-build.mjs` (başlık = `lemmaBw` biçimi), `lexicon.verified.json` (26 satır yeniden doğrulama), `app/content/quranLexiconV1.js`, tamamlayıcı sözlük.
   - Koruyucu test: contract'a "başlıkta ilk harf şeddesi yok" ve "okunuş–Arapça hece uyumu".
3. **FIX-03 · Freeze pinini onar (O-4).**
   - Dosya: `tools/kao-content-freeze.mjs:19`.
   - Koruyucu test: yeni `test_kao_freeze_repro.js` (girdiler yoksa atla; varsa 4 modül bayt-eş).
4. **FIX-04 · İki yönlü kart (Y-2).**
   - Dosyalar: `quranLearn.js` (`kaoCandidates`: yeni lemma iki kart, `tr>ar` en erken ertesi gün), `test_kao_queue.js` (kelime düzeyinde iki yön oranı).
5. **FIX-05 · "Bilinen"/kapsam tanımı (Y-1).** FIX-04'ten sonra.
   - Dosyalar: `quranLearn.js:1252` (iki yön review ∧ s≥21), `test_kao_requirements.js`, `test_kao_render.js`, `test_kao_panel_projection.js` (plan tanımı, M10 tersine).
   - Panel ve E9 otomatik düzelir. Mevcut kullanıcı verisinde kapsamın düşeceği kullanıcıya önceden söylenmeli.
6. **FIX-06 · R-A2b (O-1).**
   - Dosyalar: `quranLearn.js` (`kaoAnswer` → `card.lastDistractors`), `test_kao_requirements.js` (enjeksiyonsuz, kaoStart/kaoAnswer ile).
7. **FIX-07 · daily budama + durum bütçesi (O-2).**
   - Dosyalar: `quranLearn.js` `ensureQuranLearn` (90 gün + `calibTotals` devri), `test_kao_migration.js` (budama idempotent), yeni boyut fixture'ı (365 gün ≤100 KB).
8. **FIX-08 · Kilometre taşları (O-3).**
   - Dosyalar: `quranLearn.js` (cevap sonrası taş kontrolü, 03 §10 koşulları), `test_kao_requirements.js`.
9. **FIX-09 · Test kör noktaları (O-5).**
   - `test_kao_queue.js`: dailyNew sınırı, dailyNew'dan fazla aday ile.
   - `test_kao_requirements.js`: undo errors ve oturum içi tekrar.
10. **FIX-10 · Ses atfı (O-6).**
    - Dosyalar: `quranLearn.js` E7 "Kaynaklar ve lisanslar" satırı (Tadabur CC BY-NC 4.0, AQQD CC0, Tanzil, QAC, Diyanet), `test_kao_render.js`.
11. **FIX-11 · Arapça yazı tipi (O-9).**
    - Dosyalar: `app/kao.css:23` yığın; kontrast yeniden ölçülür. Cihaz kabulü gerekir.
12. **FIX-12 · R-A5 kaynağı (O-7).**
    - Dosyalar: derleme aracında doğrulanmış `semNeighbors` → sözlük modülü; `quranLearn.js` elle kümeler kaldırılır; `test_kao_requirements.js`.
13. **FIX-13 · Plan/belge hizası (O-8, D-1, D-2).**
    - 05 §1 bütçeleri (sözlük 340, quranLearn/kao.css gerçek değer ya da bölme kararı) ve 06 §5 kullanıcı kararıyla güncellenir.
    - 02 §2.4 ↔ 05 §6 uzlaştırılır; gramer 3/4 kararı verilir.
    - README v2 başlığı, CURRENT-STATE açık kararlar ve KAPANIŞ §1/§8 yayın durumu düzeltilir.
    - LEDGER'a 7693528 yayın satırı, STATE `releaseApprovalRecord`'a son yayın eklenir.
14. **FIX-14 · Süreç (O-11).**
    - `kao-plan-check.mjs`: KAO dosyalarına dokunan **her** commit'i tarasın (konu önekinden bağımsız); kart başına commit sayısı raporlansın.
    - Dalga kapısında `findings` durumu ya plana eklensin ya kaldırılsın.
15. **FIX-15 · Sahipsiz plan maddeleri (D-4).** Kullanıcı kararı: 02 §5.3/5.6/5.7/5.8/5.10, 04 §4 FX ve 10 §9 ya yeni kartlara bağlanır ya plandan "yapılmayacak" olarak çıkarılır.
16. **Kardeş kapı (O-10, KAO dışı).** `58e0ceb` ile kapandı; eylem gerekmiyor.

---

*Geçici denetim betikleri (repo dışı):* `kao-sim.js`, `kao-ui-probe.js`, `kao-content-check.js`, `kao-mutate.mjs`, session scratchpad altında. Repoda yazılan tek dosya bu rapordur.
