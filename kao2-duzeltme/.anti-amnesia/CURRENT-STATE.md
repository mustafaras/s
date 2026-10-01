# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-13
lastSeq: 40
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 40 · K2F-00…12 tamam (13/44), sıradaki K2F-13. R-01, R-02, R-03, R-05, R-09, R-10 PASS (6/10).

## Şu an neredeyiz
K2F-12 bitti (K5-02 i, ii): `App.kaoS0` shim'i tanımlandı (Keşfet → "Seviye 0 · şekil aileleri" düğmesi artık ölü değil) ve `kaoS0('start', id)` S0 görünümünü gerçekten
açıyor (ana ekran → s0 yığın; s0'dayken ders değişimi `replace`; bilinmeyen ders reddedilir); NavBar başlığı "Harfler". `KNOWN_MISSING` boşaldı; pinler ölçülerek
43/764/602. Kaynak/test düzeyinde; YAYIN YOK (canlıda düğme hâlâ ölü). **Yayından önce K2F-13 şart:** S0 artık açıldığı için 6 harfsiz ders (R-06) çöker.
Önceki: K2F-11 + ek tur canlıda (`main` = `3d97c338`, pin `20261001e`).
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-13 (Seviye 0 2/4):** `kaoS0HTML`'i 12 S0 dersinin 12'sinde çökmeden çizdir — harf listesi olmayan 6 ders (s0.01, .03, .07, .08, .09, .11: hareke, esre/ötre, konum, sükûn, med/şedde,
tenvin/elif-lâm) için `curriculum.spec.json` S0 derslerine kimlikle `focus` (işaret adlarıyla, Arapça harf yazmadan), `tools/kao2-curriculum-build.mjs`'te `focus`'a göre lexicon'dan
belirlenimci ≥3 örnek kelime (≤3 hece, klip diskte var) → `s0.lessons[i].examples`; `kaoS0HTML` ders türüne göre dallansın (`letters[0]` korumasız erişim kalmasın); önce testte kırmızı
(12/12 çizim, ≥3 örnek, konum dersinde 28 harflik tablo); iki üretim bayt-eşit; R-06 fail→pass.

## Canlı gerçekler (araçla ölçüldü, 2026-10-01)
- Dal: `kao2-duzeltme` = canlı `main` (`3d97c338`) + belge-only commit'ler + K2F-12. Sonraki push yalnız kullanıcı isteğiyle / K2F-18/43 kapılarında.
- Yayın pini (canlı): `20261001e` · `App.kao*` 43 · App yüzeyi 764 · atama 602 · `onclick` 393 (kaynak; canlıda 42/763/601).
- Kapılar: KAO 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **6/10 PASS** (R-01, R-02, R-03, R-05, R-09, R-10); kalan R-04, R-06, R-07, R-08 FAIL (beklenen).
- Bütçe (perf): içerik 183,287 KiB (tavan 256) · runtime ≈104,7 KiB (tavan 128) · css ≈13,06 KiB (tavan 14).

## Açık riskler
- S0 görünümü açılabilir ama 6 ders çöker (R-06) ve S0 dersleri alıştırmasız (R-04): yayından önce K2F-13…15 tamamlanmalı ya da yayın kapsamı bilinçli seçilmeli.
- 3 gramer şablonu (g10-k3, g14-k2, g19-k3) yeni Türkçe içerik bekliyor (L1/L2, GRAMER-SABLON-L2.md öneriler).
- Canlıda R-05 (düğme ölü), R-06, R-04/R-07/R-08 sürer.
- Yeni handler'lar (K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe (K2F-16: 44/765/603).
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı; aralık 30'a genişletildi (seq 18) ve 45 simüle günde 0 hata ölçüldü (seq 22).
- `tests/kao/README.md` envanterinde 27 test dosyası yok (K2F-41); grammar_tasks satırı güncel.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan. zsh'de kelime bölünmez: `sed -i '' … "${DIZI[@]}"` kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir.

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
