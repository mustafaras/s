# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-14
lastSeq: 42
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 42 · K2F-00…13 tamam (14/44), sıradaki K2F-14. R-01, R-02, R-03, R-05, R-06, R-09, R-10 PASS (7/10).

## Şu an neredeyiz
K2F-13 bitti (K5-02 iv): harf listesi olmayan 6 S0 dersi (s0.01, .03, .07, .08, .09, .11) artık içerik taşıyor ve hiçbir S0 dersi çizimde çökmüyor. Spec `s0Focus` (işaret
kimlikleriyle, Arapça yok) → araç lexicon'dan belirlenimci ≥3 örnek kelime seçiyor (≤3 hece, klip diskte, Latin okunuşlu; ünlü derslerinde başka işaret taşımayanlar önce) →
`quranCurriculumV2.js` (iki üretim bayt-eşit). `kaoS0HTML` focus dalı: işaretler + örnek kelimeler okunuşlu + her örnek için "Dinle" (örnek indeksiyle) + konum dersinde 28 harflik tablo.
Giriş satırı (Keşfet → s0.01) gerçek zincirle sınandı, çökmüyor. Kaynak/test düzeyinde; YAYIN YOK. Önceki: K2F-11 + ek tur canlıda (`main` = `3d97c338`, pin `20261001e`).
Yayın kararı: K2F-12 (düğme) + K2F-13 (içerik) birlikte çökmeyen bir S0 görünümü verir; ama S0 dersleri henüz alıştırmasız (K2F-14) ve sıfır kartlı S0 öğrencisi yolu K2F-15.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-14 (Seviye 0 3/4):** S0 dersinin 4 aşamasını gerçekten farklı içerikle göster ve 6–8 puanlı alıştırma ekle — `intro` (goal + mekanik cümle) → `listen` (örnekler + ses; ses yoksa görünür not) →
`drill` (6–8 soru: harf tanı · hece-hareke eşle · konum eşle; dersin `focus`'una göre; çeldiriciler aynı ders/aileden; `ui.kaoS0.drill={items,index,correct}`; `drill` bitmeden `next` pasif;
geri bildirim `aria-live`) → `read` (gerçek kelime; okunuşu göster/gizle); eylemler mevcut `App.kaoS0(action,…)` dağıtıcısıyla (yeni handler yok), HTML kurucuları `quranLearnViews.js`'e (K-2), motor yalnız model üretir;
aşama başına ≤1 `.kao-primary`; önce `test_kao2_s0.js`'te kırmızı (12 ders × 4 aşama, 6–8 alıştırma, puanlama), tasarım sözleşmesi PASS.

## Canlı gerçekler (araçla ölçüldü, 2026-10-01)
- Dal: `kao2-duzeltme` = canlı `main` (`3d97c338`) + belge-only commit'ler + K2F-12. Sonraki push yalnız kullanıcı isteğiyle / K2F-18/43 kapılarında.
- Yayın pini (canlı): `20261001e` · `App.kao*` 43 · App yüzeyi 764 · atama 602 · `onclick` 393 (kaynak; canlıda 42/763/601).
- Kapılar: KAO 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **7/10 PASS** (R-01, R-02, R-03, R-05, R-06, R-09, R-10); kalan R-04, R-07, R-08 FAIL (beklenen).
- Bütçe (perf): içerik 184,231 KiB (tavan 256; müfredat modülü gzip 20,2 KiB ≤48) · runtime ≈105,3 KiB (tavan 128) · css ≈13,14 KiB (tavan 14).

## Açık riskler
- S0 görünümü artık çökmüyor (K2F-13) ama S0 dersleri alıştırmasız (R-04, K2F-14/15) ve Keşfet satırı yalnız kartı olan kullanıcıya görünür; sıfır kartlı S0 öğrencisi ana ekrandan ders oynatıcıya (planı goal,apply,summary) gidiyor (K2F-15).
- 3 gramer şablonu (g10-k3, g14-k2, g19-k3) yeni Türkçe içerik bekliyor (L1/L2, GRAMER-SABLON-L2.md öneriler).
- Canlıda R-05 (düğme ölü), R-06 (kaynakta kapandı), R-04/R-07/R-08 sürer.
- Yeni handler'lar (K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe (K2F-16: 44/765/603).
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı; aralık 30'a genişletildi (seq 18) ve 45 simüle günde 0 hata ölçüldü (seq 22).
- `tests/kao/README.md` envanterinde 27 test dosyası yok (K2F-41); grammar_tasks satırı güncel.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan. zsh'de kelime bölünmez: `sed -i '' … "${DIZI[@]}"` kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir.

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
