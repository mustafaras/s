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
