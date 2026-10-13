# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-06

## Son durum

- **Tarih:** 2026-10-12
- **Son tamamlanan:** **K3P-A8 (D-4) — Dalga A kapandı.** Hedef, tanış ve kavram ekranlarının **ilk görünümü** artık ≤ 45 sözcük. Ayrıntı (örnek âyet, çapa metni, "Neden böyle?", kavram tablosu, terimler) tek bir yerel `<details><summary>Daha fazla</summary>…</details>` içine taşındı: **handler eklenmedi, içerik metni değişmedi, yalnız sunum.** Önce: K3P-A7 (görünür devam ipucu).
- **Dal:** `kao3-premium`. `main` = sekizinci ara yayın `20261011g` (K3P-A7 dahil, canlıda). Dal `main`'in 1 commit önünde (K3P-A8, yayında değil).
- **Yeni oturum:** `kao3-premium/STARTER.md` içindeki metni yapıştır.
- **Kanıt düzeyi:** kaynak/headless · görsel QA yalnız K3P-00 "önce" çizgisi · cihaz yok.
- **Dalga A özeti:** 8/8 kart bitti (K3P-A1…A8). AKIS §6 tablosu yeniden ölçüldü (§6b eklendi).

## Ölçü panosu (taban → hedef)

| Ölçü | Şimdi | Hedef |
| --- | --- | --- |
| Çift şıklı görev (yerleşik) | 0/1127 ✓ | 0 |
| Okunuş hatası (vasl + idgâm) | 0 + 0 ✓ | 0 |
| Ders başına dokunuş (varsayılan açık) | 39 ✓ | ≤ 40 |
| Art arda edilgin ekran | 1 ✓ (K3P-A3) | ≤ 1 |
| İlk yeni içeriğe dokunuş | 7 ✓ (K3P-A3) | ≤ 7 |
| Oturum süresi | ≤ seçilen ✓ (K3P-A4) | ≤ seçilen |
| Uyarlanır zorluk | 2 yanlıştan sonra şık ≤3 ✓ (K3P-A5) | kaygı ↓, sıkılma ↑ |
| Bölümlü ilerleme | 5 bölüm ✓ (K3P-A6) | 5 bölüm |
| Yeniden yüklemede devam ipucu | "Kaldığın yerden · Bölüm n/5" ✓ (K3P-A7) | var |
| Ders başına overlay yeniden kurulumu | 0 ✓ (K3P-A1) | 0 |
| **Edilgin ekran ilk görünümü (zirve hariç)** | **goal ≤41 · tanış ≤33 · kavram ≤24 ✓ (K3P-A8)** | **≤ 45 sözcük** |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 12 | ≤ 5 |
| `App.kao*` sayısı | 45 ✓ | 45 |

## Açık riskler

- **Çalışma zamanı bütçesi dar:** 127,65 / 128 KiB (gzip); pay ~0,35 KiB. K3P-A8 bu payı **ölü kod silerek** açtı (`cellText`, `cellPronunciation`, `kaoBoredom`, `kaoCorrectPauseMs`; `.kao-lesson-why` / `.kao-lesson-term` CSS'i). Kod ekleyen **sıradaki her kart önce eski kodu silmeli**; yetmezse §5 gereği tavan kararı kullanıcıdan istenir. CSS 13,19/14 KiB.
- **Kapı kararı K-Q:** Kart kapanışında `kapi-hizli --kart <ID>`; dalga sonunda ayrıca `bash tools/kapi/kapilar.sh`. **K3P-A8 dalga sonu koşuldu → TÜM KAPILAR YEŞİL.** Sıradaki K3P-06 (Dalga 1) dalga sonu değil.
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/kao.css`. Ara yayın yöntemi: ortak sürümle tek geçiş (K3P-27).
- **Katlanan blok sözleşmesi (K3P-A8):** ilk görünüm bütçesi yalnız `<details>`/`<summary>` ile sağlanır; `<summary>` ≥ 44 px ve klavyeyle açılır (`test_kao2_a11y`). Kural cümlesi (kavram `plainTr`) **de** katlanır — bu yüzden kavram ekranının ilk görünümü başlık + "Daha fazla"dır (≤24 sözcük).
- **Devam ipucu kaynağı (A-5):** yalnız `path.lessons[id].resume`; yeni veri alanı yok. Eşleşmezse ipucu gösterilmez (güvenli geri düşüş).
- **Uyarlanır durum kalıcı değil (K-K):** kayan pencere/streak yalnız `ui`; enjekte kolay kart devam işaretçisine yazılmaz.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** açılış → ilk görev 3 dokunuş, hedef 2. Karar kullanıcıda.
- **Bugün ekranı seçim sayısı (K-F, açık):** 12 düğme, hedef ≤ 5; K3P-12 kartının konusu.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1`; mutlak tavanlar zorunlu (K3P-A8: runtime 127,65/128 · css 13,19/14 KiB · p95 5,4 ms).
- **Yavaş testler:** `test_kao2_kabul`, `test_kao2_grammar_tasks`, `test_kao2_denetim`. K3P-A8'de üçü de yeşil (tam kapı).
- **Deney raporu (K3P-05):** gerçek yedeği yalnız kullanıcı verir.
- **Okunuş kapısı zorunlu (K3P-04'ten beri):** `okunus-denetim.cjs` exit 0 (K3P-A8'de korundu).
- **Görsel QA Chrome yolu:** K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
