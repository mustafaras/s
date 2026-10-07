# D2F-09 · Süreç kurallarını denetleyen kontrol · KANIT

Oturum: https://claude.ai/code/session_7e6bbd9e-1e78-4394-93ba-479e2430d917
Tarih: 2026-10-07 · önceki commit `3977e9e3` (D2F-08) · dal `d2f-07`.

## İlerleme günlüğü
1. ORTAK-KURALLAR okundu; `nextPrompt` = `D2F-09` (uyuşuyor).
2. Rapordaki sayılar (128/28/21) git geçmişinden yeniden üretildi; kural tanımları bu sayılara göre kalibre edildi.
3. `--strict` (a–f) ve `--audit-k2f` yazıldı; gerçek geçmişte ilk koşu 10 ihlal verdi → D2F-01…08 delikleri `strictExceptions`'a gerekçeyle yazıldı.
4. Sahte git geçmişiyle mutasyon harness'i (scratchpad) kuruldu; `kapilar.sh`'a `--strict` satırı eklendi.

## Yapılan
- `d2f-sync-check.mjs --strict`: (a) bitmiş prompt = tam 1 `D2F-NN:` commit (en son bitmiş prompt, ağaç kirliyken henüz commit'siz olabilir) · (b) öneksiz/bilinmeyen önek yok ·
  (c) `?v=`/`SW_VERSION` değiştiren commit (kao2-duzeltme/docs/*.md hariç, `git log -G`) yalnız `D2F-15:` ve `evidence/D2F-15/YAYIN.md` varsa; commit'lenmemiş pin değişimi de yakalanır ·
  (d) KANIT 8 bölüm + `Oturum:`, STATE.session = KANIT, oturum adresi tekil · (e) done olan D2F-12/15/16 için GATE `closed`, D2F-11/14 için GATE `waiting` · (f) "Canlı gerçekler" tarihi ≥ son LEDGER tarihi.
- `--audit-k2f`: aynı (a)(b)(c)(d) kuralları `07802fa6..cbe0d604`'e yalnız rapor; çıkış kodu etkilenmez. (e)(f) K2F biçiminde yok → "uygulanmaz" yazılır.
- `kapilar.sh`: `gate "d2f-sync-check --strict"` satırı (başka satıra dokunulmadı).
- `D2F-STATE.json.strictExceptions`: 9 kayıt (rule/ref/reason zorunlu; geçersiz kayıt FAIL).

## TDD
Kırmızı (değişiklikten önce): `node …/d2f-sync-check.mjs --strict` → bayrak tanınmıyordu, kural yok; kırmızı kanıtı mutasyon harness'idir (aşağı).
Mutasyon (scratchpad, `git clone --local` + sahte commit'ler; her vaka taze klon): KONTROL tetiklenen yok · a ✓ · b ✓ (öneksiz, D2F-99) · c ✓ · d ✓ (bölüm, Oturum, paylaşılan oturum) · e ✓ (closed, waiting) · f ✓:
```
OK   KONTROL (sahte iyi D2F-09)           çıkış 1 · tetiklenen: —
OK   a  iki commit aynı prompt            çıkış 1 · tetiklenen: a
       - [strict-a] D2F-09: 2 commit (tam 1 olmalı)
OK   b  öneksiz commit                    çıkış 1 · tetiklenen: b
       - [strict-b] dfd5151c: öneksiz commit: "ek düzeltme"
OK   b  bilinmeyen önek                   çıkış 1 · tetiklenen: b
       - [strict-b] 491eb028: bilinmeyen önek D2F-99
OK   c  D2F-09 pin değiştirir             çıkış 1 · tetiklenen: a,c
       - [strict-c] 2d9aa119: pin değiştiren commit D2F-15 değil: "D2F-09: pin"
OK   d  KANIT bölümü eksik                çıkış 1 · tetiklenen: d
       - [strict-d] D2F-09: KANIT bölümü eksik: Sürprizler
OK   d  Oturum satırı yok                 çıkış 1 · tetiklenen: d
       - [strict-d] D2F-09: KANIT'ta "Oturum:" satırı yok
OK   d  iki prompt aynı oturum            çıkış 1 · tetiklenen: d
       - [strict-d] D2F-09: oturum adresi D2F-07 ile paylaşılıyor
OK   e  D2F-12 done, GATE closed yok      çıkış 1 · tetiklenen: d,e
       - [strict-e] D2F-12: LEDGER'da GATE status: closed kaydı yok
OK   e  D2F-11 done, GATE waiting yok     çıkış 1 · tetiklenen: d,e
       - [strict-e] D2F-11: LEDGER'da GATE status: waiting kaydı yok
OK   f  Canlı gerçekler tarihi bayat      çıkış 1 · tetiklenen: f
       - [strict-f] CURRENT-STATE: "Canlı gerçekler" 2026-09-01, son prompt kaydı 2026-10-07
```
(KONTROL satırında çıkış 1: sahte klonda nextPrompt/LEDGER senkronu bilerek bozuk; yalnız `[strict-*]` etiketi aranır.)

## Kapılar
`KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` → tests/kao (55) · app (77) · panel (23) · panel-v2 (27) · quran (9) · reminders · driver · zikr · kontrast · l2-paket · kao-plan-check · fix-sync-check --repro · **d2f-sync-check --strict** hepsi PASS · tekrar-uret 10/10 · perf PASS (p95 5.874 · steady 3.366, göreli bant yavaş makinede atlandı).
`SONUÇ: TÜM KAPILAR YEŞİL` (çıkış 0). `tekrar-uret-2.cjs` 6/9 PASS (azalmadı) · `tekrar-uret.cjs` 10/10.

## Ölçümler
`--audit-k2f`:
```
K2F denetimi (yalnız rapor, çıkış kodunu etkilemez) 07802fa6..cbe0d604
  (a) 128 commit · 44 prompt · 16 tek commit'li · 28 çok commit'li prompt
  (b) 2 öneksiz commit
  (c) 24 pin değiştiren commit · 21 plan dışı pin (planlı: K2F-18, K2F-43; öneksiz pin commit'leri b'de)
  (d) 43 KANIT · 43 tanesinde "Oturum:" satırı yok · 7 tanesinde 8 bölümden eksik var
  (e)(f) K2F LEDGER/CURRENT-STATE biçimi farklı: bu araçta uygulanmaz
```
Rapor ile: 128 commit ✓ · 28 çok commit'li prompt ✓ (16 tek) · 21 plan dışı pin ✓ (24 pin commit − planlı K2F-18/43 − 1 öneksiz). (d): K2F KANIT'ları bu biçimi taşımıyor (Oturum 0/43).

## Bilerek değişen testler
Yok (test dosyası değişmedi).

## Kanıt düzeyleri
kaynak/test ✓ · yayın — · cihaz —

## Sürprizler
- Gerçek geçmişte `--strict` ilk koşuda 10 ihlal verdi: D2F-03/04/05/06/08 çok commit (NOT/YAYIN ek commit'leri), `8e583a93` öneksiz, `59abe97b` §9 yayını, D2F-06/08 paylaşılan oturum ve D2F-07 KANIT'ta "Yapılan (…)" başlığı (bölüm eşleşmesi önek-tolerant yapıldı: `## Yapılan …` geçer).
  Bunlar silinmedi, `strictExceptions`'ta gerekçeli; "PASS" bu 9 kayda dayanır.
- Her prompttan sonra gelen "NOT — VS Code devir notu" commit'i (D2F-05/06 emsali) artık (a)'yı deler; D2F-09 böyle bir commit atmadı. Gerekirse not aynı commit'e girmeli.
