# D2F-05 · Denetim kontrollerini güçlendir (R-01, R-10) · KANIT

Oturum: https://claude.ai/code/session_d0d6d6d9-c277-497f-98ea-e3c237d4db72
Tarih: 2026-10-07 · baseCommit `cbe0d604ffb1fcd20168c9214f590771ec878fbc` · bu oturumun HEAD'i `59abe97b` (D2F-04 YAYIN).

## İlerleme günlüğü
1. ORTAK-KURALLAR okundu; `D2F-STATE.json.nextPrompt` = `D2F-05` (uyuşuyor). `d2f-sync-check` başlangıçta PASS idi (D2F-04 kapanışı).
2. R-01 ve R-10'un eski gövdeleri okundu; ikisinin de bulgusunu yakalamadığı doğrulandı:
   - **R-01 (eski):** ünite derslerini kendi kaydıyla (`q.path.lessons[...]={doneAt}`) kurup `st.at`/`st.phase`'i **elle** atıyor,
     başarısız ustalıkta bile "kayıt var mı" (`recorded || …`) ile PASS veriyordu — D2-02.
   - **R-10 (eski):** `\nfs\.writeFileSync\(path\.join\(repoRoot, '[^']*A-KABUL\.md'\)` kalıbı **çift boş**: yazım sütun-0'da değil
     (girintili) ve gerçek yazım literal `A-KABUL.md` yolu değil `evidenceOut` değişkenini kullanıyor — D2-03.
3. **Test önce:** önce scratchpad sonda betiğiyle (`/tmp/claude-501/d2f05-probe.cjs`) gerçek ustalık akışı ölçüldü:
   `walkLesson(...) && kaoLesson('finish')` ile dersler gerçekten bitirilince `kaoNextStep` `mastery` veriyor; `playLesson`
   özette `finish` demeden döndüğü için tek başına üniteyi tamamlamıyor. Doğru cevap → `masteryAt` dolu + `next-unit`,
   yanlış cevap → `masteryAt` boş + `repair` doğrulandı. Sonra R-01/R-10 yeni gövdelerle yazıldı; değişiklik öncesi kodla
   kırmızı beklenir (aşağıdaki mutasyonlar bunun yerine kanıtlar).
4. `tests/kao/test_kao2_denetim.js` düzenlendi (import + R-01 + R-10). `tekrar-uret-2.cjs` N-03 aynı kalıba getirildi
   (güçlendirilmiş denetimi girintili koşulsuz yazıma uygular). `denetim/tekrar-uret.cjs` başına tarihsel-kayıt yorumu eklendi.
5. Mutasyon kanıtları scratchpad'de koşuldu (aşağıda). Kapı koşusu yapıldı (kırmızı — ortam; aşağıda "Kapılar").

## Yapılan
- `tests/kao/test_kao2_denetim.js`
  - Import satırına `playLesson` eklendi (`./helpers/kao-harness`).
  - **R-01** yeniden yazıldı: Ünite 1 dersleri `walkLesson` ile **gerçekten** oynanıp `kaoLesson('finish')` ile bitirilir;
    ustalık adımı `kaoLesson('start')` + `playLesson` ile gerçek handler'larla oynanır. **Elle `st.at`/`st.phase` ataması yok.**
    Doğru cevaplarla → `path.units['1'].masteryAt` dolu (`typeof string && !!`), `masteryScore ≥ 0,8`, sonraki adım `next-unit`;
    yanlış cevaplarla → `masteryAt` boş, sonraki adım `repair`. Üstelik derslerin gerçekten bittiği (`lessonsOk`) ve adımın
    `mastery` olduğu da doğrulanır.
  - **R-10** yeniden yazıldı: `tests/kao/test_kao2_kabul.js` içinde `fs.writeFileSync(` içeren, `A-KABUL.md` **ya da** `evidenceOut`
    geçen (yorum olmayan) her satır yazım sayılır — **girintiden bağımsız**. Her yazım için yukarı doğru daha az girintili en
    yakın `if (` bloğu bulunur; yazım o blokla sarılı **değilse** ya da o koşul `KAO2_EVIDENCE_OUT`/`evidenceOut`'a bakmıyorsa
    "koşulsuz" sayılır ve test FAIL verir. `writes.length > 0 && unguarded.length === 0` beklenir.
