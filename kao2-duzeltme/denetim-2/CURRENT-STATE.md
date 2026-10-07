# KAO2-FIX denetim-2 · CURRENT-STATE

<!-- d2f-sync
nextPrompt: D2F-05
lastSeq: 7
status: active
-->

**Son güncelleme:** 2026-10-07 · D2F-04 sonu + tek seferlik erken yayın (seq 7). Bu dosya her prompt sonunda **baştan** yazılır.

## Nerede kaldık
- **YAYIN (seq 7, kullanıcı kararı):** ortam değişikliği için D2F-04 sonrası erken yayın — pin `20261007a`, `main` ff-only. Program kapanmadı:
  D2F-05…16 pending, N-02…N-08 açık. Ayrıntı: ORTAK-KURALLAR §9, evidence/D2F-04/YAYIN.md.
- Program: düzeltme programı (16 prompt, [`DUZELTME-PROMPTLARI.md`](DUZELTME-PROMPTLARI.md)); kurallar [`ORTAK-KURALLAR.md`](ORTAK-KURALLAR.md); kaynak rapor [`DENETIM-RAPORU.md`](DENETIM-RAPORU.md).
- Tamamlanan: **4/16** (D2F-01…D2F-04). Sıradaki: **D2F-05 — Denetim kontrollerini güçlendir (R-01, R-10)** (yeni oturumda).
- Başlangıç commit'i (`baseCommit`): `cbe0d604`. Dallar: D2F-02 `claude/jolly-ride-9ltui4` · D2F-03 `claude/sharp-volta-l6ifgz` · D2F-04 `claude/cool-bardeen-6k6fgo`
  (her dal bir öncekinin commit'ini `--ff-only` ile taşır).
- Kullanıcı kapıları: D2F-12, D2F-15, D2F-16. Yayın: seq 7 ile tek seferlik erken yayın (`releaseApproval: user_override_2026-10-07_early_release`).

## Canlı gerçekler (araçla ölçüldü, 2026-10-07, D2F-04)
| Ölçüm | Değer | Araç |
|---|---|---|
| `App.kao*` handler | 45 (değişmedi) | `d2f-sync-check.mjs` |
| App yüzeyi / atama | 766 / 604 | aynı |
| `onclick` | 393 | aynı |
| Yayın pini | `20261007a` (önce `20261006e`) | aynı |
| `kapilar.sh` bayraklı (`KAO2_ACCEPT_SLOW_HOST=1`) | **çıkış 0, "SONUÇ: TÜM KAPILAR YEŞİL"**; perf: göreli bant atlandı (steady 11,66 ms > bant 6,36 ms), mutlak tavanlar geçti (runtime 117,9 · css 13,0 · içerik 184,2 KiB · p95 30,2 ms) | tam koşu, 21 dk 57 sn |
| `kapilar.sh` bayraksız | D2F-04'te koşulmadı; son ölçüm D2F-02: çıkış 1, yalnız göreli p95 bandı | — |
| `test_kao2_grammar_tasks` | 34 kontrol PASS (bölüm E: ders içi tekrar soru yok, dizme çözülmüş açılmaz) | koşuldu |
| Gösterilen gramer görevi (109 ders) | 77 (önce 78; ikame 1) · ders içi tekrar 0 | E1 |
| Dizme çözülmüş açılış | 0/36000 (18 şablon × 2000 tohum; önce 21) | E3 |
| Kabul A-2 | PASS (109/109 ders, 524 yeni lemma, ihlal 0) | `test_kao2_kabul.js` |
| `tekrar-uret-2.cjs` | **2/9 PASS** (N-01, N-09; N-02…N-08 FAIL) | koşuldu |
| `tekrar-uret.cjs` | 10/10 PASS | koşuldu |

## Açık bulgular (N durumları)
N-01 `pass` (D2F-03) · N-09 `pass` (D2F-04: ders içi aynı gramer sorusu ikame edilir). N-02…N-08 `fail`. Eşleme:
N-02/N-03↔D2-02/03 (D2F-05) · N-05↔D2-05 (D2F-08) · N-06/N-07↔D2-06/07 (D2F-10) · N-04↔D2-04 (D2F-11/12) · N-08↔D2-08 (yayın, D2F-15).
Kapanan NOT: LEDGER seq 4 (dizme "zaten sıralı" kimlik kontrolü) D2F-04'te kapandı (kaynak/test; canlıda yayına kadar eski davranış).
Kapsam dışı gözlem (D2F-04 KANIT §Sürprizler): parça dizmesinde de çözülmüş açılış kontrolü yok (`s:95:4:1` 5/500) — programda prompt yok; kullanıcıya ayrı iş olarak önerildi.
D2-12'nin araç kısmı D2F-02'de kapandı; kayıt kısmı (LEDGER notu) D2F-10'da.

## Ortam notu
Konteyner sığ klonla ve `rsync`'siz gelebilir. İlk kapı koşusundan önce `git rev-parse --is-shallow-repository` ve
`which rsync` (gerekirse `git fetch --unshallow origin`, `apt-get update && apt-get install -y rsync` — `update` olmadan kurulum başarısız). Dal bir önceki promptun commit'ini
taşımıyorsa önce `git fetch` + `--ff-only` ile o commit'e ilerlet (D2F-04 dalı: `claude/cool-bardeen-6k6fgo`).
Bu makinede `test_kao2_grammar_tasks.js` tek başına ~6 dk; kapılar ~22 dk.
