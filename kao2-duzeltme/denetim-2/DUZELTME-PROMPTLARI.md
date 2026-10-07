# KAO2-FIX · denetim-2 düzeltme promptları (D2F-00…D2F-13)

**Kaynak:** [`DENETIM-RAPORU.md`](DENETIM-RAPORU.md) (bağımsız kapanış denetimi, 2026-10-06) · **Yeniden üretme:**
[`tekrar-uret-2.cjs`](tekrar-uret-2.cjs) (başlangıç 0/9 → hedef 9/9) · **Önek:** `D2F-NN:` · **14 prompt, 5 dalga.**
Bu dosya **ne** yapılacağını söyler; **neden** için raporun §3 (49 bulgu), §4 (prompt uyumu), §6 (sapmalar) ve §7
(D2-01…D2-12) bölümlerine bakın.

Denetim, KAO2-FIX'in kodunun büyük ölçüde doğru olduğunu ama **sürecin** (tek oturum / tek commit / yayın kapısı /
onay kaydı) delindiğini gösterdi. Bu yüzden bu programın ilk kuralı, eski programın hatalarını **tekrarlamamaktır**:
§1'deki farklar KAO2-FIX `PROMPTLAR.md` §1'in **üstüne** gelir ve onunla çelişirse bu dosya kazanır.

---

## §0 · Oturum başlatıcı (her yeni oturuma aynen yapıştır)

```text
Şeyma deposunda "KAO2-FIX denetim-2 düzeltmeleri" (D2F) programına devam et. Klasör: kao2-duzeltme/denetim-2/.

Kod yazmadan önce sırayla:
1) CLAUDE.md "DATA SAFETY" bölümünü oku: tarayıcı açma, sunucu başlatma, mustafaras/seyma-data'ya yazma YOK.
   Doğrulama yalnız headless Node (node:vm) fixture'larıyla.
2) kao2-duzeltme/denetim-2/D2F-STATE.json → nextPrompt. (D2F-00'da dosya henüz yok: D2F-00 bölümünü uygula.)
3) kao2-duzeltme/denetim-2/CURRENT-STATE.md ve LEDGER.md'nin yalnız son 3 kaydı.
4) node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --clean → PASS (D2F-00 öncesi yok).
5) kao2-duzeltme/denetim-2/DUZELTME-PROMPTLARI.md §1'in tamamı + YALNIZ nextPrompt bölümü.
6) KAO2-FIX PROMPTLAR.md §1 (P1–P14) — §1 farklarıyla birlikte geçerli.

Yalnız nextPrompt'u yürüt. Bu oturumda ikinci prompta GEÇME; kullanıcı "devam" dese bile commit et ve yeni oturum öner.
Tek commit (yayın promptunda en çok iki: kapı + yayın). Ek iş çıkarsa yapma: LEDGER NOTE + yeni prompt önerisi.
Onayı asla çıkarma: kullanıcı kapısında yalnız §1.F'deki birebir cümle kabul edilir.
```

---

## §1 · Protokol farkları (KAO2-FIX P1–P14'ün üstüne)

