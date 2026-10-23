# K3PD-21 — Birincil eylem bölgesini geometrik olarak sabitle

## Durum

`ready_for_audit` / `NOT_MEASURED` — **geometri alt kabulü `EVIDENCE_PENDING`**.

Bu kart **geometri PASS'i üretmez**. Kartın kendi sözleşmesi bunu açıkça söylüyor:
“Gerçek ölçüm gelene kadar geometri alt kabulü EVIDENCE_PENDING; tamamlandı iddiası yok.”
Gerçek piksel ölçümü **K3PD-29**'un kontrollü görsel QA koşumunda alınacak.

- Branch `k3pd-denetim-duzeltmeleri`, taban HEAD `2c37602ed5c3898ceccd2faa40997068d46fe6d2` (K3PD-20 kapanışı).
- Önkoşul: K3PD-20 `done`; kullanıcı “sıradaki adımı uygula” dedi.

## Bulgu (A6 UNVERIFIABLE / F-11 kanıt açığı)

İki ayrı eksik vardı:

1. **Birincil eylem aşama bazında tanımlı değildi.** `kao-lesson-next` ders kartlarında vardı
   ama **practice** aşamasında birincil eylem **şıklardır** (`kao-choices`), `next` değil.
   Hangi DOM öğesinin ölçüleceği tek kaynaktan bilinmiyordu.
2. **Ölçüm sözleşmesi yoktu.** `position:sticky` kaynakta vardı ama kart açıkça
   “kaynakta `position:sticky` varlığını geometrik kanıt sayma” diyor. 29'un çekim aracının
   hangi alanları üretmesi gerektiği (x/y/w/h, görünürlük, örtüşme, odak, ≤8 px) tanımsızdı.

Ek olarak **practice aşaması DOM'da işaretsizdi**: ders kartı `data-lesson-stage` taşıyordu,
görev yüzeyi (`#kao-task`) taşımıyordu → ölçüm aracı practice'ı bulamazdı.

## Düzeltme

### 1) Aşama işareti (üretim, 1 satır)

`#kao-task` yüzeyi artık aşamasını taşır: `class="kao-task is-practice"`.
Sınıf tabanlı seçildi çünkü yeni bir `data-*` niteliği bütçeyi aşırtıyordu; sınıf listesi
zaten orada ve CSS/ölçüm için doğal bir kanca.

### 2) Ölçüm sözleşmesi aracı (yeni)

[`kao3-premium/araclar/eylem-geometri.cjs`](../../araclar/eylem-geometri.cjs) — **tek kaynak**:

- **9 aşama → birincil eylem selector'ı:** `goal`, `intro`, `concept`, `practice`,
  `feedback`, `apply`, `summary`, `partEnd`, `read`. Boş aşama ölçümden **atlanmaz**;
  `selector: null` ile “yok” olarak kaydedilir.
  - `practice` → `.kao-task.is-practice .kao-choices` (MC/build/cloze ortak yüzey)
  - `feedback` → `.kao-feedback-sheet .kao-feedback-continue, .kao-feedback-strip-continue`
    (tam panel **veya** hızlı geçiş şeridi — ikisi de aynı aşamanın birincil eylemi)
- **4 viewport:** 320/390/460 × 844 px, safe-area 0 **ve** sentetik alt inset 34 px.
- **Kabul eşikleri:** ardışık y-farkı **≤8 px**, görünürlük, örtüşmeme, klavye odağı,
  dokunma hedefi ≥44 px.
- **`requiredFields`:** 29'un kaydı `primary.x/y/width/height/visible`, `overlap.covered`,
  `focusReachable` alanlarını taşımak zorunda; eksik alan = ölçüm geçersiz.
- **`--check`:** sözleşme bütünlüğü (yinelenen/eksik aşama, viewport matrisi, eşik).
- **`--olcum <dosya>`:** 29 çıktısını denetler — eksik alan, görünmez eylem, örtüşme,
  odak yokluğu, <44 px hedef ve **>8 px ardışık y-farkı** reddedilir.

## Test

`tests/kao/test_k3p_progress.js`: 5 → **9 kontrol**. Dört yeni kontrol:

