# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-03

## Son durum

- **Tarih:** 2026-10-10
- **Son tamamlanan:** K3P-02. Doğru cevap panelinde geri alma yok ve gövde "Doğru" demiyor; yanlış cevapta geri alma "Yanlışlıkla dokundum" (K-C). Özet başlığı yalnız ders adı (B-05). Önceki: K3P-01 (çift şık 0) ve ara yayın `20261010a` (Pages run 38057517473, canlı doğrulandı).
- **Dal:** `kao3-premium`. `main` = ara yayın `b3c97d67` (K3P-01 dahil); K3P-02 ve sonrası yalnız dalda, push yok.
- **Yeni oturum:** `kao3-premium/STARTER.md` içindeki metni yapıştır.
- **Kanıt düzeyi:** kaynak/headless · görsel QA yalnız K3P-00 "önce" çizgisi · cihaz yok.

## Ölçü panosu (taban → hedef)

| Ölçü | Şimdi | Hedef |
| --- | --- | --- |
| Çift şıklı görev (yerleşik) | 0/1127 ✓ | 0 |
| Okunuş hatası (vasl + idgâm) | 18 + 274 | 0 |
| Ders başına dokunuş | 69 | ≤ 40 |
| Art arda edilgin ekran | 6 | ≤ 1 |
| İlk yeni içeriğe dokunuş | 21 | ≤ 7 |
| Ders başına overlay yeniden kurulumu | 7 | 0 |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 13 | ≤ 5 |
| `App.kao*` sayısı | 45 | 45 |

## Açık riskler

- **Çalışma zamanı bütçesi dar:** 118,7 / 128 KiB; yaklaşık 9,3 KiB pay kaldı. Kod ekleyen kartlar (A3, A5, 11–13, 16–18, 20, 22–24) bu payı paylaşır. Önce eski kod silinir; yetmezse tavan kararı kullanıcıdan istenir.
- **Pin ertelemesi (K-P):** Pinli bir dosyayı değiştiren kart, dosyayı `K3P-STATE.json` → `pinDeferral.files` listesine ekler. Eklemezse `test_asset_pin_freshness` kırmızı olur ve onu koşan kabul A-9 ile `kapilar.sh` de düşer. Liste şu an: `app/core/quranLearn.js` (K3P-02'de yeniden değişti; ara yayında pini `20261010a` yapılmıştı). K3P-27 pinleri yükseltip listeyi boşaltır; `main`'de test tam katıdır.
- **Kabul testi yalnız `--yavas` ile koşar.** Pin çatışması bu yüzden plan aşamasında görünmedi; `--yavas` gerektiren kartlarda (A3, A4, A5, 16, 17, 18) aynı türden sürprizlere hazırlıklı ol.
- **Perf göreli bandı makine yüküne duyarlı.** `main`'de kırmızıydı (7,4 ms > 5,09 ms), K3P-00 ve K3P-01'de bant içindeydi. Kapılar `KAO2_ACCEPT_SLOW_HOST=1` ile koşar; mutlak tavanlar zorunludur.
- **Yavaş testler:** `test_kao2_kabul` (~230–530 sn), `test_kao2_grammar_tasks` (~170–290 sn), `test_kao2_denetim` (~35–50 sn) hızlı kapıda varsayılan olarak atlanır.
- **Tam kapı** `bash tools/kapi/kapilar.sh` 10 dakikadan uzun sürer; yalnız dalga sonlarında (`waveEnd`, sıradaki K3P-05) koşar.
- **Beklenen kırmızı:** `okunus-denetim.cjs` exit 1 verir; K3P-04'ten sonra kapıya girer.
- **Dizme görevi ölçütü:** Çift şık ölçümünde dizme görevleri sıra numarasıyla (`ordinal`) ölçülür; âyette tekrar eden sözcük meşrudur (D2F-03, kullanıcı kararı K3P-01).
- **Görsel QA Chrome yolu:** `tools/kapi/gorsel-qa/cdp.mjs` varsayılanı (ms-playwright chromium-1243) bu makinede yok. K3P-26'da `KAO_QA_CHROME="$HOME/Library/Caches/ms-playwright/chromium-1247/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"` ver.
- Kaynakçadaki atıflar çevrimiçi doğrulanmadı. Yazı tipi alt kümesinin boyutu henüz ölçülmedi.

## Devir notu

—
