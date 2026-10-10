# K3P · Arapça modalı sorun analizi (2026-10-10)

Kapsam: Kur'an Arapçası modalı. İncelenen dosyalar:

- `app/core/quranLearn.js` (4.137 satır)
- `app/core/quranLearnViews.js`
- `app/core/quranLearnFlow.js`
- `app/kao.css`
- içerik modülleri
- `tools/kao-lexicon-build.mjs`

**Kanıt düzeyi:** Buradaki her bulgu **kaynak koddan ve headless (node:vm) ölçümden** gelir. Tarayıcı açılmadı, ekran görüntüsü alınmadı, cihaza bakılmadı. "Cihazda doğrulanacak" diye işaretli bulgular yalnız koddan çıkarılmıştır.

Yeniden üretim (hepsi salt-okur ve ağsız):

```bash
node kao3-premium/araclar/cift-sik.cjs              # B-01 çift şık       → bulgu varsa exit 1
node kao3-premium/araclar/okunus-denetim.cjs        # B-03 okunuş         → bulgu varsa exit 1
node kao3-premium/araclar/ekran-dok.cjs "$TMPDIR/kao3-ekran"   # 27 ekranın HTML'i + yoğunluk tablosu
```

---

## 1. Doğruluk hataları (önce güven)

### B-01 · YÜKSEK — Aynı şık iki kez çıkıyor

