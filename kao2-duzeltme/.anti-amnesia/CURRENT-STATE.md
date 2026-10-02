# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-20
lastSeq: 57
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 57 · K2F-00…19 tamam (20/44), sıradaki K2F-20. R-01…R-07, R-09, R-10 PASS (9/10).

## Şu an neredeyiz
**K2F-20 `waiting_user` (G2).** Kelimeler başlık/kavrama göre yeniden dağıtıldı (kaynak/test düzeyinde, yayın yok): 26 ders değişti, 41 lemma taşındı; ders kimlikleri/sıraları/boyutları ve Ünite 1–3 sabit; spec Ünite 4–12 `focus` + `lessonSizes`; iki üretim bayt-eşit. Kapı: ETİKET 18→11, ÖRNEK 11→2, ANLAM 1→1. A-6: tamamlanmış ders tamamlanmış kalır, taşınan tanışılmamış kelimeler sıradaki dersin planında tanıştırılır (`carryOver`). Kalan 11 ders yapısal sınırda (donmuş Ü1–3, sözlükte yeterli lemma yok, sınıf kuralı) — karar noktaları `MUFREDAT-ESLEME.md` sonunda.
Kullanıcıdan bekleniyor: `G2 onaylı` ya da değişiklik istekleri (ders/lemma kimliğiyle) + karar noktaları için seçenek. Onaysız K2F-20 `done` olmaz.
Canlı: `main` = `19f0bfd6`, pin `20261001g` (Dalga 1); K2F-19/20 değişiklikleri yalnız dalda.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-20 (aynı prompt, G2 yanıtı sonrası):** kullanıcı yanıtına göre spec düzeltilir (gerekirse yeniden üretim, iki kez bayt-eşit), LEDGER GATE `closed`, K2F-20 `done`; ardından K2F-21 (değişen derslerin başlık/hedef metinleri + L1 inceleme sayfası).

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
