# KAO2-FIX denetim-2 · CURRENT-STATE

<!-- d2f-sync
nextPrompt: D2F-02
lastSeq: 1
status: active
-->

**Son güncelleme:** 2026-10-07 · D2F-01 sonu. Bu dosya her prompt sonunda **baştan** yazılır.

## Nerede kaldık
- Program: düzeltme programı (16 prompt, [`DUZELTME-PROMPTLARI.md`](DUZELTME-PROMPTLARI.md)); kurallar [`ORTAK-KURALLAR.md`](ORTAK-KURALLAR.md); kaynak rapor [`DENETIM-RAPORU.md`](DENETIM-RAPORU.md).
- Tamamlanan: **1/16** (D2F-01). Sıradaki: **D2F-02 — Kapı araçları** (yeni oturumda).
- Başlangıç commit'i (`baseCommit`): `cbe0d604`. Dal: `claude/happy-newton-okecaw`.
- Kullanıcı kapıları: D2F-12, D2F-15, D2F-16. Yayın onayı: yok (`releaseApproval: not_approved`).

## Canlı gerçekler (araçla ölçüldü, 2026-10-07)
| Ölçüm | Değer | Araç |
|---|---|---|
| `App.kao*` handler | 45 | `d2f-sync-check.mjs` |
| App yüzeyi / atama | 766 / 604 | aynı (pin testi kalıpları) |
| `onclick` | 393 | aynı (fx2 touch combinedSource) |
| Yayın pini | `20261006e` (index.html + `sw.js` SW_VERSION) | aynı |
| `kapilar.sh` bayraksız | çıkış 1; yalnız `test_kao2_kabul` + `test_kao2_perf_budget` kırmızı (steady p95 10,46 ms > taban+%25 5,09 ms) | tam koşu, 14 dk 32 sn |
| `tekrar-uret-2.cjs` | 0/9 PASS (N-01…N-09 FAIL) | koşuldu |
| `tekrar-uret.cjs` | 10/10 PASS | koşuldu |

## Açık bulgular (N durumları)
N-01…N-09 hepsi `fail`. Eşleme: N-01↔D2-01 (D2F-03) · N-09↔D2-09 (D2F-04) · N-02/N-03↔D2-02/03 (D2F-05) ·
N-05↔D2-05 (D2F-08) · N-06/N-07↔D2-06/07 (D2F-10) · N-04↔D2-04 (D2F-11/12) · N-08↔D2-08 (yayın, D2F-15).

## Ortam notu
Bu konteyner sığ klonla geldi; `test_profile_boundary`, `test_settings_boundary`, `kao-plan-check` tam git geçmişi,
`test_deploy_surface_contract` `rsync` ister. Yeni oturum ilk kapı koşusundan önce `git rev-parse --is-shallow-repository`
ve `which rsync` kontrol etmeli (gerekirse `git fetch --unshallow origin`, `apt-get install -y rsync`).
