# K3PD-20 — Hedef ekranının 25 sözcük sınırını bütün derslerde koru

## Durum

`ready_for_audit` / `NOT_MEASURED`. Bağımsız denetim yapılmadı; hüküm PASS değildir.

- Branch `k3pd-denetim-duzeltmeleri`, taban HEAD `256a5bdc4de16158b22859b12d41495d3b2034ee` (K3PD-19 kapanışı).
- Önkoşul: K3PD-19 `done`; kullanıcı “sıradaki adımdan devam et” dedi.

## Bulgu (F-09 / K3P-13 + A8 regresyonu) — hedef ekranı 25'i aşıyordu

`lessonScreen`'in `goal` dalı ilk görünümde **kicker + başlık + âyet satırı + uzun hedef
cümlesi** taşıyordu. Ölçüm (109 dersin hedef ekranları, `<details>` gövdesi hariç):

| Ölçüt | Öncesi | Sonrası |
| --- | --- | --- |
| İlk görünüm ≤25 sözcük | **19 / 109** (90 aşım) | **109 / 109** |
| En yüksek ilk görünüm | **45** | **25** |

Kartın “80/109 aşımı kapat” hedefi **aşıldı**: 90 aşımın tamamı kapandı.

## Düzeltme

`app/core/quranLearnViews.js` — `goal` dalı:

1. **Uzun hedef cümlesi** (`model.goal`) ve **süre vaadi** (`model.promise`) `moreBlock`
   içine, yani `<details>` gövdesine alındı.
2. **Kicker** (“Bugünün dersi”, 2 sözcük) kaldırıldı — bağlamı başlık + âyet satırı taşıyor;
   bu 2 sözcük 25 sınırını aştırıyordu.

**Korunanlar:** doğrulanmış âyet satırı (`goal`/`apply` **aynı** satır) görünür kaldı;
`moreBlock` varsayılan “Daha fazla” özeti ve `min-height:44px` sözleşmesi değişmedi
(K3P-A8 a11y testi geçiyor). Arapça/okunuş metni **elle kısaltılmadı** (hard stop).

## İki ölçü ayrı tutuldu (hard stop)

Kart açıkça “25'i yalnız Arapça satırına uygulayıp tam ekranı PASS sayma” diyor. Bu yüzden:

- **(a) Gerçek ilk görünüm toplam metni** — kicker/başlık/summary dâhil, `<details>` hariç:
  **109/109 ≤25**.
- **(b) Âyet satırının kendi uzunluğu** — ayrı ölçü. **7 ders** satırı 25'i aşıyor
  (`u01.01…u01.05` = 29, `u02.02`/`u02.03` = 28). Bunlar **çapa metin** (Fâtiha/namaz)
  dersleridir; satır kaynağın kendi uzunluğunu taşır. Kırpmak Arapça metni bozmak olurdu.
  Bu yüzden **kapalı ve gerekçeli** bir `ROW_EXEMPT` listesi testte tutulur (yalnız küçülebilir)
  ve istisnaların hepsinin `apply.ref.kind ∈ {prayer, surah}` olduğu doğrulanır.

## Test

`tests/kao/test_k3p_lesson_ayah.js`: 15 → **21 kontrol**. Altı yeni kontrol:

1. **109/109** hedef ekranı ilk görünüm ≤25 (en yüksek 25);
2. uzun hedef cümlesi ve süre vaadi **katlı** (ilk görünümde `kao-lesson-goal-line` yok,
   ama içerik kaybolmadı — `<details>` içinde duruyor);
3. `goal`/`apply` **aynı** doğrulanmış satırı paylaşır (gerileme yok);
4. satır uzunluğu **ayrı ölçü**: gerekçeli `ROW_EXEMPT` listesi birebir eşleşir ve istisnalar
   yalnız çapa metin dersleridir;
