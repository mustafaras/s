# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-07

## Son durum

- **Tarih:** 2026-10-13
- **Son tamamlanan:** **K3P-06 (Dalga 1 · Görsel sistem, ilk kart) — Tasarım tokenları.** `kao.css`'in açık ve koyu token bloklarına yeni jetonlar eklendi; bu kartta jetonları **kullanan** kural değişikliği **yok** (kullanmak K3P-07…10'un işi). Önce: K3P-A8 (Dalga A kapanışı).
- **Dal:** `kao3-premium` = `main` = **dokuzuncu ara yayın `20261013a`** (canlıda). Bu kart dalı ilerletti; **push yok**.
- **Yeni oturum:** genel başlatıcı `kao3-premium/STARTER.md`; sıradaki kart K3P-07 (Kur'an yazı tipi alt kümesi).
- **Kanıt düzeyi:** kaynak/headless · görsel QA yok · cihaz yok.

## K3P-06 ne yaptı

- **Tanımlanan jetonlar** (`app/kao.css`, satır 1 açık + satır 2 koyu):
  - Materyal: `--kao-mat-ground`, `--kao-mat-card`, `--kao-mat-moment`
  - Gölge: `--kao-shadow-1`, `--kao-shadow-2`
  - Arapça ölçek: `--kao-ar-hero`, `--kao-ar-body`, `--kao-ar-inline`
  - Hareket: `--kao-ease`, `--kao-dur-micro`, `--kao-dur-transition`, `--kao-dur-moment`
- **Kaynak disiplini:** her renk `--quran*` üzerinden `color-mix` ile türetilir; **yeni hex yok**. Süreler mevcut `--dur-*`'a bağlı: `--kao-dur-micro:var(--dur-1)`, `--kao-dur-transition:var(--dur-2)`, `--kao-dur-moment:var(--dur-5)`. Eğri `cubic-bezier(.2,.8,.2,1)` (TASARIM §5.4).
- **Tema farkı (gerekçeli):** koyu temada `--kao-mat-moment` = `--quran` %40 + `--quran-surface`; böylece "an" kartı kendi temasında daha koyu kalır (koyu `--quran` açık navy'den yüksek parlaklıkta olduğu için TASARIM §5.1 "aynı, daha koyu" birebir aynı reçeteyle tutulamıyordu). Gölgeler koyu temada daha güçlü (28%/24% vs 8%/8%).
- **Sözleşme genişletildi, gevşetilmedi:** `test_kao_render.js` tüketim izin listesine `mat-*/shadow-*/ease/dur-*` aileleri; `test_kao2_design_contract.js` `tokenNames`'e 12 yeni jeton — ikisi de gerekçe yorumuyla.
- **Doğrulama:** `test_kao2_a11y` ve hem `kao-verify-contrast` (726 çift/0 ihlal) hem `verify-contrast` (30/0) yeşil; `test_kao2_design_contract` yeşil.

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

## Açık riskler

- **CSS bütçesi:** 13,190 → **13,335 / 14 KiB** (pay ~0,67 KiB). Çalışma zamanı **127,654 / 128 KiB** (pay ~0,35 KiB) — bu kart runtime'a dokunmadı. Kod ekleyen sıradaki kartlar önce eski kodu silmeli; yetmezse §5 gereği tavan kararı kullanıcıdan istenir.
- **Kapı kararı K-Q:** Bu kart dalga sonu **değil**; yalnız `kapi-hizli --kart K3P-06` koşuldu → **HIZLI KAPI YEŞİL**. Tam kapı (`bash tools/kapi/kapilar.sh`) bir sonraki dalga sonunda (K3P-10).
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, **`app/kao.css` (K3P-06'da yeniden eklendi)**. Ara kartlarda pin yükseltilmez; K3P-27'de tek geçiş.
- **Katlanan blok sözleşmesi (K3P-A8):** ilk görünüm bütçesi yalnız `<details>`/`<summary>` ile; `<summary>` ≥ 44 px ve klavyeyle açılır.
- **Devam ipucu kaynağı (A-5):** yalnız `path.lessons[id].resume`; yeni veri alanı yok.
- **Uyarlanır durum kalıcı değil (K-K):** kayan pencere/streak yalnız `ui`.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** açılış → ilk görev 3 dokunuş, hedef 2. Karar kullanıcıda.
- **Bugün ekranı seçim sayısı (K-F, açık):** 12 düğme, hedef ≤ 5; K3P-12 kartının konusu.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1`; mutlak tavanlar zorunlu.
- **Deney raporu (K3P-05):** gerçek yedeği yalnız kullanıcı verir.
- **Okunuş kapısı zorunlu:** `okunus-denetim.cjs` exit 0 (K3P-06'da korundu).
- **Görsel QA Chrome yolu:** K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
