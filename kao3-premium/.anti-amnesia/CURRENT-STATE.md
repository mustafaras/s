# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-14

## Son durum

- **Tarih:** 2026-10-14
- **Son tamamlanan:** **K3P-13 (Dalga 2 · Tezhip, üçüncü kart) — Ders âyetle açılır ve kapanır (K-G).** Her dersin **açılışı** (goal) ve **kapanışı** (apply) AYNI âyet satırını paylaşır; açılış o satırı Tezhip olarak (soluk altın/mürekkep) gösterir, kapanış aynı satırı sesle çalıp kelimeleri **sırayla yaldızlar**. Önceki: K3P-12 (Bugün ekranı), K3P-11 (Tezhip bileşeni).
- **Son yayın:** 2026-10-14, **on üçüncü ara yayın `20261014b`** canlıda (kullanıcı açık onayı). K3P-13 için yayın YOK (kullanıcı onayı bekler).
- **Dal:** `kao3-premium` = `main` = **`20261014b`**. Sıradaki kart K3P-14 (ders sonu anı) → dalga sonu DEĞİL; `kapi-hizli --kart K3P-14` yeterli.
- **Yeni oturum:** genel başlatıcı `kao3-premium/STARTER.md`.
- **Kanıt düzeyi:** kaynak/headless · görsel QA **yok** (bu kartta ekran görüntüsü istenmedi) · cihaz yok.

## K3P-13 ne yaptı

