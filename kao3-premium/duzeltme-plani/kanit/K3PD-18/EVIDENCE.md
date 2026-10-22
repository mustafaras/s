# K3PD-18 — Tezhip modelini gerçekten saf yap

## Durum

`ready_for_audit` / `NOT_MEASURED`. Bağımsız denetim yapılmadı; hüküm PASS değildir.

- Branch `k3pd-denetim-duzeltmeleri`, taban HEAD `732b1fcb8d026a42da8536a12ce0abe9d47b6beb` (K3PD-17 kapanışı).
- Önkoşul: K3PD-17 `done`; kullanıcı “sıradakine geç” dedi.

## Bulgu (F-13 / K3P-11) — model SAF DEĞİLDİ

`kaoTezhipModel` içinde `ensureQuranLearn(d)` çağrılıyordu. O fonksiyon **normalize eder ve
girdiyi yazar** (17 alan ekler; `schemaVersion`/`lexiconVersion`/`settings`/`gate`/`cards`
doldurur). Yani “yalnız türeten” model, çağrıldığı anda state'i değiştiriyordu.

Ölçülen kusurlar (düzeltme öncesi):

| Durum | Öncesi | Sonrası |
| --- | --- | --- |
| `{quranLearn:{}}` çağrısı | **17 anahtar eklendi**, girdi mutasyona uğradı | 0 anahtar, mutasyon yok |
| `{}` (quranLearn yok) | `d.quranLearn` **yaratıldı** | yaratılmıyor |
| deep-frozen girdi | **TypeError: Cannot assign to read only property 'schemaVersion'** | çalışıyor |
| `{quranLearn:{cards:null}}` | normalize etti | yalnız okudu |

Eski fixture bunu yakalamıyordu: “veri değişmez” kontrolü `JSON.stringify` ile
karşılaştırıyordu ama test **zaten normalize edilmiş** veriyle başlıyordu — dolayısıyla
normalize eden model fark üretmiyordu. Bu bir **test kör noktasıydı** ve kapatıldı.

## Düzeltme

Tek satır, tek kavram: model state'i **okur**, normalize etmez.

```
- cards=objectOr(ensureQuranLearn(d).cards,{})
+ cards=objectOr(quranLearnRoot(d).cards,{})
```

`quranLearnRoot(d)` zaten var olan **saf** okuyucudur (`d.quranLearn` varsa onu, yoksa `d`'yi
döndürür; hiçbir şey yazmaz). Böylece:

- normalizasyon/persistans çağrısı modelden **tamamen çıktı**;
- `migrate()` ve genel `ensureQuranLearn` davranışına **dokunulmadı** (hard stop'a uyuldu);
- bilinen/öğreniliyor/yeni ayrımı, iki yönlü kalıcılık (`ar>tr` + `tr>ar`), orphan/
  `readerUnknown` dışlaması ve kapsam kümesi `kaoKnownLemmaSet`/`kaoCoverage` üzerinden **aynı**;
- kart/ilerleme kazanımı model okumasıyla üretilmiyor (yalnız `cards` okunuyor).

## Test

`tests/kao/test_k3p_tezhip.js`: 16 → **21 kontrol**. Yeni 5 kontrol:

1. boş/eksik/bozuk `quranLearn` girdisinde **girdi değişmez**, `schemaVersion`/`settings` yazılmaz;
2. **deep-frozen** girdide model patlamaz ve yazmaz;
3. **save çağrısı 0** (model yan etkisiz);
4. çıktıyı mutasyona uğratmak **girdiyi değiştirmez** (referans sızıntısı yok);
5. geçersiz sûre `null`; geçerli model aynı kelime kümesi/kapsam.

**Kırmızı→yeşil:** aynı testler düzeltme öncesi kodda `girdi DEĞİŞMEZ` assertinde **kırmızı**.

## Doğrulama

| Komut | Exit |
| --- | ---: |
| `tests/kao/test_k3p_tezhip.js` | 0 (21 kontrol) |
| `tests/kao/test_kao2_progress.js` · `test_k3p_today.js` | 0 · 0 |
| `tests/kao/test_kao_migration.js` · `test_kao2_migration.js` | 0 · 0 |
| `tests/kao/test_kao2_perf_budget.js` | 0 (137,607 / 137,625 KiB, p95 4,536 ms) |
| `tests/kao/test_kao2_mastery.js` | 0 (45 kontrol) |
| `tests/kao/test_k3p_drag.js` · `test_k3p_lesson_ayah.js` | 0 · 0 |
| `tests/kao/test_kao_queue.js` · `test_kao_requirements.js` · `test_kao_render.js` | 0 · 0 · 0 |
| `tests/kao/test_k3p_progress.js` · `test_kao2_hub.js` · `test_k3p_build.js` · `test_k3p_cloze.js` | 0 · 0 · 0 · 0 |
| `tests/kao/test_kao2_a11y.js` · `test_kao_fsrs.js` | 0 · 0 |
| `driver.mjs` · `zikr-harness.mjs` | 0 · 95/95 |
| `test_asset_pin_freshness.js` · `test_iip_22.js` · `test_local_visual_qa_guard.js` | 0 · 0 · 0 |
| `kao-plan-check` · `kao-verify-contrast` | 0 · 0 |

**18 fixture art arda: 0 regresyon.**

## Bütçe

| Ölçüm | Değer |
| --- | --- |
| Tavan (K3PD-17 sonrası) | 137,625 KiB (140.928 B) |
| İlk düzeltme | 137,731 KiB → 109 B fazla |
| Son ölçüm | **137,607 KiB**, pay **18 B** |

**Tavan ARTIRILMADI.** Açık kayıpsız sıkıştırmayla kapatıldı: iç içe `objectOr` sadeleştirmesi
(`objectOr(objectOr(quranLearnRoot(d),{}).cards,{})` → `objectOr(quranLearnRoot(d).cards,{})`)
ve eklediğim yorumun kaldırılması (kural artık 5 fixture + bu belgeyle belgeli). Önceki
kartlarda kullanılan tavan artışı bu kartta **kullanılmadı**.

## Kapsam ve sınırlar

- Değişen yollar: `app/core/quranLearn.js` (yalnız model okuma sınırı),
  `tests/kao/test_k3p_tezhip.js` + kayıt/kanıt yolları. Üretim diff'i **1 satır**.
- `migrate()`, `ensureQuranLearn`, `sync.js`, şema, içerik, CSS, pin ve `App.kao*` yüzeyi
  **değişmedi** (45 sabit).
- Ağ, gerçek kullanıcı verisi, token, `seyma-data`, tarayıcı kullanılmadı.
- Cihaz/ekran okuyucu/görsel kabul yapılmadı.
- `releaseApproval=NOT_APPROVED`; push/deploy yok.
