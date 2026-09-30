# K2F-00 — Başlangıç: dal, taşıma commit'i, taban ölçüm
Tarih: 2026-09-30 · Dal: kao2-duzeltme · Önceki commit: 07802fa6 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: — (altyapı) · R değişimi: yok

## İlerleme günlüğü
- [x] fix-sync-check --repro PASS (0/44 done, nextPrompt K2F-00, seq 4)
- [x] git status beklenen küme: 150 R + 12 M + `?? kao2-duzeltme/`; beklenmeyen dosya yok
- [x] A-KABUL.md HEAD'deki (eski yol) ile bayt-özdeş → geri döndürme gerekmedi
- [x] `git switch -c kao2-duzeltme` yapıldı
- [x] kapilar.sh koşuldu (sync satırı in_progress nedeniyle FAIL — P3 notundaki beklenen fark; P4'te PASS'e döner)
- [x] tekrar-uret 0/10 · kao-plan-check 22 FAIL
- [x] pages.yml hariç tutma doğrulandı (satır 87 rsync `--exclude`, satır 116 `_site` döngüsü)
- [x] curriculum-build bayt-eşitliği 5/5
- [x] P4 kapanış

## Yapılan
- Taşıma ve program dosyaları (150 yeniden adlandırma, 12 değişiklik, `kao2-duzeltme/`) yeni `kao2-duzeltme` dalında tek commit'e alındı; içerik değişikliği yok.
- FIX-STATE program `status:"active"`, K2F-00 done, nextPrompt K2F-01.

## TDD
- Altyapı promptu: kırmızı yerine ölçüm (aşağıda).

## Kapılar (P3)
```
node --check (5 modül)             PASS
tests/kao (45) · app (77) · panel (23) · panel-v2 (27) · quran (9)   PASS
reminders smoke · run-seyma driver · zikr · kontrast                 PASS
kao-plan-check                     ATLANDI (K2F-01 öncesi)
fix-sync-check --repro             FAIL → "CURRENT-STATE status planned ≠ STATE active" (P4.4'te giderildi)
perf: content 177.657 KiB · runtime 92.431 KiB · css 12.815 KiB · p95 4.419 ms · steady 2.660 ms
```
tekrar-uret: 0/10 PASS (önceki 0/10 — beklenen taban)

## Ölçümler
- `kao-plan-check` ayrı koşu: **22 FAIL** (beklenen 22; tarihsel, K2F-01 çözer).
- `kao2-curriculum-build --out-dir` (scratch): 12 ünite · 109 ders · 524 lemma; 5 çıktı dosyasının 5'i repodakiyle `cmp` eşit (quranConceptTextsV1.js, quranCurriculumV2.js, INCELEME-KAO2-17/18.md, MUFREDAT-ESLEME.md).
- `pages.yml`: `--exclude 'kao2-duzeltme'` ve `_site` kalıntı döngüsünde `kao2-duzeltme` mevcut.

## Bilerek değişen testler
- yok (taşımanın yol düzeltmeleri LEDGER seq 3'te kayıtlı)

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- `mktemp -d` sandbox'ta reddedildi; scratch dizini `$TMPDIR` altında elle açıldı. `diff -` (stdin) de reddedildi, geçici dosya kullanıldı.
- Git `fsmonitor` uyarısı çıkıyor (zararsız).
