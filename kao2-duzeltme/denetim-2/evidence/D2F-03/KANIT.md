# D2F-03 · "Kelime dizme" aynı görünen çipler · KANIT

Oturum: https://claude.ai/code/session_018WK6EKGxUJbKAaNFboTVpv
Tarih: 2026-10-07 · Rapordaki bulgu: D2-01 · Yeniden üretme: `tekrar-uret-2.cjs` N-01

## İlerleme günlüğü
1. Dal `claude/sharp-volta-l6ifgz` `36015f08`'deydi; `denetim-2/` yoktu. D2F-02 (`2edc9810`) yalnız
   `origin/claude/jolly-ride-9ltui4`'te; dalımız onun katı atasıydı → `git merge --ff-only` ile ilerletildi.
2. ORTAK-KURALLAR okundu; `nextPrompt` = D2F-03; `d2f-sync-check.mjs --clean` PASS.
3. Okundu (grep + aralık): `applyAnswer` dizme yolu (`selected.ordinal===index`), `kaoGrammarTaskValid` "Kelime dizme" dalı,
   `kaoTaskHTML` dizme çip durumu (`choice.ordinal===orderPosition`) ve geri bildirim, `kaoAnswerText`, `kaoBuildFragmentTask`.
4. Test (bölüm D) yazıldı, değişiklikten önceki kodla koşuldu → kırmızı. Kod düzeltildi → yeşil. Mutasyonlar scratchpad kopyasında.
5. Kapılar tam, sırayla; koşu sürerken çalışma ağacı değişmedi.

## Yapılan
- `app/core/quranLearn.js`
  - Yeni yardımcı `kaoOrderLabels(task)`: çipleri `ordinal`'e göre sıralayıp **yazılarını** döndürür (doğru görünür sıra).
  - `applyAnswer` (dizme): seçilen her çipin yazısı o konumdaki beklenen yazıyla karşılaştırılır (eskiden çip kimliği/`ordinal`).
    Aynı yazılı çipler birbirinin yerine geçer; görünür sıra yanlışsa sonuç yine yanlış.
  - `kaoTaskHTML` geri bildirim: dizme çipinin doğru/yanlış rengi de yazıya dayanır — aksi hâlde "Doğru" başlığı altında iki çip
    kırmızı görünürdü.
  - `kaoAnswerText` aynı yardımcıyı kullanır (davranış aynı).
  - Dokunulmadı: FSRS (`kaoSchedule`), `kaoBuildQueue`, `kaoGrammarTaskValid` (dizme dalı zaten örnek kelime sırasını yazıyla
    doğruluyor; aynı yazılı çipler artık sorun değil, etiket-tekilliği muafiyeti doğru kalır), `app.js`, pinler.
- `tests/kao/test_kao2_grammar_tasks.js`: `walkAware`'e `orderFor`/`after` kancaları; bölüm D, 4 kontrol (27 → 31):
  - **D1** u08.02 g16-k2: aynı yazılı iki çip yer değiştirerek görünürde doğru sıra → "Doğru", panel doğru, günlük cevap/doğru +1,
    ders doğru +1, `errors` aynı, yeniden deneme eklenmez, HTML'de `kao-choice-wrong` yok.
  - **D2** u08.02 g16-k2: gerçekten yanlış sıra (düz kaydırma ve aynı yazılıları ayrıca değiştirilmiş kaydırma) → "Doğru cevap: …",
    doğru sayısı artmaz, `errors[errorClass]` +1, yeniden deneme eklenir.
  - **D3** 109 dersin tamamı iki geçişte (doğru sıra / yanlış sıra), her dizme görevinde aynı yazılı çipler yer değiştirilerek:
    sonuç beklenenle aynı; ≥10 dizme görevi ve g16-k2 aynı yazılı çipli görevler arasında.
  - **D4** parça (fragment) dizme, gerçek akışla (`kaoStart` → ilk görev parça dizme): gerçek veride doğru sıra doğru; gerçek
    kısa sûre gruplarında tekrar eden kelime olmadığından sentetik VM'de 95:4 grubunun 5. kelimesine 3. kelimenin yazı+okunuşu
    kaynak modülden kopyalanır (elle Arapça yok) → yer değiştirmiş doğru sıra "Doğru"; yanlış sıra yanlış, `errors.order` +1.
  - Durum elle kurulmadı: akış `kaoLesson`/`kaoStart`/`kaoAnswer`/`kaoContinue` handler'larıyla sürüldü.

## TDD
Kırmızı (değişiklikten önceki kodla, `node tests/kao/test_kao2_grammar_tasks.js`):
```
AssertionError [ERR_ASSERTION]: geri bildirim: Doğru cevap: فَإِن · لَّمْ · تَفْعَلُوا۟ · وَلَن · تَفْعَلُوا۟
    at /home/user/s/tests/kao/test_kao2_grammar_tasks.js:758:10   (D1)
```
Yeşil: `test_kao2_grammar_tasks (bölüm A+B+C+D): 31 kontrol PASS` (çıkış 0).

