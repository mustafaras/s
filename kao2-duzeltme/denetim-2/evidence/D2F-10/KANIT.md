# D2F-10 · Eski programın eksik kayıtları · KANIT

Oturum: https://claude.ai/code/session_c25a6a0c-00f0-4586-b6b2-858ca3bc413c
Tarih: 2026-10-07 · önceki commit `e36e96ad` (D2F-09) · dal `d2f-07`.

## İlerleme günlüğü
1. ORTAK-KURALLAR okundu; `nextPrompt` = `D2F-10` (uyuşuyor), `d2f-sync-check --clean` PASS.
2. Rapor §4/§6/§7, KAO2-FIX CURRENT-STATE/LEDGER seq 114–122, dört commit'in `git show --stat`'i ve `git reflog show origin/main` okundu.
3. Kayıtlar yazıldı; kapılar koşuldu; denetim-2 kayıtları yazıldı.

## Yapılan
- KAO2-FIX LEDGER sonuna seq 123 `GATE · K2F-43` (closed-inferred, gerçek talimat alıntı), 124 `NOTE · K2F-34`, 125 `NOTE · K2F-38` (`8bf8f658`, `5b267dde`), 126 `NOTE · denetim-2`. Eski satırlar bayt aynı (`git diff --numstat` 30/0).
- `evidence/K2F-43/KANIT.md` ve `evidence/K2F-34/YAYIN.md` (git'ten; K2F-34 için `2715ad50..dc9743f4` reflog'dan; Pages run numarası "kayıtta yok").
- KAO2-FIX CURRENT-STATE baştan yazıldı (bayat satırların hepsi gitti); FIX-STATE `branch`/`implementer`/`audit2`; README gerçekleşen/plan notu; KAPANIŞ §8.
- Dokunulmayan: kod, pin, `sw.js`, `app.js`, eski LEDGER/commit'ler.
- Kapsam notu: prompt "Dokunulacak"ında olmayan `denetim-2/` kayıtları ORTAK-KURALLAR §2 gereği güncellendi.

## TDD
Kırmızı (değişiklikten önce, tekrar-uret-2): `FAIL N-06 … K2F-43 GATE kaydı=false · KANIT.md=false` ve `FAIL N-07 … bayat satır` (D2F-09 KANIT/CURRENT-STATE'te N 6/9). Sonra: `PASS N-06 … GATE kaydı=true · KANIT.md=true`, `PASS N-07 · bayat satır yok`. Mutasyon kanıtı: N-06/N-07 kontrolleri zaten denetim-2 başında FAIL veriyordu (aynı kayıtlar eksikken); kayıtlar geri alınınca kontrol tekrar kırmızı olur (kontrol metni dosya varlığı/regex).

## Kapılar
`KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` → `SONUÇ: TÜM KAPILAR YEŞİL` (çıkış 0): tests/kao (55) · app (77) · panel (23) · panel-v2 (27) · quran (9) · reminders · driver · zikr · kontrast · l2-paket · kao-plan-check · fix-sync-check --repro · d2f-sync-check --strict PASS · tekrar-uret 10/10 · perf PASS (content 183.544 · runtime 117.350 · css 13.035 KiB; p95 14.642 ms; göreli bant yavaş makinede atlandı). Not: bu koşu denetim-2 kayıtları yazılmadan önce yapıldı; sonra `d2f-sync-check` (--strict dahil) ve `fix-sync-check --repro` yeniden koşuldu.

## Ölçümler
runtime 117,350 KiB ≤ 128 · css 13,035 KiB ≤ 14 · içerik 183,544 KiB ≤ 256 · pin `20261007a` · 45/766/604/393. `tekrar-uret-2.cjs` **8/9** (önceden 6/9; azalmadı); `tekrar-uret.cjs` 10/10.

## Bilerek değişen testler
Yok.

## Kanıt düzeyleri
Kaynak/test ✓ (bu oturumda koşuldu) · yayın — (yayın yapılmadı) · cihaz —. K2F-43/K2F-34 geriye dönük kayıtları yeni ölçüm değil, git/kayıt derlemesidir.

## Sürprizler
1. İlk kapı koşusu arka plan sarmalayıcısıyla kesildi (log 337 bayt); doğrudan arka planda yeniden koşuldu.
2. K2F-34 için LEDGER seq 97 ("canlıda DEĞİL") ile seq 99 aralığı çelişiyor; çelişki YAYIN.md'ye yazıldı, çözülmedi.
3. Pages run numarası K2F-34 için hiçbir kayıtta yok.