- **Nerede:** `kaoPickDistractors` — [quranLearn.js:340](../app/core/quranLearn.js#L340)
- **Ölçüm:** Sentetik bir yerleşik kullanıcı kuruldu: 20 kelime, her biri iki yönde review durumunda, s=40. Bu kullanıcıyla 109 ders oynatıldı. **1.127 görevin 631'inde (%56) aynı etiket iki kez çıkıyor.** Yeni kullanıcıda bu oran 1.087 görevde 1.
- **Örnek:** "terbiye edip yöneten Rab → Arapçayı seç" sorusunun şıkları şunlar: `مَأْوَىٰ · أَرْض · أَرْض · رَبّ`
- **Neden:** Çeldirici havuzu kart kimlikleri üzerinden dolaşıyor. Her kelimenin iki kartı var (`w:X:ar>tr` ve `w:X:tr>ar`). Bu iki kart, aynı kelimeden geldikleri halde ikisi de seçilebiliyor. Sözlük yedek yolunda etiket tekilleştirmesi (`usedLabels` + `overlaps`) var, birincil yolda yok.
- **Etki:**
  - Fiilen 3 değil 2 çeldirici kalıyor, soru kolaylaşıyor.
  - FSRS notu şişiyor.
  - Uygulama özensiz görünüyor.
  - Bu durum kartları olgunlaşmış her gerçek kullanıcıda ortaya çıkar.
- **Düzeltme:**
  1. Havuzu lemma kimliğine göre tekilleştir.
  2. Yedek yolun `overlaps` süzgecini ortak bir yardımcıya çıkar ve iki yolda da kullan.
  3. Kabul ölçütü: `cift-sik.cjs` sıfır çıktıyla geçer.

### B-02 · ORTA — Doğru cevapta "Aslında biliyordum" ve çift "Doğru"

- **Nerede:**
  - [quranLearn.js:1777](../app/core/quranLearn.js#L1777): eylemler koşulsuz ekleniyor.
  - [quranLearn.js:1849-1852](../app/core/quranLearn.js#L1849-L1852): geri bildirim gövdesi.
- **Doğru cevaptan sonra görünen metin:** `Doğru · Doğru · رَبّ · Türkçedeki akrabası: Rab · Aslında biliyordum · Devam`
- **Düzeltme:**
  - Doğru cevapta geri alma eylemini gizle. Alternatifi, notu düşüren bir "Tahmin ettim" eylemi; bu bir ürün kararı.
  - Gövdedeki tekrar eden "Doğru" satırını kaldır.

### B-03 · YÜKSEK (elit hedef için) — Latin okunuş yanlış öğretiyor

- **Nerede:** `transliterate` ve `wordTranslitTr` fonksiyonları — [tools/kao-lexicon-build.mjs:1067](../tools/kao-lexicon-build.mjs#L1067), [:1142](../tools/kao-lexicon-build.mjs#L1142). Bunlar `app/content/quranLexiconV1.js` dosyasını üretiyor.
- **Ölçüm:**
  - **Vasl elifi:** Harf-i tarif dışında vasl elifiyle başlayan 18 lemma 'a' ile okunuyor. Örnekler: ٱبْن=`abn` (doğrusu ibn), ٱسْم=`asm` (ism), ٱسْتَغْفَرَ=`astagfara` (istağfera), ٱفْتَرَىٰ=`aftarâ`, ٱهْتَدَىٰ=`ahtadâ`. Kelime ekranının başlığında da bu yüzden "asm" yazıyor.
  - **Güneş harfi idgâmı:** 274 örnek âyet okunuşunda yazılmamış. Örnekler: `bi-smi allahi al-rahmâni al-rahîmi`, `al-salâta`, `al-dâllîna`.
  - **Kelimeler arası vasl:** Hiç uygulanmıyor. `bi-smi allahi` yazıyor, okunuşu *bismillâhi*.
- **Etki:** Öğrenci yanlış telaffuzu ezberliyor. Ekrandaki okunuş, dinletilen ses kaydıyla da çelişiyor.
- **Düzeltme:** Okunuş motoruna üç kural eklenir:
  1. Vasl elifi: `ٱل` ise `a`/`e`, değilse `i`.
  2. Güneş harfinde idgâm.
  3. Cümle içinde kelimeler arası vasl.

  Değişiklik yalnız araçta yapılır. Donmuş içerik `kao-content-freeze.mjs` ile yeniden üretilir, elle düzenlenmez. Hangi okunuş geleneğinin kullanılacağı kullanıcı kararıdır (README, karar K-A).

### B-04 · ORTA (cihazda doğrulanacak) — Kur'an yazı tipi hiç yüklenmiyor

- **Nerede:** [kao.css:20](../app/kao.css#L20) şu kuralı içeriyor: `.kao-dialog [lang="ar"]{font-family:"Noto Naskh Arabic","Amiri","Scheherazade New","Times New Roman",serif}`. Depoda hiç `@font-face` tanımı yok.
- **Çıkarım:**
  - Bu yazı tiplerinin hiçbiri iOS'ta hazır gelmez. Metin, sistemin yedek Arapça yazı tipiyle çizilir.
  - O yedek yazı tipinde Osmanî imlâ işaretleri (`ٱ`, `ٰ`, `۟`, `ۧ`) ve hareke yerleşimi zayıftır.
  - 10'dan fazla kural Arapçaya `font-weight:700` veriyor. Yazı tipinin kalın kesimi olmadığı için tarayıcı sahte kalın üretir.
- **Düzeltme (K3-06/07):**
  - Açık lisanslı bir Kur'an yazı tipinin yalnız Arapça alt kümesi `woff2` olarak depoya eklenir.
  - `font-display:swap` kullanılır ve dosya `sw.js` önbelleğine alınır.
  - Sahte kalın kaldırılır.

### B-05 · DÜŞÜK — Ders özetinde başlık tekrarı

Özette `Ders tamamlandı` ve hemen ardından `Besmele tamamlandı` geliyor: [quranLearnViews.js:316](../app/core/quranLearnViews.js#L316). Öneri: Üst satırda "Ders tamamlandı" kalsın, başlıkta yalnız ders adı yazsın.

### B-06 · ŞÜPHELİ (doğrulanacak) — Süre tahmini "~1 dk"

- **Nerede:** [quranLearnFlow.js:366](../app/core/quranLearnFlow.js#L366): `perTask = answered>0 ? ms/answered/60000 : MIN_PER_TASK`
- **Gözlem:** Headless ortamda, `ms` değeri çok küçük olan günlerde "20 tekrar + 4 yeni" için "~1 dk" yazdı. Cihaz verisinde görülmedi.
- **Öneri:**
  - Görev başına bir taban süre koy (ör. ≥6 sn).
  - `ms` alanı yoksa `MIN_PER_TASK` kullan.

---

## 2. Etkililik (öğrenme bilimi)

| # | Gözlem | Kanıt | Sonuç |
| --- | --- | --- | --- |
| E-1 | Görevlerin **%93'ü 4 şıklı tanıma** sorusu | 109 derste: word 1.030, grammar 61, meaning 20, order 16 | Hatırlama ve üretim görevi yok (harften kurma, sesten yazma). Tanıma kolay olduğu için kalıcılık düşük kalır. |
| E-2 | Her doğru cevap tam bir geri bildirim kartı açıyor ve "Devam"a basılmasını bekliyor | `autoAdvance:false` varsayılanı — [quranLearn.js:3812](../app/core/quranLearn.js#L3812). Ölçüm (`dokunus-olc.cjs`): bir ders 69 dokunuş tutuyor; bunların 30'u bilgi taşımayan "Devam". | Otomatik geçiş açıkken 39 dokunuş (%43 daha az). Akış bölünüyor. |
| E-3 | Günün âyeti için %95 eşiği var | `KAO_AYAH_THRESHOLD=0.95` — [quranLearn.js:2715](../app/core/quranLearn.js#L2715). 20 kelime bilen kullanıcı "Henüz hazır âyet yok" görüyor. | En güçlü ödül (gerçek bir âyeti anlamak) haftalarca kapalı kalıyor. |
| E-4 | Yanlış cevapta mikro-geri bildirim yok | `kaoFx` yalnız `correct`, `milestone` ve `enter` için çağrılıyor | Doğru ile yanlış arasındaki duyusal fark zayıf. |
| E-5 | İlerleme ekranı mühendislik metriği gösteriyor | Veri yokken 10 satırlık kalibrasyon tablosu (`0.1–0.2 · 0 — —`) ve gece tekrarı karşılaştırması çıkıyor | Kullanıcı "ne kadar ilerledim?" sorusunun cevabını aşağıda aramak zorunda kalıyor. |

## 3. Görsel tasarım

| # | Gözlem | Kanıt |
| --- | --- | --- |
| T-1 | Hiyerarşi düz. Hero, yol kartı, geri bildirim, şık ve hub hepsi aynı yüzeyi ve aynı 1 px çizgiyi kullanıyor. | `.kao-hero-card`, `.kao-feedback-sheet`, `.kao-path-surface` ve `.kao-choice` kurallarının hepsinde `background:var(--kao-surface);border:1px solid var(--kao-sep)` var. |
| T-2 | Zemin rengi `--kao-bg` yüzeyden ancak %12 farklı. Katmanlar birbirinden ayrışmıyor, ekran bir Ayarlar uygulaması gibi görünüyor. | [kao.css:1](../app/kao.css#L1) |
| T-3 | Bugün ekranında 13 düğme var. Birincil eylem diğerleriyle yarışıyor. | Hero (1) + yol kartı (2) + Keşfet (7) + Sen (2) |
| T-4 | Hareket dili yalnız 3 animasyondan oluşuyor. Ders başlangıcı, doğru cevap ve ders sonunda hissedilen bir "an" yok. | `seyFade`, `sey-sheet-in`, `kaoHarakatFade` |
| T-5 | Arapça yazı boyutları tek bir sisteme bağlı değil. | Soru: `--f-large` (2,125 rem). Tanıtım: `clamp(2.6–4.2 rem)`. Şık: yaklaşık gövde boyu. Kök: `clamp(2.2–3.4 rem)`. |
| T-7 | Kutlama konfetisi KAO paletinde değil: `SeymaHelpers.confetti` sabit pembe-lila renkler kullanıyor (`#E9AFC1`, `#C9B8FF`…) — [helpers.js](../app/core/helpers.js) | Lacivert-altın modalda yabancı bir an |
| T-6 | Paletteki altın (`--quran2`) neredeyse hiç kullanılmıyor. Premium vurgu rengi boşa gidiyor. | Palet lacivert + altın, ama vurgu anlarında renk yok. |

## 4. Etkileşim

- **Kelime dizme:** Yalnız dokunarak yapılıyor. Sürükleme ve fiziksel his yok.
- **Ses düğmesi:** Basılı tutmak (350 ms) doğal hızda çalıyor, ama bu davranış keşfedilemiyor: [quranLearn.js:1751](../app/core/quranLearn.js#L1751). Davranış inline `onpointerdown` içindeki bir ok fonksiyonuyla yazılmış.
- **Okuyucu:** Kelimeye dokununca anlamı açılıyor. Ancak sesle senkron vurgu ve "bu kelimeyi kartlarıma ekle" köprüsü yok.

## 5. Planı bağlayan kısıtlar

- **I1–I6 sözleşmesi:** Tasarım değişikliği `data` nesnesini, `migrate()` fonksiyonunu ve `App.<ad>` handler yüzeyini değiştiremez. Şu an **45 adet `App.kao*` handler** var. Yeni handler isteyen her kart fx2/v3/surface pinlerini kaydırır, bu yüzden açık onay gerekir.
- **Tek yayın pini:** KAO runtime'ı, 4 içerik modülü ve `app/kao.css` aynı `?v=` değerini paylaşır. Bu değer üç yerde tutulur: `index.html`, `sw.js`, `tests/app/test_iip_22.js`.
- **K-1 bütçesi:** Runtime tavanı 128 KiB, ölçülen 118,1 KiB (2026-10-10; eski belgelerde 92,4). Yazı tipi ayrı bir varlık olduğu için kendi bütçe kararı gerekir.
- **İçerik üretimi:** İçerik yalnız araçla üretilir (`kao-lexicon-build`, `kao-content-freeze`). İçerik değişirse bayt-eşlik testi `test_kao_freeze_repro.js` de aynı committe güncellenir.
- **Tasarım sözleşmesi:** `test_kao2_design_contract.js` yalnız `--quran*`, `--f-*` ve `--dur-*` tokenlarına izin verir. Yeni tokenlar önce bu sözleşmeye eklenir.
- **Görsel QA:** Yalnız `tools/kapi/gorsel-qa/` araçlarıyla yapılır ve yalnız kullanıcı ekran görüntüsü isterse (CLAUDE.md kural 1).

---

## 6. Kök neden: bu sorunlar neden testlere rağmen yaşadı?

KAO2 ve KAO2-FIX 55 fixture ve kabul ölçütleriyle kapandı. Buna rağmen yukarıdaki bulgular yaşıyor.
Nedeni, sınama zincirinin **ne ölçtüğünde**:

| Ölçülen | Ölçülmeyen | Sonuç |
| --- | --- | --- |
| Görevin kurulduğu, cevaplanabildiği, notlandığı | Şıkların birbirinden **farklı** olduğu | B-01, %56 görevde sessizce yaşadı. Tek doğrudan test olan [test_kao_queue.js:135](../tests/kao/test_kao_queue.js#L135) sentetik ve tek kartlı kimliklerle koşuyor (`safe1`, `safe2`). Gerçek verideki iki yönlü kart çifti (`w:X:ar>tr` + `w:X:tr>ar`) hiç kurulmuyor. Harness kullanan 14 fixture'ın 5'i yerleşik durumla koşuyor, ama hiçbiri şıkların farklı olduğunu denetlemiyor. |
| Okunuşun **var olduğu** (`test_kao_pronunciation_contract`) | Okunuşun **doğru** olduğu | B-03, 274 örnekte yaşadı |
| CSS'in yalnız izinli tokenları kullandığı (`design_contract`) | Görsel hiyerarşi, yazı tipinin gerçekten yüklendiği | T-1 ve B-04 |
| Ders akışının sonuna varıldığı | Kaç dokunuş sürdüğü, öğrenme etkisi | E-1, E-2 |

**Ders:** Yapı ve sözleşme ölçüldü, **öğrenen deneyimi** ölçülmedi. Bu yüzden K3P her kartta en az
bir **deneyim ölçüsü** taşır:

- farklı şık oranı
- okunuş kuralları
- dokunuş sayısı
- tanıma payı
- ilk ekrandaki seçim sayısı

Bu ölçüler `araclar/` altındaki betiklerle gelir ve kapıya bağlanır (K3P-01 ve K3P-25).

## 7. Ölçüm tabanı (2026-10-10, headless)

| Ölçü | Değer | Araç | K3P hedefi |
| --- | --- | --- | --- |
| Çift şıklı görev (yerleşik kullanıcı) | 631 / 1.127 (%56) | `cift-sik.cjs` | 0 |
| Vasl hatalı lemma | 18 | `okunus-denetim.cjs` | 0 |
| İdgâmsız örnek okunuş | 274 | `okunus-denetim.cjs` | 0 |
| Ders başına dokunuş (otomatik geçiş kapalı / açık) | 69 / 39 | `dokunus-olc.cjs` | ≤ 40 (varsayılan) |
| Tanıma görevi payı | %93 ((1.030 + 20) / 1.127); yalnız kelime görevleri %91 | `cift-sik.cjs` görev sayımı | ≤ %60 |
| Bugün ekranındaki seçim sayısı | 13 düğme | `ekran-dok.cjs` | ≤ 5 |
| `App.kao*` handler sayısı | 45 | `grep` | 45 (değişmez) |
| Çalışma zamanı boyutu | 118,1 / 128 KiB (2026-10-10 ölçümü; eski belgelerde 92,4) | `test_kao2_perf_budget` | ≤ 128 KiB (yazı tipi ayrı, ≤ 150 KiB) |

## 8. Akış bulguları (özet; ayrıntı [AKIS.md](AKIS.md))

| # | Bulgu | Ölçüm |
| --- | --- | --- |
| A-1 | Edilgin blok | 6 ara ekran art arda, 328 sözcük, hiç soru yok |
| A-2 | Yenilik geç geliyor | İlk yeni içeriğe 21 dokunuş |
| A-3 | Zorluk uyum sağlamıyor | 4 yanlıştan sonra da 4 şık |
| A-5 | Devam ipucu yok | Yeniden yüklemeden sonra "Başla" ve 1/20 (veri korunuyor) |
| A-6 | Toast modalın üstüne biniyor | z 10000 > 380, `bottom:96px` şık bölgesinde |
| A-7 | Overlay her render'da yeniden kuruluyor | Derste 7/7 aşama geçişi tam render; açılış animasyonu yeniden oynar |
