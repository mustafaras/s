# KAO2 — CURRENT STATE (tek sayfa, her kartta yeniden yazılır)

<!-- kao2-sync
nextCard: KAO2-00
lastSeq: 4
status: planning
-->

**Son güncelleme:** 2026-09-28 · LEDGER seq 4 · plan `main`'de ve yayında; uygulama kodu değişmedi

## Şu an neredeyiz
- Analiz ve plan tamam (01–09), 4 karar alındı (10-KARARLAR.md, G0 kapalı).
- Uygulama **başlamadı**. Sıradaki kart: **KAO2-00** (dal açma + K-1 bütçe/süre kapısının koda yansıması + kaynakça teyidi).
- Plan `main`'de (`KAO2-PLAN` commit'i, LEDGER seq 4). Dal henüz yok; KAO2-00 `main`'den `kao2-yeniden-tasarim` dalını açar.

## Sıradaki kartın tek cümlesi
KAO2-00: `kao2-yeniden-tasarim` dalını aç; `test_kao_user_tasks.js` R-C5 bütçesini
K-1 tavanlarına çevir, `test_kao2_perf_budget.js`'i ekle, ses bütçesini 24 MB yap,
04 kaynakçasını teyit et.

## Canlı gerçekler (her oturumda doğru kabul et, şüphedeysen doğrula)
| Konu | Değer |
|---|---|
| KAO çalışma zamanı | `app/core/quranLearn.js` (1.899 satır), `app/kao.css` (93 satır) |
| İçerik modülleri | `app/content/quran{Lexicon,Grammar,ShortSurahs,Phonics}V1.js`, gzip 158,4 KiB |
| Handler yüzeyi | 35 `App.kao*` (app.js L3904); KAO2 en çok +5 ekler |
| Yayın pini | `20260927g` (index.html, sw.js `SW_VERSION`/`SW_OFFLINE_VERSION`, tests/app/test_iip_22.js); yalnız KAO2-27'de değişir |
| KAO fixture'ları | `tests/kao/` 17 dosya + `tests/kao/README.md` |
| Yükleme sırası listeleri | index.html · .claude/skills/run-seyma/driver.mjs · .claude/skills/run-seyma/zikr-harness.mjs · tests/app/test_state_rebind_boundary.js |

## Açık riskler / dikkat
- `.claude/skills/*` Bash sandbox'ında yazmaya kapalı → yalnız Edit aracı; izin yoksa BLOCKED (K-2).
- fx2 düz metin tarayıcıları yorumları da sayar: yorumda handler ataması ya da tıklama niteliği adı yazma.
- Tarayıcı açma yok (CLAUDE.md DATA SAFETY); görsel QA yalnız 127.0.0.1:9000 kuralıyla ve yalnız KAO2-10 / KAO2-27'de.

## Bekleyen kullanıcı işleri
- (K-3) Hece kaydı için nitelikli okuyucu ve lisans izni: KAO2-22'ye kadar gerekmez.
- (K-4) L2 alan uzmanı ataması: KAO2-17'den itibaren metinler `sourced` düzeyinde ilerleyebilir.
