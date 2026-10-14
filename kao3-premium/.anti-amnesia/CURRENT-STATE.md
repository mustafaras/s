# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-12

## Son durum

- **Tarih:** 2026-10-14
- **Son tamamlanan:** **K3P-11 (Dalga 2 · Tezhip, ilk kart) — Tezhip sayfası bileşeni.** İmza bileşen doğdu: `views.tezhipPage` + `kaoTezhipModel`; bilinen kelime altınla işleniyor ve yaldız oranı `kaoCoverage` ile birebir tutarlı. Önce: K3P-10 (hareket grameri; Dalga 1 kapandı).
- **Son yayın:** 2026-10-14, **on ikinci ara yayın `20261014a`** canlıda (kullanıcı açık onayı; Pages run **38521530117** success; canlı pin GET ile doğrulandı) — Dalga 1 hareket grameri + Tezhip bileşeni yayında.
- **Dal:** `kao3-premium` = `main` = **`20261014a`**. Sıradaki kart K3P-12 (Bugün ekranı yeniden) → dalga sonu DEĞİL; `kapi-hizli --kart K3P-12` yeterli.
- **Yeni oturum:** genel başlatıcı `kao3-premium/STARTER.md`.
- **Kanıt düzeyi:** kaynak/headless · görsel QA **yok** (bu kartta ekran görüntüsü istenmedi) · cihaz yok.

## K3P-11 ne yaptı

- **Bileşen (`app/core/quranLearnViews.js` → `views.tezhipPage`).** `{title, lines, footer, interactive}`; `lines` biçimi `[[{ar, state, index}]]`. Arapça sağdan sola, `--kao-ar-body` ölçeğinde (`lang="ar" dir="rtl"`). Kenarlık **rumî** satır içi SVG (`deps.icon('rumi',…)`, `aria-hidden`). Her kelime `aria-label` taşır (`"ٱلرَّحْمَـٰنِ, öğreniliyor"` gibi); `interactive:false` iken kelimeler **düğme değil** `<span>`.
- **Yaldız (§2).** Açık tema: mürekkep metin + altın tonlu zemin (`--quran2 %22`) + **2 px altın alt çizgi**; koyu tema: altın metin (`#root[data-theme="dark"]`); `forced-colors` modunda alt çizgi **`Highlight`** (yaldız yalnız renkle anlatılmaz). Öğreniliyor: yarım altın zemin; yeni: mürekkep.
- **Model (`app/core/quranLearn.js` → `kaoTezhipModel(d, surahId)`).** Kısa sûre (`id`) **ya da** namaz metni (`id`, ör. `'fatiha'`) çözülür; yoksa `null`. Durum: **bilinen** = `kaoKnownLemmaSet` (her iki yön `isSettled` s≥21) · **öğreniliyor** = kartı var · **yeni** = kartı yok. **Yalnız türetir**, hiçbir şey yazmaz. Yaldız oranı **aynı kelime kümesi** üzerinden `kaoCoverage` ile hesaplanır → tutarlılık yapısal.
- **Testler.** `tests/kao/test_k3p_tezhip.js` (16 kontrol: üç durum, escape, erişilebilir ad, `interactive:false` düğme değil, rumî `aria-hidden`, durum kuralı, `kaoKnownLemmaSet` eşliği, salt-türetim, `lines` biçimi, `kaoCoverage` tutarlılığı, kısa sûre modu). Envanter **69 → 70**.

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
| Edilgin ekran ilk görünümü | goal ≤41 · tanış ≤33 · kavram ≤24 ✓ | ≤ 45 sözcük |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 12 | ≤ 5 (K3P-12) |
| `App.kao*` sayısı | 45 ✓ | 45 |
| Arapça 700 (sahte kalın) | 0 ✓ | 0 |
| Şık dokunma hedefi | 56 px ✓ | ≥ 56 px |
| Altın METİN kullanımı | 0 ✓ | 0 |
| An kartı (kao-moment) kapsamı | hero + ders sonu + taş ✓ | 3 yer |
| **Tezhip bileşeni + model** | **✓ (yeni)** | §2 |
| **Yeni `App.kao*` handler** | **0 (45'te sabit) ✓** | 0 |

## Açık riskler

- **Çalışma zamanı bütçesi hâlâ kıl payı:** **127,835 / 128 KiB (gzip level 6)**, level-9 127,475. Bu kartta JS (~+1,0 KiB) yine payı aştı; §2 gereği "aynı işi gören eski kod" olarak **en uzun yorumlarda parantez içi açıklamalar** kısaltıldı (73 yorum satırı, ~2,1 KB ham; **atıf kodları, davranış ve cümle sonları korundu**). Dalga 2'nin kalan kartları (K3P-12…) yine JS ekler → yer açılmaya devam edilmeli; yetmezse tavan kararı kullanıcıdan (§5).
- **CSS bütçesi:** 15,041 / **16 KiB** (pay ~1,0 KiB).
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/kao.css`, `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`, `app/core/quranLearnViews.js` (K3P-27'de tek geçiş).
- **Tezhip görsel kabulü cihazda:** bileşen ve model headless doğrulandı; **yaldızın gerçek gözle onayı** (açık temada altın zemin+çizgi, koyu temada altın metin, rumî kenarlık, `forced-colors`) K3P-26/27'de. Bileşen şu an hiçbir ekrana BAĞLANMADI — K3P-12 (Bugün), K3P-13 (ders açılışı/özete şerit), K3P-14 (ders sonu), K3P-17 (İlerleme), K3P-18 (Yol küçük resimleri) onu kullanacak.
- **Kapı kararı K-Q:** Bu kart dalga sonu **değil**; `kapi-hizli --kart K3P-11` → **HIZLI KAPI YEŞİL**.
- **An kartı degrade istisnası:** `test_kao2_design_contract` degradeleri hâlâ yasaklar; **yalnız `.kao-moment`** istisna (kullanıcı kararı).
- **Katlanan blok sözleşmesi (K3P-A8):** ilk görünüm bütçesi yalnız `<details>`/`<summary>` ile; `<summary>` ≥ 44 px ve klavyeyle açılır.
- **Devam ipucu kaynağı (A-5):** yalnız `path.lessons[id].resume`.
- **Uyarlanır durum kalıcı değil (K-K):** kayan pencere/streak yalnız `ui`.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** açılış → ilk görev 3 dokunuş, hedef 2. Karar kullanıcıda.
- **Bugün ekranı seçim sayısı (K-F, açık):** 12 düğme, hedef ≤ 5; **K3P-12 kartının konusu**.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1`; mutlak tavanlar zorunlu.
- **Görsel QA Chrome yolu:** K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
