# IIP-12 devir

- **Ajan / rol / tarih:** copilot / frontend / 2026-09-21.
- **Yetkili kapsam:** kullanıcının IIP-12 promptu ("go apply be perfect") → yalnız
  IIP-12 (Günlük odak ve devam et). Commit/push/deploy bu promptla **yetkili
  değildir**; yapılmadı.
- **CWD / branch / HEAD:** `/Users/m_ras/Desktop/seyma` / `main` /
  `faa65857cfc0fdbf67c6719e6f677bbda67cbb1a`.
- **Kart durumu:** `done`. IIP-09 `done`, IIP-11 `done`; aktif lock yok.
- **Başlangıç dirty:** yok (temiz ağaç; `faa6585` = IIP-11 yayını).
- **Değişen dosyalar:** `app/core/saygi.js`, `tests/app/test_iip_12.js` (yeni),
  plan kaydı + `evidence/IIP-12/*`. `app/core/render.js` **değişmedi**.
- **diffHash:** `caf31295c9077ac3894167dd94794f38533b4d67af6f09d6f6ae7b294a736807`
  (`evidence/IIP-12/manifest.md` sha256).

## Davranış

Bugün (Öz) sekmesine iki **türetilmiş** katman eklendi; ikisi de salt-okurdur:

1. **Günlük odak** — kabul edilmiş kataloglardan **tek** öneri. Kaynak
   (`Günün öncüsü` / `Âyet vitrini`), tahmini süre ve **seçim gerekçesi** görünür.
   Determinizm gün + katalog damgasından gelir; aynı gün tekrar render seçimi
   değiştirmez. İçerik yoksa dürüst boş hâl (**CTA yok**).
2. **Devam et** — en çok **iki satır**, sabit sıra **Zikir → Kur’an**. Yalnız
   gerçek durum yazılır. Kur’an'da yalnız `ready|watching|watched` "devam"dır ve
   her durum **doğru eyleme** gider (`watched→soru`, `ready→izle`,
   `watching→aç`). Bekleme durumları, hata durumları, arşivlenmiş hatim ve bozuk
   kayıtlar **satır üretmez**.

## Kritik kararlar

