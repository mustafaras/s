# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-01
lastSeq: 5
status: active
-->

Son güncelleme: 2026-09-30 · LEDGER seq 5 · K2F-00 tamam (1/44), sıradaki K2F-01.

## Şu an neredeyiz
K2F-00 bitti: taşıma (`archive/kuran-ogreniyorum-v2/`, `docs/kuran-ogreniyorum/kao2/…`) ve program dosyaları
`kao2-duzeltme` dalında tek commit'le kaydedildi. Taban ölçüm alındı; hiçbir R değişmedi (0/10).

## Sıradaki promptun tek cümlesi
**K2F-01:** `docs/kuran-ogreniyorum/tools/kao-plan-check.mjs`'i geçmiş commitleri değil `planCheckBase`'den
sonrakileri denetleyecek ve `K2F` önekini tanıyacak şekilde düzelt (KR-6); `FIX-STATE.json.planCheckBase`'i
K2F-00 commit'ine sabitle; şu an 22 olan tarihsel FAIL sıfırlanmalı.

## Canlı gerçekler (araçla ölçüldü, 2026-09-30)
- Dal: `kao2-duzeltme` (tabanı `main` = `07802fa6`); push yok.
- Yayın pini: `20260930l` · `App.kao*` 42 · App yüzeyi 763 · atama 601 · `onclick` 393 (değişmedi).
- Kapılar: KAO 45/45 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/kontrast PASS · sync PASS.
- `kao-plan-check`: 22 FAIL (tarihsel; K2F-01 çözer). `tekrar-uret.cjs`: **0/10 PASS** (beklenen taban).
- Bütçe (perf): içerik 177,657 KiB · runtime 92,431 KiB · css 12,815 KiB · p95 4,419 ms.
- Müfredat derleyicisi çıktısı repodakiyle 5/5 bayt-eşit; `pages.yml` `kao2-duzeltme`'yi yayından hariç tutuyor.

## Açık riskler
- Canlı kullanıcı Ünite 1 ustalığında kilitli (K4-01) ve gramer görevleri yanlış öğretiyor (K4-02) → Dalga 1 önceliklidir.
- `archive/…/evidence/KAO2-27/A-KABUL.md` her KAO test koşusunda yeniden yazılır (M-11); `kapilar.sh` içeriği geri koyar; K2F-04 kalıcı çözer.
- Yeni handler'lar (K2F-12, K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan.

## Bekleyen kullanıcı işleri
- (Henüz yok.) Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
