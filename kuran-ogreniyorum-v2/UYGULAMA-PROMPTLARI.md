# KAO2 — Uygulama komut istemleri (tek dosya, sıralı)

28 kart · 6 dalga · her kart **tek oturum, tek commit**. Kartlar yalnız
sırayla yürür; `KAO2-STATE.json.nextCard` hangi kartın çalışacağını söyler.
Bu dosya bir kartın **ne** yapacağını anlatır; **neden** için 01–10 belgelerine
bağlanır. Her kart §1 Ortak protokolü **aynen** uygular.

---

## §0 · Oturum başlatıcı (her yeni oturumda bunu yapıştır)

```text
Şeyma reposunda KAO2 programındasın (Kur'an Arapçası Öğreniyorum yeniden tasarımı).
Sırayla oku ve başka bir şey yapmadan önce doğrula:
1) CLAUDE.md "DATA SAFETY" bölümü (tarayıcı açma yok, seyma-data'ya yazma yok).
2) kuran-ogreniyorum-v2/.anti-amnesia/CURRENT-STATE.md
3) node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs  → PASS olmalı
4) kuran-ogreniyorum-v2/KAO2-STATE.json → nextCard
5) kuran-ogreniyorum-v2/UYGULAMA-PROMPTLARI.md → §1 Ortak protokol + nextCard'ın kartı
Yalnız nextCard kartını uygula; §1'deki başlangıç, TDD, kapı ve kapanış adımlarını
atlamadan izle. Kapsam dışı bir şey görürsen yapma: KAO2-STATE.json.backlog'a yaz.
Bitince LEDGER + CURRENT-STATE + STATE aynı committe; sync-check PASS; tek commit.
```

---

## §1 · Ortak protokol (her kartta aynen)

### P1 · Başlangıç (kod yazmadan önce)
1. `git status` temiz olmalı; dal `kao2-yeniden-tasarim` (KAO2-00 hariç). Değilse **dur**.
2. `node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs` → PASS. Değilse **dur**, uyumsuzluğu `FIX` kaydıyla çöz.
3. `KAO2-STATE.json.nextCard` bu kart olmalı. Kartı STATE'te `in_progress` yap (commit kapanışta).
4. Kartın "Oku" satırındaki belge bölümlerini oku. Yalnız "Dokun" listesindeki dosyaları değiştir.
5. Önceki commit hash'ini `git log -1 --format=%h` ile al; kapanış kaydına `- prev-commit:` olarak yaz.

### P2 · TDD sırası
1. Kartın testlerini **önce** yaz ya da genişlet; çalıştır; **kırmızı** olduğunu gör; ilk anlamlı hata satırlarını kanıt dosyasına kopyala.
2. En küçük uygulamayla yeşile çek.
3. Yeniden düzenle (davranış aynı kalır); testler yeşil kalır.
4. Mevcut bir testi **zayıflatma**. Davranışı bilerek değişen bir test güncelleniyorsa eski/yeni beklenti ve gerekçe kanıt dosyasına yazılır.

### P3 · Kapı komutları (kart sonunda hepsi yeşil)

```bash
# Sözdizimi
node --check app/core/quranLearn.js
[ -f app/core/quranLearnFlow.js ]  && node --check app/core/quranLearnFlow.js
[ -f app/core/quranLearnViews.js ] && node --check app/core/quranLearnViews.js
[ -f app/content/quranCurriculumV2.js ] && node --check app/content/quranCurriculumV2.js
# KAO + uygulama + diğer aileler
for f in tests/kao/test_*.js;               do node "$f" >/dev/null || { echo "FAIL $f"; exit 1; }; done
for f in tests/app/test_*.js;               do node "$f" >/dev/null || { echo "FAIL $f"; exit 1; }; done
for f in tests/panel/test_*.js;             do node "$f" >/dev/null || { echo "FAIL $f"; exit 1; }; done
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" >/dev/null || { echo "FAIL $f"; exit 1; }; done
for f in tests/quran/test_*.js;             do node "$f" >/dev/null || { echo "FAIL $f"; exit 1; }; done
node tests/reminders/run-reminder-smoke.mjs >/dev/null || echo "FAIL reminders"
# Headless uygulama sürücüleri (ağ ve zamanlayıcılar ölü; hiçbir şey push edilemez)
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
# Kontrast + senkron
node docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs
node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs
```

Bir kapı kırmızıysa ve düzeltmesi kart kapsamındaysa düzelt; değilse **P6**.
Çıkış kodunu boru (`|`) sonrasında okuma; her komutu ayrı değerlendir.

### P4 · Kapanış (tek commit içinde, bu sırayla)
1. `kuran-ogreniyorum-v2/evidence/KAO2-NN/KANIT.md` yaz (şablon P7).
2. `KAO2-STATE.json`: kart `status:"done"`, `evidence:"kuran-ogreniyorum-v2/evidence/KAO2-NN/KANIT.md"`; `nextCard` = sonraki kart (son kartta `null` + `status:"completed"`); `ledgerLastSeq` +1 (ek `GATE`/`NOTE` kaydı varsa her biri için +1); ilk kartta program `status:"active"`.
3. `.anti-amnesia/LEDGER.md` sonuna `CARD` kaydı ekle (şablon P8).
4. `.anti-amnesia/CURRENT-STATE.md`'yi **baştan yaz**: `kao2-sync` bloğu (nextCard, lastSeq, status) + "Şu an neredeyiz" + "Sıradaki kartın tek cümlesi" + güncel "Canlı gerçekler" + açık riskler + bekleyen kullanıcı işleri.
5. `node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs` → PASS.
6. `git add` yalnız bu kartın dosyaları + plan klasörü; `git commit` (şablon P9). Push **yok**.

### P5 · Yasaklar (her kartta)
- Tarayıcı açma, sunucu başlatma yok. Tek istisna: kullanıcı açıkça ekran görüntüsü isterse CLAUDE.md kural 1'deki 127.0.0.1:9000 prosedürü; sunucu kart sonunda durdurulur.
- `mustafaras/seyma-data`'ya yazma, push, deploy, tag, `main`'e birleştirme yok.
- Elle Arapça metin, hareke ya da okunuş yazma yok; yalnız araç çıktısı ve içerik modüllerinden kimlikle atıf (D-12, K-4).
- `app.js`'te yalnız izin verilen dokunuş: `App.kao*` shim satırı (≈L3904). `var ui=` literaline, `migrate()` gövdesine ve başka alanlara dokunma.
- fx2/v3 düz metin tarayıcıları yorumları da sayar: **yorumda** `App.<ad>=` biçimi ya da tıklama niteliği adı yazma.
- FSRS portu (`kaoSchedule`, ağırlıklar), `kaoBuildQueue` kuralları (R-A1…R-A8, KF-9) ve gizlilik (ses kaydı yalnız bellekte) değişmez.
- `?v=` sürüm pini ara kartlarda değişmez (versionPolicy); yeni dosyalar mevcut `20260927g` ile eklenir.
- Mevcut kullanıcı verisini silen, sıfırlayan ya da anlamını değiştiren kod yok; yalnız ekleme ve normalizasyon.

### P6 · Durma koşulları
Aşağıdakilerden biri olursa: işi bırak, LEDGER'a `BLOCKED` kaydı ekle (neden,
denenen, önerilen çözüm, `- next:` aynı kart), kartı `status:"blocked"` yap, CURRENT-STATE'i
güncelle, sync-check PASS, commit at (`KAO2-NN: BLOCKED — <neden>`), kullanıcıya bildir.
- Kart kapsamı dışında bir dosyayı değiştirmek gerekiyor.
- `.claude/skills/*` düzenlemesine izin verilmedi.
- Bir kapı kırmızı ve düzeltmesi başka bir alanın davranışını değiştiriyor.
- Kullanıcı kararı gerekiyor (G1–G4 kapıları, içerik onayı, lisans).
- Eski veri için geri uyum sağlanamıyor.

`blocked` kart çözülünce aynı kart yeniden `in_progress` olur; çözüm `FIX` kaydıyla belgelenir.

### P7 · Kanıt dosyası şablonu (`evidence/KAO2-NN/KANIT.md`)

```markdown
# KAO2-NN — <başlık>
Tarih: YYYY-MM-DD · Dal: kao2-yeniden-tasarim · Önceki commit: <hash>
## Yapılan
- …
## TDD
- Kırmızı: <komut> → <ilk anlamlı hata satırı>
- Yeşil: <komut> → PASS
## Kapılar (P3)
| Komut | Sonuç |
|---|---|
## Ölçümler
- (kartın kabul ölçütleri: sayı + hedef)
## Bilerek değişen testler
- <dosya>: eski beklenti → yeni beklenti · gerekçe
## Kanıt düzeyleri
- Kaynak/test: … · Yayın: yok · Cihaz: yok (kullanıcıda)
## Sürprizler / backlog
- …
```

