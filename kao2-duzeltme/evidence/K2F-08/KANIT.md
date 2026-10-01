# K2F-08 — Ustalık 4/4 — görünümler, taşlar, uçtan uca
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: 7906b071 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K4-01 (4/4) · R değişimi: yok (R-01/R-02 PASS kalır)

## İlerleme günlüğü
- [x] P1: sync PASS, K2F-08 in_progress; Views path/unit/hero, milestone ve home kodu okundu
- [x] Harness: `tap`/`tapPrimary`/`tapSecondary`/`playLesson`/`countClass` (işaretlemeden gerçek `App.kao*` çağrısı)
- [x] `test_kao2_mastery.js` bölüm D yazıldı, kırmızı görüldü (`data-mastery-state` yok)
- [x] Üretim: Ünite modeli + Views ustalık satırı, Bugün kahramanı ikincil düğme, özet metinleri, taş, CSS
- [x] Kapı kırıkları: kontrast (`background:none`) ve `test_kao2_path` beklentisi giderildi
- [x] kapilar.sh YEŞİL, P4

## Yapılan
- `app/core/quranLearn.js`
  - `kaoUnitModel`: ders başlığında `Ustalık:` öneki yok (`lesson.mastery` yok sayılır); yeni `mastery` satırı (locked ○ · current/repair ● · passed ✓ %puan · skipped Atlandı); dersler bitince birincil eylem `Ustalığa başla` (ünite) / `Onarım turuna başla` (`repair:<id>`).
  - `kaoHomeHero`: mastery adımında `secondary` = "Şimdilik atla" (`kaoLesson('skip-mastery', id)`); `KAO_HOME_ACTIONS.mastery` etiketi "Ustalığa başla".
  - `kaoMasteryRecord`: ustalık geçilince `recordMilestones` ile `u<n>` taşı (atlama/kalma taş vermez); kazanılanlar özet için `state.earnedMilestones`.
  - Ustalık özeti: "10 sorudan N doğru · geçmek için en az 8", geçti/kaldı cümlesi, tek taş satırı, sıradaki adım.
- `app/core/quranLearnViews.js`: `heroCard` `secondary` düğmesi (`.kao-hero-secondary`, birincil değil); `unitScreen` ayrı "Ustalık" bölümü (`data-mastery-state`).
- `app/kao.css`: `.kao-hero-secondary`, `.kao-unit-mastery*` (yalnız token renkleri).
- Testler: `test_kao2_mastery.js` bölüm D (10 kontrol; toplam 45), `test_kao2_path.js` (bilerek değişen), harness yardımcıları, README.

## TDD
- Kırmızı: `node tests/kao/test_kao2_mastery.js` → `AssertionError … + undefined - 'locked'` (ustalık satırı yok)
- Yeşil: `test_kao2_mastery: bölüm A 17 + B 11 + C 7 + D 10 = 45 kontrol PASS` (~28 sn)

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (48) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast (746 çift, 0 ihlal) · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 177.657 KiB · runtime 97.532 KiB · css 12.938 KiB)
```
tekrar-uret: 4/10 PASS (önceki 4/10)

## Ölçümler
- Runtime gzip 96,683 → 97,532 KiB (+0,849; tavan 128); css 12,815 → 12,938 KiB (tavan 14).
- Uçtan uca (yalnız dokunuşlarla): sıfır kullanıcı onboarding → Ünite 1 dersleri → ustalık → Ünite 2; v1 kullanıcı (Ü1–3 kartlı) ustalık 1,2,3 "Şimdilik atla" → Ünite 4; atlama `u1–u3` taşı vermez.
- Ekran başına `.kao-primary` ≤1: Ünite, Bugün (mastery/repair), ustalık özeti.
- Pinler değişmedi: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930m (yeni handler yok).

## Bilerek değişen testler
- `tests/kao/test_kao2_path.js`: tamamlanmış ünitede "birincil düğme yok" → "tek çalışan 'Ustalığa başla' düğmesi; ustalık geçilmişse yine düğme yok" · eski beklenti çalışmayan düğmeyi yasaklıyordu, artık düğme çalışan ustalık eylemi · K4-01.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (canlı main 86a56267; K2F-06…08 yayınlanmadı) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Kontrast aracı `background:none`'u çözemiyor; `transparent` kullanıldı.
- Onboarding seçim ekranlarında birincil düğme yok (kullanıcı seçeneğe dokunur); testte ilk seçeneğe dokunuldu.
- Taş alanları başlangıçta `null`; testler "boş" (`!value`) olarak yazıldı.
- K4-01 kaynak/test düzeyinde kapandı; canlıda kilit YAYIN-1 (K2F-18) ile açılacak.
