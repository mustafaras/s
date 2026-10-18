# K3P · CURRENT-STATE

Sıradaki prompt: K3P-27 (yayın kanıtı bekleniyor)

## Son durum

- **Tarih:** 2026-10-18.
- **Son tamamlanan:** **K3P-26 — Son görsel QA, ölçüm ve kapanış** (Dalga 5). K3P-27 yayın kartı çalışıyor; dağıtım kanıtı sonrası 37/37 kapanacak.
- **Yetki:** Kullanıcı 2026-10-18'de “sıradaki adım dan devam et ve tümünü canlıya al” dedi. Bu, K3P-27 için açık yayın yetkisidir. Kişisel veri/`mustafaras/seyma-data`, gerçek hesap tarayıcısı ve cihaz kabulü kapsam dışıdır.
- **Yayın durumu:** `releaseApproval=APPROVED-2026-10-18`. Pin **20261018a** hazır; tam yerel kapı geçti. GitHub Pages koşusu ve canlı GET/SHA-256 eşliği bekleniyor. `pinDeferral.files=[]`.

## K3P-26 sonucu

- **Görsel QA:** Guard 1 testi 10/10 PASS. `shoot-modal.mjs` ile 320/390/460 px × açık/koyu ölçülerinde 6 ayrı boş profil kullanıldı; toplam **474 sentetik ekran**. Her görünümde `overflowX=false`. Tarama **15 bilgi amaçlı yatay kaydırma alanı** buldu (6 sûre seçicisi, 2 gramer tablosu, 7 ders tablosu); istenmeyen taşma/kırpılma yok. Kayıtlar ve altı kontakta değerlendirilir: [`KAPANIS.md`](../KAPANIS.md) ve [`kanit/sonraki/`](../kanit/sonraki/).
- **Ölçüm:** Çift şık 0; vasl/idgâm hatası 0; `App.kao*` 45. Otomatik geçiş açıkken dokunuş 42 (hedef ≤40); hedef ekranı 62 sözcük (AKIS §3 ① hedefi ≤25); açılıştan ilk göreve 3 dokunuş (hedef ≤2). Toplam kelime görevlerinde tanıma payı yeni kullanıcıda %92,92, yerleşik kullanıcıda %91,57 (hedef ≤%60 değil); karışık tekrar örneği ayrı olarak %48,94.
- **Perf:** İçerik 184,591 KiB, runtime L6 133,061 KiB, CSS L9 15,877 KiB; K3P-18'de onaylanan 136 KiB runtime tavanı ve güncel 16 KiB CSS tavanı içinde. Tam kapı perf koşusu p95 20,099 ms / steady 6,770 ms; `KAO2_ACCEPT_SLOW_HOST=1` göreli p95 kıyasını atladı, mutlak bütçeler PASS.
- **Tam kapı:** `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → **exit 0, TÜM KAPILAR YEŞİL**. KAO 82, app 78, panel 23, panel-v2 27, quran 9; reminders, run-seyma driver/zikr, kontrast, çift şık, okunuş, plan ve pin senkronu PASS. `tekrar-uret.cjs` bilgilendirme özeti 9/10'dur; tarihsel R-08 araç-modeli bulgusu kalır, 10/10 iddiası yoktur. `kapi-hizli --kart K3P-26` da exit 0 / HIZLI KAPI YEŞİL.
- **Kapsam:** Üretim JS/CSS, `data`, `migrate()` ve `App.kao*` yüzeyi değiştirilmedi. Önce/sonra tabloları [`ANALIZ.md`](../ANALIZ.md) §7 ve [`AKIS.md`](../AKIS.md) §6'da; ayrıntılı sonuçlar ve hipotez takvimi [`KAPANIS.md`](../KAPANIS.md)'te.

## Açık sınırlar

- Gerçek cihaz kabulü, gerçek ekran okuyucu turu, L2 okunuş uzmanı incelemesi ve 230 kayıt incelemesi hâlâ kullanıcı tarafında. Yerel QA bunların yerine geçmez.
- H2–H9'un 14./30. gün ölçümleri KAPANIS.md'de; yeni canlı temel pin hedefi `20261018a`, yayın kanıtıyla kesinleşecek.
- Pages/canlı eşliği ve son durum senkronu yapılmadan program tamamlandı sayılmaz.

## K3P-27 · yayın hazırlığı

- Değişen üretim varlıkları: `app/core/quranLearn.js`, `app/core/quranLearnViews.js`.
- Ortak pin `20261017a → 20261018a`; `index.html`, `panel-v2.html`, `sw.js` ve 12 pin sabiti dahil toplam 15 dosyada 82 pin geçişi. Erteleme listesi boş.
- `tests/app/test_asset_pin_freshness.js`: **61/61 taze**; `tests/app/test_iip_22.js`: **13/13**; `senkron` ve `kao-plan-check`: PASS; `git diff --check`: PASS.
- `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh`: **exit 0, TÜM KAPILAR YEŞİL**. KAO 82, app 78, panel 23, panel-v2 27, quran 9; diğer kayıtlı kapılar PASS. Perf: içerik 184,591 KiB, runtime 133,061 KiB, CSS 15,877 KiB, p95 4,924 ms / steady 3,154 ms. `tekrar-uret` bilgilendirme özeti 9/10; tarihsel R-08 açık.
- Release commit'i GitHub Pages'e taşındıktan sonra run ve no-cache canlı parity kanıtı bu kayda eklenecek.
