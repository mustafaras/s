# KAO2-FIX — Uygulama promptları (tek dosya, sıralı)

**44 prompt · 6 dalga · uygulayıcı: Claude Sonnet 5.5 (`claude-sonnet-5-5`).** Her prompt **tek oturum,
tek commit**. Promptlar yalnız sırayla yürür; hangi promptun çalışacağını yalnız
`FIX-STATE.json.nextPrompt` söyler. Bu dosya **ne** yapılacağını anlatır; **neden** için
[`denetim/KUSUR-RAPORU.md`](denetim/KUSUR-RAPORU.md) bulgu kimlikleri, bağlam kuralları için
[`BAGLAM-YONETIMI.md`](BAGLAM-YONETIMI.md). Her prompt §1 ortak protokolü **aynen** uygular.

---

## §0 · Oturum başlatıcı (her yeni oturumda bunu yapıştır)

```text
Şeyma deposunda KAO2-FIX programına devam et. Program klasörü: kao2-duzeltme/.

Kod yazmadan önce sırayla yap:
1) CLAUDE.md "DATA SAFETY" bölümünü oku: tarayıcı açma, sunucu başlatma, mustafaras/seyma-data'ya
   yazma YOK. Doğrulama yalnız headless Node (node:vm) fixture'larıyla.
2) kao2-duzeltme/BAGLAM-YONETIMI.md'yi oku ve §3 okuma bütçesine uy.
3) kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md'yi ve LEDGER.md'nin yalnız son 3 kaydını oku.
4) node kao2-duzeltme/tools/fix-sync-check.mjs --clean --repro → PASS olmalı.
   (Yarım kalmış prompt varsa BAGLAM-YONETIMI §6'yı uygula. K2F-00'da --clean beklenen şekilde FAIL verir;
   K2F-00 bölümündeki özel başlangıcı uygula.)
5) FIX-STATE.json → nextPrompt. PROMPTLAR.md §1'in tamamını ve YALNIZ nextPrompt bölümünü oku.
6) Promptun "Oku" satırındaki kaynakları yalnız verilen aralıklarda oku.

Yalnız nextPrompt'u yürüt; tamamlanmış promptu yeniden açma, sonrakine geçme. P1–P14'ü uygula.
Kapsam dışı gereksinimi yapma: LEDGER NOTE + CURRENT-STATE "Açık riskler". Durma koşulunda P6.
Kullanıcı kapısında P7. Her promptta LEDGER + CURRENT-STATE + FIX-STATE aynı committe;
fix-sync-check PASS; tek commit. Push/merge/deploy yalnız YAYIN promptlarında ve açık kullanıcı onayıyla.
```

---

## §1 · Ortak protokol (her promptta aynen)

### P1 · Başlangıç (kod yazmadan önce)
1. `node kao2-duzeltme/tools/fix-sync-check.mjs --clean --repro` → PASS. Değilse **dur**; uyumsuzluğu
   yalnız kayıt dosyalarında `FIX` kaydıyla çöz (kodla ilgiliyse P6). (K2F-00 bu adımı kendi özel
   biçimiyle yapar.)
2. Dal `kao2-duzeltme` olmalı (`git branch --show-current`). K2F-00 dalı açar.
3. `FIX-STATE.json.nextPrompt` bu prompt olmalı. Promptu `status:"in_progress"` yap (commit kapanışta).
4. `kao2-duzeltme/evidence/K2F-NN/KANIT.md`'yi P11 şablonuyla **hemen** oluştur; "İlerleme günlüğü"nü
   her adımdan sonra güncelle (BAGLAM-YONETIMI §5).
5. Önceki commit: `git log -1 --format=%h` → KANIT ve LEDGER `prev-commit`.
6. Yalnız promptun **Dokun** listesindeki dosyaları değiştir. Listede olmayan bir dosya gerekiyorsa P6.

### P2 · TDD sırası
1. Promptun **Test önce** maddesindeki testi yaz ya da genişlet; çalıştır; **kırmızı** gör; ilk anlamlı
   hata satırını KANIT'a kopyala. (Yalnız belge/araç promptlarında "kırmızı" yerine ölçüm yazılır.)
2. En küçük üretim değişikliğiyle yeşile çek.
3. Davranış aynı kalacak şekilde toparla; testler yeşil kalır.
4. Mevcut bir testi **zayıflatma**. Davranışı bilerek değişen bir test güncellenirse KANIT'a
   `eski beklenti → yeni beklenti · gerekçe · bulgu kimliği` yaz.
5. Testlerde durumu elle kurarak davranışı atlama: `masteryAt`, `ui.kaoPanel`, yığınsız `kaoView`
   gibi atamalar yasak; akışı gerçek handler'larla sür (`tests/kao/helpers/kao-harness.js`, K2F-02'den sonra).
   Saf Flow birim testlerinde girdi durumu kurmak serbesttir.

