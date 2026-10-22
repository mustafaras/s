# K3PD-17 — Sürükleme iptalini cevaptan ayır

## Durum

`ready_for_audit` / `NOT_MEASURED`. Bağımsız denetim yapılmadı; hüküm PASS değildir.

- Branch `k3pd-denetim-duzeltmeleri`, taban HEAD `76b29277bc5a269d13c3e13ca4a7a1d26a25449e`.
- Önkoşul: K3PD-16 `ready_for_audit`; kullanıcı bu oturumda “sıradaki adıma geç” dedi.

## Bulgu (F-10 / K3P-20) — dört kusur doğrulandı

Eski `kaoDrag` `pointercancel`'ı **`pointerup` ile aynı handler'a** bağlıyordu; yani
iptal, hareket + alan şartı sağlanırsa **cevap üretiyordu**. Ayrıca:

| # | Kusur | Ölçüm (öncesi) |
| --- | --- | --- |
| A | `pointercancel` cevap üretiyor | draft 0 → **1** |
| B | `lostpointercapture` hiç dinlenmiyor | `undefined` |
| C | Geçerli drop çalışıyor (regresyon yok) | 1 ✓ |
| D | Drop sonrası native `click` **ikinci cevap** | draft 1 → **1** (yani +1) |
| E | `releasePointerCapture` çağrılmıyor | `undefined` |
| F | Hareketsiz bırakma cevap üretmiyor | 0 ✓ |

D'nin kanıtı doğrudan: düzeltme öncesi drop sonrası `_kaoDropHandled` işareti
**yok** ve gelen native click motorda ikinci cevabı **yazıyor**; düzeltmeden sonra
işaret var, click yutuluyor (draft 1 → 0).

## Düzeltme

