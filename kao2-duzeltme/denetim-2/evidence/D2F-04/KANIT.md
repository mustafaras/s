# D2F-04 · Aynı derste aynı gramer sorusu + dizme çözülmüş açılmasın · KANIT

Oturum: https://claude.ai/code/session_01FSbk3dCn8vUh1pAKQR11qA
Tarih: 2026-10-07 · Rapordaki bulgu: D2-09 (K4-04 kalıntısı) + LEDGER seq 4 NOT (kullanıcı kararı seq 5: "04 e eklensin") ·
Yeniden üretme: `tekrar-uret-2.cjs` N-09

## İlerleme günlüğü
1. Dal `claude/cool-bardeen-6k6fgo` `36015f08`'deydi; `denetim-2/` yoktu. D2F-03 (`6b6cf333`) yalnız
   `origin/claude/sharp-volta-l6ifgz`'de; dalımız onun katı atasıydı → `git merge --ff-only` ile ilerletildi.
2. ORTAK-KURALLAR okundu; `nextPrompt` = D2F-04; `d2f-sync-check.mjs --clean` PASS (seq 5, N 1/9).
3. Okundu: `kaoLessonActivate` (plan öğeleri `seed:item.id` ile kurulur), K2F-10 ikame yolu `kaoLessonSafePlan` +
   `kaoGrammarItemPresentable`, `kaoBuildGrammarTask` (`choiceCount` gramerde kullanılmaz → plan anında kurulan görev
   gösterilenle aynı), `gramOrderRecipe`, `kaoOrderLabels`; `quranLearnFlow.js` `lessonPlan` ardışıklık kuralı (yalnız okundu,
   dokunulmadı).
4. Önce ölçüm (scratchpad betiği, değişiklikten önceki kod): 109 ders, gösterilen gramer 78, ders içi aynı soru çifti 1
   (u01.02 g1-k1 ≡ g1-k2), alıştırma sayısı 106 derste 10, u11.04/05/06'da 9; dizme 18 şablon × 2000 tohum → 21 çözülmüş.
5. Bölüm E testleri yazıldı → önceki kodla kırmızı (E1). Ders içi tekrar düzeltildi → E1/E2 yeşil, E3 kırmızı. Dizme düzeltildi → 34/34.
6. Mutasyonlar scratchpad kopyasında (`git archive HEAD` + bu oturumun dosyaları). Kapılar tam, sırayla; koşu sürerken ağaç değişmedi.

## Yapılan
- `app/core/quranLearn.js`
  - Yeni yardımcı `kaoGrammarTaskSignature(task)`: kullanıcının gördüğü soru = tür + yönerge + uyaran + şık yazıları (sırasız).
    Dizmede uyaran yalnız tekrar sayısına bağlı ilk-kelime ipucudur; imzaya girmez (aynı parçayı dizdiren iki şablon ipucu
    farkıyla ayrı soru sayılmaz — daha katı yön).
  - `kaoLessonSafePlan` (K2F-10 ikame yolu): her gramer plan öğesi gösterileceği tohumla (öğe kimliği) kurulur, imzası ders içi
    `seen` kümesine bakılır; tekrar ise **mevcut ikame yolu** (aynı dersin henüz kullanılmamış kelime alıştırması, öğe kimliği ve
    sırası korunur, `substitutedFor` yazılır) kullanılır. Sunulamayan görevin ikamesi aynen sürer.
  - `gramOrderRecipe`: "zaten çözülmüş mü" kontrolü çip kimliği (`item.ordinal===index`) yerine ekrandaki **yazı dizisiyle**
    (`kaoOrderLabels({choices})`) yapılır; yazı dizisi doğru diziden ayrılana kadar kaydırılır (yalnız tüm yazılar aynıysa
    ayrılamaz — gerçek veride yok).
  - Dokunulmadı: `quranLearnFlow.js` (ardışıklık kuralı), FSRS (`kaoSchedule`), `kaoBuildQueue`, `kaoGrammarTaskValid`, `app.js`,
    pinler/`sw.js`. Yeni `App.kao*` yok.
