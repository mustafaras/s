# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-09

## Son durum

- **Tarih:** 2026-10-13
- **Son tamamlanan:** **K3P-08 (Dalga 1 · Görsel sistem, üçüncü kart) — Arapça tipografi sistemi.** Bütün Arapça kurallar üç kademeli ölçeğe bağlandı (`--kao-ar-hero/body/inline`), **sahte kalın kaldırıldı** (Arapça 700 = 0), inline oranı 1,3× kuralına çekildi, şıklar 56 px. Önce: K3P-07 (yazı tipi alt kümesi).
- **Dal:** `kao3-premium`; onuncu ara yayın **`20261013b`** canlıda. Bu kart dalı ilerletti; **push yok**.
- **Yeni oturum:** genel başlatıcı `kao3-premium/STARTER.md`; sıradaki kart K3P-09 (materyal hiyerarşisi ve renk görevleri).
- **Kanıt düzeyi:** kaynak/headless · görsel QA yok · cihaz yok.

## K3P-08 ne yaptı

- **Ölçek (madde 1):** 18 Arapça kuralın `font-size` değeri üç kademeden birine bağlandı — `--kao-ar-hero` (soru, ders âyeti, namaz/s0, ayar örneği, tanış, gate), `--kao-ar-body` (şıklar, âyet satırı, okuyucu, geri bildirim, ünite kelimesi, gramer, kök, sözlük, sözcük örneği), `--kao-ar-inline` (Türkçe cümle içi Arapça: kavram çipleri, ders başlığı/ızgara etiketi). Sayısal `clamp(...)` ölçekleri kaldırıldı; kademe tokenları tek kaynak.
- **Kalınlık (madde 2):** Arapça seçicilerden **5 kural-düzeyi `font-weight:700`** kaldırıldı (soru, şık, bağlam, kelime-hero, gate, okuyucu, kök, s0, ders, ayar). Kalan sarmalayıcı kutular için tek taban eklendi: `.kao-dialog [lang="ar"]{font-weight:400}` — Arapça **her yerde 400**.
- **Oran (madde 3):** `--kao-ar-inline` **1.25em → 1.3em** (TASARIM §5.3 tablosu 1.25em derken aynı bölümün "≥ 1,3 × Latin" kuralı ve prompt madde 3 çelişiyordu; **kural + prompt kazandı**, LEDGER gözleminde kayıtlı). hero/body zaten ≥ 1,3 (hero min 2.75rem ≈ 44px, body 1.75rem ≈ 28px, gövde 17px).
- **Dokunma hedefi (madde 4):** `.kao-choices button` **52 → 56 px**.
- **Test (madde 5):** yeni `tests/kao/test_k3p_typography.js` — Arapça 700 = 0, ölçek yalnız `--kao-ar-*`, oran ≥ 1,3 × `--f-body` (kaynaktan okunur), şık ≥ 56 px, sıralama body<hero, taban 400. `tests/kao/README.md` envanterine eklendi (67 dosya).

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
| Arapça font alt kümesi | 24,5 KiB · %100 kapsam ✓ (K3P-07) | ≤ 150 KiB · %100 |
| **Arapça 700 (sahte kalın)** | **0 ✓ (yeni)** | 0 |
| **Arapça ölçek kaynaşı** | **yalnız --kao-ar-* ✓ (yeni)** | 3 kademe |
| **Şık dokunma hedefi** | **56 px ✓ (yeni)** | ≥ 56 px |

## Açık riskler

- **CSS bütçesi çok dar:** **13,806 / 14 KiB** (pay ~0,19 KiB). Çalışma zamanı 127,654 / 128 KiB (pay ~0,35 KiB). Bir sonraki CSS dokunuşu bütçeyi aşabilir → §5 gereği önce ölü/kopya kural silinecek; yetmezse tavan kararı kullanıcıdan istenir. (K3P-09 materyal kartı ve K3P-10 hareket bloğu CSS ekleyecek; **önceden yer açılmalı**.)
- **Yazı tipi + tipografi kabulü cihazda:** headless ölçüm tamam; gerçek gözle onay (hareke çakışması, 30 zor glif dizisi) K3P-26/27'de. Geri dönüş koşulu: Amiri Quran.
- **Kapı kararı K-Q:** Bu kart dalga sonu **değil**; `kapi-hizli --kart K3P-08` → **HIZLI KAPI YEŞİL**; tests/kao ailesi 67/67 (yavaşlar dâhil) FAIL=0. Tam kapı K3P-10'da.
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/kao.css` (K3P-08'de değişti). K3P-27'de tek geçiş.
- **Katlanan blok sözleşmesi (K3P-A8):** ilk görünüm bütçesi yalnız `<details>`/`<summary>` ile; `<summary>` ≥ 44 px ve klavyeyle açılır.
- **Devam ipucu kaynağı (A-5):** yalnız `path.lessons[id].resume`; yeni veri alanı yok.
- **Uyarlanır durum kalıcı değil (K-K):** kayan pencere/streak yalnız `ui`.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** açılış → ilk görev 3 dokunuş, hedef 2. Karar kullanıcıda.
- **Bugün ekranı seçim sayısı (K-F, açık):** 12 düğme, hedef ≤ 5; K3P-12 kartının konusu.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1`; mutlak tavanlar zorunlu.
- **Deney raporu (K3P-05):** gerçek yedeği yalnız kullanıcı verir.
- **Okunuş kapısı zorunlu:** `okunus-denetim.cjs` exit 0 (K3P-08'de korundu).
- **Görsel QA Chrome yolu:** K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
