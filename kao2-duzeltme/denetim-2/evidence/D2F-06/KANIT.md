# D2F-06 · Ses görevinin ekranı teste bağlansın · KANIT

Oturum: https://claude.ai/code/session_d0d6d6d9-c277-497f-98ea-e3c237d4db72
Tarih: 2026-10-07 · baseCommit `cbe0d604` · bu oturumun HEAD'i `80ed4450` (D2F-05 NOT — VS Code devir notu; D2F-05 PROMPT commit'i `467ab6fa`).

## İlerleme günlüğü
1. ORTAK-KURALLAR okundu; `D2F-STATE.json.nextPrompt` = `D2F-06` (uyuşuyor). `d2f-sync-check` başlangıçta **PASS** (D2F-05 kapanışı, seq 8).
2. Denetim raporu §8 / §E-1 okundu: K2F-40 şık ekranını `Views.choice` düğme kipine taşıdı; 6.905 ekran bayt-eşit doğrulandı, **ama "ses" (audioOnly) türü sentetik ortamda üretilemediği için doğrulanamamıştı** (rapor "doğrulanamayanlar").
3. `app/core/quranLearn.js` içinde ses görevinin kuruluşu ve şık render'ı okundu: `kaoTaskHTML` şıkları `kaoViewsApi().choice({button:true,…})` ile kurar (satır 1746); ses görevi `audioAvailable` üzerinden gelir, şıklar Türkçe anlam, ekranda `class="kao-audio"` düğmesi ve "Dinlediğin kelimenin anlamını seç" yönergesi var. `tests/kao/helpers/kao-harness.js` API'si okundu.
4. **Ses görevinin sentetik ortamda üretilebildiği kanıtlandı:** `bootKao({seeded:true})` + `walkLesson('u01.01', …)` gerçek kurucuyu çalıştırınca `task.audioOnly===true` görev gerçekten gelir (ör. görev id `practice:u01.01:l_som_585f33:audio`). Raporun sınırı, görevin üretilemezliğinden değil, tekrar üretimin dersi nasıl sürdüğünden kaynaklanıyordu.
5. `tests/kao/test_kao2_components.js` genişletildi. Görev nesnesi **elle kurulmaz**; gerçek oynatımla üretilir (§4).
6. Tek seferlik bayt-eşitlik kanıtı (`f4c256c7^` vs `HEAD`) ve iki mutasyon (scratchpad) koşuldu.
7. Kapılar koşuldu (kırmızı — iki beklenen ortam kırmızısı; aşağıda "Kapılar").

## Yapılan
- `tests/kao/test_kao2_components.js` — **tek üretim-dışı dosya değişikliği** (genişletme):
  - `./helpers/kao-harness` ile ses görevi `bootKao` + `walkLesson('u01.01', …)` **gerçek oynatımla** üretilir; `visit` geri çağrısı ilk `task.audioOnly` görevini yakalar. Görev nesnesi elle yazılmaz (§4).
  - `kaoChoicesBlock(html)`: görev şık bloğunu (Views.choice düğme kipinin çıktısı) render edilen HTML'den çeker.
  - `kaoExpectedChoices(task, panel, choiceId)`: düğme kipi **sözleşmesinin bağımsız literal orakulu**. Motor çıktısını yalnız `api.choice` çıktısıyla karşılaştırmak yetmez (ikisi birlikte değişir); sözleşme ayrıca yazılıp motordan bağımsız denetlenir. `api.choice` delegasyonu ayrı bir `assert` ile teyit edilir.
  - Doğru ve yanlış cevap için **cevapsız** ve **yanıt sonrası** iki durum sınanır. Doğrulananlar:
    - Şıklar gerçekten `Views.choice` düğme kipinden gelir (literal orakul + `api.choice` delegasyonu bayt-eşit).
    - **Cevapsız:** durum sınıfı, `disabled` ya da `aria-pressed` **yok**.
    - **Yanıt sonrası:** tüm şıklar `disabled`; tam bir `kao-choice-correct`; yanlışta tam bir `kao-choice-wrong`; `aria-pressed` yok (ses görevi sıra görevi değil).
    - Şıklar Türkçe anlam (Arapça aralık `U+0600–U+06FF` içermez; dinlenen kelime açığa çıkmaz).
    - Yönerge "Dinlediğin kelimenin anlamını seç".
    - Ses düğmesinin erişilebilir adı üç durumda da aynı: `Yavaş dinlemek için dokun; doğal hız için 350 milisaniye basılı tut`.
    - Geri bildirim: doğru → `kao-feedback-success`, yanlış → `kao-feedback-warning`.

