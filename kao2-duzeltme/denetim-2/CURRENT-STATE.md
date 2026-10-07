# KAO2-FIX denetim-2 · CURRENT-STATE

<!-- d2f-sync
nextPrompt: D2F-04
lastSeq: 3
status: active
-->

**Son güncelleme:** 2026-10-07 · D2F-03 sonu. Bu dosya her prompt sonunda **baştan** yazılır.

## Nerede kaldık
- Program: düzeltme programı (16 prompt, [`DUZELTME-PROMPTLARI.md`](DUZELTME-PROMPTLARI.md)); kurallar [`ORTAK-KURALLAR.md`](ORTAK-KURALLAR.md); kaynak rapor [`DENETIM-RAPORU.md`](DENETIM-RAPORU.md).
- Tamamlanan: **3/16** (D2F-01, D2F-02, D2F-03). Sıradaki: **D2F-04 — Aynı derste aynı gramer sorusu** (yeni oturumda).
- Başlangıç commit'i (`baseCommit`): `cbe0d604`. D2F-02 dalı: `claude/jolly-ride-9ltui4`; D2F-03 dalı: `claude/sharp-volta-l6ifgz`.
- Kullanıcı kapıları: D2F-12, D2F-15, D2F-16. Yayın onayı: yok (`releaseApproval: not_approved`).

## Canlı gerçekler (araçla ölçüldü, 2026-10-07)
| Ölçüm | Değer | Araç |
|---|---|---|
| `App.kao*` handler | 45 (değişmedi) | `d2f-sync-check.mjs` |
| App yüzeyi / atama | 766 / 604 | aynı |
| `onclick` | 393 | aynı |
| Yayın pini | `20261006e` | aynı |
| `kapilar.sh` bayraklı (`KAO2_ACCEPT_SLOW_HOST=1`) | **çıkış 0, "SONUÇ: TÜM KAPILAR YEŞİL"**; perf: göreli bant atlandı (steady 17,40 ms > bant 6,36 ms), mutlak tavanlar geçti (runtime 117,4 · css 13,0 · içerik 184,2 KiB · p95 36,7 ms — 40 ms tavanına yakın, bkz. D2F-03 KANIT §Sürprizler) | tam koşu, 1437 sn (D2F-03) |
| `kapilar.sh` bayraksız | D2F-03'te koşulmadı; son ölçüm D2F-02: çıkış 1, yalnız göreli p95 bandı | — |
| `kao-plan-check` | PASS (kapilar.sh içinde) | koşuldu |
| `test_kao2_grammar_tasks` | 31 kontrol PASS (bölüm D: aynı yazılı dizme çipleri) | koşuldu |
| `tekrar-uret-2.cjs` | **1/9 PASS** (N-01 PASS; N-02…N-09 FAIL) | koşuldu |
| `tekrar-uret.cjs` | 10/10 PASS | koşuldu |

## Açık bulgular (N durumları)
N-01 `pass` (D2F-03: dizme doğruluğu çip yazısına dayanır). N-02…N-09 `fail`. Eşleme: N-01↔D2-01 (D2F-03, kapandı — kaynak/test; canlıda yayına kadar eski davranış) · N-09↔D2-09 (D2F-04) · N-02/N-03↔D2-02/03 (D2F-05) ·
N-05↔D2-05 (D2F-08) · N-06/N-07↔D2-06/07 (D2F-10) · N-04↔D2-04 (D2F-11/12) · N-08↔D2-08 (yayın, D2F-15).
D2-12'nin araç kısmı D2F-02'de kapandı; kayıt kısmı (LEDGER notu) D2F-10'da.

## Ortam notu
Konteyner sığ klonla ve `rsync`'siz gelebilir. İlk kapı koşusundan önce `git rev-parse --is-shallow-repository` ve
`which rsync` (gerekirse `git fetch --unshallow origin`, `apt-get update && apt-get install -y rsync` — `update` olmadan kurulum başarısız). Dal bir önceki promptun commit'ini
taşımıyorsa önce `git fetch` + `--ff-only` ile o commit'e ilerlet.
