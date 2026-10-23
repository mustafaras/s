# K3PD-19 — Tanış ve kavramda öğretim çekirdeğini görünür bırak

## Durum

`ready_for_audit` / `NOT_MEASURED`. Bağımsız denetim yapılmadı; hüküm PASS değildir.

- Branch `k3pd-denetim-duzeltmeleri`, taban HEAD `39145672455b628ef26f945a80695a294c28a6a9` (K3PD-18 kapanışı).
- Önkoşul: K3PD-18 `done`; kullanıcı “sıradaki adıma geç” dedi.

## Bulgu (F-09 / K3P-A3/A8) — öğretim çekirdeği katlanmıştı

`lessonScreen` içinde **tanış** ekranının doğrulanmış örneği ve **kavram** ekranının kısa
kuralı `moreBlock(...)` içine, yani `<details>` gövdesine konmuştu. İlk görünümde yalnız
kelime + anlam (tanış) veya yalnız başlık (kavram) kalıyordu.

Ölçüm (düzeltme öncesi, 109 dersin tüm intro/concept ekranları):

| Ölçüt | Öncesi | Sonrası |
| --- | --- | --- |
| Tanış: doğrulanmış örnek **ilk görünümde** | **452 / 518** | **518 / 518** |
| Kavram: kısa kural **ilk görünümde** | **0 / 25** | **25 / 25** |
| İlk görünüm sözcük (en yüksek) | 44 | **40** (≤45 ✓) |
| Ayrıntı katlayan intro | 417 | 417 (korundu) |

Kavram ekranı tam olarak kartın tarif ettiği kusuru taşıyordu: **yalnız başlık + “Daha fazla”**.

## Düzeltme

`app/core/quranLearnViews.js` — iki blok, davranış aynı, konum değişti:

1. **Tanış:** `introExample(model.example)` `moreBlock(...)` dışına alındı → doğrulanmış örnek
   (Arapça + okunuş + Türkçe + âyet referansı) **ilk görünümde**. Akraba, kök/türev, uzun
   “Neden böyle?” ve çapa metni **katlı kaldı**.
2. **Kavram:** `model.plainTr` yeni `kao-lesson-rule` paragrafı olarak **ilk görünümde**;
   tablo ve terimler `moreBlock` içinde **katlı kaldı**.

İçerik cümleleri **yeniden yazılmadı**; yalnız mevcut onaylı kısa alan (`plainTr`) ve
doğrulanmış örnek (`lemma.verified === true && examples[0]`) kullanıldı. Arapça/okunuş metni
**elle kısaltılmadı** (hard stop).

## Test

`tests/kao/test_kao2_lesson_flow.js`: 24 → **30 kontrol**. Altı yeni kontrol:

1. **518/518** intro'da doğrulanmış örnek ilk görünümde (ve örnek gerçekten `lemma.examples[0]`'dan);
2. akraba/kök/uzun neden **ilk görünümde değil**, ayrıntı üretilen her intro'da katlı;
3. **25/25** kavramda kısa kural ilk görünümde (metin `plainTr` ile birebir);
4. tablo ve terimler katlı (ilk görünümde `kao-lesson-table` yok);
5. ilk görünüm **≤45 sözcük** (109 dersin intro+concept ekranları);
6. `summary` **≥44 px**, `cursor:pointer`, native `<details>/<summary>` (klavye ile açılır,
   `role="button"` eklenmemiş).

**Ölçüm yöntemi (hard stop'a uygun):** `<details>` gövdesi HTML'den **çıkarılır**, kalan
görünür metin sayılır. Test yalnız `details` içinde örnek arayarak gerekliliği karşılanmış
**saymaz**. Ders kartı iç içe `<section>` taşıdığı için derinlik sayan bir çıkarıcı kullanılır
(naif `.*?</section>` erken kesiyordu — bu da düzeltildi).

**Kırmızı→yeşil:** düzeltme öncesi kodda 1. kontrol `örneği ilk görünümde olmayan dersler`
assertinde **kırmızı**.

## Doğrulama

| Komut | Exit |
| --- | ---: |
| `tests/kao/test_kao2_lesson_flow.js` | 0 (30 kontrol) |
| `tests/kao/test_kao2_a11y.js` · `test_k3p_rhythm.js` | 0 · 0 |
| `tests/kao/test_kao_pronunciation_contract.js` · `test_kao2_lesson_coherence.js` | 0 · 0 |
| `tests/kao/test_kao2_perf_budget.js` | 0 (137,620 / 137,625 KiB, p95 5,028 ms) |
| `tests/kao/test_kao2_mastery.js` | 0 (45 kontrol) |
| `tests/kao/test_k3p_tezhip.js` · `test_k3p_drag.js` · `test_k3p_lesson_ayah.js` | 0 · 0 · 0 |
| `tests/kao/test_kao2_reader.js` · `test_kao_migration.js` · `test_kao2_migration.js` | 0 · 0 · 0 |
| `tests/kao/test_kao_render.js` · `test_kao2_navigation.js` · `test_kao2_hub.js` | 0 · 0 · 0 |
| `tests/kao/test_k3p_build.js` · `test_k3p_cloze.js` · `test_kao_queue.js` · `test_kao_requirements.js` | 0 · 0 · 0 · 0 |
| `driver.mjs` · `zikr-harness.mjs` | 0 · 95/95 |
| `test_asset_pin_freshness.js` · `test_iip_22.js` · `test_local_visual_qa_guard.js` | 0 · 0 · 0 |
| `kao-plan-check` · `kao-verify-contrast` | 0 · 0 |

**20 fixture art arda: 0 regresyon.**

## Pin

`app/core/quranLearnViews.js` değişti; pin değeri K3PD-32'ye kadar değişmez. Dosya
`pinDeferral.files` listesine **exact path** olarak eklendi (K3PD-16'da `quranLearn.js` için
kurulan aynı mekanizma). `test_asset_pin_freshness` → **PASS** (61 taze · 2 ertelenmiş ·
0 engelleyici). Erteleme release PASS'i değildir.

## Bütçe

| Ölçüm | Değer |
| --- | --- |
| Tavan | 137,625 KiB (140.928 B) |
| İlk düzeltme | 137,658 KiB → 34 B fazla |
| Son ölçüm | **137,620 KiB**, pay **8 B** |

**Tavan ARTIRILMADI.** Açık, eklediğim yorumun kaldırılmasıyla kapatıldı (kural artık 6
fixture + bu belgeyle belgeli).

## Kapsam ve sınırlar

- Değişen yollar: `app/core/quranLearnViews.js` (7 satır), `tests/kao/test_kao2_lesson_flow.js`,
  `kao3-premium/duzeltme-plani/DURUM.json` (pinDeferral) + kayıt/kanıt yolları.
- `quranLearn.js` model alanı bağlaması **değişmedi**; `kao.css` **değişmedi** (`summary`
  zaten `min-height:44px` taşıyordu). Şema/`migrate()`/`sync.js`/içerik/pin değeri/`App.kao*`
  (45) değişmedi.
- Ağ, gerçek kullanıcı verisi, token, `seyma-data`, tarayıcı kullanılmadı.
- Cihaz/ekran okuyucu/görsel kabul yapılmadı.
- `releaseApproval=NOT_APPROVED`; push/deploy yok.
