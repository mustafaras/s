# K3P · CURRENT-STATE

Sıradaki prompt: K3P-27

## Son durum

- **Tarih:** 2026-10-18.
- **Son tamamlanan:** **K3P-26 — Son görsel QA, ölçüm ve kapanış** (Dalga 5). Durum **36/37 kart tamam**; K3P-27 sıradadır.
- **Yetki sınırı:** Bu oturum K3P-26 ile sınırlıydı. K3P-26 prompt'u kontrollü yerel görsel QA'ya açık izin verdi; K3P-27, yayın, pin değişikliği veya cihaz kabulü yetkisi vermez.
- **Yayın durumu:** `releaseApproval=NOT_APPROVED`. Push, merge, tag ve deploy yapılmadı. `pinDeferral.files` K3P-27'ye kadar `app/core/quranLearn.js` ve `app/core/quranLearnViews.js` olarak kalır.

## K3P-26 sonucu

- **Görsel QA:** Guard 1 testi 10/10 PASS. `shoot-modal.mjs` ile 320/390/460 px × açık/koyu ölçülerinde 6 ayrı boş profil kullanıldı; toplam **474 sentetik ekran**. Her görünümde `overflowX=false`. Tarama **15 bilgi amaçlı yatay kaydırma alanı** buldu (6 sûre seçicisi, 2 gramer tablosu, 7 ders tablosu); istenmeyen taşma/kırpılma yok. Kayıtlar ve altı kontakta değerlendirilir: [`KAPANIS.md`](../KAPANIS.md) ve [`kanit/sonraki/`](../kanit/sonraki/).
- **Ölçüm:** Çift şık 0; vasl/idgâm hatası 0; `App.kao*` 45. Otomatik geçiş açıkken dokunuş 42 (hedef ≤40); hedef ekranı 62 sözcük (AKIS §3 ① hedefi ≤25); açılıştan ilk göreve 3 dokunuş (hedef ≤2). Toplam kelime görevlerinde tanıma payı yeni kullanıcıda %92,92, yerleşik kullanıcıda %91,57 (hedef ≤%60 değil); karışık tekrar örneği ayrı olarak %48,94.
- **Perf:** İçerik 184,591 KiB, runtime L6 133,061 KiB, CSS L9 15,877 KiB; K3P-18'de onaylanan 136 KiB runtime tavanı ve güncel 16 KiB CSS tavanı içinde. Tam kapı perf koşusu p95 20,099 ms / steady 6,770 ms; `KAO2_ACCEPT_SLOW_HOST=1` göreli p95 kıyasını atladı, mutlak bütçeler PASS.
- **Tam kapı:** `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → **exit 0, TÜM KAPILAR YEŞİL**. KAO 82, app 78, panel 23, panel-v2 27, quran 9; reminders, run-seyma driver/zikr, kontrast, çift şık, okunuş, plan ve pin senkronu PASS. `tekrar-uret.cjs` bilgilendirme özeti 9/10'dur; tarihsel R-08 araç-modeli bulgusu kalır, 10/10 iddiası yoktur. `kapi-hizli --kart K3P-26` da exit 0 / HIZLI KAPI YEŞİL.
- **Kapsam:** Üretim JS/CSS, `data`, `migrate()` ve `App.kao*` yüzeyi değiştirilmedi. Önce/sonra tabloları [`ANALIZ.md`](../ANALIZ.md) §7 ve [`AKIS.md`](../AKIS.md) §6'da; ayrıntılı sonuçlar ve hipotez takvimi [`KAPANIS.md`](../KAPANIS.md)'te.

## Açık sınırlar

- Gerçek cihaz kabulü, gerçek ekran okuyucu turu, L2 okunuş uzmanı incelemesi ve 230 kayıt incelemesi hâlâ kullanıcı tarafında. Yerel QA bunların yerine geçmez.
- H2–H9'un 14./30. gün ölçümleri KAPANIS.md'de; canlı temel pin `20261017a`, kesim tarihi 2026-10-17.
- `releaseApproval=NOT_APPROVED`. K3P-27'nin kartındaki yayın kapısı ayrıca açık kullanıcı onayı ister.

## Devir

K3P-26 kapanış kaydı LEDGER seq 70'tedir. K3P-27 için sıradaki prompt'u `node kao3-premium/araclar/senkron.mjs --sonraki` ile oku; yeni kartın authority ve yayın sınırlarını tekrar uygula.
