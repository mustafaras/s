# KAO2-01 — BLOCKED: eski plan kapısı KAO2 önekini tanımıyor
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: f09987f5

## Yapılan
- Taban yazma için KAO2_WRITE_BASELINE=1 eklendi; mevcut ölçüm döngüsü/tavanları değişmedi. Açık opt-in, wx ile mevcut dosyanın üzerine yazma yasak.
- perf-baseline.json: Node v26.3.1, p95 5,087625 ms; contentGzip 162173, runtimeGzip 50221, cssGzip 7051 bayt. Tarih ölçümden gelir.
- Boş ve 12 lemma ×2 yön ilerlemeli sentetik durum için home/units/word/reader/settings/gate/phonics/ayah/map/prayer/stats: 22 dialog HTML. İzole hub + canonical driver --dump saygi çıktısı ile toplam 24 HTML.
- Özel betik /tmp/kao2-dumps.cjs olarak çalıştı. 2026-09-28T09:00:00Z sabit saat, ağ/storage/timer yok; gerçek veri yok; ikon SVG stub boş. Betik metni dump-generator.cjs.txt olarak yalnız yeniden üretim kanıtı; repo kökünden geçici konuma kopyalanarak çalıştırılır.
- Canonical driver kendi /tmp/seyma-dump.html çıktısını üretir; kontrol edilerek before-app-saygi.html içine alındı. Gerçek tarayıcı render'ı/ekran görüntüsü değildir.
- Her HTML'nin boyut/hash'i dump-manifest.json içinde.

## TDD
- Kırmızı: node kuran-ogreniyorum-v2/evidence/KAO2-01/verify-evidence.cjs → exit 1, `performans tabanı eksik`.
- Yeşil: aynı komut → PASS (şema, boş/tohumlu dialog farkı, hub).
- KAO2_WRITE_BASELINE=1 node tests/kao/test_kao2_perf_budget.js → PASS, p95 5,088 ms; hemen sonraki salt-okur kontrol 3,865 ms PASS.
- İkinci yazma denemesi beklenen exit 1 EEXIST verdi; tabanın baytları değişmedi. Normal çalışmada yazma yok.
- P3 içindeki tekrar: KAO2 perf: PASS (content 158.372 KiB · runtime 49.044 KiB · css 6.886 KiB · p95 4.053 ms)

## Kapılar
163 komutun makbuzu gate-receipts.json içinde. P3 aileleri: KAO 18/18; app 77/77; panel 23/23; panel-v2 27/27; quran 9/9 PASS. Beş syntax komutu PASS; reminder smoke 21 curated fixture PASS; driver PASS; zikr 95/95 PASS; kontrast 336 çift/0 ihlal. Henüz olmayan Flow/Views/Curriculum syntax kapıları uygulanamaz.

Ek olarak kartın okuttuğu 08-TEKNIK-PLAN.md §7 içindeki `node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs` çalıştırıldı: exit 1, iki FAIL:
- commit f09987f: KAO2-00 öneki tanınmıyor; quranLexiconV1.js, kao-lexicon-build.mjs.
- commit a47a68f: KAO2-00 BLOCKED öneki tanınmıyor; KAO fixture/README ve ses aracı.

Senkron kapısı BLOCKED kayıtlarıyla PASS. Git diff --check PASS. Tüm kapılar yeşil olmadığı için kart done yapılmadı.

## Kaynak ölçümleri
- quranLearn.js 1899 satır; kao.css 93 satır.
- font-weight: 600×1, 700×4, 750×5, 760×1, 780×1, 800×21, 850×8, 900×9, 950×2 (9 farklı değer).
- .kao-link-button CSS seçici metni 2; runtime sınıf metni 13.
- app.js KAO handler ataması 35. Ayrıntı source-metrics.json.

## Bilerek değişen testler
Yalnız izin verilen taban yazma bayrağı eklendi; 40 ms ve taban +%25 tavanı, 20 tekrar ve p95 hesabı değişmedi. Mevcut beklenti zayıflatılmadı. Üretim dosyaları/pinler değişmedi.

## Engel / öneri
Eski denetleyicinin KAO_SUBJECT_RE ve CARD_OF_SUBJECT_RE ifadeleri KAO2 kartlarını kapsamıyor. Dosya KAO2-01 Dokun listesinde değil. Öneri: kullanıcı kapsam onayıyla yalnız bu dosyada KAO2-00…27 öneklerini tanı, tanınmayan önek reddini koru; doğrulamasını bu kartın kanıt alanında yap. Mevcut gate gevşetilmeden tekrar çalıştırılmalı.

## Kanıt düzeyleri / kalan
Kaynak/test: taban, dökümler ve P3 PASS; ek eski plan kapısı FAIL. Yayın yok; cihaz yok; tarayıcı/sunucu yok; push/deploy/tag/main merge yok. KAO2-01 BLOCKED; KAO2-02'ye geçilmedi.
