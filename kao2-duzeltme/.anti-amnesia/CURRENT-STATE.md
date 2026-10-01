# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-18
lastSeq: 50
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 50 · K2F-00…17 tamam (18/44), sıradaki K2F-18. R-01…R-07, R-09, R-10 PASS (9/10).

## Şu an neredeyiz
K2F-17 bitti: Dalga 1 regresyonu temiz (kapilar YEŞİL, tekrar-uret 9/10, yalnız R-08 beklenen FAIL). Ek ölçümler: 12 ünite simülasyonu geçti · 109 derste gösterilen gramer görevi 75, ihlal 0 · S0 12 ders uçtan uca · perf runtime 110,8 KiB. Kullanıcı için `evidence/K2F-17/ARA-RAPOR.md` yazıldı; `tests/kao/README.md` envanteri s0/settings/hub satırlarıyla güncellendi. Kod değişmedi.
Canlıda K2F-12…15 var (`main` = `4fd00131`, pin `20261001f`); K2F-05…11 ve K2F-16 yalnız dalda.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-18 (YAYIN-1, kullanıcı kapısı):** `ARA-RAPOR.md` özeti kullanıcıya sunulur ve açık yanıt istenir ("YAYIN-1 onaylı" ya da "YAYIN-1 ertele"); yanıt yoksa `waiting_user` ile durulur, onaysız push/pin yok. Onaylıysa pin `20261001g`, ff-only merge + push, Pages izleme, canlı bayt-eşitliği.

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
