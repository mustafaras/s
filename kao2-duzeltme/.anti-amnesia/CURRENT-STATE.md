# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-16
lastSeq: 47
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 47 · K2F-00…15 tamam (16/44), sıradaki K2F-16. R-01…R-06, R-09, R-10 PASS (8/10).

## Şu an neredeyiz
K2F-15 bitti (K5-01, K5-02 iii): Seviye 0 zinciri tamamlandı (K2F-12…15, kaynak/test düzeyinde). Okuyamayan kullanıcı ("Henüz değil") ilk açılıştan 3 dokunuşla (next · choose · finish) S0 içeriğine ulaşır; Bugün birincil düğmesi
`kaoS0('start','s0.01')`; `kaoLessonStart('s0.xx')` S0 yüzeyine devreder (boş plan yok, R-04 PASS); S0 dersi yalnız `read` aşaması bitince `path.lessons[id]={startedAt,doneAt,score}` yazar (score = alıştırma doğru/toplam);
12 ders uçtan uca → sonra Fâtiha (`u01.01`); Besmele taşı yalnız `s0.12` tamamlanınca (ya da yerleştirmeyle); Keşfet "Seviye 0" satırı `start==='s0'` / başlanmış S0 dersi / kart varsa görünür.
Yayın YOK: canlıda (`main` = `3d97c338`, pin `20261001e`) S0 düğmesi hâlâ ölü, S0 dersleri alıştırmasız. **Yayın önerisi:** K2F-12…15 birlikte yayınlanmalı (yalnız bir kısmı çökme/boş ekran riski taşır); öncesinde cihazda gözle doğrulama
(kaynak-görsel QA terminalden yapıldı, seq 45; cihaz kabulü değil).
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-16 (Niyet):** ilk açılışta seçilen niyet (`onboarding.intent`) Ayarlar'da görünsün ("Niyet: Her yatsı namazından sonra 5 dakika"), `App.kaoSetIntent(v)` ile değiştirilebilsin (sabah/öğle/ikindi/akşam/yatsı/kendim; geçersiz değer reddedilir) ve hub "bekliyor" önerisini belirlesin
(niyet varsa o vaktin saatiyle öneri, yoksa mevcut sıradaki-vakit davranışı); önce `test_kao2_settings.js`/`test_kao2_hub.js`'te kırmızı, `App.kaoSetIntent` P8 (43→44 · 764→765 · 602→603, 9 pin dosyası + FIX-STATE `pins`, ölçerek), R-07 fail→pass.

## Canlı gerçekler (araçla ölçüldü, 2026-10-01)
- Dal: `kao2-duzeltme` = canlı `main` (`3d97c338`) + belge-only commit'ler + K2F-12. Sonraki push yalnız kullanıcı isteğiyle / K2F-18/43 kapılarında.
- Yayın pini (canlı): `20261001e` · `App.kao*` 43 · App yüzeyi 764 · atama 602 · `onclick` 393 (kaynak; canlıda 42/763/601).
- Kapılar: KAO 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **8/10 PASS** (R-01…R-06, R-09, R-10); kalan R-07, R-08 FAIL (beklenen).
- Bütçe (perf): içerik 184,231 KiB (tavan 256; müfredat modülü gzip 20,2 KiB ≤48) · runtime ≈110,3 KiB (tavan 128) · css ≈13,25 KiB (tavan 14).

## Açık riskler
- Seviye 0 zinciri kaynak/test düzeyinde tamam; cihazda gözle doğrulanmadı (görsel QA yok) ve canlıda henüz yok.
- 3 gramer şablonu (g10-k3, g14-k2, g19-k3) yeni Türkçe içerik bekliyor (L1/L2, GRAMER-SABLON-L2.md öneriler).
- Canlıda R-04…R-08 sürer (R-04, R-05, R-06 kaynakta kapandı; R-07, R-08 açık).
- Yeni handler'lar (K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe (K2F-16: 44/765/603).
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı; aralık 30'a genişletildi (seq 18) ve 45 simüle günde 0 hata ölçüldü (seq 22).
- `tests/kao/README.md` envanterinde 27 test dosyası yok (K2F-41); grammar_tasks satırı güncel.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan. zsh'de kelime bölünmez: `sed -i '' … "${DIZI[@]}"` kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir.

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
