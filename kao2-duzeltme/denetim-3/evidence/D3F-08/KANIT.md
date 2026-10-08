# D3F-08 — F-08: denetim-2 dönemindeki kayıtsız push/deploy'lar kayda geçti

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-08

## Kök neden
denetim-2 sırasında `main`'e yapılan push'ların ve Pages yayınlarının bir kısmı LEDGER'a ya da kanıta yazılmadı.
Rapor yalnız `3f3b28cd`'yi (run 37647239210) adlandırdı. Bu düzeltme için yazılan denetim aynı dönemde iki boşluk daha buldu.

## Ölçüm (salt-okur)
GitHub API `actions/workflows/pages.yml/runs` (anlık görüntü `pages-runs.json`, 30 run, 2026-10-04…10-08) + git.
Dönem: head'i D2F-STATE `baseCommit` `cbe0d604` ile `closeCommit` `128ab06d` arasında olan push run'ları.

| run | zaman (UTC) | head | aralık | yayın farkı* | kayıt (önce) |
|---|---|---|---|---|---|
| 37618089484 | 2026-10-07 12:01 | `59abe97b` D2F-04 erken yayın | `36015f08..` 11 commit | `quranLearn.js`, `index.html`, `panel-v2.html`, `sw.js` | onay seq 7 ✓, run/aralık ✗ |
| **37647239210** | 2026-10-07 15:50 | **`3f3b28cd`** D2F-12 (Copilot CLI) | `59abe97b..` 15 commit | **boş** | ✗ (F-08) |
| 37664767297 | 2026-10-07 18:10 | `b468d9a3` YAYIN-3 | — | pin `20261007b` | ✓ |
| 37666380654 | 2026-10-07 18:22 | `128ab06d` D2F-16 NOT | `b468d9a3..` 2 commit | boş | ✗ |

\* Pages rsync dışlamalarından sonra (`docs`, `tests`, `tools`, `kao2-duzeltme`, `*.md` …).
Hepsi `event: push`, `main`, `success`, tetikleyen `mustafaras`. `3f3b28cd` ve iki merge commit'i (`347884fb`, `d0acd9b4`) `Co-authored-by: Copilot` taşır.

## Yapılan (yalnız kayıt; geçmiş satırlar değişmedi)
- `denetim-2/LEDGER.md` **seq 26 NOTE · D2F-12**: üç run'ın her biri ayrı maddede (zaman, head, aralık, yayın farkı, eksik kayıt).
- `D2F-STATE.ledgerLastSeq` 25 → 26.
- `denetim-2/CURRENT-STATE.md`: senkron bloğu (seq 26), "Son güncelleme", "Bu oturumun işi" maddesi; "Canlı gerçekler" yeniden ölçüldü ve
  değerler değişmedi (158 kayıt / draft 0 / sourced 158 / ai-delegated 158 / owner 0 · 15/15 istisna · App.kao* 45 · 766 · 604 · 393).

## TDD
- Denetim betiği (depoda): `node kao2-duzeltme/denetim-3/evidence/D3F-08/pages-kayit-denetimi.mjs` (varsayılan: anlık görüntü, ağsız; `--live`: API).
  - RED (not öncesi): `pages-kayit: FAIL — 3/4 run denetim-2 kayıtlarında yok` (37666380654, 37647239210, 37618089484 KAYITSIZ).
  - GREEN: `pages-kayit: PASS — 4/4 run kayıtlı (dönem cbe0d604..128ab06d)`.
- Mutasyon: `bash kao2-duzeltme/denetim-3/evidence/D3F-08/pages-mutasyon.sh` → **5/5 PASS**.
  Senaryolar: M0 4/4 · M1 not öncesi kayıtlar 3/4 · M2 yalnız 37647239210 silinince o run KAYITSIZ · M3 sahte kayıtsız run · M4 anlık görüntü dönemi kapsamıyorsa sessiz PASS değil hata (çıkış 2).
- `d2f-sync-check --strict --repro` PASS (seq 26).

## Sınır (dürüstlük)
- Denetim "kayıtlı"yı run kimliğinin denetim-2 metinlerinde geçmesi olarak ölçer; kaydın içeriğinin doğruluğunu ayrıca sınamaz.
- Bu üç yayının canlı bayt eşitliği o anda ölçülmedi; o pinler artık canlıda değil, geriye dönük doğrulanamaz.
- KAO2-FIX dönemindeki (K2F) run'lar bu denetimin kapsamı dışında kaldı.

## Çalışma zamanı
Kod, veri ve pin değişmedi → pin yükseltilmedi (20261008a).

## Kanıt düzeyleri
kayıt/git ✓ · yayın (run kaydı API'den) ✓ · canlı — · cihaz —