- `tests/kao/test_kao2_grammar_tasks.js`: ortak `shownSignature`; bölüm E, 3 kontrol (31 → 34):
  - **E1** 109 dersin gerçek yürüyüşü (`walkAware`, gerçek handler'lar): hiçbir derste aynı gramer sorusu (tür + yönerge + uyaran +
    şıklar) iki kez yok; her derste alıştırma sayısı ölçülen bugünkü değerde sabit (10; u11.04/05/06: 9); ikame sayısı = çift
    sayısı (1); gösterilen gramer = 78 − 1.
  - **E2** u01.02: `practice:u01.02:g1:g1-k2` kimliği korunur, kelime alıştırması (`substitutedFor: g:g1:g1-k2`), lemma dersin
    lemması, ikame kartı planda tek, yeni lemmanın tanış kartı ikameden önce, ilk kopya g1-k1 kalır.
  - **E3** 18 dizme şablonu × 2000 tohum (`kao:<gün>:<kart>`, 2026-01-01'den ardışık 2000 gün) = 36000 görev: ekrandaki yazı dizisi
    hiçbir zaman doğru yazı dizisine eşit değil; doğru sıra (ordinal) yine örnek sırası.

## TDD
Kırmızı 1 (değişiklikten önceki kodla, `node tests/kao/test_kao2_grammar_tasks.js`, çıkış 1):
```
AssertionError [ERR_ASSERTION]: ders içi aynı gramer sorusu: u01.02: g:g1:g1-k1 ≡ g:g1:g1-k2
```
Kırmızı 2 (ders içi tekrar düzeltildikten sonra, dizme düzeltmesinden önce; E1/E2 PASS):
```
AssertionError [ERR_ASSERTION]: çözülmüş açılan dizme: {"g:g16:g16-k2":21}
```
Ara kırmızı (bilerek değişen test, aşağıda): B3 `AssertionError [ERR_ASSERTION]: yalnız sunulamayan görev ikame edilir`.
Yeşil: `test_kao2_grammar_tasks (bölüm A+B+C+D+E): 34 kontrol PASS` (çıkış 0) · `gösterilen gramer görevi: 78 → 77 · ikame 1 · ders içi tekrar 0`.

Mutasyon kanıtları (scratchpad'de `git archive HEAD` kopyası + bu oturumun `quranLearn.js` ve testi; çalışma ağacı değil):
- (a) `kaoLessonSafePlan` koşulu `if(keep&&!(signature&&seen[signature]))` → `if(keep)`: çıkış 1,
  `AssertionError [ERR_ASSERTION]: ders içi aynı gramer sorusu: u01.02: g:g1:g1-k1 ≡ g:g1:g1-k2` (E1).
- (b) `gramOrderRecipe` kaydırma koşulu eski kimlik kontrolüne (`choices.every(item.ordinal===index)`, tek kaydırma): çıkış 1,
  `AssertionError [ERR_ASSERTION]: çözülmüş açılan dizme: {"g:g16:g16-k2":21}` (E3).
- Yalnız beklenen görevlerin değiştiği (scratchpad `orderdiff.cjs`, HEAD ↔ çalışma ağacı, çip `tokenId` dizisi):
  `toplam 36000 değişen 21 g:g16:g16-k2` — kimlik sırası zaten karışık olmayan hiçbir görevin karışımı değişmedi.

## Kapılar
`KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` (tam, başlangıç 2026-10-07T10:54:11Z, çıkış 0, 21 dk 57 sn), çıktı aynen:
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
KAO2 perf: PASS (content 184.194 KiB · runtime 117.920 KiB · css 13.027 KiB · p95 30.193 ms · steady 11.663 ms · GÖRELİ BANT ATLANDI (yavaş makine): steady 11.663 ms > bant 6.360 ms)
SONUÇ: TÜM KAPILAR YEŞİL
```
Diğer kapılar (kapı koşusundan sonra, sırayla):
```
$ node kao2-duzeltme/denetim/tekrar-uret.cjs       → KAO2 denetim tekrar üretimi: 10/10 PASS · 0 FAIL
$ node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs   → PASS  N-09 (D2-09) · tekrar yok
                                                      KAO2-FIX denetim-2 tekrar üretimi: 2/9 PASS · 7 FAIL (önce 1/9)
$ KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_kabul.js
  | A-2 | Her yeni lemmanın ilk görünümü tanış kartı (109 ders, gerçek oynatma) | %100 | 109/109 ders oynatıldı (onarım turları ayrı) · 1097 görev · 524 yeni lemma · ihlal 0 | ✅ PASS | Fixture |
  KAO2-27 kabul: 10/10 ölçüt PASS · P10 kapanış kabulü PASS (A-11/A-12 cihazda)
$ node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --repro   (commit öncesi, kayıtlar yazıldıktan sonra, çıkış 0)
  D2F senkron: PASS · 4/16 prompt done · nextPrompt D2F-05 · ledger seq 6 · N 2/9 pass · App.kao* 45 · yüzey 766 · atama 604 · onclick 393 · pin 20261006e
```

## Ölçümler
| Ölçüm | Önce | Sonra |
|---|---|---|
| Gösterilen gramer görevi (109 ders, taze kullanıcı, doğru yürüyüş) | 78 | **77** (azalma 1 = çift sayısı) |
| Ders içi aynı gramer sorusu çifti | 1 (u01.02 g1-k1 ≡ g1-k2) | **0** |
| Alıştırma sayısı / ders | 106×10, u11.04/05/06 = 9 | aynı (E1'de sabit) |
| Dizme çözülmüş açılış (18 şablon × 2000 gün tohumu) | 21/36000 (hepsi g16-k2) | **0/36000** |
| Dizme çözülmüş açılış (ikinci tohum biçimi `kao:s<i>:<kart>`, ölçüm betiği) | 35/36000 (hepsi g16-k2) | 0/36000 |
| test_kao2_grammar_tasks | 31 kontrol | 34 kontrol (tek başına ~5,8 dk bu makinede) |
| tekrar-uret-2 | 1/9 | **2/9** (N-01, N-09) |
| tekrar-uret | 10/10 | 10/10 |
| Kabul A-2 | PASS | PASS (109/109, ihlal 0) |
| perf (bayraklı) | runtime 117,423 KiB · p95 36,675 ms | runtime 117,920 KiB (+0,50) · p95 30,193 ms · steady 11,663 ms |
| pinler | App.kao* 45 · yüzey 766 · atama 604 · onclick 393 · yayın 20261006e | değişmedi |

NOT seq 4'teki "2000 tohumda 22" sayısı farklı bir tohum biçimiyle ölçülmüştü; bu oturumda iki biçimde 21 ve 35 ölçüldü — üçünde de
yalnız g16-k2 (aynı yazılı iki çipli tek dizme örneği).

## Bilerek değişen testler
- `B3` (K2F-10): eski: planda `substitutedFor` taşıyan **ilk** dersi seçip her ikamenin "sunulamayan görev" olduğunu doğrular →
  yeni: sunulamayan ikamesi olan ilk dersi seçer; her ikame ya sunulamayan görevdir ya da (D2F-04) aynı plandaki daha önceki bir
  gramer öğesinin gösterilen sorusuyla birebir aynıdır. Gerekçe: ikame yolu artık ders içi tekrarı da ikame eder; bozuk VM'de ilk
  ikameli ders u01.02 (yalnız tekrar ikamesi) olduğundan eski seçim, sunulamayan görev ikamesini hiç sınamadan kırmızıya düşerdi.
  Gevşetme yok: sunulamayan ikame yine aranır ve kimlik/kelime/sayı/kalan-geçerlilik kontrolleri aynen koşar; tekrar dışı sunulabilir
  bir ikame hâlâ FAIL verir.
- Diğer 30 kontrol aynı; C8'in günlük satırı artık 77 yazar (eşik ≥60, değişmedi).

## Kanıt düzeyleri
- **Kaynak/test:** bu oturumda koşuldu — yukarıdaki tüm komutlar.
- **Yayın:** yok (pin/sw değişmedi; yayın yalnız Prompt 15). Canlı uygulamada iki kusur da yayına kadar sürer.
- **Cihaz:** yok.

## Sürprizler
- Dal yine bir önceki promptun gerisindeydi (yukarıda, ff-only). Konteyner sığ klon ve `rsync`'siz geldi →
  `git fetch --unshallow origin` + `apt-get update && apt-get install -y rsync` kapı koşusundan önce.
- Bu makinede `test_kao2_grammar_tasks.js` tek başına ~5,8 dk, kapılar 21 dk 57 sn.
- Kapsam dışı kardeş: kısa sûre **parça** dizmesi (`kaoBuildFragmentTask`) karıştırmadan sonra hiç "çözülmüş mü" kontrolü yapmıyor;
  scratchpad ölçümü (`kaoStart` sonrası tek parça kartı `s:95:4:1`, 500 tohum) 5/500 çözülmüş açılış. Bu promptun dosya/kapsamı
  dışında; dokunulmadı. Kullanıcıya ayrı görev önerisi olarak bildirildi (LEDGER seq 6).
- `kaoLessonSafePlan` gramer öğesi başına görevi iki kez kurar (geçerlilik + imza); ders başına ≤4 öğe, perf kapısı yeşil.