- **Ayrı iptal yolu.** `pointercancel` ve `lostpointercapture` artık `cancel`'a bağlı;
  `cancel` **commit'siz** `settle(null)` çağırır → yalnız temizlik, cevap yok. İptal
  “yanlış cevap” olarak da sayılmaz (hard stop'a uyuldu).
- **Tek karar noktası.** Bırakma geçerliliği `kaoDropIndex([zoneRect], point) === 0` ile
  belirlenir — `kaoDropIndex` zaten saf fonksiyon olarak vardı, `kaoDrag` onu kullanmıyordu.
  NaN/eksik koordinat `-1` döndürdüğü için güvenli başarısız.
- **Tam cleanup.** Tek `settle` yolunda: dinleyiciler (4 tür), `releasePointerCapture`,
  `transform`, `is-dragging`, `kao-drop-ready`.
- **Çift cevap koruması.** Geçerli drop'ta çip `_kaoDropHandled` ile işaretlenir; merkezî
  `kaoAnswer` bu işareti **bir kez** tüketip çıkar. Normal tek dokunma ve klavye işaretsiz
  geldiği için etkilenmez (hard stop: click'leri toptan engellemedik).
- **Görev değişimi.** Cevap `kaoAnswer` içinde `task.id` doğrulamasından geçer; görev
  değişince eski pointer cevabı yazılmaz.

## Test değişikliği gerekçesi

`tests/kao/test_k3p_drag.js`: 6 → **12 kontrol**. Yeni 6 kontrol K3PD-17 içindir ve
**gerçek handler yolunu** sürer: `kaoDrag`'ın bağladığı dinleyiciler elle tetiklenir,
motorun kendi cevap yazımı (`ui.kaoOrderDraft`) sayılır. Test kendi “cevap üretildi”
sonucunu uydurmaz — harness `app.js` yüklemediği için `App.kaoAnswer` **gerçek motora**
yönlendirilir, casus değildir. Mevcut 6 kontrol (saf `kaoDropIndex`, drop yolu, yüzey/pin,
dokunma+klavye, hareket azaltma, sürüklenebilirlik) aynen korundu.

## Kırmızı → yeşil

| Senaryo | Öncesi | Sonrası |
| --- | --- | --- |
| pointercancel (alan içinde, hareketli) | **1 cevap** | **0** |
| lostpointercapture | dinlenmiyor | dinleniyor, 0 |
| geçerli drop | 1 | 1 |
| drop + native click | **2 cevap** | **1** |
| hâlâ pointer capture serbest | hayır | evet |
| hareket azaltma aynı mantık | 1 | 1 |

## Doğrulama

| Komut | Exit |
| --- | ---: |
| `tests/kao/test_k3p_drag.js` | 0 (12 kontrol) |
| `tests/kao/test_k3p_build.js` · `test_k3p_cloze.js` | 0 · 0 |
| `tests/kao/test_kao2_a11y.js` · `test_kao_fsrs.js` | 0 · 0 |
| `tests/kao/test_kao2_perf_budget.js` | 0 (137,608 / 137,625 KiB, p95 4,458 ms) |
| `tests/kao/test_kao2_mastery.js` | 0 (45 kontrol) |
| `tests/kao/test_k3p_lesson_ayah.js` · `test_kao2_reader.js` | 0 · 0 |
| `tests/kao/test_kao_migration.js` · `test_kao2_migration.js` | 0 · 0 |
| `tests/kao/test_k3p_mount.js` · `test_kao_queue.js` · `test_kao_requirements.js` | 0 · 0 · 0 |
| `tests/kao/test_kao_render.js` · `test_kao2_navigation.js` · `test_kao2_inventory.js` | 0 · 0 · 0 |
| `tests/kao/test_kao2_design_contract.js` · `test_kao_pronunciation_contract.js` · `test_kao_phonics_contract.js` | 0 · 0 · 0 |
| `tests/kao/test_k3p_focus_lock.js` · `test_kao2_context_label.js` · `test_kao2_word.js` · `test_kao2_roots.js` | 0 · 0 · 0 · 0 |
| `driver.mjs` · `zikr-harness.mjs` | 0 · 95/95 |
| `test_asset_pin_freshness.js` · `test_iip_22.js` · `kao-plan-check` · `kao-verify-contrast` | 0 · 0 · 0 · 0 |

24 fixture art arda koşuldu, **sıfır regresyon**.

## Bütçe

| Ölçüm | Değer |
| --- | --- |
| K3PD-16 sonrası tavan | 137,5 KiB (140.800 B) |
| Bu kartın düzeltmesi | 137,608 KiB → **98 B fazla** |
| Yeni tavan | **137,625 KiB** (140.928 B), pay **17 B** |

Kayıpsız sıkıştırma denendi ve büyük kısmı kullanıldı: `kaoDropIndex`'in yeniden
kullanımı (−98 B), `ready` callback yerine boolean, `point()` yardımcısının satır içine
alınması, kullanılmayan `_kaoDropReady` alanının kaldırılması, yorum sadeleştirmesi.
Kalan açık **98 B** idi; `137,5 → 137,625 KiB` artışı K3PD-16'daki aynı kullanıcı onayı
kapsamında yapıldı ve iki perf fixture'ında **aynı gerekçeyle** belgelendi.

**Önemli:** `String()` sarmalayıcılarını toplu silme denemesi `rootDetail(String(resolved))`,
`lex.byId(String(param))`, `seededRank(String(seed)…)`, `new Date(String(date)…)` ve
`KAO_LINE_HEIGHTS.indexOf(String(value))` çağrılarını bozuyordu (strict `===` ve dizi
karşılaştırmaları). Bunlar **geri alındı**; davranış korunmuş hâlde bırakıldı.

## Kapsam ve sınırlar

- Değişen yollar: `app/core/quranLearn.js`, `tests/kao/test_k3p_drag.js`,
  `tests/kao/test_kao2_perf_budget.js`, `tests/kao/test_kao2_mastery.js` + kayıt/kanıt.
- Yeni `App.kao*` handler **yok** (45 sabit), şema/`migrate()`/`sync.js`/içerik/CSS/pin
  değişikliği **yok**. Not/FSRS yazımı yalnız tamamlanmış geçerli cevaba bağlı kaldı.
- Ağ, gerçek kullanıcı verisi, token, `seyma-data`, tarayıcı kullanılmadı.
- Cihaz, ekran okuyucu, gerçek dokunma donanımı ve görsel kabul **yapılmadı**.
- `releaseApproval=NOT_APPROVED`; push/deploy yok.
