# KAO2-FIX denetim-2 · CURRENT-STATE

<!-- d2f-sync
nextPrompt: D2F-12
lastSeq: 16
status: active
-->

**Son güncelleme:** 2026-10-07 · D2F-11 (kullanıcı kararı sorusu) sonu. Bu dosya her prompt sonunda **baştan** yazılır.

## Nerede kaldık
- **YAYIN (seq 7, kullanıcı kararı):** ortam değişikliği için D2F-04 sonrası erken yayın — pin `20261007a`, `main` ff-only. Program kapanmadı:
  D2F-12…16 pending. Ayrıntı: ORTAK-KURALLAR §9, evidence/D2F-04/YAYIN.md.
- Program: düzeltme programı (16 prompt, [`DUZELTME-PROMPTLARI.md`](DUZELTME-PROMPTLARI.md)); kurallar [`ORTAK-KURALLAR.md`](ORTAK-KURALLAR.md); kaynak rapor [`DENETIM-RAPORU.md`](DENETIM-RAPORU.md).
- Tamamlanan: **11/16** (D2F-01…D2F-11). Sıradaki: **D2F-12** (yalnız kullanıcı kutuyu doldurursa) (yeni oturumda; başlığı DUZELTME-PROMPTLARI.md).
- Başlangıç commit'i (`baseCommit`): `cbe0d604`. D2F-05 PROMPT `467ab6fa`, D2F-05 NOT `80ed4450`; D2F-06 `79eca899` (dal `d2f-05`); D2F-06 NOT `e7b2c170`; D2F-07 dal `d2f-07`; D2F-08 aynı dal.
- Kullanıcı kapıları: D2F-11→12 (GATE waiting, seq 16), D2F-12, D2F-15, D2F-16. Yayın: seq 7 ile tek seferlik erken yayın (`releaseApproval: user_override_2026-10-07_early_release`).

## Canlı gerçekler (araçla ölçüldü, 2026-10-07, D2F-11)
| Ölçüm | Değer | Araç |
|---|---|---|
| `App.kao*` handler | 45 (değişmedi) | `d2f-sync-check.mjs` |
| App yüzeyi / atama | 766 / 604 | aynı |
| `onclick` | 393 | aynı |
| Yayın pini | `20261007a` | aynı |
| `tests/kao` envanteri | **55 test + 3 yardımcı/fixture README'de**; `test_kao2_inventory.js` PASS | koşuldu (D2F-08) |
| Araç iki üretim | `MUFREDAT-ESLEME.md` + `quranCurriculumV2.js` **bayt-eşit** ve depodakiyle **aynı** | `--out-dir` ×2 |
| Metin durumu | **133 metin · draft 0 · sourced 133 · expert 0** | bağımsız sayım |
| `kapilar.sh` bayraklı | 16 satır yeşil; tek kırmızı `kao-plan-check` (aşağıda, kapsam dışı) | tam koşu |
| `tekrar-uret-2.cjs` | **8/9 PASS** (N-01, N-02, N-03, N-05, N-06, N-07, N-08, N-09; kalan N-04 kullanıcı kararı) | koşuldu |
| `d2f-sync-check --strict` | **PASS** (9 kayıtlı istisna); a–f mutasyonları FAIL | koşuldu (D2F-09) |
| `--audit-k2f` | 128 commit · 28 çok commit'li prompt · 21 plan dışı pin | koşuldu (D2F-09) |
| `tekrar-uret.cjs` | 10/10 PASS | koşuldu |

## Bu oturumun işi
- **D2F-11 — Kullanıcı kararı bekleniyor (seq 16, GATE waiting).** İki soru: (1) 158 metnin L1 onay kaynağı — A sen incelersin / B `ai-delegated` yazılır / C yalnız belge; (2) u09.01 başlık↔kart — 1 başlık+hedef kartlara uyar / 2 emir biçimi kartta (bugünkü veriyle mümkün değil) / kendi metin. Beklenen cevap: D2F-12 kutusunda `L1 kararı: X` + `u09.01: Y`. Metin/veri/kod değişmedi. Ayrıntı: [evidence/D2F-11/KANIT.md](evidence/D2F-11/KANIT.md).
- **D2F-10 — Eski program kayıtları (seq 15).** KAO2-FIX LEDGER seq 123–126 (K2F-43 GATE closed-inferred, K2F-34/K2F-38/denetim-2 NOT), K2F-43 KANIT + K2F-34 YAYIN geriye dönük, CURRENT-STATE baştan, FIX-STATE/README/KAPANIŞ §8. N-06, N-07 PASS. Ayrıntı: [evidence/D2F-10/KANIT.md](evidence/D2F-10/KANIT.md).
- **D2F-09 — Süreç kuralları araçla (seq 14).** `d2f-sync-check.mjs --strict`: baseCommit'ten sonraki D2F commit'lerine (a) tam bir commit, (b) önek, (c) yayın yalnız D2F-15 + YAYIN.md,
  (d) KANIT 8 bölüm + tekil Oturum, (e) GATE closed/waiting, (f) bayat "Canlı gerçekler" kapısı. `--audit-k2f` aynı kuralları KAO2-FIX dönemine yalnız rapor olarak uygular.
  `kapilar.sh` `--strict`'i koşar. D2F-01…08'in delikleri `strictExceptions`'ta gerekçeli; yeni ihlal geçmez. Ayrıntı: [evidence/D2F-09/KANIT.md](evidence/D2F-09/KANIT.md).
- Önlem: M-05/M-07/M-12 tekrarına karşı (D2-12, E-8, E-10); N durumları değişmedi.

## Açık bulgular (N durumları)
N-01 `pass` (D2F-03) · N-02 `pass` (D2F-05) · N-03 `pass` (D2F-05) · N-05 `pass` (D2F-08) · N-08 `pass` (D2F-04) · N-09 `pass` (D2F-04).
**N-04 açık** (kullanıcı kararı bekleniyor: D2F-11 soruldu, D2F-12 uygular). Eşleme: N-04↔D2-04 (D2F-11/12).

## Ortam notu
- **`kao-plan-check` (seq 13 NOTE ile giderildi):** `8e583a9` ("denetim-2:" öneki) için aracın tek-hash istisna listesine daraltılmış kayıt eklendi; araç PASS.
- Konteyner sığ klonla ve `rsync`'siz gelebilir. İlk kapı koşusundan önce `git rev-parse --is-shallow-repository` ve
  `which rsync` (gerekirse `git fetch --unshallow origin`, `apt-get update && apt-get install -y rsync` — `update` olmadan kurulum başarısız).
- `test_kao2_kabul.js` ve `test_kao2_grammar_tasks.js` tek başına yavaş koşar; kapılar ~15–22 dk.