### P8 · LEDGER `CARD` kaydı şablonu

```markdown
## seq N · YYYY-MM-DD · CARD · KAO2-NN
- status: done
- title: <başlık>
- prev-commit: <hash>
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-NN/KANIT.md
- gates: kao PASS · app PASS · panel PASS · panel-v2 PASS · quran PASS · reminders PASS · driver PASS · zikr PASS · contrast PASS · sync PASS
- metrics: <kabul ölçütleri sayılarla>
- changed-tests: <yok | liste>
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: <yok | kısa>
- next: KAO2-(NN+1)
```

### P9 · Commit mesajı şablonu

```text
KAO2-NN: <Türkçe kısa özet>

<2–5 satır: ne değişti, hangi bulgular kapandı (K-/Y-/T-/P-), hangi testler>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

---

## §2 · Kartlar

### W0 — Hazırlık

---

#### KAO2-00 · Dal, K-1 bütçe/süre kapısı, kaynakça teyidi

- **Önkoşul:** G0 kapalı (10-KARARLAR). Dal henüz yok.
- **Oku:** 10-KARARLAR K-1 · 04 §4 · `tests/kao/test_kao_user_tasks.js` R-C5 bloğu (~L100–112) · `tools/kao-audio-build.mjs` `BUDGET_BYTES`.
- **Dokun:** `tests/kao/test_kao_user_tasks.js`, `tests/kao/test_kao2_perf_budget.js` (yeni), `tools/kao-audio-build.mjs`, `tools/kao-lexicon-build.mjs` ve araç çıktısı `app/content/quranLexiconV1.js` (2026-09-28 kullanıcı onayı: içerik eşliğini koruyan yükleme optimizasyonu), `tests/kao/README.md`, `kuran-ogreniyorum-v2/04-BILIMSEL-TEMEL.md` (yalnız teyit işaretleri), plan klasörü.
- **Adımlar:**
  1. P1'in 1. adımı yerine: `git status` temizse `git switch main && git switch -c kao2-yeniden-tasarim`. Plan klasörü `main`'de zaten commit'li olmalı (`git log main --oneline -- kuran-ogreniyorum-v2 | grep KAO2-PLAN` bir satır döndürür; LEDGER seq 4). Değilse dur ve kullanıcıya sor.
  2. (Plan commit'i 2026-09-28'de `main`'e alındı ve yayınlandı; bu adımda ayrıca commit gerekmez.)
  3. **Kırmızı:** `test_kao2_perf_budget.js` yaz: (a) içerik modüllerinin gzip (level 9) toplamı ≤ 256 KiB (`app/content/quranCurriculumV2.js` varsa dahil), mevcut 4 modül ≤ 164 KiB, curriculumV2 ≤ 48 KiB; (b) `app/core/quranLearn*.js` gzip toplamı ≤ 80 KiB; (c) `app/kao.css` gzip ≤ 14 KiB; (d) içerik + `quranLearn*.js` dosyalarının `node:vm` içinde (boş `window` bağlamında) değerlendirilmesi, 20 tekrar, p95 ≤ 40 ms; (e) `kuran-ogreniyorum-v2/evidence/KAO2-01/perf-baseline.json` varsa p95 ≤ taban × 1,25. Rapor satırı: `KAO2 perf: PASS (content X KiB · runtime Y KiB · css Z KiB · p95 W ms)`. Önce bilerek yanlış bir tavanla (ör. 1 KiB) çalıştırıp kırmızıyı kanıtla, sonra gerçek tavana çek.
  4. `test_kao_user_tasks.js` R-C5: `budget = 160 * 1024` → K-1 toplam tavanı (256 KiB) + mevcut 4 modül için 164 KiB kontrolü; yorum: `// KAO2 K-1 (2026-09-28): toplam 256 KiB, mevcut modüller 164 KiB; süre kapısı test_kao2_perf_budget.js`.
  5. `tools/kao-audio-build.mjs`: `BUDGET_BYTES = 24 * 1024 * 1024` (yorum: KAO2 K-1). Aracın `--self-test` modu varsa çalıştır.
  6. `tests/kao/README.md` envanterine yeni fixture satırı.
  7. 04 kaynakçasındaki her künyeyi teyit et (yazar, yıl, dergi/cilt). Ağ erişimi varsa DOI/yayıncı sayfasından; yoksa bilinen künyeyle karşılaştır. Her satır sonuna `✓` ya da `⚠︎ teyit edilemedi` yaz; `⚠︎` olan kaynağa dayanan kararın "Güç" sütununa `(⚠︎)` ekle. Künye uydurma; emin değilsen `⚠︎`.
- **Kabul:** perf testi PASS ve rapor satırı gerçek sayılarla; R-C5 yeni tavanlarla PASS; 04'te her kaynakta işaret var.
- **Commit:** `KAO2-00: K-1 bütçe ve süre kapısı, ses bütçesi 24 MB, kaynakça teyidi`

---

#### KAO2-01 · Taban ölçüm ve referans dökümler

- **Oku:** 08 §7 · `.claude/skills/run-seyma/SKILL.md` (`--dump` kullanımı).
- **Dokun:** `kuran-ogreniyorum-v2/evidence/KAO2-01/*` (yalnız kanıt), `tests/kao/test_kao2_perf_budget.js` (yalnız taban yazma bayrağı gerekiyorsa), `docs/kuran-ogreniyorum/tools/kao-plan-check.mjs` (2026-09-28 kullanıcı onayı: yalnız KAO2-00…27 commit öneklerini tanıma; bilinmeyen önek reddi korunur).
- **Adımlar:**
  1. P3'ün tamamını çalıştır; her aile için PASS sayısını kaydet.
  2. `perf-baseline.json` üret: `{date, node: process.version, p95Ms, contentGzip, runtimeGzip, cssGzip}` (perf testinin ölçüm fonksiyonuyla; `KAO2_WRITE_BASELINE=1` bayrağıyla yazma modu).
  3. Mevcut KAO ekranlarının HTML dökümleri: sürücünün sekme dökümü ve gerekirse küçük bir `node:vm` betiğiyle `SeymaQuranLearn.kaoOverlayHTML()` çıktısı (boş durum + tohumlu durum) → `evidence/KAO2-01/before-*.html`. Betik ağ/zaman kullanmaz, depoya yazmaz; `$TMPDIR`'de çalışır, çıktı yalnız kanıt klasörüne.
  4. Ölçüm özeti: `quranLearn.js` satır sayısı, `kao.css` ağırlık dağılımı (`grep -o "font-weight:[0-9]*" app/kao.css | sort | uniq -c`), `.kao-link-button` sayısı, handler sayısı (35).
- **Kabul:** tüm aileler yeşil; `perf-baseline.json` var ve perf testi taban kontrolüyle PASS; en az 2 döküm dosyası.
- **Commit:** `KAO2-01: taban ölçüm, performans tabanı ve önce dökümleri`

---

#### KAO2-02 · Tasarım sözleşmesi testi (kırmızıyı belgeleyen mod)

- **Oku:** 06 §4, §7 · 02 §1.
- **Dokun:** `tests/kao/test_kao2_design_contract.js` (yeni), `tests/kao/README.md`.
- **Adımlar:**
  1. Fixture ölçümleri: (a) `app/kao.css` farklı `font-weight` değeri sayısı; (b) `text-transform:uppercase` sayısı; (c) içerik taşımayan dekoratif sözde öğe (`content:''` ile `::before/::after`) sayısı; (d) 06 §4'teki kaldırılacak seçicilerin varlığı; (e) serif arayüz yığını (`Iowan Old Style`) sayısı; (f) boş ve tohumlu durumda `kaoOverlayHTML()` içinde görünüm başına `.kao-primary` sayısı ve açık/kapalı ayarların `role="switch"` taşımaması.
  2. Sabit `const MODE = 'baseline'`: bu modda test bugünkü ihlalleri **sayar ve taban değerlerle eşitliğini** doğrular (ör. ağırlık 9, uppercase 4) → yeşil kalır, taban belgelenir. `MODE = 'strict'` 06 §7 hedeflerini uygular. KAO2-03 `strict`'e çevirir.
  3. Rapor satırı: `KAO2 design: <mode> weights=W uppercase=U deco=D serif=S primaryPerView=…`.
- **Kabul:** baseline modunda PASS; `MODE='strict'` geçici olarak denendiğinde FAIL (kanıta yaz, sonra geri al).
- **Commit:** `KAO2-02: tasarım sözleşmesi fixture'ı (taban modu)`

### W1 — Kabuk ve temel etkileşim

---

#### KAO2-03 · Tokenlar ve süs temizliği

