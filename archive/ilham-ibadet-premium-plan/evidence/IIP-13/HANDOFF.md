# IIP-13 devir

- **Ajan / rol / tarih:** copilot / frontend / 2026-09-21.
- **Yetkili kapsam:** kullanıcının "go next be perfect" talimatı → sıradaki kart
  IIP-13 (Vakit kaynağı ve tazelik). **Commit/push/deploy bu promptla yetkili
  değildir**; yapılmadı.
- **CWD / branch / HEAD:** `/Users/m_ras/Desktop/seyma` / `main` /
  `705fc135879f5b9f89274f8ac12c67b149cc5f40`.
- **Kart durumu:** `done`. IIP-03 `done`, IIP-09 `done`; aktif lock yok.
- **Başlangıç dirty:** yok (temiz ağaç; `705fc13` = IIP-12 yayını).
- **Değişen dosyalar:** `app/core/prayer.js`, `app/core/saygi.js`,
  `tests/app/test_iip_13.js` (yeni), plan kaydı + `evidence/IIP-13/*`.
- **diffHash:** `6074319ba961d8945655d94a3c12c8a82ecdb69099e24e5923ccf34788caa9fc`
  (`evidence/IIP-13/manifest.md` sha256).

## Davranış

İki şey ayrıldı ve tazelik **açık** hâle geldi:

1. **Tazelik.** Cache geçerliliği gün + konum(şehir/koordinat) + yöntem
   eşleşmesiyle değerlendirilir; uyuşmazlık açıkça "eski" gösterilir:
   `Başka güne ait` (gece yarısı), `Konum uyuşmuyor` (şehir değişimi),
   `Yöntem uyuşmuyor` (iki yöntem adıyla), `Güncelleme hatası` (timeout; "eski
   saatler gösterilmiyor"), `Saatler bekleniyor` (kayıt yok).
2. **Kapsam.** Türkiye kapsamı **açık**: 81 il + Diyanet. Yurtdışı (ör. GPS
   Berlin) → `Türkiye dışı` ve *"yerel saat olarak sunulmaz"*; seyahat için
   **otomatik timezone iddiası yok**.

## Düzeltilen kusur

**IIP13-REV-01 (yüksek).** Tazelik etiketi yaşı **gerçek saatten** (`Date.now`)
hesaplıyordu → render yoluna gizli **cihaz-saati bağımlılığı**; aynı `data` ile
çıktı cihaz saatine göre değişebilir, uygulamanın kendi gün modeli ile gerçek
takvim çakışınca taze kayıt yanlışlıkla "eski" görünürdü. **Fixture bunu birebir
yakaladı.** Çözüm: render tazelik yolu gerçek saati hiç okumaz; deterministik
gün/metot/konum eşleşmesi esastır, yaşa dayalı bayatlama `prayerCacheFreshness(o)`
içinde açık `nowMs` ile ölçülür. Kalıcı bekçi eklendi (mutasyonla doğrulandı:
kusur geri konunca 5 FAIL).

**IIP13-REV-03 (düşük).** Sentetik artifact'ın bir sahnesi iddia ettiği durumu
göstermiyordu (etiket "başka güne ait" ama kayıt bugüne aitti) → sahne gerçekten
düne çevrildi, artifact yeniden üretildi.

## Kapsam disiplini

- `app.js` **izinli değil** → GPS izni, `App.refreshPrayerTimes` hata yolu ve
  toast metinleri dokunulmadı. Yeni `App.*` üyesi açılmadı (`App.*` yüzeyi
  **720'de sabit**).
- `app/styles.css` **izinli değil** → yeni CSS sınıfı **yazılmadı**; mevcut stilli
  `sg-tool-meta-grid` + `is-ready/is-error/is-idle` yeniden kullanıldı. "stale"
  durumu mevcut `is-error` ile gösterilir (gerekçe `review.md` IIP13-REV-02).
- **Yeni zorunlu bağımlılık yok**: `SAYGI_DEPENDENCIES` 15, `PRAYER_DEPENDENCIES`
  10 öğede sabit; yeni yardımcılar mevcut `window.SeymaPrayer` kanalından çözülür.

## Test

IIP-13 **80/80**; `test_prayer_boundary` 19/19 (MON-19 fetch sözleşmesi),
`test_saygi_boundary` 20/20, `test_iip_12` 92/92, `test_iip_11` 55/55,
`test_iip_09` 22/22, `driver`, `zikr-harness`, shell gate ve `diff --check` PASS.
**`tests/app` 63/63**, `tests/panel` 23/23, `tests/panel-v2` 27/27,
`tests/quran` 9/9, reminder smoke PASS; plan-check PASS.
Kayıt: `evidence/IIP-13/commands.log` (12 komut, hepsi exit 0).

## Kapsam dışı (bilinçli)

- Kaydedilmiş vakit **satırı** saatlerinin kaynağa karşı doğrulanması.
- Türkiye dışı için gerçek yerel saat hesabı (`Europe/Istanbul` sessizce
  değiştirilmez; plan bunu ayrı tasarım olarak bırakır).

## Kanıt seti ve kilit durumu

- Receipt'ler: `scope/requirements/review/source/visual.json` — beşi de aynı
  `verifiedHead` + `diffHash`; her `artifactSha256` gerçek dosyayla eşleşir.
- Kilit: **yok**; `done` durumda `locks` ve `plannedWriteFiles` boş.
- `completedCards` **13 / 24**.

## Sınır

- Cihaz, ekran okuyucu, gerçek tarayıcı ve **yayın kabulü yok**. Kanıt ağsız
  sentetik VM; görsel yalnız sentetik `render-matrix.html` (8 sahne).
- **cache-bust yapıldı (entegratör işi).** `prayer.js` (`20260904a` →
  `20260921a`) ve `saygi.js` (`20260921c` → `20260921d`) pinleri `index.html`'de
  yükseltildi; `index.html` kartın izin listesinde olmadığı için bu bir
  **entegratör** adımıdır ve kanıt `changedFiles` listesine yazılmadı. Bump
  sonrası etkilenen 10 fixture PASS. Bump olmasaydı önceki oturumdan kalan
  tarayıcı yeni tazelik/kapsam göstergelerini görmezdi.

## Sonraki yetkili eylem

Yalnız **ayrıca yetkilendirilirse** IIP-14 (Kayıpsız tarihsel kayıt sunumu).
Bu oturumda başlanmadı. Kullanıcı talimatı olmadan sonraki karta geçilmedi ve
commit/push yapılmadı.
