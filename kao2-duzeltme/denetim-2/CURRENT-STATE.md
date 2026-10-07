# KAO2-FIX denetim-2 · CURRENT-STATE

<!-- d2f-sync
nextPrompt: D2F-09
lastSeq: 12
status: active
-->

**Son güncelleme:** 2026-10-07 · D2F-08 (test listesi tam olsun) sonu. Bu dosya her prompt sonunda **baştan** yazılır.

## Nerede kaldık
- **YAYIN (seq 7, kullanıcı kararı):** ortam değişikliği için D2F-04 sonrası erken yayın — pin `20261007a`, `main` ff-only. Program kapanmadı:
  D2F-05…16 pending. Ayrıntı: ORTAK-KURALLAR §9, evidence/D2F-04/YAYIN.md.
- Program: düzeltme programı (16 prompt, [`DUZELTME-PROMPTLARI.md`](DUZELTME-PROMPTLARI.md)); kurallar [`ORTAK-KURALLAR.md`](ORTAK-KURALLAR.md); kaynak rapor [`DENETIM-RAPORU.md`](DENETIM-RAPORU.md).
- Tamamlanan: **8/16** (D2F-01…D2F-08). Sıradaki: **D2F-09** (yeni oturumda; başlığı DUZELTME-PROMPTLARI.md).
- Başlangıç commit'i (`baseCommit`): `cbe0d604`. D2F-05 PROMPT `467ab6fa`, D2F-05 NOT `80ed4450`; D2F-06 `79eca899` (dal `d2f-05`); D2F-06 NOT `e7b2c170`; D2F-07 dal `d2f-07`; D2F-08 aynı dal.
- Kullanıcı kapıları: D2F-12, D2F-15, D2F-16. Yayın: seq 7 ile tek seferlik erken yayın (`releaseApproval: user_override_2026-10-07_early_release`).

## Canlı gerçekler (araçla ölçüldü, 2026-10-07, D2F-08)
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
| `tekrar-uret-2.cjs` | **6/9 PASS** (N-01, N-02, N-03, N-05, N-08, N-09; arttı) | koşuldu |
| `tekrar-uret.cjs` | 10/10 PASS | koşuldu |

## Bu oturumun işi
- **D2F-08 — Test listesi tam olsun (seq 12).** `tests/kao/README.md` 54 testten 53'ünü listeliyordu (`test_kao_pronunciation_contract.js` yoktu);
  satır eklendi, "Yardımcılar ve sabit veri" bölümü (`helpers/kao-harness.js`, `fixtures/*.json`) açıldı. Yeni `tests/kao/test_kao2_inventory.js`:
  her `test_*.js` README'de tam adıyla (ters tırnaklı) geçer, README'de adı geçen her test diskte var, helpers/fixtures listeli. Ayrıntı: [evidence/D2F-08/KANIT.md](evidence/D2F-08/KANIT.md).
- Kapatan bulgular: **D2-05** ve **K6-06 kalıntısı** (N-05 PASS).

## Açık bulgular (N durumları)
N-01 `pass` (D2F-03) · N-02 `pass` (D2F-05) · N-03 `pass` (D2F-05) · N-05 `pass` (D2F-08) · N-08 `pass` (D2F-04) · N-09 `pass` (D2F-04).
**N-04, N-06, N-07 açık.** Eşleme: N-06/N-07↔D2-06/07 (D2F-10) · N-04↔D2-04 (D2F-11/12).

## Ortam notu
- **`kao-plan-check` kırmızısı (bu makinede, kapsam dışı):** seq 10 NOTE commit'i `8e583a9` öneki `"denetim-2:"` ile
  `tests/kao/test_kao2_kabul.js`'e dokunuyor; plan aracı bu öneki tanımıyor →
  `FAIL commit 8e583a9 KAO dosyasına tanınmayan önekle dokunuyor`. **Bu kırmızı HEAD'de, D2F-07 değişiklikleri olmadan da aynı** (temiz ağaçta
  doğrulandı). D2F-07 ile ilgisiz; düzeltmesi commit mesajı kuralını ilgilendirir → kapsam dışı. Kaynak: D2F-08 veya ayrı iş.
- Konteyner sığ klonla ve `rsync`'siz gelebilir. İlk kapı koşusundan önce `git rev-parse --is-shallow-repository` ve
  `which rsync` (gerekirse `git fetch --unshallow origin`, `apt-get update && apt-get install -y rsync` — `update` olmadan kurulum başarısız).
- `test_kao2_kabul.js` ve `test_kao2_grammar_tasks.js` tek başına yavaş koşar; kapılar ~15–22 dk.
