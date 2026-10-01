# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-11
lastSeq: 30
status: active
-->

Son güncelleme: 2026-10-01 · LEDGER seq 30 · K2F-00…10 tamam (11/44), sıradaki K2F-11. R-01, R-02, R-03, R-09, R-10 PASS (5/10).

## Şu an neredeyiz
K2F-10 bitti (K4-02 2/3, fail-closed güvenlik ağı): `quranLearn.js`'te `kaoGrammarTaskValid` (denetimin 5 kuralı + tam bir doğru şık +
boş/yinelenen şık yok + şablon türü eşleşmesi), `kaoGrammarItemPresentable` (gerçek tohumla kurup doğrular), `kaoLessonSafePlan` (ders planında
sunulamayan gramer alıştırması aynı dersin kelime alıştırmasıyla ikame; kimlik/sıra/sayı korunur), `kaoBuildQueue` süzgeci (kart silinmez, yalnız
sunumu kesilir) ve `kaoAnswer` retry koruması. 109 ders yürüyüşünde gösterilen gramer görevi 78 → 37, kusur 45 → 0, en az alıştırma 9.
`tests/kao/test_kao2_grammar_tasks.js` bölüm B (B1–B6; B6 mutasyonla doğrulandı). `test_kao_queue.js` dört-tür beklentisi, kullanıcının
“burda düzeltilmesi gereken şeyler varsa düzelt diğer aşamaya gecmeden” talimatı kapsamında aynı kartta güvenli tür beklentisine çekildi
(seq 28; seq 30, önceki hatalı doğrudan alıntıyı düzeltir). **Çekim tablosu türü şimdilik hiç sunulmuyor** (4 şablonun 4'ü kurucuda yanlış) — K2F-11 geri getirir.
Kapılar yeşil; yayın YOK (canlıda eski gramer davranışı sürer; `quranLearn.js` değişti → sonraki yayında pin yükselmeli).
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-11 (Gramer 3/3):** `kaoBuildGrammarTask`'ı doğrulanmış örnekten/kavram tablosundan kur (Kelime dizme → örnek `words` sırası, mevcut `order`
etkileşimi; Parça çevir → uyaran örnek Arapçası/doğru örnek `tr`; Çekim tablosu → yönergedeki tırnaklı hücreyle eşleşen satır; Ek çöz → tablo
sütunlarından, `'el + '` yalnız g1), `lessonPlan`'da aynı `templateId` ardışık gelmesin (K4-04, Flow'a yalnız bu dokunuş); önce bölüm C kırmızı
(86 şablon: desteklenen → geçerli görev, desteklenmeyen → gerekçeli liste; `exampleId`'li 43'ün 43'ü, 109 ders yürüyüşünde gösterilen gramer ≥60, 0 ihlal);
desteklenmeyenler `docs/kuran-ogreniyorum/kao2/inceleme/GRAMER-SABLON-L2.md`'ye (kimlikle, Arapça yazmadan); R-03 PASS kalır.

## Canlı gerçekler (araçla ölçüldü, 2026-10-01)
- Dal: `kao2-duzeltme` = `main` (canlı `1b3b47d1`) + belge-only `5098b0ba` + K2F-10. Sonraki push yalnız kullanıcı isteğiyle / K2F-18/43 kapılarında.
- Yayın pini (canlı): `20261001b` · `App.kao*` 42 · App yüzeyi 763 · atama 601 · `onclick` 393 (değişmedi; yeni dışa aktarım `kaoGrammarTaskValid` handler değil).
- Kapılar: KAO 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/plan-check/sync PASS.
- `tekrar-uret.cjs`: **5/10 PASS** (R-01, R-02, R-03, R-09, R-10); kalan R-04…R-08 FAIL (beklenen).
- Bütçe (perf): içerik 183,287 KiB (tavan 256) · runtime 99,058 KiB (tavan 128) · css 12,938 KiB (tavan 14) · p95 6,783 ms · steady 4,067 ms.

## Açık riskler
- Çekim tablosu gramer türü K2F-11'e kadar sunulmuyor; ders planında 41 gramer alıştırması (21 ders) kelime alıştırmasıyla ikame, tekrar kuyruğunda şablonların ≈50/86'sı (tohuma bağlı) elenir. Bu bilinçli (yanlış öğretmektense göstermemek).
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı; aralık 30'a genişletildi (seq 18) ve 45 simüle günde 0 hata ölçüldü (seq 22).
- Canlıda K4-02 (yanlış gramer görevleri), R-05 `App.kaoS0` tanımsız, R-06 Seviye 0 çökmeleri, R-04/R-07/R-08 sürer; K2F-10 yalnız kaynak/test düzeyinde kapandı.
- `s0` görünümü ulaşılabilir: R-06 (s0 derslerinden 6'sı `kaoS0HTML`'de çöküyor) K2F-13'e kadar açık; `App.kaoS0` tanımsız (R-05, K2F-12).
- Yeni handler'lar (K2F-12, K2F-16, K2F-30) fx2/v3/surface pinlerini kaydırır — PROMPTLAR.md P8 listesine göre aynı committe.
- `tests/kao/README.md` `test_kao2_grammar_tasks.js` satırı yalnız bölüm A'yı anıyor (Dokun dışı olduğundan K2F-10'da değişmedi); K2F-11'de A+B+C olarak güncellenebilir.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)` ile yerel diziye çevir.

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kapılar: K2F-18 YAYIN-1 · K2F-20 G2 müfredat · K2F-22 L1 kutuları · K2F-43 YAYIN-2.
