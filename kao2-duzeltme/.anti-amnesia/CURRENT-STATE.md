# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-22
lastSeq: 62
status: active
-->

Son güncelleme: 2026-10-02 · LEDGER seq 62 · K2F-00…21 tamam (22/44), sıradaki K2F-22. R-01…R-07, R-09, R-10 PASS (9/10).

## Şu an neredeyiz
K2F-21 bitti: 35 ders metni (K2F-20'de taşınan 26 ∪ kapıya takılan 13) dersin gerçek kelimelerinden yeniden yazıldı (`draft`, `by:null`; uygulamada "Ünite N · Ders M" görünür). Kapı: ETİKET 0 · ÖRNEK 1 (u07.01 %58) · ANLAM 0. `INCELEME-KAO2-17.md` yeniden üretildi: 133 metin, 35 `draft`, 98 `sourced` (açık kutu onayı yok → "Yeniden onay gerekli"), sayfa başında kullanıcı talimatı. Bağımsız denetim yüksek önemli bir kusuru buldu ve düzeltildi: draft başlık/hedef ünite ekranında, ders oynatıcıda ve hub kartında ham görünüyordu (düzeltme `quranLearn.js`/`quranLearnFlow.js`, mutasyonla doğrulandı). K2F-20 sunumundaki "leyse sözlükte yok" iddiası yanlıştı (leyse u08.03'te); karar değişmedi.
Yayın yok (değişen yayın varlıkları `quranCurriculumV2.js`, `quranLearn.js`, `quranLearnFlow.js`). Canlı: `main` = `19f0bfd6`, pin `20261001g`.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-22 (L1 onay taşıma, KULLANICI KAPISI):** `docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md` içindeki kutuları sen `[x]` yaparsın ve "L1 işaretlendi" yazarsın; ben yalnız işaretlenen metinleri `sourced` yaparım (`sourced` ⇔ işaretli kutu). Kutu işaretlenmeden ya da yanıt gelmeden `waiting_user` ile dururum.

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
