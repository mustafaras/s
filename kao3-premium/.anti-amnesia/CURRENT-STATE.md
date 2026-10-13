# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-11

## Son durum

- **Tarih:** 2026-10-13
- **Son tamamlanan:** **K3P-10 (Dalga 1 · Görsel sistem, BEŞİNCİ ve SON kart) — Hareket grameri.** Görev geçişi, şık basışı, ✓ belirişi ve D-6 hata dostu yanlış sarsıntısı tek jeton ailesine (`--kao-dur-micro/transition/moment` + `--kao-ease`) bağlandı; hareket azaltma iki katmanda (CSS sözleşmesi + `kaoFx` birim testi) kanıtlandı. Önce: K3P-09 (materyal + an kartı).
- **Dal:** `kao3-premium` = `main` = **on birinci ara yayın `20261013c`** (canlıda). **Dalga 1 TAMAMLANDI** (K3P-06…10). Sıradaki kart Dalga 2'nin ilk kartıdır (K3P-11) → dalga sonu DEĞİL; `kapi-hizli --kart K3P-11` yeterli.
- **Yeni oturum:** genel başlatıcı `kao3-premium/STARTER.md`.
- **Kanıt düzeyi:** kaynak/headless · görsel QA **yok** (bu kartta ekran görüntüsü istenmedi) · cihaz yok.

## K3P-10 ne yaptı

- **Hareket sınıfları (TASARIM §5.4).** Geçiş sınıfı `--kao-dur-transition` (`--dur-2` = 200 ms), mikro sınıf `--kao-dur-micro` (`--dur-1` = 120 ms), an sınıfı `--kao-dur-moment` (`--dur-5`), eğri `--kao-ease`. Yeni sayı üretilmedi; hepsi mevcut jetonlara bağlı.
- **Görev geçişi (D-5).** `paintTask` içinde `kaoPaintedId` değişince `#kao-task`'a `kao-task-in` sınıfı eklenir: 24 px yatay kayma + opaklık, `--kao-dur-transition` (200 ms ≤ 240 ms). Sınıf yalnız `kaoAnimate()` açıkken eklenir; `animationend`'de silinir (ölü sınıf kalmaz).
- **Şık basışı.** `.kao-choices button` → `transition:transform var(--kao-dur-micro) var(--kao-ease)`; `:active` → `scale(.98)` (120 ms küçülme).
- **✓ işareti.** `.kao-choice-correct .kao-choice-mark` → `kao-mark-in`: `scale(.6)` → `scale(1.15)` (%15 aşma) → `scale(1)`, `--kao-ease` ile "yaylanarak".
- **Yanlış (D-6).** `kaoFx('wrong', şık)` eklendi; `kaoAnswer` içindeki ana akışın yanlış yolundan, `paintTask` içeriği YENİLENDİKTEN sonra çağrılır (`kaoChoiceNode` seçicisi). Yalnız seçilen şık `kao-shake` ile bir kez sarsılır (±4 px); `SeyHaptics.error` çalışır, **ses çalmaz**; kırmızı ve "yanlış!" yok (mevcut sıcak turuncu sürer).
- **Hareket azaltma.** `kaoAnimate()` tek kapı: `SeyFx.shouldAnimate()` varsa o, yoksa `matchMedia('(prefers-reduced-motion:reduce)')`. CSS tarafında asıl (tanımsız) her animasyon/geçiş kuralı `prefers-reduced-motion:reduce` bloğuyla kapanır — K3P-10 öncesi kapsanmayan üç kural da (`.kao-flag summary::after`, `.kao-lesson-more summary::after`, `.kao-lesson-seg>i`) kapatıldı.
- **Testler.** `tests/kao/test_k3p_motion_css.js` (metin taraması: sınıf→jeton, D-5 ≤240 ms, mikro 120 ms, ✓ aşması, reduce kapsamı 0 eksik) + `tests/kao/test_k3p_motion_fx.js` (12 kontrol: şık sarsıntısı doğru düğüme, yalnız `error`, ses yok, azaltmada sınıf yok, doğru yolla ayrışma). Envanter 67 → **69**.

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
| Bugün ekranı seçim sayısı | 12 | ≤ 5 |
| `App.kao*` sayısı | 45 ✓ | 45 |
| Arapça 700 (sahte kalın) | 0 ✓ | 0 |
| Şık dokunma hedefi | 56 px ✓ | ≥ 56 px |
| Altın METİN kullanımı | 0 ✓ | 0 |
| An kartı (kao-moment) kapsamı | hero + ders sonu + taş ✓ | 3 yer |
| **Hareket azaltmada kapanmayan kural** | **0 ✓ (yeni)** | 0 |
| **Yeni `App.kao*` handler** | **0 (45'te sabit) ✓** | 0 |

## Açık riskler

- **Çalışma zamanı bütçesi kıl payı:** **127,995 / 128 KiB (gzip level 6)**, level-9 127,653. K3P-09'un bıraktığı **0,013 KiB** payı kartın JS'i (+~0,7 KiB) aştı; §2 gereği **aynı işi gören eski kod** olarak en uzun yorumlar sıkıştırıldı (quranLearn/Flow/Views'te ~25 yorum satırı; atıf kodları korundu, hiçbir davranış değişmedi). **Dalga 2 kartları yine JS ekler** → yer açılması gerekebilir, yetmezse tavan kararı kullanıcıdan (§5).
- **CSS bütçesi:** 14,700 / **16 KiB** (pay ~1,3 KiB).
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/kao.css`, `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`, `app/core/quranLearnViews.js` (K3P-27'de tek geçiş).
- **Yazı tipi + tipografi + materyal + hareket kabulü cihazda:** headless tamam; gerçek gözle onay (hareke çakışması, an kartı altın cetvel/rumî, sarsıntı/yay hissi, dokunma hedefleri) K3P-26/27'de. Geri dönüş koşulu: Amiri Quran.
- **Kapı kararı K-Q:** Bu kart dalga sonu **değil**; `kapi-hizli --kart K3P-10` → **HIZLI KAPI YEŞİL**; dalga sonu gereği tam kapı da koşuldu → **TÜM KAPILAR YEŞİL**.
- **An kartı degrade istisnası:** `test_kao2_design_contract` degradeleri hâlâ yasaklar; **yalnız `.kao-moment`** istisna (kullanıcı kararı).
- **Katlanan blok sözleşmesi (K3P-A8):** ilk görünüm bütçesi yalnız `<details>`/`<summary>` ile; `<summary>` ≥ 44 px ve klavyeyle açılır.
- **Devam ipucu kaynağı (A-5):** yalnız `path.lessons[id].resume`.
- **Uyarlanır durum kalıcı değil (K-K):** kayan pencere/streak yalnız `ui`.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** açılış → ilk görev 3 dokunuş, hedef 2. Karar kullanıcıda.
- **Bugün ekranı seçim sayısı (K-F, açık):** 12 düğme, hedef ≤ 5; K3P-12 kartının konusu.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1`; mutlak tavanlar zorunlu.
- **Görsel QA Chrome yolu:** K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
