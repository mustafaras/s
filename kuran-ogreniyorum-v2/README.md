# KAO2 — Kur'an Arapçası Öğreniyorum · Yeniden Tasarım Programı

> **Durum:** UYGULAMA AKTİF · G0 kapalı · KAO2-00…01 tamamlandı (2/28) · sıradaki kart **KAO2-02**
> **Kapsam:** YALNIZ `Kur'an Arapçası Öğreniyorum` modülü — hub kartı, tam ekran
> modal ve içindeki bütün ekranlar. Başka yüzeye dokunulmaz.
> **Makine durumu:** [`KAO2-STATE.json`](KAO2-STATE.json) · **Şimdiki durum:** [`.anti-amnesia/CURRENT-STATE.md`](.anti-amnesia/CURRENT-STATE.md) · **Kayıt defteri:** [`.anti-amnesia/LEDGER.md`](.anti-amnesia/LEDGER.md)
> **Uygulamaya başlamak için:** [`UYGULAMA-PROMPTLARI.md`](UYGULAMA-PROMPTLARI.md) §0'daki oturum başlatıcıyı yapıştır.
> **Senkron denetimi:** `node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs`

## Neden bu program var

KAO (30 kart) ve KAO-FIX (27 kart) kapandı: FSRS, kuyruk, telaffuz, 524 doğrulanmış
lemma, 20 kısa sûre, 25 gramer kavramı üretimde. **Motor sağlam, deneyim değil.**
Sıfırdan başlayan biri modalı açınca nereden başlayacağını, ne öğreneceğini,
nasıl ilerleyeceğini bilemiyor. Tasarım dili Apple HIG ile uyumsuz, zengin
içeriğin önemli bir kısmı kullanıcıya hiç gösterilmiyor.

Bu program **motoru korur, deneyimi yeniden kurar.**

## Okuma sırası

| # | Belge | Ne cevaplar |
|---|---|---|
| **Analiz** | | |
| 01 | [01-ANALIZ-KULLANICI-YOLCULUGU.md](01-ANALIZ-KULLANICI-YOLCULUGU.md) | Sıfır kullanıcı modalı açınca adım adım ne yaşıyor? Nerede kayboluyor? |
| 02 | [02-ANALIZ-TASARIM.md](02-ANALIZ-TASARIM.md) | Apple HIG'e göre görsel ve etkileşim hataları neler? (CSS/kod kanıtıyla) |
| 03 | [03-ANALIZ-ICERIK-PEDAGOJI.md](03-ANALIZ-ICERIK-PEDAGOJI.md) | İçerik envanteri, plan-kod uçurumu, pedagojik kusurlar |
| **Plan** | | |
| 04 | [04-BILIMSEL-TEMEL.md](04-BILIMSEL-TEMEL.md) | Hangi bulgu hangi tasarım kararına dönüşüyor? |
| 05 | [05-HEDEF-DENEYIM.md](05-HEDEF-DENEYIM.md) | Yeni bilgi mimarisi, ilk açılış, "sıradaki adım" motoru, ders anatomisi, ekranlar |
| 06 | [06-TASARIM-SISTEMI.md](06-TASARIM-SISTEMI.md) | Apple uyumlu KAO bileşen ve token sözleşmesi |
| 07 | [07-MUFREDAT-VE-ICERIK.md](07-MUFREDAT-VE-ICERIK.md) | Zengin ama takip edilebilir müfredat; içerik üretim kuralları |
| 08 | [08-TEKNIK-PLAN.md](08-TEKNIK-PLAN.md) | Veri modeli, `migrate`, handler yüzeyi, pinler, testler |
| 09 | [09-YOL-HARITASI.md](09-YOL-HARITASI.md) | Dalgalar, kartlar, kabul ölçütleri, kapılar |
| 10 | [10-KARARLAR.md](10-KARARLAR.md) | Bütçe, dosya bölme, hece sesi, dinî metin incelemesi kararları (G0) |
| **Uygulama** | | |
| — | [UYGULAMA-PROMPTLARI.md](UYGULAMA-PROMPTLARI.md) | 28 kartın tek dosyada sıralı komut istemleri + ortak protokol |
| — | [.anti-amnesia/](.anti-amnesia/) | CURRENT-STATE (şimdi) + LEDGER (yalnız eklenen geçmiş) |

## Değişmez kurallar (her kart için)

1. **Kapsam kilidi:** KAO dosyaları (`app/core/quranLearn*.js`, `app/kao.css`,
   KAO içerik modülleri), `tests/kao/`, KAO araçları (`tools/kao*`), bu klasör.
   Zorunlu yan dokunuşlar yalnız kartta adı geçtiğinde: `app.js` `App.kao*` shim
   satırı, dört yükleme sırası listesi, `sw.js`, fx2/iip_22 pinleri, panel KAO
   satırı (KAO2-25). Hub kartını çağıran satır (`app/core/saygi.js` `kaoHub()`) değişmez.
2. **Motor korunur:** FSRS portu, kuyruk bütçesi, R-A1…R-A8 kuralları, gizlilik
   (ses kaydı yalnız bellekte), bağımsızlık sözleşmesi aynen kalır. Değişen şey
   *sunum, akış ve içerik katmanı*dır.
3. **Veri güvenliği:** eski her `data.quranLearn` `migrate()` sonrası geçerli kalır;
   kullanıcı ilerlemesi (kartlar, günlükler, taşlar) asla sıfırlanmaz. Tarayıcı
   açılmaz; doğrulama `run-seyma` + `tests/kao/` ile yapılır (CLAUDE.md DATA SAFETY).
4. **Arapça içerik elle yazılmaz:** yalnız `tools/kao-lexicon-build.mjs` /
   `kao-content-freeze.mjs` hattından (D-12). Türkçe açıklama metinleri elle
   yazılabilir, ama doğrulama kaydı ister (07 §5).
5. **Pin tuzakları:** yeni `App.kao*` handler fx2/v3/surface pinlerini kaydırır;
   KAO yayın pini `index.html`, `sw.js`, `tests/app/test_iip_22.js` üçlüsünde
   birlikte güncellenir. Yorumlarda handler ataması ya da tıklama niteliği adı yazılmaz.
6. **Kanıt düzeyleri ayrı raporlanır:** kaynak/test, yayın, cihaz kabulü.
   Push/deploy/tag kullanıcı onayı olmadan yapılmaz.

## Başarının tanımı (kuzey yıldızı)

> Sıfırdan başlayan biri modalı açtığı **ilk 60 saniyede** ne öğreneceğini,
> bugün ne yapacağını ve bir sonraki adımı bilir; **ilk 7 günde** Fâtiha'yı
> kelime kelime anlar; hiçbir ekranda "şimdi ne yapmalıyım?" diye düşünmez.

Ölçülebilir hedefler [09-YOL-HARITASI.md](09-YOL-HARITASI.md) "Kabul ölçütleri" bölümünde.
