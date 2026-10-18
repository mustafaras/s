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

## seq 16 · K3P-A1 · KART
- Tarih: 2026-10-11
- Commit: (bu commit)
- Yapılan:
  - **Kök neden (A-7, koddan doğrulandı):** Yalnız mount sorumlu değildi. `render.js` paint her render'da `#app.innerHTML=html` ile `#app`'i baştan yazıyor ve onun içindeki KAO overlay'ini de söküyordu; app.js `render()` sarmalı ardından `kaoMount` ile yeniden ekliyordu. Bu yüzden prompt'taki "mount yerinde günceller" tek başına yetmezdi; paint de düzeltildi. Overlay `#app` dışına taşınmadı: `#app{contain:layout}` fixed overlay'in 460 px çerçevesini ve toast (z 10000) / kriz modalının katman sırasını belirliyor; taşımak ikisini de değiştirirdi.
  - `quranLearn.js` (`window.SeymaQuranLearn`, App.* değil): `kaoSplitOverlay(html)` → `{cardAttrs, bodyAttrs, body, screenKey}` (saf; `screenKey` = `.kao-screen-<görünüm>` (yoksa focusbar → `session`) + `|` + `data-kao-step`), `kaoPatchOverlay(doc, html)` (overlay yoksa ekler; varsa düğümleri korur, kart `style`/`aria-labelledby`/`aria-label` ve gövde `style`/`data-kao-step` eşitlenir, gövde `innerHTML`, aynı ekranda kaydırma korunur yoksa 0, odaklı öğe id'si yeni içerikte varsa odak geri verilir), `kaoPaintApp(app, html)` (KAO açıkken diğer içerik overlay'in önüne yazılır). `kaoOverlayHTML` gövdeye `data-kao-step` ekler (görünüm:parametre, ders aşaması `lesson:<at>` / `review` / `practice`, ilk açılış adımı). Animasyon notu `kaoPatchOverlay` yorumunda: düğüm belgede kaldıkça seyFade/sey-sheet-in yeniden başlamaz.
  - `app.js` mount → `window.SeymaQuranLearn.kaoPatchOverlay(document,html)` (tek satır); `render.js` paint → `kaoKept` satırı. `role=dialog`/`onkeydown` dış kartta kaldı; `paintTask` değişmedi; App.kao* 45.
  - Yeni test `tests/kao/test_k3p_mount.js` (envantere eklendi, 59 test). Harness `bootKao` isteğe bağlı `deps`/`surface` geçersiz kılmaları aldı (varsayılan davranış aynı; kayıtlar tek seferlik olduğu için).
  - K-P: `app.js`, `app/core/quranLearn.js`, `app/core/render.js` → `pinDeferral.files`.
- Ölçüler:
  - Ders başına overlay yeniden kurulumu (u01.02, harness render sayımı): eski mount ile **10** (AKIS tabanı 7) → **0**; test sahnesinde 13 render, 8 ders aşaması, 12 ekran geçişi, açılış eklemesi 1.
  - runtime 119,093 → 120,629 KiB (tavan 128) · içerik 184,591 KiB · css 13,035 KiB.
- Kapı: kapi-hizli 0 · ek: tests/app 78 + tests/panel-v2 27 + zikr PASS (render.js değişti) · test_kao2_navigation, test_kao2_a11y PASS · kapilar.sh koşulmadı (dalga sonu değil)
- Kanıt düzeyi: kaynak/test (sahte DOM) · görsel QA yok · cihaz yok
- Gözlem: Gerçek tarayıcıda odak/kaydırma davranışı ve animasyonun yeniden oynamadığı yalnız cihazda görülebilir. `render.js` içindeki diğer overlay'ler (okuma/izleme hub'ları) hâlâ yeniden kuruluyor; onlar animasyonu `style.animation='none'` ile bastırıyor — kapsam dışı.
- Sıradaki: K3P-A2

## seq 17 · — · YAYIN
- Tarih: 2026-10-11
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı K3P-A1 sırasında "bitince canlıya al" dedi; §6.2 için açık onay, üçüncü ara yayın. Yayına giden çalışma zamanı değişikliği: K3P-A1 (overlay yerinde güncelleme) — `app.js`, `app/core/quranLearn.js`, `app/core/render.js`.
  - seq 8/15 yöntemi: ortak sürüm `20261011a` → `20261011b`, aynı 15 dosyada 76 geçiş. `pinDeferral.files` boşaltıldı (pin tazeliği katı modda PASS).
  - DÜZELTME (seq 15): orada "71 yer" yazıldı; 71 değişen satır sayısıdır, geçiş sayısı 76'dır.
- Ölçüler: değişmedi (K3P-A1 ölçüleri; runtime 120,629 KiB)
- Kapı (kısa yol, kullanıcı isteği; tam kapı koşulmadı): tests/app 78 · tests/panel-v2 27 · tests/quran 9 · tests/panel 23 · curriculum + inventory + deney_rapor · run-seyma driver + zikr · reminders smoke · pin senkronu · asset pin freshness · test_k3p_mount — hepsi PASS. tests/kao ve ölçü kapıları K3P-A1 hızlı kapısında aynı kodla yeşildi.
- Kanıt düzeyi: kaynak/test · canlı doğrulama yayından sonra · cihaz yok (overlay davranışı cihazda görülmeli)
- Gözlem: Tam kapı en son K3P-04B öncesi koşuldu; bir sonraki dalga sonunda (K3P-A8) zorunlu.
- Sıradaki: K3P-A2

## seq 18 · K3P-A2 · KART
- Tarih: 2026-10-11
- Commit: (bu commit)
- Yapılan:
  - `quranLearn.js`: `kaoFocusLocked()` (SeymaQuranLearn, App.* değil) — `ui.kaoOpen && ui.kaoLesson && ui.kaoView==='session'`. **Sapma (gerekçeli):** prompt `ui.kaoOpen && ui.kaoLesson` diyordu; oysa `exit` ve `finish` `ui.kaoLesson`'ı devam kaydı için tutup ana ekrana dönüyor (harness'ta doğrulandı). O tanımla kilit çıkıştan sonra da sürer ve "çıkınca boşalt" kuralı çalışmazdı; kilit yalnız ders ekranında geçerli. Tekrar oturumları (`ui.kaoLesson=null`, K2F-28) kilitlenmez.
  - `kaoReleaseToasts`: `kaoMount` sonunda (özet ekranında ya da kilit kalkınca) ve `kaoClose` gövdesinde çağrılır → `flushToasts`.
  - `helpers.js`: `toast(msg, ms, opts)` kilitliyken kuyruğa alır (en çok 3, en eskisi düşer; tekrar eden bir kez, süresi en uzunu); `opts.urgent` ve `opts.own` ertelenmez; `flushToasts()` birleşik tek toast (` · `). Görünüm aynı (gövde `showToast`'a taşındı, değişmedi).
  - **Kriz:** `crisis.js` ve kriz işleyicilerinde (`App.openCrisis`, `closeCrisis`, `toggleCrisis*`) toast çağrısı **yok**. Güvenlik akışındaki tek toast `App.continueEmergency` → `{urgent:true}`.
  - **`own` bayrağı (ek, gerekçeli):** KAO'nun kendi 3 cevap toast'ı (`kaoFlag` "Teşekkürler…", ustalık/onarım uyarıları) `{own:true}` alır; kullanıcının kendi eylemine verilen cevabı ertelemek onu gizlerdi. D-8 yalnız "başka modüllerin" toast'ını kapsar.
  - `app.js`: KAO yüzeyine `flushToasts` bağımlılığı; `toast` köprüsü değişmedi (`arguments` ile opts geçer). App.kao* 45.
  - Yeni test `tests/kao/test_k3p_focus_lock.js` (envanter 60 test).
  - K-P: `app.js`, `app/core/quranLearn.js`, `app/core/helpers.js` → `pinDeferral.files`.
  - **Karar K-Q (kullanıcı):** "kısa gereklilikleri yapalım 3 dkdan fazla beklemeyelim". Kart kapanışında hedefli kapı: sözdizimi (app.js, sync.js, quranLearn*, helpers, render) + `test_kao2_navigation`, `test_kao2_a11y`, `test_kao2_inventory`, `test_kao2_design_contract` + kartın testleri + `tests/app` ailesi + run-seyma driver + perf. Hızlı kapının tamamı ve `kapilar.sh` dalga sonunda zorunlu.
- Ölçüler: ders ekranında KAO dışı toast eklemesi 0 (uçtan uca test) · runtime 120,629 → 121,007 KiB · p95 30,1 ms (yük altında; tavan 40)
- Kapı: hedefli kapı 49 sn PASS (tests/app 78, KAO 6, driver, perf) · ayrıca helpers 31/31, faz-1.1 27/27 · kapi-hizli tamamı başlatıldı, kullanıcı kararıyla durduruldu (durdurulana kadar koşan 8 adım yeşil) · kapilar.sh koşulmadı
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: ÆON gelen kutusu açılır penceresi `#sey-inbox-pop` (`renderAeonPopup`, z 500 > KAO 380) 30 sn yoklamasıyla ders sırasında da açılabiliyor; toast değil, kilidin kapsamı dışında — dokunulmadı (prompt "banner'lara dokunma").
- Sıradaki: K3P-A3

## seq 19 · — · YAYIN
- Tarih: 2026-10-11
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı "devam et tamamla ve canlıya al" dedi; dördüncü ara yayın. Yayına giden çalışma zamanı değişikliği: K3P-A2 (odak kilidi, toast kuyruğu) — `app.js`, `app/core/quranLearn.js`, `app/core/helpers.js`.
  - Ortak sürüm `20261011b` → `20261011c` (aynı 15 dosyada 76 geçiş). **Ek:** `app/core/helpers.js` ortak sürümü değil kendi pinini taşıyordu (`20260903b`); katı pin tazeliği testi bunu yakaladı, `index.html` ve `sw.js`'de `20261011c`'ye yükseltildi. Ders: ortak sürüm dışındaki pinler (`helpers.js` gibi) her yayında `test_asset_pin_freshness` ile ayrıca denetlenmeli. `pinDeferral.files` boşaltıldı.
  - Hedefli kapı betiği depoya eklendi: `kao3-premium/araclar/kapi-hedefli.sh` (K-Q).
- Ölçüler: değişmedi (K3P-A2 ölçüleri; runtime 121,007 KiB)
- Kapı (K-Q): tests/app 78 · tests/panel-v2 27 · tests/quran 9 · tests/panel 23 · curriculum + inventory + deney_rapor · driver + zikr · reminders smoke · pin senkronu · asset pin freshness · focus_lock — hepsi PASS (46 sn)
- Kanıt düzeyi: kaynak/test · canlı doğrulama yayından sonra · cihaz yok
- Gözlem: —
- Sıradaki: K3P-A3

## seq 20 · K3P-A3 · KART
- Tarih: 2026-10-11
- Commit: (bu commit)
- Yapılan:
  - `quranLearnFlow.js` `lessonPlan(snapshot, id, now, content, reviews)`: nefes ritmi (AKIS §3) — hedef → ısınma (vadeli tekrarların kararlılığı `s` en yüksek ≤ 5'i; 3'ün altındaysa dersin bilinen kelimelerinin ar>tr görevleriyle tamamlanır) → [tanış → hemen o kelimenin 2 şıklı ar>tr görevi] × (yeni + bu derste tanışılmış kelime) → kavram + hemen ilk gramer görevi → karışık pekiştirme (kalan ders görevleri + kalan tekrarlar; tür blokları ≤ 5, en çok bloğu kalan tür önce, aynı tür bloğu yan yana gelmez; aynı kart art arda gelmez) → uygula → özet. **Görev kümesi aynı** (yalnız sıra; eski `slice(0,10)` kümesi korunur), K2F-11 ayırıcı kodu blok sıralayıcıyla değişti. `reviews` verilmezse (Bugün tahmini, `lessonTaskCount`) plan tekrarsız kurulur.
  - `quranLearn.js`: ayrı `review` ön fazı kalktı; tekrarlar `group:'review'` plan öğesi (`queue` = kuyruk öğesi), görevi eskisi gibi `{seed:id}` ile kurulur. `kaoLessonResume`: `itemId` bekleyen görevin plan öğesi; bekleyen görev tekrar ise `lessonItemId` sıradaki ders adımı; yeniden denemede blok sonrası. `kaoLessonStart`: yarım kalan tekrar sıradaki ders adımının önüne alınır, öncesindeki tekrarlar vadeli kalır (sonraki oturum); eski `phase:'review'` kayıtları `lessonItemId`'den sürer. Şema (`phase/itemId/lessonItemId`), FSRS, kuyruk notlaması, `kaoUnitSession` ve tutarlılık kapısı değişmedi. Hedef metni ritme göre: "Önce ısın, sonra tanış ve hemen dene; pekiştir, metinde bul." (38 → 39 sözcük).
  - Yeni test `tests/kao/test_k3p_rhythm.js` (5 kontrol; envanter 61). `akis-olc.cjs`: "art arda en uzun edilgin dizi" ve "ilk yeni içeriğe (tanış) dokunuş" satırları; 3. ölçüm artık Bugün'ün başlattığı dersi yarıda bırakıp aynı dersi sürdürür (önce u01.02 başlatılıp u01.01'e bakılıyordu) ve "aynı görev" der.
  - **Eski testler (gerekçeli güncelleme, gevşetme yok):** `test_kao2_lesson_flow.js` — (1) "tanış ×N → kavram → pekiştir" sırası yerine her tanıştan hemen sonra o kelimenin 2 şıklı görevi + kavramdan hemen sonra görev denetlenir; (2) "ilk görev 2 şık + tek sıralı yön dizisi" yerine tanış-sına görevleri 2, diğerleri 4 şık + karışık bölümde her tür tek blok (gramer yalnız K2F-11 için bölünebilir); (3) oynatıcı testi "vadeli tekrar ayrı ön fazda, hedeften önce" yerine "hedef önce, tekrar ısınmada, ardından ilk tanış"; (4) `introCards` yardımcısı tanışları art arda varsayıp ilk görevde duruyordu, artık görevleri gerçek handler'la cevaplayıp kavrama kadar sürer. `test_k3p_distractors` kararlılık tabanı (`$TMPDIR/k3p-01-secimler-onceki.json`, yerel, depoda değil) yenilendi; eskisi `…onceki.K3P-01.json`. Taban anahtarı yürüyüş sırası + şık sayısı olduğundan sıra değişince bilerek geçersizleşir; yenilemeden önce çift şık 0/1087 + 0/1127 ve görev toplamları aynı.
  - K-P: `app/core/quranLearn.js`, `app/core/quranLearnFlow.js` → `pinDeferral.files`.
