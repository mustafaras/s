# K3P · Prompt listesi (36 prompt, sırayla)

## §0 Nasıl kullanılır

**Kullanıcı için**

1. Her prompt'u **yeni bir oturumda** ver. Bir oturumda yalnız bir prompt olsun.
2. Sıradaki prompt'u almak için şu komutu çalıştır ve çıktısının tamamını kopyalayıp yeni oturuma
   yapıştır:

   ```bash
   node kao3-premium/araclar/senkron.mjs --sonraki
   ```

   Aynı metin aşağıda, `<!-- PROMPT … -->` blokları içinde de duruyor.
3. Sıra: `node kao3-premium/araclar/senkron.mjs --liste`. Şu an sıradaki prompt `▶` ile işaretli
   olanıdır.
4. Prompt yarıda kalırsa (bağlam doldu, hata çıktı) **aynı prompt'u** yeni bir oturumda tekrar ver.
   Devir notu kaldığı yerden sürdürür.
5. 📷 işaretli prompt'u vermek, o oturumda ekran görüntüsü alınmasına açık izin vermek demektir.
   🚀 işaretli prompt ayrıca senden onay ister.

**Uygulayıcı ajan için**

- Her prompt `kao3-premium/BAGLAM-YONETIMI.md` belgesine dayanır:
  - §1: açılış protokolü
  - §3: kapanış protokolü
  - §4: devir
  - §5: durma koşulları
  - §6: sabit kurallar
- Bu kurallar prompt metninde tekrar edilmez, ama hepsi bağlayıcıdır.
- Uygulama sırası `K3P-STATE.json → executionOrder` alanındadır:
  **Dalga 0** (doğruluk) → **Dalga A** (akış) → **Dalga 1** (görsel) → **Dalga 2** (Tezhip) →
  **Dalga 3** (öğrenme motoru) → **Dalga 4** (ödül) → **Dalga 5** (kapanış).

---

# Dalga 0 — Doğruluk ve ölçüm

<!-- PROMPT K3P-00 -->
**K3P-00 · Çalışma dalı, görsel temel çizgi ve taban ölçümleri 📷**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` belgesinin §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-00**. İş bitince §3'ü, bağlam yetmezse §4'ü uygula.

Bu prompt'u vermem iki şeye açık izin demektir:

- `kao3-premium` adında yerel bir dal kurmak.
- CLAUDE.md'deki kontrollü yerel görsel QA istisnası kapsamında ekran görüntüsü almak.

Plan klasörü ve CLAUDE.md/AGENTS.md yönlendirme satırı 2026-10-10'da zaten `main`'e girdi (LEDGER seq 4).

**Oku:**

- `kao3-premium/README.md`
- `tools/kapi/gorsel-qa/README.md`

**Görev:**

1. **Açılış istisnası.** Bu adımda dal henüz yok. `main` üzerinde olmalısın ve çalışma ağacı temiz olmalı. Değilse DUR.
2. **Dal.** `git switch -c kao3-premium` ile dalı aç. Bundan sonraki bütün kartlar bu dalda yapılır. Push yapılmaz.
3. **Görsel temel çizgi (📷).**
   1. Önce `node tests/app/test_local_visual_qa_guard.js` çalıştır; yeşil olmalı.
   2. Sonra iki çekim yap. Chrome macOS sandbox'ında açılmadığı için bu komutlar sandbox dışında koşar. Komut izni sorulursa ben onaylarım.
      - Açık tema: `node tools/kapi/gorsel-qa/shoot-modal.mjs "$PWD" "$TMPDIR/k3p-onceki-acik" k3p00a-$RANDOM 390`
      - Koyu tema: `... "$TMPDIR/k3p-onceki-koyu" k3p00k-$RANDOM 390 dark`
   3. Sunucu kurma. Token, forceSync ve gerçek tarayıcı profili kullanma.
   4. Çıktıyı `kao3-premium/kanit/onceki/` altına koy:
      - Açık ve koyu tema için birer kontak sayfası (python3 ve PIL varsa).
      - PIL yoksa en çok 12 PNG.
      - `log.txt`
   5. Görüntülerde yalnız sentetik veri olmalı. Bunu `log.txt` içindeki `token:false` satırıyla doğrula.
   6. Görsel QA yapılamazsa kart durmaz. LEDGER'a "görsel QA: yok (neden)" yaz ve devam et.
4. **Taban ölçümleri.** Şu araçları çalıştır ve sayıları LEDGER kaydına yaz:
   - `cift-sik.cjs`
   - `okunus-denetim.cjs`
   - `dokunus-olc.cjs`
   - `akis-olc.cjs`
   - `KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_perf_budget.js` (son satırı yeterli)

   İlk ikisinin exit 1 vermesi beklenen durumdur.

**Yapma:** Uygulama koduna dokunma.

**Kabul:**

- `kapi-hizli --kart K3P-00` yeşil.
- `senkron` uyumlu ve sıradaki prompt `K3P-01`.
- Dal `kao3-premium`.

**Commit:** `K3P-00: çalışma dalı, görsel temel çizgi ve taban ölçümleri`
<!-- /PROMPT K3P-00 -->

<!-- PROMPT K3P-01 -->
**K3P-01 · Çift şık hatası (B-01)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-01**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/ANALIZ.md` → B-01 ve §6'nın ilk satırı
- `app/core/quranLearn.js` → `kaoPickDistractors` (~340) ve `kaoBuildTask` (~355); her biri en çok 120 satır
- `tests/kao/test_kao_queue.js:125-140`
- `kao3-premium/araclar/cift-sik.cjs`

**Görev:**
1. **Kırmızı test.** `tests/kao/test_k3p_distractors.js` dosyasını yaz. Test, `tests/kao/helpers/kao-harness.js` dosyasındaki `bootKao({seeded:true})` ile kurulan yerleşik kullanıcıyla ve yeni kullanıcıyla 109 dersi oynatır. Her görev için şunları denetler:
   - Gösterilen şık etiketleri tekil olmalı. `tr>ar` görevinde gösterilen Arapça, `ar>tr` görevinde anlam karşılaştırılır.
   - Çeldirici lemmalar tekil olmalı ve hedef lemmadan farklı olmalı.
   - Şık sayısı korunmalı: 4 ya da `choiceCount`.
   - Doğru şık bir tane olmalı.

   Ayrıca iki yönlü kart çiftini (`w:X:ar>tr` + `w:X:tr>ar`) kuran küçük, birim düzeyinde bir vaka ekle. Testin bugünkü kodda kırmızı olduğunu gör.
2. **Yeşil.** Tekilleştirme **gösterilen etikete ve lemmaya** göre yapılmalı. Yedek yoldaki `parts` ve `overlaps` mantığını tek bir iç yardımcıya çıkar, iki yol da onu kullansın (DRY). Tekilleştirme yüzünden eksilen şıkkı mevcut sözlük yedeği katmanlarıyla doldur.
3. **Kararlılık.** Bugün çift şık içermeyen görevlerin şıkları ve sırası **değişmemeli**. Seed davranışı korunur. Bunu teste ekle: düzeltmeden önce ve sonra, çiftsiz görevlerin seçim listeleri aynı olmalı. Önceki çıktıyı `$TMPDIR` altında bir JSON dosyasına yazarak karşılaştır.
4. **Envanter.** `tests/kao/README.md` tablosuna yeni testin satırını ekle.

**Yapma:**
- Veri şemasını, FSRS'i ve `App.kao*` yüzeyini değiştirme.
- İçerik modüllerine dokunma.

**Kabul:**
- `node kao3-premium/araclar/cift-sik.cjs` → yeni ve yerleşik kullanıcıda **0/0**, exit 0.
- Yeni test yeşil.
- `kapi-hizli --kart K3P-01 --yavas` (ders planına ya da görev kurucusuna dokunduğu için yavaş testler zorunlu) yeşil; bu karttan sonra `cift-sik` kapısı zorunlu hale gelir.
- LEDGER'a yazılacak ölçü: çift şık 631/1127 → 0.

**Commit:** `K3P-01: çeldiriciler lemma ve etiket bazında tekil — aynı şık iki kez çıkmıyor`
<!-- /PROMPT K3P-01 -->

<!-- PROMPT K3P-02 -->
**K3P-02 · Geri bildirim ve özet metni (B-02, B-05)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-02**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/ANALIZ.md` → B-02 ve B-05
- `kao3-premium/KARARLAR.md` → K-C, "Kayma ile hatayı ayırmak" maddesi
- `app/core/quranLearn.js`:
  - `kaoTaskHTML` içindeki geri bildirim bölümü (~1765-1780)
  - `kaoOpenFeedback` (~1849)
- `app/core/quranLearnViews.js` → `feedbackSheet` ve özet (~316)
- `tests/kao/test_kao2_feedback.js`

**Görev:**
1. **Kırmızı test.** Testi genişlet ya da yeni bir test yaz. Beklenen davranış:
   - Doğru cevap panelinde `kaoUndo` eylemi **yok**.
   - Gövdede "Doğru" sözcüğü başlıkla tekrar etmiyor.
   - Yanlış cevap panelinde geri alma düğmesinin etiketi **"Yanlışlıkla dokundum"**.
   - Ders özetinde "tamamlandı" sözcüğü **bir kez** geçiyor.
2. **Yeşil.** Değişiklik en küçük olmalı.
   - Özet başlığının nerede üretildiğini `grep -n "tamamlandı" app/core/quranLearn*.js` ile bul.
   - Üst satır "Ders tamamlandı" olarak kalsın. Başlıkta yalnız dersin adı yazsın.
3. Eski metni bekleyen bir test varsa, testi yeni spesifikasyona göre güncelle ve gerekçesini LEDGER'a yaz. Bu, testi gevşetmek değil; spesifikasyon değişti (K-C).

**Yapma:**
- Otomatik geçiş davranışına dokunma; o K3P-15'in işi.
- Görsel stile dokunma.

**Kabul:**
- Testler yeşil.
- `node kao3-premium/araclar/ekran-dok.cjs "$TMPDIR/k3p02"` → `ders-*-geribildirim-word.html` dosyasında "Aslında biliyordum" yok.
- `kapi-hizli --kart K3P-02` yeşil.

**Commit:** `K3P-02: doğru cevapta geri alma yok, yanlışta "Yanlışlıkla dokundum"; özet başlığı tek`
<!-- /PROMPT K3P-02 -->

<!-- PROMPT K3P-03 -->
**K3P-03 · Süre tahmini için taban (B-06)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-03**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/ANALIZ.md` → B-06
- `app/core/quranLearnFlow.js:350-420` (`estimateMinutes` ve çevresi)
- `tests/kao/test_kao2_next_step.js`