Mutasyon kanıtları (scratchpad'de `git archive HEAD` kopyası + bu oturumun dosyaları; çalışma ağacı değil):
- (a) `applyAnswer` dönüşü `selected.ordinal===index`'e geri: D1 → `AssertionError [ERR_ASSERTION]: geri bildirim: Doğru cevap: …`;
  yalnız D4 koşulduğunda → `AssertionError [ERR_ASSERTION]: geri bildirim: Fiil önce gelir: Arapçada çoğu kez fiil–özne–nesne sırası kullanılır.`
- (b) `kaoTaskHTML` çip durumu `choice.ordinal===orderPosition`'a geri: D1 → `AssertionError [ERR_ASSERTION]: çiplerden hiçbiri yanlış işaretlenmez`.

## Kapılar
`KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` (tam, başlangıç 2026-10-07, çıkış 0, 1437 sn), çıktı aynen:
```
== KAO2-FIX kapıları ==
mod: YAVAŞ MAKİNE (KAO2_ACCEPT_SLOW_HOST=1) — yalnız göreli p95 bandı atlanır, mutlak tavanlar zorunlu
node --check quranLearn.js         PASS
node --check quranLearnFlow.js     PASS
node --check quranLearnViews.js    PASS
node --check quranCurriculumV2.js  PASS
node --check quranGrammarV1.js     PASS
tests/kao (54)                     PASS
tests/app (77)                     PASS
tests/panel (23)                   PASS
tests/panel-v2 (27)                PASS
tests/quran (9)                    PASS
reminders smoke                    PASS
run-seyma driver                   PASS
run-seyma zikr                     PASS
kontrast                           PASS
l2-paket --check                   PASS
kao-plan-check                     PASS
fix-sync-check --repro             PASS
== tekrar-uret özeti ==
KAO2 denetim tekrar üretimi: 10/10 PASS · 0 FAIL
== perf ==
KAO2 perf: PASS (content 184.194 KiB · runtime 117.423 KiB · css 13.027 KiB · p95 36.675 ms · steady 17.404 ms · GÖRELİ BANT ATLANDI (yavaş makine): steady 17.404 ms > bant 6.360 ms)
SONUÇ: TÜM KAPILAR YEŞİL
```
Diğer kapılar (kapı koşusundan sonra, sırayla):
```
$ node kao2-duzeltme/denetim/tekrar-uret.cjs       → KAO2 denetim tekrar üretimi: 10/10 PASS · 0 FAIL
$ node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs   → PASS  N-01 (D2-01) · aynı etiketli çip yer değiştirince de Doğru
                                                      KAO2-FIX denetim-2 tekrar üretimi: 1/9 PASS · 8 FAIL (önce 0/9)
$ node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs → D2F senkron: PASS · 3/16 prompt done · nextPrompt D2F-04 · ledger seq 3 · N 1/9 pass · App.kao* 45 · yüzey 766 · atama 604 · onclick 393 · pin 20261006e
```

## Ölçümler
| Ölçüm | Değer |
|---|---|
| tekrar-uret-2 | 1/9 PASS (N-01) — önce 0/9 |
| tekrar-uret | 10/10 |
| test_kao2_grammar_tasks | 31 kontrol PASS (önce 27) · tek başına ~3,5 dk |
| perf (bayraklı) | content 184,194 · runtime 117,423 (önce 117,280) · css 13,027 KiB · p95 36,675 ms · steady 17,404 ms |
| pinler | App.kao* 45 · yüzey 766 · atama 604 · onclick 393 · yayın 20261006e (değişmedi) |

## Bilerek değişen testler
- Yok. `test_kao2_grammar_tasks.js` yalnız genişletildi (`walkAware`'e isteğe bağlı kanca + bölüm D); var olan 27 kontrol aynı.
- Davranış: eski: aynı yazılı dizme çipleri ters seçilince yanlış · yeni: doğru · gerekçe: D2-01 (kullanıcı yalnız yazıyı görür).

## Kanıt düzeyleri
- **Kaynak/test:** bu oturumda koşuldu — yukarıdaki tüm komutlar.
- **Yayın:** yok (pin/sw değişmedi; yayın yalnız Prompt 15). Canlı uygulamada hata yayın yapılana kadar sürer.
- **Cihaz:** yok.

## Sürprizler
- Dal D2F-02'nin gerisindeydi (yukarıda, ff-only). Konteyner yine sığ klondu → `git fetch --unshallow origin`.
- `rsync` yoktu; ilk `apt-get install` paket listesi olmadan başarısızdı, kapı koşusu başladıktan sonra `apt-get update` ile
  kuruldu — kurulum `tests/kao` aşamasında bitti, rsync'e ihtiyaç duyan `tests/app`'ten önce (tests/app PASS).
- p95 36,7 ms / steady 17,4 ms, D2F-02'deki 24,3 / 9,9'dan yüksek: kapı koşusu sırasında konteynerde apt kurulumu da çalıştı;
  runtime yalnız +0,14 KiB büyüdü. Mutlak tavan (40 ms) içinde; yakın, D2F-13'te yeniden ölçülmeli.
- Gerçek kısa sûre parçalarında tekrar eden kelime yok; parça yolu sentetik VM ile sınandı (D4).
