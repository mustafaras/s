# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-00

## Son durum

- **Tarih:** 2026-10-10
- **Son tamamlanan:** — (henüz kart uygulanmadı; plan v3 hazır)
- **Dal:** Plan, 2026-10-10'da `main`'e girdi ve push edildi (kullanıcı isteği, LEDGER seq 4). Henüz uygulama kodu değişmedi. Çalışma dalı `kao3-premium`'u K3P-00 açar.
- **Yeni oturum:** `kao3-premium/STARTER.md` içindeki metni yapıştır.
- **Kanıt düzeyi:** Kaynak/headless. Görsel QA ve cihaz kanıtı yok.

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

- **Çalışma zamanı bütçesi dar:** 118,1 / 128 KiB, yaklaşık 10 KiB pay. Kod ekleyen kartlar (A3, A5, 11–13, 16–18, 20, 22–24) bu payı paylaşır. Önce eski kod silinir; yetmezse kullanıcıdan tavan kararı istenir.
- **Perf göreli bandı `main`'de de kırmızı** (bu makinede steady p95 7,4 ms > 5,09 ms). Kapılar `KAO2_ACCEPT_SLOW_HOST=1` ile koşar; mutlak tavanlar zorunludur.

- **Yavaş testler:** `test_kao2_kabul` (526 sn), `test_kao2_grammar_tasks` (286 sn) ve `test_kao2_denetim` (51 sn) hızlı kapıda varsayılan olarak atlanır. Ders planına ya da görev kurucusuna dokunan prompt'lar (01, A3, A4, A5, 16, 17, 18) bunları `--yavas` ile koşar.
- Tam kapı `bash tools/kapi/kapilar.sh` 10 dakikadan uzun sürüyor. Her prompt'ta hızlı kapı
  (`kapi-hizli.mjs`) çalışır; tam kapı yalnız dalga sonlarında (`waveEnd`).
- Prompt'lar ve araçlar `cift-sik.cjs` ile `okunus-denetim.cjs` betiklerinin bugün exit 1
  verdiğini biliyor. Bu iki betik, sırasıyla K3P-01 ve K3P-04'ten sonra kapıya girer.
- Kaynakçadaki atıflar çevrimiçi doğrulanmadı. Yazı tipi alt kümesinin boyutu henüz ölçülmedi.

## Devir notu

—
