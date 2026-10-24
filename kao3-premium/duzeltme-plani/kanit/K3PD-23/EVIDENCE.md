# K3PD-23 — Otomatik açık dersin gerçek dokunuşunu 40 veya altına indir

## Durum

`awaiting_owner_decision` / `NOT_MEASURED` — **hedef ≤40 sağlanamadı; yapısal taban 42.**

Kart bunu açıkça öngörüyor: *“Ana ölçüyü ≤40'a getir; mümkün değilse kalan yapısal
minimumu göster ve hedef değişikliği kararını ayrı iste.”* Bu belge o yapısal minimumu
gösterir ve kararı kullanıcıya bırakır. **Hedef değişikliği tek taraflı yapılmadı.**

- Branch `k3pd-denetim-duzeltmeleri`, taban HEAD `b3c5b835` (K3PD-22 kapanışı).
- Önkoşul: K3PD-22 `done/PASS`.

## Bulgu (F-09 / K3P-15 regresyonu 42/40)

### 1) Ölçüm aracı bozuktu — kartın “42”sinden farklı bir sayı üretiyordu

`dokunus-olc.cjs` bütçe kesme ekranında (`partEnd`) `kaoLesson('next')` **false**
döndüğü hâlde döngüde saymaya devam ediyordu. Sonuç: **403 dokunuş** (392'si hayalet
“ileri”). Gerçek sayı **42**. Yani kartın “42/40” bulgusu doğruydu ama araç onu
gösteremiyordu.

Araç düzeltildi:

- `partEnd` gerçek bir karar dokunuşu olarak **bir kez** sayılır (`budget-overrun`).
- `summary` kapanış dokunuşu (`finish`) sayılır.
- Çok dokunuşlu görevler (`build`/`order`/`cloze`) **her seçimiyle** sayılır — kartın
  hard stop'u: “harfleri tek tık saymak yasak”. K3P-15'in 39'u tam olarak bunu yapıyordu
  (`picks` yalnız `order` için çoklu, `build` tek tık).
- Üç kol ayrı raporlanır: kapalı / açık / açık+ana ekrandan.

### 2) Gerçek fazlalık: bütçe kesme ekranı karar sunmuyordu

`lessonPart` bütçe dolduğunda `partEnd` üretiyordu — ama kalan dizide **maliyetli görev
yoksa** (yalnız `apply` + `summary`) bu ekran hiçbir karar sunmaz: kullanıcı “süreyi
artır”a bassa da açacak görev yok. Kaldırıldı.

### 3) Gerçek fazlalık: `budget-overrun` sonrası hedef ekranı tekrar geliyordu

`kaoLessonStart(lessonId,'budget-overrun')` planı yeniden kuruyor ve `plan[0]` hedef
olduğu için kullanıcı **aynı hedefi ikinci kez** görüyordu (hedef zaten ders başında ve
kesme ekranında sunulmuştu). `'h'` modundaki atlama `'budget-overrun'` için de geçerli
kılındı.

## Ölçüm

### u01.01 (aynı tohum, aynı tamamlanma tanımı)

| Kol | Önce | Sonra |
| --- | ---: | ---: |
| Otomatik geçiş KAPALI | 73 | **72** |
| Otomatik geçiş AÇIK | 43 | **42** |
| AÇIK + ana ekrandan | 44 | **43** |

AÇIK kolun dökümü: **36 cevap + 4 ileri + 1 bütçe + 1 bitir = 42**.

### 109 dersin dağılımı (tek ders PASS'i evrensel yapılmadı)

| Ölçüm | Önce | Sonra |
| --- | ---: | ---: |
| >40 ders | 90/109 | **24/109** |
| En yüksek | 47 (u01.03) | **46 (u01.03)** |
| En düşük | 38 (u11.06) | **37 (u11.06)** |
| Ortalama | 41,2 | **40,2** |

## Yapısal taban — neden 42?

u01.01 için dokunuşların **hiçbiri** kaldırılamaz:

| Bileşen | Adet | Neden kaldırılamaz |
| --- | ---: | --- |
| Cevap dokunuşları | **36** | 30 görev; 4'ü çok dokunuşlu (2×`build`=2, 2×`order`=3). Kart: “harfleri tek tık saymak yasak”, “görev/lemma kapsamı ve FSRS cevap sayısı açıklamasız azalmaz”. |
| `intro` ekranları | 2 | K3PD-19 sözleşmesi: doğrulanmış örnek + kavram kuralı **ilk görünümde** olmalı. |
| `concept` ekranı | 1 | K3PD-19: 25 kavramın kuralı ilk görünümde. |
| `partEnd` | 1 | Gerçek bütçe kararı (22 tekrar görevi erteleniyor). |
| `apply` | 1 | Zirve: çapa metni okuma. Kart: “öğretim ekranını yok etmek yasak”. |
| `summary` | 1 | Kapanış. |
| **Toplam** | **42** | |

