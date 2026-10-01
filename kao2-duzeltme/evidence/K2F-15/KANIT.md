# K2F-15 — Seviye 0 4/4 — ana yol ve tamamlama
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: eeb239cf · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K5-01 · K5-02 (iii) · P-05 · R değişimi: R-04 fail→pass

## İlerleme günlüğü
- [x] P1: sync PASS (15/44, nextPrompt K2F-15, seq 43); K2F-15 in_progress
- [x] Ölçüm: S0 öğrencisinin Bugün düğmesi `kaoLesson('start','s0.xx')` → ders oynatıcının boş planı (goal,apply,summary); S0 tamamlanması `path.lessons`'a yazılmıyor; Keşfet satırı `cards>0` koşuluna bağlı; ilk açılış sonu da ders oynatıcıya gidiyor
- [x] Kırmızı: `test_kao2_s0.js` (j) → `AssertionError: ilk S0 içeriği açıldı` (ilk açılıştan sonra görünüm `s0` değildi)
- [x] Flow `s0-lesson` eylemi `kaoS0`; hero → `kaoS0('start', id)`; `kaoLessonStart('s0.xx')` S0 yüzeyine devreder; `kaoS0Complete` (yalnız read bitince); `kaoS0Visible`; `kaoLessonStart` motor yüzeyine açıldı (handler değil)
- [x] Dokun içi iki test eski davranıştan (S0 → ders oynatıcı) yeni davranışa güncellendi
- [x] Kapılar, P4

## Yapılan
- `app/core/quranLearnFlow.js` (tek dokunuş): `nextStep` S0 adımının eylemi `kaoS0` (ders oynatıcı değil).
- `app/core/quranLearn.js`:
  - Bugün hero: `s0-lesson` → `{name:'kaoS0', args:['start', param]}` (R-04: S0 öğrencisi için ders oynatıcıda boş plan kurulmaz).
  - `kaoLessonStart('s0.xx')` (ve `kaoLesson('start','s0.xx')`, ilk açılış sonu `kaoLessonStart(firstS0,'intro')`) `kaoS0('start')`'a devreder; boş plan kurulmaz.
  - `kaoS0Start` `path.lessons[id].startedAt` yazar; `kaoS0('read')` (çıplak = "Okudum") `kaoS0Complete`: `{startedAt, doneAt, score = alıştırma doğru/toplam}` + `recordMilestones` (Besmele taşı yalnız `s0.12` doneAt ya da yerleştirme geçişiyle; `read toggle` tamamlama sayılmaz).
  - `kaoS0Visible(q)`: Keşfet "Seviye 0" satırı `onboarding.start==='s0'` ya da başlanmış/bitmiş S0 dersi ya da kart varsa görünür.
  - Motor yüzeyine `kaoLessonStart` (yeni handler değil; App yüzeyi değişmedi).
- Testler: `test_kao2_s0.js` (j) 5 kontrol (27 kontrol): (a,g) "Henüz değil" → ≤3 dokunuş (next · choose · finish) ve Bugün birincil düğmesi `kaoS0("start","s0.01")`; (b) devir, boş plan yok; (c) tamamlama kaydı yalnız read sonrası, score = doğru/toplam; (d,e) 12 ders uçtan uca → sonra Fâtiha (`u01.01`), Besmele taşı yalnız s0.12; (f) Keşfet satırı 4 durum.

## TDD
- Kırmızı: `node tests/kao/test_kao2_s0.js` → `AssertionError: ilk S0 içeriği açıldı`
- Yeşil: `KAO2 s0: PASS (27 kontrol)`

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (49) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 184.231 KiB · runtime 110.297 KiB · css 13.248 KiB · p95 4.074 ms · steady 2.881 ms)
```
tekrar-uret: 8/10 PASS (önceki 7/10)

## Ölçümler
- `tekrar-uret`: **8/10 PASS** (önceki 7/10) — R-04 fail→pass ("S0 öğrencisi → s0.01 planı: " boş = ders oynatıcıda plan kurulmadı); kalan R-07, R-08.
- İlk açılıştan ilk S0 içeriğine 3 dokunuş (hedef ≤3 ✓). 12 S0 dersi uçtan uca: her ders kaydı `doneAt`; sonrasında sıradaki adım `daily u01.01` (Fâtiha).
- Bütçe: runtime ≈110 KiB (tavan 128). Pinler değişmedi: App.kao* 43 · yüzey 764 · atama 602 · yayın 20261001e (yayınlanan `quranLearn.js`, `quranLearnFlow.js` değişti → sonraki yayında pin yükselmeli).

## Bilerek değişen testler
- `tests/kao/test_kao2_onboarding.js`: ilk açılış sonu `kaoView` `'session'` → `'s0'` (+ `kaoS0.lessonId==='s0.01'`) · gerekçe: S0 artık ders oynatıcıya değil S0 yüzeyine açılır · K5-01.
- `tests/kao/test_kao2_mastery.js` (K2F-08'den, Dokun dışı, kullanıcı onayıyla): D(e) uçtan uca yürüyüşte `s0-lesson` adımı S0 eylemleriyle (next · cevaplar · Okudum) bitirilir; ustalık/ünite iddiaları aynı · K5-01.
- `tests/kao/test_kao2_today.js`: s0 adımının birincil düğmesi `App.kaoLesson("start",…)` → `App.kaoS0("start","s0.01")` · K5-01.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Seviye 0 zinciri (K2F-12…15) kaynak/test düzeyinde tamam: düğme → görünüm → içerik → aşamalar/alıştırma → kayıt/taş → Fâtiha. Yayından önce cihazda telefonda gözle doğrulama önerilir (görsel QA yapılmadı; computer-use aracı yok).
- `kaoS0Complete` `recordMilestones` çağırır; taş bildirimi `kaoFx('milestone')` ile verilir, ayrı bir kutlama ekranı yok (S0 görünümünde "Ders tamam" metni).
- S0 yeniden yapılabilir (done sonrası `start` yeniden açar, `doneAt` korunur, `score` son denemeyle güncellenir).