- `kao2-duzeltme/denetim-2/tekrar-uret-2.cjs`: **N-03** aynı güçlendirilmiş kalıba çevrildi (girintili koşulsuz yazımı ekleyip
  yakalandığını doğrular); açıklama "D2F-05'te güçlendirildi" olarak güncellendi.
- `kao2-duzeltme/denetim/tekrar-uret.cjs`: yalnız başa bir yorum satırı
  (`// tarihsel kayıt; güncel kontroller tests/kao/test_kao2_denetim.js — R-01/R-10 D2F-05'te güçlendi`). Gövde değişmedi.

- `kao2-duzeltme/denetim-2/D2F-STATE.json`: D2F-05 `done` + evidence/oturum; `nextPrompt` `D2F-06`; `ledgerLastSeq` 8; N-02/N-03 `pass`;
  **N-08 `fail`→`pass`** — `d2f-sync-check --repro` "N-08: gerçek pass ama STATE fail (STATE güncellenmemiş)" verdi; seq 7 erken yayını
  panel-v2.html pinini `20261007a` yaptığı için N-08 (D2-08, pin tazeliği) **gerçekten** kapanmış; kaydı gerçeğe uyduruldu.

Dokunulmadı: `app.js`, `app/core/*`, `sync.js`, pinler/`sw.js`, `migrate()`, FSRS, `test_kao2_kabul.js` (yalnız okundu).

## TDD
Bu prompt bir **denetim testini** güçlendirir; üretim davranışı değişmez. "Önce kırmızı" karşılığı: eski kalıpların bulguyu
kaçırdığı ölçüldü (N-02/N-03 başlangıçta `FAIL`), yeni kalıpların düştüğü mutasyonlar aşağıda yakalandı. Durum elle kurulmaz:
R-01 gerçek `kaoLesson('start'/'finish')` + `walkLesson`/`playLesson` ile `kao-harness` üzerinden sürülür.

## Kapılar
`KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` (tam koşu, bu oturumda), çıktı aynen:
```
== KAO2-FIX kapıları ==
mod: YAVAŞ MAKİNE (KAO2_ACCEPT_SLOW_HOST=1) — yalnız göreli p95 bandı atlanır, mutlak tavanlar zorunlu
node --check quranLearn.js         PASS
node --check quranLearnFlow.js     PASS
node --check quranLearnViews.js    PASS
node --check quranCurriculumV2.js  PASS
node --check quranGrammarV1.js     PASS
tests/kao (54)                     FAIL: test_kao2_kabul.js
tests/app (77)                     FAIL: test_settings_boundary.js
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
KAO2 perf: PASS (content 183.544 KiB · runtime 117.350 KiB · css 13.035 KiB · p95 4.534 ms · steady 2.854 ms · GÖRELİ BANT ATLANDI (yavaş makine): steady 2.854 ms ≤ bant 6.360 ms)
SONUÇ: KIRMIZI KAPI VAR
exit=1
```
`tekrar-uret-2.cjs` (ayrı koşu):
```
PASS  N-01 (D2-01) · aynı etiketli çip yer değiştirince de Doğru
PASS  N-02 (D2-02) · R-01 koşulu (kayıt var mı) masteryAt=null skor=0 iken FAIL veriyor
PASS  N-03 (D2-03) · girintili koşulsuz yazım yakalanıyor (2 kanıt yazımı, koşulsuz 1)
FAIL  N-04 (D2-04) · CLAUDE.md "L1 … onayı kullanıcıda"=true · veri: {"sourced":158}
FAIL  N-05 (D2-05) · 54 dosya · envanterde olmayan: test_kao_pronunciation_contract.js
FAIL  N-06 (D2-06) · K2F-43 GATE kaydı=false · KANIT.md=false
FAIL  N-07 (D2-07) · "Canlı gerçekler" tarihi 2026-10-03 · "Kalan kapı: K2F-43" · K2F-38 oturum başlatıcısı bekleyen iş · dal satırı dc3f3f06 · CSS payı 0,39 KiB (güncel ≈0,97)
PASS  N-08 (D2-08) · panel-v2.html styles.css?v=20261007a · styles.css son değişiklik 8bf8f658 pin commit'inden sonra=false
PASS  N-09 (D2-09) · tekrar yok

KAO2-FIX denetim tekrar üretimi: 5/9 PASS · 4 FAIL
```
`tekrar-uret.cjs` → çıkış 0: `KAO2 denetim tekrar üretimi: 10/10 PASS · 0 FAIL` (tarihsel kalıp; gövdesi değişmedi).