1. **Yeni `App.*` üyesi ve yeni CSS yok.** `app.js` ve `app/styles.css` izinli
   değildir. Bu yüzden yalnız **mevcut** handlerlar çağrıldı
   (`openSaygiPreview`, `openQuranJourney`, `quranJourneyWatch`,
   `quranJourneyQuestion`, `openZikr`); `App.*` yüzeyi **720'de sabit**.
   Görsel dil, stilli mevcut `saygi-source-card` deseninden yeniden kullanıldı
   (IIP-11 REV-03'ün stillsiz sınıf hatası **tekrarlanmadı**).
2. **Tematik seçki içeriği üretilmedi.** `specs/03` altı temalı döngü der, ancak
   `04-ICERIK-STRATEJISI.md` *"bu planla içerik yazılmış/onaylanmış değildir"*
   der. İçerik **uydurulmadı**; öneri yalnız kabul edilmiş kataloglardan gelir.
   Tema döngüsü IIP-16 içerik kabulünde `SAYGI_DAILY_SOURCES`'a kaynak eklenerek
   açılır.
3. **"Geç / başka içerik" eylemi eklenmedi.** `specs/03` koşullu tanımlar ancak
   REQ-023 kapsamında değildir ve `app.js` gerektirirdi. Gerekçe `review.md`'de.

## Test

IIP-12 **92/92**; Saygı 20/20, zikir sınırı, Kur’an sınırı, IIP-09 22/22,
IIP-10 61/61, IIP-11 55/55, `driver`, `zikr-harness`, shell gate ve `diff --check`
PASS. **`tests/app` 62/62**, `tests/panel` 23/23, `tests/panel-v2` 27/27,
`tests/quran` 9/9, reminder smoke PASS; plan-check PASS.
Kayıt: `evidence/IIP-12/commands.log` (16 komut, hepsi exit 0).

Bekçiler mutasyonla doğrulandı: stillsiz sınıf sızıntısı, `idle` ve `queued`
resume kümesine eklenmesi, `h.target>0 → >=0` — hepsi yakalandı, geri alındı.

## Düzeltilen kusurlar

**IIP12-REV-02 (yüksek).** Kur’an devam kümesi bekleme durumlarını da sayıyordu;
bunlar devam değildir ve aynı sekmedeki yolculuk kartıyla çakışırdı. Ayrıca
`watched`'da açmak yanlış yüzeydi. Küme `{ready,watching,watched}`'e daraltıldı,
durum→eylem yönlendirmesi eklendi.

**IIP12-REV-01 (orta).** Âyet kaynağının CTA'sı `App.setFaithTab('oz')` idi →
kart zaten Bugün'de olduğu için **no-op**. `App.openQuranJourney()`'e çevrildi.

**IIP12-REV-03 (orta).** İlk taslak `app/styles.css` izinli olmadığı hâlde yeni
sınıflar üretiyordu (IIP-11 REV-03'ün tekrarı). Tamamen kaldırıldı, stilli mevcut
desene geçildi.

## Eksik kabul / kanıt sınırı

- Cihaz, ekran okuyucu, gerçek tarayıcı ve yayın kabulü **yok**. Kanıt ağsız
  sentetik VM'dir; görsel kanıt yalnız sentetik `render-matrix.html` (8 sahne).
- Viewport/tema matrisi (320/390/430/768/1280, açık/koyu) **yeniden ölçülmedi**:
  kart yeni renk/ölçü kuralı eklemedi, mevcut token tabanlı sınıfları miras alır.
  Ölçülmemiş değerler **pending**'dir; uydurulmadı.
- Gerçek veri, token, GPS, `seyma-data` yazımı kullanılmadı. Sunucu açılmadı.

## Kanıt seti ve kilit durumu

- Receipt'ler: `scope.json`, `requirements.json`, `review.json`, `source.json`,
  `visual.json` — beşi de `verifiedHead=faa6585…` ve **aynı** `diffHash`
  (`manifest.md` sha256) taşır; her `artifactSha256` gerçek dosyayla eşleşir.
- Üretilmiş görünümler `plan-check --render` ile yazıldı; ardından **salt-okur
  plan-check PASS** (`24 cards, 48 requirements, DAG, scope, approval, evidence,
  ledger, generated views and local links`).
- Ledger: **seq 24** `card_done IIP-12`, `seq 1..24` ardışık doğrulandı.
- Kilit: **yok**. `done` durumdaki kartta `locks` ve `plannedWriteFiles` **boş**
  olmalıdır (plan-check kuralı) — boşaltıldı, aksi hâlde
  `FAIL: write/lock mismatch IIP-12` veriyordu.
- `completedCards` **12 / 24**.

## Sonraki yetkili eylem

Yalnız **ayrıca yetkilendirilirse** IIP-13 (Vakit kaynağı ve tazelik). Bu oturumda
başlanmadı. IIP-13 `planned` ve bağımlılıkları (`IIP-03`, `IIP-09`) `done`.
Kullanıcı talimatı olmadan sonraki karta geçilmedi ve commit/push yapılmadı.

## Yayın: cache-bust entegratör işi (uygulandı)

`app/core/saygi.js` değiştiği için **cache-bust zorunluydu**; `index.html` bu
kartın izin listesinde **değildir** (bilinçli), bu yüzden IIP-11'de olduğu gibi
**entegratör işi** olarak ayrıca yapıldı: tek `app/core/saygi.js` pini
`?v=20260921b` → **`?v=20260921c`**. `app/styles.css` ve `app.js` bu kartta
değişmediği için pinleri sabit kaldı; sayı pinleri de doğal olarak değişmedi.
Bump yapılmasaydı, siteyi bu değişiklikten önce açmış bir tarayıcı yeni
dak/Devam katmanını **görmezdi**. Bump sonrası `test_saygi_boundary` 20/20,
`test_iip_12` 92/92 ve `20260921b` taşıyan 5 yüzey fixture'ı PASS.