1. sözleşme aracı: 9 aşama, 4 viewport, ≤8 px, `verdict=EVIDENCE_PENDING`, zorunlu alanlar;
2. `--check` bütünlük doğrulaması geçer;
3. **`--olcum` negatif testleri:** eksik alan reddedilir, **20 px y-farkı reddedilir**,
   4 px fark kabul edilir (eşiğin gerçekten çalıştığı kanıtı);
4. her aşama DOM'da işaretli + practice'ın birincil eylemi şıklar (ve `next` **yok**);
5. sticky/safe-area sözleşmesi korunur, motor/Flow sticky bilmez.

**Kırmızı→yeşil:** düzeltme öncesi kodda 4. kontrol `practice: aşama işareti yok` assertinde
**kırmızı**.

## Doğrulama

| Komut | Exit |
| --- | ---: |
| `tests/kao/test_k3p_progress.js` | 0 (9 kontrol) |
| `tests/kao/test_kao2_a11y.js` · `test_k3p_motion_css.js` | 0 · 0 |
| `tests/kao/test_kao2_design_contract.js` | 0 |
| `tests/kao/test_kao2_perf_budget.js` | 0 (137,623 / 137,625 KiB) |
| `tests/kao/test_kao2_mastery.js` | 0 (45 kontrol) |
| `tests/kao/test_k3p_lesson_ayah.js` · `test_kao2_lesson_flow.js` · `test_k3p_rhythm.js` | 0 · 0 · 0 |
| `tests/kao/test_k3p_tezhip.js` · `test_k3p_drag.js` · `test_kao2_reader.js` | 0 · 0 · 0 |
| `tests/kao/test_kao_migration.js` · `test_kao2_migration.js` | 0 · 0 |
| `tests/kao/test_kao_render.js` · `test_kao2_navigation.js` | 0 · 0 |
| `tests/kao/test_k3p_build.js` · `test_k3p_cloze.js` · `test_kao_queue.js` · `test_kao_requirements.js` | 0 · 0 · 0 · 0 |
| `driver.mjs` · `zikr-harness.mjs` | 0 · 95/95 |
| `test_asset_pin_freshness.js` · `test_iip_22.js` · `test_local_visual_qa_guard.js` | 0 · 0 · 0 |
| `kao-plan-check` · `kao-verify-contrast` | 0 · 0 |

**20 fixture art arda: 0 regresyon.**

## Bütçe

| Ölçüm | Değer |
| --- | --- |
| Tavan | 137,625 KiB (140.928 B) |
| İlk düzeltme (`data-lesson-stage`) | 137,710 KiB → 87 B fazla |
| Son ölçüm (sınıf tabanlı) | **137,623 KiB**, pay **2 B** |

**Tavan ARTIRILMADI.** Açık, `data-lesson-stage="practice"` yerine `class="kao-task is-practice"`
kullanılarak kapatıldı — hem daha az bayt hem CSS/ölçüm için doğal kanca.

## Geometri alt kabulü — AÇIK (EVIDENCE_PENDING)

Bu kart **≤8 px PASS yazmıyor** (hard stop). Ölçüm sözleşmesi hazır ve negatif testlerle
doğrulandı; gerçek piksel ölçümü **K3PD-29**'da yapılacak. O gelene kadar:

- geometri alt kabulü: **EVIDENCE_PENDING**
- kart hükmü: **NOT_MEASURED**
- “tamamlandı” iddiası **yok**

## Kapsam ve sınırlar

- Değişen yollar: `app/core/quranLearn.js` (1 satır), `tests/kao/test_k3p_progress.js`,
  yeni `kao3-premium/araclar/eylem-geometri.cjs` + kayıt/kanıt yolları.
- `kao.css` **değişmedi** (sticky/safe-area kuralları zaten doğruydu ve korunuyor);
  `quranLearnViews.js` değişmedi; şema/`migrate()`/`sync.js`/içerik/pin/`App.kao*` (45) değişmedi.
- Genel app/shell tasarımı bu kartın **dışında** (kart açıkça söylüyor).
- Ağ, gerçek kullanıcı verisi, token, `seyma-data`, tarayıcı kullanılmadı.
- Mutlak pixel konumu **cihaz kabulü olarak sunulmadı**.
- `releaseApproval=NOT_APPROVED`; push/deploy yok.
