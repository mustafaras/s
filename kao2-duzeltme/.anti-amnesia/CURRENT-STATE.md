# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-17
lastSeq: 49
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 49 · K2F-00…16 tamam (17/44), sıradaki K2F-17. R-01…R-07, R-09, R-10 PASS (9/10).

## Şu an neredeyiz
K2F-16 bitti (K3-06, K3-05, P-10, D-18; R-07 fail→pass): kök neden Ayarlar'ın `settings.intent` okuması, onboarding'in ise niyeti `onboarding.intent` altına yazmasıydı. Ayarlar artık `onboarding.intent`'ten okur ("Niyet: Her yatsı namazından sonra 5 dakika" / "Kendim seçerim" / "Henüz seçilmedi"),
6 seçenekli niyet segmenti `App.kaoSetIntent(v)` ile değiştirir (geçersiz değer `false`, mevcut niyet bozulmaz), hub "bekliyor" önerisi niyet varsa o vaktin saatiyle ("Niyet önerisi: yatsı namazından sonra 5 dakika (20:30)"; vakit geçtiyse "yarın …"; niyet yok/özel ya da vakit verisi yoksa eski sıradaki-vakit davranışı).
`kaoIntentSuggestion` dördüncü isteğe bağlı argüman (niyet) alır. Yeni handler: 43→44 · 764→765 · 602→603 (9 pin dosyası + FIX-STATE). Yayın yok: K2F-16 yalnız kaynak/test düzeyinde; canlı `main` hâlâ `4fd00131` (pin `20261001f`).
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-17 (Dalga 1 regresyonu ve ara rapor):** `kapilar.sh` YEŞİL ve `tekrar-uret` 9/10 doğrulanır; 12 ünite simülasyonu · 109 ders gramer görevi (0 ihlal) · S0 12 ders uçtan uca · perf/bütçe ölçülür; `evidence/K2F-17/{KANIT.md,ARA-RAPOR.md}` (sade Türkçe, kanıt düzeyleri ayrı, cihazda denenecek 3 akış) ve `tests/kao/README.md` envanteri güncellenir. Kod değişmez.

## Canlı gerçekler (araçla ölçüldü, 2026-10-01)
- Dal: `kao2-duzeltme` = canlı `main` (`4fd00131`) + belge-only kanıt commit'i. Sonraki push yalnız kullanıcı isteğiyle / K2F-18/43 kapılarında.
- Yayın pini (canlı): `20261001f` · kaynakta `App.kao*` 44 · App yüzeyi 765 · atama 603 (canlıda 43/764/602) · `onclick` 393.
- Kapılar: KAO 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **9/10 PASS** (R-01…R-07, R-09, R-10); kalan R-08 FAIL (beklenen, K2F-23).
- Bütçe (perf): içerik 184,231 KiB (tavan 256; müfredat modülü gzip 20,2 KiB ≤48) · runtime ≈110,3 KiB (tavan 128) · css ≈13,25 KiB (tavan 14).

## Açık riskler
- Seviye 0 zinciri canlıda; cihazda gözle doğrulama kullanıcıda (kaynak-görsel QA terminalden yapıldı).
- 3 gramer şablonu (g10-k3, g14-k2, g19-k3) yeni Türkçe içerik bekliyor (L1/L2, GRAMER-SABLON-L2.md öneriler).
- Canlıda R-07, R-08 sürer (R-07 kaynakta kapandı, yayın bekler; R-08 açık).
- Sonraki yeni handler K2F-30 (`kaoToggleAutoAdvance`) pinleri 45/766/604'e kaydırır — PROMPTLAR.md P8 listesine göre aynı committe.
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı; aralık 30'a genişletildi (seq 18) ve 45 simüle günde 0 hata ölçüldü (seq 22).
- `tests/kao/README.md` envanterinde 27 test dosyası yok (K2F-41); grammar_tasks satırı güncel.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan. zsh'de kelime bölünmez: `sed -i '' … "${DIZI[@]}"` kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir.

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
