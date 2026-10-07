# KAO2-FIX denetim-2 · CURRENT-STATE

<!-- d2f-sync
nextPrompt: D2F-03
lastSeq: 2
status: active
-->

**Son güncelleme:** 2026-10-07 · D2F-02 sonu. Bu dosya her prompt sonunda **baştan** yazılır.

## Nerede kaldık
- Program: düzeltme programı (16 prompt, [`DUZELTME-PROMPTLARI.md`](DUZELTME-PROMPTLARI.md)); kurallar [`ORTAK-KURALLAR.md`](ORTAK-KURALLAR.md); kaynak rapor [`DENETIM-RAPORU.md`](DENETIM-RAPORU.md).
- Tamamlanan: **2/16** (D2F-01, D2F-02). Sıradaki: **D2F-03 — "Kelime dizme" aynı görünen çipler** (yeni oturumda).
- Başlangıç commit'i (`baseCommit`): `cbe0d604`. D2F-02 dalı: `claude/jolly-ride-9ltui4`.
- Kullanıcı kapıları: D2F-12, D2F-15, D2F-16. Yayın onayı: yok (`releaseApproval: not_approved`).

## Canlı gerçekler (araçla ölçüldü, 2026-10-07)
| Ölçüm | Değer | Araç |
|---|---|---|
| `App.kao*` handler | 45 | `d2f-sync-check.mjs` |
| App yüzeyi / atama | 766 / 604 | aynı |
| `onclick` | 393 | aynı |
| Yayın pini | `20261006e` | aynı |
| `kapilar.sh` bayraklı (`KAO2_ACCEPT_SLOW_HOST=1`) | **çıkış 0, "SONUÇ: TÜM KAPILAR YEŞİL"**; perf: göreli bant atlandı (steady 9,94 ms > bant 6,36 ms), mutlak tavanlar geçti (runtime 117,3 · css 13,0 · içerik 184,2 KiB · p95 24,3 ms) | tam koşu, 811 sn |
| `kapilar.sh` bayraksız | çıkış 1; yalnız `test_kao2_kabul` + `test_kao2_perf_budget` (göreli bant) — davranış değişmedi | tam koşu, 781 sn |
| `kao-plan-check` | PASS (1 warn); self-test 38/38; `K2F-NN ek:` yalnız 65e94db2 istisnası | koşuldu |
| `tekrar-uret-2.cjs` | 0/9 PASS (N-01…N-09 FAIL) | koşuldu |
| `tekrar-uret.cjs` | 10/10 PASS | koşuldu |

## Açık bulgular (N durumları)
N-01…N-09 hepsi `fail`. Eşleme: N-01↔D2-01 (D2F-03) · N-09↔D2-09 (D2F-04) · N-02/N-03↔D2-02/03 (D2F-05) ·
N-05↔D2-05 (D2F-08) · N-06/N-07↔D2-06/07 (D2F-10) · N-04↔D2-04 (D2F-11/12) · N-08↔D2-08 (yayın, D2F-15).
D2-12'nin araç kısmı D2F-02'de kapandı; kayıt kısmı (LEDGER notu) D2F-10'da.

## Ortam notu
Konteyner sığ klonla ve `rsync`'siz gelebilir. İlk kapı koşusundan önce `git rev-parse --is-shallow-repository` ve
`which rsync` (gerekirse `git fetch --unshallow origin`, `apt-get install -y rsync`). Dal bir önceki promptun commit'ini
taşımıyorsa önce `git fetch` + `--ff-only` ile o commit'e ilerlet.
