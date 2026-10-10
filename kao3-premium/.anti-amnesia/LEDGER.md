# K3P · LEDGER (yalnız sona ekleme yapılır)

Her prompt kapanışta bu dosyanın **sonuna** bir kayıt ekler. Eski kayıtlar değiştirilmez; bir
kayıt yanlışsa yeni bir `DÜZELTME` kaydıyla düzeltilir. Kayıt şablonu:

```text
## seq N · K3P-NN · <TÜR: KART | DEVİR | DÜZELTME | PLAN>
- Tarih: YYYY-MM-DD
- Commit: (bu commit) | yok (devir)
- Yapılan: <1–3 madde>
- Ölçüler: <ölçü: önce → sonra>
- Kapı: kapi-hizli <0/1> · kapilar.sh <yeşil/kırmızı/koşulmadı>
- Kanıt düzeyi: kaynak/test · görsel QA <var/yok> · cihaz <var/yok>
- Gözlem: <kapsam dışı görülen şey ya da —>
- Sıradaki: K3P-NN
```

---

## seq 1 · — · PLAN
- Tarih: 2026-10-10
- Commit: yok (main üzerinde, commit edilmemiş; K3P-00'da commit edilecek)
- Yapılan: `kao3-premium/` kuruldu. ANALIZ (B-01…06, E-1…5, T-1…7), TASARIM v1, KARTLAR v1 ve
  araçlar (`cift-sik`, `okunus-denetim`, `ekran-dok`) eklendi.
- Ölçüler: çift şık 631/1127 · vasl 18 · idgâm 274 · tanıma %93
- Kapı: koşulmadı
- Kanıt düzeyi: kaynak/headless · görsel QA yok · cihaz yok
- Gözlem: —
- Sıradaki: —

## seq 2 · — · PLAN
- Tarih: 2026-10-10
- Commit: yok
- Yapılan: Kullanıcı "en bilimsel şekilde karar ver" dedi. KARARLAR K-A…K-J ve hipotezler H1–H6
  yazıldı. TASARIM v2 "Tezhip" eklendi. Yeni araç `dokunus-olc`. ANALIZ'e kök neden (§6) ve
  ölçüm tabanı (§7) eklendi.
- Ölçüler: ders başına dokunuş 69 (otomatik geçiş açıkken 39)
- Kapı: koşulmadı
- Kanıt düzeyi: kaynak/headless
- Gözlem: CSV dışa aktarımı kart istatistiği taşımıyor; bu yüzden deney ölçümü bir JSON yedeğinden
  okunacak.
- Sıradaki: —

## seq 3 · — · PLAN
- Tarih: 2026-10-10
- Commit: yok
- Yapılan: Kullanıcı "öğrenme akışında kalabilmeli" dedi. AKIS.md, kararlar K-K…K-O, Dalga A
  (8 kart) ve araç `akis-olc` eklendi. Dosya-dosya pin gerçeği tespit edildi; buna göre "pin
  yalnız K3P-27'de yükseltilir" kararı alındı. Kullanıcı prompt listesi istedi; PROMPTLAR,
  BAGLAM-YONETIMI, anti-amnezi dosyaları ve `senkron` ile `kapi-hizli` araçları eklendi.
- Ölçüler: art arda edilgin ekran 6 · ilk yeni içeriğe 21 dokunuş · derste 7 overlay yeniden
  kurulumu · toast z-index 10000 > overlay 380
- Kapı: `kapilar.sh` taban koşusu başlatıldı; 10 dakikayı aştı.
- Kanıt düzeyi: kaynak/headless
- Gözlem: —
- Sıradaki: K3P-00

## seq 4 · — · PLAN
- Tarih: 2026-10-10
- Commit: (bu commit, `main`)
- Yapılan:
  - Kullanıcı "canlıya alalım push merge" dedi. Plan klasörü, CLAUDE.md ve AGENTS.md'ye eklenen K3P yönlendirme satırı ve `STARTER.md` `main`'e commit edildi ve push edildi. Uygulama koduna dokunulmadı.
  - K3P-00 prompt'u yeni duruma uyarlandı: artık yalnız dalı açıyor, görsel temel çizgiyi alıyor ve taban ölçümlerini yapıyor.
  - Hızlı kapı, 3 yavaş testi (`kabul` 526 sn, `grammar_tasks` 286 sn, `denetim` 51 sn) yalnız `--yavas` bayrağıyla koşacak şekilde ayarlandı.
- Ölçüler: kapi-hizli --kart K3P-00 → yeşil
- Kapı: kapi-hizli 0 · kapilar.sh: perf göreli bandı dışında yeşil (taban)
- Kanıt düzeyi: kaynak/headless · görsel QA yok · cihaz yok
- Gözlem: Yayın yalnız doküman ve araç içeriyor. Pages yeniden yayınlanır ama uygulamanın davranışı değişmez.
- Sıradaki: K3P-00

## seq 5 · K3P-00 · KART
- Tarih: 2026-10-10
- Commit: (bu commit)
- Yapılan:
  - `kao3-premium` yerel dalı `main` 02fda4f2'den açıldı. Uygulama koduna dokunulmadı.
  - Görsel temel çizgi: `test_local_visual_qa_guard` yeşil; `shoot-modal.mjs` 390 px açık ve koyu temada 58'er görünüm çekti (sunucu yok, boş geçici profil, atlanan çekim 0). `kanit/onceki/` altına `kontak-acik.jpg`, `kontak-koyu.jpg` (PIL) ve birleşik `log.txt` kondu; iki çekimde de `origin: http://127.0.0.1:9000 token:false force:null`.
  - Taban ölçümleri yeniden alındı; hepsi `K3P-STATE.baseline` ile birebir tuttu.
- Ölçüler: çift şık yerleşik 631/1127, yeni 1/1087 (exit 1, beklenen) · vasl 18 · idgâm 274 (exit 1, beklenen) · dokunuş u01.01 69 kapalı / 39 açık · akış: açılış→ilk görev 2 dokunuş, u01.02 30 görev + 7 ara ekran (427 sözcük), en uzun görev dizisi 20, yarıda bırakınca devam ipucu yok (`idx` 8 → 0) · perf: content 183,939 KiB · runtime 118,105 KiB · css 13,035 KiB · p95 5,483 ms · steady 3,049 ms ≤ bant 6,360 ms
- Kapı: kapi-hizli 0 · kapilar.sh koşulmadı (dalga sonu değil)
- Kanıt düzeyi: kaynak/test · görsel QA var (önce çizgisi, sentetik veri) · cihaz yok
- Gözlem:
  - `tools/kapi/gorsel-qa/cdp.mjs` varsayılan Chrome yolu (ms-playwright chromium-1243) bu makinede yok; önbellekte 1208 ve 1247 var. Kod değiştirilmedi; çekimler `KAO_QA_CHROME=…/chromium-1247/…` ile alındı. K3P-26'da aynı değişken gerekir.
  - `shoot-modal.mjs` görev çekimlerinin bir kısmını `l07-gorev-undefined` gibi adlandırıyor (görev türü etiketi boş geliyor); yalnız dosya adı, görüntü doğru.
  - Perf göreli bandı bu koşuda bant içindeydi (main'deki 7,4 ms ölçümünün aksine); bant makine yüküne duyarlı.
- Sıradaki: K3P-01
