# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-10

## Son durum

- **Tarih:** 2026-10-13
- **Son tamamlanan:** **K3P-09 (Dalga 1 · Görsel sistem, dördüncü kart) — Materyal hiyerarşisi ve renk görevleri.** Zemin/kart/an üç katmanı ayrıştı; yeşil kalktı, doğru cevap altın dolgu + mürekkep metin oldu. Önce: K3P-08 (Arapça tipografi).
- **Dal:** `kao3-premium` = `main` = **on birinci ara yayın `20261013c`** (canlıda; Pages run 38415139887 success, canlı pin/font GET ile doğrulandı). Sıradaki kart Dalga 1'in **son** kartıdır (K3P-10) → dalga sonu tam kapı da koşulacak.
- **Yeni oturum:** genel başlatıcı `kao3-premium/STARTER.md`.
- **Kanıt düzeyi:** kaynak/headless · **görsel QA var (242 ekran görüntüsü, yerel/redakte)** · **deploy: Pages success + canlı pin/font GET** · cihaz yok.

## K3P-09 ne yaptı

- **Katmanlar (§5.1).** Zemin `--kao-mat-ground` (açık: parşömen `--quran-surface 92% + --quran2`; koyu: **yüzeyin kendisi** — gerekçe LEDGER'da). Kartlar (`hero`/`feedback-sheet`/`path-surface`/`lesson-card`/`choice`) 1 px çizgi yerine `--kao-shadow-1` kullanır (T-1: düz hiyerarşi kalkar).
- **An kartı.** `.kao-moment` sınıfı **hero (Bugün kahramanı) + ders sonu (özet) + taş** bölümlerine eklendi: lacivert degrade + 1 px altın cetvel + satır içi **rumî SVG** (opaklık .08, `aria-hidden`). Süsleme gerçek `<svg>` öğesidir (sözde-öğe değil): strict sözleşme `content:""` yasaklar. Dize **bütçe dışı** `constants.js` içinde (`KAO_MOMENT_ORN`), böylece runtime gzip tavanı korunur.
- **Altın (§5.2).** `--kao-ok` = `--quran2` (yeşil kalktı); `--kao-ok-bg` = altın %16 dolgu. **Hiçbir yerde altın metin yok** (açık temada yasak): 8 metin kuralı mürekkep rengine çevrildi, ✓ işareti ve durum işaretleri mürekkep. An kartında metin `--kao-moment-ink` ile açık renk (yeni jeton).
- **Yanlış.** Yalnız sıcak turuncu (`--kao-fix`) — değişmedi (D-6).
- **Kontrast.** Araca 3 yeni çift eklendi (an metni/başlığı ≥4,5 · altın cetvel ≥3) + **kapsamlı token çözümü** (bir kural kendi içinde `--token` tanımlıyorsa o kapsamda çözülür). 0 ihlal.
- **forced-colors.** An kartı `Canvas`/`CanvasText`; cetvel `CanvasText`; süs gizlenir.

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
| **Altın METİN kullanımı** | **0 ✓ (yeni)** | 0 |
| **An kartı (kao-moment) kapsamı** | **hero + ders sonu + taş ✓ (yeni)** | 3 yer |

## Açık riskler

- **Çalışma zamanı bütçesi yine kıl payı:** **127,987 / 128 KiB (gzip level 6)**; level-9 ölçüm 127,650. K3P-09 sırasında ölü `KAO_S0_SHAPES` silindi + süs dizesi bütçe dışına taşındı + birkaç yorum sıkıştırıldı; **K3P-10 (hareket) JS ekler** → önce yer açılmalı, yetmezse tavan kararı kullanıcıdan. **CSS:** 14,372 / **16 KiB** (tavan bu kartta kullanıcı kararıyla 14→16 yükseltildi).
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/kao.css`, `app/core/constants.js`, `app/core/quranLearn.js`, `app/core/quranLearnViews.js` (K3P-27'de tek geçiş).
- **Yazı tipi + tipografi + materyal kabulü cihazda:** headless tamam; gerçek gözle onay (hareke çakışması, an kartı altın cetvel/rumî görünümü, 30 zor glif dizisi) K3P-26/27'de. Geri dönüş koşulu: Amiri Quran.
- **Kapı kararı K-Q:** Bu kart dalga sonu **değil**; `kapi-hizli --kart K3P-09` → **HIZLI KAPI YEŞİL**; tests/kao ailesi 67/67 FAIL=0.
- **An kartı degrade istisnası:** `test_kao2_design_contract` degradeleri hâlâ yasaklar; **yalnız `.kao-moment`** istisna (kullanıcı kararı, gerekçesi yorumda).
- **Katlanan blok sözleşmesi (K3P-A8):** ilk görünüm bütçesi yalnız `<details>`/`<summary>` ile; `<summary>` ≥ 44 px ve klavyeyle açılır.
- **Devam ipucu kaynağı (A-5):** yalnız `path.lessons[id].resume`.
- **Uyarlanır durum kalıcı değil (K-K):** kayan pencere/streak yalnız `ui`.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** açılış → ilk görev 3 dokunuş, hedef 2. Karar kullanıcıda.
- **Bugün ekranı seçim sayısı (K-F, açık):** 12 düğme, hedef ≤ 5; K3P-12 kartının konusu.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1`; mutlak tavanlar zorunlu.
- **Görsel QA Chrome yolu:** K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