5. intro/concept **≤45 korunur** (K3PD-19 gerilemedi);
6. gerekçeli lemma istisna listesi **gerilemedi** (`WORD_EXEMPT` 0, `LEMMA_EXEMPT` 10).

**Kırmızı→yeşil:** düzeltme öncesi kodda 1. kontrol `25 sözcüğü aşan hedef ekranları`
assertinde **kırmızı**.

## Doğrulama

| Komut | Exit |
| --- | ---: |
| `tests/kao/test_k3p_lesson_ayah.js` | 0 (21 kontrol) |
| `tests/kao/test_kao2_lesson_flow.js` · `test_k3p_rhythm.js` | 0 · 0 |
| `tests/kao/test_kao2_a11y.js` | 0 (14 kontrol — “Daha fazla” sözleşmesi korundu) |
| `tests/kao/test_kao_pronunciation_contract.js` · `test_kao2_lesson_coherence.js` | 0 · 0 |
| `tests/kao/test_kao2_perf_budget.js` | 0 (137,618 / 137,625 KiB, p95 5,157 ms) |
| `tests/kao/test_kao2_mastery.js` | 0 (45 kontrol) |
| `tests/kao/test_k3p_tezhip.js` · `test_k3p_drag.js` · `test_kao2_reader.js` | 0 · 0 · 0 |
| `tests/kao/test_kao_migration.js` · `test_kao2_migration.js` | 0 · 0 |
| `tests/kao/test_kao_render.js` · `test_kao2_navigation.js` · `test_kao2_hub.js` | 0 · 0 · 0 |
| `tests/kao/test_k3p_build.js` · `test_k3p_cloze.js` · `test_kao_queue.js` · `test_kao_requirements.js` | 0 · 0 · 0 · 0 |
| `driver.mjs` · `zikr-harness.mjs` | 0 · 95/95 |
| `test_asset_pin_freshness.js` · `test_iip_22.js` · `test_local_visual_qa_guard.js` | 0 · 0 · 0 |
| `kao-plan-check` · `kao-verify-contrast` | 0 · 0 |

**20 fixture art arda: 0 regresyon.**

## Bütçe

| Ölçüm | Değer |
| --- | --- |
| Tavan | 137,625 KiB (140.928 B) |
| İlk düzeltme | 137,783 KiB → 162 B fazla |
| Son ölçüm | **137,618 KiB**, pay **10 B** |

**Tavan ARTIRILMADI.** Açık, eklediğim yorumun kaldırılmasıyla kapatıldı (kural 6 fixture +
bu belgeyle belgeli).

## Kapsam ve sınırlar

- Değişen yollar: `app/core/quranLearnViews.js` (8 satır), `tests/kao/test_k3p_lesson_ayah.js`
  + kayıt/kanıt yolları.
- `quranLearnFlow.js` ve `quranLearn.js` **değişmedi** (goal/apply satırı zaten ortaktı);
  `kao.css` değişmedi; şema/`migrate()`/`sync.js`/içerik/pin/`App.kao*` (45) değişmedi.
- Ağ, gerçek kullanıcı verisi, token, `seyma-data`, tarayıcı kullanılmadı.
- Cihaz/ekran okuyucu/görsel kabul yapılmadı.
- `releaseApproval=NOT_APPROVED`; push/deploy yok.

## Açık karar (kullanıcı)

7 çapa metin dersinin **satırı** 25 sözcüğü aşıyor (Fâtiha 29, iki namaz metni 28). Bunlar
kaynak metnin kendi uzunluğudur; kırpmak Arapça metni bozar. Kart “kaynak nedeniyle imkânsızsa
ders+minimum uzunluk kanıtıyla ayrı kullanıcı kararı al” diyor. Bu kartta **ekran ölçüsü**
(≤25) tamamen sağlandı; **satır ölçüsü** için gerekçeli istisna listesi tutuldu ve karar açık
bırakıldı — eski hedefin FAIL durumu korunuyor.