**Görev:**
1. **Kırmızı test (tablo güdümlü).** Şu girdiler için 24 görevlik tahmin **≥ 3 dk** olmalı:
   - `ms` yok
   - `ms` = 0
   - `ms` çok küçük (1 ms/görev)
   - `answered` = 0
   - normal veri (9 sn/görev)

   Normal veride tahmin değişmemeli.
2. **Yeşil.**
   - Görev başına süreye 6 sn taban koy.
   - `ms` alanı yoksa ya da sayı değilse `MIN_PER_TASK` kullan.
   - Taban için adlandırılmış bir sabit kullan; sihirli sayı yazma.

**Kabul:**
- Test yeşil.
- `ekran-dok` çıktısında Bugün ekranı "~1 dk" göstermiyor (seeded durum).
- `kapi-hizli --kart K3P-03` yeşil.

**Commit:** `K3P-03: süre tahmininde görev başına 6 sn taban — "~1 dk" yanılgısı bitti`
<!-- /PROMPT K3P-03 -->

<!-- PROMPT K3P-04 -->
**K3P-04 · Okunuş motoru: vasl, şemsî idgâm, vakf (B-03, K-A)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-04**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

Bu kart büyük olabilir. Devir protokolü (§4) normal bir yoldur; gerekirse kullan.

**Oku:**
- `kao3-premium/KARARLAR.md` → K-A (tablo dahil)
- `kao3-premium/ANALIZ.md` → B-03
- `tools/kao-lexicon-build.mjs`:
  - dosyanın başındaki kullanım notu
  - `transliterate` (~1067)
  - `translitTr` (~1135)
  - `wordTranslitTr` (~1142)
- `tools/kao-content-freeze.mjs` → başındaki kullanım notu
- `app/core/quranLearn.js:491-540` (çalışma zamanı okuyucu `kaoDiaReading` ve `kaoLemmaReading`)
- `tests/kao/test_kao_pronunciation_contract.js`
- `tests/kao/test_kao_freeze_repro.js`

**Görev:**
1. **Kırmızı test.** `test_kao_pronunciation_contract.js` dosyasına K-A tablosundaki örnekleri sabit beklenti olarak ekle:
   - ٱسْم → `ism`
   - ٱبْن → `ibn`
   - ٱسْتَغْفَرَ → `istağfera`
   - Fâtiha 1:1 örnek okunuşu → `bismi-llâhi-r-rahmâni-r-rahîm` (kelime sınırları korunur)
   - âyet sonu vakf

   Bunlara ek olarak `okunus-denetim.cjs` mantığı (vasl 0, idgâmsız 0) da teste girer.
2. **Araç.** Kuralları araca ekle; tablo ya da adlandırılmış fonksiyon olarak yaz:
   - vasl elifi: `ٱل` → `a`/`e`, diğerleri → `i`
   - şemsî harflerde harf-i tarif idgâmı
   - cümle içi vasl: önceki kelimeye bağlanır
   - âyet sonunda vakf

   `dia` katmanı DİA düzeninde kalır.
3. **Çalışma zamanı.** `kaoDiaReading` gibi, çalışma zamanında okunuş üreten kod varsa aynı kurallar orada da uygulanır. Kuralları iki yere kopyalama; ortak bir tablo yolu varsa onu kullan. Böyle bir yol yoksa iki tarafı birbirine karşı denetleyen bir test ekle.
4. **Yeniden üretim.**
   1. İçeriği aracın kendi komutuyla yeniden üret, ardından `kao-content-freeze` ile dondur. Gerekli girdiler `kaynak/kuran/` altında.
   2. Girdiler eksikse ya da araç **başka** alanlarda bayt farkı üretiyorsa DUR ve bildir.
   3. Yalnız okunuş alanları değişmeli. Bunu kanıtla: önce/sonra JSON farkında okunuş dışında değişen alan sayısı 0 olmalı.
5. **İnceleme durumu.**
   - Lemmaların `verified` ve inceleme alanlarına elle dokunma.
   - Okunuşu değişen lemmaların listesini ve sayısını LEDGER'a yaz.
   - Raporda kullanıcıya, bu lemmalar için L2 (kıraat hocası) incelemesi önerildiğini belirt.

**Yapma:**
- Arapça metni değiştirme.
- Ses kayıtlarına dokunma.
- İçerik bütçesini aşma (≤ 256 KiB).

**Kabul:**
- `okunus-denetim.cjs` exit 0.
- `test_kao_freeze_repro` ve `test_kao_pronunciation_contract` yeşil.
- `ekran-dok` → kelime ekranı başlığı `ism`.
- `kapi-hizli --kart K3P-04` yeşil; bu karttan sonra `okunus-denetim` kapısı zorunlu hale gelir.

**Commit:** `K3P-04: okunuş motoru vasl, şemsî idgâm ve vakfı uyguluyor — ism, ibn, er-rahmân`
<!-- /PROMPT K3P-04 -->

<!-- PROMPT K3P-05 -->
**K3P-05 · Deneyim ölçüleri kapıya, deney raporu aracı (dalga sonu)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-05**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula. Bu kart Dalga 0'ın son kartı; tam kapı da koşulacak.

**Oku:**
- `kao3-premium/KARARLAR.md` → §6 (ölçüm kaynağı ve H1–H6)
- `kao3-premium/AKIS.md` → §7
- `tools/kapi/kapilar.sh`
- `kao3-premium/araclar/kapi-hizli.mjs`

**Görev:**
1. `tools/kapi/kapilar.sh` dosyasına iki satır ekle:
   - `gate "k3p çift şık" node kao3-premium/araclar/cift-sik.cjs`
   - `gate "k3p okunuş" node kao3-premium/araclar/okunus-denetim.cjs`
2. `kao3-premium/araclar/deney-rapor.cjs` aracını yaz.
   - **Girdi:** Kullanıcının verdiği bir JSON yedeği. Aracın bir argüman olarak `--ornek` almasını sağla; bu, sentetik bir yedek üretip onunla çalışır.
   - **Okuma:** Yalnız şunları okur:
     - `quranLearn.cards[*]` içinden `s`, `lapses`, `reps` ve `state`
     - `quranLearn.daily`
     - `quranLearn.path.lessons[*]` içinden `resume` ve `doneAt`
   - **Çıktı:** H2, H5, H7, H8 ve H9 için toplu sayılar. H3 için "K3P-16 sonrası etkin" yaz.
   - **Yazmaz:** Ne dosya ne ağ. Kelime, metin ya da kimlik basmaz.
   - Gerçek veriyi **kendin okuma**. Gerçek veri kullanıcının elinde kalır; sen yalnız `--ornek` ile doğrula.
3. `kao3-premium/araclar/` altındaki araçların listesini README tablosuna ekle.

**Kabul:**
- `node kao3-premium/araclar/deney-rapor.cjs --ornek` tabloyu basıyor ve çıktıda hiç Arapça ya da kart kimliği yok. Bunu bir `grep` ile kanıtla.
- `kapi-hizli --kart K3P-05` yeşil.
- `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → "TÜM KAPILAR YEŞİL".

**Commit:** `K3P-05: çift şık ve okunuş kapıda; deney raporu aracı (yalnız toplu sayı)`
<!-- /PROMPT K3P-05 -->

---

# Dalga A — Akış (öncelikli)

<!-- PROMPT K3P-A1 -->
**K3P-A1 · Overlay yerinde güncellenir (A-7, D-0, K-M)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-A1**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/AKIS.md`:
  - §1, A-7 satırı
  - §5, D-0 satırı
- `app.js`:
  - 4986. satır (`render`)
  - `grep -n "registerQuranLearnSurface" app.js` ile bulunan satırdaki `mount` işlevi
- `app/core/quranLearn.js`:
  - `kaoOverlayHTML`
  - `kaoMount`
  - `kaoOpen`
  - `kaoClose` (~3755-3795)
- `app/kao.css`:
  - `grep -n "sey-sheet-in\|seyFade" app/kao.css` ile bulunan iki kural

**Sorun:** Her `render()` çağrısı overlay'i silip yeniden ekliyor. Bunun sonuçları:

- Açılış animasyonu tekrar tekrar oynuyor.
- Kaydırma konumu sıfırlanıyor.
- Odak kayboluyor.
- Bir derste 7 aşama geçişinin 7'sinde de bu oluyor.

**Görev:**
1. **Saf ayrıştırıcı.** `quranLearn.js` içine bir ayrıştırıcı ekle ve `window.SeymaQuranLearn` üzerinden dışa aç. Bu bir `App.*` değildir.
   - Ad: `kaoSplitOverlay(html)`
   - Döndürdüğü nesne: `{cardAttrs, bodyAttrs, body, screenKey}`
   - `screenKey`, `.kao-screen-<view>` sınıfından ve oturumdaki ders aşamasından türetilir.
2. **Yerinde mount.** `app.js` içindeki `mount` işlevi şöyle değişir:
   - **Overlay yoksa:** Bugünkü gibi ekle.
   - **Overlay varsa:** Düğümleri koru, yalnız şunları değiştir:
     1. `#sey-ov-card` niteliklerini (`style`, `aria-labelledby`/`aria-label`) güncelle.
     2. `#sey-ov-body` için `innerHTML` ata.
     3. `screenKey` aynıysa `.kao-body` kaydırmasını koru; farklıysa 0 yap.
     4. Odaklı öğenin `id`'si yeni içerikte hâlâ varsa odağı ona geri ver.
