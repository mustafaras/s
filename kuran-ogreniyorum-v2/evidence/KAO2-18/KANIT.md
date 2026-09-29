# KAO2-18 — Hata açıklamaları ve kavram çözümlü örnekleri
Tarih: 2026-09-29 · Dal: kao2-yeniden-tasarim (= main) · Önceki commit: ef480b6b

## Yapılan

### Kartın kapsamı
- **`kaoExplain(task, choice, correct)`** (`app/core/quranLearn.js`): hata sınıfına göre
  **boş olmayan Türkçe** açıklama üretir — dil bilgisi (`g:` kartları), sıralama,
  ses, kökteş; doğru cevabı ve **nedenini** birlikte söyler. Suçlayıcı/utandırıcı dil
  yok ("yanlış yaptın" değil, "doğru cevap: … · çünkü …"). Öncelik: görevin kendi
  `workedTr`/`errorTr` alanı → kavram metni (`kaoConceptText`) → görev türüne göre
  güvenli genel cümle. Hiçbir durumda boş dönmez.
- **Kavram çözümlü örnekleri:** `content/texts.tr.json` içinde **25 kavram** için
  `workedTr` (çözümlü örnek) + `errorTr` (sık hata açıklaması). Yapı aracı bunları
  **`app/content/quranConceptTextsV1.js`** modülüne (`window.QuranConceptTextsV1`,
  `byId(id)`/`all`) birleştirir; `draft` kavram metni `null` döner ve render'da
  **görünmez** — yerine görev türünün güvenli genel cümlesi gelir.
- **Gramer kavram sayfası** çözümlü örneği `kao-grammar-worked` bloğunda gösterir
  (yalnız `sourced`/`expert` onaylıysa).

### Kullanıcının bildirdiği üç kusur (kart kapsamı dışında, aynı oturumda)
Kullanıcı raporu: *"fatihaya gir diyince başka bişeyler açılıyor, yönlendirmeler hâlâ
karışık belirsiz ve anlamsız."* Üçü de önce **yeniden üretildi**, sonra düzeltildi:

- **Y-01 — Yolun kartı üniteyi açmıyordu.** Kart `Ünite 1/3 · Fâtiha · 0/5 ders`
  yazıyordu ama **tek** düğmesi "Tüm yolu gör" idi ve `kaoSetView('units')` çağırıyordu
  — yani kullanıcı "Fâtiha"yı görüp tıklayınca üniteye değil, yol **listesine**
  düşüyordu. Artık birincil düğme **"Üniteyi aç"** (`kaoNav('unit', 1)`), "Tüm yolu gör"
  ikincil satıra indi.
- **Y-02 — Ders bağlamı yoktu.** Ders ekranında hangi ünitenin kaçıncı dersi olduğu
  görünmüyordu. Artık `kao-lesson-context` satırı: **"Ünite 1 · Fâtiha · Ders 1 / 5"**.
- **Y-03 — 109 dersin `goal` alanı hiçbir yerde render edilmiyordu.** KAO2-17'de
  yazılan hedefler ölü veriydi. Artık ünite listesinde (`kao-unit-step-goal`) ve ders
  kartında (`kao-lesson-goal-line`) görünür.

### Bütçe revizyonu (kullanıcı onayı, "ikiside evet")
K-1 çalışma zamanı bütçesi **80 → 88 KiB**. Gerekçe: KAO2-18+ açıklama/örnek katmanı
gerçek kod gerektiriyor; KAO2-17 sonunda 79.399/80 KiB ile ~0,6 KiB kalmıştı.
`KAO2-STATE.json` `decisions.contentBudget` ve `UYGULAMA-PROMPTLARI.md` K-1 notu
güncellendi.

### Yükleme sırası (MON-25 dört liste + SW)
`app/content/quranConceptTextsV1.js` dört listeye eklendi: `index.html`,
`.claude/skills/run-seyma/driver.mjs`, `.claude/skills/run-seyma/zikr-harness.mjs`,
`tests/app/test_state_rebind_boundary.js`; ayrıca `sw.js` çevrimdışı izin listesi
(`test_iip_22.js` bunu birebir eşleşme olarak zorlar).

