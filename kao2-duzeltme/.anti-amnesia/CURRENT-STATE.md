# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-20
lastSeq: 55
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 55 · K2F-00…19 tamam (20/44), sıradaki K2F-20. R-01…R-07, R-09, R-10 PASS (9/10).

## Şu an neredeyiz
K2F-19 bitti (K5-03 1/3): `tests/kao/test_kao2_lesson_coherence.js` ders başlığı/hedefi ↔ lemma kategorisi uyumunu ölçer (eşik %60, kavram kategorisi de). Kapı üç ölçümlü (ek turlar, seq 54–55): ETİKET 16 ders (kip/zaman/seslenme artık QAC 0.4'ten sayılmış tablodan) · ÖRNEK 11 ders (gösterilen âyetlerde hedef kip <%60) · ANLAM 1 ders (u06.20, eşanlamlı sınırı); listeler `KNOWN_MISMATCH` / `KNOWN_EXAMPLE_MISMATCH` / `KNOWN_SEMANTIC_GAP`, yalnız küçülür.02, u04.03, u04.04, u07.02, u09.11, u10.03, u12.03); `KNOWN_MISMATCH` tam liste, yalnız küçülür. Kod değişmedi, yayın yok. Canlı: `main` = `19f0bfd6`, pin `20261001g` (Dalga 1).
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-20 (Müfredat yeniden dağıtımı, G2 kullanıcı kapısı):** kelimeleri başlık/kavrama göre yeniden dağıtan yeni eşleme `MUFREDAT-ESLEME.md` olarak üretilir ve kullanıcıdan açık onay (G2) istenir; onay gelmeden müfredat modülü değişmez. Hedef: üç liste (16 + 11 + 1) boşalır; ÖRNEK listesi için örnek seçimi kipe göre yapılabilir ya da ders kipin tipik olduğu fiillerle yeniden dağıtılır.

## Canlı gerçekler (araçla ölçüldü, 2026-10-01)
- Dal: `kao2-duzeltme` = canlı `main` (`19f0bfd6`) + belge/test-only commit'ler (K2F-18 kanıtı, K2F-19). Sonraki push yalnız kullanıcı isteğiyle / K2F-18/43 kapılarında.
- Yayın pini (canlı): `20261001g` · `App.kao*` 44 · App yüzeyi 765 · atama 603 (kaynak = canlı) · `onclick` 393.
- Kapılar: KAO 51 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
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
