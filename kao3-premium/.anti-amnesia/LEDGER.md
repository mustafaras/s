# K3P · LEDGER (yalnız sona ekleme yapılır)

Her prompt kapanışta bu dosyanın **sonuna** bir kayıt ekler. Eski kayıtlar değiştirilmez; bir
kayıt yanlışsa yeni bir `DÜZELTME` kaydıyla düzeltilir. Kayıt şablonu:

```text
## seq N · K3P-NN · <TÜR: KART | DEVİR | DÜZELTME | PLAN>
- Tarih: YYYY-MM-DD
- Commit: (bu commit) | yok (devir)
- Yapılan: <1–3 madde>
- Ölçüler: <ölçü: önce → sonra>
- Kapı: kapi-hizli <0/1> · kapilar.sh <yeşil/kırmızı/koşulmadı>
- Kanıt düzeyi: kaynak/test · görsel QA <var/yok> · cihaz <var/yok>
- Gözlem: <kapsam dışı görülen şey ya da —>
- Sıradaki: K3P-NN
```

---

## seq 1 · — · PLAN
- Tarih: 2026-10-10
- Commit: yok (main üzerinde, commit edilmemiş; K3P-00'da commit edilecek)
- Yapılan: `kao3-premium/` kuruldu. ANALIZ (B-01…06, E-1…5, T-1…7), TASARIM v1, KARTLAR v1 ve
  araçlar (`cift-sik`, `okunus-denetim`, `ekran-dok`) eklendi.
- Ölçüler: çift şık 631/1127 · vasl 18 · idgâm 274 · tanıma %93
- Kapı: koşulmadı
- Kanıt düzeyi: kaynak/headless · görsel QA yok · cihaz yok
- Gözlem: —
- Sıradaki: —

## seq 2 · — · PLAN
- Tarih: 2026-10-10
- Commit: yok
- Yapılan: Kullanıcı "en bilimsel şekilde karar ver" dedi. KARARLAR K-A…K-J ve hipotezler H1–H6
  yazıldı. TASARIM v2 "Tezhip" eklendi. Yeni araç `dokunus-olc`. ANALIZ'e kök neden (§6) ve
  ölçüm tabanı (§7) eklendi.
- Ölçüler: ders başına dokunuş 69 (otomatik geçiş açıkken 39)
- Kapı: koşulmadı
- Kanıt düzeyi: kaynak/headless
- Gözlem: CSV dışa aktarımı kart istatistiği taşımıyor; bu yüzden deney ölçümü bir JSON yedeğinden
  okunacak.
- Sıradaki: —

## seq 3 · — · PLAN
- Tarih: 2026-10-10
- Commit: yok
- Yapılan: Kullanıcı "öğrenme akışında kalabilmeli" dedi. AKIS.md, kararlar K-K…K-O, Dalga A
  (8 kart) ve araç `akis-olc` eklendi. Dosya-dosya pin gerçeği tespit edildi; buna göre "pin
  yalnız K3P-27'de yükseltilir" kararı alındı. Kullanıcı prompt listesi istedi; PROMPTLAR,
  BAGLAM-YONETIMI, anti-amnezi dosyaları ve `senkron` ile `kapi-hizli` araçları eklendi.
- Ölçüler: art arda edilgin ekran 6 · ilk yeni içeriğe 21 dokunuş · derste 7 overlay yeniden
  kurulumu · toast z-index 10000 > overlay 380
- Kapı: `kapilar.sh` taban koşusu başlatıldı; 10 dakikayı aştı.
- Kanıt düzeyi: kaynak/headless
- Gözlem: —
- Sıradaki: K3P-00

## seq 4 · — · PLAN
- Tarih: 2026-10-10
- Commit: (bu commit, `main`)
- Yapılan:
  - Kullanıcı "canlıya alalım push merge" dedi. Plan klasörü, CLAUDE.md ve AGENTS.md'ye eklenen K3P yönlendirme satırı ve `STARTER.md` `main`'e commit edildi ve push edildi. Uygulama koduna dokunulmadı.
  - K3P-00 prompt'u yeni duruma uyarlandı: artık yalnız dalı açıyor, görsel temel çizgiyi alıyor ve taban ölçümlerini yapıyor.
  - Hızlı kapı, 3 yavaş testi (`kabul` 526 sn, `grammar_tasks` 286 sn, `denetim` 51 sn) yalnız `--yavas` bayrağıyla koşacak şekilde ayarlandı.
- Ölçüler: kapi-hizli --kart K3P-00 → yeşil
- Kapı: kapi-hizli 0 · kapilar.sh: perf göreli bandı dışında yeşil (taban)
- Kanıt düzeyi: kaynak/headless · görsel QA yok · cihaz yok
- Gözlem: Yayın yalnız doküman ve araç içeriyor. Pages yeniden yayınlanır ama uygulamanın davranışı değişmez.
- Sıradaki: K3P-00

## seq 5 · K3P-00 · KART
- Tarih: 2026-10-10
- Commit: (bu commit)
- Yapılan:
  - `kao3-premium` yerel dalı `main` 02fda4f2'den açıldı. Uygulama koduna dokunulmadı.
  - Görsel temel çizgi: `test_local_visual_qa_guard` yeşil; `shoot-modal.mjs` 390 px açık ve koyu temada 58'er görünüm çekti (sunucu yok, boş geçici profil, atlanan çekim 0). `kanit/onceki/` altına `kontak-acik.jpg`, `kontak-koyu.jpg` (PIL) ve birleşik `log.txt` kondu; iki çekimde de `origin: http://127.0.0.1:9000 token:false force:null`.
  - Taban ölçümleri yeniden alındı; hepsi `K3P-STATE.baseline` ile birebir tuttu.
- Ölçüler: çift şık yerleşik 631/1127, yeni 1/1087 (exit 1, beklenen) · vasl 18 · idgâm 274 (exit 1, beklenen) · dokunuş u01.01 69 kapalı / 39 açık · akış: açılış→ilk görev 2 dokunuş, u01.02 30 görev + 7 ara ekran (427 sözcük), en uzun görev dizisi 20, yarıda bırakınca devam ipucu yok (`idx` 8 → 0) · perf: content 183,939 KiB · runtime 118,105 KiB · css 13,035 KiB · p95 5,483 ms · steady 3,049 ms ≤ bant 6,360 ms
- Kapı: kapi-hizli 0 · kapilar.sh koşulmadı (dalga sonu değil)
- Kanıt düzeyi: kaynak/test · görsel QA var (önce çizgisi, sentetik veri) · cihaz yok
- Gözlem:
  - `tools/kapi/gorsel-qa/cdp.mjs` varsayılan Chrome yolu (ms-playwright chromium-1243) bu makinede yok; önbellekte 1208 ve 1247 var. Kod değiştirilmedi; çekimler `KAO_QA_CHROME=…/chromium-1247/…` ile alındı. K3P-26'da aynı değişken gerekir.
  - `shoot-modal.mjs` görev çekimlerinin bir kısmını `l07-gorev-undefined` gibi adlandırıyor (görev türü etiketi boş geliyor); yalnız dosya adı, görüntü doğru.
  - Perf göreli bandı bu koşuda bant içindeydi (main'deki 7,4 ms ölçümünün aksine); bant makine yüküne duyarlı.
- Sıradaki: K3P-01

## seq 6 · K3P-00 · DÜZELTME
- Tarih: 2026-10-10
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı denetimi sonrası K3P-00 kapanışındaki iki sapma düzeltildi.
  - `K3P-STATE.json` üst düzey `status` alanı, prompt istemeden `active` yapılmıştı; `planned`'a geri alındı.
  - `CURRENT-STATE.md` §3 gereği baştan yazıldı (önceden yalnız "Son durum" bölümü güncellenmişti). Chrome yolu notu "Açık riskler"e taşındı.
- Ölçüler: değişmedi
- Kapı: kapi-hizli koşulmadı (yalnız durum dosyaları) · kapilar.sh koşulmadı
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: K3P-00 kapanışında "Oku" listesi dışında `cdp.mjs` ve `shoot-modal.mjs` başları okundu (sunucusuz ve dış isteği kesen davranışı doğrulamak için).
- Sıradaki: K3P-01

## seq 7 · K3P-01 · KART
- Tarih: 2026-10-10
- Commit: (bu commit)
- Yapılan:
  - B-01 düzeltildi. `kaoDistractorPool` sıralı havuzu kurar. `kaoUniqueDistractors` sırayı bozmadan aynı lemmayı (iki yön kartı) ve aynı görünen etiketi ayıklar. Etiket çakışması tek yardımcıda toplandı: `kaoLabelParts`/`kaoLabelClash`. Sözlük yedeği ve bağ kurma görevi aynı yardımcıyı kullanıyor (DRY); eski kopya `parts`/`overlaps` silindi.
  - Kararlılık için tekilleştirme görünen sırada yapılır: bugünkü pencere (havuzun ilk 3'ü ve yedek) görev sırasına dizilir, eksilen şık havuzun devamından, o da yetmezse sözlük yedeğinden dolar. Eski `choiceCount` kesme bloğu bu yolla gereksizleşti.
  - Yeni test `tests/kao/test_k3p_distractors.js`: 109 ders yeni ve yerleşik kullanıcıyla oynatılır; iki yönlü kart çifti birim vakası ×25; `--taban-yaz` ile kararlılık karşılaştırması. Test önce kırmızıydı (yeni 1/1087, yerleşik 631/1127), sonra yeşil. README envanterine eklendi.
- Ölçüler: çift şık yerleşik 631/1127 → 0/1127 · yeni 1/1087 → 0/1087 (cift-sik exit 0) · kararlılık: 1.582 çiftsiz görevin 1.581'i aynı; 1 görev R-A2 zinciriyle değişti (aşağıda) · runtime 118,105 → 118,648 KiB
- Kapı: kapi-hizli --yavas 0 (ilk koşu kabul A-9'da kırmızıydı → K-P) · kapilar.sh koşulmadı (dalga sonu değil)
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem / kullanıcı kararları:
  - **Dizme görevi ölçütü (kullanıcı kararı "ölçütü düzelt").** Yeni kullanıcıdaki tek "çift" u08.02 g16-k2'de, 2:24 `فَإِن لَّمْ تَفْعَلُوا۟ وَلَن تَفْعَلُوا۟`: sözcük âyette gerçekten iki kez geçiyor; D2F-03 iki çipi bilerek birbirinin yerine geçer yaptı. `cift-sik.cjs` ve yeni test dizmede tekilliği sıra numarasıyla (`ordinal`) ölçer. Uygulama davranışı değişmedi.
  - **R-A2 zinciri.** u07.03 `aAmana` dinleme görevi ders başında kuruluyor ve aynı kartın u01.01'deki görevinden kalan `lastDistractors` listesini dışlıyor. O görev çiftliydi ve düzeldi, bu yüzden dışlanan liste ve şıklar meşru olarak değişti. Testte yalnız "aynı hedef kartın önceki görevi çiftliydi" koşulu ayrı sayılıyor; başka her fark hata.
  - **K-P · pin tazeliği (kullanıcı "en bilimsel şekilde çöz" dedi).** `test_asset_pin_freshness` (D3F-10), değişen `quranLearn.js` pini yükseltilmediği için kırmızıydı. Bu da kabul A-9'u düşürüyordu. Oysa §6.3 pini K3P-27'ye bırakıyor; plan bunu öngörmemişti, çünkü kabul testi `--yavas` olmadan atlanıyor. Korunan özellik yayın anındaki tazelik ve yayın yalnız `main`'den yapılıyor. Bu yüzden test, yalnız `pinDeferral.branch` dalında ve `pinDeferral.files` içindeki dosyalar için ERTELENDİ der; `main`'de tam katıdır. Negatif deneme: dal tutmazsa exit 1. Kayıt K3P-STATE `decisions.K-P` + `pinDeferral`, kural BAGLAM §6.3, K3P-27 prompt'una listeyi boşaltma adımı eklendi (DÜZELTME).
- Sıradaki: K3P-02

## seq 8 · — · YAYIN
- Tarih: 2026-10-10
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı K3P-01'den sonra "canlıya al" dedi. Bu, §6.2'deki yayın kuralı için açık onaydır; program ortasında bir ara yayın.
  - Yayına giden tek pinli varlık `app/core/quranLearn.js`. Yalnız onun pinini yükseltmek yetmedi: KAO-16 (`test_iip_22`) ve `kapilar.sh` pin senkronu, KAO runtime pininin `SW_VERSION` ile aynı olmasını istiyor. Bu yüzden önceki yayının (`6dee4ebb`) yöntemi izlendi: ortak sürüm `20261009a` → `20261010a`, `index.html` (21), `sw.js` (21; `SW_VERSION`, `SW_OFFLINE_VERSION`), `panel-v2.html` (4) ve bu değeri sabitleyen 12 testte toplam 74 yerde.
  - Pin taze olduğu için `pinDeferral.files` boşaltıldı. Bundan sonra `quranLearn.js`'i değiştiren kart onu listeye yeniden ekler (K-P).
- Ölçüler: değişmedi (K3P-01 ölçüleri)
- Kapı: ilk tam kapı KIRMIZI (tek dosya pini: test_iip_22, pin senkronu, kabul A-9) → ortak sürüm yükseltmesinden sonra yeniden koşuldu (sonuç commit mesajında) · pin tazeliği, test_iip_22, curriculum, v3_welcome, iip_09 PASS
- Kanıt düzeyi: kaynak/test · canlı doğrulama yayından sonra · cihaz yok
- Gözlem: `git fetch` ve push, otomatik izin denetiminde "Production Deploy" olarak işaretlendi; push için kullanıcı izni gerekir.
- Sıradaki: K3P-02

## seq 9 · K3P-02 · KART
- Tarih: 2026-10-10
- Commit: (bu commit)
- Yapılan:
  - B-02 (K-C, kayma ile hatayı ayırmak): Doğru cevap panelinde geri alma eylemi kaldırıldı. Gövdedeki tekrar eden "Doğru" satırı da kalktı; gövde yalnız cevabı taşıyor, başlık "Doğru" olarak kaldı. Yanlış cevap panelinde geri alma düğmesinin etiketi "Aslında biliyordum" yerine "Yanlışlıkla dokundum".
  - B-05: Özet başlığı artık yalnız ders adı; "Ders tamamlandı" üst satırda kaldı.
  - Yeni test `tests/kao/test_k3p_feedback_copy.js`: u01.01, u01.02 ve u08.02 yeni ve yerleşik kullanıcıyla oynatıldı; görevler sırayla doğru ve yanlış cevaplandı (93 doğru panel, 87 yanlış panel, 8 dizme, 6 özet). Önce kırmızıydı, sonra yeşil. README envanterine eklendi.
  - K-P: `quranLearn.js` yeniden değişti, `pinDeferral.files` listesine eklendi.
- Ölçüler: ekran-dok `ders-02-geribildirim-word.html` "Aslında biliyordum" 0 · runtime 118,648 → 118,709 KiB
- Kapı: kapi-hizli 0 · kapilar.sh koşulmadı (dalga sonu değil)
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem:
  - Eski metni bekleyen test çıkmadı. `test_kao2_feedback` doğru cevaptan sonra `api.kaoUndo()`'yu doğrudan çağırıyor (K2F-31 süre geri alma); işlev duruyor, yalnız düğme gizlendi, test değişmedi.
  - Ara hata: Satır içi `//` yorumu aynı satırdaki `model.learnedWords` atamalarını yorum satırına çevirdi. `test_kao2_summary` bunu yakaladı, yorum ayrı satıra alındı. Yeni test özet kelime listesini denetlemiyordu; bu açığı `test_kao2_summary` kapatıyor.
- Sıradaki: K3P-03

## seq 10 · K3P-03 · KART
- Tarih: 2026-10-10
- Commit: (bu commit)
- Yapılan:
  - B-06 doğrulandı ve düzeltildi. `estimateMinutes` (`quranLearnFlow.js`) ölçülmüş görev süresini adlandırılmış `FLOOR_PER_TASK` (6 sn) tabanının altına indirmiyor. `ms` alanı yoksa, sayı değilse ya da 0 ise o gün zaten sayılmıyor ve `MIN_PER_TASK` (0,55 dk) kullanılıyor.
  - `tests/kao/test_kao2_next_step.js` içine tablo güdümlü kontrol eklendi: 24 görev için ms yok, ms = 0, ms sayı değil, 1 ms/görev ve answered = 0 durumlarında ≥ 3 dk; normal veride (9 sn/görev) tam 4 dk. Önce kırmızıydı ("1 ms/görev: 1 dk < 3 dk"), sonra yeşil. Yeni test dosyası yok, README değişmedi.
  - K-P: `app/core/quranLearnFlow.js` `pinDeferral.files` listesine eklendi.
- Ölçüler: seeded + u01.01 oynatıldıktan sonra (ms 178 / 30 görev) Bugün "20 tekrar · ~1 dk" → "~4 dk"; 24 görev tavansız 1 → 3 dk · ekran-dok `v-home` "~5 dk" (önce de 5: seeded günlük kaydında ms yok, varsayılan + 5 dk tavanı) · runtime 118,709 → 118,804 KiB
- Kapı: kapi-hizli 0 · kapilar.sh koşulmadı (dalga sonu değil)
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: Kabul ölçüsündeki `ekran-dok` seeded Bugün ekranı bu hatayı tek başına sınamıyor; seed günlük kaydı `ms` taşımadığı için önce de "~1 dk" göstermiyordu. Asıl koşul ders oynatıldıktan sonraki küçük `ms` (headless sahte saat); `akis-olc` "yarıda bırakma → yeniden açılış" satırı artık "~4 dk" gösteriyor.
- Sıradaki: K3P-04

## seq 11 · K3P-04 · KART
- Tarih: 2026-10-10
- Commit: (bu commit)
- Yapılan:
  - **Kullanıcı kararı (imlâ):** K-A tablosundaki `istağfera` örneği, aracın ve mevcut testlerin mekanik düzeniyle (fetha = a, غ = g; `faʿala`, `rahmân`) çelişiyordu. Kullanıcı "Tam Türkçe imlâ (ayrı kart)" seçti. Bu kartta mekanik düzen korundu ve beklenti `istagfara` oldu. Tam Türkçe imlâ `K3P-STATE.decisions.K-A2` olarak açık kaldı; kart metni ve sırası kullanıcıdan istenecek.
  - B-03, araç: `tools/kao-lexicon-build.mjs` içine adlandırılmış kural bloğu eklendi: `SUN_LETTERS_BW`, `ARTICLE_FORMS`, `LAFZATULLAH_LEMMAS`, `HELPER_VOWEL`, `waslVowel`, `pauseBw` ve `sequenceTranslitTr`. Kurallar:
    - vasl elifi ibtidâda `i`; fiilde ikinci ünsüz ötreliyse `u` (ustuhzi'a, uʿbudû)
    - şemsî idgâm (ar-rahmân)
    - ön ek kaynaşması (bismi, lillâhi, bil-hakki)
    - cümle içi vasl; önceki kelime ünsüzle bitiyorsa yardımcı ünlü (min → mina, cem mîmi → u, diğerleri → i)
    - âyet sonu vakf: hareke ve tenvin sükûna döner, tenvinli fetha `â`, ta marbûta `h`
    - lafza-i celâl `allâh`
  - `dia` katmanı DİA düzeninde kaldı; yalnız vasl ve lafza kuralı uygulandı.
  - Yeni araç komutu `--retranslit`: `auto:true` okunuş önerilerini güncel kurallarla yeniden üretir ve gramer girdisindeki birebir kopyaları eşitler.
  - `kao-content-freeze.mjs`: kısa sûre ve Fâtiha kelimeleri âyet bağlamında okunur; gramer örnekleri cümle bağlamında, âyet sonundaysa vakfla okunur. JSON pinleri yeni özetlere çekildi. `qac-lemma-morph.json` kendi aracıyla yeniden üretildi; yalnız `lexiconSha256` değişti.
  - Çalışma zamanı: `kaoDiaReading`, aracın vasl ve lafza kurallarının eşini kullanıyor. Ortak tablo yolu olmadığı için `test_kao_pronunciation_contract` araç, girdi ve çalışma zamanını 524/524 karşılaştırıyor. Negatif deneme: bayat girdi 19 sapma verdi.
  - Yeniden üretim aracın kendi komutlarıyla yapıldı: `--retranslit`, `--freeze`, `--freeze-grammar`, `--freeze-surahs`, `--freeze-phonics` (bayt-eş), `kao2-curriculum-build`, `kao2-lemma-morph-build --write`.
  - K-P: `pinDeferral.files` listesine sözlük, gramer, kısa sûre ve müfredat modülleri eklendi; `quranLearn.js` zaten listedeydi. Harf bilgisi modülü bayt-eş kaldı.
- Ölçüler:
  - okunus-denetim: vasl 18 → 0, idgâmsız 274 → 0, exit 0
  - Önce/sonra JSON farkında **okunuş dışında değişen alan 0**:
    - sözlük 1.109 (19 başlık + 1.090 örnek)
    - gramer 104
    - kısa sûreler 211
    - müfredat 2
    - inceleme tablosu `MUFREDAT-ESLEME.md` 21/21 satır yalnız okunuş
    - girdi JSON'larında yalnız `translit` satırları (sözlük 38 = 19 × tr/dia, gramer 3)
  - Âyet sonu vakfı 6.236/6.236 âyette tutuyor.
  - Boyut: sözlük 324.323 → 323.248 B · gramer 72.198 → 72.107 B · kısa sûreler 87.463 → 87.161 B · içerik 183,999 KiB (≤ 256) · runtime 118,804 → 119,093 KiB
  - ekran-dok `v-word` başlığı `ism`.
- Okunuşu değişen lemmalar (L2 kıraat hocası incelemesi önerilir), tam liste `kao3-premium/kanit/K3P-04/okunus-degisen.md`:
  - **19 başlık:** allah→allâh, attakâ→ittakâ, attabaʿa→ittabaʿa, attahaza→ittahaza, abn→ibn, aftarâ→iftarâ, astatâʿa→istatâʿa, ahtadâ→ihtadâ, astagfara→istagfara, astakbara→istakbara, asm→ism, astavâ→istavâ, ahtalafa→ihtalafa, abtagâ→ibtagâ, astacâba→istacâba, amra'at→imra'at, aştarâ→iştarâ, astuhzi'a→ustuhzi'a, astaʿînu→istaʿînu.
  - **479 lemmanın** örnek cümle okunuşu da değişti.
- Kapı: kapi-hizli 0 (ilk koşu KIRMIZI 2 → düzeltildi, aşağıda) · yavaş testler (kabul 10/10, grammar_tasks 39, denetim 10) PASS · kapilar.sh koşulmadı (dalga sonu K3P-05)
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem:
  - **Test düzeltmesi (gevşetme değil):** `test_kao_phonics_contract`, iki harfli (th/dh) kontrolünde eski okunuşları anlık değer olarak sabitlemişti. 110:1 ve 100:2 son kelimeleri artık âyet sonu vakfıyla okunuyor (`va-al-fathu` → `val-fath`, `kadhen` → `kadhâ`). İkililer korunuyor; yalnız beklenen değer güncellendi.
  - **Plan dışı türetilmiş dosya:** `test_kao2_curriculum`, müfredat modülünün ve `MUFREDAT-ESLEME.md`'nin sözlük okunuşunu kopyaladığını gösterdi. Kendi aracıyla yeniden üretildi; okunuş dışında fark yok.
  - **Kapsam dışı kalan inceltmeler (L2'ye):**
    - Vaslden önceki uzun ünlü yazımda kısaltılmadı (`fî l-ardi`).
    - Hemzeli bazı kelimeler önceden de eksik okunuyordu (`yaûduhu`).
    - `huva` vakf biçimi denetlenmedi.
  - Makine yükü yüksekti (load ~10–12). `test_kao2_mastery` 955 sn ve `cift-sik` 978 sn sürdü; önceki koşularda 38–84 sn.
  - **K3P-03 eki (kullanıcı isteği):** K3P-03 commit'inden sonra yavaş testler koşuldu: kabul 10/10, grammar_tasks 39, denetim 10, hepsi PASS.
- Sıradaki: K3P-05

## seq 12 · — · PLAN
- Tarih: 2026-10-11
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı, K-A2 tam Türkçe imlâ kartının yazılmasını onayladı ve sırasını seçti: K3P-05'ten hemen önce.
  - Yeni kart **K3P-04B** eklendi: PROMPTLAR bloğu, KARTLAR satırı, `executionOrder`, `cards` (dalga 0, todo). `nextPrompt` K3P-05 → K3P-04B oldu.
  - `decisions.K-A2` "scheduled" durumuna geçti.
  - Kartın ilk adımı, önerilen Diyanet tablosunu ve K-A'daki `istağfera` ile tablonun vereceği `istağfara` çelişkisini kod yazmadan önce kullanıcıya sormak.
- Ölçüler: değişmedi
- Kapı: koşulmadı (yalnız plan dosyaları)
- Kanıt düzeyi: plan
- Gözlem: Dalga 0 artık 7 kart; tam kapı K3P-05'te K3P-04B'yi de kapsar.
- Sıradaki: K3P-04B

## seq 13 · K3P-04B · KART
- Tarih: 2026-10-11
- Commit: (bu commit)
- Yapılan:
  - **Karar adımı (kod yazılmadan önce):** Kullanıcı "Diyanet tam tablo" seçti.
  - **Çerçeve hatası ve düzeltmesi:** İkinci soruda ajan yanlış bir çerçeve kurdu ve "K-A `istağfera` yazıyor, ر tefhîmi `istağfara` verir" dedi. Oysa kelime is-tağ-fe-**ra** ve K-A son heceyi zaten kalın yazıyor. Kullanıcı önce `istağfara` seçti. Tablo uygulanınca hata görüldü, soru düzeltilerek yeniden soruldu, kullanıcı `istağfera` seçti. Karar `decisions.K-A2` = decided.
  - **Araç:** `tools/kao-lexicon-build.mjs` içinde yalnız `tr` katmanı için yeni tablolar: `TR_THICK_LETTERS` (خ ص ض غ ط ق ظ), `TR_THICK_FATHA` (+ ر ح ع), `TR_THICK_DAMMA` (+ ر), `TR_HARAKE`, `trVowelFor(carrier, harake, following, followingVowel)`. Kurallar:
    - غ → ğ
    - kısa ünlü taşıyan harfe göre a/ı/u ya da e/i/ü; tenvin de buna uyar
    - kalın harften önceki fetha/ötre kalın (mağdûbi, müstakîm, istağfera)
    - sakin ر öncesi kalın (ardı, kurân); harekeli ر yalnız kendi ünlüsünü etkiler (ğafera)
    - harf-i tarif `el-`/`er-` (lafza-i celâl kalın: allâh)
    - yardımcı ünlü min → e, cem mîmi → ü
  - `dia` katmanı ve çalışma zamanı `kaoDiaReading` değişmedi (araç↔girdi↔çalışma zamanı 524/524).
  - Ara düzeltmeler: lafza denetimi uzun â eklenmiş biçimi tanımıyordu (`ellâhü`), `isLafzatullahBw` düzeltildi; `ر` kuralı önce fazla genişti (`ğafara`), sakin ر ile sınırlandı.
  - Yeniden üretim K3P-04 sırasıyla yapıldı: `--retranslit` → `--freeze` → `--freeze-grammar/--freeze-surahs/--freeze-phonics` → `kao2-curriculum-build` → `kao2-lemma-morph-build --write`. Ardından `kao-content-freeze.mjs` JSON pinleri güncellendi. `okunus-denetim.cjs` vasl ve idgâm desenleri `[ae]l-` ve `^[ae]` olarak genişletildi.
- Ölçüler:
  - Önce/sonra JSON farkında (taban K3P-04 `084eb2fe`) **okunuş dışında değişen alan 0**:
    - sözlük 1.894 (341 başlık + 1.553 örnek)
    - gramer 373
    - kısa sûreler 471
    - müfredat 4
    - `MUFREDAT-ESLEME.md` 367 satır
    - girdi JSON'larında yalnız `"tr"` satırları (sözlük 341, gramer kopyası 47; bayat kopya 0/85)
    - `dia` 0 değişiklik
  - okunus-denetim 0.
  - Boyut: sözlük 323.248 → 325.858 B · gramer 72.107 → 72.297 B · kısa sûreler 87.161 → 87.335 B · harf bilgisi bayt-eş · içerik 184,591 KiB (≤ 256) · runtime 119,093 KiB (değişmedi).
  - ekran-dok `v-word` başlığı `ism`.
- Okunuşu değişen lemmalar (L2 önerilir): 341 başlık ve 524 lemmanın 1.553 örneği. Tam liste `kao3-premium/kanit/K3P-04B/okunus-degisen.md`.
- Kapı: kapi-hizli --yavas 0 (kabul 341,6 sn, grammar_tasks 164,2 sn, denetim 29,6 sn PASS) · kapilar.sh koşulmadı (dalga sonu K3P-05)
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem:
  - **Test güncellemeleri (gelenek değişikliği, gevşetme değil):**
    - `test_kao_pronunciation_contract`: K3P-04 beklentileri ve gramer çekim sabitleri güncellendi (`faʿala` → `feʿale`, `faʿalta` → `feʿalte`, `kasabâ` → `kesebâ`, `hatama` → `hateme`). ğ, ı ve ü için Fâtiha örnekleri eklendi.
    - `test_kao_phonics_contract`: th/dh ikilisi sabitleri (`vel-feth`, `yedhulûne`, `câ'ethümü`, `li-yeʿbüdû`) güncellendi; ikililer korunuyor.
    - `test_kao2_lemma_morph`: lemmaları görünen okunuşla arıyordu, artık değişmeyen `lemmaId` ile arıyor. Test edilen dilbilgisi gerçekleri aynı.
    - Aracın öz-test beklentileri yeni geleneğe çekildi.
  - **Kapsam dışı:** Elle yazılmış namaz okunuşları (`kao-content-freeze.mjs` → `PRAYER_READINGS`: tekbir `allahu akbaru`, sübhâneke `subhânaka`…) mekanik düzende kaldı. Fâtiha ise Türk imlâsında; namaz ekranında iki gelenek yan yana görünebilir. Ayrı bir karar gerekiyor.
- Sıradaki: K3P-05

## seq 14 · K3P-05 · KART
- Tarih: 2026-10-11
- Commit: (bu commit)
- Yapılan:
  - `tools/kapi/kapilar.sh` içine iki kapı eklendi: `k3p çift şık` (`cift-sik.cjs`) ve `k3p okunuş` (`okunus-denetim.cjs`).
  - Yeni araç `kao3-premium/araclar/deney-rapor.cjs` (KARARLAR §6, AKIS §7). Girdi: kullanıcının verdiği JSON yedeği (düz, `data` sarmalı ya da latest.json) veya `--ornek`. Önce yalnız izinli alanlar (`cards[*].{s,lapses,reps,state}`, `daily`, `path.lessons[*].{resume,doneAt}`) kimliksiz bir izdüşüme kopyalanır; hesap yalnız ona bakar. Dosya/ağ yazmaz. Çıktı: H2 (14 gün önce/sonra tekrar doğruluğu, `calib.bands`), H5, H7 (≥ 5 cevaplı günlerde %80–90 bandı), H8 (yarıda kalan ders payı), H9; H3 "K3P-16 sonrası etkin". `--kesim`/`--bugun` seçenekleri; varsayılan kesim son 14 gün.
  - Yeni test `tests/kao/test_k3p_deney_rapor.js` (README envanterine eklendi; 58 test): sızıntı yemi (Arapça, kimlik biçimli anahtar, sır benzeri ayar) çıktıda 0; sentetik örnekte elle hesaplanan 6 değer; izdüşüm alanları; gunluk sarmalı; `--bugun` sınırı; 6 hata yolu exit 2. Program README araç tablosuna `deney-rapor` satırı eklendi.
- Ölçüler:
  - `--ornek` grep: girdi Arapça 40 satır / kimlik 26 → çıktı **0 / 0** (`kanit/K3P-05/grep-kanit.md`, `deney-rapor-ornek.txt`).
  - Sentetik örnek: H2 %80,0 → %90,8 (52/65 → 59/65) · H5 2 gün · H7 20/26 · H8 2/5 · H9 7/10.
  - runtime 119,093 KiB (değişmedi; çalışma zamanı koduna dokunulmadı) · içerik 184,591 KiB · çift şık 0 · okunuş hatası 0.
- Kapı: kapi-hizli 0 · kapilar.sh bu commit için koşulmadı — kullanıcı "en kısa olacak şekilde geçelim ve yayına alalım" dedi; başlatılan tam kapı hızlı kapı yeşil çıktıktan sonra durduruldu. Bu commit hiçbir çalışma zamanı dosyasına dokunmuyor; yayın kaydına (seq 15) bakın.
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem:
  - **H5 ve H9 yaklaşık ölçü.** `ayahs.understood` tarihsiz ve okuma izni dışında; H5 = ilk çalışma gününden ilk bitirilen derse gün (K-G: ders âyetle kapanır). Yerleştirme adımı (`via:'placement'`) atlanan dersleri aynı `doneAt` ile işaretlediği için aynı zamanlı bitirişler ayıklanır. H9 = tekrara geçmiş (`review`/`relearning`, reps ≥ 2) kartlarda hiç unutulmamış payı; ilk tekrar doğruluğunun alt sınırı. Kesin ölçü tarihli kayıt ister; bu bir veri şeması kararıdır (§5), kullanıcıya bırakıldı.
  - H8'in "30 gün önce/sonra" karşılaştırması iki tarihli rapor arasında yapılır (K3P-27 takvimi: 14. ve 30. gün); izinli alanlarda yarıda kalan dersin tarihi yok.
- Sıradaki: K3P-A1

## seq 15 · — · YAYIN
- Tarih: 2026-10-11
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı K3P-05'ten sonra "canlıya al" ve "en kısa olacak şekilde geçelim ve yayına alalım" dedi; §6.2 için açık onay, ikinci ara yayın. Yayına giden çalışma zamanı değişiklikleri: K3P-02 (geri bildirim metni), K3P-03 (süre tahmini tabanı), K3P-04 (bağlam okunuşu), K3P-04B (Türkçe okunuş imlâsı) — `quranLearn.js`, `quranLearnFlow.js` ve dört içerik modülü.
  - seq 8 yöntemi: ortak sürüm `20261010a` → `20261011a`; `index.html` (22), `sw.js` (22; `SW_VERSION`, `SW_OFFLINE_VERSION`), `panel-v2.html` (4) ve bu değeri sabitleyen 12 testte toplam 71 yer. `pinDeferral.files` boşaltıldı (pin tazeliği katı modda PASS, 60 bağlantı).
- Ölçüler: değişmedi (K3P-05 ölçüleri; runtime 119,093 KiB)
- Kapı (kısa yol, kullanıcı isteği; tam kapı koşulmadı): tests/app 78 · tests/panel-v2 27 · tests/quran 9 · tests/panel 23 · curriculum + inventory + deney_rapor · run-seyma driver + zikr · reminders smoke · pin senkronu · asset pin freshness — hepsi PASS. tests/kao (yavaş üçlü hariç) ve ölçü kapıları K3P-05 hızlı kapısında aynı kodla yeşildi; yavaş üçlü (kabul, grammar_tasks, denetim) en son K3P-04B'de `--yavas` ile yeşildi, sonrasında çalışma zamanı değişmedi.
- Kanıt düzeyi: kaynak/test · canlı doğrulama yayından sonra · cihaz yok
- Gözlem: Tam kapı bu yayında koşulmadı; bir sonraki dalga sonunda (K3P-A8) zorunlu.
- Sıradaki: K3P-A1