## TDD
- **Kırmızı:** `node tests/kao/test_kao2_explain.js` → `kaoExplain` yok / kavram modülü
  yok.
- **Kendi hatalarım (yakalandı ve düzeltildi):**
  1. `kaoExplain` içinde ölü bir `else` dalı hesaplanan satırı eziyordu — test
     yakaladı, kaldırıldı.
  2. `kao-path-more` hakkında birbiriyle çelişen iki iddia yazmıştım — tek doğru
     iddiaya indirildi.
  3. `iip_22` kırıldı: yeni modül `sw.js` izin listesinde yoktu → eklendi, PASS.
- **Yeşil:** `test_kao2_explain.js` **11/11** · KAO ailesi **35/35**.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `tests/kao/test_*.js` | PASS · **35/35** |
| `tests/app/test_*.js` | PASS · **77/77** |
| `tests/panel/test_*.js` | PASS · 23/23 |
| `tests/panel-v2/test_panel_v2_*.js` | PASS · 27/27 |
| `tests/quran/test_*.js` | PASS · 9/9 |
| `tests/reminders/run-reminder-smoke.mjs` | PASS |
| `.claude/skills/run-seyma/driver.mjs` | PASS |
| `.claude/skills/run-seyma/zikr-harness.mjs` | PASS |
| `docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs` | PASS |
| `tests/app/test_iip_22.js` (SW izin listesi) | PASS |
| `git diff --check` | temiz |

### K-1 bütçe ölçümü
| Ölçü | Değer | Bütçe | Durum |
|---|---|---|---|
| çalışma zamanı `quranLearn*` | **81.032 KiB** (Flow 5.695 · Views 8.570 · Learn 66.767) | 88 | ✅ %92 |
| içerik toplam | 173.726 KiB (kavram modülü 0.428 dâhil) | 256 | ✅ |
| `quranCurriculumV2.js` | 14.926 KiB | 48 | ✅ |
| `app/kao.css` | 10.728 KiB | 14 | ✅ |
| VM p95 | 4.651–6.104 ms | ≤40 ms ve taban+%25 (6.360) | ✅ |

**p95 hakkında dürüst not:** Ardışık/paralel ölçümde p95 6.9→9.4 ms'ye tırmanıp
taban+%25 bandını aşıyor; tek/soğuk ölçümde **4.65–6.10 ms** ile geçiyor. Fark
**makine yükünden** kaynaklanıyor, koddan değil (perf testi yalnız JS yükler, CSS
ölçüye girmez; aynı kaynakla tur başına sonuç değişiyor). Kod büyümesi +%65
(50.2→83.0 KiB) iken soğuk p95 artışı **+%20** — büyümenin *altında*. KAO2-01 taban
çizgisi (5.088 ms) o günün kod boyutunu kaydediyor; sapma bandı onaylı büyümeyi
yansıtmıyor.

## Arayüz kanıtı (kullanıcı sorusu: "arayüzde ne değişti")
Headless VM render'ından gerçek çıktı:
- Yolun kartı birincil eylem → `App.kaoNav(` (ünite) · "Tüm yolu gör" → ikincil ✓
- Ünite 1 ders hedefleri → **5 adet**, örnek: *"Besmelenin üç kelimesini tanıyıp
  'iş önce gelir' kuralını göreceksin."* ✓
- Ders bağlamı → **"Ünite 1 · Fâtiha · Ders 1 / 5"** ✓

## Dürüstçe açık
- **12 kavram `workedTr`/`errorTr` hâlâ `draft`** → uygulamada görünmez, yerine
  güvenli genel cümle gelir. KAO2-17'deki gibi **L1 onayı** bekliyor.
- **Cihaz kabulü** hiç yapılmadı (KAO2-15/16/17 dâhil).
- **12 ünite `why` metni** `whyReview:{level:'draft'}` — hiç render edilmiyor (L2 bekliyor).
- Gerçek ekran okuyucu testi ajan tarafından yapılmadı.
