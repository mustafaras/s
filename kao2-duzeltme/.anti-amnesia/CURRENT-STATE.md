# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-15
lastSeq: 43
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 43 · K2F-00…14 tamam (15/44), sıradaki K2F-15. R-01, R-02, R-03, R-05, R-06, R-09, R-10 PASS (7/10).

## Şu an neredeyiz
K2F-14 bitti (K5-02 v, D-10): S0 dersi artık aşama aşama ilerliyor ve her aşama farklı: **intro** (hedef + mekanik cümle) → **listen** (örnekler + "Dinle"; ses yoksa görünür not) → **drill** (6–8 puanlı soru;
cevaplanmadan birincil düğme pasif; `aria-live` geri bildirim; yanlışta "Doğrusu: …") → **read** (gerçek kelime, okunuş göster/gizle) → **done** ("n / m doğru"). HTML kurucuları `quranLearnViews.js` `s0Screen`'de, motor
yalnız model üretiyor; sorular belirlenimci (ders kimliği tohum), çeldiriciler önce aynı dersten/aileden, tüm Arapça modüllerden. Yeni handler yok (mevcut `kaoS0(action,…)`: answer/next/audio/read/playall).
Kaynak/test düzeyinde; YAYIN YOK. Önceki: K2F-11 + ek tur canlıda (`main` = `3d97c338`, pin `20261001e`).
**Henüz yok (K2F-15):** S0 tamamlanması `path.lessons`'a yazılmıyor; sıfır kartlı S0 öğrencisinin Bugün düğmesi hâlâ ders oynatıcıya (boş plan, R-04) gidiyor; besmele taşı gerçek `s0.12` tamamlanmasına bağlı değil; Keşfet satırı yalnız kartlı kullanıcıya görünür.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-15 (Seviye 0 4/4):** okuyamayan kullanıcı Bugün düğmesinden S0 yüzeyine ulaşsın ve S0 gerçekten tamamlansın — Flow `nextStep` S0 dalının eylemi `kaoS0('start','s0.xx')`; `kaoLessonStart('s0.xx')` S0 yüzeyine devretsin (boş plan kurmasın);
S0 dersi yalnız `read` aşaması bitince `path.lessons[id]={startedAt,doneAt,score}` yazsın (score = drill doğru/toplam); 12 S0 dersi uçtan uca → sonra Fâtiha; `besmele` taşı yalnız gerçek `s0.12` tamamlanınca ya da yerleştirmeyle;
Keşfet S0 satırı `onboarding.start==='s0'` ya da başlanmış S0 dersi ya da kart varsa görünsün; ilk açılıştan ilk S0 içeriğine ≤3 dokunuş; önce kırmızı (a–g, `test_kao2_s0/onboarding/today/milestones`), R-04 fail→pass.

## Canlı gerçekler (araçla ölçüldü, 2026-10-01)
- Dal: `kao2-duzeltme` = canlı `main` (`3d97c338`) + belge-only commit'ler + K2F-12. Sonraki push yalnız kullanıcı isteğiyle / K2F-18/43 kapılarında.
- Yayın pini (canlı): `20261001e` · `App.kao*` 43 · App yüzeyi 764 · atama 602 · `onclick` 393 (kaynak; canlıda 42/763/601).
- Kapılar: KAO 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **7/10 PASS** (R-01, R-02, R-03, R-05, R-06, R-09, R-10); kalan R-04, R-07, R-08 FAIL (beklenen).
- Bütçe (perf): içerik 184,231 KiB (tavan 256; müfredat modülü gzip 20,2 KiB ≤48) · runtime ≈109,8 KiB (tavan 128) · css ≈13,25 KiB (tavan 14).

## Açık riskler
- S0 görünümü çökmüyor (K2F-13), aşamalı ve puanlı (K2F-14); ama tamamlanma kaydı, sıfır kartlı S0 öğrencisinin Bugün yolu ve besmele taşı K2F-15'te (R-04).
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