- Ölçüler (akis-olc, u01.02, yerleşik): art arda en uzun edilgin dizi 6 → **1** (özet hariç) · ilk yeni içeriğe 21 → **7.** dokunuş · görev sayısı 30 → 30 (109 dersin hepsinde K3P-A2 tabanının ±%20'si içinde; değişmedi) · ritim `[goal] G×5 ([intro] G)×4 [concept] G×21 [apply]` · yarıda bırak → yeniden aç: aynı görev, çözülen görev yeniden sorulmuyor · çift şık 0/1087 + 0/1127 · runtime 121,007 → **122,336 KiB** (tavan 128) · p95 4,6 ms
- Kapı (K-Q): hedefli kapı PASS (tests/app 78 · kao 12: navigation, a11y, inventory, design_contract, k3p_rhythm, lesson_flow, lesson_coherence, mastery, denetim, distractors, mount, focus_lock · driver; perf ayrıca PASS) · akis-olc + cift-sik · **yavaş testler atlanmadı** (plan değişikliği gramer görevlerinin sırasını etkilediği için): `test_kao2_grammar_tasks` 39/39 PASS (ilk koşuda C8 "u03.01 aynı tür ardışık" yakalandı → blok sıralayıcı düzeltildi), `test_kao2_kabul` 10/10 PASS, A-9 197/197 (eşzamanlı yükle koşulan ilk denemede A-9 `distractors` çocuğunu kırmızı saydı; tek başına `distractors` exit 0, kabul tek başına yeşil) · kapi-hizli tamamı ve kapilar.sh koşulmadı (K3P-A8)
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: (1) **Açılış → ilk görev 2 → 3 dokunuş:** hedef ekranı artık ilk görevden önce (AKIS §3 ①), `targets.flow.tapsOpenToFirstTask: 2` ve AKIS §1 "Giriş zaten kolay — korunacak" ile çatışıyor; karar kullanıcıda. (2) Tekrarı olmayan yeni kullanıcıda hedef + ilk tanış yan yana kalır (ısınma malzemesi yok); test bunu tek istisna olarak sınar. (3) Başlatıcı metni sıradakini "K3P-A4" diyordu; `executionOrder` ve KARTLAR.md ("K3P-15 bu dalgada, K3P-A3'ten sonra") K3P-15 diyor — sıra değiştirilmedi.
- Sıradaki: K3P-15

## seq 21 · K3P-15 · KART
- Tarih: 2026-10-11
- Commit: (bu commit)
- Yapılan:
  - `quranLearn.js` üç kollu geri bildirim (K-C): `kaoLatencyMedian`/`kaoLatencyPush`/`kaoCorrectPauseMs`, `KAO_LATENCY_WINDOW=50`, `KAO_LATENCY_MIN=5`, `KAO_FAST_ADVANCE_MS=600`, `KAO_SLOW_ADVANCE_MS=1600` adlandırılmış sabitler. `kaoOpenFeedback(ui,task,correct,choiceId,note,elapsed)` artık medyanı okur ve `panel.slow` yazar; `kaoAdvanceMs(panel)` kolu süreye çevirir; `kaoAutoAdvance(ui,q,delayMs)` yalnız doğru cevapta kurulur (yanlış öğretir).
  - `kaoTaskHTML` geri bildirim bölümü üç kola ayrıldı: autoAdvance açık + hızlı doğru → tam panel yok (şık ✓ + 600 ms); yavaş doğru ya da ayar kapalı → `.kao-feedback-strip` (tek satır, `role=status`) + `.kao-feedback-strip-continue` (mevcut `App.kaoContinue` ile bağlı — yeni `App.kao*` yok); yanlış → tam kart + geri alma. `paintTask` odağı yalnız yanlışta Devam'a taşır.
  - `kaoPlay` çalınca `ui.kaoPlayed=true` (K-C "ses tekrar dinlendi" → yavaş kol); işaret görev başında/`next`/`kaoContinue`/`kaoUndo` ile sıfırlanır. `emptyQuranLearn` yeni kullanıcı için `autoAdvance: true`; `ensureQuranLearn` mevcut kayıtlı değeri değiştirmez. `kaoContinue` panel `correct` ise süreyi medyana yazar (kaoUndo anlık görüntüyle geri alır).
  - Yeni test `tests/kao/test_k3p_feedback_arms.js` (10 kontrol; envanter 62). `dokunus-olc.cjs` üç kolu ölçer (yavaş/şerit/hızlı satırı).
  - **Gerekçeli test güncellemeleri (gevşetme yok):** `test_kao2_feedback` (900 ms → 600/1.600 ms; doğru panel başlığı → şerit), `test_kao2_components` (doğru: panel → şerit), `test_k3p_feedback_copy` (üç kol denetimi; tam panel/şerit/hızlı), `test_kao2_settings` (varsayılan artık açık), `test_kao_migration` (boş kökte `autoAdvance: true`), `test_kao_requirements` (A-9 seçili sayı 8 → 9), `test_kao2_kabul` (A-3 işaretçisi `kao-feedback` → `kao-choice-correct`; hızlı doğruda panel yok).
- Ölçüler (hepsi doğru, u01.01): ders başına dokunuş 69 (kapalı) / 39 (açık) → **39 ≤ 40** · kollar: yavaş(şerit) 21 · hızlı 9 · şerit 21 · çift şık 0/1087 + 0/1127 · okunuş hatası 0 · runtime 122,336 → **123,328 KiB** (tavan 128) · css 13,035 → **13,072 KiB** (tavan 14) · p95 5,96 ms · steady 3,80 ms
- Kapı (K-Q): hedefli kapı PASS (app 78 · kao 5: navigation, a11y, inventory, design_contract, feedback_arms · driver · perf) · **hızlı kapı TAM YEŞİL** (kao ailesi + sözleşme/pin fixture'ları + driver + cift-sik + okunus-denetim) · **üç yavaş test yeşil**: `test_kao2_grammar_tasks` 39/39, `test_kao2_denetim` 10/10, `test_kao2_kabul` 10/10 (A-3 işaretçisi düzeltildikten sonra) · senkron PASS
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: (1) `pinDeferral.files`'a `app/kao.css` eklendi (stil değişikliği). (2) Şerit düğmesi `App.kaoContinue` ile bağlandı; K-D "yeni `App.kao*` yok" korundu. (3) `dokunus-olc` yalnız doğru-cevap kollarını ölçer; ustalık/bağ kur/gecikmeli yollar aynı motordan geçer ama ayrı ölçülmedi. (4) Medyan ilk yanıtta belirsizdir (yavaş kola düşer); KARARLAR gereği kesin ölçüm tarihli kayıt ister — şema kararı.
- Sıradaki: K3P-A4

## seq 22 · — · YAYIN
- Tarih: 2026-10-11
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı "canlıya al" dedi; beşinci ara yayın. Yayına giden çalışma zamanı değişiklikleri: K3P-A3 (nefes ritmi; `quranLearnFlow.js`, `quranLearn.js`) ve K3P-15 (üç kollu geri bildirim; `quranLearn.js`, `kao.css`).
  - Ortak sürüm `20261011c` → `20261011d` (index.html 23 · sw.js 23 · panel-v2.html 4 geçiş; `SW_VERSION` dâhil) ve pini doğrulayan 12 test dosyası aynı commit'te güncellendi. `pinDeferral.files` boşaltıldı.
- Ölçüler: K3P-15 sonrası — runtime 123,328 KiB (tavan 128) · css 13,072 KiB (tavan 14) · çift şık 0/1127 · okunuş hatası 0 · ders başına dokunuş 39 (≤40)
- Kapı (K-Q): tam kapı `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` + pin senkronu + pin tazeliği + tests/kao yavaş üçlü — ayrıntı aşağıdaki raporda
- Kanıt düzeyi: kaynak/test · canlı doğrulama yayından sonra · cihaz yok
- Gözlem: —
- Sıradaki: K3P-A4

## seq 23 · K3P-A4 · KART
- Tarih: 2026-10-12
- Commit: (bu commit)
- Yapılan:
  - `quranLearnFlow.js`: K-O zaman bütçesi. `measuredPerTaskMs(daily,now)` (son 7 günün ms/answered ortalaması; taban **6 sn**) ve `taskBudget(capMinutes,daily,now)` = `floor(seçilen dk ÷ görev süresi)`. `lessonPlan` önce bütçe uygular: ısınma **en kararlı (s) 3–5** ve kırpmadan muaf; kalan yer en düşük R'li tekrarlara verilir (`dueByR`). Güvenlik ağı: toplam görev (dersin özü + tekrarlar) ≤ bütçe; ısınma yine korunur. R, Flow'a eklenen yerel FSRS unutma eğrisiyle hesaplanır (`BUDGET_FACTOR/BUDGET_DECAY`, motor sabitlerine bağımlı değil). `applyPlan` çıktısına `maxMinutes: capMinutes` eklendi. **Bugün ekranı** (`lessonStep`) tahmini hizalandı: `fitReviews = min(vadeli, max(min(vadeli, WARMUP_MAX), bütçe − öz))`, gösterilen tekrar sayısı sığan planla aynı.
  - Yeni test `tests/kao/test_k3p_budget.js` (8 kontrol; envanter 63). K-P: `app/core/quranLearnFlow.js` → `pinDeferral.files`.
  - **Gözlem (kapsam dışı):** `test_asset_pin_freshness` K3P-15 kapanışında `app/kao.css`'i listeye almam gerektiğini hatırlattı; bu kez `quranLearnFlow.js` eklendi.
- Ölçüler: 5 dk + 60 vadeli kart, ölçümsüz kullanıcı → görev başına 6 sn, plan ≤ 41 görev kırpılmaz (davranış korunur); 20 sn/görev → bütçe 13 görev → plan 18 görev, tekrar 20→5; **Bugün reviews = plan reviews** (9/20/30 sn: 20/5/5), Bugün `~dk` ≤ seçilen · `akis-olc` 1) 3 dokunuş (K3P-A3'ten beri açık) · 2) 30 görev, ritim 1 edilgin · 3) ~4 dk · runtime 123,328 → **124,593 KiB** (tavan 128) · css 13,072 KiB · p95 6,74 ms/steady 4,08 ms · dokunus-olc 69→39 (kapalı/açık)
- Kapı (K-Q): `kapi-hizli --kart K3P-A4 --yavas` (prompt gereği) + hedefli kapı PASS (app 78 · kao 5: navigation, a11y, inventory, design_contract, budget · driver · perf) · üç yavaş test yeşil (`kabul` 10/10, `grammar_tasks` 39/39, `denetim` 10/10) · çift şık 0/1127 · okunuş 0 · kao-plan-check PASS · pin tazeliği PASS
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: (1) **Isınma vs bütçe çelişkisi** kullanıcı kararıyla çözüldü (ısınma en yüksek s + muaf; kırpma/sıra en düşük R). (2) Bütçe tabanı 6 sn olduğu için ölçümsüz kullanıcıda kırpma bağlayıcı değil; "seçilen dakikaya sığma" ölçülmüş süreye dayanır (K3P-03 tabanı). (3) Perf göreli bandı bu koşuda kırmızıydı (7,2 ms > 6,36 ms bant, yavaş makine); mutlak tavanlar (runtime/css/p95) yeşil.
- Sıradaki: K3P-A5

## seq 24 · — · YAYIN
- Tarih: 2026-10-12
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı "canlıya al" dedi; altıncı ara yayın. Yayına giden çalışma zamanı değişikliği: K3P-A4 (oturum zaman bütçesi; `quranLearnFlow.js`).
  - Ortak sürüm `20261011d` → `20261011e` (index.html 23 · sw.js 23 · panel-v2.html 4 geçiş, `SW_VERSION` dâhil; pini doğrulayan 12 test dosyası aynı commit'te). `pinDeferral.files` boşaltıldı.
  - **Önceki kartların tamlığı doğrulandı:** tam kapı (tüm test aileleri) + senkron; 12/12 kart kayıtlı, LEDGER'da KART kaydı var, commit'li.
- Ölçüler: değişmedi (K3P-A4 ölçüleri; runtime 124,593 KiB)
- Kapı (K-Q): `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → TÜM KAPILAR YEŞİL (tests/kao 63 · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · çift şık · okunuş · plan-check · pin senkronu · tekrar-üretim 10/10 · perf)
- Kanıt düzeyi: kaynak/test · canlı doğrulama yayından sonra · cihaz yok
- Gözlem: —
- Sıradaki: K3P-A5

## seq 25 · K3P-A5 · KART
- Tarih: 2026-10-12
- Commit: (bu commit)
- Yapılan:
  - `quranLearn.js`: K-K uyarlanır zorluk. Sabitler `KAO_FLOW_WINDOW=8, KAO_ANXIETY=0.70, KAO_BOREDOM=0.92, KAO_ANXIETY_WRONG=2, KAO_REINTRO_WRONG=3, KAO_HELP_GRADE=2`. `kaoWindowPush`/`kaoFlowRate`/`kaoSessionFlow` (kayan pencere yalnız `ui`), `kaoAnxiety`/`kaoBoredom`/`kaoHelp`/`kaoChoiceCap`. `currentTask` görevi şık kapağıyla kurar (akış/sıkılma 4 · kaygı 3 · art arda 3 yanlış 2) ve `kaoTrimChoices` ile 4→3→2 uygular. `kaoOpenFeedback` pencereyi ve art arda yanlış sayacını günceller; 3 yanlışta `kaoReintro` paneline yeniden tanış (anlam + ses) ekler; kaygı bandında `kaoInjectEasy` araya bilinen kolay kart koyar (yalnız kuyruk). `kaoShouldAutoplay` kaygı kolunda sesi otomatik çalar. `kaoGrade` `difficulty` parametresi alır (kolaylaştırılmış doğru = Hard 2). Sıkılmada `kaoBoredomHideHarakat` Arapça çiftlerde harekeleri solutur. Pencere ders başında sıfırlanır; `kaoContinue`/`kaoUndo` ilgili `ui` alanlarını temizler/geri alır; enjekte kolay kart devam işaretçisine yazılmaz.
  - Yeni test `tests/kao/test_k3p_dda.js` (6 kontrol; envanter 64). `akis-olc.cjs` 4. ölçümü uyarlanır etkiyi yazar. K-P: `app/core/quranLearn.js` → `pinDeferral.files`.
- Ölçüler: `akis-olc` 4) 2 yanlıştan sonra şık ≤3 **evet** (2,2), akışa dönünce 4 **evet**; ders başına dokunuş 69→39 · runtime 124,593 → **126,173 KiB** (tavan 128) · css 13,072 KiB · p95 13,08 ms/steady 8,36 ms (yavaş makine) · çift şık 0/1127 · okunuş 0
- Kapı (K-Q): `kapi-hizli --kart K3P-A5 --yavas` (prompt gereği) · üç yavaş test yeşil (`kabul` 10/10, `grammar_tasks` 39/39, `denetim` 10/10) · `test_kao_fsrs` + `test_kao_queue` PASS · kritik regresyonlar (rhythm, feedback_arms, distractors, feedback, lesson_flow, next_step, budget, settings, design_contract, a11y, migration×2) PASS · pin tazeliği PASS
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: (1) Varsayılan şık kapağı **4** olmalıydı (AKIS "4→3→2'ye iner"); ilk uygulamada 3'e indiriyordum, düzeltildi — mevcut 4 şıklı görevleri bozmamak için kritik. (2) Enjekte kolay kart devam işaretçisine (`record.resume`) sızıyordu; guard eklendi (uyarlanır durum kalıcı olmaz). (3) Kayan pencere uygulama bloğunda değil **ders (oturum) başında** sıfırlanır. (4) Runtime payı ~1,8 KiB'a indi; sıradaki kod ekleyen kart önce eski kodu silmeli.
- Sıradaki: K3P-A6

## seq 26 · K3P-A6 · KART
- Tarih: 2026-10-12
- Commit: (bu commit)
- Yapılan:
  - `quranLearn.js`: `KAO_SECTION_LABELS`, `kaoSectionOf(item)` (goal ①, practice/review ②, intro/concept ③, practice/lemma ④, apply/read/summary ⑤), `kaoLessonSection(state)` (bölüm + indexInSection/countInSection), `kaoSectionValuetext`. Ders modeline `section/sectionLabel/sectionPercent/sectionValuetext` eklendi. Görev görünümünde 5 bölümlü çubuk çizilir; eski `kao-task-progress` ve kullanılmayan `taskCount/taskPosition` kaldırıldı.
  - `quranLearnViews.js` `lessonScreen`: 5 segmentli `kao-lesson-progress` (role=progressbar, aria-valuemin/max/now/valuetext), etkin bölüm kendi içinde dolar, `data-lesson-section`.
  - `kao.css`: `.kao-lesson-progress` grid 5 sütun + `.kao-lesson-progress .kao-lesson-seg>i`; D-3 sabit eylem bölgesi `.kao-lesson>.kao-lesson-next,.kao-lesson>.kao-lesson-more{position:sticky;bottom:calc(8px + env(safe-area-inset-bottom,0px))}` ve `.kao-task>.kao-choices{...}`. Eski `.kao-task-progress` kaldırıldı.
  - Yeni test `tests/kao/test_k3p_progress.js` (4 kontrol; envanter 65). `test_kao2_feedback` gerekçeli güncellendi (ilerleme çubuğu 5 bölümlü oldu). K-P: `quranLearnViews.js`, `kao.css` → `pinDeferral.files`.
- Ölçüler: runtime 126,173 → **127,079 KiB** (tavan 128; pay ~0,9 KiB) · css 13,072 → **13,128 KiB** (tavan 14) · p95 ~12 ms/steady 7,1 ms · çift şık 0/1127 · okunuş 0 · kontrast 726 çift/0 ihlal · ders başına dokunuş 39
- Kapı (K-Q): `kapi-hizli --kart K3P-A6 --yavas` → HIZLI KAPI YEŞİL (ilk koşuda yalnız `test_asset_pin_freshness` kırmızıydı; K-P listesine 2 dosya eklenince yeşil) · üç yavaş test yeşil (`kabul` 10/10, `grammar_tasks` 39/39, `denetim` 10/10) · `test_kao2_a11y` + `test_kao2_design_contract` + kontrast + çift şık + okunuş PASS
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: (1) Görev görünümünde ders ekranı yerini görev görünümüne bıraktığı için bölüm çubuğu oraya da eklendi; K2F-28 "tek ilerleme çubuğu" kuralı eski çubuğu kaldırıp 5 bölümlüyle değiştirerek korundu (yeni çubuk eklenmedi, tek çubuk). (2) `.kao-lesson-seg` a11y'nin "sabit yükseklik" taramasına takıldı; seçici `.kao-lesson-progress .kao-lesson-seg` yapıldı (progress içeriyor). (3) Runtime payı ~0,9 KiB'a indi; sıradaki kod ekleyen kart önce yer açmalı.
- Sıradaki: K3P-A7

## seq 27 · — · YAYIN
- Tarih: 2026-10-12
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı "canlıya al" dedi; yedinci ara yayın. Yayına giden çalışma zamanı değişiklikleri: K3P-A5 (uyarlanır zorluk; `quranLearn.js`) ve K3P-A6 (5 bölümlü ilerleme + sabit eylem bölgesi; `quranLearn.js`, `quranLearnViews.js`, `kao.css`).
  - Ortak sürüm `20261011e` → `20261011f` (index.html 23 · sw.js 23 · panel-v2.html 4 geçiş; pini doğrulayan 12 test dosyası aynı commit'te). `pinDeferral.files` boşaltıldı.
- Ölçüler: K3P-A6 sonrası — runtime 127,079 KiB (tavan 128) · css 13,128 KiB (tavan 14) · çift şık 0/1127 · okunuş 0 · ders başına dokunuş 39 · bölümlü ilerleme 5/5
- Kapı (K-Q): `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → TÜM KAPILAR YEŞİL (tests/kao 65 · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · çift şık · okunuş · plan-check · pin senkronu · tekrar-üretim 10/10 · perf)
- Kanıt düzeyi: kaynak/test · canlı doğrulama yayından sonra · cihaz yok
- Gözlem: —
- Sıradaki: K3P-A7

## seq 28 · K3P-A7 · KART
- Tarih: 2026-10-12
- Commit: (bu commit)
- Yapılan:
  - `quranLearn.js`: `kaoResumeSectionForLesson(q,lessonId,now)` — yarım kalan dersin bölümü **yalnız mevcut `path.lessons[id].resume`** alanından okunur (yeni veri alanı yok); plan yeniden kurulur, `resume.phase==='practice'` ise `lessonItemId`, değilse `itemId` plan adımına eşlenir ve `kaoLessonSection` ile bölüm bulunur. `kaoHomeHero`: `daily/next-unit/mastery/repair` adımında birincil eylem **"Kaldığın yerden · Bölüm n/5"**. `kaoHubModel`: devam varsa alt satır **"Kaldığın yerden devam et"** (niyet önerisi varsa korunur).
  - Yeni test `tests/kao/test_k3p_resume.js` (5 kontrol; envanter 66). K-P: `app/core/quranLearn.js` → `pinDeferral.files`.
- Ölçüler: `akis-olc` 3) yeniden açılışta birincil "Kaldığın yerden · Bölüm 4/5" **var** · runtime 127,079 → **127,453 KiB** (tavan 128; pay ~0,5 KiB) · css 13,128 KiB · p95 9,8 ms/steady 6,1 ms · çift şık 0/1127 · okunuş 0 · ders başına dokunuş 39
- Kapı (K-Q): `kapi-hizli --kart K3P-A7 --yavas` → HIZLI KAPI YEŞİL · üç yavaş test yeşil (`kabul` 10/10, `grammar_tasks` 39/39, `denetim` 10/10) · `test_kao2_today` + `test_kao2_hub` + `test_kao2_a11y` + `test_kao2_design_contract` + `test_kao2_navigation` PASS · pin tazeliği PASS
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: (1) Devam ipucu bilerek yalnız `resume` alanından türetilir; yeni veri alanı eklenmedi (prompt şartı). (2) Runtime payı ~0,5 KiB'a indi; **sıradaki kod ekleyen kart (A8 ve sonrası) önce eski kod silmeli**, yetmezse §5 gereği tavan kararı kullanıcıdan istenir.
- Sıradaki: K3P-A8

## seq 29 · — · YAYIN
- Tarih: 2026-10-12
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı "canlıya al" dedi; sekizinci ara yayın. Yayına giden çalışma zamanı değişikliği: K3P-A7 (görünür devam "Kaldığın yerden"; `quranLearn.js`).
  - Ortak sürüm `20261011f` → `20261011g` (index.html 23 · sw.js 23 · panel-v2.html 4 geçiş; pini doğrulayan 12 test dosyası aynı commit'te). `pinDeferral.files` boşaltıldı.
- Ölçüler: K3P-A7 sonrası — runtime 127,453 KiB (tavan 128) · css 13,128 KiB (tavan 14) · çift şık 0/1127 · okunuş 0 · ders başına dokunuş 39 · devam ipucu "Kaldığın yerden · Bölüm 4/5"
- Kapı (K-Q): `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → TÜM KAPILAR YEŞİL (tests/kao 66 · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · çift şık · okunuş · plan-check · pin senkronu · tekrar-üretim 10/10 · perf)
- Kanıt düzeyi: kaynak/test · canlı doğrulama yayından sonra · cihaz yok
- Gözlem: —
- Sıradaki: K3P-A8

## seq 30 · K3P-A8 · KART (Dalga A kapanışı)
- Tarih: 2026-10-12
- Commit: (bu commit)
- Yapılan:
  - `kao3-premium/araclar/akis-olc.cjs`: sözcük sayımı artık **ilk görünüm** ölçüsü — `<details>` gövdesi sayılmaz, yalnız `<summary>` sayılır (yorumda yazılı). Yeni **2b** bölümü 109 dersin tamamını tarayıp `goal`/`intro`/`concept` ilk görünümünü ve >45 sayısını yazar.
  - `app/core/quranLearnViews.js`: tanış kartında kognat + çapa + örnek âyet + "Neden böyle?", kavram kartında tablo + terimler ve **kural cümlesi**, hedef kartında vaat tek bir yerel `<details class="kao-lesson-more"><summary>Daha fazla</summary>…</details>` içine taşındı. **Handler eklenmedi; içerik metni değişmedi, yalnız sunum** (örnek âyetin `kao-lesson-example` sınıfı ve terimlerin metni aynen korundu).
  - `app/kao.css`: `.kao-lesson-more` (özet `min-height:44px`, `:focus-visible` halkası, açılır `::after` işaretçisi, `[open]` dönüşü, forced-colors) eklendi; artık üretilmeyen `.kao-lesson-why` / `.kao-lesson-term` kuralları **silindi**; `.kao-lesson-why-title` / `.kao-lesson-term-note` katlanan bloğun içi için tanımlandı.
  - **Bütçe için ölü kod silindi** (repo geneli çağrı taraması): `quranLearn.js` → `cellText`, `cellPronunciation`, `kaoBoredom`, `kaoCorrectPauseMs` (hiçbiri üretimde çağrılmıyordu).
  - `tests/kao/test_kao2_a11y.js`: yeni kontrol (14. kontrol) — katlanan blok doğal `<details>/<summary>`, özeti ≥44 px + `cursor:pointer` + `:focus-visible`, işaretçi döner, ders kartında **en çok bir** katlanan blok, içerik `<summary>` dışında; 100+ ders kartı gerçek akışla sınanır.
  - `tests/kao/test_kao2_lesson_flow.js`: K2F-25 assertion'ı yeni sunuma gerekçeli uyarlandı (katman artık `<details class="kao-lesson-more"><summary>Daha fazla</summary>`; içeriksiz `why` başlığı gösterilmez; örnek âyet katmanın içinde).
  - `tests/kao/README.md` envanter satırı güncellendi. K-P: `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/kao.css` → `pinDeferral.files`.
- Ölçüler (yeniden ölçüm; AKIS §6b tablosu eklendi):
  - İlk görünüm, zirve hariç — **goal ≤ 41** (u10.01) · **tanış ≤ 33** (u06.29) · **kavram ≤ 24** (u03.01) sözcük; **>45: 0 / 633 ekran** (taban: sırasıyla 54 · 78 · 139 · 7/… ekran aşıyordu).
  - `akis-olc` 2) ritim: `[goal:26] G×5 [intro:25] G×1 [intro:25] G×1 [intro:25] G×1 [intro:24] G×1 [concept:18] G×21 [apply:99]`; art arda edilgin dizi **1**; ilk yeni içeriğe **7.** dokunuş (korundu).
  - runtime 127,453 → **127,654 KiB** (gzip level-9; tavan 128; pay ~0,35 KiB) · css 13,128 → **13,190 KiB** (tavan 14) · `test_kao2_mastery`'nin level-6 koşusu 128,071 KiB (tavan altı) · p95 5,4 ms/steady 3,3 ms · çift şık 0/1087 + 0/1127 · okunuş 0 + 0 · kontrast 726 çift/0 ihlal · ders başına dokunuş 39 (otomatik geçiş açık) / 69 (kapalı).
- Kapı (K-Q): `kapi-hizli --kart K3P-A8` → **HIZLI KAPI YEŞİL** (66 kao + sözleşme/pin + driver + ölçü kapıları). **Dalga sonu:** `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → **TÜM KAPILAR YEŞİL** (tests/kao 66 · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · çift şık · okunuş · plan-check · pin senkronu · tekrar-üretim 10/10 · perf).
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: (1) Kavram ekranında kural cümlesi de katlanır: ilk görünüm başlık (kuralın özeti) + "Daha fazla" kalır (≤24 sözcük). Kuralı görünür bırakma denemeleri (ilk cümle / 20 sözcük eşiği) 45 sözcük tavanını ya aşıyor ya da keyfî bir eşik gerektiriyordu; D-4 bütçesi metin kaybına yeğlendi. Kullanıcı kuralı açık isterse ayrı kart konusu.
  (2) Katlanan blok `<details>`'in içinde `<summary>` dışındaki `<p>`'leri ölçüm aracı doğru dışlıyor; `text()` etiketi boşlukla değiştirdiği için bağlam satırı ile `<h3>` arası birleşme olmuyor.
  (3) Eski `why` katmanı iki `introWhy` fonksiyonu tanımlanmış hâlde bulundu (ikincisi ilkini gölgeliyordu); bütçe için tek tanıma indirildi — davranış değişmedi.
  (4) **Devralınan ölçüm tutarsızlığı:** START'ın verdiği 127,45 KiB `test_kao2_mastery`'nin level-6 gzip'inden; `test_kao2_perf_budget` level-9 (127,45) okur. İkisi de tavanın altında; ölçüm yöntemi farkı LEDGER'a not edildi.
- Sıradaki: K3P-06

## seq 31 · — · YAYIN (dokuzuncu ara yayın · K3P-A8)
- Tarih: 2026-10-13
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı "tümünü canlıya al arayüz doğrulamalarını yap ve sıradaki adımdan devam et" dedi; **açık yayın onayı** verildi.
  - Yeni araç `kao3-premium/araclar/pin-yukselt.mjs` (K3P-27 §1): `git diff main` ile değişen varlıkları bulur, **ortak sürüm** kuralıyla aynı pini paylaşan tüm dosyaları birlikte yükseltir, `SW_VERSION`/`SW_OFFLINE_VERSION`/`serviceWorker.register` satırını ve pini doğrulayan test sabitlerini tek geçişte günceller; `--dene` yalnız önizleme.
  - Ortak sürüm `20261011g` → **`20261013a`**: index.html 24 · sw.js 23 · panel-v2.html 4 + 15 test dosyası (79 geçiş). `pinDeferral.files` boşaltıldı → tazelik testinde **ERTELENDİ satırı yok**.
  - **K3P-A8 regresyon düzeltmesi (kapsam içi):** katlanan blokların `<summary>` düğmeleri `MODAL_FOCUS_SELECTOR`'a eklendi. Öncesinde Tab/Shift+Tab onları atlıyordu; klavye kullanıcısı "Daha fazla"yı açamıyordu. Yeni kontrol `tests/app/test_modal_focus_containment.js` içinde. `app.js` satır bütçesi (≤7800) korundu.
- Ölçüler: K3P-A8 sonrası — runtime 127,654 KiB (tavan 128) · css 13,190 KiB (tavan 14) · p95 8,5 ms/steady 3,8 ms · çift şık 0/1087 + 0/1127 · okunuş 0 + 0 · edilgin ekran ilk görünümü goal ≤41 · tanış ≤33 · kavram ≤24 sözcük
- Kapı (K-Q): `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → **TÜM KAPILAR YEŞİL** (tests/kao 66 · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · çift şık · okunuş · plan-check · pin senkronu · tekrar-üretim 10/10 · perf)
- Görsel QA: **kontrollü yerel** (port 9000, boş geçici profil, token/forceSync yok) → **71 ekran görüntüsü**, düzen taşması 0; kontak sayfası gözle doğrulandı: hedef/tanış/kavram kartlarında "Daha fazla ›" katlaması doğru, kırılma yok. Kaynak-görsel kanıt; cihaz kabulü değildir.
- Kanıt düzeyi: kaynak/test · görsel QA **var** (yerel, redakte) · cihaz yok
- Gözlem: (1) İlk tam kapı denemesi iki satır-bütçesi testini kırdı (`app.js` 7803 > 7800); yorum tek satıra indirilerek düzeltildi, ikinci tam kapı temiz.
  (2) İlk çalışan tam kapı, `app.js` düzeltmesinden önce başlatıldığı için iptal edilip yeniden koşuldu; sonuç bu commit'in ağacına aittir.
  (3) K3P-A8 katlanan bloklarında kavram kural cümlesi de katlanır (LEDGER seq 30 gözlem 1).
- Sıradaki: K3P-06

## seq 32 · — · YAYIN (yayın tamamlandı + K3P-06 başlatıcısı)
- Tarih: 2026-10-13
- Commit: (bu commit)
- Yapılan:
  - `kao3-premium` → `main` **fast-forward** birleştirildi (main = 421b80e0 idi, tek adım ileri). `git push origin main` → `421b80e0..b5168d9c`.
  - Pages koşusu **38363872562** → `status=completed conclusion=success`.
  - Canlı pin **yalnız GET** ile doğrulandı: `https://mustafaras.github.io/s/index.html` → `quranLearn.js?v=20261013a`, `sw.js?v=20261013a`; `sw.js` → `SW_VERSION='20261013a'`, `SW_OFFLINE_VERSION='iip22-20261013a'`. Uygulama tarayıcıda açılmadı.
  - Yeni oturum başlatıcısı `kao3-premium/STARTER-06.md` eklendi (Dalga 1 ilk kartı K3P-06; token sözleşmesi + `app.js` 7800 satır ve runtime bütçesi uyarıları).
  - `CURRENT-STATE` yayın sonrası duruma çekildi ve `STARTER-06`'ya yönlendirildi. `K3P-STATE.status=planned`, `releaseApproval=NOT_APPROVED` kalır (program sürüyor; K3P-27 kapanış onayı ayrıdır).
- Ölçüler: değişmedi (K3P-A8 ölçüleri; runtime 127,654 KiB · css 13,190 KiB). Canlı sürüm 20261013a.
- Kapı (K-Q): yayın öncesi tam kapı **TÜM KAPILAR YEŞİL**; yayın sonrası `senkron` → UYUMLU.
- Kanıt düzeyi: kaynak/test · görsel QA var (yerel, redakte) · **deploy kanıtı: Pages success + canlı pin GET** · cihaz yok
- Gözlem: Cihaz kabulü hâlâ kullanıcıda (açılışta yeni sürüm, bir ders, "Verileri sıfırla"ya dokunma).
- Sıradaki: K3P-06

## seq 33 · K3P-06 · KART (Dalga 1 · Görsel sistem, ilk kart)
- Tarih: 2026-10-13
- Commit: (bu commit)
- Yapılan:
  - `app/kao.css` açık (satır 1) ve koyu (satır 2) token bloklarına tasarım jetonları eklendi: materyal `--kao-mat-ground/card/moment`, gölge `--kao-shadow-1/-2`, Arapça ölçek `--kao-ar-hero/body/inline`, hareket `--kao-ease` + `--kao-dur-micro/transition/moment`. Bu kartta jetonları **kullanan** kural değişikliği yok (K3P-07…10).
  - Kaynak disiplini: renkler yalnız `--quran*`'tan `color-mix`; **yeni hex yok**. Süreler mevcut `--dur-*`'a bağlı (micro=dur-1, transition=dur-2, moment=dur-5); eğri `cubic-bezier(.2,.8,.2,1)`.
  - Sözleşme izin listeleri **gerekçeli genişletildi, gevşetilmedi**: `tests/kao/test_kao_render.js` tüketim regex'ine `mat-*/shadow-[12]/ease/dur-(micro|transition|moment)`; `tests/kao/test_kao2_design_contract.js` `tokenNames`'e 12 yeni jeton + yorum.
  - `pinDeferral.files`'a `app/kao.css` eklendi (K-P: pinli dosya değişti; K3P-27'de ortak sürümle yükseltilir).
- Ölçüler: css 13,190 → **13,335 KiB** (gzip, tavan 14) · runtime **127,654 KiB** (değişmedi, tavan 128) · app.js **7799 satır** (dokunulmadı, tavan 7800) · kontrast 726 çift/0 ihlal (kao) + 30/0 (global) · p95 5,65 ms.
- Kapı (K-Q): `kapi-hizli --kart K3P-06` → **HIZLI KAPI YEŞİL** (66 kao + sözleşme/pin + driver + ölçü kapıları). Dalga sonu değil → tam kapı koşulmadı (K3P-10'da).
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: (1) Koyu temada `--kao-mat-moment` birebir aynı reçeteyle (quran 88% + altın) açık temadan **daha açık** kalıyordu (koyu `--quran` mid-blue, açık navy'den yüksek parlaklıkta); TASARIM §5.1 "aynı, daha koyu" için koyu değer `--quran` %40 + `--quran-surface` olarak yüzeye sabitlendi. (2) `--kao-mat-ground` de TASARIM §5.1'deki koyu `--quran-bg`'nin (yarı saydam tint) **opak eşdeğeri** olarak `--quran-surface` üzerinden türetildi; `--quran-bg` yarı saydam olduğu için katmanlanınca zemin rengi değişirdi. K3P-09 (materyal hiyerarşisi) bu yüzeyi kullanacak. (3) `app/kao.css` pinli bir varlık; değişiklik `test_asset_pin_freshness`'ı ERTELENDİ'ye çevirdi (beklenen, K-P). (4) Kartın kendi kabul testi yok; jetonların doğruluğu sözleşme + kontrast araçlarıyla ve K3P-07…10'un kullanımıyla sınanacak.
- Sıradaki: K3P-07

## seq 34 · — · YAYIN (onuncu ara yayın · K3P-06)
- Tarih: 2026-10-13
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı "tümünü canlıya al ve devam et" dedi; **açık yayın onayı** verildi → `pin-yukselt.mjs 20261013b` ile ortak sürüm `20261013a` → **`20261013b`** (index.html 24 · sw.js 23 · panel-v2.html 4 + 12 test dosyası, 79 geçiş; yalnız değişen varlık `app/kao.css`). `pinDeferral.files` boşaltıldı → tazelik testinde ERTELENDİ yok.
  - Tam kapı (`KAO2_ACCEPT_SLOW_HOST=1`, yavaş makine) → **TÜM KAPILAR YEŞİL** (tests/kao 66 · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · çift şık · okunuş · plan-check · pin senkronu · tekrar-üretim 10/10 · perf). Yayın öncesi koşuldu.
  - `kao3-premium` → `main` **fast-forward** (3 commit); `git push origin main` → `b5168d9c..f20bd7ba`.
  - Pages koşusu **38375731941** → `status=completed conclusion=success` (headSha `f20bd7ba`). Canlı pin **yalnız GET** ile doğrulandı: `app/kao.css?v=20261013b`, `app/core/quranLearn.js?v=20261013b`, `sw.js` → `SW_VERSION='20261013b'`, `SW_OFFLINE_VERSION='iip22-20261013b'`; canlı `kao.css` ilk iki satırında yeni jetonlar (mat-ground/shadow-1/ar-hero/ease/dur-moment) ×2 tema var. **Uygulama tarayıcıda açılmadı.**
- Ölçüler: css 13,335 KiB (tavan 14) · runtime 127,654 KiB (tavan 128) · p95 4,133 ms/steady 3,005 ms · kontrast 726/0 + 30/0 · canlı sürüm 20261013b.
- Kapı (K-Q): yayın öncesi **TÜM KAPILAR YEŞİL**; yayın sonrası `senkron` → UYUMLU.
- Kanıt düzeyi: kaynak/test · görsel QA yok · **deploy kanıtı: Pages success + canlı pin GET (kao.css jetonları doğrulandı)** · cihaz yok
- Gözlem: Cihaz kabulü kullanıcıda (açılışta yeni sürüm; "Verileri sıfırla"ya dokunma).
- Sıradaki: K3P-07

## seq 35 · K3P-07 · KART (Dalga 1 · Görsel sistem, ikinci kart)
- Tarih: 2026-10-13
- Commit: (bu commit)
- Yapılan:
  - **İndirme (kullanıcı izniyle, yalnız `github.com/silnrsi`):** Scheherazade New v4.500 zip; SHA-512 `4ff5d859618b884e89d8a4a0c93c1823eec471b101bf6e3c4548e2493863b25e843a7ce63a12be772ac305b2dee49c2f7b1609ecea4a5208b6b5fa88198cd19c` resmî `SHA512SUMS.txt` ile birebir; SHA-256 `49c789c21305bed13d90d7500877b50d62db1e8e4d6f7715178e556319ddbda9`. Arşiv boş dizinde açıldı.
  - **Araç:** `tools/kao/kao-font-subset.mjs` — içerik+motorda geçen Arapça kod noktalarını sayar, her zaman gereken işaret/noktalama ile birleştirir (105 kod noktası / 11 aralık), `pyftsubset` ile woff2 üretir ve **üretilen cmap'i okuyup %100 kapsamı doğrular**.
  - **Varlık:** `assets/kao/font/ScheherazadeNew-Regular.k3p.woff2` = 25.060 bayt (24,5 KiB; tavan 150) · SHA-256 `cdf29cccf459341b9b59744ea2f728b589c839d1175fa094ecdd2bff3eb7a2c6`. Lisans `assets/kao/font/ScheherazadeNew-Regular.OFL.txt` (SIL OFL 1.1, SHA-256 `5b9fd21ce2377fc542debebd9edfe1c48f2d3525e78a2a8abdba4a0ec3280163`).
  - **CSS:** `@font-face` (swap, 400, `unicode-range:U+0600-06FF,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF`); Arapça yığının başına `"K3P Scheherazade"`. **sw.js** precache'e eklendi. Test sabitleri düzeltildi: `test_kao_render` yığın sabiti; `test_kao2_design_contract` öksüz-sınıf tarayıcısı `@font-face` bloğunu dışlıyor (url() `.k3p`/`.woff2` yanlış pozitifi).
- Ölçüler: css 13,335 → **13,666 KiB** (gzip, tavan 14) · runtime **127,654 KiB** (değişmedi) · app.js **7799 satır** (dokunulmadı) · font alt kümesi **24,5 KiB / %100 kapsam** · kontrast 726/0.
- Kapı (K-Q): `kapi-hizli --kart K3P-07` → **HIZLI KAPI YEŞİL**; geniş parti (tests/kao + iip_22 + quran + panel + panel-v2) FAIL=0; `kao-plan-check` PASS. Dalga sonu değil → tam kapı K3P-10'da.
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: (1) **Yazı tipi kabulü cihazda:** ≤150 KiB ve kod-noktası kapsamı headless doğrulandı; K-B'nin istediği "30 zor glif dizisi önce/sonra" karşılaştırması ve harekelerin çakışmadığı yalnız **kullanıcının gözüyle** onaylanır (K3P-26/27 cihaz adımı; geri dönüş koşulu Amiri Quran). (2) `pyftsubset` woff2 için `brotli`'ye ihtiyaç duydu; kullanıcı site-paketlerine `brotli` kuruldu (araç zinciri, depoya girmez). (3) Öksüz-sınıf tarayıcısındaki `@font-face` yanlış pozitifi gerçek bir araç hatasıydı, sınıf kuralı değil; gerekçesiyle daraltıldı. (4) Yazı tipi pini K3P-27'de ortak sürümle yükseltilecek (`?v=20261013b` şimdilik mevcut sürüm).
- Sıradaki: K3P-08

## seq 36 · K3P-08 · KART (Dalga 1 · Görsel sistem, üçüncü kart)
- Tarih: 2026-10-13
- Commit: (bu commit)
- Yapılan:
  - **Ölçek:** 18 Arapça kuralın `font-size`'u üç kademeye bağlandı — `--kao-ar-hero` (soru, ders âyeti, gate, s0, ayar örneği, tanış, kelime-hero), `--kao-ar-body` (şıklar, âyet, okuyucu, geri bildirim, ünite, gramer, kök, sözlük, sözcük örneği), `--kao-ar-inline` (Türkçe içi Arapça: kavram çipi, ders başlığı/ızgara). Sayısal `clamp(...)` Arapça ölçekleri kaldırıldı.
  - **Kalınlık:** Arapça seçicilerden **5 kural-düzeyi `font-weight:700`** kaldırıldı; kalan sarmalayıcılar için tek taban `.kao-dialog [lang="ar"]{font-weight:400}`. Arapça 700 = 0 (sözleşme).
  - **Oran:** `--kao-ar-inline` 1.25em → **1.3em**; hero/body zaten ≥ 1,3 × gövde.
  - **Dokunma:** `.kao-choices button` 52 → **56 px**.
  - **Test:** yeni `tests/kao/test_k3p_typography.js` (Arapça 700=0 · ölçek yalnız --kao-ar-* · oran ≥ 1,3 · şık ≥ 56) + `tests/kao/README.md` envanteri (66 → **67**).
- Ölçüler: css 13,335 → **13,806 KiB** (gzip, tavan 14; pay ~0,19) · runtime **127,654 KiB** (değişmedi) · app.js **7799 satır** (dokunulmadı) · kontrast 726/0.
- Kapı (K-Q): `kapi-hizli --kart K3P-08` → **HIZLI KAPI YEŞİL**; **tests/kao ailesi 67/67 FAIL=0** (yavaş üç dâhil). Dalga sonu değil → tam kapı K3P-10'da.
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: (1) **TASARIM §5.3 iç çelişki:** tablo `--kao-ar-inline: 1.25em` derken aynı bölüm "Arapça ≥ 1,3 × Latin" kuralını koyar; 1.25em kuralı bozar. Prompt madde 3 ("oran ≥ 1,3") bağlayıcı olduğundan **1.3em** seçildi; tablodaki 1.25em bayat kabul edildi (TASARIM.md plan dosyasıdır, bu kartta düzenlenmedi; K3P-27'de gerekirse not düşülür). (2) Ölçek bağlama, kural-düzeyi 700 kaldırıldıktan sonra sarmalayıcı kutu kalınlığının Arapçaya miras kalmasını önlemek için tek taban gerektirdi; taban `.kao-dialog [lang="ar"]` (dialog kökü, sıralamada en kuvvetli değil ama yeterli). (3) CSS bütçesi ~0,19 KiB'e indi; **K3P-09/10 öncesi yer açılmalı** (§5 uyarısı CURRENT-STATE'te). (4) Arapça kural tarayıcısı sentetik olarak `:not([lang="ar"])` yanlış pozitifini düşürür (Latin eşleşi testte Arapça sayılmaz).
- Sıradaki: K3P-09

## seq 37 · K3P-09 · KART (Dalga 1 · Görsel sistem, dördüncü kart)
- Tarih: 2026-10-13
- Commit: (bu commit)
- Yapılan:
  - **Katmanlar (§5.1):** zemin `--kao-mat-ground` (açık parşömen; koyu yüzey); `hero-card`/`feedback-sheet`/`path-surface`/`lesson-card`/`choice` 1 px çizgi yerine `--kao-shadow-1` (T-1 düz hiyerarşi kalktı). `.kao-moment` sınıfı hero + ders sonu + taşa: lacivert degrade + 1 px altın cetvel + satır içi rumî SVG (opaklık .08, `aria-hidden`).
  - **Süsleme sözde-öğe değil gerçek `<svg>`:** strict sözleşme `content:""` yasaklar; `aria-hidden` yalnız gerçek öğede anlamlı. Dize bütçe dışı `constants.js` içinde (`KAO_MOMENT_ORN`) — runtime gzip tavanı korunur.
  - **Altın (§5.2):** `--kao-ok`= `--quran2`, `--kao-ok-bg`= altın %16; **8 metin kuralı mürekkep rengine** çevrildi (hiçbir yerde altın metin yok). An kartı metni `--kao-moment-ink`.
  - **Kontrast aracı:** 3 yeni çift (an metni/başlığı ≥4,5; altın cetvel ≥3) + **kapsamlı token çözümü** + `border-bottom-color` kısayol okuma. 0 ihlal (734 çift).
  - **CSS tavanı 14→16 KiB (kullanıcı kararı):** `test_kao2_perf_budget` + `test_kao2_kabul` A-10 + `kapilar.sh` başlığı güncellendi. `test_kao2_kabul` A-10'daki **karşılaştırma 14'te kalmıştı** (etiket 16 diyordu) — düzeltildi.
  - **Degrade sözleşmesi daraltıldı (kullanıcı kararı):** yasak sürüyor, **yalnız `.kao-moment`** istisna.
- Ölçüler: css 13,806 → **14,372 KiB** (gzip L9, tavan 16) · runtime **127,987 KiB L6** (tavan 128; L9 127,650) · app.js **7799 satır** (dokunulmadı) · kontrast **734 çift / 0 ihlal** · p95 5,85 ms.
- Kapı (K-Q): `kapi-hizli --kart K3P-09` → **HIZLI KAPI YEŞİL**; tests/kao **67/67 FAIL=0**; iip_22/pin/state-rebind/modal-odak yeşil. Dalga sonu değil → tam kapı K3P-10'da.
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: (1) **An kartı altın cetvel/koyu tema zorluğu:** koyu `--quran` açık navy'den parlak olduğu için koyu zeminden veya koyu an-zemininden altın cetvel ≥3:1 sağlanamıyordu; gövde metni açık renge çevrildi ve cetvel **açık parşömen zemin üzerinde** ölçüldü (açık 3,30 · koyu 4,70). (2) **Koyu zemin tuzağı:** `--kao-mat-ground` koyu temada yüzeyden açık bir tint'ti (TASARIM §5.1 koyu sütunu) ve ~30 metin çiftini 4,41:1'e düşürdü; koyu zeminde zemin = yüzey yapıldı, katman ayrımı gölgeyle veriliyor. (3) **Kapsamlı token tuzağı:** taban token blokları `.kao-dialog,.kao-hub-card` üzerinde tanımlı; kontrast aracı bunları "kapsam" sanınca açık jetonlar koyu haritanın üstüne yazılıyordu — taban blokları kapsam sayılmaz. (4) **Runtime gzip tavanı:** süsleme dizisi görünümlerde +0,052 KiB L6 idi (0,05 aşım); dize bütçe dışına taşındı, ölü `KAO_S0_SHAPES` silindi, 3 yorum sıkıştırıldı → 127,987. (5) **Dedupe tuzağı:** 24 tekrar eden `throw new Error(...)` gövdesi tek yardımcıya indirildiğinde L6 **arttı** (gzip tekrarı zaten bedava); geri alındı. (6) **Kendi hatam:** dize birleştirmeyi sıkıştırırken `'+ORN+'` iki yerde `+ORN+` düz metnine dönüştü; ham HTML'de görünürdü — kapı ve hedefli testler yakalamadı, **elle fark incelemesi** yakaladı ve düzeltildi. Ders: sunum HTML'ini değiştiren kartta ham çıktı gözle doğrulanmalı.
- Sıradaki: K3P-10

## seq 38 · — · YAYIN (on birinci ara yayın · K3P-07…09)
- Tarih: 2026-10-13
- Commit: (bu commit)
- Yapılan:
  - **Görsel QA (kullanıcı isteği):** kontrollü yerel CDP QA ile **242 ekran görüntüsü** — KAO modalı açık 66 + koyu 71 + 320 px 71, uygulama sekmeleri 34. Sunucu açılmadı, CDP pipe + boş geçici profil, `127.0.0.1:9000` (Guard 1), token/forceSync yok. Taşma taraması: yalnız kaydırılması **tasarlanmış** alanlar (.kao-surah-picker, .kao-lesson-table-wrap, .kao-grammar-table-wrap) — 0 metin/yerleşim ihlali. Gözle doğrulandı: hero/ders sonu/taş **an kartları** (lacivert degrade + altın cetvel + rumî), altın **doğru cevap** dolgusu + mürekkep ✓, Scheherazade Arapça, açık + koyu. Kanıt düzeyi: kaynak-görsel (yerel, redakte) · cihaz kabulü DEĞİL.
  - **Sürüm:** `pin-yukselt.mjs 20261013c` — 15 dosya, 82 geçiş (K3P-07/08/09 birleşik); `pinDeferral.files` boşaltıldı. Tam kapı (`KAO2_ACCEPT_SLOW_HOST=1`) **TÜM KAPILAR YEŞİL**.
  - `kao3-premium` → `main` **fast-forward** (5 commit); `git push origin main` → `f20bd7ba..3cba5960`.
  - Pages koşusu **38415139887** → **success**. Canlı pin **yalnız GET**: `kao.css`/`quranLearn.js`/`constants.js?v=20261013c`, `SW_VERSION='20261013c'`, `SW_OFFLINE_VERSION='iip22-20261013c'`; canlı `kao.css`'te `@font-face`, `kao-moment{`×2, `--kao-ok:var(--quran2)`×2, `kao-ar-inline:1.3em`×2, `kao-moment-ink` iki tema; font `HTTP 200 font/woff2 25060 B`, OFL `200 4495 B`. **Uygulama tarayıcıda açılmadı** (QA aracı harici; sonrasında Chrome süreci kalmadı).
- Ölçüler: css 14,372 (tavan 16) · runtime 127,650 (L9) / 127,987 (L6) / tavan 128 · content 184,591 (tavan 256) · font 24,5 KiB (tavan 150) · kontrast 734/0 · p95 7,56 ms. Canlı sürüm 20261013c.
- Kapı (K-Q): yayın öncesi **TÜM KAPILAR YEŞİL**; yayın sonrası `senkron` → UYUMLU (20/37 · sıra K3P-10).
- Kanıt düzeyi: kaynak/test · **görsel QA var (242, yerel/redakte)** · **deploy kanıtı: Pages success + canlı pin/font GET** · cihaz yok
- Gözlem: (1) Cihaz kabulü (K-B 30 zor glif dizisi, an kartı cetveli, dokunma hedefleri) hâlâ kullanıcıda; bu yayın **kaynak-görsel** kanıt sağlar, cihaz değil. (2) QA aracı Chrome yolunu `KAO_QA_CHROME` ile istiyor; `cdp.mjs` varsayılanı (chromium-1243) bu makinede yok, `chromium-1247` verildi — K3P-26'da kalıcı yol notu gerekebilir. (3) K3P-10 dalga sonu olduğundan sıradaki tam kapı yine zorunlu.
- Sıradaki: K3P-10
## seq 39 · K3P-10 · KART (Dalga 1 · Görsel sistem, BEŞİNCİ ve SON kart — DALGA 1 KAPANIŞI)
- Tarih: 2026-10-13
- Commit: (bu commit)
- Yapılan:
  - **Hareket sınıfları (TASARIM §5.4).** Geçiş `--kao-dur-transition` (`--dur-2` = 200 ms), mikro `--kao-dur-micro` (`--dur-1` = 120 ms), an `--kao-dur-moment` (`--dur-5`), eğri `--kao-ease`; yeni sayı yok, hepsi mevcut jetonlara bağlı.
  - **D-5 görev geçişi.** `paintTask` `kaoPaintedId` değişince `#kao-task`'a `kao-task-in`: 24 px yatay kayma + opaklık, 200 ms (≤240). Sınıf yalnız `kaoAnimate()` açıkken; `animationend`'de silinir.
  - **Şık basışı + ✓.** `.kao-choices button` `transform var(--kao-dur-micro) var(--kao-ease)`; `:active` `scale(.98)`. `.kao-choice-correct .kao-choice-mark` → `kao-mark-in` (`scale(.6)`→`1.15`→`1`), `--kao-ease` ile yaylanır.
  - **D-6 yanlış.** `kaoFx('wrong', şık)`; `kaoAnswer` yanlış yolundan, `paintTask` içeriği YENİLENDİKTEN sonra (`kaoChoiceNode`). Yalnız seçilen şık `kao-shake` (±4 px, bir kez) + `SeyHaptics.error`; **ses yok**, kırmızı/"yanlış!" yok (sıcak turuncu sürer).
  - **Hareket azaltma.** `kaoAnimate()` tek kapı (`SeyFx.shouldAnimate()` yoksa `prefers-reduced-motion`). CSS'te asıl her animasyon/geçiş kuralı reduce bloğuyla kapanır; **K3P-10 öncesi kapsanmayan 3 kural** da (`.kao-flag summary::after`, `.kao-lesson-more summary::after`, `.kao-lesson-seg>i`) kapatıldı → kapsanmayan 0.
  - **Testler.** `test_k3p_motion_css.js` (metin taraması) + `test_k3p_motion_fx.js` (12 kontrol); envanter **67 → 69**.
- Ölçüler: css 14,372 → **14,700 KiB** (gzip L9; tavan 16) · runtime 127,987 → **127,995 KiB L6** (tavan 128; L9 127,653) · app.js **7799 satır** (dokunulmadı) · kontrast **734 çift / 0 ihlal** · content 184,591 · p95 4,297 ms.
- Kapı (K-Q): `kapi-hizli --kart K3P-10` → **HIZLI KAPI YEŞİL** (69/69 kao + sözleşme/pin + driver + iki ölçü kapısı); **dalga sonu** gereği `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → **TÜM KAPILAR YEŞİL** (tests/kao 69 · tests/app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · pin · tekrar-üretim 10/10 · perf).
- Kanıt düzeyi: kaynak/test · görsel QA **yok** (bu kartta ekran görüntüsü istenmedi) · cihaz yok
- Gözlem: (1) **Runtime tuzağı (§2):** K3P-09'un bıraktığı **0,013 KiB** payı kartın JS'i (+~0,7 KiB) aştı; **tavan yükseltilmedi** — §2 gereği "aynı işi gören eski kod" olarak en uzun yorumlar sıkıştırıldı (quranLearn/Flow/Views'te ~25 yorum satırı; `K2F-*`/`D2F-*`/`K3P-*` atıf kodları ve davranış korundu). Dalga 2 yine JS ekler → yer açılmaya devam edilmeli. (2) **Satır-birleşme tuzağı (K3P-09'un tekrarı):** yorum sıkıştırırken iki kez `old_str` sondaki satır sonunu yuttu ve sonraki kod/comment satırı yorumun içine girdi; ikisi de elle (satır okuması + `sed -n`) yakalanıp düzeltildi — kapi/otomatik test yakalamıyordu. Ders: yorum sıkıştıran kartta ham dosya satır satır doğrulanmalı. (3) **Seçici alt dize tuzağı:** `choiceId` = `<görev>:choice:<n>`; `:choice:1`, `:choice:10`'un alt dizesi. Sarsıntı seçicisi tırnakla sabitlendi (`[onclick*="'<id>'"]`) → yanlış düğüm hedeflenmez. (4) **Test dürüstlüğü:** ilk kurulan birim testte `SeyHaptics.error` çağrısını "reduce'da hiç çağrılmaz" sanmıştım; oysa titreşim kendi kapısıyla (mediaFx içinde) susar — test gerçeğe göre düzeltildi, kod gevşetilmedi (§6.6). (5) Pin ertelemesi 4 dosyaya çıktı (`quranLearnFlow/Views` de yorum sıkıştırmasıyla değişti).
- **Dalga 1 özeti (K3P-06…10 · "Görsel sistem · Tezhip"):**
  - **K3P-06 (jetonlar):** materyal katmanları (`--kao-mat-ground/card/moment`), gölge (`--kao-shadow-1/-2`), Arapça ölçeği (`--kao-ar-hero/body/inline`), hareket (`--kao-ease`, `--kao-dur-*`); renk yalnız `--quran*`'tan `color-mix`, süreler `--dur-*`'a bağlı, yeni hex yok. css 13,190 → **13,335**; runtime **127,654**.
  - **K3P-07 (yazı tipi):** Scheherazade New v4.500 (SIL OFL, SHA-512 doğrulandı) alt kümesi **24,5 KiB** / **105 kod noktası (%100 kapsam)**; `@font-face` swap + `unicode-range`; `sw.js` precache; `tools/kao/kao-font-subset.mjs`. css 13,335 → **13,666**.
  - **K3P-08 (tipografi):** 18 Arapça kural 3 kademeli ölçeğe; **sahte kalın (700) = 0**; gövde tabanı 400; `--kao-ar-inline` 1,25 → **1,3em** (≥1,3 kuralı); şık **52 → 56 px**; yeni `test_k3p_typography`. css 13,335 → **13,806** (envanter 66→67).
  - **K3P-09 (materyal + an kartı + altın):** zemin/kart/an üç katmanı ayrıştı; kartlar 1 px çizgi yerine gölge; `.kao-moment` (hero + ders sonu + taş) lacivert degrade + 1 px altın cetvel + rumî SVG; doğru cevap **altın dolgu + mürekkep metin**; **hiçbir yerde altın metin yok**; kontrast aracına 3 çift + kapsamlı token çözümü; **CSS tavanı 14→16 KiB (kullanıcı kararı)**. css 13,806 → **14,372**; runtime **127,987 L6**.
  - **K3P-10 (hareket):** yukarıdaki kart; css 14,372 → **14,700**; runtime **127,995 L6**.
  - **Dalga kapanış ölçüleri:** **runtime 127,995 / 128 KiB** (L9 127,653; pay L6 **0,005**) · **css 14,700 / 16 KiB** (pay ~1,3) · **kontrast 734 çift / 0 ihlal** · **test sayısı: tests/kao 69** (dalga boyunca 66→69; +3 test) · içerik 184,591 / 256 KiB · tam kapı **TÜM KAPILAR YEŞİL**.
- Sıradaki: K3P-11

## seq 40 · K3P-11 · KART (Dalga 2 · Tezhip, ilk kart)
- Tarih: 2026-10-13
- Commit: (bu commit)
- Yapılan:
  - **Bileşen (`views.tezhipPage`).** `{title, lines, footer, interactive}`; `lines` biçimi `[[{ar, state, index}]]`. Arapça sağdan sola, `--kao-ar-body` (`lang="ar" dir="rtl"`). Kenarlık rumî satır içi SVG (`deps.icon('rumi')`, `aria-hidden`). Her kelime `aria-label` taşır; `interactive:false` iken kelimeler düğme DEĞİL; `interactive:true` iken ≥44 px düğme.
  - **Yaldız (§2).** Açık tema: mürekkep metin + altın zemin (`--quran2 %22`) + **2 px altın alt çizgi**; koyu tema: altın metin; `forced-colors`: alt çizgi `Highlight` (yaldız yalnız renkle anlatılmaz). Öğreniliyor: yarım altın zemin; yeni: mürekkep.
  - **Model (`kaoTezhipModel(d, surahId)`).** Kısa sûre (`id`) ya da namaz metni (`id`, ör. `'fatiha'`); yoksa `null`. Durum: bilinen = `kaoKnownLemmaSet` · öğreniliyor = kartı var · yeni = kartı yok. **Yalnız türetir.** Yaldız oranı **aynı kelime kümesiyle** `kaoCoverage` ile birebir tutarlı.
  - **Test.** `tests/kao/test_k3p_tezhip.js` (16 kontrol: üç durum, escape, erişilebilir ad, `interactive:false` düğme değil, rumî `aria-hidden`, durum kuralı, `kaoKnownLemmaSet` eşliği, salt-türetim, `lines` biçimi, `kaoCoverage` tutarlılığı, İhlâs modu, bilinmeyen kimlik). Envanter **69 → 70**.
- Ölçüler: css 14,700 → **15,041 KiB** (gzip L9; tavan 16) · runtime 127,995 → **127,835 KiB L6** (tavan 128; L9 127,475) · app.js **7799 satır** (dokunulmadı) · kontrast **742 çift / 0 ihlal** · content 184,591 · p95 4,3 ms.
- Kapı (K-Q): `kapi-hizli --kart K3P-11` → **HIZLI KAPI YEŞİL** (70/70 kao + sözleşme/pin + driver + iki ölçü kapısı; düzeltme sonrası yeniden koşuldu).
- Kanıt düzeyi: kaynak/test · görsel QA **yok** (bu kartta ekran görüntüsü istenmedi) · cihaz yok
- Gözlem: (1) **Runtime tuzağı (§2, yine):** JS (~+1,0 KiB) payı aştı; tavan yükseltilmedi — "aynı işi gören eski kod" olarak **en uzun yorumlarda parantez içi açıklamalar** kısaltıldı (73 yorum satırı, ~2,1 KB ham; atıf kodları, davranış ve cümle sonları korundu; kod yolu hiç değişmedi). Dalga 2 devamında yer açma sürecek. (2) **CSS özgüllük hatası (kendi hatam):** düğme varyantındaki `border:0` kısayolu, `.kao-tezhip-word.is-known`'un `border-bottom` altın alt çizgisini eziyordu → yaldızın **renk-dışı** a11y sinyali kaybolacaktı; düğme için `.is-known{border-bottom:2px solid var(--kao-ok)}` eklendi ve regresyon testi yazıldı (`.kao-tezhip-word[role]` ölü seçicisi de kaldırıldı). (3) **Bağlantı kararı:** bileşen bu kartta **hiçbir ekrana bağlanmadı** (prompt yalnız "saf görünüm + model + test" istedi); tüketiciler K3P-12/13/14/17/18. Bağlanınca bir kez daha görsel doğrulama gerekir. (4) Yaldız oranı `kaoCoverage`'ın `words` moduyla hesaplanıyor: E9/âyet yoluyla **tam aynı** kural (bilinen lemma = iki yön kalıcı). (5) Pin ertelemesi değişmedi (aynı 4 dosya).
- Sıradaki: K3P-12

## seq 41 · — · YAYIN (on ikinci ara yayın · K3P-10…11)
- Tarih: 2026-10-14
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı "canlıya al ve sıradaki adımdan devam et" dedi → **açık yayın onayı** verildi. `pin-yukselt.mjs 20261014a` ile ortak sürüm `20261013c` → **`20261014a`** (15 dosya, 82 geçiş; index.html 25 · sw.js 25 · panel-v2.html 4 + 12 test dosyası). Değişen varlıklar: `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/core/quranLearnFlow.js`, `app/kao.css`. `pinDeferral.files` boşaltıldı → tazelik testinde ERTELENDİ yok (61 bağlantı taze).
  - Yayın öncesi tam kapı (`KAO2_ACCEPT_SLOW_HOST=1`, yavaş makine) → **TÜM KAPILAR YEŞİL** (tests/kao **70** · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · çift şık · okunuş · plan-check · pin senkronu · tekrar-üretim 10/10 · perf PASS).
  - `kao3-premium` → `main` **fast-forward** (4 commit: K3P-10, dalga başlatıcısı docs, K3P-11, pin); `git push origin main` → `3cba5960..5fe2e549`.
  - Pages koşusu **38521530117** → `status=completed conclusion=success` (headSha `5fe2e549`). Canlı pin **yalnız GET** ile doğrulandı: `sw.js` → `SW_VERSION='20261014a'`, `SW_OFFLINE_VERSION='iip22-20261014a'`; `app/kao.css?v=20261014a` (HTTP 200, 93.684 B) içinde `.kao-tezhip{` ×2 ve `.kao-task-in{animation` var; `app/core/quranLearn.js?v=20261014a` (HTTP 200, 375.304 B) içinde `kaoTezhipModel` ×2 ve `kao-shake` var. **Uygulama tarayıcıda açılmadı.**
- Ölçüler: css 15,041 KiB L9 (tavan 16) · runtime 127,835 KiB L6 / 127,475 L9 (tavan 128) · içerik 184,591 (tavan 256) · kontrast 742/0 · p95 5,789 ms / steady 3,664 ms · canlı sürüm 20261014a.
- Kapı (K-Q): yayın öncesi **TÜM KAPILAR YEŞİL**; yayın sonrası `senkron` → UYUMLU (22/37 · sıra K3P-12).
- Kanıt düzeyi: kaynak/test · görsel QA yok · **deploy kanıtı: Pages success (38521530117) + canlı pin/font GET (kao.css tezhip+hareket sınıfları, quranLearn.js model/davranış doğrulandı)** · cihaz yok
- Gözlem: (1) **Cihaz kabulü kullanıcıda** — yenilikler: Dalga 1 hareket grameri (görev geçişi/şık basışı/✓ yayı/yanlış sarsıntısı) + Tezhip bileşeni (henüz ekrana bağlı DEĞİL; bağlanma K3P-12'den itibaren). Uyarı: açılışta yeni sürüm; "Verileri sıfırla"ya dokunma. (2) `releaseApproval` alanı `NOT_APPROVED` kalır (K3P-27 program sonu); bu ara yayın yalnız kullanıcının o anki açık onayıyla yapılır. (3) `main` ile `kao3-premium` yine eşit; program dalı yerel kalır (uzak `kao3-premium` yok; önceki yayın kayıt commit'i de yalnız yerel).
- Sıradaki: K3P-12

## seq 42 · K3P-12 · KART (Dalga 2 · Tezhip, ikinci kart)
- Tarih: 2026-10-14
- Commit: (bu commit)
- Yapılan:
  - **Bugün ekranı (§3.1, K-F).** `tezhipCard` (K3P-11 bileşenini sarar): Tezhip figürü kartın İÇİNDE, `interactive:false` (kelimeler düğme değil); başlık/alt başlık `nextStep`'ten (ör. "Hoş geldin"); kartın TAMAMI `kao-today-hero-link` kaplama düğmesiyle ünitenin çapa sûresini okuyucuda açar. Hedef eğimi ("N kelime sonra Fâtiha tamam"), tek birincil eylem, haftalık hedef şeridi (`kaoWeeklyDone`: son 7 günde `sessionDone||lesson`, hedef 5, **ceza dili yok**; kapsam %N countup burada), 3 kısayol (Sûreler · Namazda ne diyorum · Kütüphane). Yeni jetonlar/CSS: `.kao-today-hero*`, `.kao-today-title`, `.kao-today-goal`, `.kao-today-week`, `.kao-library-screen`.
  - **Kütüphane görünümü.** `KAO_VIEW_TITLES.library='Kütüphane'` + Flow `VIEWS.library` + `kaoLibraryHTML` (dışa açıldı). Keşif tek alt sayfada: Yol, Kısa sûreler, Günün âyeti, Namazda ne diyorum, kaynaklar (Kur’an); Telaffuz, Seviye 0 (K2F-15 kapılı), Gramer, Kök aileleri (kart varsa) (Pratik); İlerleme + Ayarlar (Sen). Yeni handler YOK (45 sabit).
  - **Modeller.** `kaoGoalSlope`, `kaoWeeklyDone`, `kaoUnitAnchorRef` (surah:|prayer: → çağrı), `kaoHomeShortcuts`; `kaoHomePath`/`kaoHomeLists` kaldırıldı (Bugün sadeleşti).
  - **Testler.** Yeni `test_k3p_today.js` (5 kontrol: ≤5 etkileşim, ≤2 dokunuş tablosu, Kütüphane içeriği, İlerleme/Ayarlar, 45 handler) → envanter **70→71**. `test_kao2_today.js` yeni yapıya göre yeniden yazıldı (8 kontrol). Bugün'ün eski düzenine bağlı **10 test** yeni yapıya bağlandı: explain (Y-01 → Kütüphane’den Yol), grammar_notes/roots/s0 (Keşfet → Kütüphane), queue/requirements/user_tasks/render (Günün âyeti/İlerleme/Ayarlar/stüdyo/Kısa sûreler → Kütüphane), lexicon_coverage (yüzde regex), hub/view_resolution (library beyaz listesi), a11y (kaplama düğmesi istisnası).
  - **Araç.** `ekran-dok.cjs`'e `ekran-düğme` sütunu (ekran gövdesi seçim sayısı; NavBar modal chrome hariç).
- Ölçüler: runtime 127,835 → **127,988 KiB L6** (tavan 128; L9 127,630) · css 15,041 → **15,221 KiB L9** (tavan 16) · app.js **7799 satır** (dokunulmadı) · kontrast eklenecek · içerik 184,591.
- Kapı (K-Q): `kapi-hizli --kart K3P-12` → **HIZLI KAPI YEŞİL**; **tests/kao ailesi 71/71** (yavaş üç hariç 0 FAIL).
- Kanıt düzeyi: kaynak/test · görsel QA **yok** (istenmedi) · cihaz yok
- Gözlem: (1) **K-F yorumu (karar gerekebilir):** "Bugün ≤ 5 seçim" `.kao-today-screen` içinde tam **5** düğmeyle sağlanır (kaplama + birincil + 3 kısayol); `ekran-dok` v-home 6 gösterir çünkü **NavBar "Kapat"** modal sözleşmesidir (test_kao2_navigation kökte tam 1 kapatma ister). Araca `ekran-düğme` sütunu eklendi (5). (2) **Yol erişimi:** Bugün sadeleşince Yol satırı Kütüphane’ye taşındı (≤2 dokunuş). (3) **S0 kapısı:** Seviye 0 satırı K2F-15 koşuluna bağlı (varsayılan level1'de gizli). (4) **Hero başlığı tuzağı:** `heroCard` kaldırılınca "Hoş geldin" gibi step başlığı kayboldu; `tezhipCard`'a eyebrow/title/subtitle/secondary geri eklendi. (5) **Tezhip an kartında Arapça** artık GÖRÜNÜR → kendi lang/dir'ini taşır (test güncellendi). (6) **İlerleme/Ayarlar** gezinme çubuğunda simge olarak DURMUYOR (tek sütunlu NavBar sözleşmesi; iki buton ızgarayı kırar + "≤5" bütçesini aşardı) → Kütüphane’nin "Sen" grubuna kondu (2 dokunuş). Sapma; gerekiyorsa ayrı kart.
- Sıradaki: K3P-13

## seq 43 · — · YAYIN (on üçüncü ara yayın · K3P-12)
- Tarih: 2026-10-14
- Commit: (bu commit)
- Yapılan:
  - Kullanıcı "tümünü canlıya al ve sıradaki adım için starter yaz" dedi → **açık yayın onayı** verildi. `pin-yukselt.mjs 20261014b` ile ortak sürüm `20261014a` → **`20261014b`** (15 dosya, 82 geçiş; index.html 25 · sw.js 25 · panel-v2.html 4 + 12 test dosyası). Değişen varlıklar: `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/core/quranLearnFlow.js`, `app/kao.css`. `pinDeferral.files` boşaltıldı → tazelik testinde ERTELENDİ yok (61 bağlantı taze).
  - Yayın öncesi tam kapı (`KAO2_ACCEPT_SLOW_HOST=1`, yavaş makine) → **TÜM KAPILAR YEŞİL** (tests/kao **71** · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · çift şık · okunuş · plan-check · pin senkronu · tekrar-üretim 10/10 · perf PASS).
  - `kao3-premium` → `main` **fast-forward** (2 commit: K3P-12 + pin); `git push origin main` → `5fe2e549..10ef7726`.
  - Pages koşusu **38566365630** → `status=completed conclusion=success` (headSha `10ef7726`). Canlı pin **yalnız GET** ile doğrulandı: `sw.js` → `SW_VERSION='20261014b'`, `SW_OFFLINE_VERSION='iip22-20261014b'`; `app/kao.css?v=20261014b` (HTTP 200, 94.770 B) içinde `.kao-today-hero{…}` ve `.kao-today-hero-link{position:absolute` var; `app/core/quranLearn.js?v=20261014b` (HTTP 200, 375.504 B) içinde `kaoLibraryHTML`/`kaoTezhipModel`/`kaoWeeklyDone` (8 geçiş) var. **Uygulama tarayıcıda açılmadı.**
- Ölçüler: css 15,221 KiB L9 (tavan 16) · runtime 127,988 KiB L6 / 127,630 L9 (tavan 128) · içerik 184,591 (tavan 256) · kontrast 752/0 · p95 4,935 ms / steady 3,273 ms · canlı sürüm 20261014b.
- Kapı (K-Q): yayın öncesi **TÜM KAPILAR YEŞİL**; yayın sonrası `senkron` → UYUMLU (23/37 · sıra K3P-13).
- Kanıt düzeyi: kaynak/test · görsel QA yok · **deploy kanıtı: Pages success (38566365630) + canlı pin/font GET (kao.css Bugün/Tezhip sınıfları, quranLearn.js Kütüphane/model doğrulandı)** · cihaz yok
- Gözlem: (1) **Cihaz kabulü kullanıcıda** — yenilik: Bugün ekranı yeniden (Tezhip an kartı + haftalık hedef + Kütüphane alt sayfası). Uyarı: açılışta yeni sürüm; "Verileri sıfırla"ya dokunma. (2) `releaseApproval` alanı `NOT_APPROVED` kalır (K3P-27 program sonu). (3) Bu yayında K3P-12'nin "kao-today-hero-eyebrow" ölü kuralı ve `kao-home-*` eski kartları **kaldırılmadı** (test/CSS etkisi yüksek); sonraki kart ölü kod temizliği yapabilir (ölçüm: heroCard/pathCard artık kullanılmıyor ama css orphan tarayıcısı nedeniyle duruyor). (4) `main` ile `kao3-premium` eşit; program dalı yerel.
- Sıradaki: K3P-13

## seq 44 · K3P-13 · KART (Dalga 2 · Tezhip, üçüncü kart)
- Tarih: 2026-10-14
- Commit: (bu commit)
- Yapılan:
  - **Ders âyetle açılır ve kapanır (K-G, TASARIM §3.2 · AKIS §3 ①⑤).** Açılış (goal) ve kapanış (apply) AYNI âyet satırını paylaşır. Satır, hedef lemmaların çapa metnindeki (namaz/sûre) **ilk-son geçişi arasındaki pencere**; çapa metni olmayan derste yeni lemmaların doğrulanmış ilk örnek cümlelerindeki kelimeler.
  - **Flow.** `applyItems` plan içinde bir kez hesaplanır; `goal.words === apply.words` (tek referans). `goal`'a `lessonIds` (dersin kendi lemması) + `newLemmaIds` eklendi. **Eski örnek-cümle modeli emekliye ayrıldı:** `applySentences` + `APPLY_SENTENCE_MAX` silindi; `apply.mode==='examples'` ve `apply.sentences` kaldırıldı.
  - **Views.** Açılış (goal) ve kapanış (apply) satırı `<div class="kao-lesson-apply-tezhip">` içinde `views.tezhipPage` ile çizilir. `tezhipPage`'e `gild` seçeneği (ilk n kelime `is-gild`); kapanışta **"Yaldızla"** (`kao-play-start`). Eski `kao-lesson-sentences` dalı silindi.
  - **Motor.** `kaoAyahRow` (pencere), `kaoRowHtml` (Tezhip), `kaoGild`/`kaoGildStep` (⑤ zirve): ses = hedef lemmaların `w-<lemmaId>-measured` klipsi; kelimeler zamanlayıcıyla sırayla yaldızlanır, **toplam ≤ 1,2 sn** (adım 1200/sözcük). `SeyFx.shouldAnimate()===false` → yaldız STATİK (zamanlayıcı yok). **Yeni `App.kao*` YOK**; mevcut `kaoLesson('gild')` eylemi kullanıldı (45 sabit).
  - **CSS.** `.kao-lesson-apply-tezhip`, `.kao-tezhip-word.is-gild`, `.kao-play-start`.
  - **Testler.** Yeni `tests/kao/test_k3p_lesson_ayah.js` (**5 kontrol**: 109 ders referans+satır ortaklığı; hedef lemmalar + ≤25 sözcük, gerekçeli ve yalnız küçülen istisna listesi; açılış/kapanış aynı Tezhip satırı; sırayla yaldız ≤1,2 sn; hareket azaltmada statik) → envanter **71→72**. `test_kao2_lesson_flow` (4 kontrol) ve `test_kao2_denetim` R-08 yeni K-G davranışına güncellendi.
- Ölçüler: runtime 127,988 → **127,944 KiB L6** (tavan 128; L9 127,592) · css 15,221 → **15,273 KiB L9** (tavan 16) · app.js **7799 satır** (dokunulmadı) · içerik 184,591 · `App.kao*` **45** · hedef ekranı ≤25 sözcük (109/109), hedef lemmalar 99/109 (10 gerekçeli istisna).
- Kapı (K-Q): `kapi-hizli --kart K3P-13` → **HIZLI KAPI YEŞİL**; **tests/kao ailesi 72/72** (yavaş üç hariç 0 FAIL).
- Kanıt düzeyi: kaynak/test · görsel QA **yok** (istenmedi) · cihaz yok
- Gözlem: (1) **Runtime tuzağı (§2, yine, iki tur):** JS (~+1,1 KiB) payı iki kez aştı; tavan yükseltilmedi — **yalnız satır-başı `//`** yorumlarda parantez içi/cümle dışı kısaltma yapıldı (70+ satır, ~4,3 KB ham; atıf kodları ve davranış korundu; kod yolu hiç değişmedi, `diff` ile doğrulandı). **Ders:** tek geçişli yorum sıkıştırma yetmedi; satır-başı kısıtı + ara ölçüm şart. (2) **`akis-olc` 2b araç sınırı:** hedef ekranını ≤45 sayıp 80/109'da kırmızı raporlar; gerçek kural **≤25 sözcük** (AKIS §3 ①, tam ekran bütçesi, K3P-A8 D-4 değil). Araç 2b güncellemesi kapsam dışı (ayrı kart olabilir). (3) **Eski örnek-cümle modeli:** K2F-23 "örnek cümle" uygula adımı K-G ile gerçek âyet satırına dönüştü; `sentences` alanını bekleyen 4 test (lesson_flow ×4, denetim R-08) güncellendi. (4) **Pencere kapsamı:** ders planı çapa metnine göre kurulmadığından 10 derste bir lemma çapada yok (gerekçeli istisna); 25 sözcük sınırı varsayılan dailyNew=5'te 95 örnek dersinin TAMAMINDA sağlanır (istisna yok).
- Sıradaki: K3P-14

## seq 45 · K3P-14 · KART (Dalga 2 kapanışı)
- Tarih: 2026-10-15
- Commit: (bu commit)
- Yapılan: ders başında ui-only bilinen lemma/kapsam tabanı; özette yalnız yeni iki yönlü kalıcı kelimelerin Tezhip yaldızı ve gerçek kapsam farkı; render-sonrası 800 ms sayaç. KAO kilometre taşı konfetisi tema tokenlarından lacivert-altın, en çok 1,15 sn; 1,2 sn temizlik. Varsayılan yardımcı davranışı ve hareket azaltmada statik metin korundu. Yeni handler/schema/migration yok.
- Dosyalar: app/core/{helpers,quranLearn,quranLearnViews}.js; tests/kao/test_k3p_lesson_moment.js + README; üç durum kaydı. Yayın istisnasıyla index.html, sw.js, panel-v2.html ve bunların 12 pin fixture'ı mekanik 20261014b→20261015a eşitlendi; pinDeferral.files boşaltıldı.
- Ölçüler: runtime L6 127,282 / 128 KiB; L9 126,926; CSS L9 15,273 / 16; içerik 184,591 / 256; App.kao* 45; app.js 7799 satır değişmedi. KAO envanteri 72→73.
- Kapı: tam kapı TÜM KAPILAR YEŞİL (KAO 73, app 78, panel 23, Panel-v2 27, quran 9; reminders/driver/zikr/kontrast/ölçü/plan/pin PASS). Perf p95 7,635 ms, steady 4,383 ms; yalnız göreli bant yavaş makine bayrağıyla atlandı. Son hızlı kapı tekrarı HIZLI KAPI YEŞİL; 61 pin bağlantısı taze, erteleme yok.
- Gözlem: ilk son-tur hızlı kapıda components:195 şerit beklentisi aralıklı kırıldı; değişmeden tek başına PASS. Gerçek zamanlı ders geçmişi K3P-15 hızlı doğru kolunu seçebilir; kapsam dışı düzeltme yok. Tarihsel tekrar-uret 9/10, R-08 eski apply.words/sentences modeli; güncel denetim R-08 ve 109 ders âyet fixture'ı PASS. Tarihsel araç bilgi amaçlı, 10/10 iddiası yok.
- Yayın yetkisi: kullanıcının açık commit/push/merge/deploy ve ara pin istisnası onayı; kapsam yalnız K3P-13+14. Yeni yayın zinciri henüz bekliyor; gerçek commit/PR/Pages/no-cache eşliği teslim mesajında. releaseApproval=NOT_APPROVED final program sınırı korunur.
- Kanıt düzeyi: kaynak/headless; görsel QA ve cihaz kabulü yok. K3P-16 yürütülmedi.
- Sıradaki: K3P-16

## seq 46 · — · YAYIN (K3P-13 + K3P-14 ara yayın)
- Tarih: 2026-10-15
- Commit: (bu commit)
- Yetki: kullanıcı açık commit/push/merge/deploy ve ara pin istisnası onayı; yalnız K3P-13+14.
- Teslim: K3P-14 8e9901cb313131f39569c2e9f526ad3c4a3c4f36 → origin/kao3-premium; PR #107 merge b66757940e54c6bf3398e07c779d42b3ce95d8b0 → origin/main. Pages run 38727957725, validate+deploy success, headSha merge commit'iyle aynı.
- Pin: 20261015a; main üzerinde 61 bağlantı taze, ERTELENDİ yok. senkron 25/37, sıradaki K3P-16.
- Canlı kanıt: 2026-10-15T11:33:27.655Z; yalnız no-cache GET, 8/8 HTTP 200 ve yerel/canlı SHA-256 eşliği.
- SHA-256 index.html: 1e8374d8cadb400e92f64683b0d645d30f6211bf7b6c884648eadbae2cf6aca9 (128195 B)
- SHA-256 sw.js: 441810c329814513eb1ec753b8a12502f61db504205e236b597467eca9028d91 (17431 B)
- SHA-256 panel-v2.html: 98de8cb84e6aaa2833fd20e718027700ca550c0e36192a79ab6f39c7475b9a55 (1365 B)
- SHA-256 app/core/helpers.js: a5fbf740ce9527bfab248626480e163d4482251dd5692db91e79d46174f86b21 (11222 B)
- SHA-256 app/core/quranLearn.js: ebbe2f5e549e865dc3c68485c2696326f411ad744e45d7a3600439b68c499533 (378172 B)
- SHA-256 app/core/quranLearnFlow.js: b1e1ddee8950023f1b80c683dc54eea9adaa4627d1b1c87b6132d34dc999ab8d (36450 B)
- SHA-256 app/core/quranLearnViews.js: 413f08bc074fcc52efeded4b29661f3872179db33aac999728a015aebd95bdd2 (59477 B)
- SHA-256 app/kao.css: 62d0942fe514da6dd5617a8ff7c194c61dcb843b7d4e06874d83bf65781a3b57 (95060 B)
- Kayıt sınırı: bu makbuz yalnız iki durum belgesini değiştirir; runtime baytları aynı kalır. Makbuzun push'undan sonraki Pages koşusu ve son dal eşliği teslim mesajında doğrulanır.
- Açık sınırlar: ilk hızlı tur components zamanlama flake'i, tekrar PASS; tarihsel tekrar-uret 9/10 (eski R-08 modeli); perf göreli bandı atlandı, mutlak tavanlar PASS. Görsel QA/cihaz kabulü yok; kişisel veri deposuna yazılmadı; final releaseApproval=NOT_APPROVED.
- Sıradaki: K3P-16 (yürütülmedi).

## seq 47 · K3P-16 · KART
- Tarih: 2026-10-15
- Commit: (bu commit)
- Yetki: kullanıcı K3P-16 oturum başlatıcısını uygulama talebi; yalnız bu kart ve yerel commit. Push/merge/deploy/tag yok; K3P-17/18 açılmadı.
- Yapılan: saf Flow.ladderRung/ladderArm; yeni/s<3 R1, s<10 R2, s<30 R3, diğer R4; relearning bir basamak indirir, alt sınır R1. Tek seededRank kaynağı SeymaQuranLearn üzerinden kullanılır; B hep R1, A merdiven, uygulanmamış R3/R4 R2 yedeği. R1 Arapça→anlam, R2 anlam→Arapça veya ses→anlam. Kart/görev kimlikleri ve veri değişmez; App.kao* 45, schema/migrate/app.js/sync.js/state.js değişmedi.
- H3: kelime kartlarından A/B ortalama s ve toplam lapses/reps (reps>0); yalnız anlık toplu sayılar, kimlik/metin sızıntısı yok. Kesim uygulanmaz; gerçek 30. gün deney sonucu veya bilimsel etki iddiası değildir.
- Dosyalar: app/core/{quranLearn,quranLearnFlow}.js; kao3-premium/araclar/{cift-sik,deney-rapor}.cjs; tests/kao/test_k3p_ladder.js, test_k3p_deney_rapor.js, README.md ve doğrudan bağımlı components/lesson_flow/pronunciation_contract/queue/render/requirements/user_tasks fixture'ları; üç durum kaydı. Fixture'lar gerçek A/R2-B/R1 koşullarına, Flow VM bağımlılığına ve ekranda önbelleğe alınan göreve uyarlandı; eski kontroller kaldırılmadı.
- Test: 16 basamak/alt sınır örneği, 1000 kimlikte A=522 (%52,2), ayrı VM determinismi; 40 kart × 3 durum × 4 s × 2 ses = 960 donmuş girdi görev kontrolü PASS. H3 elle hesap/sızıntı/hata yolları PASS. Envanter 73→74.
- Sayım (tüm dersler, sentetik): yeni 0/1087 çift şık, R1 912/1087 %83,90, R2 98/1087; yerleşik 0/1127 çift şık, R1 903/1127 %80,12, R2 127/1127. Toplam kelime çoktan seçmeli yeni 1010/1087 %92,92 ve yerleşik 1030/1127 %91,39; HEAD tabanıyla aynı. R1/R2 ayrımı TASARIM §4 sınıflamasıdır; R2 de çoktan seçmelidir. Eski toplam MCQ ile yeni R1 aynı ölçü değildir; toplam pay düşmedi, ≤%60 hedefi doğrulanmadı, R3/R4 sonraki kartların kapsamıdır.
- Ölçüler: runtime L6 130622 B = 127,560546875 KiB / 128 KiB (taban 127,282; kalan 450 B); L9 127,196 KiB; CSS 15,273 /16; içerik 184,591 /256; ayrı perf tekrarı p95 5,229 ms / steady 3,659 ms, mutlak tavanlar PASS. Yalnız göreli bant yavaş makine bayrağıyla atlandı; bütçe yükseltilmedi.
- Kapı: kapi-hizli.mjs --kart K3P-16 --yavas exit 0, HIZLI KAPI YEŞİL; KAO 74 (kabul 358,0 sn, grammar_tasks 256,5 sn, denetim 45,5 sn dahil), sözleşme/pin 10, driver, çift şık, okunuş PASS. İlk tur eski fixture varsayımlarında sekiz hata; hedefli düzeltmeler ve tam --yavas tekrarından sonra 0 hata. K3P-16 dalga sonu değil; ayrı tam kapı bu oturumda koşulmadı.
- Pin: 20261015a değişmedi; pinDeferral.files yalnız app/core/quranLearn.js ve app/core/quranLearnFlow.js. Canlı eşlik/yeni yayın kanıtı üretilmedi; önceki yayın makbuzu seq 46'da kalır.
- Açık sınırlar: tarihsel tekrar-uret 9/10 (eski R-08 modeli), akis-olc 2b eski hedef ölçüsü, 3 dokunuş/hedef 2; görsel QA/gerçek ekran okuyucu/cihaz kabulü yok. Kaynak/headless kanıtı bilimsel veya kullanıcı-cihaz kabulü değildir. Kişisel veri okunmadı/yazılmadı.
- Sıradaki: K3P-17

## seq 48 · — · YAYIN HAZIRLIĞI (K3P-16 ara yayın)
- Tarih: 2026-10-15
- Commit: (bu commit)
- Yetki: kullanıcı "canlıya al push commit merge deplo" isteğini kapsam ve pin istisnası açıklandıktan sonra "onayladım ya ztn" ile teyit etti. Yalnız K3P-16; final K3P-27 onayı, tag veya K3P-17 yetkisi değildir.
- Kaynak: K3P-16 uygulama commit'i 107a243deb8e7ccf90d30fb61982df3d0a395af2. Üretim JS/CSS/içerik baytları bu yayın hazırlığında değiştirilmez.
- Pin: index.html, sw.js ve panel-v2.html için 20261015a→20261015b; ilgili fixture sabitleri aynı pinle güncellenir, kontroller gevşetilmez; pinDeferral.files boşaltıldı.
- Doğrulama: KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh exit 0, TÜM KAPILAR YEŞİL. KAO 74, app 78, panel 23, panel-v2 27, quran 9 fixture PASS; smoke, driver, zikr, kontrast, çift şık, okunuş, plan ve pin PASS. Migration 67/67, 61 benzersiz asset URL tazeliği ve diff --check PASS. Runtime L9 127,196 KiB; p95 9,809 ms / steady 3,859 ms; yalnız göreli bant atlandı, mutlak tavanlar korundu. Tarihsel tekrar-uret özeti 9/10, 10/10 iddiası yok.
- Durum: doğrulandı, Pages/canlı kanıtı bekleniyor. Final releaseApproval=NOT_APPROVED; 26/37, sıradaki K3P-17 korunur. Kişisel veri/seyma-data ve gerçek hesap tarayıcısı kapsam dışı.

## seq 49 · — · YAYIN MAKBUZU (K3P-16 ara yayın)
- Tarih: 2026-10-15
- Commit: (bu commit)
- Kaynak: uygulama 107a243deb8e7ccf90d30fb61982df3d0a395af2; yayın hazırlığı 10600071f884ce98069fe742f9c8c28f8673b31c; PR #108 MERGED, main merge def4627ec4d75ff2c186226281e76801fed0836d.
- Pages: 38740346378, head def4627ec4d75ff2c186226281e76801fed0836d, validate/deploy SUCCESS. Statik site https://mustafaras.github.io/s/.
- Canlı kanıt: 2026-10-15T13:31:33.449Z; Cache-Control/Pragma no-cache ve commit sorgusuyla yalnız GET. 61 benzersiz sürümlü asset + index.html/sw.js/panel-v2.html: HTTP 200 ve yerel/canlı SHA-256 eşliği 64/64 PASS. Pin 20261015b; pinDeferral.files boş; pin tazeliği 61/61 PASS, senkron 26/37 PASS.
- Bu makbuz yalnız üç kayıt dosyasını değiştirir; üretim baytlarını değiştirmez. Makbuz commit'i de main/program dalına eşitlenerek Pages sonucu ve canlı eşlik ayrıca kontrol edilir; sonraki çalışmanın kimliği oturum sonucunda raporlanır.
- Sınır: final releaseApproval=NOT_APPROVED; K3P-17 açılmadı, tag yok. Gerçek hesap tarayıcısı/kişisel veri/seyma-data işlemi yapılmadı; cihaz kabulü ve bilimsel öğrenme etkisi iddiası yok.

## seq 50 · K3P-17 · KART
- Tarih: 2026-10-15
- Commit: (bu commit)
- Yapılan: **R3 "harflerden kur"** (`kind:'build'`, TASARIM §4). Çipler = kelimenin harekesiz harfleri (hedef) + kelimede geçmeyen ve hedefle aynı nokta ailesinden (S0 şekil aileleri, mevcut `kaoS0LessonOfLetter`) **2 çeldirici**; eşitlikte kimliğe göre kararlı. Cevap yolu yeni handler'sız: mevcut `kaoAnswer` çoklu seçim + `ui.kaoOrderDraft`; hedef harf sayısı = çip − 2. Doğru sıra **harekeli cevabın harekesiz harfleri** (`kaoOrderLabels` build dalı `task.answer`'dan türetir; çipler sıra numarası taşımaz). Dizilim hatası `errors.order` kovasına yazılır; notlama mevcut `kaoGrade`/FSRS. **Geri bildirim harekeli hâli gösterir** (`answer` harekeli, Arapça RTL satırı). Uygunluk: yalnız 2–6 harfli, harfleri donmuş modülde bulunan `verified` lemma; aksi hâlde `null` → kart R2'ye düşer. B kolu R1'de kalır; R4 K3P-18'in işi. Erişilebilirlik: çipler mevcut Arapça yolundan; ad = `glif, okunuşu <donmuş okunuş>` (harfin adı donmuş modülde yok).
- Test: yeni `tests/kao/test_k3p_build.js` **7 kontrol** — uygunluk (uygun olmayan 40 lemma build kurmaz, R2'ye düşer), çeldirici (kelimede yok + fixture'da bağımsız yazılmış S0 ailesinden), sıra (doğru dizi = harekesiz yazım; çeldirici sıraya girmez), doğru sıra doğru / yanlış sıra yanlış sayılır (gerçek `kaoAnswer` + FSRS + `errors.order`), çeldirici seçimi cevabı tamamlar ve yanlış sayılır, a11y `aria-label`, merdiven (build yalnız R3/A; B→R1; R1/R2/R4 değişmez; çıktı determinist). KAO envanteri **74 → 75** (`tests/kao/README.md` güncel).
- Paylaşılan fixture'lar (aynı doğrulama yolunun parçası, kapsam içi beyan): `test_k3p_ladder` (A/R3 artık build; R4→R2 korunur; build çip sayısı = harekesiz uzunluk + 2), `helpers/kao-harness.js` `playLesson` (build doğru dizisi; konum başına ayrı çip tüketir; `answer(task)` görev başına **bir kez** çağrılır), `kao3-premium/araclar/cift-sik.cjs` (build sayımı + FSRS'ten etkilenmeyen sabit R3 örneği).
- Ölçüler: runtime gzip **L6 127,995117 KiB** (131067 B; kalan **5 B**) ve L9 127,623047 KiB; CSS 15,273/16; içerik 184,591/256; App.kao* **45**. Tavana sığmak için aynı kartta yorum kısaltıldı, gereksiz ara alan/yardımcı kaldırıldı ve mevcut render/okunuş yolları yeniden kullanıldı; **tavan yükseltilmedi**.
- Kapı: `kapi-hizli.mjs --kart K3P-17 --yavas` ve tüm aile taraması — tests/kao 75 · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders smoke · driver · zikr PASS; `cift-sik` 0 çift şık, `okunus-denetim` 0 hata, plan ve kontrast PASS. Tek kırmızı `tests/app/test_asset_pin_freshness.js` idi; `app/core/quranLearn.js` `pinDeferral.files`'a eklendi → test **ERTELENDİ** diyerek PASS (K-P; pin K3P-27'de tek seferde). Kabul kontrolü kaldırılmadı/gevşetilmedi.
- Kanıt düzeyi: kaynak/headless ve sentetik veri · görsel QA yok · cihaz yok · yayın yok.
- Gözlem: `cift-sik.cjs`'in ders taramasındaki tohumlu kullanıcı `s=40` (R4 bandı) olduğundan R3 görevini hiç üretmez; R3 örneği bu yüzden ayrı ölçülür (karta bağlı sayım FSRS yeniden planlamasıyla şişerdi). Runtime kalan payı **5 B**; sonraki ölçü-kapı ekleyen kart için yer yoktur.
- Sıradaki: K3P-18

## seq 51 · — · TEMİZLİK + K3P-18 ÖN İNCELEME
- Tarih: 2026-10-15
- Commit: (bu commit)
- Yapılan: **K3P-18 açılmadan önce iki açık kapatıldı ve kart denendi.** (1) **Ölü yüzey temizliği:** `window.SeymaQuranLearn`'dan dışarıdan hiçbir tüketicisi olmayan **17 sembol** kaldırıldı (14 ihracat + `fsrsRequestRetention` + iç fonksiyon `kaoLessonTitle`). Doğrulama: 358 kod dosyası (`app.js`, `tests/`, `tools/`, modüller, HTML) tarandı — 17 adın hiçbiri kendi tanımı dışında geçmiyor; hiçbir fixture yüzey anahtar kümesini sabitlemiyor; hiçbiri shim hedefi değil. Yalnız **silme** (20 satır, 0 ekleme), davranış değişmedi. Kazanç: runtime gzip **L6 131067 → 130905 B** (kalan **5 → 167 B**), L9 130686 → 130525 B. (2) **K3P-18 (R4 "âyette boşluk") denendi ve DURDURULDU** — aşağıdaki iki engel.
- **Engel 1 — sözleşme çelişkisi (§5 "kart başka sözleşmeyi bozuyorsa dur"):** Kart "doğrulanmış örneği olmayan lemma R4'e çıkmaz, **R3'te kalır**" diyor; mevcut motor ise R4'ü doğrudan **R2**'ye düşürüyor. Kartın istediği R4→R3 geri düşüşü `tests/kao/test_k3p_ladder.js` ve `tests/kao/test_k3p_build.js`'in sabitlediği davranışla **doğrudan çelişiyor** (denemede 5 K3P fixture'ı kırıldı: build · ladder · distractors · ddc · rhythm). İkisini de memnun eden bir yol, K3P-17'nin kabul edilmiş düşüş sözleşmesini değiştirmek demek; bu kartın kapsamı dışında.
- **Engel 2 — bütçe:** Cloze işlevsel olarak doğrulandı (boşluk + okunuş aynı konumda, cevap sızmıyor, 4 tekil şık, anlam + âyet künyesi görünür, `verified` örneği olmayan lemma kurulmuyor). Ancak temizlik kazancından sonra **94 B yetmiyor** (L6 128,092 > 128 KiB). Yetmezlik yalnız kabul kapısı değil: **yeni fixture yok**tu, yani gerekli test bile yazılamadı. Ölçülen kazançlar: 15 ölü ihracat 129 B · `kaoLessonTitle` 38 B · cloze sıkıştırma 20 B. §2 gereği önce **kart içinde** aynı işi gören eski kod silinir; kalanı kapatmak için bulunan tek yol **183 kart-etiketli yorumu** kırpmaktı (3,7 KB gzip) fakat mekanik kırpma **gerçek invariants'ları siliyordu** (örn. "r tanıtımdan önce olamaz", "Tek tanım; E3 sayacı da kullanır", "görev kümesi aynı") ve bir yorumu cümle ortasından bölüyordu — **güvenli değil**, uygulanmadı.
- Test: kazanç sonrası tam aile yeşil — tests/kao **75 PASS**, `test_kao2_mastery` (L6 bütçe dâhil) PASS, `test_k3p_build`/`ladder`/`distractors` PASS. Cloze denemesi **tamamen geri alındı**; ağaçta yalnız temizlik kaldı (`git diff` = 20 silme, 0 ekleme).
- Ölçüler: runtime gzip **L6 127,837 KiB** (130905 B; kalan **167 B**) · L9 127,466 KiB (kalan 547 B) · CSS 15,273/16 · içerik 184,591/256 · App.kao* **45** (değişmedi) · `data`/`migrate()` dokunulmadı.
- Kanıt düzeyi: kaynak/headless ve sentetik veri · görsel QA yok · cihaz yok · yayın yok.
- Gözlem: ölü-sembol taraması (tüm girinti düzeyleri, 358 dosya) **başka ölü kod bulmadı** — K3P-09 temizliği işini yapmış. Üç runtime dosyasında yinelenen fonksiyon/literal yok; `kao-lesson-progress` işaretlemesi iki dosyada farklı biçimde olduğu için DRY kazancı vermiyor. Kalan ölü-yüzey kazancı yok.
- Sıradaki: K3P-18 — **kullanıcı kararı gerekiyor** (bkz. CURRENT-STATE "Devir notu")

## seq 52 · K3P-18 · KART
- Tarih: 2026-10-15
- Commit: (bu commit)
- Yetki: kullanıcı 2026-10-15'te dört karar verdi: (a) runtime tavanı **128 → 136 KiB**, (b) `cift-sik` ölçümü karışık örnekle yapılsın, (c) K3P-18 tamamlansın, (d) R4 düşüş sözleşmesi için "bilimsel kararı sen ver".
- Yapılan: **R4 "âyette boşluk"** (`kind:'cloze'`, TASARIM §4). Doğrulanmış örnek âyette (lemma `verified` + ar/tr/ref/okunuş) hedef kelime boşluk olur; **âyet VE okunuş aynı kelime konumunda boşalır** (okunuş da boşalır — yoksa cevap sızardı), Türkçe anlam + âyet künyesi görünür kalır, **hedef kelimenin sesi çalınmaz** (`clipId:''`; dinletmek cevabı verirdi). Şıklar normal `tr>ar` yolunun Arapça şıklarıdır (aynı tür/farklı kök, K3P-01 tekilleştirmesi); doğru şık = harekeli hedef (`task.answer`), `kaoAnswerText` değişmedi. Hata kovası `errors.root` (ses değil, kök karışması). Uygunluk: örnek **ve** hedef âyette TAM KELİME **ve** âyet/okunuş kelime sayısı eşit. Render mevcut fragman/eyebrow dallarını yeniden kullanır; yeni `App.kao*` yok (45 sabit).
- **Bilimsel karar — R4 düşüş sözleşmesi (kullanıcı yetkisi "sen ver"):** R4 uygun değilse kart **BİR** basamak iner (`R4→R3→R2`), iki değil. Gerekçe: TASARIM §4 "unutma kuralı" *bir basamak* iner der; eski `R4→R2` iki basamak düşüp üretme görevini (R4) tanıma görevine (R2) çeviriyordu ve kartın metni ("R3'te kalır") ile çelişiyordu. Yeni kural TASARIM §4'e yazıldı; `test_k3p_ladder` ve `test_k3p_build`'in kabul edilmiş beklentisi bu kurala göre **bilinçli** güncellendi (iki test de yeşil). **Şıksız (tek seçenekli) cloze hiçbir zaman kurulmaz**: şıklar dörtten azsa görev R2'ye düşer.
- Test: yeni `tests/kao/test_k3p_cloze.js` **7 kontrol** — uygunluk (yalnız `verified` örnek ∧ tam-kelime ∧ hizalı okunuş), boşluk âyette ve okunuşta AYNI konumda + boşalan kelime tam olarak hedef + cevap tam kelime olarak kalmaz (sızma), dört tekil şık + tam bir doğru + çeldiriciler aynı türden farklı kökten, doğru şık doğru / yanlış şık yanlış (gerçek `kaoAnswer` + FSRS + `errors.root`) ve `lastDistractors` hatırlanır, her şıkkın erişilebilir adı (glif + donmuş okunuş), doğrulanmamış örnek hiç kullanılmaz, **akışta** cloze üretilir. KAO envanteri **75 → 76**; `tests/kao/README.md` güncel.
- **Paylaşılan fixture'lar (aynı doğrulama yolunun parçası, kapsam içi beyan):** `helpers/kao-harness.js` yeni **`correctTaps(task)`** yardımcısı (build/cloze/order için TAM doğru dokunma dizisi; `playLesson`'un build döngüsüyle aynı mantık, tek kaynak). Bu yardımcı; `test_k3p_progress`, `test_k3p_rhythm`, `test_k3p_dda`, `test_kao_user_tasks`, `test_k3p_distractors`'ın **kendi** cevap yürütücülerine bağlandı — hepsi çok-dokunuşlu görevi tek dokunuşla geçmeye çalıştığı için `RangeError: Invalid array length` / takılma veriyordu. `test_k3p_distractors` build'i tanır oldu (çok-dokunuşlu görevde "tek doğru şık" sözleşmesi uygulanmaz). Bütçe tavanı üç yerde güncellendi: `test_kao2_mastery` (L6, bağlayıcı), `test_kao2_perf_budget` (L9), `test_kao2_kabul` A-10.
- **Kabul ölçütü — tanıma payı ≤ %60:** `cift-sik.cjs` iki geçişli **karışık** örnekle ölçer: 1. geçiş derslerin gerçekten kullandığı kelime kartlarını toplar (814 kart), 2. geçiş o kartları karışık kararlılıkla tohumlar (üçte biri `s=40`→R4, `s=12`→R3, `s=5`→R2). Yalnız **TEKRAR** görevleri (=`isNew` değil) sayılır; **tanış (yeni kelime) görevleri merdiven dışıdır** ve sayılırsa pay yapay olarak şişer (yerleşik tohumda 1031 görevin 881'i tanış → %80). Ölçüm: **1324 tekrar görevi · R1 tanıma 648 = %48,94 ≤ %60 PASS** · R4 cloze 56 · R3 build 237 · R2 383 · çift şık 0 · exit 0. Yöntem deterministik ve tekrarlanabilir.
- Ölçüler: runtime gzip **L6 128,437 KiB** (131519 B) · **L9 128,057 KiB** (131130 B) · tavan **136 KiB** (kalan L6 ~7,6 KB) · CSS 15,273/16 · içerik 184,591/256 · App.kao* **45** · p95 ~3–9 ms (≤40). `data`/`migrate()` dokunulmadı.
- **Bütçe öncesi ölü-yüzey temizliği (§2 "önce eski kodu sil"):** `window.SeymaQuranLearn`'dan 17 kullanılmayan sembol kaldırıldı (14 ölü ihracat + `fsrsRequestRetention` + iç fonksiyon `kaoLessonTitle`); 358 kod dosyası tarandı, hiçbiri başka yerde geçmiyor. Kazanç 129 B. Başka ölü sembol **yok** (K3P-09 temizliği işini yapmış). Tavan yine de yetmediği ve mekanik yorum kırpma gerçek invariants'ları sildiği için (uygulanmadı) tavan **kullanıcı yetkisiyle** yükseltildi.
- Kapı: `kapi-hizli --kart K3P-18 --yavas` çalıştırılacak; tam aile taraması ve `senkron.mjs` bu kayıttan sonra.
- Kanıt düzeyi: kaynak/headless ve sentetik veri · görsel QA yok · cihaz yok · yayın yok.
- Sıradaki: K3P-19

## seq 53 · K3P-19 · KART
- Tarih: 2026-10-16
- Commit: (bu commit)
- Yapılan: **Okunuşun soldurulması** (KARARLAR K-A son madde, P4/H4). s ≥ 21 kartın görevinde okunuş yerel `<details class="kao-pronunciation-fold"><summary>Okunuş</summary>…</details>` içine alınır; **varsayılan kapalı**, **handler yok** (tarayıcı `<summary>` kendi açar; yeni `App.kao*` yok — 45 sabit). Sınır tam **s = 21** (hareke soldurması s ≥ 30'un bir basamak öncesi): s = 20 görünür satır, s ≥ 21 katlı. Okunuş satırı `<details>` **içinde** kaldığı için `test_kao_pronunciation_contract`'ın "her Arapça satırın görünür okunuşu" eşitliği korunur — okunuş HTML'de durur, yalnız katlıdır. `settings.translit === false` ise okunuş HTML'de **hiç** çizilmez; ayar tanımsızsa (eski kayıt) bugünkü davranış sürer — `migrate()` dokunulmadı. Katlama **yalnız sunum**: aynı cevap, ayar açık/kapalı, aynı FSRS notu (test bunu kilitler).
- Uygulama: `kaoArabicPairHTML`'in 5. parametresi artık `pronunciationFolded` (kullanılmayan eski `fadeMode` yuvası); katlanma kararı çağrı yerinde `isDurable(cards[task.cardId])` ile verilir. Çağrı yerleri: soru (`>ar`), şık çipleri (build/cloze dahil), cloze âyeti, yeniden tanış paneli, parça/transfer âyeti. Cloze okunuşu zaten s ≥ 30 (durable30) olduğu için koşulsuz katlanır.
- **H4 ölçüm hazırlığı:** motor her cevapta `daily.calib.s21 = {n,ok}` sayar (yalnız `scheduled.s ≥ 21` kartlar; ölçek gözlem, yeni kart alanı yok) ve `deney-rapor.cjs` **H4** satırını basar — "Okunuşu katlanmış (s ≥ 21) kartlarda doğruluk", hedef **≥ %85**. Sentetik örnekte elle doğrulanan değer **%90,0 (117/130 cevap, 26 gün)**.
- Test: yeni `tests/kao/test_k3p_pronunciation_fold.js` **6 kontrol** — sınır (s = 20 görünür / s = 21 katlı ve bütün Arapça satırlar katlı), katlama (yerel `<details>`, varsayılan kapalı, `onclick|ontoggle|onpointerdown` yok, okunuş metni katlamanın içinde), ayar (`translit === false` → okunuş HTML'de hiç yok; tanımsız eski kayıt bozulmaz), not etkisizliği (iki kol aynı FSRS), sözleşme (satır sayısı = Arapça satır sayısı, katlama sayısı = Arapça sayısı), katlama CSS'i. KAO envanteri **76 → 77**.
- Paylaşılan fixture düzeltmeleri (kapsam içi beyan): `test_kao_requirements` R-A3 kalibrasyon şekli (`calib` artık `s21` de taşır; toplam alanlar değişmedi, s21 = 0), `test_k3p_dda` sıkılma iddiası katı argüman dizilimi yerine **davranışsal** (`kaoBoredomHideHarakat()` hâlâ çağrıda), `test_k3p_deney_rapor` H4 satırı + `s21N/s21Ok` izdüşüm alanları.
- Ölçüler: runtime gzip **L6 128,904 KiB** (kalan ~7,1 KB, tavan 136) · CSS L9 15,469/16 KiB · içerik 184,591/256 · App.kao* **45** · `migrate`/`data` şeması değişmedi. `app/kao.css` de değişti ve pinli olduğu için `pinDeferral.files`'a eklendi (K-P).
- Kapı: `kapi-hizli --kart K3P-19` → **HIZLI KAPI YEŞİL**; tests/kao **77 PASS**, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr PASS. Kabul kontrolü kaldırılmadı/gevşetilmedi.
- Kanıt düzeyi: kaynak/headless ve sentetik veri · görsel QA yok · cihaz yok · yayın yok.
- Sıradaki: K3P-20

## seq 54 · — · YAYIN HAZIRLIĞI (K3P-19 ara yayın)
- Tarih: 2026-10-16
- Commit: (bu commit)
- Yetki: kullanıcı 2026-10-16'da "canlıya al ve sıradakini tam ve kusursuz bi şekilde uygula" dedi; plan yayını K3P-27'ye koyduğu ve pinsiz yayının önbellekte eski kod bırakacağı **açıkça bildirildi**, kullanıcı "Şimdi ara yayın yap: pinleri koordineli yükselt (index.html + sw.js → 20261016a), sonra branch'i main'e al ve push et" seçeneğini seçti. Yalnız bu ara yayın; final `releaseApproval` değişmedi, tag yok, K3P-27 onayı değildir.
- Kaynak: K3P-19 uygulama commit'i `ae9a7481`. Üretim JS/CSS/içerik **baytları bu yayın hazırlığında değiştirilmez**.
- Pin: `index.html`, `sw.js`, `panel-v2.html` için **20261015b → 20261016a** (24+25+4 bağlantı). Pini sabitleyen **12 test dosyası** aynı pinle güncellendi (kontroller gevşetilmedi, yalnız sabit değer yükseltildi): panel-v2 hit_areas/performance, app iip_09, iip_22, v3_welcome, header_celestial_timeline, header_night_contrast, app_surface lifecycle/overlay/domain/boot boundary, kao curriculum. `pinDeferral.files` **boşaltıldı** (K-P: pin borcu kapandı).
- Doğrulama: `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` **exit 0 — TÜM KAPILAR YEŞİL**. KAO 77, app 78, panel 23, panel-v2 27, quran 9, reminders smoke, driver, zikr, kontrast, çift şık, okunuş, kao-plan-check ve **pin senkronu** PASS. Perf: content 184,591 · runtime **128,515 KiB** · css 15,469 KiB · p95 5,886 ms / steady 3,684 ms; yalnız göreli bant atlandı (yavaş makine), mutlak tavanlar zorunlu kaldı. `test_asset_pin_freshness` **61/61 taze** PASS. Tarihsel tekrar-üret özeti **9/10** (10/10 iddiası yok).
- Durum: doğrulandı, Pages/canlı kanıtı bekleniyor. 29/37, sıradaki K3P-20. Kişisel veri/`mustafaras/seyma-data` ve gerçek hesap tarayıcısı kapsam dışı.

## seq 55 · — · YAYIN MAKBUZU (K3P-19 ara yayın)
- Tarih: 2026-10-16
- Commit: (bu commit)
- Kaynak: uygulama `ae9a7481`, yayın hazırlığı `b5336ae8`; `git push origin b5336ae8:main` ile **fast-forward** (`2077c3ae..b5336ae8`), PR kullanılmadı (lineer geçmiş).
- Pages: run **38897697150**, head `b5336ae895373404a7fc06ced74893969dfa5ea2`, **validate SUCCESS · deploy SUCCESS**. Statik site https://mustafaras.github.io/s/.
- **Canlı kanıt (yayın sonrası, salt-okur GET):** `Cache-Control: no-cache` + `Pragma: no-cache` ile index.html, sw.js, panel-v2.html ve 61 benzersiz sürümlü varlık = **64/64 hedef HTTP 200 ve yerel/canlı SHA-256 eşliği 64/64 PASS**. Canlı `index.html` pini **20261016a**; eski pin `20261015b` canlıda **yok**. `test_asset_pin_freshness` 61/61 taze; pin tazeliği ve pin senkronu PASS.
- Bu makbuz yalnız kayıt dosyalarını değiştirir; **üretim baytlarını değiştirmez**. Makbuz commit'i de `main`e eşitlenir (kayıt dalı ile `main` aynı içerikte kalır).
- Sınır: final `releaseApproval=NOT_APPROVED`; **tag yok**, K3P-27 onayı ya da kalan kartlar için yetki sayılmaz. 29/37, sıradaki K3P-20. Gerçek hesap tarayıcısı/kişisel veri/`mustafaras/seyma-data` işlemi yapılmadı; cihaz kabulü ve bilimsel öğrenme etkisi iddiası yok.

## seq 56 · K3P-20 · KART
- Tarih: 2026-10-16
- Commit: (bu commit)
- Yapılan: **Kelime/harf dizmede sürükle-bırak.** Çipler pointer olaylarıyla görsel olarak sürüklenir (`transform` + `setPointerCapture`) ve hedef bölgeye bırakılan çip mevcut `App.kaoAnswer(taskId,choiceId)`'i çağırır. Mantık **`window.SeymaQuranLearn.kaoDrag(...)`** içinde yaşar; `App`'e yeni handler **eklenmez** (`App.kao*` 45 sabit). **Dokunarak seçme** (çipin kendi `onclick="App.kaoAnswer(...)"` eylemi) ve **klavye yolu** aynen kalır. Bırakma-noktası hesabı **saf**: `kaoDropIndex(rects,point)` — kutu içi indeks, kenarlar dâhil, boşluk/dışı/bozuk girdi → −1. Bölge **dışına** bırakma cevap üretmez (vazgeçme); **hareket olmadan** cevap verilmez (tek dokunuş zaten kendi eyleminde). **Hareket azaltma** açıkken sürükleme animasyonsuz çalışır (aynı bırakma mantığı, yalnız geçiş yok). Sürüklenebilirlik yalnız dizme görevlerinde (order/build) ve **etkin** çiplerde; düz seçim şıkkı sürüklenmez.
- **K-D pin denetimi (kartın zorunlu adımı):** değişiklikten **önce** ve **sonra** fx2 sayımları ölçüldü — `handlers.size = 766` ve `onclick = 393`. **Hiçbir pin kaymadı**; `test_fx2_touch_coverage` FX2-10.9 yeşil. (Sayım `app.js` + `quranLearn.js`'in hub dilimi + registry'ler üzerinden yapılır; `kaoTaskHTML` bölgesi bu dilimin dışında kaldığı için değişiklik pin'e dokunmadı ve `onpointerdown` sayımı hiçbir pin'e girmez.)
- Test: yeni `tests/kao/test_k3p_drag.js` **6 kontrol** (async: animasyon yolu `Promise` döndürdüğü için commit bir mikrogörev sonra yazılır) — saf bırakma hesabı, bırakma yolu (içeri bırakma tam bir kez / dışına hiç), yüzey (`kaoDrag` motorda, `App`'te değil; `App.kao*` = 45), dokunma+klavye (çipte tam bir `onclick` + tam bir `onpointerdown`), hareket azaltma, sürüklenebilirlik kapsamı. KAO envanteri **77 → 78**.
- Paylaşılan fixture/sözleşme düzeltmeleri (kapsam içi beyan): yorumlarda `onclick` geçmesi `test_kao2_onboarding` sözleşmesini kırdı → yorumlar yeniden yazıldı (davranış değişmedi); `kao-drop-ready` CSS seçicisi öksüz kaldı (`test_kao2_design_contract`) → sınıf sürükleme sırasında hedef bölgeye **gerçekten ekleniyor** (görsel geri bildirim), böylece seçici öksüz değil ve işlevli.
- Ölçüler: runtime **L6 130,015 KiB** (kalan ~5,9 KB, tavan 136) · CSS L9 15,595/16 KiB · içerik 184,591/256 · `App.kao*` **45** · `data`/`migrate()` değişmedi. `app/core/quranLearn.js`, `app/core/quranLearnViews.js` ve `app/kao.css` pinli olduğu için `pinDeferral.files`'a yazıldı (K-P); pini sabitleyen fixture yok, başka pin kaymadı.
- Kapı: `kapi-hizli --kart K3P-20` → **HIZLI KAPI YEŞİL**; tests/kao **78 PASS**, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr PASS; `test_kao2_a11y` **14/14 PASS**. Kabul kontrolü kaldırılmadı/gevşetilmedi.
- Kanıt düzeyi: kaynak/headless ve sentetik veri · görsel QA yok · cihaz yok · yayın yok. **Not:** sürükle-bırak gerçek parmak/dokunmatik cihazda denenmedi; cihaz kabulü K3P-26'da kullanıcıda.
- Sıradaki: K3P-21

## seq 57 · — · YAYIN HAZIRLIĞI (K3P-20 ara yayın)
- Tarih: 2026-10-16
- Commit: (bu commit)
- Yetki: kullanıcı 2026-10-16'da "canlıya al sıradaki adıma gec tam ve kusursuz bi şekilde uygula" dedi. Plan yayını K3P-27'ye koyduğu ve pinsiz yayının önbellekte eski kod bırakacağı önceki turda açıkça bildirildi; kullanıcı ara yayın akışını sürdürüyor. Yalnız bu ara yayın; final `releaseApproval` değişmedi, tag yok.
- Kaynak: K3P-20 uygulama commit'i `8a0642cb`. Üretim JS/CSS/içerik **baytları bu yayın hazırlığında değişmez**.
- Pin: `index.html`, `sw.js`, `panel-v2.html` **20261016a → 20261016b**; pini sabitleyen 12 test dosyası aynı değerle güncellendi (kontrol gevşetilmedi). `pinDeferral.files` **boşaltıldı**.
- Doğrulama: `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` **exit 0 — TÜM KAPILAR YEŞİL**. KAO 78, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr, kontrast, çift şık, okunuş, plan ve **pin senkronu** PASS. Perf: runtime **129,776 KiB** · css 15,595 · content 184,591 · p95 6,450 ms / steady 4,020 ms (yalnız göreli bant atlandı). `test_asset_pin_freshness` **61/61 taze** PASS. Tarihsel tekrar-üret özeti 9/10.
- Durum: doğrulandı, Pages/canlı kanıtı bekleniyor. 30/37, sıradaki K3P-21. Kişisel veri/`mustafaras/seyma-data` kapsam dışı.

## seq 58 · — · YAYIN MAKBUZU (K3P-20 ara yayın)
- Tarih: 2026-10-16
- Commit: (bu commit)
- Kaynak: uygulama `8a0642cb`, yayın hazırlığı `261e4732`; `git push origin HEAD:main` ile **fast-forward** (`a6001a76..261e4732`), PR kullanılmadı.
- Pages: run **38905143855**, head `261e4732ca7a61a90c4fbfb42da37f50ebf4b147`, **validate SUCCESS · deploy SUCCESS**. Statik site https://mustafaras.github.io/s/.
- **Canlı kanıt (salt-okur GET):** `Cache-Control: no-cache` + `Pragma: no-cache` ile index.html, sw.js, panel-v2.html ve 61 sürümlü varlık = **64/64 hedef HTTP 200 ve yerel/canlı SHA-256 eşliği 64/64 PASS**. Canlı pin **20261016b**; eski `20261016a` canlıda **yok**. Canlı `sw.js` → `SW_VERSION = '20261016b'`.
- **Özellik canlı doğrulaması:** canlı `app/core/quranLearn.js` sürükleme yüzeyini (`kaoDrag`/`kaoDropIndex`) taşır; canlı `quranLearnViews.js` `draggable` desteğini; canlı `kao.css` `kao-drag`/`kao-drop-ready` kurallarını. Pin tazeliği 61/61 ve pin senkronu PASS.
- Bu makbuz yalnız kayıt dosyalarını değiştirir; **üretim baytlarına dokunmaz**. Makbuz commit'i de `main`e eşitlenir.
- Sınır: final `releaseApproval=NOT_APPROVED`; **tag yok**, K3P-27 onayı sayılmaz. 30/37, sıradaki K3P-21. Gerçek hesap tarayıcısı/kişisel veri/`mustafaras/seyma-data` işlemi yapılmadı. **Sürükle-bırak gerçek dokunmatik cihazda denenmedi** — cihaz kabulü K3P-26'da kullanıcıda.

## seq 59 · K3P-21 · KART (Dalga 3 sonu)
- Tarih: 2026-10-16
- Commit: (bu commit)
- Yapılan: **Görünür ses kontrolleri.** Gizli **uzun basma (350 ms)** ve **satır içi ok fonksiyonu** kaldırıldı (ANALIZ §4: bu davranış keşfedilemiyordu). Yerine **iki görünür düğme**: **◖ Yavaş** → `App.kaoPlay(id,'measured')` ve **◗ Doğal** → `App.kaoPlay(id,'flowing')`. Her biri **kendi `aria-label`'ını** taşır (`Yavaş oku` / `Doğal hızda oku`), gerçek `<button type="button">`'dır (klavye ve ekran okuyucu yolu doğal) ve **CSS'ten ≥44 px** çözülür. Ses denetiminde artık `onpointerdown`, `setTimeout` ve `shiftKey` **yok**; tek dokunuş yeterli. **Yeni `App.kao*` handler eklenmedi** (45 sabit; mevcut `kaoPlay` kullanılır). Ayarlar açıklaması artık uzun basmayı değil iki düğmeyi anlatır.
- **K3P-20 sınırı (iki kartın çakışmaması):** K3P-20'nin çip sürükleme `onpointerdown`'ı **yalnız dizme görevlerinin çiplerindedir** ve koşulludur (`order&&disabled===false`); ses denetimi ve düz seçim görevi ondan etkilenmez. Kartın "görev HTML'inde `onpointerdown` yok" ölçütü **ses denetimi** için uygulandı (düz görev HTML'inde onpointerdown yok; dizme çiplerinde sürükleme kancası kalır) ve bu sınır teste yazıldı.
- Test: yeni `tests/kao/test_k3p_audio_buttons.js` **6 kontrol** — gizli uzun basma kalktı (ses denetiminde 350/`onpointerdown`/`setTimeout`/`shiftKey` yok, düz görevde toplam 0 `onpointerdown`), iki görünür düğme (etiket + `aria-label` + doğru mod), `App.kao*` = 45 (tek `kaoPlay`), iki düğme ≥44 px, K3P-20 sınırı, ayar metni. KAO envanteri **78 → 79**.
- Paylaşılan fixture düzeltmeleri (kapsam içi beyan — hepsi eski uzun-basma davranışını sabitliyordu, kart onu kaldırıyor): `test_kao2_components` (`AUDIO_BTN` sabiti), `test_kao2_feedback` (`onpointerdown=.*350`), `test_kao_render` (`350` + `shiftKey`), `test_kao_requirements` (`event.shiftKey`). Dördü de yeni görünür-düğme davranışına göre güncellendi; hiçbiri gevşetilmedi (dördünde de olumsuz iddia EKLENDİ: uzun basma yok).
- Ölçüler: runtime **L6 129,707 KiB** (kalan ~6,3 KB, tavan 136) · CSS 15,595/16 KiB · içerik 184,591/256 · `App.kao*` **45** · `data`/`migrate()` değişmedi. `app/core/quranLearn.js` pinli → `pinDeferral.files`.
- Kapı: `kapi-hizli --kart K3P-21` → **HIZLI KAPI YEŞİL**; **dalga sonu tam kapısı** `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → **exit 0, TÜM KAPILAR YEŞİL** (KAO 79, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr, kontrast, çift şık, okunuş, plan, pin senkronu PASS). Kabul kontrolü kaldırılmadı.
- Kanıt düzeyi: kaynak/headless ve sentetik veri · görsel QA yok · cihaz yok · yayın yok.
- Sıradaki: K3P-22

## seq 60 · K3P-22 · KART
- Tarih: 2026-10-16
- Commit: (bu commit)
- Yapılan: **Âyet merdiveni (K-E).** Boş durum **kaldırıldı**: "Henüz hazır âyet yok" metni ve `kao-ayah-empty` işaretlemesi artık hiçbir yerde geçmez (CSS'i de silindi — öksüz seçici bırakılmadı). %95 eşiğine ulaşmayan kullanıcıya **merdiven** gösterilir: en yakın âyet **Tezhip** olarak (kelime kelime, bilinen/henüz-bilinmiyor durum işaretli), **"En yakın âyet: %N tanıdık · M kelime kaldı"** cümlesi ve **eksik lemmaların her biri** için mevcut `App.kaoNav('word', id)` bağlantısı (tekil; yalnız gerçekten tanınmayan lemmalar). **Eşik 0.95 DEĞİŞMEDİ** (K-E: eşiği düşürmek ödülü sahteleştirir) — eşiğe ulaşan kullanıcı tam âyet ekranını görür, merdiven çizilmez. Yeni `App.kao*` handler yok (**45** sabit); birincil eylem mevcut `kaoStart`, kelime bağlantısı mevcut `kaoNav`.
- Test: yeni `tests/kao/test_k3p_22.js` **6 kontrol** — boş durum kalktı, merdiven + Tezhip + "N kelime kaldı", eksik kelime bağlantıları (tekil, gerçekten tanınmayan, âyetin kelimesi), **eşik 0.95 sabit** (ulaşan kullanıcıda merdiven yok + kaynakta `KAO_AYAH_THRESHOLD=0.95`), **20 kelime bilen kullanıcı boş durum görmez** (kartın kabul senaryosu), `App.kao*` = 45. KAO envanteri **79 → 80**.
- Bulunan ve düzeltilen gerçek hatalar: (1) `tezhipPage` `lines`'i **sayfa dizisi** bekliyor (ilk denemede düz dizi verilmişti → Tezhip boş çiziliyordu); tek sayfa + kelime durumları verildi. (2) `tezhipCard` kendi (etiket­siz, devre dışı) birincil düğmesini çiziyordu → hem **a11y** (adsız düğme) hem **tasarım sözleşmesi** ("primary per view") ihlali; birincil eylem `primary:{label,action}` ile karta verildi, dış düğme kaldırıldı. (3) **Kontrast:** `.kao-ayah-ladder-line strong` açık temada **2,09:1** (altın `--quran2` açık zeminde okunmuyor) → `--quran-mid` kullanıldı; kontrast aracı **756/756 PASS**. (4) `kao-ayah-empty` CSS'i öksüz kaldı → silindi.
- Paylaşılan fixture düzeltmesi (kapsam içi beyan): `test_kao_queue` eski boş-durum metnini sabitliyordu → merdiven beklentisine çevrildi (ve olumsuz iddia eklendi: boş durum metni geçmez).
- Ölçüler: runtime **L6 130,622 KiB** (kalan ~5,4 KB, tavan 136) · **CSS L9 15,772/16 KiB** (kalan 233 B — dikkat) · içerik 184,591/256 · `App.kao*` **45** · `data`/`migrate()` değişmedi. `app/core/quranLearn.js` ve `app/kao.css` pinli → `pinDeferral.files`.
- Kapı: `kapi-hizli --kart K3P-22` → **HIZLI KAPI YEŞİL**; tests/kao **80 PASS**, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr PASS.
- Kanıt düzeyi: kaynak/headless ve sentetik veri · görsel QA yok · cihaz yok · yayın yok.
- Sıradaki: K3P-23

## seq 61 · — · YAYIN HAZIRLIĞI (K3P-21 + K3P-22 ara yayın)
- Tarih: 2026-10-16
- Commit: (bu commit)
- Yetki: kullanıcı 2026-10-16'da "canlıya al ve devam et" dedi. Plan yayını K3P-27'ye koyduğu ve pinsiz yayının önbellekte eski kod bırakacağı daha önce açıkça bildirildi; kullanıcı ara yayın akışını sürdürüyor. Yalnız bu ara yayın; final `releaseApproval` değişmedi, tag yok.
- Kapsam: **iki kart birlikte** yayınlanır — K3P-21 (`671ba9da`, iki görünür ses düğmesi) ve K3P-22 (`3d680b2a`, âyet merdiveni). Üretim JS/CSS/içerik **baytları bu yayın hazırlığında değişmez**.
- Pin: `index.html`, `sw.js`, `panel-v2.html` **20261016b → 20261016c**; pini sabitleyen 12 test dosyası aynı değerle güncellendi (kontrol gevşetilmedi). `pinDeferral.files` **boşaltıldı**.
- Doğrulama: `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` **exit 0 — TÜM KAPILAR YEŞİL**. KAO **80**, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr, kontrast (756/756 çift), çift şık, okunuş, plan ve **pin senkronu** PASS. Perf: runtime **130,340 KiB** · css 15,772 · content 184,591 · p95 5,002 ms / steady 3,014 ms (yalnız göreli bant atlandı). `test_asset_pin_freshness` **61/61 taze** PASS. Tarihsel tekrar-üret özeti 9/10.
- Durum: doğrulandı, Pages/canlı kanıtı bekleniyor. 32/37, sıradaki K3P-23. Kişisel veri/`mustafaras/seyma-data` kapsam dışı.

## seq 62 · — · YAYIN MAKBUZU (K3P-21 + K3P-22 ara yayın)
- Tarih: 2026-10-16
- Commit: (bu commit)
- Kaynak: uygulama `671ba9da` (K3P-21) + `3d680b2a` (K3P-22), yayın hazırlığı `c1a62ce5`; `git push origin HEAD:main` ile **fast-forward** (`d75ebb26..c1a62ce5`), PR kullanılmadı.
- Pages: run **38925995971**, head `c1a62ce5`, **validate SUCCESS · deploy SUCCESS**. Statik site https://mustafaras.github.io/s/.
- **Canlı kanıt (salt-okur GET):** `Cache-Control: no-cache` + `Pragma: no-cache` ile index.html, sw.js, panel-v2.html ve 61 sürümlü varlık = **64/64 hedef HTTP 200 ve yerel/canlı SHA-256 eşliği 64/64 PASS**. Canlı pin **20261016c**; eski `20261016a`/`20261016b` canlıda **yok**. Canlı `sw.js` → `SW_VERSION = '20261016c'`.
- **Özellik canlı doğrulaması:** (K3P-21) canlı `quranLearn.js` iki görünür ses düğmesini (`◖ Yavaş` / `◗ Doğal`) taşır; gizli uzun basma metni (`350 milisaniye`) canlıda **yok** (0). (K3P-22) canlı motorda âyet merdiveni (`kaoAyahLadderHTML` / "En yakın âyet") **var**; canlı `kao.css` merdiven kurallarını ve kontrast düzeltmesini (`.kao-ayah-ladder-line strong{color:var(--quran-mid)}`) taşır.
- **Dürüstlük notu:** "Henüz hazır âyet yok" dizesi canlı **yorumda** bir kez geçer (K3P-22'nin kendi açıklama yorumu, `kaoNearestAyah` altındaki blok). **Çizilen HTML'de geçmez**: `ekran-dok` → `v-ayah` çıktısında 0, `kao-ayah-empty` işaretlemesi ve CSS'i de yok. Boş durum kullanıcıya görünmez; kartın kabul ölçütü (`ekran-dok` → `v-ayah`'da metin yok) karşılanmıştır. Yorum, pin tazeliğini bozmamak için bu makbuzda değiştirilmedi.
- Bu makbuz yalnız kayıt dosyalarını değiştirir; **üretim baytlarına dokunmaz**. Makbuz commit'i de `main`e eşitlenir.
- Sınır: final `releaseApproval=NOT_APPROVED`; **tag yok**, K3P-27 onayı sayılmaz. 32/37, sıradaki K3P-23. Gerçek hesap tarayıcısı/kişisel veri/`mustafaras/seyma-data` işlemi yapılmadı; cihaz kabulü ve bilimsel etki iddiası yok.

## seq 63 · K3P-23 · KART (Dalga 4)
- Tarih: 2026-10-17
- Commit: (bu commit)
- Yapılan: **Senkron yaldız (yalnız CSS)** — çalan kelime (`aria-current="true"`) altın halkayla (`outline:2px solid var(--quran-gold)`, offset 2px) gösterilir; eski düz zemin vurgusu kaldırıldı. Hareket azaltmada halka kalır, `animation:kao-reader-gild` kapanır (M7). **"Kartlarıma ekle"** — anlam balonunda düğme, `App.kaoReader('add', index)` (yeni handler YOK, 45 sabit); kart ders tanıtımıyla AYNI şema (tek kurucu `kaoNewWordCard`: `state:'new'`+`introducedAt`, `reps:0`); idempotent; lemma kartındaysa "Kartlarında var" + devre dışı; doğrulanmamış lemma eklenemez.
- Ölçüler: css gzip 15,772 → **15,847 KiB** (pay ~157 B). runtime 130,728 → **131,138 KiB**. content 184,591 KiB (değişmedi). App.kao* 45→45. KAO envanteri 80 → **81**. Kontrast 756/756 PASS (0 eşik altı).
- Kapı: `kapi-hizli --kart K3P-23` **exit 0 — HIZLI KAPI YEŞİL** (tests/kao 78 PASS, 3 yavaş atlandı; sözleşme/pin fixture'ları, driver, ölçü kapıları yeşil; kontrast 756/756) · `kapilar.sh` **koşulmadı** (dalga sonu değil; kart gerekmez)
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: **KAPI'NIN BULDUĞU GERÇEK SÖZLEŞME İHLALİ düzeltildi:** `kaoWordCardGenuine` ilk yazımda `card.readerUnknown!==true` dizesini yeniden kuruyordu; `test_kao_lexicon_coverage` bu kuralı **tek yerde** (isSettled) sabitler ve kırmızıya döndü. Kural tekrarı yerine `!card.readerUnknown` (eşdeğer, kural kopyası değil) yazıldı; sayaç 1'e döndü, test yeşil. **Devralınan çelişki çözüldü** — `kaoRevealWord` bilinmeyen kelimeye `readerUnknown:true` işaretli kuyruk kartı yazıyordu; "kartlarıma ekle" bundan AYRI bilinçli eylemdir. Ayrım tek yordamla: `kaoWordCardGenuine(card)` = `readerUnknown!==true && (reps>0 || introducedAt)`. Okuma işareti ders/ekleme kartını EZMEZ (mevcut `readerUnknown` davranışı ve `test_kao2_reader`/`test_kao2_migration` korunur). CSS payı ~157 B kaldı; sonraki CSS kartı §5 gereği durmalı ya da eşdeğer eski kuralı silmeli.
- Sıradaki: K3P-24

## seq 64 · K3P-24 · KART (Dalga 4)
- Tarih: 2026-10-17
- Commit: (bu commit)
- Yapılan: **İlerleme ekranı üç sade ölçüye indi (K-H · TASARIM §3.5 · ANALIZ E-5).** Ekranın tepesinde tek liste: **Kur'an kapsamı %** (`%N` + "N / 524 lemma"), **Yaldızlı sûreler ×/20** (bir sûre **BÜTÜN lemmaları biliniyorsa** yaldızlı — yarısı değil; yeni saf `kaoGildedSurahCount`), **Bu hafta gün/5** (`kaoWeeklyDone`; haftalık şeritle aynı kaynak). Eski "Tanıdık kelime" cümlesi ölçüye dönüştü; kapsam eğrisi listesi ve "sıradaki hedef" ipucu korundu. **20 Tezhip küçük resmi** — K3P-11 bileşeninin küçük boyu (`tezhipPage({compact:true})`): her küçük resim sûrenin yalnız İLK âyetini ve en çok 8 kelimesini taşır (kırpılır; sayfa hafif kalır); süs SVG'si işaretlemede kalır (öksüz seçici yok) ama `.kao-tezhip.is-compact .kao-tezhip-orn` ile gizlenir; bütün lemmaları bilinen sûre `is-gilded`. **Ayrıntılar katlanır:** kalibrasyon tablosu + algı + gece karşılaştırması + aktarım tek `<details>Ayrıntılar</summary>` altında; **veri yokken bölüm HİÇ çizilmez**; doğruluk satırları (Son 2/6 hafta) katlanmadan görünür kalır; iç içe `<details>` yok. **Ceza dili yok** (metin taraması testi). Motor saf türetim: `kaoProgressModel` → `gilded`/`thumbs`/`weekly`; yeni `App.kao*` YOK (45 sabit), `onclick=` değişmedi, `data`/`migrate()` değişmedi (I1–I6).
- Ölçüler: css gzip 15,847 → **15,877 KiB** (pay **126 B**; yeni kural SİLEREK açıldı) · runtime 131,138 → **132,059 KiB** (tavan 136) · content 184,591 KiB (değişmedi) · App.kao* 45→45 · KAO envanteri **81 sabit** (yeni dosya yok) · kontrast **756/756 PASS**.
- **Bütçe kararı (kartın "önce eski kuralı sil" kuralı):** CSS payı ~205 B iken ihtiyaç ~200 B idi; hiçbir ekleme pay dışında kalmadı. Silinen: öksüz `.kao-coverage` (3 seçici + dar ekran girdisi; işaretlemede hiç kullanılmıyor), kullanılmayan `.kao-progress-count` (2 kural; "Tanıdık kelime" satırı kalktı), ölü `.kao-today h2` (`.kao-today` düğümü yok). Yeni bölüm/h3 grupları **mevcut seçici listelerine eklendi**; kalan yeni kurallar yalnız `kao-metric*`, `kao-tezhip-grid`, `kao-thumb*`, `is-compact`. Tavan yükseltilmedi (§5'e gidilmedi).
- **KAPI'NIN BULDUĞU GERÇEK HATA:** `kao-metric-value` altın (`--kao-accent`) ile AÇIK temada **2,09** kontrast verdi (eşik 4,5) — `kao-verify-contrast` ve `test_kao_render`/`test_kao2_a11y` kırmızı. KAO'nun yerleşik vurgu-**metni** jetonu `--kao-tint` (= `--quran-mid`) ile değiştirildi; ölçüm 756/756 PASS. Altın yalnız dekoratif kullanımda kalır.
- **`test_kao2_progress` güncellendi (kartın 5. maddesi; gerekçe burada):** eski fixture'lar ekranın ESKİ sözleşmesini sabitliyordu (her zaman çizilen R-bandı tablosu, `Tanıdık kelime` etiketi, katlanmamış gece karşılaştırması). K3P-24 bu sözleşmeyi bilerek değiştirdi, bu yüzden test yeni sözleşmeye bağlandı: **20 → 21 kontrol**. Yeni/ yeniden yazılan: (1) üç ölçü birlikte; (2) yaldızlı sayaç yalnız **BÜTÜN** lemmalar bilinince artar; (3) veri yokken kalibrasyon tablosu **ve** Ayrıntılar hiç yok; (4) veri varken **tek** katlanan blok ve tablo/gece/aktarım onun **içinde**; (5) 20 küçük resim + sûre adları + Arapça satır + yaldız işareti sayısı; (6) ceza dili metin taraması. `study()` yardımcısı `lesson`/`sessionDone` de yazar (haftalık hedefin gerçek kaynağı `kaoWeeklyDone`); haftalık sayım modelde `weekly` alanıyla şeritle tutarlı sınanır.
- Kapı: `kapi-hizli --kart K3P-24` **exit 0 — HIZLI KAPI YEŞİL** (97 satır yeşil adım; tests/kao **81 PASS** — 3 yavaş test tasarım gereği atlandı; sözleşme/pin fixture'ları, driver, ölçü kapıları yeşil; kontrast 756/756). `tests/kao` ailesi tam koşuda da **kırmızı yok**. · `kapilar.sh` **koşulmadı** (dalga sonu değil; Dalga 4'ün sonu K3P-25)
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: **PIN BEYANI EKSİK KALDI, KAPI YAKALADI:** `app/core/quranLearnViews.js` (pinned asset) değişti ama `pinDeferral.files`'ta yoktu; `test_asset_pin_freshness` kırmızı oldu ve dosya listeye eklendi (K-P, T-1). `<table>`/`<summary>`/`<details>`/`onclick` sayıları yeni **App.kao\*** eklemeden korundu; "Ayrıntılar" bloğu veri yokken çizilmediği için K2F-32 ölçümü artık **veri verilerek** koşar (test bunu açıkça yazar).
- Sıradaki: K3P-25

## seq 65 · — · YAYIN HAZIRLIĞI (K3P-23 + K3P-24 ara yayın)
- Tarih: 2026-10-17
- Commit: (bu commit)
- Yetki: kullanıcı 2026-10-17'de "sıradaki adımı tam ve kusursuz bi şekilde uygula ve tümünü canlıya al" dedi. Plan yayını K3P-27'ye koyduğu ve pinsiz yayının önbellekte eski kod bırakacağı daha önce açıkça bildirildi; kullanıcı 2026-10-15 ve 2026-10-16'daki ara yayın akışını da sürdürüyor. **Yalnız bu ara yayın; final `releaseApproval` değişmedi, tag yok.**
- Kapsam: **iki kart birlikte** yayınlanır — K3P-23 (`c5e73343`, okuyucuda senkron yaldız + "Kartlarıma ekle") ve K3P-24 (`658370ac`, İlerleme: üç ölçü, yaldızlı sûreler, katlanan ayrıntılar). Üretim baytları bu yayın hazırlığında değişmez: yalnız `?v=` pinleri ve kayıt dosyaları.
- Pin: `index.html`, `sw.js`, `panel-v2.html` **20261016c → 20261017a** (SW_VERSION + SW_OFFLINE_VERSION `iip22-20261017a`); pini sabitleyen 12 test dosyası aynı değerle güncellendi (kontrol gevşetilmedi). `pinDeferral.files` **boşaltıldı**.
- Doğrulama: `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` **exit 0 — TÜM KAPILAR YEŞİL**. KAO **81**, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr, kontrast PASS. Perf: runtime **132,059 KiB** · css 15,877 · content 184,591 · p95 13,444 ms / steady 4,246 ms (yalnız göreli bant atlandı). `test_asset_pin_freshness` **61/61 taze** PASS.
- Durum: doğrulandı, Pages/canlı kanıtı bekleniyor. 34/37, sıradaki K3P-25. Kişisel veri/`mustafaras/seyma-data` kapsam dışı.

## seq 66 · — · YAYIN MAKBUZU (K3P-23 + K3P-24 ara yayın)
- Tarih: 2026-10-17
- Commit: (bu commit)
- Kaynak: uygulama `c5e73343` (K3P-23) + `658370ac` (K3P-24), yayın hazırlığı `31511716`; `git push origin HEAD:main` ile **fast-forward** (`1e1d9146..31511716`), PR kullanılmadı.
- Pages: run **39039103025**, head `31511716`, **validate SUCCESS · deploy SUCCESS**. Statik site https://mustafaras.github.io/s/.
- **Canlı kanıt (salt-okur GET):** `Cache-Control: no-cache` + `Pragma: no-cache` ile index.html, sw.js, panel-v2.html ve 60 sürümlü varlık = **63/63 hedef HTTP 200 ve yerel/canlı SHA-256 eşliği 63/63 PASS**. Canlı pin **20261017a**; eski `20261016c` canlıda **yok** (index.html ve sw.js'te 0). Canlı `sw.js` → `SW_VERSION = '20261017a'`, `SW_OFFLINE_VERSION = 'iip22-20261017a'`.
- **Özellik canlı doğrulaması:** (K3P-23) canlı `quranLearn.js` `kaoNewWordCard`, `kaoReaderAdd`, `kaoReader` içinde `'add'` eylemi, `kaoReaderLemma` çözücüsü, `verified` kapısı ve iki düğme metnini (`Kartlarıma ekle` / `Kartlarında var`) taşır; canlı `kao.css` altın halka animasyonunu (`kao-reader-gild`) taşır. (K3P-24) canlı motorda `kaoGildedSurahCount`, `kaoThumbData`, ilerleme modelinde `gilded:kaoGildedSurahCount(d)` ve `thumbs:kaoThumbData(d)`, üç ölçülü `kao-metric*` işaretlemesi, "Yaldızlı sûreler" etiketi, `model.thumbs.map` ile 20 küçük resim, `Ayrıntılar` katlaması; canlı `quranLearnViews.js` `is-compact` üretimi; canlı `kao.css` `.kao-metric-value`, `.kao-tezhip-grid` ve `.kao-tezhip.is-compact .kao-tezhip-orn` kurallarını ve ölü `.kao-coverage` / `.kao-progress-count` **yokluğunu** taşır. Toplam **24/24 canlı özellik kontrolü PASS** (ilk 3 "FAIL" yalnız doğrulama betiğimin tırnak biçimi varsayımıydı, düzeltilip yeniden koşuldu: 7/7).
- Bu makbuz yalnız kayıt dosyalarını değiştirir; **üretim baytlarına dokunmaz**. Makbuz commit'i de `main`e eşitlenir.
- Sınır: final `releaseApproval=NOT_APPROVED`; **tag yok**, K3P-27 onayı sayılmaz. 34/37, sıradaki K3P-25. Gerçek hesap tarayıcısı/kişisel veri/`mustafaras/seyma-data` işlemi yapılmadı; cihaz kabulü ve bilimsel etki iddiası yok.

## seq 67 · K3P-25 · KART (Dalga 4 sonu)
- Tarih: 2026-10-17
- Commit: (bu commit)
- Yapılan: **Karar noktası** (kart zorunlu kıldı) — kullanıcıya (a) yeni `onboarding.k3pNoticeAt` alanı vs (b) şemasız satır sunuldu; kullanıcı **(a)**'yı ve CSS payı yetmezse öksüz kuralı silme yetkisini verdi. **Mevcut kullanıcıya hızlı geçiş teklifi BİR KEZ:** `doneAt` dolu + `autoAdvance!==true` + damga yokken Bugün ekranında `KAO_AUTO_ADVANCE_OFFER` çizilir ve damga yazılır; ikinci açılışta gösterilmez. **Ayar sessizce değişmez:** hem gösterim hem "Böyle kalsın" `autoAdvance`'a dokunmaz. **Açık rıza mevcut handler'la:** "Hızlı geçişi aç" DOĞRUDAN `App.kaoToggleAutoAdvance` çağırır (actionCall args'sız eylemi destekliyor) → yeni `App.kao*` YOK (45). `KAO_WHATS_NEW`/`whatsNewAt` yolu KORUNDU (`noticeModel` önceliği); ayar açıkken teklif hiç çizilmez, damga yazılmaz. `notice(options)` isteğe bağlı ikinci eylem (`options.secondary`) destekler; mevcut `.kao-notice-close` kullanıldı → **yeni CSS kuralı YOK** (`app/kao.css` değişmedi).
- Ölçüler: runtime 132,059 → **132,867 KiB** (tavan 136). css 15,877 → **15,877 KiB** (pay 126 B, değişmedi). content 184,591 KiB. App.kao* 45→45. KAO envanteri 81 → **82**. `test_kao2_migration` 14 → **15** kontrol.
- Kapı: `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` **exit 0 — TÜM KAPILAR YEŞİL** (dalga sonu zorunluluğu; KAO 82, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr, kontrast; perf: css 15,877 · runtime 132,867 · content 184,591)
- **Kapının BULDUĞU ÜÇ GERÇEK KIRMIZI düzeltildi:** (1) `tests/kao/test_kao_migration.js` normalize edilmiş `onboarding`'in TAM alan kümesini sabitliyordu → iki yerde `k3pNoticeAt: null` beklentisi eklendi (geriye uyumluluğun kanıtı burada). (2) `tests/app/test_asset_pin_freshness.js` → `pinDeferral.files` beyanı eksikti (ara yayın pini `31511716` bu iki varlığı sabitlemişti); `app/core/quranLearn.js` + `app/core/quranLearnViews.js` beyan edildi (K-P). `test_kao2_kabul` (A-9) bu iki kırmızının kaskadıydı. (3) **Kendi testimin kusuru:** `test_k3p_25` panel özetini JSON olarak karşılaştırıyordu, ama `kaoPanelSummary` `updatedAt` alanını GERÇEK saatten üretir (ms) → iki çağrı arasında 1 ms farkla aralıklı kırmızı. Test `updatedAt`'i karşılaştırma dışında bırakacak şekilde düzeltildi (3/3 ardışık koşuda PASS) ve panel özetinin damgayı **sızdırmadığı** ayrıca sınandı. Üçü de yeşile döndü.
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: **Kod okumasında bulundu (karar noktasına taşındı):** `KAO_WHATS_NEW` notunun "bir kez" kalıcılığı ZATEN mevcut `onboarding.whatsNewAt` alanıyla sağlanıyor ve bu alan `tests/kao/test_kao2_onboarding.js`'te sabitli. Bu yüzden `whatsNewAt` **korundu** (davranış değişmedi) ve teklif yalnız ayar kapalıyken + not çakışmadığında çizilir. "Şema genişlemesi gerekmez" seçeneği kullanıcıya ek seçenek (a′) olarak sunuldu; kullanıcı kartın yazdığı (a)'yı seçti.
- Açık sınırlar: `tools/kapi/tekrar-uret.cjs` **9/10** — düşen kalem **R-08** ("95/109 derste Uygula adımı içeriksiz"), K3P-25'ten bağımsız, **tarihsel araç modeli** (eski `apply.words/sentences` şeması); güncel denetim R-08 ve 109 ders âyet fixture'ı PASS. Bu yüzden kapı exit 0 verdi (özet bilgi amaçlı; "10/10 iddiası yok" ilkesi LEDGER'da daha önce de yazılı). Perf göreli p95 bandı yalnız yavaş-makine bayrağıyla atlandı; mutlak tavanlar korundu. Görsel QA/cihaz kabulü yok.
- Sıradaki: K3P-26

## seq 68 · K3P-25 · DÜZELTME (denetim: "Aç"tan sonra teklif ekranda kalıyordu)
- Tarih: 2026-10-18
- Commit: (bu commit)
- Yapılan: Kullanıcı "bu adım tam ve kusursuz tamamlandı mı" diye denetim istedi; **gerçek bir kusur bulundu.** `App.kaoToggleAutoAdvance` yalnız ayarı çeviriyordu, teklif bayrağını (`ui.kaoAdvanceOffer`) temizlemiyordu: kullanıcı "Hızlı geçişi aç"a bastığında ayar AÇILIYOR ama teklif **ekranda kalıyordu** ve ikinci basış ayarı **geri kapatıyordu** (44 dokunuşluk kazanç bir yanlış dokunuşla geri alınabiliyordu). İki katmanlı düzeltme: (1) `kaoToggleAutoAdvance` ayar değişirken teklif bayrağını temizler (Ayarlar'daki anahtardan çevrildiğinde de geçerli); (2) `noticeModel` **yapısal güvence** olarak bayrak kalmış olsa bile `autoAdvance===true` iken teklifi hiç çizmez.
- Ölçüler: runtime 132,867 → **133,061 KiB** (tavan 136). css 15,877 KiB **değişmedi**. content 184,591. App.kao* 45→45. KAO envanteri 82 sabit. `test_k3p_25` 8 → **9 kontrol** (kusuru yakalayan 2 yeni iddia: bayrak temizliği + yapısal güvence).
- Kapı: `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` **exit 0 — TÜM KAPILAR YEŞİL** · `kapi-hizli --kart K3P-25` **exit 0 — HIZLI KAPI YEŞİL**
- Kanıt düzeyi: kaynak/test · görsel QA yok · cihaz yok
- Gözlem: **Ders:** kabul ölçütleri "ayar sessizce değişmiyor"ü sınıyordu ama **düğmeye basıldıktan sonraki durumu** sınamıyordu. Kart metni "Aç eylemi mevcut handler'ı çağırır" diyor; handler'ın **kendi** sonucu (teklif kapanmalı) hiçbir testte yoktu. Yeni testler bu boşluğu kapatıyor.
- Sıradaki: K3P-26

## seq 69 · K3P-26 · DEVİR (Codex Luna'ya devir notu — uygulama başlamadı)
- Tarih: 2026-10-18
- Commit: (bu commit)
- Yapılan: Kullanıcı "sıradaki için codex luna için devir yaz" dedi. **K3P-26 uygulanmadı**; yalnız yeni oturumun okleyeceği devir belgesi yazıldı: [`DEVIR-K3P-26-CODEX-LUNA.md`](DEVIR-K3P-26-CODEX-LUNA.md). İçerik: yapıştırılacak başlatıcı metni, son üç kartın özeti + ara yayın kanıtı, kartın kabul ölçütleri, **görsel QA güvenlik protokolü** (Guard 1 → `shoot-modal.mjs`; sunucu açma yasağı ve 2026-07-10 veri kaybı gerekçesi), ölçü araçları + bilinen yorumlama tuzakları (akis-olc 2b ≤45 vs AKIS §3 ≤25 · tekrar-uret 9/10 R-08 · perf göreli bant · `$?`/boru tuzağı), bütçe panosu, bu dalda gerçekten ısıran 8 tuzak (K-P pin, migration TAM alan kümesi, lexicon_coverage tek yer, öksüz seçici, kontrast tokenı `--kao-tint`, fx2 pinleri, envanter sayısı, kapı süreleri), KAPANIS.md için hazır malzeme + hipotez takvimi, kabul edilmiş açık sınırlar, §3 kapanış adımları.
- Doğrulama: belgedeki **her komut ve sayı çalıştırılarak teyit edildi** — Guard 1 exit 0 (10 PASS), `shoot-modal.mjs` argüman sırası, `deney-rapor.cjs --ornek`, `cift-sik`/`okunus-denetim`/`dokunus-olc`/`ekran-dok`/`akis-olc` exit 0, perf content 184,591 · runtime **133,061** · css **15,877** KiB, fixture **82**, `pinDeferral.files` = quranLearn.js + quranLearnViews.js, `releaseApproval=NOT_APPROVED`.
- Ölçüler: üretim baytları **değişmedi** (yalnız belge + kayıt). Runtime 133,061 · css 15,877 · content 184,591 · App.kao* 45 · envanter 82. Kart durumu **K3P-26 = todo** (devir kartı kapatmaz).
- Kapı: koşulmadı (kod değişmedi; devir kaydı). `senkron` **UYUMLU**.
- Kanıt düzeyi: belge + komut doğrulaması · görsel QA yok · cihaz yok
- Gözlem: Devir notu bağlayıcı değildir; §1–§6 hâlâ `BAGLAM-YONETIMI.md`. Belge bunu §0'da açıkça yazıyor (çelişkide BAGLAM kazanır). K3P-25'te bulunan kusurun **dersi** devir notuna taşındı ("ölçtüğün şey kullanıcının gördüğü şey mi?").
- Sıradaki: K3P-26 (devir notuyla)

## seq 70 · K3P-26 · KART (Dalga 5)
- Tarih: 2026-10-18
- Commit: (bu commit)
- Yapılan: Son görsel QA ve yeniden ölçüm. `tests/app/test_local_visual_qa_guard.js` **10/10 PASS**; Guard 1 kaynağı/testi denetlendi. `shoot-modal.mjs` CDP üzerinden, 320/390/460 px × açık/koyu için **6 ayrı boş profilde 79'ar görünüm = 474 sentetik ekran** aldı. Her profil `token:false`, `force:null`, `blocked-external:42` kaydetti; dış istekler engellendi. Her görünüm `overflowX=false`; 15 tarama bulgusunun tamamı beklenen kaydırmalı sûre/gramer/ders alanı (`KAYDIRMALI-ALAN(bilgi)`), istenmeyen sayfa taşması veya kırpılma yok. Altı kontak ve 390 px K3P-00/K3P-26 karşılaştırması `kao3-premium/kanit/sonraki/` altında.
- Yeniden ölçüm: çift şık 0/1.127 yerleşik + 0/1.087 yeni; vasl 0; eksik güneş harfi idgâmı 0; dokunuş 72 (otomatik geçiş kapalı) / 42 (açık; hedef ≤40'ı 2 aşıyor); toplam kelime görevlerinde tanıma payı yeni %92,92 / yerleşik %91,57 (≤%60 hedefi karşılanmıyor); karışık 1.324 tekrar örneğinde R1 %48,94 ayrı örnek ölçüsü; Bugün 5 seçim/6 toplam düğme; `App.kao*` 45. Akış: en uzun edilgin dizi 1; hedef ekranı 62/25 sözcük; tanış 33, kavram 24; ilk yenilik 7 dokunuş; açılış → ilk görev 3/2 dokunuş; iki yanlışta 2 şık, doğru yanıttan sonra 4; aynı görev + devam ipucu geri yükleniyor; overlay remount 0; ders toast'ı 0. Oturum başarı bandı cihaz verisi olmadan ölçülmedi.
- Bütçeler: runtime L6 133,061 KiB (ilk 128 KiB hedefini aşar; K3P-18'de onaylanan 136 KiB tavanının altında), CSS L9 15,877 KiB (16 KiB tavanı altında, yaklaşık 123 B pay), içerik gzip 184,591 KiB, WOFF2 24.473 KiB. Önce/sonra tabloları `ANALIZ.md` §7 ve `AKIS.md` §6'ya; ayrıntılı tablo, 14./30. gün H2–H9 planı ve açık sınırlar `KAPANIS.md`'ye eklendi. Üretim JS/CSS, `data`, `migrate()` ve `App.kao*` değişmedi.
- Kapılar: Guard 1 **10/10 PASS**; `node kao3-premium/araclar/kapi-hizli.mjs --kart K3P-26` **exit 0 — HIZLI KAPI YEŞİL**; `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` **exit 0 — TÜM KAPILAR YEŞİL** (KAO 82, app 78, panel 23, panel-v2 27, quran 9; reminders, driver, zikr, kontrast, çift şık, okunuş, kao-plan-check, pin senkronu PASS). Tam kapı perf: p95 20,099 ms, steady 6,770 ms; `KAO2_ACCEPT_SLOW_HOST=1` göreli bant kıyasını atladı, mutlak bütçeler PASS. `tekrar-uret.cjs` özeti 9/10; tarihsel R-08 kalemi sürüyor ve 10/10 iddiası yok.
- Ölçü tabloları kullanıcı hedeflerini gizlemez: açık varsayılan dokunuş 2 fazla; hedef ekranı 37 sözcük fazla; ilk göreve 1 dokunuş fazla; toplam kelime görevlerinde tanıma payı hedef üstünde. Bu kartta davranış/kod düzeltmesi yapılmadı.
- Kanıt düzeyi: kaynak/headless + kontrollü yerel sentetik görsel QA. Cihaz, gerçek ekran okuyucu, L2 uzmanı ve 230 kayıt incelemesi bekliyor. Son canlı pin temel alınarak 14. gün 2026-10-31, 30. gün 2026-11-16; yedek/veri sınırı `KAPANIS.md`'de.
- Sınır: `releaseApproval=NOT_APPROVED`; `pinDeferral.files` aynen kaldı. Push/merge/tag/deploy ve kişisel veri/gerçek hesap işlemi yok. K3P-27 ayrıca yetki gerektirir.
- Sıradaki: K3P-27

## seq 71 · K3P-27 · YAYIN HAZIRLIĞI
- Tarih: 2026-10-18
- Commit: (bu commit)
- Yetki: kullanıcı “sıradaki adım dan devam et ve tümünü canlıya al” diyerek K3P-27 yayınını açıkça istedi. `releaseApproval=APPROVED-2026-10-18`.
- Pin aracı: mevcut `kao3-premium/araclar/pin-yukselt.mjs` incelendi; `20261018a --dene` önizlemesi ve uygulama koşusu tamamlandı. `git diff main --name-only` içindeki değişen üretim varlıkları `app/core/quranLearn.js` ve `app/core/quranLearnViews.js`; ortak pin `20261017a → 20261018a`. `index.html`, `panel-v2.html`, `sw.js` ve 12 testi içeren toplam **15 dosyada 82 pin geçişi** yapıldı. `K3P-STATE.json → pinDeferral.files=[]`.
- Doğrulama: `tests/app/test_asset_pin_freshness.js` **61/61 taze**, `tests/app/test_iip_22.js` **13/13**, `senkron` UYUMLU, `kao-plan-check` PASS, `git diff --check` PASS.
- Tam kapı: `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` **exit 0 — TÜM KAPILAR YEŞİL**. KAO 82, app 78, panel 23, panel-v2 27, quran 9; reminders, driver, zikr, kontrast, çift şık, okunuş, plan ve pin senkronu PASS. Perf: içerik **184,591 KiB**, runtime **133,061 KiB**, CSS **15,877 KiB**, p95 **4,924 ms**, steady **3,154 ms**; yavaş-makine bayrağı göreli bandı atladı, mutlak bütçeler PASS. `tekrar-uret` bilgilendirme özeti **9/10**, tarihsel R-08 açık; 10/10 iddiası yok.
- Durum: yerel yayın adayı hazır; Pages koşusu ve no-cache canlı parity kanıtı bekleniyor. Kişisel veri deposuna erişilmedi; uygulama tarayıcıda açılmadı; tag oluşturulmadı.

## seq 72 · K3P-27 · KART (Dalga 5 sonu — yayın makbuzu ve program kapanışı)
- Tarih: 2026-10-18
- Commit: (bu commit)
- Kaynak/yayın commit'i: `6c10693c` (`K3P-27: yayın pini — K3P canlıda`), `main` üzerine fast-forward; `origin/main` push başarılı.
- Pages: run **39126116607**, head `6c10693c8e8fbed997f89bbfd41a0f5117953f4d`; validate **SUCCESS**, deploy **SUCCESS**. Site: https://mustafaras.github.io/s/.
- Canlı kanıt (salt-okur): `Cache-Control: no-cache`, `Pragma: no-cache`, `cache: no-store` ve tek kullanımlık query ile 3 host dosyası (`index.html`, `sw.js`, `panel-v2.html`) + **61 sürümlü URL**. Toplam **64/64 HTTP 200 ve 64/64 yerel/canlı SHA-256 eşliği**. `SW_VERSION='20261018a'`.
- Kapanış: `K3P-STATE.json` → `status=completed`, `nextPrompt=null`, `releaseApproval=APPROVED-2026-10-18`, 37/37 kart; `pinDeferral.files=[]`. `CURRENT-STATE.md`, `KAPANIS.md` ve README canlı kanıtla eşitlendi.
- Kanıt düzeyi: source/headless + K3P-26 kontrollü sentetik görsel QA (474 görünüm) + canlı statik dosya eşliği. Cihaz kabulü, gerçek ekran okuyucu, L2 uzman incelemesi ve 230 kayıt incelemesi kullanıcı tarafında. `mustafaras/seyma-data` okunmadı/yazılmadı; uygulama gerçek tarayıcıda açılmadı; tag yok.
- Sıradaki: —
