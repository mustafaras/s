# KAO2-01 — Taban ölçüm ve referans dökümler
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: b66a9e8

## Yapılan
- İlk uygulama f09987f5 üzerinden başladı; BLOCKED b66a9e8/seq 8 ile kaydedildi. Kullanıcının “blocked durumu çözmelisin” talimatıyla önerilen tek denetleyici dosyası kapsamı onaylandı; Dokun listesi eşlendi.
- Mevcut performans fixture'ına yalnız açık KAO2_WRITE_BASELINE=1 yazma modu eklendi. 20 tekrar, p95 hesabı, 40 ms ve taban +%25 kapıları aynen korunur. wx bayrağı tabanın üzerine yazılmasını engeller; normal test salt okunur.
- perf-baseline.json: Node v26.3.1, p95 5,087625 ms, içerik 162173 B, runtime 50221 B, CSS 7051 B gzip.
- 11 KAO görünümü × boş/tohumlu =22 dialog; izole hub ve canonical driver saygi sekmesi ile 24 HTML. Manifest her çıktının boyut/SHA256 değerini taşır.
- Özel VM betiği /tmp içinde çalıştı; metni dump-generator.cjs.txt içinde. Sabit 2026-09-28T09:00:00Z, sentetik 12 lemma ×2 yön tekrar kartı; gerçek ağ, depo, timer, hesap veya kullanıcı verisi yok. İkon SVG'leri özel VM'de boş stub; bunlar görsel ekran görüntüsü değil HTML referanslarıdır.
- Driver --dump saygi kendi /tmp/seyma-dump.html çıktısını verdi; KAO hub varlığı doğrulanıp before-app-saygi.html'e alındı.
- Eski denetleyicide yalnız iki regex değişti: KAO2-00…27 tanınır ve kart sayımına girer. Bilinmeyen/bozuk önekler reddedilir, eski scope ve yasak kontrolleri korunur. Yeni programın ayrıntılı kart kapsamı bu eski araca taşınmadı.

## TDD
- Artefakt kabul kırmızısı: verify-evidence.cjs → `performans tabanı eksik`; üretimden sonra PASS.
- Prefix testi ilk kurulumda bir relatif yol hatası düzeltildi; anlamlı kırmızı: verify-prefix.mjs → `KAO2-00: tamam`, true !== false. Regex düzeltmesinden sonra PASS.
- Prefix testi 28 kartın normal/BLOCKED başlıkları, kart sayımları, 28/99/001/1/geçersiz son ek ve bilinmeyen önek reddi, eski KAO/FIX/ARSIV kabulünü kapsar.
- Taban ilk yazma 5,088 ms PASS; salt-okur tekrar 3,865 ms PASS. İkinci yazma beklenen EEXIST; taban baytları korunur.
- Nihai P3 ölçümü: KAO2 perf: PASS (content 158.372 KiB · runtime 49.044 KiB · css 6.886 KiB · p95 4.050 ms)

## Kapılar
| Kapı | Sonuç |
|---|---|
| P3 syntax: app.js, sync.js, quranLearn.js, quranLexiconV1.js, kao-lexicon-build.mjs | 5 PASS |
| KAO fixture | 18/18 PASS |
| app fixture | 77/77 PASS |
| panel fixture | 23/23 PASS |
| panel-v2 fixture | 27/27 PASS |
| quran fixture | 9/9 PASS |
| reminder smoke | PASS, 21 curated fixture |
| driver | PASS |
| zikr harness | 95/95 PASS |
| kontrast | 336 çift, 0 ihlal |
| eski kao-plan-check | PASS, 3 eski WARN |
| eski kao-plan-check --self-test | 19/19 PASS |
| verify-prefix.mjs | PASS |
| verify-evidence.cjs | PASS |
| taban ve 24 HTML hash korunumu | PASS |
| kao2-sync-check | PASS: 2/28 done, next KAO2-02, seq 10 |

P3 yeniden çalıştırıldı: 163/163 exit 0; komutlar ve çıktı hash'leri gate-receipts.json. Flow/Views/Curriculum henüz yok; koşullu syntax uygulanamaz. Ek eski plan kapısı plan-check.log içinde: iki taban öncesi commit ve değişmemiş MediaRecorder/save kaynak uyarısı, FAIL değil. Mevcut KAO gizlilik fixture'ı PASS. İlk BLOCKED kanıtı BLOCKED-ILK-KANIT.md içinde korunur.

## Ölçümler
- quranLearn.js 1899 satır; kao.css 93 satır.
- font-weight: 600×1, 700×4, 750×5, 760×1, 780×1, 800×21, 850×8, 900×9, 950×2; 9 farklı değer.
- .kao-link-button CSS metni 2, runtime sınıf metni 13; KAO handler 35.
- Ayrıntı source-metrics.json. Tabanın göreli tavanı 6,35953125 ms; Node VM ölçümü cihaz performansı değildir.

## Bilerek değişen testler / kanıt düzeyi
Mevcut beklenti gevşetilmedi. Perf testine yalnız taban yazma modu eklendi; yeni prefix testinde bilinmeyen önek reddi negatif örneklerle korunuyor. Üretim kodu, içerik, cache pini ve handler yüzeyi değişmedi.
Kaynak/test: PASS. Yayın: yok; push/deploy/tag/main merge yapılmadı. Cihaz: yok; tarayıcı/sunucu açılmadı. HTML ve headless sonuçları cihaz kabulü değildir.

## Kalan sınırlar
Bu kartın BLOCKED nedeni çözüldü. Ausubel birincil teyit uyarısı ve ileriki G2/G3/K-3/L2 kararları aynen açık; bu kartı engellemiyor. KAO2-02 çalıştırılmadı.
