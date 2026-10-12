# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-A6

## Son durum

- **Tarih:** 2026-10-12
- **Son tamamlanan:** K3P-A5 (K-K, AKIS §4): uyarlanır zorluk. Son **8 görevlik kayan pencere** (yalnız `ui`) ve art arda yanlış sayacı. **Kaygı** (p <%70 ya da art arda 2 yanlış): şık **4→3→2**, ses otomatik çalar, araya bilinen kolay kart girer; art arda **3 yanlışta** yeniden tanış paneli (anlam + ses, mevcut panel yolu). **Sıkılma** (p >%92, ≥8 görev sonra): harekeler soluyor (yalnız sunum). **Notlama adaleti:** kolaylaştırılmış doğru `kaoGrade` **2** (Hard). Önce: K3P-A4 (zaman bütçesi).
- **Dal:** `kao3-premium`. `main` = altıncı ara yayın `20261011e` (K3P-A4 dahil, canlıda). Dal `main`'in 1 commit önünde (K3P-A5, yayında değil).
- **Yeni oturum:** `kao3-premium/STARTER.md` içindeki metni yapıştır.
- **Kanıt düzeyi:** kaynak/headless · görsel QA yalnız K3P-00 "önce" çizgisi · cihaz yok.

## Ölçü panosu (taban → hedef)

| Ölçü | Şimdi | Hedef |
| --- | --- | --- |
| Çift şıklı görev (yerleşik) | 0/1127 ✓ | 0 |
| Okunuş hatası (vasl + idgâm) | 0 + 0 ✓ | 0 |
| Ders başına dokunuş (varsayılan açık) | 39 ✓ | ≤ 40 |
| Art arda edilgin ekran | 1 ✓ (K3P-A3) | ≤ 1 |
| İlk yeni içeriğe dokunuş | 7 ✓ (K3P-A3) | ≤ 7 |
| Oturum süresi | ≤ seçilen ✓ (K3P-A4) | ≤ seçilen |
| Uyarlanır zorluk | 2 yanlıştan sonra şık ≤3; akışta 4 ✓ (K3P-A5) | kaygı ↓, sıkılma ↑ |
| Ders başına overlay yeniden kurulumu | 0 ✓ (K3P-A1) | 0 |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 13 | ≤ 5 |
| `App.kao*` sayısı | 45 ✓ | 45 |

## Açık riskler

- **Çalışma zamanı bütçesi çok dar:** 126,2 / 128 KiB; yaklaşık **1,8 KiB pay** kaldı (K3P-A1 +1,5, A2 +0,4, A3 +1,3, K3P-15 +1,3, A4 +1,3, **A5 +1,6 KiB**). Kod ekleyen kartlar (A6–A8, 11–13, 16–18, 20, 22–24) bu payı paylaşır. Sıradaki kod ekleyen kart **önce eski kodu silmeli**; yetmezse tavan kararı kullanıcıdan istenir (§5).
- **Kapı kararı K-Q:** Kart kapanışında hedefli kapı; K3P-A5 promptu `kapi-hizli --kart K3P-A5 --yavas` (yavaş testler zorunlu) istedi. Dalga sonunda (K3P-A8) tam kapı.
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/core/quranLearn.js`. Ara yayın yöntemi: ortak sürümle tek geçiş; ortak sürümü kullanmayan pinler için `test_asset_pin_freshness` katı modda koşulur ve ayrıca yükseltilir.
- **Uyarlanır durum kalıcı değil (K-K):** kayan pencere ve art arda yanlış sayacı yalnız `ui`; enjekte edilen kolay kart ders planının adımı olmadığı için **devam işaretçisine (`record.resume`) yazılmaz** (uyarlanır durum `data`'ya sızmaz). Uzun vadeli zorluk FSRS'te kalır.
- **Uyarlanır pencere ders kapsamı:** pencere ders başında sıfırlanır (ders = oturum). Çok dersli "5 dakika daha" zincirinde her ders kendi penceresini kurar.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** Hedef ekranı ilk görevden önce; `targets.flow.tapsOpenToFirstTask: 2` ile çatışıyor (ölçülen 3, `akis-olc` "1) 3 dokunuş"). Karar kullanıcıda.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1` ile koşar; mutlak tavanlar zorunludur (K3P-A5: runtime 126,2/128 KiB, css 13,07/14 KiB, p95 13,1 ms).
- **Yavaş testler:** `test_kao2_kabul` (~230–530 sn), `test_kao2_grammar_tasks` (~170–290 sn), `test_kao2_denetim` (~35–50 sn). K3P-A5'te üçü de yeşil.
- **Deney raporu (K3P-05):** gerçek yedeği yalnız kullanıcı verir; ajan yalnız `--ornek` ile doğrular.
- **Okunuş kapısı zorunlu (K3P-04'ten beri):** `okunus-denetim.cjs` exit 0 (K3P-A5'te korundu).
- **L2 önerisi:** Okunuş kıraat hocası incelemesi bekliyor (K3P-04/K3P-04B kanıt dosyaları).
- **Görsel QA Chrome yolu:** `tools/kapi/gorsel-qa/cdp.mjs` varsayılanı bu makinede yok; K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
