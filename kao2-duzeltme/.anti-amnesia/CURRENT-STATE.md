# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-23
lastSeq: 64
status: active
-->

Son güncelleme: 2026-10-02 · LEDGER seq 64 · K2F-00…22 tamam (23/44), sıradaki K2F-23. R-01…R-07, R-09, R-10 PASS (9/10).

## Şu an neredeyiz
K2F-22 bitti: L1 onayı yalnız işaretli metinlere taşındı (`sourced` ⇔ işaretli kutu). Ölçülen sayılar (sourced/draft): üniteler 1/11 · dersler 27/82 · S0 8/4 · toplam **36/97**; 36 işaretli kutu, hepsi `by:"owner"`. Onaylı ünite yalnız Ünite 12; Ünite 1'de yalnız u01.04 onaylı, kalan Ünite 1 metinleri `draft` → ekranda "Ünite N · Ders M".
**Onay kaynağı:** yapay zekâ incelemesi — kullanıcı L1 incelemesini devretti; 26 bağımsız inceleme, iki bakışın da onayladığı 36 metin işaretlendi. `by:"owner"` kullanıcının devrine dayanır. **L2 uzman onayı açık**, L2 kutularına dokunulmadı. **97 draft** düzeltme bekliyor (ret gerekçeleri: abartılı vaat, başlık-içerik uyuşmazlığı, yanlış sûre ataması, u1–u3 `why` alanında kaynaksız iddialar).
Ünite 1 draft olduğundan 5 test (explain, hub, mastery, path, kao_render) güvenli yedeğe göre güncellendi (kırmızı önce görüldü; uygulama kodu değişmedi; onaylı u01.04 ve Ünite 12 gerçek metinle sınanır).
Yayın yok (değişen yayın varlığı `quranCurriculumV2.js`); pin yükseltme yok, yayın sonrası `20261001h`. Canlı: `main` = `19f0bfd6`, pin `20261001g`.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-23 (Uygula 1/2 — örnek cümleler):** 109 dersin 109'unda "Uygula" adımını içerikli yap (`quranLearnFlow.js` `applyWords`/`lessonPlan` apply, `quranLearnViews.js` apply aşaması, `quranLearn.js` apply modeli, `tests/kao/test_kao2_lesson_flow.js`): çapa metni olmayan derslerde doğrulanmış `examples[0]` taşıyan en çok 3 cümle; R-08 fail→pass. Kullanıcı "geç" diyene kadar başlanmaz.

## Canlı gerçekler (araçla ölçüldü, 2026-10-02)
- Dal: `kao2-duzeltme` = canlı `main` (`19f0bfd6`) + belge/test-only commit'ler (K2F-18 kanıtı, K2F-19). Sonraki push yalnız kullanıcı isteğiyle / K2F-18/43 kapılarında.
- Yayın pini (canlı): `20261001g` · `App.kao*` 44 · App yüzeyi 765 · atama 603 (kaynak = canlı) · `onclick` 393.
- Kapılar: KAO 51 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **9/10 PASS** (R-01…R-07, R-09, R-10); kalan R-08 FAIL (beklenen, K2F-23).
- Bütçe (perf): içerik 185,012 KiB (tavan 256; müfredat modülü gzip ≤48) · runtime 111,391 KiB (tavan 128) · css 13,560 KiB (tavan 14).

## Açık riskler
- **L2 uzman (alan uzmanı) onayı açık:** dinî bağlamlı metinlerde hiçbir L2 kutusu işaretli değil; L1 onayı yapay zekâ incelemesine ve kullanıcının devrine dayanır.
- **97 draft metin düzeltme bekliyor** (üniteler 11 · dersler 82 · S0 4); ret gerekçeleri: abartılı vaat, başlık-içerik uyuşmazlığı, yanlış sûre ataması, u1–u3 `why` kaynaksız iddialar.
- Üretici sayfayı yeniden yazınca inceleme kutuları sıfırlanır (elle yeniden işlenmeli); araç işaretsiz eski `sourced`'u `draft`'a düşürmez.
- Ders oynatıcı bağlam satırı draft ünite için "Ünite 1 · Ünite 1 · Ders 1 / 5" gösteriyor (çift ön ek); K2F-22'de değiştirilmedi, ayrı karar.
- Seviye 0 zinciri canlıda; cihazda gözle doğrulama kullanıcıda (kaynak-görsel QA terminalden yapıldı).
- 3 gramer şablonu (g10-k3, g14-k2, g19-k3) yeni Türkçe içerik bekliyor (L1/L2, GRAMER-SABLON-L2.md öneriler).
- Canlıda R-07, R-08 sürer (R-07 kaynakta kapandı, yayın bekler; R-08 açık).
- Sonraki yeni handler K2F-30 (`kaoToggleAutoAdvance`) pinleri 45/766/604'e kaydırır — PROMPTLAR.md P8 listesine göre aynı committe.
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı; aralık 30'a genişletildi (seq 18) ve 45 simüle günde 0 hata ölçüldü (seq 22).
- `tests/kao/README.md` envanterinde 24 test dosyası yok (araçla sayıldı; K2F-41); grammar_tasks satırı güncel.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan. zsh'de kelime bölünmez: `sed -i '' … "${DIZI[@]}"` kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir.

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-43 YAYIN-2 (K2F-22 L1 kapısı kapandı; L2 uzman onayı ayrı ve açık).
