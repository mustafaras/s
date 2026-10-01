# K2F-17 — Dalga 1 regresyonu ve ara rapor
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: 77f63542 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: — · R değişimi: yok (9/10 doğrulandı)

## İlerleme günlüğü
- [x] P1: sync PASS, nextPrompt K2F-17
- [x] ek ölçümler (12 ünite, 109 ders, S0 12 ders, perf)
- [x] ARA-RAPOR.md + tests/kao/README.md envanteri
- [x] kapilar.sh YEŞİL (kapanışta)

## Yapılan
- Kod değişmedi. `ARA-RAPOR.md` yazıldı; README'ye test_kao2_s0 / settings / hub satırları eklendi.

## TDD
- Yalnız belge/ölçüm promptu: kırmızı yok; ölçümler mevcut fixture çıktılarından.

## Kapılar (P3)
SONUÇ: TÜM KAPILAR YEŞİL
tekrar-uret: 9/10 PASS (önceki 9/10) — beklenen: R-08 FAIL (K2F-23)

## Ölçümler
- 12 ünite simülasyonu (test_kao2_mastery C): her ünitede ilerler, Ünite 3 kaldı→onarım→geçti, sonunda "Tüm üniteler tamam" — PASS
- 109 ders yürüyüşü (test_kao2_grammar_tasks B1/C8): gösterilen gramer görevi 75, ihlal 0, en az alıştırma 9 (≥6); tekrar kuyruğu 83/86 uygun (g10-k3, g14-k2, g19-k3 içerik bekliyor)
- S0 12 ders uçtan uca (test_kao2_s0 27 kontrol): 12/12 çizilir, 3 dokunuşla giriş, sonra Fâtiha, Besmele taşı yalnız s0.12 sonrası
- Perf: content 184,231 KiB (≤256) · runtime 110,800 KiB (≤128) · css 13,560 KiB (≤14) · p95 4,112 ms
- Pinler: App.kao* 44 · yüzey 765 · atama 603 · onclick 393 · yayın 20261001f

## Bilerek değişen testler
- yok

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: K2F-12…15 canlıda, K2F-05…11 ve 16 yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Gösterilen gramer görevi K2F-11 kaydında 64 idi, şimdi 75 ölçüldü (ihlal 0, eşik ≥60 sağlanıyor).
