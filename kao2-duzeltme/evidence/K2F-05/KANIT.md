# K2F-05 — Ustalık 1/4 — saf masteryPlan
Tarih: 2026-09-30 · Dal: kao2-duzeltme · Önceki commit: 430539ec · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K4-01 (1/4) · R değişimi: yok (R-01/R-02 K2F-06'da)

## İlerleme günlüğü
- [x] P1: sync PASS, dal doğru, K2F-05 in_progress; önceki erken yayın (430539ec) canlı doğrulandı (LEDGER seq 14)
- [x] Ünite/çapa/practice şekilleri ölçüldü (units[].anchor dizisi, lessonPlan makeWord)
- [x] `test_kao2_mastery.js` bölüm A yazıldı, kırmızı görüldü (`masteryPlan` tanımsız)
- [x] Flow'a `masteryPlan` ve `unitMastery` eklendi → 17/17 PASS
- [x] README, kapilar.sh YEŞİL (runtime bütçesi içinde), P4

## Yapılan
- `app/core/quranLearnFlow.js`: saf `masteryPlan(snapshot, unitId, now, content)` ve `unitMastery(q, unitId)`; dış yüzeye eklendi.
  - Plan: `goal` → (çapa `prayer:`/`surah:` ise) `read` → 10 × `practice` → `summary`; hepsi `mastery:true`, `unitId` taşır.
  - practice: `choiceCount:4`, yalnız ünitenin tanışılmış lemmaları, en zayıftan (kart `s` artan; kartsız = 0). Tanışılmış <10 ise yönler (`ar>tr`, `tr>ar`, sesli varsa `audio>meaning`) turlanarak 10'a tamamlanır; kimlik `mastery:<ünite>:<lemma>:<yön>[:r<tur>]`.
  - Belirlenim: tohum `unitId + dayKey(now)` (FNV-1a) yalnız eşit kararlılığı kırar; aynı gün bayt-eşit.
  - `read`: çapa metinlerinin kelimeleri `applyWords` ile (Arapça yalnız içerik modülünden); lemma-pool çapalı ünitede yok.
  - `unitMastery`: `passed > skipped > repair > failed > none`, `{state, score (0–1|null), attempts (≥0 tam)}`; bozuk alanlar güvenli varsayılan.
  - Tanışılmış lemma 0 ya da ünite yok → `null`.
- `tests/kao/test_kao2_mastery.js` (yeni, 17 kontrol) + `tests/kao/README.md` satırı.

## TDD
- Kırmızı: `node tests/kao/test_kao2_mastery.js` → `AssertionError: Expected values to be strictly equal: 'undefined' !== 'function'` (masteryPlan yok)
- Yeşil: aynı komut → `test_kao2_mastery (bölüm A): 17 kontrol PASS`

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (48) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 177.657 KiB · runtime 93.633 KiB · css 12.815 KiB)
```
tekrar-uret: 2/10 PASS (önceki 2/10)

## Ölçümler
- Runtime gzip 92,439 → 93,633 KiB (+1,194; tavan 128). İçerik ve css değişmedi.
- Pinler değişmedi: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930m. `quranLearn.js` ve `app.js` değişmedi.
- Flow saflığı: Date.now/depo/ağ/zamanlayıcı/Math.random yok (testte kaynak taraması); derin dondurulmuş girdiyle çalışır.

## Bilerek değişen testler
- yok

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: bu prompt yayınlanmadı (canlı `main` 430539ec, K2F-05 sonrası) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- K2F-06 `kaoLessonStart`'ta `masteryPlan`'ı kullanacak; practice öğelerinde `lessonId` yok, `unitId` var (oturum/kayıt kodu buna göre yazılmalı).
- Ünite 2 çapası 6 namaz metni, Ünite 3 çapası 3 sûre: `read` öğesi hepsini tek listede birleştirir, `anchors` hangi çapaların kullanıldığını söyler.
- Test içinde VM dizileri/hataları başka realm'den: `Array.from(…)` ve `assert.throws(…, {name})` kullanıldı.
