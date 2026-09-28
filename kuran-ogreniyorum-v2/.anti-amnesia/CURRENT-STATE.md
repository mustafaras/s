# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-08
lastSeq: 31
status: active
-->

Son güncelleme: 2026-09-28 · LEDGER seq31

## Şu an neredeyiz
KAO2-00…07 tamamlandı (8/28). KAO2-07 müfredat omurgası yerel commit olarak kapandı: derleme aracı, spec, `quranCurriculumV2.js` ve G2 inceleme listesi. **G2 kapandı** (seq31): kullanıcı eşlemeyi Ünite 6 dengelemesiyle onayladı (FIX seq30). KAO2-07 yayımlanmadı (push/deploy yok).

## Sıradaki kartın tek cümlesi
KAO2-08 "sıradaki adım" motoru (`quranLearnFlow.js`) — G2 önkoşulu karşılandı.

## Canlı gerçekler
- Müfredat: 12 ünite · 109 ders · 524/524 `l_*` lemma tam 1 derste · derste 3–7 kelime · 25/25 kavram bağlı · S0 `s0.01…s0.12` · semNeighbors aynı derste 0.
- Ünite kelime/ders: Ü1 23/5 · Ü2 16/3 · Ü3 28/6 · Ü4 25/5 · Ü5 10/2 · Ü6 147/30 · Ü7 42/9 · Ü8 46/9 · Ü9 57/11 · Ü10 98/20 · Ü11 21/6 · Ü12 11/3.
- Araç: `node tools/kao2-curriculum-build.mjs` (belirlenimci, iki çalıştırma bayt-eşit); değişiklik yalnız `kuran-ogreniyorum-v2/content/curriculum.spec.json` üzerinden.
- Boyut: müfredat gzip 10,111 KiB (≤48); içerik toplamı 168,476 KiB (≤256); VM p95 4,1–4,7 ms (taban +%25 = 6,36 ms).
- Yeni modül dört yükleme listesinde + `sw.js`; pin `20260928b` korundu. `.claude/skills` iki FILES listesi K-2 gereği Edit aracıyla düzenlendi.
- P3: syntax, KAO 23/23, app 77/77, panel 23/23, panel-v2 27/27, Quran 9/9, reminders, driver, zikr 95/95, kontrast 382/0, sync PASS.
- `KAO2-STATE.json`: KAO2-07 done, nextCard KAO2-08, ledger seq31, G2 closed, releaseApproval `approved_through_KAO2-06` (KAO2-07 kapsam dışı).
- Son yayın hâlâ KAO2-05…06 (`b36db6b2`, Pages run 36446272528); gerçek cihaz kabulü doğrulanmadı.
- README eski satırında KAO2-03'ü sıradaki gösteriyor; değiştirilmedi.

## Açık riskler
- Ünite 6 (147 kelime, 30 ders) dengelemeden sonra da hedef 20–60 üstünde; Ünite 5 (10) ve 12 (11) altında — kullanıcı G2'de kabul etti.
- Ünite 2, eski plan odak listesinden 11 kimlikle genişletildi (G2'de kabul edildi).
- Tüm ünite/ders başlıkları `review.level: draft`; K-4 L1/L2 incelemesi yapılmadı.
- Kaynak/test kanıtı cihaz kabulü anlamına gelmez; G1, G3, G4 açık.

## Bekleyen kullanıcı işleri
- KAO2-07 için yayın (push/deploy) ayrı onay ister.
