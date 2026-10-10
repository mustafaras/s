# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-01

## Son durum

- **Tarih:** 2026-10-10
- **Son tamamlanan:** K3P-00 (+ seq 6 düzeltmesi). `kao3-premium` dalı açıldı. Görsel temel çizgi `kanit/onceki/` altında: açık ve koyu temada 58'er görünümün kontak sayfası ve `log.txt` (`token:false force:null`). Taban ölçümleri yeniden alındı; kayıtlı tabanla birebir tuttu.
- **Dal:** `kao3-premium` (yerel; `main` 02fda4f2'den). Push yok. Uygulama koduna henüz dokunulmadı.
- **Yeni oturum:** `kao3-premium/STARTER.md` içindeki metni yapıştır.
- **Kanıt düzeyi:** kaynak/headless · görsel QA yalnız "önce" çizgisi (sentetik veri) · cihaz yok.

## Ölçü panosu (taban → hedef)

| Ölçü | Şimdi | Hedef |
| --- | --- | --- |
| Çift şıklı görev (yerleşik) | 631/1127 | 0 |
| Okunuş hatası (vasl + idgâm) | 18 + 274 | 0 |
| Ders başına dokunuş | 69 | ≤ 40 |
| Art arda edilgin ekran | 6 | ≤ 1 |
| İlk yeni içeriğe dokunuş | 21 | ≤ 7 |
| Ders başına overlay yeniden kurulumu | 7 | 0 |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 13 | ≤ 5 |
| `App.kao*` sayısı | 45 | 45 |

## Açık riskler

- **Çalışma zamanı bütçesi dar:** 118,1 / 128 KiB; yaklaşık 10 KiB pay kaldı. Kod ekleyen kartlar (A3, A5, 11–13, 16–18, 20, 22–24) bu payı paylaşır. Önce eski kod silinir; yetmezse tavan kararı kullanıcıdan istenir.
- **Perf göreli bandı makine yüküne duyarlı.** `main`'de kırmızıydı (steady p95 7,4 ms > 5,09 ms), K3P-00 koşusunda bant içindeydi (steady 3,05 ms ≤ 6,36 ms). Kapılar `KAO2_ACCEPT_SLOW_HOST=1` ile koşar; mutlak tavanlar zorunludur.
- **Yavaş testler:** `test_kao2_kabul` (526 sn), `test_kao2_grammar_tasks` (286 sn) ve `test_kao2_denetim` (51 sn) hızlı kapıda varsayılan olarak atlanır. Ders planına ya da görev kurucusuna dokunan prompt'lar (01, A3, A4, A5, 16, 17, 18) bunları `--yavas` ile koşar.
- **Tam kapı** `bash tools/kapi/kapilar.sh` 10 dakikadan uzun sürer; yalnız dalga sonlarında (`waveEnd`) koşar. Her prompt'ta hızlı kapı (`kapi-hizli.mjs`) koşar.
- **Beklenen kırmızılar:** `cift-sik.cjs` ve `okunus-denetim.cjs` bugün exit 1 verir. Sırasıyla K3P-01 ve K3P-04'ten sonra kapıya girerler.
- **Görsel QA Chrome yolu:** `tools/kapi/gorsel-qa/cdp.mjs` varsayılanı (ms-playwright chromium-1243) bu makinede yok. K3P-26'da `KAO_QA_CHROME="$HOME/Library/Caches/ms-playwright/chromium-1247/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"` ver.
- Kaynakçadaki atıflar çevrimiçi doğrulanmadı. Yazı tipi alt kümesinin boyutu henüz ölçülmedi.

## Devir notu

—
