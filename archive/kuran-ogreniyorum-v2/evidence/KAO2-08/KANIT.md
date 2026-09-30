# KAO2-08 — "Sıradaki adım" motoru (quranLearnFlow.js)
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: e87e1f0a

## Önkoşul
- LEDGER seq31 `GATE · —`: G2 closed (kullanıcı "Onay + Ünite 6 dengele"; dengeleme seq30 FIX, commit e87e1f0a).

## Yapılan
- `app/core/quranLearnFlow.js`: saf fonksiyonlar `curriculum(content)`, `lessonOf(content, lemmaId)`, `lessonProgress(q, lessonId, content)`, `unitProgress(q, unitId, content)`, `nextStep(snapshot, now, content)`, `estimateMinutes(daily, tasks, now, capMinutes)`. Girdi salt okunur (`snapshot = {quranLearn, night}`), saat yalnız parametre; DOM/ağ/zamanlayıcı/depo/`Date.now` yok. Gezinme yığını API'si aynen korundu (`version: 1`).
- `nextStep` öncelik sırası (05 §4, ilk eşleşen): onboarding → night-review (`kaoNightWindow` dakika/kart) → warmup (7+ gün ara, en zayıf 10) → s0-lesson (`onboarding.start='s0'`) → mastery (ünite dersleri bitti, `path.units[id].masteryAt` yok) → next-unit (önceki ünite tamam, yeni ünite başlamadı) → daily (tekrar ≤20 + sıradaki dersin tanıtılmamış kelimeleri; tekrar borcu >60 → yeni 0) → rest. Her sonuç `{kind, title, subtitle, minutes, action, param, counts}`.
- Ders tamamı türetilebilir (08 §1): `path.lessons[id].doneAt` ya da dersin tüm lemmalarının ar>tr kartı.
- `app/core/quranLearn.js`: `ensureQuranLearn` içinde `normalizeOnboarding`/`normalizePath` (yalnız ekleme; kartı olan kullanıcıda `onboarding.doneAt='legacy'`; bozuk tipler varsayılana; bilinmeyen alanlar korunur; idempotent). `kaoContinue` oturum kuyruğunun son cevabından sonra `daily[today].sessionDone=true` yazar (gece tekrarı hariç; render içinde yazım yok). Yeni motor sarmalayıcısı `kaoNextStep(nowValue)` (registry dışa aktarımı; yeni `App.*` handler'ı yok, app.js değişmedi).

## TDD
- Kırmızı (`red.txt`): `node tests/kao/test_kao2_next_step.js` → `AssertionError: Flow.curriculum eksik` (exit 1); `node tests/kao/test_kao_migration.js` → `Expected values to be strictly deep-equal` (yeni `onboarding`/`path` alanları yok; exit 1).
- Yeşil (`green.txt`): next step 13/13 PASS; migration PASS (empty/old/broken/idempotent/orphan/114 surah/onboarding/path).

## Kapılar (P3)
Tam çıktı: `gates.txt`.

| Komut | Sonuç |
|---|---|
| `node --check` quranLearn.js / quranLearnFlow.js / quranLearnViews.js / quranCurriculumV2.js | PASS ×4 |
| tests/kao | 24/24 PASS |
| tests/app | 77/77 PASS |
| tests/panel | 23/23 PASS |
| tests/panel-v2 | 27/27 PASS |
| tests/quran | 9/9 PASS |
| reminders smoke | PASS |
| run-seyma driver | PASS |
| zikr-harness | 95/95 PASS |
| kao-verify-contrast | 382 çift, 0 ihlal |
| kao2-sync-check | PASS |

## Ölçümler
- Tablo: 7 ana satır + 2 kenar satırı PASS; her sonuçta başlık/alt başlık dolu, dakika sonlu; `nextStep` girdiyi değiştirmedi (JSON karşılaştırması).
- Flow yasaklı API taraması: `document`, `location`, `fetch`, `setTimeout`, `localStorage`, `Date.now` → 0.
- Boyut: runtime gzip 54,923 → 58,813 KiB (≤80); içerik 168,483 KiB (≤256); VM p95 4,225 ms (taban +%25 = 6,36). Durum bütçesi PASS (400 gün, 40,3 KB). Pin `20260928b` değişmedi.

## Bilerek değişen testler
- `tests/kao/test_kao_migration.js`: boş kök beklentisine `onboarding {doneAt:null,start:null,minutes:5,intent:null,whatsNewAt:null}` ve `path {lessons:{},units:{}}` eklendi (kartın Dokun listesi, yeni alan). Ek beklentiler: eski kartlı veri → `doneAt:'legacy'`; bozuk tipler → varsayılan; geçerli değerler korunur, geçersiz tarih/puan null, sayı olmayan ünite anahtarı atılır; idempotent.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok (kullanıcıda).

## Sürprizler / backlog
- Yorum: 05 §4 tablosunda "ünite tamam → sonraki ünite tanıtımı" 4. satırdan (günlük ders) sonra geliyor; sırayla uygulanırsa 6. satıra hiç ulaşılamaz. Bu yüzden next-unit, "önceki ünite tamam ve yeni ünite hiç başlamadı" koşuluyla günlük dersten önce kontrol edilir ve yeni ünitenin ilk dersini başlatır.
- `action` değerleri (`kaoOnboarding`, `kaoOpenS0`, `kaoMastery`) henüz bağlı handler değil; KAO2-09/11/12 kartlarında bağlanacak tanımlayıcılardır. `kaoStart`/`kaoOpenAyah` mevcut.
- `daily[].ms` henüz yazılmıyor; `estimateMinutes` bu yüzden şimdilik 0,55 dk/görev yedeğini kullanır (backlog: görev süresi kaydı ders oynatıcıyla, KAO2-12).
- İlk açılış ekranı (KAO2-11) gelene kadar kart üreten her kullanıcı `legacy` sayılır; bu, mevcut kullanıcıya ilk açılışı göstermeme kuralının doğal sonucu.

## Ek — FIX (KAO2-00…09 denetimi, 2026-09-29)
- Bulgu: tekrar borcu >60 iken önceki ünite tamam ve yeni ünite başlamamışsa `nextStep` `next-unit` döndürüyordu ("Sıradaki ünite: …" + ünite vaadi, `counts.fresh=0`). Bu durum 05 §10 "Tekrar borcu çok (>60) → 'Bugün yalnız tekrar'; yeni kelime 0" kuralına aykırıydı. Pratik etkisi şimdilik gizli: `masteryAt` KAO2-13'e kadar yazılmadığından üretimde bu dala ulaşılamıyor.
- Düzeltme: `app/core/quranLearnFlow.js` `lessonStep`: `next-unit` yalnız `fresh>0` iken seçilir; borçta `daily` + "önce tekrarları bitirelim" döner.
- TDD: kırmızı `node tests/kao/test_kao2_next_step.js` → `AssertionError … actual: 'next-unit'` (exit 1); yeşil → `KAO2-08 next step: PASS (14 kontrol)`.
- Bilerek değişen test: `test_kao2_next_step.js` yeni kenar satırı (sıkılaştırma; mevcut beklenti değişmedi).
