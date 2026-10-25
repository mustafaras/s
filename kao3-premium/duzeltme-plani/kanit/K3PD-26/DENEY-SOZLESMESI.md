# K3PD-26 — deney raporu ölçüm sözleşmesi

Durum: K3PD-26 bağımsız PASS (seq153); H7 yerel gün ve exact allowlist düzeltmeleri kapatıldı. Başlangıç HEAD `4e451288a71ae5123886e5d4ef20e46fca605c50`, dal `k3pd-denetim-duzeltmeleri`.

## Rapor sınırları

- H7 seçili `kesim` gününü ve `bugun` gününü dahil eden `[kesim, bugun]` aralığında hesaplanır. Hedef kararını yalnız bu aralıktaki en az 5 cevaplı günler belirler. Kesim öncesi günlerin özeti ve bugüne kadarki tüm dönem özeti ayrı etiketlenir. `bugun` verilmezse çalışma ortamının yerel takvim tarihi alınır; Europe/Istanbul gece yarısı sınırı fixture ile sınanır; `--ornek` tekrarlanabilir olması için sentetik 2026-02-28 gününü sabitler. Bugünden sonraki günlükler hiçbir H7 özetine girmez. Boş aralık ve cevaplı gün yokluğu `veri yok` üretir.
- H2’nin önce/sonra penceresi 14 gündür; iki pencerede ayrı ayrı en az 20 tekrar cevabı gerekir. Beş yüzde puanlık düşüş dahildir. Pencere eşiği değişmez.
- H4 yalnız açıkça verilen K3PD-02 onaylı ilk tam UTC gün başlangıcı `R+1` tarihinden sonraki geçerli `s21={n,ok}` çiftlerini sayar. Önceki günler `LEGACY_INVALID` olarak dışarıda kalır; sayaç eksik, negatif, kesirli veya `ok > n` ise o günlük sayaç geçerli kohort gözlemi olmaz. Geçerli yeni sayaç yoksa yüzde yazılmaz. R+1 tarihi rapor çağrısında verilmediğinde H4 ölçülmez. Aynı gündeki eski ve yeni sayaçları günlük toplamdan ayırmak mümkün olmadığından rapor bunları geriye dönük tahmin etmez.
- H3, mevcut kart sayaçlarının anlık özeti ve kol karşılaştırmasıdır. Kesim uygulanmaz; 30. gün ya da nedensel deney sonucu değildir. Nedensel etki `NOT_MEASURED` kalır.
- H5’te “ilk çalışma gününden ilk bitirilen derse gün” yalnız proxy’dir; özgün “ilk anlaşılan âyete kadar geçen gün” için uygun olay kaydı yoktur ve `NOT_MEASURED` kalır.
- H9’daki `lapses=0` kart payı yalnız proxy’dir; yeni kelimenin ertesi günkü ilk tekrar doğruluğu değildir. Özgün H9 `NOT_MEASURED` kalır.
- H8 yalnız verilen girdinin snapshot anındaki `resume`/`doneAt` durumunu sayar. Önce/sonra karşılaştırması için tarihli dış snapshot olmadıkça sonuç `NOT_MEASURED` kalır.
- Kesin cevap/olay günlüğü veya yeni veri şeması üretilmez. Yalnız sentetik fixture ile geliştirme/doğrulama yapılır.

## Gizlilik ve yan etki

İzdüşüm yalnız toplu sayaç ve tarihlere izin verir. Bilinmeyen kart durumu, geçersiz tarih ve sayaçlar rapor değeri olmaz. Kart/ders anahtarları, serbest metin, Arapça içerik, token ve parola alanları okunmaz ya da yazdırılmaz. CLI yalnız açıkça verilmiş sentetik dosya girdisini okur; dosya/ağ/storage yazımı yoktur. Bilinmeyen seçenek veya bozuk JSON girdisi ham girdiyi/argümanı hata mesajına eklemeden exit 2 verir.

## Tekrar üretim

Seq149’daki ilk bağımsız FAIL, UTC/yerel gün uyuşmazlığını ve durum allowlist parser uyumsuzluğunu saptadı; bu iki bulgu bu onaylı kart kapsamında düzeltildi. Komut, gerçek exit kodları ve özet çıkışlar [COMMANDS.json](COMMANDS.json)’da. Kullanılan tüm veri sentetiktir. H7 sentetik örneğinde 20/26 tüm dönem oranı `%76,9`, seçili kesim sonrası 7/13 oranı `%53,8` verir; bu nedenle durum `tutmuyor` kalır. K3PD-26 kapı ve test sonucu [EVIDENCE.md](EVIDENCE.md)’de tutulur.