**A · Oturum ve commit.** Bir oturum = bir prompt = bir commit. İzinli tek istisna yayın promptu D2F-12 (kapı commit'i +
yayın commit'i). "Ek tur", "ara durum", "kayıt düzeltmesi", ayrı "yayın kaydı" commit'i **yok**; kayıtlar aynı commit'e
girer. Commit'ten sonra bir hata görülürse düzeltmez, LEDGER `NOTE` + `next` satırına yeni prompt önerisi yazarsın.
KANIT başlığına `Oturum: <Claude-Session URL'si>` satırı zorunlu; `d2f-sync-check` iki promptun aynı oturumu
paylaşmasını reddeder (D2F-08'den sonra).

**B · Kapsam.** Yalnız promptun **Dokun** listesi + `kao2-duzeltme/denetim-2/`. Listede olmayan dosya → P6 BLOCKED
(gerekçeyle KANIT'a yazıp devam etmek yok). KAO2 dışı yüzeylere (ana uygulama sekmeleri, panel, panel-v2) dokunulmaz;
D2F-12'deki pin satırı tek istisnadır.

**C · Yayın.** `?v=`, `sw.js` sürümleri ve pin testleri **yalnız D2F-12'de** değişir. "Erken yayın" istense bile yapılmaz:
kullanıcıya bunun programın tek yayın noktası olduğu söylenir; ısrar ederse P6 BLOCKED + LEDGER `DECISION` ve program
sırası değişmeden D2F-12'ye kadar beklenir. `main` geçmişi yeniden yazılmaz, force-push yok.

**D · Kapılar.** `bash kao2-duzeltme/tools/kapilar.sh` her promptta **tam** koşar (bu konteynerde ≈12 dk; D2F-01'den sonra
yavaş-makine kipiyle yeşil biter). "Eşdeğer paralel koşu" kabul edilmez. Koşu sürerken çalışma ağacı değiştirilmez
(`git stash` dahil). Sonuç satırları KANIT'a olduğu gibi kopyalanır. Ayrıca:
`node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs` (PASS sayısı azalmaz) ve `node kao2-duzeltme/denetim/tekrar-uret.cjs` (10/10 kalır).

**E · Testler.** Önce kırmızı (P2). Kırmızı, değişiklik öncesi kodla **gerçekten** koşulup ilk anlamlı satırı KANIT'a
yazılır. Davranış testi zayıflatılmaz; kontrol testleri (R-xx, N-xx) için en az bir **mutasyon kanıtı** (scratchpad
kopyasında düzeltmeyi geri al → test FAIL) KANIT'a yazılır. `masteryAt` ya da yığın elle kurulmaz (P2.5).

**F · Kullanıcı kapıları (birebir cümleler).** Kapı promptu P7'yi tam uygular: `waiting` commit'i + LEDGER `GATE status:
waiting` (beklenen cümle yazılı) → oturum durur → yeni oturumda yanıt gelir → LEDGER `GATE status: closed` (yanıt aynen
alıntılanır) → kalan adımlar. Kabul edilen yanıtlar yalnız şunlardır; başka her ifade ("tamam", "canlıya al", "devam",
oturum başındaki genel talimat) kapıyı **kapatmaz**, kullanıcıya birebir cümle tekrar sorulur:

| Kapı | Kabul edilen cümleler |
|---|---|
| D2F-10 L1 | `L1 kararı: A` · `L1 kararı: B` · `L1 kararı: C` **ve** `u09.01: 1` · `u09.01: 2` · `u09.01: <kendi başlık/hedef metnin>` |
| D2F-12 yayın | `YAYIN-3 onaylı` · `YAYIN-3 ertele` |
| D2F-13 canlı doğrulama | betik çıktısının kendisi (yapıştırılmış `EŞİT/FARKLI` ve `404` satırları) · `canlı doğrulama yok` |

**G · Kayıtlar.** Program kayıtları `kao2-duzeltme/denetim-2/` altındadır: `D2F-STATE.json`, `CURRENT-STATE.md`
(her prompt sonunda **baştan** yazılır, "Canlı gerçekler" o oturumda araçla ölçülür ve tarihlenir), `LEDGER.md` (yalnız
ekleme; P12 biçimi, önek D2F), `evidence/D2F-NN/KANIT.md` (P11 şablonunun **tüm** bölümleri + `Oturum:` satırı).
KAO2-FIX'in kendi kayıtlarına (FIX-STATE, `.anti-amnesia/`, `evidence/K2F-*`) yalnız D2F-09 yazar.

**H · Arapça ve metin.** P9 aynen: Arapça yalnız içerik modülleri/araç çıktısından. Yeni ya da değişen Türkçe metin
`review.level:"draft"` ile başlar; `sourced` yalnız D2F-10 kapısında kullanıcının birebir cümlesiyle olur.

---

## §2 · Promptlar

### Dalga A — Altyapı

#### D2F-00 · Program iskeleti ve taban ölçüm

- **Amaç:** D2F kayıt düzenini kurmak, taban ölçümü almak.
- **Kapatır:** — · **N:** değişmez (0/9).
- **Önkoşul:** `git rev-parse --short HEAD` = `fad6f2ae` (ya da onu içeren dal); `git status` temiz. Değilse P6.
- **Oku:** `DENETIM-RAPORU.md` §1, §2, §7 · `kao2-duzeltme/tools/fix-sync-check.mjs` (yapı örneği) · KAO2-FIX `PROMPTLAR.md` §1.
- **Dokun:** `kao2-duzeltme/denetim-2/{D2F-STATE.json, CURRENT-STATE.md, LEDGER.md, tools/d2f-sync-check.mjs, evidence/D2F-00/KANIT.md}`.
- **Adımlar:**
  1. `D2F-STATE.json`: `program`, `status:"active"`, `baseCommit` (HEAD), `nextPrompt`, `prompts{D2F-00…13: {title, status, evidence, session}}`,
     `n` (N-01…N-09 → `"fail"`), `pins` (ölçülerek: App.kao* 45 · yüzey 766 · atama 604 · onclick 393 · yayın 20261006e), `userGates`.
  2. `d2f-sync-check.mjs` (salt-okur, ağsız): STATE ↔ CURRENT-STATE `d2f-sync` bloğu ↔ LEDGER son seq ↔ koddaki pinler;
     `--clean` ağaç temiz; `--repro` `tekrar-uret-2.cjs` sonucunu STATE `n` ile karşılaştırır (STATE "pass" diyorsa koşu da PASS olmalı).
  3. Taban: `bash kao2-duzeltme/tools/kapilar.sh` (tam; bugün yalnız `test_kao2_kabul`/`test_kao2_perf_budget` kırmızı beklenir),
     `tekrar-uret-2` 0/9, `tekrar-uret` 10/10 → KANIT.
- **Kabul:** sync PASS · taban KANIT'ta · tek commit · ağaç temiz.
- **Commit:** `D2F-00: denetim-2 düzeltme programı başladı, taban ölçüm`

#### D2F-01 · Kapı araçları: plan-check ve yavaş-makine kipi

- **Amaç:** Kapıların bu konteynerde **dürüstçe yeşil** bitebilmesi ve plan-check istisnasının daraltılması.
- **Kapatır:** D2-12 (araç kısmı) · rapor §5 · **N:** değişmez.
- **Oku:** `docs/kuran-ogreniyorum/tools/kao-plan-check.mjs` ≈25–50 (`KAO_SUBJECT_RE`) ve self-test dosyası · `git show 5b267dde` ·
  `kao2-duzeltme/tools/kapilar.sh` · `tests/kao/test_kao2_kabul.js` A-10 (≈420–440) · `tests/kao/test_kao2_perf_budget.js` ≈36–66.
- **Dokun:** `docs/kuran-ogreniyorum/tools/kao-plan-check.mjs`, `docs/kuran-ogreniyorum/tools/kao-plan-check.test.mjs`,
  `kao2-duzeltme/tools/kapilar.sh`, `tests/kao/test_kao2_perf_budget.js`.
- **Adımlar:**
  1. **Kırmızı (self-test):** (a) `D2F-03: …` KAO dosyasına dokunursa kabul; `D2F-3:`/`D2FX-03:` red. (b) `K2F-38 ek:` önekli
     yalnız `65e94db2` kabul; **başka** bir `K2F-NN ek:` commit'i red (bugün kabul ediliyor → kırmızı).
  2. Regex: `(?: ek)?` genel izni kaldır; tek hash istisnası listesi (`KNOWN_PREFIX_EXCEPTIONS = {'65e94db2': '…gerekçe…'}`).
     `D2F-(?:0\d|1[0-3])` tanıt.
  3. `kapilar.sh`: `KAO2_ACCEPT_SLOW_HOST=1` ortamı verilirse onu kabul testine **geçirir** ve perf'i ayrı satırda
     "GÖRELİ BANT ATLANDI (yavaş makine)" diye yazar; mutlak kapılar (içerik ≤256, runtime ≤128, css ≤14, p95 ≤40) aynen zorunlu.
     Bayraksız davranış değişmez (varsayılan katı).
  4. `test_kao2_perf_budget.js`: aynı bayrakla yalnız göreli bant atlanır, ve atlandığı stdout'a yazılır (sessiz geçiş yok).
     Mutasyon kanıtı: runtime tavanını aşan sahte dosyayla bayraklı koşu FAIL.
  5. `KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` → **SONUÇ: TÜM KAPILAR YEŞİL**; bayraksız koşu da KANIT'ta.
- **Kabul:** self-test PASS (yeni durumlar dahil) · plan-check PASS · bayraklı `kapilar.sh` çıkış 0 · bayraksız fark yalnız göreli perf.
- **Commit:** `D2F-01: plan-check istisnası tek hash'e daraldı, kapılar yavaş makinede dürüstçe yeşil`

### Dalga B — Kullanıcıya görünen kusurlar

#### D2F-02 · "Kelime dizme"de aynı etiketli çipler

- **Amaç:** Görünürde doğru sıranın her zaman doğru sayılması.
- **Kapatır:** D2-01 · **N:** N-01 fail→pass.
- **Oku:** `app/core/quranLearn.js` `kaoAnswer` order yolu (≈2160–2180; `selected.ordinal===index` ≈2173),
  `kaoGrammarTaskValid` dizme dalı (≈1604–1607), `kaoTaskHTML` geri bildirim (≈1739) · `tekrar-uret-2.cjs` N-01.
- **Dokun:** `app/core/quranLearn.js`, `tests/kao/test_kao2_grammar_tasks.js`.
- **Adımlar:**
  1. **Kırmızı:** u08.02 g16-k2'de aynı etiketli iki çip yer değiştirerek doğru görünen sırayla seçilince
     `kaoFeedback==='Doğru'`, kart doğru cevap olarak kaydedilir (`daily.correct` artar, FSRS lapse yok); gerçekten yanlış sıra
     yine yanlış. Ayrıca 109 dersin tüm dizme/parça-dizme görevlerinde: aynı etiketli çip değişimi sonucu değiştirmez.
  2. Order denetimini **etiket dizisine** dayandır (seçilen çipin etiketi = beklenen sıradaki etiket). Kelime ve parça
     (fragment) dizmesi aynı yolu kullanır; ikisi de testte.
  3. FSRS/`kaoBuildQueue` değişmez (P5). Geçerlilik kapısı aynı kalır; yorumla "tekrar eden etiket artık güvenli" notu.
- **Kabul:** N-01 PASS · grammar_tasks PASS · `tekrar-uret` 10/10 · `kapilar.sh` yeşil.
- **Commit:** `D2F-02: aynı etiketli dizme çipleri doğru sırada doğru sayılır`

#### D2F-03 · Ders içinde aynı içerikli gramer görevi

- **Amaç:** Bir derste aynı görevin (tür + uyaran + cevap + şıklar) iki kez gösterilmemesi.
- **Kapatır:** D2-09 · K4-04 (kalıntı) · **N:** N-09 fail→pass.
- **Oku:** `app/core/quranLearn.js` `kaoLessonActivate` (≈1876) ve K2F-10'un geçersiz görev ikamesi (gramer → kelime alıştırması) ·
  `quranLearnFlow.js` `lessonPlan` (≈163) ardışık `templateId` kuralı.
- **Dokun:** `app/core/quranLearn.js`, `tests/kao/test_kao2_grammar_tasks.js`.
- **Adımlar:**
  1. **Kırmızı:** 109 dersin gerçek yürüyüşünde hiçbir derste aynı gramer imzası iki kez yok; ders başına alıştırma sayısı
     değişmez (önceki değerlerle eşit, testte sabitlenir); u01.02 özellikle.
  2. Motor, görevi kurduktan sonra ders içi imza kümesine bakar; tekrar ise K2F-10'un ikame yolunu kullanır (aynı dersin
     kelime alıştırması). Flow saflığı ve `lessonPlan` değişmez.
  3. Gösterilen gramer görevi sayısını (bugün 78) önce/sonra KANIT'a yaz; düşüş yalnız çift sayısı kadar olabilir.
- **Kabul:** N-09 PASS · grammar_tasks PASS · kabul A-2 PASS.
- **Commit:** `D2F-03: ders içinde aynı gramer görevi tekrar gösterilmez`

### Dalga C — Doğrulama zinciri

#### D2F-04 · R-01 ve R-10 kontrollerini güçlendirme

- **Amaç:** Kalıcı denetim fixture'ının kendi bulgusunu gerçekten yakalaması.
- **Kapatır:** D2-02 · D2-03 · **N:** N-02, N-03 fail→pass.
- **Oku:** `tests/kao/test_kao2_denetim.js` R-01 (≈17–30), R-10 (≈171–175) · `tests/kao/helpers/kao-harness.js` `walkLesson`/`playLesson` ·
  `tekrar-uret-2.cjs` N-02, N-03.
- **Dokun:** `tests/kao/test_kao2_denetim.js`, `kao2-duzeltme/denetim/tekrar-uret.cjs` (yalnız başa bir yorum satırı:
  "tarihsel; güncel kontrol tests/kao/test_kao2_denetim.js — R-01/R-10 D2F-04'te güçlendi").
- **Adımlar:**
  1. R-01: Ünite 1 derslerini `walkLesson` ile **oyna**, ustalığı doğru cevaplarla geç → `path.units['1'].masteryAt` dolu ISO,
     `masteryScore ≥ 0,8`, sonraki adım `next-unit`; aynı kurulumda yanlış cevaplarla → `masteryAt` null ve adım `repair`.
     Elle `st.at`/`st.phase` ataması yok.
  2. R-10: `^\s*fs\.writeFileSync\([^)]*A-KABUL` (çok satırlı) **ve** yazımın `KAO2_EVIDENCE_OUT` koşulu altında olduğu.
  3. **Mutasyon kanıtı (zorunlu, commit edilmez):** scratchpad kopyasında (a) `masteryAt` yazımını kapat → R-01 FAIL;
     (b) girintili koşulsuz `A-KABUL.md` yazımı ekle → R-10 FAIL. Komut ve çıktı KANIT'a.
- **Kabul:** `test_kao2_denetim` 10/10 · N-02, N-03 PASS · iki mutasyon FAIL veriyor.
- **Commit:** `D2F-04: R-01 gerçek ustalık geçişini, R-10 girintili yazımı da yakalar`

#### D2F-05 · `audio` görev türünün HTML sözleşmesi

- **Amaç:** K2F-40'ın bayt-eşitlik iddiasında doğrulanamayan `audio` türünü kalıcı testle kapsamak.
- **Kapatır:** rapor §8 "doğrulanamayanlar" (audio) · **N:** değişmez.
- **Oku:** `app/core/quranLearn.js` ses görevinin kurulduğu ve kullanılabilirlik koşulu (grep `audio` + `direction`) ·
  `tests/kao/test_kao2_components.js`.
- **Dokun:** `tests/kao/test_kao2_components.js`.
- **Adımlar:**
  1. Harness'te ses görevini **gerçek** kurucuyla üret (ses kullanılabilirliği registry/ayar yoluyla açılır; görev elle yazılmaz).
  2. Cevapsız / doğru / yanlış üç durumda: şıklar `Views.choice` düğme kipinden, durum sınıfı, `aria-pressed`/`disabled`,
     ses düğmesi etiketi.
  3. Tek seferlik kanıt (commit edilmez): `f4c256c7^` ve HEAD ağaçlarında (`git archive`) aynı üç durum HTML'i bayt-eşit → KANIT.
     Ses görevi sentetik ortamda kurulamıyorsa P6 değil: nedeni KANIT'a yaz, test kurulumun neden yapılamadığını sınar.
- **Kabul:** components PASS · KANIT'ta eşitlik sonucu.
- **Commit:** `D2F-05: ses görevi şık HTML sözleşmesi testte`

#### D2F-06 · `MUFREDAT-ESLEME.md` gerçek onay durumunu yazar

- **Amaç:** Canlı girdi klasöründeki inceleme sayfasının bayat "taslak / karar bekleyen" ifadelerini araçtan düzeltmek.
- **Kapatır:** D2-11 · K3-07 (kalıntı) · **N:** değişmez.
- **Oku:** `tools/kao2-curriculum-build.mjs` MUFREDAT sayfası üretimi (grep `Karar bekleyen`, `taslaktır`) ·
  `docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md` :1–10, :80–90, son 10 satır · `FIX-STATE.json.decisions.G2`.
- **Dokun:** `tools/kao2-curriculum-build.mjs`, `docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md` (araç çıktısı),
  `tests/kao/test_kao2_curriculum.js`.
- **Adımlar:**
  1. **Kırmızı:** draft sayısı 0 iken sayfada "taslaktır" yok; G2 kararı varsa "Karar bekleyen noktalar" yerine "G2 kararı
     (2026-10-02)" özeti ve işaretli onay satırı; sayfadaki durum sayıları `texts.tr.json` ile eşit.
  2. Araç sayfayı veriden yazar; elle düzenleme yok; iki üretim bayt-eşit; diğer 5 çıktı değişmez (`git diff --stat`).
- **Kabul:** curriculum PASS · bayt-eşit iki üretim · yalnız MUFREDAT değişti.
- **Commit:** `D2F-06: müfredat eşleme sayfası gerçek onay durumunu yazar`

#### D2F-07 · `tests/kao` envanteri ve koruyucusu

- **Amaç:** README envanterinin gerçek dosya listesine eşit olması ve böyle kalması.
- **Kapatır:** D2-05 · K6-06 (kalıntı) · **N:** N-05 fail→pass.
- **Oku:** `tests/kao/README.md`.
- **Dokun:** `tests/kao/README.md`, `tests/kao/test_kao2_inventory.js` (yeni).
- **Adımlar:** **Kırmızı:** yeni test — `tests/kao/test_*.js` her dosya README'de tam bir satırda; README'deki her test
  dosyası diskte var; `helpers/` ve `fixtures/` girdileri de listelenir. → `test_kao_pronunciation_contract.js` ve yeni testin
  satırları eklenir (P14).
- **Kabul:** N-05 PASS · inventory PASS.
- **Commit:** `D2F-07: tests/kao envanteri tam ve testle korunuyor`

### Dalga D — Kayıtlar ve süreç koruyucuları

#### D2F-08 · Süreç koruyucuları (`d2f-sync-check` genişletme)

- **Amaç:** M-05 / M-07 / M-12'nin bu programda üçüncü kez olmasını araçla engellemek.
- **Kapatır:** M-05, M-07, M-12 (tekrar riski) · **N:** değişmez.
- **Oku:** `kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs` · rapor §4 (commit sayıları), §6 E-7…E-10.
- **Dokun:** `kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs`, `kao2-duzeltme/tools/kapilar.sh` (yalnız d2f-sync satırı).
- **Adımlar:**
  1. `--strict` kuralları (yalnız `baseCommit` sonrası D2F commit'leri için **kapı**; `--audit-k2f` ile K2F dönemi için
     yalnız **rapor**, çıkış kodu etkilemez): (a) `done` her prompt için tam bir commit (D2F-12: en çok iki); (b) öneksiz ya da
     bilinmeyen önekli commit yok; (c) `?v=`/`SW_VERSION` değiştiren commit yalnız D2F-12'de ve `evidence/D2F-12/YAYIN.md` var;
     (d) her KANIT P11'in 8 bölümünü + `Oturum:` satırını taşıyor ve iki prompt aynı oturum URL'sini paylaşmıyor;
     (e) `userGates` promptlarında LEDGER'da `waiting` ve `closed` GATE var, `closed` satırı §1.F'deki cümlelerden birini içeriyor;
     (f) CURRENT-STATE "Canlı gerçekler" tarihi son prompt tarihinden eski değil.
  2. **Kırmızı kanıtı:** scratchpad'de sahte geçmişle her kuralın FAIL verdiği (6 durum) → KANIT. `--audit-k2f` çıktısı KANIT'a
     (rapor §4'teki sayılarla eşleşmeli: 128 commit, 28 çok-commit'li prompt, 21 plan dışı pin).
  3. `kapilar.sh` `d2f-sync-check --strict` satırını koşar.
- **Kabul:** strict PASS (D2F-00…08 geçmişi uyumlu) · 6 mutasyon FAIL · audit raporu rapor §4 ile tutarlı.
- **Commit:** `D2F-08: tek commit, yayın, KANIT ve kapı kuralları araçla denetleniyor`

#### D2F-09 · KAO2-FIX kayıtlarının geriye dönük düzeltmesi

- **Amaç:** Denetimin bulduğu kayıt boşluklarını **dürüstçe** kapatmak (geçmiş yeniden yazılmaz; ekleme ve açık "geriye dönük" etiketi).
- **Kapatır:** D2-06 (kayıt kısmı) · D2-07 · D2-12 (kayıt kısmı) · M-07 · M-12 (kayıt) · **N:** N-06, N-07 fail→pass.
- **Oku:** rapor §4, §6 E-4, E-7, E-10, §7 D2-06/07/12 · `kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md` · LEDGER seq 114–122 ·
  `git show --stat 6796d87a dc9743f4 8bf8f658 5b267dde`.
- **Dokun:** `kao2-duzeltme/.anti-amnesia/LEDGER.md` (yalnız ekleme), `kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md`,
  `kao2-duzeltme/FIX-STATE.json` (`ledgerLastSeq`, `branch`, `implementer` notu, `audit2` göstergesi),
  `kao2-duzeltme/evidence/K2F-43/KANIT.md` (yeni), `kao2-duzeltme/evidence/K2F-34/YAYIN.md` (yeni), `kao2-duzeltme/README.md`,
  `kao2-duzeltme/deliverables/KAO2-FIX-KAPANIS.md` (yalnız sona §8 eki).
- **Adımlar:**
  1. LEDGER'a (sırayla, her biri ayrı seq): `GATE · K2F-43` **geriye dönük** — `status: closed-inferred`; alıntı: kullanıcının
     gerçek talimatı; "P7 uygulanmadı, onay çıkarımla verildi; teyit D2F-12/13'te" · `NOTE · K2F-34` yayın kanıtı eksikti ·
     `NOTE · K2F-38` `8bf8f658` (KAO2 dışı CSS) ve `5b267dde` (plan-check genişletmesi; D2F-01'de daraltıldı) ·
     `NOTE · denetim-2` rapor ve D2F programına bağlantı. Eski seq'ler değişmez.
  2. `evidence/K2F-43/KANIT.md` (P11 biçimi, başlıkta "GERİYE DÖNÜK — D2F-09") ve `evidence/K2F-34/YAYIN.md` (git'ten: commit,
     pin, ff aralığı; run ID kayıtta yoksa "kayıtta yok" — tahmin edilmez).
  3. CURRENT-STATE **baştan**: yalnız kapanış gerçekleri (bu oturumda ölçülmüş pinler/bütçeler, tek runtime değeri) + açık
     işler (D2F programı, L2, cihaz, canlı doğrulama). Bayat satırların hepsi gider (rapor §6 E-10 listesi).
  4. FIX-STATE `branch` gerçeği yazar ("oturum dalları → main; bkz. denetim-2"); README durum satırı "program kapandı;
     denetim-2 bulguları D2F'de" ve "her prompt ayrı oturum" iddiası gerçeğe çekilir.
  5. KAPANIŞ belgesine §8: denetim-2 hükmü, sayılar, D2F bağlantısı — önceki bölümler değişmez.
  6. `node kao2-duzeltme/tools/fix-sync-check.mjs --repro` PASS kalmalı (status `completed`, nextPrompt null).
- **Kabul:** N-06, N-07 PASS · fix-sync-check PASS · d2f-sync strict PASS · eski LEDGER satırları bayt aynı (`git diff` yalnız ekleme).
- **Commit:** `D2F-09: KAO2-FIX kayıtları geriye dönük düzeltildi (K2F-43 kapısı, K2F-34 yayını, CURRENT-STATE)`

### Dalga E — Kullanıcı kararları, kapanış, yayın

#### D2F-10 · L1 kapısı: onay kaynağı ve u09.01 metni (kullanıcı kapısı)

- **Amaç:** L1 onayının kimin olduğunu veride ve belgelerde doğru yazmak; u09.01 başlık/hedef–içerik uyumsuzluğunu gidermek.
- **Kapatır:** D2-04 · D2-10 · K5-04 · M-01 · K5-03 (kalıntı) · **N:** N-04 fail→pass.
- **Kullanıcı kapısı (§1.F):** önce hazırlık commit'i (`D2F-10: kullanıcı kapısı — L1 kararı ve u09.01`), sonra kullanıcıya **tek
  mesajla** şu iki karar sorulur ve oturum durur:
  - **L1 kararı:** **A** — 158 metni sen yeniden incelersin (`INCELEME-KAO2-17/18.md`'deki L1 kutularını kendin işaretlersin;
    işaretsizler `draft`'a döner ve uygulamada gizlenir). **B** — onaylar yerinde kalır ama veri ve belge gerçeği söyler:
    `review.by:"ai-delegated"`, `delegatedBy:"owner"`, `delegatedAt:"2026-10-02"` (görünürlük değişmez). **C** — hiçbir şey
    değişmez, yalnız belge düzeltilir (`by:"owner"` kalır; CLAUDE/AGENTS "L1 yapay zekâ incelemesiyle, sahibin devriyle" der).
  - **u09.01:** **1** — başlık/hedef kartlara uyar (ör. "Anmak, yemek, vermek, bağışlamak"; emir vaadi kalkar). **2** — başlık
    kalır, tanış kartında lemmanın emir biçimi de gösterilir (yalnız içerik modülünde/araç çıktısında emir biçimi varsa;
    yoksa 2 seçilemez — bunu soruda söyle). Ya da kullanıcının kendi metni.
- **Oku:** `docs/kuran-ogreniyorum/kao2/content/texts.tr.json` u09.01 + `review` alanları · `tools/kao2-curriculum-build.mjs`
  `--apply-review` ve `review` doğrulaması · `tests/kao/test_kao2_review_apply.js`, `test_kao2_text_review.js` ·
  CLAUDE.md/AGENTS.md KAO2 satırı (grep).
- **Dokun:** `docs/kuran-ogreniyorum/kao2/content/texts.tr.json`, `tools/kao2-curriculum-build.mjs`, `app/content/quranCurriculumV2.js`
  (araç çıktısı), `docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md`, `INCELEME-KAO2-18.md` (araç çıktısı),
  `tests/kao/test_kao2_review_apply.js`, `tests/kao/test_kao2_text_review.js`, `tests/kao/test_kao2_lesson_coherence.js`,
  `CLAUDE.md`, `AGENTS.md`. (Seçim 2 ise ek dosya gerekir → P6, yeni prompt.)
- **Adımlar (yanıttan sonra, yeni oturumda):**
  1. LEDGER `GATE closed` (iki yanıt aynen alıntılanır).
  2. **Kırmızı:** seçime göre — A: işaretli kutu ⇔ `sourced`; B: her `sourced` metinde `by ∈ {owner, ai-delegated}` ve
     `ai-delegated` ⇔ devir kaydı; C: belge testi. Her durumda N-04: CLAUDE/AGENTS satırı veriyle tutarlı. u09.01: tutarlılık
     kapısı başlık/hedef ↔ tanış kartı anlamı (emir vaadi varsa kartta emir biçimi görünür).
  3. Uygula (araçla; elle `quranCurriculumV2.js` düzenleme yok). u09.01 yeni metni kullanıcının birebir metni ya da seçeneğin
     önceden sunulan metniyse `sourced, by:"owner"` (kapı cümlesi onaydır); değilse `draft`.
  4. CLAUDE.md ve AGENTS.md KAO2 satırı **birebir aynı** ve gerçeğe uygun.
- **Kabul:** N-04 PASS · review_apply/text_review/coherence PASS · iki belge satırı aynı · GATE waiting+closed.
- **Commit (yanıttan sonra):** `D2F-10: L1 onay kaynağı ve u09.01 metni kullanıcı kararıyla düzeltildi`

#### D2F-11 · Kapanış regresyonu

- **Amaç:** Tüm düzeltmelerin bütün halinde doğrulanması ve denetim-2 sonuç belgesi.
- **Kapatır:** kapanış doğrulaması (D2-01…D2-12) · **N:** 9/9 beklenir (N-08 D2F-12'de) → bu promptta **8/9**.
- **Oku:** `evidence/D2F-00…10/KANIT.md` "Ölçümler" · rapor §1–§2.
- **Dokun:** `kao2-duzeltme/denetim-2/DUZELTME-SONUCU.md` (yeni), `kao2-duzeltme/denetim-2/evidence/D2F-11/A-KABUL.md`.
- **Adımlar:**
  1. `KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` **tam** → YEŞİL; bayraksız koşu da (yalnız göreli perf kırmızı olabilir).
  2. `tekrar-uret-2` 8/9 (yalnız N-08 açık) · `tekrar-uret` 10/10 · `test_kao2_denetim` 10/10 · plan-check · `d2f-sync --strict` ·
     `perf-ab.cjs` cari vs `07802fa6` (oran) · `KAO2_EVIDENCE_OUT=…/A-KABUL.md` ile kabul.
  3. `DUZELTME-SONUCU.md`: D2-01…D2-12 → prompt → commit → kanıt → durum (her satır bu oturumda **yeniden ölçülerek**, toplu
     damga yok); kanıt düzeyleri ayrı; kullanıcıda kalanlar (§3).
- **Kabul:** hepsi yeşil · belge ölçülmüş satırlarla.
- **Commit:** `D2F-11: denetim-2 düzeltmelerinin kapanış regresyonu`

#### D2F-12 · YAYIN-3 (kullanıcı kapısı)

- **Amaç:** D2F değişikliklerini canlıya almak; K2F-43'ün çıkarımla verilmiş onayını açık onayla değiştirmek.
- **Kapatır:** D2-08 · D2-06 (onay kısmı) · E-4 · **N:** N-08 fail→pass (9/9).
- **Kullanıcı kapısı (§1.F):** önce `D2F-12: kullanıcı kapısı — YAYIN-3` commit'i (yalnız kayıtlar; pin yok) ve kullanıcıya
  `DUZELTME-SONUCU.md` özeti + değişen yayın varlıkları listesi + "Bu yayın K2F-43'te (20261006e) çıkarımla yapılan yayını da
  açıkça onaylar" cümlesi; yalnız `YAYIN-3 onaylı` / `YAYIN-3 ertele` kabul. Oturum durur.
- **Oku:** CLAUDE.md "Cache busting" · `tests/app/test_iip_22.js` release · `sw.js` sürümleri · `evidence/K2F-18/YAYIN.md` (biçim).
- **Dokun (onaylıysa):** `index.html`, `sw.js`, `panel-v2.html`, pin taşıyan testler (`grep -rl 20261006e tests/ index.html sw.js panel-v2.html`),
  `kao2-duzeltme/denetim-2/evidence/D2F-12/{YAYIN.md,release-live.json}`.
- **Adımlar (onaylıysa, yeni oturumda):**
  1. GATE closed. Yeni pin (bugünün tarihi + harf). Değişen **her** varlığın `?v=`'si — `panel-v2.html`'deki
     `app/styles.css` dahil (D2-08) — `SW_VERSION`, `SW_OFFLINE_VERSION`, testler; `KAO2_ACCEPT_SLOW_HOST=1 kapilar.sh` YEŞİL **pin
     sonrası**.
  2. `git switch main && git merge --ff-only <dal> && git push origin main`; ff olmazsa dur (P6). Force yok.
  3. Pages run ID ve sonucu (Actions'a erişilemiyorsa "doğrulanamadı" yazılır, tahmin yok).
  4. YAYIN.md: pin, değişen dosyalar, ff aralığı, run; **canlı bayt eşitliği: D2F-13'te** (kullanıcı betiği).
- **Ertele:** yayın yok; LEDGER `GATE closed (ertele)`; program D2F-13'e geçer ve orada yalnız mevcut canlıyı (20261006e) doğrular.
- **Kabul:** onaylı: N-08 PASS, `tekrar-uret-2` 9/9, run kaydı · ertele: kayıt.
- **Commit (onaylıysa):** `D2F-12: YAYIN-3 — denetim-2 düzeltmeleri canlıda (pin <yeni>)`

#### D2F-13 · Canlı doğrulama kaydı ve kapanış (kullanıcı kapısı)

- **Amaç:** Canlı bayt eşitliğini ve gizlilik 404'lerini **kullanıcının terminalinden** kaydetmek; programı kapatmak.
- **Kapatır:** D2-06 (canlı kısım) · M-12 · rapor §8 doğrulanamayanlar (canlı) · **N:** 9/9 kalır.
- **Kullanıcı kapısı (§1.F):** önce `D2F-13: kullanıcı kapısı — canlı doğrulama` commit'i; kullanıcıya şu komut verilir
  (pin D2F-12'deki yeni pin; ertelendiyse `20261006e`) ve **çıktının yapıştırılması** istenir:

```bash
P=<pin>; git checkout main && git pull --ff-only && for f in index.html sw.js panel-v2.html $(grep -oE '(src|href)="[^"]+\?v='"$P"'"' index.html panel-v2.html | sed -E 's/.*"([^"?]+)\?v=.*/\1/' | sort -u); do l=$(shasum -a 256 "$f" | cut -d' ' -f1); r=$(curl -fsS "https://mustafaras.github.io/s/$f" | shasum -a 256 | cut -d' ' -f1); [ "$l" = "$r" ] && echo "EŞİT   $f" || echo "FARKLI $f"; done; for p in kao2-duzeltme/FIX-STATE.json kao2-duzeltme/denetim-2/DENETIM-RAPORU.md archive/README.md docs/kuran-ogreniyorum/kao2/content/texts.tr.json; do echo "$(curl -s -o /dev/null -w '%{http_code}' "https://mustafaras.github.io/s/$p") $p (404 beklenir)"; done
```
  İsteğe bağlı aynı mesajda: `node tests/kao/test_kao2_perf_budget.js` çıktısı (referans makine; rapor §5).
- **Dokun:** `kao2-duzeltme/denetim-2/{evidence/D2F-13/CANLI.md, D2F-STATE.json, CURRENT-STATE.md, LEDGER.md, DUZELTME-SONUCU.md (yalnız sona canlı bölümü)}`.
- **Adımlar (yanıttan sonra):** çıktı **aynen** CANLI.md'ye; `FARKLI` ya da 404 olmayan satır varsa program kapanmaz → LEDGER
  `BLOCKED` + yeni prompt önerisi. Hepsi EŞİT ve 404 ise STATE `status:"completed"`, `nextPrompt:null`. `canlı doğrulama yok`
  yanıtında kapanış "canlı doğrulanmadı" notuyla yapılır (kanıt düzeyi açıkça "yayın ✓ · canlı — · cihaz —").
- **Kabul:** CANLI.md kullanıcı çıktısıyla · d2f-sync `completed` PASS.
- **Commit (yanıttan sonra):** `D2F-13: canlı doğrulama kaydı, denetim-2 programı kapandı`

---

## §3 · Bulgu → prompt eşlemesi

| Rapor bulgusu | Prompt | | Rapor bulgusu | Prompt |
|---|---|---|---|---|
| D2-01 aynı etiketli dizme çipi | D2F-02 | | D2-07 bayat CURRENT-STATE/FIX-STATE/README | D2F-09 |
| D2-02 R-01 zayıf | D2F-04 | | D2-08 panel-v2 styles.css pini | D2F-12 |
| D2-03 R-10 kalıbı | D2F-04 | | D2-09 ders içi çift gramer görevi | D2F-03 |
| D2-04 L1 onay kaynağı / CLAUDE.md | D2F-10 | | D2-10 u09.01 başlık–içerik | D2F-10 |
| D2-05 README envanteri | D2F-07 | | D2-11 MUFREDAT-ESLEME bayat | D2F-06 |
| D2-06 K2F-43 kapısı, K2F-34/canlı kanıt | D2F-09, 12, 13 | | D2-12 kapsam dışı commit + plan-check | D2F-01, 09 |
| K5-04, M-01 (kısmen) | D2F-10 | | K5-03 (kısmen) | D2F-10 |
| K4-04 (kısmen) | D2F-03 | | K3-07, K6-06 (kısmen) | D2F-06, 07 |
| M-05, M-07, M-12 (tekrarladı) | D2F-08 (önleme), 09 (kayıt), 13 (canlı) | | §5 perf göreli bant | D2F-01, 13 (referans makine) |
| §8 doğrulanamayan: audio türü | D2F-05 | | §8 doğrulanamayan: canlı/404 | D2F-13 |

**Bu programın dışında kalanlar (kod/ajan işi değil; kapanış belgesinde "kullanıcıda" olarak taşınır):**
- **K3-02** namaz eşlemesi 19/32 — kalan 13 kelime bilinçli muhafazakâr kuralla bağsız; genişletmek uzman kararı
  (`NAMAZ-ESLEME-L2.md`) ister, tahminle eşleme P9'a aykırı.
- **L2** dinî bağlam uzman onayı (0/37), **K-3** hece sesi kayıtları, **A-11/A-12** cihaz kabulü, ekran okuyucu turu.
- **Pages run'larının bağımsız teyidi** (GitHub erişimi olan oturumda ya da kullanıcı tarafından).
- **K2F-06…34 oturum sınırları** ve K2F-40 `git stash` olayı: geriye dönük kanıtlanamaz; D2F-09 bunu kayıtta açıkça "doğrulanamadı" yazar.

## §4 · Sıra ve kapılar

| Dalga | Promptlar | Kullanıcı | N hedefi (sonunda) |
|---|---|---|---|
| A Altyapı | D2F-00, 01 | — | 0/9 |
| B Görünen kusurlar | D2F-02, 03 | — | 2/9 |
| C Doğrulama zinciri | D2F-04…07 | — | 5/9 |
| D Kayıtlar | D2F-08, 09 | — | 7/9 |
| E Karar, kapanış, yayın | D2F-10…13 | D2F-10 (L1 + u09.01) · D2F-12 (YAYIN-3) · D2F-13 (canlı çıktı) | 9/9 |

Pin/handler beklentisi: **yeni `App.kao*` handler yok** (45 / 766 / 604 / onclick 393 değişmez; gerekirse P6). Yayın pini yalnız D2F-12.
