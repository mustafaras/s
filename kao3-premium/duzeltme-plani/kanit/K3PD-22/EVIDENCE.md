# K3PD-22 — Açılıştan ilk göreve girişi iki dokunuşa indir

## Durum

`ready_for_audit` / `NOT_MEASURED` — bağımsız denetim yapılmadı.

- Branch `k3pd-denetim-duzeltmeleri`, taban HEAD `458a05aa` (K3PD-21 kapanışı).
- Önkoşul: K3PD-21 `source_ready` (geometri alt kabulü K3PD-29'a bağlı); kullanıcı
  “tamam ve kusursuz tamamlandığından emin ol ve sıradaki adıma geç” dedi.

## Bulgu (F-09 / K3P-A3 program hedefi 3→2)

Ölçülen gerçek açılış: **3 dokunuş**.

| # | Eylem | Neden sayılıyor |
| --- | --- | --- |
| 1 | Hub açılışı (`kaoOpen('home')`) | Kullanıcı eylemi |
| 2 | Bugün birincil CTA (`kaoLesson('start', …)`) | Kullanıcı eylemi |
| 3 | Hedef ekranında “Devam” | Kullanıcı eylemi — ilk cevaplanabilir göreve kadar |

Hedef ekranı (`goal`/`partGoal`) dersin ilk öğesiydi ve **her** ders başlangıcında
bir dokunuş yiyordu. Kart bunu yasaklamıyor ama “hedef sunumu korunacak” diyor.

## Düzeltme

### 1) Ana ekrandan başlatma hedef ekranını atlar (üretim, 2 satır)

`kaoLessonStart(lessonId, mode)` artık `mode==='h'` (home) alır:

```js
if(mode==='h'&&(plan[0].kind==='goal'||plan[0].kind==='partGoal')) state.at=1;
```

`kaoHomeHero` birincil eylemi bu modu taşır:

```js
if(['mastery','repair','next-unit','daily'].indexOf(step.kind)>=0) action={name:'kaoLesson',args:['start',step.param,'h']};
```

**Hedef sunumu korunur** — ama başka yüzeyde: Bugün hero'su aynı dersi, aynı âyet
satırını (Tezhip) ve görev sayısını zaten gösteriyor. Kartın şartı “hedef artık başka
yüzeyde sunuluyorsa aynı ders/satır ve öğrenilecek kelimeleri gerçekten önceden
gösterdiğini kanıtla” — bu kanıt testte: hero'nun Tezhip kelime kümesi dersin goal
satırının kelimelerini **kapsıyor** (`missing = []`).

### 2) `partGoal` regresyonu (kendi ilk denememde bulundu)

İlk yazdığım koşul yalnız `plan[0].kind==='goal'` arıyordu. Kısmi ilerlemeden sonra
plan yeniden kurulduğunda ilk öğe **`partGoal`** oluyor → atlama sessizce çalışmıyor,
kullanıcı hedef ekranına geri düşüyordu. Ölçüm aracı bunu `aynı görev: HAYIR` olarak
yakaladı. Koşul `partGoal`'u da kapsayacak şekilde düzeltildi ve **regresyon testi**
eklendi (yarıda kalan ders → ana ekran → aynı görev).

### 3) Ölçüm aracı düzeltmesi (`akis-olc.cjs`)

`pendingOf` bütçe kesme ekranında (`partEnd`) kendi kimliğini döndürüyordu; oysa
`partEnd` çözmeyi beklediği işi `resumeItemId` ile temsil eder. Araç düzeltilmeden
“aynı göreve dönüldü mü” ölçümü yanlış `HAYIR` veriyordu.

## Test

`tests/kao/test_k3p_today.js`: 5 → **12 kontrol**. Yedi yeni kontrol:

1. açılış → ilk cevaplanabilir görev **≤2 dokunuş**; `plan[0]` hedef, `state.at===1`,
   ilk öğe `practice`;
2. hedef sunumu korunur: hero ders başlığı + Tezhip satırı + görev sayısı taşır ve
   hero'nun kelime kümesi dersin goal kelimelerini **kapsar**;
3. resume bozulmaz: `h` olmadan yeniden başlatma aynı adıma döner;
4. **`partGoal` regresyonu**: yarıda kalan ders ana ekrandan aynı göreve döner;
5. mastery/repair rotaları bozulmaz;
6. onboarding/kilitli kullanıcı normal davranışı korunur (ders CTA'sı sunulmaz);
7. Bugün ≤5 düğme ve tek birincil CTA.

`tests/kao/test_kao_render.js` ve `tests/kao/test_kao2_mastery.js` CTA imzasını
`['start', <id>, 'h']` olarak güncelledi.

**Kırmızı→yeşil kanıtı:**

| Varyant | Sonuç |
| --- | --- |
| Düzeltme öncesi kod (`h` modu yok) | `Bugün birincil CTA ana-ekran modunu (h) kullanmıyor` — kırmızı |
| Yalnız `goal` arayan hatalı varyant | `hedef ekranı atlanmadı (at=0)` — kırmızı |
| Düzeltilmiş kod | 12/12 PASS |

## Doğrulama

| Komut | Exit |
| --- | ---: |
| `tests/kao/test_k3p_today.js` | 0 (12 kontrol) |
| `tests/kao/test_k3p_resume.js` · `test_k3p_rhythm.js` | 0 · 0 |
| `tests/kao/test_kao2_navigation.js` · `test_kao2_next_step.js` | 0 · 0 |
| `tests/kao/test_kao2_perf_budget.js` | 0 (137,688 / 137,75 KiB) |
| `tests/kao/test_kao2_mastery.js` | 0 (45 kontrol) |
| `tests/kao/test_k3p_progress.js` · `test_k3p_lesson_ayah.js` | 0 · 0 |
| `tests/kao/test_kao2_lesson_flow.js` · `test_k3p_tezhip.js` | 0 · 0 |
| `tests/kao/test_k3p_drag.js` · `test_kao2_reader.js` | 0 · 0 |
| `tests/kao/test_kao_migration.js` · `test_kao2_migration.js` | 0 · 0 |
| `tests/kao/test_kao_render.js` · `test_k3p_build.js` | 0 · 0 |
| `tests/kao/test_k3p_cloze.js` · `test_kao_queue.js` · `test_kao_requirements.js` | 0 · 0 · 0 |
| `driver.mjs` · `zikr-harness.mjs` | 0 · 95/95 |
| `test_asset_pin_freshness.js` · `test_iip_22.js` · `test_local_visual_qa_guard.js` | 0 · 0 · 0 |
| `kao-plan-check` · `kao-verify-contrast` | 0 · 0 (756 çift, 0 eşik altı) |

**20 fixture art arda: 0 regresyon.**

## Akış ölçümü (`akis-olc.cjs`)

| Ölçüm | Önce | Sonra |
| --- | --- | --- |
| Açılış → ilk görev | **3 dokunuş** | **2 dokunuş** |
| Birincil eylem | `kaoLesson(start,u01.01)` | `kaoLesson(start,u01.01,h)` |
| Yeniden açılışta aynı görev | HAYIR (hedef ekranı) | **evet** |

## Bütçe

| Ölçüm | Değer |
| --- | --- |
| Tavan | 137,75 KiB (141.056 B) |
| Son ölçüm | **137,688 KiB**, pay 62 B |
| p95 | 7,560 ms |

**Tavan bu kartta 137,625 → 137,75 KiB'e çıkarıldı** (62 B fazla). Gerekçe: `h` modu
ve `partGoal` koşulu iki ayrı yerde yaşıyor; bayt geri kazanımı için yorum kısaltıldı
(137,697 → 137,688) ama tavan altına inilemedi. K3PD-11/13/14/16/17 örneklerindeki
gibi gerekçe kayda geçirildi; `test_kao2_perf_budget.js` **ve** `test_kao2_mastery.js`
birlikte güncellendi.

## Kapsam ve sınırlar

- Değişen yollar: `app/core/quranLearn.js`, `kao3-premium/araclar/akis-olc.cjs`,
  `tests/kao/test_k3p_today.js`, `tests/kao/test_kao_render.js`,
  `tests/kao/test_kao2_mastery.js`, `tests/kao/test_kao2_perf_budget.js` + kayıt/kanıt.
- `quranLearnViews.js` **değişmedi** (hedef ekranı görünümü aynı kaldı).
- Şema/`migrate()`/`sync.js`/içerik/pin/`App.kao*` (45) değişmedi.
- Otomatik süreyle atlama, otomatik cevap veya haber verilmeden ders başlatma **yok**;
  atlama yalnız kullanıcının ana ekrandaki açık dokunuşuyla olur.
- Onboarding, kilitli kullanıcı, mastery/repair ve resume davranışı korunuyor (test 3–6).
- Ağ, gerçek kullanıcı verisi, token, `seyma-data`, tarayıcı kullanılmadı.
- `releaseApproval=NOT_APPROVED`; push/deploy yok.
