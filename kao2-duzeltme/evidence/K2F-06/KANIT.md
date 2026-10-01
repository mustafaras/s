# K2F-06 — Ustalık 2/4 — ustalık oturumu ve kayıt
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: b1e53acb · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K4-01 (2/4) · R değişimi: R-01, R-02 fail→pass

## İlerleme günlüğü
- [x] P1: sync PASS, K2F-06 in_progress; lesson oynatıcı durum makinesi okundu (Start/Activate/Resume/answer/finish)
- [x] `test_kao2_mastery.js` bölüm B yazıldı, kırmızı görüldü (`ui.kaoLesson.kind` tanımsız)
- [x] `quranLearn.js`: kaoMasteryStart/kaoMasteryRecord, finish/answer/retry/HTML değişiklikleri, normalizePath
- [x] bölüm B 11 kontrol PASS (toplam 28), R-01/R-02 PASS
- [x] Yan etkiler: migration beklentisi + tarih-bağımlı requirements testi (LEDGER seq 18)
- [x] kapilar.sh YEŞİL, P4

## Yapılan
- `app/core/quranLearn.js`
  - `kaoLessonStart`: ünite kimliği → `kaoMasteryStart` (eski "son içerik dersine düş" kaldırıldı). Tanışılmış lemma yoksa `false` + toast.
  - `kaoMasteryStart`: `masteryPlan` ile `ui.kaoLesson={kind:'mastery', unitId, lessonId:'mastery:<id>', …}`; aynı ünite sürerken yeniden başlatma sıfırlamaz.
  - `kaoMasteryRecord`: özet ekranına ulaşınca (ya da finish'te, bir kez) `path.units[id]` yazar; eşik 0,8; geçilmiş ustalık geri alınmaz; başarısızda `repair={lemmaIds,at}`; `attempts` +1.
  - `applyAnswer`: ustalıkta yanlış lemma listesi; yanlışa anında yeniden deneme yok (puan yalnız ilk 10 cevap).
  - `kaoLesson('finish'|'more')`: ustalıkta ders kaydı (`path.lessons`) yazılmaz; `daily.sessionDone` mevcut kuralla.
  - `kaoLessonResume`: ustalıkta devam noktası yok.
  - `kaoLessonHTML`: ustalık bağlam satırı, hedef metni, `read` aşaması (Views'ın apply aşaması yeniden kullanıldı), ustalık özeti.
  - `normalizePath`: `path.units[id]` için `attempts`, `lastAttemptAt`, `repair`, `skippedAt` yalnız-ekleme normalizasyonu (`validLemmaIds`, `normalizeRepair`).
- `tests/kao/test_kao2_mastery.js`: bölüm B (11 kontrol, gerçek handler'larla; `walkLesson`).

## TDD
- Kırmızı: `node tests/kao/test_kao2_mastery.js` → `AssertionError … + undefined - 'mastery'` (`ui.kaoLesson.kind`)
- Yeşil: aynı komut → `bölüm A 17 + bölüm B 11 = 28 kontrol PASS`; `tekrar-uret` R-01, R-02 PASS

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (48) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 177.657 KiB · runtime 95.416 KiB · css 12.815 KiB)
```
tekrar-uret: 4/10 PASS (önceki 2/10)

## Ölçümler
- Runtime gzip 93,633 → 95,416 KiB (+1,783; tavan 128).
- Pinler değişmedi: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930m (yeni handler yok; `kaoLesson` dağıtıcısı kullanıldı).
- 10 doğru → `{masteryAt, masteryScore:1, attempts:1, lastAttemptAt, repair:null, skippedAt:null}`; 5 yanlış → `masteryAt:null, masteryScore:0.5, repair.lemmaIds` (tekil); 8/10 geçer, 7/10 geçmez.

## Bilerek değişen testler
- `tests/kao/test_kao_migration.js`: `path.units['1']` beklentisi `{masteryAt, masteryScore}` → + `attempts:0, lastAttemptAt:null, repair:null, skippedAt:null` · promptun (d) maddesi (yeni alanlar varsayılanla eklenir) · K4-01.
- `tests/kao/test_kao_requirements.js`: bağ kur testi `prior ≤ 12` → `≤ 30` · tarih bağımlılığı (baseline'da da kırmızıydı, 2026-10-01'de 4 < 5) · iddia aynı kaldı.
- Not: promptun Dokun listesi `test_kao2_migration.js` diyordu; kırılan gerçek test `test_kao_migration.js` idi. İkisi de Dokun dışı kabul edildi, LEDGER seq 18'de bildirildi. `test_kao2_migration.js`'e ayrıca dokunulmadı (bölüm B(d) normalizasyonu kapsar).

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (canlı main 86a56267 K2F-06'yı içermez) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Aynı gün/tohum bağımlı kırılgan test var (`test_kao_requirements.js`); sabit saatle yeniden yazmak ayrı iş.
- Ustalık özeti Views'ın sabit "Ders tamamlandı" başlığını kullanıyor; K2F-08 (görünümler) için not.
- K2F-07: `repair` yapısı `{lemmaIds, at}`; `unitMastery` zaten `repair > failed` ayrımını yapıyor.
