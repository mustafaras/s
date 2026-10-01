# K2F-07 — Ustalık 3/4 — onarım, atla, sıradaki adım
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: b44741a6 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K4-01 (3/4) · R değişimi: yok (R-01/R-02 PASS kalır)

## İlerleme günlüğü
- [x] P1: sync PASS, K2F-07 in_progress; Flow nextStep/currentUnit ve KAO_HOME_ACTIONS okundu
- [x] Kırmızı: `test_kao2_next_step.js` (5a)–(5e) ve `test_kao2_mastery.js` bölüm C yazıldı (repairPlan/skip/simülasyon tanımsız)
- [x] Flow: `unitProgress.complete/skipped`, `repair > mastery`, `repairPlan`, `rankWeakest` refactor
- [x] Motor: `repair:<id>` oturumu, `kaoRepairFinish`, `kaoMasterySkip` (`skip-mastery`), HOME_ACTIONS repair, kaoCurrentUnit `complete`
- [x] 12 ünite simülasyonu yeşil; kapilar.sh YEŞİL; P4

## Yapılan
- `app/core/quranLearnFlow.js`
  - `unitProgress`: `skipped` ve `complete` (= dersler bitti ∧ (masteryAt ∨ skippedAt)); `currentUnit` `complete` kullanır.
  - `nextStep`: ünite dersleri bitince `unitMastery.state==='repair'` → `kind:'repair'` (başlık "Onarım: <ünite>", eylem `kaoLesson('repair:<id>')`, ~3 dk); aksi hâlde `mastery`.
  - `repairPlan(snapshot, unitId, now, content)`: saf; yalnız `repair.lemmaIds ∩ ünite`, iki yön (`ar>tr`, `tr>ar`), en zayıftan, ≤10 öğe, tanış yok; yoksa/boşsa `null`. `rankWeakest` ortak yardımcı.
- `app/core/quranLearn.js`
  - `kaoLessonStart('repair:<id>')` → `kaoRepairStart` (`kind:'repair'`); `kaoRepairFinish` bitişte `repair:null` (deneme, ustalık, ders kaydı yazmaz).
  - `kaoLesson('skip-mastery', unitId)` → `kaoMasterySkip`: yalnız `skippedAt`; geçilmiş ünitede no-op; taş/masteryAt yok. Yeni `App.*` handler yok.
  - `KAO_HOME_ACTIONS.repair`, hero eylemi `repair` için `kaoLesson(start, 'repair:<id>')`; `kaoCurrentUnit` `complete`.
  - Ustalık/onarım oturumlarında ortak guard (`kaoUnitSession`): devam noktası yok, ders kaydı yok; bağlam satırı, hedef ve özet metinleri onarım için ayrı.
- Testler: `test_kao2_next_step.js` (5a–5e, +5 → 19 kontrol), `test_kao2_mastery.js` bölüm C (7 kontrol, toplam 35), README satırı.

## TDD
- Kırmızı: `node tests/kao/test_kao2_next_step.js` → `AssertionError … + 'mastery'` ((5a) repair beklenirken mastery); `node tests/kao/test_kao2_mastery.js` → `flow.repairPlan` tanımsız
- Yeşil: `KAO2-08 next step: PASS (19 kontrol)` · `test_kao2_mastery: bölüm A 17 + B 11 + C 7 = 35 kontrol PASS`

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (48) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 177.657 KiB · runtime 96.683 KiB · css 12.815 KiB)
```
tekrar-uret: 4/10 PASS (önceki 4/10)

## Ölçümler
- Runtime gzip 95,416 → 96,683 KiB (+1,267; tavan 128).
- 12 ünite simülasyonu: ustalık adımları 1…12 sırayla; Ünite 3 iki kez (kaldı → onarım → geçti, attempts 2, repair null); sonunda "Tüm üniteler tamam ✓"; döngü yok (≤400 adım sınırının altında).
- Pinler değişmedi: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930m.

## Bilerek değişen testler
- yok (yalnız ekleme)

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (canlı main 86a56267) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- "Şimdilik atla" handler'ı hazır ama arayüzde düğme yok → K2F-08 (Bugün kahramanında ikincil metin düğmesi).
- Simülasyon ~25 sn (tests/kao toplam süresini uzatır); ısınma/boşluk adımını tetiklememek için sahte saat sabit, her oturum sonrası `sessionDone` sıfırlanır.
- `unitProgress.mastery` hâlâ yalnız `masteryAt`; taşlar buna bağlı olduğundan atlamak taş vermez (tasarım gereği).
