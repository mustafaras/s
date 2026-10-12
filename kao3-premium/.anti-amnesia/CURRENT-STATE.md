# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-A5

## Son durum

- **Tarih:** 2026-10-12
- **Son tamamlanan:** K3P-A4 (K-O, AKIS §3 "Zaman bütçesi"): oturum seçilen dakikaya sığıyor. Görev üst sınırı = `seçilen dk ÷ ölçülmüş görev başına süre` (taban **6 sn**, K3P-03); bütçe en düşük R'li (unutulmaya en yakın) tekrarları alır, **ısınma K3P-A3 gereği en kararlı (s) 3–5'tir ve kırpmadan muaftır**, taşan tekrarlar ertesi gün yine vadeli kalır (kart verisi yazılmaz; yalnız plan sırası değişir). **Bugün ekranı tahmini de bütçeyle hizalandı:** gösterilen tekrar sayısı sığan planla aynı, `~dk ≤ seçilen`. Önce: K3P-A3 (nefes ritmi).
- **Dal:** `kao3-premium`. `main` = beşinci ara yayın `20261011d` (K3P-A3 + K3P-15 dahil, canlıda). Dal `main`'in 1 commit önünde (K3P-A4, yayında değil).
- **Yeni oturum:** `kao3-premium/STARTER.md` içindeki metni yapıştır.
- **Kanıt düzeyi:** kaynak/headless · görsel QA yalnız K3P-00 "önce" çizgisi · cihaz yok.

## Ölçü panosu (taban → hedef)

| Ölçü | Şimdi | Hedef |
| --- | --- | --- |
| Çift şıklı görev (yerleşik) | 0/1127 ✓ | 0 |
| Okunuş hatası (vasl + idgâm) | 0 + 0 ✓ | 0 |
| Ders başına dokunuş (varsayılan açık) | 39 ✓ | ≤ 40 |
| Art arda edilgin ekran | 1 ✓ (K3P-A3; özet hariç) | ≤ 1 |
| İlk yeni içeriğe dokunuş | 7 ✓ (K3P-A3) | ≤ 7 |
| Oturum süresi (seçilen dk) | ≤ seçilen ✓ (K3P-A4) | ≤ seçilen |
| Ders başına overlay yeniden kurulumu | 0 ✓ (K3P-A1) | 0 |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 13 | ≤ 5 |
| `App.kao*` sayısı | 45 ✓ | 45 |

## Açık riskler

- **Çalışma zamanı bütçesi dar:** 124,6 / 128 KiB; yaklaşık 3,4 KiB pay kaldı (K3P-A1 +1,5, A2 +0,4, A3 +1,3, K3P-15 +1,3, **K3P-A4 +1,3 KiB**). Kod ekleyen kartlar (A5, 11–13, 16–18, 20, 22–24) bu payı paylaşır. Önce eski kod silinir; yetmezse tavan kararı kullanıcıdan istenir.
- **Kapı kararı K-Q:** Kart kapanışında hedefli kapı; K3P-A4 promptu `kapi-hizli --kart K3P-A4 --yavas` (yavaş testler zorunlu) istedi ve koşuldu. Hızlı kapının tamamı ve tam kapı dalga sonunda (sıradaki K3P-A8).
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/core/quranLearnFlow.js`. Ara yayın yöntemi: ortak sürümle tek geçiş; ortak sürümü kullanmayan pinler için `test_asset_pin_freshness` katı modda koşulur ve ayrıca yükseltilir.
- **K3P-A4 bütçe tabanı kararı:** Ölçüm geçmişi olmayan kullanıcıda görev başına süre **6 sn** alınır → 5 dk ≈ 50 görev; mevcut ders planı (≤41 görev) kırpılmaz. Bütçe pratikte yalnız **yavaş ölçülmüş** kullanıcıda bağlayıcı olur. "Seçilen dakikaya sığma" bu nedenle ölçülmüş süreye dayanır (K3P-03 tabanı), gösterilen `~dk` zaten `capMinutes` ile sınırlıdır. Kullanıcı bunu onayladı (2026-10-12).
- **Isınma vs bütçe çelişkisi:** K3P-A3 "ısınma = en yüksek `s`" ile K3P-A4 "en düşük `R` önce" çakışıyordu. **Kullanıcı kararı (2026-10-12):** ısınma en yüksek `s` kalır ve kırpmadan muaftır; bütçe kırpması ve kalan tekrarların plan sırası en düşük R'den. K3P-A3 testi (`test_k3p_rhythm`) bu yüzden korundu.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** Hedef ekranı ilk görevden önce geliyor; `targets.flow.tapsOpenToFirstTask: 2` ile çatışıyor (ölçülen 3, `akis-olc` "1) Açılış → ilk görev: 3"). Karar kullanıcıda.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1` ile koşar; mutlak tavanlar zorunludur (K3P-A4: runtime 124,6/128 KiB, css 13,07/14 KiB, p95 6,7–12 ms).
- **Yavaş testler:** `test_kao2_kabul` (~230–530 sn), `test_kao2_grammar_tasks` (~170–290 sn), `test_kao2_denetim` (~35–50 sn). K3P-A4'te üçü de koşuldu ve yeşil.
- **Tam kapı** `bash tools/kapi/kapilar.sh` 10 dakikadan uzun sürer; yalnız dalga sonlarında (`waveEnd`, sıradaki K3P-A8) koşar.
- **Deney raporu (K3P-05):** gerçek yedeği yalnız kullanıcı verir; ajan yalnız `--ornek` ile doğrular.
- **Okunuş kapısı zorunlu (K3P-04'ten beri):** `okunus-denetim.cjs` exit 0 (K3P-A4'te korundu).
- **L2 önerisi:** Okunuş kıraat hocası incelemesi bekliyor: K3P-04 (19 başlık) ve K3P-04B (341 başlık) — `kao3-premium/kanit/K3P-04/`, `K3P-04B/okunus-degisen.md`.
- **Görsel QA Chrome yolu:** `tools/kapi/gorsel-qa/cdp.mjs` varsayılanı bu makinede yok; K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