**Kapı kırmızısı — ortam kaynaklı, D2F-05 ile ilgisiz, ikisi de promptun dosya listesi dışında (§3):**
- `tests/kao/test_kao2_kabul.js`: **A-4**, yalnız `night-review` durumu (`8/9`) — `now: '2026-09-30T23:30:00.000Z'`.
  `kaoNightWindow` (`app/core/quranLearn.js:423`) **yerel saat** kullanır (`now.getHours()*60+now.getMinutes()`); bu makine
  **+03** olduğundan `23:30Z` = 02:30 yerel → gece penceresi dışı → `daily`. Kanıt: `TZ=UTC node tests/kao/test_kao2_kabul.js`
  koşusunda A-4 **geçer** (sonra A-9'da, aşağıdaki `test_settings_boundary` kırmızısı yüzünden durur). D2F-01/04 konteynerleri
  UTC olduğu için orada yeşildi. A-4 düzeltmesi prompt kapsamı dışı (kabul testi + `app/core`).
- `tests/app/test_settings_boundary.js`: `git log --all --diff-filter=A -- app/core/settings.js` ile "ayarlar registry'sini ilk
  ekleyen commit"i bulur, sonra `git show <sha>^:app.js` ister. Bu konteynerde `--all` kümesinde **ajan ana makinesinin kontrol
  noktası kök commit'i** var: `625eba07…` (`"Agent host session 1eefe730-… - baseline checkpoint"`, yalnız
  `refs/agents/1eefe730-…/checkpoints/turn/*` altında; `main`'in atası **değil**). Kök commit'in ebeveyni olmadığından
  `625eba07^` geçersiz → `Error: Command failed: git show 625eba07…^:app.js`. `main` geçmişinde böyle bir commit yok; D2F-04
  konteynerinde bu ref yoktu → o koşu yeşildi. Düzeltmesi prompt kapsamı dışı (`tests/app/test_settings_boundary.js`).

## Ölçümler
- `node tests/kao/test_kao2_denetim.js` → çıkış 0:
```
PASS  R-01 (K4-01) · doğru: masteryAt=true skor=1 adım=next-unit · yanlış: masteryAt=false adım=repair
PASS  R-02 … R-09 (değişmedi)
PASS  R-10 (M-11) · 1 kanıt yazımı (girintiden bağımsız) · KAO2_EVIDENCE_OUT koşulsuz=0
KAO2-38 denetim: PASS (10 kontrol)
```
- **Mutasyon (a)** — `masteryAt` yazımı kapatıldı (scratchpad; commit edilmedi):
```
S=$(mktemp -d "$TMPDIR/d2f05-mut.XXXXXX")
git archive HEAD | tar -x -C "$S"
cp tests/kao/test_kao2_denetim.js "$S/tests/kao/test_kao2_denetim.js"
sed -i '' 's/next\.masteryAt=stamp; next\.masteryScore=score; next\.repair=null;/next.masteryScore=score; next.repair=null;/' \
  "$S/app/core/quranLearn.js"          # app/core/quranLearn.js:1990
node "$S/tests/kao/test_kao2_denetim.js"
```
çıkış **1**, ilk anlamlı satır:
```
AssertionError [ERR_ASSERTION]: R-01 (K4-01) · doğru: masteryAt=false skor=1 adım=mastery · yanlış: masteryAt=false adım=repair
```
- **Mutasyon (b)** — girintili koşulsuz `A-KABUL.md` yazımı eklendi (scratchpad; commit edilmedi):
```
S=$(mktemp -d "$TMPDIR/d2f05-mutb.XXXXXX")
git archive HEAD | tar -x -C "$S"
cp tests/kao/test_kao2_denetim.js "$S/tests/kao/test_kao2_denetim.js"
# test_kao2_kabul.js: "  const report = md.join('\n') + '\n';" satırından SONRA girintili koşulsuz yazım eklenir:
#   fs.writeFileSync(path.join(repoRoot, 'kao2-duzeltme/evidence/K2F-36/A-KABUL.md'), report);
node "$S/tests/kao/test_kao2_denetim.js"
```
çıkış **1**, ilk anlamlı satır:
```
AssertionError [ERR_ASSERTION]: R-10 (M-11) · 2 kanıt yazımı (girintiden bağımsız) · KAO2_EVIDENCE_OUT koşulsuz=1
```
- Pinler (D2F-04'ten beri değişmedi; §6 gereği bu promptta dokunulmadı): App.kao* 45 · App yüzeyi 766 · atama 604 · onclick 393 · yayın `20261007a`.
- `git diff --stat`: `tests/kao/test_kao2_denetim.js` (+61/−19) · `tekrar-uret-2.cjs` (+16/−2) · `tekrar-uret.cjs` (+1).

## Bilerek değişen testler
- `tests/kao/test_kao2_denetim.js` **R-01**: `elle st.at/st.phase` + zayıf `recorded || …` → gerçek oynatma + `masteryAt`/`score`/sonraki-adım
  kontrolleri. Gerekçe: D2-02 — eski kontrol başarısız ustalıkta da PASS veriyordu.
- `tests/kao/test_kao2_denetim.js` **R-10**: sütun-0 + literal yol kalıbı → girintiden bağımsız, `KAO2_EVIDENCE_OUT` koşul denetimli kalıp.
  Gerekçe: D2-03 — eski kalıp gerçek (girintili, `evidenceOut` değişkenli) yazımı hiç görmüyordu.
- `tekrar-uret-2.cjs` **N-03**: aynı gerekçeyle güçlendirilmiş kalıba çevrildi (N-02 yeniden üretimi değişmedi).

## Kanıt düzeyleri
- **kaynak/test:** yukarıdaki tüm koşular bu oturumda, bu makinede (yerel saat **+03**; bu yüzden `kaoNightWindow`'a bağlı
  kabul A-4 kırmızısı ve ajan-ana-makine kontrol ref'i yüzünden `test_settings_boundary` kırmızısı — ikisi de D2F-05 ile ilgisiz).
- **yayın:** bu prompt yayın yapmadı; pin `20261007a` yalnız depodan okundu, canlı doğrulanmadı.
- **cihaz:** yok.

## Sürprizler
1. **Kabul A-4 saat dilimine bağlı.** `night-review` durumu `kaoNightWindow`'un yerel-saat hesabına dayanır; +03 makinede
   `23:30Z` gece penceresi dışında kalır. D2F-01'de kabul kırmızısı A-10 (perf) olarak görünmüştü çünkü konteyner UTC'ydi.
   Gelecekte kabul testi TZ'den bağımsız kılınmalı (ayrı iş; prompt kapsamı dışı).
2. **Ajan ana makinesi kontrol noktası ref'leri `git log --all`'ı kirletiyor.** Bu oturumda `refs/agents/1eefe730-…/checkpoints/turn/*`
   altında kök commit'ler oluştu; `test_settings_boundary.js`'in "ilk ekleyen commit" buluşu bunları seçip `^` ile çöküyor.
   `main`'de böyle bir commit yok; normal (UTC, ajan ref'siz) konteynerde yeşil.
3. **`playLesson` tek başına üniteyi bitirmez.** Özette `finish` demeden döndüğü için, ders tamamlama `kaoLesson('finish')` ile
   ayrıca yapılmalı (R-01 bunu yapar). Bu ilk sondayı yanıltmıştı; doğru akış sonda betiğiyle netleşti.
4. **N-08 kaydı seq 7'de geride kalmış.** Erken yayın (seq 7) panel-v2.html pinini `20261007a` yapınca N-08 (D2-08) gerçekten kapandı,
   ama seq 7 bir GATE kaydı olduğu için D2F-STATE'in N durumu güncellenmedi; `d2f-sync-check --repro` bunu yakaladı ve D2F-05'te düzeltildi.
   N-08 ↔ D2F-15 eşlemesi artık geçersiz; D2F-15 yeni pin yazarsa N-08 yeniden değerlendirilir.
