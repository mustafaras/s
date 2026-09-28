# KAO-01 · Devir

**Tarih:** 2026-09-23 · **Başlangıç HEAD:** `70923c44e1eb4087ebceb61d677af4d26893ac9d` · **Durum:** done

## Ne yapıldı

- `tools/kao-lexicon-build.mjs` sıfır bağımlılıklı, ağsız ve yan etkisiz içe aktarılabilir ESM CLI olarak eklendi.
- QAC v0.4 TSV satırları sûre/âyet/kelime düzeyinde gruplanıyor; lemma sıklığı, kök, POS ve ilk 25 lemma hesaplanıyor.
- Arapça alanlar yalnız yerleşik Buckwalter dönüşüm tablosundan veya hash'i doğrulanan Tanzil girdisinden geliyor.
- Tanzil âyetlerinden her lemma için en çok üç adet 3–7 kelimelik örnek pencere oluşturuluyor.
- İki girdi SHA-256 ile fail-closed doğrulanıyor; eksik dosya exit 2, hash uyuşmazlığı exit 3.
- `content/README.md` resmî indirme, sabit hash, kullanım, çıkış kodu ve açık D-01/D-02 lisans sınırlarını kaydediyor.

## Kontrol sonuçları

- `node --check tools/kao-lexicon-build.mjs` → exit 0 → PASS
- `node tools/kao-lexicon-build.mjs --self-test` → exit 0 → 50 satır / 50 token / 5 lemma / 5 kök PASS
- ESM import sınaması → exit 0 → CLI yan etkisi yok, üç export mevcut
- `node tools/kao-lexicon-build.mjs --inputs kuran-ogreniyorum/content/inputs` → exit 2 → beklenen eksik-girdi kabul dalı; iki kaynak+hash açık
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs` → exit 0 → PASS (0 warn)
- `git -c core.fsmonitor=false diff --check` → exit 0 → çıktı yok

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| — | n/a | KAO-01 bağlayıcı R-id kapatmaz. |

## Kalan iş / bilinen sınır

- Gerçek girdiler lisans kabulü gerektiren indirme sayfalarından kullanıcı tarafından edinilmedi; bu nedenle `stats.json` yok. Prompt bunu açıkça exit 2 kabul dalı olarak tanımlar.
- Plan hedefi 77.430 ile QAC v0.4 resmî 77.429 kelime beyanı ayrı raporlanır; sayı düzeltilmiş gibi gösterilmez.
- Araştırma belgesi yalnız 10 referans lemma verir; kalan 15 karşılaştırma üretilmez.
- D-01/D-02 açık; verified sözlük, üretim modülü, app/runtime, gerçek veri ve cihaz kabulü bu kartta yoktur.

## 2026-09-23 tam-korpus düzeltme makbuzu

- Bağımsız denetimde üç kusur yeniden üretildi: prefix POS STEM'i gölgeliyordu;
  `LEM` taşımayan yüzeyler lemma sayılıyordu; Tanzil besmele/vakıf/split
  tokenları QAC `wordIndex` konumunu kaydırıyordu.
- Gömülü regresyon önce RED oldu (`prefix POS yerine STEM POS seçilmeli`),
  ardından çok-segment POS + lemma paydası + besmele/vakıf/split hizası GREEN.
- Tam QAC v0.4: **77.429 kelime · 128.219 segment · 74.122 anotasyonlu token ·
  3.307 LEM-siz token · 4.832 lemma · 1.642 kök**.
- Tanzil v1.0.2 ve v1.1 metin varyantı ayrı salt-okur denendi; ikisi de
  **6.236/6.236 âyet** hizaladı. v1.0.2 mantıksal merge=1, v1.1 varyantı
  merge=4; 4.578 bağımsız işaret ve 112 sûre başındaki 448 besmele tokenı
  kontrollü olarak QAC indeksinden ayrıldı.
- Hizalanamayan âyet artık sessizce yanlış pencere üretmez; fail-closed hata
  verir. Hash uyuşmazlığı exit 3 ayrıca doğrulandı.
- Tam-korpus girdileri yalnız geçici dizinde okundu ve silindi; repoda ham
  korpus veya `stats.json` oluşmadı.

## Sonraki yetkili eylem

Kullanıcı ayrıca yetki verirse yalnız `KAO-25` başlatılır. Bu oturum KAO-25'e ilerlemez; push/merge/tag/deploy yapılmaz.
