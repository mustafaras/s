# KAO-03 · Devir — **DONE**

**Tarih:** 2026-09-23 · **Başlangıç HEAD:** `fc0a2ea` · **Durum:** `done` · **Ajan:** Claude Code (claude-opus-5-5)
· Önceki ara durum (`waiting_user`, GitHub Copilot) kullanıcı talimatıyla kapatıldı.

## Ne yapıldı
- `content/lexicon.review.md` **524/524 satır** dolduruldu: `tr1`, `tr2`, `pattern`, `cognateTr`,
  `cognateShift` (yalnız anlam kayması olan 88 satır), `ex1_tr`–`ex3_tr`, `verifiedBy`, `verifiedAt`.
- `content/lexicon.workbook.md` aynı değerlerle güncellendi (`context_tr` = `ex1_tr`); STATE `files` listesine eklendi.
- `--import-md` → `content/lexicon.verified.json`.
- Anlamlar kendi ifadeyle yazıldı; kopya bekçisi 7 satırda birebir referans eşleşmesi yakaladı, hepsi yeniden yazıldı.

## Kontrol sonuçları
| Komut | Exit | Sonuç |
|---|---|---|
| `node tools/kao-lexicon-build.mjs --import-md` | 0 | verified=**524** · unknown=0 · rows=524 · duplicates=0 · copiedFromReferenceTotal=0 |
| `node kuran-ogreniyorum/tools/kao-plan-check.mjs` | 0 | PASS (0 warn) |
| `git -c core.fsmonitor=false diff --check` | 0 | çıktı yok |

## ⚠️ Bilinen sınırlar (dürüst kayıt)
1. **06 §3 iki-göz kuralı karşılanmadı.** Doğrulayıcı tek (YZ: `claude-opus-5-5`), tek gün (`2026-09-23`);
   `twoGazeTotal=0`. İkinci tarih uydurulmadı. Yayın öncesi ilahiyat/Arapça bilen bir insanın ya da ikinci günün
   teyidi **açık iştir** (satırlara `verifiedAt` içinde ikinci tarih eklenip `--import-md` yeniden koşulur).
2. `--import-md` yalnız `ex1_tr`'yi içe alır; `ex2_tr`/`ex3_tr` tabloda dolu ama `verified.json`'da boş
   (514 lemma). Araç değişikliği bu kartın izinli dosyaları dışında → ayrı kart.
3. `cognateTr` dolu satırlar araç kuralıyla **B** kovasına geçti (bucketB=405); rapor sayıları buna göre değişir.
4. R-A8 `partial` bırakıldı (insan teyidi yok).

## Sonraki yetkili eylem
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-04` (gramer içeriği). KAO-05'in bağımlılığı (KAO-03) açıldı.

Push/merge/tag/deploy yapılmadı. D-05/D-08 yayın kapısı ve `releaseApproval = NOT_APPROVED` değişmedi.