- **Satır kuralı (`app/core/quranLearnFlow.js`).** `applyItems` (çapa kelimeleri) plan içinde **bir kez** hesaplanır; `goal.words === apply.words === apply.words` (tek referans). `goal`'a `lessonIds` (dersin kendi lemması) ve `newLemmaIds` eklendi. Çapa metni (namaz/sûre) varsa satır, hedef lemmaların çapa metnindeki **ilk-son geçişi arasındaki pencere**; yoksa yeni lemmaların doğrulanmış ilk örnek cümlelerindeki kelimeler. **Eski örnek-cümle modeli emekliye ayrıldı**: `applySentences` + `APPLY_SENTENCE_MAX` (Flow), `apply.mode==='examples'` + `apply.sentences` (Flow/runtime), `kao-lesson-sentences` görünüm dalı (Views) silindi.
- **Görünüm (`app/core/quranLearnViews.js`).** Açılış (goal) ve kapanış (apply) ekranları satırı `<div class="kao-lesson-apply-tezhip">` içinde `views.tezhipPage` ile çizer. `tezhipPage`'e `gild` seçeneği eklendi: ilk n kelime `is-gild` sınıfını alır (yaldızlanma anı). Kapanışta **"Yaldızla"** düğmesi (`kao-play-start`).
- **Motor (`app/core/quranLearn.js`).** `kaoAyahRow(words, lessonIds, newLemmaIds)` satır penceresini (önce çapa `words`, yoksa yeni/öncelikli lemmaların örnek cümleleri), `kaoRowHtml(row,gild)` Tezhip'i, `kaoGild`/`kaoGildStep` **⑤ zirve** oynatmasını üretir. Ses = satırdaki hedef lemmaların `w-<lemmaId>-measured` klipsi; kelimeler zamanlayıcıyla sırayla yaldızlanır, **toplam an ≤ 1,2 sn** (adım aralığı `1200/sözcük`). Hareket azaltmada (`SeyFx.shouldAnimate()===false`) yaldız **STATİK** (zamanlayıcı kurulmaz). **Yeni `App.kao*` YOK** — mevcut `kaoLesson('gild')` eylemi yeniden kullanıldı (45 sabit).
- **CSS (`app/kao.css`).** `.kao-lesson-apply-tezhip` (yuva; iç tezhip çerçevesiz), `.kao-tezhip-word.is-gild` (yaldız anı = bilinen yaldızıyla aynı altın), `.kao-play-start`.
- **Testler.** Yeni `tests/kao/test_k3p_lesson_ayah.js` (**5 kontrol**: 109 ders referans+satır ortaklığı, hedef lemmalar + ≤25 sözcük gerekçeli istisna listesi (yalnız küçülür), açılış/kapanış aynı Tezhip satırı, sırayla yaldız ≤1,2 sn, hareket azaltmada statik) → envanter **71 → 72**. `test_kao2_lesson_flow` (4 kontrol K-G'ye göre) ve `test_kao2_denetim` R-08 güncellendi (eski `sentences` modeli yerine satır ortaklığı).

## Ölçü panosu (taban → hedef)

| Ölçü | Şimdi | Hedef |
| --- | --- | --- |
| Çift şıklı görev (yerleşik) | 0/1127 ✓ | 0 |
| Okunuş hatası (vasl + idgâm) | 0 + 0 ✓ | 0 |
| Ders başına dokunuş (varsayılan açık) | 39 ✓ | ≤ 40 |
| Art arda edilgin ekran | 1 ✓ | ≤ 1 |
| İlk yeni içeriğe dokunuş | 7 ✓ | ≤ 7 |
| Oturum süresi | ≤ seçilen ✓ | ≤ seçilen |
| Uyarlanır zorluk | 2 yanlıştan sonra şık ≤3 ✓ | kaygı ↓, sıkılma ↑ |
| Bölümlü ilerleme | 5 bölüm ✓ | 5 bölüm |
| Yeniden yüklemede devam ipucu | "Kaldığın yerden · Bölüm n/5" ✓ | var |
| Ders başına overlay yeniden kurulumu | 0 ✓ | 0 |
| Edilgin ekran ilk görünümü | goal ≤41* · tanış ≤33 · kavram ≤24 ✓ | ≤ 45 sözcük |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 5 ✓ | ≤ 5 (K3P-12) |
| `App.kao*` sayısı | 45 ✓ | 45 |
| Arapça 700 (sahte kalın) | 0 ✓ | 0 |
| Şık dokunma hedefi | 56 px ✓ | ≥ 56 px |
| Altın METİN kullanımı | 0 ✓ | 0 |
| An kartı (kao-moment) kapsamı | hero + ders sonu + taş ✓ | 3 yer |
| Tezhip bileşeni + model | ✓ (K3P-11) | §2 |
| **Ders açılış/kapanış âyet satırı (K-G)** | **✓ 109/109 satır ortak** | K-G |
| **Hedef lemmalar satırda** | **99/109 (10 gerekçeli istisna)** | hepsi istisnalı |
| **Yeni `App.kao*` handler** | **0 (45'te sabit) ✓** | 0 |

\* goal ilk görünümü 45 değil **25 sözcük** bütçesine tabi (AKIS §3 ①); ölçüm `akis-olc` sözcük sayımıyla.

## Açık riskler

- **Çalışma zamanı bütçesi kıl payı:** **127,944 / 128 KiB (gzip level 6; L9 127,592)**. Bu kartta JS (~+1,1 KiB) payı aştı ve **iki kez** §2 gereği **en uzun yorumlarda parantez içi/cümle dışı kısaltma** yapıldı (70+ yorum satırı, ~4,3 KB ham; **atıf kodları, davranış ve cümle sonları korundu; kod yolu değişmedi**). **Pay ~0,05 KiB** → sonraki JS ekleyen kart önce aynı işi gören eski kodu silmeli ya da yorum kısaltmalı; yetmezse tavan kararı kullanıcıdan (§5). Yorum sıkıştırması **yalnız satır-başı `//`** yorumlarında ve `sed -n '<n>p'` ile ham doğrulanarak yapıldı (K3P-09/10 satır-birleşme tuzağı).
- **CSS bütçesi:** 15,273 / **16 KiB** (pay ~0,7 KiB).
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/kao.css`, `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`, `app/core/quranLearnViews.js` (K3P-27'de tek geçiş). Bu 4 dosya hiçbir ara kartta pinlenmez.
- **`akis-olc` 2b uyarısı (araç sınırı, D-4 DEĞİL):** `akis-olc` 2b, hedef (goal) ekranının ilk görünümünü ≤45 sayar ve 109 dersin 80'inde >45 raporlar. Gerçek ölçü **AKIS §3 ①: ≤25 sözcük** (hedef ekranı edilgin ekran değil, tam ekran bütçesidir; K3P-A8 D-4 `<details>` değil). `test_k3p_lesson_ayah` doğru kuralı (≤25) doğrular. Araçtaki bu eski 2b kuralı ayrı bir kartta düzeltilebilir (kapsam dışı).
- **Tezhip görsel kabulü cihazda:** açılış/kapanış satırı ve yaldız hareketi headless doğrulandı; **yaldızın gerçek gözle onayı** (açık temada altın zemin+çizgi, koyu temada altın metin, `forced-colors`) K3P-26/27'de.
- **Kapı kararı K-Q:** Bu kart dalga sonu **değil**; `kapi-hizli --kart K3P-13` → **HIZLI KAPI YEŞİL**.
- **An kartı degrade istisnası:** `test_kao2_design_contract` degradeleri hâlâ yasaklar; **yalnız `.kao-moment`** istisna (kullanıcı kararı).
- **Katlanan blok sözleşmesi (K3P-A8):** ilk görünüm bütçesi `<details>`/`<summary>` ile; `<summary>` ≥ 44 px ve klavyeyle açılır.
- **Devam ipucu kaynağı (A-5):** yalnız `path.lessons[id].resume`.
- **Uyarlanır durum kalıcı değil (K-K):** kayan pencere/streak yalnız `ui`.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** açılış → ilk görev 3 dokunuş, hedef 2. Karar kullanıcıda.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1`; mutlak tavanlar zorunlu.
- **Görsel QA Chrome yolu:** K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
