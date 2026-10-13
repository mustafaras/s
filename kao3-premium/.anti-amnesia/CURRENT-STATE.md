# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-08

## Son durum

- **Tarih:** 2026-10-13
- **Son tamamlanan:** **K3P-07 (Dalga 1 · Görsel sistem, ikinci kart) — Kur'an yazı tipi.** Arapça artık yerel bir fontla çiziliyor: **Scheherazade New Regular v4.500** (SIL OFL, SHA-512 doğrulandı), `pyftsubset` ile **woff2 alt küme** (yalnız Arapça + Kur'an işaretleri). Önce: K3P-06 (tasarım tokenları).
- **Dal:** `kao3-premium`; onuncu ara yayın **`20261013b`** canlıda. Bu kart dalı ilerletti; **push yok**.
- **Yeni oturum:** genel başlatıcı `kao3-premium/STARTER.md`; sıradaki kart K3P-08 (Arapça tipografi sistemi).
- **Kanıt düzeyi:** kaynak/headless · görsel QA yok · cihaz yok.

## K3P-07 ne yaptı

- **İndirme/doğrulama:** `github.com/silnrsi/font-scheherazade` v4.500 (zip) — SHA-512 `4ff5d859…cd19c` `SHA512SUMS.txt` ile **birebir**; SHA-256 `49c789c2…dbda9`. Arşiv boş dizinde açıldı (BAGLAM §6).
- **Alt küme:** `tools/kao/kao-font-subset.mjs` (yeni): içerik + KAO motorunda geçen Arapça kod noktalarını sayar, her zaman gereken işaret/noktalama ile birleştirir, `pyftsubset` ile üretir ve **üretilen cmap'i** okuyup %100 kapsamı doğrular. Çıktı: `assets/kao/font/ScheherazadeNew-Regular.k3p.woff2` — **25.060 bayt (24,5 KiB)**, **105 kod noktası / %100 kapsam** (tavan 150 KiB ✓).
- **CSS:** `@font-face` (font-display:swap, ağırlık 400, `unicode-range:U+0600-06FF,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF`); Arapça yığının **başına** `"K3P Scheherazade"` eklendi.
- **Lisans:** `assets/kao/font/ScheherazadeNew-Regular.OFL.txt` (SIL OFL 1.1).
- **Çevrimdışı:** `sw.js` precache listesine `./assets/kao/font/ScheherazadeNew-Regular.k3p.woff2?v=20261013b`.
- **Test düzeltmeleri (gerekçeli):** `test_kao_render` Arapça yığın sabiti yeni başa göre; `test_kao2_design_contract` öksüz-sınıf tarayıcısı `@font-face` bloğunu dışlıyor (url() içindeki `.k3p`/`.woff2` uzantısı sınıf sanılıyordu — yanlış pozitif).

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
| Arapça font alt kümesi | **24,5 KiB · %100 kapsam ✓ (yeni)** | ≤ 150 KiB · %100 |

## Açık riskler

- **CSS bütçesi dar:** **13,666 / 14 KiB** (pay ~0,33 KiB). Çalışma zamanı 127,654 / 128 KiB (pay ~0,35 KiB). Kod ekleyen sıradaki kartlar önce eski kodu silmeli; yetmezse §5 gereği tavan kararı kullanıcıdan istenir.
- **Yazı tipi kabulü cihazda:** `≤ 150 KiB` ve kapsam headless doğrulandı; **30 zor glif dizisi** karşılaştırması ve harekelerin çakışmadığı **kullanıcının gözüyle** onaylanacak (K-B geri dönüş koşulu: gerekirse Amiri Quran). Bu, K3P-26/27 cihaz adımında.
- **Kapı kararı K-Q:** Bu kart dalga sonu **değil**; yalnız `kapi-hizli --kart K3P-07` → **HIZLI KAPI YEŞİL**. Tam kapı K3P-10'da.
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/kao.css` (K3P-07'de yeniden eklendi). Ara kartlarda pin yükseltilmez; K3P-27'de tek geçiş.
- **Katlanan blok sözleşmesi (K3P-A8):** ilk görünüm bütçesi yalnız `<details>`/`<summary>` ile; `<summary>` ≥ 44 px ve klavyeyle açılır.
- **Devam ipucu kaynağı (A-5):** yalnız `path.lessons[id].resume`; yeni veri alanı yok.
- **Uyarlanır durum kalıcı değil (K-K):** kayan pencere/streak yalnız `ui`.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** açılış → ilk görev 3 dokunuş, hedef 2. Karar kullanıcıda.
- **Bugün ekranı seçim sayısı (K-F, açık):** 12 düğme, hedef ≤ 5; K3P-12 kartının konusu.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1`; mutlak tavanlar zorunlu.
- **Deney raporu (K3P-05):** gerçek yedeği yalnız kullanıcı verir.
- **Okunuş kapısı zorunlu:** `okunus-denetim.cjs` exit 0 (K3P-07'de korundu).
- **Görsel QA Chrome yolu:** K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