Dokunulmadı: `app.js`, `app/core/*`, `sync.js`, pinler/`sw.js`, `migrate()`, FSRS, `test_kao2_kabul.js`. Yeni `App.kao*` handler eklenmedi.

## TDD
Bu prompt bir **denetim testini** bağlar; üretim davranışı değişmez (ekran K2F-40'ta taşındı). "Önce kırmızı" karşılığı: iki mutasyon (aşağıda) yeni bölümü düşürür. Durum elle kurulmaz: ses görevi `kao-harness` ile gerçek handler'larla üretilir.

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
KAO2 perf: PASS (content 183.544 KiB · runtime 117.350 KiB · css 13.035 KiB · p95 4.570 ms · steady 3.179 ms · GÖRELİ BANT ATLANDI (yavaş makine): steady 3.179 ms ≤ bant 6.360 ms)
SONUÇ: KIRMIZI KAPI VAR
KAPILAR_EXIT=1
```
Ayrı koşular (bu oturumda):
- `node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs` → **5/9 PASS** (N-01, N-02, N-03, N-08, N-09; D2F-05'te de 5/9 idi — **azalmadı**).
- `node kao2-duzeltme/denetim/tekrar-uret.cjs` → çıkış 0: `KAO2 denetim tekrar üretimi: 10/10 PASS · 0 FAIL`.
- `node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs` → **PASS** (`nextPrompt D2F-06 · ledger seq 8 · N 5/9 pass · App.kao* 45 · yüzey 766 · atama 604 · onclick 393 · pin 20261007a`).

**Kapı kırmızısı — ortam kaynaklı, D2F-06 ile ilgisiz, ikisi de prompt dosya listesi dışı (§3):**
- `tests/kao/test_kao2_kabul.js`: **A-4**, yalnız `night-review` durumu (`8/9`) — `now: '2026-09-30T23:30:00.000Z'`. `kaoNightWindow` (`app/core/quranLearn.js:423`) **yerel saat** kullanır; bu makine **+03** olduğundan `23:30Z` = 02:30 yerel → gece penceresi dışı → `daily`. `TZ=UTC` ile A-4 geçer. D2F-01/04 konteynerleri UTC'ydi.
- `tests/app/test_settings_boundary.js`: `git log --all --diff-filter=A -- app/core/settings.js` ile "ayarlar registry'sini ilk ekleyen commit" aranır, sonra `git show <sha>^:app.js` istenir. Bu konteynerde `--all` kümesinde **ajan ana makinesinin kontrol noktası kök commit'i** var (`625eba07…`, yalnız `refs/agents/1eefe730-…/checkpoints/turn/*` altında; `main`'in atası **değil**). Kök commit'in ebeveyni olmadığından `625eba07^` geçersiz → `git show` çöker. `main` geçmişinde böyle bir commit yok; düzeltmesi prompt kapsamı dışı.

## Ölçümler
- `node tests/kao/test_kao2_components.js` → çıkış 0:
```
KAO2 components: PASS (escape, erişilebilirlik, güvenli eylem, ölçü, durum ve ses görevi şıkları)
```
- **Ses görevi üretilebilirliği:** `bootKao` + `walkLesson('u01.01', …)` ile `task.audioOnly===true` görev gerçekten gelir; örnek görev id `practice:u01.01:l_som_585f33:audio`; şıklar Türkçe anlam ("yer, yeryüzü" · "ad, isim" · "terbiye edip yöneten Rab").
- **Bayt-eşitlik (tek seferlik; commit edilmez):** `f4c256c7^` (K2F-40 öncesi) ve `HEAD` ağaçları ayrı ayrı `git archive … | tar -x` ile unpack edildi; aynı sonda betiği (`$TMPDIR/d2f06-eq.cjs`, commit edilmedi) her ağaçta ses görevinin şık bloğunu üç durum için çıkardı:
```
durum sayısı: 3
idle.idle        pre   617 9c4d0f01c2d04c74 | post   617 9c4d0f01c2d04c74 | EŞİT
correct.after    pre   853 d322cf52bb685daf | post   853 d322cf52bb685daf | EŞİT
wrong.after      pre   973 deb9ee493ffdb32d | post   973 deb9ee493ffdb32d | EŞİT
toplam bayt: pre 2443 post 2443
```
`diff -q pre.json post.json` → **EQUAL**. Yani K2F-40 ses görevinin şık ekranını **bayt-eşit** korudu (üç durumda da), aynen denetimin diğer türler için ölçtüğü gibi.
- **Mutasyon A** — `Views` düğme kipi geri alındı (`app/core/quranLearnViews.js` = `f4c256c7^`; scratchpad, commit edilmedi):
```
S=$(mktemp -d "$TMPDIR/d2f06-mutA2.XXXXXX"); git archive HEAD | tar -x -C "$S"
cp tests/kao/test_kao2_components.js "$S/tests/kao/test_kao2_components.js"
git show 'f4c256c7^:app/core/quranLearnViews.js' > "$S/app/core/quranLearnViews.js"
node "$S/tests/kao/test_kao2_components.js"
```
çıkış **1**, ilk anlamlı satır:
```
AssertionError [ERR_ASSERTION]: düğme kipi: idle şıkkta sınıf yok        (satır 86)
```
- **Mutasyon B** — motorda yanıt sonrası şıklar kapatılmıyor (`disabled:disabled` → `disabled:false`, `app/core/quranLearn.js:1746`; scratchpad, commit edilmedi):
```
S=$(mktemp -d "$TMPDIR/d2f06-mutB.XXXXXX"); git archive HEAD | tar -x -C "$S"
cp tests/kao/test_kao2_components.js "$S/tests/kao/test_kao2_components.js"
perl -pi -e 's/disabled:disabled,onclick/disabled:false,onclick/' "$S/app/core/quranLearn.js"
node "$S/tests/kao/test_kao2_components.js"
```
çıkış **1**, ilk anlamlı satır:
```
AssertionError [ERR_ASSERTION]: doğru: yanıt sonrası şıklar Views.choice düğme kipi çıktısı   (satır 185 — yeni ses bölümü)
```
Yani bu mutasyon **doğrudan yeni ses bölümünü** düşürür (bölümü izole eder); Mutasyon A ise Views sözleşmesini düşürür.
- Pinler (değişmedi; §6 gereği bu promptta dokunulmadı): App.kao* 45 · App yüzeyi 766 · atama 604 · onclick 393 · yayın `20261007a`.
- `git diff --stat`: `tests/kao/test_kao2_components.js` (+68/−1).

## Bilerek değişen testler
- Yok. `tests/kao/test_kao2_components.js` yalnız **genişletildi** (yeni bölüm eklendi); var olan hiçbir kontrol gevşetilmedi. Değişen tek mevcut satır: sondaki PASS mesajı "… durum ve ses görevi şıkları" ile uzatıldı.

## Kanıt düzeyleri
- **kaynak/test:** yukarıdaki tüm koşular bu oturumda, bu makinede (yerel saat **+03**; iki ortam kırmızısı bu makineye özgü — ayrıntı "Kapılar").
- **yayın:** bu prompt yayın yapmadı; pin `20261007a` yalnız depodan okundu, canlı doğrulanmadı.
- **cihaz:** yok.

## Sürprizler
1. **Raporun "doğrulanamayanlar" sınırı görevin üretilemezliğinden değil, tekrar üretimin yolundan kaynaklanmış.** `kao-harness` + `walkLesson('u01.01', …)` ses görevini (audioOnly) **gerçek kurucuyla** üretir; görev id örneği `practice:u01.01:l_som_585f33:audio`. Yani ses ekranı sentetik ortamda pekâlâ doğrulanabiliyordu — bu prompt onu kalıcı teste bağladı.
2. **Ses görevinde aynı etiketli iki çeldirici olabiliyor** (ör. iki "yer, yeryüzü"; doğru şık tekil). Doğru şık benzersiz olduğundan belirsizlik doğmaz; D2F-03'ün dizme-çipi sorunundan farklı tür. **Bu promptun kapsamı dışı**; gözlem olarak kullanıcıya not edildi.