### P3 · Kapılar (prompt sonunda hepsi yeşil)
```bash
bash kao2-duzeltme/tools/kapilar.sh          # çıkış 0 olmalı; "SONUÇ: TÜM KAPILAR YEŞİL"
node kao2-duzeltme/denetim/tekrar-uret.cjs   # yalnız rapor; PASS sayısı hiçbir promptta AZALMAZ
```
`kapilar.sh` şunları ayrı ayrı koşar: `node --check` (Flow/Views/motor/müfredat/gramer modülleri) ·
tests/kao · tests/app · tests/panel · tests/panel-v2 · tests/quran · reminders · run-seyma driver + zikr ·
kontrast · `kao-plan-check` (K2F-01'den sonra) · `fix-sync-check --repro`. Bir kapı kırmızıysa ve
düzeltmesi bu promptun kapsamındaysa düzelt; değilse P6. Çıkış kodunu boru sonrasında okuma.
Not: `fix-sync-check --repro` prompt `in_progress` iken R değişimini STATE'e yazmadan önce FAIL verebilir
(`STATE güncellenmemiş`); bu yalnız P4.2'den önce beklenen tek farktır — P4 sonunda PASS olmalıdır.

### P4 · Kapanış (tek commit, bu sırayla)
1. `KANIT.md`'yi tamamla (P11).
2. `FIX-STATE.json`: prompt `status:"done"`, `evidence:"kao2-duzeltme/evidence/K2F-NN/KANIT.md"`;
   `nextPrompt` = sonraki prompt (son promptta `null` + `status:"completed"`); ilk promptta program
   `status:"active"`; `ledgerLastSeq` = LEDGER son seq; bu promptta PASS'e dönen R'ler `repro`'da `"pass"`;
   değişen pinler `pins`'e **ölçülerek** yazılır.
3. `.anti-amnesia/LEDGER.md` sonuna `PROMPT` kaydı (P12). Ek `GATE`/`NOTE`/`FIX`/`DECISION` varsa her biri ayrı seq.
4. `.anti-amnesia/CURRENT-STATE.md`'yi **baştan yaz**: `k2f-sync` bloğu (nextPrompt, lastSeq, status) +
   "Şu an neredeyiz" + "Sıradaki promptun tek cümlesi" + "Canlı gerçekler" (araçla ölçülmüş) +
   "Açık riskler" + "Bekleyen kullanıcı işleri".
5. `bash kao2-duzeltme/tools/kapilar.sh` → YEŞİL (sync dahil).
6. `git add` yalnız bu promptun dosyaları + `kao2-duzeltme/`; `git commit` (P13). **Push yok.**
7. Commit sonrası `node kao2-duzeltme/tools/fix-sync-check.mjs --clean --repro` → PASS (ağaç temiz).

### P5 · Yasaklar
- Tarayıcı açma, sunucu başlatma (CLAUDE.md DATA SAFETY). `mustafaras/seyma-data`'ya yazma.
- Push, merge, tag, deploy — yalnız YAYIN promptlarında (K2F-18, K2F-43) ve açık kullanıcı onayıyla.
- Elle Arapça metin, hareke ya da okunuş yazma (P9).
- `app.js`'te yalnız izinli dokunuş: KAO shim satırı (≈3905) — yalnız promptun Dokun listesi yeni
  handler istiyorsa. `var ui=` literali, `migrate()` gövdesi ve başka alanlar yasak.
- **Yorumlarda** `App.<ad>=` biçimi ya da tıklama niteliği adı (`onclick`) yazma: fx2/v3 düz metin
  tarayıcıları yorumları da sayar.
- FSRS portu (`kaoSchedule`, ağırlıklar), `kaoBuildQueue` kuralları (R-A1…R-A8, KF-9) ve gizlilik
  (ses kaydı yalnız bellekte) değişmez.
- `?v=` yayın pini yalnız YAYIN promptlarında değişir.
- Kullanıcı verisini silen, sıfırlayan ya da anlamını değiştiren kod yok; yalnız ekleme ve normalizasyon.
  Yeni alanlar `ensureQuranLearn` normalizasyonuna eklenir; eski `data.quranLearn` geçerli kalır.
- Arşiv (`archive/kuran-ogreniyorum-v2/`) donmuştur: yalnız K2F-41'de tek bir düzeltme notu eklenir.
- `.claude/skills/*` yalnız Edit aracıyla ve yalnız Dokun listesinde varsa; izin verilmezse P6.
- `git push --force`, `git reset --hard`, geçmiş yeniden yazma yok.

### P6 · Durma koşulları (BLOCKED)
Aşağıdakilerden biri olursa işi bırak; LEDGER'a `BLOCKED` kaydı (neden · denenen · önerilen çözüm ·
`- next:` aynı prompt), promptu `status:"blocked"` yap, CURRENT-STATE'i güncelle, sync PASS, commit
(`K2F-NN: BLOCKED — <neden>`), kullanıcıya bildir:
- Dokun listesi dışında dosya değiştirmek gerekiyor.
- Bir kapı kırmızı ve düzeltmesi başka alanın davranışını değiştiriyor.
- Kullanıcı kararı gerekiyor ama promptta tanımlı değil.
- Eski veri için geri uyum sağlanamıyor.
- İçerik bütçesi (K-1: içerik gzip ≤256 KiB, mevcut 4 modül ≤164, müfredat ≤48; runtime ≤128; css ≤14) aşılıyor.
`blocked` prompt çözülünce aynı prompt yeniden `in_progress` olur; çözüm `FIX` kaydıyla belgelenir.
(`blocked` durumunda sync aracı nextPrompt'u yine bu prompt olarak bekler.)

### P7 · Kullanıcı kapısı (`waiting_user`)
Promptun **Kullanıcı kapısı** maddesine gelince: o ana kadarki işi commit et (`K2F-NN: kullanıcı kapısı —
<ne bekleniyor>`), promptu `status:"waiting_user"` yap, LEDGER `GATE` kaydı (`status: waiting` + tam
olarak ne beklendiği + kullanıcının yazması gereken cümle), CURRENT-STATE "Bekleyen kullanıcı işleri"ne
ekle, sync PASS, **dur** ve kullanıcıya tek paragrafla ne yapması gerektiğini söyle. Kullanıcı yanıtı
gelince (yeni oturum) aynı prompt `in_progress` olur, LEDGER `GATE` (`status: closed` + yanıtın özeti)
eklenir ve prompt kalan adımlarla tamamlanır. Yanıtı tahmin etme; açık yanıt yoksa kapı kapanmaz.

### P8 · Handler ve pin kuralları
- **Yeni `App.kao*` handler** yalnız üç promptta: K2F-12 (`kaoS0`), K2F-16 (`kaoSetIntent`),
  K2F-30 (`kaoToggleAutoAdvance`). Başka promptta yeni handler gerekiyorsa mevcut dağıtıcıları kullan
  (`kaoLesson(action,…)`, `kaoOnboard(action,…)`, `kaoS0(action,…)`); olmuyorsa P6.
- Handler eklenince **aynı committe**:
  1. `app.js` KAO shim satırı (≈3905), mevcut biçimle birebir:
     `App.kaoAd=function(){ return window.SeymaQuranLearn.kaoAd.apply(null,arguments); };`
  2. Motor dış yüzeyi `window.SeymaQuranLearn` nesnesinde `kaoAd:kaoAd` (≈3211+).
  3. Pin dosyaları (sayıları **ölç**, tahmin etme):
     `tests/app/test_fx2_tab_transition.js` (App yüzeyi) · `tests/app/test_fx2_touch_coverage.js` (App yüzeyi) ·
     `tests/app/test_fx2_overlay_motion.js` (App yüzeyi) · `tests/app/test_v3_welcome.js` (App yüzeyi) ·
     `tests/app/test_app_surface_daily_boundary.js` (atama + yüzey) · `tests/kao/test_kao2_onboarding.js`
     (`names.size` App.kao*) · `tests/kao/test_kao2_handler_surface.js` (K2F-03'ten sonra).
     Bul: `grep -nE '\b(763|764|765|766|601|602|603|604)\b' tests/app/*.js tests/kao/*.js`.
  4. `FIX-STATE.json.pins` (`kaoHandlers`, `appSurface`, `appAssignments`) ölçülmüş değerle.
  5. Pin yorumlarında handler adını `App.ad=` biçiminde yazma (P5).
- `onclick` sayacı (393) KAO dosyalarını saymaz; değişirse P6.
- **Yayın pini** (`20260930l`) yalnız K2F-18/K2F-43'te; dosya listesi o promptlarda.

### P9 · Arapça içerik kuralı
Arapça metin, hareke ve okunuş **yalnız** içerik modüllerinden (`QuranLexiconV1`, `QuranGrammarV1`,
`QuranShortSurahsV1`, `QuranPhonicsV1`, `QuranCurriculumV2`) ya da araçların (`tools/kao-*.mjs`,
`tools/kao2-*.mjs`) doğrulanmış kaynaklardan ürettiği çıktıdan gelir. Kodda ve JSON'da Arapça
yalnız kimlikle (`lemmaId`, `exampleId`, harf `id`, işaret adı) anılır. Spec/metin dosyalarına Arapça
harf yazılmaz. Türkçe metin elle yazılabilir ama `review.level:"draft"` ile başlar (K-4).

### P10 · Bağlam
[`BAGLAM-YONETIMI.md`](BAGLAM-YONETIMI.md) §3–§6 bağlayıcıdır: büyük dosyaları asla tamamen okuma,
satır numaralarını fonksiyon adıyla doğrula, KANIT İlerleme günlüğünü tut, sayıları araçla ölç.

### P11 · KANIT şablonu (`kao2-duzeltme/evidence/K2F-NN/KANIT.md`)
```markdown
# K2F-NN — <başlık>
Tarih: YYYY-MM-DD · Dal: kao2-duzeltme · Önceki commit: <hash> · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: <kimlikler> · R değişimi: <R-xx fail→pass | yok>

## İlerleme günlüğü
- [ ] …

## Yapılan
- …

## TDD
- Kırmızı: <komut> → <ilk anlamlı hata satırı>
- Yeşil: <komut> → PASS

## Kapılar (P3)
<kapilar.sh çıktısının özet satırları, olduğu gibi>
tekrar-uret: <N>/10 PASS (önceki <M>/10)

## Ölçümler
- <kabul ölçütleri: sayı + hedef>

## Bilerek değişen testler
- <dosya>: eski → yeni · gerekçe · bulgu

## Kanıt düzeyleri
- Kaynak/test: … · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- …
```

### P12 · LEDGER `PROMPT` kaydı şablonu
```markdown
## seq N · YYYY-MM-DD · PROMPT · K2F-NN
- status: done
- title: <başlık>
- prev-commit: <hash>
- evidence: kao2-duzeltme/evidence/K2F-NN/KANIT.md
- closes: <bulgu kimlikleri>
- repro: <R-xx fail→pass | değişmedi> · toplam <N>/10
- gates: kapilar.sh YEŞİL (kao <n> · app <n> · panel <n> · panel-v2 <n> · quran <n> · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* <n> · yüzey <n> · atama <n> · yayın <pin>
- changed-tests: <yok | liste>
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: <yok | kısa>
- next: K2F-(NN+1)
```

### P13 · Commit mesajı şablonu
```text
K2F-NN: <Türkçe kısa özet>

<2–5 satır: ne değişti, hangi bulgular kapandı, hangi R PASS'e döndü, hangi testler>

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

### P14 · Test düzeni sözleşmesi
- Yeni KAO testleri `tests/kao/test_kao2_*.js` adını alır, `'use strict'`, `node:assert/strict`,
  `node:vm`; ağ/zamanlayıcı/depo yok; sabit saat (`2026-09-30T12:00:00.000Z` ya da testin kendi sabiti).
- K2F-02'den sonra her yeni test `tests/kao/helpers/kao-harness.js`'i kullanır.
- Her yeni test dosyası aynı committe `tests/kao/README.md` envanterine tek satırla eklenir.
- Test başlıkları gerçek sayıyı söyler; sayı değişince başlık da değişir (K3-09 tekrarlanmasın).

---

## §2 · Promptlar

### W0 — Hazırlık

---

#### K2F-00 · Başlangıç: dal, taşıma commit'i, taban ölçüm

- **Amaç:** Denetim oturumunda çalışma ağacında bırakılan taşıma ve program dosyalarını doğrulayıp yeni
  dalda tek commit'le kaydetmek; taban ölçümü almak.
- **Kapatır:** — (altyapı) · **R:** değişmez (0/10).
- **Önkoşul:** `git branch --show-current` = `main`, `git rev-parse --short HEAD` = `07802fa6`. Değilse P6.
- **Oku:** `kao2-duzeltme/.anti-amnesia/LEDGER.md` seq 3 (MOVE) · `.github/workflows/pages.yml` ≈70–120.
- **Dokun:** yalnız taşıma kapsamındaki dosyalar (içerik değişikliği yok, yalnız commit) + `kao2-duzeltme/`.
- **Adımlar (P1 yerine):**
  1. `node kao2-duzeltme/tools/fix-sync-check.mjs --repro` → PASS (`--clean` bu promptta beklenen şekilde FAIL verir).
  2. `git status --porcelain` çıktısını al. Beklenen küme (başka hiçbir şey olmamalı):
     `kuran-ogreniyorum-v2/**` → `archive/kuran-ogreniyorum-v2/**` yeniden adlandırması ·
     `…/content/*` → `docs/kuran-ogreniyorum/kao2/content/*` · `…/inceleme/*` → `docs/kuran-ogreniyorum/kao2/inceleme/*` ·
     `M .github/workflows/pages.yml` · `M AGENTS.md` · `M CLAUDE.md` · `M docs/kuran-ogreniyorum/content/audio-manifest.json` ·
     `M tools/kao2-curriculum-build.mjs` · `M tests/kao/test_kao2_{curriculum,explain,kabul,perf_budget,review_apply,syllable_audio,text_review}.js` ·
     `?? kao2-duzeltme/` · ve (varsa) `archive/kuran-ogreniyorum-v2/evidence/KAO2-27/A-KABUL.md`'de yalnız
     "Ölçüm:" zaman damgası ve A-10 p95 satırı farkı. Git yeniden adlandırmaları `D` + `??` gösterebilir;
     `git add -A` sonrası `git status` ile `R` olarak doğrula. Beklenmeyen dosya → P6.
  3. `A-KABUL.md` farkı yalnız o 2 satırsa içeriği HEAD'deki haline döndür:
     `git show HEAD:kuran-ogreniyorum-v2/evidence/KAO2-27/A-KABUL.md > archive/kuran-ogreniyorum-v2/evidence/KAO2-27/A-KABUL.md`.
  4. `git switch -c kao2-duzeltme`; K2F-00'ı `in_progress` yap; `evidence/K2F-00/KANIT.md` oluştur.
  5. `bash kao2-duzeltme/tools/kapilar.sh` → YEŞİL (plan-check "ATLANDI" beklenir). `tekrar-uret` 0/10.
     `node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs`'i ayrıca koş; FAIL sayısını (22 beklenir) KANIT'a yaz.
  6. `pages.yml` rsync hariç tutma listesinde ve "`_site` içinde kaldı mı" döngüsünde `kao2-duzeltme` olduğunu doğrula.
  7. Taşımanın bayt-eşitliği: `O=$(mktemp -d); node tools/kao2-curriculum-build.mjs --out-dir "$O"` →
     üretilen 5 dosya repodakilerle `cmp` ile eşit (KANIT'a yaz).
  8. P4: STATE `status:"active"`, K2F-00 done, nextPrompt K2F-01, repro hepsi `fail` (değişmedi).
- **Kabul:** kapilar YEŞİL · tekrar-uret 0/10 (beklenen) · plan-check 22 FAIL kayıtlı · 5/5 bayt-eşit ·
  sync PASS · commit sonrası ağaç temiz.
- **Commit:** `K2F-00: KAO2 arşive taşındı, KAO2-FIX programı başladı`

---

#### K2F-01 · kao-plan-check: K2F öneki ve taban commit

- **Amaç:** 08 §7 kapısı `kao-plan-check`'i yeşile çekmek (KR-6): K2F önekini tanıt, tarihsel commitleri
  `planCheckBase` ile dışarıda bırak; bilinmeyen önek reddi korunur.
- **Kapatır:** M-10 · **R:** değişmez.
- **Oku:** `docs/kuran-ogreniyorum/tools/kao-plan-check.mjs` ≈25–50 (`KAO_SUBJECT_RE`, `CARD_OF_SUBJECT_RE`),
  ≈130–180 (commit taraması) · `docs/kuran-ogreniyorum/tools/kao-plan-check.test.mjs`.
- **Dokun:** `docs/kuran-ogreniyorum/tools/kao-plan-check.mjs`, `docs/kuran-ogreniyorum/tools/kao-plan-check.test.mjs`,
  `kao2-duzeltme/FIX-STATE.json` (`planCheckBase`).
- **Adımlar:**
  1. **Kırmızı:** self-test'e ekle: (a) `K2F-07: …` konulu commit KAO dosyasına dokunursa kabul edilir;
     (b) `K2F-7:` ve `K2FX-07:` reddedilir; (c) taban commit'ten önceki commit taranmaz. Koş → kırmızı.
  2. Regex'lere `K2F-\d{2}` ekle (KAO2 kartlarıyla aynı muamele; dosya kapsamı kısıtı KAO2'de nasılsa öyle).
  3. `--since <hash>` seçeneği ekle; verilmezse `kao2-duzeltme/FIX-STATE.json.planCheckBase` okunur
     (dosya ya da alan yoksa eski davranış). Taban öncesi commit sayısı `INFO` satırıyla raporlanır.
  4. `planCheckBase` = K2F-00 commit'inin tam hash'i (`git log --format=%H -1 --grep '^K2F-00:'`).
  5. `node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs` → exit 0; self-test PASS.
- **Kabul:** plan-check exit 0 · self-test PASS (yeni 3 durum dahil) · bu commit'ten sonra `kapilar.sh`
  plan-check'i gerçekten koşar ve PASS verir.
- **Commit:** `K2F-01: kao-plan-check K2F önekini tanır, taban commit'ten sonrasını denetler`

---

#### K2F-02 · Test düzeneği ve yığınsız görünüm çözümü

- **Amaç:** Testlerin durumu elle kurup davranışı atlamasını önleyen ortak düzenek; yığın boşken
  `ui.kaoView`'un sessizce ana ekrana düşmesini düzeltmek.
- **Kapatır:** K6-02 (altyapı) · **R:** R-09 fail→pass.
- **Oku:** `app/core/quranLearn.js` `kaoOverlayHTML` (≈2998) ve yığın türetme (`kaoStack`, `kaoApplyView`,
  `kaoNav`, `kaoSetView` — grep ile) · `app/core/quranLearnFlow.js` `createStack/openStack/current` (≈1–60) ·
  `tests/kao/test_kao2_a11y.js` ≈1–75 (mevcut boot) · `kao2-duzeltme/denetim/tekrar-uret.cjs` (boot, walkLesson).
- **Dokun:** `tests/kao/helpers/kao-harness.js` (yeni), `tests/kao/test_kao2_view_resolution.js` (yeni),
  `app/core/quranLearn.js` (yalnız yığın türetme ve `KAO_VIEW_TITLES`), `tests/kao/README.md`.
- **Adımlar:**
  1. `kao-harness.js` (CommonJS): `bootKao({now, seeded})` (tekrar-uret.cjs boot'unun genel hali; içerik
     listesi + Flow/Views/motor; `registerQuranLearn` + `registerQuranLearnSurface` sahteleri; `setTimer`
     kaydedici) · `freshUser(t, onboardingPatch)` · `openView(t, view, param)` (**gerçek** `kaoNav`/`kaoSetView`
     ile; yığın elle kurulmaz) · `walkLesson(t, lessonId, {answer:'correct'|'wrong'|fn, visit})` · `text(html)`.
  2. **Kırmızı:** `test_kao2_view_resolution.js`: Flow `VIEWS` listesindeki her görünüm için yalnız
     `ui.kaoView=v` (yığın boş) → NavBar başlığı `KAO_VIEW_TITLES[v]`'dir, ana ekran değildir. Bugün
     `roots`, `s0`, `sources` kırmızı.
  3. Üretim: yığın boş ya da geçersizken ve `ui.kaoView` bilinen bir görünümse (≠home) yığını
     `[home, view]` olarak türet (tek noktada; mevcut `kaoSetView` geri uyumuyla aynı mantık). `s0` için
     başlık yoksa `KAO_VIEW_TITLES.s0 = 'Harfler'` ekle.
  4. `kao-harness.js` için öz-test (aynı test dosyasında): `openView` ile açılan her görünüm doğru başlığı verir.
- **Kabul:** view_resolution PASS · R-09 PASS · diğer testler yeşil.
- **Commit:** `K2F-02: ortak KAO test düzeneği ve yığınsız görünümün doğru çözümü`

---

#### K2F-03 · Handler yüzeyi fixture'ı

- **Amaç:** İşaretlemede çağrılan her `App.kao*`'nun `app.js`'te tanımlı olmasını kalıcı olarak sınamak.
- **Kapatır:** (K5-02 tespitinin kalıcı testi) · **R:** değişmez (R-05 K2F-12'de).
- **Oku:** `kao2-duzeltme/denetim/tekrar-uret.cjs` R-05 · `app.js` ≈3905 (shim satırı) · motor dış yüzeyi
  `window.SeymaQuranLearn={` (≈3211).
- **Dokun:** `tests/kao/test_kao2_handler_surface.js` (yeni), `tests/kao/README.md`.
- **Adımlar:**
  1. Test: (a) `quranLearn*.js`'teki `App.(kao\w+)`, `name:'kao…'`, `action:'kao…'` ve dize birleştirmeyle
     kurulan eylem adları (grep ile tüm kalıpları bul) → referans kümesi; (b) `app.js` tanım kümesi;
     (c) her tanım tek satırlık shim biçiminde ve `window.SeymaQuranLearn.<ad>` var; (d) `KNOWN_MISSING=['kaoS0']`
     sabiti — test, listedeki her adın **gerçekten** eksik olduğunu da doğrular (liste yalnız küçülebilir;
     yorum: "K2F-12 boşaltır").
  2. PASS; `KNOWN_MISSING` boş değilken R-05 FAIL kalır (beklenen).
- **Kabul:** test PASS · referans−tanım farkı yalnız `kaoS0`.
- **Commit:** `K2F-03: App.kao* referans ↔ tanım yüzey fixture'ı`

---

#### K2F-04 · Kabul testi kanıt yazımı opt-in

- **Amaç:** `test_kao2_kabul.js`'in her koşuda izlenen kanıt dosyasını yeniden yazmasını durdurmak.
- **Kapatır:** M-11 · **R:** R-10 fail→pass.
- **Oku:** `tests/kao/test_kao2_kabul.js` ≈270–285 · `kao2-duzeltme/tools/kapilar.sh` (A-KABUL yedek bloğu).
- **Dokun:** `tests/kao/test_kao2_kabul.js`, `kao2-duzeltme/tools/kapilar.sh`.
- **Adımlar:**
  1. Rapor yazımı yalnız `process.env.KAO2_EVIDENCE_OUT` tanımlıysa ve o yola yapılır; tanımsızsa yazma yok,
     özet stdout'a basılır.
  2. `kapilar.sh`'taki A-KABUL yedek/geri koyma bloğunu kaldır (artık gereksiz).
  3. Doğrula: `node tests/kao/test_kao2_kabul.js` sonrası `git status --porcelain` boş.
- **Kabul:** R-10 PASS · test koşusu ağacı kirletmiyor.
- **Commit:** `K2F-04: kabul testi kanıtı yalnız açık istekle yazar`

### W1 — Acil: canlı kullanıcıyı aç

---

#### K2F-05 · Ustalık 1/4 — saf masteryPlan

- **Amaç:** Ünite ustalık kontrolünün planını üreten saf Flow fonksiyonu (KR-1).
- **Kapatır:** K4-01 (1/4) · **R:** değişmez.
- **Oku:** `quranLearnFlow.js` `lessonPlan` (≈122–175), `applyWords` (≈103), `unitProgress` (≈183),
  `currentUnit` (≈225), dış yüzey (≈273) · rapor K4-01 · `archive/kuran-ogreniyorum-v2/07-MUFREDAT-VE-ICERIK.md` §3 "Ders dağılımı".
- **Dokun:** `app/core/quranLearnFlow.js`, `tests/kao/test_kao2_mastery.js` (yeni), `tests/kao/README.md`.
- **Adımlar:**
  1. **Kırmızı** (`test_kao2_mastery.js` bölüm A — saf): `masteryPlan(snapshot, unitId, now, content)`:
     (a) sıra `goal` → (ünite çapası `prayer:`/`surah:` ise) `read` → 10 × `practice` → `summary`;
     (b) `practice` öğeleri `mastery:true`, `choiceCount:4`, yalnız ünitenin **tanışılmış** lemmalarından,
     en zayıftan (kart `s` küçük) başlayarak; tanışılmış lemma <10 ise yönler (ar>tr, tr>ar, sesli ise
     audio) çeşitlenerek 10'a tamamlanır; tanışılmış lemma 0 ise `null`;
     (c) aynı girdiyle **bayt-eşit** (belirlenimci; tohum `unitId + dayKey(now)`); (d) `read` öğesi
     çapa metninin kelimelerini `applyWords` ile verir;
     (e) `unitMastery(q, unitId)` → `{state:'none'|'passed'|'failed'|'repair'|'skipped', score, attempts}`.
  2. Flow'da uygula; `window.SeymaQuranLearnFlow`'a `masteryPlan`, `unitMastery` ekle.
     Flow saflığı: DOM/ağ/zaman/depo/`Date.now` yok (mevcut saflık testi yeşil kalır).
- **Kabul:** bölüm A PASS · saflık testi PASS · runtime bütçesi içinde.
- **Commit:** `K2F-05: saf ustalık planı (masteryPlan, unitMastery)`

---

#### K2F-06 · Ustalık 2/4 — ustalık oturumu ve kayıt

- **Amaç:** "Ustalık" adımının gerçekten ustalık oturumu açması ve sonucun kaydedilmesi.
- **Kapatır:** K4-01 (2/4) · **R:** R-01 ve R-02 fail→pass.
- **Oku:** `quranLearn.js` `kaoLessonStart` (≈1395–1430; özellikle ≈1400–1402 "son derse düşme"),
  `kaoLesson` finish/more (≈1479–1500), `kaoLessonRecord`, `ensureQuranLearn` path normalizasyonu
  (≈3094–3200, `cleanUnits` ≈3196) · `tests/kao/test_kao2_migration.js`.
- **Dokun:** `app/core/quranLearn.js`, `tests/kao/test_kao2_mastery.js`, `tests/kao/test_kao2_migration.js`.
- **Adımlar:**
  1. **Kırmızı** (bölüm B, `kao-harness` ile gerçek handler): (a) Ünite 1 dersleri bitmiş kullanıcıda
     `kaoLesson('start', 1)` → `ui.kaoLesson.kind==='mastery'`, plan `masteryPlan` çıktısı (içerik dersi DEĞİL);
     (b) 10 doğru → `path.units['1'] = {masteryAt:ISO, masteryScore:1, attempts:1, lastAttemptAt:ISO, repair:null, skippedAt:null}`;
     (c) 5 yanlış → `masteryAt:null`, `masteryScore:0.5`, `repair.lemmaIds` = yanlış cevaplanan lemmalar (tekilleştirilmiş);
     (d) eski biçim `path.units['1']={masteryAt:…}` normalizasyonda korunur, yeni alanlar varsayılanla eklenir;
     (e) `tekrar-uret` R-01, R-02 PASS.
  2. `kaoLessonStart`: kimlik ünite ise ustalık planı kur (`kind:'mastery'`); ≈1400–1402'deki "son içerik
     dersine düş" geri dönüşünü kaldır. Tanışılmış lemma yoksa `false` ve kullanıcıya sade not.
  3. Bitiş: `kind==='mastery'` ise ustalık kaydı (eşik 0,8); ders kaydı (`path.lessons`) yazılmaz;
     `daily[today].sessionDone` mevcut kuralla.
  4. `ensureQuranLearn`: `path.units[id]` alanlarını normalize et (yalnız ekleme; bozuk tip → varsayılan).
     `test_kao2_migration.js`'e yeni alan beklentileri (eski veri derin eşit).
- **Kabul:** bölüm B PASS · R-01, R-02 PASS · migration PASS · A-6 (eski veri) bozulmaz.
- **Commit:** `K2F-06: ustalık oturumu gerçek planla açılır ve sonucu kaydedilir`

---

#### K2F-07 · Ustalık 3/4 — onarım, atla, sıradaki adım

- **Amaç:** Başarısız ustalıkta onarım dersi; v1 kullanıcıya "şimdilik atla" (KR-2); sıradaki adımın
  12 ünite boyunca hiç döngüye girmemesi.
- **Kapatır:** K4-01 (3/4) · **R:** değişmez (R-01/R-02 PASS kalır).
- **Oku:** `quranLearnFlow.js` `currentUnit` (≈225–235), `nextStep` (≈248–271), `lessonStep` (≈238) ·
  `quranLearn.js` `KAO_HOME_ACTIONS` (≈2619–2630) · `tests/kao/test_kao2_next_step.js`.
- **Dokun:** `app/core/quranLearnFlow.js`, `app/core/quranLearn.js`, `tests/kao/test_kao2_next_step.js`,
  `tests/kao/test_kao2_mastery.js`.
- **Adımlar:**
  1. **Kırmızı:** next_step tablosuna satırlar: (a) dersler bitti + `repair` var → `kind:'repair'`
     (başlık "Onarım: <ünite>", eylem `kaoLesson('start','repair:<unitId>')`); (b) onarım bitti → yeniden
     `mastery`; (c) `skippedAt` dolu → sonraki ünitenin adımı; (d) `masteryAt` dolu → sonraki ünite.
     `test_kao2_mastery.js` bölüm C: **12 ünite simülasyonu** — her ünitede dersleri `walkLesson` ile bitir,
     ustalığı doğru cevaplarla geç; Bugün adımı her seferinde bir sonraki üniteye ilerler; sonunda `rest`
     ("Tüm üniteler tamam ✓"). Aynı simülasyonda Ünite 3 ustalığını bilerek kaldır → onarım → geç.
  2. Flow: ünite tamam = dersler bitti ∧ (`masteryAt` ∨ `skippedAt`). Öncelik: repair > mastery.
  3. Motor: `kaoLessonStart('repair:<id>')` → onarım lemmalarıyla alıştırma planı (tanış atlanır, iki yön);
     bitince `repair:null`. `kaoLesson('skip-mastery', unitId)` dağıtıcı eylemi → `skippedAt=ISO`
     (yeni handler yok; taş/masteryAt yazılmaz).
  4. `KAO_HOME_ACTIONS`'a `repair` eşlemesi.
- **Kabul:** next_step yeni satırlar PASS · 12 ünite simülasyonu PASS · onarım yolu PASS.
- **Commit:** `K2F-07: onarım dersi, ustalığı atlama ve 12 ünite boyunca kesintisiz sıradaki adım`

---

#### K2F-08 · Ustalık 4/4 — görünümler, taşlar, uçtan uca

- **Amaç:** Ustalığın arayüzde doğru görünmesi; ünite taşlarının kazanılması; kullanıcı dokunuşlarıyla uçtan uca akış.
- **Kapatır:** K4-01 (4/4) · **R:** değişmez.
- **Oku:** `quranLearn.js` `kaoPathHTML` (≈787), `kaoUnitHTML` (≈816; ≈795 "Ustalık:" öneki),
  `kaoMilestoneCheck` (≈470), `kaoUnitMastered` (≈462), `kaoHomeHTML` (≈2649) · `quranLearnViews.js`
  `pathScreen` (≈163), `unitScreen` (≈188), `lessonScreen` özet (≈245) · `kaoPanelSummary`.
- **Dokun:** `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/kao.css`,
  `tests/kao/test_kao2_mastery.js`, `tests/kao/test_kao2_path.js`, `tests/kao/test_kao2_today.js`,
  `tests/kao/test_kao2_milestones.js`, `tests/kao/test_kao_panel_projection.js`.
- **Adımlar:**
  1. **Kırmızı** (bölüm D): (a) Ünite ekranında dersler listesinden **ayrı** "Ustalık" satırı: dersler bitmeden ○,
     sırada ●, geçti ✓ (%puan), atlandı "Atlandı"; içerik dersinin başlığında "Ustalık:" öneki yok;
     (b) Bugün kahramanı `mastery` adımında tek birincil "Ustalığa başla" + ikincil metin düğmesi
     "Şimdilik atla" (`kaoLesson('skip-mastery', id)`); ekran başına ≤1 `.kao-primary`;
     (c) ustalık özeti: "10 sorudan N doğru", geçti/kaldı cümlesi, sıradaki adım; geçtiyse tek sakin taş satırı;
     (d) Yol'da `aria-current="step"` Flow `currentUnit`'e; (e) `u<n>` taşı yalnız geçince;
     `kaoPanelSummary.unitMilestones` artar; (f) **uçtan uca**: sıfır kullanıcı ilk açılıştan başlar,
     yalnız Bugün ekranının birincil düğmesine "dokunarak" (handler çağrılarıyla) Ünite 1 → Ünite 2'ye geçer;
     v1 kullanıcı (Ü1–3 kartlı) → ustalık teklif edilir, "Şimdilik atla" ile Ünite 4'e ulaşır.
  2. `lesson.mastery` bayrağını görünümde yok say (içerik K2F-20'de temizlenir).
  3. Mevcut testlerde bilerek değişen beklentileri KANIT'a yaz (P2.4).
- **Kabul:** bölüm D PASS · test_kao2_path/today/milestones/panel_projection PASS · R-01/R-02 PASS.
- **Commit:** `K2F-08: ustalık satırı, atla eylemi, ünite taşları ve uçtan uca geçiş`

---

#### K2F-09 · Gramer 1/3 — dondurma hattı örnekleri taşır

- **Amaç:** Doğrulanmış âyet örneklerini (`examples`) ve açıklamaları çalışma zamanı modülüne taşımak.
- **Kapatır:** K4-02 (1/3; kök neden) · **R:** değişmez.
- **Oku:** `tools/kao-content-freeze.mjs` `freezeGrammar` (≈64–95), `compactCell` (≈40–63), `INPUTS` pinleri (≈10–20) ·
  `tools/kao-grammar-build.mjs` ≈205–220 (examples biçimi) · `docs/kuran-ogreniyorum/content/grammar.verified.json`
  içinde bir kavramın `examples` alanı (`node -e` ile yalnız g0_5) · `tests/kao/test_kao2_perf_budget.js`.
- **Dokun:** `tools/kao-content-freeze.mjs`, `app/content/quranGrammarV1.js` (araç çıktısı),
  `tests/kao/test_kao2_grammar_tasks.js` (yeni), içerik boyutu/özet pinleyen testler (grep:
  `grep -rn "quranGrammarV1" tests/`), `tests/kao/README.md`.
- **Adımlar:**
  1. **Kırmızı** (`test_kao2_grammar_tasks.js` bölüm A): `QuranGrammarV1` her kavramda `examples[]`
     taşır; `exampleId`'li 43 şablonun 43'ü modül içinde çözülür; her örnekte `ref`, `tr`, `ar`,
     `words[{w, ar, pronunciation}]` var ve okunuşlar boş değil; `explanation` varsa taşınır.
  2. `freezeGrammar`'a `examples` (ve varsa `explanation`) ekle; Arapça ve okunuş **yalnız**
     `resolved` alanlarından ve mevcut okunuş projeksiyonundan (`turkishPronunciation`/QAC) — elle yok.
     Girdi pini (`grammar.verified.json` sha256) değişmez.
  3. `node tools/kao-content-freeze.mjs --freeze-grammar` iki kez → bayt-eşit.
  4. Modül tavanı (60 KiB) ve K-1 içerik bütçeleri (`test_kao2_perf_budget`, `test_kao_user_tasks` R-C5)
     yeşil; aşılırsa P6.
  5. Davranış değişmez (görev kurucu henüz eski); tüm aileler yeşil.
- **Kabul:** bölüm A PASS · bayt-eşit iki üretim · bütçeler yeşil.
- **Commit:** `K2F-09: gramer modülü doğrulanmış âyet örneklerini taşır`

---

#### K2F-10 · Gramer 2/3 — fail-closed güvenlik ağı

- **Amaç:** Yanlış gramer görevinin **hiç** gösterilmemesi (yanlış öğretmektense göstermemek).
- **Kapatır:** K4-02 (2/3) · **R:** R-03 fail→pass.
- **Oku:** `kao2-duzeltme/denetim/tekrar-uret.cjs` `grammarDefects` (5 kural) · `quranLearn.js`
  `kaoBuildGrammarTask` (≈1135–1162), `kaoGrammarCandidates`, ders oynatıcının görev kurduğu yer
  (`kaoLessonActivate` ≈1366–1380), `kaoBuildQueue` gramer adayları.
- **Dokun:** `app/core/quranLearn.js`, `tests/kao/test_kao2_grammar_tasks.js`.
- **Adımlar:**
  1. **Kırmızı** (bölüm B): 109 dersin `walkLesson` yürüyüşünde gösterilen hiçbir gramer görevi 5 kuralı
     ihlal etmez; ihlal eden şablon için ders, aynı dersin bir kelime alıştırmasıyla ikame edilir
     (alıştırma sayısı düşmez); tekrar kuyruğunda (`kaoBuildQueue`) geçersiz gramer kartı sunulmaz;
     kullanıcının mevcut `g:` kartları **silinmez**.
  2. `kaoGrammarTaskValid(task)`: `tekrar-uret` 5 kuralının üretim karşılığı (+ tek doğru şık, şık etiketleri
     tekil). Doğrulanmış örnek verisi `QuranGrammarV1.byId(concept).examples`'tan.
  3. Ders oynatıcı ve kuyruk geçersiz görevi ikame eder/atlar; KANIT'a gösterilen gramer görevi sayısı
     (önce 78, şimdi N) ve atlanan şablon listesi.
- **Kabul:** bölüm B PASS · R-03 PASS · alıştırma sayısı her derste ≥6.
- **Commit:** `K2F-10: geçersiz gramer görevi gösterilmez (fail-closed)`

---

#### K2F-11 · Gramer 3/3 — görev kurucu örnekten ve kavramdan

- **Amaç:** Gramer görevlerini doğru kurup gösterilen görev sayısını geri kazanmak.
- **Kapatır:** K4-02 (3/3) · K4-04 (ardışık aynı görev) · **R:** R-03 PASS kalır.
- **Oku:** `kaoBuildGrammarTask` (≈1135–1162), `kaoBuildFragmentTask` ve `kaoTaskHTML` sıralama (`order`)
  etkileşimi (≈1206–1250), `kaoAnswer` order yolu · her gramer türünün şablonları:
  `node -e` ile `QuranGrammarV1.concepts[].templates` türlere göre say.
- **Dokun:** `app/core/quranLearn.js`, `app/core/quranLearnFlow.js` (yalnız ardışık tekrar engeli),
  `tests/kao/test_kao2_grammar_tasks.js`, `docs/kuran-ogreniyorum/kao2/inceleme/GRAMER-SABLON-L2.md` (yeni; testin ürettiği liste).
- **Adımlar:**
  1. **Kırmızı** (bölüm C): 86 şablonun her biri için kurulum: desteklenen → geçerli görev; desteklenmeyen →
     açık gerekçeyle listede. Hedefler: `exampleId`'li 43 şablonun **43'ü** desteklenir; 109 ders yürüyüşünde
     gösterilen gramer görevi ≥ 60 ve 0 ihlal; aynı görev iki kez ardışık gelmez.
  2. Tür semantiği: **Kelime dizme** → örneğin `words` sırası (mevcut `order` etkileşimiyle; doğru sıra =
     örnek sırası). **Parça çevir** → uyaran örnek Arapçası, doğru = örnek `tr`, çeldiriciler başka örneklerin
     `tr`'si (aynı kavram önce), belirlenimci. **Çekim tablosu** → şablon yönergesindeki tırnaklı hücreyle
     **eşleşen satır** seçilir; çeldiriciler aynı tablonun diğer hücreleri (başka fiiller değil).
     **Ek çöz** → kavram tablosunun sütun/parça yapısından (`'el + '` sabiti kalkar; yalnız g1'de "el").
     **Anlam seç / Arapça seç / Kök bul / Kalıp eşle** → veriden belirlenimci kurulabiliyorsa kur, yoksa
     desteklenmeyen listesine (tahmin etme).
  3. Desteklenmeyen ve alan uzmanı onayı gerektiren şablonlar `GRAMER-SABLON-L2.md`'ye (şablon kimliği,
     tür, neden, örnek ref) — Arapça metin yazmadan, kimlikle.
  4. `lessonPlan`: aynı `templateId` ardışık iki kez gelmez.
- **Kabul:** bölüm C PASS · R-03 PASS · gösterilen gramer görevi ≥60 · L2 listesi üretildi.
- **Commit:** `K2F-11: gramer görevleri doğrulanmış örnekten ve kavram tablosundan kurulur`

---

#### K2F-12 · Seviye 0 1/4 — App.kaoS0 ve s0 görünümü

- **Amaç:** S0 yüzeyinin düğmelerini çalışır kılmak ve yüzeyi gerçekten açmak.
- **Kapatır:** K5-02 (i, ii) · **R:** R-05 fail→pass.
- **Oku:** `quranLearn.js` `kaoS0` (≈659–685), `kaoS0Start` (≈638), `kaoApplyView`/`kaoNav` · `app.js` ≈3905 ·
  P8 pin listesi.
- **Dokun:** `app.js` (tek shim), `app/core/quranLearn.js`, P8 pin dosyaları, `tests/kao/test_kao2_s0.js`,
  `tests/kao/test_kao2_handler_surface.js` (`KNOWN_MISSING` boşalır), `kao2-duzeltme/FIX-STATE.json` (`pins`).
- **Adımlar:**
  1. **Kırmızı:** `test_kao2_s0.js`'e: `kaoS0('start','s0.02')` → yığının tepesi `s0`, NavBar "Harfler";
     handler_surface `KNOWN_MISSING` boşken PASS.
  2. `App.kaoS0` shim (P8 biçimi); motor dış yüzeyinde `kaoS0` zaten var — doğrula.
  3. `kaoS0('start', id)` → `kaoApplyView(ui,'s0',id,'push')` + render.
  4. Pinler: App.kao* 42→43 · yüzey 763→764 · atama 601→602 (ölç ve yaz).
- **Kabul:** R-05 PASS · handler_surface PASS (liste boş) · tüm aileler yeşil.
- **Commit:** `K2F-12: App.kaoS0 tanımlandı, Seviye 0 yüzeyi gerçekten açılır`

---

#### K2F-13 · Seviye 0 2/4 — harfsiz dersler

- **Amaç:** Harf listesi olmayan 6 S0 dersinin (hareke, esre/ötre, konum, sükûn, med/şedde, tenvin/elif-lâm)
  içerik kazanması ve çizimin hiçbir derste çökmemesi.
- **Kapatır:** K5-02 (iv) · **R:** R-06 fail→pass.
- **Oku:** `quranLearn.js` `kaoS0Lesson` (≈2663–2730), `kaoS0HTML` (≈687–716; ≈707 çökme satırı),
  `kaoS0PositionTable` · `tools/kao2-curriculum-build.mjs` S0 bölümü (grep `s0`) ·
  `docs/kuran-ogreniyorum/kao2/content/curriculum.spec.json` S0 dersleri · `QuranPhonicsV1` alanları (`node -e`).
- **Dokun:** `docs/kuran-ogreniyorum/kao2/content/curriculum.spec.json` (S0 `focus`), `tools/kao2-curriculum-build.mjs`,
  `app/content/quranCurriculumV2.js` (araç çıktısı), `app/core/quranLearn.js`, `tests/kao/test_kao2_s0.js`,
  `tests/kao/test_kao2_curriculum.js`.
- **Adımlar:**
  1. **Kırmızı:** 12 dersin 12'si `kaoS0HTML` ile çökmeden çizilir; harfsiz derslerde ≥3 örnek kelime
     (konum dersinde 28 harflik tablo); R-06.
  2. Spec: S0 derslerine kimlikle `focus` (ör. `{kind:"marks", marks:["fatha"]}`, `{kind:"positions"}`,
     `{kind:"sukun"}`, `{kind:"madd-shadda"}`, `{kind:"tanwin-al"}`) — Arapça harf yazmadan, işaret adlarıyla.
  3. Araç: `focus`'a göre lexicon'dan belirlenimci örnek seçimi (hedef işareti taşıyan, ≤3 hece, ses klibi
     diskte var) → `s0.lessons[i].examples` (lemma kimlikleri); iki üretim bayt-eşit.
  4. `kaoS0HTML`: ders türüne göre dal; `letters[0]` korumasız erişim kalmaz.
- **Kabul:** R-06 PASS · curriculum testi (bayt-eşit, bütçe) PASS · S0 testi PASS.
- **Commit:** `K2F-13: harfsiz S0 dersleri içerik kazandı, S0 çizimi çökmez`

---

#### K2F-14 · Seviye 0 3/4 — aşamalar ve alıştırmalar

- **Amaç:** S0 dersinin 4 aşamasının gerçekten farklı içerik göstermesi ve 6–8 puanlı alıştırma.
- **Kapatır:** K5-02 (v) · D-10 · **R:** değişmez.
- **Oku:** `kaoS0` (≈659), `kaoS0HTML` (≈687), `kaoS0Model`, `kaoS0ClipPlan` · rapor K5-02 ·
  `archive/kuran-ogreniyorum-v2/07-MUFREDAT-VE-ICERIK.md` §2 (ders anatomisi).
- **Dokun:** `app/core/quranLearn.js`, `app/core/quranLearnViews.js` (S0 görünüm kurucuları buraya), `app/kao.css`,
  `tests/kao/test_kao2_s0.js`.
- **Adımlar:**
  1. **Kırmızı:** her ders için aşamalar: `intro` (kısa açıklama; metin `texts.tr.json` s0 `goal` + mekanik
     cümle) → `listen` (örnekler + ses; ses yok/sessiz saat → görünür not, çalışmayan ses düğmesi yok) →
     `drill` (6–8 soru: harf tanı · hece-hareke eşle · konum eşle; türler dersin `focus`'una göre) →
     `read` (gerçek kelime; okunuşu göster/gizle) → bitti. Aşama HTML'leri birbirinden farklı; `drill`
     bitmeden `next` pasif; cevaplar puanlanır (`ui.kaoS0.drill={items,index,correct}`); tüm Arapça içerik
     modüllerinden; çeldiriciler aynı ders/aileden; aşama başına ≤1 `.kao-primary`; geri bildirim `aria-live`.
  2. Eylemler mevcut `App.kaoS0(action,…)` dağıtıcısıyla (`answer`, `next`, `audio`, `read`) — yeni handler yok.
  3. HTML kurucuları `quranLearnViews.js`'e (K-2), motor yalnız model üretir.
- **Kabul:** S0 testi (12 ders × 4 aşama, 6–8 alıştırma, puanlama) PASS · tasarım sözleşmesi PASS.
- **Commit:** `K2F-14: Seviye 0 aşamaları ve puanlı alıştırmalar`

---

#### K2F-15 · Seviye 0 4/4 — ana yol ve tamamlama

- **Amaç:** Okuyamayan kullanıcının Bugün düğmesinden S0 yüzeyine ulaşması; boş S0 planının yok olması.
- **Kapatır:** K5-01 · K5-02 (iii) · P-05 · **R:** R-04 fail→pass.
- **Oku:** `quranLearnFlow.js` `nextStep` S0 dalı (≈263–264) · `quranLearn.js` `KAO_HOME_ACTIONS` (≈2619–2630),
  Keşfet satırları (≈2645), `kaoLessonStart` S0 dalı (≈1399), ilk açılış son düğmesi (≈2844),
  `kaoMilestoneCheck` besmele (≈474).
- **Dokun:** `app/core/quranLearnFlow.js`, `app/core/quranLearn.js`, `tests/kao/test_kao2_s0.js`,
  `tests/kao/test_kao2_onboarding.js`, `tests/kao/test_kao2_today.js`, `tests/kao/test_kao2_milestones.js`.
- **Adımlar:**
  1. **Kırmızı:** (a) "Henüz değil" seçen sıfır kullanıcı → Bugün birincil düğmesi `kaoS0('start','s0.01')`;
     (b) `kaoLessonStart('s0.xx')` S0 yüzeyine devreder, boş plan kurmaz; (c) S0 dersi yalnız `read`
     aşaması bitince `path.lessons[id]={startedAt,doneAt,score}`; (d) 12 S0 dersi uçtan uca → sonra Fâtiha;
     (e) `besmele` taşı yalnız gerçek `s0.12` tamamlanınca ya da yerleştirmeyle; (f) Keşfet S0 satırı
     `onboarding.start==='s0'` ya da başlanmış S0 dersi ya da kart varsa görünür; (g) ilk açılıştan ilk
     S0 içeriğine ≤3 dokunuş; R-04.
  2. Flow: `s0-lesson` adımının eylemi S0 yüzeyi.
- **Kabul:** R-04 PASS · uçtan uca S0 yolu PASS · besmele kuralı PASS.
- **Commit:** `K2F-15: okuyamayan kullanıcı Bugün'den Seviye 0'a ulaşır; S0 gerçek tamamlanır`

---

#### K2F-16 · Niyet — okuma, değiştirme, öneri

- **Amaç:** İlk açılışta seçilen niyetin Ayarlar'da görünmesi, değiştirilebilmesi ve hub önerisini belirlemesi.
- **Kapatır:** K3-06 · K3-05 · P-10 · D-18 · **R:** R-07 fail→pass.
- **Oku:** `quranLearn.js` `kaoSettingsHTML` niyet satırı (≈1761), onboarding niyet yazımı (≈2795–2802),
  `kaoIntentSuggestion` (≈2860), `kaoHubCardHTML` (≈2886) · P8.
- **Dokun:** `app.js` (tek shim `kaoSetIntent`), `app/core/quranLearn.js`, P8 pin dosyaları,
  `tests/kao/test_kao2_settings.js`, `tests/kao/test_kao2_hub.js`, `kao2-duzeltme/FIX-STATE.json` (`pins`).
- **Adımlar:**
  1. **Kırmızı:** (a) `onboarding.intent='isha'` → Ayarlar "Niyet: Her yatsı namazından sonra 5 dakika";
     (b) Ayarlar'daki niyet seçimi (sabah/öğle/ikindi/akşam/yatsı/kendim) `kaoSetIntent(v)` ile
     `onboarding.intent`'i günceller; geçersiz değer reddedilir; (c) hub "bekliyor" durumunda niyet varsa
     o vaktin saatiyle öneri, yoksa mevcut sıradaki-vakit davranışı; R-07.
  2. Ayarlar niyet satırı `q.onboarding.intent`'ten okur.
  3. `App.kaoSetIntent` (P8): 43→44 · 764→765 · 602→603.
- **Kabul:** R-07 PASS · settings/hub PASS · pinler ölçülmüş.
- **Commit:** `K2F-16: niyet Ayarlar'da görünür, değişir ve hub önerisini belirler`

---

#### K2F-17 · Dalga 1 regresyonu ve ara rapor

- **Amaç:** Dalga 1'in bütünlüğünü doğrulamak ve kullanıcıya kanıt düzeyleri ayrılmış ara rapor vermek.
- **Kapatır:** — · **R:** beklenen: R-01…R-07, R-09, R-10 PASS · R-08 FAIL (K2F-23'te).
- **Oku:** `kao2-duzeltme/evidence/K2F-05…K2F-16/KANIT.md` "Ölçümler" bölümleri.
- **Dokun:** `kao2-duzeltme/evidence/K2F-17/{KANIT.md,ARA-RAPOR.md}`, `tests/kao/README.md`.
- **Adımlar:**
  1. `kapilar.sh` YEŞİL; `tekrar-uret` 9/10; beklenen dışı sonuç → P6.
  2. Ek ölçümler: 12 ünite simülasyonu · 109 ders yürüyüşünde gösterilen gramer görevi sayısı ve
     0 ihlal · S0 12 ders uçtan uca · perf/bütçe satırı.
  3. `ARA-RAPOR.md` (kullanıcı için, sade Türkçe): ne düzeldi (4 kritik + niyet), nasıl doğrulandı,
     kanıt düzeyleri (kaynak/test ✓ · yayın — · cihaz —), cihazda denenecek 3 akış.
  4. `tests/kao/README.md` envanteri Dalga 1 testleriyle güncel.
- **Kabul:** kapilar YEŞİL · 9/10 · ara rapor yazıldı.
- **Commit:** `K2F-17: Dalga 1 regresyonu ve ara rapor`

---

#### K2F-18 · YAYIN-1 (kullanıcı onay kapısı)

- **Amaç:** Dalga 1'i (acil düzeltmeler) kullanıcı onayıyla canlıya almak.
- **Kapatır:** — · **R:** değişmez.
- **Kullanıcı kapısı (P7):** Önce `ARA-RAPOR.md`'nin özetini kullanıcıya sun ve **açık yanıt iste**:
  `YAYIN-1 onaylı` ya da `YAYIN-1 ertele`. Yanıt yoksa `waiting_user` ile dur.
- **Oku:** `CLAUDE.md` "Git / deploy" ve "Cache busting" · `tests/app/test_iip_22.js` release sabiti ·
  `sw.js` `SW_VERSION`/`SW_OFFLINE_VERSION`/önbellek listesi · `archive/kuran-ogreniyorum-v2/evidence/KAO2-27/YAYIN.md` (örnek biçim).
- **Dokun (yalnız onaylıysa):** `index.html`, `sw.js`, `tests/app/test_iip_22.js`,
  pin taşıyan testler (`grep -rl "20260930l" tests/ index.html sw.js`), `kao2-duzeltme/evidence/K2F-18/{YAYIN.md,release-live.json}`,
  `kao2-duzeltme/FIX-STATE.json` (`pins.release`, `lastRelease`, `releaseApproval`).
- **Adımlar (onaylıysa):**
  1. Yeni pin: bugünün `YYYYMMDD` + harf (aynı gün önceki pinden sonraki harf). Değişen **her** KAO varlığının
     `index.html` `?v=`'si, `sw.js` önbellek listesi, `SW_VERSION`, `SW_OFFLINE_VERSION='iip22-<pin>'`,
     `test_iip_22.js` `release` ve pin taşıyan tüm testler **tek committe**. `kapilar.sh` YEŞİL.
  2. `git switch main && git merge --ff-only kao2-duzeltme && git push origin main && git switch kao2-duzeltme`.
     ff-only başarısızsa dur (P6) — force yok.
  3. Pages: `gh run list --workflow pages.yml -L 1` → success'e kadar izle (bekleme aracıyla; sık yoklama yok).
  4. Canlı doğrulama: değişen her dosya için `https://mustafaras.github.io/s/<yol>` SHA-256 = yerel;
     gizlilik: `kao2-duzeltme/FIX-STATE.json`, `archive/…`, `docs/…` → 404. `YAYIN.md` + `release-live.json`.
  5. STATE: `releaseApproval:"approved_through_K2F-17"`, `lastRelease:{prompt:"K2F-18", commit, pin, run}`.
- **Ertele yanıtında:** yayın adımı yapılmaz; LEDGER `GATE status: deferred`; prompt `done`
  (`lastRelease:null`); program sürer, YAYIN-2 kapsamı genişler.
- **Kabul:** onaylı: canlı bayt-eşit + gizlilik 404 · ertele: kayıt. Kanıt düzeyi: yayın ✓ · cihaz — (kullanıcıda).
- **Commit:** `K2F-18: YAYIN-1 — Dalga 1 canlıda (pin <yeni>)` ya da `K2F-18: YAYIN-1 ertelendi`

### W2 — İçerik doğruluğu

---

#### K2F-19 · Ders tutarlılık kapısı (test)

- **Amaç:** Ders başlığı/hedefiyle dersin kelimeleri arasındaki uyumu otomatik ölçen kapı.
- **Kapatır:** K5-03 (1/3) · **R:** değişmez.
- **Oku:** rapor K5-03 tablosu · `docs/kuran-ogreniyorum/kao2/content/texts.tr.json` `lessons` · lexicon `pos`
  değerleri (`node -e` ile küme olarak listele) · `QuranGrammarV1` kavram başlıkları.
- **Dokun:** `tests/kao/test_kao2_lesson_coherence.js` (yeni), `tests/kao/README.md`.
- **Adımlar:**
  1. Kategori sözlüğü (Türkçe anahtar kelime → `pos`/özellik yüklemi): edat/"-de,-den,-e" → `P`;
     zamir → zamir etiketleri (listele); işaret → `DEM`; soru → `INTG`; emir → emir biçimi (kalıp/etiket);
     seslenme → seslenme lemmaları; şart → `COND`; zaman → `T`; fiil/geçmiş/şimdiki → `V` + kalıp;
     "yapan/yapılan" → `pattern` ism-i fâil/mef'ûl; … (tam liste testte, gerekçeli).
  2. Kural: başlık ya da hedef bir kategori anıyorsa dersin lemmalarının ≥%60'ı yüklemi sağlar; dersin
     `conceptId`'si varsa kavramın kategorisi de sağlanır.
  3. `KNOWN_MISMATCH` = bugün kalan derslerin **tam** listesi (en az: u02.01, u02.02, u04.01, u04.02,
     u09.01, u09.02, u10.01, u11.04, u11.05, u12.02); test listenin tam eşit olduğunu doğrular
     (liste yalnız küçülür; K2F-20 boşaltır).
- **Kabul:** test PASS (bilinen liste kayıtlı) · liste KANIT'ta.
- **Commit:** `K2F-19: ders başlığı ↔ kelime tutarlılık kapısı`

---

#### K2F-20 · Müfredat yeniden dağıtımı (G2 kapısı)

- **Amaç:** Kelimeleri başlık/kavrama göre yeniden dağıtmak (KR-3) ve yeni eşlemeyi kullanıcı onayına sunmak.
- **Kapatır:** K5-03 (2/3) · K3-07 (belge) · **R:** değişmez.
- **Kullanıcı kapısı (P7):** yeni `MUFREDAT-ESLEME.md` üretilince kullanıcıdan açık yanıt:
  `G2 onaylı` ya da değişiklik istekleri (lemma kimliğiyle). Onaysız `done` yok.
- **Oku:** `tools/kao2-curriculum-build.mjs` `poolRules`/focus işleyişi, satır ≈291 ve ≈302 (eski yol metni) ·
  `docs/kuran-ogreniyorum/kao2/content/curriculum.spec.json` · `tests/kao/test_kao2_curriculum.js` ·
  `quranLearnFlow.js` `lessonProgress` (tamamlanmış dersin korunması).
- **Dokun:** `docs/kuran-ogreniyorum/kao2/content/curriculum.spec.json`, `tools/kao2-curriculum-build.mjs`,
  `app/content/quranCurriculumV2.js`, `app/content/quranConceptTextsV1.js` (araç çıktısıysa),
  `docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md`, `tests/kao/test_kao2_curriculum.js`,
  `tests/kao/test_kao2_lesson_coherence.js`, `tests/kao/test_kao2_migration.js`,
  `app/core/quranLearnFlow.js` (yalnız ilerleme koruması gerekiyorsa).
- **Adımlar:**
  1. Spec: kategori derslerine uygun lemmalar **kimlikle** (focus listeleri) + `poolRules`; Ünite 1 ve 3
     değişmez; 524/524 tam bir kez; 25/25 kavram bağlı.
  2. Araç: içerik dersindeki `mastery:true` bayrağını üretmez; satır ≈291/≈302'deki eski yol metnini
     `docs/kuran-ogreniyorum/kao2/content/curriculum.spec.json` yap.
  3. Yeniden üret (iki kez bayt-eşit); `KNOWN_MISMATCH` **boş**.
  4. **İlerleme koruması (A-6):** daha önce tamamlanmış ders (`path.lessons[id].doneAt`) tamamlanmış kalır;
     derse yeni taşınan ve tanışılmamış kelimeler sonraki derste/tekrarda tanıştırılır; kart verisi
     değişmez. `test_kao2_migration.js`: eski dağılımla tamamlanmış kullanıcı → yeni dağılımda derin eşit
     veri + bozulmayan sıradaki adım.
  5. `MUFREDAT-ESLEME.md` yeniden üretildi (üstte "değişenler" özeti: taşınan lemma kimlikleri) → P7.
  6. Onay sonrası: LEDGER GATE closed; `done`.
- **Kabul:** coherence (boş liste) PASS · curriculum PASS · migration PASS · G2 kullanıcı onayı kayıtlı.
- **Commit:** `K2F-20: kelimeler başlık ve kavrama göre yeniden dağıtıldı (G2 onaylı)`

---

#### K2F-21 · Ders metinleri ve inceleme sayfası

- **Amaç:** Değişen dersler için başlık/hedef metinlerini yeniden yazmak ve açık L1 incelemesini başlatmak (KR-4).
- **Kapatır:** K5-03 (3/3) · K5-04 (1/2) · M-01 (veri tarafı) · **R:** değişmez.
- **Oku:** `texts.tr.json` yapısı (`review` alanları) · `tools/kao2-curriculum-build.mjs` inceleme sayfası üretimi ·
  `tests/kao/test_kao2_text_review.js` (L0 kuralları, yasak ifadeler) · `CLAUDE.md` "Language & tone".
- **Dokun:** `docs/kuran-ogreniyorum/kao2/content/texts.tr.json`, `tools/kao2-curriculum-build.mjs` (sayfa biçimi gerekiyorsa),
  `app/content/quranCurriculumV2.js`, `docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md`,
  `tests/kao/test_kao2_text_review.js`.
- **Adımlar:**
  1. Değişen ya da tutarlılık kapısına takılmış her ders için `title/goal` yeniden yazılır (sıcak, sen dili,
     emir yok, kısa; kategori adı içerikle aynı) → `review.level:"draft"`, `by:null`.
  2. **KR-4:** inceleme sayfası **tüm** ünite/ders/S0 metinlerini kutularla listeler; bugün `sourced` olup
     açık kutu onayı olmayan metinler "yeniden onay" bölümünde. Sayfa üstünde kullanıcıya talimat:
     "Onayladığın satırın kutusunu [x] yap; sonra 'L1 işaretlendi' yaz."
  3. L0 kapısı (yasak ifade, imlâ, elle Arapça yok) PASS; `draft` metin görünmez (güvenli başlık "Ünite N · Ders M").
- **Kabul:** text_review PASS · coherence PASS · sayfa üretildi. (Kullanıcı kapısı K2F-22'de.)
- **Commit:** `K2F-21: ders metinleri yeni dağılıma göre, açık L1 incelemesi başlatıldı`

---

#### K2F-22 · L1 onay taşıma (kullanıcı kapısı)

- **Amaç:** Yalnız kullanıcının işaretlediği metinleri `sourced` yapmak; `sourced` ⇔ işaretli kutu.
- **Kapatır:** K5-04 (2/2) · M-01 (veri) · **R:** değişmez.
- **Kullanıcı kapısı (P7):** `INCELEME-KAO2-17.md`'de en az bir `[x]` yoksa ya da kullanıcı "L1 işaretlendi"
  yazmadıysa `waiting_user` ile dur.
- **Oku:** `tests/kao/test_kao2_review_apply.js` (araç kullanımı) · `tools/kao2-curriculum-build.mjs --apply-review`.
- **Dokun:** `docs/kuran-ogreniyorum/kao2/content/texts.tr.json`, `app/content/quranCurriculumV2.js`,
  `docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md`, `tests/kao/test_kao2_review_apply.js`,
  `tests/kao/test_kao2_text_review.js`.
- **Adımlar:**
  1. **Kırmızı:** yeni kural testi: `review.level==='sourced'` olan her metin inceleme sayfasında işaretli
     kutuya karşılık gelir; işaretsiz olan `draft`'tır.
  2. `node tools/kao2-curriculum-build.mjs --apply-review --texts docs/kuran-ogreniyorum/kao2/content/texts.tr.json --sheet docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md`
     (araç yalnız insanın işaretlediğini taşır; `by:"owner"`, `at:` bugün).
  3. İşaretlenmemiş eski `sourced` metinler `draft`'a döner (KR-4).
  4. Sayılar KANIT'a: sourced/draft (ünite · ders · S0).
- **Kabul:** yeni kural PASS · L0 PASS · sourced ⇔ işaretli.
- **Commit:** `K2F-22: L1 onayı yalnız işaretli metinlere taşındı`

---

#### K2F-23 · Uygula 1/2 — örnek cümleler

- **Amaç:** Çapa metni olmayan derslerde "Uygula" adımının doğrulanmış örnek cümlelerle dolması (D-06).
- **Kapatır:** K3-01 · **R:** R-08 fail→pass.
- **Oku:** `quranLearnFlow.js` `applyWords` (≈103–119), `lessonPlan` apply (≈165) · `quranLearnViews.js`
  apply aşaması (≈238–244) · `quranLearn.js` apply modeli (≈1452–1456) · lexicon `examples` alanları.
- **Dokun:** `app/core/quranLearnFlow.js`, `app/core/quranLearnViews.js`, `app/core/quranLearn.js`, `app/kao.css`,
  `tests/kao/test_kao2_lesson_flow.js`.
- **Adımlar:**
  1. **Kırmızı:** 109 dersin 109'unda apply adımı içerikli (`words` ya da `sentences`); `examples` türü
     derste: dersin (önce yeni) lemmalarından doğrulanmış `examples[0]` taşıyan en çok 3 cümle
     `{lemmaId, ar, pronunciation, tr, ref}`; doğrulanmamış örnek hiç kullanılmaz; R-08.
  2. Flow apply öğesi `mode:'examples'` + `sentences`; görünüm cümleleri Arapça + okunuş + Türkçe + ref ile,
     "Bu dersin kelimesi: <okunuş>" satırıyla çizer (Arapça yalnız veriden).
  3. Hiçbir koşulda boş liste çizilmez; içerik yoksa test FAIL (adım sessizce atlanmaz).
- **Kabul:** R-08 PASS · lesson_flow PASS.
- **Commit:** `K2F-23: Uygula adımı her derste doğrulanmış örnek cümlelerle dolu`

---

#### K2F-24 · Uygula 2/2 — Ünite 2 namaz çapası

- **Amaç:** Namaz metinlerindeki `lp_*` kelimeleri öğretilen `l_*` lemmalarına bağlamak; Ünite 2'yi çapasına döndürmek.
- **Kapatır:** K3-02 · D-07 · **R:** değişmez.
- **Oku:** `QuranShortSurahsV1.supplements` ve `prayerTexts` (`node -e` ile yalnız alanlar) · lexicon `ar`/`root`
  alanları · `tools/kao2-curriculum-build.mjs` çapa işleyişi.
- **Dokun:** `tools/kao2-curriculum-build.mjs` (eşleme üretimi), `docs/kuran-ogreniyorum/kao2/content/prayer-lemma-map.json` (araç çıktısı),
  `docs/kuran-ogreniyorum/kao2/content/curriculum.spec.json` (u02 apply), `app/content/quranCurriculumV2.js`,
  `app/core/quranLearnFlow.js` (`applyWords` eşlemeyi kullanır), `tests/kao/test_kao2_lesson_flow.js`,
  `docs/kuran-ogreniyorum/kao2/inceleme/NAMAZ-ESLEME-L2.md` (eşleşmeyenler).
- **Adımlar:**
  1. **Kırmızı:** Ünite 2'de öğrenilen lemma, ilgili namaz metninde `known` görünür; u02 derslerinin apply'ı
     kendi namaz metnine (sübhâneke/tahiyyat/selam) bağlı; eşleşmeyenler listesi üretildi.
  2. Araç: `lp_*` kelimesi → `l_*` lemması **muhafazakâr belirlenimci** eşleme (harekesiz iskelet; yaygın önek
     ve zamir ekleri ayıklanmış tam eşitlik; birden çok aday → eşleme yok). Tahmin yok; eşleşmeyen liste L2'ye.
  3. `applyWords`: `lp_*` kelimenin durumunu eşlenen `l_*` lemmadan türetir.
- **Kabul:** lesson_flow (Ünite 2) PASS · eşleme bayt-eşit · eşleşmeyen listesi var.
- **Commit:** `K2F-24: namaz metni kelimeleri öğretilen lemmalara bağlandı, Ünite 2 çapası çalışır`

---

#### K2F-25 · Tanış kartı katmanları

- **Amaç:** Tanış kartına doğrulanmış örnek âyet ve katlanabilir "Neden böyle?" eklemek (D-01, 07 §4).
- **Kapatır:** K5-05 · K7-01 (karar kaydı) · **R:** değişmez.
- **Oku:** `quranLearnViews.js` intro aşaması (`lessonScreen`) · `quranLearn.js` intro modeli · lexicon
  `examples`, `examplesException`, `root`, `cognate` · `QuranGrammarV1.unit11.roots`.
- **Dokun:** `app/core/quranLearnViews.js`, `app/core/quranLearn.js`, `app/kao.css`, `tests/kao/test_kao2_lesson_flow.js`.
- **Adımlar:**
  1. **Kırmızı:** her tanış kartında okunuşu doğrulanmış `examples[0]` (Arapça + okunuş + Türkçe + ref);
     `<details>` "Neden böyle?": kök anlamı, unit11 türevleri (varsa), `cognate.shift` uyarısı;
     doğrulanmamış örnek hiç gösterilmez; ≤1 `.kao-primary`.
  2. D-12 "zaten biliyorsun" kognat turu: bu programda **ertelendi** — LEDGER `DECISION` kaydı (gerekçe:
     ayrı öğrenme akışı ve yeni ekran; kapsam dışı) ve K2F-41'de 04 kararı durumuna not.
- **Kabul:** lesson_flow tanış kontrolleri PASS · a11y PASS.
- **Commit:** `K2F-25: tanış kartında örnek âyet ve "Neden böyle?"`

---

#### K2F-26 · Sûre bağlamı kaldırma

- **Amaç:** Yeni bilgi taşımayan ve atfı yanlış 20 `contextTr`'yi kaldırmak (KR-5).
- **Kapatır:** M-02 (veri) · M-03 · **R:** değişmez.
- **Oku:** `texts.tr.json` `surahs` · araçta surahs işleyişi · okuyucu `kaoReaderContext` · `test_kao2_reader.js`,
  `test_kao2_kabul.js` A-5.
- **Dokun:** `docs/kuran-ogreniyorum/kao2/content/texts.tr.json`, `tools/kao2-curriculum-build.mjs`,
  `app/content/quranCurriculumV2.js`, `app/core/quranLearn.js` (bağlam okuma kaldırılır), `tests/kao/test_kao2_reader.js`,
  `tests/kao/test_kao2_kabul.js` (A-5 hedefi: "20/20 sûre tanıtımı: tema + yer + âyet sayısı").
- **Adımlar:**
  1. `surahs.*.contextTr` ve yanlış `review.sources` kaldırılır; okuyucu tanıtım kartı yalnız
     `QuranRevelationOrderV1`'den çizer (mevcut davranış).
  2. A-5 kontrolü: 20 kısa sûrenin 20'sinde tanıtım kartı tema/yer/âyet sayısını gösterir (render ile).
- **Kabul:** reader PASS · kabul A-5 gerçek ölçüm PASS · bütçe küçülür.
- **Commit:** `K2F-26: kaynaksız sûre bağlamı kaldırıldı, A-5 gerçek tanıtımı ölçer`

### W3 — Arayüz sözleşmesi

---

#### K2F-27 · Tek başlık çubuğu

- **Amaç:** Eski modal başlığını kaldırıp NavBar'ı tek üst çubuk yapmak (06 §2).
- **Kapatır:** K2-01 · O-01 · T-06 · T-07 · K2-07 (başlık kalıntıları) · **R:** değişmez.
- **Oku:** `quranLearn.js` `kaoOverlayHTML` (≈2998–3010; `kao-header` ≈3003) · `quranLearnViews.js`
  `navBar` (≈34), `renderScreen` (≈44) · `app/kao.css` ≈11–13 ve media blokları (`.kao-header`, `.kao-close`) ·
  CLAUDE.md "Modal keyboard contract".
- **Dokun:** `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/kao.css`, `tests/kao/test_kao2_navigation.js`,
  `tests/kao/test_kao2_design_contract.js`, `tests/kao/test_kao2_a11y.js`, etkilenen render testleri.
- **Adımlar:**
  1. **Kırmızı:** tüm görünümler (`openView` ile) için: tek üst çubuk (`kao-navbar`), `kao-header` yok,
     tek kapatma kontrolü (kökte NavBar "Kapat"; X yok); dialog `aria-labelledby` görünümün LargeTitle
     başlığına işaret eder ve o öğe var; Escape sözleşmesi korunur.
  2. Markup ve CSS'ten eski başlık/kapat düğmesi kaldırılır; LargeTitle'lara benzersiz id.
- **Kabul:** navigation/design_contract/a11y PASS · kontrast PASS.
- **Commit:** `K2F-27: tek başlık çubuğu, tek kapatma, doğru diyalog adı`

---

#### K2F-28 · Odak modu

- **Amaç:** Ders/tekrar ekranında yalnız ✕ + ince ilerleme çubuğu (05 §2, 06 FocusBar).
- **Kapatır:** K4-03 · **R:** değişmez.
- **Oku:** `quranLearnViews.js` `lessonScreen` (≈214) · `quranLearn.js` oturum görünümü (`session`) ve
  `kaoLesson('exit')` (≈1484) · `kaoTaskHTML` ilerleme çubuğu (≈1216).
- **Dokun:** `app/core/quranLearnViews.js`, `app/core/quranLearn.js`, `app/kao.css`, `tests/kao/test_kao2_lesson_flow.js`,
  `tests/kao/test_kao2_navigation.js`, `tests/kao/test_kao2_a11y.js`.
- **Adımlar:**
  1. **Kırmızı:** `session` görünümünde NavBar/LargeTitle yok; üstte `aria-label="Dersten çık"` ✕ düğmesi
     (≥44 px) + `role="progressbar"` ince çubuk; ✕ ilerlemeyi korur ve Bugün'e döner; odak soruya gider.
  2. Uygula; ekran başına ≤1 birincil korunur.
- **Kabul:** testler PASS.
- **Commit:** `K2F-28: ders ve tekrarda odak modu`

---

#### K2F-29 · Ayarlar 1/2 — gruplar ve Switch

- **Amaç:** Ayarları 06/KAO2-23 düzeninde ve gerçek Switch bileşeniyle yeniden kurmak.
- **Kapatır:** K2-02 · O-04 · T-22 · K6-03 (düzen) · **R:** değişmez.
- **Oku:** `quranLearn.js` `kaoSettingsHTML` (≈1755–1790) · `quranLearnViews.js` `groupedList` (≈71),
  `switchRow` (≈89) · `app/kao.css` `.kao-switch-*`, `.kao-toggle` · `test_kao2_settings.js`, `test_kao2_design_contract.js` (f).
- **Dokun:** `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/kao.css`, `tests/kao/test_kao2_settings.js`,
  `tests/kao/test_kao2_design_contract.js`, `tests/kao/test_kao_render.js` (E7 beklentileri, P2.4).
- **Adımlar:**
  1. **Kırmızı:** grup sırası: Günlük hedef (yeni kelime 5/10/15, niyet) · Ses (otomatik ses segment) ·
     Okuma (okunuş katmanı, harekeler, tekrarda soldur, satır aralığı, kelime boşluğu, renkli hareke, önizleme) ·
     Öğrenme (K2F-30) · Gölgeleme (switch + gizlilik footer) · Görünürlük (hub kartı) · Veri (CSV) ·
     "Hakkında ve kaynaklar ›". Tüm açık/kapalılar `switchRow` (`.kao-switch-track`, `role="switch"`,
     `aria-checked`, etiket değer içermez); "X: açık" metin düğmesi yok; tasarım sözleşmesi (f) switch
     **bileşenini** sınar.
  2. Mevcut ayar handler'ları yeniden kullanılır (yeni handler yok); HTML Views'ta.
- **Kabul:** settings/design_contract/render PASS.
- **Commit:** `K2F-29: Ayarlar gruplu liste ve gerçek anahtarlarla`

---

#### K2F-30 · Ayarlar 2/2 — otomatik geç, başlangıç noktası

- **Amaç:** Eksik ayarları eklemek: "Doğruda otomatik geç" ve "Başlangıç noktasını değiştir".
- **Kapatır:** K2-06 · K6-03 · K7-03 · **R:** değişmez.
- **Oku:** `settings.autoAdvance` kullanımı (≈1317) · `kaoOnboard` (≈2819; adım yapısı) · onboarding
  `minutes`/`dailyNew` eşlemesi · P8.
- **Dokun:** `app.js` (tek shim `kaoToggleAutoAdvance`), `app/core/quranLearn.js`, `app/core/quranLearnViews.js`,
  P8 pin dosyaları, `tests/kao/test_kao2_settings.js`, `tests/kao/test_kao2_onboarding.js`,
  `tests/kao/test_kao2_feedback.js`, `kao2-duzeltme/FIX-STATE.json` (`pins`).
- **Adımlar:**
  1. **Kırmızı:** (a) "Öğrenme" grubunda "Doğruda otomatik geç" switch'i → `App.kaoToggleAutoAdvance()`
     `settings.autoAdvance`'i çevirir; açıkken doğru cevaptan 900 ms sonra devam (mevcut mantık);
     (b) "Başlangıç noktasını değiştir" → `kaoOnboard('change-start')` ilk açılışın 2. adımını açar,
     ilerleme/kart/günlük verisini **değiştirmez**, yalnız `onboarding.start`'ı günceller;
     (c) ilk açılış öncesi `onboarding.minutes` ile `settings.dailyNew` tutarlı (08 §1 eşlemesi) — varsayılanları hizala.
  2. `App.kaoToggleAutoAdvance` (P8): 44→45 · 765→766 · 603→604.
- **Kabul:** settings/onboarding/feedback PASS · pinler ölçülmüş.
- **Commit:** `K2F-30: otomatik geçiş anahtarı ve başlangıç noktasını değiştirme`

---

#### K2F-31 · Süre ölçümü ve tahmini

- **Amaç:** Gerçek görev süresinin kaydı ve görev sayısına dayalı süre tahmini (05 §4, P10 "sahte süre yok").
- **Kapatır:** K3-03 · K3-09 ("0 tekrar" metni) · **R:** değişmez.
- **Oku:** `quranLearnFlow.js` `estimateMinutes` (≈197–207), `lessonStep` (≈238–246) · `quranLearn.js`
  `kaoAnswer` (≈1306/1521; `kaoTaskStartedAt`).
- **Dokun:** `app/core/quranLearnFlow.js`, `app/core/quranLearn.js`, `tests/kao/test_kao2_next_step.js`,
  `tests/kao/test_kao2_today.js`, `tests/kao/test_kao2_hub.js`, `tests/kao/test_kao_state_budget.js` (gerekirse).
- **Adımlar:**
  1. **Kırmızı:** (a) cevapta `daily[today].ms += clamp(şimdi − kaoTaskStartedAt, 0, 120000)`;
     (b) `lessonStep` dakikası = tahmin(görev sayısı = tekrar + tanış + alıştırma + uygula) — 17 adımlık
     ders "~2 dk" değil; (c) ölçülmüş `ms` varsa ortalama kullanılır; (d) tekrar 0 ise alt satır
     "N yeni kelime · ~M dk" ("0 tekrar" yazılmaz); Bugün/hub/özet aynı hesap.
  2. Durum bütçesi (`test_kao_state_budget.js`) yeşil kalır.
- **Kabul:** testler PASS.
- **Commit:** `K2F-31: gerçek süre kaydı ve görev sayısına dayalı tahmin`

---

#### K2F-32 · İlerleme ekranı başlığı ve kalibrasyon

- **Amaç:** İlerleme ekranının kendi başlığı ve teknik tablonun katlanması.
- **Kapatır:** K6-04 · **R:** değişmez.
- **Oku:** `quranLearn.js` `kaoStatsHTML` (≈2348–2360) ve kalibrasyon bölümü.
- **Dokun:** `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `tests/kao/test_kao2_progress.js`.
- **Adımlar:** **Kırmızı:** LargeTitle "İlerleme" (eski "İstatistik / Tutunma ve kalibrasyon" yok);
  R-bandı kalibrasyon tablosu `<details>` içinde, kapalı başlar, özeti tek cümle. → uygula.
- **Kabul:** progress PASS.
- **Commit:** `K2F-32: İlerleme başlığı ve katlanan kalibrasyon ayrıntısı`

---

#### K2F-33 · Kelime detayı ders bağlantısı

- **Amaç:** Kelime detayında kelimenin kendi dersini göstermek ve oraya götürmek.
- **Kapatır:** K6-05 · **R:** değişmez.
- **Oku:** `quranLearn.js` `kaoWordHTML` (≈873; "Bulunduğun yer" ≈861) · `QuranCurriculumV2.lemmaToLesson`.
- **Dokun:** `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `tests/kao/test_kao2_word.js`.
- **Adımlar:** **Kırmızı:** "Bu kelimenin dersi: Ünite N · <ders başlığı>" (`lemmaToLesson`'dan);
  "Derse git" `kaoNav('unit', unitId)`; `lemmaToLesson`'da olmayan lemma için satır gizli. → uygula.
- **Kabul:** word PASS.
- **Commit:** `K2F-33: kelime detayı kendi dersine bağlanır`

---

#### K2F-34 · Yerleştirme şıkları

- **Amaç:** Yerleştirme okuma sorularının şık uzunluğundan tahmin edilememesi (Y-13).
- **Kapatır:** K5-06 · **R:** değişmez.
- **Oku:** `quranLearn.js` `kaoPlacementTasks` (≈2732), `kaoGateTasks`.
- **Dokun:** `app/core/quranLearn.js`, `tests/kao/test_kao2_onboarding.js`.
- **Adımlar:** **Kırmızı:** her okuma sorusunda doğru şık, uzunluk sıralamasında tek başına en kısa ya da
  en uzun değildir ve şıkların okunuş uzunlukları ±2 karakter bandındadır (havuz yetmiyorsa en yakın);
  belirlenimci. → çeldiricileri aynı havuzdan uzunluk-dengeli seç.
- **Kabul:** onboarding PASS · yerleştirme kararı (≥7/8) davranışı aynı.
- **Commit:** `K2F-34: yerleştirme çeldiricileri uzunluk dengeli`

---

#### K2F-35 · Küçük metin ve etiket düzeltmeleri

- **Amaç:** Kalan küçük tutarsızlıkları kapatmak.
- **Kapatır:** K4-04 · K3-09 · **R:** değişmez.
- **Oku:** hub halkası (`kaoHubCardHTML` ≈2886, Views `progressRing`) · ünite ekranı kelime sayısı etiketi ·
  `kaoMilestoneLabel` (`namaz`) · `tests/kao/test_kao2_onboarding.js` başlık/özet satırı.
- **Dokun:** `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `tests/kao/test_kao2_hub.js`,
  `tests/kao/test_kao2_path.js`, `tests/kao/test_kao2_milestones.js`, `tests/kao/test_kao2_onboarding.js`.
- **Adımlar:** **Kırmızı →** (a) halka metni "%20" (Türkçe yüzde); (b) ünite ekranı "x / y kalıcı kelime ·
  a / b ders"; (c) `namaz` taşı etiketi gerçek kapsamı söyler (ör. "Namazda geçen N kelime"); (d) test
  başlıkları gerçek sayı ve doğru kart numarası (onboarding handler sayısı, "KAO2-11 onboarding").
- **Kabul:** testler PASS.
- **Commit:** `K2F-35: yüzde, ünite ve taş etiketleri düzeltildi`

### W4 — Ölçüm ve test sağlamlığı

---

#### K2F-36 · Kabul testi gerçek ölçüm

- **Amaç:** A-1…A-10'u gerçekten ölçen kabul testi (totoloji, dosya sayımı, regex sayımı yok).
- **Kapatır:** K6-01 · K2-04 · K2-05 · M-02 (ölçüm) · **R:** değişmez.
- **Oku:** `tests/kao/test_kao2_kabul.js` (bölüm bölüm) · `archive/kuran-ogreniyorum-v2/09-YOL-HARITASI.md` §2.
- **Dokun:** `tests/kao/test_kao2_kabul.js`, `kao2-duzeltme/evidence/K2F-36/A-KABUL.md` (`KAO2_EVIDENCE_OUT` ile).
- **Adımlar:**
  1. A-1: ilk açılış akışını handler'larla sür, dokunuşları say (level1 ve s0 yolları). A-2: 109 dersin
     tamamı. A-3: tüm görünümler `openView` ile × {boş, tohumlu, panel açık} + ders oynatıcı, yol, ünite,
     özet, ilk açılış, S0 aşamaları, ustalık. A-4: 7 durum × **beklenen tür** eşlemesi + 12 ünite
     simülasyonu. A-5: 524/25 + 20 sûre tanıtımı + gramer görevi 0 ihlal. A-6: eski veri derin eşit +
     v1 kullanıcı ilerleyebilir. A-7: sözleşme + kontrast + tek üst çubuk + switch bileşeni. A-8: gerçek
     `kaoContinue`. A-9: aileleri **çalıştırır** (alt süreç, çıkış kodu). A-10: runtime/css/içerik/p95 hepsi koşulda.
  2. **Mutasyon kanıtı** (commit edilmez): `$TMPDIR` kopyasında masteryAt yazımını kaldır → A-4 FAIL;
     S0 yönlendirmesini boz → A-1(s0) FAIL. Sonuçları KANIT'a yaz.
  3. `KAO2_EVIDENCE_OUT=kao2-duzeltme/evidence/K2F-36/A-KABUL.md node tests/kao/test_kao2_kabul.js`.
- **Kabul:** kabul testi PASS · her satır gerçek değer · mutasyon kanıtı kayıtlı.
- **Commit:** `K2F-36: kabul ölçütleri gerçekten ölçülüyor`

---

#### K2F-37 · a11y ve tasarım sözleşmesi matrisi

- **Amaç:** Erişilebilirlik ve tasarım testlerinin tüm ekranları gerçekten kapsaması.
- **Kapatır:** K6-02 · K2-05 · **R:** değişmez.
- **Oku:** `tests/kao/test_kao2_a11y.js` (VIEWS, ≈49) · `tests/kao/test_kao2_design_contract.js`.
- **Dokun:** `tests/kao/test_kao2_a11y.js`, `tests/kao/test_kao2_design_contract.js`, KAO dosyaları (yalnız
  testin bulduğu a11y/tasarım hatalarını düzeltmek için), `docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs` (yeni çiftler gerekiyorsa).
- **Adımlar:** Görünüm listesi Flow `VIEWS`'tan türetilir (tekrarsız); her görünüm `openView` ile; ek ekranlar:
  ders oynatıcı (her aşama), odak modu, ilk açılış adımları, özet, ustalık, S0 aşamaları, kaynaklar alt
  sayfası, kökler. Tüm a11y kuralları (ad, odak, aria-live, aria-current, lang/dir, min-height, 44 px,
  kontrast) ve `primaryPerView ≤1` bu matriste. Bulunan hatalar düzeltilir.
- **Kabul:** a11y/design_contract PASS · matris boyutu KANIT'ta.
- **Commit:** `K2F-37: a11y ve tasarım sözleşmesi tüm ekranları kapsar`

---

#### K2F-38 · Denetim kontrolleri kalıcı fixture

- **Amaç:** `tekrar-uret.cjs`'nin 10 kontrolünü kalıcı KAO fixture'ı yapmak.
- **Kapatır:** (denetim kalıcılığı) · **R:** değişmez.
- **Oku:** `kao2-duzeltme/denetim/tekrar-uret.cjs`.
- **Dokun:** `tests/kao/test_kao2_denetim.js` (yeni), `tests/kao/README.md`.
- **Adımlar:** Aynı 10 kontrol `kao-harness` ile; beklenen: R-01…R-10 hepsi PASS (R-08 K2F-23'ten beri).
  `tekrar-uret.cjs` tarihsel kayıt olarak kalır.
- **Kabul:** test PASS (10/10).
- **Commit:** `K2F-38: denetim kontrolleri kalıcı fixture`

### W5 — Temizlik, kayıtlar, kapanış

---

#### K2F-39 · CSS ve ölü kod temizliği

- **Amaç:** Öksüz seçicileri, degrade kalıntılarını ve ölü adları kaldırmak.
- **Kapatır:** K3-04 · K6-07 · M-13 · K2-07 · **R:** değişmez.
- **Oku:** rapor K3-04 seçici listesi · `app/kao.css` · `tests/kao/test_kao_render.js` ≈388–396 ·
  `docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs` ≈120–130 (`HOME`).
- **Dokun:** `app/kao.css`, `app/core/quranLearn.js` (`kao-audio-pending`), `tests/kao/test_kao_render.js`,
  `docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs`, `tests/kao/test_kao2_design_contract.js`.
- **Adımlar:**
  1. **Kırmızı:** yeni kontrol: `kao.css`'teki her sınıf seçicisi KAO işaretlemesinde (Views + motor) kullanılır
     (izinli istisnalar gerekçeli liste); `linear-gradient` yok; `kao-audio-pending` yok.
  2. Sil; `test_kao_render.js` ≈392'deki ölü seçici zorunluluğunu kaldır (P2.4); kontrast aracının `HOME` hedefi
     gerçek Bugün yüzeyine.
- **Kabul:** yeni kontrol PASS · kontrast PASS · `kao.css` gzip küçüldü (KANIT'ta önce/sonra).
- **Commit:** `K2F-39: öksüz CSS, degrade ve ölü sınıf adları temizlendi`

---

#### K2F-40 · K-2 katman tamamlama

- **Amaç:** Şık HTML'ini Views bileşenine taşıyıp kopyayı kaldırmak (davranış aynı).
- **Kapatır:** K2-03 · **R:** değişmez.
- **Oku:** `quranLearn.js` `kaoTaskHTML` şık döngüsü (≈1229–1250) · `quranLearnViews.js` `choice` (≈103).
- **Dokun:** `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `tests/kao/test_kao2_components.js`.
- **Adımlar:** Önce 6 görev türü (meaning, arabic, audio, grammar, order, fragment) × {cevapsız, doğru, yanlış}
  HTML dökümünü `$TMPDIR`'e al; şıkları `Views.choice` ile kur; sonra aynı dökümler **bayt-eşit** ya da
  yalnız sınıf sırası farkı (KANIT'ta diff). Bileşen testi genişler.
- **Kabul:** dökümler eşit · tüm aileler yeşil · runtime bütçesi içinde.
- **Commit:** `K2F-40: şık HTML'i Views bileşeninden`

---

#### K2F-41 · Kayıtlar ve yönlendirme belgeleri

- **Amaç:** Belgelerdeki yanlış anlatıları düzeltmek; arşive tek düzeltme notu.
- **Kapatır:** M-01 (belge) · M-04 · M-05 · M-06 · M-07 · M-08 · M-09 · M-12 · K3-07 (belge) · K3-08 · K6-06 ·
  K7-01/K7-02 (karar kaydı) · **R:** değişmez.
- **Oku:** rapor §4–§8 · `CLAUDE.md` ve `AGENTS.md` KAO2 satırları (grep) · `tests/kao/README.md`.
- **Dokun:** `archive/kuran-ogreniyorum-v2/DUZELTME-NOTU.md` (yeni; arşivdeki tek değişiklik),
  `archive/README.md` (tek satır), `tests/kao/README.md`, `CLAUDE.md`, `AGENTS.md`.
- **Adımlar:**
  1. `DUZELTME-NOTU.md`: arşivdeki belgelerin yanlış/bayat ifadeleri ve doğruları (M-01 onay durumu;
     M-04 KAO2-A/hazırlık commitleri; M-05 tek commit ihlalleri; M-06 STATE alanları; M-07; M-08 doğru
     bulgu kimlikleri + tam eşleme; M-09; M-12 eksik yayın kanıtları; K3-07 gerçek ünite dağılımı; K3-08
     gerçek handler geçmişi; 04 D-12/D-21 durumu). Arşivdeki diğer dosyalar **değişmez**.
  2. `tests/kao/README.md`: tüm `test_kao2_*` (yeni olanlar dahil) tek satırla; envanter gerçek dosya listesine
     eşit (bir kontrolle doğrula).
  3. `CLAUDE.md` + `AGENTS.md` (ikisi aynı metin): KAO2 satırı arşiv yolu + doğru onay durumu; KAO2-FIX
     satırı güncel durumla (P5: yorum/handler tuzakları yok).
- **Kabul:** CLAUDE/AGENTS KAO satırları aynı · README envanteri = gerçek dosya listesi.
- **Commit:** `K2F-41: arşiv düzeltme notu, test envanteri ve yönlendirme belgeleri`

---

#### K2F-42 · Kapanış regresyonu ve kapanış belgesi

- **Amaç:** Tüm programın doğrulanması ve kapanış belgesi.
- **Kapatır:** kapanış doğrulaması (49/49) · **R:** 10/10 beklenir.
- **Oku:** tüm `kao2-duzeltme/evidence/K2F-*/KANIT.md` "Ölçümler" · rapor §0 tablo.
- **Dokun:** `kao2-duzeltme/deliverables/KAO2-FIX-KAPANIS.md` (yeni), `kao2-duzeltme/README.md` (durum satırı),
  `kao2-duzeltme/evidence/K2F-42/`.
- **Adımlar:**
  1. `kapilar.sh` YEŞİL · `tekrar-uret` **10/10** · kabul testi (`KAO2_EVIDENCE_OUT` ile) · plan-check 0.
  2. Kapanış belgesi: 49 bulgu → prompt → kanıt dosyası → durum tablosu; D-01…D-21 ve A-1…A-12 son durumu;
     kanıt düzeyleri ayrı (kaynak/test · yayın · cihaz); kullanıcıda kalanlar (cihaz kabulü, ekran okuyucu
     turu, L2 listeleri, K-3 kayıtları, D-12 ertelenen karar).
- **Kabul:** hepsi yeşil · belge var · sync PASS. (Program `completed` K2F-43'te olur.)
- **Commit:** `K2F-42: kapanış regresyonu ve kapanış belgesi`

---

#### K2F-43 · YAYIN-2 (kullanıcı onay kapısı)

- **Amaç:** Programın tamamını kullanıcı onayıyla canlıya almak ve programı kapatmak.
- **Kullanıcı kapısı (P7):** kapanış belgesinin özetiyle açık yanıt iste: `YAYIN-2 onaylı` ya da `YAYIN-2 ertele`.
- **Adımlar:** K2F-18'in adımlarıyla aynı (yeni pin, tek commit, ff-only, Pages izleme, bayt-eşitlik,
  gizlilik 404). Ertelenirse yayın yapılmaz, kayıt düşülür. Her iki durumda son olarak STATE
  `status:"completed"`, `nextPrompt:null`; CURRENT-STATE `nextPrompt: none`; LEDGER son kaydı `- next: none`.
- **Kabul:** yayın kanıtı (ya da erteleme kaydı) · sync PASS (`completed`).
- **Commit:** `K2F-43: YAYIN-2 — KAO2-FIX canlıda, program kapandı` ya da `K2F-43: program kapandı (yayın ertelendi)`

---

## §3 · Bulgu → prompt eşlemesi (49/49)

| Bulgu | Prompt | | Bulgu | Prompt |
|---|---|---|---|---|
| K4-01 | K2F-05…08 | | K3-01 | K2F-23 |
| K4-02 | K2F-09…11 | | K3-02 | K2F-24 |
| K5-01 | K2F-15 | | K3-03 | K2F-31 |
| K5-02 | K2F-12…14 (+15) | | K3-04 | K2F-39 |
| K5-03 | K2F-19…21 | | K3-05 | K2F-16 |
| K5-04 | K2F-21, 22 | | K3-06 | K2F-16 |
| M-01 | K2F-21, 22, 41 | | K3-07 | K2F-20, 41 |
| M-02 | K2F-26, 36 | | K3-08 | K2F-41 |
| M-03 | K2F-26 | | K3-09 | K2F-31, 35 |
| M-04 | K2F-41 | | K4-03 | K2F-28 |
| M-05 | K2F-41 (+P4 kuralı) | | K4-04 | K2F-11, 35 |
| M-06 | K2F-41 | | K5-05 | K2F-25 |
| M-07 | K2F-41 | | K5-06 | K2F-34 |
| M-08 | K2F-41 | | K6-01 | K2F-36 |
| M-09 | K2F-41 | | K6-02 | K2F-02, 37 |
| M-10 | K2F-01 | | K6-03 | K2F-29, 30 |
| M-11 | K2F-04 | | K6-04 | K2F-32 |
| M-12 | K2F-41 | | K6-05 | K2F-33 |
| M-13 | K2F-39 | | K6-06 | K2F-41 |
| K2-01 | K2F-27 | | K6-07 | K2F-39 |
| K2-02 | K2F-29 | | K7-01 | K2F-25, 41 |
| K2-03 | K2F-40 | | K7-02 | K2F-41 |
| K2-04 | K2F-36 | | K7-03 | K2F-30 |
| K2-05 | K2F-36, 37 | | | |
| K2-06 | K2F-30 | | | |
| K2-07 | K2F-27, 39 | | | |

**R → prompt (PASS'e döndüğü yer):** R-09 K2F-02 · R-10 K2F-04 · R-01/R-02 K2F-06 · R-03 K2F-10 ·
R-05 K2F-12 · R-06 K2F-13 · R-04 K2F-15 · R-07 K2F-16 · R-08 K2F-23. PASS sayısı hiçbir promptta azalmaz.

## §4 · Pin ve handler zaman çizelgesi

| Prompt | Değişiklik | App.kao* | App yüzeyi | Atama | Yayın pini |
|---|---|---:|---:|---:|---|
| başlangıç | — | 42 | 763 | 601 | 20260930l |
| K2F-12 | + `kaoS0` | 43 | 764 | 602 | — |
| K2F-16 | + `kaoSetIntent` | 44 | 765 | 603 | — |
| K2F-18 | YAYIN-1 | 44 | 765 | 603 | yeni pin |
| K2F-30 | + `kaoToggleAutoAdvance` | 45 | 766 | 604 | — |
| K2F-43 | YAYIN-2 | 45 | 766 | 604 | yeni pin |

Değerler **plan**dır; gerçek değerler her promptta ölçülür ve `FIX-STATE.json.pins`'e yazılır
(`fix-sync-check` `kaoHandlers` ve yayın pinini doğrudan koddan denetler).
