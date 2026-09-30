# KAO2-16 — Taş düzeltmesi ve mevcut kullanıcı geçişi
Tarih: 2026-09-29 · Dal: kao2-yeniden-tasarim · Önceki commit: 6dae1c9c

## Yapılan
- **Fâtiha taşı düzeltildi (03 §2):** koşul artık "Ünite 1 sıklık dilimi" değil,
  `prayerTexts.fatiha` içindeki **doğrulanmış** lemmaların tamamı için ar>tr
  kartı review ∧ s≥7. Sıklık dilimi artık Fâtiha taşını vermez (test bunu sınar).
- **Namaz taşı:** tüm `prayerTexts` lemmaları aynı koşulla (35 doğrulanmış lemma).
- **Besmele taşı (yeni):** `s0.12` dersi tamam **ya da** yerleştirme okuma ≥7/8.
- **Ünite taşları (yeni, 12 adet):** `u1…u12`, `path.units[id].masteryAt` yazıldığında.
- **Kapsam taşları korundu:** `half` 0,50 · `twoThirds` 0,68 · `eighty` 0,75 (KF-12).
- **Taş anahtar uzayı tek kaynaktan:** `KAO_MILESTONE_CORE` + müfredat üniteleri;
  etiketler `kaoMilestoneLabels()` ile üretilir (`u1` → ünite adı).
- **Eski kayıt korunur:** taş yalnız boş alana yazılır; yeni anahtar eskisini ezmez
  (eski koşulla kazanılmış `fatiha` silinmez, `u1` ayrı anahtardır).
- **Geçiş güvenliği:** `ensureQuranLearn` yeni anahtarları tanır ama mevcut kayıtlara
  `u*` enjekte etmez (JSON şişmez); boş durumda tam şekil kurulur.
- **Panel projeksiyonu:** `milestoneCount`, `unitMilestones`, `besmele` yalnız
  sayısal/bool taşınır (metin sızmaz).
- **`kaoUnitSlices` kaldırıldı** (kullanan kalmadı; geçiş dönemi bitti).

## TDD
- Kırmızı: `test_kao2_milestones.js` → `AssertionError: hepsi eşikte kazanılır`;
  `test_kao2_migration.js` → `AssertionError: partial.milestones korunur`.
- Yeşil: **milestones 8/8** · **migration 12/12** · KAO ailesi **33/33**.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `node --check` (quranLearn / Flow / Views / CurriculumV2) | PASS |
| `tests/kao/test_*.js` | PASS · **33/33** |
| `tests/app/test_*.js` | PASS · 77/77 |
| `tests/panel/test_*.js` | PASS · 23/23 |
| `tests/panel-v2/test_panel_v2_*.js` | PASS · 27/27 |
| `tests/quran/test_*.js` | PASS · 9/9 |
| `tests/reminders/run-reminder-smoke.mjs` | PASS |
| `driver.mjs` · `zikr-harness.mjs` | PASS |
| `kao-verify-contrast.mjs` | PASS |
| `test_kao2_perf_budget.js` | PASS · içerik 168.483 · runtime **79.005** KiB (≤80) · CSS 10.421 · p95 4.733 ms |
| `git diff --check` | PASS |
| `kao2-sync-check.mjs` | PASS · 17/28 done · next KAO2-17 · seq 65 |

## Ölçümler
- Fâtiha lemmaları: **23** · tüm namaz lemmaları: **35** (yalnız doğrulanmış).
- Ünite taşları: 12/12; başlangıçta hiçbiri kazanılmaz, ustalıkta kazanılır.
- Kapsam taşları 0,50/0,68/0,75 eşiklerinde kazanılır.
- JSON boyut artışı: geçişte **≤7 KB** (ölçüldü).
- Geçiş: boş/kısmi/zengin/bozuk dört senaryoda idempotent ve kayıpsız.

## Bilerek değişen testler (P2.4)
- `tests/kao/test_kao_requirements.js`: fatiha/namaz beklentileri sıklık diliminden
  gerçek namaz lemmalarına geçti; besmele aday listesine eklendi · gerekçe 07 §6.
- `tests/kao/test_kao_panel_projection.js`: izinli anahtar listesine `besmele`,
  `milestoneCount`, `unitMilestones` eklendi · gerekçe: yeni sayısal projeksiyon.
- `tests/kao/test_kao_migration.js`: taş şekli güncellendi **ve** eksik olan
  `quranCurriculumV2.js` modülü eklendi (KAO2-07 öncesi yazılmıştı) · gerekçe:
  taş anahtarları müfredattan türer.

## Kanıt düzeyleri
- Kaynak/test: PASS · Yayın: **yapılmadı** (izin KAO2-15'te bitti) · Cihaz: doğrulanmadı.

## Sürprizler / backlog
- **Bütçe dar:** runtime 79.005/80 KiB → KAO2-17+ için yalnız ~1 KiB yer kaldı;
  yeni içerik/UI kartı bütçeyi aşabilir, kart başında ölçülmeli.
- Cihazda taş kutlaması ve geçiş davranışı doğrulanmadı.
