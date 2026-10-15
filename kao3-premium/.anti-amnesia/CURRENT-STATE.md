# K3P · CURRENT-STATE

Sıradaki prompt: K3P-17

## Son durum

- **Tarih:** 2026-10-15.
- **Son tamamlanan:** K3P-16 — hatırlama merdiveni seçici ve kart düzeyinde A/B ataması. 26/37 kart tamamlandı. K3P-17 açılmadı.
- **Yetki:** kullanıcı 2026-10-15'te yalnız K3P-16 için commit/push/main merge/deploy ve ara pin istisnasını açıkça onayladı. Final K3P-27 releaseApproval=NOT_APPROVED korunur; K3P-17 açılmaz, tag yok.
- **Yayın:** K3P-16 ara yayını doğrulandı; yeni pin **20261015b**, pinDeferral.files boş. Tam kapı yeşil; Pages/canlı eşlik kanıtı beklenir. Önceki yayın makbuzu LEDGER seq 46'dadır.
- **Kanıt:** kaynak/headless ve sentetik veri. Tarayıcı, gerçek hesap, kişisel veri deposu, görsel QA veya cihaz kabulü yok.

## K3P-16 ne yaptı

- Flow.ladderRung: yeni/s<3 R1; 3≤s<10 R2; 10≤s<30 R3; s≥30 R4. Relearning bir basamak indirir; alt sınır R1.
- Flow.ladderArm: tek seededRank('k3p-ladder', cardId) kaynağının paritesinden A/B. Hash kopyalanmadı; seededRank SeymaQuranLearn üzerinden açılır, App üzerinden değil. Atama saklanmaz.
- Kelime görevinde B daima R1; A merdiveni izler, henüz uygulanmamış R3/R4 R2'ye düşer. R1 Arapça→anlam; R2 anlam→Arapça veya planın sesli görevinde ses→anlam. Kart ve görev kimlikleri korunur; veri şeması/migrate()/App.kao* değişmedi.
- H3 raporu yalnız kelime kartlarından kol başına ortalama s ve toplam lapses/toplam reps (reps>0) üretir. Kimlikleri çıktıdan atar; anlık toplu özet kesim uygulamaz ve gerçek 30. gün deney sonucu değildir.
- Yeni test_k3p_ladder: tablo eşikleri, relearning alt sınırı, 1000 kimlikte A=522 (%52,2), ayrı VM determinismi ve 960 donmuş girdi görevinde yön/tek doğru şık/değişmezlik. Deney raporu sentetik elle hesap ve sızıntı kontrolleri genişledi.
- Bağımlı fixture'lar eski kimlik-soneki yön varsayımı yerine gerçek A/R2 ve B/R1 örneklerini kullanır; eski ses, okunuş, cognate, soldurma ve gece tekrar kontrolleri korundu. Minimal queue VM'leri Flow'u yükler; kullanıcı yürüyüşü ekranda üretilmiş görev önbelleğini cevaplar.

## Ölçü panosu

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L6 (bağlayıcı) | 127,560546875 KiB / 130622 B | 128 KiB; kalan 450 B |
| Runtime gzip L9 (perf aracı) | 127,196 KiB | 128 KiB |
| CSS gzip L9 | 15,273 KiB | 16 KiB |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| app.js / sync.js / state.js | değişmedi | veri ve migration korunur |
| Ayrı perf tekrarı p95 / steady | 5,229 / 3,659 ms | mutlak tavanlar PASS |
| KAO fixture envanteri | 74 | 74 PASS |
| Sözleşme/pin fixture'ları | 10 | 10 PASS |
| Çift şık yeni / yerleşik | 0/1087 / 0/1127 | 0 |
| R1 tanıma yeni / yerleşik | 912/1087 (%83,90) / 903/1127 (%80,12) | ≤%60 henüz doğrulanmadı |
| R2 eşleme yeni / yerleşik | 98/1087 / 127/1127 | R3/R4 bu kartta yok |
| Toplam kelime çoktan seçmeli | 1010/1087 (%92,92) / 1030/1127 (%91,39) | tabana göre değişmedi |

## Kapılar ve açık sınırlar

- **node kao3-premium/araclar/kapi-hizli.mjs --kart K3P-16 --yavas → HIZLI KAPI YEŞİL.** KAO 74 (kabul/grammar_tasks/denetim dahil), sözleşme 10, driver, çift şık ve okunuş PASS. İlk tur eski yön/VM/önbellek varsayımlı sekiz fixture/üst-kabul hatası verdi; ilgili fixture düzeltmelerinden sonra tüm kapı tekrar koşuldu ve yeşil. Hiçbir kabul kontrolü kaldırılmadı.
- Ara yayın için tam kapı tekrar koşuldu: KAO 74, app 78, panel 23, panel-v2 27, quran 9 fixture PASS; smoke, driver, zikr, kontrast, çift şık, okunuş, plan ve pin PASS. Migration 67/67 ve 61 benzersiz asset URL tazeliği PASS. Runtime L9 127,196 KiB; p95 9,809 ms / steady 3,859 ms. KAO2_ACCEPT_SLOW_HOST=1 yalnız göreli perf bandını atlar; mutlak tavanlar korunur. Tarihsel tekrar-uret 9/10 özeti tam kapının engelleyici kontrolü değildir; 10/10 iddiası yok.
- R1 payı TASARIM §4 sınıflamasıdır; R2 de çoktan seçmelidir. Eski toplam çoktan seçmeli oranını yeni R1 oranıyla aynı ölçüymüş gibi karşılaştırmak doğru değildir. Toplam çoktan seçmeli payı düşmedi; üretim görevleri K3P-17/18'e aittir. %60 veya öğrenme etkisi başarı iddiası yok.
- Runtime tavanı yükseltilmedi; kalan 450 B sonraki kart için dar bütçedir. Ara yayın pini kullanıcı onayıyla 20261015b olarak yenilendi.
- Tarihsel tekrar-uret.cjs 9/10 kaydı değişmedi: R-08 eski apply.words/sentences modelini sayar. Güncel denetim PASS; 10/10 iddiası yok. akis-olc 2b eski hedef ekranı ölçüsünü kullanır; gerçek ≤25 sözcük kuralı lesson_ayah fixture'ındadır.
- Açılış→ilk görev 3 dokunuş / hedef 2 kararı, gerçek ekran okuyucu, görsel Tezhip/forced-colors ve hedef cihaz kabulü açık kalır. K3P-26'da KAO_QA_CHROME gerekir.

## Devir notu

Yalnız K3P-16 uygulandı; kullanıcı onaylı ara yayın işlemi yürütülüyor. K3P-17'yi yürütme: yeni kart ayrı kullanıcı isteğidir. Kişisel veri/gerçek hesap tarayıcısı açma; seyma-data kapsam dışıdır. Final program yayın onayı verilmedi.
