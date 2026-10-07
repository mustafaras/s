# VS Code devir notu · denetim-2 (2026-10-07, D2F-04 sonrası)

## 1. Yerel klasörü uzakla eşitle (önce oku)
Uzak depo çok ilerde. Yerelde commit'lenmemiş işin varsa **önce yedekle**; `reset --hard` kullanma.
```bash
cd <yerel-klasör>
git status                       # temiz mi? değilse: git stash push -u -m "eşitleme-oncesi"  (sonra git stash list ile gör)
git fetch --all --prune --tags
git switch -c claude/cool-bardeen-6k6fgo --track origin/claude/cool-bardeen-6k6fgo   # dal yerelde varsa: git switch <dal> && git pull --ff-only
git log --oneline -5             # en üstte: 16d87a77 D2F-04 ...
node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --clean   # PASS, "4/16 prompt done · nextPrompt D2F-05"
```
- `main` = canlı (`36015f08`'in ardından K2F-43 yayını, pin `20261006e`). Programın dalı `claude/cool-bardeen-6k6fgo`, D2F-01…04'ü taşır; `main`'e **birleştirilmedi**.
- `git pull` çakışırsa dur ve bana göster; `push --force` yok.

## 2. Güvenlik (CLAUDE.md DATA SAFETY)
- Uygulamayı tarayıcıda açma, sunucu başlatma yok. Eski localStorage + token `mustafaras/seyma-data`'yı ezebilir.
- Doğrulama yalnız headless Node: `node tests/kao/test_kao2_grammar_tasks.js` vb.
- Token/parola kimseye yazılmaz; `seyma-data`'ya yazılmaz.

## 3. Sıradaki iş
- `nextPrompt` = **D2F-05** (`kao2-duzeltme/denetim-2/D2F-STATE.json`). Prompt metni: `DUZELTME-PROMPTLARI.md` → "Prompt 5".
- Kurallar: `ORTAK-KURALLAR.md` (bir oturum = bir prompt = bir commit; test önce; mutasyon kanıtı; kapılar).
- Kapılar (~22 dk, yavaş makinede):
  `KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` + `node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs` + `node kao2-duzeltme/denetim/tekrar-uret.cjs`.
- Kapı koşusu sırasında dosya değiştirme. Yeni konteynerde `rsync` ve tam klon gerekebilir (`git fetch --unshallow`).

## 4. Durum özeti
| | |
|---|---|
| Biten | D2F-01…04 (N-01, N-09 PASS; `tekrar-uret-2` 2/9) |
| Açık | N-02/03 (D2F-05) · N-05 (08) · N-06/07 (10) · N-04 (11/12) · N-08 (15) |
| Yayın | **Yok.** Pin `20261006e`, `releaseApproval: not_approved` |
| Kullanıcı kapıları | D2F-12 (iki karar: L1 onayı + u09.01), D2F-15 (yayın onayı), D2F-16 (canlı doğrulama) |
| Ayrı öneri | Kısa sûre "parça dizme" çözülmüş açılış (`kaoBuildFragmentTask`, `s:95:4:1` 5/500) — programda prompt yok, ayrı kapsam onayı ister |

## 5. Yayın ne zaman?
Yalnız D2F-15'te, senin onay cümlen LEDGER'a yazıldıktan sonra. Önce D2F-13 (baştan sona doğrulama) ve D2F-14 (yayın özeti) gelir.

## 6. Claude Code'u VS Code'da başlatma cümlesi
> Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 5'ini yap (commit öneki D2F-05). Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-05" olmalı.