**36 cevap dokunuşu tek başına hedefin %90'ı.** Hedefe inmek için ya görev sayısı
(30 → 28) ya da çok dokunuşlu görevlerin tek tık sayılması gerekir — ikisi de kartın
hard stop'una girer.

## Kapsam korundu — 109 dersin görev sayısı DEĞİŞMEDİ

Kartın hard stop'u: *“görev/lemma kapsamı ve FSRS cevap sayısı açıklamasız azalmaz.”*
Düzeltme öncesi ve sonrası kodla **109 dersin tamamı** oynatıldı, görev sayısı sayıldı:

| Ölçüm | Önce | Sonra |
| --- | --- | --- |
| Görev sayısı farkı olan ders | — | **0 / 109** |
| Dağılım | 106×30, 3×29 | **106×30, 3×29** |

Yani 43 → 42 düşüşü **hiçbir görev, lemma veya FSRS cevabı kaybedilmeden** elde edildi:
yalnız iki gezinme ekranı kaldırıldı (karar sunmayan `partEnd` ve tekrar eden hedef).

## Doğrulama

| Komut | Exit |
| --- | ---: |
| `tests/kao/test_k3p_budget.js` | 0 |
| `tests/kao/test_k3p_rhythm.js` | 0 |
| `tests/kao/test_k3p_feedback_arms.js` | 0 |
| `tests/kao/test_k3p_lesson_moment.js` | 0 |
| `tests/kao/test_kao2_lesson_flow.js` | 0 |
| `tests/kao/test_k3p_resume.js` · `test_k3p_today.js` | 0 · 0 |
| `tests/kao/test_kao2_next_step.js` | 0 |
| `tests/kao/test_kao2_perf_budget.js` | 0 (137,730 / 137,75 KiB) |
| `tests/kao/test_kao2_mastery.js` | 0 (45 kontrol) |
| `driver.mjs` · `zikr-harness.mjs` | 0 · 95/95 |
| `test_asset_pin_freshness.js` · `test_iip_22.js` · `test_local_visual_qa_guard.js` | 0 · 0 · 0 |
| `kao-plan-check` · `kao-verify-contrast` | 0 · 0 (756 çift, 0 eşik altı) |

**10 fixture art arda: 0 regresyon.**

## Bütçe

| Ölçüm | Değer |
| --- | --- |
| Tavan | 137,75 KiB |
| Son ölçüm | **137,730 KiB**, pay 20 B |

**Tavan ARTIRILMADI.** İki yorum satırı kaldırılarak (137,885 → 137,730) açık kapandı.

## Karar gereken nokta

Hedef ≤40'a inmek için üç seçenek var; **hiçbiri bu kartın yetkisinde değil**:

| Seçenek | Etki | Kartın hard stop'u |
| --- | --- | --- |
| **A** — Hedefi 42'ye çek | Yapısal taban kabul edilir; öğretim ve kapsam aynı kalır | — (karar) |
| **B** — Görev sayısını 30 → 28 | 2 cevap dokunuşu düşer; **lemma kapsamı azalır** | ✗ “kapsam açıklamasız azalmaz” |
| **C** — Çok dokunuşlu görevleri tek tık say | Ölçüm 38'e düşer ama **gerçek kullanıcı eylemi değişmez** | ✗ “harfleri tek tık saymak yasak” |

**Önerim: A.** 42, öğretim içeriği ve FSRS kapsamı korunarak ulaşılabilen gerçek
minimumdur; K3P-15'in 39'u yalnız C sayesinde düşüktü.

## Kapsam ve sınırlar

- Değişen yollar: `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`,
  `kao3-premium/araclar/dokunus-olc.cjs` + kayıt/kanıt.
- `quranLearnViews.js` **değişmedi** (öğretim ekranları aynı).
- Şema/`migrate()`/`sync.js`/içerik/pin/`App.kao*` (45) değişmedi.
- Şerit duraklatması erişilebilir şekilde korunuyor (K3P-15 üç kol testleri PASS).
- Ağ, gerçek kullanıcı verisi, token, `seyma-data`, tarayıcı kullanılmadı.
- `releaseApproval=NOT_APPROVED`; push/deploy yok.