3. **Animasyon.** Açılış animasyonu yalnız ilk eklemede çalışmalı. Düğüm korunduğu için CSS animasyonu kendiliğinden yeniden başlamaz. Bunu bir yorumla belgele.
4. **Test.** `tests/kao/test_k3p_mount.js` yaz:
   - Ayrıştırıcı birim testleri: tüm görünümlerde aynı `screenKey` aynı görünüme denk gelmeli.
   - Küçük bir sahte DOM nesnesiyle mount testi (`getElementById`, `setAttribute`, `innerHTML` alanı yeterli). Bir derste 7 aşama geçişi boyunca overlay düğüm kimliği aynı kalmalı.
   - Envantere ekle.

**Yapma:**
- `App.*` ekleme.
- Görev boyamayı (`paintTask`) değiştirme.
- Modal klavye sözleşmesini bozma: `role=dialog` ve `onkeydown` dış kartta kalır.

**Kabul:**
- Yeni test yeşil.
- `test_kao2_navigation` ve `test_kao2_a11y` yeşil.
- `kapi-hizli --kart K3P-A1` yeşil.
- LEDGER'a yazılacak ölçü: ders başına overlay yeniden kurulumu 7 → 0.

**Commit:** `K3P-A1: KAO overlay yerinde güncelleniyor — açılış animasyonu her adımda yeniden oynamıyor`
<!-- /PROMPT K3P-A1 -->

<!-- PROMPT K3P-A2 -->
**K3P-A2 · Odak kilidi: ders sırasında toast ertelenir (A-6, D-8)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-A2**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/AKIS.md` → A-6 ve D-8
- `app/core/helpers.js:70-90` (`toast`)
- `grep -n "toast(" app/core/crisis.js app.js | head -40`

**Görev:**
1. **Sorgu.** `window.SeymaQuranLearn.kaoFocusLocked()` adında bir sorgu ekle. `ui.kaoOpen && ui.kaoLesson` doğruysa `true` döner. Bu bir `App.*` değildir.
2. **Kuyruk.** `toast(msg, ms, opts)`: Kilit açıksa mesaj kuyruğa alınır.
   - Kuyruk en çok 3 mesaj tutar ve tekrar eden mesajı bir kez saklar.
   - `opts.urgent === true` olan mesaj ertelenmez.
   - Kriz modülündeki toast çağrılarına `{urgent:true}` ekle.
3. **Boşaltma.** Ders bitince ya da dersten çıkınca (`kaoLesson('exit')`, özet ekranı, `kaoClose`) kuyruk boşaltılır. Mesajlar art arda değil, birleştirilmiş tek bir toast olarak gösterilir.
4. **Test.** `tests/kao/test_k3p_focus_lock.js`: `helpers.js` dosyasını sahte bir `document` ile `vm` içinde yükle. Şunları kanıtla:
   - Kilit açıkken `#sey-toast` eklenmiyor.
   - `urgent` mesaj gösteriliyor.
   - Boşaltmada tek bir toast çıkıyor.

   Testi envantere ekle.

**Yapma:**
- Toast'ın görünümünü değiştirme.
- Başka modüllerin banner'larına dokunma. Varsa yalnız gözlem olarak not et.

**Kabul:**
- Test yeşil.
- `tests/app` kriz ve helpers fixture'ları yeşil (`kapi-hizli` içinde).
- `kapi-hizli --kart K3P-A2` yeşil.

**Commit:** `K3P-A2: ders sırasında toast'lar bekletiliyor (kriz hariç), ders bitince tek bildirim`
<!-- /PROMPT K3P-A2 -->

<!-- PROMPT K3P-A3 -->
**K3P-A3 · Nefes ritmi: ders mimarisi (A-1, A-2, K-L)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-A3**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

Bu kart büyük olabilir; devir protokolü (§4) normal bir yoldur.

**Oku:**
- `kao3-premium/AKIS.md`:
  - §1 ritim ölçümü
  - §3 tamamı
- `app/core/quranLearnFlow.js:160-230` (`lessonPlan`)
- `app/core/quranLearn.js`:
  - `kaoLessonActivate` (~1915) ve `kaoLesson('start')` yolu
  - yerini `grep -n "function kaoLesson(" app/core/quranLearn.js` ile bul
- `tests/kao/test_kao2_lesson_flow.js`
- `tests/kao/test_kao2_lesson_coherence.js` (yalnız başlık açıklaması)

**Bugünkü ritim:**

```text
G×20 [goal][intro×4][concept] G×10 [apply]
```

- Pratikten önce 6 edilgin ekran art arda geliyor.
- İlk yeni içeriğe ulaşmak 21 dokunuş sürüyor.

**Hedef ritim (AKIS §3):**

1. **Hedef:** goal ekranı.
2. **Isınma:** Vadesi gelmiş, kararlılığı (`s`) en yüksek 3–5 tekrar.
3. **Tanış-Sına döngüsü:** Her yeni lemma için önce intro, ardından **hemen** 2 şıklı bir tanıma görevi.
4. **Kavram:** Örnekten kurala gider ve hemen ardından 1 görev gelir.
5. **Karışık pekiştirme:** Kalan tekrarlar, yeni kelimeler ve gramer birlikte. Görev türü her soruda değil, 3–5 görevlik bloklar halinde değişir.
6. **Zirve:** apply ekranı.
7. **Özet.**

**Görev:**
1. **Kırmızı test.** `test_kao2_lesson_flow.js` dosyasını genişlet ya da `tests/kao/test_k3p_rhythm.js` yaz. 109 ders taranır ve her ders için şunlar denetlenir:
   - Art arda en uzun edilgin (görev dışı) ekran dizisi ≤ 1. Hedef ekranı bu sayıma dahildir.
   - İlk yeni içerik (intro) ≤ 7. dokunuşta geliyor.
   - Her intro'dan hemen sonra o lemmanın görevi geliyor.
   - Ders içindeki toplam görev sayısı bugünküne göre ±%20 içinde kalıyor.
2. **Yeşil.** Değişen yalnız plan **sırası**. `lessonPlan` ve review fazını yeniden düzenle.
   - Isınma için tekrarları seçerken kararlılığı en yüksek olanları al.
   - Kalan tekrarları karışık pekiştirme bölümüne serpiştir.
   - Ustalık ve onarım oturumlarına (`kaoUnitSession`) **dokunma**.
3. **Devam noktası uyumu.** `kaoLessonResume` yeni sırayla çalışmalı. Yarıda bırak → yeniden yükle → devam et senaryosunu teste ekle (`akis-olc` 3. ölçümüne bak).
4. **Eski testler.** Eski sırayı bekleyen testleri yeni spesifikasyona göre güncelle ve gerekçelerini LEDGER'a yaz.

**Yapma:**
- FSRS, kart şeması ve kuyruk notlamasına dokunma.
- Tutarlılık kapısını gevşetme.

**Kabul:**
- `node kao3-premium/araclar/akis-olc.cjs` çıktısı:
  - art arda en uzun edilgin dizi ≤ 1
  - ilk yeni içeriğe ≤ 7 dokunuş
- `test_kao2_lesson_coherence`, `test_kao2_mastery` ve `test_kao2_denetim` yeşil.
- Çalışma zamanı boyutu ≤ 128 KiB. Ölçtüğün değeri LEDGER'a yaz.
- `kapi-hizli --kart K3P-A3 --yavas` (ders planına ya da görev kurucusuna dokunduğu için yavaş testler zorunlu) yeşil.

**Commit:** `K3P-A3: nefes ritmi — hedef, ısınma, tanış-sına döngüsü, karışık pekiştirme, zirve`
<!-- /PROMPT K3P-A3 -->

<!-- PROMPT K3P-15 -->
**K3P-15 · Üç kollu geri bildirim ve otomatik geçiş (K-C, A-4)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-15**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/KARARLAR.md` → K-C (tablo dahil)
- `app/core/quranLearn.js`:
  - `kaoAnswer` (`grep -n "function kaoAnswer"`)
  - `kaoAutoAdvance` (~1854)
  - `kaoTaskMs` (~1839)
  - `kaoPlay` (~2326)
  - `kaoTaskHTML` geri bildirim bölümü
  - `emptyQuranLearn` (~3806)
- `kao3-premium/araclar/dokunus-olc.cjs`

**Görev:**
1. **Kırmızı test.** `tests/kao/test_k3p_feedback_arms.js` yaz:
   - **Hızlı doğru** (yanıt süresi kişisel medyanın altında): geri bildirim paneli açılmıyor. Şık doğru durumunu ve ✓ işaretini alıyor. 600 ms sonra zamanlayıcı ilerletiyor.
   - **Yavaş doğru** (süre medyanın üstünde ya da bu görevde ses yeniden çalındı): tek satırlık şerit görünüyor ve 1.600 ms sonra ilerletiyor. Şeride dokunulursa otomatik geçiş duruyor ve "Devam" düğmesi çıkıyor (mevcut `kaoContinue`).
   - **Yanlış:** Tam kart açılıyor, otomatik geçiş yok. "Yanlışlıkla dokundum" düğmesi var.
   - **Ayar kapalıysa** (`autoAdvance === false`): doğru cevapta kompakt şerit ve tek "Devam" dokunuşu.
2. **Yeşil.**
   - Medyan `ui.kaoLatency` içinde tutulur: son 50 yanıt süresi. Kalıcı yazılmaz.
   - "Ses yeniden çalındı" bilgisi de yalnız `ui` içinde tutulur.
   - Süreler adlandırılmış sabitlerdir.
3. **Varsayılan.** `emptyQuranLearn` içinde yeni kullanıcı için `autoAdvance: true` olur. Bu, K-C kararıyla onaylanmış bir **varsayılan** değişikliğidir. `ensureQuranLearn` normalizasyonu mevcut kullanıcının kayıtlı değerini **değiştirmez**; bunu teste koy.
4. **Ölçüm aracı.** `dokunus-olc.cjs` yeni davranışı ölçecek şekilde güncellenir: hızlı ve yavaş kolları zamanlayıcıyla ölçer.

**Kabul:**
- Yeni kullanıcı varsayılanında ders başına dokunuş ≤ 40. LEDGER'a yaz: 69 → ?
- `test_kao2_feedback` ve `test_kao2_migration` yeşil.
- `kapi-hizli --kart K3P-15` yeşil.

**Commit:** `K3P-15: üç kollu geri bildirim — hızlı doğru akar, yavaş doğru pekiştirir, yanlış öğretir`
<!-- /PROMPT K3P-15 -->

<!-- PROMPT K3P-A4 -->
**K3P-A4 · Oturum zaman bütçesi (K-O)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-A4**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/AKIS.md` → §3, "Zaman bütçesi" paragrafı
- `app/core/quranLearn.js`:
  - `kaoBuildQueue` (~290)
  - `forgettingCurve` (~107)
  - `elapsedDays` (~90)