- **Oku:** 06 §1, §3, §4, §7 · 02 §2.1–2.3.
- **Dokun:** `app/kao.css`, `app/core/quranLearn.js` (yalnız süs span'larını kaldırmak için markup), `tests/kao/test_kao2_design_contract.js` (MODE → strict), gerekirse `docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs` (token listesi).
- **Adımlar:**
  1. **Kırmızı:** MODE'u `strict` yap; FAIL'i kaydet.
  2. `.kao-dialog, .kao-hub-card` kapsamında 06 §1 tokenlarını tanımla (açık + `#root[data-theme="dark"]` karşılıkları `--quran*`'dan türetilir; yeni renk ailesi yok).
  3. 06 §4 listesindeki seçicileri ve markup'taki karşılık gelen süs span'larını (`kao-hub-spine/frame/ornament`, `kao-dialog-frame`, `kao-header-mark`, `kao-hero-rosette`, `kao-summary-mark`, `kao-done-mark`) kaldır. `aria-hidden` süsler dışında erişilebilirlik ağacı değişmez.
  4. Ağırlıkları 400/500/600/700'e eşle (800–950 → başlıkta 700, vurguda 600; 750–780 → 600). Uppercase + letter-spacing kaldır. Serif arayüz başlıkları sistem yığınına döner (Arapça yığın aynen kalır).
  5. `:hover` translate/gölge efektlerini kaldır; basınç `:active{transform:scale(.98)}`; reduced-motion bloğunda anında.
  6. `kao-audio-pending{opacity:0}` kaldırılır; içerik hiçbir modda gizli başlamaz (T-26). İlgili `test_kao_render.js` beklentisi değişiyorsa P2.4.
  7. Kontrast aracını yeni token çiftleriyle çalıştır; eksik çift varsa araca ekle.
- **Kabul:** design contract `strict` CSS ölçümleri (a–e) PASS; (f) KAO2-09'a kadar `strict` içinde açıkça raporlanan `todo` olarak atlanabilir; kontrast PASS; `kao.css` gzip ≤14 KiB.
- **Commit:** `KAO2-03: KAO tokenları, 4 ağırlık, süs katmanları kaldırıldı`

---

#### KAO2-04 · Üç dosya iskeleti (K-2) + gezinme yığını + NavBar

- **Oku:** 10 K-2 · 05 §2 (gezinme) · 06 §2 (NavBar, LargeTitle) · 08 §2, §4, §5 · CLAUDE.md "Load-order lesson (MON-25)".
- **Dokun:** `app/core/quranLearnFlow.js` (yeni), `app/core/quranLearnViews.js` (yeni), `app/core/quranLearn.js`, `app/kao.css`, `index.html` (2 betik satırı), `sw.js` (önbellek listesi), `.claude/skills/run-seyma/driver.mjs` FILES, `.claude/skills/run-seyma/zikr-harness.mjs` FILES, `tests/app/test_state_rebind_boundary.js` açılış listesi, `tests/app/test_iip_22.js` (varlık listesi yeni dosyaları içermesi gerekiyorsa), `app.js` (yalnız shim satırı: +2 handler), fx2 App yüzeyi pinleri (`grep -n "App yüzeyi\|App surface\|718\|719\|720" tests/app/test_fx2_*.js` ile bul), `tests/kao/test_kao2_navigation.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** `test_kao2_navigation.js`: (a) `kaoNav('units')` sonra `kaoNav('word','<lemma>')` → `kaoBack()` ünitelere, tekrar `kaoBack()` ana ekrana döner; (b) okuyucu ana ekrandan açılınca geri ana ekrana döner (Y-10); (c) her görünümün NavBar başlığı görünüme özgü (O-01); (d) kökte sol düğme `Kapat`, diğerlerinde `‹ <önceki başlık>`; (e) Escape modal sözleşmesi korunur.
  2. İskelet: `quranLearnFlow.js` IIFE → `window.SeymaQuranLearnFlow={version:1}` (DOM/ağ/zaman/depo yok). `quranLearnViews.js` IIFE → `window.SeymaQuranLearnViews={version:1, register:function(deps){…}}`. `quranLearn.js` açılışta views'a `{esc, icon, …}` bağımlılık torbası verir; torba yoksa fail-closed.
  3. Dört listeye **aynı committe** ekle; sıra `quranLearnFlow.js` → `quranLearnViews.js` → `quranLearn.js`. `.claude/skills/*` iki dosyası **yalnız Edit aracıyla**; izin verilmezse P6 (BLOCKED, diff'i kullanıcıya ver). `sw.js` önbellek listesine iki dosyayı `?v=20260927g` ile ekle.
  4. `ui.kaoStack` (tembel başlatma); `kaoView` yığının tepesinden türetilir. `kaoSetView(v)` yığını `[home, v]` yapar (geri uyum); `kaoOpen` yığını `[home]` ile kurar; `kaoClose` temizler.
  5. Handler'lar: `App.kaoNav(view,param)`, `App.kaoBack()` → app.js shim satırına **yalnız** iki 1-satır shim; gövde `quranLearn.js`'te. fx2 App yüzeyi pinlerini +2 güncelle (yorumda handler adı geçmeden).
  6. NavBar + LargeTitle bileşenleri `quranLearnViews.js`'te; tüm mevcut görünümlerin `kao-view-head` başlığı ve sağdaki "Geri" düğmesi NavBar'a taşınır. Başlıklar: Bugün → "Kur'an Arapçası", üniteler → "Yol", kelime → kelimenin okunuşu, okuyucu → sûre adı, ayarlar → "Ayarlar", telaffuz → "Telaffuz", âyet → "Günün âyeti", harita → "Mushaf haritası", namaz → "Namazda ne diyorum", istatistik → "İlerleme", kapı → "Harf kontrolü".
- **Kabul:** navigasyon testi PASS; `driver.mjs` MON-04 sıra doğrulaması PASS; handler sayısı 37; dört liste aynı committe (kanıtta `git show --stat`).
- **Commit:** `KAO2-04: akış/görünüm iskeleti, gezinme yığını ve NavBar`

---

#### KAO2-05 · Bileşen kütüphanesi

- **Oku:** 06 §2, §6.
- **Dokun:** `app/core/quranLearnViews.js`, `app/kao.css`, `tests/kao/test_kao2_components.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** bileşen testleri: `groupedList(sections)` (başlık; satır = ikon + başlık + değer + chevron; satır `<button>` ya da `<a>`, ≥44 px sınıfı), `switchRow({label, on, action})` (`role="switch"`, `aria-checked`), `progressRing(pct,size,label)` (0–100 kıskaç, erişilebilir ad), `choice({label, state})` durumları `idle|correct|wrong|dim` (doğru: ✓ + ekran okuyucu metni "Doğru cevap"; yanlış: ✕ + "Senin seçimin"), `feedbackSheet({tone, title, body, actions})` (`role="status"`, `aria-live="polite"`), `primaryButton` (tek `.kao-primary`).
  2. Saf dize kurucuları uygula; tüm metinler `esc`'ten geçer; `onclick` yalnız `App.kao*` çağırır.
  3. CSS: 06 §2 ölçüleri; `min-height` kullan, sabit yükseklik yok.
- **Kabul:** bileşen testleri PASS; design contract PASS.
- **Commit:** `KAO2-05: grouped list, switch, halka, şık durumları ve geri bildirim paneli bileşenleri`

---

#### KAO2-06 · Geri bildirim paneli ve "Devam"

- **Oku:** 05 §5 (Geri bildirim paneli) · 01 K-06, O-03 · 02 T-14…T-17 · `quranLearn.js` `kaoAnswer` (≈L907–975), `kaoUndo`, `paintTask`, `kaoTaskHTML`.
- **Dokun:** `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/kao.css`, `app.js` (shim +1: `App.kaoContinue`), fx2 pinleri, `tests/kao/test_kao2_feedback.js` (yeni), etkilenen mevcut KAO testleri (P2.4).
- **Adımlar:**
  1. **Kırmızı:** `test_kao2_feedback.js`: cevap sonrası (a) `ui.kaoTaskIndex` **değişmez**; (b) `ui.kaoPanel.open===true`, `correct` doğru; (c) render'da doğru şık `correct`, seçilen yanlış `wrong`, diğerleri `dim`; şıklar `disabled`; (d) panel metni boş değil: doğruda "Doğru", yanlışta doğru cevap + varsa kognat notu; (e) `kaoContinue()` indeksi +1 yapar, paneli kapatır, sonraki görevi çizer, otomatik ses mantığı korunur; (f) panel açıkken `kaoUndo()` durumu geri yükler ve paneli kapatır; 3 sn zamanlayıcı yok; (g) `settings.autoAdvance===true` ve cevap doğruysa 900 ms sonra devam (sahte zamanlayıcıyla); (h) `order` görevinde ara seçimler paneli açmaz, son seçim açar; (i) delayed/link/transfer türleri de paneli kullanır; (j) FSRS kartı ve `daily` sayaçları cevap anında yazılır (davranış aynı).
  2. `kaoAnswer`: indeks artırma ve `startTaskPresentation` → `kaoContinue`'ya taşınır; puanlama/FSRS/günlük yazımı yerinde kalır (davranış aynı).
  3. Panel `quranLearnViews.feedbackSheet` ile; odak "Devam"a gider; `aria-live`.
  4. "Geri al · 3 sn" düğmesi kaldırılır; paneldeki "Geri al" bağlantısı aynı `App.kaoUndo`'yu çağırır.
  5. `settings.autoAdvance` `ensureQuranLearn`'de `boolOr(false)`.
  6. İlerleme çubuğu (FocusBar) görev ekranının üstüne; "7 / 14" metni ekran okuyucu için kalır.
  7. Ses düğmesindeki "basılı tut" jesti kalır ama birincil olmaz: yanına görünür "Doğal hız" ikincil düğmesi (T-17).
- **Kabul:** feedback testi PASS; handler 38; mevcut KAO testleri yeşil (değişenler gerekçeli).
- **Commit:** `KAO2-06: cevap sonrası geri bildirim paneli ve Devam akışı`

### W2 — Müfredat omurgası ve rehberlik

---

#### KAO2-07 · Müfredat derleme aracı ve `quranCurriculumV2.js`

- **Oku:** 07 §1–§3 · 03 §2 · 08 §5 · `app/content/quranShortSurahsV1.js` alanları (`prayerTexts[].words[].lemmaId`, `words[].lemmaId`; `ls_` önekli lemmalar **ek sözlüktür**, derslere girmez) · `QuranGrammarV1.concepts[].unit/order`.
- **Dokun:** `tools/kao2-curriculum-build.mjs` (yeni), `kuran-ogreniyorum-v2/content/curriculum.spec.json` (yeni), `app/content/quranCurriculumV2.js` (araç çıktısı), dört yükleme listesi (içerik modülleri de sürücü FILES'ında), `index.html`, `sw.js`, `tests/kao/test_kao2_curriculum.js` (yeni), `tests/kao/test_kao2_perf_budget.js` (yeni modül dahil), `kuran-ogreniyorum-v2/inceleme/MUFREDAT-ESLEME.md` (araç çıktısı).
- **Adımlar:**
  1. **Kırmızı:** `test_kao2_curriculum.js`: (a) 524 `l_*` lemmanın her biri tam 1 derste; (b) 12 ünite; ünite başına kelime sayısı raporlanır (hedef 20–60; Ünite 10–12 daha geniş olabilir, gerçek dağılım kanıta), ders başına 3–7 yeni kelime; (c) Ünite 1 dersleri `prayerTexts` `fatiha` lemmalarının tamamını içerir ve Besmele + Fâtiha ilk geçiş sırasına göre dizilir; Ünite 2 = tekbir/sübhâneke/rükû/secde/tahiyyat/selâm lemmaları (Ünite 1'de olmayanlar); Ünite 3 = İhlâs/Felak/Nâs lemmaları (öncekilerde olmayanlar); (d) her dersin `conceptId`'si `QuranGrammarV1.byId`'de var ya da null; 25 kavramın her biri en az bir derse bağlı; (e) S0 12 ders kimliği `s0.01…s0.12`; (f) `lemmaToLesson` haritası tutarlı; (g) araç iki kez çalışınca bayt-eşit çıktı (zaman damgası yok); (h) gzip ≤ 48 KiB.
  2. `curriculum.spec.json` (elle, **Arapça yok**): seviye/ünite iskeleti (07 §3 tablosu: id, level, başlık, kavram kimlikleri, çapa türü `prayer:<id>` | `surah:<no>` | `lemma-pool:<kural>`), odak listeleri yalnız **lemma kimliği** ile, ders başlıkları (Türkçe, `review.level:'draft'`).
  3. Araç algoritması (belirlenimci): (i) Ünite 1–3 çapa metin sırasıyla (ilk geçiş sırası); (ii) Ünite 4–12: 03-MUFREDAT odak listeleri (spec'te kimlikle) + kalan lemmalar POS ve kök ile dağıtılır: edat/zamir/bağlaç → 4–5; isim → 6; fiiller `pos`/`pattern` ile mâzi/muzâri/emir → 7–9; `unit11.roots`'ta olan ve ≥3 üyeli kök aileleri → 10–11; şart/zaman parçacıkları → 12; eşitlikte sıklık azalan, sonra kimlik; (iii) derslere bölme: ünite içi sıra korunur, `semNeighbors` aynı derse düşmez (R-A5 uyumu), 5'erli; (iv) ünitenin son dersi `mastery:true`.
  4. Çıktı: `window.QuranCurriculumV2={version:'quran-curriculum-tr-v2', levels, units:[{id, level, title, conceptIds, anchor, lessons:[{id, title, lemmaIds, conceptId, apply:{kind, ref}, mastery}]}], s0:{lessons:[…]}, lemmaToLesson, byLesson(id)}`; metinlerde `review` alanı.
  5. İnceleme listesi `inceleme/MUFREDAT-ESLEME.md`: ünite başına ders ve kelime listesi (Arapça **içerik modülünden** kopyalanır + okunuş + anlam), en altta onay kutusu.
  6. Dört liste + `sw.js` + `index.html` (içerik modülleri bloğunda `quranPhonicsV1.js`'ten sonra).
- **Kabul:** curriculum testi PASS; perf testi yeni modülle PASS; inceleme dosyası var.
- **Kapanış özel:** LEDGER'a ek `GATE` kaydı: `G2 open · MUFREDAT-ESLEME.md kullanıcı onayı bekleniyor`. Kart `done` olur ama **KAO2-08, G2 kapanmadan başlamaz**.
- **Commit:** `KAO2-07: müfredat derleme aracı ve quranCurriculumV2 (12 ünite, ~75 ders)`

---

#### KAO2-08 · "Sıradaki adım" motoru (`quranLearnFlow.js`)

- **Önkoşul:** LEDGER'da `GATE · —` kaydı: `G2 closed` (kullanıcı eşlemeyi onayladı; istenen değişiklikler KAO2-07 aracında `FIX` kaydıyla yapıldı). Yoksa P6.
- **Oku:** 05 §4 · 08 §1, §3.
- **Dokun:** `app/core/quranLearnFlow.js`, `app/core/quranLearn.js` (sarmalayıcılar; `ensureQuranLearn` içinde `onboarding`/`path` normalizasyonu; `daily[today].sessionDone` yazımı), `tests/kao/test_kao2_next_step.js` (yeni), `tests/kao/test_kao_migration.js` (yeni alanlar için ek beklenti).
- **Adımlar:**
  1. **Kırmızı:** tablo güdümlü test; her satır sentetik `data` + `now`: (1) ilk açılış yapılmadı → `onboarding`; (2) gece penceresi → `night-review` (dakika ve kart sayısı `kaoNightWindow`'dan); (3) `onboarding.start='s0'` ve S0 dersleri bitmemiş → `s0-lesson` + doğru ders; (4) bugün ders yok → `daily` (tekrar sayısı + sıradaki ders parçası + dakika); (5) ünite dersleri bitmiş, ustalık yok → `mastery`; (6) ünite tamam → `next-unit`; (7) bugün bitti → `rest` + isteğe bağlı öneri; kenar: tekrar borcu >60 → yeni 0; 7+ gün ara → `warmup` (en zayıf 10). Her sonuç `{kind,title,subtitle,minutes,action,param}`; `title`/`subtitle` boş değil.
  2. Saf fonksiyonlar (Flow): `curriculum(content)`, `lessonOf`, `lessonProgress`, `unitProgress`, `nextStep(snapshot, now, content)`, `estimateMinutes(daily)`. Girdi: `quranLearn` anlık görüntüsü (salt okuma sözleşmesi) + `now` + içerik nesneleri. **`Date.now()` yok.**
  3. `ensureQuranLearn`: `onboarding` ve `path` varsayılanları; kart varsa `onboarding.doneAt='legacy'`; bozuk tipler normalize (08 §1).
  4. Günün dersi tamamlandı işareti: ders oynatıcı gelene kadar (KAO2-12) mevcut oturum kuyruğunun son cevabından sonra `daily[today].sessionDone=true` (render içinde yazma yok; yazım `kaoContinue`'da).
  5. Motor sarmalayıcısı `kaoNextStep(nowValue)` Flow'u gerçek veriyle çağırır.
- **Kabul:** 7 + 2 kenar satırı PASS; migration testi yeni alanlarla PASS; Flow dosyasında `document`, `location`, `fetch`, `setTimeout`, `localStorage`, `Date.now` yok (test tarar).
- **Commit:** `KAO2-08: sıradaki adım motoru ve onboarding/path normalizasyonu`

---

#### KAO2-09 · Bugün ekranı (S-02)

- **Oku:** 05 §2, §7 · 06 §2 · 01 K-03, Y-05.
- **Dokun:** `app/core/quranLearnViews.js`, `app/core/quranLearn.js` (eski `kaoHomeHTML` gövdesi views'a devredilir ya da silinir), `app/kao.css`, `tests/kao/test_kao2_design_contract.js` ((f) artık zorunlu), `tests/kao/test_kao_render.js` (bilerek değişen beklentiler), `tests/kao/test_kao2_today.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** `test_kao2_today.js`: (a) sıfır kullanıcı (onboarding tamam, kart yok): `%0` metni yok; "İlk hedef: Fâtiha'yı anlamak · N kelime" var; (b) ekranda tek `.kao-primary`, eylemi `nextStep.action`; (c) "Yolun" kartında seviye adı + gerçek ünite ilerlemesi; kapsam yüzdesi yalnız kelime ≥1 iken; (d) Keşfet satırları: Kısa sûreler, Namazda ne diyorum, Telaffuz stüdyosu, Günün âyeti (Kök aileleri ve Gramer notları ilgili kartlar gelene kadar **gizli**); Sen: İlerleme, Ayarlar; (e) `.kao-link-button` yok.
  2. HeroCard (`nextStep`), Yolun kartı, iki GroupedList; ikonlar mevcut `icon()` setinden.
  3. `nextStep.action` eşlemesi: `daily` → `App.kaoStart()` (KAO2-12'de ders oynatıcıya bağlanacak), `s0-lesson` → mevcut kapı/ders görünümü, `onboarding` → (KAO2-11'e kadar) `App.kaoStart()`, `rest` → öneri satırı.
  4. Gece penceresi ve "en çok karıştırdıkların" satırı HeroCard altbilgisine taşınır.
- **Kabul:** today testi PASS; design contract ((f) dahil) PASS.
- **Commit:** `KAO2-09: Bugün ekranı, tek birincil eylem ve Yolun kartı`

---

#### KAO2-10 · Hub kartı v2

- **Oku:** 05 §8 · 06 §5 · 01 Y-01…Y-03 · 02 T-01…T-05 · `kaoHubCardHTML` (≈L1638).
- **Dokun:** `app/core/quranLearnViews.js`, `app/core/quranLearn.js` (`kaoHubCardHTML` görünüme devreder; ad, `id="kao-hub-entry"`, `aria-haspopup="dialog"` korunur), `app/kao.css`, `tests/kao/test_kao2_hub.js` (yeni), `tests/kao/test_kao_independence.js` / `test_kao_boundary.js` (bilerek değişirse P2.4).
- **Adımlar:**
  1. **Kırmızı:** 4 durum (hiç başlamadı · ders bekliyor · bugün tamam · gece penceresi) → başlık/alt satır/eylem metinleri 05 §8 tablosuyla; halka değeri gerçek ünite ilerlemesi; sahte yol noktaları yok; sabit "Günde yaklaşık 6 dakika" yok; `kaoVisible===false` → boş dize (korunur).
  2. Niyet önerisi yalnız "bekliyor" durumunda alt satırın yerine geçer.
  3. `saygi.js` çağrısı değişmez (bağımsızlık sözleşmesi).
- **Kabul:** hub testi PASS; bağımsızlık testi PASS. Görsel QA yalnız kullanıcı ekran görüntüsü isterse (P5).
- **Commit:** `KAO2-10: hub kartı v2 (tek bilgi, tek eylem, gerçek ilerleme)`

---

#### KAO2-11 · İlk açılış (S-01) ve yerleştirme

- **Oku:** 05 §3, §9 · 04 D-07, D-18 · 01 K-01, K-02, O-02 · mevcut `kaoGate`/`kaoGateTasks` (≈L493–532).
- **Dokun:** `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/kao.css`, `app.js` (shim +1: `App.kaoOnboard`), fx2 pinleri, `tests/kao/test_kao2_onboarding.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** (a) kartı olmayan ve `onboarding.doneAt` boş kullanıcıda `kaoOpen()` → ilk açılış adım 1; (b) `legacy` kullanıcıda ilk açılış yok, bir kez "Yeni düzen" notu (`whatsNewAt` yazılır); (c) seçim `none` → `start='s0'`; `slow` → yerleştirme (8 okuma + 4 dinleme, mevcut kapı görevlerinin alt kümesi) → okuma ≥7/8 ise `level1`, değilse `s0` + eksik S0 dersleri işaretli; `fluent` → `level1`; (d) Adım 3: süre 5/10/15 → `settings.dailyNew` 5/10/15; niyet → `onboarding.intent`; ses anahtarı → `settings.audio` (`audioStyle` measured); (e) "Atla" her adımda: varsayılanlar (level1, 5 dk, ses açık) + `doneAt`; (f) son düğme etiketi seçime göre değişir; (g) ses yüklenemezse (`kaoAudioFailed`) yerleştirme yalnız okumayla karar verir (R-C2).
  2. `App.kaoOnboard(action,value)` tek dağıtıcı; gövde motor dosyasında.
  3. Son düğme (KAO2-12'ye kadar) Bugün ekranına götürür; A-1 KAO2-12'de bağlanır.
- **Kabul:** onboarding testi PASS; handler 39; mevcut kapı testleri yeşil.
- **Kapanış özel:** LEDGER'a `GATE` kaydı: `G1 · W2 ara özeti kullanıcıya sunuldu` (kapanan bulgular, kanıt düzeyleri ayrı). Yanıt beklenmez; bilgi amaçlıdır.
- **Commit:** `KAO2-11: ilk açılış, başlangıç noktası ve yerleştirme`

### W3 — Öğretim döngüsü

---

#### KAO2-12 · Ders oynatıcı (S-05)

- **Oku:** 05 §4 (günlük ders bileşimi), §5 · 04 D-01…D-06 · 01 K-04, K-05, Y-06, Y-07 · `kaoBuildTask`, `kaoAnswer`.
- **Dokun:** `app/core/quranLearnFlow.js` (`lessonPlan`), `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/kao.css`, `app.js` (shim +1: `App.kaoLesson`), fx2 pinleri, `tests/kao/test_kao2_lesson_flow.js` (yeni), `tests/kao/test_kao2_onboarding.js` (A-1 eklemesi).
- **Adımlar:**
  1. **Kırmızı:** (a) `lessonPlan` öğe sırası: `goal` → her yeni lemma için `intro` → (varsa) `concept` → `practice` (6–10) → `apply` → `summary`; (b) her lemmanın ilk `practice` görevinden önce kendi `intro`'su var (A-2); (c) ilk `practice` görevi 2 şıklı, sonrakiler 4; yön sırası ar>tr → ses→anlam (ses varsa) → tr>ar; (d) kavram görevleri yalnız `concept` kartından sonra ve ardışık (blok, D-05); (e) `apply` adımı dersin `apply.ref` metnini kelime kelime verir, dersin yeni lemmaları vurgulu, bilinenler açık; (f) cevaplar FSRS'e mevcut yolla yazılır (`introducedAt` ilk sunumda); (g) ders sonunda `path.lessons[id].doneAt/score` ve `daily[today].lesson=true`; (h) günlük ders = vadeli tekrarlar (`kaoBuildQueue`, `dailyNew:0`, en çok 20) + ders; (i) A-1: sıfır kullanıcı, modal açık → "Başlayalım" → "Evet, rahat okurum" → "Fâtiha ile başla" = 3 dokunuşta `intro` görünümü; (j) dersten çıkış (✕) ilerlemeyi korur; tekrar girişte kaldığı öğeden devam eder.
  2. `kaoBuildTask`'e `opts.choiceCount` (varsayılan: mevcut davranış); cevap uygulama mantığı `applyAnswer(task, choice)` olarak ayrıştırılır; `kaoAnswer` ve ders oynatıcı ortak kullanır (mevcut testler değişmez).
  3. Tanış kartı: büyük Arapça (içerik modülünden), okunuş, anlam, kognat, dersin çapa metnindeki yeri; otomatik ses `kaoShouldAutoplay` kapılarıyla.
  4. Kavram kartı: `plainTr` + tablo (`QuranGrammarV1.concepts[].tables`) + katlanabilir `termTr`.
  5. `nextStep.action` `daily`/`s0-lesson`/`mastery` → `App.kaoLesson('start', id)`; ilk açılışın son düğmesi de.
- **Kabul:** lesson flow testi PASS (A-1, A-2 dahil); handler 40.
- **Commit:** `KAO2-12: ders oynatıcı (Tanış → Kavram → Pekiştir → Uygula → Özet)`

---

#### KAO2-13 · Yol (S-03) ve Ünite (S-04)

- **Oku:** 05 §6 · 07 §1, §3 · 01 K-08, K-09, Y-09.
- **Dokun:** `app/core/quranLearnViews.js`, `app/core/quranLearn.js` (eski `kaoUnitsHTML` kaldırılır; `kaoUnitSlices` taş hesabında hâlâ kullanılıyorsa KAO2-16'ya kadar korunur ve not düşülür), `app/kao.css`, `tests/kao/test_kao2_path.js` (yeni), `tests/kao/test_kao_render.js` (P2.4).
- **Adımlar:**
  1. **Kırmızı:** (a) Yol: 7 seviye bölümü, her birinde üniteler (başlık, vaat, halka); S0 ve S5 kendi satırları; önerilen ünite `aria-current="step"`; (b) üniteye dokunmak `kaoNav('unit',id)`; (c) Ünite: LargeTitle, vaat, halka + "x / y kelime · a/b ders", tek birincil "Ders N'e devam et" / "Başla", StepList (✓/●/○), Kavramlar (KAO2-15'e kadar yalnız başlık, dokunulamaz), Kelimeler (sayı ›; liste: Arapça + okunuş + anlam + durum), Çapa metin satırı; (d) etkisiz "Seviye" kutuları yok.
- **Kabul:** path testi PASS; K-08, K-09, Y-09 kapanır.
- **Commit:** `KAO2-13: Yol ve Ünite ekranları`

---

#### KAO2-14 · Ders ve tekrar özeti (S-07)

- **Oku:** 05 §5 (Özet) · 04 D-17 · 01 K-07, Y-08.
- **Dokun:** `app/core/quranLearnViews.js`, `app/core/quranLearn.js`, `tests/kao/test_kao2_summary.js` (yeni), `tests/kao/test_kao_user_tasks.js` (gerekirse P2.4).
- **Adımlar:**
  1. **Kırmızı:** (a) özet: bu oturumda tanışılan kelimeler (Arapça + anlam, en çok 10 + "ve N daha"), doğruluk %, yarın vadesi gelecek kart sayısı ve tahmini dakika (`nextStep` ile aynı hesap), sıradaki adım satırı; (b) programın ilk 7 günü "kalıcı oldu (s≥21)" sayısı gösterilmez; sonrasında yalnız ≥1 ise gösterilir; (c) iki eylem: birincil "Bugün yeter" (Bugün ekranına), ikincil "5 dakika daha"; (d) taş kazanıldıysa tek sakin satır + (hareket izinliyse) konfeti.
- **Kabul:** summary testi PASS.
- **Commit:** `KAO2-14: öğrenilenleri ve yarını gösteren oturum özeti`

---

#### KAO2-15 · Gramer notları kütüphanesi (S-10)

- **Oku:** 03 §1, §5 · 04 D-11 · `QuranGrammarV1.concepts` alanları.
- **Dokun:** `app/core/quranLearnViews.js`, `app/core/quranLearn.js`, `app/kao.css`, `tests/kao/test_kao2_grammar_notes.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** (a) liste 25 kavramı ünite sırasıyla gruplar; (b) kavram sayfası: başlık, `plainTr`, tablolar (Arapça hücreler içerik modülünden, okunuşla), katlanabilir "Terimi" (`termTr`), "Bu kavramın geçtiği dersler" bağlantıları; (c) Bugün → Keşfet'te "Gramer notları" satırı görünür; Ünite ekranındaki kavram satırları dokunulabilir olur; (d) tablo `<table>` + `<th scope>`; dar ekranda sayfa yatay taşmaz (yalnız tablo sarmalayıcısı `overflow-x:auto`).
- **Kabul:** grammar notes testi PASS; 25/25 erişilebilir.
- **Commit:** `KAO2-15: 25 kavramlık gramer notları kütüphanesi`

---

#### KAO2-16 · Taş düzeltmesi ve mevcut kullanıcı geçişi

- **Oku:** 07 §6 · 05 §9 · 08 §1 · `kaoMilestoneCheck` (≈L432), `recordMilestones`, `kaoPanelSummary`.
- **Dokun:** `app/core/quranLearn.js`, `tests/kao/test_kao2_milestones.js` (yeni), `tests/kao/test_kao2_migration.js` (yeni), `tests/kao/fixtures/` (sentetik eski durumlar), `tests/kao/test_kao_panel_projection.js`.
- **Adımlar:**
  1. **Kırmızı (taş):** `fatiha` = `prayerTexts` `fatiha` lemmalarının tümü ar>tr review ∧ s≥7; `namaz` = tüm `prayerTexts` lemmaları; `besmele` = S0.12 tamam ∨ yerleştirme ≥7/8; `u1…u12` = ustalık ≥8/10; kapsam taşları aynen; eski koşulla yazılmış taş **silinmez**.
  2. **Kırmızı (geçiş):** üç sentetik eski durum (boş · kısmi: 40 kart · zengin: 400 kart + günlükler + taşlar + surahs + phonics) → `ensureQuranLearn` → (a) `cards`, `daily`, `milestones`, `surahs`, `phonics`, `errors`, `gate` derin eşit; (b) `onboarding.doneAt` kartlıda `legacy`, boşta `null`; (c) `path`'ten türetilen ilerleme ünite ekranında görünür (kartı olan lemmalar "tanışıldı"); (d) iki kez çalıştırma idempotent; (e) JSON boyut artışı ≤7 KB (`test_kao_state_budget.js` ile tutarlı).
  3. `kaoUnitSlices`'ı kullanan yer kalmadıysa kaldır; kalmadığını test et.
  4. Panel projeksiyonu yeni taş anahtarlarını (`besmele`, `u1…u12`) sayısal olarak taşır (panel görünümü KAO2-25'te).
- **Kabul:** milestones + migration testleri PASS; panel projeksiyonu PASS.
- **Commit:** `KAO2-16: Fâtiha taşı düzeltildi, ünite taşları, eski veri geçişi`

### W4 — İçerik zenginleştirme

---

#### KAO2-17 · Ünite ve ders metinleri (K-4 protokolü)

- **Oku:** 10 K-4 · 07 §4 · 05 §6 · CLAUDE.md "Language & tone".
- **Dokun:** `kuran-ogreniyorum-v2/content/texts.tr.json` (yeni; metin kaynağı), `tools/kao2-curriculum-build.mjs` (metinleri modüle birleştirme), `tools/kao2-review-sheet.mjs` (yeni), `app/content/quranCurriculumV2.js` (araç çıktısı), `app/core/quranLearnViews.js` (yalnız `draft` gizleme), `tests/kao/test_kao2_text_review.js` (yeni), `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md` (araç çıktısı).
- **Adımlar:**
  1. **Kırmızı:** `test_kao2_text_review.js` (L0): K-4 (a)–(f); `draft` metin render'da **görünmez** (başlık için güvenli geri dönüş: "Ünite N · Ders M"); `sourced`/`expert` görünür ve dinî bağlamlı olanda "Kaynak:" satırı var; yasak ifade listesi dosya başında sabit dizi.
  2. Metin taslakları (ajan): 12 ünite × {title, promise, why} + ~75 ders × {title, goal}. Kaynak yalnız repo içi: 03-MUFREDAT, `QuranRevelationOrderV1.themeTr/sourceRefs`, `QuranGrammarV1.plainTr`. Dinî bağlam içeren `why` cümlelerinde `sources` kimliği zorunlu; kaynağı olmayan iddia yazılmaz (`[KAYNAK?]` ile işaretlenir). Ton: sıcak, sen dili, emir yok, emoji ölçülü. Hepsi `review.level:'draft'`.
  3. İnceleme sayfasını üret; LEDGER `GATE` kaydı: `G3 · INCELEME-KAO2-17 kullanıcıda`. Kullanıcı onay verirse araç onayları taşır (`--apply-review`); onay yoksa metinler `draft` kalır ve kart yine kapanır (uygulama güvenli başlıklarla çalışır).
- **Kabul:** text review testi PASS; `draft` görünmezlik testi PASS; inceleme sayfası var.
- **Commit:** `KAO2-17: ünite ve ders metinleri taslağı, L0 inceleme kapısı`

---

#### KAO2-18 · Kavram çözümlü örnekleri ve hata açıklamaları

- **Oku:** 07 §4 (hata şablonları) · 04 D-03 · `KAO_ERROR_LABELS`, geri bildirim paneli (KAO2-06).
- **Dokun:** `kuran-ogreniyorum-v2/content/texts.tr.json` (`concepts.<id>.workedTr/errorTr`), araçlar, `app/content/quranCurriculumV2.js`, `app/core/quranLearnFlow.js` (`explain(task, choice)`), `app/core/quranLearnViews.js`, `tests/kao/test_kao2_explain.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** her görev türü × doğru/yanlış için `explain` boş olmayan metin döndürür; şablonlar 07 §4; `cognate.shift` olan lemmada uyarı şablonu; gramer görevinde `errorTr` `draft` ise güvenli genel metin ("Doğru cevap: …"); Arapça yalnız görev nesnesinden.
  2. 25 × (`workedTr`, `errorTr`) taslakları (`draft`); inceleme sayfası `INCELEME-KAO2-18.md`; G3 kaydı.
  3. Panel ve kavram sayfası `explain`/`workedTr`'yi kullanır.
- **Kabul:** explain testi PASS; L0 PASS.
- **Commit:** `KAO2-18: hata sınıfına göre açıklamalar ve kavram çözümlü örnekleri`

---

#### KAO2-19 · Sûre bağlamı ve okuyucu v2

- **Oku:** 07 §4 · 05 §2 (S-09) · 06 §2 (WordChip) · 02 T-20, T-21 · 01 Y-12 · `kaoReaderHTML`, `kaoRevealWord`, `kaoPlaySequence`.
- **Dokun:** `texts.tr.json` (`surahs.<no>.contextTr` + `sources`), araçlar, `quranCurriculumV2.js`, `quranLearnViews.js`, `quranLearn.js`, `kao.css`, `tests/kao/test_kao2_reader.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** (a) okuyucu başında sûre tanıtım kartı: ad, nüzul yeri, âyet sayısı, `themeTr` (mevcut `QuranRevelationOrderV1`) + `contextTr` (yalnız `sourced/expert`); (b) kelimeler WordChip: kenarlıksız, bilinmeyen altı noktalı; dokununca anlam **alt panelde**, satır akışı bozulmaz; (c) "Dinle" kelime kelime çalar (`s-<sûre>-<âyet>-<i>` klipleri) ve çalan kelimeye `aria-current` + görsel vurgu verir; ses yoksa sessiz yol; (d) seçili sûre seçicide görünür alana kaydırılır (motor tarafında, render'da değil); (e) "Anladım" öncesi 3 soruluk hızlı kontrol (sûrenin yeni kelimelerinden), sonra mevcut gecikmeli test planlanır.
  2. 20 `contextTr` taslağı: yalnız `QuranRevelationOrderV1.sourceRefs`'teki kaynak kimlikleriyle; iddia başına kaynak; `draft`; `INCELEME-KAO2-19.md`; G3.
- **Kabul:** reader testi PASS; L0 PASS; Y-12, T-20, T-21 kapanır.
- **Commit:** `KAO2-19: sûre tanıtımı ve dinlerken oku okuyucusu`

---

#### KAO2-20 · Kök aileleri (S-11)

- **Oku:** 03 §5 · `QuranGrammarV1.unit11.roots`, `QuranLexiconV1.roots`, `rootDetail`.
- **Dokun:** `quranLearnViews.js`, `quranLearn.js`, `kao.css`, `tests/kao/test_kao2_roots.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** (a) liste: 73 `unit11` kökü (Türkçe türev sayısıyla) + "Tüm kökler (301)" ikinci bölümü; (b) kök sayfası: kök harfleri (içerik modülünden, okunuşla), anlam, Türkçe türevler (kalıp etiketiyle), bu kökten öğrenilen/öğrenilecek lemmalar (durum rozeti) → kelime detayına bağlantı; (c) Keşfet'te satır görünür; kelime detayından kök sayfasına bağlantı.
- **Kabul:** roots testi PASS.
- **Commit:** `KAO2-20: kök aileleri keşif ekranı`

---

#### KAO2-21 · Seviye 0 yeniden kuruluş (K-3 kademe B)

- **Oku:** 07 §2 · 10 K-3 · 04 D-10 · `QuranPhonicsV1.letters` (bucket, mahrec, tipTr), `kaoGateLessons`.
- **Dokun:** `kuran-ogreniyorum-v2/content/curriculum.spec.json` (S0 dersleri: harf kimlikleriyle şekil aileleri), `tools/kao2-curriculum-build.mjs` (konum şekilleri + S0 kelime sesi seçimi), `tools/kao2-s0-word-audio.mjs` (yeni ya da yukarıdaki aracın alt komutu), `quranCurriculumV2.js`, `quranLearnFlow.js`, `quranLearnViews.js`, `quranLearn.js`, `kao.css`, `tests/kao/test_kao2_s0.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** (a) 12 S0 dersi 07 §2 sırasıyla; her harf tam bir "ilk tanıtım" dersinde; (b) konum tablosu 28 × 4 hücre; biçimler araçla üretilir (tek: harf; baş: harf+ZWJ; orta: ZWJ+harf+ZWJ; son: ZWJ+harf; bağlanmayan 6 harfte baş/orta biçimi yok işareti); (c) her harf için ≥1 kelime sesi: lexicon lemması, çıplak biçimi hedef harfle başlar, ≤3 hece, `assets/kao/audio/w-<klip>-measured.m4a` diskte var; yoksa harf "sessiz" işaretlenir; (d) S0 ders akışı: açıklama → dinle-gör (kelime sesi) → 6–8 alıştırma (harf tanı, hece-hareke eşle, konum eşle) → gerçek kelime okuma; ses yoksa görsel akışla tamamlanır; (e) S0.12 Besmele + Fâtiha 1: kelime kelime dinlerken oku; (f) kapı (`kaoGate`) yalnız yerleştirme olarak kalır; eski 12 mini ders listesi kaldırılır.
- **Kabul:** S0 testi PASS; sessiz harf sayısı kanıta yazılır (hedef 0; >0 ise kademe A'ya not).
- **Commit:** `KAO2-21: Seviye 0 şekil aileleri, konum tablosu ve kelime içinde ses`

---

#### KAO2-22 · Hece sesi hattı (K-3 kademe A)

- **Oku:** 10 K-3 (protokol) · `tools/kao-audio-build.mjs` · `docs/kuran-ogreniyorum/content/audio-manifest.json` şeması · `safeClipId`.
- **Dokun:** `tools/kao2-syllable-audio.mjs` (yeni), `docs/kuran-ogreniyorum/content/audio-manifest.json` (yalnız şema/dataset girdisi; kayıt yoksa `status:'awaiting-recording'`), `quranLearn.js` (`safeClipId` için `y-` biçimi; S0'da hece klibi varsa önce hece, yoksa kademe B), `tests/kao/test_kao2_syllable_audio.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** (a) araç `--self-test`: ad biçimi `y-<harf>_<hareke>-<m|f>.m4a` doğrulaması, eksik/fazla klip raporu, sha256, lisans alanı zorunlu, `recordedBy` yalnız rol; (b) `safeClipId` yeni biçimi kabul eder, başka biçimi reddeder; (c) manifest `awaiting-recording` iken çalışma zamanı hiç `y-` isteği yapmaz (kademe B); (d) klipler varsa iki ses dönüşümlü çalınır (HVPT).
  2. Araç gerçek dosya işlerken ffmpeg yoksa açık hata verir; LUFS/dBTP ölçümü ffmpeg `loudnorm` analiziyle yapılır; ölçülemeyen klip reddedilir.
  3. Kayıt yoksa: kart **done** (hat hazır); LEDGER'a `NOTE`: "Kademe A kayıt bekliyor (kullanıcı)"; CURRENT-STATE "Bekleyen kullanıcı işleri"ne eklenir.
- **Kabul:** syllable audio testi PASS; ses bütçesi 24 MB altında.
- **Commit:** `KAO2-22: hece sesi hattı, manifest şeması ve güvenli geri dönüş`

### W5 — Tamamlama ve kapanış

---

#### KAO2-23 · Ayarlar (S-13) ve "Hakkında ve kaynaklar"

- **Oku:** 06 §2 (GroupedList, Switch, Segmented) · 02 T-22, T-23 · 01 O-04 · `kaoSettingsHTML`.
- **Dokun:** `quranLearnViews.js`, `quranLearn.js`, `kao.css`, `tests/kao/test_kao2_settings.js` (yeni), mevcut ayar testleri (P2.4).
- **Adımlar:**
  1. **Kırmızı:** grup sırası: Günlük hedef (süre 5/10/15 segment, niyet satırı) · Ses (otomatik ses switch, hız segment) · Okuma (okunuş katmanı segment, harekeler switch, tekrarda soldur switch, satır aralığı, kelime boşluğu, renkli hareke switch, önizleme) · Öğrenme (doğruda otomatik geç switch; "Başlangıç noktasını değiştir" → ilk açılış 2. adım) · Gölgeleme (switch + footer gizlilik notu) · Görünürlük (hub kartı switch) · Veri (CSV dışa aktar) · "Hakkında ve kaynaklar ›" alt sayfası (ses/metin/FSRS kaynakları + lisanslar + L2 inceleme durumu özeti). Tüm açık/kapalılar `role="switch"`; mevcut `App.kao*` ayar handler'ları yeniden kullanılır (yeni handler yok).
- **Kabul:** settings testi PASS; handler sayısı değişmedi (40).
- **Commit:** `KAO2-23: iOS ayar düzeni ve kaynaklar alt sayfası`

---

#### KAO2-24 · İlerleme (S-12)

- **Oku:** 05 §2 (S-12) · 03 §1 (kapsam eğrisi) · `kaoStatsHTML`, `kaoMapHTML`, `kaoStats`.
- **Dokun:** `quranLearnViews.js`, `quranLearn.js`, `kao.css`, `tests/kao/test_kao2_progress.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** (a) üst bölüm: kelime sayısı + kapsam % + "ilk 50 kelime ≈ %45" anlatısı (kapsam eğrisi lexicon `freq`'ten hesaplanır; 50/100/200/300/524 noktaları 03 §1 ile ±0,1 tutarlı); (b) taşlar: kazanılan/sıradaki (koşul metniyle); (c) haftalık etkinlik (7 gün, `daily`), yumuşak seri: "Bu hafta 4 gün" (D-19; kırık seri cezası yok); (d) Mushaf haritası bölümü (mevcut hücreler, yeni kabuk); (e) algı doğruluğu (telaffuz) ve kalibrasyon özeti mevcut `kaoStats`'tan; (f) eski ayrı `stats`/`map` görünümleri bu ekrana yönlenir.
- **Kabul:** progress testi PASS.
- **Commit:** `KAO2-24: birleşik İlerleme ekranı`

---

#### KAO2-25 · Kelime detayı v2 (S-08) ve panel aynası

- **Oku:** 05 §2 (S-08) · 02 T-19 · 01 Y-11 · 08 §6 · `kaoWordHTML`, `kaoPanelSummary`, `panel/panel.js` ve `panel/panelCoverageManifest.js` KAO bölümleri.
- **Dokun:** `quranLearnViews.js`, `quranLearn.js`, `kao.css`, `panel/panel.js`, gerekirse `panel/panelCoverageManifest.js`, `tests/kao/test_kao2_word.js` (yeni), `tests/kao/test_kao_panel_projection.js`, ilgili `tests/panel/*` fixture'ı. (`panel.html`/`panel-v2.html` `?v=` değişikliği yok; versionPolicy → KAO2-27.)
- **Adımlar:**
  1. **Kırmızı (kelime):** tek kaydırmalı sayfa: büyük Arapça + okunuş + dinle; anlam(lar); "Türkçede" (kognat, anlam kayması uyarısı); Kök (aile bağlantısı); Kur'an'dan örnekler (yalnız okunuşu doğrulanmış olanlar; doğrulanmamış örnek **hiç gösterilmez**, hata kutusu yok); öğrenme durumu (sonraki tekrar, ders bağlantısı); en altta ikincil "Hata bildir". Katman sayfalaması kaldırılır.
  2. **Kırmızı (panel):** `kaoPanelSummary` yeni alanlar: `start`, `unit`, `lesson`, `lessonsDone`, `milestones` (yeni anahtarlar dahil); Türkçe anlatı metni yok; panel render'ı yeni alanları bir satırda gösterir, alan yoksa satır gizlenir (eski veriyle kırılmaz).
- **Kabul:** word + panel projeksiyon + ilgili panel testleri PASS.
- **Commit:** `KAO2-25: tek sayfalık kelime detayı ve panel aynası`

---

#### KAO2-26 · Erişilebilirlik ve kontrast denetimi

- **Oku:** 06 §6, §7 · 02 T-24…T-26 · CLAUDE.md "Modal keyboard contract".
- **Dokun:** KAO dosyaları (düzeltmeler), `docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs` (yeni token çiftleri), `tests/kao/test_kao2_a11y.js` (yeni).
- **Adımlar:**
  1. **Kırmızı:** tüm KAO görünümleri × {boş, tohumlu}: (a) her `button` erişilebilir ada sahip; (b) Tab/Shift+Tab odak döngüsü modal içinde, Escape kapatır, kapanışta `kao-hub-entry`'ye döner; (c) görünüm değişince odak LargeTitle'a (odak modunda soruya) gider; (d) `aria-live` yalnız panel ve özette; (e) `aria-current="step"` StepList ve Yol'da; (f) Arapça öğelerde `lang="ar" dir="rtl"`; (g) sabit px yükseklik yok (`height:` yalnız ikon/halka boyutlarında; CSS taraması); (h) kontrast: 06 §1'deki tüm token çiftleri açık/koyu temada ≥4.5:1 (küçük metin), ≥3:1 (ikon/büyük).
- **Kabul:** a11y testi PASS; kontrast PASS.
- **Commit:** `KAO2-26: erişilebilirlik ve kontrast denetimi`

---

#### KAO2-27 · Regresyon, sürüm pini, kapanış

- **Oku:** 09 §2 (A-1…A-12) · 10 · CLAUDE.md "Cache busting" ve KAO tuzakları (tek yayın pini) · `tests/app/test_iip_22.js` (≈L115–190).
- **Dokun:** `index.html`, `sw.js`, `tests/app/test_iip_22.js` (pin), `kuran-ogreniyorum-v2/deliverables/KAO2-KAPANIS.md` (yeni), `kuran-ogreniyorum-v2/README.md` (durum), `CLAUDE.md` + `AGENTS.md` (Agent Routing'e **tek** KAO2 satırı), `tests/kao/README.md`.
- **Adımlar:**
  1. P3'ün tamamı + `node tests/kao/test_kao2_perf_budget.js` rapor satırı.
  2. Sürüm pini: yeni değer `YYYYMMDD` + harf (bugünün tarihi, ör. `20261015a`). `git diff --name-only main...HEAD` ile değişen **her** varlığın `index.html` `?v=`'si, `sw.js` önbellek listesi, `SW_VERSION`, `SW_OFFLINE_VERSION` (`iip22-<pin>`), `test_iip_22.js` `release` sabiti ve SW kaydı satırı **tek committe** değişir. `test_iip_22.js` ve tüm aileler yeşil.
  3. A-1…A-10 ölçümlerini tabloya dök (fixture kanıtı); A-11/A-12'yi "kullanıcıda" olarak işaretle.
  4. Görsel QA yalnız kullanıcı isterse (P5): 390 px açık/koyu, sıfır kullanıcı ve dolu kullanıcı; redakte ekran görüntüleri `evidence/KAO2-27/`; sunucu durdurulur.
  5. Kapanış belgesi: kapanan bulgular (01/02/03 kimlikleriyle), kararların durumu (K-1…K-4; bekleyen kullanıcı işleri), ölçümler, bilerek değişen testler, kanıt düzeyleri, yayın için kullanıcıya önerilen adımlar (push/deploy **yapılmaz**).
  6. STATE: `status:"completed"`, `nextCard:null`, `releaseApproval:"not_approved"`; CURRENT-STATE `nextCard: none`; LEDGER son kaydı `- next: none`.
- **Kabul:** tüm aileler yeşil; pin tek committe tutarlı; kapanış belgesi var; sync-check PASS (`completed`).
- **Commit:** `KAO2-27: regresyon, sürüm pini ve program kapanışı`

---

## §3 · Kart → belge çapraz başvurusu

| Kart | Ana belge bölümleri |
|---|---|
| 00–02 | 10 · 04 §4 · 06 §7 · 08 §7 |
| 03 | 06 §1–4 · 02 §2 |
| 04 | 10 K-2 · 05 §2 · 08 §2, §4, §5 |
| 05–06 | 06 §2 · 05 §5 · 01 K-06 |
| 07 | 07 §1–3 · 03 §2 |
| 08 | 05 §4 · 08 §1, §3 |
| 09–11 | 05 §3, §7, §8, §9 |
| 12–16 | 05 §5, §6 · 07 §6 · 04 D-01…D-06 |
| 17–22 | 07 §2, §4, §5 · 10 K-3, K-4 |
| 23–27 | 06 §6–7 · 09 §2 |

## §4 · Handler sayacı (fx2 pinleri için tek doğruluk kaynağı)

| Kart | Eklenen | Toplam `App.kao*` |
|---|---|---|
| başlangıç | — | 35 |
| KAO2-04 | `kaoNav`, `kaoBack` | 37 |
| KAO2-06 | `kaoContinue` | 38 |
| KAO2-11 | `kaoOnboard` | 39 |
| KAO2-12 | `kaoLesson` | 40 |
| diğerleri | — (yeni handler yasak; mevcutlar yeniden kullanılır) | 40 |