- `app/core/quranLearnFlow.js:350-420`

**Görev:**
1. **Kırmızı test.** `tests/kao/test_k3p_budget.js` yaz:
   - 5 dakika seçmiş ve 60 vadeli kartı olan bir kullanıcının ders planı tahmini ≤ 5 dk.
   - Plana alınan tekrarlar, geri çağrılabilirlik `R` değerine göre küçükten büyüğe sıralı.
   - Plana alınmayan kartlar ertesi gün yine vadeli; kart verisi değişmemiş.
2. **Yeşil.**
   - Görev başına süre: kişinin ölçülmüş medyanı. En az 6 sn (K3P-03'teki taban).
   - Görev sayısı üst sınırı = seçilen dakika ÷ görev başına süre.
   - Tekrarlar `R` değerine göre küçükten büyüğe seçilir.
   - Yeni lemma ve kavram görevleri bütçeden önce ayrılır, yani dersin özü korunur.

**Yapma:**
- Vadeyi elle ileri atma.
- Kart verisine yazma.

**Kabul:**
- Test yeşil.
- `akis-olc` çıktısı ve Bugün ekranındaki tahmin seçilen dakikayla tutarlı.
- `kapi-hizli --kart K3P-A4 --yavas` (ders planına ya da görev kurucusuna dokunduğu için yavaş testler zorunlu) yeşil.

**Commit:** `K3P-A4: oturum seçilen dakikaya sığıyor; taşan tekrarlar unutulmaya en yakından sıralanıp yarına kalıyor`
<!-- /PROMPT K3P-A4 -->

<!-- PROMPT K3P-A5 -->
**K3P-A5 · Uyarlanır zorluk: akış bandını korumak (A-3, K-K)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-A5**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/AKIS.md` → §4 tamamı
- `app/core/quranLearn.js`:
  - `kaoGrade` (~205)
  - `currentTask` (~1782); `choiceCount` zaten destekleniyor
  - `kaoAnswer`
  - `kaoShouldAutoplay` (~1715)
- `kao3-premium/araclar/akis-olc.cjs` → 4. ölçüm

**Görev:**
1. **Kırmızı test.** `tests/kao/test_k3p_dda.js` yaz:
   - Art arda 2 yanlış → sıradaki görevin 3 şıkkı var ve sesi otomatik çalınıyor.
   - Art arda 3 yanlış → bir "yeniden tanış" paneli çıkıyor (anlam, örnek ve ses). Yeni bir ekran türü değil, mevcut panel yolu kullanılıyor.
   - Kayan başarı oranı `p` < %70 iken araya bilinen kolay bir kart giriyor. Kuyruğa ekleme yalnız `ui` içinde yapılıyor.
   - Kayan başarı oranı `p` > %92 iken (en az 8 görev sonra) şık sayısı 4'e dönüyor ve okunuş gizleniyor (yalnız sunum).
   - Kolaylaştırılmış görevde doğru cevap → `kaoGrade` sonucu **2**. Normal doğru cevapta not değişmiyor.
   - Kayan pencere (son 8 sonuç) yalnız `ui` içinde tutuluyor, `data` içine hiçbir şey yazılmıyor.
2. **Yeşil.** Bütün eşikler adlandırılmış sabitlerdir: `0.70`, `0.92`, `8`, `2`, `3`.

**Yapma:**
- FSRS parametrelerine dokunma.
- Uyarlanır zorluk durumunu kalıcı yazma.

**Kabul:**
- `akis-olc` 4. ölçüm: 2 yanlıştan sonra görevlerde 3 şık görünüyor.
- `test_kao_fsrs` ve `test_kao_queue` yeşil.
- `kapi-hizli --kart K3P-A5 --yavas` (ders planına ya da görev kurucusuna dokunduğu için yavaş testler zorunlu) yeşil.

**Commit:** `K3P-A5: uyarlanır zorluk — zorlanınca şık azalır ve ses yardım eder, akınca zorluk artar`
<!-- /PROMPT K3P-A5 -->

<!-- PROMPT K3P-A6 -->
**K3P-A6 · Bölümlü ilerleme ve sabit eylem bölgesi (D-2, D-3)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-A6**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/AKIS.md` → §5, D-2 ve D-3
- `app/core/quranLearnViews.js`:
  - `focusBar` (~45)
  - ders kartı görünümü (~520-539)
- `app/kao.css`:
  - `grep -n "kao-lesson-progress\|kao-task-progress\|kao-focusbar"`

**Görev:**
1. **Bölümlü ilerleme.** Ders ekranındaki ilerleme çubuğu 5 bölümlüdür: ① Hedef · ② Isınma · ③ Tanış-Sına · ④ Karışık · ⑤ Zirve.
   - Etkin bölüm kendi içinde dolar.
   - Erişilebilirlik: `role="progressbar"`, `aria-valuetext="Bölüm 3/5 · Tanış-Sına · 2/4"`.
   - Bölüm bilgisi K3P-A3'ün plan öğelerinden türetilir. Bölüm etiketi gerekiyorsa plan öğelerine eklenebilir; bu yalnız `ui` içinde yaşar.
2. **Sabit eylem bölgesi.**
   - Birincil eylem ve şıklar `.kao-body` içinde alta yapışık bir bölgede durur: `position: sticky; bottom`.
   - Alt boşluk `safe-area` dikkate alınarak hesaplanır.
   - Ekranlar arasında düğme konumu kaymaz.
   - Yalnız CSS ve sınıf adı değişir.
3. **Test.** `tests/kao/test_k3p_progress.js` yaz:
   - Her plan öğesinin hangi bölüme ait olduğu doğru eşleniyor.
   - `aria-valuetext` doğru üretiliyor.

   Testi envantere ekle.

**Kabul:**
- Test yeşil.
- `test_kao2_a11y` ve `test_kao2_design_contract` yeşil.
- Kontrast aracı (`kapi-hizli` içinde) yeşil.
- `kapi-hizli --kart K3P-A6` yeşil.

**Commit:** `K3P-A6: 5 bölümlü ders ilerlemesi ve başparmak bölgesinde sabit eylem alanı`
<!-- /PROMPT K3P-A6 -->

<!-- PROMPT K3P-A7 -->
**K3P-A7 · Görünür devam: "Kaldığın yerden" (A-5, K-N)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-A7**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/AKIS.md` → A-5 ve D-7
- `app/core/quranLearn.js`:
  - `kaoHomeHero` (~3312)
  - `kaoLessonResume` (~1892)
  - `kaoHubModel` (~3616)
- `kao3-premium/araclar/akis-olc.cjs` → 3. ölçüm

**Görev:**
1. **Kırmızı test.** `tests/kao/test_k3p_resume.js` yaz. Senaryo: Ders yarıda bırakılır, ardından sayfa yeniden yüklenmiş gibi `ui` sıfırlanır. Beklenen:
   - Bugün ekranındaki birincil eylem `Kaldığın yerden · Bölüm n/5` oluyor.
   - Hub kartının alt satırı "Kaldığın yerden devam et" diyor.
   - Derse dönünce ilerleme çubuğu kalınan bölümden dolu başlıyor.
2. **Yeşil.** Bilgi yalnız mevcut `path.lessons[id].resume` alanından okunur. Yeni veri alanı **yok**.

**Kabul:**
- Test yeşil.
- `akis-olc` 3. ölçüm etiketi "Kaldığın yerden" içeriyor.
- `test_kao2_today` ve `test_kao2_hub` yeşil.
- `kapi-hizli --kart K3P-A7` yeşil.

**Commit:** `K3P-A7: yarım kalan ders "Kaldığın yerden" olarak görünüyor, ilerleme korunuyor`
<!-- /PROMPT K3P-A7 -->

<!-- PROMPT K3P-A8 -->
**K3P-A8 · Edilgin ekran bütçesi (D-4); Dalga A sonu**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-A8**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula. Dalga sonu olduğu için tam kapı da koşulacak.

**Oku:**
- `kao3-premium/AKIS.md` → D-4
- `app/core/quranLearnViews.js` → ders kartları (intro, concept, goal; ~500-539)
- `kao3-premium/araclar/akis-olc.cjs`

**Görev:**
1. **Ölçüm aracı.** `akis-olc.cjs` dosyasını güncelle: sözcük sayımında `<details>` içeriği sayılmaz, yalnız `<summary>` sayılır. Bunun bir ilk görünüm ölçüsü olduğunu yoruma yaz.
2. **Kırmızı test.** Hedef, tanış ve kavram ekranlarının ilk görünümü ≤ 45 sözcük olmalı. Zirve (apply) bu kuraldan muaftır.
3. **Yeşil.**
   - İlk görünümde yalnız çekirdek kalır: kelime, ses, anlam, tek bir örnek.
   - Geri kalanı (akraba kelimeler, ayrıntılı açıklama, terimler) yerel `<details><summary>Daha fazla</summary>…</details>` içine taşınır.
   - Handler eklenmez. İçerik metni değişmez, yalnız sunum değişir.
4. **Erişilebilirlik.** `<summary>` ≥ 44 px olmalı ve klavyeyle açılabilmeli. Bunu `test_kao2_a11y` içine ekle.

**Kabul:**
- `akis-olc`: zirve dışındaki her edilgin ekran ≤ 45 sözcük; art arda edilgin dizi ≤ 1.
- `kapi-hizli --kart K3P-A8` yeşil.
- `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → "TÜM KAPILAR YEŞİL".
- LEDGER'a Dalga A özeti yazılır: AKIS §6 tablosu yeniden ölçülür.

**Commit:** `K3P-A8: tanış ve kavram ekranları kısa — ayrıntı "Daha fazla" altında (Dalga A tamam)`
<!-- /PROMPT K3P-A8 -->

---

# Dalga 1 — Görsel sistem

<!-- PROMPT K3P-06 -->
**K3P-06 · Tasarım tokenları**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-06**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/TASARIM.md` → §5 (materyal, renk görevleri, tipografi, hareket grameri)
- `tests/kao/test_kao2_design_contract.js` → kuralı tam olarak anla
- `app/kao.css` → 1. ve 2. satırlar (token blokları; uzun satırlar, `cut -c1-400` ile oku)

**Görev:**
1. **Tokenlar.** Açık ve koyu temada şu tokenları tanımla:
   - Materyal: `--kao-mat-ground`, `--kao-mat-card`, `--kao-mat-moment`
   - Gölge: `--kao-shadow-1`, `--kao-shadow-2`
   - Arapça boyutlar: `--kao-ar-hero`, `--kao-ar-body`, `--kao-ar-inline`
   - Hareket: `--kao-ease`, `--kao-dur-micro`, `--kao-dur-transition`, `--kao-dur-moment`

   Kurallar:
   - Renkler yalnız `--quran*` tokenlarından `color-mix` ile türetilir; yeni hex yok.
   - Süreler mevcut `--dur-*` tokenlarına bağlanır.
2. **Sözleşme.** Sözleşme testi bir izin listesi tutuyorsa yeni tokenları gerekçeleriyle oraya ekle. Testi gevşetme; yalnız genişlet.
3. **Kapsam.** Bu kartta tokenları **kullanan** bir kural değişikliği yok. Tokenları kullanmak K3P-07…10'un işi.

**Kabul:**
- `test_kao2_design_contract` yeşil.
- Kontrast aracı yeşil.
- `kapi-hizli --kart K3P-06` yeşil.

**Commit:** `K3P-06: KAO tasarım tokenları — materyal katmanları, Arapça ölçeği, hareket grameri`
<!-- /PROMPT K3P-06 -->

<!-- PROMPT K3P-07 -->
**K3P-07 · Kur'an yazı tipi: Scheherazade New alt kümesi (K-B)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-07**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/KARARLAR.md` → K-B
- `sw.js:1-60` (precache listesi)
- `tests/app/test_iip_22.js` → precache beklentileri
- `app/kao.css:20` (Arapça `font-family` kuralı)

**Görev:**
1. **İndirme.** Scheherazade New Regular ve OFL lisans dosyasını SIL'in resmî kaynağından (`github.com/silnrsi/font-scheherazade` sürümleri) indir.
   - Ağ izni gerekirse yalnız bu alan adını iste.
   - İndirilen arşivi kendi boş dizininde aç (BAGLAM §6, güvenilmeyen indirme).
   - Sürümü ve SHA-256 değerini LEDGER'a yaz.
   - İndirme yapılamazsa DUR.
2. **Kod noktası aracı.** `tools/kao/kao-font-subset.mjs` aracını yaz. Bu araç içerik modüllerinde geçen Arapça kod noktalarını sayar ve bir `unicodes` listesi üretir. Listeye her zaman şunlar eklenir:
   - Kur'an işaretleri: U+0610–061A, U+064B–065F, U+0670, U+06D6–06ED
   - noktalama
3. **Alt küme.** `pyftsubset` (fonttools) ile `woff2` üret ve `assets/kao/font/ScheherazadeNew-Regular.k3p.woff2` adıyla kaydet. Lisans dosyası aynı dizine gelir.
4. **CSS.**
   - `kao.css` içinde `@font-face` tanımla: `font-display: swap`, K-B'deki `unicode-range`, ağırlık 400.
   - `font-family` listesinin başına `"K3P Scheherazade"` ekle.
5. **Önbellek.** Dosyayı `sw.js` precache listesine mevcut `SW_VERSION` değeriyle ekle (pin yükseltilmez, BAGLAM §6). `test_iip_22` dosya listesini bekliyorsa onu da güncelle.

**Kabul:**
- Dosya ≤ 150 KiB.
- Araç içerikteki kod noktalarının %100'ünün kapsandığını raporluyor.
- `test_iip_22` ve `kapi-hizli --kart K3P-07` yeşil.

**Commit:** `K3P-07: Scheherazade New (OFL) Arapça alt kümesi — Kur'an işaretleri doğru çiziliyor`
<!-- /PROMPT K3P-07 -->

<!-- PROMPT K3P-08 -->
**K3P-08 · Arapça tipografi sistemi**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-08**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/TASARIM.md` → §5.3
- `grep -n 'lang="ar"\|kao-arabic\|-ar{\|-ar \|font-weight:700' app/kao.css | cut -c1-200`

**Görev:**
1. **Ölçek.** Her Arapça kuralı `--kao-ar-hero`, `--kao-ar-body` ya da `--kao-ar-inline` kademelerinden birine bağla.
2. **Kalınlık.** Arapça kurallardaki `font-weight:700` kaldırılır; Arapça hep 400 olur.
3. **Oran.** Arapça, yanındaki Latin metnin en az 1,3 katı büyüklükte olur.
4. **Dokunma hedefi.** Şıklarda en az 56 px.
5. **Test.** `tests/kao/test_k3p_typography.js`, `kao.css` üzerinde metin taraması yapar:
   - Arapça seçicilerde 700 = 0.
   - Arapça `font-size` değerleri yalnız `--kao-ar-*` tokenlarından geliyor.

   Testi envantere ekle.

**Kabul:**
- Test yeşil.
- `test_kao2_design_contract` ve kontrast aracı yeşil.
- `kapi-hizli --kart K3P-08` yeşil.

**Commit:** `K3P-08: Arapça üç kademeli ölçekte, sahte kalın kalktı, şıklar 56 px`
<!-- /PROMPT K3P-08 -->

<!-- PROMPT K3P-09 -->
**K3P-09 · Materyal hiyerarşisi ve renk görevleri**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-09**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/TASARIM.md` → §2 "Biçim" maddesi (altın kontrastı) ve §5.1–5.2
- `kao3-premium/ANALIZ.md` → T-1, T-2, T-6
- `tools/kao/kao-verify-contrast.mjs` → denetlenen renk çiftleri

**Görev:**
1. **Katmanlar.**
   - Zemin `--kao-mat-ground` olur.
   - Kartlar 1 px çizgi yerine `--kao-shadow-1` kullanır.
   - Hero kartı, ders sonu ve taş `kao-moment` sınıfını alır: lacivert degrade, 1 px altın cetvel, rumi SVG (opaklık ≤ .08, satır içi, `aria-hidden`).
2. **Altın.**
   - Doğru cevabın rengi yeşil yerine altın olur. Arka plan için `--kao-ok-bg` altına çevrilir, ✓ işareti mürekkep rengindedir.
   - Açık temada altın **metin rengi** olarak kullanılmaz; yalnız dolgu, çizgi ve gölge olarak.
3. **Yanlış.** Yalnız sıcak turuncu (`--quran-warn`) kullanılır.
4. **Kontrast.** Kontrast aracına yeni renk çiftlerini ekle. Hepsi ≥ 4,5:1 olmalı; büyük metin için ≥ 3:1.
5. **forced-colors.** Kurallar korunur. An kartı bu modda `Canvas` ve `CanvasText` ile çizilir.

**Yapma:**
- Handler ekleme.
- `onclick` sayısını değiştirme. HTML'de yalnız sınıf adı değişebilir.

**Kabul:**
- Kontrast aracı ve `test_kao2_a11y` yeşil.
- `kapi-hizli --kart K3P-09` yeşil.

**Commit:** `K3P-09: üç katmanlı materyal, an kartı ve altın yalnız kazanılmış şeylerde`
<!-- /PROMPT K3P-09 -->

<!-- PROMPT K3P-10 -->
**K3P-10 · Hareket grameri (Dalga 1 sonu)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-10**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula. Dalga sonu olduğu için tam kapı da koşulacak.

**Oku:**
- `kao3-premium/TASARIM.md` → §5.4
- `kao3-premium/AKIS.md` → D-5 ve D-6
- `app/core/quranLearn.js` → `kaoFx` (~1791)
- `app/core/mediaFx.js:527-545` → `SeyHaptics` yöntemleri: `tap`, `success`, `error`, …; `warning` **yok**

**Görev:**
1. **Hareket sınıfları.** Mikro, geçiş ve an sınıfları `--kao-dur-*` ve `--kao-ease` tokenlarıyla tanımlanır.
   - Görev geçişi: yeni soru 24 px yatay kayma ve opaklıkla gelir, en çok 240 ms.
   - Şık basışı: 120 ms küçülme.
   - ✓ işareti: yaylanarak belirir.
2. **Yanlış cevap.**
   - `kaoFx('wrong')` eklenir. Seçilen şık bir kez yatay sarsılır. `SeyHaptics.error` varsa yalnız o çalışır; ses çalmaz (D-6).
   - Bu fonksiyon `kaoAnswer` içindeki yanlış yolundan çağrılır.
3. **Hareket azaltma.** `prefers-reduced-motion` ya da `SeyFx.shouldAnimate() === false` olduğunda hiçbir animasyon çalışmaz. Bunu bir metin taraması testiyle ve `kaoFx` için bir birim testiyle doğrula.

**Kabul:**
- Testler yeşil.
- `kapi-hizli --kart K3P-10` yeşil.
- `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → "TÜM KAPILAR YEŞİL".

**Commit:** `K3P-10: hareket grameri — akıcı geçiş, nazik yanlış, hareket azaltmaya saygı (Dalga 1 tamam)`
<!-- /PROMPT K3P-10 -->

---

# Dalga 2 — Tezhip (imza deneyimi)

<!-- PROMPT K3P-11 -->
**K3P-11 · Tezhip sayfası bileşeni**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-11**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/TASARIM.md` → §0 ve §2 tamamı
- `app/core/quranLearn.js`:
  - `isSettled` (~2717)
  - `kaoKnownLemmaSet` (~2723)
  - `kaoCoverage` (~2729)
  - `surahWords` (~1260)
- `app/core/quranLearnViews.js` → `progressRing` ve `choice` (bileşen deseni için)

**Görev:**
1. **Görünüm.** Saf bir görünüm yaz:
   - Ad: `views.tezhipPage({title, lines, footer, interactive})`
   - `lines` biçimi: `[[{ar, state: 'known'|'learning'|'new', index}]]`
   - Arapça sağdan sola, `--kao-ar-body` boyutunda.
   - Rumi kenarlık satır içi SVG olarak, `aria-hidden`.
   - **Yaldız:**
     - Açık tema: mürekkep metin, altın tonlu zemin ve 2 px altın alt çizgi.
     - Koyu tema: altın metin.
     - `forced-colors` modunda `Highlight` alt çizgi.
   - Her kelime için `aria-label` verilir, ör. `"ٱلرَّحْمَـٰن, biliniyor"`.
   - `interactive: false` iken kelimeler düğme değildir.
2. **Model.** Modeli kuran fonksiyonu yaz:
   - Ad: `kaoTezhipModel(d, surahId)`
   - Kelime durumu:
     - **bilinen:** kartı `isSettled` (s ≥ 21)
     - **öğreniliyor:** kartı var
     - **yeni:** kartı yok
   - Yalnız türetir, hiçbir şey yazmaz.
3. **Test.** `tests/kao/test_k3p_tezhip.js`:
   - Üç durum doğru çiziliyor.
   - Metin kaçırılıyor (escape).
   - Erişilebilir ad var.
   - Fâtiha için yaldız oranı, aynı kelime kümesi üzerinden `kaoCoverage` ile tutarlı.

   Testi envantere ekle.

**Kabul:**
- Test yeşil.
- Çalışma zamanı boyutu ≤ 128 KiB; değeri LEDGER'a yaz.
- `kapi-hizli --kart K3P-11` yeşil.

**Commit:** `K3P-11: Tezhip sayfası — bilinen kelimeler Mushaf'ta yaldızlanıyor`
<!-- /PROMPT K3P-11 -->

<!-- PROMPT K3P-12 -->
**K3P-12 · Bugün ekranı yeniden (K-F)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-12**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/TASARIM.md` → §3.1
- `kao3-premium/KARARLAR.md` → K-F ve K-H
- `app/core/quranLearn.js`:
  - `kaoHomeHero`, `kaoCurrentUnit`, `kaoHomePath`, `kaoHomeLists`, `kaoHomeHTML` (~3312-3360)
  - `KAO_VIEW_TITLES` (~3650)
- `app/core/quranLearnViews.js` → `todayScreen`

**Görev:**
1. **Bugün ekranının yapısı.**
   - **An kartı:** Tezhip, `interactive:false`, mevcut ünitenin çapa sûresiyle. Kartın tamamına dokunmak okuyucuyu açar.
   - **Hedef eğimi cümlesi:** "3 kelime sonra Fâtiha tamam".
   - **Tek birincil eylem.**
   - **Haftalık hedef:** 5 günden kaçının tamamlandığı. `daily` verisinden türetilir; ceza dili yok.
   - **Üç kısayol:** Sûreler, Namazda ne diyorum, Kütüphane.
2. **Kütüphane görünümü.**
   - `KAO_VIEW_TITLES` içine `library` eklenir.
   - Mevcut `kaoSetView('library')` ile açılır; yeni handler yok.
   - İçerik: gramer notları, kök aileleri, Seviye 0, telaffuz stüdyosu, günün âyeti.
   - İlerleme ve Ayarlar gezinme çubuğundan erişilir.
3. **Test.** `tests/kao/test_k3p_today.js`:
   - `.kao-today-screen` içinde **en çok 5** etkileşimli öğe var.
   - Eski hedeflerin hepsine en çok 2 dokunuşla ulaşılıyor. Hedef başına tablo güdümlü yaz.
   - `test_kao2_today` yeni spesifikasyona göre güncellenir; gerekçeyi LEDGER'a yaz.

**Kabul:**
- Testler yeşil.
- `ekran-dok` → v-home düğme sayısı ≤ 5.
- `kapi-hizli --kart K3P-12` yeşil.

**Commit:** `K3P-12: Bugün = Tezhip + tek eylem + haftalık hedef; keşif Kütüphane'de`
<!-- /PROMPT K3P-12 -->

<!-- PROMPT K3P-13 -->
**K3P-13 · Ders âyetle açılır ve kapanır (K-G)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-13**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/TASARIM.md` → §3.2
- `kao3-premium/AKIS.md` → §3, ① ve ⑤
- `app/core/quranLearnFlow.js` → `lessonPlan` içindeki goal ve apply öğeleri (~173 ve ~220)
- `app/core/quranLearnViews.js` → ders kartları
- `app/core/quranLearn.js` → `kaoPlaySequence` (~2755) ve `kaoReaderPlayWords` (~3135)

**Görev:**
1. **Açılış (goal).** Hedef ekranı, dersin çapa âyetindeki hedef kelimeleri içeren satırı Tezhip olarak gösterir. Hedef kelimeler soluk altınla işaretlenir. Metin en çok 25 sözcüktür.
2. **Kapanış (zirve).**
   - Aynı satır sesle çalınır ve kelimeler sırayla yaldızlanır.
   - Hareket azaltma açıksa yaldız statik gösterilir.
   - Ses yoksa ya da ses kapalıysa yaldız sesle değil, ritimle (zamanlayıcıyla) ilerler.
3. **Test.** 109 ders taranır:
   - Her dersin goal ve apply öğeleri **aynı** âyet referansını taşıyor.
   - Hedef lemmaların hepsi o satırda var. Yoksa ders, istisna listesine **gerekçeyle** girer; liste yalnız küçülebilir.

**Kabul:**
- Test yeşil.
- `test_kao2_lesson_coherence` yeşil.
- `kapi-hizli --kart K3P-13` yeşil.

**Commit:** `K3P-13: her ders hedef âyetle açılıp o âyetin yaldızlanarak okunmasıyla kapanıyor`
<!-- /PROMPT K3P-13 -->

<!-- PROMPT K3P-14 -->
**K3P-14 · Ders sonu anı ve KAO konfetisi (Dalga 2 sonu)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-14**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula. Dalga sonu olduğu için tam kapı da koşulacak.

**Oku:**
- `kao3-premium/TASARIM.md` → §3.2 "Okuma (zirve)" satırı
- `kao3-premium/ANALIZ.md` → T-7
- `app/core/quranLearnViews.js` → özet bölümü (~300-320)
- `app/core/helpers.js` → `confetti`
- `app/core/quranLearn.js` → `kaoLessonMilestoneConfetti` (~1792)

**Görev:**
1. **Özet.** İlk kez yaldızlanan kelimeler mini bir Tezhip şeridinde gösterilir. Kapsam artışı `+%x` olarak yazılır; bu değer mevcut `data-countup` deseniyle canlandırılır.
2. **Konfeti.** `SeymaHelpers.confetti(colors?)` isteğe bağlı bir renk dizisi kabul eder. Parametre verilmezse bugünkü davranış aynen sürer. KAO, lacivert ve altın tonlarını bu parametreyle geçer; tonlar CSS tokenlarından `getComputedStyle` ile okunur, yoksa yedek değerler kullanılır.
3. **Süre ve hareket.** An en çok 1,2 sn sürer. Hareket azaltma açıksa statik gösterilir.

**Kabul:**
- Özet testleri yeşil.
- `confetti()` parametresiz çağrı testi bugünkü renkleri koruyor.
- `kapi-hizli --kart K3P-14` yeşil.
- `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` yeşil.

**Commit:** `K3P-14: ders sonu anı — yaldızlanan kelimeler, kapsam artışı, lacivert-altın konfeti (Dalga 2 tamam)`
<!-- /PROMPT K3P-14 -->

---

# Dalga 3 — Öğrenme motoru

<!-- PROMPT K3P-16 -->
**K3P-16 · Hatırlama merdiveni seçici ve kart düzeyinde deney ataması (K-I, H3)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-16**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/TASARIM.md` → §4
- `kao3-premium/KARARLAR.md` → §6 (yöntem ve H3)
- `app/core/quranLearn.js`:
  - `cardState` (~127)
  - `hashSeed`, `xorshift`, `seededRank` (~257-267)
  - `kaoBuildTask` (~355)
- `app/core/quranLearnFlow.js` → dışa açılan API (dosyanın sonu)

**Görev:**
1. **Saf fonksiyonlar.** Akış modülüne iki fonksiyon ekle:
   - `ladderRung(card)`: `'R1'…'R4'` döndürür. Eşikler TASARIM §4'teki tablodadır. `relearning` durumundaki kart bir basamak aşağı iner.
   - `ladderArm(cardId)`: `'A'` ya da `'B'` döndürür. Deterministiktir: `seededRank('k3p-ladder', cardId)` değerinin teklik/çiftliğine bakar. Aynı hash algoritması kullanılır ve **kopyalanmaz**: tek kaynak tutulur. Dışa açmak gerekiyorsa bu `window.SeymaQuranLearn` üzerinden yapılır, `App` üzerinden değil.
2. **Bağlama.**
   - `kaoBuildTask` basamağa göre görev biçimini seçer.
   - B kolundaki kartlar her zaman R1'de kalır.
   - R3 ve R4 henüz yok (K3P-17 ve K3P-18 ekleyecek). O zamana kadar R2'ye düşer.
3. **Deney raporu.** `deney-rapor.cjs` H3 bölümünü etkinleştir: A ve B kolları için ortalama `s` ve unutma oranını hesapla.
4. **Test.** `tests/kao/test_k3p_ladder.js`:
   - Tablo güdümlü basamak testleri.
   - Kol ataması deterministik ve yaklaşık %50 (1.000 kimlikte %45–55).
   - B kolu hep R1.
   - Kart verisi hiç yazılmıyor.

**Kabul:**
- Testler yeşil.
- `cift-sik` görev sayımına göre tanıma payı düşüyor. Değeri LEDGER'a yaz.
- `kapi-hizli --kart K3P-16 --yavas` (ders planına ya da görev kurucusuna dokunduğu için yavaş testler zorunlu) yeşil.

**Commit:** `K3P-16: hatırlama merdiveni ve kart düzeyinde A/B ataması (veri yazmadan)`
<!-- /PROMPT K3P-16 -->

<!-- PROMPT K3P-17 -->
**K3P-17 · R3: Harflerden kur**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-17**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/TASARIM.md` → §4, R3 satırı ve "Çeldirici kalitesi"
- `app/core/quranLearn.js`:
  - `kaoTaskHTML` içindeki order bloğu
  - `kaoAnswer` içindeki order mantığı
  - `KAO_S0_LETTERS` (~3360)
  - `phonicsSource` (~2468)

**Görev:**
1. **Görev türü.** `kind: 'build'` görevi:
   - Kelimenin harekesiz harfleri ayrı formlarda çip olarak gösterilir.
   - Biçimce yakın 2 çeldirici harf eklenir. Aynı nokta ailesinden seçilir; S0 şekil aileleri kullanılır.
   - Kullanıcı harfleri sırayla seçer. Mevcut `App.kaoAnswer` çoklu seçim yolu ve `kaoOrderDraft` kullanılır.
   - Seçilen harfler birleşik yazılır.
   - Geri bildirimde kelimenin harekeli hâli gösterilir.
2. **Uygunluk.** Yalnız 2–6 harfli ve doğrulanmış (`verified`) lemmalar bu türe girer.
3. **Notlama.** Mevcut `kaoGrade` kullanılır.
4. **Test.** `tests/kao/test_k3p_build.js`:
   - Çeldirici harfler hedef kelimenin harflerinden farklı ve aynı aileden.
   - Doğru sıra doğru sayılıyor.
   - Yanlış sıra yanlış sayılıyor.
   - Erişilebilirlik: her çipte harfin adı var (`aria-label`).

**Yapma:**
- Yeni `App.*` ekleme.

**Kabul:**
- Test yeşil.
- `cift-sik` görev sayımında `build` türü görünüyor.
- `kapi-hizli --kart K3P-17 --yavas` (ders planına ya da görev kurucusuna dokunduğu için yavaş testler zorunlu) yeşil.

**Commit:** `K3P-17: "harflerden kur" görevi — kelimeyi tanımak yerine üretmek`
<!-- /PROMPT K3P-17 -->

<!-- PROMPT K3P-18 -->
**K3P-18 · R4: Âyette boşluk**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-18**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/TASARIM.md` → §4, R4 satırı
- `app/core/quranLearn.js`:
  - `kaoVerifiedAyahPronunciation` (~1017)
  - `kaoPickDistractors` (K3P-01 sonrası hâli)

**Görev:**
1. **Görev türü.** `kind: 'cloze'` görevi:
   - Lemmanın **doğrulanmış** bir örnek âyetinde hedef kelime boşluk olarak gösterilir.
   - Âyetin Türkçe anlamı görünür.
   - Şıklar aynı türden ve farklı kökten seçilir; K3P-01 tekilleştirmesi kullanılır.
   - Âyet okunuşu K3P-04 motorundan gelir.
2. **Uygunluk.** Doğrulanmış örneği olmayan lemma R4'e çıkmaz, R3'te kalır.
3. **Test.** `tests/kao/test_k3p_cloze.js`:
   - Boşluk doğru konumda.
   - Şıklar tekil.
   - Doğrulanmamış örnek hiç kullanılmıyor.

**Kabul:**
- Test yeşil.
- `cift-sik` görev sayımında tanıma payı ≤ %60. Ölçümü yerleşik kullanıcı ve s ≥ 30 kart karışımıyla yap; yöntemi LEDGER'a yaz.
- `kapi-hizli --kart K3P-18 --yavas` (ders planına ya da görev kurucusuna dokunduğu için yavaş testler zorunlu) yeşil.

**Commit:** `K3P-18: "âyette boşluk" görevi — kelimeyi gerçek bağlamında hatırlamak`
<!-- /PROMPT K3P-18 -->

<!-- PROMPT K3P-19 -->
**K3P-19 · Okunuşun soldurulması (P4, H4)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-19**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/KARARLAR.md` → K-A, son madde
- `app/core/quranLearn.js`:
  - `kaoArabicPairHTML` (~1724)
  - `kaoSettingsOf` (~521)
  - okunuş ayarı (`settings.translit`)

**Görev:**
1. **Soldurma.**
   - s ≥ 21 olan kartların görevlerinde okunuş, yerel bir `<details><summary>Okunuş</summary>…</details>` içine alınır; varsayılan olarak kapalıdır. Handler eklenmez.
   - `settings.translit === false` ise okunuş bugünkü gibi hiç gösterilmez.
   - Okunuşu açmak notu etkilemez.
2. **Ölçüm hazırlığı.** H4 ölçüsünü `deney-rapor` içinde "s ≥ 21 doğruluğu" olarak hazırla.
3. **Test.**
   - s = 20 ve s = 21 sınırında doğru davranış.
   - Ayar kapalıyken okunuş hiç yok.

**Kabul:**
- Test yeşil.
- `test_kao_pronunciation_contract` yeşil. Okunuş HTML'de duruyor, yalnız katlı.
- `kapi-hizli --kart K3P-19` yeşil.

**Commit:** `K3P-19: kalıcılaşan kelimede okunuş katlanıyor — destek zamanla çekiliyor`
<!-- /PROMPT K3P-19 -->

<!-- PROMPT K3P-20 -->
**K3P-20 · Kelime dizmede sürükleyip bırakma**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-20**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `app/core/quranLearn.js` → `kaoTaskHTML` order ve build blokları
- `tests/app/test_fx2_*.js` → `onclick` ve `App` yüzeyi sayımlarının hangi dosyaları taradığı
- `kao3-premium/BAGLAM-YONETIMI.md` → §5

**Görev:**
1. **Sürükleme.**
   - Çipler pointer olaylarıyla görsel olarak sürüklenir: `transform` ve pointer capture.
   - Sürükleme mantığı `window.SeymaQuranLearn.kaoDrag(...)` içinde yaşar; `App` değildir.
   - Hedef bölgeye bırakılan çip için mevcut `App.kaoAnswer(taskId, choiceId)` çağrılır.
   - Dokunarak seçme ve klavye yolu aynen kalır.
2. **Pin denetimi.** Değişiklikten önce ve sonra `tests/app/test_fx2_*` sayımlarını karşılaştır. Herhangi bir pin kayıyorsa DUR (K-D).
3. **Hareket azaltma.** Açıksa sürükleme animasyonsuz çalışır.
4. **Test.** `tests/kao/test_k3p_drag.js`: bırakma noktası hesabı saf bir fonksiyondur ve birim testlidir.

**Kabul:**
- Test yeşil.
- `test_kao2_a11y` yeşil.
- fx2 pinleri değişmedi.
- `kapi-hizli --kart K3P-20` yeşil.

**Commit:** `K3P-20: kelime ve harf dizmede sürükleyip bırakma; dokunma ve klavye yolu aynı`
<!-- /PROMPT K3P-20 -->

<!-- PROMPT K3P-21 -->
**K3P-21 · Görünür ses kontrolleri (Dalga 3 sonu)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-21**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula. Dalga sonu olduğu için tam kapı da koşulacak.

**Oku:**
- `kao3-premium/ANALIZ.md` → §4, ses düğmesi maddesi
- `app/core/quranLearn.js:1745-1760` (ses bloğu)

**Görev:**
1. **İki düğme.**
   - Uzun basma (350 ms) davranışı ve satır içi ok fonksiyonu kaldırılır.
   - Yerine iki görünür düğme gelir: **◖ Yavaş** → `App.kaoPlay(id,'measured')`, **◗ Doğal** → `App.kaoPlay(id,'flowing')`.
   - Her biri ≥ 44 px ve kendi `aria-label`'ını taşır.
2. **Test.**
   - Görev HTML'inde `onpointerdown` yok.
   - İki düğme var.
   - `App.kao*` sayısı hâlâ 45.

**Kabul:**
- Test yeşil.
- `kapi-hizli --kart K3P-21` yeşil.
- `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` yeşil.

**Commit:** `K3P-21: yavaş/doğal ses için iki görünür düğme — gizli uzun basma kalktı (Dalga 3 tamam)`
<!-- /PROMPT K3P-21 -->

---

# Dalga 4 — Ödül, okuyucu, ilerleme

<!-- PROMPT K3P-22 -->
**K3P-22 · Âyet merdiveni (K-E)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-22**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/KARARLAR.md` → K-E
- `app/core/quranLearn.js`:
  - `kaoAyahHTML` (~2794)
  - `kaoNearestAyah` (~2751)
  - `kaoPickAyah` (~2740)

**Görev:**
1. **Boş durum yerine merdiven.** "Henüz hazır âyet yok" ekranı kaldırılır. Yerine:
   - En yakın âyet, Tezhip olarak.
   - "N kelime kaldı" cümlesi.
   - Eksik kelimelerin her biri için mevcut `App.kaoNav('word', id)` bağlantısı.
2. **Eşik.** %95 eşiği değişmez.
3. **Test.** 20 kelime bilen kullanıcı boş durum görmüyor ve eksik kelime listesi doğru.

**Kabul:**
- Test yeşil.
- `ekran-dok` → `v-ayah` dosyasında "Henüz hazır âyet yok" geçmiyor.
- `kapi-hizli --kart K3P-22` yeşil.

**Commit:** `K3P-22: günün âyeti boş kalmıyor — en yakın âyet ve eksik kelimeleri gösteriliyor`
<!-- /PROMPT K3P-22 -->

<!-- PROMPT K3P-23 -->
**K3P-23 · Okuyucu: senkron yaldız ve "Kartlarıma ekle"**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-23**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/TASARIM.md` → §3.4
- `app/core/quranLearn.js`:
  - `kaoReader` (~3162)
  - `kaoRevealWord` (~3218)
  - `kaoReaderHTML` (~3239)
  - `kaoLessonMarkIntro` (~1905): kart oluşturma deseni

**Görev:**
1. **Senkron yaldız.** Çalan kelime (`aria-current`) altın halkayla gösterilir; yalnız CSS. Hareket azaltma açıksa yalnız renk değişir.
2. **Kartlarıma ekle.**
   - Açılan anlam balonunda "Kartlarıma ekle" düğmesi olur. Düğme `App.kaoReader('add', index)` çağırır; bu, mevcut çoğaltıcıya eklenen yeni bir eylemdir.
   - Kart, `kaoLessonMarkIntro` ile aynı şemayla oluşturulur: `introducedAt` ve `state: 'new'`.
   - Lemma zaten varsa düğme "Kartlarında var" olur ve devre dışı kalır.
   - Doğrulanmamış lemma eklenemez.
3. **Test.**
   - Ekleme yeni alan yaratmıyor; şema eski kartlarla aynı.
   - İdempotent: iki kez eklemek tek kart üretiyor.
   - `App.kao*` sayısı 45.

**Kabul:**
- Test yeşil.
- `test_kao2_reader` ve `test_kao2_migration` yeşil.
- `kapi-hizli --kart K3P-23` yeşil.

**Commit:** `K3P-23: okuyucuda çalan kelime yaldızlanıyor; bilinmeyen kelime tek dokunuşla kartlara`
<!-- /PROMPT K3P-23 -->

<!-- PROMPT K3P-24 -->
**K3P-24 · İlerleme ekranı (K-H)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-24**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/TASARIM.md` → §3.5
- `kao3-premium/ANALIZ.md` → E-5
- `app/core/quranLearn.js`:
  - `kaoProgressModel` (~3025)
  - `kaoStatsHTML` (~3044)
  - `kaoStudyStreak` (~2894)

**Görev:**
1. **Üstteki üç ölçü.**
   - Kur'an kapsamı (%).
   - Yaldızlı sûreler, ×/20. Bir sûre, bütün lemmaları biliniyorsa yaldızlı sayılır.
   - Bu hafta, gün/5.
2. **Tezhip küçük resimleri.** Kısa sûreler küçük resim olarak gösterilir; K3P-11 bileşeninin küçük boyu.
3. **Ayrıntılar.** Kalibrasyon tablosu ve gece tekrarı karşılaştırması `<details>Ayrıntılar</details>` altına iner. Veri yoksa bu bölüm hiç çizilmez.
4. **Ceza dili yok.** "Seriyi kaybettin" gibi ifadeler kaldırılır. Bunu bir metin taramasıyla test et.
5. **Test.**
   - Boş veride kalibrasyon tablosu yok.
   - Haftalık sayım doğru.
   - `test_kao2_progress` güncellenir; gerekçeyi LEDGER'a yaz.

**Kabul:**
- Testler yeşil.
- `kapi-hizli --kart K3P-24` yeşil.

**Commit:** `K3P-24: İlerleme — üç sade ölçü, yaldızlı sûreler, ayrıntılar katlı, suçluluk dili yok`
<!-- /PROMPT K3P-24 -->

<!-- PROMPT K3P-25 -->
**K3P-25 · Mevcut kullanıcıya hızlı geçiş seçimi (K-C; Dalga 4 sonu)**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-25**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula. Dalga sonu olduğu için tam kapı da koşulacak.

**Oku:**
- `kao3-premium/KARARLAR.md` → K-C, "Varsayılanlar" maddesi
- `app/core/quranLearn.js`:
  - `KAO_WHATS_NEW` (~3360)
  - `kaoOpen` (~3768)
  - `normalizeOnboarding` (~3921)

**Karar noktası (başlamadan önce kullanıcıya tek soru sor):** Notun bir kez gösterildiğini kalıcı olarak hatırlamak bir **şema genişlemesi** gerektirir: `quranLearn.onboarding.k3pNoticeAt` alanı ve onun `normalizeOnboarding` / `migrate` desteği. Kullanıcıya iki seçenek sun:
- **(a) Şemayı genişlet.** Geriye uyumlu: alan yoksa `null` sayılır. Not bir kez gösterilir.
- **(b) Şemaya dokunma.** Yalnız ders özetinde, `autoAdvance === false` iken küçük ve ikincil bir "Doğru cevaplarda hızlı geç · Aç" satırı gösterilir. Satır oturum içinde kapatılabilir.

Yanıt gelmezse **(b)**'yi uygula.

**Görev:**
1. Seçilen yolu uygula.
2. Ayar hiçbir koşulda sessizce değişmez; testle kanıtla.
3. "Aç" eylemi mevcut `App.kaoToggleAutoAdvance`'ı çağırır.
4. (a) seçildiyse ek testler:
   - `test_kao2_migration`: alan yokken `null`.
   - İdempotent normalizasyon.
   - Panel özeti etkilenmiyor.

**Kabul:**
- Testler yeşil.
- `kapi-hizli --kart K3P-25` yeşil.
- `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` yeşil.

**Commit:** `K3P-25: mevcut kullanıcıya hızlı geçiş seçimi — ayar sessizce değişmiyor (Dalga 4 tamam)`
<!-- /PROMPT K3P-25 -->

---

# Dalga 5 — Kapanış

<!-- PROMPT K3P-26 -->
**K3P-26 · Son görsel QA, ölçüm ve kapanış belgesi 📷**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-26**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

Bu prompt'u vermem, kontrollü yerel görsel QA istisnası kapsamında ekran görüntüsü alınmasına açık izin anlamına gelir.

**Oku:**
- `kao3-premium/ANALIZ.md` → §7
- `kao3-premium/AKIS.md` → §6
- `K3P-STATE.json` → `baseline` ve `targets`
- `tools/kapi/gorsel-qa/README.md`

**Görev:**
1. **Ekran görüntüleri.**
   - Önce Guard 1 testi.
   - Sonra `shoot-modal.mjs` ile 320, 390 ve 460 px genişlikte, açık ve koyu temada çekim. Tarama için `KAO_QA_SCAN=1` kullan.
   - Kontak sayfaları `kao3-premium/kanit/sonraki/` altına.
   - K3P-00'daki görüntülerle yan yana karşılaştırma sayfası oluştur.
2. **Yeniden ölçüm.** Tüm ölçü araçları ve perf tekrar çalıştırılır. ANALIZ §7 ve AKIS §6 tablolarına "Sonra" sütunu eklenir. Tutmayan hedef varsa açıkça yazılır, gizlenmez.
3. **Kapanış belgesi.** `kao3-premium/KAPANIS.md`. İçerik:
   - Hedef karşılama tablosu.
   - Kanıt düzeyleri ayrı ayrı: kaynak/test, görsel QA, cihaz (bekliyor).
   - Hipotez takvimi: H2–H9 için 14. ve 30. gün `deney-rapor` çalıştırma talimatı.
   - Açık konular: L2 okunuş incelemesi, cihaz kabulü.

**Kabul:**
- `KAO_QA_SCAN` taraması taşma göstermiyor.
- `kapi-hizli --kart K3P-26` ve tam kapı yeşil.

**Commit:** `K3P-26: son görsel QA, önce/sonra ölçüm ve kapanış belgesi`
<!-- /PROMPT K3P-26 -->

<!-- PROMPT K3P-27 -->
**K3P-27 · Yayın 🚀**

Sen K3P programını uygulayan ajansın. Önce `kao3-premium/BAGLAM-YONETIMI.md` §1 açılış protokolünü uygula. Bu prompt'un kimliği **K3P-27**. Bitirirken §3'ü, bağlam yetmezse §4'ü uygula.

**Oku:**
- `kao3-premium/KAPANIS.md`
- CLAUDE.md → "Git / deploy" ve "DATA SAFETY"
- `sw.js:1-60`
- `tests/app/test_iip_22.js:110-190`

**Görev:**
1. **Pin aracı.** `kao3-premium/araclar/pin-yukselt.mjs <yeniSurum>` aracını yaz. Araç:
   - `git diff main --name-only` ile değişen varlıkları bulur.
   - Bu varlıkların `?v=` değerini `index.html` ve `sw.js` içinde yeni sürüme çeker.
   - `SW_VERSION`, `SW_OFFLINE_VERSION`, `test_iip_22` sürüm sabitini ve `sw.js` kayıt satırını günceller.
   - `--dene` kipinde yalnız farkı gösterir.

   Önce `--dene` ile çalıştır, sonra uygula.
2. **Tam kapı.** `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → "TÜM KAPILAR YEŞİL". Pin senkronu dahil.
3. **Onay iste.** Kullanıcıya açıkça sor: "kao3-premium → main birleştirip GitHub Pages'e yayınlayayım mı?" Kapanış özetini de göster. **Açık "evet" gelmeden** push, merge ya da tag yapma.
4. **Onay gelirse:**
   1. `main` üzerine fast-forward birleştirme.
   2. `git push origin main`.
   3. `gh run watch` ile Pages koşusunu izle.
   4. Canlı `index.html` dosyasında yeni pini **yalnız GET** ile doğrula (`curl`). Uygulamayı tarayıcıda açma.
5. **Kapanış.** STATE'te `status` alanı `completed`, `releaseApproval` alanı `APPROVED-<tarih>` olur.
6. **Kullanıcıya hatırlatma.** Cihazda yapılacaklar:
   - Uygulamayı aç ve açılışta yeni sürümün geldiğini doğrula.
   - Bir ders yap; Tezhip, ses ve his.
   - "Verileri sıfırla"ya dokunma.
   - 14. ve 30. günde `deney-rapor` çalıştır.

**Kabul:**
- Pages koşusu başarılı.
- Canlı pin doğrulandı.
- `senkron` → "program tamam".

**Commit:** `K3P-27: yayın pini — K3P canlıda`
<!-- /PROMPT K3P-27 -->
